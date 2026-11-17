/* Day 55 in motion: an end-to-end blueprint for one feature through every layer, then the final rapid-fire review and an updated study plan. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day55', {
  kicker: 'JavaScript: Zero to Architect · Day 55',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 55: one feature traced through every layer, then a final review and an updated study plan.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Capstone II', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 55 · One feature, every layer', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['End-to-end blueprint', 'Rapid-fire review', 'Study plan'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 370 + i * 270, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the feature and its requirements */
{ d: 22, title: 'The feature: Tasks',
  caps: [
    [0.3, 'The capstone: design a Tasks feature end to end. Users list, create, complete and share tasks.'],
    [6, 'Start with requirements: who uses it, how much data, whether it works offline, and service-level goals like p95 latency.'],
    [13, 'Write a decision for every layer down before coding. A weakness in one layer shows up everywhere.']],
  draw: function (K, t) {
    var P = K.P;
    var ua = K.p(t, 0.4);
    K.panel(40, 84, 520, 420, 'Tasks', { a: ua });
    ['All', 'Open', 'Done'].forEach(function (c, i) { K.chip(c, 96 + i * 86, 146, { size: 17, stroke: i === 1 ? P.acc : P.line, color: i === 1 ? P.acc : P.ink, a: K.p(t, 0.8) }); });
    [['Write the API spec', 1], ['Add the indexes', 0], ['Set up CI', 0], ['Share with the team', 0]].forEach(function (r, i) {
      var y = 210 + i * 62, q = K.p(t, 1.2 + i * 0.4), done = r[1] || (i === 1 && t > 4);
      K.box(64, y - 24, 472, 48, { fill: P.card, stroke: P.line, a: q });
      K.box(80, y - 11, 22, 22, { fill: done ? P.green : P.code, stroke: done ? P.green : P.muted, r: 5, a: q });
      K.text(r[0], 118, y, { size: 19, color: done ? P.muted : P.ink, a: q });
      if (i === 3) K.chip('share', 486, y, { size: 16, stroke: P.purple, a: q });
    });
    K.box(64, 446, 180, 44, { fill: 'rgba(79,209,197,.15)', stroke: P.acc, a: K.p(t, 3) });
    K.text('+ New task', 154, 468, { size: 19, weight: 700, color: P.acc, align: 'center', a: K.p(t, 3) });
    var ra = K.p(t, 6.2);
    K.box(600, 84, 640, 300, { stroke: P.warm, a: ra });
    K.text('Requirements', 624, 112, { size: 20, weight: 800, color: P.warm, a: ra });
    [['Who', 'signed-in users who share with teammates'], ['Scale', '50k users, about 500 tasks each'], ['Offline', 'create tasks without a network'],
     ['SLOs', 'p95 API under 300 ms, 99.9% available'], ['Out of scope', 'comments, attachments']].forEach(function (r, i) {
      var y = 160 + i * 44, q = K.p(t, 6.6 + i * 1.1);
      K.text(r[0], 624, y, { size: 18, weight: 700, color: P.muted, a: q });
      K.text(r[1], 770, y, { size: 18, a: q });
    });
    var da = K.p(t, 13.2);
    K.panel(600, 404, 640, 180, 'DESIGN.md', { a: da, stroke: P.acc });
    ['## Routing   ## Forms   ## API   ## Auth', '## Data   ## Caching   ## Offline   ## Testing', '## Delivery   ## Observability   ## A11y', '## Performance   ## Security'].forEach(function (l, i) {
      K.text(l, 624, 446 + i * 32, { size: 17, mono: true, color: P.acc, a: K.p(t, 13.6 + i * 0.6) });
    });
  } },

