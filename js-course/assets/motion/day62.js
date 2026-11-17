/* Day 62 in motion: narrowing through branches, type guards, discriminated unions, exhaustiveness, typed functions and classes. Loaded on demand by assets/js/motion.js. */
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

JSC.motion.define('day62', {
  kicker: 'JavaScript: Zero to Architect · Day 62',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 62: how TypeScript narrows types through your branches, and how to type functions and classes.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Narrowing', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 62 · Narrowing and functions', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Type guards', 'Tagged unions', 'Functions & classes'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ narrowing through branches */
{ d: 26, title: 'Narrowing through branches',
  caps: [
    [0.3, 'A union says a value is one of several types. Here x may be a string, an array of strings, or null.'],
    [6.5, 'Before any check, x.length is an error: null has no length.'],
    [12, 'Each check narrows the type. After the null check returns, only string and string[] are left.'],
    [18, 'Inside the typeof branch x is a string. After it, only the array remains. TypeScript follows your control flow.']],
  draw: function (K, t) {
    var P = K.P, head = 'function len(x: string | string[] | null) {', code;
    K.panel(40, 80, 640, 330, 'len.ts', { a: K.p(t, 0.2) });
    if (t < 11.8) {
      code = [head, '  x.length;'];
      K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [0.6, 6.8], 28), t: t, a: 1 - K.p(t, 11.2, 0.5) });
      squig(K, col(66, 2, 20), col(66, 3, 20), 183, K.p(t, 7.4, 0.3) * (1 - K.p(t, 11.2, 0.5)));
    } else {
      code = [head, '  if (x == null) return 0;', '  if (typeof x === "string") {', '    return x.length;', '  }', '  return x.length;', '}'];
      var hi = t > 20.6 ? 5 : t > 18.2 ? 3 : t > 12.4 ? 1 : -1;
      K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [0, 12.1, 17.2, 18.2, 19.2, 20.4, 21], 30), t: t, hi: hi, w: 610 });
      K.text('x: string', 460, 224, { size: 17, mono: true, color: P.green, a: K.p(t, 19) });
      K.text('x: string[]', 460, 288, { size: 17, mono: true, color: P.green, a: K.p(t, 21.2) });
    }
    band(K, 66, 128, 16, 41, 20, 'rgba(79,209,197,.18)', K.win(t, 1, 6.2));

    K.panel(700, 80, 540, 330, 'type of x', { a: K.p(t, 0.2) });
    function row(y, label, items, at, c) {
      var q = K.p(t, at);
      K.text(label, 724, y, { size: 17, color: P.muted, a: q });
      var X = [943, 1072, 1192];
      items.forEach(function (it, i) {
        if (!it) return;
        K.chip(it, X[i], y, { size: 18, mono: true, stroke: c, a: q });
        if (i < 2 && items[i + 1]) K.text('|', [1003, 1142][i], y, { size: 20, mono: true, color: P.muted, align: 'center', a: q });
      });
    }
    row(140, 'at the start', ['string', 'string[]', 'null'], 1.6, P.acc);
    row(210, 'after == null', ['string', 'string[]', null], 13, P.acc);
    row(280, 'typeof branch', ['string', null, null], 18.8, P.green);
    row(350, 'after the if', [null, 'string[]', null], 21, P.green);
    K.box(1159, 122, 66, 36, { fill: false, stroke: P.red, r: 18, lw: 2.5, a: K.win(t, 7.6, 14) });
    K.arrow(1192, 160, 1192, 196, { p: K.p(t, 13.2, 0.4), color: P.red, lw: 2, head: 9, a: 1 - K.p(t, 15) });
    K.text('removed', 1192, 210, { size: 16, color: P.red, align: 'center', a: K.win(t, 13.4, 17.5) });

    tip(K, 40, 436, 640, ["'x' is possibly 'null'.  ts(18047)"], K.win(t, 7.6, 11.6), false);
    var cf = K.p(t, 22.4);
    K.box(40, 450, 1200, 110, { fill: false, stroke: P.acc, dash: [8, 6], a: cf });
    K.text('control-flow analysis follows', 70, 505, { size: 20, weight: 700, color: P.acc, a: cf });
    ['if', 'return', 'switch', '&&', '||', '??', 'throw'].forEach(function (s, i) {
      K.chip(s, 440 + i * 108, 505, { size: 19, mono: true, stroke: P.acc, a: K.p(t, 22.8 + i * 0.25) });
    });
  } },

