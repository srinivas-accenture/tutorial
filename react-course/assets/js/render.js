/* Rendering for the React course: syntax highlighting (JSX/TSX/JS/TS, CSS, HTML, shell, JSON…), diagram helpers,
   and the topic / week views. Every topic follows the same seven-step method:
     1 What it is · 2 Why it exists · 3 How it works · 4 Code · 5 Under the hood
     6 In production · 7 Interview questions
   then edge cases, best practices, a hands-on exercise and a "teach it" script.
   Exposes window.JSC.{esc, hl, renderWeek} and the global diagram helpers flow() and lanes(). */
(function (J) {
  'use strict';

  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  /* ---------- syntax highlighting ----------
     Each language is one regex; capture group N maps to CLS[N-1]. Text is HTML-escaped first
     (only & < >), so quotes and # are still literal when the regex runs. */
  var STR = '"(?:[^"\\\\\\n]|\\\\.)*"', SQ = "'[^'\\n]*'", VAR = '\\$\\{?[A-Za-z_]\\w*\\}?';
  /* JS family: comment | string (incl. template literal) | JSX tag name | keyword | number.
     Tags are matched as "&lt;Name" because the text is already escaped. */
  var JSRE = /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(&lt;\/?[A-Za-z][\w.]*)|\b(import|from|export|default|const|let|var|function|return|if|else|for|of|in|while|do|async|await|new|class|extends|implements|type|interface|enum|keyof|typeof|instanceof|as|satisfies|readonly|declare|true|false|null|undefined|void|try|catch|finally|throw|switch|case|break|continue|this|yield)\b|\b(\d+(?:\.\d+)?)\b/gm;
  var JSCLS = ['c', 's', 'f', 'k', 'n'];
  var LANGS = {
    jsx: { label: 'JSX', re: JSRE, cls: JSCLS },
    tsx: { label: 'TSX', re: JSRE, cls: JSCLS },
    js: { label: 'JavaScript', re: JSRE, cls: JSCLS },
    ts: { label: 'TypeScript', re: JSRE, cls: JSCLS },
    css: {
      label: 'CSS',
      re: /(\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'[^'\n]*')|(@[\w-]+)|([\w-]+(?=\s*:[^:\n]*;))|\b(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|ms|s|fr|deg)?)/gm,
      cls: ['c', 's', 'k', 'f', 'n']
    },
    html: {
      label: 'HTML',
      re: /(&lt;!--[\s\S]*?--&gt;)|("[^"\n]*")|(&lt;\/?[A-Za-z][\w-]*)|((?<=\s)[\w:@-]+(?==))/gm,
      cls: ['c', 's', 'f', 'k']
    },
    py: {
      label: 'Python',
      re: /(#.*$)|("""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(@[\w.]+)|\b(def|async|await|return|from|import|class|if|elif|else|for|in|while|try|except|finally|raise|with|as|None|True|False|and|or|not|is|lambda|yield|pass)\b|\b(\d+(?:\.\d+)?)\b/gm,
      cls: ['c', 's', 'f', 'k', 'n']
    },
    sh: {
      label: 'shell',
      re: new RegExp('((?:^|(?<=[ \\t]))#.*$)|(' + STR + '|' + SQ + ')|(' + VAR + ')|((?<=^|[ \\t])--?[A-Za-z][\\w-]*)|\\b(npm|npx|pnpm|yarn|node|git|docker|curl)\\b', 'gm'),
      cls: ['c', 's', 'n', 'f', 'k']
    },
    dockerfile: {
      label: 'Dockerfile',
      re: new RegExp('(^[ \\t]*#.*$)|(' + STR + ')|(' + VAR + ')|(^[ \\t]*(?:FROM|RUN|CMD|ENTRYPOINT|COPY|ADD|WORKDIR|ENV|ARG|EXPOSE|USER|LABEL|VOLUME|HEALTHCHECK|SHELL|STOPSIGNAL|ONBUILD)\\b|\\bAS\\b)|((?<=[ \\t])--?[A-Za-z][\\w-]*)', 'gm'),
      cls: ['c', 's', 'n', 'k', 'f']
    },
    yaml: {
      label: 'YAML',
      re: new RegExp('((?:^|(?<=[ \\t]))#.*$)|(' + STR + '|' + SQ + ')|(\\$\\{[^}\\n]*\\}|' + VAR + ')|(^[ \\t-]*[\\w.\\-/]+(?=:(?:[ \\t]|$)))|\\b(\\d+(?:\\.\\d+)?|true|false|null)\\b', 'gm'),
      cls: ['c', 's', 'n', 'k', 'n']
    },
    json: {
      label: 'JSON',
      re: new RegExp('(' + STR + '(?=\\s*:))|(' + STR + ')|\\b(\\d+(?:\\.\\d+)?|true|false|null)\\b', 'gm'),
      cls: ['k', 's', 'n']
    },
    text: { label: '', re: null, cls: [] }
  };
  function hl(code, lang) {
    var L = LANGS[lang] || LANGS.tsx, e = esc(code);
    if (!L.re) return e;
    return e.replace(L.re, function (m) {
      for (var i = 1; i < arguments.length - 2; i++) if (arguments[i] !== undefined) return '<span class="' + L.cls[i - 1] + '">' + m + '</span>';
      return m;
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

  /* ---------- building blocks ---------- */
  function list(a, c) { return a && a.length ? '<ul class="pts ' + c + '">' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : ''; }
  function codeBlock(code, lang) {
    var L = LANGS[lang] || LANGS.tsx;
    return '<div class="code"><div class="codebar">' + (L.label ? '<span>' + L.label + '</span>' : '<span></span>') +
      '<button class="copy" type="button" aria-label="Copy code">Copy</button></div><pre><code>' + hl(code, lang) + '</code></pre></div>';
  }
  function step(n, title, body) { return '<div class="blk"><h4><span class="sn">' + n + '</span>' + title + '</h4>' + body + '</div>'; }

  function topic(t) {
    var h = '<article class="topic" id="' + t.id + '"><header><h3>' + t.title + '</h3><div class="lvls">Useful for:' +
      (t.lv || ['fresher', 'mid', 'senior']).map(function (l) { return '<b>' + l + '</b>'; }).join('') + '</div></header>';
    /* 1. What it is: two explanations */
    h += '<div class="blk stephead"><h4><span class="sn">1</span>What it is</h4></div>';
    h += '<div class="tabs ui" role="tablist"><button class="t-eli" role="tab" aria-selected="false">Explain like I’m 5</button><button class="t-tech" role="tab" aria-selected="true">Technical explanation</button></div>';
    h += '<div class="pane p-eli" role="tabpanel" hidden>' + t.eli5 + '</div>';
    h += '<div class="pane p-tech" role="tabpanel">' + t.what + '</div>';
    if (t.why) h += step(2, 'Why it exists', t.why);
    if (t.diagram) h += step(3, 'How it works', '<div class="diagram">' + t.diagram.html + '</div>' +
      (t.diagram.steps ? '<ol class="dsteps">' + t.diagram.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' : ''));
    if (t.ex && t.ex.length) h += step(4, 'Code', t.ex.map(function (c) {
      return '<div class="ex"><div class="et">' + c.t + '</div>' + codeBlock(c.code, c.lang) +
        (c.out ? '<div class="outlbl ui">Result</div><div class="out">' + esc(c.out) + '</div>' : '') +
        (c.note ? '<div class="note">' + c.note + '</div>' : '') + '</div>';
    }).join(''));
    if (t.internals) h += step(5, 'Under the hood', t.internals);
    if (t.prod) h += step(6, 'In production', t.prod);
    if (t.iq) h += step(7, 'Interview questions', t.iq.map(function (q) {
      return '<details class="iq"><summary><span class="badge b-' + q[0] + '">' + q[0] + '</span>' + q[1] + '</summary><div class="ans">' + q[2] + '</div></details>';
    }).join(''));
    if (t.gotchas) h += '<div class="blk"><h4>Hidden concepts and edge cases</h4>' + list(t.gotchas, 'gotcha') + '</div>';
    if (t.best) h += '<div class="blk"><h4>Best practices</h4>' + list(t.best, 'best') + '</div>';
    if (t.lab) h += '<div class="blk"><h4>Hands-on exercise</h4>' + list(t.lab, 'lab') + '</div>';
    if (t.teach) h += '<div class="teach"><b class="h">Teach it in 2 minutes</b>' + t.teach + '</div>';
    return h + '</article>';
  }

  function quiz(d) {
    return '<div class="quiz"><h3>Scenario quiz</h3><p class="ui" style="color:var(--muted);margin:0">Predict what happens (or what you would change) first, then open the answer.</p>' +
      d.quiz.map(function (q, i) {
        return '<div class="ex"><div class="et">Scenario ' + (i + 1) + '</div><div class="qtext">' + q.q + '</div>' + (q.code ? codeBlock(q.code, q.lang) : '') +
          '<details class="iq"><summary>Show answer and why</summary><div class="ans"><p><b>' + q.ans + '</b></p><p>' + q.why + '</p></div></details></div>';
      }).join('') + '</div>';
  }

  /* Returns the HTML for one week. Navigation (pager) lives in the footer component. */
  function renderWeek(W) {
    var C = J.COURSE, meta = C[W.w - 1];
    var h = '<div class="wrap"><div class="weekhead"><div class="kicker">Week ' + W.w + ' of ' + C.length + '</div><h1>' + meta.title + '</h1><p>' + meta.sub + '</p></div>';
    W.days.forEach(function (d) {
      h += '<section class="day" id="day-' + d.n + '"><div class="dayhead"><div class="dn">Day ' + d.n + ' of ' + J.totalDays() + '</div><h2>' + d.title + '</h2><p class="goal">' + d.goal + '</p></div>';
      d.topics.forEach(function (t) { h += topic(t); });
      if (d.quiz) h += quiz(d);
      h += '<div class="daydone ui"><button class="btn" data-done="' + d.n + '"></button><span style="color:var(--muted);font-size:14px">Mark the day complete when you can teach it and have done the labs.</span></div></section>';
    });
    /* revision sheet: explicit W.revision, or the per-day "rev" bullets in day order */
    var rev = W.revision || [].concat.apply([], W.days.map(function (d) { return d.rev || []; }));
    if (rev.length) h += '<section class="rev" id="revision-w' + W.w + '"><h2>Week ' + W.w + ' revision sheet</h2>' + list(rev, '') + '</section>';
    return h + '</div>';
  }

  J.esc = esc; J.hl = hl; J.renderWeek = renderWeek;
})(window.JSC = window.JSC || {});