/* 3 ─ one request through the layers */
{ d: 26, title: 'Follow one request',
  caps: [
    [0.3, 'Follow one request. The route /tasks keeps filters in the query string, and the form validates before it sends.'],
    [7, 'The API checks the session cookie, authorizes the owner, validates the body and requires an idempotency key on create.'],
    [14, 'Then the data layer: an index on user id and created at, keyset pagination, parameterized queries and a version column.'],
    [20, 'Responses carry an ETag, so an update sends If-Match. A stale version gets 412 instead of silently overwriting.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var C = [['Browser', 40, P.blue, 0.4, ['GET /tasks?status=open', 'native form validation', 'accessible error messages', 'no double submit']],
             ['API', 450, P.acc, 7.2, ['session cookie: HttpOnly', 'authorize: owner or shared', 'validate body: 422', 'Idempotency-Key on POST']],
             ['Database', 860, P.purple, 14.2, ['index (user_id, created_at)', 'keyset pagination', 'parameterized queries', 'version column']]];
    C.forEach(function (c, k) {
      var q = K.p(t, c[3]);
      K.box(c[1], 84, 380, 330, { stroke: c[2], a: q });
      K.text(c[0], c[1] + 24, 114, { size: 21, weight: 800, color: c[2], a: q });
      c[4].forEach(function (s, i) {
        var y = 170 + i * 58, a = K.p(t, c[3] + 0.6 + i * 1.1);
        K.mark(c[1] + 38, y, true, 0.7, a);
        K.text(s, c[1] + 62, y, { size: 18, mono: i === 0 && k === 0, a: a });
      });
      if (k) K.arrow(c[1] - 36, 114, c[1] - 6, 114, { p: K.p(t, c[3]), color: P.muted });
    });
    var u = (t - 6.4) / 8.6;
    if (u > 0 && u < 1) { g.save(); g.fillStyle = P.warm; g.globalAlpha *= K.clamp(Math.min(u * 8, (1 - u) * 8)); g.beginPath(); g.arc(220 + 860 * u, 70, 8, 0, 7); g.fill(); g.restore(); }
    var h = K.p(t, 20.2);
    K.box(40, 440, 1200, 146, { fill: P.code, stroke: P.line, a: h });
    K.text('PATCH /tasks/42   If-Match: "v7"', 66, 474, { size: 19, mono: true, a: K.p(t, 20.4) });
    K.text('200 OK   ETag: "v8"', 760, 474, { size: 19, mono: true, color: P.green, a: K.p(t, 21.2) });
    K.text('PATCH /tasks/42   If-Match: "v7"   (stale tab)', 66, 520, { size: 19, mono: true, color: P.muted, a: K.p(t, 22.2) });
    K.text('412 Precondition Failed', 760, 520, { size: 19, mono: true, color: P.warm, a: K.p(t, 23) });
    K.text('the client reloads and shows the newer version: no lost update', 66, 562, { size: 17, color: P.green, a: K.p(t, 23.8) });
  } },

