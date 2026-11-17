/* Day 6 in motion: closures, private state, the loop puzzle, module pattern, once, memoize, curry and memory. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day6', {
  kicker: 'JavaScript: Zero to Architect · Day 6',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 6: closures, the functions that remember where they were born.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Closures', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 6 · Functions that remember', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Lexical environments', 'Private state', 'once · memoize · curry'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ a function keeps its birth scope */
{ d: 24, title: 'What a closure is',
  caps: [
    [0.3, 'A closure is a function plus the scope it was created in. An inner function can read the variables around it.'],
    [6.2, 'makeGreeter runs, creates an environment holding greeting, and returns the inner function.'],
    [12.2, 'Its stack frame is popped, but the environment survives: the returned function keeps a link to it.'],
    [18.2, 'Call hi("Ana") much later, and greeting is still there to read.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function makeGreeter(greeting) {', '  return function (name) {', '    return greeting + ", " + name;', '  };', '}', 'const hi = makeGreeter("Hi");', 'console.log(hi("Ana"));'];
    var hl = t > 18.4 ? 6 : t > 6.3 ? 5 : t > 3.2 ? 2 : -1;
    K.panel(40, 84, 620, 316, 'greeter.js');
    K.code(code, 66, 130, { size: 22, n: K.typed(t, code, [0.5, 1.35, 2.05, 2.95, 3.1, 6.3, 18.4], 40), t: t, hi: hl, w: 594 });
    K.panel(40, 420, 620, 160, 'Console', { a: K.p(t, 0.5) });
    K.text('Hi, Ana', 70, 480, { size: 24, mono: true, a: K.p(t, 19.6, 0.3) });
    K.chip('closure = function + its birth scope', 970, 240, { size: 20, stroke: P.acc, a: K.win(t, 1, 6.4) });
    var st = K.p(t, 6.3);
    K.box(690, 84, 240, 316, { fill: P.code, stroke: P.line, a: st });
    K.text('Call stack', 810, 108, { size: 17, color: P.muted, align: 'center', a: st });
    K.box(960, 84, 280, 316, { fill: P.code, stroke: P.line, a: st });
    K.text('Heap', 1100, 108, { size: 17, color: P.muted, align: 'center', a: st });
    var q = K.p(t, 6.8, 0.5), pop = K.p(t, 12.4, 0.7), fy = 350 - (1 - q) * 30 - pop * 40;
    K.box(712, fy - 24, 196, 48, { fill: P.card, stroke: P.purple, a: q * (1 - pop) });
    K.text('makeGreeter("Hi")', 810, fy, { size: 17, mono: true, align: 'center', a: q * (1 - pop) });
    K.text('frame popped', 810, 250, { size: 17, color: P.muted, align: 'center', a: K.win(t, 12.9, 18.2) });
    var e = K.back((t - 7.6) / 0.6);
    if (e > 0) {
      K.box(985, 136, 230, 100, { stroke: P.warm, a: K.clamp(e), lw: t > 12.6 && t < 18 ? 3.5 : 2 });
      K.text('environment', 1003, 160, { size: 16, color: P.muted, a: K.clamp(e) });
      K.text('greeting: "Hi"', 1003, 202, { size: 20, mono: true, color: P.warm, a: K.clamp(e) });
    }
    K.arrow(908, 340, 980, 204, { p: K.p(t, 8, 0.4), a: 1 - pop, color: P.muted });
    var f = K.p(t, 9.6);
    K.box(985, 276, 230, 92, { stroke: P.acc, a: f });
    K.text('hi: function', 1003, 302, { size: 20, weight: 700, a: f });
    K.text('[[Environment]]', 1003, 340, { size: 16, mono: true, color: P.muted, a: f });
    K.arrow(1170, 276, 1170, 240, { p: K.p(t, 10.4, 0.4), color: P.warm, head: 10 });
    K.text('still reachable through hi', 1100, 384, { size: 16, color: P.green, align: 'center', a: K.p(t, 13.2) });
    var c = K.p(t, 18.6, 0.5);
    K.box(712, 326, 196, 48, { fill: P.card, stroke: P.acc, a: c });
    K.text('hi("Ana")', 810, 350, { size: 17, mono: true, align: 'center', a: c });
    K.curve(908, 338, 950, 250, 980, 176, { p: K.p(t, 19.2, 0.7), color: P.acc, dash: [7, 6], lw: 2.5 });
  } },

