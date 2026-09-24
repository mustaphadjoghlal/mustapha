import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CheckCircle, Palette } from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useSeo } from "../../shared/useSeo";
import { useText } from "../../shared/siteText";
import { useSitePhone } from "../../shared/useSitePhone";

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
  const t = useText();
  const phone = useSitePhone();

  useSeo({
    title: t("design.hero.title"),
    description: t("design.hero.desc"),
  });
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

  const services = [1, 2, 3, 4, 5, 6].map((n) => t(`design.service${n}`));

  return (
    <div className="bg-ink-950 text-white min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-royal-900/30 via-royal-800/15 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-royal-500 to-royal-600 rounded-full mb-6">
              <Palette className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("design.hero.title")}</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              {t("design.hero.desc")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-ink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{t("design.services.heading")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-3 bg-ink-850 border border-ink-700 rounded-lg p-6 hover:border-royal-500 transition-all">
                <CheckCircle className="w-6 h-6 text-royal-400 flex-shrink-0 mt-1" />
                <p className="text-gray-200">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-ink-900 to-ink-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("design.projects.heading")}</h2>
            <p className="text-gray-400 text-lg">{t("design.projects.sub")}</p>
          </div>
          {works.length === 0 ? (
            <p className="text-center text-gray-500 py-16">{t("design.projects.empty")}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {works.map((work) => {
                const cover = work.coverImage || work.images?.[0];
                return (
                  <Link key={work.id} to={`/portfolio/${work.id}`}
                    className="group bg-ink-900 border border-ink-700 rounded-xl overflow-hidden hover:border-royal-500 transition-all hover:shadow-xl hover:shadow-royal-500/20">
                    <div className="relative h-56 overflow-hidden bg-ink-850">
                      {cover ? (
                        <img src={cover} alt={work.altText || work.title} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Palette size={40} />
                        </div>
                      )}
                      {work.images?.length > 0 && (
                        <div className="absolute bottom-3 left-3 bg-ink-950/60 text-white text-xs px-2 py-1 rounded-full">
                          {work.images.length} صور
                        </div>
                      )}
                      <div className="absolute inset-0 bg-ink-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-semibold bg-ink-950/60 px-4 py-2 rounded-full">عرض المشروع</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-royal-300 transition-colors">{work.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{work.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-ink-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("design.cta.heading")}</h2>
          <p className="text-gray-400 text-lg mb-8">{t("design.cta.sub")}</p>
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(t("design.cta.whatsapp"))}`}
            target="_blank"
            rel="noopener noreferrer"
            data-whatsapp-cta
            className="inline-block px-8 py-3 bg-royal-500 rounded-lg hover:bg-royal-600 transition-all font-semibold"
          >
            {t("design.cta.button")}
          </a>
        </div>
      </section>
    </div>
  );
}
