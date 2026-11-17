/* Day 29 in motion: CSR vs SSR and hydration, SSG and ISR, streaming and islands, choosing a rendering strategy,
   micro-frontends, monorepos with task graphs, API design (cursor pagination, idempotency, errors), observability.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day29', {
  kicker: 'JavaScript: Zero to Architect · Day 29',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 29: architecture. How pages get rendered, how big codebases stay healthy, and how you know they work.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Architecture', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 29 · Rendering, repos, APIs and telemetry', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['SSR · CSR · SSG', 'Monorepos', 'APIs · observability'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ CSR vs SSR */
{ d: 25, title: 'CSR vs SSR',
  caps: [
    [0.3, 'With client-side rendering, the server sends an almost empty page. Nothing useful shows until the JavaScript loads and runs.'],
    [7, 'With server-side rendering, the server builds the HTML for each request, so content paints early and crawlers can read it.'],
    [13.5, 'But the page only becomes interactive after hydration attaches the JavaScript. Heavy hydration hurts INP.'],
    [19, 'SSR also costs server time per request, and slow data fetching on the server delays the first byte.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, X0 = 250, S = 280;
    function row(y, label, color, segs, t0, a) {
      K.text(label, 60, y + 23, { size: 24, weight: 800, color: color, a: a });
      K.box(X0, y, 3.4 * S, 46, { fill: P.code, stroke: P.line, r: 8, a: a });
      var now = K.clamp((t - t0) / 4) * 3.4;
      segs.forEach(function (s) {
        var w = Math.max(0, Math.min(now, s[2]) - s[1]) * S; if (w <= 0) return;
        K.box(X0 + s[1] * S + 2, y + 4, w - 4, 38, { fill: s[3], r: 6, a: a * 0.85 });
        if (now >= s[2] && s[0]) K.text(s[0], X0 + (s[1] + s[2]) / 2 * S, y + 23, { size: 16, weight: 700, color: P.bg, align: 'center', a: a });
      });
      if (t > t0 && t < t0 + 4.2) K.box(X0 + now * S - 1, y - 8, 3, 62, { fill: P.ink, r: 1, a: a });
    }
    row(110, 'CSR', P.blue, [['shell', 0, 0.3, P.muted], ['download JS', 0.3, 1.6, P.blue], ['run + fetch', 1.6, 2.6, P.purple], ['render', 2.6, 3, P.acc]], 1, K.p(t, 0.4));
    K.text('blank screen', X0 + 0.95 * S, 186, { size: 16, color: P.red, align: 'center', a: K.p(t, 3) });
    K.box(X0 + 3 * S - 1, 102, 3, 62, { fill: P.green, r: 1, a: K.p(t, 4.6) });
    K.text('content + interactive', X0 + 3 * S, 186, { size: 16, color: P.green, align: 'center', a: K.p(t, 4.6) });
    row(270, 'SSR', P.warm, [['server render', 0, 1, P.warm], ['', 1, 1.2, P.green], ['download JS', 1.2, 2.4, P.blue], ['hydrate', 2.4, 3.2, P.purple]], 7.4, K.p(t, 7.2));
    K.box(X0 + 1.2 * S - 1, 262, 3, 62, { fill: P.green, r: 1, a: K.p(t, 9.2) });
    K.text('content visible', X0 + 1.2 * S, 346, { size: 16, color: P.green, align: 'center', a: K.p(t, 9.2) });
    K.box(X0 + 3.2 * S - 1, 262, 3, 62, { fill: P.purple, r: 1, a: K.p(t, 11.4) });
    K.text('interactive', X0 + 3.2 * S, 346, { size: 16, color: P.purple, align: 'center', a: K.p(t, 11.4) });
    var h = K.p(t, 13.8);
    K.box(X0 + 2.4 * S, 258, 0.8 * S, 70, { fill: false, stroke: P.red, lw: 3, a: h });
    K.text('looks ready, clicks wait', X0 + 2.15 * S, 240, { size: 17, color: P.red, align: 'center', a: K.p(t, 14.4) });
    K.box(X0, 258, 1 * S, 70, { fill: false, stroke: P.warm, lw: 3, a: K.p(t, 19.2) });
    K.text('TTFB: server work first', X0 + 0.5 * S, 240, { size: 17, color: P.warm, align: 'center', a: K.p(t, 19.4) });
    var c1 = K.p(t, 5.4);
    K.box(40, 400, 580, 186, { stroke: P.blue, a: c1 });
    K.text('CSR', 64, 430, { size: 21, weight: 700, color: P.blue, a: c1 });
    K.mark(78, 476, true, 0.7, c1); K.text('simple static hosting, app-like', 102, 476, { size: 18, a: c1 });
    K.mark(78, 516, false, 0.7, K.p(t, 5.9)); K.text('slow first content (LCP)', 102, 516, { size: 18, a: K.p(t, 5.9) });
    K.mark(78, 556, false, 0.7, K.p(t, 6.4)); K.text('SEO risk: empty HTML', 102, 556, { size: 18, a: K.p(t, 6.4) });
    var c2 = K.p(t, 11.8);
    K.box(660, 400, 580, 186, { stroke: P.warm, a: c2 });
    K.text('SSR', 684, 430, { size: 21, weight: 700, color: P.warm, a: c2 });
    K.mark(698, 476, true, 0.7, c2); K.text('fast first paint, SEO, personalization', 722, 476, { size: 18, a: c2 });
    K.mark(698, 516, false, 0.7, K.p(t, 15.2)); K.text('hydration cost → worse INP', 722, 516, { size: 18, a: K.p(t, 15.2) });
    K.mark(698, 556, false, 0.7, K.p(t, 20.4)); K.text('server cost and TTFB per request', 722, 556, { size: 18, a: K.p(t, 20.4) });
  } },

/* 3 ─ SSG and ISR */
{ d: 25, title: 'SSG and ISR',
  caps: [
    [0.3, 'Static site generation builds the HTML once, at build time. A CDN serves it everywhere: the cheapest and fastest option.'],
    [7, 'But a static page is stale until the next build, and with thousands of pages the builds get slow.'],
    [13.5, 'Incremental static regeneration serves the cached page, then rebuilds it in the background once it is older than its limit.'],
    [20, 'Visitors keep getting fast static pages, and the content is never more than a minute out of date.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    K.box(40, 110, 200, 110, { stroke: P.purple, a: K.p(t, 0.4) });
    K.text('build', 140, 146, { size: 22, weight: 700, align: 'center', a: K.p(t, 0.4) });
    K.text('npm run build', 140, 184, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 0.6) });
    K.arrow(246, 165, 290, 165, { p: K.p(t, 1.2, 0.4), color: P.muted });
    ['about.html', 'blog/a.html', 'blog/b.html'].forEach(function (f, i) {
      var q = K.back((t - 1.4 - i * 0.3) / 0.5);
      if (q > 0) K.chip(f, 380, 122 + i * 44, { s: q, a: K.clamp(q), mono: true, size: 16, stroke: P.purple });
    });
    K.arrow(470, 165, 514, 165, { p: K.p(t, 2.6, 0.4), color: P.muted });
    K.box(520, 110, 200, 110, { stroke: P.green, a: K.p(t, 2.8) });
    K.text('CDN edge', 620, 146, { size: 22, weight: 700, align: 'center', a: K.p(t, 2.8) });
    K.text('cached HTML', 620, 184, { size: 16, color: P.muted, align: 'center', a: K.p(t, 3) });
    for (var i = 0; i < 3; i++) {
      var y = 122 + i * 44, q = K.p(t, 3.6 + i * 0.3);
      K.arrow(726, 165, 800, y, { p: q, color: P.green, lw: 2 });
      g.save(); g.globalAlpha *= q; g.fillStyle = P.blue; g.beginPath(); g.arc(814, y, 9, 0, 7); g.fill(); g.restore();
    }
    K.text('served in ms', 840, 166, { size: 17, color: P.green, a: K.p(t, 4.6) });
    var st = K.p(t, 7.2);
    K.box(960, 96, 280, 214, { fill: P.code, stroke: P.red, a: st });
    K.text('data source', 984, 124, { size: 16, color: P.muted, a: st });
    K.text('price: $12', 984, 152, { size: 20, mono: true, color: P.green, a: K.p(t, 7.8) });
    K.text('page on CDN', 984, 196, { size: 16, color: P.muted, a: st });
    K.text('price: $10', 984, 224, { size: 20, mono: true, color: P.red, a: st });
    K.mark(1200, 224, false, 0.7, K.p(t, 8.6));
    K.text('stale until rebuild', 984, 276, { size: 17, color: P.red, a: K.p(t, 9) });
    K.text('50,000 pages → long builds', 40, 262, { size: 17, color: P.warm, a: K.p(t, 10.4) });
    K.box(380, 252, 340 * K.p(t, 10.6, 1.4), 20, { fill: P.warm, r: 4, a: K.p(t, 10.6) * 0.8 });
    /* ISR timeline */
    var a = K.p(t, 13.7), X0 = 120, X1 = 1180, y0 = 430;
    K.box(40, 330, 1200, 260, { fill: P.code, stroke: P.line, a: a });
    K.text('ISR · revalidate: 60', 64, 358, { size: 19, weight: 700, mono: true, color: P.acc, a: a });
    K.arrow(X0, y0, X1, y0, { color: P.line, a: a, lw: 3 });
    K.text('0 s', X0, y0 + 26, { size: 16, mono: true, color: P.muted, align: 'center', a: a });
    K.text('60 s', 520, y0 + 26, { size: 16, mono: true, color: P.muted, align: 'center', a: a });
    K.box(519, y0 - 14, 3, 28, { fill: P.muted, r: 1, a: a });
    var R = [[240, 'v1', P.acc, 14.6, 'fresh'], [700, 'v1', P.warm, 15.8, 'stale, served anyway'], [1020, 'v2', P.green, 18.4, 'new version']];
    R.forEach(function (r) {
      var q = K.back((t - r[3]) / 0.5); if (q <= 0) return;
      K.arrow(r[0], y0 - 40, r[0], y0 - 8, { color: P.blue, a: K.clamp(q), lw: 2 });
      K.text('request', r[0], y0 - 52, { size: 16, color: P.blue, align: 'center', a: K.clamp(q) });
      K.chip(r[1], r[0], y0 + 60, { s: q, a: K.clamp(q), mono: true, size: 18, stroke: r[2], color: r[2] });
      K.text(r[4], r[0], y0 + 96, { size: 16, color: r[2], align: 'center', a: K.clamp(q) });
    });
    K.curve(720, y0 + 40, 860, y0 + 150, 990, y0 + 52, { p: K.p(t, 16.6, 1.2), color: P.purple, dash: [6, 6], lw: 2.5 });
    K.text('regenerate in the background', 860, 568, { size: 17, color: P.purple, align: 'center', a: K.p(t, 17.2) });
    K.chip('fast + fresh enough', 420, 562, { size: 19, stroke: P.green, color: P.green, a: K.p(t, 20.4) });
  } },

