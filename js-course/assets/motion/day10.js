/* Day 10 in motion: object and array destructuring, spread and rest, shallow copies, symbols, Proxy and Reflect, freeze, structuredClone and using. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day10', {
  kicker: 'JavaScript: Zero to Architect · Day 10',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 10: destructuring, Proxy and immutability, the tools of concise and safe modern JavaScript.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Destructuring', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 10 · Destructuring, Proxy and immutability', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Spread and rest', 'Proxy and Reflect', 'structuredClone · using'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ object destructuring */
{ d: 26, title: 'Object destructuring',
  caps: [
    [0.3, 'Object destructuring unpacks properties into variables, matching them by key.'],
    [6, 'name: n renames while extracting. role is missing, so its default "user" applies.'],
    [12.5, '...rest collects every remaining own property into a new object.'],
    [18.5, 'Defaults apply only for undefined, not null. And destructuring null or undefined itself throws a TypeError.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const user = { id: 7, name: "Ana", tags: [1, 2] };', 'const { id, name: n, role = "user", ...rest } = user;'];
    K.panel(40, 84, 1200, 124, 'unpack.js');
    K.code(code, 64, 124, { size: 21, n: K.typed(t, code, [0.6, 2.2], 30), t: t });
    var sb = K.p(t, 1.2);
    K.box(60, 236, 440, 260, { stroke: P.blue, a: sb });
    K.text('user', 84, 264, { size: 21, weight: 700, color: P.blue, a: sb });
    var R = [['id: 7', 312, 1.4, 4.4], ['name: "Ana"', 362, 1.6, 6.6], ['tags: [1, 2]', 412, 1.8, 13]];
    R.forEach(function (r) {
      var hot = K.win(t, r[3], r[3] + 1.6, 0.2);
      K.box(80, r[1] - 20, 400, 40, { fill: hot > 0.3 ? 'rgba(79,209,197,.14)' : P.code, stroke: hot > 0.3 ? P.acc : P.line, r: 8, a: K.p(t, r[2]) });
      K.text(r[0], 100, r[1], { size: 20, mono: true, a: K.p(t, r[2]) });
    });
    K.text('role: (missing → undefined)', 100, 462, { size: 18, color: P.muted, a: K.p(t, 8.6) });
    var V = [['id', '7', 312, 4.4, P.acc, ''], ['n', '"Ana"', 362, 6.6, P.acc, 'renamed'], ['role', '"user"', 432, 9.2, P.warm, 'default'], ['rest', '{ tags: [1, 2] }', 492, 13, P.purple, '']];
    V.forEach(function (v, i) {
      var q = K.back((t - v[3]) / 0.5); if (q <= 0) return;
      K.chip(v[0], 800, v[2], { mono: true, size: 20, stroke: v[4], s: q });
      K.text('= ' + v[1], 850, v[2], { size: 20, mono: true, color: v[4], a: K.clamp(q) });
      if (v[5]) K.text(v[5], 1220, v[2], { size: 16, color: P.muted, align: 'right', a: K.clamp(q) });
      var sy = i === 3 ? 412 : i === 2 ? 462 : v[2];
      K.arrow(i === 2 ? 380 : 488, sy, 756, v[2], { p: K.p(t, v[3] - 0.3, 0.4), color: v[4], lw: 2.5, head: 10 });
    });
    var a = K.p(t, 18.8), b = K.p(t, 20.4);
    K.mark(74, 556, true, 0.8, a);
    K.text('const { b = 2 } = { b: null };  // b is null', 100, 556, { size: 18, mono: true, a: a });
    K.mark(694, 556, false, 0.8, b);
    K.text('const { x } = null;  // TypeError', 720, 556, { size: 18, mono: true, color: P.red, a: b });
  } },

