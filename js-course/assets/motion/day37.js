/* Day 37 in motion: real-time transports and how to run them, OT vs CRDTs, then offline-first: service workers, caching strategies, the outbox and conflicts.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day37', {
  kicker: 'JavaScript: Zero to Architect · Day 37',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 37: pushing updates in real time, editing together, and apps that keep working offline.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Real-time + offline', 0, 0, { size: 92, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 37 · Real-time and offline systems', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Transports', 'OT and CRDTs', 'Offline-first'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ transports */
{ d: 26, title: 'Choosing a transport',
  caps: [
    [0.3, 'Real-time means the server can tell the client something now. Polling just asks again and again: simple, but mostly empty answers.'],
    [7, 'Long polling sends a request that the server holds open until there is news. Then the client asks again.'],
    [12, 'Server-Sent Events: one HTTP response stays open and the server pushes events down it. One-way, with automatic reconnect.'],
    [18, 'A WebSocket is a two-way channel: low latency, text or binary. Rule: pick the simplest transport that meets the need.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    function lane(y0, title, n1, n2, col, t0) {
      var a = K.p(t, t0), c = y0 + 22, s = y0 + 72;
      K.text(title, 40, y0 + 47, { size: 21, weight: 700, color: col, a: a });
      K.text('client', 296, c, { size: 16, color: P.muted, align: 'right', a: a });
      K.text('server', 296, s, { size: 16, color: P.muted, align: 'right', a: a });
      K.box(310, c - 1, 690, 2, { fill: P.line, r: 1, a: a }); K.box(310, s - 1, 690, 2, { fill: P.line, r: 1, a: a });
      K.text(n1, 1030, y0 + 34, { size: 16, color: P.muted, a: K.p(t, t0 + 1) });
      K.text(n2, 1030, y0 + 60, { size: 16, color: P.muted, a: K.p(t, t0 + 1) });
      return { c: c, s: s };
    }
    function up(x, L, at, col) { K.arrow(x, L.c + 4, x + 28, L.s - 6, { p: K.p(t, at, 0.4), color: col || P.blue, lw: 2.5, head: 10 }); }
    function down(x, L, at, col) { K.arrow(x, L.s - 4, x + 28, L.c + 6, { p: K.p(t, at, 0.4), color: col || P.green, lw: 2.5, head: 10 }); }
    var A = lane(92, 'Polling', 'simple, wasteful,', 'higher latency', P.ink, 0.4);
    [330, 470, 610, 750, 890].forEach(function (x, i) {
      var at = 1.2 + i * 0.9; up(x, A, at); down(x + 40, A, at + 0.4, i === 2 ? P.green : P.muted);
      if (i !== 2) K.text('empty', x + 54, A.c - 14, { size: 16, color: P.muted, align: 'center', a: K.p(t, at + 0.7) });
    });
    var B = lane(202, 'Long polling', 'server holds the', 'request until news', P.ink, 7.2);
    up(330, B, 7.8); K.box(358, B.s - 5, 260 * K.p(t, 8.2, 2), 10, { fill: P.warm, r: 5 });
    K.text('held open…', 488, B.s + 22, { size: 16, color: P.warm, align: 'center', a: K.p(t, 8.4) });
    down(620, B, 10.3); up(670, B, 10.8); K.box(698, B.s - 5, 200 * K.p(t, 11.1, 1.2), 10, { fill: P.warm, r: 5 });
    var C = lane(312, 'SSE', 'server → client,', 'auto-reconnect', P.ink, 12.2);
    up(330, C, 12.7); K.text('GET  Accept: text/event-stream', 380, C.c - 14, { size: 16, mono: true, color: P.blue, a: K.p(t, 12.9) });
    [450, 560, 670, 780, 890].forEach(function (x, i) { down(x, C, 13.8 + i * 0.6); });
    var D = lane(422, 'WebSocket', 'two-way, binary;', 'needs ops care', P.ink, 18.2);
    up(330, D, 18.7, P.purple); K.text('upgrade', 330, D.s + 22, { size: 16, color: P.purple, a: K.p(t, 18.9) });
    [450, 520, 620, 700, 790, 880].forEach(function (x, i) { if (i % 2) up(x, D, 19.4 + i * 0.45, P.acc); else down(x, D, 19.4 + i * 0.45, P.green); });
    K.chip('simplest that fits: polling → SSE → WebSocket', 640, 566, { size: 18, stroke: P.acc, a: K.p(t, 22.5) });
  } },

