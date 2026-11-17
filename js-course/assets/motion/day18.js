/* Day 18 in motion: the rendering pipeline, render-blocking CSS and script loading modes, the cost ladder
   (layout, paint, composite), forced layout and thrashing, requestAnimationFrame, and Web Vitals. Loaded on demand by assets/js/motion.js. */
(function () {
  /* a node box centred at (x, y) */
  function nd(K, s, x, y, o) {
    o = o || {}; var w = o.w || 100, h = o.h || 40;
    K.box(x - w / 2, y - h / 2, w, h, { stroke: o.stroke || K.P.acc, dash: o.dash, fill: o.fill, a: o.a, lw: o.lw });
    K.text(s, x, y + 1, { size: o.size || 19, mono: !!o.mono, weight: o.weight || 600, align: 'center', color: o.color || K.P.ink, a: o.a });
  }
  /* a timeline bar from x0 to x1 that grows in from time t0 over dur seconds */
  function bar(K, x0, x1, y, h, c, t, t0, dur, label) {
    var q = K.clamp((t - t0) / dur); if (q <= 0) return;
    K.box(x0, y, Math.max(2, (x1 - x0) * q), h, { fill: c[0], stroke: c[1], r: 5 });
    if (label && q > 0.6) K.text(label, x0 + (x1 - x0) / 2, y + h / 2 + 1, { size: 16, align: 'center', a: K.clamp((q - 0.6) / 0.4) });
  }

JSC.motion.define('day18', {
  kicker: 'JavaScript: Zero to Architect · Day 18',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 18: how the browser turns bytes into pixels, and what makes a page slow.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Rendering', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 18 · From bytes to pixels', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['The pipeline', 'Script loading', 'Reflow and thrashing'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the pipeline */
{ d: 26, title: 'The rendering pipeline',
  caps: [
    [0.3, 'HTML is parsed into the DOM. Meanwhile a preload scanner looks ahead and starts downloads early.'],
    [6.5, 'CSS is parsed into the CSSOM. Style calculation combines both: every element gets its final computed values.'],
    [12.5, 'Layout computes the size and position of every box. Paint records drawing instructions; raster turns them into pixels.'],
    [19, 'Composite stacks the layers on the GPU, applying transforms, opacity and scrolling.']],
  draw: function (K, t) {
    var P = K.P;
    nd(K, 'HTML', 100, 130, { w: 110, h: 56, a: K.p(t, 0.4), stroke: P.blue });
    nd(K, 'DOM', 250, 130, { w: 110, h: 56, a: K.p(t, 1.4) });
    K.arrow(158, 130, 192, 130, { p: K.p(t, 1, 0.4) });
    nd(K, 'CSS', 100, 240, { w: 110, h: 56, a: K.p(t, 6.6), stroke: P.blue });
    nd(K, 'CSSOM', 250, 240, { w: 110, h: 56, a: K.p(t, 7.4) });
    K.arrow(158, 240, 192, 240, { p: K.p(t, 7, 0.4) });
    var S = [['Style', 420, 8.6, P.acc], ['Layout', 610, 12.7, P.purple], ['Paint', 800, 15.4, P.green], ['Composite', 1060, 19.2, P.warm]];
    S.forEach(function (s, i) {
      var q = K.back((t - s[2]) / 0.5); if (q <= 0) return;
      K.g.save(); K.g.translate(s[1], 185); K.g.scale(q, q); nd(K, s[0], 0, 0, { w: i === 3 ? 170 : 140, h: 64, stroke: s[3], size: 21, a: K.clamp(q) }); K.g.restore();
    });
    K.arrow(306, 140, 346, 178, { p: K.p(t, 8.4, 0.4) }); K.arrow(306, 230, 346, 194, { p: K.p(t, 8.4, 0.4) });
    K.arrow(492, 185, 536, 185, { p: K.p(t, 12.5, 0.4) }); K.arrow(682, 185, 726, 185, { p: K.p(t, 15.2, 0.4) });
    K.arrow(872, 185, 970, 185, { p: K.p(t, 19, 0.4) });
    /* preload scanner */
    var ps = K.p(t, 3);
    K.text('preload scanner', 60, 318, { size: 17, color: P.blue, a: ps });
    ['style.css', 'app.js', 'hero.jpg'].forEach(function (f, i) {
      var y = 356 + i * 46;
      K.text(f, 60, y, { size: 16, mono: true, a: K.p(t, 3.4 + i * 0.4) });
      bar(K, 160, 300, y - 10, 20, ['rgba(99,179,237,.3)', P.blue], t, 3.6 + i * 0.4, 1.6);
    });
    /* stage outputs */
    var st = K.p(t, 9.4);
    K.box(350, 300, 170, 190, { fill: P.code, stroke: P.line, a: st });
    K.text('h1 → 32px bold', 364, 336, { size: 16, mono: true, a: st });
    K.text('p → 16px grey', 364, 372, { size: 16, mono: true, a: K.p(t, 10) });
    K.text('.ad → none', 364, 408, { size: 16, mono: true, color: P.muted, a: K.p(t, 10.6) });
    var ly = K.p(t, 13.4);
    K.box(540, 300, 170, 190, { fill: P.code, stroke: P.line, a: ly });
    K.box(556, 316, 138, 34, { fill: false, stroke: P.purple, dash: [5, 4], a: ly, r: 3 });
    K.box(556, 360, 138, 70, { fill: false, stroke: P.purple, dash: [5, 4], a: K.p(t, 13.8), r: 3 });
    K.text('x 0  y 64  w 960', 556, 456, { size: 16, mono: true, color: P.purple, a: K.p(t, 14.2) });
    var pa = K.p(t, 16);
    K.box(730, 300, 170, 190, { fill: P.code, stroke: P.line, a: pa });
    K.box(746, 316, 138, 34, { fill: 'rgba(104,211,145,.5)', a: pa, r: 3 });
    K.box(746, 360, 138, 70, { fill: 'rgba(99,179,237,.45)', a: K.p(t, 16.4), r: 3 });
    K.text('pixels', 815, 462, { size: 16, color: P.green, align: 'center', a: K.p(t, 17) });
    var co = K.p(t, 19.8);
    K.box(960, 300, 200, 190, { fill: P.code, stroke: P.line, a: co });
    [0, 1, 2].forEach(function (i) {
      var q = K.p(t, 20 + i * 0.4);
      K.box(990 + i * 26 + (1 - q) * 30, 318 + i * 30, 110, 70, { fill: ['rgba(79,209,197,.35)', 'rgba(246,173,85,.35)', 'rgba(183,148,244,.4)'][i], stroke: [P.acc, P.warm, P.purple][i], a: q, r: 6 });
    });
    K.text('layers', 1060, 476, { size: 16, color: P.warm, align: 'center', a: K.p(t, 21) });
    /* threads */
    var th = K.p(t, 21.6);
    K.box(350, 520, 550, 6, { fill: P.acc, r: 3, a: th });
    K.text('main thread: parse, JS, style, layout, paint', 625, 552, { size: 17, color: P.acc, align: 'center', a: th });
    K.box(960, 520, 200, 6, { fill: P.warm, r: 3, a: K.p(t, 22.2) });
    K.text('compositor + GPU', 1060, 552, { size: 17, color: P.warm, align: 'center', a: K.p(t, 22.2) });
  } },

/* 3 ─ blocking: CSS and scripts */
{ d: 29, title: 'What blocks rendering',
  caps: [
    [0.3, 'CSS is render-blocking: the browser will not paint until it has the CSS for what it would show.'],
    [6.5, 'A classic script blocks the parser. It must download and run before parsing continues.'],
    [12, 'defer downloads in parallel and runs after parsing, in order. Module scripts are deferred by default.'],
    [18, 'async also downloads in parallel, but runs the moment it arrives, in any order, pausing the parser.'],
    [23.5, 'So: defer your scripts, keep CSS small and early, and preload the image that matters most for LCP.']],
  draw: function (K, t) {
    var P = K.P, PARSE = ['rgba(104,211,145,.28)', P.green], FETCH = ['rgba(99,179,237,.28)', P.blue], RUN = ['rgba(246,173,85,.35)', P.warm];
    /* legend */
    [['parse HTML', PARSE], ['download', FETCH], ['run script', RUN]].forEach(function (l, i) {
      var a = K.p(t, 0.4 + i * 0.3);
      K.box(840 + i * 140, 90, 22, 18, { fill: l[1][0], stroke: l[1][1], r: 4, a: a });
      K.text(l[0], 870 + i * 140, 100, { size: 16, color: P.muted, a: a });
    });
    /* CSS row */
    K.text('style.css', 40, 156, { size: 18, mono: true, color: P.blue, a: K.p(t, 0.4) });
    bar(K, 230, 620, 144, 26, FETCH, t, 0.8, 2.4, 'downloading CSS');
    K.arrow(640, 120, 640, 186, { p: K.p(t, 3.4, 0.4), color: P.green, head: 0.1, lw: 3 });
    K.text('first paint', 652, 128, { size: 16, color: P.green, a: K.p(t, 3.4) });
    K.text('blank screen until here', 230, 196, { size: 16, color: P.muted, a: K.p(t, 3.8) });
    /* script rows */
    var R = [
      ['<script>', 6.6, [[230, 420, PARSE], [420, 600, FETCH], [600, 690, RUN], [690, 1080, PARSE]]],
      ['defer', 12.2, [[230, 1000, PARSE], [420, 600, FETCH, 1], [1000, 1090, RUN]]],
      ['type="module"', 14.6, [[230, 1000, PARSE], [420, 600, FETCH, 1], [1000, 1090, RUN]]],
      ['async', 18.2, [[230, 600, PARSE], [420, 600, FETCH, 1], [600, 690, RUN], [690, 1080, PARSE]]]];
    R.forEach(function (r, i) {
      var y = 260 + i * 78, a = K.p(t, r[1]);
      K.text(r[0], 40, y + 14, { size: 18, mono: true, color: i === 0 ? P.red : P.ink, a: a });
      var span = 2.8;
      r[2].forEach(function (b) {
        var s0 = r[1] + 0.3 + (b[0] - 230) / 860 * span;
        bar(K, b[0], b[1], b[3] ? y + 34 : y, b[3] ? 18 : 28, b[2], t, s0, (b[1] - b[0]) / 860 * span);
      });
    });
    K.text('parser paused', 510, 302, { size: 16, color: P.red, align: 'center', a: K.p(t, 9.6) });
    K.text('runs after parsing', 985, 398, { size: 15, color: P.green, align: 'center', a: K.p(t, 15.4) });
    K.text('paused', 645, 536, { size: 16, color: P.red, align: 'center', a: K.p(t, 20.6) });
    /* advice */
    var adv = K.p(t, 23.8);
    K.box(1104, 236, 140, 274, { fill: P.card, stroke: P.green, a: adv });
    ['defer', 'small CSS', 'preload', 'LCP image'].forEach(function (s, i) {
      K.text(s, 1174, 276 + i * 62, { size: 18, weight: 600, color: P.green, align: 'center', a: K.p(t, 24 + i * 0.4) });
    });
  } },

/* 4 ─ the cost ladder */
{ d: 27, title: 'Layout, paint, composite',
  caps: [
    [0.3, 'A change restarts the pipeline at different points. Geometry changes, like width, margin or adding nodes, need layout, paint and composite.'],
    [7.5, 'Colour, background or box-shadow changes skip layout: paint and composite only.'],
    [13, 'transform and opacity, on their own layer, skip both: composite only. The cheapest.'],
    [18.5, 'Compositing runs off the main thread, so transform animations stay smooth even while JavaScript is busy.']],
  draw: function (K, t) {
    var P = K.P, ST = ['Style', 'Layout', 'Paint', 'Composite'];
    var R = [['width · margin · top · add node', 0.6, 0, P.red], ['color · background · box-shadow', 7.7, 2, P.warm], ['transform · opacity', 13.2, 3, P.green]];
    R.forEach(function (r, i) {
      var y = 120 + i * 92, a = K.p(t, r[1]);
      K.text(r[0], 40, y, { size: 19, mono: true, color: r[3], a: a });
      ST.forEach(function (s, k) {
        var on = r[2] === 0 || (r[2] === 2 ? k !== 1 : k === 3);
        var q = K.p(t, r[1] + 0.5 + k * 0.35, 0.4), x = 470 + k * 190;
        nd(K, s, x, y, { w: 170, h: 48, size: 19, a: q * (on ? 1 : 0.28), stroke: on ? r[3] : P.line, color: on ? P.ink : P.muted });
        if (k) K.arrow(x - 104, y, x - 88, y, { a: q * (on ? 1 : 0.3), head: 8, lw: 2 });
      });
    });
    K.text('most work', 1240, 148, { size: 16, color: P.red, align: 'right', a: K.p(t, 3) });
    K.text('cheapest', 1240, 332, { size: 16, color: P.green, align: 'right', a: K.p(t, 15.4) });
    /* main thread vs compositor */
    var mt = K.p(t, 18.7), an = K.p(t, 19.2), busy = K.clamp((t - 20.4) / 1);
    [['main thread', 412, P.acc, mt], ['left animation', 478, P.red, an], ['transform animation', 544, P.green, an]].forEach(function (l) {
      K.text(l[0], 40, l[1], { size: 18, color: l[2], a: l[3] });
      K.box(260, l[1] - 20, 980, 40, { fill: P.code, stroke: P.line, a: l[3], r: 6 });
    });
    K.box(262, 394, 976 * busy, 36, { fill: 'rgba(252,129,129,.3)', stroke: P.red, r: 5, a: mt });
    K.text('long JavaScript task: main thread busy', 750, 413, { size: 16, align: 'center', color: P.red, a: K.p(t, 21) });
    var lu = t < 19.2 ? 0 : Math.min(1.2, t - 19.2) * 0.22, tu = t < 19.2 ? 0 : ((t - 19.2) * 0.22) % 1;
    K.box(270 + lu * 920, 464, 40, 28, { fill: 'rgba(252,129,129,.4)', stroke: P.red, r: 6, a: an });
    K.text('frozen', 340 + lu * 920, 478, { size: 16, color: P.red, a: K.p(t, 22) });
    K.box(270 + tu * 920, 530, 40, 28, { fill: 'rgba(104,211,145,.5)', stroke: P.green, r: 6, a: an });
  } },

/* 5 ─ forced layout and thrashing */
{ d: 28, title: 'Layout thrashing',
  caps: [
    [0.3, 'The browser is lazy about layout. A style write only marks layout dirty; it is computed once, before the next frame.'],
    [7, 'But reading a layout value like offsetWidth right after a write forces layout immediately: a forced synchronous layout.'],
    [13.5, 'Do that in a loop, write, read, write, read, and you get one layout per item. That is layout thrashing.'],
    [20, 'The fix: read everything first, then write everything. One layout instead of hundreds.']],
  draw: function (K, t) {
    var P = K.P;
    function blk(s, x, y, c, a) { K.box(x, y - 18, 44, 36, { fill: c === P.red ? 'rgba(252,129,129,.25)' : c === P.green ? 'rgba(104,211,145,.25)' : P.card, stroke: c, a: a, r: 6 }); K.text(s, x + 22, y + 1, { size: 18, weight: 700, mono: true, align: 'center', color: c, a: a }); }
    var rows = [['write only', 0.5], ['write, then read', 7.2], ['loop: thrashing', 13.7], ['reads, then writes', 20.2]];
    rows.forEach(function (r, i) { K.text(r[0], 40, 112 + i * 84, { size: 19, color: i === 2 ? P.red : i === 3 ? P.green : P.ink, a: K.p(t, r[1]) }); });
    /* legend */
    [['W', 'style write', P.blue], ['R', 'layout read', P.purple], ['L', 'layout', P.red]].forEach(function (l, i) {
      blk(l[0], 820 + i * 150, 60 + 12, l[2], K.p(t, 0.4)); K.text(l[1], 870 + i * 150, 73, { size: 16, color: P.muted, a: K.p(t, 0.4) });
    });
    /* row 1 */
    blk('W', 280, 112, P.blue, K.p(t, 1));
    K.chip('layout dirty', 420, 112, { size: 16, stroke: P.warm, color: P.warm, a: K.p(t, 1.8) });
    K.box(1080, 90, 3, 44, { fill: P.muted, r: 1, a: K.p(t, 3) }); K.text('next frame', 1090, 112, { size: 16, color: P.muted, a: K.p(t, 3) });
    blk('L', 1010, 112, P.green, K.p(t, 3.6));
    /* row 2 */
    blk('W', 280, 196, P.blue, K.p(t, 7.8)); blk('R', 336, 196, P.purple, K.p(t, 9));
    blk('L', 392, 196, P.red, K.p(t, 9.6));
    K.text('forced now, synchronously', 452, 196, { size: 17, color: P.red, a: K.p(t, 10.2) });
    /* row 3 */
    for (var i = 0; i < 6; i++) {
      var x = 280 + i * 140, s = 14 + i * 0.7;
      blk('W', x, 280, P.blue, K.p(t, s, 0.3)); blk('R', x + 46, 280, P.purple, K.p(t, s + 0.2, 0.3)); blk('L', x + 92, 280, P.red, K.p(t, s + 0.4, 0.3));
    }
    K.text('1 layout per item', 1240, 318, { size: 16, color: P.red, align: 'right', a: K.p(t, 18) });
    /* row 4 */
    for (var j = 0; j < 6; j++) blk('R', 280 + j * 50, 364, P.purple, K.p(t, 20.4 + j * 0.15, 0.3));
    for (var k = 0; k < 6; k++) blk('W', 600 + k * 50, 364, P.blue, K.p(t, 21.6 + k * 0.15, 0.3));
    blk('L', 1010, 364, P.green, K.p(t, 23));
    K.text('1 layout total', 1240, 402, { size: 16, color: P.green, align: 'right', a: K.p(t, 23.4) });
    /* code */
    var bad = ['for (const el of items) {', '  el.style.width = el.parentNode.offsetWidth / 2 + "px";   // write + read', '}'];
    var good = ['const widths = items.map((el) => el.parentNode.offsetWidth);         // all reads', 'items.forEach((el, i) => { el.style.width = widths[i] / 2 + "px"; });  // all writes'];
    var bw = K.win(t, 14.2, 20), gw = K.p(t, 20.2);
    K.panel(40, 444, 1200, 140, '', { a: Math.max(bw, gw), stroke: gw > 0.5 ? P.green : P.red });
    K.code(bad, 64, 466, { size: 19, lh: 1.55, n: K.typed(t, bad, [14.3, 15, 16.8], 50), t: t, a: bw });
    K.code(good, 64, 480, { size: 19, lh: 1.7, n: K.typed(t, good, [20.4, 21.8], 50), t: t, a: gw });
  } },

/* 6 ─ what forces layout, and requestAnimationFrame */
{ d: 24, title: 'Reads, writes and frames',
  caps: [
    [0.3, 'Reads that force layout include offsetWidth, clientHeight, scrollTop, getBoundingClientRect and getComputedStyle.'],
    [7.5, "Schedule visual writes with requestAnimationFrame. The callback runs just before the next frame's style and layout."],
    [14, 'In one frame: a task, then its microtasks, then animation frame callbacks, then style, layout, paint and composite.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('these reads can force layout', 40, 100, { size: 19, color: P.red, a: K.p(t, 0.4) });
    ['offsetWidth / offsetHeight', 'clientWidth / clientHeight', 'scrollTop / scrollHeight', 'getBoundingClientRect()', 'getComputedStyle(el)', 'innerText · focus()'].forEach(function (s, i) {
      var q = K.back((t - 0.8 - i * 0.45) / 0.5); if (q <= 0) return;
      K.chip(s, 190 + (i % 2) * 330, 156 + Math.floor(i / 2) * 64, { mono: true, size: 18, stroke: P.red, s: q, a: K.clamp(q) });
    });
    var code = ['const x = readPosition();          // read first', 'requestAnimationFrame(() => {', '  box.style.transform = "translateX(" + x + "px)";', '});'];
    var cp = K.p(t, 7.6);
    K.panel(40, 330, 680, 176, 'move.js', { a: cp });
    K.code(code, 64, 372, { size: 19, lh: 1.5, n: K.typed(t, code, [7.8, 9.2, 10.2, 11.6], 46), t: t, a: cp });
    /* frame strip */
    var fr = K.p(t, 14.2);
    K.text('one frame ≈ 16.7 ms at 60 Hz', 760, 500, { size: 17, color: P.muted, a: fr });
    var F = [['task', 120, P.blue], ['microtasks', 70, P.purple], ['rAF', 50, P.acc], ['style', 50, P.acc], ['layout', 60, P.purple], ['paint', 50, P.green], ['comp.', 50, P.warm]];
    var x = 760;
    F.forEach(function (f, i) {
      var q = K.p(t, 14.4 + i * 0.55, 0.4), lw = f[1];
      K.box(x, 352, lw - 4, 48, { fill: P.card, stroke: f[2], a: q, r: 6 });
      K.text(f[0], x + (lw - 4) / 2, 426 + (i % 2) * 26, { size: 16, color: f[2], align: 'center', a: q });
      x += lw;
    });
    K.arrow(973, 296, 973, 346, { p: K.p(t, 15.6, 0.4), color: P.acc, head: 10, lw: 2 });
    K.text('your rAF callback runs here', 973, 280, { size: 16, color: P.acc, align: 'center', a: K.p(t, 15.6) });
    K.chip('write in rAF → one layout per frame', 380, 552, { size: 18, stroke: P.acc, color: P.acc, a: K.p(t, 12.4) });
  } },

/* 7 ─ what users feel */
{ d: 25, title: 'What users feel',
  caps: [
    [0.3, 'Users feel four numbers: FCP, first content; LCP, largest content; INP, how fast clicks respond; CLS, how much the layout jumps.'],
    [7.5, 'Images without width and height cause layout shifts: the text jumps when the image arrives. Reserve the space.'],
    [14, 'will-change: transform promotes an element to its own layer. Use it sparingly: every layer costs memory.'],
    [19, 'content-visibility: auto skips rendering work for content that is off-screen until it is needed.']],
  draw: function (K, t) {
    var P = K.P;
    [['FCP', 'first content painted', P.acc], ['LCP', 'largest content painted', P.green], ['INP', 'input → next paint', P.warm], ['CLS', 'layout shift score', P.purple]].forEach(function (m, i) {
      var q = K.back((t - 0.6 - i * 1.4) / 0.5); if (q <= 0) return;
      var x = 40 + i * 305;
      K.box(x, 84, 285, 104, { stroke: m[2], a: K.clamp(q) });
      K.text(m[0], x + 20, 118, { size: 28, weight: 800, color: m[2], a: K.clamp(q) });
      K.text(m[1], x + 20, 160, { size: 18, color: P.muted, a: K.clamp(q) });
    });
    /* shift demo */
    var d = K.p(t, 7.7), img = K.p(t, 9.6, 0.5);
    K.box(40, 212, 580, 232, { fill: P.code, stroke: P.red, a: d });
    K.text('<img src="hero.jpg">', 60, 238, { size: 17, mono: true, color: P.red, a: d });
    K.box(60, 262, 540, 90 * img, { fill: 'rgba(99,179,237,.3)', stroke: P.blue, a: d * img, r: 6 });
    [0, 1, 2].forEach(function (k) { K.box(60, 270 + k * 26 + img * 96, 540 - k * 120, 12, { fill: P.line, r: 6, a: d }); });
    K.mark(590, 238, false, 0.7, K.p(t, 10.4));
    K.text('text jumps', 520, 240, { size: 16, color: P.red, align: 'right', a: K.p(t, 10.4) });
    K.box(660, 212, 580, 232, { fill: P.code, stroke: P.green, a: K.p(t, 11) });
    K.text('<img src="hero.jpg" width="1200" height="600">', 680, 238, { size: 16, mono: true, color: P.green, a: K.p(t, 11) });
    K.box(680, 262, 540, 90, { fill: img > 0 && t > 11.6 ? 'rgba(99,179,237,.3)' : 'rgba(0,0,0,0)', stroke: P.blue, dash: t > 12.4 ? null : [6, 5], a: K.p(t, 11), r: 6 });
    [0, 1, 2].forEach(function (k) { K.box(680, 366 + k * 26, 540 - k * 120, 12, { fill: P.line, r: 6, a: K.p(t, 11) }); });
    K.mark(1210, 238, true, 0.7, K.p(t, 12.4));
    /* css */
    var css = ['.drawer { will-change: transform; }   /* own layer: use sparingly */', '.feed > article { content-visibility: auto; }'];
    var cc = K.p(t, 14.2);
    K.panel(40, 466, 1200, 118, 'styles.css', { a: cc });
    K.code(css, 64, 506, { size: 19, lh: 1.6, n: K.typed(t, css, [14.4, 19.2], 44), t: t, a: cc });
  } },

/* 8 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 18 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 106, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['DOM + CSSOM → style → layout → paint → composite',
     'CSS blocks rendering; classic scripts block parsing: use defer',
     'Layout costs most, paint less; transform and opacity only composite',
     'Read layout first, then write: no thrashing',
     'Write visual changes in requestAnimationFrame',
     'Watch LCP, INP and CLS; give images a size'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 18 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
