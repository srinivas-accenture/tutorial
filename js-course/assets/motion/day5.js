/* Day 5 in motion: arrays (mutating vs copying, pipelines, surprises), object key order and own keys, shallow vs deep copies, Map/Set, WeakMap, Date quirks and Temporal.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day5', {
  kicker: 'JavaScript: Zero to Architect · Day 5',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, "Day 5: JavaScript's workhorse data structures, including all the surprising parts."]],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('JavaScript', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 5 · Arrays, objects, collections and dates', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Array methods', 'Objects and copies', 'Map · Set · Dates'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ arrays: mutate or copy */
{ d: 27, title: 'Arrays: mutate or copy',
  caps: [
    [0.3, 'An array is a row of numbered slots, starting at index 0, with a length that tracks the end.'],
    [6.5, 'push and pop work at the end; unshift and shift work at the start. All four change the array in place.'],
    [14, 'sort, reverse and splice also mutate. toSorted, toReversed, toSpliced and with return a new copy instead.'],
    [21, 'const does not protect you here: it fixes the binding, not the array.']],
  draw: function (K, t) {
    var P = K.P;
    /* state of the array at time t */
    var ops = [[7.2, 'arr.push(4)', [3, 1, 2, 4], 3], [9, 'arr.pop()', [3, 1, 2], -1], [10.8, 'arr.unshift(0)', [0, 3, 1, 2], 0], [12.6, 'arr.shift()', [3, 1, 2], -1]];
    var arr = [3, 1, 2], fresh = -1, op = '', ot = 0;
    ops.forEach(function (o) { if (t >= o[0]) { arr = o[2]; fresh = o[3]; op = o[1]; ot = o[0]; } });
    var a0 = K.p(t, 0.6);
    K.text('const arr =', 60, 150, { size: 22, mono: true, color: P.muted, a: a0 });
    arr.forEach(function (v, i) {
      var x = 260 + i * 100, s = i === fresh ? K.back((t - ot) / 0.5) : 1;
      if (s <= 0) return;
      K.g.save(); K.g.translate(x + 40, 150); K.g.scale(s, s);
      K.box(-40, -40, 80, 80, { stroke: i === fresh ? P.warm : P.acc, a: a0 });
      K.text(String(v), 0, 0, { size: 30, mono: true, weight: 700, align: 'center', a: a0 });
      K.g.restore();
      K.text(String(i), x + 40, 210, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 1.6) });
    });
    K.text('index', 220, 210, { size: 16, color: P.muted, align: 'right', a: K.p(t, 1.6) });
    K.text('length: ' + arr.length, 760, 150, { size: 22, mono: true, color: P.blue, a: K.p(t, 2.4) });
    if (op) K.chip(op, 1070, 150, { mono: true, size: 21, stroke: P.warm, a: K.win(t, ot, ot + 1.7, 0.2) });
    var mu = K.p(t, 14.2), co = K.p(t, 16.4);
    K.box(40, 250, 580, 170, { fill: 'rgba(246,173,85,.06)', stroke: P.warm, a: mu });
    K.text('mutates in place', 64, 280, { size: 20, weight: 700, color: P.warm, a: mu });
    ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'].forEach(function (s, i) {
      K.chip(s, 110 + (i % 4) * 135, 330 + Math.floor(i / 4) * 54, { mono: true, size: 19, stroke: P.warm, a: K.p(t, 14.4 + i * 0.25, 0.3) });
    });
    K.box(660, 250, 580, 170, { fill: 'rgba(104,211,145,.06)', stroke: P.green, a: co });
    K.text('returns a new array', 684, 280, { size: 20, weight: 700, color: P.green, a: co });
    ['toSorted', 'toReversed', 'toSpliced', 'with', 'map', 'filter', 'slice'].forEach(function (s, i) {
      K.chip(s, 745 + (i % 4) * 135, 330 + Math.floor(i / 4) * 54, { mono: true, size: 19, stroke: P.green, a: K.p(t, 16.6 + i * 0.25, 0.3) });
    });
    var c = ['const a = [3, 1, 2];', 'const b = a.toSorted();   // b: [1, 2, 3], a unchanged', 'a.sort();                 // allowed: a is now [1, 2, 3]'];
    K.panel(40, 440, 1200, 140, '', { a: K.p(t, 18.6) });
    K.code(c, 64, 456, { size: 20, lh: 1.55, n: K.typed(t, c, [18.8, 19.6, 21.4], 34), t: t, a: K.p(t, 18.6), hi: t > 21.6 ? 2 : -1, w: 1170 });
    K.lock(1150, 520, 0.9, P.warm, K.p(t, 23));
    K.text('const locks the name only', 1130, 555, { size: 16, color: P.warm, align: 'right', a: K.p(t, 23.4) });
  } },

