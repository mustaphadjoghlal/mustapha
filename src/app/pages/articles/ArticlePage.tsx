import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { db } from "../../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
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

export function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "articles", id), (d) => {
      if (d.exists()) setArticle({ id: d.id, ...d.data() } as Article);
      setLoaded(true);
    });
    return unsub;
  }, [id]);

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

  return (
    <div className="bg-black text-white min-h-screen" dir="rtl">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/articles" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm">
          <ArrowRight size={16} />
          العودة للمقالات
        </Link>
      </div>

      {/* الغلاف */}
      {article.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="rounded-2xl overflow-hidden h-64 md:h-96">
            <img src={article.coverImage} alt={article.coverAlt || article.title}
              className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* المحتوى */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* الوسوم */}
        {article.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {article.tags.map((tag, i) => (
              <span key={i} className="text-sm text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* العنوان */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{article.title}</h1>

        {/* التاريخ والتصنيف */}
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-10 border-b border-gray-800 pb-6">
          {article.category && (
            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">{article.category}</span>
          )}
          <span>{article.date}</span>
          <span>بقلم مصطفى جغلال</span>
        </div>

        {/* النص */}
        <div
          className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:mb-6 prose-p:leading-8
            prose-strong:text-white
            prose-ul:my-4 prose-li:mb-2
            prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:pr-4 prose-blockquote:text-gray-400 prose-blockquote:italic
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* نهاية المقال */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg">م</div>
            <div>
              <p className="font-bold text-white">مصطفى جغلال</p>
              <p className="text-gray-400 text-sm">معلّق صوتي ومصمّم محتوى بصري</p>
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
