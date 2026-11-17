/* Day 44 in motion: ArrayBuffer and typed arrays, endianness and DataView, UTF-8 and base64, Blob and bit flags, and the Intl formatters.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day44', {
  kicker: 'JavaScript: Zero to Architect · Day 44',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 44: working with raw bytes, and formatting for every locale with Intl.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Bytes and locales', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 44 · Binary data and internationalization', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Typed arrays', 'DataView and base64', 'Intl formatting'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ ArrayBuffer and typed arrays */
{ d: 25, title: 'ArrayBuffer and typed arrays',
  caps: [
    [0.3, 'An ArrayBuffer is a fixed block of raw bytes. You cannot read it directly: you look at it through a view.'],
    [6.5, 'A typed array is a view with one number type. Uint8Array sees these 4 bytes as 4 numbers from 0 to 255.'],
    [12.5, 'Uint16Array on the same buffer sees 2 numbers, and Float32Array sees 1. The views share the bytes; nothing is copied.'],
    [19, 'Typed arrays wrap on overflow: 300 becomes 44 and -1 becomes 255. Uint8ClampedArray clamps to 0 and 255 instead.']],
  draw: function (K, t) {
    var P = K.P, X0 = 330, CW = 170, hex = ['00', '00', '80', '3F'];
    var ba = K.p(t, 0.8);
    K.text('new ArrayBuffer(4)', 60, 160, { size: 21, mono: true, color: P.acc, a: ba });
    hex.forEach(function (h, i) {
      var x = X0 + i * CW, q = K.p(t, 1.2 + i * 0.3, 0.4);
      K.text('byte ' + i, x + 75, 104, { size: 16, color: P.muted, align: 'center', a: q });
      K.box(x, 120, 150, 80, { fill: P.code, stroke: P.acc, a: q });
      K.text('0x' + h, x + 75, 160, { size: 24, mono: true, align: 'center', a: q });
    });
    var dim = 1 - K.p(t, 19, 0.6) * 0.85;
    var V = [['Uint8Array', 1, ['0', '0', '128', '63'], 7, P.blue], ['Uint16Array', 2, ['0', '16256'], 13, P.purple], ['Float32Array', 4, ['1'], 14.6, P.warm]];
    V.forEach(function (v, r) {
      var y = 240 + r * 86, q = K.p(t, v[3], 0.5) * dim;
      K.text(v[0], 60, y + 34, { size: 21, mono: true, color: v[4], a: q });
      v[2].forEach(function (val, k) {
        var x = X0 + k * v[1] * CW, w = v[1] * CW - 20, qq = K.p(t, v[3] + 0.3 + k * 0.25, 0.4) * dim;
        K.box(x, y, w, 66, { stroke: v[4], a: qq });
        K.text(val, x + w / 2, y + 34, { size: 24, mono: true, align: 'center', a: qq });
      });
    });
    K.text('one buffer · three views · no copy', 640, 512, { size: 20, color: P.green, align: 'center', a: K.p(t, 16) * dim });
    K.text('(little-endian machine)', 1240, 512, { size: 16, color: P.muted, align: 'right', a: K.p(t, 16) * dim });
    var o = K.p(t, 19.4);
    K.panel(60, 330, 1160, 210, 'overflow', { a: o });
    var oc = ['new Uint8Array([300, -1, 256])     // [44, 255, 0]   wraps mod 256', 'new Uint8ClampedArray([300, -5])   // [255, 0]       clamps'];
    K.code(oc, 88, 380, { size: 21, lh: 1.9, n: K.typed(t, oc, [19.8, 22.6], 40), t: t, a: o });
    K.text('300 - 256 = 44', 88, 500, { size: 19, mono: true, color: P.warm, a: K.p(t, 21.6) });
  } },

