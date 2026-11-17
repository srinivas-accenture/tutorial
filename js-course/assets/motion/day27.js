/* Day 27 in motion: the test pyramid, anatomy of a test, async tests, test doubles, fake timers and flakiness,
   formatter vs linter (ESLint flat config), TypeScript types vanish at runtime, semver, lockfiles and the CI gate.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day27', {
  kicker: 'JavaScript: Zero to Architect · Day 27',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 27: testing your code, and the tooling that keeps a codebase healthy.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Testing & tooling', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 27 · Confidence at every commit', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Tests', 'Lint · format', 'Types · lockfiles'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the test pyramid */
{ d: 26, title: 'The test pyramid',
  caps: [
    [0.3, 'Tests are a checklist a robot re-runs on every change. Most of them should be small, fast unit tests.'],
    [7, 'Fewer integration tests check parts working together: an API with its database, a component with its store.'],
    [13, 'A few end-to-end tests drive a real browser through critical user journeys, with a tool like Playwright.'],
    [19.5, 'Higher layers are more realistic, but slower and flakier. Catch most bugs as low in the pyramid as you can.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, cx = 470;
    function wid(y) { return 600 * (y - 120) / 420; }
    function trap(y0, y1, color, a, label) {
      if (a <= 0) return;
      var w0 = wid(y0), w1 = wid(y1);
      g.save(); g.globalAlpha *= a; g.beginPath(); g.moveTo(cx - w0 / 2, y0); g.lineTo(cx + w0 / 2, y0); g.lineTo(cx + w1 / 2, y1); g.lineTo(cx - w1 / 2, y1); g.closePath();
      g.fillStyle = P.card; g.fill(); g.strokeStyle = color; g.lineWidth = 2.5; g.stroke(); g.restore();
      K.text(label, cx, (y0 + y1) / 2, { size: 24, weight: 700, align: 'center', color: color, a: a });
    }
    var L = [[440, 540, P.green, 'Unit', 0.8, 'Unit: many, milliseconds', 'add(2, 3) → 5, no I/O'],
             [330, 430, P.warm, 'Integration', 7.2, 'Integration: some, seconds', 'API + database, component + store'],
             [220, 320, P.red, 'E2E', 13.2, 'End-to-end: few, minutes', 'Playwright drives a real browser']];
    L.forEach(function (l) {
      var q = K.p(t, l[4], 0.7);
      g.save(); g.translate(0, (1 - q) * 30); trap(l[0], l[1], l[2], q, l[3]); g.restore();
      var y = (l[0] + l[1]) / 2, r = K.p(t, l[4] + 0.8);
      K.box(820, y - 44, 420, 88, { stroke: l[2], a: r });
      K.text(l[5], 844, y - 16, { size: 21, weight: 700, a: r });
      K.text(l[6], 844, y + 18, { size: 17, mono: l[3] === 'Unit', color: P.muted, a: r });
    });
    /* many tiny passing unit tests */
    for (var i = 0; i < 18; i++) {
      var q = K.p(t, 2.4 + i * 0.12, 0.3), x = cx - 225 + (i % 9) * 56, y = 470 + Math.floor(i / 9) * 44;
      if (i % 9 === 4 || i % 9 === 3 || i % 9 === 5) continue;
      g.save(); g.globalAlpha *= q * 0.85; g.fillStyle = P.green; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); g.restore();
    }
    var a = K.p(t, 19.8);
    K.arrow(60, 540, 60, 230, { p: K.p(t, 19.8, 0.8), color: P.red });
    K.text('slower', 80, 236, { size: 17, color: P.red, a: a });
    K.text('flakier', 80, 262, { size: 17, color: P.red, a: a });
    K.text('more real', 80, 288, { size: 17, color: P.red, a: a });
    K.text('fast', 80, 504, { size: 17, color: P.green, a: K.p(t, 20.6) });
    K.text('cheap', 80, 530, { size: 17, color: P.green, a: K.p(t, 20.6) });
    var c = K.back((t - 21.6) / 0.6);
    if (c > 0) K.chip('catch bugs as low as possible', cx, 150, { s: c, a: K.clamp(c), size: 20, stroke: P.acc, color: P.acc });
  } },

