/* Day 40 in motion: the rapid-fire method, honest self-assessment, timed mock rounds with a rubric, and the interview-day checklist and loop.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day40', {
  kicker: 'JavaScript: Zero to Architect · Day 40',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 40: a last rapid review, an honest look at weak spots, and a plan for interview day.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Final gauntlet', 0, 0, { size: 100, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 40 · Review, mock, walk in with a plan', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Rapid-fire', 'Mock rounds', 'Interview day'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the method */
{ d: 21, title: 'The rapid-fire method',
  caps: [
    [0.3, 'Start with a rapid-fire round. Set a 20-minute timer, read a question, and answer it out loud in about 20 seconds.'],
    [7, 'Then open the answer and mark it right or wrong, honestly. Speaking aloud exposes gaps that reading hides.'],
    [13.5, 'Redo the misses tomorrow. Spaced repetition beats re-reading everything.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    var c = K.p(t, 0.5);
    K.box(60, 90, 640, 250, { stroke: P.acc, a: c });
    K.chip('mid', 110, 126, { size: 17, stroke: P.blue, color: P.blue, a: c });
    K.text('Event loop order?', 90, 186, { size: 32, weight: 700, a: K.p(t, 1) });
    var an = K.p(t, 7.4);
    K.box(84, 220, 592, 96, { fill: P.code, stroke: P.line, a: an });
    K.text('Sync code, then all microtasks,', 108, 252, { size: 21, a: an });
    K.text('then (maybe) render, then one task. Repeat.', 108, 286, { size: 21, a: K.p(t, 7.8) });
    K.mark(660, 126, true, 1, K.p(t, 9.6));
    /* 20-second timer */
    var u = K.clamp((t - 1.6) / 5), ta = K.p(t, 1.2);
    g.save(); g.globalAlpha *= ta; g.lineWidth = 12; g.strokeStyle = P.line; g.beginPath(); g.arc(960, 215, 100, 0, 7); g.stroke();
    g.strokeStyle = u < 0.8 ? P.acc : P.warm; g.lineCap = 'round'; g.beginPath(); g.arc(960, 215, 100, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - u)); g.stroke(); g.restore();
    K.text(String(Math.ceil(20 * (1 - u))) + ' s', 960, 205, { size: 40, weight: 800, align: 'center', a: ta });
    K.text('answer aloud', 960, 248, { size: 17, color: P.muted, align: 'center', a: ta });
    var F = [['read', 140], ['answer aloud · 20 s', 345], ['open the answer', 590], ['✓ or ✗', 790], ['redo ✗ tomorrow', 1000]];
    var at = [1, 2, 7.6, 9.4, 13.8];
    F.forEach(function (f, i) {
      K.chip(f[0], f[1], 410, { size: 18, stroke: i === 4 ? P.warm : P.acc, a: K.p(t, at[i]) });
    });
    [[180, 238], [452, 500], [680, 738], [842, 906]].forEach(function (a, i) { K.arrow(a[0], 410, a[1], 410, { p: K.p(t, at[i + 1] - 0.2, 0.3), color: P.muted, lw: 2, head: 9 }); });
    var d1 = K.p(t, 14.4), d2 = K.p(t, 15.6);
    K.box(160, 470, 400, 100, { stroke: P.line, a: d1 });
    K.text('today', 184, 498, { size: 18, weight: 700, color: P.muted, a: d1 });
    K.text('18 ✓    4 ✗', 184, 540, { size: 24, weight: 700, a: d1 });
    K.arrow(574, 520, 706, 520, { p: K.p(t, 15.2, 0.4), color: P.warm });
    K.box(720, 470, 400, 100, { stroke: P.warm, a: d2 });
    K.text('tomorrow', 744, 498, { size: 18, weight: 700, color: P.warm, a: d2 });
    K.text('redo only the 4 misses', 744, 540, { size: 22, a: d2 });
  } },

