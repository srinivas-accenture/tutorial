/* Day 57 in motion: the cascade, specificity, @layer, inheritance, the box model, margins, positioning and stacking contexts. Loaded on demand by assets/js/motion.js. */
(function () {
  function bars(K, x, y, w, n, gap, a, col) {
    for (var i = 0; i < n; i++) K.box(x, y + i * gap, w * (i % 3 === 2 ? 0.62 : 1), 8, { fill: col || K.P.line, r: 4, a: a });
  }
  function clip(K, x, y, w, h) { var g = K.g; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); }

JSC.motion.define('day57', {
  kicker: 'JavaScript: Zero to Architect · Day 57',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 57: which CSS rule wins and why, and how big every box really is.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('CSS core', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 57 · Cascade and box model', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['The cascade', 'Specificity and @layer', 'Boxes and stacking'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 340 + i * 300, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the cascade */
{ d: 26, title: 'The cascade',
  caps: [
    [0.3, 'When two rules set the same property on the same element, the cascade decides which one wins.'],
    [5.5, 'The browser asks in order: origin and importance, inline style, layer, specificity, scope proximity, then order of appearance.'],
    [13, 'The first question with a winner ends the fight. Both rules here are unlayered author styles, so specificity decides.'],
    [20, 'Only when everything ties does the later rule win. That is why moving a rule down only fixes a real tie.']],
  draw: function (K, t) {
    var P = K.P, L = ['.card .btn { color: teal; }', '.btn       { color: orange; }'], won = K.p(t, 16.4, 0.4);
    K.panel(40, 80, 560, 150, 'styles.css', { a: K.p(t, 0.2) });
    K.code(L, 66, 128, { size: 22, n: K.typed(t, L, [0.6, 1.8], 30), t: t, w: 530, a: K.p(t, 0.2), hi: won > 0.5 ? 0 : -1 });
    K.text('0,2,0', 588, 141, { size: 16, mono: true, color: P.green, align: 'right', a: K.p(t, 16) });
    K.text('0,1,0', 588, 176, { size: 16, mono: true, color: P.muted, align: 'right', a: K.p(t, 16) });
    var cd = K.p(t, 2.8);
    K.box(40, 254, 560, 200, { fill: P.card, stroke: P.line, a: cd });
    K.text('.card', 60, 278, { size: 17, mono: true, color: P.muted, a: cd });
    K.box(220, 316, 200, 64, { fill: P.code, stroke: won > 0.5 ? P.acc : P.line, lw: 3, r: 10, a: cd });
    K.text('Buy', 320, 348, { size: 26, weight: 700, color: won > 0.5 ? P.acc : P.ink, align: 'center', a: cd });
    K.text('teal or orange?', 320, 420, { size: 18, color: P.muted, align: 'center', a: K.p(t, 3.4) * (1 - K.p(t, 15.6, 0.4)) });
    K.text('teal: the more specific rule', 320, 420, { size: 18, color: P.green, align: 'center', a: won });
    var S = ['Origin and importance', 'Inline style', 'Layer', 'Specificity', 'Scope proximity', 'Order of appearance'];
    S.forEach(function (s, i) {
      var y = 96 + i * 74, q = K.p(t, 5.8 + i * 1.15, 0.4), on = K.win(t, 13.4 + i * 0.85, i === 3 ? 30 : 14.4 + i * 0.85);
      var last = i === 5 ? K.p(t, 20.4) : 0, dim = i > 3 ? 1 - K.p(t, 17, 0.4) * 0.6 * (1 - last) : 1;
      K.box(680, y, 420, 58, { fill: on > 0 ? 'rgba(79,209,197,' + (0.18 * on).toFixed(3) + ')' : P.card, stroke: i === 3 && t > 16.3 ? P.green : last > 0.5 ? P.warm : P.line, a: q * dim, lw: 2 + on });
      K.g.save(); K.g.globalAlpha *= q * dim; K.g.fillStyle = P.code; K.g.beginPath(); K.g.arc(712, y + 29, 16, 0, 7); K.g.fill(); K.g.restore();
      K.text(String(i + 1), 712, y + 30, { size: 17, weight: 700, color: P.acc, align: 'center', a: q * dim });
      K.text(s, 742, y + 29, { size: 21, a: q * dim });
      if (i < 3) K.text('tie', 1124, y + 29, { size: 18, color: P.muted, a: K.p(t, 13.8 + i * 0.85) });
    });
    K.text('decides', 1124, 96 + 3 * 74 + 29, { size: 18, weight: 700, color: P.green, a: K.p(t, 16.4) });
    K.text('only on a tie', 1124, 96 + 5 * 74 + 29, { size: 18, color: P.warm, a: K.p(t, 20.6) });
    K.text('swap the two rules: still teal', 40, 494, { size: 19, color: P.warm, a: K.p(t, 21.2) });
    K.text('order only breaks a full tie', 40, 528, { size: 19, color: P.muted, a: K.p(t, 22) });
  } },

/* 3 ─ specificity */
{ d: 25, title: 'Specificity',
  caps: [
    [0.3, 'Specificity is a score with three columns: IDs, then classes, attributes and pseudo-classes, then element types.'],
    [7, 'Compare column by column from the left. One ID beats any number of classes.'],
    [13, ':is() takes the score of its most specific argument. :where() always scores zero, perfect for easy-to-override defaults.'],
    [19.5, 'Inline styles beat every selector, and !important reverses the order. Treat both as last resorts.']],
  draw: function (K, t) {
    var P = K.P, cx = [800, 920, 1040], hc = [P.warm, P.acc, P.blue];
    [['IDs', '#id'], ['classes', '.c [attr] :hover'], ['types', 'div  ::before']].forEach(function (h, i) {
      var q = K.p(t, 0.6 + i * 0.5);
      K.text(h[0], cx[i], 98, { size: 21, weight: 700, color: hc[i], align: 'center', a: q });
    });
    K.text('#id', cx[0], 128, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 0.6) });
    K.text('.c  :hover', cx[1], 128, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 1.1) });
    K.text('p  li', cx[2], 128, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 1.6) });
    var R = [['nav a', [0, 0, 2], 2.4], ['.card .btn:hover', [0, 3, 0], 3.6], ['input[type="email"]', [0, 1, 1], 4.8],
             ['#buy', [1, 0, 0], 7.4], [':is(#buy, .btn)', [1, 0, 0], 13.4], [':where(.card) a', [0, 0, 1], 15.6]];
    var cmp = K.win(t, 8.6, 13.2);
    R.forEach(function (r, i) {
      var y = 182 + i * 58, q = K.p(t, r[2], 0.4), n = K.p(t, r[2] + 0.6, 0.4);
      if (i === 3 && cmp > 0) K.box(50, y - 26, 1190, 52, { fill: 'rgba(104,211,145,.12)', stroke: P.green, a: cmp });
      if (i === 1 && cmp > 0) K.box(50, y - 26, 1190, 52, { fill: 'rgba(252,129,129,.08)', stroke: P.red, a: cmp, dash: [6, 6] });
      K.text(r[0], 70, y, { size: 22, mono: true, a: q });
      r[1].forEach(function (v, k) {
        K.box(cx[k] - 38, y - 21, 76, 42, { fill: P.code, stroke: v ? hc[k] : P.line, r: 8, a: n });
        K.text(String(v), cx[k], y + 1, { size: 24, mono: true, weight: 700, color: v ? hc[k] : P.muted, align: 'center', a: n });
      });
    });
    K.text('wins', 1110, 182 + 3 * 58, { size: 19, weight: 700, color: P.green, a: cmp });
    K.text('max argument', 1100, 182 + 4 * 58, { size: 17, color: P.muted, a: K.p(t, 14.4) });
    K.text('where = 0', 1100, 182 + 5 * 58, { size: 17, color: P.muted, a: K.p(t, 16.6) });
    var c1 = K.back((t - 19.8) / 0.5), c2 = K.back((t - 21.4) / 0.5);
    if (c1 > 0) K.chip('style="…" beats every selector', 360, 544, { s: c1, size: 19, stroke: P.warm });
    if (c2 > 0) K.chip('!important reverses the order', 900, 544, { s: c2, size: 19, stroke: P.red });
  } },