/* 3 ─ arrays, swap, spread, rest */
{ d: 24, title: 'Arrays, spread and rest',
  caps: [
    [0.3, 'Array destructuring goes by position and works on any iterable. Skip a slot with an empty comma.'],
    [6.5, 'Swap two variables without a temporary: [x, y] = [y, x].'],
    [11.5, 'Spread pours an iterable out into separate values. Rest collects the leftovers into a real array.'],
    [17.5, 'Same three dots, opposite jobs: spread expands, rest gathers.']],
  draw: function (K, t) {
    var P = K.P, c = ['const [a, , c = 9, ...more] = [1, 2, undefined, 4, 5];'];
    K.panel(40, 84, 1200, 72, '');
    K.code(c, 64, 106, { size: 21, n: K.typed(t, c, [0.5], 36), t: t });
    var vals = ['1', '2', 'undefined', '4', '5'];
    vals.forEach(function (v, i) {
      var x = 120 + i * 120, q = K.p(t, 1.4 + i * 0.15);
      K.box(x - 55, 196, 110, 52, { stroke: P.blue, a: q });
      K.text(v, x, 222, { size: i === 2 ? 17 : 21, mono: true, align: 'center', a: q });
    });
    var D = [['a = 1', 120, 2.6, P.acc], ['skipped', 240, 3.0, P.muted], ['c = 9', 360, 3.4, P.warm], ['more = [4, 5]', 540, 3.8, P.purple]];
    D.forEach(function (d, i) {
      var q = K.back((t - d[2]) / 0.5); if (q <= 0) return;
      K.chip(d[0], d[1], 320, { mono: true, size: 18, stroke: d[3], color: i === 1 ? P.muted : P.ink, s: q });
      if (i === 3) { K.arrow(480, 252, 520, 300, { p: K.p(t, d[2], 0.3), color: d[3], lw: 2.5, head: 9 }); K.arrow(600, 252, 560, 300, { p: K.p(t, d[2], 0.3), color: d[3], lw: 2.5, head: 9 }); }
      else K.arrow(d[1], 252, d[1], 298, { p: K.p(t, d[2], 0.3), color: d[3], lw: 2.5, head: 9 });
    });
    K.text('undefined → default 9', 360, 366, { size: 16, color: P.warm, align: 'center', a: K.p(t, 4.2) });
    var sw = K.p(t, 6.6);
    K.box(720, 180, 520, 200, { stroke: P.acc, a: sw });
    K.text('let x = 1, y = 2;  [x, y] = [y, x];', 744, 210, { size: 18, mono: true, a: sw });
    var m = K.p(t, 8.2, 1.2);
    K.chip('x', 840, 280, { mono: true, size: 22, stroke: P.acc, a: sw });
    K.chip('y', 840, 340, { mono: true, size: 22, stroke: P.acc, a: sw });
    var arc = Math.sin(m * Math.PI) * 70;
    K.arrow(870, 280, 920, 280, { p: sw, color: P.muted, lw: 2, head: 8 });
    K.arrow(870, 340, 920, 340, { p: sw, color: P.muted, lw: 2, head: 8 });
    K.chip('1', 950 + arc, 280 + m * 60, { mono: true, size: 22, stroke: P.warm, color: P.warm, a: sw });
    K.chip('2', 950 - arc, 340 - m * 60, { mono: true, size: 22, stroke: P.warm, color: P.warm, a: sw });
    K.text('swapped: x is 2, y is 1', 1060, 310, { size: 18, color: P.green, a: K.p(t, 9.6) });
    var sp = K.p(t, 11.8);
    K.box(40, 410, 580, 120, { stroke: P.acc, a: sp });
    K.text('Math.max(...[1, 5, 3])  // 5', 64, 440, { size: 19, mono: true, a: sp });
    ['1', '5', '3'].forEach(function (v, i) {
      var q = K.p(t, 12.6 + i * 0.25);
      K.chip(v, 140 + i * 90, 494, { mono: true, size: 18, stroke: P.acc, a: q });
    });
    K.text('three separate arguments', 380, 494, { size: 16, color: P.muted, a: K.p(t, 13.4) });
    var rp = K.p(t, 14.2);
    K.box(660, 410, 580, 120, { stroke: P.purple, a: rp });
    K.text('const sum = (...nums) => …;', 684, 440, { size: 19, mono: true, a: rp });
    K.text('sum(1, 2, 3)  →  nums = [1, 2, 3]', 684, 494, { size: 19, mono: true, color: P.purple, a: K.p(t, 15) });
    K.chip('spread: expands', 330, 564, { size: 18, stroke: P.acc, s: K.back((t - 17.8) / 0.5), a: K.p(t, 17.8) });
    K.chip('rest: gathers', 950, 564, { size: 18, stroke: P.purple, s: K.back((t - 18.4) / 0.5), a: K.p(t, 18.4) });
  } },

