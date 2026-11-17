/* Day 38 in motion: a performance triage playbook with LCP, INP and CLS cases, then safe delivery: flags, canaries, circuit breakers, SLOs, incidents and STRIDE.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day38', {
  kicker: 'JavaScript: Zero to Architect · Day 38',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 38: finding out why a page is slow, and shipping changes without breaking things.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Fast and safe', 0, 0, { size: 100, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 38 · Performance cases and reliability', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Why is it slow?', 'Ship safely', 'Fail gracefully'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ triage */
{ d: 26, title: 'Triage: why is it slow?',
  caps: [
    [0.3, '"The page is slow." Do not guess. Start with field data from real users, at the 75th percentile, on the route that hurts.'],
    [6.5, 'Find which Core Web Vital fails: LCP for loading, INP for responsiveness, CLS for visual stability. Here LCP is 4.8 seconds.'],
    [13, 'Reproduce it in the lab on a throttled mid-range device. Your fast laptop hides most problems. Record a trace and a waterfall.'],
    [19.5, 'Then prove the cause with evidence, fix the biggest thing first, one change at a time, and verify in the field.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    K.text('Field data (RUM / CrUX) · p75 · /product', 60, 80, { size: 17, color: P.muted, a: K.p(t, 0.6) });
    var C = [['LCP', 'loading', '4.8 s', 'good ≤ 2.5 s', 4.8 / 6, 2.5 / 6, 4 / 6, true],
             ['INP', 'responsiveness', '180 ms', 'good ≤ 200 ms', 180 / 600, 200 / 600, 500 / 600, false],
             ['CLS', 'visual stability', '0.05', 'good ≤ 0.1', 0.05 / 0.4, 0.1 / 0.4, 0.25 / 0.4, false]];
    var bad = K.p(t, 7.2);
    C.forEach(function (c, i) {
      var x = 60 + i * 400, a = K.p(t, 1 + i * 0.5), hot = c[7];
      K.box(x, 100, 360, 170, { stroke: hot && bad > 0 ? P.red : P.line, lw: hot && bad > 0 ? 3 : 2, a: a });
      K.text(c[0], x + 24, 132, { size: 24, weight: 800, a: a });
      K.text(c[1], x + 90, 133, { size: 16, color: P.muted, a: a });
      K.text(c[2], x + 24, 182, { size: 34, weight: 700, color: hot ? P.red : P.green, a: K.p(t, 1.6 + i * 0.5) });
      K.text(c[3], x + 336, 184, { size: 16, color: P.muted, align: 'right', a: a });
      var bx = x + 24, bw = 312;
      K.box(bx, 222, bw * c[5], 12, { fill: P.green, r: 3, a: a * 0.7 });
      K.box(bx + bw * c[5], 222, bw * (c[6] - c[5]), 12, { fill: P.warm, r: 3, a: a * 0.7 });
      K.box(bx + bw * c[6], 222, bw * (1 - c[6]), 12, { fill: P.red, r: 3, a: a * 0.7 });
      var m = K.p(t, 1.8 + i * 0.5, 0.8);
      g.save(); g.globalAlpha *= a; g.fillStyle = P.ink; g.beginPath(); var mx = bx + bw * c[4] * m; g.moveTo(mx, 218); g.lineTo(mx - 7, 206); g.lineTo(mx + 7, 206); g.fill(); g.restore();
    });
    K.mark(392, 118, false, 0.75, bad); K.mark(792, 118, true, 0.75, K.p(t, 8)); K.mark(1192, 118, true, 0.75, K.p(t, 8.4));
    var F = [['Field data', 'p75, real users', 0.8, P.acc], ['Failing vital', 'LCP · INP · CLS', 7.6, P.red], ['Lab repro', 'throttled, traced', 13.4, P.blue],
             ['Root cause', 'prove it', 19.8, P.purple], ['Fix + verify', 'biggest first', 21.4, P.green]];
    F.forEach(function (f, i) {
      var x = 40 + i * 246, q = K.back((t - f[2]) / 0.5); if (q <= 0) return;
      g.save(); g.translate(x + 105, 380); g.scale(q, q); g.translate(-x - 105, -380);
      K.box(x, 332, 210, 96, { stroke: f[3], a: K.clamp(q) });
      K.text(f[0], x + 105, 366, { size: 20, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(f[1], x + 105, 400, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      g.restore();
      if (i) K.arrow(x - 32, 380, x - 6, 380, { p: K.p(t, f[2] - 0.2, 0.3), color: P.muted, lw: 2, head: 9 });
    });
    K.chip('lab: mid-range phone · 4× CPU slowdown · slow 4G', 640, 486, { size: 18, stroke: P.blue, a: K.p(t, 14.4) });
    K.chip('Performance trace', 470, 550, { size: 17, stroke: P.line, a: K.p(t, 16.4) });
    K.chip('network waterfall', 810, 550, { size: 17, stroke: P.line, a: K.p(t, 17) });
  } },

/* 3 ─ LCP case */
{ d: 24, title: 'Case: slow LCP',
  caps: [
    [0.3, 'Case one: a slow LCP. The waterfall shows the hero image is discovered late, only after the render-blocking script.'],
    [7, 'The image is also 900 KB. LCP lands at 4.8 seconds on a mid-range phone.'],
    [11, 'The fix: preload the image with fetchpriority high, convert it to AVIF at the right size, and defer the script.'],
    [17.5, 'Now the image starts early and LCP drops to 2.1 seconds. And never lazy-load the LCP image.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, x0 = 300, sc = 170;
    function bar(y, a0, a1, col, label, t0, txt) {
      var q = K.p(t, t0, 0.6), w = (a1 - a0) * sc * q;
      K.text(label, 60, y + 13, { size: 18, mono: true, a: K.p(t, t0 - 0.2) });
      K.box(x0 + a0 * sc, y, w, 26, { fill: col, r: 5, a: 0.75 * K.p(t, t0 - 0.2) });
      if (txt) K.text(txt, x0 + a0 * sc + 12, y + 13, { size: 16, weight: 600, color: P.bg, a: K.p(t, t0 + 0.5) });
    }
    K.text('Before', 60, 96, { size: 20, weight: 700, color: P.warm, a: K.p(t, 0.4) });
    bar(120, 0, 0.5, P.blue, 'index.html', 0.8);
    bar(160, 0.5, 1.1, P.warm, 'app.css', 1.6);
    bar(200, 0.5, 2.2, P.warm, 'app.js', 2.2, 'render-blocking');
    bar(240, 2.2, 4.8, P.red, 'hero.jpg', 3.6, 'found late · 900 KB JPEG');
    for (var s = 0; s <= 5; s++) K.text(s + ' s', x0 + s * sc, 290, { size: 16, color: P.muted, align: 'center', a: K.p(t, 0.8) });
    var l1 = K.p(t, 7.6);
    g.save(); g.globalAlpha *= l1; g.strokeStyle = P.red; g.lineWidth = 2.5; g.setLineDash([6, 5]);
    g.beginPath(); g.moveTo(x0 + 4.8 * sc, 112); g.lineTo(x0 + 4.8 * sc, 274); g.stroke(); g.restore();
    K.text('LCP 4.8 s', x0 + 4.8 * sc, 98, { size: 19, weight: 700, color: P.red, align: 'center', a: l1 });
    K.text('After', 60, 340, { size: 20, weight: 700, color: P.green, a: K.p(t, 11.3) });
    bar(362, 0, 0.5, P.blue, 'index.html', 12);
    bar(402, 0.3, 1.7, P.green, 'hero.avif', 12.8, 'preloaded · 180 KB');
    bar(442, 0.5, 0.9, P.warm, 'app.css', 13.6);
    bar(482, 0.5, 1.5, P.blue, 'app.js', 14.4, 'defer');
    var l2 = K.p(t, 17.8);
    g.save(); g.globalAlpha *= l2; g.strokeStyle = P.green; g.lineWidth = 2.5; g.setLineDash([6, 5]);
    g.beginPath(); g.moveTo(x0 + 2.1 * sc, 356); g.lineTo(x0 + 2.1 * sc, 516); g.stroke(); g.restore();
    K.text('LCP 2.1 s', x0 + 2.1 * sc + 14, 342, { size: 19, weight: 700, color: P.green, a: l2 });
    var code = ['<link rel="preload" as="image" href="hero.avif" fetchpriority="high">'];
    K.code(code, 60, 540, { size: 17, n: K.typed(t, code, [11.4], 40), t: t, a: K.p(t, 11.3) });
    K.chip('✗ loading="lazy" on the LCP image', 1010, 470, { size: 17, stroke: P.red, color: P.red, a: K.p(t, 19.5) });
  } },

/* 4 ─ INP and CLS cases */
{ d: 24, title: 'Cases: INP and CLS',
  caps: [
    [0.3, 'Case two: poor INP. A click runs a 400 millisecond handler, so the next paint has to wait. The page feels frozen.'],
    [6.5, 'Split the work and yield to the main thread between chunks, or move heavy work to a worker. Now the paint comes right after the click.'],
    [13, 'Case three: high CLS. An image without dimensions loads late and pushes the text down while the user reads.'],
    [18.5, 'Reserve the space with width and height, or aspect-ratio, and the layout stays still.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    function track(y, label, a) {
      K.text(label, 60, y + 20, { size: 18, weight: 700, color: P.muted, a: a });
      K.box(200, y, 800, 40, { fill: P.code, stroke: P.line, r: 6, a: a });
    }
    function vline(x, y0, y1, col, a) { g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); g.restore(); }
    track(96, 'Before', K.p(t, 0.3));
    K.text('click', 232, 80, { size: 16, align: 'center', a: K.p(t, 0.8) }); vline(232, 90, 142, P.acc, K.p(t, 0.8));
    K.box(236, 102, 400 * K.p(t, 1.4, 1.6), 28, { fill: 'rgba(252,129,129,.35)', stroke: P.red, r: 4 });
    K.text('handler: 400 ms', 436, 116, { size: 16, align: 'center', a: K.p(t, 2.4) });
    vline(660, 90, 142, P.red, K.p(t, 3.4)); K.text('next paint', 660, 80, { size: 16, color: P.red, align: 'center', a: K.p(t, 3.4) });
    K.text('INP ≈ 450 ms', 1030, 116, { size: 20, weight: 700, color: P.red, a: K.p(t, 4) });
    track(186, 'After', K.p(t, 6.8));
    vline(232, 180, 232, P.acc, K.p(t, 7));
    for (var k = 0; k < 6; k++) {
      var x = 236 + k * 74;
      K.box(x, 192, 50, 28, { fill: 'rgba(104,211,145,.3)', stroke: P.green, r: 4, a: K.p(t, 7.6 + k * 0.35, 0.3) });
    }
    vline(298, 180, 232, P.green, K.p(t, 8.2)); K.text('paint', 298, 246, { size: 16, color: P.green, align: 'center', a: K.p(t, 8.2) });
    K.text('INP ≈ 80 ms', 1030, 206, { size: 20, weight: 700, color: P.green, a: K.p(t, 9.6) });
    K.chip('await scheduler.yield()', 420, 290, { size: 17, mono: true, stroke: P.green, a: K.p(t, 9) });
    K.chip('heavy work → Web Worker', 760, 290, { size: 17, stroke: P.blue, a: K.p(t, 10.6) });
    /* CLS pages */
    function page(x, title, metric, mcol, reserve, a) {
      K.box(x, 340, 360, 245, { stroke: P.line, a: a });
      K.text(title, x + 20, 364, { size: 18, weight: 700, a: a });
      K.text(metric, x + 340, 364, { size: 17, weight: 700, color: mcol, align: 'right', a: K.p(t, reserve ? 19.4 : 15.4) });
      var img = K.p(t, 14.4, 0.5), h = reserve ? 100 : 100 * img;
      if (reserve) K.box(x + 20, 384, 320, 100, { fill: false, stroke: P.green, dash: [6, 6], r: 6, a: a });
      K.box(x + 20, 384, 320, h, { fill: 'rgba(99,179,237,.35)', r: 6, a: a * (reserve ? img : 1) });
      for (var i = 0; i < 3; i++) K.box(x + 20, 394 + (reserve ? 100 : h) + i * 28, 300 - i * 40, 12, { fill: reserve ? P.muted : (img > 0 && img < 1 ? P.red : P.muted), r: 4, a: a * 0.8 });
    }
    page(160, 'No size', 'CLS 0.25', P.red, false, K.p(t, 13.3));
    page(760, 'Space reserved', 'CLS 0', P.green, true, K.p(t, 18.8));
    K.text('width + height', 640, 446, { size: 17, color: P.green, align: 'center', a: K.p(t, 19) });
    K.text('or aspect-ratio', 640, 474, { size: 17, color: P.green, align: 'center', a: K.p(t, 19.4) });
    K.arrow(586, 510, 750, 510, { p: K.p(t, 19.6, 0.5), color: P.green, lw: 2.5 });
  } },

/* 5 ─ tell it with numbers */
{ d: 20, title: 'Tell it with numbers',
  caps: [
    [0.3, 'In an interview, tell the story with numbers: LCP at the 75th percentile was 4.8 seconds on mid-range Android.'],
    [5.5, 'The trace showed a 900 KB hero image found after blocking scripts. I preloaded it, converted it to AVIF, and deferred the scripts.'],
    [12, 'LCP fell to 2.1 seconds and conversion rose 6%. Then keep the gain: a budget in CI fails the build when a page regresses.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, base = 430, k = 60;
    K.box(80, base, 420, 3, { fill: P.line, r: 1, a: K.p(t, 0.4) });
    var b1 = K.p(t, 0.8, 1), b2 = K.p(t, 12.3, 1);
    K.box(140, base - 4.8 * k * b1, 120, 4.8 * k * b1, { fill: 'rgba(252,129,129,.4)', stroke: P.red, r: 6 });
    K.text('4.8 s', 200, base - 4.8 * k - 20, { size: 22, weight: 700, color: P.red, align: 'center', a: K.p(t, 1.6) });
    K.text('before', 200, 456, { size: 17, color: P.muted, align: 'center', a: K.p(t, 0.8) });
    if (b2 > 0) K.box(320, base - 2.1 * k * b2, 120, 2.1 * k * b2, { fill: 'rgba(104,211,145,.4)', stroke: P.green, r: 6 });
    K.text('2.1 s', 380, base - 2.1 * k - 20, { size: 22, weight: 700, color: P.green, align: 'center', a: K.p(t, 13.1) });
    K.text('after', 380, 456, { size: 17, color: P.muted, align: 'center', a: K.p(t, 12.3) });
    var th = K.p(t, 1.6);
    g.save(); g.globalAlpha *= th; g.strokeStyle = P.green; g.lineWidth = 2; g.setLineDash([6, 6]);
    g.beginPath(); g.moveTo(90, base - 2.5 * k); g.lineTo(500, base - 2.5 * k); g.stroke(); g.restore();
    K.text('good ≤ 2.5 s', 500, base - 2.5 * k - 14, { size: 16, color: P.green, align: 'right', a: th });
    K.text('LCP p75', 80, 100, { size: 18, weight: 700, color: P.muted, a: K.p(t, 0.4) });
    K.box(560, 96, 660, 360, { stroke: P.line, a: K.p(t, 0.6) });
    var L = [['Problem', 'LCP p75 4.8 s on mid-range Android', P.red, 1.2, 140],
             ['Evidence', '900 KB hero found after blocking JS', P.purple, 5.8, 210],
             ['Action', 'preload + AVIF + defer scripts', P.blue, 8.6, 280],
             ['Result', 'LCP 2.1 s · conversion +6%', P.green, 12.6, 350]];
    L.forEach(function (l) {
      var q = K.p(t, l[3], 0.5);
      K.text(l[0], 590, l[4], { size: 20, weight: 700, color: l[2], a: q });
      K.text(l[1], 720 - (1 - q) * 14, l[4], { size: 20, a: q });
    });
    K.text('numbers before and after, every time', 590, 414, { size: 17, color: P.muted, a: K.p(t, 13.6) });
    var S = [['build', P.line, 15], ['tests', P.green, 15.6], ['perf budget', P.warm, 16.2]];
    S.forEach(function (s, i) {
      var x = 150 + i * 220;
      K.chip(s[0], x, 530, { size: 18, stroke: s[1], a: K.p(t, s[2]) });
      K.arrow(x + 62, 530, x + 150, 530, { p: K.p(t, s[2] + 0.3, 0.4), color: P.muted, lw: 2, head: 9 });
    });
    K.chip('✗ LCP 3.1 s > 2.5 s: build fails', 900, 530, { size: 18, stroke: P.red, color: P.red, a: K.p(t, 17) });
  } },

/* 6 ─ feature flags */
{ d: 24, title: 'Feature flags',
  caps: [
    [0.3, 'Now reliability. Most outages come from changes, so separate deploy from release: ship the code dark, behind a feature flag.'],
    [6.5, 'A percentage rollout hashes the flag name plus the user id into a bucket from 0 to 99. The user is in if the bucket is below the percentage.'],
    [13, 'The hash is stable, so each user gets the same experience every time. Raising 20% to 50% only adds users.'],
    [19, 'Once fully rolled out, delete the flag. Old flags pile up into combinations nobody tests.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    K.chip('deploy: code ships dark', 190, 100, { size: 18, stroke: P.blue, a: K.p(t, 1) });
    K.chip('release: flip the flag', 500, 100, { size: 18, stroke: P.green, a: K.p(t, 2.8) });
    var dr = K.win(t, 0.6, 6.9, 0.3), on = t > 3.2;
    K.box(60, 150, 280, 96, { stroke: P.blue, a: dr });
    K.text('servers: v2 deployed', 80, 180, { size: 18, weight: 700, a: dr });
    K.text('flag newNav: ' + (on ? 'ON for 5%' : 'OFF'), 80, 214, { size: 17, mono: true, color: on ? P.green : P.muted, a: dr });
    K.arrow(346, 198, 416, 198, { p: K.p(t, 1.4, 0.4), color: P.muted, lw: 2, head: 9, a: dr });
    K.box(424, 150, 270, 96, { stroke: P.green, a: dr });
    K.text('users', 444, 180, { size: 18, weight: 700, a: dr });
    K.text(on ? 'a few see the new nav' : 'everyone still sees v1', 444, 214, { size: 17, color: on ? P.green : P.muted, a: dr });
    K.chip('newNav:u42', 120, 180, { size: 19, mono: true, stroke: P.acc, a: K.p(t, 6.8) });
    K.arrow(196, 180, 246, 180, { p: K.p(t, 7.2, 0.4), color: P.muted, lw: 2, head: 9 });
    K.box(254, 154, 170, 52, { stroke: P.purple, a: K.p(t, 7.4) });
    K.text('FNV-1a hash', 339, 180, { size: 18, weight: 600, align: 'center', a: K.p(t, 7.4) });
    K.arrow(430, 180, 480, 180, { p: K.p(t, 7.8, 0.4), color: P.muted, lw: 2, head: 9 });
    K.text('% 100', 455, 160, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 7.8) });
    K.chip('bucket 17', 560, 180, { size: 19, mono: true, stroke: P.warm, a: K.p(t, 8.2) });
    K.text('17 < 20  →  on', 60, 244, { size: 22, mono: true, color: P.green, a: K.p(t, 9.6) });
    var code = ['const enabled = (flag, user, pct) =>', '  bucket(flag + ":" + user) < pct;', 'enabled("newNav", "u42", 20) // true, always'];
    K.panel(40, 290, 660, 150, '', { a: K.p(t, 10.4) });
    K.code(code, 64, 312, { size: 19, lh: 1.6, n: K.typed(t, code, [10.6, 12, 13.4], 34), t: t, a: K.p(t, 10.4) });
    K.chip('delete the flag after 100%', 230, 496, { size: 18, stroke: P.warm, a: K.p(t, 19.4) });
    K.text('flag debt: untested combinations', 60, 556, { size: 17, color: P.red, a: K.p(t, 20.6) });
    /* the grid: 100 users, each labelled with their bucket */
    var pct = 20 * K.p(t, 9.2, 1.4) + 30 * K.p(t, 15, 1.6), ga = K.p(t, 6.6);
    K.text('100 users, by bucket', 760, 84, { size: 17, color: P.muted, a: ga });
    K.text('rollout ' + Math.round(pct) + '%', 1200, 84, { size: 18, weight: 700, color: P.warm, align: 'right', a: ga });
    for (var i = 0; i < 100; i++) {
      var b = (i * 37 + 11) % 100, x = 760 + (i % 10) * 44, y = 104 + Math.floor(i / 10) * 46, on = b < pct;
      var fresh = on && b >= 20 && t > 15 && t < 19.5;
      K.box(x, y, 38, 40, { fill: on ? 'rgba(79,209,197,.45)' : P.card, stroke: fresh ? P.warm : on ? P.acc : P.line, lw: fresh ? 2.5 : 1.5, r: 6, a: ga });
      K.text(String(b), x + 19, y + 21, { size: 16, mono: true, align: 'center', color: on ? P.ink : P.muted, a: ga });
    }
  } },

/* 7 ─ canary and rollback */
{ d: 24, title: 'Canary and rollback',
  caps: [
    [0.3, 'Release gradually: 1% of users, then 10%, 50% and everyone, watching error rate, latency and business metrics at each step.'],
    [7.5, 'Here the 10% step pushes the error rate past the SLO threshold.'],
    [12, 'An automatic rollback, or flipping the flag off, ends the damage in seconds. Only a small cohort was ever exposed.'],
    [18, 'Rollback must always be possible: immutable builds, backward-compatible API and data changes, and old chunks kept for open tabs.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, H = { 0: 270, 1: 240, 10: 205, 50: 160, 100: 115 };
    var xc = 120 + 420 * K.clamp((t - 1) / 10) + 260 * K.clamp((t - 12) / 4);
    K.text('users on the new version', 60, 84, { size: 17, color: P.muted, a: K.p(t, 0.3) });
    K.box(120, 270, 1080, 2, { fill: P.line, a: K.p(t, 0.3) });
    var plan = [[120, 330, 1], [330, 540, 10], [540, 750, 50], [750, 1200, 100]];
    g.save(); g.globalAlpha *= K.p(t, 0.6) * 0.8; g.strokeStyle = P.muted; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath();
    plan.forEach(function (s, i) { if (!i) g.moveTo(s[0], H[s[2]]); else g.lineTo(s[0], H[s[2]]); g.lineTo(s[1], H[s[2]]); }); g.stroke(); g.restore();
    plan.forEach(function (s, i) { K.text(s[2] + '%', (s[0] + Math.min(s[1], 960)) / 2, H[s[2]] - 16, { size: 17, color: P.muted, align: 'center', a: K.p(t, 0.8 + i * 0.4) }); });
    g.save(); g.beginPath(); g.rect(0, 0, xc, 720); g.clip();
    g.strokeStyle = P.blue; g.lineWidth = 4; g.beginPath(); g.moveTo(120, 240); g.lineTo(330, 240); g.lineTo(330, 205); g.lineTo(540, 205); g.lineTo(540, 270); g.lineTo(800, 270); g.stroke();
    g.restore();
    K.text('error rate', 60, 320, { size: 17, color: P.muted, a: K.p(t, 0.3) });
    K.box(120, 500, 1080, 2, { fill: P.line, a: K.p(t, 0.3) });
    var slo = K.p(t, 1);
    g.save(); g.globalAlpha *= slo; g.strokeStyle = P.red; g.lineWidth = 2; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(120, 440); g.lineTo(1200, 440); g.stroke(); g.restore();
    K.text('SLO: 1% errors', 1200, 424, { size: 17, color: P.red, align: 'right', a: slo });
    g.save(); g.beginPath(); g.rect(0, 0, xc, 720); g.clip();
    g.strokeStyle = P.warm; g.lineWidth = 3.5; g.beginPath();
    [[120, 484], [420, 484], [470, 440], [520, 380], [540, 376], [560, 440], [600, 484], [800, 484]].forEach(function (p, i) { if (!i) g.moveTo(p[0], p[1]); else g.lineTo(p[0], p[1]); });
    g.stroke(); g.restore();
    var rb = K.p(t, 11);
    g.save(); g.globalAlpha *= rb; g.strokeStyle = P.red; g.lineWidth = 2.5; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(540, 110); g.lineTo(540, 500); g.stroke(); g.restore();
    K.text('auto-rollback', 552, 300, { size: 18, weight: 700, color: P.red, a: rb });
    K.text('exposed: 10% of users, for minutes', 700, 300, { size: 17, color: P.muted, a: K.p(t, 13.4) });
    K.chip('immutable builds', 250, 556, { size: 17, stroke: P.acc, a: K.p(t, 18.4) });
    K.chip('expand → migrate → contract', 620, 556, { size: 17, stroke: P.acc, a: K.p(t, 19.6) });
    K.chip('keep old chunks for open tabs', 1000, 556, { size: 17, stroke: P.acc, a: K.p(t, 21) });
  } },

/* 8 ─ circuit breaker */
{ d: 25, title: 'Circuit breaker',
  caps: [
    [0.3, 'A circuit breaker protects users from a failing dependency. Closed is normal: calls go through, and failures are counted.'],
    [6.5, 'After three failures in a row it opens. Calls now fail fast with no network trip, so retries cannot pile onto a sick service.'],
    [13, 'After a cooldown it goes half-open and lets one probe through. Success closes it; another failure opens it again.'],
    [19, 'Combine it with timeouts, retries with backoff, and a fallback: show cached data and hide non-essential widgets.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    var st = t < 7.6 ? 0 : t < 14.4 ? 1 : t < 16.4 ? 2 : 0;
    var S = [['closed', 'calls pass', 220, P.green], ['open', 'fail fast', 640, P.red], ['half-open', 'one probe', 1060, P.warm]];
    S.forEach(function (s, i) {
      var a = K.p(t, 0.5 + (i ? 6.6 + (i - 1) * 6.4 : 0)), act = st === i && a > 0.5;
      g.save(); g.globalAlpha *= a; g.lineWidth = act ? 6 : 2.5; g.strokeStyle = s[3]; g.fillStyle = act ? P.card : P.bg;
      g.beginPath(); g.arc(s[2], 200, 64, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(s[0], s[2], 190, { size: 22, weight: 700, align: 'center', color: act ? s[3] : P.ink, a: a });
      K.text(s[1], s[2], 220, { size: 16, color: P.muted, align: 'center', a: a });
    });
    K.arrow(290, 200, 570, 200, { p: K.p(t, 6.8, 0.6), color: P.red });
    K.text('3 failures', 430, 182, { size: 17, color: P.red, align: 'center', a: K.p(t, 7) });
    K.arrow(710, 200, 990, 200, { p: K.p(t, 13.2, 0.6), color: P.warm });
    K.text('cooldown', 850, 182, { size: 17, color: P.warm, align: 'center', a: K.p(t, 13.4) });
    K.curve(1030, 262, 640, 380, 250, 262, { p: K.p(t, 15.8, 0.8), color: P.green });
    K.text('probe succeeds', 640, 346, { size: 17, color: P.green, align: 'center', a: K.p(t, 16.2) });
    K.curve(1020, 146, 850, 70, 690, 146, { p: K.p(t, 17.4, 0.6), color: P.red, dash: [6, 6], lw: 2.5 });
    K.text('probe fails', 850, 90, { size: 17, color: P.red, align: 'center', a: K.p(t, 17.6) });
    /* calls */
    K.text('calls', 60, 440, { size: 18, weight: 700, color: P.muted, a: K.p(t, 1) });
    var C = [['ok', 1.4], ['ok', 2.4], ['fail', 4], ['fail', 5], ['fail', 6.2], ['fast', 8.4], ['fast', 9.4], ['fast', 10.4], ['ok', 15], ['ok', 17], ['ok', 18]];
    C.forEach(function (c, i) {
      var x = 160 + i * 95, q = K.p(t, c[1], 0.3);
      if (c[0] === 'fast') {
        g.save(); g.globalAlpha *= q; g.strokeStyle = P.red; g.lineWidth = 2.5; g.setLineDash([4, 4]); g.beginPath(); g.arc(x, 440, 15, 0, 7); g.stroke(); g.restore();
      } else K.mark(x, 440, c[0] === 'ok', 1, q);
    });
    K.text('counted', 160 + 3 * 95, 478, { size: 16, color: P.red, align: 'center', a: K.p(t, 6.4) });
    K.text('instant error, no request', 160 + 6 * 95, 478, { size: 16, color: P.muted, align: 'center', a: K.p(t, 10.6) });
    K.text('probe', 160 + 8 * 95, 478, { size: 16, color: P.warm, align: 'center', a: K.p(t, 15) });
    [['timeouts', 170, 19.4], ['retries + backoff', 390, 20], ['fallback: cached data', 660, 20.8], ['hide non-essential widgets', 990, 21.6]].forEach(function (c) {
      K.chip(c[0], c[1], 552, { size: 17, stroke: P.acc, a: K.p(t, c[2]) });
    });
  } },

/* 9 ─ SLOs, incidents, STRIDE */
{ d: 25, title: 'SLOs, incidents, security',
  caps: [
    [0.3, 'Define SLOs on what users feel, for example: 99.9% of page loads succeed. The other 0.1% is your error budget.'],
    [6.5, 'When the budget burns too fast, slow down releases and fix reliability first.'],
    [11, 'In an incident: detect, triage, mitigate first with a rollback or flag, communicate, then hold a blameless review with action items.'],
    [18, 'Security is reliability too. STRIDE lists the threats. The key rule: authorize every action on the server, not just in the client.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    var a = K.p(t, 0.4);
    K.box(60, 84, 560, 180, { stroke: P.acc, a: a });
    K.text('SLO: 99.9% of page loads succeed', 84, 116, { size: 21, weight: 700, a: a });
    K.text('error budget: the other 0.1%', 84, 150, { size: 17, color: P.muted, a: K.p(t, 2.6) });
    var left = 1 - 0.85 * K.p(t, 6.8, 2.6), col = left > 0.5 ? P.green : left > 0.3 ? P.warm : P.red;
    K.box(84, 186, 512, 26, { fill: P.code, stroke: P.line, r: 6, a: K.p(t, 2.6) });
    K.box(86, 188, 508 * left, 22, { fill: col, r: 5, a: K.p(t, 2.6) * 0.8 });
    K.text('budget left: ' + Math.round(left * 100) + '%', 84, 238, { size: 17, color: col, a: K.p(t, 2.8) });
    K.text('budget burning fast?', 680, 110, { size: 19, weight: 700, color: P.muted, a: K.p(t, 7.2) });
    K.chip('slow down releases', 800, 168, { size: 18, stroke: P.warm, a: K.p(t, 8) });
    K.chip('fix reliability first', 1060, 168, { size: 18, stroke: P.green, a: K.p(t, 8.8) });
    var F = [['Detect', 'alerts, RUM', P.blue], ['Triage', 'scope, severity', P.purple], ['Mitigate', 'rollback, flag off', P.warm], ['Communicate', 'status, owners', P.blue], ['Review', 'blameless, actions', P.green]];
    F.forEach(function (f, i) {
      var x = 40 + i * 246, q = K.back((t - 11.3 - i * 0.6) / 0.5); if (q <= 0) return;
      g.save(); g.translate(x + 105, 334); g.scale(q, q); g.translate(-x - 105, -334);
      K.box(x, 296, 210, 76, { stroke: f[2], lw: i === 2 ? 3.5 : 2, a: K.clamp(q) });
      K.text(f[0], x + 105, 322, { size: 20, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(f[1], x + 105, 352, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      g.restore();
      if (i) K.arrow(x - 32, 334, x - 6, 334, { p: K.p(t, 11.2 + i * 0.6, 0.3), color: P.muted, lw: 2, head: 9 });
    });
    var T = [['S', 'Spoofing', 'auth, sessions'], ['T', 'Tampering', 'validate on server'], ['R', 'Repudiation', 'audit logs'],
             ['I', 'Disclosure', 'no tokens in logs'], ['D', 'Denial', 'rate limits'], ['E', 'Elevation', 'authorize on server']];
    T.forEach(function (s, i) {
      var x = 40 + i * 200, q = K.p(t, 18.4 + i * 0.4, 0.4), key = i === 5 && t > 21.5;
      K.box(x, 420, 188, 140, { stroke: key ? P.warm : P.line, lw: key ? 3 : 2, a: q });
      K.text(s[0], x + 20, 458, { size: 32, weight: 800, color: key ? P.warm : P.acc, a: q });
      K.text(s[1], x + 54, 460, { size: 17, weight: 700, a: q });
      K.text(s[2], x + 20, 516, { size: 16, color: P.muted, a: q });
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 38 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Field data first: which vital fails, LCP, INP or CLS?',
     'Reproduce throttled, prove the cause, fix the biggest, verify',
     'Flags with a stable hash; canary 1% → 10% → 50% → 100%',
     'Always rollback-ready; circuit breakers fail fast and recover',
     'SLOs and error budgets, blameless reviews, server-side authz'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(230, y, true, 0.9, q);
      K.text(s, 262 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 38 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
