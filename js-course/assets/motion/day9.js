/* Day 9 in motion: the iteration protocol, custom iterables, generators, next(v) and return(), lazy infinite sequences, iterator helpers and async generators. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day9', {
  kicker: 'JavaScript: Zero to Architect · Day 9',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 9: iterators and generators, the protocol behind for...of and lazy sequences.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Iterators and generators', 0, 0, { size: 76, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 9 · One value at a time', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['The iteration protocol', 'function*', 'Lazy iterator helpers'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the protocol */
{ d: 26, title: 'The iteration protocol',
  caps: [
    [0.3, 'for...of works on any iterable. An iterable is an object with a Symbol.iterator method.'],
    [6.5, 'Calling that method returns an iterator: an object with a next() method.'],
    [12, 'Each call to next() returns an object with a value and a done flag.'],
    [18.5, 'When done is true, the loop stops. Spread, destructuring and Array.from use the same protocol.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const arr = ["a", "b"];', 'for (const x of arr) console.log(x);', '', '// what for...of does underneath:', 'const it = arr[Symbol.iterator]();',
      'it.next();  // { value: "a", done: false }', 'it.next();  // { value: "b", done: false }', 'it.next();  // { value: undefined, done: true }'];
    K.panel(40, 84, 640, 330, 'protocol.js');
    K.code(code, 62, 122, { size: 19, lh: 1.55, n: K.typed(t, code, [0.6, 1.4, 2.4, 6.6, 7.4, 12.4, 14.4, 16.4], 40), t: t, w: 616,
      hi: t > 16.4 ? 7 : t > 14.4 ? 6 : t > 12.4 ? 5 : t > 7.4 ? 4 : t > 1.4 && t < 6.5 ? 1 : -1 });
    var cp = K.p(t, 2.2);
    K.panel(40, 434, 640, 150, 'Console', { a: cp });
    K.text('a', 66, 488, { size: 21, mono: true, a: K.p(t, 2.8, 0.3) });
    K.text('b', 66, 522, { size: 21, mono: true, a: K.p(t, 3.2, 0.3) });
    K.text('then done: true ends the loop', 110, 522, { size: 17, color: P.muted, a: K.p(t, 19) });
    var a = K.p(t, 1);
    K.box(720, 96, 240, 110, { stroke: P.blue, a: a });
    K.text('arr', 740, 124, { size: 22, weight: 700, a: a });
    K.text('iterable', 800, 124, { size: 17, color: P.muted, a: a });
    K.text('[Symbol.iterator]()', 740, 172, { size: 17, mono: true, color: P.green, a: K.p(t, 2) });
    K.arrow(964, 150, 996, 150, { p: K.p(t, 7.8, 0.4), color: P.warm, lw: 2.5, head: 10 });
    var press = Math.max(K.win(t, 12.6, 13.2, 0.15), K.win(t, 14.6, 15.2, 0.15), K.win(t, 16.6, 17.2, 0.15));
    var it = K.p(t, 8);
    K.box(1000, 96, 240, 110, { stroke: P.warm, lw: press > 0.5 ? 3.5 : 2, a: it });
    K.text('it', 1020, 124, { size: 22, weight: 700, a: it });
    K.text('iterator', 1050, 124, { size: 17, color: P.muted, a: it });
    K.chip('next()', 1120, 172, { mono: true, size: 18, stroke: P.warm, color: press > 0.5 ? P.warm : P.ink, a: it, s: 1 - press * 0.1 });
    [['{ value: "a", done: false }', 12.8, P.acc], ['{ value: "b", done: false }', 14.8, P.acc], ['{ value: undefined, done: true }', 16.8, P.red]].forEach(function (r, i) {
      var q = K.back((t - r[1]) / 0.5); if (q <= 0) return;
      K.chip(r[0], 980, 250 + i * 50, { mono: true, size: 18, stroke: r[2], s: q });
    });
    K.text('all use the same protocol', 980, 420, { size: 18, color: P.muted, align: 'center', a: K.p(t, 18.8) });
    [['for...of', 800, 470], ['[...spread]', 960, 470], ['Array.from', 1130, 470], ['destructuring', 860, 530], ['new Map / new Set', 1080, 530]].forEach(function (c, i) {
      K.chip(c[0], c[1], c[2], { size: 18, stroke: P.acc, s: K.back((t - 19.2 - i * 0.3) / 0.5), a: K.p(t, 19.2 + i * 0.3) });
    });
  } },

