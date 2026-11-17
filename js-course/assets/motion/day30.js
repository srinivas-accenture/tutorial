/* Day 30 in motion: how to practise mock interviews, an output-prediction answer, utilities from memory (debounce),
   the five-step system design framework, the autocomplete walkthrough, the cheat sheet and the 30-day checklist.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day30', {
  kicker: 'JavaScript: Zero to Architect · Day 30',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 30, the capstone: rehearse interviews, design a system out loud, and keep a one-page cheat sheet.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Capstone', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 30 · Put it all together', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Mock interviews', 'System design', 'Cheat sheet'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ how to practise */
{ d: 25, title: 'How to practise',
  caps: [
    [0.3, 'A mock interview is a dress rehearsal. Read the question, then answer out loud for 60 to 90 seconds before you look anything up.'],
    [7, 'Give every answer the same shape: a definition, how it works, a short example, and a pitfall.'],
    [13, 'Then open the model answer and write down what you missed. Those gaps become your study list.'],
    [19, 'Interviewers score clarity, trade-offs and edge cases. At senior levels, always say why, not just what.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    K.box(40, 84, 600, 92, { stroke: P.acc, a: K.p(t, 0.4) });
    K.text('Q: What is a closure?', 64, 130, { size: 26, weight: 700, a: K.p(t, 0.6) });
    var cx = 340, cy = 330, r = 110, a = K.p(t, 2);
    g.save(); g.globalAlpha *= a; g.strokeStyle = P.line; g.lineWidth = 14; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
    var u = K.clamp((t - 2.4) / 10.4);
    g.strokeStyle = u > 0.67 ? P.green : P.acc; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u); g.stroke(); g.restore();
    K.text(Math.round(u * 90) + ' s', cx, cy - 10, { size: 40, weight: 800, mono: true, align: 'center', a: a });
    K.text('out loud', cx, cy + 32, { size: 18, color: P.muted, align: 'center', a: a });
    var S = [['1', 'Definition', 'a function + its scope', 7.2], ['2', 'How it works', 'live reference to variables', 8.4], ['3', 'Example', 'a counter factory', 9.6], ['4', 'Pitfall', 'var in loops, leaks', 10.8]];
    S.forEach(function (s, i) {
      var y = 100 + i * 82, q = K.p(t, s[3]);
      K.box(700 + (1 - q) * 30, y, 540, 68, { stroke: P.acc, a: q });
      K.chip(s[0], 734 + (1 - q) * 30, y + 34, { size: 18, weight: 800, stroke: P.acc, color: P.acc, a: q });
      K.text(s[1], 770 + (1 - q) * 30, y + 22, { size: 20, weight: 700, a: q });
      K.text(s[2], 770 + (1 - q) * 30, y + 48, { size: 16, color: P.muted, a: q });
    });
    var m = K.p(t, 13.2);
    K.box(40, 476, 600, 114, { fill: P.code, stroke: P.warm, a: m });
    K.text('model answer: missed', 64, 504, { size: 18, weight: 700, color: P.warm, a: m });
    K.mark(78, 546, false, 0.65, K.p(t, 14.2)); K.text('the var-in-loop pitfall', 102, 546, { size: 18, a: K.p(t, 14.2) });
    K.text('→ study list', 380, 546, { size: 18, weight: 700, color: P.warm, a: K.p(t, 15.6) });
    var sc = K.p(t, 19.2);
    K.box(700, 446, 540, 144, { stroke: P.purple, a: sc });
    K.text('what gets scored', 724, 474, { size: 18, weight: 700, color: P.purple, a: sc });
    ['clarity', 'trade-offs', 'edge cases', 'testing', 'why, not what'].forEach(function (c, i) {
      K.chip(c, [780, 900, 1036, 1170, 800][i] + (i === 4 ? 0 : 0), i < 4 ? 516 : 560, { size: 16, stroke: i === 4 ? P.warm : P.purple, color: i === 4 ? P.warm : P.ink, a: K.p(t, 19.6 + i * 0.5) });
    });
  } },

