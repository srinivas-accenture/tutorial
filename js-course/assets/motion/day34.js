/* Day 34 in motion: EventEmitter, LRU cache, token bucket and Observable, then the algorithm patterns (hash map, sliding window, dynamic programming). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day34', {
  kicker: 'JavaScript: Zero to Architect · Day 34',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 34: the classic classes interviewers ask for, and the patterns behind most algorithm questions.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Classes & patterns', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 34 · Classic classes and algorithm patterns', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['EventEmitter · LRU', 'Rate limiter · Observable', 'Algorithm patterns'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 370 + i * 270, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ EventEmitter */
{ d: 25, title: 'EventEmitter',
  caps: [
    [0.3, 'An EventEmitter is a doorbell many people can listen to: a Map from event name to a list of listeners.'],
    [7, 'on adds a listener and returns an unsubscribe function. emit calls every listener for that name, with the arguments.'],
    [13.5, 'Copy the list before emitting. If listener a unsubscribes itself mid-loop, the array shifts and b is silently skipped.'],
    [20, 'once wraps the listener in a function that removes itself first, then calls the original.']],
  draw: function (K, t) {
    var P = K.P, code = ['class Emitter {', '  #h = new Map();', '  on(type, fn) {', '    const list = this.#h.get(type) ?? [];', '    this.#h.set(type, list); list.push(fn);',
      '    return () => this.off(type, fn);', '  }', '  off(type, fn) {', '    const list = this.#h.get(type) ?? [];', '    const i = list.indexOf(fn); if (i >= 0) list.splice(i, 1);',
      '  }', '  emit(type, ...args) {', '    for (const f of [...(this.#h.get(type) ?? [])]) f(...args);', '  }', '}'];
    var hi = t > 13.7 && t < 19.6 ? 12 : t > 10 && t < 13.3 ? 12 : t > 7.2 && t < 10 ? 5 : t > 1 && t < 6.8 ? 1 : -1;
    K.panel(40, 76, 640, 400, 'Emitter.js');
    K.code(code, 62, 114, { size: 17, lh: 1.38, n: K.typed(t, code, [0.4, 0.8, 1.2, 1.6, 2.2, 2.8, 3.3, 3.4, 3.8, 4.4, 5.2, 5.3, 5.7, 6.5, 6.6], 56), t: t, hi: hi, w: 616 });
    var m = K.p(t, 1.2);
    K.box(720, 76, 520, 170, { stroke: P.purple, a: m });
    K.text('#h (Map)', 744, 102, { size: 17, weight: 700, color: P.purple, a: m });
    K.chip('"ring"', 790, 160, { mono: true, size: 19, stroke: P.purple, a: K.p(t, 1.8) });
    K.arrow(838, 160, 880, 160, { p: K.p(t, 2.2, 0.4), head: 9, lw: 2 });
    ['a', 'b', 'c'].forEach(function (s, i) {
      var q = K.back((t - 7.6 - i * 0.7) / 0.5), x = 930 + i * 90;
      var glow = K.win(t, 10.2 + i * 0.7, 10.9 + i * 0.7, 0.2);
      if (q > 0) K.chip(s, x, 160, { s: q, mono: true, size: 22, stroke: glow > 0.3 ? P.warm : P.acc, color: glow > 0.3 ? P.warm : P.ink });
      K.text(s + '(1)', x, 212, { size: 17, mono: true, color: P.green, align: 'center', a: K.p(t, 10.4 + i * 0.7) });
    });
    K.text('emit("ring", 1)', 1216, 102, { size: 17, mono: true, color: P.warm, align: 'right', a: K.p(t, 9.8) });
    /* the skipped-listener bug */
    var b = K.p(t, 13.7);
    K.box(720, 266, 520, 320, { fill: P.code, stroke: P.line, a: b });
    K.text('a unsubscribes itself during emit', 744, 292, { size: 17, color: P.muted, a: b });
    K.text('no copy', 744, 340, { size: 18, weight: 700, color: P.red, a: b });
    var gone = K.p(t, 15, 0.5), slide = K.p(t, 15.6, 0.6), ptr = K.p(t, 16.4, 0.5);
    K.box(850, 316, 70, 48, { stroke: P.line, fill: false, dash: [5, 5], a: b }); K.box(930, 316, 70, 48, { stroke: P.line, fill: false, dash: [5, 5], a: b });
    K.text('[0]', 885, 380, { size: 16, color: P.muted, align: 'center', a: b }); K.text('[1]', 965, 380, { size: 16, color: P.muted, align: 'center', a: b });
    K.chip('a', 885, 340, { mono: true, size: 20, stroke: P.acc, a: b * (1 - gone) });
    K.chip('b', 965 - slide * 80, 340, { mono: true, size: 20, stroke: P.acc, a: b });
    K.text('▲ i', 885 + ptr * 80, 404, { size: 18, color: P.warm, align: 'center', a: K.p(t, 14.2) });
    K.mark(1060, 340, false, 0.75, K.p(t, 17)); K.text('b skipped', 1084, 340, { size: 18, color: P.red, a: K.p(t, 17) });
    var c = K.p(t, 17.8);
    K.text('[...list]', 744, 470, { size: 18, mono: true, weight: 700, color: P.green, a: c });
    K.chip('a', 885, 470, { mono: true, size: 20, stroke: P.green, a: c }); K.chip('b', 965, 470, { mono: true, size: 20, stroke: P.green, a: c });
    K.mark(1060, 470, true, 0.75, K.p(t, 18.6)); K.text('both run', 1084, 470, { size: 18, color: P.green, a: K.p(t, 18.6) });
    K.text('snapshot: later changes do not affect this loop', 744, 530, { size: 16, color: P.muted, a: K.p(t, 19) });
    var o = K.p(t, 20.2);
    K.box(40, 494, 640, 92, { fill: P.code, stroke: P.acc, a: o });
    K.code(['once(type, fn) { const w = (...a) => {', '  this.off(type, w); fn(...a); }; return this.on(type, w); }'], 62, 506, { size: 17, lh: 1.4, a: o });
  } },

