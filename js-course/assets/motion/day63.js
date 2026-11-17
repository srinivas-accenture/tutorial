/* Day 63 in motion: type parameters, inference, constraints, keyof and T[K], erasure of generics, typeof and utility types. Loaded on demand by assets/js/motion.js. */
(function () {
  function col(x, c, s) { return x + c * s * 0.55; }
  function squig(K, x0, x1, y, a, color) {
    if (a <= 0) return; var g = K.g; g.save(); g.globalAlpha *= K.clamp(a); g.strokeStyle = color || K.P.red; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0, y + 1.5); for (var i = 1; x0 + i * 4 <= x1 + 2; i++) g.lineTo(x0 + i * 4, y + (i % 2 ? -1.5 : 1.5)); g.stroke(); g.restore();
  }
  function band(K, x, y, c0, c1, s, color, a) {
    if (a <= 0) return; K.box(col(x, c0, s) - 2, y - 3, (c1 - c0) * s * 0.55 + 4, s * 1.3, { fill: color, r: 4, a: a });
  }
  function tip(K, x, y, w, lines, a, ok) {
    if (a <= 0) return; var P = K.P, h = 30 + lines.length * 28;
    K.box(x, y, w, h, { fill: ok ? 'rgba(104,211,145,.10)' : 'rgba(252,129,129,.12)', stroke: ok ? P.green : P.red, a: a });
    K.mark(x + 24, y + 29, !!ok, 0.7, a);
    lines.forEach(function (l, i) { K.text(l, x + 48, y + 29 + i * 28, { size: 17, mono: true, color: i ? P.ink : (ok ? P.green : P.red), a: a }); });
  }

JSC.motion.define('day63', {
  kicker: 'JavaScript: Zero to Architect · Day 63',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 63: generics. Functions and types that work for many types, and types derived from other types.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Generics', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 63 · Generics', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Type parameters', 'Constraints', 'Derived types'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ why generics */
{ d: 24, title: 'Why generics',
  caps: [
    [0.3, 'Without generics, a helper like first is either repeated for every type, or returns any and loses all safety.'],
    [6.5, 'With any, a typo on the result compiles fine, and only fails later at runtime.'],
    [12, 'A type parameter T is a variable for a type: whatever kind of array goes in, that same type comes out.'],
    [18.5, 'Now the result is a User, and the same typo is flagged immediately.']],
  draw: function (K, t) {
    var P = K.P, A = ['function first(xs: any[]): any {', '  return xs[0];', '}', 'const u = first(users);', 'u.nmae;'];
    K.panel(40, 80, 580, 250, 'without generics', { a: K.p(t, 0.2) });
    band(K, 66, 128, 19, 24, 20, 'rgba(246,173,85,.25)', K.win(t, 2.4, 8));
    band(K, 66, 128, 26, 30, 20, 'rgba(246,173,85,.25)', K.win(t, 2.4, 8));
    K.code(A, 66, 128, { size: 20, n: K.typed(t, A, [0.5, 1.8, 2.3, 6.6, 8], 30), t: t, hi: K.win(t, 8.2, 12) > 0.5 ? 4 : -1, w: 550 });
    K.text('u: any', 420, 224, { size: 18, mono: true, color: P.warm, a: K.p(t, 7.6) });
    var w = K.p(t, 9);
    K.mark(64, 366, false, 0.8, w);
    K.text('no squiggle: compiles', 90, 366, { size: 19, color: P.warm, a: w });
    K.text('runtime: u.nmae is undefined', 90, 400, { size: 19, mono: true, color: P.red, a: K.p(t, 10) });

    var B = ['function first<T>(xs: T[]): T | undefined {', '  return xs[0];', '}', 'const u = first(users);', 'u?.nmae;'];
    var b = K.p(t, 12.2);
    K.panel(660, 80, 580, 250, 'with a type parameter', { a: b });
    band(K, 686, 128, 14, 17, 20, 'rgba(79,209,197,.25)', K.p(t, 13.4));
    K.code(B, 686, 128, { size: 20, n: K.typed(t, B, [12.4, 14, 14.6, 18.6, 19.6], 34), t: t, a: b, hi: t > 19.6 ? 4 : -1, w: 550 });
    K.text('u: User | undefined', 1030, 224, { size: 17, mono: true, color: P.green, align: 'center', a: K.p(t, 19.2) });
    squig(K, col(686, 4, 20), col(686, 8, 20), 128 + 4 * 32 + 23, K.p(t, 20.4, 0.3));
    tip(K, 660, 350, 580, ["Property 'nmae' does not exist on", "type 'User'. Did you mean 'name'?"], K.p(t, 20.8), false);

    var f = K.p(t, 14.8);
    K.chip('[User, User]', 230, 530, { size: 20, mono: true, stroke: P.blue, a: f });
    K.arrow(330, 530, 466, 530, { p: K.p(t, 15.2, 0.5), color: P.acc });
    K.box(480, 486, 320, 88, { stroke: P.acc, a: K.p(t, 15.4) });
    K.text('first<T>', 640, 516, { size: 24, mono: true, weight: 700, align: 'center', a: K.p(t, 15.4) });
    K.text('T = User', 640, 550, { size: 17, mono: true, color: P.acc, align: 'center', a: K.p(t, 16.2) });
    K.arrow(806, 530, 930, 530, { p: K.p(t, 16.6, 0.5), color: P.acc });
    K.chip('User', 1000, 530, { size: 20, mono: true, stroke: P.green, a: K.p(t, 17) });
  } },

/* 3 ─ inference */
{ d: 22, title: 'Inference',
  caps: [
    [0.3, 'You rarely write T yourself. TypeScript infers it from the arguments at each call.'],
    [6, 'Pass numbers and T becomes number. Pass strings and T becomes string.'],
    [12, 'You can also pass T explicitly in angle brackets, but prefer letting the arguments drive inference.'],
    [17, 'One function, many types, and the link between input and output is kept.']],
  draw: function (K, t) {
    var P = K.P, sig = ['function first<T>(xs: T[]): T | undefined'], x0 = 340;
    K.box(300, 92, 680, 70, { fill: P.code, stroke: P.line, a: K.p(t, 0.2) });
    [[15, 16], [22, 23], [28, 29]].forEach(function (c, i) { band(K, x0, 112, c[0], c[1], 26, 'rgba(79,209,197,.3)', K.p(t, 1.6 + i * 0.4)); });
    K.code(sig, x0, 112, { size: 26, a: K.p(t, 0.2) });
    var R = [['first([1, 2, 3])', 'T = number', 'number | undefined', 6.2, P.acc], ['first(["a", "b"])', 'T = string', 'string | undefined', 9, P.acc],
             ['first<User>(users)', 'T = User', 'User | undefined', 12.4, P.purple]];
    R.forEach(function (r, i) {
      var y = 240 + i * 100, q = K.p(t, r[3]);
      K.box(40, y - 40, 1200, 80, { fill: P.card, stroke: P.line, a: q });
      K.code([r[0]], 66, y - 12, { size: 22, n: K.typed(t, [r[0]], [r[3]], 30), t: t, a: q });
      K.arrow(390, y, 460, y, { p: K.p(t, r[3] + 0.8, 0.4), color: r[4] });
      K.chip(r[1], 570, y, { size: 21, mono: true, stroke: r[4], color: r[4], a: K.p(t, r[3] + 1) });
      K.arrow(680, y, 750, y, { p: K.p(t, r[3] + 1.6, 0.4), color: P.green });
      K.text(r[2], 770, y, { size: 22, mono: true, color: P.green, a: K.p(t, r[3] + 1.8) });
      K.text(i < 2 ? 'inferred' : 'explicit', 1220, y, { size: 16, color: P.muted, align: 'right', a: K.p(t, r[3] + 2) });
    });
    K.curve(150, 214, 200, 170, 361 + 15 * 14.3 - 20, 150, { p: K.p(t, 7, 0.6), color: P.acc, lw: 2, dash: [5, 5] });
    K.chip('one function · many types · input linked to output', 640, 556, { size: 20, stroke: P.green, a: K.p(t, 17.4) });
  } },

/* 4 ─ constraints */
{ d: 24, title: 'Constraints',
  caps: [
    [0.3, 'Inside a generic function, T could be anything, so you cannot just read .length on it.'],
    [6.5, 'A constraint, T extends an object with a length, says what T must at least have.'],
    [12.5, 'Strings and arrays both qualify, and each call returns its own precise type.'],
    [18, 'A number has no length, so that call is rejected at the call site.']],
  draw: function (K, t) {
    var P = K.P, code;
    K.panel(40, 80, 760, 320, 'longest.ts', { a: K.p(t, 0.2) });
    if (t < 6.4) {
      code = ['function longest<T>(a: T, b: T): T {', '  return a.length >= b.length ? a : b;', '}'];
      var fa = 1 - K.p(t, 5.8, 0.5);
      K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [0.5, 1.8, 3.2], 32), t: t, a: fa });
      squig(K, col(66, 11, 20), col(66, 17, 20), 183, K.p(t, 3.4, 0.3) * fa);
    } else {
      code = ['function longest<T extends { length: number }>(', '  a: T, b: T): T {', '  return a.length >= b.length ? a : b;', '}',
        'longest("abc", "de");', 'longest([1, 2], [3]);', 'longest(1, 2);'];
      band(K, 66, 128, 19, 45, 20, 'rgba(79,209,197,.22)', K.p(t, 7.4));
      var hi = t > 18.2 ? 6 : t > 14.6 ? 5 : t > 12.6 ? 4 : -1;
      K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [6.6, 8.4, 9, 9.8, 12.6, 14.6, 18.2], 32), t: t, hi: hi, w: 730 });
      K.text('→ string', 620, 268, { size: 18, mono: true, color: P.green, a: K.p(t, 13.8) });
      K.text('→ number[]', 620, 300, { size: 18, mono: true, color: P.green, a: K.p(t, 15.8) });
      squig(K, col(66, 8, 20), col(66, 9, 20), 128 + 6 * 32 + 23, K.p(t, 18.8, 0.3));
    }
    tip(K, 820, 96, 420, ["Property 'length' does not", "exist on type 'T'.  ts(2339)"], K.win(t, 3.6, 6.2), false);
    var g = K.p(t, 7.2);
    K.box(820, 90, 420, 310, { fill: false, stroke: P.acc, dash: [8, 6], a: g });
    K.text('T must have', 844, 120, { size: 18, color: P.muted, a: g });
    K.text('length: number', 974, 120, { size: 18, mono: true, color: P.acc, a: g });
    [['"abc"', 'string', true, 13.2], ['[1, 2]', 'number[]', true, 15.2], ['1', 'number', false, 18.8]].forEach(function (r, i) {
      var y = 190 + i * 70, q = K.p(t, r[3]);
      K.chip(r[0], 910, y, { size: 20, mono: true, stroke: r[2] ? P.green : P.red, a: q });
      K.text(r[1], 1000, y, { size: 18, mono: true, color: P.muted, a: q });
      K.mark(1200, y, r[2], 0.8, K.p(t, r[3] + 0.4));
    });
    tip(K, 40, 430, 1200, ["Argument of type 'number' is not assignable", "to parameter of type '{ length: number; }'.  ts(2345)"], K.p(t, 19.4), false);
  } },

