import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router";
import {
  Mic, Video, Palette, TrendingUp, ArrowLeft, ArrowRight, Linkedin, Instagram, Twitter,
  Layers, Users, AudioLines, Clapperboard,
} from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useSeo } from "../../shared/useSeo";
import { useText } from "../../shared/siteText";
import { VoiceSampleCard } from "../../components/VoiceSampleCard";
import { MotionCard, type MotionWork } from "../../components/MotionCard";

interface SiteInfo {
  heroName: string;
  /** عنوان البطل — الجزء الأبيض. كل سطر جديد يظهر سطراً مستقلاً */
  heroTitle: string;
  /** عنوان البطل — الجزء الذهبي */
  heroTitleAccent: string;
  heroDescription: string;
  profileImageUrl: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  twitterUrl: string;
  instagramUrl: string;
}

interface Client {
  id: string;
  name: string;
  logoUrl: string;
  logoAlt: string;
}

interface Work {
  id: string;
  title: string;
  coverImage: string;
  altText: string;
  audioUrl?: string;
  soundcloudUrl?: string;
  category: "design" | "photography" | "voice" | "motion";
  videoUrl?: string;
  videoLink?: string;
  videoAspect?: MotionWork["videoAspect"];
  /** يُحدَّد من لوحة التحكم — يظهر في قسم "أعمال مختارة" */
  featured?: boolean;
  /** العينة الصوتية المختارة لقسم "نماذج صوتية" */
  homeSample?: boolean;
}

const CACHE_KEY = "mustapha_site_info";
const CACHE_TTL = 1000 * 60 * 30;

function getCached(): SiteInfo | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCache(data: SiteInfo) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

const defaults: SiteInfo = {
  heroName: "مصطفى جغلال",
  // نسخة احتياطية تظهر لمحركات البحث وللزائر ريثما تصل القيمة من لوحة التحكم،
  // فبدونها تبقى الصفحة الرئيسية بلا عنوان h1 في عين الزاحف.
  heroTitle: "أحول الأفكار",
  heroTitleAccent: "إلى حــــقـيـقـة",
  heroDescription:
    "معلّق صوتي وصانع محتوى ومصمم، أساعد العلامات التجارية والمشاريع على تقديم أفكارها بصوت وصورة أكثر تأثيراً.",
  profileImageUrl: "",
  email: "mustaphadjoghlal.pro@gmail.com",
  phone: "",
  linkedinUrl: "",
  twitterUrl: "",
  instagramUrl: "",
};

/** مجالات العمل الأربعة */
const services = [
  { Icon: Mic, key: "voice", link: "/portfolio-voice" },
  { Icon: Video, key: "content", link: "/portfolio-photography" },
  { Icon: Palette, key: "design", link: "/portfolio-design" },
  { Icon: TrendingUp, key: "marketing", link: "/about" },
];

/** أطوال أعمدة الموجة — نمط ثابت يشبه موجة كلام حقيقية */
const WAVE = [
  22, 38, 30, 54, 70, 46, 82, 64, 40, 58, 92, 74, 50, 36, 62, 88, 100, 76, 52, 66,
  44, 30, 58, 80, 96, 70, 48, 34, 56, 78, 60, 42, 28, 50, 72, 90, 68, 46, 38, 60,
  84, 64, 40, 26, 48, 70, 56, 34, 24, 40, 58, 44, 30, 20,
];

/** يختصر الوصف في البطل إلى أول جملة أو جملتين دون قطع الكلام في منتصفه */
function shortenDescription(text: string, limit = 130) {
  const clean = text.trim();
  if (clean.length <= limit) return clean;
  const sentences = clean.split(/(?<=\.)\s+/);
  let out = "";
  for (const sentence of sentences) {
    if (out && (out + " " + sentence).length > limit) break;
    out = out ? `${out} ${sentence}` : sentence;
  }
  return out || sentences[0];
}

/** يفكّك عنوان البطل — المكتوب في لوحة التحكم — إلى أسطر */
function titleLines(text: string) {
  return (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
}

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** يضيف is-in حين يدخل العنصر الشاشة — مرة واحدة */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** عدّاد يبدأ حين يظهر الرقم على الشاشة */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || value <= 0) return;
    if (reducedMotion()) { setShown(value); return; }
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / 1600, 1);
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref} className="tabular-nums">{shown}</span>;
}

