import { useState, useEffect } from "react";
import { Link } from "react-router";
import { db } from "../../../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useSeo } from "../../shared/useSeo";

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

export function ArticlesPage() {
  useSeo({
    title: "المقالات",
    description: "مقالات ونصائح في التعليق الصوتي والتصميم وصناعة المحتوى الرقمي بقلم مصطفى جغلال.",
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTag, setActiveTag] = useState<string>("الكل");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article)));
      setLoaded(true);
    });
    return unsub;
  }, []);

  const allTags = ["الكل", ...Array.from(new Set(articles.flatMap((a) => a.tags || [])))];
  const filtered = activeTag === "الكل" ? articles : articles.filter((a) => a.tags?.includes(activeTag));

  return (
    <div className="bg-ink-950 text-white min-h-screen" dir="rtl">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-royal-900/30 via-royal-800/15 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-royal-400 font-semibold mb-3 tracking-widest text-sm uppercase">أفكار ومعرفة</p>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-royal-400">
              المقالات
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            مقالات في التعليق الصوتي، التنشيط، الإعلام الرقمي، وكل ما أعرفه وأمارسه
          </p>
        </div>
      </section>

      {/* الفلاتر */}
      {allTags.length > 1 && (
        <section className="py-6 bg-gray-950 sticky top-0 z-20 border-b border-ink-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allTags.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTag === tag ? "bg-royal-600 text-white" : "bg-ink-900 text-gray-400 hover:text-white border border-ink-700"}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* المقالات */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!loaded && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-ink-900 border border-ink-700 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-ink-850" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-ink-850 rounded w-3/4" />
                    <div className="h-3 bg-ink-850 rounded w-full" />
                    <div className="h-3 bg-ink-850 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {loaded && filtered.length === 0 && (
            <div className="text-center text-gray-500 py-20">
              <p className="text-5xl mb-4">📝</p>
              <p className="text-xl">لا توجد مقالات بعد</p>
              <p className="text-gray-600 mt-2">قريباً — ترقّب المحتوى الجديد</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((article) => (
              <Link key={article.id} to={`/articles/${article.id}`}
                className="group bg-ink-900 border border-ink-700 rounded-2xl overflow-hidden hover:border-royal-500 transition-all hover:shadow-xl hover:shadow-royal-500/10">
                {/* الغلاف */}
                <div className="relative h-48 overflow-hidden bg-ink-850">
                  {article.coverImage ? (
                    <img src={article.coverImage} alt={article.coverAlt || article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-royal-900/45 to-royal-800/30">
                      <span className="text-5xl">📝</span>
                    </div>
                  )}
                  {article.category && (
                    <span className="absolute top-3 right-3 bg-royal-600/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {article.category}
                    </span>
                  )}
                </div>

                {/* المحتوى */}
                <div className="p-6">
                  {article.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {article.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs text-royal-300 bg-royal-900/30 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-white mb-2 group-hover:text-royal-300 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
                    {article.content?.replace(/<[^>]*>/g, "").substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">{article.date}</span>
                    <span className="text-royal-400 text-sm font-semibold group-hover:gap-2 transition-all flex items-center gap-1">
                      اقرأ المزيد ←
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