/* 3 ─ endianness and DataView */
{ d: 23, title: 'Endianness and DataView',
  caps: [
    [0.3, 'A multi-byte number needs a byte order. Big-endian puts the most significant byte first; little-endian puts it last.'],
    [7, 'DataView reads and writes any type at any offset. setUint16(0, 0x0102) is big-endian by default: bytes 01 then 02.'],
    [13.5, 'Pass true for little-endian: 02 then 01. Typed arrays use the machine order, which is little-endian on almost every device.'],
    [19, 'So when a file format or a network protocol defines the byte order, read it with DataView.']],
  draw: function (K, t) {
    var P = K.P;
    var n = K.p(t, 0.6);
    K.box(60, 100, 360, 140, { stroke: P.acc, a: n });
    K.text('0x0102', 240, 150, { size: 40, mono: true, weight: 700, align: 'center', a: n });
    K.text('= 258 · two bytes', 240, 204, { size: 19, color: P.muted, align: 'center', a: n });
    K.text('01 = most significant', 240, 270, { size: 17, color: P.warm, align: 'center', a: K.p(t, 2.4) });
    var code = ['const dv = new DataView(new ArrayBuffer(4));', 'dv.setUint16(0, 0x0102);        // 01 02', 'dv.setUint16(2, 0x0102, true);  // 02 01'];
    K.panel(480, 90, 760, 170, 'endian.js', { a: K.p(t, 7) });
    K.code(code, 504, 132, { size: 21, n: K.typed(t, code, [7.3, 9.2, 13.8], 36), t: t, a: K.p(t, 7), hi: t > 9.2 && t < 13.5 ? 1 : t > 13.8 && t < 19 ? 2 : -1, w: 730 });
    var B = [['01', 9.8, P.warm], ['02', 10.2, P.blue], ['02', 14.6, P.blue], ['01', 15, P.warm]];
    B.forEach(function (b, i) {
      var x = 300 + i * 170, q = K.back((t - b[1]) / 0.5);
      K.text('offset ' + i, x + 75, 298, { size: 16, color: P.muted, align: 'center', a: K.p(t, 7.6) });
      K.box(x, 314, 150, 80, { fill: P.code, stroke: P.line, a: K.p(t, 7.6) });
      if (q > 0) K.chip(b[0], x + 75, 354, { s: q, mono: true, size: 26, stroke: b[2] });
    });
    K.text('big-endian (default)', 455, 420, { size: 18, color: P.warm, align: 'center', a: K.p(t, 10.6) });
    K.text('little-endian (true)', 795, 420, { size: 18, color: P.blue, align: 'center', a: K.p(t, 15.4) });
    K.chip('Uint16Array, Float32Array…: machine order = little-endian', 640, 470, { size: 18, stroke: P.purple, a: K.p(t, 16.6) });
    var H = [['magic', 160], ['version', 120], ['length', 160]], hx = 300;
    H.forEach(function (h, i) {
      var q = K.p(t, 19.4 + i * 0.4, 0.4);
      K.box(hx, 520, h[1], 56, { stroke: P.acc, a: q });
      K.text(h[0], hx + h[1] / 2, 548, { size: 18, align: 'center', a: q });
      hx += h[1] + 10;
    });
    K.text('file header', 280, 548, { size: 17, color: P.muted, align: 'right', a: K.p(t, 19.4) });
    K.text('dv.getUint32(8, false)', 770, 548, { size: 20, mono: true, color: P.green, a: K.p(t, 21) });
  } },

