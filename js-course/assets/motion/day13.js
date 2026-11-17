/* Day 13 in motion: one thread and the host, one turn of the event loop, tracing sync / microtasks / tasks,
   run-to-completion and long tasks, microtask starvation, and three output puzzles solved with three rules.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day13', {
  kicker: 'JavaScript: Zero to Architect · Day 13',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 13: the event loop, and how to predict the order of any mix of sync code, promises and timers.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('The event loop', 0, 0, { size: 100, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 13 · One thread, many queues', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Call stack', 'Tasks and microtasks', 'Output puzzles'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the pieces */
{ d: 24, title: 'One thread and the host',
  caps: [
    [0.3, 'JavaScript runs your code on one main thread. Like a kitchen with one chef, it does one thing at a time.'],
    [7, 'Slow waiting, like timers and network requests, is done by the host, off the main thread.'],
    [12.5, 'When that work is done, its callback is queued. Timers, clicks and messages go into the task queue.'],
    [18, 'Promise reactions and queueMicrotask go into a separate, more urgent line: the microtask queue.']],
  draw: function (K, t) {
    var P = K.P, a = K.p(t, 0.4);
    K.box(40, 84, 300, 496, { fill: P.code, stroke: P.purple, a: a });
    K.text('Call stack', 190, 112, { size: 21, weight: 700, color: P.purple, align: 'center', a: a });
    K.text('one thread: one frame runs', 190, 142, { size: 15, color: P.muted, align: 'center', a: a });
    ['main()', 'onClick()', 'render()'].forEach(function (f, i) {
      var q = K.p(t, 1.6 + i * 0.6, 0.5);
      K.box(70, 520 - i * 60 - (1 - q) * 26, 240, 46, { fill: P.card, stroke: P.purple, a: q });
      K.text(f, 190, 543 - i * 60 - (1 - q) * 26, { size: 19, mono: true, align: 'center', a: q });
    });
    K.text('one chef, one dish at a time', 190, 300, { size: 17, color: P.warm, align: 'center', a: K.p(t, 3.6) });
    var h = K.p(t, 7.2);
    K.box(380, 84, 860, 150, { stroke: P.blue, a: h, dash: [8, 6] });
    K.text('Host (browser or Node): waits off the main thread', 404, 112, { size: 19, weight: 700, color: P.blue, a: h });
    ['timer: 100 ms', 'fetch in flight', 'click listener'].forEach(function (s, i) {
      K.chip(s, 520 + i * 260, 176, { mono: true, size: 18, stroke: P.blue, a: K.p(t, 7.8 + i * 0.7) });
    });
    var tq = K.p(t, 12.7);
    K.box(380, 268, 860, 130, { fill: P.code, stroke: P.green, a: tq });
    K.text('Task queue (macrotasks)', 1216, 292, { size: 19, weight: 700, color: P.green, align: 'right', a: tq });
    ['timer callback', 'click handler', 'message event'].forEach(function (s, i) {
      var q = K.back((t - 13.6 - i * 0.8) / 0.5);
      if (q > 0) K.chip(s, 520 + i * 260, 350, { size: 18, stroke: P.green, s: q });
    });
    K.arrow(520, 200, 520, 326, { p: K.p(t, 13.2, 0.5), color: P.muted, lw: 2 });
    var mq = K.p(t, 18.2);
    K.box(380, 430, 860, 130, { fill: P.code, stroke: P.warm, a: mq });
    K.text('Microtask queue (urgent)', 1216, 454, { size: 19, weight: 700, color: P.warm, align: 'right', a: mq });
    ['promise.then(fn)', 'await continuation', 'queueMicrotask(fn)'].forEach(function (s, i) {
      var q = K.back((t - 19 - i * 0.8) / 0.5);
      if (q > 0) K.chip(s, 520 + i * 260, 512, { mono: true, size: 17, stroke: P.warm, s: q });
    });
  } },

