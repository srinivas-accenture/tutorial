/* Day 14 in motion: timers as minimum delays, choosing a scheduler, setInterval vs recursive setTimeout,
   requestAnimationFrame, chunking long work, Web Workers, structured clone vs transfer, kinds of workers.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day14', {
  kicker: 'JavaScript: Zero to Architect · Day 14',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 14: scheduling work correctly, and real parallelism with Web Workers.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Timers & Workers', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 14 · Scheduling and parallelism', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['setTimeout · setInterval', 'requestAnimationFrame', 'Web Workers'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 350 + i * 290, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ minimum delay */
{ d: 23, title: 'A timer is a minimum',
  caps: [
    [0.3, 'setTimeout is an alarm that says no earlier than this, not exactly then.'],
    [6, 'Timers fire in order of their due time, and equal delays in creation order. So: t0, t5, t10.'],
    [13, 'Delays are only minimums. Nested timers clamp to at least 4 ms, and hidden tabs throttle timers to about once a second.']],
  draw: function (K, t) {
    var P = K.P, code = ['setTimeout(() => log("t10"), 10);', 'setTimeout(() => log("t0"), 0);', 'setTimeout(() => log("t5"), 5);'];
    K.panel(40, 84, 620, 180, 'timers.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 130, { size: 21, n: K.typed(t, code, [0.6, 1.8, 3], 30), t: t, a: K.p(t, 0.2) });
    K.panel(700, 84, 540, 180, 'Console', { a: K.p(t, 0.2) });
    [['t0', 7.6], ['t5', 8.6], ['t10', 9.6]].forEach(function (o, i) {
      K.text(o[0], 730 + i * 120, 170, { size: 26, mono: true, color: P.warm, a: K.p(t, o[1], 0.3) });
    });
    /* timeline 0..12 ms */
    var x0 = 120, sc = 80, ax = K.p(t, 5.8);
    K.arrow(x0, 360, 1200, 360, { color: P.line, lw: 2, a: ax });
    [0, 4, 8, 12].forEach(function (ms) { K.text(ms + ' ms', x0 + ms * sc, 386, { size: 15, color: P.muted, align: 'center', a: ax }); });
    [['t0', 0, 6.6], ['t5', 5, 7], ['t10', 10, 7.4]].forEach(function (d) {
      var q = K.back((t - d[2]) / 0.5);
      if (q <= 0) return;
      K.chip(d[0], x0 + d[1] * sc, 316, { mono: true, size: 19, stroke: P.warm, s: q });
      K.box(x0 + d[1] * sc - 1, 336, 2, 24, { fill: P.warm, r: 1, a: K.clamp(q) });
    });
    K.text('fires no earlier than its due time', 660, 420, { size: 18, color: P.muted, align: 'center', a: K.p(t, 9.8) * (1 - K.p(t, 12.8, 0.4)) });
    var c = K.p(t, 13.4);
    K.box(40, 440, 580, 140, { fill: P.code, stroke: P.warm, a: c });
    K.text('nested timers', 64, 470, { size: 20, weight: 700, color: P.warm, a: c });
    K.text('after 5 levels of nesting:', 64, 510, { size: 18, color: P.muted, a: c });
    K.text('delay = max(delay, 4 ms)', 64, 548, { size: 20, mono: true, a: K.p(t, 14.4) });
    var h = K.p(t, 16.6);
    K.box(660, 440, 580, 140, { fill: P.code, stroke: P.red, a: h });
    K.text('hidden tab', 684, 470, { size: 20, weight: 700, color: P.red, a: h });
    K.text('timers throttled to about 1 per second', 684, 510, { size: 18, color: P.muted, a: h });
    K.text('use performance.now() for real time', 684, 548, { size: 18, color: P.acc, a: K.p(t, 18.4) });
  } },

/* 3 ─ pick a scheduler */
{ d: 27, title: 'Pick the right scheduler',
  caps: [
    [0.3, 'Each scheduling API runs at a different point. queueMicrotask runs right after the current task, before anything else.'],
    [7.5, 'setTimeout queues a new task, at least that many milliseconds later. Use it for delays and for yielding.'],
    [13.5, 'requestAnimationFrame runs right before the next paint, in step with the display. It pauses in hidden tabs.'],
    [20, 'requestIdleCallback runs when the browser has nothing better to do: for low priority work. Safari lacks it.']],
  draw: function (K, t) {
    var P = K.P, y0 = 300;
    /* one frame strip */
    var a = K.p(t, 0.4);
    K.text('one frame (≈16.7 ms at 60 Hz)', 640, 100, { size: 18, color: P.muted, align: 'center', a: a });
    var seg = [['current task', 60, 330, P.purple], ['microtasks', 400, 160, P.warm], ['next task', 570, 230, P.green], ['rAF', 810, 90, P.blue], ['style · layout · paint', 910, 200, P.blue], ['idle', 1120, 100, P.line]];
    seg.forEach(function (s, i) {
      var q = K.p(t, 0.8 + i * 0.25);
      K.box(s[1], 130, s[2] - 8, 64, { fill: P.code, stroke: s[3], a: q });
      K.text(s[0], s[1] + (s[2] - 8) / 2, 162, { size: 17, weight: 700, color: s[3] === P.line ? P.muted : s[3], align: 'center', a: q });
    });
    var R = [['queueMicrotask(fn)', 'right after the current task', 480, 1, P.warm],
             ['setTimeout(fn, ms)', 'a new task, at least ms later', 685, 7.6, P.green],
             ['requestAnimationFrame(fn)', 'just before paint, synced', 855, 13.6, P.blue],
             ['requestIdleCallback(fn)', 'when idle: low priority', 1120, 20.2, P.muted]];
    R.forEach(function (r, i) {
      var q = K.p(t, r[3]), y = y0 + i * 70;
      K.arrow(r[2], y - 20, r[2], 204, { p: K.p(t, r[3] + 0.2, 0.5), color: r[4], lw: 2, head: 10 });
      K.chip(r[0], r[2], y, { mono: true, size: 18, stroke: r[4], a: q });
      K.text(r[1], 60, y, { size: 18, color: r[4] === P.muted ? P.ink : r[4], a: q });
    });
    K.text('Chromium also has scheduler.postTask() and scheduler.yield()', 640, 584, { size: 17, color: P.muted, align: 'center', a: K.p(t, 23) });
  } },

/* 4 ─ interval vs recursive timeout */
{ d: 23, title: 'setInterval vs setTimeout',
  caps: [
    [0.3, 'setInterval ignores how long the callback takes. If a run is slow, the next runs bunch up with no gap.'],
    [8, 'A recursive setTimeout schedules the next run only after this one finishes, so there is always a gap.'],
    [15.5, 'Keep every timer id, and clear it on cleanup, or stale callbacks keep running.']],
  draw: function (K, t) {
    var P = K.P, x0 = 300, sc = 9;
    K.text('setInterval(fn, 20)', 60, 150, { size: 20, mono: true, color: P.warm, a: K.p(t, 0.4) });
    K.arrow(x0, 190, 1220, 190, { color: P.line, lw: 2, a: K.p(t, 0.4) });
    [0, 20, 40, 60, 80, 100].forEach(function (ms) {
      K.box(x0 + ms * sc - 1, 108, 2, 82, { fill: P.line, r: 1, a: K.p(t, 0.8) });
      K.text(ms + ' ms', x0 + ms * sc, 210, { size: 14, color: P.muted, align: 'center', a: K.p(t, 0.8) });
    });
    /* runs of 28 ms scheduled every 20 ms → back to back */
    var runs = [0, 28, 56, 84];
    runs.forEach(function (s, i) {
      var q = K.p(t, 1.8 + i * 1.2, 0.8), w = Math.min(28, 100 - s) * sc;
      K.box(x0 + s * sc + 2, 130, Math.max(0, w * q - 4), 44, { fill: P.warm, r: 6, a: 0.8 });
      if (q > 0.6) K.text('run ' + (i + 1), x0 + s * sc + 14, 152, { size: 16, weight: 700, color: P.bg });
    });
    K.text('28 ms runs, no gaps: the thread never rests', 760, 240, { size: 17, color: P.red, align: 'center', a: K.p(t, 6) });
    var rc = K.p(t, 8.2);
    K.text('setTimeout(tick, 20)', 60, 330, { size: 20, mono: true, color: P.green, a: rc });
    K.text('inside tick()', 60, 360, { size: 16, color: P.muted, a: rc });
    K.arrow(x0, 370, 1220, 370, { color: P.line, lw: 2, a: rc });
    [0, 48, 96].forEach(function (s, i) {
      var q = K.p(t, 9 + i * 1.6, 0.8), w = Math.min(28, 100 - s) * sc;
      K.box(x0 + s * sc + 2, 310, Math.max(0, w * q - 4), 44, { fill: P.green, r: 6, a: 0.8 });
      if (q > 0.6 && s < 90) K.text('tick', x0 + s * sc + 14, 332, { size: 16, weight: 700, color: P.bg });
      if (i < 2) {
        var g0 = x0 + (s + 28) * sc;
        K.box(g0 + 2, 330, 20 * sc - 4, 4, { fill: P.muted, r: 2, a: K.p(t, 9.8 + i * 1.6) * 0.6 });
        K.text('20 ms gap', g0 + 10 * sc, 300, { size: 15, color: P.muted, align: 'center', a: K.p(t, 10 + i * 1.6) });
      }
    });
    var c = K.p(t, 15.7), code = ['const id = setTimeout(tick, 20);', '// on teardown:', 'clearTimeout(id);   // clearInterval / cancelAnimationFrame'];
    K.panel(40, 440, 1200, 140, 'cleanup', { a: c });
    K.code(code, 66, 484, { size: 20, lh: 1.4, n: K.typed(t, code, [15.9, 17.2, 17.8], 34), t: t, a: c });
  } },

/* 5 ─ requestAnimationFrame */
{ d: 21, title: 'requestAnimationFrame',
  caps: [
    [0.3, 'For anything visual, use requestAnimationFrame. It runs once before each paint, at the display rate.'],
    [7.5, 'Compute positions from the timestamp it passes in, not from an assumed 16.7 milliseconds per frame.'],
    [14, 'setTimeout animations drift out of step with the screen, and stutter.']],
  draw: function (K, t) {
    var P = K.P, g = K.g, code = ['function step(now) {', '  const x = (now - start) * 0.2;   // px per ms', '  box.style.transform = `translateX(${x}px)`;', '  if (x < 400) requestAnimationFrame(step);', '}', 'requestAnimationFrame(step);'];
    K.panel(40, 84, 760, 260, 'animate.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 19, lh: 1.55, n: K.typed(t, code, [0.6, 1.4, 2.8, 4.2, 5.4, 5.6], 40), t: t, hi: t > 7.5 && t < 14 ? 1 : -1, w: 720, a: K.p(t, 0.2) });
    K.text('frames', 860, 110, { size: 17, weight: 700, color: P.blue, a: K.p(t, 1) });
    for (var i = 0; i < 6; i++) {
      var q = K.p(t, 1.4 + i * 0.3, 0.3);
      K.box(860 + i * 62, 130, 52, 40, { fill: P.code, stroke: P.blue, r: 6, a: q });
      K.text('rAF', 886 + i * 62, 150, { size: 14, color: P.blue, align: 'center', a: q });
    }
    K.text('one callback per frame, then paint', 1040, 196, { size: 16, color: P.muted, align: 'center', a: K.p(t, 3.4) });
    K.text('60 Hz: 16.7 ms   ·   120 Hz: 8.3 ms', 1040, 240, { size: 17, color: P.acc, align: 'center', a: K.p(t, 9) });
    K.text('timestamp-based: same speed on every screen', 1040, 280, { size: 16, color: P.green, align: 'center', a: K.p(t, 10.6) });
    /* two tracks */
    function track(y, label, col, smooth, a0) {
      var a = K.p(t, a0);
      K.text(label, 60, y, { size: 19, weight: 700, color: col, a: a });
      K.box(300, y - 30, 900, 60, { fill: P.code, stroke: P.line, a: a });
      var u = K.clamp((t - a0 - 0.4) / 5), x = 320 + u * 820;
      if (!smooth) x = 320 + Math.floor(u * 9) * 820 / 9 + (Math.floor(u * 9) % 3 === 1 ? 26 : 0);
      if (t > a0) { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.fillRect(x, y - 18, 36, 36); g.restore(); }
    }
    track(410, 'rAF', P.green, true, 4.4);
    track(500, 'setTimeout(16)', P.red, false, 14.2);
    K.mark(1226, 410, true, 0.7, K.p(t, 9.6));
    K.mark(1226, 500, false, 0.7, K.p(t, 17));
    K.text('frames dropped or doubled', 750, 560, { size: 17, color: P.red, align: 'center', a: K.p(t, 16.4) });
  } },

/* 6 ─ chunking */
{ d: 25, title: 'Break up long work',
  caps: [
    [0.3, 'One long loop blocks clicks and painting for its whole length. Split the work into chunks instead.'],
    [7.5, 'After each chunk, yield: await a zero-delay setTimeout, or scheduler.yield in Chromium browsers.'],
    [15, 'Between chunks the browser can handle input and paint, so the page stays responsive.']],
  draw: function (K, t) {
    var P = K.P;
    var x0 = 160, W = 1000;
    K.text('one task', 60, 140, { size: 18, weight: 700, color: P.red, a: K.p(t, 0.4) });
    K.box(x0, 116, W * K.p(t, 0.8, 3), 48, { fill: P.red, r: 8, a: 0.75 });
    K.text('for 5000 items: 300 ms, page frozen', x0 + 20, 140, { size: 18, weight: 700, color: P.bg, a: K.p(t, 2.4) });
    K.mark(x0 + 300, 200, false, 0.7, K.p(t, 4.2)); K.text('click waits', x0 + 324, 200, { size: 17, color: P.red, a: K.p(t, 4.2) });
    K.mark(x0 + 560, 200, false, 0.7, K.p(t, 4.8)); K.text('no paint', x0 + 584, 200, { size: 17, color: P.red, a: K.p(t, 4.8) });
    var code = ['for (let i = 0; i < items.length; i += 1000) {', '  for (const n of items.slice(i, i + 1000)) total += n;', '  await new Promise((r) => setTimeout(r, 0));   // yield', '}'];
    var c = K.p(t, 7.6);
    K.panel(40, 240, 1200, 170, 'chunks.js', { a: c });
    K.code(code, 66, 284, { size: 20, lh: 1.45, n: K.typed(t, code, [7.8, 9, 10.8, 12.4], 44), t: t, hi: t > 11 && t < 15 ? 2 : -1, w: 1150, a: c });
    K.text('or: await scheduler.yield()', 1200, 384, { size: 16, color: P.acc, align: 'right', a: K.p(t, 12.6) });
    K.text('chunks', 60, 480, { size: 18, weight: 700, color: P.green, a: K.p(t, 15) });
    for (var i = 0; i < 5; i++) {
      var q = K.p(t, 15.4 + i * 0.7, 0.4), x = x0 + i * 200;
      K.box(x, 456, 150, 48, { fill: P.green, r: 8, a: q * 0.8 });
      K.text('1000', x + 75, 480, { size: 17, weight: 700, color: P.bg, align: 'center', a: q });
      if (i < 4) {
        K.box(x + 156, 456, 38, 48, { fill: i % 2 ? 'rgba(99,179,237,.35)' : 'rgba(246,173,85,.35)', r: 6, a: K.p(t, 15.8 + i * 0.7, 0.4) });
        K.text(i % 2 ? 'paint' : 'click', x + 175, 530, { size: 15, color: i % 2 ? P.blue : P.warm, align: 'center', a: K.p(t, 16 + i * 0.7) });
      }
    }
    K.mark(1196, 480, true, 0.8, K.p(t, 19.4));
    K.text('same total work, but the page answers within one chunk', 640, 572, { size: 18, color: P.muted, align: 'center', a: K.p(t, 20) });
  } },

/* 7 ─ workers */
{ d: 27, title: 'Web Workers',
  caps: [
    [0.3, 'Async code adds no threads. For CPU-heavy work, a Web Worker gives you a real parallel thread.'],
    [7, 'A worker has its own global, event loop and memory. It has fetch and timers, but no DOM.'],
    [13.5, 'You talk with messages. postMessage sends the job, and the result comes back as a message event.'],
    [20.5, 'Meanwhile the main thread keeps handling clicks and painting.']],
  draw: function (K, t) {
    var P = K.P;
    K.box(40, 84, 560, 300, { stroke: P.acc, a: K.p(t, 0.4) });
    K.text('Main thread', 64, 112, { size: 21, weight: 700, color: P.acc, a: K.p(t, 0.4) });
    var m = ['const w = new Worker("primes.js",', '  { type: "module" });', 'w.postMessage(1_000_000);', 'w.onmessage = (e) => show(e.data);'];
    K.code(m, 64, 144, { size: 18, lh: 1.5, n: K.typed(t, m, [1.2, 2.4, 13.8, 15], 34), t: t, hi: t > 13.8 && t < 17 ? 2 : t > 17.5 && t < 20.5 ? 3 : -1, w: 520 });
    var wk = K.p(t, 2.6);
    K.box(680, 84, 560, 300, { stroke: P.purple, a: wk, dash: [8, 6] });
    K.text('Worker thread', 704, 112, { size: 21, weight: 700, color: P.purple, a: wk });
    var w = ['self.onmessage = (e) => {', '  const n = countPrimes(e.data);', '  self.postMessage(n);', '};'];
    K.code(w, 704, 144, { size: 18, lh: 1.5, n: K.typed(t, w, [3.2, 4.2, 5.4, 6.2], 34), t: t, hi: t > 16 && t < 18 ? 1 : t > 17.6 && t < 20 ? 2 : -1, w: 520 });
    [['own global: self', true, 7.4], ['own event loop', true, 8.2], ['fetch, timers, IndexedDB', true, 9], ['no DOM, no window', false, 10]].forEach(function (s, i) {
      var q = K.p(t, s[2]), y = 290 + Math.floor(i / 2) * 40, x = 704 + (i % 2) * 270;
      K.mark(x + 10, y, s[1], 0.6, q); K.text(s[0], x + 30, y, { size: 17, color: s[1] ? P.ink : P.red, a: q });
    });
    /* message flow */
    var go = K.p(t, 14.2, 1.4), back = K.p(t, 18, 1.4);
    if (t > 14.2 && go < 1) K.chip('job: 1000000', 330 + go * 650, 420, { mono: true, size: 16, stroke: P.acc });
    if (t > 18 && back < 1) K.chip('result: 78498', 980 - back * 650, 460, { mono: true, size: 16, stroke: P.purple });
    K.arrow(600, 420, 680, 420, { p: K.p(t, 14, 0.4), color: P.acc, lw: 2 });
    K.arrow(680, 460, 600, 460, { p: K.p(t, 17.8, 0.4), color: P.purple, lw: 2 });
    K.text('postMessage', 640, 400, { size: 14, color: P.muted, align: 'center', a: K.p(t, 14.2) });
    /* lanes */
    var la = K.p(t, 20.6);
    K.text('main', 60, 520, { size: 17, weight: 700, color: P.acc, a: la });
    K.text('worker', 60, 568, { size: 17, weight: 700, color: P.purple, a: la });
    ['click', 'paint', 'click', 'paint', 'scroll', 'paint'].forEach(function (s, i) {
      K.chip(s, 220 + i * 120, 520, { size: 15, stroke: i % 2 ? P.blue : P.warm, a: K.p(t, 21 + i * 0.4) });
    });
    K.box(160, 550, 720 * K.p(t, 20.8, 2.4), 36, { fill: P.purple, r: 8, a: 0.7 * la });
    K.text('counting primes in parallel', 180, 568, { size: 16, weight: 700, color: P.bg, a: K.p(t, 22) });
    K.text('page stays responsive', 1060, 544, { size: 18, color: P.green, align: 'center', a: K.p(t, 23) });
  } },

/* 8 ─ clone vs transfer */
{ d: 25, title: 'Copy or transfer',
  caps: [
    [0.3, 'Messages are copied with the structured clone algorithm. A big message means a big copy.'],
    [7, 'Transferables such as ArrayBuffer move ownership instead, with zero copying.'],
    [13, 'After a transfer the sender’s buffer is detached: its byteLength is 0.'],
    [18.5, 'Functions, DOM nodes and class methods cannot be cloned, so send plain data.']],
  draw: function (K, t) {
    var P = K.P;
    function side(x, label, col, a) { K.box(x, 84, 300, 250, { stroke: col, a: a }); K.text(label, x + 150, 110, { size: 19, weight: 700, color: col, align: 'center', a: a }); }
    side(60, 'sender', P.acc, K.p(t, 0.3)); side(920, 'receiver', P.purple, K.p(t, 0.3));
    /* copy */
    var c = K.p(t, 1.2), cp = K.p(t, 2.6, 2.4);
    K.box(110, 150, 200, 60, { fill: P.code, stroke: P.blue, a: c });
    K.text('{ a: [1, 2] } 50 MB', 210, 180, { size: 16, mono: true, align: 'center', a: c });
    if (t > 2.6) {
      K.box(110 + cp * 860, 150, 200, 60, { fill: P.code, stroke: P.blue, a: K.clamp(cp * 3) });
      K.text('copy', 210 + cp * 860, 180, { size: 16, mono: true, align: 'center', a: K.clamp(cp * 3) });
    }
    K.text('structured clone: two copies in memory', 640, 160, { size: 17, color: P.blue, align: 'center', a: K.p(t, 4.4) });
    /* transfer */
    var tr = K.p(t, 7.2), mv = K.p(t, 8.6, 1.6), det = K.p(t, 13.2);
    K.box(110 + mv * 860, 250, 200, 60, { fill: P.code, stroke: P.green, a: tr });
    K.text('ArrayBuffer · 8 bytes', 210 + mv * 860, 280, { size: 15, mono: true, align: 'center', a: tr });
    K.text('transfer: ownership moves, no copy', 640, 236, { size: 17, color: P.green, align: 'center', a: K.p(t, 9) });
    K.box(110, 250, 200, 60, { fill: false, stroke: P.red, dash: [6, 5], a: det });
    K.text('detached', 210, 280, { size: 17, color: P.red, align: 'center', a: det });
    var code = ['const buf = new ArrayBuffer(8);', 'const moved = structuredClone(buf, { transfer: [buf] });', 'buf.byteLength;     // 0', 'moved.byteLength;   // 8'];
    K.panel(40, 360, 820, 160, '', { a: K.p(t, 9.6) });
    K.code(code, 64, 374, { size: 19, lh: 1.45, n: K.typed(t, code, [9.8, 11, 13.6, 14.6], 40), t: t, hi: t > 13.6 && t < 18.5 ? 2 : -1, w: 790, a: K.p(t, 9.6) });
    K.text('worker.postMessage(buf, [buf]) does the same', 1060, 440, { size: 16, color: P.muted, align: 'center', a: K.p(t, 15.4) });
    [['functions', false], ['DOM nodes', false], ['class methods', false], ['plain objects, arrays, Map, Date', true]].forEach(function (s, i) {
      var q = K.p(t, 18.8 + i * 0.6), x = i < 3 ? 70 + i * 220 : 760;
      K.mark(x, 556, s[1], 0.7, q); K.text(s[0], x + 22, 556, { size: 18, color: s[1] ? P.green : P.red, a: q });
    });
  } },

/* 9 ─ kinds of workers */
{ d: 24, title: 'Which worker, and when',
  caps: [
    [0.3, 'Dedicated workers serve one page. Shared workers are shared across tabs. Service workers proxy the network for offline and push.'],
    [8.5, 'SharedArrayBuffer and Atomics let threads share memory, but the page must be cross-origin isolated.'],
    [15, 'Workers cost startup time and memory. Use them for CPU-bound work, not for network calls, which are already async.']],
  draw: function (K, t) {
    var P = K.P;
    [['Dedicated Worker', 'one page, heavy compute', P.purple, 0.8], ['Shared Worker', 'shared across tabs', P.blue, 2.6], ['Service Worker', 'network proxy: offline, push', P.green, 4.6]].forEach(function (k, i) {
      var q = K.back((t - k[3]) / 0.6), x = 60 + i * 400;
      if (q <= 0) return;
      K.g.save(); K.g.translate(x + 180, 150); K.g.scale(q, q); K.g.translate(-x - 180, -150);
      K.box(x, 96, 360, 108, { stroke: k[2], a: K.clamp(q) });
      K.text(k[0], x + 24, 132, { size: 22, weight: 700, color: k[2], a: K.clamp(q) });
      K.text(k[1], x + 24, 172, { size: 18, color: P.muted, a: K.clamp(q) });
      K.g.restore();
    });
    K.text('not for computation', 1040, 228, { size: 16, color: P.warm, align: 'center', a: K.p(t, 6) });
    var s = K.p(t, 8.6);
    K.box(60, 260, 1160, 120, { fill: P.code, stroke: P.warm, a: s });
    K.text('SharedArrayBuffer + Atomics', 84, 292, { size: 20, weight: 700, color: P.warm, a: s });
    K.text('one memory, many threads', 84, 330, { size: 18, color: P.muted, a: s });
    K.code(['Cross-Origin-Opener-Policy: same-origin', 'Cross-Origin-Embedder-Policy: require-corp'], 600, 286, { size: 17, lh: 1.5, a: K.p(t, 10.6) });
    K.text('Node: worker_threads', 84, 360, { size: 16, color: P.acc, a: K.p(t, 12.4) });
    var g1 = K.p(t, 15.4), g2 = K.p(t, 17.6);
    K.text('Use a worker for', 80, 420, { size: 20, weight: 700, color: P.green, a: g1 });
    ['parsing big files', 'image processing', 'compression, WASM'].forEach(function (x, i) {
      K.mark(100, 460 + i * 40, true, 0.7, K.p(t, 15.8 + i * 0.5)); K.text(x, 124, 460 + i * 40, { size: 18, a: K.p(t, 15.8 + i * 0.5) });
    });
    K.text('Not needed for', 680, 420, { size: 20, weight: 700, color: P.red, a: g2 });
    ['fetch calls', 'waiting on timers or I/O'].forEach(function (x, i) {
      K.mark(700, 460 + i * 40, false, 0.7, K.p(t, 18 + i * 0.5)); K.text(x, 724, 460 + i * 40, { size: 18, a: K.p(t, 18 + i * 0.5) });
    });
    K.text('measure first: prove it is CPU-bound', 900, 560, { size: 17, color: P.muted, align: 'center', a: K.p(t, 20) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 14 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Timer delays are minimums; hidden tabs are throttled',
     'Microtask, timeout, rAF, idle: pick by when it should run',
     'Recursive setTimeout over setInterval; always clear ids',
     'Chunk long work and yield so the page stays responsive',
     'Workers: real threads, messages, copy or transfer'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 14 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