/* 4 ─ text and base64 */
{ d: 25, title: 'UTF-8 and base64',
  caps: [
    [0.3, 'Text becomes bytes through UTF-8. TextEncoder turns a string into bytes, and TextDecoder turns them back.'],
    [6, 'é takes 2 bytes and an emoji takes 4. So the byte length is not the string length.'],
    [12.5, 'btoa and atob only understand Latin-1 characters. btoa of an emoji throws InvalidCharacterError.'],
    [18.5, 'For Unicode, encode to UTF-8 bytes first, then base64 the bytes. Newer runtimes add toBase64 and fromBase64: feature-detect them.']],
  draw: function (K, t) {
    var P = K.P;
    K.chip('"é😀"', 130, 150, { mono: true, size: 28, stroke: P.acc, a: K.p(t, 0.6) });
    K.arrow(200, 150, 290, 150, { p: K.p(t, 1.4, 0.4), color: P.muted });
    K.text('TextEncoder', 245, 120, { size: 16, color: P.muted, align: 'center', a: K.p(t, 1.4) });
    var by = ['C3', 'A9', 'F0', '9F', '98', '80'];
    by.forEach(function (b, i) {
      var x = 310 + i * 84, q = K.back((t - 2 - i * 0.2) / 0.4), em = i >= 2;
      if (q > 0) { K.g.save(); K.g.translate(x + 38, 150); K.g.scale(q, q);
        K.box(-38, -32, 76, 64, { fill: P.code, stroke: em ? P.warm : P.blue, a: K.clamp(q) });
        K.text(b, 0, 1, { size: 22, mono: true, align: 'center', a: K.clamp(q) }); K.g.restore(); }
    });
    K.text('é: 2 bytes', 394, 210, { size: 18, color: P.blue, align: 'center', a: K.p(t, 6.4) });
    K.text('😀: 4 bytes', 730, 210, { size: 18, color: P.warm, align: 'center', a: K.p(t, 7) });
    K.arrow(830, 150, 900, 150, { p: K.p(t, 3.6, 0.4), color: P.muted });
    K.text('TextDecoder', 865, 120, { size: 16, color: P.muted, align: 'center', a: K.p(t, 3.6) });
    K.chip('"é😀"', 980, 150, { mono: true, size: 28, stroke: P.green, a: K.p(t, 4) });
    K.text('"é😀".length  →  3', 310, 262, { size: 21, mono: true, a: K.p(t, 8.4) });
    K.text('bytes.length  →  6', 720, 262, { size: 21, mono: true, color: P.warm, a: K.p(t, 9.4) });
    var b1 = K.p(t, 12.8);
    K.panel(60, 310, 1160, 110, '', { a: b1 });
    K.code(['btoa("hello")   // "aGVsbG8="'], 88, 330, { size: 21, a: b1 });
    K.code(['btoa("😀")      // InvalidCharacterError'], 88, 370, { size: 21, a: K.p(t, 14.4) });
    K.mark(1180, 344, true, 0.7, b1); K.mark(1180, 384, false, 0.7, K.p(t, 14.6));
    var F = [['"héllo 😀"', 120, P.acc], ['TextEncoder', 330, P.blue], ['bytes', 510, P.blue], ['String.fromCharCode', 720, P.blue], ['btoa', 920, P.blue], ['base64 ✓', 1100, P.green]];
    F.forEach(function (f, i) {
      var q = K.p(t, 19 + i * 0.5, 0.4);
      K.chip(f[0], f[1], 470, { mono: i !== 5, size: 18, stroke: f[2], a: q });
      if (i) K.arrow(F[i - 1][1] + (i === 1 ? 62 : i === 4 ? 112 : i === 3 ? 58 : 80), 470, f[1] - (i === 3 ? 108 : i === 4 ? 36 : i === 5 ? 64 : 76), 470, { p: q, color: P.muted, lw: 2, head: 8 });
    });
    K.chip('bytes.toBase64() · Uint8Array.fromBase64(s)', 450, 550, { mono: true, size: 18, stroke: P.purple, a: K.p(t, 22.4) });
    K.text('newer runtimes: check first', 960, 550, { size: 17, color: P.muted, a: K.p(t, 23) });
  } },

