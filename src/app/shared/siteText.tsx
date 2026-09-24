import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

/**
 * كل نصّ ثابت في الموقع له مفتاح هنا، ويمكن تغييره من لوحة التحكم ← تبويب "النصوص".
 * القيمة المكتوبة في لوحة التحكم تُخزَّن في siteInfo.texts وتغلب على القيمة هنا،
 * والقيمة هنا تبقى شبكة أمان تظهر قبل وصول البيانات وإن تُرك الحقل فارغاً.
 */
/**
 * قيمة خاصة تُخزَّن حين يختار صاحب الموقع إخفاء نصّ بالكامل،
 * لأن الحقل الفارغ معناه "أبقِ النص الأصلي".
 */
export const HIDDEN_TEXT = "__hidden__";

export interface TextItem {
  key: string;
  /** وصف مختصر يظهر فوق الحقل في لوحة التحكم */
  label: string;
  /** النص الافتراضي */
  value: string;
  /** حقل متعدد الأسطر في لوحة التحكم */
  multiline?: boolean;
}

export interface TextGroup {
  id: string;
  title: string;
  items: TextItem[];
}

export const textGroups: TextGroup[] = [
  {
    id: "general",
    title: "عام — القائمة والفوتر وعنوان التبويب",
    items: [
      { key: "header.wordmark", label: "الاسم في أعلى الموقع", value: "مصطفى جغلال" },
      { key: "nav.home", label: "القائمة: الرئيسية", value: "الرئيسية" },
      { key: "nav.about", label: "القائمة: عني", value: "عني" },
      { key: "nav.portfolio", label: "القائمة: أعمالي", value: "أعمالي" },
      { key: "nav.courses", label: "القائمة: الدورات", value: "الدورات التدريبية" },
      { key: "nav.articles", label: "القائمة: المقالات", value: "المقالات" },
      { key: "footer.rights", label: "الفوتر: حقوق النشر", value: "جميع الحقوق محفوظة" },
      { key: "seo.siteName", label: "اسم الموقع في عنوان التبويب (يُضاف لكل صفحة)", value: "مصطفى جغلال" },
      { key: "seo.home.title", label: "عنوان التبويب للصفحة الرئيسية", value: "مصطفى جغلال — معلق صوتي ومصمم بصري", multiline: true },
      { key: "seo.home.description", label: "وصف الموقع في محركات البحث", value: "معلق صوتي محترف ومصمم محتوى بصري مقيم في مسقط، سلطنة عُمان. أجمع بين قوة الصوت وجاذبية الصورة في التعليق الصوتي والتصميم والسوشيال ميديا.", multiline: true },
      { key: "whatsapp.message", label: "الرسالة الجاهزة عند فتح واتساب", value: "مرحباً، أود التواصل معك" },
    ],
  },
  {
    id: "home",
    title: "الصفحة الرئيسية",
    items: [
      { key: "home.hero.tagline", label: "الجملة الصغيرة فوق العنوان", value: "كل قصة تستحق أن تُروى" },
      { key: "home.cta.works", label: "زر: أعمالي", value: "أعمالي" },
      { key: "home.cta.contact", label: "زر: تواصل معي", value: "تواصل معي" },
      { key: "home.services.heading", label: "عنوان قسم الخدمات", value: "ماذا أقدم" },
      { key: "home.services.voice.title", label: "خدمة ١: العنوان", value: "التعليق الصوتي" },
      { key: "home.services.voice.desc", label: "خدمة ١: الوصف", value: "إعلانات ووثائقيات ومحتوى تعليمي" },
      { key: "home.services.content.title", label: "خدمة ٢: العنوان", value: "صناعة المحتوى" },
      { key: "home.services.content.desc", label: "خدمة ٢: الوصف", value: "أفكار وكتابة وإنتاج محتوى رقمي" },
      { key: "home.services.design.title", label: "خدمة ٣: العنوان", value: "التصميم الجرافيكي" },
      { key: "home.services.design.desc", label: "خدمة ٣: الوصف", value: "هويات بصرية ومنشورات وإعلانات" },
      { key: "home.services.marketing.title", label: "خدمة ٤: العنوان", value: "التسويق الرقمي" },
      { key: "home.services.marketing.desc", label: "خدمة ٤: الوصف", value: "إدارة حسابات وبناء حضور رقمي" },
      { key: "home.samples.heading", label: "عنوان قسم النماذج الصوتية", value: "نماذج صوتية" },
      { key: "home.featured.heading", label: "عنوان قسم الأعمال المختارة", value: "أعمال مختارة" },
      { key: "home.featured.all", label: "رابط: كل الأعمال", value: "كل الأعمال" },
      { key: "home.clients.heading", label: "عنوان قسم العملاء", value: "عملاؤنا المميزون" },
      { key: "home.clients.subheading", label: "سطر تحت عنوان العملاء", value: "فخورون بثقة هذه الجهات المرموقة" },
      { key: "home.contact.heading", label: "عنوان قسم التواصل", value: "جاهز لبدء مشروعك؟" },
      { key: "home.contact.subheading", label: "سطر تحت عنوان التواصل", value: "دعنا نتعاون لتحويل أفكارك إلى واقع ملموس" },
      { key: "home.contact.email", label: "زر البريد", value: "أرسل رسالة" },
      { key: "home.contact.phone", label: "زر الهاتف", value: "اتصل الآن" },
    ],
  },
  {
    id: "works",
    title: "صفحة أعمالي",
    items: [
      { key: "works.heading", label: "العنوان", value: "أعمالي" },
      { key: "works.intro", label: "الفقرة التعريفية", value: "مشاريع مختارة في ثلاثة مجالات. اختر المجال الذي يهمّك لتصفّح أعماله كاملة.", multiline: true },
      { key: "works.voice.title", label: "بطاقة التعليق الصوتي: العنوان", value: "أعمالي في التعليق الصوتي" },
      { key: "works.voice.desc", label: "بطاقة التعليق الصوتي: الوصف", value: "إعلانات ووثائقيات ومحتوى تعليمي ومقدمات برامج" },
      { key: "works.photography.title", label: "بطاقة التصوير: العنوان", value: "أعمالي في التصوير" },
      { key: "works.photography.desc", label: "بطاقة التصوير: الوصف", value: "تصوير فوتوغرافي ومحتوى بصري للمشاريع والعلامات" },
      { key: "works.design.title", label: "بطاقة التصميم: العنوان", value: "أعمالي في التصميم الجرافيكي" },
      { key: "works.design.desc", label: "بطاقة التصميم: الوصف", value: "هويات بصرية ومنشورات وإعلانات ومواد تسويقية" },
      { key: "works.browse", label: "كلمة: تصفّح", value: "تصفّح" },
      { key: "works.soon", label: "كلمة: قريباً", value: "قريباً" },
    ],
  },
  {
    id: "voice",
    title: "صفحة التعليق الصوتي",
    items: [
      { key: "voice.hero.title", label: "العنوان", value: "التعليق الصوتي" },
      { key: "voice.hero.desc", label: "الفقرة التعريفية", value: "صوت احترافي يضيف الحياة لمحتواك. خبرة طويلة في التعليق الصوتي للإعلانات، الأفلام الوثائقية، والمحتوى التعليمي.", multiline: true },
      { key: "voice.features.heading", label: "عنوان قسم المميزات", value: "ما أميز به" },
      { key: "voice.feature1.title", label: "ميزة ١: العنوان", value: "استوديو احترافي" },
      { key: "voice.feature1.desc", label: "ميزة ١: الوصف", value: "معدات تسجيل عالية الجودة مع عزل صوتي كامل" },
      { key: "voice.feature2.title", label: "ميزة ٢: العنوان", value: "تنوع الأداء" },
      { key: "voice.feature2.desc", label: "ميزة ٢: الوصف", value: "قدرة على تقديم أساليب صوتية متنوعة حسب المحتوى" },
      { key: "voice.feature3.title", label: "ميزة ٣: العنوان", value: "سرعة التسليم" },
      { key: "voice.feature3.desc", label: "ميزة ٣: الوصف", value: "تسليم سريع مع إمكانية التعديل حسب ملاحظاتك" },
      { key: "voice.services.heading", label: "عنوان قائمة الخدمات", value: "الخدمات الصوتية" },
      { key: "voice.service1", label: "خدمة ١", value: "التعليق الصوتي للإعلانات التجارية" },
      { key: "voice.service2", label: "خدمة ٢", value: "التعليق الصوتي للأفلام الوثائقية" },
      { key: "voice.service3", label: "خدمة ٣", value: "تسجيل الكتب الصوتية" },
      { key: "voice.service4", label: "خدمة ٤", value: "التعليق الصوتي للفيديوهات التعليمية" },
      { key: "voice.service5", label: "خدمة ٥", value: "التعليق الصوتي للألعاب والرسوم المتحركة" },
      { key: "voice.service6", label: "خدمة ٦", value: "الردود الصوتية وأنظمة IVR" },
      { key: "voice.projects.heading", label: "عنوان قسم المشاريع", value: "مشاريع صوتية مميزة" },
      { key: "voice.projects.sub", label: "سطر تحت عنوان المشاريع", value: "استمع لعينات من أعمالي" },
      { key: "voice.projects.empty", label: "نص عند عدم وجود أعمال", value: "قريباً — سيتم إضافة الأعمال الصوتية" },
      { key: "voice.cta.heading", label: "عنوان قسم الطلب", value: "هل تحتاج تعليق صوتي احترافي؟" },
      { key: "voice.cta.sub", label: "سطر تحت عنوان الطلب", value: "دعني أضيف صوتاً مميزاً يعزز رسالتك ويجذب جمهورك" },
      { key: "voice.cta.button", label: "زر الطلب", value: "اطلب عينة صوتية" },
      { key: "voice.cta.whatsapp", label: "رسالة واتساب الجاهزة", value: "مرحباً مصطفى، أود الاستفسار عن خدمات التعليق الصوتي", multiline: true },
    ],
  },
  {
    id: "photography",
    title: "صفحة التصوير",
    items: [
      { key: "photo.hero.title", label: "العنوان", value: "التصوير الفوتوغرافي" },
      { key: "photo.hero.desc", label: "الفقرة التعريفية", value: "أقدم خدمات تصوير فوتوغرافي احترافية تجمع بين الإبداع الفني والتقنية العالية، لتوثيق اللحظات المهمة وإبراز جمال المواضيع.", multiline: true },
      { key: "photo.services.heading", label: "عنوان قائمة الخدمات", value: "الخدمات المقدمة" },
      { key: "photo.service1", label: "خدمة ١", value: "التصوير الفوتوغرافي الاحترافي" },
      { key: "photo.service2", label: "خدمة ٢", value: "تصوير المنتجات والإعلانات" },
      { key: "photo.service3", label: "خدمة ٣", value: "التصوير الفوتوغرافي للفعاليات والحفلات" },
      { key: "photo.service4", label: "خدمة ٤", value: "تصوير البورتريهات الشخصية" },
      { key: "photo.service5", label: "خدمة ٥", value: "التصوير المعماري والعقاري" },
      { key: "photo.service6", label: "خدمة ٦", value: "تحرير وتصحيح الصور الاحترافي" },
      { key: "photo.projects.heading", label: "عنوان قسم المشاريع", value: "مشاريع فوتوغرافية مميزة" },
      { key: "photo.projects.sub", label: "سطر تحت عنوان المشاريع", value: "نماذج من أعمالي في التصوير الفوتوغرافي" },
      { key: "photo.projects.empty", label: "نص عند عدم وجود أعمال", value: "قريباً — سيتم إضافة الأعمال" },
      { key: "photo.cta.heading", label: "عنوان قسم الطلب", value: "هل تحتاج خدمات تصوير فوتوغرافي؟" },
      { key: "photo.cta.sub", label: "سطر تحت عنوان الطلب", value: "دعنا نعمل معاً لتوثيق اللحظات المهمة وإنشاء صور تعكس رؤيتك" },
      { key: "photo.cta.button", label: "زر الطلب", value: "اطلب خدمة التصوير" },
      { key: "photo.cta.whatsapp", label: "رسالة واتساب الجاهزة", value: "مرحباً مصطفى، أود الاستفسار عن خدمات التصوير الفوتوغرافي", multiline: true },
    ],
  },
  {
    id: "design",
    title: "صفحة التصميم الجرافيكي",
    items: [
      { key: "design.hero.title", label: "العنوان", value: "التصميم الجرافيكي" },
      { key: "design.hero.desc", label: "الفقرة التعريفية", value: "أقدم تصاميم جرافيكية احترافية تجمع بين الإبداع والوظيفية، مصممة خصيصاً لتلبية احتياجات عملك وتعزيز هويتك البصرية.", multiline: true },
      { key: "design.services.heading", label: "عنوان قائمة الخدمات", value: "الخدمات المقدمة" },
      { key: "design.service1", label: "خدمة ١", value: "تصميم الهويات البصرية والشعارات" },
      { key: "design.service2", label: "خدمة ٢", value: "تصميم المواد التسويقية والإعلانية" },
      { key: "design.service3", label: "خدمة ٣", value: "تصميم الكتب والمجلات الإلكترونية" },
      { key: "design.service4", label: "خدمة ٤", value: "تصميم واجهات المستخدم (UI Design)" },
      { key: "design.service5", label: "خدمة ٥", value: "تصميم البوسترات والإنفوجرافيك" },
      { key: "design.service6", label: "خدمة ٦", value: "تصميم محتوى وسائل التواصل الاجتماعي" },
      { key: "design.projects.heading", label: "عنوان قسم المشاريع", value: "مشاريع مميزة" },
      { key: "design.projects.sub", label: "سطر تحت عنوان المشاريع", value: "نماذج من أعمالي في التصميم الجرافيكي" },
      { key: "design.projects.empty", label: "نص عند عدم وجود أعمال", value: "قريباً — سيتم إضافة الأعمال" },
      { key: "design.cta.heading", label: "عنوان قسم الطلب", value: "هل لديك مشروع تصميم؟" },
      { key: "design.cta.sub", label: "سطر تحت عنوان الطلب", value: "دعنا نعمل معاً لإنشاء تصاميم تعبر عن رؤيتك وتحقق أهدافك" },
      { key: "design.cta.button", label: "زر الطلب", value: "تواصل عبر واتساب" },
      { key: "design.cta.whatsapp", label: "رسالة واتساب الجاهزة", value: "مرحباً مصطفى، أود الاستفسار عن خدمات التصميم الجرافيكي", multiline: true },
    ],
  },
  {
    id: "courses",
    title: "صفحة الدورات",
    items: [
      { key: "courses.hero.title", label: "العنوان", value: "الدورات التدريبية" },
      { key: "courses.hero.desc", label: "الفقرة التعريفية", value: "طور مهاراتك في الإلقاء والخطابة والتعليق الصوتي مع دورات تدريبية شاملة ومصممة خصيصاً لتلبية احتياجاتك المهنية.", multiline: true },
      { key: "courses.why.heading", label: "عنوان قسم المميزات", value: "لماذا تختار دوراتنا" },
      { key: "courses.why1.title", label: "ميزة ١: العنوان", value: "تدريب عملي" },
      { key: "courses.why1.desc", label: "ميزة ١: الوصف", value: "تمارين عملية وتطبيقات حية خلال الدورة" },
      { key: "courses.why2.title", label: "ميزة ٢: العنوان", value: "مرونة في المواعيد" },
      { key: "courses.why2.desc", label: "ميزة ٢: الوصف", value: "خيارات متعددة للمواعيد تناسب جدولك" },
      { key: "courses.why3.title", label: "ميزة ٣: العنوان", value: "خبرة ميدانية" },
      { key: "courses.why3.desc", label: "ميزة ٣: الوصف", value: "تدريب من محترف في المجال بخبرة عملية حقيقية" },
      { key: "courses.list.heading", label: "عنوان قائمة الدورات", value: "الدورات المتاحة" },
      { key: "courses.list.sub", label: "سطر تحت عنوان القائمة", value: "اختر الدورة التي تناسب أهدافك المهنية" },
      { key: "courses.content.label", label: "عنوان محتوى الدورة", value: "محتوى الدورة:" },
      { key: "courses.register", label: "زر التسجيل", value: "سجل الآن" },
      { key: "courses.empty.title", label: "نص عند عدم وجود دورات", value: "لا توجد دورات متاحة حالياً" },
      { key: "courses.empty.sub", label: "سطر تحت نص عدم وجود دورات", value: "قريباً — ترقّب الإضافات الجديدة" },
      { key: "courses.cta.heading", label: "عنوان قسم التواصل", value: "هل أنت مستعد للبدء؟" },
      { key: "courses.cta.sub", label: "سطر تحت عنوان التواصل", value: "انضم إلى مئات المتدربين الذين طوروا مهاراتهم معنا" },
      { key: "courses.cta.button", label: "زر التواصل", value: "تواصل معنا للاستفسار" },
    ],
  },
  {
    id: "articles",
    title: "صفحة المقالات",
    items: [
      { key: "articles.eyebrow", label: "الجملة الصغيرة فوق العنوان", value: "أفكار ومعرفة" },
      { key: "articles.heading", label: "العنوان", value: "المقالات" },
      { key: "articles.intro", label: "الفقرة التعريفية", value: "مقالات في التعليق الصوتي، التنشيط، الإعلام الرقمي، وكل ما أعرفه وأمارسه", multiline: true },
      { key: "articles.all", label: "فلتر: الكل", value: "الكل" },
      { key: "articles.readMore", label: "رابط: اقرأ المزيد", value: "اقرأ المزيد" },
      { key: "articles.empty.title", label: "نص عند عدم وجود مقالات", value: "لا توجد مقالات بعد" },
      { key: "articles.empty.sub", label: "سطر تحت نص عدم وجود مقالات", value: "قريباً — ترقّب المحتوى الجديد" },
    ],
  },
  {
    id: "about",
    title: "صفحة عني",
    items: [
      { key: "about.eyebrow", label: "الجملة الصغيرة فوق العنوان", value: "تعرّف عليّ" },
      { key: "about.intro", label: "الفقرة التعريفية", value: "بدأت رحلتي من النشاط الجمعوي الجامعي في البليدة، ثم تطوّرت عبر سنوات من العمل الميداني في التصميم والتعليق الصوتي والإعلام الرقمي، حتى استقررت في مسقط حيث أواصل بناء مشاريعي المهنية والثقافية.", multiline: true },
      { key: "about.trait1.title", label: "صفة ١: العنوان", value: "صوت مميز" },
      { key: "about.trait1.desc", label: "صفة ١: الوصف", value: "أداء صوتي احترافي يناسب الإعلانات والمحتوى التعليمي والترفيهي" },
      { key: "about.trait2.title", label: "صفة ٢: العنوان", value: "إبداع بصري" },
      { key: "about.trait2.desc", label: "صفة ٢: الوصف", value: "تصاميم جرافيكية ومحتوى مرئي يعبّر عن هوية العلامة التجارية بدقة" },
      { key: "about.trait3.title", label: "صفة ٣: العنوان", value: "إدارة مجتمع" },
      { key: "about.trait3.desc", label: "صفة ٣: الوصف", value: "استراتيجيات تسويقية رقمية تبني حضوراً قوياً على السوشيال ميديا" },
      { key: "about.career.heading", label: "عنوان قسم المسيرة المهنية", value: "المسيرة المهنية" },
      { key: "about.skills.heading", label: "عنوان قسم المهارات", value: "المهارات" },
    ],
  },
  {
    id: "notfound",
    title: "صفحة الخطأ 404",
    items: [
      { key: "notfound.heading", label: "العنوان", value: "الصفحة غير موجودة" },
      { key: "notfound.text", label: "النص", value: "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", multiline: true },
      { key: "notfound.button", label: "زر العودة", value: "العودة للرئيسية" },
    ],
  },
];

