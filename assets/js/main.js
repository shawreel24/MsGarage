/* ============================================
   MS GARAGE — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ---- Cached Elements ---- */
  const header      = document.getElementById('site-header');
  const hamburger   = document.getElementById('hamburger-btn');
  const navLinks    = document.getElementById('nav-links');
  const backToTop   = document.getElementById('back-to-top-btn');
  const heroImg     = document.querySelector('.hero-img');
  const track       = document.getElementById('reviews-track');
  const dots        = document.querySelectorAll('.dot');
  const prevBtn     = document.getElementById('review-prev-btn');
  const nextBtn     = document.getElementById('review-next-btn');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('section[id]');

  /* ============================================
     1. STICKY HEADER — scroll class + shrink
     ============================================ */
  function onScroll() {
    const scrollY = window.scrollY;

    // Scrolled style
    if (header && scrollY > 60) {
      header.classList.add('scrolled');
    } else if (header) {
      header.classList.remove('scrolled');
    }

    // Back-to-top visibility
    if (backToTop && scrollY > 400) {
      backToTop.classList.add('visible');
    } else if (backToTop) {
      backToTop.classList.remove('visible');
    }

    // Active nav link
    updateActiveNav();

    // Scroll-reveal elements
    revealElements();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load

  /* ============================================
     2. MOBILE HAMBURGER MENU
     ============================================ */
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Close menu when a link is clicked
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (header && navLinks && !header.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ============================================
     3. ACTIVE NAV LINK — intersection tracking
     ============================================ */
  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    allNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  /* ============================================
     4. HERO IMAGE — subtle scale-in on load
     ============================================ */
  if (heroImg) {
    if (heroImg.complete) {
      heroImg.classList.add('loaded');
    } else {
      heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
    }
  }

  /* ============================================
     5. REVIEWS SLIDER
     ============================================ */
  let currentSlide = 0;
  let autoPlayInterval;
  const cards = document.querySelectorAll('.review-card');
  const totalSlides = cards.length;

  // How many cards visible depends on viewport
  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  function getCardWidth() {
    if (!track || !cards.length) return 0;
    const card = cards[0];
    const style = getComputedStyle(track);
    const gap = parseInt(style.gap) || 24;
    return card.offsetWidth + gap;
  }

  function goToSlide(index) {
    const visible = getVisibleCount();
    const maxSlide = Math.max(0, totalSlides - visible);
    currentSlide = Math.max(0, Math.min(index, maxSlide));

    const offset = currentSlide * getCardWidth();
    if (track) {
      track.style.transform = `translateX(-${offset}px)`;
    }

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    // Highlight active card
    cards.forEach((card, i) => {
      card.classList.toggle('active-card', i === currentSlide);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const visible = getVisibleCount();
      const maxSlide = Math.max(0, totalSlides - visible);
      if (currentSlide >= maxSlide) {
        goToSlide(0);
      } else {
        goToSlide(currentSlide + 1);
      }
      resetAutoPlay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
      resetAutoPlay();
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX   = 0;

  if (track) {
    track.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        const visible  = getVisibleCount();
        const maxSlide = Math.max(0, totalSlides - visible);
        if (diff > 0) {
          goToSlide(currentSlide < maxSlide ? currentSlide + 1 : 0);
        } else {
          goToSlide(currentSlide > 0 ? currentSlide - 1 : maxSlide);
        }
      }
      resetAutoPlay();
    }, { passive: true });
  }

  // Auto-play
  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      const visible  = getVisibleCount();
      const maxSlide = Math.max(0, totalSlides - visible);
      goToSlide(currentSlide >= maxSlide ? 0 : currentSlide + 1);
    }, 4500);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  if (track && cards.length) {
    goToSlide(0);
    startAutoPlay();
  }

  // Recalc on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goToSlide(0), 200);
  });

  /* ============================================
     6. SCROLL-REVEAL ANIMATIONS
     ============================================ */
  function addRevealClasses() {
    // About section
    const aboutImg     = document.getElementById('about-image');
    const aboutContent = document.getElementById('about-content');
    if (aboutImg)     aboutImg.classList.add('reveal-left');
    if (aboutContent) aboutContent.classList.add('reveal-right');

    // Stats bar items
    document.querySelectorAll('.stat-item').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 100}ms`;
    });

    // Service cards
    document.querySelectorAll('.service-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 80}ms`;
    });

    // Product cards
    document.querySelectorAll('.product-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 80}ms`;
    });

    // Why cards
    document.querySelectorAll('.why-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 70}ms`;
    });

    // Gallery items
    document.querySelectorAll('.gallery-item').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 80}ms`;
    });

    // Review cards
    document.querySelectorAll('.review-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 80}ms`;
    });

    // Pillars
    document.querySelectorAll('.pillar').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 100}ms`;
    });

    // Section headers
    document.querySelectorAll('.section-header').forEach(el => {
      el.classList.add('reveal');
    });

    // Contact items
    document.querySelectorAll('.contact-item').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 100}ms`;
    });

    // Map
    const mapWrap = document.getElementById('map-wrap');
    if (mapWrap) mapWrap.classList.add('reveal-right');

    // CTA strip
    const ctaText = document.querySelector('.cta-strip-text');
    const ctaBtns = document.querySelector('.cta-strip-btns');
    if (ctaText) ctaText.classList.add('reveal-left');
    if (ctaBtns) ctaBtns.classList.add('reveal-right');
  }

  function revealElements() {
    const allReveal = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    allReveal.forEach(el => {
      const rect     = el.getBoundingClientRect();
      const viewH    = window.innerHeight || document.documentElement.clientHeight;
      const inView   = rect.top <= viewH * 0.88 && rect.bottom >= 0;
      if (inView) el.classList.add('visible');
    });
  }

  addRevealClasses();
  revealElements();

  /* ============================================
     7. BACK TO TOP — smooth scroll
     ============================================ */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================
     8. STAT COUNTER — animated numbers
     ============================================ */
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  function animateCounters() {
    if (countersStarted) return;
    const statsBar = document.getElementById('stats-bar');
    if (!statsBar) return;

    const rect = statsBar.getBoundingClientRect();
    if (rect.top > window.innerHeight) return;
    countersStarted = true;

    statNumbers.forEach(el => {
      const text  = el.textContent;
      const num   = parseFloat(text);
      const star  = el.querySelector('.stat-star');
      const starHTML = star ? '<span class="stat-star">★</span>' : '';
      const suffix = text.includes('+') ? '+' : text.includes('%') ? '%' : '';

      if (isNaN(num)) return;

      let start     = 0;
      const end     = num;
      const dur     = 1800;
      const step    = 16;
      const steps   = Math.ceil(dur / step);
      const inc     = end / steps;
      let current   = 0;

      const timer = setInterval(() => {
        current += inc;
        if (current >= end) {
          current = end;
          clearInterval(timer);
        }
        const display = Number.isInteger(end)
          ? Math.round(current)
          : current.toFixed(1);
        el.innerHTML = display + suffix + starHTML;
      }, step);
    });
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();

  /* ============================================
     9. SMOOTH ANCHOR SCROLL (fallback for Safari)
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 72;
      const top     = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================
     10. GALLERY LIGHTBOX (simple overlay)
     ============================================ */
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (galleryItems.length) {
    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
    <div class="lb-backdrop"></div>
    <button class="lb-close" aria-label="Close lightbox">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="lb-content">
      <img class="lb-img" src="" alt="" />
      <p class="lb-caption"></p>
    </div>
  `;

    // Inject lightbox styles
    const lbStyle = document.createElement('style');
    lbStyle.textContent = `
    #lightbox {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s;
    }
    #lightbox.active { opacity: 1; pointer-events: all; }
    .lb-backdrop {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.92);
      backdrop-filter: blur(12px);
    }
    .lb-content {
      position: relative; z-index: 1;
      max-width: 90vw; max-height: 85vh;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .lb-img {
      max-width: 90vw; max-height: 78vh;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      animation: lbIn 0.35s cubic-bezier(0.4,0,0.2,1) both;
    }
    @keyframes lbIn {
      from { transform: scale(0.9); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }
    .lb-caption {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.9rem; font-weight: 600;
      color: rgba(255,255,255,0.75);
      letter-spacing: 0.5px;
    }
    .lb-close {
      position: absolute; top: 20px; right: 20px; z-index: 2;
      width: 44px; height: 44px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.2s;
    }
    .lb-close:hover { background: rgba(255,255,255,0.2); }
  `;
    document.head.appendChild(lbStyle);
    document.body.appendChild(lightbox);

    const lbImg     = lightbox.querySelector('.lb-img');
    const lbCaption = lightbox.querySelector('.lb-caption');
    const lbClose   = lightbox.querySelector('.lb-close');
    const lbBg      = lightbox.querySelector('.lb-backdrop');

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img     = item.querySelector('img');
        const caption = item.querySelector('.gallery-overlay span');
        lbImg.src           = img.src;
        lbImg.alt           = img.alt;
        lbCaption.textContent = caption ? caption.textContent : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    lbClose.addEventListener('click', closeLightbox);
    lbBg.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ============================================
     11. HERO PARALLAX (subtle, desktop only — DISABLED on mobile to prevent scroll jitter)
     ============================================ */
  const isMobile = () => window.innerWidth < 769;

  if (!isMobile() && heroImg) {
    const parallaxHandler = () => {
      if (isMobile()) return; // Guard: skip if resized to mobile
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroImg.style.transform = `scale(1) translateY(${scrollY * 0.15}px)`;
      }
    };
    window.addEventListener('scroll', parallaxHandler, { passive: true });
  }

  console.log('%c🚗 MS Garage — Aizawl\'s #1 Car Care Destination', 'color:#1E90FF;font-size:14px;font-weight:bold;');

})();