/* 4 ─ shallow spread */
{ d: 22, title: 'Spread copies are shallow',
  caps: [
    [0.3, 'Object spread copies own properties into a new object. Later keys win, so theme becomes light.'],
    [7, 'But it is shallow: nested objects are shared, not copied.'],
    [13, 'Change copy.prefs.size, and base sees it too. For a deep copy, use structuredClone.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const base = { theme: "dark", prefs: { size: 14 } };', 'const copy = { ...base, theme: "light" };', 'copy.prefs.size = 20;', 'base.prefs.size;   // 20, shared!'];
    K.panel(40, 84, 760, 176, 'spread.js');
    K.code(code, 64, 122, { size: 20, n: K.typed(t, code, [0.5, 1.9, 13.2, 14.4], 40), t: t, w: 736, marks: t > 14.8 ? { 3: 'rgba(246,173,85,.18)' } : null });
    K.text('later keys win', 840, 130, { size: 19, color: P.green, a: K.p(t, 4) });
    K.text('{ ...base, theme: "light" }', 840, 170, { size: 18, mono: true, color: P.muted, a: K.p(t, 4.4) });
    var ch0 = K.p(t, 13.3, 0.3), ch = K.p(t, 13.6, 0.5), fl = K.win(t, 13.6, 16, 0.2);
    [['base', 290, '"dark"', 1, P.blue], ['copy', 440, '"light"', 2.6, P.acc]].forEach(function (b, i) {
      var q = K.p(t, b[3]);
      K.box(100, b[1], 340, 130, { stroke: fl > 0.5 ? P.warm : b[4], lw: fl > 0.5 ? 3 : 2, a: q });
      K.text(b[0], 124, b[1] + 26, { size: 21, weight: 700, color: b[4], a: q });
      K.text('theme: ' + b[2], 124, b[1] + 66, { size: 19, mono: true, color: i ? P.green : P.ink, a: q });
      K.text('prefs:', 124, b[1] + 102, { size: 19, mono: true, a: q });
      K.g.save(); K.g.globalAlpha *= q; K.g.fillStyle = P.warm; K.g.beginPath(); K.g.arc(210, b[1] + 102, 7, 0, 7); K.g.fill(); K.g.restore();
    });
    var nb = K.p(t, 1.2);
    K.box(720, 380, 300, 110, { stroke: fl > 0.5 ? P.warm : P.purple, lw: fl > 0.5 ? 3.5 : 2, a: nb });
    K.text('nested object', 744, 406, { size: 16, color: P.muted, a: nb });
    K.text('{ size: 14 }', 744, 450, { size: 22, mono: true, a: nb * (1 - ch0) });
    K.text('{ size: 20 }', 744, 450, { size: 22, mono: true, color: P.warm, a: ch });
    K.curve(218, 392, 470, 380, 714, 420, { p: K.p(t, 1.4, 0.6), color: P.warm, lw: 2.5 });
    K.curve(218, 542, 470, 540, 714, 460, { p: K.p(t, 7.4, 0.7), color: P.warm, lw: 2.5 });
    K.text('one shared object', 870, 520, { size: 18, color: P.warm, align: 'center', a: K.p(t, 8.2) });
    K.chip('deep copy: structuredClone(base)', 1000, 320, { mono: true, size: 17, stroke: P.green, a: K.p(t, 16.4) });
  } },

