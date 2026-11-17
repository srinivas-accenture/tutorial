/* Day 36 in motion: the five-step design framework, back-of-envelope estimates and budgets, then a news feed and a chat app designed end to end.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day36', {
  kicker: 'JavaScript: Zero to Architect · Day 36',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 36: a toolkit for frontend system design, and two classic designs built with it.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('System design', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 36 · Frontend system design toolkit', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Five-step framework', 'Rough numbers', 'Feed and chat'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the framework */
{ d: 30, title: 'The five-step framework',
  caps: [
    [0.3, 'A design interview rewards structure. Use the same five steps every time, in the same order.'],
    [5, 'One: requirements. What it must do, how well it must do it (latency, scale, offline, accessibility), and what is out of scope.'],
    [12, 'Two: architecture, the boxes and arrows. Three: the data model and API. Most frontend problems are data-flow problems.'],
    [18.5, 'Four: cross-cutting concerns such as performance, accessibility and security. Five: operate it, with metrics, flags and rollback.'],
    [24, 'Spend the first 5 to 8 minutes on requirements, then go deep on the riskiest one or two areas.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    var S = [['Requirements', 'what + how well', 'scale, offline, a11y', 5.2, P.acc],
             ['Architecture', 'boxes and arrows', 'rendering, caching', 12.3, P.blue],
             ['Data + API', 'entities, endpoints', 'pagination, realtime', 14.6, P.blue],
             ['Cross-cutting', 'performance, a11y', 'security, privacy', 18.8, P.purple],
             ['Operate', 'metrics, RUM', 'flags, rollback', 21.4, P.green]];
    S.forEach(function (s, i) {
      var x = 40 + i * 244, q = K.back((t - s[3]) / 0.6), a = K.clamp(q);
      if (q <= 0) return;
      g.save(); g.translate(x + 110, 170); g.scale(q, q); g.translate(-x - 110, -170);
      K.box(x, 96, 220, 150, { stroke: s[4], a: a, lw: 2.5 });
      g.save(); g.globalAlpha *= a; g.fillStyle = s[4]; g.beginPath(); g.arc(x + 28, 128, 15, 0, 7); g.fill(); g.restore();
      K.text(String(i + 1), x + 28, 129, { size: 18, weight: 800, color: P.bg, align: 'center', a: a });
      K.text(s[0], x + 52, 128, { size: 21, weight: 700, a: a });
      K.text(s[1], x + 20, 180, { size: 17, color: P.muted, a: a });
      K.text(s[2], x + 20, 212, { size: 17, color: P.muted, a: a });
      g.restore();
      if (i) K.arrow(x - 22, 170, x - 4, 170, { p: K.p(t, s[3] - 0.2, 0.3), color: P.muted, head: 10, lw: 2 });
    });
    /* a 45-minute round as a timeline */
    var sc = 1120 / 45, X = function (m) { return 80 + m * sc; };
    K.text('A 45-minute design round', 80, 340, { size: 20, weight: 700, color: P.muted, a: K.p(t, 5.5) });
    [[0, 8], [8, 20], [20, 30], [30, 39], [39, 45]].forEach(function (m, i) {
      var q = K.p(t, S[i][3] + 0.5, 0.6), w = (X(m[1]) - X(m[0]) - 6) * q;
      if (q <= 0) return;
      K.box(X(m[0]) + 3, 380, w, 54, { fill: P.card, stroke: S[i][4], a: q, r: 8 });
      K.text(S[i][0], X(m[0]) + 3 + (X(m[1]) - X(m[0]) - 6) / 2, 407, { size: 18, weight: 600, align: 'center', a: K.p(t, S[i][3] + 0.9) });
    });
    [0, 10, 20, 30, 40, 45].forEach(function (m) {
      K.text(m + ' min', X(m), 456, { size: 16, color: P.muted, align: 'center', a: K.p(t, 5.5) });
    });
    var d = K.p(t, 24.4);
    K.box(X(0) + 3, 378, X(8) - X(0) - 6, 58, { fill: false, stroke: P.warm, lw: 3.5, r: 8, a: d });
    K.text('5–8 min: scope first', 80, 500, { size: 18, color: P.warm, a: d });
    var b = K.p(t, 25.6);
    g.save(); g.globalAlpha *= b; g.strokeStyle = P.warm; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(X(8) + 6, 476); g.lineTo(X(8) + 6, 486); g.lineTo(X(30) - 6, 486); g.lineTo(X(30) - 6, 476); g.stroke(); g.restore();
    K.text('deep dive: the riskiest 1–2 areas', (X(8) + X(30)) / 2, 512, { size: 18, color: P.warm, align: 'center', a: b });
  } },

