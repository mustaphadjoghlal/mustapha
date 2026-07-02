import { useState, useEffect } from "react";
import { Link } from "react-router";
import { db } from "../../../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { ArrowRight } from "lucide-react";

interface HakawatiStory {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  videoUrl?: string;
  publishedAt: string;
  published: boolean;
}

const PAGE_TITLE = "حكايات الحكواتي — مصطفى جغلال";
const PAGE_DESC = "كل حكايات ركن الحكواتي: سِيَر وأمجاد من التاريخ العربي والإسلامي، بأسلوب سردي درامي.";

export function HakawatiStoriesPage() {
  const [stories, setStories] = useState<HakawatiStory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", PAGE_DESC);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "hakawati_stories"), orderBy("publishedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as HakawatiStory)));
      setLoaded(true);
    });
    return unsub;
  }, []);

  const published = stories.filter((s) => s.published);

  return (
    <div className="min-h-screen text-[#f0e6d2]" dir="rtl" style={{ background: "radial-gradient(ellipse at 50% -20%, #1d2f4e 0%, #0e1626 55%, #080d18 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap');
        .hk-body { font-family: 'Tajawal', sans-serif; }
        .hk-display { font-family: 'Aref Ruqaa', serif; }
      `}</style>

      <div className="hk-body">
        {/* البطل */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Link to="/hakawati" className="inline-flex items-center gap-2 text-[#c9a96a] hover:text-[#e8b45a] transition-colors text-sm mb-6">
              <ArrowRight size={16} />
              العودة لركن الحكواتي
            </Link>
            <p className="text-[#c9a96a] font-semibold mb-3 tracking-widest text-sm uppercase">مجلس الحكايات</p>
            <h1 className="hk-display text-4xl lg:text-5xl text-[#e8b45a]">كل الحكايات</h1>
          </div>
        </section>

        {/* الحكايات */}
        <section className="px-4 pb-24">
          <div className="max-w-6xl mx-auto">
            {!loaded && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(30,42,66,0.5)", border: "1px solid rgba(200,160,90,0.15)" }}>
                    <div className="h-40" style={{ background: "rgba(200,160,90,0.1)" }} />
                    <div className="p-5 space-y-3">
                      <div className="h-4 rounded w-3/4" style={{ background: "rgba(200,160,90,0.15)" }} />
                      <div className="h-3 rounded w-full" style={{ background: "rgba(200,160,90,0.1)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loaded && published.length === 0 && (
              <div className="text-center py-20 rounded-2xl" style={{ border: "1px dashed rgba(200,160,90,0.3)" }}>
                <p className="text-5xl mb-4">📜</p>
                <p className="text-xl text-[#c9a96a]">لا توجد حكايات بعد</p>
                <p className="text-[#8a7d61] mt-2">ترقّبوا أول مجلس قريبًا</p>
              </div>
            )}

            {loaded && published.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {published.map((story) => (
                  <Link
                    key={story.id}
                    to={`/hakawati/stories/${story.id}`}
                    className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                    style={{ background: "linear-gradient(160deg, rgba(30,42,66,0.85), rgba(16,24,42,0.9))", border: "1px solid rgba(200,160,90,0.25)" }}
                  >
                    <div className="relative h-44 overflow-hidden" style={{ background: "rgba(200,160,90,0.08)" }}>
                      {story.coverImage ? (
                        <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="font-bold text-[#f0e6d2] mb-2 group-hover:text-[#e8b45a] transition-colors line-clamp-2">{story.title}</h2>
                      <p className="text-[#b5a582] text-sm leading-relaxed line-clamp-3 mb-3">{story.excerpt}</p>
                      <span className="text-[#e8b45a] text-xs font-semibold">اقرأ الحكاية ←</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