/* 5 ─ Blob and bit flags */
{ d: 25, title: 'Blob and bit flags',
  caps: [
    [0.3, 'A Blob is an immutable chunk of bytes with a MIME type. Files from inputs and drag-and-drop are Blobs too.'],
    [6.5, 'Read it with text(), arrayBuffer() or stream(). slice() returns a smaller Blob, here just world.'],
    [12.5, 'URL.createObjectURL gives a Blob a temporary URL. Call revokeObjectURL when you are done, or the memory stays in use.'],
    [18.5, 'Bitwise operators work on 32-bit integers. Bitmask flags pack many booleans into one number.']],
  draw: function (K, t) {
    var P = K.P;
    K.code(['new Blob(["hello ", "world"], { type: "text/plain" })'], 60, 100, { size: 19, n: K.typed(t, ['new Blob(["hello ", "world"], { type: "text/plain" })'], [0.6], 50), t: t });
    var s = 'hello world', sl = t > 9.6;
    for (var i = 0; i < 11; i++) {
      var x = 60 + i * 50, q = K.p(t, 1.8 + i * 0.1, 0.3), inS = sl && i >= 6;
      K.box(x, 150, 44, 56, { fill: inS ? 'rgba(104,211,145,.16)' : P.code, stroke: inS ? P.green : P.acc, r: 6, a: q });
      K.text(s[i] === ' ' ? '␣' : s[i], x + 22, 179, { size: 22, mono: true, align: 'center', a: q });
    }
    K.text('size 11 · type "text/plain"', 60, 236, { size: 18, color: P.muted, a: K.p(t, 3.4) });
    [['await blob.text()', '"hello world"', 7], ['await blob.arrayBuffer()', 'bytes [104, 101, …]', 7.8], ['blob.stream()', 'chunks', 8.6], ['blob.slice(6)', 'Blob "world"', 9.6]].forEach(function (r, k) {
      var y = 280 + k * 36, q = K.p(t, r[2], 0.4);
      K.text(r[0], 60, y, { size: 19, mono: true, a: q });
      K.text('→ ' + r[1], 340, y, { size: 19, mono: true, color: k === 3 ? P.green : P.muted, a: q });
    });
    var u = ['const url = URL.createObjectURL(blob);', 'img.src = url;  // blob:https://…', 'URL.revokeObjectURL(url);'];
    K.panel(40, 430, 600, 150, '', { a: K.p(t, 12.6) });
    K.code(u, 64, 448, { size: 19, lh: 1.6, n: K.typed(t, u, [12.9, 14.4, 16], 40), t: t, a: K.p(t, 12.6), hi: t > 16 && t < 18.5 ? 2 : -1, w: 580 });
    /* bit flags */
    var F = [['READ', 1, '001'], ['WRITE', 2, '010'], ['EXEC', 4, '100']];
    K.text('bit flags', 700, 110, { size: 20, weight: 700, color: P.acc, a: K.p(t, 18.6) });
    F.forEach(function (f, k) {
      var y = 160 + k * 52, q = K.p(t, 19 + k * 0.4, 0.4);
      K.text(f[0] + ' = ' + f[1], 700, y, { size: 21, mono: true, a: q });
      K.text(f[2], 1000, y, { size: 24, mono: true, color: P.blue, a: q });
    });
    var c = ['let perm = READ | WRITE;     // 011', '(perm & WRITE) !== 0         // true', '(perm & EXEC) === 0          // true', 'perm ^= WRITE;               // 001', '-1 >>> 0                     // 4294967295'];
    K.panel(680, 330, 560, 250, '', { a: K.p(t, 20.4) });
    K.code(c, 700, 352, { size: 18, lh: 1.6, n: K.typed(t, c, [20.6, 21.6, 22.4, 23.2, 24], 50), t: t, a: K.p(t, 20.4) });
  } },

