document.addEventListener("DOMContentLoaded", () => {
  // 1. Turn <i data-lucide="..."> tags into icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Mobile menu open / close
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function setMenuIcon(name) {
    if (window.lucide) {
      mobileMenuBtn.innerHTML = '<i data-lucide="' + name + '"></i>';
      window.lucide.createIcons();
    }
  }

  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    setMenuIcon('x');
  }

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    setMenuIcon('menu');
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      if (mobileMenu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // 3. Fade sections in when they scroll into view
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // 4. Product filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Highlight the clicked button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show matching cards, hide the rest
      productCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(14px)';
          setTimeout(() => {
            if (!categories.includes(btn.getAttribute('data-filter')) && btn.getAttribute('data-filter') !== 'all') {
              card.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });

  // 5. Smooth scroll for #links, and close the mobile menu after clicking
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (mobileMenu && mobileMenu.classList.contains('is-open')) {
            closeMenu();
          }
        }
      }
    });
  });
});
