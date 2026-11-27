import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { ServiceHero } from "../../shared/ServiceHero";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useSeo } from "../../shared/useSeo";
import { useText } from "../../shared/siteText";
import { useSitePhone } from "../../shared/useSitePhone";
import { MotionCard, type MotionWork } from "../../components/MotionCard";

export function PortfolioMotionPage() {
  const t = useText();
  const phone = useSitePhone();

  useSeo({ title: t("motion.hero.title"), description: t("motion.hero.desc") });

  const [works, setWorks] = useState<MotionWork[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "works"), (snap) => {
      setWorks(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as MotionWork & { category: string }))
          .filter((w) => w.category === "motion")
      );
    });
    return unsub;
  }, []);

  const services = [1, 2, 3, 4, 5, 6].map((n) => t(`motion.service${n}`)).filter(Boolean);

  return (
    <div className="bg-ink-950 text-fg min-h-screen overflow-x-clip">
      {/* مقدمة مختصرة متحركة — الأعمال تظهر في الشاشة الأولى */}
      <ServiceHero
        kind="motion"
        title={t("motion.hero.title")}
        lead="أصنع"
        rotating={services}
        chips={works.length ? [`${works.length} ${works.length > 10 ? "عملاً" : works.length > 2 ? "أعمال" : works.length === 2 ? "عملان" : "عمل"}`] : []}
        description={t("motion.hero.desc")}
      />

      {/* الأعمال */}
      <section className="mx-auto max-w-7xl px-3 sm:px-8 pt-4 pb-14">
        <div className="px-1">
          <h2 className="text-xl md:text-3xl font-bold">{t("motion.projects.heading")}</h2>
          {t("motion.projects.sub") && <p className="mt-1.5 text-xs md:text-sm text-fg-muted">{t("motion.projects.sub")}</p>}
        </div>
        {works.length === 0 ? (
          <p className="py-20 text-center text-fg-muted">{t("motion.projects.empty")}</p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {works.map((w) => (
              <MotionCard key={w.id} work={w} />
            ))}
          </div>
        )}
      </section>

      {/* الخدمات: شارات مختصرة */}
      {services.length > 0 && (
        <section className="border-t border-ink-800 bg-ink-900/60 py-12 mb-14">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-xl md:text-2xl font-bold">{t("motion.services.heading")}</h2>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              {services.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-3.5 py-2 text-sm text-gray-200">
                  <Check className="h-4 w-4 text-royal-400" /> {s}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* الطلب */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div
          className="ms-grain relative overflow-hidden rounded-[2rem] border border-royal-200/10 px-6 py-12 text-center"
          style={{ background: "radial-gradient(80% 90% at 50% 0%, rgba(122,42,49,0.9), rgba(42,10,12,0.95) 60%, #140809)" }}
        >
          <h2 className="ms-h2 relative mx-auto max-w-2xl">{t("motion.cta.heading")}</h2>
          {t("motion.cta.sub") && <p className="relative mx-auto mt-4 max-w-md text-fg-muted">{t("motion.cta.sub")}</p>}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(t("motion.cta.whatsapp"))}`}
            target="_blank"
            rel="noopener noreferrer"
            data-whatsapp-cta
            className="ms-btn ms-btn-primary relative mt-9"
          >
            {t("motion.cta.button")}
          </a>
        </div>
      </section>
    </div>
  );
}
