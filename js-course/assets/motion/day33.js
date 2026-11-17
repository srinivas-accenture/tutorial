/* Day 33 in motion: building a Promise (states, then, microtasks, thenables), Promise.all, timeout, retry, a concurrency limiter and dedupe. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day33', {
  kicker: 'JavaScript: Zero to Architect · Day 33',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 33: build a Promise from scratch, then the async helpers interviewers love.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Async, built by hand', 0, 0, { size: 92, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 33 · Async implementations', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['MyPromise', 'Promise.all', 'retry · timeout · limiter'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ state machine */
{ d: 25, title: 'A promise is a state machine',
  caps: [
    [0.3, 'Implementing a Promise is a classic senior question. At heart it is a state machine: pending, then fulfilled or rejected, exactly once.'],
    [7.5, 'The executor runs immediately and synchronously. It receives resolve and reject, and a done flag makes the first call win.'],
    [14, 'Later calls are ignored, and an exception thrown by the executor becomes a rejection, unless it already settled.'],
    [20, 'Settling stores the value and flushes the waiting handlers. Each one will run later, as a microtask.']],
  draw: function (K, t) {
    var P = K.P, code = ['class MyPromise {', '  #state = "pending"; #value; #handlers = [];', '  constructor(executor) {', '    let done = false;',
      '    const res = (v) => { if (!done) { done = true; this.#resolve(v); } };', '    const rej = (e) => { if (!done) { done = true; this.#reject(e); } };',
      '    try { executor(res, rej); } catch (e) { rej(e); }', '  }', '}'];
    var hi = t > 20 ? 1 : t > 14.2 ? 6 : t > 8 ? 4 : t > 1 && t < 7.2 ? 1 : -1;
    K.panel(40, 76, 1200, 290, 'MyPromise.js');
    K.code(code, 62, 118, { size: 19, lh: 1.35, n: K.typed(t, code, [0.5, 0.9, 1.9, 2.4, 2.9, 4.4, 5.8, 6.8, 6.9], 52), t: t, hi: hi, w: 1160 });
    var d = K.p(t, 1);
    K.box(40, 386, 600, 200, { fill: P.code, stroke: P.line, a: d });
    K.box(70, 456, 170, 56, { stroke: P.warm, a: d }); K.text('pending', 155, 484, { size: 22, weight: 700, align: 'center', color: P.warm, a: d });
    var f1 = K.p(t, 2.2), f2 = K.p(t, 2.8);
    K.arrow(246, 474, 384, 436, { p: f1, color: P.green }); K.arrow(246, 496, 384, 534, { p: f2, color: P.red });
    K.box(390, 410, 210, 50, { stroke: P.green, a: f1 }); K.text('fulfilled(value)', 495, 435, { size: 19, align: 'center', color: P.green, a: f1 });
    K.box(390, 510, 210, 50, { stroke: P.red, a: f2 }); K.text('rejected(reason)', 495, 535, { size: 19, align: 'center', color: P.red, a: f2 });
    K.lock(380, 412, 0.8, P.muted, K.p(t, 4));
    K.text('settles once', 300, 410, { size: 16, color: P.muted, align: 'center', a: K.p(t, 4) });
    var hq = K.p(t, 20.4);
    ['h1', 'h2'].forEach(function (h, i) { K.chip(h, 96 + i * 62, 556, { mono: true, size: 16, stroke: P.blue, a: hq }); });
    K.text('→ microtasks', 186, 556, { size: 17, color: P.blue, a: K.p(t, 21.2) });
    var de = K.p(t, 7.8);
    K.panel(660, 386, 580, 200, 'which call wins?', { a: de });
    K.code(['new MyPromise((res) => {', '  res(1); res(2); throw new Error("x");', '});'], 684, 420, { size: 18, lh: 1.4, a: de });
    K.mark(700, 524, true, 0.75, K.p(t, 9.5)); K.text('res(1) wins: fulfilled with 1', 724, 524, { size: 18, color: P.green, a: K.p(t, 9.5) });
    K.mark(700, 560, false, 0.75, K.p(t, 14.6)); K.text('res(2) and the throw: ignored', 724, 560, { size: 18, color: P.muted, a: K.p(t, 14.6) });
  } },