/* 3 ─ pipeline */
{ d: 27, title: 'filter, map, reduce',
  caps: [
    [0.3, 'map, filter and reduce never change the source. Chain them like a pipeline: select, transform, combine.'],
    [6, 'filter keeps the items that pass a test. Here 1 fails n > 1, so it drops out.'],
    [11, 'map transforms every item into a new one: times ten.'],
    [15, 'reduce folds the items into a single value, carrying a running total along.'],
    [20.5, 'Always give reduce a starting value: on an empty array, without one, it throws a TypeError.']],
  draw: function (K, t) {
    var P = K.P;
    var R = [['[3, 1, 2]', 'source', 0.8], ['.filter(n => n > 1)', 'select', 6.3], ['.map(n => n * 10)', 'transform', 11.3], ['.reduce((a, b) => a + b, 0)', 'combine', 15.3]];
    R.forEach(function (r, i) {
      var y = 120 + i * 92, q = K.p(t, r[2], 0.4);
      K.text(r[0], 60, y, { size: 23, mono: true, a: q });
      K.text(r[1], 520, y, { size: 17, color: P.muted, a: q });
      if (i) K.arrow(90, y - 66, 90, y - 26, { p: K.p(t, r[2] - 0.2, 0.3), color: P.muted, lw: 2 });
      K.arrow(620, y, 680, y, { p: K.p(t, r[2] + 0.4, 0.3), color: P.muted, lw: 2.5 });
    });
    function items(vals, y, t0, cols) {
      vals.forEach(function (v, i) {
        var q = K.back((t - t0 - i * 0.25) / 0.45); if (q <= 0) return;
        K.chip(String(v), 740 + i * 100, y, { s: q, mono: true, size: 24, stroke: cols ? cols[i] : P.acc });
      });
    }
    items([3, 1, 2], 120, 1.4);
    items([3, 2], 212, 7.2, [P.green, P.green]);
    var drop = K.p(t, 8.2, 0.8);
    if (t > 7.2) K.chip('1', 1000, 212 + drop * 30, { mono: true, size: 24, stroke: P.red, color: P.red, a: (1 - drop) * K.p(t, 7.2) + 0.25 * drop * K.win(t, 7.2, 10.6) });
    K.text('1 > 1 is false', 1060, 212, { size: 16, color: P.red, a: K.win(t, 8, 10.8) });
    items([30, 20], 304, 12, [P.warm, P.warm]);
    /* running total */
    var steps = ['0', '0 + 30 = 30', '30 + 20 = 50'], k = t < 16.6 ? -1 : t < 17.8 ? 0 : t < 19 ? 1 : 2;
    if (k >= 0) K.text('acc: ' + steps[k], 1240, 350, { size: 17, mono: true, color: P.muted, align: 'right', a: K.p(t, 16.6) });
    var f = K.back((t - 19.2) / 0.5); if (f > 0) K.chip('50', 760, 396, { s: f, mono: true, size: 28, stroke: P.green, color: P.green });
    var c = K.p(t, 20.7);
    K.panel(40, 460, 1200, 120, '', { a: c });
    K.code(['[].reduce((a, b) => a + b);      // TypeError', '[].reduce((a, b) => a + b, 0);   // 0'], 110, 478, { size: 21, lh: 1.6, n: K.typed(t, ['[].reduce((a, b) => a + b);      // TypeError', '[].reduce((a, b) => a + b, 0);   // 0'], [21, 23], 34), t: t, a: c });
    K.mark(78, 492, false, 0.8, K.p(t, 22.4)); K.mark(78, 526, true, 0.8, K.p(t, 24.3));
  } },