/* 4 ─ streaming, islands, hydration */
{ d: 24, title: 'Streaming and islands',
  caps: [
    [0.3, 'Streaming SSR sends the page shell first, then streams in slower parts, like comments, as their data arrives.'],
    [7, 'Islands and server components hydrate only the interactive parts. Static content ships no JavaScript at all.'],
    [14, 'Avoid hydration mismatches: random values or the current time in render make the server and client HTML differ.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, pg = K.p(t, 0.4);
    K.box(40, 84, 560, 506, { fill: P.code, stroke: P.line, a: pg });
    K.box(60, 100, 520, 50, { stroke: P.line, a: K.p(t, 1) }); K.text('header · static', 80, 125, { size: 18, a: K.p(t, 1) });
    K.box(60, 166, 520, 150, { stroke: P.line, a: K.p(t, 1.4) }); K.text('article · static', 80, 192, { size: 18, a: K.p(t, 1.4) });
    for (var i = 0; i < 3; i++) K.box(80, 220 + i * 28, 460 - i * 80, 12, { fill: P.line, r: 4, a: K.p(t, 1.6) });
    var isl = K.p(t, 8.6);
    K.box(60, 332, 220, 56, { stroke: isl > 0.5 ? P.purple : P.line, lw: isl > 0.5 ? 3.5 : 2, a: K.p(t, 1.8) });
    K.text('Add to cart', 170, 360, { size: 19, weight: 700, align: 'center', a: K.p(t, 1.8) });
    K.text('island: hydrated', 300, 360, { size: 17, color: P.purple, a: isl });
    var full = K.p(t, 4.6, 0.6);
    K.box(60, 404, 520, 170, { stroke: full > 0.5 ? P.green : P.line, dash: full > 0.5 ? null : [6, 6], a: K.p(t, 2) });
    K.text(full > 0.5 ? 'comments · streamed in' : 'comments · loading…', 80, 430, { size: 18, color: full > 0.5 ? P.green : P.muted, a: K.p(t, 2) });
    for (var j = 0; j < 3; j++) {
      var sh = 0.25 + 0.2 * Math.sin(t * 4 - j);
      K.box(80, 458 + j * 36, 440 - j * 60, 22, { fill: P.line, r: 6, a: K.p(t, 2.2) * (1 - full) * (0.5 + sh) });
      K.text(['Ana: great pen', 'Ben: arrived fast', 'Cy: love it'][j], 84, 469 + j * 36, { size: 17, a: full });
    }
    var ch = K.p(t, 1.2);
    K.panel(640, 84, 600, 150, 'response stream', { a: ch });
    K.chip('chunk 1: shell', 760, 140, { mono: true, size: 17, stroke: P.acc, a: K.p(t, 1.4) });
    K.chip('chunk 2: comments', 1060, 140, { mono: true, size: 17, stroke: P.green, a: K.p(t, 4.6) });
    K.arrow(856, 140, 950, 140, { p: K.p(t, 4.2, 0.4), color: P.muted });
    K.text('one HTTP response, sent in pieces', 664, 200, { size: 16, color: P.muted, a: K.p(t, 5.2) });
    var b = K.p(t, 9.6);
    K.box(640, 254, 600, 150, { fill: P.code, stroke: P.line, a: b });
    K.text('JavaScript shipped', 664, 282, { size: 18, weight: 700, a: b });
    K.text('hydrate all', 664, 326, { size: 17, a: b }); K.box(800, 314, 400 * K.p(t, 10, 1), 24, { fill: P.red, r: 5, a: b });
    K.text('islands', 664, 372, { size: 17, a: K.p(t, 11) }); K.box(800, 360, 50 * K.p(t, 11.2, 0.6), 24, { fill: P.green, r: 5, a: K.p(t, 11) });
    K.text('320 KB', 1196, 304, { size: 16, mono: true, color: P.red, align: 'right', a: K.p(t, 10.8) });
    K.text('40 KB', 864, 372, { size: 16, mono: true, color: P.green, a: K.p(t, 11.8) });
    var m = K.p(t, 14.2);
    K.box(640, 424, 600, 166, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: m });
    K.text('server HTML', 664, 454, { size: 16, color: P.muted, a: m });
    K.text('<p>10:04:12</p>', 800, 454, { size: 18, mono: true, a: m });
    K.text('client render', 664, 488, { size: 16, color: P.muted, a: K.p(t, 15) });
    K.text('<p>10:04:13</p>', 800, 488, { size: 18, mono: true, color: P.red, a: K.p(t, 15) });
    K.mark(1000, 471, false, 0.75, K.p(t, 15.6)); K.text('mismatch', 1024, 471, { size: 18, color: P.red, a: K.p(t, 15.6) });
    K.text('fix: render time-dependent values on the client', 664, 534, { size: 17, color: P.green, a: K.p(t, 17.6) });
    K.text('after hydration, or pass them from the server', 664, 562, { size: 17, color: P.green, a: K.p(t, 17.6) });
  } },