/* 5 ─ symbols */
{ d: 20, title: 'Symbols',
  caps: [
    [0.3, 'Every Symbol is unique, even with the same description. Symbol.for shares one through a global registry.'],
    [7, 'Symbol keys never collide with other keys, and Object.keys and JSON skip them.'],
    [13, 'Well-known symbols like Symbol.iterator and Symbol.toPrimitive hook into the language itself.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const id1 = Symbol("id"), id2 = Symbol("id");', 'id1 === id2;                          // false', 'Symbol.for("x") === Symbol.for("x");  // true',
      'const o = { [id1]: 7, name: "Ana" };', 'Object.keys(o);    // ["name"]', 'JSON.stringify(o); // {"name":"Ana"}'];
    K.panel(40, 84, 700, 250, 'symbols.js');
    K.code(code, 62, 122, { size: 19, n: K.typed(t, code, [0.5, 1.8, 3.6, 7.2, 8.6, 9.6], 40), t: t });
    var a = K.p(t, 1);
    K.chip('Symbol("id")', 880, 140, { mono: true, size: 19, stroke: P.purple, a: a });
    K.chip('Symbol("id")', 1140, 140, { mono: true, size: 19, stroke: P.purple, a: K.p(t, 1.3) });
    K.text('≠', 1010, 140, { size: 34, weight: 700, color: P.red, align: 'center', a: K.p(t, 2.2) });
    var r = K.p(t, 3.8);
    K.box(780, 196, 460, 84, { stroke: P.green, a: r });
    K.text('global registry', 800, 222, { size: 17, color: P.muted, weight: 700, a: r });
    K.text('Symbol.for("x") → the same symbol', 800, 256, { size: 18, mono: true, color: P.green, a: K.p(t, 4.4) });
    var o = K.p(t, 7.4);
    K.box(780, 300, 460, 120, { stroke: P.acc, a: o });
    K.text('o', 800, 326, { size: 21, weight: 700, a: o });
    K.box(796, 344, 200, 40, { fill: false, stroke: P.purple, dash: [5, 4], r: 8, a: o });
    K.text('[id1]: 7', 812, 364, { size: 19, mono: true, color: P.purple, a: o });
    K.text('name: "Ana"', 1020, 364, { size: 19, mono: true, a: o });
    K.text('hidden from keys and JSON', 812, 404, { size: 16, color: P.muted, a: K.p(t, 9) });
    var w = K.p(t, 13.2);
    K.box(40, 440, 1200, 144, { fill: P.code, stroke: P.line, a: w });
    K.text('Well-known symbols', 64, 466, { size: 18, weight: 700, color: P.muted, a: w });
    [['Symbol.iterator → for...of', 240, 510], ['Symbol.asyncIterator → for await', 640, 510], ['Symbol.toPrimitive → +obj', 1040, 510],
     ['Symbol.hasInstance → instanceof', 420, 556], ['Symbol.toStringTag → [object X]', 860, 556]].forEach(function (c, i) {
      K.chip(c[0], c[1], c[2], { mono: true, size: 16, stroke: P.purple, s: K.back((t - 13.6 - i * 0.4) / 0.5), a: K.p(t, 13.6 + i * 0.4) });
    });
  } },

