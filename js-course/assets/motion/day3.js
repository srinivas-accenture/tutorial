/* Day 3 in motion: three ways to write a function, the call stack, parameters, first-class functions, the scope chain, lexical scope, hoisting in depth and the TDZ trap.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day3', {
  kicker: 'JavaScript: Zero to Architect · Day 3',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 3: functions as values, how names are looked up, and what really happens before your code runs.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('JavaScript', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 3 · Functions, scope and hoisting', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Functions as values', 'The scope chain', 'Hoisting in depth'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ three ways to write a function */
{ d: 25, title: 'Three ways to write a function',
  caps: [
    [0.3, 'A function is a reusable recipe: write the steps once, then call it with different inputs to get a result.'],
    [6.5, 'There are three ways to write one: a function declaration, a function expression, and an arrow function.'],
    [13, 'Arrows are short: with a single expression, its value is returned. To return an object, wrap it in parentheses.'],
    [19.5, 'Arrows have no own this or arguments, and cannot be called with new.']],
  draw: function (K, t) {
    var P = K.P;
    var a1 = K.back((t - 0.8) / 0.5), a2 = K.back((t - 1.2) / 0.5);
    if (a1 > 0) K.chip('2', 400, 125, { s: a1, mono: true, size: 24, color: P.warm });
    if (a2 > 0) K.chip('3', 470, 125, { s: a2, mono: true, size: 24, color: P.warm });
    K.arrow(505, 125, 570, 125, { p: K.p(t, 1.8, 0.4), color: P.muted });
    var f = K.back((t - 2.2) / 0.5);
    if (f > 0) K.chip('add', 640, 125, { s: f, mono: true, size: 26, stroke: P.acc });
    K.arrow(700, 125, 765, 125, { p: K.p(t, 3, 0.4), color: P.muted });
    var r = K.back((t - 3.5) / 0.5);
    if (r > 0) K.chip('5', 800, 125, { s: r, mono: true, size: 24, stroke: P.green, color: P.green });
    var R = [['declaration', 'function add(a, b) { return a + b; }', 6.8, 'hoisted whole'],
             ['expression', 'const add = function (a, b) { return a + b; };', 8.8, 'a value in a variable'],
             ['arrow', 'const add = (a, b) => a + b;', 10.8, 'short, implicit return']];
    R.forEach(function (row, i) {
      var y = 195 + i * 78, q = K.p(t, row[2] - 0.2, 0.4);
      K.chip(row[0], 130, y + 30, { size: 19, stroke: i === 2 ? P.warm : P.acc, a: q });
      K.panel(230, y, 1010, 60, '', { a: q });
      K.code([row[1]], 254, y + 17, { size: 22, n: K.typed(t, [row[1]], [row[2]], 30), t: t, a: q });
      K.text(row[3], 1220, y + 30, { size: 16, color: P.muted, align: 'right', a: K.p(t, row[2] + 1.6) });
    });
    var oc = ['const point = () => ({ x: 1 });   // object', 'const oops  = () => { x: 1 };     // undefined'];
    K.panel(40, 440, 680, 135, '', { a: K.p(t, 13.2) });
    K.code(oc, 64, 465, { size: 20, lh: 1.7, n: K.typed(t, oc, [13.5, 16], 28), t: t, a: K.p(t, 13.2) });
    K.mark(700, 482, true, 0.75, K.p(t, 15.2)); K.mark(700, 516, false, 0.75, K.p(t, 17.6));
    K.text('{ } here is a block, not an object', 380, 590 - 3, { size: 16, color: P.red, a: K.win(t, 17.8, 19.6) });
    ['no own this', 'no arguments', 'cannot use new'].forEach(function (s, i) {
      K.chip(s, 980, 468 + i * 48, { size: 18, stroke: P.warm, a: K.p(t, 19.8 + i * 0.7, 0.4) });
    });
  } },