/* 4 ─ @layer */
{ d: 25, title: 'Cascade layers',
  caps: [
    [0.3, 'Cascade layers let you choose the order by architecture, instead of fighting with specificity.'],
    [6, 'Declare the order once. A later layer beats an earlier one, whatever the specificity of the selectors.'],
    [13, 'Styles outside any layer beat all layered styles. Important declarations reverse the layer order.'],
    [19, 'A typical stack: reset, base, components, utilities. Third-party CSS goes into its own low layer.']],
  draw: function (K, t) {
    var P = K.P;
    var L = ['@layer reset, base, components, utilities;', '', '@layer base {', '  #nav a { color: gray; }', '}', '@layer utilities {', '  .text-red { color: red; }', '}'];
    K.panel(40, 80, 640, 296, 'app.css', { a: K.p(t, 0.2) });
    K.code(L, 64, 126, { size: 19, lh: 1.5, n: K.typed(t, L, [0.8, 2.6, 6.2, 6.8, 7.6, 7.9, 8.5, 9.3], 34), t: t, w: 616, a: K.p(t, 0.2),
      hi: t > 19.2 ? 0 : -1 });
    var Y = { unl: 96, utilities: 160, components: 224, base: 288, reset: 352 };
    var S = [['reset', 1.4, P.line, ''], ['base', 1.8, P.blue, '#nav a · gray'], ['components', 2.2, P.purple, ''], ['utilities', 2.6, P.acc, '.text-red · red']];
    S.forEach(function (s) {
      var y = Y[s[0]], q = K.p(t, s[1], 0.4), hot = s[0] === 'utilities' && t > 10.4;
      K.box(780, y, 360, 52, { fill: hot ? 'rgba(79,209,197,.16)' : P.card, stroke: s[2], a: q, lw: hot ? 3 : 2 });
      K.text(s[0], 800, y + 26, { size: 20, weight: 600, a: q });
      if (s[3]) K.text(s[3], 1124, y + 26, { size: 16, mono: true, color: P.muted, align: 'right', a: K.p(t, 7.2) });
    });
    var un = K.p(t, 13.3);
    K.box(780, Y.unl, 360, 52, { fill: 'rgba(246,173,85,.1)', stroke: P.warm, dash: [7, 6], a: un });
    K.text('unlayered styles', 800, Y.unl + 26, { size: 20, weight: 600, color: P.warm, a: un });
    K.arrow(744, 396, 744, 104, { p: K.p(t, 3, 0.8), color: P.acc });
    K.text('normal: later layer wins', 700, 440, { size: 18, color: P.acc, a: K.p(t, 3.4) });
    K.arrow(1176, 104, 1176, 396, { p: K.p(t, 15.6, 0.8), color: P.warm });
    K.text('!important: order reversed', 1240, 440, { size: 18, color: P.warm, align: 'right', a: K.p(t, 16) });
    var rs = K.p(t, 10.2);
    K.box(40, 400, 640, 96, { fill: P.code, stroke: P.line, a: rs });
    K.text('Shop', 70, 448, { size: 28, weight: 700, color: P.red, a: rs });
    K.text('utilities wins: layer order comes', 160, 434, { size: 18, a: rs });
    K.text('before specificity (0,1,0 beats 1,0,1)', 160, 464, { size: 18, color: P.muted, a: rs });
    var im = ['@import url("lib.css") layer(vendor);'];
    K.panel(40, 514, 640, 62, '', { a: K.p(t, 20.6) });
    K.code(im, 64, 533, { size: 19, n: K.typed(t, im, [20.9], 34), t: t, a: K.p(t, 20.6) });
  } },