/* ═══════════ البطل ═══════════ */

function HeroWave() {
  const ref = useRef<HTMLDivElement>(null);

  // الأعمدة القريبة من المؤشر ترتفع — على أجهزة اللمس تبقى ثابتة
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
    const bars = Array.from(el.children) as HTMLElement[];
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const near = e.clientY > rect.top - 260 && e.clientY < rect.bottom + 260;
        bars.forEach((bar) => {
          const b = bar.getBoundingClientRect();
          const dist = Math.abs(e.clientX - (b.left + b.width / 2));
          const boost = near ? Math.max(0, 1 - dist / 220) : 0;
          bar.style.setProperty("--boost", boost.toFixed(3));
        });
      });
    };
    const onLeave = () => bars.forEach((bar) => bar.style.setProperty("--boost", "0"));
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" dir="ltr" className="ms-wave flex h-16 sm:h-20 items-center gap-[3px] sm:gap-[5px]">
      {WAVE.map((h, i) => (
        <span key={i} style={{ "--h": `${h}%`, "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

interface HeroProps {
  siteInfo: SiteInfo;
  whatsappUrl: string;
  socials: { url: string; Icon: typeof Mic; label: string }[];
}

function Hero({ siteInfo, whatsappUrl, socials }: HeroProps) {
  const t = useText();
  const ref = useRef<HTMLElement>(null);
  const lines = titleLines(siteInfo.heroTitle || defaults.heroTitle);
  const accent = (siteInfo.heroTitleAccent || defaults.heroTitleAccent).trim();

  // كلما نزل الزائر يصغر العنوان ويخفت — كأن الصفحة تنسحب نحو الأعمال
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const p = Math.min(Math.max(window.scrollY / (el.offsetHeight * 0.85), 0), 1);
        el.style.setProperty("--p", p.toFixed(3));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={ref} className="ms-hero ms-grain relative -mt-16 overflow-hidden">
      {/* التوهّج العنابي في الأعلى + زخرفة النجمة */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(90% 60% at 50% -8%, rgba(122,42,49,0.85), rgba(75,19,23,0.35) 45%, transparent 75%)" }}
        />
        <div
          className="ms-pattern absolute inset-0 opacity-[0.07]"
          style={{
            maskImage: "radial-gradient(70% 60% at 50% 30%, #000 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(70% 60% at 50% 30%, #000 20%, transparent 75%)",
          }}
        />
        {/* هالة الزعفران — من خلفية صورة الحساب */}
        <div
          className="ms-halo absolute left-1/2 top-[46%] aspect-square w-[min(68vw,640px)] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(238,168,81,0.20), rgba(238,168,81,0.05) 55%, transparent 70%)" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[86svh] sm:min-h-[100svh] max-w-7xl flex-col px-5 pt-24 pb-7 sm:px-8 lg:pt-24">
        <div className="ms-hero-inner flex flex-1 flex-col items-center justify-center text-center">
          {t("home.hero.tagline") && (
            <p className="ms-in ms-eyebrow" style={{ "--d": "100ms" } as React.CSSProperties}>
              {t("home.hero.tagline")}
            </p>
          )}

          <h1 className="ms-title mt-5 font-bold">
            {lines.map((line, i) => (
              <span key={line} className="ms-line">
                <span style={{ "--d": `${200 + i * 110}ms` } as React.CSSProperties}>{line}</span>
              </span>
            ))}
            {accent && (
              <span className="ms-line">
                <span className="text-royal-400" style={{ "--d": `${200 + lines.length * 110}ms` } as React.CSSProperties}>
                  {accent}
                  <span className="text-maroon-400">.</span>
                </span>
              </span>
            )}
          </h1>

          <div className="ms-in mt-6 w-full max-w-xl" style={{ "--d": "650ms" } as React.CSSProperties}>
            <HeroWave />
          </div>

          <p
            className="ms-in mt-5 max-w-[34rem] text-[0.98rem] sm:text-[1.05rem] leading-[1.9] text-fg-muted"
            style={{ "--d": "780ms" } as React.CSSProperties}
          >
            {shortenDescription(siteInfo.heroDescription)}
          </p>

          <div className="ms-in mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row" style={{ "--d": "900ms" } as React.CSSProperties}>
            {t("home.cta.works") && (
              <Link to="/portfolio" className="ms-btn ms-btn-primary">
                {t("home.cta.works")}
                <span className="ms-arrow"><ArrowLeft size={15} /></span>
              </Link>
            )}
            {t("home.cta.contact") && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-whatsapp-cta className="ms-btn ms-btn-ghost ms-glass">
                {t("home.cta.contact")}
              </a>
            )}
          </div>
        </div>

        {/* الشريط السفلي: الاسم — إشارة التمرير — روابط التواصل */}
        <div className="ms-in mt-8 grid grid-cols-2 items-end gap-4 sm:grid-cols-3" style={{ "--d": "1100ms" } as React.CSSProperties}>
          <div>
            <p className="text-sm font-semibold text-fg">{siteInfo.heroName || defaults.heroName}</p>
            <p className="mt-0.5 text-xs text-fg-muted">مسقط · سلطنة عُمان</p>
          </div>
          <div className="hidden flex-col items-center gap-2 sm:flex">
            <span className="text-[0.7rem] tracking-[0.15em] text-fg-muted">{t("home.hero.scroll")}</span>
            <span className="ms-scrollcue relative h-9 w-px overflow-hidden bg-ink-700">
              <span className="absolute inset-0 bg-royal-400" />
            </span>
          </div>
          {socials.length > 0 && (
            <div className="flex justify-end gap-2">
              {socials.map(({ url, Icon, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="ms-glass flex h-10 w-10 items-center justify-center rounded-full text-fg-muted transition-colors hover:text-royal-300"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════ معرض الأعمال الدوّار ═══════════ */

function WorksCarousel({ works }: { works: Work[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [wide, setWide] = useState(true);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const count = works.length;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // آخر اتجاه حركة: يحدد في أي جانب تنتظر البطاقات المخفية دورها
  const [dir, setDir] = useState(1);
  // بعد انتهاء الحركة تُرتَّب البطاقات المخفية بصمت في جهة الدخول التالية
  // تحفظ رقم البطاقة النشطة التي استقرت الحركة عندها؛ أي تغيير يعني أن الحركة بدأت
  const [settledAt, setSettledAt] = useState(0);
  const settled = settledAt === active;

  const step = useCallback((delta: number) => {
    setDir(delta >= 0 ? 1 : -1);
    setActive((a) => (((a + delta) % count) + count) % count);
  }, [count]);
  const go = useCallback((d: number) => step(d), [step]);
  const goTo = (i: number) => {
    // أقصر طريق إلى البطاقة المطلوبة في أي اتجاه
    let d = i - active;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    if (d !== 0) step(d);
  };

  useEffect(() => {
    const id = window.setTimeout(() => setSettledAt(active), 1250);
    return () => window.clearTimeout(id);
  }, [active]);

  // يدور وحده، ويتوقف حين يمرّ المؤشر فوقه
  useEffect(() => {
    if (paused || count < 2 || reducedMotion()) return;
    const id = window.setInterval(() => go(1), 4500);
    return () => window.clearInterval(id);
  }, [paused, count, go]);

  // نُبقي بطاقة واحدة على الأقل خارج المسرح، فتدخل كل بطاقة جديدة من الطرف منزلقةً لا ظاهرةً فجأة
  const range = Math.max(1, Math.min(wide ? 2 : 1, Math.floor((count - 2) / 2)));

  // موضع كل بطاقة في العرض السابق — لتختار كل بطاقة أقصر طريق إلى موضعها الجديد
  const prev = useRef<number[]>([]);
  // تُحسب المواضع مرة واحدة لكل حركة، فلا تُفسدها إعادة رسم عابرة (مرور المؤشر مثلاً) أثناء الانزلاق
  const positions = useMemo(() => works.map((_, i) => {
    const m = (((i - active) % count) + count) % count;
    const before = prev.current[i];
    const wasHidden = before === undefined || Math.abs(before) > range;
    let o: number;
    let teleport = false;
    if (m <= range) o = m;
    else if (m >= count - range) o = m - count;
    else {
      // مخفية الآن
      const waiting = dir >= 0 ? m : m - count;
      if (settled || wasHidden) {
        o = waiting;
        teleport = true; // تنتقل وهي خفية، فلا يراها أحد
      } else {
        // كانت ظاهرة وتغادر: تنزلق إلى الجهة التي تخرج منها
        o = Math.abs(m - before) <= Math.abs(m - count - before) ? m : m - count;
      }
    }
    // بطاقة تدخل من الجهة المعاكسة لمكان انتظارها (نقرتان سريعتان): تظهر بالتلاشي بدل عبور المسرح
    if (!teleport && wasHidden && before !== undefined && Math.abs(o - before) > 2) teleport = true;
    return { o, teleport };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [active, settled, dir, range, count]);
  useEffect(() => {
    prev.current = positions.map((p) => p.o);
  }, [positions]);

  if (count === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(1);
        if (e.key === "ArrowRight") go(-1);
      }}
    >
      <div
        className="ms-flow relative mx-auto h-[15.5rem] sm:h-[24rem] lg:h-[28rem] touch-pan-y select-none"
        style={{ "--cw": wide ? "min(36rem, 46vw)" : "80vw", "--step": wide ? "min(21rem, 25vw)" : "58vw" } as React.CSSProperties}
        onPointerDown={(e) => { drag.current = { x: e.clientX, moved: false }; }}
        onPointerMove={(e) => {
          if (drag.current && Math.abs(e.clientX - drag.current.x) > 8) drag.current.moved = true;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          if (!d || !d.moved) { drag.current = null; return; }
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1);
          // يُترك drag.current لحظة حتى يمنع النقرَ التالي من فتح العمل
          window.setTimeout(() => { drag.current = null; }, 0);
        }}
      >
        {works.map((work, i) => {
          const { o, teleport: jump } = positions[i];
          const a = Math.abs(o);
          const isActive = o === 0;
          return (
            <Link
              key={work.id}
              to={`/portfolio/${work.id}`}
              draggable={false}
              data-active={isActive}
              data-jump={jump}
              data-hidden={a > range}
              aria-hidden={a > range}
              tabIndex={isActive ? 0 : -1}
              onClick={(e) => {
                if (drag.current?.moved) { e.preventDefault(); return; }
                if (!isActive) { e.preventDefault(); goTo(i); }
              }}
              className="ms-card group block overflow-hidden rounded-[1.4rem] border border-royal-200/10 bg-ink-850 shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
              style={{ "--o": -o, "--a": a } as React.CSSProperties}
            >
              <img
                src={work.coverImage}
                alt={work.altText || work.title}
                loading={a <= 1 ? "eager" : "lazy"}
                draggable={false}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent via-35% to-transparent" />
              <div
                className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5 transition-opacity duration-500"
                style={{ opacity: isActive ? 1 : 0 }}
              >
                <h3 className="text-sm sm:text-base font-semibold text-fg">{work.title}</h3>
                <span className="ms-glass flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-royal-300 transition-transform group-hover:-rotate-45">
                  <ArrowLeft size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {count > 1 && (
        <div className="mt-8 flex items-center justify-center gap-5">
          <button onClick={() => go(-1)} aria-label="العمل السابق" className="ms-glass flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:text-royal-300">
            <ArrowRight size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            {works.map((w, i) => (
              <button
                key={w.id}
                onClick={() => goTo(i)}
                aria-label={`العمل ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-7 bg-royal-400" : "w-1.5 bg-ink-600"}`}
              />
            ))}
          </div>
          <button onClick={() => go(1)} aria-label="العمل التالي" className="ms-glass flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:text-royal-300">
            <ArrowLeft size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

/** عنوان القسم: نقطة ذهبية + عنوان، ورابط اختياري في الطرف الآخر */
function SectionHead({ eyebrow, title, link }: { eyebrow?: string; title: string; link?: { to: string; label: string } }) {
  const ref = useReveal<HTMLDivElement>();
  if (!title) return null;
  return (
    <div ref={ref} className="ms-reveal flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="ms-eyebrow">{eyebrow}</p>}
        <h2 className={`ms-h2 ${eyebrow ? "mt-3" : ""}`}>{title}</h2>
      </div>
      {link?.label && (
        <Link to={link.to} className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-royal-300">
          {link.label}
          <ArrowLeft size={15} />
        </Link>
      )}
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`ms-reveal ${className}`} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}

export function HomePage() {
  const t = useText();

  useSeo({ title: t("seo.home.title"), description: t("seo.home.description") });

  const cached = getCached();
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(cached ? { ...defaults, ...cached } : defaults);
  const [clients, setClients] = useState<Client[]>([]);
  const [works, setWorks] = useState<Work[]>([]);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (!snap.empty) {
        const merged = { ...defaults, ...(snap.docs[0].data() as SiteInfo) };
        setSiteInfo(merged);
        setCache(merged);
      }
    });
    const u2 = onSnapshot(collection(db, "clients"), (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Client)));
    });
    const u3 = onSnapshot(collection(db, "works"), (snap) => {
      setWorks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Work)));
    });
    return () => { u1(); u2(); u3(); };
  }, []);

  const whatsappUrl = siteInfo.phone
    ? `https://wa.me/${siteInfo.phone.replace(/\D/g, "")}?text=${encodeURIComponent(t("whatsapp.message"))}`
    : "#contact";

  // العينة الصوتية: المختارة من لوحة التحكم، وإلا أول عمل صوتي حتى لا يفرغ القسم
  const voiceWorks = works.filter((w) => w.category === "voice" && (w.audioUrl || w.soundcloudUrl));
  const voiceSample = voiceWorks.find((w) => w.homeSample) || voiceWorks[0];
  // أعمال الموشن لها قسمها الخاص، فلا تتكرر في المعرض الدوّار
  const withCover = works.filter((w) => w.coverImage && w.category !== "motion");
  const motionWorks = works.filter((w) => w.category === "motion" && (w.videoUrl || w.videoLink));
  const motionPicked = motionWorks.filter((w) => w.featured);
  const motionShown = (motionPicked.length > 0 ? motionPicked : motionWorks).slice(0, 4);
  const picked = withCover.filter((w) => w.featured);
  // ما لم يُحدَّد شيء من لوحة التحكم، تُعرض أول ثمانية أعمال حتى لا يفرغ القسم
  const featured = (picked.length > 0 ? picked : withCover).slice(0, 8);

  const socials = [
    { url: siteInfo.linkedinUrl, Icon: Linkedin, label: "لينكدإن" },
    { url: siteInfo.instagramUrl, Icon: Instagram, label: "إنستغرام" },
    { url: siteInfo.twitterUrl, Icon: Twitter, label: "تويتر" },
  ].filter((s) => s.url && s.url !== "#");

  // أرقام حقيقية تُحسب من المحتوى نفسه، فتتحدّث وحدها مع كل إضافة
  const stats = [
    { Icon: Layers, value: works.length, label: t("home.stats.works") },
    { Icon: Users, value: clients.length, label: t("home.stats.clients") },
    { Icon: AudioLines, value: voiceWorks.length, label: t("home.stats.voice") },
    { Icon: Clapperboard, value: motionWorks.length, label: t("home.stats.motion") },
  ].filter((s) => s.value > 0 && s.label);

  return (
    <div className="bg-ink-950 text-fg overflow-x-clip">
      <Hero siteInfo={siteInfo} whatsappUrl={whatsappUrl} socials={socials} />

      {/* ═══════════ أعمال مختارة ═══════════ */}
      {featured.length > 0 && (
        <section className="relative py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHead
              eyebrow={t("nav.portfolio")}
              title={t("home.featured.heading")}
              link={{ to: "/portfolio", label: t("home.featured.all") }}
            />
          </div>
          <Reveal className="mt-12 sm:mt-14" delay={120}>
            <WorksCarousel works={featured} />
          </Reveal>
        </section>
      )}

      {/* ═══════════ موشن جرافيك ═══════════ */}
      {motionShown.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
          <SectionHead
            eyebrow={t("home.motion.sub")}
            title={t("home.motion.heading")}
            link={{ to: "/portfolio-motion", label: t("home.motion.all") }}
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {motionShown.map((w, i) => (
              <Reveal key={w.id} delay={i * 90}>
                <MotionCard work={w} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ نماذج صوتية ═══════════ */}
      {voiceSample && (
        <section className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16">
          <Reveal>
            <div className="ms-glass ms-grain relative overflow-hidden rounded-[1.75rem] p-6 sm:p-10 lg:p-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-1/2 start-[-10%] h-[140%] w-[60%] rounded-full"
                style={{ background: "radial-gradient(closest-side, rgba(122,42,49,0.55), transparent)" }}
              />
              <div className="relative grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="ms-eyebrow">{t("home.services.voice.title")}</p>
                  <h2 className="ms-h2 mt-3">{t("home.samples.heading")}</h2>
                  <p className="mt-4 max-w-sm text-sm leading-[1.9] text-fg-muted">{t("home.services.voice.desc")}</p>
                </div>
                <VoiceSampleCard
                  id={voiceSample.id}
                  title={voiceSample.title}
                  audioUrl={voiceSample.audioUrl}
                  soundcloudUrl={voiceSample.soundcloudUrl}
                />
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ═══════════ مجالات العمل ═══════════ */}
      <section id="services" className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-24">
        <SectionHead title={t("home.services.heading")} />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {services.map(({ Icon, key, link }, i) => (
            <Reveal key={key} delay={i * 90}>
              <Link to={link} className="ms-glass ms-lift group flex h-full flex-col rounded-[1.4rem] p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-500/70 text-royal-400 ring-1 ring-royal-400/20">
                    <Icon size={21} strokeWidth={1.7} />
                  </span>
                  <span className="text-xs tabular-nums text-fg-muted/60" dir="ltr">0{i + 1}</span>
                </div>
                <h3 className="mt-6 sm:mt-8 text-base sm:text-lg font-semibold transition-colors group-hover:text-royal-300">
                  {t(`home.services.${key}.title`)}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-fg-muted">{t(`home.services.${key}.desc`)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════ أرقام ═══════════ */}
      {stats.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-8">
          <div className={`grid gap-3 sm:gap-4 ${stats.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : stats.length === 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {stats.map(({ Icon, value, label }, i) => (
              <Reveal key={label} delay={i * 110}>
                <div className="ms-glass ms-lift flex h-full flex-col items-center rounded-[1.4rem] px-3 py-7 sm:py-9 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-maroon-500/70 text-royal-400 shadow-[0_0_24px_rgba(238,168,81,0.25)]">
                    <Icon size={19} />
                  </span>
                  <p className="mt-5 text-[2rem] sm:text-5xl font-bold text-fg" dir="ltr">
                    +<CountUp value={value} />
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-fg-muted">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ العملاء ═══════════ */}
      {clients.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-24">
          <SectionHead eyebrow={t("home.clients.subheading")} title={t("home.clients.heading")} />
          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            {clients.map((client, i) => (
              <Reveal key={client.id} delay={(i % 6) * 60} className="basis-[calc((100%-1.5rem)/3)] sm:basis-[calc((100%-3rem)/4)] lg:basis-[calc((100%-5rem)/6)]">
                <div className="ms-glass ms-lift ms-logo flex aspect-[5/4] flex-col items-center justify-center gap-3 rounded-2xl p-4" title={client.name}>
                  {client.logoUrl ? (
                    <img
                      src={client.logoUrl}
                      alt={client.logoAlt || `شعار ${client.name} — عميل مصطفى جغلال`}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover shadow-[0_6px_18px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon-500 text-lg font-bold text-royal-300">
                      {client.name.charAt(0)}
                    </span>
                  )}
                  <p className="line-clamp-1 text-center text-[0.7rem] sm:text-xs text-fg-muted">{client.name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ دعوة للتواصل ═══════════ */}
      <section id="contact" className="mx-auto max-w-7xl px-5 sm:px-8 pt-8 pb-24 sm:pb-32">
        <Reveal>
          <div
            className="ms-grain relative overflow-hidden rounded-[2rem] border border-royal-200/10 px-6 py-16 sm:py-24 text-center"
            style={{ background: "radial-gradient(80% 90% at 50% 0%, rgba(122,42,49,0.9), rgba(42,10,12,0.95) 60%, #140809)" }}
          >
            <div
              aria-hidden="true"
              className="ms-pattern pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{ maskImage: "radial-gradient(60% 70% at 50% 40%, #000, transparent)", WebkitMaskImage: "radial-gradient(60% 70% at 50% 40%, #000, transparent)" }}
            />
            <div className="relative">
              <h2 className="ms-h2 mx-auto max-w-2xl">{t("home.contact.heading")}</h2>
              {t("home.contact.subheading") && (
                <p className="mx-auto mt-4 max-w-md text-fg-muted">{t("home.contact.subheading")}</p>
              )}
              <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
                {siteInfo.email && (
                  <a href={`mailto:${siteInfo.email}`} className="ms-btn ms-btn-primary">
                    {t("home.contact.email")}
                    <span className="ms-arrow"><ArrowLeft size={15} /></span>
                  </a>
                )}
                {siteInfo.phone && (
                  <a href={`tel:${siteInfo.phone}`} className="ms-btn ms-btn-ghost ms-glass">
                    {t("home.contact.phone")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