/* 3 ─ calls and the call stack */
{ d: 26, title: 'Calls and the call stack',
  caps: [
    [0.3, 'Every call pushes a new frame, called an execution context, onto the call stack.'],
    [7, 'Parameters become local bindings inside that frame. A nested call pushes another frame on top.'],
    [14, 'return pops the frame and hands the value back: 4, then 9, then 13.'],
    [20.5, 'A function with no return statement gives back undefined.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function square(n) { return n * n; }', 'function sumSq(a, b) {', '  return square(a) + square(b);', '}', 'sumSq(2, 3);   // 13'];
    var hi = t > 18.4 ? 4 : t > 9.2 ? (t < 17.2 ? 0 : 2) : t > 2.2 ? (t > 7.2 ? 2 : 4) : -1;
    K.panel(40, 85, 610, 280, 'stack.js');
    K.code(code, 64, 135, { size: 20, lh: 1.6, n: K.typed(t, code, [0.5, 0.8, 1, 1.2, 1.3], 80), t: t, hi: hi, w: 580 });
    K.box(690, 85, 300, 500, { fill: P.code, stroke: P.line, a: K.p(t, 0.5) });
    K.text('Call stack', 840, 112, { size: 17, color: P.muted, weight: 700, align: 'center', a: K.p(t, 0.5) });
    function frame(slot, label, vars, tin, tout, col) {
      var qi = K.p(t, tin, 0.5), qo = tout ? K.p(t, tout, 0.5) : 0; if (qi <= 0 || qo >= 1) return;
      var y = 520 - slot * 74 - (1 - qi) * 50 - qo * 40, a = qi * (1 - qo);
      K.box(710, y - 30, 260, 60, { fill: P.card, stroke: col, a: a });
      K.text(label, 728, y - 6, { size: 19, mono: true, weight: 700, a: a });
      if (vars) K.text(vars[0], 728, y + 16, { size: 16, mono: true, color: P.warm, a: a * K.p(t, vars[1]) });
    }
    frame(0, 'global', null, 1.2, 0, P.line);
    frame(1, 'sumSq(2, 3)', ['a = 2, b = 3', 7.6], 2.6, 19, P.purple);
    frame(2, 'square(2)', ['n = 2', 10], 9.4, 14.6, P.acc);
    frame(2, 'square(3)', ['n = 3', 16], 15.6, 17.4, P.acc);
    K.text('push ↓', 840, 160, { size: 17, color: P.green, align: 'center', a: K.win(t, 2.6, 4.6) + K.win(t, 9.4, 11.4) });
    var V = [['square(2) → 4', 14.8], ['square(3) → 9', 17.6], ['sumSq(2, 3) → 13', 19.2]];
    K.text('returned', 1020, 112, { size: 17, color: P.muted, weight: 700, a: K.p(t, 14.4) });
    V.forEach(function (v, i) { K.text(v[0], 1020, 160 + i * 44, { size: 18, mono: true, color: i === 2 ? P.green : P.ink, a: K.p(t, v[1], 0.4) }); });
    var u = ['function log(x) { console.log(x); }', 'log("hi");   // returns undefined'];
    K.panel(40, 395, 610, 120, '', { a: K.p(t, 20.7) });
    K.code(u, 64, 418, { size: 20, lh: 1.7, n: K.typed(t, u, [21, 22.6], 30), t: t, a: K.p(t, 20.7) });
    K.chip('no return → undefined', 1115, 400, { size: 17, stroke: P.warm, a: K.p(t, 23.4) });
  } },