/* 5 ─ inheritance */
{ d: 25, title: 'Inheritance',
  caps: [
    [0.3, 'Some properties inherit. Text styles like color, font and line-height flow down from parent to children.'],
    [7, 'Box properties like border, padding and margin do not inherit. Each child starts fresh.'],
    [13, 'inherit copies the parent value. initial is the spec default, not the browser default: display initial makes a div inline.'],
    [19.5, 'revert goes back to the browser\'s own style, and unset means inherit if the property inherits, otherwise initial.']],
  draw: function (K, t) {
    var P = K.P, L = ['.card {', '  color: teal; font-size: 20px;', '  border: 2px solid;', '}'], inh = K.p(t, 3.4, 0.5);
    K.panel(40, 80, 560, 160, 'card.css', { a: K.p(t, 0.2) });
    K.code(L, 64, 120, { size: 20, lh: 1.5, n: K.typed(t, L, [0.6, 1, 7.2, 8.2], 30), t: t, w: 530, a: K.p(t, 0.2), hi: t > 7.4 && t < 13 ? 2 : t > 1 && t < 7 ? 1 : -1 });
    var cd = K.p(t, 1.8), bd = K.p(t, 8.2);
    K.box(40, 262, 560, 196, { fill: P.card, stroke: bd > 0.5 ? P.acc : P.line, lw: 2, a: cd });
    K.text('Title', 64, 300, { size: 26, weight: 700, color: inh > 0.5 ? P.acc : P.ink, a: cd });
    K.text('Paragraph text and', 64, 352, { size: 20, color: inh > 0.5 ? P.acc : P.ink, a: cd });
    K.text('strong text', 250, 352, { size: 20, weight: 800, color: inh > 0.5 ? P.acc : P.ink, a: cd });
    var gb = K.p(t, 9.2);
    K.box(54, 280, 120, 42, { fill: false, stroke: P.red, dash: [5, 5], r: 6, a: gb });
    K.box(54, 332, 330, 42, { fill: false, stroke: P.red, dash: [5, 5], r: 6, a: gb });
    K.mark(410, 352, false, 0.75, gb);
    K.text('children get no border', 64, 420, { size: 18, color: P.red, a: K.p(t, 9.8) });
    /* tree */
    var N = [['.card', 960, 118], ['h2', 820, 228], ['p', 1100, 228], ['strong', 1100, 338]];
    N.forEach(function (n, i) {
      var q = K.back((t - 1.2 - i * 0.4) / 0.5); if (q <= 0) return;
      K.box(n[1] - 70, n[2] - 22, 140, 44, { fill: P.card, stroke: i === 0 || inh > 0.5 ? P.acc : P.line, a: K.clamp(q) });
      K.text(n[0], n[1], n[2], { size: 20, mono: true, color: i === 0 || inh > 0.5 ? P.acc : P.ink, align: 'center', a: K.clamp(q) });
    });
    K.arrow(930, 142, 846, 204, { p: K.p(t, 2.6, 0.5), color: P.acc });
    K.arrow(990, 142, 1074, 204, { p: K.p(t, 2.8, 0.5), color: P.acc });
    K.arrow(1100, 252, 1100, 314, { p: K.p(t, 3.2, 0.5), color: P.acc });
    K.text('color flows down', 960, 290, { size: 18, color: P.acc, align: 'center', a: K.p(t, 4) });
    K.text('border stays put', 960, 376, { size: 18, color: P.red, align: 'center', a: K.p(t, 10) });
    var KW = ['inherit  → the parent value', 'initial  → spec default, not browser', 'unset    → inherit, else initial', 'revert   → the browser default'];
    K.panel(680, 404, 560, 174, '', { a: K.p(t, 13.2) });
    K.code(KW, 704, 422, { size: 19, lh: 1.5, n: K.typed(t, KW, [13.4, 14.6, 19.8, 21.2], 34), t: t, w: 530, a: K.p(t, 13.2) });
    var di = ['div { display: initial; }'], dd = K.p(t, 16.6, 0.6);
    K.panel(40, 482, 560, 96, '', { a: K.p(t, 15.6) });
    K.code(di, 64, 498, { size: 19, n: K.typed(t, di, [15.8], 30), t: t, a: K.p(t, 15.6) });
    K.box(64, 534, 500 - dd * 380, 30, { fill: 'rgba(252,129,129,.15)', stroke: P.red, r: 4, a: K.p(t, 16.2) });
    K.text('now inline!', 214, 549, { size: 17, color: P.red, a: dd });
  } },