/* 3 ─ LRU */
{ d: 26, title: 'LRU cache',
  caps: [
    [0.3, 'An LRU cache is a small desk. When it is full, throw away whatever you have not touched for the longest time.'],
    [7, 'A Map remembers insertion order. On get, delete the key and set it again, so it moves to the most recent end.'],
    [13.5, 'On set, if the size goes over capacity, delete the first key: map dot keys, dot next, dot value. Both operations are O of 1.'],
    [20, 'So with capacity 2: set a, set b, get a, set c. b is the least recently used, so b is evicted and get b returns undefined.']],
  draw: function (K, t) {
    var P = K.P, code = ['class LRU {', '  constructor(max) { this.max = max; this.map = new Map(); }', '  get(k) {', '    if (!this.map.has(k)) return undefined;', '    const v = this.map.get(k);',
      '    this.map.delete(k); this.map.set(k, v);', '    return v;', '  }', '  set(k, v) {', '    this.map.delete(k); this.map.set(k, v);', '    if (this.map.size > this.max)',
      '      this.map.delete(this.map.keys().next().value);', '  }', '}'];
    var hi = t > 13.7 && t < 19.6 ? 11 : t > 7.2 && t < 13.3 ? 5 : -1;
    K.panel(40, 76, 620, 380, 'LRU.js');
    K.code(code, 62, 116, { size: 17, lh: 1.38, n: K.typed(t, code, [0.4, 0.7, 1.9, 2.2, 2.9, 3.4, 4.1, 4.4, 4.5, 4.9, 5.5, 6, 6.8, 6.9], 56), t: t, hi: hi, w: 592 });
    var a = K.p(t, 0.8);
    K.box(700, 76, 540, 260, { stroke: P.acc, a: a });
    K.text('map  (max = 2)', 724, 104, { size: 18, weight: 700, color: P.acc, a: a });
    K.text('least recent', 760, 146, { size: 16, color: P.muted, align: 'center', a: a });
    K.text('most recent →', 1020, 146, { size: 16, color: P.muted, align: 'center', a: a });
    [0, 1].forEach(function (s) { K.box(700 + 60 + s * 130 - 55, 176, 110, 70, { fill: false, stroke: P.line, dash: [6, 5], a: a }); });
    K.box(1020 - 55, 176, 110, 70, { fill: false, stroke: P.red, dash: [6, 5], a: K.win(t, 14.6, 17.4) });
    K.text('over capacity', 1020, 268, { size: 16, color: P.red, align: 'center', a: K.win(t, 14.8, 17.4) });
    function at(fr) { var v = fr[0][1]; for (var i = 1; i < fr.length; i++) v += (fr[i][1] - v) * K.p(t, fr[i][0], 0.6); return v; }
    var keys = [['a', [[0, 0], [8, 1], [16.6, 0]], 1.8, 99], ['b', [[0, 1]], 2.4, 15.8], ['c', [[0, 2], [16.6, 1]], 14.6, 99]];
    keys.forEach(function (k) {
      var x = 760 + at(k[1]) * 130, q = K.back((t - k[2]) / 0.5), out = K.p(t, k[3], 0.6);
      if (q <= 0) return;
      K.chip(k[0], x, 211 + out * 40, { s: q, mono: true, size: 26, stroke: out > 0 ? P.red : P.acc, a: 1 - out });
    });
    K.text('get("a"): delete + set → moves to the end', 724, 306, { size: 16, color: P.green, a: K.win(t, 8.4, 13.4) });
    K.text('keys().next().value = "b" → evicted', 724, 306, { size: 16, color: P.red, a: K.p(t, 16) });
    var L = [['set("a", 1)', 1.8], ['set("b", 2)', 2.4], ['get("a") → 1', 7.6], ['set("c", 3)', 14.2], ['get("b") → undefined', 21.4]];
    K.box(700, 356, 540, 230, { fill: P.code, stroke: P.line, a: K.p(t, 1.6) });
    K.text('operations', 724, 382, { size: 16, weight: 700, color: P.muted, a: K.p(t, 1.6) });
    L.forEach(function (l, i) {
      K.text(l[0], 724, 418 + i * 36, { size: 19, mono: true, color: i === 4 ? P.red : P.ink, a: K.p(t, l[1], 0.4) });
    });
    K.chip('O(1) get · O(1) set', 350, 520, { size: 20, stroke: P.green, color: P.green, a: K.p(t, 18.4) });
  } },

