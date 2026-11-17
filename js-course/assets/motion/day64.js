/* Day 64 in motion: conditional and distributive types, infer, mapped and template literal types, unknown, as / ! / satisfies, validation at the edges. Loaded on demand by assets/js/motion.js. */
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
  function diamond(K, x, y, w, h, c, a) {
    if (a <= 0) return; var g = K.g; g.save(); g.globalAlpha *= K.clamp(a);
    g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y - h); g.lineTo(x + w, y); g.lineTo(x, y + h); g.closePath();
    g.fillStyle = K.P.card; g.fill(); g.strokeStyle = c; g.lineWidth = 2.5; g.stroke(); g.restore();
  }

JSC.motion.define('day64', {
  kicker: 'JavaScript: Zero to Architect · Day 64',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 64: types that compute other types, and keeping the type system honest where outside data comes in.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Advanced types', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 64 · Advanced types', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Conditional types', 'Mapped types', 'Safe edges'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ conditional types */
{ d: 24, title: 'Conditional types',
  caps: [
    [0.3, 'A conditional type is an if statement for types: T extends U ? X : Y.'],
    [6.5, 'IsString<"x"> is true. IsString<42> is false. The check runs once T is known.'],
    [12.5, 'infer captures a piece of the matched type: Unwrap<Promise<User>> pulls out User.'],
    [18.5, 'This is exactly how built-ins like Awaited, ReturnType and Parameters are written.']],
  draw: function (K, t) {
    var P = K.P, c1 = ['type IsString<T> = T extends string ? true : false;'];
    K.panel(40, 80, 1200, 100, 'conditional.ts', { a: K.p(t, 0.2) });
    K.code(c1, 66, 122, { size: 22, n: K.typed(t, c1, [0.6], 24), t: t });
    var dq = K.p(t, 3.4);
    diamond(K, 520, 300, 160, 74, P.purple, dq);
    K.text('T extends string ?', 520, 300, { size: 20, mono: true, align: 'center', a: dq });
    K.chip('"x"', 170, 250, { size: 22, mono: true, stroke: P.blue, a: K.p(t, 6.8) });
    K.chip('42', 170, 350, { size: 22, mono: true, stroke: P.blue, a: K.p(t, 9.4) });
    K.arrow(215, 250, 358, 290, { p: K.p(t, 7.2, 0.5), color: P.green });
    K.arrow(205, 350, 358, 310, { p: K.p(t, 9.8, 0.5), color: P.red });
    K.curve(682, 296, 720, 240, 760, 236, { p: K.p(t, 7.8, 0.5), color: P.green });
    K.curve(682, 304, 720, 360, 760, 364, { p: K.p(t, 10.4, 0.5), color: P.red });
    K.chip('true', 810, 236, { size: 22, mono: true, stroke: P.green, color: P.green, a: K.p(t, 8.2) });
    K.chip('false', 816, 364, { size: 22, mono: true, stroke: P.red, color: P.red, a: K.p(t, 10.8) });
    K.text('IsString<"x">', 880, 236, { size: 18, mono: true, color: P.muted, a: K.p(t, 8.6) });
    K.text('IsString<42>', 890, 364, { size: 18, mono: true, color: P.muted, a: K.p(t, 11.2) });
    K.text('built with infer', 1150, 214, { size: 16, color: P.muted, align: 'center', a: K.p(t, 18.8) });
    ['Awaited', 'ReturnType', 'Parameters'].forEach(function (s, i) {
      K.chip(s, 1150, 260 + i * 56, { size: 18, mono: true, stroke: P.acc, a: K.p(t, 19.2 + i * 0.4) });
    });
    var ia = K.p(t, 12.6), c2 = ['type Unwrap<T> = T extends Promise<infer V> ? V : T;', 'type U = Unwrap<Promise<User>>;'];
    K.panel(40, 430, 1200, 150, 'infer', { a: ia });
    band(K, 66, 472, 35, 42, 22, 'rgba(246,173,85,.28)', K.p(t, 14.6));
    K.code(c2, 66, 472, { size: 22, lh: 1.6, n: K.typed(t, c2, [12.8, 15.4], 26), t: t, a: ia });
    K.arrow(470, 523, 540, 523, { p: K.p(t, 16.8, 0.4), color: P.green });
    K.chip('User', 600, 523, { size: 22, mono: true, stroke: P.green, a: K.p(t, 17.2) });
  } },

/* 3 ─ distribution */
{ d: 22, title: 'Distributive types',
  caps: [
    [0.3, 'Give a conditional type a union, and it runs once per member. This is called distribution.'],
    [6, 'ToArray<string | number> becomes string[] | number[], not one mixed array.'],
    [11.5, 'Exclude is built on this: members that match become never, and never vanishes from a union.'],
    [17, 'Wrap T in square brackets to switch distribution off and treat the union as a whole.']],
  draw: function (K, t) {
    var P = K.P, c1 = ['type ToArray<T> = T extends unknown ? T[] : never;'];
    K.panel(40, 80, 1200, 90, 'distribute.ts', { a: K.p(t, 0.2) });
    K.code(c1, 66, 116, { size: 22, n: K.typed(t, c1, [0.6], 26), t: t });
    var q = K.p(t, 3);
    K.chip('string | number', 160, 270, { size: 21, mono: true, stroke: P.blue, a: q });
    K.arrow(260, 258, 360, 220, { p: K.p(t, 3.6, 0.5), color: P.muted });
    K.arrow(260, 282, 360, 320, { p: K.p(t, 3.8, 0.5), color: P.muted });
    [['string extends unknown ?', 'string[]', 220, 4.2], ['number extends unknown ?', 'number[]', 320, 4.8]].forEach(function (r) {
      var a = K.p(t, r[3]);
      K.box(370, r[2] - 34, 330, 68, { stroke: P.purple, a: a });
      K.text(r[0], 535, r[2], { size: 19, mono: true, align: 'center', a: a });
      K.arrow(706, r[2], 760, r[2], { p: K.p(t, r[3] + 2.4, 0.4), color: P.green });
      K.chip(r[1], 830, r[2], { size: 21, mono: true, stroke: P.green, a: K.p(t, r[3] + 2.8) });
    });
    K.arrow(900, 220, 970, 262, { p: K.p(t, 8.2, 0.4), color: P.green }); K.arrow(900, 320, 970, 278, { p: K.p(t, 8.2, 0.4), color: P.green });
    K.chip('string[] | number[]', 1100, 270, { size: 20, mono: true, stroke: P.green, color: P.green, a: K.p(t, 8.6) });

    var b = K.p(t, 11.6), c2 = ['type Ex = Exclude<"a" | "b" | "c", "b">;'];
    K.panel(40, 380, 1200, 200, 'built on distribution', { a: b });
    K.code(c2, 66, 420, { size: 20, n: K.typed(t, c2, [11.8], 30), t: t, a: b });
    [['"a"', true], ['"b"', false], ['"c"', true]].forEach(function (c, i) {
      var x = 680 + i * 120, drop = c[1] ? 0 : K.p(t, 14.4, 0.6);
      K.chip(c[0], x, 432 + drop * 20, { size: 20, mono: true, stroke: c[1] ? P.green : P.red, a: K.p(t, 13 + i * 0.3) * (1 - drop * 0.7) });
    });
    K.text('never', 800, 474, { size: 16, mono: true, color: P.red, align: 'center', a: K.p(t, 14.8) });
    K.text('→  "a" | "c"', 1040, 432, { size: 20, mono: true, color: P.green, a: K.p(t, 15.4) });
    var c3 = ['type NoDist<T> = [T] extends [unknown] ? T[] : never;', 'type M = NoDist<string | number>;   // (string | number)[]'];
    K.code(c3, 66, 496, { size: 20, lh: 1.5, n: K.typed(t, c3, [17.2, 19.2], 34), t: t, a: K.p(t, 17) });
    band(K, 66, 496, 17, 20, 20, 'rgba(246,173,85,.28)', K.p(t, 18.6));
  } },

/* 4 ─ mapped types */
{ d: 26, title: 'Mapped types',
  caps: [
    [0.3, 'A mapped type copies every key of another type, and stamps each value the same way.'],
    [6.5, 'Modifiers can be added or removed: readonly and the question mark, with a plus or a minus.'],
    [12.5, 'With as, keys can be renamed. Getters turns name and age into getName and getAge.'],
    [19, 'Map a key to never and it is dropped. That filters keys by the type of their value.']],
  draw: function (K, t) {
    var P = K.P, code, ph2 = t >= 12.4;
    K.panel(40, 80, 640, 300, 'mapped.ts', { a: K.p(t, 0.2) });
    if (!ph2) {
      code = ['type Frozen<T> = {', '  readonly [K in keyof T]: T[K];', '};', '', 'type Mutable<T> = {', '  -readonly [K in keyof T]-?: T[K];', '};'];
      var f1 = 1 - K.p(t, 11.8, 0.5);
      band(K, 66, 128 + 32, 11, 25, 20, 'rgba(79,209,197,.22)', K.win(t, 2, 6.4) * f1);
      band(K, 66, 128 + 5 * 32, 2, 11, 20, 'rgba(246,173,85,.25)', K.p(t, 8.6) * f1);
      band(K, 66, 128 + 5 * 32, 27, 29, 20, 'rgba(246,173,85,.25)', K.p(t, 9.4) * f1);
      K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [0.6, 1.4, 2.6, 2.7, 6.8, 7.6, 9], 32), t: t, a: f1 });
    } else {
      code = ['type Getters<T> = {', '  [K in keyof T as `get${Capitalize<K & string>}`]:', '    () => T[K];', '};'];
      band(K, 66, 128 + 32, 16, 50, 20, 'rgba(183,148,244,.22)', K.p(t, 15));
      K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [12.6, 13.4, 14.8, 15.4], 34), t: t, a: K.p(t, 12.4) });
    }
    var s = K.p(t, 1.2);
    K.box(720, 90, 210, 130, { stroke: P.blue, a: s });
    K.text('User', 740, 116, { size: 20, weight: 700, color: P.blue, a: s });
    K.text('name: string', 740, 156, { size: 18, mono: true, a: s });
    K.text('age: number', 740, 190, { size: 18, mono: true, a: s });
    K.arrow(936, 155, 970, 155, { p: K.p(t, 2.6, 0.4), color: P.acc });
    var o1 = K.p(t, 3) * (1 - K.p(t, 6.4, 0.4)), o2 = K.p(t, 7) * (1 - K.p(t, 12, 0.4)), o3 = K.p(t, 16.2);
    K.box(980, 90, 260, 130, { stroke: o3 > 0.5 ? P.purple : o2 > 0.5 ? P.warm : P.acc, a: Math.max(o1, o2, o3) });
    K.text('Frozen<User>', 1000, 116, { size: 18, weight: 700, color: P.acc, a: o1 });
    K.text('readonly name', 1000, 156, { size: 18, mono: true, a: o1 });
    K.text('readonly age', 1000, 190, { size: 18, mono: true, a: o1 });
    K.text('Mutable<…>', 1000, 116, { size: 18, weight: 700, color: P.warm, a: o2 });
    K.text('name: string', 1000, 156, { size: 18, mono: true, a: o2 });
    K.text('age: number', 1000, 190, { size: 18, mono: true, a: o2 });
    K.text('Getters<User>', 1000, 116, { size: 18, weight: 700, color: P.purple, a: o3 });
    K.text('getName: () => string', 996, 156, { size: 17, mono: true, a: K.p(t, 16.8) });
    K.text('getAge: () => number', 996, 190, { size: 17, mono: true, a: K.p(t, 17.2) });
    K.chip('-readonly', 800, 280, { size: 19, mono: true, stroke: P.warm, a: K.win(t, 8.8, 12.2) });
    K.chip('-?  required', 1000, 280, { size: 19, mono: true, stroke: P.warm, a: K.win(t, 9.6, 12.2) });
    K.chip('key remapping with as', 980, 280, { size: 18, stroke: P.purple, a: K.p(t, 15.6) });

    var d = K.p(t, 19.2), c2 = ['type DataOnly<T> = { [K in keyof T as T[K] extends Function ? never : K]: T[K] };'];
    K.panel(40, 400, 1200, 180, 'filter keys', { a: d });
    K.code(c2, 66, 444, { size: 20, n: K.typed(t, c2, [19.4], 44), t: t, a: d });
    [['id', true], ['save()', false], ['name', true]].forEach(function (c, i) {
      var x = 160 + i * 150, q = K.p(t, 21.6 + i * 0.3);
      K.chip(c[0], x, 526, { size: 20, mono: true, stroke: c[1] ? P.green : P.red, a: q * (c[1] ? 1 : 1 - K.p(t, 23, 0.5) * 0.6) });
    });
    K.text('→ never, dropped', 310, 566, { size: 16, color: P.red, align: 'center', a: K.p(t, 23) });
    K.text('→  { id: number; name: string }', 560, 526, { size: 20, mono: true, color: P.green, a: K.p(t, 23.6) });
  } },