/* 4 ─ array surprises */
{ d: 27, title: 'Array surprises',
  caps: [
    [0.3, 'Default sort turns items into strings, so [10, 9, 1].sort() gives [1, 10, 9]. Pass a comparator for numbers.'],
    [9, 'map passes the value, the index and the array. parseInt takes the index as its radix, so you get [10, NaN, 2].'],
    [18, 'Array(3) makes empty holes, and map skips holes. Build arrays with Array.from({ length: 3 }, fn) instead.']],
  draw: function (K, t) {
    var P = K.P;
    var a = K.p(t, 0.5);
    K.box(40, 85, 1200, 150, { fill: P.code, stroke: P.line, a: a });
    K.text('[10, 9, 1].sort()', 64, 125, { size: 23, mono: true, a: a });
    K.text('→ [1, 10, 9]', 450, 125, { size: 23, mono: true, color: P.red, a: K.p(t, 2) });
    K.text('compares "10" < "9" as text', 760, 125, { size: 18, color: P.muted, a: K.p(t, 3.4) });
    K.text('[10, 9, 1].sort((a, b) => a - b)', 64, 190, { size: 23, mono: true, a: K.p(t, 5.6) });
    K.text('→ [1, 9, 10]', 560, 190, { size: 23, mono: true, color: P.green, a: K.p(t, 7) });
    K.mark(1200, 125, false, 0.8, K.p(t, 2.2)); K.mark(1200, 190, true, 0.8, K.p(t, 7.2));
    var b = K.p(t, 9.2);
    K.box(40, 255, 1200, 150, { fill: P.code, stroke: P.line, a: b });
    K.text('["10", "10", "10"].map(parseInt)', 64, 290, { size: 23, mono: true, a: b });
    K.text('→ [10, NaN, 2]', 560, 290, { size: 23, mono: true, color: P.red, a: K.p(t, 10.4) });
    ['parseInt("10", 0) → 10', 'parseInt("10", 1) → NaN', 'parseInt("10", 2) → 2'].forEach(function (s, i) {
      K.text(s, 64 + i * 390, 362, { size: 19, mono: true, color: i === 1 ? P.red : P.muted, a: K.p(t, 12 + i * 1.2, 0.4) });
    });
    K.text('index = radix', 1215, 290, { size: 17, color: P.warm, align: 'right', a: K.p(t, 15.4) });
    var c = K.p(t, 18.2);
    K.box(40, 425, 1200, 155, { fill: P.code, stroke: P.line, a: c });
    K.text('Array(3).map(() => 1)', 64, 462, { size: 22, mono: true, a: c });
    for (var i = 0; i < 3; i++) K.box(450 + i * 70, 440, 56, 44, { fill: false, stroke: P.warm, dash: [6, 5], r: 8, a: K.p(t, 19 + i * 0.2) });
    K.text('3 holes, map skips them', 680, 462, { size: 18, color: P.warm, a: K.p(t, 20) });
    K.text('Array.from({ length: 3 }, (_, i) => i * i)', 64, 535, { size: 22, mono: true, a: K.p(t, 21.6) });
    K.text('→ [0, 1, 4]', 680, 535, { size: 22, mono: true, color: P.green, a: K.p(t, 23.4) });
    K.mark(1200, 462, false, 0.8, K.p(t, 20.4)); K.mark(1200, 535, true, 0.8, K.p(t, 23.6));
  } },