/* 3 ─ then returns a new promise */
{ d: 25, title: 'then returns a new promise',
  caps: [
    [0.3, 'then must return a new promise. That is what makes chaining work: each step waits on the one before it.'],
    [7, 'If the promise is still pending, the handler record is queued. If it already settled, it is scheduled right away.'],
    [13.5, "The handler's return value resolves the new promise. Here, 2 times 10 fulfills p2 with 20."],
    [19.5, 'If a handler throws, the new promise rejects instead, and the error flows down the chain to the next catch.']],
  draw: function (K, t) {
    var P = K.P, code = ['then(onF, onR) {', '  return new MyPromise((resolve, reject) => {', '    const h = { onF, onR, resolve, reject };',
      '    this.#state === "pending" ? this.#handlers.push(h) : this.#run(h);', '  });', '}'];
    var hi = t > 13.7 && t < 19.3 ? 2 : t > 7.2 && t < 13.3 ? 3 : t > 0.8 && t < 6.8 ? 1 : -1;
    K.panel(40, 76, 1200, 236, 'then');
    K.code(code, 62, 122, { size: 19, lh: 1.5, n: K.typed(t, code, [0.5, 1, 2, 3, 4.4, 4.6], 50), t: t, hi: hi, w: 1160 });
    K.box(40, 332, 1200, 254, { fill: P.code, stroke: P.line, a: K.p(t, 1.2) });
    var N = [['p1', 150, 1.5], ['p2', 640, 2.6], ['p3', 1110, 3.6]];
    var st = [
      t > 14 ? ['fulfilled: 2', P.green] : ['pending', P.warm],
      t > 15.6 ? ['fulfilled: 20', P.green] : ['pending', P.warm],
      t > 20.3 ? ['rejected: err', P.red] : ['pending', P.warm]];
    N.forEach(function (n, i) {
      var q = K.back((t - n[2]) / 0.5); if (q <= 0) return;
      K.g.save(); K.g.translate(n[1], 410); K.g.scale(q, q);
      K.box(-80, -30, 160, 60, { stroke: st[i][1], a: K.clamp(q) });
      K.text(n[0], 0, 0, { size: 24, mono: true, weight: 700, align: 'center', a: K.clamp(q) });
      K.g.restore();
      K.text(st[i][0], n[1], 466, { size: 18, mono: true, color: st[i][1], align: 'center', a: K.clamp(q) });
    });
    K.arrow(236, 410, 554, 410, { p: K.p(t, 2.2, 0.5) });
    K.text('.then(x => x * 10)', 395, 384, { size: 18, mono: true, align: 'center', a: K.p(t, 2.4) });
    K.arrow(726, 410, 1024, 410, { p: K.p(t, 3.2, 0.5) });
    K.text('.then(() => { throw err })', 875, 384, { size: 18, mono: true, align: 'center', a: K.p(t, 3.4) });
    K.text('each then = a new promise', 640, 360, { size: 16, color: P.muted, align: 'center', a: K.win(t, 4.2, 7) });
    var h = K.back((t - 7.8) / 0.5);
    if (h > 0) K.chip('handlers: [h]', 150, 530, { s: h * (1 - K.p(t, 14, 0.4)), mono: true, size: 17, stroke: P.blue });
    K.text('2 × 10 = 20', 395, 440, { size: 18, color: P.green, align: 'center', a: K.p(t, 15) });
    K.text('throw → reject', 875, 440, { size: 18, color: P.red, align: 'center', a: K.p(t, 20.3) });
    var c = K.back((t - 21.8) / 0.5);
    K.arrow(1110, 486, 1110, 516, { p: K.p(t, 21.4, 0.4), color: P.red, head: 9 });
    if (c > 0) K.chip('.catch(e => …)', 1110, 548, { s: c, mono: true, size: 17, stroke: P.red });
  } },

