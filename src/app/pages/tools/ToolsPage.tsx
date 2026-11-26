import { ArrowLeft } from "lucide-react";
import { useSeo } from "../../shared/useSeo";
import { useText } from "../../shared/siteText";
import { TOOLS } from "../../shared/tools";

/** صفحة /tools — قائمة الإضافات والبرامج، وكل بطاقة تقود إلى صفحة هبوطها */
export function ToolsPage() {
  const t = useText();
  useSeo({ title: t("tools.title"), description: t("tools.desc") });

  return (
    <div className="bg-ink-950 text-fg min-h-screen overflow-x-clip">
      <section className="ms-grain relative -mt-16 overflow-hidden pt-36 pb-12 sm:pt-44 sm:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(80% 70% at 50% -10%, rgba(122,42,49,0.85), rgba(75,19,23,0.3) 50%, transparent 78%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <p className="ms-in ms-eyebrow">{t("tools.eyebrow")}</p>
          <h1 className="ms-in mt-5 text-[2.6rem] sm:text-6xl font-bold leading-[1.15]" style={{ "--d": "100ms" } as React.CSSProperties}>
            {t("tools.title")}
          </h1>
          {t("tools.desc") && (
            <p className="ms-in mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-[1.9] text-fg-muted" style={{ "--d": "200ms" } as React.CSSProperties}>
              {t("tools.desc")}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            // صفحات الهبوط ملفات ثابتة خارج تطبيق React، فالرابط عادي لا Link.
            // البطاقة الأولى (البرنامج المستقل) عريضة، والإضافات الست تحتها في صفّين
            <a
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className={`ms-in ms-glass ms-lift group flex flex-col overflow-hidden rounded-[1.4rem] ${i === 0 ? "sm:col-span-2 lg:col-span-3 lg:flex-row" : ""}`}
              style={{ "--d": `${250 + i * 70}ms` } as React.CSSProperties}
            >
              <div
                className={`relative aspect-[16/9] overflow-hidden ${i === 0 ? "lg:w-[58%] lg:shrink-0" : ""}`}
                style={{ background: `radial-gradient(120% 90% at 80% 0%, ${tool.color}55, transparent 60%), linear-gradient(160deg, #1f0e10, #0e0506)` }}
              >
                {tool.cover ? (
                  <img
                    src={tool.cover}
                    alt={`${tool.name} — ${tool.tagline}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center text-7xl font-bold"
                    style={{ color: tool.color, textShadow: `0 10px 40px ${tool.color}66` }}
                  >
                    {tool.glyph}
                  </span>
                )}
                <span className="ms-glass absolute top-3 start-3 rounded-full px-3 py-1 text-[0.7rem] text-fg" dir="ltr">
                  {tool.host}
                </span>
              </div>
              <div className={`flex flex-1 flex-col p-5 ${i === 0 ? "lg:justify-center lg:p-10" : ""}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className={`font-semibold transition-colors group-hover:text-royal-300 ${i === 0 ? "text-lg lg:text-3xl" : "text-lg"}`}>{tool.name}</h2>
                  {tool.latin !== tool.name && <span className="text-xs text-fg-muted" dir="ltr">{tool.latin}</span>}
                </div>
                <p className={`mt-2 text-sm leading-relaxed text-fg-muted ${i === 0 ? "lg:flex-none lg:text-base lg:mt-4" : "flex-1"}`}>{tool.tagline}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-royal-400">
                  {t("tools.open")}
                  <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