/* 3 ─ one breath */
{ d: 25, title: 'One-breath answers',
  caps: [
    [0.3, 'Answers are one breath long. A closure: a function plus a live reference to the variables of the scope where it was created.'],
    [7, 'Core Web Vitals: LCP at most 2.5 seconds, INP at most 200 milliseconds, CLS at most 0.1, at the 75th percentile.'],
    [13.5, 'An idempotency key: a client-supplied id that makes retries of unsafe requests safe.'],
    [19, 'In the interview, the one-liner is only the opening. Add one example, one pitfall and one trade-off.']],
  draw: function (K, t) {
    var P = K.P;
    var Q = [['fresher', P.green, 'What is a closure?', 'A function + a live reference to the variables where it was created.', 0.6],
             ['senior', P.warm, 'Core Web Vitals thresholds?', 'LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1, at p75.', 7.2],
             ['senior', P.warm, 'Idempotency key?', 'A client id that makes retrying unsafe requests safe.', 13.7]];
    Q.forEach(function (q, i) {
      var y = 90 + i * 112, a = K.p(t, q[4]);
      K.box(60, y, 1160, 96, { stroke: P.line, a: a });
      K.chip(q[0], 130, y + 30, { size: 16, stroke: q[1], color: q[1], a: a });
      K.text(q[2], 210, y + 30, { size: 22, weight: 700, a: a });
      K.text(q[3], 210, y + 68, { size: 20, color: P.acc, a: K.p(t, q[4] + 1.6) });
      K.mark(1180, y + 48, true, 0.9, K.p(t, q[4] + 3));
    });
    var L = [['one-liner', P.acc], ['+ one example', P.blue], ['+ one pitfall', P.red], ['+ one trade-off', P.purple]];
    L.forEach(function (l, i) {
      var q = K.back((t - 19.3 - i * 0.8) / 0.5); if (q <= 0) return;
      K.g.save(); K.g.translate(220 + i * 280, 500); K.g.scale(q, q);
      K.box(-125, -36, 250, 72, { stroke: l[1], lw: 2.5, a: K.clamp(q) });
      K.text(l[0], 0, 0, { size: 21, weight: 700, color: l[1], align: 'center', a: K.clamp(q) });
      K.g.restore();
    });
  } },

/* 4 ─ self-assessment and plan */
{ d: 21, title: 'Score yourself, then plan',
  caps: [
    [0.3, 'Next, score yourself from 1 to 5 in twelve areas. Honest scoring beats confident guessing.'],
    [7, 'Weak areas get the most time. Turn each low score into specific course days to revisit.'],
    [13, 'A sample final week: deep review and two mocks a day, then rapid-fire and design talks, then a light review and sleep.']],
  draw: function (K, t) {
    var P = K.P;
    var A = [['language', 4], ['async', 2], ['DOM', 4], ['engine', 3], ['modules', 3], ['Node', 4], ['architecture', 3], ['utilities', 4], ['UI coding', 3], ['sys design', 2], ['perf', 4], ['stories', 3]];
    K.box(60, 330, 1160, 2, { fill: P.line, a: K.p(t, 0.4) });
    A.forEach(function (a, i) {
      var x = 85 + i * 96, q = K.p(t, 0.8 + i * 0.25, 0.6), weak = a[1] <= 2, hot = weak && t > 7.2;
      K.box(x, 330 - a[1] * 48 * q, 62, a[1] * 48 * q, { fill: hot ? 'rgba(252,129,129,.35)' : 'rgba(79,209,197,.3)', stroke: hot ? P.red : P.acc, r: 5 });
      K.text(String(a[1]), x + 31, 330 - a[1] * 48 - 16, { size: 18, weight: 700, color: hot ? P.red : P.ink, align: 'center', a: K.p(t, 1.2 + i * 0.25) });
      K.text(a[0], x + 31, 352, { size: 16, color: P.muted, align: 'center', a: q });
    });
    K.chip('async → revisit Days 11–15', 330, 404, { size: 17, stroke: P.red, a: K.p(t, 8.2) });
    K.chip('system design → Days 36–38', 900, 404, { size: 17, stroke: P.red, a: K.p(t, 9.2) });
    K.arrow(214, 368, 270, 386, { p: K.p(t, 7.8, 0.4), color: P.red, lw: 2, head: 9 });
    K.arrow(1000, 368, 960, 386, { p: K.p(t, 8.8, 0.4), color: P.red, lw: 2, head: 9 });
    var W = [['Days −7 to −4', 'weak areas in depth, 2 mocks a day', 60, 520, P.purple, 13.4],
             ['Days −3 to −2', 'rapid-fire, polyfills, design talks', 600, 400, P.blue, 14.6],
             ['Day −1', 'light review, sleep', 1020, 200, P.green, 15.8]];
    W.forEach(function (w) {
      var q = K.p(t, w[5]);
      K.box(w[2], 460, w[3] - 20, 110, { stroke: w[4], a: q });
      K.text(w[0], w[2] + 20, 494, { size: 20, weight: 700, color: w[4], a: q });
      K.text(w[1], w[2] + 20, 534, { size: 17, a: q });
    });
  } },

