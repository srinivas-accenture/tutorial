/* Day 17 in motion: capture, target and bubble; target vs currentTarget; stopping events; delegation; listener options;
   IntersectionObserver instead of polling; MutationObserver and friends; custom events. Loaded on demand by assets/js/motion.js. */
(function () {
  /* a node box centred at (x, y) */
  function nd(K, s, x, y, o) {
    o = o || {}; var w = o.w || 100, h = o.h || 40;
    K.box(x - w / 2, y - h / 2, w, h, { stroke: o.stroke || K.P.acc, dash: o.dash, fill: o.fill, a: o.a, lw: o.lw });
    K.text(s, x, y + 1, { size: o.size || 19, mono: o.mono !== false, align: 'center', color: o.color || K.P.ink, a: o.a });
  }
  /* expanding rings: a click */
  function burst(K, x, y, t0, t) {
    var g = K.g, u = t - t0; if (u < 0 || u > 1.2) return;
    for (var k = 0; k < 2; k++) {
      var v = K.clamp((u - k * 0.25) / 0.8); if (v <= 0) continue;
      g.save(); g.globalAlpha *= 1 - v; g.strokeStyle = K.P.warm; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 8 + v * 30, 0, 7); g.stroke(); g.restore();
    }
    g.save(); g.globalAlpha *= 1 - K.clamp((u - 0.6) / 0.6); g.fillStyle = K.P.warm; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); g.restore();
  }
  function dot(K, x, y, c, a) { var g = K.g; g.save(); g.globalAlpha *= a == null ? 1 : K.clamp(a); g.fillStyle = c; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill(); g.restore(); }

