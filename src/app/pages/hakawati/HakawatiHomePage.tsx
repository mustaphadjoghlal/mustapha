import { useState, useEffect } from "react";
import { Link } from "react-router";
import { db } from "../../../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { BookOpen, Sparkles } from "lucide-react";

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

const PAGE_TITLE = "الحكواتي — حيث تعود أحداث الماضي للحياة | مصطفى جغلال";
const PAGE_DESC = "ركن الحكواتي: حكايات درامية من التاريخ العربي والإسلامي، ولعبة أسئلة تختبر معرفتك بالسير والأمجاد.";

export function HakawatiHomePage() {
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

  const latest = stories.filter((s) => s.published).slice(0, 3);

  return (
    <div className="min-h-screen text-[#f2e9da]" dir="rtl" style={{ background: "radial-gradient(ellipse at 50% -20%, #2b1a10 0%, #120b07 55%, #050302 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap');
        .hk-body { font-family: 'Tajawal', sans-serif; }
        .hk-display { font-family: 'Aref Ruqaa', serif; }
      `}</style>

      <div className="hk-body">
        {/* البطل — الشعار والهوية */}
        <section className="relative overflow-hidden">
          <h1 className="sr-only">الحكواتي — حيث تعود أحداث الماضي للحياة</h1>
          <img
            src="/hakawati/banner.jpg"
            alt="الحكواتي — حيث تعود أحداث الماضي للحياة"
            className="w-full h-auto max-h-[420px] object-cover object-top"
          />
        </section>

        <section className="relative px-4 pb-4 pt-12">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="w-24 h-px mx-auto mb-8" style={{ background: "linear-gradient(90deg, transparent, #a8763f, transparent)" }} />
            <p className="text-[#d9c9b0] text-lg leading-loose">
              منذ أن كان الحكواتي يجلس في صدر المقهى، وفانوسه إلى جانبه، والناس تتحلّق حوله لتسمع سيرة فارسٍ
              أو فتحَ مدينةٍ أو حكمة خليفة.. كانت الحكاية هي الذاكرة التي تنتقل من مجلسٍ إلى مجلس، ومن جيلٍ إلى جيل.
            </p>
            <p className="text-[#b39d7c] text-base leading-loose mt-4">
              هذا الركن امتداد لذلك المجلس القديم: حكايات من تاريخ أمّةٍ عظيمة، ولعبة أسئلة تختبر
              كم حفظت من سِيَر الأولين.
            </p>
          </div>
        </section>

        {/* بطاقة اللعبة */}
        <section className="px-4 pb-16 pt-8">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/hakawati/game"
              className="group flex flex-col sm:flex-row items-center gap-6 rounded-2xl p-8 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(160deg, rgba(58,36,20,0.85), rgba(18,11,7,0.9))", border: "1px solid rgba(168,99,46,0.35)" }}
            >
              <div className="text-5xl">🏮</div>
              <div className="flex-1 text-center sm:text-right">
                <h2 className="hk-display text-2xl text-[#c9853f] mb-2">افتح مجلس الأسئلة</h2>
                <p className="text-[#a8763f] text-sm leading-relaxed">
                  عشر ليالٍ، عشر حكايات، وثلاثة فوانيس.. هل تستحق لقب «حكواتي الزمان»؟
                </p>
              </div>
              <Sparkles className="text-[#c9853f] group-hover:scale-110 transition-transform" size={28} />
            </Link>
          </div>
        </section>

        {/* أحدث الحكايات */}
        <section className="px-4 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="hk-display text-3xl text-[#f2e9da] flex items-center gap-3">
                <BookOpen className="text-[#c9853f]" size={26} />
                أحدث الحكايات
              </h2>
              <Link to="/hakawati/stories" className="text-[#c9853f] text-sm font-semibold hover:text-[#f2e9da] transition-colors">
                كل الحكايات ←
              </Link>
            </div>

            {!loaded && (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(58,36,20,0.5)", border: "1px solid rgba(168,99,46,0.15)" }}>
                    <div className="h-40" style={{ background: "rgba(168,99,46,0.1)" }} />
                    <div className="p-5 space-y-3">
                      <div className="h-4 rounded w-3/4" style={{ background: "rgba(168,99,46,0.15)" }} />
                      <div className="h-3 rounded w-full" style={{ background: "rgba(168,99,46,0.1)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loaded && latest.length === 0 && (
              <div className="text-center py-16 rounded-2xl" style={{ border: "1px dashed rgba(168,99,46,0.3)" }}>
                <p className="text-4xl mb-3">📜</p>
                <p className="text-[#a8763f]">لا توجد حكايات بعد — ترقّبوا أول مجلس قريبًا</p>
              </div>
            )}

            {loaded && latest.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {latest.map((story) => (
                  <Link
                    key={story.id}
                    to={`/hakawati/stories/${story.id}`}
                    className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                    style={{ background: "linear-gradient(160deg, rgba(58,36,20,0.85), rgba(18,11,7,0.9))", border: "1px solid rgba(168,99,46,0.25)" }}
                  >
                    <div className="relative h-40 overflow-hidden" style={{ background: "rgba(168,99,46,0.08)" }}>
                      {story.coverImage ? (
                        <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-[#f2e9da] mb-2 group-hover:text-[#c9853f] transition-colors line-clamp-2">{story.title}</h3>
                      <p className="text-[#b39d7c] text-sm leading-relaxed line-clamp-2">{story.excerpt}</p>
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