/* 5 ─ template literal types */
{ d: 24, title: 'Template literal types',
  caps: [
    [0.3, 'Template literal types build string types with the same backtick syntax as template strings.'],
    [6, 'Unions multiply: two events times two phases give four handler names.'],
    [11.5, 'With infer they can also parse strings. Params pulls id and postId out of a route path.'],
    [17.5, 'So a router can type its handler: p.id is fine, and the typo p.idd is flagged.']],
  draw: function (K, t) {
    var P = K.P, c1 = ['type Handler = `on${Capitalize<"click" | "focus">}${"Start" | "End"}`;'];
    K.panel(40, 80, 1200, 100, 'events.ts', { a: K.p(t, 0.2) });
    K.code(c1, 66, 122, { size: 21, n: K.typed(t, c1, [0.6], 26), t: t });
    K.text('2 events × 2 phases = 4 names', 330, 222, { size: 18, color: P.muted, align: 'center', a: K.p(t, 6.2) });
    ['onClickStart', 'onClickEnd', 'onFocusStart', 'onFocusEnd'].forEach(function (s, i) {
      var q = K.back((t - 7 - i * 0.5) / 0.5);
      if (q > 0) K.chip(s, 200 + (i % 2) * 260, 280 + Math.floor(i / 2) * 64, { size: 19, mono: true, stroke: P.purple, s: q, a: K.clamp(q) });
    });
    var pa = K.p(t, 12), path = '"/users/:id/posts/:postId"';
    K.box(660, 200, 580, 190, { fill: false, stroke: P.line, dash: [8, 6], a: pa });
    K.text('Params<path>', 684, 226, { size: 17, weight: 700, color: P.muted, a: pa });
    band(K, 690, 256, 8, 11, 21, 'rgba(246,173,85,.3)', K.p(t, 13));
    band(K, 690, 256, 18, 25, 21, 'rgba(246,173,85,.3)', K.p(t, 13.4));
    K.code([path], 690, 256, { size: 21, a: pa });
    K.arrow(col(690, 9.5, 21), 286, 820, 330, { p: K.p(t, 13.6, 0.4), color: P.warm, lw: 2, head: 9 });
    K.arrow(col(690, 21.5, 21), 286, 1010, 330, { p: K.p(t, 13.8, 0.4), color: P.warm, lw: 2, head: 9 });
    K.chip('"id"', 820, 352, { size: 20, mono: true, stroke: P.green, a: K.p(t, 14.2) });
    K.text('|', 915, 352, { size: 22, mono: true, color: P.muted, a: K.p(t, 14.4) });
    K.chip('"postId"', 1010, 352, { size: 20, mono: true, stroke: P.green, a: K.p(t, 14.6) });

    var r = K.p(t, 17.6), c2 = ['declare function route<S extends string>(path: S,', '  handler: (p: Record<Params<S>, string>) => void): void;', 'route("/users/:id", (p) => p.idd);'];
    K.panel(40, 410, 1200, 170, 'router.ts', { a: r });
    K.code(c2, 66, 450, { size: 19, lh: 1.5, n: K.typed(t, c2, [17.8, 18.6, 19.8], 48), t: t, a: r });
    squig(K, col(66, 30, 19), col(66, 33, 19), 450 + 2 * 28.5 + 21, K.p(t, 20.8, 0.3));
    tip(K, 700, 494, 520, ["Property 'idd' does not exist.", "Did you mean 'id'?"], K.p(t, 21.2), false);
  } },

