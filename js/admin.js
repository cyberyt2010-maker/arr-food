/* Admin — لوحة تحكم محمية كاملة: كل المحتوى + المظهر + الطلبات + الصوت */
(function () {
  'use strict';
  var U = window.Utils, T = function (k) { return window.I18N.t(k); };
  var lang = function () { return window.I18N.lang(); };
  var L = function (o) { return U.pickLocalized(o, lang()); };
  var state = null;
  var tab = 'overview';
  var knownOrders = {};
  var firstSync = true;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    state = window.Store.load();
    window.I18N.applyDir();
    applyThemeToAdmin();
    if (location.hash === '#recover') return renderRecover();
    if (!window.Auth.isSetup()) return renderSetup();
    if (!window.Auth.isAuthed()) return renderLogin();
    enter();
  }

  function applyThemeToAdmin() {
    var th = (state && state.theme) || {};
    var r = document.documentElement.style;
    ['primary', 'background', 'text', 'secondary', 'button', 'card', 'border'].forEach(function (k) {
      if (th[k]) r.setProperty('--' + k, th[k]);
    });
    r.setProperty('--radius', ((th.radius || 18)) + 'px');
  }

  function el(id) { return document.getElementById(id); }
  function esc(s) { return U.esc(s); }
  function fld(label, inner) { return '<label class="f">' + esc(label) + inner + '</label>'; }
  function inp(id, val, attrs) { return '<input id="' + id + '" value="' + esc(val === undefined ? '' : val) + '" ' + (attrs || '') + '>'; }
  function triRow(prefix, obj, label) {
    obj = obj || {};
    return '<div class="tri"><span class="tri-t">' + esc(label) + '</span>' +
      fld('AR', inp(prefix + '-ar', obj.ar || '')) +
      fld('EN', inp(prefix + '-en', obj.en || '')) +
      fld('FR', inp(prefix + '-fr', obj.fr || '')) + '</div>';
  }
  function triGet(prefix) {
    return {
      ar: U.sanitizeText(el(prefix + '-ar').value, 300),
      en: U.sanitizeText(el(prefix + '-en').value, 300),
      fr: U.sanitizeText(el(prefix + '-fr').value, 300)
    };
  }

  /* ================= البوابة ================= */
  function gateShell(title, body) {
    el('app').innerHTML = '<div class="gate"><div class="gate-card"><h1>' + esc(title) + '</h1>' + body + '</div></div>';
  }

  function renderSetup() {
    gateShell(T('setup.title'),
      fld(T('setup.pass'), '<input id="s-p1" type="password" autocomplete="new-password">') +
      fld(T('setup.confirm'), '<input id="s-p2" type="password" autocomplete="new-password">') +
      [1, 2, 3].map(function (i) {
        return '<div class="qa">' + fld(T('setup.q') + ' ' + i, inp('s-q' + i, '', 'maxlength="120"')) + fld(T('setup.a') + ' ' + i, inp('s-a' + i, '', 'maxlength="80"')) + '</div>';
      }).join('') +
      '<p class="err" id="s-err" style="display:none"></p>' +
      '<button class="btn btn-primary btn-block" id="s-go">' + T('setup.btn') + '</button>' +
      '<p class="muted">⚠️ ' + (lang() === 'ar' ? 'النسخة التجارية تحتاج Backend مع تشفير وجلسات آمنة.' : 'Production needs a backend with hashing & secure sessions.') + '</p>');
    el('s-go').onclick = function () {
      var qa = [1, 2, 3].map(function (i) { return { q: el('s-q' + i).value, a: el('s-a' + i).value }; });
      window.Auth.setup(el('s-p1').value, el('s-p2').value, qa).then(function (r) {
        if (r.ok) { location.hash = ''; location.reload(); return; }
        var e = el('s-err');
        e.textContent = r.reason === 'mismatch' ? T('setup.mismatch') : r.reason === 'weak' ? T('setup.weak') : T('setup.need3');
        e.style.display = 'block';
      });
    };
  }

  function renderLogin() {
    gateShell(T('login.title'),
      fld(T('login.pass'), '<input id="l-p" type="password" autocomplete="current-password">') +
      '<p class="err" id="l-err" style="display:none"></p>' +
      '<button class="btn btn-primary btn-block" id="l-go">' + T('login.btn') + '</button>' +
      '<p class="center"><button class="link" id="l-rec">' + T('login.forgot') + '</button></p>');
    var go = function () {
      window.Auth.login(el('l-p').value).then(function (r) {
        if (r.ok) { location.reload(); return; }
        var e = el('l-err');
        e.textContent = r.reason === 'locked' ? T('login.locked') : T('login.err');
        e.style.display = 'block';
      });
    };
    el('l-go').onclick = go;
    el('l-p').onkeydown = function (e) { if (e.key === 'Enter') go(); };
    el('l-rec').onclick = renderRecover;
  }

  function renderRecover() {
    var qs = window.Auth.recoveryQuestions();
    if (!qs.length) { location.hash = ''; return init(); }
    gateShell(T('login.forgot'),
      qs.map(function (q, i) { return fld((i + 1) + '. ' + q, inp('r-a' + i, '', 'maxlength="80"')); }).join('') +
      fld(T('setup.pass'), '<input id="r-p" type="password" autocomplete="new-password">') +
      '<p class="err" id="r-err" style="display:none"></p>' +
      '<button class="btn btn-primary btn-block" id="r-go">' + T('cm.save') + '</button>');
    el('r-go').onclick = function () {
      var ans = qs.map(function (_, i) { return el('r-a' + i).value; });
      window.Auth.recover(ans, el('r-p').value).then(function (r) {
        if (r.ok) { location.hash = ''; location.reload(); return; }
        var e = el('r-err');
        e.textContent = (lang() === 'ar' ? 'إجابة خاطئة أو كلمة مرور ضعيفة.' : 'Wrong answer or weak password.');
        e.style.display = 'block';
      });
    };
  }

  /* ================= الهيكل ================= */
  var TABS = [
    ['overview', 'admin.overview', '📊'], ['import', 'admin.import', '📥'],
    ['info', 'admin.info', '🏪'], ['theme', 'admin.theme', '🎨'],
    ['media', 'admin.media', '🖼️'], ['products', 'admin.products', '🍗'],
    ['cats', 'admin.cats', '🗂️'], ['orders', 'admin.orders', '🧾'],
    ['wa', 'admin.wa', '💬'], ['security', 'admin.security', '🔒'],
    ['data', 'admin.data', '⚙️']
  ];

  function enter() {
    state = window.Store.load();
    (state.orders || []).forEach(function (o) { knownOrders[o.id] = true; });
    el('app').innerHTML =
      '<header class="a-top"><button id="a-burger">☰</button><strong>' + T('admin.title') + ' — ' + esc(state.business.name) + '</strong>' +
      '<span class="a-top-r"><span id="ord-badge" class="ord-badge" style="display:none"></span>' +
      '<a class="btn btn-ghost btn-sm" target="_blank" href="index.html">' + T('admin.view') + '</a>' +
      '<button class="btn btn-ghost btn-sm" id="a-logout">' + T('admin.logout') + '</button></span></header>' +
      '<div class="a-wrap"><aside class="a-side" id="a-side"></aside><main class="a-main" id="a-main"></main></div>' +
      '<div class="modal" id="m-box"></div>';
    el('a-logout').onclick = function () { window.Auth.logout(); location.href = 'index.html'; };
    el('a-burger').onclick = function () { el('a-side').classList.toggle('open'); };
    renderSide();
    renderTab();
    updateOrdBadge();
    // مراقبة الطلبات الجديدة بين التبويبات
    window.addEventListener('storage', function (e) {
      if (e.key === window.Schema.STORE_KEY || e.key === '__site_ping') {
        state = window.Store.load();
        checkNewOrders();
        if (tab === 'orders' || tab === 'overview') renderTab();
        updateOrdBadge();
      }
    });
    firstSync = false;
  }

  function renderSide() {
    el('a-side').innerHTML = TABS.map(function (t) {
      return '<button class="a-link' + (tab === t[0] ? ' active' : '') + '" data-tab="' + t[0] + '"><span>' + t[2] + '</span> ' + T(t[1]) + '</button>';
    }).join('');
    el('a-side').querySelectorAll('[data-tab]').forEach(function (b) {
      b.onclick = function () { tab = b.getAttribute('data-tab'); renderSide(); renderTab(); el('a-side').classList.remove('open'); window.scrollTo(0, 0); };
    });
  }

  function renderTab() {
    state = window.Store.load();
    applyThemeToAdmin();
    var m = el('a-main');
    var fn = {
      overview: vOverview, import: vImport, info: vInfo, theme: vTheme,
      media: vMedia, products: vProducts, cats: vCats, orders: vOrders,
      wa: vWA, security: vSecurity, data: vData
    }[tab];
    m.innerHTML = fn ? fn() : '';
    var binder = { overview: bOverview, import: bImport, info: bInfo, theme: bTheme, media: bMedia, products: bProducts, cats: bCats, orders: bOrders, wa: bWA, security: bSecurity, data: bData }[tab];
    if (binder) binder();
  }

  function updateOrdBadge() {
    var n = (state.orders || []).filter(function (o) { return o.status === 'pending'; }).length;
    var b = el('ord-badge');
    if (!b) return;
    b.style.display = n ? 'inline-flex' : 'none';
    b.textContent = n;
  }

  function checkNewOrders() {
    var fresh = [];
    (state.orders || []).forEach(function (o) {
      if (!knownOrders[o.id]) { knownOrders[o.id] = true; fresh.push(o); }
    });
    if (fresh.length && !firstSync) {
      if (state.settings.soundEnabled) window.Effects.playNewOrderTone();
      U.toast('🔔 ' + T('ov.new') + ' ' + fresh[0].number, 'ok');
      try {
        if (window.Notification && Notification.permission === 'granted') {
          new Notification(T('ov.new'), { body: fresh[0].number + ' — ' + fresh[0].customer });
        }
      } catch (e) { /* noop */ }
    }
  }

  /* ================= نظرة عامة ================= */
  function vOverview() {
    var pct = window.Schema.computeCompleteness(state);
    var imgs = (state.media || []).length + (state.products || []).filter(function (p) { return p.image; }).length + (state.hero.image ? 1 : 0);
    var cards = [
      [T('ov.complete'), pct + '%', 'pct'],
      [T('ov.products'), (state.products || []).length, ''],
      [T('ov.cats'), (state.categories || []).length, ''],
      [T('ov.orders'), (state.orders || []).length, ''],
      [T('ov.images'), imgs, '']
    ];
    var latest = (state.orders || []).slice(0, 5).map(function (o) {
      return '<li><span dir="ltr">' + esc(o.number) + '</span><span>' + esc(o.customer) + '</span><b>' + U.fmtMoney(o.total, o.currency) + '</b><i>' + T('st.' + o.status) + '</i></li>';
    }).join('');
    return '<h2>📊 ' + T('admin.overview') + '</h2>' +
      '<div class="stat-grid">' + cards.map(function (c) { return '<div class="stat"><span>' + c[0] + '</span><strong>' + c[1] + '</strong></div>'; }).join('') + '</div>' +
      '<div class="panel"><h3>' + T('ov.analyzed') + '</h3><p>✓ ' + T('ov.fields') + ': <strong>' + esc(String(state.meta.fieldsExtracted || 0)) + '</strong> • ' + T('ov.products') + ': <strong>' + state.products.length + '</strong> • ' + T('ov.images') + ': <strong>' + imgs + '</strong></p>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="panel"><h3>' + T('ov.latest') + '</h3>' + ((state.orders || []).length ? '<ul class="o-list">' + latest + '</ul>' : '<p class="muted">' + T('ov.noOrders') + '</p>') + '</div>' +
      '<div class="panel"><h3>⚡</h3><div class="row">' +
      '<button class="btn btn-ghost" data-go="products">🍗 ' + T('admin.products') + '</button>' +
      '<button class="btn btn-ghost" data-go="orders">🧾 ' + T('admin.orders') + '</button>' +
      '<button class="btn btn-ghost" data-go="theme">🎨 ' + T('admin.theme') + '</button>' +
      '<button class="btn btn-ghost" data-go="wa">💬 ' + T('admin.wa') + '</button></div></div>';
  }
  function bOverview() {
    el('a-main').querySelectorAll('[data-go]').forEach(function (b) {
      b.onclick = function () { tab = b.getAttribute('data-go'); renderSide(); renderTab(); };
    });
  }

  /* ================= استيراد Google Maps ================= */
  var lastAnalysis = null;
  function vImport() {
    return '<h2>📥 ' + T('admin.import') + '</h2><div class="panel">' +
      fld(lang() === 'ar' ? 'الصق جميع معلومات المطعم أو الفندق أو الشركة من Google Maps هنا' : lang() === 'fr' ? 'Collez ici toutes les infos Google Maps' : 'Paste all Google Maps business info here',
        '<textarea id="im-raw" rows="12" placeholder="KFC&#10;4.6&#10;(443)…"></textarea>') +
      '<div class="row"><button class="btn btn-primary" id="im-go">' + (lang() === 'ar' ? 'تحليل البيانات وتحديث الموقع' : lang() === 'fr' ? 'Analyser et mettre à jour' : 'Analyze & Update') + '</button></div>' +
      '<div id="im-out"></div></div>';
  }
  function bImport() {
    var go = U.throttle(function () {
      var raw = el('im-raw').value;
      if (!raw.trim()) return;
      lastAnalysis = window.GMapsParser.analyze(raw);
      var s = lastAnalysis.stats;
      var sug = lastAnalysis.suggestedProducts.map(function (p) { return '<li>' + esc(L(p.name)) + '</li>'; }).join('');
      el('im-out').innerHTML = '<div class="panel in"><h3>✓ ' + (lang() === 'ar' ? 'نتيجة التحليل' : 'Analysis result') + '</h3>' +
        '<p>' + T('ov.fields') + ': <strong>' + s.fieldsExtracted + '</strong> • ' + T('ov.products') + ' (' + (lang() === 'ar' ? 'مقترحة' : 'suggested') + '): <strong>' + s.productsFound + '</strong> • ' + T('ov.images') + ': <strong>' + s.imagesFound + '</strong></p>' +
        (sug ? '<ul class="o-list">' + sug + '</ul>' : '') +
        '<div class="row"><button class="btn btn-primary" id="im-merge">' + (lang() === 'ar' ? 'تحديث (حماية البيانات اليدوية)' : 'Smart update (keep manual data)') + '</button>' +
        '<button class="btn btn-ghost" id="im-full">' + (lang() === 'ar' ? 'استبدال كامل' : 'Full replace') + '</button></div></div>';
      el('im-merge').onclick = function () { applyImport('merge'); };
      el('im-full').onclick = function () { if (confirm(T('cm.confirmDel'))) applyImport('full'); };
    }, 1200);
    el('im-go').onclick = function () { go(); };
  }
  function applyImport(mode) {
    if (!lastAnalysis) return;
    window.Store.update(function (s) { window.GMapsParser.applyPatch(s, lastAnalysis, mode); });
    state = window.Store.load();
    U.toast(T('cm.saved'));
    renderTab();
  }

  /* ================= المعلومات ================= */
  function vInfo() {
    var b = state.business;
    var hours = (b.hours || []).map(function (h, i) {
      return '<div class="h-row" data-h="' + i + '">' + inp('h-d-ar' + i, L(h.day) === h.day.en && lang() !== 'ar' ? '' : (h.day.ar || ''), 'maxlength="40" placeholder="AR"') +
        inp('h-open' + i, h.open || '', 'maxlength="10" placeholder="09:00"') + inp('h-close' + i, h.close || '', 'maxlength="10" placeholder="22:00"') +
        inp('h-n' + i, (h.note && (h.note.ar || h.note.en)) || '', 'maxlength="80"') +
        '<button class="btn btn-ghost btn-sm" data-hdel="' + i + '">✕</button></div>';
    }).join('');
    var feats = (b.features || []).map(function (f, i) {
      return '<div class="h-row">' + inp('f-ar' + i, f.ar || '', 'maxlength="60"') + inp('f-en' + i, f.en || '', 'maxlength="60"') + inp('f-fr' + i, f.fr || '', 'maxlength="60"') + '<button class="btn btn-ghost btn-sm" data-fdel="' + i + '">✕</button></div>';
    }).join('');
    var s = b.socials || {};
    return '<h2>🏪 ' + T('admin.info') + '</h2><div class="panel"><div class="grid2">' +
      fld(lang() === 'ar' ? 'الاسم' : 'Name', inp('b-name', b.name, 'maxlength="80"')) +
      fld(lang() === 'ar' ? 'الهاتف' : 'Phone', inp('b-phone', b.phone, 'maxlength="25" dir="ltr"')) +
      fld('Email', inp('b-email', b.email, 'maxlength="80" dir="ltr"')) +
      fld(lang() === 'ar' ? 'العنوان' : 'Address', inp('b-addr', b.address, 'maxlength="200"')) +
      fld('Google Maps URL', inp('b-maps', b.mapsUrl, 'maxlength="500" dir="ltr"')) +
      fld('Plus Code', inp('b-plus', b.plusCode || '', 'maxlength="120"')) +
      fld(lang() === 'ar' ? 'الأسعار' : 'Prices', inp('b-price', b.priceRange || '', 'maxlength="40"')) +
      fld('Website', inp('b-web', b.website || '', 'maxlength="200" dir="ltr"')) +
      fld('Order URL', inp('b-order', b.orderUrl || '', 'maxlength="200" dir="ltr"')) +
      fld('WhatsApp', inp('b-wa', b.whatsapp || '', 'maxlength="20" dir="ltr" placeholder="+380…"')) +
      fld(lang() === 'ar' ? 'التقييم (0-5)' : 'Rating', inp('b-rate', b.rating || '', 'maxlength="4" inputmode="decimal"')) +
      fld(lang() === 'ar' ? 'عدد المراجعات' : 'Reviews', inp('b-rev', b.reviewsCount || '', 'maxlength="10" inputmode="numeric"')) +
      fld('Lat', inp('b-lat', b.lat || '', 'maxlength="20"')) + fld('Lng', inp('b-lng', b.lng || '', 'maxlength="20"')) +
      '</div>' +
      triRow('b-tag', b.tagline, lang() === 'ar' ? 'الجملة التعريفية' : 'Tagline') +
      '<div class="tri"><span class="tri-t">' + (lang() === 'ar' ? 'الوصف' : 'Description') + '</span>' +
      fld('AR', '<textarea id="b-desc-ar" rows="3" maxlength="600">' + esc(b.description.ar || '') + '</textarea>') +
      fld('EN', '<textarea id="b-desc-en" rows="3" maxlength="600">' + esc(b.description.en || '') + '</textarea>') +
      fld('FR', '<textarea id="b-desc-fr" rows="3" maxlength="600">' + esc(b.description.fr || '') + '</textarea>') + '</div>' +
      triRow('b-type', b.type, lang() === 'ar' ? 'نوع النشاط' : 'Business type') +
      triRow('b-cui', b.cuisine, lang() === 'ar' ? 'المطبخ / الخدمة' : 'Cuisine') +
      '<h3>' + T('location.hours') + '</h3><div id="h-box">' + hours + '</div><button class="btn btn-ghost btn-sm" id="h-add">+ ' + T('cm.add') + '</button>' +
      '<h3>' + T('about.features') + '</h3><div id="f-box">' + feats + '</div><button class="btn btn-ghost btn-sm" id="f-add">+ ' + T('cm.add') + '</button>' +
      '<h3>Social</h3><div class="grid2">' +
      ['facebook', 'instagram', 'tiktok', 'telegram', 'youtube', 'x'].map(function (k) { return fld(k, inp('soc-' + k, s[k] || '', 'maxlength="200" dir="ltr"')); }).join('') + '</div>' +
      '<h3>Logo</h3><div class="row"><img id="logo-prev" src="' + U.sanitizeUrl(b.logoImage || 'assets/images/placeholder.svg', 'assets/images/placeholder.svg') + '" alt="logo"><button class="btn btn-ghost" id="logo-pick">' + (lang() === 'ar' ? 'اختيار صورة من الجهاز' : 'Choose from device') + '</button><button class="btn btn-ghost" id="logo-del">' + T('cm.delete') + '</button></div>' +
      triRow('b-foot', typeof b.footerText === 'string' ? { ar: b.footerText } : b.footerText, 'Footer') +
      '<div class="row"><button class="btn btn-primary" id="b-save">' + T('cm.save') + '</button></div></div>';
  }
  function bInfo() {
    el('h-add').onclick = function () { window.Store.update(function (s) { s.business.hours.push({ day: window.Schema.L('', '', ''), open: '', close: '', note: window.Schema.L('', '', '') }); }); renderTab(); };
    el('f-add').onclick = function () { window.Store.update(function (s) { s.business.features.push(window.Schema.L('', '', '')); }); renderTab(); };
    el('a-main').querySelectorAll('[data-hdel]').forEach(function (b) { b.onclick = function () { var i = +b.getAttribute('data-hdel'); window.Store.update(function (s) { s.business.hours.splice(i, 1); }); renderTab(); }; });
    el('a-main').querySelectorAll('[data-fdel]').forEach(function (b) { b.onclick = function () { var i = +b.getAttribute('data-fdel'); window.Store.update(function (s) { s.business.features.splice(i, 1); }); renderTab(); }; });
    el('logo-pick').onclick = function () {
      window.Media.chooseFromDevice('image', function () {}).then(function (r) {
        if (!r) return;
        window.Store.set('business.logoImage', r.dataUrl);
        el('logo-prev').src = r.dataUrl;
        U.toast(T('cm.saved'));
      });
    };
    el('logo-del').onclick = function () { window.Store.set('business.logoImage', ''); renderTab(); };
    el('b-save').onclick = function () {
      var b = window.Store.get('business');
      var nb = {
        name: U.sanitizeText(el('b-name').value, 80) || b.name,
        phone: U.sanitizeText(el('b-phone').value, 25),
        email: U.sanitizeText(el('b-email').value, 80),
        address: U.sanitizeText(el('b-addr').value, 200),
        mapsUrl: U.sanitizeText(el('b-maps').value, 500),
        plusCode: U.sanitizeText(el('b-plus').value, 120),
        priceRange: U.sanitizeText(el('b-price').value, 40),
        website: U.sanitizeText(el('b-web').value, 200),
        orderUrl: U.sanitizeText(el('b-order').value, 200),
        whatsapp: U.sanitizeText(el('b-wa').value, 20),
        rating: U.clamp(parseFloat(el('b-rate').value) || 0, 0, 5),
        reviewsCount: Math.max(0, parseInt(el('b-rev').value, 10) || 0),
        lat: U.sanitizeText(el('b-lat').value, 20), lng: U.sanitizeText(el('b-lng').value, 20),
        tagline: triGet('b-tag'), type: triGet('b-type'), cuisine: triGet('b-cui'),
        description: {
          ar: U.sanitizeText(el('b-desc-ar').value, 600), en: U.sanitizeText(el('b-desc-en').value, 600), fr: U.sanitizeText(el('b-desc-fr').value, 600)
        },
        footerText: triGet('b-foot')
      };
      if (nb.email && !U.isEmail(nb.email)) { U.toast('Email ✕', 'err'); return; }
      // الساعات والمميزات
      nb.hours = (b.hours || []).map(function (_, i) {
        return {
          day: { ar: U.sanitizeText(el('h-d-ar' + i).value, 40), en: U.sanitizeText(el('h-d-ar' + i).value, 40), fr: '' },
          open: U.sanitizeText(el('h-open' + i).value, 10), close: U.sanitizeText(el('h-close' + i).value, 10),
          note: { ar: U.sanitizeText(el('h-n' + i).value, 80), en: '', fr: '' }
        };
      });
      nb.features = (b.features || []).map(function (_, i) {
        return { ar: U.sanitizeText(el('f-ar' + i).value, 60), en: U.sanitizeText(el('f-en' + i).value, 60), fr: U.sanitizeText(el('f-fr' + i).value, 60) };
      });
      ['facebook', 'instagram', 'tiktok', 'telegram', 'youtube', 'x'].forEach(function (k) { nb.socials = nb.socials || {}; });
      nb.socials = {};
      ['facebook', 'instagram', 'tiktok', 'telegram', 'youtube', 'x'].forEach(function (k) { nb.socials[k] = U.sanitizeText(el('soc-' + k).value, 200); });
      window.Store.update(function (s) { Object.assign(s.business, nb); });
      state = window.Store.load();
      U.toast(T('cm.saved'));
    };
  }

  /* ================= المظهر ================= */
  var COLOR_KEYS = ['primary', 'background', 'text', 'secondary', 'button', 'card', 'border', 'header', 'footer', 'alert', 'price'];
  function vTheme() {
    var th = state.theme, lay = state.layout;
    var presets = Object.keys(window.Schema.THEME_PRESETS).map(function (k) {
      var p = window.Schema.THEME_PRESETS[k];
      return '<button class="preset' + (th.preset === k ? ' active' : '') + '" data-preset="' + k + '"><i style="background:' + p.primary + '"></i><i style="background:' + p.secondary + '"></i><i style="background:' + p.background + '"></i><span>' + esc(L(p.label)) + '</span></button>';
    }).join('');
    var colors = COLOR_KEYS.map(function (k) {
      return '<label class="f color">' + k + '<span><input type="color" id="c-' + k + '" value="' + esc(th[k] || '#000000') + '"><input id="c-' + k + '-hex" value="' + esc(th[k] || '') + '" maxlength="9" dir="ltr"></span></label>';
    }).join('');
    var fonts = window.Schema.FONT_CHOICES.map(function (f) { return '<option' + (th.headingFont === f ? ' selected' : '') + '>' + f + '</option>'; }).join('');
    var fonts2 = window.Schema.FONT_CHOICES.map(function (f) { return '<option' + (th.bodyFont === f ? ' selected' : '') + '>' + f + '</option>'; }).join('');
    var secs = lay.sectionsOrder.map(function (id, i) {
      var vis = lay.sectionsVisible[id] !== false;
      return '<li><span>' + esc(id) + '</span><span><button class="btn btn-ghost btn-sm" data-up="' + i + '">↑</button><button class="btn btn-ghost btn-sm" data-dn="' + i + '">↓</button><button class="btn btn-ghost btn-sm" data-vis="' + id + '">' + (vis ? '👁️' : '🚫') + '</button></span></li>';
    }).join('');
    return '<h2>🎨 ' + T('admin.theme') + '</h2>' +
      '<div class="panel"><h3>Presets</h3><div class="preset-row">' + presets + '</div></div>' +
      '<div class="panel"><h3>' + (lang() === 'ar' ? 'الألوان' : 'Colors') + '</h3><div class="color-grid">' + colors + '</div></div>' +
      '<div class="panel"><h3>Fonts</h3><div class="grid2">' +
      fld('Heading font', '<select id="t-hf">' + fonts + '</select>') + fld('Body font', '<select id="t-bf">' + fonts2 + '</select>') +
      fld(lang() === 'ar' ? 'حجم العناوين' : 'Heading size', '<input id="t-hs" type="number" min="28" max="72" value="' + (th.headingSize || 46) + '">') +
      fld('Weight', '<select id="t-fw"><option value="700">700</option><option value="800"' + (th.fontWeight === 800 ? ' selected' : '') + '>800</option><option value="900"' + (th.fontWeight === 900 ? ' selected' : '') + '>900</option></select>') +
      fld('Border Radius', '<input id="t-rad" type="number" min="0" max="40" value="' + (th.radius || 18) + '">') +
      fld('Shadow', '<select id="t-sh">' + ['none', 'soft', 'medium', 'strong'].map(function (s) { return '<option' + (th.shadow === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>') +
      fld('Button style', '<select id="t-bs">' + ['rounded', 'pill', 'square'].map(function (s) { return '<option' + (th.buttonStyle === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>') +
      '</div><div class="row"><button class="btn btn-primary" id="t-save">' + T('cm.save') + '</button>' +
      '<button class="btn btn-ghost" id="t-reset">' + (lang() === 'ar' ? 'إعادة الافتراضي' : 'Reset default') + '</button>' +
      '<a class="btn btn-ghost" target="_blank" href="index.html">' + T('cm.preview') + ' ↗</a></div></div>' +
      '<div class="panel"><h3>' + (lang() === 'ar' ? 'الأقسام والترتيب' : 'Sections') + '</h3><ul class="sec-list">' + secs + '</ul><div class="grid2">' +
      fld('Hero style', '<select id="l-hero">' + ['split-3d', 'center', 'banner'].map(function (s) { return '<option' + (lay.heroStyle === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>') +
      fld('Card style', '<select id="l-card">' + ['modern', 'classic', 'minimal'].map(function (s) { return '<option' + (lay.cardStyle === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>') +
      fld(lang() === 'ar' ? 'الأعمدة' : 'Columns', '<select id="l-cols">' + [2, 3, 4].map(function (s) { return '<option' + (lay.columns === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>') +
      '</div><div class="row">' +
      [['showRating', T('reviews.title')], ['showMap', 'Map'], ['showContact', T('nav.contact')], ['showPrices', T('ov.products') + ' $']].map(function (x) {
        return '<label class="chk"><input type="checkbox" id="l-' + x[0] + '"' + (lay[x[0]] ? ' checked' : '') + '> ' + x[1] + '</label>';
      }).join('') + '</div><div class="row"><button class="btn btn-primary" id="l-save">' + T('cm.save') + '</button></div></div>';
  }
  function bTheme() {
    var main = el('a-main');
    main.querySelectorAll('[data-preset]').forEach(function (b) {
      b.onclick = function () {
        var p = window.Schema.THEME_PRESETS[b.getAttribute('data-preset')];
        window.Store.update(function (s) { Object.assign(s.theme, p, { preset: b.getAttribute('data-preset') }); });
        renderTab(); U.toast(T('cm.saved'));
      };
    });
    // معاينة لونية فورية
    COLOR_KEYS.forEach(function (k) {
      var c = el('c-' + k), hx = el('c-' + k + '-hex');
      if (!c) return;
      c.oninput = function () { hx.value = c.value; document.documentElement.style.setProperty('--' + k, c.value); };
      hx.onchange = function () { if (/^#[0-9a-fA-F]{3,8}$/.test(hx.value.trim())) { c.value = hx.value.trim().slice(0, 7); c.oninput(); } };
    });
    main.querySelectorAll('[data-up]').forEach(function (b) { b.onclick = function () { moveSec(+b.getAttribute('data-up'), -1); }; });
    main.querySelectorAll('[data-dn]').forEach(function (b) { b.onclick = function () { moveSec(+b.getAttribute('data-dn'), 1); }; });
    main.querySelectorAll('[data-vis]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-vis');
        window.Store.update(function (s) { s.layout.sectionsVisible[id] = s.layout.sectionsVisible[id] === false; });
        renderTab();
      };
    });
    el('t-save').onclick = function () {
      var patch = {};
      COLOR_KEYS.forEach(function (k) { var v = el('c-' + k + '-hex').value.trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(v)) patch[k] = v; });
      patch.headingFont = el('t-hf').value; patch.bodyFont = el('t-bf').value;
      patch.headingSize = U.clamp(parseInt(el('t-hs').value, 10) || 46, 28, 72);
      patch.fontWeight = parseInt(el('t-fw').value, 10) || 800;
      patch.radius = U.clamp(parseInt(el('t-rad').value, 10) || 18, 0, 40);
      patch.shadow = el('t-sh').value; patch.buttonStyle = el('t-bs').value;
      window.Store.update(function (s) { Object.assign(s.theme, patch); });
      U.toast(T('cm.saved')); renderTab();
    };
    el('t-reset').onclick = function () {
      var p = window.Schema.THEME_PRESETS['kfc-red'];
      window.Store.update(function (s) {
        s.theme = Object.assign({ preset: 'kfc-red' }, p, { headingFont: 'Cairo', bodyFont: 'Tajawal', headingSize: 46, fontWeight: 800, radius: 18, shadow: 'medium', buttonStyle: 'rounded' });
      });
      renderTab(); U.toast(T('cm.saved'));
    };
    el('l-save').onclick = function () {
      window.Store.update(function (s) {
        s.layout.heroStyle = el('l-hero').value; s.layout.cardStyle = el('l-card').value;
        s.layout.columns = parseInt(el('l-cols').value, 10) || 3;
        s.layout.showRating = el('l-showRating').checked; s.layout.showMap = el('l-showMap').checked;
        s.layout.showContact = el('l-showContact').checked; s.layout.showPrices = el('l-showPrices').checked;
      });
      U.toast(T('cm.saved'));
    };
  }
  function moveSec(i, d) {
    window.Store.update(function (s) {
      var a = s.layout.sectionsOrder, j = i + d;
      if (j < 0 || j >= a.length) return;
      var t = a[i]; a[i] = a[j]; a[j] = t;
    });
    renderTab();
  }

  /* ================= الوسائط ================= */
  function vMedia() {
    var items = (state.media || []).map(function (m) {
      var prev = m.kind === 'video'
        ? '<video src="' + U.sanitizeUrl(m.src) + '" muted></video>'
        : '<img loading="lazy" src="' + U.sanitizeUrl(m.src, 'assets/images/placeholder.svg') + '" alt="' + esc(m.alt || '') + '">';
      return '<div class="g-item">' + prev +
        '<div class="g-meta"><input data-alt="' + m.id + '" value="' + esc(m.alt || '') + '" maxlength="120" placeholder="Alt"><div class="row">' +
        '<button class="btn btn-ghost btn-sm" data-hero="' + m.id + '">Hero</button>' +
        '<button class="btn btn-ghost btn-sm" data-gdel="' + m.id + '">' + T('cm.delete') + '</button></div></div></div>';
    }).join('');
    return '<h2>🖼️ ' + T('admin.media') + '</h2>' +
      '<div class="panel"><h3>Hero</h3><div class="row"><img id="hero-prev" src="' + U.sanitizeUrl(state.hero.image || 'assets/images/placeholder.svg', 'assets/images/placeholder.svg') + '" alt="hero">' +
      '<button class="btn btn-primary" id="hero-pick">' + (lang() === 'ar' ? 'اختيار صورة من الجهاز' : 'Choose image from device') + '</button>' +
      '<button class="btn btn-ghost" id="hero-vid">' + (lang() === 'ar' ? 'اختيار فيديو من الجهاز' : 'Choose video from device') + '</button>' +
      (state.hero.video ? '<button class="btn btn-ghost" id="hero-viddel">🎬✕</button>' : '') + '</div>' +
      '<p class="muted" id="up-status"></p>' +
      fld('Alt', inp('hero-alt', (state.hero.alt && state.hero.alt.ar) || '', 'maxlength="120"')) +
      '<div class="row"><button class="btn btn-ghost" id="hero-url-add">+ URL</button>' + inp('hero-url', '', 'maxlength="500" dir="ltr" placeholder="https://…"') + '</div></div>' +
      '<div class="panel"><h3>' + (lang() === 'ar' ? 'المعرض' : 'Gallery') + ' (' + (state.media || []).length + ')</h3>' +
      '<div class="row"><button class="btn btn-primary" id="g-pick">' + (lang() === 'ar' ? 'إضافة صور من الجهاز' : 'Add images from device') + '</button></div>' +
      '<div class="g-grid">' + (items || '<p class="muted">—</p>') + '</div></div>';
  }
  function upStatus(msg) { var s = el('up-status'); if (s) s.textContent = msg; }
  function bMedia() {
    el('hero-pick').onclick = function () {
      upStatus('…');
      window.Media.chooseFromDevice('image', upStatus).then(function (r) {
        if (!r) { upStatus(lang() === 'ar' ? 'فشل الرفع أو تم الإلغاء.' : 'Upload failed/cancelled.'); return; }
        window.Store.update(function (s) { s.hero.image = r.dataUrl; });
        upStatus(lang() === 'ar' ? 'تم الرفع ✓' : 'Uploaded ✓');
        renderTab();
      });
    };
    el('hero-vid').onclick = function () {
      upStatus('…');
      window.Media.chooseFromDevice('video', upStatus).then(function (r) {
        if (!r) { upStatus(lang() === 'ar' ? 'فشل الرفع.' : 'Upload failed.'); return; }
        window.Store.update(function (s) { s.hero.video = r.dataUrl; });
        upStatus(lang() === 'ar' ? 'تم الرفع ✓' : 'Uploaded ✓');
        renderTab();
      });
    };
    var vd = el('hero-viddel');
    if (vd) vd.onclick = function () { window.Store.set('hero.video', ''); renderTab(); };
    el('hero-alt').onchange = function () {
      window.Store.update(function (s) { s.hero.alt = { ar: U.sanitizeText(el('hero-alt').value, 120), en: '', fr: '' }; });
      U.toast(T('cm.saved'));
    };
    el('hero-url-add').onclick = function () {
      var u = U.sanitizeText(el('hero-url').value, 500);
      if (!window.Media.isExternalImageUrl(u)) { U.toast('URL ✕', 'err'); return; }
      window.Store.set('hero.image', u);
      renderTab(); U.toast(T('cm.saved'));
    };
    el('g-pick').onclick = function () {
      window.Media.chooseFromDevice('image', function () {}).then(function (r) {
        if (!r) return;
        window.Store.update(function (s) { s.media.unshift({ id: U.uid('m'), kind: 'image', src: r.dataUrl, alt: '', tag: 'gallery', createdAt: U.dateTimeStr() }); });
        renderTab(); U.toast(T('cm.saved'));
      });
    };
    el('a-main').querySelectorAll('[data-gdel]').forEach(function (b) {
      b.onclick = function () {
        if (!confirm(T('cm.confirmDel'))) return;
        var id = b.getAttribute('data-gdel');
        window.Store.update(function (s) { s.media = s.media.filter(function (m) { return m.id !== id; }); });
        renderTab();
      };
    });
    el('a-main').querySelectorAll('[data-hero]').forEach(function (b) {
      b.onclick = function () {
        var m = (state.media || []).find(function (x) { return x.id === b.getAttribute('data-hero'); });
        if (m && m.kind === 'image') { window.Store.set('hero.image', m.src); U.toast(T('cm.saved')); renderTab(); }
      };
    });
    el('a-main').querySelectorAll('[data-alt]').forEach(function (i) {
      i.onchange = function () {
        var id = i.getAttribute('data-alt');
        window.Store.update(function (s) { var m = s.media.find(function (x) { return x.id === id; }); if (m) m.alt = U.sanitizeText(i.value, 120); });
        U.toast(T('cm.saved'));
      };
    });
  }

  /* ================= المنتجات ================= */
  function vProducts() {
    var rows = (state.products || []).slice().sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); }).map(function (p) {
      var c = (state.categories || []).find(function (x) { return x.id === p.categoryId; });
      return '<tr><td><img class="t-img" src="' + U.sanitizeUrl(p.image || 'assets/images/placeholder.svg', 'assets/images/placeholder.svg') + '" alt=""></td>' +
        '<td><strong>' + esc(L(p.name)) + '</strong><br><small>' + esc((c && L(c.name)) || '') + '</small></td>' +
        '<td>' + U.fmtMoney(p.price, p.currency) + '</td>' +
        '<td>' + (p.available ? '✅' : '🚫') + '</td>' +
        '<td>' + (p.delivery === 'yes' ? '🛵' : p.delivery === 'no' ? '🚫' : '🌐') + '</td>' +
        '<td><button class="btn btn-ghost btn-sm" data-pedit="' + p.id + '">' + T('cm.edit') + '</button> ' +
        '<button class="btn btn-ghost btn-sm" data-pdel="' + p.id + '">' + T('cm.delete') + '</button></td></tr>';
    }).join('');
    return '<h2>🍗 ' + T('admin.products') + ' (' + (state.products || []).length + ')</h2>' +
      '<div class="panel"><div class="row"><button class="btn btn-primary" id="p-add">+ ' + T('cm.add') + '</button>' +
      '<input id="p-q" placeholder="' + T('cm.search') + '"></div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>' + (lang() === 'ar' ? 'المنتج' : 'Product') + '</th><th>$</th><th>' + T('cm.status') + '</th><th>🛵</th><th>' + T('cm.actions') + '</th></tr></thead>' +
      '<tbody id="p-rows">' + rows + '</tbody></table></div></div><div class="modal" id="p-modal"></div>';
  }
  function bProducts() {
    el('p-add').onclick = function () { productModal(null); };
    el('p-q').oninput = U.debounce(function () {
      var q = el('p-q').value.toLowerCase();
      el('p-rows').querySelectorAll('tr').forEach(function (tr) {
        tr.style.display = tr.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
      });
    }, 200);
    el('a-main').querySelectorAll('[data-pdel]').forEach(function (b) {
      b.onclick = function () {
        if (!confirm(T('cm.confirmDel'))) return;
        window.Store.update(function (s) { s.products = s.products.filter(function (p) { return p.id !== b.getAttribute('data-pdel'); }); });
        renderTab(); U.toast(T('cm.saved'));
      };
    });
    el('a-main').querySelectorAll('[data-pedit]').forEach(function (b) {
      b.onclick = function () { productModal(b.getAttribute('data-pedit')); };
    });
  }
  function productModal(id) {
    var p = id ? (state.products || []).find(function (x) { return x.id === id; }) : null;
    p = p || { id: U.uid('p'), name: { ar: '', en: '', fr: '' }, desc: { ar: '', en: '', fr: '' }, price: 0, oldPrice: 0, currency: window.Schema.DEFAULT_CURRENCY, categoryId: (state.categories[0] || {}).id || '', image: 'assets/images/placeholder.svg', alt: { ar: '' }, details: { ar: '', en: '', fr: '' }, badge: { ar: '', en: '', fr: '' }, available: true, delivery: 'inherit', sort: (state.products || []).length + 1 };
    var cats = sortedCats().map(function (c) { return '<option value="' + c.id + '"' + (p.categoryId === c.id ? ' selected' : '') + '>' + esc(L(c.name)) + '</option>'; }).join('');
    var curs = Object.keys(window.Schema.CURRENCIES).map(function (k) { return '<option' + (p.currency === k ? ' selected' : '') + '>' + k + '</option>'; }).join('');
    var m = el('p-modal');
    m.innerHTML = '<div class="modal-card wide"><button class="modal-x" id="pm-x">✕</button><div class="modal-body"><h3>' + (id ? T('cm.edit') : T('cm.add')) + '</h3>' +
      '<div class="row"><img id="pm-prev" src="' + U.sanitizeUrl(p.image || 'assets/images/placeholder.svg', 'assets/images/placeholder.svg') + '" alt=""><button class="btn btn-ghost" id="pm-pick">' + (lang() === 'ar' ? 'اختيار صورة من الجهاز' : 'Choose from device') + '</button></div>' +
      triRow('pm-name', p.name, lang() === 'ar' ? 'الاسم' : 'Name') +
      '<div class="tri"><span class="tri-t">' + (lang() === 'ar' ? 'الوصف' : 'Description') + '</span>' +
      fld('AR', '<textarea id="pm-desc-ar" rows="2" maxlength="400">' + esc(p.desc.ar || '') + '</textarea>') +
      fld('EN', '<textarea id="pm-desc-en" rows="2" maxlength="400">' + esc(p.desc.en || '') + '</textarea>') +
      fld('FR', '<textarea id="pm-desc-fr" rows="2" maxlength="400">' + esc(p.desc.fr || '') + '</textarea>') + '</div>' +
      '<div class="grid2">' +
      fld(lang() === 'ar' ? 'السعر' : 'Price', '<input id="pm-price" type="number" min="0" step="0.01" value="' + (p.price || 0) + '">') +
      fld(lang() === 'ar' ? 'السعر القديم' : 'Old price', '<input id="pm-old" type="number" min="0" step="0.01" value="' + (p.oldPrice || 0) + '">') +
      fld('Currency', '<select id="pm-cur">' + curs + '</select>') +
      fld(T('admin.cats'), '<select id="pm-cat">' + cats + '</select>') +
      fld('Alt', inp('pm-alt', (p.alt && p.alt.ar) || '', 'maxlength="120"')) +
      fld(lang() === 'ar' ? 'ترتيب الظهور' : 'Sort', '<input id="pm-sort" type="number" value="' + (p.sort || 1) + '">') +
      '</div>' +
      triRow('pm-badge', p.badge, lang() === 'ar' ? 'الشارة' : 'Badge') +
      fld(lang() === 'ar' ? 'التفاصيل' : 'Details', inp('pm-det', (p.details && (p.details.ar || p.details.en)) || '', 'maxlength="200"')) +
      '<div class="row"><label class="chk"><input type="checkbox" id="pm-av"' + (p.available ? ' checked' : '') + '> ' + (lang() === 'ar' ? 'متوفر' : 'Available') + '</label>' +
      fld('🛵', '<select id="pm-del"><option value="inherit"' + (p.delivery === 'inherit' ? ' selected' : '') + '>' + (lang() === 'ar' ? 'استخدام الإعداد العام' : 'Use global setting') + '</option><option value="yes"' + (p.delivery === 'yes' ? ' selected' : '') + '>' + (lang() === 'ar' ? 'التوصيل متاح' : 'Deliverable') + '</option><option value="no"' + (p.delivery === 'no' ? ' selected' : '') + '>' + (lang() === 'ar' ? 'التوصيل غير متاح' : 'Not deliverable') + '</option></select>') + '</div>' +
      '<div class="row"><button class="btn btn-primary" id="pm-save">' + T('cm.save') + '</button></div></div></div>';
    m.classList.add('open');
    var newImg = p.image;
    el('pm-x').onclick = function () { m.classList.remove('open'); };
    m.onclick = function (e) { if (e.target === m) m.classList.remove('open'); };
    el('pm-pick').onclick = function () {
      window.Media.chooseFromDevice('image', function () {}).then(function (r) {
        if (r) { newImg = r.dataUrl; el('pm-prev').src = r.dataUrl; }
      });
    };
    el('pm-save').onclick = function () {
      var np = {
        id: p.id,
        name: { ar: U.sanitizeText(el('pm-name-ar').value, 120), en: U.sanitizeText(el('pm-name-en').value, 120), fr: U.sanitizeText(el('pm-name-fr').value, 120) },
        desc: { ar: U.sanitizeText(el('pm-desc-ar').value, 400), en: U.sanitizeText(el('pm-desc-en').value, 400), fr: U.sanitizeText(el('pm-desc-fr').value, 400) },
        price: Math.max(0, parseFloat(el('pm-price').value) || 0),
        oldPrice: Math.max(0, parseFloat(el('pm-old').value) || 0),
        currency: el('pm-cur').value, categoryId: el('pm-cat').value,
        image: newImg || 'assets/images/placeholder.svg',
        alt: { ar: U.sanitizeText(el('pm-alt').value, 120), en: '', fr: '' },
        details: { ar: U.sanitizeText(el('pm-det').value, 200), en: '', fr: '' },
        badge: { ar: U.sanitizeText(el('pm-badge-ar').value, 40), en: U.sanitizeText(el('pm-badge-en').value, 40), fr: U.sanitizeText(el('pm-badge-fr').value, 40) },
        available: el('pm-av').checked, delivery: el('pm-del').value,
        sort: parseInt(el('pm-sort').value, 10) || 1
      };
      if (!np.name.ar && !np.name.en) { U.toast('✕ Name', 'err'); return; }
      window.Store.update(function (s) {
        var i = s.products.findIndex(function (x) { return x.id === np.id; });
        if (i === -1) s.products.push(np); else s.products[i] = np;
      });
      m.classList.remove('open');
      renderTab(); U.toast(T('cm.saved'));
    };
  }
  function sortedCats() { return (state.categories || []).slice().sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); }); }

  /* ================= التصنيفات ================= */
  function vCats() {
    var rows = sortedCats().map(function (c) {
      var n = (state.products || []).filter(function (p) { return p.categoryId === c.id; }).length;
      return '<tr><td>' + esc(c.icon || '•') + '</td><td><strong>' + esc(L(c.name)) + '</strong> <small>(' + n + ')</small></td>' +
        '<td><button class="btn btn-ghost btn-sm" data-cedit="' + c.id + '">' + T('cm.edit') + '</button> ' +
        '<button class="btn btn-ghost btn-sm" data-cdel="' + c.id + '">' + T('cm.delete') + '</button></td></tr>';
    }).join('');
    return '<h2>🗂️ ' + T('admin.cats') + '</h2><div class="panel"><div class="row"><button class="btn btn-primary" id="c-add">+ ' + T('cm.add') + '</button></div>' +
      '<div class="tbl-wrap"><table class="tbl"><tbody>' + rows + '</tbody></table></div><div id="c-form"></div></div>';
  }
  function bCats() {
    el('c-add').onclick = function () { catForm(null); };
    el('a-main').querySelectorAll('[data-cedit]').forEach(function (b) { b.onclick = function () { catForm(b.getAttribute('data-cedit')); }; });
    el('a-main').querySelectorAll('[data-cdel]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-cdel');
        if ((state.products || []).some(function (p) { return p.categoryId === id; })) { U.toast(lang() === 'ar' ? 'لا يمكن حذف تصنيف يحتوي منتجات.' : 'Category has products.', 'err'); return; }
        if (!confirm(T('cm.confirmDel'))) return;
        window.Store.update(function (s) { s.categories = s.categories.filter(function (c) { return c.id !== id; }); });
        renderTab();
      };
    });
  }
  function catForm(id) {
    var c = id ? state.categories.find(function (x) { return x.id === id; }) : { id: U.uid('cat'), name: { ar: '', en: '', fr: '' }, icon: '🍽️', sort: state.categories.length + 1 };
    el('c-form').innerHTML = '<div class="panel in">' + triRow('cf-name', c.name, lang() === 'ar' ? 'الاسم' : 'Name') +
      '<div class="grid2">' + fld('Icon', inp('cf-icon', c.icon || '', 'maxlength="4"')) + fld('Sort', '<input id="cf-sort" type="number" value="' + (c.sort || 1) + '">') + '</div>' +
      '<div class="row"><button class="btn btn-primary" id="cf-save">' + T('cm.save') + '</button></div></div>';
    el('cf-save').onclick = function () {
      var nc = { id: c.id, name: triGet('cf-name'), icon: U.sanitizeText(el('cf-icon').value, 4), sort: parseInt(el('cf-sort').value, 10) || 1 };
      window.Store.update(function (s) {
        var i = s.categories.findIndex(function (x) { return x.id === nc.id; });
        if (i === -1) s.categories.push(nc); else s.categories[i] = nc;
      });
      renderTab(); U.toast(T('cm.saved'));
    };
  }

  /* ================= الطلبات + الصوت ================= */
  var ordFilter = 'all';
  function vOrders() {
    var snd = !!state.settings.soundEnabled;
    var list = (state.orders || []).filter(function (o) { return ordFilter === 'all' || o.status === ordFilter; });
    var rows = list.map(function (o) {
      var items = o.items.map(function (it) { return esc(it.name) + ' ×' + it.qty; }).join('، ');
      var opts = window.Schema.ORDER_STATUSES.map(function (s) { return '<option value="' + s + '"' + (o.status === s ? ' selected' : '') + '>' + T('st.' + s) + '</option>'; }).join('');
      return '<div class="order"><div class="o-head"><strong dir="ltr">' + esc(o.number) + '</strong><span>' + esc(o.createdAt) + '</span><select data-ost="' + o.id + '">' + opts + '</select>' +
        '<button class="btn btn-ghost btn-sm" data-odel="' + o.id + '">' + T('cm.delete') + '</button></div>' +
        '<p>👤 ' + esc(o.customer) + ' • <span dir="ltr">' + esc(o.phone) + '</span> • 📦 ' + esc(o.type) + (o.address ? ' • 📍 ' + esc(o.address) : '') + '</p>' +
        '<p class="muted">' + items + '</p>' +
        (o.notes ? '<p>📝 ' + esc(o.notes) + '</p>' : '') +
        '<p><strong>' + U.fmtMoney(o.total, o.currency) + '</strong></p></div>';
    }).join('');
    var filters = ['all'].concat(window.Schema.ORDER_STATUSES).map(function (s) {
      return '<button class="pill' + (ordFilter === s ? ' active' : '') + '" data-of="' + s + '">' + (s === 'all' ? T('filter.all') : T('st.' + s)) + '</button>';
    }).join('');
    return '<h2>🧾 ' + T('admin.orders') + ' (' + (state.orders || []).length + ')</h2>' +
      '<div class="panel"><div class="row"><button class="btn ' + (snd ? 'btn-ghost' : 'btn-primary') + '" id="snd-toggle">' + (snd ? T('snd.on') : T('snd.enable')) + '</button>' +
      '<button class="btn btn-ghost" id="snd-test">🔔 Test</button></div>' +
      '<p class="muted">' + (lang() === 'ar' ? 'يعمل التنبيه داخل هذا المتصفح (تبويب اللوحة) عبر حدث التخزين — وليس بين أجهزة مختلفة.' : 'Alerts work in this browser via storage events — not across devices.') + '</p></div>' +
      '<div class="panel"><div class="pill-row">' + filters + '</div><div id="o-list">' + (rows || '<p class="muted">' + T('ov.noOrders') + '</p>') + '</div></div>';
  }
  function bOrders() {
    el('snd-toggle').onclick = function () {
      var v = !state.settings.soundEnabled;
      window.Store.set('settings.soundEnabled', v);
      if (v) {
        try { if (window.Notification && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
        window.Effects.playNewOrderTone();
      }
      renderTab();
    };
    el('snd-test').onclick = function () { window.Effects.playNewOrderTone(); U.toast('🔔 Test'); };
    el('a-main').querySelectorAll('[data-of]').forEach(function (b) { b.onclick = function () { ordFilter = b.getAttribute('data-of'); renderTab(); }; });
    el('a-main').querySelectorAll('[data-ost]').forEach(function (s) {
      s.onchange = function () {
        var id = s.getAttribute('data-ost');
        window.Store.update(function (st) { var o = st.orders.find(function (x) { return x.id === id; }); if (o) o.status = s.value; });
        updateOrdBadge(); U.toast(T('cm.saved'));
      };
    });
    el('a-main').querySelectorAll('[data-odel]').forEach(function (b) {
      b.onclick = function () {
        if (!confirm(T('cm.confirmDel'))) return;
        window.Store.update(function (st) { st.orders = st.orders.filter(function (x) { return x.id !== b.getAttribute('data-odel'); }); });
        renderTab(); updateOrdBadge();
      };
    });
  }

  /* ================= WhatsApp والتوصيل ================= */
  function vWA() {
    var b = state.business;
    var ok = window.WA.isValid(b.whatsapp);
    var rows = (state.products || []).map(function (p) {
      return '<tr><td>' + esc(L(p.name)) + '</td><td><select data-pdel="' + p.id + '">' +
        '<option value="inherit"' + (p.delivery === 'inherit' ? ' selected' : '') + '>🌐 ' + (lang() === 'ar' ? 'عام' : 'Global') + '</option>' +
        '<option value="yes"' + (p.delivery === 'yes' ? ' selected' : '') + '>✅</option>' +
        '<option value="no"' + (p.delivery === 'no' ? ' selected' : '') + '>🚫</option></select></td></tr>';
    }).join('');
    return '<h2>💬 ' + T('admin.wa') + '</h2>' +
      '<div class="panel"><h3>' + (lang() === 'ar' ? 'WhatsApp واستقبال الطلبات' : 'WhatsApp & order receiving') + '</h3>' +
      fld('WhatsApp', inp('w-num', b.whatsapp || '', 'maxlength="20" dir="ltr" placeholder="+380…"')) +
      '<p class="' + (ok ? 'ok' : 'warn') + '">' + (ok ? '✅ ' + window.WA.cleanPhone(b.whatsapp) : '⚠️ ' + (lang() === 'ar' ? 'أدخل رقمًا صالحًا (8-15 رقمًا) ليظهر زر WhatsApp.' : 'Enter a valid number (8-15 digits).')) + '</p>' +
      '<div class="row"><button class="btn btn-primary" id="w-save">' + T('cm.save') + '</button><button class="btn btn-ghost" id="w-test">' + (lang() === 'ar' ? 'اختبار WhatsApp' : 'Test WhatsApp') + '</button></div>' +
      '<p class="muted">' + (lang() === 'ar' ? 'يُستخدم رابط wa.me فقط — لا توجد API Keys في الواجهة. عند استخدام WhatsApp Business API لاحقًا يجب التنفيذ من Backend مع Token في متغيرات البيئة.' : 'Uses wa.me links only — no API keys in frontend.') + '</p></div>' +
      '<div class="panel"><h3>🛵 ' + (lang() === 'ar' ? 'خدمة التوصيل' : 'Delivery service') + '</h3>' +
      '<label class="chk big"><input type="checkbox" id="d-global"' + (state.settings.deliveryEnabled ? ' checked' : '') + '> ' + (lang() === 'ar' ? 'تفعيل التوصيل لجميع المنتجات' : 'Enable delivery for all products') + '</label>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + T('ov.products') + '</th><th>🛵</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }
  function bWA() {
    el('w-save').onclick = function () {
      var v = U.sanitizeText(el('w-num').value, 20);
      if (v && !window.WA.isValid(v)) { U.toast('✕ WhatsApp', 'err'); return; }
      window.Store.set('business.whatsapp', v);
      renderTab(); U.toast(T('cm.saved'));
    };
    el('w-test').onclick = U.throttle(function () {
      var v = state.business.whatsapp;
      if (!window.WA.isValid(v)) { U.toast('✕ WhatsApp', 'err'); return; }
      window.WA.open(v, window.WA.testMessage(state.business, lang()));
    }, 2000);
    el('d-global').onchange = function () {
      window.Store.set('settings.deliveryEnabled', el('d-global').checked);
      U.toast(T('cm.saved'));
    };
    el('a-main').querySelectorAll('[data-pdel]').forEach(function (s) {
      s.onchange = function () {
        var id = s.getAttribute('data-pdel');
        window.Store.update(function (st) { var p = st.products.find(function (x) { return x.id === id; }); if (p) p.delivery = s.value; });
        U.toast(T('cm.saved'));
      };
    });
  }

  /* ================= الأمان ================= */
  function vSecurity() {
    return '<h2>🔒 ' + T('admin.security') + '</h2><div class="panel"><h3>' + (lang() === 'ar' ? 'تغيير كلمة المرور' : 'Change password') + '</h3>' +
      fld(lang() === 'ar' ? 'الحالية' : 'Current', '<input id="pw-old" type="password">') +
      fld(lang() === 'ar' ? 'الجديدة' : 'New', '<input id="pw-new" type="password">') +
      '<div class="row"><button class="btn btn-primary" id="pw-go">' + T('cm.save') + '</button><button class="btn btn-ghost" id="pw-out">' + T('admin.logout') + '</button></div>' +
      '<p class="muted">⚠️ ' + (lang() === 'ar' ? 'النسخة التجارية تحتاج Backend مع Hashing وجلسات آمنة وRate Limiting على الخادم.' : 'Production needs a backend with hashing, secure sessions & server rate limiting.') + '</p></div>';
  }
  function bSecurity() {
    el('pw-go').onclick = function () {
      window.Auth.changePassword(el('pw-old').value, el('pw-new').value).then(function (r) {
        U.toast(r.ok ? T('cm.saved') : '✕', r.ok ? 'ok' : 'err');
      });
    };
    el('pw-out').onclick = function () { window.Auth.logout(); location.href = 'index.html'; };
  }

  /* ================= البيانات ================= */
  function vData() {
    return '<h2>⚙️ ' + T('admin.data') + '</h2><div class="panel"><h3>' + (lang() === 'ar' ? 'اللغة' : 'Language') + '</h3>' +
      '<div class="row">' + ['ar', 'en', 'fr'].map(function (l) {
        return '<button class="pill' + (lang() === l ? ' active' : '') + '" data-lang="' + l + '">' + l.toUpperCase() + '</button>';
      }).join('') + '</div></div>' +
      '<div class="panel"><h3>' + (lang() === 'ar' ? 'النسخ الاحتياطي' : 'Backup') + '</h3><div class="row">' +
      '<button class="btn btn-ghost" id="d-exp">⬇ Export JSON</button>' +
      '<button class="btn btn-ghost" id="d-imp">⬆ Import JSON</button>' +
      '<button class="btn btn-ghost" id="d-reset">♻ ' + (lang() === 'ar' ? 'إعادة ضبط' : 'Reset') + '</button></div>' +
      '<p class="muted">' + (lang() === 'ar' ? 'البيانات محفوظة في هذا المتصفح فقط (localStorage).' : 'Data is stored in this browser only (localStorage).') + '</p></div>';
  }
  function bData() {
    el('a-main').querySelectorAll('[data-lang]').forEach(function (b) {
      b.onclick = function () { window.I18N.setLang(b.getAttribute('data-lang')); location.reload(); };
    });
    el('d-exp').onclick = function () { U.downloadFile('site-backup.json', window.Store.exportJSON(), 'application/json'); };
    el('d-imp').onclick = function () {
      var i = document.createElement('input');
      i.type = 'file'; i.accept = 'application/json,.json';
      i.onchange = function () {
        var f = i.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try { window.Store.importJSON(String(r.result)); location.reload(); }
          catch (e) { U.toast('✕ JSON', 'err'); }
        };
        r.readAsText(f);
      };
      i.click();
    };
    el('d-reset').onclick = function () {
      if (!confirm(T('cm.confirmDel'))) return;
      window.Store.resetAll(); location.reload();
    };
  }
})();
