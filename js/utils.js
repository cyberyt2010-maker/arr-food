/* ============================================================
   Utils — تعقيم المدخلات (XSS)، تحقق، تنسيق، أدوات عامة
   ============================================================ */
(function (global) {
  'use strict';

  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }

  // تعقيم الروابط: السماح فقط بالبروتوكولات الآمنة والمسارات النسبية
  var SAFE_URL = /^(https?:\/\/|mailto:|tel:|wa:\/\/|#|\/|blob:|data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);|data:video\/(mp4|webm);)/i;
  var REL_PATH = /^(?![a-z][a-z0-9+.-]*:)(?!\/\/)[^<>"'\s]+$/i;
  function sanitizeUrl(u, fallback) {
    fallback = fallback || '#';
    if (!u || typeof u !== 'string') return fallback;
    var s = u.trim();
    if (s === '' || s === '#') return s === '#' ? '#' : fallback;
    if (/^(javascript|vbscript|file|ftp):/i.test(s)) return fallback;
    if (SAFE_URL.test(s) || REL_PATH.test(s)) return s;
    return fallback;
  }

  function sanitizeText(s, maxLen) {
    if (s === null || s === undefined) return '';
    s = String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
    if (maxLen && s.length > maxLen) s = s.slice(0, maxLen);
    return s;
  }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function safeName(original) {
    var ext = (original.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
    return 'media-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + (ext ? '.' + ext : '');
  }

  function currencySymbol(code) {
    var c = (global.Schema && global.Schema.CURRENCIES[code]) || null;
    return c ? c.symbol : (code || '');
  }

  function fmtMoney(amount, code) {
    var n = Number(amount);
    if (!isFinite(n)) n = 0;
    var sym = currencySymbol(code);
    var str = (Math.round(n * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return str + ' ' + sym;
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms || 200);
    };
  }

  // Rate limiting للواجهة: يمنع إساءة استخدام الأزرار الحساسة
  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last < (ms || 1500)) return false;
      last = now;
      return fn.apply(this, arguments);
    };
  }

  function clamp(n, min, max) { n = Number(n); if (!isFinite(n)) return min; return Math.min(max, Math.max(min, n)); }

  function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim()); }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dateTimeStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function downloadFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function toast(msg, type) {
    var box = document.getElementById('toast-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast-box';
      document.body.appendChild(box);
    }
    var el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'ok');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 30);
    setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 400); }, 3400);
  }

  function pickLocalized(obj, lang) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.ar || obj.en || obj.fr || '';
  }

  global.Utils = {
    esc: esc, sanitizeUrl: sanitizeUrl, sanitizeText: sanitizeText,
    uid: uid, safeName: safeName, currencySymbol: currencySymbol,
    fmtMoney: fmtMoney, debounce: debounce, throttle: throttle,
    clamp: clamp, isEmail: isEmail, dateTimeStr: dateTimeStr,
    downloadFile: downloadFile, toast: toast, pickLocalized: pickLocalized
  };
})(window);