/* 6 ─ Proxy and Reflect */
{ d: 26, title: 'Proxy and Reflect',
  caps: [
    [0.3, 'A Proxy stands in front of a target object. Every operation goes through a trap in its handler.'],
    [7, 'Setting age to 30 hits the set trap, passes the check, and Reflect.set does the normal write.'],
    [13.5, 'Setting age to -5 is rejected with a RangeError. The target never changes.'],
    [19, 'Reflect mirrors every trap with the default behaviour. Vue 3 reactivity is built on exactly this idea.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const user = new Proxy({}, {', '  set(target, key, value, receiver) {', '    if (key === "age" && value < 0)', '      throw new RangeError("bad age");',
      '    return Reflect.set(target, key, value, receiver);', '  }', '});', 'user.age = 30;   // ok', 'user.age = -5;   // RangeError'];
    K.panel(40, 84, 640, 330, 'proxy.js');
    K.code(code, 62, 122, { size: 19, lh: 1.55, n: K.typed(t, code, [0.5, 1.0, 1.7, 2.3, 3.0, 4.0, 4.1, 7.2, 13.6], 55), t: t, w: 616,
      hi: t > 13.6 && t < 19 ? 8 : t > 7.2 && t < 13.5 ? 7 : -1, marks: t > 14.6 && t < 19 ? { 3: 'rgba(252,129,129,.18)' } : t > 8.6 && t < 13.5 ? { 4: 'rgba(104,211,145,.16)' } : null });
    var c = K.p(t, 0.8);
    K.text('your code', 1060, 130, { size: 18, color: P.muted, a: c });
    var h = K.p(t, 1.4), rej = K.win(t, 14.6, 19, 0.2);
    K.box(740, 170, 480, 110, { stroke: rej > 0.5 ? P.red : P.warm, lw: 2.5, a: h });
    K.text('Proxy handler', 764, 198, { size: 20, weight: 700, color: P.warm, a: h });
    K.text('set trap: is age ≥ 0?', 764, 244, { size: 19, mono: true, a: h });
    var tg = K.p(t, 2);
    K.box(740, 330, 480, 90, { stroke: P.acc, a: tg });
    K.text('target', 764, 356, { size: 18, color: P.muted, weight: 700, a: tg });
    var w0 = K.p(t, 9.3, 0.3), w30 = K.p(t, 9.6, 0.4);
    K.text('{ }', 764, 394, { size: 22, mono: true, a: tg * (1 - w0) });
    K.text('{ age: 30 }', 764, 394, { size: 22, mono: true, color: P.green, a: w30 });
    K.text('unchanged', 1200, 394, { size: 17, color: P.green, align: 'right', a: K.p(t, 15.6) });
    K.arrow(980, 284, 980, 326, { p: K.p(t, 2.2, 0.4), color: P.muted, lw: 2.5, head: 10 });
    K.text('Reflect.set', 1050, 306, { size: 16, mono: true, color: P.green, a: K.win(t, 8.8, 13.5) });
    var m1 = K.p(t, 7.4, 0.8), m2 = K.p(t, 8.8, 0.6);
    if (t > 7.4 && t < 9.8) K.chip('age = 30', 980, 130 + m1 * 95 + m2 * 150, { mono: true, size: 18, stroke: P.green, color: P.green });
    K.mark(1190, 244, true, 0.75, K.win(t, 8.4, 12));
    var n1 = K.p(t, 13.8, 0.8), back = K.p(t, 14.8, 0.6);
    if (t > 13.8) K.chip(back > 0.1 ? 'RangeError' : 'age = -5', 980, 130 + n1 * 95 - back * 95, { mono: true, size: 18, stroke: P.red, color: P.red, a: 1 - K.p(t, 18.4, 0.5) });
    K.mark(1190, 244, false, 0.75, rej);
    var f = K.p(t, 19.2);
    K.box(40, 434, 640, 150, { fill: P.code, stroke: P.line, a: f });
    K.text('Reflect.get · set · has · deleteProperty …', 64, 476, { size: 19, mono: true, a: f });
    K.text('same names as the traps, default behaviour', 64, 516, { size: 18, color: P.muted, a: K.p(t, 19.8) });
    K.text('forward receiver so getters still work', 64, 552, { size: 18, color: P.muted, a: K.p(t, 20.4) });
    var v = K.p(t, 21);
    K.box(740, 440, 500, 144, { stroke: P.green, a: v });
    K.text('Vue 3 reactivity', 764, 470, { size: 19, weight: 700, color: P.green, a: v });
    K.text('get trap → track who reads', 764, 510, { size: 18, mono: true, a: v });
    K.text('set trap → re-run what depends', 764, 548, { size: 18, mono: true, a: K.p(t, 21.6) });
  } },

