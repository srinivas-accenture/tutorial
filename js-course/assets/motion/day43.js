/* Day 43 in motion: binary heaps, top-k and running median, tries, BFS, DFS, topological sort, union-find and Dijkstra.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day43', {
  kicker: 'JavaScript: Zero to Architect · Day 43',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 43: heaps, tries and graph algorithms, the next tier of interview patterns.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Algorithms II', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 43 · Heaps, tries and graphs', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Heaps and priority queues', 'Tries', 'Graph algorithms'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 360 + i * 280, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ binary heap */
{ d: 32, title: 'Binary heap',
  caps: [
    [0.3, 'A binary heap is a complete binary tree stored in a plain array. In a min-heap, every parent is smaller than its children.'],
    [6.5, 'The children of index i sit at 2i + 1 and 2i + 2, and its parent at (i - 1) >> 1. The root is the minimum, so peek is O(1).'],
    [13, 'push appends at the end, then sifts up: it swaps with its parent while the new value is smaller.'],
    [20, 'pop takes the root, moves the last item to the top, then sifts down, swapping with the smaller child.'],
    [27, 'Each one walks a single root-to-leaf path, about log n steps. A comparator turns it into a max-heap or any priority.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var POS = [[360, 120], [210, 215], [510, 215], [130, 310], [290, 310], [430, 310], [590, 310], [80, 400]];
    /* each step: [time, array before, moves [[from, to]] ('in' = arrives, 'out' = leaves)] */
    var A0 = [1, 3, 2, 6, 4, 9, 5];
    var ST = [[13.6, A0, [['in', 7]], [1, 3, 2, 6, 4, 9, 5, 0]],
              [15, [1, 3, 2, 6, 4, 9, 5, 0], [[7, 3], [3, 7]], [1, 3, 2, 0, 4, 9, 5, 6]],
              [16.3, [1, 3, 2, 0, 4, 9, 5, 6], [[3, 1], [1, 3]], [1, 0, 2, 3, 4, 9, 5, 6]],
              [17.6, [1, 0, 2, 3, 4, 9, 5, 6], [[1, 0], [0, 1]], [0, 1, 2, 3, 4, 9, 5, 6]],
              [20.6, [0, 1, 2, 3, 4, 9, 5, 6], [[0, 'out']], [null, 1, 2, 3, 4, 9, 5, 6]],
              [21.8, [null, 1, 2, 3, 4, 9, 5, 6], [[7, 0]], [6, 1, 2, 3, 4, 9, 5]],
              [23.2, [6, 1, 2, 3, 4, 9, 5], [[0, 1], [1, 0]], [1, 6, 2, 3, 4, 9, 5]],
              [24.6, [1, 6, 2, 3, 4, 9, 5], [[1, 3], [3, 1]], [1, 3, 2, 6, 4, 9, 5]]];
    var cur = A0, mv = null, u = 0, i, k;
    for (i = 0; i < ST.length; i++) {
      if (t >= ST[i][0] + 0.7) cur = ST[i][3];
      else if (t >= ST[i][0]) { cur = ST[i][1]; mv = ST[i][2]; u = K.ease((t - ST[i][0]) / 0.7); break; }
      else break;
    }
    function pos(idx) { return idx === 'in' ? [720, 400] : idx === 'out' ? [720, 120] : POS[idx]; }
    var tr = K.p(t, 0.5);
    for (i = 1; i < 8; i++) {
      if (i >= cur.length && !(mv && mv.some(function (m) { return m[1] === i; }))) continue;
      var p = POS[(i - 1) >> 1];
      K.arrow(p[0], p[1] + 26, POS[i][0], POS[i][1] - 26, { color: P.line, lw: 2, head: 1, a: tr });
    }
    for (i = 0; i < cur.length; i++) {
      if (cur[i] == null) continue;
      var from = pos(i), to = from, sc = 1;
      if (mv) for (k = 0; k < mv.length; k++) if (mv[k][0] === i) to = pos(mv[k][1]);
      var moving = to !== from, side = moving && typeof mv[0][1] === 'number' && to[1] < from[1] ? -1 : 1;
      var x = from[0] + (to[0] - from[0]) * u + (moving ? side * 34 * Math.sin(Math.PI * u) : 0), y = from[1] + (to[1] - from[1]) * u;
      var na = K.p(t, 0.6 + i * 0.25, 0.4);
      g.save(); g.globalAlpha *= na; g.fillStyle = P.card; g.strokeStyle = moving ? P.warm : i === 0 ? P.green : P.acc; g.lineWidth = 3;
      g.beginPath(); g.arc(x, y, 25 * sc, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(String(cur[i]), x, y + 1, { size: 22, mono: true, weight: 700, align: 'center', a: na });
    }
    if (mv && mv[0][0] === 'in') { var q = K.back(u); g.save(); g.globalAlpha *= K.clamp(q); g.fillStyle = P.card; g.strokeStyle = P.warm; g.lineWidth = 3;
      var ip = [720 + (80 - 720) * u, 400]; g.beginPath(); g.arc(ip[0], ip[1], 25, 0, 7); g.fill(); g.stroke(); g.restore(); K.text('0', ip[0], ip[1] + 1, { size: 22, mono: true, weight: 700, align: 'center', a: K.clamp(q) }); }
    /* the array view */
    var arr = cur, aa = K.p(t, 2.4);
    K.text('index', 60, 470, { size: 16, color: P.muted, a: aa });
    for (i = 0; i < 8; i++) {
      var bx = 120 + i * 66, has = i < arr.length && arr[i] != null;
      K.box(bx, 490, 60, 54, { stroke: (t > 7.4 && t < 13 && (i === 1 || i === 3 || i === 4)) ? P.warm : P.line, fill: P.code, a: aa * (has || i < 7 ? 1 : 0.3) });
      K.text(String(i), bx + 30, 470, { size: 16, mono: true, color: P.muted, align: 'center', a: aa });
      if (has) K.text(String(arr[i]), bx + 30, 518, { size: 22, mono: true, align: 'center', a: aa });
    }
    var f = K.win(t, 7, 13);
    K.box(760, 110, 480, 190, { fill: P.code, stroke: P.line, a: f });
    K.code(['left(i)   = 2 * i + 1', 'right(i)  = 2 * i + 2', 'parent(i) = (i - 1) >> 1'], 784, 132, { size: 21, a: f });
    K.text('i = 1  →  children 3 and 4', 784, 270, { size: 19, color: P.warm, a: K.p(t, 8.4) * f });
    K.chip('peek() = root = O(1)', 1000, 360, { mono: true, size: 19, stroke: P.green, a: K.win(t, 10.5, 13) });
    var pu = K.p(t, 13.2);
    K.chip('push(0)', 860, 150, { mono: true, size: 22, stroke: P.warm, a: pu * (1 - K.p(t, 20, 0.4)) });
    K.text('append → sift up', 960, 150, { size: 19, color: P.muted, a: pu * (1 - K.p(t, 20, 0.4)) });
    K.text('swaps: ' + (t > 17.6 ? 3 : t > 16.3 ? 2 : t > 15 ? 1 : 0), 860, 210, { size: 20, mono: true, color: P.warm, a: K.win(t, 14.6, 20) });
    var po = K.p(t, 20.2);
    K.chip('pop()', 860, 150, { mono: true, size: 22, stroke: P.warm, a: po });
    K.text('→ 0, last to root → sift down', 920, 150, { size: 19, color: P.muted, a: po });
    if (t > 20.6) K.chip('0', 720, 220, { mono: true, size: 22, stroke: P.green, color: P.green, a: K.p(t, 21, 0.4) * (1 - K.p(t, 27, 0.5)) });
    var c = K.p(t, 27.2);
    K.box(760, 260, 480, 130, { stroke: P.acc, a: c });
    K.text('push O(log n) · pop O(log n)', 784, 296, { size: 21, mono: true, a: c });
    K.text('peek O(1) · build from n items O(n)', 784, 346, { size: 19, mono: true, color: P.muted, a: K.p(t, 27.8) });
    K.code(['new MinHeap((a, b) => b - a)   // max-heap'], 760, 420, { size: 19, a: K.p(t, 29) });
    K.text('height ≈ log₂ n', 30, 364, { size: 17, color: P.acc, a: K.p(t, 27.4) });
  } },

/* 3 ─ heap uses */
{ d: 25, title: 'Top-k and running median',
  caps: [
    [0.3, 'Heaps power schedulers, Dijkstra and top-k. For the k largest numbers in a stream, keep a min-heap of size k.'],
    [7, 'Push each number. When the heap grows past k, pop the smallest. What remains are the k largest, in O(n log k).'],
    [14, 'A running median uses two heaps: a max-heap for the lower half and a min-heap for the upper half.'],
    [20, 'Keep them balanced within one item. The median is the top of the bigger heap, or the average of the two tops.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('top-3 of a stream', 60, 110, { size: 20, weight: 700, color: P.acc, a: K.p(t, 0.4) });
    var S = [3, 1, 5, 12, 2, 11], st = [[3], [1, 3], [1, 3, 5], [3, 5, 12], [3, 5, 12], [5, 11, 12]], dropped = [null, null, null, 1, 2, 3];
    var step = -1, i;
    for (i = 0; i < 6; i++) if (t > 7.4 + i * 1.1) step = i;
    S.forEach(function (n, i) {
      var used = i <= step;
      K.chip(String(n), 100 + i * 70, 170, { mono: true, size: 22, stroke: used ? P.line : P.blue, color: used ? P.muted : P.ink, a: K.p(t, 1 + i * 0.25, 0.4) * (used ? 0.5 : 1) });
    });
    K.box(560, 130, 300, 90, { fill: P.code, stroke: P.acc, a: K.p(t, 3) });
    K.text('min-heap, size ≤ 3', 710, 116, { size: 16, color: P.muted, align: 'center', a: K.p(t, 3) });
    if (step >= 0) st[step].forEach(function (v, k) { K.chip(String(v), 610 + k * 100, 175, { mono: true, size: 22, stroke: k === 0 ? P.green : P.acc }); });
    K.text('root = smallest kept', 610, 240, { size: 16, color: P.green, a: K.p(t, 5) });
    var dl = [];
    for (i = 0; i <= step; i++) if (dropped[i] != null) dl.push(dropped[i]);
    K.text('popped:', 900, 175, { size: 18, color: P.red, a: K.p(t, 10.6) });
    dl.forEach(function (v, k) { K.chip(String(v), 990 + k * 60, 175, { mono: true, size: 20, stroke: P.red, color: P.red }); });
    K.text('result: 12, 11, 5   ·   O(n log k)', 900, 240, { size: 18, color: P.warm, a: K.p(t, 13.4) });
    /* running median */
    var M = [5, 15, 1, 3], LO = [[5], [5], [5, 1], [3, 1]], HI = [[], [15], [15], [5, 15]], MED = ['5', '10', '5', '4'];
    var ms = -1; for (i = 0; i < 4; i++) if (t > 15.4 + i * 1.6) ms = i;
    K.text('running median', 60, 310, { size: 20, weight: 700, color: P.acc, a: K.p(t, 14.2) });
    M.forEach(function (n, i) { K.chip(String(n), 100 + i * 70, 370, { mono: true, size: 22, stroke: i <= ms ? P.line : P.blue, color: i <= ms ? P.muted : P.ink, a: K.p(t, 14.4 + i * 0.2, 0.4) * (i <= ms ? 0.5 : 1) }); });
    var ha = K.p(t, 14.8);
    K.box(420, 330, 330, 120, { fill: P.code, stroke: P.purple, a: ha });
    K.text('lower half · max-heap', 585, 354, { size: 17, color: P.purple, align: 'center', a: ha });
    K.box(790, 330, 330, 120, { fill: P.code, stroke: P.blue, a: ha });
    K.text('upper half · min-heap', 955, 354, { size: 17, color: P.blue, align: 'center', a: ha });
    if (ms >= 0) {
      LO[ms].forEach(function (v, k) { K.chip(String(v), 470 + k * 80, 405, { mono: true, size: 22, stroke: k === 0 ? P.warm : P.line }); });
      HI[ms].forEach(function (v, k) { K.chip(String(v), 840 + k * 80, 405, { mono: true, size: 22, stroke: k === 0 ? P.warm : P.line }); });
    }
    var md = K.p(t, 20.4);
    K.text('tops', 770, 480, { size: 17, color: P.warm, align: 'center', a: md });
    K.box(420, 500, 700, 70, { stroke: P.warm, a: md });
    K.text('median = ' + (ms >= 0 ? MED[ms] : '') + (ms === 3 ? '   (3 + 5) / 2' : ''), 770, 535, { size: 24, mono: true, align: 'center', color: P.warm, a: md });
  } },

/* 4 ─ trie */
{ d: 25, title: 'Tries',
  caps: [
    [0.3, 'A trie is a word tree. Each node holds a map of child letters, and a flag that marks the end of a word.'],
    [6.5, 'Insert car, card, care, cat and dog. Words with a shared prefix share the same nodes.'],
    [13, 'Search walks one node per letter: O(length of the word), no matter how many words are stored.'],
    [19, 'Autocomplete walks down to the prefix, then collects every word below it. For car: car, card, care.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    /* [label, x, y, parent, isEnd, appearAt] */
    var N = [['root', 330, 110, -1, false, 0.8], ['c', 230, 200, 0, false, 7], ['a', 230, 290, 1, false, 7.3], ['r', 160, 380, 2, true, 7.6], ['d', 90, 470, 3, true, 8.4], ['e', 220, 470, 3, true, 9],
             ['t', 320, 380, 2, true, 9.6], ['d', 450, 200, 0, false, 10.2], ['o', 450, 290, 7, false, 10.5], ['g', 450, 380, 8, true, 10.8]];
    var walk = t > 13.4 && t < 19 ? [0, 1, 2] : t >= 19.2 ? [0, 1, 2, 3] : [];
    var sub = t > 20.6 ? [3, 4, 5] : [];
    N.forEach(function (n, i) {
      var q = K.back((t - n[5]) / 0.5); if (q <= 0) return;
      if (n[3] >= 0) { var p = N[n[3]]; K.arrow(p[1], p[2] + (n[3] ? 24 : 32), n[1], n[2] - 24, { color: walk.indexOf(i) >= 0 ? P.warm : P.line, lw: 2, head: 8, a: K.clamp(q) }); }
      var on = walk.indexOf(i) >= 0, col = sub.indexOf(i) >= 0;
      g.save(); g.globalAlpha *= K.clamp(q); g.fillStyle = col ? 'rgba(104,211,145,.18)' : P.card; g.strokeStyle = on ? P.warm : P.acc; g.lineWidth = on ? 3.5 : 2;
      g.beginPath(); g.arc(n[1], n[2], i ? 22 : 30, 0, 7); g.fill(); g.stroke();
      if (n[4] && t > 2.6) { g.strokeStyle = P.green; g.lineWidth = 2; g.beginPath(); g.arc(n[1], n[2], 28, 0, 7); g.stroke(); }
      g.restore();
      K.text(n[0], n[1], n[2] + 1, { size: i ? 22 : 16, mono: true, weight: 700, align: 'center', a: K.clamp(q) });
    });
    K.chip('end of word', 120, 560, { size: 16, stroke: P.green, a: K.p(t, 3) });
    var code = ['insert(w) {', '  let n = this.root;', '  for (const c of w) {', '    if (!n.kids.has(c)) n.kids.set(c, node());', '    n = n.kids.get(c);', '  }', '  n.end = true;', '}'];
    K.panel(600, 90, 640, 290, 'trie.js', { a: K.p(t, 1) });
    K.code(code, 624, 132, { size: 19, lh: 1.5, n: K.typed(t, code, [1.3, 1.8, 2.3, 2.9, 3.8, 4.4, 4.6, 5.2], 40), t: t, hi: t > 2.6 && t < 6.5 ? 6 : -1, w: 610 });
    var Q = [['has("car")', 'true', P.green, 13.6], ['has("ca")', 'false: no end flag', P.red, 15], ['startsWith("ca")', 'true', P.green, 16.4], ['suggest("car")', 'car, card, care', P.warm, 20.8]];
    Q.forEach(function (r, i) {
      var y = 420 + i * 42, q = K.p(t, r[3], 0.4);
      K.text(r[0], 620, y, { size: 20, mono: true, a: q });
      K.text('→ ' + r[1], 860, y, { size: 20, mono: true, color: r[2], a: q });
    });
    K.text('O(length of word)', 400, 560, { size: 17, color: P.warm, align: 'center', a: K.win(t, 14, 19.4) });
  } },

/* 5 ─ graphs and BFS */
{ d: 26, title: 'Graphs and BFS',
  caps: [
    [0.3, 'A graph is nodes and edges. Store it as an adjacency list: each node maps to the nodes it points to.'],
    [7, 'BFS explores in rings using a queue: A first, then B and C, then D and E, and finally F.'],
    [14, 'The first time BFS reaches a node, it got there by the fewest edges. So BFS finds shortest paths in unweighted graphs.'],
    [20.5, 'Mark nodes as visited when you enqueue them, and walk the queue with an index instead of shift(). It runs in O(V + E).']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var N = { A: [120, 330, 0], B: [290, 220, 1], C: [290, 440, 1], D: [470, 220, 2], E: [470, 440, 2], F: [640, 330, 3] };
    var E = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']];
    var ring = [7.6, 9.2, 10.8, 12.4], path = t > 15 ? ['A', 'B', 'D', 'F'] : [];
    var COL = [P.acc, P.blue, P.purple, P.warm];
    E.forEach(function (e, k) {
      var a = N[e[0]], b = N[e[1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy);
      var onP = path.indexOf(e[0]) >= 0 && path.indexOf(e[1]) === path.indexOf(e[0]) + 1;
      K.arrow(a[0] + dx / L * 30, a[1] + dy / L * 30, b[0] - dx / L * 32, b[1] - dy / L * 32, { color: onP ? P.green : P.line, lw: onP ? 4 : 2.5, head: 11, a: K.p(t, 1 + k * 0.2, 0.4) });
    });
    Object.keys(N).forEach(function (k, i) {
      var n = N[k], seen = t > ring[n[2]], q = K.p(t, 0.6 + i * 0.2, 0.4);
      if (seen) { g.save(); g.globalAlpha *= K.p(t, ring[n[2]], 0.4) * 0.35; g.fillStyle = COL[n[2]]; g.beginPath(); g.arc(n[0], n[1], 40, 0, 7); g.fill(); g.restore(); }
      g.save(); g.globalAlpha *= q; g.fillStyle = P.card; g.strokeStyle = seen ? COL[n[2]] : P.muted; g.lineWidth = 3; g.beginPath(); g.arc(n[0], n[1], 28, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(k, n[0], n[1] + 1, { size: 22, weight: 700, align: 'center', a: q });
    });
    [['ring 1', 290, 150, 9.2], ['ring 2', 470, 150, 10.8], ['ring 3', 640, 260, 12.4]].forEach(function (r) { K.text(r[0], r[1], r[2], { size: 16, color: P.muted, align: 'center', a: K.p(t, r[3]) * (1 - K.p(t, 14, 0.4)) }); });
    var code = ['const g = {', '  A: ["B", "C"],', '  B: ["D"],', '  C: ["D", "E"],', '  D: ["F"],', '  E: ["F"],', '  F: [],', '};'];
    K.panel(760, 90, 480, 300, 'graph.js', { a: K.p(t, 1.6) });
    K.code(code, 784, 130, { size: 19, lh: 1.42, n: K.typed(t, code, [2, 2.4, 2.8, 3.2, 3.6, 4, 4.4, 4.8], 40), t: t, a: K.p(t, 1.6) });
    K.text('queue', 60, 540, { size: 17, color: P.muted, a: K.p(t, 7.2) });
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(function (k, i) {
      var at = ring[N[k][2]] + (i === 2 || i === 4 ? 0.3 : 0), q = K.back((t - at) / 0.5);
      if (q > 0) K.chip(k, 140 + i * 62, 540, { s: q, size: 20, weight: 700, stroke: COL[N[k][2]] });
    });
    var ix = t > 21.4 ? Math.min(5, Math.floor((t - 21.4) / 0.7)) : -1;
    if (ix >= 0) K.arrow(140 + ix * 62, 582, 140 + ix * 62, 564, { color: P.warm, lw: 2.5, head: 9 });
    K.text('path A → B → D → F: 3 edges', 760, 430, { size: 20, color: P.green, a: K.p(t, 15.6) });
    K.code(['for (let i = 0; i < q.length; i++)', '  // not q.shift(): that is O(n)'], 760, 476, { size: 19, a: K.p(t, 21) });
    K.chip('O(V + E)', 1160, 556, { mono: true, size: 18, stroke: P.acc, a: K.p(t, 23) });
  } },

/* 6 ─ DFS and islands */
{ d: 25, title: 'DFS and flood fill',
  caps: [
    [0.3, 'DFS goes as deep as it can along one path, then backtracks. Write it with recursion, or with an explicit stack.'],
    [6.5, 'From A the order is A, B, D, F, then back up to C, and finally E.'],
    [13, 'DFS suits cycle detection, connected components and flood fill. Number of islands sinks each island it finds.'],
    [19.5, 'Always keep a visited set. Without it, a single cycle makes the walk loop forever.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var N = { A: [90, 300], B: [230, 200], C: [230, 420], D: [380, 200], E: [380, 420], F: [520, 300] };
    var E = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']];
    var ORD = ['A', 'B', 'D', 'F', 'C', 'E'], T0 = 7, dt = 1;
    E.forEach(function (e, k) {
      var a = N[e[0]], b = N[e[1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy);
      var tree = (e[0] === 'A' && e[1] === 'B' && t > T0 + 1) || (e[0] === 'B' && e[1] === 'D' && t > T0 + 2) || (e[0] === 'D' && e[1] === 'F' && t > T0 + 3) || (e[0] === 'A' && e[1] === 'C' && t > T0 + 4) || (e[0] === 'C' && e[1] === 'E' && t > T0 + 5);
      K.arrow(a[0] + dx / L * 28, a[1] + dy / L * 28, b[0] - dx / L * 30, b[1] - dy / L * 30, { color: tree ? P.warm : P.line, lw: tree ? 3.5 : 2.5, head: 10, a: K.p(t, 0.8 + k * 0.15, 0.4) });
    });
    Object.keys(N).forEach(function (k, i) {
      var n = N[k], o = ORD.indexOf(k), vis = t > T0 + o * dt, q = K.p(t, 0.5 + i * 0.15, 0.4);
      g.save(); g.globalAlpha *= q; g.fillStyle = vis ? 'rgba(246,173,85,.2)' : P.card; g.strokeStyle = vis ? P.warm : P.muted; g.lineWidth = 3; g.beginPath(); g.arc(n[0], n[1], 26, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(k, n[0], n[1] + 1, { size: 21, weight: 700, align: 'center', a: q });
      if (vis) K.text(String(o + 1), n[0] + 26, n[1] - 30, { size: 16, weight: 700, color: P.warm, a: K.p(t, T0 + o * dt, 0.3) });
    });
    K.text('back up from F to A, then C', 300, 500, { size: 17, color: P.muted, align: 'center', a: K.win(t, 10.4, 13) });
    K.text('order: A B D F C E', 300, 540, { size: 21, mono: true, color: P.warm, align: 'center', a: K.p(t, 12.2) });
    K.chip('visited = new Set()', 300, 110, { mono: true, size: 18, stroke: P.green, a: K.p(t, 2.5) });
    /* islands grid */
    var G = [[1, 1, 0, 0], [0, 1, 0, 1], [1, 0, 0, 1], [0, 0, 0, 0]], ID = [[1, 1, 0, 0], [0, 1, 0, 2], [3, 0, 0, 2], [0, 0, 0, 0]];
    var IC = [null, P.acc, P.blue, P.purple], ga = K.p(t, 13.2), sunk = [0, 15, 16.6, 18.2];
    K.text('number of islands', 900, 110, { size: 19, weight: 700, color: P.muted, align: 'center', a: ga });
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var x = 740 + c * 80, y = 140 + r * 80, id = ID[r][c], land = G[r][c] === 1, s = id && t > sunk[id];
      K.box(x, y, 72, 72, { r: 8, fill: land ? (s ? 'rgba(79,209,197,.12)' : '#3a4a2e') : '#12304a', stroke: s ? IC[id] : P.line, lw: s ? 3 : 1.5, a: ga });
      if (s) K.text(String(id), x + 36, y + 37, { size: 22, weight: 700, color: IC[id], align: 'center', a: K.p(t, sunk[id], 0.4) });
    }
    K.text('islands: ' + (t > 18.2 ? 3 : t > 16.6 ? 2 : t > 15 ? 1 : 0), 900, 490, { size: 24, mono: true, color: P.warm, align: 'center', a: K.p(t, 14.6) });
    var cy = K.p(t, 19.8);
    K.box(640, 520, 600, 64, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: cy });
    K.text('no visited set + a cycle  →  loops forever', 940, 552, { size: 19, color: P.red, align: 'center', a: cy });
  } },

/* 7 ─ topological sort */
{ d: 25, title: 'Topological sort',
  caps: [
    [0.3, 'Topological sort orders tasks so every dependency comes first, like socks before shoes. It only exists when there is no cycle.'],
    [7, 'Kahn\'s algorithm counts incoming edges. Start with the nodes that have none, output them, and decrement their neighbours.'],
    [14, 'Whenever a count drops to zero, that node joins the queue. Here the order is A, B, C, D, E, F.'],
    [20, 'If some nodes never come out, there is a cycle. That is how build tools and course schedules spot impossible orders.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var N = { A: [110, 330], B: [290, 220], C: [290, 440], D: [480, 220], E: [480, 440], F: [660, 330] };
    var E = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']];
    /* output times; an edge is removed when its source is output */
    var OUT = { A: 9.6, B: 11, C: 12.4, D: 14.6, E: 16, F: 17.4 };
    var deg = { A: 0, B: 1, C: 1, D: 2, E: 1, F: 2 };
    E.forEach(function (e) { if (t > OUT[e[0]] + 0.3) deg[e[1]]--; });
    E.forEach(function (e, k) {
      var a = N[e[0]], b = N[e[1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy), gone = t > OUT[e[0]] + 0.3;
      K.arrow(a[0] + dx / L * 30, a[1] + dy / L * 30, b[0] - dx / L * 32, b[1] - dy / L * 32, { color: P.line, lw: 2.5, head: 11, a: K.p(t, 1 + k * 0.15, 0.4) * (gone ? 0.25 : 1) });
    });
    Object.keys(N).forEach(function (k, i) {
      var n = N[k], q = K.p(t, 0.6 + i * 0.15, 0.4), done = t > OUT[k];
      g.save(); g.globalAlpha *= q * (done ? 0.45 : 1); g.fillStyle = P.card; g.strokeStyle = deg[k] === 0 ? P.green : P.muted; g.lineWidth = 3; g.beginPath(); g.arc(n[0], n[1], 28, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(k, n[0], n[1] + 1, { size: 22, weight: 700, align: 'center', a: q * (done ? 0.45 : 1) });
      var da = K.p(t, 7.6 + i * 0.2, 0.4) * (done ? 0 : 1);
      K.chip(String(deg[k]), n[0] + 34, n[1] - 30, { mono: true, size: 16, stroke: deg[k] === 0 ? P.green : P.warm, color: deg[k] === 0 ? P.green : P.warm, a: da });
    });
    K.text('in-degree', 760, 110, { size: 17, color: P.warm, a: K.p(t, 7.8) * (1 - K.p(t, 20, 0.5)) });
    K.chip('socks → shoes', 980, 110, { size: 18, stroke: P.blue, a: K.p(t, 2) });
    K.text('output', 760, 200, { size: 17, color: P.muted, a: K.p(t, 9) });
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(function (k, i) {
      var q = K.back((t - OUT[k]) / 0.5);
      if (q > 0) K.chip(k, 790 + i * 70, 250, { s: q, size: 22, weight: 700, stroke: P.green });
    });
    var c = K.p(t, 20.2);
    K.box(760, 330, 480, 200, { fill: 'rgba(252,129,129,.08)', stroke: P.red, a: c });
    K.text('X → Y → X', 1000, 370, { size: 22, mono: true, align: 'center', a: c });
    K.text('both in-degrees stay 1', 1000, 420, { size: 19, color: P.muted, align: 'center', a: K.p(t, 21) });
    K.text('output 0 of 2 → cycle → null', 1000, 470, { size: 20, mono: true, color: P.red, align: 'center', a: K.p(t, 22) });
  } },

/* 8 ─ union-find */
{ d: 24, title: 'Union-find',
  caps: [
    [0.3, 'Union-find tracks which items belong to the same group. Each item points to a parent, and a root stands for its whole set.'],
    [7, 'union(0, 1), union(1, 2) and union(3, 4) attach one root under another. Now there are two components.'],
    [13.5, 'find(0) climbs 0, 1, 2 to the root. Path compression re-points 0 closer to the root, so later finds are nearly O(1).'],
    [19.5, 'union(0, 2) finds the same root and returns false: already connected. That detects cycles, and powers Kruskal\'s algorithm.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    /* positions over time: start as 5 roots, then trees */
    var u1 = K.p(t, 7.6, 0.7), u2 = K.p(t, 9, 0.7), u3 = K.p(t, 10.4, 0.7), pc = K.p(t, 16.4, 0.7);
    function lerp(a, b, u) { return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; }
    var base = [[140, 200], [300, 200], [460, 200], [620, 200], [780, 200]];
    var P2 = [[300, 460], [300, 330], [300, 200], [620, 330], [620, 200]];
    var pos = [lerp(base[0], [300, 330], u1), lerp(base[1], [300, 200], u1), base[2], lerp(base[3], [620, 330], u3), base[4]];
    pos[0] = lerp(pos[0], P2[0], u2); pos[1] = lerp(pos[1], P2[1], u2);
    pos[0] = lerp(pos[0], [170, 330], pc);
    var par = [t > 7.6 ? 1 : 0, t > 9 ? 2 : 1, 2, t > 10.4 ? 4 : 3, 4];
    if (t > 16.4) par[0] = 2;
    par.forEach(function (p, i) {
      if (p === i) return;
      var a = pos[i], b = pos[p];
      K.arrow(a[0], a[1] - 30, b[0], b[1] + 32, { color: i === 0 && t > 16.4 ? P.green : P.muted, lw: 2.5, head: 10 });
    });
    var climb = t > 14 && t < 16.4 ? Math.floor((t - 14) / 0.8) : -1;
    pos.forEach(function (p, i) {
      var root = par[i] === i, hl = (climb === 0 && i === 0) || (climb === 1 && i === 1) || (climb >= 2 && i === 2);
      g.save(); g.globalAlpha *= K.p(t, 0.6 + i * 0.2, 0.4); g.fillStyle = P.card; g.strokeStyle = hl ? P.warm : root ? P.green : P.acc; g.lineWidth = hl ? 4 : 3;
      g.beginPath(); g.arc(p[0], p[1], 28, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(String(i), p[0], p[1] + 1, { size: 22, mono: true, weight: 700, align: 'center', a: K.p(t, 0.6 + i * 0.2, 0.4) });
    });
    K.text('root', 460, 150, { size: 16, color: P.green, align: 'center', a: K.p(t, 2.6) });
    K.panel(880, 90, 360, 140, 'parent array', { a: K.p(t, 2) });
    par.forEach(function (p, i) {
      var x = 904 + i * 66, a = K.p(t, 2.4);
      K.text(String(i), x + 24, 140, { size: 16, mono: true, color: P.muted, align: 'center', a: a });
      K.box(x, 156, 52, 50, { fill: P.card, stroke: p === i ? P.green : P.line, a: a });
      K.text(String(p), x + 26, 182, { size: 22, mono: true, align: 'center', a: a });
    });
    [['union(0, 1)', 7.6], ['union(1, 2)', 9], ['union(3, 4)', 10.4]].forEach(function (u, i) { K.text(u[0], 900, 280 + i * 40, { size: 20, mono: true, a: K.p(t, u[1] - 0.3, 0.4) }); });
    K.text('2 components', 1100, 320, { size: 19, color: P.warm, align: 'center', a: K.p(t, 11.6) });
    K.text('find(0): 0 → 1 → 2', 900, 420, { size: 20, mono: true, color: P.warm, a: K.p(t, 14) });
    K.text('compressed: 0 → 2', 900, 456, { size: 20, mono: true, color: P.green, a: K.p(t, 16.8) });
    K.text('union by rank keeps trees shallow', 900, 492, { size: 17, color: P.muted, a: K.p(t, 17.6) });
    var r = K.p(t, 20);
    K.mark(120, 552, false, 0.8, r);
    K.text('union(0, 2) → false: same root, already connected', 146, 552, { size: 20, mono: true, a: r });
    K.chip('cycle check · Kruskal', 1060, 552, { size: 18, stroke: P.blue, a: K.p(t, 21.4) });
  } },

/* 9 ─ Dijkstra */
{ d: 25, title: 'Dijkstra',
  caps: [
    [0.3, 'When edges have weights, fewest edges is not the same as cheapest. Dijkstra finds the cheapest paths from a source.'],
    [6.5, 'Keep a min-heap of tentative distances. Pop the closest node, then relax its edges: keep any route that is shorter.'],
    [13.5, 'From A, C costs 1. Through C, B costs 1 + 2 = 3, cheaper than the direct 4. Then D costs 3 + 1 = 4.'],
    [20, 'It runs in O((V + E) log V) and needs non-negative weights. With negative edges, use Bellman-Ford.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var N = { A: [110, 330], B: [360, 180], C: [360, 480], D: [610, 330] };
    var E = [['A', 'B', 4], ['A', 'C', 1], ['C', 'B', 2], ['C', 'D', 7], ['B', 'D', 1]];
    /* timeline: pop A @8, pop C @10.5, pop B @14.5, pop D @17 */
    var dist = { A: '0', B: '∞', C: '∞', D: '∞' };
    if (t > 8.6) { dist.B = '4'; dist.C = '1'; }
    if (t > 11.2) { dist.B = '3'; dist.D = '8'; }
    if (t > 15.2) dist.D = '4';
    var done = { A: t > 8, C: t > 10.5, B: t > 14.5, D: t > 17 };
    var best = t > 17.4 ? [['A', 'C'], ['C', 'B'], ['B', 'D']] : [];
    var relax = t > 8 && t < 10.5 ? 'A' : t > 10.5 && t < 13.5 ? 'C' : t > 14.5 && t < 17 ? 'B' : '';
    E.forEach(function (e, k) {
      var a = N[e[0]], b = N[e[1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy);
      var onB = best.some(function (s) { return s[0] === e[0] && s[1] === e[1]; }), rl = relax === e[0];
      K.arrow(a[0] + dx / L * 32, a[1] + dy / L * 32, b[0] - dx / L * 34, b[1] - dy / L * 34, { color: onB ? P.green : rl ? P.warm : P.line, lw: onB || rl ? 4 : 2.5, head: 11, a: K.p(t, 1 + k * 0.2, 0.4) });
      var mx = (a[0] + b[0]) / 2 + (e[0] === 'C' && e[1] === 'B' ? 18 : 0), my = (a[1] + b[1]) / 2 - (e[0] === 'C' && e[1] === 'B' ? 0 : 16);
      K.chip(String(e[2]), mx, my, { mono: true, size: 17, stroke: P.line, color: P.warm, a: K.p(t, 1.4 + k * 0.2, 0.4) });
    });
    Object.keys(N).forEach(function (k, i) {
      var n = N[k], q = K.p(t, 0.6 + i * 0.2, 0.4);
      g.save(); g.globalAlpha *= q; g.fillStyle = done[k] ? 'rgba(104,211,145,.16)' : P.card; g.strokeStyle = done[k] ? P.green : P.muted; g.lineWidth = 3; g.beginPath(); g.arc(n[0], n[1], 30, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(k, n[0], n[1] + 1, { size: 23, weight: 700, align: 'center', a: q });
    });
    K.text('fewest edges: A → B → D costs 5', 360, 560, { size: 18, color: P.muted, align: 'center', a: K.win(t, 2, 13) });
    K.text('cheapest: A → C → B → D costs 4', 360, 560, { size: 18, color: P.green, align: 'center', a: K.p(t, 17.6) });
    K.panel(760, 90, 480, 230, 'dist', { a: K.p(t, 6.6) });
    ['A', 'B', 'C', 'D'].forEach(function (k, i) {
      var y = 140 + i * 44, a = K.p(t, 6.8 + i * 0.15, 0.4);
      K.text(k, 790, y, { size: 21, weight: 700, a: a });
      K.text(dist[k], 850, y, { size: 22, mono: true, color: done[k] ? P.green : P.warm, a: a });
      if (done[k]) K.mark(1200, y, true, 0.6, K.p(t, k === 'A' ? 8 : k === 'C' ? 10.5 : k === 'B' ? 14.5 : 17, 0.3));
    });
    K.text('8 → 4', 960, 272, { size: 18, mono: true, color: P.green, a: K.win(t, 15.2, 20) });
    K.text('4 → 3', 960, 184, { size: 18, mono: true, color: P.green, a: K.win(t, 11.2, 15) });
    K.text('min-heap', 760, 360, { size: 17, color: P.muted, a: K.p(t, 7.2) });
    var H = t < 8 ? ['0 A'] : t < 10.5 ? ['1 C', '4 B'] : t < 14.5 ? ['3 B', '4 B', '8 D'] : t < 17 ? ['4 B', '4 D', '8 D'] : ['8 D'];
    H.forEach(function (h, i) { K.chip(h, 820 + i * 100, 400, { mono: true, size: 18, stroke: i === 0 ? P.warm : P.line, a: K.p(t, 7.4, 0.4) }); });
    K.text('stale entries are skipped when popped', 760, 450, { size: 16, color: P.muted, a: K.p(t, 17.4) * (1 - K.p(t, 20, 0.4)) });
    var c = K.p(t, 20.2);
    K.box(760, 470, 480, 110, { stroke: P.acc, a: c });
    K.text('O((V + E) log V)', 784, 502, { size: 22, mono: true, a: c });
    K.text('weights ≥ 0 · negative → Bellman-Ford', 784, 548, { size: 18, color: P.warm, a: K.p(t, 21.2) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 43 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Binary heap in an array: push and pop O(log n), peek O(1)',
     'Top-k with a size-k min-heap; running median with two heaps',
     'Tries: insert, search and autocomplete in O(word length)',
     'BFS for fewest edges, DFS for components and cycles, Kahn for order',
     'Union-find for connectivity; Dijkstra for weighted shortest paths'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(190, y, true, 0.9, q);
      K.text(s, 222 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 43 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
