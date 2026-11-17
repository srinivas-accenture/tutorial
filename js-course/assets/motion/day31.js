/* Day 31 in motion: the six-step interview method, brute force vs optimized, tracing and edge cases, and output-prediction drills. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day31', {
  kicker: 'JavaScript: Zero to Architect · Day 31',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 31: a repeatable method for coding questions, and how to predict what code prints.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Interview method', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 31 · Method and output drills', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Six-step method', 'Brute force → optimize', 'Predict the output'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 360 + i * 280, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the six steps */
{ d: 25, title: 'The six-step method',
  caps: [
    [0.3, 'Interviewers score how you think, not only whether the code runs. A repeatable method keeps you calm and shows that thinking.'],
    [6.5, 'Understand the problem, match it to a pattern, then plan: the brute force first, then the optimization.'],
    [13, 'Then implement while you narrate, review by tracing examples, and evaluate with Big-O and next steps.'],
    [19.5, 'Talk the whole way. Silence is the most common failure: nobody can help a candidate they cannot follow.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('What the interviewer scores', 640, 102, { size: 22, weight: 700, color: P.muted, align: 'center', a: K.p(t, 0.4) });
    ['Clarifying', 'Trade-offs', 'Testing', 'Working code'].forEach(function (s, i) {
      var q = K.back((t - 1.2 - i * 0.6) / 0.5); if (q <= 0) return;
      var x = 250 + i * 260;
      K.chip(s, x, 158, { s: q, size: 21, stroke: i === 3 ? P.line : P.acc });
      K.mark(x + 92, 136, true, 0.6, K.p(t, 1.6 + i * 0.6, 0.3));
    });
    var S = [['1 Understand', 'restate + examples', 6.8, P.acc], ['2 Match', 'which pattern?', 8.4, P.warm], ['3 Plan', 'brute → optimize', 10, P.warm],
             ['4 Implement', 'narrate as you go', 13.3, P.green], ['5 Review', 'trace + edge cases', 15, P.green], ['6 Evaluate', 'Big-O + next steps', 16.7, P.purple]];
    S.forEach(function (b, i) {
      var x = 40 + i * 204, q = K.back((t - b[2]) / 0.6); if (q <= 0) return;
      K.g.save(); K.g.translate(x + 90, 320); K.g.scale(q, q);
      K.box(-90, -52, 180, 104, { stroke: b[3], a: K.clamp(q) });
      K.text(b[0], 0, -16, { size: 21, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(b[1], 0, 20, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(x - 22, 320, x - 3, 320, { p: K.p(t, b[2] - 0.2, 0.3), head: 9, lw: 2.5 });
    });
    /* "you" walking the steps while thinking aloud */
    var w = K.p(t, 20, 4.5), yx = 130 + w * 1020, ya = K.p(t, 19.7);
    K.box(40, 392, 1200, 4, { fill: P.line, r: 2, a: ya });
    K.box(40, 392, Math.max(0, yx - 40), 4, { fill: P.acc, r: 2, a: ya });
    K.g.save(); K.g.globalAlpha *= ya; K.g.fillStyle = P.acc; K.g.beginPath(); K.g.arc(yx, 394, 10, 0, 7); K.g.fill(); K.g.restore();
    K.text('you', yx, 420, { size: 16, color: P.acc, align: 'center', a: ya });
    var s1 = K.p(t, 21.5), s2 = K.p(t, 23);
    K.box(140, 460, 1000, 120, { fill: P.code, stroke: P.line, a: s1 });
    K.mark(190, 492, false, 0.8, s1); K.text('silent: the interviewer cannot follow, check or hint', 220, 492, { size: 20, color: P.red, a: s1 });
    K.mark(190, 546, true, 0.8, s2); K.text('aloud: "I\'ll try the brute force first, it is O(n²), then…"', 220, 546, { size: 20, color: P.green, a: s2 });
  } },

/* 3 ─ understand: questions and examples */
{ d: 27, title: 'Understand: examples first',
  caps: [
    [0.3, 'Step one: restate the problem. Return the second largest distinct number, or null if there is none.'],
    [6, 'Ask before you code. Can there be duplicates, negatives or NaN? Can the input be empty? May I mutate it?'],
    [12, 'Turn the answers into examples, including edge cases, and agree on them with the interviewer.'],
    [18, 'Now write the code, then run every example as a test. Each one passes, or tells you exactly what broke.']],
  draw: function (K, t) {
    var P = K.P;
    K.box(40, 76, 1200, 64, { stroke: P.acc, a: K.p(t, 0.4) });
    K.text('"Return the second largest distinct number, or null if there is none."', 640, 108, { size: 22, align: 'center', a: K.p(t, 0.6) });
    ['Duplicates?', 'Negatives?', 'NaN?', 'Empty input?', 'Mutate it?'].forEach(function (s, i) {
      var q = K.back((t - 6.4 - i * 1) / 0.5); if (q > 0) K.chip(s, 160 + i * 240, 186, { s: q, size: 19, stroke: P.blue });
    });
    var E = [['[3, 1, 4, 1, 5]', '4', 0], ['[5, 5, 5]', 'null', 1], ['[]', 'null', 1], ['[7]', 'null', 1], ['[-1, -5, -3]', '-3', 1], ['[NaN, 2, 1]', '1', 1]];
    K.panel(40, 236, 580, 350, 'examples · agreed first', { a: K.p(t, 12) });
    E.forEach(function (e, i) {
      var y = 300 + i * 46, q = K.p(t, 12.5 + i * 0.7, 0.4);
      K.text(e[0], 70, y, { size: 20, mono: true, a: q });
      K.text('→', 330, y, { size: 20, color: P.muted, a: q });
      K.text(e[1], 370, y, { size: 20, mono: true, color: e[2] ? P.warm : P.ink, a: q });
      if (e[2]) K.text('edge', 470, y, { size: 16, color: P.warm, a: q });
      K.mark(580, y, true, 0.7, K.p(t, 23 + i * 0.4, 0.3));
    });
    var code = ['function secondLargest(nums) {', '  const uniq = [...new Set(', '    nums.filter(Number.isFinite))]', '    .sort((a, b) => b - a);', '  return uniq.length >= 2 ? uniq[1] : null;', '}'];
    K.panel(660, 236, 580, 350, 'secondLargest.js', { a: K.p(t, 18) });
    K.code(code, 684, 290, { size: 19, lh: 1.5, n: K.typed(t, code, [18.3, 19.2, 19.9, 20.9, 21.6, 22.8], 40), t: t, a: K.p(t, 18) });
    K.text('tests: 6 passed, 0 failed', 684, 540, { size: 21, mono: true, color: P.green, a: K.p(t, 25.6, 0.4) });
  } },

/* 4 ─ brute force then optimize */
{ d: 26, title: 'Brute force, then optimize',
  caps: [
    [0.3, 'Step three: state the brute force first. To remove duplicates, check each item against everything kept so far.'],
    [6.5, 'That inner search makes it O of n squared. For 1,000 distinct numbers, that is 499,500 comparisons.'],
    [13, 'A Set lookup is O of 1 on average, so the same job takes 1,000 operations. State both, then code the better one.'],
    [19.5, 'Watch for hidden copies too. Spreading the accumulator inside reduce copies the array on every step.']],
  draw: function (K, t) {
    var P = K.P;
    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    var brute = ['const out = [];', 'for (const x of arr) {', '  if (!out.includes(x)) out.push(x);', '}'];
    K.panel(40, 76, 580, 176, 'brute force', { a: K.p(t, 0.4) });
    K.code(brute, 66, 120, { size: 20, lh: 1.5, n: K.typed(t, brute, [1, 1.8, 2.8, 4.4], 30), t: t, a: K.p(t, 0.4), hi: K.win(t, 6.5, 12.6) > 0.5 ? 2 : -1, w: 540 });
    var opt = ['const out = [...new Set(arr)];', '// one pass, O(1) average lookups'];
    K.panel(660, 76, 580, 176, 'optimized', { a: K.p(t, 13.2) });
    K.code(opt, 686, 120, { size: 20, lh: 1.6, n: K.typed(t, opt, [13.6, 15], 30), t: t, a: K.p(t, 13.2) });
    /* triangle: out grows, every new x scans all of it */
    var rows = 13, fill = K.clamp((t - 6.8) / 4) * rows;
    for (var r = 0; r < rows; r++) for (var c = 0; c <= r; c++) {
      var on = K.clamp(fill - r);
      K.box(60 + c * 11, 280 + r * 11, 9, 9, { r: 2, fill: P.warm, a: on * 0.85 });
    }
    K.text('each new x scans all of out', 60, 440, { size: 16, color: P.warm, a: K.p(t, 7.2) });
    var b1 = K.p(t, 7, 4);
    K.text('includes in a loop: O(n²)', 280, 292, { size: 20, color: P.warm, weight: 700, a: K.p(t, 6.8) });
    K.box(280, 308, 940 * b1, 30, { fill: P.warm, r: 6, a: K.p(t, 6.8) });
    K.text(fmt(Math.floor(499500 * b1)) + ' comparisons', 290, 324, { size: 18, mono: true, weight: 700, color: P.bg, a: K.p(t, 7.6) });
    K.text('Set: O(n)', 280, 372, { size: 20, color: P.green, weight: 700, a: K.p(t, 13.2) });
    K.box(280, 388, 4, 30, { fill: P.green, r: 2, a: K.p(t, 13.4) });
    K.text('1,000 operations', 296, 404, { size: 18, mono: true, color: P.green, a: K.p(t, 13.8) });
    var red = ['arr.reduce((acc, x) => [...acc, x], []);', 'const res = []; for (const x of arr) res.push(x);'];
    K.panel(40, 466, 1200, 120, '', { a: K.p(t, 19.6) });
    K.code(red, 66, 486, { size: 20, lh: 2, n: K.typed(t, red, [19.9, 22.6], 34), t: t, a: K.p(t, 19.6) });
    K.mark(860, 498, false, 0.8, K.p(t, 21.4)); K.text('copies every step: O(n²)', 886, 498, { size: 18, color: P.red, a: K.p(t, 21.4) });
    K.mark(860, 538, true, 0.8, K.p(t, 24.2)); K.text('one array: O(n)', 886, 538, { size: 18, color: P.green, a: K.p(t, 24.2) });
  } },

/* 5 ─ review and evaluate */
{ d: 25, title: 'Review and evaluate',
  caps: [
    [0.3, 'Step five: review. Trace one example through your code by hand, step by step, before you say you are done.'],
    [7, 'Then run the edge cases: empty, one item, all equal, negatives, NaN, unicode, and whether you mutated the input.'],
    [13.5, 'Step six: evaluate. State time and space complexity unprompted, including the costs hidden inside built-ins.'],
    [19.5, 'Close with what you would add next: more tests, input validation, error handling.']],
  draw: function (K, t) {
    var P = K.P;
    K.panel(40, 76, 600, 340, 'trace: secondLargest([3, 1, 4, 1, 5])', { a: K.p(t, 0.4) });
    [['filter(Number.isFinite)', '[3, 1, 4, 1, 5]'], ['new Set(…)', '{3, 1, 4, 5}'], ['[...set]', '[3, 1, 4, 5]'],
     ['sort((a, b) => b - a)', '[5, 4, 3, 1]'], ['uniq[1]', '4']].forEach(function (r, i) {
      var y = 140 + i * 56, q = K.p(t, 1.2 + i * 1.1, 0.4), last = i === 4;
      if (last) K.box(56, y - 22, 568, 44, { fill: 'rgba(104,211,145,.12)', stroke: P.green, a: q });
      K.text(r[0], 70, y, { size: 18, mono: true, color: P.muted, a: q });
      K.arrow(326, y, 362, y, { p: q, head: 9, lw: 2 });
      K.text(r[1], 380, y, { size: 21, mono: true, color: last ? P.green : P.ink, weight: last ? 700 : 400, a: q });
    });
    K.box(660, 76, 580, 210, { stroke: P.blue, a: K.p(t, 7) });
    K.text('edge cases', 684, 104, { size: 19, weight: 700, color: P.blue, a: K.p(t, 7) });
    ['empty []', 'one item', 'all equal', 'negatives', 'NaN · null', 'unicode "é"', 'input mutated?', 'huge input'].forEach(function (s, i) {
      var q = K.back((t - 7.4 - i * 0.6) / 0.5); if (q > 0) K.chip(s, 760 + (i % 3) * 190, 150 + Math.floor(i / 3) * 52, { s: q, size: 17, stroke: P.blue });
    });
    K.box(660, 302, 580, 284, { stroke: P.line, a: K.p(t, 13.6) });
    K.text('cost of common operations', 684, 330, { size: 19, weight: 700, color: P.muted, a: K.p(t, 13.6) });
    [['arr[i], push, pop, Map/Set has', 'O(1)', P.green], ['includes, indexOf, map, filter', 'O(n)', P.warm], ['sort', 'O(n log n)', P.warm],
     ['shift, unshift, splice', 'O(n)', P.warm], ['nested loops, same data', 'O(n²)', P.red]].forEach(function (r, i) {
      var y = 376 + i * 44, q = K.p(t, 14.2 + i * 0.8, 0.4);
      K.text(r[0], 684, y, { size: 18, mono: true, a: q });
      K.text(r[1], 1216, y, { size: 20, mono: true, weight: 700, color: r[2], align: 'right', a: q });
    });
    K.box(40, 436, 600, 150, { fill: P.code, stroke: P.line, a: K.p(t, 19.6) });
    K.text('With more time I would add…', 64, 466, { size: 19, weight: 700, color: P.muted, a: K.p(t, 19.6) });
    ['unit tests', 'input validation', 'error handling'].forEach(function (s, i) {
      var q = K.back((t - 20.4 - i * 0.7) / 0.5); if (q > 0) K.chip(s, [130, 320, 520][i], 530, { s: q, size: 18, stroke: P.acc });
    });
  } },

/* 6 ─ output prediction method */
{ d: 22, title: 'Predicting output',
  caps: [
    [0.3, 'What does this print? is the most common JavaScript screening question. Each puzzle hides one rule.'],
    [6, 'So label the category first: hoisting, this, closures in loops, coercion, classes, or the event loop.'],
    [12, 'Recall the rule for that category, then trace the code line by line. For async code, keep three lists.'],
    [17, 'Only then answer, and say the rule out loud. The rule is what interviewers score, not the guess.']],
  draw: function (K, t) {
    var P = K.P, pz = K.win(t, 0.3, 6.1, 0.5);
    K.panel(290, 130, 700, 240, 'puzzle.js', { a: pz });
    K.code(['console.log([] + {}, typeof NaN);'], 330, 190, { size: 24, a: pz });
    K.text('?', 640, 290, { size: 72, weight: 800, color: P.warm, align: 'center', a: pz * K.p(t, 1.5) });
    K.text('one hidden rule', 640, 345, { size: 18, color: P.muted, align: 'center', a: pz * K.p(t, 3) });
    var hd = K.p(t, 6.2);
    K.text('category', 150, 96, { size: 17, weight: 700, color: P.muted, align: 'center', a: hd });
    K.text('if you see…', 280, 96, { size: 17, weight: 700, color: P.muted, a: hd });
    K.text('think…', 640, 96, { size: 17, weight: 700, color: P.muted, a: hd });
    [['hoisting', 'var, f() before declared', 'var is undefined; let/const are in the TDZ'],
     ['this', 'this in a callback', 'who is the receiver at the call site?'],
     ['closures', 'setTimeout in a loop', 'var shares one binding; let makes one per loop'],
     ['coercion', '+  ==  []  {}  null', 'ToPrimitive, ToNumber; + with a string joins'],
     ['classes', 'class, super, extends', 'prototype chain, field order, statics'],
     ['event loop', 'Promise, await, timers', 'sync, then all microtasks, then one task']].forEach(function (r, i) {
      var y = 136 + i * 50, q = K.p(t, 6.5 + i * 0.85, 0.4);
      if (i % 2 === 0) K.box(56, y - 22, 1168, 44, { fill: 'rgba(255,255,255,.03)', r: 8, a: q });
      K.chip(r[0], 150, y, { size: 17, stroke: i === 5 ? P.blue : P.acc, a: q });
      K.text(r[1], 280, y, { size: 17, mono: true, a: q });
      K.text(r[2], 640, y, { size: 19, color: P.muted, a: q });
    });
    [['read', P.line, 12.3], ['label it', P.acc, 12.8], ['recall the rule', P.warm, 13.4], ['trace', P.warm, 14], ['answer + why', P.green, 17.3]].forEach(function (b, i) {
      var x = 60 + i * 236, q = K.back((t - b[2]) / 0.5); if (q <= 0) return;
      K.g.save(); K.g.translate(x + 100, 490); K.g.scale(q, q);
      K.box(-100, -40, 200, 80, { stroke: b[1], a: K.clamp(q) });
      K.text(b[0], 0, i === 3 ? -10 : 0, { size: 21, weight: 700, align: 'center', a: K.clamp(q) });
      if (i === 3) K.text('3 lists for async', 0, 18, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(x - 34, 490, x - 4, 490, { p: K.p(t, b[2] - 0.2, 0.3), head: 10, lw: 2.5 });
    });
  } },

/* 7 ─ drill: hoisting */
{ d: 23, title: 'Drill: hoisting',
  caps: [
    [0.3, 'Drill one. The outer a is 1, and f logs a before declaring its own var a. What prints?'],
    [6, 'Label it: hoisting. Inside f, var a is created at the top of the function and set to undefined.'],
    [12, 'That local a shadows the outer one, so the log reads the local binding, which is still undefined.'],
    [17.5, 'Answer: undefined. With let instead of var, the same read throws a ReferenceError: the temporal dead zone.']],
  draw: function (K, t) {
    var P = K.P, code = ['var a = 1;', 'function f() {', '  console.log(a);', '  var a = 2;', '}', 'f();'];
    var hi = t > 12 && t < 17.5 ? 2 : t > 6.2 && t < 12 ? 3 : -1;
    K.panel(40, 80, 560, 290, 'drill1.js');
    K.code(code, 70, 128, { size: 24, lh: 1.45, n: K.typed(t, code, [0.6, 1.2, 1.9, 2.7, 3.3, 3.6], 28), t: t, hi: hi, w: 520 });
    K.box(660, 80, 580, 330, { fill: false, stroke: P.purple, dash: [8, 6], a: K.p(t, 1) });
    K.text('global scope', 684, 392, { size: 18, weight: 700, color: P.purple, a: K.p(t, 1) });
    var ga = K.back((t - 1.4) / 0.5);
    if (ga > 0) K.chip('a', 900, 106, { s: ga, mono: true, size: 22, stroke: P.purple });
    K.text('1', 950, 106, { size: 24, mono: true, color: P.warm, a: K.p(t, 1.7) });
    K.box(690, 150, 520, 230, { fill: 'rgba(79,209,197,.06)', stroke: P.acc, a: K.p(t, 6) });
    K.text('f() scope', 714, 178, { size: 18, weight: 700, color: P.acc, a: K.p(t, 6) });
    var fa = K.back((t - 6.6) / 0.5);
    if (fa > 0) K.chip('a', 790, 250, { s: fa, mono: true, size: 24, stroke: P.acc });
    K.arrow(822, 250, 880, 250, { p: K.p(t, 7, 0.4) });
    K.text('undefined', 896, 250, { size: 24, mono: true, color: P.muted, a: K.p(t, 7.3) });
    K.text('hoisted: created before any line of f runs', 714, 320, { size: 17, color: P.warm, a: K.p(t, 8.2) });
    /* the lookup */
    K.arrow(310, 210, 760, 250, { p: K.p(t, 12.6, 0.6), color: P.green });
    K.curve(310, 196, 560, 70, 866, 104, { p: K.p(t, 14, 0.8), color: P.red, dash: [7, 7], lw: 2.5 });
    K.mark(574, 110, false, 0.8, K.p(t, 14.8));
    K.text('outer a is shadowed', 1000, 140, { size: 17, color: P.red, a: K.p(t, 15) });
    K.panel(40, 392, 560, 108, 'Console', { a: K.p(t, 12.3) });
    K.text('undefined', 70, 458, { size: 24, mono: true, a: K.p(t, 15.5, 0.3) });
    K.chip('Answer: undefined', 320, 552, { size: 22, stroke: P.green, color: P.green, s: K.back((t - 17.7) / 0.6), a: K.p(t, 17.7) });
    var l = K.p(t, 19.6);
    K.box(660, 430, 580, 156, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: l });
    K.code(['  let a = 2;   // instead of var'], 676, 446, { size: 20, a: l });
    K.mark(694, 510, false, 0.8, K.p(t, 20.6));
    K.text("ReferenceError: Cannot access 'a'", 722, 510, { size: 19, mono: true, color: P.red, a: K.p(t, 20.6) });
    K.text('before initialization', 722, 546, { size: 19, mono: true, color: P.red, a: K.p(t, 20.6) });
  } },

/* 8 ─ drill: closures in loops */
{ d: 24, title: 'Drill: closures in loops',
  caps: [
    [0.3, 'Drill two. Two loops schedule timers. What do the var loop and the let loop print?'],
    [6, 'Label it: closures in loops. Timers run after the loop finishes, and the var loop has one shared i, which ends at 3.'],
    [13, 'So all three callbacks read the same i, and print var 3, three times.'],
    [18, 'let creates a fresh j for every iteration, so each callback keeps its own: let 0, let 1, let 2.']],
  draw: function (K, t) {
    var P = K.P, code = ['for (var i = 0; i < 3; i++)', '  setTimeout(() => console.log("var", i), 0);', 'for (let j = 0; j < 3; j++)', '  setTimeout(() => console.log("let", j), 0);'];
    K.panel(40, 80, 600, 210, 'drill2.js');
    K.code(code, 62, 130, { size: 20, lh: 1.6, n: K.typed(t, code, [0.6, 1.5, 3, 3.9], 30), t: t, hi: t > 6.2 && t < 17.8 ? 0 : t > 18.2 ? 2 : -1, w: 570 });
    /* var: one shared binding */
    var va = K.p(t, 6.2);
    K.box(680, 80, 560, 236, { stroke: P.warm, a: va });
    K.text('var: one i for the whole loop', 704, 108, { size: 19, weight: 700, color: P.warm, a: va });
    for (var k = 0; k < 3; k++) {
      var q = K.back((t - 6.8 - k * 1) / 0.5);
      if (q > 0) K.chip('cb ' + (k + 1), 780 + k * 180, 160, { s: q, mono: true, size: 19, stroke: P.line });
      K.arrow(780 + k * 180, 182, 960 + (k - 1) * 40, 246, { p: K.p(t, 7 + k, 0.4), color: P.warm, lw: 2.5, head: 10 });
    }
    var iv = t < 6.8 ? 0 : Math.min(3, Math.floor((t - 6.8) / 1));
    if (va > 0) {
      K.box(890, 250, 140, 50, { fill: P.code, stroke: iv === 3 ? P.red : P.warm, a: va });
      K.text('i = ' + iv, 960, 276, { size: 24, mono: true, weight: 700, align: 'center', color: iv === 3 ? P.red : P.ink, a: va });
    }
    K.text('loop ends', 1060, 276, { size: 17, color: P.red, a: K.p(t, 10) });
    /* let: one binding per iteration */
    var la = K.p(t, 18.2);
    K.box(680, 336, 560, 250, { stroke: P.green, a: la });
    K.text('let: a fresh j per iteration', 704, 364, { size: 19, weight: 700, color: P.green, a: la });
    for (var m = 0; m < 3; m++) {
      var qq = K.back((t - 18.6 - m * 0.6) / 0.5), x = 780 + m * 180;
      if (qq > 0) { K.chip('cb ' + (m + 1), x, 420, { s: qq, mono: true, size: 19, stroke: P.line }); }
      K.arrow(x, 442, x, 494, { p: K.p(t, 18.9 + m * 0.6, 0.4), color: P.green, lw: 2.5, head: 10 });
      K.box(x - 64, 500, 128, 48, { fill: P.code, stroke: P.green, a: K.p(t, 19 + m * 0.6) });
      K.text('j = ' + m, x, 525, { size: 22, mono: true, weight: 700, align: 'center', a: K.p(t, 19 + m * 0.6) });
    }
    K.panel(40, 312, 600, 274, 'Console', { a: K.p(t, 12.6) });
    ['var 3', 'var 3', 'var 3', 'let 0', 'let 1', 'let 2'].forEach(function (s, i) {
      var st = i < 3 ? 14 + i * 0.7 : 20.5 + (i - 3) * 0.7;
      K.text(s, 70, 368 + i * 36, { size: 22, mono: true, color: i < 3 ? P.warm : P.green, a: K.p(t, st, 0.3) });
    });
  } },

/* 9 ─ drill: event loop */
{ d: 31, title: 'Drill: the event loop',
  caps: [
    [0.3, 'Drill three, the event loop. Keep three lists: the output so far, the microtask queue, and the task queue.'],
    [7, 'Run the sync code. a prints, the timer callback goes to the task queue, and c is queued as a microtask.'],
    [13, 'The async function runs until its first await: e prints, and the rest, f, waits as a microtask. Then g prints.'],
    [19, 'Now drain the microtasks in order. c runs and queues d, then f runs, then d.'],
    [25, 'Only then does the timer task run: b. The final answer is a, e, g, c, f, d, b.']],
  draw: function (K, t) {
    var P = K.P, code = ['console.log("a");', 'setTimeout(() => console.log("b"), 0);', 'Promise.resolve().then(() => console.log("c"))', '  .then(() => console.log("d"));',
      '(async () => {', '  console.log("e"); await null; console.log("f");', '})();', 'console.log("g");'];
    var hi = t >= 7.4 && t < 8.6 ? 0 : t >= 8.6 && t < 9.6 ? 1 : t >= 9.6 && t < 11.5 ? 2 : t >= 13.4 && t < 15.6 ? 5 : t >= 15.8 && t < 18.5 ? 7 :
      t >= 19.6 && t < 21.3 ? 2 : t >= 21.3 && t < 22.9 ? 5 : t >= 22.9 && t < 24.6 ? 3 : t >= 26 && t < 27.4 ? 1 : -1;
    K.panel(40, 76, 600, 330, 'drill3.js');
    K.code(code, 60, 124, { size: 19, lh: 1.55, n: K.typed(t, code, [0.5, 0.9, 1.5, 2.2, 2.6, 2.9, 3.8, 4], 46), t: t, hi: hi, w: 580 });
    var L = [['Output', P.acc, 76], ['Microtasks', P.blue, 216], ['Tasks (timers)', P.purple, 356]];
    L.forEach(function (l, i) {
      var a = K.p(t, 0.8 + i * 1.2);
      K.box(680, l[2], 560, 120, { fill: P.code, stroke: l[1], a: a });
      K.text(l[0], 700, l[2] + 24, { size: 18, weight: 700, color: l[1], a: a });
    });
    function lane(items, y, color) {
      items.forEach(function (it, i) {
        var add = K.p(t, it[1], 0.4), rem = it[2] ? K.p(t, it[2], 0.4) : 0;
        if (add <= 0 || rem >= 1) return;
        var idx = 0;
        for (var j = 0; j < i; j++) { var o = items[j]; idx += K.p(t, o[1], 0.4) * (1 - (o[2] ? K.p(t, o[2], 0.4) : 0)); }
        K.chip(it[0], 730 + idx * 70, y - rem * 30, { mono: true, size: 24, stroke: color, s: K.back((t - it[1]) / 0.4), a: 1 - rem });
      });
    }
    lane([['a', 8], ['e', 14.2], ['g', 16.3], ['c', 20], ['f', 21.8], ['d', 23.4], ['b', 26.6]], 146, P.acc);
    lane([['c', 9.9, 19.6], ['f', 14.8, 21.4], ['d', 20.4, 23]], 286, P.blue);
    lane([['b', 8.9, 26.2]], 426, P.purple);
    K.text('c ran, so d is queued', 1220, 240, { size: 16, color: P.warm, align: 'right', a: K.win(t, 20.2, 24) });
    K.text('waits for empty microtasks', 1220, 380, { size: 16, color: P.muted, align: 'right', a: K.win(t, 19.4, 25.8) });
    var an = K.p(t, 27);
    K.box(40, 426, 600, 160, { fill: 'rgba(104,211,145,.08)', stroke: P.green, a: an });
    K.text('a  e  g  c  f  d  b', 340, 480, { size: 34, mono: true, weight: 700, color: P.green, align: 'center', a: an });
    K.text('sync  →  all microtasks  →  one task', 340, 540, { size: 19, color: P.muted, align: 'center', a: K.p(t, 27.6) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 31 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Understand, match, plan, implement, review, evaluate',
     'Say the brute force first, then optimize and state the Big-O',
     'Trace an example and the edge cases before you say done',
     'Output drills: label the category, recall the rule, trace',
     'Async order: sync code, then all microtasks, then one task'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: predict each drill, then press ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
