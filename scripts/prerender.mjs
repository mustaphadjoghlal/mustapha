/**
 * يولّد ملف HTML مستقلاً لكل صفحة بعد البناء.
 *
 * الموقع تطبيق صفحة واحدة: كل الروابط كانت تُقدَّم من index.html نفسه، فيرى
 * جوجل العنوان والوصف ذاتهما في كل صفحة — لأنه يقرأ HTML قبل تشغيل الجافاسكربت.
 * هنا ننسخ الملف لكل مسار ونستبدل وسوم العنوان والوصف وcanonical وOpen Graph،
 * فتصل كل صفحة إلى محركات البحث بهويتها كاملة من أول بايت.
 *
 * Vercel يفحص الملفات قبل قواعد إعادة الكتابة، فيُقدَّم dist/about/index.html
 * تلقائياً عند طلب /about.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = "https://mustaphadjoghlal.com";

/** صفحات موقع مصطفى جغلال — تُبنى من index.html */
const mainPages = [
  {
    path: "about",
    title: "عني — مصطفى جغلال، معلق صوتي ومصمم بصري",
    description:
      "مسيرة مصطفى جغلال: معلّق صوتي ومصمّم محتوى بصري ومدير مجتمع، من الجزائر ومقيم في مسقط. خبرات في التعليق الصوتي والتصميم الجرافيكي والإعلام الرقمي.",
  },
  {
    path: "portfolio",
    title: "أعمالي — تعليق صوتي وتصوير وتصميم | مصطفى جغلال",
    description:
      "مشاريع مختارة لمصطفى جغلال في ثلاثة مجالات: التعليق الصوتي، التصوير الفوتوغرافي، والتصميم الجرافيكي — لعلامات تجارية ومشاريع ثقافية في عُمان والجزائر.",
  },
  {
    path: "portfolio-voice",
    title: "التعليق الصوتي — نماذج صوتية | مصطفى جغلال",
    description:
      "معلّق صوتي عربي محترف: إعلانات تجارية، أفلام وثائقية، محتوى تعليمي، مقدمات برامج، كتب صوتية وأنظمة ردّ صوتي. استمع إلى نماذج من أعمالي واطلب عينة.",
    keywords:
      "معلق صوتي, تعليق صوتي عربي, معلق صوتي احترافي, تعليق صوتي إعلانات, معلق صوتي عمان, voice over arabic",
  },
  {
    path: "portfolio-photography",
    title: "التصوير الفوتوغرافي — مصطفى جغلال",
    description:
      "خدمات تصوير فوتوغرافي احترافي: تصوير المنتجات والإعلانات، الفعاليات والحفلات، البورتريه، والتصوير المعماري، مع تحرير ومعالجة احترافية للصور.",
    keywords:
      "تصوير فوتوغرافي, تصوير منتجات, تصوير فعاليات, مصور في مسقط, تصوير إعلانات",
  },
  {
    path: "portfolio-design",
    title: "التصميم الجرافيكي — هويات بصرية وإعلانات | مصطفى جغلال",
    description:
      "تصميم جرافيكي احترافي: هويات بصرية وشعارات، منشورات السوشيال ميديا، بوسترات وإنفوجرافيك، ومواد تسويقية وإعلانية تعبّر عن هوية علامتك.",
    keywords:
      "تصميم جرافيك, تصميم هوية بصرية, تصميم شعار, تصميم منشورات سوشيال ميديا, مصمم جرافيك عمان",
  },
  {
    path: "courses",
    title: "دورات التعليق الصوتي والإلقاء | مصطفى جغلال",
    description:
      "دورات تدريبية في التعليق الصوتي والإلقاء والتنشيط: تدريب عملي وتمارين حية مع محترف بخبرة ميدانية، ومواعيد مرنة تناسب جدولك.",
    keywords:
      "دورة تعليق صوتي, تعلم التعليق الصوتي, دورة إلقاء, تدريب تنشيط, دورات صوتية",
  },
  {
    path: "articles",
    title: "المقالات — التعليق الصوتي وصناعة المحتوى | مصطفى جغلال",
    description:
      "مقالات ونصائح عملية في التعليق الصوتي والتنشيط والإعلام الرقمي وصناعة المحتوى البصري، بقلم مصطفى جغلال.",
  },
];

/** صفحات الحكواتي — تُبنى من hakawati.html لأنها موقع مستقل بهويته */
const hakawatiPages = [
  {
    path: "hakawati/stories",
    title: "الحكايات — الحكواتي",
    description:
      "حكايات درامية من التاريخ العربي والإسلامي: سير وأمجاد ومواقف، مروية بأسلوب الحكواتي.",
  },
  {
    path: "hakawati/game",
    title: "لعبة الأسئلة — الحكواتي",
    description:
      "اختبر معرفتك بالتاريخ العربي والإسلامي في لعبة أسئلة من الحكواتي.",
  },
];

