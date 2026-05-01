import { useState, useEffect } from "react";
import { CheckCircle, Palette, X, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Work {
  id: string;
  title: string;
  description: string;
  images: string[];
  altText: string;
  category: "design" | "photography" | "voice";
}

export function PortfolioDesignPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [lightbox, setLightbox] = useState<{ work: Work; imgIndex: number } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "works"), (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Work))
        .filter((w) => w.category === "design");
      setWorks(data);
    });
    return unsub;
  }, []);

  const services = [
    "تصميم الهويات البصرية والشعارات",
    "تصميم المواد التسويقية والإعلانية",
    "تصميم الكتب والمجلات الإلكترونية",
    "تصميم واجهات المستخدم (UI Design)",
    "تصميم البوسترات والإنفوجرافيك",
    "تصميم محتوى وسائل التواصل الاجتماعي",
  ];

  const nextImg = () => {
    if (!lightbox) return;
    const max = lightbox.work.images.length - 1;
    setLightbox({ ...lightbox, imgIndex: lightbox.imgIndex < max ? lightbox.imgIndex + 1 : 0 });
  };

  const prevImg = () => {
    if (!lightbox) return;
    const max = lightbox.work.images.length - 1;
    setLightbox({ ...lightbox, imgIndex: lightbox.imgIndex > 0 ? lightbox.imgIndex - 1 : max });
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 left-4 text-white hover:text-gray-300" onClick={() => setLightbox(null)}>
            <X size={32} />
          </button>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.work.images[lightbox.imgIndex]} alt={lightbox.work.altText} className="w-full max-h-[80vh] object-contain rounded-xl" />
            {lightbox.work.images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full">
                  <ChevronRight size={24} />
                </button>
                <button onClick={nextImg} className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex justify-center gap-2 mt-3">
                  {lightbox.work.images.map((_, i) => (
                    <button key={i} onClick={() => setLightbox({ ...lightbox, imgIndex: i })}
                      className={`w-2 h-2 rounded-full transition-all ${i === lightbox.imgIndex ? "bg-blue-400 w-4" : "bg-gray-600"}`} />
                  ))}
                </div>
              </>
            )}
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold">{lightbox.work.title}</h3>
              <p className="text-gray-400 mt-1">{lightbox.work.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <Palette className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">التصميم الجرافيكي</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              أقدم تصاميم جرافيكية احترافية تجمع بين الإبداع والوظيفية، مصممة خصيصاً لتلبية احتياجات عملك وتعزيز هويتك البصرية.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">الخدمات المقدمة</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-gray-200">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مشاريع مميزة</h2>
            <p className="text-gray-400 text-lg">نماذج من أعمالي في التصميم الجرافيكي</p>
          </div>

          {works.length === 0 ? (
            <p className="text-center text-gray-500 py-16">قريباً — سيتم إضافة الأعمال</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {works.map((work) => (
                <div key={work.id} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20">
                  {/* صور متعددة */}
                  {work.images && work.images.length > 0 && (
                    <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => setLightbox({ work, imgIndex: 0 })}>
                      <img src={work.images[0]} alt={work.altText || work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {work.images.length > 1 && (
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          +{work.images.length - 1} صور
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-semibold bg-black/50 px-4 py-2 rounded-full">عرض الصور</span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{work.title}</h3>
                    <p className="text-gray-400">{work.description}</p>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">هل لديك مشروع تصميم؟</h2>
          <p className="text-gray-400 text-lg mb-8">دعنا نعمل معاً لإنشاء تصاميم تعبر عن رؤيتك وتحقق أهدافك</p>
          <a href="mailto:info@example.com" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold">
            ابدأ مشروعك الآن
          </a>
        </div>
      </section>
    </div>
  );
}
