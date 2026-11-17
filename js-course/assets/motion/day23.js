/* Day 23 in motion: Core Web Vitals (LCP, INP, CLS), field vs lab, profiling long tasks, yielding, debounce, throttle, virtualization and budgets.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day23', {
  kicker: 'JavaScript: Zero to Architect · Day 23',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 23: measure the real user experience, find the actual bottleneck, and apply the right pattern.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Performance', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 23 · Measure, then fix', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Core Web Vitals', 'Profiling', 'Debounce · throttle'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the three vitals */
{ d: 25, title: 'Core Web Vitals',
  caps: [
    [0.3, 'Core Web Vitals are three questions a visitor silently asks. Did the main thing show up fast? That is LCP.'],
    [6.5, 'When I tap, does the page react right away? That is INP. It replaced FID in March 2024.'],
    [12.5, 'Does the page stay still, instead of jumping around? That is CLS, cumulative layout shift.'],
    [18.5, 'Good means LCP up to 2.5 seconds, INP up to 200 milliseconds and CLS up to 0.1, at the 75th percentile.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var C = [['LCP', 'Largest Contentful Paint', 'loading', 0.6, P.acc], ['INP', 'Interaction to Next Paint', 'responsiveness', 6.8, P.blue], ['CLS', 'Cumulative Layout Shift', 'visual stability', 12.8, P.purple]];
    C.forEach(function (c, i) {
      var x = 40 + i * 410, a = K.p(t, c[3]);
      K.box(x, 80, 380, 360, { stroke: c[4], a: a });
      K.text(c[0], x + 24, 116, { size: 30, weight: 800, color: c[4], a: a });
      K.text(c[2], x + 356, 116, { size: 17, color: P.muted, align: 'right', a: a });
      K.text(c[1], x + 24, 152, { size: 17, color: P.muted, a: a });
      K.box(x + 90, 180, 200, 236, { fill: P.code, stroke: P.line, r: 18, a: a });
    });
    /* LCP: hero paints */
    var h = K.p(t, 2.2, 0.8);
    K.box(150, 200, 160, 20, { fill: P.line, r: 4, a: K.p(t, 1.2) });
    K.box(150, 232, 160, 100 * h, { fill: 'rgba(79,209,197,.35)', stroke: P.acc, r: 6, a: K.p(t, 2.2) });
    K.text('hero', 230, 282, { size: 18, align: 'center', a: K.p(t, 3) });
    K.box(150, 346, 120, 12, { fill: P.line, r: 4, a: K.p(t, 1.4) }); K.box(150, 368, 140, 12, { fill: P.line, r: 4, a: K.p(t, 1.6) });
    K.text('painted at 2.1 s', 230, 400, { size: 17, color: P.green, align: 'center', a: K.p(t, 3.6) });
    /* INP: tap → next paint */
    var tap = K.p(t, 8, 0.4);
    K.box(560, 230, 160, 50, { fill: t > 9.6 ? 'rgba(99,179,237,.35)' : P.card, stroke: P.blue, r: 10, a: K.p(t, 7.2) });
    K.text(t > 9.6 ? 'Added ✓' : 'Add to cart', 640, 255, { size: 17, weight: 700, align: 'center', a: K.p(t, 7.2) });
    g.save(); g.globalAlpha *= K.win(t, 8, 9.2); g.strokeStyle = P.warm; g.lineWidth = 3; g.beginPath(); g.arc(660, 262, 10 + 16 * tap, 0, 7); g.stroke(); g.restore();
    K.box(560, 320, 160 * K.p(t, 8.2, 1.2) * 0.55, 16, { fill: P.blue, r: 8, a: K.p(t, 8.2) });
    K.text('tap → paint: 90 ms', 640, 368, { size: 17, color: P.green, align: 'center', a: K.p(t, 9.8) });
    /* CLS: content shifts when a banner appears */
    var sh = K.p(t, 14.4, 0.5);
    K.box(970, 200, 160, 50 * sh, { fill: 'rgba(246,173,85,.35)', stroke: P.warm, r: 6, a: K.p(t, 14.4) });
    K.box(970, 210 + 54 * sh, 160, 24, { fill: P.line, r: 4, a: K.p(t, 13) });
    K.box(970, 246 + 54 * sh, 160, 44, { fill: 'rgba(183,148,244,.35)', stroke: P.purple, r: 6, a: K.p(t, 13) });
    K.text('Buy', 1050, 268 + 54 * sh, { size: 17, weight: 700, align: 'center', a: K.p(t, 13) });
    K.text('late banner pushes', 1050, 370, { size: 16, color: P.warm, align: 'center', a: K.p(t, 15) });
    K.text('content down', 1050, 392, { size: 16, color: P.warm, align: 'center', a: K.p(t, 15) });
    /* thresholds */
    [['≤ 2.5 s', 'LCP'], ['≤ 200 ms', 'INP'], ['≤ 0.1', 'CLS']].forEach(function (r, i) {
      var x = 40 + i * 410, q = K.p(t, 18.8 + i * 0.6);
      K.box(x, 470, 380, 22, { fill: P.code, r: 11, a: q });
      K.box(x, 470, 160, 22, { fill: P.green, r: 11, a: q * 0.85 });
      K.box(x + 164, 470, 110, 22, { fill: P.warm, r: 4, a: q * 0.85 });
      K.box(x + 278, 470, 102, 22, { fill: P.red, r: 11, a: q * 0.85 });
      K.text('good ' + r[0], x + 4, 520, { size: 19, weight: 700, color: P.green, a: q });
    });
    K.text('judged at the 75th percentile of real visits', 640, 566, { size: 19, color: P.muted, align: 'center', a: K.p(t, 21) });
  } },

/* 3 ─ field vs lab */
{ d: 22, title: 'Field data vs lab data',
  caps: [
    [0.3, 'Lab tools like Lighthouse and DevTools run one synthetic test. They are reproducible, and great for finding causes.'],
    [7, 'Field data comes from real users: the Chrome UX Report, and your own RUM, for example with the web-vitals library.'],
    [14, 'Three out of four visits must be good. Your fast laptop is not the median phone, so the field tells the truth.']],
  draw: function (K, t) {
    var P = K.P;
    var lab = K.p(t, 0.6);
    K.box(40, 84, 420, 220, { stroke: P.blue, a: lab });
    K.text('Lab: Lighthouse', 64, 114, { size: 21, weight: 700, color: P.blue, a: lab });
    K.text('one run, one device', 64, 150, { size: 18, color: P.muted, a: lab });
    var gd = K.p(t, 2, 1);
    K.g.save(); K.g.globalAlpha *= lab; K.g.strokeStyle = P.line; K.g.lineWidth = 12; K.g.beginPath(); K.g.arc(250, 260, 60, Math.PI, 0); K.g.stroke();
    K.g.strokeStyle = P.green; K.g.beginPath(); K.g.arc(250, 260, 60, Math.PI, Math.PI + Math.PI * 0.94 * gd); K.g.stroke(); K.g.restore();
    K.text(String(Math.round(94 * gd)), 250, 248, { size: 30, weight: 800, align: 'center', a: lab });
    K.text('LCP 1.8 s', 380, 248, { size: 18, color: P.green, align: 'center', a: K.p(t, 3) });
    var code = ['import { onLCP, onINP, onCLS } from "web-vitals";', 'onLCP(send); onINP(send); onCLS(send);'];
    K.panel(40, 340, 580, 130, 'rum.js', { a: K.p(t, 7.2) });
    K.code(code, 62, 386, { size: 17, n: K.typed(t, code, [7.6, 9.4], 36), t: t, a: K.p(t, 7.2) });
    /* field histogram */
    var f = K.p(t, 7.4);
    K.box(660, 84, 580, 386, { stroke: P.acc, a: f });
    K.text('Field: real users, LCP', 684, 114, { size: 21, weight: 700, color: P.acc, a: f });
    var H = [3, 8, 14, 18, 16, 12, 9, 7, 5, 4, 3, 2];
    H.forEach(function (v, i) {
      var q = K.p(t, 9 + i * 0.12, 0.5), x = 690 + i * 44, h = v * 13 * q, s = 0.5 + i * 0.5;
      K.box(x, 420 - h, 36, h, { fill: s <= 2.5 ? P.green : s <= 4 ? P.warm : P.red, r: 4, a: f * 0.8 });
    });
    K.text('0.5 s', 708, 444, { size: 15, color: P.muted, align: 'center', a: f });
    K.text('6 s', 1194, 444, { size: 15, color: P.muted, align: 'center', a: f });
    var p75 = K.p(t, 14.4);
    K.box(1000, 140, 4, 280, { fill: P.ink, r: 2, a: p75 });
    K.text('p75 = 3.1 s', 1012, 156, { size: 19, weight: 700, color: P.warm, a: p75 });
    K.text('needs improvement', 1012, 184, { size: 17, color: P.warm, a: K.p(t, 15.2) });
    K.chip('lab says 1.8 s, field says 3.1 s', 640, 530, { size: 21, stroke: P.warm, a: K.p(t, 17) });
  } },

/* 4 ─ profiling */
{ d: 24, title: 'Profiling long tasks',
  caps: [
    [0.3, 'To find the cause, record in the DevTools Performance panel with CPU throttling, because real phones are slower.'],
    [6.5, 'Look for long tasks: anything over 50 milliseconds on the main thread, marked with a red corner.'],
    [12.5, 'Zoom into the flame chart, then use Bottom-Up to find the functions with the most self time.'],
    [18.5, 'Fix the biggest contributor, ship it, and confirm the improvement in field data.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    K.panel(40, 80, 1200, 300, 'Performance · CPU: 4x slowdown', { a: K.p(t, 0.3) });
    K.text('Main', 64, 166, { size: 17, color: P.muted, a: K.p(t, 1) });
    var T = [[130, 40, 0], [190, 280, 1], [490, 30, 0], [540, 60, 0], [620, 360, 1], [1000, 50, 0], [1070, 40, 0]];
    T.forEach(function (b, i) {
      var q = K.p(t, 1.2 + i * 0.3, 0.4); if (q <= 0) return;
      K.box(b[0], 150, b[1] * q, 34, { fill: P.line, stroke: b[2] && t > 7 ? P.red : null, r: 3, a: q });
      if (b[2] && t > 7) { var a = K.p(t, 7, 0.4); g.save(); g.globalAlpha *= a; g.fillStyle = P.red; g.beginPath();
        g.moveTo(b[0] + b[1] - 16, 150); g.lineTo(b[0] + b[1], 150); g.lineTo(b[0] + b[1], 166); g.closePath(); g.fill(); g.restore(); }
    });
    K.text('Task 280 ms', 330, 136, { size: 16, color: P.red, align: 'center', a: K.p(t, 7.6) });
    K.text('Task 360 ms', 800, 136, { size: 16, color: P.red, align: 'center', a: K.p(t, 8) });
    K.text('> 50 ms = long task', 1160, 136, { size: 16, color: P.red, align: 'right', a: K.p(t, 8.6) });
    /* flame chart under the second long task */
    var F = [[620, 360, 0, 'click handler', P.warm], [620, 300, 1, 'filterProducts', P.warm], [630, 200, 2, 'sortBy', P.purple], [840, 70, 2, 'render', P.blue], [640, 170, 3, 'compare', P.purple]];
    F.forEach(function (f, i) {
      var q = K.p(t, 12.8 + i * 0.3, 0.4);
      K.box(f[0], 196 + f[2] * 40, f[1], 34, { fill: f[4], r: 3, a: q * 0.8 });
      K.text(f[3], f[0] + 8, 213 + f[2] * 40, { size: 16, weight: 700, color: P.bg, a: q });
    });
    var bu = K.p(t, 14.6);
    K.panel(40, 400, 640, 180, 'Bottom-Up', { a: bu });
    [['Self time', 'Function', P.muted], ['212 ms', 'compare', P.red], ['64 ms', 'filterProducts', P.ink], ['38 ms', 'render', P.ink]].forEach(function (r, i) {
      var q = i ? K.p(t, 15 + i * 0.5) : bu;
      K.text(r[0], 64, 450 + i * 34, { size: 18, mono: i > 0, color: r[2], a: q });
      K.text(r[1], 220, 450 + i * 34, { size: 18, mono: i > 0, color: i ? P.ink : P.muted, a: q });
    });
    ['measure in the field', 'reproduce in the lab', 'fix the biggest piece', 'confirm in the field'].forEach(function (s, i) {
      var q = K.p(t, 18.8 + i * 0.6), y = 420 + i * 44;
      K.text((i + 1) + '.', 730, y, { size: 21, weight: 700, color: P.acc, a: q });
      K.text(s, 760, y, { size: 21, a: q });
    });
  } },

/* 5 ─ yielding */
{ d: 22, title: 'Break up long tasks',
  caps: [
    [0.3, 'A long task blocks the main thread. A click that arrives during it has to wait, and the page feels frozen.'],
    [7.5, 'Split the work into chunks, and yield to the browser between them, for example with await scheduler.yield or a setTimeout.'],
    [15, 'Now the click runs between two chunks, and the interaction responds quickly.']],
  draw: function (K, t) {
    var P = K.P;
    function track(y, label, a) { K.text(label, 40, y + 20, { size: 18, color: P.muted, a: a }); K.box(200, y, 1040, 40, { fill: P.code, r: 6, a: a }); }
    var a1 = K.p(t, 0.4);
    track(110, 'before', a1);
    K.box(220, 110, 640 * K.p(t, 0.8, 1.6), 40, { fill: P.red, r: 6, a: a1 * 0.75 });
    K.text('one 400 ms task', 540, 130, { size: 17, weight: 700, color: P.bg, align: 'center', a: K.p(t, 2.2) });
    K.arrow(380, 70, 380, 104, { p: K.p(t, 3, 0.4), color: P.warm }); K.text('click', 380, 62, { size: 17, color: P.warm, align: 'center', a: K.p(t, 3) });
    K.box(864, 110, 50, 40, { fill: P.warm, r: 6, a: K.p(t, 4.4) });
    K.curve(380, 160, 620, 210, 880, 160, { p: K.p(t, 4.6, 0.8), color: P.red, dash: [6, 6], lw: 2 });
    K.text('INP 520 ms: waits for the task', 620, 220, { size: 18, color: P.red, align: 'center', a: K.p(t, 5.4) });
    var code = ['for (const item of items) {', '  process(item);', '  await scheduler.yield();', '}'];
    K.panel(40, 260, 520, 200, 'chunks.js', { a: K.p(t, 7.6) });
    K.code(code, 64, 306, { size: 21, n: K.typed(t, code, [7.9, 8.8, 9.6, 10.6], 30), t: t, a: K.p(t, 7.6), hi: t > 9.6 && t < 15 ? 2 : -1, w: 480 });
    K.text('fallback: await new Promise(r => setTimeout(r))', 300, 486, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 11.2) });
    var a2 = K.p(t, 11.6);
    K.text('after', 620, 300, { size: 18, color: P.muted, a: a2 });
    K.box(620, 320, 620, 40, { fill: P.code, r: 6, a: a2 });
    for (var i = 0; i < 6; i++) {
      var x = 630 + i * 102 + (i >= 2 && t > 15.6 ? 0 : 0);
      K.box(x, 320, 80 * K.p(t, 12 + i * 0.25, 0.3), 40, { fill: P.acc, r: 6, a: a2 * 0.75 });
    }
    K.arrow(822, 276, 822, 314, { p: K.p(t, 15.2, 0.4), color: P.warm }); K.text('click', 822, 266, { size: 17, color: P.warm, align: 'center', a: K.p(t, 15.2) });
    K.box(812, 368, 20, 40, { fill: P.warm, r: 4, a: K.p(t, 15.8) });
    K.text('input runs in the gap', 930, 420, { size: 18, color: P.green, align: 'center', a: K.p(t, 16.2) });
    K.chip('INP 60 ms', 930, 480, { size: 20, stroke: P.green, color: P.green, a: K.p(t, 16.8) });
  } },