/* 3 ─ every call, a new environment */
{ d: 24, title: 'Private, independent state',
  caps: [
    [0.3, 'Every call of the outer function creates a brand-new environment.'],
    [6, 'a and b each get their own count, shared by their own inc and get. Now call a.inc() twice and b.inc() once.'],
    [13, 'So a.get() is 2 and b.get() is 1: two independent counters.'],
    [18.5, 'Nothing outside can touch count. typeof a.count is "undefined": the closure is the only way in.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function makeCounter() {', '  let count = 0;', '  return { inc: () => ++count,', '           get: () => count };', '}', 'const a = makeCounter();', 'const b = makeCounter();'];
    K.panel(40, 84, 600, 290, 'counter.js');
    K.code(code, 66, 128, { size: 21, lh: 1.5, n: K.typed(t, code, [0.4, 0.9, 1.3, 2.0, 2.65, 2.8, 4.2], 45), t: t, hi: t > 4.2 && t < 6 ? 6 : t > 2.8 && t < 6 ? 5 : -1, w: 574 });
    var c2 = ['a.inc(); a.inc(); b.inc();', 'console.log(a.get(), b.get());', 'console.log(typeof a.count);'];
    K.panel(40, 394, 600, 190, 'main.js', { a: K.p(t, 5.8) });
    K.code(c2, 66, 438, { size: 21, lh: 1.6, n: K.typed(t, c2, [6.2, 13, 18.6], 30), t: t, a: K.p(t, 5.8) });
    K.text('→ 2 1', 450, 486, { size: 21, mono: true, color: P.warm, a: K.p(t, 14.4, 0.3) });
    K.text('→ "undefined"', 450, 518, { size: 19, mono: true, color: P.warm, a: K.p(t, 19.8, 0.3) });
    var nA = t > 8.2 ? 2 : t > 7.4 ? 1 : 0, nB = t > 9 ? 1 : 0;
    [[690, 'environment of a', nA, 3.3, P.acc, [[7.4, 7.9], [8.2, 8.7]]], [980, 'environment of b', nB, 4.8, P.purple, [[9, 9.5]]]].forEach(function (E) {
      var x = E[0], q = K.back((t - E[3]) / 0.6), hot = 0;
      E[5].forEach(function (w) { hot = Math.max(hot, K.win(t, w[0], w[1], 0.15)); });
      if (q <= 0) return;
      K.g.save(); K.g.translate(x + 130, 180); K.g.scale(q, q); K.g.translate(-x - 130, -180);
      K.box(x, 110, 260, 140, { stroke: hot > 0.5 ? P.warm : E[4], lw: hot > 0.5 ? 3.5 : 2, a: K.clamp(q) });
      K.text(E[1], x + 20, 136, { size: 17, color: P.muted, a: K.clamp(q) });
      K.text('count: ' + E[2], x + 20, 196, { size: 28, mono: true, color: P.warm, a: K.clamp(q) });
      K.g.restore();
      K.lock(x + 232, 138, 0.8, P.warm, K.p(t, 18.8));
      var ch = K.p(t, 5, 0.5);
      K.chip('inc', x + 70, 320, { mono: true, size: 19, stroke: hot > 0.5 ? P.warm : E[4], a: ch });
      K.chip('get', x + 190, 320, { mono: true, size: 19, stroke: t > 13.4 && t < 15.5 ? P.green : E[4], a: ch });
      K.arrow(x + 70, 300, x + 90, 256, { p: K.p(t, 5.3, 0.4), color: P.muted, lw: 2.5, head: 10 });
      K.arrow(x + 190, 300, x + 170, 256, { p: K.p(t, 5.3, 0.4), color: P.muted, lw: 2.5, head: 10 });
    });
    var r = K.p(t, 14.4);
    K.box(690, 400, 550, 184, { fill: P.code, stroke: P.line, a: r });
    K.mark(724, 436, true, 0.8, r); K.text('a.get() → 2    b.get() → 1', 752, 436, { size: 20, mono: true, a: r });
    K.text('independent state per call', 752, 478, { size: 18, color: P.green, a: K.p(t, 15) });
    var x2 = K.p(t, 19.8);
    K.mark(724, 540, false, 0.8, x2); K.text('a.count → undefined: no way in', 752, 540, { size: 20, mono: true, color: P.red, a: x2 });
  } },