/* 4 ─ parameters */
{ d: 25, title: 'Parameters: defaults and rest',
  caps: [
    [0.3, 'Parameters are local names for the values a call passes in. A missing argument is undefined; extras are ignored.'],
    [8, 'A default parameter fills in only when the argument is undefined, and it is evaluated fresh on every call.'],
    [15, 'A rest parameter gathers the remaining arguments into a real array. Prefer it to the old arguments object.']],
  draw: function (K, t) {
    var P = K.P, q0 = K.p(t, 0.5);
    K.box(40, 85, 580, 215, { fill: P.code, stroke: P.line, a: q0 });
    K.text('function f(a, b) { … }', 64, 115, { size: 20, mono: true, color: P.acc, a: q0 });
    K.text('f(1)', 64, 175, { size: 21, mono: true, a: K.p(t, 1.4) });
    K.chip('a = 1', 300, 175, { mono: true, size: 18, stroke: P.green, a: K.p(t, 2.2) });
    K.chip('b = undefined', 455, 175, { mono: true, size: 18, stroke: P.warm, a: K.p(t, 2.8) });
    K.text('f(1, 2, 3)', 64, 245, { size: 21, mono: true, a: K.p(t, 4.4) });
    K.chip('a = 1', 300, 245, { mono: true, size: 18, stroke: P.green, a: K.p(t, 5 ) });
    K.chip('b = 2', 400, 245, { mono: true, size: 18, stroke: P.green, a: K.p(t, 5.4) });
    K.chip('3 ignored', 530, 245, { size: 18, stroke: P.red, color: P.muted, a: K.p(t, 6) });
    var code = ['function greet(name = "friend", ...rest) {', '  return "Hi " + name + " +" + rest.length;', '}'];
    K.panel(660, 85, 580, 215, 'greet.js', { a: K.p(t, 8.2) });
    K.code(code, 680, 140, { size: 18, lh: 1.7, n: K.typed(t, code, [8.5, 9.8, 11], 34), t: t, a: K.p(t, 8.2), hi: t > 15.6 ? 0 : -1, w: 555 });
    K.panel(40, 325, 580, 255, 'Console', { a: K.p(t, 11.5) });
    var C = [['> greet()', '"Hi friend +0"', 11.8, 13], ['> greet(undefined)', '"Hi friend +0"', 13.4, 14.3], ['> greet("Ana", 1, 2, 3)', '"Hi Ana +3"', 16, 18.2]];
    C.forEach(function (c, i) {
      var y = 370 + i * 70;
      K.code([c[0]], 64, y, { size: 19, n: K.typed(t, [c[0]], [c[2]], 26), t: t, a: K.p(t, c[2] - 0.2, 0.2) });
      K.text(c[1], 88, y + 40, { size: 19, mono: true, color: P.green, a: K.p(t, c[3], 0.3) });
    });
    var m = K.p(t, 16.4);
    K.box(660, 325, 580, 255, { fill: P.code, stroke: P.line, a: m });
    ['"Ana"', '1', '2', '3'].forEach(function (s, i) {
      var q = K.back((t - 16.6 - i * 0.3) / 0.5); if (q <= 0) return;
      K.chip(s, 720 + i * 90 + (i ? 30 : 0), 370, { s: q, mono: true, size: 20, color: P.warm });
    });
    K.arrow(720, 396, 760, 465, { p: K.p(t, 18.4, 0.4), color: P.acc });
    K.chip('name', 770, 490, { mono: true, size: 19, stroke: P.acc, a: K.p(t, 18.6) });
    K.arrow(930, 396, 980, 465, { p: K.p(t, 18.8, 0.4), color: P.purple });
    K.chip('rest = [1, 2, 3]', 1050, 490, { mono: true, size: 19, stroke: P.purple, a: K.p(t, 19) });
    K.text('Array.isArray(rest) → true', 1050, 548, { size: 17, mono: true, color: P.muted, align: 'center', a: K.p(t, 20.4) });
  } },

