/* Day 28 in motion: patterns as functions (Strategy, Decorator), middleware, Adapter/Facade/DI, kinds of state,
   unidirectional flow with a pure reducer, immutable updates and derived state, signals, and state machines.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day28', {
  kicker: 'JavaScript: Zero to Architect · Day 28',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 28: design patterns the JavaScript way, and how to structure application state.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Patterns & state', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 28 · Shared vocabulary, predictable data', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Design patterns', 'Reducers', 'Signals · machines'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ patterns are functions */
{ d: 24, title: 'Patterns as functions',
  caps: [
    [0.3, 'Design patterns are shared names for problems that keep coming back. In JavaScript, many of them are just functions.'],
    [6.5, 'Strategy swaps the algorithm behind one interface: sort takes a compare function, so the caller picks the order.'],
    [13.5, 'Decorator wraps a function to add behavior without changing it. memoize adds a cache; retry and logging work the same way.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, intro = K.win(t, 0.4, 6.4);
    var N = [['Module', 'ES modules'], ['Factory', 'createStore()'], ['Singleton', 'module exports'], ['Observer', 'EventTarget'], ['Strategy', 'sort(compareFn)'],
             ['Decorator', 'memoize(fn)'], ['Middleware', 'next()'], ['Adapter', 'toUser(json)'], ['Facade', 'api.js'], ['DI', 'pass deps in']];
    N.forEach(function (n, i) {
      var x = 50 + (i % 5) * 240, y = 140 + Math.floor(i / 5) * 140, q = Math.min(intro, K.p(t, 0.8 + i * 0.25, 0.5));
      K.box(x, y, 220, 110, { stroke: i === 4 || i === 5 ? P.warm : P.acc, a: q });
      K.text(n[0], x + 110, y + 38, { size: 23, weight: 700, align: 'center', a: q });
      K.text(n[1], x + 110, y + 76, { size: 17, mono: true, color: P.muted, align: 'center', a: q });
    });
    K.text('vocabulary, not goals: add one only for a real problem', 640, 470, { size: 20, color: P.warm, align: 'center', a: Math.min(intro, K.p(t, 3.6)) });
    /* strategy */
    var sc = ['const byPrice = (a, b) => a.price - b.price;', 'const byName = (a, b) => a.name.localeCompare(b.name);', 'items.toSorted(byPrice);', 'items.toSorted(byName);'];
    var s0 = K.p(t, 6.6);
    K.panel(40, 84, 640, 200, 'strategy.js', { a: s0 });
    K.code(sc, 62, 132, { size: 18, lh: 1.6, n: K.typed(t, sc, [6.9, 8.1, 9.6, 11.4], 40), t: t, a: s0, w: 610, hi: t > 11.4 ? 3 : t > 9.6 ? 2 : -1 });
    var items = [['Pen', 3], ['Book', 12], ['Bag', 8]], o1 = [1, 0, 2], o2 = [0, 2, 1], o3 = [1, 2, 0];
    var k1 = K.p(t, 10.2, 0.8), k2 = K.p(t, 12, 0.8);
    items.forEach(function (it, i) {
      var slot = o1[i] + (o2[i] - o1[i]) * k1 + (o3[i] - o2[i]) * k2, x = 730 + slot * 170, lift = Math.sin(Math.PI * (k1 > 0 && k1 < 1 ? k1 : k2 > 0 && k2 < 1 ? k2 : 0)) * 30 * (i % 2 ? 1 : -1);
      K.box(x, 130 + lift, 150, 110, { stroke: P.warm, a: s0 });
      var mv = Math.sin(Math.PI * (k1 > 0 && k1 < 1 ? k1 : k2 > 0 && k2 < 1 ? k2 : 0)), ta = s0 * (1 - Math.min(1, mv * 3));
      K.text(it[0], x + 75, 168 + lift, { size: 22, weight: 700, align: 'center', a: ta });
      K.text('$' + it[1], x + 75, 206 + lift, { size: 20, mono: true, color: P.muted, align: 'center', a: ta });
    });
    K.text(t > 12 ? 'by name' : t > 10.2 ? 'by price' : 'unsorted', 985, 270, { size: 18, color: P.warm, align: 'center', a: s0 });
    /* decorator */
    var dc = ['const memoize = (fn) => {', '  const cache = new Map();', '  return (x) => {', '    if (!cache.has(x)) cache.set(x, fn(x));', '    return cache.get(x);', '  };', '};'];
    var d0 = K.p(t, 13.6);
    K.panel(40, 304, 640, 286, 'memoize.js', { a: d0 });
    K.code(dc, 62, 348, { size: 18, lh: 1.5, n: K.typed(t, dc, [13.9, 14.6, 15.3, 15.9, 17, 17.6, 17.8], 40), t: t, a: d0 });
    K.box(720, 304, 520, 286, { fill: false, stroke: P.purple, dash: [8, 6], a: K.p(t, 15.4) });
    K.text('memoize( slowSquare )', 744, 330, { size: 18, weight: 700, mono: true, color: P.purple, a: K.p(t, 15.4) });
    K.box(780, 360, 220, 70, { stroke: P.acc, a: K.p(t, 15.8) });
    K.text('slowSquare', 890, 395, { size: 20, mono: true, align: 'center', a: K.p(t, 15.8) });
    K.box(1040, 360, 170, 70, { fill: P.code, stroke: P.line, a: K.p(t, 16.2) });
    K.text('cache', 1125, 380, { size: 17, color: P.muted, align: 'center', a: K.p(t, 16.2) });
    K.text('5 → 25', 1125, 408, { size: 18, mono: true, color: P.green, align: 'center', a: K.p(t, 18.8) });
    K.text('f(5)', 744, 476, { size: 20, mono: true, a: K.p(t, 18.2) });
    K.text('computed · 1 s', 820, 476, { size: 18, color: P.warm, a: K.p(t, 18.6) });
    K.text('f(5)', 744, 528, { size: 20, mono: true, a: K.p(t, 20) });
    K.text('cache hit · 0 ms', 820, 528, { size: 18, color: P.green, a: K.p(t, 20.4) });
    K.mark(1000, 528, true, 0.7, K.p(t, 20.6));
  } },

/* 3 ─ middleware */
{ d: 24, title: 'Middleware',
  caps: [
    [0.3, 'Middleware is a chain of functions around a handler. Each one can run code before and after calling next.'],
    [7, 'A request travels inward through logger and auth to the handler, then back out through them, like layers of an onion.'],
    [14, 'Express, Koa and Redux middleware all use this shape: logging, auth, timing and errors as separate layers.'],
    [19, 'Forget to call next, or return early the way auth does without a user, and the chain stops right there.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, code = ['const logger = async (ctx, next) => {', '  const start = Date.now();', '  await next();', '  log(ctx.path, Date.now() - start);', '};',
      'const auth = async (ctx, next) => {', '  if (!ctx.user) return (ctx.status = 401);', '  await next();', '};'];
    K.panel(40, 84, 600, 340, 'middleware.js');
    K.code(code, 62, 132, { size: 18, lh: 1.55, n: K.typed(t, code, [0.8, 1.8, 2.8, 3.6, 4.6, 4.8, 5.6, 6.4, 6.9], 40), t: t, w: 570,
      hi: t > 19.2 ? 6 : t > 10.4 && t < 12 ? 3 : t > 8 && t < 10 ? 2 : -1 });
    var cx = 960, cy = 270;
    K.box(cx - 270, cy - 170, 540, 340, { stroke: P.warm, a: K.p(t, 1) });
    K.text('logger', cx - 250, cy - 146, { size: 19, weight: 700, color: P.warm, a: K.p(t, 1) });
    K.box(cx - 190, cy - 110, 380, 220, { stroke: P.purple, a: K.p(t, 1.6) });
    K.text('auth', cx - 170, cy - 86, { size: 19, weight: 700, color: P.purple, a: K.p(t, 1.6) });
    K.box(cx - 100, cy - 40, 200, 80, { stroke: P.green, a: K.p(t, 2.2) });
    K.text('handler', cx, cy, { size: 22, weight: 700, align: 'center', a: K.p(t, 2.2) });
    K.text('before', cx - 230, cy + 140, { size: 16, color: P.muted, a: K.p(t, 3) });
    K.text('after', cx + 230, cy + 140, { size: 16, color: P.muted, align: 'right', a: K.p(t, 3) });
    /* request path: in from the left, through to the handler, back out to the right */
    K.arrow(cx - 296, cy - 10, cx - 106, cy - 10, { p: K.p(t, 7.4, 1.6), color: P.blue });
    K.arrow(cx + 106, cy + 10, cx + 296, cy + 10, { p: K.p(t, 10.4, 1.6), color: P.green });
    var u1 = K.clamp((t - 7.4) / 1.6), u2 = K.clamp((t - 10.4) / 1.6);
    if (t > 7.4 && t < 12.4) {
      var x = t < 9.2 ? cx - 296 + 190 * u1 : t < 10.4 ? cx : cx + 106 + 190 * u2, y = t < 9.2 ? cy - 10 : t < 10.4 ? cy : cy + 10;
      g.save(); g.fillStyle = P.ink; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.restore();
    }
    K.text('request', cx - 296, cy - 36, { size: 16, color: P.blue, a: K.p(t, 7.4) });
    K.text('response', cx + 296, cy + 36, { size: 16, color: P.green, align: 'right', a: K.p(t, 11.6) });
    [['Express', 150], ['Koa', 290], ['Redux', 420]].forEach(function (c, i) {
      K.chip(c[0], c[1], 470, { size: 20, stroke: P.acc, a: K.p(t, 14.2 + i * 0.4) });
    });
    K.text('one concern per layer: logs, auth, timing, errors', 60, 530, { size: 18, color: P.muted, a: K.p(t, 15.8) });
    var e = K.p(t, 19.4);
    K.box(680, 470, 560, 110, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: e });
    K.mark(714, 504, false, 0.8, e);
    K.text('no user → auth returns 401', 740, 504, { size: 19, color: P.red, a: e });
    K.text('next() is never called: the handler never runs', 714, 548, { size: 17, a: K.p(t, 20.4) });
    if (t > 19.6) {
      var v = K.clamp((t - 19.6) / 1), sx = cx - 296 + 150 * v;
      g.save(); g.globalAlpha *= K.p(t, 19.6, 0.3); g.fillStyle = P.red; g.beginPath(); g.arc(sx, cy - 10, 9, 0, 7); g.fill(); g.restore();
    }
  } },

