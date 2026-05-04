import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { db } from "../../../firebase";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { ArrowRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  date: string;
  tags: string[];
  category: string;
}

interface SiteInfo {
  profileImageUrl: string;
  heroName: string;
  heroDescription: string;
}

export function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "articles", id), (d) => {
      if (d.exists()) setArticle({ id: d.id, ...d.data() } as Article);
      setLoaded(true);
    });
    return unsub;
  }, [id]);

  // قراءة صورة الملف الشخصي من siteInfo
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "siteInfo"), (s) => {
      if (!s.empty) setSiteInfo(s.docs[0].data() as SiteInfo);
    });
    return unsub;
  }, []);

  if (!loaded) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold mb-4">المقال غير موجود</h2>
        <Link to="/articles" className="text-blue-400 hover:underline">← العودة للمقالات</Link>
      </div>
    </div>
  );

  // Schema.org JSON-LD للمقال
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "author": {
      "@type": "Person",
      "name": "مصطفى جغلال",
      "alternateName": "Mustapha Djoghlal",
      "url": "https://mustaphadjoghlal.com",
      "image": siteInfo?.profileImageUrl || "https://mustaphadjoghlal.com/og-image.jpg"
    },
    "publisher": {
      "@type": "Person",
      "name": "مصطفى جغلال",
      "url": "https://mustaphadjoghlal.com"
    },
    "datePublished": article.date,
    "image": article.coverImage || "https://mustaphadjoghlal.com/og-image.jpg",
    "url": `https://mustaphadjoghlal.com/articles/${id}`,
    "description": article.content?.replace(/<[^>]*>/g, "").substring(0, 160),
  };

  return (
    <div className="bg-black text-white min-h-screen" dir="rtl">

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Meta tags ديناميكية */}
      {typeof document !== "undefined" && (() => {
        document.title = `${article.title} — مصطفى جغلال`;
        const desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute("content", article.content?.replace(/<[^>]*>/g, "").substring(0, 160));
        return null;
      })()}

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/articles" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm">
          <ArrowRight size={16} />
          العودة للمقالات
        </Link>
      </div>

      {/* الغلاف */}
      {article.coverImage && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="rounded-2xl overflow-hidden h-64 md:h-96">
            <img src={article.coverImage} alt={article.coverAlt || article.title}
              className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* المحتوى */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* الوسوم */}
        {article.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {article.tags.map((tag, i) => (
              <span key={i} className="text-sm text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* العنوان */}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight text-white">
          {article.title}
        </h1>

        {/* التاريخ والتصنيف */}
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-10 border-b border-gray-800 pb-6">
          {article.category && (
            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
              {article.category}
            </span>
          )}
          <span>{article.date}</span>
          <span>بقلم مصطفى جغلال</span>
        </div>

        {/* ===== النص الرئيسي ===== */}
        <style>{`
          .article-body { font-size:1.15rem; line-height:2; color:#d1d5db; font-family:'Segoe UI','Tahoma',sans-serif; }
          .article-body h2 { font-size:1.6rem; font-weight:800; color:#ffffff; margin-top:2.5rem; margin-bottom:1rem; padding-bottom:0.4rem; border-bottom:2px solid #3b82f6; }
          .article-body h3 { font-size:1.3rem; font-weight:700; color:#e5e7eb; margin-top:2rem; margin-bottom:0.75rem; }
          .article-body p { margin-bottom:1.4rem; font-weight:400; }
          .article-body strong { font-weight:700; color:#ffffff; }
          .article-body ul { list-style:none; padding:0; margin:1.2rem 0; }
          .article-body ul li { padding:0.4rem 0 0.4rem 0; padding-right:1.5rem; position:relative; margin-bottom:0.5rem; color:#d1d5db; }
          .article-body ul li::before { content:"◈"; position:absolute; right:0; color:#3b82f6; font-size:0.8rem; top:0.55rem; }
          .article-body ol { padding-right:1.5rem; margin:1.2rem 0; counter-reset:item; list-style:none; }
          .article-body ol li { counter-increment:item; margin-bottom:0.8rem; position:relative; padding-right:2rem; color:#d1d5db; }
          .article-body ol li::before { content:counter(item); position:absolute; right:0; background:#3b82f6; color:white; width:1.4rem; height:1.4rem; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; top:0.2rem; }
          .article-body blockquote { border-right:4px solid #3b82f6; padding:1rem 1.2rem; margin:1.5rem 0; color:#9ca3af; font-style:italic; background:#111827; border-radius:0 0.5rem 0.5rem 0; }
          .article-body a { color:#60a5fa; text-decoration:none; }
          .article-body a:hover { text-decoration:underline; }
        `}</style>

        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* ===== بطاقة الكاتب ===== */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex items-center gap-4">

            {/* الصورة — تقرأ من siteInfo أو تعرض حرف "م" احتياطياً */}
            {siteInfo?.profileImageUrl ? (
              <img
                src={siteInfo.profileImageUrl}
                alt="مصطفى جغلال"
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                م
              </div>
            )}

            <div>
              <p className="font-bold text-white text-base">مصطفى جغلال</p>
              <p className="text-gray-400 text-sm">معلّق صوتي ومصمّم محتوى بصري — مسقط، عُمان</p>
            </div>
          </div>
        </div>

        {/* رجوع */}
        <div className="mt-8">
          <Link to="/articles"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold">
            <ArrowRight size={18} />
            العودة لجميع المقالات
          </Link>
        </div>
      </article>
    </div>
  );
}