/* 6 ─ any vs unknown */
{ d: 24, title: 'any vs unknown',
  caps: [
    [0.3, 'Everything that crosses the edge of your program is untrusted: JSON, fetch, storage, environment variables.'],
    [6, 'any switches the checker off, and it spreads: every property of any is any again.'],
    [12, 'unknown accepts every value, but lets you do nothing with it until you narrow it.'],
    [18, 'After typeof and in checks, raw.name is a string, and safe to use.']],
  draw: function (K, t) {
    var P = K.P, A = ['const data = JSON.parse(text);', 'data.user.nmae.toUpperCase();', 'const n: number = data;'];
    var la = K.p(t, 6.2);
    K.panel(40, 80, 580, 250, 'any', { a: la, stroke: P.warm });
    K.code(A, 66, 124, { size: 20, n: K.typed(t, A, [6.4, 7.8, 9.4], 34), t: t, a: la });
    K.text('data: any', 470, 124 + 10, { size: 17, mono: true, color: P.warm, a: K.p(t, 7.4) });
    K.mark(78, 254, false, 0.75, K.p(t, 10.4)); K.text('no squiggles: checking is off', 102, 254, { size: 18, color: P.warm, a: K.p(t, 10.4) });
    K.text('the typo and the wrong type both compile', 70, 294, { size: 17, color: P.muted, a: K.p(t, 11) });
    var B = ['const raw: unknown = JSON.parse(text);', 'raw.name;'], ra = K.p(t, 12.2);
    K.panel(660, 80, 580, 250, 'unknown', { a: ra, stroke: P.green });
    K.code(B, 686, 124, { size: 20, n: K.typed(t, B, [12.4, 14], 34), t: t, a: ra });
    squig(K, col(686, 0, 20), col(686, 3, 20), 124 + 32 + 23, K.p(t, 14.6, 0.3));
    tip(K, 680, 220, 540, ["'raw' is of type 'unknown'."], K.p(t, 15), false);

    var e = K.p(t, 0.6) * (1 - K.p(t, 17.4, 0.5));
    K.box(560, 360, 680, 210, { fill: false, stroke: P.acc, dash: [8, 6], a: e });
    K.text('your program: typed core', 900, 465, { size: 22, weight: 700, color: P.acc, align: 'center', a: e });
    ['JSON.parse', 'fetch()', 'localStorage', 'process.env'].forEach(function (s, i) {
      var y = 384 + i * 52, q = K.p(t, 1 + i * 0.5) * (1 - K.p(t, 17.4, 0.5));
      K.chip(s, 200, y, { size: 18, mono: true, stroke: P.red, a: q });
      K.arrow(300, y, 552, 465, { color: P.red, lw: 2, head: 9, dash: [6, 5], a: q });
    });
    K.text('untrusted', 420, 572, { size: 17, color: P.red, align: 'center', a: K.p(t, 3) * (1 - K.p(t, 17.4, 0.5)) });

    var n = K.p(t, 18), C = ['if (typeof raw === "object" && raw !== null && "name" in raw && typeof raw.name === "string") {', '  raw.name.toUpperCase();', '}'];
    K.panel(40, 360, 1200, 220, 'narrow it first', { a: n, stroke: P.green });
    K.code(C, 66, 404, { size: 18, lh: 1.6, n: K.typed(t, C, [18.2, 21.2, 22.4], 50), t: t, a: n });
    var ok = K.p(t, 22.4);
    K.mark(78, 540, true, 0.75, ok); K.text('raw.name: string', 102, 540, { size: 19, mono: true, color: P.green, a: ok });
  } },