/* 5 ─ objects: keys and order */
{ d: 26, title: 'Objects: keys and order',
  caps: [
    [0.3, 'Object keys are strings or symbols. A number used as a key becomes a string.'],
    [6, 'Key order: integer-like keys first, ascending, then string keys in insertion order, then symbols.'],
    [13.5, 'Check own keys with Object.hasOwn. The in operator also finds inherited keys, like toString.'],
    [20, 'For keys that come from users, prefer a Map: a key like __proto__ on a plain object is risky.']],
  draw: function (K, t) {
    var P = K.P;
    var c = ['const o = { b: 1, 2: "two", a: 2, 1: "one" };', 'o[1] === o["1"]   // true: the key is "1"'];
    K.panel(40, 85, 1200, 120, 'keys.js');
    K.code(c, 64, 130, { size: 21, lh: 1.6, n: K.typed(t, c, [0.5, 3], 40), t: t });
    K.text('written', 60, 260, { size: 18, color: P.muted, weight: 700, a: K.p(t, 6.2) });
    K.text('Object.keys(o)', 60, 345, { size: 18, color: P.acc, mono: true, weight: 700, a: K.p(t, 8) });
    var keys = [['"b"', 2], ['"2"', 1], ['"a"', 3], ['"1"', 0]];
    keys.forEach(function (k, i) {
      var x0 = 340 + i * 140, x1 = 340 + k[1] * 140, m = K.p(t, 8.4 + (k[1] < 2 ? 0 : 0.6), 1);
      K.chip(k[0], x0, 260, { mono: true, size: 22, stroke: P.line, a: K.p(t, 6.4 + i * 0.3, 0.3) });
      if (t > 8.2) K.chip(k[0], x0 + (x1 - x0) * m, 260 + 85 * m, { mono: true, size: 22, stroke: k[1] < 2 ? P.warm : P.acc, a: K.clamp((m - 0.45) * 3) });
    });
    K.text('integers ↑', 410, 395, { size: 16, color: P.warm, align: 'center', a: K.p(t, 10.4) });
    K.text('insertion order', 690, 395, { size: 16, color: P.acc, align: 'center', a: K.p(t, 10.8) });
    K.text('then symbols', 900, 345, { size: 16, color: P.muted, a: K.p(t, 11.4) });
    var h = K.p(t, 13.7);
    K.panel(40, 425, 760, 155, '', { a: h });
    var hc = ['Object.hasOwn(o, "toString")   // false', '"toString" in o                // true: inherited'];
    K.code(hc, 110, 448, { size: 20, lh: 1.7, n: K.typed(t, hc, [14, 16.4], 34), t: t, a: h });
    K.mark(78, 462, true, 0.75, K.p(t, 15.6)); K.mark(78, 496, false, 0.75, K.p(t, 18));
    K.text('in walks the prototype chain', 110, 555, { size: 16, color: P.muted, a: K.p(t, 18.4) });
    var m2 = K.p(t, 20.2);
    K.box(830, 425, 410, 155, { fill: P.code, stroke: P.green, a: m2 });
    K.text('user-supplied keys?', 854, 455, { size: 18, weight: 700, color: P.green, a: m2 });
    K.text('new Map()', 854, 500, { size: 22, mono: true, color: P.green, a: K.p(t, 20.8) });
    K.text('or Object.create(null)', 854, 545, { size: 18, mono: true, color: P.muted, a: K.p(t, 21.6) });
  } },