/* 4 ─ microtasks and pass-through */
{ d: 25, title: 'Handlers run as microtasks',
  caps: [
    [0.3, 'Every handler runs inside queueMicrotask, even when the promise has already settled. Never call it synchronously.'],
    [7, 'Why? Consistency. Code written after then always runs first, so callers never see sometimes sync, sometimes async behaviour.'],
    [13.5, 'If a handler is not a function, the value or the reason simply passes through to the next promise.'],
    [19, 'So resolve 7, then 2, still gives 7. catch is then with no success handler, and finally passes the original value on.']],
  draw: function (K, t) {
    var P = K.P, code = ['#run({ onF, onR, resolve, reject }) {', '  queueMicrotask(() => {', '    const ok = this.#state === "fulfilled", cb = ok ? onF : onR;',
      '    if (typeof cb !== "function") return (ok ? resolve : reject)(this.#value);', '    try { resolve(cb(this.#value)); } catch (e) { reject(e); }', '  });', '}'];
    var hi = t > 19.2 ? 4 : t > 13.7 ? 3 : t > 0.8 && t < 6.8 ? 1 : -1;
    K.panel(40, 76, 1200, 266, '#run');
    K.code(code, 62, 122, { size: 19, lh: 1.5, n: K.typed(t, code, [0.4, 1.3, 2.2, 3.6, 5.2, 6.4, 6.6], 54), t: t, hi: hi, w: 1160 });
    var a = K.p(t, 7.2);
    K.panel(40, 362, 590, 224, 'always async', { a: a });
    K.code(['let x = 0;', 'MyPromise.resolve().then(() => x = 1);', 'console.log(x);'], 62, 398, { size: 18, lh: 1.45, a: a });
    K.chip('sync: logs 0', 150, 520, { size: 18, stroke: P.acc, a: K.p(t, 8.6) });
    K.arrow(232, 520, 300, 520, { p: K.p(t, 9.4, 0.4) });
    K.chip('microtask: x = 1', 410, 520, { size: 18, stroke: P.blue, a: K.p(t, 9.8) });
    K.text('same order every time', 62, 566, { size: 17, color: P.green, a: K.p(t, 10.8) });
    var b = K.p(t, 13.7);
    K.panel(650, 362, 590, 224, 'pass-through', { a: b });
    K.code(['MyPromise.resolve(7).then(2)'], 672, 398, { size: 18, a: b });
    var mv = K.p(t, 15, 1.6);
    K.box(850, 438, 150, 44, { stroke: P.red, dash: [6, 5], a: b }); K.text('then(2)', 925, 460, { size: 18, mono: true, align: 'center', color: P.red, a: b });
    K.text('not a function', 925, 498, { size: 16, color: P.red, align: 'center', a: K.p(t, 14.4) });
    K.chip('7', 720 + mv * 380, 460 - Math.sin(Math.PI * mv) * 54, { mono: true, size: 22, stroke: P.green, color: P.green, a: K.p(t, 14.2) });
    K.text('catch(f)  =  then(undefined, f)', 672, 532, { size: 18, mono: true, a: K.p(t, 20) });
    K.text('finally(f)  →  value passes on', 672, 566, { size: 18, mono: true, a: K.p(t, 21.6) });
  } },