/* 3 ─ anatomy of a test */
{ d: 24, title: 'Anatomy of a test',
  caps: [
    [0.3, 'A test is a named function that checks one behavior. Node ships a runner, node:test, and Vitest and Jest work the same way.'],
    [6.5, 'Structure each test as arrange, act, assert: set up the inputs, call the code once, check the result.'],
    [12.5, 'Run node --test. Each passing test gets a tick, and a failure shows the expected and the actual value.'],
    [18, 'Careful with objects: toBe checks identity, so two equal-looking objects fail. Use toEqual or deepStrictEqual.']],
  draw: function (K, t) {
    var P = K.P, code = ['import { test } from "node:test";', 'import assert from "node:assert/strict";', 'import { add } from "./math.js";', '',
      'test("adds two numbers", () => {', '  const a = 2, b = 3;      // arrange', '  const sum = add(a, b);   // act', '  assert.equal(sum, 5);    // assert', '});'];
    var m = {}; if (t > 7) m[5] = 'rgba(99,179,237,.16)'; if (t > 8.6) m[6] = 'rgba(246,173,85,.16)'; if (t > 10.2) m[7] = 'rgba(104,211,145,.16)';
    K.panel(40, 84, 640, 330, 'math.test.js');
    K.code(code, 64, 132, { size: 19, lh: 1.55, n: K.typed(t, code, [0.8, 1.8, 2.8, 3.8, 3.9, 6.8, 8.4, 10, 11.4], 30), t: t, w: 610, marks: m });
    [['Arrange', P.blue, 7.2, 5], ['Act', P.warm, 8.8, 6], ['Assert', P.green, 10.4, 7]].forEach(function (c) {
      K.chip(c[0], 600, 132 + c[3] * 29.45 + 12, { size: 16, stroke: c[1], color: c[1], a: K.p(t, c[2]) });
    });
    [['node:test', 820], ['Vitest', 960], ['Jest', 1080]].forEach(function (c, i) {
      K.chip(c[0], c[1], 112, { size: 19, mono: i === 0, stroke: P.acc, a: K.p(t, 2.4 + i * 0.5) });
    });
    K.panel(720, 150, 520, 264, 'Terminal', { a: K.p(t, 12.6) });
    var c1 = ['$ node --test'];
    K.code(c1, 744, 196, { size: 19, n: K.typed(t, c1, [12.9], 20), t: t, a: K.p(t, 12.6) });
    K.mark(758, 254, true, 0.7, K.p(t, 14));
    K.text('adds two numbers', 782, 254, { size: 18, mono: true, a: K.p(t, 14) });
    K.mark(758, 296, false, 0.7, K.p(t, 15));
    K.text('formats a price', 782, 296, { size: 18, mono: true, color: P.red, a: K.p(t, 15) });
    K.text('expected: "$5.00"', 782, 332, { size: 17, mono: true, color: P.green, a: K.p(t, 15.6) });
    K.text('actual:   "$5"', 782, 362, { size: 17, mono: true, color: P.red, a: K.p(t, 15.6) });
    K.text('tests 2 · pass 1 · fail 1', 744, 396, { size: 16, mono: true, color: P.muted, a: K.p(t, 16.4) });
    var o = K.p(t, 18.2);
    K.box(40, 440, 1200, 150, { fill: P.code, stroke: P.line, a: o });
    K.mark(76, 482, false, 0.8, K.p(t, 18.6));
    K.text('expect({ a: 1 }).toBe({ a: 1 })', 104, 482, { size: 20, mono: true, a: K.p(t, 18.6) });
    K.text('two different objects in memory', 560, 482, { size: 18, color: P.red, a: K.p(t, 19.4) });
    K.mark(76, 544, true, 0.8, K.p(t, 20.6));
    K.text('expect({ a: 1 }).toEqual({ a: 1 })', 104, 544, { size: 20, mono: true, a: K.p(t, 20.6) });
    K.text('same contents · node:assert: deepStrictEqual', 560, 544, { size: 18, color: P.green, a: K.p(t, 21.2) });
  } },

