/* Motion lessons: short animated explainers drawn on a <canvas>, with captions and a soft background pad.
   - The player is mounted into a day by render.js (slot) + app.js (mountAll) when JSC.motion.has(dayNumber).
   - Scenes for a lesson live in assets/motion/<id>.js and call JSC.motion.define(id, {...}); they are
     loaded on demand with a <script> tag (works from file://, no fetch).
   - Every frame is a pure function of time, so the same code plays in the page and records to a video file
     (JSC.motion.record(day) → Blob, via canvas.captureStream + MediaRecorder).
   Exposes window.JSC.motion = { has, slot, mountAll, define, record, frameAt }. */
(function (J) {
  'use strict';
  var W = 1280, H = 720;
  var SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  var MONO = 'Consolas,ui-monospace,Menlo,"DejaVu Sans Mono",monospace';   /* no ligature fonts: => and === must stay literal */
  var P = { bg: '#0e151d', card: '#16212d', line: '#2a3a4d', ink: '#e6edf5', muted: '#93a4b8', acc: '#4fd1c5', warm: '#f6ad55', red: '#fc8181', green: '#68d391', blue: '#63b3ed', purple: '#b794f4', code: '#0a1119' };
  /* day number → lesson. mp4 = the exported recording; leave it out until the file exists (no link is shown then). */
  var LESSONS = { 1: { id: 'day1', title: 'Day 1 in motion', len: '3½ min', mp4: 'assets/motion/js-day1.mp4' } };
  var defs = {}, waiting = {};

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function back(x) { x = clamp(x); var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }

  /* ---------- drawing kit handed to scenes ---------- */
  var TOK = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(var|let|const|if|else|function|return|typeof|new|true|false|null|undefined|class)\b|\b(\d+(?:\.\d+)?n?)\b|(<\/?[a-z]+|\/?>)/g;
  var TC = [P.muted, P.green, P.purple, P.warm, P.blue];
  function toks(L) {
    var out = [], i = 0, m; TOK.lastIndex = 0;
    while ((m = TOK.exec(L))) {
      if (!m[0].length) { TOK.lastIndex++; continue; }
      if (m.index > i) out.push([L.slice(i, m.index), P.ink]);
      for (var k = 1; k <= 5; k++) if (m[k] !== undefined) { out.push([m[0], TC[k - 1]]); break; }
      i = m.index + m[0].length;
    }
    if (i < L.length) out.push([L.slice(i), P.ink]);
    return out;
  }

  function kit(g) {
    function rr(x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
    }
    function alpha(o) { return o && o.a != null ? clamp(o.a) : 1; }
    function head(x, y, ang, hs) {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - hs * Math.cos(ang - 0.45), y - hs * Math.sin(ang - 0.45));
      g.lineTo(x - hs * Math.cos(ang + 0.45), y - hs * Math.sin(ang + 0.45)); g.closePath(); g.fill();
    }
    var K = {
      W: W, H: H, P: P, g: g, clamp: clamp, ease: ease, back: back,
      /* eased 0→1 progress of an animation that starts at a and lasts d seconds */
      p: function (t, a, d) { return ease((t - a) / (d || 0.6)); },
      /* 0→1 when t enters [a, b), back to 0 after b (with short fades) */
      win: function (t, a, b, f) { f = f || 0.4; return Math.min(clamp((t - a) / f), clamp((b - t) / f)); },
      box: function (x, y, w, h, o) {
        o = o || {}; g.save(); g.globalAlpha *= alpha(o); rr(x, y, w, h, o.r == null ? 12 : o.r);
        if (o.fill !== false) { g.fillStyle = o.fill || P.card; g.fill(); }
        if (o.stroke) { g.lineWidth = o.lw || 2; g.strokeStyle = o.stroke; if (o.dash) g.setLineDash(o.dash); g.stroke(); }
        g.restore();
      },
      text: function (s, x, y, o) {
        o = o || {}; g.save(); g.globalAlpha *= alpha(o);
        g.font = (o.weight || 400) + ' ' + (o.size || 24) + 'px ' + (o.mono ? MONO : SANS);
        g.fillStyle = o.color || P.ink; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'middle';
        g.fillText(s, x, y); var w = g.measureText(s).width; g.restore(); return w;
      },
      chip: function (s, x, y, o) {
        o = o || {}; var sz = o.size || 20, wt = o.weight || 600;
        g.save(); g.font = wt + ' ' + sz + 'px ' + (o.mono ? MONO : SANS); var w = g.measureText(s).width + sz * 1.5, h = sz * 1.9; g.restore();
        var sc = o.s == null ? 1 : Math.max(0, o.s);
        g.save(); g.translate(x, y); g.scale(sc, sc);
        K.box(-w / 2, -h / 2, w, h, { fill: o.fill || P.card, stroke: o.stroke || P.line, r: h / 2, a: o.a });
        K.text(s, 0, 1, { size: sz, weight: wt, color: o.color || P.ink, align: 'center', mono: o.mono, a: o.a });
        g.restore(); return w;
      },
      arrow: function (x1, y1, x2, y2, o) {
        o = o || {}; var p = o.p == null ? 1 : clamp(o.p); if (p <= 0) return;
        var x = x1 + (x2 - x1) * p, y = y1 + (y2 - y1) * p, ang = Math.atan2(y2 - y1, x2 - x1), hs = o.head || 13;
        g.save(); g.globalAlpha *= alpha(o); g.strokeStyle = g.fillStyle = o.color || P.muted; g.lineWidth = o.lw || 3; g.lineCap = 'round';
        if (o.dash) g.setLineDash(o.dash);
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x - Math.cos(ang) * hs * 0.7, y - Math.sin(ang) * hs * 0.7); g.stroke(); g.setLineDash([]);
        head(x, y, ang, hs); g.restore();
      },
      /* quadratic curve arrow from (x1,y1) to (x2,y2) bending through control point (cx,cy) */
      curve: function (x1, y1, cx, cy, x2, y2, o) {
        o = o || {}; var p = o.p == null ? 1 : clamp(o.p); if (p <= 0) return;
        function pt(u) { var a = 1 - u; return [a * a * x1 + 2 * a * u * cx + u * u * x2, a * a * y1 + 2 * a * u * cy + u * u * y2]; }
        g.save(); g.globalAlpha *= alpha(o); g.strokeStyle = g.fillStyle = o.color || P.muted; g.lineWidth = o.lw || 3; g.lineCap = 'round';
        if (o.dash) g.setLineDash(o.dash);
        g.beginPath(); g.moveTo(x1, y1); for (var i = 1; i <= 40; i++) { var q = pt(p * i / 40); g.lineTo(q[0], q[1]); } g.stroke(); g.setLineDash([]);
        var e = pt(p), b = pt(Math.max(0, p - 0.02)); head(e[0], e[1], Math.atan2(e[1] - b[1], e[0] - b[0]), o.head || 13);
        g.restore();
      },
      /* syntax-highlighted code. o.n = characters to reveal (newlines count 1), o.hi = highlighted line, o.t = time for the caret blink */
      code: function (lines, x, y, o) {
        o = o || {}; var s = o.size || 22, lh = Math.round(s * (o.lh || 1.6)), left = o.n == null ? 1e9 : o.n, cur = null;
        g.save(); g.globalAlpha *= alpha(o); g.font = s + 'px ' + MONO; g.textBaseline = 'top';
        lines.forEach(function (L, i) {
          var yy = y + i * lh, cx = x, mark = o.marks && o.marks[i];
          if (o.hi === i || mark) { g.save(); g.fillStyle = mark || 'rgba(79,209,197,.16)'; rr(x - 12, yy - lh * 0.2, o.w || 600, lh, 6); g.fill(); g.restore(); }
          toks(L).forEach(function (tk) {
            if (left <= 0) return; var str = tk[0].slice(0, left); left -= str.length;
            g.fillStyle = tk[1]; g.fillText(str, cx, yy); cx += g.measureText(str).width;
          });
          if (left <= 0 && !cur) cur = [cx, yy]; else left -= 1;
        });
        if (cur && o.n != null && Math.floor((o.t || 0) * 2.5) % 2 === 0) { g.fillStyle = P.acc; g.fillRect(cur[0] + 2, cur[1], 3, s * 1.15); }
        g.restore(); return lh;
      },
      /* characters revealed when line i starts typing at starts[i] (cps characters per second) */
      typed: function (t, lines, starts, cps) {
        var n = 0;
        for (var i = 0; i < lines.length; i++) {
          var k = Math.min(lines[i].length, Math.max(0, Math.floor((t - starts[i]) * (cps || 26))));
          n += k; if (k < lines[i].length || t < starts[i]) return n; n += 1;
        }
        return n;
      },
      /* a code window with a title bar */
      panel: function (x, y, w, h, title, o) {
        o = o || {}; K.box(x, y, w, h, { fill: o.fill || P.code, stroke: o.stroke || P.line, a: o.a });
        if (title) {
          [P.red, P.warm, P.green].forEach(function (c, i) { g.save(); g.globalAlpha *= alpha(o) * 0.8; g.fillStyle = c; g.beginPath(); g.arc(x + 20 + i * 18, y + 20, 5.5, 0, 7); g.fill(); g.restore(); });
          K.text(title, x + 80, y + 21, { size: 15, color: P.muted, weight: 600, a: o.a });
        }
      },
      lock: function (x, y, s, color, a) {
        s = s || 1; g.save(); g.globalAlpha *= a == null ? 1 : clamp(a); g.strokeStyle = g.fillStyle = color || P.warm; g.lineWidth = 3 * s;
        g.beginPath(); g.arc(x, y - 5 * s, 7 * s, Math.PI, 0); g.stroke(); rr(x - 11 * s, y - 5 * s, 22 * s, 17 * s, 3 * s); g.fill(); g.restore();
      },
      mark: function (x, y, ok, s, a) {
        s = s || 1; g.save(); g.globalAlpha *= a == null ? 1 : clamp(a); g.fillStyle = ok ? P.green : P.red;
        g.beginPath(); g.arc(x, y, 15 * s, 0, 7); g.fill(); g.strokeStyle = P.bg; g.lineWidth = 3.5 * s; g.lineCap = 'round'; g.beginPath();
        if (ok) { g.moveTo(x - 7 * s, y); g.lineTo(x - 2 * s, y + 6 * s); g.lineTo(x + 8 * s, y - 6 * s); }
        else { g.moveTo(x - 6 * s, y - 6 * s); g.lineTo(x + 6 * s, y + 6 * s); g.moveTo(x + 6 * s, y - 6 * s); g.lineTo(x - 6 * s, y + 6 * s); }
        g.stroke(); g.restore();
      }
    };
    return K;
  }

  /* ---------- one frame ---------- */
  function locate(def, T) {
    var a = 0;
    for (var i = 0; i < def.scenes.length; i++) { var S = def.scenes[i]; if (T < a + S.d || i === def.scenes.length - 1) return { i: i, s: S, t: Math.min(T - a, S.d), start: a }; a += S.d; }
  }
  function caption(g, K, s, a) {
    g.save(); g.font = '500 26px ' + SANS;
    var lines = [''], max = 1120;
    s.split(' ').forEach(function (w) {
      var cur = lines[lines.length - 1], tryL = cur ? cur + ' ' + w : w;
      if (cur && g.measureText(tryL).width > max) lines.push(w); else lines[lines.length - 1] = tryL;
    });
    var wmax = Math.max.apply(null, lines.map(function (l) { return g.measureText(l).width; })) + 52;
    g.restore();
    var lh = 36, h = lines.length * lh + 22, y = H - 18 - h;
    K.box((W - wmax) / 2, y, wmax, h, { fill: 'rgba(4,9,15,.88)', r: 10, a: a });
    lines.forEach(function (l, i) { K.text(l, W / 2, y + 11 + lh / 2 + i * lh, { size: 26, weight: 500, align: 'center', a: a }); });
  }
  function frame(g, def, T, K) {
    var L = locate(def, T), S = L.s, t = L.t;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    g.fillStyle = P.bg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.035)';
    for (var x = 20; x < W; x += 40) for (var y = 20; y < H; y += 40) g.fillRect(x, y, 2, 2);
    K.text(def.kicker, 40, 34, { size: 17, weight: 700, color: P.acc });
    var fade = Math.min(clamp(t / 0.45), clamp((S.d - t) / 0.45));
    if (S.title) K.text(S.title, W - 40, 34, { size: 17, color: P.muted, align: 'right', a: fade });
    g.save(); g.globalAlpha = fade; S.draw(K, t, S.d); g.restore(); g.globalAlpha = 1;
    var cap = null, ct = 0;
    (S.caps || []).forEach(function (c) { if (t >= c[0]) { cap = c[1]; ct = t - c[0]; } });
    if (cap) caption(g, K, cap, Math.min(clamp(ct / 0.35), fade));
    g.fillStyle = P.line; g.fillRect(0, H - 4, W, 4); g.fillStyle = P.acc; g.fillRect(0, H - 4, W * T / def.total, 4);
  }

  /* ---------- soft background pad (Web Audio, no files) ---------- */
  var CHORDS = [[110, 164.81, 261.63], [87.31, 130.81, 220], [130.81, 196, 329.63], [98, 146.83, 246.94]];
  function sound(actx, dest, from, def) {
    var now = actx.currentTime + 0.05, master = actx.createGain(), nodes = [], a = 0;
    master.gain.setValueAtTime(0, now); master.gain.linearRampToValueAtTime(1, now + 1.2); master.connect(dest);
    def.scenes.forEach(function (S, k) {
      var s0 = a, s1 = a + S.d; a = s1; if (s1 <= from) return;
      var t0 = now + Math.max(0, s0 - from), t1 = now + (s1 - from);
      (S.chord || CHORDS[k % CHORDS.length]).forEach(function (f, i) {
        var o = actx.createOscillator(), gn = actx.createGain();
        o.type = i ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = i % 2 ? 5 : -5;
        gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(0.02, t0 + 1.5);
        gn.gain.setValueAtTime(0.02, Math.max(t0 + 1.5, t1 - 1)); gn.gain.linearRampToValueAtTime(0, t1 + 0.8);
        o.connect(gn); gn.connect(master); o.start(t0); o.stop(t1 + 0.9); nodes.push(o);
      });
      if (s0 >= from) {   /* soft chime on each scene change */
        var c = actx.createOscillator(), cg = actx.createGain(); c.type = 'sine'; c.frequency.value = 1318.5;
        cg.gain.setValueAtTime(0, t0); cg.gain.linearRampToValueAtTime(0.025, t0 + 0.02); cg.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
        c.connect(cg); cg.connect(master); c.start(t0); c.stop(t0 + 1.5); nodes.push(c);
      }
    });
    return {
      stop: function () {
        try { master.gain.cancelScheduledValues(actx.currentTime); master.gain.setTargetAtTime(0, actx.currentTime, 0.05); } catch (e) { /* closed */ }
        setTimeout(function () { nodes.forEach(function (o) { try { o.stop(); } catch (e) { /* already stopped */ } }); master.disconnect(); }, 300);
      }
    };
  }

  /* ---------- loading scene files ---------- */
  function load(id) {
    if (defs[id]) return Promise.resolve(defs[id]);
    if (!waiting[id]) waiting[id] = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = 'assets/motion/' + id + '.js';
      s.onload = function () { defs[id] ? res(defs[id]) : rej(new Error(id + '.js did not call JSC.motion.define')); };
      s.onerror = function () { delete waiting[id]; rej(new Error('Could not load assets/motion/' + id + '.js')); };
      document.head.appendChild(s);
    });
    return waiting[id];
  }
  function define(id, def) {
    def.total = def.scenes.reduce(function (a, S) { return a + S.d; }, 0);
    defs[id] = def;
  }

  /* ---------- the player ---------- */
  function fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function slot(n) {
    var L = LESSONS[n];
    return '<div class="motion" data-day="' + n + '" tabindex="0" aria-label="' + L.title + ', animated lesson">' +
      '<div class="mv-head ui"><b>▶ Watch first: ' + L.title + '</b><span>' + L.len + ' · captions · sound optional</span></div>' +
      '<div class="mv-frame"><canvas width="' + W + '" height="' + H + '" role="img" aria-label="' + L.title + '"></canvas>' +
      '<button class="mv-big" type="button" aria-label="Play">▶</button></div>' +
      '<div class="mv-bar ui"><button class="btn mv-play" type="button">▶ Play</button>' +
      '<input class="mv-seek" type="range" min="0" max="1" step="0.1" value="0" aria-label="Seek">' +
      '<span class="mv-time">0:00</span><select class="btn mv-ch" aria-label="Chapters"></select>' +
      '<button class="btn mv-snd" type="button" aria-pressed="true">Sound on</button>' +
      (L.mp4 ? '<a class="btn mv-dl" href="' + L.mp4 + '" download>Download MP4</a>' : '') + '</div></div>';
  }
  function mount(el) {
    if (el.dataset.ready) return; el.dataset.ready = '1';
    var L = LESSONS[el.dataset.day], q = function (s) { return el.querySelector(s); };
    var cv = q('canvas'), g = cv.getContext('2d'), K = kit(g), big = q('.mv-big'), btn = q('.mv-play'), seek = q('.mv-seek'),
      time = q('.mv-time'), ch = q('.mv-ch'), sndBtn = q('.mv-snd');
    var def, T = 0, playing = false, T0 = 0, w0 = 0, raf = 0, actx = null, snd = null, soundOn = true;

    function draw() {
      frame(g, def, T, K); seek.value = T; time.textContent = fmt(T) + ' / ' + fmt(def.total);
      var i = locate(def, T).i; if (ch.selectedIndex !== i) ch.selectedIndex = i;
    }
    function startSound() {
      if (!soundOn) return;
      try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); snd = sound(actx, actx.destination, T, def); } catch (e) { /* no audio */ }
    }
    function stopSound() { if (snd) { snd.stop(); snd = null; } }
    function loop() {
      if (!cv.isConnected) { stop(); return; }
      if (!playing) return;
      T = T0 + (performance.now() - w0) / 1000;
      if (T >= def.total) { T = def.total; stop(); draw(); return; }
      draw(); raf = requestAnimationFrame(loop);
    }
    function play() { if (T >= def.total - 0.1) T = 0; playing = true; T0 = T; w0 = performance.now(); big.hidden = true; btn.textContent = '❚❚ Pause'; startSound(); loop(); }
    function stop() { playing = false; cancelAnimationFrame(raf); btn.textContent = '▶ Play'; big.hidden = false; stopSound(); }
    function toggle() { if (def) (playing ? stop : play)(); }
    function jump(t) { T = Math.max(0, Math.min(def.total, t)); if (playing) { T0 = T; w0 = performance.now(); stopSound(); startSound(); } draw(); }

    load(L.id).then(function (d) {
      def = d; seek.max = def.total;
      var a = 0; ch.innerHTML = def.scenes.map(function (S, i) { var o = '<option value="' + a + '">' + (i + 1) + '. ' + S.title + '</option>'; a += S.d; return o; }).join('');
      draw(); frame(g, def, def.poster || 3, K);   /* poster frame; the controls still read 0:00 */
    }).catch(function (e) { el.querySelector('.mv-head span').textContent = e.message; });

    big.addEventListener('click', toggle); btn.addEventListener('click', toggle); cv.addEventListener('click', toggle);
    seek.addEventListener('input', function () { jump(+seek.value); });
    ch.addEventListener('change', function () { jump(+ch.value + 0.01); });
    sndBtn.addEventListener('click', function () {
      soundOn = !soundOn; sndBtn.textContent = soundOn ? 'Sound on' : 'Sound off'; sndBtn.setAttribute('aria-pressed', soundOn);
      if (playing) { if (soundOn) startSound(); else stopSound(); }
    });
    el.addEventListener('keydown', function (e) {
      if (!def || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); jump(T + 5); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); jump(T - 5); }
    });
  }
  function mountAll(root) { Array.prototype.forEach.call((root || document).querySelectorAll('.motion'), mount); }

  /* ---------- export: record the lesson in real time to a video Blob (MP4 where the browser supports it) ---------- */
  function record(day, opt) {
    opt = opt || {}; var L = LESSONS[day];
    return load(L.id).then(function (def) {
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var g = cv.getContext('2d'), K = kit(g), fps = opt.fps || 30, stream = cv.captureStream(fps);
      var actx = new (window.AudioContext || window.webkitAudioContext)(), dest = actx.createMediaStreamDestination();
      dest.stream.getAudioTracks().forEach(function (tr) { stream.addTrack(tr); });
      var mime = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm']
        .filter(function (t) { return window.MediaRecorder && MediaRecorder.isTypeSupported(t); })[0];
      if (!mime) return Promise.reject(new Error('MediaRecorder is not available in this browser'));
      var rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: opt.bps || 6e6, audioBitsPerSecond: 128000 }), chunks = [];
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      return actx.resume().then(function () {
        return new Promise(function (res) {
          rec.onstop = function () { actx.close(); res(new Blob(chunks, { type: mime.split(';')[0] })); };
          frame(g, def, 0, K); rec.start(1000);
          var w0 = performance.now(); sound(actx, dest, 0, def);
          (function step() {
            var T = (performance.now() - w0) / 1000;
            frame(g, def, Math.min(T, def.total - 0.001), K);
            if (opt.onprogress) opt.onprogress(Math.min(1, T / def.total));
            if (T >= def.total + 0.4) return setTimeout(function () { rec.stop(); }, 150);
            setTimeout(step, 1000 / fps / 2);
          })();
        });
      });
    });
  }
  /* a still of lesson `day` at time T as a PNG data URL (used for previews and checks) */
  function frameAt(day, T) {
    return load(LESSONS[day].id).then(function (def) {
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var g = cv.getContext('2d');
      frame(g, def, T, kit(g)); return cv.toDataURL('image/png');
    });
  }

  J.motion = { has: function (n) { return !!LESSONS[n]; }, slot: slot, mountAll: mountAll, define: define, record: record, frameAt: frameAt, lessons: LESSONS };
})(window.JSC = window.JSC || {});
