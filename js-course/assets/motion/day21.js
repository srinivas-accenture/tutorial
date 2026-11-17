/* Day 21 in motion: how V8 runs JavaScript (tiers, speculation, deopt, startup cost), hidden classes, inline caches and element kinds.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day21', {
  kicker: 'JavaScript: Zero to Architect · Day 21',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 21: how V8 turns JavaScript into fast machine code, and what makes it slow down.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Inside V8', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 21 · The engine under your code', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Tiers and the JIT', 'Hidden classes', 'Inline caches'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ why a JIT */
{ d: 20, title: 'Why engines guess types',
  caps: [
    [0.3, 'JavaScript is dynamic: the same plus sign can add numbers, join strings or call valueOf on objects.'],
    [6.5, 'Handling every case on every call is slow, so the engine watches the code run and records the types it sees.'],
    [13, 'Then it compiles fast machine code for what it saw, with a safety check in case the guess turns out wrong.']],
  draw: function (K, t) {
    var P = K.P, code = ['function add(a, b) {', '  return a + b;', '}', 'for (let i = 0; i < 1e6; i++)', '  add(i, 1);'];
    K.panel(50, 84, 560, 290, 'add.js', { a: K.p(t, 0.2) });
    K.code(code, 78, 136, { size: 23, n: K.typed(t, code, [0.6, 1.4, 2, 7, 8], 30), t: t, hi: t > 2.2 && t < 6.5 ? 1 : t > 8.6 ? 4 : -1, w: 520, a: K.p(t, 0.2) });
    K.text('a + b  can mean…', 680, 110, { size: 22, weight: 700, color: P.muted, a: K.p(t, 2.4) });
    [['1 + 2', 'number addition'], ['"a" + "b"', 'string join'], ['obj + 1', 'valueOf(), then add']].forEach(function (r, i) {
      var q = K.p(t, 3 + i * 0.9, 0.5), y = 156 + i * 52;
      K.chip(r[0], 760, y, { mono: true, size: 19, stroke: P.blue, a: q });
      K.text(r[1], 860, y, { size: 19, a: q });
    });
    var f = K.p(t, 9);
    K.box(660, 330, 570, 104, { stroke: P.acc, a: f });
    K.text('Type feedback for  a + b', 684, 356, { size: 19, weight: 700, color: P.acc, a: f });
    var n = Math.floor(Math.min(1, Math.max(0, (t - 9.3) / 3)) * 1000000);
    K.text('number, number', 684, 398, { size: 21, mono: true, a: f });
    K.text('× ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','), 1000, 398, { size: 21, mono: true, color: P.warm, a: f });
    var m = K.p(t, 13.6);
    K.box(660, 460, 570, 120, { fill: P.code, stroke: P.green, a: m });
    K.text('Optimized machine code for add', 684, 486, { size: 19, weight: 700, color: P.green, a: m });
    K.text('check: a and b are small integers', 684, 522, { size: 19, mono: true, color: P.warm, a: K.p(t, 15) });
    K.text('integer add, return', 684, 554, { size: 19, mono: true, a: K.p(t, 15.6) });
    K.arrow(945, 436, 945, 456, { p: K.p(t, 13.4, 0.4), color: P.muted, head: 9 });
    K.text('the check is the safety net', 330, 430, { size: 19, color: P.warm, align: 'center', a: K.p(t, 16.5) });
    K.arrow(470, 430, 640, 520, { p: K.p(t, 16.8, 0.5), color: P.warm });
  } },

/* 3 ─ the four tiers */
{ d: 27, title: 'V8 tiers',
  caps: [
    [0.3, 'Every function starts in Ignition, the interpreter. It runs bytecode and records type feedback as it goes.'],
    [7, 'When a function gets warm, Sparkplug quickly turns its bytecode into plain machine code, without optimizing.'],
    [12.5, 'Hotter code goes to Maglev, a mid-tier optimizing compiler that still compiles quickly.'],
    [17.5, 'The hottest code reaches TurboFan: slowest to compile, fastest to run, built on speculation about types.'],
    [22.5, 'The exact thresholds are internal and change between versions. Rely on the idea, not the numbers.']],
  draw: function (K, t) {
    var P = K.P;
    ['source', 'parser', 'AST', 'bytecode'].forEach(function (s, i) {
      var q = K.p(t, 0.4 + i * 0.5, 0.4), x = 290 + i * 200;
      K.chip(s, x, 120, { size: 19, mono: true, stroke: i === 3 ? P.acc : P.line, a: q });
      if (i) K.arrow(x - 140, 120, x - 62, 120, { p: q, color: P.muted, head: 10 });
    });
    var T = [['Ignition', 'interpreter', 0.6, 1, 1, P.acc], ['Sparkplug', 'baseline compiler', 7.2, 1.6, 2, P.blue],
             ['Maglev', 'mid-tier optimizer', 12.7, 3, 3.4, P.purple], ['TurboFan', 'peak optimizer', 17.7, 5, 5, P.warm]];
    var heat = ['', 'warm', 'hot', 'hottest'];
    T.forEach(function (b, i) {
      var x = 40 + i * 305, q = K.back((t - b[2]) / 0.6), a = K.clamp(q);
      if (q <= 0) return;
      K.g.save(); K.g.translate(x + 135, 320); K.g.scale(q, q); K.g.translate(-x - 135, -320);
      K.box(x, 270, 270, 100, { stroke: b[5], a: a, lw: 2.5 });
      K.text(b[0], x + 135, 304, { size: 25, weight: 700, align: 'center', a: a });
      K.text(b[1], x + 135, 340, { size: 18, color: P.muted, align: 'center', a: a });
      K.g.restore();
      if (i) { K.arrow(x - 32, 320, x - 4, 320, { p: K.p(t, b[2] - 0.3, 0.4), color: b[5], head: 10 });
               K.text(heat[i], x - 18, 256, { size: 17, color: b[5], align: 'center', a: K.p(t, b[2]) }); }
      [['compile cost', b[3]], ['code speed', b[4]]].forEach(function (r, k) {
        var y = 414 + k * 52, w = 160 * K.p(t, b[2] + 0.8 + k * 0.3, 0.8) * r[1] / 5;
        K.text(r[0], x, y, { size: 16, color: P.muted, a: a });
        K.box(x + 110, y - 9, 160, 18, { fill: P.code, r: 9, a: a });
        if (w > 1) K.box(x + 110, y - 9, Math.max(18, w), 18, { fill: k ? P.green : P.red, r: 9, a: a * 0.85 });
      });
    });
    K.arrow(905, 138, 175, 262, { p: K.p(t, 2.6, 0.7), color: P.acc, head: 11 });
    K.text('records type feedback', 175, 234, { size: 16, color: P.acc, align: 'center', a: K.p(t, 3.4) });
    var note = K.p(t, 22.8);
    K.box(240, 510, 800, 70, { fill: 'rgba(246,173,85,.10)', stroke: P.warm, a: note });
    K.text('Tier-up thresholds are internal and version-specific', 640, 545, { size: 22, color: P.warm, align: 'center', a: note });
  } },

/* 4 ─ speculation and deoptimization */
{ d: 25, title: 'Speculation and deopt',
  caps: [
    [0.3, 'Optimized code rests on assumptions. TurboFan adds cheap guards, such as: a and b are small integers.'],
    [6.5, 'A million calls pass the guard. Then add is called with two strings.'],
    [12, 'The guard fails. V8 throws the optimized code away and resumes in the interpreter. This is deoptimization.'],
    [18.5, 'With the new feedback it may optimize again, but code that keeps flipping types stays slow.']],
  draw: function (K, t) {
    var P = K.P, g = K.g, code = ['for (let i = 0; i < 1e6; i++)', '  add(i, 1);', 'add("a", "b");'];
    K.panel(40, 80, 560, 190, 'app.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 130, { size: 23, n: K.typed(t, code, [0.5, 1.5, 9.4], 30), t: t, hi: t > 10.2 ? 2 : t > 6.6 ? 1 : -1, w: 520, a: K.p(t, 0.2) });
    var dead = K.p(t, 12.6, 0.6);
    K.box(660, 80, 580, 190, { stroke: dead > 0.5 ? P.red : P.warm, a: K.p(t, 0.8) * (1 - dead * 0.6) });
    K.text('TurboFan code for add', 684, 108, { size: 19, weight: 700, color: P.warm, a: K.p(t, 0.8) * (1 - dead * 0.6) });
    K.text('guard: a, b are small ints', 684, 160, { size: 21, mono: true, color: P.warm, a: K.p(t, 2) * (1 - dead * 0.6) });
    K.text('integer add, return', 684, 210, { size: 21, mono: true, a: K.p(t, 2.6) * (1 - dead * 0.6) });
    if (dead > 0) { g.save(); g.globalAlpha *= dead; g.strokeStyle = P.red; g.lineWidth = 4; g.beginPath();
      g.moveTo(680, 100); g.lineTo(680 + 540 * dead, 250); g.stroke(); g.restore(); }
    /* lane of calls flowing through the guard */
    K.box(40, 320, 1200, 110, { fill: P.code, stroke: P.line, a: K.p(t, 6.6) });
    K.text('calls', 64, 344, { size: 16, color: P.muted, a: K.p(t, 6.6) });
    var gx = 760, ga = K.p(t, 6.6);
    K.box(gx - 6, 330, 12, 90, { fill: t > 12.2 && t < 18 ? P.red : P.warm, r: 6, a: ga });
    K.text('guard', gx, 444, { size: 16, color: P.warm, align: 'center', a: ga });
    for (var k = 0; k < 7; k++) {
      var t0 = 6.9 + k * 0.5, x = 120 + (t - t0) * 420;
      if (t < t0 || x > 1160) continue;
      K.chip('add(n, 1)', x, 380, { size: 17, mono: true, stroke: P.green, a: K.p(t, t0, 0.3) * K.clamp((1170 - x) / 60) });
    }
    K.mark(gx, 300, true, 0.7, K.win(t, 7.2, 10.6));
    var sx = Math.min(gx - 70, 120 + Math.max(0, t - 10.4) * 420);
    if (t > 10.4) K.chip('"a", "b"', sx, 380, { size: 17, mono: true, stroke: P.red, a: K.p(t, 10.4, 0.3) * (1 - K.p(t, 17, 0.6)) });
    K.mark(gx, 300, false, 0.9, K.p(t, 12.1, 0.3));
    var back = K.p(t, 13.4, 1);
    K.curve(gx - 70, 432, 520, 560, 300, 520, { p: back, color: P.red, dash: [7, 7], lw: 2.5 });
    K.box(100, 490, 240, 66, { stroke: P.acc, a: K.p(t, 14) });
    K.text('Ignition: bytecode', 220, 523, { size: 20, weight: 700, align: 'center', a: K.p(t, 14) });
    K.text('deoptimize', 560, 520, { size: 19, color: P.red, a: K.p(t, 14.2) });
    var re = K.p(t, 19);
    K.box(760, 470, 480, 100, { stroke: P.purple, a: re });
    K.text('re-optimize later: number or string', 784, 500, { size: 19, color: P.purple, a: re });
    K.text('types keep flipping → deopt loop', 784, 540, { size: 19, color: P.red, a: K.p(t, 20.4) });
  } },

/* 5 ─ startup cost */
{ d: 23, title: 'Startup: parse and compile',
  caps: [
    [0.3, 'Before your code runs, the engine must download, parse and compile it. On a slow phone that adds up.'],
    [7, 'Lazy parsing helps: functions that are not called yet only get a quick syntax check from the preparser.'],
    [13, 'Code caching keeps compiled bytecode, so a repeat visit skips part of the work.'],
    [18, 'The biggest win is still to ship less JavaScript. DevTools shows the cost as Parse, Compile and Evaluate Script.']],
  draw: function (K, t) {
    var P = K.P;
    var segs = [['download', P.blue], ['parse', P.purple], ['compile', P.warm], ['evaluate', P.acc]];
    function row(label, y, ws, st, a) {
      K.text(label, 60, y, { size: 19, color: P.muted, a: a });
      var x = 290;
      ws.forEach(function (w, i) {
        var q = K.p(t, st + i * 0.5, 0.6), ww = w * q;
        if (ww > 2) { K.box(x, y - 18, ww, 36, { fill: segs[i][1], r: 6, a: a * 0.85 });
          if (ww > 70) K.text(segs[i][0], x + ww / 2, y, { size: 16, weight: 700, color: P.bg, align: 'center', a: a * q }); }
        x += ww + 4;
      });
    }
    row('fast laptop', 110, [90, 50, 40, 70], 1, K.p(t, 0.8));
    row('slow phone', 170, [220, 200, 170, 260], 2.6, K.p(t, 2.4));
    row('phone, repeat visit', 230, [80, 0, 0, 260], 13.4, K.p(t, 13.2));
    K.text('code cache: no full parse or compile', 640, 270, { size: 17, color: P.green, a: K.p(t, 15) });
    var lazy = ['function init() { … }    // called', 'function openModal() { … }', 'function exportPdf() { … }', 'init();'];
    K.panel(40, 310, 640, 230, 'app.js', { a: K.p(t, 7) });
    K.code(lazy, 66, 360, { size: 21, n: K.typed(t, lazy, [7.2, 7.6, 8, 8.4], 60), t: t, w: 600, a: K.p(t, 7),
      marks: t > 9.4 ? { 0: 'rgba(79,209,197,.16)', 1: 'rgba(147,164,184,.10)', 2: 'rgba(147,164,184,.10)' } : null });
    K.text('fully compiled', 560, 383, { size: 16, color: P.acc, a: K.p(t, 9.6) });
    K.text('pre-parsed only', 560, 417, { size: 16, color: P.muted, a: K.p(t, 10.2) });
    K.text('pre-parsed only', 560, 451, { size: 16, color: P.muted, a: K.p(t, 10.6) });
    var c = K.p(t, 18.4);
    K.box(720, 310, 520, 230, { stroke: P.green, a: c });
    K.text('Ship less JavaScript', 744, 344, { size: 22, weight: 700, color: P.green, a: c });
    ['tree-shake unused code', 'split code, load on demand', 'defer what is not critical'].forEach(function (s, i) {
      var q = K.p(t, 19.2 + i * 0.6); K.mark(758, 392 + i * 46, true, 0.7, q); K.text(s, 784, 392 + i * 46, { size: 19, a: q });
    });
  } },

/* 6 ─ hidden classes */
{ d: 26, title: 'Hidden classes (shapes)',
  caps: [
    [0.3, 'In theory an object is a dictionary of names and values. A hash lookup on every property read would be slow.'],
    [6.5, 'So V8 gives each object a hidden class, a shape that maps every property name to a fixed slot.'],
    [12, 'Adding a property moves the object to a new shape. Objects built the same way, in the same order, share one.'],
    [18.5, 'Add the same properties in a different order and you get a different shape.']],
  draw: function (K, t) {
    var P = K.P, code = ['const a = {};', 'a.x = 1;', 'a.y = 2;', 'const b = { x: 3, y: 4 };', 'const c = { y: 5, x: 6 };'];
    K.panel(40, 80, 520, 250, 'shapes.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 22, n: K.typed(t, code, [0.5, 12.2, 13.6, 16, 18.8], 30), t: t, w: 480, a: K.p(t, 0.2),
      hi: t > 18.8 ? 4 : t > 16 ? 3 : t > 13.6 ? 2 : t > 12.2 ? 1 : -1 });
    /* dictionary vs shape for one object */
    var dict = K.p(t, 1.5) * (1 - K.p(t, 6.8, 0.6));
    K.box(40, 360, 520, 200, { stroke: P.red, a: dict });
    K.text('dictionary: look up the name', 64, 390, { size: 19, weight: 700, color: P.red, a: dict });
    [['"x"', '1'], ['"y"', '2']].forEach(function (r, i) {
      K.text('hash(' + r[0] + ')  →  bucket  →  ' + r[1], 64, 440 + i * 44, { size: 20, mono: true, a: dict });
    });
    var sh = K.p(t, 7.2);
    K.box(40, 360, 520, 200, { stroke: P.acc, a: sh });
    K.text('object a', 64, 390, { size: 19, weight: 700, color: P.acc, a: sh });
    [['shape', P.purple], ['1', P.warm], ['2', P.warm]].forEach(function (c, i) {
      K.box(64 + i * 110, 420, 100, 50, { fill: P.code, stroke: c[1], a: sh });
      K.text(c[0], 114 + i * 110, 445, { size: 19, mono: true, align: 'center', a: sh });
    });
    K.text('x → slot 0,  y → slot 1', 64, 510, { size: 20, mono: true, color: P.muted, a: K.p(t, 8.6) });
    K.text('read = fixed offset', 410, 445, { size: 17, color: P.green, a: K.p(t, 9.6) });
    /* transition tree */
    var N = [['S0  { }', 680, 200, 12.4, P.line], ['S1  { x }', 900, 140, 12.8, P.acc], ['S2  { x, y }', 1120, 140, 14, P.acc],
             ['S3  { y }', 900, 300, 19, P.warm], ['S4  { y, x }', 1120, 300, 19.8, P.warm]];
    N.forEach(function (n) {
      var q = K.back((t - n[3]) / 0.5); if (q <= 0) return;
      K.chip(n[0], n[1], n[2], { s: q, a: K.clamp(q), size: 20, mono: true, stroke: n[4] });
    });
    K.arrow(730, 186, 836, 150, { p: K.p(t, 12.6, 0.4), color: P.acc }); K.text('+ x', 770, 150, { size: 16, color: P.muted, a: K.p(t, 12.8) });
    K.arrow(966, 140, 1038, 140, { p: K.p(t, 13.8, 0.4), color: P.acc }); K.text('+ y', 1000, 116, { size: 16, color: P.muted, a: K.p(t, 14) });
    K.arrow(730, 214, 836, 290, { p: K.p(t, 18.8, 0.4), color: P.warm }); K.text('+ y', 770, 274, { size: 16, color: P.muted, a: K.p(t, 19) });
    K.arrow(966, 300, 1038, 300, { p: K.p(t, 19.6, 0.4), color: P.warm }); K.text('+ x', 1000, 276, { size: 16, color: P.muted, a: K.p(t, 19.8) });
    K.chip('a', 1080, 210, { mono: true, size: 19, stroke: P.green, a: K.p(t, 14.4) }); K.arrow(1080, 192, 1096, 162, { p: K.p(t, 14.6, 0.4), color: P.green, head: 9 });
    K.chip('b', 1160, 210, { mono: true, size: 19, stroke: P.green, a: K.p(t, 16.6) }); K.arrow(1160, 192, 1144, 162, { p: K.p(t, 16.8, 0.4), color: P.green, head: 9 });
    K.text('same shape', 1120, 248, { size: 16, color: P.green, align: 'center', a: K.p(t, 17) });
    K.chip('c', 1120, 380, { mono: true, size: 19, stroke: P.red, a: K.p(t, 20.4) }); K.arrow(1120, 362, 1120, 324, { p: K.p(t, 20.6, 0.4), color: P.red, head: 9 });
    K.text('same data, different shape', 950, 450, { size: 20, color: P.warm, align: 'center', a: K.p(t, 21.2) });
  } },

/* 7 ─ inline caches */
{ d: 25, title: 'Inline caches',
  caps: [
    [0.3, 'Each property access in your code, like p dot x, has an inline cache that remembers the shapes it has seen.'],
    [7, 'One shape: monomorphic. The cache knows the slot, so the read is a single load. This is the fastest case.'],
    [13, 'Two to four shapes: polymorphic. The cache checks each known shape in turn, a little slower.'],
    [18.5, 'Many shapes: megamorphic. The cache gives up and falls back to a slow generic lookup.']],
  draw: function (K, t) {
    var P = K.P, code = ['function getX(p) { return p.x; }'];
    K.panel(40, 80, 620, 100, 'ic.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 122, { size: 23, n: K.typed(t, code, [0.5], 34), t: t, a: K.p(t, 0.2) });
    var ic = K.p(t, 2.4);
    K.arrow(520, 160, 520, 196, { p: ic, color: P.acc, head: 10 });
    K.box(700, 84, 540, 92, { stroke: P.acc, a: ic });
    K.text('inline cache at  p.x', 724, 112, { size: 19, weight: 700, color: P.acc, a: ic });
    K.text('remembers: shape → slot', 724, 148, { size: 19, mono: true, color: P.muted, a: ic });
    var C = [['monomorphic', '1 shape', P.green, 7.2, 1, 5], ['polymorphic', '2 to 4 shapes', P.warm, 13.2, 3, 3], ['megamorphic', 'many shapes', P.red, 18.7, 8, 1]];
    C.forEach(function (c, i) {
      var x = 40 + i * 410, a = K.p(t, c[3]);
      K.box(x, 210, 380, 360, { stroke: c[2], a: a });
      K.text(c[0], x + 190, 244, { size: 24, weight: 700, color: c[2], align: 'center', a: a });
      K.text(c[1], x + 190, 278, { size: 18, color: P.muted, align: 'center', a: a });
      for (var k = 0; k < c[4]; k++) {
        var q = K.back((t - c[3] - 0.6 - k * 0.25) / 0.4); if (q <= 0) continue;
        var cx = c[4] > 3 ? x + 60 + (k % 4) * 86 : x + 190 + (k - (c[4] - 1) / 2) * 104, cy = c[4] > 3 ? 340 + Math.floor(k / 4) * 56 : 340;
        K.chip('S' + (k + 1), cx, cy, { s: q, a: K.clamp(q), size: 18, mono: true, stroke: c[2] });
      }
      K.text(['load slot 0', 'check S1, S2, S3…', 'generic lookup'][i], x + 190, 456, { size: 19, mono: true, align: 'center', a: K.p(t, c[3] + 1.4) });
      K.text('speed', x + 24, 520, { size: 16, color: P.muted, a: a });
      K.box(x + 90, 511, 260, 18, { fill: P.code, r: 9, a: a });
      var w = 260 * c[5] / 5 * K.p(t, c[3] + 1.8, 0.8);
      if (w > 1) K.box(x + 90, 511, Math.max(18, w), 18, { fill: c[2], r: 9, a: a * 0.85 });
    });
  } },

/* 8 ─ shape and array pitfalls */
{ d: 27, title: 'Keeping shapes stable',
  caps: [
    [0.3, 'Using delete on a hot object can switch it to dictionary mode, a slow hash table. Set the field to undefined, or use a Map.'],
    [7, 'Adding fields conditionally gives instances different shapes. Initialize every field in the constructor, in the same order.'],
    [14, 'Arrays have element kinds too: small integers, then doubles, then anything. Transitions only go one way.'],
    [20, 'Writing past the end leaves holes, and holey arrays need extra checks. Prefer push or Array.from over new Array of n.']],
  draw: function (K, t) {
    var P = K.P;
    var d = ['delete user.age;      // slow mode', 'user.age = undefined; // keeps shape'];
    K.panel(40, 80, 580, 150, 'user.js', { a: K.p(t, 0.2) });
    K.code(d, 64, 128, { size: 20, n: K.typed(t, d, [0.6, 4], 36), t: t, a: K.p(t, 0.2), w: 545 });
    K.mark(592, 140, false, 0.7, K.p(t, 2.2)); K.mark(592, 172, true, 0.7, K.p(t, 5.6));
    K.chip('user → hash table: slow reads', 330, 272, { size: 19, stroke: P.red, color: P.red, a: K.win(t, 2.6, 5.4) });
    K.chip('user keeps its shape: fast reads', 330, 272, { size: 19, stroke: P.green, color: P.green, a: K.p(t, 5.8) * (1 - K.p(t, 13.6)) });
    var c = ['class Point {', '  constructor(x, y) {', '    this.x = x; this.y = y;', '  }', '}'];
    K.panel(660, 80, 580, 210, 'point.js', { a: K.p(t, 7.2) });
    K.code(c, 684, 124, { size: 20, lh: 1.5, n: K.typed(t, c, [7.6, 8.2, 9.2, 10.4, 10.6], 30), t: t, a: K.p(t, 7.2), hi: t > 9.2 && t < 14 ? 2 : -1, w: 540 });
    K.text('every Point: same fields, same order → one shape', 950, 312, { size: 17, color: P.green, align: 'center', a: K.p(t, 11.4) * (1 - K.p(t, 13.6)) });
    /* element kinds */
    var ek = K.p(t, 14.2);
    K.text('Array element kinds', 40, 320, { size: 20, weight: 700, color: P.muted, a: ek });
    var E = [['[1, 2, 3]', 'PACKED_SMI', P.green, 14.4], ['.push(1.5)', 'PACKED_DOUBLE', P.blue, 15.6], ['.push("x")', 'PACKED', P.warm, 16.8]];
    E.forEach(function (e, i) {
      var x = 40 + i * 410, q = K.p(t, e[3]);
      K.box(x, 340, 340, 90, { stroke: e[2], a: q });
      K.text(e[0], x + 170, 368, { size: 20, mono: true, align: 'center', a: q });
      K.text(e[1], x + 170, 404, { size: 19, mono: true, weight: 700, color: e[2], align: 'center', a: q });
      if (i) K.arrow(x - 66, 385, x - 8, 385, { p: K.p(t, e[3] - 0.2, 0.4), color: P.muted });
    });
    K.curve(1080, 436, 640, 500, 220, 436, { p: K.p(t, 18.2, 0.8), color: P.red, dash: [7, 7], lw: 2 });
    K.mark(560, 490, false, 0.7, K.p(t, 18.8) * (1 - K.p(t, 20)));
    K.text('never goes back', 586, 490, { size: 16, color: P.red, a: K.p(t, 18.8) * (1 - K.p(t, 20)) });
    /* holes */
    var h = K.p(t, 20.3);
    K.text('arr[10] = 4', 40, 536, { size: 21, mono: true, a: h });
    for (var i = 0; i < 11; i++) {
      var hole = i > 2 && i < 10, q = K.p(t, 20.6 + i * 0.08, 0.3);
      K.box(220 + i * 62, 512, 54, 48, { fill: hole ? 'rgba(252,129,129,.08)' : P.card, stroke: hole ? P.red : P.green, dash: hole ? [5, 5] : null, r: 8, a: q });
      K.text(hole ? '' : String(i < 3 ? i + 1 : 4), 247 + i * 62, 536, { size: 19, mono: true, align: 'center', a: q });
    }
    K.text('HOLEY', 1020, 522, { size: 20, mono: true, weight: 700, color: P.red, a: K.p(t, 21.8) });
    K.text('extra hole checks', 1020, 552, { size: 16, color: P.red, a: K.p(t, 22.2) });
  } },

/* 9 ─ measure, don't guess */
{ d: 24, title: 'Watching the engine',
  caps: [
    [0.3, 'You can watch V8 work. In Node, the trace opt and trace deopt flags log each optimization and each deopt.'],
    [7, 'In Chrome, the Performance panel shows parsing, compiling, garbage collection and your own functions on a timeline.'],
    [13, 'Be careful with microbenchmarks: a quick console loop often measures warm-up, not the real optimized speed.'],
    [18.5, 'Write boring, type-consistent code, keep shapes uniform, and profile real workloads before you optimize.']],
  draw: function (K, t) {
    var P = K.P, cmd = ['$ node --trace-opt --trace-deopt app.js'];
    K.panel(40, 80, 680, 230, 'Terminal', { a: K.p(t, 0.2) });
    K.code(cmd, 64, 124, { size: 20, n: K.typed(t, cmd, [0.6], 30), t: t, a: K.p(t, 0.2) });
    [['[marking add for optimization to TURBOFAN]', P.muted, 2.8], ['[completed compiling add (target TURBOFAN)]', P.green, 3.8],
     ['[bailout (kind: deopt-eager, reason: not a Smi)]', P.red, 5]].forEach(function (l, i) {
      K.text(l[0], 64, 186 + i * 38, { size: 18, mono: true, color: l[1], a: K.p(t, l[2], 0.3) });
    });
    var pf = K.p(t, 7.2);
    K.panel(750, 80, 490, 230, 'Performance', { a: pf });
    var F = [['Parse', 770, 130, 90, P.purple, 7.6], ['Compile Script', 865, 130, 170, P.warm, 8], ['Evaluate Script', 770, 176, 450, P.acc, 8.4],
             ['add', 800, 222, 130, P.blue, 9], ['Minor GC', 960, 222, 120, P.green, 9.6], ['add', 1090, 222, 130, P.blue, 10]];
    F.forEach(function (f) {
      var q = K.p(t, f[5], 0.5); if (q <= 0) return;
      K.box(f[1], f[2], f[3] * q, 36, { fill: f[4], r: 5, a: pf * 0.85 });
      K.text(f[0], f[1] + 10, f[2] + 18, { size: 16, weight: 700, color: P.bg, a: q * pf });
    });
    K.text('time →', 1180, 288, { size: 16, color: P.muted, align: 'right', a: pf });
    /* warm-up curve */
    var w = K.p(t, 13.2);
    K.box(40, 340, 600, 230, { fill: P.code, stroke: P.line, a: w });
    K.text('time per call', 64, 366, { size: 16, color: P.muted, a: w });
    K.text('iterations →', 620, 548, { size: 16, color: P.muted, align: 'right', a: w });
    var pr = K.p(t, 13.6, 2.4), g = K.g;
    if (pr > 0) { g.save(); g.globalAlpha *= w; g.strokeStyle = P.warm; g.lineWidth = 3; g.beginPath();
      for (var i = 0; i <= 60 * pr; i++) { var x = 70 + i * 9, y = 410 + 110 * (1 - Math.exp(-i / 9)); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke(); g.restore(); }
    K.box(70, 392, 110, 150, { fill: 'rgba(252,129,129,.10)', stroke: P.red, dash: [5, 5], a: K.p(t, 15.4) });
    K.text('warm-up', 125, 420, { size: 16, color: P.red, align: 'center', a: K.p(t, 15.4) });
    K.text('steady state', 470, 500, { size: 16, color: P.green, align: 'center', a: K.p(t, 16.2) });
    ['type-consistent code', 'uniform object shapes', 'profile real workloads', 'measure, then optimize'].forEach(function (s, i) {
      var q = K.p(t, 18.8 + i * 0.6);
      K.mark(700, 380 + i * 52, true, 0.8, q); K.text(s, 728, 380 + i * 52, { size: 22, a: q });
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 21 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Ignition interprets bytecode; Sparkplug, Maglev and TurboFan compile hot code',
     'Optimized code speculates on types; a failed guard means deoptimization',
     'Parse and compile cost is real: ship less JavaScript',
     'Same properties in the same order share a hidden class',
     'Inline caches: monomorphic is fast, megamorphic is slow'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(190, y, true, 0.9, q);
      K.text(s, 222 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 21 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