/* 4 ─ async tests */
{ d: 22, title: 'Async tests',
  caps: [
    [0.3, 'Async tests need care. This test starts a promise, but neither awaits it nor returns it.'],
    [6, 'The runner sees the function return and marks the test passed. The assertion runs later, when nobody is listening.'],
    [12.5, 'Make the test async and await the promise, or return it, so the runner waits for the real result.'],
    [17.5, 'Now a wrong value fails the test, exactly as it should.']],
  draw: function (K, t) {
    var P = K.P, bad = ['test("loads user", () => {', '  getUser(1).then((u) => assert.equal(u.id, 2));', '});'];
    K.panel(40, 84, 620, 190, 'user.test.js', { stroke: t > 3 ? P.red : P.line });
    K.code(bad, 64, 136, { size: 19, lh: 1.6, n: K.typed(t, bad, [0.8, 1.8, 4], 34), t: t, w: 590, hi: t > 4.4 && t < 12 ? 1 : -1 });
    K.text('no await, no return', 640, 250, { size: 17, color: P.red, align: 'right', a: K.p(t, 4.6) });
    /* timeline 1 */
    var X0 = 720, X1 = 1220, y = 180;
    K.text('runner', 720, 112, { size: 18, weight: 700, color: P.muted, a: K.p(t, 6) });
    K.arrow(X0, y, X1, y, { p: K.p(t, 6, 0.8), color: P.line, lw: 3 });
    K.box(X0, y - 18, 4, 36, { fill: P.ink, r: 2, a: K.p(t, 6.4) }); K.text('start', X0, y + 36, { size: 16, color: P.muted, a: K.p(t, 6.4) });
    K.box(X0 + 120, y - 18, 4, 36, { fill: P.green, r: 2, a: K.p(t, 7.2) });
    K.chip('PASS', X0 + 122, y - 46, { size: 17, weight: 700, color: P.green, stroke: P.green, a: K.p(t, 7.4) });
    K.text('function returned', X0 + 122, y + 36, { size: 16, color: P.green, align: 'center', a: K.p(t, 7.4) });
    K.box(X0 + 380, y - 18, 4, 36, { fill: P.red, r: 2, a: K.p(t, 9.4) });
    K.mark(X0 + 382, y - 44, false, 0.75, K.p(t, 9.6));
    K.text('assertion fails, too late', X0 + 382, y + 36, { size: 16, color: P.red, align: 'center', a: K.p(t, 9.8) });
    /* the fix */
    var good = ['test("loads user", async () => {', '  const u = await getUser(1);', '  assert.equal(u.id, 2);', '});'];
    K.panel(40, 320, 620, 220, 'user.test.js', { stroke: t > 15 ? P.green : P.line, a: K.p(t, 12.6) });
    K.code(good, 64, 372, { size: 19, lh: 1.6, n: K.typed(t, good, [13, 14, 15, 16], 34), t: t, w: 590, a: K.p(t, 12.6) });
    var y2 = 420;
    K.text('runner', 720, 352, { size: 18, weight: 700, color: P.muted, a: K.p(t, 16.2) });
    K.arrow(X0, y2, X1, y2, { p: K.p(t, 16.2, 0.8), color: P.line, lw: 3 });
    K.box(X0, y2 - 18, 4, 36, { fill: P.ink, r: 2, a: K.p(t, 16.4) }); K.text('start', X0, y2 + 36, { size: 16, color: P.muted, a: K.p(t, 16.4) });
    K.box(X0 + 4, y2 - 6, 372 * K.p(t, 16.6, 1.2), 12, { fill: 'rgba(79,209,197,.35)', r: 4, a: K.p(t, 16.6) });
    K.text('waits for the promise', X0 + 190, y2 - 32, { size: 16, color: P.acc, align: 'center', a: K.p(t, 17) });
    K.box(X0 + 380, y2 - 18, 4, 36, { fill: P.red, r: 2, a: K.p(t, 18) });
    K.chip('FAIL', X0 + 450, y2, { size: 17, weight: 700, color: P.red, stroke: P.red, a: K.p(t, 18.2) });
    K.text('expected 2, got 1: reported', X0 + 382, y2 + 36, { size: 16, color: P.ink, align: 'center', a: K.p(t, 18.6) });
    K.chip('a failing test you can trust', 980, 540, { size: 19, stroke: P.green, color: P.green, a: K.p(t, 19.6) });
  } },

