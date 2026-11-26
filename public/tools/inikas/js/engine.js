/* Inikas engine — pure pixel maths, no DOM.
 * Loaded by the panel (window.InikasEngine) and by the Node tests (module.exports).
 *
 * Pipeline
 *   analyze()   on a small copy of the layer (<= 480 px): where does every column touch the ground?
 *   contact()   contact line for the current settings (small copy)
 *   fadeLen()   fade length per column (small copy)
 *   upsample()  the same decisions carried to the full-resolution layer, snapped to its real edge
 *   warp()      mirror every column around its own contact point
 *   crop()      tight crop, so the picture's own rectangle is exactly its visible content
 *
 * Every decision is taken on the small copy, so the preview and the applied result can never disagree.
 * "Contact" values are continuous y coordinates of the boundary under the last opaque row.
 */
(function (root, factory) {
  var api = factory();
  // In the panel Node's `module` exists too (mixed context), so always publish on window as well.
  if (typeof window !== 'undefined') window.InikasEngine = api;
  else if (root) root.InikasEngine = api;
  if (typeof module === 'object' && module && module.exports) { try { module.exports = api; } catch (e) {} }
})(this, function () {
  'use strict';

  var OPQ = 200;   // alpha above this is "solid" (ignores baked soft shadows and glows)

  // ---------------------------------------------------------------- column scan
  function scan(d, w, h, minRun) {
    var cb = new Float32Array(w), ytop = new Float32Array(w), run = new Float32Array(w), x, y;
    for (x = 0; x < w; x++) {
      var opq = 0, found = -1;
      for (y = h - 1; y >= 0; y--) {
        if (d[(y * w + x) * 4 + 3] > OPQ) { if (++opq >= minRun) { found = y + minRun - 1; break; } } else opq = 0;
      }
      if (found < 0) { cb[x] = -1; ytop[x] = -1; run[x] = 0; continue; }
      var below = found + 1 < h ? d[((found + 1) * w + x) * 4 + 3] / 255 : 0;
      cb[x] = found + 1 + Math.min(0.99, below);
      var n = 0;
      for (y = found; y >= 0 && d[(y * w + x) * 4 + 3] > OPQ; y--) n++;
      run[x] = n;
      for (y = 0; y < h; y++) if (d[(y * w + x) * 4 + 3] > OPQ) break;
      ytop[x] = y;
    }
    return { cb: cb, ytop: ytop, run: run };
  }

  // ---------------------------------------------------------------- real edge vs hanging parts
  // A column either stands on the ground (its lower edge is a real contact) or hangs above it:
  // the slanted side of a can, a lug, a wire handle. Hanging columns take the level of the
  // base next to them, so their reflection is mirrored around the floor and not around themselves.
  function resolveEdge(cb, run, w, h, shape) {
    var steep = 2.5;
    var minW = Math.max(4, Math.round(w * 0.04));
    var tolH = Math.max(1.5, h * 0.008);
    var reach = Math.max(6, Math.round(w * 0.07));
    var secOf = new Int32Array(w), secs = [], cur = null, x, i, s;
    for (x = 0; x < w; x++) {
      secOf[x] = -1;
      if (cb[x] < 0) { cur = null; continue; }
      if (!cur || Math.abs(cb[x] - cb[x - 1]) > steep) { cur = { a: x, b: x }; secs.push(cur); } else cur.b = x;
      secOf[x] = secs.length - 1;
    }
    // wide, smooth stretches are bases; they are the only reference levels (no chain reactions)
    var sup = new Uint8Array(w), level = new Float32Array(w), yL = new Float32Array(w), yR = new Float32Array(w);
    for (i = 0; i < secs.length; i++) { s = secs[i]; s.n = s.b - s.a + 1; if (s.n >= minW) for (x = s.a; x <= s.b; x++) sup[x] = 1; }
    // level of the nearest base on each side: carried along anything attached to it (a slanted side of
    // any length) and across small empty gaps (a wire handle next to the body), but not further
    var last = -1, gapRun = 0;
    for (x = 0; x < w; x++) {
      if (cb[x] < 0) { if (++gapRun > reach) last = -1; } else { gapRun = 0; if (sup[x]) last = cb[x]; }
      yL[x] = last;
    }
    last = -1; gapRun = 0;
    for (x = w - 1; x >= 0; x--) {
      if (cb[x] < 0) { if (++gapRun > reach) last = -1; } else { gapRun = 0; if (sup[x]) last = cb[x]; }
      yR[x] = last;
    }
    for (x = 0; x < w; x++) level[x] = -1;
    for (i = 0; i < secs.length; i++) {
      s = secs[i];
      if (s.n >= minW) continue;
      var tall = false;
      if (s.n >= 3) {   // a narrow but tall, smooth strip can be a product of its own seen between two others
        var sum = 0, rr = [];
        for (x = s.a; x <= s.b; x++) { sum += cb[x]; rr.push(run[x]); }
        var mean = sum / s.n;
        rr.sort(function (p, q) { return p - q; });
        var both = yL[s.a] >= 0 && yR[s.b] >= 0 && yL[s.a] > mean + tolH && yR[s.b] > mean + tolH;
        tall = rr[rr.length >> 1] >= h * 0.15 && (both || shape === 'multi');
      }
      for (x = s.a; x <= s.b; x++) {
        if (tall) { sup[x] = 1; continue; }
        var lowL = yL[x] >= 0 && yL[x] > cb[x] + tolH, lowR = yR[x] >= 0 && yR[x] > cb[x] + tolH;
        if (lowL || lowR) level[x] = (lowL && lowR) ? Math.min(yL[x], yR[x]) : (lowL ? yL[x] : yR[x]);
        else sup[x] = 1;
      }
    }
    var C = new Float32Array(w);
    for (x = 0; x < w; x++) C[x] = cb[x] < 0 ? -1 : (sup[x] ? cb[x] : level[x]);
    return { C: C, sup: sup, secOf: secOf };
  }

  // nearest valid neighbour fills the gaps (value < 0 means "missing")
  function fillGaps(a) {
    var w = a.length, x, lastX = -1, L = new Int32Array(w), R = new Int32Array(w);
    for (x = 0; x < w; x++) { if (a[x] >= 0) lastX = x; L[x] = lastX; }
    lastX = -1;
    for (x = w - 1; x >= 0; x--) { if (a[x] >= 0) lastX = x; R[x] = lastX; }
    for (x = 0; x < w; x++) {
      if (a[x] >= 0) continue;
      var l = L[x], r = R[x];
      if (l < 0 && r < 0) { a[x] = 0; continue; }
      a[x] = l < 0 ? a[r] : (r < 0 ? a[l] : ((x - l) <= (r - x) ? a[l] : a[r]));
    }
    return a;
  }

  // ---------------------------------------------------------------- ground model (line or front arc of an ellipse)
  function solve3(A, v) {
    var m = [A[0].concat(v[0]), A[1].concat(v[1]), A[2].concat(v[2])], i, j, k;
    for (i = 0; i < 3; i++) {
      var mx = i;
      for (j = i + 1; j < 3; j++) if (Math.abs(m[j][i]) > Math.abs(m[mx][i])) mx = j;
      var tmp = m[i]; m[i] = m[mx]; m[mx] = tmp;
      if (Math.abs(m[i][i]) < 1e-12) return null;
      for (j = 0; j < 3; j++) if (j !== i) {
        var f = m[j][i] / m[i][i];
        for (k = i; k < 4; k++) m[j][k] -= f * m[i][k];
      }
    }
    return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
  }
  function model(f, x) {
    var u = Math.max(-1, Math.min(1, (x - f.cx) / f.hw));
    return f.c0 + f.c1 * (x - f.cx) - f.b * (1 - Math.sqrt(1 - u * u));
  }
  function fitOnce(xs, ys, wts, cx, hw, useArc) {
    var A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], v = [0, 0, 0], n = xs.length, i, a, c;
    for (i = 0; i < n; i++) {
      var wt = wts[i]; if (!wt) continue;
      var u = Math.max(-1, Math.min(1, (xs[i] - cx) / hw));
      var row = [1, xs[i] - cx, useArc ? -(1 - Math.sqrt(1 - u * u)) : 0];
      for (a = 0; a < 3; a++) { v[a] += wt * row[a] * ys[i]; for (c = 0; c < 3; c++) A[a][c] += wt * row[a] * row[c]; }
    }
    if (!useArc) { A[2][2] = 1; v[2] = 0; }
    var s = solve3(A, v);
    return s ? { c0: s[0], c1: s[1], b: s[2], cx: cx, hw: hw } : null;
  }
  function fitGround(xs, ys, w, h, useArc) {
    var n = xs.length, wts = new Float32Array(n), B = -1, i, it, k;
    for (i = 0; i < n; i++) if (ys[i] > B) B = ys[i];
    for (i = 0; i < n; i++) wts[i] = ys[i] >= B - h * 0.5 ? 1 : 0;
    var tol = Math.max(1.5, h * 0.012), cx = w / 2, hw = w / 2, fit = null;
    for (it = 0; it < 8; it++) {
      fit = fitOnce(xs, ys, wts, cx, hw, useArc);
      if (!fit) return null;
      if (useArc && fit.b < 0) fit.b = 0;
      var lo = Infinity, hi = -Infinity;
      for (k = 0; k < n; k++) {
        var r = ys[k] - model(fit, xs[k]);
        wts[k] = r < -tol ? 0.02 : (r > tol ? 4 : 1);          // lower envelope: what hangs above barely counts
        if (r >= -tol) { if (xs[k] < lo) lo = xs[k]; if (xs[k] > hi) hi = xs[k]; }
      }
      if (hi > lo) { cx = (lo + hi) / 2; hw = Math.max(2, (hi - lo) / 2); }
    }
    fit.cx = cx; fit.hw = hw;
    var err = 0, cnt = 0, maxBelow = 0;
    for (k = 0; k < n; k++) {
      var q = ys[k] - model(fit, xs[k]);
      if (q >= -tol) { err += q * q; cnt++; if (q > maxBelow) maxBelow = q; }
    }
    fit.c0 += Math.min(maxBelow, tol);
    fit.rms = cnt ? Math.sqrt(err / cnt) : 0;
    return fit;
  }

  // ---------------------------------------------------------------- analysis of the small copy
  // shape: 'auto' | 'single' (bridge gaps between feet) | 'multi' (every product keeps its own base)
  function analyze(d, w, h, shape) {
    var sc = scan(d, w, h, 2), re = resolveEdge(sc.cb, sc.run, w, h, shape), x;
    var xs = [], ys = [];
    for (x = 0; x < w; x++) if (re.C[x] >= 0) { xs.push(x); ys.push(re.C[x]); }
    var base = { w: w, h: h, cb: sc.cb, ytop: sc.ytop, sup: re.sup, secOf: re.secOf, edgeC: re.C,
                 bridge: new Uint8Array(w), multi: false, cyl: false, ratio: 0, tiltDeg: 0, floating: 0, model: null, empty: xs.length < 6 };
    if (base.empty) { fillGaps(base.edgeC); return base; }
    var line = fitGround(xs, ys, w, h, false), arc = fitGround(xs, ys, w, h, true), use;
    if (!arc) use = line; else if (!line) use = arc;
    else use = (arc.b / arc.hw > 0.035 && arc.rms < line.rms * 0.8) ? arc : line;
    if (!use) { fillGaps(base.edgeC); return base; }
    base.model = use;
    base.cyl = use === arc && use.b > 0;
    base.ratio = use.b / use.hw;
    base.tiltDeg = Math.atan(use.c1) * 180 / Math.PI;

    // columns that float clearly above the fitted ground
    var ftol = Math.max(3, h * 0.03), st = new Uint8Array(w), total = 0;   // 0 empty, 1 touching, 2 floating
    for (x = 0; x < w; x++) {
      if (re.C[x] < 0) continue;
      total++;
      st[x] = re.C[x] < model(use, x) - ftol ? 2 : 1;
    }
    // each floating stretch: is it a gap under one object (bridge it) or another product (leave it)?
    var unbridged = 0, a = 0;
    while (a < w) {
      if (st[a] !== 2) { a++; continue; }
      var b = a; while (b + 1 < w && st[b + 1] !== 1) b++;
      while (b > a && st[b] !== 2) b--;
      var n = 0, k; for (k = a; k <= b; k++) if (st[k] === 2) n++;
      var wl = 0, wr = 0;
      k = a - 1; while (k >= 0 && st[k] === 0) k--;
      while (k >= 0 && st[k] === 1) { wl++; k--; }
      k = b + 1; while (k < w && st[k] === 0) k++;
      while (k < w && st[k] === 1) { wr++; k++; }
      var bracketed = wl > 0 && wr > 0;
      // 'single': one object, everything that floats is mirrored around its ground line.
      // 'auto': only a gap that sits between narrower feet (table, sofa, car) is bridged.
      var doBridge = shape === 'multi' ? false : (shape === 'single' ? true : (bracketed && Math.max(wl, wr) < 0.8 * (b - a + 1)));
      if (doBridge) { for (k = a; k <= b; k++) if (st[k] === 2) base.bridge[k] = 1; } else unbridged += n;
      a = b + 1;
    }
    base.floating = total ? unbridged / total : 0;
    base.multi = base.floating > 0.2;
    fillGaps(base.edgeC);
    return base;
  }

  // ---------------------------------------------------------------- contact line for the current settings
  // Returns { C, snap }: snap[x] = 1 where C follows the object's real edge.
  function contact(base, p) {
    var w = base.w, C = new Float32Array(w), snap = new Uint8Array(w), x;
    var tiltFix = p.tiltFix || 0, curvFix = p.curvFix === undefined ? 100 : p.curvFix;
    var adjusted = curvFix !== 100 || tiltFix !== 0, tk = Math.tan(tiltFix * Math.PI / 180), m = base.model, f = null;
    if (m) f = { c0: m.c0, c1: Math.tan(Math.atan(m.c1) + tiltFix * Math.PI / 180), b: m.b * curvFix / 100, cx: m.cx, hw: m.hw };
    for (x = 0; x < w; x++) {
      var real = base.cb[x] >= 0 && base.sup[x];
      if (!f || base.multi) { C[x] = base.edgeC[x] + tk * (x - w / 2); snap[x] = real && !tiltFix ? 1 : 0; }
      else if (adjusted || base.bridge[x]) { C[x] = model(f, x); snap[x] = 0; }
      else { C[x] = base.edgeC[x]; snap[x] = real ? 1 : 0; }
    }
    return { C: C, snap: snap };
  }

  // ---------------------------------------------------------------- fade length per column
  // Several products: each one fades over a share of its own height. One object: share of the whole height.
  function fadeLen(base, C, p) {
    var w = base.w, FL = new Float32Array(w), s = Math.max(0.01, p.squash / 100), L = p.length / 100, x, k;
    if (!base.multi) { for (x = 0; x < w; x++) FL[x] = Math.max(1, L * base.h * s); return FL; }
    var H = new Float32Array(w), bySec = {};
    for (x = 0; x < w; x++) {
      H[x] = -1;
      if (base.cb[x] >= 0 && base.sup[x] && base.ytop[x] >= 0) { (bySec[base.secOf[x]] = bySec[base.secOf[x]] || []).push(C[x] - base.ytop[x]); }
    }
    for (x = 0; x < w; x++) {
      var arr = bySec[base.secOf[x]];
      if (base.cb[x] >= 0 && base.sup[x] && arr) {
        if (!arr.med) { var srt = arr.slice().sort(function (a, b) { return a - b; }); arr.med = srt[srt.length >> 1]; }
        H[x] = arr.med;
      }
    }
    fillGaps(H);
    var R = Math.max(1, Math.round(w * 0.006));
    for (x = 0; x < w; x++) {
      var sum = 0, n = 0;
      for (k = Math.max(0, x - R); k <= Math.min(w - 1, x + R); k++) { sum += H[k]; n++; }
      FL[x] = Math.max(2, L * (sum / n) * s);
    }
    return FL;
  }

  // ---------------------------------------------------------------- carry the decisions to full resolution
  // lo = { w, h, C, FL, snap } computed on the small copy; D = full-resolution RGBA (W x H).
  function upsample(lo, D, W, H) {
    var kx = W / lo.w, ky = H / lo.h, C = new Float32Array(W), FL = new Float32Array(W), X;
    if (kx === 1 && ky === 1) return { C: new Float32Array(lo.C), FL: new Float32Array(lo.FL) };
    var win = Math.ceil(1.5 * ky) + 2, jump = 2.5;
    function edgeNear(X, P) {       // real lower edge of the solid object close to the predicted boundary P
      var y0 = Math.min(H - 1, Math.floor(P - 1 + win)), y1 = Math.max(0, Math.ceil(P - 1 - win)), y, opq = 0;
      if (y0 < H - 1 && D[(y0 * W + X) * 4 + 3] > OPQ) return -1;   // still inside the object: no edge here
      for (y = y0; y >= y1 - 2 && y >= 0; y--) {
        if (D[(y * W + X) * 4 + 3] > OPQ) { if (++opq >= 3) { y += 2; if (y < y1) return -1; var below = y + 1 < H ? D[((y + 1) * W + X) * 4 + 3] / 255 : 0; return y + 1 + Math.min(0.99, below); } }
        else opq = 0;
      }
      return -1;
    }
    for (X = 0; X < W; X++) {
      var xl = (X + 0.5) / kx - 0.5, i0 = Math.floor(xl), fr = xl - i0;
      if (i0 < 0) { i0 = 0; fr = 0; }
      var i1 = Math.min(lo.w - 1, i0 + 1);
      if (i0 > lo.w - 1) i0 = lo.w - 1;
      var c0 = lo.C[i0], c1 = lo.C[i1], near = fr < 0.5 ? i0 : i1, far = fr < 0.5 ? i1 : i0;
      FL[X] = (lo.FL[i0] + (lo.FL[i1] - lo.FL[i0]) * fr) * ky;
      if (Math.abs(c1 - c0) <= jump) {
        var P = (c0 + (c1 - c0) * fr) * ky, e = (lo.snap[i0] || lo.snap[i1]) ? edgeNear(X, P) : -1;
        C[X] = e >= 0 ? e : P;
      } else {    // border between two levels: the column belongs to whichever has a real edge here
        var Pn = lo.C[near] * ky, Pf = lo.C[far] * ky;
        var en = lo.snap[near] ? edgeNear(X, Pn) : -1, ef = lo.snap[far] ? edgeNear(X, Pf) : -1;
        C[X] = en >= 0 ? en : (ef >= 0 ? ef : Pn);
      }
    }
    // light smoothing along continuous stretches (sub-pixel only)
    var S = new Float32Array(W);
    for (X = 0; X < W; X++) {
      var a = C[Math.max(0, X - 1)], b = C[Math.min(W - 1, X + 1)];
      S[X] = (Math.abs(a - C[X]) < 1.5 && Math.abs(b - C[X]) < 1.5) ? (a + 2 * C[X] + b) / 4 : C[X];
    }
    return { C: S, FL: FL };
  }

  // ---------------------------------------------------------------- the mirror
  function fadeAlpha(t, mid) {
    var m = Math.min(0.87, Math.max(0.13, mid / 100));
    var e = Math.log(0.5) / Math.log(m);
    return 1 - Math.pow(Math.min(1, Math.max(0, t)), e);
  }
  function bleedOf(p, h) { return Math.ceil(p.blur / 100 * h * 2.5 + p.ripple / 100 * h * 0.015 + 2); }

  // D: RGBA (w x h). C / FL per column. Returns { data, w, h, left, top } with left/top in layer coordinates.
  // Above the contact line the picture is extended by `bleed` rows that sit hidden behind the object,
  // so a blur applied later cannot open a gap at the base.
  function warp(D, w, h, C, FL, p) {
    var s = Math.max(0.01, p.squash / 100), gap = p.gap / 100 * h, shear = Math.tan(p.skew * Math.PI / 180);
    var bleed = bleedOf(p, h), x, ox, oy, minC = Infinity, maxEnd = -Infinity, fadeMax = 1;
    for (x = 0; x < w; x++) { if (C[x] < minC) minC = C[x]; if (C[x] + FL[x] > maxEnd) maxEnd = C[x] + FL[x]; if (FL[x] > fadeMax) fadeMax = FL[x]; }
    var spread = Math.ceil(Math.abs(shear) * fadeMax), offX = 1 + (shear < 0 ? spread : 0);
    var top = Math.floor(minC + gap - bleed - 1);
    var ow = w + 2 + spread, oh = Math.max(1, Math.ceil(maxEnd + gap - top) + 1);
    var o = new Uint8ClampedArray(ow * oh * 4), LUT = new Float32Array(257), q;
    for (q = 0; q <= 256; q++) LUT[q] = fadeAlpha(q / 256, p.curve);
    var jump = Math.max(4, h * 0.05);
    function Ci(xf) {
      if (xf <= 0) return C[0];
      if (xf >= w - 1) return C[w - 1];
      var i0 = Math.floor(xf), fr = xf - i0, a0 = C[i0], a1 = C[i0 + 1];
      return Math.abs(a1 - a0) > jump ? (fr < 0.5 ? a0 : a1) : a0 + (a1 - a0) * fr;
    }
    function cl(v, m) { return v < 0 ? 0 : (v > m ? m : v); }
    for (ox = 0; ox < ow; ox++) {
      var xg = ox - offX;
      for (oy = 0; oy < oh; oy++) {
        var yc = oy + top + 0.5;                       // centre of this output row
        var t = yc - (Ci(xg) + gap);
        if (t < -bleed - 1 || t >= fadeMax) continue;
        var xs = xg - shear * Math.max(0, t);
        if (xs < -0.5 || xs > w - 0.5) continue;
        var cc = Ci(xs);
        t = yc - (cc + gap);
        var fl = FL[cl(Math.round(xs), w - 1)];
        if (t <= -bleed - 1 || t >= fl) continue;
        var cover = t < -bleed ? 1 + (t + bleed) : 1, sy;
        if (t < 0) { sy = cc - 2.5; t = 0; } else sy = cc - t / s - 0.5;
        if (sy < -0.5 || sy > h - 0.5) continue;
        var x0 = Math.floor(xs), fx = xs - x0, y0 = Math.floor(sy), fy = sy - y0;
        var xa = cl(x0, w - 1), xb = cl(x0 + 1, w - 1), ya = cl(y0, h - 1), yb = cl(y0 + 1, h - 1);
        var i00 = (ya * w + xa) * 4, i10 = (ya * w + xb) * 4, i01 = (yb * w + xa) * 4, i11 = (yb * w + xb) * 4;
        var w00 = (1 - fx) * (1 - fy) * D[i00 + 3], w10 = fx * (1 - fy) * D[i10 + 3],
            w01 = (1 - fx) * fy * D[i01 + 3], w11 = fx * fy * D[i11 + 3];
        var a = w00 + w10 + w01 + w11;
        if (a <= 0) continue;
        var k = (oy * ow + ox) * 4;
        o[k] = (D[i00] * w00 + D[i10] * w10 + D[i01] * w01 + D[i11] * w11) / a;
        o[k + 1] = (D[i00 + 1] * w00 + D[i10 + 1] * w10 + D[i01 + 1] * w01 + D[i11 + 1] * w11) / a;
        o[k + 2] = (D[i00 + 2] * w00 + D[i10 + 2] * w10 + D[i01 + 2] * w01 + D[i11 + 2] * w11) / a;
        o[k + 3] = a * cover * LUT[Math.min(256, Math.round(t / fl * 256))];
      }
    }
    return { data: o, w: ow, h: oh, left: -offX, top: top };
  }

  // ---------------------------------------------------------------- tight crop
  // The rectangle of the returned picture is exactly its visible content (alpha >= thr on all four
  // sides), so the host application measures the same rectangle no matter how it treats faint pixels.
  function crop(img, thr) {
    var w = img.w, h = img.h, d = img.data, x, y, x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] >= thr) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 < 0) return null;
    var cw = x1 - x0 + 1, ch = y1 - y0 + 1, o = new Uint8ClampedArray(cw * ch * 4);
    for (y = 0; y < ch; y++) o.set(d.subarray(((y + y0) * w + x0) * 4, ((y + y0) * w + x0 + cw) * 4), y * cw * 4);
    return { data: o, w: cw, h: ch, left: img.left + x0, top: img.top + y0 };
  }

  // ---------------------------------------------------------------- PNG helpers (resolution tag)
  var CRC = null;
  function crc32(buf, start, end) {
    var c, n, k;
    if (!CRC) { CRC = []; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; } }
    c = 0xFFFFFFFF;
    for (n = start; n < end; n++) c = CRC[(c ^ buf[n]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  // Returns a copy of the PNG bytes with a pHYs chunk (pixels per inch). Without it the host assumes
  // 72 ppi and rescales the picture when the document uses another resolution.
  function pngSetPpi(png, ppi) {
    if (!(ppi > 0) || png.length < 33) return png;
    var sig = [137, 80, 78, 71, 13, 10, 26, 10], i;
    for (i = 0; i < 8; i++) if (png[i] !== sig[i]) return png;
    function u32(b, p) { return ((b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]) >>> 0; }
    // drop an existing pHYs chunk, remember where IHDR ends
    var parts = [], pos = 8, ihdrEnd = -1;
    while (pos + 12 <= png.length) {
      var len = u32(png, pos), type = String.fromCharCode(png[pos + 4], png[pos + 5], png[pos + 6], png[pos + 7]), end = pos + 12 + len;
      if (end > png.length) return png;
      if (type !== 'pHYs') parts.push([pos, end]);
      if (type === 'IHDR') ihdrEnd = parts.length;
      pos = end;
    }
    if (ihdrEnd < 0 || pos !== png.length) return png;
    var ppm = Math.round(ppi / 0.0254), ch = new Uint8Array(21);
    ch[3] = 9; ch[4] = 112; ch[5] = 72; ch[6] = 89; ch[7] = 115;          // length 9, "pHYs"
    for (i = 0; i < 2; i++) { var o = 8 + i * 4; ch[o] = (ppm >>> 24) & 255; ch[o + 1] = (ppm >>> 16) & 255; ch[o + 2] = (ppm >>> 8) & 255; ch[o + 3] = ppm & 255; }
    ch[16] = 1;                                                           // unit: metre
    var crc = crc32(ch, 4, 17);
    ch[17] = (crc >>> 24) & 255; ch[18] = (crc >>> 16) & 255; ch[19] = (crc >>> 8) & 255; ch[20] = crc & 255;
    var total = 8 + 21, out, w = 8;
    for (i = 0; i < parts.length; i++) total += parts[i][1] - parts[i][0];
    out = new Uint8Array(total);
    out.set(png.subarray(0, 8), 0);
    for (i = 0; i < parts.length; i++) {
      out.set(png.subarray(parts[i][0], parts[i][1]), w); w += parts[i][1] - parts[i][0];
      if (i === ihdrEnd - 1) { out.set(ch, w); w += 21; }
    }
    return out;
  }

  return { OPQ: OPQ, scan: scan, analyze: analyze, contact: contact, fadeLen: fadeLen, upsample: upsample,
           warp: warp, crop: crop, bleedOf: bleedOf, fadeAlpha: fadeAlpha, model: model, pngSetPpi: pngSetPpi, crc32: crc32 };
});
