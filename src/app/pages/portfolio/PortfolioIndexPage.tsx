import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Mic, Camera, Palette, Clapperboard, ArrowLeft, Play, Pause, MessageCircle } from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useSeo } from "../../shared/useSeo";
import { useText } from "../../shared/siteText";
import { useSitePhone } from "../../shared/useSitePhone";

type Category = "design" | "photography" | "voice" | "motion";

interface Work {
  id: string;
  slug?: string;
  title: string;
  coverImage?: string;
  images?: string[];
  altText?: string;
  audioUrl?: string;
  videoUrl?: string;
  featured?: boolean;
  homeSample?: boolean;
  order?: number;
  category: Category;
}

interface Client {
  id: string;
  name: string;
  logoUrl: string;
  logoAlt?: string;
}

/** مجالات الأعمال — كل مجال يقود إلى صفحته الكاملة */
const categories = [
  { key: "voice" as const, textKey: "works.voice", link: "/portfolio-voice", Icon: Mic, label: "تعليق صوتي" },
  { key: "motion" as const, textKey: "works.motion", link: "/portfolio-motion", Icon: Clapperboard, label: "موشن جرافيك" },
  { key: "design" as const, textKey: "works.design", link: "/portfolio-design", Icon: Palette, label: "تصميم" },
  { key: "photography" as const, textKey: "works.photography", link: "/portfolio-photography", Icon: Camera, label: "تصوير" },
];

const AR_COUNT: Record<number, string> = { 2: "مجالين", 3: "ثلاثة مجالات", 4: "أربعة مجالات", 5: "خمسة مجالات", 6: "ستة مجالات" };

const workLink = (w: Work) => `/portfolio/${w.slug || w.id}`;

// ============================================================
// معاينات حيّة داخل بطاقات المجالات
// ============================================================

/** غلاف الصوت: موجة بهوية الموقع + زر يُسمِع العينة الأبرز دون مغادرة الصفحة */
function VoicePreview({ sample }: { sample?: Work }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const bars = [0.3, 0.55, 0.4, 0.8, 0.6, 1, 0.7, 0.45, 0.85, 0.5, 0.95, 0.6, 0.35, 0.7, 0.5, 0.3];

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play().catch(() => {}); } else { a.pause(); }
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(122,42,49,0.55),transparent_70%)]">
      <div className="flex h-1/2 items-center gap-[3px]" aria-hidden>
        {bars.map((h, n) => (
          <span key={n} className={`w-[3px] rounded-full bg-gradient-to-b from-royal-300 to-royal-600 ${playing ? "animate-pulse" : ""}`}
            style={{ height: `${h * 100}%`, opacity: 0.45 + h * 0.5, animationDelay: `${n * 80}ms` }} />
        ))}
      </div>
      {sample?.audioUrl && (
        <>
          <audio ref={audioRef} src={sample.audioUrl} preload="none"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
          <button onClick={toggle} aria-label={playing ? "إيقاف العينة" : `استمع: ${sample.title}`}
            className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-royal-500 text-ink-950 shadow-lg shadow-royal-500/30 transition-transform hover:scale-110">
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="translate-x-[-1px]" />}
          </button>
        </>
      )}
    </div>
  );
}

/** غلاف الموشن: أول فيديو يعمل صامتاً ومتكرراً حين تظهر البطاقة فقط */
function MotionPreview({ work, fallback: Fallback }: { work?: Work; fallback: typeof Mic }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, [work?.videoUrl]);

  if (work?.videoUrl) {
    return <video ref={ref} src={work.videoUrl} poster={work.coverImage} muted loop playsInline preload="metadata"
      className="h-full w-full object-cover opacity-80" />;
  }
  if (work?.coverImage) return <img src={work.coverImage} alt={work.altText || work.title} loading="lazy" className="h-full w-full object-cover opacity-75" />;
  return <div className="flex h-full w-full items-center justify-center"><Fallback size={36} strokeWidth={1.3} className="text-royal-500/60" /></div>;
}

/** غلاف الصور: موزاييك من أغلفة أحدث الأعمال */
function MosaicPreview({ items, fallback: Fallback }: { items: Work[]; fallback: typeof Mic }) {
  const imgs = items.flatMap((w) => [w.coverImage, ...(w.images || [])]).filter(Boolean).slice(0, 3) as string[];
  if (!imgs.length) return <div className="flex h-full w-full items-center justify-center"><Fallback size={36} strokeWidth={1.3} className="text-royal-500/60" /></div>;
  if (imgs.length < 3) return <img src={imgs[0]} alt="" loading="lazy" className="h-full w-full object-cover opacity-75" />;
  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
      <img src={imgs[0]} alt="" loading="lazy" className="row-span-2 h-full w-full object-cover opacity-80" />
      <img src={imgs[1]} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
      <img src={imgs[2]} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
    </div>
  );
}

// ============================================================

