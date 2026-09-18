/* ============================================================
   Schema v1 — نموذج البيانات المركزي الوحيد للموقع
   كل المكونات تقرأ من هنا. ممنوع تكرار القيم يدويًا.
   ============================================================ */
(function (global) {
  'use strict';

  var VERSION = 1;
  var STORE_KEY = 'kfc_vinnytsia_site_v1';
  var CART_KEY = 'kfc_vinnytsia_cart_v1';

  var CURRENCIES = {
    USD: { symbol: '$', label: 'USD — $' },
    EUR: { symbol: '€', label: 'EUR — €' },
    GBP: { symbol: '£', label: 'GBP — £' },
    SAR: { symbol: 'ر.س', label: 'SAR — ر.س' },
    DZD: { symbol: 'دج', label: 'DZD — دج' },
    UAH: { symbol: '₴', label: 'UAH — ₴' }
  };
  var DEFAULT_CURRENCY = 'USD';

  var ORDER_STATUSES = ['pending', 'preparing', 'ready', 'done', 'cancelled'];

  var THEME_PRESETS = {
    'kfc-red': {
      label: { ar: 'أحمر KFC', en: 'KFC Red', fr: 'Rouge KFC' },
      primary: '#E4002B', background: '#FFF9F4', text: '#1B1410',
      secondary: '#FFB800', button: '#E4002B', card: '#FFFFFF',
      border: '#F0E0D2', header: '#161110', footer: '#161110',
      alert: '#B00020', price: '#C40024'
    },
    'midnight-gold': {
      label: { ar: 'ليلي فاخر', en: 'Midnight Gold', fr: 'Or minuit' },
      primary: '#C9A227', background: '#12100D', text: '#F5EFE4',
      secondary: '#8A6D1B', button: '#C9A227', card: '#1D1913',
      border: '#33291A', header: '#0C0A07', footer: '#0C0A07',
      alert: '#E5484D', price: '#E7B958'
    },
    'fresh-green': {
      label: { ar: 'أخضر طازج', en: 'Fresh Green', fr: 'Vert frais' },
      primary: '#1E7A46', background: '#F6FBF4', text: '#14231A',
      secondary: '#F2B705', button: '#1E7A46', card: '#FFFFFF',
      border: '#DDEBD9', header: '#10231A', footer: '#10231A',
      alert: '#B00020', price: '#14632F'
    },
    'ocean': {
      label: { ar: 'محيطي', en: 'Ocean', fr: 'Océan' },
      primary: '#0E63B6', background: '#F3F8FD', text: '#10222F',
      secondary: '#22B8CF', button: '#0E63B6', card: '#FFFFFF',
      border: '#D3E4F2', header: '#0B1D2A', footer: '#0B1D2A',
      alert: '#B00020', price: '#0B4E8F'
    }
  };

  var FONT_CHOICES = [
    'Cairo', 'Tajawal', 'Almarai', 'Inter', 'Poppins', 'Rubik', 'Outfit', ' system'
  ];

  function L(ar, en, fr) { return { ar: ar || '', en: en || ar || '', fr: fr || en || ar || '' }; }

  function defaultState() {
    return {
      version: VERSION,
      business: {
        name: 'KFC',
        tagline: L('سطول الدجاج المقلي الشهيرة وأطباق الكومبو', 'Famous fried chicken buckets, combos & sides', 'Célèbres seaux de poulet frit, combos et accompagnements'),
        description: L(
          'سلسلة مطاعم تشتهر بسطول الدجاج المقلي وأطباق الكومبو والأطباق الجانبية. جلوس داخل المكان، طعام سفري، وخدمة توصيل.',
          'A restaurant chain famous for fried chicken buckets, combo meals and side dishes. Dine-in, takeaway and delivery service.',
          'Une chaîne célèbre pour ses seaux de poulet frit, ses combos et ses accompagnements. Sur place, à emporter et livraison.'
        ),
        type: L('مطعم وجبات سريعة', 'Fast food restaurant', 'Restaurant fast-food'),
        cuisine: L('دجاج مقلي', 'Fried chicken', 'Poulet frit'),
        priceRange: '200–400 ₴',
        priceNote: L('للفرد الواحد', 'per person', 'par personne'),
        rating: 4.6,
        reviewsCount: 443,
        address: 'Pyrohova St, 47а, Vinnytsia, Vinnytsia Oblast, Ukraine, 21000',
        plusCode: '6CGX+JC Vinnytsia, Vinnytsia Oblast, Ukraine',
        phone: '+380 67 551 5759',
        email: '',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('KFC Pyrohova St, 47а, Vinnytsia, Ukraine'),
        lat: '', lng: '',
        hours: [
          { day: L('الجمعة', 'Friday', 'Vendredi'), open: '09:00', close: '22:00', note: L('يفتح 9:00 صباحًا', 'Opens 9:00 AM', 'Ouverture 9h00') },
          { day: L('السبت — الخميس', 'Saturday — Thursday', 'Samedi — Jeudi'), open: '09:00', close: '22:00', note: L('يغلق 10:00 مساءً', 'Closes 10:00 PM', 'Fermeture 22h00') }
        ],
        features: [L('الجلوس داخل المكان', 'Dine-in', 'Sur place'), L('طعام سفري', 'Takeaway', 'À emporter'), L('خدمة التوصيل', 'Delivery', 'Livraison')],
        orderUrl: 'https://order.kfc.ua',
        website: 'https://kfc.ua',
        whatsapp: '',
        socials: { facebook: '', instagram: '', tiktok: '', telegram: '', youtube: '', x: '' },
        footerText: L('جميع الحقوق محفوظة', 'All rights reserved', 'Tous droits réservés'),
        logoImage: ''
      },
      theme: Object.assign({ preset: 'kfc-red' }, THEME_PRESETS['kfc-red'], {
        headingFont: 'Cairo', bodyFont: 'Tajawal', headingSize: 46, fontWeight: 800,
        radius: 18, shadow: 'medium', buttonStyle: 'rounded'
      }),
      layout: {
        sectionsOrder: ['hero', 'info-strip', 'categories', 'products', 'about', 'reviews', 'location', 'contact'],
        sectionsVisible: { hero: true, 'info-strip': true, categories: true, products: true, about: true, reviews: true, location: true, contact: true },
        showRating: true, showMap: true, showContact: true, showPrices: true,
        heroStyle: 'split-3d', cardStyle: 'modern', columns: 3
      },
      categories: [
        { id: 'cat-buckets', name: L('السطول', 'Buckets', 'Seaux'), icon: '🍗', sort: 1 },
        { id: 'cat-combos', name: L('الكومبو', 'Combos', 'Combos'), icon: '🍱', sort: 2 },
        { id: 'cat-sides', name: L('الأطباق الجانبية', 'Sides', 'Accompagnements'), icon: '🍟', sort: 3 },
        { id: 'cat-burgers', name: L('البرجر', 'Burgers', 'Burgers'), icon: '🍔', sort: 4 },
        { id: 'cat-drinks', name: L('المشروبات', 'Drinks', 'Boissons'), icon: '🥤', sort: 5 }
      ],
      products: [
        {
          id: 'p-bucket9', categoryId: 'cat-buckets', price: 349, oldPrice: 0, currency: 'UAH',
          name: L('سطل دجاج مقلي — 9 قطع', 'Fried Chicken Bucket — 9 pc', 'Seau de poulet frit — 9 pcs'),
          desc: L('قطع دجاج مقلي ذهبية ومقرمشة بخلطة الأعشاب الشهيرة، تكفي العائلة.', 'Golden crispy fried chicken with the famous herb blend. Perfect for sharing.', 'Poulet frit doré et croustillant aux herbes célèbres. Idéal à partager.'),
          image: 'assets/images/hero-bucket.png', alt: L('سطل دجاج مقلي', 'Fried chicken bucket', 'Seau de poulet'),
          details: L('9 قطع دجاج + صوصان', '9 chicken pieces + 2 dips', '9 morceaux + 2 sauces'),
          badge: L('الأكثر طلبًا', 'Best seller', 'Meilleure vente'),
          available: true, delivery: 'inherit', sort: 1
        },
        {
          id: 'p-combo', categoryId: 'cat-combos', price: 259, oldPrice: 299, currency: 'UAH',
          name: L('وجبة كومبو', 'Combo Meal', 'Menu Combo'),
          desc: L('تشكيلة دجاج مقرمش + بطاطس + مشروب من اختيارك.', 'Crispy chicken selection + fries + a drink of your choice.', 'Sélection de poulet croustillant + frites + boisson au choix.'),
          image: 'assets/images/product-tenders.png', alt: L('وجبة كومبو', 'Combo meal', 'Menu combo'),
          details: '', badge: L('عرض', 'Deal', 'Offre'),
          available: true, delivery: 'inherit', sort: 2
        },
        {
          id: 'p-fries', categoryId: 'cat-sides', price: 129, oldPrice: 0, currency: 'UAH',
          name: L('سطل بطاطس مقلية', 'Fries Bucket', 'Seau de frites'),
          desc: L('بطاطس ذهبية مقرمشة بملح البحر — Бакет Картоплі Фрі.', 'Golden crispy fries with sea salt.', 'Frites dorées et croustillantes au sel de mer.'),
          image: 'assets/images/product-fries.png', alt: L('بطاطس مقلية', 'French fries', 'Frites'),
          details: '', badge: L('رائج', 'Popular', 'Populaire'),
          available: true, delivery: 'inherit', sort: 3
        },
        {
          id: 'p-burger', categoryId: 'cat-burgers', price: 179, oldPrice: 0, currency: 'UAH',
          name: L('برجر دجاج مقرمش', 'Crispy Chicken Burger', 'Burger poulet croustillant'),
          desc: L('صدر دجاج مقرمش، جبنة شيدر، خس طازج، خبز بريوش.', 'Crispy chicken fillet, cheddar, fresh lettuce, brioche bun.', 'Filet de poulet croustillant, cheddar, salade fraîche, pain brioché.'),
          image: 'assets/images/product-burger.png', alt: L('برجر دجاج', 'Chicken burger', 'Burger poulet'),
          details: '', badge: L('', '', ''),
          available: true, delivery: 'inherit', sort: 4
        },
        {
          id: 'p-tenders5', categoryId: 'cat-sides', price: 159, oldPrice: 0, currency: 'UAH',
          name: L('أصابع تندرز — 5 قطع', 'Tenders — 5 pc', 'Tenders — 5 pcs'),
          desc: L('أصابع دجاج طرية مقرمشة مع صوصات التغميس.', 'Tender crispy chicken strips with dipping sauces.', 'Aiguillettes de poulet croustillantes avec sauces.'),
          image: 'assets/images/product-tenders.png', alt: L('تندرز الدجاج', 'Chicken tenders', 'Tenders de poulet'),
          details: '', badge: L('', '', ''),
          available: true, delivery: 'inherit', sort: 5
        },
        {
          id: 'p-pepsi', categoryId: 'cat-drinks', price: 49, oldPrice: 0, currency: 'UAH',
          name: L('بيبسي زيرو', 'Pepsi Zero', 'Pepsi Zéro'),
          desc: L('مشروب غازي بدون سكر — Пепсі Попкорн Нуль Цукру.', 'Zero-sugar soft drink, ice cold.', 'Boisson gazeuse sans sucre, bien fraîche.'),
          image: 'assets/images/placeholder.svg', alt: L('بيبسي', 'Pepsi', 'Pepsi'),
          details: '', badge: L('', '', ''),
          available: true, delivery: 'inherit', sort: 6
        }
      ],
      media: [],
      hero: { image: 'assets/images/hero-bucket.png', video: '', alt: L('سطل دجاج KFC', 'KFC chicken bucket', 'Seau de poulet KFC') },
      orders: [],
      settings: { deliveryEnabled: true, soundEnabled: false, language: 'ar', currency: 'UAH', orderCounter: 1000 },
      admin: { passwordHash: '', salt: '', recovery: [], createdAt: '', failedAttempts: 0, lockedUntil: 0 },
      meta: { lastAnalysis: 'seed', fieldsExtracted: 18, imagesFound: 4, notes: '' }
    };
  }

  /* نسبة اكتمال الملف: حقول أساسية + منتجات + صور */
  function computeCompleteness(state) {
    var b = state.business || {};
    var checks = [
      !!b.name, !!(b.description && (b.description.ar || b.description.en)),
      !!b.address, !!b.phone, !!b.mapsUrl,
      (b.hours || []).length > 0, (b.features || []).length > 0,
      b.rating > 0, !!b.priceRange, !!b.website,
      (state.products || []).length > 0, (state.categories || []).length > 0,
      !!(state.hero && state.hero.image), !!b.whatsapp, !!b.email, !!b.logoImage
    ];
    var done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }

  global.Schema = {
    VERSION: VERSION, STORE_KEY: STORE_KEY, CART_KEY: CART_KEY,
    CURRENCIES: CURRENCIES, DEFAULT_CURRENCY: DEFAULT_CURRENCY,
    ORDER_STATUSES: ORDER_STATUSES, THEME_PRESETS: THEME_PRESETS,
    FONT_CHOICES: FONT_CHOICES, L: L,
    defaultState: defaultState, computeCompleteness: computeCompleteness
  };
})(window);