/* 4 ─ adapter, facade, DI */
{ d: 24, title: 'Adapter, Facade, DI',
  caps: [
    [0.3, 'An adapter translates one interface into another. Convert the API response once, and the rest of the app sees your shape.'],
    [8, 'A facade puts a simple front on a complex subsystem: api.getUser hides fetch, headers, retries and error parsing.'],
    [15, 'Dependency injection passes dependencies in instead of importing them. Production gets the real clock; tests pass a fixed one.']],
  draw: function (K, t) {
    var P = K.P;
    var a = K.p(t, 0.3);
    K.box(40, 84, 1200, 140, { fill: P.code, stroke: P.line, a: a });
    K.text('Adapter', 64, 112, { size: 20, weight: 700, color: P.blue, a: a });
    K.text('{ "user_name": "ana", "created_at": "2026-01-01" }', 64, 168, { size: 17, mono: true, color: P.muted, a: K.p(t, 1) });
    K.arrow(540, 168, 600, 168, { p: K.p(t, 2.6, 0.4), color: P.blue });
    var c = K.back((t - 3) / 0.5); if (c > 0) K.chip('toUser(json)', 680, 168, { s: c, a: K.clamp(c), mono: true, size: 18, stroke: P.blue, color: P.blue });
    K.arrow(760, 168, 820, 168, { p: K.p(t, 3.8, 0.4), color: P.blue });
    K.text('{ name: "ana", createdAt: Date }', 836, 168, { size: 17, mono: true, a: K.p(t, 4.2) });
    K.text('API shape', 64, 202, { size: 16, color: P.muted, a: K.p(t, 5) });
    K.text('your app’s shape', 836, 202, { size: 16, color: P.green, a: K.p(t, 5) });
    var f = K.p(t, 8.2);
    K.box(40, 244, 1200, 150, { fill: P.code, stroke: P.line, a: f });
    K.text('Facade', 64, 272, { size: 20, weight: 700, color: P.warm, a: f });
    K.box(64, 296, 300, 76, { stroke: P.warm, a: K.p(t, 8.6), lw: 3 });
    K.text('api.getUser(7)', 214, 334, { size: 21, mono: true, align: 'center', a: K.p(t, 8.6) });
    K.arrow(370, 334, 436, 334, { p: K.p(t, 9.6, 0.4), color: P.warm });
    K.box(446, 290, 776, 90, { fill: false, stroke: P.line, dash: [6, 6], a: K.p(t, 10) });
    ['fetch', 'auth headers', 'retry', 'parse errors'].forEach(function (s, i) {
      var q = K.p(t, 10.2 + i * 0.5);
      K.box(462 + i * 190, 304, 174, 62, { stroke: P.muted, a: q * 0.8 });
      K.text(s, 549 + i * 190, 335, { size: 18, color: P.muted, align: 'center', mono: i === 0, a: q });
    });
    K.text('hidden behind one call', 1222, 272, { size: 16, color: P.muted, align: 'right', a: K.p(t, 12.6) });
    var d = K.p(t, 15.2);
    K.box(40, 414, 1200, 176, { fill: P.code, stroke: P.line, a: d });
    K.text('Dependency injection', 64, 442, { size: 20, weight: 700, color: P.green, a: d });
    var dc = ['const makeClock = ({ now }) => ({', '  isMorning: () => new Date(now()).getHours() < 12,', '});'];
    K.code(dc, 64, 472, { size: 17, lh: 1.55, n: K.typed(t, dc, [15.6, 16.6, 18.2], 40), t: t, a: d });
    K.text('production', 680, 486, { size: 17, weight: 700, a: K.p(t, 18.8) });
    K.text('makeClock({ now: Date.now })', 800, 486, { size: 17, mono: true, color: P.green, a: K.p(t, 18.8) });
    K.text('test', 680, 538, { size: 17, weight: 700, a: K.p(t, 20) });
    K.text('makeClock({ now: () => NINE_AM })', 800, 538, { size: 17, mono: true, color: P.warm, a: K.p(t, 20) });
    K.mark(1196, 538, true, 0.7, K.p(t, 21));
  } },

