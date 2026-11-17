/* Day 52 in motion: safe SQL, indexes, N+1, transactions and optimistic concurrency, pooling, cache-aside, stampedes and HTTP caching. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day52', {
  kicker: 'JavaScript: Zero to Architect · Day 52',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 52: using databases safely and efficiently, and caching without serving stale data or melting the database.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('The data layer', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 52 · Databases and caching', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Safe SQL', 'Indexes and N+1', 'Caching'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ SQL injection */
{ d: 25, title: 'SQL injection',
  caps: [
    [0.3, "Never build SQL by gluing strings together. An apostrophe in a name like O'Brien already breaks the query."],
    [7, "Worse, input like x' OR '1'='1 rewrites what the query means, and now it matches every row."],
    [13.5, 'Use parameterized queries. The statement and the values travel separately, so a value can never become SQL.'],
    [19.5, 'Escaping by hand is not enough. Also connect with a database user that has only the rights the app needs.']],
  draw: function (K, t) {
    var P = K.P;
    var bad = ['const sql = "SELECT * FROM users " +', '  "WHERE name = \'" + name + "\'";'];
    K.panel(40, 84, 720, 120, 'search.js', { a: K.p(t, 0.2), stroke: P.red });
    K.code(bad, 66, 130, { size: 20, lh: 1.5, n: K.typed(t, bad, [0.6, 1.8], 32), t: t, a: K.p(t, 0.2) });
    K.box(40, 224, 720, 150, { fill: P.code, stroke: P.line, a: K.p(t, 2.6) });
    var a1 = K.p(t, 3) * (1 - K.p(t, 6.8, 0.3)), a2 = K.p(t, 7.2, 0.3);
    K.text('name =', 64, 254, { size: 17, color: P.muted, a: K.p(t, 3) });
    K.text("O'Brien", 140, 254, { size: 19, mono: true, color: P.warm, a: a1 });
    K.text("x' OR '1'='1", 140, 254, { size: 19, mono: true, color: P.red, a: a2 });
    K.text("SELECT * FROM users WHERE name = 'O'Brien'", 64, 302, { size: 18, mono: true, a: a1 * K.p(t, 3.6) });
    K.text("SELECT * FROM users WHERE name = 'x' OR '1'='1'", 64, 302, { size: 18, mono: true, a: a2 * K.p(t, 7.8) });
    K.mark(78, 346, false, 0.75, Math.max(a1 * K.p(t, 4.6), a2 * K.p(t, 9)));
    K.text('syntax error: the quote ends the string early', 102, 346, { size: 17, color: P.red, a: a1 * K.p(t, 4.6) });
    K.text('the WHERE is now always true', 102, 346, { size: 17, color: P.red, a: a2 * K.p(t, 9) });
    /* table */
    var tb = K.p(t, 1);
    K.box(800, 84, 440, 290, { stroke: P.line, a: tb });
    K.text('users', 824, 110, { size: 17, weight: 700, color: P.muted, a: tb });
    var all = K.win(t, 9.4, 13.6), none = K.p(t, 16);
    ['1   Ana', '2   Ben', "3   O'Brien", '4   Kim'].forEach(function (r, i) {
      var y = 150 + i * 52;
      K.box(820, y - 20, 400, 40, { fill: all > 0.5 ? 'rgba(252,129,129,.14)' : P.code, stroke: all > 0.5 ? P.red : P.line, r: 8, a: tb * (1 - 0.5 * none) });
      K.text(r, 840, y, { size: 18, mono: true, a: tb * (1 - 0.5 * none) });
    });
    K.text('all 4 rows returned', 1020, 354, { size: 17, color: P.red, align: 'center', a: all });
    K.text('0 rows: nobody has that name', 1020, 354, { size: 17, color: P.green, align: 'center', a: none });
    /* safe */
    var good = ['await db.query(', '  "SELECT * FROM users WHERE name = $1",', '  [name]);'];
    K.panel(40, 396, 720, 134, 'safe.js', { a: K.p(t, 13.6), stroke: P.green });
    K.code(good, 66, 440, { size: 19, lh: 1.45, n: K.typed(t, good, [13.9, 14.6, 16], 34), t: t, a: K.p(t, 13.6) });
    K.chip('statement with $1', 880, 430, { size: 16, mono: true, stroke: P.acc, a: K.p(t, 15) });
    K.chip('["x\' OR \'1\'=\'1"]', 880, 490, { size: 16, mono: true, stroke: P.warm, a: K.p(t, 15.6) });
    K.arrow(990, 430, 1076, 450, { p: K.p(t, 15.4), color: P.acc });
    K.arrow(975, 490, 1076, 470, { p: K.p(t, 16), color: P.warm });
    K.box(1084, 420, 156, 80, { stroke: P.green, a: K.p(t, 15.2) });
    K.text('database', 1162, 460, { size: 18, weight: 700, align: 'center', a: K.p(t, 15.2) });
    K.chip('escaping by hand: not enough', 230, 562, { size: 17, stroke: P.red, a: K.p(t, 19.8) });
    K.chip('least-privilege DB user', 590, 562, { size: 17, stroke: P.acc, a: K.p(t, 21) });
    K.chip('ORMs bind parameters too', 930, 562, { size: 17, stroke: P.acc, a: K.p(t, 22) });
  } },

