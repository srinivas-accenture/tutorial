/* Day 12 in motion: async functions return promises, await as a bookmark and the order it produces, try/catch with await,
   sequential vs parallel, the forEach trap, the four combinators, timeouts and retries, and a concurrency pool.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day12', {
  kicker: 'JavaScript: Zero to Architect · Day 12',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 12: async and await, and the patterns for running many async tasks well.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('async / await', 0, 0, { size: 100, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 12 · async/await and patterns', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['await, step by step', 'all · allSettled · race · any', 'Retry · timeout · pool'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 330 + i * 310, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ async returns a promise */
{ d: 20, title: 'async always returns a promise',
  caps: [
    [0.3, 'async and await are syntax on top of promises. An async function always returns a promise.'],
    [6.5, 'A returned value is wrapped: returning 5 gives you a promise fulfilled with 5.'],
    [12, 'A throw becomes a rejection. Even before the first await, the caller never sees a synchronous throw.']],
  draw: function (K, t) {
    var P = K.P;
    var c1 = ['async function getNum() {', '  return 5;', '}', 'getNum();'];
    K.panel(40, 90, 620, 220, 'wrap.js', { a: K.p(t, 0.2) });
    K.code(c1, 66, 138, { size: 22, n: K.typed(t, c1, [0.8, 2, 2.6, 6.8], 26), t: t, hi: t > 7 && t < 12 ? 3 : -1, w: 590, a: K.p(t, 0.2) });
    var big = K.back((t - 2.8) / 0.6);
    if (big > 0) K.chip('async function → Promise', 960, 140, { size: 22, stroke: P.acc, s: big });
    K.arrow(650, 268, 760, 268, { p: K.p(t, 7.6, 0.5), color: P.green });
    var f = K.p(t, 8.2);
    K.box(770, 228, 460, 80, { stroke: P.green, a: f });
    K.text('Promise { 5 }', 794, 256, { size: 22, mono: true, a: f });
    K.text('fulfilled with the return value', 794, 288, { size: 16, color: P.muted, a: f });
    var c2 = ['async function boom() {', '  throw new Error("x");', '}', 'const p = boom();   // no throw here', 'p.catch((e) => log(e.message));  // "x"'];
    var e = K.p(t, 12);
    K.panel(40, 340, 620, 240, 'reject.js', { a: e });
    K.code(c2, 66, 384, { size: 20, n: K.typed(t, c2, [12.3, 13.2, 14.2, 14.6, 16.4], 30), t: t, w: 590, a: e });
    K.arrow(650, 452, 760, 452, { p: K.p(t, 15.4, 0.5), color: P.red });
    var r = K.p(t, 15.8);
    K.box(770, 412, 460, 80, { stroke: P.red, a: r });
    K.text('Promise { <rejected> Error }', 794, 440, { size: 20, mono: true, color: P.red, a: r });
    K.text('the throw became a rejection', 794, 472, { size: 16, color: P.muted, a: r });
    K.mark(800, 540, true, 0.8, K.p(t, 17.2));
    K.text('handle it with catch, or await + try/catch', 826, 540, { size: 18, a: K.p(t, 17.2) });
  } },