/* 3 ─ predict the output */
{ d: 24, title: 'Predict the output',
  caps: [
    [0.3, 'A favourite question: predict the output. Answer it the way an engineer would, out loud and step by step.'],
    [6.5, 'Synchronous code runs first: 1, then 5. The timer and both microtasks are only queued.'],
    [12.5, 'Next, every microtask runs in order: 3, then 4. Only after that does the timer task run: 2.'],
    [18.5, 'Then state the rule: sync code, then all microtasks, then the next task. The rule is what earns the points.']],
  draw: function (K, t) {
    var P = K.P, code = ['console.log(1);', 'setTimeout(() => console.log(2));', 'Promise.resolve().then(() => console.log(3));', 'queueMicrotask(() => console.log(4));', 'console.log(5);'];
    var hi = t > 17 ? -1 : t > 15.4 ? 1 : t > 14.2 ? 3 : t > 13 ? 2 : t > 9.4 ? -1 : t > 8.8 ? 4 : t > 8.2 ? 3 : t > 7.6 ? 2 : t > 7 ? 1 : t > 6.6 ? 0 : -1;
    K.panel(40, 84, 640, 230, 'order.js');
    K.code(code, 64, 134, { size: 20, lh: 1.55, n: K.typed(t, code, [0.8, 1.6, 2.6, 3.8, 4.8], 34), t: t, w: 610, hi: hi });
    function lane(y, label, color, a) { K.box(720, y - 30, 520, 60, { fill: P.code, stroke: color, a: a }); K.text(label, 744, y, { size: 18, weight: 700, color: color, a: a }); }
    lane(124, 'microtasks', P.purple, K.p(t, 6.8));
    lane(204, 'task queue', P.acc, K.p(t, 6.8));
    var m3 = K.back((t - 7.8) / 0.4), m4 = K.back((t - 8.9) / 0.4), t2 = K.back((t - 7.2) / 0.4);
    var o3 = K.p(t, 13.2, 0.4), o4 = K.p(t, 14.4, 0.4), o2 = K.p(t, 15.6, 0.4);
    if (m3 > 0) K.chip('log 3', 1030, 124, { s: m3, a: K.clamp(m3) * (1 - o3), mono: true, size: 17, stroke: P.purple });
    if (m4 > 0) K.chip('log 4', 1140, 124, { s: m4, a: K.clamp(m4) * (1 - o4), mono: true, size: 17, stroke: P.purple });
    if (t2 > 0) K.chip('log 2', 1030, 204, { s: t2, a: K.clamp(t2) * (1 - o2), mono: true, size: 17, stroke: P.acc });
    K.panel(40, 340, 640, 120, 'Console', { a: K.p(t, 6.6) });
    [['1', 7, P.ink], ['5', 9.4, P.ink], ['3', 13.4, P.purple], ['4', 14.6, P.purple], ['2', 15.8, P.acc]].forEach(function (o, i) {
      K.text(o[0], 70 + i * 60, 410, { size: 30, mono: true, weight: 700, color: o[2], align: 'center', a: K.p(t, o[1], 0.3) });
    });
    K.text('sync', 100, 444, { size: 16, color: P.muted, align: 'center', a: K.p(t, 10) });
    K.text('microtasks', 220, 444, { size: 16, color: P.purple, align: 'center', a: K.p(t, 15) });
    K.text('task', 310, 444, { size: 16, color: P.acc, align: 'center', a: K.p(t, 16.2) });
    var r = K.p(t, 18.8);
    K.box(720, 280, 520, 180, { stroke: P.green, lw: 3, a: r });
    K.text('the rule', 744, 310, { size: 18, weight: 700, color: P.green, a: r });
    ['1 · run all synchronous code', '2 · drain every microtask', '3 · take the next task, repeat'].forEach(function (s, i) {
      K.text(s, 744, 352 + i * 36, { size: 20, a: K.p(t, 19.2 + i * 0.6) });
    });
    K.chip('say why, not just what', 980, 520, { size: 20, stroke: P.warm, color: P.warm, a: K.p(t, 21.6) });
    K.text('1 5 3 4 2', 360, 540, { size: 26, mono: true, weight: 800, color: P.green, align: 'center', a: K.p(t, 17) });
  } },

