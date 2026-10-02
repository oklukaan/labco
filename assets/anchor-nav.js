/*
  Çapa menüsü (anv)
  - Header yüksekliğini ölçüp çubuğu altına yapıştırır (--anv-top) ve işaretçilerin
    scroll-margin-top'unu ayarlar (--anv-offset).
  - Linke tıklayınca ilgili işaretçiye yumuşak kaydırır (prefers-reduced-motion → anında).
  - Scroll-spy: çubuğun altındaki eşiği geçen son işaretçi aktif link olur; mobilde aktif
    link görünür alana getirilir.
  - Hedefi sayfada olmayan linkler gizlenir. Vanilla, bağımlılıksız, idempotent.
*/
(() => {
  'use strict';

  if (!window.customElements || customElements.get('anchor-nav')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Dawn header'ı yapışkansa yüksekliği; değilse 0. Diğer temalarda <header> / .shopify-section-header denenir.
  const stickyHeaderHeight = () => {
    const candidates = [
      '.shopify-section-header-sticky',
      '.shopify-section-header',
      '.shopify-section-group-header-group',
      'header',
    ];
    for (const selector of candidates) {
      const element = document.querySelector(selector);
      if (!element) continue;
      const position = getComputedStyle(element).position;
      const inner = element.querySelector('.header-wrapper, header');
      const innerPosition = inner ? getComputedStyle(inner).position : '';
      if (position === 'sticky' || position === 'fixed' || innerPosition === 'sticky' || innerPosition === 'fixed') {
        return element.getBoundingClientRect().height;
      }
      return 0;
    }
    return 0;
  };

  class AnchorNav extends HTMLElement {
    connectedCallback() {
      if (this.anvReady) return;
      this.anvReady = true;

      this.links = Array.from(this.querySelectorAll('.anv__link'));
      this.spyOffset = parseInt(this.dataset.spyOffset || '40', 10);
      this.targets = [];
      this.scrollTicking = false;

      this.resolveTargets();
      this.measure();

      this.addEventListener('click', (event) => this.onClick(event));
      this.onScroll = () => {
        if (this.scrollTicking) return;
        this.scrollTicking = true;
        requestAnimationFrame(() => {
          this.scrollTicking = false;
          this.updateActive();
        });
      };
      this.onResize = () => {
        this.measure();
        this.updateActive();
      };
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize);
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => this.onResize());
        this.resizeObserver.observe(this);
        const header = document.querySelector('.shopify-section-header, header');
        if (header) this.resizeObserver.observe(header);
      }

      this.updateActive();

      // Sayfa hash ile açıldıysa ofsetli konuma getir.
      if (location.hash && location.hash.startsWith('#anv-')) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) requestAnimationFrame(() => this.scrollTo(target, true));
      }
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      this.anvReady = false;
    }

    // Her link için işaretçiyi bul; yoksa linki gizle.
    resolveTargets() {
      this.targets = [];
      this.links.forEach((link) => {
        const handle = link.dataset.anvTarget;
        const marker = document.querySelector(`[data-anv-marker="${CSS.escape(handle)}"]`);
        const item = link.closest('.anv__item');
        if (marker) {
          this.targets.push({ link, marker });
          if (item) item.hidden = false;
        } else if (item) {
          item.hidden = true;
        }
      });
      // Belge sırasına göre sırala (scroll-spy "son geçilen" mantığı için).
      this.targets.sort((a, b) => (a.marker.compareDocumentPosition(b.marker) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    }

    measure() {
      const sticky = this.classList.contains('anv--sticky');
      const headerHeight = sticky ? stickyHeaderHeight() : 0;
      // Sticky, section sarmalayıcısına (Shopify'ın div'i) uygulanır; yoksa elemanın kendisine.
      const wrapper = this.closest('.anv-section') || this;
      wrapper.classList.toggle('anv-section--sticky', sticky);
      wrapper.style.setProperty('--anv-top', `${Math.round(headerHeight)}px`);
      const barHeight = this.getBoundingClientRect().height;
      this.offset = Math.round(headerHeight + barHeight);
      document.documentElement.style.setProperty('--anv-offset', `${this.offset}px`);
    }

    onClick(event) {
      const link = event.target.closest('.anv__link');
      if (!link || !this.contains(link)) return;
      const entry = this.targets.find((t) => t.link === link);
      if (!entry) return;
      event.preventDefault();
      this.scrollTo(entry.marker, false);
      if (history.replaceState) history.replaceState(null, '', `#${entry.marker.id}`);
    }

    scrollTo(marker, instant) {
      this.measure();
      const top = marker.getBoundingClientRect().top + window.scrollY - this.offset;
      window.scrollTo({ top: Math.max(0, top), behavior: instant || reduceMotion.matches ? 'auto' : 'smooth' });
    }

    updateActive() {
      if (!this.targets.length) return;
      const threshold = (this.offset || 0) + this.spyOffset;
      let current = null;
      for (const entry of this.targets) {
        if (entry.marker.getBoundingClientRect().top <= threshold) current = entry;
        else break;
      }
      // Henüz hiçbir bölüme gelinmediyse ilk link aktif (referans davranışı).
      if (!current) current = this.targets[0];
      // Sayfa sonundaysa son hedef aktif olsun.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = this.targets[this.targets.length - 1];
      }
      this.targets.forEach((entry) => {
        const active = entry === current;
        entry.link.classList.toggle('is-active', active);
        if (active) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      });
      if (current && current !== this.lastActive) {
        this.lastActive = current;
        // Yatay kaydırılabilir şeritte aktif linki görünür alana getir (dikey kaydırmaya dokunmaz).
        const inner = this.querySelector('.anv__inner');
        if (inner && inner.scrollWidth > inner.clientWidth) {
          const linkRect = current.link.getBoundingClientRect();
          const innerRect = inner.getBoundingClientRect();
          const delta = linkRect.left - innerRect.left - (innerRect.width - linkRect.width) / 2;
          inner.scrollBy({ left: delta, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
      }
    }
  }

  customElements.define('anchor-nav', AnchorNav);

  // Tema editöründe section eklenince/yeniden yüklenince hedefleri tazele.
  const refreshAll = () => {
    document.querySelectorAll('anchor-nav').forEach((nav) => {
      if (typeof nav.resolveTargets === 'function') {
        nav.resolveTargets();
        nav.measure();
        nav.updateActive();
      }
    });
  };
  document.addEventListener('shopify:section:load', refreshAll);
  document.addEventListener('shopify:section:unload', refreshAll);
  document.addEventListener('shopify:section:reorder', refreshAll);
})();
