import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CheckCircle } from "lucide-react";
import { ServiceHero } from "../../shared/ServiceHero";
import { CategoryArt } from "../portfolio/CategoryArt";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useSeo } from "../../shared/useSeo";
import { useText } from "../../shared/siteText";
import { useSitePhone } from "../../shared/useSitePhone";

interface Work {
  id: string;
  slug?: string;
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

  // «تصميم الهويات البصرية والشعارات» ← «الهويات البصرية والشعارات» للسطر المتبدّل
  const rotating = services.map((x) => x.replace(/^تصميم\s+/, ""));
  const totalImages = works.reduce((n, w) => n + Math.max(w.images?.length || 0, w.coverImage ? 1 : 0), 0);
  const chips = works.length
    ? [`${works.length} ${works.length > 10 ? "مشروعاً" : works.length > 2 ? "مشاريع" : "مشروع"}`, totalImages > works.length ? `+${totalImages} ${totalImages > 10 ? "تصميماً" : "تصاميم"}` : ""]
    : [];

  return (
    <div className="bg-ink-950 text-white min-h-screen">
      <ServiceHero
        kind="design"
        title={t("design.hero.title")}
        lead="أصمّم"
        rotating={rotating}
        chips={chips}
        description={t("design.hero.desc")}
      />

      {/* الأعمال مباشرة بعد المقدمة: عمودان على الجوال ليرى الزائر أكثر في كل شاشة */}
      <section className="pt-4 pb-14">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-3 px-1">
            <h2 className="text-xl md:text-3xl font-bold">{t("design.projects.heading")}</h2>
            {t("design.projects.sub") && <p className="hidden md:block text-gray-400">{t("design.projects.sub")}</p>}
          </div>
          {works.length === 0 ? (
            <p className="text-center text-gray-500 py-16">{t("design.projects.empty")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
              {works.map((work, idx) => {
                const cover = work.coverImage || work.images?.[0];
                const count = work.images?.length || 0;
                return (
                  <Link key={work.id} to={`/portfolio/${work.slug || work.id}`}
                    className={`group overflow-hidden rounded-xl border border-ink-700 bg-ink-900 transition-all hover:border-royal-500 hover:shadow-xl hover:shadow-royal-500/20 ${idx === 0 && works.length % 2 === 1 ? "col-span-2 md:col-span-1" : ""}`}>
                    <div className={`relative overflow-hidden bg-ink-850 ${idx === 0 && works.length % 2 === 1 ? "aspect-[16/10] md:aspect-square" : "aspect-square"}`}>
                      {cover ? (
                        <img src={cover} alt={work.altText || work.title} loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full"><CategoryArt kind="design" /></div>
                      )}
                      {count > 1 && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-ink-950/70 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                          {count} {count === 2 ? "صورتان" : count <= 10 ? "صور" : "صورة"}
                        </span>
                      )}
                    </div>
                    <div className="p-3 md:p-5">
                      <h3 className="line-clamp-2 text-sm md:text-lg font-bold leading-snug transition-colors group-hover:text-royal-300">{work.title}</h3>
                      {work.description && <p className="mt-1 hidden md:block text-sm text-gray-400 line-clamp-2">{work.description}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* الخدمات: شارات مختصرة بدل ست بطاقات كبيرة */}
      <section className="border-t border-ink-800 bg-ink-900/60 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold">{t("design.services.heading")}</h2>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {services.filter(Boolean).map((service) => (
              <span key={service} className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-3.5 py-2 text-sm text-gray-200">
                <CheckCircle className="h-4 w-4 text-royal-400" /> {service}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-ink-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("design.cta.heading")}</h2>
          {t("design.cta.sub") && (
            <p className="text-gray-400 text-lg mb-8">
              {t("design.cta.sub")}
            </p>
          )}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(t("design.cta.whatsapp"))}`}
            target="_blank"
            rel="noopener noreferrer"
            data-whatsapp-cta
            className="inline-block px-8 py-3 bg-royal-500 text-ink-950 rounded-full hover:bg-royal-400 transition-all font-semibold"
          >
            {t("design.cta.button")}
          </a>
        </div>
      </section>
    </div>
  );
}