/* 6 ─ debounce */
{ d: 25, title: 'Debounce',
  caps: [
    [0.3, 'Events like input, scroll and resize fire many times per second. Doing expensive work for each one wastes time.'],
    [6.5, 'Debounce waits for quiet. Every call resets a timer, and the function runs once, after the burst ends.'],
    [13.5, 'Use it for search as you type, or autosave. A delay of 150 to 300 milliseconds is typical.'],
    [19, 'Pair it with an AbortController, so a late response cannot overwrite a fresher one.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function debounce(fn, ms) {', '  let timer;', '  return (...args) => {', '    clearTimeout(timer);', '    timer = setTimeout(() => fn(...args), ms);', '  };', '}'];
    K.panel(40, 80, 620, 290, 'debounce.js', { a: K.p(t, 6.6) });
    K.code(code, 64, 122, { size: 19, lh: 1.5, n: K.typed(t, code, [6.9, 7.6, 8, 8.6, 9.2, 10.4, 10.6], 40), t: t, a: K.p(t, 6.6), w: 590, hi: t > 11 && t < 13.5 ? 3 : -1 });
    /* search box with keystrokes */
    var word = 'laptop', n = Math.max(0, Math.min(6, Math.floor((t - 1) * 2.2)));
    K.box(700, 84, 540, 60, { fill: P.code, stroke: P.line, a: K.p(t, 0.4) });
    K.text('search: ' + word.slice(0, n), 724, 114, { size: 22, mono: true, a: K.p(t, 0.4) });
    K.text('events', 700, 186, { size: 17, color: P.muted, a: K.p(t, 0.8) });
    K.box(790, 184, 450, 2, { fill: P.line, a: K.p(t, 0.8) });
    for (var i = 0; i < 6; i++) {
      var et = 1.45 + i * 0.455, q = K.back((t - et) / 0.3);
      if (q > 0) K.chip(word[i], 820 + i * 50, 186, { s: q, a: K.clamp(q), size: 16, mono: true, stroke: P.warm });
    }
    K.text('without', 700, 246, { size: 17, color: P.muted, a: K.p(t, 3.6) });
    for (var j = 0; j < 6; j++) K.box(805 + j * 50, 230, 30, 30, { fill: P.red, r: 6, a: K.p(t, 3.8 + j * 0.1) * 0.8 });
    K.text('6 requests', 1180, 246, { size: 17, color: P.red, align: 'right', a: K.p(t, 4.6) });
    K.text('debounced', 700, 306, { size: 17, color: P.muted, a: K.p(t, 11.2) });
    var tb = K.p(t, 11.4);
    K.box(1070, 290, 170 * K.clamp((t - 11.6) / 1.2) , 30, { fill: 'rgba(79,209,197,.25)', r: 6, a: tb });
    K.text('300 ms quiet', 1100, 340, { size: 15, color: P.acc, a: K.p(t, 12) });
    K.box(1210, 290, 30, 30, { fill: P.green, r: 6, a: K.p(t, 12.8) });
    K.text('1 request', 1180, 370, { size: 17, color: P.green, align: 'right', a: K.p(t, 13) });
    K.chip('search as you type', 240, 430, { size: 19, stroke: P.acc, a: K.p(t, 13.8) });
    K.chip('autosave', 470, 430, { size: 19, stroke: P.acc, a: K.p(t, 14.4) });
    K.chip('resize end', 640, 430, { size: 19, stroke: P.acc, a: K.p(t, 15) });
    var ab = K.p(t, 19.2);
    K.box(40, 480, 1200, 100, { fill: P.code, stroke: P.purple, a: ab });
    K.code(['controller?.abort();  controller = new AbortController();', 'fetch(url, { signal: controller.signal });   // stale request cancelled'], 64, 498, { size: 19, n: K.typed(t, ['controller?.abort();  controller = new AbortController();', 'fetch(url, { signal: controller.signal });   // stale request cancelled'], [19.4, 21], 44), t: t, a: ab });
  } },