/* 6 ─ shallow vs deep */
{ d: 27, title: 'Shallow vs deep copies',
  caps: [
    [0.3, "Spread copies an object's top-level properties into a brand-new object."],
    [6, 'But a nested object or array is copied as a reference. Both copies point at the same tags array.'],
    [12.5, 'So pushing into shallow.tags changes the original too.'],
    [18, 'structuredClone makes a deep, independent copy. A JSON round trip loses undefined, functions, Dates and Maps.']],
  draw: function (K, t) {
    var P = K.P;
    function obj(y, a, tagCol) {
      K.box(220, y - 45, 320, 90, { stroke: P.line, a: a });
      K.text('name: "Ana"', 244, y - 15, { size: 20, mono: true, a: a });
      K.text('tags:', 244, y + 20, { size: 20, mono: true, a: a });
      K.g.save(); K.g.globalAlpha *= K.clamp(a); K.g.fillStyle = tagCol; K.g.beginPath(); K.g.arc(330, y + 20, 7, 0, 7); K.g.fill(); K.g.restore();
    }
    var o1 = K.p(t, 0.5), o2 = K.p(t, 2.2), o3 = K.p(t, 18.2);
    K.chip('orig', 100, 140, { mono: true, size: 22, stroke: P.acc, a: o1 }); K.arrow(140, 140, 214, 140, { p: o1, color: P.acc, lw: 2.5 });
    obj(140, o1, P.acc);
    K.chip('shallow', 100, 310, { mono: true, size: 22, stroke: P.warm, a: o2 }); K.arrow(158, 310, 214, 310, { p: o2, color: P.warm, lw: 2.5 });
    K.text('{ ...orig }', 40, 360, { size: 17, mono: true, color: P.muted, a: o2 });
    obj(310, o2, P.warm);
    K.text('new object', 560, 310, { size: 16, color: P.muted, a: K.win(t, 2.6, 6) });
    var push = K.p(t, 12.8, 0.5);
    K.box(680, 185, 280, 80, { stroke: push > 0.5 ? P.red : P.acc, a: K.p(t, 1) });
    K.text('["a"]', 820, 225, { size: 24, mono: true, align: 'center', a: K.p(t, 1) * (1 - push) });
    K.text('["a", "b"]', 820, 225, { size: 24, mono: true, color: P.red, align: 'center', a: push });
    K.arrow(337, 160, 674, 215, { p: K.p(t, 1.4, 0.5), color: P.acc, lw: 2.5 });
    K.arrow(337, 330, 674, 245, { p: K.p(t, 6.6, 0.7), color: P.warm, lw: 2.5 });
    K.text('same array!', 690, 290, { size: 17, color: P.warm, a: K.p(t, 7.4) });
    K.text('shallow.tags.push("b")', 990, 205, { size: 18, mono: true, a: K.p(t, 12.6) });
    K.text('orig.tags is ["a", "b"] too', 990, 245, { size: 17, color: P.red, a: K.p(t, 13.8) });
    K.chip('deep', 100, 480, { mono: true, size: 22, stroke: P.green, a: o3 }); K.arrow(138, 480, 214, 480, { p: o3, color: P.green, lw: 2.5 });
    K.text('structuredClone(orig)', 40, 530, { size: 16, mono: true, color: P.muted, a: o3 });
    obj(480, o3, P.green);
    K.box(680, 455, 280, 80, { stroke: P.green, a: K.p(t, 19) });
    K.text('["a"]', 820, 495, { size: 24, mono: true, align: 'center', a: K.p(t, 19) });
    K.arrow(337, 500, 674, 495, { p: K.p(t, 19.4, 0.5), color: P.green, lw: 2.5 });
    K.mark(1000, 495, true, 0.85, K.p(t, 20)); K.text('its own copy', 1026, 495, { size: 18, color: P.green, a: K.p(t, 20) });
    K.text('JSON.parse(JSON.stringify(x)) drops undefined, functions, Dates, Maps', 640, 580, { size: 16, color: P.muted, align: 'center', a: K.p(t, 22.6) });
  } },