/* 5 ─ thenables */
{ d: 25, title: 'Adopting thenables',
  caps: [
    [0.3, 'Resolving is not the same as fulfilling. If you resolve with another promise, or any thenable, you adopt its state.'],
    [7, 'So resolve with an object whose then calls back with 5, and the outer promise fulfills with 5, not with the object.'],
    [13.5, 'Guard the edges: resolving a promise with itself is a TypeError, and a misbehaving thenable may settle it only once.'],
    [19.5, 'This is the step most incomplete answers skip. In an interview, say clearly which parts of the spec you cover.']],
  draw: function (K, t) {
    var P = K.P, code = ['#resolve(x) {', '  if (x === this) return this.#reject(new TypeError("Chaining cycle"));', '  const then = isObject(x) ? x.then : undefined;   // read it once',
      '  if (typeof then === "function")', '    return then.call(x, (y) => this.#resolve(y), (r) => this.#reject(r));', '  this.#fulfill(x);', '}'];
    var hi = t > 13.7 && t < 19.3 ? 1 : t > 7.2 && t < 13.3 ? 4 : t > 1 && t < 6.8 ? 3 : -1;
    K.panel(40, 76, 1200, 250, '#resolve');
    K.code(code, 62, 120, { size: 19, lh: 1.45, n: K.typed(t, code, [0.4, 0.8, 2.2, 3.4, 4.1, 5.6, 6], 54), t: t, hi: hi, w: 1160 });
    K.box(40, 346, 1200, 240, { fill: P.code, stroke: P.line, a: K.p(t, 7) });
    var a = K.p(t, 7.2);
    K.code(['MyPromise.resolve({ then(r) { r(5); } })'], 62, 368, { size: 19, a: a });
    K.box(60, 446, 270, 54, { stroke: P.purple, a: K.p(t, 8) }); K.text('{ then(r) { r(5) } }', 195, 473, { size: 17, mono: true, align: 'center', a: K.p(t, 8) });
    K.arrow(338, 473, 412, 473, { p: K.p(t, 9.2, 0.5), color: P.green });
    K.text('r(5)', 375, 448, { size: 16, mono: true, color: P.green, align: 'center', a: K.p(t, 9.4) });
    K.box(420, 446, 200, 54, { stroke: P.green, a: K.p(t, 8.4) }); K.text('outer promise', 520, 473, { size: 18, align: 'center', a: K.p(t, 8.4) });
    K.arrow(628, 473, 690, 473, { p: K.p(t, 10.2, 0.4), color: P.green });
    var v = K.back((t - 10.6) / 0.5); if (v > 0) K.chip('5', 724, 473, { s: v, mono: true, size: 22, stroke: P.green, color: P.green });
    K.mark(80, 532, false, 0.7, K.p(t, 11.6)); K.text('not fulfilled with the object itself', 104, 532, { size: 17, color: P.muted, a: K.p(t, 11.6) });
    var e = K.p(t, 13.8);
    K.box(800, 360, 420, 160, { stroke: P.red, a: e });
    K.chip('p', 900, 420, { mono: true, size: 22, stroke: P.red, a: e });
    K.curve(914, 402, 940, 330, 886, 400, { p: K.p(t, 14.4, 0.8), color: P.red, lw: 2.5, head: 10 });
    K.text('resolve(p) inside p', 970, 420, { size: 17, mono: true, a: K.p(t, 14.4) });
    K.text('TypeError: Chaining cycle', 824, 480, { size: 18, mono: true, color: P.red, a: K.p(t, 15.4) });
    K.text('then calls r(1), r(2)  →  only the first counts', 824, 548, { size: 16, color: P.warm, a: K.p(t, 17) });
    var s = K.back((t - 20) / 0.6);
    if (s > 0) K.chip('cover: states · then · microtasks · thenables · all', 400, 566, { s: s, size: 17, stroke: P.acc, color: P.acc });
  } },

