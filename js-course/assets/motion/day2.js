/* Day 2 in motion: one number type and floating point, BigInt/NaN/-0, truthy and falsy, + and coercion, == vs ===, ||/??/?., switch and loops.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day2', {
  kicker: 'JavaScript: Zero to Architect · Day 2',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 2: how numbers really work, how JavaScript converts types, and how to steer your program.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('JavaScript', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 2 · Numbers, coercion and control flow', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Floating point', 'Coercion and ==', 'Branches and loops'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ one number type */
{ d: 25, title: 'One number type',
  caps: [
    [0.3, 'JavaScript has one number type for integers and decimals alike: a 64-bit floating point double (IEEE 754).'],
    [6.5, 'Its 64 bits hold a sign, an exponent that scales the value, and 52 bits of significant digits.'],
    [12.5, 'Integers are exact up to Number.MAX_SAFE_INTEGER, which is 2⁵³ − 1. Past that, neighbouring integers collide.'],
    [19.5, 'There are special values too: NaN, Infinity, -Infinity, and a negative zero.']],
  draw: function (K, t) {
    var P = K.P;
    ['42', '3.14', '-7', '1e21'].forEach(function (s, i) {
      var q = K.back((t - 0.8 - i * 0.4) / 0.5); if (q <= 0) return;
      K.chip(s, 120 + i * 150, 125, { s: q, mono: true, size: 24, color: P.warm });
    });
    K.arrow(640, 125, 760, 125, { p: K.p(t, 2.8, 0.5), color: P.acc });
    var nb = K.back((t - 3.2) / 0.6);
    if (nb > 0) K.chip('typeof → "number"', 950, 125, { s: nb, mono: true, size: 24, stroke: P.acc });
    var B = [['sign', '1 bit', 110, P.purple, 7], ['exponent', '11 bits', 300, P.warm, 8], ['fraction (significant digits)', '52 bits', 750, P.green, 9]], x = 60;
    B.forEach(function (b) {
      var q = K.p(t, b[4], 0.5);
      K.box(x, 200, b[2] - 6, 86, { fill: P.card, stroke: b[3], a: q });
      K.text(b[0], x + (b[2] - 6) / 2, 230, { size: 21, weight: 700, color: b[3], align: 'center', a: q });
      K.text(b[1], x + (b[2] - 6) / 2, 262, { size: 17, color: P.muted, align: 'center', a: q });
      x += b[2];
    });
    K.text('64 bits · about 15–17 decimal digits of precision', 640, 312, { size: 18, color: P.muted, align: 'center', a: K.p(t, 10) });
    var c = K.p(t, 12.6);
    K.panel(60, 345, 700, 235, 'Console', { a: c });
    var L = [['> Number.MAX_SAFE_INTEGER', 13], ['> 2 ** 53 === 2 ** 53 + 1', 15.8]];
    K.code([L[0][0]], 86, 392, { size: 21, n: K.typed(t, [L[0][0]], [L[0][1]], 26), t: t, a: c });
    K.text('9007199254740991', 110, 438, { size: 21, mono: true, color: P.warm, a: K.p(t, 14.4) });
    K.code([L[1][0]], 86, 480, { size: 21, n: K.typed(t, [L[1][0]], [L[1][1]], 26), t: t, a: K.p(t, 15.6) });
    K.text('true   (precision lost)', 110, 526, { size: 21, mono: true, color: P.red, a: K.p(t, 17.2) });
    var S = [['NaN', 'not a number', P.red], ['Infinity', '1 / 0', P.blue], ['-Infinity', '-1 / 0', P.blue], ['-0', 'negative zero', P.purple]];
    S.forEach(function (s, i) {
      var y = 380 + i * 56, q = K.p(t, 19.8 + i * 0.6, 0.4);
      K.chip(s[0], 900, y, { mono: true, size: 21, stroke: s[2], a: q });
      K.text(s[1], 990, y, { size: 18, color: P.muted, mono: i === 1 || i === 2, a: q });
    });
  } },