/* 7 ─ as, !, satisfies */
{ d: 26, title: 'as, ! and satisfies',
  caps: [
    [0.3, 'as is a promise to the compiler, not a conversion. A string asserted as a number is still a string.'],
    [6.5, 'The non-null assertion, an exclamation mark, checks nothing either. A missing element crashes later.'],
    [12.5, 'satisfies checks a value against a type, but keeps the value\'s own precise type.'],
    [19, 'A typo inside the object is caught, and the keys stay exactly "home" and "admin".']],
  draw: function (K, t) {
    var P = K.P, A = ['const n = JSON.parse(\'"42"\') as number;', 'n + 1;'];
    K.panel(40, 80, 1200, 128, 'as', { a: K.p(t, 0.2) });
    K.code(A, 66, 122, { size: 20, lh: 1.5, n: K.typed(t, A, [0.6, 2.4], 30), t: t });
    K.text('compiler believes: number', 760, 128, { size: 18, color: P.acc, a: K.p(t, 2) });
    K.mark(774, 170, false, 0.7, K.p(t, 3.4)); K.text('runtime: "421", a string', 798, 170, { size: 18, mono: true, color: P.red, a: K.p(t, 3.4) });
    var b = K.p(t, 6.6), B = ['const el = document.getElementById("app")!;', 'el.textContent = "Hi";'];
    K.panel(40, 222, 1200, 128, '!  non-null assertion', { a: b });
    K.code(B, 66, 264, { size: 20, lh: 1.5, n: K.typed(t, B, [6.8, 8.8], 34), t: t, a: b });
    band(K, 66, 264, 42, 43, 20, 'rgba(246,173,85,.3)', K.p(t, 8.2));
    K.text('no #app in the page?', 760, 270, { size: 18, color: P.muted, a: K.p(t, 9.4) });
    K.mark(774, 312, false, 0.7, K.p(t, 10.2)); K.text("TypeError: Cannot set properties of null", 798, 312, { size: 17, mono: true, color: P.red, a: K.p(t, 10.2) });
    var c = K.p(t, 12.6), C = ['const routes = {', '  home:  { path: "/", auth: false },', '  admin: { pth: "/admin", auth: true },', '} satisfies Record<string, Route>;'];
    K.panel(40, 364, 1200, 216, 'satisfies', { a: c, stroke: P.green });
    band(K, 66, 404 + 3 * 30, 2, 11, 20, 'rgba(104,211,145,.25)', K.p(t, 15.4));
    K.code(C, 66, 404, { size: 20, lh: 1.5, n: K.typed(t, C, [12.8, 13.4, 14.4, 15.2], 40), t: t, a: c });
    squig(K, col(66, 11, 20), col(66, 14, 20), 404 + 2 * 30 + 23, K.p(t, 19.4, 0.3));
    tip(K, 640, 384, 580, ["'pth' does not exist in type 'Route'."], K.p(t, 19.8), false);
    var k = K.p(t, 21.6);
    K.text('keyof typeof routes', 660, 504, { size: 18, mono: true, color: P.muted, a: k });
    K.chip('"home"', 960, 504, { size: 19, mono: true, stroke: P.green, a: K.p(t, 22) });
    K.text('|', 1034, 504, { size: 22, mono: true, color: P.muted, a: K.p(t, 22.2) });
    K.chip('"admin"', 1110, 504, { size: 19, mono: true, stroke: P.green, a: K.p(t, 22.4) });
    K.text('an annotation would widen the keys to string', 660, 552, { size: 16, color: P.muted, a: K.p(t, 23.2) });
  } },