/* 6 ─ the box model */
{ d: 24, title: 'The box model',
  caps: [
    [0.3, 'Every element is a box: content in the middle, then padding, then the border, then margin outside it.'],
    [7.5, 'With the default content-box, width sets only the content. Padding and border are added on top: 200 becomes 244 pixels.'],
    [15, 'With border-box, width includes padding and border, so 200 means 200. Set it once, globally, for every element.']],
  draw: function (K, t) {
    var P = K.P, cx = 340, cy = 330;
    function layer(hw, hh, q, o) { if (q <= 0) return; K.box(cx - hw * q, cy - hh * q, 2 * hw * q, 2 * hh * q, o); }
    var qm = K.p(t, 4.6, 0.6), qb = K.p(t, 3.4, 0.6), qp = K.p(t, 2.2, 0.6), qc = K.p(t, 1, 0.6);
    layer(184, 124, qm, { fill: 'rgba(246,173,85,.14)', stroke: P.warm, dash: [7, 6], r: 4, a: qm });
    layer(148, 88, qb, { fill: P.ink, r: 4, a: qb });
    layer(140, 80, qp, { fill: '#1f4436', r: 2, a: qp });
    layer(110, 50, qc, { fill: '#1e3a5a', r: 2, a: qc });
    K.text('content', cx, cy, { size: 22, weight: 700, color: P.blue, align: 'center', a: qc });
    K.text('padding', cx - 132, cy - 64, { size: 16, color: P.green, a: qp });
    K.text('margin', cx - 176, cy - 105, { size: 16, color: P.warm, a: qm });
    K.box(cx + 148, cy - 50, 50, 2, { fill: P.ink, a: qb });
    K.text('border', cx + 204, cy - 50, { size: 16, a: qb });
    var L = ['.box {', '  width: 200px; padding: 20px;', '  border: 2px solid;', '}'];
    K.panel(640, 80, 600, 150, 'box.css', { a: K.p(t, 7.6) });
    K.code(L, 664, 118, { size: 20, lh: 1.5, n: K.typed(t, L, [7.8, 8.1, 9.2, 9.8], 32), t: t, a: K.p(t, 7.6) });
    function ruler(y, content, q, lab, col) {
      var segs = [[4, P.ink], [40, P.green], [content, P.blue], [40, P.green], [4, P.ink]], x = 660;
      K.text(lab, 640, y - 26, { size: 19, weight: 700, color: col, a: q });
      segs.forEach(function (s) { K.box(x, y, s[0] * K.clamp(q * 1.2), 30, { fill: s[1], r: 0, a: q }); x += s[0] * K.clamp(q * 1.2); });
    }
    ruler(292, 400, K.p(t, 10.6, 0.8), 'content-box (default)', P.warm);
    K.text('2 + 20 + 200 + 20 + 2 = 244px', 660, 348, { size: 19, mono: true, color: P.warm, a: K.p(t, 11.8) });
    ruler(412, 312, K.p(t, 15.4, 0.8), 'border-box', P.green);
    K.text('total stays 200px', 660, 468, { size: 19, mono: true, color: P.green, a: K.p(t, 16.6) });
    var g = ['*, *::before, *::after { box-sizing: border-box; }'];
    K.panel(640, 500, 600, 64, '', { a: K.p(t, 18.4) });
    K.code(g, 660, 520, { size: 18, n: K.typed(t, g, [18.6], 40), t: t, a: K.p(t, 18.4) });
  } },