/* 3 ─ back-of-envelope */
{ d: 28, title: 'Back-of-envelope numbers',
  caps: [
    [0.3, 'Next, rough numbers. Say the assumptions out loud: one million daily users, twenty requests each.'],
    [6, 'Twenty million requests ÷ 86,400 seconds in a day ≈ 230 requests per second on average.'],
    [11.5, 'Traffic is not flat. With a peak factor of three, plan for about 700 per second.'],
    [16, 'A CDN with a 90% hit rate leaves only about 70 per second for the origin. At 50 KB each, peak bandwidth is about 34 MB/s.'],
    [23, 'Round aggressively: say "about 230", not 231.48. The point is the order of magnitude.']],
  draw: function (K, t) {
    var P = K.P;
    K.panel(40, 84, 380, 262, 'assumptions', { a: K.p(t, 0.2) });
    [['1M daily users', 0.8], ['20 requests each', 1.6], ['peak = 3 × average', 12], ['CDN hit rate 90%', 16.2], ['50 KB per response', 19.5]].forEach(function (r, i) {
      var q = K.p(t, r[1], 0.5);
      K.text('•  ' + r[0], 66 - (1 - q) * 14, 140 + i * 44, { size: 21, a: q });
    });
    var R = [['1M users × 20 requests', '20M / day', 6.2, P.ink],
             ['20M ÷ 86,400 s', '≈ 230 RPS', 7.4, P.acc],
             ['230 × 3 (peak)', '≈ 700 RPS', 12, P.warm],
             ['700 × 10% (CDN misses)', '≈ 70 RPS', 16.8, P.green],
             ['700 × 50 KB', '≈ 34 MB/s', 19.8, P.blue]];
    R.forEach(function (r, i) {
      var y = 120 + i * 56, q = K.p(t, r[2], 0.5), c = K.back((t - r[2] - 0.7) / 0.5);
      K.text(r[0], 470, y, { size: 22, mono: true, a: q });
      K.arrow(860, y, 950, y, { p: K.p(t, r[2] + 0.4, 0.4), color: P.muted, lw: 2, head: 10 });
      if (c > 0) K.chip(r[1], 1090, y, { s: c, size: 21, mono: true, stroke: r[3], color: r[3] });
    });
    /* rounding */
    var rd = K.p(t, 23.4);
    K.box(40, 370, 380, 54, { fill: P.code, stroke: P.line, a: rd });
    K.mark(66, 397, false, 0.7, rd); K.text('231.48', 90, 397, { size: 20, mono: true, color: P.red, a: rd });
    K.mark(230, 397, true, 0.7, K.p(t, 24.2)); K.text('≈ 230', 254, 397, { size: 20, mono: true, color: P.green, a: K.p(t, 24.2) });
    /* the CDN shields the origin */
    var f = K.p(t, 16.4);
    K.box(60, 460, 280, 100, { stroke: P.warm, a: f });
    K.text('Browsers', 200, 492, { size: 22, weight: 700, align: 'center', a: f });
    K.text('700 RPS at peak', 200, 528, { size: 18, color: P.warm, align: 'center', a: f });
    K.arrow(346, 510, 486, 510, { p: K.p(t, 16.8, 0.5), color: P.warm, lw: 12, head: 22 });
    K.box(496, 460, 280, 100, { stroke: P.acc, a: K.p(t, 17) });
    K.text('CDN', 636, 492, { size: 22, weight: 700, align: 'center', a: K.p(t, 17) });
    K.text('90% served here', 636, 528, { size: 18, color: P.acc, align: 'center', a: K.p(t, 17) });
    K.arrow(782, 510, 922, 510, { p: K.p(t, 17.6, 0.5), color: P.green, lw: 3 });
    K.box(932, 460, 280, 100, { stroke: P.green, a: K.p(t, 17.8) });
    K.text('Origin', 1072, 492, { size: 22, weight: 700, align: 'center', a: K.p(t, 17.8) });
    K.text('≈ 70 RPS', 1072, 528, { size: 18, color: P.green, align: 'center', a: K.p(t, 17.8) });
  } },