export function PortfolioIndexPage() {
  const t = useText();
  const phone = useSitePhone();

  useSeo({
    title: t("works.heading"),
    description:
      "أعمال مصطفى جغلال في التعليق الصوتي والموشن جرافيك والتصميم الجرافيكي والتصوير — مشاريع مختارة لعلامات تجارية ومشاريع ثقافية.",
  });

  const [works, setWorks] = useState<Work[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "works"), (snap) => {
      setWorks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Work)));
    });
    const u2 = onSnapshot(collection(db, "clients"), (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Client)).filter((c) => c.logoUrl));
    });
    return () => { u1(); u2(); };
  }, []);

  const byCat = (k: Category) => works.filter((w) => w.category === k);
  const activeCount = categories.filter((c) => byCat(c.key).length > 0).length || categories.length;

  // الفقرة التعريفية تذكر عدد المجالات الفعلي مهما كُتب في لوحة التحكم
  const intro = t("works.intro").replace(/(مجالين|(ثلاثة|ثلاث|أربعة|أربع|خمسة|ستة) مجالات)/, AR_COUNT[activeCount] || `${activeCount} مجالات`);

  // أبرز الأعمال: المعلَّمة «مميز» من كل المجالات، وإلا أحدث الأعمال ذات الغلاف
  const withCover = works.filter((w) => w.coverImage);
  const featured = (withCover.some((w) => w.featured) ? withCover.filter((w) => w.featured) : withCover).slice(0, 8);

  const voiceSample = byCat("voice").find((w) => w.homeSample && w.audioUrl) || byCat("voice").find((w) => w.audioUrl);
  const motionWork = byCat("motion").find((w) => w.featured && w.videoUrl) || byCat("motion").find((w) => w.videoUrl) || byCat("motion")[0];

  const waText = encodeURIComponent("السلام عليكم مصطفى، اطلعت على أعمالك في موقعك وأرغب في عرض سعر لمشروع.");

  return (
    <div className="bg-ink-950 text-fg">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-16">
        <h1 className="text-3xl sm:text-4xl font-bold">{t("works.heading")}</h1>
        <span className="rule-accent mt-3" />
        {intro && <p className="mt-4 max-w-xl text-sm sm:text-base text-fg-muted leading-relaxed">{intro}</p>}

        {/* المجالات: شبكة 2×2 على الجوال لتظهر كلها في شاشة واحدة */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {categories.map(({ key, textKey, link, Icon, label }) => {
            const items = byCat(key);
            const title = t(`${textKey}.title`);
            return (
              <Link key={key} to={link}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 transition-colors hover:border-royal-600">
                <div className="relative aspect-[4/3] overflow-hidden bg-ink-850">
                  {key === "voice" && <VoicePreview sample={voiceSample} />}
                  {key === "motion" && <MotionPreview work={motionWork} fallback={Icon} />}
                  {(key === "design" || key === "photography") && <MosaicPreview items={items} fallback={Icon} />}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-900 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Icon size={16} strokeWidth={1.8} className="shrink-0 text-royal-400" />
                    {/* على الجوال اسم المجال المختصر، وعلى الشاشات الأكبر العنوان الكامل */}
                    <h2 className="text-sm sm:text-[1.05rem] font-semibold leading-snug transition-colors group-hover:text-royal-300">
                      <span className="sm:hidden">{label}</span>
                      <span className="hidden sm:inline">{title}</span>
                    </h2>
                  </div>
                  <p className="mt-2 hidden sm:block text-sm leading-relaxed text-fg-muted">{t(`${textKey}.desc`)}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-[11px] sm:text-xs text-fg-muted">
                      {items.length > 0 ? `${items.length} عملاً` : t("works.soon")}
                    </span>
                    <ArrowLeft size={15} className="text-royal-400 transition-transform group-hover:-translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* أبرز الأعمال: يرى الزائر عملك فوراً دون أن يدخل أي قسم */}
      {featured.length > 0 && (
        <section className="pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold">أبرز الأعمال</h2>
          </div>
          <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-w-7xl mx-auto">
            {featured.map((w) => {
              const cat = categories.find((c) => c.key === w.category);
              return (
                <Link key={w.id} to={workLink(w)}
                  className="group relative w-[62%] shrink-0 snap-start overflow-hidden rounded-xl border border-ink-700 bg-ink-900 sm:w-[30%] lg:w-[23%]">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={w.coverImage} alt={w.altText || w.title} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent p-3 pt-10">
                    {cat && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-royal-500/15 px-2 py-0.5 text-[10px] font-semibold text-royal-300">
                        <cat.Icon size={11} /> {cat.label}
                      </span>
                    )}
                    <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">{w.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* خاتمة: من عملت معهم + دعوة واضحة */}
      <section className="border-t border-ink-800 bg-ink-900/50 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          {clients.length > 0 && (
            <>
              <p className="text-xs font-semibold tracking-wide text-fg-muted">جهات عملت معها</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
                {clients.slice(0, 8).map((c) => (
                  <img key={c.id} src={c.logoUrl} alt={c.logoAlt || c.name} title={c.name} loading="lazy"
                    className="h-8 sm:h-10 w-auto max-w-[110px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
                ))}
              </div>
            </>
          )}
          <h2 className={`${clients.length ? "mt-10" : ""} text-2xl font-bold`}>عندك مشروع؟</h2>
          <p className="mt-2 text-fg-muted">أرسل لي الفكرة، وأعود إليك بعرض واضح.</p>
          <a href={`https://wa.me/${phone}?text=${waText}`} target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-royal-500 px-6 py-3 font-semibold text-ink-950 transition-colors hover:bg-royal-400">
            <MessageCircle size={18} /> اطلب عرضاً على واتساب
          </a>
        </div>
      </section>
    </div>
  );
}
