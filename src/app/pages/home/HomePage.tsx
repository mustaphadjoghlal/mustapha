import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Mic, Video, Palette, TrendingUp, ArrowLeft, Play, Linkedin, Instagram, Twitter,
} from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import profileImg from "../../../assets/profile.jpg";
import heroMobileImg from "../../../assets/hero-mobile.webp";
import { useSeo } from "../../shared/useSeo";
import { VoiceSampleCard } from "../../components/VoiceSampleCard";

interface SiteInfo {
  heroName: string;
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
  category: "design" | "photography" | "voice";
  /** يُحدَّد من لوحة التحكم — يظهر في قسم "أعمال مختارة" */
  featured?: boolean;
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
  heroDescription:
    "معلّق صوتي وصانع محتوى ومصمم، أساعد العلامات التجارية والمشاريع على تقديم أفكارها بصوت وصورة أكثر تأثيراً.",
  profileImageUrl: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  twitterUrl: "",
  instagramUrl: "",
};

/** مجالات العمل الأربعة */
const services = [
  { Icon: Mic, title: "التعليق الصوتي", description: "إعلانات ووثائقيات ومحتوى تعليمي", link: "/portfolio-voice" },
  { Icon: Video, title: "صناعة المحتوى", description: "أفكار وكتابة وإنتاج محتوى رقمي", link: "/portfolio-photography" },
  { Icon: Palette, title: "التصميم الجرافيكي", description: "هويات بصرية ومنشورات وإعلانات", link: "/portfolio-design" },
  { Icon: TrendingUp, title: "التسويق الرقمي", description: "إدارة حسابات وبناء حضور رقمي", link: "/about" },
];


/**
 * صورة البطل — بلا إطار ولا بطاقة: قناع إشعاعي يُذيب الحواف في الخلفية
 * الداكنة فتبدو الصورة جزءاً من الصفحة لا عنصراً مركّباً فوقها.
 */