/* 6 ─ Promise.all */
{ d: 25, title: 'Promise.all',
  caps: [
    [0.3, 'Promise dot all: one promise for many. Copy the input, then keep an output array and a counter of how many are left.'],
    [7, 'Wrap each item with resolve, so plain values work too. Store each result at its own index, not in finishing order.'],
    [13.5, 'Here b finishes first, then c, then a, yet the result is a, b, c. When the counter reaches zero, resolve the array.'],
    [19.5, 'The first rejection rejects the whole thing, and an empty input resolves to an empty array right away.']],
  draw: function (K, t) {
    var P = K.P, code = ['static all(items) {', '  return new MyPromise((res, rej) => {', '    const list = [...items], out = [];', '    let left = list.length;', '    if (!left) return res([]);',
      '    list.forEach((p, i) =>', '      MyPromise.resolve(p).then((v) => {', '        out[i] = v;', '        if (--left === 0) res(out);', '      }, rej));', '  });', '}'];
    var hi = t > 19.7 ? (t < 22 ? 9 : 4) : t > 14 ? 8 : t > 7.2 ? 7 : t > 1 && t < 6.8 ? 2 : -1;
    K.panel(40, 76, 620, 360, 'Promise.all');
    K.code(code, 62, 118, { size: 18, lh: 1.4, n: K.typed(t, code, [0.4, 0.8, 1.5, 2.2, 2.7, 3.3, 3.9, 4.7, 5.1, 5.7, 6, 6.2], 50), t: t, hi: hi, w: 592 });
    var a = K.p(t, 1);
    K.box(680, 76, 560, 510, { stroke: P.acc, a: a });
    K.text('all([slow("a", 30), "b", slow("c", 10)])', 704, 106, { size: 17, mono: true, a: a });
    var L = [['a', 3.1], ['b', 0.5], ['c', 1.7]];
    L.forEach(function (l, i) {
      var y = 160 + i * 60, pr = K.clamp((t - 13.6) / l[1]), done = pr >= 1;
      K.text(l[0], 712, y, { size: 22, mono: true, weight: 700, a: a });
      K.box(740, y - 10, 440, 20, { fill: P.code, r: 6, a: a });
      K.box(740, y - 10, 440 * pr, 20, { fill: done ? P.green : P.blue, r: 6, a: a });
      K.text('#' + (i + 1) + ' done', 1180, y - 22, { size: 16, color: P.green, align: 'right', a: done ? K.p(t, 13.6 + l[1]) : 0 });
    });
    var o = K.p(t, 7.4);
    K.text('out', 712, 386, { size: 18, color: P.muted, a: o });
    L.forEach(function (l, i) {
      var x = 820 + i * 120, f = K.p(t, 13.6 + l[1], 0.3);
      K.box(x - 50, 356, 100, 60, { fill: P.code, stroke: f > 0.5 ? P.green : P.line, dash: f > 0.5 ? null : [6, 5], a: o });
      K.text('[' + i + ']', x, 436, { size: 16, color: P.muted, align: 'center', a: o });
      K.text('"' + l[0] + '"', x, 386, { size: 22, mono: true, color: P.green, align: 'center', a: f });
    });
    var left = 3 - L.filter(function (l) { return t >= 13.6 + l[1]; }).length;
    K.text('left = ' + left, 712, 480, { size: 22, mono: true, weight: 700, color: left ? P.warm : P.green, a: o });
    K.text('res(["a", "b", "c"])', 900, 480, { size: 22, mono: true, color: P.green, a: K.p(t, 16.9) });
    K.text('index order, not finish order', 712, 540, { size: 18, color: P.acc, a: K.p(t, 17.6) });
    var r = K.p(t, 19.8);
    K.box(40, 456, 620, 130, { fill: P.code, stroke: P.red, a: r });
    K.text('all([slow(1), reject("no")])  →  rejects "no"', 62, 492, { size: 18, mono: true, color: P.red, a: r });
    K.text('all([])  →  resolves [] at once', 62, 546, { size: 18, mono: true, color: P.green, a: K.p(t, 22) });
  } },

