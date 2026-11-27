import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CheckCircle } from "lucide-react";
import { ServiceHero } from "../../shared/ServiceHero";
import { Lightbox, type LightboxItem } from "../../components/Lightbox";
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

export function PortfolioPhotographyPage() {
  const t = useText();
  const phone = useSitePhone();

  useSeo({
    title: t("photo.hero.title"),
    description: t("photo.hero.desc"),
  });
  const [works, setWorks] = useState<Work[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "works"), (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Work))
        .filter((w) => w.category === "photography");
      setWorks(data);
    });
    return unsub;
  }, []);

  const services = [1, 2, 3, 4, 5, 6].map((n) => t(`photo.service${n}`));

  // كل صور المشاريع في معرض واحد — في التصوير، الصورة هي العمل نفسه
  const photos: (LightboxItem & { workId: string })[] = works.flatMap((w) => {
    const list = [w.coverImage, ...(w.images || [])].filter(Boolean);
    return [...new Set(list)].map((src) => ({
      src, workId: w.id, alt: w.altText || w.title, caption: w.title, href: `/portfolio/${w.slug || w.id}`,
    }));
  });
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);
  const shown = filter === "all" ? photos : photos.filter((p) => p.workId === filter);

  const rotating = ["المنتجات والإعلانات", "الفعاليات والحفلات", "البورتريهات الشخصية", "العمارة والعقارات"];
  const chips = works.length
    ? [`${works.length} ${works.length > 10 ? "مشروعاً" : works.length > 2 ? "مشاريع" : "مشروع"}`,
       photos.length ? `${photos.length} ${photos.length > 10 ? "صورة" : photos.length > 2 ? "صور" : "صورة"}` : ""]
    : [];

  return (
    <div className="bg-ink-950 text-white min-h-screen">
      <ServiceHero
        kind="photography"
        title={t("photo.hero.title")}
        lead="أصوّر"
        rotating={rotating}
        chips={chips}
        description={t("photo.hero.desc")}
      />

      {/* المعرض: الصور مباشرة بعد المقدمة، تُفتح بملء الشاشة */}
      <section className="pt-4 pb-14">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-end justify-between gap-3 px-1">
            <h2 className="text-xl md:text-3xl font-bold">{t("photo.projects.heading")}</h2>
            {t("photo.projects.sub") && <p className="hidden md:block text-gray-400">{t("photo.projects.sub")}</p>}
          </div>

          {photos.length === 0 ? (
            <p className="text-center text-gray-500 py-16">{t("photo.projects.empty")}</p>
          ) : (
            <>
              {/* تصفية حسب المشروع */}
              {works.length > 1 && (
                <div className="-mx-3 mb-4 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[{ id: "all", title: "الكل" }, ...works].map((w) => (
                    <button key={w.id} onClick={() => setFilter(w.id)}
                      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${filter === w.id ? "border-royal-500 bg-royal-500 text-ink-950 font-semibold" : "border-ink-700 bg-ink-900 text-gray-300 hover:border-royal-600"}`}>
                      {w.title}
                    </button>
                  ))}
                </div>
              )}

              {/* شبكة متدرّجة (masonry) تحترم أبعاد كل صورة */}
              <div className="columns-2 gap-2.5 md:columns-3 md:gap-4">
                {shown.map((p, i) => (
                  <button key={p.src + i} onClick={() => setOpen(i)}
                    className="group mb-2.5 md:mb-4 block w-full overflow-hidden rounded-xl bg-ink-850 break-inside-avoid">
                    <img src={p.src} alt={p.alt} loading="lazy"
                      className="w-full h-auto transition-transform duration-500 group-hover:scale-105" />
                  </button>
                ))}
              </div>

              {/* روابط المشاريع الكاملة */}
              {filter !== "all" && (
                <div className="mt-4 text-center">
                  {works.filter((w) => w.id === filter).map((w) => (
                    <Link key={w.id} to={`/portfolio/${w.slug || w.id}`} className="text-sm font-semibold text-royal-300 hover:text-royal-200">
                      تفاصيل مشروع «{w.title}» ←
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Lightbox items={shown} index={open} onChange={setOpen} onClose={() => setOpen(null)} />

      {/* الخدمات: شارات مختصرة */}
      <section className="border-t border-ink-800 bg-ink-900/60 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold">{t("photo.services.heading")}</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("photo.cta.heading")}</h2>
          {t("photo.cta.sub") && (
            <p className="text-gray-400 text-lg mb-8">
              {t("photo.cta.sub")}
            </p>
          )}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(t("photo.cta.whatsapp"))}`}
            target="_blank"
            rel="noopener noreferrer"
            data-whatsapp-cta
            className="inline-block px-8 py-3 bg-royal-500 text-ink-950 rounded-full hover:bg-royal-400 transition-all font-semibold"
          >
            {t("photo.cta.button")}
          </a>
        </div>
      </section>
    </div>
  );
}
