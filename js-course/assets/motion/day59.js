/* Day 59 in motion: responsive design (media and container queries, clamp, viewport units, logical properties) and modern CSS (custom properties, :has, nesting, colour functions). Loaded on demand by assets/js/motion.js. */
(function () {
  function lerp(a, b, u) { return a + (b - a) * u; }
  function bars(K, x, y, w, n, gap, a, col, th) {
    for (var i = 0; i < n; i++) K.box(x, y + i * gap, w * (i === n - 1 && n > 1 ? 0.6 : 1), th || 8, { fill: col || K.P.line, r: 4, a: a });
  }
  function pic(K, x, y, w, h, a) {
    var g = K.g; if (a <= 0 || w <= 0) return;
    K.box(x, y, w, h, { fill: '#1d3347', stroke: K.P.blue, r: 6, a: a });
    g.save(); g.globalAlpha *= K.clamp(a); g.fillStyle = 'rgba(104,211,145,.55)';
    g.beginPath(); g.moveTo(x + 4, y + h - 4); g.lineTo(x + w * 0.4, y + h * 0.4); g.lineTo(x + w * 0.62, y + h * 0.7); g.lineTo(x + w * 0.8, y + h * 0.5); g.lineTo(x + w - 4, y + h - 4); g.closePath(); g.fill(); g.restore();
  }
  /* browser window frame */
  function frame(K, x, y, w, h, label, a) {
    var P = K.P;
    K.box(x, y, w, h, { fill: P.code, stroke: P.line, a: a });
    K.box(x, y, w, 30, { fill: P.card, r: 10, a: a });
    [P.red, P.warm, P.green].forEach(function (c, i) { K.box(x + 14 + i * 16, y + 10, 10, 10, { fill: c, r: 5, a: a * 0.8 }); });
    if (label) K.text(label, x + 70, y + 15, { size: 16, mono: true, color: P.muted, a: a });
  }
  function swatch(K, x, y, w, h, col, a) { K.box(x, y, w, h, { fill: col, r: 8, a: a }); }

JSC.motion.define('day59', {
  kicker: 'JavaScript: Zero to Architect · Day 59',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 59: interfaces that adapt to any screen, container, language and user preference, with modern CSS.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Responsive CSS', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 59 · Responsive and modern CSS', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Media and container queries', 'clamp() and units', 'Modern CSS'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 330 + i * 310, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ intrinsic + media queries */
{ d: 25, title: 'Media queries',
  caps: [
    [0.3, 'Start intrinsic: layouts that wrap and flex on their own need far fewer breakpoints.'],
    [6, 'Media queries ask about the viewport. Write the narrow layout first, then add columns when there is room.'],
    [13, 'Use rem for breakpoints so they follow the user\'s font size. The range syntax, width >= 40rem, reads naturally.'],
    [19, 'Media queries also read preferences: color scheme, reduced motion, and whether there is a hover-capable pointer.']],
  draw: function (K, t) {
    var P = K.P, fa = K.p(t, 0.3);
    var fw = t < 1.5 ? 1200 : t < 6.5 ? lerp(1200, 820, K.ease((t - 1.5) / 4)) : t < 13 ? lerp(820, 440, K.ease((t - 7) / 3.5)) : lerp(440, 1000, K.ease((t - 13.5) / 2.5));
    fw = Math.round(fw);
    var wide = fw >= 640, fx = 40, fy = 80, fh = 300;
    frame(K, fx, fy, fw, fh, 'viewport: ' + fw + 'px' + (wide ? '' : '   (< 40rem)'), fa);
    var sx, sy, sw, sh, mx, my, mw;
    if (wide) { sx = fx + 14; sy = fy + 44; sw = 226; sh = fh - 58; mx = fx + 254; my = fy + 44; mw = fw - 268; }
    else { sx = fx + 14; sy = fy + 44; sw = fw - 28; sh = 44; mx = fx + 14; my = fy + 100; mw = fw - 28; }
    K.box(sx, sy, sw, sh, { fill: P.card, stroke: P.purple, a: fa });
    K.text('sidebar', sx + 14, sy + 22, { size: 16, color: P.purple, a: fa });
    var n = Math.max(1, Math.floor((mw + 12) / 172)), cw = (mw - 12 * (n - 1)) / n;
    for (var i = 0; i < 6; i++) {
      var x = mx + (i % n) * (cw + 12), y = my + Math.floor(i / n) * 58;
      K.box(x, y, cw, 48, { fill: P.card, stroke: P.blue, r: 8, a: fa });
      bars(K, x + 12, y + 14, cw - 24, 2, 14, fa, P.muted, 6);
    }
    K.text('cards wrap by themselves: no breakpoint', 1240, 404, { size: 17, color: P.green, align: 'right', a: K.win(t, 2, 6.2) });
    var C = ['.page { display: grid; }   /* narrow first */', '@media (width >= 40rem) {', '  .page { grid-template-columns: 15rem 1fr; }', '}'];
    K.panel(40, 412, 640, 132, '', { a: K.p(t, 6.4) });
    K.code(C, 62, 426, { size: 18, lh: 1.5, n: K.typed(t, C, [6.6, 7.8, 8.4, 9.4], 40), t: t, w: 610, a: K.p(t, 6.4), hi: t > 13.2 && t < 19 ? 1 : -1 });
    K.text('rem: follows the user\'s font size', 40, 566, { size: 17, color: P.acc, a: K.p(t, 14) });
    var pr = ['(prefers-color-scheme: dark)', '(prefers-reduced-motion: reduce)', '(hover: hover)', '(pointer: coarse)'];
    pr.forEach(function (s, i) {
      var q = K.back((t - 19.4 - i * 0.7) / 0.5); if (q <= 0) return;
      K.chip(s, 980, 424 + i * 42, { s: q, size: 16, mono: true, stroke: [P.purple, P.warm, P.blue, P.green][i] });
    });
  } },

/* 3 ─ container queries */
{ d: 26, title: 'Container queries',
  caps: [
    [0.3, 'A component cannot know where it will be placed. Container queries let it ask its container, not the screen.'],
    [7, 'Mark the parent with container-type inline-size. An @container rule then responds to that box\'s width.'],
    [14, 'The same card is wide in the main column and stacked in the sidebar. Same HTML, same CSS.'],
    [20, 'cqi units are percentages of the container\'s inline size, handy for type that scales with the component.']],
  draw: function (K, t) {
    var P = K.P, fa = K.p(t, 0.3), cq = K.p(t, 20.4);
    var mw = t < 8.6 ? 500 : t < 12.6 ? lerp(500, 330, K.ease((t - 8.6) / 1.6)) : lerp(330, 500, K.ease((t - 12.6) / 1.4));
    function card(x, y, w, a, ts) {
      var wide = w > 480;
      if (wide) { K.box(x, y, w, 130, { fill: P.card, stroke: P.acc, a: a }); pic(K, x + 12, y + 12, 150, 106, a);
        K.text('Trail Pro', x + 178, y + 34, { size: ts, weight: 700, a: a }); bars(K, x + 178, y + 66, w - 200, 3, 18, a, P.muted); }
      else { K.box(x, y, w, 200, { fill: P.card, stroke: P.warm, a: a }); pic(K, x + 12, y + 12, w - 24, 80, a);
        K.text('Trail Pro', x + 12, y + 116, { size: ts, weight: 700, a: a }); bars(K, x + 12, y + 144, w - 24, 3, 16, a, P.muted); }
    }
    frame(K, 40, 80, 760, 330, 'page', fa);
    K.box(56, 124, mw + 16, 272, { fill: false, stroke: P.acc, dash: [7, 6], a: fa });
    K.text('main · ' + Math.round(mw) + 'px', 66, 142, { size: 16, mono: true, color: P.acc, a: K.p(t, 7.4) });
    card(64, 160, mw, K.p(t, 1.2), lerp(22, 26, cq));
    K.box(586, 124, 200, 272, { fill: false, stroke: P.warm, dash: [7, 6], a: fa });
    K.text('sidebar · 200px', 596, 142, { size: 16, mono: true, color: P.warm, a: K.p(t, 7.4) });
    card(594, 160, 184, K.p(t, 1.8), lerp(22, 17, cq));
    var C = ['.slot {', '  container-type: inline-size;', '}', '@container (width > 30rem) {', '  .card { display: grid;', '    grid-template-columns: 9rem 1fr; }', '}'];
    K.panel(830, 80, 410, 260, 'card.css', { a: K.p(t, 7.2) });
    K.code(C, 852, 118, { size: 17, lh: 1.5, n: K.typed(t, C, [7.4, 7.8, 8.6, 9.6, 10.4, 11, 12], 40), t: t, w: 380, a: K.p(t, 7.2) });
    K.text('wide here', 300, 430, { size: 18, color: P.acc, align: 'center', a: K.p(t, 14.4) });
    K.text('stacked here', 686, 430, { size: 18, color: P.warm, align: 'center', a: K.p(t, 15) });
    K.text('one component, two layouts', 1035, 380, { size: 18, color: P.muted, align: 'center', a: K.p(t, 16) });
    var U = ['.card h3 { font-size: clamp(1rem, 5cqi, 1.6rem); }'];
    K.panel(40, 470, 760, 64, '', { a: K.p(t, 20.2) });
    K.code(U, 62, 490, { size: 19, n: K.typed(t, U, [20.4], 40), t: t, a: K.p(t, 20.2) });
    K.text('1cqi = 1% of the container width', 830, 502, { size: 18, color: P.acc, a: K.p(t, 21.8) });
  } },

/* 4 ─ clamp and viewport units */
{ d: 26, title: 'clamp() and units',
  caps: [
    [0.3, 'clamp takes a minimum, a preferred value and a maximum. Fluid type grows with the viewport, within limits.'],
    [7, 'Below 400 pixels it holds the minimum, in the middle it scales with 2vw, and from 1200 pixels it stops at the maximum.'],
    [14, 'Keep a rem term in the middle value. Pure vw ignores browser zoom and the user\'s font size, an accessibility failure.'],
    [20, 'On phones, 100vh can hide behind the browser bars. svh is the small viewport height; dvh follows the bars as they move.']],
  draw: function (K, t) {
    var P = K.P, ga = K.p(t, 0.6);
    function X(v) { return 90 + (v - 320) / 1280 * 520; } function Y(s) { return 390 - (s - 16) / 28 * 270; }
    K.box(90, 118, 2, 274, { fill: P.muted, r: 0, a: ga }); K.box(90, 390, 524, 2, { fill: P.muted, r: 0, a: ga });
    K.text('font-size', 100, 104, { size: 16, color: P.muted, a: ga });
    K.text('viewport width', 610, 414, { size: 16, color: P.muted, align: 'right', a: ga });
    [[400, '400'], [1200, '1200']].forEach(function (m) { K.text(m[1], X(m[0]), 414, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 7.4) }); });
    K.text('24px', 82, Y(24), { size: 16, mono: true, color: P.muted, align: 'right', a: K.p(t, 7.4) });
    K.text('40px', 82, Y(40), { size: 16, mono: true, color: P.muted, align: 'right', a: K.p(t, 7.4) });
    var pts = [[320, 24], [400, 24], [1200, 40], [1600, 40]], dp = K.p(t, 2, 2.4);
    var g = K.g; g.save(); g.globalAlpha *= ga; g.strokeStyle = P.acc; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath();
    var total = 3, seg = dp * total;
    for (var i = 0; i < 3; i++) { if (seg <= 0) break; var u = Math.min(1, seg); seg -= 1;
      var a = pts[i], b = pts[i + 1]; if (i === 0) g.moveTo(X(a[0]), Y(a[1])); g.lineTo(X(lerp(a[0], b[0], u)), Y(lerp(a[1], b[1], u))); }
    g.stroke(); g.restore();
    var hl = [[7.6, 0], [9.2, 1], [10.8, 2]];
    hl.forEach(function (h) { var a = pts[h[1]], b = pts[h[1] + 1], q = K.win(t, h[0], h[0] + 1.6);
      if (q > 0) K.arrow(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), { color: P.warm, a: q, lw: 6, head: 1 }); });
    var v = 960 - 560 * Math.cos(Math.max(0, t - 4) * 0.45), fs = Math.max(24, Math.min(40, 16 + 0.02 * v)), da = K.p(t, 4.4);
    g.save(); g.globalAlpha *= da; g.fillStyle = P.warm; g.beginPath(); g.arc(X(v), Y(fs), 9, 0, 7); g.fill(); g.restore();
    var C = ['font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem);'];
    K.panel(660, 80, 580, 66, '', { a: K.p(t, 0.3) });
    K.code(C, 682, 100, { size: 19, n: K.typed(t, C, [0.5], 40), t: t, a: K.p(t, 0.3) });
    K.text('Heading', 680, 220, { size: fs * 1.4, weight: 800, a: da });
    K.text('viewport ' + Math.round(v) + 'px  →  ' + Math.round(fs) + 'px', 680, 290, { size: 18, mono: true, color: P.warm, a: da });
    K.mark(694, 340, true, 0.75, K.p(t, 14.4));
    K.text('1rem + 2vw: grows with zoom', 720, 340, { size: 18, a: K.p(t, 14.4) });
    K.mark(694, 380, false, 0.75, K.p(t, 15.8));
    K.text('4vw alone: zoom does nothing', 720, 380, { size: 18, color: P.red, a: K.p(t, 15.8) });
    /* phones */
    var pa = K.p(t, 20.2), pb = K.p(t, 21.6);
    [[120, pa, '100vh', P.red, 'hidden under the bar'], [440, pb, '100svh', P.green, 'fits the small viewport']].forEach(function (p) {
      var x = p[0], a = p[1];
      K.box(x, 432, 104, 148, { fill: P.card, stroke: P.line, r: 14, a: a });
      K.box(x + 8, 444, 88, 16, { fill: P.code, r: 4, a: a });
      K.box(x + 8, 552, 88, 18, { fill: P.code, r: 4, a: a });
      K.box(x + 12, 464, 80, p[2] === '100vh' ? 112 : 84, { fill: 'rgba(79,209,197,.2)', stroke: p[3], r: 4, a: a });
      K.text(p[2], x + 120, 480, { size: 19, mono: true, weight: 700, color: p[3], a: a });
      K.text(p[4], x + 120, 510, { size: 16, color: P.muted, a: a });
    });
    K.text('dvh: follows the bars', 840, 495, { size: 18, mono: true, color: P.blue, a: K.p(t, 23) });
  } },

/* 5 ─ logical properties */
{ d: 21, title: 'Logical properties',
  caps: [
    [0.3, 'Logical properties say start and end instead of left and right: margin-inline-start, padding-block, inset-inline-end.'],
    [7, 'Switch the page to Arabic or Hebrew with dir rtl, and every logical spacing flips automatically.'],
    [13.5, 'inline-size and block-size follow the writing direction too, so one stylesheet works for every language.']],
  draw: function (K, t) {
    var P = K.P, f = K.p(t, 8.4, 1), ca = K.p(t, 0.6);
    K.text(f > 0.5 ? 'dir="rtl"' : 'dir="ltr"', 240, 112, { size: 20, mono: true, weight: 700, color: f > 0.5 ? P.warm : P.acc, a: ca });
    K.box(240, 140, 800, 140, { fill: P.card, stroke: P.line, a: ca });
    var bx = lerp(240, 1036, f);
    K.box(bx, 140, 4, 140, { fill: P.acc, r: 0, a: ca });
    var px = lerp(244, 976, f);
    K.box(px, 144, 60, 132, { fill: 'rgba(104,211,145,.16)', r: 0, a: K.p(t, 1.6) });
    var ix = lerp(330, 950, f);
    K.g.save(); K.g.globalAlpha *= ca; K.g.fillStyle = P.warm; K.g.beginPath(); K.g.arc(ix, 210, 28, 0, 7); K.g.fill(); K.g.restore();
    var tw = 520, tx = lerp(390, 890 - tw, f);
    [0, 1, 2].forEach(function (i) { var w = tw * (i === 2 ? 0.6 : 1); K.box(f > 0.5 ? tx + tw - w : tx, 178 + i * 26, w, 10, { fill: i ? P.muted : P.ink, r: 4, a: ca }); });
    K.text('inline-start', lerp(250, 1030, f), 300, { size: 16, mono: true, color: P.green, align: f > 0.5 ? 'right' : 'left', a: K.p(t, 1.6) });
    K.arrow(240, 320, 1040, 320, { p: K.p(t, 13.8, 0.8), color: P.blue, a: 1 });
    K.text('inline-size', 640, 342, { size: 17, mono: true, color: P.blue, align: 'center', a: K.p(t, 14.2) });
    K.arrow(210, 140, 210, 280, { p: K.p(t, 15, 0.6), color: P.purple });
    K.text('block-size', 196, 210, { size: 17, mono: true, color: P.purple, align: 'right', a: K.p(t, 15.4) });
    var C = ['.media {', '  padding-inline-start: 4rem;    /* left in LTR, right in RTL */', '  border-inline-start: 4px solid;', '  margin-block: 1rem;   inline-size: 50rem;', '}'];
    K.panel(240, 372, 800, 180, 'media.css', { a: K.p(t, 1) });
    K.code(C, 264, 410, { size: 18, lh: 1.5, n: K.typed(t, C, [1.2, 1.6, 3, 4, 5], 44), t: t, w: 770, a: K.p(t, 1), hi: t > 13.8 ? 3 : t > 7.2 ? 1 : -1 });
  } },

/* 6 ─ custom properties */
{ d: 26, title: 'Custom properties',
  caps: [
    [0.3, 'Custom properties are variables that live in the cascade. Define them once, and read them with var().'],
    [6.5, 'They inherit at runtime. Override one on a section, or change it from JavaScript, and everything below repaints.'],
    [13.5, 'The fallback in var() is used only when the property is undefined. An invalid value makes the declaration unset, not skipped.'],
    [20.5, '@property registers a typed property with a syntax and an initial value, so the browser can even animate it.']],
  draw: function (K, t) {
    var P = K.P, promo = K.p(t, 7.4, 0.5), js = K.p(t, 10.6, 0.5);
    var C = [':root  { --brand: teal; }', '.btn   { background: var(--brand); }', '.promo { --brand: orange; }', 'root.style.setProperty("--brand", "purple");'];
    K.panel(40, 80, 620, 196, 'tokens.css', { a: K.p(t, 0.2) });
    K.code(C, 62, 124, { size: 18, lh: 1.6, n: K.typed(t, C, [0.6, 1.8, 7, 10], 40), t: t, w: 590, a: K.p(t, 0.2) });
    var rc = js > 0.5 ? P.purple : P.acc, pc = promo > 0.5 ? P.warm : rc;
    var ra = K.p(t, 2.6);
    K.box(700, 80, 540, 300, { fill: P.code, stroke: rc, a: ra });
    K.text(':root  --brand: ' + (js > 0.5 ? 'purple' : 'teal'), 720, 104, { size: 17, mono: true, color: rc, a: ra });
    [0, 1, 2].forEach(function (i) { K.box(720 + i * 170, 130, 150, 50, { fill: rc, r: 10, a: K.p(t, 3 + i * 0.3) });
      K.text('Button', 795 + i * 170, 155, { size: 18, weight: 700, color: P.bg, align: 'center', a: K.p(t, 3 + i * 0.3) }); });
    var sa = K.p(t, 6.8);
    K.box(720, 204, 500, 156, { fill: P.card, stroke: pc, a: sa });
    K.text('.promo' + (promo > 0.5 ? '  --brand: orange' : ''), 740, 228, { size: 17, mono: true, color: pc, a: sa });
    [0, 1].forEach(function (i) { K.box(740 + i * 230, 260, 200, 60, { fill: pc, r: 10, a: sa });
      K.text('Buy', 840 + i * 230, 290, { size: 19, weight: 700, color: P.bg, align: 'center', a: sa }); });
    var F = ['color: var(--accent, blue);    /* undefined → blue */', '--size: red;  width: var(--size); /* invalid → unset */'];
    K.panel(40, 300, 620, 96, '', { a: K.p(t, 13.6) });
    K.code(F, 62, 318, { size: 17, lh: 1.6, n: K.typed(t, F, [13.8, 16.4], 40), t: t, a: K.p(t, 13.6) });
    K.text('fallback ≠ error handling', 700, 420, { size: 18, color: P.warm, a: K.p(t, 17.6) });
    var R = ['@property --angle {', '  syntax: "<angle>"; inherits: false; initial-value: 0deg;', '}'];
    K.panel(40, 444, 960, 132, '', { a: K.p(t, 20.6) });
    K.code(R, 62, 462, { size: 18, lh: 1.6, n: K.typed(t, R, [20.8, 21.4, 23], 44), t: t, a: K.p(t, 20.6) });
    var da = K.p(t, 22.6), ang = Math.max(0, t - 22.6) * 2.2, g = K.g;
    g.save(); g.globalAlpha *= da; g.strokeStyle = P.line; g.lineWidth = 8; g.beginPath(); g.arc(1120, 510, 50, 0, 7); g.stroke();
    g.strokeStyle = P.acc; g.beginPath(); g.arc(1120, 510, 50, -Math.PI / 2, -Math.PI / 2 + ang % (Math.PI * 2)); g.stroke(); g.restore();
    K.text('--angle', 1120, 510, { size: 16, mono: true, color: P.acc, align: 'center', a: da });
  } },

/* 7 ─ :has and nesting */
{ d: 25, title: ':has() and nesting',
  caps: [
    [0.3, ':has() selects an element by what it contains. Finally, a parent selector.'],
    [5.5, 'A field turns red when it has an invalid input inside. No JavaScript involved.'],
    [11.5, 'A card that has an image gets two columns. A page that has an open dialog can stop scrolling.'],
    [17.5, 'Native nesting groups a component\'s rules. The ampersand means the parent selector; it is not Sass string gluing.']],
  draw: function (K, t) {
    var P = K.P, bad = K.p(t, 7.6, 0.3);
    K.text('.field:has(:user-invalid) { color: red; }', 40, 98, { size: 18, mono: true, color: P.acc, a: K.p(t, 0.6) });
    var fa = K.p(t, 1);
    K.box(40, 120, 580, 120, { fill: P.card, stroke: bad > 0.5 ? P.red : P.line, lw: bad > 0.5 ? 3 : 2, a: fa });
    K.text('Email', 62, 148, { size: 19, weight: 600, color: bad > 0.5 ? P.red : P.ink, a: fa });
    K.box(62, 168, 380, 48, { fill: P.code, stroke: bad > 0.5 ? P.red : P.line, r: 8, a: fa });
    K.text('ana@'.slice(0, Math.max(0, Math.floor((t - 6.4) * 4))), 78, 192, { size: 19, mono: true, a: fa });
    K.text('the parent reacts', 460, 192, { size: 16, color: P.red, a: bad });
    K.text('.card:has(img) { grid-template-columns: 8rem 1fr; }', 660, 98, { size: 16, mono: true, color: P.acc, a: K.p(t, 11.6) });
    var ca = K.p(t, 12);
    K.box(660, 120, 580, 110, { fill: P.card, stroke: P.blue, a: ca });
    pic(K, 672, 132, 120, 86, ca);
    K.text('has img: 2 columns', 810, 160, { size: 18, weight: 700, a: ca });
    bars(K, 810, 186, 400, 2, 18, ca, P.muted);
    K.box(660, 240, 580, 80, { fill: P.card, stroke: P.line, a: K.p(t, 12.6) });
    K.text('no img: 1 column', 680, 266, { size: 18, weight: 700, a: K.p(t, 12.6) });
    bars(K, 680, 290, 540, 1, 18, K.p(t, 12.6), P.muted);
    K.text('body:has(dialog[open]) { overflow: hidden; }', 40, 290, { size: 17, mono: true, color: P.purple, a: K.p(t, 14.4) });
    var N = ['.card {', '  padding: 1rem;', '  & h3 { margin: 0; }', '  &:hover { outline: 2px solid; }', '  @media (width > 40rem) { padding: 2rem; }', '}'];
    K.panel(40, 344, 700, 232, 'card.css', { a: K.p(t, 17.6) });
    K.code(N, 62, 386, { size: 18, lh: 1.5, n: K.typed(t, N, [17.8, 18.2, 18.8, 19.6, 20.4, 21.4], 40), t: t, w: 670, a: K.p(t, 17.6) });
    K.mark(790, 400, true, 0.75, K.p(t, 19.4));
    K.text('& h3  →  .card h3', 816, 400, { size: 18, mono: true, a: K.p(t, 19.4) });
    K.mark(790, 446, true, 0.75, K.p(t, 20.4));
    K.text('media queries nest too', 816, 446, { size: 18, a: K.p(t, 20.4) });
    K.mark(790, 492, false, 0.75, K.p(t, 22.2));
    K.text('&__title  ≠  .card__title', 816, 492, { size: 18, mono: true, color: P.red, a: K.p(t, 22.2) });
    K.text('& is a selector, not text to glue', 816, 528, { size: 16, color: P.muted, a: K.p(t, 22.8) });
  } },

/* 8 ─ colour functions */
{ d: 26, title: 'Modern colour',
  caps: [
    [0.3, 'oklch describes a colour by lightness, chroma and hue. Equal lightness really looks equally light, unlike HSL.'],
    [7, 'color-mix blends two colours in a chosen space. Mix the brand with white or black for tints and shades.'],
    [13.5, 'Relative colour syntax derives new colours: start from the brand and lower its lightness for a hover state.'],
    [19.5, 'light-dark() picks the first value in light mode and the second in dark mode, once color-scheme is set.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('hsl(h 100% 50%)', 40, 126, { size: 18, mono: true, color: P.muted, a: K.p(t, 0.6) });
    ['#ff0000', '#ffff00', '#00ff00', '#0000ff'].forEach(function (c, i) { swatch(K, 260 + i * 100, 96, 88, 60, c, K.p(t, 1 + i * 0.2)); });
    K.text('oklch(70% 0.12 h)', 40, 206, { size: 18, mono: true, color: P.acc, a: K.p(t, 2.4) });
    ['#d7837c', '#b0a35a', '#4fb3a3', '#7aa2e0'].forEach(function (c, i) { swatch(K, 260 + i * 100, 176, 88, 60, c, K.p(t, 2.8 + i * 0.2)); });
    K.mark(680, 126, false, 0.75, K.p(t, 4.4)); K.text('same "50%", very different brightness', 706, 126, { size: 18, color: P.red, a: K.p(t, 4.4) });
    K.mark(680, 206, true, 0.75, K.p(t, 5.4)); K.text('same L, same perceived lightness', 706, 206, { size: 18, color: P.green, a: K.p(t, 5.4) });
    K.text('color-mix(in oklch, var(--brand), white 30%)', 40, 286, { size: 18, mono: true, color: P.acc, a: K.p(t, 7.2) });
    var M = [['#20544f', 'black 60%'], ['#37928a', 'black 30%'], ['#4fd1c5', 'brand'], ['#83ded6', 'white 30%'], ['#b9ede8', 'white 60%']];
    M.forEach(function (m, i) { var q = K.p(t, 8.4 + Math.abs(i - 2) * 0.5); swatch(K, 260 + i * 140, 310, 124, 56, m[0], q);
      K.text(m[1], 322 + i * 140, 384, { size: 16, color: P.muted, align: 'center', a: q }); });
    var R = ['--hover: oklch(from var(--brand) calc(l - 0.1) c h);'];
    K.panel(40, 416, 600, 56, '', { a: K.p(t, 13.6) });
    K.code(R, 58, 432, { size: 16, n: K.typed(t, R, [13.8], 40), t: t, a: K.p(t, 13.6) });
    var hv = K.win(t, 16, 17.6) + K.win(t, 18.4, 19.6);
    K.box(60, 494, 160, 56, { fill: hv > 0.5 ? '#2fb3a8' : P.acc, r: 10, a: K.p(t, 15) });
    K.text(hv > 0.5 ? 'hover' : 'Buy', 140, 522, { size: 19, weight: 700, color: P.bg, align: 'center', a: K.p(t, 15) });
    K.text('no hand-picked hover colour', 250, 522, { size: 17, color: P.muted, a: K.p(t, 16.4) });
    var L = ['color-scheme: light dark;', 'background: light-dark(#fff, #111);'];
    K.panel(680, 416, 560, 70, '', { a: K.p(t, 19.6) });
    K.code(L, 700, 426, { size: 16, lh: 1.5, n: K.typed(t, L, [19.8, 20.6], 40), t: t, a: K.p(t, 19.6) });
    var dark = Math.floor(Math.max(0, t - 21.6) / 1.6) % 2 === 1, la = K.p(t, 21.4);
    K.box(680, 500, 560, 76, { fill: dark ? '#111111' : '#f4f7fa', stroke: P.line, a: la });
    K.text(dark ? 'dark mode' : 'light mode', 704, 538, { size: 20, weight: 700, color: dark ? '#e6edf5' : '#111111', a: la });
    K.text('one declaration, both themes', 1220, 538, { size: 16, color: dark ? '#93a4b8' : '#4a5a6c', align: 'right', a: la });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 59 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Intrinsic first; media queries in rem for the page',
     'Container queries and cqi for components',
     'clamp() with a rem term; svh and dvh on phones',
     'Logical properties: start and end, not left and right',
     'Custom properties cascade live; @property types them',
     ':has(), native nesting, oklch, color-mix, light-dark()'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 59 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
