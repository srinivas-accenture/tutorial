/* Day 42 in motion: pure functions, immutability, currying, pipe, Maybe and Result, recursion, memoization, stack depth and trampolines.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day42', {
  kicker: 'JavaScript: Zero to Architect · Day 42',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 42: functional programming in JavaScript, and recursion with its limits.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Functional + recursive', 0, 0, { size: 88, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 42 · Pure functions, pipelines and the call stack', 640, 330, { size: 32, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Pure and immutable', 'pipe and currying', 'Recursion and the stack'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 360 + i * 280, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ pure vs impure */
{ d: 22, title: 'Pure functions',
  caps: [
    [0.3, 'A pure function returns the same output for the same input, and changes nothing outside itself.'],
    [6.5, 'An impure one reads or changes hidden state. Call it twice with nothing and you get two different answers.'],
    [13, 'Date.now() and Math.random() are hidden inputs too. Pass them in as parameters, and keep side effects at the edges.']],
  draw: function (K, t) {
    var P = K.P, c1 = ['const pure = (n) => n + 1;'], c2 = ['let counter = 0;', 'const impure = () => ++counter;'];
    K.panel(40, 90, 580, 130, 'pure.js', { a: K.p(t, 0.2) });
    K.code(c1, 64, 140, { size: 22, n: K.typed(t, c1, [0.6], 30), t: t });
    [[1.8, 250], [3.2, 320]].forEach(function (r) {
      var q = K.p(t, r[0], 0.4);
      K.text('pure(1)', 70, r[1], { size: 22, mono: true, a: q });
      K.arrow(170, r[1], 240, r[1], { p: K.p(t, r[0] + 0.2, 0.4), color: P.acc });
      K.text('2', 260, r[1], { size: 24, mono: true, color: P.warm, a: K.p(t, r[0] + 0.5) });
    });
    K.mark(330, 286, true, 0.9, K.p(t, 4.2)); K.text('same input, same output', 358, 286, { size: 19, color: P.green, a: K.p(t, 4.2) });
    K.panel(660, 90, 580, 130, 'impure.js', { a: K.p(t, 6.5) });
    K.code(c2, 684, 130, { size: 22, n: K.typed(t, c2, [6.8, 7.5], 30), t: t, a: K.p(t, 6.5) });
    var st = t > 10.4 ? 2 : t > 9 ? 1 : 0;
    K.box(1040, 240, 180, 110, { fill: P.code, stroke: P.warm, a: K.p(t, 8.4) });
    K.text('hidden state', 1130, 264, { size: 16, color: P.muted, align: 'center', a: K.p(t, 8.4) });
    K.text('counter: ' + st, 1130, 310, { size: 22, mono: true, color: P.warm, align: 'center', a: K.p(t, 8.4) });
    [[9, 250, '1'], [10.4, 320, '2']].forEach(function (r) {
      var q = K.p(t, r[0], 0.4);
      K.text('impure()', 690, r[1], { size: 22, mono: true, a: q });
      K.arrow(800, r[1], 860, r[1], { p: K.p(t, r[0] + 0.2, 0.4), color: P.warm });
      K.text(r[2], 880, r[1], { size: 24, mono: true, color: P.warm, a: K.p(t, r[0] + 0.5) });
    });
    K.mark(700, 380, false, 0.9, K.p(t, 11.4)); K.text('same call, different answers', 728, 380, { size: 19, color: P.red, a: K.p(t, 11.4) });
    var e = K.p(t, 13.2);
    K.chip('Date.now()', 200, 440, { mono: true, size: 19, stroke: P.red, a: e });
    K.chip('Math.random()', 420, 440, { mono: true, size: 19, stroke: P.red, a: K.p(t, 13.6) });
    K.text('hidden inputs → make them parameters', 560, 440, { size: 19, color: P.muted, a: K.p(t, 14.2) });
    var B = [['read input', 'edge', P.blue, 16], ['price(order, now)', 'pure core', P.green, 16.8], ['write output', 'edge', P.blue, 17.6]];
    B.forEach(function (b, i) {
      var x = 70 + i * 400, q = K.p(t, b[3], 0.5);
      K.box(x, 500, 340, 74, { stroke: b[2], a: q, fill: i === 1 ? 'rgba(104,211,145,.10)' : P.card });
      K.text(b[0], x + 170, 526, { size: 20, mono: i === 1, weight: 700, align: 'center', a: q });
      K.text(b[1], x + 170, 556, { size: 16, color: P.muted, align: 'center', a: q });
      if (i) K.arrow(x - 54, 537, x - 8, 537, { p: q, color: P.muted });
    });
  } },