/* 4 ─ token bucket */
{ d: 26, title: 'Rate limiter: token bucket',
  caps: [
    [0.3, 'A token bucket limits requests. It holds up to capacity tokens, and each request spends one. Empty bucket, request refused.'],
    [7, 'Tokens refill at a steady rate, based on the time elapsed since the last request, and never above the capacity.'],
    [13.5, 'Inject the clock instead of calling Date dot now inside, so a test can move time forward exactly.'],
    [19.5, 'A fixed window allows double bursts around the window edge. The bucket allows short bursts, but a smooth average.']],
  draw: function (K, t) {
    var P = K.P, code = ['class TokenBucket {', '  constructor(cap, perSec, now = () => Date.now()) {', '    this.cap = cap; this.perSec = perSec; this.now = now;', '    this.tokens = cap; this.last = now();', '  }',
      '  take() {', '    const t = this.now();', '    this.tokens = Math.min(this.cap,', '      this.tokens + ((t - this.last) / 1000) * this.perSec);', '    this.last = t;',
      '    if (this.tokens < 1) return false;', '    this.tokens -= 1; return true;', '  }', '}'];
    var hi = t > 13.7 && t < 19.3 ? 1 : t > 7.2 && t < 13.3 ? 8 : t > 2 && t < 6.8 ? 11 : -1;
    K.panel(40, 76, 640, 390, 'TokenBucket.js');
    K.code(code, 62, 114, { size: 17, lh: 1.4, n: K.typed(t, code, [0.4, 0.7, 1.5, 2.3, 2.9, 3, 3.3, 3.7, 4.3, 5.3, 5.6, 6.2, 6.8, 6.9], 60), t: t, hi: hi, w: 612 });
    var a = K.p(t, 0.8);
    K.box(720, 76, 520, 300, { stroke: P.line, a: a });
    K.text('cap = 3, 1 token per second', 744, 102, { size: 17, color: P.muted, a: a });
    var clk = t < 8 ? 0 : t < 9.6 ? Math.round(K.clamp((t - 8) / 1.4) * 1000 / 50) * 50 : 1000;
    K.text('now() = ' + clk + ' ms', 1216, 102, { size: 18, mono: true, color: P.blue, align: 'right', a: K.p(t, 7.6) });
    /* bucket */
    var g = K.g; g.save(); g.globalAlpha *= a; g.strokeStyle = P.acc; g.lineWidth = 3; g.beginPath(); g.moveTo(770, 150); g.lineTo(780, 350); g.lineTo(920, 350); g.lineTo(930, 150); g.stroke(); g.restore();
    var takes = [[2.6, true], [3.4, true], [4.2, true], [5.2, false], [11.2, true]];
    var tokens = 3; takes.forEach(function (k) { if (t >= k[0] && k[1]) tokens -= 1; });
    if (t >= 9.6) tokens += 1;
    for (var i = 0; i < 3; i++) {
      var present = i < tokens, drip = i === tokens - 1 && t >= 9.6 && t < 11.2 ? K.p(t, 9.6, 0.6) : 1;
      if (!present) continue;
      var y = 322 - i * 56 - (1 - drip) * 150;
      g.save(); g.globalAlpha *= a * drip; g.fillStyle = P.warm; g.beginPath(); g.arc(850, y, 22, 0, 7); g.fill(); g.restore();
    }
    K.text('+1 after 1000 ms', 850, 130, { size: 16, color: P.warm, align: 'center', a: K.win(t, 9.4, 12.6) });
    takes.forEach(function (k, j) {
      var q = K.p(t, k[0], 0.3), y = 160 + j * 42;
      K.text('take()', 980, y, { size: 19, mono: true, a: q });
      K.mark(1080, y, k[1], 0.7, q);
      K.text(k[1] ? 'ok' : 'refused', 1104, y, { size: 18, color: k[1] ? P.green : P.red, a: q });
    });
    var c = K.p(t, 13.8);
    K.box(40, 486, 640, 100, { fill: P.code, stroke: P.blue, a: c });
    K.code(['let clock = 0;', 'const tb = new TokenBucket(3, 1, () => clock);   clock += 1000;'], 62, 500, { size: 17, lh: 1.5, a: c });
    K.text('tests control time: no sleeping, no flakiness', 62, 568, { size: 16, color: P.blue, a: K.p(t, 15.6) });
    /* fixed window vs bucket */
    var f = K.p(t, 19.7);
    K.box(720, 396, 520, 190, { fill: P.code, stroke: P.line, a: f });
    K.text('fixed window', 744, 424, { size: 17, weight: 700, color: P.red, a: f });
    K.box(990, 438, 2, 60, { fill: P.muted, r: 1, a: f });
    K.text('window edge', 990, 512, { size: 16, color: P.muted, align: 'center', a: f });
    for (var r = 0; r < 6; r++) K.box(930 + r * 9 + (r > 2 ? 18 : 0), 452, 5, 34, { fill: P.red, r: 2, a: K.p(t, 20.2 + r * 0.15) });
    K.text('2× burst', 1110, 468, { size: 17, color: P.red, a: K.p(t, 21.2) });
    K.text('token bucket', 744, 552, { size: 17, weight: 700, color: P.green, a: K.p(t, 21.8) });
    for (var s = 0; s < 8; s++) K.box(900 + (s < 3 ? s * 9 : 27 + (s - 2) * 44), 538, 5, 30, { fill: P.green, r: 2, a: K.p(t, 22 + s * 0.12) });
  } },

