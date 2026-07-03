import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { QUESTIONS_BANK, CATEGORY_LABELS } from "./hakawatiQuestionsBank";
import type { HakawatiCategory } from "./hakawatiQuestionsBank";

// ─── الأنواع ───
export interface HakawatiQuestion {
  id?: string;
  q: string;
  options: string[];
  answer: number;
  story: string;
  category: HakawatiCategory;
}

export interface HakawatiSettings {
  total: number;
  time: number;
  lives: number;
}

// ─── بنك أسئلة احتياطي (يُستخدم إن كانت قاعدة البيانات فارغة) ───
export const DEFAULT_QUESTIONS: HakawatiQuestion[] = QUESTIONS_BANK;

const DEFAULT_SETTINGS: HakawatiSettings = { total: 10, time: 30, lives: 3 };

const CATEGORY_ICONS: Record<HakawatiCategory, string> = {
  islamic: "🕌",
  algeria: "🇩🇿",
  world: "🌍",
};

const RANKS = [
  { min: 0, title: "مستمع في المجلس", desc: "ما زلت في أول الحكاية.. عُد واسمع من جديد" },
  { min: 0.4, title: "راوي الحي", desc: "بدأت الحكايات تعلق في صدرك" },
  { min: 0.6, title: "حافظ السِيَر", desc: "قليل من يعرف ما تعرف" },
  { min: 0.8, title: "حكواتي المقهى", desc: "الناس تتحلّق حولك لتسمع" },
  { min: 1, title: "حكواتي الزمان", desc: "أنت من يروي التاريخ.. لا من يسمعه" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Fanous: React.FC<{ lit: boolean; size?: number }> = ({ lit, size = 34 }) => (
  <svg width={size} height={size * 1.5} viewBox="0 0 40 60" style={{ filter: lit ? "drop-shadow(0 0 8px rgba(201,133,63,0.8))" : "none", opacity: lit ? 1 : 0.25, transition: "all .5s" }}>
    <line x1="20" y1="0" x2="20" y2="6" stroke="#8a6d3b" strokeWidth="2" />
    <rect x="14" y="6" width="12" height="4" rx="1" fill="#b08d46" />
    <path d="M10 12 L30 12 L33 40 L7 40 Z" fill={lit ? "#c9853f" : "#3a3325"} stroke="#8a6d3b" strokeWidth="1.5" />
    <path d="M13 15 L27 15 L29 37 L11 37 Z" fill={lit ? "#f0c98a" : "#241f14"} />
    <line x1="20" y1="15" x2="20" y2="37" stroke="#8a6d3b" strokeWidth="1" />
    <line x1="16.5" y1="15" x2="15" y2="37" stroke="#8a6d3b" strokeWidth=".7" />
    <line x1="23.5" y1="15" x2="25" y2="37" stroke="#8a6d3b" strokeWidth=".7" />
    <path d="M7 40 L33 40 L30 46 L10 46 Z" fill="#b08d46" />
    <circle cx="20" cy="50" r="3" fill="#8a6d3b" />
  </svg>
);

const MoonProgress: React.FC<{ step: number; total: number }> = ({ step, total }) => {
  const pct = step / total;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="30" height="30" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r="12" fill="none" stroke="rgba(201,133,63,0.25)" strokeWidth="2.5" />
        <circle cx="15" cy="15" r="12" fill="none" stroke="#c9853f" strokeWidth="2.5"
          strokeDasharray={`${pct * 75.4} 75.4`} strokeLinecap="round" transform="rotate(-90 15 15)" style={{ transition: "stroke-dasharray .6s" }} />
        <path d="M18 8 A8 8 0 1 0 18 22 A6.5 6.5 0 1 1 18 8" fill="#c9853f" opacity={0.35 + pct * 0.65} />
      </svg>
      <span style={{ fontSize: 14, color: "#a8763f", fontFamily: "'Tajawal', sans-serif" }}>الليلة {step} من {total}</span>
    </div>
  );
};

type Screen = "loading" | "start" | "category" | "play" | "end";

const HakawatiGamePage: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("loading");
  const [questions, setQuestions] = useState<HakawatiQuestion[]>(DEFAULT_QUESTIONS);
  const [settings, setSettings] = useState<HakawatiSettings>(DEFAULT_SETTINGS);
  const [selectedCategory, setSelectedCategory] = useState<HakawatiCategory | "all">("all");

  const [pool, setPool] = useState<HakawatiQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  // ─── تمرير تلقائي لإظهار زر «الليلة التالية» عند كشف الإجابة ───
  useEffect(() => {
    if (revealed) revealRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [revealed]);

  // ─── جلب البيانات من Firestore ───
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "hakawati_questions"));
        const fetched: HakawatiQuestion[] = snap.docs.map(d => {
          const data = d.data() as Omit<HakawatiQuestion, "id">;
          return { id: d.id, ...data, category: data.category || "islamic" };
        });
        if (fetched.length > 0) setQuestions(fetched);

        const settingsSnap = await getDoc(doc(db, "hakawati_settings", "config"));
        if (settingsSnap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...(settingsSnap.data() as Partial<HakawatiSettings>) });
        }
      } catch (e) {
        console.error("Hakawati: fallback to default questions", e);
      }
      setScreen("start");
    })();
  }, []);

  const categoryCounts: Record<HakawatiCategory, number> = { islamic: 0, algeria: 0, world: 0 };
  questions.forEach(qq => { categoryCounts[qq.category] = (categoryCounts[qq.category] || 0) + 1; });

  const effectiveTotal = pool.length > 0 ? pool.length : Math.min(settings.total, questions.length);

  const startGame = (cat: HakawatiCategory | "all") => {
    const filtered = cat === "all" ? questions : questions.filter(qq => qq.category === cat);
    if (filtered.length === 0) return;
    const total = Math.min(settings.total, filtered.length);
    setSelectedCategory(cat);
    setPool(shuffle(filtered).slice(0, total));
    setIdx(0); setScore(0); setLives(settings.lives);
    setSelected(null); setRevealed(false); setTimeLeft(settings.time);
    setScreen("play");
  };

  useEffect(() => {
    if (screen !== "play" || revealed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); handleAnswer(-1); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, idx, revealed]);

  const handleAnswer = (i: number) => {
    if (revealed) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(i);
    setRevealed(true);
    if (i === pool[idx].answer) setScore(s => s + 1);
    else setLives(l => l - 1);
  };

  const next = () => {
    if (lives <= 0 || idx + 1 >= effectiveTotal) { setScreen("end"); return; }
    setIdx(i => i + 1);
    setSelected(null); setRevealed(false); setTimeLeft(settings.time);
  };

  const ratio = effectiveTotal > 0 ? score / effectiveTotal : 0;
  const rank = [...RANKS].reverse().find(r => ratio >= r.min) || RANKS[0];
  const q = pool[idx];

  const S: Record<string, React.CSSProperties> = {
    root: { minHeight: "100vh", background: "radial-gradient(ellipse at 50% -20%, #2b1a10 0%, #120b07 55%, #050302 100%)", direction: "rtl", fontFamily: "'Tajawal', sans-serif", color: "#f2e9da", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 40px", position: "relative", overflow: "hidden" },
    display: { fontFamily: "'Aref Ruqaa', serif" },
    card: { background: "linear-gradient(160deg, rgba(58,36,20,0.85), rgba(18,11,7,0.9))", border: "1px solid rgba(168,99,46,0.35)", borderRadius: 18, padding: "26px 22px", maxWidth: 560, width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" },
    btn: { background: "linear-gradient(160deg, #c9853f, #8b5a2b)", color: "#1a1206", border: "none", borderRadius: 12, padding: "14px 38px", fontSize: 19, fontWeight: 700, cursor: "pointer", fontFamily: "'Tajawal', sans-serif", boxShadow: "0 4px 18px rgba(217,169,79,0.35)" },
  };

  const stars = Array.from({ length: 40 }, (_, i) => (
    <div key={i} style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "#fff", opacity: Math.random() * 0.7 + 0.15, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 3}s` }} />
  ));

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap');
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:.8} }
        @keyframes sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{filter:drop-shadow(0 0 10px rgba(201,133,63,.6))} 50%{filter:drop-shadow(0 0 22px rgba(201,133,63,.95))} }
        .hakawati-btn:hover { transform: translateY(-2px); }
        .hakawati-btn { transition: transform .15s; }
        .hakawati-btn:disabled:hover { transform: none; }
        @media (prefers-reduced-motion: reduce) { .hakawati-anim { animation: none !important; } }
      `}</style>
      {stars}

      <div style={{ display: "flex", gap: 40 }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="hakawati-anim" style={{ animation: `sway ${3.5 + i}s ease-in-out infinite`, transformOrigin: "top center" }}>
            <div style={{ width: 2, height: 24 + i * 10, background: "rgba(168,99,46,.5)", margin: "0 auto" }} />
            <Fanous lit={screen !== "play" || i < lives} size={i === 1 ? 30 : 24} />
          </div>
        ))}
      </div>

      {screen === "loading" && (
        <div style={{ ...S.card, textAlign: "center", marginTop: 40 }}>
          <div style={{ ...S.display, fontSize: 24, color: "#c9853f" }}>يجهّز الحكواتي مجلسه...</div>
        </div>
      )}

      {screen === "start" && (
        <div style={{ ...S.card, textAlign: "center", marginTop: 26, animation: "fadeUp .7s" }}>
          <div style={{ fontSize: 15, letterSpacing: 2, color: "#a8763f", marginBottom: 10 }}>حيث تعود أحداث الماضي للحياة</div>
          <img src="/hakawati/logo.png" alt="الحكواتي" style={{ width: 260, maxWidth: "85%", margin: "0 auto 4px", animation: "glowPulse 4s infinite" }} />
          <div style={{ width: 90, height: 1, background: "linear-gradient(90deg, transparent, #a8763f, transparent)", margin: "10px auto 18px" }} />
          <p style={{ fontSize: 17, lineHeight: 1.9, color: "#d9c9b0", margin: "0 0 6px" }}>
            كان يا ما كان، في قديم الزمان..<br />
            {settings.total} ليالٍ، و{settings.total} حكايات من تاريخ أمّةٍ عظيمة.<br />
            في كل ليلة سؤال، ولك {settings.lives} فوانيس..<br />
            <b style={{ color: "#c9853f" }}>فإن انطفأت كلها، انفضّ المجلس.</b>
          </p>
          <div style={{ fontSize: 14, color: "#8a7660", marginBottom: 22 }}>⏳ لكل سؤال {settings.time} ثانية</div>
          <button className="hakawati-btn" style={S.btn} onClick={() => setScreen("category")}>افتح المجلس 🏮</button>
        </div>
      )}

      {screen === "category" && (
        <div style={{ ...S.card, textAlign: "center", marginTop: 26, animation: "fadeUp .7s" }}>
          <div style={{ ...S.display, fontSize: 15, color: "#a8763f", marginBottom: 6 }}>يهمس الحكواتي..</div>
          <h2 style={{ ...S.display, fontSize: 26, color: "#c9853f", marginBottom: 24 }}>من أي ديوانٍ تريد أن أحكي لك الليلة؟</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {(Object.keys(CATEGORY_LABELS) as HakawatiCategory[]).map(cat => (
              <button
                key={cat}
                className="hakawati-btn"
                onClick={() => startGame(cat)}
                disabled={categoryCounts[cat] === 0}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(168,99,46,0.35)", color: "#f2e9da",
                  borderRadius: 12, padding: "14px 18px", fontSize: 17, fontWeight: 700,
                  cursor: categoryCounts[cat] === 0 ? "not-allowed" : "pointer", opacity: categoryCounts[cat] === 0 ? 0.4 : 1,
                  display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Tajawal', sans-serif",
                }}
              >
                <span>{CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}</span>
                <span style={{ fontSize: 13, color: "#a8763f" }}>{categoryCounts[cat]} سؤال</span>
              </button>
            ))}
            <button className="hakawati-btn" onClick={() => startGame("all")} disabled={questions.length === 0} style={{ ...S.btn, marginTop: 6 }}>
              🏮 الكل
            </button>
          </div>
          <button
            onClick={() => setScreen("start")}
            style={{ marginTop: 18, background: "none", border: "none", color: "#7a6650", fontSize: 13, cursor: "pointer", fontFamily: "'Tajawal', sans-serif" }}
          >
            → رجوع
          </button>
        </div>
      )}

      {screen === "play" && q && (
        <div style={{ maxWidth: 560, width: "100%", marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <MoonProgress step={idx + 1} total={effectiveTotal} />
            <div style={{ fontSize: 15, color: "#a8763f" }}>الحكايات المحفوظة: <b style={{ color: "#c9853f" }}>{score}</b></div>
          </div>

          <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 18, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(timeLeft / settings.time) * 100}%`, background: timeLeft <= 8 ? "#c0503f" : "#c9853f", borderRadius: 3, transition: "width 1s linear, background .4s" }} />
          </div>

          <div key={idx} style={{ ...S.card, animation: "fadeUp .5s" }}>
            <div style={{ ...S.display, fontSize: 15, color: "#a8763f", marginBottom: 10 }}>يحكى أنّ الحكواتي سأل أهل المجلس:</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.7, margin: "0 0 20px" }}>{q.q}</h2>

            <div style={{ display: "grid", gap: 10 }}>
              {q.options.map((opt, i) => {
                let bg = "rgba(255,255,255,0.05)", border = "rgba(168,99,46,0.25)", color = "#f2e9da";
                if (revealed) {
                  if (i === q.answer) { bg = "rgba(62,124,89,0.35)"; border = "#3e7c59"; }
                  else if (i === selected) { bg = "rgba(169,59,59,0.3)"; border = "#a93b3b"; color = "#e8c9c9"; }
                  else { color = "#8a8070"; }
                }
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={revealed}
                    style={{ background: bg, border: `1.5px solid ${border}`, color, borderRadius: 12, padding: "13px 16px", fontSize: 17, fontWeight: 500, textAlign: "right", cursor: revealed ? "default" : "pointer", fontFamily: "'Tajawal', sans-serif" }}>
                    {opt} {revealed && i === q.answer && " ✓"} {revealed && i === selected && i !== q.answer && " ✗"}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div ref={revealRef} style={{ marginTop: 18, padding: "14px 16px", background: "rgba(201,133,63,0.08)", borderRight: "3px solid #c9853f", borderRadius: 8, animation: "fadeUp .4s" }}>
                <div style={{ ...S.display, fontSize: 14, color: "#a8763f", marginBottom: 4 }}>
                  {selected === q.answer ? "أحسنت يا صاحب الفطنة! وتقول الحكاية:" : selected === -1 ? "انقضى الوقت يا صاحبي! والحكاية تقول:" : "لا بأس.. فاسمع الحكاية:"}
                </div>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.9, color: "#e5d9bf" }}>{q.story}</p>
                <button className="hakawati-btn" onClick={next} style={{ ...S.btn, padding: "10px 26px", fontSize: 16, marginTop: 14 }}>
                  {lives <= 0 || idx + 1 >= effectiveTotal ? "أنهِ المجلس" : "الليلة التالية ←"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {screen === "end" && (
        <div style={{ ...S.card, textAlign: "center", marginTop: 26, animation: "fadeUp .7s" }}>
          <div style={{ fontSize: 15, color: "#a8763f", marginBottom: 8 }}>وهنا انفضّ المجلس..</div>
          <div style={{ fontSize: 52, margin: "6px 0" }}>{ratio >= 0.8 ? "🌕" : ratio >= 0.5 ? "🌗" : "🌑"}</div>
          <div style={{ fontSize: 17, color: "#d9c9b0" }}>حفظت من الحكايات</div>
          <div style={{ ...S.display, fontSize: 44, color: "#c9853f", margin: "2px 0 14px" }}>{score} / {effectiveTotal}</div>
          <div style={{ width: 90, height: 1, background: "linear-gradient(90deg, transparent, #a8763f, transparent)", margin: "0 auto 14px" }} />
          <div style={{ fontSize: 15, color: "#a8763f" }}>لقبك في المجلس:</div>
          <h2 style={{ ...S.display, fontSize: 32, color: "#f2e9da", margin: "4px 0 6px" }}>{rank.title}</h2>
          <p style={{ fontSize: 15.5, color: "#b39d7c", margin: "0 0 24px" }}>{rank.desc}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="hakawati-btn" style={S.btn} onClick={() => startGame(selectedCategory)}>مجلس جديد 🏮</button>
            <button
              onClick={() => setScreen("category")}
              style={{ background: "none", border: "1.5px solid rgba(168,99,46,0.35)", color: "#a8763f", borderRadius: 12, padding: "14px 24px", fontSize: 15, cursor: "pointer", fontFamily: "'Tajawal', sans-serif" }}
            >
              تغيير الديوان
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HakawatiGamePage;
