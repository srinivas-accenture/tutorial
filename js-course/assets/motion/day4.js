/* Day 4 in motion: how this is decided (call site, four rules, arrows), immutable strings and template literals, UTF-16 and graphemes, regex patterns, groups and traps.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day4', {
  kicker: 'JavaScript: Zero to Architect · Day 4',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 4: exactly how this is decided, how text really works, and how to use regular expressions safely.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('JavaScript', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 4 · this, strings and regular expressions', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['The this rules', 'Strings and UTF-16', 'Regular expressions'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ this is decided at the call */
{ d: 26, title: 'this is decided at the call',
  caps: [
    [0.3, 'In a normal function, this means "me": the object the call is made on. It is decided when the function is called.'],
    [7, 'Call person.hi() and the object before the dot becomes this, so you get "Ana".'],
    [12.5, 'Copy the method into a variable and call it bare. Nothing is before the dot, so in strict mode this is undefined.'],
    [19.5, 'The same happens when you pass a method as a callback: setTimeout(person.hi) loses this.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['"use strict";', 'const person = {', '  name: "Ana",', '  hi() { return this?.name; }', '};', 'person.hi();          // "Ana"', 'const hi = person.hi;', 'hi();                 // undefined'];
    var hi = t > 13.6 ? 7 : t > 12.8 ? 6 : t > 7.2 ? 5 : t > 1 ? 3 : -1;
    K.panel(40, 85, 620, 360, 'this.js');
    K.code(code, 64, 135, { size: 21, lh: 1.5, n: K.typed(t, code, [0.5, 0.8, 1.1, 1.5, 2.2, 7.3, 12.8, 13.6], 40), t: t, hi: hi, w: 590 });
    /* the object */
    var o = K.p(t, 2.6);
    K.box(760, 95, 420, 120, { stroke: P.acc, a: o });
    K.text('person', 782, 123, { size: 18, color: P.acc, weight: 700, mono: true, a: o });
    K.text('name: "Ana"', 782, 165, { size: 22, mono: true, a: o });
    K.chip('hi()', 1090, 165, { mono: true, size: 20, stroke: P.purple, a: o });
    /* call 1 */
    var c1 = K.p(t, 7.6);
    K.text('person.hi()', 790, 280, { size: 26, mono: true, a: c1 });
    K.box(783, 261, 100, 38, { fill: false, stroke: P.green, r: 8, a: K.p(t, 8.6) });
    K.text('this = person', 990, 280, { size: 20, color: P.green, a: K.p(t, 9.4) });
    K.text('"Ana"', 1180, 280, { size: 22, mono: true, color: P.green, align: 'right', a: K.p(t, 10.4) });
    /* call 2 */
    var c2 = K.p(t, 14);
    K.text('hi()', 860, 350, { size: 26, mono: true, a: c2 });
    K.box(783, 332, 66, 38, { fill: false, stroke: P.red, dash: [6, 5], r: 8, a: K.p(t, 15) });
    K.text('?', 816, 351, { size: 22, color: P.red, align: 'center', weight: 700, a: K.p(t, 15) });
    K.text('this = undefined', 990, 350, { size: 20, color: P.red, a: K.p(t, 16) });
    K.text('nothing before the dot', 790, 395, { size: 16, color: P.muted, a: K.p(t, 16.6) });
    /* callback */
    var cb = K.p(t, 19.8);
    K.panel(40, 470, 1200, 110, '', { a: cb });
    K.code(['setTimeout(person.hi, 0);          // this lost', 'setTimeout(() => person.hi(), 0);  // keeps person'], 64, 490, { size: 20, lh: 1.65, n: K.typed(t, ['setTimeout(person.hi, 0);          // this lost', 'setTimeout(() => person.hi(), 0);  // keeps person'], [20, 22.4], 34), t: t, a: cb });
    K.mark(1180, 505, false, 0.8, K.p(t, 21.6)); K.mark(1180, 538, true, 0.8, K.p(t, 24));
  } },

/* 3 ─ the four rules */
{ d: 28, title: 'The four rules for this',
  caps: [
    [0.3, 'For normal functions, four rules decide this. Check them in order: the first one that matches wins.'],
    [6.5, 'Called with new? Then this is the brand-new object being built.'],
    [11.5, 'Called through call, apply or bind? this is the object you pass. A bound function keeps it for good.'],
    [18.5, 'Called as obj.method()? this is obj. Otherwise it is a plain call: undefined in strict mode, the global object in sloppy mode.']],
  draw: function (K, t) {
    var P = K.P;
    var R = [['1', 'new Fn()', 'this = the new object', 'new P(7).n   // 7', P.acc, 6.7],
             ['2', 'call / apply / bind', 'this = the object you pass', 'hi.call({ name: "Ravi" })', P.purple, 11.7],
             ['3', 'obj.method()', 'this = obj', 'person.hi()   // "Ana"', P.green, 18.7],
             ['4', 'plain call', 'strict: undefined · sloppy: globalThis', 'hi()   // undefined', P.red, 21.5]];
    K.text('first match wins ↓', 60, 100, { size: 18, color: P.muted, a: K.p(t, 0.8) });
    R.forEach(function (r, i) {
      var y = 160 + i * 108, q = K.back((t - 1 - i * 0.5) / 0.5), on = K.p(t, r[5], 0.5);
      if (q <= 0) return;
      K.g.save(); K.g.globalAlpha *= K.clamp(q);
      K.box(40, y - 40, 1200, 84, { fill: P.card, stroke: on > 0.5 ? r[4] : P.line, lw: on > 0.5 ? 3 : 2 });
      K.text(r[0], 76, y + 2, { size: 30, weight: 800, color: r[4], align: 'center' });
      K.text(r[1], 112, y + 2, { size: 23, mono: true, weight: 700 });
      K.text(r[2], 440, y + 2, { size: 20, color: r[4], a: on });
      K.text(r[3], 1215, y + 2, { size: 18, mono: true, color: P.muted, align: 'right', a: K.p(t, r[5] + 1) });
      K.g.restore();
      if (i < 3) K.arrow(76, y + 46, 76, y + 66, { p: K.p(t, 1.4 + i * 0.5, 0.3), color: P.muted, lw: 2, head: 9 });
    });
    K.chip('bind: fixed for good', 790, 268, { size: 16, stroke: P.purple, a: K.p(t, 15.5) });
  } },

/* 4 ─ arrows and this */
{ d: 26, title: 'Arrow functions and this',
  caps: [
    [0.3, 'Arrow functions skip all four rules. They use the this of the place where they were written.'],
    [6.5, 'So an arrow inside a method sees the method’s this. A normal function callback gets its own this, and loses it.'],
    [14, 'But an arrow written directly as an object property does not get the object: it sees the outer this.'],
    [20, 'In a DOM listener, a normal function gets the element as this. An arrow keeps the outer this.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const person = {', '  name: "Ana",', '  later() { return [1].map(() => this.name); },', '  broken() { return [1].map(function () { return this; }); },', '  arrow: () => this,', '};'];
    var hi = t > 14.2 ? 4 : t > 10 ? 3 : t > 6.7 ? 2 : -1;
    K.panel(40, 85, 1200, 245, 'arrows.js');
    K.code(code, 64, 133, { size: 19, lh: 1.5, n: K.typed(t, code, [0.5, 0.8, 1.2, 2.2, 3.4, 4], 50), t: t, hi: hi, w: 1170 });
    var O = [['person.later()', '["Ana"]', P.green, true, 8], ['person.broken()', '[undefined]', P.red, false, 11.4], ['person.arrow()', 'outer this', P.red, false, 15.6]];
    O.forEach(function (o, i) {
      var y = 370 + i * 44, q = K.p(t, o[4], 0.4);
      K.text(o[0], 64, y, { size: 21, mono: true, a: q });
      K.text('→ ' + o[1], 300, y, { size: 21, mono: true, color: o[2], a: K.p(t, o[4] + 0.6, 0.4) });
      K.mark(520, y, o[3], 0.75, K.p(t, o[4] + 0.9, 0.4));
    });
    K.text('arrow: this from where it was written', 64, 506, { size: 17, color: P.acc, a: K.p(t, 9.4) });
    var d = K.p(t, 20.2);
    K.box(640, 350, 600, 230, { fill: P.code, stroke: P.blue, a: d });
    K.text('DOM listener', 664, 378, { size: 18, color: P.blue, weight: 700, a: d });
    var dc = ['btn.addEventListener("click", function () {', '  this;   // the button', '});', 'btn.addEventListener("click", () => this);'];
    K.code(dc, 664, 408, { size: 17, lh: 1.6, n: K.typed(t, dc, [20.4, 21.8, 22.4, 23.2], 40), t: t, a: d });
    K.text('this = outer this', 1215, 548, { size: 16, color: P.warm, align: 'right', a: K.p(t, 24.4) });
  } },

/* 5 ─ strings: immutable, methods, templates */
{ d: 24, title: 'Strings and template literals',
  caps: [
    [0.3, 'Strings are immutable. toUpperCase, slice and replace return new strings; the original never changes.'],
    [7, 'Handy methods: at(-1) reads from the end, slice takes negatives, padStart pads, replaceAll replaces every match.'],
    [15, 'Template literals, written in backticks, can span lines and drop in any expression with ${ }.']],
  draw: function (K, t) {
    var P = K.P;
    var s1 = K.p(t, 0.6);
    K.chip('s', 100, 130, { mono: true, size: 22, stroke: P.acc, a: s1 });
    K.arrow(130, 130, 190, 130, { p: K.p(t, 0.9, 0.4), color: P.muted, lw: 2.5 });
    K.chip('"hello"', 260, 130, { mono: true, size: 24, color: P.green, a: s1 });
    K.text('s.toUpperCase()', 400, 130, { size: 22, mono: true, a: K.p(t, 2) });
    K.arrow(600, 130, 660, 130, { p: K.p(t, 2.6, 0.4), color: P.muted, lw: 2.5 });
    var n = K.back((t - 3) / 0.5); if (n > 0) K.chip('"HELLO"', 740, 130, { s: n, mono: true, size: 24, stroke: P.warm, color: P.warm });
    K.text('new string', 840, 130, { size: 17, color: P.warm, a: K.p(t, 3.4) });
    K.text('s is still "hello"', 1000, 130, { size: 18, color: P.muted, a: K.p(t, 4.6) });
    var M = [['"abc".at(-1)', '"c"'], ['"abcdef".slice(-3, -1)', '"de"'], ['"7".padStart(3, "0")', '"007"'], ['"a-b-c".replaceAll("-", "+")', '"a+b+c"']];
    K.panel(40, 185, 1200, 175, '', { a: K.p(t, 7.2) });
    M.forEach(function (m, i) {
      var x = 70 + (i % 2) * 600, y = 222 + Math.floor(i / 2) * 64, q = K.p(t, 7.6 + i * 1.6, 0.4);
      K.text(m[0], x, y, { size: 21, mono: true, a: q });
      K.text('→ ' + m[1], x + 390, y, { size: 21, mono: true, color: P.green, a: K.p(t, 8.2 + i * 1.6, 0.4) });
    });
    K.text('"x".replace("a", "b") changes only the first match', 640, 340, { size: 16, color: P.muted, align: 'center', a: K.p(t, 13.6) });
    var tq = K.p(t, 15.2);
    K.panel(40, 380, 700, 200, 'template.js', { a: tq });
    var tc = ['const who = "world", n = 3;', '`Hello ${who},', '${n * 2} items`'];
    K.code(tc, 64, 430, { size: 21, lh: 1.6, n: K.typed(t, tc, [15.5, 17, 18], 30), t: t, a: tq });
    var o = K.p(t, 19.6);
    K.box(780, 380, 460, 200, { fill: P.code, stroke: P.green, a: o });
    K.text('result', 804, 408, { size: 17, color: P.muted, weight: 700, a: o });
    K.text('Hello world,', 804, 460, { size: 24, mono: true, color: P.green, a: o });
    K.text('6 items', 804, 500, { size: 24, mono: true, color: P.green, a: K.p(t, 20.2) });
    K.text('two lines, expressions evaluated', 804, 548, { size: 16, color: P.muted, a: K.p(t, 21) });
  } },

/* 6 ─ UTF-16 */
{ d: 27, title: 'UTF-16: length lies',
  caps: [
    [0.3, 'A JavaScript string is a sequence of 16-bit UTF-16 code units.'],
    [5.5, 'An emoji needs more than 16 bits, so it takes two units, a surrogate pair. That is why "a😀".length is 3.'],
    [12.5, 'Spread and for...of walk whole code points, so [..."a😀"].length is 2.'],
    [18, 'What a person sees as one character can be several code points. Intl.Segmenter counts those graphemes.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('"a😀"', 140, 150, { size: 54, mono: true, align: 'center', a: K.p(t, 0.5) });
    K.text('what you see', 140, 205, { size: 16, color: P.muted, align: 'center', a: K.p(t, 0.8) });
    var U = [['a', '0061', P.acc, 1.4], ['😀', 'D83D', P.warm, 6], ['', 'DE00', P.warm, 6.6]];
    U.forEach(function (u, i) {
      var x = 340 + i * 160, q = K.back((t - u[3]) / 0.5); if (q <= 0) return;
      K.g.save(); K.g.translate(x + 70, 150); K.g.scale(q, q);
      K.box(-70, -50, 140, 100, { stroke: u[2], a: K.clamp(q) });
      K.text(u[1], 0, -10, { size: 24, mono: true, weight: 700, color: u[2], align: 'center', a: K.clamp(q) });
      K.text('unit ' + i, 0, 26, { size: 15, color: P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
    });
    K.text('16 bits each', 640, 222, { size: 16, color: P.muted, align: 'center', a: K.p(t, 2) });
    K.box(500, 230, 300, 6, { fill: P.warm, r: 3, a: K.p(t, 7.2) * 0.8 });
    K.text('surrogate pair = one 😀', 650, 256, { size: 17, color: P.warm, align: 'center', a: K.p(t, 7.4) });
    var L = [['"a😀".length', '3', 'code units', P.red, 8.6], ['[..."a😀"].length', '2', 'code points', P.green, 12.8]];
    L.forEach(function (l, i) {
      var y = 320 + i * 56, q = K.p(t, l[4], 0.4);
      K.text(l[0], 70, y, { size: 24, mono: true, a: q });
      K.text('→ ' + l[1], 380, y, { size: 24, mono: true, color: l[3], a: K.p(t, l[4] + 0.6, 0.4) });
      K.text(l[2], 470, y, { size: 18, color: P.muted, a: K.p(t, l[4] + 0.8, 0.4) });
    });
    var bad = K.p(t, 10.4);
    K.text('"😀".split("") → two broken halves', 1220, 320, { size: 17, color: P.red, align: 'right', a: bad });
    K.text('"ß".toUpperCase() → "SS"', 1220, 376, { size: 17, color: P.muted, mono: true, align: 'right', a: K.p(t, 15.4) });
    var g = K.p(t, 18.2);
    K.panel(40, 425, 1200, 155, '', { a: g });
    K.text('👨‍👩‍👧', 120, 502, { size: 60, align: 'center', a: g });
    var sc = ['[..."👨‍👩‍👧"].length                     // 5 code points', 'const seg = new Intl.Segmenter("en", { granularity: "grapheme" });', '[...seg.segment("👨‍👩‍👧")].length       // 1 grapheme'];
    K.code(sc, 210, 448, { size: 19, lh: 1.6, n: K.typed(t, sc, [19, 21, 22.8], 40), t: t, a: g });
  } },

/* 7 ─ regular expressions */
{ d: 28, title: 'Regular expressions',
  caps: [
    [0.3, 'A regular expression describes a pattern of text. It is written between slashes, with flags after.'],
    [6.5, 'Building blocks: \\d is a digit, \\w a word character, \\s whitespace. + means one or more, {4} exactly four.'],
    [13.5, 'Parentheses capture parts of a match. A named group, like ?<y>, lets you read it by name.'],
    [20, 'With the g flag, matchAll walks every match, and replace can take a function that rebuilds each one.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    /* pattern, coloured piece by piece */
    var parts = [['/', P.muted], ['(?<y>', P.purple], ['\\d{4}', P.acc], [')', P.purple], ['-', P.ink], ['(?<m>', P.blue], ['\\d{2}', P.acc], [')', P.blue], ['/', P.muted], ['g', P.warm]];
    var x = 80, pa = K.p(t, 0.5);
    parts.forEach(function (p) { x += K.text(p[0], x, 130, { size: 34, mono: true, color: p[1], a: pa }); });
    K.text('pattern', 1200, 118, { size: 16, color: P.muted, align: 'right', a: K.p(t, 1.4) });
    K.text('g = flag: global', 1200, 146, { size: 16, color: P.warm, align: 'right', a: K.p(t, 3) });
    /* building blocks */
    var B = [['\\d', 'digit'], ['\\w', 'word char'], ['\\s', 'space'], ['+', 'one or more'], ['{4}', 'exactly 4'], ['?', 'optional']];
    B.forEach(function (b, i) {
      var cx = 120 + i * 200, q = K.back((t - 6.8 - i * 0.6) / 0.5); if (q <= 0) return;
      K.chip(b[0], cx - 40, 205, { s: q, mono: true, size: 21, stroke: P.acc });
      K.text(b[1], cx - 8, 205, { size: 17, color: P.muted, a: K.clamp(q) });
    });
    /* text with matches highlighted */
    var txt = '2026-03 and 2027-11', tx = 80, ty = 290, cw = 30 * 0.55;
    K.text(txt, tx, ty, { size: 30, mono: true, a: K.p(t, 13) });
    g.save(); g.font = '30px Consolas,ui-monospace,monospace'; cw = g.measureText('0').width; g.restore();
    [[0, 4, 5, 7, 14.4], [12, 16, 17, 19, 15.4]].forEach(function (m) {
      var a1 = K.p(t, m[4], 0.4), a2 = K.p(t, m[4] + 0.5, 0.4);
      K.box(tx + m[0] * cw - 3, ty - 22, (m[1] - m[0]) * cw + 6, 44, { fill: 'rgba(183,148,244,.18)', stroke: P.purple, r: 6, a: a1 });
      K.box(tx + m[2] * cw - 3, ty - 22, (m[3] - m[2]) * cw + 6, 44, { fill: 'rgba(99,179,237,.18)', stroke: P.blue, r: 6, a: a2 });
    });
    K.text('m.groups.y   m.groups.m', 520, 290, { size: 20, mono: true, color: P.muted, a: K.p(t, 16.6) });
    K.text('"2026"  "03"   ·   "2027"  "11"', 520, 326, { size: 20, mono: true, color: P.green, a: K.p(t, 17.6) });
    var c = ['for (const m of text.matchAll(re)) console.log(m.groups.y);', 'text.replace(re, (_, y, m) => m + "/" + y)'];
    var q = K.p(t, 20.2);
    K.panel(40, 375, 1200, 205, 'regex.js', { a: q });
    K.code(c, 64, 425, { size: 21, lh: 1.7, n: K.typed(t, c, [20.5, 22.6], 40), t: t, a: q });
    K.text('→ "03/2026 and 11/2027"', 88, 540, { size: 22, mono: true, color: P.green, a: K.p(t, 24.6) });
  } },

/* 8 ─ regex traps */
{ d: 26, title: 'Regex traps',
  caps: [
    [0.3, 'A regex with the g flag remembers where it stopped, in lastIndex. Reusing it with test() alternates true and false.'],
    [8.5, 'Nested quantifiers like (a+)+ can backtrack exponentially on text that fails to match, freezing the page. That is ReDoS.'],
    [16.5, 'To put user text inside a pattern, escape it first. RegExp.escape does that in current browsers and Node 24.']],
  draw: function (K, t) {
    var P = K.P;
    var c = ['const re = /a/g;', 're.test("a");   // true   lastIndex → 1', 're.test("a");   // false  lastIndex → 0', 're.test("a");   // true'];
    K.panel(40, 85, 720, 220, 'lastIndex.js');
    K.code(c, 64, 133, { size: 20, lh: 1.6, n: K.typed(t, c, [0.5, 1.6, 3.4, 5.2], 34), t: t, hi: t > 5.4 ? 3 : t > 3.6 ? 2 : t > 1.8 ? 1 : -1, w: 690 });
    var on = [K.p(t, 2.6), K.p(t, 4.4), K.p(t, 6.2)];
    [true, false, true].forEach(function (b, i) { K.mark(900 + i * 80, 160, b, 1, on[i]); });
    K.text('same call, different answers', 980, 215, { size: 17, color: P.warm, align: 'center', a: K.p(t, 6.6) });
    K.text('fix: re.lastIndex = 0, or drop g', 980, 260, { size: 17, color: P.green, align: 'center', a: K.p(t, 7.4) });
    /* ReDoS: exponential curve */
    var r = K.p(t, 8.7);
    K.box(40, 325, 720, 255, { fill: P.code, stroke: P.red, a: r });
    K.text('/(a+)+$/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaa!")', 64, 355, { size: 19, mono: true, a: r });
    var gx = 90, gy = 555, gw = 640, gh = 160;
    K.arrow(gx, gy, gx + gw, gy, { color: P.line, lw: 2, a: r, head: 9 }); K.arrow(gx, gy, gx, gy - gh - 10, { color: P.line, lw: 2, a: r, head: 9 });
    K.text('input length →', gx + gw - 150, gy - 14, { size: 15, color: P.muted, a: r });
    K.text('time', gx + 10, gy - gh, { size: 15, color: P.muted, a: r });
    var pr = K.p(t, 10, 2.5);
    if (pr > 0) {
      K.g.save(); K.g.globalAlpha *= r; K.g.strokeStyle = P.red; K.g.lineWidth = 3; K.g.beginPath();
      for (var i = 0; i <= 60 * pr; i++) { var u = i / 60, yy = gy - gh * (Math.pow(2, u * 8) - 1) / 255; if (i) K.g.lineTo(gx + u * gw * 0.85, yy); else K.g.moveTo(gx, yy); }
      K.g.stroke(); K.g.restore();
    }
    K.text('every extra "a" doubles the work', 330, 420, { size: 17, color: P.red, a: K.p(t, 12.6) });
    /* escape */
    var e = K.p(t, 16.7);
    K.box(790, 325, 450, 255, { fill: P.code, stroke: P.green, a: e });
    K.text('user types:  1+1=2?', 814, 360, { size: 19, mono: true, a: e });
    K.text('new RegExp(input)', 814, 410, { size: 19, mono: true, a: K.p(t, 17.6) });
    K.text('+ and ? act as quantifiers', 814, 440, { size: 16, color: P.red, a: K.p(t, 18.2) }); K.mark(1210, 410, false, 0.75, K.p(t, 18.2));
    K.text('new RegExp(RegExp.escape(input))', 814, 492, { size: 17, mono: true, a: K.p(t, 19.4) });
    K.text('matches the literal text', 814, 522, { size: 16, color: P.green, a: K.p(t, 20) }); K.mark(1210, 522, true, 0.75, K.p(t, 20));
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 4 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['this is set at the call: new, call/apply/bind, obj.method(), plain call',
     'Arrow functions take this from where they are written',
     'Strings are immutable; template literals interpolate with ${ }',
     'length counts UTF-16 units; spread counts code points',
     'Regex: named groups, matchAll, replace with a function',
     'Beware lastIndex with g, and ReDoS; escape user text'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 180 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 4 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