/* 4 ─ caching and offline */
{ d: 23, title: 'Caching and offline',
  caps: [
    [0.3, 'Hashed static assets are cached as immutable on the CDN. The client shows the cached task list, then revalidates it.'],
    [7, 'Hot reads on the server get a short cache with single-flight, so a burst of requests means one database query.'],
    [13, 'Offline, a service worker serves the app shell, and new tasks wait in an IndexedDB outbox with ids made on the client.'],
    [18.5, 'Back online, the outbox replays. The same ids make the writes idempotent, so nothing is created twice.']],
  draw: function (K, t) {
    var P = K.P, g = K.g, i;
    var B = [['browser', 40, P.blue], ['CDN', 360, P.acc], ['API + cache', 680, P.warm], ['database', 1000, P.purple]];
    B.forEach(function (b, k) {
      var q = K.p(t, 0.4 + k * 0.3);
      K.box(b[1], 96, 240, 80, { stroke: b[2], a: q });
      K.text(b[0], b[1] + 120, 136, { size: 20, weight: 800, align: 'center', a: q });
      if (k < 3) K.arrow(b[1] + 246, 136, b[1] + 314, 136, { p: q, color: P.muted });
    });
    K.chip('app.3f9a2c.js', 480, 226, { size: 17, mono: true, stroke: P.acc, a: K.p(t, 1.4) });
    K.text('immutable, max-age 1 year', 480, 266, { size: 16, color: P.acc, align: 'center', a: K.p(t, 2) });
    K.text('cached list shown at once,', 160, 222, { size: 16, color: P.blue, align: 'center', a: K.p(t, 3.4) });
    K.text('then revalidated', 160, 248, { size: 16, color: P.blue, align: 'center', a: K.p(t, 3.4) });
    for (i = 0; i < 6; i++) {
      var y = 214 + i * 22;
      g.save(); g.globalAlpha *= K.p(t, 7.4 + i * 0.08); g.fillStyle = P.blue; g.beginPath(); g.arc(700, y, 7, 0, 7); g.fill(); g.restore();
      K.arrow(710, y, 772, 268, { p: K.p(t, 7.8), color: P.warm, lw: 1.5, head: 7 });
    }
    K.box(780, 244, 120, 48, { stroke: P.warm, a: K.p(t, 7.8) }); K.text('1 load', 840, 268, { size: 17, weight: 700, align: 'center', a: K.p(t, 7.8) });
    K.arrow(904, 268, 1060, 180, { p: K.p(t, 8.8), color: P.purple });
    K.text('1 query', 1010, 250, { size: 17, color: P.purple, a: K.p(t, 9.2) });
    /* offline */
    var off = K.win(t, 13.2, 18.6);
    K.mark(316, 136, false, 0.9, off);
    K.text('offline', 316, 186, { size: 16, color: P.red, align: 'center', a: off });
    var ob = K.p(t, 13.6);
    K.box(40, 330, 520, 250, { fill: P.code, stroke: P.blue, a: ob });
    K.text('service worker: app shell from cache', 64, 360, { size: 17, color: P.blue, a: ob });
    K.text('outbox (IndexedDB)', 64, 400, { size: 17, weight: 700, a: K.p(t, 14.6) });
    [['POST task 7c1f…', 15.2], ['POST task 9a02…', 16.2]].forEach(function (r, k) {
      var q = K.p(t, r[1]), sent = K.p(t, 19.2 + k * 0.8, 0.8);
      K.box(64 + sent * 520, 424 + k * 56, 300, 42, { fill: P.card, stroke: P.warm, r: 8, a: q * (1 - sent) });
      K.text(r[0], 80 + sent * 520, 445 + k * 56, { size: 17, mono: true, a: q * (1 - sent) });
    });
    K.text('ids generated on the client: crypto.randomUUID()', 600, 360, { size: 17, mono: false, color: P.muted, a: K.p(t, 16.4) });
    K.text('replay: POST with the same id twice → one task', 600, 430, { size: 18, color: P.green, a: K.p(t, 19.6) });
    K.mark(612, 480, true, 0.8, K.p(t, 21)); K.text('no duplicates, nothing lost', 638, 480, { size: 18, a: K.p(t, 21) });
  } },

