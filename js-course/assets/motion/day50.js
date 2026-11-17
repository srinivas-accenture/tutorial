/* Day 50 in motion: sessions vs JWT, JWT anatomy and verification, OAuth 2 authorization code + PKCE,
   password storage, security headers, Subresource Integrity, supply chain and client-side secrets.
   Loaded on demand by assets/js/motion.js. */
(function () {
  function starts(lines, t0, cps) {
    var s = t0, out = [];
    lines.forEach(function (l) { out.push(s); s += l.length / cps + 0.08; });
    return out;
  }
  function dot(K, x, y, r, c, a) { var g = K.g; g.save(); g.globalAlpha *= K.clamp(a == null ? 1 : a); g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); }

JSC.motion.define('day50', {
  kicker: 'JavaScript: Zero to Architect · Day 50',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 50: proving who a user is, and hardening the app around them.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 200); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Authentication', 0, -44, { size: 80, weight: 800, align: 'center', a: K.clamp(t / 0.6) });
    K.text('and security II', 0, 46, { size: 80, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 50 · Prove who, then harden everything', 640, 340, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Sessions vs JWT', 'OAuth + PKCE', 'Security headers'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 450, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ sessions vs JWT */
{ d: 26, title: 'Sessions vs JWT',
  caps: [
    [0.3, 'Two ways to remember a signed-in user. A server session keeps the state on the server; the cookie holds only a random id.'],
    [7, 'A JWT carries signed claims in the token itself, so any server with the key can verify it without a lookup.'],
    [13, 'Revoking a session is easy: delete it. A JWT stays valid until it expires, so keep access tokens short-lived.'],
    [19.5, 'Keep tokens out of localStorage, where any XSS can read them. Prefer HttpOnly, Secure, SameSite cookies.']],
  draw: function (K, t) {
    var P = K.P, g = K.g, a = K.p(t, 0.4), b = K.p(t, 7.2);
    K.text('Server session', 40, 80, { size: 20, weight: 700, color: P.acc, a: a });
    K.box(40, 100, 200, 90, { stroke: P.blue, a: a });
    K.text('Browser', 140, 126, { size: 19, weight: 700, align: 'center', a: a });
    K.text('sid=8f3a…', 140, 160, { size: 17, mono: true, color: P.warm, align: 'center', a: K.p(t, 1.4) });
    K.arrow(246, 145, 324, 145, { p: K.p(t, 2, 0.5) });
    K.box(330, 100, 290, 90, { stroke: P.purple, a: K.p(t, 1.6) });
    K.text('Server', 475, 145, { size: 19, weight: 700, align: 'center', a: K.p(t, 1.6) });
    var del = K.p(t, 14, 0.6);
    K.box(330, 206, 290, 120, { fill: P.code, stroke: P.line, a: K.p(t, 2.8) });
    K.text('session store', 346, 228, { size: 16, color: P.muted, a: K.p(t, 2.8) });
    K.text('8f3a… → user 42', 346, 264, { size: 18, mono: true, a: K.p(t, 3.4) * (1 - del * 0.6) });
    g.save(); g.globalAlpha *= del; g.strokeStyle = P.red; g.lineWidth = 2.5; g.beginPath(); g.moveTo(340, 264); g.lineTo(340 + 180 * del, 264); g.stroke(); g.restore();
    K.text('2b7c… → user 7', 346, 300, { size: 18, mono: true, a: K.p(t, 3.8) });

    K.text('JWT (signed token)', 680, 80, { size: 20, weight: 700, color: P.warm, a: b });
    K.box(680, 100, 220, 90, { stroke: P.blue, a: b });
    K.text('Browser', 790, 126, { size: 19, weight: 700, align: 'center', a: b });
    K.text('eyJhbGci…', 790, 160, { size: 17, mono: true, color: P.warm, align: 'center', a: K.p(t, 7.8) });
    K.arrow(906, 145, 964, 145, { p: K.p(t, 8.4, 0.5) });
    K.box(970, 100, 270, 90, { stroke: P.purple, a: K.p(t, 8.6) });
    K.text('Any server + key', 1105, 145, { size: 19, weight: 700, align: 'center', a: K.p(t, 8.6) });
    K.mark(990, 232, true, 0.7, K.p(t, 9.8)); K.text('verify signature', 1014, 232, { size: 18, a: K.p(t, 9.8) });
    K.mark(990, 272, true, 0.7, K.p(t, 10.6)); K.text('no database lookup', 1014, 272, { size: 18, a: K.p(t, 10.6) });

    var r = K.p(t, 13.2);
    K.box(40, 350, 580, 96, { stroke: P.line, a: r });
    K.mark(70, 398, true, 0.8, K.p(t, 14.2)); K.text('logout: delete the row, done', 98, 398, { size: 19, a: K.p(t, 14.2) });
    K.box(680, 350, 560, 96, { stroke: P.line, a: K.p(t, 15.4) });
    K.chip('exp: 15 min', 770, 380, { size: 17, mono: true, stroke: P.warm, a: K.p(t, 15.6) });
    K.text('valid until it expires', 860, 380, { size: 18, color: P.warm, a: K.p(t, 15.6) });
    K.text('short access token + rotating refresh', 700, 420, { size: 17, color: P.muted, a: K.p(t, 16.8) });

    var s = K.p(t, 19.8);
    K.box(40, 466, 580, 116, { stroke: P.red, a: s });
    K.text('localStorage.setItem("token", jwt)', 60, 500, { size: 17, mono: true, a: s });
    K.mark(72, 548, false, 0.7, K.p(t, 20.6)); K.text('any injected script can read it', 96, 548, { size: 18, color: P.red, a: K.p(t, 20.6) });
    K.box(680, 466, 560, 116, { stroke: P.green, a: K.p(t, 21.6) });
    K.text('Set-Cookie: sid=8f3a; HttpOnly;', 700, 500, { size: 17, mono: true, a: K.p(t, 21.6) });
    K.text('  Secure; SameSite=Lax', 700, 526, { size: 17, mono: true, a: K.p(t, 21.6) });
    K.mark(712, 558, true, 0.6, K.p(t, 22.6)); K.text('JavaScript cannot read it', 734, 558, { size: 17, color: P.green, a: K.p(t, 22.6) });
  } },

/* 3 ─ inside a JWT */
{ d: 25, title: 'Inside a JWT',
  caps: [
    [0.3, 'A JWT is three base64url parts joined by dots: a header, a payload and a signature.'],
    [5.5, 'The payload is only encoded, not encrypted. Anyone can read it, so never put secrets in it.'],
    [11.5, 'To verify, pin the algorithm on the server and reject alg none. Then check the signature.'],
    [17.5, 'Then check the claims: exp and nbf for the time window, the issuer, and the audience. Any failure means reject.']],
  draw: function (K, t) {
    var P = K.P;
    var S = [['eyJhbGciOiJIUzI1NiJ9', P.blue, 'header'], ['.', P.muted], ['eyJzdWIiOiI0MiIsImV4cCI6…', P.purple, 'payload'], ['.', P.muted], ['SflKxwRJSMeKKF2QT4fw', P.warm, 'signature']];
    var g = K.g; g.save(); g.font = '22px Consolas,ui-monospace,Menlo,monospace'; var tw = g.measureText(S.map(function (s) { return s[0]; }).join('')).width; g.restore();
    var x = 640 - tw / 2, k = 0;
    S.forEach(function (s) {
      var w = K.text(s[0], x, 104, { size: 22, mono: true, color: s[1], a: K.p(t, 0.4) });
      if (s[2]) { K.text(s[2], x + w / 2, 140, { size: 17, color: s[1], align: 'center', a: K.p(t, 1.4 + k * 0.6) }); k++; }
      x += w;
    });
    var P1 = K.p(t, 2), P2 = K.p(t, 2.6), P3 = K.p(t, 3.2), hot = K.win(t, 5.6, 11.4);
    K.panel(40, 170, 340, 170, 'header', { a: P1 });
    K.code(['{ "alg": "HS256",', '  "typ": "JWT" }'], 62, 216, { size: 19, lh: 1.5, a: P1 });
    K.panel(400, 170, 440, 170, 'payload', { a: P2, stroke: hot > 0 ? P.warm : P.line });
    K.code(['{ "sub": "42",', '  "role": "user",', '  "exp": 1763400000 }'], 422, 216, { size: 19, lh: 1.5, a: P2 });
    K.panel(860, 170, 380, 170, 'signature', { a: P3 });
    K.code(['HMAC-SHA256(', '  header + "." + payload,', '  secret)'], 882, 216, { size: 19, lh: 1.5, a: P3 });
    K.text('atob(): readable by anyone', 620, 362, { size: 18, color: P.warm, align: 'center', a: K.p(t, 6.4) });
    K.text('so no secrets, no sensitive data', 620, 390, { size: 17, color: P.muted, align: 'center', a: K.p(t, 7.6) });

    var code = ['jwt.verify(token, key, {', '  algorithms: ["HS256"],   // pinned', '  issuer: "https://auth.app.com",', '  audience: "api.app.com",', '});'];
    K.panel(40, 412, 640, 170, 'api.js', { a: K.p(t, 11.6) });
    K.code(code, 64, 446, { size: 18, lh: 1.4, n: K.typed(t, code, [11.9, 12.8, 18, 19.2, 20.4], 30), t: t, a: K.p(t, 11.6) });
    K.box(720, 412, 520, 170, { stroke: P.line, a: K.p(t, 12) });
    [['alg pinned, never "none"', 12.6, P.ink], ['signature valid', 14.6, P.ink], ['exp, nbf: inside time window', 18.2, P.ink], ['iss and aud match', 19.6, P.ink]].forEach(function (r, i) {
      var y = 440 + i * 30, q = K.p(t, r[1]);
      K.mark(746, y, true, 0.55, q); K.text(r[0], 768, y, { size: 17, color: r[2], a: q });
    });
    K.text('any check fails → 401', 1220, 560, { size: 17, color: P.red, align: 'right', a: K.p(t, 21.4) });
  } },

/* 4 ─ OAuth 2 + PKCE */
{ d: 30, title: 'OAuth 2 with PKCE',
  caps: [
    [0.3, 'To sign in with an identity provider, a single-page app uses the authorization code flow with PKCE. The implicit flow is deprecated.'],
    [7, 'The app makes a random code verifier, and sends only its SHA-256 hash, the code challenge, with the login redirect, plus a state value.'],
    [14, 'After sign-in, the provider redirects back with a one-time code. The app checks state, then exchanges the code along with the verifier.'],
    [21.5, 'The provider hashes the verifier and compares it with the challenge. A stolen code is useless without the verifier.']],
  draw: function (K, t) {
    var P = K.P, g = K.g, a = K.p(t, 0.4);
    K.chip('Single-page app', 200, 96, { size: 19, stroke: P.blue, a: a });
    K.chip('Identity provider', 1080, 96, { size: 19, stroke: P.purple, a: a });
    g.save(); g.globalAlpha *= a; g.strokeStyle = P.line; g.lineWidth = 2; g.setLineDash([6, 6]);
    g.beginPath(); g.moveTo(200, 118); g.lineTo(200, 584); g.moveTo(1080, 118); g.lineTo(1080, 584); g.stroke(); g.restore();
    K.chip('implicit flow: deprecated', 640, 96, { size: 16, stroke: P.red, color: P.red, a: K.win(t, 3, 7) });
    K.text('verifier = random 64 chars (kept)', 220, 148, { size: 17, mono: true, a: K.p(t, 7.4) });
    K.text('challenge = base64url(SHA-256(verifier))', 220, 178, { size: 17, mono: true, color: P.acc, a: K.p(t, 8.8) });
    function msg(y, l2r, label, t0, color) {
      var x1 = l2r ? 206 : 1074, x2 = l2r ? 1074 : 206;
      K.arrow(x1, y, x2, y, { p: K.p(t, t0, 0.8), color: color || P.muted, lw: 2.5 });
      K.text(label, 640, y - 16, { size: 17, mono: true, color: color || P.ink, align: 'center', a: K.p(t, t0 + 0.3) });
    }
    msg(240, true, 'redirect /authorize?code_challenge=…&state=xyz', 10.2, P.acc);
    K.text('user signs in', 1060, 276, { size: 17, color: P.purple, align: 'right', a: K.p(t, 14.2) });
    msg(326, false, 'redirect back ?code=abc&state=xyz', 14.8, P.blue);
    K.mark(232, 362, true, 0.6, K.p(t, 16.4)); K.text('state matches', 254, 362, { size: 17, a: K.p(t, 16.4) });
    msg(420, true, 'POST /token  code + verifier', 17.4, P.acc);
    K.text('SHA-256(verifier) = challenge ✓', 1060, 456, { size: 17, color: P.green, align: 'right', a: K.p(t, 22) });
    msg(506, false, 'access token (+ ID token)', 23, P.green);
    var at = K.back((t - 24.6) / 0.5);
    if (at > 0) K.chip('stolen code, no verifier → rejected', 640, 560, { s: at, size: 17, stroke: P.red, color: P.red });
  } },

/* 5 ─ passwords */
{ d: 25, title: 'Storing passwords',
  caps: [
    [0.3, 'Never store passwords in plain text, or with a fast hash like SHA-256. Attackers can test billions of guesses a second.'],
    [7, 'Use a unique random salt per user, and a slow, memory-hard function: Argon2id first, or scrypt, bcrypt or PBKDF2.'],
    [13.5, 'Compare in constant time, rate-limit logins, rotate the session after login, and authorize every request on the server.'],
    [19, 'Better still, offer passkeys with WebAuthn, and multi-factor sign-in.']],
  draw: function (K, t) {
    var P = K.P;
    var pw = K.back((t - 0.5) / 0.5);
    if (pw > 0) K.chip('"hunter2"', 110, 190, { s: pw, size: 20, mono: true, stroke: P.ink });
    K.arrow(180, 176, 260, 130, { p: K.p(t, 1.2, 0.5) });
    K.arrow(180, 204, 260, 250, { p: K.p(t, 7.4, 0.5) });
    var f = K.p(t, 1.6);
    K.chip('SHA-256(pw)', 360, 120, { size: 18, mono: true, stroke: P.red, a: f });
    K.box(480, 110, 720, 22, { fill: P.code, r: 11, a: f });
    K.box(480, 110, Math.max(22, 720 * K.p(t, 2.4, 1.6)), 22, { fill: P.red, r: 11, a: f });
    K.text('billions of guesses per second on one GPU', 480, 154, { size: 17, color: P.red, a: K.p(t, 3.6) });
    var s = K.p(t, 7.6);
    K.chip('Argon2id(pw, salt)', 380, 250, { size: 18, mono: true, stroke: P.green, a: s });
    K.box(520, 240, 680, 22, { fill: P.code, r: 11, a: s });
    K.box(520, 240, 22 + 8 * K.p(t, 8.4, 1), 22, { fill: P.green, r: 11, a: s });
    K.text('dozens per second, and lots of memory each', 520, 284, { size: 17, color: P.green, a: K.p(t, 9.2) });
    var st = K.p(t, 10);
    K.text('stored:', 40, 334, { size: 16, color: P.muted, a: st });
    var x = 110, parts = [['$argon2id$v=19$', P.muted], ['m=65536,t=3,p=4', P.purple], ['$', P.muted], ['c2FsdDEyMw', P.warm], ['$Zr1Q9xk…', P.muted]];
    var cost = null, salt = null;
    parts.forEach(function (p, i) { var w = K.text(p[0], x, 334, { size: 19, mono: true, color: p[1], a: st }); if (i === 1) cost = [x, w]; if (i === 3) salt = [x, w]; x += w; });
    K.box(cost[0], 352, cost[1], 3, { fill: P.purple, a: K.p(t, 10.8) });
    K.text('cost', cost[0] + cost[1] / 2, 372, { size: 16, color: P.purple, align: 'center', a: K.p(t, 10.8) });
    K.box(salt[0], 352, salt[1], 3, { fill: P.warm, a: K.p(t, 11.4) });
    K.text('salt', salt[0] + salt[1] / 2, 372, { size: 16, color: P.warm, align: 'center', a: K.p(t, 11.4) });

    K.box(40, 400, 600, 182, { stroke: P.line, a: K.p(t, 13.6) });
    ['constant-time comparison', 'rate limiting and lockout', 'new session id after login', 'authorize on the server, every request'].forEach(function (s, i) {
      var y = 432 + i * 38, q = K.p(t, 14 + i * 0.9);
      K.mark(70, y, true, 0.6, q); K.text(s, 94, y, { size: 18, a: q });
    });
    var pk = K.p(t, 19.2);
    K.box(680, 400, 560, 182, { stroke: P.acc, a: pk });
    K.text('Passkeys (WebAuthn)', 704, 434, { size: 21, weight: 700, color: P.acc, a: pk });
    K.text('private key never leaves the device', 704, 472, { size: 17, a: K.p(t, 19.8) });
    K.text('phishing-resistant, nothing to crack', 704, 502, { size: 17, a: K.p(t, 20.4) });
    K.text('MFA: authenticator codes, security keys', 704, 548, { size: 17, color: P.muted, a: K.p(t, 21.2) });
  } },

/* 6 ─ security headers */
{ d: 28, title: 'Security headers',
  caps: [
    [0.3, 'Security headers tell the browser to enforce safe behaviour, even when your code has a bug.'],
    [6, 'Content-Security-Policy limits where scripts may come from. Use nonces or hashes, and avoid unsafe-inline.'],
    [12.5, 'Strict-Transport-Security forces HTTPS. nosniff stops MIME sniffing. Referrer-Policy limits how much of your URLs leak.'],
    [19, 'Permissions-Policy turns off features you don’t use, and frame-ancestors in the CSP stops clickjacking.']],
  draw: function (K, t) {
    var P = K.P;
    K.panel(40, 76, 700, 506, 'HTTP response headers', { a: K.p(t, 0.3) });
    K.code(['HTTP/2 200'], 64, 116, { size: 18, a: K.p(t, 0.6) });
    var L = [['Content-Security-Policy:', 6.2], ["  script-src 'self' 'nonce-r4nd0m';", 7], ["  frame-ancestors 'none'", 20.2], ['Strict-Transport-Security:', 12.8],
             ['  max-age=31536000; includeSubDomains', 13.4], ['X-Content-Type-Options: nosniff', 15], ['Referrer-Policy: strict-origin-when-cross-origin', 16.4],
             ['Permissions-Policy: camera=(), geolocation=()', 19.2]];
    L.forEach(function (l, i) {
      K.code([l[0]], 64, 168 + i * 46, { size: 18, n: K.typed(t, [l[0]], [l[1]], 40), t: t, a: K.p(t, l[1] - 0.2, 0.3) });
    });
    K.text('The browser blocks:', 780, 100, { size: 18, weight: 700, color: P.muted, a: K.p(t, 1) });
    [['injected script from evil.com', 8.6, false], ['(unsafe-inline would allow it)', 10, null], ['a downgrade to http://', 14.2, false],
     ['a .png run as a script', 15.8, false], ['full URLs leaking to other sites', 17.2, false], ['camera, geolocation use', 20, false], ['framing by other sites', 21, false]].forEach(function (r, i) {
      var y = 148 + i * 58, q = K.p(t, r[1]);
      if (r[2] === null) { K.text(r[0], 806, y - 18, { size: 16, color: P.warm, a: q }); return; }
      K.box(780, y - 22, 460, 44, { stroke: P.line, a: q });
      K.mark(806, y, false, 0.6, q);
      K.text(r[0], 830, y, { size: 18, a: q });
    });
    K.chip('start in report-only mode, then tighten', 990, 568, { size: 16, stroke: P.blue, a: K.p(t, 23) });
  } },

/* 7 ─ Subresource Integrity */
{ d: 21, title: 'Subresource Integrity',
  caps: [
    [0.3, 'Loading a script from a CDN? Add an integrity hash. If even one byte changes, the browser refuses to run it.'],
    [7.5, 'The integrity attribute holds a SHA-384 hash of the file. crossorigin anonymous is needed for the check to work.'],
    [13.5, 'So a compromised CDN cannot slip new code into your page. Pin exact versions: a new file means a new hash.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['<script src="https://cdn.example.com/lib@4.2.1.js"', '  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"', '  crossorigin="anonymous"></script>'];
    K.panel(40, 76, 1200, 150, 'index.html', { a: K.p(t, 0.2) });
    K.code(code, 64, 116, { size: 18, lh: 1.5, n: K.typed(t, code, [0.6, 7.8, 10.4], 60), t: t, a: K.p(t, 0.2), hi: t > 7.8 && t < 13.5 ? 1 : -1, w: 1170 });
    var bad = t > 14, a = K.p(t, 2);
    K.box(40, 270, 240, 110, { stroke: bad ? P.red : P.purple, a: a });
    K.text('CDN', 160, 306, { size: 22, weight: 700, align: 'center', a: a });
    K.text(bad ? 'compromised' : 'serves the file', 160, 344, { size: 17, color: bad ? P.red : P.muted, align: 'center', a: a });
    K.arrow(286, 325, 356, 325, { p: K.p(t, 2.6, 0.4) });
    K.box(362, 270, 250, 110, { fill: P.code, stroke: bad ? P.red : P.line, a: K.p(t, 2.8) });
    K.text('lib@4.2.1.js', 487, 306, { size: 18, mono: true, align: 'center', a: K.p(t, 2.8) });
    K.text(bad ? '+ stealCookies()' : 'original bytes', 487, 344, { size: 17, mono: bad, color: bad ? P.red : P.muted, align: 'center', a: K.p(t, 2.8) });
    K.arrow(618, 325, 688, 325, { p: K.p(t, 3.4, 0.4) });
    K.box(694, 270, 260, 110, { stroke: P.acc, a: K.p(t, 3.6) });
    K.text('SHA-384(bytes)', 824, 306, { size: 19, mono: true, align: 'center', a: K.p(t, 3.6) });
    K.text(bad ? '= X9fT2…  ≠' : '= oqVuAf…  =', 824, 344, { size: 18, mono: true, color: bad ? P.red : P.green, align: 'center', a: K.p(t, 4.2) });
    K.arrow(960, 325, 1030, 325, { p: K.p(t, 4.6, 0.4) });
    K.box(1036, 270, 204, 110, { stroke: bad ? P.red : P.green, a: K.p(t, 4.8) });
    K.mark(1138, 306, !bad, 0.9, K.p(t, 5));
    K.text(bad ? 'refused' : 'runs', 1138, 348, { size: 20, weight: 700, color: bad ? P.red : P.green, align: 'center', a: K.p(t, 5) });
    K.chip('crossorigin="anonymous": fetched with CORS', 360, 440, { size: 17, mono: true, stroke: P.blue, a: K.p(t, 10.6) });
    K.chip('a new version means a new hash', 960, 440, { size: 17, stroke: P.warm, a: K.p(t, 17) });
    K.text('the browser checks, so a tampered CDN file never runs', 640, 520, { size: 20, color: P.green, align: 'center', a: K.p(t, 15.4) });
  } },

/* 8 ─ supply chain and secrets */
{ d: 27, title: 'Supply chain and secrets',
  caps: [
    [0.3, 'Every npm package you install, and everything it depends on, can run code on your machines and in your bundle.'],
    [6.5, 'Commit the lockfile and install with npm ci, so every build gets exactly the same versions.'],
    [12.5, 'Review new dependencies, run npm audit or Dependabot, and watch out for look-alike package names.'],
    [19, 'Never put secrets in client code. Variables like VITE_ or NEXT_PUBLIC_ end up in the bundle, readable by anyone.']],
  draw: function (K, t) {
    var P = K.P, a = K.p(t, 0.4);
    K.box(40, 76, 760, 230, { stroke: P.line, a: a });
    var root = K.back((t - 0.6) / 0.5);
    if (root > 0) K.chip('your-app', 120, 190, { s: root, size: 18, mono: true, stroke: P.acc });
    ['express', 'lodash', 'vite'].forEach(function (n, i) {
      var y = 120 + i * 70, q = K.p(t, 1.2 + i * 0.3);
      K.arrow(176, 190, 270, y, { a: q, head: 8, lw: 1.5 });
      K.chip(n, 330, y, { size: 17, mono: true, stroke: P.blue, a: q });
      for (var k = 0; k < 8; k++) {
        var yy = y - 24 + k * 6.2, xx = 470 + (k % 4) * 52 + (i % 2) * 20, qq = K.p(t, 2 + i * 0.4 + k * 0.08, 0.3);
        K.arrow(384, y, xx - 8, yy, { a: qq * 0.35, head: 1, lw: 1 });
        dot(K, xx, yy, 5, i === 2 && k === 5 ? P.red : P.muted, qq);
      }
    });
    K.text('1 install → hundreds of packages', 60, 290, { size: 17, color: P.muted, a: K.p(t, 3.4) });
    K.text('a bad install script runs here', 780, 290, { size: 16, color: P.red, align: 'right', a: K.p(t, 4.4) });

    var term = ['$ npm ci            # exact lockfile versions', '$ npm audit         # known vulnerabilities', '$ npm ci --ignore-scripts   # in CI'];
    K.panel(40, 326, 760, 256, 'terminal', { a: K.p(t, 6.6) });
    K.code(term, 64, 372, { size: 19, lh: 1.8, n: K.typed(t, term, [7, 13.4, 16], 34), t: t, a: K.p(t, 6.6) });
    K.chip('package-lock.json committed', 260, 536, { size: 17, mono: true, stroke: P.green, a: K.p(t, 9) });

    var ty = K.p(t, 12.8);
    K.box(840, 76, 400, 230, { stroke: P.line, a: ty });
    K.text('Look-alike names', 860, 102, { size: 16, weight: 700, color: P.muted, a: ty });
    [['react', true], ['raect', false], ['react-dom-utils2', false]].forEach(function (r, i) {
      var y = 150 + i * 50, q = K.p(t, 13.4 + i * 0.6);
      K.mark(872, y, r[1], 0.6, q); K.text(r[0], 896, y, { size: 19, mono: true, color: r[1] ? P.ink : P.red, a: q });
    });
    K.text('check maintainers, downloads, scripts', 860, 284, { size: 16, color: P.muted, a: K.p(t, 15.4) });

    var s = K.p(t, 19.2);
    K.box(840, 326, 400, 256, { stroke: P.red, a: s });
    K.text('.env', 860, 352, { size: 16, weight: 700, color: P.muted, a: s });
    K.text('VITE_API_KEY=sk_live_9f…', 860, 388, { size: 18, mono: true, color: P.warm, a: s });
    K.arrow(1040, 408, 1040, 448, { p: K.p(t, 20.2, 0.4), color: P.red });
    K.text('dist/app.js', 860, 470, { size: 16, weight: 700, color: P.muted, a: K.p(t, 20.6) });
    K.text('"sk_live_9f…"  readable!', 860, 504, { size: 18, mono: true, color: P.red, a: K.p(t, 20.8) });
    K.text('keep secrets on the server', 860, 556, { size: 17, color: P.green, a: K.p(t, 22.4) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 50 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Sessions revoke easily; JWTs must be short-lived',
     'JWT payloads are readable: pin alg, check exp, iss, aud',
     'SPAs: authorization code flow with PKCE and state',
     'Passwords: salt + Argon2id; better still, passkeys',
     'Headers: CSP, HSTS, nosniff, Referrer- and Permissions-Policy',
     'SRI for CDN scripts; lockfiles, audits, no client secrets'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 0.95, 0.5), y = 170 + i * 58;
      K.mark(230, y, true, 0.85, q);
      K.text(s, 262 - (1 - q) * 20, y, { size: 23, a: q });
    });
    K.chip('Next: run the Day 50 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