/* 4 ─ utilities from memory */
{ d: 24, title: 'Utilities from memory',
  caps: [
    [0.3, 'Coding rounds ask for small utilities. Be able to write them from memory: bind, debounce, throttle, memoize, curry, Promise.all.'],
    [7.5, 'Here is debounce. Every call cancels the pending timer and starts a new one, so only the last call in a burst runs.'],
    [15, 'Talk through the edge cases as you go: arguments, this, a cancel method, a leading-edge option. Then prove it with tests.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    ['bind', 'debounce', 'throttle', 'memoize', 'curry', 'Promise.all', 'deepClone'].forEach(function (c, i) {
      var q = K.back((t - 1 - i * 0.4) / 0.5); if (q <= 0) return;
      K.chip(c, 120 + i * 170, 112, { s: q, a: K.clamp(q), mono: true, size: 19, stroke: i === 1 ? P.warm : P.acc, color: i === 1 ? P.warm : P.ink });
    });
    K.text('write each one without looking, then run the tests', 640, 300, { size: 22, color: P.muted, align: 'center', a: K.win(t, 3.6, 7.4) });
    var code = ['function debounce(fn, ms) {', '  let id;', '  return function (...args) {', '    clearTimeout(id);', '    id = setTimeout(() => fn.apply(this, args), ms);', '  };', '}'];
    K.panel(40, 160, 680, 270, 'debounce.js', { a: K.p(t, 7.6) });
    K.code(code, 64, 206, { size: 19, lh: 1.55, n: K.typed(t, code, [7.9, 8.8, 9.4, 10.4, 11.2, 12.8, 13], 36), t: t, a: K.p(t, 7.6), w: 650,
      hi: t > 15.4 && t < 18 ? 2 : t > 11.2 && t < 14.6 ? 4 : t > 10.4 && t < 11.2 ? 3 : -1 });
    var X0 = 780, X1 = 1220, y = 250, a = K.p(t, 9);
    K.text('calls', 760, 206, { size: 17, weight: 700, color: P.blue, a: a });
    K.arrow(X0, y, X1, y, { color: P.line, lw: 3, a: a });
    [0, 40, 70, 95].forEach(function (c, i) {
      var q = K.back((t - 9.6 - i * 0.6) / 0.4); if (q <= 0) return;
      g.save(); g.globalAlpha *= K.clamp(q); g.fillStyle = P.blue; g.beginPath(); g.arc(X0 + 20 + c * 2.2, y, 8 * q, 0, 7); g.fill(); g.restore();
      if (i < 3) K.text('×', X0 + 20 + c * 2.2, y + 32, { size: 20, color: P.red, align: 'center', a: K.p(t, 10.2 + i * 0.6) });
    });
    K.box(X0 + 20 + 95 * 2.2, y - 6, 100 * K.p(t, 12.4, 1.2), 12, { fill: 'rgba(246,173,85,.5)', r: 4, a: K.p(t, 12.4) });
    K.text('wait ms', X0 + 20 + 95 * 2.2 + 50, y - 26, { size: 16, color: P.warm, align: 'center', a: K.p(t, 12.6) });
    K.chip('fn runs once', 1150, 320, { size: 18, stroke: P.green, color: P.green, a: K.p(t, 13.8) });
    K.text('cancelled', 840, 320, { size: 16, color: P.red, a: K.p(t, 11) });
    var e = K.p(t, 15.2);
    K.box(40, 454, 1200, 136, { fill: P.code, stroke: P.line, a: e });
    K.text('edge cases to say out loud', 64, 482, { size: 18, weight: 700, color: P.warm, a: e });
    [['keep this + args', 15.6], ['add .cancel()', 16.4], ['leading-edge option', 17.2], ['fake timers in tests', 18.4]].forEach(function (c, i) {
      K.mark(80 + i * 290, 540, true, 0.7, K.p(t, c[1])); K.text(c[0], 104 + i * 290, 540, { size: 18, a: K.p(t, c[1]) });
    });
  } },

