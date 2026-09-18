/* Auth — حماية لوحة التحكم: إعداد أول مرة + دخول + استرداد + قفل مؤقت
   تنبيه إنتاجي: النسخة التجارية تحتاج Backend مع Hashing وجلسات آمنة. */
(function (global) {
  'use strict';
  var SESSION_KEY = 'kfc_admin_session_v1';
  var MAX_ATTEMPTS = 5;
  var LOCK_MS = 60 * 1000;

  function bufToHex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function sha256(str) {
    if (global.crypto && crypto.subtle) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(bufToHex);
    }
    // fallback بسيط (غير آمن للإنتاج — للتوافق فقط)
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57, i;
    for (i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return Promise.resolve((4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16));
  }
  function makeSalt() {
    var s = '';
    try {
      var a = new Uint8Array(16);
      crypto.getRandomValues(a);
      a.forEach(function (b) { s += b.toString(16).padStart(2, '0'); });
    } catch (e) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); }
    return s;
  }

  function isSetup() { return !!(global.Store.get('admin.passwordHash')); }
  function isAuthed() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1' && isSetup(); } catch (e) { return false; }
  }
  function lockState() {
    var a = global.Store.get('admin') || {};
    return { attempts: a.failedAttempts || 0, lockedUntil: a.lockedUntil || 0 };
  }
  function isLocked() { return Date.now() < (lockState().lockedUntil || 0); }

  function setup(password, confirm, qa) {
    password = String(password || '');
    if (password.length < 6) return Promise.resolve({ ok: false, reason: 'weak' });
    if (password !== String(confirm || '')) return Promise.resolve({ ok: false, reason: 'mismatch' });
    qa = (qa || []).filter(function (x) { return x.q && x.a; });
    if (qa.length < 3) return Promise.resolve({ ok: false, reason: 'need3' });
    var qs = qa.map(function (x) { return x.q.trim().toLowerCase(); });
    if (new Set(qs).size < 3) return Promise.resolve({ ok: false, reason: 'need3' });
    var salt = makeSalt();
    return sha256(salt + '::' + password).then(function (hash) {
      var jobs = qa.slice(0, 3).map(function (x) {
        return sha256(salt + '::qa::' + x.a.trim().toLowerCase()).then(function (ah) {
          return { q: x.q.trim().slice(0, 120), aHash: ah };
        });
      });
      return Promise.all(jobs).then(function (rec) {
        global.Store.update(function (s) {
          s.admin.passwordHash = hash; s.admin.salt = salt;
          s.admin.recovery = rec; s.admin.createdAt = new Date().toISOString();
          s.admin.failedAttempts = 0; s.admin.lockedUntil = 0;
        });
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) { /* noop */ }
        return { ok: true };
      });
    });
  }

  function login(password) {
    if (!isSetup()) return Promise.resolve({ ok: false, reason: 'nosetup' });
    if (isLocked()) return Promise.resolve({ ok: false, reason: 'locked' });
    var a = global.Store.get('admin');
    return sha256(a.salt + '::' + String(password || '')).then(function (hash) {
      if (hash === a.passwordHash) {
        global.Store.update(function (s) { s.admin.failedAttempts = 0; s.admin.lockedUntil = 0; });
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) { /* noop */ }
        return { ok: true };
      }
      global.Store.update(function (s) {
        s.admin.failedAttempts = (s.admin.failedAttempts || 0) + 1;
        if (s.admin.failedAttempts >= MAX_ATTEMPTS) {
          s.admin.lockedUntil = Date.now() + LOCK_MS;
          s.admin.failedAttempts = 0;
        }
      });
      return { ok: false, reason: isLocked() ? 'locked' : 'wrong' };
    });
  }

  function logout() { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* noop */ } }

  function changePassword(oldPass, newPass) {
    var a = global.Store.get('admin');
    if (!a || !a.passwordHash) return Promise.resolve({ ok: false });
    return sha256(a.salt + '::' + String(oldPass || '')).then(function (h) {
      if (h !== a.passwordHash) return { ok: false, reason: 'wrong' };
      if (String(newPass || '').length < 6) return { ok: false, reason: 'weak' };
      return sha256(a.salt + '::' + String(newPass)).then(function (nh) {
        global.Store.set('admin.passwordHash', nh);
        return { ok: true };
      });
    });
  }

  function recoveryQuestions() { return (global.Store.get('admin.recovery') || []).map(function (r) { return r.q; }); }

  function recover(answers, newPass) {
    var a = global.Store.get('admin');
    if (!a || !(a.recovery || []).length) return Promise.resolve({ ok: false });
    if (String(newPass || '').length < 6) return Promise.resolve({ ok: false, reason: 'weak' });
    var jobs = a.recovery.map(function (r, i) {
      return sha256(a.salt + '::qa::' + String((answers || [])[i] || '').trim().toLowerCase()).then(function (h) { return h === r.aHash; });
    });
    return Promise.all(jobs).then(function (res) {
      if (!res.every(Boolean)) return { ok: false, reason: 'wrong' };
      return sha256(a.salt + '::' + String(newPass)).then(function (nh) {
        global.Store.update(function (s) { s.admin.passwordHash = nh; s.admin.failedAttempts = 0; s.admin.lockedUntil = 0; });
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) { /* noop */ }
        return { ok: true };
      });
    });
  }

  global.Auth = {
    isSetup: isSetup, isAuthed: isAuthed, isLocked: isLocked, lockState: lockState,
    setup: setup, login: login, logout: logout,
    changePassword: changePassword, recoveryQuestions: recoveryQuestions, recover: recover
  };
})(window);