/* 5 ─ first-class functions */
{ d: 25, title: 'Functions are values',
  caps: [
    [0.3, 'Functions are values. You can store one in a variable, pass it to another function, or return it.'],
    [7.5, 'A function that takes or returns a function is higher-order. map, setTimeout and addEventListener take callbacks.'],
    [15, 'twice takes a function and returns a new one that applies it two times. With triple: 2 becomes 6, then 18.']],
  draw: function (K, t) {
    var P = K.P;
    var C = [['store', ['const triple = n => n * 3;'], 0.6], ['pass', ['[1, 2].map(triple)', '// [3, 6]'], 2.4], ['return', ['function make() {', '  return triple;', '}'], 4.2]];
    C.forEach(function (c, i) {
      var x = 40 + i * 405, q = K.p(t, c[2], 0.5);
      K.box(x, 85, 385, 175, { fill: P.code, stroke: i === 1 ? P.warm : P.acc, a: q });
      K.text(c[0], x + 22, 113, { size: 19, weight: 700, color: i === 1 ? P.warm : P.acc, a: q });
      K.code(c[1], x + 22, 145, { size: 19, lh: 1.5, n: K.typed(t, c[1], c[1].map(function (_, k) { return c[2] + 0.3 + k * 0.6; }), 30), t: t, a: q });
    });
    ['arr.map(fn)', 'setTimeout(fn, 1000)', 'btn.addEventListener("click", fn)'].forEach(function (s, i) {
      K.chip(s, [160, 420, 830][i], 300, { mono: true, size: 18, stroke: P.purple, a: K.p(t, 8 + i * 1.2, 0.4) });
    });
    K.text('fn = a callback: they call it for you, later', 1240, 345, { size: 17, color: P.muted, align: 'right', a: K.p(t, 11.6) });
    var code = ['const twice = f => x => f(f(x));', 'twice(triple)(2)   // 18'];
    K.panel(40, 385, 560, 195, 'twice.js', { a: K.p(t, 15.2) });
    K.code(code, 64, 440, { size: 21, lh: 1.7, n: K.typed(t, code, [15.5, 17.4], 30), t: t, a: K.p(t, 15.2) });
    var steps = [['2', 660, 19, P.warm], ['triple', 790, 19.6, P.acc], ['6', 920, 20.2, P.warm], ['triple', 1050, 20.8, P.acc], ['18', 1180, 21.4, P.green]];
    steps.forEach(function (s, i) {
      var q = K.back((t - s[2]) / 0.5); if (q <= 0) return;
      K.chip(s[0], s[1], 482, { s: q, mono: true, size: i % 2 ? 19 : 24, stroke: s[3], color: i % 2 ? P.ink : s[3] });
      if (i) K.arrow(s[1] - 105 + (i % 2 ? 10 : 30), 482, s[1] - (i % 2 ? 50 : 32), 482, { p: K.p(t, s[2] - 0.3, 0.3), color: P.muted, lw: 2.5 });
    });
    K.text('f(f(x))', 920, 540, { size: 18, mono: true, color: P.muted, align: 'center', a: K.p(t, 22) });
  } },

/* 6 ─ the scope chain */
{ d: 26, title: 'Scope and the scope chain',
  caps: [
    [0.3, 'Scope is the region where a name is visible: global, module, function and block scope.'],
    [6.5, 'Each scope stores its names in an environment record, with a link to the scope that surrounds it.'],
    [12.5, 'To resolve a name, the engine checks the current scope, then follows the links outward. inner finds x in outer.'],
    [19.5, 'A name found nowhere is a ReferenceError. Inner scopes see outward; outer scopes never see inward.']],
  draw: function (K, t) {
    var P = K.P;
    ['global', 'module', 'function', 'block { }'].forEach(function (s, i) {
      K.chip(s, 880 + (i % 2) * 200, 120 + Math.floor(i / 2) * 54, { size: 19, mono: i === 3, stroke: [P.ink, P.blue, P.acc, P.warm][i], a: K.p(t, 1 + i * 0.6, 0.4) });
    });
    var B = [[40, 85, 690, 500, 'Global', 'x = "global"', P.ink, 6.8], [80, 175, 610, 390, 'outer()', 'x = "outer"   y = 1', P.acc, 7.6], [120, 280, 530, 265, 'inner()', 'z = 2', P.warm, 8.4]];
    B.forEach(function (b) {
      var q = K.p(t, b[7], 0.5);
      K.box(b[0], b[1], b[2], b[3], { fill: 'rgba(255,255,255,.02)', stroke: b[6], a: q });
      K.text(b[4], b[0] + 20, b[1] + 28, { size: 20, weight: 700, color: b[6], mono: true, a: q });
      K.text(b[5], b[0] + 20, b[1] + 62, { size: 20, mono: true, a: q });
    });
    K.code(['console.log(x);'], 150, 395, { size: 21, n: K.typed(t, ['console.log(x);'], [12.6], 24), t: t, a: K.p(t, 12.4, 0.2) });
    K.text('outer link ↑', 520, 312, { size: 16, color: P.muted, a: K.p(t, 10) });
    K.text('outer link ↑', 560, 207, { size: 16, color: P.muted, a: K.p(t, 10.4) });
    /* lookup dot: inner record → outer record */
    var m = K.p(t, 13.6, 1.2);
    if (t > 13.4 && t < 19.4) {
      var x = 200 + (152 - 200) * m, y = 407 + (237 - 407) * m;
      K.g.save(); K.g.globalAlpha *= K.win(t, 13.4, 19.2); K.g.fillStyle = P.warm; K.g.beginPath(); K.g.arc(x - 60, y, 9, 0, 7); K.g.fill(); K.g.restore();
    }
    var L = [['inner: x?', false, 13.4], ['outer: x?  "outer"', true, 15]];
    K.text('find x', 790, 260, { size: 19, weight: 700, color: P.warm, a: K.p(t, 13) });
    L.forEach(function (l, i) { var q = K.p(t, l[2], 0.4); K.mark(805, 300 + i * 44, l[1], 0.8, q); K.text(l[0], 830, 300 + i * 44, { size: 19, mono: true, a: q }); });
    var e = K.p(t, 19.8);
    K.text('find w', 790, 410, { size: 19, weight: 700, color: P.red, a: e });
    ['inner', 'outer', 'global'].forEach(function (s, i) { var q = K.p(t, 20.2 + i * 0.5, 0.3); K.mark(805 + i * 135, 450, false, 0.8, q); K.text(s, 830 + i * 135, 450, { size: 18, mono: true, a: q }); });
    K.text('ReferenceError: w is not defined', 790, 500, { size: 18, mono: true, color: P.red, a: K.p(t, 21.8) });
    K.text('outer cannot read z', 790, 545, { size: 18, color: P.muted, a: K.p(t, 23) });
  } },