/* 3 ─ guards */
{ d: 24, title: 'Type guards',
  caps: [
    [0.3, 'TypeScript understands the same checks you already write in plain JavaScript.'],
    [6, 'typeof for primitives, instanceof for classes, in for properties, Array.isArray for arrays.'],
    [12.5, 'Careful with truthiness: if (count) also throws away 0 and the empty string.'],
    [18, 'When you mean "not missing", write != null. It removes only null and undefined.']],
  draw: function (K, t) {
    var P = K.P;
    var G = [['typeof x === "number"', 'x: number', 1], ['err instanceof TypeError', 'err: TypeError', 6.4], ['"swim" in pet', 'pet: Fish', 8], ['Array.isArray(v)', 'v: string[]', 9.6]];
    G.forEach(function (c, i) {
      var x = 40 + (i % 2) * 610, y = 84 + Math.floor(i / 2) * 110, q = K.back((t - c[2]) / 0.6);
      if (q <= 0) return;
      K.box(x, y, 590, 96, { fill: P.code, stroke: P.acc, a: K.clamp(q) });
      K.code(['if (' + c[0] + ')'], x + 24, y + 18, { size: 20, a: K.clamp(q) });
      K.arrow(x + 30, y + 70, x + 70, y + 70, { p: K.p(t, c[2] + 0.6, 0.4), color: P.green, lw: 2, head: 9 });
      K.text(c[1], x + 84, y + 70, { size: 19, mono: true, color: P.green, a: K.p(t, c[2] + 0.8) });
    });
    var l = K.p(t, 12.6), A = ['const label = (count?: number) =>', '  count ? count + " items" : "none";'];
    K.panel(40, 320, 580, 260, 'truthiness', { a: l });
    K.code(A, 66, 364, { size: 19, n: K.typed(t, A, [12.8, 13.8], 34), t: t, a: l });
    var b1 = K.p(t, 15.4);
    K.mark(80, 470, false, 0.8, b1); K.text('label(0)  →  "none"', 106, 470, { size: 20, mono: true, color: P.red, a: b1 });
    K.text('also removes 0, "", NaN and false', 70, 526, { size: 17, color: P.muted, a: K.p(t, 16.4) });
    var r = K.p(t, 18.2), B = ['const label = (count?: number) =>', '  count != null ? count + " items" : "none";'];
    K.panel(660, 320, 580, 260, '!= null', { a: r });
    K.code(B, 686, 364, { size: 19, n: K.typed(t, B, [18.4, 19.4], 34), t: t, a: r });
    var b2 = K.p(t, 21.2);
    K.mark(700, 470, true, 0.8, b2); K.text('label(0)  →  "0 items"', 726, 470, { size: 20, mono: true, color: P.green, a: b2 });
    K.text('removes only null and undefined', 690, 526, { size: 17, color: P.muted, a: K.p(t, 22) });
  } },