/* 3 ─ 0.1 + 0.2 */
{ d: 26, title: 'Floating point: 0.1 + 0.2',
  caps: [
    [0.3, 'One tenth has no exact binary form, just as one third never ends in decimal: 0.3333…'],
    [6.5, 'So it is rounded. Add two rounded values and the tiny errors show: 0.1 + 0.2 is 0.30000000000000004.'],
    [13, 'Never compare decimals with ===. Check that the difference is tiny instead.'],
    [19, 'For money, store whole cents. toFixed formats for display, and it returns a string.']],
  draw: function (K, t) {
    var P = K.P, q1 = K.p(t, 0.6), q2 = K.p(t, 2.6);
    K.box(60, 90, 540, 140, { stroke: P.line, a: q1 });
    K.text('1 ÷ 3 in base 10', 84, 120, { size: 18, color: P.muted, weight: 700, a: q1 });
    var d = '0.3333333333…'; K.text(d.slice(0, Math.max(4, Math.min(d.length, Math.floor((t - 0.8) * 9)))), 84, 180, { size: 34, mono: true, a: q1 });
    K.box(680, 90, 540, 140, { stroke: P.warm, a: q2 });
    K.text('0.1 in base 2', 704, 120, { size: 18, color: P.warm, weight: 700, a: q2 });
    var b = '0.000110011001100…'; K.text(b.slice(0, Math.max(4, Math.min(b.length, Math.floor((t - 2.8) * 9)))), 704, 180, { size: 34, mono: true, color: P.warm, a: q2 });
    K.text('never ends → rounded to the nearest double', 950, 252, { size: 17, color: P.muted, align: 'center', a: K.p(t, 5) });
    K.panel(60, 275, 760, 310, 'Console', { a: K.p(t, 6.6) });
    var R = [['> 0.1 + 0.2', '0.30000000000000004', 7, 8.6, P.warm],
             ['> 0.1 + 0.2 === 0.3', 'false', 13.2, 14.6, P.red],
             ['> Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON', 'true', 15.6, 17.6, P.green]];
    R.forEach(function (r, i) {
      var y = 322 + i * 86;
      K.code([r[0]], 86, y, { size: 20, n: K.typed(t, [r[0]], [r[2]], 30), t: t, a: K.p(t, r[2] - 0.2, 0.2) });
      K.text(r[1], 110, y + 50, { size: 20, mono: true, color: r[4], a: K.p(t, r[3], 0.3) });
    });
    var m = K.p(t, 19.2);
    K.box(850, 275, 370, 310, { fill: P.code, stroke: P.green, a: m });
    K.text('Money: integer cents', 874, 305, { size: 19, weight: 700, color: P.green, a: m });
    var mc = ['const cents = 1050 + 949;', '(cents / 100).toFixed(2)'];
    K.code(mc, 874, 345, { size: 17, lh: 1.7, n: K.typed(t, mc, [19.8, 21.2], 26), t: t, a: m });
    K.text('"19.99"', 874, 440, { size: 24, mono: true, color: P.green, a: K.p(t, 22.6) });
    K.chip('a string, for display', 1035, 500, { size: 17, stroke: P.warm, a: K.p(t, 23.2) });
  } },

