import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CheckCircle, Palette } from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Work {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  altText: string;
  category: "design" | "photography" | "voice";
}

export function PortfolioDesignPage() {
  const [works, setWorks] = useState<Work[]>([]);

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

  return (
    <div className="bg-black text-white min-h-screen">
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

      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مشاريع مميزة</h2>
            <p className="text-gray-400 text-lg">نماذج من أعمالي في التصميم الجرافيكي</p>
          </div>
          {works.length === 0 ? (
            <p className="text-center text-gray-500 py-16">قريباً — سيتم إضافة الأعمال</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {works.map((work) => {
                const cover = work.coverImage || work.images?.[0];
                return (
                  <Link key={work.id} to={`/portfolio/${work.id}`}
                    className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20">
                    <div className="relative h-56 overflow-hidden bg-gray-800">
                      {cover ? (
                        <img src={cover} alt={work.altText || work.title} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Palette size={40} />
                        </div>
                      )}
                      {work.images?.length > 0 && (
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {work.images.length} صور
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-semibold bg-black/60 px-4 py-2 rounded-full">عرض المشروع</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors">{work.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{work.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">هل لديك مشروع تصميم؟</h2>
          <p className="text-gray-400 text-lg mb-8">دعنا نعمل معاً لإنشاء تصاميم تعبر عن رؤيتك وتحقق أهدافك</p>
          <a href="https://wa.me/96871227281?text=مرحباً مصطفى، أود الاستفسار عن خدمات التصميم الجرافيكي" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold">
            تواصل عبر واتساب 💬
          </a>
        </div>
      </section>
    </div>
  );
}