/* 7 ─ timeout and retry */
{ d: 26, title: 'Timeout and retry',
  caps: [
    [0.3, 'Timeout: race the work against a timer that rejects. Whichever settles first wins.'],
    [6.5, 'Always clear the timer in finally, or it keeps the page or process alive. race never cancels the slow work: pass an AbortSignal.'],
    [13.5, 'Retry: try, and on failure wait longer each time. Base times 2 to the power of the attempt: 100, then 200 milliseconds.'],
    [19.5, 'After the last attempt, throw the last error. Add jitter, and only retry operations that are safe to repeat.']],
  draw: function (K, t) {
    var P = K.P, code = ['function withTimeout(p, ms) {', '  let timer;', '  const t = new Promise((_, rej) => {', '    timer = setTimeout(() => rej(new Error("timeout")), ms); });',
      '  return Promise.race([p, t]).finally(() => clearTimeout(timer));', '}'];
    var hi = t > 6.7 && t < 13 ? 4 : t > 1 && t < 6.2 ? 3 : -1;
    K.panel(40, 76, 1200, 222, 'withTimeout.js');
    K.code(code, 62, 118, { size: 19, lh: 1.42, n: K.typed(t, code, [0.4, 0.9, 1.2, 2, 3.4, 4.6], 50), t: t, hi: hi, w: 730 });
    var w = K.clamp((t - 2) / 6), tm = K.clamp((t - 2) / 3.5), rq = K.p(t, 1.6);
    K.text('work', 840, 130, { size: 17, color: P.muted, a: rq }); K.box(900, 120, 300 * w * (t > 5.5 ? 0 : 1) + (t > 5.5 ? 300 * 0.6 : 0), 20, { fill: P.blue, r: 5, a: rq });
    K.text('timer', 840, 176, { size: 17, color: P.muted, a: rq }); K.box(900, 166, 300 * tm, 20, { fill: P.warm, r: 5, a: rq });
    K.text('rejects "timeout"', 1200, 214, { size: 17, color: P.red, align: 'right', a: K.win(t, 5.6, 9.6) });
    K.mark(856, 260, true, 0.7, K.p(t, 7.6)); K.text('clearTimeout(timer)', 880, 260, { size: 17, mono: true, color: P.green, a: K.p(t, 7.6) });
    K.chip('AbortSignal stops the work', 1060, 214, { size: 16, stroke: P.purple, a: K.win(t, 10, 13.4) });
    var rc = ['async function retry(fn, tries = 3, base = 100) {', '  for (let i = 0; ; i++) {', '    try { return await fn(); }', '    catch (e) {', '      if (i >= tries - 1) throw e;',
      '      await sleep(base * 2 ** i);', '    }', '  }', '}'];
    var rh = t > 19.7 ? 4 : t > 13.7 ? 5 : -1, ra = K.p(t, 13.5);
    K.panel(40, 318, 600, 268, 'retry.js', { a: ra });
    K.code(rc, 62, 356, { size: 18, lh: 1.32, n: K.typed(t, rc, [13.6, 14.5, 14.9, 15.4, 15.6, 16, 16.4, 16.5, 16.6], 60), t: t, hi: rh, w: 572, a: ra });
    K.box(680, 318, 560, 268, { fill: P.code, stroke: P.line, a: ra });
    K.text('attempts', 704, 346, { size: 17, weight: 700, color: P.muted, a: ra });
    var A = [[730, 15.2, false], [900, 17, false], [1150, 18.8, true]];
    A.forEach(function (x, i) {
      var q = K.back((t - x[1]) / 0.4); if (q > 0) K.chip(String(i + 1), x[0], 410, { s: q, mono: true, size: 22, stroke: x[2] ? P.green : P.red });
      K.mark(x[0], 462, x[2], 0.75, K.p(t, x[1] + 0.4));
    });
    K.box(760, 402, 110 * K.clamp((t - 15.7) / 1.1), 16, { fill: P.warm, r: 5, a: ra });
    K.text('wait 100 ms', 815, 386, { size: 16, color: P.warm, align: 'center', a: K.p(t, 15.7) });
    K.box(930, 402, 190 * K.clamp((t - 17.5) / 1.2), 16, { fill: P.warm, r: 5, a: ra });
    K.text('wait 200 ms', 1025, 386, { size: 16, color: P.warm, align: 'center', a: K.p(t, 17.5) });
    ['jitter', 'idempotent only', 'throw last error'].forEach(function (s, i) {
      var q = K.back((t - 20 - i * 0.7) / 0.5); if (q > 0) K.chip(s, [750, 905, 1110][i], 530, { s: q, size: 16, stroke: P.acc });
    });
  } },

