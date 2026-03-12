(function () {
  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => Array.from(p.querySelectorAll(s));
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initNav() {
    const nav = qs('#nav');
    const burger = qs('#burger');
    const navLinks = qs('#navLinks');
    if (!nav || !burger || !navLinks) return;

    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      const [s1, s2, s3] = burger.querySelectorAll('span');
      if (s1 && s2 && s3) {
        s1.style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
        s2.style.opacity = open ? '0' : '';
        s3.style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
      }
    });

    qsa('a', navLinks).forEach((a) => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.querySelectorAll('span').forEach((s) => { s.style.transform = ''; s.style.opacity = ''; });
    }));

    const links = qsa('.nav-links a');
    qsa('section[id]').forEach((section) => {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${section.id}`));
        }
      }, { threshold: 0.35 }).observe(section);
    });
  }

  function initReveal() {
    const els = qsa('.rv');
    if (prefersReducedMotion()) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => obs.observe(el));
  }

  function initFloatingCTA() {
    // handled by initScrollDrivenUI()
  }

  function initParallax() {
    // handled by initScrollDrivenUI()
  }

  function initScrollDrivenUI() {
    const nav = qs('#nav');
    const floatCta = qs('#floatCta');
    const layer = qs('.hero-img-layer');
    const bg = qs('#parBg');
    const section = qs('#parDiv');
    const reduced = prefersReducedMotion();

    let ticking = false;
    let latestY = window.scrollY;

    const update = () => {
      ticking = false;

      if (nav) nav.classList.toggle('scrolled', latestY > 60);
      if (floatCta) floatCta.classList.toggle('visible', latestY > 400);

      if (reduced) return;

      if (layer && latestY < window.innerHeight) {
        layer.style.transform = `translateY(${latestY * 0.3}px)`;
      }

      if (bg && section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          bg.style.transform = `translateY(${(progress - 0.5) * 60}px)`;
        }
      }
    };

    const onScroll = () => {
      latestY = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  function initCounters() {
    const counters = qsa('.stat-num');
    const bar = qs('.stats-bar');
    if (!bar || !counters.length) return;
    let started = false;

    function animateCounter(el) {
      const text = el.innerText.trim();
      const num = parseFloat(text.replace(/[^0-9.]/g, ''));
      const prefix = (text.match(/^[^0-9]*/) || [''])[0];
      const suffix = (text.match(/[^0-9.]*$/) || [''])[0];
      if (isNaN(num)) return;
      const duration = 1800;
      let start = null;

      function step(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(ease * num);
        el.innerText = prefix + current + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.innerText = prefix + num + suffix;
      }
      requestAnimationFrame(step);
    }

    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          counters.forEach(animateCounter);
        }
      });
    }, { threshold: 0.3 }).observe(bar);
  }

  function initFAQ() {
    const items = qsa('.faq-item');
    items.forEach((item, index) => {
      const btn = qs('.faq-q', item);
      const panel = qs('.faq-a', item);
      if (!btn || !panel) return;
      const panelId = `faq-panel-${index + 1}`;
      const btnId = `faq-trigger-${index + 1}`;
      btn.id = btnId;
      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('aria-expanded', 'false');
      panel.id = panelId;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', btnId);

      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        items.forEach((it) => {
          it.classList.remove('open');
          const b = qs('.faq-q', it);
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initForms() {
    const cform = qs('#cform');
    const nlForm = qs('.nl-form');

    if (cform) {
      cform.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fn = qs('#fn');
        const ln = qs('#ln');
        const em = qs('#em');
        const ph = qs('#ph');
        const obj = qs('#obj');
        const msg = qs('#msg');
        const btn = qs('#fbtn');
        const ok = qs('#formOk');
        [fn, em].forEach((f) => f?.classList.remove('err'));
        let valid = true;
        if (!fn?.value.trim()) { fn.classList.add('err'); valid = false; }
        if (!em?.value.includes('@') || !em?.value.includes('.')) { em.classList.add('err'); valid = false; }
        if (!valid) { (fn?.classList.contains('err') ? fn : em)?.focus(); return; }

        btn.textContent = '⏳ Envoi…';
        btn.disabled = true;

        try {
          const response = await fetch('https://formspree.io/f/xlgpjorl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              prenom: fn.value,
              nom: ln?.value || '',
              email: em.value,
              telephone: ph?.value || '',
              objectif: obj?.value || '',
              message: msg?.value || ''
            })
          });

          if (response.ok) {
            ok.style.display = 'block';
            btn.textContent = '✓ Message envoyé !';
            btn.style.background = 'var(--navy)';
            btn.disabled = false;
            qsa('.fi,.fse,.fta', cform).forEach((f) => { f.value = ''; f.classList.remove('err'); });
            ok.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            btn.textContent = 'Erreur — réessayez';
            btn.disabled = false;
          }
        } catch (_) {
          btn.textContent = 'Erreur — réessayez';
          btn.disabled = false;
        }
      });
    }

    if (nlForm) {
      nlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = qs('#nlb');
        const inp = qs('#nli');
        btn.textContent = '⏳';
        setTimeout(() => {
          inp.value = '';
          btn.textContent = '✓ Inscrit !';
          btn.style.background = 'var(--navy)';
        }, 900);
      });
    }
  }

  function initCookies() {
    const banner = qs('#cookie-banner');
    const accept = qs('#cookie-accept');
    const decline = qs('#cookie-decline');
    if (!banner) return;

    const close = (choice) => {
      localStorage.setItem('cookies', choice);
      banner.style.display = 'none';
    };

    accept?.addEventListener('click', () => close('accepted'));
    decline?.addEventListener('click', () => close('declined'));

    if (!localStorage.getItem('cookies')) {
      setTimeout(() => { banner.style.display = 'flex'; }, 900);
    }
  }

  function initModals() {
    const opens = qsa('[data-open-modal]');
    const closes = qsa('[data-close-modal]');
    const siteRoot = qs('#electroforme-site');
    let activeModal = null;
    let lastFocused = null;

    const setBackgroundState = (modal, disabled) => {
      if (!siteRoot || !modal) return;
      Array.from(siteRoot.children).forEach((child) => {
        if (child === modal) return;
        if (disabled) {
          child.setAttribute('aria-hidden', 'true');
          child.inert = true;
        } else {
          child.removeAttribute('aria-hidden');
          child.inert = false;
        }
      });
    };

    const getFocusableElements = (modal) => {
      if (!modal) return [];
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',');
      return qsa(selector, modal).filter((el) => !el.hasAttribute('hidden'));
    };

    const openModal = (id) => {
      const modal = qs(`#${id}`);
      if (!modal) return;
      if (activeModal && activeModal !== modal) {
        closeModal(activeModal);
      }
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      activeModal = modal;
      setBackgroundState(modal, true);
      (qs('[data-close-modal]', modal) || modal).focus();
    };

    const closeModal = (modal) => {
      if (!modal) return;
      modal.hidden = true;
      document.body.style.overflow = '';
      setBackgroundState(modal, false);
      activeModal = null;
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
      lastFocused = null;
    };

    opens.forEach((el) => el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(el.getAttribute('data-open-modal'));
    }));

    closes.forEach((el) => el.addEventListener('click', () => closeModal(el.closest('.modal'))));

    qsa('.modal').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!activeModal) return;
      if (e.key === 'Escape') {
        closeModal(activeModal);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = getFocusableElements(activeModal);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initReveal();
    initScrollDrivenUI();
    initFloatingCTA();
    initParallax();
    initCounters();
    initFAQ();
    initForms();
    initCookies();
    initModals();
  });
})();