/* 5 ─ kinds of state */
{ d: 26, title: 'Kinds of state',
  caps: [
    [0.3, 'Not all state is alike. UI state, like an open menu, and form drafts belong close to the component that uses them.'],
    [7, 'URL state, like the route, sort and page, lives in the address bar, so a view can be shared and bookmarked.'],
    [13, 'Server state is a cache of data the server owns. Use TanStack Query or SWR for it, not a copy in a global store.'],
    [19.5, 'Only truly app-wide state, like the signed-in user or the theme, needs a global store. Start local; lift when shared.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, on = K.p(t, 0.2);
    K.box(40, 84, 640, 506, { fill: P.code, stroke: P.line, a: on });
    [P.red, P.warm, P.green].forEach(function (c, i) { g.save(); g.globalAlpha *= on * 0.8; g.fillStyle = c; g.beginPath(); g.arc(64 + i * 18, 108, 5.5, 0, 7); g.fill(); g.restore(); });
    var urlHi = K.win(t, 7.2, 13), srvHi = K.win(t, 13.2, 19.5), uiHi = K.win(t, 0.6, 7), gHi = K.p(t, 19.8);
    K.box(130, 92, 530, 34, { fill: P.card, stroke: urlHi > 0.5 ? P.blue : P.line, lw: urlHi > 0.5 ? 3 : 2, r: 17, a: on });
    K.text('shop.example/products?sort=price&page=2', 150, 109, { size: 16, mono: true, color: urlHi > 0.5 ? P.blue : P.muted, a: on });
    K.text('Shop', 64, 166, { size: 24, weight: 800, a: on });
    K.box(520, 146, 140, 40, { stroke: gHi > 0.5 ? P.purple : P.line, lw: gHi > 0.5 ? 3 : 2, r: 20, a: on });
    K.text('Ana · dark', 590, 166, { size: 16, align: 'center', a: on });
    K.box(64, 206, 300, 44, { fill: P.card, stroke: uiHi > 0.5 ? P.warm : P.line, lw: uiHi > 0.5 ? 3 : 2, r: 8, a: on });
    K.text('search: pen|', 80, 228, { size: 17, mono: true, a: on });
    K.box(390, 206, 270, 44, { fill: P.card, stroke: uiHi > 0.5 ? P.warm : P.line, lw: uiHi > 0.5 ? 3 : 2, r: 8, a: on });
    K.text('Filters ▾', 410, 228, { size: 17, a: on });
    var menu = K.p(t, 2.4);
    K.box(390, 254, 270, 96, { fill: P.card, stroke: P.warm, r: 8, a: menu * on });
    K.text('in stock', 410, 282, { size: 16, a: menu * on }); K.text('on sale', 410, 318, { size: 16, a: menu * on });
    [['Pen', '$3'], ['Notebook', '$12'], ['Bag', '$8']].forEach(function (r, i) {
      var y = 372 + i * 66;
      K.box(64, y, 596, 54, { fill: P.card, stroke: srvHi > 0.5 ? P.green : P.line, lw: srvHi > 0.5 ? 3 : 2, r: 8, a: on });
      K.text(r[0], 84, y + 27, { size: 19, a: on }); K.text(r[1], 640, y + 27, { size: 19, mono: true, color: P.muted, align: 'right', a: on });
    });
    var R = [['UI + form', 'open menu, search draft', 'the component itself', P.warm, 0.8], ['URL', 'route, sort, page', 'the address bar', P.blue, 7.4],
             ['Server cache', 'products from the API', 'TanStack Query / SWR', P.green, 13.4], ['Global client', 'signed-in user, theme', 'a small global store', P.purple, 20]];
    R.forEach(function (r, i) {
      var y = 92 + i * 124, q = K.p(t, r[4], 0.5);
      K.box(720 + (1 - q) * 30, y, 520, 108, { stroke: r[3], a: q });
      K.text(r[0], 744 + (1 - q) * 30, y + 28, { size: 22, weight: 700, color: r[3], a: q });
      K.text(r[1], 744 + (1 - q) * 30, y + 60, { size: 17, a: q });
      K.text('lives in: ' + r[2], 744 + (1 - q) * 30, y + 88, { size: 16, color: P.muted, a: q });
    });
  } },

/* 6 ─ unidirectional flow */
{ d: 26, title: 'Actions and reducers',
  caps: [
    [0.3, 'In a one-way data flow, the view never changes state directly. It dispatches an action that describes what happened.'],
    [7, 'A pure reducer takes the current state and the action, and returns a new state object without mutating the old one.'],
    [14, 'The store swaps in the new state and notifies its subscribers, so the view re-renders with count 1.'],
    [19.5, 'Every change is an explicit action, so you can log it, replay it, and test the reducer with plain inputs and outputs.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, count = (t > 15.4 ? 1 : 0) + (t > 21 ? 1 : 0) + (t > 22.2 ? 1 : 0);
    K.box(40, 96, 230, 160, { stroke: P.blue, a: K.p(t, 0.3) });
    K.text('View', 64, 122, { size: 20, weight: 700, color: P.blue, a: K.p(t, 0.3) });
    var press = K.win(t, 1.6, 2.2, 0.15);
    K.box(70, 150, 90, 50, { fill: press > 0.5 ? P.blue : P.card, stroke: P.blue, r: 10, a: K.p(t, 0.6) });
    K.text('+1', 115, 175, { size: 22, weight: 700, align: 'center', color: press > 0.5 ? P.bg : P.ink, a: K.p(t, 0.6) });
    K.text('count: ' + count, 70, 228, { size: 20, mono: true, color: t > 15.4 && t < 17.5 ? P.green : P.ink, a: K.p(t, 0.6) });
    K.box(320, 126, 230, 100, { stroke: P.warm, a: K.p(t, 2.2) });
    K.text('dispatch', 435, 154, { size: 20, weight: 700, align: 'center', color: P.warm, a: K.p(t, 2.2) });
    K.box(600, 126, 300, 100, { stroke: P.green, a: K.p(t, 7.2) });
    K.text('reducer', 750, 154, { size: 20, weight: 700, align: 'center', color: P.green, a: K.p(t, 7.2) });
    K.text('(state, action) → new', 750, 196, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 7.6) });
    K.box(950, 96, 290, 160, { stroke: P.purple, a: K.p(t, 0.5) });
    K.text('store', 974, 122, { size: 20, weight: 700, color: P.purple, a: K.p(t, 0.5) });
    var sw = K.p(t, 14.7, 0.3);
    K.text('{ count: 0 }', 1095, 186, { size: 22, mono: true, align: 'center', a: K.p(t, 0.5) * (1 - K.p(t, 14.2, 0.3)) });
    K.text('{ count: ' + Math.max(1, count) + ' }', 1095, 186, { size: 22, mono: true, color: P.green, align: 'center', a: sw });
    K.arrow(274, 176, 316, 176, { p: K.p(t, 2.4, 0.4), color: P.muted });
    K.arrow(554, 176, 596, 176, { p: K.p(t, 7.4, 0.4), color: P.muted });
    K.arrow(904, 176, 946, 176, { p: K.p(t, 14, 0.4), color: P.muted });
    /* the action object travels */
    var ax = 435 + 315 * K.p(t, 8, 1);
    if (t > 2.6 && t < 13.6) K.chip('{ type: "inc" }', ax, 100, { mono: true, size: 17, stroke: P.warm, a: Math.min(K.p(t, 2.6), 1 - K.p(t, 13, 0.5)) });
    K.curve(1095, 262, 660, 340, 155, 262, { p: K.p(t, 15, 1), color: P.purple, lw: 2.5 });
    K.text('subscribers notified → re-render', 660, 280, { size: 17, color: P.purple, align: 'center', a: K.p(t, 15.6) });
    var code = ['function reducer(state, action) {', '  switch (action.type) {', '    case "inc": return { ...state, count: state.count + 1 };', '    default: return state;', '  }', '}'];
    K.panel(40, 330, 680, 260, 'reducer.js', { a: K.p(t, 7.6) });
    K.code(code, 62, 378, { size: 18, lh: 1.6, n: K.typed(t, code, [8, 9, 10, 12, 12.6, 12.8], 40), t: t, a: K.p(t, 7.6), w: 650, hi: t > 10 && t < 14 ? 2 : -1 });
    K.text('no mutation · no I/O · same input → same output', 62, 568, { size: 16, color: P.green, a: K.p(t, 12.4) });
    K.panel(760, 330, 480, 260, 'action log', { a: K.p(t, 19.6) });
    [['{ type: "inc" }', 'count 1', 20], ['{ type: "inc" }', 'count 2', 21], ['{ type: "inc" }', 'count 3', 22.2]].forEach(function (r, i) {
      var q = K.p(t, r[2], 0.4), y = 382 + i * 40;
      K.text(r[0], 784, y, { size: 18, mono: true, color: P.warm, a: q });
      K.text('→ ' + r[1], 1010, y, { size: 18, mono: true, a: q });
    });
    K.text('log · replay · time-travel · test', 784, 548, { size: 17, color: P.acc, a: K.p(t, 23) });
  } },