/* 8 ─ limiter */
{ d: 24, title: 'A concurrency limiter',
  caps: [
    [0.3, 'A limiter runs at most max tasks at a time. All it needs is a queue and a counter of active tasks.'],
    [7, 'With max 2, tasks 1 and 2 start at once. The others wait in the queue.'],
    [10.5, 'Whenever a task settles, finally lowers the counter and starts the next one. The pool never exceeds 2.'],
    [17.5, 'Start the next task in finally, not only on success, or a single rejection stalls the whole queue.']],
  draw: function (K, t) {
    var P = K.P, code = ['function limiter(max) {', '  let active = 0; const queue = [];', '  const next = () => {', '    if (active >= max || !queue.length) return;', '    active++;',
      '    const { fn, res, rej } = queue.shift();', '    fn().then(res, rej)', '      .finally(() => { active--; next(); });', '  };',
      '  return (fn) => new Promise((res, rej) => {', '    queue.push({ fn, res, rej }); next();', '  });', '}'];
    var hi = t > 17.7 ? 7 : t > 10.7 ? 7 : t > 7.2 ? 3 : t > 1 && t < 6.8 ? 1 : -1;
    K.panel(40, 76, 600, 380, 'limiter.js');
    K.code(code, 62, 118, { size: 18, lh: 1.4, n: K.typed(t, code, [0.4, 0.8, 1.5, 1.9, 2.6, 2.8, 3.5, 3.9, 4.6, 4.8, 5.5, 6.1, 6.2], 52), t: t, hi: hi, w: 572 });
    var a = K.p(t, 1);
    K.box(680, 76, 560, 510, { stroke: P.acc, a: a });
    K.text('queue', 760, 104, { size: 17, weight: 700, color: P.muted, align: 'center', a: a });
    K.text('running (max 2)', 960, 104, { size: 17, weight: 700, color: P.warm, align: 'center', a: a });
    K.text('done', 1150, 104, { size: 17, weight: 700, color: P.green, align: 'center', a: a });
    [0, 1].forEach(function (s) { K.box(895, 134 + s * 60, 130, 48, { fill: false, stroke: P.warm, dash: [6, 5], a: a }); });
    var S = [7.4, 7.4, 10.6, 12.2, 13.8], E = [10.4, 12, 13.6, 15.2, 16.8], slot = [0, 1, 0, 1, 0];
    S.forEach(function (s, i) {
      var qi = i; for (var j = 0; j < i; j++) qi -= K.p(t, S[j], 0.5);
      var qy = 158 + qi * 56, ry = 158 + slot[i] * 60, dy = 158 + i * 56;
      var m1 = K.p(t, s, 0.5), m2 = K.p(t, E[i], 0.5);
      var x = 760 + (960 - 760) * m1 + (1150 - 960) * m2, y = qy + (ry - qy) * m1 + (dy - ry) * m2;
      var col = m2 > 0.5 ? P.green : m1 > 0.5 ? P.warm : P.line;
      K.chip('task ' + (i + 1), x, y, { size: 18, stroke: col, a: K.p(t, 2 + i * 0.4) });
    });
    var act = 0; S.forEach(function (s, i) { if (t >= s && t < E[i]) act++; });
    K.text('active = ' + act, 704, 470, { size: 22, mono: true, weight: 700, color: P.warm, a: K.p(t, 7.2) });
    K.text('results: [1, 4, 9, 16, 25]', 704, 512, { size: 19, mono: true, color: P.green, a: K.p(t, 17) });
    var w = K.p(t, 18.4);
    K.mark(718, 554, false, 0.7, w); K.text('next() only on success: one failure stalls', 742, 554, { size: 17, color: P.red, a: w });
    K.text('finally runs on success and on failure', 62, 494, { size: 18, color: P.green, a: K.p(t, 19.6) });
  } },