/* 5 ─ test doubles */
{ d: 24, title: 'Test doubles',
  caps: [
    [0.3, 'Test doubles stand in for real dependencies. A stub returns canned answers; a spy records how it was called.'],
    [6.5, 'A mock also verifies it was called as expected. A fake is a simple working version, like an in-memory database.'],
    [13, 'Put doubles at the boundaries: network, time and randomness. Do not mock your own internal functions.'],
    [19, 'Over-mocking keeps tests green while the real integration is broken.']],
  draw: function (K, t) {
    var P = K.P;
    K.box(40, 96, 490, 304, { fill: false, stroke: P.acc, dash: [8, 6], a: K.p(t, 0.3) });
    K.text('your code', 62, 122, { size: 18, weight: 700, color: P.acc, a: K.p(t, 0.3) });
    K.box(70, 150, 280, 70, { stroke: P.acc, a: K.p(t, 0.6) });
    K.text('checkout(cart)', 210, 185, { size: 21, mono: true, align: 'center', a: K.p(t, 0.6) });
    K.arrow(210, 224, 210, 286, { p: K.p(t, 1, 0.4), color: P.muted });
    K.box(70, 290, 280, 70, { stroke: P.line, a: K.p(t, 1.2) });
    K.text('calcTotal()', 210, 325, { size: 21, mono: true, align: 'center', a: K.p(t, 1.2) });
    K.mark(386, 325, false, 0.75, K.p(t, 16.4));
    K.text("don't mock", 412, 312, { size: 16, color: P.red, a: K.p(t, 16.4) });
    K.text('internals', 412, 338, { size: 16, color: P.red, a: K.p(t, 16.4) });
    var D = [['payment API', 1.6, 'stub', 3], ['Date.now()', 13.4, 'fake timers', 14], ['Math.random()', 14.6, 'seeded', 15.2]];
    D.forEach(function (d, i) {
      var y = 112 + i * 100, q = K.p(t, d[1]);
      K.arrow(354, 185, 552, y + 32, { p: K.p(t, d[1], 0.5), color: P.muted, lw: 2 });
      K.box(560, y, 250, 64, { stroke: i ? P.purple : P.blue, a: q });
      K.text(d[0], 685, y + 32, { size: 20, mono: i > 0, align: 'center', a: q });
      K.arrow(816, y + 32, 852, y + 32, { p: K.p(t, d[3], 0.4), color: P.warm });
      var c = K.back((t - d[3]) / 0.5);
      if (c > 0) K.chip(d[2], 930, y + 32, { s: c, a: K.clamp(c), size: 18, stroke: P.warm, color: P.warm });
    });
    K.text('boundaries', 685, 404, { size: 17, weight: 700, color: P.purple, align: 'center', a: K.p(t, 13.2) });
    var o = K.p(t, 19.2);
    K.box(1020, 112, 220, 264, { fill: P.code, stroke: P.red, a: o });
    K.mark(1050, 160, true, 0.75, K.p(t, 19.6)); K.text('tests green', 1074, 160, { size: 18, color: P.green, a: K.p(t, 19.6) });
    K.mark(1050, 220, false, 0.75, K.p(t, 20.6)); K.text('API changed', 1074, 220, { size: 18, color: P.red, a: K.p(t, 20.6) });
    K.text('the mocks still', 1050, 290, { size: 17, color: P.muted, a: K.p(t, 21.4) });
    K.text('return old data', 1050, 318, { size: 17, color: P.muted, a: K.p(t, 21.4) });
    var C = [['stub', 'canned answer', '() => ({ ok: true })', 0.8, P.blue], ['spy', 'records calls', 'vi.fn() · calls: 2', 3.8, P.acc],
             ['mock', 'expects calls', 'toHaveBeenCalledWith()', 6.8, P.warm], ['fake', 'simple working version', 'new Map() as a DB', 9.6, P.green]];
    C.forEach(function (c, i) {
      var x = 40 + i * 302, q = K.back((t - c[3]) / 0.6);
      if (q <= 0) return;
      K.box(x, 432 + (1 - K.clamp(q)) * 20, 288, 150, { stroke: c[4], a: K.clamp(q) });
      K.text(c[0], x + 22, 466, { size: 24, weight: 800, color: c[4], a: K.clamp(q) });
      K.text(c[1], x + 22, 504, { size: 18, a: K.clamp(q) });
      K.text(c[2], x + 22, 548, { size: 16, mono: true, color: P.muted, a: K.clamp(q) });
    });
  } },

