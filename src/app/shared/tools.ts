/**
 * إضافات مصطفى وبرامجه — لكل واحدة صفحة هبوط ثابتة في public/tools/<slug>/index.html.
 * القائمة نفسها تغذّي صفحة /tools ولوحة التحكم (تبويب «الإضافات»)
 * وخريطة الموقع (scripts/prerender.mjs يقرأ الأسماء من هناك يدوياً — حدّثهما معاً).
 */
export interface Tool {
  slug: string;
  name: string;
  latin: string;
  host: "Photoshop" | "Premiere Pro" | "ويندوز · المتصفح";
  tagline: string;
  /** لون التمييز من صفحة الهبوط نفسها */
  color: string;
  /** صورة من صفحة الهبوط إن وُجدت */
  cover?: string;
  /** الحرف أو الرمز الذي يظهر حين لا توجد صورة */
  glyph: string;
}

export const TOOLS: Tool[] = [
  { slug: "jidari", name: "جداري", latin: "Jidari", host: "ويندوز · المتصفح", tagline: "جرّب ألوان جوتن على جدار غرفة ثلاثية الأبعاد، واحسب كمية الدهان قبل الشراء.", color: "#2bb39a", cover: "/tools/jidari/assets/room-green.webp", glyph: "ج" },
  { slug: "cards-3d", name: "Cards 3D", latin: "Cards 3D", host: "Premiere Pro", tagline: "صورك وفيديوهاتك في أشكال ثلاثية الأبعاد: حلقة ولولب ونفق ودوامة.", color: "#9d8fff", cover: "/tools/cards-3d/assets/hero.jpg", glyph: "3D" },
  { slug: "masar", name: "مسار", latin: "Masar", host: "Premiere Pro", tagline: "مسار متحرك بين المدن على الخريطة، وخط زمني للسنوات.", color: "#d9a441", cover: "/tools/masar/assets/map_vintage.jpg", glyph: "م" },
  { slug: "rasael", name: "رسائل", latin: "Rasael", host: "Premiere Pro", tagline: "محادثات وإشعارات ورسائل صوتية بحركة ثلاثية الأبعاد.", color: "#22d3a0", glyph: "ر" },
  { slug: "kashida", name: "كشيدة", latin: "Kashida", host: "Premiere Pro", tagline: "تطويل الكلمة العربية بالمدّ الأصيل، بحركة جاهزة للمونتاج.", color: "#e3b45e", glyph: "ك" },
  { slug: "audio-viz", name: "Audio Viz", latin: "Audio Viz", host: "Premiere Pro", tagline: "مرئيات صوت تتفاعل مع الإيقاع، بخلفية شفافة فوق أي فيديو.", color: "#8b5cf6", glyph: "♫" },
  { slug: "alwani", name: "ألواني", latin: "Alwani", host: "Photoshop", tagline: "دليل ألوان الهوية في نقرة: أكواد ودرجات وتباين وتناسق، بطبقات قابلة للتعديل.", color: "#e4572e", glyph: "ل" },
  { slug: "inikas", name: "انعكاس", latin: "Inikas", host: "Photoshop", tagline: "انعكاس واقعي لأي منتج مقصوص: أرضية لامعة أو زجاج أو مطفي أو ماء.", color: "#4fb3ff", glyph: "ع" },
  { slug: "zill", name: "ظل", latin: "Zill", host: "Photoshop", tagline: "ظلال واقعية لأي جسم مقصوص بنقرة واحدة: إسقاط وطويل ومنظوري وأرضي.", color: "#2f8cff", glyph: "ظ" },
];

/** ما يُحفظ في siteInfo.tools[slug] من لوحة التحكم */
export interface ToolDownload {
  url: string;
  version?: string;
  size?: number;
  fileName?: string;
  updatedAt?: string;
}
