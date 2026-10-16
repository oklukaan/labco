/*
  Floating ingredients: scroll-linked parallax + rotation for .fi-item elements.
  Vanilla, no dependencies, single init even if loaded by several sections.
  Anchor document offsets are cached (re-measured on resize / layout changes); scroll frames only
  read scrollY, then write transforms. Motion is lerped; off when prefers-reduced-motion.
*/
(() => {
  if (window.__floatingIngredientsInit) return;
  window.__floatingIngredientsInit = true;

  const K_MOVE = 3.5; // speed 30 → ~±105px
  const K_ROT = 3; // rot 20 → ~±60deg
  const LERP = 0.12;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let items = [];
  const active = new Set();
  let frame = 0;
  let observer = null;
  let resizeObserver = null;
  let measureTimer = 0;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const measure = () => {
    const y = window.scrollY;
    items.forEach((it) => {
      it.anchorTop = it.anchor.getBoundingClientRect().top + y;
    });
    requestFrame();
  };

  const scheduleMeasure = () => {
    clearTimeout(measureTimer);
    measureTimer = setTimeout(measure, 120);
  };

  const tick = () => {
    frame = 0;
    if (motion.matches) return;
    const y = window.scrollY;
    const vh = window.innerHeight || 1;
    let moving = false;
    active.forEach((it) => {
      // 0 when the anchor sits at the viewport centre, ±1 one screen away.
      const progress = clamp((it.anchorTop - y - vh / 2) / vh, -1.5, 1.5);
      const tY = progress * it.speed * K_MOVE;
      const tR = progress * it.rot * K_ROT;
      it.y += (tY - it.y) * LERP;
      it.r += (tR - it.r) * LERP;
      if (Math.abs(tY - it.y) > 0.1 || Math.abs(tR - it.r) > 0.05) moving = true;
      else {
        it.y = tY;
        it.r = tR;
      }
      it.scroll.style.transform = `translate3d(0, ${it.y.toFixed(2)}px, 0) rotate(${it.r.toFixed(2)}deg)`;
    });
    if (moving) requestFrame();
  };

  function requestFrame() {
    if (!frame && !motion.matches) frame = requestAnimationFrame(tick);
  }

  const teardown = () => {
    if (observer) observer.disconnect();
    if (resizeObserver) resizeObserver.disconnect();
    active.clear();
    items.forEach((it) => {
      it.scroll.style.transform = '';
    });
    items = [];
  };

  const init = () => {
    teardown();
    const nodes = document.querySelectorAll('[data-fi-section] .fi-item');
    if (!nodes.length) return;
    items = Array.from(nodes)
      .map((el) => ({
        el,
        anchor: el.closest('[data-fi-section]'),
        scroll: el.querySelector('.fi-scroll'),
        speed: parseFloat(el.dataset.speed) || 0,
        rot: parseFloat(el.dataset.rot) || 0,
        anchorTop: 0,
        y: 0,
        r: 0,
      }))
      .filter((it) => it.scroll && it.anchor);
    if (!items.length || motion.matches) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const it = items.find((x) => x.el === entry.target);
          if (!it) return;
          if (entry.isIntersecting) active.add(it);
          else active.delete(it);
        });
        requestFrame();
      },
      { rootMargin: '200px 0px' }
    );
    items.forEach((it) => observer.observe(it.el));

    // Accordions, tabs, lazy images and apps change the page height without a resize event.
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(scheduleMeasure);
      resizeObserver.observe(document.body);
    }
    measure();
  };

  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', scheduleMeasure);
  window.addEventListener('load', scheduleMeasure);
  motion.addEventListener('change', init);
  ['shopify:section:load', 'shopify:section:unload', 'shopify:section:reorder', 'shopify:block:select'].forEach((type) =>
    document.addEventListener(type, () => setTimeout(init, 0))
  );

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
