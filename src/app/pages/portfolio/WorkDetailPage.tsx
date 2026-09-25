import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { db } from "../../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomAudioPlayer } from "../../components/CustomAudioPlayer";
import { FloatingGallery } from "../../components/FloatingGallery";
import { useSeo } from "../../shared/useSeo";

interface Work {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  altText: string;
  soundcloudUrl: string;
  audioUrl?: string;
  category: "design" | "photography" | "voice";
}

/** صورة الغلاف — طافية فوق ظلّ أزرق، تميل قليلاً مع المؤشر */
function FloatingCover({ src, alt, onOpen }: { src: string; alt: string; onOpen: () => void }) {
  const tiltRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const box = el.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--ry", `${x * 6}deg`);
    el.style.setProperty("--rx", `${-y * 6}deg`);
  };

  const handleLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  const rhythm = { "--dur": "9s", "--drift": "10px" } as React.CSSProperties;

  return (
    <div className="reveal is-in relative">
      <div className="float-shadow" style={rhythm} aria-hidden="true" />
      <div className="float" style={rhythm}>
        <div
          ref={tiltRef}
          className="tilt group relative cursor-zoom-in overflow-hidden rounded-3xl border border-ink-700"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          onClick={onOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen();
            }
          }}
          aria-label={`تكبير: ${alt}`}
        >
          <img src={src} alt={alt} className="block w-full object-cover" loading="eager" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}

export function WorkDetailPage() {
  const { id } = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useSeo({
    title: work?.title,
    description: work?.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().substring(0, 160),
    image: work?.coverImage || undefined,
    type: "article",
  });

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "works", id), (d) => {
      if (d.exists()) setWork({ id: d.id, ...d.data() } as Work);
      setLoaded(true);
    });
    return unsub;
  }, [id]);

  const allImages = work
    ? [
        ...(work.coverImage ? [work.coverImage] : []),
        ...(work.images || []).filter((img) => img !== work.coverImage),
      ]
    : [];

  const nextImg = () =>
    setLightboxIndex((i) => (i === null ? i : i < allImages.length - 1 ? i + 1 : 0));
  const prevImg = () =>
    setLightboxIndex((i) => (i === null ? i : i > 0 ? i - 1 : allImages.length - 1));

  // تصفّح الصور بلوحة المفاتيح، ومنع تمرير الصفحة خلف العارض
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      // في واجهة عربية: السهم الأيسر يتقدّم والأيمن يرجع
      if (e.key === "ArrowLeft") nextImg();
      if (e.key === "ArrowRight") prevImg();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [lightboxIndex, allImages.length]);

  const backLink =
    work?.category === "design"
      ? "/portfolio-design"
      : work?.category === "photography"
      ? "/portfolio-photography"
      : "/portfolio-voice";

  if (!loaded)
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-royal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!work)
    return (
      <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">العمل غير موجود</h2>
          <Link to="/portfolio" className="text-royal-400 hover:underline">← العودة للأعمال</Link>
        </div>
      </div>
    );

  const isVisual = work.category === "design" || work.category === "photography";
  const gallery = (work.images || []).filter((img) => img !== work.coverImage);

  return (
    <div className="bg-ink-950 text-white min-h-screen" dir="rtl">
      {/* عارض الصورة المكبّرة */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-ink-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 left-4 text-white hover:text-royal-300 z-10"
            onClick={() => setLightboxIndex(null)}
            aria-label="إغلاق"
          >
            <X size={32} />
          </button>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={allImages[lightboxIndex]}
              alt={work.altText || work.title}
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />
            {allImages.length > 1 && (
              <>
                <button onClick={prevImg} aria-label="السابق" className="absolute right-2 top-1/2 -translate-y-1/2 bg-ink-950/60 hover:bg-ink-950/80 text-white p-3 rounded-full transition-all">
                  <ChevronRight size={24} />
                </button>
                <button onClick={nextImg} aria-label="التالي" className="absolute left-2 top-1/2 -translate-y-1/2 bg-ink-950/60 hover:bg-ink-950/80 text-white p-3 rounded-full transition-all">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex justify-center gap-2 mt-4">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      aria-label={`الصورة ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === lightboxIndex ? "bg-royal-400 w-6" : "bg-ink-600 w-1.5"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* العودة */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-8">
        <Link to={backLink} className="flex items-center gap-2 text-fg-muted hover:text-royal-300 transition-colors text-sm w-fit">
          <ArrowRight size={16} />
          العودة للأعمال
        </Link>
      </div>

      {isVisual ? (
        <>
          {/* تكوين: الغلاف طافياً إلى جانب العنوان بدل رصفهما فوق بعض */}
          <section className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              style={{ background: "radial-gradient(60% 45% at 30% 20%, rgba(49,87,213,0.14), transparent 70%)" }}
            />
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
              {work.coverImage && (
                <FloatingCover
                  src={work.coverImage}
                  alt={work.altText || work.title}
                  onOpen={() => setLightboxIndex(0)}
                />
              )}
              <div className="fade-up">
                <span className="rule-accent" />
                <h1 className="mt-5 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.25]">{work.title}</h1>
                {work.description && (
                  <p className="mt-5 text-fg-muted leading-[1.9]">{work.description}</p>
                )}
                {gallery.length > 0 && (
                  <p className="mt-6 text-sm text-fg-muted">
                    {gallery.length + (work.coverImage ? 1 : 0)} صورة في هذا المشروع
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* المعرض الطافي */}
          {gallery.length > 0 && (
            <section className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pb-24">
              <FloatingGallery
                images={gallery}
                alt={work.altText || work.title}
                startIndex={work.coverImage ? 1 : 0}
                onOpen={(i) => setLightboxIndex(i)}
              />
            </section>
          )}
        </>
      ) : (
        /* التعليق الصوتي — عرض بسيط يركّز على الصوت */
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{work.title}</h1>
          {work.description && <p className="text-fg-muted text-lg leading-relaxed mb-10">{work.description}</p>}

          {(work.audioUrl || work.soundcloudUrl) && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4">استمع للعمل</h2>
              {work.audioUrl ? (
                <CustomAudioPlayer src={work.audioUrl} title={work.title} coverImage={work.coverImage} />
              ) : (
                <iframe
                  title={work.title}
                  width="100%"
                  height="120"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(work.soundcloudUrl)}&color=%233157d5&auto_play=false&hide_related=true&show_comments=false&show_user=true`}
                  className="rounded-xl"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