/* 5 ─ Observable */
{ d: 26, title: 'Observable',
  caps: [
    [0.3, 'An Observable is a lazy stream: a function that receives an observer and returns a cleanup. Nothing runs until you subscribe.'],
    [7.5, 'Operators like filter and map return new Observables that subscribe to the source. Here 1 to 4 becomes 20 and 40.'],
    [14, 'unsubscribe must run the cleanup, clearing timers and listeners, or the stream keeps running and leaks.'],
    [19.5, 'Versus a Promise: a Promise is eager, settles once and cannot be cancelled. An Observable is lazy, many values, cancellable.']],
  draw: function (K, t) {
    var P = K.P, code = ['const tick = new Observable((obs) => {', '  let n = 0;', '  const id = setInterval(() => obs.next(n++), 1000);', '  return () => clearInterval(id);   // cleanup', '});',
      'const sub = tick.subscribe((v) => console.log(v));', 'sub.unsubscribe();   // runs the cleanup'];
    var hi = t > 14.2 && t < 19.3 ? 3 : t > 2.5 && t < 7 ? 5 : -1;
    K.panel(40, 76, 660, 250, 'observable.js');
    K.code(code, 62, 118, { size: 18, lh: 1.45, n: K.typed(t, code, [0.4, 1.2, 1.5, 2.4, 3.2, 3.4, 15], 50), t: t, hi: hi, w: 630 });
    var l = K.p(t, 1.4) * (1 - K.p(t, 19.6, 0.5));
    K.box(730, 76, 510, 250, { stroke: P.acc, a: l });
    K.text('lifecycle', 754, 104, { size: 17, weight: 700, color: P.acc, a: l });
    K.text('created: nothing runs yet', 754, 146, { size: 18, color: P.muted, a: l * K.p(t, 1.8) });
    K.text('subscribe()', 754, 190, { size: 18, mono: true, a: l * K.p(t, 3.6) });
    [0, 1, 2].forEach(function (v, i) { K.chip(String(v), 920 + i * 56, 190, { mono: true, size: 18, stroke: P.blue, a: l * K.p(t, 4.2 + i * 0.6) }); });
    K.text('unsubscribe()', 754, 240, { size: 18, mono: true, a: l * K.p(t, 15.2) });
    K.mark(926, 240, true, 0.7, l * K.p(t, 16)); K.text('clearInterval(id)', 950, 240, { size: 17, mono: true, color: P.green, a: l * K.p(t, 16) });
    K.mark(768, 290, false, 0.7, l * K.p(t, 17.2)); K.text('no cleanup → timer leaks forever', 792, 290, { size: 17, color: P.red, a: l * K.p(t, 17.2) });
    var v = K.p(t, 19.8);
    K.box(730, 76, 510, 250, { stroke: P.purple, a: v });
    [['', 'Promise', 'Observable'], ['starts', 'eagerly', 'on subscribe'], ['values', 'one', 'zero or more'], ['cancel', 'no', 'unsubscribe']].forEach(function (r, i) {
      var y = 112 + i * 54, q = K.p(t, 20 + i * 0.8, 0.4), w = i === 0 ? 700 : 400;
      K.text(r[0], 754, y, { size: 18, color: P.muted, weight: w, a: q });
      K.text(r[1], 900, y, { size: 19, weight: w, a: q });
      K.text(r[2], 1060, y, { size: 19, weight: w, color: i ? P.acc : P.ink, a: q });
    });
    /* marbles */
    var m = K.p(t, 7.6);
    K.box(40, 346, 1200, 240, { fill: P.code, stroke: P.line, a: m });
    var lanes = [['of(1, 2, 3, 4)', [1, 2, 3, 4], 8], ['.filter((x) => x % 2 === 0)', [null, 2, null, 4], 9.8], ['.map((x) => x * 10)', [null, 20, null, 40], 11.6]];
    lanes.forEach(function (ln, i) {
      var y = 392 + i * 72, q = K.p(t, ln[2] - 0.4);
      K.text(ln[0], 64, y, { size: 18, mono: true, a: q });
      K.box(420, y - 1, 760, 2, { fill: P.line, r: 1, a: q });
      K.arrow(1170, y, 1196, y, { p: q, head: 9, lw: 2 });
      ln[1].forEach(function (val, k) {
        if (val == null) return;
        var s = K.back((t - ln[2] - k * 0.35) / 0.4); if (s <= 0) return;
        K.chip(String(val), 520 + k * 170, y, { s: s, mono: true, size: 19, stroke: i === 2 ? P.green : P.blue, color: i === 2 ? P.green : P.ink });
      });
    });
  } },