/* 3 ─ await order */
{ d: 27, title: 'await is a bookmark',
  caps: [
    [0.3, 'await pauses only its own function, not the thread. Think of it as a bookmark in that function.'],
    [6.5, 'a runs synchronously until its first await, so we see start, a1 and b.'],
    [12, 'At the await, a hands a pending promise back to its caller, and the script carries on: end.'],
    [18, 'The rest of a was queued as a microtask before the p reaction, so a2 prints before p.']],
  draw: function (K, t) {
    var P = K.P, code = ['async function a() {', '  console.log("a1");', '  await b();', '  console.log("a2");', '}',
      'async function b() { console.log("b"); }', 'console.log("start");', 'a();', 'Promise.resolve().then(() => console.log("p"));', 'console.log("end");'];
    var hi = t > 19.5 ? 3 : t > 18 ? 3 : t > 13.2 ? 9 : t > 12 ? 8 : t > 10 ? 2 : t > 8.6 ? 1 : t > 7.6 ? 7 : t > 6.6 ? 6 : -1;
    K.panel(40, 84, 720, 400, 'order.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 19, lh: 1.65, n: K.typed(t, code, [0.6, 1, 1.5, 1.9, 2.3, 2.5, 3.2, 3.8, 4.1, 5.2], 46), t: t, hi: hi, w: 690, a: K.p(t, 0.2) });
    K.panel(800, 84, 440, 250, 'Console', { a: K.p(t, 0.2) });
    [['start', 7], ['a1', 8.8], ['b', 10.2], ['end', 13.6], ['a2', 19.4], ['p', 21]].forEach(function (o, i) {
      var x = 830 + (i % 3) * 130, y = 150 + Math.floor(i / 3) * 70;
      K.text(o[0], x, y, { size: 24, mono: true, color: i >= 4 ? P.warm : P.ink, a: K.p(t, o[1], 0.3) });
    });
    /* bookmark at the await line */
    var bm = K.win(t, 10.6, 19.4);
    K.box(36, 182, 10, 34, { fill: P.warm, r: 2, a: bm });
    K.text('paused here', 560, 199, { size: 17, color: P.warm, a: Math.min(bm, K.p(t, 11)) });
    var q = K.p(t, 14.4);
    K.box(800, 360, 440, 220, { fill: P.code, stroke: P.warm, a: q });
    K.text('Microtask queue (first in, first out)', 822, 386, { size: 17, weight: 700, color: P.warm, a: q });
    var c1 = K.back((t - 14.8) / 0.5), c2 = K.back((t - 16.2) / 0.5);
    var out1 = K.p(t, 19, 0.5), out2 = K.p(t, 20.6, 0.5);
    if (c1 > 0) K.chip('1 · resume a after await', 1020, 440, { size: 18, stroke: P.warm, s: c1, a: 1 - out1 });
    if (c2 > 0) K.chip('2 · then → log("p")', 1020, 500 - out1 * 60, { size: 18, stroke: P.blue, s: c2, a: 1 - out2 });
    K.text('the rest of the program keeps running', 400, 530, { size: 19, color: P.green, align: 'center', a: K.win(t, 13.8, 18) });
    K.text('script done, stack empty: drain the queue', 400, 530, { size: 19, color: P.warm, align: 'center', a: K.p(t, 18.4) });
  } },

/* 4 ─ try/catch and the forgotten await */
{ d: 21, title: 'Errors with await',
  caps: [
    [0.3, 'With await, ordinary try, catch and finally handle async errors, reading top to bottom.'],
    [6.5, 'An awaited rejection is thrown right at the await line, and catch receives it.'],
    [12.5, 'Forget await and you get a pending promise instead. A promise is truthy, so this if is always true.']],
  draw: function (K, t) {
    var P = K.P, code = ['async function load() {', '  try {', '    const user = await getUser(7);', '    show(user);', '  } catch (e) {', '    showError(e.message);', '  } finally {', '    hideSpinner();', '  }', '}'];
    var hi = t > 10.4 ? 6 : t > 8.6 ? 4 : t > 6.8 ? 2 : -1;
    K.panel(40, 84, 640, 380, 'load.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 20, lh: 1.6, n: K.typed(t, code, [0.6, 1.2, 1.6, 2.8, 3.4, 4, 4.8, 5.2, 5.7, 5.9], 40), t: t, hi: hi, w: 600, a: K.p(t, 0.2),
      marks: t > 7.6 && t < 8.6 ? { 3: 'rgba(252,129,129,.18)' } : null });
    K.text('rejects: Error("not found")', 1000, 140, { size: 18, color: P.red, mono: true, align: 'center', a: K.p(t, 6.8) });
    K.curve(600, 192, 640, 260, 600, 288, { p: K.p(t, 8, 0.7), color: P.red, dash: [6, 6], lw: 2.5 });
    K.text('skips show(user)', 1000, 190, { size: 17, color: P.muted, align: 'center', a: K.p(t, 8.2) });
    K.text('finally always runs', 1000, 240, { size: 17, color: P.green, align: 'center', a: K.p(t, 10.6) });
    var b = K.p(t, 12.6), bug = ['if (isAllowed()) {   // forgot await!', '  deleteAll();', '}'];
    K.panel(40, 486, 640, 96, '', { a: b, stroke: P.red });
    K.code(bug, 64, 500, { size: 18, lh: 1.35, n: K.typed(t, bug, [12.8, 14.2, 14.6], 34), t: t, a: b });
    K.box(720, 300, 520, 150, { fill: P.code, stroke: P.line, a: K.p(t, 15.4) });
    K.text('isAllowed()', 744, 334, { size: 20, mono: true, a: K.p(t, 15.4) });
    K.text('→ Promise { <pending> }', 744, 370, { size: 20, mono: true, color: P.warm, a: K.p(t, 16) });
    K.text('Boolean(promise) → true', 744, 412, { size: 20, mono: true, color: P.red, a: K.p(t, 17) });
    K.mark(744, 520, false, 0.8, K.p(t, 18)); K.text('deleteAll() always runs', 770, 520, { size: 19, color: P.red, a: K.p(t, 18) });
    K.mark(744, 560, true, 0.8, K.p(t, 19)); K.text('if (await isAllowed())', 770, 560, { size: 19, mono: true, color: P.green, a: K.p(t, 19) });
  } },

