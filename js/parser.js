/* ============================================================
   GMapsParser — تحليل لصقة Google Maps (عربي/إنجليزي/فرنسي)
   يستخرج: الاسم، الوصف، العنوان، الهاتف، البريد، الروابط،
   الساعات، التقييم، المراجعات، النوع، الأسعار، المميزات،
   الصور، ومنتجات مقترحة من الأطباق المذكورة.
   ============================================================ */
(function (global) {
  'use strict';
  var U = function () { return global.Utils; };
  var L = function (ar, en, fr) { return global.Schema.L(ar, en, fr); };

  var DISH_KEYWORDS = [
    { k: ['bucket', 'باكت', 'سطل', 'seau'], name: L('سطل دجاج', 'Chicken Bucket', 'Seau de poulet'), cat: 'buckets' },
    { k: ['combo', 'كومبو', 'وجبة'], name: L('وجبة كومبو', 'Combo Meal', 'Menu Combo'), cat: 'combos' },
    { k: ['fries', 'frites', 'بطاطس', 'картопл', 'фрі'], name: L('بطاطس مقلية', 'French Fries', 'Frites'), cat: 'sides' },
    { k: ['burger', 'برجر', 'همبرغر'], name: L('برجر', 'Burger', 'Burger'), cat: 'burgers' },
    { k: ['pepsi', 'cola', 'بيبسي', 'пепсі', 'مشروب', 'drink', 'boisson'], name: L('مشروب غازي', 'Soft Drink', 'Boisson gazeuse'), cat: 'drinks' },
    { k: ['tender', 'تندرز', 'ستربس', 'strips', 'popcorn', 'بوبكورن'], name: L('تندرز الدجاج', 'Chicken Tenders', 'Tenders de poulet'), cat: 'sides' },
    { k: ['wings', 'أجنحة', 'أجنحه'], name: L('أجنحة الدجاج', 'Chicken Wings', 'Ailes de poulet'), cat: 'sides' },
    { k: ['salad', 'سلطة', 'salade'], name: L('سلطة', 'Salad', 'Salade'), cat: 'sides' },
    { k: ['burrito', 'بوريتو', 'راب', 'wrap', 'tacos', 'تاكو'], name: L('بوريتو / راب', 'Burrito / Wrap', 'Burrito / Wrap'), cat: 'combos' },
    { k: ['ice cream', 'مثلجات', 'آيس', 'glace', 'десерт', 'sundae'], name: L('مثلجات', 'Ice Cream', 'Glace'), cat: 'drinks' },
    { k: ['chicken', 'دجاج', 'poulet', 'курка', 'fried'], name: L('دجاج مقلي', 'Fried Chicken', 'Poulet frit'), cat: 'buckets' },
    { k: ['pizza', 'بيتزا'], name: L('بيتزا', 'Pizza', 'Pizza'), cat: 'combos' },
    { k: ['breakfast', 'فطور', 'إفطار'], name: L('وجبة فطور', 'Breakfast', 'Petit-déjeuner'), cat: 'combos' }
  ];

  function findPhones(text) {
    var out = [];
    var re = /(\+?\d[\d\s().-]{6,}\d)/g, m;
    while ((m = re.exec(text)) !== null) {
      var digits = m[1].replace(/\D/g, '');
      if (digits.length >= 9 && digits.length <= 15) out.push(m[1].trim());
    }
    return out;
  }

  function findEmails(text) {
    var m = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g);
    return m || [];
  }

  function findUrls(text) {
    var m = text.match(/(https?:\/\/[^\s\u0600-\u06FF"')\]]+|www\.[^\s\u0600-\u06FF"')\]]+|[a-z0-9-]+\.(ua|com|net|org|dz|fr|de|io|me)\b[^\s\u0600-\u06FF"')\]]*)/gi);
    return (m || []).map(function (u) {
      u = u.replace(/[.,;!?)\]]+$/, '');
      return /^https?:\/\//i.test(u) ? u : 'https://' + u;
    }).filter(function (u, i, a) { return a.indexOf(u) === i; }).slice(0, 20);
  }

  function findImageUrls(text) {
    var urls = findUrls(text);
    return urls.filter(function (u) { return /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(u); });
  }

  function analyze(raw) {
    raw = String(raw || '');
    var lines = raw.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var patch = {};
    var fields = 0;

    // الاسم: أول سطر قصير ذي معنى
    var nameLine = lines.find(function (l) { return l.length >= 2 && l.length <= 60 && !/^[0-9.()\-₴$€£+\s]+$/.test(l); });
    if (nameLine) { patch.name = U().sanitizeText(nameLine, 80); fields++; }

    // التقييم وعدد المراجعات
    var rm = raw.match(/(\d\.\d)\s*\(\s*(\d[\d\s,]*)\s*\)/) || raw.match(/(\d\.\d)[^\n]{0,30}\((\d+)\)/);
    if (rm) {
      patch.rating = Math.min(5, Math.max(0, parseFloat(rm[1])));
      patch.reviewsCount = parseInt(String(rm[2]).replace(/\D/g, ''), 10) || 0;
      fields += 2;
    }

    // الأسعار
    var pm = raw.match(/(\d+)\s*[–—-]\s*(\d+)\s*(₴|\$|€|£|دج|ر\.س|SAR|USD|UAH|грн)/);
    if (pm) { patch.priceRange = pm[1] + '–' + pm[2] + ' ' + pm[3]; fields++; }

    // الهاتف
    var phones = findPhones(raw);
    if (phones.length) { patch.phone = U().sanitizeText(phones[0], 25); fields++; }

    // البريد
    var emails = findEmails(raw);
    if (emails.length) { patch.email = emails[0]; fields++; }

    // الروابط
    var urls = findUrls(raw);
    var site = urls.find(function (u) { return !/google|facebook|instagram|tiktok|maps/i.test(u); });
    if (site) { patch.website = site; fields++; }
    var order = urls.find(function (u) { return /order|delivery|talabat|glovo|ubereats/i.test(u); });
    if (order) { patch.orderUrl = order; fields++; }

    // العنوان: سطور فيها مؤشرات عنوان
    var addrLine = lines.find(function (l) {
      return /(St\.?|street|str\.|avenue|ave\.|rue|شارع|Vinnytsia|Oblast|21000|Ukraine|أوكرانيا|\d{5})/i.test(l) && l.length > 10;
    });
    if (addrLine) {
      patch.address = U().sanitizeText(addrLine, 200); fields++;
      patch.mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addrLine);
    }

    // Plus code
    var pcm = raw.match(/[0-9A-Z]{4,}\+[0-9A-Z]{2,}[^\n]{0,60}/);
    if (pcm) { patch.plusCode = U().sanitizeText(pcm[0], 120); fields++; }

    // ساعات العمل
    var hourLines = lines.filter(function (l) { return /(يفتح|يغلق|ساعة|الساعة|open|close|heure|ouvert|9:00|10:00|am|pm|ص|م)/i.test(l); }).slice(0, 4);
    if (hourLines.length) { patch.hoursRaw = hourLines.join(' • ').slice(0, 300); fields++; }

    // النوع
    var tm = raw.match(/(مطعم وجبات سريعة|مطعم|مقهى|كافيه|فندق|منتجع|متجر|fast[\s-]?food|restaurant|caf[ée]|hotel|pizzeria|seafood|مشاوي)/i);
    if (tm) { patch.typeText = U().sanitizeText(tm[1], 60); fields++; }

    // المميزات
    var feats = [];
    if (/(dine[\s-]?in|الجلوس داخل|sur place|inside)/i.test(raw)) feats.push(L('الجلوس داخل المكان', 'Dine-in', 'Sur place'));
    if (/(takeaway|take[\s-]?away|سفري|à emporter|take out)/i.test(raw)) feats.push(L('طعام سفري', 'Takeaway', 'À emporter'));
    if (/(delivery|delivers|توصيل|livraison)/i.test(raw)) feats.push(L('خدمة التوصيل', 'Delivery', 'Livraison'));
    if (feats.length) { patch.features = feats; fields++; }

    // الوصف: أطول سطر وصفي
    var descLine = lines.filter(function (l) { return l.length > 25 && l.length < 300 && !/(http|www\.|St,|\+380|\(.*\)|مراجعة|review)/i.test(l); })
      .sort(function (a, b) { return b.length - a.length; })[0];
    if (descLine) { patch.descriptionText = U().sanitizeText(descLine, 400); fields++; }

    // شبكات التواصل
    var socials = {};
    urls.forEach(function (u) {
      if (/facebook|fb\.com/i.test(u)) socials.facebook = u;
      else if (/instagram/i.test(u)) socials.instagram = u;
      else if (/tiktok/i.test(u)) socials.tiktok = u;
      else if (/t\.me|telegram/i.test(u)) socials.telegram = u;
      else if (/youtube|youtu\.be/i.test(u)) socials.youtube = u;
    });
    if (Object.keys(socials).length) { patch.socials = socials; fields++; }

    // منتجات مقترحة من الأطباق المذكورة
    var low = raw.toLowerCase();
    var suggested = [];
    DISH_KEYWORDS.forEach(function (d) {
      if (d.k.some(function (k) { return low.indexOf(k.toLowerCase()) !== -1; })) {
        if (!suggested.some(function (s) { return s.name.ar === d.name.ar; })) suggested.push({ name: d.name, cat: d.cat });
      }
    });

    var imagesFound = findImageUrls(raw);

    return {
      patch: patch, suggestedProducts: suggested.slice(0, 12), imagesFound: imagesFound,
      stats: { fieldsExtracted: fields, productsFound: suggested.length, imagesFound: imagesFound.length }
    };
  }

  // تطبيق التصحيح على الحالة مع حماية البيانات اليدوية
  function applyPatch(state, result, mode) {
    var p = result.patch || {};
    var b = state.business;
    function keepSet(key, val) {
      if (mode === 'full') { b[key] = val; return; }
      var cur = b[key];
      var empty = (cur === '' || cur === null || cur === undefined || cur === 0);
      if (empty) b[key] = val;
    }
    if (p.name) keepSet('name', p.name);
    if (p.rating) keepSet('rating', p.rating);
    if (p.reviewsCount !== undefined) keepSet('reviewsCount', p.reviewsCount);
    if (p.priceRange) keepSet('priceRange', p.priceRange);
    if (p.phone) keepSet('phone', p.phone);
    if (p.email) keepSet('email', p.email);
    if (p.website) keepSet('website', p.website);
    if (p.orderUrl) keepSet('orderUrl', p.orderUrl);
    if (p.address) keepSet('address', p.address);
    if (p.mapsUrl) keepSet('mapsUrl', p.mapsUrl);
    if (p.plusCode) keepSet('plusCode', p.plusCode);
    if (p.typeText) {
      if (mode === 'full' || !b.type || !b.type.ar) b.type = L(p.typeText, b.type ? b.type.en : p.typeText, b.type ? b.type.fr : p.typeText);
    }
    if (p.descriptionText) {
      if (mode === 'full' || !b.description || !b.description.ar) b.description = L(p.descriptionText, b.description ? b.description.en : '', b.description ? b.description.fr : '');
    }
    if (p.features && (mode === 'full' || !(b.features || []).length)) b.features = p.features;
    if (p.socials) b.socials = Object.assign({}, b.socials, p.socials);
    if (p.hoursRaw) {
      if (mode === 'full' || !(b.hours || []).length) {
        b.hours = [{ day: L('يوميًا', 'Daily', 'Quotidien'), open: '', close: '', note: L(p.hoursRaw, p.hoursRaw, p.hoursRaw) }];
      }
    }
    state.meta.lastAnalysis = new Date().toISOString();
    state.meta.fieldsExtracted = result.stats.fieldsExtracted;
    state.meta.imagesFound = result.stats.imagesFound;
    return state;
  }

  global.GMapsParser = { analyze: analyze, applyPatch: applyPatch };
})(window);
