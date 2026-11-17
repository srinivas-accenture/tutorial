/* Day 1 in motion: what JavaScript is and how it runs, var/let/const, scope and hoisting, types and typeof.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day1', {
  kicker: 'JavaScript: Zero to Architect · Day 1',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 1: what JavaScript is, how it runs, and the values it works with.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('JavaScript', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 1 · Values and variables', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['How JavaScript runs', 'var · let · const', 'Types and typeof'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the engine pipeline */
{ d: 25, title: 'How an engine runs your code',
  caps: [
    [0.3, 'JavaScript is a language. An engine runs it: V8 in Chrome and Node.js, SpiderMonkey in Firefox, JavaScriptCore in Safari.'],
    [6.5, 'First the engine parses your source text into a tree that describes the code: the AST.'],
    [11, 'It compiles the tree to bytecode and starts interpreting it straight away.'],
    [15.5, 'Code that runs often ("hot" code) is recompiled by a JIT compiler into fast machine code.'],
    [20.5, 'If an assumption breaks, the engine falls back to bytecode. You never run a compile step yourself.']],
  draw: function (K, t) {
    var P = K.P, code = ['const greeting = "Hello";', 'console.log(greeting);'];
    K.panel(60, 92, 540, 150, 'app.js', { a: K.p(t, 0.2) });
    K.code(code, 90, 150, { size: 24, n: K.typed(t, code, [0.8, 2.4]), t: t, a: K.p(t, 0.2) });
    K.panel(680, 92, 540, 150, 'Console', { a: K.p(t, 0.2) });
    if (t > 19) { K.text('Hello', 712, 172, { size: 26, mono: true, a: K.p(t, 19, 0.4) }); }
    K.box(30, 296, 1220, 290, { fill: false, stroke: P.line, dash: [8, 8], a: K.p(t, 2.5) });
    K.text('JavaScript engine', 54, 322, { size: 19, weight: 700, color: P.muted, a: K.p(t, 2.5) });
    var B = [['Parser', 'reads the text', 5.2], ['AST', 'a tree of the code', 7.4], ['Bytecode', 'interpreter runs it now', 11.2],
             ['JIT compiler', 'optimises hot code', 15.7], ['Machine code', 'runs on the CPU', 17.6]];
    B.forEach(function (b, i) {
      var x = 50 + i * 245, q = K.back((t - b[2]) / 0.6), hot = i >= 3;
      if (q <= 0) return;
      K.g.save(); K.g.translate(x + 100, 412); K.g.scale(q, q);
      K.box(-100, -52, 200, 104, { stroke: hot ? P.warm : P.acc, a: K.clamp(q) });
      K.text(b[0], 0, -14, { size: 23, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(b[1], 0, 20, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(x - 40, 412, x - 6, 412, { p: K.p(t, b[2] - 0.3, 0.4), color: P.muted });
    });
    K.arrow(330, 246, 160, 356, { p: K.p(t, 4.6, 0.6), color: P.acc });
    if (t > 8) {   /* a tiny tree under the AST box */
      var a = K.p(t, 8, 0.6), cx = 395, y0 = 488;
      [[cx, y0], [cx - 40, y0 + 34], [cx + 40, y0 + 34], [cx + 40, y0 + 66]].forEach(function (n, i) {
        if (i) K.arrow([cx, cx, cx + 40][i - 1], [y0, y0, y0 + 34][i - 1] + 6, n[0], n[1] - 8, { a: a, head: 0.1, lw: 2 });
        K.g.save(); K.g.globalAlpha *= a; K.g.fillStyle = P.acc; K.g.beginPath(); K.g.arc(n[0], n[1], 7, 0, 7); K.g.fill(); K.g.restore();
      });
    }
    K.text('profiler: "this function is hot"', 762, 343, { size: 16, color: P.warm, align: 'center', a: K.win(t, 14.5, 25) });
    K.curve(1130, 466, 885, 600, 640, 466, { p: K.p(t, 20.5, 1), color: P.red, dash: [7, 7], lw: 2.5 });
    K.text('deoptimise when an assumption breaks', 885, 560, { size: 16, color: P.red, align: 'center', a: K.p(t, 21.2) });
    K.arrow(1130, 358, 960, 246, { p: K.p(t, 18.6, 0.5), color: P.green });
  } },

/* 3 ─ engine vs host */
{ d: 22, title: 'Engine + host environment',
  caps: [
    [0.3, 'On its own, the engine only knows the language: values, functions, objects, the call stack and the heap.'],
    [6, 'The host adds everything else. In the browser that means the DOM, fetch, timers and storage…'],
    [12, '…and in Node.js: files, network servers and the process. Same language, different APIs.'],
    [17, 'That is why document works in the browser but throws a ReferenceError in Node.js.']],
  draw: function (K, t) {
    var P = K.P, node = K.p(t, 12, 0.8), br = 1 - node;
    K.box(60, 80, 1160, 500, { fill: false, stroke: P.line, dash: [8, 8], a: K.p(t, 0.2) });
    K.text('Host environment: ' + (t < 12.4 ? 'browser' : 'Node.js'), 84, 108, { size: 20, weight: 700, color: t < 12.4 ? P.blue : P.green, a: Math.abs(br - node) * K.p(t, 0.2) });
    K.box(100, 140, 450, 410, { stroke: P.acc, a: K.p(t, 0.5) });
    K.text('Engine', 124, 170, { size: 22, weight: 700, a: K.p(t, 0.5) });
    K.box(125, 200, 190, 320, { fill: P.code, a: K.p(t, 1.2) }); K.text('Call stack', 220, 222, { size: 17, color: P.muted, align: 'center', a: K.p(t, 1.2) });
    ['main()', 'greet()', 'format()'].forEach(function (f, i) {
      var q = K.p(t, 1.8 + i * 0.6, 0.5);
      K.box(140, 470 - i * 56 - (1 - q) * 30, 160, 44, { fill: P.card, stroke: P.purple, a: q });
      K.text(f, 220, 492 - i * 56 - (1 - q) * 30, { size: 18, mono: true, align: 'center', a: q });
    });
    K.box(335, 200, 190, 320, { fill: P.code, a: K.p(t, 1.2) }); K.text('Heap', 430, 222, { size: 17, color: P.muted, align: 'center', a: K.p(t, 1.2) });
    [[380, 290, 'obj'], [470, 340, 'arr'], [400, 420, 'fn'], [480, 470, 'str']].forEach(function (n, i) {
      var q = K.back((t - 2.4 - i * 0.4) / 0.5); if (q <= 0) return;
      K.g.save(); K.g.globalAlpha *= K.clamp(q); K.g.fillStyle = P.card; K.g.strokeStyle = P.warm; K.g.lineWidth = 2;
      K.g.beginPath(); K.g.arc(n[0], n[1], 30 * q, 0, 7); K.g.fill(); K.g.stroke(); K.g.restore();
      K.text(n[2], n[0], n[1], { size: 16, mono: true, align: 'center', a: K.clamp(q) });
    });
    K.arrow(556, 330, 612, 330, { p: K.p(t, 5.5), color: P.muted }); K.arrow(612, 360, 556, 360, { p: K.p(t, 5.8), color: P.muted });
    K.box(620, 140, 570, 410, { stroke: br > 0.5 ? P.blue : P.green, a: K.p(t, 5.5) });
    K.text('Host APIs', 644, 170, { size: 22, weight: 700, a: K.p(t, 5.5) });
    var A = ['document · DOM', 'fetch()', 'setTimeout()', 'localStorage', 'addEventListener()'],
        N = ['fs · files', 'http · servers', 'process', 'setTimeout()', 'fetch()'];
    A.forEach(function (s, i) { K.chip(s, 760 + (i % 2) * 250, 220 + Math.floor(i / 2) * 64, { mono: true, size: 18, stroke: P.blue, a: Math.min(K.p(t, 6.5 + i * 0.5, 0.4), br) }); });
    N.forEach(function (s, i) { K.chip(s, 760 + (i % 2) * 250, 220 + Math.floor(i / 2) * 64, { mono: true, size: 18, stroke: P.green, a: node * K.p(t, 12.6 + i * 0.4, 0.4) }); });
    var r = K.p(t, 17.2);
    K.box(640, 420, 530, 110, { fill: P.code, a: r });
    K.text('document.title', 664, 450, { size: 18, mono: true, color: P.muted, a: r });
    K.mark(1010, 450, true, 0.8, r); K.text('browser', 1032, 450, { size: 17, a: r });
    K.mark(680, 498, false, 0.8, K.p(t, 18.2)); K.text('Node.js: ReferenceError: document is not defined', 704, 498, { size: 17, color: P.red, a: K.p(t, 18.2) });
  } },

/* 4 ─ running code */
{ d: 20, title: 'Where your code runs',
  caps: [
    [0.3, 'The fastest way to try code: the browser console (F12) or node in a terminal.'],
    [8, 'In a web page, code arrives in a script tag. defer runs it after the HTML has been parsed.'],
    [13.5, 'Start scripts with "use strict" (modules are strict automatically): silent mistakes become errors.']],
  draw: function (K, t) {
    var P = K.P;
    K.panel(60, 80, 560, 300, 'DevTools · Console', { a: K.p(t, 0.2) });
    var c1 = ['> 2 + 3', '> typeof "hi"', '> 0.1 + 0.2'];
    var outs = [['5', 2.6], ["'string'", 4.6], ['0.30000000000000004', 6.6]];
    c1.forEach(function (l, i) {
      var y = 130 + i * 78, st = 1 + i * 2;
      K.code([l], 88, y, { size: 22, n: K.typed(t, [l], [st], 18), t: t, a: K.p(t, st - 0.2, 0.2) });
      K.text(outs[i][0], 112, y + 42, { size: 21, mono: true, color: i === 2 ? P.warm : P.muted, a: K.p(t, outs[i][1], 0.3) });
    });
    K.panel(660, 80, 560, 300, 'Terminal', { a: K.p(t, 0.2) });
    var c2 = ['$ node app.js'];
    K.code(c2, 688, 130, { size: 22, n: K.typed(t, c2, [3.2], 16), t: t });
    K.text('Hello', 688, 186, { size: 22, mono: true, a: K.p(t, 4.4, 0.3) });
    K.text('same engine (V8), different host', 688, 250, { size: 18, color: P.green, a: K.p(t, 5.2) });
    var html = ['<script src="app.js" defer></script>'];
    K.panel(60, 410, 640, 70, '', { a: K.p(t, 8) });
    K.code(html, 84, 432, { size: 20, n: K.typed(t, html, [8.3], 30), t: t, a: K.p(t, 8) });
    var strict = ['"use strict";', 'total = 5;   // ReferenceError: total is not defined'];
    K.panel(60, 494, 760, 100, '', { a: K.p(t, 13.5) });
    K.code(strict, 84, 510, { size: 20, lh: 1.55, n: K.typed(t, strict, [13.8, 15], 30), t: t, a: K.p(t, 13.5) });
    K.chip('defer: run after the HTML is parsed', 980, 445, { size: 17, stroke: P.blue, a: K.p(t, 9.5) });
    K.chip('strict: no accidental globals', 1015, 545, { size: 17, stroke: P.red, a: K.p(t, 16.5) });
  } },

/* 5 ─ let */
{ d: 22, title: 'Variables: let',
  caps: [
    [0.3, 'A variable is a name bound to a value.'],
    [6.5, 'let creates a binding you can reassign later.'],
    [12, 'Declaring the same name twice in one scope is a SyntaxError, reported before any of the file runs.'],
    [17.5, 'Picture a label pointing at a value, not a box that owns it. That matters as soon as values are objects.']],
  draw: function (K, t) {
    var P = K.P, code = ['let score = 10;', 'score = 15;', 'let score = 20;'];
    K.panel(60, 100, 560, 210, 'scores.js');
    K.code(code, 90, 160, { size: 26, n: K.typed(t, code, [1, 7, 12.2], 18), t: t, hi: t > 13.2 ? 2 : t > 7.8 ? 1 : t > 1.6 ? 0 : -1, w: 520 });
    var a = K.back((t - 2.2) / 0.6);
    if (a > 0) K.chip('score', 780, 230, { s: a, size: 26, stroke: P.acc, mono: true });
    K.arrow(850, 230, 960, 230, { p: K.p(t, 2.8, 0.5), color: P.acc });
    var sw = K.p(t, 8.2, 0.7);
    K.chip('10', 1030, 230 + sw * 70, { size: 30, mono: true, color: P.warm, a: K.p(t, 3.2, 0.4) * (1 - sw), s: 1 - sw * 0.3 });
    var n15 = K.back((t - 8.6) / 0.6); if (n15 > 0) K.chip('15', 1030, 230, { size: 30, mono: true, color: P.warm, s: n15, stroke: P.warm });
    K.text('reassigned: the label now points at 15', 780, 320, { size: 19, color: P.muted, a: K.p(t, 9.4) });
    var e = K.p(t, 13.4);
    K.box(660, 400, 560, 110, { fill: 'rgba(252,129,129,.12)', stroke: P.red, a: e });
    K.mark(700, 430, false, 0.9, e);
    K.text("SyntaxError: Identifier 'score'", 728, 430, { size: 21, mono: true, color: P.red, a: e });
    K.text('has already been declared', 728, 470, { size: 21, mono: true, color: P.red, a: e });
    K.text('the whole file fails to parse, so line 1 never runs either', 80, 380, { size: 18, color: P.muted, a: K.p(t, 14.5) });
  } },

/* 6 ─ const */
{ d: 22, title: 'Variables: const',
  caps: [
    [0.3, 'const creates a binding that can never be reassigned.'],
    [7, "But the value is not frozen: you can still change an object's properties."],
    [12.5, 'Pointing the name at a different value is what const forbids.'],
    [18, 'Default to const. Use let only when you will reassign. Avoid var in new code.']],
  draw: function (K, t) {
    var P = K.P, code = ['const user = { name: "Ana" };', 'user.name = "Ben";   // allowed', 'user = {};           // TypeError'];
    K.panel(40, 100, 620, 210, 'user.js');
    K.code(code, 66, 160, { size: 22, n: K.typed(t, code, [1, 7.2, 12.6], 22), t: t, hi: t > 13.4 ? 2 : t > 7.8 ? 1 : t > 1.6 ? 0 : -1, w: 590 });
    var a = K.back((t - 2.2) / 0.6);
    if (a > 0) { K.chip('user', 770, 230, { s: a, size: 26, mono: true, stroke: P.acc }); K.lock(724, 196, 0.9, P.warm, K.p(t, 3.4)); }
    K.arrow(830, 230, 930, 230, { p: K.p(t, 2.8, 0.5), color: P.acc });
    var o = K.p(t, 3, 0.5), chg = K.p(t, 8.2, 0.5);
    K.box(940, 160, 270, 140, { stroke: chg > 0 && t < 11 ? P.green : P.line, a: o, lw: 2.5 });
    K.text('{ }  object', 962, 188, { size: 17, color: P.muted, a: o });
    K.text('name: "Ana"', 962, 240, { size: 24, mono: true, a: o * (1 - chg) });
    K.text('name: "Ben"', 962, 240, { size: 24, mono: true, color: P.green, a: chg });
    K.mark(1180, 190, true, 0.8, K.win(t, 8.6, 12));
    var n = K.p(t, 13.4, 0.5);
    K.box(940, 380, 270, 100, { stroke: P.line, a: n }); K.text('{ }  new object', 962, 430, { size: 19, color: P.muted, a: n });
    K.arrow(790, 262, 930, 420, { p: K.p(t, 14, 0.7), color: P.red, dash: [8, 7] });
    K.mark(862, 344, false, 1, K.p(t, 14.8, 0.3));
    var e = K.p(t, 15.2);
    K.box(40, 400, 620, 80, { fill: 'rgba(252,129,129,.12)', stroke: P.red, a: e });
    K.text('TypeError: Assignment to constant variable.', 64, 440, { size: 21, mono: true, color: P.red, a: e });
    K.chip('const by default', 200, 540, { size: 19, stroke: P.acc, a: K.p(t, 18.4) });
    K.chip('let to reassign', 420, 540, { size: 19, stroke: P.acc, a: K.p(t, 18.9) });
    K.chip('var: legacy', 610, 540, { size: 19, stroke: P.warm, a: K.p(t, 19.4) });
  } },

/* 7 ─ block vs function scope */
{ d: 24, title: 'Scope: var vs let',
  caps: [
    [0.3, 'let and const are block-scoped: they live inside the nearest pair of braces.'],
    [8, 'var ignores blocks. It belongs to the whole function, or to the global scope.'],
    [14, 'So after the block ends, a is still visible and b is gone.'],
    [20, 'This is the main reason modern code uses let and const.']],
  draw: function (K, t) {
    var P = K.P, code = ['if (true) {', '  var a = 1;', '  let b = 2;', '}', 'console.log(a); // 1', 'console.log(b); // ReferenceError'];
    var hi = t > 16 ? 5 : t > 12.5 ? 4 : t > 9.5 ? 3 : t > 6 ? 2 : t > 3.5 ? 1 : t > 2 ? 0 : -1;
    K.panel(40, 90, 600, 340, 'scope.js');
    K.code(code, 66, 140, { size: 22, n: K.typed(t, code, [0.6, 0.9, 1.2, 1.5, 1.7, 1.9], 60), t: t, hi: hi, w: 570 });
    K.box(680, 90, 560, 470, { fill: false, stroke: P.purple, a: K.p(t, 1.5) });
    K.text('Function / global scope', 704, 118, { size: 19, weight: 700, color: P.purple, a: K.p(t, 1.5) });
    var blk = K.p(t, 2.2) * (1 - K.p(t, 10, 0.8) * 0.75);
    K.box(720, 260, 480, 170, { fill: 'rgba(79,209,197,.06)', stroke: P.acc, dash: [8, 6], a: blk });
    K.text('Block { }', 744, 286, { size: 18, weight: 700, color: P.acc, a: blk });
    var up = K.p(t, 9, 1);
    if (t > 3.8) K.chip('var a = 1', 860, 360 - up * 190, { mono: true, size: 20, stroke: P.warm, s: K.back((t - 3.8) / 0.5) });
    K.text('var escapes the block', 940, 206, { size: 16, color: P.warm, a: K.win(t, 9.4, 13.5) });
    if (t > 6.2) K.chip('let b = 2', 1060, 360, { mono: true, size: 20, stroke: P.acc, s: K.back((t - 6.2) / 0.5), a: 1 - K.p(t, 10.2, 0.8) });
    K.text('block ends: b is gone', 1060, 410, { size: 16, color: P.muted, align: 'center', a: K.win(t, 10.6, 15) });
    var o1 = K.p(t, 12.8), o2 = K.p(t, 16.4);
    K.mark(724, 470, true, 0.8, o1); K.text('console.log(a)  →  1', 750, 470, { size: 19, mono: true, a: o1 });
    K.mark(724, 520, false, 0.8, o2); K.text('ReferenceError: b is not defined', 750, 520, { size: 19, mono: true, color: P.red, a: o2 });
    K.chip('prefer let / const', 340, 500, { size: 20, stroke: P.acc, a: K.p(t, 20.3) });
  } },

/* 8 ─ hoisting and the TDZ */
{ d: 24, title: 'Hoisting and the TDZ',
  caps: [
    [0.3, 'Before a scope runs, the engine registers all its declarations first. This is called hoisting.'],
    [5.5, 'A var is created and set to undefined straight away.'],
    [9.5, "let and const are created too, but stay uninitialised until their line runs: the temporal dead zone."],
    [15, 'Reading x early quietly gives undefined. Reading y early throws a ReferenceError, and the script stops there.']],
  draw: function (K, t) {
    var P = K.P, code = ['console.log(x); // undefined', 'var x = 5;', '', "console.log(y); // ReferenceError", 'let y = 5;'];
    var hi = t > 17 ? 3 : t > 14 ? 1 : t > 12.5 ? 0 : -1;
    K.panel(40, 90, 600, 300, 'hoisting.js');
    K.code(code, 66, 140, { size: 22, n: K.typed(t, code, [0.5, 0.8, 1, 1.1, 1.4], 60), t: t, hi: hi, w: 570,
      marks: t > 17.4 ? { 3: 'rgba(252,129,129,.2)' } : null });
    K.chip('1 · creation phase', 800, 112, { size: 18, stroke: P.purple, a: K.p(t, 1.2), color: t > 12 ? P.muted : P.ink });
    K.chip('2 · execution', 1080, 112, { size: 18, stroke: P.acc, a: K.p(t, 12), color: t > 12 ? P.ink : P.muted });
    K.box(680, 150, 560, 230, { fill: P.code, stroke: P.line, a: K.p(t, 1.5) });
    K.text('Scope memory', 704, 176, { size: 17, color: P.muted, weight: 700, a: K.p(t, 1.5) });
    var x1 = K.back((t - 5.7) / 0.5);
    if (x1 > 0) K.chip('x', 760, 240, { s: x1, mono: true, size: 24, stroke: P.warm });
    K.arrow(796, 240, 870, 240, { p: K.p(t, 6.1, 0.4), color: P.muted });
    var five = K.p(t, 14.2, 0.5);
    K.text('undefined', 890, 240, { size: 22, mono: true, color: P.muted, a: K.p(t, 6.4) * (1 - five) });
    K.text('5', 890, 240, { size: 24, mono: true, color: P.warm, a: five });
    var y1 = K.back((t - 9.8) / 0.5);
    if (y1 > 0) K.chip('y', 760, 320, { s: y1, mono: true, size: 24, stroke: t > 17.4 ? P.red : P.acc });
    K.arrow(796, 320, 870, 320, { p: K.p(t, 10.2, 0.4), color: P.muted });
    K.lock(894, 322, 0.9, P.warm, K.p(t, 10.6));
    K.text('uninitialised (TDZ)', 916, 320, { size: 20, color: P.warm, a: K.p(t, 10.6) });
    K.box(680, 400, 560, 150, { fill: P.code, stroke: P.line, a: K.p(t, 12.4) });
    K.text('Output', 704, 424, { size: 16, color: P.muted, weight: 700, a: K.p(t, 12.4) });
    K.text('undefined', 704, 462, { size: 20, mono: true, color: P.muted, a: K.p(t, 13) });
    K.text("ReferenceError: Cannot access 'y'", 704, 498, { size: 19, mono: true, color: P.red, a: K.p(t, 17.6) });
    K.text('before initialization', 704, 526, { size: 19, mono: true, color: P.red, a: K.p(t, 17.6) });
    K.text('execution stops: line 5 never runs', 80, 420, { size: 18, color: P.red, a: K.p(t, 19) });
  } },

/* 9 ─ types and typeof */
{ d: 30, title: 'Types and typeof',
  caps: [
    [0.3, 'Every value has a type. There are seven primitive types…'],
    [6.5, '…string, number, bigint, boolean, undefined, null and symbol. Everything else is an object.'],
    [12.5, 'Primitives are immutable and compared by value. Objects are mutable and shared by reference.'],
    [18, 'typeof tells you the type as a string…'],
    [24, '…with two famous quirks: typeof null is "object", and arrays are "object" too, so use Array.isArray.']],
  draw: function (K, t) {
    var P = K.P;
    var C = [['string', '"hi"', '"string"'], ['number', '42  3.14  NaN', '"number"'], ['bigint', '10n', '"bigint"'], ['boolean', 'true  false', '"boolean"'],
             ['undefined', 'undefined', '"undefined"'], ['null', 'null', '"object"  (quirk!)'], ['symbol', 'Symbol("id")', '"symbol"'], ['object', '{ }  [ ]  () => {}', '"object"']];
    C.forEach(function (c, i) {
      var x = 50 + (i % 4) * 300, y = 90 + Math.floor(i / 4) * 150, q = K.back((t - 0.8 - i * 0.55) / 0.5), obj = i === 7;
      if (q <= 0) return;
      K.g.save(); K.g.translate(x + 135, y + 65); K.g.scale(q, q); K.g.translate(-x - 135, -y - 65);
      K.box(x, y, 270, 130, { stroke: obj ? P.warm : P.acc, a: K.clamp(q) });
      K.text(c[0], x + 18, y + 28, { size: 22, weight: 700, color: obj ? P.warm : P.acc, a: K.clamp(q) });
      K.text(c[1], x + 18, y + 64, { size: 19, mono: true, a: K.clamp(q) });
      var f = K.p(t, 18.4 + i * 0.6, 0.4), bad = i === 5;
      K.text('typeof → ' + c[2], x + 18, y + 102, { size: 15, mono: true, color: bad ? P.red : P.muted, a: f });
      K.g.restore();
    });
    var s1 = K.p(t, 12.6), s2 = K.p(t, 13.6);
    K.box(50, 392, 870, 6, { fill: P.acc, r: 3, a: s1 * 0.7 });
    K.text('primitives: immutable, compared by value', 60, 418, { size: 18, color: P.acc, a: s1 });
    K.box(950, 392, 270, 6, { fill: P.warm, r: 3, a: s2 * 0.7 });
    K.text('objects: by reference', 960, 418, { size: 18, color: P.warm, a: s2 });
    var code = ['typeof null          // "object" (a bug kept for compatibility)', 'Array.isArray([1, 2]) // true', 'value === null        // the reliable null check', 'typeof (() => {})     // "function": functions are objects too'];
    K.panel(50, 440, 1170, 150, '', { a: K.p(t, 24.2) });
    K.code(code, 74, 452, { size: 19, lh: 1.42, n: K.typed(t, code, [24.5, 25.8, 27, 28.1], 44), t: t, a: K.p(t, 24.2) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 1 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Engines parse your code, interpret bytecode and JIT-compile hot code',
     'The host adds the APIs: DOM and fetch in browsers; fs and http in Node.js',
     'const by default, let to reassign, avoid var',
     'Block scope, hoisting and the temporal dead zone',
     'Seven primitive types plus objects, and the typeof quirks'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 1 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
