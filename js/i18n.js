/* I18N — قواميس الواجهة (ar / en / fr) */
(function (global) {
  'use strict';
  var D = {
    ar: {
      'nav.menu': 'المنيو', 'nav.about': 'من نحن', 'nav.location': 'الموقع', 'nav.contact': 'تواصل',
      'nav.order': 'اطلب الآن', 'nav.admin': 'إدارة الموقع', 'nav.cart': 'السلة',
      'hero.badge': 'تقييم عملائنا', 'hero.reviews': 'مراجعة', 'hero.browse': 'تصفح المنتجات',
      'hero.contact': 'التواصل والموقع', 'hero.perPerson': 'للفرد',
      'filter.all': 'الكل', 'filter.search': 'ابحث عن وجبتك…', 'filter.clear': 'مسح الفلترة',
      'filter.none': 'لا توجد نتائج مطابقة — جرّب كلمة أخرى أو امسح الفلترة.',
      'products.title': 'المنيو والمنتجات', 'products.empty': 'أضف منتجاتك من لوحة التحكم',
      'products.emptySub': 'لم تتم إضافة منتجات بعد. يمكن للمالك إضافتها من لوحة التحكم.',
      'card.add': 'أضف للسلة', 'card.details': 'التفاصيل', 'card.unavailable': 'غير متوفر',
      'card.noDelivery': 'بدون توصيل', 'card.oldPrice': 'بدل',
      'about.title': 'عن المطعم', 'about.features': 'مميزاتنا',
      'reviews.title': 'التقييم والمراجعات', 'reviews.based': 'بناءً على مراجعات Google',
      'location.title': 'موقعنا', 'location.open': 'فتح في خرائط جوجل', 'location.hours': 'ساعات العمل',
      'contact.title': 'تواصل معنا', 'contact.phone': 'الهاتف', 'contact.email': 'البريد',
      'contact.address': 'العنوان', 'contact.whatsapp': 'واتساب',
      'footer.rights': 'جميع الحقوق محفوظة',
      'cart.title': 'سلة الطلب', 'cart.empty': 'سلتك فارغة', 'cart.emptySub': 'أضف بعض الوجبات اللذيذة وابدأ الطلب.',
      'cart.total': 'الإجمالي', 'cart.checkout': 'إتمام الطلب', 'cart.continue': 'مواصلة التسوق',
      'cart.remove': 'حذف', 'cart.deliveryWarn': 'تنبيه: بعض المنتجات في السلة لا تدعم التوصيل.',
      'co.title': 'إتمام الطلب', 'co.name': 'الاسم الكامل', 'co.phone': 'رقم الهاتف',
      'co.type': 'نوع الطلب', 'co.delivery': 'توصيل', 'co.pickup': 'استلام من المطعم', 'co.dinein': 'جلوس داخل المكان',
      'co.address': 'عنوان التوصيل', 'co.notes': 'ملاحظات (اختياري)', 'co.submit': 'تأكيد الطلب',
      'co.via': 'إرسال الطلب عبر WhatsApp', 'co.success': 'تم حفظ طلبك بنجاح! رقم الطلب:',
      'co.retryWa': 'إعادة فتح WhatsApp', 'co.invalid': 'يرجى مراجعة بيانات الطلب.',
      'co.noDeliveryOpt': 'التوصيل غير متاح حاليًا — اختر الاستلام من المطعم.',
      'co.blocked': 'لا يمكن إتمام طلب توصيل: السلة تحتوي منتجات غير قابلة للتوصيل.',
      'login.title': 'دخول الإدارة', 'login.pass': 'كلمة المرور', 'login.btn': 'دخول',
      'login.forgot': 'نسيت كلمة المرور؟', 'login.err': 'كلمة المرور غير صحيحة.',
      'login.locked': 'تم إيقاف المحاولات مؤقتًا — حاول لاحقًا.',
      'setup.title': 'إنشاء حساب المالك (أول مرة)', 'setup.pass': 'كلمة مرور جديدة',
      'setup.confirm': 'تأكيد كلمة المرور', 'setup.q': 'سؤال الاسترداد', 'setup.a': 'الإجابة',
      'setup.btn': 'إنشاء الحساب', 'setup.mismatch': 'كلمتا المرور غير متطابقتين.',
      'setup.weak': 'كلمة المرور قصيرة — 6 أحرف على الأقل.', 'setup.need3': 'يجب إدخال 3 أسئلة وإجابات مختلفة.',
      'admin.title': 'لوحة التحكم', 'admin.view': 'عرض الموقع', 'admin.logout': 'تسجيل الخروج',
      'admin.overview': 'نظرة عامة', 'admin.import': 'استيراد Google Maps', 'admin.info': 'المعلومات الأساسية',
      'admin.theme': 'المظهر والهوية', 'admin.media': 'الصور والوسائط', 'admin.products': 'المنتجات',
      'admin.cats': 'التصنيفات', 'admin.orders': 'الطلبات', 'admin.wa': 'WhatsApp والتوصيل',
      'admin.security': 'الأمان', 'admin.data': 'البيانات واللغة',
      'ov.complete': 'اكتمال الملف', 'ov.products': 'المنتجات', 'ov.cats': 'التصنيفات',
      'ov.orders': 'الطلبات', 'ov.images': 'الصور', 'ov.latest': 'آخر الطلبات',
      'ov.analyzed': 'تم تحليل البيانات', 'ov.fields': 'الحقول المستخرجة',
      'ov.noOrders': 'لا توجد طلبات بعد.', 'ov.new': 'طلب جديد!',
      'cm.save': 'حفظ', 'cm.cancel': 'إلغاء', 'cm.delete': 'حذف', 'cm.edit': 'تعديل',
      'cm.add': 'إضافة', 'cm.close': 'إغلاق', 'cm.saved': 'تم الحفظ بنجاح',
      'cm.confirmDel': 'هل أنت متأكد من الحذف؟', 'cm.preview': 'معاينة مباشرة',
      'cm.status': 'الحالة', 'cm.actions': 'إجراءات', 'cm.search': 'بحث…',
      'st.pending': 'قيد الانتظار', 'st.preparing': 'قيد التحضير', 'st.ready': 'جاهز',
      'st.done': 'مكتمل', 'st.cancelled': 'ملغى',
      'snd.enable': 'تفعيل التنبيه الصوتي', 'snd.on': 'التنبيه الصوتي مفعّل', 'snd.off': 'التنبيه الصوتي متوقف'
    },
    en: {
      'nav.menu': 'Menu', 'nav.about': 'About', 'nav.location': 'Location', 'nav.contact': 'Contact',
      'nav.order': 'Order Now', 'nav.admin': 'Manage Site', 'nav.cart': 'Cart',
      'hero.badge': 'Our rating', 'hero.reviews': 'reviews', 'hero.browse': 'Browse Menu',
      'hero.contact': 'Contact & Location', 'hero.perPerson': 'per person',
      'filter.all': 'All', 'filter.search': 'Search your meal…', 'filter.clear': 'Clear filters',
      'filter.none': 'No matching results — try another keyword or clear filters.',
      'products.title': 'Menu & Products', 'products.empty': 'Add your products from the dashboard',
      'products.emptySub': 'No products yet. The owner can add them from the dashboard.',
      'card.add': 'Add to Cart', 'card.details': 'Details', 'card.unavailable': 'Unavailable',
      'card.noDelivery': 'No delivery', 'card.oldPrice': 'was',
      'about.title': 'About Us', 'about.features': 'Our highlights',
      'reviews.title': 'Rating & Reviews', 'reviews.based': 'Based on Google reviews',
      'location.title': 'Our Location', 'location.open': 'Open in Google Maps', 'location.hours': 'Working hours',
      'contact.title': 'Contact Us', 'contact.phone': 'Phone', 'contact.email': 'Email',
      'contact.address': 'Address', 'contact.whatsapp': 'WhatsApp',
      'footer.rights': 'All rights reserved',
      'cart.title': 'Your Order', 'cart.empty': 'Your cart is empty', 'cart.emptySub': 'Add some tasty meals to get started.',
      'cart.total': 'Total', 'cart.checkout': 'Checkout', 'cart.continue': 'Continue shopping',
      'cart.remove': 'Remove', 'cart.deliveryWarn': 'Note: some items in your cart do not support delivery.',
      'co.title': 'Checkout', 'co.name': 'Full name', 'co.phone': 'Phone number',
      'co.type': 'Order type', 'co.delivery': 'Delivery', 'co.pickup': 'Pickup', 'co.dinein': 'Dine-in',
      'co.address': 'Delivery address', 'co.notes': 'Notes (optional)', 'co.submit': 'Confirm Order',
      'co.via': 'Send Order via WhatsApp', 'co.success': 'Order saved successfully! Order No:',
      'co.retryWa': 'Re-open WhatsApp', 'co.invalid': 'Please review your order details.',
      'co.noDeliveryOpt': 'Delivery is unavailable — please choose pickup.',
      'co.blocked': 'Delivery checkout blocked: cart contains non-deliverable items.',
      'login.title': 'Admin Login', 'login.pass': 'Password', 'login.btn': 'Login',
      'login.forgot': 'Forgot password?', 'login.err': 'Incorrect password.',
      'login.locked': 'Too many attempts — try again later.',
      'setup.title': 'Create Owner Account (first time)', 'setup.pass': 'New password',
      'setup.confirm': 'Confirm password', 'setup.q': 'Recovery question', 'setup.a': 'Answer',
      'setup.btn': 'Create Account', 'setup.mismatch': 'Passwords do not match.',
      'setup.weak': 'Password too short — at least 6 characters.', 'setup.need3': 'Please enter 3 different questions and answers.',
      'admin.title': 'Dashboard', 'admin.view': 'View Site', 'admin.logout': 'Log out',
      'admin.overview': 'Overview', 'admin.import': 'Google Maps Import', 'admin.info': 'Business Info',
      'admin.theme': 'Theme & Identity', 'admin.media': 'Media', 'admin.products': 'Products',
      'admin.cats': 'Categories', 'admin.orders': 'Orders', 'admin.wa': 'WhatsApp & Delivery',
      'admin.security': 'Security', 'admin.data': 'Data & Language',
      'ov.complete': 'Profile completeness', 'ov.products': 'Products', 'ov.cats': 'Categories',
      'ov.orders': 'Orders', 'ov.images': 'Images', 'ov.latest': 'Latest orders',
      'ov.analyzed': 'Data analyzed', 'ov.fields': 'Extracted fields',
      'ov.noOrders': 'No orders yet.', 'ov.new': 'New order!',
      'cm.save': 'Save', 'cm.cancel': 'Cancel', 'cm.delete': 'Delete', 'cm.edit': 'Edit',
      'cm.add': 'Add', 'cm.close': 'Close', 'cm.saved': 'Saved successfully',
      'cm.confirmDel': 'Are you sure?', 'cm.preview': 'Live preview',
      'cm.status': 'Status', 'cm.actions': 'Actions', 'cm.search': 'Search…',
      'st.pending': 'Pending', 'st.preparing': 'Preparing', 'st.ready': 'Ready',
      'st.done': 'Done', 'st.cancelled': 'Cancelled',
      'snd.enable': 'Enable sound alerts', 'snd.on': 'Sound alerts ON', 'snd.off': 'Sound alerts OFF'
    },
    fr: {
      'nav.menu': 'Menu', 'nav.about': 'À propos', 'nav.location': 'Adresse', 'nav.contact': 'Contact',
      'nav.order': 'Commander', 'nav.admin': 'Gérer le site', 'nav.cart': 'Panier',
      'hero.badge': 'Notre note', 'hero.reviews': 'avis', 'hero.browse': 'Voir le menu',
      'hero.contact': 'Contact & Adresse', 'hero.perPerson': 'par personne',
      'filter.all': 'Tout', 'filter.search': 'Rechercher un plat…', 'filter.clear': 'Effacer les filtres',
      'filter.none': 'Aucun résultat — essayez un autre mot ou effacez les filtres.',
      'products.title': 'Menu & Produits', 'products.empty': 'Ajoutez vos produits depuis le tableau de bord',
      'products.emptySub': 'Aucun produit pour le moment.',
      'card.add': 'Ajouter', 'card.details': 'Détails', 'card.unavailable': 'Indisponible',
      'card.noDelivery': 'Sans livraison', 'card.oldPrice': 'au lieu de',
      'about.title': 'À propos', 'about.features': 'Nos atouts',
      'reviews.title': 'Note & Avis', 'reviews.based': 'Basé sur les avis Google',
      'location.title': 'Notre adresse', 'location.open': 'Ouvrir dans Google Maps', 'location.hours': 'Horaires',
      'contact.title': 'Contactez-nous', 'contact.phone': 'Téléphone', 'contact.email': 'E-mail',
      'contact.address': 'Adresse', 'contact.whatsapp': 'WhatsApp',
      'footer.rights': 'Tous droits réservés',
      'cart.title': 'Votre commande', 'cart.empty': 'Votre panier est vide', 'cart.emptySub': 'Ajoutez de bons plats pour commencer.',
      'cart.total': 'Total', 'cart.checkout': 'Commander', 'cart.continue': 'Continuer mes achats',
      'cart.remove': 'Supprimer', 'cart.deliveryWarn': 'Attention : certains articles ne sont pas livrables.',
      'co.title': 'Finaliser la commande', 'co.name': 'Nom complet', 'co.phone': 'Téléphone',
      'co.type': 'Type de commande', 'co.delivery': 'Livraison', 'co.pickup': 'À emporter', 'co.dinein': 'Sur place',
      'co.address': 'Adresse de livraison', 'co.notes': 'Notes (optionnel)', 'co.submit': 'Confirmer',
      'co.via': 'Envoyer via WhatsApp', 'co.success': 'Commande enregistrée ! N° :',
      'co.retryWa': 'Rouvrir WhatsApp', 'co.invalid': 'Veuillez vérifier les détails.',
      'co.noDeliveryOpt': 'Livraison indisponible — choisissez le retrait.',
      'co.blocked': 'Livraison impossible : le panier contient des articles non livrables.',
      'login.title': 'Connexion admin', 'login.pass': 'Mot de passe', 'login.btn': 'Entrer',
      'login.forgot': 'Mot de passe oublié ?', 'login.err': 'Mot de passe incorrect.',
      'login.locked': 'Trop de tentatives — réessayez plus tard.',
      'setup.title': 'Créer le compte (première fois)', 'setup.pass': 'Nouveau mot de passe',
      'setup.confirm': 'Confirmer', 'setup.q': 'Question de récupération', 'setup.a': 'Réponse',
      'setup.btn': 'Créer le compte', 'setup.mismatch': 'Les mots de passe ne correspondent pas.',
      'setup.weak': 'Mot de passe trop court — 6 caractères min.', 'setup.need3': 'Veuillez saisir 3 questions et réponses différentes.',
      'admin.title': 'Tableau de bord', 'admin.view': 'Voir le site', 'admin.logout': 'Déconnexion',
      'admin.overview': 'Aperçu', 'admin.import': 'Import Google Maps', 'admin.info': 'Infos',
      'admin.theme': 'Thème', 'admin.media': 'Médias', 'admin.products': 'Produits',
      'admin.cats': 'Catégories', 'admin.orders': 'Commandes', 'admin.wa': 'WhatsApp & Livraison',
      'admin.security': 'Sécurité', 'admin.data': 'Données & Langue',
      'ov.complete': 'Profil complété', 'ov.products': 'Produits', 'ov.cats': 'Catégories',
      'ov.orders': 'Commandes', 'ov.images': 'Images', 'ov.latest': 'Dernières commandes',
      'ov.analyzed': 'Données analysées', 'ov.fields': 'Champs extraits',
      'ov.noOrders': 'Aucune commande.', 'ov.new': 'Nouvelle commande !',
      'cm.save': 'Enregistrer', 'cm.cancel': 'Annuler', 'cm.delete': 'Supprimer', 'cm.edit': 'Modifier',
      'cm.add': 'Ajouter', 'cm.close': 'Fermer', 'cm.saved': 'Enregistré avec succès',
      'cm.confirmDel': 'Confirmer la suppression ?', 'cm.preview': 'Aperçu en direct',
      'cm.status': 'Statut', 'cm.actions': 'Actions', 'cm.search': 'Rechercher…',
      'st.pending': 'En attente', 'st.preparing': 'En préparation', 'st.ready': 'Prête',
      'st.done': 'Terminée', 'st.cancelled': 'Annulée',
      'snd.enable': 'Activer les alertes sonores', 'snd.on': 'Alertes sonores ON', 'snd.off': 'Alertes sonores OFF'
    }
  };

  var LANGS = ['ar', 'en', 'fr'];
  function lang() {
    try { return (global.Store.get('settings.language')) || 'ar'; } catch (e) { return 'ar'; }
  }
  function t(key) {
    var l = LANGS.indexOf(lang()) !== -1 ? lang() : 'ar';
    return (D[l] && D[l][key]) || D.ar[key] || key;
  }
  function setLang(l) {
    if (LANGS.indexOf(l) === -1) l = 'ar';
    global.Store.set('settings.language', l);
    applyDir();
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
    try { document.dispatchEvent(new CustomEvent('site:lang')); } catch (e) { /* noop */ }
  }
  function applyDir() {
    var l = lang();
    document.documentElement.lang = l;
    document.documentElement.dir = (l === 'ar') ? 'rtl' : 'ltr';
  }
  global.I18N = { t: t, lang: lang, setLang: setLang, applyDir: applyDir, LANGS: LANGS };
})(window);