/* 6 ─ pattern map */
{ d: 26, title: 'Algorithm patterns',
  caps: [
    [0.3, 'Most algorithm questions are old puzzles in disguise. About ten patterns cover the majority. Name the pattern first, then code.'],
    [7.5, 'Lookups, counting or complements: a hash map. Sorted data or pairs: two pointers, or binary search.'],
    [13.5, 'Longest or shortest stretch with a rule: a sliding window. Matching brackets: a stack. Trees, graphs and grids: BFS or DFS.'],
    [19.5, 'Overlapping subproblems: dynamic programming. All subsets or permutations: backtracking, which is exponential.']],
  draw: function (K, t) {
    var P = K.P, intro = K.win(t, 0.4, 7.4, 0.5);
    [['problem', P.line], ['name the pattern', P.warm], ['code', P.green]].forEach(function (b, i) {
      var q = K.back((t - 1 - i * 1.2) / 0.5) * intro; if (q <= 0) return;
      K.chip(b[0], 300 + i * 340, 300, { s: q, size: 26, stroke: b[1] });
      if (i) K.arrow(300 + (i - 1) * 340 + 120, 300, 300 + i * 340 - 130, 300, { p: K.p(t, 0.8 + i * 1.2, 0.4), a: intro });
    });
    K.text('about ten patterns cover most questions', 640, 380, { size: 20, color: P.muted, align: 'center', a: intro * K.p(t, 4) });
    var C = [['Hash map / Set', 'lookups, counting,', 'complements', 'O(n)', 7.8],
             ['Two pointers', 'sorted arrays, pairs,', 'palindromes', 'O(n)', 9.8],
             ['Binary search', 'sorted data or a', 'monotonic answer', 'O(log n)', 11.2],
             ['Sliding window', 'longest / shortest', 'stretch with a rule', 'O(n)', 13.8],
             ['Stack', 'matching brackets,', 'undo, monotonic', 'O(n)', 15.8],
             ['BFS / DFS', 'trees, graphs, grids;', 'BFS: shortest path', 'O(V + E)', 17.2],
             ['Dynamic programming', 'overlapping', 'subproblems', 'often O(n·m)', 19.8],
             ['Backtracking', 'subsets, permutations,', 'combinations', 'exponential', 21.6]];
    C.forEach(function (c, i) {
      var x = 40 + (i % 4) * 302, y = 90 + Math.floor(i / 4) * 250, q = K.back((t - c[4]) / 0.5);
      if (q <= 0) return;
      var hot = i >= 6;
      K.g.save(); K.g.translate(x + 141, y + 110); K.g.scale(q, q); K.g.translate(-x - 141, -y - 110);
      K.box(x, y, 282, 220, { stroke: hot ? P.warm : P.acc, a: K.clamp(q) });
      K.text(c[0], x + 20, y + 36, { size: 22, weight: 700, color: hot ? P.warm : P.acc, a: K.clamp(q) });
      K.text(c[1], x + 20, y + 86, { size: 18, color: P.muted, a: K.clamp(q) });
      K.text(c[2], x + 20, y + 114, { size: 18, color: P.muted, a: K.clamp(q) });
      K.text(c[3], x + 20, y + 180, { size: 22, mono: true, weight: 700, color: i === 7 ? P.red : P.green, a: K.clamp(q) });
      K.g.restore();
    });
  } },

