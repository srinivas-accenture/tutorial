/* Day 11 in motion: sync vs async callbacks, error-first callbacks, callback hell and inversion of control,
   Promise states, the synchronous executor, then-chains with throw/catch/finally, promisify and unhandled rejections.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day11', {
  kicker: 'JavaScript: Zero to Architect · Day 11',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 11: callbacks, why they became painful, and how Promises fix control flow and errors.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Callbacks & Promises', 0, 0, { size: 88, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 11 · Async control flow', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Callbacks', 'Promise states', 'then · catch · finally'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ sync vs async callbacks */
{ d: 24, title: 'What a callback is',
  caps: [
    [0.3, 'A callback is just a function you pass to another function, so that it can call it later.'],
    [6.5, 'Some callbacks are synchronous: forEach calls yours right away, before the next line runs.'],
    [12.5, 'Others are asynchronous: setTimeout hands yours to the host, which calls it back after your code has finished.'],
    [19, 'So "async" prints last, even with a 0 ms delay. The single thread never sits and waits.']],
  draw: function (K, t) {
    var P = K.P, code = ['console.log("1 start");', '[1, 2].forEach((n) => console.log("sync", n));', 'setTimeout(() => console.log("async"), 0);', 'console.log("2 end");'];
    var hi = t > 19 ? 2 : t > 14 ? 3 : t > 12.5 ? 2 : t > 6.5 ? 1 : -1;
    K.panel(40, 84, 700, 230, 'callbacks.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 140, { size: 20, n: K.typed(t, code, [0.8, 1.8, 3.8, 5.6], 28), t: t, hi: hi, w: 680, a: K.p(t, 0.2) });
    K.panel(780, 84, 460, 230, 'Console', { a: K.p(t, 0.2) });
    [['1 start', 7], ['sync 1', 8.2], ['sync 2', 8.8], ['2 end', 15], ['async', 19.6]].forEach(function (o, i) {
      K.text(o[0], 810, 140 + i * 34, { size: 20, mono: true, color: i === 4 ? P.warm : i === 1 || i === 2 ? P.green : P.ink, a: K.p(t, o[1], 0.3) });
    });
    var u = K.win(t, 4.2, 7.5);
    K.box(231, 195, 308, 3, { fill: P.acc, r: 1, a: Math.min(u, K.p(t, 3.4)) });
    K.box(187, 227, 286, 3, { fill: P.acc, r: 1, a: Math.min(u, K.p(t, 5.4)) });
    K.text('callbacks: functions passed in', 560, 290, { size: 17, color: P.acc, align: 'center', a: Math.min(u, K.p(t, 5.4)) });
    K.arrow(420, 282, 400, 236, { p: K.p(t, 5.6, 0.4), color: P.acc, a: u, lw: 2, head: 10 });
    /* lane 1: synchronous */
    var s1 = K.p(t, 8);
    K.text('Synchronous', 60, 410, { size: 21, weight: 700, color: P.green, a: s1 });
    K.chip('forEach(cb)', 340, 410, { mono: true, size: 20, stroke: P.green, a: s1 });
    K.arrow(430, 410, 520, 410, { p: K.p(t, 8.6, 0.5), color: P.green });
    K.chip('cb(1), cb(2) right now', 680, 410, { size: 19, stroke: P.green, a: K.p(t, 9) });
    K.text('before the next line', 850, 410, { size: 18, color: P.muted, a: K.p(t, 9.6) });
    /* lane 2: asynchronous */
    var s2 = K.p(t, 13);
    K.text('Asynchronous', 60, 520, { size: 21, weight: 700, color: P.warm, a: s2 });
    K.chip('setTimeout(cb, 0)', 360, 520, { mono: true, size: 20, stroke: P.warm, a: s2 });
    K.arrow(478, 520, 560, 520, { p: K.p(t, 13.6, 0.5), color: P.warm });
    K.chip('host: timer', 655, 520, { size: 19, stroke: P.blue, a: K.p(t, 14) });
    K.arrow(740, 520, 812, 520, { p: K.p(t, 17.2, 0.5), color: P.warm });
    var c3 = K.back((t - 19.4) / 0.5);
    if (c3 > 0) K.chip('cb() later', 895, 520, { size: 19, stroke: P.warm, s: c3 });
    K.text('after your code ends', 975, 520, { size: 18, color: P.muted, a: K.p(t, 20) });
    K.text('0 ms is a minimum, not "now"', 655, 572, { size: 17, color: P.warm, align: 'center', a: K.p(t, 21) });
  } },

/* 3 ─ error-first callbacks */
{ d: 23, title: 'Error-first callbacks',
  caps: [
    [0.3, "Node's older APIs use error-first callbacks: the first argument is an error, or null when everything went well."],
    [7, 'On success you get null plus the result. On failure you get an Error object.'],
    [12, 'So the first job of every callback is to check err, and stop if it is set.'],
    [17, 'And because the callback runs later, a try/catch around the call can never catch that error.']],
  draw: function (K, t) {
    var P = K.P, code = ['function read(name, cb) {', '  setTimeout(() => name', '    ? cb(null, "data:" + name)', '    : cb(new Error("no name")), 1);', '}',
      'read("x", (err, data) => {', '  if (err) return handle(err);', '  use(data);', '});'];
    var hi = t > 12.8 && t < 17 ? 6 : t > 8.6 && t < 10.2 ? 2 : t > 10.2 && t < 12 ? 3 : -1;
    K.panel(40, 84, 680, 340, 'read.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 130, { size: 20, lh: 1.5, n: K.typed(t, code, [0.8, 1.6, 2.4, 3.4, 4.6, 12.2, 13, 13.9, 14.5], 30), t: t, hi: hi, w: 640, a: K.p(t, 0.2) });
    var c = K.back((t - 1.2) / 0.6);
    if (c > 0) K.chip('cb(err, result)', 1000, 130, { mono: true, size: 24, stroke: P.acc, s: c });
    K.text('error first, result second', 1000, 182, { size: 18, color: P.muted, align: 'center', a: K.p(t, 2.2) });
    var a1 = K.p(t, 7.6), a2 = K.p(t, 9.8);
    K.mark(790, 250, true, 0.8, a1); K.text('success', 816, 250, { size: 19, weight: 700, color: P.green, a: a1 });
    K.text('cb(null, "data:x")', 920, 250, { size: 19, mono: true, a: a1 });
    K.mark(790, 310, false, 0.8, a2); K.text('failure', 816, 310, { size: 19, weight: 700, color: P.red, a: a2 });
    K.text('cb(new Error(...))', 920, 310, { size: 19, mono: true, a: a2 });
    K.chip('check err first, every time', 1000, 385, { size: 19, stroke: P.warm, color: P.warm, a: K.p(t, 13.2) });
    var e = K.p(t, 17.4);
    K.box(40, 452, 1200, 126, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: e });
    K.code(['try { read("", cb); } catch (e) { /* never runs */ }'], 110, 474, { size: 20, a: e });
    K.mark(78, 486, false, 0.8, K.p(t, 18.4));
    K.text('the error happens later, on a fresh call stack: the try block is long gone', 110, 542, { size: 19, color: P.red, a: K.p(t, 19) });
  } },

/* 4 ─ callback hell */
{ d: 23, title: 'Callback hell',
  caps: [
    [0.3, 'Real tasks are sequences: get the user, then their orders, then the items. Each step needs the previous result.'],
    [7, 'With callbacks each step nests inside the previous one, so the code drifts right: the pyramid of doom.'],
    [13.5, 'Every level repeats its own error check. Forget one, and that error silently disappears.'],
    [18.5, 'Promises flatten this into one chain, with a single place to handle errors.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['getUser(id, (err, user) => {', '  if (err) return fail(err);', '  getOrders(user, (err, orders) => {', '    if (err) return fail(err);',
      '    getItems(orders[0], (err, items) => {', '      if (err) return fail(err);', '      render(items);', '    });', '  });', '});'];
    var mk = t > 14 ? { 1: 'rgba(252,129,129,.2)', 3: 'rgba(252,129,129,.2)', 5: 'rgba(252,129,129,.2)' } : null;
    K.panel(40, 84, 720, 420, 'orders.js', { a: K.p(t, 0.3) });
    K.code(code, 66, 130, { size: 20, n: K.typed(t, code, [3.2, 7.9, 8.4, 9.2, 9.7, 10.5, 11, 11.4, 11.6, 11.8], 34), t: t, w: 680, marks: mk, a: K.p(t, 0.3) });
    /* the drift: a wedge following the indentation */
    var w = K.p(t, 12, 1);
    if (w > 0) {
      g.save(); g.globalAlpha *= w * 0.9; g.strokeStyle = P.warm; g.lineWidth = 3; g.setLineDash([8, 6]);
      g.beginPath(); g.moveTo(52, 128); g.lineTo(114, 346); g.lineTo(52, 442); g.stroke(); g.restore();
      K.text('pyramid of doom', 300, 470, { size: 19, color: P.warm, weight: 700, a: w });
    }
    /* step flow on the right */
    ['getUser(id)', 'getOrders(user)', 'getItems(order)'].forEach(function (s, i) {
      var q = K.back((t - 1 - i * 1.6) / 0.6), y = 112 + i * 76;
      if (q > 0) K.chip(s, 1010, y, { mono: true, size: 21, s: q, stroke: P.acc });
      if (i) K.arrow(1010, y - 54, 1010, y - 24, { p: K.p(t, 0.6 + i * 1.6, 0.4), color: P.muted });
    });
    var x3 = K.win(t, 15, 18.6);
    K.chip('3 error checks', 1010, 410, { size: 19, stroke: P.red, color: P.red, a: x3 });
    K.text('one missing = a lost error', 1010, 452, { size: 17, color: P.muted, align: 'center', a: Math.min(x3, K.p(t, 16)) });
    var f = K.p(t, 18.8), flat = ['getUser(id)', '  .then(getOrders)', '  .then(getItems)', '  .catch(fail);'];
    K.panel(800, 330, 440, 250, 'flat', { a: f, stroke: P.green });
    K.code(flat, 826, 380, { size: 21, n: K.typed(t, flat, [19.2, 19.8, 20.4, 21], 30), t: t, a: f });
    K.mark(1200, 548, true, 0.8, K.p(t, 21.6));
  } },

/* 5 ─ inversion of control */
{ d: 22, title: 'Inversion of control',
  caps: [
    [0.3, 'The deeper problem is trust. Passing a callback hands the rest of your program to code you do not control.'],
    [7, 'It might call you twice, never, too early before your setup has run, or much too late.'],
    [13, 'A once guard protects you from duplicate calls, but you have to remember it everywhere.'],
    [17.5, 'Promises fix this by design: they settle exactly once, and their reactions always run asynchronously.']],
  draw: function (K, t) {
    var P = K.P;
    var a = K.p(t, 0.3);
    K.box(60, 96, 330, 150, { stroke: P.acc, a: a });
    K.text('Your code', 84, 124, { size: 21, weight: 700, a: a });
    K.chip('cb = shipOrder', 225, 192, { mono: true, size: 19, stroke: P.acc, a: K.p(t, 1.2) });
    K.arrow(400, 171, 530, 171, { p: K.p(t, 2.2, 0.6), color: P.acc });
    K.text('you hand it over', 465, 146, { size: 16, color: P.muted, align: 'center', a: K.p(t, 2.6) });
    var b = K.p(t, 2.6);
    K.box(540, 96, 680, 150, { stroke: P.warm, a: b, dash: [8, 6] });
    K.text('payment.js  (not your code)', 564, 124, { size: 21, weight: 700, color: P.warm, a: b });
    K.code(['charge(card, cb);'], 564, 168, { size: 22, a: K.p(t, 3.2) });
    K.text('you only hope it calls cb once, later', 800, 218, { size: 17, color: P.muted, a: K.p(t, 4.2) });
    [['called twice', 'customer charged, order shipped twice'], ['never called', 'the order hangs forever'],
     ['called too early', 'synchronously, before setup ran'], ['called too late', 'after the user gave up']].forEach(function (f, i) {
      var q = K.p(t, 7.4 + i * 1.2), x = 80 + (i % 2) * 600, y = 300 + Math.floor(i / 2) * 64;
      K.mark(x, y, false, 0.8, q);
      K.text(f[0], x + 26, y, { size: 20, weight: 700, color: P.red, a: q });
      K.text(f[1], x + 210, y, { size: 18, color: P.muted, a: q });
    });
    var o = K.p(t, 13.2), once = ['const once = (cb) => {', '  let called = false;', '  return (...a) => { if (called) return;', '    called = true; cb(...a); };', '};'];
    K.panel(40, 412, 640, 172, '', { a: o });
    K.code(once, 64, 424, { size: 18, lh: 1.5, n: K.typed(t, once, [13.4, 14, 14.6, 15.6, 16.4], 34), t: t, a: o });
    K.text('Promise guarantees', 960, 432, { size: 19, weight: 700, color: P.green, align: 'center', a: K.p(t, 17.8) });
    ['settles exactly once', 'reactions always async', 'errors flow to catch'].forEach(function (s, i) {
      var q = K.back((t - 18.2 - i * 0.6) / 0.5);
      if (q > 0) { K.mark(800, 476 + i * 42, true, 0.7, q); K.text(s, 824, 476 + i * 42, { size: 19, a: K.clamp(q) }); }
    });
  } },

/* 6 ─ promise states */
{ d: 22, title: 'Promise states',
  caps: [
    [0.3, 'A Promise is an object that stands for a value you will get later, like the buzzer you get when you order food.'],
    [7, 'It starts out pending. Then it settles exactly once: fulfilled with a value, or rejected with a reason.'],
    [13.5, 'Settled is final. A fulfilled promise never turns rejected, and its value never changes.'],
    [18, 'You react to the outcome: then for the value, catch for the error.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var a = K.p(t, 0.4), done = K.p(t, 11, 0.6);
    K.box(70, 150, 320, 320, { stroke: P.line, a: a });
    K.text('your buzzer', 230, 180, { size: 18, color: P.muted, align: 'center', a: a });
    var pend = K.p(t, 7.4) * (1 - done), pulse = 0.5 + 0.5 * Math.sin(t * 5);
    g.save(); g.globalAlpha *= a;
    g.fillStyle = done > 0.5 ? P.green : pend > 0.5 ? P.warm : P.line;
    g.beginPath(); g.arc(230, 290, 54, 0, 7); g.fill();
    if (pend > 0) { g.globalAlpha *= pend * (1 - pulse) ; g.strokeStyle = P.warm; g.lineWidth = 3; g.beginPath(); g.arc(230, 290, 60 + pulse * 26, 0, 7); g.stroke(); }
    g.restore();
    K.text('Promise { <pending> }', 230, 400, { size: 18, mono: true, align: 'center', color: P.warm, a: a * (1 - done) });
    K.text("Promise { 'burger' }", 230, 400, { size: 18, mono: true, align: 'center', color: P.green, a: done });
    K.text('a future value', 230, 440, { size: 17, color: P.muted, align: 'center', a: K.p(t, 2) });
    var intro = K.win(t, 1.6, 7);
    [['order food', 1.6], ['get a buzzer now', 2.6], ['food arrives later', 3.8]].forEach(function (c, i) {
      K.chip(c[0], 560 + i * 250, 300, { size: 19, stroke: i === 1 ? P.warm : P.line, a: Math.min(intro, K.p(t, c[1])) });
      if (i) K.arrow(560 + i * 250 - 150, 300, 560 + i * 250 - 108, 300, { p: K.p(t, c[1] - 0.3, 0.4), color: P.muted, a: intro });
    });
    /* state machine */
    var sp = K.p(t, 7.2);
    K.box(470, 255, 230, 90, { stroke: P.warm, a: sp });
    K.text('pending', 585, 286, { size: 24, weight: 700, align: 'center', a: sp });
    K.text('no value yet', 585, 320, { size: 16, color: P.muted, align: 'center', a: sp });
    K.arrow(706, 280, 840, 205, { p: K.p(t, 9, 0.5), color: P.green });
    K.arrow(706, 320, 840, 425, { p: K.p(t, 10, 0.5), color: P.red });
    var f = K.p(t, 9.2), r = K.p(t, 10.2);
    K.box(850, 150, 340, 96, { stroke: P.green, a: f });
    K.text('fulfilled', 874, 182, { size: 24, weight: 700, color: P.green, a: f });
    K.text('value: "burger"', 874, 218, { size: 18, mono: true, a: f });
    K.box(850, 380, 340, 96, { stroke: P.red, a: r });
    K.text('rejected', 874, 412, { size: 24, weight: 700, color: P.red, a: r });
    K.text('reason: Error("sold out")', 874, 448, { size: 18, mono: true, a: r });
    K.text('settled: one way, once', 1020, 528, { size: 18, color: P.muted, align: 'center', a: K.p(t, 11.6) * (1 - K.p(t, 18, 0.4)) });
    var fin = K.win(t, 13.8, 18);
    K.lock(1160, 172, 0.9, P.green, fin);
    K.arrow(1100, 252, 1100, 372, { p: K.p(t, 14.4, 0.6), color: P.red, dash: [7, 7], a: fin });
    K.mark(1100, 312, false, 0.8, Math.min(fin, K.p(t, 15)));
    K.text('no going back', 980, 312, { size: 17, color: P.red, align: 'center', a: Math.min(fin, K.p(t, 15.4)) });
    K.chip('.then((v) => eat(v))', 1020, 286, { mono: true, size: 18, stroke: P.green, a: K.p(t, 18.4) });
    K.chip('.catch((e) => reorder())', 1020, 520, { mono: true, size: 18, stroke: P.red, a: K.p(t, 19.4) });
  } },

/* 7 ─ executor runs now, reactions later */
{ d: 24, title: 'Executor now, reactions later',
  caps: [
    [0.3, 'The function you pass to new Promise is the executor. It runs synchronously, straight away.'],
    [7.5, 'Only the first resolve counts. The second call is silently ignored, because a promise settles only once.'],
    [13, 'then never runs its callback synchronously. It is queued as a microtask, even when the promise is already settled.'],
    [19, 'So 3 prints before 4. Promise reactions wait until the current code has finished.']],
  draw: function (K, t) {
    var P = K.P, code = ['console.log("1");', 'const p = new Promise((resolve) => {', '  console.log("2 executor");', '  resolve("done");', '  resolve("ignored");', '});',
      'p.then((v) => console.log("4", v));', 'console.log("3");'];
    var hi = t > 19 ? 7 : t > 13 ? 6 : t > 9.2 ? 4 : t > 7.5 ? 3 : t > 5 ? 2 : t > 3.6 ? 0 : -1;
    K.panel(40, 84, 720, 320, 'order.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 130, { size: 20, n: K.typed(t, code, [0.6, 1, 1.6, 2.2, 2.6, 3, 3.1, 3.4], 40), t: t, hi: hi, w: 680, a: K.p(t, 0.2),
      marks: t > 9.6 ? { 4: 'rgba(252,129,129,.18)' } : null });
    K.text('ignored', 690, 274, { size: 17, color: P.red, align: 'right', a: K.p(t, 10) });
    K.panel(800, 84, 440, 320, 'Console', { a: K.p(t, 0.2) });
    [['1', 4], ['2 executor', 5.4], ['3', 19.6], ['4 done', 21.4]].forEach(function (o, i) {
      K.text(o[0], 830, 140 + i * 40, { size: 21, mono: true, color: i === 3 ? P.warm : P.ink, a: K.p(t, o[1], 0.3) });
    });
    K.text('executor ran immediately', 1010, 340, { size: 17, color: P.green, align: 'center', a: K.win(t, 5.8, 13) });
    var b = K.p(t, 12.8);
    K.box(40, 432, 560, 148, { fill: P.code, stroke: P.purple, a: b });
    K.text('Running now (call stack)', 62, 458, { size: 18, weight: 700, color: P.purple, a: b });
    K.chip('main script', 170, 520, { mono: true, size: 19, stroke: P.purple, a: b * (1 - K.p(t, 20.4, 0.5)) });
    K.box(680, 432, 560, 148, { fill: P.code, stroke: P.warm, a: b });
    K.text('Microtask queue', 702, 458, { size: 18, weight: 700, color: P.warm, a: b });
    var mv = K.p(t, 14.4, 1.2), out = K.p(t, 20.8, 0.6), cb = K.back((t - 13.6) / 0.5);
    if (cb > 0) K.chip('(v) => console.log("4", v)', 450 + mv * 510, 520 - out * 40, { mono: true, size: 18, stroke: P.warm, s: cb, a: 1 - out });
    K.text('waits for the stack to empty', 960, 556, { size: 16, color: P.muted, align: 'center', a: K.win(t, 16, 20.6) });
  } },

/* 8 ─ chaining */
{ d: 29, title: 'then returns a new promise',
  caps: [
    [0.3, 'then always returns a brand-new promise, so each step can hang off the one before: a chain.'],
    [7, 'Whatever a handler returns becomes the value of the next link. Return a promise, and the chain waits for it.'],
    [13, 'A throw becomes a rejection. It skips every then handler until it reaches a catch.'],
    [19, 'catch can recover by returning a value. finally runs either way, and passes the result through.'],
    [24.5, 'The console shows: caught boom 2, then finally, then final 10.']],
  draw: function (K, t) {
    var P = K.P, code = ['Promise.resolve(1)', '  .then((x) => x + 1)', '  .then((x) => { throw new Error("boom " + x); })', '  .then(() => log("skipped"))',
      '  .catch((e) => { log("caught", e.message); return 10; })', '  .finally(() => log("finally"))', '  .then((v) => log("final", v));'];
    var hi = t > 24.5 ? -1 : t > 21.5 ? 5 : t > 19 ? 4 : t > 15.2 ? 3 : t > 13 ? 2 : t > 7 ? 1 : -1;
    K.panel(40, 84, 720, 300, 'chain.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 130, { size: 20, n: K.typed(t, code, [0.6, 1.4, 2.2, 3.6, 4.4, 5.6, 6.2], 40), t: t, hi: hi, w: 690, a: K.p(t, 0.2) });
    K.text('each link is a new promise', 1010, 110, { size: 18, color: P.muted, align: 'center', a: K.p(t, 3) });
    /* value badges, one per link, aligned with the code lines */
    var B = [['1', P.green, 'fulfilled', 2], ['2', P.green, 'fulfilled', 8], ['Error', P.red, 'rejected', 13.6], ['skip', P.muted, 'handler skipped', 15.4],
             ['10', P.green, 'recovered', 19.4], ['10', P.green, 'passed through', 22], ['10', P.green, 'final value', 23]];
    B.forEach(function (b, i) {
      var y = 141 + i * 35, q = K.back((t - b[3]) / 0.5);
      if (q <= 0) return;
      K.chip(b[0], 850, y, { mono: true, size: 16, stroke: b[1], color: b[1], s: q });
      K.text(b[2], 910, y, { size: 17, color: i === 3 ? P.muted : P.ink, a: K.clamp(q) });
      if (i) K.arrow(850, y - 26, 850, y - 18, { color: P.line, lw: 2, head: 8, a: K.clamp(q) });
    });
    K.curve(800, 211, 772, 246, 800, 281, { p: K.p(t, 14.6, 0.8), color: P.red, dash: [6, 6], lw: 2.5 });
    var n = K.p(t, 9.6);
    K.box(800, 400, 440, 100, { fill: P.code, stroke: P.line, a: n * (1 - K.p(t, 13, 0.4)) });
    K.text('return value  →  next value', 824, 432, { size: 18, a: n * (1 - K.p(t, 13, 0.4)) });
    K.text('return a promise  →  next link waits', 824, 470, { size: 18, color: P.acc, a: K.p(t, 10.6) * (1 - K.p(t, 13, 0.4)) });
    K.text('throw  →  jump to the next catch', 824, 432, { size: 18, color: P.red, a: K.win(t, 13.6, 19) });
    K.text('finally gets no argument', 824, 432, { size: 18, color: P.muted, a: K.p(t, 21.8) });
    K.panel(40, 404, 720, 176, 'Console', { a: K.p(t, 24.5) });
    [['caught boom 2', 25], ['finally', 26.2], ['final 10', 27.2]].forEach(function (o, i) {
      K.text(o[0], 70, 460 + i * 38, { size: 21, mono: true, color: i === 0 ? P.red : P.ink, a: K.p(t, o[1], 0.3) });
    });
  } },

/* 9 ─ promisify and unhandled rejections */
{ d: 24, title: 'Promisify, and always catch',
  caps: [
    [0.3, 'Wrap an old callback API once, at the edge. A sleep helper is just setTimeout inside new Promise.'],
    [6.5, 'In Node, util.promisify converts error-first functions, and node:fs/promises already returns promises.'],
    [12.5, 'A rejection that nobody handles fires unhandledrejection in the browser, and crashes Node by default.'],
    [18.5, 'So return promises from your handlers, reject with Error objects, and end every chain with a catch.']],
  draw: function (K, t) {
    var P = K.P, s = ['const sleep = (ms) =>', '  new Promise((resolve) => setTimeout(resolve, ms));', '', 'sleep(500).then(() => log("half a second later"));'];
    K.panel(40, 84, 680, 190, 'sleep.js', { a: K.p(t, 0.2) });
    K.code(s, 66, 128, { size: 19, lh: 1.5, n: K.typed(t, s, [0.8, 1.6, 3.4, 3.5], 34), t: t, a: K.p(t, 0.2) });
    var n = ['import { promisify } from "node:util";', 'import { readFile } from "node:fs/promises";', '', 'const text = await readFile("a.txt", "utf8");'];
    var a = K.p(t, 6.6);
    K.panel(740, 84, 500, 190, 'Node', { a: a });
    K.code(n, 762, 128, { size: 17, lh: 1.5, n: K.typed(t, n, [7, 8.4, 9.8, 9.9], 34), t: t, a: a });
    var w1 = K.win(t, 2.4, 12.4), w2 = K.win(t, 8.6, 12.4);
    [['setTimeout(cb, ms)', P.warm], ['new Promise wrapper', P.acc], ['sleep(ms) → Promise', P.green]].forEach(function (c, i) {
      K.chip(c[0], 200 + i * 380, 360, { mono: i !== 1, size: 19, stroke: c[1], a: Math.min(w1, K.p(t, 2.4 + i * 0.8)) });
      if (i) K.arrow(200 + i * 380 - 150, 360, 200 + i * 380 - 118, 360, { p: K.p(t, 2.2 + i * 0.8, 0.4), color: P.muted, a: w1 });
    });
    [['fs.readFile(path, cb)', P.warm], ['promisify(fn)', P.acc], ['returns a Promise', P.green]].forEach(function (c, i) {
      K.chip(c[0], 200 + i * 380, 470, { mono: i !== 2, size: 19, stroke: c[1], a: Math.min(w2, K.p(t, 8.8 + i * 0.8)) });
      if (i) K.arrow(200 + i * 380 - 150, 470, 200 + i * 380 - 118, 470, { p: K.p(t, 8.6 + i * 0.8, 0.4), color: P.muted, a: w2 });
    });
    var e = K.p(t, 12.6), bad = ['fetch(url).then((r) => r.json());   // no catch'];
    K.panel(40, 300, 680, 280, '', { a: e, stroke: P.red });
    K.code(bad, 66, 322, { size: 19, n: K.typed(t, bad, [12.8], 40), t: t, a: e });
    K.mark(80, 400, false, 0.8, K.p(t, 14.4));
    K.text('Browser console', 106, 400, { size: 17, color: P.muted, weight: 700, a: K.p(t, 14.4) });
    K.text('Uncaught (in promise) TypeError:', 106, 434, { size: 18, mono: true, color: P.red, a: K.p(t, 14.8) });
    K.text('Failed to fetch', 106, 460, { size: 18, mono: true, color: P.red, a: K.p(t, 14.8) });
    K.mark(80, 506, false, 0.8, K.p(t, 16));
    K.text('Node', 106, 506, { size: 17, color: P.muted, weight: 700, a: K.p(t, 16) });
    K.text('unhandled rejection: process exits, code 1', 106, 540, { size: 18, mono: true, color: P.red, a: K.p(t, 16.4) });
    K.text('Habits', 760, 330, { size: 22, weight: 700, color: P.acc, a: K.p(t, 18.6) });
    ['return promises from handlers', 'reject with Error objects', 'end every chain with .catch', 'promisify once, at the edge'].forEach(function (h, i) {
      var q = K.p(t, 19 + i * 1, 0.5), y = 384 + i * 52;
      K.mark(780, y, true, 0.8, q); K.text(h, 806 - (1 - q) * 16, y, { size: 20, a: q });
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 11 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Callbacks can be sync (forEach) or async (setTimeout)',
     'Error-first callbacks, nesting and repeated error checks',
     'Promises settle once: pending, then fulfilled or rejected',
     'The executor runs now; then callbacks run later as microtasks',
     'then returns a new promise; a throw skips ahead to catch'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 11 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
