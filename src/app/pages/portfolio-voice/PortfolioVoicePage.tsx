import { useState, useEffect, useRef } from "react";
import { CheckCircle, Mic, Play, Pause, Link } from "lucide-react";
import { Link as RouterLink } from "react-router";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface VoiceWork {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  soundcloudUrl?: string;
  audioUrl?: string;
  category: "design" | "photography" | "voice";
}

function AudioPlayer({ url, title }: { url: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
      <audio ref={audioRef}
        src={url}
        onTimeUpdate={() => { if (audioRef.current) { setCurrentTime(audioRef.current.currentTime); setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100); } }}
        onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button onClick={togglePlay} className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center hover:from-pink-600 hover:to-red-700 transition-all">
        {playing ? <Pause size={20} /> : <Play size={20} className="mr-[-2px]" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate mb-2">{title}</p>
        <div className="relative h-1.5 bg-gray-700 rounded-full cursor-pointer"
          onClick={(e) => {
            if (!audioRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = ratio * audioRef.current.duration;
          }}>
          <div className="absolute top-0 right-0 h-full bg-gradient-to-l from-pink-500 to-red-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-500 text-xs">{formatTime(currentTime)}</span>
          <span className="text-gray-500 text-xs">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
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

  const getSoundCloudEmbed = (url: string) => {
    if (!url) return "";
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23a855f7&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
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
            <div className="grid grid-cols-1 gap-6">
              {works.map((work) => (
                <div key={work.id} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-pink-500 transition-all hover:shadow-xl hover:shadow-pink-500/20 flex flex-col md:flex-row">
                  {/* صورة الغلاف */}
                  {work.coverImage && (
                    <RouterLink to={`/portfolio/${work.id}`} className="md:w-1/4 h-48 md:h-auto overflow-hidden flex-shrink-0">
                      <img src={work.coverImage} alt={work.title} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </RouterLink>
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold group-hover:text-pink-400 transition-colors">{work.title}</h3>
                      <RouterLink to={`/portfolio/${work.id}`} className="text-gray-500 hover:text-pink-400 transition-colors">
                        <Link size={16} />
                      </RouterLink>
                    </div>
                    {work.description && <p className="text-gray-400 mb-4 text-sm line-clamp-1">{work.description}</p>}
                    <div className="mt-auto">
                      {/* مشغل MP3 */}
                      {work.audioUrl && <AudioPlayer url={work.audioUrl} title={work.title} />}
                      {/* SoundCloud fallback */}
                      {!work.audioUrl && work.soundcloudUrl && (
                        <iframe width="100%" height="120" scrolling="no" frameBorder="no" allow="autoplay"
                          src={getSoundCloudEmbed(work.soundcloudUrl)}
                          className="rounded-lg" loading="lazy" />
                      )}
                    </div>
                  </div>
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
          <a href="https://wa.me/96871227281?text=مرحباً مصطفى، أود الاستفسار عن خدمات التعليق الصوتي" className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg hover:from-pink-600 hover:to-red-700 transition-all font-semibold">
            اطلب عينة صوتية
          </a>
        </div>
      </section>
    </div>
  );
}
