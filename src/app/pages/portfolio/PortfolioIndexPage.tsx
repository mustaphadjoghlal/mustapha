import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Mic, Camera, Palette, ArrowLeft } from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useSeo } from "../../shared/useSeo";
import { useText } from "../../shared/siteText";

interface Work {
  id: string;
  title: string;
  coverImage: string;
  altText: string;
  category: "design" | "photography" | "voice";
}

/** مجالات الأعمال — كل مجال يقود إلى صفحته الكاملة */
const categories = [
  { key: "voice" as const, textKey: "works.voice", link: "/portfolio-voice", Icon: Mic },
  { key: "photography" as const, textKey: "works.photography", link: "/portfolio-photography", Icon: Camera },
  { key: "design" as const, textKey: "works.design", link: "/portfolio-design", Icon: Palette },
];

export function PortfolioIndexPage() {
  const t = useText();

  useSeo({
    title: t("works.heading"),
    description:
      "أعمال مصطفى جغلال في التعليق الصوتي والتصوير والتصميم الجرافيكي — مشاريع مختارة لعلامات تجارية ومشاريع ثقافية.",
  });

  const [works, setWorks] = useState<Work[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "works"), (snap) => {
      setWorks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Work)));
    });
    return unsub;
  }, []);

  return (
    <div className="bg-ink-950 text-fg">
      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-14 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold">{t("works.heading")}</h1>
        <span className="rule-accent mt-4" />
        {t("works.intro") && (
          <p className="mt-5 max-w-xl text-fg-muted leading-relaxed">
            {t("works.intro")}
          </p>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ key, textKey, link, Icon }) => {
            const title = t(`${textKey}.title`);
            const description = t(`${textKey}.desc`);
            const items = works.filter((w) => w.category === key);
            const cover = items.find((w) => w.coverImage);

            return (
              <Link
                key={key}
                to={link}
                className="group relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 transition-colors hover:border-royal-600"
              >
                {/* غلاف من أحدث عمل في المجال */}
                <div className="relative h-44 overflow-hidden bg-ink-850">
                  {cover ? (
                    <img
                      src={cover.coverImage}
                      alt={cover.altText || title}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-70 transition-all duration-500 group-hover:scale-105 group-hover:opacity-90"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon size={40} strokeWidth={1.3} className="text-royal-500/60" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2.5">
                    <Icon size={19} strokeWidth={1.7} className="text-royal-400" />
                    <h2 className="text-[1.05rem] font-semibold transition-colors group-hover:text-royal-300">
                      {title}
                    </h2>
                  </div>

                  <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">{description}</p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-fg-muted">
                      {items.length > 0 ? `${items.length} عملاً` : t("works.soon")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-royal-400">
                      {t("works.browse")}
                      <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
