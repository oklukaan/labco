/*
  Çapa menüsü (anv)
  - Kaydırınca çubuk header'ın görünür alt kenarına sabitlenir (position: fixed + yer tutucu).
    Header'ın konumu her karede okunur; Dawn'ın gizle/göster animasyonu izlenir. İşaretçilerin
    scroll-margin-top'u --anv-offset ile verilir.
  - Linke tıklayınca ilgili işaretçiye yumuşak kaydırır (prefers-reduced-motion → anında).
  - Scroll-spy: çubuğun altındaki eşiği geçen son işaretçi aktif link olur; mobilde aktif
    link görünür alana getirilir.
  - Hedef: çapa işaretçisi, tam eleman id'si veya section anahtarı (bkz. resolveTarget).
  - Hedefi sayfada olmayan linkler gizlenir. Vanilla, bağımlılıksız, idempotent.
*/
(() => {
  'use strict';

  if (!window.customElements || customElements.get('anchor-nav')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Header'ın ekrandaki görünür alt kenarı (px). Dawn header'ı kaydırırken sticky/hidden
  // sınıflarını değiştirip top'u animasyonla oynattığı için her karede yeniden okunur.
  // Header yoksa, gizliyse ya da ekran dışındaysa 0.
  const headerBottom = (self) => {
    const candidates = ['.shopify-section-header', '.shopify-section-group-header-group', '.section-header', 'header'];
    for (const selector of candidates) {
      const element = Array.from(document.querySelectorAll(selector)).find((el) => !el.contains(self) && !self.contains(el));
      if (!element) continue;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return 0;
      const rect = element.getBoundingClientRect();
      if (rect.height === 0) return 0;
      // Normal akıştaki (yapışkan olmayan) header kaydırılınca yukarı çıkar; bottom negatife düşer → 0.
      return Math.max(0, Math.round(rect.bottom));
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
          this.updateSticky();
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
      // Dawn header'ı gizle/göster geçişini top ile animasyonlar; geçiş boyunca çubuğu izle.
      this.onHeaderTransition = (event) => {
        const t = event.target;
        if (t && t.matches && t.matches('.shopify-section-header, .section-header')) this.followHeader();
      };
      document.addEventListener('transitionrun', this.onHeaderTransition, true);

      this.updateSticky();
      this.updateActive();

      // Sayfa hash ile açıldıysa (kısa etiket hash'i veya hedef id) ofsetli konuma getir.
      if (location.hash) {
        const hash = decodeURIComponent(location.hash.slice(1));
        const entry = this.targets.find((t) => this.slugFor(t) === hash || t.marker.id === hash || t.link.dataset.anvTarget === hash);
        if (entry) requestAnimationFrame(() => this.scrollTo(entry.marker, true));
      }
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
      document.removeEventListener('transitionrun', this.onHeaderTransition, true);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      this.anvReady = false;
    }

    // Hedef çözümleme sırası (ilk bulunan kazanır):
    //   1. Tam eleman id'si: #hedef (yapıştırılan shopify-section-... id'si)
    //   2. Çapa işaretçisi: [data-anv-marker="hedef"] (ham ya da slug)
    //   3. Section anahtarı: id'si "__hedef" ile biten Shopify section'ı
    //      (ör. "related-products" → #shopify-section-template--123__related-products)
    // Hiçbiri yoksa link gizlenir.
    resolveTarget(raw) {
      const handle = String(raw || '').trim().replace(/^#/, '');
      if (!handle) return null;
      const safe = CSS.escape(handle);
      // Yapıştırılan id'de boşluk/büyük harf olabilir; işaretçi adları için slug da denenir.
      const slug = handle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return (
        document.getElementById(handle) ||
        document.querySelector(`[data-anv-marker="${safe}"]`) ||
        document.querySelector(`[data-anv-marker="${CSS.escape(slug)}"]`) ||
        document.querySelector(`.shopify-section[id$="__${safe}"]`) ||
        null
      );
    }

    resolveTargets() {
      this.targets = [];
      this.links.forEach((link) => {
        const handle = link.dataset.anvTarget;
        const marker = this.resolveTarget(handle);
        const item = link.closest('.anv__item');
        if (marker) {
          this.targets.push({ link, marker });
          if (marker.id) link.setAttribute('href', `#${marker.id}`);
          if (item) item.hidden = false;
        } else if (item) {
          item.hidden = true;
        }
      });
      // Belge sırasına göre sırala (scroll-spy "son geçilen" mantığı için).
      this.targets.sort((a, b) => (a.marker.compareDocumentPosition(b.marker) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      // Sayfada hiç hedef yoksa (ör. header grubunda, işaretçisiz sayfa) çubuk hiç görünmesin.
      const wrapper = this.closest('.anv-section') || this;
      wrapper.hidden = this.targets.length === 0;
    }

    measure() {
      // Yer tutucu: çubuk fixed olunca akıştaki boşluğu korur, içerik zıplamaz.
      if (!this.placeholder) {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'anv-placeholder';
        this.placeholder.setAttribute('aria-hidden', 'true');
        this.parentNode.insertBefore(this.placeholder, this);
      }
      this.barHeight = this.getBoundingClientRect().height;
      this.placeholder.style.height = this.classList.contains('is-fixed') ? `${this.barHeight}px` : '0px';
      this.updateSticky();
    }

    // Çubuk, doğal konumu header'ın alt kenarına değince fixed olur; geri kaydırınca akışa döner.
    updateSticky() {
      const sticky = this.classList.contains('anv--sticky');
      const hb = sticky ? headerBottom(this) : 0;
      if (sticky && this.placeholder) {
        const naturalTop = this.placeholder.getBoundingClientRect().top;
        const shouldFix = naturalTop <= hb;
        if (shouldFix !== this.classList.contains('is-fixed')) {
          this.classList.toggle('is-fixed', shouldFix);
          this.placeholder.style.height = shouldFix ? `${this.barHeight}px` : '0px';
        }
        this.style.top = shouldFix ? `${hb}px` : '';
      } else if (this.classList.contains('is-fixed')) {
        this.classList.remove('is-fixed');
        if (this.placeholder) this.placeholder.style.height = '0px';
        this.style.top = '';
      }
      // Kaydırma hedefi ofseti: header'ın görünür alt kenarı + çubuk yüksekliği.
      this.offset = Math.round(hb + (this.barHeight || 0));
      document.documentElement.style.setProperty('--anv-offset', `${this.offset}px`);
    }

    // Header animasyonu / yumuşak kaydırma bitene kadar birkaç kare çubuğu header'a bağlı tut.
    followHeader(frames, marker) {
      let left = frames || 20;
      const step = () => {
        this.updateSticky();
        this.updateActive();
        if (--left > 0) {
          requestAnimationFrame(step);
        } else if (marker) {
          // Kaydırma bitti: header bu arada gizlenmiş/görünmüş olabilir; hedefi son ofsete göre düzelt.
          const diff = Math.round(marker.getBoundingClientRect().top - this.offset);
          if (Math.abs(diff) > 1) window.scrollBy({ top: diff, behavior: 'auto' });
          this.updateSticky();
          this.updateActive();
        }
      };
      requestAnimationFrame(step);
    }

    onClick(event) {
      const link = event.target.closest('.anv__link');
      if (!link || !this.contains(link)) return;
      const entry = this.targets.find((t) => t.link === link);
      if (!entry) return;
      event.preventDefault();
      this.scrollTo(entry.marker, false);
      // URL'de uzun section id'si yerine linkin etiketinden türeyen kısa hash (#vet-reviewed).
      if (this.dataset.updateUrl !== 'false' && history.replaceState) {
        history.replaceState(null, '', `#${this.slugFor(entry)}`);
      }
    }

    slugFor(entry) {
      const text = entry.link.textContent || entry.link.dataset.anvTarget || '';
      return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || entry.marker.id;
    }

    scrollTo(marker, instant) {
      this.measure();
      const top = marker.getBoundingClientRect().top + window.scrollY - this.offset;
      const behavior = instant || reduceMotion.matches ? 'auto' : 'smooth';
      window.scrollTo({ top: Math.max(0, top), behavior });
      // Yumuşak kaydırma sırasında header gizlenip görünebilir; çubuğu ~1 sn boyunca izle.
      this.followHeader(behavior === 'smooth' ? 70 : 3, marker);
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
  // Editörde bir link bloğu seçilince hedefine kaydır (önizlemede tıklama bloğu seçer, linki çalıştırmaz).
  document.addEventListener('shopify:block:select', (event) => {
    const link = event.target && event.target.querySelector ? event.target.querySelector('.anv__link') : null;
    const nav = link ? link.closest('anchor-nav') : null;
    if (!nav || !nav.targets) return;
    const entry = nav.targets.find((t) => t.link === link);
    if (entry) nav.scrollTo(entry.marker, false);
  });
  document.addEventListener('shopify:section:load', refreshAll);
  document.addEventListener('shopify:section:unload', refreshAll);
  document.addEventListener('shopify:section:reorder', refreshAll);
})();