/* 5 ─ keyof and T[K] */
{ d: 26, title: 'keyof and T[K]',
  caps: [
    [0.3, 'keyof T is the union of T\'s property names, as literal types.'],
    [6.5, 'K extends keyof T allows only those names, and T[K] is the type stored at that key.'],
    [13, 'So get(user, "age") returns a number, not any.'],
    [18.5, 'Misspell the key, and the editor tells you exactly which keys are allowed.']],
  draw: function (K, t) {
    var P = K.P, code = ['const user = { name: "Ana", age: 30 };', '', 'function get<T, K extends keyof T>(', '  obj: T, key: K): T[K] {', '  return obj[key];', '}', 'const a = get(user, "age");', 'get(user, "agee");'];
    var hi = t > 18.6 ? 7 : t > 13.2 ? 6 : t > 6.6 ? 2 : t > 1 ? 0 : -1;
    K.panel(40, 80, 700, 300, 'get.ts', { a: K.p(t, 0.2) });
    K.code(code, 66, 124, { size: 20, lh: 1.5, n: K.typed(t, code, [1, 2.4, 6.6, 8, 9, 9.6, 13.2, 18.6], 34), t: t, hi: hi, w: 670 });
    band(K, 66, 124 + 3 * 30, 19, 23, 20, 'rgba(246,173,85,.25)', K.win(t, 9, 13));
    squig(K, col(66, 9, 20), col(66, 15, 20), 124 + 7 * 30 + 23, K.p(t, 19.6, 0.3));

    var o = K.p(t, 1.6);
    K.box(780, 90, 460, 70, { fill: P.code, stroke: P.blue, a: o });
    K.text('T = { name: string; age: number }', 800, 125, { size: 18, mono: true, a: o });
    var k = K.p(t, 3);
    K.text('keyof T', 800, 206, { size: 20, mono: true, color: P.purple, a: k });
    K.arrow(890, 206, 930, 206, { color: P.purple, lw: 2, head: 9, a: k });
    var sel = K.p(t, 10);
    K.chip('"name"', 1000, 206, { size: 20, mono: true, stroke: P.purple, a: K.p(t, 3.6) * (1 - sel * 0.6) });
    K.text('|', 1072, 206, { size: 22, mono: true, color: P.muted, a: K.p(t, 3.9) });
    K.chip('"age"', 1140, 206, { size: 20, mono: true, stroke: sel > 0.5 ? P.warm : P.purple, a: K.p(t, 4.2) });
    K.text('K = "age"', 1140, 256, { size: 17, mono: true, color: P.warm, align: 'center', a: sel });
    K.arrow(1140, 276, 1140, 304, { p: K.p(t, 10.6, 0.4), color: P.warm, lw: 2, head: 9 });
    K.text('T["age"]', 950, 326, { size: 20, mono: true, color: P.warm, a: K.p(t, 11) });
    K.chip('number', 1140, 326, { size: 20, mono: true, stroke: P.green, a: K.p(t, 11.4) });
    var r = K.p(t, 14.4);
    K.mark(800, 384, true, 0.75, r); K.text('a: number', 826, 384, { size: 20, mono: true, color: P.green, a: r });
    tip(K, 40, 410, 1200, ["Argument of type '\"agee\"' is not assignable", "to parameter of type '\"name\" | \"age\"'.  ts(2345)"], K.p(t, 20), false);
  } },