/* 6 ─ Intl.NumberFormat */
{ d: 25, title: 'Intl.NumberFormat',
  caps: [
    [0.3, 'Formats differ by place. The same amount is $1,234.50 in the US and 1.234,50 € in Germany.'],
    [6.5, 'Intl.NumberFormat knows them all: currency, percent, units and compact notation, from locale data built into the engine.'],
    [13, 'Yen has no minor units, so no decimals appear. Compact notation turns 1200 into 1.2K, and 0.256 as a percent is 26%.'],
    [19, 'Always pass an explicit locale, and create a formatter once, then reuse it. Constructing one is slow.']],
  draw: function (K, t) {
    var P = K.P;
    K.chip('1234.5', 640, 110, { mono: true, size: 30, stroke: P.acc, a: K.p(t, 0.5) });
    var L = [['en-US · USD', '$1,234.50', 220, 1.6], ['de-DE · EUR', '1.234,50 €', 640, 3], ['ja-JP · JPY', '￥1,235', 1060, 13.4]];
    L.forEach(function (l, i) {
      var q = K.p(t, l[3], 0.5);
      K.arrow(640 + (l[2] - 640) * 0.18, 140, l[2], 196, { p: q, color: P.muted, lw: 2, head: 9 });
      K.box(l[2] - 180, 200, 360, 110, { stroke: i === 2 ? P.warm : P.acc, a: q });
      K.text(l[0], l[2], 228, { size: 17, color: P.muted, align: 'center', a: q });
      K.text(l[1], l[2], 274, { size: 32, mono: true, weight: 700, align: 'center', a: q });
    });
    K.text('JPY: no minor units, rounds', 1060, 334, { size: 16, color: P.warm, align: 'center', a: K.p(t, 14) });
    var code = ['const eur = new Intl.NumberFormat("de-DE", {', '  style: "currency", currency: "EUR",', '});', 'eur.format(1234.5);   // "1.234,50 €"'];
    K.panel(60, 360, 620, 220, 'number.js', { a: K.p(t, 6.6) });
    K.code(code, 84, 400, { size: 20, lh: 1.6, n: K.typed(t, code, [6.9, 8.3, 9.6, 10], 40), t: t, a: K.p(t, 6.6) });
    var O = [['notation: "compact"', '1200 → 1.2K', 15], ['style: "percent"', '0.256 → 26%', 16.2], ['style: "unit", unit: "kilometer-per-hour"', '50 → 50 km/h', 17.4]];
    O.forEach(function (o, i) {
      var y = 380 + i * 52, q = K.p(t, o[2], 0.4);
      K.text(o[0], 720, y, { size: 16, mono: true, color: P.muted, a: q });
      K.text(o[1], 720, y + 22, { size: 19, mono: true, color: P.green, a: q });
    });
    var r = K.p(t, 19.4);
    K.box(700, 530, 540, 52, { fill: 'rgba(104,211,145,.10)', stroke: P.green, a: r });
    K.text('explicit locale · create once, format many', 970, 556, { size: 18, align: 'center', a: r });
  } },

/* 7 ─ dates and time zones */
{ d: 25, title: 'Dates and time zones',
  caps: [
    [0.3, 'Intl.DateTimeFormat formats a date with a locale, a style and a time zone.'],
    [6.5, 'One instant, many clocks: midnight UTC on January 1, 2026 is 8 AM in Kuala Lumpur, and 7 PM the evening before in New York.'],
    [14, 'Without an explicit timeZone, the viewer\'s zone is used. So server and browser can render different text for the same date.'],
    [19.5, 'Offsets change over history and with daylight saving. Use IANA names like Asia/Kuala_Lumpur, never fixed offsets.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['new Intl.DateTimeFormat("en-US", {', '  dateStyle: "medium", timeZone: "UTC",', '}).format(new Date(0));   // "Jan 1, 1970"'];
    K.panel(60, 90, 700, 160, 'date.js', { a: K.p(t, 0.2) });
    K.code(code, 84, 132, { size: 20, lh: 1.55, n: K.typed(t, code, [0.6, 1.8, 3.2], 36), t: t });
    K.chip('2026-01-01T00:00:00Z', 1010, 140, { mono: true, size: 20, stroke: P.acc, a: K.p(t, 6.8) });
    K.text('one instant', 1010, 190, { size: 16, color: P.muted, align: 'center', a: K.p(t, 6.8) });
    var C = [['UTC', 0, 'Jan 1 · 00:00', 7.6], ['Asia/Kuala_Lumpur', 8, 'Jan 1 · 08:00', 8.6], ['America/New_York', 19, 'Dec 31 · 19:00', 9.6]];
    C.forEach(function (c, i) {
      var x = 210 + i * 420, y = 360, q = K.p(t, c[3], 0.5);
      K.arrow(1010, 210, x, 292, { p: q, color: P.line, lw: 2, head: 8 });
      g.save(); g.globalAlpha *= q; g.fillStyle = P.card; g.strokeStyle = i === 2 ? P.warm : P.acc; g.lineWidth = 3;
      g.beginPath(); g.arc(x, y, 52, 0, 7); g.fill(); g.stroke();
      var ha = (c[1] % 12) / 12 * Math.PI * 2 - Math.PI / 2; g.strokeStyle = P.ink; g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ha) * 28, y + Math.sin(ha) * 28); g.stroke();
      g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 40); g.stroke(); g.restore();
      K.text(c[0], x, 436, { size: 18, mono: true, align: 'center', a: q });
      K.text(c[2], x, 466, { size: 20, weight: 700, align: 'center', color: i === 2 ? P.warm : P.ink, a: q });
    });
    var s = K.win(t, 14.2, 19.6);
    K.box(60, 500, 560, 80, { stroke: P.blue, a: s }); K.text('server (UTC): "Jan 1, 2026"', 340, 540, { size: 20, mono: true, align: 'center', a: s });
    K.box(660, 500, 560, 80, { stroke: P.red, a: s }); K.text('browser (New York): "Dec 31, 2025"', 940, 540, { size: 20, mono: true, color: P.red, align: 'center', a: K.p(t, 15.4) * s });
    var h = K.p(t, 19.8);
    K.box(60, 500, 1160, 80, { stroke: P.warm, a: h });
    K.text('Malaysia: UTC+7:30 until 1982, UTC+8 today', 90, 540, { size: 20, a: h });
    K.chip('timeZone: "Asia/Kuala_Lumpur"', 1030, 540, { mono: true, size: 18, stroke: P.green, a: K.p(t, 21) });
  } },