/* 7 ─ two sum */
{ d: 26, title: 'Hash map: two sum',
  caps: [
    [0.3, 'The hash map pattern in action: two sum. The brute force checks every pair, which is O of n squared.'],
    [6.5, 'The phone book trick: walk once, and for each number ask, have I already seen the partner I need?'],
    [12, '3 needs 11: not seen, so write 3 down. 8 needs 6: not seen, write 8 down. 11 needs 3: seen, at index 0.'],
    [19.5, 'Answer: indexes 0 and 2, in a single pass. O of n time, and O of n extra space for the Map.']],
  draw: function (K, t) {
    var P = K.P, code = ['function twoSum(nums, target) {', '  const seen = new Map();   // value → index', '  for (let i = 0; i < nums.length; i++) {', '    const need = target - nums[i];',
      '    if (seen.has(need)) return [seen.get(need), i];', '    seen.set(nums[i], i);', '  }', '  return null;', '}'];
    var step = t < 12.6 ? -1 : t < 14.8 ? 0 : t < 17 ? 1 : 2;
    var hi = step === 2 ? 4 : step >= 0 ? (t - [12.6, 14.8][step] < 1 ? 3 : 5) : t > 7 ? 4 : -1;
    K.panel(40, 76, 620, 280, 'twoSum.js');
    K.code(code, 62, 118, { size: 18, lh: 1.45, n: K.typed(t, code, [6.8, 7.4, 8.4, 9.3, 9.9, 10.8, 11.3, 11.4, 11.7], 60), t: t, hi: hi, w: 592 });
    K.text('target = 14', 64, 384, { size: 22, mono: true, weight: 700, color: P.warm, a: K.p(t, 0.6) });
    var nums = [3, 8, 11, 6];
    K.box(700, 76, 540, 280, { stroke: P.line, a: K.p(t, 0.5) });
    nums.forEach(function (v, i) {
      var x = 790 + i * 120, cur = i === step;
      K.box(x - 45, 236, 90, 64, { fill: P.code, stroke: cur ? P.warm : (step === 2 && i === 0) ? P.green : P.line, a: K.p(t, 0.5) });
      K.text(String(v), x, 268, { size: 26, mono: true, align: 'center', a: K.p(t, 0.5) });
      K.text('[' + i + ']', x, 320, { size: 16, color: P.muted, align: 'center', a: K.p(t, 0.5) });
    });
    /* brute force pairs */
    var bf = K.win(t, 1.5, 6.6);
    var n = 0;
    for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) {
      var xi = 790 + i * 120, xj = 790 + j * 120;
      K.curve(xi, 230, (xi + xj) / 2, 226 - (j - i) * 40, xj, 230, { p: K.p(t, 1.8 + n * 0.5, 0.5), a: bf, color: P.red, lw: 2, head: 7 });
      n++;
    }
    K.text('every pair: n² / 2 checks', 970, 110, { size: 17, color: P.red, align: 'center', a: bf * K.p(t, 4) });
    if (step >= 0) K.text('need = 14 - ' + nums[step] + ' = ' + (14 - nums[step]), 724, 110, { size: 20, mono: true, color: P.warm, a: K.p(t, 12.6) });
    /* the Map */
    var m = K.p(t, 7);
    K.box(40, 410, 620, 176, { fill: P.code, stroke: P.purple, a: m });
    K.text('seen (Map)', 64, 438, { size: 17, weight: 700, color: P.purple, a: m });
    [['3 → 0', 13.8], ['8 → 1', 16]].forEach(function (e, k) {
      var q = K.back((t - e[1]) / 0.5); if (q > 0) K.chip(e[0], 150 + k * 170, 500, { s: q, mono: true, size: 21, stroke: step === 2 && k === 0 ? P.green : P.purple });
    });
    K.text('has(3)? yes', 64, 560, { size: 18, mono: true, color: P.green, a: K.p(t, 17.8) });
    var r = K.p(t, 19.7);
    K.box(700, 376, 540, 210, { stroke: P.green, a: r });
    K.text('return [0, 2]', 724, 420, { size: 26, mono: true, weight: 700, color: P.green, a: r });
    K.text('3 + 11 = 14', 724, 466, { size: 20, mono: true, a: K.p(t, 20.4) });
    K.chip('time O(n)', 800, 534, { size: 19, stroke: P.green, a: K.p(t, 21.6) });
    K.chip('space O(n)', 980, 534, { size: 19, stroke: P.acc, a: K.p(t, 22.4) });
  } },

