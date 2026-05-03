import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ImageWithFallback } from "../../shared/ImageWithFallback";
import { Camera, Mic, Palette, GraduationCap, ArrowLeft } from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface SiteInfo {
  heroName: string;
  heroDescription: string;
  profileImageUrl: string;
  email: string;
  phone: string;
}

interface Client {
  id: string;
  name: string;
  logoUrl: string;
  logoAlt: string;
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
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() })); } catch {}
}

const defaults: SiteInfo = {
  heroName: "مصطفى جغلال",
  heroDescription: "معلق صوتي محترف ومصمم بصري مقيم في مسقط، سلطنة عُمان. يجمع بين قوة الصوت المؤثر وخبرة التصميم الجرافيكي لتقديم محتوى إبداعي متكامل للمشاريع التجارية.",
  profileImageUrl: "",
  email: "info@example.com",
  phone: "+968",
};

export function HomePage() {
  const cached = getCached();
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(cached || defaults);
  const [loaded, setLoaded] = useState(!!cached);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data() as SiteInfo;
        setSiteInfo((prev) => ({ ...prev, ...data }));
        setCache({ ...defaults, ...data });
      }
      setLoaded(true);
    });
    const u2 = onSnapshot(collection(db, "clients"), (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Client)));
    });
    return () => { u1(); u2(); };
  }, []);

  const services = [
    { icon: <Palette className="w-12 h-12 text-blue-400" />, title: "التصميم الجرافيكي", description: "تصاميم احترافية تعبر عن هويتك البصرية بأعلى جودة", link: "/portfolio-design" },
    { icon: <Camera className="w-12 h-12 text-purple-400" />, title: "التصوير الفوتوغرافي", description: "التقاط اللحظات المميزة بإبداع واحترافية", link: "/portfolio-photography" },
    { icon: <Mic className="w-12 h-12 text-pink-400" />, title: "التعليق الصوتي", description: "صوت احترافي لجميع احتياجاتك الإعلانية والتوثيقية", link: "/portfolio-voice" },
    { icon: <GraduationCap className="w-12 h-12 text-green-400" />, title: "الدورات التدريبية", description: "دورات متخصصة في الإلقاء والخطابة والتعليق الصوتي", link: "/courses" },
  ];

  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                مرحباً، أنا{" "}
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {siteInfo.heroName}
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">{siteInfo.heroDescription}</p>
              <div className="flex flex-wrap gap-4">
                <a href="#services" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold">استكشف خدماتي</a>
                <Link to="/about" className="px-8 py-3 border border-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-400 transition-all font-semibold">المزيد عني</Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-30"></div>
                {loaded && siteInfo.profileImageUrl ? (
                  <ImageWithFallback 
                    src={siteInfo.profileImageUrl} 
                    alt={`${siteInfo.heroName} - معلق صوتي ومصمم بصري`} 
                    className="relative rounded-full w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover border-4 border-gray-800 shadow-2xl" 
                    loading="eager"
                    fetchPriority="high"
                  />
                ) : (
                  <div className="relative rounded-full w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 border-4 border-gray-800 bg-gray-900 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ماذا أقدم</h2>
            <p className="text-gray-400 text-lg">حلول إبداعية شاملة لجميع احتياجاتك</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Link key={index} to={service.link} className="group bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20">
                <div className="mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-4">{service.description}</p>
                <div className="flex items-center text-blue-400 group-hover:gap-2 transition-all">
                  <span>اكتشف المزيد</span>
                  <ArrowLeft size={18} className="group-hover:translate-x-[-4px] transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      {clients.length > 0 && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">عملاؤنا المميزون</h2>
              <p className="text-gray-400 text-lg">فخورون بثقة هذه الجهات المرموقة</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {clients.map((client) => (
                <div key={client.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
                  {client.logoUrl ? (
                    <img src={client.logoUrl} alt={client.logoAlt || client.name} className="w-16 h-16 object-contain filter brightness-75 group-hover:brightness-100 transition-all" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400 group-hover:text-white transition-all">
                      {client.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-center text-gray-400 text-sm font-semibold group-hover:text-white transition-all">{client.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">جاهز لبدء مشروعك؟</h2>
          <p className="text-gray-400 text-lg mb-8">دعنا نتعاون لتحويل أفكارك إلى واقع ملموس</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={`mailto:${siteInfo.email}`} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold">أرسل رسالة</a>
            <a href={`tel:${siteInfo.phone}`} className="px-8 py-3 border border-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-400 transition-all font-semibold">اتصل الآن</a>
          </div>
        </div>
      </section>
    </div>
  );
}
