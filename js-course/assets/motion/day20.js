/* Day 20 in motion: XSS and its sinks, safe APIs, encoding and sanitizing, CSP with nonces, Trusted Types,
   CSRF and SameSite cookies, tokens and cookie flags, where to keep auth, clickjacking. Loaded on demand by assets/js/motion.js. */
(function () {
  function nd(K, s, x, y, o) {
    o = o || {}; var w = o.w || 100, h = o.h || 40;
    K.box(x - w / 2, y - h / 2, w, h, { stroke: o.stroke || K.P.acc, dash: o.dash, fill: o.fill, a: o.a, lw: o.lw });
    K.text(s, x, y + 1, { size: o.size || 19, mono: !!o.mono, weight: o.weight || 600, align: 'center', color: o.color || K.P.ink, a: o.a });
  }
  /* a two-line box: title + subtitle */
  function card(K, x, y, w, h, title, sub, c, a, mono) {
    K.box(x, y, w, h, { stroke: c, a: a });
    K.text(title, x + w / 2, y + h / 2 - (sub ? 13 : 0), { size: 19, weight: 700, mono: !!mono, align: 'center', color: c, a: a });
    if (sub) K.text(sub, x + w / 2, y + h / 2 + 16, { size: 16, color: K.P.muted, align: 'center', a: a });
  }

JSC.motion.define('day20', {
  kicker: 'JavaScript: Zero to Architect · Day 20',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 20: the most common web attacks, and how to stop them from the JavaScript side.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Security', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 20 · Keeping your users safe', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['XSS', 'CSP · Trusted Types', 'CSRF · cookies'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ what XSS is */
{ d: 26, title: 'Cross-site scripting',
  caps: [
    [0.3, "Cross-site scripting, XSS: attacker-controlled data ends up running as code in your page, with your origin's powers."],
    [7, 'Stored XSS is saved on the server and served to others. Reflected XSS echoes from the URL. DOM XSS happens in your own client code.'],
    [14, 'The injected script can read page data, call your APIs as the user, and change what they see.'],
    [19.5, 'It happens when untrusted text reaches a dangerous sink: innerHTML, eval, document.write, a javascript: URL…']],
  draw: function (K, t) {
    var P = K.P;
    var B = [['attacker input', '<img onerror=steal()>', P.red, 0.6], ['your page', 'el.innerHTML = input', P.warm, 1.6], ['browser', 'parses it as HTML', P.warm, 2.6], ['runs as YOUR site', 'app.example.com', P.red, 3.6]];
    B.forEach(function (b, i) {
      var q = K.back((t - b[3]) / 0.5); if (q <= 0) return;
      var x = 40 + i * 310;
      K.g.save(); K.g.translate(x + 135, 140); K.g.scale(q, q); K.g.translate(-x - 135, -140);
      K.box(x, 90, 270, 100, { stroke: b[2], a: K.clamp(q) });
      K.text(b[0], x + 135, 122, { size: 20, weight: 700, align: 'center', color: b[2], a: K.clamp(q) });
      K.text(b[1], x + 135, 160, { size: 16, mono: true, align: 'center', a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(x - 36, 140, x - 6, 140, { p: K.p(t, b[3] - 0.2, 0.4), color: P.muted, head: 10 });
    });
    /* sources */
    [['stored', 'saved in the database, served to everyone', 7.4], ['reflected', 'echoed back from the URL or request', 9.4], ['DOM-based', 'your client JS writes it into a sink', 11.4]].forEach(function (s, i) {
      var q = K.p(t, s[2]), y = 238 + i * 52;
      K.chip(s[0], 110, y, { size: 18, stroke: P.red, color: P.red, a: q });
      K.text(s[1], 200, y, { size: 18, color: P.muted, a: q });
    });
    /* powers */
    K.box(870, 214, 370, 160, { fill: 'rgba(252,129,129,.08)', stroke: P.red, a: K.p(t, 14.2) });
    ['reads page data and tokens', 'calls your APIs as the user', 'changes what they see'].forEach(function (s, i) {
      var q = K.p(t, 14.4 + i * 0.8); K.mark(898, 250 + i * 44, false, 0.6, q); K.text(s, 920, 250 + i * 44, { size: 18, a: q });
    });
    /* sinks */
    K.text('dangerous sinks', 40, 420, { size: 19, weight: 700, color: P.red, a: K.p(t, 19.6) });
    ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'eval()', 'new Function()', 'setTimeout("code")', 'href="javascript:…"'].forEach(function (s, i) {
      var q = K.back((t - 19.9 - i * 0.3) / 0.5); if (q <= 0) return;
      K.chip(s, 150 + (i % 4) * 300, 474 + Math.floor(i / 4) * 64, { mono: true, size: 18, stroke: P.red, s: q, a: K.clamp(q) });
    });
  } },

/* 3 ─ safe APIs, encoding, sanitizing */
{ d: 26, title: 'Defense: safe sinks',
  caps: [
    [0.3, 'First defense: safe APIs. textContent treats data as text, so it can never become markup or code.'],
    [7, 'When the server builds HTML, encode output for its context: HTML text, attributes, URLs and JavaScript all differ.'],
    [13.5, 'If you truly must render user HTML, sanitize it with a maintained library like DOMPurify. Never with a regex.'],
    [19.5, 'URLs are sinks too: allow only http, https or mailto, so a javascript: link cannot run.']],
  draw: function (K, t) {
    var P = K.P, code = ['const evil = "<img src=x onerror=alert(1)>";', 'safe.textContent = evil;   // just text', 'unsafe.innerHTML = evil;   // a real <img>!'];
    K.panel(40, 84, 640, 160, 'render.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 122, { size: 19, lh: 1.6, n: K.typed(t, code, [0.5, 2, 3.6], 44), t: t, a: K.p(t, 0.2), w: 600,
      marks: t > 3.6 ? { 1: 'rgba(104,211,145,.12)', 2: 'rgba(252,129,129,.14)' } : null });
    var s1 = K.p(t, 2.8), s2 = K.p(t, 4.6);
    K.box(720, 84, 520, 70, { fill: '#f4f7fb', stroke: P.green, lw: 3, a: s1, r: 8 });
    K.text('<img src=x onerror=alert(1)>', 740, 120, { size: 18, mono: true, color: '#1a2533', a: s1 });
    K.mark(1212, 120, true, 0.7, s1);
    K.box(720, 172, 520, 72, { fill: '#f4f7fb', stroke: P.red, lw: 3, a: s2, r: 8 });
    K.box(740, 190, 36, 36, { fill: false, stroke: '#9aa5b1', a: s2, r: 3 });
    K.chip('alert(1) ran', 880, 208, { size: 17, stroke: P.red, color: P.red, fill: '#fde8e8', a: K.p(t, 5.4) });
    K.mark(1212, 208, false, 0.7, s2);
    /* encoding */
    var en = K.p(t, 7.2);
    K.text('encode for the context', 40, 282, { size: 19, weight: 700, color: P.acc, a: en });
    [['<', '&lt;'], ['>', '&gt;'], ['"', '&quot;'], ["'", '&#39;'], ['&', '&amp;']].forEach(function (e, i) {
      var q = K.p(t, 7.6 + i * 0.5), x = 40 + i * 124;
      K.box(x, 304, 112, 46, { stroke: P.acc, a: q, r: 8 });
      K.text(e[0] + ' → ' + e[1], x + 56, 328, { size: 18, mono: true, align: 'center', a: q });
    });
    K.text('HTML text · attribute · URL · JS string: each has its own rules', 40, 376, { size: 17, color: P.muted, a: K.p(t, 10.4) });
    /* sanitize */
    var sp = K.p(t, 13.7);
    K.panel(680, 268, 560, 160, 'sanitize.js', { a: sp, stroke: P.green });
    K.code(['el.innerHTML = DOMPurify.sanitize(userHtml);'], 704, 304, { size: 18, n: K.typed(t, ['el.innerHTML = DOMPurify.sanitize(userHtml);'], [13.9], 40), t: t, a: sp });
    K.text('<b>hi</b><img onerror=…>', 704, 362, { size: 17, mono: true, color: P.muted, a: K.p(t, 15.6) });
    K.text('→  <b>hi</b><img>', 704, 396, { size: 17, mono: true, color: P.green, a: K.p(t, 16.6) });
    K.chip('regex "sanitizers" get bypassed', 360, 420, { size: 16, stroke: P.red, color: P.red, a: K.p(t, 17.4) });
    /* URLs */
    var url = ['const u = new URL(input, location.href);', 'if (!["http:", "https:", "mailto:"].includes(u.protocol)) throw new Error("bad link");'];
    var up = K.p(t, 19.7);
    K.panel(40, 456, 1200, 126, 'links.js', { a: up });
    K.code(url, 64, 494, { size: 18, lh: 1.6, n: K.typed(t, url, [19.9, 21.2], 50), t: t, a: up });
  } },

/* 4 ─ Content Security Policy */
{ d: 26, title: 'Content Security Policy',
  caps: [
    [0.3, 'Content Security Policy is an HTTP response header that tells the browser which scripts may run.'],
    [6.5, 'A strict policy uses a random nonce per response. Only script tags that carry it run, so injected scripts are blocked.'],
    [13.5, "strict-dynamic lets trusted scripts load others. Avoid 'unsafe-inline' and 'unsafe-eval'; set object-src and base-uri to 'none'."],
    [20, 'Roll it out in report-only mode first, fix the violations, then enforce.']],
  draw: function (K, t) {
    var P = K.P, h = ['Content-Security-Policy:', "  script-src 'nonce-R4nd0m' 'strict-dynamic';", "  object-src 'none'; base-uri 'none';"];
    K.panel(40, 84, 760, 164, 'HTTP response header', { a: K.p(t, 0.2) });
    K.code(h, 64, 124, { size: 20, lh: 1.6, n: K.typed(t, h, [0.6, 7, 14], 40), t: t, a: K.p(t, 0.2), w: 720,
      hi: t > 7 && t < 13.5 ? 1 : t > 14 && t < 20 ? 2 : -1 });
    K.text('new random value', 990, 124, { size: 16, color: P.warm, align: 'center', a: K.p(t, 8.4) });
    K.text('on every response', 990, 148, { size: 16, color: P.warm, align: 'center', a: K.p(t, 8.4) });
    K.chip('nonce-R4nd0m', 990, 196, { mono: true, size: 18, stroke: P.warm, color: P.warm, a: K.p(t, 8) });
    var S = [['<script nonce="R4nd0m" src="app.js">', true, 'has the nonce: runs', 9.4], ['<script>steal()</script>', false, 'injected inline: blocked', 10.8], ['<img src=x onerror="steal()">', false, 'inline handler: blocked', 12]];
    S.forEach(function (s, i) {
      var q = K.p(t, s[3]), y = 290 + i * 54;
      K.box(40, y - 22, 560, 44, { fill: P.code, stroke: s[1] ? P.green : P.red, a: q, r: 8 });
      K.text(s[0], 60, y, { size: 17, mono: true, a: q });
      K.mark(630, y, s[1], 0.7, q); K.text(s[2], 654, y, { size: 18, color: s[1] ? P.green : P.red, a: q });
    });
    K.chip("strict-dynamic: trusted scripts may load more", 1010, 290, { size: 16, stroke: P.purple, a: K.p(t, 14.4) });
    K.chip("no 'unsafe-inline', no 'unsafe-eval'", 1010, 344, { size: 16, stroke: P.red, a: K.p(t, 15.6) });
    K.chip("object-src / base-uri 'none'", 1010, 398, { size: 16, stroke: P.acc, a: K.p(t, 16.8) });
    /* rollout */
    var R = [['Report-Only header', P.blue], ['read violation reports', P.purple], ['fix and add nonces', P.warm], ['enforce', P.green]];
    R.forEach(function (r, i) {
      var q = K.back((t - 20.2 - i * 0.7) / 0.5); if (q <= 0) return;
      K.chip(r[0], 170 + i * 310, 520, { size: 18, stroke: r[1], color: r[1], s: q, a: K.clamp(q) });
      if (i) K.arrow(170 + (i - 1) * 310 + 120, 520, 170 + i * 310 - 116, 520, { p: K.p(t, 20.2 + i * 0.7 - 0.2, 0.4), color: P.muted, head: 9, lw: 2 });
    });
  } },

/* 5 ─ Trusted Types */
{ d: 23, title: 'Trusted Types',
  caps: [
    [0.3, "Trusted Types close the DOM XSS gap. With require-trusted-types-for 'script' in the CSP, a plain string assigned to innerHTML throws."],
    [8, 'Only values created by a policy you define, usually a sanitizer, are accepted by the sink.'],
    [14.5, 'So a forgotten innerHTML becomes a TypeError you find in testing, not a hole you find in production.']],
  draw: function (K, t) {
    var P = K.P;
    K.panel(40, 84, 1200, 70, '', { a: K.p(t, 0.3) });
    K.code(["Content-Security-Policy: require-trusted-types-for 'script';"], 64, 106, { size: 20, n: K.typed(t, ["Content-Security-Policy: require-trusted-types-for 'script';"], [0.6], 40), t: t, a: K.p(t, 0.3) });
    /* string path */
    var a1 = K.p(t, 3.4);
    card(K, 40, 190, 220, 80, '"<b>hi</b>"', 'plain string', P.muted, a1, true);
    K.arrow(270, 230, 880, 230, { p: K.p(t, 4, 1), color: P.red, lw: 2.5 });
    card(K, 890, 190, 350, 80, 'el.innerHTML', 'a dangerous sink', P.warm, a1, true);
    K.mark(580, 230, false, 0.9, K.p(t, 5.2));
    K.text('TypeError: requires TrustedHTML', 580, 266, { size: 18, mono: true, color: P.red, align: 'center', a: K.p(t, 5.6) });
    /* policy path */
    var a2 = K.p(t, 8.2);
    card(K, 40, 330, 220, 80, '"<b>hi</b>"', 'plain string', P.muted, a2, true);
    K.arrow(270, 370, 350, 370, { p: K.p(t, 8.6, 0.4), color: P.green, lw: 2.5 });
    card(K, 360, 330, 240, 80, 'your policy', 'DOMPurify.sanitize', P.purple, K.p(t, 9), false);
    K.arrow(610, 370, 680, 370, { p: K.p(t, 9.8, 0.4), color: P.green, lw: 2.5 });
    card(K, 690, 330, 170, 80, 'TrustedHTML', '', P.green, K.p(t, 10.2), true);
    K.arrow(870, 370, 960, 370, { p: K.p(t, 10.8, 0.4), color: P.green, lw: 2.5 });
    nd(K, 'el.innerHTML', 1100, 370, { w: 270, h: 80, mono: true, stroke: P.warm, a: K.p(t, 10.8) });
    K.mark(1222, 340, true, 0.7, K.p(t, 11.4));
    var code = ['const policy = trustedTypes.createPolicy("app", { createHTML: (s) => DOMPurify.sanitize(s) });', 'el.innerHTML = policy.createHTML(userHtml);   // accepted'];
    var cp = K.p(t, 12);
    K.panel(40, 444, 1200, 100, '', { a: cp });
    K.code(code, 60, 460, { size: 17, lh: 1.6, n: K.typed(t, code, [12.2, 13.8], 60), t: t, a: cp });
    K.chip('a forgotten sink fails in testing, not in production', 640, 572, { size: 17, stroke: P.green, color: P.green, a: K.p(t, 15.4) });
  } },

/* 6 ─ CSRF */
{ d: 26, title: 'Cross-site request forgery',
  caps: [
    [0.3, 'CSRF. You are logged in to bank.com, and its session cookie identifies you.'],
    [5.5, 'Then you visit evil.com. Its page silently submits a hidden form that posts to bank.com/transfer.'],
    [11.5, 'Browsers attach cookies by destination, not by who started the request. Without a defense, the bank obeys.'],
    [18, 'CORS does not help here: a simple form post is sent anyway. CORS only hides the response.']],
  draw: function (K, t) {
    var P = K.P;
    /* browser */
    var b = K.p(t, 0.4);
    K.box(400, 84, 480, 300, { stroke: P.acc, a: b });
    K.text('Your browser', 640, 112, { size: 21, weight: 700, align: 'center', a: b });
    K.box(430, 140, 420, 70, { fill: P.code, stroke: P.line, a: K.p(t, 1), r: 8 });
    K.text('cookie jar', 450, 160, { size: 15, color: P.muted, a: K.p(t, 1) });
    K.chip('bank.com · sid=abc123', 640, 186, { mono: true, size: 16, stroke: P.warm, a: K.p(t, 1.6) });
    /* bank */
    var bk = K.p(t, 0.8);
    K.box(960, 84, 280, 300, { stroke: P.green, a: bk });
    K.text('bank.com', 1100, 112, { size: 21, weight: 700, mono: true, color: P.green, align: 'center', a: bk });
    K.text('logged in ✓', 1100, 150, { size: 17, color: P.green, align: 'center', a: K.p(t, 2) });
    /* evil */
    var ev = K.p(t, 5.7);
    K.box(40, 84, 280, 300, { stroke: P.red, a: ev });
    K.text('evil.com', 180, 112, { size: 21, weight: 700, mono: true, color: P.red, align: 'center', a: ev });
    K.text('free puppy!', 180, 152, { size: 18, align: 'center', a: K.p(t, 6.2) });
    var f = ['<form method="POST"', '  action="bank.com/transfer">', '<input name="to" value="me">', '</form>', '<script>form.submit()'];
    K.code(f, 52, 186, { size: 16, lh: 1.45, n: K.typed(t, f, [7, 7.6, 8.4, 9, 9.4], 50), t: t, a: ev });
    /* the forged request */
    K.arrow(320, 300, 420, 300, { p: K.p(t, 10, 0.4), color: P.red, lw: 2.5 });
    K.box(430, 270, 420, 60, { fill: 'rgba(252,129,129,.1)', stroke: P.red, a: K.p(t, 10.2), r: 8 });
    K.text('POST bank.com/transfer', 450, 300, { size: 17, mono: true, color: P.red, a: K.p(t, 10.2) });
    var ride = K.p(t, 12.2, 0.8);
    K.chip('sid=abc123', 640 + ride * 150, 238 + ride * 62, { mono: true, size: 15, stroke: P.warm, color: P.warm, a: K.p(t, 11.8) });
    K.arrow(860, 300, 950, 300, { p: K.p(t, 13.6, 0.4), color: P.red, lw: 2.5 });
    K.text('transfer done', 1100, 300, { size: 19, weight: 700, color: P.red, align: 'center', a: K.p(t, 14.8) });
    K.mark(1100, 340, false, 0.8, K.p(t, 14.8));
    /* CORS doesn't help */
    var c = K.p(t, 18.2);
    K.box(40, 420, 1200, 150, { fill: P.code, stroke: P.line, a: c });
    K.mark(80, 460, false, 0.8, c); K.text('CORS is not CSRF protection', 108, 460, { size: 21, weight: 700, a: c });
    K.text('the simple POST is still sent and processed; CORS only stops evil.com from reading the reply', 80, 506, { size: 18, color: P.muted, a: K.p(t, 19.2) });
    K.text('the bank needs its own defense: next scene', 80, 540, { size: 18, color: P.acc, a: K.p(t, 21) });
  } },

/* 7 ─ CSRF defenses and cookie flags */
{ d: 28, title: 'SameSite, tokens, flags',
  caps: [
    [0.3, 'Defense one: SameSite cookies. Lax, the default in modern browsers, withholds the cookie from cross-site posts and subrequests.'],
    [7.5, 'Defense two: an anti-CSRF token. The real page sends a secret that the attacker’s page cannot know.'],
    [14, 'Also check the Origin header on the server, and never change state on a GET request.'],
    [19.5, 'For the session cookie: HttpOnly hides it from scripts, Secure means HTTPS only, and the __Host- prefix locks its scope.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('SameSite', 40, 100, { size: 21, weight: 700, color: P.acc, a: K.p(t, 0.4) });
    [['Strict', 'never sent cross-site', P.green], ['Lax', 'only top-level GET links · default', P.acc], ['None; Secure', 'always sent (embeds, SSO)', P.warm]].forEach(function (r, i) {
      var q = K.p(t, 1 + i * 0.9), y = 146 + i * 52;
      K.chip(r[0], 110, y, { mono: true, size: 17, stroke: r[2], color: r[2], a: q });
      K.text(r[1], 200, y, { size: 18, a: q });
    });
    K.mark(80, 304, true, 0.7, K.p(t, 4.6)); K.text('the evil.com POST arrives without the cookie', 104, 304, { size: 17, color: P.green, a: K.p(t, 4.6) });
    /* token */
    var tk = K.p(t, 7.7);
    K.panel(660, 84, 580, 234, 'transfer form', { a: tk });
    K.code(['<input type="hidden" name="csrf"', '       value="9f2c6b1e…">'], 684, 120, { size: 18, n: K.typed(t, ['<input type="hidden" name="csrf"', '       value="9f2c6b1e…">'], [8, 9.2], 40), t: t, a: tk });
    K.text('server: token matches this session?', 684, 210, { size: 17, color: P.muted, a: K.p(t, 10.6) });
    K.mark(700, 248, true, 0.7, K.p(t, 11.4)); K.text('real page: has the token', 724, 248, { size: 18, color: P.green, a: K.p(t, 11.4) });
    K.mark(700, 286, false, 0.7, K.p(t, 12.4)); K.text('forged form: cannot know it', 724, 286, { size: 18, color: P.red, a: K.p(t, 12.4) });
    /* origin + GET */
    var og = K.p(t, 14.2);
    K.chip('Origin: https://evil.com → reject', 330, 370, { mono: true, size: 17, stroke: P.red, a: og });
    K.chip('GET never changes state', 900, 370, { size: 18, stroke: P.warm, a: K.p(t, 15.6) });
    /* cookie flags */
    var ck = K.p(t, 19.7), sc = ['Set-Cookie: __Host-sid=abc123; Path=/; Secure; HttpOnly; SameSite=Lax'];
    K.panel(40, 412, 1200, 172, '', { a: ck });
    K.code(sc, 64, 432, { size: 20, n: K.typed(t, sc, [19.9], 40), t: t, a: ck });
    [['__Host-', 'Secure, Path=/, no Domain', 190, 20.8, P.purple], ['Secure', 'HTTPS only', 480, 22, P.blue], ['HttpOnly', 'scripts cannot read it', 760, 22.8, P.green], ['SameSite=Lax', 'not on cross-site POSTs', 1050, 23.6, P.acc]].forEach(function (f) {
      var q = K.p(t, f[3]);
      K.text(f[0], f[2], 498, { size: 18, mono: true, weight: 700, color: f[4], align: 'center', a: q });
      K.text(f[1], f[2], 532, { size: 16, color: P.muted, align: 'center', a: q });
    });
  } },

/* 8 ─ where to keep auth, clickjacking */
{ d: 24, title: 'Storing auth safely',
  caps: [
    [0.3, 'Where to keep auth? An HttpOnly cookie resists XSS theft but needs CSRF defenses. A token in localStorage avoids CSRF, but any XSS steals it.'],
    [9, 'Many apps keep a short-lived access token in memory, plus a refresh token in an HttpOnly cookie.'],
    [15, 'And against clickjacking, send frame-ancestors in your CSP, so other sites cannot frame your page.']],
  draw: function (K, t) {
    var P = K.P;
    var L = K.p(t, 0.5), R = K.p(t, 4.4);
    K.box(40, 84, 580, 190, { stroke: P.green, a: L });
    K.text('HttpOnly cookie', 64, 116, { size: 22, weight: 700, mono: true, color: P.green, a: L });
    K.mark(78, 166, true, 0.7, K.p(t, 1.6)); K.text('XSS cannot read it', 102, 166, { size: 18, a: K.p(t, 1.6) });
    K.mark(78, 216, false, 0.7, K.p(t, 2.8)); K.text('sent automatically: needs CSRF defenses', 102, 216, { size: 18, a: K.p(t, 2.8) });
    K.box(660, 84, 580, 190, { stroke: P.red, a: R });
    K.text('token in localStorage', 684, 116, { size: 22, weight: 700, mono: true, color: P.red, a: R });
    K.mark(698, 166, true, 0.7, K.p(t, 5.4)); K.text('not sent automatically: no CSRF', 722, 166, { size: 18, a: K.p(t, 5.4) });
    K.mark(698, 216, false, 0.7, K.p(t, 6.6)); K.text('any XSS can steal it', 722, 216, { size: 18, a: K.p(t, 6.6) });
    /* common pattern */
    var cm = K.p(t, 9.2);
    K.text('a common pattern', 40, 310, { size: 19, weight: 700, color: P.acc, a: cm });
    nd(K, 'access token', 180, 360, { w: 220, h: 50, mono: true, stroke: P.acc, a: K.p(t, 9.6) });
    K.text('in memory · minutes', 180, 404, { size: 16, color: P.muted, align: 'center', a: K.p(t, 9.6) });
    nd(K, 'refresh token', 470, 360, { w: 220, h: 50, mono: true, stroke: P.green, a: K.p(t, 11) });
    K.text('HttpOnly cookie', 470, 404, { size: 16, color: P.muted, align: 'center', a: K.p(t, 11) });
    /* clickjacking */
    var cj = K.p(t, 15.2);
    K.box(660, 300, 580, 200, { fill: P.code, stroke: P.red, a: cj });
    K.text('evil.com: "click to win!"', 690, 330, { size: 18, color: P.red, a: cj });
    var fade = 0.3 + 0.2 * Math.sin(t * 2);
    K.box(700, 356, 300, 120, { fill: false, stroke: P.blue, dash: [6, 5], a: cj * (t > 18 ? 0.3 : fade + 0.3) });
    K.text('invisible iframe: bank.com', 712, 380, { size: 16, mono: true, color: P.blue, a: cj * (t > 18 ? 0.3 : 0.8) });
    K.chip('Win!', 850, 440, { size: 18, stroke: P.warm, a: cj });
    K.mark(1120, 416, false, 0.9, K.p(t, 18.2));
    K.text('blocked', 1120, 452, { size: 17, color: P.red, align: 'center', a: K.p(t, 18.2) });
    var fa = ["Content-Security-Policy: frame-ancestors 'self'"];
    K.panel(40, 520, 1200, 64, '', { a: K.p(t, 16.6) });
    K.code(fa, 64, 538, { size: 20, n: K.typed(t, fa, [16.8], 40), t: t, a: K.p(t, 16.6) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 20 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 106, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['XSS: untrusted data reaching a sink runs as your site',
     'textContent first; encode output; sanitize with DOMPurify',
     'Strict CSP with nonces, plus Trusted Types',
     'CSRF: SameSite cookies, tokens, Origin checks, no GET writes',
     'Session cookies: __Host-, Secure, HttpOnly, SameSite',
     'CORS is not CSRF protection; frame-ancestors stops framing'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(200, y, true, 0.9, q);
      K.text(s, 232 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 20 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
