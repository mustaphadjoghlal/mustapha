import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Maximize2 } from "lucide-react";

/**
 * معرض "طافٍ": كل عمل يرتفع وينزل بحركة بطيئة مستقلة عن جيرانه،
 * ويميل قليلاً مع حركة المؤشر، ويظهر تدريجياً عند الوصول إليه بالتمرير.
 * الصور تحتفظ بنسبها الأصلية (تخطيط أعمدة) لأن قصّها يضرّ بعمل مصمّم ومصوّر.
 */

/** يضيف صنف is-in لكل عنصر حين يدخل الشاشة — مرة واحدة */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

/** أرقام ثابتة لكل بطاقة حتى لا تتزامن الحركات ولا تتغيّر عند إعادة الرسم */
function rhythm(index: number) {
  const durations = [6.8, 8.2, 7.4, 9, 7.9, 8.6];
  const drifts = [10, 7, 12, 8, 11, 9];
  return {
    "--dur": `${durations[index % durations.length]}s`,
    "--delay": `${(index % 5) * 0.55}s`,
    "--drift": `${drifts[index % drifts.length]}px`,
  } as CSSProperties;
}

interface FloatingItemProps {
  src: string;
  alt: string;
  index: number;
  priority?: boolean;
  onOpen: () => void;
}

function FloatingItem({ src, alt, index, priority = false, onOpen }: FloatingItemProps) {
  const reveal = useReveal<HTMLDivElement>();
  const tiltRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  /** ميلان خفيف جداً (٤ درجات كحد أقصى) وعلى الأجهزة ذات المؤشر فقط */
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const box = el.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--ry", `${x * 8}deg`);
    el.style.setProperty("--rx", `${-y * 8}deg`);
  };

  const handleLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <div ref={reveal} className="reveal relative mb-8 break-inside-avoid">
      <div className="float-shadow" style={rhythm(index)} aria-hidden="true" />

      <div className="float" style={rhythm(index)}>
        <div
          ref={tiltRef}
          className="tilt group relative cursor-zoom-in overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 transition-colors hover:border-royal-500"
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
          {!loaded && <div className="absolute inset-0 animate-pulse bg-ink-850" />}
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setLoaded(true)}
            className={`block w-full transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          />

          {/* طبقة خفيفة + أيقونة تكبير تظهر عند المرور */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="pointer-events-none absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/70 text-royal-200 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100">
            <Maximize2 size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FloatingGallery({ images, alt, onOpen, startIndex = 0 }: {
  images: string[];
  alt: string;
  /** يُستدعى برقم الصورة في قائمة العرض الكاملة */
  onOpen: (index: number) => void;
  /** إزاحة الترقيم حين تسبق صورة الغلاف بقية الصور */
  startIndex?: number;
}) {
  if (images.length === 0) return null;

  return (
    <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
      {images.map((src, i) => (
        <FloatingItem
          key={src + i}
          src={src}
          alt={`${alt} — ${i + 1}`}
          index={i}
          priority={i < 2}
          onOpen={() => onOpen(startIndex + i)}
        />
      ))}
    </div>
  );
}
