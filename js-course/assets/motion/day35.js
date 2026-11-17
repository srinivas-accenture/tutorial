/* Day 35 in motion: the machine-coding method, accessible tabs, roving tabindex, modal focus, event delegation, tree traversal and a tiny virtual DOM with diffing. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day35', (function () {
  /* a focus ring around a rectangle */
  function ring(K, x, y, w, h, a) { K.box(x - 5, y - 5, w + 10, h + 10, { fill: false, stroke: K.P.blue, lw: 3, r: 12, a: a }); }
  /* a small button-like box with a centred label */
  function btn(K, s, x, y, w, h, o) {
    o = o || {};
    K.box(x, y, w, h, { fill: o.fill || K.P.card, stroke: o.stroke || K.P.line, a: o.a, r: 8 });
    K.text(s, x + w / 2, y + h / 2, { size: o.size || 19, weight: o.weight || 600, align: 'center', color: o.color || K.P.ink, a: o.a });
  }
  return {
  kicker: 'JavaScript: Zero to Architect · Day 35',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 35: build accessible widgets under time pressure, and see how a virtual DOM decides what to change.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Machine coding', 0, 0, { size: 100, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 35 · UI machine coding and DOM challenges', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Accessible widgets', 'Event delegation', 'Virtual DOM diff'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ method */
{ d: 25, title: 'The machine-coding method',
  caps: [
    [0.3, 'A machine coding round: build a working widget in about an hour. The method matters as much as the code.'],
    [6.5, 'Clarify the requirements, then start from semantic HTML. Real buttons, lists and labels give you focus and keyboard support for free.'],
    [13, 'Keep state in one object, and derive the DOM and the ARIA attributes from it. One delegated listener handles the events.'],
    [19.5, 'Then keyboard and ARIA, then edge cases: empty, loading, error and rapid input. Working core first, polish after.']],
  draw: function (K, t) {
    var P = K.P, cl = K.win(t, 0.4, 6.4, 0.5);
    var left = Math.max(0, 60 - Math.floor(t * 2));
    K.text(left + ':00', 640, 290, { size: 96, mono: true, weight: 700, color: P.warm, align: 'center', a: cl });
    K.text('one hour: method + code', 640, 380, { size: 22, color: P.muted, align: 'center', a: cl * K.p(t, 1.5) });
    var S = [['Requirements', 'what + edge cases', 6.8, P.acc], ['Semantic HTML', 'button, ul, label', 8.6, P.acc], ['State', 'one source of truth', 13.3, P.warm],
             ['Events', 'one delegated listener', 15, P.warm], ['Keyboard + ARIA', 'roving tabindex', 19.8, P.green], ['Edge cases', 'empty, rapid input', 21.2, P.red]];
    S.forEach(function (b, i) {
      var x = 40 + i * 204, q = K.back((t - b[2]) / 0.6); if (q <= 0) return;
      K.g.save(); K.g.translate(x + 90, 128); K.g.scale(q, q);
      K.box(-90, -46, 180, 92, { stroke: b[3], a: K.clamp(q) });
      K.text(b[0], 0, -14, { size: 19, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(b[1], 0, 18, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(x - 22, 128, x - 3, 128, { p: K.p(t, b[2] - 0.2, 0.3), head: 9, lw: 2.5 });
    });
    var a = K.p(t, 9.4);
    K.panel(40, 210, 580, 376, 'semantic first', { a: a });
    K.code(['<div onclick="save()">Save</div>'], 64, 256, { size: 19, a: a });
    K.mark(80, 312, false, 0.75, K.p(t, 10)); K.text('no focus, no Enter or Space, no role', 106, 312, { size: 18, color: P.red, a: K.p(t, 10) });
    K.code(['<button>Save</button>'], 64, 354, { size: 19, a: K.p(t, 10.8) });
    K.mark(80, 410, true, 0.75, K.p(t, 11.4)); K.text('focusable, keyboard and role for free', 106, 410, { size: 18, color: P.green, a: K.p(t, 11.4) });
    var tb = K.p(t, 20.4);
    K.text('time-box', 64, 470, { size: 17, weight: 700, color: P.muted, a: tb });
    [['core 30 min', 270, P.green], ['a11y 15', 135, P.acc], ['edge 15', 135, P.warm]].forEach(function (s, i, arr) {
      var x = 64; for (var k = 0; k < i; k++) x += arr[k][1] + 4;
      var q = K.p(t, 20.8 + i * 0.6, 0.4);
      K.box(x, 492, s[1] * q, 44, { fill: s[2], r: 6, a: tb });
      K.text(s[0], x + s[1] / 2, 514, { size: 17, weight: 700, color: P.bg, align: 'center', a: q });
    });
    var b = K.p(t, 13.4);
    K.panel(660, 210, 580, 376, 'state drives everything', { a: b });
    K.code(['const state = { active: 0, items };'], 684, 256, { size: 19, a: b });
    K.arrow(800, 290, 800, 330, { p: K.p(t, 14.4, 0.4), color: P.warm });
    K.chip('render(state)', 800, 352, { mono: true, size: 19, stroke: P.warm, a: K.p(t, 14.6) });
    K.arrow(760, 376, 720, 420, { p: K.p(t, 15.4, 0.4) }); K.arrow(840, 376, 900, 420, { p: K.p(t, 15.6, 0.4) });
    K.chip('DOM', 720, 444, { size: 19, stroke: P.acc, a: K.p(t, 15.8) });
    K.chip('aria-* attributes', 960, 444, { size: 19, stroke: P.acc, a: K.p(t, 16.1) });
    K.chip('one listener on the container', 950, 530, { size: 18, stroke: P.purple, a: K.p(t, 17) });
  } },

/* 3 ─ tabs */
{ d: 25, title: 'Accessible tabs',
  caps: [
    [0.3, 'Tabs, the classic. A tablist holds buttons with role tab, and each tab points at its panel with aria-controls.'],
    [7, 'The selected tab has aria-selected true, and only its panel is visible. The other panels are hidden.'],
    [13, 'Clicks go to one listener on the tablist. event dot target dot closest finds the tab that was clicked.'],
    [19, 'Keep ARIA honest: aria-selected must always match the real state, so one select function sets everything.']],
  draw: function (K, t) {
    var P = K.P, names = ['Overview', 'Specs', 'Reviews'], sel = t >= 15.2 ? 1 : 0;
    var a = K.p(t, 0.4);
    K.box(40, 76, 700, 250, { fill: P.code, stroke: P.line, a: a });
    K.text('role="tablist"', 64, 98, { size: 16, mono: true, color: P.purple, a: K.p(t, 1) });
    K.box(56, 110, 668, 66, { fill: false, stroke: P.purple, dash: [6, 5], a: K.p(t, 1) });
    names.forEach(function (n, i) {
      var x = 72 + i * 216, on = i === sel;
      btn(K, n, x, 120, 200, 46, { a: K.p(t, 1.4 + i * 0.4), stroke: on ? P.acc : P.line, color: on ? P.acc : P.ink });
      K.text('aria-selected="' + on + '"', x + 100, 194, { size: 16, mono: true, align: 'center', color: on ? P.green : P.muted, a: K.p(t, 7.4 + i * 0.3) });
    });
    K.box(56, 216, 668, 96, { stroke: P.acc, a: K.p(t, 2.6) });
    K.text('role="tabpanel"  id="p' + sel + '"', 76, 240, { size: 16, mono: true, color: P.acc, a: K.p(t, 2.6) });
    K.text(names[sel] + ' content', 76, 280, { size: 22, a: K.p(t, 2.6) });
    K.text('2 other panels: hidden', 704, 280, { size: 16, color: P.muted, align: 'right', a: K.p(t, 9) });
    K.curve(172, 168, 120, 196, 160, 226, { p: K.p(t, 3.4, 0.6), color: P.warm, lw: 2, head: 9, a: 1 - K.p(t, 6.8) });
    K.text('aria-controls="p0"', 180, 204, { size: 16, mono: true, color: P.warm, a: K.win(t, 3.8, 6.8) });
    /* click on Specs */
    var cx = 390, cy = 150, c = K.p(t, 13.6);
    if (t > 13.6 && t < 19) { var g = K.g; g.save(); g.globalAlpha *= c; g.fillStyle = P.ink; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 26); g.lineTo(cx + 7, cy + 19); g.lineTo(cx + 18, cy + 19); g.closePath(); g.fill(); g.restore(); }
    var rp = K.clamp((t - 14.6) / 0.6);
    if (rp > 0 && rp < 1) K.box(cx - 30 * rp, cy - 30 * rp, 60 * rp, 60 * rp, { fill: false, stroke: P.warm, r: 30, a: 1 - rp });
    var h = ['<div role="tablist">', '  <button role="tab" aria-selected="true"', '    aria-controls="p0">Overview</button>', '  …', '</div>', '<div role="tabpanel" id="p0">…</div>'];
    K.panel(760, 76, 480, 250, 'markup', { a: a });
    K.code(h, 778, 116, { size: 16, lh: 1.5, n: K.typed(t, h, [0.8, 1.6, 2.6, 3.6, 3.8, 4.2], 50), t: t, a: a });
    var code = ['function select(i) {', '  tabs.forEach((b, j) => {', '    b.setAttribute("aria-selected", String(i === j));', '    b.tabIndex = i === j ? 0 : -1;', '    panels[j].hidden = i !== j;', '  });', '}',
      'list.addEventListener("click", (e) => {', '  const b = e.target.closest("[role=tab]"); if (b) select(tabs.indexOf(b)); });'];
    var hi = t > 19.2 ? 2 : t > 13.2 && t < 18.8 ? 8 : t > 7.4 && t < 12.8 ? 4 : -1;
    K.panel(40, 342, 1200, 244, 'tabs.js', { a: K.p(t, 7) });
    K.code(code, 62, 376, { size: 17, lh: 1.3, n: K.typed(t, code, [7.4, 8, 8.6, 9.6, 10.3, 10.9, 11, 13.2, 14], 50), t: t, hi: hi, w: 1160 });
  } },

/* 4 ─ roving tabindex + pure keyboard logic */
{ d: 25, title: 'Keyboard: roving tabindex',
  caps: [
    [0.3, 'Keyboard support uses a roving tabindex. Only the active tab has tabindex 0, so Tab enters the tablist once and moves on.'],
    [7, 'Inside, the arrow keys move the selection and wrap around. Home jumps to the first tab, End to the last.'],
    [13.5, 'Write the key handling as a pure function from state and key to a new state. Then you can test it without any DOM.'],
    [19.5, 'An autocomplete works the same way: arrow down opens and highlights, Enter commits the item, Escape closes.']],
  draw: function (K, t) {
    var P = K.P, names = ['Overview', 'Specs', 'Reviews'];
    var keys = [['Tab', 2.2, 0], ['Tab', 4.6, -1], ['→', 7.6, 1], ['→', 8.8, 2], ['→', 10, 0], ['End', 11.2, 2], ['Home', 12.4, 0]];
    var sel = 0, lastKey = null, focusOut = t >= 4.6 && t < 7.6;
    keys.forEach(function (k) { if (t >= k[1]) { lastKey = k; if (k[2] >= 0) sel = k[2]; } });
    var a = K.p(t, 0.4);
    K.box(40, 76, 1200, 200, { fill: P.code, stroke: P.line, a: a });
    names.forEach(function (n, i) {
      var x = 70 + i * 210, on = i === sel;
      btn(K, n, x, 104, 190, 50, { a: a, stroke: on ? P.acc : P.line, color: on ? P.acc : P.ink });
      K.text('tabindex=' + (on ? '0' : '-1'), x + 95, 182, { size: 17, mono: true, align: 'center', color: on ? P.green : P.muted, a: a });
      if (on && t >= 2.2 && !focusOut) ring(K, x, 104, 190, 50, 1);
    });
    btn(K, 'next field', 760, 104, 170, 50, { a: a, color: P.muted });
    if (focusOut && t < 7.6) ring(K, 760, 104, 170, 50, 1);
    K.text('one Tab stop for the whole tablist', 70, 236, { size: 18, color: P.green, a: K.win(t, 5.2, 7.4) });
    K.text('arrows wrap · Home / End jump', 70, 236, { size: 18, color: P.acc, a: K.p(t, 7.8) });
    if (lastKey) {
      var q = K.back((t - lastKey[1]) / 0.35);
      K.text('key', 1100, 100, { size: 16, color: P.muted, align: 'center', a: a });
      K.chip(lastKey[0], 1100, 150, { s: q, size: 30, mono: true, stroke: P.warm, color: P.warm });
    }
    var code = ['const nav = (s, key) => {', '  const n = s.items.length;   // also guard n = 0', '  if (key === "ArrowDown")', '    return { ...s, open: true, active: (s.active + 1) % n };',
      '  if (key === "Enter" && s.active >= 0)', '    return { ...s, open: false, value: s.items[s.active] };', '  if (key === "Escape") return { ...s, open: false, active: -1 };', '  return s;   // other keys: same state', '};'];
    var hi = t > 22.8 ? 6 : t > 21.4 ? 4 : t > 19.8 ? 2 : -1;
    var c = K.p(t, 13.6);
    K.panel(40, 296, 680, 290, 'nav.js · pure function', { a: c });
    K.code(code, 62, 336, { size: 17, lh: 1.38, n: K.typed(t, code, [13.8, 14.3, 14.9, 15.4, 16.3, 16.8, 17.6, 18.5, 19], 60), t: t, hi: hi, w: 650 });
    var d = K.p(t, 16);
    K.box(740, 296, 500, 290, { fill: P.code, stroke: P.line, a: d });
    K.text('tests, no DOM', 764, 322, { size: 17, weight: 700, color: P.muted, a: d });
    K.mark(778, 358, true, 0.65, K.p(t, 17.4)); K.text('nav(s0, "ArrowDown").active === 0', 800, 358, { size: 16, mono: true, a: K.p(t, 17.4) });
    K.mark(778, 392, true, 0.65, K.p(t, 18.2)); K.text('nav(s0, "x") === s0', 800, 392, { size: 16, mono: true, a: K.p(t, 18.2) });
    var ac = K.p(t, 19.7), open = t >= 20 && t < 22.8, act = t < 20 ? -1 : t < 21 ? 0 : 1;
    K.box(764, 420, 300, 40, { fill: P.card, stroke: P.blue, a: ac, r: 6 });
    K.text(t >= 22.2 ? 'apricot' : 'ap', 778, 440, { size: 18, mono: true, a: ac });
    ['apple', 'apricot', 'avocado'].forEach(function (s, i) {
      var y = 474 + i * 34;
      K.box(764, y - 16, 300, 32, { fill: i === act ? 'rgba(99,179,237,.22)' : P.card, a: ac * (open ? 1 : 0), r: 4 });
      K.text(s, 778, y, { size: 17, mono: true, a: ac * (open ? 1 : 0) });
    });
    [['↓', 20], ['↓', 21], ['Enter', 22.2], ['Esc', 23.4]].forEach(function (k, i) {
      K.chip(k[0], 1120, 440 + i * 36, { size: 16, mono: true, stroke: P.warm, a: K.p(t, k[1], 0.3) });
    });
  } },

/* 5 ─ modal */
{ d: 24, title: 'Modal dialogs and focus',
  caps: [
    [0.3, 'A modal dialog: focus moves inside when it opens, and the page behind becomes inert, so Tab cannot reach it.'],
    [7, 'Escape closes it, and focus returns to the button that opened it. Losing focus to the page body is the classic bug.'],
    [13, 'The native dialog element with showModal makes the page inert, closes on Escape, and restores focus for you.'],
    [18.5, 'Label it with aria-labelledby, stop the background from scrolling, and close on a backdrop click if the design allows.']],
  draw: function (K, t) {
    var P = K.P, a = K.p(t, 0.3), open = K.p(t, 1.6, 0.5) * (1 - K.p(t, 9.4, 0.5));
    K.box(40, 76, 700, 510, { fill: P.code, stroke: P.line, a: a });
    K.text('Files', 70, 112, { size: 24, weight: 700, a: a });
    for (var r = 0; r < 4; r++) K.box(70, 150 + r * 50, 420 - r * 60, 18, { fill: P.line, r: 6, a: a * 0.8 });
    btn(K, 'Delete file…', 520, 140, 190, 48, { a: a, stroke: P.red, color: P.red });
    if (t > 0.8 && t < 1.8) ring(K, 520, 140, 190, 48, 1);
    K.box(40, 76, 700, 510, { fill: 'rgba(4,9,15,.7)', a: open });
    K.text('page behind: inert', 390, 560, { size: 17, color: P.muted, align: 'center', a: open });
    K.box(150, 250, 480, 220, { fill: P.card, stroke: P.acc, a: open });
    K.text('Delete file?', 180, 290, { size: 24, weight: 700, a: open });
    K.text('This cannot be undone.', 180, 330, { size: 18, color: P.muted, a: open });
    btn(K, 'Cancel', 330, 390, 130, 46, { a: open });
    btn(K, 'Delete', 476, 390, 130, 46, { a: open, stroke: P.red, color: P.red });
    var tabs = [[2.2, 0], [3.8, 1], [5, 0]], f = -1;
    tabs.forEach(function (k) { if (t >= k[0]) f = k[1]; });
    if (open > 0.9 && f >= 0) ring(K, f ? 476 : 330, 390, 130, 46, 1);
    [['Tab', 3.8], ['Tab', 5]].forEach(function (k, i) { K.chip(k[0], 220 + i * 70, 412, { size: 16, mono: true, stroke: P.warm, a: K.win(t, k[1], k[1] + 1) * open }); });
    K.text('focus stays inside', 390, 500, { size: 17, color: P.blue, align: 'center', a: K.win(t, 4, 9.2) * open });
    var esc = K.back((t - 8.6) / 0.4);
    if (esc > 0 && t < 12.6) K.chip('Esc', 640, 300, { s: esc, size: 22, mono: true, stroke: P.warm, color: P.warm });
    var back = K.p(t, 10.2);
    if (t > 10.2) ring(K, 520, 140, 190, 48, back);
    K.mark(500, 230, true, 0.7, back); K.text('focus back on the trigger', 524, 230, { size: 17, color: P.green, a: back });
    K.mark(80, 300, false, 0.7, K.p(t, 11)); K.text('bug: focus lost to <body>', 104, 300, { size: 17, color: P.red, a: K.p(t, 11) });
    var c = K.p(t, 13.2);
    var code = ['<dialog id="dlg" aria-labelledby="dlg-title">', '  <h2 id="dlg-title">Delete file?</h2> …', '</dialog>', '', 'open.onclick = () => dlg.showModal();'];
    K.panel(770, 76, 470, 250, 'native dialog', { a: c });
    K.code(code, 788, 116, { size: 16, lh: 1.5, n: K.typed(t, code, [13.4, 14.4, 15.2, 15.3, 15.4], 50), t: t, hi: t > 18.7 ? 0 : -1, w: 446 });
    ['inert page', 'Esc closes', 'focus restored'].forEach(function (s, i) {
      K.chip(s, 850 + i * 136, 296, { size: 16, stroke: P.green, a: K.p(t, 16.2 + i * 0.5) });
    });
    var d = K.p(t, 18.7);
    K.box(770, 346, 470, 240, { fill: P.code, stroke: P.line, a: d });
    K.text('checklist', 794, 374, { size: 17, weight: 700, color: P.muted, a: d });
    ['labelled by its title', 'no background scroll', 'backdrop click closes', 'focus returns to trigger'].forEach(function (s, i) {
      var q = K.p(t, 19 + i * 0.7, 0.4);
      K.mark(810, 418 + i * 42, true, 0.65, q); K.text(s, 834, 418 + i * 42, { size: 18, a: q });
    });
  } },

/* 6 ─ event delegation */
{ d: 24, title: 'Event delegation',
  caps: [
    [0.3, 'Event delegation: instead of a listener on every item, put one listener on the container. Events bubble up to it.'],
    [7, 'In the handler, event dot target dot closest finds the item, even when the click landed on an inner span.'],
    [13.5, 'Check that the match is inside the container, then handle it. Items added later work automatically.'],
    [19, 'Wrap it in a tiny helper: on, with root, type, selector and handler. Frameworks use the same idea under the hood.']],
  draw: function (K, t) {
    var P = K.P, a = K.p(t, 0.4), n = t >= 15 ? 6 : 5;
    K.box(40, 76, 560, 510, { fill: P.code, stroke: P.line, a: a });
    var one = K.p(t, 3.6, 0.8);
    K.box(60, 96, 520, 18 + 6 * 64, { fill: false, stroke: one > 0.5 ? P.green : P.line, dash: [6, 5], a: a });
    K.text('<ul>', 80, 120, { size: 17, mono: true, color: P.muted, a: a });
    for (var i = 0; i < n; i++) {
      var y = 140 + i * 64, q = i === 5 ? K.back((t - 15) / 0.5) : 1;
      if (q <= 0) continue;
      var clicked = (i === 2 && t > 7.6 && t < 13.2) || (i === 5 && t > 16.6);
      K.box(80, y, 480, 52, { fill: P.card, stroke: clicked ? P.warm : P.line, a: a * K.clamp(q), r: 8 });
      K.text('li.item', 96, y + 26, { size: 16, mono: true, color: P.muted, a: a * K.clamp(q) });
      K.box(180, y + 10, 180, 32, { fill: P.code, stroke: P.line, a: a * K.clamp(q), r: 6 });
      K.text('<span>Item ' + (i + 1) + '</span>', 270, y + 26, { size: 16, mono: true, align: 'center', a: a * K.clamp(q) });
      var ear = 1 - one;
      if (i < 5) K.chip('fn', 520, y + 26, { size: 15, mono: true, stroke: P.red, color: P.red, a: ear * K.p(t, 1 + i * 0.3) });
    }
    K.chip('1 listener', 500, 120, { size: 17, stroke: P.green, color: P.green, a: one });
    K.text('5 listeners →', 330, 120, { size: 16, color: P.red, a: K.win(t, 1.6, 3.8) });
    /* click + bubbling */
    var cx = 300, cy = 140 + 2 * 64 + 22;
    if (t > 7.4 && t < 13.2) { var g = K.g; g.save(); g.fillStyle = P.ink; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 24); g.lineTo(cx + 7, cy + 17); g.lineTo(cx + 17, cy + 17); g.closePath(); g.fill(); g.restore(); }
    var b = K.p(t, 7.6);
    K.box(620, 316, 620, 270, { fill: P.code, stroke: P.line, a: b });
    K.text('the click bubbles up', 644, 342, { size: 17, weight: 700, color: P.muted, a: b });
    [['span', 'e.target', 8], ['li.item', 'closest(".item")', 9.4], ['ul', 'listener runs here', 10.6]].forEach(function (r, k) {
      var y = 548 - k * 80, q = K.p(t, r[2], 0.4);
      K.chip(r[0], 720, y, { mono: true, size: 19, stroke: k === 2 ? P.green : k === 1 ? P.warm : P.blue, a: q });
      K.text(r[1], 790, y, { size: 18, mono: k < 2, color: k === 1 ? P.warm : P.muted, a: q });
      if (k) K.arrow(720, y + 58, 720, y + 24, { p: K.p(t, r[2] - 0.3, 0.3), head: 9, lw: 2 });
    });
    K.text('root.contains(t) ✓', 1216, 388, { size: 17, mono: true, color: P.green, align: 'right', a: K.p(t, 14) });
    K.text('Item 6 added later: no new listener', 330, 560, { size: 17, color: P.green, align: 'center', a: K.p(t, 16.8) });
    var code = ['const on = (root, type, sel, fn) =>', '  root.addEventListener(type, (e) => {', '    const t = e.target.closest(sel);', '    if (t && root.contains(t)) fn(e, t);', '  });', 'on(list, "click", ".item", (e, li) => …);'];
    var hi = t > 19.2 ? 5 : t > 13.7 ? 3 : t > 7.2 ? 2 : -1;
    K.panel(620, 76, 620, 224, 'delegate.js', { a: K.p(t, 6.8) });
    K.code(code, 642, 114, { size: 17, lh: 1.42, n: K.typed(t, code, [7, 7.8, 8.6, 13.7, 14.4, 19.3], 50), t: t, hi: hi, w: 590 });
  } },

/* 7 ─ tree traversal */
{ d: 25, title: 'Walking the DOM tree',
  caps: [
    [0.3, 'Tree questions: write getElementsByClassName yourself. The DOM is a tree, so walk it depth first.'],
    [7, 'For each child: if its classList contains the class, collect it, then recurse into its own children.'],
    [13.5, 'closest walks the other way: from the element up through parentElement, until a node matches the selector.'],
    [19, 'The native getElementsByClassName returns a live collection. Yours returns a plain array, a snapshot. Say so.']],
  draw: function (K, t) {
    var P = K.P, a = K.p(t, 0.5);
    K.box(40, 76, 700, 510, { fill: P.code, stroke: P.line, a: a });
    var N = [['div#root', 390, 130], ['header.hit', 170, 250], ['ul', 390, 250], ['p.hit', 610, 250], ['span', 170, 370], ['li.hit', 320, 370], ['li', 460, 370]];
    var E = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [2, 6]];
    var order = [1, 4, 2, 5, 6, 3], hit = { 1: 1, 5: 1, 3: 1 };
    E.forEach(function (e) { K.arrow(N[e[0]][1], N[e[0]][2] + 22, N[e[1]][1], N[e[1]][2] - 24, { head: 0.1, lw: 2, color: P.line, a: a }); });
    var visit = {}, cur = -1;
    order.forEach(function (k, j) { if (t >= 7.6 + j * 0.95) { visit[k] = 1; cur = k; } });
    if (t > 13.4) cur = -1;
    N.forEach(function (n, k) {
      var isHit = hit[k] && visit[k];
      K.chip(n[0], n[1], n[2], { mono: true, size: 18, stroke: k === cur ? P.warm : isHit ? P.green : P.acc, color: isHit ? P.green : P.ink, a: K.p(t, 0.8 + k * 0.25) });
      var j = order.indexOf(k);
      if (j >= 0) K.text(String(j + 1), n[1] - 70, n[2] - 26, { size: 16, color: P.warm, a: K.p(t, 7.6 + j * 0.95) });
    });
    var found = order.filter(function (k, j) { return hit[k] && t >= 7.6 + j * 0.95; }).map(function (k) { return N[k][0].split('.')[0]; });
    K.text('out = [' + found.join(', ') + ']', 70, 470, { size: 22, mono: true, color: P.green, a: K.p(t, 7.6) });
    /* closest from span */
    var up = K.p(t, 14.6, 0.6);
    K.curve(140, 350, 110, 310, 140, 272, { p: up, color: P.purple, lw: 3, head: 10 });
    K.text('span.closest(".hit") → header', 70, 520, { size: 19, mono: true, color: P.purple, a: K.p(t, 15.4) });
    K.text('native: live collection · yours: array snapshot', 70, 562, { size: 17, color: P.warm, a: K.p(t, 19.4) });
    var code = ['const byClass = (node, cls, out = []) => {', '  for (const c of node.children) {', '    if (c.classList.contains(cls)) out.push(c);', '    byClass(c, cls, out);', '  }', '  return out;', '};'];
    var hi = t > 7.2 && t < 13.3 ? (Math.floor((t - 7.6) / 0.95) % 2 ? 3 : 2) : -1;
    K.panel(760, 76, 480, 250, 'byClass.js', { a: K.p(t, 1.2) });
    K.code(code, 780, 116, { size: 17, lh: 1.42, n: K.typed(t, code, [1.4, 2.2, 2.9, 3.8, 4.4, 4.6, 4.9], 50), t: t, hi: hi, w: 452 });
    var cc = ['function closest(el, sel) {', '  for (let n = el; n; n = n.parentElement)', '    if (n.matches(sel)) return n;', '  return null;', '}'];
    K.panel(760, 346, 480, 240, 'closest.js', { a: K.p(t, 13.6) });
    K.code(cc, 780, 386, { size: 17, lh: 1.5, n: K.typed(t, cc, [13.8, 14.4, 15.4, 16.1, 16.4], 50), t: t, hi: t > 14.6 && t < 18.8 ? 1 : -1, w: 452 });
  } },

/* 8 ─ h and render */
{ d: 25, title: 'Virtual DOM: h and render',
  caps: [
    [0.3, 'A virtual DOM is a blueprint of the page: plain objects with a type, props and children. A function h builds them.'],
    [7, 'render turns a virtual node into real DOM: create the element, set its attributes, then render each child recursively.'],
    [13.5, 'When the state changes, you build a whole new blueprint. That is cheap, because these are just objects.'],
    [19, 'Then a diff compares the old and new trees, and patches only what changed in the real DOM.']],
  draw: function (K, t) {
    var P = K.P, code = ['const h = (type, props = {}, ...children) =>', '  ({ type, props, children: children.flat() });', 'const render = (v) => {', '  if (typeof v === "string") return document.createTextNode(v);',
      '  const el = document.createElement(v.type);', '  for (const [k, val] of Object.entries(v.props)) el.setAttribute(k, val);', '  v.children.forEach((c) => el.append(render(c)));', '  return el;', '};'];
    var hi = t > 7.2 && t < 13.3 ? (t < 9.5 ? 4 : t < 11.3 ? 5 : 6) : t > 0.8 && t < 6.8 ? 1 : -1;
    K.panel(40, 76, 780, 262, 'vdom.js');
    K.code(code, 62, 116, { size: 17, lh: 1.42, n: K.typed(t, code, [0.5, 1.4, 6.9, 7.4, 8.4, 9.3, 10.5, 11.4, 11.6], 56), t: t, hi: hi, w: 750 });
    var v = ['{ type: "ul",', '  props: { class: "a" },', '  children: [', '    { type: "li", … "one" },', '    { type: "li", … "two" } ] }'];
    K.panel(840, 76, 400, 262, 'a vnode', { a: K.p(t, 2.6) });
    K.code(v, 858, 116, { size: 17, lh: 1.5, n: K.typed(t, v, [2.8, 3.4, 4, 4.5, 5.1], 44), t: t });
    K.box(40, 358, 1200, 228, { fill: P.code, stroke: P.line, a: K.p(t, 7.4) });
    function tree(x, label, items, a, col, hot) {
      K.text(label, x, 384, { size: 16, weight: 700, color: P.muted, align: 'center', a: a });
      K.chip('ul', x, 424, { mono: true, size: 18, stroke: col, a: a });
      items.forEach(function (s, i) {
        var xx = x + (i - (items.length - 1) / 2) * 92;
        K.arrow(x, 444, xx, 486, { head: 0.1, lw: 1.5, color: P.line, a: a });
        K.chip(s, xx, 506, { mono: true, size: 16, stroke: hot && hot[i] ? P.warm : col, color: hot && hot[i] ? P.warm : P.ink, a: a });
      });
    }
    tree(210, 'old vnodes', ['one', 'two'], K.p(t, 7.6), P.purple);
    K.arrow(330, 470, 470, 470, { p: K.p(t, 8.6, 0.5), color: P.acc });
    K.text('render', 400, 452, { size: 16, mono: true, color: P.acc, align: 'center', a: K.p(t, 8.8) });
    var ch = K.p(t, 20.2);
    tree(620, 'real DOM', ch > 0.5 ? ['one', 'TWO', 'three'] : ['one', 'two'], K.p(t, 9.6), P.acc, ch > 0.5 ? [0, 1, 1] : null);
    tree(1030, 'new vnodes', ['one', 'TWO', 'three'], K.p(t, 14.2), P.purple);
    K.text('state changed → new objects', 1030, 562, { size: 16, color: P.muted, align: 'center', a: K.p(t, 15) });
    K.arrow(900, 470, 760, 470, { p: K.p(t, 19.4, 0.5), color: P.warm });
    K.text('diff + patch', 830, 452, { size: 16, mono: true, color: P.warm, align: 'center', a: K.p(t, 19.6) });
    K.text('only the changes', 620, 562, { size: 16, color: P.warm, align: 'center', a: K.p(t, 20.6) });
  } },

/* 9 ─ diff and patch */
{ d: 27, title: 'Diff and patch',
  caps: [
    [0.3, 'The diff walks both trees together. No old node: create one. No new node: remove the old one.'],
    [7, 'Different type, or changed text: replace the node. Same type: update only the changed attributes, then recurse into the children.'],
    [14, 'Here the class changes from a to b, two becomes TWO, and three is appended. Three operations, and the first li keeps its identity.'],
    [20.5, 'Remove extra children from the end, so indexes do not shift. Real libraries use keys to match moved items, not positions.']],
  draw: function (K, t) {
    var P = K.P, code = ['function patch(parent, oldV, newV, i = 0) {', '  const el = parent.childNodes[i];', '  if (!oldV) return parent.append(render(newV));', '  if (!newV) return el.remove();',
      '  if (changed(oldV, newV)) return parent.replaceChild(render(newV), el);', '  if (typeof newV === "string") return;', '  updateProps(el, oldV.props, newV.props);', '  const o = oldV.children, n = newV.children;',
      '  for (let k = 0; k < Math.min(o.length, n.length); k++) patch(el, o[k], n[k], k);', '  for (let k = o.length - 1; k >= n.length; k--) patch(el, o[k], undefined, k);',
      '  for (let k = o.length; k < n.length; k++) patch(el, undefined, n[k], k);', '}'];
    var hi = t > 20.7 ? 9 : t > 14.2 ? -1 : t > 10.4 ? 8 : t > 8.8 ? 6 : t > 7.2 ? 4 : t > 3.6 ? 3 : t > 1.6 ? 2 : -1;
    K.panel(40, 76, 1200, 314, 'patch.js');
    K.code(code, 62, 112, { size: 17, lh: 1.3, n: K.typed(t, code, [0.4, 0.9, 1.4, 3.4, 7.2, 8.4, 8.9, 9.6, 10.3, 11.6, 12.6, 13.4], 60), t: t, hi: hi, w: 1160 });
    var rules = K.win(t, 1.6, 14, 0.5);
    [['no old → create', P.green, 2], ['no new → remove', P.red, 3.6], ['type or text differs → replace', P.warm, 7.4], ['same type → props, then children', P.acc, 9]].forEach(function (r, i) {
      K.chip(r[0], [180, 440, 760, 1080][i], 470, { size: 17, stroke: r[1], a: rules * K.p(t, r[2]) });
    });
    var ex = K.p(t, 14.2);
    K.text('old', 64, 430, { size: 17, weight: 700, color: P.muted, a: ex });
    K.text('new', 64, 500, { size: 17, weight: 700, color: P.muted, a: ex });
    var O = ['ul class="a"', 'li "one"', 'li "two"', ''], Nw = ['ul class="b"', 'li "one"', 'li "TWO"', 'li "three"'];
    var X = [210, 430, 640, 850];
    var ops = [['setAttribute', P.warm, 15.2], ['kept', P.green, 16.2], ['replace text', P.warm, 17.2], ['append', P.green, 18.2]];
    X.forEach(function (x, i) {
      if (O[i]) K.chip(O[i], x, 430, { mono: true, size: 17, stroke: P.line, a: ex });
      K.chip(Nw[i], x, 500, { mono: true, size: 17, stroke: ops[i][1], a: ex });
      K.text(ops[i][0], x, 556, { size: 16, color: ops[i][1], align: 'center', a: K.p(t, ops[i][2]) });
    });
    K.box(990, 404, 250, 130, { fill: P.code, stroke: P.green, a: K.p(t, 19) });
    K.text('3 DOM operations', 1115, 444, { size: 19, weight: 700, color: P.green, align: 'center', a: K.p(t, 19) });
    K.text('first li: same node', 1115, 490, { size: 17, color: P.muted, align: 'center', a: K.p(t, 19.4) });
    var kq = K.back((t - 22.6) / 0.5);
    if (kq > 0) K.chip('keys match moved items', 1115, 566, { s: kq, size: 17, stroke: P.purple });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 35 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Semantic HTML first; one state object drives DOM and ARIA',
     'Tabs: roles, aria-selected, and a roving tabindex',
     'Modals: inert page, Escape closes, focus returns',
     'Delegate with closest; walk the tree depth first',
     'Virtual DOM: diff two trees, patch only the changes'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the self-checks with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ] };
})());