/** يستبدل وسماً واحداً أو يُبقي الملف كما هو إن لم يجده */
function setTag(html, pattern, replacement, label, path) {
  if (!pattern.test(html)) {
    console.warn(`⚠ ${path}: لم يُعثر على ${label}`);
    return html;
  }
  return html.replace(pattern, replacement);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function build(templateFile, pages) {
  const template = readFileSync(join(dist, templateFile), "utf8");

  for (const page of pages) {
    const url = `${SITE}/${page.path}`;
    let html = template;

    html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`, "<title>", page.path);
    html = setTag(html, /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${esc(page.description)}" />`, "description", page.path);
    html = setTag(html, /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${url}" />`, "canonical", page.path);
    html = setTag(html, /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${url}" />`, "og:url", page.path);
    html = setTag(html, /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${esc(page.title)}" />`, "og:title", page.path);
    html = setTag(html, /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${esc(page.description)}" />`, "og:description", page.path);
    html = setTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${esc(page.title)}" />`, "twitter:title", page.path);
    html = setTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${esc(page.description)}" />`, "twitter:description", page.path);

    if (page.image) {
      html = setTag(html, /<meta property="og:image" content="[^"]*"\s*\/>/,
        `<meta property="og:image" content="${esc(page.image)}" />`, "og:image", page.path);
      html = setTag(html, /<meta name="twitter:image" content="[^"]*"\s*\/>/,
        `<meta name="twitter:image" content="${esc(page.image)}" />`, "twitter:image", page.path);
    }

    if (page.type === "article") {
      html = setTag(html, /<meta property="og:type" content="[^"]*"\s*\/>/,
        `<meta property="og:type" content="article" />`, "og:type", page.path);
    }

    if (page.keywords) {
      html = setTag(html, /<meta name="keywords" content="[^"]*"\s*\/>/,
        `<meta name="keywords" content="${esc(page.keywords)}" />`, "keywords", page.path);
    }

    const dir = join(dist, page.path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html, "utf8");
    if (!page.quiet) console.log(`✓ /${page.path}`);
  }
}

/** نص عادي من HTML، مقصوصاً عند آخر مسافة قبل الحد */
function plain(html = "", limit = 155) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

/** يقرأ المقالات والأعمال من قاعدة البيانات وقت البناء */
async function fetchContent() {
  const { initializeApp } = await import("firebase/app");
  const { getFirestore, collection, getDocs } = await import("firebase/firestore");

  const app = initializeApp({
    apiKey: "AIzaSyBvljyA9z5O6zQHRtLIDxKnwyCxCF2vqL8",
    authDomain: "mustapha-portfolio.firebaseapp.com",
    projectId: "mustapha-portfolio",
    storageBucket: "mustapha-portfolio.firebasestorage.app",
    messagingSenderId: "597476763368",
    appId: "1:597476763368:web:48cdeccdc1bc21b22e0b5d",
  });
  const db = getFirestore(app);

  const [articlesSnap, worksSnap] = await Promise.all([
    getDocs(collection(db, "articles")),
    getDocs(collection(db, "works")),
  ]);

  const articles = articlesSnap.docs.map((d) => {
    const a = d.data();
    return {
      path: `articles/${d.id}`,
      title: `${a.title} — مصطفى جغلال`,
      description: plain(a.excerpt || a.content),
      image: a.coverImage || null,
      type: "article",
      lastmod: a.date || null,
      quiet: true,
    };
  });

  const works = worksSnap.docs.map((d) => {
    const w = d.data();
    const kind =
      w.category === "voice" ? "تعليق صوتي"
      : w.category === "photography" ? "تصوير فوتوغرافي"
      : "تصميم جرافيكي";
    return {
      path: `portfolio/${d.id}`,
      title: `${w.title} | مصطفى جغلال`,
      description: `${kind} — ${plain(w.description, 110) || w.title}`,
      image: w.coverImage || null,
      type: "article",
      lastmod: null,
      quiet: true,
    };
  });

  return { articles, works };
}

/** يكتب خريطة الموقع كاملةً: الصفحات الثابتة + كل مقال وعمل */
function writeSitemap(pages) {
  const body = pages
    .map(({ loc, lastmod, priority, changefreq }) =>
      [
        "  <url>",
        `    <loc>${loc}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
        priority ? `    <priority>${priority}</priority>` : null,
        "  </url>",
      ].filter(Boolean).join("\n")
    )
    .join("\n");

  writeFileSync(
    join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    "utf8"
  );
}

// ═══════════ التنفيذ ═══════════

build("index.html", mainPages);
build("hakawati.html", hakawatiPages);

let dynamicPages = [];
try {
  const { articles, works } = await fetchContent();
  dynamicPages = [...articles, ...works];
  build("index.html", dynamicPages);
  console.log(`✓ ${articles.length} مقالاً و${works.length} عملاً`);
} catch (e) {
  // لا نُسقط البناء إن تعذّر الوصول إلى قاعدة البيانات؛ يبقى الموقع كما هو
  console.warn(`⚠ تعذّر قراءة المحتوى من قاعدة البيانات (${e.code || e.message}) — بقيت الصفحات الثابتة وحدها.`);
}

const sitemap = [
  { loc: SITE, changefreq: "weekly", priority: "1.0" },
  ...mainPages.map((p) => ({
    loc: `${SITE}/${p.path}`,
    changefreq: "weekly",
    priority: p.path === "about" || p.path === "portfolio" ? "0.9" : "0.8",
  })),
  ...dynamicPages.map((p) => ({
    loc: `${SITE}/${p.path}`,
    lastmod: p.lastmod,
    changefreq: "monthly",
    priority: "0.7",
  })),
];
writeSitemap(sitemap);

console.log(`تم توليد ${mainPages.length + hakawatiPages.length + dynamicPages.length} صفحة، وخريطة موقع بـ${sitemap.length} رابطاً.`);