/* 7 ─ Map and Set */
{ d: 27, title: 'Map and Set',
  caps: [
    [0.3, 'A Map holds key-value pairs where the key can be anything: an object, a function, even NaN.'],
    [7, 'It keeps insertion order and has a size. Object keys match by identity, so an equal-looking object is a different key.'],
    [14.5, 'A Set keeps unique values. [...new Set(list)] removes duplicates in one line.'],
    [20, 'Sets now have union, intersection and difference built in, in current browsers and Node 22.']],
  draw: function (K, t) {
    var P = K.P, m = K.p(t, 0.4);
    K.box(40, 85, 590, 495, { fill: P.code, stroke: P.acc, a: m });
    K.text('Map', 64, 115, { size: 22, weight: 700, color: P.acc, a: m });
    var E = [['{ id: 1 }', '"Ana"', P.warm], ['NaN', '"nan"', P.red], ['() => {}', '"fn"', P.purple], ['"name"', '"str"', P.green]];
    E.forEach(function (e, i) {
      var y = 165 + i * 58, q = K.p(t, 1.2 + i * 0.8, 0.4);
      K.chip(e[0], 170, y, { mono: true, size: 19, stroke: e[2], a: q });
      K.arrow(270, y, 330, y, { p: q, color: P.muted, lw: 2 });
      K.text(e[1], 345, y, { size: 20, mono: true, a: q });
      K.text(String(i + 1), 590, y, { size: 15, color: P.muted, align: 'right', a: K.p(t, 7.4) });
    });
    K.text('order ↓', 590, 135, { size: 15, color: P.muted, align: 'right', a: K.p(t, 7.4) });
    var L = [['m.get(NaN)', '"nan"', P.green, 8], ['m.size', '4', P.green, 9.2], ['m.get({ id: 1 })', 'undefined', P.red, 10.6]];
    L.forEach(function (l, i) {
      var y = 420 + i * 46, q = K.p(t, l[3], 0.4);
      K.text(l[0], 64, y, { size: 20, mono: true, a: q });
      K.text('→ ' + l[1], 310, y, { size: 20, mono: true, color: l[2], a: K.p(t, l[3] + 0.5, 0.4) });
    });
    K.text('a new object', 470, 512, { size: 16, color: P.red, a: K.p(t, 11.6) });
    var s = K.p(t, 14.7);
    K.box(650, 85, 590, 495, { fill: P.code, stroke: P.purple, a: s });
    K.text('Set', 674, 115, { size: 22, weight: 700, color: P.purple, a: s });
    [1, 1, 2, 2, 3].forEach(function (v, i) {
      var dup = i === 1 || i === 3, f = dup ? K.p(t, 16.4, 0.6) : 0;
      K.chip(String(v), 720 + i * 62, 170 + f * 20, { mono: true, size: 20, stroke: dup ? P.red : P.line, a: K.p(t, 15 + i * 0.2, 0.3) * (1 - f * 0.8) });
    });
    K.arrow(1030, 170, 1080, 170, { p: K.p(t, 16.8, 0.4), color: P.muted, lw: 2 });
    K.chip('{1, 2, 3}', 1150, 170, { mono: true, size: 20, stroke: P.purple, a: K.p(t, 17.2) });
    K.text('[...new Set(list)]', 674, 235, { size: 19, mono: true, color: P.muted, a: K.p(t, 17.6) });
    /* venn */
    var v = K.p(t, 20.2), g = K.g;
    g.save(); g.globalAlpha *= v; g.lineWidth = 2.5;
    g.strokeStyle = P.acc; g.fillStyle = 'rgba(79,209,197,.08)'; g.beginPath(); g.arc(800, 360, 75, 0, 7); g.fill(); g.stroke();
    g.strokeStyle = P.warm; g.fillStyle = 'rgba(246,173,85,.08)'; g.beginPath(); g.arc(895, 360, 75, 0, 7); g.fill(); g.stroke(); g.restore();
    K.text('a', 735, 272, { size: 18, mono: true, color: P.acc, a: v }); K.text('b', 955, 272, { size: 18, mono: true, color: P.warm, a: v });
    K.text('1  2', 772, 360, { size: 22, mono: true, align: 'center', a: v }); K.text('3', 848, 360, { size: 22, mono: true, align: 'center', a: v }); K.text('4', 920, 360, { size: 22, mono: true, align: 'center', a: v });
    [['union', '{1, 2, 3, 4}'], ['intersection', '{3}'], ['difference', '{1, 2}']].forEach(function (r, i) {
      var y = 470 + i * 36, q = K.p(t, 21.2 + i * 1, 0.4);
      K.text('a.' + r[0] + '(b)', 674, y, { size: 18, mono: true, a: q });
      K.text('→ ' + r[1], 940, y, { size: 18, mono: true, color: P.green, a: q });
    });
  } },