/* 7 ─ lexical scope */
{ d: 25, title: 'Lexical scope',
  caps: [
    [0.3, 'JavaScript scope is lexical: where a function is written decides what it can see, not where it is called.'],
    [7, "inner was written inside outer, so it reads outer's x, even though caller, with its own x, is the one that runs it."],
    [14, 'That outer link is fixed when the function is created. It is the foundation of closures.'],
    [19, 'In DevTools, pause in the debugger and the Scope panel shows this chain: Local, Closure, Script, Global.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const x = "global";', 'function outer() {', '  const x = "outer";', '  function inner() { return x; }', '  return inner;', '}', 'function caller() {', '  const x = "caller";', '  return outer()();', '}', 'caller();   // "outer"'];
    var hi = t > 12 ? 10 : t > 9.8 ? 2 : t > 7.4 ? 3 : -1;
    K.panel(40, 85, 640, 400, 'lexical.js');
    K.code(code, 64, 130, { size: 19, lh: 1.42, n: K.typed(t, code, [0.6, 0.8, 1, 1.2, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.5], 60), t: t, hi: hi, w: 610 });
    var q1 = K.p(t, 7.4), q2 = K.p(t, 8.4);
    K.box(760, 95, 460, 110, { stroke: P.acc, a: q1 });
    K.text('outer()  — where inner is written', 782, 125, { size: 18, color: P.acc, weight: 700, a: q1 });
    K.text('x = "outer"', 782, 168, { size: 22, mono: true, a: q1 });
    K.box(760, 375, 460, 110, { stroke: P.line, a: q2 });
    K.text('caller()  — where inner is called', 782, 405, { size: 18, color: P.muted, weight: 700, a: q2 });
    K.text('x = "caller"', 782, 448, { size: 22, mono: true, color: P.muted, a: q2 });
    var ic = K.back((t - 8) / 0.5);
    if (ic > 0) K.chip('inner', 860, 290, { s: ic, mono: true, size: 22, stroke: P.warm });
    K.arrow(880, 262, 920, 212, { p: K.p(t, 9.6, 0.4), color: P.green, lw: 3 }); K.mark(960, 240, true, 0.85, K.p(t, 10.2));
    K.arrow(880, 318, 920, 368, { p: K.p(t, 11, 0.4), color: P.red, dash: [6, 6] }); K.mark(960, 340, false, 0.85, K.p(t, 11.4));
    K.lock(1060, 292, 0.9, P.warm, K.p(t, 14.4));
    K.text('link fixed at creation', 1082, 290, { size: 17, color: P.warm, a: K.p(t, 14.4) });
    var d = K.p(t, 19.2);
    K.panel(40, 505, 1200, 75, '', { a: d });
    K.text('DevTools · Scope', 64, 542, { size: 17, color: P.muted, weight: 700, a: d });
    ['Local', 'Closure (outer)', 'Script', 'Global'].forEach(function (s, i) {
      var x = 340 + i * 230; K.chip(s, x, 542, { size: 18, stroke: i === 1 ? P.acc : P.line, a: K.p(t, 19.6 + i * 0.5, 0.4) });
      if (i) K.arrow(x - 145 + (i === 2 ? 25 : 0), 542, x - 85 + (i === 2 ? 15 : 0), 542, { p: K.p(t, 19.6 + i * 0.5, 0.4), color: P.muted, lw: 2 });
    });
  } },

