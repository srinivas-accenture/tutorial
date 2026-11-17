/* Day 47 in motion: native form validation and the Constraint Validation API, FormData and submit handling,
   accessible errors, File and Blob, uploads with progress, chunked/resumable uploads, drag and drop and the clipboard.
   Loaded on demand by assets/js/motion.js. */
(function () {
  function starts(lines, t0, cps) {
    var s = t0, out = [];
    lines.forEach(function (l) { out.push(s); s += l.length / cps + 0.08; });
    return out;
  }
  /* a text input: label, box, value */
  function field(K, x, y, w, label, value, o) {
    var P = K.P; o = o || {};
    if (label) K.text(label, x, y, { size: 18, color: o.dim ? P.muted : P.ink, a: o.a });
    var lx = o.lx == null ? 110 : o.lx;
    K.box(x + lx, y - 20, w, 40, { fill: P.code, stroke: o.stroke || P.line, lw: o.lw || 2, r: 8, a: o.a });
    if (o.ring) K.box(x + lx - 5, y - 25, w + 10, 50, { fill: false, stroke: P.acc, lw: 2, r: 11, a: o.ring });
    K.text(value, x + lx + 14, y, { size: 18, mono: true, color: o.dim ? P.muted : P.ink, a: o.a });
  }

JSC.motion.define('day47', {
  kicker: 'JavaScript: Zero to Architect · Day 47',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 47: validating forms with the browser, collecting their data, and handling files and uploads.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Forms and files', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 47 · Validate, collect, upload', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Constraint validation', 'FormData', 'Files and uploads'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ native constraints */
{ d: 25, title: 'Native constraints',
  caps: [
    [0.3, 'Start with HTML. Attributes like required, type email, min and pattern describe what valid input looks like.'],
    [6.5, 'On submit, the browser checks every field before the submit event fires, and stops at the first problem.'],
    [12.5, 'Each input has a validity object, with one flag per rule it breaks, and valid when it passes them all.'],
    [18.5, 'Pick the right type, inputmode and autocomplete too. The right keyboard and autofill come for free.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['<form id="signup">', '  <input name="email" type="email" required>', '  <input name="age" type="number" min="18">',
                '  <input name="code" pattern="[A-Z]{3}[0-9]{2}">', '  <button>Sign up</button>', '</form>'];
    K.panel(40, 86, 640, 252, 'signup.html', { a: K.p(t, 0.2) });
    K.code(code, 64, 130, { size: 19, lh: 1.55, n: K.typed(t, code, starts(code, 0.6, 50), 50), t: t, a: K.p(t, 0.2) });

    var f = K.p(t, 3.4), sub = K.win(t, 7, 7.5, 0.15), bad = K.p(t, 7.6, 0.4);
    K.box(720, 86, 520, 252, { stroke: P.line, a: f });
    field(K, 744, 128, 190, 'Email', 'abc', { a: f, stroke: bad > 0.5 ? P.red : P.line, lw: bad > 0.5 ? 2.5 : 2, ring: bad });
    field(K, 744, 184, 190, 'Age', '17', { a: f });
    field(K, 744, 240, 190, 'Code', 'abc12', { a: f });
    K.chip('Sign up', 810, 300, { size: 18, stroke: P.acc, s: 1 - sub * 0.1, a: f });
    K.box(1060, 106, 172, 44, { fill: '#f7fafc', r: 8, a: bad });
    K.text('Enter an email', 1146, 128, { size: 16, color: '#1a202c', align: 'center', a: bad });
    K.text('submit event: not fired', 1080, 300, { size: 17, color: P.red, align: 'center', a: K.p(t, 9.2) });

    var v = K.p(t, 12.6);
    var vl = ['valueMissing:     false', 'typeMismatch:     true', 'patternMismatch:  false', 'rangeUnderflow:   false', 'valid:            false'];
    K.panel(40, 360, 640, 222, 'email.validity', { a: v });
    K.code(vl, 64, 400, { size: 19, lh: 1.42, n: K.typed(t, vl, starts(vl, 13, 60), 60), t: t, a: v,
      marks: t > 14.6 ? { 1: 'rgba(252,129,129,.18)', 4: t > 15.6 ? 'rgba(252,129,129,.18)' : null } : null, w: 616 });

    K.box(720, 360, 520, 222, { stroke: P.line, a: K.p(t, 18.6) });
    [['type="email"', 'email keyboard', 19], ['inputmode="numeric"', 'number pad', 20], ['autocomplete="email"', 'autofill', 21]].forEach(function (r, i) {
      var y = 408 + i * 62, q = K.p(t, r[2]);
      K.text(r[0], 740, y, { size: 18, mono: true, color: P.blue, a: q });
      K.arrow(970, y, 1030, y, { a: q, head: 10 });
      K.chip(r[1], 1130, y, { size: 17, stroke: P.green, a: K.p(t, r[2] + 0.4) });
    });
  } },

/* 3 ─ the Constraint Validation API */
{ d: 26, title: 'The Constraint Validation API',
  caps: [
    [0.3, 'checkValidity returns true or false. reportValidity does the same check and also shows the message to the user.'],
    [6.5, 'setCustomValidity adds your own error, like Code already used, from the server. Now the field is invalid.'],
    [13, 'It stays invalid, even after the user edits it, until you clear it with an empty string.'],
    [19, 'Add novalidate to the form to draw your own error UI, while still using the same validity checks.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['code.checkValidity();   // true', 'code.reportValidity();  // + shows the message', '',
                'code.setCustomValidity("Code already used");', 'code.validity.customError  // true', 'code.validationMessage', '',
                'code.setCustomValidity("");  // clears it'];
    K.panel(40, 86, 640, 330, 'validate.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 132, { size: 19, lh: 1.5, n: K.typed(t, code, [1, 3.2, 5, 6.8, 9.4, 11, 12.4, 15.2]), t: t, a: K.p(t, 0.2),
      hi: t > 15.2 ? 7 : t > 6.8 ? 3 : t > 3.2 ? 1 : t > 1 ? 0 : -1, w: 616 });

    var cust = t > 7.8 && t < 16.6, ed = t > 13.6;
    K.box(720, 86, 520, 330, { stroke: P.line, a: K.p(t, 0.4) });
    K.text('Field: code', 744, 116, { size: 17, weight: 700, color: P.muted, a: K.p(t, 0.4) });
    field(K, 744, 170, 220, '', ed ? 'ABC13' : 'ABC12', { lx: 0, a: K.p(t, 0.4), stroke: cust ? P.red : P.green, lw: 2.5 });
    K.chip(cust ? 'invalid' : 'valid', 1060, 170, { size: 18, stroke: cust ? P.red : P.green, color: cust ? P.red : P.green, a: K.p(t, 0.8) });
    K.text('server: "Code already used"', 744, 234, { size: 18, mono: true, color: P.warm, a: K.win(t, 7.2, 12.6) });
    K.text('user edits the value: still invalid', 744, 234, { size: 18, color: P.red, a: K.win(t, 13.8, 16.4) });
    K.text('cleared: valid again', 744, 234, { size: 18, color: P.green, a: K.p(t, 16.8) });
    [['customError', cust], ['valid', !cust]].forEach(function (r, i) {
      var y = 290 + i * 40;
      K.text(r[0] + ':', 744, y, { size: 19, mono: true, color: P.muted, a: K.p(t, 1.2) });
      K.text(String(r[1]), 920, y, { size: 19, mono: true, color: r[1] === (i === 1) ? P.green : P.red, a: K.p(t, 1.2) });
    });
    K.text('message: ' + (cust ? '"Code already used"' : '""'), 744, 370, { size: 18, mono: true, color: P.muted, a: K.p(t, 1.2) });

    var n = K.p(t, 19.2);
    K.panel(40, 440, 600, 140, 'signup.html', { a: n });
    K.code(['<form id="signup" novalidate>'], 64, 494, { size: 21, n: K.typed(t, ['<form id="signup" novalidate>'], [19.6]), t: t, a: n });
    K.chip('no browser bubbles', 820, 476, { size: 18, stroke: P.blue, a: K.p(t, 20.6) });
    K.chip('your own error UI', 1090, 476, { size: 18, stroke: P.acc, a: K.p(t, 21.3) });
    K.chip('validity still works', 960, 544, { size: 18, stroke: P.green, a: K.p(t, 22) });
  } },

/* 4 ─ FormData and submit */
{ d: 25, title: 'FormData and submit',
  caps: [
    [0.3, 'On submit, new FormData of the form collects the value of every named, enabled field.'],
    [6, 'Unchecked checkboxes, disabled fields and inputs without a name are skipped entirely.'],
    [12, 'Repeated names give several entries. getAll keeps them all. Object.fromEntries keeps only the last one.'],
    [18, 'Listen for submit, not a button click, so the Enter key and requestSubmit work too. Then call preventDefault.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    K.box(40, 86, 560, 330, { stroke: P.line, a: K.p(t, 0.2) });
    K.text('<form>', 60, 112, { size: 17, mono: true, color: P.blue, a: K.p(t, 0.2) });
    var R = [['name="email"', 'a@b.co', 1, 'email', '"a@b.co"'], ['name="note"', '(empty)', 1, 'note', '""'],
             ['checkbox "tos"', 'unchecked', 0], ['checkbox "news"', 'checked', 1, 'news', '"on"'],
             ['name="nick" disabled', 'Ann', 0], ['(no name)', 'x', 0]];
    var k = 0;
    R.forEach(function (r, i) {
      var y = 150 + i * 44, q = K.p(t, 0.5 + i * 0.2), skip = !r[2], sk = skip ? K.p(t, 6.4 + k++ * 0.7) : 0;
      K.text(r[0], 64, y, { size: 18, mono: true, color: skip && sk > 0.5 ? P.muted : P.ink, a: q });
      K.text(r[1], 390, y, { size: 18, color: P.muted, a: q });
      if (skip) {
        g.save(); g.globalAlpha *= sk; g.strokeStyle = P.red; g.lineWidth = 2; g.beginPath(); g.moveTo(60, y); g.lineTo(60 + 450 * sk, y); g.stroke(); g.restore();
        K.text('skipped', 580, y, { size: 16, color: P.red, align: 'right', a: sk });
      }
    });
    K.panel(640, 86, 600, 330, 'new FormData(form)', { a: K.p(t, 1.2) });
    k = 0;
    R.forEach(function (r) {
      if (!r[2]) return;
      var y = 150 + k * 50, q = K.p(t, 2 + k * 0.8, 0.5);
      K.arrow(560, 150 + R.indexOf(r) * 44, 660, y, { a: q * 0.6, head: 8, lw: 1.5, color: P.acc });
      K.text('["' + r[3] + '", ' + r[4] + ']', 680, y, { size: 20, mono: true, a: q });
      k++;
    });
    K.text('only named, enabled, checked fields', 680, 380, { size: 17, color: P.muted, a: K.p(t, 9.5) });

    var c = ['fd.getAll("tag")            // ["a", "b"]', 'Object.fromEntries(fd).tag  // "b"'];
    K.panel(40, 440, 560, 140, 'tag=a & tag=b', { a: K.p(t, 12.2) });
    K.code(c, 64, 490, { size: 18, lh: 1.7, n: K.typed(t, c, [12.6, 15], 30), t: t, a: K.p(t, 12.2) });
    K.mark(568, 498, true, 0.7, K.p(t, 14.4)); K.mark(568, 528, false, 0.7, K.p(t, 16.4));
    var s = ['form.addEventListener("submit", (e) => {', '  e.preventDefault();', '  const fd = new FormData(form);', '});'];
    K.panel(640, 440, 600, 140, '', { a: K.p(t, 18.2) });
    K.code(s, 664, 454, { size: 18, lh: 1.4, n: K.typed(t, s, starts(s, 18.5, 34), 34), t: t, a: K.p(t, 18.2) });
    K.chip('Enter key ✓', 1150, 500, { size: 16, stroke: P.green, a: K.p(t, 21) });
  } },

/* 5 ─ accessible errors, and the server */
{ d: 24, title: 'Accessible errors',
  caps: [
    [0.3, 'Every field needs a real label. Link its error text with aria-describedby, and set aria-invalid.'],
    [6.5, 'Announce errors with role alert or a live region, and move focus to the first invalid field.'],
    [12.5, 'Never rely on colour or a placeholder alone to say what is wrong.'],
    [17, 'And client checks are only a convenience. Anyone can skip them, so the server validates everything again.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['<label for="email">Email</label>', '<input id="email" type="email"', '  aria-describedby="email-err"', '  aria-invalid="true">',
                '<p id="email-err" role="alert">', '  Enter an email like ana@site.com</p>'];
    K.panel(40, 86, 640, 250, 'signup.html', { a: K.p(t, 0.2) });
    K.code(code, 64, 130, { size: 19, lh: 1.5, n: K.typed(t, code, starts(code, 0.6, 40), 40), t: t, a: K.p(t, 0.2),
      hi: t > 6.6 && t < 12.5 ? 4 : t > 2.2 && t < 6.5 ? 2 : -1, w: 616 });

    var a = K.p(t, 1.4), ring = K.p(t, 8.6);
    K.box(720, 86, 520, 250, { stroke: P.line, a: a });
    K.text('Email', 744, 120, { size: 19, weight: 700, a: a });
    K.box(744, 140, 300, 44, { fill: P.code, stroke: P.red, lw: 2.5, r: 8, a: a });
    K.box(739, 135, 310, 54, { fill: false, stroke: P.acc, lw: 2, r: 11, a: ring });
    K.text('ana@', 758, 162, { size: 19, mono: true, a: a });
    K.mark(762, 220, false, 0.6, K.p(t, 2.4));
    K.text('Enter an email like ana@site.com', 782, 220, { size: 18, color: P.red, a: K.p(t, 2.4) });
    K.curve(1050, 162, 1150, 190, 1080, 214, { p: K.p(t, 3.4, 0.6), color: P.purple, lw: 2, head: 9 });
    K.text('describedby', 1160, 170, { size: 16, color: P.purple, a: K.p(t, 3.8) });
    K.text('Screen reader hears:', 744, 270, { size: 16, color: P.muted, a: K.p(t, 7) });
    K.text('"Email, invalid entry, Enter an email…"', 744, 302, { size: 17, mono: true, color: P.acc, a: K.p(t, 7.6) });

    var b = K.p(t, 12.6);
    K.box(40, 360, 640, 222, { stroke: P.line, a: b });
    K.box(70, 394, 220, 40, { fill: P.code, stroke: P.red, lw: 2.5, r: 8, a: K.p(t, 13) });
    K.mark(320, 414, false, 0.7, K.p(t, 13.4)); K.text('red border only', 346, 414, { size: 18, a: K.p(t, 13.4) });
    K.box(70, 458, 220, 40, { fill: P.code, stroke: P.line, r: 8, a: K.p(t, 14) });
    K.text('Email', 86, 478, { size: 17, color: P.muted, a: K.p(t, 14) });
    K.mark(320, 478, false, 0.7, K.p(t, 14.4)); K.text('placeholder as the label', 346, 478, { size: 18, a: K.p(t, 14.4) });
    K.mark(80, 540, true, 0.7, K.p(t, 15.2)); K.text('label + error text + icon + focus', 106, 540, { size: 18, color: P.green, a: K.p(t, 15.2) });

    var c = K.p(t, 17.2);
    K.box(720, 360, 520, 222, { stroke: P.line, a: c });
    K.chip('browser checks · UX', 860, 404, { size: 18, stroke: P.blue, a: c });
    K.chip('curl / script', 860, 528, { size: 18, stroke: P.red, color: P.red, a: K.p(t, 18.6) });
    var sv = K.back((t - 18) / 0.5);
    if (sv > 0) K.chip('server validates · security', 1110 - 0, 466, { s: sv, size: 17, stroke: P.green });
    K.arrow(960, 410, 1040, 448, { p: K.p(t, 17.8, 0.5), color: P.blue });
    K.arrow(940, 522, 1040, 484, { p: K.p(t, 19.2, 0.5), color: P.red });
    K.text('skips the browser', 860, 566, { size: 16, color: P.red, align: 'center', a: K.p(t, 19.6) });
  } },

/* 6 ─ File and Blob */
{ d: 25, title: 'File and Blob',
  caps: [
    [0.3, 'An input of type file gives you a FileList of File objects, each with a name, size, type and lastModified.'],
    [6.5, 'File extends Blob, so you read it with text, arrayBuffer or stream. Prefer those to the older FileReader.'],
    [12.5, 'For a preview, URL.createObjectURL gives a blob URL. Revoke it when you are done, or the memory leaks.'],
    [18.5, 'But file.type comes from the file name. It can lie, so the server must check the real bytes.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['<input type="file" accept="image/*" multiple>', 'const [file] = input.files;', 'file.name   // "cat.png"', 'file.size   // 48213', 'file.type   // "image/png"'];
    K.panel(40, 76, 620, 200, 'upload.html', { a: K.p(t, 0.2) });
    K.code(code, 64, 112, { size: 19, lh: 1.4, n: K.typed(t, code, starts(code, 0.6, 40), 40), t: t, a: K.p(t, 0.2) });
    var c = K.back((t - 2.6) / 0.6);
    if (c > 0) {
      g.save(); g.translate(970, 176); g.scale(c, c); g.translate(-970, -176);
      K.box(700, 76, 540, 200, { stroke: P.warm, a: K.clamp(c) });
      K.box(726, 104, 80, 100, { fill: P.code, stroke: P.warm, r: 6, a: K.clamp(c) });
      K.text('PNG', 766, 154, { size: 18, weight: 700, color: P.warm, align: 'center', a: K.clamp(c) });
      [['name', '"cat.png"'], ['size', '48213'], ['type', '"image/png"'], ['lastModified', '1763372…']].forEach(function (r, i) {
        K.text(r[0], 830, 112 + i * 38, { size: 17, color: P.muted, a: K.clamp(c) });
        K.text(r[1], 976, 112 + i * 38, { size: 18, mono: true, a: K.clamp(c) });
      });
      g.restore();
    }

    var b = K.p(t, 6.6);
    K.box(40, 296, 260, 140, { stroke: P.purple, a: b });
    K.text('Blob', 64, 322, { size: 20, weight: 700, color: P.purple, a: b });
    ['size · type', 'slice()', 'text() · stream()'].forEach(function (s, i) { K.text(s, 64, 356 + i * 26, { size: 16, mono: true, a: b }); });
    K.box(380, 296, 280, 140, { stroke: P.warm, a: K.p(t, 7.2) });
    K.text('File', 404, 322, { size: 20, weight: 700, color: P.warm, a: K.p(t, 7.2) });
    ['+ name', '+ lastModified'].forEach(function (s, i) { K.text(s, 404, 356 + i * 26, { size: 16, mono: true, a: K.p(t, 7.2) }); });
    K.arrow(376, 366, 306, 366, { p: K.p(t, 7.6, 0.5), color: P.warm });
    K.text('extends', 341, 344, { size: 16, color: P.warm, align: 'center', a: K.p(t, 7.8) });
    var r = ['await file.text()', 'await file.arrayBuffer()', 'file.stream()'];
    K.panel(700, 296, 540, 140, '', { a: K.p(t, 8.4) });
    K.code(r, 724, 310, { size: 19, lh: 1.45, n: K.typed(t, r, starts(r, 8.6, 30), 30), t: t, a: K.p(t, 8.4) });
    K.text('FileReader: legacy', 1220, 418, { size: 16, color: P.muted, align: 'right', a: K.p(t, 11) });

    var pv = ['const url = URL.createObjectURL(file);', 'img.src = url;', 'img.onload = () => URL.revokeObjectURL(url);'];
    K.panel(40, 456, 620, 126, '', { a: K.p(t, 12.6) });
    K.code(pv, 60, 470, { size: 17, lh: 1.5, n: K.typed(t, pv, starts(pv, 12.9, 34), 34), t: t, a: K.p(t, 12.6), hi: t > 15.6 ? 2 : -1, w: 590 });
    K.text('blob:https://app.com/3f2a…', 60, 566, { size: 16, mono: true, color: P.blue, a: K.p(t, 14.2) });

    var sp = K.p(t, 18.7);
    K.box(700, 456, 540, 126, { stroke: P.red, a: sp });
    K.text('evil.png   type: "image/png"', 722, 484, { size: 18, mono: true, a: sp });
    K.text('bytes:  <script>alert(1)…', 722, 518, { size: 18, mono: true, color: P.red, a: K.p(t, 19.6) });
    K.text('server checks magic bytes: 89 50 4E 47 = PNG', 722, 554, { size: 16, color: P.green, a: K.p(t, 21) });
  } },

/* 7 ─ uploading */
{ d: 24, title: 'Uploading with progress',
  caps: [
    [0.3, 'To upload, append the file to a FormData, and POST it with fetch.'],
    [5.5, 'Do not set the Content-Type header yourself. The browser adds it, with the multipart boundary the server needs.'],
    [11, 'fetch has no upload progress. XMLHttpRequest does: upload.onprogress drives a progress bar.'],
    [17.5, 'Give users a cancel button: abort with an AbortController for fetch, or xhr.abort for XHR.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const fd = new FormData();', 'fd.append("photo", file);', 'await fetch("/api/upload", {', '  method: "POST", body: fd,', '  // no Content-Type header!', '});'];
    K.panel(40, 76, 620, 250, 'upload.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 116, { size: 19, lh: 1.45, n: K.typed(t, code, [0.8, 1.9, 3, 4, 5.8, 7], 30), t: t, a: K.p(t, 0.2), hi: t > 5.8 && t < 11 ? 4 : -1, w: 596 });
    var r = K.p(t, 6.2);
    K.box(700, 76, 540, 250, { stroke: P.line, a: r });
    K.text('Request the browser sends', 720, 104, { size: 16, weight: 700, color: P.muted, a: r });
    K.text('POST /api/upload', 720, 144, { size: 19, mono: true, a: r });
    K.text('Content-Type: multipart/form-data;', 720, 182, { size: 18, mono: true, color: P.green, a: K.p(t, 6.8) });
    K.text('  boundary=----WebKitFormBoundary7MA4', 720, 210, { size: 18, mono: true, color: P.green, a: K.p(t, 7.4) });
    K.mark(736, 268, false, 0.7, K.p(t, 8.8));
    K.text('set it yourself: no boundary, server', 760, 262, { size: 16, color: P.red, a: K.p(t, 8.8) });
    K.text('cannot split the parts', 760, 288, { size: 16, color: P.red, a: K.p(t, 8.8) });

    var x = ['const xhr = new XMLHttpRequest();', 'xhr.upload.onprogress = (e) =>', '  bar.value = e.loaded / e.total;', 'xhr.open("POST", "/api/upload");', 'xhr.send(fd);'];
    K.panel(40, 346, 620, 236, 'progress.js', { a: K.p(t, 11.2) });
    K.code(x, 64, 386, { size: 19, lh: 1.5, n: K.typed(t, x, starts(x, 11.4, 44), 44), t: t, a: K.p(t, 11.2), hi: t > 12.4 && t < 17.5 ? 1 : -1, w: 596 });

    var bp = K.p(t, 11.2), cancel = t > 19.6, pr = Math.min(K.clamp((t - 14) / 7), cancel ? K.clamp(5.6 / 7) : 1);
    K.box(700, 346, 540, 236, { stroke: P.line, a: bp });
    K.text('cat.png', 724, 380, { size: 18, mono: true, a: bp });
    K.box(724, 404, 492, 26, { fill: P.code, r: 13, a: bp });
    K.box(724, 404, Math.max(26, 492 * pr), 26, { fill: cancel ? P.red : P.acc, r: 13, a: bp * (t > 14 ? 1 : 0) });
    K.text(Math.round(pr * 100) + '%', 1216, 380, { size: 18, mono: true, align: 'right', color: cancel ? P.red : P.acc, a: K.p(t, 14) });
    var cb = K.back((t - 17.8) / 0.5), press = K.win(t, 19.3, 19.7, 0.1);
    if (cb > 0) K.chip('Cancel', 790, 476, { s: cb * (1 - press * 0.12), size: 18, stroke: P.red });
    K.chip('controller.abort()', 1000, 476, { mono: true, size: 16, stroke: P.warm, a: K.p(t, 18.4) });
    K.chip('xhr.abort()', 1160, 476, { mono: true, size: 16, stroke: P.warm, a: K.p(t, 18.8) });
    K.text('upload cancelled', 724, 540, { size: 18, color: P.red, a: K.p(t, 19.9) });
  } },

/* 8 ─ chunked, resumable uploads */
{ d: 26, title: 'Chunked, resumable uploads',
  caps: [
    [0.3, 'A big file over a shaky network often fails as one long request. So cut it into chunks with file.slice.'],
    [6, 'Send each chunk with its offset and a checksum, so the server can verify it and put the file back together.'],
    [12, 'If the connection drops, ask the server for the last offset it confirmed.'],
    [17, 'Then resend only the rest. The tus protocol and S3 multipart uploads work exactly like this.']],
  draw: function (K, t) {
    var P = K.P, g = K.g, S = 'hello world', C = [P.acc, P.purple, P.warm];
    K.text('greeting.txt · 11 bytes', 640, 84, { size: 18, color: P.muted, align: 'center', a: K.p(t, 0.3) });
    for (var i = 0; i < 11; i++) {
      var ch = Math.floor(i / 4), sep = K.p(t, 2, 0.6) * ch * 14, x = 304 + i * 60 + sep;
      K.box(x, 104, 54, 54, { fill: P.code, stroke: K.p(t, 2) > 0.5 ? C[ch] : P.line, r: 6, a: K.p(t, 0.5 + i * 0.05) });
      K.text(S[i] === ' ' ? '␣' : S[i], x + 27, 131, { size: 26, mono: true, align: 'center', a: K.p(t, 0.5 + i * 0.05) });
    }
    ['offset 0', 'offset 4', 'offset 8'].forEach(function (s, i) {
      K.text(s, 304 + (i * 4 + (i < 2 ? 2 : 1.5)) * 60 + i * 14, 182, { size: 16, color: C[i], align: 'center', a: K.p(t, 2.6 + i * 0.3) });
    });
    K.code(['file.slice(start, start + 4)'], 470, 206, { size: 19, a: K.p(t, 3.4) });

    K.box(40, 270, 220, 200, { stroke: P.blue, a: K.p(t, 5.6) });
    K.text('Browser', 150, 300, { size: 20, weight: 700, align: 'center', a: K.p(t, 5.6) });
    K.box(1020, 270, 220, 200, { stroke: P.green, a: K.p(t, 5.6) });
    K.text(t > 19.4 ? 'Server: file complete' : 'Server', 1130, 300, { size: t > 19.4 ? 18 : 20, weight: 700, color: t > 19.4 ? P.green : P.ink, align: 'center', a: K.p(t, 5.6) });
    var lanes = [340, 390, 440];
    var T0 = [6.4, 8.4, 11.4], drop = t > 12.6;
    lanes.forEach(function (y, i) {
      K.box(270, y - 1, 740, 2, { fill: P.line, a: K.p(t, 5.8) });
      var go = i < 2 ? K.p(t, T0[i], 1.6) : (t < 17.4 ? Math.min(K.p(t, T0[2], 2.4), 0.45) : K.p(t, 17.4, 1.4));
      var fail = i === 2 && t > 12.4 && t < 17.4;
      if (t > T0[i]) K.chip(['hell', 'o wo', 'rld'][i], 330 + go * 600, y, { mono: true, size: 17, stroke: fail ? P.red : C[i], color: fail ? P.red : P.ink, a: fail ? 1 - K.p(t, 13.4, 0.8) : 1 });
      K.text('chunk ' + (i + 1) + ' · offset ' + (i * 4), 60, y, { size: 16, color: C[i], a: K.p(t, 6 + i * 0.3) });
      if (i < 2) K.text('bytes ' + (i * 4) + '–' + (i * 4 + 4) + ' ✓', 1130, y, { size: 16, color: P.green, align: 'center', a: K.p(t, T0[i] + 1.6) });
    });
    K.text('bytes 8–11 ✓', 1130, 440, { size: 16, color: P.green, align: 'center', a: K.p(t, 18.9) });
    K.mark(640, 440, false, 1, K.win(t, 12.4, 17.2));
    K.text('connection lost', 640, 470, { size: 17, color: P.red, align: 'center', a: K.win(t, 12.6, 17.2) });
    K.arrow(270, 500, 1010, 500, { p: K.p(t, 13.8, 0.8), color: P.blue, lw: 2 });
    K.text('which offset do you have?', 640, 518, { size: 16, color: P.blue, align: 'center', a: K.p(t, 14) });
    K.arrow(1010, 548, 270, 548, { p: K.p(t, 15, 0.8), color: P.green, lw: 2 });
    K.text('confirmed up to offset 8', 640, 566, { size: 16, color: P.green, align: 'center', a: K.p(t, 15.4) });
    K.chip('tus', 150, 534, { size: 17, stroke: P.acc, a: K.p(t, 20) });
    K.chip('S3 multipart', 1130, 534, { size: 17, stroke: P.acc, a: K.p(t, 20.4) });
  } },

/* 9 ─ drag and drop, clipboard */
{ d: 26, title: 'Drag and drop, clipboard',
  caps: [
    [0.3, 'For a drop zone, call preventDefault in dragenter and dragover. Otherwise the drop event never fires.'],
    [6.5, 'In the drop handler, read event.dataTransfer.files. Keep a real file input for keyboard users.'],
    [12.5, 'navigator.clipboard.writeText copies text. It needs a secure context and a user gesture, like a click.'],
    [18.5, 'Reading the clipboard may ask for permission. The paste event gives you clipboardData without a prompt.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['["dragenter", "dragover"].forEach((type) =>', '  zone.addEventListener(type, (e) =>', '    e.preventDefault()));',
                'zone.addEventListener("drop", (e) => {', '  e.preventDefault();', '  upload([...e.dataTransfer.files]);', '});'];
    K.panel(40, 76, 640, 262, 'dropzone.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 114, { size: 18, lh: 1.42, n: K.typed(t, code, starts(code, 0.6, 50), 50), t: t, a: K.p(t, 0.2),
      hi: t > 7.4 ? 5 : t > 2.4 && t < 6.5 ? 2 : -1, w: 616 });
    var hot = K.win(t, 3.6, 7.2, 0.3), z = K.p(t, 1);
    K.box(720, 76, 520, 262, { fill: hot > 0 ? 'rgba(79,209,197,.08)' : P.card, stroke: hot > 0.5 ? P.acc : P.line, dash: [10, 8], lw: 2.5, a: z });
    K.text('Drop files here', 980, 120, { size: 20, weight: 700, color: P.muted, align: 'center', a: z });
    var m = K.p(t, 2.2, 4.6), fx = 1180 - m * 260, fy = 300 - m * 120;
    if (t > 2.2) {
      K.box(fx - 30, fy - 36, 60, 72, { fill: P.code, stroke: P.warm, r: 6, a: 1 });
      K.text('PNG', fx, fy, { size: 16, weight: 700, color: P.warm, align: 'center' });
    }
    K.text('dragover: preventDefault ✓', 980, 300, { size: 17, color: P.acc, align: 'center', a: hot });
    K.text('drop → dataTransfer.files → [cat.png]', 980, 300, { size: 17, mono: true, color: P.green, align: 'center', a: K.p(t, 7.6) });
    K.chip('or choose a file…', 1100, 240, { size: 16, stroke: P.blue, a: K.p(t, 9.6) });

    var c = ['copyBtn.addEventListener("click", async () => {', '  await navigator.clipboard.writeText(url);', '});',
             'document.addEventListener("paste", (e) => {', '  const file = e.clipboardData.files[0];', '});'];
    K.panel(40, 358, 640, 224, 'clipboard.js', { a: K.p(t, 12.6) });
    K.code(c, 64, 392, { size: 18, lh: 1.42, n: K.typed(t, c, [12.9, 14, 15.1, 18.8, 20, 21.1], 40), t: t, a: K.p(t, 12.6),
      hi: t > 18.8 ? 4 : t > 14 ? 1 : -1, w: 616 });
    K.box(720, 358, 520, 224, { stroke: P.line, a: K.p(t, 14.6) });
    [['secure context (HTTPS)', 1, 15], ['user gesture (a click)', 1, 15.8], ['readText(): may prompt', 2, 19], ['paste event: no prompt', 1, 20.6]].forEach(function (r, i) {
      var y = 400 + i * 46, q = K.p(t, r[2]);
      if (r[1] === 1) K.mark(750, y, true, 0.75, q); else K.lock(750, y + 2, 0.8, P.warm, q);
      K.text(r[0], 778, y, { size: 18, color: r[1] === 2 ? P.warm : P.ink, a: q });
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 47 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Native constraints and validity; the server validates again',
     'setCustomValidity for your errors; an empty string clears them',
     'FormData skips unchecked, disabled and unnamed fields',
     'Labels, aria-describedby, aria-invalid, focus the first error',
     'File is a Blob; revoke object URLs; never trust file.type',
     'Upload FormData without Content-Type; slice big files to resume'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 0.95, 0.5), y = 170 + i * 58;
      K.mark(230, y, true, 0.85, q);
      K.text(s, 262 - (1 - q) * 20, y, { size: 23, a: q });
    });
    K.chip('Next: run the Day 47 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
