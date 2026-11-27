import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Mic } from "lucide-react";

/**
 * مقدمة صفحة التعليق الصوتي كموشن جرافيك خفيف بدل الفقرات الطويلة:
 *  - ميكروفون تنبض حوله موجة صوتية
 *  - «بـ اللهجة …» تتبدّل بين اللهجات الثلاث
 *  - ثلاث شارات للمزايا تظهر تباعاً
 * كل النصوص من «نصوص الموقع» في لوحة التحكم، والحركة تتوقف لمن فعّل
 * تقليل الحركة في جهازه.
 */
const BARS = [0.25, 0.45, 0.35, 0.7, 0.5, 0.9, 0.6, 1, 0.75, 0.3, 0.3, 0.3, 0.3, 0.3, 0.8, 1, 0.65, 0.95, 0.5, 0.7, 0.4, 0.55, 0.3];

export function VoiceHeroMotion({
  title,
  dialects,
  chips,
}: {
  title: string;
  dialects: string[];
  chips: string[];
}) {
  const reduce = useReducedMotion();
  const words = dialects.filter(Boolean);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, [reduce, words.length]);

  return (
    <div className="flex flex-col items-center">
      {/* الميكروفون والموجة */}
      <div className="relative flex items-center justify-center gap-[5px] h-16 md:h-20 mb-4" aria-hidden>
        {BARS.map((h, n) => {
          const side = n < BARS.length / 2;
          return (
            <motion.span
              key={n}
              className={`block w-1 rounded-full bg-gradient-to-b from-royal-300 to-royal-600 ${n >= 9 && n <= 13 ? "invisible" : ""}`}
              style={{ height: `${h * 100}%`, transformOrigin: "center" }}
              initial={{ scaleY: 0.15, opacity: 0 }}
              animate={
                reduce
                  ? { scaleY: h, opacity: 0.8 }
                  : { scaleY: [0.25, 1, 0.45, 0.85, 0.25], opacity: 0.9 }
              }
              transition={
                reduce
                  ? { duration: 0.3 }
                  : { duration: 1.4 + (n % 4) * 0.2, repeat: Infinity, ease: "easeInOut", delay: (side ? n : BARS.length - n) * 0.06 }
              }
            />
          );
        })}
        <motion.div
          className="absolute inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-royal-400 to-royal-600 shadow-lg shadow-royal-500/30"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          {!reduce && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-royal-400"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <Mic className="w-7 h-7 md:w-8 md:h-8 text-white" />
        </motion.div>
      </div>

      <motion.h1
        className="text-3xl md:text-5xl font-bold"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        {title}
      </motion.h1>

      {/* اللهجة المتبدّلة */}
      {words.length > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2 text-lg md:text-2xl text-gray-300">
          <span>بـ</span>
          <span className="relative inline-flex h-[1.6em] min-w-[9ch] items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={words[i]}
                className="font-bold text-royal-300 whitespace-nowrap"
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

      {/* شارات المزايا */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {chips.filter(Boolean).map((c, n) => (
          <motion.span
            key={c}
            className="rounded-full border border-royal-500/40 bg-royal-500/10 px-3 py-1.5 text-xs md:text-sm font-semibold text-royal-200"
            initial={{ y: 10, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + n * 0.15, type: "spring", stiffness: 300, damping: 20 }}
          >
            {c}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