/* 6 ─ determinism and fake timers */
{ d: 24, title: 'Deterministic tests',
  caps: [
    [0.3, 'Tests must be deterministic. Real time, randomness and real networks make them flaky: fake them or inject them.'],
    [6, 'Fake timers control the clock: call the debounced function three times, jump 100 ms, and expect exactly one call.'],
    [14, 'A flaky test is a bug. It teaches the team to ignore red builds, so fix it or delete it.'],
    [18.5, 'Coverage shows which code ran, not what was checked. Use it to find gaps, not as a target.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, code = ['import { it, expect, vi } from "vitest";', 'it("runs once after the delay", () => {', '  vi.useFakeTimers();', '  const fn = vi.fn();',
      '  const d = debounce(fn, 100);', '  d(); d(); d();', '  vi.advanceTimersByTime(100);', '  expect(fn).toHaveBeenCalledTimes(1);', '});'];
    K.panel(40, 84, 600, 330, 'debounce.test.js');
    K.code(code, 64, 132, { size: 19, lh: 1.55, n: K.typed(t, code, [0.6, 1.4, 6.2, 6.9, 7.6, 8.6, 10, 11.6, 12.8], 34), t: t, w: 570,
      hi: t > 11.6 ? 7 : t > 10 ? 6 : t > 8.6 ? 5 : t > 6.2 ? 2 : -1 });
    [['real clock', 690], ['Math.random', 880], ['real network', 1080]].forEach(function (c, i) {
      var q = K.p(t, 1.4 + i * 0.6);
      K.mark(c[1], 112, false, 0.65, q); K.text(c[0], c[1] + 20, 112, { size: 18, mono: i === 1, a: q });
    });
    /* fake clock timeline */
    var X0 = 720, X1 = 1200, y = 250, a = K.p(t, 6.2);
    K.text('fake clock', 720, 180, { size: 18, weight: 700, color: P.acc, a: a });
    K.arrow(X0, y, X1 + 20, y, { color: P.line, a: a, lw: 3 });
    K.text('0 ms', X0, y + 34, { size: 16, mono: true, color: P.muted, align: 'center', a: a });
    K.text('100 ms', X1, y + 34, { size: 16, mono: true, color: P.muted, align: 'center', a: a });
    for (var i = 0; i < 3; i++) {
      var q = K.back((t - 8.8 - i * 0.35) / 0.4);
      if (q > 0) K.chip('d()', X0 + 30 + i * 60, y - 34, { s: q, a: K.clamp(q), size: 16, mono: true, stroke: P.blue });
    }
    var jump = K.p(t, 10.4, 0.9), hx = X0 + 150 + (X1 - X0 - 150) * jump;
    if (t > 10.2) { g.save(); g.globalAlpha *= K.p(t, 10.2, 0.3); g.fillStyle = P.warm; g.beginPath(); g.moveTo(hx, y - 10); g.lineTo(hx - 9, y - 26); g.lineTo(hx + 9, y - 26); g.closePath(); g.fill(); g.restore(); }
    K.text('advance 100 ms in no time', 960, y + 34, { size: 16, color: P.warm, align: 'center', a: K.p(t, 10.6) });
    K.chip('fn called 1×', X1 - 30, y - 64, { size: 18, stroke: P.green, color: P.green, a: K.p(t, 11.6) });
    K.mark(990, 340, true, 0.8, K.p(t, 12.4)); K.text('same result on every run', 1014, 340, { size: 17, color: P.green, a: K.p(t, 12.4) });
    /* flaky */
    var f = K.p(t, 14.2);
    K.box(40, 440, 580, 150, { fill: P.code, stroke: P.line, a: f });
    K.text('flaky test, 6 runs, no code changes', 64, 468, { size: 18, weight: 700, a: f });
    [1, 1, 0, 1, 0, 1].forEach(function (ok, i) { K.mark(80 + i * 46, 516, !!ok, 0.8, K.p(t, 14.6 + i * 0.25)); });
    K.text('→ fix or delete', 370, 516, { size: 19, weight: 700, color: P.warm, a: K.p(t, 16.4) });
    K.text('teams learn to ignore red builds', 64, 562, { size: 17, color: P.muted, a: K.p(t, 16.8) });
    /* coverage */
    var c = K.p(t, 18.7), cv = K.p(t, 19, 1.2);
    K.box(660, 440, 580, 150, { fill: P.code, stroke: P.line, a: c });
    K.text('coverage', 684, 468, { size: 18, weight: 700, a: c });
    K.box(684, 494, 420, 26, { fill: P.card, r: 6, a: c });
    K.box(684, 494, 420 * 0.92 * cv, 26, { fill: P.green, r: 6, a: c });
    K.text(Math.round(92 * cv) + '%', 1120, 507, { size: 19, mono: true, a: c });
    K.text('lines that ran ≠ behavior that was checked', 684, 556, { size: 17, color: P.warm, a: K.p(t, 20.6) });
  } },

/* 7 ─ formatter vs linter */
{ d: 22, title: 'Format and lint',
  caps: [
    [0.3, 'A formatter like Prettier owns style: spacing, quotes and semicolons. Style stops being a code-review debate.'],
    [7, 'A linter like ESLint finds likely bugs: unused variables, loose double equals, unreachable code.'],
    [14, 'ESLint 10 uses flat config only: one eslint.config.js file. The old .eslintrc files are no longer supported.']],
  draw: function (K, t) {
    var P = K.P, messy = ['function label( item ){', 'const price=getPrice(item)', 'let unused=42', "if(price==0) return 'free'", '    return format( price ) ;', 'log("done")', '}'],
        neat = ['function label(item) {', '  const price = getPrice(item);', '  let unused = 42;', '  if (price == 0) return "free";', '  return format(price);', '  log("done");', '}'];
    var f = K.p(t, 4, 0.5);
    K.panel(40, 84, 600, 290, 'label.js');
    K.code(messy, 64, 130, { size: 19, lh: 1.5, a: 1 - K.p(t, 3.3, 0.5) });
    var m = {}; if (t > 7.6) m[2] = 'rgba(252,129,129,.18)'; if (t > 8.8) m[3] = 'rgba(252,129,129,.18)'; if (t > 10) m[5] = 'rgba(252,129,129,.18)';
    K.code(neat, 64, 130, { size: 19, lh: 1.5, a: f, marks: m, w: 570 });
    K.box(680, 84, 560, 130, { stroke: P.purple, a: K.p(t, 1) });
    K.text('Prettier · formatter', 704, 116, { size: 21, weight: 700, color: P.purple, a: K.p(t, 1) });
    K.text('spacing · quotes · semicolons', 704, 152, { size: 18, a: K.p(t, 2) });
    K.text('one style, applied automatically', 704, 184, { size: 17, color: P.muted, a: K.p(t, 4.8) });
    K.panel(680, 236, 560, 190, 'ESLint', { stroke: P.red, a: K.p(t, 7.2) });
    [['3:7', 'no-unused-vars', 7.8], ['4:13', 'eqeqeq', 9], ['6:3', 'no-unreachable', 10.2]].forEach(function (r, i) {
      var y = 286 + i * 44, q = K.p(t, r[2]);
      K.mark(712, y, false, 0.6, q);
      K.text(r[0], 736, y, { size: 18, mono: true, color: P.muted, a: q });
      K.text(r[1], 800, y, { size: 19, mono: true, color: P.red, a: q });
    });
    K.text('finds bugs, not style', 1216, 400, { size: 16, color: P.muted, align: 'right', a: K.p(t, 11.2) });
    var cfg = ['import js from "@eslint/js";', 'export default [', '  js.configs.recommended,', '  { rules: { eqeqeq: "error" } },', '];'];
    K.panel(40, 400, 600, 190, 'eslint.config.js', { a: K.p(t, 14.2) });
    K.code(cfg, 64, 440, { size: 18, lh: 1.5, n: K.typed(t, cfg, [14.6, 15.6, 16.4, 17.2, 18.4], 34), t: t, a: K.p(t, 14.2) });
    var o = K.p(t, 18.8);
    K.box(680, 450, 560, 130, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: o });
    K.mark(714, 490, false, 0.8, o);
    K.text('.eslintrc.json · .eslintignore', 740, 490, { size: 19, mono: true, color: P.red, a: o });
    K.box(740, 489, 330 * K.p(t, 19.4, 0.6), 3, { fill: P.red, r: 1, a: o });
    K.text('removed in ESLint 10: use flat config', 714, 540, { size: 18, a: K.p(t, 19.8) });
  } },

/* 8 ─ TypeScript in context */
{ d: 26, title: 'TypeScript in context',
  caps: [
    [0.3, 'TypeScript adds static types and checks them before the code runs. tsc --noEmit reports mistakes in your editor and in CI.'],
    [7.5, 'But types are erased. The JavaScript that actually runs has no types left in it.'],
    [13, 'So data from the network can still be anything. Here the API sends price as a string, and the math silently breaks.'],
    [19.5, 'Validate untrusted input at the boundary with a schema library like zod. Inside, the types can then be trusted.']],
  draw: function (K, t) {
    var P = K.P, ts = ['type Product = { name: string; price: number };', 'function total(p: Product, shipping: number) {', '  return p.price + shipping;', '}', 'total(item, "5");'];
    K.panel(40, 84, 600, 220, 'price.ts');
    K.code(ts, 62, 132, { size: 18, lh: 1.55, n: K.typed(t, ts, [0.8, 2.2, 3.4, 4.2, 4.6], 34), t: t, w: 570, marks: t > 5.4 ? { 4: 'rgba(252,129,129,.2)' } : null });
    var e = K.p(t, 5.6);
    K.box(40, 318, 600, 66, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: e });
    K.text('tsc: Argument of type "string" is not', 62, 338, { size: 17, mono: true, color: P.red, a: e });
    K.text('assignable to parameter of type "number".', 62, 364, { size: 17, mono: true, color: P.red, a: e });
    K.arrow(646, 180, 694, 180, { p: K.p(t, 8, 0.5), color: P.purple });
    var js = ['function total(p, shipping) {', '  return p.price + shipping;', '}'];
    K.panel(700, 84, 540, 160, 'price.js · what runs', { a: K.p(t, 8.4) });
    K.code(js, 722, 132, { size: 18, lh: 1.55, a: K.p(t, 9) });
    K.text('types erased by tsc, a bundler or Node', 722, 222, { size: 16, color: P.purple, a: K.p(t, 10.4) });
    var r = K.p(t, 13.2);
    K.panel(700, 266, 540, 160, 'at runtime', { a: r });
    K.text('API → { "name": "Pen", "price": "12" }', 722, 316, { size: 17, mono: true, a: K.p(t, 13.6) });
    K.text('total(p, 5)', 722, 354, { size: 19, mono: true, a: K.p(t, 15.4) });
    K.text('→ "125"', 862, 354, { size: 19, mono: true, color: P.red, a: K.p(t, 16.4) });
    K.mark(990, 354, false, 0.75, K.p(t, 16.8));
    K.text('string + number', 722, 398, { size: 16, color: P.red, a: K.p(t, 17.2) });
    var z = ['import { z } from "zod";', 'const Product = z.object({', '  name: z.string(), price: z.number(),', '});', 'const p = Product.parse(await res.json());'];
    K.panel(40, 400, 600, 190, '', { a: K.p(t, 19.6) });
    K.code(z, 62, 414, { size: 17, lh: 1.5, n: K.typed(t, z, [19.9, 20.8, 21.6, 22.6, 22.8], 40), t: t, a: K.p(t, 19.6) });
    var ok = K.p(t, 23.8);
    K.box(700, 446, 540, 144, { stroke: P.green, a: ok });
    K.mark(730, 482, false, 0.75, ok);
    K.text('ZodError: price: expected number', 754, 482, { size: 18, mono: true, color: P.red, a: ok });
    K.mark(730, 540, true, 0.75, K.p(t, 24.6));
    K.text('bad data stopped at the boundary', 754, 540, { size: 18, color: P.green, a: K.p(t, 24.6) });
  } },

