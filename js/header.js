/* Shared site header behaviour (index.html + products.html)
   1. Hides while you scroll down, slides back in from the top when you scroll up
   2. Mobile menu open / close
   3. Underlines the nav link for the section currently on screen */
(function () {
  const header = document.querySelector('.skh');
  if (!header) return;

  const root = document.documentElement;
  const toggle = header.querySelector('.skh-toggle');
  const menu = header.querySelector('.skh-menu');
  const HIDE_AFTER = 140;   // never hide near the top of the page
  const DELTA = 6;          // ignore tiny scroll jitters
  let lastY = window.scrollY;

  function menuOpen() { return menu && menu.classList.contains('is-open'); }

  function setHidden(hidden) {
    if (hidden === header.classList.contains('is-hidden')) return;
    header.classList.toggle('is-hidden', hidden);
    // Lets other sticky bars (e.g. the products category bar) move up when the header hides
    root.style.setProperty('--skh-offset', hidden ? '0px' : header.offsetHeight + 'px');
  }

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (Math.abs(y - lastY) >= DELTA) {
      if (y > lastY && y > HIDE_AFTER && !menuOpen()) setHidden(true);   // scrolling down
      else if (y < lastY) setHidden(false);                              // scrolling up
      lastY = y;
    }
    if (y <= HIDE_AFTER) setHidden(false);
  }

  // Scroll events already arrive once per frame, and this work is tiny
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Keyboard users: tabbing into the header always shows it
  header.addEventListener('focusin', () => setHidden(false));

  // Public hooks for other scripts
  window.SKHeader = {
    show: () => setHidden(false),
    hide: () => setHidden(true),
    height: () => header.offsetHeight
  };

  // ---- Mobile menu ----
  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) setHidden(false);
  }
  if (toggle) toggle.addEventListener('click', () => setMenu(!menuOpen()));
  if (menu) menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 1100) setMenu(false); });

  // ---- Active link while scrolling (only for links to sections on this page) ----
  const links = [...header.querySelectorAll('a[data-section]')];
  const sections = links
    .map(a => document.getElementById(a.dataset.section))
    .filter((el, i, arr) => el && arr.indexOf(el) === i);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  function markActive(id) {
    links.forEach(a => a.classList.toggle('is-active', a.dataset.section === id));
  }
  const visible = new Map();
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => visible.set(en.target.id, en.isIntersecting ? en.intersectionRatio : 0));
    let best = null, bestRatio = 0;
    visible.forEach((ratio, id) => { if (ratio > bestRatio) { best = id; bestRatio = ratio; } });
    markActive(best);
  }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] });
  sections.forEach(s => spy.observe(s));
})();