/* 3 ─ one turn */
{ d: 26, title: 'One turn of the loop',
  caps: [
    [0.3, 'One turn of the event loop starts by taking the oldest task, and running it to completion.'],
    [6.5, 'Then it drains the microtask queue completely, including microtasks added while draining.'],
    [12.5, 'Then, if it is time to render, about every 16 milliseconds, it runs requestAnimationFrame callbacks, then style, layout and paint.'],
    [20, 'Then the next task. Nothing ever interrupts a running task.']],
  draw: function (K, t) {
    var P = K.P, g = K.g, cx = 400, cy = 330, R = 190;
    var S = [['1 · one task', 'run to completion', P.green, -Math.PI / 2, 0.6], ['2 · all microtasks', 'until the queue is empty', P.warm, Math.PI / 6, 6.8],
             ['3 · render?', 'rAF, style, layout, paint', P.blue, 5 * Math.PI / 6, 12.8]];
    var a = K.p(t, 0.3), on = t < 6.5 ? 0 : t < 12.5 ? 1 : t < 20 ? 2 : -1;
    g.save(); g.globalAlpha *= a * 0.6; g.strokeStyle = P.line; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.restore();
    if (t > 20) {   /* the loop goes round again */
      var ang = -Math.PI / 2 + K.clamp((t - 20) / 4) * 2 * Math.PI;
      g.save(); g.fillStyle = P.acc; g.beginPath(); g.arc(cx + R * Math.cos(ang), cy + R * Math.sin(ang), 11, 0, 7); g.fill(); g.restore();
    }
    S.forEach(function (s, i) {
      var x = cx + R * Math.cos(s[3]), y = cy + R * Math.sin(s[3]), q = K.back((t - s[4]) / 0.6);
      if (q <= 0) return;
      g.save(); g.translate(x, y); g.scale(q, q);
      K.box(-120, -44, 240, 88, { stroke: s[2], lw: on === i ? 4 : 2, a: K.clamp(q) });
      K.text(s[0], 0, -12, { size: 21, weight: 700, color: s[2], align: 'center', a: K.clamp(q) });
      K.text(s[1], 0, 18, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      g.restore();
    });
    K.text('event loop', cx, cy, { size: 26, weight: 800, align: 'center', color: P.acc, a: a });
    K.text('never interrupted', cx, cy + 34, { size: 17, color: P.muted, align: 'center', a: K.p(t, 20.6) });
    /* right: detail per step */
    var x0 = 760;
    K.box(x0, 92, 480, 140, { fill: P.code, stroke: P.green, a: K.p(t, 1) });
    K.text('task queue', x0 + 22, 118, { size: 17, weight: 700, color: P.green, a: K.p(t, 1) });
    ['click', 'timer', 'msg'].forEach(function (s, i) {
      var go = i === 0 ? K.p(t, 3, 0.8) : i === 1 ? K.p(t, 21, 0.8) : 0;
      K.chip(s, x0 + 80 + i * 120, 172 - go * 30, { size: 18, stroke: P.green, a: K.p(t, 1.4 + i * 0.3) * (1 - go) });
    });
    K.text('only ONE task per turn', x0 + 240, 210, { size: 16, color: P.muted, align: 'center', a: K.p(t, 4) });
    K.box(x0, 252, 480, 140, { fill: P.code, stroke: P.warm, a: K.p(t, 6.8) });
    K.text('microtask queue', x0 + 22, 278, { size: 17, weight: 700, color: P.warm, a: K.p(t, 6.8) });
    ['m1', 'm2', 'm3 (added by m1)'].forEach(function (s, i) {
      var app = K.p(t, i < 2 ? 7.2 + i * 0.4 : 9, 0.4), go = K.p(t, 8.6 + i * 1.1, 0.5);
      K.chip(s, x0 + 70 + i * 110 + (i === 2 ? 60 : 0), 332, { mono: true, size: 17, stroke: P.warm, a: app * (1 - go) });
    });
    K.text('drained: empty before moving on', x0 + 240, 370, { size: 16, color: P.muted, align: 'center', a: K.p(t, 11.6) });
    K.box(x0, 412, 480, 160, { fill: P.code, stroke: P.blue, a: K.p(t, 12.8) });
    K.text('rendering (if due)', x0 + 22, 438, { size: 17, weight: 700, color: P.blue, a: K.p(t, 12.8) });
    ['rAF', 'style', 'layout', 'paint'].forEach(function (s, i) {
      var q = K.p(t, 14 + i * 0.7);
      K.chip(s, x0 + 70 + i * 112, 492, { size: 18, stroke: P.blue, a: q });
      if (i) K.arrow(x0 + 70 + i * 112 - 72, 492, x0 + 70 + i * 112 - 44, 492, { p: q, color: P.muted, lw: 2, head: 9 });
    });
    K.text('~16.7 ms at 60 Hz, skipped in hidden tabs', x0 + 240, 544, { size: 16, color: P.muted, align: 'center', a: K.p(t, 17) });
  } },

/* 4 ─ trace example */
{ d: 30, title: 'Tracing the queues',
  caps: [
    [0.3, 'Let us trace this. The script itself is the first task. Line one logs 1 sync.'],
    [6, 'setTimeout hands its callback to a timer. When the timer fires, the callback joins the task queue.'],
    [12, 'The promise reaction and the queueMicrotask callback join the microtask queue, in that order.'],
    [18, 'Line five logs 2 sync. The script ends and the stack is empty, so microtasks drain: 3, then 4.'],
    [25, 'Only then can the next task run: the timer callback, 5.']],
  draw: function (K, t) {
    var P = K.P, code = ['console.log("1 sync");', 'setTimeout(() => console.log("5 task"), 0);', 'Promise.resolve().then(() => console.log("3 micro"));',
      'queueMicrotask(() => console.log("4 micro"));', 'console.log("2 sync");'];
    var hi = t > 25 ? -1 : t > 18 ? 4 : t > 14.4 ? 3 : t > 12 ? 2 : t > 6 ? 1 : t > 1.6 ? 0 : -1;
    K.panel(40, 84, 760, 230, 'trace.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 130, { size: 20, n: K.typed(t, code, [0.4, 0.6, 0.8, 1, 1.2], 200), t: t, hi: hi, w: 720, a: K.p(t, 0.2) });
    K.panel(840, 84, 400, 230, 'Console', { a: K.p(t, 0.2) });
    [['1 sync', 2.6], ['2 sync', 19], ['3 micro', 22], ['4 micro', 23.4], ['5 task', 26.4]].forEach(function (o, i) {
      K.text(o[0], 870, 134 + i * 36, { size: 21, mono: true, color: i === 4 ? P.green : i > 1 ? P.warm : P.ink, a: K.p(t, o[1], 0.3) });
    });
    [['Call stack', P.purple, 360], ['Task queue', P.green, 440], ['Microtask queue', P.warm, 520]].forEach(function (l) {
      K.box(40, l[2] - 32, 1200, 64, { fill: P.code, stroke: l[1], a: K.p(t, 0.6) });
      K.text(l[0], 60, l[2], { size: 18, weight: 700, color: l[1], a: K.p(t, 0.6) });
    });
    K.chip('script (task 1)', 360, 360, { mono: true, size: 18, stroke: P.purple, a: K.p(t, 1) * (1 - K.p(t, 20.6, 0.5)) });
    var tm = K.back((t - 7) / 0.5);
    if (tm > 0) K.chip('host timer: 0 ms', 1120, 440, { size: 17, stroke: P.blue, s: tm, a: 1 - K.p(t, 10.4, 0.4) });
    K.arrow(1030, 440, 990, 440, { p: K.p(t, 9.6, 0.5), color: P.blue, lw: 2, a: 1 - K.p(t, 11, 0.4) });
    var tq = K.p(t, 10, 0.6), run5 = K.p(t, 25.6, 0.8);
    if (t > 10) K.chip('() => log("5 task")', 870, 440 - run5 * 80, { mono: true, size: 17, stroke: P.green, a: tq * (1 - K.p(t, 27.6, 0.5)) });
    var m3 = K.back((t - 12.8) / 0.5), m4 = K.back((t - 14.8) / 0.5), o3 = K.p(t, 21, 0.8), o4 = K.p(t, 22.6, 0.8);
    if (m3 > 0) K.chip('log("3 micro")', 400, 520 - o3 * 160, { mono: true, size: 17, stroke: P.warm, s: m3, a: 1 - K.p(t, 22, 0.4) });
    if (m4 > 0) K.chip('log("4 micro")', 620, 520 - o4 * 160, { mono: true, size: 17, stroke: P.warm, s: m4, a: 1 - K.p(t, 23.6, 0.4) });
    K.text('stack empty → drain microtasks', 1050, 360, { size: 16, color: P.warm, align: 'center', a: K.win(t, 20.6, 25) });
    K.text('next task', 1050, 360, { size: 16, color: P.green, align: 'center', a: K.p(t, 25.2) });
  } },

/* 5 ─ run to completion */
{ d: 22, title: 'Run to completion',
  caps: [
    [0.3, 'A timer cannot interrupt running code. This timer is due at once, but a busy loop holds the thread for 80 milliseconds.'],
    [8, 'The callback waits in the task queue until the loop ends. The delay of setTimeout is a minimum, not a guarantee.'],
    [15, 'During a long task the page cannot respond to clicks or paint. Tasks over 50 milliseconds count as long tasks.']],
  draw: function (K, t) {
    var P = K.P, code = ['const start = performance.now();', 'setTimeout(() => log("timer"), 0);', 'while (performance.now() - start < 80) {}', 'log("busy loop finished first");'];
    K.panel(40, 84, 720, 200, 'block.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 130, { size: 20, n: K.typed(t, code, [0.6, 1.8, 3.2, 5], 36), t: t, hi: t > 3.2 && t < 8 ? 2 : -1, w: 690, a: K.p(t, 0.2) });
    K.panel(800, 84, 440, 200, 'Console', { a: K.p(t, 0.2) });
    K.text('busy loop finished first', 826, 140, { size: 19, mono: true, a: K.p(t, 9.6) });
    K.text('timer   (after ≥ 80 ms)', 826, 180, { size: 19, mono: true, color: P.warm, a: K.p(t, 11.4) });
    var x0 = 140, sc = 10, ax = K.p(t, 2.6);
    K.arrow(x0, 410, 1200, 410, { color: P.line, lw: 2, a: ax });
    [0, 20, 40, 60, 80, 100].forEach(function (ms) { K.text(ms + ' ms', x0 + ms * sc, 436, { size: 15, color: P.muted, align: 'center', a: ax }); });
    K.text('main thread', 40, 369, { size: 16, color: P.muted, a: ax });
    var w = K.p(t, 3.4, 4) * 80 * sc;
    K.box(x0, 346, w, 46, { fill: P.red, r: 8, a: 0.75 });
    K.text('busy while loop: 80 ms', x0 + 18, 369, { size: 18, weight: 700, color: P.bg, a: K.p(t, 4.4) });
    K.box(x0 + 80 * sc + 4, 346, 70 * K.p(t, 10.8, 0.6), 46, { fill: P.warm, r: 8, a: 0.85 });
    K.text('timer', x0 + 80 * sc + 16, 369, { size: 17, weight: 700, color: P.bg, a: K.p(t, 11.2) });
    var due = K.p(t, 6);
    K.arrow(x0 + 2, 300, x0 + 2, 338, { color: P.warm, a: due, lw: 2 });
    K.text('timer due here (0 ms)', x0 + 14, 306, { size: 16, color: P.warm, a: due });
    K.curve(x0 + 30, 470, x0 + 400, 520, x0 + 80 * sc + 30, 400, { p: K.p(t, 8.6, 1.4), color: P.warm, dash: [7, 7], lw: 2.5 });
    K.text('waiting in the task queue', x0 + 400, 518, { size: 16, color: P.warm, align: 'center', a: K.p(t, 9) * (1 - K.p(t, 15, 0.4)) });
    var lt = K.p(t, 15.4);
    [['click ignored', 300], ['no paint', 520]].forEach(function (c, i) {
      K.mark(x0 + c[1] - 60, 540, false, 0.7, K.p(t, 15.8 + i * 0.8));
      K.text(c[0], x0 + c[1] - 38, 540, { size: 18, color: P.red, a: K.p(t, 15.8 + i * 0.8) });
    });
    K.chip('long task: over 50 ms', x0 + 820, 540, { size: 18, stroke: P.red, color: P.red, a: lt });
    K.box(x0 + 50 * sc, 340, 2, 58, { fill: P.ink, r: 1, a: lt * 0.8 });
    K.text('50 ms', x0 + 50 * sc, 326, { size: 15, color: P.ink, align: 'center', a: lt });
  } },

/* 6 ─ microtask starvation */
{ d: 22, title: 'Microtask starvation',
  caps: [
    [0.3, 'Microtasks are drained completely. So a microtask that keeps queueing another one never lets the loop move on.'],
    [8, 'Rendering, timers and input all starve, and the page freezes.'],
    [13, 'The same loop with setTimeout is harmless: each call is a new task, so the browser gets a turn in between.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var bad = ['function spin() {', '  Promise.resolve().then(spin);', '}', 'spin();   // page freezes'];
    K.panel(40, 84, 580, 210, 'microtask loop', { a: K.p(t, 0.2), stroke: P.red });
    K.code(bad, 66, 130, { size: 21, n: K.typed(t, bad, [0.6, 1.4, 2.6, 2.8], 30), t: t, a: K.p(t, 0.2) });
    var ok = ['function tick() {', '  setTimeout(tick, 0);', '}', 'tick();   // page stays responsive'];
    K.panel(660, 84, 580, 210, 'timer loop', { a: K.p(t, 13), stroke: P.green });
    K.code(ok, 686, 130, { size: 21, n: K.typed(t, ok, [13.2, 14, 15, 15.2], 30), t: t, a: K.p(t, 13) });
    var a = K.p(t, 3.4), cx = 180, cy = 440;
    K.text('microtask queue', cx, 340, { size: 17, weight: 700, color: P.warm, align: 'center', a: a });
    g.save(); g.globalAlpha *= a; g.strokeStyle = P.warm; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.arc(cx, cy, 70, 0, 7); g.stroke(); g.restore();
    var ang = t * 3;
    K.chip('spin', cx + 70 * Math.cos(ang), cy + 70 * Math.sin(ang), { mono: true, size: 17, stroke: P.warm, a: a });
    K.text('never empty', cx, cy + 112, { size: 17, color: P.red, align: 'center', a: K.p(t, 5) });
    ['render', 'timers', 'clicks'].forEach(function (s, i) {
      var q = K.p(t, 8.4 + i * 0.8);
      K.chip(s, 400, 380 + i * 64, { size: 18, stroke: P.line, color: P.muted, a: q });
      K.mark(470, 380 + i * 64, false, 0.6, q);
    });
    K.text('starved', 400, 572, { size: 18, weight: 700, color: P.red, align: 'center', a: K.p(t, 10.8) });
    var r = K.p(t, 16);
    K.text('task, render, task, render…', 960, 350, { size: 17, weight: 700, color: P.green, align: 'center', a: r });
    for (var i = 0; i < 6; i++) {
      var q = K.p(t, 16.4 + i * 0.5, 0.3), x = 700 + i * 88, isTask = i % 2 === 0;
      K.box(x, 400, 76, 60, { fill: isTask ? 'rgba(104,211,145,.2)' : 'rgba(99,179,237,.2)', stroke: isTask ? P.green : P.blue, r: 8, a: q });
      K.text(isTask ? 'tick' : 'paint', x + 38, 430, { size: 16, align: 'center', a: q });
    }
    K.mark(720, 520, true, 0.8, K.p(t, 19.4)); K.text('input and painting still happen', 744, 520, { size: 18, a: K.p(t, 19.4) });
  } },

/* 7 ─ three rules + puzzle 1 */
{ d: 25, title: 'Three rules · puzzle 1',
  caps: [
    [0.3, 'Every output puzzle comes down to three rules: run all sync code, drain all microtasks, then take one task and repeat.'],
    [8.5, 'Puzzle one: two promise chains. Each then queues its next link only after its own callback has run.'],
    [15.5, 'So the two chains take turns: 1, A, 2, B, 3.']],
  draw: function (K, t) {
    var P = K.P;
    [['1', 'all sync code', P.purple], ['2', 'drain microtasks', P.warm], ['3', 'one task, repeat', P.green]].forEach(function (r, i) {
      var q = K.back((t - 0.8 - i * 1.6) / 0.6), x = 220 + i * 420;
      if (q <= 0) return;
      K.chip(r[0] + ' · ' + r[1], x, 112, { size: 22, stroke: r[2], s: q });
      if (i) K.arrow(x - 290, 112, x - 130, 112, { p: K.p(t, 0.8 + i * 1.6, 0.4), color: P.muted });
    });
    var code = ['Promise.resolve()', '  .then(() => log(1)).then(() => log(2)).then(() => log(3));', 'Promise.resolve()', '  .then(() => log("A")).then(() => log("B"));'];
    K.panel(40, 160, 1200, 180, 'puzzle1.js', { a: K.p(t, 8.6) });
    K.code(code, 66, 204, { size: 20, lh: 1.5, n: K.typed(t, code, [8.8, 9.6, 11.2, 11.8], 50), t: t, a: K.p(t, 8.6) });
    var steps = [['1', 'A'], ['A', '2'], ['2', 'B'], ['B', '3'], ['3']], st = 12.6, dt = 1.3;
    K.box(40, 370, 1200, 90, { fill: P.code, stroke: P.warm, a: K.p(t, 12.4) });
    K.text('microtask queue', 60, 394, { size: 16, weight: 700, color: P.warm, a: K.p(t, 12.4) });
    var k = Math.max(0, Math.min(steps.length - 1, Math.floor((t - st) / dt)));
    if (t > st && t < st + steps.length * dt) steps[k].forEach(function (s, i) {
      var ab = s === 'A' || s === 'B';
      K.chip('log(' + (ab ? '"' + s + '"' : s) + ')', 300 + i * 160, 426, { mono: true, size: 18, stroke: ab ? P.blue : P.warm });
    });
    K.text('run the front; it queues its chain’s next link at the back', 880, 426, { size: 16, color: P.muted, align: 'center', a: K.p(t, 13.4) });
    ['1', 'A', '2', 'B', '3'].forEach(function (o, i) {
      var q = K.back((t - st - 0.6 - i * dt) / 0.4);
      if (q > 0) K.chip(o, 380 + i * 130, 530, { mono: true, size: 26, stroke: o === 'A' || o === 'B' ? P.blue : P.warm, s: q });
    });
    K.text('output', 220, 530, { size: 19, weight: 700, color: P.muted, a: K.p(t, st) });
  } },

/* 8 ─ puzzle 2 */
{ d: 25, title: 'Puzzle 2: between timers',
  caps: [
    [0.3, 'Puzzle two. The executor runs synchronously, so exec prints first, then sync.'],
    [7.5, 'Next, the microtask queue drains: then.'],
    [11.5, 'Now the first timer task runs: t1. It queues a microtask, m1.'],
    [17, 'Microtasks drain after every task, so m1 prints before the second timer, t2.']],
  draw: function (K, t) {
    var P = K.P, code = ['setTimeout(() => {', '  log("t1");', '  Promise.resolve().then(() => log("m1"));', '}, 0);', 'setTimeout(() => log("t2"), 0);',
      'new Promise((r) => { log("exec"); r(); })', '  .then(() => log("then"));', 'log("sync");'];
    var hi = t > 17 ? 4 : t > 11.5 ? 2 : t > 7.5 ? 6 : t > 3.6 ? 7 : t > 1.6 ? 5 : -1;
    K.panel(40, 84, 660, 330, 'puzzle2.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 19, lh: 1.6, n: K.typed(t, code, [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1], 300), t: t, hi: hi, w: 620, a: K.p(t, 0.2) });
    var cols = [['sync', P.purple], ['microtasks', P.warm], ['tasks', P.green]];
    cols.forEach(function (c, i) {
      K.box(740 + i * 170, 84, 156, 330, { fill: P.code, stroke: c[1], a: K.p(t, 0.6) });
      K.text(c[0], 818 + i * 170, 110, { size: 17, weight: 700, color: c[1], align: 'center', a: K.p(t, 0.6) });
    });
    var E = [['t1', 2, 1.4, 0, 11.8], ['t2', 2, 1.8, 1, 17.6], ['exec', 0, 2, 0, 2.4], ['sync', 0, 3.8, 1, 4.2], ['then', 1, 3, 0, 8], ['m1', 1, 12.4, 1, 18]];
    E.forEach(function (e) {
      var q = K.back((t - e[2]) / 0.4); if (q <= 0) return;
      var done = t > e[4] + 0.4;
      K.chip(e[0], 818 + e[1] * 170, 160 + e[3] * 56, { mono: true, size: 18, stroke: cols[e[1]][1], s: q, a: done ? 0.3 : 1 });
    });
    var out = [['exec', 2.4], ['sync', 4.2], ['then', 8], ['t1', 11.8], ['m1', 18], ['t2', 19.2]];
    K.text('output', 60, 470, { size: 19, weight: 700, color: P.muted, a: K.p(t, 2.2) });
    out.forEach(function (o, i) {
      var q = K.back((t - o[1]) / 0.4);
      if (q > 0) K.chip(o[0], 200 + i * 150, 470, { mono: true, size: 22, s: q, stroke: i < 2 ? P.purple : i === 2 || i === 4 ? P.warm : P.green });
    });
    K.text('sync → micro → task → micro → task', 640, 548, { size: 20, color: P.acc, align: 'center', a: K.p(t, 19.6) });
  } },

/* 9 ─ puzzle 3 */
{ d: 26, title: 'Puzzle 3: with await',
  caps: [
    [0.3, 'Puzzle three mixes in await. Sync code first: start, a1, b, then the executor logs p1, then end.'],
    [10, 'The await continuation was queued before the p2 reaction, so a2 comes before p2.'],
    [17, 'The timeout is a task, so it waits until every microtask is done: it prints last.']],
  draw: function (K, t) {
    var P = K.P, code = ['async function a() { log("a1"); await b(); log("a2"); }', 'async function b() { log("b"); }', 'log("start");', 'setTimeout(() => log("timeout"), 0);', 'a();',
      'new Promise((r) => { log("p1"); r(); }).then(() => log("p2"));', 'log("end");'];
    var hi = t > 17 ? 3 : t > 10 ? 0 : t > 8 ? 6 : t > 6.4 ? 5 : t > 3.6 ? 4 : t > 2 ? 2 : -1;
    K.panel(40, 84, 800, 290, 'puzzle3.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 19, lh: 1.6, n: K.typed(t, code, [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], 300), t: t, hi: hi, w: 760, a: K.p(t, 0.2) });
    K.box(880, 84, 360, 130, { fill: P.code, stroke: P.warm, a: K.p(t, 4.6) });
    K.text('microtasks', 900, 108, { size: 16, weight: 700, color: P.warm, a: K.p(t, 4.6) });
    K.chip('a: after await', 985, 152, { size: 17, stroke: P.warm, a: K.p(t, 5) * (1 - K.p(t, 11.6, 0.4)) });
    K.chip('then → p2', 1150, 152, { size: 17, stroke: P.warm, a: K.p(t, 7) * (1 - K.p(t, 13.2, 0.4)) });
    K.text('1st', 985, 190, { size: 14, color: P.muted, align: 'center', a: K.p(t, 5) * (1 - K.p(t, 11.6, 0.4)) });
    K.text('2nd', 1150, 190, { size: 14, color: P.muted, align: 'center', a: K.p(t, 7) * (1 - K.p(t, 13.2, 0.4)) });
    K.box(880, 240, 360, 130, { fill: P.code, stroke: P.green, a: K.p(t, 3) });
    K.text('tasks', 900, 264, { size: 16, weight: 700, color: P.green, a: K.p(t, 3) });
    K.chip('timeout', 1060, 312, { mono: true, size: 17, stroke: P.green, a: K.p(t, 3.4) * (1 - K.p(t, 18.4, 0.4)) });
    var out = [['start', 2.4], ['a1', 4], ['b', 4.8], ['p1', 6.8], ['end', 8.4], ['a2', 12], ['p2', 13.6], ['timeout', 18.6]];
    K.text('output', 60, 440, { size: 19, weight: 700, color: P.muted, a: K.p(t, 2.2) });
    out.forEach(function (o, i) {
      var q = K.back((t - o[1]) / 0.4);
      if (q > 0) K.chip(o[0], 190 + i * 132 + (i > 6 ? 20 : 0), 440, { mono: true, size: 21, s: q, stroke: i < 5 ? P.purple : i < 7 ? P.warm : P.green });
    });
    [['sync', 190, 718, P.purple, 2.4], ['micro', 850, 982, P.warm, 12], ['task', 1134, 1134, P.green, 18.6]].forEach(function (b) {
      K.box(b[1] - 40, 478, b[2] - b[1] + 80, 4, { fill: b[3], r: 2, a: K.p(t, b[4]) });
      K.text(b[0], (b[1] + b[2]) / 2, 502, { size: 16, color: b[3], align: 'center', a: K.p(t, b[4]) });
    });
    K.text('await b() runs b right away; only the rest of a waits', 640, 556, { size: 19, color: P.muted, align: 'center', a: K.p(t, 10.6) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 13 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['One thread runs JavaScript; the host does the waiting',
     'One loop turn: one task, all microtasks, then maybe render',
     'Run to completion: long tasks block clicks and paint',
     'Endless microtasks freeze the page; timer loops do not',
     'Puzzles: sync, then microtasks, then one task, repeat'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 13 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