/* 8 ─ plurals, lists and relative time */
{ d: 25, title: 'Plurals, lists, relative time',
  caps: [
    [0.3, 'n === 1 ? "item" : "items" is wrong for many languages. English has two plural forms; Russian has one, few, many and other.'],
    [7.5, 'Intl.PluralRules tells you the category for a number. Use it to pick the matching full message.'],
    [13.5, 'ListFormat writes "a, b, and c" in English and "a, b et c" in French. RelativeTimeFormat writes "yesterday" and "in 3 days".'],
    [19.5, 'Never glue translated fragments together, because word order changes between languages. Use full-sentence templates.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('n === 1 ? "item" : "items"', 60, 110, { size: 22, mono: true, a: K.p(t, 0.6) });
    K.mark(450, 110, false, 0.8, K.p(t, 1.6));
    var R = [['1', 'one', '1 файл', 'one'], ['2', 'other', '2 файла', 'few'], ['5', 'other', '5 файлов', 'many'], ['21', 'other', '21 файл', 'one']];
    var ta = K.p(t, 2.4);
    K.text('n', 90, 170, { size: 17, color: P.muted, align: 'center', a: ta });
    K.text('en', 220, 170, { size: 17, color: P.muted, align: 'center', a: ta });
    K.text('ru', 450, 170, { size: 17, color: P.muted, align: 'center', a: ta });
    R.forEach(function (r, i) {
      var y = 206 + i * 42, q = K.p(t, 3 + i * 0.6, 0.4);
      K.text(r[0], 90, y, { size: 22, mono: true, align: 'center', a: q });
      K.chip(r[1], 220, y, { mono: true, size: 18, stroke: P.blue, a: q });
      K.text(r[2], 400, y, { size: 21, a: q });
      K.chip(r[3], 560, y, { mono: true, size: 18, stroke: r[3] === 'one' ? P.green : P.warm, a: q });
    });
    var code = ['const rules = new Intl.PluralRules("ru");', 'rules.select(2);   // "few"', 'const msg = { one: "# файл",', '  few: "# файла", many: "# файлов" };', 'msg[rules.select(n)].replace("#", n);'];
    K.panel(660, 90, 580, 220, 'plural.js', { a: K.p(t, 7.6) });
    K.code(code, 684, 130, { size: 19, lh: 1.5, n: K.typed(t, code, [7.9, 9.2, 10.4, 11.2, 12.2], 40), t: t, a: K.p(t, 7.6) });
    var L = [['ListFormat("en")', '"a, b, and c"', 14], ['ListFormat("fr")', '"a, b et c"', 14.8], ['RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "day")', '"yesterday"', 16], ['RelativeTimeFormat("en").format(3, "day")', '"in 3 days"', 17]];
    L.forEach(function (l, i) {
      var y = 382 + i * 36, q = K.p(t, l[2], 0.4) * (1 - K.p(t, 19.5, 0.5) * 0.7);
      K.text(l[0], 60, y, { size: 18, mono: true, color: P.muted, a: q });
      K.text(l[1], 1240, y, { size: 20, mono: true, color: P.green, align: 'right', a: q });
    });
    var bad = K.p(t, 19.8);
    K.box(60, 510, 560, 70, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: bad });
    K.text('"You have " + n + " " + t("files")', 340, 545, { size: 18, mono: true, align: 'center', a: bad });
    K.box(660, 510, 580, 70, { fill: 'rgba(104,211,145,.10)', stroke: P.green, a: K.p(t, 20.8) });
    K.text('t("files", { count: n })  // whole sentence', 950, 545, { size: 18, mono: true, align: 'center', a: K.p(t, 20.8) });
  } },