/* 3 ─ indexes */
{ d: 24, title: 'Indexes',
  caps: [
    [0.3, 'Without an index, a query on email has to read every row: a full table scan, and its cost grows with the table.'],
    [7.5, 'An index keeps the keys sorted in a B-tree, so the database jumps to the match in a few steps.'],
    [13.5, 'Index the columns you filter, join or sort on. Each index makes writes a little slower and takes storage.'],
    [19, 'Check with EXPLAIN: the plan should change from a sequential scan to an index scan.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['SELECT * FROM users WHERE email = $1;', 'CREATE INDEX users_email_idx ON users (email);'];
    K.panel(40, 84, 1200, 100, '', { a: K.p(t, 0.2) });
    K.code(code, 66, 100, { size: 20, lh: 1.5, n: K.typed(t, code, [0.5, 8], 34), t: t, a: K.p(t, 0.2) });
    /* scan */
    var sa = K.p(t, 1);
    K.text('no index: full table scan', 60, 204, { size: 17, weight: 700, color: P.warm, a: sa });
    var E = ['max@mail.com', 'ana@mail.com', 'lou@mail.com', 'dee@mail.com', 'fay@mail.com', 'ben@mail.com', 'kim@mail.com', 'eli@mail.com', 'cy@mail.com'];
    var k = t > 1.4 && t < 7.2 ? Math.floor((t - 1.4) * 4) % 9 : -1;
    E.forEach(function (e, i) {
      var y = 224 + i * 26, hit = i === 6 && t > 3;
      K.box(60, y, 500, 22, { fill: i === k ? 'rgba(246,173,85,.3)' : hit ? 'rgba(104,211,145,.18)' : P.card, stroke: i === k ? P.warm : P.line, r: 5, lw: 1.5, a: sa * (1 - 0.4 * K.p(t, 8)) });
      K.text(e, 74, y + 11, { size: 16, mono: true, color: hit ? P.green : P.muted, a: sa * (1 - 0.4 * K.p(t, 8)) });
    });
    var n = Math.min(1000000, Math.max(0, Math.floor((t - 1.4) * 180000)));
    K.text('rows read: ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','), 560, 204, { size: 17, mono: true, color: P.warm, align: 'right', a: K.p(t, 1.6) });
    K.text('O(n)', 560, 470, { size: 20, weight: 700, color: P.red, align: 'right', a: K.p(t, 4.4) });
    /* b-tree */
    K.text('B-tree index on email', 680, 204, { size: 17, weight: 700, color: P.green, a: K.p(t, 8) });
    var N = [[950, 250, 'm', 8.4], [810, 330, 'f', 8.8], [1090, 330, 's', 8.8], [730, 410, 'a-e', 9.2], [880, 410, 'f-l', 9.2], [1020, 410, 'm-r', 9.2], [1170, 410, 's-z', 9.2]];
    var link = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], path = { 0: 9.8, 1: 10.4, 4: 11 };
    link.forEach(function (l) {
      var A = N[l[0]], B = N[l[1]], on = path[l[0]] != null && path[l[1]] != null && t > path[l[1]];
      K.arrow(A[0], A[1] + 20, B[0], B[1] - 20, { p: K.p(t, B[3]), color: on ? P.green : P.line, head: 0.1, lw: on ? 3 : 2 });
    });
    N.forEach(function (nd, i) {
      var q = K.p(t, nd[3]), on = path[i] != null && t > path[i], w = i > 2 ? 110 : 70;
      K.box(nd[0] - w / 2, nd[1] - 20, w, 40, { stroke: on ? P.green : P.line, fill: on ? 'rgba(104,211,145,.16)' : P.card, a: q, r: 8 });
      K.text(nd[2], nd[0], nd[1], { size: 18, mono: true, align: 'center', a: q });
    });
    K.text('kim@ found: 3 steps, O(log n)', 950, 466, { size: 18, color: P.green, align: 'center', a: K.p(t, 11.6) });
    /* trade-offs */
    ['WHERE', 'JOIN', 'ORDER BY'].forEach(function (c, i) { K.chip(c, 110 + i * 120, 510, { size: 17, mono: true, stroke: P.acc, a: K.p(t, 13.8 + i * 0.4) }); });
    K.text('trade-off: slower writes, more storage', 440, 510, { size: 18, color: P.warm, a: K.p(t, 15.6) });
    K.text('EXPLAIN', 66, 560, { size: 19, mono: true, weight: 700, a: K.p(t, 19.2) });
    K.text('Seq Scan on users', 170, 560, { size: 19, mono: true, color: P.red, a: K.p(t, 19.6) * (1 - 0.5 * K.p(t, 21)) });
    K.arrow(366, 560, 410, 560, { p: K.p(t, 20.6), color: P.muted });
    K.text('Index Scan using users_email_idx', 422, 560, { size: 19, mono: true, color: P.green, a: K.p(t, 21) });
  } },

/* 4 ─ N+1 */
{ d: 24, title: 'The N+1 problem',
  caps: [
    [0.3, 'The N+1 problem: one query loads a list of posts, then the code runs one more query per post to fetch its author.'],
    [7, 'Five posts means six round trips. A page of 100 posts means 101, and every trip waits on the network.'],
    [13, 'Batch instead: collect the author ids and load them all in one query. Two queries, whatever the list size.'],
    [19, 'ORM lazy loading and GraphQL resolvers hide N+1 easily. Log the number of queries per request to catch it.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['// 1 query for the list', 'const posts = await db.query(listSql);', 'for (const p of posts) {', '  // +1 query per post', '  p.author = await db.query(', '    authorSql, [p.authorId]);', '}'];
    K.panel(40, 84, 600, 236, 'posts.js', { a: K.p(t, 0.2), stroke: t > 13 ? P.line : P.warm });
    K.code(code, 66, 128, { size: 19, lh: 1.45, n: K.typed(t, code, [0.5, 1.2, 2.3, 3, 3.7, 4.5, 5.3], 36), t: t, a: K.p(t, 0.2) });
    /* round trips */
    K.box(1110, 96, 130, 206, { stroke: P.line, a: K.p(t, 1.2) });
    K.text('database', 1175, 199, { size: 17, weight: 700, align: 'center', a: K.p(t, 1.2) });
    ['posts', 'author 1', 'author 2', 'author 3', 'author 4', 'author 5'].forEach(function (l, i) {
      var y = 114 + i * 36, st = 1.8 + i * 0.8;
      K.text(l, 680, y, { size: 16, mono: true, color: i ? P.warm : P.ink, a: K.p(t, st) });
      K.arrow(780, y, 1100, y, { p: K.p(t, st, 0.5), color: i ? P.warm : P.acc, lw: 2.5 });
    });
    K.text('queries: 6', 680, 326, { size: 19, mono: true, weight: 700, color: P.warm, a: K.p(t, 6.4) });
    K.text('100 posts = 101 queries, each a round trip', 860, 326, { size: 17, color: P.red, a: K.p(t, 7.6) });
    /* batched */
    var b = ['const ids = posts.map((p) => p.authorId);', 'const authors = await db.query(', '  "SELECT * FROM users WHERE id = ANY($1)", [ids]);'];
    K.panel(40, 344, 600, 142, 'batched.js', { a: K.p(t, 13.2), stroke: P.green });
    K.code(b, 66, 386, { size: 19, lh: 1.45, n: K.typed(t, b, [13.4, 14.6, 15.4], 40), t: t, a: K.p(t, 13.2) });
    K.box(1110, 370, 130, 90, { stroke: P.line, a: K.p(t, 13.4) });
    K.text('database', 1175, 415, { size: 17, weight: 700, align: 'center', a: K.p(t, 13.4) });
    K.text('posts', 680, 396, { size: 16, mono: true, a: K.p(t, 15) });
    K.arrow(780, 396, 1100, 396, { p: K.p(t, 15, 0.5), color: P.acc, lw: 2.5 });
    K.text('authors', 680, 434, { size: 16, mono: true, color: P.green, a: K.p(t, 16.2) });
    K.arrow(780, 434, 1100, 434, { p: K.p(t, 16.2, 0.5), color: P.green, lw: 2.5 });
    K.text('queries: 2', 680, 474, { size: 19, mono: true, weight: 700, color: P.green, a: K.p(t, 17) });
    K.mark(830, 474, true, 0.8, K.p(t, 17.3));
    /* hiding places */
    K.chip('ORM lazy loading', 150, 548, { size: 17, stroke: P.warm, a: K.p(t, 19.3) });
    K.chip('GraphQL resolvers', 350, 548, { size: 17, stroke: P.warm, a: K.p(t, 19.9) });
    K.chip('DataLoader batches per tick', 625, 548, { size: 17, stroke: P.acc, a: K.p(t, 21) });
    K.chip('log queries per request', 960, 548, { size: 17, stroke: P.acc, a: K.p(t, 21.8) });
  } },

/* 5 ─ transactions and optimistic concurrency */
{ d: 26, title: 'Transactions and lost updates',
  caps: [
    [0.3, 'A transaction is all or nothing. Moving money debits one account and credits the other, or does neither.'],
    [7, 'If anything fails halfway, ROLLBACK undoes every change, so money never disappears.'],
    [13, 'Two editors who load the same row can silently overwrite each other. That is a lost update.'],
    [19.5, 'Optimistic concurrency fixes it with a version column. Update only if the version still matches; zero rows changed means retry.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['BEGIN;', 'UPDATE accounts SET balance = balance - 50', '  WHERE id = 1;', 'UPDATE accounts SET balance = balance + 50', '  WHERE id = 2;', 'COMMIT;'];
    K.panel(40, 84, 580, 220, 'transfer.sql', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 18, lh: 1.45, n: K.typed(t, code, [0.5, 0.8, 2.2, 2.7, 4.1, 4.6], 34), t: t, a: K.p(t, 0.2), w: 560,
      hi: t > 7 ? -1 : t > 5.2 ? 5 : t > 4.4 ? 3 : t > 2.6 ? 1 : -1, marks: t > 9 && t < 13 ? { 3: 'rgba(252,129,129,.22)' } : null });
    /* accounts */
    var A = t < 2.8 ? '100' : t < 7.4 ? '50' : t < 8.4 ? '100' : t < 10.6 ? '50' : '100';
    var B = t < 4.4 ? '20' : t < 7.4 ? '70' : '20';
    var ac = K.p(t, 1);
    [['account 1', A, 700], ['account 2', B, 980]].forEach(function (c) {
      K.box(c[2], 96, 240, 84, { stroke: P.acc, a: ac });
      K.text(c[0], c[2] + 20, 118, { size: 16, color: P.muted, a: ac });
      K.text(c[1], c[2] + 20, 154, { size: 28, mono: true, weight: 700, color: P.warm, a: ac });
    });
    K.mark(712, 220, true, 0.8, K.win(t, 5.4, 7.2));
    K.text('COMMIT: both changes saved together', 736, 220, { size: 18, color: P.green, a: K.win(t, 5.4, 7.2) });
    K.mark(712, 220, false, 0.8, K.p(t, 9.2));
    K.text('step 2 fails: ROLLBACK', 736, 220, { size: 18, color: P.red, a: K.p(t, 9.2) });
    K.text('account 1 is back to 100; no money lost', 712, 262, { size: 18, color: P.green, a: K.p(t, 10.8) });
    /* lost update */
    K.text('Two editors, one row', 60, 344, { size: 17, weight: 700, color: P.muted, a: K.p(t, 13.2) });
    K.chip('Ana reads v1', 150, 386, { size: 17, stroke: P.blue, a: K.p(t, 13.6) });
    K.chip('Ben reads v1', 420, 386, { size: 17, stroke: P.purple, a: K.p(t, 14.2) });
    K.text('Ana saves "Intro"', 70, 436, { size: 18, mono: true, color: P.blue, a: K.p(t, 15) });
    K.text('Ben saves "Draft"', 340, 482, { size: 18, mono: true, color: P.purple, a: K.p(t, 16) });
    K.mark(80, 536, false, 0.8, K.p(t, 17));
    K.text("Ana's edit is silently overwritten", 106, 536, { size: 18, color: P.red, a: K.p(t, 17) });
    var fix = ['UPDATE docs SET title = $1,', '  version = version + 1', 'WHERE id = $2 AND version = $3;'];
    K.panel(660, 330, 580, 138, 'optimistic.sql', { a: K.p(t, 19.6), stroke: P.green });
    K.code(fix, 686, 372, { size: 19, lh: 1.45, n: K.typed(t, fix, [19.9, 20.8, 21.6], 36), t: t, a: K.p(t, 19.6) });
    K.mark(686, 506, true, 0.8, K.p(t, 22.6));
    K.text('Ana: 1 row updated, now v2', 712, 506, { size: 18, a: K.p(t, 22.6) });
    K.text('Ben: 0 rows (still v1?) → reload and retry', 686, 552, { size: 18, color: P.warm, a: K.p(t, 23.6) });
  } },

/* 6 ─ pooling and pagination */
{ d: 22, title: 'Pools and pagination',
  caps: [
    [0.3, 'Opening a database connection is slow, and the database only allows so many. Never open one per request.'],
    [7.5, 'A pool keeps a few connections open and lends them out. Extra requests wait briefly for a free one.'],
    [13.5, 'For deep pages, OFFSET still reads and throws away every skipped row. Keyset pagination continues after the last id.']],
  draw: function (K, t) {
    var P = K.P;
    var pool = K.p(t, 7.8), direct = K.p(t, 1.2) * (1 - pool);
    for (var i = 0; i < 6; i++) {
      var y = 124 + i * 40, wait = i >= 4 && t > 9.4;
      K.chip('req ' + (i + 1), 100, y, { size: 16, mono: true, stroke: wait ? P.warm : P.blue, a: K.p(t, 0.6 + i * 0.12) });
      K.arrow(146, y, 1000, 210, { p: K.p(t, 1.2 + i * 0.25), color: P.red, dash: [6, 6], lw: 2, a: direct });
      if (i < 4) K.arrow(146, y, 416, 150 + i * 46, { p: K.p(t, 8.2 + i * 0.15), color: P.blue, lw: 2.5, a: pool });
    }
    K.text('waiting', 196, 304, { size: 16, color: P.warm, a: K.p(t, 9.6) });
    K.box(1010, 140, 220, 150, { stroke: t < 7.8 && t > 4 ? P.red : P.line, a: K.p(t, 1) });
    K.text('database', 1120, 196, { size: 20, weight: 700, align: 'center', a: K.p(t, 1) });
    K.text('max connections', 1120, 232, { size: 16, color: P.muted, align: 'center', a: K.p(t, 1) });
    K.mark(1030, 330, false, 0.8, K.win(t, 4.2, 7.8));
    K.text('too many clients', 1054, 330, { size: 18, color: P.red, a: K.win(t, 4.2, 7.8) });
    K.text('each connect: TCP, TLS, auth', 640, 380, { size: 18, color: P.muted, align: 'center', a: K.win(t, 2.6, 7.6) });
    K.box(424, 120, 320, 210, { stroke: P.acc, a: pool });
    K.text('pool (max: 4)', 444, 104, { size: 17, weight: 700, color: P.acc, a: pool });
    for (var c = 0; c < 4; c++) {
      K.box(444, 132 + c * 46, 280, 36, { fill: P.code, stroke: P.line, r: 8, a: pool });
      K.text('connection ' + (c + 1), 584, 150 + c * 46, { size: 16, mono: true, align: 'center', a: pool });
      K.arrow(744, 150 + c * 46, 1004, 200 + c * 10, { p: K.p(t, 8.6), color: P.acc, lw: 2, a: pool });
    }
    K.text('const pool = new Pool({ max: 4 });', 424, 372, { size: 18, mono: true, color: P.acc, a: K.p(t, 10.4) });
    /* pagination */
    var pg = K.p(t, 13.8);
    K.box(40, 410, 1200, 178, { fill: P.code, stroke: P.line, a: pg });
    K.mark(66, 450, false, 0.8, K.p(t, 14));
    K.text('ORDER BY id LIMIT 20 OFFSET 100000', 92, 450, { size: 19, mono: true, a: K.p(t, 14) });
    K.text('reads and discards 100,000 rows', 760, 450, { size: 18, color: P.red, a: K.p(t, 15) });
    K.mark(66, 500, true, 0.8, K.p(t, 16.6));
    K.text('WHERE id > $1 ORDER BY id LIMIT 20', 92, 500, { size: 19, mono: true, a: K.p(t, 16.6) });
    K.text('the index jumps straight to the page', 760, 500, { size: 18, color: P.green, a: K.p(t, 17.4) });
    K.text('$1 is the last id of the previous page: a cursor that stays stable when rows are inserted', 66, 552, { size: 17, color: P.muted, a: K.p(t, 18.6) });
  } },

/* 7 ─ cache-aside */
{ d: 25, title: 'Cache-aside',
  caps: [
    [0.3, 'A cache keeps a copy of data close by. The most common pattern is cache-aside: the app checks the cache first.'],
    [7, 'On a hit, it answers in about a millisecond. On a miss, it loads from the database, then stores the value with a TTL.'],
    [13.5, 'The TTL is your staleness budget: a cached value can be up to that old. Deleting the key on writes shortens it.'],
    [19, 'Never treat the cache as the source of truth. It can be evicted or lost, so the app must still work without it.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['async function getUser(id) {', '  const hit = await cache.get("user:" + id);', '  if (hit) return hit;', '  const user = await db.findUser(id);',
                '  await cache.set("user:" + id, user, { ttl: 60 });', '  return user;', '}'];
    K.panel(40, 84, 600, 248, 'users.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 128, { size: 19, lh: 1.45, n: K.typed(t, code, [0.5, 1.3, 2.6, 3.2, 4.3, 5.6, 6], 38), t: t, a: K.p(t, 0.2), w: 580,
      hi: t > 11.6 && t < 13.5 ? 4 : t > 9.6 && t < 11.6 ? 3 : t > 7.2 && t < 9.4 ? 2 : t > 2 && t < 7 ? 1 : -1 });
    var d = K.p(t, 1.4);
    K.box(680, 104, 150, 70, { stroke: P.blue, a: d }); K.text('app', 755, 139, { size: 20, weight: 700, align: 'center', a: d });
    var down = K.p(t, 19.4);
    K.box(1060, 104, 180, 70, { stroke: down > 0.5 ? P.red : P.acc, a: d * (1 - 0.5 * down) }); K.text('cache (Redis)', 1150, 139, { size: 18, weight: 700, align: 'center', a: d * (1 - 0.5 * down) });
    K.box(1060, 254, 180, 70, { stroke: P.purple, a: d }); K.text('database', 1150, 289, { size: 18, weight: 700, align: 'center', a: d });
    K.arrow(834, 126, 1054, 126, { p: K.p(t, 2.4, 0.5), color: P.acc });
    K.text('get user:42', 944, 108, { size: 16, mono: true, color: P.acc, align: 'center', a: K.p(t, 2.6) * (1 - K.p(t, 11, 0.3)) });
    K.text('set user:42, ttl 60 s', 944, 108, { size: 16, mono: true, color: P.purple, align: 'center', a: K.p(t, 11.6, 0.3) });
    K.arrow(1054, 156, 834, 156, { p: K.p(t, 7.4, 0.5), color: P.green, a: 1 - K.p(t, 9.4) });
    K.text('hit: ~1 ms', 944, 180, { size: 16, color: P.green, align: 'center', a: K.win(t, 7.6, 9.4) });
    K.mark(1228, 104, false, 0.7, K.win(t, 9.6, 13.4));
    K.text('miss', 944, 180, { size: 16, color: P.warm, align: 'center', a: K.win(t, 9.8, 13.4) });
    K.arrow(810, 178, 1054, 278, { p: K.p(t, 10.2, 0.5), color: P.purple });
    K.text('load: ~20 ms', 880, 262, { size: 16, color: P.purple, a: K.p(t, 10.4) });
    /* ttl timeline */
    var tl = K.p(t, 13.8);
    K.box(100, 418, 1100, 4, { fill: P.line, r: 2, a: tl });
    K.box(100, 410, 620 * K.p(t, 14.2, 1.2), 20, { fill: 'rgba(79,209,197,.25)', r: 4, a: tl });
    K.text('set', 100, 392, { size: 16, color: P.acc, align: 'center', a: tl });
    K.text('expires after 60 s', 720, 392, { size: 16, color: P.acc, align: 'center', a: K.p(t, 15) });
    K.text('may be up to 60 s stale', 270, 452, { size: 17, color: P.warm, align: 'center', a: K.p(t, 15.6) });
    K.box(480, 406, 4, 28, { fill: P.purple, r: 2, a: K.p(t, 16.8) });
    K.text('on write: cache.delete("user:42")', 470, 452, { size: 16, mono: true, color: P.purple, a: K.p(t, 16.8) });
    K.mark(80, 534, false, 0.8, K.p(t, 19.6));
    K.text('cache down or evicted: read from the database, slower but still correct', 106, 534, { size: 19, a: K.p(t, 19.6) });
  } },

/* 8 ─ stampede */
{ d: 25, title: 'Cache stampede',
  caps: [
    [0.3, 'When a hot key expires, hundreds of requests miss at the same moment and all hit the database. That is a stampede.'],
    [7.5, 'Single-flight fixes it: the first miss starts one load, and every other request awaits that same promise.'],
    [14, "Add jitter to TTLs, a little randomness, so many keys don't all expire in the same second."],
    [19.5, 'Serving the stale value while one request refreshes it in the background smooths the spike even more.']],
  draw: function (K, t) {
    var P = K.P, g = K.g, i;
    function dot(x, y, c, a) { g.save(); g.globalAlpha *= K.clamp(a); g.fillStyle = c; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.restore(); }
    K.text('without protection', 60, 100, { size: 17, weight: 700, color: P.warm, a: K.p(t, 0.6) });
    for (i = 0; i < 8; i++) {
      var y = 136 + i * 26;
      dot(90, y, P.blue, K.p(t, 0.8 + i * 0.08));
      K.arrow(102, y, 436, 220, { p: K.p(t, 1.6 + i * 0.15, 0.5), color: P.red, lw: 2 });
    }
    var hot = K.p(t, 3.6);
    K.box(444, 150, 160, 140, { stroke: hot > 0.5 ? P.red : P.line, fill: hot > 0.5 ? 'rgba(252,129,129,.12)' : P.card, a: K.p(t, 1) });
    K.text('database', 524, 206, { size: 18, weight: 700, align: 'center', a: K.p(t, 1) });
    K.text('8 identical loads', 524, 238, { size: 16, color: P.red, align: 'center', a: hot });
    K.mark(524, 320, false, 0.8, K.p(t, 4.4));
    /* single flight */
    K.text('single-flight', 680, 100, { size: 17, weight: 700, color: P.green, a: K.p(t, 7.6) });
    for (i = 0; i < 8; i++) {
      var y2 = 136 + i * 26;
      dot(710, y2, P.blue, K.p(t, 7.8 + i * 0.06));
      K.arrow(722, y2, 876, 220, { p: K.p(t, 8.4 + i * 0.1, 0.5), color: P.acc, lw: 2 });
      K.arrow(876, 232, 724, y2 + 6, { p: K.p(t, 12, 0.6), color: P.green, lw: 1.5, dash: [5, 5], head: 8 });
    }
    K.box(884, 186, 150, 70, { stroke: P.acc, a: K.p(t, 8.2) });
    K.text('inflight', 959, 210, { size: 18, mono: true, weight: 700, align: 'center', a: K.p(t, 8.2) });
    K.text('Map', 959, 236, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 8.2) });
    K.arrow(1036, 221, 1094, 221, { p: K.p(t, 9.6, 0.5), color: P.green });
    K.box(1100, 166, 140, 110, { stroke: P.green, a: K.p(t, 9.2) });
    K.text('database', 1170, 208, { size: 18, weight: 700, align: 'center', a: K.p(t, 9.2) });
    K.text('1 load', 1170, 240, { size: 17, color: P.green, align: 'center', a: K.p(t, 10) });
    K.text('everyone shares the result', 959, 320, { size: 17, color: P.green, align: 'center', a: K.p(t, 12.4) });
    var code = ['const inflight = new Map();', 'function load(key) {', '  if (!inflight.has(key)) inflight.set(key,', '    fetchFromDb(key).finally(() =>', '      inflight.delete(key)));', '  return inflight.get(key);', '}'];
    K.panel(40, 350, 620, 236, 'single-flight.js', { a: K.p(t, 8.6) });
    K.code(code, 66, 390, { size: 18, lh: 1.42, n: K.typed(t, code, [8.8, 9.4, 9.9, 10.9, 11.7, 12.3, 12.9], 50), t: t, a: K.p(t, 8.6) });
    /* jitter */
    K.text('ttl = 60', 700, 384, { size: 17, mono: true, color: P.muted, a: K.p(t, 14.2) });
    for (i = 0; i < 6; i++) K.box(1000, 372, 6, 26, { fill: P.red, r: 2, a: K.p(t, 14.6) });
    K.text('all expire together', 1020, 384, { size: 16, color: P.red, a: K.p(t, 14.8) });
    K.text('ttl = 60 + random(0-6)', 700, 454, { size: 17, mono: true, color: P.muted, a: K.p(t, 15.8) });
    [0, 0.43, 0.18, 0.77, 0.6, 0.95].forEach(function (f, j) { K.box(1000 + f * 220, 442, 6, 26, { fill: P.green, r: 2, a: K.p(t, 16.2 + j * 0.15) }); });
    K.text('expiry spread out', 1100, 488, { size: 16, color: P.green, align: 'center', a: K.p(t, 17.2) });
    K.chip('serve stale, refresh once in the background', 960, 550, { size: 17, stroke: P.acc, a: K.p(t, 19.8) });
  } },