/* 8 ─ sliding window */
{ d: 26, title: 'Sliding window',
  caps: [
    [0.3, 'Sliding window: the longest substring without repeating characters. Grow the window on the right, one character at a time.'],
    [7, 'Keep a Map of the last index of each character. If the new character was seen inside the window, move the start past it.'],
    [14, 'The window never moves backwards, so each character is visited at most twice: O of n, instead of checking every substring.'],
    [19.5, 'Track the best length as you go. For abcabcbb the answer is 3, the window abc.']],
  draw: function (K, t) {
    var P = K.P, s = 'abcabcbb';
    var ST = [0, 0, 0, 1, 2, 3, 5, 7], T0 = 1.5, DT = 1.6;
    var k = Math.min(7, Math.floor((t - T0) / DT)), started = t >= T0;
    var a = K.p(t, 0.5);
    K.box(40, 76, 1200, 200, { fill: P.code, stroke: P.line, a: a });
    for (var i = 0; i < 8; i++) {
      var x = 250 + i * 100, seen = started && i <= k;
      K.box(x - 40, 136, 80, 70, { fill: P.card, stroke: P.line, a: a });
      K.text(s[i], x, 171, { size: 30, mono: true, align: 'center', color: seen ? P.ink : P.muted, a: a });
      K.text(String(i), x, 226, { size: 16, color: P.muted, align: 'center', a: a });
    }
    if (started) {
      var prevK = Math.max(0, k - 1), f = K.p(t, T0 + k * DT, 0.5);
      var st = ST[prevK] + (ST[k] - ST[prevK]) * f, en = prevK + (k - prevK) * f;
      if (k === 0) { st = 0; en = 0; }
      var x0 = 250 + st * 100 - 46, x1 = 250 + en * 100 + 46;
      K.box(x0, 128, x1 - x0, 86, { fill: 'rgba(79,209,197,.10)', stroke: P.acc, lw: 3 });
      K.text('start', 250 + st * 100, 108, { size: 16, color: P.acc, align: 'center' });
      K.text('i', 250 + en * 100, 252, { size: 18, weight: 700, color: P.warm, align: 'center' });
    }
    var best = 0; for (var j = 0; j <= (started ? k : -1); j++) best = Math.max(best, j - ST[j] + 1);
    K.text('window: ' + (started ? s.slice(ST[k], k + 1) : ''), 70, 108, { size: 19, mono: true, a: K.p(t, T0) });
    K.text('best = ' + best, 1210, 108, { size: 22, mono: true, weight: 700, color: P.green, align: 'right', a: K.p(t, T0) });
    var code = ['function longestUnique(s) {', '  const last = new Map();', '  let start = 0, best = 0;', '  for (let i = 0; i < s.length; i++) {', '    if (last.has(s[i]) && last.get(s[i]) >= start)',
      '      start = last.get(s[i]) + 1;', '    last.set(s[i], i);', '    best = Math.max(best, i - start + 1);', '  }', '  return best;', '}'];
    var jump = started && k >= 3 && t - (T0 + k * DT) < 1;
    var hi = t > 19.7 ? 7 : jump ? 5 : t > 7.2 ? 6 : -1;
    var c = K.p(t, 7);
    K.panel(40, 296, 640, 290, 'longestUnique.js', { a: c });
    K.code(code, 62, 334, { size: 17, lh: 1.32, n: K.typed(t, code, [7.2, 7.8, 8.3, 8.9, 9.6, 10.4, 11, 11.4, 12, 12.1, 12.3], 60), t: t, hi: hi, w: 612, a: c });
    var m = K.p(t, 7.4);
    K.box(700, 296, 540, 290, { fill: P.code, stroke: P.purple, a: m });
    K.text('last (Map)', 724, 322, { size: 17, weight: 700, color: P.purple, a: m });
    ['a', 'b', 'c'].forEach(function (ch, n) {
      var li = -1; for (var q = 0; q <= (started ? k : -1); q++) if (s[q] === ch) li = q;
      K.text(ch + ' → ' + (li < 0 ? '–' : li), 740 + n * 160, 370, { size: 22, mono: true, a: m });
    });
    K.text('jump: start = last seen + 1', 724, 420, { size: 18, color: P.warm, a: m * (jump ? 1 : 0.0) });
    K.text('start only moves forward', 724, 470, { size: 18, color: P.acc, a: K.p(t, 14.4) });
    K.text('each char: added once, dropped once → O(n)', 724, 510, { size: 17, color: P.muted, a: K.p(t, 16) });
    K.text('answer: 3 ("abc")', 724, 556, { size: 22, mono: true, weight: 700, color: P.green, a: K.p(t, 20) });
  } },