/* 7 ─ freeze */
{ d: 22, title: 'Object.freeze is shallow',
  caps: [
    [0.3, 'Object.freeze stops adding, removing and changing properties.'],
    [6, 'Writing o.n fails: silently in sloppy mode, with a TypeError in strict code like modules and classes.'],
    [12, 'But freeze is shallow: inner is a separate object and can still change. const protects the binding, freeze the object.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const o = Object.freeze({ n: 1, inner: { m: 1 } });', 'o.n = 2;         // ignored, or TypeError in strict', 'o.inner.m = 2;   // works: inner is not frozen', 'console.log(o.n, o.inner.m);   // 1 2'];
    K.panel(40, 84, 760, 176, 'freeze.js');
    K.code(code, 64, 122, { size: 20, n: K.typed(t, code, [0.5, 6.2, 12.2, 15], 40), t: t, w: 736, hi: t > 15 ? 3 : t > 12.2 ? 2 : t > 6.2 ? 1 : -1 });
    K.chip('const → the binding', 1040, 130, { size: 19, stroke: P.acc, a: K.p(t, 17.4) });
    K.chip('freeze → the object', 1040, 200, { size: 19, stroke: P.blue, a: K.p(t, 18) });
    var c = K.p(t, 1);
    K.box(80, 290, 520, 290, { fill: 'rgba(99,179,237,.06)', stroke: P.blue, dash: [8, 6], a: c });
    K.text('frozen', 104, 316, { size: 18, weight: 700, color: P.blue, a: c });
    K.lock(570, 318, 0.9, P.blue, c);
    K.text('o', 124, 360, { size: 22, weight: 700, a: c });
    K.text('n: 1', 124, 404, { size: 22, mono: true, a: c });
    K.text('inner:', 124, 448, { size: 22, mono: true, a: c });
    K.g.save(); K.g.globalAlpha *= c; K.g.fillStyle = P.warm; K.g.beginPath(); K.g.arc(222, 448, 7, 0, 7); K.g.fill(); K.g.restore();
    var at = K.p(t, 6.4, 0.6), bk = K.p(t, 7.2, 0.5);
    if (t > 6.4) K.chip('o.n = 2', 440 - at * 120 + bk * 120, 404, { mono: true, size: 18, stroke: P.red, color: P.red, a: 1 - K.p(t, 11.6, 0.4) });
    K.mark(560, 404, false, 0.8, K.win(t, 7.4, 12));
    K.text('sloppy: ignored · strict: TypeError', 104, 540, { size: 18, color: P.red, a: K.p(t, 8) });
    var ib = K.p(t, 1.6), ch0 = K.p(t, 12.5, 0.3), ch = K.p(t, 12.8, 0.5);
    K.box(760, 400, 300, 110, { stroke: P.warm, lw: K.win(t, 12.6, 15) > 0.5 ? 3.5 : 2, a: ib });
    K.text('inner (not frozen)', 784, 426, { size: 16, color: P.muted, a: ib });
    K.text('{ m: 1 }', 784, 468, { size: 22, mono: true, a: ib * (1 - ch0) });
    K.text('{ m: 2 }', 784, 468, { size: 22, mono: true, color: P.warm, a: ch });
    K.arrow(230, 448, 754, 452, { p: K.p(t, 1.8, 0.6), color: P.warm, lw: 2.5 });
    K.mark(1090, 400, true, 0.8, K.p(t, 13));
    K.text('o.inner.m = 2 works', 910, 540, { size: 18, color: P.warm, align: 'center', a: K.p(t, 13.2) });
  } },

/* 8 ─ structuredClone and immutable updates */
{ d: 24, title: 'structuredClone',
  caps: [
    [0.3, 'structuredClone makes a deep copy: nested objects, Dates, Maps, Sets, even cycles.'],
    [6.5, 'It cannot clone functions or DOM nodes, and class instances come back as plain objects.'],
    [12.5, 'For state updates, build new values instead: spread, map, toSorted, with and toSpliced never mutate.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const copy = structuredClone(src);   // deep: nested objects, Date, Map, Set, cycles', 'structuredClone({ f() {} });         // DataCloneError'];
    K.panel(40, 84, 1200, 110, 'clone.js');
    K.code(code, 64, 116, { size: 20, n: K.typed(t, code, [0.6, 6.8], 45), t: t });
    var tree = 1 - K.p(t, 12.3, 0.5);
    function draw(ox, root, start, col) {
      var r = K.back((t - start) / 0.5); if (r <= 0) return;
      K.chip(root, ox + 240, 250, { mono: true, size: 20, stroke: col, s: r, a: tree });
      ['Date', 'Map', 'Set', 'self ↺'].forEach(function (s, i) {
        var x = ox + 60 + i * 120, q = K.p(t, start + 0.4 + i * 0.3) * tree;
        K.arrow(ox + 240, 270, x, 334, { p: K.p(t, start + 0.3 + i * 0.3, 0.3), color: P.muted, lw: 2, head: 8, a: tree });
        K.chip(s, x, 354, { mono: true, size: 18, stroke: col, a: q });
      });
      K.curve(ox + 400, 374, ox + 470, 300, ox + 290, 256, { p: K.p(t, start + 1.8, 0.5), color: col, dash: [5, 5], lw: 2, head: 9, a: tree });
    }
    draw(40, 'src', 1, P.blue);
    draw(680, 'copy', 2.4, P.green);
    K.curve(330, 230, 640, 190, 870, 236, { p: K.p(t, 2, 0.6), color: P.green, lw: 2.5, a: tree });
    K.text('all new objects, same shape', 940, 420, { size: 18, color: P.green, align: 'center', a: K.p(t, 4.4) * tree });
    var L = [['functions → DataCloneError', 220, P.red, 7], ['DOM nodes → DataCloneError', 560, P.red, 7.6], ['class instance → plain object', 920, P.warm, 8.6]];
    L.forEach(function (l, i) { K.chip(l[0], l[1], 520, { size: 18, stroke: l[2], color: l[2], s: K.back((t - l[3]) / 0.5), a: K.p(t, l[3]) }); });
    K.text('no methods, no prototype, no #private fields', 920, 566, { size: 16, color: P.muted, align: 'center', a: K.p(t, 9.4) });
    var u = K.p(t, 12.8);
    var c2 = ['const next = { ...state, count: state.count + 1 };', 'const sorted = items.toSorted();       // items unchanged', 'const fixed  = items.with(0, "first"); // new array', 'const fewer  = items.toSpliced(1, 1);  // new array'];
    K.panel(40, 220, 1200, 250, 'immutable updates', { a: u, stroke: P.green });
    K.code(c2, 64, 262, { size: 21, lh: 1.6, n: K.typed(t, c2, [13, 14.6, 15.8, 17], 45), t: t, a: u });
  } },