/* 4 ─ discriminated unions */
{ d: 26, title: 'Discriminated unions',
  caps: [
    [0.3, 'Real data comes in states. Give each variant a literal tag, here status, and make a union of them.'],
    [6.5, 'Reading data before you check the tag is an error: only the ok state has it.'],
    [12, 'Switch on the tag, and each case narrows s to exactly one variant.'],
    [18.5, 'In the ok case, data is there. In the error case, error is. No casts needed.']],
  draw: function (K, t) {
    var P = K.P, top = ['type RemoteData =', '  | { status: "loading" }', '  | { status: "ok"; data: string[] }', '  | { status: "error"; error: Error };', '', 'function render(s: RemoteData) {'], code, n;
    K.panel(40, 80, 640, 500, 'remote.ts', { a: K.p(t, 0.2) });
    if (t < 11.8) {
      code = top.concat(['  return s.data;', '}']);
      n = K.typed(t, code, [0.6, 1.4, 2.6, 4, 5.4, 5.5, 6.8, 7.4], 30);
      K.code(code, 66, 128, { size: 20, n: n, t: t, a: 1 - K.p(t, 11.2, 0.5) });
      squig(K, col(66, 11, 20), col(66, 15, 20), 343, K.p(t, 7.6, 0.3) * (1 - K.p(t, 11.2, 0.5)));
    } else {
      code = top.concat(['  switch (s.status) {', '    case "loading": return "…";', '    case "ok": return s.data.join();', '    case "error": return s.error.message;', '  }', '}']);
      var hi = t > 21.4 ? 9 : t > 18.6 ? 8 : t > 13.4 ? 7 : t > 12.2 ? 6 : -1;
      K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [0, 0, 0, 0, 0, 0, 12.2, 13.4, 18.7, 21.5, 23, 23.1], 30), t: t, hi: hi, w: 610 });
    }
    var C = [['loading', '{ status: "loading" }', 1.6, P.blue], ['ok', '{ status: "ok"; data }', 2.8, P.green], ['error', '{ status: "error"; error }', 4.2, P.red]];
    var cur = t > 21.4 ? 2 : t > 18.6 ? 1 : t > 13.4 ? 0 : -1;
    C.forEach(function (c, i) {
      var y = 96 + i * 92, q = K.p(t, c[2]), on = cur === i;
      K.box(720, y, 520, 76, { fill: on ? 'rgba(79,209,197,.10)' : P.card, stroke: on ? c[3] : P.line, lw: on ? 3 : 2, a: q });
      K.chip(c[0], 790, y + 38, { size: 18, mono: true, stroke: c[3], a: q });
      K.text(c[1], 870, y + 38, { size: 18, mono: true, a: q });
    });
    K.text('the tag', 1180, 82, { size: 16, color: P.warm, align: 'right', a: K.win(t, 4.8, 12) });
    tip(K, 720, 384, 520, ["Property 'data' does not exist", "on type 'RemoteData'.  ts(2339)"], K.win(t, 7.8, 11.6), false);
    var hv = K.p(t, 13.6);
    if (cur >= 0) {
      K.box(720, 384, 520, 150, { fill: P.code, stroke: C[cur][3], a: hv });
      K.text('inside this case, s is', 744, 414, { size: 17, color: P.muted, a: hv });
      K.text(['{ status: "loading" }', '{ status: "ok";', '{ status: "error";'][cur], 744, 456, { size: 20, mono: true, color: C[cur][3], a: hv });
      if (cur) K.text(['', '  data: string[] }', '  error: Error }'][cur], 744, 494, { size: 20, mono: true, color: C[cur][3], a: hv });
    }
    K.chip('no casts', 980, 562, { size: 17, stroke: P.green, a: K.p(t, 23.6) });
  } },

/* 5 ─ exhaustiveness */
{ d: 24, title: 'Exhaustive with never',
  caps: [
    [0.3, 'End the switch with a default that passes the value to assertNever, which only accepts never.'],
    [6.5, 'When every case is handled nothing is left, so s has type never there, and it compiles.'],
    [12, 'Now add a new state to the union. The default branch receives it, and the editor turns red.'],
    [18, 'Adding a variant breaks the build in every place you forgot, instead of breaking production.']],
  draw: function (K, t) {
    var P = K.P, code = ['function assertNever(x: never): never {', '  throw new Error("Unhandled: " + x);', '}', 'switch (s.status) {', '  case "loading": return "…";',
      '  case "ok":      return s.data.join();', '  case "error":   return s.error.message;', '  default:        return assertNever(s);', '}'];
    var hi = t > 12.6 ? 7 : t > 8.2 ? 6 : t > 7.4 ? 5 : t > 6.6 ? 4 : t > 2.4 ? 7 : -1;
    K.panel(40, 80, 700, 340, 'render.ts', { a: K.p(t, 0.2) });
    K.code(code, 66, 124, { size: 19, lh: 1.5, n: K.typed(t, code, [0.5, 1.2, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4], 60), t: t, hi: hi, w: 670 });
    var bad = K.p(t, 13.2, 0.3);
    squig(K, col(66, 37, 19), col(66, 38, 19), 124 + 7 * 29 + 22, bad);

    K.box(780, 80, 460, 340, { fill: false, stroke: P.line, dash: [8, 6], a: K.p(t, 0.4) });
    K.text('type RemoteData', 804, 106, { size: 18, weight: 700, color: P.muted, a: K.p(t, 0.4) });
    [['loading', P.blue, 6.6], ['ok', P.green, 7.4], ['error', P.red, 8.2]].forEach(function (c, i) {
      var y = 150 + i * 56;
      K.chip(c[0], 870, y, { size: 19, mono: true, stroke: c[1], a: K.p(t, 0.8 + i * 0.3) });
      K.mark(960, y, true, 0.7, K.p(t, c[2]));
      K.text('handled', 984, y, { size: 16, color: P.muted, a: K.p(t, c[2]) });
    });
    var st = K.back((t - 12.2) / 0.6);
    if (st > 0) K.chip('stale', 870, 318, { size: 19, mono: true, stroke: P.warm, s: st, a: K.clamp(st) });
    K.text('new!', 960, 318, { size: 16, color: P.warm, a: K.p(t, 12.6) });
    var nv = K.p(t, 9.2) * (1 - K.p(t, 12.4, 0.4));
    K.chip('left over: never', 1010, 386, { size: 18, mono: true, stroke: P.green, color: P.green, a: nv });
    K.chip('left over: "stale"', 1010, 386, { size: 18, mono: true, stroke: P.red, color: P.red, a: K.p(t, 12.8) });

    tip(K, 40, 448, 1200, ["Argument of type '{ status: \"stale\"; }' is not assignable", "to parameter of type 'never'.  ts(2345)"], K.p(t, 13.6), false);
    K.text('a forgotten case is now a compile error, not a production bug', 640, 572, { size: 19, color: P.green, align: 'center', a: K.p(t, 18.6) });
  } },