/* 5 ─ delivery and observability */
{ d: 25, title: 'Ship, observe, polish',
  caps: [
    [0.3, 'Ship it through CI as one immutable image, with config validated at startup and the feature behind a flag.'],
    [6.5, 'Roll out with a canary and a rollback plan, and drain gracefully on SIGTERM.'],
    [12, 'Observe it: structured logs with request ids, metrics, traces, real-user Web Vitals, and alerts when the SLO burns too fast.'],
    [19, 'Polish with accessibility, performance budgets and security: semantic HTML, LCP under 2.5 seconds, a CSP and no secrets in the bundle.']],
  draw: function (K, t) {
    var P = K.P;
    [['PR + review', 120, 0.6], ['CI', 300, 1.2], ['app:3f9a2c', 480, 1.8], ['canary 5%', 700, 7], ['100%', 900, 9.4]].forEach(function (s, i) {
      K.chip(s[0], s[1], 110, { size: 17, mono: i === 2, stroke: i === 3 ? P.warm : P.acc, a: K.p(t, s[2]) });
      if (i) K.arrow([186, 328, 548, 756][i - 1], 110, [270, 410, 642, 862][i - 1], 110, { p: K.p(t, s[2]), color: P.muted });
    });
    K.chip('flag: tasks.sharing', 1110, 110, { size: 17, mono: true, stroke: P.purple, a: K.p(t, 3.6) });
    K.text('config validated at startup', 300, 160, { size: 16, color: P.muted, align: 'center', a: K.p(t, 2.8) });
    K.chip('rollback: previous image', 700, 170, { size: 16, stroke: P.red, a: K.p(t, 8.2) });
    K.chip('SIGTERM → drain', 1010, 170, { size: 16, mono: true, stroke: P.warm, a: K.p(t, 10) });
    /* observability */
    var o = K.p(t, 12.2);
    K.panel(40, 214, 600, 100, 'logs', { a: o });
    K.text('{"level":"info","requestId":"r-91","route":"/tasks","ms":42}', 60, 270, { size: 16, mono: true, a: K.p(t, 12.6) });
    K.panel(660, 214, 280, 100, 'metrics', { a: K.p(t, 13.2) });
    [30, 42, 26, 50, 38, 60, 34].forEach(function (h, i) { K.box(684 + i * 34, 300 - h * 0.7, 22, h * 0.7, { fill: P.acc, r: 3, a: K.p(t, 13.4 + i * 0.1) }); });
    K.panel(960, 214, 280, 100, 'trace', { a: K.p(t, 14) });
    [[0, 220, P.blue], [30, 120, P.acc], [60, 70, P.purple]].forEach(function (s, i) { K.box(984 + s[0], 256 + i * 16, s[1], 10, { fill: s[2], r: 3, a: K.p(t, 14.2 + i * 0.2) }); });
    K.text('RUM: LCP 1.9 s · INP 120 ms · CLS 0.05', 60, 350, { size: 18, mono: true, color: P.green, a: K.p(t, 15.2) });
    K.mark(724, 350, false, 0.7, K.p(t, 16.4));
    K.text('SLO burn rate high → page the on-call', 748, 350, { size: 18, color: P.red, a: K.p(t, 16.4) });
    /* polish */
    [['Accessibility', 'semantic HTML, keyboard,', 'focus moves on route change', P.blue, 19.4], ['Performance', 'LCP ≤ 2.5 s, INP ≤ 200 ms,', 'CLS ≤ 0.1, code splitting', P.green, 20.6],
     ['Security', 'CSP + Trusted Types, SRI,', 'no secrets in the bundle', P.red, 21.8]].forEach(function (c, i) {
      var x = 40 + i * 407, q = K.p(t, c[4]);
      K.box(x, 386, 386, 196, { stroke: c[3], a: q });
      K.text(c[0], x + 22, 418, { size: 21, weight: 800, color: c[3], a: q });
      K.text(c[1], x + 22, 470, { size: 18, a: q });
      K.text(c[2], x + 22, 506, { size: 18, a: q });
    });
  } },