/* 4 ─ variables, not values */
{ d: 20, title: 'A live link, not a copy',
  caps: [
    [0.3, 'Closures capture variables, not values. The link is live.'],
    [6, 'Change x after creating f, and f sees the new value: it prints 2.'],
    [12.5, 'Picture a pointer to the variable itself, never a snapshot of its value.']],
  draw: function (K, t) {
    var P = K.P, code = ['let x = 1;', 'const f = () => x;', 'x = 2;', 'console.log(f());'];
    K.panel(40, 84, 560, 236, 'live.js');
    K.code(code, 66, 136, { size: 24, n: K.typed(t, code, [0.6, 1.2, 6.2, 7.2], 26), t: t, hi: t > 7.2 ? 3 : t > 6.2 ? 2 : t > 1.2 ? 1 : -1, w: 534 });
    K.panel(40, 340, 560, 120, 'Console', { a: K.p(t, 6.8) });
    K.text('2', 70, 410, { size: 28, mono: true, color: P.warm, a: K.p(t, 8.6, 0.3) });
    var s = K.p(t, 0.8);
    K.box(680, 84, 560, 200, { fill: false, stroke: P.purple, a: s });
    K.text('scope (environment)', 704, 112, { size: 18, weight: 700, color: P.purple, a: s });
    var x1 = K.back((t - 1) / 0.5);
    if (x1 > 0) K.chip('x', 770, 196, { s: x1, mono: true, size: 26, stroke: P.acc });
    K.arrow(806, 196, 880, 196, { p: K.p(t, 1.3, 0.4), color: P.muted });
    var ch = K.p(t, 6.5, 0.5);
    K.text('1', 900, 196, { size: 32, mono: true, color: P.warm, a: K.p(t, 1.5) * (1 - ch) });
    K.text('2', 900, 196 + (1 - ch) * 20, { size: 32, mono: true, color: P.warm, a: ch });
    K.box(880, 168, 60, 56, { fill: false, stroke: P.warm, a: K.win(t, 6.4, 7.6) });
    var f = K.p(t, 1.8);
    K.box(700, 340, 260, 90, { stroke: P.acc, a: f });
    K.text('f = () => x', 724, 385, { size: 21, mono: true, a: f });
    K.curve(800, 340, 760, 290, 770, 222, { p: K.p(t, 2.3, 0.6), color: P.acc, lw: 2.5 });
    K.text('f holds a link to the scope', 990, 385, { size: 17, color: P.muted, a: K.p(t, 2.8) });
    K.curve(900, 340, 940, 280, 905, 222, { p: K.p(t, 8, 0.5), color: P.warm, dash: [6, 6], lw: 2.5, a: K.win(t, 8, 12.3) });
    K.text('reads x now: 2', 990, 300, { size: 17, color: P.warm, a: K.win(t, 8.4, 12.3) });
    var b = K.p(t, 12.8), c = K.p(t, 14.2);
    K.box(40, 490, 580, 90, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: b });
    K.mark(80, 535, false, 0.9, b); K.text('copy of the value: f would return 1', 110, 535, { size: 20, a: b });
    K.box(660, 490, 580, 90, { fill: 'rgba(104,211,145,.10)', stroke: P.green, a: c });
    K.mark(700, 535, true, 0.9, c); K.text('link to the variable: f returns 2', 730, 535, { size: 20, a: c });
  } },

