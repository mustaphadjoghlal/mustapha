/**
 * روابط مفهومة بدل معرّفات Firestore العشوائية:
 *   /articles/nasaih-lil-taaliq-al-sawti   بدل   /articles/4KCSMOpSYhgnweIuQxN3
 *
 * الرابط (slug) بحروف لاتينية صغيرة وشرطات فقط، لأن الحروف العربية في الرابط
 * تتحول عند النسخ والمشاركة إلى رموز طويلة مثل %D8%A7%D9%84...
 * يُولَّد تلقائياً من العنوان، ويمكن تعديله يدوياً من لوحة التحكم.
 */

const AR: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ٱ: "a", ء: "", ؤ: "o", ئ: "e", ى: "a",
  ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh", د: "d", ذ: "dh",
  ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z",
  ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", ة: "a", و: "w", ي: "y", پ: "p", چ: "ch", ڤ: "v", گ: "g",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

/** حركات وتطويل تُحذف قبل التحويل */
const MARKS = /[ً-ٰٟـ]/g;

function transliterateWord(word: string): string {
  // "ال" التعريف في أول الكلمة → al-
  let prefix = "";
  let w = word;
  if (/^(وال|بال|فال|كال)/.test(w)) { prefix = { و: "wa-", ب: "bi-", ف: "fa-", ك: "ka-" }[w[0]]! + "al-"; w = w.slice(3); }
  else if (/^لل/.test(w) && w.length > 3) { prefix = "lil-"; w = w.slice(2); }
  else if (/^ال/.test(w) && w.length > 2) { prefix = "al-"; w = w.slice(2); }

  let out = "";
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    const next = w[i + 1];
    // الواو والياء بعد حرف ساكن غالباً حرفا مدّ: نور → nur، كبير → kabir
    if (ch === "و" && i > 0) { out += "u"; continue; }
    if (ch === "ي" && i > 0 && next !== undefined) { out += "i"; continue; }
    if (ch === "ي" && i > 0 && next === undefined) { out += "i"; continue; }
    out += AR[ch] ?? ch;
  }
  return prefix + out;
}

/** يحوّل عنواناً (عربياً أو لاتينياً) إلى رابط مقروء، بحد أقصى ~60 حرفاً دون قطع كلمة */
export function toSlug(title: string, max = 60): string {
  const words = title
    .normalize("NFKD")
    .replace(MARKS, "")
    .replace(/[̀-ͯ]/g, "") // تشكيل الحروف اللاتينية: é → e
    .toLowerCase()
    .split(/[^a-z0-9؀-ۿ]+/)
    .filter(Boolean)
    .map((w) => (/[؀-ۿ]/.test(w) ? transliterateWord(w) : w))
    .map((w) => w.replace(/[^a-z0-9-]/g, ""))
    .filter(Boolean);

  let slug = "";
  for (const w of words) {
    const nextSlug = slug ? `${slug}-${w}` : w;
    if (nextSlug.length > max && slug) break;
    slug = nextSlug;
  }
  return cleanSlug(slug);
}

/** ينظّف ما يكتبه المستخدم يدوياً في حقل الرابط */
export function cleanSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** يضيف -2، -3… إن كان الرابط مستخدماً لعنصر آخر */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const set = new Set(taken);
  const root = base || "item";
  if (!set.has(root)) return root;
  let n = 2;
  while (set.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

/** هل المعرّف نفسه مقروء أصلاً؟ (مثل حكايات جرجرة: djurdjura-the-jackal) */
export const isReadable = (id: string) => /^[a-z0-9]+(-[a-z0-9]+)+$/.test(id);

/** الجزء الذي يوضع في الرابط: الـslug إن وُجد، وإلا المعرّف */
export const linkId = (item: { id: string; slug?: string }) => item.slug || item.id;
