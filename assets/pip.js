/*
  Ürün Bilgi Paneli (pip)
  - <pip-tabs>: WAI-ARIA tabs deseni. JS yokken tüm paneller alt alta görünür.
  - Akordeonlar yerel <details> ile JS'siz çalışır; bu dosya yumuşak açılış animasyonu
    (prefers-reduced-motion'a saygılı), gruptaki tek açık akordeon davranışı, açılan akordeona
    kaydırma ve tema editörü entegrasyonu ekler.
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

  // Sayfanın üstünde sabit duran alanın alt kenarı: çapa menüsü varsa onun ofseti (header + çubuk),
  // yoksa yapışkan header'ın görünür alt kenarı.
  const topOffset = () => {
    const anv = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--anv-offset'));
    if (anv > 0) return anv;
    const header = document.querySelector('.shopify-section-header, .section-header');
    if (!header) return 0;
    const style = getComputedStyle(header);
    if (style.display === 'none' || (style.position !== 'sticky' && style.position !== 'fixed')) return 0;
    return Math.max(0, header.getBoundingClientRect().bottom);
  };

  // Tarayıcının scroll anchoring özelliği akordeon yüksekliği değişirken sayfayı kendi seçtiği bir
  // elemana göre kaydırır (çoğu zaman akordeonun altındaki bir section'a) ve açılan başlık ekrandan
  // kaçar. İşlem ve animasyon süresince belge genelinde kapatılır; konum aşağıda elle yönetilir.
  let anchorTimer = null;
  const suspendAnchoring = (ms = 450) => {
    const els = [document.documentElement, document.body];
    els.forEach((el) => { el.style.overflowAnchor = 'none'; });
    clearTimeout(anchorTimer);
    anchorTimer = setTimeout(() => els.forEach((el) => { el.style.overflowAnchor = ''; }), ms);
  };

  const closeInstant = (details) => {
    if (details.pipAnimation) details.pipAnimation.cancel();
    details.open = false;
    details.classList.remove('pip-acc--closing');
    details.style.overflow = '';
  };

  // Tek açık akordeon: tıklanan açılır, aynı gruptaki diğerleri kapanır. Açılan başlık, sabit
  // header/çapa çubuğunun hemen altına kaydırılır (ekran açılan akordeonu takip eder).
  const openExclusive = (details, summary, { animate = true, follow = true } = {}) => {
    const group = details.closest('.pip-acc-group');
    const others = group
      ? Array.from(group.querySelectorAll(':scope > .pip-acc')).filter((d) => d !== details && (d.open || d.pipAnimation))
      : [];
    const canAnimate = animate && !reduceMotion.matches && typeof details.animate === 'function';
    suspendAnchoring();

    // Tıklanandan önce gelenler anında kapanır ve kaydırma telafi edilir: başlık ekranda yerinde kalır,
    // sonra yumuşakça yukarı kayar. Sonrakiler animasyonla kapanır (konumu etkilemezler).
    const before = summary.getBoundingClientRect().top;
    others.forEach((other) => {
      const isAbove = other.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING;
      if (isAbove || !canAnimate) closeInstant(other);
      else animateDetails(other, other.querySelector('.pip-acc__summary'), false);
    });
    const shift = summary.getBoundingClientRect().top - before;
    if (Math.abs(shift) > 0.5) window.scrollBy(0, shift);

    if (canAnimate) animateDetails(details, summary, true);
    else details.open = true;

    if (follow) {
      const target = summary.getBoundingClientRect().top + window.scrollY - topOffset();
      // Başlık zaten üst bölgede görünüyorsa kaydırma yapma (gereksiz hareket olmasın).
      const current = summary.getBoundingClientRect().top - topOffset();
      if (current < 0 || current > window.innerHeight * 0.35) {
        window.scrollTo({ top: Math.max(0, target), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    }
  };

  document.addEventListener('click', (event) => {
    const summary = event.target.closest('.pip-acc__summary');
    if (!summary) return;

    const details = summary.parentElement;
    if (!details || details.tagName !== 'DETAILS' || !details.classList.contains('pip-acc')) return;

    event.preventDefault();
    const opening = !details.open || details.classList.contains('pip-acc--closing');
    if (opening) {
      openExclusive(details, summary);
    } else if (!reduceMotion.matches && typeof details.animate === 'function') {
      suspendAnchoring();
      animateDetails(details, summary, false);
    } else {
      details.open = false;
    }
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
      // Editörde seçilen akordeon açılır, gruptaki diğerleri kapanır; editör kendisi kaydırır.
      const summary = target.querySelector('.pip-acc__summary');
      if (summary) openExclusive(target, summary, { animate: false, follow: false });
      else target.open = true;
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