/* 8 ─ hoisting in depth */
{ d: 28, title: 'Hoisting in depth',
  caps: [
    [0.3, 'Hoisting, in depth: before a scope runs, the creation phase registers every declaration in it.'],
    [6, 'A function declaration is hoisted whole, body and all, so you can call it before its line.'],
    [11.5, 'A function expression is just a variable. With var it is undefined until assigned; with let or const it is in the TDZ.'],
    [19, 'The dead zone is about time, not position. A function can mention a later let, as long as it runs after that line.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['typeof hoisted;      // "function"', 'typeof notHoisted;   // "undefined"', 'function hoisted() { return 1; }', 'var notHoisted = function () {};'];
    var hi = t > 12 ? (t > 13.6 ? 1 : 3) : t > 6.4 ? (t > 8.4 ? 0 : 2) : -1;
    K.panel(40, 85, 620, 215, 'hoist.js');
    K.code(code, 64, 138, { size: 19, lh: 1.6, n: K.typed(t, code, [0.6, 1.4, 2.2, 3], 40), t: t, hi: hi, w: 590 });
    var T = [['function declaration', 'the whole function', P.green, 6.4], ['var', 'undefined', P.muted, 11.8], ['let / const / class', 'uninitialised: TDZ', P.warm, 13], ['function expression / arrow', 'follows its var / let / const', P.blue, 14.6]];
    K.box(40, 320, 1200, 262, { fill: P.code, stroke: P.line, a: K.p(t, 6) });
    K.text('declaration', 66, 348, { size: 16, color: P.muted, weight: 700, a: K.p(t, 6) });
    K.text('value before its line', 560, 348, { size: 16, color: P.muted, weight: 700, a: K.p(t, 6) });
    T.forEach(function (r, i) {
      var y = 395 + i * 50, q = K.p(t, r[3], 0.4);
      K.text(r[0], 66, y, { size: 21, mono: true, a: q });
      K.arrow(440, y, 530, y, { p: K.p(t, r[3] + 0.2, 0.4), color: P.muted, lw: 2.5 });
      K.text(r[1], 560, y, { size: 21, color: r[2], a: K.p(t, r[3] + 0.5, 0.4) });
    });
    var d = ['function show() { return value; }', 'show();       // ReferenceError', 'let value = 42;', 'show();       // 42'];
    var q = K.p(t, 19.2);
    K.panel(690, 85, 550, 215, '', { a: q });
    K.code(d, 712, 100, { size: 17, lh: 1.5, n: K.typed(t, d, [19.4, 20.6, 21.6, 22.4], 34), t: t, a: q });
    var bar = K.p(t, 23.2, 0.8);
    K.box(712, 236, 250 * bar, 22, { fill: 'rgba(246,173,85,.35)', stroke: P.warm, r: 6, a: q });
    K.text('TDZ', 730, 247, { size: 15, weight: 700, color: P.warm, a: K.p(t, 23.6) });
    K.box(966, 236, 250 * K.p(t, 24, 0.6), 22, { fill: 'rgba(104,211,145,.3)', stroke: P.green, r: 6, a: q });
    K.text('initialised', 984, 247, { size: 15, weight: 700, color: P.green, a: K.p(t, 24.4) });
    K.text('time →', 1218, 280, { size: 15, color: P.muted, align: 'right', a: K.p(t, 24.4) });
  } },

/* 9 ─ the TDZ trap */
{ d: 23, title: 'The TDZ trap',
  caps: [
    [0.3, 'A classic trap. The inner let v shadows the outer v for the whole function body, not just from its own line.'],
    [8, 'So the first line reads the inner v while it is still in the dead zone, and throws. It never falls back to "outer".'],
    [15, 'Even typeof throws in the dead zone, although typeof on a name that was never declared quietly gives "undefined".']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['let v = "outer";', 'function t() {', '  console.log(v);', '  let v = "inner";', '}', 't();'];
    var hi = t > 8.4 ? 2 : t > 3 ? 3 : -1;
    K.panel(40, 85, 560, 300, 'trap.js');
    K.code(code, 64, 135, { size: 22, lh: 1.55, n: K.typed(t, code, [0.6, 1, 1.4, 1.9, 2.3, 2.5], 40), t: t, hi: hi, w: 530, marks: t > 9.4 ? { 2: 'rgba(252,129,129,.2)' } : null });
    var a = K.p(t, 1.2), b = K.p(t, 2.6);
    K.box(660, 85, 580, 300, { fill: 'rgba(255,255,255,.02)', stroke: P.ink, a: a });
    K.text('script scope', 682, 113, { size: 18, weight: 700, a: a });
    K.text('v = "outer"', 682, 150, { size: 21, mono: true, color: t > 10 ? P.muted : P.ink, a: a });
    K.box(700, 185, 500, 180, { fill: 'rgba(246,173,85,.06)', stroke: P.warm, a: b });
    K.text('t() scope', 722, 213, { size: 18, weight: 700, color: P.warm, a: b });
    var sv = K.back((t - 3.4) / 0.5);
    if (sv > 0) K.chip('v', 760, 265, { s: sv, mono: true, size: 24, stroke: t > 9.4 ? P.red : P.warm });
    K.lock(812, 268, 0.9, P.warm, K.p(t, 4));
    K.text('uninitialised (TDZ)', 834, 265, { size: 19, color: P.warm, a: K.p(t, 4) });
    K.text('shadows the outer v from the first line', 722, 325, { size: 17, color: P.muted, a: K.p(t, 5.2) });
    K.arrow(1000, 250, 1000, 168, { p: K.p(t, 11.4, 0.5), color: P.red, dash: [6, 6] });
    K.mark(1000, 205, false, 0.8, K.p(t, 12));
    K.text('no fallback', 1030, 205, { size: 17, color: P.red, a: K.p(t, 12) });
    var e = K.p(t, 9.6);
    K.box(40, 400, 560, 60, { fill: 'rgba(252,129,129,.12)', stroke: P.red, a: e });
    K.text("ReferenceError: Cannot access 'v' before initialization", 58, 430, { size: 16, mono: true, color: P.red, a: e });
    var c2 = ['typeof neverDeclared   // "undefined"', 'typeof v  (in its TDZ)  // ReferenceError'];
    K.panel(40, 480, 1200, 100, '', { a: K.p(t, 15.2) });
    K.code(c2, 110, 497, { size: 20, lh: 1.6, n: K.typed(t, c2, [15.5, 18.4], 30), t: t, a: K.p(t, 15.2) });
    K.mark(78, 509, true, 0.75, K.p(t, 17)); K.mark(78, 541, false, 0.75, K.p(t, 20));
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 3 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 105, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Declarations, expressions and arrows; arrows have no own this',
     'Each call pushes a frame; return pops it with a value',
     'Defaults fill in for undefined; rest gathers a real array',
     'Functions are values: store them, pass them, return them',
     'Lexical scope: names resolve outward from where code is written',
     'Hoisting: functions whole, var as undefined, let and const in the TDZ'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 3 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