/* 6 ─ erased */
{ d: 22, title: 'Generics are erased',
  caps: [
    [0.3, 'Generics are erased like every other type. The emitted function is plain JavaScript.'],
    [6, 'So T does not exist at runtime: new T() cannot work, and neither can instanceof T.'],
    [11.5, 'Pass a real value instead: a constructor, or a schema that checks the data.'],
    [17, 'And a fetchJson<T> that only casts the response is an unchecked promise in disguise.']],
  draw: function (K, t) {
    var P = K.P, A = ['function first<T>(xs: T[]): T | undefined {', '  return xs[0];', '}'], B = ['function first(xs) {', '  return xs[0];', '}'];
    K.panel(40, 80, 580, 160, 'first.ts', { a: K.p(t, 0.2) });
    var hl = K.p(t, 1.8);
    [[14, 17], [21, 25], [26, 42]].forEach(function (c) { band(K, 66, 124, c[0], c[1], 20, 'rgba(246,173,85,.22)', hl); });
    K.code(A, 66, 124, { size: 20, lh: 1.5, n: K.typed(t, A, [0.4, 1.4, 1.6], 50), t: t });
    K.arrow(624, 160, 656, 160, { p: K.p(t, 2.6, 0.4), color: P.warm });
    K.panel(660, 80, 580, 160, 'first.js', { a: K.p(t, 2.6) });
    K.code(B, 686, 124, { size: 20, lh: 1.5, n: K.typed(t, B, [3, 3.8, 4.4], 34), t: t });

    var m = K.p(t, 6.2), C = ['function create<T>(): T {', '  return new T();', '}'];
    K.panel(40, 262, 580, 160, 'create.ts', { a: m });
    K.code(C, 66, 306, { size: 20, lh: 1.5, n: K.typed(t, C, [6.4, 7.4, 8.2], 30), t: t, a: m });
    squig(K, col(66, 13, 20), col(66, 14, 20), 306 + 30 + 23, K.p(t, 8.6, 0.3));
    tip(K, 660, 272, 580, ["'T' only refers to a type, but is", 'being used as a value here.  ts(2693)'], K.p(t, 9), false);

    var f = K.p(t, 11.8), D = ['function create<T>(Ctor: new () => T): T {', '  return new Ctor();', '}'];
    K.panel(40, 444, 580, 136, 'pass a value', { a: f, stroke: P.green });
    K.code(D, 66, 484, { size: 19, lh: 1.4, n: K.typed(t, D, [12, 13.4, 14.2], 34), t: t, a: f });
    var u = K.p(t, 17.2), E = ['async function fetchJson<T>(url: string) {', '  return (await fetch(url)).json() as T;', '}'];
    K.panel(660, 444, 580, 136, 'a cast in disguise', { a: u, stroke: P.red });
    K.code(E, 686, 484, { size: 19, lh: 1.4, n: K.typed(t, E, [17.4, 18.6, 19.6], 34), t: t, a: u });
    band(K, 686, 484 + 27, 36, 40, 19, 'rgba(252,129,129,.3)', K.p(t, 20));
  } },