/* 5 ─ system design framework */
{ d: 24, title: 'System design in 5 steps',
  caps: [
    [0.3, 'System design rounds test how you structure an open problem, not one right answer. Use five steps, in order.'],
    [6.5, 'Requirements first: what it does, and the non-functional needs like latency, scale, offline support and accessibility.'],
    [13, 'Then the architecture, the data model and API, and performance, accessibility and security.'],
    [18.5, 'Finish with observability and rollout: how you will know it works, and how you will undo it if it does not.']],
  draw: function (K, t) {
    var P = K.P;
    var S = [['Requirements', ['functional + non-functional', 'latency · scale · offline', 'out of scope'], P.warm, 6.7],
             ['Architecture', ['components · boundaries', 'rendering strategy', 'state + caching'], P.acc, 13.2],
             ['Data + API', ['entities · endpoints', 'pagination · real-time', 'error contract'], P.blue, 14.4],
             ['Perf · a11y · security', ['budgets · virtualization', 'ARIA + keyboard', 'XSS · CSRF · privacy'], P.purple, 15.6],
             ['Observe + roll out', ['metrics · errors', 'feature flags', 'rollback plan'], P.green, 18.8]];
    S.forEach(function (s, i) {
      var x = 40 + i * 244, q = K.back((t - 1 - i * 0.4) / 0.5); if (q <= 0) return;
      var on = K.p(t, s[3]);
      K.box(x, 120, 222, 90, { stroke: s[2], lw: on > 0.5 ? 3.5 : 2, a: K.clamp(q) });
      K.text(String(i + 1), x + 22, 146, { size: 20, weight: 800, color: s[2], a: K.clamp(q) });
      K.text(s[0], x + 111, 178, { size: i === 3 ? 18 : 20, weight: 700, align: 'center', a: K.clamp(q) });
      if (i) K.arrow(x - 20, 165, x - 4, 165, { color: P.muted, a: K.clamp(q), head: 9, lw: 2 });
      s[1].forEach(function (l, k) {
        K.text(l, x + 111, 252 + k * 34, { size: 16, color: P.muted, align: 'center', a: K.p(t, s[3] + 0.3 + k * 0.4) });
      });
    });
    K.text('the order matters: never jump straight to components', 640, 400, { size: 20, color: P.warm, align: 'center', a: K.p(t, 3.4) });
    var q = K.p(t, 8.4);
    K.box(40, 440, 1200, 150, { fill: P.code, stroke: P.warm, a: q });
    K.text('ask first', 64, 468, { size: 18, weight: 700, color: P.warm, a: q });
    ['How many users and queries per day?', 'Which devices, networks and browsers?', 'Must it work offline? Which languages?', 'What does fast mean here, in ms?'].forEach(function (s, i) {
      K.text('“' + s + '”', 64 + (i % 2) * 590, 510 + Math.floor(i / 2) * 44, { size: 19, a: K.p(t, 8.8 + i * 0.8) });
    });
  } },

