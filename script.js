// Tutelaris Landing — small JS helpers

(function () {
  const nav = document.getElementById('primary-nav');
  const toggle = document.querySelector('.nav-toggle');
  const year = document.getElementById('year');

  // Footer year
  if (year) year.textContent = new Date().getFullYear();

  // Mobile nav toggle
  if (toggle && nav) {
    const setCollapsed = (collapsed) => {
      nav.dataset.collapsed = String(collapsed);
      toggle.setAttribute('aria-expanded', String(!collapsed));
    };
    setCollapsed(true);
    toggle.addEventListener('click', () => {
      const next = nav.dataset.collapsed === 'true' ? false : true;
      setCollapsed(next);
    });
    nav.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.matches('a[href^="#"]')) setCollapsed(true);
    });
  }

  // Smooth scroll for on-page anchors
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#' || id.length < 2) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', id);
  });

  // Make header sticky after scrolling past hero
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  if (header && hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        header.classList.remove('is-sticky');
      } else {
        header.classList.add('is-sticky');
      }
    }, { threshold: 0 });
    io.observe(hero);
  }

  // Seamless marquee: duplicate badges so there is no gap
  function buildMarquee() {
    const marquee = document.querySelector('.marquee');
    const track = marquee && marquee.querySelector('.marquee-track');
    if (!marquee || !track) return;

    // Collect original visible items (role=listitem)
    const originals = Array.from(track.children).filter(
      (n) => n.nodeType === 1 && n.getAttribute('role') === 'listitem'
    );
    if (originals.length === 0) return;

    // Rebuild the track: first, one accessible set that fills at least the viewport width
    track.innerHTML = '';
    const unit = [];
    let unitWidth = 0;
    const targetWidth = marquee.offsetWidth; // fill at least container width

    // Helper to append a clone and update width measurement
    const appendClone = (el, hidden) => {
      const c = el.cloneNode(true);
      if (hidden) c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
      unit.push(c);
    };

    // Append originals until we cover the container width
    // Measure after each append because inline sizes vary by viewport
    while (unitWidth < targetWidth) {
      for (let i = 0; i < originals.length && unitWidth < targetWidth; i++) {
        appendClone(originals[i], false);
        unitWidth = track.scrollWidth;
      }
      // Safety to avoid infinite loop in extreme cases
      if (unit.length > 200) break;
    }

    // Append a hidden duplicate of the built unit to enable seamless loop
    // We clone the nodes we just appended so widths match exactly
    unit.forEach((n) => {
      const c = n.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });
  }

  // Initialize on load and re-run on significant resizes
  let resizeTimer = null;
  buildMarquee();
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildMarquee, 150);
  });
})();
