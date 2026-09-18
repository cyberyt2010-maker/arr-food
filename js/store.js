/* ============================================================
   Store — طبقة الحفظ المحلي (localStorage) + الهجرة + الأحداث
   ملاحظة إنتاجية: النسخة السحابية تحتاج Backend وقاعدة بيانات
   ============================================================ */
(function (global) {
  'use strict';

  var state = null;
  var saveTimer = null;
  var listeners = [];

  function deepMerge(base, over) {
    if (Array.isArray(over)) return over.slice();
    if (over && typeof over === 'object' && base && typeof base === 'object') {
      var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
      Object.keys(over).forEach(function (k) {
        out[k] = (k in out) ? deepMerge(out[k], over[k]) : over[k];
      });
      return out;
    }
    return (over === undefined) ? base : over;
  }

  function load() {
    if (state) return state;
    var fresh = global.Schema.defaultState();
    try {
      var raw = localStorage.getItem(global.Schema.STORE_KEY);
      if (!raw) { state = fresh; persist(true); return state; }
      var saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') { state = fresh; return state; }
      if (saved.version !== global.Schema.VERSION) {
        state = deepMerge(fresh, saved);
        state.version = global.Schema.VERSION;
        persist(true);
      } else {
        state = deepMerge(fresh, saved);
      }
    } catch (e) { state = fresh; }
    return state;
  }

  function persist(immediate) {
    if (!state) return;
    if (immediate) { doSave(); return; }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(doSave, 250);
  }

  function doSave() {
    try {
      localStorage.setItem(global.Schema.STORE_KEY, JSON.stringify(state));
    } catch (e) {
      // امتلاء التخزين (صور كبيرة): نحاول حفظ نسخة بدون آخر وسائط مضافة
      try {
        document.dispatchEvent(new CustomEvent('site:quota', { detail: { error: String(e) } }));
      } catch (_e) { /* noop */ }
    }
  }

  function get(path) {
    load();
    if (!path) return state;
    return path.split('.').reduce(function (o, k) { return (o && o[k] !== undefined) ? o[k] : undefined; }, state);
  }

  function set(path, value) {
    load();
    var keys = path.split('.');
    var o = state;
    for (var i = 0; i < keys.length - 1; i++) {
      if (!o[keys[i]] || typeof o[keys[i]] !== 'object') o[keys[i]] = {};
      o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = value;
    persist(false);
    emit(path);
  }

  function update(fn) {
    load();
    fn(state);
    persist(false);
    emit('bulk');
  }

  function onChange(cb) {
    listeners.push(cb);
    document.addEventListener('site:change', function (e) { cb(e.detail); });
  }

  function emit(path) {
    try { document.dispatchEvent(new CustomEvent('site:change', { detail: { path: path } })); } catch (e) { /* noop */ }
    // storage event بين التبويبات (للتنبيه الصوتي بعدّاد الطلبات)
    try { localStorage.setItem('__site_ping', JSON.stringify({ p: path, t: Date.now() })); } catch (e) { /* noop */ }
  }

  function resetAll() {
    state = global.Schema.defaultState();
    persist(true);
    emit('reset');
  }

  function exportJSON() {
    load();
    return JSON.stringify(state, null, 2);
  }

  function importJSON(text) {
    var obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || !obj.business) throw new Error('bad-file');
    var fresh = global.Schema.defaultState();
    state = deepMerge(fresh, obj);
    state.version = global.Schema.VERSION;
    persist(true);
    emit('import');
  }

  function nextOrderNumber() {
    load();
    state.settings.orderCounter = (state.settings.orderCounter || 1000) + 1;
    persist(true);
    return 'KFC-' + state.settings.orderCounter;
  }

  global.Store = {
    load: load, get: get, set: set, update: update, onChange: onChange,
    resetAll: resetAll, exportJSON: exportJSON, importJSON: importJSON,
    nextOrderNumber: nextOrderNumber
  };
})(window);