/* 3 ─ running real-time at scale */
{ d: 28, title: 'Real-time in production',
  caps: [
    [0.3, 'At scale, clients connect through a load balancer to a pool of socket servers. Each server holds thousands of open connections.'],
    [7, 'A user on server 1 and a friend on server 3 need the same message, so servers share a pub/sub backplane that fans events out.'],
    [14, 'Every connection needs care: heartbeats, reconnect with backoff and jitter, resume from the last event id, and auth on connect.'],
    [21, 'Do not flood slow clients: apply backpressure. Presence and cursors are ephemeral, so send them rarely and never store them.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    var CY = [120, 190, 260, 330, 400, 470];
    CY.forEach(function (y, i) {
      var q = K.back((t - 0.6 - i * 0.15) / 0.4); if (q <= 0) return;
      g.save(); g.translate(110, y); g.scale(q, q);
      K.box(-46, -22, 92, 44, { stroke: i === 0 || i === 5 ? P.acc : P.line, a: K.clamp(q) });
      K.text(i === 0 ? 'you' : i === 5 ? 'friend' : 'client', 0, 1, { size: 16, align: 'center', a: K.clamp(q) });
      g.restore();
      K.arrow(160, y, 270, 295, { p: K.p(t, 1.6, 0.5), color: P.line, lw: 2, head: 8 });
    });
    K.box(280, 230, 130, 130, { stroke: P.blue, a: K.p(t, 1.4) });
    K.text('load', 345, 282, { size: 19, weight: 700, align: 'center', a: K.p(t, 1.4) });
    K.text('balancer', 345, 308, { size: 19, weight: 700, align: 'center', a: K.p(t, 1.4) });
    var SY = [150, 295, 440];
    SY.forEach(function (y, i) {
      var q = K.p(t, 2.6 + i * 0.4);
      K.arrow(416, 295, 494, y, { p: q, color: P.line, lw: 2, head: 9 });
      K.box(500, y - 48, 200, 96, { stroke: P.purple, a: q });
      K.text('socket server ' + (i + 1), 600, y - 14, { size: 18, weight: 700, align: 'center', a: q });
      K.text('~50k connections', 600, y + 18, { size: 16, color: P.muted, align: 'center', a: q });
      K.arrow(706, y, 794, y, { p: K.p(t, 7.6 + i * 0.2), color: P.warm, lw: 2, head: 9 });
      K.arrow(794, y + 14, 706, y + 14, { p: K.p(t, 7.8 + i * 0.2), color: P.warm, lw: 2, head: 9 });
    });
    var bp = K.p(t, 7.3);
    K.box(800, 100, 170, 400, { stroke: P.warm, a: bp });
    K.text('pub/sub', 885, 280, { size: 21, weight: 700, align: 'center', a: bp });
    K.text('backplane', 885, 310, { size: 21, weight: 700, align: 'center', a: bp });
    K.text('fan-out', 885, 346, { size: 16, color: P.warm, align: 'center', a: bp });
    /* one message travels: you → s1 → backplane → s3 → friend */
    var pts = [[150, 120], [600, 150], [885, 160], [885, 430], [600, 440], [150, 470]], m = K.clamp((t - 9) / 4);
    if (t > 9 && t < 14) {
      var seg = Math.min(4, Math.floor(m * 5)), f = m * 5 - seg, a0 = pts[seg], a1 = pts[seg + 1];
      g.save(); g.fillStyle = P.acc; g.beginPath(); g.arc(a0[0] + (a1[0] - a0[0]) * f, a0[1] + (a1[1] - a0[1]) * f, 9, 0, 7); g.fill(); g.restore();
    }
    [['heartbeat: ping / pong', P.acc, 14.4], ['backoff + jitter', P.acc, 15.4], ['resume: Last-Event-ID', P.acc, 16.4], ['auth on connect', P.acc, 17.4],
     ['backpressure', P.warm, 21.4], ['presence: ephemeral', P.blue, 23]].forEach(function (c, i) {
      K.chip(c[0], 1115, 130 + i * 66, { size: 17, stroke: c[1], a: K.p(t, c[2]) });
    });
    var sl = K.p(t, 21.8);
    K.text('slow client: queue capped, drop or merge', 40, 548, { size: 17, color: P.warm, a: sl });
  } },

/* 4 ─ OT */
{ d: 28, title: 'Operational transformation',
  caps: [
    [0.3, 'Collaborative editing: two people change the same text at the same time. Both start with "ac".'],
    [5, 'Site A inserts b at position 1. At the same moment, site B inserts d at position 2. They send each other their operations.'],
    [11.5, 'Applied as they are, A ends with "abdc" and B with "abcd". The copies have diverged.'],
    [17, 'OT transforms the incoming op: A inserted before position 2, so B\'s insert shifts to 3. Both converge on "abcd", with a server ordering ops.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    function doc(s, x, y, a, hi, col) {
      for (var i = 0; i < s.length; i++) {
        K.box(x + i * 46, y - 22, 40, 44, { stroke: i === hi ? (col || P.warm) : P.line, lw: i === hi ? 3 : 2, r: 8, a: a });
        K.text(s[i], x + i * 46 + 20, y, { size: 24, mono: true, align: 'center', color: i === hi ? (col || P.warm) : P.ink, a: a });
      }
    }
    var XA = 150, XB = 790;
    K.text('Site A', XA, 98, { size: 22, weight: 700, color: P.blue, a: K.p(t, 0.3) });
    K.text('Site B', XB, 98, { size: 22, weight: 700, color: P.purple, a: K.p(t, 0.3) });
    [['start', 150, 0.6], ['edit', 240, 5.2], ['naive', 410, 11.7], ['OT', 510, 17.2]].forEach(function (r) {
      K.text(r[0], 40, r[1], { size: 17, color: P.muted, a: K.p(t, r[2]) });
    });
    doc('ac', XA, 150, K.p(t, 1)); doc('ac', XB, 150, K.p(t, 1));
    doc('abc', XA, 240, K.p(t, 5.6), 1); K.text('insert b @1', XA + 160, 240, { size: 18, mono: true, color: P.blue, a: K.p(t, 5.8) });
    doc('acd', XB, 240, K.p(t, 6.4), 2); K.text('insert d @2', XB + 160, 240, { size: 18, mono: true, color: P.purple, a: K.p(t, 6.6) });
    K.arrow(XA + 150, 270, XB + 90, 372, { p: K.p(t, 8.2, 0.8), color: P.blue, lw: 2.5 });
    K.arrow(XB + 60, 270, XA + 200, 372, { p: K.p(t, 8.6, 0.8), color: P.purple, lw: 2.5 });
    K.text('b @1', 850, 343, { size: 17, mono: true, color: P.blue, align: 'right', a: K.p(t, 8.6) });
    K.text('d @2', 380, 343, { size: 17, mono: true, color: P.purple, a: K.p(t, 9) });
    var nv = K.p(t, 12) * (1 - 0.55 * K.p(t, 17.4));
    doc('abdc', XA, 410, nv, 2, P.red); K.text('applies d @2', XA + 205, 410, { size: 17, mono: true, color: P.muted, a: nv });
    doc('abcd', XB, 410, nv, 1, P.purple); K.text('applies b @1', XB + 205, 410, { size: 17, mono: true, color: P.muted, a: nv });
    K.mark(600, 410, false, 0.8, K.p(t, 13.4)); K.text('diverged', 624, 410, { size: 19, color: P.red, a: K.p(t, 13.4) });
    var ot = K.p(t, 18.2);
    doc('abcd', XA, 510, ot, 3, P.green); K.text('d @2 → d @3', XA + 205, 510, { size: 17, mono: true, color: P.warm, a: K.p(t, 18.6) });
    doc('abcd', XB, 510, K.p(t, 19.6), 1, P.green); K.text('b @1 unchanged', XB + 205, 510, { size: 17, mono: true, color: P.muted, a: K.p(t, 19.8) });
    K.mark(590, 510, true, 0.8, K.p(t, 20.6)); K.text('converged', 614, 510, { size: 19, color: P.green, a: K.p(t, 20.6) });
    K.chip('server orders all ops', 560, 150, { size: 17, stroke: P.warm, a: K.p(t, 23.5) });
  } },

/* 5 ─ CRDTs and clocks */
{ d: 28, title: 'CRDTs and clocks',
  caps: [
    [0.3, 'A CRDT takes the other path: design the data so merging is always safe. Here, a grow-only counter with one slot per replica.'],
    [7, 'Merge takes the maximum of each slot. The replicas swap states, and each one merges the other in.'],
    [12.5, 'Both reach a: 2, b: 3, a total of 5. Merge order does not matter, and merging the same state twice changes nothing.'],
    [19, 'Wall clocks skew, so use logical clocks and a tie-breaker: on a tie, the higher replica id wins everywhere. Yjs and Automerge do this for text.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    function rep(x, y, title, slots, a, hi, tot) {
      K.box(x, y, 340, 120, { stroke: hi != null ? P.green : P.acc, a: a });
      K.text(title, x + 20, y + 26, { size: 19, weight: 700, a: a });
      slots.forEach(function (s, i) { K.chip(s, x + 80 + i * 120, y + 78, { size: 21, mono: true, stroke: i === hi ? P.green : P.line, color: i === hi ? P.green : P.ink, a: a }); });
      if (tot) K.text(tot, x + 320, y + 26, { size: 18, color: P.green, align: 'right', a: a });
    }
    rep(60, 96, 'Replica 1', ['a: 2', 'b: 1'], K.p(t, 0.8));
    rep(880, 96, 'Replica 2', ['a: 1', 'b: 3'], K.p(t, 1.3));
    K.arrow(406, 150, 874, 150, { p: K.p(t, 7.4, 0.7), color: P.acc });
    K.text('state of 1', 640, 134, { size: 17, color: P.acc, align: 'center', a: K.p(t, 7.6) });
    K.arrow(874, 194, 406, 194, { p: K.p(t, 8, 0.7), color: P.acc });
    K.text('state of 2', 640, 214, { size: 17, color: P.acc, align: 'center', a: K.p(t, 8.2) });
    K.chip('merge = max per slot', 640, 280, { size: 18, stroke: P.warm, a: K.p(t, 9.2) });
    K.arrow(230, 222, 230, 270, { p: K.p(t, 12.6, 0.4), color: P.green });
    K.arrow(1050, 222, 1050, 270, { p: K.p(t, 12.6, 0.4), color: P.green });
    rep(60, 276, 'Replica 1 merged', ['a: 2', 'b: 3'], K.p(t, 13), 1, 'total 5');
    rep(880, 276, 'Replica 2 merged', ['a: 2', 'b: 3'], K.p(t, 13.4), 0, 'total 5');
    K.chip('order does not matter', 640, 340, { size: 17, stroke: P.green, a: K.p(t, 14.6) });
    K.chip('duplicates are harmless', 640, 392, { size: 17, stroke: P.green, a: K.p(t, 16) });
    var code = ['const lww = (x, y) => x.t !== y.t', '  ? (x.t > y.t ? x : y)', '  : (x.id > y.id ? x : y);  // tie-break', 'lww({ t: 1, id: "a" }, { t: 1, id: "b" }) // b'];
    K.panel(60, 430, 680, 158, '', { a: K.p(t, 19.2) });
    K.code(code, 84, 446, { size: 18, lh: 1.45, n: K.typed(t, code, [19.5, 20.6, 21.2, 22.2], 40), t: t, a: K.p(t, 19.2), hi: t > 22.2 ? 3 : -1, w: 650 });
    var c = K.p(t, 19.4);
    K.box(780, 430, 440, 158, { stroke: P.line, a: c });
    K.mark(808, 462, false, 0.7, c); K.text('wall clocks skew', 832, 462, { size: 18, color: P.red, a: c });
    K.mark(808, 502, true, 0.7, K.p(t, 20.4)); K.text('Lamport: max(seen) + 1', 832, 502, { size: 18, a: K.p(t, 20.4) });
    K.text('Yjs · Automerge: CRDTs for text', 804, 548, { size: 17, color: P.blue, a: K.p(t, 24.4) });
    K.text('cost: metadata, tombstones', 804, 574, { size: 16, color: P.muted, a: K.p(t, 25.2) });
  } },

/* 6 ─ service worker */
{ d: 27, title: 'The service worker',
  caps: [
    [0.3, 'Offline-first starts with a service worker: a background script between your page and the network, like a programmable proxy.'],
    [7, 'Register it from the page. On install, it precaches the app shell, so the app can start with no network at all.'],
    [13, 'A new version waits until old tabs close, then activates and deletes old caches. skipWaiting skips the wait, carefully.'],
    [20, 'From then on every request fires a fetch event, and your code decides: cache, network, or both. Service workers need HTTPS.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    K.box(60, 96, 240, 124, { stroke: P.acc, a: K.p(t, 0.4) });
    K.text('Page', 180, 140, { size: 22, weight: 700, align: 'center', a: K.p(t, 0.4) });
    K.text('your app', 180, 176, { size: 17, color: P.muted, align: 'center', a: K.p(t, 0.4) });
    K.box(470, 90, 340, 136, { stroke: P.purple, lw: 3, a: K.p(t, 1.2) });
    K.text('Service worker', 640, 136, { size: 24, weight: 700, align: 'center', a: K.p(t, 1.2) });
    K.text('programmable network proxy', 640, 176, { size: 17, color: P.muted, align: 'center', a: K.p(t, 1.6) });
    K.arrow(306, 158, 464, 158, { p: K.p(t, 2.2, 0.5), color: P.acc });
    K.text('requests', 385, 140, { size: 16, color: P.acc, align: 'center', a: K.p(t, 2.4) });
    K.box(990, 90, 230, 58, { stroke: P.blue, a: K.p(t, 3) });
    K.text('Network', 1105, 119, { size: 19, weight: 700, align: 'center', a: K.p(t, 3) });
    K.box(990, 168, 230, 58, { stroke: P.warm, a: K.p(t, 3.4) });
    K.text('Cache Storage', 1105, 197, { size: 19, weight: 700, align: 'center', a: K.p(t, 3.4) });
    K.arrow(816, 130, 984, 119, { p: K.p(t, 3.2, 0.5), color: P.blue });
    K.arrow(816, 186, 984, 197, { p: K.p(t, 3.6, 0.5), color: P.warm });
    var X = [130, 365, 600, 835, 1090], N = [['register', 'from the page', 7.4, P.acc], ['install', 'precache shell', 9.4, P.warm], ['waiting', 'old tabs open', 13.3, P.muted],
      ['activate', 'delete old caches', 15.4, P.green], ['fetch', 'strategy decides', 20.3, P.blue]];
    N.forEach(function (n, i) {
      var q = K.back((t - n[2]) / 0.5);
      if (q > 0) K.chip(n[0], X[i], 320, { s: q, size: 20, stroke: n[3], weight: 700 });
      K.text(n[1], X[i], 366, { size: 16, color: P.muted, align: 'center', a: K.p(t, n[2] + 0.3) });
      if (i) K.arrow(X[i - 1] + 62, 320, X[i] - 62, 320, { p: K.p(t, n[2] - 0.3, 0.4), color: P.muted, lw: 2, head: 9 });
    });
    K.curve(400, 300, 600, 220, 800, 300, { p: K.p(t, 17.6, 0.8), color: P.warm, dash: [7, 6], lw: 2.5 });
    K.text('skipWaiting()', 600, 244, { size: 16, mono: true, color: P.warm, align: 'center', a: K.p(t, 18) });
    var code = ['navigator.serviceWorker.register("/sw.js");', '// sw.js', 'self.addEventListener("install", (e) =>', '  e.waitUntil(caches.open("shell-v3")', '    .then((c) => c.addAll(SHELL))));'];
    K.panel(60, 408, 720, 180, '', { a: K.p(t, 7.2) });
    K.code(code, 84, 424, { size: 18, lh: 1.45, n: K.typed(t, code, [7.5, 9.6, 9.9, 10.6, 11.3], 36), t: t, a: K.p(t, 7.2) });
    var h = K.p(t, 21.4);
    K.box(820, 408, 400, 180, { stroke: P.line, a: h });
    K.lock(852, 446, 0.9, P.warm, h); K.text('HTTPS only (localhost is ok)', 876, 446, { size: 18, a: h });
    K.mark(852, 496, true, 0.7, K.p(t, 22.4)); K.text('version cache names', 876, 496, { size: 18, a: K.p(t, 22.4) });
    K.mark(852, 546, true, 0.7, K.p(t, 23.2)); K.text('keep a kill switch', 876, 546, { size: 18, a: K.p(t, 23.2) });
  } },

/* 7 ─ caching strategies */
{ d: 26, title: 'Caching strategies',
  caps: [
    [0.3, 'Pick a caching strategy per resource. Cache-first answers from the cache and only uses the network on a miss: ideal for versioned files.'],
    [8, 'Network-first tries the network for fresh data, and falls back to the cache when offline. Good for important API data.'],
    [14, 'Stale-while-revalidate answers instantly from the cache, then fetches a fresh copy in the background for next time.'],
    [20.5, 'Never cache writes, and never put API data on cache-first: it would stay stale forever.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    function row(yc, title, use, t0) {
      var a = K.p(t, t0);
      K.text(title, 60, yc - 16, { size: 22, weight: 700, a: a });
      K.text(use, 60, yc + 18, { size: 16, color: P.muted, a: a });
      K.chip('request', 410, yc, { size: 17, stroke: P.line, a: a });
      K.box(560, yc - 56, 180, 46, { stroke: P.warm, a: a, r: 8 }); K.text('cache', 650, yc - 33, { size: 18, align: 'center', a: a });
      K.box(560, yc + 10, 180, 46, { stroke: P.blue, a: a, r: 8 }); K.text('network', 650, yc + 33, { size: 18, align: 'center', a: a });
      K.chip('response', 1120, yc, { size: 17, stroke: P.green, a: K.p(t, t0 + 1.8) });
    }
    var y1 = 150, y2 = 300, y3 = 450;
    row(y1, 'Cache-first', 'static, versioned files', 0.6);
    K.arrow(458, y1 - 6, 552, y1 - 30, { p: K.p(t, 1.4, 0.4), color: P.warm });
    K.mark(770, y1 - 33, true, 0.65, K.p(t, 1.9)); K.text('hit', 792, y1 - 33, { size: 17, color: P.green, a: K.p(t, 1.9) });
    K.arrow(820, y1 - 24, 1050, y1 - 4, { p: K.p(t, 2.2, 0.5), color: P.green });
    K.arrow(458, y1 + 6, 552, y1 + 30, { p: K.p(t, 3.4, 0.4), color: P.muted, dash: [6, 6], lw: 2 });
    K.text('only on a miss', 760, y1 + 33, { size: 16, color: P.muted, a: K.p(t, 3.6) });
    row(y2, 'Network-first', 'important API data', 8.2);
    K.arrow(458, y2 + 6, 552, y2 + 30, { p: K.p(t, 9.2, 0.4), color: P.blue });
    K.mark(770, y2 + 33, false, 0.65, K.p(t, 9.8)); K.text('offline', 792, y2 + 33, { size: 17, color: P.red, a: K.p(t, 9.8) });
    K.arrow(458, y2 - 6, 552, y2 - 30, { p: K.p(t, 10.6, 0.4), color: P.warm });
    K.text('fallback', 760, y2 - 33, { size: 17, color: P.warm, a: K.p(t, 10.8) });
    K.arrow(850, y2 - 24, 1050, y2 - 4, { p: K.p(t, 11.2, 0.5), color: P.green });
    row(y3, 'Stale-while-revalidate', 'feeds, avatars, content', 14.2);
    K.arrow(458, y3 - 6, 552, y3 - 30, { p: K.p(t, 15, 0.4), color: P.warm });
    K.text('instant', 760, y3 - 33, { size: 17, color: P.green, a: K.p(t, 15.4) });
    K.arrow(830, y3 - 24, 1050, y3 - 4, { p: K.p(t, 15.6, 0.5), color: P.green });
    K.arrow(458, y3 + 6, 552, y3 + 30, { p: K.p(t, 16.6, 0.4), color: P.blue });
    K.curve(746, y3 + 30, 800, y3, 746, y3 - 30, { p: K.p(t, 17.6, 0.6), color: P.blue, lw: 2.5 });
    K.text('update for next time', 820, y3 + 33, { size: 16, color: P.blue, a: K.p(t, 18) });
    K.chip('✗ never cache POST / writes', 340, 556, { size: 17, stroke: P.red, color: P.red, a: K.p(t, 20.8) });
    K.chip('✗ cache-first API data = stale forever', 860, 556, { size: 17, stroke: P.red, color: P.red, a: K.p(t, 22.4) });
  } },

/* 8 ─ the outbox */
{ d: 26, title: 'Offline writes: the outbox',
  caps: [
    [0.3, 'Writes made offline go into an outbox stored in IndexedDB. Each one gets an id, and the UI shows it as pending.'],
    [7, 'When the network returns, flush the outbox in order. Here #2 fails, so it stays queued while #1 and #3 are sent.'],
    [14, 'The next flush sends #2. Because every write carries an id, a retry that already reached the server is ignored, not applied twice.'],
    [20, 'Never drop edits silently: show offline state, pending changes and sync status. Background Sync can retry where supported.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    /* app */
    var ua = K.p(t, 0.3);
    K.box(60, 96, 300, 300, { stroke: P.acc, a: ua });
    K.text('Todo app', 84, 124, { size: 20, weight: 700, a: ua });
    var syncd = t > 15.8 ? K.p(t, 15.8, 0.3) : 0, on = t > 7.6 ? K.p(t, 7.6, 0.3) : 0, off = t < 7.6 ? 1 : 0, mid = t > 7.6 && t < 15.8 ? 1 : 0;
    K.chip('Offline · 3 pending', 210, 168, { size: 16, stroke: P.warm, color: P.warm, a: K.p(t, 0.8) * off });
    K.chip('Syncing · 1 pending', 210, 168, { size: 16, stroke: P.blue, color: P.blue, a: on * mid });
    K.chip('All changes synced', 210, 168, { size: 16, stroke: P.green, color: P.green, a: syncd });
    var items = [['Rename list', 9.2], ['Add "milk"', 15.6], ['Tick "eggs"', 10.4]];
    items.forEach(function (it, i) {
      var y = 236 + i * 52, q = K.p(t, 1.2 + i * 0.8), done = t > it[1] + 0.8;
      K.text(it[0], 84, y, { size: 18, a: q });
      if (done) K.mark(330, y, true, 0.6, q);
      else { g.save(); g.globalAlpha *= q; g.fillStyle = P.warm; g.beginPath(); g.arc(330, y, 7, 0, 7); g.fill(); g.restore(); }
    });
    /* outbox */
    var ob = K.p(t, 0.6);
    K.box(420, 96, 340, 300, { stroke: P.warm, a: ob });
    K.text('Outbox · IndexedDB', 444, 124, { size: 20, weight: 700, color: P.warm, a: ob });
    /* server */
    var sv = K.p(t, 0.9);
    K.box(960, 96, 260, 300, { stroke: P.green, a: sv });
    K.text('Server', 984, 124, { size: 20, weight: 700, color: P.green, a: sv });
    /* link */
    K.box(766, 246, 188, 4, { fill: on > 0.5 ? P.green : P.line, r: 2, a: ob });
    K.mark(860, 248, false, 0.8, K.p(t, 1) * off); K.text('offline', 860, 218, { size: 16, color: P.red, align: 'center', a: K.p(t, 1) * off });
    K.text('online', 860, 218, { size: 16, color: P.green, align: 'center', a: on });
    /* queue items: [label, appear, slot y, send start, server y] */
    var Q = [['#1 rename', 1.4, 180, 8.4, 180], ['#2 add', 2.2, 250, 15, 320], ['#3 tick', 3, 320, 9.6, 250]];
    Q.forEach(function (q, i) {
      var a = K.back((t - q[1]) / 0.5); if (a <= 0) return;
      var m = K.p(t, q[3], 0.8), x = 590 + (1090 - 590) * m, y = q[2] + (q[4] - q[2]) * m;
      var fail = i === 1 && t > 8.8 && t < 15;
      var sh = i === 1 && t > 8.8 && t < 9.5 ? Math.sin(t * 50) * 5 : 0;
      K.chip(q[0], x + sh, y, { s: Math.min(a, 1.2), size: 18, mono: true, stroke: fail ? P.red : m >= 1 ? P.green : P.warm, color: fail ? P.red : P.ink });
    });
    K.text('failed: stays queued', 590, 286, { size: 16, color: P.red, align: 'center', a: K.win(t, 9, 15) });
    /* bottom */
    var code = ['outbox.add({ id: 2, op: "add milk" });', 'await outbox.flush();  // failures stay queued'];
    K.panel(60, 430, 700, 110, '', { a: K.p(t, 1.6) });
    K.code(code, 84, 452, { size: 19, lh: 1.6, n: K.typed(t, code, [1.8, 7.4], 34), t: t, a: K.p(t, 1.6) });
    var dd = K.p(t, 17.2);
    K.box(800, 430, 420, 110, { stroke: P.line, a: dd });
    K.text('retry of #2 arrives again', 824, 462, { size: 18, a: dd });
    K.mark(836, 504, true, 0.65, K.p(t, 18)); K.text('id 2 already applied: skip', 858, 504, { size: 18, color: P.green, a: K.p(t, 18) });
    K.chip('show sync status', 260, 568, { size: 16, stroke: P.acc, a: K.p(t, 20.4) });
    K.chip('never drop edits', 520, 568, { size: 16, stroke: P.warm, a: K.p(t, 21) });
    K.chip('Background Sync: retry later', 860, 568, { size: 16, stroke: P.blue, a: K.p(t, 22.4) });
  } },

/* 9 ─ conflicts */
{ d: 24, title: 'Resolving conflicts',
  caps: [
    [0.3, 'Conflicts: the same note is edited offline on a phone and on a laptop. The phone changes the title; the laptop ticks done.'],
    [6.5, 'Last-write-wins keeps whichever version arrives last. Simple, but the phone\'s title change is lost.'],
    [11.5, 'A field-level merge keeps both changes, because they touched different fields.'],
    [16.5, 'If both changed the same field, send the version you edited as an ETag. The server answers 412, and the user resolves it. Or use a CRDT.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    function card(x, y, w, head, l1, l2, a, c1, c2) {
      K.box(x, y, w, 110, { stroke: P.line, a: a });
      K.text(head, x + 20, y + 24, { size: 17, weight: 700, color: P.muted, a: a });
      K.text(l1, x + 20, y + 58, { size: 19, mono: true, color: c1 || P.ink, a: a });
      K.text(l2, x + 20, y + 88, { size: 19, mono: true, color: c2 || P.ink, a: a });
    }
    card(500, 84, 280, 'note v1', 'title: Groceries', 'done: false', K.p(t, 0.4));
    card(90, 150, 300, 'phone, offline', 'title: Shopping', 'done: false', K.p(t, 1.4), P.warm);
    card(890, 150, 300, 'laptop, offline', 'title: Groceries', 'done: true', K.p(t, 2.2), null, P.warm);
    K.arrow(496, 150, 396, 190, { p: K.p(t, 1.2, 0.4), color: P.muted, lw: 2 });
    K.arrow(784, 150, 884, 190, { p: K.p(t, 2, 0.4), color: P.muted, lw: 2 });
    var R = [[60, 'Last-write-wins', 6.7, P.red], [460, 'Field-level merge', 11.7, P.green], [860, 'Same field: ETag', 16.7, P.blue]];
    R.forEach(function (r) {
      var a = K.p(t, r[2]);
      K.box(r[0], 316, 360, 240, { stroke: r[3], a: a });
      K.text(r[1], r[0] + 20, 344, { size: 21, weight: 700, color: r[3], a: a });
    });
    var a1 = K.p(t, 7.2);
    K.text('title: Groceries', 80, 392, { size: 19, mono: true, a: a1 });
    K.text('done: true', 80, 424, { size: 19, mono: true, a: a1 });
    K.box(78, 392, 186 * K.p(t, 8.4, 0.5), 2, { fill: P.red, r: 1 });
    K.mark(96, 480, false, 0.75, K.p(t, 8.6)); K.text('"Shopping" is lost', 120, 480, { size: 18, color: P.red, a: K.p(t, 8.6) });
    K.text('laptop arrived last', 80, 520, { size: 16, color: P.muted, a: K.p(t, 9.2) });
    var a2 = K.p(t, 12.2);
    K.text('title: Shopping', 480, 392, { size: 19, mono: true, color: P.green, a: a2 });
    K.text('done: true', 480, 424, { size: 19, mono: true, color: P.green, a: K.p(t, 12.6) });
    K.mark(496, 480, true, 0.75, K.p(t, 13.4)); K.text('both edits kept', 520, 480, { size: 18, color: P.green, a: K.p(t, 13.4) });
    K.text('different fields: no clash', 480, 520, { size: 16, color: P.muted, a: K.p(t, 14) });
    K.text('PUT  If-Match: "v1"', 880, 392, { size: 18, mono: true, a: K.p(t, 17.4) });
    K.text('412 Precondition Failed', 880, 424, { size: 18, mono: true, color: P.red, a: K.p(t, 18.4) });
    K.text('→ show both, user picks', 880, 470, { size: 18, color: P.blue, a: K.p(t, 19.6) });
    K.text('or a CRDT merges for you', 880, 520, { size: 16, color: P.muted, a: K.p(t, 21.2) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 37 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Polling, long polling, SSE, WebSocket: the simplest that fits',
     'Heartbeats, backoff + jitter, resume, backpressure, pub/sub fan-out',
     'OT transforms operations; CRDTs merge states in any order',
     'Service worker: install, activate, fetch; a strategy per resource',
     'Outbox with ids; resolve conflicts by merge, ETag or CRDT'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(210, y, true, 0.9, q);
      K.text(s, 242 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 37 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
