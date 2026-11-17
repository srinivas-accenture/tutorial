/* Day 60 in motion: transitions, keyframes, the rendering pipeline, entry/exit with @starting-style, View Transitions, reduced motion, and CSS architecture. Loaded on demand by assets/js/motion.js. */
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
  function cursor(K, x, y, a) {
    var g = K.g; if (a <= 0) return;
    g.save(); g.globalAlpha *= K.clamp(a); g.fillStyle = K.P.ink; g.strokeStyle = K.P.bg; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.lineTo(x + 7, y + 19); g.lineTo(x + 17, y + 19); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  /* cubic-bezier(x1,y1,x2,y2) progress for time u (solved numerically) */
  function bez(u, x1, y1, x2, y2) {
    function c(a, b, s) { return 3 * a * s * (1 - s) * (1 - s) + 3 * b * s * s * (1 - s) + s * s * s; }
    var lo = 0, hi = 1; for (var i = 0; i < 24; i++) { var m = (lo + hi) / 2; if (c(x1, x2, m) < u) lo = m; else hi = m; }
    return c(y1, y2, (lo + hi) / 2);
  }

JSC.motion.define('day60', {
  kicker: 'JavaScript: Zero to Architect · Day 60',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 60: motion that is smooth and kind to users, and CSS that scales across teams.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Motion and architecture', 0, 0, { size: 80, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 60 · Motion and CSS architecture', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Transitions and keyframes', 'View Transitions', 'CSS that scales'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 340 + i * 300, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ transitions and keyframes */
{ d: 26, title: 'Transitions and keyframes',
  caps: [
    [0.3, 'A transition animates between two states when a property changes, like a hover or a class toggle.'],
    [6.5, 'Name the properties, a duration and an easing. 150 to 300 milliseconds feels responsive. Avoid transition all.'],
    [13, 'Easing shapes the motion. ease-out starts fast and settles gently, which suits things entering the screen.'],
    [19.5, 'Keyframe animations run on their own: a named routine with steps, a duration and an iteration count.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var lift = K.p(t, 2, 0.5) * (1 - K.p(t, 4.6, 0.5)) + K.p(t, 9, 0.5) * (1 - K.p(t, 11.6, 0.5));
    var ca = K.p(t, 0.4), cy = 150 - 16 * lift;
    K.box(80, 166, 300, 180, { fill: 'rgba(0,0,0,.5)', r: 14, a: ca * lift });
    K.box(70, cy, 300, 180, { fill: P.card, stroke: lift > 0.1 ? P.acc : P.line, a: ca });
    pic(K, 86, cy + 16, 268, 90, ca);
    K.text('Trail Pro', 86, cy + 130, { size: 20, weight: 700, a: ca });
    K.text(lift > 0.5 ? 'translateY(-8px)' : 'resting', 86, cy + 158, { size: 16, mono: true, color: lift > 0.5 ? P.acc : P.muted, a: ca });
    cursor(K, 300, 260, K.win(t, 1.6, 4.8) + K.win(t, 8.6, 11.8));
    var C = ['.card {', '  transition: transform 200ms ease-out,', '              box-shadow 200ms ease-out;', '}', '.card:hover { transform: translateY(-8px); }'];
    K.panel(440, 80, 800, 200, 'card.css', { a: K.p(t, 6.6) });
    K.code(C, 464, 118, { size: 18, lh: 1.5, n: K.typed(t, C, [6.8, 7.2, 8.4, 9.2, 9.4], 40), t: t, w: 770, a: K.p(t, 6.6), hi: t > 7.2 && t < 13 ? 1 : -1 });
    K.mark(80, 400, false, 0.75, K.p(t, 11.4));
    K.text('transition: all', 106, 400, { size: 18, mono: true, color: P.red, a: K.p(t, 11.4) });
    K.text('animates things you never meant to', 106, 430, { size: 16, color: P.muted, a: K.p(t, 11.8) });
    /* easing graph */
    var ga = K.p(t, 13.2), X0 = 470, Y0 = 540, GW = 300, GH = 220;
    K.box(X0, Y0 - GH, 2, GH, { fill: P.muted, r: 0, a: ga }); K.box(X0, Y0, GW, 2, { fill: P.muted, r: 0, a: ga });
    K.text('time', X0 + GW, Y0 + 20, { size: 16, color: P.muted, align: 'right', a: ga });
    K.text('progress', X0 + 10, Y0 - GH - 12, { size: 16, color: P.muted, a: ga });
    g.save(); g.globalAlpha *= ga; g.lineWidth = 2; g.strokeStyle = P.line; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(X0, Y0); g.lineTo(X0 + GW, Y0 - GH); g.stroke(); g.setLineDash([]);
    g.strokeStyle = P.acc; g.lineWidth = 4; g.beginPath();
    for (var i = 0; i <= 40; i++) { var u = i / 40, v = bez(u, 0, 0, 0.58, 1); if (i) g.lineTo(X0 + u * GW, Y0 - v * GH); else g.moveTo(X0, Y0); }
    g.stroke(); g.restore();
    K.text('ease-out', X0 + 150, Y0 - GH + 20, { size: 18, mono: true, color: P.acc, a: ga });
    K.text('linear', X0 + GW - 10, Y0 - 90, { size: 16, mono: true, color: P.muted, align: 'right', a: ga });
    var ph = Math.max(0, t - 14) % 2.2 / 1.6, uu = Math.min(1, ph), vv = bez(uu, 0, 0, 0.58, 1), da = K.p(t, 14);
    g.save(); g.globalAlpha *= da; g.fillStyle = P.warm; g.beginPath(); g.arc(X0 + uu * GW, Y0 - vv * GH, 8, 0, 7); g.fill(); g.restore();
    K.box(70, 476, 300, 20, { fill: P.code, r: 10, a: da });
    g.save(); g.globalAlpha *= da; g.fillStyle = P.warm; g.beginPath(); g.arc(82 + vv * 276, 486, 10, 0, 7); g.fill(); g.restore();
    /* keyframes */
    var KF = ['@keyframes spin {', '  to { rotate: 1turn; }', '}', '.loader {', '  animation: spin 1s linear infinite;', '}'];
    K.panel(820, 300, 420, 200, '', { a: K.p(t, 19.6) });
    K.code(KF, 842, 316, { size: 17, lh: 1.5, n: K.typed(t, KF, [19.8, 20.4, 21, 21.2, 21.6, 22.4], 40), t: t, a: K.p(t, 19.6) });
    var sa = K.p(t, 22.4), ang = Math.max(0, t - 22.4) * Math.PI * 2;
    g.save(); g.globalAlpha *= sa; g.lineWidth = 6; g.strokeStyle = P.line; g.beginPath(); g.arc(1030, 548, 24, 0, 7); g.stroke();
    g.strokeStyle = P.acc; g.lineCap = 'round'; g.beginPath(); g.arc(1030, 548, 24, ang, ang + 1.8); g.stroke(); g.restore();
  } },

/* 3 ─ the rendering pipeline */
{ d: 27, title: 'What is cheap to animate',
  caps: [
    [0.3, 'Each frame, the browser may run style, layout, paint and composite. At 60 frames a second, that is about 16 milliseconds.'],
    [7, 'Animate width, height, top or left, and every frame redoes layout and paint. On a slow phone, frames get dropped.'],
    [14, 'Animate transform and opacity instead. The compositor just moves painted layers, often on the GPU, off the main thread.'],
    [21, 'will-change can promote a layer ahead of time, but use it sparingly, because every layer costs memory.']],
  draw: function (K, t) {
    var P = K.P, S = ['Style', 'Layout', 'Paint', 'Composite'];
    S.forEach(function (s, i) {
      var x = 100 + i * 280, q = K.p(t, 0.6 + i * 0.5, 0.4);
      var hotA = t > 7.2 && t < 14 ? K.clamp(1 - Math.abs(((t * 2.5) % 4) - i) * 0.8) : 0;
      var hotB = t > 14.2 && i === 3 ? 0.6 + 0.4 * Math.sin(t * 6) : 0, dim = t > 14.2 && i < 3 ? 0.45 : 1;
      K.box(x, 88, 220, 62, { fill: hotA > 0 ? 'rgba(246,173,85,' + (0.3 * hotA).toFixed(3) + ')' : hotB > 0 ? 'rgba(104,211,145,' + (0.25 * hotB).toFixed(3) + ')' : P.card,
        stroke: hotB > 0 ? P.green : hotA > 0.3 ? P.warm : P.acc, a: q * dim, lw: 2 + hotA * 2 });
      K.text(s, x + 110, 119, { size: 22, weight: 700, align: 'center', a: q * dim });
      if (i) K.arrow(x - 54, 119, x - 8, 119, { p: q, color: P.muted, a: dim });
    });
    K.text('one frame ≈ 16.7 ms at 60 fps', 640, 176, { size: 18, color: P.muted, align: 'center', a: K.p(t, 3) * (1 - K.p(t, 21, 0.4)) });
    var wc = K.back((t - 21.4) / 0.5);
    if (wc > 0) K.chip('will-change: transform  →  own layer, costs memory', 640, 178, { s: wc, size: 17, mono: true, stroke: P.purple });
    function lane(y, lab, col, a, heights, start, move) {
      K.text(lab, 60, y, { size: 19, mono: true, color: col, a: a });
      K.box(60, y + 18, 600, 100, { fill: P.code, stroke: P.line, a: a });
      var ph = (Math.max(0, t - start) % 2) / 2, u = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      K.box(76 + u * 470, y + 38, 100, 60, { fill: P.card, stroke: col, a: a });
      K.text(move, 126 + u * 470, y + 68, { size: 16, color: col, align: 'center', a: a });
      var base = y + 118, bud = base - 60;
      K.g.save(); K.g.globalAlpha *= a; K.g.strokeStyle = P.muted; K.g.setLineDash([5, 5]); K.g.lineWidth = 1.5;
      K.g.beginPath(); K.g.moveTo(700, bud); K.g.lineTo(1240, bud); K.g.stroke(); K.g.restore();
      K.text('16.7 ms budget', 1240, base - 110, { size: 16, color: P.muted, align: 'right', a: a });
      var n = Math.min(heights.length, Math.max(0, Math.floor((t - start) * 5)));
      for (var k = 0; k < n; k++) { var h = heights[k]; K.box(704 + k * 27, base - h, 18, h, { fill: h > 60 ? P.red : P.green, r: 3, a: a }); }
    }
    lane(222, 'left: 0 → 470px', P.red, K.p(t, 7.2), [44, 70, 52, 88, 48, 76, 95, 50, 66, 84, 46, 72, 90, 54, 80, 62, 98, 48, 74, 86], 7.6, 'layout');
    lane(408, 'transform: translateX(470px)', P.green, K.p(t, 14.2), [14, 12, 16, 13, 15, 12, 14, 17, 13, 12, 15, 14, 12, 16, 13, 15, 12, 14, 13, 15], 14.6, 'composite');
  } },

/* 4 ─ entry and exit */
{ d: 24, title: 'Entry and exit animations',
  caps: [
    [0.3, 'Elements that appear from display none used to just pop in. There was no first frame to transition from.'],
    [7.5, '@starting-style gives the browser that first frame, and allow-discrete lets display and overlay flip at the right moment.'],
    [15.5, 'So popovers and dialogs can fade and slide in and out with pure CSS, no JavaScript timers.']],
  draw: function (K, t) {
    var P = K.P, O = [[1.6, 7.2], [9.6, 15.2], [17.4, 20.2], [21.4, 40]];
    function pop(x, a, o, col) {
      if (o <= 0) return;
      K.box(x + 40, 186 + (1 - o) * 18, 260, 96, { fill: P.card, stroke: col, a: a * o });
      bars(K, x + 60, 206 + (1 - o) * 18, 200, 3, 24, a * o, P.muted);
    }
    function btn(x, a) { K.box(x + 40, 126, 160, 46, { fill: P.acc, r: 8, a: a }); K.text('Menu', x + 120, 149, { size: 18, weight: 700, color: P.bg, align: 'center', a: a }); }
    var la = K.p(t, 0.3);
    K.panel(40, 80, 580, 250, 'before: it pops', { a: la });
    btn(40, la);
    var hard = 0; O.forEach(function (w) { if (t >= w[0] && t < w[1]) hard = 1; });
    pop(40, la, hard, P.red);
    K.text('display: none ↔ block, no tween', 330, 310, { size: 16, color: P.red, align: 'center', a: K.p(t, 2.2) });
    var ra = K.p(t, 7.6);
    K.panel(660, 80, 580, 250, 'after: @starting-style', { a: ra });
    btn(660, ra);
    var soft = 0; O.forEach(function (w) { soft += Math.min(K.p(t, w[0], 0.45), 1 - K.p(t, w[1], 0.45)); });
    if (t > 8) pop(660, ra, soft, P.green);
    K.text('fades and slides, in and out', 950, 310, { size: 16, color: P.green, align: 'center', a: K.p(t, 9.6) });
    var C = ['[popover] { opacity: 0; translate: 0 1rem;',
             '  transition: opacity .3s, translate .3s, display .3s allow-discrete, overlay .3s allow-discrete; }',
             '[popover]:popover-open { opacity: 1; translate: 0 0; }',
             '@starting-style { [popover]:popover-open { opacity: 0; translate: 0 1rem; } }'];
    K.panel(40, 360, 1200, 170, 'menu.css', { a: K.p(t, 7.8) });
    K.code(C, 62, 400, { size: 17, lh: 1.6, n: K.typed(t, C, [8, 8.8, 11, 12.4], 60), t: t, w: 1170, a: K.p(t, 7.8), hi: t > 15.6 ? 3 : -1 });
    K.text('pure CSS: popover="auto" + popovertarget, no JavaScript timers', 640, 556, { size: 18, color: P.acc, align: 'center', a: K.p(t, 16.4) });
  } },

/* 5 ─ View Transitions */
{ d: 25, title: 'View Transitions',
  caps: [
    [0.3, 'View Transitions take a snapshot of the old state, update the DOM, then morph to the new state.'],
    [7, 'Wrap your update in document.startViewTransition. Elements sharing a view-transition-name morph between positions.'],
    [14, 'For multi-page sites, @view-transition with navigation auto animates across page loads in supporting browsers.'],
    [19.5, 'Treat it as progressive enhancement: without support, the update still happens, just without the animation.']],
  draw: function (K, t) {
    var P = K.P, sa = K.p(t, 0.3);
    var m = K.p(t, 3, 1.1) * (1 - K.p(t, 9.6, 1.1)) + K.p(t, 16, 1.1) * (1 - K.p(t, 21.6, 1.1));
    K.box(40, 80, 760, 420, { fill: P.code, stroke: P.line, a: sa });
    K.text(m > 0.5 ? 'detail page' : 'list page', 60, 104, { size: 17, color: P.muted, a: sa });
    [0, 1, 2].forEach(function (i) {
      var x = 60 + i * 246, y = 130, hero = i === 1;
      if (hero) {
        var X = lerp(x, 60, m), Y = lerp(y, 128, m), W = lerp(226, 720, m), H = lerp(150, 220, m);
        pic(K, X, Y, W, H, sa); K.box(X, Y, W, H, { fill: false, stroke: P.acc, lw: 3, r: 6, a: sa });
      } else pic(K, x, y, 226, 150, sa * (1 - m));
      K.text(['Road One', 'Trail Pro', 'City Run'][i], x + 6, 304, { size: 19, weight: 700, a: sa * (1 - m) });
      bars(K, x + 6, 330, 210, 2, 18, sa * (1 - m), P.muted);
    });
    K.text('Trail Pro', 60, 384, { size: 30, weight: 800, a: sa * m });
    bars(K, 60, 420, 680, 3, 22, sa * m, P.muted);
    cursor(K, 420, 200, K.win(t, 1.8, 3.2));
    K.text('snapshot → morph', 780, 104, { size: 16, color: P.acc, align: 'right', a: K.win(t, 3, 4.4) + K.win(t, 9.6, 11) });
    var C = ['document.startViewTransition(() => {', '  showDetail(id);', '});', '', '.thumb.active, .hero {', '  view-transition-name: shoe;', '}'];
    K.panel(830, 80, 410, 262, 'detail.js / .css', { a: K.p(t, 7.2) });
    K.code(C, 852, 118, { size: 16, lh: 1.6, n: K.typed(t, C, [7.4, 8.4, 9, 9.4, 10.4, 11, 11.8], 40), t: t, w: 380, a: K.p(t, 7.2) });
    var M = ['@view-transition {', '  navigation: auto;', '}'];
    K.panel(830, 360, 410, 120, 'all pages', { a: K.p(t, 14.2) });
    K.code(M, 852, 398, { size: 16, lh: 1.5, n: K.typed(t, M, [14.4, 15, 15.6], 40), t: t, a: K.p(t, 14.2) });
    var F = ['if (!document.startViewTransition) { showDetail(id); return; }'];
    K.panel(40, 516, 760, 60, '', { a: K.p(t, 19.6) });
    K.code(F, 60, 535, { size: 17, n: K.typed(t, F, [19.8], 50), t: t, a: K.p(t, 19.6) });
    K.text('still works, just no animation', 830, 546, { size: 18, color: P.green, a: K.p(t, 21.4) });
  } },

/* 6 ─ reduced motion */
{ d: 21, title: 'Reduced motion',
  caps: [
    [0.3, 'Large motion can make some people dizzy or nauseous. They can ask for less motion in their system settings.'],
    [7, 'Honour prefers-reduced-motion: replace big slides, zooms and parallax with a quick fade, or no animation at all.'],
    [14, 'Reduce, do not remove meaning. A fade still tells the user that something changed.']],
  draw: function (K, t) {
    var P = K.P;
    function cyc(start) { var ph = Math.max(0, t - start) % 3; return K.ease(ph / 0.9) * (1 - K.ease((ph - 2.4) / 0.5)); }
    var la = K.p(t, 0.3), e = cyc(1);
    K.panel(40, 80, 580, 260, 'default', { a: la });
    K.g.save(); K.g.translate(330 + (1 - e) * 220, 210); K.g.scale(0.6 + 0.4 * e, 0.6 + 0.4 * e); K.g.rotate((1 - e) * 0.2);
    K.box(-130, -70, 260, 140, { fill: P.card, stroke: P.warm, a: la * K.clamp(e * 1.5) });
    K.text('slide + zoom', 0, 0, { size: 20, weight: 700, align: 'center', a: la * K.clamp(e * 1.5) });
    K.g.restore();
    var ra = K.p(t, 7.2), f = cyc(7.4);
    K.panel(660, 80, 580, 260, 'prefers-reduced-motion: reduce', { a: ra });
    K.box(820, 140, 260, 140, { fill: P.card, stroke: P.green, a: ra * f });
    K.text('fade only', 950, 210, { size: 20, weight: 700, align: 'center', a: ra * f });
    var C = ['@media (prefers-reduced-motion: reduce) {', '  .card { animation: fade-in 150ms ease-out; }', '}'];
    K.panel(40, 370, 1200, 130, '', { a: K.p(t, 8) });
    K.code(C, 64, 392, { size: 19, lh: 1.6, n: K.typed(t, C, [8.2, 9.4, 11], 40), t: t, a: K.p(t, 8) });
    K.mark(80, 545, true, 0.8, K.p(t, 14.4));
    K.text('state changes stay visible', 108, 545, { size: 20, a: K.p(t, 14.4) });
    K.mark(560, 545, false, 0.8, K.p(t, 15.6));
    K.text('animation: none everywhere hides feedback', 588, 545, { size: 20, color: P.muted, a: K.p(t, 15.6) });
  } },

/* 7 ─ CSS architecture */
{ d: 25, title: 'CSS architecture',
  caps: [
    [0.3, 'All CSS is global. Two teams both style .title, and whichever file loads last wins everywhere.'],
    [6.5, 'BEM writes the block name into every class: card, card__title, card__title--large. Flat and predictable specificity.'],
    [13, 'Utility-first keeps tiny single-purpose classes in the markup. CSS Modules rename classes per file at build time.']],
  draw: function (K, t) {
    var P = K.P, ca = K.p(t, 0.4), clash = K.p(t, 3, 0.5);
    K.box(40, 84, 360, 56, { fill: P.code, stroke: P.blue, a: ca });
    K.text('checkout.css   .title { color: red }', 56, 112, { size: 16, mono: true, a: ca });
    K.box(40, 160, 360, 56, { fill: P.code, stroke: P.purple, a: K.p(t, 1) });
    K.text('blog.css   .title { font-size: 3rem }', 56, 188, { size: 16, mono: true, a: K.p(t, 1) });
    K.box(700, 84, 240, 56, { fill: P.card, stroke: P.blue, a: ca });
    K.text('Checkout title', 820, 112, { size: 18 + 10 * clash, weight: 700, color: P.red, align: 'center', a: ca });
    K.box(990, 160, 250, 56, { fill: P.card, stroke: P.purple, a: K.p(t, 1) });
    K.text('Blog title', 1115, 188, { size: 18 + 10 * clash, weight: 700, color: clash > 0.5 ? P.red : P.ink, align: 'center', a: K.p(t, 1) });
    K.arrow(404, 112, 694, 112, { p: K.p(t, 1.6, 0.5), color: P.blue, lw: 2 });
    K.arrow(404, 112, 984, 178, { p: K.p(t, 3, 0.6), color: P.red, lw: 2, dash: [6, 5] });
    K.arrow(404, 188, 984, 188, { p: K.p(t, 1.8, 0.5), color: P.purple, lw: 2 });
    K.arrow(404, 188, 694, 124, { p: K.p(t, 3.2, 0.6), color: P.red, lw: 2, dash: [6, 5] });
    K.text('leaks both ways', 640, 236, { size: 17, color: P.red, align: 'center', a: K.p(t, 4) });
    var cards = [['BEM', 6.6, P.acc, ['.card { }', '.card__title { }', '.card__title--large { }'], 'block__element--modifier'],
                 ['Utility-first', 13.2, P.warm, ['<h2 class="text-lg', '           font-bold p-4">'], 'styles live in the markup'],
                 ['CSS Modules', 15.6, P.purple, ['import s from "./Card.module.css";', '<h2 className={s.title}>', '→ .Card_title_x7f3'], 'unique names at build time']];
    cards.forEach(function (c, i) {
      var x = 40 + i * 410, q = K.p(t, c[1], 0.5);
      K.box(x, 270, 380, 300, { fill: P.card, stroke: c[2], a: q });
      K.text(c[0], x + 20, 302, { size: 22, weight: 700, color: c[2], a: q });
      K.code(c[3], x + 20, 336, { size: 16, lh: 1.7, n: K.typed(t, c[3], c[3].map(function (_, k) { return c[1] + 0.4 + k * 0.7; }), 40), t: t, a: q });
      K.text(c[4], x + 20, 538, { size: 17, color: P.muted, a: K.p(t, c[1] + 2) });
    });
  } },

/* 8 ─ @scope, the stack and performance */
{ d: 26, title: 'Scope, layers and speed',
  caps: [
    [0.3, '@scope limits rules to a subtree. Scope card to content styles the card but stops at the content slot: a donut with a hole.'],
    [8, 'A scalable stack: design tokens as custom properties, cascade layers for order, and one component strategy enforced by a linter.'],
    [15, 'Keep render-blocking CSS small: inline what the first screen needs, and load the rest per route.'],
    [20.5, 'content-visibility auto skips rendering off-screen sections, and contain isolates a widget\'s layout and paint.']],
  draw: function (K, t) {
    var P = K.P, da = K.p(t, 1);
    K.box(40, 84, 560, 250, { fill: 'rgba(79,209,197,.14)', stroke: P.acc, a: da });
    K.text('.card', 60, 108, { size: 18, mono: true, color: P.acc, a: da });
    [[60, 130], [440, 130]].forEach(function (p) { K.box(p[0], p[1], 100, 60, { fill: P.card, stroke: P.acc, a: da }); K.text('img ✓', p[0] + 50, p[1] + 30, { size: 16, color: P.green, align: 'center', a: da }); });
    var ha = K.p(t, 3.4);
    K.box(120, 206, 400, 110, { fill: P.bg, stroke: P.warm, dash: [7, 6], a: ha });
    K.text('.content (the hole)', 136, 228, { size: 16, mono: true, color: P.warm, a: ha });
    K.box(140, 246, 100, 56, { fill: P.card, stroke: P.line, a: ha });
    K.text('img ✗', 190, 274, { size: 16, color: P.muted, align: 'center', a: ha });
    K.text('nested component untouched', 260, 274, { size: 16, color: P.muted, a: K.p(t, 4.4) });
    var C = ['@scope (.card) to (.content) {', '  img { border-radius: 8px; }', '}'];
    K.panel(40, 350, 560, 116, '', { a: K.p(t, 1.4) });
    K.code(C, 62, 368, { size: 18, lh: 1.5, n: K.typed(t, C, [1.6, 2.6, 3.2], 40), t: t, a: K.p(t, 1.4) });
    var S = [['utilities', P.acc], ['components: BEM / Modules / @scope', P.purple], ['base', P.blue], ['reset', P.line]];
    S.forEach(function (s, i) {
      var q = K.p(t, 8.4 + (3 - i) * 0.5, 0.4), y = 140 + i * 50;
      K.box(660, y, 440, 42, { fill: P.card, stroke: s[1], a: q });
      K.text(s[0], 680, y + 21, { size: 18, a: q });
    });
    K.text('@layer', 660, 116, { size: 18, mono: true, weight: 700, color: P.acc, a: K.p(t, 8.4) });
    var tk = K.p(t, 10.4);
    K.box(1120, 140, 120, 192, { fill: P.code, stroke: P.warm, a: tk });
    K.text('tokens', 1180, 164, { size: 17, weight: 700, color: P.warm, align: 'center', a: tk });
    ['--brand', '--space-2', '--radius'].forEach(function (s, i) { K.text(s, 1180, 204 + i * 36, { size: 15, mono: true, color: P.muted, align: 'center', a: K.p(t, 10.8 + i * 0.3) }); });
    var li = K.back((t - 12.4) / 0.5);
    if (li > 0) K.chip('Stylelint enforces it in CI', 880, 358, { s: li, size: 17, stroke: P.green });
    var R = ['<style> /* critical: first screen */ </style>', '<link rel="stylesheet" href="/checkout.css">'];
    K.panel(40, 484, 560, 92, '', { a: K.p(t, 15.2) });
    K.code(R, 60, 500, { size: 16, lh: 1.6, n: K.typed(t, R, [15.4, 17], 44), t: t, a: K.p(t, 15.2) });
    var V = ['.section { content-visibility: auto;', '  contain-intrinsic-size: auto 600px; }', '.widget  { contain: layout paint; }'];
    K.panel(660, 410, 580, 166, '', { a: K.p(t, 20.6) });
    K.code(V, 680, 428, { size: 17, lh: 1.6, n: K.typed(t, V, [20.8, 21.8, 23], 44), t: t, a: K.p(t, 20.6) });
    K.text('off-screen: not rendered until needed', 680, 552, { size: 16, color: P.green, a: K.p(t, 22.4) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 60 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Transitions between states; keyframes for routines',
     'Animate transform and opacity, not layout properties',
     '@starting-style and allow-discrete for entry and exit',
     'View Transitions as progressive enhancement',
     'Always honour prefers-reduced-motion',
     'Layers + tokens + one strategy: BEM, utilities, Modules or @scope'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 60 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