/* 6 ─ custom guards */
{ d: 24, title: 'Custom type guards',
  caps: [
    [0.3, 'For your own checks, write a type predicate: a function whose return type is p is Fish.'],
    [6, 'When it returns true, TypeScript narrows. Even filter uses it, so the result is an array of Fish.'],
    [12, 'Since TypeScript 5.5, simple predicates like x !== undefined are inferred for you.'],
    [18, 'But the compiler trusts your guard completely, so keep the check honest.']],
  draw: function (K, t) {
    var P = K.P, code = ['interface Fish { swim(): void }', 'interface Bird { fly(): void }', 'function isFish(p: Fish | Bird): p is Fish {', '  return "swim" in p;', '}',
      'const fish = pets.filter(isFish);', 'const nums = [1, undefined, 2]', '  .filter((x) => x !== undefined);'];
    var hi = t > 12.2 ? 7 : t > 6.2 ? 5 : t > 1.6 ? 2 : -1;
    K.panel(40, 80, 760, 340, 'guards.ts', { a: K.p(t, 0.2) });
    band(K, 66, 192, 32, 42, 20, 'rgba(246,173,85,.25)', K.win(t, 2.6, 6));
    K.code(code, 66, 128, { size: 20, n: K.typed(t, code, [0.5, 0.9, 1.6, 3, 3.8, 6.4, 12.2, 13.2], 34), t: t, hi: hi, w: 730 });
    K.text('the predicate', 690, 182, { size: 16, color: P.warm, align: 'center', a: K.win(t, 2.8, 6) });

    var pets = [['Fish', P.blue], ['Bird', P.purple], ['Fish', P.blue], ['Bird', P.purple]];
    K.text('pets: (Fish | Bird)[]', 1040, 104, { size: 17, mono: true, color: P.muted, align: 'center', a: K.p(t, 6.4) });
    pets.forEach(function (p, i) {
      var q = K.p(t, 6.6 + i * 0.2), fly = p[0] === 'Fish' ? 0 : K.p(t, 8.4, 0.6);
      K.chip(p[0], 880 + i * 106, 146 + fly * 30, { size: 18, stroke: p[1], a: q * (1 - fly) });
    });
    K.arrow(1040, 176, 1040, 236, { p: K.p(t, 8.6, 0.5), color: P.acc });
    K.text('filter(isFish)', 1060, 206, { size: 16, mono: true, color: P.acc, a: K.p(t, 8.6) });
    var f = K.p(t, 9.4);
    K.chip('Fish', 986, 266, { size: 18, stroke: P.blue, a: f }); K.chip('Fish', 1094, 266, { size: 18, stroke: P.blue, a: f });
    K.text('fish: Fish[]', 1040, 314, { size: 19, mono: true, color: P.green, align: 'center', a: K.p(t, 10) });
    var inf = K.p(t, 14.6);
    K.box(840, 346, 400, 64, { fill: P.code, stroke: P.green, a: inf });
    K.text('nums: number[]', 862, 378, { size: 19, mono: true, color: P.green, a: inf });
    K.text('TS 5.5+', 1220, 378, { size: 16, color: P.muted, align: 'right', a: inf });

    var l = K.p(t, 18.2), lie = ['function isFish(p: Fish | Bird): p is Fish { return true; }  // compiles'];
    K.panel(40, 444, 1200, 136, 'a lying guard', { a: l, stroke: P.red });
    K.code(lie, 66, 488, { size: 19, n: K.typed(t, lie, [18.5], 44), t: t, a: l });
    var e = K.p(t, 21);
    K.mark(80, 548, false, 0.75, e); K.text('bird.swim()  →  TypeError: p.swim is not a function', 104, 548, { size: 18, mono: true, color: P.red, a: e });
  } },