/* 3 ─ immutability */
{ d: 23, title: 'Immutability',
  caps: [
    [0.3, 'Immutability: instead of editing a value, you build a new one that shares the parts that did not change.'],
    [7, 'Spread copies one level. next.items is a brand new array, but next.user is the very same object as before.'],
    [14, 'Arrays have copying methods: toSorted, toSpliced and with. And Object.freeze is shallow, so nested data can still change.']],
  draw: function (K, t) {
    var P = K.P, code = ['const state = { user: { name: "Ana" }, items: [1, 2] };', 'const next = { ...state, items: [...state.items, 3] };'];
    K.panel(40, 90, 760, 130, 'state.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 132, { size: 20, n: K.typed(t, code, [0.6, 3.6], 40), t: t, hi: t > 7.2 && t < 14 ? 1 : -1, w: 730 });
    function obj(y, name, a) {
      K.chip(name, 90, y + 48, { mono: true, size: 20, stroke: P.acc, a: a });
      K.arrow(132, y + 48, 196, y + 48, { p: a, color: P.muted, lw: 2, head: 9 });
      K.box(200, y, 220, 96, { stroke: P.line, a: a });
      K.text('user', 222, y + 28, { size: 19, mono: true, a: a }); K.text('items', 222, y + 70, { size: 19, mono: true, a: a });
    }
    var a1 = K.p(t, 2.2), a2 = K.p(t, 4.8);
    obj(250, 'state', a1);
    K.box(560, 250, 240, 50, { stroke: P.green, a: a1 }); K.text('{ name: "Ana" }', 680, 275, { size: 19, mono: true, align: 'center', a: a1 });
    K.box(560, 320, 160, 46, { stroke: P.line, a: a1 }); K.text('[1, 2]', 640, 343, { size: 19, mono: true, align: 'center', a: a1 });
    K.arrow(400, 278, 556, 275, { p: K.p(t, 2.6, 0.4), color: P.muted, lw: 2, head: 9 });
    K.arrow(400, 320, 556, 340, { p: K.p(t, 2.8, 0.4), color: P.muted, lw: 2, head: 9 });
    obj(420, 'next', a2);
    K.curve(400, 448, 500, 360, 600, 304, { p: K.p(t, 8.6, 0.6), color: P.green, lw: 2.5, head: 10 });
    K.box(560, 470, 200, 46, { stroke: P.warm, a: K.p(t, 10.2) }); K.text('[1, 2, 3]', 660, 493, { size: 19, mono: true, align: 'center', a: K.p(t, 10.2) });
    K.arrow(400, 490, 556, 492, { p: K.p(t, 10, 0.4), color: P.warm, lw: 2, head: 9 });
    K.text('shared', 812, 268, { size: 16, color: P.green, a: K.p(t, 9.2) });
    K.text('new array', 660, 540, { size: 16, color: P.warm, align: 'center', a: K.p(t, 10.8) });
    K.text('state.items still [1, 2]', 740, 343, { size: 16, color: P.muted, a: K.p(t, 11.6) });
    var R = [['arr.sort()', 'mutates', false, 14.4], ['arr.toSorted()', 'new array', true, 15.2], ['arr.toSpliced(1, 1)', 'new array', true, 15.8], ['arr.with(0, 9)', 'new array', true, 16.4]];
    K.text('Arrays', 900, 110, { size: 19, weight: 700, color: P.muted, a: K.p(t, 14.2) });
    R.forEach(function (r, i) {
      var y = 150 + i * 50, q = K.p(t, r[3], 0.4);
      K.mark(912, y, r[2], 0.7, q);
      K.text(r[0], 934, y, { size: 19, mono: true, a: q });
      K.text(r[1], 1236, y, { size: 16, color: r[2] ? P.green : P.red, align: 'right', a: q });
    });
    var f = K.p(t, 18.2);
    K.box(930, 380, 310, 170, { fill: 'rgba(246,173,85,.10)', stroke: P.warm, a: f });
    K.code(['const s = Object.freeze(', '  { items: [1, 2] });', 's.items.push(3); // works!'], 948, 400, { size: 17, lh: 1.6, a: f });
    K.text('freeze is shallow', 1085, 520, { size: 17, color: P.warm, align: 'center', a: K.p(t, 19.6) });
  } },

/* 4 ─ higher-order functions and currying */
{ d: 22, title: 'Higher-order functions and currying',
  caps: [
    [0.3, 'Functions are values. A higher-order function takes or returns a function, like map, filter, reduce or debounce.'],
    [7, 'Currying turns add(a, b) into add(a)(b). add(10) is a partially applied function, waiting for b.'],
    [14, 'So [1, 2, 3].map(add(10)) gives 11, 12, 13. Small curried helpers slot neatly into map and pipe.']],
  draw: function (K, t) {
    var P = K.P;
    var q1 = K.p(t, 1);
    K.chip('[1, 2, 3]', 150, 140, { mono: true, size: 20, stroke: P.blue, a: q1 });
    K.arrow(220, 140, 300, 140, { p: K.p(t, 1.4, 0.4), color: P.muted });
    K.box(310, 104, 260, 72, { stroke: P.acc, a: K.p(t, 1.6) });
    K.text('map(double)', 440, 140, { size: 22, mono: true, align: 'center', a: K.p(t, 1.6) });
    K.chip('double', 440, 214, { mono: true, size: 17, stroke: P.purple, a: K.p(t, 2.4) });
    K.arrow(440, 196, 440, 180, { p: K.p(t, 2.6, 0.3), color: P.purple, lw: 2, head: 9 });
    K.text('a function goes in', 520, 214, { size: 16, color: P.purple, a: K.p(t, 2.8) });
    K.arrow(580, 140, 660, 140, { p: K.p(t, 3, 0.4), color: P.muted });
    K.chip('[2, 4, 6]', 730, 140, { mono: true, size: 20, stroke: P.green, a: K.p(t, 3.4) });
    ['filter', 'reduce', 'debounce', 'once'].forEach(function (s, i) { K.chip(s, 900 + (i % 2) * 170, 120 + Math.floor(i / 2) * 60, { mono: true, size: 18, stroke: P.acc, a: K.p(t, 4 + i * 0.4) }); });
    var code = ['const add = (a) => (b) => a + b;'];
    K.panel(40, 270, 560, 100, 'curry.js', { a: K.p(t, 7) });
    K.code(code, 64, 314, { size: 22, n: K.typed(t, code, [7.3], 30), t: t, a: K.p(t, 7) });
    K.chip('add(10)', 720, 320, { mono: true, size: 22, stroke: P.acc, a: K.p(t, 9.2) });
    K.arrow(790, 320, 850, 320, { p: K.p(t, 9.6, 0.4), color: P.muted });
    var fx = K.p(t, 10);
    K.box(860, 280, 360, 80, { stroke: P.purple, a: fx });
    K.text('(b) => 10 + b', 1040, 320, { size: 22, mono: true, align: 'center', a: fx });
    K.chip('closure: a = 10', 1040, 386, { size: 16, stroke: P.warm, a: K.p(t, 11) });
    K.text('a new function, waiting for b', 860, 432, { size: 17, color: P.muted, a: K.p(t, 11.8) });
    var c2 = ['[1, 2, 3].map(add(10));'];
    K.panel(40, 470, 560, 100, '', { a: K.p(t, 14.2) });
    K.code(c2, 64, 504, { size: 22, n: K.typed(t, c2, [14.5], 30), t: t, a: K.p(t, 14.2) });
    K.arrow(620, 520, 700, 520, { p: K.p(t, 16, 0.4), color: P.muted });
    ['11', '12', '13'].forEach(function (s, i) {
      var q = K.back((t - 16.4 - i * 0.4) / 0.5);
      if (q > 0) K.chip(s, 760 + i * 100, 520, { s: q, mono: true, size: 24, stroke: P.green, color: P.warm });
    });
    K.text('fits map and pipe', 1060, 520, { size: 17, color: P.green, a: K.p(t, 18) });
  } },

/* 5 ─ composition with pipe */
{ d: 23, title: 'Composition with pipe',
  caps: [
    [0.3, 'pipe chains small pure steps: the output of each one becomes the input of the next.'],
    [7.5, 'For 1, 2, 3, 4: keep the evens, square them, then add them up. The answer is 20.'],
    [15.5, 'This is declarative: it says what you want, not how to loop. And each step can be tested on its own.']],
  draw: function (K, t) {
    var P = K.P, code = ['const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);', 'const sumSquaresOfEvens = pipe(filter(isEven), map(square), sum);', 'sumSquaresOfEvens([1, 2, 3, 4]);   // 20'];
    K.panel(40, 90, 1200, 170, 'pipe.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 132, { size: 22, n: K.typed(t, code, [0.6, 3.4, 7.7], 34), t: t, hi: t > 3.4 && t < 7.5 ? 1 : t > 7.7 && t < 15.5 ? 2 : -1, w: 1170 });
    /* the conveyor: values and stations alternate on one row */
    var R = [['[1, 2, 3, 4]', 110, 160, 8.6, 'v'], ['filter(isEven)', 330, 200, 1.4, 's', 9.4], ['[2, 4]', 525, 100, 10, 'v'], ['map(square)', 710, 190, 1.8, 's', 10.8],
             ['[4, 16]', 900, 110, 11.4, 'v'], ['sum', 1050, 110, 2.2, 's', 12.2], ['20', 1180, 60, 12.8, 'v']];
    K.box(40, 320, 1200, 160, { fill: false, stroke: P.line, dash: [8, 8], a: K.p(t, 1) });
    K.text('pipe', 64, 344, { size: 17, weight: 700, color: P.muted, a: K.p(t, 1) });
    R.forEach(function (r, i) {
      var q = K.back((t - r[3]) / 0.5), y = 410;
      if (i) K.arrow(R[i - 1][1] + R[i - 1][2] / 2 + 4, y, r[1] - r[2] / 2 - 6, y, { p: K.p(t, Math.max(R[i - 1][3], r[3]) - 0.2, 0.4), color: P.muted, lw: 2, head: 9 });
      if (q <= 0) return;
      if (r[4] === 's') {
        K.g.save(); K.g.translate(r[1], y); K.g.scale(q, q);
        K.box(-r[2] / 2, -34, r[2], 68, { stroke: t > r[5] && t < r[5] + 1.4 ? P.warm : P.acc, a: K.clamp(q) });
        K.text(r[0], 0, 0, { size: 20, mono: true, align: 'center', a: K.clamp(q) });
        K.g.restore();
        K.mark(r[1], 456, true, 0.6, K.p(t, 16.6 + i * 0.25));
      } else K.chip(r[0], r[1], y, { s: q, mono: true, size: 19, stroke: i === 6 ? P.warm : i ? P.acc : P.blue, color: i === 6 ? P.warm : P.ink });
    });
    var d = K.p(t, 15.8);
    K.box(40, 510, 560, 70, { fill: 'rgba(252,129,129,.08)', stroke: P.line, a: d });
    K.text('how: for loop, if, push, total += …', 64, 545, { size: 19, mono: true, color: P.muted, a: d });
    K.box(680, 510, 560, 70, { fill: 'rgba(104,211,145,.10)', stroke: P.green, a: K.p(t, 16.4) });
    K.text('what: evens → squares → sum', 704, 545, { size: 20, color: P.green, a: K.p(t, 16.4) });
    K.arrow(610, 545, 670, 545, { p: K.p(t, 16.2, 0.4), color: P.green });
  } },

/* 6 ─ Maybe and Result */
{ d: 27, title: 'Maybe and Result',
  caps: [
    [0.3, 'Maybe wraps a value that might be missing. Its map runs your function only when a value is present.'],
    [7, 'On a missing path, every later step is skipped, and getOrElse supplies the default. No scattered null checks.'],
    [14, 'Result is either Ok or Err. A thrown error becomes a value that slides past the remaining steps.'],
    [21, 'For a single lookup, optional chaining is enough. These patterns pay off in longer pipelines.']],
  draw: function (K, t) {
    var P = K.P;
    function track(y, items, a0, skipFrom, color) {
      items.forEach(function (it, i) {
        var x = it[1], q = K.p(t, a0 + i * 0.9, 0.4), skip = skipFrom != null && i >= skipFrom && i < items.length - 2;
        if (i) K.arrow(items[i - 1][1] + items[i - 1][2] / 2 + 4, y, x - it[2] / 2 - 6, y, { p: q, color: skip ? P.line : color, lw: 2, head: 9, dash: skip ? [6, 6] : null });
        K.chip(it[0], x, y, { mono: true, size: 18, stroke: skip ? P.line : i === items.length - 1 ? P.warm : color, color: skip ? P.muted : i === items.length - 1 ? P.warm : P.ink, a: q * (skip ? 0.6 : 1) });
      });
    }
    K.text('Maybe', 40, 110, { size: 20, weight: 700, color: P.acc, a: K.p(t, 0.4) });
    track(160, [['Maybe({ a: { b: 5 } })', 175, 250], ['.map((o) => o.a)', 470, 190], ['.map((a) => a.b)', 700, 190], ['.getOrElse(0)', 935, 160], ['5', 1130, 40]], 0.8, null, P.acc);
    track(250, [['Maybe({ a: null })', 175, 210], ['.map((o) => o.a)', 470, 190], ['.map((a) => a.b)', 700, 190], ['.getOrElse(0)', 935, 160], ['0', 1130, 40]], 7.3, 2, P.acc);
    K.text('null', 585, 226, { size: 16, mono: true, color: P.warm, a: K.p(t, 8.4) });
    K.text('skipped', 700, 290, { size: 16, color: P.muted, align: 'center', a: K.p(t, 9.6) });
    K.text('no if (x != null) anywhere', 1130, 300, { size: 16, color: P.green, align: 'right', a: K.p(t, 11) });
    K.text('Result', 40, 360, { size: 20, weight: 700, color: P.acc, a: K.p(t, 14) });
    var ra = K.p(t, 14.4);
    K.box(160, 404, 1000, 6, { fill: P.green, r: 3, a: ra * 0.6 }); K.text('Ok', 1180, 407, { size: 18, weight: 700, color: P.green, a: ra });
    K.box(160, 494, 1000, 6, { fill: P.red, r: 3, a: ra * 0.6 }); K.text('Err', 1180, 497, { size: 18, weight: 700, color: P.red, a: ra });
    K.chip('tryCatch(() => JSON.parse(s))', 330, 450, { mono: true, size: 18, stroke: P.acc, a: K.p(t, 15) });
    K.chip('.map((o) => o.x)', 720, 407, { mono: true, size: 18, stroke: P.green, a: K.p(t, 15.6) });
    K.chip('.unwrap()', 990, 407, { mono: true, size: 18, stroke: P.green, a: K.p(t, 16) });
    var okp = K.p(t, 16.6, 2.2), erp = K.p(t, 18.4, 2.2);
    function dot(x, y, c, a) { var g = K.g; g.save(); g.globalAlpha *= a; g.fillStyle = c; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill(); g.restore(); }
    if (t > 16.6 && t < 21) dot(500 + okp * 600, 407, P.green, K.win(t, 16.6, 21));
    if (t > 18.4 && t < 22) dot(500 + erp * 600, 497, P.red, K.win(t, 18.4, 22));
    K.text('s = \'{"x":1}\' → 1', 600, 372, { size: 16, mono: true, color: P.green, a: K.p(t, 17) });
    K.text('s = "{" → Err(SyntaxError): map is skipped', 600, 530, { size: 16, mono: true, color: P.red, a: K.p(t, 18.8) });
    K.chip('one lookup?  obj?.a?.b ?? 0', 640, 572, { mono: true, size: 17, stroke: P.blue, a: K.p(t, 21.4) });
  } },

/* 7 ─ recursion and the call stack */
{ d: 26, title: 'Recursion and the call stack',
  caps: [
    [0.3, 'Recursion: a function calls itself on a smaller problem. It needs a base case that stops, and a step that shrinks the input.'],
    [7.5, 'Each call waits for the next one, so frames pile up on the call stack: sum(3), sum(2), sum(1), sum(0).'],
    [14, 'sum(0) is the base case and returns 0. Then the frames pop one by one, and the results combine: 1, 3, 6.'],
    [20.5, 'Trees, nested data and backtracking are clearest this way. The recursion depth equals the height of the tree.']],
  draw: function (K, t) {
    var P = K.P, code = ['const sum = (n) =>', '  n === 0 ? 0 : n + sum(n - 1);'];
    K.panel(40, 90, 600, 130, 'sum.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 134, { size: 22, n: K.typed(t, code, [0.6, 1.6], 30), t: t });
    K.chip('base case: n === 0', 180, 260, { mono: true, size: 18, stroke: P.green, a: K.p(t, 3.4) });
    K.chip('smaller: sum(n - 1)', 460, 260, { mono: true, size: 18, stroke: P.warm, a: K.p(t, 4.6) });
    K.box(720, 90, 500, 490, { fill: P.code, stroke: P.line, a: K.p(t, 7.2) });
    K.text('Call stack', 744, 116, { size: 18, weight: 700, color: P.muted, a: K.p(t, 7.2) });
    var F = [[3, '3 + sum(2)', '3 + 3 = 6'], [2, '2 + sum(1)', '2 + 1 = 3'], [1, '1 + sum(0)', '1 + 0 = 1'], [0, 'base case', 'returns 0']];
    F.forEach(function (f, i) {
      var push = K.p(t, 8 + i * 1.2, 0.5), pop = K.p(t, 15 + (3 - i) * 1.3, 0.5), y = 500 - i * 92 - (1 - push) * 40;
      var a = push * (1 - pop), done = t > 14.4 + (3 - i) * 1.3;
      if (a <= 0) return;
      K.box(760, y, 420, 70, { fill: P.card, stroke: i === 3 ? P.green : P.purple, a: a });
      K.text('sum(' + f[0] + ')', 784, y + 35, { size: 22, mono: true, weight: 700, a: a });
      K.text(done ? f[2] : f[1], 1156, y + 35, { size: 20, mono: true, align: 'right', color: done ? P.green : P.muted, a: a });
    });
    K.text('waiting…', 1180, 150, { size: 16, color: P.warm, align: 'right', a: K.win(t, 10, 14.6) });
    var res = K.back((t - 19.2) / 0.5);
    if (res > 0) K.chip('sum(3) = 6', 970, 300, { s: res, mono: true, size: 26, stroke: P.green, color: P.warm });
    var tr = K.p(t, 20.8);
    var N = [[340, 340], [230, 410], [450, 410], [170, 480], [290, 480], [450, 480]];
    [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]].forEach(function (e, k) { K.arrow(N[e[0]][0], N[e[0]][1] + 14, N[e[1]][0], N[e[1]][1] - 14, { p: K.p(t, 21 + k * 0.2, 0.4), color: P.muted, lw: 2, head: 8 }); });
    N.forEach(function (n, i) { var g = K.g; g.save(); g.globalAlpha *= K.p(t, 20.8 + i * 0.2, 0.4); g.fillStyle = P.acc; g.beginPath(); g.arc(n[0], n[1], 10, 0, 7); g.fill(); g.restore(); });
    K.text('depth = height = 3 frames', 340, 540, { size: 18, color: P.muted, align: 'center', a: K.p(t, 22.4) });
    K.chip('trees', 580, 360, { size: 17, stroke: P.blue, a: tr }); K.chip('nested data', 580, 420, { size: 17, stroke: P.blue, a: K.p(t, 21.2) });
    K.chip('backtracking', 580, 480, { size: 17, stroke: P.blue, a: K.p(t, 21.6) });
  } },

/* 8 ─ memoization */
{ d: 23, title: 'Overlapping subproblems',
  caps: [
    [0.3, 'Naive fib recomputes the same subproblems again and again. fib(5) already repeats fib(3) and fib(2), and fib(20) makes 21,891 calls.'],
    [8, 'Memoization caches each answer in a Map. A repeated call returns at once, so fib(20) needs only 39 calls.'],
    [15.5, 'Spot overlapping subproblems, then memoize, or build the answer bottom-up with a loop. Exponential becomes linear.']],
  draw: function (K, t) {
    var P = K.P, nodes = [], leaf = 0, seen = {};
    /* lay the fib(5) call tree out by leaf order; mark memo hits in left-first evaluation order */
    function build(n, depth, hidden) {
      var me = { n: n, d: depth, hidden: hidden, hit: false }; nodes.push(me);
      if (!hidden && n >= 2 && seen[n]) { me.hit = true; }
      var kidsHidden = hidden || me.hit;
      if (n < 2) { me.x = leaf++; }
      else { var a = build(n - 1, depth + 1, kidsHidden), b = build(n - 2, depth + 1, kidsHidden); me.x = (a.x + b.x) / 2; me.kids = [a, b]; }
      if (!hidden && n >= 2) seen[n] = true;
      return me;
    }
    build(5, 0, false);
    var memo = K.p(t, 8.4, 0.8);
    function px(x) { return 80 + x * 92; }
    nodes.forEach(function (nd, i) {
      if (nd.kids) nd.kids.forEach(function (k) {
        K.arrow(px(nd.x), 112 + nd.d * 90 + 18, px(k.x), 112 + k.d * 90 - 18, { p: K.p(t, 0.6 + k.d * 0.6, 0.4), color: P.line, lw: 2, head: 8, a: k.hidden ? 1 - memo * 0.85 : 1 });
      });
    });
    nodes.forEach(function (nd) {
      var q = K.p(t, 0.6 + nd.d * 0.6, 0.4), rep = nd.n === 3 || nd.n === 2, hot = rep && t > 3;
      var a = q * (nd.hidden ? 1 - memo * 0.85 : 1);
      K.chip('fib(' + nd.n + ')', px(nd.x), 112 + nd.d * 90, { mono: true, size: 17, a: a, stroke: nd.hit && memo > 0.5 ? P.green : hot ? P.warm : P.line, color: hot && !(nd.hidden && memo > 0.5) ? P.warm : P.ink });
    });
    K.text('repeats: fib(3) ×2, fib(2) ×3', 400, 560, { size: 18, color: P.warm, align: 'center', a: K.win(t, 3.6, 9) });
    K.text('memo hit: subtree skipped', 400, 560, { size: 18, color: P.green, align: 'center', a: K.p(t, 9.4) });
    K.box(860, 90, 380, 120, { fill: P.code, stroke: P.line, a: K.p(t, 5) });
    K.text('fib(20)', 884, 120, { size: 18, color: P.muted, a: K.p(t, 5) });
    var c = Math.round(21891 * K.p(t, 5.2, 1.6));
    K.text(c.toLocaleString('en-US') + ' calls', 884, 168, { size: 28, mono: true, color: P.red, a: K.p(t, 5.2) * (1 - K.p(t, 12, 0.5)) });
    K.text('39 calls', 884, 168, { size: 28, mono: true, color: P.green, a: K.p(t, 12, 0.5) });
    K.text('exponential', 1216, 120, { size: 16, color: P.red, align: 'right', a: K.p(t, 6) * (1 - K.p(t, 12, 0.5)) });
    K.text('linear', 1216, 120, { size: 16, color: P.green, align: 'right', a: K.p(t, 12, 0.5) });
    K.panel(860, 240, 380, 200, 'memo: Map', { a: K.p(t, 8.6) });
    [['2', '1'], ['3', '2'], ['4', '3'], ['5', '5']].forEach(function (r, i) {
      var q = K.p(t, 9.4 + i * 0.6, 0.4);
      K.text(r[0] + '  →  ' + r[1], 890, 296 + i * 36, { size: 20, mono: true, a: q });
    });
    K.chip('memoize', 940, 490, { size: 18, stroke: P.green, a: K.p(t, 16) });
    K.chip('or a bottom-up loop', 1110, 490, { size: 18, stroke: P.green, a: K.p(t, 16.6) });
    K.text('[a, b] = [b, a + b]', 1050, 548, { size: 18, mono: true, color: P.muted, align: 'center', a: K.p(t, 17.4) });
  } },

/* 9 ─ stack depth, tail calls, trampolines */
{ d: 33, title: 'Stack depth and trampolines',
  caps: [
    [0.3, 'Every frame takes stack space. Go too deep and the engine throws RangeError: Maximum call stack size exceeded.'],
    [7, 'Tail calls will not save you. The spec allows the optimisation, but V8 and SpiderMonkey never shipped it. Only Safari did.'],
    [14, 'Fix one: a loop, or an explicit stack. Push work onto your own array and pop it in a loop. Arrays hold millions of items.'],
    [21, 'Fix two: a trampoline. The function returns a thunk instead of calling itself, and a loop keeps calling the thunks.'],
    [27.5, 'The stack stays shallow, so a million steps finish: sumT(1e6) returns 500000500000.']],
  draw: function (K, t) {
    var P = K.P;
    /* left: the call stack */
    K.box(40, 90, 460, 490, { fill: P.code, stroke: P.line, a: K.p(t, 0.2) });
    K.text('Call stack', 64, 116, { size: 18, weight: 700, color: P.muted, a: K.p(t, 0.2) });
    var grow = K.p(t, 0.8, 4), n = Math.floor(grow * 11), boom = t > 5 && t < 14, gone = K.p(t, 13.6, 0.6), fr = 1 - gone;
    for (var i = 0; i < n; i++) {
      var y = 532 - i * 36;
      K.box(70, y, 400, 30, { fill: P.card, stroke: boom ? P.red : P.purple, r: 6, a: fr });
      K.text('sumTo(' + (1000000 - i) + ', …)', 90, y + 15, { size: 16, mono: true, color: boom ? P.red : P.ink, a: fr });
    }
    K.text('≈ 10,000 frames', 470, 116, { size: 16, color: P.warm, align: 'right', a: K.p(t, 2) * fr });
    var e = K.p(t, 5.2) * fr;
    K.box(520, 90, 720, 90, { fill: 'rgba(252,129,129,.12)', stroke: P.red, a: e });
    K.text('RangeError: Maximum call', 544, 120, { size: 21, mono: true, color: P.red, a: e });
    K.text('stack size exceeded', 544, 152, { size: 21, mono: true, color: P.red, a: e });
    /* tail calls */
    var w2 = K.win(t, 7.2, 14), tc = ['const sumTo = (n, acc = 0) =>', '  n === 0 ? acc : sumTo(n - 1, acc + n);', 'sumTo(1e6);   // RangeError in V8'];
    K.panel(520, 200, 720, 160, 'tail call', { a: w2 });
    K.code(tc, 544, 240, { size: 20, lh: 1.5, n: K.typed(t, tc, [7.4, 8.2, 9.6], 40), t: t, a: w2, hi: t > 8.2 && t < 9.6 ? 1 : -1, w: 690 });
    [['V8 · Chrome, Node', false], ['SpiderMonkey · Firefox', false], ['JavaScriptCore · Safari', true]].forEach(function (r, k) {
      var y = 400 + k * 52, q = K.p(t, 10.4 + k * 0.6, 0.4) * w2;
      K.mark(550, y, r[1], 0.8, q); K.text(r[0], 578, y, { size: 20, a: q });
      K.text(r[1] ? 'proper tail calls' : 'no tail-call optimisation', 1220, y, { size: 17, color: r[1] ? P.green : P.red, align: 'right', a: q });
    });
    /* explicit stack */
    var w3 = K.win(t, 14.2, 21), es = ['const stack = [root];', 'while (stack.length) {', '  const node = stack.pop();', '  visit(node);', '  stack.push(...node.children);', '}'];
    K.panel(520, 200, 720, 250, 'explicit stack', { a: w3 });
    K.code(es, 544, 240, { size: 20, lh: 1.5, n: K.typed(t, es, [14.6, 15.2, 15.8, 16.5, 17, 17.8], 40), t: t, a: w3 });
    K.box(70, 300, 400, 90, { stroke: P.green, a: K.win(t, 15, 21) });
    K.text('your array, on the heap', 270, 326, { size: 17, color: P.muted, align: 'center', a: K.win(t, 15, 21) });
    K.text(Math.round(1000000 * K.p(t, 15.4, 3)).toLocaleString('en-US') + ' items  ✓', 270, 360, { size: 22, mono: true, color: P.green, align: 'center', a: K.win(t, 15, 21) });
    K.box(70, 500, 400, 60, { fill: P.card, stroke: P.purple, r: 8, a: K.win(t, 15, 21) });
    K.text('one frame: the loop', 270, 530, { size: 18, mono: true, align: 'center', a: K.win(t, 15, 21) });
    /* trampoline */
    var w4 = K.p(t, 21.2), tp = ['const trampoline = (f) => (...args) => {', '  let r = f(...args);', '  while (typeof r === "function") r = r();', '  return r;', '};',
      'const sumT = trampoline(function s(n, acc = 0) {', '  return n === 0 ? acc : () => s(n - 1, acc + n);', '});'];
    K.panel(520, 200, 720, 300, 'trampoline', { a: w4 });
    K.code(tp, 544, 238, { size: 19, lh: 1.5, n: K.typed(t, tp, [21.4, 22, 22.6, 23.4, 23.7, 24, 24.8, 25.8], 44), t: t, a: w4, hi: t > 22.6 && t < 24 ? 2 : t > 24.8 && t < 27.5 ? 6 : -1, w: 690 });
    var lp = K.p(t, 23);
    K.box(70, 500, 400, 60, { fill: P.card, stroke: P.purple, r: 8, a: lp });
    K.text('trampoline loop', 270, 530, { size: 18, mono: true, align: 'center', a: lp });
    var cyc = (t * 2.2) % 1, sh = t > 23.6 && t < 28 ? (cyc < 0.6 ? 1 : 0) : 0;
    K.box(70, 432, 400, 60, { fill: P.card, stroke: P.warm, r: 8, a: Math.min(lp, sh + (t >= 28 ? 0 : 0)) });
    K.text('s(n) → returns a thunk', 270, 462, { size: 18, mono: true, align: 'center', color: P.warm, a: Math.min(lp, sh) });
    K.text('depth stays at 2', 270, 400, { size: 17, color: P.green, align: 'center', a: K.p(t, 24.4) });
    var r = K.back((t - 28) / 0.6);
    if (r > 0) K.chip('sumT(1e6)  →  500000500000', 880, 545, { s: r, mono: true, size: 22, stroke: P.green, color: P.warm });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 42 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Pure functions and new values instead of mutation; side effects at the edges',
     'Higher-order functions, currying and pipe build pipelines from small steps',
     'Maybe and Result turn missing values and errors into values',
     'Recursion: base case, smaller step, one stack frame per call',
     'Memoize overlapping subproblems; no TCO in V8, so loop or trampoline'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(170, y, true, 0.9, q);
      K.text(s, 202 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 42 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
