import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export interface LightboxItem {
  src: string;
  alt?: string;
  /** اسم المشروع ورابطه، يظهران أسفل الصورة */
  caption?: string;
  href?: string;
}

/**
 * عارض صور بملء الشاشة: أسهم ولوحة مفاتيح، وسحب بالإصبع على الجوال،
 * وعدّاد، ورابط إلى المشروع الذي تنتمي إليه الصورة.
 */
export function Lightbox({ items, index, onChange, onClose }: {
  items: LightboxItem[];
  index: number | null;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const touchX = useRef<number | null>(null);
  const open = index !== null && items[index];
  const next = () => index !== null && onChange((index + 1) % items.length);
  const prev = () => index !== null && onChange((index - 1 + items.length) % items.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // الاتجاه عربي: السهم الأيسر يتقدّم
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  // تحميل الصورة التالية مسبقاً ليكون التنقّل فورياً
  useEffect(() => {
    if (index === null || items.length < 2) return;
    const img = new Image();
    img.src = items[(index + 1) % items.length].src;
  }, [index, items]);

  if (!open) return null;
  const item = items[index!];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-ink-950/95 backdrop-blur-sm" onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) { if (dx > 0) next(); else prev(); }
      }}>
      <div className="flex items-center justify-between p-4 text-sm text-gray-300">
        <span dir="ltr">{index! + 1} / {items.length}</span>
        <button onClick={onClose} aria-label="إغلاق" className="rounded-full p-2 hover:bg-white/10"><X size={22} /></button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2 min-h-0">
        <img key={item.src} src={item.src} alt={item.alt || item.caption || ""} onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-lg object-contain animate-in fade-in duration-200" />
        {items.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="السابقة"
              className="absolute right-2 hidden md:flex rounded-full bg-white/10 p-3 hover:bg-white/20"><ChevronRight size={24} /></button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="التالية"
              className="absolute left-2 hidden md:flex rounded-full bg-white/10 p-3 hover:bg-white/20"><ChevronLeft size={24} /></button>
          </>
        )}
      </div>

      {(item.caption || item.href) && (
        <div className="flex items-center justify-between gap-3 p-4" onClick={(e) => e.stopPropagation()}>
          <p className="line-clamp-1 text-sm text-gray-300">{item.caption}</p>
          {item.href && (
            <Link to={item.href} onClick={onClose} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-royal-300">
              المشروع كاملاً <ArrowLeft size={15} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
