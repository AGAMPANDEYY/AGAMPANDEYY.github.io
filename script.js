// Dark mode toggle (initial theme is already set pre-paint by the inline <head> script)
const themeToggle = document.querySelector('.theme-toggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#161616' : '#1e3a8a');
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

// Sync button state with whatever the head script decided
applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle) {
  const setExpanded = (isExpanded) => {
    toggle.setAttribute('aria-expanded', String(isExpanded));
  };

  const handleResize = () => {
    const isDesktop = window.matchMedia('(min-width: 900px)').matches;
    if (isDesktop) {
      links?.classList.remove('open');
      setExpanded(false);
      return;
    }
    setExpanded(links?.classList.contains('open'));
  };

  toggle.addEventListener('click', () => {
    links?.classList.toggle('open');
    setExpanded(links?.classList.contains('open'));
  });

  window.addEventListener('resize', handleResize);
  window.addEventListener('load', handleResize);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      const header = document.querySelector('.site-header');
      const headerOffset = header ? header.offsetHeight : 0;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      links?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

// Offset direct hash navigation so anchored sections are not hidden by the
// sticky header (for shared links and browser reloads).
window.addEventListener('load', () => {
  const id = window.location.hash.slice(1);
  const el = id ? document.getElementById(id) : null;
  if (!el) return;
  const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.pageYOffset - headerOffset,
    behavior: 'auto'
  });
});

// Active section highlighting in navigation
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  const scrollPos = window.scrollY + 100; // Offset for better UX
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// Update on scroll
window.addEventListener('scroll', updateActiveNav);
// Update on load
window.addEventListener('load', updateActiveNav);

// Keep the lower desktop panels aligned without forcing a tall Athletics image.
// The image fills only the space left below the race gallery; stacked layouts
// return to their natural responsive height.
const projectsPanel = document.getElementById('projects');
const athleticsPanel = document.getElementById('athletics');
let athleticsSyncFrame;

function syncAthleticsPanelHeight() {
  if (!projectsPanel || !athleticsPanel) return;

  athleticsPanel.classList.remove('is-height-synced');
  athleticsPanel.style.removeProperty('height');

  if (!window.matchMedia('(min-width: 901px)').matches) return;

  const targetBottom = projectsPanel.getBoundingClientRect().bottom;
  const athleticsTop = athleticsPanel.getBoundingClientRect().top;
  const targetHeight = Math.round(targetBottom - athleticsTop);

  if (targetHeight > 0) {
    athleticsPanel.style.height = `${targetHeight}px`;
    athleticsPanel.classList.add('is-height-synced');
  }
}

function requestAthleticsSync() {
  window.cancelAnimationFrame(athleticsSyncFrame);
  athleticsSyncFrame = window.requestAnimationFrame(syncAthleticsPanelHeight);
}

window.addEventListener('load', requestAthleticsSync);
window.addEventListener('resize', requestAthleticsSync, { passive: true });
document.fonts?.ready.then(requestAthleticsSync);

if ('ResizeObserver' in window && projectsPanel) {
  new ResizeObserver(requestAthleticsSync).observe(projectsPanel);
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (links && links.classList.contains('open')) {
    if (!e.target.closest('.nav-links') && !e.target.closest('.nav-toggle')) {
      links.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  }
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();


document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('[data-scroll]');

  cards.forEach(card => {
    const scroller = card.querySelector('.scroll-body');
    if (!scroller) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const atTop = scrollTop <= 0;
      const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      // mark whether it actually overflows
      const isScrollable = scrollHeight > clientHeight + 1;
      card.classList.toggle('is-scrollable', isScrollable);

      card.classList.toggle('at-top', atTop);
      card.classList.toggle('at-bottom', atBottom);
      if (scrollTop > 2) card.classList.add('scrolled');
    };

    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update(); // initial
  });

  // Fade in lazy-loaded images when they finish loading
  document.querySelectorAll('img.lazy-img').forEach(img => {
    if (img.complete) {
      img.classList.add('is-loaded');
      return;
    }
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  });
});