JSC.motion.define('day17', {
  kicker: 'JavaScript: Zero to Architect · Day 17',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 17: how events travel through the page, and observers that call you when things change.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Events and observers', 0, 0, { size: 84, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 17 · Reacting to the page', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Capture · target · bubble', 'Delegation', 'Observers'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ three phases */
{ d: 26, title: 'Capture, target, bubble',
  caps: [
    [0.3, 'Click a button and an event object travels through the tree in three phases.'],
    [5.5, 'First capture: from window down through each ancestor towards the target.'],
    [11, 'Then the target phase: listeners on the button itself run, in the order they were added.'],
    [16, 'Then bubble: back up through every ancestor to window. Normal listeners run here, on the way up.'],
    [21.5, 'So with a capture listener on the parent, the log reads: parent capture, child, parent bubble.']],
  draw: function (K, t) {
    var P = K.P, N = ['window', 'document', 'body', 'div#parent', 'button'];
    var cy = 120 + 320 * K.ease((t - 6) / 4.5), by = 440 - 320 * K.ease((t - 16.2) / 4.3);
    N.forEach(function (n, i) {
      var y = 120 + i * 80, par = i === 3, btn = i === 4, st = P.acc;
      if (par && K.win(t, 8.4, 9.8) > 0) st = P.warm;
      if (par && K.win(t, 17.6, 19) > 0) st = P.blue;
      if (btn && t > 10.6 && t < 16.2) st = P.green;
      if (i) K.arrow(210, y - 58, 210, y - 22, { a: K.p(t, 0.6 + i * 0.3), head: 0.1, lw: 2, color: P.line });
      nd(K, n, 210, y, { w: 170, h: 44, a: K.p(t, 0.5 + i * 0.3), stroke: st, lw: st === P.acc ? 2 : 3 });
    });
    K.text('capture ↓', 95, 84, { size: 18, weight: 700, color: P.warm, align: 'center', a: K.p(t, 5.6) });
    K.arrow(95, 104, 95, 452, { p: K.p(t, 5.6, 4.8), color: P.warm, dash: [6, 6], lw: 2 });
    K.text('bubble ↑', 325, 84, { size: 18, weight: 700, color: P.blue, align: 'center', a: K.p(t, 16) });
    K.arrow(325, 452, 325, 104, { p: K.p(t, 16, 4.4), color: P.blue, dash: [6, 6], lw: 2 });
    if (t > 6 && t < 10.8) dot(K, 95, cy, P.warm, K.p(t, 6, 0.3));
    if (t > 10.6 && t < 16.4) { var pu = 1 + 0.15 * Math.sin(t * 6); K.g.save(); K.g.translate(210, 440); K.g.scale(pu, pu); dot(K, 0, 0, P.green, 0.35); K.g.restore(); }
    if (t > 16.2 && t < 21) dot(K, 325, by, P.blue, 1 - K.p(t, 20.5, 0.4));
    K.text('target phase', 210, 492, { size: 18, color: P.green, align: 'center', a: K.p(t, 11) });
    var code = ['const log = console.log;', 'p.addEventListener("click", () => log("parent bubble"));',
      'p.addEventListener("click", () => log("parent capture"), true);', 'c.addEventListener("click", () => log("child"));', 'c.click();'];
    var hi = t > 21.5 ? -1 : t > 17.8 ? 1 : t > 11.2 ? 3 : t > 8.6 ? 2 : -1;
    K.panel(440, 84, 800, 214, 'events.js', { a: K.p(t, 0.4) });
    K.code(code, 466, 124, { size: 19, lh: 1.55, n: K.typed(t, code, [0.6, 1.2, 2.2, 3.2, 4.2], 50), t: t, a: K.p(t, 0.4), hi: hi, w: 760 });
    K.panel(440, 320, 800, 168, 'Console', { a: K.p(t, 4.6) });
    [['parent capture', 8.8, P.warm], ['child', 12, P.green], ['parent bubble', 18, P.blue]].forEach(function (o, i) {
      K.text((i + 1) + '.  ' + o[0], 466, 372 + i * 36, { size: 21, mono: true, color: o[2], a: K.p(t, o[1], 0.3) });
    });
    K.chip('default: bubble phase · true / { capture: true }: on the way down', 840, 540, { size: 18, stroke: P.acc, a: K.p(t, 22) });
  } },

/* 3 ─ target, currentTarget, stopping */
{ d: 26, title: 'target and stopping events',
  caps: [
    [0.3, 'Inside a listener, event.target is where the event started. event.currentTarget is the element whose listener is running.'],
    [7, "preventDefault cancels the browser's default action, like following a link or submitting a form. It does not stop propagation."],
    [13.5, 'stopPropagation stops the event from reaching any further nodes.'],
    [18.5, 'stopImmediatePropagation also skips the remaining listeners on the same node: 1 and 2 log, 3 never runs.']],
  draw: function (K, t) {
    var P = K.P, a = K.p(t, 0.3);
    K.box(40, 84, 540, 250, { stroke: P.acc, a: a });
    K.text('<ul>', 62, 110, { size: 19, mono: true, color: P.acc, a: a });
    K.chip('click listener', 480, 110, { size: 15, stroke: P.purple, a: a });
    K.box(80, 140, 460, 170, { stroke: P.line, a: K.p(t, 0.5) });
    K.text('<li>', 100, 164, { size: 19, mono: true, color: P.muted, a: K.p(t, 0.5) });
    K.box(150, 196, 220, 84, { stroke: t > 1.6 && t < 7 ? P.warm : P.line, lw: 2.5, a: K.p(t, 0.7) });
    K.text('<b>one</b>', 260, 238, { size: 21, mono: true, align: 'center', a: K.p(t, 0.7) });
    burst(K, 300, 258, 1, t);
    K.chip('e.target → <b>', 170, 372, { mono: true, size: 18, stroke: P.warm, color: P.warm, a: K.p(t, 1.8) });
    K.chip('e.currentTarget → <ul>', 430, 372, { mono: true, size: 18, stroke: P.acc, color: P.acc, a: K.p(t, 3.6) });
    /* preventDefault */
    var pd = K.p(t, 7.2);
    K.box(620, 84, 620, 136, { stroke: P.warm, a: pd });
    K.text('e.preventDefault()', 644, 114, { size: 22, mono: true, color: P.warm, a: pd });
    K.text('link: no navigation  ·  form: no submit', 644, 154, { size: 18, a: K.p(t, 8.2) });
    K.mark(658, 192, true, 0.7, K.p(t, 10.4)); K.text('the event still propagates', 680, 192, { size: 18, color: P.green, a: K.p(t, 10.4) });
    /* stopPropagation */
    var sp = K.p(t, 13.6);
    K.box(620, 238, 620, 140, { stroke: P.blue, a: sp });
    K.text('e.stopPropagation()', 644, 266, { size: 22, mono: true, color: P.blue, a: sp });
    var cut = K.p(t, 15);
    [['button', 720], ['div', 900], ['body', 1080]].forEach(function (n, i) {
      nd(K, n[0], n[1], 330, { w: 120, a: sp * (i && cut > 0 ? 1 - cut * 0.65 : 1), size: 18, stroke: i ? P.line : P.blue });
      if (i) K.arrow(n[1] - 110, 330, n[1] - 64, 330, { a: sp * (1 - cut * 0.65), head: 10, lw: 2 });
    });
    K.box(806, 304, 5, 52, { fill: P.red, r: 2, a: cut });
    K.text('stops here', 820, 296, { size: 16, color: P.red, a: cut });
    /* stopImmediatePropagation */
    var si = K.p(t, 18.6), code = ['el.addEventListener("x", () => log(1));', 'el.addEventListener("x", (e) => { log(2); e.stopImmediatePropagation(); });',
      'el.addEventListener("x", () => log(3));', 'el.dispatchEvent(new Event("x"));'];
    K.panel(40, 410, 1200, 176, '', { a: si });
    K.code(code, 64, 428, { size: 19, lh: 1.55, n: K.typed(t, code, [18.7, 19.6, 21, 21.8], 60), t: t, a: si, w: 790,
      marks: t > 23 ? { 2: 'rgba(252,129,129,.16)' } : null });
    K.text('1', 910, 452, { size: 24, mono: true, color: P.green, a: K.p(t, 22.6) });
    K.text('2', 950, 452, { size: 24, mono: true, color: P.green, a: K.p(t, 22.9) });
    K.mark(918, 510, false, 0.8, K.p(t, 23.3)); K.text('3 never runs', 944, 510, { size: 20, color: P.red, a: K.p(t, 23.3) });
  } },

/* 4 ─ delegation */
{ d: 26, title: 'Event delegation',
  caps: [
    [0.3, 'Delegation: instead of one listener per item, put a single listener on the parent.'],
    [6, 'A click on a nested <b> bubbles up to the list. e.target is the <b>, so use closest("li") to find the item.'],
    [13, 'Items added later just work, because the listener lives on the parent, not on the items.'],
    [18.5, 'Some events do not bubble: focus, blur, mouseenter, mouseleave. Delegate with focusin and focusout instead.']],
  draw: function (K, t) {
    var P = K.P, code = ['list.addEventListener("click", (e) => {', '  const li = e.target.closest("li");', '  if (li && list.contains(li)) toggle(li);', '});', '',
      'list.append(newItem);   // handled too'];
    var cp = K.p(t, 3);
    K.panel(40, 84, 640, 300, 'todo.js', { a: cp });
    K.code(code, 66, 126, { size: 19, lh: 1.6, n: K.typed(t, code, [3.2, 7.4, 9.4, 10.8, 13.3, 13.3], 40), t: t, a: cp, w: 600,
      hi: t > 7.4 && t < 13 ? 1 : t > 13.6 && t < 18.5 ? 5 : -1 });
    K.box(720, 84, 520, 340, { stroke: P.acc, a: K.p(t, 0.3) });
    K.text('<ul id="list">', 744, 110, { size: 18, mono: true, color: P.acc, a: K.p(t, 0.3) });
    var one = K.back((t - 3.6) / 0.6);
    if (one > 0) K.chip('one listener', 1150, 110, { s: one, size: 16, stroke: P.purple, color: P.purple });
    var items = ['Buy milk', '', 'Walk dog', 'Read book'], hit = K.win(t, 8.8, 13);
    items.forEach(function (s, i) {
      var y = 166 + i * 62, late = i === 3, q = late ? K.back((t - 13.4) / 0.6) : K.p(t, 0.5 + i * 0.3, 0.4);
      if (q <= 0) return;
      K.g.save(); K.g.translate(915, y); K.g.scale(late ? q : 1, late ? q : 1);
      K.box(-165, -24, 330, 48, { stroke: late ? P.warm : (i === 1 && hit > 0 ? P.warm : P.line), lw: i === 1 && hit > 0 ? 3 : 2, a: late ? 1 : q });
      K.text('<li>', -150, 0, { size: 16, mono: true, color: P.muted, a: late ? 1 : q });
      if (i === 1) { K.box(-96, -16, 60, 32, { stroke: P.blue, a: q, r: 6 }); K.text('Call', -66, 1, { size: 18, weight: 700, align: 'center', a: q }); K.text('mom', -26, 0, { size: 18, a: q }); }
      else K.text(s, -92, 0, { size: 18, a: late ? 1 : q });
      K.g.restore();
      K.chip('click', 1150, y, { size: 14, stroke: P.purple, a: Math.min(q, K.win(t, 0.9 + i * 0.3, 3.4)) });
    });
    burst(K, 858, 228, 6.4, t);
    K.curve(870, 212, 980, 120, 1080, 112, { p: K.p(t, 6.8, 0.8), color: P.blue, lw: 2.5 });
    K.text('e.target: <b>', 744, 450, { size: 18, mono: true, color: P.warm, a: K.p(t, 7.4) });
    K.text('e.target.closest("li"): the whole <li>', 744, 480, { size: 18, mono: true, color: P.warm, a: K.p(t, 8.8) });
    burst(K, 900, 352, 15, t);
    K.mark(1110, 352, true, 0.8, K.p(t, 15.6)); K.text('handled', 1132, 352, { size: 17, color: P.green, a: K.p(t, 15.6) });
    /* non-bubbling events */
    var nb = K.p(t, 18.7);
    K.text('do not bubble', 64, 450, { size: 18, color: P.red, a: nb });
    ['focus', 'blur', 'mouseenter', 'mouseleave'].forEach(function (s, i) {
      K.chip(s, 100 + i * 140 + (i > 1 ? (i - 2) * 30 + 10 : 0), 492, { mono: true, size: 17, stroke: P.red, a: K.p(t, 18.9 + i * 0.3) });
    });
    K.text('bubble instead', 64, 548, { size: 18, color: P.green, a: K.p(t, 21) });
    ['focusin', 'focusout', 'mouseover', 'mouseout'].forEach(function (s, i) {
      K.chip(s, 260 + i * 130, 548, { mono: true, size: 17, stroke: P.green, a: K.p(t, 21.2 + i * 0.3) });
    });
  } },

/* 5 ─ listener options */
{ d: 25, title: 'Listener options',
  caps: [
    [0.3, 'addEventListener takes options. once: true removes the listener after its first call.'],
    [6, 'passive: true promises you will not call preventDefault, so scrolling never waits for your handler.'],
    [12, 'signal ties listeners to an AbortController. One abort() call removes them all.'],
    [18, 'removeEventListener needs the very same function, so an inline arrow can never be removed. Use signal or once.']],
  draw: function (K, t) {
    var P = K.P, code = ['btn.addEventListener("click", save, { once: true });', 'window.addEventListener("wheel", onWheel, { passive: true });',
      'const ctrl = new AbortController();', 'window.addEventListener("resize", fit, { signal: ctrl.signal });',
      'document.addEventListener("keydown", onKey, { signal: ctrl.signal });', 'ctrl.abort();   // both listeners removed'];
    var hi = t > 16 && t < 18 ? 5 : t > 12.2 && t < 16 ? 3 : t > 6.2 && t < 12 ? 1 : t > 0.6 && t < 6 ? 0 : -1;
    K.panel(40, 84, 790, 250, 'options.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 122, { size: 18, lh: 1.6, n: K.typed(t, code, [0.6, 6.2, 12.2, 12.9, 14, 15.8], 46), t: t, a: K.p(t, 0.2), hi: hi, w: 770 });
    /* once */
    var o = K.p(t, 1.8);
    K.box(860, 84, 380, 104, { stroke: P.acc, a: o });
    K.text('once', 880, 108, { size: 19, weight: 700, color: P.acc, a: o });
    K.text('click 1 → save()', 880, 140, { size: 17, mono: true, a: K.p(t, 2.6) }); K.mark(1200, 140, true, 0.6, K.p(t, 2.6));
    K.text('click 2 → nothing', 880, 168, { size: 17, mono: true, color: P.muted, a: K.p(t, 4) });
    /* passive */
    var pa = K.p(t, 6.6);
    K.box(860, 204, 380, 104, { stroke: P.blue, a: pa });
    K.text('passive', 880, 228, { size: 19, weight: 700, color: P.blue, a: pa });
    K.box(880, 252, 340, 12, { fill: P.code, r: 6, a: pa });
    var sc = t < 7.4 ? 0 : ((t - 7.4) * 0.35) % 1;
    K.box(880 + sc * 260, 252, 80, 12, { fill: P.blue, r: 6, a: pa });
    K.text('scrolls at once, no waiting', 880, 288, { size: 17, color: P.green, a: K.p(t, 8.4) });
    /* signal */
    var sg = K.p(t, 12.4), ab = K.p(t, 16.4);
    K.box(860, 324, 380, 104, { stroke: P.purple, a: sg });
    K.text('signal', 880, 348, { size: 19, weight: 700, color: P.purple, a: sg });
    K.chip('resize', 960, 394, { mono: true, size: 16, stroke: P.purple, a: K.p(t, 13.2) * (1 - ab * 0.7) });
    K.chip('keydown', 1100, 394, { mono: true, size: 16, stroke: P.purple, a: K.p(t, 14.3) * (1 - ab * 0.7) });
    K.mark(1004, 378, false, 0.6, ab); K.mark(1152, 378, false, 0.6, ab);
    /* remove gotcha */
    var rg = K.p(t, 18.2), rc = ['el.addEventListener("click", () => go());', 'el.removeEventListener("click", () => go());   // a new function: nothing removed'];
    K.panel(40, 452, 1200, 128, '', { a: rg });
    K.code(rc, 64, 478, { size: 19, lh: 1.65, n: K.typed(t, rc, [18.3, 19.6], 44), t: t, a: rg, w: 1150, marks: t > 21.6 ? { 1: 'rgba(252,129,129,.16)' } : null });
    K.mark(1200, 520, false, 0.8, K.p(t, 21.6));
  } },

/* 6 ─ IntersectionObserver */
{ d: 26, title: 'Observe, do not poll',
  caps: [
    [0.3, 'Polling with setInterval and getBoundingClientRect wastes CPU and forces layout again and again.'],
    [6.5, 'Observers flip it around: the browser calls you when something changes. IntersectionObserver watches visibility.'],
    [13, 'As an image scrolls near the viewport, its entry has isIntersecting true. Load it, then unobserve it.'],
    [19.5, 'Use it for lazy loading, infinite scroll and impressions. For plain images, loading="lazy" is often enough.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    /* the scrolling page */
    var sc = Math.max(0, Math.min(330, (t - 13.2) * 60));
    K.text('viewport', 240, 96, { size: 17, color: P.acc, align: 'center', a: K.p(t, 0.3) });
    g.save(); g.beginPath(); g.rect(60, 108, 360, 480); g.clip();
    [150, 500, 680, 860].forEach(function (y0, i) {
      var y = y0 - sc, on = y < 470, q = K.p(t, 0.4 + i * 0.2);
      K.box(110, y, 260, 110, { fill: on ? 'rgba(104,211,145,.16)' : P.card, stroke: on ? P.green : P.muted, dash: on ? null : [6, 6], a: q });
      if (y + 55 > 132 && y + 55 < 462) K.text(on ? 'img #' + (i + 1) + ' loaded' : 'img #' + (i + 1) + ' placeholder', 240, y + 55, { size: 18, align: 'center', color: on ? P.green : P.muted, a: q });
    });
    g.restore();
    K.box(90, 110, 300, 260, { fill: false, stroke: P.acc, lw: 3, a: K.p(t, 0.3) });
    var rm = K.p(t, 9);
    K.box(90, 370, 300, 100, { fill: false, stroke: P.warm, dash: [7, 6], a: rm });
    K.text('rootMargin 200px', 240, 490, { size: 16, color: P.warm, align: 'center', a: rm });
    /* polling */
    var pw = K.win(t, 0.3, 6.6), pc = ['setInterval(() => {', '  if (img.getBoundingClientRect().top < innerHeight) load(img);', '}, 100);'];
    K.panel(460, 84, 780, 150, 'polling.js', { a: pw });
    K.code(pc, 484, 122, { size: 19, n: K.typed(t, pc, [0.5, 1.2, 2.6], 50), t: t, a: pw });
    for (var i = 0; i < 16; i++) K.box(470 + i * 48, 262, 36, 30, { fill: 'rgba(252,129,129,.18)', stroke: P.red, a: Math.min(pw, K.p(t, 2.6 + i * 0.15, 0.3)) });
    K.text('forced layout every 100 ms, even when nothing moves', 470, 320, { size: 18, color: P.red, a: Math.min(pw, K.p(t, 4)) });
    /* observer */
    var ow = K.p(t, 6.8), oc = ['const io = new IntersectionObserver((entries) => {', '  for (const e of entries) {', '    if (!e.isIntersecting) continue;',
      '    e.target.src = e.target.dataset.src;', '    io.unobserve(e.target);', '  }', '}, { rootMargin: "200px" });', 'imgs.forEach((img) => io.observe(img));'];
    K.panel(460, 84, 780, 292, 'lazy.js', { a: ow });
    K.code(oc, 484, 120, { size: 19, lh: 1.5, n: K.typed(t, oc, [7, 8, 8.6, 9.4, 10.2, 10.9, 11, 11.8], 46), t: t, a: ow, w: 740,
      hi: t > 13.6 && t < 19.5 ? (t < 15.5 ? 2 : 3) : -1 });
    var en = K.p(t, 13.8);
    K.panel(460, 396, 780, 104, '', { a: en });
    K.text('entry img #2   isIntersecting: true   → load, unobserve', 484, 428, { size: 17, mono: true, color: P.green, a: en });
    K.text('entry img #3   isIntersecting: true   → load, unobserve', 484, 466, { size: 17, mono: true, color: P.green, a: K.p(t, 16.8) });
    [['lazy loading', 540], ['infinite scroll', 720], ['impressions', 890], ['<img loading="lazy">', 1110]].forEach(function (c, i) {
      K.chip(c[0], c[1], 548, { size: 17, mono: i === 3, stroke: i === 3 ? P.green : P.acc, a: K.p(t, 19.7 + i * 0.4) });
    });
  } },

/* 7 ─ MutationObserver and friends */
{ d: 25, title: 'More observers',
  caps: [
    [0.3, 'MutationObserver reports DOM changes: added or removed children, attributes, text.'],
    [6.5, 'Its records are batched and delivered as a microtask, after the current code finishes.'],
    [12.5, 'ResizeObserver reports element size changes. PerformanceObserver streams metrics like LCP and long tasks.'],
    [18.5, 'Observers keep references to their targets. Call disconnect when you are done.']],
  draw: function (K, t) {
    var P = K.P, code = ['const mo = new MutationObserver((records) => {', '  console.log(records.length, "changes");', '});',
      'mo.observe(box, { childList: true, attributes: true });', 'box.append(span);', 'box.setAttribute("data-x", "1");', 'console.log("sync done");'];
    K.panel(40, 84, 640, 262, 'watch.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 120, { size: 19, lh: 1.5, n: K.typed(t, code, [0.5, 1.6, 2.6, 2.8, 3.8, 4.6, 6.6], 46), t: t, a: K.p(t, 0.2), w: 610,
      hi: t > 3.9 && t < 6.5 ? (t < 4.7 ? 4 : 5) : -1 });
    K.panel(40, 366, 640, 104, 'Console', { a: K.p(t, 6.6) });
    K.text('sync done', 64, 412, { size: 20, mono: true, a: K.p(t, 7.4) });
    K.text('2 changes', 64, 444, { size: 20, mono: true, color: P.green, a: K.p(t, 9.6) });
    /* timeline */
    var tl = K.p(t, 3.6);
    K.box(720, 84, 520, 262, { fill: false, stroke: P.line, dash: [8, 6], a: tl });
    K.text('call stack', 740, 116, { size: 17, color: P.muted, a: tl });
    K.box(740, 132, 300, 40, { fill: 'rgba(79,209,197,.2)', stroke: P.acc, a: tl, r: 8 });
    K.text('your script', 890, 153, { size: 17, align: 'center', a: tl });
    K.text('pending records', 740, 206, { size: 17, color: P.muted, a: K.p(t, 4) });
    var mv = K.p(t, 8.8, 0.8);
    K.chip('childList', 810 + mv * 300, 248 + mv * 52, { size: 16, mono: true, stroke: P.purple, a: K.p(t, 4.2) * (1 - mv) });
    K.chip('attributes', 940 + mv * 170, 248 + mv * 52, { size: 16, mono: true, stroke: P.purple, a: K.p(t, 4.9) * (1 - mv) });
    K.text('microtask', 1060, 116, { size: 17, color: P.muted, a: K.p(t, 7.6) });
    K.box(1060, 132, 160, 40, { fill: 'rgba(183,148,244,.22)', stroke: P.purple, a: K.p(t, 7.6), r: 8 });
    K.text('callback', 1140, 153, { size: 17, align: 'center', a: K.p(t, 7.6) });
    K.chip('2 records, one call', 1110, 300, { size: 16, stroke: P.purple, color: P.purple, a: K.p(t, 9.4) });
    K.arrow(1140, 280, 1140, 178, { p: K.p(t, 9.6, 0.5), color: P.purple, lw: 2, head: 10 });
    /* resize + performance */
    var rz = K.p(t, 12.7), pf = K.p(t, 14.8);
    K.box(720, 372, 250, 170, { stroke: P.blue, a: rz });
    K.text('ResizeObserver', 740, 398, { size: 18, weight: 700, color: P.blue, a: rz });
    var w = 80 + 60 * (0.5 + 0.5 * Math.sin((t - 12.7) * 1.6));
    K.box(740, 424, w, 50, { fill: 'rgba(99,179,237,.2)', stroke: P.blue, a: rz, r: 6 });
    K.text('entry.contentRect', 740, 504, { size: 16, mono: true, color: P.muted, a: rz });
    K.box(990, 372, 250, 170, { stroke: P.warm, a: pf });
    K.text('PerformanceObserver', 1010, 398, { size: 18, weight: 700, color: P.warm, a: pf });
    [['LCP', 1045, 444], ['long tasks', 1155, 444], ['layout shifts', 1100, 494]].forEach(function (c, i) { K.chip(c[0], c[1], c[2], { size: 15, stroke: P.warm, a: K.p(t, 15.4 + i * 0.4) }); });
    /* disconnect */
    var dc = K.p(t, 18.7);
    K.chip('mo.disconnect()', 140, 530, { mono: true, size: 19, stroke: P.green, color: P.green, s: K.back((t - 18.7) / 0.6), a: dc });
    K.text('stop watching, release the references', 270, 530, { size: 18, color: P.muted, a: K.p(t, 19.4) });
  } },

/* 8 ─ custom events */
{ d: 21, title: 'Custom events',
  caps: [
    [0.3, 'You can create your own events with CustomEvent. The payload goes in detail.'],
    [6.5, 'Any object can be an event bus: extend EventTarget and dispatch events on it.'],
    [12.5, 'dispatchEvent runs the listeners synchronously, right now. Real user clicks arrive later, as tasks.']],
  draw: function (K, t) {
    var P = K.P;
    var ev = K.p(t, 0.5);
    K.box(780, 84, 460, 164, { stroke: P.warm, a: ev });
    K.text('new CustomEvent("saved", …)', 800, 112, { size: 18, mono: true, color: P.warm, a: ev });
    K.text('type:    "saved"', 800, 152, { size: 19, mono: true, a: K.p(t, 1.4) });
    K.text('detail:  { id: 7 }', 800, 186, { size: 19, mono: true, color: P.green, a: K.p(t, 2.4) });
    K.text('bubbles: false (default)', 800, 220, { size: 19, mono: true, color: P.muted, a: K.p(t, 3.4) });
    var code = ['class Bus extends EventTarget {', '  emit(type, detail) {', '    this.dispatchEvent(new CustomEvent(type, { detail }));', '  }', '}',
      'const bus = new Bus();', 'bus.addEventListener("saved", (e) => log(e.detail.id));', 'bus.emit("saved", { id: 7 });', 'log("after emit");'];
    var cp = K.p(t, 6.6);
    K.panel(40, 84, 700, 304, 'bus.js', { a: cp });
    K.code(code, 64, 118, { size: 19, lh: 1.5, n: K.typed(t, code, [6.8, 7.4, 8, 9.2, 9.4, 9.8, 10.4, 12.7, 13.6], 46), t: t, a: cp, w: 670,
      hi: t > 12.7 && t < 14.6 ? 7 : -1 });
    /* bus diagram */
    var bd = K.p(t, 9.8);
    nd(K, 'bus', 860, 316, { w: 110, a: bd, stroke: P.purple });
    nd(K, 'listener', 1130, 316, { w: 150, a: K.p(t, 10.6), stroke: P.acc });
    K.arrow(918, 316, 1050, 316, { p: K.p(t, 10.6, 0.5), color: P.muted, lw: 2 });
    var u = K.clamp((t - 13) / 0.6);
    if (t > 13 && t < 14.2) dot(K, 918 + u * 130, 316, P.warm);
    K.text('"saved"', 984, 290, { size: 16, mono: true, color: P.warm, align: 'center', a: K.p(t, 13) });
    K.panel(780, 400, 460, 120, 'Console', { a: K.p(t, 12.6) });
    K.text('7', 804, 446, { size: 21, mono: true, color: P.green, a: K.p(t, 13.6) });
    K.text('after emit', 804, 484, { size: 21, mono: true, a: K.p(t, 14.4) });
    K.text('listener ran first: synchronous', 1010, 548, { size: 18, color: P.green, align: 'center', a: K.p(t, 15.2) });
    var rq = K.p(t, 16.4);
    K.box(40, 410, 700, 150, { fill: P.code, stroke: P.line, a: rq });
    K.text('el.dispatchEvent(e)', 64, 446, { size: 20, mono: true, a: rq });
    K.text('→ listeners run now, then the next line', 300, 446, { size: 18, color: P.green, a: rq });
    K.text('real user click', 64, 512, { size: 20, mono: true, a: K.p(t, 17.6) });
    K.text('→ queued as a task, runs later', 300, 512, { size: 18, color: P.blue, a: K.p(t, 17.6) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 17 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 106, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Events travel down (capture), hit the target, then bubble up',
     'target is where it started; currentTarget runs the listener',
     'preventDefault cancels the action; stopPropagation stops travel',
     'Delegate: one listener on the parent plus closest()',
     'Clean listeners with once, passive and an AbortController signal',
     'Observers instead of polling; CustomEvent for your own events'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 17 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