/* 4 ─ budgets */
{ d: 26, title: 'Budgets: time and capacity',
  caps: [
    [0.3, 'Budgets turn a vague goal into numbers. A 200 ms interaction splits into DNS, TLS, server, network and render.'],
    [7.5, 'If the server needs 150 ms and rendering 100, that is 250: over budget, and you can see it before writing any code.'],
    [13, 'In the browser, keep each chunk of work under 50 ms, and each animation frame under about 16 ms.'],
    [18.5, 'Connections too: 10% of a million users online is 100,000 sockets. At 50,000 per server, that is 2 servers. Round up.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = 4.5, x0 = 80;
    function bar(segs, y, t0, gap) {
      var x = x0;
      segs.forEach(function (sg, i) {
        var w = sg[1] * s, q = K.p(t, t0 + i * gap, 0.4);
        K.box(x + 2, y, w - 4, 52, { fill: P.card, stroke: sg[2], a: q, r: 6 });
        K.text(sg[0] + ' ' + sg[1], Math.min(x + w / 2, (x + 980) / 2), y + 27, { size: 18, align: 'center', a: q });
        x += w;
      });
    }
    var bl = K.p(t, 0.6);
    g.save(); g.globalAlpha *= bl; g.strokeStyle = P.warm; g.lineWidth = 2; g.setLineDash([7, 6]);
    g.beginPath(); g.moveTo(980, 112); g.lineTo(980, 330); g.stroke(); g.restore();
    K.text('200 ms budget', 980, 98, { size: 17, color: P.warm, align: 'center', a: bl });
    bar([['DNS', 20, P.blue], ['TLS', 40, P.blue], ['server', 60, P.purple], ['network', 30, P.blue], ['render', 50, P.acc]], 140, 1.4, 0.9);
    K.text('= 200 ms', 1000, 166, { size: 22, weight: 700, a: K.p(t, 5.6) }); K.mark(1124, 166, true, 0.8, K.p(t, 5.8));
    bar([['server', 150, P.warm], ['render', 100, P.warm]], 240, 8, 0.8);
    var ov = K.p(t, 9.6);
    K.box(982, 236, 222, 60, { fill: 'rgba(252,129,129,.18)', stroke: P.red, a: ov, r: 6 });
    K.mark(1000, 324, false, 0.75, ov); K.text('250 ms: over by 50', 1022, 324, { size: 18, color: P.red, a: ov });
    /* main thread */
    var m = K.p(t, 13.2), x1 = 80, w1 = 560;
    K.text('Main thread · a frame every 16 ms', 80, 390, { size: 18, weight: 700, color: P.muted, a: m });
    K.box(x1, 418, w1, 60, { fill: P.code, stroke: P.line, a: m, r: 6 });
    g.save(); g.globalAlpha *= m * 0.4; g.strokeStyle = P.muted; g.lineWidth = 1;
    for (var x = x1 + 32; x < x1 + w1; x += 32) { g.beginPath(); g.moveTo(x, 420); g.lineTo(x, 476); g.stroke(); }
    g.restore();
    var lo = K.p(t, 13.8) * (1 - K.p(t, 16, 0.6)), ch = K.p(t, 16.2, 0.6);
    K.box(x1 + 40, 426, 360, 44, { fill: 'rgba(252,129,129,.25)', stroke: P.red, a: lo, r: 4 });
    K.text('one 180 ms task', x1 + 220, 448, { size: 17, align: 'center', a: lo });
    for (var k = 0; k < 4; k++) K.box(x1 + 40 + k * 122, 426, 90, 44, { fill: 'rgba(104,211,145,.25)', stroke: P.green, a: ch, r: 4 });
    K.text('long task blocks input and frames', 80, 506, { size: 17, color: P.red, a: lo });
    K.text('chunks under 50 ms: frames paint between', 80, 506, { size: 17, color: P.green, a: ch });
    /* sockets */
    var w = K.p(t, 19);
    K.text('WebSocket servers', 720, 390, { size: 18, weight: 700, color: P.muted, a: w });
    K.text('10% of 1M online = 100,000 sockets', 720, 428, { size: 19, a: w });
    [0, 1].forEach(function (i) {
      var q = K.back((t - 20.6 - i * 0.4) / 0.5); if (q <= 0) return;
      g.save(); g.translate(780 + i * 120, 495); g.scale(q, q);
      K.box(-50, -32, 100, 64, { stroke: P.blue, a: K.clamp(q) });
      K.text('50k', 0, 0, { size: 20, mono: true, align: 'center', a: K.clamp(q) });
      g.restore();
    });
    K.text('ceil(100k / 50k)', 980, 480, { size: 19, mono: true, a: K.p(t, 21.6) });
    K.text('= 2 servers', 980, 512, { size: 19, mono: true, color: P.green, a: K.p(t, 21.6) });
    K.text('round up: 50,001 sockets → 2', 720, 562, { size: 17, color: P.warm, a: K.p(t, 23.2) });
  } },

/* 5 ─ feed: pagination */
{ d: 30, title: 'Design 1: a news feed',
  caps: [
    [0.3, 'Classic design one: a news feed. The client asks for one page at a time: GET /feed with a limit.'],
    [6.5, 'The server returns the items plus nextCursor, a bookmark for where the next page starts.'],
    [11, 'Why not offsets? A new post at the top shifts everything down, so offset 3 returns C again. A cursor says "after C".'],
    [18, 'A sentinel below the last card, watched by IntersectionObserver, loads the next page. Merge pages and dedupe by id.'],
    [24, 'Long sessions need virtualization: only the visible cards live in the DOM. Reserve image sizes so nothing jumps.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, L = ['A', 'B', 'C', 'D', 'E', 'F'];
    K.box(70, 84, 320, 452, { stroke: P.line, r: 26, a: K.p(t, 0.2) });
    var s = K.p(t, 18.4, 1.4) * 150;
    g.save(); g.beginPath(); g.rect(84, 108, 292, 410); g.clip();
    L.forEach(function (l, i) {
      var y = 118 + i * 130 - s; if (y > 515 || y + 116 < 110) return;
      var q = i < 3 ? K.p(t, 1 + i * 0.4, 0.5) : K.p(t, 20.8 + (i - 3) * 0.3, 0.5);
      var virt = (i === 0) ? K.p(t, 24.4) : 0;
      K.box(96, y, 268, 116, { stroke: virt ? P.muted : P.line, dash: virt ? [6, 6] : null, a: q * (1 - virt * 0.6), r: 10 });
      g.save(); g.globalAlpha *= q; g.fillStyle = P.blue; g.beginPath(); g.arc(122, y + 26, 12, 0, 7); g.fill(); g.restore();
      if (y + 26 > 116 && y + 26 < 510) K.text('Post ' + l, 144, y + 26, { size: 18, weight: 700, a: q * (1 - virt) });
      K.box(112, y + 48, 200, 8, { fill: P.line, r: 4, a: q * (1 - virt) });
      K.box(112, y + 66, 236, 38, { fill: false, stroke: K.p(t, 26) > 0 ? P.green : P.line, dash: [5, 5], r: 6, a: q * (1 - virt) });
    });
    var sy = 118 + 3 * 130 - s - 8, sn = K.p(t, 18.2) * (1 - K.p(t, 21.2));
    g.save(); g.globalAlpha *= sn; g.strokeStyle = P.warm; g.lineWidth = 3; g.setLineDash([8, 6]);
    g.beginPath(); g.moveTo(100, sy); g.lineTo(360, sy); g.stroke(); g.restore();
    K.text('sentinel', 230, sy - 14, { size: 16, color: P.warm, align: 'center', a: sn });
    g.restore();
    K.text('removed from the DOM', 230, 66, { size: 16, color: P.muted, align: 'center', a: K.p(t, 24.6) });
    var code = ['GET /feed?limit=3', '→ { items: [A, B, C], nextCursor: "c3" }', 'GET /feed?cursor=c3&limit=3'];
    K.panel(470, 84, 770, 168, 'feed API', { a: K.p(t, 0.4) });
    K.code(code, 496, 124, { size: 20, lh: 1.6, n: K.typed(t, code, [1.2, 7, 20.2], 30), t: t, w: 740,
      hi: t > 20.2 ? 2 : t > 7 ? 1 : t > 1.2 ? 0 : -1 });
    K.text('Why cursors?', 470, 290, { size: 19, weight: 700, color: P.muted, a: K.p(t, 11) });
    K.text('new post N arrives', 470, 334, { size: 18, a: K.p(t, 11.4) });
    function row(items, y, t0, cols) {
      items.forEach(function (it, i) {
        var q = K.back((t - t0 - i * 0.15) / 0.4);
        if (q > 0) K.chip(it, 720 + i * 62, y, { s: q, mono: true, size: 18, stroke: cols[i] || P.line, color: cols[i] || P.ink });
      });
    }
    row(['N', 'A', 'B', 'C', 'D', 'E'], 334, 11.6, [P.warm]);
    K.text('offset=3', 470, 384, { size: 18, mono: true, a: K.p(t, 13.4) });
    row(['C', 'D', 'E'], 384, 13.6, [P.red]);
    K.mark(920, 384, false, 0.75, K.p(t, 14.6)); K.text('C again', 944, 384, { size: 18, color: P.red, a: K.p(t, 14.6) });
    K.text('cursor=c3', 470, 434, { size: 18, mono: true, a: K.p(t, 15.6) });
    row(['D', 'E', 'F'], 434, 15.8, [P.green, P.green, P.green]);
    K.mark(920, 434, true, 0.75, K.p(t, 16.6)); K.text('after C', 944, 434, { size: 18, color: P.green, a: K.p(t, 16.6) });
    K.chip('IntersectionObserver → next page', 660, 492, { size: 17, stroke: P.warm, a: K.p(t, 19.4) });
    K.chip('merge pages, dedupe by id', 1050, 492, { size: 17, stroke: P.acc, a: K.p(t, 21.4) });
    K.chip('virtualize: visible cards only', 660, 552, { size: 17, stroke: P.blue, a: K.p(t, 24.8) });
    K.chip('reserve image sizes: no CLS', 1050, 552, { size: 17, stroke: P.green, a: K.p(t, 26.2) });
  } },

/* 6 ─ feed: optimistic like */
{ d: 26, title: 'Optimistic updates',
  caps: [
    [0.3, 'When the user taps like, fill the heart at once. Do not wait for the server. This is an optimistic update.'],
    [7, 'The request goes out in the background. If it succeeds, the new count simply stays.'],
    [11.5, 'If it fails, roll back to the previous value and tell the user. Without a rollback, the UI lies.'],
    [18, 'Two more feed habits: a "new posts" banner instead of jumping the scroll, and cached pages shown at once, then revalidated.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    var liked = t > 1.6 && t < 12.6, back = K.p(t, 12.6, 0.4);
    K.box(60, 90, 360, 200, { stroke: P.line, a: K.p(t, 0.2) });
    g.save(); g.globalAlpha *= K.p(t, 0.2); g.fillStyle = P.blue; g.beginPath(); g.arc(92, 124, 14, 0, 7); g.fill(); g.restore();
    K.text('Post A', 118, 124, { size: 20, weight: 700, a: K.p(t, 0.2) });
    K.box(84, 154, 300, 10, { fill: P.line, r: 5, a: K.p(t, 0.2) });
    K.box(84, 176, 220, 10, { fill: P.line, r: 5, a: K.p(t, 0.2) });
    var shake = t > 12.6 && t < 13.4 ? Math.sin(t * 60) * 5 : 0, hx = 102 + shake, hy = 244, pop = liked ? 1 + 0.25 * Math.max(0, 1 - (t - 1.6) / 0.4) : 1;
    g.save(); g.globalAlpha *= K.p(t, 0.2); g.translate(hx, hy); g.scale(pop, pop);
    g.beginPath(); g.moveTo(0, 10); g.bezierCurveTo(-22, -4, -12, -22, 0, -10); g.bezierCurveTo(12, -22, 22, -4, 0, 10); g.closePath();
    if (liked) { g.fillStyle = P.red; g.fill(); } else { g.strokeStyle = P.muted; g.lineWidth = 2.5; g.stroke(); }
    g.restore();
    K.text('1', 132, 244, { size: 26, weight: 700, a: K.p(t, 0.2) * (liked ? 0 : 1) });
    K.text('2', 132, 244, { size: 26, weight: 700, color: P.red, a: liked ? 1 : 0 });
    K.box(60, 306, 360, 50, { fill: 'rgba(252,129,129,.12)', stroke: P.red, a: back, r: 10 });
    K.text('Could not like. Try again.', 80, 331, { size: 18, color: P.red, a: back });
    /* timeline */
    var la = K.p(t, 0.6);
    K.text('UI', 470, 150, { size: 18, weight: 700, color: P.muted, a: la });
    K.text('Server', 470, 270, { size: 18, weight: 700, color: P.muted, a: la });
    K.box(540, 149, 690, 3, { fill: P.line, r: 1, a: la }); K.box(540, 269, 690, 3, { fill: P.line, r: 1, a: la });
    var tp = K.back((t - 1.4) / 0.4);
    if (tp > 0) { g.save(); g.fillStyle = P.acc; g.beginPath(); g.arc(570, 150, 9 * tp, 0, 7); g.fill(); g.restore(); }
    K.text('tap', 570, 122, { size: 17, align: 'center', a: K.p(t, 1.4) });
    K.text('shows 2 at once', 680, 122, { size: 17, color: P.acc, align: 'center', a: K.p(t, 2.2) });
    K.arrow(580, 160, 760, 262, { p: K.p(t, 7.3, 0.6), color: P.blue });
    K.text('POST /like', 655, 232, { size: 17, mono: true, color: P.blue, align: 'right', a: K.p(t, 7.6) });
    K.box(770, 256, 160, 30, { stroke: P.blue, a: K.p(t, 8.1), r: 6 });
    K.text('saving…', 850, 271, { size: 16, align: 'center', a: K.p(t, 8.1) });
    var ok = K.win(t, 9, 11.8), bad = K.p(t, 12.1);
    K.arrow(940, 262, 1100, 160, { p: K.p(t, 9, 0.5), color: P.green, a: ok });
    K.text('200 OK: keep 2', 1100, 122, { size: 17, color: P.green, align: 'center', a: ok });
    K.arrow(940, 262, 1100, 160, { p: K.p(t, 12.1, 0.5), color: P.red, dash: [7, 6], a: bad });
    K.text('error: roll back to 1', 1100, 122, { size: 17, color: P.red, align: 'center', a: bad });
    /* code */
    var code = ['const before = likes[id];', 'likes[id] = before + 1;      // optimistic', 'try { await api(id); }', 'catch { likes[id] = before; } // roll back'];
    K.panel(60, 385, 650, 200, 'like.js', { a: K.p(t, 2) });
    K.code(code, 86, 428, { size: 19, lh: 1.55, n: K.typed(t, code, [2.4, 3.4, 7.6, 12.4], 34), t: t, w: 620,
      hi: t > 12.4 ? 3 : t > 7.6 ? 2 : t > 3.4 ? 1 : -1 });
    /* banner + SWR */
    var bn = K.p(t, 18.4);
    K.box(750, 385, 480, 200, { fill: false, stroke: P.line, dash: [7, 7], a: bn });
    var pl = K.back((t - 18.8) / 0.5);
    if (pl > 0) K.chip('↑ 3 new posts', 990, 425, { s: pl, size: 18, stroke: P.blue, color: P.blue });
    K.text('tap to show; scroll position stays', 990, 468, { size: 16, color: P.muted, align: 'center', a: K.p(t, 19.4) });
    K.text('stale-while-revalidate', 990, 510, { size: 17, color: P.warm, align: 'center', a: K.p(t, 21.2) });
    K.chip('cached: instant', 870, 552, { size: 16, stroke: P.warm, a: K.p(t, 21.6) });
    K.arrow(956, 552, 1010, 552, { p: K.p(t, 22.2, 0.4), color: P.muted, lw: 2, head: 10 });
    K.chip('fresh: swapped in', 1110, 552, { size: 16, stroke: P.green, a: K.p(t, 22.6) });
  } },

/* 7 ─ chat: send, ack, dedupe */
{ d: 26, title: 'Design 2: a chat app',
  caps: [
    [0.3, 'Classic design two: a chat. A WebSocket gives a two-way channel; heartbeats detect connections that died silently.'],
    [6, 'The sender shows the message at once, with a client-generated id and the state "sending".'],
    [11.5, 'The server stores it, assigns the next sequence number for the conversation, and acks the client id. Now it is "sent".'],
    [18.5, 'If the client retries, the server sees c42 again and drops the duplicate. States: sending, sent, delivered, or failed.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, XS = 180, XV = 640, XO = 1100;
    [['Sender', XS, P.acc], ['Server', XV, P.purple], ['Other clients', XO, P.blue]].forEach(function (c, i) {
      var q = K.p(t, 0.4 + i * 0.3);
      K.chip(c[0], c[1], 96, { size: 19, stroke: c[2], a: q });
      g.save(); g.globalAlpha *= q * 0.6; g.strokeStyle = P.line; g.lineWidth = 2; g.setLineDash([6, 8]);
      g.beginPath(); g.moveTo(c[1], 120); g.lineTo(c[1], 525); g.stroke(); g.restore();
    });
    var ws = K.p(t, 1.4);
    K.arrow(XS + 10, 156, XV - 10, 156, { p: ws, color: P.acc, lw: 2.5 }); K.arrow(XV - 10, 156, XS + 10, 156, { p: ws, color: P.acc, lw: 2.5 });
    K.text('WebSocket: two-way', (XS + XV) / 2, 138, { size: 17, color: P.acc, align: 'center', a: ws });
    K.arrow(XV + 10, 156, XO - 10, 156, { p: K.p(t, 2), color: P.acc, lw: 2.5 }); K.arrow(XO - 10, 156, XV + 10, 156, { p: K.p(t, 2), color: P.acc, lw: 2.5 });
    var hb = K.win(t, 3, 11.5);
    if (hb > 0) {
      var u = ((t - 3) / 1.6) % 2, x = XS + (XV - XS) * (u < 1 ? u : 2 - u);
      g.save(); g.globalAlpha *= hb; g.fillStyle = P.warm; g.beginPath(); g.arc(x, 184, 7, 0, 7); g.fill(); g.restore();
      K.text('heartbeat: ping · pong', (XS + XV) / 2, 210, { size: 16, color: P.warm, align: 'center', a: hb });
    }
    /* sender bubble */
    var b = K.back((t - 6.3) / 0.5), sent = K.p(t, 13.4, 0.4);
    if (b > 0) {
      g.save(); g.translate(170, 262); g.scale(b, b); g.translate(-170, -262);
      K.box(40, 228, 260, 68, { stroke: sent > 0.5 ? P.green : P.muted, a: K.clamp(b) });
      K.text('Hi!', 60, 248, { size: 21, weight: 700, a: K.clamp(b) });
      K.text('c42 · sending…', 60, 278, { size: 16, color: P.muted, a: K.clamp(b) * (sent > 0.5 ? 0 : 1) });
      K.text('c42 · seq 17 · sent', 60, 278, { size: 16, color: P.green, a: sent > 0.5 ? 1 : 0 });
      g.restore();
    }
    K.arrow(304, 300, XV - 8, 300, { p: K.p(t, 8, 0.6), color: P.muted });
    K.text('{ clientId: "c42", text: "Hi!" }', 470, 320, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 8.3) });
    var sv = K.back((t - 11.8) / 0.5);
    if (sv > 0) {
      g.save(); g.translate(XV, 352); g.scale(sv, sv);
      K.box(-110, -24, 220, 48, { stroke: P.purple, a: K.clamp(sv) });
      K.text('stored · seq 17', 0, 0, { size: 18, weight: 600, align: 'center', a: K.clamp(sv) });
      g.restore();
    }
    K.arrow(XV - 8, 408, XS + 8, 408, { p: K.p(t, 12.8, 0.6), color: P.green });
    K.text('ack(c42, seq 17)', 410, 392, { size: 16, mono: true, color: P.green, align: 'center', a: K.p(t, 13) });
    K.arrow(XV + 8, 408, XO - 8, 408, { p: K.p(t, 14.4, 0.6), color: P.blue });
    K.text('seq 17: "Hi!"', 870, 392, { size: 16, mono: true, color: P.blue, align: 'center', a: K.p(t, 14.6) });
    var rc = K.back((t - 15.4) / 0.5);
    if (rc > 0) K.chip('Hi!   seq 17', XO, 448, { s: rc, size: 18, stroke: P.blue });
    /* retry */
    K.arrow(XS + 8, 474, XV - 8, 474, { p: K.p(t, 18.8, 0.6), color: P.warm, dash: [7, 6] });
    K.text('retry { clientId: "c42" }', 410, 458, { size: 16, mono: true, color: P.warm, align: 'center', a: K.p(t, 19) });
    K.text('c42 already seen', 664, 468, { size: 17, color: P.warm, a: K.p(t, 20) });
    K.mark(676, 502, true, 0.6, K.p(t, 20.6)); K.text('duplicate dropped', 694, 502, { size: 17, color: P.green, a: K.p(t, 20.6) });
    var st = [['sending', P.muted], ['sent', P.green], ['delivered', P.green], ['failed: retry', P.red]];
    st.forEach(function (c, i) {
      var q = K.p(t, 21.8 + i * 0.5, 0.4);
      K.chip(c[0], 260 + i * 220, 562, { size: 17, stroke: c[1], a: q });
      if (i && i < 3) K.arrow(260 + (i - 1) * 220 + 62, 562, 260 + i * 220 - 62, 562, { p: q, color: P.muted, lw: 2, head: 9 });
    });
  } },

/* 8 ─ chat: ordering and reconnect */
{ d: 27, title: 'Ordering and reconnects',
  caps: [
    [0.3, 'Messages can arrive out of order. Here 19 and 20 arrive first, so they wait in a buffer while 18 is missing.'],
    [6.5, 'When 18 arrives, the gap closes and all three are released in order. Old numbers and duplicates are ignored.'],
    [13, 'If the socket drops, reconnect with exponential backoff: wait 1, 2, 4, 8, 16 seconds, capped at 30.'],
    [19.5, 'Add jitter so thousands of clients do not retry in lockstep. Once back, sync everything after the last sequence you saw.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    K.text('network', 60, 120, { size: 18, weight: 700, color: P.muted, a: K.p(t, 0.3) });
    K.box(60, 186, 380, 4, { fill: P.line, r: 2, a: K.p(t, 0.3) });
    K.box(480, 100, 340, 160, { stroke: P.warm, a: K.p(t, 0.5) });
    K.text('reorder buffer', 500, 126, { size: 18, weight: 700, color: P.warm, a: K.p(t, 0.5) });
    var nx = K.p(t, 10.6, 0.4);
    K.text('next expected: 18', 500, 236, { size: 17, color: P.muted, a: K.p(t, 0.8) * (1 - nx) });
    K.text('next expected: 21', 500, 236, { size: 17, color: P.green, a: nx });
    K.box(880, 100, 360, 160, { stroke: P.green, a: K.p(t, 0.7) });
    K.text('shown in order', 900, 126, { size: 18, weight: 700, color: P.green, a: K.p(t, 0.7) });
    var slot = [550, 650, 750], out = [960, 1060, 1160];
    var gap = K.p(t, 4.4) * (1 - K.p(t, 7.6, 0.3));
    K.box(520, 160, 60, 50, { fill: false, stroke: P.warm, dash: [5, 5], r: 8, a: gap });
    K.text('?', 550, 186, { size: 22, weight: 700, color: P.warm, align: 'center', a: gap });
    K.text('waiting for 18', 650, 286, { size: 17, color: P.warm, align: 'center', a: gap });
    /* packets: [label, arrive start, slot index] */
    [['18', 6.8, 0], ['19', 1.2, 1], ['20', 2.8, 2]].forEach(function (pk) {
      if (t < pk[1]) return;
      var a = K.p(t, pk[1], 1.1), r = K.p(t, 8.6, 1.2);
      var x = 60 + (slot[pk[2]] - 60) * a, y = 186 - 1 * a;
      x = x + (out[pk[2]] - slot[pk[2]]) * r;
      K.chip(pk[0], x, y, { size: 22, mono: true, stroke: pk[0] === '18' ? P.warm : P.acc, color: r > 0.99 ? P.green : P.ink });
    });
    var du = K.p(t, 11, 0.8), dx = K.p(t, 12.2, 0.4);
    if (t > 11) K.chip('19', 60 + 250 * du, 186, { size: 22, mono: true, stroke: P.red, color: P.red, a: 1 - dx });
    K.mark(390, 186, false, 0.8, K.p(t, 11.9));
    K.text('duplicate 19: ignored', 250, 236, { size: 17, color: P.red, align: 'center', a: K.p(t, 12) });
    /* backoff */
    K.text('Reconnect: exponential backoff', 80, 330, { size: 19, weight: 700, color: P.muted, a: K.p(t, 13.2) });
    var waits = [1, 2, 4, 8, 16, 30, 30];
    waits.forEach(function (w, k) {
      var x = 100 + k * 110, h = w * 5, q = K.p(t, 13.8 + k * 0.7, 0.5), cap = k >= 5;
      K.box(x, 560 - h * q, 70, h * q, { fill: cap ? 'rgba(246,173,85,.35)' : 'rgba(79,209,197,.35)', stroke: cap ? P.warm : P.acc, r: 4, a: q });
      K.text(w + ' s', x + 35, 560 - h - 16, { size: 17, weight: 600, align: 'center', color: cap ? P.warm : P.ink, a: K.p(t, 14 + k * 0.7) });
      var j = K.p(t, 20.2 + k * 0.2);
      for (var i = 0; i < 5; i++) {
        var f = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(k * 7.1 + i * 2.3)), yy = 560 - h * f;
        g.save(); g.globalAlpha *= j; g.fillStyle = P.ink; g.beginPath(); g.arc(x + 12 + i * 11.5, yy, 3.5, 0, 7); g.fill(); g.restore();
      }
    });
    K.text('cap', 100 + 5.5 * 110 + 35, 380, { size: 16, color: P.warm, align: 'center', a: K.p(t, 17.6) });
    K.text('jitter: each client waits a random 50–100% of the delay', 80, 364, { size: 17, color: P.ink, a: K.p(t, 20) });
    var rs = K.p(t, 22.6);
    K.box(900, 430, 340, 130, { stroke: P.green, a: rs });
    K.text('back online', 924, 462, { size: 20, weight: 700, a: rs });
    K.text('sync after seq 20', 924, 500, { size: 19, mono: true, color: P.green, a: rs });
    K.text('missed messages fill in', 924, 534, { size: 16, color: P.muted, a: rs });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 36 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Five steps: requirements, architecture, data + API, cross-cutting, operate',
     'Estimate out loud: ÷ 86,400, × peak, × payload, minus CDN hits',
     'Budgets: 200 ms interaction, 50 ms tasks, 16 ms frames',
     'Feed: cursors, dedupe by id, virtualize, optimistic + rollback',
     'Chat: client ids, sequence numbers, reorder buffer, backoff + jitter'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(200, y, true, 0.9, q);
      K.text(s, 232 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 36 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