/* 5 ─ mock rounds */
{ d: 21, title: 'Mock rounds',
  caps: [
    [0.3, 'Run mock rounds that match the real loop: output puzzles, coding, UI machine coding, system design and behavioral.'],
    [8, 'Do each one at least twice, out loud and timed. Pressure reveals communication gaps that solo study hides.'],
    [14, 'Use the course as material: Day 31 drills, Days 32 to 35 for coding, Days 36 to 38 for design, and your Day 39 story bank.']],
  draw: function (K, t) {
    var P = K.P;
    var R = [['Output puzzles', 30, 'Day 31 drills + rapid-fire', P.blue], ['Coding', 45, 'Days 32–34 utilities', P.acc], ['UI machine coding', 60, 'Day 35 widgets', P.purple],
             ['System design', 45, 'Days 36–38 designs', P.warm], ['Behavioral', 45, 'Day 39 story bank', P.green]];
    R.forEach(function (r, i) {
      var y = 120 + i * 78, q = K.p(t, 0.8 + i * 1.1), w = r[1] * 8 * K.p(t, 1 + i * 1.1, 0.8);
      K.text(r[0], 60, y, { size: 21, weight: 700, a: q });
      K.box(320, y - 22, w, 44, { fill: P.card, stroke: r[3], lw: 2.5, r: 8, a: q });
      K.text(r[1] + ' min', 340, y, { size: 18, mono: true, color: r[3], a: K.p(t, 1.6 + i * 1.1) });
      K.text(r[2], 840, y, { size: 19, color: P.muted, a: K.p(t, 14.3 + i * 0.6) });
    });
    [['out loud', 400, 8.4], ['timed', 620, 9.2], ['× 2 each', 840, 10]].forEach(function (c) {
      K.chip(c[0], c[1], 540, { size: 20, stroke: P.warm, a: K.p(t, c[2]) });
    });
  } },

