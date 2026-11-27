import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CategoryArt } from "../pages/portfolio/CategoryArt";

/**
 * مقدمة مختصرة متحركة لصفحات الخدمات (تصميم، تصوير، موشن):
 * رسم فيكتور للمجال + عنوان + سطر يتبدّل بين الخدمات + شارات.
 * الهدف أن يصل الزائر إلى الأعمال في الشاشة الأولى، لا بعد فقرات طويلة.
 */
export function ServiceHero({
  kind,
  title,
  lead,
  rotating,
  chips = [],
  description,
}: {
  kind: "design" | "photography" | "motion" | "voice";
  title: string;
  /** الكلمة الثابتة قبل السطر المتبدّل، مثل «أصمّم» */
  lead: string;
  rotating: string[];
  chips?: string[];
  /** الفقرة التعريفية — مخفية بصرياً، باقية لجوجل وقارئات الشاشة */
  description?: string;
}) {
  const reduce = useReducedMotion();
  const words = rotating.filter(Boolean);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, [reduce, words.length]);

  return (
    <section className="relative overflow-hidden pt-6 pb-4 md:pt-12 md:pb-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <motion.div
          className="h-28 w-40 md:h-36 md:w-48"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <CategoryArt kind={kind} bare />
        </motion.div>

        <motion.h1
          className="mt-1 text-3xl md:text-5xl font-bold"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          {title}
        </motion.h1>
        {description && <p className="sr-only">{description}</p>}

        {words.length > 0 && (
          <div className="mt-3 flex min-h-[1.8em] flex-wrap items-center justify-center gap-x-2 text-base md:text-xl text-gray-300">
            <span>{lead}</span>
            <span className="relative inline-flex overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={words[i]}
                  className="font-bold text-royal-300"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {words[i]}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        )}

        {chips.filter(Boolean).length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {chips.filter(Boolean).map((c, n) => (
              <motion.span
                key={c}
                className="rounded-full border border-royal-500/40 bg-royal-500/10 px-3 py-1 text-xs md:text-sm font-semibold text-royal-200"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + n * 0.12 }}
              >
                {c}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