/* 9 ─ using */
{ d: 22, title: 'using: automatic cleanup',
  caps: [
    [0.3, 'using declares a resource that is cleaned up automatically when its block ends.'],
    [7, 'At the closing brace, Symbol.dispose runs in reverse order: close B, then close A, even if an error was thrown.'],
    [14, 'It ships in Chromium and Node 24. Other engines are still rolling it out, so check support before relying on it.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function open(name) {', '  console.log("open", name);', '  return { [Symbol.dispose]() { console.log("close", name); } };', '}', '{', '  using a = open("A");', '  using b = open("B");', '  console.log("working");', '}'];
    K.panel(40, 84, 720, 330, 'using.js');
    K.code(code, 62, 122, { size: 18, n: K.typed(t, code, [0.5, 0.9, 1.5, 2.8, 2.9, 3.0, 3.6, 4.2, 4.9], 50), t: t, w: 696,
      hi: t > 7.4 && t < 10 ? 8 : t > 6.2 && t < 7 ? 7 : t > 5.6 ? 6 : t > 5 ? 5 : -1 });
    var cp = K.p(t, 4.8);
    K.panel(800, 84, 440, 330, 'Console', { a: cp });
    [['open A', 5.2, P.ink], ['open B', 5.8, P.ink], ['working', 6.4, P.ink], ['close B', 7.8, P.warm], ['close A', 8.8, P.warm]].forEach(function (r, i) {
      K.text(r[0], 828, 140 + i * 50, { size: 22, mono: true, color: r[2], a: K.p(t, r[1], 0.3) });
    });
    var sp = K.p(t, 5);
    K.box(40, 434, 720, 150, { fill: P.code, stroke: P.line, a: sp });
    K.text('disposal stack', 64, 460, { size: 17, color: P.muted, weight: 700, a: sp });
    var ga = 1 - K.p(t, 8.8, 0.4), gb = 1 - K.p(t, 7.8, 0.4);
    var qa = K.back((t - 5.2) / 0.5), qb = K.back((t - 5.8) / 0.5);
    if (qa > 0) K.chip('a', 120, 520, { mono: true, size: 22, stroke: P.acc, s: qa, a: ga });
    if (qb > 0) K.chip('b', 200, 520, { mono: true, size: 22, stroke: P.acc, s: qb, a: gb });
    K.text('last in, first out', 290, 506, { size: 19, color: P.warm, a: K.p(t, 9.4) });
    K.text('runs even if the block throws', 290, 542, { size: 19, color: P.green, a: K.p(t, 10.4) });
    var s = K.p(t, 14.2);
    K.box(800, 434, 440, 150, { stroke: P.line, a: s });
    K.mark(830, 468, true, 0.75, s); K.text('Chromium 134+', 856, 468, { size: 18, a: s });
    K.mark(1030, 468, true, 0.75, K.p(t, 14.6)); K.text('Node 24+', 1056, 468, { size: 18, a: K.p(t, 14.6) });
    K.text('Firefox, Safari: rolling out', 830, 510, { size: 18, color: P.warm, a: K.p(t, 15.2) });
    K.text('check: typeof Symbol.dispose', 830, 550, { size: 18, mono: true, color: P.muted, a: K.p(t, 16) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 10 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Destructure by key or position; defaults fill only undefined',
     'Spread expands, rest gathers; object spread is shallow',
     'Symbols: unique keys and hooks like Symbol.iterator',
     'Proxy traps every operation; Reflect does the default',
     'freeze is shallow, structuredClone is deep, using cleans up'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 10 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
