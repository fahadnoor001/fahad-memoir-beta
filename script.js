// ===== FAHAD.AI — LUXURY INTERACTIONS =====

(function() {
'use strict';

// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 1200);
    setTimeout(() => loader.remove(), 2000);
  }
});

// ===== CUSTOM CURSOR =====
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX - 4 + 'px';
    cursorDot.style.top = mouseY - 4 + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX - 20 + 'px';
    cursorRing.style.top = ringY - 20 + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effects
  document.querySelectorAll('a, button, .media-item, .nav-link, .contact-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });
}

// ===== NAVIGATION =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

let lastScroll = 0;
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  nav.classList.toggle('scrolled', scrollY > 60);
  // FEATURE B: Hide nav on hero, reveal after scroll
  if (nav.classList.contains('on-hero')) {
    if (scrollY > 100) {
      nav.classList.remove('on-hero');
    }
  }
  lastScroll = scrollY;
}, { passive: true });

// FEATURE D: Page transitions with single-word overlay
(function() {
  // Word mapping for each page
  const pageWords = {
    'index.html': 'Biography',
    'powerlifting.html': 'Strength',
    'growth.html': 'Becoming',
    'contact.html': 'Connect'
  };

  // Create transition overlay
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  overlay.innerHTML = '<span class="page-transition-word"></span>';
  document.body.appendChild(overlay);
  const wordEl = overlay.querySelector('.page-transition-word');

  // Intercept nav links to internal pages
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    const href = link.getAttribute('href');
    // Skip external and email links
    if (href.startsWith('http') || href.startsWith('mailto:') || link.target === '_blank') return;

    link.addEventListener('click', (e) => {
      // Only handle same-origin navigation
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();

      const page = href.split('/').pop() || 'index.html';
      const word = pageWords[page] || 'Fahad';
      wordEl.textContent = word;
      overlay.classList.add('active');

      setTimeout(() => {
        window.location.href = href;
      }, 700);
    });
  });

  // Fade out on page load
  window.addEventListener('pageshow', (e) => {
    if (e.persisted || performance.getEntriesByType('navigation')[0]?.type === 'back_forward') {
      overlay.classList.remove('active');
    }
  });
})();

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });
}

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Active nav tracking
const sections = document.querySelectorAll('.section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

function updateActiveNav() {
  const scrollPos = window.scrollY + 200;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === id);
      });
    }
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// ===== SCROLL REVEAL =====
function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Auto-assign reveal classes
  const revealMap = {
    '.bio-grid': 'reveal',
    '.stat-card': 'reveal',
    '.timeline-item': 'reveal',
    '.pl-philosophy-card': 'reveal',
    '.growth-card': 'reveal',
    '.media-item': 'reveal-scale',
    '.video-embed': 'reveal',
    '.section-intro': 'reveal',
    '.bio-quote': 'reveal-left',
    '.section-header': 'reveal',
    '.media-gallery': 'reveal',
    '.parallax-content': 'reveal',
  };

  Object.entries(revealMap).forEach(([selector, cls]) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add(cls);
      el.style.transitionDelay = `${Math.min(i * 0.1, 0.5)}s`;
    });
  });

  setupReveal();
  animateCounters();
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
  const counters = document.querySelectorAll('.stat-value[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const duration = 2500;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Custom easing — slow start, fast middle, slow end
          const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          el.textContent = Math.round(target * eased).toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ===== SMOOTH PARALLAX ON SCROLL =====
function setupParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (!parallaxElements.length) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxElements.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.3;
          const rect = el.getBoundingClientRect();
          const offset = (rect.top + scrollY - window.innerHeight / 2) * speed;
          el.style.transform = `translateY(${-offset}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', setupParallax);

// ===== LIGHTBOX =====
function initLightbox() {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <img src="" alt="" style="display:none">
    <video src="" controls style="display:none"></video>
    <div class="lightbox-caption"></div>
  `;
  document.body.appendChild(overlay);

  const lbImg = overlay.querySelector('img');
  const lbVideo = overlay.querySelector('video');
  const lbCaption = overlay.querySelector('.lightbox-caption');
  const lbClose = overlay.querySelector('.lightbox-close');

  function open(src, caption, type) {
    if (type === 'video') {
      lbImg.style.display = 'none';
      lbVideo.style.display = 'block';
      lbVideo.src = src;
    } else {
      lbVideo.style.display = 'none';
      lbImg.style.display = 'block';
      lbImg.src = src;
    }
    lbCaption.textContent = caption || '';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    lbVideo.pause();
    lbVideo.src = '';
  }

  lbClose.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  document.querySelectorAll('.media-item[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.lightbox;
      const caption = item.querySelector('.media-caption')?.textContent || '';
      const type = item.dataset.type || 'image';
      open(src, caption, type);
    });
  });
}

document.addEventListener('DOMContentLoaded', initLightbox);

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

})();
