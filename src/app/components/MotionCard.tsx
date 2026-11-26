import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Play, Volume2, VolumeX } from "lucide-react";

export interface MotionWork {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  altText?: string;
  /** الفيديو المرفوع إلى التخزين */
  videoUrl?: string;
  /** رابط خارجي اختياري (يوتيوب أو فيميو أو إنستغرام) */
  videoLink?: string;
  /** نسبة الفيديو تُكتشف عند الرفع: عمودي 9:16، أفقي 16:9، مربع 1:1 */
  videoAspect?: "vertical" | "horizontal" | "square";
}

export const aspectClass = (a?: MotionWork["videoAspect"]) =>
  a === "horizontal" ? "aspect-video" : a === "square" ? "aspect-square" : "aspect-[9/16]";

/** معرّف يوتيوب من أي صيغة رابط شائعة */
export function youtubeId(url?: string) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  return m ? m[1] : null;
}

/**
 * بطاقة عمل موشن: الفيديو يعمل صامتاً ومتكرراً حين تظهر البطاقة على الشاشة
 * ويتوقف حين تغيب — فلا تُستهلك البيانات في فيديوهات لا يراها أحد.
 * زر صغير لتشغيل الصوت، والنقر على البطاقة يفتح صفحة العمل.
 */
/**
 * frame: إطار موحّد للبطاقات في الشبكات (3:4) حتى تصطف الفيديوهات العمودية والأفقية
 * بلا فراغات — الفيديو يملأ الإطار، ويظهر بنسبته الكاملة في صفحة العمل.
 */
export function MotionCard({ work, className = "", frame = "aspect-[3/4]" }: { work: MotionWork; className?: string; frame?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const yt = youtubeId(work.videoLink);
  const poster = work.coverImage || (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : undefined);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !work.videoUrl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, [work.videoUrl]);

  return (
    <Link
      to={`/portfolio/${work.id}`}
      className={`ms-glass ms-lift group relative block overflow-hidden rounded-[1.4rem] ${className}`}
    >
      <div className={`relative ${frame} bg-ink-850`}>
        {poster && (
          <img
            src={poster}
            alt={work.altText || work.title}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
          />
        )}
        {work.videoUrl && (
          <video
            ref={videoRef}
            // #t=0.1 يُظهر أول إطار حتى لو لم تُرفع صورة غلاف
            src={`${work.videoUrl}#t=0.1`}
            muted={muted}
            loop
            playsInline
            preload="metadata"
            onPlaying={() => setReady(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {!work.videoUrl && !poster && (
          <div className="absolute inset-0 flex items-center justify-center text-fg-muted"><Play size={36} /></div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />

        {work.videoUrl ? (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMuted((m) => !m); }}
            aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
            className="ms-glass absolute top-3 end-3 flex h-9 w-9 items-center justify-center rounded-full text-fg opacity-80 transition-opacity hover:opacity-100"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        ) : (
          <span className="ms-glass absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-royal-300">
            <Play size={22} className="ms-1" />
          </span>
        )}

        <h3 className="absolute inset-x-0 bottom-0 p-4 text-sm sm:text-base font-semibold text-fg">{work.title}</h3>
      </div>
    </Link>
  );
}

/** مشغّل الفيديو الكامل لصفحة العمل */
export function MotionPlayer({ work }: { work: MotionWork }) {
  const yt = youtubeId(work.videoLink);
  const vertical = work.videoAspect === "vertical" || (!work.videoAspect && !yt);
  const frame = `${aspectClass(work.videoAspect ?? (yt ? "horizontal" : "vertical"))} ${vertical ? "max-w-[24rem]" : "max-w-4xl"} mx-auto w-full overflow-hidden rounded-[1.4rem] border border-royal-200/10 bg-black shadow-[0_30px_60px_rgba(0,0,0,0.5)]`;

  if (work.videoUrl) {
    return (
      <div className={frame}>
        <video src={work.videoUrl} poster={work.coverImage || undefined} controls playsInline preload="metadata" className="h-full w-full" />
      </div>
    );
  }
  if (yt) {
    return (
      <div className={frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0`}
          title={work.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }
  if (work.videoLink) {
    return (
      <a href={work.videoLink} target="_blank" rel="noopener noreferrer" className="ms-btn ms-btn-primary mx-auto">
        شاهد الفيديو <Play size={15} />
      </a>
    );
  }
  return null;
}