/* 7 ─ margin collapse */
{ d: 22, title: 'Margins collapse',
  caps: [
    [0.3, 'Vertical margins between blocks collapse: 30 pixels below and 20 pixels above give a 30 pixel gap, not 50.'],
    [7, 'A child\'s top margin can even escape through its parent. display flow-root on the parent contains it.'],
    [13.5, 'Inside flex and grid containers, margins never collapse, and gap is usually the better tool for spacing.']],
  draw: function (K, t) {
    var P = K.P, c = K.p(t, 4, 0.9), qa = K.p(t, 0.4), qb = K.p(t, 1.2);
    K.box(80, 96, 440, 70, { fill: P.card, stroke: P.acc, a: qa });
    K.text('A   margin-bottom: 30px', 100, 131, { size: 18, mono: true, a: qa });
    K.box(80, 166, 440, 60, { fill: 'rgba(246,173,85,.22)', r: 0, a: qa });
    K.text('30', 300, 196, { size: 18, color: P.warm, align: 'center', a: qa });
    var by = 226 - 40 * c;
    K.box(80, by, 440, 40, { fill: 'rgba(99,179,237,.25)', r: 0, a: qb });
    K.text('20', 420, by + 20, { size: 18, color: P.blue, align: 'center', a: qb });
    K.box(80, by + 40, 440, 70, { fill: P.card, stroke: P.purple, a: qb });
    K.text('B   margin-top: 20px', 100, by + 75, { size: 18, mono: true, a: qb });
    K.text('50px?', 540, 214, { size: 20, color: P.red, a: K.p(t, 2) * (1 - K.p(t, 3.4, 0.4)) });
    K.text('30px', 540, 196, { size: 22, weight: 700, color: P.green, a: c });
    K.text('the larger wins', 540, 226, { size: 16, color: P.muted, a: c });
    /* margin escaping the parent */
    var e1 = K.p(t, 7.4), e2 = K.p(t, 9.8);
    K.box(700, 112, 240, 50, { fill: 'rgba(246,173,85,.22)', r: 0, a: e1 });
    K.text('escaped margin', 820, 137, { size: 16, color: P.warm, align: 'center', a: e1 });
    K.box(700, 162, 240, 170, { fill: false, stroke: P.muted, dash: [6, 5], a: e1 });
    K.box(716, 162, 208, 56, { fill: P.card, stroke: P.acc, a: e1 });
    K.text('child', 820, 190, { size: 18, align: 'center', a: e1 });
    K.text('parent', 820, 300, { size: 16, color: P.muted, align: 'center', a: e1 });
    K.text('default', 820, 356, { size: 18, color: P.red, align: 'center', a: e1 });
    K.box(990, 112, 240, 220, { fill: false, stroke: P.green, a: e2 });
    K.box(1006, 112, 208, 50, { fill: 'rgba(246,173,85,.22)', r: 0, a: e2 });
    K.box(1006, 162, 208, 56, { fill: P.card, stroke: P.acc, a: e2 });
    K.text('child', 1110, 190, { size: 18, align: 'center', a: e2 });
    K.text('parent', 1110, 300, { size: 16, color: P.muted, align: 'center', a: e2 });
    K.text('display: flow-root', 1110, 356, { size: 18, mono: true, color: P.green, align: 'center', a: e2 });
    /* flex + gap */
    var f = K.p(t, 14);
    K.text('.row { display: flex; gap: 16px; }', 40, 420, { size: 18, mono: true, color: P.acc, a: f });
    K.box(40, 444, 600, 120, { fill: P.code, stroke: P.acc, a: f });
    [0, 1, 2].forEach(function (i) {
      var q = K.back((t - 14.4 - i * 0.3) / 0.5); if (q <= 0) return;
      K.box(60 + i * 192, 464, 176 * q, 80, { fill: P.card, stroke: P.purple, a: K.clamp(q) });
      if (i) K.box(60 + i * 192 - 16, 494, 16, 20, { fill: 'rgba(79,209,197,.4)', r: 2, a: K.p(t, 15.6) });
    });
    K.text('no collapsing in flex or grid', 700, 470, { size: 20, a: K.p(t, 14.6) });
    K.text('gap: spacing owned by the parent', 700, 510, { size: 20, color: P.acc, a: K.p(t, 16.4) });
  } },

