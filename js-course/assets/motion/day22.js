/* Day 22 in motion: reachability and garbage collection (mark-sweep-compact, generations, Orinoco, weak references), memory leaks and how to find them.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day22', {
  kicker: 'JavaScript: Zero to Architect · Day 22',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 22: how JavaScript reclaims memory, and how to find and fix leaks in real apps.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Memory', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 22 · Garbage collection and leaks', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Reachability', 'Generational GC', 'Finding leaks'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ reachability */
{ d: 24, title: 'Reachability',
  caps: [
    [0.3, 'JavaScript has no free function. The engine reclaims memory for you, but you decide what stays reachable.'],
    [6.5, 'The collector starts at the roots: the global object, variables on the call stack, and live closures.'],
    [12, 'It follows every reference and marks what it finds: A, then B, then C.'],
    [17.5, 'D and E point at each other, but nothing reaches them. A cycle does not keep itself alive.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    K.box(40, 90, 250, 470, { stroke: P.purple, a: K.p(t, 6.6) });
    K.text('Roots', 165, 122, { size: 22, weight: 700, color: P.purple, align: 'center', a: K.p(t, 6.6) });
    ['globalThis', 'call stack', 'closures'].forEach(function (r, i) {
      K.chip(r, 165, 200 + i * 110, { size: 19, mono: true, stroke: P.purple, a: K.p(t, 7.2 + i * 0.7) });
    });
    K.box(330, 90, 910, 470, { fill: false, stroke: P.line, dash: [8, 8], a: K.p(t, 0.3) });
    K.text('Heap', 354, 118, { size: 19, weight: 700, color: P.muted, a: K.p(t, 0.3) });
    var N = { A: [480, 200, 12.3], B: [710, 200, 13.5], C: [940, 200, 14.7], D: [560, 430, 0], E: [820, 430, 0], F: [1100, 400, 0] };
    function edge(a, b, st, col) { var p = N[a], q = N[b], d = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / d, uy = (q[1] - p[1]) / d;
      K.arrow(p[0] + ux * 40, p[1] + uy * 40, q[0] - ux * 42, q[1] - uy * 42, { p: K.p(t, st, 0.5), color: col }); }
    edge('A', 'B', 2.6, t > 13.3 ? P.green : P.muted); edge('B', 'C', 3, t > 14.5 ? P.green : P.muted);
    K.curve(600, 412, 690, 370, 780, 412, { p: K.p(t, 3.4, 0.5), color: t > 17.6 ? P.red : P.muted });
    K.curve(780, 448, 690, 490, 600, 448, { p: K.p(t, 3.8, 0.5), color: t > 17.6 ? P.red : P.muted });
    K.arrow(250, 200, 438, 200, { p: K.p(t, 9.6, 0.6), color: P.purple });
    Object.keys(N).forEach(function (k, i) {
      var n = N[k], q = K.back((t - 1 - i * 0.3) / 0.5); if (q <= 0) return;
      var live = n[2] && t > n[2], dead = !n[2] && t > 17.6;
      g.save(); g.globalAlpha *= K.clamp(q); g.fillStyle = live ? 'rgba(104,211,145,.18)' : P.card; g.strokeStyle = live ? P.green : dead ? P.red : P.warm; g.lineWidth = 3;
      g.beginPath(); g.arc(n[0], n[1], 38 * q, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(k, n[0], n[1], { size: 26, weight: 700, mono: true, align: 'center', a: K.clamp(q) });
      if (live) K.mark(n[0] + 34, n[1] - 32, true, 0.7, K.p(t, n[2], 0.3));
    });
    K.text('marked: reachable', 710, 280, { size: 19, color: P.green, align: 'center', a: K.p(t, 15.2) });
    K.text('unreachable cycle', 690, 520, { size: 19, color: P.red, align: 'center', a: K.p(t, 18) });
    K.text('unreachable', 1100, 470, { size: 19, color: P.red, align: 'center', a: K.p(t, 18.8) });
  } },

/* 3 ─ sweep and compact */
{ d: 22, title: 'Sweep and compact',
  caps: [
    [0.3, 'Everything left unmarked is garbage. The sweep frees it: D, E and F are gone.'],
    [6.5, 'Freeing leaves gaps. Mark-compact also slides survivors together, so new objects get one large free block.'],
    [13.5, 'Setting a variable to null frees an object only if nothing else still references it.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Heap memory', 40, 110, { size: 20, weight: 700, color: P.muted, a: K.p(t, 0.2) });
    var cells = ['A', 'D', 'B', 'E', 'C', 'F', '', ''], home = [0, 1, 2, 3, 4, 5, 6, 7], packed = { A: 0, B: 1, C: 2 };
    var cmp = K.p(t, 7.2, 1.2);
    for (var i = 0; i < 8; i++) K.box(40 + i * 150, 140, 140, 90, { fill: P.code, stroke: P.line, dash: [6, 6], a: K.p(t, 0.2) });
    cells.forEach(function (c, i) {
      if (!c) return;
      var live = c in packed, gone = live ? 0 : K.p(t, 2.2 + i * 0.2, 0.6);
      var x = 40 + (live ? home[i] + (packed[c] - home[i]) * cmp : home[i]) * 150;
      K.box(x, 140, 140, 90, { fill: live ? 'rgba(104,211,145,.16)' : 'rgba(252,129,129,.14)', stroke: live ? P.green : P.red, a: (1 - gone) * K.p(t, 0.2) });
      K.text(c, x + 70, 185, { size: 28, weight: 700, mono: true, align: 'center', a: (1 - gone) * K.p(t, 0.2) });
    });
    K.text('swept: free', 640, 260, { size: 18, color: P.muted, align: 'center', a: K.win(t, 3.6, 7.2) });
    var fb = K.p(t, 8.6);
    K.box(490, 132, 750, 106, { fill: false, stroke: P.acc, lw: 3, a: fb });
    K.text('one large free block', 865, 262, { size: 19, color: P.acc, align: 'center', a: fb });
    K.text('survivors packed together', 265, 262, { size: 19, color: P.green, align: 'center', a: K.p(t, 9) });
    var code = ['let a = { big: data };', 'let b = a;', 'a = null;   // still alive via b'];
    K.panel(40, 320, 600, 200, 'refs.js', { a: K.p(t, 13.6) });
    K.code(code, 66, 370, { size: 22, n: K.typed(t, code, [13.9, 15, 16], 30), t: t, a: K.p(t, 13.6), hi: t > 16.4 ? 2 : -1, w: 560 });
    var d = K.p(t, 14.4);
    K.box(960, 380, 240, 110, { stroke: P.warm, a: d });
    K.text('{ big: data }', 1080, 435, { size: 21, mono: true, align: 'center', a: d });
    K.chip('a', 760, 380, { mono: true, size: 22, stroke: P.acc, a: d });
    K.chip('b', 760, 490, { mono: true, size: 22, stroke: P.acc, a: K.p(t, 15.2) });
    var cut = K.p(t, 16.6, 0.5);
    K.arrow(786, 386, 952, 420, { p: K.p(t, 14.6, 0.5), color: P.acc, a: 1 - cut });
    K.text('= null', 790, 380, { size: 19, mono: true, color: P.muted, a: cut });
    K.arrow(786, 484, 952, 460, { p: K.p(t, 15.4, 0.5), color: P.green });
    K.mark(1200, 380, true, 0.8, K.p(t, 17.4));
    K.text('still reachable', 1080, 524, { size: 18, color: P.green, align: 'center', a: K.p(t, 17.6) });
  } },

/* 4 ─ generations */
{ d: 27, title: 'Generations and Orinoco',
  caps: [
    [0.3, 'Most objects die young. So V8 splits the heap into a young generation and an old generation.'],
    [6, 'New objects go to the young generation. The Scavenger collects it often and fast, copying out the few survivors.'],
    [13, 'Objects that survive a couple of scavenges are promoted to the old generation, collected less often by Mark-Compact.'],
    [19.5, 'Orinoco, the V8 collector, works in parallel, in small slices and concurrently, so the main thread pauses only briefly.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    K.box(40, 84, 520, 270, { stroke: P.acc, a: K.p(t, 0.4) });
    K.text('Young generation', 64, 112, { size: 21, weight: 700, color: P.acc, a: K.p(t, 0.4) });
    K.text('Scavenger: fast, frequent', 64, 334, { size: 17, color: P.muted, a: K.p(t, 6.4) });
    K.box(640, 84, 600, 270, { stroke: P.purple, a: K.p(t, 1.2) });
    K.text('Old generation', 664, 112, { size: 21, weight: 700, color: P.purple, a: K.p(t, 1.2) });
    K.text('Mark-Compact: less often', 664, 334, { size: 17, color: P.muted, a: K.p(t, 13.4) });
    /* objects: deterministic grid; most die in the scavenge at 8.5, survivors 3 and 11 promote at 13.5 */
    for (var i = 0; i < 18; i++) {
      var col = i % 6, row = Math.floor(i / 6), x = 100 + col * 76 + (row % 2) * 20, y = 160 + row * 56;
      var born = 6.4 + i * 0.1, surv = i === 3 || i === 11 || i === 14, die = surv ? 0 : K.p(t, 8.6 + (i % 5) * 0.12, 0.5);
      if (t < born) continue;
      var pr = surv ? K.p(t, 13.6 + (i === 11 ? 0.4 : i === 14 ? 0.8 : 0), 1) : 0;
      var tx = 720 + (i === 3 ? 0 : i === 11 ? 90 : 180), ty = 220;
      var cx = x + (tx - x) * pr, cy = y + (ty - y) * pr;
      g.save(); g.globalAlpha *= K.clamp((t - born) / 0.3) * (1 - die); g.fillStyle = surv && t > 9 ? P.green : P.warm;
      g.beginPath(); g.arc(cx, cy, 13, 0, 7); g.fill(); g.restore();
    }
    for (var j = 0; j < 6; j++) { g.save(); g.globalAlpha *= K.p(t, 1.6 + j * 0.2); g.fillStyle = P.purple; g.beginPath(); g.arc(1000 + (j % 3) * 60, 190 + Math.floor(j / 3) * 60, 13, 0, 7); g.fill(); g.restore(); }
    K.text('most die young', 450, 334, { size: 18, color: P.red, align: 'center', a: K.win(t, 9.4, 14) });
    K.arrow(570, 220, 630, 220, { p: K.p(t, 13.4, 0.5), color: P.green });
    K.text('promoted', 900, 290, { size: 18, color: P.green, align: 'center', a: K.p(t, 14.4) });
    /* thread timeline */
    var tl = K.p(t, 19.8);
    K.text('main thread', 40, 420, { size: 18, color: P.muted, a: tl });
    K.text('helper threads', 40, 500, { size: 18, color: P.muted, a: tl });
    var M = [[200, 160, 0], [364, 18, 1], [386, 200, 0], [590, 14, 1], [608, 240, 0], [852, 16, 1], [872, 200, 0]];
    M.forEach(function (m, k) { var q = K.p(t, 20 + k * 0.25, 0.4); K.box(m[0], 400, m[1] * q, 40, { fill: m[2] ? P.warm : P.acc, r: 4, a: tl * (m[2] ? 1 : 0.75) }); });
    K.box(380, 480, 460, 40, { fill: P.purple, r: 4, a: K.p(t, 21.2) * 0.8 });
    K.text('concurrent marking', 610, 500, { size: 16, weight: 700, color: P.bg, align: 'center', a: K.p(t, 21.6) });
    K.text('JavaScript', 280, 420, { size: 16, weight: 700, color: P.bg, align: 'center', a: K.p(t, 20.4) });
    K.text('tiny GC pauses', 600, 382, { size: 17, color: P.warm, align: 'center', a: K.p(t, 22.6) });
    K.text('parallel · incremental · concurrent', 640, 568, { size: 20, color: P.acc, align: 'center', a: K.p(t, 23.4) });
  } },

/* 5 ─ weak references */
{ d: 25, title: 'Weak references',
  caps: [
    [0.3, 'A WeakMap holds its keys weakly: an entry does not keep its key object alive.'],
    [6.5, 'When the last strong reference to the key goes away, the entry can be collected with it.'],
    [12.5, 'That is why a WeakMap cannot be iterated: its entries may disappear whenever the collector runs.'],
    [18.5, 'WeakRef and FinalizationRegistry exist too, but their timing is unpredictable. Never rely on them for correctness.']],
  draw: function (K, t) {
    var P = K.P, code = ['const meta = new WeakMap();', 'let el = { id: 1 };', 'meta.set(el, "info");', 'el = null;', 'for (const x of meta) {}'];
    K.panel(40, 84, 560, 290, 'weak.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 134, { size: 22, n: K.typed(t, code, [0.5, 1.6, 2.6, 6.8, 12.8], 30), t: t, a: K.p(t, 0.2), w: 520,
      hi: t > 12.8 ? 4 : t > 6.8 ? 3 : -1 });
    var gone = K.p(t, 9.4, 0.8), a0 = K.p(t, 1.8);
    K.chip('el', 700, 150, { mono: true, size: 22, stroke: P.acc, a: a0 });
    K.text('null', 770, 150, { size: 19, mono: true, color: P.muted, a: K.p(t, 7.4) });
    K.arrow(724, 168, 860, 240, { p: K.p(t, 2, 0.5), color: P.acc, a: 1 - K.p(t, 7.2, 0.4) });
    K.box(860, 220, 200, 70, { stroke: P.warm, a: a0 * (1 - gone) });
    K.text('{ id: 1 }', 960, 255, { size: 21, mono: true, align: 'center', a: a0 * (1 - gone) });
    var wm = K.p(t, 2.8);
    K.box(660, 330, 560, 120, { stroke: P.purple, a: wm });
    K.text('WeakMap  meta', 684, 358, { size: 19, weight: 700, color: P.purple, a: wm });
    K.text('key', 700, 410, { size: 19, color: P.muted, a: wm * (1 - gone) });
    K.text('→  "info"', 900, 410, { size: 21, mono: true, a: wm * (1 - gone) });
    K.arrow(760, 400, 900, 296, { p: K.p(t, 3.4, 0.5), color: P.purple, dash: [6, 6], lw: 2, a: 1 - gone });
    K.text('weak: does not keep the key alive', 940, 486, { size: 18, color: P.purple, align: 'center', a: K.p(t, 4) * (1 - K.p(t, 12.4)) });
    K.text('collected, entry gone', 940, 410, { size: 19, color: P.green, align: 'center', a: K.p(t, 10.2) });
    var e = K.p(t, 14.2);
    K.box(40, 400, 560, 60, { fill: 'rgba(252,129,129,.12)', stroke: P.red, a: e });
    K.text('TypeError: meta is not iterable', 64, 430, { size: 20, mono: true, color: P.red, a: e });
    var w = K.p(t, 18.8);
    K.chip('ref.deref() → may be undefined', 320, 530, { mono: true, size: 18, stroke: P.warm, a: w });
    K.chip('FinalizationRegistry: may never run', 900, 530, { mono: true, size: 18, stroke: P.warm, a: K.p(t, 19.6) });
  } },

/* 6 ─ what a leak is */
{ d: 23, title: 'What a leak looks like',
  caps: [
    [0.3, 'A leak is not memory the engine forgot. It is memory that is still reachable, but that you no longer need.'],
    [7, 'A healthy heap is a sawtooth: it grows, then drops back down at each collection.'],
    [12.5, 'A leak is a staircase. Every repeat of an action leaves something behind, and the floor keeps rising.'],
    [18, 'In a long-lived single-page app, small leaks on every navigation add up to a slow or crashed tab.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    [['window', P.purple], ['resize listener', P.warm], ['closed modal state', P.red]].forEach(function (c, i) {
      var x = 210 + i * 330, q = K.p(t, 0.6 + i * 0.8);
      K.chip(c[0], x, 120, { size: 20, mono: i > 0, stroke: c[1], a: q });
      if (i) K.arrow(x - 230 + (i === 2 ? 30 : 0), 120, x - 110, 120, { p: q, color: P.muted });
    });
    K.text('still reachable, never used again', 870, 168, { size: 18, color: P.red, align: 'center', a: K.p(t, 3.4) });
    function chart(x0, title, col, fn, st, a) {
      K.box(x0, 210, 580, 300, { fill: P.code, stroke: P.line, a: a });
      K.text(title, x0 + 24, 238, { size: 19, weight: 700, color: col, a: a });
      K.text('heap', x0 + 24, 268, { size: 15, color: P.muted, a: a });
      K.text('time →', x0 + 556, 490, { size: 15, color: P.muted, align: 'right', a: a });
      var pr = K.p(t, st, 3.5); if (pr <= 0) return;
      g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineWidth = 3; g.beginPath();
      for (var i = 0; i <= 200 * pr; i++) { var u = i / 200, x = x0 + 30 + u * 520, y = 470 - fn(u) * 180; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke(); g.restore();
    }
    chart(40, 'Healthy: sawtooth', P.green, function (u) { return 0.15 + (u * 5 % 1) * 0.45; }, 7.4, K.p(t, 7.2));
    chart(660, 'Leak: staircase', P.red, function (u) { var k = Math.floor(u * 5); return 0.1 + k * 0.17 + (u * 5 % 1) * 0.3; }, 12.8, K.p(t, 12.6));
    var tab = K.p(t, 18.4);
    K.chip('tab: 1.9 GB and climbing', 950, 552, { size: 19, stroke: P.red, color: P.red, a: tab });
    K.chip('20 navigations later', 330, 552, { size: 19, stroke: P.warm, a: tab });
  } },

/* 7 ─ classic leaks */
{ d: 26, title: 'Classic leaks',
  caps: [
    [0.3, 'Classic causes: listeners on window or document that are never removed, and intervals that are never cleared.'],
    [7, 'Detached DOM nodes: elements removed from the page but still held in a variable or an array.'],
    [13, 'Caches that only ever grow, and closures that capture a big object when they only need one field.'],
    [19, 'Each one is a chain from a root to data you are done with. Fixing a leak means breaking that chain.']],
  draw: function (K, t) {
    var P = K.P, code = ['window.addEventListener("resize",', '  () => draw(bigData));', 'setInterval(() => poll(bigData), 1000);',
      'cache.push(el); el.remove();', 'seen.set(id, response);  // never deleted', 'return () => big.length;'];
    K.panel(40, 80, 760, 300, 'leaky.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 128, { size: 20, lh: 1.55, n: K.typed(t, code, [0.6, 1.8, 3.6, 7.2, 13.2, 15.6], 34), t: t, a: K.p(t, 0.2), w: 720,
      hi: t > 15.6 ? 5 : t > 13.2 ? 4 : t > 7.2 ? 3 : t > 3.6 ? 2 : t > 0.6 ? 0 : -1 });
    [['listener never removed', 2], ['interval never cleared', 4.8], ['detached DOM node', 8.6], ['unbounded cache', 14.2], ['closure holds big', 16.8]].forEach(function (c, i) {
      var q = K.p(t, c[1]);
      K.mark(860, 110 + i * 56, false, 0.8, q); K.text(c[0], 888, 110 + i * 56, { size: 21, a: q });
    });
    /* retention chain */
    var ch = K.p(t, 19.2);
    K.box(40, 420, 1200, 150, { fill: false, stroke: P.line, dash: [8, 8], a: ch });
    var L = [['root: window', P.purple], ['listener', P.warm], ['closure scope', P.warm], ['bigData  50 MB', P.red]];
    L.forEach(function (c, i) {
      var x = 170 + i * 310, q = K.p(t, 19.4 + i * 0.5);
      K.chip(c[0], x, 495, { size: 20, mono: true, stroke: c[1], a: q });
      if (i) K.arrow(x - 220, 495, x - 100, 495, { p: q, color: P.muted });
    });
    var cut = K.p(t, 22.4, 0.4);
    if (cut > 0) { var g = K.g; g.save(); g.globalAlpha *= cut; g.strokeStyle = P.green; g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(330, 466); g.lineTo(370, 524); g.stroke(); g.restore(); }
    K.text('break the link', 350, 446, { size: 17, color: P.green, align: 'center', a: K.p(t, 22.6) });
  } },

/* 8 ─ cleaning up */
{ d: 25, title: 'Cleaning up',
  caps: [
    [0.3, 'Pair every add event listener, set interval, observe and subscribe with a matching teardown.'],
    [6.5, 'An AbortController removes listeners in one go: pass its signal, then call abort when the component goes away.'],
    [13.5, 'Bound your caches with a size limit such as an LRU, and use a WeakMap for metadata attached to objects.'],
    [19.5, 'One more trap: logging an object to the console keeps it alive while DevTools is open.']],
  draw: function (K, t) {
    var P = K.P, code = ['const ac = new AbortController();', 'window.addEventListener("resize", onResize,', '  { signal: ac.signal });',
      'const id = setInterval(poll, 1000);', 'function unmount() {', '  ac.abort(); clearInterval(id);', '}'];
    K.panel(40, 80, 700, 300, 'widget.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 124, { size: 20, lh: 1.5, n: K.typed(t, code, [6.9, 7.8, 9, 9.8, 10.4, 10.8, 11.4], 34), t: t, a: K.p(t, 0.2), w: 660,
      hi: t > 11.6 && t < 13.5 ? 5 : -1 });
    [['addEventListener', 'abort() / remove'], ['setInterval', 'clearInterval'], ['observe', 'disconnect'], ['subscribe', 'unsubscribe']].forEach(function (r, i) {
      var q = K.p(t, 0.8 + i * 0.9) * (1 - K.p(t, 6.2, 0.5)), y = 140 + i * 58;
      K.chip(r[0], 210, y, { size: 18, mono: true, stroke: P.warm, a: q });
      K.arrow(330, y, 420, y, { p: q, color: P.muted });
      K.chip(r[1], 560, y, { size: 18, mono: true, stroke: P.green, a: q });
    });
    var lc = K.p(t, 9.6);
    K.box(780, 80, 460, 140, { stroke: P.acc, a: lc });
    K.text('listeners', 804, 110, { size: 18, color: P.muted, a: lc });
    var n = t < 12 ? 5 : 5 - Math.min(5, Math.floor((t - 12) * 6));
    for (var i = 0; i < 5; i++) K.box(804 + i * 84, 140, 70, 52, { fill: i < n ? 'rgba(246,173,85,.25)' : P.code, stroke: i < n ? P.warm : P.line, a: lc });
    K.text('ac.abort() → all removed', 1010, 110, { size: 17, color: P.green, align: 'center', a: K.p(t, 12.6) });
    /* LRU */
    var lr = K.p(t, 13.8);
    K.box(40, 410, 760, 160, { stroke: P.green, a: lr });
    K.text('LRU cache, max 5', 64, 438, { size: 19, weight: 700, color: P.green, a: lr });
    var k0 = t < 15.2 ? 0 : Math.min(3, Math.floor(t - 15.2) + 1);
    for (var j = 0; j < 5; j++) {
      var id = j + k0, fresh = K.p(t, 15.2 + k0 - 1, 0.4);
      K.box(64 + j * 120, 470, 104, 70, { fill: P.card, stroke: j === 4 && k0 > 0 ? P.green : P.line, a: lr });
      K.text('k' + id, 116 + j * 120, 505, { size: 21, mono: true, align: 'center', a: lr * (j === 4 && k0 > 0 ? fresh : 1) });
    }
    K.text('oldest evicted', 700, 438, { size: 16, color: P.red, align: 'center', a: K.p(t, 15.6) });
    K.chip('WeakMap for per-object data', 1020, 330, { size: 18, stroke: P.purple, a: K.p(t, 17.2) });
    var cl = K.p(t, 19.8);
    K.panel(840, 410, 400, 160, 'Console', { a: cl });
    K.text('> console.log(bigObject)', 864, 466, { size: 18, mono: true, a: cl });
    K.text('kept alive while DevTools is open', 864, 520, { size: 16, color: P.warm, a: K.p(t, 20.8) });
  } },

