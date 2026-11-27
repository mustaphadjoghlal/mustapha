/**
 * يوجّه طلبات النطاق الفرعي elhakawatti.mustaphadjoghlal.com إلى صفحات الحكواتي.
 *
 * لماذا middleware وليس rewrites في vercel.json؟ لأن Vercel يفحص الملفات قبل
 * قواعد إعادة الكتابة، فطلب "/" على النطاق الفرعي كان سيُقدَّم dist/index.html
 * (الموقع الشخصي). الـmiddleware يعمل قبل فحص الملفات.
 *
 * الملفات الثابتة (أي مسار فيه نقطة مثل /hakawati/logo.png و/robots.txt)
 * ومجلد /assets و/api لا تمرّ من هنا — انظر matcher.
 */
const HK_HOST = "elhakawatti.mustaphadjoghlal.com";

/** صفحات مولّدة مسبقاً في dist/hakawati/<path>/index.html بوسومها الخاصة */
const PRERENDERED = new Set(["/stories", "/game"]);

export const config = {
  matcher: ["/((?!assets/|api/|hakawati/|.*\\.).*)"],
};

export default function middleware(request) {
  const url = new URL(request.url);
  if (url.hostname !== HK_HOST) return; // بقية النطاقات تمضي كما هي

  const path = url.pathname.replace(/\/+$/, "") || "/";
  const target = new URL(request.url);
  target.pathname = PRERENDERED.has(path) ? `/hakawati${path}` : "/hakawati.html";

  return new Response(null, {
    headers: { "x-middleware-rewrite": target.toString() },
  });
}