/* 5 ─ choosing a strategy */
{ d: 25, title: 'Choosing a strategy',
  caps: [
    [0.3, 'Choose per route, not per app. First ask: is the HTML the same for everyone, and how often does it change?'],
    [7, 'Same for everyone and rarely changing: SSG. Changing often: ISR, or SSR behind a CDN cache.'],
    [13, 'Personalized pages need SSR with streaming, or CSR behind a login. Never cache them publicly: mark them private.'],
    [19, 'Then weigh SEO and how much must be interactive at first paint. Most real apps mix strategies.']],
  draw: function (K, t) {
    var P = K.P;
    K.box(420, 88, 440, 64, { stroke: P.acc, lw: 3, a: K.p(t, 0.6) });
    K.text('Same HTML for everyone?', 640, 120, { size: 23, weight: 700, align: 'center', a: K.p(t, 0.6) });
    K.arrow(500, 156, 330, 212, { p: K.p(t, 7.2, 0.4), color: P.green }); K.text('yes', 400, 172, { size: 17, color: P.green, a: K.p(t, 7.3) });
    K.arrow(780, 156, 950, 212, { p: K.p(t, 13.2, 0.4), color: P.warm }); K.text('no', 880, 172, { size: 17, color: P.warm, a: K.p(t, 13.3) });
    K.box(120, 216, 400, 60, { stroke: P.acc, a: K.p(t, 7.6) });
    K.text('How often does it change?', 320, 246, { size: 20, weight: 700, align: 'center', a: K.p(t, 7.6) });
    K.arrow(250, 280, 170, 338, { p: K.p(t, 8.4, 0.4), color: P.muted }); K.text('rarely', 170, 300, { size: 16, color: P.muted, align: 'right', a: K.p(t, 8.5) });
    K.arrow(390, 280, 470, 338, { p: K.p(t, 9.6, 0.4), color: P.muted }); K.text('often', 470, 300, { size: 16, color: P.muted, a: K.p(t, 9.7) });
    var s1 = K.back((t - 8.8) / 0.5); if (s1 > 0) K.chip('SSG', 160, 370, { s: s1, a: K.clamp(s1), size: 24, weight: 800, stroke: P.green, color: P.green });
    var s2 = K.back((t - 10) / 0.5); if (s2 > 0) K.chip('ISR · SSR + CDN cache', 470, 370, { s: s2, a: K.clamp(s2), size: 20, weight: 700, stroke: P.acc, color: P.acc });
    K.box(760, 216, 480, 60, { stroke: P.warm, a: K.p(t, 13.6) });
    K.text('Personalized (per user)', 1000, 246, { size: 20, weight: 700, align: 'center', a: K.p(t, 13.6) });
    K.arrow(1000, 280, 1000, 338, { p: K.p(t, 14.4, 0.4), color: P.muted });
    var s3 = K.back((t - 14.8) / 0.5); if (s3 > 0) K.chip('SSR + streaming · CSR behind login', 1000, 370, { s: s3, a: K.clamp(s3), size: 19, weight: 700, stroke: P.warm, color: P.warm });
    var pv = K.p(t, 16.4);
    K.box(760, 418, 480, 74, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: pv });
    K.text('Cache-Control: private', 784, 444, { size: 19, mono: true, a: pv });
    K.text('public caching would leak one user’s page', 784, 474, { size: 16, color: P.red, a: K.p(t, 17) });
    var mix = K.p(t, 19.6);
    K.text('one app, mixed per route', 64, 446, { size: 19, weight: 700, a: mix });
    [['/blog → SSG', P.green], ['/products → ISR', P.acc], ['/account → SSR', P.warm]].forEach(function (c, i) {
      K.chip(c[0], 130 + i * 205, 500, { mono: true, size: 17, stroke: c[1], a: K.p(t, 20 + i * 0.5) });
    });
    K.text('then check: SEO? JS needed at first paint?', 64, 560, { size: 17, color: P.muted, a: K.p(t, 21.8) });
  } },

