/* Day 53 in motion: Git's commit graph, merge vs rebase, conventional commits, CI pipelines, artifacts and Docker, 12-factor config, graceful shutdown and hosting. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day53', {
  kicker: 'JavaScript: Zero to Architect · Day 53',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 53: how Git records history, how CI proves every change, and how code reaches production safely.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Ship it', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 53 · Git, CI and deployment', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Git history', 'CI pipelines', 'Deploying safely'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the commit graph */
{ d: 25, title: 'Commits, branches, HEAD',
  caps: [
    [0.3, 'Git history is a graph. Each commit records a snapshot of your files and points back to its parent.'],
    [6.5, 'A branch is just a movable pointer to a commit. Committing moves the branch you are on forward.'],
    [12.5, 'HEAD marks where you are. When two branches grow from the same commit, they have diverged.'],
    [18.5, 'The reflog remembers everywhere HEAD has been, so even a bad reset can usually be undone.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    function commit(x, y, l, h, col, a, dash) {
      if (a <= 0) return;
      g.save(); g.globalAlpha *= K.clamp(a); g.fillStyle = P.card; g.strokeStyle = col; g.lineWidth = 3; if (dash) g.setLineDash([6, 5]);
      g.beginPath(); g.arc(x, y, 26, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(l, x, y + 1, { size: 22, weight: 800, align: 'center', a: a });
      K.text(h, x, y + 42, { size: 16, mono: true, color: P.muted, align: 'center', a: a });
    }
    commit(160, 360, 'A', 'a1f', P.acc, K.p(t, 0.8));
    commit(320, 360, 'B', 'b2c', P.acc, K.p(t, 1.8));
    K.arrow(292, 360, 190, 360, { p: K.p(t, 2.2, 0.4), color: P.muted });
    K.text('snapshot + parent pointer', 240, 286, { size: 17, color: P.muted, align: 'center', a: K.win(t, 2.6, 12.4) });
    commit(480, 360, 'D', 'd4e', P.acc, K.p(t, 8.6));
    K.arrow(452, 360, 350, 360, { p: K.p(t, 8.8, 0.4), color: P.muted });
    commit(480, 210, 'C', 'c3d', P.warm, K.p(t, 15.6));
    K.arrow(458, 226, 344, 342, { p: K.p(t, 15.8, 0.4), color: P.muted });
    K.text('diverged at B', 524, 210, { size: 17, color: P.warm, a: K.p(t, 16.6) });
    /* pointers */
    var mx = 320 + 160 * K.p(t, 8.8, 0.6), ma = K.p(t, 6.8);
    K.chip('main', mx, 444, { size: 18, mono: true, stroke: P.green, color: P.green, a: ma });
    K.arrow(mx, 426, mx, 404, { color: P.green, a: ma, lw: 2, head: 9 });
    var fa = K.p(t, 13.2), fx = 320 + 160 * K.p(t, 15.6, 0.6), fy = 296 - 150 * K.p(t, 15.6, 0.6);
    K.chip('feature', fx, fy - 8, { size: 18, mono: true, stroke: P.warm, color: P.warm, a: fa });
    var onF = K.p(t, 13.2, 0.4);
    K.chip('HEAD', mx + 110, 444, { size: 18, mono: true, stroke: P.blue, color: P.blue, a: K.p(t, 7.4) * (1 - onF) });
    K.chip('HEAD', fx + 120, fy - 8, { size: 18, mono: true, stroke: P.blue, color: P.blue, a: onF });
    /* terminal */
    K.panel(640, 84, 600, 420, 'Terminal', { a: K.p(t, 6.8) });
    function line(s, y, st, col, mono) {
      if (col) K.text(s, 664, y, { size: 17, mono: true, color: col, a: K.p(t, st) });
      else K.code([s], 664, y - 10, { size: 17, n: K.typed(t, [s], [st], 26), t: t, a: K.p(t, st - 0.1, 0.2) });
    }
    line('$ git commit -m "fix typo"', 134, 7.2);
    line('[main d4e] fix typo', 164, 8.6, P.muted);
    line('$ git switch -c feature', 204, 12.8);
    line("Switched to a new branch 'feature'", 234, 13.8, P.muted);
    line('$ git commit -m "login"', 274, 14.6);
    line('[feature c3d] login', 304, 15.8, P.muted);
    line('$ git reflog', 344, 18.8);
    line('c3d HEAD@{0}: commit: login', 374, 19.6, P.ink);
    line('b2c HEAD@{1}: checkout: to feature', 404, 20, P.muted);
    line('d4e HEAD@{2}: commit: fix typo', 434, 20.4, P.muted);
    K.box(652, 360, 300, 28, { fill: false, stroke: P.green, r: 6, a: K.p(t, 21) });
    K.text('lost a commit? git reset --hard c3d brings it back', 60, 540, { size: 18, color: P.green, a: K.p(t, 21.4) });
  } },

/* 3 ─ merge vs rebase */
{ d: 25, title: 'Merge, rebase, revert',
  caps: [
    [0.3, 'Merge combines diverged work with a new commit that has two parents. It compares both tips with their merge-base, the common ancestor.'],
    [8, 'Rebase replays your commits on top of the other branch instead. History becomes a straight line, but the commits are new.'],
    [15, 'So never rebase a branch others have already pulled. Rewriting shared history breaks their copies.'],
    [20, 'To undo a change that is already shared, use git revert: it adds a new commit that reverses it.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    function c(x, y, l, col, a, dash) {
      if (a <= 0) return;
      g.save(); g.globalAlpha *= K.clamp(a); g.fillStyle = P.card; g.strokeStyle = col; g.lineWidth = 3; if (dash) g.setLineDash([6, 5]);
      g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(l, x, y + 1, { size: 19, weight: 800, align: 'center', a: a });
    }
    /* merge */
    var la = K.p(t, 0.4);
    K.text('git merge feature', 60, 100, { size: 19, mono: true, weight: 700, color: P.acc, a: la });
    c(90, 260, 'A', P.acc, K.p(t, 0.8)); c(200, 260, 'B', P.acc, K.p(t, 1));
    c(330, 260, 'D', P.acc, K.p(t, 1.4)); c(330, 160, 'C', P.warm, K.p(t, 1.8));
    K.arrow(178, 260, 114, 260, { p: K.p(t, 1), color: P.muted, lw: 2 });
    K.arrow(308, 260, 224, 260, { p: K.p(t, 1.4), color: P.muted, lw: 2 });
    K.arrow(312, 172, 218, 246, { p: K.p(t, 1.8), color: P.muted, lw: 2 });
    c(480, 260, 'M', P.green, K.p(t, 3.4));
    K.arrow(458, 260, 354, 260, { p: K.p(t, 3.6), color: P.green, lw: 2 });
    K.arrow(462, 246, 352, 170, { p: K.p(t, 3.8), color: P.green, lw: 2 });
    K.text('2 parents', 480, 302, { size: 16, color: P.green, align: 'center', a: K.p(t, 4.2) });
    g.save(); g.globalAlpha *= K.p(t, 5.4); g.strokeStyle = P.warm; g.lineWidth = 3; g.setLineDash([5, 5]); g.beginPath(); g.arc(200, 260, 32, 0, 7); g.stroke(); g.restore();
    K.text('merge-base', 200, 314, { size: 17, color: P.warm, align: 'center', a: K.p(t, 5.4) });
    K.box(639, 90, 2, 260, { fill: P.line, a: K.p(t, 8) });
    /* rebase */
    var ra = K.p(t, 8.2);
    K.text('git rebase main', 680, 100, { size: 19, mono: true, weight: 700, color: P.acc, a: ra });
    c(730, 260, 'A', P.acc, ra); c(840, 260, 'B', P.acc, ra); c(970, 260, 'D', P.acc, ra);
    K.arrow(818, 260, 754, 260, { color: P.muted, lw: 2, a: ra });
    K.arrow(948, 260, 864, 260, { color: P.muted, lw: 2, a: ra });
    var mv = K.p(t, 10, 1.2);
    c(970, 160, 'C', P.warm, ra * (1 - 0.6 * mv), mv > 0.05);
    K.text('C (old)', 1030, 160, { size: 16, color: P.muted, a: K.p(t, 11) });
    if (mv > 0) c(970 + 140 * mv, 160 + 100 * mv, "C'", P.green, mv);
    K.arrow(1088, 260, 994, 260, { p: K.p(t, 11.2), color: P.green, lw: 2 });
    K.text('same change, new commit, new hash', 1030, 314, { size: 16, color: P.green, align: 'center', a: K.p(t, 11.8) });
    /* warning */
    var w = K.p(t, 15.2);
    K.box(40, 372, 1200, 104, { fill: P.code, stroke: P.line, a: w });
    K.mark(68, 404, false, 0.8, K.p(t, 15.4));
    K.text('git push --force on a shared branch', 94, 404, { size: 19, mono: true, a: K.p(t, 15.4) });
    K.text("rewrites history under your teammates", 560, 404, { size: 18, color: P.red, a: K.p(t, 16.2) });
    K.mark(68, 446, true, 0.8, K.p(t, 17.2));
    K.text('rebase only your own, unpushed commits', 94, 446, { size: 19, a: K.p(t, 17.2) });
    /* revert */
    K.chip('feat: cart', 140, 540, { size: 17, mono: true, stroke: P.acc, a: K.p(t, 20.4) });
    K.arrow(212, 540, 262, 540, { p: K.p(t, 20.8), color: P.muted });
    K.chip('fix: tax rule', 350, 540, { size: 17, mono: true, stroke: P.red, a: K.p(t, 20.8) });
    K.arrow(440, 540, 490, 540, { p: K.p(t, 21.4), color: P.muted });
    K.chip('Revert "fix: tax rule"', 610, 540, { size: 17, mono: true, stroke: P.green, a: K.p(t, 21.6) });
    K.text('history kept, safe on shared branches', 750, 540, { size: 18, color: P.green, a: K.p(t, 22.4) });
  } },

/* 4 ─ conventional commits and trunk-based */
{ d: 24, title: 'Commits drive versions',
  caps: [
    [0.3, 'Conventional commits put the kind of change at the start of the message: feat for a new feature, fix for a bug fix.'],
    [6.5, 'Release tools read them to pick the next version. fix bumps the patch number, feat bumps the minor number.'],
    [12, 'A breaking change, written feat!, bumps the major version. The changelog is written for you.'],
    [17.5, 'Keep branches short-lived, merge to main daily, and hide unfinished work behind feature flags: trunk-based development.']],
  draw: function (K, t) {
    var P = K.P;
    K.panel(40, 84, 600, 260, 'git log', { a: K.p(t, 0.2) });
    [['fix:', ' handle an empty cart', P.green, 1.2], ['feat:', ' add coupon codes', P.acc, 2.6], ['feat!:', ' drop Node 18 support', P.red, 12.4]].forEach(function (r, i) {
      var y = 146 + i * 64, q = K.p(t, r[3]);
      var w = K.text(r[0], 66, y, { size: 21, mono: true, weight: 700, color: r[2], a: q });
      K.text(r[1], 66 + w, y, { size: 21, mono: true, a: q });
    });
    K.text('BREAKING CHANGE: needs Node 20+', 90, 296, { size: 17, mono: true, color: P.muted, a: K.p(t, 13.4) });
    var v = t < 7.6 ? '1.4.2' : t < 9.8 ? '1.4.3' : t < 13 ? '1.5.0' : '2.0.0';
    var va = K.p(t, 6.8);
    K.text(v, 940, 160, { size: 68, mono: true, weight: 800, align: 'center', color: t < 7.6 ? P.ink : P.acc, a: va });
    K.text('MAJOR . MINOR . PATCH', 940, 222, { size: 17, mono: true, color: P.muted, align: 'center', a: va });
    K.chip('fix → patch', 780, 290, { size: 18, stroke: P.green, a: K.p(t, 7.6) });
    K.chip('feat → minor', 940, 290, { size: 18, stroke: P.acc, a: K.p(t, 9.8) });
    K.chip('feat! → major', 1110, 290, { size: 18, stroke: P.red, a: K.p(t, 13) });
    K.chip('CHANGELOG.md generated', 940, 350, { size: 17, mono: true, stroke: P.purple, a: K.p(t, 15) });
    /* trunk-based */
    var tb = K.p(t, 17.8);
    K.text('main', 60, 500, { size: 18, mono: true, weight: 700, color: P.green, a: tb });
    K.box(120, 498, 1100 * K.p(t, 17.8, 1.2), 4, { fill: P.green, r: 2, a: tb });
    [200, 420, 640].forEach(function (x, i) {
      K.curve(x, 498, x + 60, 420, x + 120, 498, { p: K.p(t, 18.6 + i * 0.5, 0.6), color: P.warm, lw: 2.5, head: 9 });
    });
    K.text('short-lived branches: hours, not weeks', 420, 440, { size: 16, color: P.warm, a: K.p(t, 20.2) });
    K.text('feature flag:', 860, 450, { size: 17, color: P.muted, a: K.p(t, 21) });
    K.chip('newCheckout: off', 1100, 450, { size: 17, mono: true, stroke: P.purple, a: K.p(t, 21) });
    K.text('code ships dark, turned on when ready', 860, 548, { size: 17, color: P.purple, a: K.p(t, 22) });
  } },

/* 5 ─ CI */
{ d: 26, title: 'A CI pipeline',
  caps: [
    [0.3, 'Continuous integration runs the same checks on a fresh machine for every push and pull request.'],
    [6.5, 'Install exactly what the lockfile says with npm ci, then lint, type-check, test and build. Independent steps run in parallel.'],
    [13, 'Required checks plus a code review gate the merge, so main always stays green.'],
    [18.5, 'Keep the pipeline under ten minutes, quarantine flaky tests instead of rerunning them, and keep secrets in the CI secret store.']],
  draw: function (K, t) {
    var P = K.P;
    var y = ['on: [push, pull_request]', 'jobs:', '  ci:', '    runs-on: ubuntu-latest', '    steps:', '      - uses: actions/checkout@v4', '      - uses: actions/setup-node@v4',
             '        with: { node-version: 24, cache: npm }', '      - run: npm ci', '      - run: npm run lint', '      - run: npm test && npm run build'];
    var st = [], a0 = 0.5; y.forEach(function (l) { st.push(a0); a0 += l.length / 50 + 0.08; });
    K.panel(40, 84, 520, 330, '.github/workflows/ci.yml', { a: K.p(t, 0.2) });
    K.code(y, 64, 124, { size: 17, lh: 1.4, n: K.typed(t, y, st, 50), t: t, a: K.p(t, 0.2), w: 500, hi: t > 7 && t < 9 ? 8 : -1 });
    /* trigger */
    K.chip('git push / PR', 680, 280, { size: 18, mono: true, stroke: P.blue, a: K.p(t, 1.6) });
    K.arrow(760, 280, 880, 280, { p: K.p(t, 2.2), color: P.blue });
    K.box(890, 252, 350, 56, { stroke: P.line, a: K.p(t, 2.6) });
    K.text('fresh runner: same steps every time', 1065, 280, { size: 17, align: 'center', a: K.p(t, 2.6) });
    /* stages */
    function stage(x, yc, label, done, a) {
      var run = t > done - 1.2 && t < done, ok = t >= done;
      K.box(x, yc - 22, 110, 44, { stroke: ok ? P.green : run ? P.warm : P.line, fill: ok ? 'rgba(104,211,145,.12)' : P.card, a: a });
      K.text(label, x + 55, yc, { size: 17, mono: true, align: 'center', a: a });
    }
    var sa = K.p(t, 6.6);
    stage(600, 140, 'checkout', 7.6, sa);
    stage(732, 140, 'npm ci', 8.8, K.p(t, 7));
    stage(864, 92, 'lint', 10.2, K.p(t, 9));
    stage(864, 140, 'types', 10.4, K.p(t, 9.1));
    stage(864, 188, 'test', 10.8, K.p(t, 9.2));
    stage(996, 140, 'build', 11.8, K.p(t, 10.4));
    stage(1128, 140, 'artifact', 12.4, K.p(t, 11.2));
    K.arrow(712, 140, 728, 140, { p: K.p(t, 7), color: P.muted, lw: 2, head: 8 });
    [92, 140, 188].forEach(function (yy) { K.arrow(844, 140, 860, yy, { p: K.p(t, 9), color: P.muted, lw: 2, head: 8 }); K.arrow(976, yy, 992, 140, { p: K.p(t, 10.4), color: P.muted, lw: 2, head: 8 }); });
    K.arrow(1108, 140, 1124, 140, { p: K.p(t, 11.2), color: P.muted, lw: 2, head: 8 });
    K.text('in parallel', 919, 226, { size: 16, color: P.muted, align: 'center', a: K.p(t, 9.6) });
    /* PR gate */
    var pr = K.p(t, 13.2);
    K.box(600, 336, 640, 170, { stroke: P.line, a: pr });
    K.text('Pull request #42', 624, 364, { size: 19, weight: 700, a: pr });
    K.mark(636, 406, true, 0.7, K.p(t, 13.8)); K.text('ci: all checks passed', 660, 406, { size: 18, a: K.p(t, 13.8) });
    K.mark(636, 444, true, 0.7, K.p(t, 14.8)); K.text('1 approving review', 660, 444, { size: 18, a: K.p(t, 14.8) });
    var mg = K.p(t, 15.8);
    K.box(1060, 420, 150, 50, { fill: mg > 0.5 ? 'rgba(104,211,145,.2)' : P.card, stroke: mg > 0.5 ? P.green : P.line, a: pr });
    K.text('Merge', 1135, 445, { size: 19, weight: 700, align: 'center', color: mg > 0.5 ? P.green : P.muted, a: pr });
    K.text('main stays green', 624, 484, { size: 16, color: P.green, a: K.p(t, 16.4) });
    K.chip('under 10 minutes', 170, 548, { size: 17, stroke: P.acc, a: K.p(t, 18.8) });
    K.chip('quarantine flaky tests', 430, 548, { size: 17, stroke: P.warm, a: K.p(t, 19.8) });
    K.chip('secrets in the CI secret store', 760, 548, { size: 17, stroke: P.purple, a: K.p(t, 21) });
    K.chip('never in the repo', 1070, 548, { size: 17, stroke: P.red, a: K.p(t, 21.8) });
  } },

/* 6 ─ artifact and Docker */
{ d: 22, title: 'Build once, ship the same thing',
  caps: [
    [0.3, 'Build once. The artifact that passed CI, tagged with its commit SHA, is exactly what goes to staging and then production.'],
    [7, 'For Node, a multi-stage Dockerfile builds with dev dependencies, then copies only what runs into a small final image.'],
    [14, "Run as a non-root user and start node directly so it receives signals. Don't rely on the latest tag: you can't roll back to it."]],
  draw: function (K, t) {
    var P = K.P;
    K.chip('commit 3f9a2c', 120, 140, { size: 17, mono: true, stroke: P.acc, a: K.p(t, 0.6) });
    K.arrow(196, 140, 254, 140, { p: K.p(t, 1), color: P.muted });
    K.box(262, 112, 130, 56, { stroke: P.green, a: K.p(t, 1.2) }); K.text('CI build', 327, 140, { size: 18, weight: 700, align: 'center', a: K.p(t, 1.2) });
    K.arrow(398, 140, 456, 140, { p: K.p(t, 1.8), color: P.muted });
    K.chip('app:3f9a2c', 540, 140, { size: 18, mono: true, stroke: P.warm, color: P.warm, a: K.p(t, 2.2) });
    [['staging', 820, 3.2], ['production', 1110, 5]].forEach(function (e) {
      K.box(e[1] - 100, 96, 200, 88, { stroke: P.line, a: K.p(t, e[2] - 0.6) });
      K.text(e[0], e[1], 114, { size: 17, color: P.muted, align: 'center', a: K.p(t, e[2] - 0.6) });
      var m = K.p(t, e[2], 0.8);
      var sx = e[1] > 1000 ? 820 : 540, sy = e[1] > 1000 ? 154 : 140;
      if (m > 0) K.chip('app:3f9a2c', sx + (e[1] - sx) * m, sy + (154 - sy) * m, { size: 18, mono: true, stroke: P.warm, color: P.warm, a: K.clamp((m - 0.4) / 0.2) });
    });
    K.text('same bytes everywhere: what you tested is what you run', 640, 214, { size: 18, color: P.green, align: 'center', a: K.p(t, 5.8) });
    var s1 = ['FROM node:24-slim AS build', 'WORKDIR /app', 'COPY package*.json ./', 'RUN npm ci', 'COPY . .', 'RUN npm run build'];
    var s2 = ['FROM node:24-slim', 'WORKDIR /app', 'ENV NODE_ENV=production', 'COPY package*.json ./', 'RUN npm ci --omit=dev', 'COPY --from=build /app/dist ./dist', 'USER node', 'CMD ["node", "dist/server.js"]'];
    K.panel(40, 246, 580, 240, 'Dockerfile · stage 1: build', { a: K.p(t, 7.2) });
    K.code(s1, 64, 290, { size: 18, lh: 1.4, n: K.typed(t, s1, [7.4, 8.4, 8.9, 9.6, 10, 10.4], 34), t: t, a: K.p(t, 7.2) });
    K.panel(660, 246, 580, 250, 'stage 2: runtime', { a: K.p(t, 10.8), stroke: P.green });
    K.code(s2, 684, 290, { size: 18, lh: 1.4, n: K.typed(t, s2, [11, 11.4, 11.8, 12.4, 12.9, 13.4, 14.4, 14.8], 40), t: t, a: K.p(t, 10.8), w: 560,
      hi: t > 16.6 ? 7 : t > 14.6 ? 6 : -1 });
    K.text('dev dependencies and compilers stay here', 60, 512, { size: 17, color: P.muted, a: K.p(t, 10.4) });
    K.text('small image: production deps and dist only', 680, 520, { size: 17, color: P.green, a: K.p(t, 13.6) });
    K.mark(66, 562, true, 0.75, K.p(t, 15)); K.text('USER node: not root', 90, 562, { size: 17, a: K.p(t, 15) });
    K.mark(330, 562, true, 0.75, K.p(t, 16.8)); K.text('exec-form CMD: signals reach node', 354, 562, { size: 17, a: K.p(t, 16.8) });
    K.mark(720, 562, false, 0.75, K.p(t, 18.6)); K.text('app:latest only: no way back', 744, 562, { size: 17, color: P.red, a: K.p(t, 18.6) });
  } },

/* 7 ─ 12-factor config */
{ d: 24, title: 'Config from the environment',
  caps: [
    [0.3, 'Twelve-factor apps read config from environment variables, so the same image runs in every environment.'],
    [7, 'But env values are always strings. "false" is a non-empty string, so it is truthy: DEBUG=false turns debugging on.'],
    [13, 'Parse and validate every variable at startup, and fail fast with one clear list of what is wrong.'],
    [18.5, 'Keep processes stateless: sessions and files live in shared services, and logs go to stdout.']],
  draw: function (K, t) {
    var P = K.P;
    K.chip('app:3f9a2c', 140, 140, { size: 18, mono: true, stroke: P.warm, color: P.warm, a: K.p(t, 0.6) });
    K.arrow(220, 140, 290, 140, { p: K.p(t, 1.2), color: P.muted });
    K.box(300, 96, 340, 130, { stroke: P.line, fill: P.code, a: K.p(t, 1.2) });
    K.text('production env', 320, 118, { size: 16, color: P.muted, weight: 700, a: K.p(t, 1.2) });
    K.text('PORT=8080', 320, 152, { size: 18, mono: true, a: K.p(t, 1.8) });
    K.text('DEBUG=false', 320, 182, { size: 18, mono: true, color: t > 8 && t < 13 ? P.red : P.ink, a: K.p(t, 2.4) });
    K.text('DATABASE_URL=', 320, 212, { size: 18, mono: true, color: t > 14.4 ? P.red : P.ink, a: K.p(t, 3) });
    K.text('staging gets the same image, different values', 140, 252, { size: 16, color: P.muted, a: K.p(t, 4) });
    var bad = ['if (process.env.DEBUG) enableDebug();', '// "false" is a non-empty string: truthy'];
    K.panel(680, 84, 560, 120, 'bad.js', { a: K.p(t, 7.2), stroke: P.red });
    K.code(bad, 704, 126, { size: 18, lh: 1.45, n: K.typed(t, bad, [7.4, 8.8], 40), t: t, a: K.p(t, 7.2) });
    K.text('Boolean("false")  →  true', 704, 236, { size: 19, mono: true, color: P.red, a: K.p(t, 10) });
    var cfg = ['function loadConfig(env) {', '  const errors = [];', '  const port = Number(env.PORT ?? 3000);', '  if (!Number.isInteger(port)) errors.push("PORT");',
               '  if (!env.DATABASE_URL) errors.push("DATABASE_URL");', '  if (errors.length) throw new ConfigError(errors);', '  return { port, debug: env.DEBUG === "true" };', '}'];
    K.panel(40, 276, 620, 236, 'config.js', { a: K.p(t, 13.2), stroke: P.green });
    K.code(cfg, 64, 316, { size: 17, lh: 1.4, n: K.typed(t, cfg, [13.4, 13.9, 14.3, 15, 15.7, 16.4, 17.1, 17.8], 60), t: t, a: K.p(t, 13.2), w: 600 });
    K.panel(700, 276, 540, 150, 'Terminal', { a: K.p(t, 15) });
    K.code(['$ node server.js'], 724, 306, { size: 18, n: K.typed(t, ['$ node server.js'], [15.2], 26), t: t, a: K.p(t, 15) });
    K.text('Invalid config: DATABASE_URL', 724, 362, { size: 18, mono: true, color: P.red, a: K.p(t, 16.4) });
    K.text('exit code 1, before serving traffic', 724, 396, { size: 17, color: P.warm, a: K.p(t, 17) });
    /* stateless */
    ['replica 1', 'replica 2', 'replica 3'].forEach(function (r, i) { K.chip(r, 110 + i * 130, 554, { size: 16, mono: true, stroke: P.blue, a: K.p(t, 18.8 + i * 0.2) }); });
    K.arrow(436, 554, 492, 554, { p: K.p(t, 19.6), color: P.muted });
    K.chip('database · cache · object storage', 700, 554, { size: 17, stroke: P.acc, a: K.p(t, 19.8) });
    K.chip('logs → stdout', 1080, 554, { size: 17, mono: true, stroke: P.green, a: K.p(t, 21) });
  } },

/* 8 ─ graceful shutdown */
{ d: 24, title: 'Graceful shutdown',
  caps: [
    [0.3, 'Orchestrators stop a container by sending SIGTERM, then SIGKILL after a grace period, often thirty seconds.'],
    [6.5, 'On SIGTERM, fail the readiness check and stop accepting new connections, so the load balancer sends traffic elsewhere.'],
    [13, 'Let in-flight requests finish, with a timeout. Then close the database pool, flush logs and exit.'],
    [19, 'Readiness decides whether a pod gets traffic. Liveness decides whether it gets restarted. Keep them separate.']],
  draw: function (K, t) {
    var P = K.P;
    var tl = K.p(t, 0.6);
    K.box(100, 140, 1000, 6, { fill: P.line, r: 3, a: tl });
    K.box(100, 140, 1000 * K.clamp((t - 1) / 3), 6, { fill: P.warm, r: 3, a: tl * (1 - K.p(t, 15.6)) });
    K.box(100, 140, 540, 6, { fill: P.green, r: 3, a: K.p(t, 15.6) });
    K.chip('SIGTERM', 100, 104, { size: 18, mono: true, stroke: P.warm, color: P.warm, a: K.p(t, 0.8) });
    K.text('grace period, e.g. 30 s', 600, 174, { size: 17, color: P.muted, align: 'center', a: K.p(t, 2) });
    K.chip('SIGKILL', 1150, 104, { size: 18, mono: true, stroke: P.red, color: P.red, a: K.p(t, 3.4) });
    K.chip('exit 0', 640, 104, { size: 18, mono: true, stroke: P.green, color: P.green, a: K.p(t, 16) });
    var code = ['process.on("SIGTERM", () => {', '  ready = false;   // readiness probe fails', '  server.close(async () => {', '    await pool.end();', '    process.exit(0);', '  });',
                '  setTimeout(() => process.exit(1), 25_000).unref();', '});'];
    K.panel(40, 214, 640, 262, 'shutdown.js', { a: K.p(t, 6.6) });
    K.code(code, 64, 256, { size: 18, lh: 1.42, n: K.typed(t, code, [6.8, 8, 9.4, 13.4, 14.2, 14.9, 15.2, 16.8], 40), t: t, a: K.p(t, 6.6), w: 620,
      hi: t > 15.2 && t < 17 ? 6 : t > 13.2 && t < 15.2 ? 3 : t > 9.4 && t < 13 ? 2 : t > 8 && t < 9.4 ? 1 : -1 });
    /* routing */
    var ra = K.p(t, 1.4);
    K.box(720, 236, 140, 64, { stroke: P.blue, a: ra }); K.text('load', 790, 258, { size: 17, weight: 700, align: 'center', a: ra }); K.text('balancer', 790, 280, { size: 17, weight: 700, align: 'center', a: ra });
    var stop = K.p(t, 8.2);
    K.box(950, 214, 290, 140, { stroke: stop > 0.5 ? P.warm : P.acc, a: ra });
    K.text(stop > 0.5 ? 'pod A · draining' : 'pod A', 970, 236, { size: 17, weight: 700, color: stop > 0.5 ? P.warm : P.ink, a: ra });
    for (var i = 0; i < 3; i++) {
      var f = t < 13 ? 0.25 + 0.2 * i : K.clamp(0.25 + 0.2 * i + (t - 13) / 2.4), y = 266 + i * 28;
      if (t > 13 + (0.75 - 0.2 * i) * 2.4 + 0.8) continue;
      K.box(970, y, 250, 16, { fill: P.code, r: 4, a: ra });
      K.box(970, y, 250 * f, 16, { fill: f >= 1 ? P.green : P.acc, r: 4, a: ra });
    }
    K.text('in-flight requests done', 1095, 300, { size: 16, color: P.green, align: 'center', a: K.p(t, 16.4) });
    K.box(950, 380, 290, 70, { stroke: P.acc, a: K.p(t, 6.8) }); K.text('pod B', 970, 415, { size: 17, weight: 700, a: K.p(t, 6.8) });
    K.arrow(864, 262, 944, 262, { color: P.acc, a: ra * (1 - stop) });
    K.arrow(864, 290, 944, 410, { p: K.p(t, 9.6), color: P.green });
    K.mark(904, 230, false, 0.6, K.p(t, 9));
    K.text('new requests → pod B', 720, 430, { size: 16, color: P.green, a: K.p(t, 10.4) });
    K.chip('readiness: send me traffic?', 300, 548, { size: 18, stroke: P.blue, a: K.p(t, 19.4) });
    K.chip('liveness: restart me?', 640, 548, { size: 18, stroke: P.purple, a: K.p(t, 20.6) });
    K.text('a slow dependency should fail readiness, not liveness', 800, 548, { size: 16, color: P.muted, a: K.p(t, 21.6) });
  } },

/* 9 ─ hosting and rollout */
{ d: 28, title: 'Where code runs',
  caps: [
    [0.3, 'Choose hosting by traffic shape and limits. Static files on a CDN suit single-page apps, static sites and docs.'],
    [6.5, 'Containers, on Kubernetes or Cloud Run for example, suit long-running servers and websockets.'],
    [11.5, 'Serverless functions scale to zero and absorb spikes, but have cold starts, time limits and no local state.'],
    [16.5, 'Edge runtimes run close to users with very low latency, but offer only a restricted set of APIs.'],
    [21, 'Roll out safely with blue-green or canary releases, and change databases in expand, migrate, contract steps.']],
  draw: function (K, t) {
    var P = K.P;
    var C = [['Static + CDN', 'SPAs, static sites, docs', 'no server code at all', P.acc, 0.8, 'S3 + CloudFront, Pages'],
             ['Containers', 'long-running APIs, websockets', 'you size and scale them', P.blue, 6.8, 'Cloud Run, ECS, Kubernetes'],
             ['Serverless', 'spiky traffic, scale to zero', 'cold starts, time limits', P.purple, 11.8, 'AWS Lambda, Vercel Functions'],
             ['Edge', 'lowest latency, near users', 'restricted runtime APIs', P.warm, 16.8, 'Cloudflare Workers, Deno']];
    C.forEach(function (c, i) {
      var x = 40 + i * 307, q = K.back((t - c[4]) / 0.5); if (q <= 0) return;
      var a = K.clamp(q * 1.5);
      K.box(x, 90, 280, 220, { stroke: c[3], a: a });
      K.text(c[0], x + 20, 124, { size: 22, weight: 800, color: c[3], a: a });
      K.mark(x + 30, 190, true, 0.7, K.p(t, c[4] + 0.8)); K.text(c[1], x + 52, 190, { size: 16, a: K.p(t, c[4] + 0.8) });
      K.mark(x + 30, 236, false, 0.7, K.p(t, c[4] + 1.6)); K.text(c[2], x + 52, 236, { size: 16, a: K.p(t, c[4] + 1.6) });
      K.text('e.g. ' + c[5], x + 20, 284, { size: 16, color: P.muted, a: K.p(t, c[4] + 2.2) });
    });
    /* canary */
    var cn = K.p(t, 21.2), share = t < 22.4 ? 0.05 : t < 24 ? 0.05 + 0.2 * K.p(t, 22.4, 1) : 0.25 + 0.75 * K.p(t, 24.2, 1.2);
    K.text('canary', 60, 380, { size: 18, weight: 700, color: P.green, a: cn });
    K.box(160, 364, 1080, 32, { fill: P.card, stroke: P.line, r: 8, a: cn });
    K.box(160, 364, 1080 * share, 32, { fill: 'rgba(104,211,145,.35)', r: 8, a: cn });
    K.text('v2 ' + Math.round(share * 100) + '%', 176, 380, { size: 17, mono: true, a: cn });
    K.text('watch errors and latency, then widen', 1220, 420, { size: 16, color: P.muted, align: 'right', a: K.p(t, 22.6) });
    K.chip('blue-green: switch all traffic, switch back fast', 330, 450, { size: 17, stroke: P.blue, a: K.p(t, 22) });
    [['expand', 'add the new column', 23], ['migrate', 'backfill, dual-write', 23.8], ['contract', 'drop the old column', 24.6]].forEach(function (s, i) {
      var x = 200 + i * 400;
      K.chip(s[0], x, 520, { size: 18, mono: true, stroke: P.acc, a: K.p(t, s[2]) });
      K.text(s[1], x, 562, { size: 16, color: P.muted, align: 'center', a: K.p(t, s[2] + 0.3) });
      if (i < 2) K.arrow(x + 70, 520, x + 320, 520, { p: K.p(t, s[2] + 0.4), color: P.muted });
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 53 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 100, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Commits form a graph; branches and HEAD are pointers',
     'Merge keeps history; rebase only your own commits; revert shared ones',
     'Conventional commits drive semantic versions',
     'CI: npm ci, lint, types, test, build, on every push',
     'Build one artifact, tag it by SHA, run as non-root',
     'Validate env config at startup; drain on SIGTERM'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 53 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
