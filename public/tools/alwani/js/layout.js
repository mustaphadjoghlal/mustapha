/* ألواني - تخطيط الصفحات: نفس الأوامر ترسم المعاينة وتبني مستند الفوتوشوب */
var AL = (function () {
  var C = (typeof AC !== 'undefined') ? AC : require('./color.js');

  var SIZES = { slide: [1920, 1080], a4: [3508, 2480], square: [1080, 1080], story: [1080, 1920] };
  var T = {
    ar: { guide: 'دليل الألوان', palette: 'لوحة الألوان', main: 'الألوان الأساسية', secondary: 'الألوان الثانوية', pairs: 'تناسق الألوان', cover: 'الغلاف',
          sample: 'أبجد', on: 'على', white: 'أبيض', black: 'أسود', textWhite: 'نص أبيض', textBlack: 'نص أسود', large: 'للعناوين فقط', brand: 'اسم العلامة', nopairs: 'أضف لونين متباينين على الأقل لعرض التناسق', logo: 'الشعار' },
    en: { guide: 'Color Guide', palette: 'Color Palette', main: 'Primary Colors', secondary: 'Secondary Colors', pairs: 'Color Pairings', cover: 'Cover',
          sample: 'Aa', on: 'on', white: 'White', black: 'Black', textWhite: 'White text', textBlack: 'Black text', large: 'Large text only', brand: 'Your Brand', nopairs: 'Add at least two contrasting colors to show pairings', logo: 'Logo' }
  };

  function grade(r, L) { return r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? L.large : ''; }
  function r1(v) { return (Math.round(v * 10) / 10).toFixed(1); }

  // measure(text, size, bold) -> العرض بالبكسل
  function build(st, measure, cmykOf) {
    var sz = SIZES[st.size] || SIZES.slide, W = sz[0], H = sz[1];
    var u = Math.sqrt(W * H / (1920 * 1080)), m = 96 * u, L = T[st.lang] || T.ar, rtl = st.lang !== 'en';
    var dark = st.theme === 'dark';
    var bg = dark ? '#121212' : '#FAFAF8', ink = dark ? '#F4F4F2' : '#141414', mute = dark ? '#8C8C8A' : '#77776F', line = dark ? '#2A2A2A' : '#E6E6E0';
    var main = st.main || [], sec = st.secOn ? (st.sec || []) : [];
    var all = main.concat(sec);
    var pages = [];
    measure = measure || function (s, size) { return String(s).length * size * 0.55; };
    cmykOf = cmykOf || C.naiveCmyk;

    function fit(s, maxW, size, bold) {
      var w = measure(s, size, bold);
      return w > maxW ? Math.max(8 * u, size * maxW / w) : size;
    }
    function page(name) { var p = { name: name, ops: [] }; pages.push(p); return p; }
    function rect(p, x, y, w, h, fill, r, name) { if (w > 0.5 && h > 0.5) p.ops.push({ t: 'rect', x: x, y: y, w: w, h: h, fill: fill, r: r || 0, name: name || '' }); }
    function text(p, x, y, s, size, fill, o) {
      if (s === '' || s == null) return;
      o = o || {};
      p.ops.push({ t: 'text', x: x, y: y, s: String(s), size: size, fill: fill, align: o.align || 'left', bold: !!o.bold });
    }
    function codes(c) {
      var out = [], rgb = C.hexToRgb(c.hex);
      if (st.codes.hex) out.push(['HEX', c.hex]);
      if (st.codes.rgb) out.push(['RGB', rgb.join(' / ')]);
      if (st.codes.cmyk) out.push(['CMYK', cmykOf(c.hex).join(' / ')]);
      return out;
    }
    function contrastNote(hex) {
      var w = C.contrast(hex, '#FFFFFF'), k = C.contrast(hex, '#111111');
      var r = Math.max(w, k), g = grade(r, L);
      return (w >= k ? L.textWhite : L.textBlack) + '  ' + r1(r) + ':1' + (g ? '  ' + g : '');
    }
    function toneRow(p, c, x, y, w, h, labels) {
      var n = st.tones, ts, cw, i;
      if (!n) return;
      ts = C.tones(c.hex, n); cw = w / n;
      for (i = 0; i < n; i++) {
        rect(p, x + i * cw, y, cw + (i < n - 1 ? 0.6 : 0), h, ts[i], 0, c.name + ' ' + (i + 1));
        if (labels && cw >= 58 * u && h >= 44 * u)
          text(p, x + i * cw + cw / 2, y + h - 12 * u, ts[i], Math.min(12.5 * u, cw / 6.4), C.onColor(ts[i]), { align: 'center' });
      }
    }
    function header(p, title, num) {
      rect(p, 0, 0, W, H, bg, 0, 'Background');
      text(p, m, m, st.brand || L.brand, 20 * u, mute, {});
      text(p, W - m, m, (num < 10 ? '0' : '') + num, 20 * u, mute, { align: 'right' });
      text(p, m, m + 84 * u, title, fit(title, W - 2 * m, 62 * u, true), ink, { bold: true });
      rect(p, m, m + 112 * u, W - 2 * m, Math.max(1, 2 * u), line, 0, 'Line');
      return m + 150 * u;
    }

    // ---- الغلاف
    function cover() {
      var p = page(L.cover), cbg = main.length ? main[0].hex : bg, fg = C.onColor(cbg), soft = C.mix(fg, cbg, 0.3);
      var strip = all.slice(1), stripH = strip.length ? H * 0.11 : 0, i, cw;
      rect(p, 0, 0, W, H, cbg, 0, 'Background');
      text(p, m, m + 6 * u, L.guide, 24 * u, soft, {});
      if (st.logo) p.ops.push({ t: 'logo', x: m, y: m + 70 * u, w: Math.min(W - 2 * m, 460 * u), h: 170 * u, label: L.logo, fill: soft });
      var name = st.brand || L.brand, bs = fit(name, W - 2 * m, 150 * u, true), by = (H - stripH) * 0.62;
      text(p, m, by, name, bs, fg, { bold: true });
      if (st.tagline) text(p, m, by + 74 * u, st.tagline, fit(st.tagline, W - 2 * m, 38 * u, false), soft, {});
      if (stripH) {
        cw = W / strip.length;
        for (i = 0; i < strip.length; i++) rect(p, i * cw, H - stripH, cw + (i < strip.length - 1 ? 0.6 : 0), stripH, strip[i].hex, 0, strip[i].name);
      }
    }

    // ---- لوحة الألوان
    function palette(list, title, num) {
      var p = page(title), top = header(p, title, num), x0 = m, w = W - 2 * m, h = H - top - m * 0.8, n = list.length;
      var g = 28 * u, i, c, lines, k;
      var tpl = (H > W * 1.2) ? 'rows' : (st.tpl || 'cols');
      if (!n) return;
      if (tpl === 'cols') {
        var rowsN = Math.ceil(n / 5), cols = Math.ceil(n / rowsN);
        var cardW = (w - (cols - 1) * g) / cols, cardH = (h - (rowsN - 1) * g) / rowsN;
        for (i = 0; i < n; i++) {
          c = list[i]; lines = codes(c);
          var x = x0 + (i % cols) * (cardW + g), y = top + Math.floor(i / cols) * (cardH + g);
          var fs = Math.min(22 * u, cardW / 13.5), lh = fs * 1.6;
          var toneH = st.tones ? Math.min(70 * u, cardH * 0.16) : 0;
          var textH = lines.length ? lines.length * lh + 18 * u : 0;
          var swH = Math.max(40 * u, cardH - textH - (toneH ? toneH + 16 * u : 0));
          var on = C.onColor(c.hex);
          rect(p, x, y, cardW, swH, c.hex, 18 * u, c.name);
          text(p, x + 22 * u, y + swH - 26 * u, c.name, fit(c.name, cardW - 44 * u, Math.min(32 * u, cardW / 7), true), on, { bold: true });
          if (st.contrast) { var cn = contrastNote(c.hex); text(p, x + 22 * u, y + 40 * u, cn, fit(cn, cardW - 44 * u, fs * 0.8, false), on, {}); }
          var ty = y + swH + 18 * u + fs;
          for (k = 0; k < lines.length; k++) {
            var ln = lines[k][0] + '   ' + lines[k][1];
            text(p, x + 4 * u, ty + k * lh, ln, fit(ln, cardW - 8 * u, fs, k === 0), k === 0 ? ink : mute, { bold: k === 0 });
          }
          if (toneH) toneRow(p, c, x, y + cardH - toneH, cardW, toneH, cardW / st.tones >= 64 * u);
        }
      } else {
        var rg = Math.min(g, 20 * u), rowH = (h - (n - 1) * rg) / n;
        var narrow = W < 1400 * u;
        var w1 = w * (narrow ? 0.34 : 0.24), w2 = w * (narrow ? 0.3 : 0.2), gapX = 26 * u;
        var w3 = st.tones ? w - w1 - w2 - 2 * gapX : 0;
        if (!st.tones) w2 = w - w1 - gapX;
        for (i = 0; i < n; i++) {
          c = list[i]; lines = codes(c);
          var ry = top + i * (rowH + rg), on2 = C.onColor(c.hex);
          var fs2 = Math.min(22 * u, rowH / (Math.max(lines.length, 1) * 1.9), w2 / 12), lh2 = fs2 * 1.6;
          rect(p, x0, ry, w1, rowH, c.hex, 16 * u, c.name);
          text(p, x0 + 20 * u, ry + rowH - 20 * u, c.name, fit(c.name, w1 - 40 * u, Math.min(30 * u, rowH * 0.3), true), on2, { bold: true });
          if (st.contrast && rowH > 90 * u) { var cn2 = contrastNote(c.hex); text(p, x0 + 20 * u, ry + 30 * u, cn2, fit(cn2, w1 - 40 * u, Math.min(16 * u, rowH * 0.16), false), on2, {}); }
          var cy = ry + (rowH - lines.length * lh2) / 2 + fs2;
          for (k = 0; k < lines.length; k++) {
            var ln2 = lines[k][0] + '   ' + lines[k][1];
            text(p, x0 + w1 + gapX, cy + k * lh2, ln2, fit(ln2, w2, fs2, k === 0), k === 0 ? ink : mute, { bold: k === 0 });
          }
          if (w3 > 0) toneRow(p, c, x0 + w1 + w2 + 2 * gapX, ry, w3, rowH, true);
        }
      }
    }

    // ---- تناسق الألوان
    function pairings(num) {
      var p = page(L.pairs), top = header(p, L.pairs, num), w = W - 2 * m, h = H - top - m * 0.8, g = 24 * u;
      var pool = all.slice(), i, j, pairs = [], seen = {};
      pool.push({ hex: '#FFFFFF', name: L.white }); pool.push({ hex: '#111111', name: L.black });
      for (i = 0; i < all.length; i++) for (j = 0; j < pool.length; j++) {
        if (pool[j].hex === all[i].hex) continue;
        var r = C.contrast(all[i].hex, pool[j].hex);
        if (r < 3) continue;
        var key = all[i].hex + pool[j].hex;
        if (seen[key]) continue;
        seen[key] = 1;
        pairs.push({ bg: all[i], fg: pool[j], r: r });
      }
      pairs.sort(function (a, b) { return b.r - a.r; });
      var cols = W > H * 1.2 ? 4 : (W >= H ? 3 : 2), maxRows = W > H * 1.2 ? 3 : (W >= H ? 3 : 5);
      // توزيع متوازن: لا يحتكر لون واحد كل البطاقات
      var pick = [], used = {}, cap = cols * maxRows, round = 0;
      while (pick.length < cap && pick.length < pairs.length && round < 12) {
        for (i = 0; i < pairs.length && pick.length < cap; i++) {
          if (pairs[i].taken) continue;
          if ((used[pairs[i].bg.hex] || 0) > round) continue;
          pairs[i].taken = 1; used[pairs[i].bg.hex] = (used[pairs[i].bg.hex] || 0) + 1; pick.push(pairs[i]);
        }
        round++;
      }
      if (!pick.length) { text(p, m, top + 60 * u, L.nopairs, fit(L.nopairs, w, 28 * u, false), mute, {}); return; }
      var rowsN = Math.ceil(pick.length / cols);
      var cw = (w - (cols - 1) * g) / cols, ch = Math.min((h - (rowsN - 1) * g) / rowsN, cw * 0.9);
      for (i = 0; i < pick.length; i++) {
        var q = pick[i], x = m + (i % cols) * (cw + g), y = top + Math.floor(i / cols) * (ch + g), pad = 24 * u;
        rect(p, x, y, cw, ch, q.bg.hex, 18 * u, q.fg.name + ' / ' + q.bg.name);
        if (C.contrast(q.bg.hex, bg) < 1.25) { // بطاقة بلون قريب من الخلفية: إطار خفيف
          rect(p, x, y, cw, Math.max(1, 2 * u), line, 0, 'Edge'); rect(p, x, y + ch - Math.max(1, 2 * u), cw, Math.max(1, 2 * u), line, 0, 'Edge');
        }
        var lab = q.fg.name + ' ' + L.on + ' ' + q.bg.name, ls = fit(lab, cw - 2 * pad, 17 * u, false);
        text(p, x + pad, y + pad + ls, lab, ls, q.fg.hex, {});
        text(p, x + pad, y + ch * 0.64, L.sample, Math.min(ch * 0.36, cw * 0.3), q.fg.hex, { bold: true });
        if (st.contrast) {
          text(p, x + pad, y + ch - pad, r1(q.r) + ':1', Math.min(24 * u, cw / 9), q.fg.hex, { bold: true });
          var gr = grade(q.r, L);
          text(p, x + cw - pad, y + ch - pad, gr, fit(gr, cw * 0.5, Math.min(18 * u, cw / 12), false), q.fg.hex, { align: 'right' });
        }
      }
    }

    var num = 1;
    if (st.pages.cover) { cover(); num++; }
    if (st.pages.palette && main.length) { palette(main, sec.length ? L.main : L.palette, num++); if (sec.length) palette(sec, L.secondary, num++); }
    if (st.pages.pairs && all.length) pairings(num++);

    // مرآة للاتجاه العربي
    if (rtl) {
      for (var a = 0; a < pages.length; a++) for (var b = 0; b < pages[a].ops.length; b++) {
        var o = pages[a].ops[b];
        if (o.t === 'text') { o.x = W - o.x; o.align = o.align === 'left' ? 'right' : o.align === 'right' ? 'left' : 'center'; }
        else { o.x = W - o.x - o.w; if (o.t === 'logo') o.anchor = 'right'; }
      }
    }
    return { W: W, H: H, u: u, rtl: rtl, pages: pages };
  }

  return { build: build, SIZES: SIZES, T: T };
})();
if (typeof module !== 'undefined') module.exports = AL;