/* 5 ─ sequential vs parallel */
{ d: 24, title: 'Sequential vs parallel',
  caps: [
    [0.3, 'Two awaits in a row run one after the other. Two 30 millisecond waits take about 60.'],
    [8, 'If the steps are independent, start both first, then await them together with Promise.all: about 30 in total.'],
    [16, 'Await one at a time only when a step needs the result of the previous one.']],
  draw: function (K, t) {
    var P = K.P;
    var s = ['const a = await sleep(30);', 'const b = await sleep(30);'];
    K.panel(40, 84, 560, 130, 'sequential', { a: K.p(t, 0.2) });
    K.code(s, 66, 130, { size: 21, n: K.typed(t, s, [0.6, 1.6], 30), t: t, a: K.p(t, 0.2) });
    var p = ['const [a, b] = await Promise.all([', '  sleep(30), sleep(30),', ']);'];
    K.panel(40, 240, 560, 150, 'parallel', { a: K.p(t, 8), stroke: P.green });
    K.code(p, 66, 284, { size: 21, n: K.typed(t, p, [8.2, 9.4, 10.2], 30), t: t, a: K.p(t, 8) });
    /* timeline: 0..60 ms over x 700..1200 */
    var x0 = 700, sc = 6.6, ax = K.p(t, 2.4);
    K.arrow(x0, 450, 1120, 450, { color: P.line, lw: 2, a: ax });
    [0, 30, 60].forEach(function (ms) { K.text(ms + ' ms', x0 + ms * sc, 476, { size: 16, color: P.muted, align: 'center', a: ax }); });
    function bar(y, from, ms, start, label, col) {
      var w = K.p(t, start, 1.6) * ms * sc;
      if (w <= 0) return;
      K.box(x0 + from * sc, y - 18, w, 36, { fill: col, r: 8, a: 0.85 });
      K.text(label, x0 + from * sc + 12, y, { size: 17, weight: 700, color: P.bg, a: K.p(t, start + 0.4) });
    }
    bar(120, 0, 30, 3, 'sleep a', P.warm); bar(176, 30, 30, 4.8, 'sleep b', P.warm);
    K.text('≈ 60 ms', 1220, 176, { size: 19, color: P.warm, align: 'right', a: K.p(t, 6.6) });
    bar(290, 0, 30, 11, 'sleep a', P.green); bar(346, 0, 30, 11, 'sleep b', P.green);
    K.text('≈ 30 ms', 1220, 318, { size: 19, color: P.green, align: 'right', a: K.p(t, 12.8) });
    K.text('both started before either is awaited', 960, 400, { size: 17, color: P.muted, align: 'center', a: K.p(t, 13.4) });
    var d = K.p(t, 16.2), dep = ['const user = await getUser(id);', 'const orders = await getOrders(user.id);   // needs user'];
    K.panel(40, 500, 1200, 84, '', { a: d });
    K.code(dep, 64, 512, { size: 19, lh: 1.45, n: K.typed(t, dep, [16.4, 17.6], 34), t: t, a: d });
  } },

