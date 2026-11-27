/**
 * الحكواتي موقع مستقل على نطاقه الفرعي: elhakawatti.mustaphadjoghlal.com
 *
 * على النطاق الفرعي تكون صفحاته في الجذر (/stories، /game)، أما في التطوير
 * المحلي وروابط المعاينة على Vercel فتبقى تحت /hakawati كما كانت.
 * الروابط القديمة mustaphadjoghlal.com/hakawati/... تُحوَّل إلى النطاق الفرعي
 * من vercel.json، والخادم يوجّه طلبات النطاق الفرعي في middleware.js.
 */
export const HK_HOST = "elhakawatti.mustaphadjoghlal.com";
export const HK_SITE = `https://${HK_HOST}`;

export const IS_HK_HOST =
  typeof window !== "undefined" && window.location.hostname === HK_HOST;

/** بادئة مسارات الحكواتي داخل التطبيق: "" على النطاق الفرعي، "/hakawati" غيره */
export const HK_BASE = IS_HK_HOST ? "" : "/hakawati";

/** رابط داخلي لصفحة من الحكواتي: hk("/stories") أو hk("") للرئيسية */
export const hk = (path = "") => `${HK_BASE}${path}` || "/";

/** رابط مطلق على النطاق الفرعي (للسيو والمشاركة) */
export const hkUrl = (path = "") => `${HK_SITE}${path}`;

/** صورة المشاركة الافتراضية — ملف ثابت في public/hakawati */
export const HK_OG = `${HK_SITE}/hakawati/og-image.jpg`;