/* 7 ─ throttle and rAF */
{ d: 21, title: 'Throttle and rAF',
  caps: [
    [0.3, 'Throttle limits the rate instead. The function runs at most once per interval, even during a long burst.'],
    [7, 'Use it for scroll position, mouse moves or rate-limited analytics. Debounce would wait until the burst is over.'],
    [13.5, 'For visual updates, prefer requestAnimationFrame: it runs once per frame, right before the browser paints.']],
  draw: function (K, t) {
    var P = K.P;
    function row(y, label, col, xs, st, a) {
      K.text(label, 40, y, { size: 19, weight: 700, color: col, a: a });
      K.box(250, y, 990, 2, { fill: P.line, a: a });
      xs.forEach(function (x, i) { var q = K.back((t - st - i * 0.06) / 0.3); if (q > 0) { K.g.save(); K.g.globalAlpha *= K.clamp(q) * a; K.g.fillStyle = col; K.g.beginPath(); K.g.arc(x, y, 9 * q, 0, 7); K.g.fill(); K.g.restore(); } });
    }
    var ev = []; for (var i = 0; i < 30; i++) ev.push(270 + i * 30);
    row(120, 'scroll events', P.warm, ev, 0.6, K.p(t, 0.4));
    var th = []; for (var k = 0; k < 6; k++) th.push(270 + k * 180);
    row(210, 'throttle 200 ms', P.acc, th, 2.6, K.p(t, 2.4));
    for (var m = 0; m < 6; m++) K.box(270 + m * 180, 236, Math.min(170, 1240 - 270 - m * 180), 6, { fill: 'rgba(79,209,197,.3)', r: 3, a: K.p(t, 3.2) });
    K.text('at most once per interval', 740, 270, { size: 17, color: P.acc, align: 'center', a: K.p(t, 3.8) });
    row(330, 'debounce', P.purple, [1180], 7.6, K.p(t, 7.4));
    K.text('only after the burst', 1000, 360, { size: 17, color: P.purple, align: 'center', a: K.p(t, 8.2) });
    ['scroll position', 'mouse move', 'analytics'].forEach(function (s, i) { K.chip(s, 300 + i * 200, 420, { size: 18, stroke: P.acc, a: K.p(t, 9 + i * 0.5) }); });
    var r = K.p(t, 13.8);
    K.box(40, 470, 1200, 110, { fill: P.code, stroke: P.green, a: r });
    var code = ['addEventListener("scroll", () => {', '  requestAnimationFrame(updateHeader);   // once per frame, before paint', '});'];
    K.code(code, 64, 484, { size: 19, lh: 1.45, n: K.typed(t, code, [14, 15.2, 16.8], 44), t: t, a: r });
  } },