/* 4 ─ BigInt, NaN and -0 */
{ d: 25, title: 'BigInt, NaN and -0',
  caps: [
    [0.3, 'For whole numbers beyond 2⁵³, use BigInt. Write the literal with an n on the end.'],
    [6, 'BigInt and Number do not mix in arithmetic: 1n + 1 throws a TypeError. Convert one side explicitly.'],
    [12.5, 'NaN means not a number, and it is the only value not equal to itself. Test for it with Number.isNaN.'],
    [19, 'Object.is is the strictest check: it tells -0 apart from 0, and says NaN is NaN.']],
  draw: function (K, t) {
    var P = K.P;
    K.panel(40, 85, 590, 260, 'BigInt', { a: K.p(t, 0.3) });
    var c1 = ['> 2n ** 64n'];
    K.code(c1, 66, 135, { size: 21, n: K.typed(t, c1, [0.9], 22), t: t });
    K.text('18446744073709551616n', 90, 180, { size: 21, mono: true, color: P.warm, a: K.p(t, 2.4) });
    var c2 = ['> 1n + 1'];
    K.code(c2, 66, 222, { size: 21, n: K.typed(t, c2, [6.4], 22), t: t, a: K.p(t, 6.2, 0.2) });
    K.text('TypeError: Cannot mix BigInt', 90, 266, { size: 19, mono: true, color: P.red, a: K.p(t, 7.6) });
    K.text('and other types', 90, 292, { size: 19, mono: true, color: P.red, a: K.p(t, 7.6) });
    K.text('fix:  1n + BigInt(1)  →  2n', 90, 322, { size: 18, mono: true, color: P.green, a: K.p(t, 9.6) });
    K.panel(650, 85, 590, 260, 'NaN', { a: K.p(t, 12.6) });
    var N = [['> NaN === NaN', 'false', 13, P.red], ['> Number.isNaN(NaN)', 'true', 15.6, P.green], ['> Number("abc")', 'NaN', 17.2, P.warm]];
    N.forEach(function (r, i) {
      var y = 135 + i * 64;
      K.code([r[0]], 676, y, { size: 20, n: K.typed(t, [r[0]], [r[2]], 26), t: t, a: K.p(t, r[2] - 0.2, 0.2) });
      K.text(r[1], 1120, y + 12, { size: 21, mono: true, color: r[3], align: 'right', a: K.p(t, r[2] + 0.9, 0.3) });
    });
    var a = K.p(t, 19.2);
    K.box(40, 370, 1200, 215, { fill: P.code, stroke: P.line, a: a });
    K.text('comparison', 70, 402, { size: 17, color: P.muted, weight: 700, a: a });
    K.text('===', 640, 402, { size: 20, mono: true, color: P.muted, align: 'center', weight: 700, a: a });
    K.text('Object.is', 960, 402, { size: 20, mono: true, color: P.acc, align: 'center', weight: 700, a: a });
    var T = [['0 and -0', true, false, 19.8], ['NaN and NaN', false, true, 21.2]];
    T.forEach(function (r, i) {
      var y = 460 + i * 64, q = K.p(t, r[3], 0.4);
      K.text(r[0], 70, y, { size: 22, mono: true, a: q });
      K.mark(600, y, r[1], 0.9, q); K.text(r[1] ? 'equal' : 'not equal', 626, y, { size: 19, color: P.muted, a: q });
      K.mark(920, y, r[2], 0.9, K.p(t, r[3] + 0.6, 0.4)); K.text(r[2] ? 'equal' : 'not equal', 946, y, { size: 19, color: P.muted, a: K.p(t, r[3] + 0.6, 0.4) });
    });
  } },

/* 5 ─ truthy and falsy */
{ d: 23, title: 'Truthy and falsy',
  caps: [
    [0.3, 'In an if, any value is converted to a boolean. Only eight values are falsy.'],
    [5.5, 'false, 0, -0, 0n, the empty string, null, undefined and NaN.'],
    [11.5, 'Everything else is truthy: the string "0", an empty array, an empty object, even the string "false".'],
    [17.5, 'So if (items.length) checks for a non-empty array, and !!x turns any value into a boolean.']],
  draw: function (K, t) {
    var P = K.P, f = K.p(t, 0.6), tr = K.p(t, 11.6);
    K.box(40, 85, 590, 330, { fill: 'rgba(252,129,129,.07)', stroke: P.red, a: f });
    K.text('falsy: exactly 8', 64, 115, { size: 22, weight: 700, color: P.red, a: f });
    ['false', '0', '-0', '0n', '""', 'null', 'undefined', 'NaN'].forEach(function (s, i) {
      var q = K.back((t - 5.7 - i * 0.55) / 0.5); if (q <= 0) return;
      K.chip(s, 135 + (i % 3) * 200, 185 + Math.floor(i / 3) * 80, { s: q, mono: true, size: 24, stroke: P.red });
    });
    K.box(650, 85, 590, 330, { fill: 'rgba(104,211,145,.07)', stroke: P.green, a: tr });
    K.text('truthy: everything else', 674, 115, { size: 22, weight: 700, color: P.green, a: tr });
    ['"0"', '[]', '{}', '"false"', '-1', '" "'].forEach(function (s, i) {
      var q = K.back((t - 12 - i * 0.6) / 0.5); if (q <= 0) return;
      K.chip(s, 760 + (i % 3) * 185, 185 + Math.floor(i / 3) * 80, { s: q, mono: true, size: 24, stroke: P.green });
    });
    K.text('surprises: "0", [] and {} are truthy', 945, 370, { size: 18, color: P.warm, align: 'center', a: K.p(t, 15) });
    var code = ['if (items.length) { render(items); }   // non-empty', '!!"0"   // true', '!!""    // false'];
    K.panel(40, 435, 1200, 150, '', { a: K.p(t, 17.6) });
    K.code(code, 66, 452, { size: 21, lh: 1.45, n: K.typed(t, code, [17.9, 20, 21.2], 34), t: t, a: K.p(t, 17.6) });
  } },

