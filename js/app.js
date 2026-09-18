/* App — الواجهة العامة للعملاء (عرض + سلة + طلب + WhatsApp) */
(function () {
  'use strict';
  var U = window.Utils, T = function (k) { return window.I18N.t(k); };
  var lang = function () { return window.I18N.lang(); };
  var L = function (o) { return U.pickLocalized(o, lang()); };

  var state = null;
  var activeCat = 'all';
  var searchQ = '';
  var heroCleanup = null;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    state = window.Store.load();
    // لغة من الرابط ?lang=
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q && window.I18N.LANGS.indexOf(q) !== -1 && q !== state.settings.language) {
        window.Store.set('settings.language', q);
      }
    } catch (e) { /* noop */ }
    window.I18N.applyDir();
    applyTheme();
    renderAll();
    bindGlobal();
    window.Effects.initReveal();
    window.Effects.initParallax(document);
    // تحديث تلقائي عند تعديل اللوحة في تبويب آخر
    window.addEventListener('storage', function (e) {
      if (e.key === window.Schema.STORE_KEY || (e.key === '__site_ping')) {
        state = window.Store.load();
        applyTheme(); renderAll();
      }
    });
    document.addEventListener('site:quota', function () {
      U.toast(lang() === 'ar' ? 'مساحة التخزين المحلي ممتلئة — احذف بعض الصور الكبيرة.' : 'Local storage is full.', 'err');
    });
  }

  /* ================= المظهر ================= */
  var FONT_STACKS = {
    Cairo: "'Cairo','Tajawal',system-ui,sans-serif",
    Tajawal: "'Tajawal','Cairo',system-ui,sans-serif",
    Almarai: "'Almarai','Tajawal',system-ui,sans-serif",
    Inter: "'Inter',system-ui,sans-serif",
    Poppins: "'Poppins','Inter',system-ui,sans-serif",
    Rubik: "'Rubik',system-ui,sans-serif",
    Outfit: "'Outfit','Inter',system-ui,sans-serif",
    ' system': "system-ui,-apple-system,'Segoe UI',sans-serif"
  };
  var SHADOWS = {
    none: 'none',
    soft: '0 6px 24px rgba(20,10,5,.08)',
    medium: '0 14px 40px rgba(20,10,5,.14)',
    strong: '0 24px 70px rgba(20,10,5,.22)'
  };

  function applyTheme() {
    var th = state.theme || {};
    var root = document.documentElement.style;
    ['primary', 'background', 'text', 'secondary', 'button', 'card', 'border', 'header', 'footer', 'alert', 'price'].forEach(function (k) {
      if (th[k]) root.setProperty('--' + k, th[k]);
    });
    root.setProperty('--radius', (th.radius || 18) + 'px');
    root.setProperty('--shadow', SHADOWS[th.shadow] || SHADOWS.medium);
    root.setProperty('--font-head', FONT_STACKS[th.headingFont] || FONT_STACKS.Cairo);
    root.setProperty('--font-body', FONT_STACKS[th.bodyFont] || FONT_STACKS.Tajawal);
    root.setProperty('--h-size', (th.headingSize || 46) + 'px');
    root.setProperty('--f-weight', th.fontWeight || 800);
    document.body.setAttribute('data-btn', th.buttonStyle || 'rounded');
    document.body.setAttribute('data-card', (state.layout || {}).cardStyle || 'modern');
    // لون نص متباين فوق Primary
    root.setProperty('--on-primary', isDark(th.button || th.primary) ? '#fff' : '#1B1410');
  }
  function isDark(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    if (!isFinite(n)) return true;
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
  }

  /* ================= عرض ================= */
  function renderAll() {
    state = window.Store.load();
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = T(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = T(el.getAttribute('data-i18n-ph')); });
    renderHeader(); renderHero(); renderInfoStrip();
    renderCategories(); renderProducts();
    renderAbout(); renderReviews(); renderLocation(); renderContact(); renderFooter();
    renderCartBadge(); renderCartDrawer();
    applySectionsVisibility();
    syncLangButtons();
    window.Effects.refreshReveal();
    window.Effects.initTilt(document);
  }

  function logoHTML(cls) {
    var b = state.business;
    if (b.logoImage) {
      return '<img class="logo-img ' + (cls || '') + '" src="' + U.sanitizeUrl(b.logoImage, 'assets/images/placeholder.svg') + '" alt="' + U.esc(b.name) + '">';
    }
    return '<span class="logo-mark ' + (cls || '') + '" aria-hidden="true">' +
      '<svg viewBox="0 0 48 48" width="34" height="34"><path fill="currentColor" d="M10 18c0-6 5-10 11-10 1.5 0 3 .3 4.3.9L30 4l3 4-4.6 3.4c2.1 1.8 3.6 4.4 3.6 7.6 0 1.2-.2 2.3-.6 3.4L38 30l-3.5 3.5L30 29c-1.6 1-3.6 1.6-5.7 1.9L22 38h-5l1.6-7.3c-4.6-1.2-8.6-5-8.6-12.7z"/><circle cx="32" cy="36" r="6" fill="currentColor" opacity=".85"/></svg></span>';
  }

  function renderHeader() {
    var b = state.business;
    document.getElementById('brand').innerHTML = logoHTML() + '<span class="brand-name">' + U.esc(b.name) + '</span>';
    document.title = b.name + ' — ' + L(b.tagline);
  }

  function starsHTML(rating) {
    var full = Math.round(Number(rating) || 0);
    var s = '';
    for (var i = 1; i <= 5; i++) s += '<span class="star' + (i <= full ? ' on' : '') + '">★</span>';
    return '<span class="stars" aria-label="' + U.esc(String(rating)) + '">' + s + '</span>';
  }

  function renderHero() {
    var b = state.business, lay = state.layout, hero = state.hero || {};
    var style = lay.heroStyle || 'split-3d';
    var wrap = document.getElementById('hero');
    wrap.setAttribute('data-hero', style);
    var img = hero.image || 'assets/images/hero-bucket.png';
    var videoHTML = '';
    if (hero.video) {
      videoHTML = '<video class="hero-video" src="' + U.sanitizeUrl(hero.video) + '" autoplay muted loop playsinline poster="' + U.sanitizeUrl(img, 'assets/images/placeholder.svg') + '"></video>';
    }
    var ratingHTML = '';
    if (lay.showRating && b.rating) {
      ratingHTML = '<div class="hero-rating">' + starsHTML(b.rating) +
        '<strong>' + U.esc(String(b.rating)) + '</strong><span>(' + U.esc(String(b.reviewsCount || 0)) + ' ' + T('hero.reviews') + ')</span></div>';
    }
    wrap.innerHTML =
      '<canvas id="hero-fx" aria-hidden="true"></canvas>' +
      '<div class="hero-inner">' +
        '<div class="hero-copy rv">' +
          '<span class="eyebrow">' + U.esc(L(b.type)) + (b.priceRange && lay.showPrices ? ' • ' + U.esc(b.priceRange) : '') + '</span>' +
          '<h1>' + U.esc(b.name) + '</h1>' +
          '<p class="tagline">' + U.esc(L(b.tagline)) + '</p>' +
          '<p class="desc">' + U.esc(L(b.description)) + '</p>' +
          ratingHTML +
          '<div class="hero-cta">' +
            '<a class="btn btn-primary" href="#products">' + T('hero.browse') + '</a>' +
            '<a class="btn btn-ghost" href="#location">' + T('hero.contact') + '</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-media rv" data-plx="0.06">' +
          videoHTML +
          '<img class="hero-img" src="' + U.sanitizeUrl(img, 'assets/images/placeholder.svg') + '" alt="' + U.esc(L(hero.alt) || b.name) + '" fetchpriority="high">' +
          '<div class="hero-ring" aria-hidden="true"></div>' +
        '</div>' +
      '</div>';
    if (heroCleanup) { try { heroCleanup(); } catch (e) {} heroCleanup = null; }
    heroCleanup = window.Effects.initHeroFX(document.getElementById('hero-fx'), (state.theme || {}).primary);
  }

  function renderInfoStrip() {
    var b = state.business;
    var feats = (b.features || []).map(function (f) { return '<li>' + U.esc(L(f)) + '</li>'; }).join('');
    document.getElementById('info-strip').innerHTML =
      '<ul class="strip-list rv">' + feats +
      (b.phone ? '<li class="strip-phone"><a href="tel:' + U.esc(b.phone.replace(/\s/g, '')) + '">' + U.esc(b.phone) + '</a></li>' : '') + '</ul>';
  }

  function sortedCats() {
    return (state.categories || []).slice().sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
  }

  function renderCategories() {
    var box = document.getElementById('cat-pills');
    if (!box) return;
    var html = '<button class="pill' + (activeCat === 'all' ? ' active' : '') + '" data-cat="all">' + T('filter.all') + '</button>';
    sortedCats().forEach(function (c) {
      html += '<button class="pill' + (activeCat === c.id ? ' active' : '') + '" data-cat="' + U.esc(c.id) + '">' +
        (c.icon ? '<span class="pill-ic">' + U.esc(c.icon) + '</span>' : '') + U.esc(L(c.name)) + '</button>';
    });
    box.innerHTML = html;
    box.querySelectorAll('button').forEach(function (btn) {
      btn.onclick = function () { activeCat = btn.getAttribute('data-cat'); renderCategories(); renderProducts(); };
    });
  }

  function filteredProducts() {
    var list = (state.products || []).slice().sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
    if (activeCat !== 'all') list = list.filter(function (p) { return p.categoryId === activeCat; });
    if (searchQ) {
      var q = searchQ.toLowerCase();
      list = list.filter(function (p) {
        var hay = [p.name.ar, p.name.en, p.name.fr, p.desc.ar, p.desc.en, p.desc.fr].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }
    return list;
  }

  function catName(id) {
    var c = (state.categories || []).find(function (x) { return x.id === id; });
    return c ? L(c.name) : '';
  }

  function renderProducts() {
    var grid = document.getElementById('product-grid');
    var empty = document.getElementById('products-empty');
    var none = document.getElementById('no-results');
    var all = (state.products || []);
    var list = filteredProducts();
    empty.style.display = all.length ? 'none' : 'block';
    none.style.display = (all.length && !list.length) ? 'block' : 'none';
    var cols = Math.min(4, Math.max(2, parseInt(state.layout.columns, 10) || 3));
    grid.style.setProperty('--cols', cols);
    grid.innerHTML = list.map(cardHTML).join('');
    grid.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.onclick = function () {
        if (window.Cart.add(btn.getAttribute('data-add'), 1)) {
          renderCartBadge(); renderCartDrawer(); openCart();
          U.toast(lang() === 'fr' ? 'Ajouté au panier' : lang() === 'en' ? 'Added to cart' : 'تمت الإضافة إلى السلة');
        }
      };
    });
    grid.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.onclick = function () { openProduct(btn.getAttribute('data-view')); };
    });
    window.Effects.refreshReveal();
    window.Effects.initTilt(grid);
  }

  function cardHTML(p) {
    var badge = L(p.badge);
    var canDelivery = window.Cart.deliveryOf(p);
    var oldP = (p.oldPrice && p.oldPrice > p.price) ? '<del class="old">' + U.fmtMoney(p.oldPrice, p.currency) + '</del>' : '';
    return '<article class="card rv" data-tilt>' +
      '<div class="card-media" data-view="' + U.esc(p.id) + '" role="button" tabindex="0">' +
        '<img loading="lazy" src="' + U.sanitizeUrl(p.image || 'assets/images/placeholder.svg', 'assets/images/placeholder.svg') + '" alt="' + U.esc(L(p.alt) || L(p.name)) + '">' +
        (badge ? '<span class="badge">' + U.esc(badge) + '</span>' : '') +
        (!p.available ? '<span class="badge off">' + T('card.unavailable') + '</span>' : '') +
        (p.available && !canDelivery ? '<span class="badge nod">' + T('card.noDelivery') + '</span>' : '') +
      '</div>' +
      '<div class="card-body">' +
        '<span class="card-cat">' + U.esc(catName(p.categoryId)) + '</span>' +
        '<h3 data-view="' + U.esc(p.id) + '" role="button" tabindex="0">' + U.esc(L(p.name)) + '</h3>' +
        '<p class="card-desc">' + U.esc(L(p.desc)).slice(0, 110) + '</p>' +
        '<div class="card-foot">' +
          '<div class="price">' + (state.layout.showPrices ? '<strong>' + U.fmtMoney(p.price, p.currency) + '</strong>' + oldP : '') + '</div>' +
          (p.available
            ? '<button class="btn btn-primary btn-sm" data-add="' + U.esc(p.id) + '">' + T('card.add') + '</button>'
            : '<button class="btn btn-disabled btn-sm" disabled>' + T('card.unavailable') + '</button>') +
        '</div>' +
      '</div></article>';
  }

  function openProduct(id) {
    var p = (state.products || []).find(function (x) { return x.id === id; });
    if (!p) return;
    var m = document.getElementById('modal-box');
    m.innerHTML =
      '<div class="modal-card">' +
        '<button class="modal-x" data-close>✕</button>' +
        '<img class="modal-img" src="' + U.sanitizeUrl(p.image || 'assets/images/placeholder.svg', 'assets/images/placeholder.svg') + '" alt="' + U.esc(L(p.alt) || L(p.name)) + '">' +
        '<div class="modal-body">' +
          '<span class="card-cat">' + U.esc(catName(p.categoryId)) + '</span>' +
          '<h3>' + U.esc(L(p.name)) + '</h3>' +
          '<p>' + U.esc(L(p.desc)) + '</p>' +
          (L(p.details) ? '<p class="muted">' + U.esc(L(p.details)) + '</p>' : '') +
          (state.layout.showPrices ? '<div class="price big"><strong>' + U.fmtMoney(p.price, p.currency) + '</strong>' +
            ((p.oldPrice && p.oldPrice > p.price) ? ' <del>' + U.fmtMoney(p.oldPrice, p.currency) + '</del>' : '') + '</div>' : '') +
          '<div class="qty-row"><button data-dec>−</button><span id="m-qty">1</span><button data-inc>+</button></div>' +
          (p.available
            ? '<button class="btn btn-primary btn-block" data-madd>' + T('card.add') + '</button>'
            : '<button class="btn btn-disabled btn-block" disabled>' + T('card.unavailable') + '</button>') +
        '</div></div>';
    m.classList.add('open');
    var qty = 1;
    m.querySelector('[data-inc]').onclick = function () { qty = Math.min(99, qty + 1); m.querySelector('#m-qty').textContent = qty; };
    m.querySelector('[data-dec]').onclick = function () { qty = Math.max(1, qty - 1); m.querySelector('#m-qty').textContent = qty; };
    var addBtn = m.querySelector('[data-madd]');
    if (addBtn) addBtn.onclick = function () { window.Cart.add(p.id, qty); renderCartBadge(); renderCartDrawer(); closeModal(); openCart(); };
    m.querySelector('[data-close]').onclick = closeModal;
    m.onclick = function (e) { if (e.target === m) closeModal(); };
  }
  function closeModal() { document.getElementById('modal-box').classList.remove('open'); }

  function renderAbout() {
    var b = state.business;
    var feats = (b.features || []).map(function (f) { return '<li class="rv">✓ ' + U.esc(L(f)) + '</li>'; }).join('');
    document.getElementById('about-body').innerHTML =
      '<p class="rv">' + U.esc(L(b.description)) + '</p><ul class="feat-grid">' + feats + '</ul>';
  }

  function renderReviews() {
    var b = state.business;
    document.getElementById('reviews-body').innerHTML =
      '<div class="review-card rv"><div class="big-rate">' + U.esc(String(b.rating || '—')) + '</div>' +
      starsHTML(b.rating) +
      '<p>' + U.esc(String(b.reviewsCount || 0)) + ' ' + T('hero.reviews') + ' • ' + T('reviews.based') + '</p></div>';
  }

  function renderLocation() {
    var b = state.business;
    var hours = (b.hours || []).map(function (h) {
      var when = [h.open, h.close].filter(Boolean).join(' – ');
      return '<li><strong>' + U.esc(L(h.day)) + '</strong><span>' + U.esc(when) + (L(h.note) ? ' • ' + U.esc(L(h.note)) : '') + '</span></li>';
    }).join('');
    document.getElementById('hours-list').innerHTML = hours || '';
    document.getElementById('loc-address').textContent = b.address || '';
    var mapBox = document.getElementById('map-frame');
    if (state.layout.showMap && b.mapsUrl) {
      var q = b.address || b.name;
      mapBox.innerHTML = '<iframe title="map" loading="lazy" src="https://www.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed"></iframe>';
      document.getElementById('maps-link').href = U.sanitizeUrl(b.mapsUrl);
    } else {
      mapBox.innerHTML = '<div class="map-fallback"><p>' + U.esc(b.address || '') + '</p><a class="btn btn-ghost" target="_blank" rel="noopener" href="' + U.sanitizeUrl(b.mapsUrl || '#') + '">' + T('location.open') + '</a></div>';
    }
  }

  function renderContact() {
    var b = state.business;
    var s = b.socials || {};
    function soc(key, label) {
      if (!s[key]) return '';
      return '<a class="soc" target="_blank" rel="noopener" href="' + U.sanitizeUrl(s[key]) + '">' + label + '</a>';
    }
    document.getElementById('contact-body').innerHTML =
      (b.phone ? '<a class="c-item" href="tel:' + U.esc(b.phone.replace(/\s/g, '')) + '"><span>' + T('contact.phone') + '</span><strong dir="ltr">' + U.esc(b.phone) + '</strong></a>' : '') +
      (b.email ? '<a class="c-item" href="mailto:' + U.esc(b.email) + '"><span>' + T('contact.email') + '</span><strong>' + U.esc(b.email) + '</strong></a>' : '') +
      (b.website ? '<a class="c-item" target="_blank" rel="noopener" href="' + U.sanitizeUrl(b.website) + '"><span>Website</span><strong>' + U.esc(b.website.replace(/^https?:\/\//, '')) + '</strong></a>' : '') +
      (b.orderUrl ? '<a class="c-item" target="_blank" rel="noopener" href="' + U.sanitizeUrl(b.orderUrl) + '"><span>Order</span><strong>' + U.esc(b.orderUrl.replace(/^https?:\/\//, '')) + '</strong></a>' : '') +
      '<div class="soc-row">' + soc('facebook', 'Facebook') + soc('instagram', 'Instagram') + soc('tiktok', 'TikTok') + soc('telegram', 'Telegram') + soc('youtube', 'YouTube') + soc('x', 'X') + '</div>';
  }

  function renderFooter() {
    var b = state.business;
    document.getElementById('foot-brand').innerHTML = logoHTML() + '<span>' + U.esc(b.name) + '</span>';
    document.getElementById('foot-copy').textContent = '© ' + new Date().getFullYear() + ' ' + b.name + ' — ' + L(b.footerText);
  }

  function applySectionsVisibility() {
    var lay = state.layout;
    (lay.sectionsOrder || []).forEach(function (id) {
      var el = document.querySelector('[data-section="' + id + '"]');
      if (el) el.style.display = lay.sectionsVisible[id] === false ? 'none' : '';
    });
    // ترتيب الأقسام
    var main = document.getElementById('sections');
    (lay.sectionsOrder || []).forEach(function (id) {
      var el = document.querySelector('[data-section="' + id + '"]');
      if (el && main) main.appendChild(el);
    });
  }

  /* ================= السلة ================= */
  function renderCartBadge() {
    var n = window.Cart.count();
    var badge = document.getElementById('cart-count');
    badge.textContent = n;
    badge.style.display = n ? 'inline-flex' : 'none';
  }

  function renderCartDrawer() {
    var ds = window.Cart.detailed();
    var box = document.getElementById('cart-items');
    var dst = window.Cart.deliveryState();
    if (!ds.length) {
      box.innerHTML = '<div class="cart-empty"><p><strong>' + T('cart.empty') + '</strong></p><p class="muted">' + T('cart.emptySub') + '</p></div>';
    } else {
      box.innerHTML = ds.map(function (d) {
        var p = d.product, canD = window.Cart.deliveryOf(p);
        return '<div class="c-line">' +
          '<img src="' + U.sanitizeUrl(p.image || 'assets/images/placeholder.svg', 'assets/images/placeholder.svg') + '" alt="">' +
          '<div class="c-info"><strong>' + U.esc(L(p.name)) + '</strong>' +
          '<span class="muted">' + U.fmtMoney(p.price, p.currency) + (!canD ? ' • ' + T('card.noDelivery') : '') + '</span>' +
          '<div class="qty-row sm"><button data-cdec="' + U.esc(p.id) + '">−</button><span>' + d.line.qty + '</span><button data-cinc="' + U.esc(p.id) + '">+</button>' +
          '<button class="link danger" data-cdel="' + U.esc(p.id) + '">' + T('cart.remove') + '</button></div></div>' +
          '<strong class="c-sum">' + U.fmtMoney((Number(p.price) || 0) * d.line.qty, p.currency) + '</strong></div>';
      }).join('') + (dst.mixed ? '<p class="warn">' + T('cart.deliveryWarn') + '</p>' : '');
    }
    document.getElementById('cart-total').textContent = U.fmtMoney(window.Cart.total(), window.Cart.currency());
    document.getElementById('checkout-btn').disabled = !ds.length;
    box.querySelectorAll('[data-cinc]').forEach(function (b) { b.onclick = function () { window.Cart.setQty(b.getAttribute('data-cinc'), curQty(b.getAttribute('data-cinc')) + 1); renderCartBadge(); renderCartDrawer(); }; });
    box.querySelectorAll('[data-cdec]').forEach(function (b) { b.onclick = function () { window.Cart.setQty(b.getAttribute('data-cdec'), curQty(b.getAttribute('data-cdec')) - 1); renderCartBadge(); renderCartDrawer(); }; });
    box.querySelectorAll('[data-cdel]').forEach(function (b) { b.onclick = function () { window.Cart.remove(b.getAttribute('data-cdel')); renderCartBadge(); renderCartDrawer(); }; });
  }
  function curQty(id) {
    var d = window.Cart.detailed().find(function (x) { return x.product.id === id; });
    return d ? d.line.qty : 0;
  }

  function openCart() { document.getElementById('cart-drawer').classList.add('open'); document.getElementById('overlay').classList.add('open'); }
  function closeCart() { document.getElementById('cart-drawer').classList.remove('open'); document.getElementById('overlay').classList.remove('open'); }

  /* ================= إتمام الطلب ================= */
  function openCheckout() {
    var ds = window.Cart.detailed();
    if (!ds.length) return;
    state = window.Store.load();
    var dst = window.Cart.deliveryState();
    var m = document.getElementById('modal-box');
    var waOk = window.WA.isValid(state.business.whatsapp);
    var typeOpts = '';
    if (dst.any) typeOpts += '<option value="delivery">' + T('co.delivery') + '</option>';
    typeOpts += '<option value="pickup">' + T('co.pickup') + '</option><option value="dinein">' + T('co.dinein') + '</option>';
    m.innerHTML =
      '<div class="modal-card wide"><button class="modal-x" data-close>✕</button><div class="modal-body">' +
      '<h3>' + T('co.title') + '</h3>' +
      (!dst.any ? '<p class="warn">' + T('co.noDeliveryOpt') + '</p>' : (dst.mixed ? '<p class="warn">' + T('cart.deliveryWarn') + '</p>' : '')) +
      '<label>' + T('co.name') + '<input id="f-name" maxlength="60" autocomplete="name"></label>' +
      '<label>' + T('co.phone') + '<input id="f-phone" dir="ltr" maxlength="20" inputmode="tel" autocomplete="tel"></label>' +
      '<label>' + T('co.type') + '<select id="f-type">' + typeOpts + '</select></label>' +
      '<label id="addr-wrap">' + T('co.address') + '<input id="f-addr" maxlength="200"></label>' +
      '<label>' + T('co.notes') + '<textarea id="f-notes" rows="2" maxlength="400"></textarea></label>' +
      '<div class="co-sum">' + ds.map(function (d) {
        return '<div><span>' + U.esc(L(d.product.name)) + ' × ' + d.line.qty + '</span><strong>' + U.fmtMoney((Number(d.product.price) || 0) * d.line.qty, d.product.currency) + '</strong></div>';
      }).join('') + '<div class="grand"><span>' + T('cart.total') + '</span><strong>' + U.fmtMoney(window.Cart.total(), window.Cart.currency()) + '</strong></div></div>' +
      '<p class="err" id="co-err" style="display:none"></p>' +
      '<button class="btn btn-primary btn-block" id="co-submit">' + (waOk ? T('co.via') : T('co.submit')) + '</button>' +
      '</div></div>';
    m.classList.add('open');
    var typeSel = m.querySelector('#f-type'), addrWrap = m.querySelector('#addr-wrap');
    function syncAddr() { addrWrap.style.display = typeSel.value === 'delivery' ? '' : 'none'; }
    typeSel.onchange = syncAddr; syncAddr();
    m.querySelector('[data-close]').onclick = closeModal;
    m.onclick = function (e) { if (e.target === m) closeModal(); };
    m.querySelector('#co-submit').onclick = submitOrder;
  }

  function submitOrder() {
    var m = document.getElementById('modal-box');
    var err = m.querySelector('#co-err');
    function fail(msg) { err.textContent = msg; err.style.display = 'block'; }
    var name = U.sanitizeText(m.querySelector('#f-name').value, 60);
    var phone = U.sanitizeText(m.querySelector('#f-phone').value, 20);
    var type = m.querySelector('#f-type').value;
    var addr = U.sanitizeText(m.querySelector('#f-addr').value, 200);
    var notes = U.sanitizeText(m.querySelector('#f-notes').value, 400);
    if (name.length < 2) return fail(T('co.invalid'));
    if (phone.replace(/\D/g, '').length < 6) return fail(T('co.invalid'));
    var ds = window.Cart.detailed();
    if (!ds.length) return fail(T('co.invalid'));
    var dst = window.Cart.deliveryState();
    if (type === 'delivery') {
      if (!dst.any) return fail(T('co.noDeliveryOpt'));
      if (dst.mixed || !dst.all) return fail(T('co.blocked'));
      if (addr.length < 4) return fail(T('co.invalid'));
    }
    // حفظ الطلب أولًا
    var order = {
      id: U.uid('o'), number: window.Store.nextOrderNumber(),
      createdAt: U.dateTimeStr(), customer: name, phone: phone,
      type: type, address: type === 'delivery' ? addr : '', notes: notes,
      items: ds.map(function (d) {
        return { productId: d.product.id, name: L(d.product.name), price: Number(d.product.price) || 0, qty: d.line.qty, currency: d.product.currency };
      }),
      total: window.Cart.total(), currency: window.Cart.currency(), status: 'pending'
    };
    window.Store.update(function (s) { s.orders.unshift(order); });
    window.Cart.clear(); renderCartBadge(); renderCartDrawer();
    // WhatsApp (رابط فقط — بدون ادعاء API)
    var waNum = state.business.whatsapp;
    var waOk = window.WA.isValid(waNum);
    var msg = window.WA.buildMessage(order, state.business, lang());
    var opened = false;
    if (waOk) opened = window.WA.open(waNum, msg);
    showSuccess(order, waOk, opened, msg);
  }

  function showSuccess(order, waOk, opened, msg) {
    var m = document.getElementById('modal-box');
    m.innerHTML = '<div class="modal-card"><div class="modal-body center">' +
      '<div class="ok-ring">✓</div><h3>' + T('co.success') + '</h3>' +
      '<p class="order-num" dir="ltr">' + U.esc(order.number) + '</p>' +
      '<p class="muted">' + U.fmtMoney(order.total, order.currency) + ' • ' + U.esc(order.createdAt) + '</p>' +
      (waOk
        ? (opened
          ? '<p class="muted">' + (lang() === 'ar' ? 'تم فتح WhatsApp لإرسال تفاصيل الطلب.' : lang() === 'fr' ? 'WhatsApp ouvert pour envoyer les détails.' : 'WhatsApp opened to send the details.') + '</p>'
          : '<p class="warn">' + (lang() === 'ar' ? 'تعذّر فتح WhatsApp تلقائيًا — الطلب محفوظ.' : 'WhatsApp blocked — order saved.') + '</p><button class="btn btn-primary" id="wa-retry">' + T('co.retryWa') + '</button>')
        : '<p class="muted">' + (lang() === 'ar' ? 'سيتواصل معك المطعم لتأكيد الطلب.' : lang() === 'fr' ? 'Le restaurant vous contactera.' : 'The restaurant will contact you.') + '</p>') +
      '<button class="btn btn-ghost" data-close>' + T('cm.close') + '</button></div></div>';
    m.classList.add('open');
    m.querySelector('[data-close]').onclick = closeModal;
    m.onclick = function (e) { if (e.target === m) closeModal(); };
    var retry = m.querySelector('#wa-retry');
    if (retry) retry.onclick = function () { window.WA.open(state.business.whatsapp, msg); };
  }

  /* ================= الدخول للإدارة ================= */
  function openLogin() {
    if (!window.Auth.isSetup()) { location.href = 'admin.html'; return; }
    var m = document.getElementById('modal-box');
    m.innerHTML = '<div class="modal-card"><button class="modal-x" data-close>✕</button><div class="modal-body">' +
      '<h3>' + T('login.title') + '</h3>' +
      '<label>' + T('login.pass') + '<input id="lg-pass" type="password" autocomplete="current-password"></label>' +
      '<p class="err" id="lg-err" style="display:none"></p>' +
      '<button class="btn btn-primary btn-block" id="lg-go">' + T('login.btn') + '</button>' +
      '<p class="center"><a class="link" href="admin.html#recover">' + T('login.forgot') + '</a></p>' +
      '</div></div>';
    m.classList.add('open');
    m.querySelector('[data-close]').onclick = closeModal;
    m.onclick = function (e) { if (e.target === m) closeModal(); };
    var go = function () {
      var v = m.querySelector('#lg-pass').value;
      window.Auth.login(v).then(function (r) {
        if (r.ok) { location.href = 'admin.html'; return; }
        var e = m.querySelector('#lg-err');
        e.textContent = r.reason === 'locked' ? T('login.locked') : T('login.err');
        e.style.display = 'block';
      });
    };
    m.querySelector('#lg-go').onclick = go;
    m.querySelector('#lg-pass').onkeydown = function (e) { if (e.key === 'Enter') go(); };
    setTimeout(function () { m.querySelector('#lg-pass').focus(); }, 60);
  }

  /* ================= ربط عام ================= */
  function syncLangButtons() {
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang());
    });
  }

  function bindGlobal() {
    document.getElementById('burger').onclick = function () { document.getElementById('nav-links').classList.toggle('open'); };
    document.querySelectorAll('#nav-links a').forEach(function (a) {
      a.onclick = function () { document.getElementById('nav-links').classList.remove('open'); };
    });
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.onclick = function () { window.I18N.setLang(b.getAttribute('data-lang')); state = window.Store.load(); renderAll(); };
    });
    document.getElementById('cart-btn').onclick = openCart;
    document.getElementById('cart-close').onclick = closeCart;
    document.getElementById('overlay').onclick = closeCart;
    document.getElementById('checkout-btn').onclick = function () { closeCart(); openCheckout(); };
    document.getElementById('admin-link').onclick = function (e) { e.preventDefault(); openLogin(); };
    document.getElementById('admin-link-m').onclick = function (e) { e.preventDefault(); openLogin(); };
    var s = document.getElementById('search');
    s.addEventListener('input', U.debounce(function () { searchQ = s.value.trim(); renderProducts(); }, 220));
    document.getElementById('clear-filters').onclick = function () { activeCat = 'all'; searchQ = ''; s.value = ''; renderCategories(); renderProducts(); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeCart(); } });
    document.addEventListener('site:lang', function () { state = window.Store.load(); renderAll(); });
  }
})();