/* 8 ─ WeakMap */
{ d: 22, title: 'WeakMap and WeakSet',
  caps: [
    [0.3, 'WeakMap and WeakSet take object keys, and they do not keep those objects alive.'],
    [6.5, 'Drop the last other reference, and a normal Map still holds the object. A WeakMap lets it be garbage collected.'],
    [14.5, 'So weak collections are not iterable and have no size. Use them to attach private data or caches to objects.']],
  draw: function (K, t) {
    var P = K.P;
    var c = ['let user = { name: "Ana" };', 'map.set(user, "data");  weak.set(user, "data");', 'user = null;'];
    K.panel(40, 85, 1200, 140, '', { a: K.p(t, 0.3) });
    K.code(c, 64, 102, { size: 21, lh: 1.6, n: K.typed(t, c, [0.5, 2, 7], 34), t: t, hi: t > 7 && t < 12 ? 2 : -1, w: 1170 });
    var gone = K.p(t, 10.6, 1.2), nul = K.p(t, 7.6, 0.4);
    [[40, 'Map', P.acc, false], [660, 'WeakMap', P.purple, true]].forEach(function (c2) {
      var x = c2[0], weak = c2[3], q = K.p(t, weak ? 2.6 : 2.2);
      K.box(x, 245, 580, 335, { fill: P.code, stroke: c2[2], a: q });
      K.text(c2[1], x + 24, 275, { size: 21, weight: 700, color: c2[2], a: q });
      var oa = weak ? 1 - gone : 1;
      K.box(x + 320, 360, 200, 80, { stroke: P.warm, a: q * oa });
      K.text('{ name: "Ana" }', x + 420, 400, { size: 18, mono: true, align: 'center', a: q * oa });
      K.chip('user', x + 90, 340, { mono: true, size: 20, stroke: P.acc, a: q * (1 - nul) });
      K.chip('user = null', x + 110, 340, { mono: true, size: 18, stroke: P.red, color: P.red, a: nul * q });
      K.arrow(x + 130, 340, x + 314, 380, { color: P.acc, lw: 2.5, a: q * (1 - nul) });
      K.chip(weak ? 'weak entry' : 'map entry', x + 110, 460, { size: 18, stroke: c2[2], a: q });
      K.arrow(x + 180, 450, x + 314, 415, { color: c2[2], lw: 2.5, dash: weak ? [6, 6] : null, a: q * oa });
    });
    K.text('still alive: the Map holds it', 64, 540, { size: 18, color: P.warm, a: K.p(t, 9.6) });
    K.text('collectable: the entry vanishes', 684, 540, { size: 18, color: P.green, a: K.p(t, 11.4) });
    var w = K.p(t, 14.8);
    K.chip('no size · not iterable', 1090, 290, { size: 16, stroke: P.purple, a: w });
    K.chip('private data per object', 1090, 500, { size: 16, stroke: P.green, a: K.p(t, 17) });
  } },