/** خريطة المفتاح ← النص الافتراضي */
export const textDefaults: Record<string, string> = Object.fromEntries(
  textGroups.flatMap((g) => g.items.map((i) => [i.key, i.value]))
);

const CACHE_KEY = "mustapha_site_texts";

function readCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

const TextsContext = createContext<Record<string, string>>({});

/** يشترك مرة واحدة في siteInfo ويوزّع النصوص المعدَّلة على كل الصفحات */
export function SiteTextProvider({ children }: { children: ReactNode }) {
  const [texts, setTexts] = useState<Record<string, string>>(readCache);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (snap.empty) return;
      const data = snap.docs[0].data() as { texts?: Record<string, string> };
      const next = data.texts || {};
      setTexts(next);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {}
    });
    return unsub;
  }, []);

  return <TextsContext.Provider value={texts}>{children}</TextsContext.Provider>;
}

/**
 * t("home.services.heading") ← النص المكتوب في لوحة التحكم،
 * وإلا النص الافتراضي المعرَّف أعلاه.
 */
export function useText() {
  const overrides = useContext(TextsContext);
  return useMemo(
    () => (key: string) => {
      const custom = overrides[key];
      if (custom === HIDDEN_TEXT) return "";
      return typeof custom === "string" && custom.trim() !== "" ? custom : textDefaults[key] ?? "";
    },
    [overrides]
  );
}