/* 8 ─ positioning */
{ d: 27, title: 'Positioning',
  caps: [
    [0.3, 'position relative nudges an element from its normal spot. Its original space stays reserved.'],
    [6.5, 'absolute takes it out of the flow and places it against the nearest positioned ancestor: its containing block.'],
    [13, 'fixed pins it to the viewport, but an ancestor with a transform captures it, and then it scrolls away.'],
    [20, 'sticky scrolls normally until it reaches its offset, then sticks, but only while its parent is on screen.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    /* relative */
    var ra = K.p(t, 0.3), rm = K.p(t, 2, 0.8);
    K.panel(40, 80, 580, 235, 'position: relative', { a: ra });
    [0, 1, 2].forEach(function (i) {
      var x = 70 + i * 176, y = 130;
      if (i === 1) { K.box(x, y, 150, 64, { fill: false, stroke: P.muted, dash: [5, 5], a: ra * rm });
        K.box(x + 30 * rm, y + 30 * rm, 150, 64, { fill: P.card, stroke: P.warm, a: ra }); K.text('nudged', x + 75 + 30 * rm, y + 32 + 30 * rm, { size: 18, align: 'center', a: ra }); }
      else { K.box(x, y, 150, 64, { fill: P.card, stroke: P.line, a: ra }); K.text('box', x + 75, y + 32, { size: 18, color: P.muted, align: 'center', a: ra }); }
    });
    K.text('top: 30px; left: 30px', 70, 260, { size: 17, mono: true, color: P.warm, a: K.p(t, 2.4) });
    K.text('space kept', 590, 260, { size: 17, color: P.muted, align: 'right', a: K.p(t, 3.6) });
    /* absolute */
    var aa = K.p(t, 6.5), am = K.p(t, 8.4, 0.9);
    K.panel(660, 80, 580, 235, 'position: absolute', { a: aa });
    K.box(684, 118, 532, 176, { fill: false, stroke: P.muted, dash: [6, 5], a: aa });
    K.text('parent: position: relative', 700, 138, { size: 16, mono: true, color: P.muted, a: aa });
    K.box(700, 196, 150, 60, { fill: P.card, stroke: P.line, a: aa });
    K.box(1040 - 170 * am, 196, 150, 60, { fill: P.card, stroke: P.line, a: aa });
    K.box(870 + 186 * am, 196 - 72 * am, 150, 60, { fill: P.card, stroke: P.purple, a: aa, lw: 2.5 });
    K.text('absolute', 945 + 186 * am, 226 - 72 * am, { size: 18, align: 'center', a: aa });
    K.text('top: 0; right: 0', 700, 278, { size: 16, mono: true, color: P.purple, a: K.p(t, 9.2) });
    K.text('siblings close the gap', 1200, 278, { size: 16, color: P.muted, align: 'right', a: K.p(t, 10) });
    /* fixed */
    var fa = K.p(t, 13), sc = Math.max(0, t - 14) * 26 % 120, tr = K.p(t, 16.2);
    K.panel(40, 345, 580, 235, 'position: fixed', { a: fa });
    [[64, 'viewport', P.green, false], [340, 'ancestor has transform', P.red, true]].forEach(function (v) {
      var x = v[0], a = v[3] ? fa * tr : fa;
      K.box(x, 384, 256, 150, { fill: P.bg, stroke: P.line, r: 6, a: a });
      clip(K, x, 384, 256, 150);
      bars(K, x + 16, 400 - sc, 220, 14, 20, a);
      var fy = v[3] ? 500 - sc : 500;
      K.chip('fixed', x + 200, fy, { size: 16, stroke: v[2], a: a });
      g.restore();
      K.text(v[1], x + 128, 556, { size: 16, color: v[2], align: 'center', a: a });
    });
    /* sticky */
    var sa = K.p(t, 20), ss = Math.min(150, Math.max(0, t - 20.8) * 50);
    K.panel(660, 345, 580, 235, 'position: sticky; top: 0', { a: sa });
    K.box(684, 384, 532, 172, { fill: P.bg, stroke: P.line, r: 6, a: sa });
    clip(K, 684, 384, 532, 172);
    bars(K, 704, 400 - ss, 490, 3, 20, sa);
    bars(K, 704, 524 - ss, 490, 10, 20, sa);
    var hy = Math.max(390, 460 - ss);
    K.box(694, hy, 512, 46, { fill: P.card, stroke: P.acc, a: sa });
    K.text(hy <= 390.5 ? 'sticky header (stuck)' : 'sticky header', 950, hy + 23, { size: 18, color: P.acc, align: 'center', a: sa });
    g.restore();
  } },

/* 9 ─ stacking contexts */
{ d: 26, title: 'Stacking contexts',
  caps: [
    [0.3, 'z-index only competes with elements inside the same stacking context.'],
    [5.5, 'This modal has z-index 9999, but it lives inside main, which has z-index 1. All of main is sealed below the header.'],
    [13, 'Stacking contexts are created by z-index on positioned elements, opacity below 1, transform, filter, isolation, fixed and sticky.'],
    [20, 'For overlays, skip the z-index war: dialog and popover render in the top layer, above everything.']],
  draw: function (K, t) {
    var P = K.P;
    var L = ['.header { position: relative; z-index: 2; }', '.main   { position: relative; z-index: 1; }', '.modal  { position: fixed; z-index: 9999; }'];
    K.panel(40, 80, 640, 130, '', { a: K.p(t, 0.2) });
    K.code(L, 62, 104, { size: 18, lh: 1.6, n: K.typed(t, L, [0.6, 1.8, 5.8], 40), t: t, w: 616, a: K.p(t, 0.2), hi: t > 6 && t < 13 ? 2 : -1 });
    var pg = K.p(t, 1.6), md = K.p(t, 6.6), top = K.p(t, 21, 0.6);
    K.box(40, 232, 640, 348, { fill: P.code, stroke: P.line, a: pg });
    K.box(56, 320, 608, 244, { fill: 'rgba(183,148,244,.08)', stroke: P.purple, a: pg });
    K.text('.main  z-index: 1', 76, 548, { size: 17, mono: true, color: P.purple, a: pg });
    function modal(a, col) {
      K.box(280, 270, 320, 180, { fill: P.card, stroke: col, lw: 3, a: a });
      K.text('.modal  z-index: 9999', 440, 380, { size: 18, mono: true, align: 'center', a: a });
    }
    if (top < 0.5) modal(md, P.red);
    K.box(40, 232, 640, 76, { fill: '#3a2a16', stroke: P.warm, a: pg });
    K.text('.header  z-index: 2', 64, 270, { size: 18, mono: true, color: P.warm, a: pg });
    K.text('stuck under the header', 440, 416, { size: 18, color: P.red, align: 'center', a: K.p(t, 8.4) * (1 - top) * (top < 0.5 ? 1 : 0) });
    if (top >= 0.5) { K.box(40, 232, 640, 348, { fill: 'rgba(0,0,0,.45)', a: top });
      modal(top, P.green); K.text('top layer: above everything', 440, 416, { size: 18, color: P.green, align: 'center', a: top }); }
    /* context tree */
    var tr = K.p(t, 9.2);
    K.box(720, 86, 520, 250, { fill: false, stroke: P.line, dash: [7, 6], a: tr });
    K.text('root stacking context', 740, 108, { size: 17, color: P.muted, a: tr });
    K.box(740, 134, 210, 52, { fill: P.card, stroke: P.warm, a: tr });
    K.text('header  2', 845, 160, { size: 20, mono: true, color: P.warm, align: 'center', a: tr });
    K.box(970, 134, 250, 186, { fill: 'rgba(183,148,244,.08)', stroke: P.purple, a: K.p(t, 9.8) });
    K.text('main  1', 1095, 160, { size: 20, mono: true, color: P.purple, align: 'center', a: K.p(t, 9.8) });
    K.box(990, 240, 210, 52, { fill: P.card, stroke: P.red, a: K.p(t, 10.4) });
    K.text('modal  9999', 1095, 266, { size: 20, mono: true, color: P.red, align: 'center', a: K.p(t, 10.4) });
    K.lock(1020, 212, 0.8, P.purple, K.p(t, 11));
    K.text('sealed inside', 1042, 210, { size: 16, color: P.purple, a: K.p(t, 11) });
    var C = ['z-index + position', 'opacity < 1', 'transform', 'filter', 'isolation: isolate', 'fixed / sticky'];
    C.forEach(function (c, i) {
      var q = K.back((t - 13.6 - i * 0.7) / 0.5); if (q <= 0) return;
      K.chip(c, 850 + (i % 2) * 260, 380 + Math.floor(i / 2) * 50, { s: q, size: 17, mono: true, stroke: P.purple });
    });
    var tl = K.back((t - 20.6) / 0.5);
    if (tl > 0) K.chip('<dialog> · popover  →  top layer', 980, 550, { s: tl, size: 18, stroke: P.green, color: P.green });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 57 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Cascade: origin, inline, layer, specificity, scope, order',
     'Specificity: IDs, then classes, then types; :where() is zero',
     '@layer: later layers win; unlayered beats every layer',
     'Text properties inherit; initial is not the browser default',
     'border-box everywhere; vertical margins collapse',
     'z-index only competes inside its stacking context'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(240, y, true, 0.9, q);
      K.text(s, 272 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 57 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