/* 5 ─ the loop puzzle */
{ d: 26, title: 'Closures in loops',
  caps: [
    [0.3, 'The classic interview puzzle: closures created inside a loop.'],
    [5.5, 'With var there is one i for the whole loop. The callbacks run after the loop, when i is already 3.'],
    [12.5, 'let creates a fresh binding for every iteration, so each closure captures its own j: 0, 1, 2.'],
    [19.5, 'Before ES2015 the fix was an IIFE per iteration. Today, just use let.']],
  draw: function (K, t) {
    var P = K.P;
    var v = ['for (var i = 0; i < 3; i++)', '  setTimeout(() => console.log(i));'], l = ['for (let j = 0; j < 3; j++)', '  setTimeout(() => console.log(j));'];
    K.panel(40, 84, 580, 130, 'var.js');
    K.code(v, 64, 126, { size: 20, n: K.typed(t, v, [0.6, 1.4], 40), t: t });
    K.panel(660, 84, 580, 130, 'let.js', { a: K.p(t, 1.6) });
    K.code(l, 684, 126, { size: 20, n: K.typed(t, l, [2.4, 3.2], 40), t: t, a: K.p(t, 1.6) });
    K.text('var: one i for the whole loop', 330, 248, { size: 20, weight: 700, color: P.warm, align: 'center', a: K.p(t, 5.6) });
    var iv = t < 6.2 ? 0 : Math.min(3, Math.floor((t - 6.2) / 0.7) + 1), ib = K.p(t, 6);
    K.box(260, 390, 140, 64, { stroke: P.warm, a: ib, lw: 2.5 });
    K.text('i: ' + iv, 330, 422, { size: 26, mono: true, color: P.warm, align: 'center', a: ib });
    [150, 330, 510].forEach(function (x, k) {
      var q = K.back((t - 6.3 - k * 0.7) / 0.5); if (q <= 0) return;
      K.chip('() => i', x, 310, { mono: true, size: 18, stroke: P.warm, s: q });
      K.arrow(x, 330, x === 330 ? 330 : x < 330 ? 290 : 370, 386, { p: K.p(t, 6.6 + k * 0.7, 0.4), color: P.warm, lw: 2.5, head: 10 });
    });
    K.text('loop ends, then the timers fire', 330, 482, { size: 17, color: P.muted, align: 'center', a: K.p(t, 9) });
    K.mark(220, 520, false, 0.8, K.p(t, 10.2));
    K.text('prints  3  3  3', 250, 520, { size: 24, mono: true, color: P.red, a: K.p(t, 10.2) });
    K.text('let: a new j per iteration', 950, 248, { size: 20, weight: 700, color: P.green, align: 'center', a: K.p(t, 12.6) });
    [770, 950, 1130].forEach(function (x, k) {
      var q = K.back((t - 13 - k * 0.6) / 0.5); if (q <= 0) return;
      K.chip('() => j', x, 310, { mono: true, size: 18, stroke: P.green, s: q });
      K.arrow(x, 330, x, 386, { p: K.p(t, 13.3 + k * 0.6, 0.4), color: P.green, lw: 2.5, head: 10 });
      K.box(x - 60, 390, 120, 64, { stroke: P.green, a: K.clamp(q), lw: 2.5 });
      K.text('j: ' + k, x, 422, { size: 26, mono: true, color: P.green, align: 'center', a: K.clamp(q) });
    });
    K.text('three bindings, three closures', 950, 482, { size: 17, color: P.muted, align: 'center', a: K.p(t, 15) });
    K.mark(840, 520, true, 0.8, K.p(t, 16));
    K.text('prints  0  1  2', 870, 520, { size: 24, mono: true, color: P.green, a: K.p(t, 16) });
    K.chip('old fix: an IIFE per iteration  ·  today: just use let', 640, 568, { size: 18, stroke: P.acc, s: K.back((t - 19.8) / 0.6), a: K.p(t, 19.8) });
  } },

