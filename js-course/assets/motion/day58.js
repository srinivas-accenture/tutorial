/* Day 58 in motion: Flexbox (axes, basis/grow/shrink, min-width: 0, auto margins) and Grid (fr tracks, lines, areas, auto-fit, subgrid). Loaded on demand by assets/js/motion.js. */
(function () {
  function lerp(a, b, u) { return a + (b - a) * u; }
  function bars(K, x, y, w, n, gap, a, col, th) {
    for (var i = 0; i < n; i++) K.box(x, y + i * gap, w * (i === n - 1 && n > 1 ? 0.6 : 1), th || 8, { fill: col || K.P.line, r: 4, a: a });
  }
  function item(K, x, y, w, h, label, col, a, size) {
    if (w <= 0 || h <= 0) return;
    K.box(x, y, w, h, { fill: K.P.card, stroke: col, a: a, r: 8 });
    if (label) K.text(label, x + w / 2, y + h / 2, { size: size || 20, weight: 700, color: col, align: 'center', a: a });
  }

JSC.motion.define('day58', {
  kicker: 'JavaScript: Zero to Architect · Day 58',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 58: build any layout with Flexbox for one dimension and Grid for two.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Layout', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 58 · Flexbox and Grid', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Flexbox: one dimension', 'Grid: two dimensions', 'The right tool'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 340 + i * 300, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ flex axes */
{ d: 25, title: 'Flexbox: the two axes',
  caps: [
    [0.3, 'display flex lays children out along one line, the main axis. The cross axis runs at right angles to it.'],
    [6.5, 'justify-content distributes the items along the main axis: start, center, or space-between.'],
    [13, 'align-items places them on the cross axis. The default, stretch, makes every item as tall as the line.'],
    [19, 'flex-direction column swaps the axes. gap puts a fixed space between items, no margins needed.']],
  draw: function (K, t) {
    var P = K.P, a = K.p(t, 7.6, 0.8), b = K.p(t, 10.4, 0.8), c = K.p(t, 14.2, 0.8), d = K.p(t, 19.6, 1);
    var jc = b > 0.5 ? 'space-between' : a > 0.5 ? 'center' : 'flex-start', ai = c > 0.5 ? 'center' : 'stretch', dir = d > 0.5 ? 'column' : 'row';
    var L = ['.row {', '  display: flex;', '  flex-direction: ' + dir + ';', '  justify-content: ' + jc + ';', '  align-items: ' + ai + ';', '  gap: 16px;', '}'];
    var hi = t > 19.4 ? 2 : t > 13.2 ? 4 : t > 6.8 ? 3 : t > 1 ? 1 : -1;
    K.panel(860, 80, 380, 290, 'layout.css', { a: K.p(t, 0.2) });
    K.code(L, 882, 124, { size: 18, lh: 1.6, t: t, hi: hi, w: 352, a: K.p(t, 0.2) });
    K.text('display: flex', 60, 112, { size: 30, mono: true, color: P.acc, a: K.p(t, 0.5) });
    K.text('one line of items, sized by their content', 60, 156, { size: 19, color: P.muted, a: K.p(t, 1.2) });
    var ca = K.p(t, 0.8);
    K.box(60, 250, 760, 210, { fill: P.code, stroke: P.acc, dash: [8, 6], a: ca });
    var cols = [P.blue, P.purple, P.warm];
    [0, 1, 2].forEach(function (i) {
      var q = K.back((t - 1.4 - i * 0.3) / 0.5); if (q <= 0) return;
      var xs = 80 + i * 136, xc = 244 + i * 136, xb = 80 + i * 300;
      var x = lerp(lerp(xs, xc, a), xb, b), w = 120, h = lerp(170, 80, c), y = lerp(270, 315, c);
      x = lerp(x, 380, d); y = lerp(y, 270 + i * 62, d); h = lerp(h, 46, d);
      item(K, x, y, w * K.clamp(q), h, String(i + 1), cols[i], K.clamp(q));
    });
    var main = 1 - d;
    K.arrow(80, 492, 800, 492, { p: K.p(t, 2.4, 0.8), color: P.acc, a: main });
    K.text('main axis', 440, 516, { size: 18, color: P.acc, align: 'center', a: K.p(t, 2.8) * (1 - K.p(t, 19.3, 0.4)) });
    K.arrow(36, 262, 36, 448, { p: K.p(t, 3.6, 0.6), color: P.warm, a: main });
    K.text('cross axis', 60, 228, { size: 18, color: P.warm, a: K.p(t, 3.8) * (1 - K.p(t, 19.3, 0.4)) });
    K.arrow(36, 262, 36, 448, { color: P.acc, a: d });
    K.text('main axis (column)', 60, 228, { size: 18, color: P.acc, a: K.p(t, 20.4, 0.4) });
    K.arrow(80, 492, 800, 492, { color: P.warm, a: d });
    K.text('cross axis', 440, 516, { size: 18, color: P.warm, align: 'center', a: K.p(t, 20.4, 0.4) });
    K.text('items stretch to the line', 860, 410, { size: 18, color: P.muted, a: K.win(t, 13.4, 14.4) });
    K.text('gap: 16px between items', 860, 410, { size: 18, color: P.acc, a: K.p(t, 21.4) });
  } },

/* 3 ─ basis, grow, shrink */
{ d: 28, title: 'Flexbox: basis, grow, shrink',
  caps: [
    [0.3, 'Each item starts from its flex-basis. Three items of 100 pixels in a 600 pixel row leave 300 pixels free.'],
    [7, 'flex-grow shares the free space by ratio. Grow 1, 1 and 2 receive 75, 75 and 150 pixels.'],
    [14, 'When the row is too small, flex-shrink removes the overflow, weighted by shrink times basis.'],
    [21, 'flex 1 means grow 1, shrink 1, basis 0: the whole row is shared. flex auto keeps content size as the basis.']],
  draw: function (K, t) {
    var P = K.P, S = 1.6, g = K.p(t, 8.4, 1.4), cols = [P.blue, P.purple, P.warm];
    var ca = K.p(t, 0.3);
    K.text('row: 600px', 160, 98, { size: 18, mono: true, color: P.muted, a: ca });
    K.box(160, 118, 600 * S, 90, { fill: P.code, stroke: P.acc, dash: [8, 6], a: ca });
    var extra = [75, 75, 150], x = 160;
    [0, 1, 2].forEach(function (i) {
      var q = K.p(t, 1 + i * 0.4, 0.4), w = (100 + extra[i] * g) * S;
      item(K, x + 4, 126, w - 8, 74, String(Math.round(100 + extra[i] * g)) + 'px', cols[i], q, 19);
      K.text('grow ' + (i === 2 ? 2 : 1), x + w / 2, 230, { size: 17, mono: true, color: P.green, align: 'center', a: K.p(t, 7.4 + i * 0.3) });
      x += w;
    });
    var fr = K.p(t, 3) * (1 - g);
    K.box(160 + 300 * S, 126, 300 * S - 4, 74, { fill: 'rgba(104,211,145,.08)', stroke: P.green, dash: [6, 6], a: fr });
    K.text('free: 300px', 160 + 450 * S, 163, { size: 20, color: P.green, align: 'center', a: fr });
    K.text('300 split 1 : 1 : 2', 1120, 98, { size: 18, color: P.green, align: 'right', a: K.p(t, 9.6) });
    /* shrink */
    var sa = K.p(t, 14.2), s = K.p(t, 16.4, 1.4), base = [100, 100, 200], cut = [40, 40, 80];
    K.text('row: 240px, items want 400px', 160, 282, { size: 18, mono: true, color: P.muted, a: sa });
    K.box(160, 302, 240 * S, 90, { fill: P.code, stroke: P.acc, dash: [8, 6], a: sa });
    K.box(160 + 240 * S, 302, 160 * S * (1 - s), 90, { fill: 'rgba(252,129,129,.12)', stroke: P.red, dash: [6, 6], r: 0, a: sa * (1 - s) });
    x = 160;
    [0, 1, 2].forEach(function (i) {
      var w = (base[i] - cut[i] * s) * S;
      item(K, x + 4, 310, w - 8, 74, String(Math.round(base[i] - cut[i] * s)), cols[i], sa, 19);
      x += w;
    });
    K.text('overflow 160px', 820, 330, { size: 19, color: P.red, a: K.p(t, 15) * (1 - K.p(t, 16.2, 0.3)) });
    K.text('removed: 40 · 40 · 80', 820, 330, { size: 19, color: P.green, a: K.p(t, 16.7, 0.4) });
    K.text('weight = shrink × basis', 820, 366, { size: 19, color: P.muted, a: K.p(t, 17.6) });
    var C = ['flex: 1     →  1 1 0%     share the whole row', 'flex: auto  →  1 1 auto   content size, then share'];
    K.panel(160, 440, 960, 116, '', { a: K.p(t, 21.2) });
    K.code(C, 186, 462, { size: 20, lh: 1.6, n: K.typed(t, C, [21.4, 23.6], 40), t: t, a: K.p(t, 21.2) });
  } },

/* 4 ─ min-width: 0, auto margins, order */
{ d: 25, title: 'Flexbox gotchas',
  caps: [
    [0.3, 'Flex items will not shrink below their content\'s minimum width, so a long URL can push out of the row.'],
    [7.5, 'Give the item min-width 0 and it can shrink, so the text can wrap or end in an ellipsis.'],
    [13.5, 'margin-left auto swallows all the free space and pushes an item to the far end, like a log out button.'],
    [19, 'order and row-reverse only change what you see. Keyboard focus and screen readers still follow the HTML.']],
  draw: function (K, t) {
    var P = K.P, fix = K.p(t, 9.6, 0.3), ca = K.p(t, 0.4);
    K.box(60, 96, 700, 80, { fill: P.code, stroke: P.acc, dash: [8, 6], a: ca });
    item(K, 70, 106, 150, 60, 'Title', P.blue, ca);
    var url = 'https://shop.example/a/very/long/path/to/a/product', shown = fix > 0.5 ? url.slice(0, 27) + '…' : url;
    var w = fix > 0.5 ? 520 : 760;
    K.box(230, 106, w, 60, { fill: P.card, stroke: fix > 0.5 ? P.green : P.red, r: 8, a: K.p(t, 1) });
    K.text(shown, 246, 136, { size: 19, mono: true, color: fix > 0.5 ? P.ink : P.red, a: K.p(t, 1) });
    K.text('overflows the row', 60, 204, { size: 18, color: P.red, a: K.p(t, 3) * (1 - fix) });
    var mc = ['.item { min-width: 0; }', '.url  { overflow: hidden;', '        text-overflow: ellipsis; }'];
    K.panel(800, 80, 440, 140, '', { a: K.p(t, 7.8) });
    K.code(mc, 822, 98, { size: 18, lh: 1.6, n: K.typed(t, mc, [8, 9, 9.6], 40), t: t, a: K.p(t, 7.8) });
    K.text('shrinks and truncates', 60, 204, { size: 18, color: P.green, a: fix });
    /* nav with margin-left: auto */
    var na = K.p(t, 13.6), push = K.p(t, 15.4, 1);
    K.box(60, 256, 1180, 72, { fill: P.code, stroke: P.acc, dash: [8, 6], a: na });
    [['Home', 120], ['Shop', 230], ['Blog', 340]].forEach(function (c) { K.chip(c[0], c[1], 292, { size: 19, stroke: P.blue, a: na }); });
    var lx = lerp(470, 1150, push);
    K.chip('Log out', lx, 292, { size: 19, stroke: P.warm, a: na });
    K.arrow(400, 292, lx - 60, 292, { p: push, color: P.warm, dash: [6, 6], lw: 2, a: K.p(t, 15.6) });
    K.text('margin-left: auto', 760, 346, { size: 18, mono: true, color: P.warm, align: 'center', a: K.p(t, 16.2) });
    /* order vs DOM */
    var oa = K.p(t, 19.2), focus = t > 20.6 ? Math.floor((t - 20.6) / 1.1) % 3 : -1;
    K.text('flex-direction: row-reverse', 60, 400, { size: 18, mono: true, color: P.purple, a: oa });
    [0, 1, 2].forEach(function (i) {
      var x = 60 + (2 - i) * 190;
      K.box(x, 424, 170, 70, { fill: P.card, stroke: focus === i ? P.warm : P.purple, lw: focus === i ? 4 : 2, a: oa });
      K.text('DOM ' + (i + 1), x + 85, 459, { size: 20, weight: 700, align: 'center', a: oa });
    });
    K.text('Tab order: 1 → 2 → 3, right to left', 660, 440, { size: 20, color: P.warm, a: K.p(t, 21) });
    K.text('visual order lies; reading order does not', 660, 478, { size: 18, color: P.muted, a: K.p(t, 22.4) });
  } },

/* 5 ─ grid tracks */
{ d: 27, title: 'Grid: tracks and lines',
  caps: [
    [0.3, 'display grid lays out rows and columns at the same time. You define the tracks, and items fill the cells.'],
    [6.5, 'fr means a share of the leftover space. 200px 1fr 2fr in an 800 pixel grid gives 200, 200 and 400.'],
    [13, 'Grid lines are numbered from 1. grid-column 1 / -1 spans from the first line to the last.'],
    [20, 'A plain 1fr is really minmax(auto, 1fr), so long content can widen it. minmax(0, 1fr) keeps columns truly equal.']],
  draw: function (K, t) {
    var P = K.P, X = [160, 400, 640, 1120], gy = 126, rh = 96, sp = K.p(t, 14.6, 1);
    K.text('grid-template-columns: 200px 1fr 2fr;', 160, 84, { size: 20, mono: true, color: P.acc, a: K.p(t, 0.3) });
    var ga = K.p(t, 0.8);
    K.box(160, gy, 960, rh * 3, { fill: P.code, stroke: P.line, r: 4, a: ga });
    X.forEach(function (x, i) { K.box(x - 1, gy, 2, rh * 3, { fill: P.acc, r: 0, a: K.p(t, 1 + i * 0.2) * 0.7 }); });
    [1, 2].forEach(function (r) { K.box(160, gy + r * rh - 1, 960, 2, { fill: P.line, r: 0, a: ga }); });
    var W = ['200px', '1fr = 200px', '2fr = 400px'];
    W.forEach(function (w, i) { K.text(w, (X[i] + X[i + 1]) / 2, 112, { size: 18, mono: true, color: i ? P.green : P.muted, align: 'center', a: K.p(t, 7 + i * 0.8) }); });
    var cols = [P.warm, P.blue, P.purple, P.blue, P.purple, P.blue];
    for (var i = 0; i < 6; i++) {
      var q = K.back((t - 2 - i * 0.4) / 0.5); if (q <= 0) continue;
      var j0 = i, j1 = i === 0 ? 0 : i + 2, c0 = j0 % 3, r0 = Math.floor(j0 / 3), c1 = j1 % 3, r1 = Math.floor(j1 / 3);
      var x0 = lerp(X[c0], X[c1], sp), y = gy + lerp(r0, r1, sp) * rh, xe = i === 0 ? lerp(X[1], X[3], sp) : lerp(X[c0 + 1], X[c1 + 1], sp);
      var lab = i === 0 && sp > 0.5 ? 'header: 1 / -1' : String(i + 1);
      K.g.save(); K.g.translate((x0 + xe) / 2, y + rh / 2); K.g.scale(q, q); K.g.translate(-(x0 + xe) / 2, -(y + rh / 2));
      item(K, x0 + 8, y + 8, xe - x0 - 16, rh - 16, lab, cols[i], K.clamp(q));
      K.g.restore();
    }
    X.forEach(function (x, i) {
      var q = K.p(t, 13.2 + i * 0.3);
      K.g.save(); K.g.globalAlpha *= q; K.g.fillStyle = P.acc; K.g.beginPath(); K.g.arc(x, 450, 14, 0, 7); K.g.fill(); K.g.restore();
      K.text(String(i + 1), x, 451, { size: 17, weight: 700, color: P.bg, align: 'center', a: q });
    });
    K.text('-1', 1120, 480, { size: 18, mono: true, weight: 700, color: P.warm, align: 'center', a: K.p(t, 14.4) });
    var C = ['1fr  =  minmax(auto, 1fr)    long words widen it', 'minmax(0, 1fr)                 equal, no matter what'];
    K.panel(160, 500, 960, 78, '', { a: K.p(t, 20.2) });
    K.code(C, 184, 508, { size: 19, lh: 1.5, n: K.typed(t, C, [20.4, 22.6], 40), t: t, a: K.p(t, 20.2) });
  } },

/* 6 ─ named areas */
{ d: 24, title: 'Grid: named areas',
  caps: [
    [0.3, 'grid-template-areas draws the layout as text. Each string is a row, each name fills a cell.'],
    [7.5, 'Items opt in with grid-area. Change the template in a media query and the page reflows, without touching the HTML.'],
    [16, 'Every area must be a rectangle, and a dot leaves a cell empty.']],
  draw: function (K, t) {
    var P = K.P, m = K.p(t, 11.4, 1.2);
    var L = ['.page {', '  display: grid;', '  grid-template-columns: 200px 1fr;', '  grid-template-areas:', '    "header header"', '    "nav    main"', '    "footer footer";', '}', 'header { grid-area: header; }'];
    K.panel(40, 80, 580, 318, 'page.css', { a: K.p(t, 0.2) });
    K.code(L, 62, 122, { size: 18, lh: 1.5, n: K.typed(t, L, [0.6, 1, 1.4, 2, 2.6, 3.2, 3.8, 4.4, 7.8], 34), t: t, w: 556, a: K.p(t, 0.2), hi: t > 8 && t < 10.5 ? 8 : -1 });
    var M = ['@media (width < 40rem) {', '  .page { grid-template-columns: 1fr;', '    grid-template-areas:', '      "header" "main" "nav" "footer"; }', '}'];
    K.panel(40, 414, 580, 166, '', { a: K.p(t, 10.2) });
    K.code(M, 62, 428, { size: 17, lh: 1.5, n: K.typed(t, M, [10.4, 10.8, 11.4, 11.8, 12.6], 40), t: t, a: K.p(t, 10.2) });
    var A = [['header', P.warm, [680, 90, 560, 66], [800, 90, 300, 56], 1], ['nav', P.purple, [680, 166, 180, 240], [800, 336, 300, 70], 1.4],
             ['main', P.blue, [870, 166, 370, 240], [800, 156, 300, 170], 1.8], ['footer', P.green, [680, 416, 560, 60], [800, 416, 300, 50], 2.2]];
    A.forEach(function (r) {
      var q = K.p(t, r[4], 0.5), x = lerp(r[2][0], r[3][0], m), y = lerp(r[2][1], r[3][1], m), w = lerp(r[2][2], r[3][2], m), h = lerp(r[2][3], r[3][3], m);
      item(K, x, y, w, h, r[0], r[1], q);
    });
    K.text('desktop', 960, 500, { size: 18, color: P.muted, align: 'center', a: K.p(t, 2.6) * (1 - K.p(t, 11.4, 0.4)) });
    K.text('phone: same HTML, new template', 950, 500, { size: 18, color: P.acc, align: 'center', a: K.p(t, 12.2, 0.4) });
    var e = K.p(t, 16.4);
    K.box(690, 528, 40, 20, { fill: P.card, stroke: P.red, r: 3, a: e });
    K.box(690, 548, 80, 20, { fill: P.card, stroke: P.red, r: 3, a: e });
    K.mark(800, 548, false, 0.75, e);
    K.text('L-shapes are invalid', 824, 548, { size: 18, color: P.red, a: e });
    K.text('"." = empty cell', 1240, 548, { size: 18, mono: true, color: P.muted, align: 'right', a: K.p(t, 18.4) });
  } },

/* 7 ─ auto-fit gallery */
{ d: 27, title: 'Grid: the auto-fit gallery',
  caps: [
    [0.3, 'The famous gallery one-liner: repeat auto-fit, with columns from a 15rem minimum up to 1fr.'],
    [7, 'As the container shrinks, columns drop one at a time. No card goes below 15rem, and leftover space is shared.'],
    [15, 'min(15rem, 100%) stops overflow when the container is narrower than 15rem. No media queries needed.'],
    [20.5, 'auto-fit collapses empty tracks so a few items stretch. auto-fill keeps the empty tracks.']],
  draw: function (K, t) {
    var P = K.P, cmp = K.p(t, 20.6, 0.6), ga = (1 - cmp) * K.p(t, 1);
    var C = ['.gallery { display: grid; gap: 16px;', '  grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr)); }'];
    K.panel(40, 76, 1200, 78, '', { a: K.p(t, 0.2) });
    K.code(C, 60, 88, { size: 18, lh: 1.5, n: K.typed(t, C, [0.4, 1.6], 50), t: t, a: K.p(t, 0.2) });
    var W = t < 7.5 ? 1160 : t < 14.5 ? lerp(1160, 300, K.ease((t - 7.5) / 7)) : lerp(300, 200, K.p(t, 15.6, 1.2));
    var IW = W - 20, n = Math.max(1, Math.floor((IW + 16) / 256)), cw = (IW - 16 * (n - 1)) / n;
    K.text('container ' + Math.round(W) + 'px  →  ' + n + (n > 1 ? ' columns' : ' column'), 40, 176, { size: 18, mono: true, color: P.acc, a: ga });
    K.box(40, 194, W, 6 * 50 + 20, { fill: P.code, stroke: P.acc, dash: [8, 6], r: 4, a: ga });
    var cols = [P.blue, P.purple, P.warm, P.green, P.blue, P.purple];
    for (var i = 0; i < 6; i++) {
      var q = K.p(t, 2 + i * 0.3, 0.4) * ga, x = 50 + (i % n) * (cw + 16), y = 204 + Math.floor(i / n) * 50;
      item(K, x, y, cw, 40, 'card ' + (i + 1), cols[i], q, 17);
    }
    var ov = K.p(t, 16.2) * ga;
    K.box(40, 194, 240, 60, { fill: false, stroke: P.red, dash: [5, 5], a: ov * 0.9 });
    K.text('15rem without min(): overflows', 300, 224, { size: 18, color: P.red, a: ov });
    K.text('min(15rem, 100%): fits', 300, 258, { size: 18, color: P.green, a: K.p(t, 17.4) * ga });
    /* auto-fit vs auto-fill */
    [['auto-fit', 220, true], ['auto-fill', 410, false]].forEach(function (r, k) {
      var q = K.p(t, 21 + k * 1.6, 0.5);
      K.text(r[0], 40, r[1] - 26, { size: 20, mono: true, weight: 700, color: r[2] ? P.acc : P.purple, a: q });
      K.box(40, r[1], 1160, 110, { fill: P.code, stroke: P.line, dash: [8, 6], r: 4, a: q });
      if (r[2]) { item(K, 50, r[1] + 10, 562, 90, 'card 1', P.blue, q); item(K, 628, r[1] + 10, 562, 90, 'card 2', P.purple, q); }
      else { item(K, 50, r[1] + 10, 274, 90, 'card 1', P.blue, q); item(K, 340, r[1] + 10, 274, 90, 'card 2', P.purple, q);
        K.box(630, r[1] + 10, 274, 90, { fill: false, stroke: P.line, dash: [6, 6], r: 8, a: q }); K.box(920, r[1] + 10, 274, 90, { fill: false, stroke: P.line, dash: [6, 6], r: 8, a: q });
        K.text('empty tracks kept', 1057, r[1] + 55, { size: 17, color: P.muted, align: 'center', a: q }); }
    });
  } },

/* 8 ─ subgrid */
{ d: 23, title: 'Grid: subgrid',
  caps: [
    [0.3, 'Cards side by side with different title lengths: their text and buttons end up at different heights.'],
    [6.5, 'With grid-template-rows subgrid, each card borrows the parent\'s rows, so titles, text and buttons line up.'],
    [15, 'Each card spans three of the parent\'s rows with grid-row span 3, and the tallest title sizes that row for everyone.']],
  draw: function (K, t) {
    var P = K.P, s = K.p(t, 9, 1.2), T = [1, 3, 2], B = [2, 4, 3], y0 = 90;
    var TH = 3 * 30, BH = 4 * 22, top = 0, bottom = 0;
    var lay = [0, 1, 2].map(function (i) {
      var th = lerp(T[i] * 30, TH, s), bh = lerp(B[i] * 22, BH, s), by = y0 + 20 + th + 16, btn = by + bh + 16;
      bottom = Math.max(bottom, btn + 44 + 20); return [th, by, btn];
    });
    var bad = K.p(t, 3) * (1 - s);
    [0, 1, 2].forEach(function (i) { K.box(100, lay[i][2] + 22, 1080, 2, { fill: P.red, r: 0, a: bad }); });
    [0, 1, 2].forEach(function (i) {
      var x = 120 + i * 360, q = K.p(t, 0.5 + i * 0.3, 0.5), L = lay[i];
      K.box(x, y0, 320, bottom - y0, { fill: P.card, stroke: P.line, a: q });
      bars(K, x + 20, y0 + 22, 260, T[i], 30, q, P.ink, 14);
      bars(K, x + 20, L[1], 270, B[i], 22, q, P.muted, 8);
      K.box(x + 20, L[2], 120, 44, { fill: P.acc, r: 8, a: q });
      K.text('Buy', x + 80, L[2] + 22, { size: 18, weight: 700, color: P.bg, align: 'center', a: q });
    });
    var ok = K.p(t, 10.6);
    [y0 + 18 + TH + 8, y0 + 20 + TH + 16 + BH + 8].forEach(function (y) {
      K.g.save(); K.g.globalAlpha *= ok; K.g.strokeStyle = P.green; K.g.setLineDash([7, 6]); K.g.lineWidth = 2;
      K.g.beginPath(); K.g.moveTo(100, y); K.g.lineTo(1180, y); K.g.stroke(); K.g.restore();
    });
    K.text('misaligned', 1240, 120, { size: 17, color: P.red, align: 'right', a: bad });
    K.text('aligned', 1240, 120, { size: 17, color: P.green, align: 'right', a: ok });
    var C = ['.cards { display: grid; grid-template-columns: repeat(3, 1fr); }', '.card  { display: grid; grid-row: span 3;', '         grid-template-rows: subgrid; }'];
    K.panel(120, 446, 1040, 130, '', { a: K.p(t, 6.8) });
    K.code(C, 144, 466, { size: 19, lh: 1.6, n: K.typed(t, C, [7, 7.8, 8.4], 50), t: t, w: 1000, a: K.p(t, 6.8), hi: t > 15.2 ? 1 : -1 });
  } },

/* 9 ─ flex or grid */
{ d: 24, title: 'Flex or Grid?',
  caps: [
    [0.3, 'Flexbox works from the content out: items size themselves and wrap like words. Great for toolbars, tags and nav bars.'],
    [7.5, 'Grid works from the layout in: you define the tracks, and rows and columns line up. Great for pages, galleries and forms.'],
    [15, 'They combine: Grid for the page, Flexbox inside each component. Both use gap and the same alignment properties.']],
  draw: function (K, t) {
    var P = K.P, fa = K.p(t, 0.4);
    K.text('Flexbox: content out', 40, 96, { size: 22, weight: 700, color: P.blue, a: fa });
    K.box(40, 116, 580, 220, { fill: P.code, stroke: P.blue, dash: [8, 6], a: fa });
    var tags = ['css', 'layout', 'flexbox', 'a11y', 'design systems', 'grid', 'responsive', 'html', 'performance', 'ux'], x = 56, y = 150;
    tags.forEach(function (s, i) {
      var w = s.length * 10.4 + 32; if (x + w > 604) { x = 56; y += 52; }
      var q = K.back((t - 1.2 - i * 0.3) / 0.4);
      if (q > 0) K.chip(s, x + w / 2, y, { s: q, size: 18, mono: true, stroke: P.blue });
      x += w + 12;
    });
    var ga = K.p(t, 7.6);
    K.text('Grid: layout in', 660, 96, { size: 22, weight: 700, color: P.purple, a: ga });
    K.box(660, 116, 580, 220, { fill: P.code, stroke: P.purple, dash: [8, 6], a: ga });
    ['Name', 'Email address', 'City'].forEach(function (s, i) {
      var q = K.p(t, 8.4 + i * 0.5), yy = 156 + i * 64;
      K.text(s, 840, yy, { size: 19, align: 'right', a: q });
      K.box(860, yy - 20, 360, 40, { fill: P.card, stroke: P.line, r: 6, a: q });
    });
    K.box(849, 124, 2, 204, { fill: P.purple, r: 0, a: K.p(t, 10.6) * 0.8 });
    /* combined */
    var ca = K.p(t, 15.2);
    K.box(40, 366, 1200, 210, { fill: P.code, stroke: P.purple, a: ca });
    K.text('grid', 1224, 386, { size: 16, mono: true, color: P.purple, align: 'right', a: ca });
    K.box(56, 380, 1100, 56, { fill: P.card, stroke: P.blue, dash: [6, 5], a: K.p(t, 15.8) });
    ['Logo', 'Shop', 'Blog', 'Cart'].forEach(function (s, i) { K.chip(s, i === 3 ? 1090 : 110 + i * 100, 408, { size: 17, stroke: P.blue, a: K.p(t, 16.2 + i * 0.2) }); });
    K.text('flex', 700, 408, { size: 16, mono: true, color: P.blue, align: 'center', a: K.p(t, 16.4) });
    K.box(56, 448, 200, 116, { fill: P.card, stroke: P.line, a: K.p(t, 16.8) });
    K.text('sidebar', 156, 506, { size: 17, color: P.muted, align: 'center', a: K.p(t, 16.8) });
    [0, 1, 2].forEach(function (i) {
      var q = K.p(t, 17.4 + i * 0.3);
      K.box(272 + i * 300, 448, 284, 116, { fill: P.card, stroke: P.purple, a: q });
      bars(K, 292 + i * 300, 474, 244, 3, 22, q);
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 58 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Flexbox: one axis; justify on the main axis, align on the cross',
     'Basis first; grow shares free space; shrink removes overflow',
     'min-width: 0 lets items shrink; margin auto pushes',
     'Grid: tracks in two dimensions; fr shares the leftover',
     'Lines, 1 / -1 spans, named areas, auto-fit, subgrid',
     'Grid for the page, Flexbox inside components'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(240, y, true, 0.9, q);
      K.text(s, 272 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 58 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