/* 9 ─ HTTP caching */
{ d: 26, title: 'HTTP caching',
  caps: [
    [0.3, 'Browsers and CDNs cache too, steered by the Cache-Control header. max-age=60 means reuse it for a minute.'],
    [7, 'Hashed asset files never change, so mark them immutable with a long max-age. A new build gets a new file name.'],
    [13, 'Later, the browser revalidates with If-None-Match. If the ETag still matches, the server answers 304 with no body.'],
    [19.5, 'no-cache means store, but revalidate first. no-store means never store. private keeps personal data out of CDNs.']],
  draw: function (K, t) {
    var P = K.P;
    var h = ['HTTP/1.1 200 OK', 'Cache-Control: max-age=60', 'ETag: "v7"'];
    K.panel(40, 84, 580, 132, 'response headers', { a: K.p(t, 0.2) });
    K.code(h, 66, 126, { size: 19, lh: 1.45, n: K.typed(t, h, [0.5, 1.3, 2.6], 30), t: t, a: K.p(t, 0.2), hi: t > 13 && t < 19 ? 2 : t > 2.2 && t < 7 ? 1 : -1, w: 560 });
    var im = ['Cache-Control: max-age=31536000,', '  immutable'];
    K.panel(40, 236, 580, 110, 'app.3f9a2c.js', { a: K.p(t, 7.2), stroke: P.green });
    K.code(im, 66, 278, { size: 19, lh: 1.45, n: K.typed(t, im, [7.5, 8.9], 32), t: t, a: K.p(t, 7.2) });
    K.text('new build → new hash → new URL, so no purge', 60, 372, { size: 17, color: P.green, a: K.p(t, 10) });
    /* sequence */
    var sq = K.p(t, 0.8);
    K.text('browser', 720, 100, { size: 18, weight: 700, color: P.blue, align: 'center', a: sq });
    K.text('server', 1180, 100, { size: 18, weight: 700, color: P.purple, align: 'center', a: sq });
    K.box(719, 116, 2, 210, { fill: P.line, a: sq }); K.box(1179, 116, 2, 210, { fill: P.line, a: sq });
    K.text('GET /api/user', 950, 128, { size: 16, mono: true, align: 'center', a: K.p(t, 1.4) });
    K.arrow(724, 144, 1174, 144, { p: K.p(t, 1.4, 0.5), color: P.blue });
    K.text('200 + body, max-age=60', 950, 172, { size: 16, mono: true, align: 'center', a: K.p(t, 2.6) });
    K.arrow(1174, 188, 724, 188, { p: K.p(t, 2.6, 0.5), color: P.green });
    K.text('next 60 s: no request at all', 950, 216, { size: 16, color: P.green, align: 'center', a: K.p(t, 4) });
    K.text('If-None-Match: "v7"', 950, 248, { size: 16, mono: true, color: P.warm, align: 'center', a: K.p(t, 13.4) });
    K.arrow(724, 264, 1174, 264, { p: K.p(t, 13.4, 0.5), color: P.warm });
    K.text('304 Not Modified, no body', 950, 292, { size: 16, mono: true, color: P.green, align: 'center', a: K.p(t, 15.4) });
    K.arrow(1174, 308, 724, 308, { p: K.p(t, 15.4, 0.5), color: P.green });
    /* directives */
    [['no-cache', 'store it, but revalidate before every use', P.warm, 19.8], ['no-store', 'never store it: secrets, bank pages', P.red, 21.2], ['private', 'browser only: CDNs must not keep it', P.purple, 22.6]].forEach(function (r, i) {
      var y = 430 + i * 54, q = K.p(t, r[3]);
      K.box(40, y - 24, 1200, 48, { fill: P.code, stroke: P.line, a: q });
      K.text(r[0], 66, y, { size: 19, mono: true, weight: 700, color: r[2], a: q });
      K.text(r[1], 250, y, { size: 19, a: q });
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 52 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 100, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Parameterized queries: values never become SQL',
     'Indexes turn scans into B-tree lookups; check with EXPLAIN',
     'Batch away N+1; transactions are all or nothing',
     'Version columns stop lost updates; pool your connections',
     'Cache-aside with a TTL; single-flight and jitter stop stampedes',
     'HTTP caching: Cache-Control, immutable assets, ETag and 304'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 52 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