/* 7 ─ derive from values */
{ d: 26, title: 'Derive types from values',
  caps: [
    [0.3, 'Do not write the same shape twice. Derive the types from one source of truth.'],
    [6.5, 'In a type position, typeof lifts a value into a type. as const keeps the exact literals.'],
    [12.5, 'keyof typeof config gives its keys, and an indexed access reads the type of one property.'],
    [18.5, 'From a const array, typeof STATUSES indexed by number gives the union of its values.']],
  draw: function (K, t) {
    var P = K.P, code = ['const config = {', '  port: 8080,', '  host: "localhost",', '} as const;', '', 'type Config = typeof config;', 'type Key = keyof typeof config;', 'type Port = (typeof config)["port"];', '',
      'const STATUSES = ["draft", "live"] as const;', 'type Status = (typeof STATUSES)[number];'];
    var hi = t > 18.8 ? 10 : t > 15.2 ? 7 : t > 12.8 ? 6 : t > 6.8 ? 5 : -1;
    K.panel(40, 80, 640, 500, 'config.ts', { a: K.p(t, 0.2) });
    band(K, 66, 128 + 3 * 32, 2, 10, 20, 'rgba(246,173,85,.25)', K.win(t, 9.6, 13));
    K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [0.6, 1.4, 2.2, 3.2, 3.6, 6.8, 12.8, 15.2, 16.6, 18.8, 20.6], 32), t: t, hi: hi, w: 610 });
    K.chip('one value', 560, 160, { size: 17, stroke: P.acc, a: K.win(t, 3.6, 7) });

    var c = K.p(t, 7.8);
    K.box(720, 90, 520, 130, { fill: P.code, stroke: P.acc, a: c });
    K.text('Config', 744, 116, { size: 17, weight: 700, color: P.acc, a: c });
    K.text('{ readonly port: 8080;', 744, 152, { size: 19, mono: true, a: c });
    K.text('  readonly host: "localhost" }', 744, 186, { size: 19, mono: true, a: c });
    K.text('without as const, port would be just number', 744, 244, { size: 16, color: P.muted, a: K.p(t, 10) });
    function row(y, label, chips, at, color) {
      var q = K.p(t, at);
      K.text(label, 744, y, { size: 18, weight: 700, color: P.muted, a: q });
      var x = 850;
      chips.forEach(function (s, i) {
        if (i) { K.text('|', x + 6, y, { size: 22, mono: true, color: P.muted, a: q }); x += 26; }
        var w = s.length * 11 + 30; K.chip(s, x + w / 2, y, { size: 20, mono: true, stroke: color, a: K.p(t, at + i * 0.3) }); x += w + 8;
      });
    }
    row(310, 'Key', ['"port"', '"host"'], 13.6, P.purple);
    row(380, 'Port', ['8080'], 16.2, P.warm);
    row(470, 'Status', ['"draft"', '"live"'], 21.4, P.green);
  } },

