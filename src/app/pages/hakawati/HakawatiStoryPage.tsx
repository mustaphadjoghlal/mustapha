import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { db } from "../../../firebase";
import { doc, onSnapshot, collection } from "firebase/firestore";
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

interface SiteInfo {
  profileImageUrl: string;
}

function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function HakawatiStoryPage() {
  const { id } = useParams();
  const [story, setStory] = useState<HakawatiStory | null>(null);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "hakawati_stories", id), (d) => {
      if (d.exists()) setStory({ id: d.id, ...d.data() } as HakawatiStory);
      else setStory(null);
      setLoaded(true);
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "siteInfo"), (s) => {
      if (!s.empty) setSiteInfo(s.docs[0].data() as SiteInfo);
    });
    return unsub;
  }, []);

  const visible = story && story.published;

  useEffect(() => {
    if (!visible || !story) return;
    document.title = `${story.title} — الحكواتي — مصطفى جغلال`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", story.excerpt || story.content?.replace(/<[^>]*>/g, "").substring(0, 160));
  }, [visible, story]);

  const fontImport = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap');
      .hk-body { font-family: 'Tajawal', sans-serif; }
      .hk-display { font-family: 'Aref Ruqaa', serif; }
    `}</style>
  );

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0e1626" }}>
      <div className="w-8 h-8 border-2 border-[#e8b45a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!visible) return (
    <div className="min-h-screen text-[#f0e6d2] flex items-center justify-center" dir="rtl" style={{ background: "radial-gradient(ellipse at 50% -20%, #1d2f4e 0%, #0e1626 55%, #080d18 100%)" }}>
      {fontImport}
      <div className="text-center hk-body">
        <p className="text-5xl mb-4">📜</p>
        <h2 className="hk-display text-2xl text-[#e8b45a] mb-4">الحكاية غير موجودة</h2>
        <Link to="/hakawati/stories" className="text-[#e8b45a] hover:underline">← العودة للحكايات</Link>
      </div>
    </div>
  );

  const embedUrl = story!.videoUrl ? youtubeEmbedUrl(story!.videoUrl) : null;

  const storySchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": story!.title,
    "author": {
      "@type": "Person",
      "name": "مصطفى جغلال",
      "alternateName": "Mustapha Djoghlal",
      "url": "https://mustaphadjoghlal.com",
      "image": siteInfo?.profileImageUrl || "https://mustaphadjoghlal.com/og-image.jpg",
    },
    "publisher": {
      "@type": "Person",
      "name": "مصطفى جغلال",
      "url": "https://mustaphadjoghlal.com",
    },
    "datePublished": story!.publishedAt,
    "image": story!.coverImage || "https://mustaphadjoghlal.com/og-image.jpg",
    "url": `https://mustaphadjoghlal.com/hakawati/stories/${id}`,
    "description": story!.excerpt || story!.content?.replace(/<[^>]*>/g, "").substring(0, 160),
  };

  return (
    <div className="min-h-screen text-[#f0e6d2]" dir="rtl" style={{ background: "radial-gradient(ellipse at 50% -20%, #1d2f4e 0%, #0e1626 55%, #080d18 100%)" }}>
      {fontImport}

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storySchema) }} />

      <div className="hk-body">
        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link to="/hakawati/stories" className="flex items-center gap-2 text-[#c9a96a] hover:text-[#e8b45a] transition-colors text-sm w-fit">
            <ArrowRight size={16} />
            العودة للحكايات
          </Link>
        </div>

        {/* الغلاف */}
        {story!.coverImage && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="rounded-2xl overflow-hidden h-64 md:h-96" style={{ border: "1px solid rgba(200,160,90,0.3)" }}>
              <img src={story!.coverImage} alt={story!.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        )}

        {/* المحتوى */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="hk-display text-3xl md:text-5xl mb-4 leading-tight text-[#e8b45a]">{story!.title}</h1>

          <div className="flex items-center gap-4 text-[#8a7d61] text-sm mb-10 pb-6" style={{ borderBottom: "1px solid rgba(200,160,90,0.2)" }}>
            <span>{story!.publishedAt}</span>
            <span>بقلم مصطفى جغلال</span>
          </div>

          {/* فيديو مرفق */}
          {story!.videoUrl && (
            <div className="mb-10">
              {embedUrl ? (
                <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "16 / 9", border: "1px solid rgba(200,160,90,0.3)" }}>
                  <iframe
                    src={embedUrl}
                    title={story!.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={story!.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all"
                  style={{ background: "linear-gradient(160deg, #d9a94f, #b08035)", color: "#1a1206" }}
                >
                  شاهد المقطع المرفق ↗
                </a>
              )}
            </div>
          )}

          <style>{`
            .hk-story-body { font-size:1.1rem; line-height:2; color:#d8cbb0; }
            .hk-story-body h2 { font-family:'Aref Ruqaa', serif; font-size:1.6rem; color:#e8b45a; margin-top:2.2rem; margin-bottom:1rem; padding-bottom:0.4rem; border-bottom:2px solid rgba(232,180,90,0.4); }
            .hk-story-body h3 { font-family:'Aref Ruqaa', serif; font-size:1.3rem; color:#f0e6d2; margin-top:1.8rem; margin-bottom:0.75rem; }
            .hk-story-body p { margin-bottom:1.3rem; }
            .hk-story-body strong { font-weight:700; color:#f0e6d2; }
            .hk-story-body ul { list-style:none; padding:0; margin:1.2rem 0; }
            .hk-story-body ul li { padding-right:1.5rem; position:relative; margin-bottom:0.5rem; }
            .hk-story-body ul li::before { content:"◈"; position:absolute; right:0; color:#e8b45a; font-size:0.8rem; top:0.5rem; }
            .hk-story-body ol { padding-right:1.5rem; margin:1.2rem 0; counter-reset:item; list-style:none; }
            .hk-story-body ol li { counter-increment:item; margin-bottom:0.8rem; position:relative; padding-right:2rem; }
            .hk-story-body ol li::before { content:counter(item); position:absolute; right:0; background:#b08035; color:#1a1206; width:1.4rem; height:1.4rem; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; top:0.15rem; }
            .hk-story-body blockquote { border-right:4px solid #e8b45a; padding:1rem 1.2rem; margin:1.5rem 0; color:#b5a582; font-style:italic; background:rgba(0,0,0,0.2); border-radius:0 0.5rem 0.5rem 0; }
            .hk-story-body a { color:#e8b45a; text-decoration:none; }
            .hk-story-body a:hover { text-decoration:underline; }
          `}</style>

          <div className="hk-story-body" dangerouslySetInnerHTML={{ __html: story!.content }} />

          {/* رجوع */}
          <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(200,160,90,0.2)" }}>
            <Link to="/hakawati/stories" className="inline-flex items-center gap-2 text-[#e8b45a] hover:text-[#f0e6d2] transition-colors font-semibold">
              <ArrowRight size={18} />
              العودة لجميع الحكايات
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