/* 6 ─ the forEach trap */
{ d: 22, title: 'The forEach trap',
  caps: [
    [0.3, 'forEach ignores the promise your async callback returns, so it does not wait for anything.'],
    [7, 'That is why "after forEach" prints first, and the items arrive later.'],
    [13, 'Use for...of to go one at a time, or Promise.all with map to run them all in parallel.']],
  draw: function (K, t) {
    var P = K.P, bad = ['[1, 2].forEach(async (n) => {', '  await sleep(5);', '  log("item", n);', '});', 'log("after forEach");'];
    K.panel(40, 84, 600, 250, 'trap.js', { a: K.p(t, 0.2), stroke: P.red });
    K.code(bad, 66, 128, { size: 21, n: K.typed(t, bad, [0.6, 1.8, 2.4, 3, 3.3], 30), t: t, hi: t > 7 && t < 9 ? 4 : -1, w: 560, a: K.p(t, 0.2) });
    K.text('returned promises: dropped', 340, 304, { size: 17, color: P.red, a: K.p(t, 4.4) });
    K.panel(680, 84, 560, 250, 'Console', { a: K.p(t, 0.2) });
    [['after forEach', 7.6, P.warm], ['item 1', 9.4, P.ink], ['item 2', 10, P.ink]].forEach(function (o, i) {
      K.text(o[0], 710, 140 + i * 40, { size: 22, mono: true, color: o[2], a: K.p(t, o[1], 0.3) });
    });
    K.text('the loop finished before any item', 960, 290, { size: 17, color: P.muted, align: 'center', a: K.p(t, 10.6) });
    var s1 = K.p(t, 13.2), seq = ['for (const n of [1, 2]) {', '  await sleep(5);', '  log("item", n);', '}'];
    K.panel(40, 360, 580, 220, 'one at a time', { a: s1, stroke: P.green });
    K.code(seq, 66, 404, { size: 20, n: K.typed(t, seq, [13.4, 14.4, 15, 15.6], 30), t: t, a: s1 });
    var s2 = K.p(t, 16.4), par = ['await Promise.all(', '  [1, 2].map(async (n) => {', '    await sleep(5);', '    log("item", n);', '  }));'];
    K.panel(660, 360, 580, 220, 'all in parallel', { a: s2, stroke: P.green });
    K.code(par, 686, 404, { size: 20, lh: 1.45, n: K.typed(t, par, [16.6, 17.4, 18.4, 19, 19.6], 30), t: t, a: s2 });
  } },

/* 7 ─ combinators */
{ d: 30, title: 'Promise combinators',
  caps: [
    [0.3, 'Promise.all waits for every input and gives the values in input order. One rejection makes it fail fast.'],
    [8, 'Promise.allSettled never rejects. It reports each outcome, with a status of fulfilled or rejected.'],
    [14, 'Promise.race settles like whichever input settles first, success or failure.'],
    [19.5, 'Promise.any wants the first success. Only if every input fails does it reject, with an AggregateError.'],
    [25.5, 'None of them cancels the losers. That work keeps running unless you abort it.']],
  draw: function (K, t) {
    var P = K.P;
    /* inputs: A ok @40%, B fails @25%, C ok @70% of the lane */
    var R = [['Promise.all', 0.3, '✗ rejects with B’s error', P.red], ['allSettled', 8, '[ok A, fail B, ok C]', P.green],
             ['race', 14, '✗ B settled first', P.red], ['any', 19.5, '✓ A: first success', P.green]];
    var x0 = 300, L = 520;
    K.text('inputs over time →', x0, 96, { size: 16, color: P.muted, a: K.p(t, 0.6) });
    R.forEach(function (r, i) {
      var y = 150 + i * 106, a = K.p(t, r[1]);
      K.text(r[0], 60, y, { size: 22, weight: 700, mono: true, color: P.acc, a: a });
      K.box(x0, y - 38, L, 76, { fill: P.code, stroke: P.line, a: a });
      var lt = t - r[1] - 0.6;
      [['A', 0.45, true, -22], ['B', 0.25, false, 0], ['C', 0.75, true, 22]].forEach(function (s) {
        var w = K.clamp(lt / 3.2 / s[1]) * s[1] * L;
        if (lt <= 0) return;
        K.box(x0 + 8, y + s[3] - 6, Math.max(0, w - 8), 12, { fill: s[2] ? P.green : P.red, r: 6, a: 0.7 });
        if (lt > 3.2 * s[1]) K.text(s[0], x0 + w + 12, y + s[3], { size: 15, weight: 700, color: s[2] ? P.green : P.red });
      });
      var stop = [0.25, 0.75, 0.25, 0.45][i];
      K.box(x0 + stop * L + 2, y - 38, 3, 76, { fill: P.warm, r: 1, a: K.p(t, r[1] + 0.6 + 3.2 * stop, 0.3) });
      K.text(r[2], 860, y, { size: 19, mono: i === 1, color: r[3], a: K.p(t, r[1] + 1 + 3.2 * stop, 0.4) });
    });
    K.box(40, 560, 1200, 3, { fill: P.warm, r: 1, a: K.p(t, 25.8) * 0.6 });
    K.text('A and C keep running after Promise.all rejects: use an AbortController to stop them', 640, 584, { size: 18, color: P.warm, align: 'center', a: K.p(t, 26) });
  } },

