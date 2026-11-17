/* Rendering: syntax highlighting, the ▶ Run console, diagram helpers, topic and week views.
   Exposes window.JSC.{esc, hl, run, renderWeek} and the global diagram helpers flow() and lanes(),
   which the content/weekN.js files call while they load. */
(function (J) {
  'use strict';

  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  /* ---------- syntax highlighting ---------- */
  var RE = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|typeof|instanceof|in|of|async|await|try|catch|finally|throw|import|export|from|default|yield|static|null|undefined|true|false|void|delete)\b|\b(\d[\d_]*(?:\.\d+)?n?)\b/gm;
  function hl(code) {
    return esc(code).replace(RE, function (m, a, b, s, k) {
      return (a || b) ? '<span class="c">' + m + '</span>' : s ? '<span class="s">' + m + '</span>' : k ? '<span class="k">' + m + '</span>' : '<span class="n">' + m + '</span>';
    });
  }

  /* ---------- diagram helpers (global: used by content files) ---------- */
  window.flow = function (items, o) {
    o = o || {};
    return '<div class="flow' + (o.v ? ' v' : '') + '">' + items.map(function (x, i) {
      var c = '', t = x, sm = '';
      if (Array.isArray(x)) { t = x[0]; sm = x[1] || ''; c = x[2] || ''; }
      return (i && !o.plain ? '<span class="ar">→</span>' : '') + '<div class="fb ' + c + '">' + t + (sm ? '<small>' + sm + '</small>' : '') + '</div>';
    }).join('') + '</div>';
  };
  window.lanes = function (cols) {
    return '<div class="lane">' + cols.map(function (c) {
      return '<div><h6>' + c[0] + '</h6>' + c[1].map(function (i) { return '<div class="it">' + i + '</div>'; }).join('') + '</div>';
    }).join('') + '</div>';
  };

  /* ---------- ▶ Run: a tiny console that prints like Node/DevTools ---------- */
  function ins(v, d, seen) {
    d = d || 0; seen = seen || [];
    if (typeof v === 'string') return d ? JSON.stringify(v) : v;
    if (typeof v === 'bigint') return v + 'n';
    if (typeof v === 'symbol') return v.toString();
    if (typeof v === 'function') return '[Function' + (v.name ? ': ' + v.name : '') + ']';
    if (Object.is(v, -0)) return '-0';
    if (v === null || typeof v !== 'object') return String(v);
    if (seen.indexOf(v) > -1) return '[Circular]';
    if (d > 3) return Array.isArray(v) ? '[…]' : '{…}';
    seen = seen.concat([v]);
    if (Array.isArray(v)) {
      var s = [], h = 0, e = function () { if (h) { s.push('<' + h + ' empty item' + (h > 1 ? 's' : '') + '>'); h = 0; } };
      for (var i = 0; i < v.length; i++) { if (!(i in v)) { h++; continue; } e(); s.push(ins(v[i], d + 1, seen)); }
      e(); return '[' + s.join(', ') + ']';
    }
    if (v instanceof Map) return 'Map(' + v.size + ') {' + Array.from(v).map(function (p) { return ins(p[0], d + 1, seen) + ' => ' + ins(p[1], d + 1, seen); }).join(', ') + '}';
    if (v instanceof Set) return 'Set(' + v.size + ') {' + Array.from(v).map(function (x) { return ins(x, d + 1, seen); }).join(', ') + '}';
    if (v instanceof Error) return v.name + ': ' + v.message;
    if (v instanceof Date) return isNaN(v) ? 'Invalid Date' : v.toISOString();
    if (v instanceof Promise) return 'Promise {…}';
    var ks = Reflect.ownKeys(v).filter(function (k) { return Object.getOwnPropertyDescriptor(v, k).enumerable; });
    var pr = Object.getPrototypeOf(v), cn = pr === null ? '[Object: null prototype] ' : (v.constructor && v.constructor !== Object && v.constructor.name ? v.constructor.name + ' ' : '');
    return cn + '{' + (ks.length ? ' ' + ks.map(function (k) { return (typeof k === 'symbol' ? '[' + k.toString() + ']' : k) + ': ' + ins(v[k], d + 1, seen); }).join(', ') + ' ' : '') + '}';
  }
  function run(code, out) {
    var L = [];
    out.hidden = false;
    var push = function (p, a) { L.push(p + Array.prototype.map.call(a, function (x) { return ins(x); }).join(' ')); out.textContent = L.join('\n'); };
    var con = {
      log: function () { push('', arguments); }, info: function () { push('', arguments); },
      warn: function () { push('⚠ ', arguments); }, error: function () { push('✖ ', arguments); },
      table: function (x) { push('', [x]); }
    };
    out.textContent = '';
    try { var r = new Function('console', code)(con); if (r && r.then) r.catch(function (e) { push('✖ ', [e]); }); }
    catch (e) { push('✖ ', [e]); }
    setTimeout(function () { if (!L.length) out.textContent = '(no output)'; }, 400);
  }

  /* ---------- topic and week views ---------- */
  function list(a, c) { return a && a.length ? '<ul class="pts ' + c + '">' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : ''; }
  function runBar() { return '<div class="bar"><button class="run">▶ Run</button><span style="color:var(--muted)">runs in your browser</span></div><div class="out" hidden></div>'; }

  function topic(t) {
    var h = '<article class="topic" id="' + t.id + '"><header><h3>' + t.title + '</h3><div class="lvls">Useful for:' +
      (t.lv || ['fresher', 'mid', 'senior']).map(function (l) { return '<b>' + l + '</b>'; }).join('') + '</div></header>';
    h += '<div class="tabs ui" role="tablist"><button class="t-eli" role="tab" aria-selected="false">Explain like I’m 5</button><button class="t-tech" role="tab" aria-selected="true">Technical explanation</button></div>';
    h += '<div class="pane p-eli" role="tabpanel" hidden>' + t.eli5 + '</div>';
    h += '<div class="pane p-tech" role="tabpanel">' + (t.why ? '<h5>Why it exists</h5>' + t.why + '<h5>How it works</h5>' : '') + t.tech + '</div>';
    if (t.diagram) h += '<div class="blk"><h4>Diagram</h4><div class="diagram">' + t.diagram.html + '</div>' +
      (t.diagram.steps ? '<ol class="dsteps">' + t.diagram.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' : '') + '</div>';
    if (t.ex && t.ex.length) h += '<div class="blk"><h4>Examples</h4>' + t.ex.map(function (e) {
      return '<div class="ex"><div class="et">' + e.t + '</div><pre><code>' + hl(e.code) + '</code></pre>' + (e.run === false ? '' : runBar()) + (e.note ? '<div>' + e.note + '</div>' : '') + '</div>';
    }).join('') + '</div>';
    if (t.browser) h += '<div class="blk"><h4>In the browser (and how Node differs)</h4>' + t.browser + '</div>';
    if (t.gotchas) h += '<div class="blk"><h4>Hidden concepts and edge cases</h4>' + list(t.gotchas, 'gotcha') + '</div>';
    if (t.best) h += '<div class="blk"><h4>Best practices</h4>' + list(t.best, 'best') + '</div>';
    if (t.iq) h += '<div class="blk"><h4>Interview questions</h4>' + t.iq.map(function (q) {
      return '<details class="iq"><summary><span class="badge b-' + q[0] + '">' + q[0] + '</span>' + q[1] + '</summary><div class="ans">' + q[2] + '</div></details>';
    }).join('') + '</div>';
    if (t.practice) h += '<div class="blk"><h4>Practice</h4>' + list(t.practice, '') + '</div>';
    if (t.teach) h += '<div class="teach"><b class="h">Teach it in 2 minutes</b>' + t.teach + '</div>';
    return h + '</article>';
  }

  function quiz(d) {
    return '<div class="quiz"><h3>Tricky output quiz</h3><p class="ui" style="color:var(--muted);margin:0">Predict the output first. Then open the answer, then run it.</p>' +
      d.quiz.map(function (q, i) {
        return '<div class="ex"><div class="et">Question ' + (i + 1) + '</div><pre><code>' + hl(q.code) + '</code></pre><div class="bar"><button class="run">▶ Run</button></div><div class="out" hidden></div>' +
          '<details class="iq"><summary>Show answer and why</summary><div class="ans"><p><b>' + q.ans + '</b></p><p>' + q.why + '</p></div></details></div>';
      }).join('') + '</div>';
  }

  /* Returns the HTML for one week. Navigation (pager) lives in the footer component. */
  function renderWeek(W) {
    var C = J.COURSE, meta = C[W.w - 1];
    var h = '<div class="wrap"><div class="weekhead"><div class="kicker">Week ' + W.w + ' of ' + C.length + '</div><h1>' + meta.title + '</h1><p>' + meta.sub + '</p></div>';
    W.days.forEach(function (d) {
      h += '<section class="day" id="day-' + d.n + '"><div class="dayhead"><div class="dn">Day ' + d.n + ' of ' + J.totalDays() + '</div><h2>' + d.title + '</h2><p class="goal">' + d.goal + '</p></div>';
      if (J.motion && J.motion.has(d.n)) h += J.motion.slot(d.n);
      d.topics.forEach(function (t) { h += topic(t); });
      if (d.quiz) h += quiz(d);
      h += '<div class="daydone ui"><button class="btn" data-done="' + d.n + '"></button><span style="color:var(--muted);font-size:14px">Mark the day complete when you can teach it.</span></div></section>';
    });
    if (W.revision) h += '<section class="rev" id="revision-w' + W.w + '"><h2>Week ' + W.w + ' revision sheet</h2>' + list(W.revision, '') + '</section>';
    return h + '</div>';
  }

  J.esc = esc; J.hl = hl; J.run = run; J.renderWeek = renderWeek;
})(window.JSC = window.JSC || {});