/* 6 ─ module pattern */
{ d: 24, title: 'The module pattern',
  caps: [
    [0.3, 'The module pattern: an IIFE runs once and returns only the public methods.'],
    [7, 'balance lives in the closure. deposit and the balance getter are the only way in.'],
    [13, 'Assigning bank.balance does nothing, because there is no setter. In strict mode it throws a TypeError.'],
    [19, 'Today ES modules and private class fields do the same job, but the idea is identical.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const bank = (function () {', '  let balance = 0;   // private', '  return {', '    deposit(n) { balance += n; return balance; },', '    get balance() { return balance; }', '  };', '})();'];
    K.panel(40, 84, 640, 320, 'bank.js');
    K.code(code, 64, 126, { size: 20, lh: 1.55, n: K.typed(t, code, [0.6, 1.25, 1.95, 2.25, 3.3, 4.15, 4.3], 45), t: t, hi: t > 7.2 && t < 13 ? 1 : t > 4.6 && t < 7 ? 6 : -1, w: 616 });
    var c2 = ['bank.deposit(50);', 'bank.balance = 999;', 'console.log(bank.balance);'];
    K.panel(40, 424, 640, 160, 'main.js', { a: K.p(t, 7.3) });
    K.code(c2, 64, 466, { size: 20, n: K.typed(t, c2, [7.6, 13.2, 14.3], 26), t: t, a: K.p(t, 7.3), hi: t > 13.2 && t < 19 ? 1 : -1, w: 616,
      marks: t > 14 && t < 19 ? { 1: 'rgba(252,129,129,.18)' } : null });
    K.text('→ 50', 460, 477, { size: 20, mono: true, color: P.warm, a: K.p(t, 8.4, 0.3) });
    K.text('→ 50', 460, 541, { size: 20, mono: true, color: P.warm, a: K.p(t, 15.4, 0.3) });
    var v = K.p(t, 1.4);
    K.box(740, 84, 500, 210, { fill: 'rgba(246,173,85,.06)', stroke: P.warm, dash: [8, 6], a: v });
    K.text('closure: private', 764, 112, { size: 18, weight: 700, color: P.warm, a: v });
    K.lock(1206, 114, 0.9, P.warm, v);
    var b = K.back((t - 1.6) / 0.5);
    if (b > 0) K.chip('balance', 860, 200, { s: b, mono: true, size: 24, stroke: P.acc });
    K.arrow(930, 200, 990, 200, { p: K.p(t, 1.9, 0.4), color: P.muted });
    var dep = K.p(t, 8.4, 0.5);
    K.text('0', 1010, 200, { size: 32, mono: true, color: P.warm, a: K.p(t, 2) * (1 - dep) });
    K.text('50', 1010, 200 + (1 - dep) * 20, { size: 32, mono: true, color: P.warm, a: dep });
    var pub = K.p(t, 4.6);
    K.box(740, 324, 500, 116, { stroke: P.acc, a: pub });
    K.text('public: bank', 985, 350, { size: 18, weight: 700, color: P.acc, align: 'center', a: pub });
    K.chip('deposit(n)', 870, 398, { mono: true, size: 19, stroke: K.win(t, 7.8, 8.9) > 0.5 ? P.warm : P.acc, a: pub });
    K.chip('get balance', 1100, 398, { mono: true, size: 19, stroke: K.win(t, 14.8, 15.9) > 0.5 ? P.warm : P.acc, a: pub });
    K.arrow(870, 378, 870, 298, { p: K.p(t, 7.3, 0.5), color: P.acc });
    K.arrow(1100, 378, 1100, 298, { p: K.p(t, 7.6, 0.5), color: P.acc });
    var w = K.win(t, 13.4, 19.2);
    K.chip('bank.balance = 999', 960, 500, { mono: true, size: 18, stroke: P.red, color: P.red, a: w });
    K.arrow(960, 480, 960, 446, { p: K.p(t, 13.8, 0.4), a: w, color: P.red, dash: [5, 5], lw: 2.5, head: 10 });
    K.mark(1110, 500, false, 0.9, Math.min(w, K.p(t, 14.2)));
    K.text('no setter: ignored, or a TypeError in strict mode', 990, 556, { size: 17, color: P.red, align: 'center', a: Math.min(w, K.p(t, 14.6)) });
    var m = K.p(t, 19.4);
    K.chip('ES modules', 850, 500, { size: 19, stroke: P.acc, s: K.back((t - 19.4) / 0.5), a: m });
    K.chip('class #private fields', 1080, 500, { size: 19, stroke: P.acc, s: K.back((t - 19.8) / 0.5), a: K.p(t, 19.8) });
    K.text('same idea, built into the language', 990, 556, { size: 17, color: P.muted, align: 'center', a: K.p(t, 20.4) });
  } },

