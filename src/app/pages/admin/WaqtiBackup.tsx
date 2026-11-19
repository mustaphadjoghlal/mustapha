import { useEffect, useState } from "react";
import { ref, listAll, getDownloadURL, getMetadata, type StorageReference } from "firebase/storage";
import type { User } from "firebase/auth";
import { storage } from "../../../firebase";
import { Loader, Download, RefreshCw, Smartphone, FileText, Image as ImageIcon, CalendarDays } from "lucide-react";

/** Read-only view of the backup that the «وقتي» Android app keeps in this project's Storage (waqti/<uid>/). */

const DATA_LABELS: Record<string, string> = {
  state: "المهام والعملاء والميزانية والإعدادات",
  vault: "فهرس بنك الميديا (المجلدات والألوان والملاحظات)",
  feeds: "التقويمات المستوردة",
  carouselphoto: "صورة قالب الكاروسيل",
  itqanlogo: "شعار قالب إتقان",
};

interface Item { ref: StorageReference; name: string; folder?: string }

async function listDeep(r: StorageReference): Promise<StorageReference[]> {
  const res = await listAll(r);
  const nested = await Promise.all(res.prefixes.map(listDeep));
  return [...res.items, ...nested.flat()];
}

function fmtBytes(n: number) {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} ك.ب`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1048576).toFixed(1)} م.ب`;
  return `${(n / 1073741824).toFixed(2)} غ.ب`;
}

function DownloadButton({ item }: { item: Item }) {
  const [busy, setBusy] = useState(false);
  const open = async () => {
    setBusy(true);
    try { window.open(await getDownloadURL(item.ref), "_blank", "noopener"); } catch (e) { console.error(e); alert("تعذّر فتح الملف"); }
    setBusy(false);
  };
  return (
    <button onClick={open} disabled={busy} className="p-2 text-gray-400 hover:text-royal-400 transition-colors" aria-label="تنزيل">
      {busy ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
    </button>
  );
}

export default function WaqtiBackup({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Item[]>([]);
  const [files, setFiles] = useState<Item[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [size, setSize] = useState<number | null>(null);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true); setError(""); setSize(null);
    try {
      const base = `waqti/${user.uid}`;
      const [d, v, h] = await Promise.all([
        listAll(ref(storage, `${base}/data`)),
        listDeep(ref(storage, `${base}/vault`)),
        listAll(ref(storage, `${base}/history`)),
      ]);
      setData(d.items.map((r) => ({ ref: r, name: r.name.replace(/\.json$/, "") })));
      setFiles(v.map((r) => ({ ref: r, name: r.name, folder: r.parent?.name })).sort((a, b) => a.name.localeCompare(b.name, "ar")));
      setDays(h.prefixes.map((p) => p.name).sort().reverse());
      const st = d.items.find((r) => r.name === "state.json");
      if (st) {
        const m = await getMetadata(st);
        setLastSaved(new Date(m.updated).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" }));
      } else setLastSaved("");
      // total size in the background: one metadata call per file
      Promise.all(v.map((r) => getMetadata(r).then((m) => m.size).catch(() => 0)))
        .then((s) => setSize(s.reduce((a, b) => a + b, 0)));
    } catch (e: any) {
      console.error(e);
      setError(e?.code === "storage/unauthorized" ? "قواعد Storage لا تسمح بقراءة مجلد وقتي. أضف القاعدة الموجودة في WAQTI.md." : "تعذّر تحميل النسخة الاحتياطية.");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user.uid]);

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-royal-500" /></div>;

  const shown = filter ? files.filter((f) => f.name.toLowerCase().includes(filter.toLowerCase())) : files;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ink-850 flex items-center justify-center text-royal-400"><Smartphone size={20} /></div>
          <div>
            <h2 className="text-xl font-bold">نسخة تطبيق «وقتي»</h2>
            <p className="text-sm text-gray-400">{lastSaved ? `آخر حفظ للبيانات: ${lastSaved}` : "لم يرفع التطبيق نسخة بعد. افتح وقتي ← الإعدادات ← موقعي."}</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"><RefreshCw size={16} /> تحديث</button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 text-sm">{error}</div>}

      {!error && (
        <>
          <section className="bg-ink-900 border border-ink-700 rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText size={18} className="text-royal-400" /> البيانات</h3>
            {data.length === 0 ? <p className="text-sm text-gray-500">لا شيء بعد.</p> : (
              <ul className="divide-y divide-ink-700">
                {data.map((it) => (
                  <li key={it.name} className="flex items-center justify-between py-2">
                    <span className="text-sm">{DATA_LABELS[it.name] || (it.name.startsWith("hkphoto-") ? "صورة في قالب الحكواتي" : it.name)}<span className="text-gray-500 mr-2" dir="ltr">{it.name}.json</span></span>
                    <DownloadButton item={it} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-ink-900 border border-ink-700 rounded-xl p-5">
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
              <h3 className="font-semibold flex items-center gap-2"><ImageIcon size={18} className="text-royal-400" /> ملفات بنك الميديا
                <span className="text-sm text-gray-400 font-normal">{files.length} ملف{size != null ? `، ${fmtBytes(size)}` : ""}</span></h3>
              {files.length > 8 && <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="بحث باسم الملف" className="bg-ink-850 border border-ink-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-royal-500" />}
            </div>
            {shown.length === 0 ? <p className="text-sm text-gray-500">لا ملفات.</p> : (
              <ul className="divide-y divide-ink-700 max-h-[480px] overflow-y-auto">
                {shown.map((it) => (
                  <li key={it.ref.fullPath} className="flex items-center justify-between py-2">
                    <span className="text-sm truncate" dir="auto">{it.name}</span>
                    <DownloadButton item={it} />
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-500 mt-3">أسماء المجلدات والألوان والملاحظات محفوظة في «فهرس بنك الميديا»، والتطبيق يعيد ترتيبها عند الاسترجاع.</p>
          </section>

          {days.length > 0 && (
            <section className="bg-ink-900 border border-ink-700 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><CalendarDays size={18} className="text-royal-400" /> نسخ يومية</h3>
              <p className="text-sm text-gray-400 mb-3">نسخة من البيانات في كل يوم نُسخ فيه، للرجوع إلى يوم سابق عند الحاجة.</p>
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (
                  <button key={d} dir="ltr" onClick={async () => {
                    try { window.open(await getDownloadURL(ref(storage, `waqti/${user.uid}/history/${d}/state.json`)), "_blank", "noopener"); } catch { alert("تعذّر فتح النسخة"); }
                  }} className="px-3 py-1.5 rounded-lg bg-ink-850 text-sm text-gray-300 hover:text-white">{d}</button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