/* 6 ─ + and conversions */
{ d: 26, title: 'Coercion: + and friends',
  caps: [
    [0.3, 'Operators convert types for you. The plus sign is special: if either side is a string, it joins text.'],
    [7, 'Minus, times and divide always convert both sides to numbers.'],
    [12.5, 'Objects become primitives first. An array joins with commas, a plain object gives [object Object].'],
    [19.5, 'Do not rely on the guesswork: convert on purpose with Number, String and Boolean.']],
  draw: function (K, t) {
    var P = K.P;
    var R = [['"5" + 2', '"52"', 'joins text', 1.4, P.warm], ['2 + 2 + "1"', '"41"', 'left to right', 4, P.warm],
             ['"5" - 2', '3', 'math', 7.4, P.blue], ['"5" * "2"', '10', 'math', 8.8, P.blue], ['true + 1', '2', 'true → 1', 10.2, P.blue],
             ['[1, 2] + [3]', '"1,23"', 'arrays → "1,2" and "3"', 13, P.purple], ['[] + {}', '"[object Object]"', 'object → text', 15.4, P.purple]];
    R.forEach(function (r, i) {
      var y = 100 + i * 52, q = K.p(t, r[3], 0.4), o = K.p(t, r[3] + 0.7, 0.4);
      K.text(r[0], 80, y, { size: 24, mono: true, a: q });
      K.arrow(330, y, 400, y, { p: K.p(t, r[3] + 0.3, 0.4), color: P.muted, lw: 2.5 });
      K.text(r[1], 420, y, { size: 24, mono: true, color: r[4], a: o });
      K.text(r[2], 720, y, { size: 18, color: P.muted, a: o });
    });
    var a = K.p(t, 19.7);
    K.panel(40, 470, 1200, 115, '', { a: a });
    [['Number("12px")', 'NaN', 20.2], ['String(42)', '"42"', 21.4], ['Boolean("")', 'false', 22.6]].forEach(function (c, i) {
      var x = 70 + i * 400, q = K.p(t, c[2], 0.4);
      K.text(c[0], x, 510, { size: 21, mono: true, a: q });
      K.text('→ ' + c[1], x, 548, { size: 21, mono: true, color: P.green, a: K.p(t, c[2] + 0.5, 0.4) });
    });
  } },