/* 9 ─ sorting, segmenting and the rest */
{ d: 23, title: 'Collator, Segmenter and the rest',
  caps: [
    [0.3, 'The default sort compares UTF-16 code units, so ä lands after z. Intl.Collator sorts by the rules of the language.'],
    [7, 'Intl.Segmenter splits text into graphemes, words or sentences. One thumbs-up emoji is 4 code units but 1 grapheme.'],
    [13.5, 'Plan for right-to-left layouts, longer translations and lazy-loaded catalogs. Store data neutrally, and format only for display.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('["z", "ä", "a"].sort()', 60, 110, { size: 21, mono: true, a: K.p(t, 0.6) });
    var mv = K.p(t, 4.6, 0.8);
    var A = { a: [0, 0], 'ä': [2, 1], z: [1, 2] };
    Object.keys(A).forEach(function (k) {
      var p1 = A[k][0], p2 = A[k][1];
      K.chip(k, 600 + p1 * 80, 110, { size: 24, mono: true, stroke: P.red, a: K.p(t, 1.6) });
      K.chip(k, 600 + p2 * 80, 180, { size: 24, mono: true, stroke: P.green, a: K.p(t, 4 + p2 * 0.4, 0.4) });
    });
    K.mark(860, 110, false, 0.8, K.p(t, 2.2));
    K.text('.sort(new Intl.Collator("de").compare)', 60, 180, { size: 21, mono: true, a: K.p(t, 3.6) });
    K.mark(860, 180, true, 0.8, K.p(t, 5.6));
    K.text('a ä z: German rules', 900, 180, { size: 18, color: P.green, a: K.p(t, 5.8) });
    K.text('"👍🏽".length', 60, 270, { size: 22, mono: true, a: K.p(t, 7.4) });
    K.text('→ 4', 330, 270, { size: 22, mono: true, color: P.warm, a: K.p(t, 8) });
    K.text('graphemes', 520, 270, { size: 22, mono: true, a: K.p(t, 9) });
    K.text('→ 1', 680, 270, { size: 22, mono: true, color: P.green, a: K.p(t, 9.6) });
    var seg = ['Hello', ' ', 'big', ' ', 'world'], sx = 60;
    seg.forEach(function (s, i) {
      var w = s === ' ' ? 30 : s.length * 16 + 30, q = K.p(t, 10.2 + i * 0.3, 0.4);
      K.box(sx, 310, w, 48, { stroke: s === ' ' ? P.line : P.blue, dash: s === ' ' ? [4, 4] : null, a: q, r: 8 });
      K.text(s === ' ' ? '·' : s, sx + w / 2, 335, { size: 20, mono: true, align: 'center', a: q });
      sx += w + 10;
    });
    K.text('granularity: "word" → 3 word-like segments', 470, 335, { size: 18, color: P.muted, a: K.p(t, 11.4) });
    var C = [['RTL: dir="rtl" + logical CSS', P.blue], ['German text runs longer', P.purple], ['lazy-load translation catalogs', P.acc], ['store numbers, ISO dates, UTC', P.green]];
    C.forEach(function (c, i) {
      var x = 340 + (i % 2) * 600, y = 440 + Math.floor(i / 2) * 76;
      K.chip(c[0], x, y, { size: 20, stroke: c[1], a: K.p(t, 13.8 + i * 0.7, 0.4) });
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 44 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['ArrayBuffer holds bytes; typed arrays are views that wrap on overflow',
     'DataView picks the byte order; typed arrays use the machine\'s',
     'UTF-8 through TextEncoder before base64; free Blob URLs',
     'Intl formats numbers, dates, plurals, lists and sort order per locale',
     'Explicit locale and time zone; store neutral data, format at the edge'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(190, y, true, 0.9, q);
      K.text(s, 222 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 44 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