function HeroPhoto({ src, priority = false }: { src: string; priority?: boolean }) {
  return (
    <div className="fade-up relative">
      <img
        src={src}
        alt="مصطفى جغلال — معلق صوتي ومصمم محتوى بصري في مسقط عُمان"
        title="مصطفى جغلال"
        width={1000}
        height={1000}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="w-full aspect-[4/5] object-cover object-[center_12%]"
      />
      {/*
        طبقات تذويب بلون الخلفية نفسه بدل القناع (mask) لأن دعم
        mask-composite غير مضمون. الحافة اليمنى المواجهة للنص
        والحافتان العلوية والسفلية تندمج في الخلفية، واليسرى تمتد
        خارج حافة الشاشة.
      */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-ink-950 via-ink-950/75 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950 to-transparent" />
    </div>
  );
}

interface HeroCopyProps {
  description: string;
  email: string;
  socials: { url: string; Icon: typeof Mic; label: string }[];
  /** روابط التواصل موجودة في الفوتر، فتُخفى من بطل الجوال */
  showSocials?: boolean;
}

/** العنوان — يجاور الصورة */
function HeroTitle() {
  return (
    <>
      <p className="fade-up flex items-center gap-3 text-[0.7rem] tracking-[0.2em] lg:text-[0.72rem] lg:tracking-[0.22em] text-fg-muted">
        <span className="h-px w-6 lg:w-7 bg-royal-500" />
        كل قصة تستحق أن تُروى
      </p>

      <h1
        className="fade-up mt-4 lg:mt-5 text-[1.95rem] leading-[1.28] sm:text-[2.6rem] lg:text-[3.6rem] lg:leading-[1.18] font-bold tracking-[-0.01em]"
        style={{ animationDelay: "60ms" }}
      >
        أحوّل
        <br />
        الأفكار إلى
        <br />
        <span className="text-royal-400">صوت مؤثر</span>
      </h1>
    </>
  );
}

/** بقيّة نصّ البطل: الوصف والأزرار وروابط التواصل */
function HeroCopy({ description, email, socials, showSocials = true }: HeroCopyProps) {
  return (
    <div className="max-w-[32rem]">
      <p
        className="fade-up text-[0.95rem] sm:text-base leading-[1.85] text-fg-muted"
        style={{ animationDelay: "120ms" }}
      >
        {description}
      </p>

      <div className="fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "180ms" }}>
        <Link
          to="/portfolio-design"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-royal-500 px-7 py-4 text-[0.95rem] font-semibold text-white transition-colors hover:bg-royal-600"
        >
          <ArrowLeft size={17} />
          أعمالي
        </Link>
        <a
          href={email ? `mailto:${email}` : "#contact"}
          className="inline-flex items-center justify-center rounded-lg border border-ink-700 px-7 py-4 text-[0.95rem] text-fg-muted transition-colors hover:border-ink-600 hover:text-fg"
        >
          تواصل معي
        </a>
      </div>

      {showSocials && socials.length > 0 && (
        <div className="fade-up mt-8 lg:mt-9 flex gap-6" style={{ animationDelay: "240ms" }}>
          {socials.map(({ url, Icon, label }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-fg-muted transition-colors hover:text-royal-400"
            >
              <Icon size={19} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}


export function HomePage() {
  useSeo({
    title: "مصطفى جغلال — معلق صوتي ومصمم بصري",
    description:
      "معلق صوتي محترف ومصمم محتوى بصري مقيم في مسقط، سلطنة عُمان. أجمع بين قوة الصوت وجاذبية الصورة في التعليق الصوتي والتصميم والسوشيال ميديا.",
  });

  const cached = getCached();
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(cached || defaults);
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

  // الصورة المعتمدة للبطل هي المرفقة بالمشروع (ذات ربطة العنق الزرقاء).
  // الصورة المرفوعة من لوحة التحكم ما زالت تُستخدم في بقية الموقع.
  const heroImage = profileImg;
  const voiceSample = works.find((w) => w.category === "voice" && (w.audioUrl || w.soundcloudUrl));
  const withCover = works.filter((w) => w.coverImage);
  const picked = withCover.filter((w) => w.featured);
  // ما لم يُحدَّد شيء من لوحة التحكم، تُعرض أول ستة أعمال حتى لا يفرغ القسم
  const featured = (picked.length > 0 ? picked : withCover).slice(0, 6);

  const socials = [
    { url: siteInfo.linkedinUrl, Icon: Linkedin, label: "لينكدإن" },
    { url: siteInfo.instagramUrl, Icon: Instagram, label: "إنستغرام" },
    { url: siteInfo.twitterUrl, Icon: Twitter, label: "تويتر" },
  ].filter((s) => s.url && s.url !== "#");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "مصطفى جغلال",
    alternateName: "Mustapha Djoghlal",
    url: "https://mustaphadjoghlal.com",
    image: "https://mustaphadjoghlal.com/og-image.jpg",
    jobTitle: "معلق صوتي ومصمم محتوى بصري",
    description: siteInfo.heroDescription,
    address: { "@type": "PostalAddress", addressLocality: "مسقط", addressCountry: "OM" },
    sameAs: [siteInfo.linkedinUrl, siteInfo.instagramUrl, siteInfo.twitterUrl].filter(
      (u) => u && u !== "#"
    ),
  };

  return (
    <div className="bg-ink-950 text-fg overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ═══════════ البطل ═══════════
          الجوال: الصورة على يسار العنوان بحجم معتدل
          الشاشات الكبيرة: التكوين السينمائي كما كان — صورة ممتدة تذوب في الخلفية */}
      <section className="relative lg:-mt-16">

        {/* ——— الجوال: النص فوق الصورة، الرأس يميناً والنص يساراً ———
            الصورة عرضية فيُزاح إطار العرض حتى يقع الرأس في الجهة اليمنى
            ويبقى الجزء الداكن من التصميم على اليسار ليُكتب النص فوقه. */}
        <div className="relative -mt-16 min-h-[80svh] lg:hidden">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={heroMobileImg}
              alt="مصطفى جغلال — معلق صوتي ومصمم محتوى بصري في مسقط عُمان"
              title="مصطفى جغلال"
              width={2000}
              height={1414}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover object-[44%_center]"
            />
            {/* تعتيم الجهة اليسرى حيث يقع النص */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-ink-950/60 to-ink-950/94" />
            {/* تعتيم أعلى الصورة ليبقى الهيدر واضحاً */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-950/80 to-transparent" />
            {/* ذوبان سفلي يدمج الصورة بخلفية الصفحة */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950 to-transparent" />
          </div>

          {/* النص فوق الجهة اليسرى */}
          <div className="relative flex min-h-[80svh] items-center justify-end px-5 pb-10 pt-20">
            <div className="w-[56%] max-w-[13.5rem] text-left">
              <HeroTitle />
              <div className="mt-5">
                <HeroCopy
                  description={siteInfo.heroDescription}
                  email={siteInfo.email}
                  socials={socials}
                  showSocials={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ——— الشاشات الكبيرة ——— */}
        <div className="relative hidden lg:block min-h-[100svh]">
          <div className="pointer-events-none absolute inset-y-0 start-0 w-[47%] xl:w-[44%]">
            <img src={heroImage} alt="" aria-hidden="true" className="h-full w-full object-cover object-top" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(115% 100% at 70% 36%, transparent 42%, #08090d 100%)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ink-950/35 to-ink-950" />
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink-950 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-ink-950 to-transparent" />
          </div>

          <div className="relative mx-auto grid min-h-[100svh] max-w-7xl grid-cols-2 items-center px-8">
            <div aria-hidden="true" />
            <div className="max-w-[30rem]">
              <HeroTitle />
              <div className="mt-5">
                <HeroCopy
                  description={siteInfo.heroDescription}
                  email={siteInfo.email}
                  socials={socials}
                />
              </div>
            </div>
          </div>

          {/* إضاءة زرقاء خافتة جداً فوق التكوين — تمنع ظهور حافة عند طرف الصورة */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(62% 40% at 76% 14%, rgba(49,87,213,0.11), transparent 72%)",
            }}
          />
        </div>
      </section>

      {/* ═══════════ مجالات العمل ═══════════ */}
      <section id="services" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-4 pb-16 sm:pt-8 sm:pb-24 lg:pt-24">
        <h2 className="text-2xl sm:text-3xl font-bold">ماذا أقدم</h2>
        <span className="rule-accent mt-4" />

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {services.map(({ Icon, title, description, link }) => (
            <Link key={title} to={link} className="group">
              <Icon size={22} strokeWidth={1.6} className="text-royal-400" />
              <h3 className="mt-4 text-[1.02rem] font-semibold transition-colors group-hover:text-royal-300">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ نماذج صوتية ═══════════ */}
      {voiceSample && (
        <section className="bg-ink-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
            <h2 className="text-2xl sm:text-3xl font-bold">نماذج صوتية</h2>
            <span className="rule-accent mt-4" />
            <div className="mt-8 max-w-3xl">
              <VoiceSampleCard
                id={voiceSample.id}
                title={voiceSample.title}
                audioUrl={voiceSample.audioUrl}
                soundcloudUrl={voiceSample.soundcloudUrl}
              />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ أعمالي ═══════════ */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold">أعمال مختارة</h2>
            <Link
              to="/portfolio-design"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-royal-400"
            >
              كل الأعمال
              <ArrowLeft size={15} />
            </Link>
          </div>
          <span className="rule-accent mt-4" />

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {featured.map((work) => (
              <Link
                key={work.id}
                to={`/portfolio/${work.id}`}
                className="group relative block overflow-hidden rounded-lg"
              >
                <img
                  src={work.coverImage}
                  alt={work.altText || work.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/20 to-transparent" />
                <h3 className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-[0.82rem] sm:text-sm font-semibold text-fg">
                  {work.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ عملاؤنا المميزون ═══════════ */}
      {clients.length > 0 && (
        <section className="bg-ink-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
            <h2 className="text-2xl sm:text-3xl font-bold">عملاؤنا المميزون</h2>
            <p className="mt-3 text-fg-muted">فخورون بثقة هذه الجهات المرموقة</p>
            <span className="rule-accent mt-4" />

            <div className="mt-10 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
              {clients.map((client) => (
                <div key={client.id} className="group flex flex-col items-center gap-3">
                  {client.logoUrl ? (
                    <img
                      src={client.logoUrl}
                      alt={client.logoAlt || `شعار ${client.name} — عميل مصطفى جغلال`}
                      title={client.name}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="h-12 w-12 sm:h-14 sm:w-14 object-contain opacity-60 transition-opacity group-hover:opacity-100"
                    />
                  ) : (
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-ink-800 text-lg font-bold text-fg-muted">
                      {client.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-center text-xs text-fg-muted transition-colors group-hover:text-fg">
                    {client.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ دعوة للتواصل ═══════════ */}
      <section id="contact" className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">جاهز لبدء مشروعك؟</h2>
        <p className="mt-4 text-fg-muted">دعنا نتعاون لتحويل أفكارك إلى واقع ملموس</p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          {siteInfo.email && (
            <a
              href={`mailto:${siteInfo.email}`}
              className="rounded-lg bg-royal-500 px-7 py-3.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-royal-600"
            >
              أرسل رسالة
            </a>
          )}
          {siteInfo.phone && (
            <a
              href={`tel:${siteInfo.phone}`}
              className="rounded-lg border border-ink-600 px-7 py-3.5 text-[0.95rem] font-semibold text-fg transition-colors hover:border-royal-500"
            >
              اتصل الآن
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