/* 7 ─ memoize */
{ d: 25, title: 'memoize: a cache in a closure',
  caps: [
    [0.3, 'memoize wraps a function and keeps a cache, a Map, inside its closure.'],
    [6.5, 'The first call sq(4) is a miss: compute 16, store it, and return it.'],
    [12, 'The second sq(4) is a hit: the cached 16 comes back with no work. sq(5) is a new miss.'],
    [18, 'Only memoize pure, expensive functions, and bound the cache, or it grows forever.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function memoize(fn) {', '  const cache = new Map();', '  return (x) => {', '    if (cache.has(x)) return cache.get(x);', '    const v = fn(x);', '    cache.set(x, v); return v;', '  };', '}'];
    var hl = t > 15.2 && t < 17 ? 4 : t > 12.6 && t < 14.8 ? 3 : t > 8.4 && t < 10.5 ? 4 : t > 1.7 && t < 6.4 ? 1 : -1;
    K.panel(40, 84, 620, 310, 'memoize.js');
    K.code(code, 64, 124, { size: 20, lh: 1.55, n: K.typed(t, code, [0.6, 1.1, 1.65, 2.0, 2.9, 3.3, 3.95, 4.05], 50), t: t, hi: hl, w: 596 });
    var c2 = ['const sq = memoize(n => n * n);', 'sq(4);  // miss: computes 16', 'sq(4);  // hit: cached 16', 'sq(5);  // miss: computes 25'];
    K.panel(40, 414, 620, 170, 'main.js', { a: K.p(t, 6.4) });
    K.code(c2, 64, 448, { size: 20, n: K.typed(t, c2, [6.6, 7.7, 12.2, 15], 32), t: t, a: K.p(t, 6.4) });
    var k = t > 15 ? 5 : 4, call = K.p(t, 8);
    var pulse = Math.max(K.win(t, 8, 8.6, 0.2), K.win(t, 12.6, 13.2, 0.2), K.win(t, 15.4, 16, 0.2));
    K.chip('sq(' + k + ')', 985, 120, { mono: true, size: 22, stroke: P.acc, a: call, s: 1 + pulse * 0.12 });
    K.box(835, 170, 300, 64, { stroke: P.purple, a: K.p(t, 8.3) });
    K.text('cache.has(' + k + ') ?', 985, 202, { size: 20, mono: true, align: 'center', a: K.p(t, 8.3) });
    K.arrow(985, 140, 985, 166, { p: K.p(t, 8.2, 0.3), color: P.muted, lw: 2.5, head: 9 });
    var miss = Math.max(K.win(t, 8.6, 11.8), K.win(t, 15.6, 17.6)), hit = K.win(t, 12.9, 15.2), br = K.p(t, 8.3);
    K.box(740, 290, 250, 70, { stroke: P.warm, lw: miss > 0.5 ? 3.5 : 2, a: br * (0.35 + 0.65 * miss) });
    K.text('miss → fn(x)', 865, 325, { size: 20, align: 'center', color: P.warm, a: br * (0.35 + 0.65 * miss) });
    K.box(1000, 290, 240, 70, { stroke: P.green, lw: hit > 0.5 ? 3.5 : 2, a: br * (0.35 + 0.65 * hit) });
    K.text('hit → cache.get', 1120, 325, { size: 20, align: 'center', color: P.green, a: br * (0.35 + 0.65 * hit) });
    K.arrow(930, 236, 880, 286, { p: K.p(t, 8.6, 0.4), color: P.warm, a: 0.35 + 0.65 * miss, lw: 2.5, head: 10 });
    K.arrow(1040, 236, 1100, 286, { p: K.p(t, 12.9, 0.4), color: P.green, a: 0.35 + 0.65 * hit, lw: 2.5, head: 10 });
    var cb = K.p(t, 1.8);
    K.box(740, 400, 240, 180, { fill: P.code, stroke: P.line, a: cb });
    K.text('cache (Map)', 760, 424, { size: 17, color: P.muted, weight: 700, a: cb });
    K.box(752, 452, 216, 38, { fill: 'rgba(104,211,145,.18)', stroke: P.green, a: K.win(t, 13.3, 15) });
    K.text('4 → 16', 772, 471, { size: 22, mono: true, a: K.p(t, 9.8) });
    K.text('5 → 25', 772, 516, { size: 22, mono: true, a: K.p(t, 16.6) });
    K.arrow(865, 362, 865, 396, { p: Math.max(K.p(t, 9.4, 0.3) * K.win(t, 9.4, 12), K.p(t, 16.2, 0.3)), color: P.warm, lw: 2.5, head: 9 });
    K.curve(980, 471, 1120, 471, 1120, 364, { p: K.p(t, 13.3, 0.6), color: P.green, lw: 2.5, a: 1 - K.p(t, 15.2, 0.4) });
    K.chip('only pure functions', 1110, 490, { size: 18, stroke: P.warm, s: K.back((t - 18.3) / 0.5), a: K.p(t, 18.3) });
    K.chip('bound it: LRU or WeakMap', 1110, 550, { size: 18, stroke: P.warm, s: K.back((t - 19.4) / 0.5), a: K.p(t, 19.4) });
  } },