/* 6 ─ micro-frontends */
{ d: 24, title: 'Micro-frontends',
  caps: [
    [0.3, 'Micro-frontends split one UI into parts that separate teams own, build and deploy on their own.'],
    [7, 'They solve an organization problem, team autonomy, not a technical one. And the costs are real.'],
    [12.5, 'Shared dependencies get duplicated or coupled, styles clash, and keeping the UX consistent takes constant work.'],
    [18.5, 'For a small team they multiply complexity without the benefit. A modular monolith or a monorepo usually wins.']],
  draw: function (K, t) {
    var P = K.P, on = K.p(t, 0.3);
    K.box(40, 84, 560, 400, { fill: P.code, stroke: P.line, a: on });
    var T = [[60, 100, 520, 70, 'nav · team A', P.blue, 0.8], [60, 186, 300, 280, 'product · team B', P.warm, 1.4], [376, 186, 204, 280, 'checkout · team C', P.green, 2]];
    T.forEach(function (r) {
      var q = K.p(t, r[6]);
      K.box(r[0], r[1], r[2], r[3], { fill: 'rgba(255,255,255,.02)', stroke: r[5], lw: 3, a: q });
      K.text(r[4], r[0] + 16, r[1] + 26, { size: 17, weight: 700, color: r[5], a: q });
    });
    T.forEach(function (r, i) {
      var y = 120 + i * 80, q = K.p(t, 3 + i * 0.6);
      K.box(660, y, 180, 50, { stroke: r[5], a: q }); K.text('repo ' + 'ABC'[i], 750, y + 25, { size: 18, align: 'center', a: q });
      K.arrow(846, y + 25, 900, y + 25, { p: K.p(t, 3.3 + i * 0.6, 0.4), color: r[5] });
      K.box(906, y, 180, 50, { stroke: r[5], a: q }); K.text('deploy ' + 'ABC'[i], 996, y + 25, { size: 18, align: 'center', a: q });
    });
    K.text('independent releases', 870, 372, { size: 18, color: P.acc, align: 'center', a: K.p(t, 5.2) });
    K.chip('benefit: team autonomy', 870, 430, { size: 19, stroke: P.green, color: P.green, a: K.p(t, 7.6) });
    var C = [['two copies of React · or coupled versions', 13], ['styles clash between teams', 14.2], ['UX drifts: constant consistency work', 15.4]];
    K.text('costs', 64, 516, { size: 19, weight: 700, color: P.red, a: K.p(t, 12.8) });
    K.mark(160, 516, false, 0.6, K.p(t, 13)); K.text(C[0][0], 184, 516, { size: 17, a: K.p(t, 13) });
    K.mark(160, 552, false, 0.6, K.p(t, 14.2)); K.text(C[1][0], 184, 552, { size: 17, a: K.p(t, 14.2) });
    K.mark(660, 552, false, 0.6, K.p(t, 15.4)); K.text(C[2][0], 684, 552, { size: 17, a: K.p(t, 15.4) });
    var s = K.p(t, 18.8);
    K.box(660, 470, 580, 54, { fill: 'rgba(246,173,85,.10)', stroke: P.warm, a: s });
    K.text('small team? modular monolith or monorepo', 950, 497, { size: 18, color: P.warm, align: 'center', a: s });
  } },