/* 7 ─ == vs === */
{ d: 29, title: '== vs ===',
  caps: [
    [0.3, 'Triple equals compares type and value, with no conversion at all.'],
    [5.5, 'Double equals converts first. If both sides already have the same type, it behaves exactly like ===.'],
    [12, 'null and undefined are loosely equal to each other, and to nothing else.'],
    [17, 'Otherwise both sides move toward numbers. 0 == "" and 0 == "0" are true, yet "" == "0" is false.'],
    [24, 'Use === everywhere. The one accepted idiom is x == null, meaning null or undefined.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('5 === "5"', 700, 110, { size: 26, mono: true, a: K.p(t, 0.8) }); K.mark(940, 110, false, 0.9, K.p(t, 2));
    K.text('different types: false', 970, 110, { size: 18, color: P.muted, a: K.p(t, 2) });
    K.text('5 == "5"', 700, 165, { size: 26, mono: true, a: K.p(t, 6) }); K.mark(940, 165, true, 0.9, K.p(t, 7.4));
    K.text('"5" → 5, then equal', 970, 165, { size: 18, color: P.muted, a: K.p(t, 7.4) });
    var F = [['a == b', 'start', 5.8, P.acc], ['same type?', 'yes → like ===', 8.2, P.acc], ['null / undefined?', 'equal only to each other', 12.2, P.purple], ['convert toward number', 'then compare again', 17.2, P.warm]];
    F.forEach(function (f, i) {
      var y = 110 + i * 105, q = K.back((t - f[2]) / 0.5); if (q <= 0) return;
      K.box(60, y - 30, 260, 60, { stroke: f[3], a: K.clamp(q) });
      K.text(f[0], 190, y, { size: 21, weight: 700, align: 'center', mono: i === 0, a: K.clamp(q) });
      if (i) { K.text(f[1], 340, y, { size: 18, color: f[3], a: K.p(t, f[2] + 0.5) }); K.arrow(190, y - 72, 190, y - 34, { p: K.p(t, f[2] - 0.3, 0.4), color: P.muted, lw: 2.5 }); }
    });
    K.text('null == 0  →  false', 340, 352, { size: 17, mono: true, color: P.muted, a: K.p(t, 14) });
    var n = [[950, 285, '0'], [770, 500, '""'], [1130, 500, '"0"']], ea = [[0, 1, true, 18.6, -28, 0], [0, 2, true, 20, 28, 0], [1, 2, false, 21.4, 0, 0]];
    ea.forEach(function (e) {
      var A = n[e[0]], B = n[e[1]], q = K.p(t, e[3], 0.5), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      K.arrow(A[0], A[1], A[0] + (B[0] - A[0]) * q, A[1] + (B[1] - A[1]) * q, { color: e[2] ? P.green : P.red, lw: 3, head: 0.1, a: q, dash: e[2] ? null : [8, 6] });
      K.mark(mx + e[4], my + e[5], e[2], 0.85, K.p(t, e[3] + 0.4));
    });
    n.forEach(function (p, i) {
      var q = K.back((t - 17.4 - i * 0.3) / 0.5); if (q <= 0) return;
      K.chip(p[2], p[0], p[1], { s: q, mono: true, size: 26, stroke: P.warm });
    });
    K.text('== is not transitive', 950, 395, { size: 18, color: P.red, align: 'center', a: K.p(t, 22) });
    var r = K.back((t - 24.3) / 0.6);
    if (r > 0) { K.chip('use ===', 160, 545, { s: r, size: 22, stroke: P.acc, color: P.acc }); K.chip('x == null  ↔  null or undefined', 470, 545, { s: r, mono: true, size: 19, stroke: P.green }); }
  } },

/* 8 ─ branching and logical operators */
{ d: 28, title: '?:  ||  &&  ??  ?.',
  caps: [
    [0.3, 'Branch with if and else, or pick a value with the ternary operator: condition ? this : that.'],
    [6.5, '|| returns the first truthy value, && returns the first falsy one. Both stop as soon as the answer is known.'],
    [13, 'That makes || a risky default: it also replaces 0 and "". ?? falls back only on null or undefined.'],
    [20, '??= assigns only when a value is missing, and ?. returns undefined instead of throwing on a missing link.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const label = age >= 18 ? "adult" : "minor";', '', 'const count = 0;', 'count || 10        // 10  (0 lost!)', 'count ?? 10        // 0', '', 'cfg.retries ??= 3;  // set if missing', 'cfg.db?.host        // undefined'];
    var hi = t > 20.4 ? (t > 23 ? 7 : 6) : t > 15.6 ? 4 : t > 13.2 ? 3 : t > 1 ? 0 : -1;
    K.panel(40, 85, 650, 400, 'flow.js');
    K.code(code, 64, 135, { size: 19, lh: 1.65, n: K.typed(t, code, [0.8, 2.6, 12.8, 13.3, 15.4, 19.9, 20.3, 22.8], 30), t: t, hi: hi, w: 620 });
    /* ternary fork */
    var tq = K.p(t, 2.4);
    K.chip('age >= 18 ?', 830, 130, { mono: true, size: 20, stroke: P.acc, a: tq });
    K.arrow(905, 130, 1000, 105, { p: K.p(t, 3.2, 0.4), color: P.green, lw: 2.5 }); K.text('"adult"', 1010, 105, { size: 20, mono: true, color: P.green, a: K.p(t, 3.6) });
    K.arrow(905, 140, 1000, 165, { p: K.p(t, 3.4, 0.4), color: P.muted, lw: 2.5 }); K.text('"minor"', 1010, 165, { size: 20, mono: true, color: P.muted, a: K.p(t, 3.8) });
    /* || scan */
    var oa = K.p(t, 6.8);
    K.text('a || b || c', 740, 240, { size: 20, mono: true, color: P.acc, a: oa });
    K.text('first truthy', 900, 240, { size: 17, color: P.muted, a: oa });
    var V = ['0', '""', '"Ana"', '"Bo"'], hit = Math.min(2, Math.floor(K.clamp((t - 7.6) / 2.4) * 3));
    V.forEach(function (v, i) {
      var x = 790 + i * 115, on = t > 7.6 && i === hit, past = t > 7.6 && i < hit;
      K.chip(v, x, 290, { mono: true, size: 20, a: oa * (i > 2 && t > 10 ? 0.4 : 1), stroke: on ? (i === 2 ? P.green : P.warm) : P.line, color: past ? P.muted : P.ink });
    });
    K.text('&& → first falsy', 740, 340, { size: 17, mono: true, color: P.muted, a: K.p(t, 10.6) });
    /* || vs ?? on 0 */
    var z = K.p(t, 13.4);
    K.text('count = 0', 740, 395, { size: 20, mono: true, color: P.warm, a: z });
    K.text('||  →  10', 900, 395, { size: 20, mono: true, a: K.p(t, 14) }); K.mark(1040, 395, false, 0.8, K.p(t, 14.4));
    K.text('??  →  0', 1080, 395, { size: 20, mono: true, a: K.p(t, 15.8) }); K.mark(1210, 395, true, 0.8, K.p(t, 16.2));
    /* optional chaining */
    var oc = K.p(t, 22.8);
    K.chip('cfg', 790, 520, { mono: true, size: 20, stroke: P.acc, a: oc });
    K.arrow(830, 520, 880, 520, { p: K.p(t, 23.2, 0.3), color: P.muted, lw: 2.5 });
    K.chip('.db?', 935, 520, { mono: true, size: 20, stroke: P.red, a: K.p(t, 23.4) });
    K.text('missing', 935, 563, { size: 16, color: P.red, align: 'center', a: K.p(t, 23.8) });
    K.arrow(990, 520, 1040, 520, { p: K.p(t, 24, 0.3), color: P.muted, lw: 2.5 });
    K.chip('undefined', 1130, 520, { mono: true, size: 20, stroke: P.green, a: K.p(t, 24.3) });
    K.text('no TypeError', 1130, 563, { size: 16, color: P.green, align: 'center', a: K.p(t, 24.6) });
    K.chip('retries: 3', 365, 535, { mono: true, size: 19, stroke: P.green, a: K.p(t, 21.4) });
    K.text('??= filled the gap', 470, 535, { size: 17, color: P.muted, a: K.p(t, 21.6) });
  } },

/* 9 ─ switch and loops */
{ d: 30, title: 'switch and loops',
  caps: [
    [0.3, 'switch compares with ===, and falls through into the next case until it meets a break.'],
    [7, 'A classic for loop has three parts: init, test and update. break leaves the loop, continue skips ahead.'],
    [14, 'for...of walks the values of any iterable: arrays, strings, Maps and Sets.'],
    [19.5, 'for...in walks the enumerable string keys, including extra and inherited ones. Keep it for plain objects.'],
    [25, 'forEach cannot be stopped with break. To stop early, use for...of, some or every.']],
  draw: function (K, t) {
    var P = K.P;
    var sw = ['switch (x) {          // x = 1', '  case 1: out.push("one");', '  case 2: out.push("two"); break;', '  default: out.push("other");', '}'];
    var hi = t > 3.6 ? (t > 4.6 ? 2 : 1) : t > 2.4 ? 0 : -1;
    K.panel(40, 85, 600, 245, 'switch.js');
    K.code(sw, 64, 130, { size: 19, lh: 1.55, n: K.typed(t, sw, [0.5, 0.8, 1.1, 1.4, 1.6], 70), t: t, hi: t < 7 ? hi : -1, w: 570 });
    K.text('out → ["one", "two"]', 64, 305, { size: 19, mono: true, color: P.warm, a: K.p(t, 5.2) });
    K.text('fell through!', 330, 305, { size: 17, color: P.warm, a: K.p(t, 5.6) });
    /* loop cycle */
    var N = [['init', 760, 130], ['test', 960, 130], ['body', 1160, 130], ['update', 960, 280]], c = K.p(t, 7.2);
    N.forEach(function (n, i) {
      var q = K.back((t - 7.4 - i * 0.7) / 0.5); if (q <= 0) return;
      var live = t > 10 && t < 14 && Math.floor((t - 10) * 1.5) % 3 === [9, 0, 1, 2][i];
      K.chip(n[0], n[1], n[2], { s: q, mono: true, size: 20, stroke: live ? P.warm : P.acc });
    });
    K.arrow(800, 130, 915, 130, { p: K.p(t, 8, 0.4), color: P.muted, lw: 2.5 });
    K.arrow(1005, 130, 1110, 130, { p: K.p(t, 8.6, 0.4), color: P.muted, lw: 2.5 });
    K.curve(1160, 158, 1140, 280, 1020, 280, { p: K.p(t, 9.2, 0.5), color: P.muted, lw: 2.5 });
    K.arrow(960, 254, 960, 158, { p: K.p(t, 9.6, 0.4), color: P.muted, lw: 2.5 });
    K.text('false → exit', 960, 85, { size: 16, color: P.red, align: 'center', a: K.p(t, 10.4) });
    K.chip('break: leave', 760, 225, { size: 16, stroke: P.red, a: K.p(t, 11.4) });
    K.chip('continue: skip', 1160, 225, { size: 16, stroke: P.blue, a: K.p(t, 12.4) });
    /* for...of vs for...in */
    var arr = ['const arr = ["a", "b"]; arr.extra = "x";'];
    K.code(arr, 64, 352, { size: 20, n: K.typed(t, arr, [14.2], 40), t: t });
    var po = K.p(t, 14.4), pi = K.p(t, 19.6);
    K.panel(40, 390, 580, 140, '', { a: po, stroke: P.green });
    K.code(['for (const v of arr)'], 64, 408, { size: 20, a: po });
    ['"a"', '"b"'].forEach(function (s, i) { K.chip(s, 110 + i * 110, 480, { mono: true, size: 20, stroke: P.green, a: K.p(t, 16 + i * 0.6, 0.4) }); });
    K.text('values', 360, 480, { size: 18, color: P.muted, a: K.p(t, 17.2) });
    K.panel(660, 390, 580, 140, '', { a: pi, stroke: P.warm });
    K.code(['for (const k in arr)'], 684, 408, { size: 20, a: pi });
    ['"0"', '"1"', '"extra"'].forEach(function (s, i) { K.chip(s, 730 + i * 115 + (i > 1 ? 15 : 0), 480, { mono: true, size: 20, stroke: i > 1 ? P.red : P.warm, a: K.p(t, 21 + i * 0.6, 0.4) }); });
    K.text('string keys', 1080, 480, { size: 18, color: P.muted, a: K.p(t, 22.6) });
    var fe = K.p(t, 25.2);
    K.mark(320, 565, false, 0.8, fe); K.text('arr.forEach(...)  has no break', 344, 565, { size: 18, mono: true, color: P.red, a: fe });
    K.mark(740, 565, true, 0.8, K.p(t, 26.4)); K.text('for...of  ·  some  ·  every', 764, 565, { size: 18, mono: true, color: P.green, a: K.p(t, 26.4) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 2 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['One 64-bit number type: safe up to 2⁵³ − 1, BigInt beyond',
     'Decimals are rounded: compare with a tolerance, keep money in cents',
     'Eight falsy values; + joins strings, other operators do math',
     'Use ===; x == null is the one loose idiom',
     '?? for defaults, ?. for missing links, for...of for values'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 2 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
