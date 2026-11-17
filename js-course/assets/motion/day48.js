/* Day 48 in motion: WCAG and POUR, semantic HTML and accessible names, focus management and live regions,
   contrast and preferences, custom elements and their lifecycle, Shadow DOM (styles, slots, events), templates and trade-offs.
   Loaded on demand by assets/js/motion.js. */
(function () {
  function starts(lines, t0, cps) {
    var s = t0, out = [];
    lines.forEach(function (l) { out.push(s); s += l.length / cps + 0.08; });
    return out;
  }

JSC.motion.define('day48', {
  kicker: 'JavaScript: Zero to Architect · Day 48',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 48: building for every user, and packaging UI with the browser’s own component model.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 200); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Accessibility and', 0, -44, { size: 78, weight: 800, align: 'center', a: K.clamp(t / 0.6) });
    K.text('Web Components', 0, 46, { size: 78, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 48 · UI for everyone, encapsulated', 640, 340, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['WCAG and POUR', 'Focus and contrast', 'Custom elements'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 450, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ POUR */
{ d: 24, title: 'WCAG: four principles',
  caps: [
    [0.3, 'Accessibility means everyone can use your app: screen reader users, keyboard users, people with low vision, people who need more time.'],
    [6.5, 'The WCAG guidelines group the rules into four principles. Perceivable: text alternatives, captions, contrast, never colour alone.'],
    [13, 'Operable: everything works from a keyboard, with visible focus and no traps. Understandable: clear labels, predictable behaviour.'],
    [19, 'Robust: valid, semantic HTML that assistive technology can understand.']],
  draw: function (K, t) {
    var P = K.P;
    ['screen reader', 'keyboard only', 'low vision', 'needs more time', 'motion sensitive'].forEach(function (c, i) {
      var q = K.back((t - 0.8 - i * 0.5) / 0.5);
      if (q > 0) K.chip(c, 150 + i * 245, 100, { s: q, size: 19, stroke: P.blue });
    });
    var C = [['P', 'Perceivable', ['alt text for images', 'captions for video', 'contrast 4.5:1', 'not colour alone'], 6.8, P.acc],
             ['O', 'Operable', ['works with a keyboard', 'visible focus', 'no keyboard traps', 'enough time'], 13.2, P.purple],
             ['U', 'Understandable', ['clear labels', 'predictable behaviour', 'helpful error messages'], 16, P.warm],
             ['R', 'Robust', ['valid, semantic HTML', 'works with assistive', 'technology'], 19.2, P.green]];
    C.forEach(function (c, i) {
      var x = 40 + i * 305, q = K.back((t - c[3]) / 0.6);
      if (q <= 0) return;
      var a = K.clamp(q), dy = (1 - a) * 30;
      K.box(x, 160 + dy, 285, 376, { stroke: c[4], a: a });
      K.text(c[0], x + 142, 226 + dy, { size: 72, weight: 800, color: c[4], align: 'center', a: a });
      K.text(c[1], x + 142, 296 + dy, { size: 24, weight: 700, align: 'center', a: a });
      c[2].forEach(function (s, k) {
        var b = K.p(t, c[3] + 0.6 + k * 0.5);
        if (!(i === 3 && k === 2)) K.mark(x + 30, 352 + k * 50 + dy, true, 0.55, b);
        K.text(s, x + 52, 352 + k * 50 + dy - (i === 3 && k === 2 ? 22 : 0), { size: 18, a: b });
      });
    });
  } },

/* 3 ─ semantic HTML and names */
{ d: 25, title: 'Semantic HTML first',
  caps: [
    [0.3, 'Many problems start with a div that pretends to be a button. It cannot be tabbed to, ignores Enter and Space, and is read as plain text.'],
    [7, 'A real button element gets the role, focus and keyboard support for free.'],
    [12, 'Every control needs an accessible name: its text, a label, or aria-label for an icon-only button.'],
    [18.5, 'Use ARIA only when no native element fits. No ARIA is better than bad ARIA.']],
  draw: function (K, t) {
    var P = K.P;
    var d = ['<div class="btn" onclick="save()">', '  Save', '</div>'];
    K.panel(40, 76, 600, 170, 'bad.html', { a: K.p(t, 0.2), stroke: t > 2 ? P.red : P.line });
    K.code(d, 64, 118, { size: 20, lh: 1.5, n: K.typed(t, d, [0.6, 1.9, 2.3]), t: t, a: K.p(t, 0.2) });
    [['not in the Tab order', 2.8], ['Enter and Space do nothing', 3.8], ['read as "Save", plain text', 4.8]].forEach(function (r, i) {
      var y = 112 + i * 46, q = K.p(t, r[1]);
      K.mark(700, y, false, 0.7, q); K.text(r[0], 726, y, { size: 19, a: q });
    });
    var b = ['<button type="button">Save</button>'];
    K.panel(40, 264, 600, 130, 'good.html', { a: K.p(t, 7.2), stroke: P.green });
    K.code(b, 64, 314, { size: 20, n: K.typed(t, b, [7.5]), t: t, a: K.p(t, 7.2) });
    [['focusable with Tab', 8.8], ['Enter and Space click it', 9.6], ['read as "Save, button"', 10.4]].forEach(function (r, i) {
      var y = 290 + i * 46, q = K.p(t, r[1]);
      K.mark(700, y, true, 0.7, q); K.text(r[0], 726, y, { size: 19, a: q });
    });

    var n = ['<button>Save</button>', '<label for="q">Search</label><input id="q">', '<button aria-label="Close">×</button>'];
    K.panel(40, 414, 780, 168, 'accessible names', { a: K.p(t, 12.2) });
    n.forEach(function (l, i) {
      var y = 452 + i * 40, q = K.p(t, 12.6 + i * 1.6);
      K.code([l], 64, y, { size: 18, a: q });
      K.text('→ "' + ['Save', 'Search', 'Close'][i] + '"', 690, y + 11, { size: 19, mono: true, color: P.green, a: K.p(t, 13.4 + i * 1.6) });
    });
    var a = K.p(t, 18.7);
    K.box(850, 414, 390, 168, { stroke: P.warm, a: a });
    K.text('No ARIA is better', 1045, 452, { size: 24, weight: 800, color: P.warm, align: 'center', a: a });
    K.text('than bad ARIA', 1045, 486, { size: 24, weight: 800, color: P.warm, align: 'center', a: a });
    K.text('native first: button, a, nav, label', 1045, 540, { size: 16, color: P.muted, align: 'center', a: K.p(t, 19.6) });
  } },

/* 4 ─ focus */
{ d: 27, title: 'Focus management',
  caps: [
    [0.3, 'Keyboard users move with Tab. Keep the tab order logical, and never use positive tabindex values.'],
    [6.5, 'Focus must always be visible. Never remove the outline without a replacement; style :focus-visible instead.'],
    [13, 'When a dialog opens, move focus into it and make the page behind inert. When it closes, return focus to its trigger.'],
    [20, 'For updates that do not move focus, use a live region: role status for news, role alert for errors.']],
  draw: function (K, t) {
    var P = K.P;
    var E = [['Home', 60, 110], ['Search…', 200, 170], ['Go', 400, 80], ['Sign in', 510, 110]];
    K.box(40, 76, 600, 120, { stroke: P.line, a: K.p(t, 0.2) });
    E.forEach(function (e, i) {
      K.box(e[1], 104, e[2], 44, { fill: i === 1 ? P.code : P.card, stroke: P.line, r: 8, a: K.p(t, 0.3) });
      K.text(e[0], e[1] + e[2] / 2, 126, { size: 18, align: 'center', color: i === 1 ? P.muted : P.ink, a: K.p(t, 0.3) });
    });
    var k = Math.min(3, Math.max(0, Math.floor((t - 1.2) / 0.9))), on = t > 1.2 && t < 6.6;
    if (on) { var e = E[k]; K.box(e[1] - 5, 99, e[2] + 10, 54, { fill: false, stroke: P.acc, lw: 3, r: 11 }); }
    K.chip('Tab ⇥', 340, 176, { size: 16, stroke: P.acc, a: K.win(t, 1, 6.4) });
    K.text('tabindex="5" jumps out of order', 340, 176, { size: 16, color: P.red, align: 'center', a: K.p(t, 6.6) });

    var css = [':focus-visible {', '  outline: 3px solid #4fd1c5;', '  outline-offset: 2px;', '}', 'button { outline: none; }  /* ✗ */'];
    K.panel(680, 76, 560, 216, 'focus.css', { a: K.p(t, 6.6) });
    K.code(css, 704, 116, { size: 19, lh: 1.42, n: K.typed(t, css, [7, 8, 9.4, 10.4, 10.9], 30), t: t, a: K.p(t, 6.6),
      marks: t > 11.6 ? { 4: 'rgba(252,129,129,.2)' } : null, w: 536 });

    var pg = K.p(t, 13.2), open = K.win(t, 14, 18.4, 0.4), closed = K.p(t, 18.4);
    K.box(40, 218, 600, 364, { stroke: P.line, a: pg });
    K.text('page', 60, 242, { size: 16, color: P.muted, a: pg });
    [270, 306, 342].forEach(function (y) { K.box(60, y, 300, 18, { fill: P.line, r: 6, a: pg * (1 - open * 0.6) }); });
    K.text('inert', 420, 306, { size: 18, color: P.muted, a: open });
    K.box(60, 520, 190, 44, { fill: P.card, stroke: P.line, r: 8, a: pg });
    K.text('Settings', 155, 542, { size: 18, align: 'center', a: pg });
    K.box(55, 515, 200, 54, { fill: false, stroke: P.acc, lw: 3, r: 11, a: pg * Math.max(1 - K.p(t, 14, 0.3), closed) });
    K.box(220, 372, 380, 130, { fill: P.code, stroke: P.purple, lw: 2.5, a: open });
    K.text('Settings dialog', 240, 396, { size: 17, weight: 700, a: open });
    K.box(240, 418, 200, 40, { fill: P.card, stroke: P.line, r: 8, a: open });
    K.box(235, 413, 210, 50, { fill: false, stroke: P.acc, lw: 3, r: 11, a: open * K.p(t, 14.6) });
    K.text('Name', 254, 438, { size: 16, color: P.muted, a: open });
    K.curve(160, 512, 170, 440, 228, 438, { p: K.p(t, 14.2, 0.5), color: P.acc, lw: 2, head: 9, a: open });
    K.curve(400, 460, 380, 548, 262, 542, { p: K.p(t, 18.4, 0.5), color: P.green, lw: 2, head: 9 });
    K.text('focus back to the trigger', 440, 560, { size: 16, color: P.green, align: 'center', a: K.p(t, 18.8) });

    var lr = ['<div role="status">3 results</div>', '<div role="alert">Payment failed</div>'];
    K.panel(680, 312, 560, 270, 'live regions', { a: K.p(t, 20.2) });
    K.code(lr, 704, 352, { size: 18, lh: 3.0, n: K.typed(t, lr, [20.5, 22], 30), t: t, a: K.p(t, 20.2) });
    K.text('read when the user pauses', 716, 390, { size: 16, color: P.blue, a: K.p(t, 21.6) });
    K.text('read immediately', 716, 444, { size: 16, color: P.red, a: K.p(t, 23.4) });
    K.text('the region must exist before its text changes', 704, 540, { size: 16, color: P.muted, a: K.p(t, 24.4) });
  } },

/* 5 ─ contrast, preferences, testing */
{ d: 25, title: 'Contrast, preferences, testing',
  caps: [
    [0.3, 'Normal text needs a contrast ratio of at least 4.5 to 1. Large text, icons and focus rings need 3 to 1.'],
    [6.5, 'Grey #767676 on white is 4.54 to 1 and passes. #777777 is 4.48 to 1, and just fails.'],
    [12.5, 'Respect user preferences: reduced motion, colour scheme, and zoom up to 400 percent without breaking the layout.'],
    [18.5, 'Test with the keyboard and a real screen reader. Automated tools like axe catch only some of the problems.']],
  draw: function (K, t) {
    var P = K.P;
    var c1 = K.back((t - 0.6) / 0.5), c2 = K.back((t - 2.6) / 0.5);
    if (c1 > 0) K.chip('normal text   4.5 : 1', 390, 100, { s: c1, size: 22, stroke: P.acc, mono: true });
    if (c2 > 0) K.chip('large text · UI · focus   3 : 1', 890, 100, { s: c2, size: 22, stroke: P.purple, mono: true });
    [['#767676', '4.54 : 1', true, 7], ['#777777', '4.48 : 1', false, 9], ['#949494', '3.04 : 1', null, 10.6]].forEach(function (s, i) {
      var x = 40 + i * 405, q = K.p(t, s[3]);
      K.box(x, 150, 390, 150, { fill: '#ffffff', r: 12, a: q });
      K.text('Sample text', x + 24, 196, { size: 26, weight: 600, color: s[0], a: q });
      K.text(s[0], x + 24, 260, { size: 19, mono: true, color: '#1a202c', a: q });
      K.text(s[1], x + 366, 260, { size: 22, mono: true, weight: 700, align: 'right', color: '#1a202c', a: q });
      if (s[2] !== null) K.mark(x + 360, 196, s[2], 0.9, K.p(t, s[3] + 0.6));
      else K.text('large text only', x + 366, 196, { size: 16, color: '#975a16', align: 'right', a: K.p(t, s[3] + 0.6) });
    });
    var css = ['@media (prefers-reduced-motion: reduce) {', '  * { animation: none !important; }', '}'];
    K.panel(40, 326, 600, 150, 'motion.css', { a: K.p(t, 12.6) });
    K.code(css, 64, 368, { size: 19, lh: 1.5, n: K.typed(t, css, [12.9, 14.6, 15.9], 30), t: t, a: K.p(t, 12.6) });
    K.chip('prefers-color-scheme', 180, 530, { size: 17, mono: true, stroke: P.blue, a: K.p(t, 16.4) });
    K.chip('zoom 200–400%', 480, 530, { size: 17, stroke: P.blue, a: K.p(t, 17) });

    K.box(680, 326, 560, 256, { stroke: P.line, a: K.p(t, 18.6) });
    [['keyboard-only pass', 19], ['screen reader: NVDA, VoiceOver', 19.8], ['axe / Lighthouse in CI', 20.6]].forEach(function (r, i) {
      var y = 366 + i * 46, q = K.p(t, r[1]);
      K.mark(712, y, true, 0.7, q); K.text(r[0], 738, y, { size: 19, a: q });
    });
    var bar = K.p(t, 21.6, 1);
    K.text('what automated tools catch', 704, 512, { size: 16, color: P.muted, a: K.p(t, 21.4) });
    K.box(704, 532, 512, 22, { fill: P.code, r: 11, a: K.p(t, 21.4) });
    K.box(704, 532, Math.max(22, 512 * 0.35 * bar), 22, { fill: P.warm, r: 11, a: K.p(t, 21.6) });
    K.text('~30–40%', 704 + 512 * 0.35 + 14, 543, { size: 16, color: P.warm, a: K.p(t, 22.4) });
  } },

/* 6 ─ custom elements */
{ d: 27, title: 'Custom elements',
  caps: [
    [0.3, 'Web Components are the platform’s own component model. A custom element is a class that extends HTMLElement.'],
    [6.5, 'Register it with customElements.define. The name must contain a hyphen, like x-counter.'],
    [12, 'Lifecycle: connectedCallback runs when it joins the page, disconnectedCallback when it leaves. Don’t read attributes in the constructor.'],
    [19.5, 'Changes to observedAttributes call attributeChangedCallback. Attributes are strings; properties can hold any value.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['class XCounter extends HTMLElement {', '  static observedAttributes = ["count"];', '  connectedCallback() { this.render(); }',
                '  disconnectedCallback() { /* clean up */ }', '  attributeChangedCallback(name, old, val) {', '    this.render();', '  }', '}',
                'customElements.define("x-counter", XCounter);'];
    K.panel(40, 76, 700, 330, 'x-counter.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 116, { size: 18, lh: 1.42, n: K.typed(t, code, starts(code, 0.8, 60), 60), t: t, a: K.p(t, 0.2),
      hi: t > 19.6 ? 1 : t > 15.6 ? 3 : t > 12.2 ? 2 : t > 6.8 ? 8 : t > 0.8 ? 0 : -1, w: 676 });
    var L = [['constructor()', 'created: no attributes yet', 12.4, P.muted], ['connectedCallback()', 'joined the page: render, listen', 13.2, P.acc],
             ['attributeChangedCallback()', 'count changed: re-render', 20, P.warm], ['disconnectedCallback()', 'left the page: clean up', 15.8, P.purple]];
    K.text('Lifecycle', 790, 100, { size: 18, weight: 700, color: P.muted, a: K.p(t, 12.2) });
    L.forEach(function (l, i) {
      var y = 140 + i * 70, q = K.p(t, l[2]);
      K.box(790, y - 22, 6, 54, { fill: l[3], r: 3, a: q });
      K.text(l[0], 810, y - 4, { size: 18, mono: true, color: l[3] === P.muted ? P.ink : l[3], a: q });
      K.text(l[1], 810, y + 22, { size: 16, color: P.muted, a: q });
    });
    var u = ['<x-counter count="2"></x-counter>', 'el.setAttribute("count", "3"); // string', 'el.count = 3;                   // number'];
    K.panel(40, 426, 700, 156, '', { a: K.p(t, 7.4) });
    K.code(u, 64, 446, { size: 18, lh: 1.6, n: K.typed(t, u, [7.6, 20.8, 22.6], 34), t: t, a: K.p(t, 7.4) });
    var w = K.p(t, 9), n = t > 21.8 ? '3' : '2';
    K.box(790, 426, 450, 156, { stroke: P.line, a: w });
    K.text('<x-counter>', 812, 452, { size: 16, mono: true, color: P.blue, a: w });
    K.chip('−', 920, 512, { size: 24, stroke: P.acc, a: w });
    K.text(n, 1015, 512, { size: 36, weight: 800, mono: true, align: 'center', color: t > 21.8 ? P.warm : P.ink, a: w });
    K.chip('+', 1110, 512, { size: 24, stroke: P.acc, a: w });
  } },

/* 7 ─ shadow DOM */
{ d: 27, title: 'Shadow DOM',
  caps: [
    [0.3, 'attachShadow gives the element its own hidden tree, called the shadow DOM.'],
    [5.5, 'Styles do not cross the boundary. Page CSS cannot break the inside, and inner styles do not leak out.'],
    [12, 'Slots project the page’s content into the shadow tree. Theme it from outside with CSS custom properties and ::part.'],
    [19, 'Events from inside are retargeted to the host. To cross the boundary, dispatch them with bubbles and composed set to true.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var js = ['const root = this.attachShadow({ mode: "open" });', 'root.innerHTML = "<style>h2 { color: teal }</style>"', '  + "<slot name=title></slot><slot></slot>";'];
    K.panel(40, 76, 700, 130, 'x-card.js', { a: K.p(t, 0.2) });
    K.code(js, 64, 112, { size: 18, lh: 1.45, n: K.typed(t, js, starts(js, 0.6, 45), 45), t: t, a: K.p(t, 0.2) });
    var pc = K.p(t, 5.8);
    K.box(780, 76, 460, 130, { stroke: P.line, a: pc });
    K.text('page.css', 800, 100, { size: 16, color: P.muted, a: pc });
    K.text('h2 { color: red }', 800, 136, { size: 19, mono: true, color: P.red, a: pc });
    K.text('can’t reach inside', 1000, 136, { size: 16, color: P.red, a: K.p(t, 7.6) });
    K.text('inner h2 stays teal', 800, 176, { size: 16, color: P.acc, a: K.p(t, 9.4) });

    var l = K.p(t, 1.6), s = K.p(t, 2.6);
    K.box(40, 226, 520, 200, { stroke: P.blue, a: l });
    K.text('Light DOM (the page)', 60, 250, { size: 16, weight: 700, color: P.blue, a: l });
    K.code(['<x-card>', '  <h2 slot="title">Hello</h2>', '  <p>Body text</p>', '</x-card>'], 64, 280, { size: 18, lh: 1.5, a: l });
    g.save(); g.globalAlpha *= K.p(t, 5.6); g.strokeStyle = P.warm; g.lineWidth = 4; g.setLineDash([10, 8]);
    g.beginPath(); g.moveTo(620, 226); g.lineTo(620, 426); g.stroke(); g.restore();
    K.text('boundary', 620, 214, { size: 16, color: P.warm, align: 'center', a: K.p(t, 5.6) });
    K.arrow(760, 168, 640, 300, { p: K.p(t, 6.8, 0.5), color: P.red, dash: [6, 6], lw: 2 });
    K.mark(640, 300, false, 0.8, K.p(t, 7.3));
    K.box(680, 226, 560, 200, { stroke: P.purple, dash: [8, 6], a: s });
    K.text('Shadow root (inside <x-card>)', 700, 250, { size: 16, weight: 700, color: P.purple, a: s });
    K.code(['<style>h2 { color: teal }</style>', '<slot name="title"></slot>', '<slot></slot>'], 704, 280, { size: 18, lh: 1.6, a: s,
      marks: t > 12.4 ? { 1: 'rgba(79,209,197,.16)', 2: t > 13.6 ? 'rgba(79,209,197,.16)' : null } : null, w: 520 });
    K.curve(400, 324, 560, 300, 700, 326, { p: K.p(t, 12.6, 0.6), color: P.acc, lw: 2, head: 9 });
    K.curve(250, 354, 520, 400, 700, 358, { p: K.p(t, 13.6, 0.6), color: P.acc, lw: 2, head: 9 });

    var th = K.p(t, 15.4);
    K.box(40, 446, 520, 136, { stroke: P.line, a: th });
    K.text('Theming from outside', 60, 470, { size: 16, weight: 700, color: P.muted, a: th });
    K.code(['x-card { --card-bg: navy; }', 'x-card::part(header) { padding: 8px; }'], 64, 494, { size: 18, lh: 1.6, a: th });
    var ev = ['this.dispatchEvent(new CustomEvent("pick",', '  { bubbles: true, composed: true }));'];
    K.panel(600, 446, 640, 136, '', { a: K.p(t, 19.2) });
    K.code(ev, 624, 462, { size: 18, lh: 1.45, n: K.typed(t, ev, [19.5, 21], 34), t: t, a: K.p(t, 19.2) });
    K.text('page sees e.target = <x-card>  (retargeted)', 624, 556, { size: 17, mono: true, color: P.green, a: K.p(t, 22.6) });
  } },

/* 8 ─ templates and trade-offs */
{ d: 23, title: 'Templates and trade-offs',
  caps: [
    [0.3, 'A template element holds inert markup. Nothing in it loads or runs until you clone its content.'],
    [6, 'Declarative shadow DOM, a template with shadowrootmode, lets the server send components ready to paint.'],
    [11.5, 'Trade-offs: aria references can’t cross shadow boundaries, forms need ElementInternals, and SSR takes care.'],
    [17.5, 'No framework is required, and libraries like Lit remove most of the boilerplate.']],
  draw: function (K, t) {
    var P = K.P;
    var tp = ['<template id="row">', '  <li><span class="name"></span></li>', '</template>', 'list.append(tpl.content.cloneNode(true));'];
    K.panel(40, 76, 640, 186, 'list.html', { a: K.p(t, 0.2) });
    K.code(tp, 64, 112, { size: 18, lh: 1.5, n: K.typed(t, tp, starts(tp, 0.6, 40), 40), t: t, a: K.p(t, 0.2), hi: t > 3.4 ? 3 : -1, w: 616 });
    K.box(720, 76, 520, 186, { stroke: P.line, a: K.p(t, 0.6) });
    K.text('template: inert', 740, 100, { size: 16, color: P.muted, a: K.p(t, 0.6) });
    K.box(740, 118, 160, 120, { fill: P.code, stroke: P.purple, dash: [6, 5], a: K.p(t, 0.8) });
    K.text('<li>…</li>', 820, 178, { size: 17, mono: true, color: P.purple, align: 'center', a: K.p(t, 0.8) });
    ['Ana', 'Ben', 'Cy'].forEach(function (n, i) {
      var q = K.back((t - 3.8 - i * 0.6) / 0.5);
      if (q <= 0) return;
      K.arrow(906, 178, 960, 130 + i * 48, { a: K.clamp(q) * 0.7, head: 8, lw: 1.5, color: P.acc });
      K.chip('<li>' + n + '</li>', 1080, 130 + i * 48, { s: q, size: 17, mono: true, stroke: P.acc });
    });

    var ds = ['<x-card>', '  <template shadowrootmode="open">', '    <h2><slot></slot></h2>', '  </template>', '  Rendered on the server', '</x-card>'];
    K.panel(40, 282, 640, 200, 'server.html', { a: K.p(t, 6.2) });
    K.code(ds, 64, 312, { size: 17, lh: 1.42, n: K.typed(t, ds, starts(ds, 6.5, 50), 50), t: t, a: K.p(t, 6.2) });
    K.box(720, 282, 520, 200, { stroke: P.green, a: K.p(t, 8.4) });
    K.text('HTML arrives with the shadow', 740, 340, { size: 20, a: K.p(t, 8.4) });
    K.text('root already attached', 740, 372, { size: 20, a: K.p(t, 8.4) });
    K.text('paints before any JavaScript runs', 740, 430, { size: 18, color: P.green, a: K.p(t, 9.2) });

    [['aria-labelledby can’t cross the boundary', 300, 520, 11.8], ['forms: ElementInternals', 790, 520, 13], ['SSR needs care', 1110, 520, 14]].forEach(function (c) {
      K.chip(c[0], c[1], c[2], { size: 17, stroke: P.warm, a: K.p(t, c[3]) });
    });
    K.chip('no framework needed', 470, 570, { size: 17, stroke: P.green, a: K.p(t, 17.8) });
    K.chip('Lit removes boilerplate', 810, 570, { size: 17, stroke: P.green, a: K.p(t, 18.6) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 48 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['POUR: perceivable, operable, understandable, robust',
     'Semantic HTML first; every control has an accessible name',
     'Visible focus, logical order, focus into and out of dialogs',
     'Contrast 4.5:1 (3:1 large); respect reduced motion',
     'Custom elements: define, lifecycle callbacks, attributes',
     'Shadow DOM: scoped styles, slots, composed events'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 0.95, 0.5), y = 170 + i * 58;
      K.mark(230, y, true, 0.85, q);
      K.text(s, 262 - (1 - q) * 20, y, { size: 23, a: q });
    });
    K.chip('Next: run the Day 48 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