/* 8 ─ once and curry */
{ d: 25, title: 'once and curry',
  caps: [
    [0.3, 'once runs a function the first time, then returns the stored result forever after.'],
    [7, 'The flag and the result live in the closure. The console shows that init ran only once.'],
    [12.5, 'curry collects arguments in closures until it has fn.length of them, then calls the function.'],
    [19.5, 'Careful: fn.length does not count default or rest parameters.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const once = (fn) => {', '  let done = false, val;', '  return (...a) => done ? val', '    : (done = true, val = fn(...a));', '};', 'const init = once(() => {', '  console.log("init ran"); return 42;', '});'];
    K.panel(40, 84, 600, 290, 'once.js');
    K.code(code, 64, 122, { size: 19, lh: 1.55, n: K.typed(t, code, [0.5, 1.0, 1.5, 2.1, 2.8, 3.0, 3.6, 4.4], 50), t: t, hi: t > 7 && t < 12.5 ? 1 : -1, w: 576 });
    var cp = K.p(t, 6.8);
    K.panel(40, 394, 300, 190, 'Console', { a: cp });
    var L = [['> init()', 7.2, P.muted], ['init ran', 7.8, P.ink], ['42', 8.1, P.warm], ['> init()', 9, P.muted], ['42', 9.5, P.warm]];
    L.forEach(function (r, i) { K.text(r[0], 64, 438 + i * 28, { size: 19, mono: true, color: r[2], a: K.p(t, r[1], 0.3) }); });
    K.box(360, 394, 280, 190, { stroke: P.warm, a: cp });
    K.text('closure', 380, 420, { size: 17, color: P.muted, weight: 700, a: cp });
    var d0 = K.p(t, 7.7, 0.25), d1 = K.p(t, 7.95, 0.3), v0 = K.p(t, 8.1, 0.25), v1 = K.p(t, 8.35, 0.3);
    K.text('done: false', 380, 470, { size: 20, mono: true, a: cp * (1 - d0) });
    K.text('done: true', 380, 470, { size: 20, mono: true, color: P.green, a: d1 });
    K.text('val: undefined', 380, 520, { size: 20, mono: true, a: cp * (1 - v0) });
    K.text('val: 42', 380, 520, { size: 20, mono: true, color: P.green, a: v1 });
    K.text('2nd call: no rerun', 380, 562, { size: 16, color: P.muted, a: K.p(t, 9.6) });
    var cc = ['const add3 = (a, b, c) => a + b + c;', 'const c = curry(add3);', 'c(1)(2)(3);   // 6', 'add3.length;  // 3'];
    var cpn = K.p(t, 12.4);
    K.panel(680, 84, 560, 190, 'curry.js', { a: cpn });
    K.code(cc, 704, 124, { size: 20, n: K.typed(t, cc, [12.6, 13.55, 14.15, 17.2], 40), t: t, a: cpn });
    [['c(1)', '[1]', 14.8], ['(2)', '[1, 2]', 15.6], ['(3)', '[1, 2, 3]', 16.4]].forEach(function (s, i) {
      var x = 700 + i * 205, q = K.back((t - s[2]) / 0.5);
      if (q <= 0) return;
      K.text(s[0], x + 65, 318, { size: 18, mono: true, color: P.muted, align: 'center', a: K.clamp(q) });
      K.box(x, 338, 130, 56, { stroke: i === 2 ? P.green : P.acc, a: K.clamp(q) });
      K.text(s[1], x + 65, 366, { size: 20, mono: true, align: 'center', a: K.clamp(q) });
      if (i) K.arrow(x - 70, 366, x - 6, 366, { p: K.p(t, s[2] - 0.2, 0.3), color: P.muted, lw: 2.5, head: 10 });
    });
    K.text('each step returns a closure holding the args so far', 960, 420, { size: 16, color: P.muted, align: 'center', a: K.p(t, 15.2) });
    K.text('3 args = add3.length → add3(1, 2, 3)', 700, 462, { size: 18, color: P.green, a: K.p(t, 17.2) });
    K.chip('6', 1190, 462, { mono: true, size: 24, stroke: P.green, color: P.green, s: K.back((t - 17.8) / 0.5), a: K.p(t, 17.8) });
    var w = K.p(t, 19.7);
    K.box(680, 500, 560, 84, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: w });
    K.text('((a, b = 2) => a + b).length  // 1', 704, 528, { size: 18, mono: true, a: w });
    K.text('defaults and ...rest are not counted', 704, 560, { size: 17, color: P.red, a: K.p(t, 20.4) });
  } },