/* 7 ─ functions */
{ d: 24, title: 'Typing functions',
  caps: [
    [0.3, 'Annotate each parameter, and the return type of exported functions.'],
    [6, 'Optional parameters take a question mark, defaults infer their type, and rest parameters collect an array.'],
    [12.5, 'Every call is checked: a wrong argument type, or a missing argument, is flagged at the call site.'],
    [18.5, 'Overloads list several signatures for one implementation, when the return type depends on the input.']],
  draw: function (K, t) {
    var P = K.P, code = ['function format(', '  n: number,', '  digits = 2,', '  unit?: string,', '  ...tags: string[]', '): string {', '  return n.toFixed(digits) + (unit ?? "");', '}'];
    var hi = t > 9.8 ? 4 : t > 8.4 ? 3 : t > 6.6 ? 2 : t > 4.6 ? 5 : t > 1 ? 1 : -1;
    K.panel(40, 80, 760, 330, 'format.ts', { a: K.p(t, 0.2) });
    K.code(code, 66, 124, { size: 20, lh: 1.5, n: K.typed(t, code, [0.5, 1, 1.6, 2.2, 2.8, 3.6, 4, 5], 40), t: t, hi: hi, w: 730 });
    var L = [[154, 'required: number', 1.4, P.acc], [184, 'default: inferred number', 7, P.blue], [214, 'optional: string | undefined', 8.8, P.purple],
             [244, 'rest: string[]', 10.2, P.warm], [274, 'return type: string', 5, P.green]];
    var out = 1 - K.p(t, 18.2, 0.5);
    L.forEach(function (r) {
      var q = K.p(t, r[2]) * out;
      K.arrow(440, r[0] + 10, 470, r[0] + 10, { color: r[3], lw: 2, head: 8, a: q });
      K.text(r[1], 482, r[0] + 10, { size: 17, color: r[3], a: q });
    });

    var c = K.p(t, 12.6), calls = ['format(3.14159);   // "3.14"', 'format("3");', 'format();'];
    K.panel(40, 430, 740, 150, 'calls', { a: c });
    K.code(calls, 66, 470, { size: 20, lh: 1.5, n: K.typed(t, calls, [12.8, 14.2, 15.8], 30), t: t, a: c });
    squig(K, col(66, 7, 20), col(66, 10, 20), 470 + 30 + 23, K.p(t, 14.8, 0.3));
    squig(K, col(66, 0, 20), col(66, 8, 20), 470 + 60 + 23, K.p(t, 16.4, 0.3));
    tip(K, 790, 440, 450, ["'string' is not assignable to 'number'"], K.p(t, 15), false);
    tip(K, 790, 512, 450, ['Expected at least 1 arguments, but got 0.'], K.p(t, 16.6), false);

    var o = K.p(t, 18.8), ov = ['function pick(x: string): string;', 'function pick(x: number): number;', 'function pick(x: any) { return x; }'];
    K.panel(820, 80, 420, 330, 'overloads', { a: o });
    K.code(ov, 840, 124, { size: 17, lh: 1.6, n: K.typed(t, ov, [19, 19.9, 20.8], 44), t: t, a: o });
    K.text('2 signatures, 1 implementation', 1030, 248, { size: 16, color: P.muted, align: 'center', a: K.p(t, 21.8) });
    K.text('pick("a")  →  string', 846, 300, { size: 18, mono: true, color: P.green, a: K.p(t, 22.3) });
    K.text('pick(1)    →  number', 846, 340, { size: 18, mono: true, color: P.green, a: K.p(t, 22.8) });
  } },