/* 7 ─ immutable updates and derived state */
{ d: 22, title: 'Immutable and derived',
  caps: [
    [0.3, 'Never mutate state in place. push changes the same array, so a reference check sees no change and nothing re-renders.'],
    [7.5, 'Create a new array instead, with spread or toSorted and friends. The new reference tells everyone something changed.'],
    [14, 'Store the minimum and derive the rest. A total kept as separate state drifts; a total computed from items cannot.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    function arr(x, y, vals, color, a) {
      vals.forEach(function (v, i) {
        K.box(x + i * 56, y, 50, 44, { stroke: color, a: a, r: 6 });
        K.text(v, x + 25 + i * 56, y + 22, { size: 19, mono: true, align: 'center', a: a });
      });
    }
    var a1 = K.p(t, 0.3);
    K.box(40, 84, 580, 300, { stroke: P.red, a: a1 });
    K.code(['state.items.push("c");'], 64, 106, { size: 20, n: K.typed(t, ['state.items.push("c");'], [0.8], 26), t: t, a: a1 });
    K.chip('prev', 110, 200, { mono: true, size: 18, stroke: P.muted, a: K.p(t, 1.8) });
    K.chip('next', 110, 290, { mono: true, size: 18, stroke: P.muted, a: K.p(t, 3.6) });
    K.arrow(150, 200, 266, 236, { p: K.p(t, 2, 0.4), color: P.muted });
    K.arrow(150, 290, 266, 256, { p: K.p(t, 3.8, 0.4), color: P.muted });
    arr(274, 224, t > 3 ? ['a', 'b', 'c'] : ['a', 'b'], P.red, K.p(t, 2));
    K.text('prev === next → true', 64, 350, { size: 19, mono: true, a: K.p(t, 4.8) });
    K.mark(370, 350, false, 0.75, K.p(t, 5.6)); K.text('no re-render', 394, 350, { size: 18, color: P.red, a: K.p(t, 5.6) });
    var a2 = K.p(t, 7.6);
    K.box(660, 84, 580, 300, { stroke: P.green, a: a2 });
    K.code(['const items = [...state.items, "c"];'], 684, 106, { size: 20, n: K.typed(t, ['const items = [...state.items, "c"];'], [8], 30), t: t, a: a2 });
    K.chip('prev', 730, 190, { mono: true, size: 18, stroke: P.muted, a: K.p(t, 9.6) });
    K.chip('next', 730, 290, { mono: true, size: 18, stroke: P.muted, a: K.p(t, 10.4) });
    K.arrow(770, 190, 886, 190, { p: K.p(t, 9.8, 0.4), color: P.muted });
    K.arrow(770, 290, 886, 290, { p: K.p(t, 10.6, 0.4), color: P.green });
    arr(894, 168, ['a', 'b'], P.muted, K.p(t, 9.6));
    arr(894, 268, ['a', 'b', 'c'], P.green, K.p(t, 10.4));
    K.text('prev === next → false', 684, 350, { size: 19, mono: true, a: K.p(t, 11.4) });
    K.mark(1000, 350, true, 0.75, K.p(t, 12)); K.text('re-render', 1024, 350, { size: 18, color: P.green, a: K.p(t, 12) });
    /* derived */
    var d = K.p(t, 14.2);
    K.box(40, 410, 1200, 180, { fill: P.code, stroke: P.line, a: d });
    [['Pen', 3], ['Bag', 8], ['Book', 12]].forEach(function (r, i) {
      var q = i === 2 ? K.p(t, 16.4) : d;
      K.chip(r[0] + ' $' + r[1], 200 + i * 150, 456, { size: 19, stroke: i === 2 ? P.warm : P.acc, a: q });
    });
    K.text('items', 64, 456, { size: 16, color: P.muted, a: d });
    K.mark(80, 516, false, 0.75, K.p(t, 17.2));
    K.text('state.total = 11', 108, 516, { size: 20, mono: true, color: P.red, a: K.p(t, 17.2) });
    K.text('stored copy: stale after Book was added', 108, 554, { size: 17, color: P.red, a: K.p(t, 17.8) });
    K.mark(620, 516, true, 0.75, K.p(t, 18.8));
    K.text('items.reduce((s, i) => s + i.price, 0)', 648, 516, { size: 19, mono: true, color: P.green, a: K.p(t, 18.8) });
    K.text('→ 23, always in sync', 648, 554, { size: 17, color: P.green, a: K.p(t, 19.6) });
  } },

