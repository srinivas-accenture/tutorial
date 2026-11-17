/* Day 61 in motion: what TypeScript adds, editor errors, type erasure, check vs strip, everyday types. Loaded on demand by assets/js/motion.js. */
(function () {
  /* Consolas is ~0.55 × size wide per character: x of column c in a code line drawn at x with font size s */
  function col(x, c, s) { return x + c * s * 0.55; }
  /* red wavy underline (an editor squiggle) from x0 to x1 at y */
  function squig(K, x0, x1, y, a, color) {
    if (a <= 0) return; var g = K.g; g.save(); g.globalAlpha *= K.clamp(a); g.strokeStyle = color || K.P.red; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0, y + 1.5); for (var i = 1; x0 + i * 4 <= x1 + 2; i++) g.lineTo(x0 + i * 4, y + (i % 2 ? -1.5 : 1.5)); g.stroke(); g.restore();
  }
  /* translucent band behind columns c0..c1 of a code line whose top is y */
  function band(K, x, y, c0, c1, s, color, a) {
    if (a <= 0) return; K.box(col(x, c0, s) - 2, y - 3, (c1 - c0) * s * 0.55 + 4, s * 1.3, { fill: color, r: 4, a: a });
  }
  /* an error / info tooltip box with short mono lines */
  function tip(K, x, y, w, lines, a, ok) {
    if (a <= 0) return; var P = K.P, h = 30 + lines.length * 28;
    K.box(x, y, w, h, { fill: ok ? 'rgba(104,211,145,.10)' : 'rgba(252,129,129,.12)', stroke: ok ? P.green : P.red, a: a });
    K.mark(x + 24, y + 29, !!ok, 0.7, a);
    lines.forEach(function (l, i) { K.text(l, x + 48, y + 29 + i * 28, { size: 17, mono: true, color: i ? P.ink : (ok ? P.green : P.red), a: a }); });
  }

JSC.motion.define('day61', {
  kicker: 'JavaScript: Zero to Architect · Day 61',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 61: TypeScript. A type checker for JavaScript, how types disappear before your code runs, and the everyday types.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('TypeScript', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 61 · TypeScript foundations', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Static types', 'Type erasure', 'Everyday types'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ runtime vs edit time */
{ d: 24, title: 'Runtime vs edit time',
  caps: [
    [0.3, 'Plain JavaScript reports this typo only when the line runs, often in production.'],
    [6, 'TypeScript is JavaScript plus a static type layer: annotations, interfaces and a checker.'],
    [12, 'The checker reads your code as you type and underlines the mistake before anything runs.'],
    [18, 'There is no TypeScript engine. Browsers and Node.js only ever run the JavaScript.']],
  draw: function (K, t) {
    var P = K.P, js = ['function greet(u) {', '  return "Hi " + u.name.toUpperCase();', '}', 'greet({ nme: "Ana" });'];
    K.panel(40, 80, 600, 200, 'app.js', { a: K.p(t, 0.2) });
    K.code(js, 66, 128, { size: 20, n: K.typed(t, js, [0.5, 1.1, 2.5, 2.7], 34), t: t, a: K.p(t, 0.2), hi: K.win(t, 3.6, 6) > 0.5 ? 3 : -1, w: 570 });
    K.panel(680, 80, 560, 200, 'Console', { a: K.p(t, 0.2) });
    var e = K.p(t, 4);
    K.mark(712, 140, false, 0.8, e);
    K.text('TypeError: Cannot read properties', 740, 140, { size: 18, mono: true, color: P.red, a: e });
    K.text("of undefined (reading 'toUpperCase')", 740, 170, { size: 18, mono: true, color: P.red, a: e });
    K.text('found only when the line runs', 712, 236, { size: 18, color: P.warm, a: K.p(t, 4.8) });

    var ts = ['interface User { name: string }', 'function greet(u: User): string {', '  return "Hi " + u.name.toUpperCase();', '}', 'greet({ nme: "Ana" });'];
    var pa = K.p(t, 6);
    K.panel(40, 310, 600, 250, 'app.ts', { a: pa });
    var hb = K.p(t, 9.6) * (1 - K.p(t, 12, 0.6) * 0.6);
    band(K, 66, 358, 0, 31, 20, 'rgba(79,209,197,.20)', hb);
    band(K, 66, 390, 16, 22, 20, 'rgba(79,209,197,.20)', hb);
    band(K, 66, 390, 23, 31, 20, 'rgba(79,209,197,.20)', hb);
    K.code(ts, 66, 358, { size: 20, n: K.typed(t, ts, [6.4, 7.6, 8.8, 10.2, 10.4], 32), t: t, a: pa });
    K.text('types', 470, 344, { size: 16, color: P.acc, a: hb });
    var sq = K.p(t, 12.4, 0.4);
    squig(K, col(66, 8, 20), col(66, 11, 20), 512, sq);
    K.arrow(604, 497, 676, 420, { p: K.p(t, 12.6, 0.4), color: P.red, lw: 2 });
    tip(K, 680, 320, 560, ['Object literal may only specify', "known properties, and 'nme' does", "not exist in type 'User'. ts(2353)"], K.p(t, 12.8), false);
    var c = K.p(t, 14.5);
    K.mark(712, 466, true, 0.8, c);
    K.text('caught while you type, nothing ran', 740, 466, { size: 18, color: P.green, a: c });

    var r = K.p(t, 18.2);
    K.box(680, 494, 560, 90, { fill: false, stroke: P.line, dash: [8, 6], a: r });
    K.text('What actually runs: plain JavaScript', 704, 518, { size: 19, weight: 700, a: r });
    ['browser', 'Node.js', 'Deno · Bun'].forEach(function (s, i) {
      K.chip(s, 760 + i * 130, 557, { size: 17, stroke: P.green, a: K.p(t, 18.8 + i * 0.4) });
    });
  } },

/* 3 ─ the checker at work */
{ d: 26, title: 'The type checker at work',
  caps: [
    [0.3, 'Annotate a parameter with a type, and every call is checked against that shape.'],
    [5.5, 'A correct call passes. A misspelled property is flagged the moment you type it.'],
    [11.5, 'A number where a string was promised is flagged too, with a precise message.'],
    [17.5, 'Compatibility is by shape, not by name: any object with a string name fits User. This is structural typing.']],
  draw: function (K, t) {
    var P = K.P, code = ['interface User { name: string; age?: number }', '', 'function greet(u: User): string {', '  return "Hi " + u.name.toUpperCase();', '}', '',
      'greet({ name: "Ana" });', 'greet({ nme: "Ana" });', 'greet({ name: 42 });', 'const robot = { name: "R2", beeps: true };', 'greet(robot);'];
    var hi = t > 19.6 ? 10 : t > 17.8 ? 9 : t > 12 ? 8 : t > 7.6 ? 7 : t > 5.8 ? 6 : -1;
    K.panel(40, 80, 700, 440, 'greet.ts', { a: K.p(t, 0.2) });
    band(K, 66, 190, 16, 22, 20, 'rgba(79,209,197,.20)', K.win(t, 3.6, 5.6));
    K.code(code, 66, 126, { size: 20, n: K.typed(t, code, [0.6, 2.2, 2.3, 3.5, 4.9, 5, 5.8, 7.6, 12, 17.8, 19.6], 32), t: t, hi: hi, w: 670 });
    K.mark(706, 329, true, 0.75, K.p(t, 6.8));
    K.mark(706, 361, false, 0.75, K.p(t, 8.6));
    K.mark(706, 393, false, 0.75, K.p(t, 13));
    K.mark(706, 457, true, 0.75, K.p(t, 20.4));
    squig(K, col(66, 8, 20), col(66, 11, 20), 373, K.p(t, 8.4, 0.3));
    squig(K, col(66, 8, 20), col(66, 12, 20), 405, K.p(t, 12.8, 0.3));
    K.panel(770, 80, 470, 440, 'Problems', { a: K.p(t, 0.2) });
    tip(K, 790, 124, 430, ["'nme' does not exist", "in type 'User'.  ts(2353)"], K.p(t, 8.8), false);
    tip(K, 790, 236, 430, ["Type 'number' is not", "assignable to 'string'. ts(2322)"], K.p(t, 13.2), false);
    tip(K, 790, 348, 430, ['robot fits User:', 'it has a string name'], K.p(t, 20.6), true);
    K.chip('structural typing: shape, not name', 1005, 484, { size: 17, stroke: P.acc, a: K.p(t, 21.4) });
  } },

/* 4 ─ type erasure */
{ d: 26, title: 'Type erasure',
  caps: [
    [0.3, 'To run TypeScript, the types are stripped away. This is called type erasure.'],
    [6, 'The interface vanishes, and every annotation is deleted. What is left is plain JavaScript.'],
    [12.5, 'Nothing else changes: the same logic and the same output.'],
    [18, 'A few older features emit real code. An enum becomes an object, so prefer a union of string literals.']],
  draw: function (K, t) {
    var P = K.P, ts = ['interface User {', '  name: string;', '}', 'function greet(u: User): string {', '  return "Hi " + u.name;', '}', 'greet({ name: "Ana" });'];
    K.panel(40, 80, 560, 290, 'greet.ts', { a: K.p(t, 0.2) });
    var hl = K.p(t, 6.2), st = K.p(t, 7.4, 0.8), dim = K.p(t, 8.4);
    [[128, 0, 16], [160, 0, 15], [192, 0, 1], [224, 16, 22], [224, 23, 31]].forEach(function (b) {
      band(K, 66, b[0], b[1], b[2], 20, 'rgba(246,173,85,.22)', hl);
      if (st > 0) { var x0 = col(66, b[1], 20), x1 = col(66, b[2], 20); K.arrow(x0, b[0] + 12, x0 + (x1 - x0) * st, b[0] + 12, { color: P.red, lw: 2.5, head: 0.1 }); }
    });
    K.code(ts, 66, 128, { size: 20, n: K.typed(t, ts, [0.5, 1, 1.5, 1.7, 2.7, 3.5, 3.7], 36), t: t });
    K.text('erased', 330, 144, { size: 18, weight: 700, color: P.warm, a: hl * (1 - dim * 0.3) });
    K.chip('strip', 640, 190, { size: 16, stroke: P.warm, a: K.p(t, 8.6) });
    K.arrow(604, 228, 676, 228, { p: K.p(t, 8.6, 0.5), color: P.warm });
    var js = ['function greet(u) {', '  return "Hi " + u.name;', '}', 'greet({ name: "Ana" });'];
    K.panel(680, 80, 560, 290, 'greet.js', { a: K.p(t, 0.2) });
    K.code(js, 706, 128, { size: 20, n: K.typed(t, js, [9, 9.8, 10.6, 10.8], 34), t: t, hi: K.win(t, 12.8, 17.5) > 0.5 ? 1 : -1, w: 530 });
    var s = K.p(t, 13.6);
    K.mark(718, 320, true, 0.75, s);
    K.text('same logic · same output: "Hi Ana"', 742, 320, { size: 18, color: P.green, a: s });

    var e = K.p(t, 18.2), en = ['enum Color { Red, Green }'];
    K.panel(40, 400, 440, 180, 'colors.ts', { a: e });
    K.code(en, 66, 446, { size: 20, n: K.typed(t, en, [18.5], 30), t: t, a: e });
    var bad = K.p(t, 21.5);
    K.mark(78, 500, false, 0.7, bad); K.text('not erasable: emits code', 100, 500, { size: 17, color: P.red, a: bad });
    var good = K.p(t, 23);
    K.mark(78, 544, true, 0.7, good); K.text('type Color = "red" | "green"', 100, 544, { size: 17, mono: true, color: P.green, a: good });
    K.arrow(484, 490, 516, 490, { p: K.p(t, 19.4, 0.4), color: P.warm });
    var em = ['var Color;', '(function (Color) {', '  Color[Color["Red"] = 0] = "Red";', '  Color[Color["Green"] = 1] = "Green";', '})(Color || (Color = {}));'];
    K.panel(520, 400, 720, 180, 'colors.js', { a: K.p(t, 19.4) });
    K.code(em, 546, 442, { size: 18, lh: 1.4, n: K.typed(t, em, [19.7, 20.1, 20.6, 21.6, 22.8], 44), t: t, a: K.p(t, 19.4) });
  } },

/* 5 ─ check vs strip */
{ d: 24, title: 'Two separate jobs',
  caps: [
    [0.3, 'TypeScript tooling does two separate jobs. Job one: check the whole program and report errors.'],
    [6.5, 'Job two: strip the types and produce JavaScript. tsc, esbuild, SWC and Vite all do this.'],
    [12.5, 'Modern Node.js runs a .ts file directly by stripping the types, but it never checks them.'],
    [18, 'tsc even writes JavaScript when there are errors. So run tsc --noEmit in your editor and in CI.']],
  draw: function (K, t) {
    var P = K.P;
    function node(x, y, w, a, b, c, at) {
      var q = K.back((t - at) / 0.6); if (q <= 0) return;
      K.g.save(); K.g.translate(x + w / 2, y); K.g.scale(q, q);
      K.box(-w / 2, -48, w, 96, { stroke: c, a: K.clamp(q) });
      K.text(a, 0, -14, { size: 22, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(b, 0, 20, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
    }
    K.text('Job 1 · check', 50, 102, { size: 19, weight: 700, color: P.purple, a: K.p(t, 0.6) });
    node(50, 170, 230, 'app.ts', 'code + types', P.acc, 0.8);
    K.arrow(286, 170, 344, 170, { p: K.p(t, 1.8, 0.4), color: P.muted });
    node(350, 170, 230, 'Type checker', 'tsc --noEmit · editor', P.purple, 2);
    K.arrow(586, 170, 644, 170, { p: K.p(t, 3.4, 0.4), color: P.muted });
    node(650, 170, 230, 'Errors', 'squiggles · build fails', P.red, 3.6);
    K.text('reads, reports, writes no files', 1070, 170, { size: 17, color: P.muted, align: 'center', a: K.p(t, 4.6) });

    K.text('Job 2 · run', 50, 266, { size: 19, weight: 700, color: P.green, a: K.p(t, 6.6) });
    node(50, 334, 230, 'app.ts', 'code + types', P.acc, 6.8);
    K.arrow(286, 334, 344, 334, { p: K.p(t, 7.6, 0.4), color: P.muted });
    node(350, 334, 230, 'Strip types', 'tsc · esbuild · SWC · Node', P.warm, 7.8);
    K.arrow(586, 334, 644, 334, { p: K.p(t, 9, 0.4), color: P.muted });
    node(650, 334, 230, 'app.js', 'types erased', P.green, 9.2);
    K.arrow(886, 334, 944, 334, { p: K.p(t, 10.2, 0.4), color: P.muted });
    node(950, 334, 250, 'Engine', 'V8 · browser · Node.js', P.green, 10.4);

    var a = K.p(t, 12.6);
    K.panel(50, 420, 1180, 170, 'Terminal', { a: a });
    K.text('// app.ts:  const n: number = "5";  console.log(n + 1);', 76, 462, { size: 16, mono: true, color: P.muted, a: a });
    var c1 = ['$ node app.ts'];
    K.code(c1, 76, 486, { size: 20, n: K.typed(t, c1, [13.2], 20), t: t, a: a });
    K.text('51', 76, 534, { size: 20, mono: true, color: P.warm, a: K.p(t, 14.4, 0.3) });
    K.text('Node 22.18+ strips types: it runs, never checks', 120, 534, { size: 17, color: P.warm, a: K.p(t, 15) });
    var c2 = ['$ tsc --noEmit'];
    K.code(c2, 660, 486, { size: 20, n: K.typed(t, c2, [18.3], 20), t: t, a: K.p(t, 18) });
    K.text("error TS2322: Type 'string' is not", 660, 534, { size: 17, mono: true, color: P.red, a: K.p(t, 19.4) });
    K.text("assignable to type 'number'.", 660, 560, { size: 17, mono: true, color: P.red, a: K.p(t, 19.4) });
    var ci = K.back((t - 20.6) / 0.6);
    K.text('plain tsc: errors, yet app.js is still written', 1070, 258, { size: 16, color: P.warm, align: 'center', a: K.p(t, 19.8) });
    if (ci > 0) K.chip('CI gate: tsc --noEmit', 1070, 216, { size: 18, mono: true, stroke: P.purple, s: ci, a: K.clamp(ci) });
  } },

/* 6 ─ types vanish at runtime */
{ d: 22, title: 'Types are not runtime checks',
  caps: [
    [0.3, 'Because types are erased, they cannot protect you from data that arrives while the program runs.'],
    [6, 'Here the compiler believes u is a User, because we told it so with as.'],
    [11.5, 'But the JSON really holds a number. The code runs anyway, and the promise is silently broken.'],
    [17, 'So validate external data at the edges: fetch responses, JSON, storage and form input.']],
  draw: function (K, t) {
    var P = K.P, code = ['const u = JSON.parse(\'{"name": 42}\') as User;', 'u.name.toUpperCase();'];
    K.panel(40, 80, 1200, 130, 'user.ts', { a: K.p(t, 0.2) });
    K.code(code, 66, 126, { size: 20, n: K.typed(t, code, [0.8, 3], 30), t: t, hi: t > 13.5 ? 1 : t > 6.2 ? 0 : -1, w: 1150 });
    band(K, 66, 126, 37, 45, 20, 'rgba(246,173,85,.25)', K.win(t, 6.6, 11.2));
    var a = K.p(t, 6.4);
    K.box(40, 240, 560, 190, { stroke: P.acc, a: a });
    K.text('What the checker believes', 64, 268, { size: 18, weight: 700, color: P.acc, a: a });
    K.text('u: User', 64, 312, { size: 22, mono: true, a: K.p(t, 7.4) });
    K.text('{ name: string }', 64, 352, { size: 22, mono: true, a: K.p(t, 8) });
    K.mark(78, 398, true, 0.75, K.p(t, 9)); K.text('compiles cleanly, no squiggle', 102, 398, { size: 18, color: P.green, a: K.p(t, 9) });
    var b = K.p(t, 11.8);
    K.box(680, 240, 560, 190, { stroke: P.warm, a: b });
    K.text('What the runtime holds', 704, 268, { size: 18, weight: 700, color: P.warm, a: b });
    K.text('{ name: 42 }', 704, 312, { size: 22, mono: true, color: P.warm, a: K.p(t, 12.4) });
    K.text('typeof u.name  →  "number"', 704, 352, { size: 20, mono: true, a: K.p(t, 13) });
    var e = K.p(t, 14);
    K.mark(718, 398, false, 0.75, e); K.text('TypeError: u.name.toUpperCase is not a function', 742, 398, { size: 16, mono: true, color: P.red, a: e });
    K.arrow(600, 335, 676, 335, { p: K.p(t, 11.6, 0.5), color: P.red, dash: [6, 6] });

    var src = ['fetch()', 'JSON.parse', 'localStorage', 'form input'];
    src.forEach(function (s, i) {
      var x = 130 + (i % 2) * 210, y = 490 + Math.floor(i / 2) * 60, q = K.p(t, 17.4 + i * 0.4);
      K.chip(s, x, y, { size: 18, mono: true, stroke: P.blue, a: q });
      K.arrow(x + 90, y, 690, 520, { p: K.p(t, 18.6 + i * 0.2, 0.5), color: P.muted, lw: 2, head: 10 });
    });
    var gq = K.back((t - 19.2) / 0.6);
    if (gq > 0) {
      K.box(700, 470, 190, 100, { stroke: P.warm, a: K.clamp(gq) });
      K.text('validate', 795, 504, { size: 22, weight: 700, align: 'center', a: K.clamp(gq) });
      K.text('schema · checks', 795, 538, { size: 16, color: P.muted, align: 'center', a: K.clamp(gq) });
    }
    K.arrow(896, 520, 950, 520, { p: K.p(t, 20, 0.4), color: P.green });
    var tq = K.p(t, 20.4);
    K.box(960, 470, 270, 100, { stroke: P.green, a: tq });
    K.text('typed code', 1095, 504, { size: 22, weight: 700, align: 'center', a: tq });
    K.text('now the types are true', 1095, 538, { size: 16, color: P.muted, align: 'center', a: tq });
  } },

/* 7 ─ primitives, literals, inference */
{ d: 26, title: 'Primitives, literals, inference',
  caps: [
    [0.3, 'The everyday types: string, number, boolean, bigint, symbol, null and undefined, all lowercase.'],
    [6.5, 'Often you write no annotation at all. TypeScript infers the type from the value.'],
    [12, 'A const string gets a literal type: exactly "GET". A union of literals models a fixed set of choices.'],
    [18.5, 'Assign a value outside the set and the editor flags it at once.']],
  draw: function (K, t) {
    var P = K.P;
    ['string', 'number', 'boolean', 'bigint', 'symbol', 'null', 'undefined'].forEach(function (s, i) {
      var q = K.back((t - 0.6 - i * 0.4) / 0.5);
      if (q > 0) K.chip(s, 160 + i * 160, 116, { s: q, a: K.clamp(q), size: 20, mono: true, stroke: P.acc });
    });
    K.text('lowercase primitives, never String or Number (wrapper objects)', 640, 168, { size: 17, color: P.muted, align: 'center', a: K.p(t, 3.8) });
    var code = ['let count = 0;', 'const method = "GET";', '', 'type Method = "GET" | "POST";', 'let m: Method = "POST";', 'm = "PATCH";'];
    var hi = t > 18.8 ? 5 : t > 13.6 ? 3 : t > 12.2 ? 1 : t > 6.8 ? 0 : -1;
    K.panel(40, 200, 680, 380, 'types.ts', { a: K.p(t, 6.4) });
    K.code(code, 66, 250, { size: 22, n: K.typed(t, code, [6.8, 8.6, 9.6, 13.6, 15.4, 18.8], 26), t: t, hi: hi, w: 650, a: K.p(t, 6.4) });
    squig(K, col(66, 4, 22), col(66, 11, 22), 452, K.p(t, 19.6, 0.3));

    function badge(y, s, note, at, c) {
      var q = K.p(t, at);
      K.box(760, y, 480, 56, { fill: P.code, stroke: c, a: q });
      K.text(s, 784, y + 28, { size: 20, mono: true, a: q });
      K.text(note, 1220, y + 28, { size: 16, color: P.muted, align: 'right', a: q });
    }
    badge(222, 'let count: number', 'inferred', 7.6, P.acc);
    K.arrow(724, 263, 756, 252, { p: K.p(t, 7.6, 0.4), color: P.acc, lw: 2, head: 9 });
    badge(294, 'const method: "GET"', 'literal type', 12.4, P.warm);
    K.arrow(724, 298, 756, 320, { p: K.p(t, 12.4, 0.4), color: P.warm, lw: 2, head: 9 });
    var u = K.p(t, 14.6);
    K.box(760, 366, 480, 76, { fill: false, stroke: P.purple, dash: [7, 6], a: u });
    K.text('Method =', 784, 404, { size: 20, mono: true, color: P.purple, a: u });
    K.chip('"GET"', 960, 404, { size: 20, mono: true, stroke: P.green, a: K.p(t, 15) });
    K.text('|', 1040, 404, { size: 24, mono: true, color: P.muted, a: K.p(t, 15.3) });
    K.chip('"POST"', 1120, 404, { size: 20, mono: true, stroke: P.green, a: K.p(t, 15.6) });
    K.arrow(724, 375, 756, 400, { p: K.p(t, 14.6, 0.4), color: P.purple, lw: 2, head: 9 });
    tip(K, 760, 466, 480, ["Type '\"PATCH\"' is not", "assignable to 'Method'. ts(2322)"], K.p(t, 20), false);
  } },

/* 8 ─ arrays, tuples, readonly */
{ d: 24, title: 'Arrays, tuples, readonly',
  caps: [
    [0.3, 'Arrays are typed by their elements: number[] is a list of numbers, so a string is rejected.'],
    [6, 'A tuple is a fixed-length array with a type for each slot, like an egg carton with labelled slots.'],
    [12, 'readonly forbids changes such as push, but only inside the checker.'],
    [18, 'After erasure a tuple is a normal array and readonly is gone. Use Object.freeze when you need a runtime lock.']],
  draw: function (K, t) {
    var P = K.P, code = ['const ids: number[] = [1, 2, 3];', 'ids.push("4");', 'type Entry = [key: string, value: number];', 'const e: Entry = ["age", 30];',
      'const names: readonly string[] = ["a"];', 'names.push("b");'];
    var hi = t > 14.2 ? 5 : t > 12.2 ? 4 : t > 8.4 ? 3 : t > 6.2 ? 2 : t > 3 ? 1 : t > 0.6 ? 0 : -1;
    K.panel(40, 80, 700, 330, 'collections.ts', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [0.6, 3, 6.2, 8.4, 12.2, 14.2], 30), t: t, hi: hi, w: 670 });
    squig(K, col(66, 9, 20), col(66, 12, 20), 182, K.p(t, 4.2, 0.3));
    squig(K, col(66, 6, 20), col(66, 10, 20), 310, K.p(t, 15.4, 0.3));

    var ar = K.p(t, 1.2);
    K.text('ids', 790, 140, { size: 18, mono: true, color: P.muted, a: ar });
    [1, 2, 3].forEach(function (v, i) {
      K.box(840 + i * 60, 118, 52, 44, { fill: P.code, stroke: P.acc, a: ar, r: 6 });
      K.text(String(v), 866 + i * 60, 140, { size: 20, mono: true, color: P.warm, align: 'center', a: ar });
    });
    tip(K, 780, 180, 460, ["Argument of type 'string' is", "not assignable to 'number'."], K.p(t, 4.4), false);

    var tq = K.p(t, 6.8);
    K.text('Entry', 790, 330, { size: 18, weight: 700, color: P.muted, a: tq });
    [['key: string', '"age"', P.green, 9.4], ['value: number', '30', P.warm, 9.8]].forEach(function (s, i) {
      var x = 870 + i * 185;
      K.box(x, 284, 170, 96, { fill: P.code, stroke: P.blue, a: tq });
      K.text(s[0], x + 85, 306, { size: 16, color: P.muted, align: 'center', a: tq });
      K.text(s[1], x + 85, 348, { size: 24, mono: true, color: s[2], align: 'center', a: K.p(t, s[3]) });
    });
    K.lock(1216, 434, 0.8, P.warm, K.p(t, 15.6));
    tip(K, 780, 404, 460, ["Property 'push' does not exist", "on type 'readonly string[]'."], K.p(t, 15.6), false);

    var e = K.p(t, 18.2), js = ['const e = ["age", 30];', 'e.push(99);              // runs: length 3', 'Object.freeze(names);    // a real lock'];
    K.panel(40, 430, 700, 150, 'collections.js (after erasure)', { a: e });
    K.code(js, 66, 474, { size: 19, lh: 1.5, n: K.typed(t, js, [18.6, 19.6, 21.2], 36), t: t, a: e });
    K.chip('readonly, tuples: checker only', 1010, 524, { size: 17, stroke: P.warm, a: K.p(t, 20.4) });
    K.chip('Object.freeze: runtime lock', 1010, 568, { size: 17, stroke: P.green, a: K.p(t, 22) });
  } },

/* 9 ─ interface vs type */
{ d: 26, title: 'Objects: interface and type',
  caps: [
    [0.3, 'Describe object shapes with an interface. Mark fields readonly, or optional with a question mark.'],
    [6.5, 'Interfaces can extend each other. Admin has everything User has, plus permissions.'],
    [12.5, 'A type alias can name any type, including a union, which an interface cannot express.'],
    [19, 'Pick one convention: interface for object contracts, type for unions and helpers.']],
  draw: function (K, t) {
    var P = K.P, code = ['interface User {', '  readonly id: number;', '  name: string;', '  email?: string;', '}', 'interface Admin extends User {', '  permissions: string[];', '}', '',
      'type Shape =', '  | { kind: "circle"; r: number }', '  | { kind: "square"; size: number };'];
    var hi = t > 12.8 ? 9 : t > 6.8 ? 5 : -1;
    K.panel(40, 80, 640, 500, 'models.ts', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [0.6, 1.4, 2.4, 3.2, 4.2, 6.8, 8, 9, 9.1, 12.8, 13.6, 15], 30), t: t, hi: hi, w: 610 });

    var u = K.p(t, 1.6);
    K.box(720, 90, 250, 184, { stroke: P.acc, a: u });
    K.text('User', 744, 116, { size: 22, weight: 700, color: P.acc, a: u });
    K.lock(748, 160, 0.7, P.warm, K.p(t, 2));
    K.text('id: number', 768, 160, { size: 18, mono: true, a: K.p(t, 2) });
    K.text('name: string', 744, 200, { size: 18, mono: true, a: K.p(t, 3) });
    K.box(734, 222, 222, 36, { fill: false, stroke: P.muted, dash: [5, 5], r: 8, a: K.p(t, 4) });
    K.text('email?: string', 744, 240, { size: 18, mono: true, color: P.muted, a: K.p(t, 4) });

    var ad = K.p(t, 7.4);
    K.box(990, 90, 250, 230, { stroke: P.purple, a: ad });
    K.text('Admin', 1014, 116, { size: 22, weight: 700, color: P.purple, a: ad });
    ['id: number', 'name: string', 'email?: string'].forEach(function (s, i) { K.text(s, 1014, 160 + i * 40, { size: 18, mono: true, color: P.muted, a: K.p(t, 8 + i * 0.3) }); });
    K.text('permissions: string[]', 1006, 284, { size: 17, mono: true, color: P.green, a: K.p(t, 9.4) });
    K.curve(845, 276, 880, 336, 986, 304, { p: K.p(t, 7.8, 0.7), color: P.purple, lw: 2.5 });
    K.text('extends', 846, 330, { size: 16, color: P.purple, a: K.p(t, 8.2) });

    var s = K.p(t, 13);
    K.box(720, 350, 520, 190, { fill: false, stroke: P.blue, dash: [8, 6], a: s });
    K.text('type Shape', 744, 376, { size: 18, weight: 700, color: P.blue, a: s });
    [['kind: "circle"', 'r: number', 13.8], ['kind: "square"', 'size: number', 15.2]].forEach(function (c, i) {
      var x = 744 + i * 262, q = K.p(t, c[2]);
      K.box(x, 400, 210, 90, { stroke: P.blue, a: q });
      K.text(c[0], x + 18, 430, { size: 17, mono: true, a: q });
      K.text(c[1], x + 18, 462, { size: 17, mono: true, a: q });
    });
    K.text('|', 980, 445, { size: 30, mono: true, color: P.muted, align: 'center', a: K.p(t, 15) });
    var no = K.p(t, 16.6);
    K.mark(752, 516, false, 0.7, no); K.text('an interface cannot be a union', 774, 516, { size: 17, color: P.red, a: no });
    K.chip('interface: object contracts', 862, 566, { size: 16, stroke: P.acc, a: K.p(t, 19.4) });
    K.chip('type: unions, helpers', 1115, 566, { size: 16, stroke: P.blue, a: K.p(t, 20) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 61 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['TypeScript = JavaScript + a static type checker',
     'Errors appear as you type; types are erased before code runs',
     'Checking (tsc --noEmit) and stripping are separate jobs',
     'Types never validate runtime data: check the edges',
     'Primitives, literals, unions, tuples, interface and type'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 61 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