/* 8 ─ timeout and retry */
{ d: 27, title: 'Timeouts and retries',
  caps: [
    [0.3, 'A timeout is just a race between your work and a timer that rejects.'],
    [6.5, 'With fetch, AbortSignal.timeout is better: it rejects and actually cancels the request.'],
    [12.5, 'For flaky calls, retry with exponential backoff: wait 2, then 4, then 8, plus random jitter so clients do not retry in lockstep.'],
    [21, 'Only retry safe, idempotent operations, so a payment is never charged twice.']],
  draw: function (K, t) {
    var P = K.P, a = ['const withTimeout = (p, ms) => Promise.race([', '  p,', '  new Promise((_, rej) =>', '    setTimeout(() => rej(new Error("timeout")), ms)),', ']);'];
    K.panel(40, 84, 720, 220, 'timeout.js', { a: K.p(t, 0.2) });
    K.code(a, 66, 126, { size: 19, lh: 1.5, n: K.typed(t, a, [0.6, 2.2, 2.6, 3.4, 5], 40), t: t, a: K.p(t, 0.2) });
    var b = ['const res = await fetch(url, {', '  signal: AbortSignal.timeout(5000),', '});'];
    K.panel(800, 84, 440, 220, 'fetch', { a: K.p(t, 6.6), stroke: P.green });
    K.code(b, 822, 132, { size: 17, lh: 1.6, n: K.typed(t, b, [6.8, 7.8, 9.4], 34), t: t, a: K.p(t, 6.6) });
    K.mark(830, 262, true, 0.7, K.p(t, 10)); K.text('the request is cancelled', 852, 262, { size: 17, color: P.green, a: K.p(t, 10) });
    K.text('race alone leaves the slow work running', 400, 280, { size: 16, color: P.warm, align: 'center', a: K.p(t, 10.8) });
    /* the race, shown while the first two captions play */
    var rc = K.win(t, 1.4, 12.2), rx = 80;
    K.text('your work', rx, 380, { size: 18, color: P.muted, a: rc });
    K.text('timer', rx, 440, { size: 18, color: P.muted, a: rc });
    K.box(rx + 110, 366, 700 * K.p(t, 1.8, 6), 28, { fill: P.blue, r: 8, a: rc * 0.7 });
    K.box(rx + 110, 426, 420 * K.p(t, 1.8, 3.6), 28, { fill: P.red, r: 8, a: rc * 0.8 });
    K.text('rejects: timeout wins the race', rx + 550, 440, { size: 18, color: P.red, a: Math.min(rc, K.p(t, 5.4)) });
    K.text('still running', rx + 830, 380, { size: 18, color: P.warm, a: Math.min(rc, K.p(t, 7.8)) });
    /* retry timeline */
    var r = K.p(t, 12.6), x0 = 80, y = 400;
    K.text('retry with backoff', 60, 340, { size: 20, weight: 700, color: P.acc, a: r });
    K.arrow(x0, y + 50, 1220, y + 50, { color: P.line, lw: 2, a: r });
    var T = [[0, false, 13], [2, false, 14.8], [6, false, 16.6], [14, true, 18.4]];
    T.forEach(function (s, i) {
      var x = x0 + 20 + s[0] * 70, q = K.back((t - s[2]) / 0.5);
      if (i) {
        var px = x0 + 20 + T[i - 1][0] * 70 + 60;
        K.box(px, y - 4, Math.max(0, (x - px - 8) * K.p(t, s[2] - 1.2, 1)), 8, { fill: P.muted, r: 4, a: 0.35 });
        K.text('wait ' + Math.pow(2, i) + ' s ±', (px + x) / 2, y - 32, { size: 16, color: P.muted, align: 'center', a: K.p(t, s[2] - 1) });
      }
      if (q > 0) { K.chip('try ' + (i + 1), x + 26, y, { size: 17, stroke: s[1] ? P.green : P.red, s: q }); K.mark(x + 26, y + 50, s[1], 0.6, K.clamp(q)); }
    });
    K.text('jitter: a little randomness in each wait', 1000, 340, { size: 16, color: P.muted, align: 'center', a: K.p(t, 17.4) });
    var w = K.p(t, 21.2);
    K.box(80, 500, 1120, 76, { fill: 'rgba(246,173,85,.08)', stroke: P.warm, a: w });
    K.mark(110, 538, true, 0.8, w); K.text('GET, reads', 134, 538, { size: 19, a: w });
    K.mark(320, 538, true, 0.8, K.p(t, 22)); K.text('requests with an idempotency key', 344, 538, { size: 19, a: K.p(t, 22) });
    K.mark(740, 538, false, 0.8, K.p(t, 23)); K.text('a plain "charge card" POST', 764, 538, { size: 19, color: P.red, a: K.p(t, 23) });
  } },

