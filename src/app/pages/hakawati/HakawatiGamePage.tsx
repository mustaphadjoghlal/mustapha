import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

// ─── الأنواع ───
export interface HakawatiQuestion {
  id?: string;
  q: string;
  options: string[];
  answer: number;
  story: string;
}

export interface HakawatiSettings {
  total: number;
  time: number;
  lives: number;
}

// ─── بنك أسئلة احتياطي (يُستخدم إن كانت قاعدة البيانات فارغة) ───
export const DEFAULT_QUESTIONS: HakawatiQuestion[] = [
  { q: "من هو القائد الذي لُقّب بـ«سيف الله المسلول»؟", options: ["عمرو بن العاص", "خالد بن الوليد", "سعد بن أبي وقاص", "أبو عبيدة بن الجراح"], answer: 1, story: "لم يُهزم في معركة قط، لا في جاهلية ولا في إسلام. ومات على فراشه، فبكى وقال: فلا نامت أعين الجبناء." },
  { q: "من هي المرأة التي حكمت مصر وهزم جيشها الحملة الصليبية السابعة؟", options: ["شجرة الدر", "الخيزران", "زبيدة بنت جعفر", "ست الملك"], answer: 0, story: "أخفت خبر وفاة زوجها الصالح أيوب وأدارت المعركة بنفسها، حتى أُسر ملك فرنسا لويس التاسع في دار ابن لقمان." },
  { q: "في أي معركة استعاد صلاح الدين الأيوبي زمام القدس؟", options: ["عين جالوت", "اليرموك", "حطين", "الزلاقة"], answer: 2, story: "في تموز 1187 حاصر صلاح الدين الصليبيين عند قرون حطين وقطع عنهم الماء، وبعدها بأشهر دخل القدس دون أن تُسفك الدماء." },
  { q: "من هو السلطان الذي فتح القسطنطينية عام 1453؟", options: ["سليم الأول", "بايزيد الصاعقة", "محمد الفاتح", "سليمان القانوني"], answer: 2, story: "كان عمره 21 عامًا حين نقل السفن برًّا فوق ألواح الزيت في ليلة واحدة، لتصبح القسطنطينية إسطنبول." },
  { q: "من كان أول مؤذن في الإسلام؟", options: ["عبد الله بن أم مكتوم", "بلال بن رباح", "أبو محذورة", "سعد القرظ"], answer: 1, story: "من عبدٍ يُعذَّب تحت صخور مكة وهو يقول «أحدٌ أحد» إلى صوتٍ يعلو فوق الكعبة يوم الفتح." },
  { q: "من هو الخليفة الذي لُقّب بـ«الفاروق»؟", options: ["أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب", "عمر بن الخطاب"], answer: 3, story: "لُقّب بالفاروق لأنه فرّق بين الحق والباطل، وفي عهده فُتحت القدس فدخلها ماشيًا وخادمه على الراحلة." },
  { q: "في أي شهر وقعت غزوة بدر الكبرى؟", options: ["رمضان", "شوال", "محرم", "رجب"], answer: 0, story: "في السابع عشر من رمضان، السنة الثانية للهجرة، ثلاثمئة وبضعة عشر رجلًا غيّروا وجه التاريخ." },
  { q: "من هو القائد الذي هزم المغول في عين جالوت؟", options: ["الظاهر بيبرس", "سيف الدين قطز", "نور الدين زنكي", "المعتصم بالله"], answer: 1, story: "بعد سقوط بغداد ظنّ الناس أن المغول لا يُهزمون، حتى صرخ قطز: «وا إسلاماه!» في سهل عين جالوت عام 1260." },
  { q: "من الذي وحّد المسلمين على مصحف واحد؟", options: ["أبو بكر الصديق", "عمر بن الخطاب", "عثمان بن عفان", "زيد بن ثابت"], answer: 2, story: "جمع أبو بكر الصحف أولًا، ثم نسخ عثمان المصاحف ووزّعها على الأمصار، فسُمّي المصحف العثماني." },
  { q: "من هو الطبيب المسلم صاحب كتاب «القانون في الطب»؟", options: ["الرازي", "ابن النفيس", "ابن سينا", "الزهراوي"], answer: 2, story: "ظل كتابه يُدرَّس في جامعات أوروبا ستة قرون كاملة، ولقّبوه هناك بـ«أمير الأطباء»." },
  { q: "من هو القائد الذي عبر بجيشه إلى الأندلس عام 711م؟", options: ["موسى بن نصير", "طارق بن زياد", "عقبة بن نافع", "عبد الرحمن الغافقي"], answer: 1, story: "عبر المضيق الذي حمل اسمه إلى اليوم: جبل طارق، وبدأت حكاية ثمانية قرون من حضارة الأندلس." },
  { q: "من أسس مدينة القيروان الواقعة في تونس الحالية؟", options: ["طارق بن زياد", "حسان بن النعمان", "عقبة بن نافع", "موسى بن نصير"], answer: 2, story: "أسسها عقبة عام 50هـ لتكون قاعدة المسلمين في إفريقية، ثم وقف على شاطئ الأطلسي قائلًا: «يا رب، لولا هذا البحر لمضيت في البلاد مجاهدًا في سبيلك»." },
  { q: "من هي مؤسِّسة جامع وجامعة القرويين في فاس؟", options: ["فاطمة الفهري", "زينب النفزاوية", "السيدة نفيسة", "رابعة العدوية"], answer: 0, story: "أنفقت ميراثها كله لبناء القرويين عام 859م، وتُعدّ أقدم جامعة في العالم ما تزال تعمل حتى اليوم." },
  { q: "في عهد أي خليفة عباسي بلغ «بيت الحكمة» ببغداد ذروته؟", options: ["المأمون", "المعتصم", "المنصور", "المتوكل"], answer: 0, story: "كان المأمون يزن الكتب المترجمة ذهبًا، فتحوّلت بغداد إلى عاصمة العلم في الأرض كلها." },
  { q: "من هو الرحالة المسلم الذي انطلق من طنجة وجاب العالم ثلاثين عامًا؟", options: ["ابن جبير", "ابن بطوطة", "الإدريسي", "ياقوت الحموي"], answer: 1, story: "خرج للحج وعمره 21 عامًا، فقطع 120 ألف كيلومتر من المغرب إلى الصين، وسمّوه أمير الرحالة المسلمين." },
  { q: "من هو الجرّاح المسلم الملقب بـ«أبو الجراحة الحديثة»؟", options: ["ابن الهيثم", "الكندي", "الزهراوي", "ابن رشد"], answer: 2, story: "ابتكر أكثر من مئتي أداة جراحية في قرطبة، وبعضها ما يزال يُستخدم بشكله الأساسي إلى اليوم." },
  { q: "ما اسم العام الذي وُلد فيه الرسول ﷺ؟", options: ["عام الحزن", "عام الفيل", "عام الوفود", "عام الرمادة"], answer: 1, story: "العام الذي جاء فيه أبرهة بجيشه وفيلته لهدم الكعبة، فأرسل الله عليهم طيرًا أبابيل." },
  { q: "من هو القائد الذي انتصر في معركة الزلاقة بالأندلس؟", options: ["يوسف بن تاشفين", "المعتمد بن عباد", "عبد الرحمن الداخل", "المنصور بن أبي عامر"], answer: 0, story: "جاء أمير المرابطين من صحراء المغرب لنجدة الأندلس عام 1086، فردّ زحف ألفونسو السادس سبعين سنة." },
  { q: "من هو الصحابي الذي لُقّب بـ«حِبر الأمة» وترجمان القرآن؟", options: ["أبو هريرة", "عبد الله بن مسعود", "عبد الله بن عباس", "أُبي بن كعب"], answer: 2, story: "دعا له النبي ﷺ: «اللهم فقّهه في الدين وعلّمه التأويل»، فصار مرجع الأمة في التفسير وهو شاب." },
  { q: "من هو مؤسس الدولة الأموية؟", options: ["عبد الملك بن مروان", "معاوية بن أبي سفيان", "الوليد بن عبد الملك", "مروان بن الحكم"], answer: 1, story: "كان يقول: «لا أضع سيفي حيث يكفيني سوطي، ولا سوطي حيث يكفيني لساني»، فحكم عشرين سنة بالدهاء قبل السيف." },
];

