/* ألواني - حسابات الألوان */
var AC = (function () {
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function normHex(s) {
    s = String(s || '').replace(/[^0-9a-fA-F]/g, '');
    if (s.length === 3) s = s.charAt(0) + s.charAt(0) + s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2);
    if (s.length !== 6) return null;
    return '#' + s.toUpperCase();
  }
  function hexToRgb(h) {
    h = normHex(h) || '#000000';
    return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)];
  }
  function rgbToHex(c) {
    var s = '#';
    for (var i = 0; i < 3; i++) {
      var v = Math.round(clamp(c[i], 0, 255)).toString(16).toUpperCase();
      s += v.length < 2 ? '0' + v : v;
    }
    return s;
  }

  // sRGB <-> OKLab
  function toLin(v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function fromLin(v) { return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055); }
  function rgbToLab(c) {
    var r = toLin(c[0]), g = toLin(c[1]), b = toLin(c[2]);
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  }
  function labToLinRgb(L) {
    var l = L[0] + 0.3963377774 * L[1] + 0.2158037573 * L[2];
    var m = L[0] - 0.1055613458 * L[1] - 0.0638541728 * L[2];
    var s = L[0] - 0.0894841775 * L[1] - 1.2914855480 * L[2];
    l = l * l * l; m = m * m * m; s = s * s * s;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
  }
  function inGamut(c) { var e = 0.0005; return c[0] >= -e && c[0] <= 1 + e && c[1] >= -e && c[1] <= 1 + e && c[2] >= -e && c[2] <= 1 + e; }
  function lchToRgb(L, C, h) {
    var a = h * Math.PI / 180, lo = 0, hi = C, lin = labToLinRgb([L, C * Math.cos(a), C * Math.sin(a)]);
    if (!inGamut(lin)) {
      for (var i = 0; i < 14; i++) {
        var mid = (lo + hi) / 2;
        lin = labToLinRgb([L, mid * Math.cos(a), mid * Math.sin(a)]);
        if (inGamut(lin)) lo = mid; else hi = mid;
      }
      lin = labToLinRgb([L, lo * Math.cos(a), lo * Math.sin(a)]);
    }
    return [fromLin(clamp(lin[0], 0, 1)), fromLin(clamp(lin[1], 0, 1)), fromLin(clamp(lin[2], 0, 1))];
  }
  function hexToLch(hex) {
    var lab = rgbToLab(hexToRgb(hex));
    var h = Math.atan2(lab[2], lab[1]) * 180 / Math.PI;
    return [lab[0], Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]), h < 0 ? h + 360 : h];
  }
  function lchToHex(L, C, h) { return rgbToHex(lchToRgb(clamp(L, 0, 1), Math.max(0, C), ((h % 360) + 360) % 360)); }

  function lum(hex) {
    var c = hexToRgb(hex);
    return 0.2126 * toLin(c[0]) + 0.7152 * toLin(c[1]) + 0.0722 * toLin(c[2]);
  }
  function contrast(a, b) {
    var x = lum(a), y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  function onColor(hex) { return contrast(hex, '#FFFFFF') >= contrast(hex, '#111111') ? '#FFFFFF' : '#111111'; }
  function mix(a, b, t) {
    var x = hexToRgb(a), y = hexToRgb(b);
    return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
  }
  function naiveCmyk(hex) {
    var c = hexToRgb(hex), r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, k = 1 - Math.max(r, g, b);
    if (k >= 0.999) return [0, 0, 0, 100];
    return [Math.round(100 * (1 - r - k) / (1 - k)), Math.round(100 * (1 - g - k) / (1 - k)), Math.round(100 * (1 - b - k) / (1 - k)), Math.round(100 * k)];
  }

  // درجات اللون: الأصل في الوسط، أفتح قبله وأغمق بعده
  function tones(hex, n) {
    var b = hexToLch(hex), out = [], mid = (n - 1) / 2;
    for (var i = 0; i < n; i++) {
      if (i === mid) { out.push(normHex(hex)); continue; }
      var t, L, C;
      if (i < mid) { t = (mid - i) / mid; L = b[0] + (Math.max(0.97, b[0]) - b[0]) * Math.pow(t, 0.9); C = b[1] * (1 - 0.86 * t); }
      else { t = (i - mid) / mid; L = b[0] + (Math.min(0.17, b[0]) - b[0]) * t; C = b[1] * (1 - 0.45 * t); }
      out.push(lchToHex(L, C, b[2]));
    }
    return out;
  }

  function dist(a, b) {
    var x = rgbToLab(hexToRgb(a)), y = rgbToLab(hexToRgb(b));
    return Math.sqrt(Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2));
  }

  // اقتراح ألوان ثانوية من اللون الأساسي
  function suggest(mainHexes, have) {
    if (!mainHexes.length) return [];
    var b = hexToLch(mainHexes[0]), C = Math.max(b[1], 0.06), L = clamp(b[0], 0.45, 0.75);
    var cand = [
      lchToHex(L, C * 0.9, b[2] + 180),
      lchToHex(clamp(L + 0.12, 0, 0.85), C * 0.8, b[2] + 35),
      lchToHex(clamp(L - 0.1, 0.3, 1), C * 0.85, b[2] - 35),
      lchToHex(0.95, 0.012, b[2]),
      lchToHex(0.26, 0.025, b[2]),
      lchToHex(L, C * 0.75, b[2] + 120)
    ];
    var taken = mainHexes.concat(have || []), out = [];
    for (var i = 0; i < cand.length && out.length < 4; i++) {
      var ok = true;
      for (var j = 0; j < taken.length; j++) if (dist(cand[i], taken[j]) < 0.07) { ok = false; break; }
      if (ok) { out.push(cand[i]); taken.push(cand[i]); }
    }
    return out;
  }

  // استخراج الألوان الغالبة من بيانات صورة (RGBA)
  function dominant(data, want) {
    var bins = {}, keys = [], i, k;
    for (i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      k = (data[i] >> 3) << 10 | (data[i + 1] >> 3) << 5 | (data[i + 2] >> 3);
      var b = bins[k];
      if (!b) { b = bins[k] = [0, 0, 0, 0]; keys.push(k); }
      b[0] += data[i]; b[1] += data[i + 1]; b[2] += data[i + 2]; b[3]++;
    }
    var pts = [];
    for (i = 0; i < keys.length; i++) {
      var q = bins[keys[i]];
      var lab = rgbToLab([q[0] / q[3], q[1] / q[3], q[2] / q[3]]);
      pts.push({ l: lab, w: q[3] });
    }
    if (!pts.length) return [];
    pts.sort(function (a, b) { return b.w - a.w; });
    if (pts.length > 4000) pts = pts.slice(0, 4000);
    var K = Math.min(pts.length, want + 4), cen = [pts[0].l.slice()];
    function d2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]); }
    while (cen.length < K) { // أبعد نقطة (موزونة) عن المراكز الحالية
      var best = -1, bi = 0;
      for (i = 0; i < pts.length; i++) {
        var m = 1e9;
        for (k = 0; k < cen.length; k++) m = Math.min(m, d2(pts[i].l, cen[k]));
        var sc = m * Math.sqrt(pts[i].w);
        if (sc > best) { best = sc; bi = i; }
      }
      cen.push(pts[bi].l.slice());
    }
    var wsum = [];
    for (var it = 0; it < 12; it++) {
      var acc = [];
      for (k = 0; k < K; k++) acc.push([0, 0, 0, 0]);
      for (i = 0; i < pts.length; i++) {
        var mn = 1e9, mk = 0;
        for (k = 0; k < K; k++) { var dd = d2(pts[i].l, cen[k]); if (dd < mn) { mn = dd; mk = k; } }
        var a = acc[mk], w = pts[i].w;
        a[0] += pts[i].l[0] * w; a[1] += pts[i].l[1] * w; a[2] += pts[i].l[2] * w; a[3] += w;
      }
      wsum = [];
      for (k = 0; k < K; k++) {
        if (acc[k][3] > 0) cen[k] = [acc[k][0] / acc[k][3], acc[k][1] / acc[k][3], acc[k][2] / acc[k][3]];
        wsum.push(acc[k][3]);
      }
    }
    var res = [];
    for (k = 0; k < K; k++) {
      var lin = labToLinRgb(cen[k]);
      res.push({ hex: rgbToHex([fromLin(clamp(lin[0], 0, 1)), fromLin(clamp(lin[1], 0, 1)), fromLin(clamp(lin[2], 0, 1))]), w: wsum[k], c: Math.sqrt(cen[k][1] * cen[k][1] + cen[k][2] * cen[k][2]) });
    }
    // الأولوية للحضور مع ترجيح بسيط للألوان المشبعة
    res.sort(function (a, b) { return b.w * (0.4 + b.c * 4) - a.w * (0.4 + a.c * 4); });
    var out = [];
    for (i = 0; i < res.length && out.length < want; i++) {
      if (!res[i].w) continue;
      var dup = false;
      for (k = 0; k < out.length; k++) if (dist(out[k], res[i].hex) < 0.09) { dup = true; break; }
      if (!dup) out.push(res[i].hex);
    }
    return out;
  }

  // اسم تقريبي للون
  var NAMES = {
    ar: { black: 'أسود', white: 'أبيض', gray: 'رمادي', red: 'أحمر', orange: 'برتقالي', brown: 'بني', yellow: 'أصفر', green: 'أخضر', teal: 'فيروزي', blue: 'أزرق', purple: 'بنفسجي', pink: 'وردي', light: 'فاتح', dark: 'داكن', beige: 'بيج' },
    en: { black: 'Black', white: 'White', gray: 'Gray', red: 'Red', orange: 'Orange', brown: 'Brown', yellow: 'Yellow', green: 'Green', teal: 'Teal', blue: 'Blue', purple: 'Purple', pink: 'Pink', light: 'Light', dark: 'Dark', beige: 'Beige' }
  };
  function nameOf(hex, lang) {
    var N = NAMES[lang] || NAMES.ar, c = hexToLch(hex), L = c[0], C = c[1], h = c[2], base;
    if (L < 0.22 && C < 0.05) return N.black;
    if (L > 0.96 && C < 0.03) return N.white;
    if (C < 0.03) base = N.gray;
    else if (C < 0.07 && L > 0.8 && h > 40 && h < 115) return N.beige;
    else if (h < 20 || h >= 345) base = L > 0.72 ? N.pink : N.red;
    else if (h < 38) base = N.red;
    else if (h < 75) base = (L < 0.58) ? N.brown : N.orange;
    else if (h < 112) base = (L < 0.5) ? N.brown : N.yellow;
    else if (h < 170) base = N.green;
    else if (h < 215) base = N.teal;
    else if (h < 285) base = N.blue;
    else if (h < 325) base = N.purple;
    else base = N.pink;
    var mod = L > 0.82 ? N.light : L < 0.42 ? N.dark : '';
    if (!mod || base === N.brown) return base;
    return lang === 'en' ? mod + ' ' + base : base + ' ' + mod;
  }

  return { normHex: normHex, hexToRgb: hexToRgb, rgbToHex: rgbToHex, hexToLch: hexToLch, lchToHex: lchToHex, contrast: contrast, onColor: onColor, mix: mix, naiveCmyk: naiveCmyk, tones: tones, suggest: suggest, dominant: dominant, nameOf: nameOf, dist: dist };
})();
if (typeof module !== 'undefined') module.exports = AC;