/* 9 ─ finding leaks */
{ d: 27, title: 'Finding leaks',
  caps: [
    [0.3, 'First confirm it. The DevTools Performance monitor shows heap size, DOM nodes and listeners climbing as you repeat an action.'],
    [7.5, 'Then use three heap snapshots: snapshot, do the action, snapshot, do it again, snapshot.'],
    [14, 'In snapshot 3, show objects allocated between snapshots 1 and 2. Whatever is still there is a suspect.'],
    [20, 'Filter for Detached, then open Retainers: the chain from a root shows exactly which reference to break.']],
  draw: function (K, t) {
    var P = K.P;
    var pm = K.p(t, 0.6);
    K.panel(40, 80, 500, 190, 'Performance monitor', { a: pm });
    [['JS heap size', 38, 6], ['DOM nodes', 1200, 40], ['JS event listeners', 120, 5]].forEach(function (r, i) {
      var rep = Math.floor(K.clamp((t - 2) / 4.5) * 6), v = r[1] + rep * r[2];
      K.text(r[0], 64, 136 + i * 42, { size: 19, a: pm });
      K.text(String(v) + (i === 0 ? ' MB' : ''), 500, 136 + i * 42, { size: 20, mono: true, color: rep ? P.red : P.ink, align: 'right', a: pm });
    });
    K.text('repeat: open and close the modal', 820, 120, { size: 19, color: P.warm, align: 'center', a: K.win(t, 2, 7.6) });
    var S = [['Snapshot 1', 8, P.acc], ['action', 8.8, P.muted], ['Snapshot 2', 9.6, P.acc], ['action again', 10.4, P.muted], ['Snapshot 3', 11.2, P.warm]];
    S.forEach(function (s, i) {
      var x = 640 + i * 124, q = K.p(t, s[1]), isS = i % 2 === 0;
      if (isS) K.box(x - 54, 160, 108, 70, { stroke: s[2], a: q });
      K.text(isS ? 'S' + (i / 2 + 1) : '→ act', x, 195, { size: isS ? 24 : 17, weight: 700, mono: isS, color: isS ? s[2] : P.muted, align: 'center', a: q });
    });
    K.text('heap snapshots', 888, 254, { size: 17, color: P.muted, align: 'center', a: K.p(t, 8) });
    var cmp = K.p(t, 14.2);
    K.panel(40, 300, 560, 270, 'Snapshot 3 · allocated between 1 and 2', { a: cmp });
    [['Constructor', 'Count', P.muted], ['Detached <div>', '20', P.red], ['ModalState', '20', P.warm], ['(closure)', '40', P.warm]].forEach(function (r, i) {
      var q = i ? K.p(t, 15 + i * 0.6) : cmp, y = 360 + i * 50, bad = i === 1 && t > 20.2;
      if (bad) K.box(52, y - 22, 536, 44, { fill: 'rgba(252,129,129,.14)', r: 6, a: q });
      K.text(r[0], 64, y, { size: 19, mono: i > 0, color: i ? (i === 1 ? P.red : P.ink) : P.muted, a: q });
      K.text(r[1], 570, y, { size: 19, mono: true, color: i ? P.ink : P.muted, align: 'right', a: q });
    });
    var rt = K.p(t, 20.4);
    K.box(640, 300, 600, 270, { stroke: P.purple, a: rt });
    K.text('Retainers', 664, 328, { size: 19, weight: 700, color: P.purple, a: rt });
    ['Detached <div>', 'in  cache  (Array)', 'in  Window / global'].forEach(function (s, i) {
      var q = K.p(t, 20.8 + i * 0.7), y = 380 + i * 60;
      K.text(s, 684 + i * 30, y, { size: 19, mono: true, color: i === 2 ? P.purple : P.ink, a: q });
      if (i) K.arrow(672 + i * 30, y - 44, 672 + i * 30, y - 14, { p: q, color: P.muted, head: 9, lw: 2 });
    });
    K.text('break this link', 1060, 500, { size: 18, color: P.green, align: 'center', a: K.p(t, 23) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 22 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Alive = reachable from a root; cycles alone are not enough',
     'Mark, sweep, compact; young generation scavenged, old generation mark-compacted',
     'WeakMap keys do not stay alive; WeakRef timing is unpredictable',
     'A leak is unwanted reachability: listeners, timers, detached DOM, caches',
     'Confirm, take three snapshots, follow the retainers, break the link'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(160, y, true, 0.9, q);
      K.text(s, 192 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 22 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
