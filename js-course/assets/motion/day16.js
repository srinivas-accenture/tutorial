/* Day 16 in motion: the DOM as a tree of host objects, selecting, live vs static collections, content APIs,
   attributes vs properties, batching with fragments, and when the DOM is ready. Loaded on demand by assets/js/motion.js. */
(function () {
  /* a node box centred at (x, y) */
  function nd(K, s, x, y, o) {
    o = o || {}; var w = o.w || 100, h = o.h || 40;
    K.box(x - w / 2, y - h / 2, w, h, { stroke: o.stroke || K.P.acc, dash: o.dash, fill: o.fill, a: o.a, lw: o.lw });
    K.text(s, x, y + 1, { size: o.size || 19, mono: o.mono !== false, align: 'center', color: o.color || K.P.ink, a: o.a });
  }
  /* a plain tree edge */
  function ed(K, x1, y1, x2, y2, a, c, lw) { K.arrow(x1, y1, x2, y2, { a: a, head: 0.1, lw: lw || 2, color: c || K.P.line }); }

JSC.motion.define('day16', {
  kicker: 'JavaScript: Zero to Architect · Day 16',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 16: the DOM, the live tree of objects behind every web page.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('The DOM', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 16 · The page as a tree of objects', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Nodes and the tree', 'Live vs static', 'Fast, safe updates'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ HTML text becomes a tree */
{ d: 24, title: 'From HTML text to a tree',
  caps: [
    [0.3, 'HTML is just text. The browser parser turns it into a tree of node objects: the Document Object Model.'],
    [6, 'Every tag becomes an element node. Every piece of text becomes a text node.'],
    [11.5, 'The parser also repairs HTML: the missing </p> is closed for you, and html and head are added.'],
    [16.5, 'Links between nodes let you walk the tree: parentNode, nextElementSibling, firstChild.']],
  draw: function (K, t) {
    var P = K.P, src = ['<body>', '  <h1>Hello</h1>', '  <p>Intro', '  <ul>', '    <li>one</li>', '  </ul>', '</body>'];
    K.panel(40, 84, 540, 284, 'index.html', { a: K.p(t, 0.2) });
    K.code(src, 70, 128, { size: 21, n: K.typed(t, src, [0.6, 0.9, 1.3, 1.6, 1.9, 2.3, 2.5], 50), t: t, a: K.p(t, 0.2),
      hi: t > 11.8 && t < 16.5 ? 2 : -1, w: 500 });
    K.arrow(592, 220, 640, 220, { p: K.p(t, 2.6, 0.5), color: P.acc });
    K.text('parse', 616, 196, { size: 16, color: P.acc, align: 'center', a: K.p(t, 2.6) });
    var fix = K.win(t, 11.8, 16.5), walk = K.p(t, 16.8);
    /* element nodes */
    var a0 = K.p(t, 3, 0.4), a1 = K.p(t, 3.4, 0.4), a2 = K.p(t, 3.8, 0.4), a3 = K.p(t, 4.3, 0.4), a4 = K.p(t, 4.8, 0.4);
    ed(K, 900, 120, 900, 150, a1); ed(K, 900, 190, 730, 230, a2); ed(K, 900, 190, 1070, 230, a2);
    ed(K, 1070, 270, 900, 320, a3, walk > 0 ? P.purple : null, walk > 0 ? 3 : 2);
    ed(K, 1070, 270, 1040, 320, a3); ed(K, 1070, 270, 1175, 320, a3); ed(K, 1175, 360, 1175, 410, a4);
    nd(K, 'document', 900, 100, { w: 140, a: a0, stroke: P.purple });
    nd(K, 'html', 900, 170, { a: a1, stroke: fix > 0 ? P.warm : P.acc });
    nd(K, 'head', 730, 250, { a: a2, stroke: fix > 0 ? P.warm : P.acc });
    nd(K, 'body', 1070, 250, { a: a2 });
    nd(K, 'h1', 900, 340, { w: 90, a: a3 }); nd(K, 'p', 1040, 340, { w: 90, a: a3, stroke: fix > 0 ? P.warm : P.acc });
    nd(K, 'ul', 1175, 340, { w: 90, a: a3 }); nd(K, 'li', 1175, 430, { w: 90, a: a4 });
    /* text nodes */
    var b0 = K.p(t, 6.4, 0.4), b1 = K.p(t, 6.8, 0.4), b2 = K.p(t, 7.2, 0.4);
    ed(K, 900, 360, 900, 410, b0, walk > 0 ? P.green : null, walk > 0 ? 3 : 2); ed(K, 1040, 360, 1040, 410, b1); ed(K, 1175, 450, 1175, 490, b2);
    nd(K, '"Hello"', 900, 430, { w: 100, a: b0, stroke: P.green, dash: [6, 5], color: P.green });
    nd(K, '"Intro"', 1040, 430, { w: 100, a: b1, stroke: P.green, dash: [6, 5], color: P.green });
    nd(K, '"one"', 1175, 510, { w: 90, a: b2, stroke: P.green, dash: [6, 5], color: P.green });
    K.chip('element node', 760, 560, { size: 17, stroke: P.acc, a: K.p(t, 6.2) });
    K.chip('text node', 920, 560, { size: 17, stroke: P.green, color: P.green, a: K.p(t, 6.6) });
    K.text('added by the parser', 730, 300, { size: 16, color: P.warm, align: 'center', a: fix });
    /* repair note */
    K.box(40, 390, 540, 120, { fill: 'rgba(246,173,85,.10)', stroke: P.warm, a: fix });
    K.text('no </p>? A <ul> cannot sit inside a <p>,', 64, 428, { size: 18, color: P.warm, a: fix });
    K.text('so the parser closes the <p> first.', 64, 466, { size: 18, color: P.warm, a: fix });
    /* walking */
    var wc = ['const h1 = document.querySelector("h1");', 'h1.parentNode          // <body>', 'h1.nextElementSibling  // <p>', 'h1.firstChild          // "Hello"'];
    K.panel(40, 390, 540, 196, '', { a: walk });
    K.code(wc, 82, 408, { size: 18, lh: 1.6, n: K.typed(t, wc, [16.9, 18.2, 19.4, 20.6], 40), t: t, a: walk });
    [[P.purple, 1, 18.6], [P.warm, 2, 19.8], [P.green, 3, 21]].forEach(function (c) {
      var q = K.p(t, c[2], 0.3), g = K.g;
      g.save(); g.globalAlpha *= q; g.fillStyle = c[0]; g.beginPath(); g.arc(62, 418 + c[1] * 29, 6, 0, 7); g.fill(); g.restore();
    });
    K.arrow(947, 340, 993, 340, { p: K.p(t, 19.8, 0.4), color: P.warm, head: 11 });
    K.arrow(975, 300, 1035, 272, { p: K.p(t, 18.6, 0.4), color: P.purple, head: 11 });
  } },

/* 3 ─ host objects and the prototype chain */
{ d: 24, title: 'Nodes are objects',
  caps: [
    [0.3, 'DOM nodes are host objects: real JavaScript objects that the browser creates for you.'],
    [6, 'A div inherits from HTMLDivElement, HTMLElement, Element, Node and EventTarget, and finally Object.'],
    [12.5, 'Each level adds features. Element brings querySelector and attributes; Node brings tree links and textContent.'],
    [18, 'addEventListener lives on EventTarget, so every node can receive events. Node.js has no DOM at all.']],
  draw: function (K, t) {
    var P = K.P;
    var L = [['<div>', ''], ['HTMLDivElement', 'one interface per tag type'], ['HTMLElement', 'style · hidden · innerText · click()'],
             ['Element', 'querySelector · getAttribute · classList'], ['Node', 'parentNode · textContent · append'],
             ['EventTarget', 'addEventListener · dispatchEvent'], ['Object', 'toString · hasOwnProperty']];
    L.forEach(function (r, i) {
      var y = 104 + i * 68, st = i ? 6.3 + (i - 1) * 0.6 : 0.9, q = K.back((t - st) / 0.5), hot = i === 5 && t > 18.2;
      if (q <= 0) return;
      K.g.save(); K.g.translate(210, y); K.g.scale(q, q);
      K.box(-150, -23, 300, 46, { stroke: i ? (hot ? P.warm : P.acc) : P.warm, fill: hot ? 'rgba(246,173,85,.12)' : null, a: K.clamp(q), lw: hot ? 3 : 2 });
      K.text(r[0], 0, 1, { size: 20, mono: true, weight: i ? 400 : 700, align: 'center', color: i ? P.ink : P.warm, a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(210, y - 45, 210, y - 25, { p: K.p(t, st - 0.2, 0.3), color: P.muted, head: 9, lw: 2 });
      if (i) K.text(r[1], 395, y, { size: 18, mono: i > 1, color: hot ? P.warm : i === 3 || i === 4 ? P.ink : P.muted, a: K.p(t, 12.7 + (i - 1) * 0.6) });
    });
    K.code(['const div = document.createElement("div");'], 395, 92, { size: 18, n: K.typed(t, ['const div = document.createElement("div");'], [1.2], 40), t: t, a: K.p(t, 1) });
    K.panel(870, 92, 370, 260, 'Console', { a: K.p(t, 0.5) });
    var c1 = ['> div.constructor.name'], c2 = ['> div instanceof EventTarget'];
    K.code(c1, 894, 138, { size: 19, n: K.typed(t, c1, [1.6], 22), t: t, a: K.p(t, 0.5) });
    K.text('"HTMLDivElement"', 914, 188, { size: 19, mono: true, color: P.green, a: K.p(t, 3) });
    K.code(c2, 894, 236, { size: 19, n: K.typed(t, c2, [18.6], 22), t: t, a: K.p(t, 18.4) });
    K.text('true', 914, 286, { size: 19, mono: true, color: P.warm, a: K.p(t, 20) });
    var jn = K.p(t, 20.6);
    K.box(870, 384, 370, 150, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: jn });
    K.text('Node.js: no document, no DOM', 894, 418, { size: 18, color: P.red, a: jn });
    K.text('tests use a fake DOM:', 894, 456, { size: 18, color: P.muted, a: jn });
    K.text('jsdom · happy-dom', 894, 494, { size: 19, mono: true, a: jn });
  } },

/* 4 ─ selecting, nodes vs elements */
{ d: 24, title: 'Selecting elements',
  caps: [
    [0.3, 'Find an element by id with getElementById, or with any CSS selector using querySelector.'],
    [6.5, 'querySelectorAll returns every match. querySelector returns only the first one, or null.'],
    [12, 'Careful: childNodes includes the whitespace text nodes between tags. children holds only elements.'],
    [18.5, 'So this list has 5 child nodes but only 2 children. Prefer children and firstElementChild.']],
  draw: function (K, t) {
    var P = K.P, html = ['<ul id="list">', '  <li>one</li>', '  <li class="x">two</li>', '</ul>'];
    K.panel(40, 84, 560, 196, 'list.html', { a: K.p(t, 0.2) });
    K.code(html, 70, 130, { size: 21, n: K.typed(t, html, [0.4, 0.7, 1, 1.3], 60), t: t, a: K.p(t, 0.2) });
    var js = ['document.getElementById("list")', 'document.querySelector("#list .x")', 'document.querySelectorAll("li")'];
    K.panel(40, 300, 560, 170, 'app.js', { a: K.p(t, 1.6) });
    K.code(js, 70, 346, { size: 20, lh: 1.6, n: K.typed(t, js, [1.8, 3.6, 6.8], 26), t: t, a: K.p(t, 1.6) });
    var R = [['→ <ul id="list">', 3.2], ['→ <li class="x">', 5.2], ['→ NodeList(2) [li, li]', 8.4]];
    R.forEach(function (r, i) { K.text(r[0], 630, 357 + i * 32, { size: 19, mono: true, color: P.green, a: K.p(t, r[1], 0.3) }); });
    K.chip('querySelector: first match or null', 320, 520, { size: 18, stroke: P.blue, a: K.p(t, 9.4) });
    /* childNodes vs children */
    var cn = K.p(t, 12.2);
    K.text('ul.childNodes', 660, 104, { size: 20, mono: true, a: cn });
    K.text('length 5', 1220, 104, { size: 20, mono: true, color: P.warm, align: 'right', a: K.p(t, 18.7) });
    ['#text', '<li>', '#text', '<li>', '#text'].forEach(function (s, i) {
      var q = K.p(t, 12.6 + i * 0.4, 0.4), el = i % 2 === 1;
      nd(K, s, 712 + i * 114, 150, { w: 104, a: q, stroke: el ? P.acc : P.green, dash: el ? null : [6, 5], color: el ? P.ink : P.green, size: 18 });
    });
    K.text('whitespace: "\\n  "', 712, 190, { size: 16, color: P.green, a: K.p(t, 14.4) });
    var ch = K.p(t, 15.6);
    K.text('ul.children', 660, 228, { size: 20, mono: true, a: ch });
    K.text('length 2', 1220, 228, { size: 20, mono: true, color: P.warm, align: 'right', a: K.p(t, 19.2) });
    [1, 3].forEach(function (k, i) { nd(K, '<li>', 712 + k * 114, 272, { w: 104, a: K.p(t, 16 + i * 0.4, 0.4), size: 18 }); });
    K.chip('prefer children · firstElementChild', 940, 520, { size: 18, stroke: P.acc, color: P.acc, a: K.p(t, 20) });
  } },

/* 5 ─ live vs static collections */
{ d: 25, title: 'Live vs static collections',
  caps: [
    [0.3, 'getElementsByTagName, getElementsByClassName and children return live collections that update by themselves.'],
    [7, 'querySelectorAll returns a static NodeList: a snapshot taken at the moment you asked.'],
    [12.5, 'Append a third paragraph. The live collection now has 3 items; the snapshot still has 2.'],
    [18.5, 'Removing items while looping over a live collection skips elements. Copy it with Array.from first.']],
  draw: function (K, t) {
    var P = K.P, code = ['const body = document.body;', 'const live = body.getElementsByTagName("p");', 'const snap = body.querySelectorAll("p");',
      'body.append(document.createElement("p"));', 'console.log(live.length, snap.length);'];
    K.panel(40, 84, 640, 250, 'live.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 20, lh: 1.6, n: K.typed(t, code, [0.6, 1.6, 7.2, 12.7, 14.6], 34), t: t, a: K.p(t, 0.2),
      hi: t > 12.7 && t < 14.6 ? 3 : -1, w: 610 });
    K.panel(40, 352, 640, 72, '', { a: K.p(t, 15.8) });
    K.text('3 2', 66, 388, { size: 22, mono: true, color: P.warm, a: K.p(t, 16.2) });
    /* the page */
    K.box(720, 84, 520, 110, { fill: false, stroke: P.line, dash: [8, 6], a: K.p(t, 0.4) });
    K.text('document.body', 740, 108, { size: 17, color: P.muted, mono: true, a: K.p(t, 0.4) });
    var third = K.back((t - 13.2) / 0.6);
    nd(K, '<p>', 790, 152, { w: 90, a: K.p(t, 0.8) }); nd(K, '<p>', 900, 152, { w: 90, a: K.p(t, 1) });
    if (third > 0) { K.g.save(); K.g.translate(1010, 152); K.g.scale(third, third); nd(K, '<p>', 0, 0, { w: 90, stroke: P.warm }); K.g.restore(); }
    /* live */
    var lv = K.p(t, 2.6), sn = K.p(t, 7.6);
    K.text('live', 720, 236, { size: 20, weight: 700, color: P.acc, a: lv });
    K.text('HTMLCollection', 776, 236, { size: 18, mono: true, color: P.muted, a: lv });
    nd(K, 'p', 760, 282, { w: 70, a: lv, size: 18 }); nd(K, 'p', 846, 282, { w: 70, a: lv, size: 18 });
    if (third > 0) nd(K, 'p', 932, 282, { w: 70, a: K.p(t, 13.8), stroke: P.warm, size: 18 });
    K.text('length ' + (t > 13.8 ? 3 : 2), 1220, 282, { size: 20, mono: true, align: 'right', color: t > 13.8 ? P.warm : P.ink, a: lv });
    K.arrow(1010, 176, 940, 258, { p: K.p(t, 13.6, 0.4), color: P.warm, head: 10, lw: 2 });
    /* static */
    K.text('snap', 720, 340, { size: 20, weight: 700, color: P.blue, a: sn });
    K.text('NodeList (static)', 786, 340, { size: 18, mono: true, color: P.muted, a: sn });
    nd(K, 'p', 760, 386, { w: 70, a: sn, size: 18, stroke: P.blue }); nd(K, 'p', 846, 386, { w: 70, a: sn, size: 18, stroke: P.blue });
    K.text('length 2', 1220, 386, { size: 20, mono: true, align: 'right', a: sn });
    K.chip('snapshot', 1010, 386, { size: 16, stroke: P.blue, a: K.p(t, 9) });
    /* gotcha */
    var gc = ['for (let i = 0; i < live.length; i++) live[i].remove();  // skips!', 'for (const el of Array.from(live)) el.remove();          // all gone'];
    var go = K.p(t, 18.7);
    K.panel(40, 448, 1200, 132, '', { a: go });
    K.code(gc, 70, 478, { size: 19, lh: 1.7, n: K.typed(t, gc, [18.9, 21], 34), t: t, a: go, w: 1140,
      marks: t > 20.6 ? { 0: 'rgba(252,129,129,.16)', 1: t > 22.6 ? 'rgba(104,211,145,.14)' : null } : null });
    K.mark(1200, 489, false, 0.8, K.p(t, 20.6)); K.mark(1200, 521, true, 0.8, K.p(t, 22.6));
  } },

/* 6 ─ textContent, innerText, innerHTML */
{ d: 24, title: 'Reading and writing content',
  caps: [
    [0.3, 'Three ways to read or write content. textContent is the raw text of all descendants: fast, safe, no layout.'],
    [7, 'innerText is the text as rendered, respecting CSS, so reading it forces the browser to compute layout.'],
    [13, 'innerHTML parses a string as HTML. Powerful, but with user input it is an XSS hole.'],
    [18.5, 'And innerHTML += re-parses all the content: the old nodes and their listeners are destroyed.']],
  draw: function (K, t) {
    var P = K.P;
    var C = [['textContent', 'raw text of all descendants', 'no parsing, no layout', 'safe for user text', P.green, 0.6],
             ['innerText', 'text as rendered (CSS-aware)', 'reading it forces layout', 'slower', P.warm, 7.2],
             ['innerHTML', 'parses a string as HTML', 'attributes like onerror run', 'XSS sink with user input', P.red, 13.2]];
    C.forEach(function (c, i) {
      var x = 40 + i * 413, q = K.back((t - c[5]) / 0.5); if (q <= 0) return;
      var a = K.clamp(q);
      K.box(x, 84, 374, 206, { stroke: c[4], a: a });
      K.text(c[0], x + 22, 120, { size: 24, mono: true, weight: 700, color: c[4], a: a });
      K.text(c[1], x + 22, 168, { size: 18, a: a }); K.text(c[2], x + 22, 200, { size: 18, color: P.muted, a: a });
      K.mark(x + 36, 252, i === 0, 0.8, K.p(t, c[5] + 1.2)); K.text(c[3], x + 62, 252, { size: 18, color: c[4], a: K.p(t, c[5] + 1.2) });
    });
    var code = ["const name = '<img src=x onerror=alert(1)>';", 'el.textContent = name;  // shows the text', 'el.innerHTML = name;    // runs the attack'];
    var cp = K.p(t, 14.6);
    K.panel(40, 316, 720, 150, '', { a: cp });
    K.code(code, 64, 340, { size: 19, n: K.typed(t, code, [14.8, 16, 16.9], 40), t: t, a: cp });
    K.mark(64, 506, true, 0.8, K.p(t, 16.6)); K.text('textContent: the tag shows up as plain text', 92, 506, { size: 18, a: K.p(t, 16.6) });
    K.mark(64, 552, false, 0.8, K.p(t, 17.6)); K.text('innerHTML: the image fails, onerror runs code', 92, 552, { size: 18, color: P.red, a: K.p(t, 17.6) });
    /* innerHTML += */
    var ip = K.p(t, 18.7), gone = K.p(t, 20.4, 0.6), nw = K.p(t, 21.4);
    K.panel(800, 316, 440, 268, '', { a: ip });
    K.code(['list.innerHTML += "<li>c</li>";'], 822, 336, { size: 18, n: K.typed(t, ['list.innerHTML += "<li>c</li>";'], [18.9], 30), t: t, a: ip });
    K.text('old nodes', 900, 388, { size: 17, color: P.muted, align: 'center', a: ip });
    K.text('new nodes', 1130, 388, { size: 17, color: P.muted, align: 'center', a: nw });
    ['li a', 'li b'].forEach(function (s, i) {
      var y = 430 + i * 52;
      nd(K, s, 860, y, { w: 90, a: ip * (1 - gone * 0.6), stroke: gone > 0.5 ? P.red : P.acc, size: 18 });
      K.chip('click', 950, y, { size: 15, stroke: P.purple, a: ip * (1 - gone) });
      K.mark(935, y, false, 0.7, gone);
    });
    ['li a', 'li b', 'li c'].forEach(function (s, i) { nd(K, s, 1130, 430 + i * 52, { w: 90, a: K.p(t, 21.4 + i * 0.3), size: 18 }); });
    K.text('listeners lost', 900, 546, { size: 17, color: P.red, align: 'center', a: K.p(t, 21) });
  } },

/* 7 ─ attributes vs properties */
{ d: 23, title: 'Attributes vs properties',
  caps: [
    [0.3, 'Attributes come from the HTML markup and are strings. Properties are the live state of the JavaScript object.'],
    [6.5, 'When the page loads, the value attribute sets the starting value of the input.'],
    [11.5, 'Now the user types. The value property changes, but the attribute still says initial.'],
    [17, 'getAttribute reads the markup, value reads the live state, defaultValue mirrors the attribute.']],
  draw: function (K, t) {
    var P = K.P, html = ['<input value="initial">'];
    K.panel(40, 84, 600, 100, 'form.html', { a: K.p(t, 0.2) });
    K.code(html, 66, 128, { size: 22, n: K.typed(t, html, [0.5], 30), t: t, a: K.p(t, 0.2) });
    /* the input on screen */
    var ui = K.p(t, 6.8);
    K.text('on screen', 60, 214, { size: 17, color: P.muted, a: ui });
    K.box(60, 238, 420, 60, { fill: '#f4f7fb', stroke: t > 11.6 ? P.acc : P.line, lw: 3, a: ui, r: 8 });
    var word = 'typed', k = Math.max(0, Math.min(5, Math.floor((t - 12.2) * 5)));
    var shown = t < 11.9 ? 'initial' : word.slice(0, k);
    K.text(shown, 80, 269, { size: 24, color: '#1a2533', a: ui });
    if (t > 11.6 && t < 16 && Math.floor(t * 2.5) % 2 === 0) { K.box(82 + shown.length * 12.5, 252, 2.5, 34, { fill: '#1a2533', r: 0 }); }
    /* attribute and property */
    var at = K.p(t, 1.2), pr = K.p(t, 3.2);
    K.box(700, 84, 540, 140, { stroke: P.blue, a: at });
    K.text('Attribute · the markup', 724, 114, { size: 19, weight: 700, color: P.blue, a: at });
    K.text('value="initial"', 724, 172, { size: 26, mono: true, a: at });
    K.text('always a string', 1216, 172, { size: 16, color: P.muted, align: 'right', a: K.p(t, 2) });
    K.box(700, 300, 540, 140, { stroke: P.acc, a: pr });
    K.text('Property · the live object', 724, 330, { size: 19, weight: 700, color: P.acc, a: pr });
    var sw = K.p(t, 13.2, 0.5);
    K.text('input.value', 724, 388, { size: 24, mono: true, a: pr });
    K.text('"initial"', 920, 388, { size: 24, mono: true, color: P.green, a: K.p(t, 7.6) * (1 - sw) });
    K.text('"typed"', 920, 388, { size: 24, mono: true, color: P.warm, a: sw });
    var link = K.p(t, 7, 0.6), broke = K.p(t, 13.6);
    K.arrow(970, 228, 970, 296, { p: link, color: broke > 0 ? P.muted : P.green, dash: broke > 0 ? [6, 6] : null });
    K.text('copied at load', 990, 262, { size: 16, color: P.green, a: link * (1 - K.p(t, 12.9, 0.5)) });
    K.mark(970, 262, false, 0.8, broke); K.text('no longer in sync', 998, 262, { size: 16, color: P.red, a: broke });
    K.arrow(490, 268, 690, 380, { p: K.p(t, 12.6, 0.5), color: P.warm });
    /* reads */
    var rd = ['input.getAttribute("value")  // "initial"', 'input.value                  // "typed"', 'input.defaultValue           // "initial"'];
    var r = K.p(t, 17.2);
    K.panel(40, 464, 720, 120, '', { a: r });
    K.code(rd, 64, 478, { size: 19, lh: 1.6, n: K.typed(t, rd, [17.4, 18.9, 20.2], 40), t: t, a: r });
    K.chip('id, href: reflect both ways', 1010, 524, { size: 18, stroke: P.purple, a: K.p(t, 21.2) });
  } },

/* 8 ─ fragments and batching */
{ d: 26, title: 'Fast DOM updates',
  caps: [
    [0.3, 'Every insertion into the live DOM can invalidate style and layout. Thousands of them, mixed with reads, get slow.'],
    [6.5, 'Build new nodes in a DocumentFragment first. It is not part of the page, so nothing is rendered yet.'],
    [13, 'Append the fragment once. Its children move into the page, and the fragment is left empty.'],
    [19, 'For repeated markup, clone a template. To swap all the content in one step, use replaceChildren.']],
  draw: function (K, t) {
    var P = K.P, code = ['const frag = document.createDocumentFragment();', 'for (const name of names) {', '  const li = document.createElement("li");',
      '  li.textContent = name;', '  frag.append(li);', '}', 'list.append(frag);   // one insertion'];
    var cp = K.p(t, 6.6);
    K.panel(40, 84, 620, 258, 'render-list.js', { a: cp });
    K.code(code, 66, 122, { size: 19, lh: 1.5, n: K.typed(t, code, [6.8, 8, 8.6, 9.6, 10.3, 10.9, 13.2], 44), t: t, a: cp, w: 590,
      hi: t > 13.2 && t < 16 ? 6 : -1 });
    var fa = K.p(t, 7.2), pa = K.p(t, 0.6);
    K.box(690, 84, 250, 300, { fill: false, stroke: P.purple, dash: [8, 6], a: fa });
    K.text('DocumentFragment', 815, 110, { size: 17, weight: 700, color: P.purple, align: 'center', a: fa });
    K.text('not in the page', 815, 136, { size: 16, color: P.muted, align: 'center', a: fa });
    K.box(990, 84, 250, 300, { stroke: P.acc, a: pa });
    K.text('<ul> in the page', 1115, 110, { size: 17, weight: 700, color: P.acc, align: 'center', a: pa });
    ['Ada', 'Ben', 'Cy', 'Dee'].forEach(function (n, i) {
      var q = K.back((t - 10.4 - i * 0.6) / 0.5), mv = K.p(t, 13.6 + i * 0.15, 0.8);
      if (q <= 0) return;
      nd(K, 'li  ' + n, 815 + mv * 300, 182 + i * 52, { w: 180, a: K.clamp(q), stroke: mv > 0.5 ? P.acc : P.purple, size: 18 });
    });
    K.text('0 children', 815, 350, { size: 18, mono: true, color: P.warm, align: 'center', a: K.p(t, 15) });
    /* cost timeline */
    var tl = K.win(t, 0.4, 19);
    K.text('append one by one', 64, 450, { size: 18, color: P.red, a: tl });
    for (var i = 0; i < 20; i++) K.box(270 + i * 46, 434, 34, 32, { fill: 'rgba(252,129,129,.18)', stroke: P.red, a: Math.min(tl, K.p(t, 1.4 + i * 0.12, 0.3)) });
    K.text('each insertion can invalidate style and layout', 270, 492, { size: 16, color: P.muted, a: Math.min(tl, K.p(t, 3.8)) });
    K.text('one fragment', 64, 540, { size: 18, color: P.green, a: Math.min(tl, K.p(t, 14)) });
    K.box(270, 524, 34, 32, { fill: 'rgba(104,211,145,.22)', stroke: P.green, a: Math.min(tl, K.p(t, 14.4)) });
    K.text('one insertion, one recalculation', 324, 540, { size: 18, color: P.green, a: Math.min(tl, K.p(t, 14.6)) });
    /* template + replaceChildren */
    var tp = K.p(t, 19.2), tc = ['const row = tpl.content.cloneNode(true);   // copy of inert markup', 'list.replaceChildren(...rows);              // swap everything at once'];
    K.panel(40, 420, 1200, 140, 'template.js', { a: tp });
    K.code(tc, 66, 466, { size: 20, lh: 1.6, n: K.typed(t, tc, [19.4, 21.6], 34), t: t, a: tp });
  } },

/* 9 ─ when is the DOM ready? */
{ d: 21, title: 'When is the DOM ready?',
  caps: [
    [0.3, 'A plain script in the head runs before the body is parsed, so its lookups return null.'],
    [6.5, 'DOMContentLoaded fires once the HTML is parsed and the deferred scripts have run.'],
    [12, 'load fires later, after images, stylesheets and other subresources have finished.'],
    [16, 'So use defer, or a module script, and your code can safely query the whole page.']],
  draw: function (K, t) {
    var P = K.P, html = ['<head>', '  <script src="app.js"></script>', '</head>'];
    K.panel(40, 84, 600, 156, 'index.html', { a: K.p(t, 0.2) });
    K.code(html, 66, 124, { size: 20, n: K.typed(t, html, [0.4, 0.7, 1.6], 40), t: t, a: K.p(t, 0.2), hi: t > 2 && t < 6.5 ? 1 : -1, w: 560 });
    K.panel(680, 84, 560, 156, 'Console', { a: K.p(t, 1.8) });
    var c = ['> document.querySelector("#list")'];
    K.code(c, 704, 124, { size: 19, n: K.typed(t, c, [2.2], 30), t: t, a: K.p(t, 1.8) });
    K.text('null', 724, 176, { size: 20, mono: true, color: P.red, a: K.p(t, 3.6) * (1 - K.p(t, 17.6)) });
    K.text('<ul id="list">   (with defer)', 724, 176, { size: 20, mono: true, color: P.green, a: K.p(t, 17.6) });
    K.text('the <ul> has not been parsed yet', 704, 214, { size: 16, color: P.muted, a: K.win(t, 4.2, 17.4) });
    /* timeline */
    var tl = K.p(t, 6.6), fill = K.p(t, 6.8, 2.2);
    K.text('HTML parsing', 100, 312, { size: 17, color: P.muted, a: tl });
    K.box(100, 330, 600 * fill, 36, { fill: 'rgba(79,209,197,.35)', stroke: P.acc, r: 6, a: tl });
    var df = K.p(t, 8.8);
    K.box(706, 330, 100, 36, { fill: 'rgba(183,148,244,.3)', stroke: P.purple, r: 6, a: df });
    K.text('defer', 756, 349, { size: 16, align: 'center', a: df });
    var dcl = K.p(t, 9.6);
    K.arrow(818, 296, 818, 486, { p: dcl, color: P.green, head: 0.1, lw: 3 });
    K.text('DOMContentLoaded', 818, 278, { size: 18, weight: 700, color: P.green, align: 'center', a: dcl });
    var sub = [['styles.css', 160, 560], ['photo.jpg', 300, 1010], ['font.woff2', 420, 880]];
    sub.forEach(function (s, i) {
      var q = K.p(t, 12.2 + i * 0.4), w = (s[2] - s[1]) * K.p(t, 12.2 + i * 0.4, 1.6), y = 390 + i * 34;
      K.box(s[1], y, w, 24, { fill: 'rgba(99,179,237,.3)', stroke: P.blue, r: 5, a: q });
      K.text(s[0], s[1] + 10, y + 13, { size: 16, mono: true, a: q });
    });
    var ld = K.p(t, 14.2);
    K.arrow(1040, 296, 1040, 486, { p: ld, color: P.warm, head: 0.1, lw: 3 });
    K.text('load', 1040, 278, { size: 18, weight: 700, color: P.warm, align: 'center', a: ld });
    /* fix */
    var fx = K.p(t, 16.2), fc = ['<script src="app.js" defer></script>', '<script type="module" src="app.js"></script>'];
    K.panel(40, 506, 640, 82, '', { a: fx });
    K.code(fc, 64, 516, { size: 18, lh: 1.6, n: K.typed(t, fc, [16.4, 17.6], 40), t: t, a: fx });
    K.chip('both run after parsing, in order', 960, 547, { size: 18, stroke: P.green, color: P.green, a: K.p(t, 19) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 16 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 106, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['The DOM is a tree of host objects parsed from HTML',
     'querySelector(All) for selecting; children skips whitespace text',
     'Live collections update by themselves; querySelectorAll is a snapshot',
     'textContent for text; innerHTML only for trusted markup',
     'Attributes are the markup, properties are the live state',
     'Batch with fragments and templates; defer waits for the DOM'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 16 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
