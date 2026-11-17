/* Day 32 in motion: building call, bind, curry, memoize, debounce, throttle, reduce and deepEqual from scratch. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day32', (function () {
  /* code lines revealed one by one in any order: at[i] = start time of line i (null = hidden); caret only while typing */
  function tl(K, t, lines, x, y, o) {
    var s = o.size || 20, lh = Math.round(s * (o.lh || 1.5)), cps = o.cps || 30;
    lines.forEach(function (l, i) {
      var st = o.at[i]; if (st == null || t < st) return;
      var done = t > st + l.length / cps + 0.4;
      K.code([l], x, y + i * lh, { size: s, n: done ? null : K.typed(t, [l], [st], cps), t: t, hi: o.hi === i ? 0 : -1, w: o.w, a: o.a });
    });
  }
  return {
  kicker: 'JavaScript: Zero to Architect · Day 32',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 32: rebuild the classic utilities from scratch, with the edge cases interviewers probe.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Polyfills', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 32 · Polyfills and utilities', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['call · bind · curry', 'memoize · debounce', 'reduce · deepEqual'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ call */
{ d: 25, title: 'Building call',
  caps: [
    [0.3, 'A polyfill is a tool you rebuild to prove you know how it works. Start with call: run a function with a chosen this.'],
    [6.5, 'this is whatever sits left of the dot. So attach fn to ctx under a fresh Symbol key, which can never overwrite a real property.'],
    [13, 'Call it as ctx[key](), so this is ctx. Then delete the key in a finally block, even if fn throws.'],
    [19, 'null or undefined falls back to globalThis, and primitives are boxed with Object. apply just spreads an array into call.']],
  draw: function (K, t) {
    var P = K.P, code = ['function myCall(fn, ctx, ...args) {', '  ctx = ctx == null ? globalThis : Object(ctx);', '  const key = Symbol();', '  ctx[key] = fn;',
      '  try { return ctx[key](...args); }', '  finally { delete ctx[key]; }', '}'];
    var hi = t > 19.2 ? 1 : t > 14.6 && t < 18.8 ? 5 : t > 13.2 ? 4 : t > 7 && t < 12.8 ? 3 : -1;
    K.panel(40, 76, 600, 280, 'myCall.js');
    tl(K, t, code, 62, 122, { size: 20, lh: 1.55, at: [0.6, 19.3, 7, 8.4, 13.3, 15, 1.8], hi: hi, w: 572 });
    var use = ['function greet(g, p) {', '  return g + " " + this.name + p; }', 'myCall(greet, { name: "Ana" }, "Hi", "!");'];
    K.panel(40, 380, 600, 206, 'usage', { a: K.p(t, 2.2) });
    K.code(use, 62, 420, { size: 19, lh: 1.5, a: K.p(t, 2.4) });
    K.text('→  "Hi Ana!"', 62, 548, { size: 22, mono: true, weight: 700, color: P.green, a: K.p(t, 14.6) });
    /* the ctx object gains, then loses, a Symbol slot */
    var o = K.p(t, 2.8);
    K.box(690, 76, 550, 280, { stroke: P.acc, a: o });
    K.text('ctx  (the object)', 714, 104, { size: 19, weight: 700, color: P.acc, a: o });
    K.text('name: "Ana"', 740, 160, { size: 24, mono: true, a: o });
    var add = K.p(t, 8.6, 0.5), del = K.p(t, 15.4, 0.6);
    K.box(722, 196, 480, 50, { fill: 'rgba(246,173,85,.12)', stroke: P.warm, a: add * (1 - del) });
    K.text('[Symbol()]: greet', 740, 222, { size: 24, mono: true, color: P.warm, a: add * (1 - del) });
    K.text('temporary, unique key', 1186, 222, { size: 16, color: P.warm, align: 'right', a: K.win(t, 9.4, 13) });
    K.text('deleted in finally', 740, 222, { size: 20, color: P.muted, a: K.win(t, 16, 18.8) });
    K.arrow(640, 228, 716, 222, { p: K.p(t, 13.6, 0.4), color: P.green });
    K.text('this = ctx', 740, 300, { size: 22, weight: 700, color: P.green, a: K.win(t, 13.8, 19.4) });
    var e = K.p(t, 19.6);
    K.box(690, 380, 550, 206, { fill: P.code, stroke: P.line, a: e });
    [['null / undefined', 'globalThis'], ['"hi"', 'Object("hi")  boxed'], ['apply(fn, ctx, [a, b])', 'call(fn, ctx, a, b)']].forEach(function (r, i) {
      var y = 426 + i * 56, q = K.p(t, 19.8 + i * 1.4, 0.4);
      K.text(r[0], 714, y, { size: 19, mono: true, a: q });
      K.text('→', 960, y, { size: 19, color: P.muted, a: q });
      K.text(r[1], 990, y, { size: 19, mono: true, color: P.acc, a: q });
    });
  } },

/* 3 ─ bind */
{ d: 26, title: 'Building bind',
  caps: [
    [0.3, 'bind returns a new function that remembers fn, the context and any preset arguments, all in a closure.'],
    [7, 'A normal call applies fn with the stored context, passing the preset arguments followed by the new ones.'],
    [13.5, 'With new, this is the freshly created object, so the stored context must be ignored. That is the instanceof check.'],
    [20, "Finally, link bound dot prototype to fn's prototype, so instances still pass instanceof. Interviewers probe exactly this."]],
  draw: function (K, t) {
    var P = K.P, code = ['function myBind(fn, ctx, ...preset) {', '  function bound(...args) {', '    return fn.apply(this instanceof bound ? this : ctx,', '      [...preset, ...args]);',
      '  }', '  if (fn.prototype) bound.prototype = Object.create(fn.prototype);', '  return bound;', '}'];
    var hi = t > 20.2 ? 5 : t > 13.8 ? 2 : t > 7.2 ? 3 : -1;
    K.panel(40, 76, 720, 290, 'myBind.js');
    tl(K, t, code, 62, 120, { size: 18, lh: 1.5, at: [0.6, 1.6, 7.3, 8.6, 2.4, 20.3, 2.8, 3.2], hi: hi, w: 690 });
    var c = K.p(t, 3.4);
    K.box(790, 76, 450, 290, { stroke: P.purple, a: c });
    K.text('closure: bound remembers', 814, 104, { size: 19, weight: 700, color: P.purple, a: c });
    ['fn: greet', 'ctx: { name: "Bo" }', 'preset: ["Hey"]'].forEach(function (s, i) {
      var q = K.back((t - 3.8 - i * 0.8) / 0.5); if (q > 0) K.chip(s, 1015, 170 + i * 64, { s: q, mono: true, size: 19, stroke: P.purple });
    });
    var n1 = K.p(t, 7.4);
    K.panel(40, 390, 590, 196, 'normal call', { a: n1 });
    K.code(['const hi = myBind(greet, ctx, "Hey");', 'hi(".")'], 62, 430, { size: 19, lh: 1.5, a: n1 });
    K.code(['→ greet.apply(ctx, ["Hey", "."])'], 62, 490, { size: 19, a: K.p(t, 9) });
    K.text('→ "Hey Bo."', 62, 556, { size: 22, mono: true, weight: 700, color: P.green, a: K.p(t, 10.6) });
    var n2 = K.p(t, 13.8);
    K.panel(650, 390, 590, 196, 'with new', { a: n2, stroke: P.warm });
    K.code(['function P(x) { this.x = x; }', 'const BP = myBind(P, { ignored: 1 }, 5);'], 672, 430, { size: 19, lh: 1.5, a: n2 });
    K.text('new BP()  →  { x: 5 }   ctx ignored', 672, 504, { size: 19, mono: true, color: P.warm, a: K.p(t, 15.6) });
    K.mark(686, 552, true, 0.8, K.p(t, 21.6));
    K.text('new BP() instanceof P  →  true', 712, 552, { size: 19, mono: true, color: P.green, a: K.p(t, 21.6) });
  } },

/* 4 ─ curry and pipe */
{ d: 25, title: 'curry, pipe and compose',
  caps: [
    [0.3, 'curry collects arguments until it has as many as the function expects: fn dot length, or an explicit arity.'],
    [7, 'add3 of 1 returns a function. Of 2, another one. With the third argument the count reaches 3, and fn finally runs: 6.'],
    [14, 'fn dot length ignores default and rest parameters, so accept an explicit arity for those.'],
    [19, 'pipe runs functions left to right with reduce, compose runs them right to left. Same functions, 8 versus 7.']],
  draw: function (K, t) {
    var P = K.P, code = ['const curry = (fn, arity = fn.length) =>', '  function c(...a) {', '    return a.length >= arity', '      ? fn.apply(this, a)', '      : (...b) => c.apply(this, [...a, ...b]);', '  };'];
    var hi = t > 11.6 && t < 13.8 ? 3 : t > 7.2 && t < 11.6 ? 4 : t > 1.8 && t < 6.8 ? 2 : -1;
    K.panel(40, 76, 600, 236, 'curry.js');
    K.code(code, 62, 122, { size: 20, lh: 1.5, n: K.typed(t, code, [0.5, 1.4, 2, 2.8, 3.5, 4.8], 36), t: t, hi: hi, w: 572 });
    var b = K.p(t, 6.8);
    K.box(680, 76, 560, 236, { stroke: P.acc, a: b });
    K.text('add3 = curry((a, b, c) => a + b + c)', 704, 106, { size: 18, mono: true, a: b });
    var calls = [['add3(1)', 7.4], ['(2)', 9.2], ['(3)', 11]];
    for (var i = 0; i < 3; i++) {
      var x = 760 + i * 150, f = K.p(t, calls[i][1] + 0.4, 0.4);
      K.box(x - 50, 160, 100, 64, { fill: P.code, stroke: f > 0.5 ? P.acc : P.line, dash: f > 0.5 ? null : [6, 5], a: b });
      K.text(['a', 'b', 'c'][i], x, 146, { size: 16, color: P.muted, align: 'center', a: b });
      K.text(String(i + 1), x, 192, { size: 30, mono: true, weight: 700, color: P.acc, align: 'center', a: f });
      K.text(calls[i][0], x, 250, { size: 18, mono: true, align: 'center', a: K.p(t, calls[i][1], 0.4) });
      if (i < 2) K.text('→ fn', x, 280, { size: 16, color: P.muted, align: 'center', a: K.p(t, calls[i][1] + 0.6) });
    }
    var r = K.back((t - 12) / 0.6);
    if (r > 0) K.chip('6', 1180, 192, { s: r, size: 30, mono: true, color: P.green, stroke: P.green });
    K.text('runs!', 1180, 250, { size: 17, color: P.green, align: 'center', a: K.p(t, 12.2) });
    var g1 = K.p(t, 14.2);
    K.panel(40, 336, 600, 250, 'the fn.length gotcha', { a: g1, stroke: P.warm });
    K.code(['((a, b = 2) => a + b).length  // 1', '((...xs) => 0).length         // 0', 'curry(fn, 3)   // explicit arity'], 62, 380, { size: 19, lh: 1.7, n: K.typed(t, ['((a, b = 2) => a + b).length  // 1', '((...xs) => 0).length         // 0', 'curry(fn, 3)   // explicit arity'], [14.4, 15.8, 17], 34), t: t, a: g1 });
    var g2 = K.p(t, 19.2);
    K.box(680, 336, 560, 250, { fill: P.code, stroke: P.line, a: g2 });
    function flow(lbl, items, y, st) {
      K.text(lbl, 704, y - 44, { size: 18, mono: true, a: K.p(t, st) });
      items.forEach(function (s, k) {
        var q = K.back((t - st - 0.3 - k * 0.45) / 0.4), xx = 730 + k * 115, fn = k % 2 === 1;
        if (q > 0) K.chip(s, xx, y, { s: q, mono: true, size: 19, stroke: fn ? P.purple : P.acc, color: k === 4 ? P.green : P.ink });
        if (k) K.arrow(xx - 82, y, xx - 34, y, { p: K.p(t, st + 0.2 + k * 0.45, 0.3), head: 9, lw: 2 });
      });
    }
    flow('pipe(inc, dbl)(3)', ['3', 'inc', '4', 'dbl', '8'], 430, 19.4);
    flow('compose(inc, dbl)(3)', ['3', 'dbl', '6', 'inc', '7'], 540, 21.6);
  } },

/* 5 ─ memoize */
{ d: 26, title: 'memoize and once',
  caps: [
    [0.3, 'memoize is a notebook of answers. Build a key from the arguments, and keep the results in a Map.'],
    [7, 'sq of 4 is a miss: compute 16 and store it. sq of 4 again is a hit, so fn never runs. sq of 5 is a new miss.'],
    [14, 'Three calls, two computations. JSON keys fail for functions, cycles and key order, so accept a resolver.'],
    [19.5, 'Only memoize pure functions, and cap the cache so it cannot grow forever. once is the tiny cousin: run once, keep the result.']],
  draw: function (K, t) {
    var P = K.P, code = ['function memoize(fn, resolver) {', '  const cache = new Map();', '  return function (...a) {', '    const k = resolver ? resolver(...a) : JSON.stringify(a);',
      '    if (cache.has(k)) return cache.get(k);', '    const v = fn.apply(this, a);', '    cache.set(k, v);', '    return v;', '  };', '}'];
    var hi = t > 14.2 && t < 19 ? 3 : (t > 7.4 && t < 9.6) || (t > 11.6 && t < 13.8) ? 5 : t > 9.8 && t < 11.4 ? 4 : -1;
    K.panel(40, 76, 640, 330, 'memoize.js');
    K.code(code, 62, 120, { size: 18, lh: 1.5, n: K.typed(t, code, [0.5, 1.3, 2, 2.6, 3.8, 4.6, 5.2, 5.6, 5.9, 6.1], 44), t: t, hi: hi, w: 612 });
    var q0 = K.p(t, 7.2);
    K.panel(720, 76, 520, 190, 'calls', { a: q0 });
    [['sq(4)', 'miss → compute 16', 7.4, P.warm], ['sq(4)', 'hit → 16 from cache', 9.8, P.green], ['sq(5)', 'miss → compute 25', 11.6, P.warm]].forEach(function (c, i) {
      var y = 130 + i * 44, q = K.p(t, c[2], 0.4);
      K.text(c[0], 746, y, { size: 21, mono: true, a: q });
      K.text(c[1], 850, y, { size: 19, color: c[3], a: K.p(t, c[2] + 0.5, 0.4) });
    });
    K.box(720, 286, 520, 120, { fill: P.code, stroke: P.blue, a: q0 });
    K.text('cache (Map)', 744, 312, { size: 17, weight: 700, color: P.blue, a: q0 });
    var e1 = K.back((t - 8.4) / 0.5), e2 = K.back((t - 12.6) / 0.5);
    if (e1 > 0) K.chip('"[4]" → 16', 850, 364, { s: e1, mono: true, size: 19, stroke: P.blue });
    if (e2 > 0) K.chip('"[5]" → 25', 1080, 364, { s: e2, mono: true, size: 19, stroke: P.blue });
    K.text('fn ran 2 times', 1216, 312, { size: 18, weight: 700, color: P.green, align: 'right', a: K.p(t, 14.2) });
    var j = K.p(t, 15);
    K.box(40, 430, 590, 156, { stroke: P.warm, a: j });
    K.text('JSON keys break on', 64, 460, { size: 19, weight: 700, color: P.warm, a: j });
    ['functions', 'cycles', 'key order'].forEach(function (s, i) {
      var q = K.back((t - 15.4 - i * 0.6) / 0.5); if (q > 0) K.chip(s, 130 + i * 170, 510, { s: q, size: 18, stroke: P.red });
    });
    K.text('→ accept a resolver(...args)', 64, 560, { size: 18, color: P.acc, a: K.p(t, 17.6) });
    var s2 = K.p(t, 19.7);
    K.box(650, 430, 590, 156, { stroke: P.green, a: s2 });
    K.text('Safe memoizing', 674, 460, { size: 19, weight: 700, color: P.green, a: s2 });
    ['pure fns only', 'cap the size'].forEach(function (s, i) {
      var q = K.back((t - 20.2 - i * 0.8) / 0.5); if (q > 0) K.chip(s, 760 + i * 200, 510, { s: q, size: 18, stroke: P.green });
    });
    K.code(['once(fn): first call runs, later calls reuse it'], 674, 548, { size: 17, a: K.p(t, 23) });
  } },

/* 6 ─ debounce */
{ d: 25, title: 'debounce',
  caps: [
    [0.3, 'debounce is a doorman who waits until people stop arriving. Every call restarts a timer.'],
    [7, 'Type h, e, l, l, o quickly. Each key clears the pending timer and starts a new one.'],
    [13, 'Only when typing pauses for the full delay does fn run: once, with the last arguments.'],
    [18.5, 'Return a regular function so this and args pass through. Interview extras: leading, trailing, cancel and flush.']],
  draw: function (K, t) {
    var P = K.P, code = ['function debounce(fn, ms) {', '  let timer;', '  return function (...args) {', '    clearTimeout(timer);', '    timer = setTimeout(() => fn.apply(this, args), ms);', '  };', '}'];
    var keys = [7.4, 8.2, 9, 9.8, 10.6], word = 'hello', D = 2.8, fire = 10.6 + D;
    var typing = keys.some(function (k) { return t > k && t < k + 0.6; });
    var hi = t > 18.7 ? 2 : t > fire - 0.2 && t < fire + 2 ? 4 : typing ? 3 : -1;
    K.panel(40, 76, 640, 236, 'debounce.js');
    K.code(code, 62, 120, { size: 19, lh: 1.5, n: K.typed(t, code, [0.5, 1.3, 1.8, 2.6, 3.3, 5, 5.3], 34), t: t, hi: hi, w: 612 });
    var b = K.p(t, 6.8), nk = keys.filter(function (k) { return t >= k; }).length;
    K.box(720, 76, 520, 236, { stroke: P.line, a: b });
    K.text('search box', 744, 104, { size: 17, weight: 700, color: P.muted, a: b });
    K.box(744, 124, 472, 54, { fill: P.code, stroke: P.blue, a: b });
    K.text(word.slice(0, nk), 764, 152, { size: 24, mono: true, a: b });
    K.text('fetch("/search?q=hello")', 744, 214, { size: 20, mono: true, color: P.green, a: K.p(t, fire + 0.2) });
    K.mark(1196, 214, true, 0.8, K.p(t, fire + 0.4));
    ['leading', 'trailing', 'cancel()', 'flush()'].forEach(function (s, i) {
      var q = K.back((t - 19.6 - i * 0.6) / 0.5); if (q > 0) K.chip(s, 800 + i * 120, 270, { s: q, size: 17, mono: true, stroke: P.acc });
    });
    /* timeline */
    var tl0 = K.p(t, 6.8), X = function (tt) { return 90 + (tt - 7) * 110; };
    K.box(40, 336, 1200, 250, { fill: P.code, stroke: P.line, a: tl0 });
    K.text('time →', 1220, 560, { size: 16, color: P.muted, align: 'right', a: tl0 });
    K.box(70, 540, 1080, 2, { fill: P.line, r: 1, a: tl0 });
    keys.forEach(function (k, i) {
      var q = K.back((t - k) / 0.4), x = X(k), y = 438 + i * 22;
      if (q > 0) K.chip(word[i], x, 372, { s: q, mono: true, size: 18, stroke: P.blue });
      if (t < k) return;
      var end = i < 4 ? Math.min(t, keys[i + 1]) : Math.min(t, k + D), cut = i < 4 && t >= keys[i + 1];
      K.box(x, y - 7, Math.max(2, X(end) - x), 14, { fill: cut ? 'rgba(252,129,129,.35)' : P.warm, r: 4 });
      if (cut) K.text('✗', X(keys[i + 1]) + 6, y, { size: 16, color: P.red });
    });
    K.text('each key restarts the timer', 520, 420, { size: 17, color: P.red, a: K.win(t, 9.2, 12.8) });
    K.text('quiet for the full delay', (X(10.6) + X(fire)) / 2, 562, { size: 16, color: P.warm, align: 'center', a: K.p(t, fire) });
    var f = K.back((t - fire) / 0.5);
    if (f > 0) K.chip('fn("hello") runs once', X(fire) + 140, 524, { s: f, size: 19, mono: true, stroke: P.green, color: P.green });
  } },

/* 7 ─ throttle */
{ d: 23, title: 'throttle',
  caps: [
    [0.3, 'throttle limits the rate instead: at most one call per interval, no matter how many events arrive.'],
    [6.5, 'The first scroll event runs right away. Events inside the window do not run. Only the latest one is remembered.'],
    [11, 'When the window ends, one trailing call runs with the last event, so the final scroll position is never lost.'],
    [17, 'Rule of thumb: debounce for search as you type, throttle for scroll and resize handlers.']],
  draw: function (K, t) {
    var P = K.P, code = ['function throttle(fn, ms) {', '  let last = 0, timer, lastArgs;', '  const run = () => {', '    last = Date.now(); timer = null; fn(...lastArgs);', '  };',
      '  return function (...args) {', '    lastArgs = args;', '    const wait = ms - (Date.now() - last);', '    if (wait <= 0) { clearTimeout(timer); run(); }', '    else if (!timer) timer = setTimeout(run, wait);', '  };', '}'];
    var E = [], T0 = 6.8, WIN = 4.4;
    for (var i = 0; i < 13; i++) E.push(T0 + i * 0.3);
    var hi = t > T0 && t < 7.6 ? 8 : t > 7.6 && t < 11 ? 9 : t > 11.2 && t < 13.5 ? 3 : -1;
    K.panel(40, 76, 620, 350, 'throttle.js');
    K.code(code, 62, 118, { size: 18, lh: 1.45, n: K.typed(t, code, [0.4, 0.9, 1.6, 2, 2.8, 3, 3.6, 3.9, 4.5, 5.1, 5.8, 6], 48), t: t, hi: hi, w: 592 });
    var ne = E.filter(function (e) { return t >= e; }).length, runs = (t >= T0 ? 1 : 0) + (t >= T0 + WIN ? 1 : 0);
    var c = K.p(t, 6.6);
    K.box(700, 76, 540, 160, { stroke: P.line, a: c });
    K.text('scroll events', 730, 124, { size: 19, color: P.muted, a: c });
    K.text(String(ne), 1210, 124, { size: 30, mono: true, weight: 700, color: P.blue, align: 'right', a: c });
    K.text('handler runs', 730, 188, { size: 19, color: P.muted, a: c });
    K.text(String(runs), 1210, 188, { size: 30, mono: true, weight: 700, color: P.green, align: 'right', a: c });
    var r = K.p(t, 17.2);
    K.box(700, 256, 540, 170, { fill: P.code, stroke: P.line, a: r });
    K.chip('debounce', 790, 306, { size: 19, stroke: P.warm, a: r }); K.text('search as you type', 880, 306, { size: 19, a: r });
    var r2 = K.p(t, 18.6);
    K.chip('throttle', 790, 372, { size: 19, stroke: P.acc, a: r2 }); K.text('scroll, resize, drag', 880, 372, { size: 19, a: r2 });
    /* timeline */
    var X = function (tt) { return 170 + (tt - T0) * 200; }, a0 = K.p(t, 6.6);
    K.box(40, 446, 1200, 140, { fill: P.code, stroke: P.line, a: a0 });
    K.text('events', 60, 478, { size: 17, color: P.muted, a: a0 });
    K.text('runs', 60, 552, { size: 17, color: P.muted, a: a0 });
    var wp = K.clamp((t - T0) / WIN);
    if (t >= T0) K.box(X(T0), 500, (X(T0 + WIN) - X(T0)) * wp, 18, { fill: 'rgba(79,209,197,.18)', stroke: P.acc, r: 4, lw: 1.5 });
    K.text('window: ms', X(T0) + 8, 509, { size: 16, color: P.acc, a: K.p(t, 7.2) });
    E.forEach(function (e, k) {
      if (t < e) return;
      var latest = k === ne - 1 && t < T0 + WIN + 0.2, first = k === 0;
      K.box(X(e) - 3, 464, 6, 28, { fill: first ? P.green : latest ? P.warm : P.line, r: 3 });
    });
    K.text('latest kept', X(E[Math.max(0, ne - 1)]) + 12, 478, { size: 16, color: P.warm, a: K.win(t, 8, T0 + WIN) });
    var r1 = K.back((t - T0) / 0.4), rt = K.back((t - T0 - WIN) / 0.4);
    if (r1 > 0) K.chip('run (first)', X(T0), 552, { s: r1, size: 17, stroke: P.green });
    if (rt > 0) K.chip('run (trailing, last event)', X(T0 + WIN) - 20, 552, { s: rt, size: 17, stroke: P.green, color: P.green });
  } },

/* 8 ─ reduce */
{ d: 25, title: 'Array polyfills: reduce',
  caps: [
    [0.3, 'Array polyfills must match the spec. Callbacks get value, index and array, and holes are skipped with i in arr.'],
    [7, 'reduce without an initial value starts from the first element that exists, then folds the rest into the accumulator.'],
    [13.5, 'On an empty array with no initial value it must throw a TypeError, just like the built-in one.'],
    [18.5, 'Classic trap: map passes the index too, so map of parseInt over three tens gives 10, NaN, 2. The index becomes the radix.']],
  draw: function (K, t) {
    var P = K.P, code = ['function myReduce(arr, fn, ...init) {', '  let i = 0, acc;', '  if (init.length) acc = init[0];', '  else {', '    while (i < arr.length && !(i in arr)) i++;',
      '    if (i >= arr.length) throw new TypeError();', '    acc = arr[i++];', '  }', '  for (; i < arr.length; i++)', '    if (i in arr) acc = fn(acc, arr[i], i, arr);', '  return acc;', '}'];
    var hi = t > 13.7 && t < 18.3 ? 5 : t > 9 && t < 13.2 ? 9 : t > 8.3 ? 6 : t > 7.2 ? 4 : t > 2.4 && t < 6.8 ? 9 : -1;
    K.panel(40, 76, 600, 360, 'myReduce.js');
    K.code(code, 62, 118, { size: 18, lh: 1.4, n: K.typed(t, code, [0.4, 0.8, 1.1, 1.5, 1.7, 2.1, 2.5, 2.7, 2.8, 3, 3.6, 3.8], 60), t: t, hi: hi, w: 572 });
    var a = K.p(t, 1);
    K.box(680, 76, 560, 220, { stroke: P.acc, a: a });
    K.text('myReduce([ , 1, 2, 3], (a, b) => a + b)', 704, 104, { size: 17, mono: true, a: a });
    var steps = [7.6, 8.6, 10, 11.4], cur = t < steps[0] ? -1 : t < steps[1] ? 0 : t < steps[2] ? 1 : t < steps[3] ? 2 : 3;
    [null, 1, 2, 3].forEach(function (v, i) {
      var x = 760 + i * 120;
      K.box(x - 45, 140, 90, 64, { fill: P.code, stroke: i === cur ? P.warm : P.line, dash: v == null ? [6, 5] : null, a: a });
      K.text(v == null ? 'hole' : String(v), x, 172, { size: v == null ? 17 : 26, mono: true, align: 'center', color: v == null ? P.muted : P.ink, a: a });
      K.text('i = ' + i, x, 222, { size: 16, color: P.muted, align: 'center', a: a });
    });
    K.text('0 in arr → false: skipped', 704, 266, { size: 18, color: P.warm, a: K.p(t, 3) * (1 - K.p(t, 7.9, 0.4)) });
    var acc = t < steps[1] ? null : t < steps[2] ? '1' : t < steps[3] ? '1 + 2 = 3' : '3 + 3 = 6';
    if (acc) K.text('acc = ' + acc, 704, 266, { size: 22, mono: true, weight: 700, color: t > steps[3] ? P.green : P.acc });
    var e = K.p(t, 13.8);
    K.box(680, 316, 560, 120, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: e });
    K.text('myReduce([], add)', 704, 346, { size: 19, mono: true, a: e });
    K.mark(718, 396, false, 0.8, K.p(t, 14.8));
    K.text('TypeError: Reduce of empty array', 744, 388, { size: 18, mono: true, color: P.red, a: K.p(t, 14.8) });
    K.text('with no initial value', 744, 414, { size: 18, mono: true, color: P.red, a: K.p(t, 14.8) });
    var m = K.p(t, 18.7);
    K.box(40, 456, 1200, 130, { fill: P.code, stroke: P.warm, a: m });
    K.code(['["10", "10", "10"].map(parseInt)'], 64, 474, { size: 21, a: m });
    K.text('→  [10, NaN, 2]', 520, 488, { size: 22, mono: true, weight: 700, color: P.warm, a: K.p(t, 19.8) });
    ['parseInt("10", 0) → 10', 'parseInt("10", 1) → NaN', 'parseInt("10", 2) → 2'].forEach(function (s, i) {
      K.text(s, 64 + i * 390, 552, { size: 18, mono: true, color: i === 1 ? P.red : P.muted, a: K.p(t, 21 + i * 0.8) });
    });
  } },

/* 9 ─ deepEqual */
{ d: 27, title: 'deepEqual',
  caps: [
    [0.3, 'deepEqual starts with cheap checks. Object dot is returns true for the same reference, and even for NaN and NaN.'],
    [7, 'Then both must be objects with the same prototype, so an array never equals a plain object. Dates compare by time.'],
    [13.5, 'Compare own key counts, then recurse into every key. A WeakMap of visited pairs stops cycles from looping forever.'],
    [20, 'Why not compare JSON strings? JSON depends on key order, drops undefined and functions, turns NaN into null, and throws on cycles.']],
  draw: function (K, t) {
    var P = K.P;
    var R = [['Object.is(a, b)', 'NaN, NaN', true, 1],
             ['both objects?', '1, "1"', false, 7.5],
             ['same prototype?', '[], {}', false, 8.8],
             ['Date: getTime()', 'new Date(5), new Date(5)', true, 10.4],
             ['seen pair? (cycle)', 'x.self = x, y.self = y', true, 17.4],
             ['same key count?', '{a: 1}, {a: 1, b: undefined}', false, 14],
             ['every key: recurse', '{a: [1, {b: 2}]}, same shape', true, 15.6]];
    K.text('check, in order', 70, 92, { size: 17, weight: 700, color: P.muted, a: K.p(t, 0.5) });
    K.text('decided here', 480, 92, { size: 17, weight: 700, color: P.muted, a: K.p(t, 0.5) });
    R.forEach(function (r, i) {
      var y = 132 + i * 50, q = K.p(t, r[3], 0.4), ex = K.p(t, r[3] + 0.6, 0.4);
      K.box(50, y - 21, 360, 42, { stroke: q > 0.5 ? P.acc : P.line, a: Math.max(0.35 * K.p(t, 0.6), q) });
      K.text((i + 1) + '  ' + r[0], 70, y, { size: 18, mono: true, a: Math.max(0.35 * K.p(t, 0.6), q) });
      K.arrow(418, y, 462, y, { p: ex, head: 9, lw: 2 });
      K.text(r[1], 480, y, { size: 18, mono: true, a: ex });
      K.mark(960, y, r[2], 0.75, K.p(t, r[3] + 1, 0.3));
      K.text(String(r[2]), 986, y, { size: 19, mono: true, weight: 700, color: r[2] ? P.green : P.red, a: K.p(t, r[3] + 1, 0.3) });
    });
    var j = K.p(t, 20.2);
    K.box(40, 482, 1200, 104, { fill: 'rgba(252,129,129,.08)', stroke: P.red, a: j });
    K.code(['JSON.stringify({ a: undefined, b: () => 1, c: NaN })'], 64, 498, { size: 20, a: j });
    K.text('→  {"c":null}', 690, 510, { size: 21, mono: true, weight: 700, color: P.red, a: K.p(t, 21.4) });
    ['key order', 'drops undefined', 'drops functions', 'NaN → null', 'throws on cycles'].forEach(function (s, i) {
      var q = K.back((t - 22 - i * 0.6) / 0.5); if (q > 0) K.chip(s, 150 + i * 235, 556, { s: q, size: 17, stroke: P.red });
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 32 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['call: attach under a Symbol, call as a method, delete',
     'bind: preset args, and ignore ctx when called with new',
     'curry by arity; memoize with a key, a Map and a cap',
     'debounce waits for quiet; throttle limits the rate',
     'reduce skips holes; deepEqual checks prototypes and cycles'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the self-checks with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ] };
})());