/* 6 ─ the blueprint */
{ d: 21, title: 'The blueprint',
  caps: [
    [0.3, 'Here is the whole blueprint on one page: fourteen layers, each with a decision you can explain and defend.'],
    [7, 'Testing spans every layer: unit tests for logic, integration tests for API plus database, and a few end-to-end journeys.'],
    [14, 'In a system design interview, walk these layers in order and name the trade-offs. That is what senior answers sound like.']],
  draw: function (K, t) {
    var P = K.P;
    var L = [['Requirements', 'SLOs, scale'], ['Routing', '/tasks?status'], ['Forms', 'native + a11y'], ['API', 'REST, cursors'], ['Auth', 'cookie, CSRF'], ['Data', 'indexes, version'], ['Caching', 'SWR, single-flight'],
             ['Offline', 'SW + outbox'], ['Testing', 'unit · API · e2e'], ['Delivery', 'CI, canary'], ['Observability', 'logs, traces'], ['Accessibility', 'focus, labels'], ['Performance', 'budgets, split'], ['Security', 'CSP, SRI, audit']];
    var walk = t > 14.6 ? Math.floor((t - 14.6) * 2.2) : -1;
    L.forEach(function (l, i) {
      var x = 40 + (i % 7) * 174, y = 90 + Math.floor(i / 7) * 140, q = K.back((t - 0.6 - i * 0.3) / 0.5); if (q <= 0) return;
      var hot = (i === 8 && t > 7.2 && t < 14.4) || walk === i, a = K.clamp(q * 1.5);
      K.box(x, y, 164, 120, { stroke: hot ? P.warm : P.acc, fill: hot ? 'rgba(246,173,85,.14)' : P.card, a: a });
      K.text(String(i + 1), x + 16, y + 24, { size: 16, mono: true, color: P.muted, a: a });
      K.text(l[0], x + 82, y + 56, { size: 18, weight: 800, align: 'center', a: a });
      K.text(l[1], x + 82, y + 90, { size: 16, color: P.muted, align: 'center', a: a });
    });
    /* test pyramid */
    var pa = K.p(t, 7.4);
    [['a few e2e journeys', 260, 7.6, P.warm], ['integration: API + database', 440, 8.6, P.blue], ['unit tests for logic: many, fast', 620, 9.6, P.green]].forEach(function (r, i) {
      var w = r[1], y = 400 + i * 58, q = K.p(t, r[2]);
      K.box(380 - w / 2, y, w, 48, { fill: P.card, stroke: r[3], a: q });
      K.text(r[0], 380, y + 24, { size: 18, align: 'center', a: q });
    });
    K.chip('+ accessibility checks', 940, 430, { size: 17, stroke: P.purple, a: K.p(t, 10.8) });
    K.chip('+ contract tests', 940, 490, { size: 17, stroke: P.purple, a: K.p(t, 11.6) });
    K.text('walk the layers in order, name the trade-offs', 940, 556, { size: 18, color: P.warm, align: 'center', a: K.p(t, 14.4) });
  } },

