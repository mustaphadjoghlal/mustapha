import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { DEFAULT_QUESTIONS } from "./HakawatiGamePage";
import type { HakawatiQuestion, HakawatiSettings } from "./HakawatiGamePage";

const emptyQuestion = (): HakawatiQuestion => ({ q: "", options: ["", "", "", ""], answer: 0, story: "" });
const DEFAULT_SETTINGS: HakawatiSettings = { total: 10, time: 30, lives: 3 };

/**
 * مكوّن إدارة لعبة الحكواتي.
 * يُضاف كتبويب/قسم داخل AdminPage الموجودة — وبذلك يكون محميًا
 * بنفس تسجيل الدخول الحالي للوحة تحكم الموقع.
 */
const HakawatiAdmin: React.FC = () => {
  const [questions, setQuestions] = useState<HakawatiQuestion[]>([]);
  const [settings, setSettings] = useState<HakawatiSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<HakawatiQuestion | null>(null);
  const [busy, setBusy] = useState(false);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "hakawati_questions"));
      setQuestions(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<HakawatiQuestion, "id">) })));
      const s = await getDoc(doc(db, "hakawati_settings", "config"));
      if (s.exists()) setSettings({ ...DEFAULT_SETTINGS, ...(s.data() as Partial<HakawatiSettings>) });
    } catch (e) {
      console.error(e);
      flash("⚠ تعذّر تحميل البيانات");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEditor = (q?: HakawatiQuestion) => {
    if (q && q.id) { setEditId(q.id); setDraft(JSON.parse(JSON.stringify(q))); }
    else { setEditId("new"); setDraft(emptyQuestion()); }
  };

  const saveDraft = async () => {
    if (!draft) return;
    if (!draft.q.trim() || draft.options.some(o => !o.trim())) {
      flash("⚠ أكمل نص السؤال والخيارات الأربعة");
      return;
    }
    setBusy(true);
    try {
      const data = { q: draft.q.trim(), options: draft.options.map(o => o.trim()), answer: draft.answer, story: draft.story.trim() };
      if (editId === "new") {
        await addDoc(collection(db, "hakawati_questions"), data);
      } else if (editId) {
        await updateDoc(doc(db, "hakawati_questions", editId), data);
      }
      flash("✓ حُفظ السؤال");
      setEditId(null); setDraft(null);
      await load();
    } catch (e) {
      console.error(e);
      flash("⚠ تعذّر الحفظ — تحقّق من صلاحيات Firestore");
    }
    setBusy(false);
  };

  const removeQuestion = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("حذف هذا السؤال نهائيًا؟")) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, "hakawati_questions", id));
      flash("✓ حُذف السؤال");
      await load();
    } catch (e) {
      console.error(e);
      flash("⚠ تعذّر الحذف");
    }
    setBusy(false);
  };

  const saveSettings = async () => {
    setBusy(true);
    try {
      await setDoc(doc(db, "hakawati_settings", "config"), settings);
      flash("✓ حُفظت الإعدادات");
    } catch (e) {
      console.error(e);
      flash("⚠ تعذّر حفظ الإعدادات");
    }
    setBusy(false);
  };

  const seedDefaults = async () => {
    if (!window.confirm(`استيراد ${DEFAULT_QUESTIONS.length} سؤالًا افتراضيًا إلى قاعدة البيانات؟`)) return;
    setBusy(true);
    try {
      for (const q of DEFAULT_QUESTIONS) {
        await addDoc(collection(db, "hakawati_questions"), { q: q.q, options: q.options, answer: q.answer, story: q.story });
      }
      flash("✓ استُوردت الأسئلة الافتراضية");
      await load();
    } catch (e) {
      console.error(e);
      flash("⚠ تعذّر الاستيراد");
    }
    setBusy(false);
  };

  const num = (v: string, min: number, max: number) =>
    Math.max(min, Math.min(max, parseInt(v) || min));

  // أنماط بسيطة متوافقة مع أي لوحة تحكم — عدّلها بكلاسات Tailwind الخاصة بموقعك إن أحببت
  const S: Record<string, React.CSSProperties> = {
    wrap: { direction: "rtl", fontFamily: "'Tajawal', sans-serif", maxWidth: 760, color: "#1f2937" },
    box: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fff" },
    input: { width: "100%", boxSizing: "border-box", border: "1px solid #d1d5db", borderRadius: 8, padding: "9px 12px", fontSize: 15, fontFamily: "inherit", direction: "rtl" },
    label: { fontSize: 13, color: "#6b7280", marginBottom: 4, display: "block", fontWeight: 600 },
    btn: { background: "#b08035", color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
    btnGhost: { background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, padding: "7px 16px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
    btnDanger: { background: "#fff", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 8, padding: "7px 16px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  };

  if (loading) return <div style={S.wrap}>جاري تحميل بيانات لعبة الحكواتي...</div>;

  return (
    <div style={S.wrap}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🏮 لعبة الحكواتي</h2>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>إدارة أسئلة وإعدادات اللعبة — التغييرات تظهر مباشرة على الموقع.</p>

      {msg && <div style={{ ...S.box, background: "#fffbeb", borderColor: "#f6cc6d", fontWeight: 600 }}>{msg}</div>}

      {/* الإعدادات */}
      <div style={S.box}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>إعدادات المجلس</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={S.label}>عدد الأسئلة في الجولة</label>
            <input type="number" min={3} max={50} value={settings.total}
              onChange={e => setSettings({ ...settings, total: num(e.target.value, 3, 50) })} style={S.input} />
          </div>
          <div>
            <label style={S.label}>الوقت لكل سؤال (ثانية)</label>
            <input type="number" min={10} max={120} value={settings.time}
              onChange={e => setSettings({ ...settings, time: num(e.target.value, 10, 120) })} style={S.input} />
          </div>
          <div>
            <label style={S.label}>عدد الفوانيس (الأرواح)</label>
            <input type="number" min={1} max={3} value={settings.lives}
              onChange={e => setSettings({ ...settings, lives: num(e.target.value, 1, 3) })} style={S.input} />
          </div>
        </div>
        <button style={{ ...S.btn, marginTop: 12 }} onClick={saveSettings} disabled={busy}>حفظ الإعدادات</button>
      </div>

      {/* محرر سؤال */}
      {draft ? (
        <div style={S.box}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{editId === "new" ? "سؤال جديد" : "تعديل السؤال"}</div>
          <label style={S.label}>نص السؤال</label>
          <textarea rows={2} value={draft.q} onChange={e => setDraft({ ...draft, q: e.target.value })} style={{ ...S.input, resize: "vertical", marginBottom: 10 }} />
          {draft.options.map((opt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <input type="radio" name="hakawati-correct" checked={draft.answer === i} onChange={() => setDraft({ ...draft, answer: i })} title="الإجابة الصحيحة" style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#15803d" }} />
              <input value={opt} placeholder={`الخيار ${i + 1}`} onChange={e => {
                const options = [...draft.options]; options[i] = e.target.value;
                setDraft({ ...draft, options });
              }} style={S.input} />
            </div>
          ))}
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>● حدّد الدائرة بجانب الإجابة الصحيحة</div>
          <label style={S.label}>حكاية الحكواتي (تظهر بعد الإجابة)</label>
          <textarea rows={3} value={draft.story} onChange={e => setDraft({ ...draft, story: e.target.value })} style={{ ...S.input, resize: "vertical", marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <button style={S.btn} onClick={saveDraft} disabled={busy}>{busy ? "جارٍ الحفظ..." : "حفظ السؤال"}</button>
            <button style={S.btnGhost} onClick={() => { setEditId(null); setDraft(null); }}>إلغاء</button>
          </div>
        </div>
      ) : (
        <div style={S.box}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>بنك الأسئلة ({questions.length})</div>
            <button style={S.btn} onClick={() => openEditor()}>+ سؤال جديد</button>
          </div>
          {questions.length === 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 14, color: "#6b7280" }}>
                لا توجد أسئلة في قاعدة البيانات بعد — اللعبة تعرض حاليًا الأسئلة الاحتياطية المدمجة.
              </p>
              <button style={S.btnGhost} onClick={seedDefaults} disabled={busy}>
                {busy ? "جارٍ الاستيراد..." : `⬇ استيراد الأسئلة الافتراضية (${DEFAULT_QUESTIONS.length} سؤالًا)`}
              </button>
            </div>
          )}
          <div style={{ display: "grid", gap: 8 }}>
            {questions.map(qu => (
              <div key={qu.id} style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ flex: 1, fontSize: 14.5, lineHeight: 1.5 }}>{qu.q}</div>
                <button style={S.btnGhost} onClick={() => openEditor(qu)}>تعديل</button>
                <button style={S.btnDanger} onClick={() => removeQuestion(qu.id)}>حذف</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HakawatiAdmin;
