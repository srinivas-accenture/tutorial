/* Day 45 in motion: breakpoints and stepping, breakpoint types, the console API, Network and Node inspector, structured logs,
   and a debugging method: reproduce, minimize, hypothesize, bisect, fix and prevent. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day45', {
  kicker: 'JavaScript: Zero to Architect · Day 45',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 45: debugging tools, and a method that finds bugs systematically.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Debugging', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 45 · Tools and a method', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Breakpoints and stepping', 'Console power tools', 'Reproduce · minimize · bisect'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 350 + i * 290, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ breakpoints and stepping */
{ d: 26, title: 'Breakpoints and stepping',
  caps: [
    [0.3, 'A debugger is a pause button and a magnifying glass. Set a breakpoint, and execution freezes on that line.'],
    [6.5, 'While paused, the Scope panel shows local, closure and global variables, and the Call Stack shows how you got here.'],
    [13, 'Step over runs the line, step into enters a call, step out finishes the function. Resume runs to the next breakpoint.'],
    [19.5, 'Async stack traces include the awaiting chain. A debugger statement pauses right there whenever DevTools is open.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['function checkout(cart) {', '  const total = calcTotal(cart.items);', '  return applyDiscount(total, cart.code);', '}', 'function calcTotal(items) {', '  let total = 0;',
      '  for (const it of items) total += it.price * it.qty;', '  return total;', '}'];
    K.panel(40, 90, 720, 380, 'Sources · cart.js', { a: K.p(t, 0.2) });
    /* current line over time: paused at 6 (index 6), step over → 7, step out → back in checkout line 1, step over → 2 */
    var cur = t < 2 ? -1 : t < 14.2 ? 6 : t < 15.6 ? 7 : t < 17 ? 1 : 2;
    K.code(code, 104, 132, { size: 19, lh: 1.6, t: t, hi: cur, w: 640, a: K.p(t, 0.2) });
    code.forEach(function (_, i) { if (i === 6 && t > 1.2) return; K.text(String(i + 1), 72, 132 + i * 30 + 11, { size: 15, mono: true, color: P.muted, align: 'right', a: K.p(t, 0.2) }); });
    var bp = K.back((t - 1.2) / 0.5);
    if (bp > 0) { g.save(); g.fillStyle = P.blue; g.globalAlpha *= K.clamp(bp); g.beginPath(); g.moveTo(44, 314); g.lineTo(78, 314); g.lineTo(88, 323); g.lineTo(78, 332); g.lineTo(44, 332); g.closePath(); g.fill(); g.restore();
      K.text('7', 66, 323, { size: 14, mono: true, weight: 700, align: 'center', color: P.bg, a: K.clamp(bp) }); }
    K.chip('Paused on breakpoint', 400, 500, { size: 18, stroke: P.warm, color: P.warm, a: K.p(t, 2.2) });
    var sa = K.p(t, 7);
    K.panel(790, 90, 450, 190, 'Scope', { a: sa });
    var inCo = t >= 15.6, SC = inCo ? [['Local', 'cart: { items, code }', 7.4], ['', 'total: 60', 7.9], ['', '', 8.4], ['Global', 'window', 8.9]]
      : [['Local', 'items: Array(3)', 7.4], ['', 'it: { price: 10, qty: 2 }', 7.9], ['', 'total: 20', 8.4], ['Global', 'window', 8.9]];
    SC.forEach(function (r, i) {
      var y = 140 + i * 34, q = K.p(t, r[2], 0.4) * sa;
      if (r[0]) K.text(r[0], 810, y, { size: 16, weight: 700, color: P.muted, a: q });
      K.text(r[1], 890, y, { size: 18, mono: true, color: i === 2 ? P.warm : P.ink, a: q });
    });
    var ca = K.p(t, 9.6);
    K.panel(790, 300, 450, 170, 'Call Stack', { a: ca });
    var CS = [['calcTotal', 'cart.js:7'], ['checkout', 'cart.js:2'], ['onPayClick', 'app.js:31'], ['async · await submit()', 'form.js:12']];
    if (inCo) CS = [['checkout', 'cart.js:' + (t < 17 ? 2 : 3)], ['onPayClick', 'app.js:31'], ['async · await submit()', 'form.js:12']];
    CS.forEach(function (r, i) {
      var y = 350 + i * 30, q = K.p(t, (r[0].indexOf('async') < 0 ? 10 + i * 0.4 : 20), 0.4);
      K.text((i === 0 ? '▸ ' : '  ') + r[0], 810, y, { size: 17, mono: true, color: r[0].indexOf('async') === 0 ? P.purple : i === 0 ? P.warm : P.ink, a: q });
      K.text(r[1], 1220, y, { size: 15, mono: true, color: P.muted, align: 'right', a: q });
    });
    var B = [['▶', 'resume'], ['⤼', 'step over'], ['↓', 'step into'], ['↑', 'step out']], on = t > 13.4 && t < 14.6 ? 1 : t > 14.8 && t < 16 ? 3 : t > 16.2 && t < 17.4 ? 1 : -1;
    B.forEach(function (b, i) {
      var x = 820 + i * 108, q = K.p(t, 13.2 + i * 0.25, 0.4);
      K.box(x - 30, 494, 60, 48, { stroke: on === i ? P.warm : P.line, lw: on === i ? 3 : 2, a: q });
      K.text(b[0], x, 518, { size: 24, align: 'center', color: on === i ? P.warm : P.ink, a: q });
      K.text(b[1], x, 562, { size: 15, color: P.muted, align: 'center', a: q });
    });
    K.code(['debugger;  // pauses when DevTools is open'], 60, 548, { size: 19, a: K.p(t, 21.6) });
  } },

/* 3 ─ breakpoint types */
{ d: 25, title: 'Breakpoint types',
  caps: [
    [0.3, 'Breakpoints come in many types. A conditional breakpoint pauses only when an expression is true.'],
    [7, 'A logpoint prints a message without pausing, and without editing the code.'],
    [12.5, 'You can also break on DOM changes, on fetch requests to a URL, on event listeners like click, and on exceptions.'],
    [19, 'Ignore-list library scripts so stepping skips them, and use source maps to debug your original code instead of the bundle.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['for (const order of orders) {', '  const fee = shipping(order);', '  cart.add(order, fee);', '}'];
    K.panel(40, 90, 640, 200, 'orders.js', { a: K.p(t, 0.2) });
    K.code(code, 104, 134, { size: 20, lh: 1.6, a: K.p(t, 0.2) });
    function marker(y, col, a) { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.moveTo(46, y - 10); g.lineTo(80, y - 10); g.lineTo(90, y); g.lineTo(80, y + 10); g.lineTo(46, y + 10); g.closePath(); g.fill(); g.restore(); }
    marker(178, P.warm, K.p(t, 1.4));
    K.box(720, 110, 520, 100, { stroke: P.warm, a: K.p(t, 2.2) });
    K.text('Conditional breakpoint', 744, 136, { size: 17, color: P.warm, weight: 700, a: K.p(t, 2.2) });
    K.text('order.total > 1000 && user.isGuest', 744, 176, { size: 20, mono: true, a: K.p(t, 2.8) });
    K.arrow(700, 160, 640, 176, { p: K.p(t, 2.4, 0.4), color: P.warm, lw: 2, head: 9 });
    K.text('pauses on 1 order out of 5,000', 744, 236, { size: 17, color: P.muted, a: K.p(t, 4.2) });
    marker(210, P.purple, K.p(t, 7.4));
    K.box(720, 270, 520, 100, { stroke: P.purple, a: K.p(t, 7.8) });
    K.text('Logpoint', 744, 296, { size: 17, color: P.purple, weight: 700, a: K.p(t, 7.8) });
    K.text('"fee", fee, order.id', 744, 336, { size: 20, mono: true, a: K.p(t, 8.2) });
    K.arrow(700, 300, 640, 212, { p: K.p(t, 7.8, 0.4), color: P.purple, lw: 2, head: 9 });
    K.panel(40, 310, 640, 90, 'Console', { a: K.p(t, 9) });
    K.text('fee 4.99 A-1001    fee 0 A-1002', 64, 370, { size: 19, mono: true, color: P.muted, a: K.p(t, 9.6) });
    var T = [['DOM: subtree modified', P.blue], ['fetch: URL contains /api/pay', P.blue], ['Event: click', P.blue], ['Pause on uncaught exceptions', P.red]];
    T.forEach(function (c, i) { K.chip(c[0], 200 + (i % 2) * 480, 440 + Math.floor(i / 2) * 56, { size: 18, stroke: c[1], a: K.win(t, 12.8 + i * 0.6, 19.2) }); });
    var s = K.p(t, 19.3);
    K.box(720, 400, 520, 70, { fill: P.code, stroke: P.line, a: s });
    K.text('node_modules/…  ignored when stepping', 744, 435, { size: 18, mono: true, color: P.muted, a: s });
    K.chip('bundle.min.js', 830, 530, { mono: true, size: 18, stroke: P.line, a: K.p(t, 20.4) });
    K.arrow(920, 530, 1010, 530, { p: K.p(t, 20.8, 0.4), color: P.green });
    K.text('source map', 965, 506, { size: 15, color: P.green, align: 'center', a: K.p(t, 20.8) });
    K.chip('cart.ts:42', 1100, 530, { mono: true, size: 18, stroke: P.green, a: K.p(t, 21.2) });
  } },

/* 4 ─ the console API */
{ d: 25, title: 'Console power tools',
  caps: [
    [0.3, 'The console is more than log. console.table shows an array of objects as a sortable table.'],
    [6.5, 'group nests related logs, time and timeEnd measure a block, count counts calls, and assert logs only when a condition fails.'],
    [13, 'DevTools adds helpers: $0 is the selected element, $$ selects all matches, and copy puts a value on the clipboard.'],
    [19, 'Careful: a logged object shows its state when you expand it, not when it was logged. Snapshot it with structuredClone.']],
  draw: function (K, t) {
    var P = K.P;
    K.panel(40, 90, 1200, 490, 'Console', { a: K.p(t, 0.2) });
    var ta = K.p(t, 1);
    K.code(['> console.table(users)'], 64, 128, { size: 19, a: ta });
    var R = [['(index)', 'name', 'role'], ['0', 'Ana', 'admin'], ['1', 'Ben', 'editor']];
    R.forEach(function (r, i) {
      r.forEach(function (c, k) {
        var x = 64 + k * 150, y = 166 + i * 32, q = K.p(t, 1.6 + i * 0.3, 0.3);
        K.box(x, y, 150, 32, { r: 0, fill: i ? P.code : P.card, stroke: P.line, lw: 1, a: q });
        K.text(c, x + 10, y + 16, { size: 16, mono: true, color: i ? P.ink : P.muted, a: q });
      });
    });
    var L = [['> console.group("checkout")', P.ink, 7], ['  ▾ checkout', P.acc, 7.6], ['      console.time("calc") … console.timeEnd("calc")', P.muted, 8.4], ['      calc: 3.42 ms', P.ink, 9.2],
             ['  > console.count("render")      render: 3', P.ink, 10.2], ['  > console.assert(cart.total >= 0, "negative total")', P.ink, 11], ['  ✖ Assertion failed: negative total', P.red, 11.8]];
    L.forEach(function (l, i) { K.text(l[0], 560, 130 + i * 34, { size: 17, mono: true, color: l[1], a: K.p(t, l[2], 0.4) }); });
    var H = [['$0', 'the element selected in Elements', 13.4], ['$$("img").filter((i) => !i.alt)', 'images without alt text', 14.4], ['copy(data)', 'value → clipboard', 15.4]];
    H.forEach(function (h, i) {
      var y = 366 + i * 32, q = K.p(t, h[2], 0.4);
      K.text('> ' + h[0], 64, y, { size: 18, mono: true, a: q });
      K.text('// ' + h[1], 500, y, { size: 17, mono: true, color: P.muted, a: q });
    });
    var w = K.p(t, 19.3);
    K.box(64, 470, 1150, 100, { fill: 'rgba(246,173,85,.08)', stroke: P.warm, a: w });
    K.code(['const user = { name: "Ana" };', 'console.log(user);   user.name = "Ben";   // expands as { name: "Ben" }', 'console.log(structuredClone(user));      // a true snapshot'], 88, 482, { size: 18, lh: 1.45, a: w });
  } },

/* 5 ─ network, node and logs */
{ d: 25, title: 'Network, Node and logs',
  caps: [
    [0.3, 'The Network panel shows every request: a waterfall of timings, headers, payloads, throttling, and copy as cURL.'],
    [7, 'In Node, run node --inspect, or --inspect-brk to pause on the first line, then attach Chrome DevTools or VS Code.'],
    [13.5, 'Production bugs need logs: structured JSON with levels and request IDs, so you can filter and follow one request.'],
    [19.5, 'Chain errors with cause, so the root problem survives: checkout failed, because payment was declined, because the card expired.']],
  draw: function (K, t) {
    var P = K.P;
    K.panel(40, 90, 620, 250, 'Network', { a: K.p(t, 0.2) });
    var N = [['app.js', 0, 120, P.blue], ['styles.css', 10, 90, P.purple], ['/api/cart', 130, 210, P.warm], ['logo.png', 60, 60, P.green], ['/api/pay', 350, 150, P.red]];
    N.forEach(function (n, i) {
      var y = 140 + i * 36, q = K.p(t, 0.8 + i * 0.4, 0.4);
      K.text(n[0], 64, y, { size: 17, mono: true, color: i === 4 ? P.red : P.ink, a: q });
      K.box(220 + n[1] * 0.75, y - 9, n[2] * 0.75 * K.p(t, 1 + i * 0.4, 0.6), 18, { fill: n[3], r: 4, a: q * 0.85 });
    });
    K.text('500 · 412 ms', 640, 312, { size: 16, mono: true, color: P.red, align: 'right', a: K.p(t, 3.4) });
    K.chip('Slow 4G', 120, 312, { size: 15, stroke: P.line, a: K.p(t, 4) }); K.chip('Copy as cURL', 260, 312, { size: 15, stroke: P.line, a: K.p(t, 4.4) });
    K.panel(700, 90, 540, 250, 'Terminal', { a: K.p(t, 7) });
    var tc = ['$ node --inspect-brk server.js', 'Debugger listening on ws://127.0.0.1:9229/…', 'For help, see: https://nodejs.org/en/docs/inspector'];
    K.code(tc, 724, 130, { size: 16, lh: 1.7, n: K.typed(t, tc, [7.4, 9, 9.4], 40), t: t, a: K.p(t, 7) });
    K.chip('chrome://inspect', 830, 280, { mono: true, size: 17, stroke: P.green, a: K.p(t, 10.6) });
    K.chip('VS Code: Attach', 1080, 280, { size: 17, stroke: P.blue, a: K.p(t, 11.2) });
    var lg = ['{"level":"info","msg":"user logged in","userId":42,"req":"r-81"}', '{"level":"error","msg":"payment failed","orderId":"o1","req":"r-81"}'];
    K.panel(40, 370, 1200, 100, '', { a: K.p(t, 13.6) });
    K.code(lg, 64, 386, { size: 18, lh: 1.6, n: K.typed(t, lg, [14, 15.6], 60), t: t, a: K.p(t, 13.6), marks: t > 17 && t < 19.5 ? { 1: 'rgba(252,129,129,.16)' } : null, w: 1150 });
    var C = [['checkout failed', P.ink], ['payment declined', P.warm], ['card expired', P.red]];
    C.forEach(function (c, i) {
      var x = 200 + i * 400, q = K.p(t, 20 + i * 0.8, 0.4);
      K.chip(c[0], x, 530, { size: 20, stroke: c[1], a: q });
      if (i) K.arrow(x - 400 + 110, 530, x - 110, 530, { p: q, color: P.muted });
      if (i) K.text('cause', x - 200, 506, { size: 15, mono: true, color: P.muted, align: 'center', a: q });
    });
  } },

/* 6 ─ the method */
{ d: 24, title: 'A debugging method',
  caps: [
    [0.3, 'Tools help, but a method finds bugs. Step one: reproduce it on demand, with the exact steps, inputs and versions.'],
    [6.5, 'Two: minimize. Cut the input, code and dependencies down to the smallest case that still fails.'],
    [12, 'Three: hypothesize. Make a specific guess you could prove wrong, and predict what you would see.'],
    [17.5, 'Then experiment one change at a time, fix the root cause with a regression test, and prevent the whole class of bug.']],
  draw: function (K, t) {
    var P = K.P;
    var S = [['Reproduce', 'on demand', P.acc], ['Minimize', 'smallest failing case', P.acc], ['Hypothesize', 'a falsifiable guess', P.blue], ['Experiment', 'one change at a time', P.blue], ['Fix + test', 'root cause + test', P.green], ['Prevent', 'catch it earlier', P.purple]];
    var cur = t > 20.6 ? 5 : t > 19.2 ? 4 : t > 17.6 ? 3 : t > 12 ? 2 : t > 6.5 ? 1 : 0;
    S.forEach(function (s, i) {
      var x = 120 + i * 208, q = K.back((t - 0.6 - i * 0.3) / 0.5), on = i === cur;
      if (q <= 0) return;
      K.g.save(); K.g.translate(x, 150); K.g.scale(q, q);
      K.box(-96, -46, 192, 92, { stroke: on ? s[2] : P.line, lw: on ? 3.5 : 2, fill: on ? 'rgba(79,209,197,.08)' : P.card, a: K.clamp(q) });
      K.text((i + 1) + '. ' + s[0], 0, -12, { size: 19, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(s[1], 0, 20, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(x - 112, 150, x - 98, 150, { p: K.p(t, 0.6 + i * 0.3, 0.4), color: P.muted, head: 8, lw: 2 });
    });
    var r = K.win(t, 1.4, 6.6);
    K.panel(60, 250, 1160, 300, 'repro.md', { a: r });
    K.code(['1. Log in as a guest user', '2. Add 3 items, apply code SAVE10', '3. Click Pay  →  total shows NaN', 'Chrome 131 · Windows · build 2026.11.3'], 90, 296, { size: 21, lh: 1.7, a: r });
    var m = K.win(t, 6.7, 12.1), items = ['user', 'cart', 'coupon', 'tax', 'shipping', 'currency', 'locale', 'theme'];
    items.forEach(function (it, i) {
      var keep = it === 'coupon' || it === 'cart', gone = keep ? 0 : K.p(t, 8 + i * 0.3, 0.5);
      K.chip(it, 160 + (i % 4) * 300, 320 + Math.floor(i / 4) * 80, { size: 20, stroke: keep ? P.warm : P.line, a: m * (1 - gone * 0.85) });
    });
    K.text('still fails with just cart + coupon', 640, 500, { size: 20, color: P.warm, align: 'center', a: K.p(t, 10.4) * m });
    var h = K.win(t, 12.2, 17.7);
    K.box(160, 290, 960, 200, { stroke: P.blue, a: h });
    K.text('Guess: the coupon makes discount undefined,', 190, 336, { size: 22, a: h });
    K.text('so total - undefined → NaN.', 190, 376, { size: 22, a: h });
    K.text('Predict: discount is undefined at the breakpoint.', 190, 436, { size: 20, color: P.blue, a: K.p(t, 14) * h });
    var f = K.p(t, 17.8);
    K.panel(60, 260, 760, 280, 'cart.test.js', { a: f });
    K.code(['test("coupon SAVE10 gives a number", () => {', '  const cart = makeCart([10, 20, 30]);', '  expect(total(cart, "SAVE10")).toBe(54);', '});'], 84, 304, { size: 19, lh: 1.7, a: f });
    K.text('fails before the fix ✗ → passes after ✓', 84, 500, { size: 19, color: P.green, a: K.p(t, 19.6) });
    K.chip('types', 960, 330, { size: 19, stroke: P.purple, a: K.p(t, 20.8) });
    K.chip('assertions', 1100, 330, { size: 19, stroke: P.purple, a: K.p(t, 21.2) });
    K.chip('monitoring', 1030, 400, { size: 19, stroke: P.purple, a: K.p(t, 21.6) });
  } },

/* 7 ─ bisect and minimize */
{ d: 25, title: 'Bisect and minimize',
  caps: [
    [0.3, 'Bisect is binary search over anything: commits, data or code paths. Test the middle, then keep the half that fails.'],
    [7.5, 'Among 1000 versions, the first bad one, 637, is found in just 10 steps, because log2 of 1000 is about 10.'],
    [14.5, 'git bisect automates it: mark one good and one bad commit, and git checks out the midpoint each time.'],
    [20, 'Delta debugging shrinks the input the same way: from 10 items down to just 3 and 7, the pair that triggers the bug.']],
  draw: function (K, t) {
    var P = K.P;
    var I = [[0, 999], [500, 999], [500, 749], [625, 749], [625, 687], [625, 656], [625, 640], [633, 640], [637, 640], [637, 638], [637, 637]];
    var step = Math.max(0, Math.min(10, Math.floor((t - 2) / 1.1)));
    if (t < 2) step = 0;
    var X0 = 80, W = 1120, sx = function (v) { return X0 + v / 999 * W; };
    var la = K.p(t, 0.6);
    K.box(X0, 150, W, 14, { fill: P.line, r: 7, a: la });
    K.text('v0', X0, 196, { size: 16, mono: true, color: P.muted, align: 'center', a: la });
    K.text('v999', X0 + W, 196, { size: 16, mono: true, color: P.muted, align: 'center', a: la });
    K.box(sx(637), 150, sx(999) - sx(637), 14, { fill: P.red, r: 7, a: K.p(t, 1.4) * 0.35 });
    var iv = I[step];
    K.box(sx(iv[0]) - 3, 140, Math.max(6, sx(iv[1]) - sx(iv[0]) + 6), 34, { fill: 'rgba(246,173,85,.22)', stroke: P.warm, r: 8, a: K.p(t, 1.6) });
    if (step < 10 && t > 2) { var mid = (iv[0] + iv[1]) >> 1; K.arrow(sx(mid), 116, sx(mid), 138, { color: P.warm, head: 9, lw: 2 }); K.text('test v' + mid, sx(mid), 102, { size: 16, mono: true, color: P.warm, align: 'center' }); }
    K.text('steps: ' + step, 80, 240, { size: 24, mono: true, color: P.warm, a: K.p(t, 2) });
    K.text('range: v' + iv[0] + ' … v' + iv[1], 300, 240, { size: 22, mono: true, a: K.p(t, 2) });
    var fnd = K.p(t, 13.2);
    K.chip('first bad: v637 · 10 steps · log₂ 1000 ≈ 10', 900, 240, { size: 19, stroke: P.green, color: P.green, a: fnd });
    var gc = ['$ git bisect start', '$ git bisect bad HEAD', '$ git bisect good v2.3.0', 'Bisecting: 61 revisions left to test (about 6 steps)', '$ git bisect run npm test'];
    K.panel(40, 290, 640, 290, 'Terminal', { a: K.p(t, 14.6) });
    K.code(gc, 64, 332, { size: 18, lh: 1.7, n: K.typed(t, gc, [14.9, 15.8, 16.6, 17.6, 18.6], 40), t: t, a: K.p(t, 14.6) });
    var da = K.p(t, 20.2);
    K.text('minimize([1 … 10], buggy)', 720, 320, { size: 19, mono: true, a: da });
    for (var i = 1; i <= 10; i++) {
      var keep = i === 3 || i === 7, gone = keep ? 0 : K.p(t, 21 + i * 0.22, 0.4), x = 740 + ((i - 1) % 5) * 96, y = 380 + Math.floor((i - 1) / 5) * 70;
      K.chip(String(i), x, y, { mono: true, size: 22, stroke: keep ? P.warm : P.line, color: keep ? P.warm : P.ink, a: da * (1 - gone * 0.85) });
    }
    K.text('→ [3, 7]', 1060, 556, { size: 22, mono: true, color: P.green, a: K.p(t, 23.6) });
  } },

/* 8 ─ common bug classes */
{ d: 26, title: 'Usual suspects',
  caps: [
    [0.3, 'Check the usual suspects first. Async: a missing await, or forEach with an async callback that nobody waits for.'],
    [7, 'Stale closures and lost this. And shared objects mutated somewhere else, like sort on an array someone else owns.'],
    [13.5, 'Coercion: a string from an input or JSON mixed with a number, or a falsy check that rejects 0 and the empty string.'],
    [19.5, 'Floats like 0.1 + 0.2, time zones, and the environment: caches, a service worker serving old code, different versions.']],
  draw: function (K, t) {
    var P = K.P;
    var C = [['async', ['items.forEach(async (i) => await save(i));', 'done();   // runs before any save'], P.warm, 0.8],
             ['lost this', ['setTimeout(cart.clear, 0);', '// this is undefined inside clear'], P.purple, 7.4],
             ['mutation', ['const sorted = shared.sort();', '// shared is now sorted too'], P.purple, 9.6],
             ['coercion', ['qty + 1     // "5" + 1 → "51"', 'if (!qty)   // rejects 0 too'], P.blue, 13.8],
             ['floats + time', ['0.1 + 0.2   // 0.30000000000000004', 'new Date().getHours() // whose zone?'], P.red, 19.8],
             ['environment', ['service worker serves old app.js', 'Node 18 locally, 22 in CI'], P.red, 21.6]];
    C.forEach(function (c, i) {
      var x = 40 + (i % 2) * 610, y = 90 + Math.floor(i / 2) * 166, q = K.p(t, c[3], 0.5);
      K.box(x, y, 590, 150, { stroke: c[2], a: q });
      K.text(c[0], x + 22, y + 28, { size: 19, weight: 700, color: c[2], a: q });
      K.code(c[1], x + 22, y + 56, { size: 18, lh: 1.6, a: q });
    });
  } },

/* 9 ─ differential debugging and rubber duck */
{ d: 21, title: 'Compare, explain, tell',
  caps: [
    [0.3, 'Differential debugging: compare a working case with a failing one, and focus on the first difference.'],
    [7, 'Rubber duck debugging: explain the code aloud, line by line. The gap in your explanation is often the bug.'],
    [13, 'In interviews, tell it as a story: how you reproduced it, narrowed it down, proved the cause and prevented a repeat.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var A = ['a: 1', 'mode: "fast"', 'c: 3'], B = ['a: 1', 'mode: "safe"', 'c: 3'];
    K.panel(60, 90, 340, 190, 'good config', { a: K.p(t, 0.6), stroke: P.green });
    K.panel(440, 90, 340, 190, 'bad config', { a: K.p(t, 1), stroke: P.red });
    A.forEach(function (l, i) {
      var y = 150 + i * 40, diff = i === 1 && t > 3.4;
      K.text(l, 90, y, { size: 21, mono: true, color: diff ? P.warm : P.ink, a: K.p(t, 1.4 + i * 0.3, 0.4) });
      K.text(B[i], 470, y, { size: 21, mono: true, color: diff ? P.warm : P.ink, a: K.p(t, 1.6 + i * 0.3, 0.4) });
    });
    K.box(70, 172, 700, 38, { fill: false, stroke: P.warm, dash: [6, 5], a: K.p(t, 3.6) });
    K.text('firstDiff(good, bad) → "mode"', 820, 190, { size: 20, mono: true, color: P.warm, a: K.p(t, 4.4) });
    var d = K.back((t - 7.4) / 0.6);
    if (d > 0) {
      g.save(); g.translate(180, 420); g.scale(d, d); g.fillStyle = '#f6e05e';
      g.beginPath(); g.ellipse(0, 20, 70, 46, 0, 0, 7); g.fill();
      g.beginPath(); g.arc(46, -34, 36, 0, 7); g.fill();
      g.fillStyle = P.warm; g.beginPath(); g.moveTo(78, -36); g.lineTo(112, -28); g.lineTo(78, -20); g.closePath(); g.fill();
      g.fillStyle = P.bg; g.beginPath(); g.arc(56, -44, 5, 0, 7); g.fill(); g.restore();
    }
    var say = ['"First we read the cart…"', '"…then apply the coupon…"', '"…which returns… wait."'];
    say.forEach(function (s, i) { K.text(s, 330, 360 + i * 40, { size: 20, color: i === 2 ? P.warm : P.ink, a: K.p(t, 8.4 + i * 1.2, 0.4) * (1 - K.p(t, 13, 0.5)) }); });
    var S = ['Reproduced', 'Narrowed down', 'Proved the cause', 'Prevented a repeat'];
    S.forEach(function (s, i) {
      var x = 420 + i * 220, q = K.p(t, 13.6 + i * 0.7, 0.4);
      K.chip(s, x, 520, { size: 18, stroke: P.acc, a: q });
      if (i) K.arrow(x - 130, 520, x - 92, 520, { p: q, color: P.muted, head: 8, lw: 2 });
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 45 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Breakpoints, Scope, Call Stack and stepping beat guessing',
     'Conditional breakpoints and logpoints find the one bad case',
     'console.table, group, time, assert; snapshot logged objects',
     'Reproduce, minimize, hypothesize, experiment, fix with a test, prevent',
     'Bisect commits and inputs; check the usual JavaScript suspects'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(190, y, true, 0.9, q);
      K.text(s, 222 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 45 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
