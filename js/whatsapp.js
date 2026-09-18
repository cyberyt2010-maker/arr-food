/* WhatsApp — تنظيف الرقم، بناء الرسالة، روابط wa.me (بدون أي Secrets) */
(function (global) {
  'use strict';

  function cleanPhone(raw) {
    if (!raw) return '';
    var s = String(raw).trim().replace(/[\s().-]/g, '');
    if (s.indexOf('+') === 0) s = s.slice(1);
    if (s.indexOf('00') === 0) s = s.slice(2);
    s = s.replace(/\D/g, '');
    return s;
  }

  function isValid(raw) {
    var c = cleanPhone(raw);
    return c.length >= 8 && c.length <= 15;
  }

  function typeLabel(type, lang) {
    var m = {
      delivery: { ar: 'توصيل', en: 'Delivery', fr: 'Livraison' },
      pickup: { ar: 'استلام من المطعم', en: 'Pickup', fr: 'À emporter' },
      dinein: { ar: 'جلوس داخل المكان', en: 'Dine-in', fr: 'Sur place' }
    };
    return (m[type] && (m[type][lang] || m[type].ar)) || type;
  }

  function buildMessage(order, business, lang) {
    lang = lang || 'ar';
    var U = global.Utils;
    var L = [];
    if (lang === 'ar') {
      L.push('🍗 *طلب جديد — ' + (business.name || '') + '*');
      L.push('━━━━━━━━━━━━');
      L.push('🧾 رقم الطلب: ' + order.number);
      L.push('👤 الاسم: ' + order.customer);
      L.push('📞 الهاتف: ' + order.phone);
      L.push('📦 النوع: ' + typeLabel(order.type, lang));
      if (order.type === 'delivery' && order.address) L.push('📍 العنوان: ' + order.address);
      L.push('━━━━━━━━━━━━');
      order.items.forEach(function (it) {
        L.push('• ' + it.name + ' × ' + it.qty + ' = ' + U.fmtMoney(it.price * it.qty, it.currency || order.currency));
      });
      L.push('━━━━━━━━━━━━');
      L.push('💰 الإجمالي: ' + U.fmtMoney(order.total, order.currency));
      if (order.notes) L.push('📝 ملاحظات: ' + order.notes);
      L.push('🕒 ' + order.createdAt);
    } else if (lang === 'fr') {
      L.push('🍗 *Nouvelle commande — ' + (business.name || '') + '*');
      L.push('━━━━━━━━━━━━');
      L.push('🧾 N° : ' + order.number);
      L.push('👤 Nom : ' + order.customer);
      L.push('📞 Tél : ' + order.phone);
      L.push('📦 Type : ' + typeLabel(order.type, lang));
      if (order.type === 'delivery' && order.address) L.push('📍 Adresse : ' + order.address);
      L.push('━━━━━━━━━━━━');
      order.items.forEach(function (it) {
        L.push('• ' + it.name + ' × ' + it.qty + ' = ' + U.fmtMoney(it.price * it.qty, it.currency || order.currency));
      });
      L.push('━━━━━━━━━━━━');
      L.push('💰 Total : ' + U.fmtMoney(order.total, order.currency));
      if (order.notes) L.push('📝 Notes : ' + order.notes);
      L.push('🕒 ' + order.createdAt);
    } else {
      L.push('🍗 *New order — ' + (business.name || '') + '*');
      L.push('━━━━━━━━━━━━');
      L.push('🧾 Order: ' + order.number);
      L.push('👤 Name: ' + order.customer);
      L.push('📞 Phone: ' + order.phone);
      L.push('📦 Type: ' + typeLabel(order.type, lang));
      if (order.type === 'delivery' && order.address) L.push('📍 Address: ' + order.address);
      L.push('━━━━━━━━━━━━');
      order.items.forEach(function (it) {
        L.push('• ' + it.name + ' × ' + it.qty + ' = ' + U.fmtMoney(it.price * it.qty, it.currency || order.currency));
      });
      L.push('━━━━━━━━━━━━');
      L.push('💰 Total: ' + U.fmtMoney(order.total, order.currency));
      if (order.notes) L.push('📝 Notes: ' + order.notes);
      L.push('🕒 ' + order.createdAt);
    }
    return L.join('\n');
  }

  function link(phone, message) {
    return 'https://wa.me/' + cleanPhone(phone) + '?text=' + encodeURIComponent(message);
  }

  function open(phone, message) {
    var url = link(phone, message);
    var w = window.open(url, '_blank', 'noopener');
    return !!w;
  }

  function testMessage(business, lang) {
    if (lang === 'fr') return '✅ Test WhatsApp — ' + (business.name || '') + ' : la réception des commandes fonctionne.';
    if (lang === 'en') return '✅ WhatsApp test — ' + (business.name || '') + ': order receiving works.';
    return '✅ اختبار WhatsApp — ' + (business.name || '') + ': استقبال الطلبات يعمل بنجاح.';
  }

  global.WA = { cleanPhone: cleanPhone, isValid: isValid, buildMessage: buildMessage, link: link, open: open, testMessage: testMessage };
})(window);
