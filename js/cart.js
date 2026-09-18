/* Cart — سلة مشتريات عاملة بالكامل + منطق التوصيل */
(function (global) {
  'use strict';
  var items = []; // [{productId, qty}]

  function loadCart() {
    try {
      var raw = localStorage.getItem(global.Schema.CART_KEY);
      items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(items)) items = [];
    } catch (e) { items = []; }
  }
  function saveCart() {
    try { localStorage.setItem(global.Schema.CART_KEY, JSON.stringify(items)); } catch (e) { /* noop */ }
    try { document.dispatchEvent(new CustomEvent('site:cart')); } catch (e) { /* noop */ }
  }
  function productById(id) {
    return (global.Store.get('products') || []).find(function (p) { return p.id === id; });
  }
  function deliveryOf(p) {
    if (!p) return false;
    if (p.delivery === 'yes') return true;
    if (p.delivery === 'no') return false;
    return !!global.Store.get('settings.deliveryEnabled');
  }
  function add(id, qty) {
    var p = productById(id);
    if (!p || !p.available) return false;
    qty = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
    var ex = items.find(function (i) { return i.productId === id; });
    if (ex) ex.qty = Math.min(99, ex.qty + qty); else items.push({ productId: id, qty: qty });
    saveCart();
    return true;
  }
  function setQty(id, qty) {
    qty = parseInt(qty, 10) || 0;
    if (qty <= 0) return remove(id);
    var ex = items.find(function (i) { return i.productId === id; });
    if (ex) { ex.qty = Math.min(99, qty); saveCart(); }
  }
  function remove(id) { items = items.filter(function (i) { return i.productId !== id; }); saveCart(); }
  function clear() { items = []; saveCart(); }
  function detailed() {
    return items.map(function (i) {
      var p = productById(i.productId);
      return { line: i, product: p };
    }).filter(function (d) { return !!d.product; });
  }
  function count() { return items.reduce(function (s, i) { return s + (i.qty || 0); }, 0); }
  function total() {
    return detailed().reduce(function (s, d) { return s + (Number(d.product.price) || 0) * d.line.qty; }, 0);
  }
  function currency() {
    var ds = detailed();
    if (!ds.length) return global.Store.get('settings.currency') || 'UAH';
    return ds[0].product.currency || 'UAH';
  }
  // هل السلة تدعم التوصيل؟ + هل يوجد خيار توصيل أصلًا؟
  function deliveryState() {
    var ds = detailed();
    if (!ds.length) return { any: false, all: false, mixed: false, global: !!global.Store.get('settings.deliveryEnabled') };
    var flags = ds.map(function (d) { return deliveryOf(d.product); });
    var any = flags.some(Boolean);
    var all = flags.every(Boolean);
    return { any: any, all: all, mixed: any && !all, global: !!global.Store.get('settings.deliveryEnabled') };
  }
  loadCart();
  global.Cart = {
    add: add, setQty: setQty, remove: remove, clear: clear,
    detailed: detailed, count: count, total: total, currency: currency,
    deliveryState: deliveryState, deliveryOf: deliveryOf, reload: loadCart
  };
})(window);
