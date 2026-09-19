import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Camera, Mic, Palette, BarChart3, ArrowLeft, Play, Linkedin, Instagram, Twitter, Quote,
} from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import profileImg from "../../../assets/profile.jpg";
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
    "معلّق صوتي، صانع محتوى، وأساعد الأفراد والعلامات التجارية على إيصال رسالتهم بإبداع واحترافية.",
  profileImageUrl: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  twitterUrl: "",
  instagramUrl: "",
};

const services = [
  { icon: Mic, title: "التعليق الصوتي", description: "إعلانات، وثائقيات، محتوى تعليمي", link: "/portfolio-voice" },
  { icon: Camera, title: "صناعة المحتوى", description: "فيديو، كتابة، أفكار واستراتيجيات", link: "/portfolio-photography" },
  { icon: Palette, title: "تصميم جرافيك", description: "تصاميم احترافية ومحتوى بصري", link: "/portfolio-design" },
  { icon: BarChart3, title: "التسويق الرقمي", description: "إدارة حسابات وزيادة التفاعل", link: "/courses" },
];

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

  const heroImage = siteInfo.profileImageUrl || profileImg;
  const voiceSample = works.find((w) => w.category === "voice" && (w.audioUrl || w.soundcloudUrl));
  const featured = works.filter((w) => w.coverImage).slice(0, 3);

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
    <div className="bg-ink-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ═══ البطل ═══ */}
      <section className="relative overflow-hidden -mt-16 pt-16">
        {/* خلفية */}
        <div className="absolute inset-0 bg-ink-950" />
        <div className="absolute -top-32 start-1/4 w-[38rem] h-[38rem] royal-glow opacity-70" />

        {/* الصورة على الشاشات الكبيرة — تمتد حتى حافة الشاشة وتذوب في الخلفية */}
        <div className="pointer-events-none absolute inset-y-0 start-0 hidden lg:block w-[48%] xl:w-[45%]">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ink-950/55 to-ink-950" />
          <div className="absolute inset-y-0 end-0 w-1/3 bg-gradient-to-l from-transparent to-ink-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
          <p
            aria-hidden="true"
            className="script-ar absolute bottom-20 start-14 xl:start-24 -rotate-6 text-royal-100/90 text-[1.7rem] leading-[2.2] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
          >
            كل قصة
            <br />
            تَستحقّ أن تُروى
          </p>
        </div>

        {/* حجاب علوي يضمن وضوح روابط القائمة فوق الصورة */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-950 via-ink-950/70 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[calc(100svh-4rem)] py-6 lg:py-0">

            {/* الصورة على الجوال — بطاقة رأسية */}
            <div className="relative order-1 lg:hidden flex justify-center">
              <div className="relative w-full max-w-[15rem] sm:max-w-[20rem]">
                <div className="absolute inset-6 royal-glow blur-2xl" />
                <img
                  src={heroImage}
                  alt="مصطفى جغلال — معلق صوتي ومصمم محتوى بصري في مسقط عُمان"
                  title="مصطفى جغلال"
                  width={777}
                  height={777}
                  loading="eager"
                  fetchPriority="high"
                  className="relative w-full aspect-square object-cover object-top rounded-[2rem]"
                />
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />
              </div>
            </div>

            {/* عمود فارغ يحجز مكان الصورة على الشاشات الكبيرة */}
            <div className="hidden lg:block order-1" aria-hidden="true" />

            {/* النص */}
            <div className="relative order-2 text-center lg:text-start">
              <p className="script-ar lg:hidden mb-2 text-lg text-royal-300">
                كل قصة تَستحقّ أن تُروى
              </p>
              <h1 className="text-[2rem] sm:text-5xl lg:text-6xl font-bold leading-[1.3] mb-4 lg:mb-6">
                أحوِّل
                <br />
                الأفكار إلى
                <br />
                <span className="text-royal-500">صوت مؤثر</span>
              </h1>

              <div className="royal-rule h-px w-40 mx-auto lg:mx-0 mb-4 lg:mb-6" />

              <p className="text-gray-300 text-[0.95rem] sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 mb-6 lg:mb-8">
                {siteInfo.heroDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6 lg:mb-8">
                <Link
                  to="/portfolio-voice"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-royal-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-royal-500/25 transition-colors hover:bg-royal-600"
                >
                  <Play size={18} />
                  استمع إلى نماذج صوتية
                </Link>
                <a
                  href={siteInfo.email ? `mailto:${siteInfo.email}` : "#contact"}
                  className="inline-flex items-center justify-center rounded-xl border border-ink-600 px-7 py-3.5 font-semibold text-gray-200 transition-colors hover:border-royal-500 hover:text-white"
                >
                  تواصل معي
                </a>
              </div>

              {socials.length > 0 && (
                <div className="flex gap-3 justify-center lg:justify-start">
                  {socials.map(({ url, Icon, label }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-700 bg-ink-800/60 text-gray-300 transition-colors hover:border-royal-500 hover:text-royal-300"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ شريط الخدمات ═══ */}
      <section id="services" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 lg:-mt-12">
        <div className="rounded-3xl border border-ink-700 bg-ink-850/90 backdrop-blur-sm p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 divide-ink-700 lg:divide-x lg:divide-x-reverse">
            {services.map(({ icon: Icon, title, description, link }) => (
              <Link key={title} to={link} className="group px-2 lg:px-6 text-center">
                <Icon
                  className="mx-auto mb-3 text-royal-500 transition-transform group-hover:scale-110"
                  size={30}
                  strokeWidth={1.8}
                />
                <h3 className="font-bold mb-1.5 transition-colors group-hover:text-royal-300">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ النموذج الصوتي ═══ */}
      {voiceSample && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <VoiceSampleCard
            id={voiceSample.id}
            title={voiceSample.title}
            audioUrl={voiceSample.audioUrl}
            soundcloudUrl={voiceSample.soundcloudUrl}
          />
        </section>
      )}

      {/* ═══ أعمال مختارة ═══ */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="relative mb-10 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold">أعمال مختارة</h2>
              <div className="royal-rule mx-auto mt-3 h-0.5 w-20" />
            </div>
            <Link
              to="/portfolio-design"
              className="absolute end-0 hidden sm:inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-royal-300"
            >
              عرض جميع الأعمال
              <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((work) => (
              <Link
                key={work.id}
                to={`/portfolio/${work.id}`}
                className="group relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-850"
              >
                <img
                  src={work.coverImage}
                  alt={work.altText || work.title}
                  loading="lazy"
                  className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-royal-500/90 text-white">
                    <ArrowLeft size={16} />
                  </span>
                  <h3 className="truncate text-sm font-semibold text-white">{work.title}</h3>
                </div>
              </Link>
            ))}
          </div>

          <Link
            to="/portfolio-design"
            className="mt-6 inline-flex sm:hidden items-center gap-2 text-sm text-gray-300"
          >
            عرض جميع الأعمال
            <ArrowLeft size={16} />
          </Link>
        </section>
      )}

      {/* ═══ الاقتباس ═══ */}
      <section className="relative overflow-hidden border-y border-ink-700 bg-ink-900">
        <div className="absolute -start-20 top-1/2 h-80 w-80 -translate-y-1/2 royal-glow opacity-60" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <Quote className="mx-auto mb-5 text-royal-500" size={40} strokeWidth={1.5} />
          <blockquote className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-relaxed text-gray-100">
            الإبداع ليس ما أفعله فقط،
            <br />
            بل هو الطريقة التي أرى بها العالم.
          </blockquote>
          <div className="royal-rule mx-auto mt-8 h-0.5 w-28" />
        </div>
      </section>

      {/* ═══ العملاء ═══ */}
      {clients.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">عملاء وثقوا بي</h2>
            <div className="royal-rule mx-auto mt-3 h-0.5 w-20" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {clients.map((client) => (
              <div
                key={client.id}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-ink-700 bg-ink-850 p-6 transition-colors hover:border-royal-600"
              >
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt={client.logoAlt || `شعار ${client.name} — عميل مصطفى جغلال`}
                    title={client.name}
                    width={64}
                    height={64}
                    loading="lazy"
                    className="h-16 w-16 object-contain brightness-75 transition-all group-hover:brightness-100"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-700 text-2xl font-bold text-gray-400 transition-colors group-hover:text-white">
                    {client.name.charAt(0)}
                  </div>
                )}
                <p className="text-center text-sm font-semibold text-gray-400 transition-colors group-hover:text-white">
                  {client.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ دعوة للتواصل ═══ */}
      <section id="contact" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 to-ink-900" />
        <div className="absolute start-1/2 top-0 h-72 w-[30rem] -translate-x-1/2 royal-glow opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="mb-4 text-2xl sm:text-3xl font-bold">جاهز لبدء مشروعك؟</h2>
          <p className="mb-8 text-gray-400">دعنا نتعاون لتحويل أفكارك إلى صوت وصورة تترك أثراً.</p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            {siteInfo.email && (
              <a
                href={`mailto:${siteInfo.email}`}
                className="rounded-xl bg-royal-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-royal-500/25 transition-colors hover:bg-royal-600"
              >
                أرسل رسالة
              </a>
            )}
            {siteInfo.phone && (
              <a
                href={`tel:${siteInfo.phone}`}
                className="rounded-xl border border-ink-600 px-8 py-3.5 font-semibold text-gray-200 transition-colors hover:border-royal-500 hover:text-white"
              >
                اتصل الآن
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