/* 9 ─ dynamic programming */
{ d: 27, title: 'Dynamic programming',
  caps: [
    [0.3, 'Dynamic programming: coin change. With coins 1, 2 and 5, what is the fewest number of coins that makes 11?'],
    [7, 'Let dp of i be the fewest coins for amount i. dp of 0 is 0, and every other cell starts at infinity.'],
    [13, 'Fill left to right: dp of i is 1 plus the best of dp of i minus each coin. Every cell reuses answers already computed.'],
    [20.5, 'dp of 11 is 3: five, five and one. The time is amount times coins. If the last cell stays infinity, return minus 1.']],
  draw: function (K, t) {
    var P = K.P, DP = [0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2, 3], coins = [1, 2, 5];
    K.text('coins = [1, 2, 5]', 64, 104, { size: 22, mono: true, weight: 700, a: K.p(t, 0.6) });
    K.text('amount = 11', 400, 104, { size: 22, mono: true, weight: 700, color: P.warm, a: K.p(t, 1.4) });
    var F0 = 13.6, DF = 0.55, a = K.p(t, 7.2);
    var cur = t < F0 ? -1 : Math.min(11, 1 + Math.floor((t - F0) / DF));
    for (var i = 0; i <= 11; i++) {
      var x = 92 + i * 99, filled = i === 0 ? t >= 8 : t >= F0 + (i - 1) * DF + 0.25;
      var isCur = i === cur && t < F0 + 11 * DF, win = i === 11 && t > 20.6;
      K.box(x - 42, 160, 84, 70, { fill: P.code, stroke: win ? P.green : isCur ? P.warm : P.line, lw: win || isCur ? 3 : 2, a: a });
      K.text(filled ? String(DP[i]) : '∞', x, 195, { size: filled ? 28 : 24, mono: true, align: 'center', color: filled ? (win ? P.green : P.ink) : P.muted, a: a });
      K.text(String(i), x, 250, { size: 16, color: P.muted, align: 'center', a: a });
    }
    K.text('dp[i]', 64, 140, { size: 16, color: P.muted, a: a });
    if (cur > 0 && t < F0 + 11 * DF + 0.3) {
      coins.forEach(function (c) {
        if (c > cur) return;
        var best = DP[cur - c] + 1 === DP[cur];
        K.curve(92 + (cur - c) * 99, 158, 92 + (cur - c / 2) * 99, 158 - 20 - c * 8, 92 + cur * 99, 156, { color: best ? P.green : P.muted, lw: best ? 2.5 : 1.5, head: 8 });
      });
    }
    var code = ['const dp = Array(amount + 1).fill(Infinity);', 'dp[0] = 0;', 'for (let i = 1; i <= amount; i++)', '  for (const c of coins)',
      '    if (c <= i) dp[i] = Math.min(dp[i], dp[i - c] + 1);', 'return dp[amount] === Infinity ? -1 : dp[amount];'];
    var hi = t > 20.7 ? 5 : t > 13.2 ? 4 : t > 7.2 ? 0 : -1;
    K.panel(40, 290, 700, 296, 'coinChange.js', { a: K.p(t, 7) });
    K.code(code, 62, 340, { size: 19, lh: 1.6, n: K.typed(t, code, [7.3, 8.6, 13.2, 14, 14.6, 21.4], 46), t: t, hi: hi, w: 670 });
    var r = K.p(t, 20.7);
    K.box(780, 290, 460, 296, { stroke: P.green, a: r });
    K.text('dp[11] = 3', 804, 336, { size: 28, mono: true, weight: 700, color: P.green, a: r });
    ['5', '5', '1'].forEach(function (c, i) { var q = K.back((t - 21.4 - i * 0.4) / 0.5); if (q > 0) K.chip(c, 840 + i * 80, 404, { s: q, mono: true, size: 24, stroke: P.warm }); });
    K.text('time O(amount × coins)', 804, 470, { size: 19, mono: true, a: K.p(t, 22.8) });
    K.text('unreachable → -1', 804, 520, { size: 19, mono: true, color: P.red, a: K.p(t, 24) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 34 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['EventEmitter: return unsubscribe, copy listeners before emit',
     'LRU: a Map; get re-inserts, set evicts the first key',
     'Token bucket: refill by elapsed time, inject the clock',
     'Observable: lazy, many values, unsubscribe runs cleanup',
     'Name the pattern: hash map, window, DP, and the rest'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the self-checks with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