const DEFAULT_SETTINGS: HakawatiSettings = { total: 10, time: 30, lives: 3 };

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

type Screen = "loading" | "start" | "play" | "end";

const HakawatiGamePage: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("loading");
  const [questions, setQuestions] = useState<HakawatiQuestion[]>(DEFAULT_QUESTIONS);
  const [settings, setSettings] = useState<HakawatiSettings>(DEFAULT_SETTINGS);

  const [pool, setPool] = useState<HakawatiQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── جلب البيانات من Firestore ───
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "hakawati_questions"));
        const fetched: HakawatiQuestion[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<HakawatiQuestion, "id">) }));
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

  const effectiveTotal = Math.min(settings.total, questions.length);

  const startGame = () => {
    setPool(shuffle(questions).slice(0, effectiveTotal));
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
          <img src="/hakawati/logo.jpg" alt="الحكواتي" style={{ width: 220, maxWidth: "80%", margin: "0 auto 4px", borderRadius: 10, animation: "glowPulse 4s infinite" }} />
          <div style={{ width: 90, height: 1, background: "linear-gradient(90deg, transparent, #a8763f, transparent)", margin: "10px auto 18px" }} />
          <p style={{ fontSize: 17, lineHeight: 1.9, color: "#d9c9b0", margin: "0 0 6px" }}>
            كان يا ما كان، في قديم الزمان..<br />
            {effectiveTotal} ليالٍ، و{effectiveTotal} حكايات من تاريخ أمّةٍ عظيمة.<br />
            في كل ليلة سؤال، ولك {settings.lives} فوانيس..<br />
            <b style={{ color: "#c9853f" }}>فإن انطفأت كلها، انفضّ المجلس.</b>
          </p>
          <div style={{ fontSize: 14, color: "#8a7660", marginBottom: 22 }}>⏳ لكل سؤال {settings.time} ثانية</div>
          <button className="hakawati-btn" style={S.btn} onClick={startGame}>افتح المجلس 🏮</button>
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
              <div style={{ marginTop: 18, padding: "14px 16px", background: "rgba(201,133,63,0.08)", borderRight: "3px solid #c9853f", borderRadius: 8, animation: "fadeUp .4s" }}>
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
          <button className="hakawati-btn" style={S.btn} onClick={startGame}>مجلس جديد 🏮</button>
        </div>
      )}
    </div>
  );
};

export default HakawatiGamePage;
