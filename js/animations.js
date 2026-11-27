/* Page animations for index.html and products.html
   Libraries (loaded from cdnjs before this file): GSAP 3.13, ScrollTrigger, SplitText.
   If GSAP fails to load, nothing here runs and the pages fall back to the simple
   CSS fade-ins in main.js / products.html. Visitors who ask their device for
   reduced motion get no animation at all. */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  const hasSplit = !!window.SplitText;
  gsap.registerPlugin(ScrollTrigger);
  if (hasSplit) gsap.registerPlugin(window.SplitText);

  const $ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const ease = 'power3.out';

  // GSAP takes over from the CSS ".reveal" fade-ins
  $('.reveal').forEach(el => el.classList.remove('reveal', 'is-visible'));

  // Add ?motion=full to the address to preview the full animations on a device
  // that has "reduce motion" / "animation effects off" switched on
  const forceFull = /[?&]motion=full\b/.test(location.search);
  const reduced = !forceFull && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    // Gentle version: content simply fades in, nothing moves
    const fadeSel = '.section-header, .about-text, .about-side, .contact-info, .form-card, .feature-strip, ' +
      '.product-card, .step-card, .pack-card, .why-card, .compliance-item, .faq-item, .cat-section, #stats > div';
    $(fadeSel).forEach(el => gsap.from(el, {
      opacity: 0, duration: 0.6, ease: 'none', clearProps: 'opacity',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true }
    }));
    window.addEventListener('load', () => ScrollTrigger.refresh());
    return;
  }

  // Line breaks depend on the web font, so wait for it before splitting headings.
  // Also wait for the page loader (js/loader.js) to cover the screen, so the intro
  // animations start exactly as the page is revealed instead of playing behind it.
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const loaderReady = (window.SKLoader && window.SKLoader.ready) || Promise.resolve();
  Promise.all([fontsReady, loaderReady]).then(() => {

    // Elements with CSS hover transitions would fight GSAP, so switch those
    // transitions off while animating and hand control back to CSS afterwards
    const handBack = { clearProps: 'transform,opacity,transition,visibility' };
    const from = (targets, vars) => {
      const list = gsap.utils.toArray(targets);
      if (!list.length) return null;
      gsap.set(list, { transition: 'none' });
      return gsap.from(list, { ...vars, onComplete() { gsap.set(list, handBack); } });
    };

    // Rise a heading in line by line. The heading is split into masked lines for the
    // animation only, then put back to plain text so later resizes reflow normally.
    function riseLines(tl, el, vars, position) {
      if (!el) return;
      if (!hasSplit) { tl.from(el, { y: 30, opacity: 0, duration: 0.8, clearProps: 'all' }, position); return; }
      const split = window.SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'gs-line' });
      tl.from(split.lines, { yPercent: 110, duration: 0.85, stagger: 0.1, ...vars, onComplete: () => split.revert() }, position);
    }

    /* ---------- 1. Header slides down on load ---------- */
    const header = document.querySelector('.skh');
    if (header && window.scrollY < 40) {
      const intro = gsap.timeline({ defaults: { ease } });
      intro.from(header, { yPercent: -100, duration: 0.8, clearProps: 'transform' })
           .from('.skh-logo', { scale: 0.6, rotate: -12, opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.4')
           .from('.skh-link', { y: -14, opacity: 0, duration: 0.45, stagger: 0.05, clearProps: 'all' }, '-=0.35')
           .from('.skh-actions', { x: 20, opacity: 0, duration: 0.5, clearProps: 'all' }, '-=0.3');
    }

    /* Scroll progress line along the bottom of the header */
    if (header) {
      const bar = document.createElement('div');
      bar.setAttribute('aria-hidden', 'true');
      Object.assign(bar.style, {
        position: 'absolute', left: 0, bottom: '-1px', height: '2px', width: '100%',
        background: 'linear-gradient(90deg,#184c31,#C59B27)', transformOrigin: '0 50%', transform: 'scaleX(0)', pointerEvents: 'none'
      });
      header.appendChild(bar);
      gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    }

    /* ---------- 2. Top bar (home) ---------- */
    from('.top-bar-inner > *', { y: -10, opacity: 0, duration: 0.6, stagger: 0.1, ease, delay: 0.2 });

    /* ---------- 3. Home hero ---------- */
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      const tl = gsap.timeline({ defaults: { ease }, delay: 0.3 });
      tl.from('.hero-tag', { y: 20, opacity: 0, duration: 0.6, clearProps: 'all' });
      riseLines(tl, heroTitle, { duration: 0.9, stagger: 0.12 }, '-=0.3');
      tl.from('.hero-desc', { y: 24, opacity: 0, duration: 0.7, clearProps: 'all' }, '-=0.5')
        .from('.hero-buttons > *', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, clearProps: 'all' }, '-=0.45')
        .from('.hero-image-box', { clipPath: 'inset(12% 12% 12% 12% round 24px)', opacity: 0, duration: 1.1, ease: 'expo.out', clearProps: 'clipPath,opacity' }, 0.2)
        .from('.hero-image', { scale: 1.25, duration: 1.6, ease: 'expo.out', clearProps: 'transform' }, 0.2)
        .from('.hero-info-card', { y: 30, opacity: 0, duration: 0.7, clearProps: 'all' }, 0.9)
        .from('.floating-badge', { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(2)', clearProps: 'all' }, 1.1);

      // Hero photo drifts slightly as you scroll past
      gsap.to('.hero-image-box', {
        yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
    from('.feature-item', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.08, ease,
      scrollTrigger: { trigger: '.feature-strip', start: 'top 92%' }
    });

    /* ---------- 4. Products page hero ---------- */
    const pageHero = document.querySelector('.soft-hero-gradient');
    if (pageHero && !heroTitle) {
      const h1 = pageHero.querySelector('h1');
      const tl = gsap.timeline({ defaults: { ease }, delay: 0.3 });
      tl.from(pageHero.querySelector('nav'), { y: 12, opacity: 0, duration: 0.5, clearProps: 'all' })
        .from(h1.previousElementSibling, { y: 12, opacity: 0, duration: 0.5, clearProps: 'all' }, '-=0.3');
      riseLines(tl, h1, { duration: 0.9, stagger: 0.12 }, '-=0.3');
      tl.from(h1.nextElementSibling, { y: 20, opacity: 0, duration: 0.7, clearProps: 'all' }, '-=0.55')
        .from('#stats > div', { y: 24, opacity: 0, scale: 0.96, duration: 0.6, stagger: 0.08, clearProps: 'all' }, '-=0.4');

      // Count the numbers up ("44+", "8")
      $('#stats > div > div:first-child').forEach(el => {
        const m = el.textContent.match(/^(\d+)(.*)$/);
        if (!m) return;
        const counter = { v: 0 };
        tl.to(counter, {
          v: +m[1], duration: 1.4, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(counter.v) + m[2]; }
        }, '<');
      });

      from('.cat-pill', { y: 16, opacity: 0, duration: 0.45, stagger: 0.04, ease, delay: 0.9 });
    }

    /* ---------- 5. Section headings (both pages) ---------- */
    const headings = $('.section-header, .about-text, .contact-info, .cat-section > div:first-child');
    headings.forEach(block => {
      const title = block.querySelector('h2');
      const tl = gsap.timeline({ defaults: { ease }, scrollTrigger: { trigger: block, start: 'top 85%' } });
      const small = block.querySelector('.section-label, .w-12');
      if (small) tl.from(small, { y: 14, opacity: 0, scale: 0.8, duration: 0.5, clearProps: 'all' });
      if (title) riseLines(tl, title, {}, small ? '-=0.3' : 0);
      const rest = $(':scope > p, :scope p.section-desc, :scope > span, .about-para, .contact-details, .contact-desc', block)
        .filter(el => el !== small && !el.contains(title));
      if (rest.length) tl.from(rest, { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, clearProps: 'all' }, '-=0.5');
    });

    /* ---------- 6. Cards rise in, in small groups, as they reach the screen ---------- */
    const cardSets = [
      '.product-grid > .product-card',
      '.steps-grid > .step-card',
      '.pack-card', '.why-card', '.compliance-item', '.faq-item', '.about-card',
      '.cat-section article'                       // products page
    ];
    cardSets.forEach(sel => {
      const cards = $(sel);
      if (!cards.length) return;
      gsap.set(cards, { opacity: 0, y: 50 });
      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: batch => {
          gsap.set(batch, { transition: 'none' });
          gsap.to(batch, {
            opacity: 1, y: 0, duration: 0.75, ease, stagger: 0.1,
            onComplete() { gsap.set(batch, handBack); }
          });
        }
      });
    });

    // Process step numbers pop in
    $('.step-number').forEach(n => gsap.from(n, {
      scale: 0, rotate: -90, duration: 0.6, ease: 'back.out(2.2)', clearProps: 'all',
      scrollTrigger: { trigger: n, start: 'top 90%' }
    }));

    // Product photos zoom out as they appear
    $('.product-image img, .cat-section article img').forEach(img => from(img, {
      scale: 1.18, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: img, start: 'top 92%' }
    }));

    /* ---------- 7. About photo, form and closing sections ---------- */
    const aboutPhoto = document.querySelector('.about-photo');
    if (aboutPhoto) {
      from(aboutPhoto, {
        clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut',
        scrollTrigger: { trigger: aboutPhoto, start: 'top 85%' }
      });
      const img = aboutPhoto.querySelector('img');
      if (img) gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: aboutPhoto, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    from('.form-card', {
      y: 60, opacity: 0, duration: 0.9, ease,
      scrollTrigger: { trigger: '.form-card', start: 'top 88%' }
    });
    from('.form-card .form-label, .form-card .form-input, .form-card button', {
      y: 14, opacity: 0, duration: 0.45, stagger: 0.04, ease,
      scrollTrigger: { trigger: '.form-card', start: 'top 80%' }
    });

    // Products page call-to-action
    const cta = document.querySelector('.cta-mesh-gradient');
    if (cta) {
      from(cta.querySelectorAll('h2, p, a'), {
        y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease,
        scrollTrigger: { trigger: cta, start: 'top 80%' }
      });
    }

    // Footer columns
    const footer = document.querySelector('footer');
    if (footer) {
      from(footer.querySelector('.footer-grid, .grid').children, {
        y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease,
        scrollTrigger: { trigger: footer, start: 'top 92%' }
      });
    }

    // Images, fonts and the products list can shift layout after load
    window.addEventListener('load', () => ScrollTrigger.refresh());
  });
});
