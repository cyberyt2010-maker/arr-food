/* Media — اختيار الصور/الفيديو من الجهاز + تحقق + ضغط + معاينة */
(function (global) {
  'use strict';

  var IMG_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  var VID_MIME = ['video/mp4', 'video/webm'];
  var IMG_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  var VID_EXT = ['mp4', 'webm'];
  var MAX_IMG = 8 * 1024 * 1024;      // 8MB قبل الضغط
  var MAX_VID = 25 * 1024 * 1024;     // 25MB
  var MAX_DIM = 1600;

  function extOf(name) { return (String(name || '').split('.').pop() || '').toLowerCase(); }

  function validateFile(file, kind) {
    if (!file) return { ok: false, reason: 'no-file' };
    var ext = extOf(file.name);
    if (kind === 'video') {
      if (VID_MIME.indexOf(file.type) === -1 || VID_EXT.indexOf(ext) === -1) return { ok: false, reason: 'bad-type' };
      if (file.size > MAX_VID) return { ok: false, reason: 'too-big' };
      return { ok: true };
    }
    if (IMG_MIME.indexOf(file.type) === -1 || IMG_EXT.indexOf(ext) === -1) return { ok: false, reason: 'bad-type' };
    if (file.size > MAX_IMG) return { ok: false, reason: 'too-big' };
    return { ok: true };
  }

  function pickFile(accept) {
    return new Promise(function (resolve) {
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = accept;
      inp.setAttribute('aria-label', 'file');
      inp.onchange = function () { resolve(inp.files && inp.files[0] ? inp.files[0] : null); };
      inp.oncancel = function () { resolve(null); };
      inp.click();
    });
  }

  // ضغط الصورة عبر canvas لتقليل استهلاك localStorage
  function imageToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth, h = img.naturalHeight;
          var scale = Math.min(1, MAX_DIM / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
          var cv = document.createElement('canvas');
          cv.width = cw; cv.height = ch;
          cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
          URL.revokeObjectURL(url);
          var out = cv.toDataURL('image/jpeg', 0.82);
          if (file.type === 'image/png' && out.length > file.size * 1.4) {
            // احتفظ بالشفافية إن كانت الصورة صغيرة
            var r = new FileReader();
            r.onload = function () { resolve(String(r.result)); };
            r.onerror = reject;
            r.readAsDataURL(file);
            return;
          }
          resolve(out);
        } catch (e) { URL.revokeObjectURL(url); reject(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result)); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  // دالة موحدة: اختيار من الجهاز + تحقق + معالجة → DataURL
  function chooseFromDevice(kind, onStatus) {
    onStatus = onStatus || function () {};
    var accept = kind === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/gif';
    onStatus('picking');
    return pickFile(accept).then(function (file) {
      if (!file) { onStatus('idle'); return null; }
      var v = validateFile(file, kind);
      if (!v.ok) { onStatus('error:' + v.reason); return null; }
      onStatus('processing');
      var job = (kind === 'video') ? fileToDataUrl(file) : imageToDataUrl(file);
      return job.then(function (dataUrl) {
        onStatus('done');
        return { dataUrl: dataUrl, name: global.Utils.safeName(file.name), size: file.size, type: file.type };
      }).catch(function () { onStatus('error:decode'); return null; });
    });
  }

  function isExternalImageUrl(u) {
    if (!u) return false;
    return /^(https?:\/\/|blob:).+/i.test(u) && !/^javascript:/i.test(u);
  }

  global.Media = {
    validateFile: validateFile, pickFile: pickFile,
    imageToDataUrl: imageToDataUrl, fileToDataUrl: fileToDataUrl,
    chooseFromDevice: chooseFromDevice, isExternalImageUrl: isExternalImageUrl,
    MAX_IMG: MAX_IMG, MAX_VID: MAX_VID
  };
})(window);