/* 9 ─ dependencies and the pipeline */
{ d: 26, title: 'Versions, lockfiles, CI',
  caps: [
    [0.3, 'Versions follow semver: major, minor, patch. A caret range accepts new minor and patch versions; a tilde only patches.'],
    [7.5, 'The lockfile pins the exact versions installed. Commit it, and use npm ci in CI for clean, reproducible installs.'],
    [14, 'Checks run in layers: the editor as you type, a pre-commit hook on changed files, then CI on a clean machine.'],
    [20.5, 'Hooks can be skipped; CI cannot. Only code that passes the same checks for everyone gets deployed.']],
  draw: function (K, t) {
    var P = K.P;
    K.box(40, 84, 600, 214, { fill: P.code, stroke: P.line, a: K.p(t, 0.3) });
    K.text('1.2.3', 64, 116, { size: 24, mono: true, weight: 700, color: P.warm, a: K.p(t, 0.5) });
    K.text('= major . minor . patch', 150, 116, { size: 19, color: P.muted, a: K.p(t, 1.2) });
    K.text('update to', 64, 160, { size: 17, color: P.muted, a: K.p(t, 2.4) });
    K.text('^1.2.3', 330, 160, { size: 19, mono: true, color: P.acc, align: 'center', a: K.p(t, 2.6) });
    K.text('~1.2.3', 500, 160, { size: 19, mono: true, color: P.purple, align: 'center', a: K.p(t, 3.4) });
    [['1.2.9', true, true], ['1.3.0', true, false], ['2.0.0', false, false]].forEach(function (r, i) {
      var y = 200 + i * 34, q = K.p(t, 3 + i * 0.8);
      K.text(r[0], 64, y, { size: 19, mono: true, a: q });
      K.mark(330, y, r[1], 0.6, K.p(t, 3.2 + i * 0.8));
      K.mark(500, y, r[2], 0.6, K.p(t, 3.8 + i * 0.8));
    });
    K.box(680, 84, 560, 214, { fill: P.code, stroke: P.line, a: K.p(t, 7.6) });
    K.text('package.json', 704, 112, { size: 16, color: P.muted, a: K.p(t, 7.8) });
    K.text('"zod": "^4.1.0"', 704, 142, { size: 19, mono: true, a: K.p(t, 7.8) });
    K.arrow(760, 162, 760, 190, { p: K.p(t, 8.6, 0.4), color: P.muted });
    K.text('package-lock.json', 704, 212, { size: 16, color: P.muted, a: K.p(t, 8.8) });
    K.text('"version": "4.1.12"', 704, 244, { size: 19, mono: true, color: P.warm, a: K.p(t, 9) });
    K.lock(944, 246, 0.8, P.warm, K.p(t, 9.6));
    K.chip('npm ci', 1120, 140, { size: 20, mono: true, stroke: P.green, color: P.green, a: K.p(t, 10.6) });
    K.text('exact versions', 1120, 190, { size: 16, align: 'center', a: K.p(t, 11.2) });
    K.text('clean install', 1120, 216, { size: 16, align: 'center', a: K.p(t, 11.6) });
    K.text('commit the lockfile', 1120, 260, { size: 16, color: P.warm, align: 'center', a: K.p(t, 12.2) });
    var S = [['write code', '', '', 14.2, P.line], ['editor', 'format + lint', 'as you type', 14.8, P.purple], ['pre-commit', 'lint-staged', 'changed files', 16, P.warm],
             ['CI', 'npm ci, lint, types', 'tests, build', 17.4, P.red], ['deploy', 'same checks', 'for everyone', 18.8, P.green]];
    S.forEach(function (s, i) {
      var x = 40 + i * 244, q = K.back((t - s[3]) / 0.6);
      if (q <= 0) return;
      K.box(x, 340, 210, 120, { stroke: s[4], a: K.clamp(q), lw: i === 3 ? 3 : 2 });
      K.text(s[0], x + 105, s[1] ? 372 : 400, { size: 22, weight: 700, align: 'center', a: K.clamp(q) });
      if (s[1]) { K.text(s[1], x + 105, 408, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) }); K.text(s[2], x + 105, 432, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) }); }
      if (i) K.arrow(x - 30, 400, x - 4, 400, { p: K.p(t, s[3] - 0.2, 0.4), color: P.muted });
    });
    K.text('can be skipped', 593, 500, { size: 17, color: P.warm, align: 'center', a: K.p(t, 20.8) });
    K.text('(--no-verify)', 593, 526, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 20.8) });
    K.text('the real gate', 837, 500, { size: 19, weight: 700, color: P.red, align: 'center', a: K.p(t, 21.8) });
    K.mark(1081, 506, true, 0.85, K.p(t, 23));
  } },

/* 10 ─ recap */
{ d: 15, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 27 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Pyramid: many unit tests, some integration, a few e2e',
     'Arrange, act, assert; test behavior, not internals',
     'Await async tests; fake time, randomness and network',
     'Prettier owns style, ESLint finds bugs (flat config)',
     'Types vanish at runtime: validate input with a schema',
     'Commit the lockfile, npm ci in CI: CI is the real gate'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 27 examples with ▶ Run', 640, 540, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
