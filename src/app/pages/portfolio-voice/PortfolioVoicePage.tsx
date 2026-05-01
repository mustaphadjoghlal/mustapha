import { useState, useEffect } from "react";
import { CheckCircle, Mic, Play } from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface VoiceWork {
  id: string;
  title: string;
  description: string;
  soundcloudUrl: string;
  category: "design" | "photography" | "voice";
}

export function PortfolioVoicePage() {
  const [works, setWorks] = useState<VoiceWork[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "works"), (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as VoiceWork))
        .filter((w) => w.category === "voice");
      setWorks(data);
    });
    return unsub;
  }, []);

  const services = [
    "التعليق الصوتي للإعلانات التجارية",
    "التعليق الصوتي للأفلام الوثائقية",
    "تسجيل الكتب الصوتية",
    "التعليق الصوتي للفيديوهات التعليمية",
    "التعليق الصوتي للألعاب والرسوم المتحركة",
    "الردود الصوتية وأنظمة IVR",
  ];

  const features = [
    { title: "استوديو احترافي", description: "معدات تسجيل عالية الجودة مع عزل صوتي كامل" },
    { title: "تنوع الأداء", description: "قدرة على تقديم أساليب صوتية متنوعة حسب المحتوى" },
    { title: "سرعة التسليم", description: "تسليم سريع مع إمكانية التعديل حسب ملاحظاتك" },
  ];

  // تحويل رابط SoundCloud لرابط embed
  const getSoundCloudEmbed = (url: string) => {
    if (!url) return "";
    const encoded = encodeURIComponent(url);
    return `https://w.soundcloud.com/player/?url=${encoded}&color=%23a855f7&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-red-900/20 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-red-600 rounded-full mb-6">
              <Mic className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">التعليق الصوتي</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              صوت احترافي يضيف الحياة لمحتواك. خبرة طويلة في التعليق الصوتي للإعلانات، الأفلام الوثائقية، والمحتوى التعليمي.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">ما أميز به</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="text-center bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-pink-500 transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500/20 rounded-full mb-4">
                  <Play className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Services */}
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">الخدمات الصوتية</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-pink-500 transition-all">
                <CheckCircle className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                <p className="text-gray-200">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Works */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مشاريع صوتية مميزة</h2>
            <p className="text-gray-400 text-lg">استمع لعينات من أعمالي</p>
          </div>

          {works.length === 0 ? (
            <p className="text-center text-gray-500 py-16">قريباً — سيتم إضافة الأعمال الصوتية</p>
          ) : (
            <div className="space-y-6">
              {works.map((work) => (
                <div key={work.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-pink-500 transition-all">
                  <h3 className="text-xl font-bold mb-2">{work.title}</h3>
                  {work.description && <p className="text-gray-400 mb-4">{work.description}</p>}
                  {work.soundcloudUrl && (
                    <iframe
                      width="100%"
                      height="120"
                      scrolling="no"
                      frameBorder="no"
                      allow="autoplay"
                      src={getSoundCloudEmbed(work.soundcloudUrl)}
                      className="rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">هل تحتاج تعليق صوتي احترافي؟</h2>
          <p className="text-gray-400 text-lg mb-8">دعني أضيف صوتاً مميزاً يعزز رسالتك ويجذب جمهورك</p>
          <a href="mailto:info@example.com" className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg hover:from-pink-600 hover:to-red-700 transition-all font-semibold">
            اطلب عينة صوتية
          </a>
        </div>
      </section>
    </div>
  );
}