/* 7 ─ monorepos */
{ d: 25, title: 'Monorepos',
  caps: [
    [0.3, 'A monorepo keeps many apps and packages in one repository, linked together with workspaces.'],
    [6.5, 'A task graph tool like Nx or Turborepo builds packages in dependency order, and caches results locally and remotely.'],
    [13, 'Change the ui package, and CI rebuilds and tests only what is affected: web and admin, not the API client.'],
    [19, 'It needs clear ownership and enforced module boundaries, or the monorepo turns into a tangled monolith.']],
  draw: function (K, t) {
    var P = K.P, tree = ['repo/', '  apps/web', '  apps/admin', '  packages/ui', '  packages/api-client', '  pnpm-workspace.yaml'];
    K.panel(40, 84, 420, 270, 'workspace');
    K.code(tree, 64, 132, { size: 19, lh: 1.6, n: K.typed(t, tree, [0.6, 1.2, 1.8, 2.4, 3, 3.8], 30), t: t, marks: t > 13.2 && t < 19 ? { 3: 'rgba(246,173,85,.2)' } : null, w: 390 });
    var N = { web: [700, 140], admin: [1060, 140], ui: [880, 330], api: [560, 330] }, lab = { web: 'apps/web', admin: 'apps/admin', ui: 'packages/ui', api: 'packages/api-client' };
    var ch = K.p(t, 13.4), aff = K.p(t, 14.6);
    function col(k) { if (t < 13.2 || t > 19) return P.acc; if (k === 'ui') return P.warm; if (k === 'api') return P.line; return aff > 0.5 ? P.warm : P.acc; }
    K.arrow(700, 176, 560, 290, { p: K.p(t, 4.6, 0.4), color: P.muted });
    K.arrow(720, 176, 860, 290, { p: K.p(t, 4.9, 0.4), color: P.muted });
    K.arrow(1040, 176, 900, 290, { p: K.p(t, 5.2, 0.4), color: P.muted });
    K.text('depends on', 610, 230, { size: 16, color: P.muted, align: 'right', a: K.p(t, 5.4) });
    Object.keys(N).forEach(function (k, i) {
      var p = N[k], q = K.back((t - 1.2 - i * 0.6) / 0.5); if (q <= 0) return;
      K.g.save(); K.g.translate(p[0], p[1]); K.g.scale(q, q);
      K.box(-120, -34, 240, 68, { stroke: col(k), lw: col(k) === P.warm ? 3.5 : 2, a: K.clamp(q) });
      K.text(lab[k], 0, 0, { size: 18, mono: true, align: 'center', a: K.clamp(q) * (col(k) === P.line ? 0.5 : 1) });
      K.g.restore();
    });
    [['1', 560, 384, 7], ['1', 880, 384, 7.4], ['2', 700, 86, 8], ['2', 1060, 86, 8.4]].forEach(function (b) {
      K.chip('step ' + b[0], b[1], b[2], { size: 16, stroke: P.purple, color: P.purple, a: K.win(t, b[3], 13) });
    });
    K.chip('cache hit · 0.2 s', 560, 434, { size: 17, stroke: P.green, color: P.green, a: K.win(t, 10, 13) });
    K.text('local + remote cache', 880, 434, { size: 17, color: P.green, a: K.win(t, 10.6, 13) });
    K.text('changed', 880, 384, { size: 17, weight: 700, color: P.warm, align: 'center', a: K.win(t, 13.6, 19) });
    K.text('skipped', 560, 384, { size: 17, color: P.muted, align: 'center', a: K.win(t, 15.4, 19) });
    K.text('affected', 880, 96, { size: 17, weight: 700, color: P.warm, align: 'center', a: K.win(t, 14.8, 19) });
    var ci = ['$ nx affected -t test', '$ turbo run test --affected'];
    K.panel(40, 380, 420, 120, 'CI', { a: K.p(t, 15.6) });
    K.code(ci, 64, 418, { size: 18, lh: 1.6, n: K.typed(t, ci, [15.9, 17.2], 30), t: t, a: K.p(t, 15.6) });
    [['CODEOWNERS', P.blue], ['import boundary lint rules', P.purple], ['changesets for versions', P.acc]].forEach(function (c, i) {
      K.chip(c[0], [130, 400, 700][i] + (i === 2 ? 60 : 0), 550, { size: 18, mono: i === 0, stroke: c[1], a: K.p(t, 19.4 + i * 0.6) });
    });
  } },

