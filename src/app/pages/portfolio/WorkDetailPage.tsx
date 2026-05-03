import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { db } from "../../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomAudioPlayer } from "../../components/CustomAudioPlayer";

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

export function WorkDetailPage() {
  const { id } = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "works", id), (d) => {
      if (d.exists()) setWork({ id: d.id, ...d.data() } as Work);
      setLoaded(true);
    });
    return unsub;
  }, [id]);

  const allImages = work ? [
    ...(work.coverImage ? [work.coverImage] : []),
    ...(work.images || []).filter(img => img !== work.coverImage),
  ] : [];

  const nextImg = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex < allImages.length - 1 ? lightboxIndex + 1 : 0);
  };

  const prevImg = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : allImages.length - 1);
  };

  const backLink = work?.category === "design" ? "/portfolio-design"
    : work?.category === "photography" ? "/portfolio-photography"
    : "/portfolio-voice";

  if (!loaded) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!work) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold mb-4">العمل غير موجود</h2>
        <Link to="/portfolio-design" className="text-blue-400 hover:underline">← العودة للأعمال</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-black text-white min-h-screen" dir="rtl">
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 left-4 text-white hover:text-gray-300 z-10" onClick={() => setLightboxIndex(null)}>
            <X size={32} />
          </button>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[lightboxIndex]} alt={work.altText || work.title}
              className="w-full max-h-[85vh] object-contain rounded-xl" loading="lazy" />
            {allImages.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all">
                  <ChevronRight size={24} />
                </button>
                <button onClick={nextImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex justify-center gap-2 mt-4">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => setLightboxIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${i === lightboxIndex ? "bg-blue-400 w-6" : "bg-gray-600 w-1.5"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to={backLink} className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm w-fit">
          <ArrowRight size={16} />
          العودة للأعمال
        </Link>
      </div>

      {/* صورة الغلاف */}
      {work.coverImage && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxIndex(0)}>
            <img src={work.coverImage} alt={work.altText || work.title}
              className="w-full max-h-[500px] object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        </div>
      )}

      {/* المعلومات */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{work.title}</h1>
        {work.description && <p className="text-gray-400 text-lg leading-relaxed mb-10">{work.description}</p>}

        {/* المشغل الصوتي المخصص أو SoundCloud */}
        {work.category === "voice" && (work.audioUrl || work.soundcloudUrl) && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">استمع للعمل</h2>
            {work.audioUrl ? (
              <CustomAudioPlayer src={work.audioUrl} title={work.title} coverImage={work.coverImage} />
            ) : (
              <iframe
                width="100%" height="120" scrolling="no" frameBorder="no" allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(work.soundcloudUrl)}&color=%23a855f7&auto_play=false&hide_related=true&show_comments=false&show_user=true`}
                className="rounded-xl"
              />
            )}
          </div>
        )}

        {/* صور المحتوى */}
        {work.images && work.images.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-6">صور المشروع</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {work.images.map((img, i) => (
                <div key={i} className="relative group aspect-square overflow-hidden rounded-xl cursor-pointer border border-gray-800 hover:border-blue-500 transition-all"
                  onClick={() => setLightboxIndex(work.coverImage ? i + 1 : i)}>
                  <img src={img} alt={`${work.title} ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