/* 3 ─ a custom iterable */
{ d: 24, title: 'A custom iterable',
  caps: [
    [0.3, 'Make your own object iterable by adding a Symbol.iterator method.'],
    [6.5, 'Spread calls next() again and again: 1, 2, 3, 4, then done.'],
    [13, 'Plain objects are not iterable, so spreading one into an array throws a TypeError.'],
    [18.5, 'An iterator is single use. Once it is done it stays done, so ask the iterable for a fresh one.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['class Range {', '  constructor(a, b) { this.a = a; this.b = b; }', '  [Symbol.iterator]() {', '    let n = this.a;', '    return { next: () => n <= this.b',
      '      ? { value: n++, done: false }', '      : { value: undefined, done: true } };', '  }', '}', '[...new Range(1, 4)]   // [1, 2, 3, 4]'];
    K.panel(40, 84, 700, 330, 'range.js');
    K.code(code, 62, 120, { size: 19, lh: 1.5, n: K.typed(t, code, [0.5, 0.8, 1.7, 2.15, 2.5, 3.15, 3.8, 4.55, 4.65, 6.6], 55), t: t, w: 676,
      hi: t > 6.6 && t < 13 ? 9 : t > 1.7 && t < 6.5 ? 2 : -1 });
    var st = t < 7.2 ? -1 : Math.min(4, Math.floor((t - 7.2) / 1.1)), rp = K.p(t, 7);
    var n = st < 0 ? 1 : st + 2;
    K.box(780, 96, 460, 130, { stroke: P.warm, a: rp });
    K.chip('n', 820, 130, { mono: true, size: 22, stroke: P.warm, a: rp });
    K.text(String(Math.min(n, 5)), 870, 130, { size: 26, mono: true, color: P.warm, a: rp });
    if (st >= 0) K.text(st < 4 ? '{ value: ' + (st + 1) + ', done: false }' : '{ value: undefined, done: true }', 800, 192, { size: 19, mono: true, color: st < 4 ? P.ink : P.red, a: rp });
    K.text('next() #' + (st + 1), 1220, 130, { size: 17, color: P.muted, align: 'right', a: st >= 0 ? rp : 0 });
    K.box(780, 246, 460, 70, { fill: P.code, stroke: P.line, a: rp });
    var items = st < 0 ? 0 : Math.min(4, st + 1), arr = [];
    for (var i = 1; i <= items; i++) arr.push(i);
    K.text('[' + arr.join(', ') + (st >= 4 ? ']' : ''), 800, 281, { size: 24, mono: true, color: st >= 4 ? P.green : P.ink, a: rp });
    var e = K.p(t, 13.2);
    K.box(780, 336, 460, 90, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: e });
    K.mark(808, 364, false, 0.8, e);
    K.text('[...{ a: 1 }]', 834, 364, { size: 20, mono: true, a: e });
    K.text('TypeError: object is not iterable', 808, 402, { size: 17, color: P.red, a: K.p(t, 13.8) });
    var c2 = ['const it = [1, 2, 3][Symbol.iterator]();', 'it.next();', '[...it];   // [2, 3]', '[...it];   // []  already done'];
    var sp = K.p(t, 18.6);
    K.panel(40, 434, 700, 150, '', { a: sp });
    K.code(c2, 62, 452, { size: 18, lh: 1.5, n: K.typed(t, c2, [18.8, 20.2, 20.8, 21.6], 40), t: t, a: sp });
    K.text('single use: it stays done', 780, 470, { size: 19, color: P.warm, a: K.p(t, 21.8) });
    K.text('fresh one: arr[Symbol.iterator]()', 780, 510, { size: 19, color: P.green, a: K.p(t, 22.4) });
  } },

/* 4 ─ generators */
{ d: 26, title: 'Generators pause',
  caps: [
    [0.3, 'A generator function, written function star, can pause. Calling it runs nothing yet: it returns a generator object.'],
    [7, 'Each next() runs the body until the next yield, hands out that value, and pauses there.'],
    [13.5, 'Local variables and the position are kept while paused. The next call continues from that exact spot.'],
    [19.5, 'At return, done becomes true. Generators are iterators and iterables, so for...of works on them.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function* count() {', '  console.log("start");', '  yield 1;', '  yield 2;', '  return "end";', '}', 'const g = count();'];
    var at = t > 19.9 ? 4 : t > 14.1 ? 3 : t > 8.2 ? 2 : t > 7.5 ? 1 : -1;
    var mk = {}; if (at >= 0) mk[at] = at === 4 ? 'rgba(104,211,145,.18)' : 'rgba(246,173,85,.2)';
    K.panel(40, 84, 600, 290, 'count.js');
    K.code(code, 64, 124, { size: 21, lh: 1.55, n: K.typed(t, code, [0.5, 1.0, 1.7, 2.0, 2.3, 2.7, 3.4], 40), t: t, w: 576, marks: mk, hi: t > 3.4 && t < 7 ? 6 : -1 });
    var cp = K.p(t, 7.2);
    K.panel(40, 394, 600, 190, 'Console', { a: cp });
    [['start', 7.8, P.ink], ['next() → { value: 1, done: false }', 8.4, P.acc], ['next() → { value: 2, done: false }', 14.4, P.acc], ['next() → { value: "end", done: true }', 20.2, P.green]].forEach(function (r, i) {
      K.text(r[0], 64, 436 + i * 38, { size: 18, mono: true, color: r[2], a: K.p(t, r[1], 0.3) });
    });
    var sb = K.p(t, 3.6);
    K.box(700, 96, 540, 120, { stroke: P.purple, a: sb });
    K.text('g  (generator object)', 724, 124, { size: 19, weight: 700, color: P.purple, a: sb });
    var S = [['suspended at the start', 3.6, 7.4, P.muted], ['running…', 7.4, 8.3, P.acc], ['paused at yield 1', 8.3, 14, P.warm], ['running…', 14, 14.2, P.acc], ['paused at yield 2', 14.2, 19.8, P.warm], ['done', 19.9, 40, P.green]];
    S.forEach(function (s) { K.text(s[0], 724, 176, { size: 24, color: s[3], a: K.win(t, s[1], s[2], 0.2) }); });
    var kp = K.p(t, 13.8);
    K.box(700, 236, 540, 130, { fill: P.code, stroke: P.line, a: kp });
    K.text('kept while paused', 724, 264, { size: 17, color: P.muted, weight: 700, a: kp });
    K.text('position: the yield line', 724, 304, { size: 19, mono: true, a: kp });
    K.text('locals: all of them', 724, 340, { size: 19, mono: true, a: kp });
    var fp = K.p(t, 20.6);
    K.panel(700, 386, 540, 198, '', { a: fp });
    K.code(['for (const v of count())', '  console.log(v);', '// start, 1, 2'], 724, 406, { size: 19, lh: 1.55, n: K.typed(t, ['for (const v of count())', '  console.log(v);', '// start, 1, 2'], [20.8, 21.8, 22.4], 36), t: t, a: fp });
    K.text('the return value is not iterated', 724, 556, { size: 17, color: P.warm, a: K.p(t, 23) });
  } },

/* 5 ─ two-way */
{ d: 22, title: 'next(value) and return()',
  caps: [
    [0.3, 'next can also send a value into the generator.'],
    [5.5, 'The first next runs to the first yield. Its argument is ignored, because no yield is waiting yet.'],
    [11.5, 'next(5) resumes the paused yield, which evaluates to 5. So x is 5, and the next yield gives 10.'],
    [17, 'return() ends a generator early and runs its finally blocks. for...of calls it for you when you break.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function* g() {', '  const x = yield 1;', '  console.log("got", x);', '  yield x * 2;', '}', 'const i = g();', 'i.next("ignored");  // { value: 1 }', 'i.next(5);          // got 5, { value: 10 }'];
    K.panel(40, 84, 620, 290, 'twoway.js');
    K.code(code, 64, 124, { size: 20, lh: 1.55, n: K.typed(t, code, [0.5, 0.8, 1.3, 1.9, 2.3, 2.4, 5.8, 11.8], 40), t: t, w: 596,
      hi: t > 11.8 && t < 17 ? 7 : t > 5.8 && t < 11.5 ? 6 : -1, marks: t > 6.4 && t < 12.6 ? { 1: 'rgba(246,173,85,.2)' } : t > 13.6 && t < 17 ? { 3: 'rgba(246,173,85,.2)' } : null });
    var b = K.p(t, 0.8);
    K.box(700, 96, 280, 278, { stroke: P.purple, a: b });
    K.text('generator', 720, 122, { size: 18, weight: 700, color: P.purple, a: b });
    K.box(1000, 96, 240, 278, { stroke: P.acc, a: b });
    K.text('caller', 1020, 122, { size: 18, weight: 700, color: P.acc, a: b });
    var p1 = K.p(t, 6.6, 0.4), p2 = K.p(t, 14, 0.4);
    K.text('paused at yield 1', 720, 170, { size: 19, color: P.warm, a: p1 * (1 - K.p(t, 12.4, 0.3)) });
    K.text('x = 5', 720, 240, { size: 24, mono: true, color: P.green, a: K.p(t, 12.9) });
    K.text('paused at yield x * 2', 720, 170, { size: 19, color: P.warm, a: p2 });
    K.arrow(984, 200, 996, 200, { p: 1, a: 0 });
    var o1 = K.p(t, 6.6, 0.8);
    if (t > 6.6) K.chip('1', 860 + o1 * 230, 200, { mono: true, size: 22, stroke: P.warm, color: P.warm, a: 1 - K.p(t, 11, 0.4) });
    var ig = K.p(t, 6.2, 0.4);
    K.chip('"ignored"', 1120, 300, { mono: true, size: 18, stroke: P.red, color: P.red, a: ig * (1 - K.p(t, 9, 0.5)) });
    K.mark(1210, 300, false, 0.7, K.win(t, 7.4, 9.4));
    K.text('no yield waiting', 1120, 340, { size: 16, color: P.red, align: 'center', a: K.win(t, 7.6, 9.6) });
    var in5 = K.p(t, 12.2, 0.7);
    if (t > 12.2) K.chip('5', 1120 - in5 * 260, 300, { mono: true, size: 22, stroke: P.green, color: P.green, a: 1 - K.p(t, 13.2, 0.3) });
    var o2 = K.p(t, 14.2, 0.8);
    if (t > 14.2) K.chip('10', 860 + o2 * 230, 200, { mono: true, size: 22, stroke: P.warm, color: P.warm });
    K.text('got 5', 1020, 250, { size: 19, mono: true, color: P.muted, a: K.p(t, 13.2) });
    var r = K.p(t, 17.2);
    K.panel(40, 394, 1200, 190, '', { a: r });
    var c2 = ['i.return("bye");   // runs finally, { value: "bye", done: true }', 'for (const v of g()) break;   // break calls return() for you'];
    K.code(c2, 64, 420, { size: 20, lh: 1.7, n: K.typed(t, c2, [17.4, 19.4], 40), t: t, a: r });
    K.text('cleanup in finally always runs', 64, 540, { size: 18, color: P.green, a: K.p(t, 20.6) });
  } },

/* 6 ─ lazy and infinite */
{ d: 22, title: 'Lazy, even infinite',
  caps: [
    [0.3, 'Generators are lazy, so a sequence can be infinite. while true never hangs if you only pull what you need.'],
    [7, 'take pulls three values, then returns. Leaving its loop calls return() on naturals, so it stops too.'],
    [14, 'But spreading naturals() directly would never finish, and would freeze the tab.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function* naturals() {', '  let n = 1;', '  while (true) yield n++;', '}', 'function* take(it, k) {', '  for (const x of it) {', '    if (k-- <= 0) return;', '    yield x;', '  }', '}', '[...take(naturals(), 3)]  // [1, 2, 3]'];
    K.panel(40, 84, 600, 390, 'lazy.js');
    K.code(code, 64, 124, { size: 20, lh: 1.55, n: K.typed(t, code, [0.5, 1.0, 1.3, 2.0, 2.2, 2.7, 3.2, 3.8, 4.1, 4.3, 7.2], 45), t: t, w: 576, hi: t > 2.0 && t < 6.8 ? 2 : t > 7.2 && t < 14 ? 10 : -1 });
    var pulls = t < 7.8 ? 0 : Math.min(3, Math.floor((t - 7.8) / 1.1) + 1), u = (t - 7.8) % 1.1 / 1.1, done0 = K.p(t, 11.1, 0.3), done = K.p(t, 11.4);
    var a = K.p(t, 1);
    K.box(700, 96, 240, 100, { stroke: P.purple, a: a });
    K.text('naturals()', 720, 124, { size: 20, mono: true, weight: 700, a: a });
    K.text('n: ' + (pulls + 1), 720, 164, { size: 20, mono: true, color: P.warm, a: a * (1 - done0) });
    K.text('closed by return()', 720, 164, { size: 18, color: P.muted, a: done });
    var b = K.p(t, 4.6);
    K.box(1000, 96, 240, 100, { stroke: P.acc, a: b });
    K.text('take(…, 3)', 1020, 124, { size: 20, mono: true, weight: 700, a: b });
    K.text('left: ' + (3 - pulls), 1020, 164, { size: 20, mono: true, color: P.acc, a: b * (1 - done0) });
    K.text('returned', 1020, 164, { size: 18, color: P.muted, a: done });
    if (pulls > 0 && t < 11.1) K.chip(String(pulls), 880 + Math.min(1, u * 1.5) * 240, 230, { mono: true, size: 22, stroke: P.warm, color: P.warm });
    K.arrow(1000, 180, 944, 180, { p: K.p(t, 11.4, 0.4), color: P.red, dash: [5, 5], lw: 2.5, head: 10 });
    K.text('return()', 972, 212, { size: 16, mono: true, color: P.red, align: 'center', a: K.win(t, 11.6, 14) });
    var o = K.p(t, 7.6);
    K.box(700, 266, 540, 80, { fill: P.code, stroke: P.line, a: o });
    var arr = []; for (var i = 1; i <= pulls; i++) if (t > 7.8 + (i - 1) * 1.1 + 0.8) arr.push(i);
    K.text('[' + arr.join(', ') + (done > 0.5 ? ']' : ''), 724, 306, { size: 26, mono: true, color: done > 0.5 ? P.green : P.ink, a: o });
    K.text('only 3 values were ever computed', 700, 380, { size: 19, color: P.green, a: K.p(t, 12.4) });
    var w = K.p(t, 14.3);
    K.box(700, 420, 540, 150, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: w });
    K.mark(730, 460, false, 0.85, w);
    K.text('[...naturals()]', 758, 460, { size: 24, mono: true, a: w });
    K.text('never finishes: the tab freezes', 730, 520, { size: 20, color: P.red, a: K.p(t, 15) });
  } },

/* 7 ─ iterator helpers */
{ d: 26, title: 'Iterator helpers',
  caps: [
    [0.3, 'ES2025 iterator helpers give every iterator map, filter, take, drop, reduce, toArray and more.'],
    [6.5, 'They are lazy: nothing runs until toArray pulls. Each value flows through the whole chain before the next one starts.'],
    [14, 'take(3) stops after three results, so the infinite source is never fully consumed.'],
    [19.5, 'Arrays are not iterators: call values() first. Helpers work in current browsers and in Node 22 and later.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['naturals()', '  .filter((n) => n % 2)', '  .map((n) => n * 10)', '  .take(3)', '  .toArray();   // [10, 30, 50]'];
    K.panel(40, 84, 620, 210, 'helpers.js');
    K.code(code, 64, 124, { size: 21, lh: 1.5, n: K.typed(t, code, [0.5, 1.0, 1.8, 2.5, 2.9], 36), t: t });
    var M = [['map', 760, 130], ['filter', 870, 130], ['take', 980, 130], ['drop', 1080, 130], ['flatMap', 1185, 130], ['reduce', 780, 190], ['toArray', 900, 190], ['forEach', 1020, 190], ['find', 1130, 190], ['some · every', 810, 250], ['Iterator.from()', 1040, 250]];
    M.forEach(function (m, i) { K.chip(m[0], m[1], m[2], { mono: true, size: 17, stroke: P.acc, s: K.back((t - 0.8 - i * 0.2) / 0.5), a: K.p(t, 0.8 + i * 0.2) }); });
    var S = [['naturals()', 140], ['filter(odd)', 420], ['map(×10)', 700], ['take(3)', 980]];
    var sp = K.p(t, 6.4);
    S.forEach(function (s, i) {
      K.box(s[1] - 100, 330, 200, 56, { stroke: i === 3 && t > 14 ? P.green : P.purple, a: sp });
      K.text(s[0], s[1], 358, { size: 19, mono: true, align: 'center', a: sp });
      if (i) K.arrow(S[i - 1][1] + 104, 358, s[1] - 104, 358, { p: sp, color: P.muted, lw: 2, head: 9 });
    });
    K.box(1090, 330, 150, 56, { fill: P.code, stroke: P.green, a: sp });
    K.curve(1160, 326, 650, 250, 140, 326, { p: K.p(t, 6.8, 0.8), color: P.warm, dash: [6, 6], lw: 2, a: K.win(t, 6.8, 13.5) * 0.8 });
    K.text('toArray() pulls', 650, 314, { size: 16, color: P.warm, align: 'center', a: K.win(t, 7.2, 13.5) });
    var X = [140, 420, 700, 980, 1165], out = [], taken = 0;
    for (var k = 0; k < 5; k++) {
      var v = k + 1, st = 7.4 + k * 1.3, u = (t - st) / 1.3, odd = v % 2 === 1;
      if (u < 0) continue;
      if (odd && u >= 1) { out.push(v * 10); taken++; continue; }
      if (u >= 1) continue;
      var seg = Math.min(3, Math.floor(u * 4)), f = u * 4 - seg, x;
      if (!odd && u > 0.25) { x = X[1]; K.chip(String(v), x, 440, { mono: true, size: 20, stroke: P.red, color: P.red, a: 1 - (u - 0.25) / 0.75 }); K.mark(x + 40, 440, false, 0.7, 1 - (u - 0.25) / 0.75); continue; }
      x = X[seg] + (X[seg + 1] - X[seg]) * K.ease(f);
      K.chip(String(u > 0.5 ? v * 10 : v), x, 440, { mono: true, size: 20, stroke: u > 0.5 ? P.green : P.warm, color: u > 0.5 ? P.green : P.warm });
    }
    K.text('[' + out.join(', ') + (taken >= 3 ? ']' : ''), 1165, 358, { size: 18, mono: true, align: 'center', a: sp });
    K.text('taken: ' + taken + ' of 3', 980, 490, { size: 17, color: P.muted, align: 'center', a: K.p(t, 7.4) });
    K.text('done: the source is never asked for 6', 640, 490, { size: 17, color: P.green, align: 'center', a: K.p(t, 14.3) });
    var e = K.p(t, 19.8);
    K.panel(40, 516, 1200, 68, '', { a: e });
    K.code(['[5, 6, 7].values().drop(1).toArray();   // [6, 7]'], 64, 538, { size: 19, n: K.typed(t, ['[5, 6, 7].values().drop(1).toArray();   // [6, 7]'], [20], 40), t: t, a: e });
    K.chip('Chrome · Firefox · Safari · Node 22+', 1050, 550, { size: 17, stroke: P.green, a: K.p(t, 21.4) });
  } },

/* 8 ─ async generators */
{ d: 21, title: 'Async generators',
  caps: [
    [0.3, 'Async generators combine await and yield. They are perfect for paginated APIs and streams.'],
    [7, 'for await...of waits for each page before the next loop turn, so only one request runs at a time.'],
    [13.5, 'Break out early, and the remaining pages are never fetched.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['async function* pages(url) {', '  let next = url;', '  while (next) {', '    const res = await fetch(next);', '    const body = await res.json();', '    yield body.items;', '    next = body.nextPage;', '  }', '}',
      'for await (const items of pages("/api/users")) {', '  render(items);', '}'];
    K.panel(40, 84, 660, 410, 'pages.js');
    K.code(code, 62, 122, { size: 19, lh: 1.55, n: K.typed(t, code, [0.5, 1.0, 1.3, 1.6, 2.3, 3.0, 3.4, 3.9, 4.0, 7.2, 8.2, 8.5], 55), t: t, w: 636,
      hi: t > 7.2 && t < 13.5 ? 9 : t > 3 && t < 7 ? 5 : -1 });
    var tl = K.p(t, 7.4);
    K.text('network', 740, 114, { size: 17, weight: 700, color: P.blue, a: tl });
    K.text('loop body', 740, 214, { size: 17, weight: 700, color: P.green, a: tl });
    K.box(740, 290, 500, 3, { fill: P.line, r: 1, a: tl });
    K.text('time →', 1240, 312, { size: 16, color: P.muted, align: 'right', a: tl });
    var B = [[740, 100, 156, 'page 1', 7.8, P.blue], [850, 70, 256, 'render', 8.8, P.green], [930, 100, 156, 'page 2', 9.6, P.blue], [1040, 70, 256, 'render', 10.6, P.green]];
    B.forEach(function (b) {
      var q = K.p(t, b[4], 0.6);
      K.box(b[0], b[2] - 20, b[1] * q, 40, { fill: b[5] === P.blue ? 'rgba(99,179,237,.25)' : 'rgba(104,211,145,.25)', stroke: b[5], r: 6, a: K.clamp(q * 3) });
      K.text(b[3], b[0] + b[1] / 2, b[2], { size: 16, align: 'center', a: K.p(t, b[4] + 0.4) });
    });
    var g3 = K.p(t, 13.8);
    K.box(1120, 136, 100, 40, { fill: false, stroke: P.red, dash: [5, 5], r: 6, a: g3 });
    K.text('page 3', 1170, 156, { size: 16, color: P.red, align: 'center', a: g3 });
    K.mark(1222, 136, false, 0.7, g3);
    K.text('one request at a time, in order', 740, 360, { size: 18, color: P.muted, a: K.p(t, 11.2) });
    var br = K.p(t, 14.2);
    K.box(740, 400, 500, 94, { fill: P.code, stroke: P.red, a: br });
    K.text('if (enough) break;', 764, 430, { size: 19, mono: true, a: br });
    K.text('return() closes the generator: no more fetches', 764, 466, { size: 17, color: P.red, a: K.p(t, 14.8) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 9 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Iterables have [Symbol.iterator](); iterators have next()',
     'for...of, spread and destructuring all use the protocol',
     'function* pauses at yield; next(v) resumes and sends v in',
     'Generators make lazy, even infinite, sequences',
     'Lazy iterator helpers, and for await for async sources'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 9 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