/* 8 ─ API design */
{ d: 26, title: 'API design',
  caps: [
    [0.3, 'Offset pagination breaks when data changes: a new item shifts every page, so users see duplicates or miss items.'],
    [6.5, 'Cursor pagination asks for items after the last one you saw. It stays stable under inserts and fast on big tables.'],
    [12.5, 'A retried payment without an Idempotency-Key can charge twice. With a key, the server returns the first result.'],
    [19.5, 'Give every error the same shape, such as RFC 9457 problem details, and plan versioning before you need it.']],
  draw: function (K, t) {
    var P = K.P;
    function ids(list, x, y, a, bad, good) {
      list.forEach(function (v, i) {
        var c = bad === v ? P.red : good ? P.green : P.acc;
        K.box(x + i * 58, y - 22, 50, 44, { stroke: c, r: 6, a: a });
        K.text(String(v), x + 25 + i * 58, y, { size: 19, mono: true, align: 'center', a: a });
      });
    }
    K.box(40, 84, 580, 300, { fill: P.code, stroke: P.line, a: K.p(t, 0.3) });
    K.text('newest first · 3 per page', 64, 110, { size: 17, color: P.muted, a: K.p(t, 0.3) });
    K.text('page 1', 64, 154, { size: 18, a: K.p(t, 0.8) }); ids([6, 5, 4], 200, 154, K.p(t, 0.8));
    K.chip('+ new item 7', 470, 154, { size: 17, stroke: P.warm, color: P.warm, a: K.p(t, 2) });
    K.text('offset = 3', 64, 220, { size: 18, mono: true, a: K.p(t, 3.2) }); ids([4, 3, 2], 200, 220, K.p(t, 3.4), 4);
    K.text('4 again: duplicate', 390, 220, { size: 17, color: P.red, a: K.p(t, 4.4) });
    K.text('after id 4', 64, 300, { size: 18, mono: true, a: K.p(t, 7) }); ids([3, 2, 1], 200, 300, K.p(t, 7.4), null, true);
    K.mark(390, 300, true, 0.7, K.p(t, 8.4)); K.text('stable', 414, 300, { size: 17, color: P.green, a: K.p(t, 8.4) });
    K.text('?cursor=4&limit=3', 200, 352, { size: 17, mono: true, color: P.muted, a: K.p(t, 9) });
    /* idempotency */
    K.box(660, 84, 580, 300, { fill: P.code, stroke: P.line, a: K.p(t, 12.6) });
    K.text('POST /payments', 684, 112, { size: 19, mono: true, weight: 700, a: K.p(t, 12.6) });
    K.text('Idempotency-Key: 9f2c-41aa', 684, 144, { size: 17, mono: true, color: P.warm, a: K.p(t, 13) });
    K.box(684, 176, 140, 56, { stroke: P.blue, a: K.p(t, 13.2) }); K.text('client', 754, 204, { size: 19, align: 'center', a: K.p(t, 13.2) });
    K.box(1076, 176, 140, 56, { stroke: P.green, a: K.p(t, 13.2) }); K.text('server', 1146, 204, { size: 19, align: 'center', a: K.p(t, 13.2) });
    K.arrow(830, 194, 1070, 194, { p: K.p(t, 13.6, 0.5), color: P.blue, lw: 2 });
    K.text('timeout…', 950, 236, { size: 16, color: P.warm, align: 'center', a: K.p(t, 14.4) });
    K.arrow(830, 262, 1070, 262, { p: K.p(t, 15, 0.5), color: P.blue, lw: 2, dash: [6, 5] });
    K.text('retry, same key', 950, 284, { size: 16, color: P.blue, align: 'center', a: K.p(t, 15.2) });
    K.mark(700, 340, true, 0.7, K.p(t, 16.6)); K.text('same key → first result, charged once', 724, 340, { size: 17, color: P.green, a: K.p(t, 16.6) });
    K.mark(700, 370, false, 0.6, K.p(t, 17.6)); K.text('no key → maybe charged twice', 724, 370, { size: 17, color: P.red, a: K.p(t, 17.6) });
    /* error contract */
    var e = ['HTTP/1.1 409 Conflict', 'Content-Type: application/problem+json', '{ "type": "/errors/out-of-stock", "title": "Out of stock",', '  "status": 409, "detail": "Only 2 left" }'];
    K.panel(40, 404, 760, 186, 'one error shape everywhere', { a: K.p(t, 19.6) });
    K.code(e, 62, 448, { size: 17, lh: 1.5, n: K.typed(t, e, [19.9, 20.6, 21.4, 22.6], 44), t: t, a: K.p(t, 19.6) });
    [['versioning plan', P.purple], ['ETag caching', P.acc], ['rate limits', P.warm]].forEach(function (c, i) {
      K.chip(c[0], 1010, 438 + i * 52, { size: 18, stroke: c[1], a: K.p(t, 22 + i * 0.6) });
    });
  } },