/* 8 ─ virtualization */
{ d: 25, title: 'Virtualization',
  caps: [
    [0.3, 'A table with 100,000 rows means 100,000 sets of DOM nodes to lay out and keep in memory.'],
    [6.5, 'Virtualization renders only the rows in the viewport, plus a few extra rows called overscan.'],
    [12.5, 'A spacer keeps the full scroll height, and rows are swapped as you scroll. The DOM stays the same size.'],
    [19, 'The trade-offs: add ARIA row counts for accessibility, and remember that find in page cannot see unrendered rows.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var a0 = K.p(t, 0.4), sc = K.clamp((t - 13) / 4) * 1200;
    K.text('data: 100,000 rows', 230, 100, { size: 19, weight: 700, color: P.muted, align: 'center', a: a0 });
    g.save(); g.beginPath(); g.rect(80, 120, 300, 440); g.clip();
    for (var i = 0; i < 18; i++) {
      var y = 124 + i * 26, idx = Math.floor(sc / 26) + i;
      K.box(90, y, 280, 20, { fill: P.card, r: 4, a: a0 });
      K.text('row ' + (idx + 1).toLocaleString('en-US'), 104, y + 10, { size: 15, mono: true, color: P.muted, a: a0 });
    }
    g.restore();
    var vp = K.p(t, 6.8);
    K.box(76, 228, 308, 140, { fill: false, stroke: P.acc, lw: 3, a: vp });
    K.text('viewport', 396, 298, { size: 17, color: P.acc, a: vp });
    K.box(76, 202, 308, 26, { fill: 'rgba(79,209,197,.12)', r: 4, a: K.p(t, 9.4) });
    K.box(76, 368, 308, 26, { fill: 'rgba(79,209,197,.12)', r: 4, a: K.p(t, 9.4) });
    K.text('overscan', 396, 380, { size: 16, color: P.muted, a: K.p(t, 9.6) });
    /* DOM count */
    var before = K.p(t, 1.4) * (1 - K.p(t, 7.4)), after = K.p(t, 7.8);
    K.box(640, 90, 600, 120, { stroke: before > 0.5 ? P.red : P.green, a: Math.max(before, after) });
    K.text('rows in the DOM', 664, 120, { size: 18, color: P.muted, a: Math.max(before, after) });
    K.text('100,000', 664, 170, { size: 40, weight: 800, color: P.red, a: before });
    K.text('≈ 30', 664, 170, { size: 40, weight: 800, color: P.green, a: after });
    K.text('slow layout, huge memory', 1210, 170, { size: 18, color: P.red, align: 'right', a: before });
    K.text('constant, whatever the data size', 1210, 170, { size: 18, color: P.green, align: 'right', a: after });
    var sp = K.p(t, 12.8);
    K.panel(640, 240, 600, 200, 'DOM', { a: sp });
    K.code(['<div style="height: 4000000px">', '  <div style="transform: translateY(' + Math.floor(sc / 26) * 40 + 'px)">', '    … 30 rows …'], 664, 282, { size: 18, a: sp });
    K.text('spacer height = total × row height', 940, 412, { size: 16, color: P.muted, align: 'center', a: K.p(t, 13.6) });
    ['aria-rowcount for screen readers', 'Ctrl+F cannot find hidden rows'].forEach(function (s, i) {
      K.chip(s, 940, 490 + i * 54, { size: 18, stroke: P.warm, a: K.p(t, 19.4 + i * 0.8) });
    });
  } },

/* 9 ─ more patterns and budgets */
{ d: 24, title: 'More patterns, and budgets',
  caps: [
    [0.3, 'Native features are often enough: lazy loading images, content-visibility auto, and responsive images with srcset.'],
    [7, 'Move heavy CPU work to a Web Worker, and schedule low-priority work with requestIdleCallback.'],
    [13, 'Set performance budgets for JavaScript size, LCP and INP, and enforce them in CI, for example with Lighthouse CI.'],
    [19, 'And always measure first. Optimize the bottleneck you found, not the one you guessed.']],
  draw: function (K, t) {
    var P = K.P;
    var html = ['<img src="hero.avif" loading="lazy"', '     srcset="hero-800.avif 800w, …">', '.feed-item { content-visibility: auto; }'];
    K.panel(40, 80, 680, 170, 'native', { a: K.p(t, 0.4) });
    K.code(html, 64, 124, { size: 19, lh: 1.5, n: K.typed(t, html, [0.8, 2.4, 4], 40), t: t, a: K.p(t, 0.4) });
    var w = K.p(t, 7.2);
    K.box(760, 80, 480, 170, { stroke: P.purple, a: w });
    K.text('main thread', 784, 112, { size: 17, color: P.muted, a: w });
    K.text('worker thread', 784, 196, { size: 17, color: P.muted, a: w });
    K.box(920, 98, 300 * K.p(t, 7.6, 0.8), 28, { fill: P.acc, r: 5, a: w * 0.7 });
    K.box(920, 182, 300 * K.p(t, 8.4, 1.2), 28, { fill: P.purple, r: 5, a: w * 0.7 });
    K.text('UI stays free', 1070, 146, { size: 16, color: P.green, align: 'center', a: K.p(t, 9.4) });
    K.chip('requestIdleCallback(lowPriorityWork)', 1000, 290, { size: 17, mono: true, stroke: P.blue, a: K.p(t, 10.6) });
    var b = K.p(t, 13.2);
    K.box(40, 330, 680, 240, { stroke: P.warm, a: b });
    K.text('Performance budget · checked in CI', 64, 360, { size: 20, weight: 700, color: P.warm, a: b });
    [['JS (gzip)', '170 KB', '162 KB', true], ['LCP', '2.5 s', '2.2 s', true], ['INP', '200 ms', '240 ms', false]].forEach(function (r, i) {
      var q = K.p(t, 14 + i * 0.7), y = 410 + i * 50;
      K.text(r[0], 64, y, { size: 20, a: q });
      K.text('budget ' + r[1], 260, y, { size: 19, mono: true, color: P.muted, a: q });
      K.text(r[2], 560, y, { size: 19, mono: true, color: r[3] ? P.green : P.red, a: q });
      K.mark(670, y, r[3], 0.75, q);
    });
    var m = K.p(t, 19.2);
    K.chip('measure', 860, 440, { size: 22, stroke: P.acc, a: m });
    K.arrow(918, 440, 980, 440, { p: m, color: P.muted });
    K.chip('fix', 1020, 440, { size: 22, stroke: P.acc, a: K.p(t, 19.6) });
    K.arrow(1052, 440, 1110, 440, { p: K.p(t, 19.6), color: P.muted });
    K.chip('verify', 1160, 440, { size: 22, stroke: P.acc, a: K.p(t, 20) });
    K.text('the bottleneck you found, not the one you guessed', 1010, 510, { size: 17, color: P.muted, align: 'center', a: K.p(t, 20.6) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 23 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, at the 75th percentile',
     'Field data tells the truth; lab tools find the cause',
     'Profile with CPU throttling; break up long tasks and yield',
     'Debounce waits for quiet; throttle limits the rate; rAF for visuals',
     'Virtualize long lists; set budgets; measure before you optimize'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(200, y, true, 0.9, q);
      K.text(s, 232 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 23 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
