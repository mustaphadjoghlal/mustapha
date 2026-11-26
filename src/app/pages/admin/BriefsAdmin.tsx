import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import { Trash2, Copy, MessageCircle, ChevronDown, ChevronUp, Loader } from "lucide-react";

/** بريف أرسله عميل من صفحة /brief */
interface Brief {
  id: string;
  brand?: string;
  owner?: string;
  phone?: string;
  pack?: string;
  summary?: string;
  status?: "new" | "reviewed" | "archived";
  createdAt?: Timestamp;
}

const STATUS: Record<NonNullable<Brief["status"]>, { label: string; cls: string }> = {
  new: { label: "جديد", cls: "bg-green-500/15 text-green-300 border-green-600/40" },
  reviewed: { label: "تمت المراجعة", cls: "bg-royal-500/15 text-royal-300 border-royal-600/40" },
  archived: { label: "مؤرشف", cls: "bg-gray-500/15 text-gray-400 border-gray-600/40" },
};

const fmtDate = (t?: Timestamp) =>
  t ? t.toDate().toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" }) : "الآن";

export default function BriefsAdmin() {
  const [briefs, setBriefs] = useState<Brief[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | NonNullable<Brief["status"]>>("all");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const q = query(collection(db, "briefs"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (s) => setBriefs(s.docs.map((d) => ({ id: d.id, ...d.data() } as Brief))),
      (e) => { console.error(e); setError("تعذّر تحميل البريفات. تحقّق من قواعد Firestore لمجموعة briefs."); setBriefs([]); }
    );
  }, []);

  const setStatus = (id: string, status: Brief["status"]) => updateDoc(doc(db, "briefs", id), { status });
  const remove = async (id: string) => { if (confirm("حذف هذا البريف نهائيًا؟")) await deleteDoc(doc(db, "briefs", id)); };
  const copy = async (b: Brief) => {
    try { await navigator.clipboard.writeText(b.summary || ""); setCopied(b.id); setTimeout(() => setCopied(""), 2000); } catch { /* ignore */ }
  };

  if (!briefs) return <div className="flex justify-center py-16"><Loader className="animate-spin text-royal-500" /></div>;

  const newCount = briefs.filter((b) => (b.status || "new") === "new").length;
  const shown = briefs.filter((b) => filter === "all" || (b.status || "new") === filter);

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-2xl p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">بريفات العملاء ({briefs.length})</h2>
          <p className="text-gray-400 text-sm mt-1">
            {newCount > 0 ? `${newCount} بريف جديد بانتظار المراجعة` : "لا توجد بريفات جديدة"} ·{" "}
            <a href="/brief" target="_blank" rel="noopener" className="text-royal-400 hover:underline">فتح صفحة البريف</a>
          </p>
        </div>
        <div className="flex flex-wrap gap-1 bg-ink-950/40 p-1.5 rounded-xl">
          {([["all", "الكل"], ["new", "جديد"], ["reviewed", "تمت المراجعة"], ["archived", "مؤرشف"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === id ? "bg-royal-600 text-ink-950" : "text-gray-400 hover:text-white hover:bg-ink-850"}`}>{label}</button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="space-y-3">
        {shown.map((b) => {
          const st = STATUS[b.status || "new"];
          const isOpen = open === b.id;
          const phone = (b.phone || "").replace(/\D/g, "");
          return (
            <div key={b.id} className="bg-ink-850 border border-ink-700 rounded-xl">
              <button onClick={() => setOpen(isOpen ? null : b.id)} className="w-full flex items-center gap-3 p-4 text-right">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-white truncate">{b.brand || "بدون اسم"}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1 truncate">
                    {[b.owner, b.pack, fmtDate(b.createdAt)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {isOpen ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-ink-700 p-4 space-y-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-gray-200 bg-ink-950/50 rounded-lg p-4 max-h-[60vh] overflow-auto">{b.summary}</pre>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={b.status || "new"} onChange={(e) => setStatus(b.id, e.target.value as Brief["status"])}
                      className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-1.5 text-sm text-white">
                      <option value="new">جديد</option>
                      <option value="reviewed">تمت المراجعة</option>
                      <option value="archived">مؤرشف</option>
                    </select>
                    {phone && (
                      <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener"
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-sm"><MessageCircle size={14} /> مراسلة العميل</a>
                    )}
                    <button onClick={() => copy(b)} className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 px-4 py-1.5 rounded-lg text-sm">
                      <Copy size={14} /> {copied === b.id ? "تم النسخ" : "نسخ"}
                    </button>
                    <button onClick={() => remove(b.id)} className="flex items-center gap-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm mr-auto">
                      <Trash2 size={14} /> حذف
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {shown.length === 0 && !error && <p className="text-gray-500 text-sm text-center py-8">لا توجد بريفات هنا بعد</p>}
      </div>
    </div>
  );
}