/* 9 ─ observability */
{ d: 26, title: 'Observability',
  caps: [
    [0.3, 'Observability has three pillars: logs are events, metrics are numbers over time, and traces follow one request across services.'],
    [7.5, 'OpenTelemetry is the vendor-neutral way to emit all three. In browsers, real-user monitoring adds Web Vitals and errors.'],
    [14, 'Define SLOs, like 99.9 percent of requests under 300 ms, and alert on what users feel, not on CPU.'],
    [20, 'Ship behind feature flags with a gradual rollout, watch the numbers, and roll back fast when they turn red.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    function pillar(x, title, color, a) { K.box(x, 84, 380, 180, { fill: P.code, stroke: color, a: a }); K.text(title, x + 22, 110, { size: 20, weight: 700, color: color, a: a }); }
    pillar(40, 'logs · events', P.blue, K.p(t, 0.6));
    K.text('{"level":"error","msg":"pay failed",', 60, 152, { size: 15, mono: true, a: K.p(t, 1.2) });
    K.text(' "orderId":"o-81","traceId":"4bf9"}', 60, 176, { size: 15, mono: true, a: K.p(t, 1.2) });
    K.text('structured JSON, no secrets', 60, 230, { size: 16, color: P.muted, a: K.p(t, 1.8) });
    pillar(450, 'metrics · numbers', P.warm, K.p(t, 2.2));
    var pts = [], i;
    for (i = 0; i <= 20; i++) pts.push([470 + i * 16, 210 - (20 + 22 * Math.sin(i * 0.7) + (i > 15 ? 40 : 0)) * 0.9]);
    var np = Math.floor(21 * K.p(t, 2.6, 2));
    if (np > 1) { g.save(); g.globalAlpha *= K.p(t, 2.6); g.strokeStyle = P.warm; g.lineWidth = 3; g.beginPath(); for (i = 0; i < np; i++) { if (i) g.lineTo(pts[i][0], pts[i][1]); else g.moveTo(pts[i][0], pts[i][1]); } g.stroke(); g.restore(); }
    K.text('p99 latency (ms)', 470, 240, { size: 16, color: P.muted, a: K.p(t, 3.2) });
    pillar(860, 'traces · one request', P.green, K.p(t, 3.8));
    [['gateway', 0, 300], ['orders', 30, 220], ['db query', 60, 90], ['payments', 160, 120]].forEach(function (s, k) {
      var q = K.p(t, 4.2 + k * 0.4);
      K.box(960 + s[1] * 0.85, 136 + k * 30, s[2] * 0.85, 22, { fill: P.green, r: 4, a: q * 0.7 });
      K.text(s[0], 950, 147 + k * 30, { size: 15, align: 'right', a: q });
    });
    var ot = K.p(t, 7.7);
    K.box(40, 278, 1200, 44, { fill: 'rgba(79,209,197,.10)', stroke: P.acc, a: ot });
    K.text('OpenTelemetry: one vendor-neutral standard for all three', 640, 300, { size: 19, weight: 700, color: P.acc, align: 'center', a: ot });
    K.text('RUM', 64, 356, { size: 19, weight: 700, color: P.purple, a: K.p(t, 10) });
    [['LCP 2.1 s', P.green], ['INP 180 ms', P.green], ['CLS 0.05', P.green], ['JS errors + source maps', P.red]].forEach(function (c, k) {
      K.chip(c[0], [190, 340, 480, 690][k], 356, { mono: k < 3, size: 17, stroke: c[1], a: K.p(t, 10.4 + k * 0.5) });
    });
    /* SLO */
    var s = K.p(t, 14.2);
    K.box(40, 392, 580, 198, { stroke: P.acc, a: s });
    K.text('SLO: 99.9% of requests < 300 ms', 64, 422, { size: 19, weight: 700, a: s });
    K.text('error budget left this month', 64, 460, { size: 16, color: P.muted, a: K.p(t, 14.8) });
    K.box(64, 476, 520, 22, { fill: P.card, r: 6, a: K.p(t, 14.8) });
    K.box(64, 476, 520 * (1 - 0.38 * K.p(t, 15, 1.4)), 22, { fill: P.acc, r: 6, a: K.p(t, 14.8) });
    K.mark(80, 530, true, 0.65, K.p(t, 16.6)); K.text('alert: error rate, p99 latency', 104, 530, { size: 17, a: K.p(t, 16.6) });
    K.mark(80, 564, false, 0.65, K.p(t, 17.6)); K.text('alert: CPU 80% (noise)', 104, 564, { size: 17, color: P.muted, a: K.p(t, 17.6) });
    /* rollout */
    var r = K.p(t, 20.2);
    K.box(660, 392, 580, 198, { stroke: P.purple, a: r });
    K.text('flag: newCheckout', 684, 422, { size: 19, weight: 700, mono: true, color: P.purple, a: r });
    [['1%', 20.6], ['10%', 21.4], ['50%', 22.2], ['100%', 24.6]].forEach(function (c, k) {
      var x = 720 + k * 130, q = K.back((t - c[1]) / 0.4); if (q <= 0) return;
      K.chip(c[0], x, 476, { s: q, a: K.clamp(q), mono: true, size: 18, stroke: k === 3 ? P.green : P.purple });
      if (k) K.arrow(x - 100, 476, x - 34, 476, { color: P.muted, lw: 2, a: K.clamp(q) });
    });
    K.text('errors spike at 50% → roll back, fix, resume', 684, 548, { size: 17, color: P.red, a: K.p(t, 22.8) });
    K.curve(980, 496, 920, 540, 860, 496, { p: K.p(t, 23.2, 0.6), color: P.red, lw: 2.5, head: 10 });
    K.text('canary + fast rollback', 684, 576, { size: 16, color: P.muted, a: K.p(t, 24.2) });
  } },

/* 10 ─ recap */
{ d: 15, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 29 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['CSR: empty HTML first; SSR: fast paint, then hydration',
     'SSG for static, ISR for fresh-enough, private for personal',
     'Streaming and islands send less JavaScript',
     'Micro-frontends buy team autonomy at a real cost',
     'Monorepo: task graph, cache, affected-only CI, boundaries',
     'Cursor pages, idempotency keys, one error shape, telemetry'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 29 examples with ▶ Run', 640, 540, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