/* 6 ─ rubric */
{ d: 22, title: 'Score with a rubric',
  caps: [
    [0.3, 'Score every mock with a rubric: six dimensions, 1 to 5 each. Correctness, communication, trade-offs, testing, depth and ownership.'],
    [8, 'A 5 in trade-offs means you name alternatives and costs without being asked. A 5 in testing means you state edge cases and verify them.'],
    [15, 'Ask a friend to score you too. Where your scores disagree, you have found a blind spot.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    var D = [['Correctness', 'edge cases work, no hand-waving', 4, 4], ['Communication', 'structured, thinks aloud, checks in', 4, 2],
             ['Trade-offs', 'names alternatives and costs unprompted', 3, 3], ['Testing mindset', 'states edge cases and verifies', 3, 3],
             ['Depth', 'explains why, down to the engine', 4, 4], ['Ownership', 'specific actions, numbers, lessons', 4, 3]];
    var h = K.p(t, 0.4);
    K.text('dimension', 60, 88, { size: 17, color: P.muted, a: h });
    K.text('a 5 means', 320, 88, { size: 17, color: P.muted, a: K.p(t, 8.2) });
    K.text('you', 952, 88, { size: 17, color: P.muted, align: 'center', a: h });
    K.text('friend', 1132, 88, { size: 17, color: P.muted, align: 'center', a: K.p(t, 15.2) });
    D.forEach(function (d, i) {
      var y = 130 + i * 62, q = K.p(t, 0.8 + i * 0.4), focus = (i === 2 || i === 3) && t > 8.2 && t < 15, blind = i === 1 && t > 16.4;
      K.box(40, y - 26, 1200, 52, { fill: focus ? 'rgba(79,209,197,.08)' : blind ? 'rgba(246,173,85,.12)' : P.card, stroke: blind ? P.warm : focus ? P.acc : P.line, lw: blind || focus ? 2.5 : 1.5, r: 8, a: q });
      K.text(d[0], 60, y, { size: 20, weight: 700, a: q });
      K.text(d[1], 320, y, { size: 17, color: focus ? P.ink : P.muted, a: K.p(t, 8.4 + i * 0.25) });
      for (var k = 0; k < 5; k++) {
        var on1 = k < d[2], on2 = k < d[3], a1 = K.p(t, 2 + i * 0.4 + k * 0.08), a2 = K.p(t, 15.4 + i * 0.3 + k * 0.06);
        g.save(); g.globalAlpha *= a1; g.fillStyle = on1 ? P.acc : P.line; g.beginPath(); g.arc(904 + k * 24, y, 8, 0, 7); g.fill(); g.restore();
        g.save(); g.globalAlpha *= a2; g.fillStyle = on2 ? (d[2] !== d[3] ? P.warm : P.blue) : P.line; g.beginPath(); g.arc(1084 + k * 24, y, 8, 0, 7); g.fill(); g.restore();
      }
    });
    K.text('4 vs 2: a blind spot in communication', 640, 528, { size: 20, weight: 700, color: P.warm, align: 'center', a: K.p(t, 16.8) });
  } },

/* 7 ─ interview day */
{ d: 20, title: 'Interview day',
  caps: [
    [0.3, 'The day before: test the camera, microphone, internet and editor, keep a backup device ready, and silence notifications.'],
    [7, 'In the room: clarify before coding, think aloud, state the complexity, and test with edge cases.'],
    [13, 'If you blank: restate the problem, write the brute force first, and ask for a hint. Staying calm is a skill.']],
  draw: function (K, t) {
    var P = K.P;
    K.box(60, 84, 560, 340, { stroke: P.blue, a: K.p(t, 0.4) });
    K.text('Day before', 84, 114, { size: 21, weight: 700, color: P.blue, a: K.p(t, 0.4) });
    ['camera + microphone', 'internet + editor / online IDE', 'backup device ready', 'notifications off', 'water, notepad, story bank'].forEach(function (s, i) {
      var y = 166 + i * 52, q = K.p(t, 0.9 + i * 0.9, 0.4);
      K.mark(100, y, true, 0.75, q); K.text(s, 128, y, { size: 19, a: q });
    });
    K.box(660, 84, 560, 340, { stroke: P.acc, a: K.p(t, 7.2) });
    K.text('In the room', 684, 114, { size: 21, weight: 700, color: P.acc, a: K.p(t, 7.2) });
    ['clarify before coding', 'think aloud', 'state time + space complexity', 'test with edge cases'].forEach(function (s, i) {
      var y = 166 + i * 52, q = K.p(t, 7.6 + i * 1, 0.4);
      K.mark(700, y, true, 0.75, q); K.text(s, 728, y, { size: 19, a: q });
    });
    K.text('If you blank', 60, 470, { size: 20, weight: 700, color: P.warm, a: K.p(t, 13.2) });
    [['restate the problem', 330], ['write the brute force', 640], ['ask for a hint', 930]].forEach(function (c, i) {
      K.chip(c[0], c[1], 530, { size: 19, stroke: P.warm, a: K.p(t, 13.6 + i * 1.2) });
      if (i) K.arrow(i === 1 ? 444 : 766, 530, i === 1 ? 516 : 840, 530, { p: K.p(t, 13.4 + i * 1.2, 0.4), color: P.muted, lw: 2, head: 9 });
    });
  } },

