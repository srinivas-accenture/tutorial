/* Day 49 in motion: DOM/SVG/Canvas/WebGL trade-offs, SVG vs canvas code, requestAnimationFrame and delta time,
   HiDPI canvas and OffscreenCanvas, feature detection and secure contexts, permissions in context,
   cross-tab coordination (BroadcastChannel, Web Locks, visibility) and WebRTC basics.
   Loaded on demand by assets/js/motion.js. */
(function () {
  function starts(lines, t0, cps) {
    var s = t0, out = [];
    lines.forEach(function (l) { out.push(s); s += l.length / cps + 0.08; });
    return out;
  }
  function rnd(i) { var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function dot(K, x, y, r, c, a) { var g = K.g; g.save(); g.globalAlpha *= K.clamp(a == null ? 1 : a); g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); }

JSC.motion.define('day49', {
  kicker: 'JavaScript: Zero to Architect · Day 49',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 49: drawing and animating in the browser, and using device features responsibly.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Graphics and device APIs', 0, 0, { size: 80, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 49 · Draw, animate, and ask nicely', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Canvas and SVG', 'requestAnimationFrame', 'Permissions'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ four drawing surfaces */
{ d: 26, title: 'Pick the right surface',
  caps: [
    [0.3, 'The browser has four ways to draw. DOM and CSS suit UI and simple animation, but thousands of nodes get slow.'],
    [6.5, 'SVG is vector shapes kept in the DOM: crisp at any size, styleable, clickable and accessible. Great for icons and charts.'],
    [13, 'Canvas is immediate-mode pixels: you draw, it forgets. Fast for games and huge plots, but no built-in accessibility or hit testing.'],
    [20, 'WebGL and WebGPU run shaders on the GPU, for 3D and massive data. Libraries like Three.js tame them.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var C = [['DOM + CSS', 'elements + styles', ['UI, simple animation'], ['thousands of nodes', 'get slow'], 0.6, P.blue],
             ['SVG', 'vector shapes in the DOM', ['icons, charts, diagrams', 'crisp and accessible'], ['many thousands of', 'elements get slow'], 6.8, P.acc],
             ['Canvas 2D', 'immediate-mode pixels', ['games, huge plots,', 'image processing'], ['no accessibility or', 'hit testing built in'], 13.2, P.warm],
             ['WebGL · WebGPU', 'GPU shaders', ['3D, massive data,', 'visual effects'], ['complex: use', 'Three.js or similar'], 20.2, P.purple]];
    C.forEach(function (c, i) {
      var x = 40 + i * 305, q = K.back((t - c[4]) / 0.6);
      if (q <= 0) return;
      var a = K.clamp(q), y = 86 + (1 - a) * 24, cx = x + 142;
      K.box(x, y, 285, 496, { stroke: c[5], a: a });
      K.text(c[0], cx, y + 32, { size: 23, weight: 700, color: c[5], align: 'center', a: a });
      K.text(c[1], cx, y + 64, { size: 16, color: P.muted, align: 'center', a: a });
      g.save(); g.globalAlpha *= a;
      if (i === 0) { [0, 1, 2].forEach(function (k) { K.box(x + 50, y + 100 + k * 50, 185, 38, { fill: P.code, stroke: c[5], r: 6 }); K.text('<div>', cx, y + 119 + k * 50, { size: 16, mono: true, color: c[5], align: 'center' }); }); }
      if (i === 1) {
        g.strokeStyle = c[5]; g.lineWidth = 3; g.beginPath();
        [[0, 120], [40, 90], [80, 105], [120, 60], [160, 75], [200, 30]].forEach(function (p, k) { var px = x + 42 + p[0], py = y + 110 + p[1]; if (k) g.lineTo(px, py); else g.moveTo(px, py); });
        g.stroke(); [[0, 120], [40, 90], [80, 105], [120, 60], [160, 75], [200, 30]].forEach(function (p) { dot(K, x + 42 + p[0], y + 110 + p[1], 6, c[5]); });
      }
      if (i === 2) { for (var k = 0; k < 140; k++) dot(K, x + 40 + rnd(k) * 205, y + 100 + rnd(k + 500) * 140, 3, k % 3 ? c[5] : P.red, 0.9); }
      if (i === 3) {
        var gr = g.createLinearGradient(x + 60, y + 240, x + 225, y + 100); gr.addColorStop(0, P.purple); gr.addColorStop(0.5, P.blue); gr.addColorStop(1, P.acc);
        g.fillStyle = gr; g.beginPath(); g.moveTo(cx, y + 100); g.lineTo(x + 235, y + 245); g.lineTo(x + 50, y + 245); g.closePath(); g.fill();
      }
      g.restore();
      K.text('Best for', x + 24, y + 290, { size: 16, weight: 700, color: P.green, a: a });
      c[2].forEach(function (s, k) { K.text(s, x + 24, y + 318 + k * 26, { size: 18, a: a }); });
      K.text('Watch out', x + 24, y + 392, { size: 16, weight: 700, color: P.warm, a: a });
      c[3].forEach(function (s, k) { K.text(s, x + 24, y + 420 + k * 26, { size: 18, a: a }); });
    });
  } },

/* 3 ─ SVG vs canvas in code */
{ d: 25, title: 'SVG vs canvas in code',
  caps: [
    [0.3, 'In SVG, every shape is an element. Create it with createElementNS and the SVG namespace, not createElement.'],
    [6.5, 'It stays in the DOM, so it gets events, CSS and accessibility, and the browser redraws it for you.'],
    [12, 'In canvas, you call drawing commands on a context. The result is just pixels. To change anything, you redraw.'],
    [18.5, 'Canvas content is invisible to screen readers, so give it a text alternative.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var s = ['const NS = "http://www.w3.org/2000/svg";', 'const c = document.createElementNS(NS, "circle");', 'c.setAttribute("r", "40");', 'svg.append(c);'];
    K.panel(40, 76, 600, 190, 'svg.js', { a: K.p(t, 0.2) });
    K.code(s, 64, 116, { size: 18, lh: 1.5, n: K.typed(t, s, starts(s, 0.6, 40), 40), t: t, a: K.p(t, 0.2), hi: t > 2 && t < 6.5 ? 1 : -1, w: 576 });
    var c = ['const g = canvas.getContext("2d");', 'g.beginPath();', 'g.arc(100, 100, 40, 0, Math.PI * 2);', 'g.fill();'];
    K.panel(680, 76, 560, 190, 'canvas.js', { a: K.p(t, 12.2) });
    K.code(c, 704, 116, { size: 18, lh: 1.5, n: K.typed(t, c, starts(c, 12.5, 40), 40), t: t, a: K.p(t, 12.2) });

    var d = K.p(t, 3.6), hov = K.p(t, 8.4, 0.4);
    K.box(40, 286, 600, 296, { stroke: P.line, a: d });
    K.chip('<svg>', 120, 330, { mono: true, size: 17, stroke: P.blue, a: d });
    K.arrow(120, 350, 120, 384, { a: d, head: 9, lw: 2 });
    K.chip('<circle r="40">', 160, 406, { mono: true, size: 17, stroke: P.acc, a: d });
    dot(K, 500, 420, 70, hov > 0.5 ? P.warm : P.acc, d);
    if (t > 7) {
      var mx = 600 - K.p(t, 7, 1.2) * 90, my = 560 - K.p(t, 7, 1.2) * 130;
      g.save(); g.fillStyle = P.ink; g.strokeStyle = P.bg; g.lineWidth = 1.5; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx, my + 22); g.lineTo(mx + 6, my + 16); g.lineTo(mx + 15, my + 16); g.closePath(); g.fill(); g.stroke(); g.restore();
    }
    [['events: click, hover', 7.4], ['styled with CSS', 8.6], ['<title> for screen readers', 9.8]].forEach(function (r, i) {
      var y = 470 + i * 36, q = K.p(t, r[1]);
      K.mark(70, y, true, 0.6, q); K.text(r[0], 92, y, { size: 17, a: q });
    });

    var cv = K.p(t, 13.6);
    K.box(680, 286, 560, 296, { stroke: P.line, a: cv });
    var cs = 12, ox = 700, oy = 302;
    for (var r = 0; r < 16; r++) for (var q = 0; q < 22; q++) {
      var dx = (q + 0.5) * cs - 132, dy = (r + 0.5) * cs - 96, dd = Math.sqrt(dx * dx + dy * dy), cov = K.clamp((66 - dd) / 10);
      K.box(ox + q * cs, oy + r * cs, cs - 1, cs - 1, { fill: cov > 0 ? 'rgba(246,173,85,' + (0.25 + cov * 0.75).toFixed(2) + ')' : P.code, r: 1, a: cv });
    }
    K.text('just pixels', 990, 320, { size: 18, color: P.warm, a: K.p(t, 14.6) });
    K.text('no nodes, no events', 990, 350, { size: 17, color: P.muted, a: K.p(t, 14.6) });
    K.text('to change it:', 990, 400, { size: 17, a: K.p(t, 16) });
    K.text('clear + redraw', 990, 428, { size: 17, color: P.acc, a: K.p(t, 16) });
    var al = K.p(t, 18.8);
    K.mark(706, 518, false, 0.6, al);
    K.text('invisible to screen readers, so add:', 728, 518, { size: 17, color: P.red, a: al });
    K.text('<canvas role="img" aria-label="Sales up 20%">', 704, 552, { size: 16, mono: true, color: P.green, a: K.p(t, 19.6) });
  } },

/* 4 ─ requestAnimationFrame */
{ d: 27, title: 'requestAnimationFrame',
  caps: [
    [0.3, 'Animate with requestAnimationFrame. The browser calls you just before it paints, once per screen refresh.'],
    [6.5, 'It pauses in hidden tabs, so no work is wasted. setInterval keeps firing, and drifts out of step with the screen.'],
    [13, 'Move things by elapsed time, not by frame count, and clamp the delta, so a tab that slept does not cause a giant jump.'],
    [20, 'Animate transform and opacity, not top, left or width. Those force a new layout on every frame.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['let last = performance.now();', 'function frame(now) {', '  const dt = Math.min(now - last, 100);', '  last = now;',
                '  update(dt);   // move by time', '  draw();', '  requestAnimationFrame(frame);', '}', 'requestAnimationFrame(frame);'];
    K.panel(40, 76, 600, 300, 'loop.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 114, { size: 19, lh: 1.42, n: K.typed(t, code, starts(code, 0.6, 60), 60), t: t, a: K.p(t, 0.2),
      hi: t > 13.2 && t < 20 ? 2 : t > 2.8 && t < 6.5 ? 6 : -1, w: 576 });

    var a = K.p(t, 0.8);
    K.box(680, 76, 560, 300, { stroke: P.line, a: a });
    K.text('screen refresh', 700, 110, { size: 16, color: P.muted, a: a });
    K.text('rAF', 700, 186, { size: 16, color: P.green, a: K.p(t, 2) });
    K.text('setInterval', 700, 262, { size: 16, color: P.red, a: K.p(t, 7) });
    var hid = K.p(t, 8.6);
    K.box(1040, 136, 120, 156, { fill: 'rgba(147,164,184,.12)', stroke: P.line, dash: [6, 5], a: hid });
    K.text('tab hidden', 1100, 316, { size: 16, color: P.muted, align: 'center', a: hid });
    for (var i = 0; i < 12; i++) {
      var x = 820 + i * 34, inHid = x > 1040 && x < 1160;
      K.box(x - 1, 132, 2, 24, { fill: P.muted, a: K.p(t, 0.9 + i * 0.08) });
      if (!(inHid && t > 8.6)) dot(K, x, 186, 7, P.green, K.p(t, 2 + i * 0.12));
      var sx = 820 + i * 37.5;
      if (sx < 1230) dot(K, sx, 262, 7, P.red, K.p(t, 7 + i * 0.12));
    }
    K.text('in step with the screen', 820, 216, { size: 16, color: P.green, a: K.p(t, 4.2) * (1 - hid) });
    K.text('drifts, wastes work', 1060, 350, { size: 16, color: P.red, align: 'center', a: K.p(t, 10.4) });

    var b = K.p(t, 13.2);
    K.box(40, 396, 600, 186, { stroke: P.line, a: b });
    K.text('120 Hz screen', 60, 420, { size: 16, weight: 700, color: P.muted, a: b });
    var run = K.clamp((t - 14) / 5);
    [['x += 2 each frame', P.red, Math.min(1, run * 2), 466, false], ['x += speed * dt', P.green, run, 526, true]].forEach(function (r) {
      K.box(260, r[3] - 1, 340, 2, { fill: P.line, a: b });
      K.text(r[0], 60, r[3], { size: 17, mono: true, color: r[1], a: b });
      dot(K, 270 + r[2] * 320, r[3], 11, r[1], K.p(t, 14));
      K.mark(620, r[3] - 26, r[4], 0.55, K.p(t, 17.6));
    });
    K.text('twice too fast', 430, 444, { size: 16, color: P.red, align: 'center', a: K.p(t, 17) });
    K.text('dt clamped to 100 ms', 430, 566, { size: 16, color: P.muted, align: 'center', a: K.p(t, 18) });

    var c = K.p(t, 20.2);
    K.box(680, 396, 560, 186, { stroke: P.line, a: c });
    K.mark(710, 440, true, 0.7, c); K.text('transform, opacity', 736, 440, { size: 19, mono: true, a: c });
    K.text('composite only', 1220, 440, { size: 17, color: P.green, align: 'right', a: c });
    K.mark(710, 492, false, 0.7, K.p(t, 21)); K.text('top, left, width', 736, 492, { size: 19, mono: true, a: K.p(t, 21) });
    K.text('layout + paint', 1220, 492, { size: 17, color: P.red, align: 'right', a: K.p(t, 21) });
    ['Layout', 'Paint', 'Composite'].forEach(function (s, i) {
      var on = i === 2 || t < 21.4 ? 1 : 0.5;
      K.chip(s, 790 + i * 160, 546, { size: 16, stroke: i === 2 ? P.green : P.red, a: K.p(t, 21.6 + i * 0.3) * on });
    });
  } },

/* 5 ─ HiDPI canvas */
{ d: 23, title: 'Sharp canvas on HiDPI',
  caps: [
    [0.3, 'On a high-density screen, one CSS pixel covers two or three device pixels. An unscaled canvas is stretched, and looks blurry.'],
    [7, 'So size the backing store by devicePixelRatio, keep the same CSS size, and scale the context once.'],
    [13, 'Now you keep drawing in CSS pixels, and every edge stays sharp.'],
    [17, 'For heavy rendering, OffscreenCanvas lets a worker draw, so the main thread stays free for input.']],
  draw: function (K, t) {
    var P = K.P;
    K.box(40, 76, 600, 330, { stroke: P.line, a: K.p(t, 0.3) });
    K.text('devicePixelRatio = 2', 340, 102, { size: 18, mono: true, color: P.blue, align: 'center', a: K.p(t, 0.5) });
    function grid(x0, cells, a, sharpA) {
      var cs = 220 / cells;
      for (var r = 0; r < cells; r++) for (var q = 0; q < cells; q++) {
        var cx = (q + 0.5) / cells, cy = (r + 0.5) / cells, d = Math.abs(cy - (0.85 - cx * 0.7)) * cells, cov = K.clamp(1 - d * (cells > 12 ? 0.9 : 0.55));
        K.box(x0 + q * cs, 124 + r * cs, cs - 1, cs - 1, { fill: cov > 0 ? 'rgba(79,209,197,' + (0.15 + cov * 0.85).toFixed(2) + ')' : P.code, r: 1, a: a });
      }
    }
    grid(70, 11, K.p(t, 1));
    K.text('width = 300', 180, 370, { size: 17, mono: true, a: K.p(t, 1.4) });
    K.mark(296, 370, false, 0.6, K.p(t, 2.4)); K.text('blurry', 180, 394, { size: 16, color: P.red, align: 'center', a: K.p(t, 2.4) });
    grid(390, 22, K.p(t, 13.2));
    K.text('width = 600', 500, 370, { size: 17, mono: true, a: K.p(t, 13.6) });
    K.mark(616, 370, true, 0.6, K.p(t, 14)); K.text('sharp', 500, 394, { size: 16, color: P.green, align: 'center', a: K.p(t, 14) });

    var code = ['const dpr = window.devicePixelRatio || 1;', 'canvas.width = 300 * dpr;', 'canvas.height = 150 * dpr;', 'canvas.style.width = "300px";', 'canvas.style.height = "150px";', 'ctx.scale(dpr, dpr);'];
    K.panel(680, 76, 560, 330, 'hidpi.js', { a: K.p(t, 7.2) });
    K.code(code, 704, 120, { size: 19, lh: 1.6, n: K.typed(t, code, [7.5, 9, 9.9, 10.8, 11.8, 12.6], 30), t: t, a: K.p(t, 7.2),
      hi: t > 12.6 ? 5 : t > 10.8 ? 3 : t > 9 ? 1 : -1, w: 536 });

    var o = K.p(t, 17.2);
    K.box(40, 430, 360, 150, { stroke: P.blue, a: o });
    K.text('Main thread', 220, 466, { size: 20, weight: 700, align: 'center', a: o });
    K.text('input, UI, layout', 220, 500, { size: 17, color: P.muted, align: 'center', a: o });
    K.arrow(410, 505, 800, 505, { p: K.p(t, 18.2, 0.7), color: P.acc });
    K.code(['canvas.transferControlToOffscreen()'], 420, 462, { size: 17, a: K.p(t, 18.4) });
    K.box(820, 430, 420, 150, { stroke: P.acc, a: K.p(t, 19) });
    K.text('Worker + OffscreenCanvas', 1030, 466, { size: 20, weight: 700, align: 'center', a: K.p(t, 19) });
    K.text('draws every frame off the main thread', 1030, 500, { size: 17, color: P.muted, align: 'center', a: K.p(t, 19.4) });
  } },

/* 6 ─ feature detection, secure contexts, progressive enhancement */
{ d: 25, title: 'Detect, secure, enhance',
  caps: [
    [0.3, 'Before using a device API, detect the feature itself. Never sniff the user agent string.'],
    [6, 'Many APIs only work in a secure context, meaning HTTPS or localhost: clipboard, geolocation, service workers, crypto.subtle.'],
    [12.5, 'Progressive enhancement: build the basic version that works everywhere, then add features where they exist.'],
    [18.5, 'For example, use navigator.share where it is supported, and otherwise show a copy-link button.']],
  draw: function (K, t) {
    var P = K.P;
    var c = ['if ("geolocation" in navigator) { … }', 'if (typeof BroadcastChannel === "function") { … }', 'if (CSS.supports("display", "grid")) { … }', '// ✗ /Chrome/.test(navigator.userAgent)'];
    K.panel(40, 76, 640, 220, 'detect.js', { a: K.p(t, 0.2) });
    K.code(c, 64, 116, { size: 18, lh: 1.65, n: K.typed(t, c, [0.6, 2, 3.6, 4.8], 40), t: t, a: K.p(t, 0.2),
      marks: t > 5.6 ? { 3: 'rgba(252,129,129,.2)' } : null, w: 616 });
    var s = K.p(t, 6.2);
    K.box(720, 76, 520, 220, { stroke: P.line, a: s });
    [['https://app.com', true], ['http://localhost', true], ['http://app.com', false]].forEach(function (r, i) {
      var y = 108 + i * 34, q = K.p(t, 6.4 + i * 0.4);
      K.mark(746, y, r[1], 0.55, q); K.text(r[0], 766, y, { size: 17, mono: true, color: r[1] ? P.ink : P.red, a: q });
    });
    K.text('isSecureContext', 1220, 108, { size: 16, mono: true, color: P.muted, align: 'right', a: K.p(t, 7.6) });
    [['clipboard', 820], ['geolocation', 980], ['crypto.subtle', 1140], ['service workers', 860], ['notifications', 1070]].forEach(function (r, i) {
      K.chip(r[0], r[1], i < 3 ? 224 : 266, { size: 16, stroke: P.green, a: K.p(t, 8.4 + i * 0.4) });
    });

    var L = [['HTML: content and real links', P.blue, 12.8], ['CSS: layout and style', P.purple, 13.6], ['JS: features where available', P.acc, 14.4]];
    K.box(680, 316, 560, 266, { stroke: P.line, a: K.p(t, 12.6) });
    L.forEach(function (l, i) {
      var y = 524 - i * 70, q = K.p(t, l[2]);
      K.box(712 + i * 30, y - 26, 496 - i * 60, 52, { fill: 'rgba(255,255,255,.03)', stroke: l[1], a: q });
      K.text(l[0], 960, y, { size: 18, align: 'center', a: q });
    });
    K.text('works for everyone at the base', 960, 346, { size: 16, color: P.muted, align: 'center', a: K.p(t, 15.2) });

    var e = ['if (navigator.share) {', '  await navigator.share({ title, url });', '} else {', '  showCopyLinkButton();', '}'];
    K.panel(40, 316, 600, 266, 'share.js', { a: K.p(t, 18.6) });
    K.code(e, 64, 356, { size: 19, lh: 1.6, n: K.typed(t, e, starts(e, 18.9, 40), 40), t: t, a: K.p(t, 18.6) });
  } },

/* 7 ─ permissions */
{ d: 27, title: 'Permissions in context',
  caps: [
    [0.3, 'Never ask for permission on page load. People deny it, and learn to block you.'],
    [6, 'Ask in context, after a user gesture, and explain why first. Check the current state with navigator.permissions.query.'],
    [13, 'For geolocation, call getCurrentPosition with a timeout, and handle the denied, unavailable and timeout errors.'],
    [20, 'If the user says no, respect it. Code usually cannot ask again, so explain how to change it in site settings.']],
  draw: function (K, t) {
    var P = K.P;
    var p = K.p(t, 0.6);
    K.box(40, 76, 560, 170, { stroke: P.red, a: p });
    K.text('On page load:', 64, 104, { size: 16, weight: 700, color: P.muted, a: p });
    K.box(64, 122, 400, 100, { fill: '#f7fafc', r: 10, a: K.p(t, 1) });
    K.text('app.com wants to', 84, 148, { size: 17, color: '#1a202c', a: K.p(t, 1) });
    K.text('Know your location', 84, 176, { size: 19, weight: 700, color: '#1a202c', a: K.p(t, 1) });
    K.box(300, 186, 70, 28, { fill: t > 3 ? '#2b6cb0' : '#e2e8f0', r: 6, a: K.p(t, 1) });
    K.text('Block', 335, 200, { size: 16, color: t > 3 ? '#ffffff' : '#1a202c', align: 'center', a: K.p(t, 1) });
    K.box(380, 186, 70, 28, { fill: '#e2e8f0', r: 6, a: K.p(t, 1) });
    K.text('Allow', 415, 200, { size: 16, color: '#1a202c', align: 'center', a: K.p(t, 1) });
    K.mark(520, 172, false, 1, K.p(t, 3.4));
    K.text('blocked', 520, 210, { size: 16, color: P.red, align: 'center', a: K.p(t, 3.6) });

    var gd = K.p(t, 6.2);
    K.box(640, 76, 600, 170, { stroke: P.green, a: gd });
    K.text('In context:', 664, 104, { size: 16, weight: 700, color: P.muted, a: gd });
    [['click "Stores near me"', 760, 146, 6.6], ['explain why', 990, 146, 7.4], ['browser prompt', 1150, 146, 8.2], ['allowed ✓', 760, 206, 9]].forEach(function (c, i) {
      var q = K.back((t - c[3]) / 0.5);
      if (q > 0) K.chip(c[0], c[1], c[2], { s: q, size: 16, stroke: i === 3 ? P.green : P.acc });
      if (i && i < 3) K.arrow(i === 1 ? 866 : 1048, 146, i === 1 ? 926 : 1076, 146, { p: K.p(t, c[3] - 0.2, 0.3), head: 9, lw: 2 });
    });
    K.curve(1150, 168, 1000, 230, 840, 206, { p: K.p(t, 8.8, 0.5), lw: 2, head: 9, color: P.green });

    var code = ['const s = await navigator.permissions', '  .query({ name: "geolocation" });', 's.state  // "granted" | "prompt" | "denied"', '',
                'navigator.geolocation.getCurrentPosition(', '  (pos) => showStores(pos.coords),', '  (err) => showFallback(err.code),', '  { timeout: 10000 });'];
    K.panel(40, 266, 640, 316, 'stores.js', { a: K.p(t, 10) });
    K.code(code, 64, 306, { size: 18, lh: 1.45, n: K.typed(t, code, [10.3, 11.2, 12.2, 13, 13.2, 14.6, 15.8, 17], 34), t: t, a: K.p(t, 10),
      hi: t > 15.8 && t < 20 ? 6 : -1, w: 616 });
    var e = K.p(t, 16);
    K.box(720, 266, 520, 316, { stroke: P.line, a: e });
    K.text('err.code', 744, 296, { size: 16, weight: 700, color: P.muted, mono: true, a: e });
    [['1 PERMISSION_DENIED', 'type a city instead'], ['2 POSITION_UNAVAILABLE', 'show all stores'], ['3 TIMEOUT', 'retry or fall back']].forEach(function (r, i) {
      var y = 334 + i * 52, q = K.p(t, 16.4 + i * 0.6);
      K.text(r[0], 744, y, { size: 17, mono: true, color: P.warm, a: q });
      K.text(r[1], 1220, y, { size: 16, color: P.muted, align: 'right', a: q });
    });
    var n = K.p(t, 20.4);
    K.box(744, 486, 472, 76, { fill: P.code, stroke: P.line, r: 10, a: n });
    K.text('Site settings › Location', 764, 510, { size: 17, a: n });
    K.box(1140, 498, 52, 26, { fill: P.line, r: 13, a: n });
    dot(K, 1153 + K.p(t, 22, 0.5) * 26, 511, 10, K.p(t, 22, 0.5) > 0.5 ? P.green : P.muted, n);
    K.text('denied: don’t nag, show the way back', 764, 540, { size: 16, color: P.green, a: K.p(t, 21) });
  } },

/* 8 ─ tabs: BroadcastChannel, Web Locks, visibility */
{ d: 26, title: 'Coordinating tabs',
  caps: [
    [0.3, 'People open your app in several tabs. BroadcastChannel sends messages between same-origin tabs and workers.'],
    [6.5, 'Sign out in one tab, and every other tab hears it and updates at once.'],
    [12.5, 'Web Locks let only one tab do a job at a time, such as syncing, with navigator.locks.request.'],
    [19, 'Pause polling and animation when document.visibilityState is hidden. And navigator.onLine never proves the server is reachable.']],
  draw: function (K, t) {
    var P = K.P;
    var out = t > 8;
    [0, 1, 2].forEach(function (i) {
      var x = 40 + i * 410, q = K.p(t, 0.5 + i * 0.3), me = i === 0, so = me ? t > 7 : t > 9 + i * 0.4;
      K.box(x, 76, 380, 140, { stroke: so ? P.warm : P.line, a: q });
      K.text('Tab ' + (i + 1), x + 20, 102, { size: 17, weight: 700, color: P.muted, a: q });
      K.text(so ? 'signed out' : 'signed in as Ana', x + 190, 160, { size: 21, weight: 700, color: so ? P.warm : P.ink, align: 'center', a: q });
    });
    K.curve(230, 216, 430, 270, 610, 222, { p: K.p(t, 7.6, 0.8), color: P.acc, lw: 2.5, head: 10 });
    K.curve(230, 216, 640, 300, 1020, 222, { p: K.p(t, 8, 1), color: P.acc, lw: 2.5, head: 10 });
    K.chip('{ type: "logout" }', 640, 278, { size: 16, mono: true, stroke: P.acc, a: K.win(t, 7.8, 11.6) });

    var code = ['const bc = new BroadcastChannel("auth");', 'bc.postMessage({ type: "logout" });', 'bc.onmessage = (e) => {', '  if (e.data.type === "logout") showLogin();', '};', '',
                'navigator.locks.request("sync", async () => {', '  await syncOnce();  // one tab at a time', '});'];
    K.panel(40, 316, 640, 266, 'tabs.js', { a: K.p(t, 1.4) });
    K.code(code, 64, 352, { size: 17, lh: 1.42, n: K.typed(t, code, [1.8, 3.3, 4.4, 5.2, 6.4, 6.5, 12.8, 14.4, 15.6], 40), t: t, a: K.p(t, 1.4),
      hi: t > 12.8 && t < 19 ? 6 : t > 6.5 && t < 12.5 ? 1 : -1, w: 616 });
    var l = K.p(t, 13);
    K.box(720, 316, 520, 140, { stroke: P.line, a: l });
    K.text('lock "sync"', 744, 342, { size: 16, weight: 700, color: P.muted, a: l });
    K.lock(760, 392, 1.3, P.green, K.p(t, 13.4));
    var hold = t < 17.4 ? 0 : 1;
    ['Tab 1', 'Tab 2', 'Tab 3'].forEach(function (s, i) {
      var holder = i === hold, done = i < hold, q = K.p(t, 13.6 + i * 0.4);
      K.chip(s + (holder ? ': syncing' : done ? ': done' : ': waits'), 860 + i * 150, 392, { size: 16, stroke: holder ? P.green : done ? P.muted : P.warm, a: q });
    });
    var v = K.p(t, 19.2);
    K.box(720, 472, 520, 110, { stroke: P.line, a: v });
    K.text('visibilityState === "hidden"  →  pause', 744, 506, { size: 17, mono: true, a: v });
    K.text('onLine === true  ≠  server reachable', 744, 548, { size: 17, mono: true, color: P.warm, a: K.p(t, 21.4) });
  } },

/* 9 ─ WebRTC */
{ d: 25, title: 'Peer to peer: WebRTC',
  caps: [
    [0.3, 'WebRTC connects two browsers directly for audio, video and data, using RTCPeerConnection.'],
    [5.5, 'But first the peers swap an offer, an answer and network candidates, through a signalling channel you build, often a WebSocket.'],
    [12.5, 'STUN helps each peer find its public address. When strict NATs block the direct path, a TURN server relays the traffic.'],
    [19, 'When the call ends, stop every track and close the connection, or the camera light stays on and the battery drains.']],
  draw: function (K, t) {
    var P = K.P;
    [['Peer A', 40], ['Peer B', 1020]].forEach(function (p) {
      var q = K.p(t, 0.5);
      K.box(p[1], 220, 220, 120, { stroke: P.blue, a: q });
      K.text(p[0], p[1] + 110, 258, { size: 22, weight: 700, align: 'center', a: q });
      K.text('RTCPeerConnection', p[1] + 110, 296, { size: 16, mono: true, color: P.muted, align: 'center', a: q });
    });
    var sg = K.p(t, 5.8);
    K.box(500, 86, 280, 80, { stroke: P.purple, a: sg });
    K.text('Signalling server', 640, 114, { size: 19, weight: 700, align: 'center', a: sg });
    K.text('(your WebSocket)', 640, 142, { size: 16, color: P.muted, align: 'center', a: sg });
    K.curve(200, 216, 300, 110, 494, 112, { p: K.p(t, 6.6, 0.6), color: P.purple, lw: 2, head: 9 });
    K.curve(786, 112, 980, 110, 1080, 214, { p: K.p(t, 7.2, 0.6), color: P.purple, lw: 2, head: 9 });
    K.text('offer', 330, 140, { size: 16, color: P.purple, a: K.p(t, 6.8) });
    K.text('answer', 950, 140, { size: 16, color: P.purple, a: K.p(t, 8.2) });
    K.text('ICE candidates both ways', 640, 196, { size: 16, color: P.purple, align: 'center', a: K.p(t, 9.4) });
    var direct = K.p(t, 1.4, 0.8), blocked = K.p(t, 15.4, 0.4);
    K.arrow(266, 280, 1014, 280, { p: direct, color: P.green, lw: 3, a: 1 - blocked * 0.6, dash: [10, 8] });
    K.text('direct: audio, video, data', 640, 304, { size: 17, color: P.green, align: 'center', a: K.p(t, 2) * (1 - K.p(t, 14.9, 0.3)) });
    K.mark(640, 280, false, 1.1, blocked);
    K.text('strict NAT blocks it', 640, 314, { size: 16, color: P.red, align: 'center', a: K.p(t, 15.5, 0.4) });
    var st = K.p(t, 12.8);
    K.box(60, 390, 180, 60, { stroke: P.acc, a: st });
    K.text('STUN', 150, 420, { size: 19, weight: 700, align: 'center', a: st });
    K.arrow(150, 344, 150, 384, { a: st, head: 9, lw: 2, color: P.acc });
    K.text('“what is my public address?”', 150, 474, { size: 16, color: P.acc, align: 'center', a: K.p(t, 13.4) });
    var tu = K.p(t, 16.2);
    K.box(530, 430, 220, 64, { stroke: P.warm, a: tu });
    K.text('TURN relay', 640, 462, { size: 19, weight: 700, align: 'center', a: tu });
    K.curve(262, 330, 380, 470, 524, 462, { p: K.p(t, 16.6, 0.6), color: P.warm, lw: 2.5, head: 9 });
    K.curve(756, 462, 980, 470, 1080, 346, { p: K.p(t, 17.2, 0.6), color: P.warm, lw: 2.5, head: 9 });
    var c = ['stream.getTracks().forEach((t) => t.stop());', 'pc.close();'];
    K.panel(40, 506, 600, 76, '', { a: K.p(t, 19.2) });
    K.code(c, 60, 516, { size: 17, lh: 1.5, n: K.typed(t, c, [19.5, 21.4], 34), t: t, a: K.p(t, 19.2) });
    K.chip('camera light off', 1000, 544, { size: 17, stroke: P.green, a: K.p(t, 22.2) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 49 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['SVG = shapes in the DOM; canvas = pixels you redraw',
     'requestAnimationFrame, time-based motion, clamped delta',
     'Animate transform and opacity; scale canvas by devicePixelRatio',
     'Feature-detect, require HTTPS, enhance progressively',
     'Ask for permissions in context; honour a denial',
     'BroadcastChannel and Web Locks coordinate tabs'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 0.95, 0.5), y = 170 + i * 58;
      K.mark(230, y, true, 0.85, q);
      K.text(s, 262 - (1 - q) * 20, y, { size: 23, a: q });
    });
    K.chip('Next: run the Day 49 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
