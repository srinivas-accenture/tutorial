/* Day 56 in motion: semantic HTML (skeleton, landmarks, headings, native elements), forms and images. Loaded on demand by assets/js/motion.js. */
(function () {
  /* grey "text" bars inside page mock-ups */
  function bars(K, x, y, w, n, gap, a, col) {
    for (var i = 0; i < n; i++) K.box(x, y + i * gap, w * (i % 3 === 2 ? 0.62 : 1), 8, { fill: col || K.P.line, r: 4, a: a });
  }
  /* mouse pointer */
  function cursor(K, x, y, a) {
    var g = K.g; if (a <= 0) return;
    g.save(); g.globalAlpha *= K.clamp(a); g.fillStyle = K.P.ink; g.strokeStyle = K.P.bg; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.lineTo(x + 7, y + 19); g.lineTo(x + 17, y + 19); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  /* a landmark region in the page wireframe */
  function region(K, x, y, w, h, tag, role, col, a, ra, glow, below) {
    var P = K.P;
    K.box(x, y, w, h, { fill: glow > 0 ? 'rgba(79,209,197,' + (0.16 * glow).toFixed(3) + ')' : P.card, stroke: col, a: a, lw: 2 + glow * 2 });
    K.text(tag, x + 16, y + 24, { size: 18, mono: true, color: col, a: a });
    K.text(role, below ? x + 16 : x + 26 + tag.length * 9.9, below ? y + 52 : y + 24, { size: 16, color: P.muted, a: ra });
  }
  /* small image placeholder (sky + hill) */
  function pic(K, x, y, w, h, a, col) {
    var g = K.g, P = K.P; if (a <= 0) return;
    K.box(x, y, w, h, { fill: '#1d3347', stroke: col || P.blue, r: 6, a: a });
    g.save(); g.globalAlpha *= K.clamp(a); g.fillStyle = 'rgba(104,211,145,.55)';
    g.beginPath(); g.moveTo(x + 4, y + h - 4); g.lineTo(x + w * 0.38, y + h * 0.45); g.lineTo(x + w * 0.6, y + h * 0.7); g.lineTo(x + w * 0.78, y + h * 0.5); g.lineTo(x + w - 4, y + h - 4); g.closePath(); g.fill();
    g.fillStyle = 'rgba(246,173,85,.85)'; g.beginPath(); g.arc(x + w * 0.78, y + h * 0.26, Math.min(w, h) * 0.09, 0, 7); g.fill(); g.restore();
  }

JSC.motion.define('day56', {
  kicker: 'JavaScript: Zero to Architect · Day 56',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 56: HTML that means something, for browsers, screen readers, search engines and every device.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Semantic HTML', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 56 · Structure that means something', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Landmarks and headings', 'Native elements', 'Forms and images'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 340 + i * 300, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ document skeleton */
{ d: 24, title: 'The document skeleton',
  caps: [
    [0.3, 'Every page starts with the same skeleton. The doctype puts the browser in standards mode, not quirks mode.'],
    [6.5, 'lang on the html element tells screen readers how to pronounce the text, and drives translation and hyphenation.'],
    [12, 'In the head, charset utf-8 comes first, then the viewport meta, so phones lay out at the real device width.'],
    [18, 'A unique title names the tab, the bookmark and the search result. The body holds everything users see.']],
  draw: function (K, t) {
    var P = K.P;
    var L = ['<!DOCTYPE html>', '<html lang="en">', '<head>', '  <meta charset="utf-8">', '  <meta name="viewport"',
             '    content="width=device-width, initial-scale=1">', '  <title>Trail Pro | Shop</title>', '</head>', '<body> … </body>', '</html>'];
    var hi = t > 19.4 ? 8 : t > 18.2 ? 6 : t > 13.4 ? 4 : t > 12.2 ? 3 : t > 6.6 ? 1 : t > 1 ? 0 : -1;
    K.panel(40, 80, 640, 360, 'index.html', { a: K.p(t, 0.2) });
    K.code(L, 66, 128, { size: 20, lh: 1.5, n: K.typed(t, L, [0.8, 6.6, 12.2, 12.4, 13.4, 14, 18.2, 19, 19.4, 19.9], 32), t: t, hi: hi, w: 616, a: K.p(t, 0.2) });
    /* doctype */
    var d1 = K.p(t, 1.8);
    K.mark(740, 104, true, 0.8, d1); K.text('standards mode, not quirks mode', 766, 104, { size: 20, a: d1 });
    /* lang */
    var l1 = K.back((t - 7.2) / 0.6);
    if (l1 > 0) K.chip('lang="en"', 790, 158, { s: l1, mono: true, size: 18, stroke: P.blue });
    K.text('voice · translation · hyphens', 870, 158, { size: 19, color: P.muted, a: K.p(t, 8.4) });
    K.text('charset first: utf-8 covers every language', 720, 208, { size: 19, color: P.muted, a: K.p(t, 12.6) });
    /* two phones */
    var pa = K.p(t, 13.6), pb = K.p(t, 15.2);
    K.box(740, 236, 170, 236, { fill: P.card, stroke: P.red, r: 22, a: pa });
    K.box(752, 258, 146, 192, { fill: P.code, r: 6, a: pa });
    K.box(760, 268, 130, 8, { fill: P.muted, r: 3, a: pa * 0.8 });
    bars(K, 760, 284, 128, 18, 9, pa);
    K.text('no viewport: tiny 980px page', 825, 494, { size: 16, color: P.red, align: 'center', a: pa });
    K.box(1010, 236, 170, 236, { fill: P.card, stroke: P.green, r: 22, a: pb });
    K.box(1022, 258, 146, 192, { fill: P.code, r: 6, a: pb });
    K.text('Trail Pro', 1034, 282, { size: 20, weight: 700, a: pb });
    bars(K, 1034, 310, 120, 6, 22, pb, P.muted);
    K.text('width=device-width', 1095, 494, { size: 16, color: P.green, align: 'center', a: pb });
    /* title: tab + search result */
    var tb = K.p(t, 18.6), sr = K.p(t, 19.6);
    K.box(40, 470, 300, 54, { fill: P.card, stroke: P.acc, r: 10, a: tb });
    K.box(58, 489, 16, 16, { fill: P.acc, r: 4, a: tb });
    K.text('Trail Pro | Shop', 86, 497, { size: 19, a: tb });
    K.text('×', 320, 497, { size: 20, color: P.muted, align: 'center', a: tb });
    K.text('browser tab', 190, 548, { size: 16, color: P.muted, align: 'center', a: tb });
    K.box(370, 464, 310, 72, { fill: P.code, stroke: P.line, r: 8, a: sr });
    K.text('Trail Pro | Shop', 388, 488, { size: 20, color: P.blue, a: sr });
    K.text('shop.example › shoes', 388, 516, { size: 16, color: P.green, a: sr });
    K.text('search result', 525, 558, { size: 16, color: P.muted, align: 'center', a: sr });
  } },

/* 3 ─ landmarks */
{ d: 26, title: 'Landmarks',
  caps: [
    [0.3, 'Landmark elements split the page into regions with a known job, like the parts of a book.'],
    [5.5, 'header is the banner, nav is navigation, main is the one main content, aside is complementary, footer is contentinfo.'],
    [13, 'Screen reader users jump straight from landmark to landmark, the way you scan a page with your eyes.'],
    [19, 'Careful: a header or footer inside an article or section is just that part\'s header, not a page landmark.']],
  draw: function (K, t) {
    var P = K.P;
    var hop = t > 14 && t < 19.4 ? Math.floor((t - 14) / 1.05) : -1;
    function glow(i) { return hop === i ? K.clamp(((t - 14) - i * 1.05) / 0.25) : 0; }
    region(K, 60, 84, 580, 70, '<header>', 'banner', P.blue, K.p(t, 0.6), K.p(t, 6), glow(0));
    var nv = K.p(t, 1.1);
    K.box(380, 97, 244, 44, { fill: glow(1) > 0 ? 'rgba(79,209,197,.18)' : P.code, stroke: P.purple, r: 10, a: nv, lw: 2 + glow(1) * 2 });
    K.text('<nav>', 396, 119, { size: 18, mono: true, color: P.purple, a: nv });
    K.text('navigation', 466, 119, { size: 16, color: P.muted, a: K.p(t, 7.4) });
    region(K, 60, 168, 420, 330, '<main>', 'main', P.acc, K.p(t, 1.6), K.p(t, 8.6), glow(2));
    region(K, 494, 168, 146, 330, '<aside>', 'complementary', P.warm, K.p(t, 2.1), K.p(t, 9.8), glow(3), true);
    region(K, 60, 512, 580, 62, '<footer>', 'contentinfo', P.green, K.p(t, 2.6), K.p(t, 11.2), glow(4));
    K.box(80, 206, 220, 12, { fill: P.ink, r: 5, a: K.p(t, 2.2) * 0.7 });
    bars(K, 510, 250, 112, 6, 22, K.p(t, 2.6));
    /* article with its own header / footer */
    var ar = K.p(t, 19.3);
    bars(K, 80, 240, 380, 7, 30, K.p(t, 2.2) * (1 - ar));
    K.box(78, 232, 384, 254, { fill: P.code, stroke: P.line, a: ar });
    K.text('<article>', 94, 250, { size: 16, mono: true, color: P.muted, a: ar });
    var hx = K.p(t, 20.2), fx = K.p(t, 21);
    K.box(94, 266, 352, 40, { fill: P.card, stroke: P.warm, r: 8, a: hx, dash: [6, 5] });
    K.text('<header>', 108, 286, { size: 16, mono: true, color: P.warm, a: hx });
    K.text('not a landmark', 432, 286, { size: 16, color: P.warm, align: 'right', a: hx });
    bars(K, 100, 324, 330, 3, 24, ar);
    K.box(94, 432, 352, 40, { fill: P.card, stroke: P.warm, r: 8, a: fx, dash: [6, 5] });
    K.text('<footer>', 108, 452, { size: 16, mono: true, color: P.warm, a: fx });
    K.text('not a landmark', 432, 452, { size: 16, color: P.warm, align: 'right', a: fx });
    /* screen reader landmark list */
    var sp = K.p(t, 13.2);
    K.panel(700, 84, 540, 330, 'Screen reader · Landmarks', { a: sp });
    var R = [['banner', P.blue], ['navigation', P.purple], ['main', P.acc], ['complementary', P.warm], ['contentinfo', P.green]];
    R.forEach(function (r, i) {
      var y = 146 + i * 52, q = K.p(t, 13.6 + i * 0.2, 0.4);
      if (hop === i) K.box(720, y - 22, 500, 44, { fill: 'rgba(79,209,197,.16)', stroke: P.acc, r: 8, a: q });
      K.g.save(); K.g.globalAlpha *= q; K.g.fillStyle = r[1]; K.g.beginPath(); K.g.arc(744, y, 7, 0, 7); K.g.fill(); K.g.restore();
      K.text(r[0], 764, y, { size: 21, a: q });
      K.text('landmark', 1200, y, { size: 16, color: P.muted, align: 'right', a: q });
    });
    var nt = K.p(t, 21.6);
    K.box(700, 440, 540, 134, { fill: 'rgba(246,173,85,.08)', stroke: P.warm, a: nt });
    K.text('Inside article, section, main, aside, nav:', 722, 474, { size: 19, a: nt });
    K.text('header and footer are plain groups', 722, 508, { size: 19, color: P.warm, a: nt });
    K.text('only the page-level ones are landmarks', 722, 542, { size: 19, color: P.muted, a: nt });
  } },

/* 4 ─ headings */
{ d: 22, title: 'Headings outline',
  caps: [
    [0.3, 'Headings are the table of contents. One h1 for the page title, h2 for sections, h3 inside those.'],
    [7, 'Never skip a level for looks. Jumping from h2 to h4 leaves a hole in the outline. Change the size with CSS instead.'],
    [14, 'Many screen reader users move by headings first, so this outline is how they read your page.']],
  draw: function (K, t) {
    var P = K.P, fix = K.p(t, 11.2, 0.6);
    var L = ['<h1>Trail Pro</h1>', '  <h2>Specs</h2>', '    <h3>Sizes</h3>', '  <h2>Reviews</h2>', fix > 0.5 ? '    <h3>Top review</h3>' : '    <h4>Top review</h4>'];
    var hi = t > 8 && t < 14 ? 4 : -1;
    K.panel(40, 80, 560, 250, 'product.html', { a: K.p(t, 0.2) });
    K.code(L, 66, 128, { size: 22, lh: 1.6, n: K.typed(t, L, [0.8, 2, 3, 4, 7.4], 30), t: t, hi: hi, w: 530, a: K.p(t, 0.2),
      marks: t > 8.2 && fix < 0.5 ? { 4: 'rgba(252,129,129,.2)' } : null });
    var N = [['h1', 'Trail Pro', 0, 1.2], ['h2', 'Specs', 1, 2.3], ['h3', 'Sizes', 2, 3.3], ['h2', 'Reviews', 1, 4.3], ['h4', 'Top review', 3, 7.8]];
    var hop = t > 14.6 && t < 21.6 ? Math.floor((t - 14.6) / 1.2) % 5 : -1;
    N.forEach(function (n, i) {
      var lvl = n[2], col = i === 0 ? P.acc : P.blue, q = K.back((t - n[3]) / 0.5), lab = n[0] + ' · ' + n[1];
      if (i === 4) { lvl = 3 - fix; col = fix > 0.5 ? P.green : P.red; lab = (fix > 0.5 ? 'h3' : 'h4') + ' · ' + n[1]; }
      if (q <= 0) return;
      var x = 700 + lvl * 80, y = 100 + i * 78;
      if (i) { var pi = [0, 0, 1, 0, 3][i], px = 700 + N[pi][2] * 80 + 24, py = 100 + pi * 78 + 24;
        K.box(px, py, 3, y - py, { fill: P.line, r: 1, a: K.clamp(q) });
        K.box(px, y - 1, x - px, 3, { fill: P.line, r: 1, a: K.clamp(q) }); }
      K.box(x, y - 24, 280, 48, { fill: hop === i ? 'rgba(79,209,197,.2)' : P.card, stroke: col, a: K.clamp(q), lw: hop === i ? 4 : 2 });
      K.text(lab, x + 18, y, { size: 21, mono: true, color: P.ink, a: K.clamp(q) });
    });
    var gh = K.p(t, 8.4) * (1 - fix);
    K.box(860, 392, 66, 40, { fill: false, stroke: P.red, dash: [6, 6], r: 8, a: gh });
    K.text('?', 893, 412, { size: 20, weight: 700, color: P.red, align: 'center', a: gh });
    K.text('h3 missing: a hole in the outline', 860, 462, { size: 18, color: P.red, a: gh });
    K.mark(1170, 412, true, 0.8, K.p(t, 11.8));
    K.text('fixed: h3', 1196, 412, { size: 16, color: P.green, a: K.p(t, 11.8) });
    K.text('need smaller text? use CSS font-size,', 60, 372, { size: 19, color: P.muted, a: K.p(t, 9.6) });
    K.text('not a lower heading level', 60, 402, { size: 19, color: P.muted, a: K.p(t, 9.6) });
    var hk = K.back((t - 14.4) / 0.5);
    if (hk > 0) K.chip('H', 90, 500, { s: hk, size: 26, weight: 800, mono: true, stroke: P.acc });
    K.text('screen reader: H jumps to the next heading', 130, 500, { size: 20, a: K.p(t, 14.8) });
    K.text('the outline is the page, for them', 130, 540, { size: 18, color: P.muted, a: K.p(t, 16.5) });
  } },

/* 5 ─ native elements */
{ d: 26, title: 'Native elements first',
  caps: [
    [0.3, 'A div with a click handler can look exactly like a button. It is not one.'],
    [5, 'A real button is focusable, works with Enter and Space, has the button role and can submit its form. All for free.'],
    [12.5, 'Other native elements do real work too: details and summary toggle, and dialog with showModal opens in the top layer.'],
    [19.5, 'ARIA adds meaning, never behaviour. The first rule of ARIA: use the native element when one exists.']],
  draw: function (K, t) {
    var P = K.P, c1 = ['<div class="btn" onclick="buy()">Buy</div>'], c2 = ['<button onclick="buy()">Buy</button>'];
    K.panel(40, 80, 580, 70, '', { a: K.p(t, 0.2) });
    K.code(c1, 62, 104, { size: 18, n: K.typed(t, c1, [0.5], 40), t: t, a: K.p(t, 0.2) });
    K.panel(660, 80, 580, 70, '', { a: K.p(t, 5) });
    K.code(c2, 682, 104, { size: 18, n: K.typed(t, c2, [5.2], 40), t: t, a: K.p(t, 5) });
    var fb = K.p(t, 1.8), rb = K.p(t, 6.2), fade = 1 - K.p(t, 19.6, 0.6) * 0.85, foc = K.p(t, 7.4, 0.3);
    K.box(260, 172, 140, 48, { fill: P.acc, r: 8, a: fb });
    K.text('Buy', 330, 196, { size: 20, weight: 700, color: P.bg, align: 'center', a: fb });
    K.box(880, 172, 140, 48, { fill: P.acc, r: 8, a: rb });
    K.text('Buy', 950, 196, { size: 20, weight: 700, color: P.bg, align: 'center', a: rb });
    K.box(874, 166, 152, 60, { fill: false, stroke: P.warm, r: 11, lw: 3, a: foc });
    K.text('looks the same', 640, 196, { size: 18, color: P.muted, align: 'center', a: K.p(t, 2.6) * K.p(t, 6.2) });
    var R = ['Tab focus', 'Enter and Space', 'role: button', 'submits its form', 'disabled works'];
    R.forEach(function (r, i) {
      var y = 262 + i * 38, q = K.p(t, 6.6 + i * 1.1, 0.4) * fade;
      K.text(r, 640, y, { size: 20, align: 'center', a: q });
      K.mark(330, y, false, 0.75, q); K.mark(950, y, true, 0.75, q);
    });
    /* details + dialog */
    var dt = K.p(t, 13), open = K.p(t, 15, 0.4);
    K.box(40, 452, 580, 46, { fill: P.card, stroke: P.purple, r: 8, a: dt });
    K.text((open > 0.5 ? '▾' : '▸') + '  Shipping', 60, 475, { size: 20, a: dt });
    K.text('<details>', 604, 475, { size: 16, mono: true, color: P.muted, align: 'right', a: dt });
    K.box(40, 504, 580, 46, { fill: P.code, stroke: P.line, r: 8, a: open });
    K.text('Free over $50  (no JavaScript needed)', 60, 527, { size: 18, color: P.muted, a: open });
    cursor(K, 140, 470, K.win(t, 13.8, 15.6));
    var dg = K.p(t, 16.4);
    K.box(660, 444, 580, 140, { fill: 'rgba(0,0,0,.45)', stroke: P.line, r: 10, a: dg });
    K.text('dialog.showModal()', 678, 466, { size: 16, mono: true, color: P.muted, a: dg });
    K.text('top layer', 678, 494, { size: 16, color: P.muted, a: dg });
    var dc = K.back((t - 17) / 0.5);
    if (dc > 0) { K.g.save(); K.g.translate(1030, 514); K.g.scale(dc, dc);
      K.box(-150, -48, 300, 96, { fill: P.card, stroke: P.acc, a: K.clamp(dc) });
      K.text('Saved!', -128, -20, { size: 20, weight: 700, a: K.clamp(dc) });
      K.box(50, 2, 80, 34, { fill: P.acc, r: 6, a: K.clamp(dc) }); K.text('OK', 90, 20, { size: 17, weight: 700, color: P.bg, align: 'center', a: K.clamp(dc) });
      K.g.restore(); }
    /* ARIA rule */
    var ar = K.p(t, 20);
    K.box(220, 240, 840, 190, { fill: P.bg, stroke: P.purple, a: ar });
    K.text('ARIA adds meaning, never behaviour', 640, 276, { size: 24, weight: 700, align: 'center', a: ar });
    K.mark(270, 330, false, 0.8, K.p(t, 20.8));
    K.text('<div role="button">: announced, still no focus or keys', 296, 330, { size: 18, mono: true, color: P.red, a: K.p(t, 20.8) });
    K.mark(270, 386, true, 0.8, K.p(t, 22.2));
    K.text('Rule 1: use the native element', 296, 386, { size: 22, color: P.green, a: K.p(t, 22.2) });
  } },

/* 6 ─ forms: labels and types */
{ d: 26, title: 'Forms: labels and types',
  caps: [
    [0.3, 'Every control needs a visible label. Link them with for and id, and clicking the label focuses the input.'],
    [6.5, 'A placeholder is not a label. It vanishes as soon as you type, and it is often too faint to read.'],
    [12, 'Pick the right type, inputmode and autocomplete. Phones show the right keyboard, and browsers can fill it in.'],
    [18.5, 'Group related controls in a fieldset with a legend, like the radio buttons for a delivery option.']],
  draw: function (K, t) {
    var P = K.P;
    var L = ['<label for="em">Email</label>', '<input id="em" name="email"', '       type="email" autocomplete="email">', '',
             '<fieldset>', '  <legend>Delivery</legend>', '  <label><input type="radio" name="ship"', '         value="std"> Standard</label>', '</fieldset>'];
    var hi = t > 18.8 ? 5 : t > 12.3 ? 2 : t > 1 ? 0 : -1;
    K.panel(40, 80, 620, 330, 'checkout.html', { a: K.p(t, 0.2) });
    K.code(L, 64, 126, { size: 19, lh: 1.5, n: K.typed(t, L, [0.8, 1.9, 12.3, 13.8, 18.8, 19.2, 19.9, 21.2, 22.4], 32), t: t, hi: hi, w: 596, a: K.p(t, 0.2) });
    K.text('for="em" matches id="em"', 60, 446, { size: 19, color: P.green, a: K.p(t, 3.6) });
    K.text('type · inputmode · autocomplete', 60, 494, { size: 19, color: P.blue, a: K.p(t, 13) });
    K.text('fieldset + legend: the group gets a name', 60, 542, { size: 19, color: P.purple, a: K.p(t, 19.6) });
    /* label + input */
    var f = K.p(t, 0.8), foc = K.p(t, 3.4, 0.3);
    K.text('Email', 720, 104, { size: 20, weight: 600, a: f });
    K.box(720, 122, 420, 46, { fill: P.code, stroke: foc > 0.5 ? P.acc : P.line, lw: foc > 0.5 ? 3 : 2, r: 8, a: f });
    if (foc > 0.5 && Math.floor(t * 2.5) % 2 === 0) K.box(736, 132, 3, 26, { fill: P.acc, r: 1, a: f });
    cursor(K, 744, 96, K.win(t, 1.6, 5.4));
    K.text('click the label → input focused', 720, 190, { size: 16, color: P.green, a: K.win(t, 3.6, 6.4) });
    /* placeholder only */
    var ph = K.p(t, 6.8), typed = K.p(t, 9, 0.3);
    K.text('placeholder only:', 720, 202, { size: 16, color: P.muted, a: ph });
    K.box(720, 218, 420, 46, { fill: P.code, stroke: typed > 0.5 ? P.red : P.line, r: 8, a: ph });
    K.text('Email', 736, 241, { size: 19, color: '#4a5a6c', a: ph * (1 - typed) });
    var tx = 'ana@ex'.slice(0, Math.max(0, Math.floor((t - 9) * 6)));
    K.text(tx, 736, 241, { size: 19, mono: true, a: ph });
    K.text('…what was this field?', 1150, 286, { size: 16, color: P.red, align: 'right', a: K.p(t, 10.2) });
    /* email keyboard */
    var kb = K.p(t, 13.2);
    K.box(720, 312, 420, 132, { fill: P.card, stroke: P.line, r: 10, a: kb });
    for (var r = 0; r < 3; r++) for (var c = 0; c < 10 - r; c++)
      K.box(732 + r * 18 + c * 40, 322 + r * 30, 34, 24, { fill: P.code, r: 4, a: kb });
    var ks = [['@', 792, 70], ['space', 874, 140], ['.com', 1026, 70]];
    ks.forEach(function (k) {
      K.box(k[1], 412, k[2], 26, { fill: k[0] === 'space' ? P.code : 'rgba(104,211,145,.25)', stroke: k[0] === 'space' ? null : P.green, r: 4, a: kb });
      K.text(k[0], k[1] + k[2] / 2, 425, { size: 16, mono: true, align: 'center', color: k[0] === 'space' ? P.muted : P.green, a: kb });
    });
    var af = K.back((t - 15.4) / 0.5);
    if (af > 0) K.chip('autofill', 1196, 378, { s: af, size: 16, stroke: P.blue });
    /* fieldset */
    var fs = K.p(t, 19), sel = K.p(t, 22.6, 0.3);
    K.box(720, 478, 420, 100, { fill: false, stroke: P.purple, r: 8, a: fs });
    K.box(736, 466, 104, 24, { fill: P.bg, r: 0, a: fs });
    K.text('Delivery', 744, 478, { size: 18, weight: 700, color: P.purple, a: fs });
    [['Standard', 512], ['Express', 552]].forEach(function (o, i) {
      var q = K.p(t, 19.6 + i * 0.4);
      K.g.save(); K.g.globalAlpha *= q; K.g.strokeStyle = P.ink; K.g.lineWidth = 2; K.g.beginPath(); K.g.arc(752, o[1], 10, 0, 7); K.g.stroke();
      if (i === 0 && sel > 0) { K.g.fillStyle = P.acc; K.g.beginPath(); K.g.arc(752, o[1], 5 * sel, 0, 7); K.g.fill(); }
      K.g.restore();
      K.text(o[0], 774, o[1], { size: 19, a: q });
    });
  } },

/* 7 ─ validation and submission */
{ d: 24, title: 'Validation and submission',
  caps: [
    [0.3, 'The browser checks constraints for you: required, type, min, max and pattern. Each input exposes a validity object.'],
    [6.5, 'Style errors with the user-invalid pseudo-class. It waits until the user has interacted, instead of shouting at an empty form.'],
    [12.5, 'On submit, only controls that have a name and are not disabled are sent. FormData collects exactly those.'],
    [18.5, 'Client checks are for comfort. Anyone can bypass them, so always validate again on the server.']],
  draw: function (K, t) {
    var P = K.P, c1 = ['<input name="age" type="number"', '       min="18" required>'];
    K.panel(40, 80, 600, 100, '', { a: K.p(t, 0.2) });
    K.code(c1, 62, 100, { size: 20, lh: 1.5, n: K.typed(t, c1, [0.6, 1.8], 32), t: t, a: K.p(t, 0.2) });
    var inp = K.p(t, 2.8), bad = K.p(t, 8.6, 0.3);
    K.box(60, 196, 220, 50, { fill: P.code, stroke: bad > 0.5 ? P.red : P.line, lw: bad > 0.5 ? 3 : 2, r: 8, a: inp });
    K.text('15', 78, 221, { size: 22, mono: true, a: inp });
    K.text('Must be 18 or older', 300, 221, { size: 19, color: P.red, a: bad });
    var css = [':user-invalid { border-color: red; }'];
    K.panel(40, 262, 600, 54, '', { a: K.p(t, 6.8) });
    K.code(css, 62, 277, { size: 19, n: K.typed(t, css, [7], 34), t: t, a: K.p(t, 6.8) });
    var V = ['valueMissing:   false', 'rangeUnderflow: true', 'typeMismatch:   false', 'valid:          false'];
    K.panel(680, 80, 560, 236, 'input.validity', { a: K.p(t, 3.4) });
    K.code(V, 706, 124, { size: 20, lh: 1.6, n: K.typed(t, V, [3.8, 4.3, 4.8, 5.3], 40), t: t, w: 520, a: K.p(t, 3.4),
      marks: t > 5.8 ? { 1: 'rgba(252,129,129,.2)', 3: 'rgba(252,129,129,.2)' } : null });
    /* submission */
    var fm = K.p(t, 12.6);
    K.box(40, 350, 420, 226, { fill: P.card, stroke: P.line, a: fm });
    K.text('<form>', 60, 374, { size: 17, mono: true, color: P.blue, a: fm });
    var F = [['name="email"', true, P.ink], ['no name', false, P.muted], ['disabled', false, P.muted]];
    F.forEach(function (f, i) {
      var y = 420 + i * 54, q = K.p(t, 13 + i * 0.6, 0.4);
      K.box(60, y - 21, 300, 42, { fill: P.code, stroke: f[1] ? P.green : P.line, r: 8, a: q, dash: f[1] ? null : [5, 5] });
      K.text(f[0], 76, y, { size: 18, mono: true, color: f[2], a: q });
      K.mark(400, y, f[1], 0.75, K.p(t, 14.6 + i * 0.5, 0.4));
    });
    K.arrow(470, 420, 548, 420, { p: K.p(t, 15.8, 0.5), color: P.green });
    var fd = K.p(t, 16.2);
    K.box(556, 370, 300, 110, { fill: P.code, stroke: P.green, a: fd });
    K.text('new FormData(form)', 576, 396, { size: 17, mono: true, color: P.muted, a: fd });
    K.text('email=ana@ex.com', 576, 444, { size: 20, mono: true, color: P.green, a: fd });
    K.arrow(864, 425, 930, 425, { p: K.p(t, 18.8, 0.5), color: P.acc });
    var sv = K.p(t, 19.2);
    K.box(938, 350, 302, 150, { fill: P.card, stroke: P.acc, a: sv });
    K.text('Server', 960, 378, { size: 20, weight: 700, a: sv });
    K.lock(974, 432, 1, P.acc, K.p(t, 19.8));
    K.text('validate again', 1000, 432, { size: 20, color: P.acc, a: K.p(t, 19.8) });
    K.text('the real gatekeeper', 960, 470, { size: 16, color: P.muted, a: K.p(t, 20.4) });
    K.text('DevTools or curl skip every client check', 556, 540, { size: 18, color: P.red, a: K.p(t, 21.2) });
  } },

/* 8 ─ images: reserve space */
{ d: 22, title: 'Images: reserve the space',
  caps: [
    [0.3, 'Give every img a width and height. The browser derives the aspect ratio and reserves the space before the file arrives.'],
    [7, 'Without them, text renders first and jumps down when the image loads. That jump is layout shift, measured as CLS.'],
    [14, 'Alt text says what the image means. A purely decorative image gets an empty alt, so screen readers skip it.']],
  draw: function (K, t) {
    var P = K.P;
    /* right: with width/height */
    var rp = K.p(t, 0.4);
    K.text('<img src="hero.jpg" width="800" height="500">', 680, 96, { size: 17, mono: true, color: P.green, a: rp });
    K.box(680, 118, 560, 300, { fill: P.code, stroke: P.green, a: rp });
    K.box(700, 136, 240, 150, { fill: false, stroke: P.muted, dash: [6, 6], r: 6, a: K.p(t, 1) * (1 - K.p(t, 3.6, 0.3)) });
    K.text('800 × 500 reserved', 820, 211, { size: 16, color: P.muted, align: 'center', a: K.p(t, 1.2) * (1 - K.p(t, 3.6, 0.3)) });
    pic(K, 700, 136, 240, 150, K.p(t, 3.6, 0.3), P.green);
    bars(K, 700, 312, 500, 4, 24, rp, P.muted);
    K.mark(1210, 150, true, 0.8, K.p(t, 4.4));
    K.text('nothing moves', 1190, 186, { size: 17, color: P.green, align: 'right', a: K.p(t, 4.4) });
    /* left: no width/height */
    var lp = K.p(t, 7.2), sh = K.p(t, 10.2, 0.35);
    K.text('<img src="hero.jpg">', 40, 96, { size: 17, mono: true, color: P.red, a: lp });
    K.box(40, 118, 560, 300, { fill: P.code, stroke: P.red, a: lp });
    pic(K, 60, 136, 240, 150, sh, P.red);
    bars(K, 60, 140 + sh * 172, 500, 4, 24, lp, P.muted);
    K.arrow(330, 160, 330, 290, { p: K.p(t, 10.4, 0.4), color: P.red });
    K.text('layout shift', 352, 200, { size: 20, weight: 700, color: P.red, a: K.p(t, 10.6) });
    K.text('CLS: a Core Web Vital', 352, 232, { size: 17, color: P.muted, a: K.p(t, 11.6) });
    cursor(K, 380, 154 + sh * 172, K.win(t, 8.2, 12.6));
    K.text('you were about to click…', 400, 132 + sh * 172, { size: 15, color: P.muted, a: K.win(t, 8.4, 12.6) * (1 - sh) });
    /* alt */
    var A = ['<img src="trail-pro-red.jpg" alt="Red Trail Pro shoe, side view">', '<img src="divider.svg" alt="">        <!-- decorative: skipped -->'];
    K.panel(40, 444, 1200, 132, 'alt text', { a: K.p(t, 14.2) });
    K.code(A, 66, 486, { size: 19, lh: 1.6, n: K.typed(t, A, [14.6, 17.6], 40), t: t, a: K.p(t, 14.2) });
  } },

/* 9 ─ responsive images */
{ d: 26, title: 'Responsive images',
  caps: [
    [0.3, 'srcset lists the same picture at several widths, and sizes tells the browser how wide it will be shown.'],
    [6.5, 'The browser multiplies display width by pixel density and downloads the smallest file that is big enough.'],
    [13, 'picture with source elements offers modern formats like AVIF and WebP. The img inside is the fallback.'],
    [19.5, 'Lazy load images below the fold. Never lazy load the main hero image; give it fetchpriority high instead.']],
  draw: function (K, t) {
    var P = K.P;
    var L = ['<img src="shoe-800.jpg"', '  srcset="shoe-400.jpg 400w,', '          shoe-800.jpg 800w,', '          shoe-1600.jpg 1600w"',
             '  sizes="(min-width: 700px) 50vw, 100vw"', '  width="800" height="500" alt="Trail Pro">'];
    var hi = t > 3.6 && t < 6.5 ? 4 : t > 0.8 && t < 3.6 ? 1 : -1;
    K.panel(40, 80, 620, 236, 'hero.html', { a: K.p(t, 0.2) });
    K.code(L, 64, 124, { size: 18, lh: 1.5, n: K.typed(t, L, [0.6, 1.2, 2, 2.8, 3.8, 5], 34), t: t, hi: hi, w: 596, a: K.p(t, 0.2) });
    /* files */
    var fsz = [['400w', 64], ['800w', 92], ['1600w', 124]], pick = K.p(t, 10.4, 0.4);
    fsz.forEach(function (f, i) {
      var q = K.back((t - 1.4 - i * 0.5) / 0.5), x = 760 + i * 160, on = i === 1 && pick > 0.5;
      if (q <= 0) return;
      K.g.save(); K.g.translate(x, 140); K.g.scale(q, q);
      K.box(-f[1] / 2, -f[1] * 0.32, f[1], f[1] * 0.64, { fill: on ? 'rgba(104,211,145,.22)' : P.card, stroke: on ? P.green : P.line, r: 6, a: K.clamp(q), lw: on ? 3 : 2 });
      K.g.restore();
      K.text(f[0], x, 140 + f[1] * 0.32 + 18, { size: 16, mono: true, color: on ? P.green : P.muted, align: 'center', a: K.clamp(q) });
    });
    var ph = K.p(t, 6.8);
    K.box(712, 210, 60, 100, { fill: P.card, stroke: P.blue, r: 10, a: ph });
    K.box(718, 222, 48, 76, { fill: P.code, r: 3, a: ph });
    K.text('375 CSS px × 2 DPR', 796, 232, { size: 19, mono: true, a: K.p(t, 7.4) });
    K.text('= 750 device px', 796, 264, { size: 19, mono: true, color: P.blue, a: K.p(t, 8.8) });
    K.text('→ downloads shoe-800.jpg', 796, 296, { size: 19, mono: true, color: P.green, a: pick });
    /* picture / source */
    var S = [['<source type="image/avif">', 'supported? use it', P.green, 13.6], ['<source type="image/webp">', 'next choice', P.blue, 14.8], ['<img src srcset alt>', 'fallback + alt', P.muted, 16]];
    K.text('<picture>', 40, 352, { size: 18, mono: true, color: P.blue, a: K.p(t, 13.2) });
    S.forEach(function (s, i) {
      var y = 396 + i * 66, q = K.p(t, s[3], 0.4);
      K.box(40, y - 23, 340, 46, { fill: P.card, stroke: s[2], r: 8, a: q });
      K.text(s[0], 56, y, { size: 16, mono: true, a: q });
      K.text(s[1], 396, y, { size: 17, color: s[2], a: q });
      if (i) K.arrow(120, y - 43, 120, y - 25, { p: q, color: P.muted, head: 9, lw: 2 });
    });
    K.mark(560, 396, true, 0.8, K.p(t, 17.2));
    /* fold */
    var fo = K.p(t, 19.7);
    K.box(712, 340, 200, 238, { fill: P.code, stroke: P.line, a: fo });
    pic(K, 726, 354, 172, 66, fo, P.warm);
    K.g.save(); K.g.globalAlpha *= fo; K.g.strokeStyle = P.red; K.g.setLineDash([7, 6]); K.g.lineWidth = 2;
    K.g.beginPath(); K.g.moveTo(700, 448); K.g.lineTo(1240, 448); K.g.stroke(); K.g.restore();
    K.text('fold', 1240, 436, { size: 16, color: P.red, align: 'right', a: fo });
    pic(K, 726, 466, 80, 50, K.p(t, 21.5), P.line); pic(K, 818, 466, 80, 50, K.p(t, 21.5), P.line);
    pic(K, 726, 524, 80, 44, K.p(t, 21.7), P.line); pic(K, 818, 524, 80, 44, K.p(t, 21.7), P.line);
    K.text('fetchpriority="high"', 930, 386, { size: 17, mono: true, color: P.warm, a: K.p(t, 23) });
    K.text('hero: the LCP image', 930, 414, { size: 16, color: P.muted, a: K.p(t, 23) });
    K.text('loading="lazy"', 930, 500, { size: 17, mono: true, color: P.blue, a: K.p(t, 20.8) });
    K.text('fetched when scrolled near', 930, 528, { size: 16, color: P.muted, a: K.p(t, 20.8) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 56 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Skeleton first: doctype, lang, charset, viewport, title',
     'Landmarks: header, nav, main, aside, footer',
     'One h1, and headings that never skip a level',
     'Native button, details and dialog before ARIA',
     'Labelled form controls with the right types; server validates',
     'Images: width and height, srcset and sizes, alt, lazy below the fold'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 56 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