/* 8 ─ validate at the door */
{ d: 26, title: 'Validate at the door',
  caps: [
    [0.3, 'The fix is to validate at the door. A schema checks the data at runtime.'],
    [6.5, 'The same schema also gives you the static type, so the check and the type cannot drift apart.'],
    [12.5, 'Bad data fails fast, with a path to the problem, instead of crashing somewhere deep inside.'],
    [18.5, 'Brands mark values that passed a check: an Email is a string that was validated.']],
  draw: function (K, t) {
    var P = K.P, S = ['const User = z.object({', '  id: z.string(),', '  email: z.string().email(),', '  role: z.enum(["admin", "viewer"]),', '});', 'type User = z.infer<typeof User>;'];
    var hi = t > 6.8 ? 5 : -1;
    K.panel(40, 80, 700, 250, 'user.schema.ts  (zod-style)', { a: K.p(t, 0.2) });
    K.code(S, 66, 124, { size: 20, lh: 1.5, n: K.typed(t, S, [0.6, 1.4, 2.2, 3.4, 4.8, 6.8], 34), t: t, hi: hi, w: 670 });
    var f = K.p(t, 2);
    K.chip('unknown', 840, 120, { size: 19, mono: true, stroke: P.red, a: f });
    K.arrow(918, 120, 960, 120, { color: P.muted, a: f });
    K.box(966, 92, 150, 56, { stroke: P.warm, a: f });
    K.text('User.parse', 1041, 120, { size: 18, mono: true, align: 'center', a: f });
    K.arrow(1120, 120, 1162, 120, { color: P.muted, a: f });
    K.chip('User', 1196, 120, { size: 19, mono: true, stroke: P.green, a: f });
    var ty = K.p(t, 8);
    K.box(780, 170, 460, 160, { fill: P.code, stroke: P.green, a: ty });
    K.text('type User =', 800, 198, { size: 17, color: P.muted, a: ty });
    K.text('{ id: string; email: string;', 800, 238, { size: 18, mono: true, a: ty });
    K.text('  role: "admin" | "viewer" }', 800, 272, { size: 18, mono: true, a: ty });
    K.text('inferred from the schema', 1220, 306, { size: 16, color: P.green, align: 'right', a: K.p(t, 9) });

    var c = K.p(t, 12.6), C = ['User.parse({ id: "u1", email: "a@x.io", role: "root" });'];
    K.panel(40, 350, 700, 230, 'Console', { a: c });
    K.code(C, 66, 394, { size: 18, n: K.typed(t, C, [12.8], 40), t: t, a: c });
    var e = K.p(t, 14.6);
    K.mark(80, 450, false, 0.75, e); K.text('ParseError at role:', 106, 450, { size: 19, mono: true, color: P.red, a: e });
    K.text('expected "admin" | "viewer"', 106, 482, { size: 19, mono: true, color: P.red, a: e });
    K.text('stops at the door, nothing deeper runs', 70, 540, { size: 17, color: P.muted, a: K.p(t, 15.6) });

    var b = K.p(t, 18.6), B = ['type Email = string & { __brand: "Email" };', 'sendWelcome("x@y.io");', 'sendWelcome(toEmail(input));'];
    K.panel(780, 350, 460, 230, 'brands', { a: b });
    K.code(B, 800, 394, { size: 16, lh: 1.7, n: K.typed(t, B, [18.8, 20.6, 22.4], 40), t: t, a: b });
    squig(K, col(800, 12, 16), col(800, 20, 16), 394 + 27 + 19, K.p(t, 21.6, 0.3));
    K.mark(1210, 394 + 27 + 9, false, 0.6, K.p(t, 21.6));
    K.mark(1210, 394 + 54 + 9, true, 0.6, K.p(t, 23.6));
    K.text('string is not an Email', 800, 520, { size: 16, color: P.red, a: K.p(t, 21.8) });
    K.text('zero runtime cost: still a string', 800, 552, { size: 16, color: P.muted, a: K.p(t, 23.8) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 64 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Conditional types are if statements for types, with infer',
     'They distribute over unions; Exclude filters members',
     'Mapped types copy keys; as renames or drops them',
     'Template literal types build and parse strings',
     'unknown + a schema at the edges; as and ! check nothing'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 64 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
