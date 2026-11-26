import { useState, useEffect } from "react";
import { Clapperboard, Check } from "lucide-react";
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
      {/* البطل */}
      <section className="ms-grain relative -mt-16 overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(80% 70% at 50% -10%, rgba(122,42,49,0.85), rgba(75,19,23,0.3) 50%, transparent 78%)" }}
        />
        <div
          aria-hidden="true"
          className="ms-pattern pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ maskImage: "radial-gradient(60% 60% at 50% 25%, #000, transparent)", WebkitMaskImage: "radial-gradient(60% 60% at 50% 25%, #000, transparent)" }}
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <span className="ms-in ms-glass mx-auto flex h-16 w-16 items-center justify-center rounded-full text-royal-400">
            <Clapperboard size={26} />
          </span>
          <h1 className="ms-in mt-7 text-[2.6rem] sm:text-6xl font-bold leading-[1.15]" style={{ "--d": "100ms" } as React.CSSProperties}>
            {t("motion.hero.title")}
          </h1>
          {t("motion.hero.desc") && (
            <p className="ms-in mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-[1.9] text-fg-muted" style={{ "--d": "200ms" } as React.CSSProperties}>
              {t("motion.hero.desc")}
            </p>
          )}
        </div>
      </section>

      {/* الأعمال */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-20">
        <div className="text-center">
          <h2 className="ms-h2">{t("motion.projects.heading")}</h2>
          {t("motion.projects.sub") && <p className="mt-3 text-sm text-fg-muted">{t("motion.projects.sub")}</p>}
        </div>
        {works.length === 0 ? (
          <p className="py-20 text-center text-fg-muted">{t("motion.projects.empty")}</p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {works.map((w) => (
              <MotionCard key={w.id} work={w} />
            ))}
          </div>
        )}
      </section>

      {/* الخدمات */}
      {services.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-20">
          <h2 className="ms-h2 text-center">{t("motion.services.heading")}</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s} className="ms-glass flex items-center gap-3 rounded-2xl p-5">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-maroon-500/70 text-royal-400">
                  <Check size={15} />
                </span>
                <p className="text-sm sm:text-[0.95rem]">{s}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* الطلب */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div
          className="ms-grain relative overflow-hidden rounded-[2rem] border border-royal-200/10 px-6 py-16 text-center"
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