/* 9 ─ dates */
{ d: 30, title: 'Dates and Temporal',
  caps: [
    [0.3, 'Date has famous quirks. Months are 0-based: new Date(2026, 0, 1) is the first of January.'],
    [6.5, 'Overflow rolls over silently: February 31, 2026 becomes March 3.'],
    [12, 'A date-only string is parsed as UTC, but add a time and it is local. In New York, the first one shows December 31.'],
    [20, 'Temporal fixes this with immutable types like PlainDate, ZonedDateTime and Instant. Safari has not shipped it, so use a polyfill.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('new Date(2026, 0, 1)', 60, 115, { size: 22, mono: true, a: K.p(t, 0.5) });
    K.text('→ Jan 1, 2026', 430, 115, { size: 22, mono: true, color: P.green, a: K.p(t, 2.6) });
    ['0 Jan', '1 Feb', '2 Mar', '…', '11 Dec'].forEach(function (s, i) { K.chip(s, 760 + i * 100, 115, { size: 17, stroke: i === 0 ? P.warm : P.line, a: K.p(t, 3.2 + i * 0.25, 0.3) }); });
    K.text('new Date(2026, 1, 31)', 60, 195, { size: 22, mono: true, a: K.p(t, 6.7) });
    K.text('→ Mar 3, 2026', 430, 195, { size: 22, mono: true, color: P.red, a: K.p(t, 10.4) });
    var D = ['26', '27', '28', '1', '2', '3'];
    D.forEach(function (d, i) {
      var x = 700 + i * 82, mar = i > 2, q = K.p(t, 7.4 + i * 0.25, 0.3), hot = mar && t > 8.4 + (i - 3) * 0.5;
      K.box(x, 172, 70, 48, { fill: hot ? 'rgba(252,129,129,.15)' : P.card, stroke: mar ? (hot ? P.red : P.line) : P.blue, r: 8, a: q });
      K.text(d, x + 35, 196, { size: 20, mono: true, align: 'center', a: q });
    });
    K.text('Feb', 741, 238, { size: 15, color: P.blue, align: 'center', a: K.p(t, 7.4) }); K.text('Mar', 987, 238, { size: 15, color: P.red, align: 'center', a: K.p(t, 8.4) });
    K.text('31 = 28 + 3', 1210, 238, { size: 15, color: P.muted, align: 'right', a: K.p(t, 9.6) });
    var u = K.p(t, 12.2);
    K.box(40, 265, 1200, 150, { fill: P.code, stroke: P.line, a: u });
    K.text('new Date("2026-01-01")', 64, 305, { size: 21, mono: true, a: u });
    K.chip('UTC midnight', 520, 305, { size: 18, stroke: P.blue, a: K.p(t, 13.4) });
    K.text('New York: Dec 31, 7 pm', 820, 305, { size: 19, color: P.red, a: K.p(t, 16.4) });
    K.text('new Date("2026-01-01T00:00")', 64, 370, { size: 21, mono: true, a: K.p(t, 14.4) });
    K.chip('local midnight', 520, 370, { size: 18, stroke: P.green, a: K.p(t, 15.4) });
    K.text('Jan 1, 0:00 local time', 820, 370, { size: 19, color: P.green, a: K.p(t, 17.4) });
    var tq = K.p(t, 20.2);
    K.panel(40, 435, 1200, 145, 'Temporal', { a: tq });
    var tc = ['Temporal.PlainDate.from("2026-01-31").add({ months: 1 })   // 2026-02-28'];
    K.code(tc, 64, 482, { size: 20, n: K.typed(t, tc, [20.6], 36), t: t, a: tq });
    ['PlainDate', 'ZonedDateTime', 'Instant', 'Duration'].forEach(function (s, i) { K.chip(s, 130 + i * 190, 545, { mono: true, size: 17, stroke: P.acc, a: K.p(t, 23.4 + i * 0.4, 0.3) }); });
    K.chip('Safari: use a polyfill', 1080, 545, { size: 17, stroke: P.warm, a: K.p(t, 25.6) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 5 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 105, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Know which array methods mutate; toSorted and friends copy',
     'filter, map and reduce; always give reduce a start value',
     'Sort numbers with a comparator; Array.from for new arrays',
     'Integer keys first; use Object.hasOwn, not in',
     'Spread is shallow; structuredClone is deep',
     'Map, Set, WeakMap; months 0-based; Temporal for new code'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(230, y, true, 0.9, q);
      K.text(s, 262 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 5 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