/* 6 ─ worked example: autocomplete */
{ d: 27, title: 'Worked example: autocomplete',
  caps: [
    [0.3, 'A worked example: search autocomplete. Each keystroke is debounced, and nothing is sent while an IME is still composing.'],
    [7.5, 'A small LRU cache answers repeated prefixes instantly. On a miss, abort the previous request and fetch the new one.'],
    [14, 'If an old response arrives late, it must not overwrite a newer one, so compare request ids before rendering.'],
    [20, 'Render an ARIA combobox: arrow keys, Enter and Escape work, and screen readers hear how many results there are.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    var F = [['keystroke', '', P.muted, 0.6], ['debounce', '~200 ms · IME', P.warm, 1.6], ['cache hit?', 'LRU by prefix', P.green, 7.8], ['fetch /suggest', 'abort previous', P.blue, 9.6], ['latest only', 'compare ids', P.red, 14.2], ['combobox', 'ARIA + keys', P.purple, 20.2]];
    F.forEach(function (f, i) {
      var x = 40 + i * 205, q = K.back((t - f[3]) / 0.5); if (q <= 0) return;
      K.box(x, 96, 185, 84, { stroke: f[2], a: K.clamp(q) });
      K.text(f[0], x + 92, f[1] ? 124 : 138, { size: 19, weight: 700, align: 'center', a: K.clamp(q) });
      if (f[1]) K.text(f[1], x + 92, 156, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      if (i) K.arrow(x - 18, 138, x - 3, 138, { color: P.muted, a: K.clamp(q), head: 9, lw: 2 });
    });
    /* input */
    var typed = 'javascr'.slice(0, Math.max(0, Math.min(7, Math.floor((t - 2) * 3))));
    K.box(40, 210, 420, 52, { fill: P.code, stroke: P.acc, a: K.p(t, 1.8) });
    K.text(typed + (Math.floor(t * 2.5) % 2 ? '' : '|'), 60, 236, { size: 21, mono: true, a: K.p(t, 1.8) });
    K.text('one request after typing pauses, not 7', 480, 236, { size: 17, color: P.warm, a: K.p(t, 4.6) });
    /* cache */
    var c = K.p(t, 8);
    K.box(40, 290, 420, 120, { fill: P.code, stroke: P.green, a: c });
    K.text('cache', 60, 316, { size: 17, weight: 700, color: P.green, a: c });
    K.text('"java" → 8 results', 60, 350, { size: 18, mono: true, a: K.p(t, 8.4) });
    K.text('"javas" → 8 results', 60, 382, { size: 18, mono: true, a: K.p(t, 8.8) });
    K.text('backspace = instant', 300, 350, { size: 16, color: P.green, a: K.p(t, 9.2) });
    /* race */
    var X0 = 520, X1 = 1220, a = K.p(t, 9.8);
    K.text('requests', 520, 300, { size: 17, weight: 700, color: P.blue, a: a });
    K.box(X0, 316, 520, 30, { fill: 'rgba(99,179,237,.2)', stroke: P.blue, r: 6, a: K.p(t, 10) });
    K.text('#1 "javas" (slow)', X0 + 12, 331, { size: 16, mono: true, a: K.p(t, 10) });
    K.box(X0 + 120, 360, 200, 30, { fill: 'rgba(104,211,145,.2)', stroke: P.green, r: 6, a: K.p(t, 11) });
    K.text('#2 "javascr"', X0 + 132, 375, { size: 16, mono: true, a: K.p(t, 11) });
    K.mark(X0 + 350, 375, true, 0.6, K.p(t, 12)); K.text('rendered', X0 + 372, 375, { size: 16, color: P.green, a: K.p(t, 12) });
    K.mark(X0 + 550, 331, false, 0.6, K.p(t, 14.6)); K.text('late: ignored', X0 + 572, 331, { size: 16, color: P.red, a: K.p(t, 14.6) });
    K.text('if (id !== latestId) return;', X0, 412, { size: 18, mono: true, color: P.acc, a: K.p(t, 15.6) });
    K.text('AbortController cancels #1 when #2 starts', X0 + 330, 412, { size: 16, color: P.muted, a: K.p(t, 16.6) });
    /* combobox */
    var b = K.p(t, 20.4);
    K.box(40, 440, 420, 150, { fill: P.code, stroke: P.purple, a: b });
    K.box(56, 452, 388, 36, { fill: 'rgba(183,148,244,.2)', r: 6, a: K.p(t, 21.4) });
    ['javascript', 'javascript tutorial', 'javascript array'].forEach(function (s, i) {
      K.text(s, 72, 470 + i * 40, { size: 18, a: b });
    });
    var ar = ['role="combobox"', 'aria-expanded="true"', 'aria-activedescendant="opt-1"', '"3 results" announced'];
    ar.forEach(function (s, i) { K.text(s, 500, 470 + i * 34, { size: 17, mono: i < 3, color: i < 3 ? P.purple : P.green, a: K.p(t, 21 + i * 0.6) }); });
    K.text('↑ ↓ Enter Esc', 1000, 470, { size: 20, mono: true, weight: 700, a: K.p(t, 22.4) });
  } },

/* 7 ─ cheat sheet: language and async */
{ d: 24, title: 'Cheat sheet: language',
  caps: [
    [0.3, 'The cheat sheet is a pocket map of all 30 days. Language first: seven primitives plus objects, and eight falsy values.'],
    [7.5, 'Use triple equals. let and const are block-scoped, with a temporal dead zone. Closures keep a live reference to their scope.'],
    [15, 'Async: sync code, then all microtasks, then the next task. In Node, nextTick runs before promises, then the loop phases.']],
  draw: function (K, t) {
    var P = K.P;
    function card(x, y, w, h, title, lines, color, t0) {
      var q = K.p(t, t0, 0.5);
      K.box(x, y + (1 - q) * 20, w, h, { stroke: color, a: q });
      K.text(title, x + 20, y + 28 + (1 - q) * 20, { size: 20, weight: 700, color: color, a: q });
      lines.forEach(function (l, i) { K.text(l, x + 20, y + 66 + i * 32 + (1 - q) * 20, { size: 17, mono: l.charAt(0) !== '·', a: K.p(t, t0 + 0.4 + i * 0.4) }); });
    }
    card(40, 84, 590, 160, 'Types', ['string number bigint boolean', 'undefined null symbol + object', 'typeof null === "object"'], P.acc, 0.8);
    card(650, 84, 590, 160, 'Falsy (8)', ['false 0 -0 0n "" null', 'undefined NaN', 'everything else is truthy'], P.warm, 3.4);
    card(40, 264, 590, 160, 'Equality + scope', ['=== always (x == null is the idiom)', 'let/const: block scope + TDZ', 'closure = function + live scope'], P.blue, 7.8);
    card(650, 264, 590, 160, 'this', ['new > call/apply/bind', '> obj.method() > default', 'arrow functions: lexical this'], P.purple, 10.6);
    card(40, 444, 590, 146, 'Browser event loop', ['sync → all microtasks → render?', '→ next task → microtasks …'], P.green, 15.2);
    card(650, 444, 590, 146, 'Node loop', ['timers → pending → poll → check', 'nextTick queue before promises'], P.red, 18);
  } },

/* 8 ─ cheat sheet: browser, engine, architecture */
{ d: 25, title: 'Cheat sheet: platform',
  caps: [
    [0.3, 'Browser: events capture, reach the target, then bubble. Layout costs more than paint, and paint more than compositing.'],
    [6.5, 'Security: textContent instead of innerHTML, a strict CSP, and HttpOnly, Secure, SameSite cookies.'],
    [12.5, 'Performance: keep object shapes stable, and measure Web Vitals in the field: LCP 2.5 s, INP 200 ms, CLS 0.1.'],
    [19, 'Architecture: mix rendering per route, keep state local first, design forgiving APIs, and observe everything you ship.']],
  draw: function (K, t) {
    var g = K.g, P = K.P;
    K.box(40, 84, 590, 240, { stroke: P.blue, a: K.p(t, 0.4) });
    K.text('Events', 64, 112, { size: 20, weight: 700, color: P.blue, a: K.p(t, 0.4) });
    ['window', 'body', 'button'].forEach(function (n, i) {
      var q = K.p(t, 0.8 + i * 0.3);
      K.box(80 + i * 40, 140 + i * 40, 280 - i * 80, 150 - i * 40 - (i === 2 ? 10 : 0), { fill: false, stroke: P.line, a: q });
      K.text(n, 96 + i * 40, 158 + i * 40, { size: 16, mono: true, color: P.muted, a: q });
    });
    K.arrow(400, 150, 400, 250, { p: K.p(t, 1.8, 0.8), color: P.warm }); K.text('capture', 412, 196, { size: 16, color: P.warm, a: K.p(t, 2) });
    K.arrow(500, 250, 500, 150, { p: K.p(t, 3, 0.8), color: P.green }); K.text('bubble', 512, 196, { size: 16, color: P.green, a: K.p(t, 3.2) });
    var C = [['layout', 220, P.red], ['paint', 140, P.warm], ['composite', 60, P.green]];
    K.box(650, 84, 590, 240, { stroke: P.warm, a: K.p(t, 3.6) });
    K.text('Rendering cost', 674, 112, { size: 20, weight: 700, color: P.warm, a: K.p(t, 3.6) });
    C.forEach(function (c, i) {
      var y = 160 + i * 52, q = K.p(t, 4 + i * 0.5, 0.8);
      K.text(c[0], 674, y, { size: 18, mono: true, a: q }); K.box(800, y - 12, c[1] * 1.8 * q, 24, { fill: c[2], r: 5, a: q });
    });
    K.text('animate transform + opacity', 674, 300, { size: 16, color: P.muted, a: K.p(t, 5.6) });
    var s = K.p(t, 6.7);
    K.box(40, 344, 590, 246, { stroke: P.red, a: s });
    K.text('Security', 64, 372, { size: 20, weight: 700, color: P.red, a: s });
    [['el.textContent = input', true], ['el.innerHTML = input', false], ['strict CSP + Trusted Types', true], ['HttpOnly; Secure; SameSite', true]].forEach(function (r, i) {
      var q = K.p(t, 7.2 + i * 0.8), y = 414 + i * 42;
      K.mark(80, y, r[1], 0.65, q); K.text(r[0], 104, y, { size: 18, mono: true, color: r[1] ? P.ink : P.red, a: q });
    });
    var v = K.p(t, 12.7);
    K.box(650, 344, 590, 120, { stroke: P.green, a: v });
    K.text('Web Vitals (p75, field data)', 674, 372, { size: 19, weight: 700, color: P.green, a: v });
    [['LCP ≤ 2.5 s', 760], ['INP ≤ 200 ms', 945], ['CLS ≤ 0.1', 1120]].forEach(function (c, i) {
      K.chip(c[0], c[1], 422, { mono: true, size: 18, stroke: P.green, a: K.p(t, 13.4 + i * 0.6) });
    });
    var ar = K.p(t, 19.2);
    K.box(650, 478, 590, 112, { stroke: P.purple, a: ar });
    K.text('Architecture', 674, 504, { size: 19, weight: 700, color: P.purple, a: ar });
    [['rendering per route', 905], ['state local first', 1095], ['cursor + idempotency', 905], ['observe + flags', 1085]].forEach(function (c, i) {
      K.chip(c[0], c[1], i < 2 ? 510 : 558, { size: 16, stroke: P.purple, a: K.p(t, 19.6 + i * 0.5) });
    });
  } },

/* 9 ─ the 30-day checklist */
{ d: 24, title: 'Your 30-day checklist',
  caps: [
    [0.3, 'Before an interview, check yourself against this list. Every line should feel easy to explain.'],
    [5.5, 'Can you predict mixed promise and timer output, and write the classic utilities from memory?'],
    [11.5, 'Can you diagnose a slow or leaking page in DevTools, secure a page, and defend a rendering choice?'],
    [17.5, 'And can you teach any topic in two minutes: once to a five-year-old, and once to an expert?']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Your 30-day checklist', 640, 110, { size: 40, weight: 800, align: 'center', a: K.p(t, 0.4) });
    var L = [['Predict sync / promise / timer output and explain it', 6], ['Write bind, debounce, throttle, memoize, curry, Promise.all', 8],
             ['Diagnose a slow page and a leaking page in DevTools', 12], ['Secure a page against XSS and CSRF; explain CORS', 13.6],
             ['Choose a rendering strategy and defend the trade-offs', 15.2], ['Teach any topic in two minutes, two ways', 18]];
    L.forEach(function (l, i) {
      var y = 178 + i * 60, q = K.p(t, 1.4 + i * 0.4, 0.5);
      K.box(170, y - 24, 48, 48, { stroke: P.line, r: 10, a: q });
      K.mark(194, y, true, 1, K.p(t, l[1], 0.4));
      K.text(l[0], 244, y, { size: 23, a: q, color: t > l[1] ? P.ink : P.muted });
    });
    K.chip('5-year-old version', 450, 548, { size: 19, stroke: P.warm, color: P.warm, a: K.p(t, 19.6) });
    K.chip('technical version', 830, 548, { size: 19, stroke: P.blue, color: P.blue, a: K.p(t, 20.4) });
  } },

/* 10 ─ recap */
{ d: 15, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 30 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Answer out loud first: definition, how, example, pitfall',
     'Predict output with the rule: sync, microtasks, next task',
     'Write the classic utilities from memory, then test them',
     'System design: requirements, architecture, data, quality, rollout',
     'Autocomplete: debounce, cache, abort, latest only, ARIA',
     'Keep the cheat sheet, and teach each line in two minutes'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 30 examples with ▶ Run', 640, 540, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