/* 9 ─ memory */
{ d: 22, title: 'Closures and memory',
  caps: [
    [0.3, 'A closure keeps its captured variables alive for as long as the function itself is reachable.'],
    [6.5, 'This listener captures big, so a million numbers stay in memory while the listener exists.'],
    [13, 'Copy out only what you need, and remove listeners and clear timers when you are done.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function attach(button) {', '  const big = new Array(1e6).fill(0);', '  button.addEventListener("click", () => {', '    console.log(big.length);', '  });', '}'];
    K.panel(40, 84, 700, 230, 'attach.js');
    K.code(code, 64, 124, { size: 20, lh: 1.55, n: K.typed(t, code, [0.6, 1.2, 2.2, 3.3, 4.0, 4.2], 40), t: t, hi: t > 6.6 && t < 13 ? 3 : -1, w: 676 });
    var fx = ['const n = big.length;  // copy out', 'const fn = () => console.log(n);', 'button.addEventListener("click", fn);', '// later, when you are done:', 'button.removeEventListener("click", fn);'];
    var fp = K.p(t, 13);
    K.panel(780, 84, 460, 230, 'better', { a: fp, stroke: P.green });
    K.code(fx, 802, 122, { size: 18, n: K.typed(t, fx, [13.3, 14.2, 15.0, 16.2, 17.0], 34), t: t, a: fp });
    var fixed = K.p(t, 15.4), fixed0 = K.p(t, 15.1, 0.3);
    var B = [['button', 'in the DOM', 6.7, P.blue], ['click listener', 'a closure', 7.4, P.acc], ['its environment', 'captures big', 8.1, P.purple], ['big array', 'a million items', 8.8, P.warm]];
    B.forEach(function (b, i) {
      var x = 40 + i * 310, q = K.back((t - b[2]) / 0.5), last = i === 3;
      if (q <= 0) return;
      K.g.save(); K.g.translate(x + 135, 410); K.g.scale(q, q); K.g.translate(-x - 135, -410);
      K.box(x, 362, 270, 96, { stroke: last && fixed > 0.5 ? P.green : b[3], fill: last ? 'rgba(246,173,85,' + (0.14 * (1 - fixed)) + ')' : P.card, dash: last && fixed > 0.5 ? [7, 6] : null, lw: 2.5, a: K.clamp(q) });
      K.text(b[0], x + 135, 394, { size: 22, weight: 700, align: 'center', a: K.clamp(q) });
      var sub = i === 2 ? (fixed > 0.5 ? 'captures only n' : b[1]) : i === 3 ? (fixed > 0.5 ? 'can be collected' : b[1]) : b[1];
      K.text(sub, x + 135, 430, { size: 17, color: (i >= 2 && fixed > 0.5) ? P.green : P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(x - 38, 410, x - 6, 410, { p: K.p(t, b[2] - 0.2, 0.3), color: i === 3 && fixed > 0.5 ? P.red : P.muted, lw: 2.5, head: 10, dash: i === 3 && fixed > 0.5 ? [4, 4] : null });
    });
    K.mark(950, 410, false, 0.8, fixed);
    K.text('reachable, so big cannot be garbage collected', 640, 510, { size: 20, color: P.warm, align: 'center', a: K.p(t, 9.6) * (1 - fixed0) });
    K.text('capture only n, then remove the listener: everything can be freed', 640, 510, { size: 20, color: P.green, align: 'center', a: fixed });
    K.chip('also: clearTimeout / clearInterval', 640, 560, { size: 18, stroke: P.acc, mono: false, a: K.p(t, 17.2) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 6 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['A closure is a function plus the scope it was created in',
     'Each call creates a new environment: private, independent state',
     'Closures capture live variables, not values (use let in loops)',
     'Module pattern, once, memoize and curry are all closures',
     'Captured variables stay alive: remove listeners you no longer need'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 6 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