/* 9 ─ concurrency pool */
{ d: 24, title: 'A concurrency pool',
  caps: [
    [0.3, 'Fifty requests at once can overwhelm a server, or get you rate limited. A pool caps how many run at the same time.'],
    [7.5, 'Start N workers. Each one loops, pulling the next task from a shared queue until it is empty.'],
    [15.5, 'Results are stored by index, so they come back in input order, whichever task finished first.']],
  draw: function (K, t) {
    var P = K.P, code = ['async function worker() {', '  while (i < tasks.length) {', '    const idx = i++;', '    results[idx] = await tasks[idx]();', '  }', '}',
      'await Promise.all([worker(), worker()]);'];
    K.panel(40, 84, 600, 300, 'pool.js', { a: K.p(t, 7.6) });
    K.code(code, 66, 126, { size: 19, lh: 1.6, n: K.typed(t, code, [7.8, 8.6, 9.6, 10.2, 11.4, 11.6, 12], 40), t: t, w: 570, hi: t > 15.5 ? 3 : t > 12.6 ? 6 : -1, a: K.p(t, 7.6) });
    /* queue of 5 tasks, 2 workers; durations: 3,2,2,3,1 time units, unit = 1.1 s, start at 9 */
    var D = [3, 2, 2, 3, 1], st = [0, 0, 2, 3, 4], wk = [0, 1, 1, 0, 1], u = 1.1, T0 = 9;
    var tt = (t - T0) / u, qa = K.p(t, 0.6);
    K.text('queue', 700, 104, { size: 18, weight: 700, color: P.muted, a: qa });
    D.forEach(function (d, k) {
      var taken = tt >= st[k], x = 790 + k * 88;
      K.chip('t' + (k + 1), x, 104, { mono: true, size: 18, stroke: P.blue, a: qa * (taken ? 0.18 : 1) });
    });
    K.text('limit = 2', 1180, 160, { size: 18, color: P.warm, align: 'right', a: K.p(t, 3) });
    [0, 1].forEach(function (w) {
      var y = 214 + w * 90, a = K.p(t, 3 + w * 0.5);
      K.text('worker ' + (w + 1), 680, y, { size: 19, weight: 700, color: P.acc, a: a });
      K.box(790, y - 30, 440, 60, { fill: P.code, stroke: P.line, a: a });
      D.forEach(function (d, k) {
        if (wk[k] !== w || tt < st[k]) return;
        var p = K.clamp((tt - st[k]) / d), x = 796 + st[k] * 72;
        K.box(x, y - 22, Math.max(4, p * d * 72 - 6), 44, { fill: p >= 1 ? 'rgba(104,211,145,.25)' : 'rgba(99,179,237,.35)', stroke: p >= 1 ? P.green : P.blue, r: 8 });
        K.text('t' + (k + 1), x + 12, y, { size: 17, mono: true, weight: 700 });
      });
    });
    K.text('never more than 2 at once', 1010, 370, { size: 17, color: P.muted, align: 'center', a: K.p(t, 13) });
    var r = K.p(t, 15.8);
    K.text('results', 60, 452, { size: 20, weight: 700, color: P.green, a: r });
    D.forEach(function (d, k) {
      var done = (st[k] + d) * u + T0, q = K.back((t - Math.max(done, 16)) / 0.5);
      K.box(170 + k * 150, 420, 130, 64, { fill: P.code, stroke: P.line, a: r });
      K.text('[' + k + ']', 186 + k * 150, 452, { size: 16, mono: true, color: P.muted, a: r });
      if (q > 0) K.text('r' + (k + 1), 250 + k * 150, 452, { size: 22, mono: true, color: P.green, a: K.clamp(q) });
    });
    K.text('order follows the input, not the finish time', 560, 530, { size: 19, color: P.muted, align: 'center', a: K.p(t, 18.6) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 12 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['async functions always return a promise',
     'await pauses only that function; the rest resumes as a microtask',
     'Independent work: start it all, then await Promise.all',
     'forEach does not wait: use for...of or Promise.all(map)',
     'all, allSettled, race, any; timeouts, retries and pools'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 12 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