/* 9 ─ dedupe and promisify */
{ d: 25, title: 'Dedupe and promisify',
  caps: [
    [0.3, 'Dedupe: when two parts of the page ask for the same thing at once, make one real request and share it.'],
    [7, 'Keep a Map from key to the pending promise. A second caller with the same key gets that same promise back.'],
    [13.5, 'Delete the entry in finally, on success and on failure, so the next call fetches fresh data and errors are not cached.'],
    [19, 'promisify uses the same tools for old callback APIs: wrap an error-first callback in a new promise.']],
  draw: function (K, t) {
    var P = K.P, code = ['function dedupe(fn) {', '  const inflight = new Map();', '  return (key) => {', '    if (inflight.has(key)) return inflight.get(key);',
      '    const p = fn(key).finally(() => inflight.delete(key));', '    inflight.set(key, p);', '    return p;', '  };', '}'];
    var hi = t > 13.7 && t < 18.8 ? 4 : t > 7.2 && t < 13.3 ? 3 : -1;
    K.panel(40, 76, 640, 290, 'dedupe.js');
    K.code(code, 62, 118, { size: 18, lh: 1.45, n: K.typed(t, code, [0.4, 0.8, 1.5, 2, 3, 4.2, 4.7, 5, 5.1], 52), t: t, hi: hi, w: 612 });
    var a = K.p(t, 1.2);
    K.box(720, 76, 520, 290, { stroke: P.line, a: a });
    var C = [['A', '"x"', 1.6], ['B', '"x"', 2.4], ['C', '"y"', 3.2]];
    C.forEach(function (c, i) {
      var y = 130 + i * 74, q = K.back((t - c[2]) / 0.5);
      if (q > 0) K.chip(c[0] + ' · ' + c[1], 800, y, { s: q, mono: true, size: 18, stroke: P.blue });
    });
    K.box(960, 110, 260, 180, { fill: P.code, stroke: P.purple, a: K.p(t, 7.2) });
    K.text('inflight (Map)', 980, 134, { size: 17, weight: 700, color: P.purple, a: K.p(t, 7.2) });
    var gx = 1 - K.p(t, 15, 0.5), gy = 1 - K.p(t, 15.8, 0.5);
    K.text('"x" → promise', 980, 186, { size: 18, mono: true, a: K.p(t, 7.8) * gx });
    K.text('"y" → promise', 980, 240, { size: 18, mono: true, a: K.p(t, 9.6) * gy });
    K.arrow(866, 130, 970, 180, { p: K.p(t, 7.8, 0.4), color: P.green, lw: 2.5, a: gx });
    K.arrow(866, 204, 970, 190, { p: K.p(t, 8.8, 0.4), color: P.green, lw: 2.5, a: gx });
    K.arrow(866, 278, 970, 240, { p: K.p(t, 9.6, 0.4), color: P.green, lw: 2.5, a: gy });
    K.text('B reuses A\'s promise', 980, 316, { size: 16, color: P.green, a: K.win(t, 9, 13.8) });
    K.text('real requests: 2', 1220, 346, { size: 18, weight: 700, color: P.acc, align: 'right', a: K.p(t, 10.4) });
    K.text('settled → deleted', 980, 316, { size: 16, color: P.warm, a: K.p(t, 15) });
    var p = K.p(t, 19.2);
    K.panel(40, 386, 1200, 200, 'promisify', { a: p });
    var pc = ['const promisify = (fn) => (...args) =>', '  new Promise((res, rej) => fn(...args, (err, v) => err ? rej(err) : res(v)));'];
    K.code(pc, 62, 426, { size: 19, lh: 1.5, n: K.typed(t, pc, [19.4, 20.6], 50), t: t, a: p });
    K.chip('err → reject', 300, 548, { size: 18, stroke: P.red, a: K.p(t, 22.6) });
    K.chip('value → resolve', 520, 548, { size: 18, stroke: P.green, a: K.p(t, 23.2) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 33 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['A promise settles once: the first resolve or reject wins',
     'then returns a new promise; handlers run as microtasks',
     'Resolve adopts thenables; resolving with itself is a TypeError',
     'all keeps index order, and [] resolves at once',
     'Clear timeout timers, back off on retry, limit with a queue'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the self-checks with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