/* 8 ─ classes */
{ d: 26, title: 'Classes: checker vs runtime',
  caps: [
    [0.3, 'Classes take annotations too. Here: a private field, a # private field, and a parameter property.'],
    [6.5, 'private is checked only by the compiler. After erasure, balance is an ordinary, visible property.'],
    [12.5, 'A # private field is real JavaScript privacy, enforced by the engine at runtime.'],
    [18.5, 'Parameter properties like private owner generate code, so they are not erasable syntax.']],
  draw: function (K, t) {
    var P = K.P, ts = ['class Account {', '  private balance = 0;', '  #pin = "1234";', '  constructor(private owner: string) {}', '}', 'const acc = new Account("ana");', 'acc.balance;'];
    var hi = t > 18.6 ? 3 : t > 12.6 ? 2 : t > 6.6 ? 1 : -1;
    K.panel(40, 80, 600, 330, 'account.ts', { a: K.p(t, 0.2) });
    K.code(ts, 66, 124, { size: 20, lh: 1.5, n: K.typed(t, ts, [0.5, 1, 2.2, 3.3, 4.8, 4.9, 6.8], 34), t: t, hi: hi, w: 570 });
    squig(K, col(66, 4, 20), col(66, 11, 20), 124 + 6 * 30 + 23, K.p(t, 7.6, 0.3));
    tip(K, 40, 432, 600, ["Property 'balance' is private and only", "accessible within class 'Account'."], K.p(t, 7.8), false);

    var js = ['class Account {', '  owner;', '  balance = 0;', '  #pin = "1234";', '  constructor(owner) {', '    this.owner = owner;', '  }', '}'];
    var ja = K.p(t, 8.6);
    K.panel(680, 80, 560, 330, 'account.js (emitted)', { a: ja });
    band(K, 706, 184, 2, 14, 20, 'rgba(246,173,85,.22)', K.win(t, 10, 12.4));
    band(K, 706, 214, 2, 16, 20, 'rgba(79,209,197,.20)', K.win(t, 13, 18.2));
    band(K, 706, 124 + 30, 2, 8, 20, 'rgba(246,173,85,.22)', K.p(t, 19));
    band(K, 706, 124 + 5 * 30, 4, 23, 20, 'rgba(246,173,85,.22)', K.p(t, 19.4));
    K.code(js, 706, 124, { size: 20, lh: 1.5, n: K.typed(t, js, [8.8, 9, 9.2, 9.4, 9.6, 9.8, 10, 10.1], 60), t: t, a: ja });
    K.text('generated', 1100, 154, { size: 16, color: P.warm, a: K.p(t, 19.6) });
    K.text('generated', 1100, 274, { size: 16, color: P.warm, a: K.p(t, 19.8) });

    var cn = K.p(t, 9.6);
    K.panel(680, 432, 560, 148, 'Console', { a: cn });
    K.text('acc.balance  →  0', 704, 476, { size: 18, mono: true, color: P.warm, a: K.p(t, 10.4) });
    K.text('visible', 1210, 476, { size: 16, color: P.warm, align: 'right', a: K.p(t, 10.8) });
    K.text('acc.#pin  →  SyntaxError', 704, 510, { size: 18, mono: true, color: P.red, a: K.p(t, 14) });
    K.lock(1196, 510, 0.8, P.green, K.p(t, 14.4));
    K.text('JSON  →  {"owner":"ana","balance":0}', 704, 546, { size: 18, mono: true, a: K.p(t, 15.6) });
    K.chip('parameter properties: not erasable', 340, 556, { size: 17, stroke: P.warm, a: K.p(t, 20.4) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 62 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Every check narrows a union: TypeScript follows your branches',
     'typeof, instanceof, in, Array.isArray and != null',
     'Tagged unions + switch + assertNever = exhaustive by design',
     'Type predicates (p is Fish) are trusted: keep them honest',
     'Typed parameters and overloads; private vs # private'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 62 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