/* 8 ─ questions and the loop */
{ d: 21, title: 'Ask, then close the loop',
  caps: [
    [0.3, 'Have questions ready for them: how is success measured in six months, what are the biggest technical challenges, how are decisions made?'],
    [8, 'Ask about the release process, on-call and growth paths too. The answers tell you a lot about the team.'],
    [14, 'Afterwards, write down every question you were asked, and add your misses to tomorrow\'s rapid-fire list. The loop never stops.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    ['How is success measured in 6 months?', 'Biggest technical challenges?', 'How are decisions made?', 'Release process and on-call?', 'Growth paths here?'].forEach(function (s, i) {
      var q = K.back((t - (i < 3 ? 0.8 + i * 1.6 : 8.4 + (i - 3) * 1.4)) / 0.5); if (q <= 0) return;
      var y = 112 + i * 92;
      g.save(); g.translate(80, y); g.scale(q, q);
      K.box(0, -32, 520, 64, { stroke: i < 3 ? P.acc : P.blue, r: 18, a: K.clamp(q) });
      K.text(s, 24, 0, { size: 20, a: K.clamp(q) });
      g.restore();
    });
    var yi = K.win(t, 1.2, 14.3, 0.3);
    K.text('You interview', 950, 290, { size: 40, weight: 800, align: 'center', a: yi });
    K.text('them too', 950, 342, { size: 40, weight: 800, color: P.acc, align: 'center', a: yi });
    K.text('their answers show how the team works', 950, 396, { size: 18, color: P.muted, align: 'center', a: Math.min(yi, K.p(t, 8.6)) });
    var cx = 950, cy = 330, r = 170;
    var N = [['interview', 0, P.acc], ['write questions down', 1, P.blue], ['misses → rapid-fire', 2, P.warm], ['practice', 3, P.green]];
    var pos = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
    var la = K.p(t, 14.2);
    g.save(); g.globalAlpha *= la * 0.7; g.strokeStyle = P.line; g.lineWidth = 3; g.setLineDash([8, 8]); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.restore();
    N.forEach(function (n, i) {
      var q = K.back((t - 14.4 - i * 0.9) / 0.5); if (q <= 0) return;
      var p = pos[i];
      g.save(); g.translate(p[0], p[1]); g.scale(q, q);
      K.chip(n[0], 0, 0, { size: 18, stroke: n[2], fill: P.card, a: K.clamp(q) });
      g.restore();
    });
    var u = ((t - 18) / 3) % 1;
    if (t > 18) { var ang = -Math.PI / 2 + u * Math.PI * 2; g.save(); g.fillStyle = P.acc; g.beginPath(); g.arc(cx + r * Math.cos(ang), cy + r * Math.sin(ang), 8, 0, 7); g.fill(); g.restore(); }
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap, and congratulations. Now open the Day 40 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Rapid-fire out loud; redo the misses tomorrow',
     'Score 12 areas honestly; weak areas get the time',
     'Timed mock rounds, scored with a rubric and a friend',
     'Check the tech, think aloud, test the edge cases',
     'Ask good questions, write everything down, keep the loop going'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(240, y, true, 0.9, q);
      K.text(s, 272 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 40 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