/* 8 ─ signals */
{ d: 24, title: 'Signals',
  caps: [
    [0.3, 'Signals give fine-grained reactivity. A signal holds a value, and reading it inside an effect subscribes that effect.'],
    [7.5, 'Writing the signal re-runs only the computed values and effects that read it. Everything else stays untouched.'],
    [15, 'Vue, Solid, Preact and Angular are built on this idea, and a TC39 proposal aims to add signals to the language.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, code = ['const count = signal(0);', 'const double = computed(() => count.value * 2);', 'effect(() => render(double.value));', '', 'count.value = 5;'];
    K.panel(40, 84, 600, 236, 'signals.js');
    K.code(code, 62, 132, { size: 18, lh: 1.6, n: K.typed(t, code, [0.8, 2, 3.8, 5.4, 7.8], 34), t: t, w: 570, hi: t > 8 && t < 14 ? 4 : -1 });
    function node(x, y, label, sub, color, a, hot) {
      K.box(x - 110, y - 40, 220, 80, { stroke: hot ? P.warm : color, lw: hot ? 3.5 : 2, a: a });
      K.text(label, x, y - 10, { size: 21, weight: 700, mono: true, align: 'center', a: a });
      K.text(sub, x, y + 18, { size: 16, color: hot ? P.warm : P.muted, align: 'center', a: a });
    }
    var w = K.p(t, 8.6, 0.4), r1 = K.win(t, 8.8, 11.4), r2 = K.win(t, 9.8, 12.4), r3 = K.win(t, 10.8, 13.4);
    var cval = t > 8.6 ? '5' : '0', dval = t > 9.8 ? '10' : '0';
    node(800, 140, 'count', 'signal = ' + cval, P.acc, K.p(t, 1.2), r1 > 0.5);
    node(800, 290, 'double', 'computed = ' + dval, P.blue, K.p(t, 2.6), r2 > 0.5);
    node(800, 440, 'effect', 'render(' + dval + ')', P.green, K.p(t, 4.2), r3 > 0.5);
    K.arrow(800, 184, 800, 244, { p: K.p(t, 2.8, 0.4), color: P.muted });
    K.arrow(800, 334, 800, 394, { p: K.p(t, 4.4, 0.4), color: P.muted });
    K.text('reads → subscribes', 814, 214, { size: 16, color: P.muted, a: K.p(t, 3) });
    K.text('reads → subscribes', 814, 364, { size: 16, color: P.muted, a: K.p(t, 4.6) });
    function pulse(y0, y1, a) {
      if (t < a || t > a + 0.8) return; var u = K.clamp((t - a) / 0.7);
      g.save(); g.fillStyle = P.warm; g.beginPath(); g.arc(800, y0 + (y1 - y0) * u, 8, 0, 7); g.fill(); g.restore();
    }
    pulse(184, 244, 9); pulse(334, 394, 10);
    node(1110, 140, 'name', 'signal', P.line, K.p(t, 5.6), false);
    node(1110, 290, 'header', 'effect', P.line, K.p(t, 5.8), false);
    K.arrow(1110, 184, 1110, 244, { p: K.p(t, 6, 0.4), color: P.line });
    K.text('not touched', 1110, 360, { size: 17, color: P.muted, align: 'center', a: K.p(t, 11.6) });
    K.mark(1110, 400, true, 0.7, K.p(t, 12.2));
    K.text('only 2 of 4 nodes re-ran', 340, 360, { size: 19, color: P.warm, align: 'center', a: K.p(t, 12.6) });
    [['Vue', 110], ['Solid', 220], ['Preact', 340], ['Angular', 470]].forEach(function (c, i) {
      K.chip(c[0], c[1], 430, { size: 19, stroke: P.acc, a: K.p(t, 15.2 + i * 0.4) });
    });
    K.chip('TC39 signals proposal', 220, 510, { size: 19, stroke: P.purple, color: P.purple, a: K.p(t, 17.4) });
    K.text('JS idea, not one framework', 420, 510, { size: 16, color: P.muted, a: K.p(t, 18.2) });
  } },

/* 9 ─ state machines */
{ d: 26, title: 'State machines',
  caps: [
    [0.3, 'Boolean flags like isLoading and hasError can combine into impossible states, such as loading and failed at once.'],
    [7, 'A state machine lists the real states, idle, loading, success and error, and the events that move between them.'],
    [14, 'Only defined transitions can happen. A RESOLVE event while idle is simply ignored.'],
    [19.5, 'XState models this, or a small transition table and one line of code. Impossible states become impossible.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, f = K.win(t, 0.3, 7);
    K.box(40, 96, 440, 230, { fill: P.code, stroke: P.red, a: f });
    [['isLoading', 'true'], ['hasError', 'true'], ['data', '[ … ]']].forEach(function (r, i) {
      var q = Math.min(f, K.p(t, 0.8 + i * 0.6));
      K.text(r[0], 70, 140 + i * 50, { size: 21, mono: true, a: q });
      K.text(r[1], 300, 140 + i * 50, { size: 21, mono: true, color: P.warm, a: q });
    });
    K.mark(80, 296, false, 0.8, Math.min(f, K.p(t, 3)));
    K.text('loading, failed and done at once?', 108, 296, { size: 18, color: P.red, a: Math.min(f, K.p(t, 3)) });
    /* machine */
    var S = { idle: [180, 200], loading: [500, 200], success: [880, 120], error: [880, 300] }, col = { idle: P.muted, loading: P.warm, success: P.green, error: P.red };
    var cur = t < 15 ? 'idle' : t < 16.8 ? 'loading' : t < 18 ? 'error' : t < 19.2 ? 'loading' : 'success';
    Object.keys(S).forEach(function (k, i) {
      var p = S[k], q = K.back((t - 7.4 - i * 0.5) / 0.5); if (q <= 0) return;
      var on = t > 14 && cur === k;
      g.save(); g.translate(p[0], p[1]); g.scale(q, q);
      K.box(-90, -36, 180, 72, { stroke: on ? col[k] : P.line, lw: on ? 4 : 2, r: 36, a: K.clamp(q) });
      K.text(k, 0, 0, { size: 22, weight: 700, color: col[k], align: 'center', a: K.clamp(q) });
      g.restore();
    });
    var E = [['FETCH', 274, 200, 406, 200, 9.6, 340, 184], ['RESOLVE', 594, 186, 786, 128, 10.4, 690, 136], ['REJECT', 594, 216, 786, 290, 11.2, 730, 240]];
    K.curve(790, 316, 620, 372, 498, 240, { p: K.p(t, 12, 0.6), color: P.muted, lw: 2.5 });
    K.text('RETRY', 632, 350, { size: 16, mono: true, weight: 700, color: P.acc, align: 'center', a: K.p(t, 12.3) });
    E.forEach(function (e) {
      K.arrow(e[1], e[2], e[3], e[4], { p: K.p(t, e[5], 0.5), color: P.muted, lw: 2.5 });
      K.text(e[0], e[6], e[7], { size: 16, mono: true, weight: 700, color: P.acc, align: 'center', a: K.p(t, e[5] + 0.3) });
    });
    K.box(1020, 170, 220, 100, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: K.win(t, 14.3, 15.6, 0.3) });
    K.text('RESOLVE in idle', 1130, 204, { size: 17, mono: true, align: 'center', a: K.win(t, 14.3, 15.6, 0.3) });
    K.text('→ ignored', 1130, 236, { size: 17, color: P.red, align: 'center', a: K.win(t, 14.3, 15.6, 0.3) });
    var trail = ['idle', 'loading', 'error', 'loading', 'success'];
    trail.forEach(function (s, i) {
      K.chip(s, 1130, 140 + i * 50, { size: 16, mono: true, stroke: col[s], color: col[s], a: K.p(t, [15.8, 16, 17, 18.2, 19.3][i] + 0.2) });
    });
    var code = ['const machine = {', '  idle: { FETCH: "loading" },', '  loading: { RESOLVE: "success", REJECT: "error" },', '  error: { RETRY: "loading" },', '};',
      'state = machine[state]?.[event] ?? state;'];
    K.panel(40, 380, 760, 210, 'machine.js', { a: K.p(t, 19.6) });
    K.code(code, 62, 416, { size: 17, lh: 1.5, n: K.typed(t, code, [19.9, 20.6, 21.4, 22.6, 23.3, 23.5], 44), t: t, a: K.p(t, 19.6) });
    K.chip('XState', 960, 440, { size: 20, stroke: P.acc, a: K.p(t, 20.2) });
    K.text('or a table + one line', 960, 492, { size: 17, color: P.muted, align: 'center', a: K.p(t, 21) });
    K.mark(880, 548, true, 0.8, K.p(t, 24)); K.text('no impossible states', 906, 548, { size: 18, color: P.green, a: K.p(t, 24) });
  } },

/* 10 ─ recap */
{ d: 15, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 28 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Patterns are vocabulary; in JS most are just functions',
     'Middleware wraps a handler: before, next(), after',
     'Adapter, Facade and DI keep boundaries clean and testable',
     'Local first, URL for shareable views, a query cache for server data',
     'Actions + pure reducers + new objects; derive the rest',
     'Signals for fine-grained updates, machines for flows'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 28 examples with ▶ Run', 640, 540, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