/* 7 ─ rapid-fire */
{ d: 22, title: 'Final review: rapid-fire',
  caps: [
    [0.3, 'Now the final review: a timed rapid-fire round. Read a question, answer aloud in about fifteen seconds, then check.'],
    [7.5, 'Mark each answer right or wrong, and redo the wrong ones tomorrow. Short answers expose gaps fast.'],
    [13.5, 'For example: what does Cache-Control no-cache mean? Store the response, but revalidate it before every use.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var second = t > 13.6, ca = K.p(t, 0.4);
    K.box(140, 96, 820, 250, { stroke: P.acc, a: ca });
    K.text(second ? 'Question 12' : 'Question 7', 170, 128, { size: 17, color: P.muted, a: ca });
    K.text('Why use pipeline() instead of .pipe()?', 170, 190, { size: 26, weight: 700, a: ca * (1 - K.p(t, 13.2, 0.3)) });
    K.text('It forwards errors and cleans up every stream.', 170, 270, { size: 22, color: P.green, a: K.p(t, 5.2) * (1 - K.p(t, 13.2, 0.3)) });
    K.text('What does Cache-Control: no-cache mean?', 170, 190, { size: 26, weight: 700, a: K.p(t, 13.6, 0.3) });
    K.text('Store it, but revalidate before every use.', 170, 270, { size: 22, color: P.green, a: K.p(t, 17.4) });
    var t0 = second ? 13.8 : 1, left = K.clamp(1 - (t - t0) / (second ? 3.4 : 4));
    g.save(); g.globalAlpha *= ca; g.lineWidth = 10; g.strokeStyle = P.line; g.beginPath(); g.arc(1100, 220, 70, 0, 7); g.stroke();
    g.strokeStyle = left > 0.3 ? P.acc : P.warm; g.beginPath(); g.arc(1100, 220, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); g.stroke(); g.restore();
    K.text(String(Math.ceil(left * 15)) + ' s', 1100, 222, { size: 28, mono: true, weight: 700, align: 'center', a: ca });
    /* score row */
    var marks = [1, 1, 0, 1, 1, 0, 1];
    K.text('score:', 140, 420, { size: 19, weight: 700, color: P.muted, a: K.p(t, 7.6) });
    marks.forEach(function (m, i) { K.mark(240 + i * 50, 420, !!m, 0.85, K.p(t, 7.8 + i * 0.3)); });
    K.arrow(690, 420, 780, 420, { p: K.p(t, 10.4), color: P.warm });
    K.chip('redo #3 and #6 tomorrow', 940, 420, { size: 18, stroke: P.warm, a: K.p(t, 10.6) });
    K.text('20 minutes, 36 questions, answers out loud', 640, 500, { size: 18, color: P.muted, align: 'center', a: K.p(t, 11.8) });
  } },

/* 8 ─ self-assessment and plan */
{ d: 22, title: 'Your updated study plan',
  caps: [
    [0.3, 'Then score each area from 1 to 5, honestly. Honest scores help you; confident guesses do not.'],
    [7, 'The self-assessment turns your scores into a plan: the course days to revisit, weakest area first.'],
    [14, 'Finish with the timed mock interview rounds from Day 40, then repeat the review cycle.']],
  draw: function (K, t) {
    var P = K.P;
    var S = [['HTTP APIs', 4], ['Streams', 3], ['Databases', 2], ['Caching', 3], ['Git and CI', 4], ['Deployment', 2], ['Wasm, Atomics', 1], ['Parsers', 3]];
    K.text('self-assessment', 60, 100, { size: 18, weight: 700, color: P.muted, a: K.p(t, 0.4) });
    S.forEach(function (s, i) {
      var y = 140 + i * 50, q = K.p(t, 0.8 + i * 0.35);
      K.text(s[0], 60, y, { size: 18, a: q });
      for (var k = 0; k < 5; k++) {
        var on = k < s[1] && t > 1.4 + i * 0.35 + k * 0.12, col = s[1] <= 2 ? P.warm : P.acc;
        K.box(240 + k * 44, y - 14, 36, 28, { fill: on ? col : P.code, stroke: on ? col : P.line, r: 6, a: q });
      }
      K.text(String(s[1]), 470, y, { size: 18, mono: true, weight: 700, color: s[1] <= 2 ? P.warm : P.ink, a: K.p(t, 2 + i * 0.35) });
    });
    var pa = K.p(t, 7.2);
    K.box(560, 100, 680, 330, { stroke: P.green, a: pa });
    K.text('Plan: weakest first', 584, 128, { size: 20, weight: 800, color: P.green, a: pa });
    [['Wasm, Atomics', 'Day 54'], ['Databases', 'Day 52'], ['Deployment', 'Day 53'], ['Streams', 'Day 51'], ['Parsers', 'Day 54']].forEach(function (r, i) {
      var y = 180 + i * 50, q = K.p(t, 7.8 + i * 0.7);
      K.text(String(i + 1) + '.', 590, y, { size: 19, mono: true, color: P.muted, a: q });
      K.text(r[0], 630, y, { size: 19, a: q });
      K.chip(r[1], 1150, y, { size: 17, mono: true, stroke: P.acc, a: q });
    });
    var cy = ['review', 'score', 'plan', 'practice'];
    cy.forEach(function (c, i) {
      var x = 660 + i * 170;
      K.chip(c, x, 500, { size: 19, stroke: i === 3 ? P.warm : P.acc, a: K.p(t, 14.2 + i * 0.5) });
      if (i < 3) K.arrow(x + 50, 500, x + 116, 500, { p: K.p(t, 14.4 + i * 0.5), color: P.muted });
    });
    K.curve(1170, 524, 915, 600, 660, 524, { p: K.p(t, 16.4, 0.8), color: P.muted, lw: 2, dash: [6, 6], head: 10 });
    K.text('mock rounds from Day 40', 1170, 462, { size: 16, color: P.warm, align: 'center', a: K.p(t, 15.8) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 55 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 100, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Write requirements and SLOs before code',
     'Follow one request: UI, API, auth, data',
     'Cache with intent; queue offline writes with stable ids',
     'Ship with CI, flags and canaries; observe with logs and RUM',
     'Build in accessibility, performance budgets and security',
     'Rapid-fire, score honestly, revisit the weakest days first'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 55 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