/* 8 ─ utility types */
{ d: 26, title: 'Utility types',
  caps: [
    [0.3, 'Utility types fold one interface into every variant you need.'],
    [6, 'Omit removes keys. NewUser is what a client sends: no id, no createdAt.'],
    [12, 'Pick keeps only some keys, and Partial makes them optional: a patch.'],
    [18.5, 'Record builds an object type from keys. ReturnType with Awaited reads what an async function resolves to.']],
  draw: function (K, t) {
    var P = K.P, F = ['id: string', 'name: string', 'email: string', 'role: Role', 'createdAt: Date'];
    var u = K.p(t, 0.6);
    K.box(40, 80, 330, 270, { stroke: P.acc, a: u });
    K.text('interface User', 64, 108, { size: 20, weight: 700, color: P.acc, a: u });
    F.forEach(function (f, i) {
      var y = 150 + i * 40, gone = (i === 0 || i === 4) ? K.win(t, 6.6, 11.6) : 0;
      K.text(f, 64, y, { size: 18, mono: true, a: K.p(t, 1 + i * 0.25), color: gone > 0.5 ? P.red : P.ink });
      if (gone > 0) K.arrow(60, y, 60 + f.length * 9.9 + 8, y, { color: P.red, lw: 2.5, head: 0.1, a: gone });
    });
    function card(x, title, rows, at, c, dash) {
      var q = K.p(t, at);
      K.box(x, 80, 270, 270, { stroke: c, a: q });
      K.text(title, x + 22, 108, { size: 20, weight: 700, color: c, a: q });
      rows.forEach(function (r, i) {
        var y = 150 + i * 40, rq = K.p(t, at + 0.5 + i * 0.3);
        if (dash) K.box(x + 14, y - 17, 242, 34, { fill: false, stroke: P.muted, dash: [5, 5], r: 8, a: rq });
        K.text(r, x + 24, y, { size: 18, mono: true, a: rq });
      });
    }
    card(400, 'NewUser', ['name: string', 'email: string', 'role: Role'], 7.2, P.blue);
    card(690, 'UserPatch', ['name?: string', 'email?: string'], 13, P.purple, true);
    card(980, 'ByRole', ['admin: User[]', 'editor: User[]', 'viewer: User[]'], 19, P.warm);

    var code = ['type NewUser   = Omit<User, "id" | "createdAt">;', 'type UserPatch = Partial<Pick<User, "name" | "email">>;', 'type ByRole    = Record<Role, User[]>;', 'type Fetched   = Awaited<ReturnType<typeof fetchUser>>;'];
    var hi = t > 21 ? 3 : t > 18.6 ? 2 : t > 12.2 ? 1 : t > 6.2 ? 0 : -1;
    K.panel(40, 380, 1200, 200, 'derived.ts', { a: K.p(t, 6) });
    K.code(code, 66, 424, { size: 20, lh: 1.5, n: K.typed(t, code, [6.2, 12.2, 18.6, 21], 36), t: t, hi: hi, w: 1170 });
    K.text('→ { id: string; name: string }', 740, 424 + 90 + 11, { size: 17, mono: true, color: P.green, a: K.p(t, 22.8) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 63 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['A type parameter links input to output: first<T>',
     'T is usually inferred from the arguments',
     'Constraints (T extends …) say what T must have',
     'keyof, T[K], typeof: derive types, never repeat them',
     'Generics are erased: pass constructors or schemas as values'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 63 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
