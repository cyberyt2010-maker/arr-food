/* Effects — 3D خفيف + Parallax + Reveal + Tilt (مع Fallback كامل) */
(function (global) {
  'use strict';

  function reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function isWeakDevice() {
    try {
      var mem = navigator.deviceMemory || 8;
      var cores = navigator.hardwareConcurrency || 8;
      return mem <= 3 || cores <= 4 || Math.min(screen.width, screen.height) < 380;
    } catch (e) { return false; }
  }

  /* ---------- خلفية Hero: Three.js إن توفر، وإلا Canvas خفيف ---------- */
  function initHeroFX(canvas, accent) {
    if (!canvas || reducedMotion()) return function () {};
    accent = accent || '#E4002B';
    if (global.THREE && !isWeakDevice()) {
      try { return initThree(canvas, accent); } catch (e) { /* fallback */ }
    }
    return initParticles(canvas, accent);
  }

  function initParticles(canvas, accent) {
    var ctx = canvas.getContext('2d');
    var W, H, parts = [], raf = 0, running = true;
    var N = (Math.min(window.innerWidth, 1200) / 22) | 0;
    N = Math.max(24, Math.min(70, N));
    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width; H = canvas.height = r.height;
    }
    function spawn(i) {
      parts[i] = {
        x: Math.random() * W, y: Math.random() * H,
        r: 1 + Math.random() * 3.2, s: 0.15 + Math.random() * 0.55,
        a: 0.08 + Math.random() * 0.3, ph: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.25
      };
    }
    resize();
    for (var i = 0; i < N; i++) spawn(i);
    var mx = 0.5, my = 0.5;
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      var cx = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX);
      var cy = (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY);
      mx = (cx - r.left) / r.width; my = (cy - r.top) / r.height;
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    var t = 0;
    function frame() {
      if (!running) return;
      t += 0.008;
      ctx.clearRect(0, 0, W, H);
      // توهج خلفي
      var g = ctx.createRadialGradient(W * (0.72 + (mx - 0.5) * 0.1), H * 0.42, 10, W * 0.72, H * 0.42, Math.max(W, H) * 0.6);
      g.addColorStop(0, hexA(accent, 0.20)); g.addColorStop(1, hexA(accent, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.s; p.x += Math.sin(t * 2 + p.ph) * 0.25 + (mx - 0.5) * 0.3;
        if (p.y < -8) { p.y = H + 8; p.x = Math.random() * W; }
        ctx.beginPath();
        ctx.fillStyle = p.gold ? 'rgba(255,184,0,' + p.a + ')' : hexA(accent, p.a);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    frame();
    window.addEventListener('resize', resize);
    return function () { running = false; cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); };
  }

  function hexA(hex, a) {
    var h = String(hex || '#E4002B').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  // مشهد Three.js خفيف: حلقات عائمة بألوان الهوية (اختياري)
  function initThree(canvas, accent) {
    var THREE = global.THREE;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    cam.position.z = 9;
    var group = new THREE.Group();
    scene.add(group);
    var colA = new THREE.Color(accent || '#E4002B');
    var colB = new THREE.Color('#FFB800');
    var geos = [];
    for (var i = 0; i < 3; i++) {
      var geo = new THREE.TorusGeometry(2.4 - i * 0.55, 0.10 - i * 0.015, 18, 90);
      var mat = new THREE.MeshStandardMaterial({ color: i === 1 ? colB : colA, roughness: 0.35, metalness: 0.55, transparent: true, opacity: 0.9 });
      var m = new THREE.Mesh(geo, mat);
      m.rotation.x = Math.PI / 2.6 + i * 0.28;
      m.rotation.y = i * 0.5;
      group.add(m); geos.push(m);
    }
    // جزيئات
    var pGeo = new THREE.BufferGeometry();
    var N = 220, pos = new Float32Array(N * 3);
    for (var j = 0; j < N; j++) { pos[j * 3] = (Math.random() - 0.5) * 16; pos[j * 3 + 1] = (Math.random() - 0.5) * 10; pos[j * 3 + 2] = (Math.random() - 0.5) * 8; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: colB, size: 0.05, transparent: true, opacity: 0.7 }));
    scene.add(pts);
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(4, 6, 6); scene.add(key);
    group.position.x = 2.6;
    var mx = 0, my = 0, running = true, raf = 0;
    function onMove(e) { mx = (e.clientX / window.innerWidth - 0.5); my = (e.clientY / window.innerHeight - 0.5); }
    window.addEventListener('pointermove', onMove, { passive: true });
    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      cam.aspect = r.width / Math.max(1, r.height);
      cam.updateProjectionMatrix();
      group.position.x = r.width < 760 ? 0 : 2.6;
      group.position.y = r.width < 760 ? 1.8 : 0;
      pts.visible = r.width >= 760;
    }
    resize();
    window.addEventListener('resize', resize);
    var clock = new THREE.Clock();
    (function tick() {
      if (!running) return;
      var t = clock.getElapsedTime();
      geos.forEach(function (m, i) { m.rotation.z = t * (0.12 + i * 0.06); });
      group.rotation.y += ((mx * 0.6) - group.rotation.y) * 0.04;
      group.rotation.x += ((my * 0.4) - group.rotation.x) * 0.04;
      pts.rotation.y = t * 0.02;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    })();
    return function () { running = false; cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); try { renderer.dispose(); } catch (e) {} };
  }

  /* ---------- Reveal عند الظهور ---------- */
  var revealObs = null;
  function initReveal() {
    var els = document.querySelectorAll('.rv');
    if (!els.length) return;
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    if (revealObs) revealObs.disconnect();
    revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { revealObs.observe(el); });
  }
  function refreshReveal() { initReveal(); }

  /* ---------- Parallax خفيف + Tilt للبطاقات ---------- */
  function initParallax(scope) {
    if (reducedMotion()) return;
    var els = (scope || document).querySelectorAll('[data-plx]');
    if (!els.length) return;
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var center = (r.top + r.height / 2 - vh / 2) / vh;
        var f = parseFloat(el.getAttribute('data-plx')) || 0.08;
        el.style.transform = 'translate3d(0,' + (-center * f * 220).toFixed(1) + 'px,0)';
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  function initTilt(scope) {
    if (reducedMotion()) return;
    var els = (scope || document).querySelectorAll('[data-tilt]');
    els.forEach(function (el) {
      if (el.__tilt) return; el.__tilt = true;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- نغمة طلب جديد (WebAudio) ---------- */
  function playNewOrderTone() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
      var notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        var t0 = ctx.currentTime + i * 0.16;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0); o.stop(t0 + 0.36);
      });
      setTimeout(function () { try { ctx.close(); } catch (e) {} }, 1400);
    } catch (e) { /* noop */ }
  }

  global.Effects = {
    initHeroFX: initHeroFX, initReveal: initReveal, refreshReveal: refreshReveal,
    initParallax: initParallax, initTilt: initTilt,
    reducedMotion: reducedMotion, playNewOrderTone: playNewOrderTone
  };
})(window);
