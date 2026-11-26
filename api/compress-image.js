/**
 * ضغط صورة مخزّنة في Firebase Storage من جهة الخادم.
 *
 * المتصفح لا يستطيع قراءة صور التخزين مباشرة لضغطها (قيود CORS على الحاوية)،
 * فتجلبها هذه الدالة من خوادم جوجل وتعيد نسخة WebP مصغّرة، ثم ترفعها لوحة التحكم
 * مكان الأصل. لا تقبل إلا روابط حاوية الموقع نفسه.
 */
import sharp from "sharp";

const ALLOWED = /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/mustapha-portfolio\.(firebasestorage\.app|appspot\.com)\/o\//;

export default async function handler(req, res) {
  const url = String(req.query.url || "");
  if (!ALLOWED.test(url)) {
    res.status(400).json({ error: "رابط غير مسموح" });
    return;
  }
  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      res.status(502).json({ error: `تعذّر جلب الصورة (${upstream.status})` });
      return;
    }
    const input = Buffer.from(await upstream.arrayBuffer());
    const output = await sharp(input, { failOn: "none" })
      .rotate() // يحترم اتجاه الصورة المسجّل في بياناتها
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Original-Size", String(input.length));
    res.status(200).send(output);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
