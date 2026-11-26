/*
 * يُضاف إلى كل صفحة هبوط لإضافات مصطفى جغلال (‎/tools/…‎):
 *  - رابط رجوع إلى قائمة الإضافات والموقع
 *  - بطاقة تحميل أعلى قسم التثبيت، ورابطها يُقرأ من لوحة التحكم (siteInfo.tools)
 *    فيتغيّر الملف من /admin ← «الإضافات» دون لمس هذه الصفحات
 * الوسم: <script src="/tools/tools.js" data-tool="zill" defer></script>
 */
(function () {
  var me = document.currentScript || document.querySelector('script[data-tool]');
  var slug = me && me.getAttribute('data-tool');
  var NAMES = {
    zill: '«ظل» Zill', 'audio-viz': 'Audio Viz', kashida: '«كشيدة» Kashida', rasael: '«رسائل» Rasael',
    masar: '«مسار» Masar', 'cards-3d': 'Cards 3D', jidari: '«جداري» Jidari', alwani: '«ألواني» Alwani'
  };
  // ملفات افتراضية مرفوعة مع الموقع نفسه؛ ما يُرفع من لوحة التحكم يغلبها
  var DEFAULTS = {
    jidari: { url: '/downloads/Jidari_v7.zip', version: '7', size: 10206262 },
    alwani: { url: '/downloads/Alwani-1.0-Photoshop.zip', version: '1.0', size: 25155 }
  };
  var name = NAMES[slug] || 'الإضافة';
  var PROJECT = 'mustapha-portfolio', KEY = 'AIzaSyBvljyA9z5O6zQHRtLIDxKnwyCxCF2vqL8';

  var css = document.createElement('style');
  css.textContent =
    '.mj-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;opacity:.7;color:inherit;text-decoration:none;margin-inline-start:14px;transition:opacity .2s;white-space:nowrap}' +
    '.mj-back:hover{opacity:1}' +
    '.mj-dl{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;max-width:720px;margin:0 auto 26px;padding:20px 22px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04)}' +
    '.mj-dl b{display:block;font-size:17px}.mj-dl small{opacity:.65;font-size:13px}' +
    '.mj-dl .mj-soon{opacity:.75;font-size:14px}' +
    '@media(max-width:560px){.mj-dl{flex-direction:column;align-items:stretch;text-align:center}.mj-dl .btn{justify-content:center}}';
  document.head.appendChild(css);

  function fmt(bytes) {
    if (!bytes) return '';
    return bytes > 1048576 ? (bytes / 1048576).toFixed(1) + ' ميغا' : Math.round(bytes / 1024) + ' كيلوبايت';
  }

  function ready(fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }

  ready(function () {
    // رابط الرجوع داخل شريط التنقل
    var logo = document.querySelector('nav .logo');
    if (logo) {
      var back = document.createElement('a');
      back.className = 'mj-back';
      back.href = '/tools';
      back.textContent = '→ كل الإضافات';
      logo.parentNode.insertBefore(back, logo.nextSibling);
    }

    // بطاقة التحميل أعلى قسم التثبيت
    var install = document.getElementById('install');
    var host = install && (install.querySelector('.wrap') || install);
    if (!host) return;
    var card = document.createElement('div');
    card.className = 'mj-dl reveal in';
    card.innerHTML = '<div><b>تحميل ' + name + '</b><small class="mj-meta">جارٍ تجهيز الرابط…</small></div>' +
      '<a class="btn pri mj-btn" href="#" aria-disabled="true">⬇ تحميل</a>';
    var first = host.firstElementChild;
    host.insertBefore(card, first ? first.nextSibling : null);
    var btn = card.querySelector('.mj-btn'), meta = card.querySelector('.mj-meta');

    function apply(info, phone) {
      if (info && info.url) {
        btn.href = info.url;
        btn.setAttribute('download', '');
        btn.removeAttribute('aria-disabled');
        var bits = [];
        if (info.version) bits.push('الإصدار ' + info.version);
        if (info.size) bits.push(fmt(info.size));
        bits.push('ملف ZIP');
        meta.textContent = bits.join(' · ');
      } else {
        // لم يُرفع ملف بعد: يطلبها الزائر عبر واتساب بدل زر معطّل
        meta.innerHTML = '<span class="mj-soon">رابط التحميل يُجهَّز حالياً</span>';
        if (phone) {
          btn.textContent = 'اطلبها عبر واتساب';
          btn.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent('مرحباً مصطفى، أريد الحصول على إضافة ' + name);
          btn.target = '_blank';
          btn.rel = 'noopener';
        } else {
          btn.style.display = 'none';
        }
      }
    }

    fetch('https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents/siteInfo?key=' + KEY)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var f = (j.documents && j.documents[0] && j.documents[0].fields) || {};
        var phone = f.phone && f.phone.stringValue ? f.phone.stringValue.replace(/\D/g, '') : '';
        var t = f.tools && f.tools.mapValue && f.tools.mapValue.fields && f.tools.mapValue.fields[slug];
        var m = t && t.mapValue && t.mapValue.fields;
        var info = m ? {
          url: m.url && m.url.stringValue,
          version: m.version && m.version.stringValue,
          size: m.size && Number(m.size.integerValue || m.size.doubleValue || 0)
        } : null;
        apply(info && info.url ? info : DEFAULTS[slug], phone);
      })
      .catch(function () { apply(DEFAULTS[slug], ''); });
  });
})();
