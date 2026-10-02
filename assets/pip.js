/*
  Ürün Bilgi Paneli (pip)
  - <pip-tabs>: WAI-ARIA tabs deseni. JS yokken tüm paneller alt alta görünür.
  - Akordeonlar yerel <details> ile JS'siz çalışır; bu dosya yalnızca yumuşak açılış
    animasyonu (prefers-reduced-motion'a saygılı) ve tema editörü entegrasyonu ekler.
  Vanilla, bağımlılıksız, idempotent; global değişken tanımlamaz.
*/
(() => {
  'use strict';

  // Dosya sayfada birden fazla kez yüklense de dinleyiciler bir kez kurulur.
  const root = document.documentElement;
  if (root.hasAttribute('data-pip-ready')) return;
  root.setAttribute('data-pip-ready', '');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Sekmeler ---------- */

  if (window.customElements && !customElements.get('pip-tabs')) {
    class PipTabs extends HTMLElement {
      connectedCallback() {
        // Tanım parse sırasında hazırsa çocuklar henüz gelmemiş olabilir; bir sonraki kareye ertele.
        if (!this.querySelector('[role="tablist"]')) {
          requestAnimationFrame(() => this.init());
          return;
        }
        this.init();
      }

      init() {
        if (this.pipInitialized) return;

        const list = this.querySelector('[role="tablist"]');
        if (!list) return;

        this.pipTabs = Array.from(list.querySelectorAll('[role="tab"]'));
        if (!this.pipTabs.length) return;

        this.pipInitialized = true;

        list.addEventListener('click', (event) => {
          const tab = event.target.closest('[role="tab"]');
          if (tab && this.pipTabs.includes(tab)) this.select(tab, false);
        });
        list.addEventListener('keydown', (event) => this.onKeydown(event));

        const current = this.pipTabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || this.pipTabs[0];
        this.select(current, false);

        list.hidden = false;
        this.classList.add('pip-tabs--js');
      }

      select(tab, focus) {
        if (!this.pipTabs || !this.pipTabs.includes(tab)) return;

        // Sekme şeridi ekranda aynı yerde kalsın: değişimden önce/sonra şeridin konumunu ölçüp
        // farkı kaydırmayla telafi eder. Eşit yükseklik modunda yükseklik değişmediği için gerekmez.
        const list = tab.closest('[role="tablist"]');
        const equal = this.classList.contains('pip-tabs--equal');
        const before = !equal && list ? list.getBoundingClientRect().top : null;

        this.pipTabs.forEach((item) => {
          const active = item === tab;
          item.setAttribute('aria-selected', active ? 'true' : 'false');
          item.tabIndex = active ? 0 : -1;
          const panel = document.getElementById(item.getAttribute('aria-controls'));
          if (!panel) return;
          panel.hidden = !active;
          // Eşit yükseklik modunda pasif paneller yer kaplar; erişilebilirlik ağacından ve sekme sırasından çıkarılır.
          if (equal) {
            panel.setAttribute('aria-hidden', active ? 'false' : 'true');
            panel.tabIndex = active ? 0 : -1;
          }
        });

        if (before !== null) {
          const diff = list.getBoundingClientRect().top - before;
          // Anlık düzeltme; animasyon olmadığı için prefers-reduced-motion'da da uygulanır.
          if (Math.abs(diff) > 0.5) window.scrollBy(0, diff);
        }

        if (focus) tab.focus({ preventScroll: true });
      }

      onKeydown(event) {
        const index = this.pipTabs.indexOf(document.activeElement);
        if (index === -1) return;

        const last = this.pipTabs.length - 1;
        let next = null;

        switch (event.key) {
          case 'ArrowRight':
            next = index === last ? 0 : index + 1;
            break;
          case 'ArrowLeft':
            next = index === 0 ? last : index - 1;
            break;
          case 'Home':
            next = 0;
            break;
          case 'End':
            next = last;
            break;
          default:
            return;
        }

        event.preventDefault();
        this.select(this.pipTabs[next], true);
      }
    }

    customElements.define('pip-tabs', PipTabs);
  }

  /* ---------- Akordeon animasyonu ---------- */

  const animateDetails = (details, summary, open) => {
    const startHeight = details.getBoundingClientRect().height;
    if (details.pipAnimation) details.pipAnimation.cancel();

    details.style.overflow = 'hidden';
    details.classList.remove('pip-acc--closing');

    let endHeight;
    if (open) {
      details.open = true;
      endHeight = details.getBoundingClientRect().height;
    } else {
      const borders = details.offsetHeight - details.clientHeight;
      endHeight = summary.getBoundingClientRect().height + borders;
      details.classList.add('pip-acc--closing');
    }

    const animation = details.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: 250, easing: 'ease' }
    );
    details.pipAnimation = animation;

    animation.onfinish = () => {
      details.pipAnimation = null;
      if (!open) details.open = false;
      details.classList.remove('pip-acc--closing');
      details.style.overflow = '';
    };
    animation.oncancel = () => {
      details.pipAnimation = null;
    };
  };

  document.addEventListener('click', (event) => {
    const summary = event.target.closest('.pip-acc__summary');
    if (!summary) return;

    const details = summary.parentElement;
    if (!details || details.tagName !== 'DETAILS' || !details.classList.contains('pip-acc')) return;
    if (reduceMotion.matches || typeof details.animate !== 'function') return;

    event.preventDefault();
    const opening = !details.open || details.classList.contains('pip-acc--closing');
    animateDetails(details, summary, opening);
  });

  /* ---------- Tema editörü ---------- */

  document.addEventListener('shopify:block:select', (event) => {
    const blockId = event.detail && event.detail.blockId;
    if (!blockId) return;

    const target =
      event.target instanceof Element && event.target.matches('[data-pip-block]')
        ? event.target
        : document.querySelector(`[data-pip-block="${CSS.escape(blockId)}"]`);
    if (!target) return;

    if (target.matches('[role="tab"]')) {
      const tabs = target.closest('pip-tabs');
      if (tabs && typeof tabs.select === 'function') {
        tabs.select(target, false);
        // Editörde seçilen sekme görünür alana getirilir; kaydırma hareketi azaltılmış harekete saygılıdır.
        target.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: reduceMotion.matches ? 'auto' : 'smooth',
        });
      }
    } else if (target.tagName === 'DETAILS') {
      target.open = true;
    }
  });

  // Custom element yeni DOM'da kendiliğinden başlar; init() idempotent olduğu için
  // section yeniden yüklendiğinde açıkça çağırmak güvenlidir.
  document.addEventListener('shopify:section:load', (event) => {
    event.target.querySelectorAll('pip-tabs').forEach((element) => {
      if (typeof element.init === 'function') element.init();
    });
  });
})();
