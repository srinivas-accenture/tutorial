/* Day 39 in motion: STAR+R stories, a story bank and level expectations, then ADRs, one-way vs two-way doors, weighted decisions and trade-off debates.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day39', {
  kicker: 'JavaScript: Zero to Architect · Day 39',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 39: telling strong stories, and making and defending architecture decisions.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Lead and decide', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 39 · Leadership and decisions', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['STAR+R stories', 'ADRs', 'Trade-offs'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ STAR+R */
{ d: 26, title: 'STAR+R stories',
  caps: [
    [0.3, 'Behavioral questions start with "tell me about a time". Answer with a short story in five parts: STAR plus R.'],
    [6.5, 'Situation and Task: two sentences of context, then what you owned and what success meant.'],
    [12, 'Action is most of the answer: what you did and why, including options you rejected. Say "I" for your part, and credit the team.'],
    [19, 'Then the Result, with numbers, and a Reflection: what you learned or would change. Keep it to two or three minutes.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, sc = 1160 / 150, x = 60;
    var S = [['Situation', 15, P.blue, 6.8], ['Task', 15, P.purple, 8.4], ['Action', 75, P.acc, 12.3], ['Result', 25, P.green, 19.3], ['Reflection', 20, P.warm, 21.4]];
    K.text('a 2½-minute answer', 60, 110, { size: 17, color: P.muted, a: K.p(t, 1) });
    S.forEach(function (s, i) {
      var w = s[1] * sc, q = K.p(t, 1.4 + i * 0.5, 0.5), on = K.p(t, s[3], 0.5);
      K.box(x + 2, 136, w - 4, 70, { fill: on > 0 ? 'rgba(79,209,197,' + (0.04 + 0.1 * on) + ')' : P.card, stroke: s[2], lw: 1.5 + 2 * on, r: 8, a: q });
      K.text(s[0], x + w / 2, 171, { size: 20, weight: 700, color: s[2], align: 'center', a: q * (0.55 + 0.45 * on) });
      x += w;
    });
    ['0:00', '0:30', '1:00', '1:30', '2:00', '2:30'].forEach(function (l, i) {
      K.text(l, 60 + i * 30 * sc, 226, { size: 16, color: P.muted, align: i === 5 ? 'right' : i ? 'center' : 'left', a: K.p(t, 1) });
    });
    K.box(60, 260, 1160, 325, { stroke: P.line, a: K.p(t, 6.6) });
    var L = [['S', 'Checkout LCP was 4.8 s and mobile conversion was falling.', P.blue, 7.2],
             ['T', 'I owned the goal: LCP under 2.5 s within the quarter.', P.purple, 8.8],
             ['A', 'I profiled it and found a 900 KB hero behind blocking scripts.', P.acc, 12.6],
             ['A', 'I chose preload + AVIF over a full SSR rewrite: faster to ship.', P.acc, 14.6],
             ['R', 'LCP fell to 2.1 s and conversion rose 6%.', P.green, 19.6],
             ['R', 'I learned to add a perf budget in CI before launch, not after.', P.warm, 21.8]];
    L.forEach(function (l, i) {
      var q = K.p(t, l[3], 0.5), y = 296 + i * 48;
      K.text(l[0], 92, y, { size: 22, weight: 800, color: l[2], align: 'center', a: q });
      K.text(l[1], 130 - (1 - q) * 14, y, { size: 21, a: q });
    });
    K.chip('"I" for your part · credit the team', 1010, 106, { size: 17, stroke: P.acc, a: K.p(t, 16.4) });
  } },

/* 3 ─ weak vs strong */
{ d: 20, title: 'Weak vs strong answers',
  caps: [
    [0.3, 'Compare two answers. "We worked hard and it went well" has no numbers, no clear owner, no result and no lesson.'],
    [7, 'The strong answer says what I did, includes numbers, states the result and ends with a lesson.'],
    [13, 'The rules: be specific and honest, never blame people, and use real stories. Never invent one.']],
  draw: function (K, t) {
    var P = K.P;
    var wa = K.p(t, 0.5), sa = K.p(t, 7.2);
    K.box(60, 90, 540, 200, { stroke: P.red, a: wa });
    K.text('Weak', 84, 120, { size: 20, weight: 700, color: P.red, a: wa });
    K.text('"We worked hard', 84, 180, { size: 28, a: wa });
    K.text('and it went well."', 84, 224, { size: 28, a: wa });
    K.box(680, 90, 540, 200, { stroke: P.green, a: sa });
    K.text('Strong', 704, 120, { size: 20, weight: 700, color: P.green, a: sa });
    ['"I profiled checkout, found a 900 KB', 'hero, preloaded it, and cut LCP from', '4.8 s to 2.1 s. I learned to budget early."'].forEach(function (l, i) {
      K.text(l, 704, 166 + i * 34, { size: 20, a: K.p(t, 7.6 + i * 0.4) });
    });
    ['numbers', 'ownership: "I" ≥ "we"', 'a result', 'a lesson'].forEach(function (r, i) {
      var y = 340 + i * 50;
      K.text(r, 640, y, { size: 20, align: 'center', color: P.muted, a: K.p(t, 1.6) });
      K.mark(330, y, false, 0.85, K.p(t, 2.2 + i * 0.7));
      K.mark(950, y, true, 0.85, K.p(t, 8.6 + i * 0.6));
    });
    [['specific + honest', 300, 13.4], ['never blame people', 640, 14.4], ['real stories only', 980, 15.4]].forEach(function (c) {
      K.chip(c[0], c[1], 556, { size: 19, stroke: P.acc, a: K.p(t, c[2]) });
    });
  } },

/* 4 ─ story bank and levels */
{ d: 24, title: 'Story bank and levels',
  caps: [
    [0.3, 'Prepare a bank of seven real stories. Each one can answer several different questions.'],
    [7, 'A hard bug, a measured win, a disagreement, a failure you owned, an ambiguous project, mentoring, and a decision you drove.'],
    [14, 'The bar rises with level: mid delivers reliably, senior owns ambiguity, lead grows the team, architect aligns tech with the business.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    var B = [['Hard bug', 'debugging, persistence'], ['Win with numbers', 'impact, measurement'], ['Disagreement', 'data over ego'],
             ['Failure / incident', 'ownership, learning'], ['Ambiguous project', 'scoping, trade-offs'], ['Mentoring', 'multiplying impact'], ['Decision you drove', 'judgment, influence']];
    B.forEach(function (b, i) {
      var x = 60 + (i % 2) * 330, y = 90 + Math.floor(i / 2) * 82, q = K.back((t - 0.8 - i * 0.25) / 0.5), lit = Math.max(K.win(t, 7.3 + i * 0.85, 7.3 + i * 0.85 + 1.4), (i === 2 || i === 3 || i === 6) ? K.win(t, 4.2, 7) : 0);
      if (q <= 0) return;
      g.save(); g.translate(x + 155, y + 34); g.scale(q, q); g.translate(-x - 155, -y - 34);
      K.box(x, y, 310, 68, { stroke: lit > 0.3 ? P.warm : P.acc, lw: lit > 0.3 ? 3 : 2, a: K.clamp(q) });
      K.text(b[0], x + 18, y + 24, { size: 19, weight: 700, a: K.clamp(q) });
      K.text(b[1], x + 18, y + 50, { size: 16, color: P.muted, a: K.p(t, 7.3 + i * 0.85) });
      g.restore();
    });
    var qa = K.win(t, 3.4, 13.6);
    K.chip('"Tell me about a time you were wrong"', 1000, 288, { size: 17, stroke: P.warm, a: qa });
    K.arrow(830, 288, 712, 288, { p: K.p(t, 4, 0.5), color: P.warm, lw: 2, head: 9, a: qa });
    K.text('several stories fit one question', 1000, 334, { size: 16, color: P.muted, align: 'center', a: Math.min(qa, K.p(t, 5)) });
    var L = [['Mid', 'reliable delivery, learns fast', P.blue], ['Senior', 'owns ambiguity end to end', P.acc], ['Lead', 'grows people, sets standards', P.purple], ['Architect', 'cross-team vision, risk, business', P.warm]];
    L.forEach(function (l, i) {
      var q = K.p(t, 14.4 + i * 1.1, 0.5), x = 780 + i * 30, y = 460 - i * 100;
      K.box(x, y, 380, 76, { stroke: l[2], a: q });
      K.text(l[0], x + 20, y + 26, { size: 20, weight: 700, color: l[2], a: q });
      K.text(l[1], x + 20, y + 54, { size: 16, color: P.muted, a: q });
    });
    K.arrow(760, 540, 760, 160, { p: K.p(t, 14.2, 3.6), color: P.muted, lw: 2 });
  } },

/* 5 ─ ADR */
{ d: 25, title: 'Architecture Decision Records',
  caps: [
    [0.3, 'Architecture decisions get written down as ADRs: short, numbered records kept in the repo.'],
    [6, 'Each one states the context and constraints, the options considered, and the decision with its main reason.'],
    [13, 'Consequences: what gets easier, what gets harder, and the signal that would make you revisit it.'],
    [19.5, 'ADRs are immutable. When a decision changes, write a new one that supersedes the old.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['# ADR 7: Monorepo with shared packages', 'Status: accepted', '## Context', '4 teams, shared design system, 9 months',
                '## Options', 'polyrepo · monorepo · micro-frontends', '## Decision', 'Monorepo: atomic changes, one toolchain',
                '## Consequences', '+ atomic refactors   - needs build caching', 'Revisit if teams need separate releases'];
    var st = [0.8, 2.2, 6.2, 6.8, 8.4, 9, 10.6, 11.2, 13.2, 13.8, 15.6];
    K.panel(60, 84, 700, 500, 'docs/adr/0007-monorepo.md', { a: K.p(t, 0.4) });
    var hi = t > 15.6 ? 10 : t > 13.2 ? 9 : t > 10.6 ? 7 : t > 8.4 ? 5 : t > 6.2 ? 3 : -1;
    K.code(code, 88, 126, { size: 19, lh: 1.65, n: K.typed(t, code, st, 40), t: t, hi: hi, w: 650 });
    var X = 990;
    K.chip('proposed', X, 140, { size: 19, stroke: P.muted, a: K.p(t, 1.2) });
    K.arrow(X, 166, X, 206, { p: K.p(t, 2.2, 0.4), color: P.muted, lw: 2, head: 9 });
    K.chip('accepted', X, 232, { size: 19, stroke: P.green, color: P.green, a: K.p(t, 2.4) });
    K.text('short · numbered · in the repo', X, 286, { size: 17, color: P.muted, align: 'center', a: K.p(t, 3.4) });
    K.arrow(X, 310, X, 352, { p: K.p(t, 19.8, 0.5), color: P.warm, lw: 2, head: 9, a: K.p(t, 19.8) });
    K.chip('superseded by ADR 12', X, 380, { size: 19, stroke: P.warm, color: P.warm, a: K.p(t, 20.2) });
    var n = K.back((t - 21.2) / 0.6);
    if (n > 0) {
      K.g.save(); K.g.translate(X, 490); K.g.scale(n, n);
      K.box(-200, -60, 400, 120, { fill: P.code, stroke: P.warm, a: K.clamp(n) });
      K.text('ADR 12: split checkout', 0, -24, { size: 19, weight: 700, mono: true, align: 'center', a: K.clamp(n) });
      K.text('supersedes ADR 7', 0, 14, { size: 17, color: P.warm, align: 'center', a: K.clamp(n) });
      K.text('ADR 7 stays, unedited', 0, 40, { size: 16, color: P.muted, align: 'center', a: K.clamp(n) });
      K.g.restore();
    }
  } },

/* 6 ─ doors */
{ d: 22, title: 'One-way and two-way doors',
  caps: [
    [0.3, 'How much process does a decision need? Ask whether it is a one-way door or a two-way door.'],
    [6, 'Two-way doors are cheap to reverse, like a lint rule or a helper library. The owner decides quickly and notes it in a sentence.'],
    [12.5, 'One-way doors are hard to undo: data models, public APIs, the core framework, vendor lock-in. They get an ADR, a review and a prototype.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    function door(x, col, a) {
      K.box(x, 110, 190, 280, { stroke: col, lw: 3, r: 10, a: a });
      K.box(x + 18, 130, 154, 110, { fill: false, stroke: P.line, r: 6, a: a });
      K.box(x + 18, 256, 154, 116, { fill: false, stroke: P.line, r: 6, a: a });
      g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.arc(x + 160, 250, 8, 0, 7); g.fill(); g.restore();
    }
    var a1 = K.p(t, 1), a2 = K.p(t, 1.6);
    door(120, P.green, a1); door(740, P.warm, a2);
    K.text('two-way door', 215, 90, { size: 21, weight: 700, color: P.green, align: 'center', a: a1 });
    K.text('one-way door', 835, 90, { size: 21, weight: 700, color: P.warm, align: 'center', a: a2 });
    K.arrow(150, 420, 290, 420, { p: K.p(t, 6.4, 0.5), color: P.green });
    K.arrow(290, 446, 150, 446, { p: K.p(t, 6.8, 0.5), color: P.green });
    K.arrow(770, 432, 910, 432, { p: K.p(t, 13, 0.5), color: P.warm });
    K.lock(940, 434, 1, P.red, K.p(t, 13.6));
    ['lint rule', 'helper library', 'internal naming', 'UI on one page'].forEach(function (s, i) {
      K.text('•  ' + s, 340, 150 + i * 44, { size: 20, a: K.p(t, 7 + i * 0.6) });
    });
    ['data model', 'public API', 'core framework', 'vendor lock-in'].forEach(function (s, i) {
      K.text('•  ' + s, 960, 150 + i * 44, { size: 20, a: K.p(t, 13.4 + i * 0.6) });
    });
    K.chip('owner decides fast, one sentence', 330, 530, { size: 19, stroke: P.green, a: K.p(t, 9.8) });
    K.chip('ADR + review + prototype', 950, 530, { size: 19, stroke: P.warm, a: K.p(t, 16.6) });
  } },

/* 7 ─ weighted matrix */
{ d: 26, title: 'Weighted decisions',
  caps: [
    [0.3, 'To argue a trade-off, score real options against explicit criteria. Here: a modular monolith, micro-frontends, or a monorepo with packages.'],
    [7.5, 'Make the weights visible. With these balanced weights, the monorepo wins narrowly: 56, against 55 for the monolith.'],
    [14, 'Weight team autonomy above everything else, and micro-frontends win. Most debates are really about the weights.'],
    [20, 'So: restate the goal, show options and weights, pick one, and name the risks and the signal that would change your mind.']],
  draw: function (K, t) {
    var P = K.P, sw = K.p(t, 14.4, 0.8), alt = sw > 0.5;
    var cols = [['autonomy', 480], ['perf', 620], ['simplicity', 760], ['cost', 900]];
    var W1 = [5, 3, 4, 2], W2 = [20, 1, 1, 1];
    var O = [['Modular monolith', [3, 4, 5, 4], 55, 73], ['Micro-frontends', [5, 2, 2, 2], 43, 106], ['Monorepo + packages', [4, 4, 4, 4], 56, 92]];
    var a = K.p(t, 0.4);
    cols.forEach(function (c) { K.text(c[0], c[1], 104, { size: 19, weight: 700, color: P.muted, align: 'center', a: a }); });
    K.text('total', 1080, 104, { size: 19, weight: 700, color: P.muted, align: 'center', a: a });
    var wa = K.p(t, 7.8);
    K.box(60, 130, 1160, 50, { fill: 'rgba(246,173,85,.10)', stroke: P.warm, r: 8, a: wa });
    K.text('weight', 84, 155, { size: 20, weight: 700, color: P.warm, a: wa });
    cols.forEach(function (c, i) {
      K.text(String(W1[i]), c[1], 156, { size: 22, mono: true, weight: 700, color: P.warm, align: 'center', a: wa * (alt ? 0 : 1) });
      K.text(String(W2[i]), c[1], 156, { size: 22, mono: true, weight: 700, color: P.warm, align: 'center', a: alt ? 1 : 0 });
    });
    var best = t < 9.6 ? -1 : alt ? 1 : 2;
    O.forEach(function (o, r) {
      var y = 236 + r * 70, q = K.p(t, 1 + r * 0.8);
      K.box(60, y - 28, 1160, 56, { fill: P.card, stroke: best === r ? P.green : P.line, lw: best === r ? 3 : 1.5, r: 8, a: q });
      K.text(o[0], 84, y, { size: 21, weight: 600, a: q });
      o[1].forEach(function (s, i) { K.text(String(s), cols[i][1], y, { size: 22, mono: true, align: 'center', a: K.p(t, 2.6 + r * 0.8 + i * 0.15) }); });
      var tot = K.p(t, 8.6 + r * 0.4);
      K.text(String(o[2]), 1080, y, { size: 24, mono: true, weight: 700, align: 'center', color: best === r ? P.green : P.ink, a: tot * (alt ? 0 : 1) });
      K.text(String(o[3]), 1080, y, { size: 24, mono: true, weight: 700, align: 'center', color: best === r ? P.green : P.ink, a: alt ? 1 : 0 });
    });
    K.text('score 1–5 per criterion · total = Σ weight × score', 60, 456, { size: 17, color: P.muted, a: K.p(t, 3.4) });
    var F = ['goal', 'constraints', 'options', 'weights', 'decision + risks + revisit'];
    var X = [130, 290, 450, 610, 860];
    F.forEach(function (f, i) {
      K.chip(f, X[i], 520, { size: 18, stroke: i === 3 ? P.warm : P.acc, a: K.p(t, 20.3 + i * 0.5) });
      if (i) K.arrow(X[i - 1] + (i === 1 ? 38 : 58), 520, X[i] - (i === 4 ? 128 : 52), 520, { p: K.p(t, 20.1 + i * 0.5, 0.3), color: P.muted, lw: 2, head: 8 });
    });
  } },

/* 8 ─ criteria, not slogans */
{ d: 25, title: 'Criteria, not slogans',
  caps: [
    [0.3, 'In a debate, never say "X is always better". Say when each option wins.'],
    [5.5, 'SSR suits SEO and a fast first paint on content sites. CSR suits apps behind a login, with rich interactivity and simple hosting.'],
    [12.5, 'Micro-frontends pay off when many teams need independent deploys. With fewer teams, a modular monolith keeps things simple and consistent.'],
    [19.5, 'End with a decision, its risks, and what would change your mind. That is what senior judgment sounds like.']],
  draw: function (K, t) {
    var P = K.P;
    var sl = K.p(t, 0.6) * (1 - K.p(t, 5.2, 0.4));
    K.mark(470, 300, false, 1, sl); K.text('"React is always better"', 500, 300, { size: 26, color: P.red, a: sl });
    function pair(y, A, B, t0) {
      var qa = K.p(t, t0), qb = K.p(t, t0 + 2.5);
      K.box(60, y, 540, 150, { stroke: P.blue, a: qa }); K.box(680, y, 540, 150, { stroke: P.purple, a: qb });
      K.text(A[0], 84, y + 32, { size: 22, weight: 700, color: P.blue, a: qa });
      K.text(B[0], 704, y + 32, { size: 22, weight: 700, color: P.purple, a: qb });
      A[1].forEach(function (s, i) { K.text('when ' + s, 84, y + 74 + i * 32, { size: 19, a: K.p(t, t0 + 0.5 + i * 0.4) }); });
      B[1].forEach(function (s, i) { K.text('when ' + s, 704, y + 74 + i * 32, { size: 19, a: K.p(t, t0 + 3 + i * 0.4) }); });
      K.text('vs', 640, y + 75, { size: 22, weight: 800, color: P.muted, align: 'center', a: qa });
    }
    pair(84, ['SSR', ['SEO matters', 'first paint is critical']], ['CSR', ['the app is behind a login', 'interactivity, simple hosting']], 5.8);
    pair(256, ['Micro-frontends', ['many teams', 'deploys must be independent']], ['Modular monolith', ['fewer teams', 'consistent UX matters most']], 12.8);
    var code = ['"For this context I choose the modular monolith.', ' Risk: team growth. I would revisit at 8 teams."'];
    K.panel(60, 440, 1160, 120, '', { a: K.p(t, 19.8) });
    K.code(code, 90, 462, { size: 21, lh: 1.6, n: K.typed(t, code, [20, 21.8], 32), t: t, a: K.p(t, 19.8) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 39 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['STAR+R: most of the time on your actions, results in numbers',
     'Seven real stories, each reusable; never blame, never invent',
     'ADRs: context, options, decision, consequences, revisit trigger',
     'Two-way doors fast; one-way doors get an ADR and a review',
     'Make the weights visible; argue criteria, not slogans'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 39 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
