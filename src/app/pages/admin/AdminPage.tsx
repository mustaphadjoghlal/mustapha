import { useState, useEffect, useRef, useCallback } from "react";
import { db, auth, storage } from "../../../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { Trash2, Pencil, Plus, LogOut, Save, X, Upload, Image, Loader,
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link, Minus } from "lucide-react";

// ============================================================
// Rich Text Editor Component
// ============================================================
function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Initialize content once
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value || "";
      isInitialized.current = true;
    }
  }, []);

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const insertHTML = useCallback((html: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const addLink = useCallback(() => {
    const url = prompt("أدخل الرابط:");
    if (url) exec("createLink", url);
  }, [exec]);

  const toolbarBtnBase = "p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all";
  const Divider = () => <div className="w-px h-6 bg-gray-700 mx-1" />;

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-900 border-b border-gray-700">
        {/* Text style */}
        <button type="button" onClick={() => exec("bold")} className={toolbarBtnBase} title="غامق"><Bold size={15} /></button>
        <button type="button" onClick={() => exec("italic")} className={toolbarBtnBase} title="مائل"><Italic size={15} /></button>
        <Divider />
        {/* Headings */}
        <button type="button" onClick={() => exec("formatBlock", "<h2>")} className={`${toolbarBtnBase} text-xs font-bold px-2`} title="عنوان رئيسي">H2</button>
        <button type="button" onClick={() => exec("formatBlock", "<h3>")} className={`${toolbarBtnBase} text-xs font-bold px-2`} title="عنوان فرعي">H3</button>
        <button type="button" onClick={() => exec("formatBlock", "<p>")} className={`${toolbarBtnBase} text-xs px-2`} title="نص عادي">P</button>
        <Divider />
        {/* Lists */}
        <button type="button" onClick={() => exec("insertUnorderedList")} className={toolbarBtnBase} title="قائمة نقطية"><List size={15} /></button>
        <button type="button" onClick={() => exec("insertOrderedList")} className={toolbarBtnBase} title="قائمة مرقمة"><ListOrdered size={15} /></button>
        <Divider />
        {/* Quote & Link */}
        <button type="button" onClick={() => exec("formatBlock", "<blockquote>")} className={toolbarBtnBase} title="اقتباس"><Quote size={15} /></button>
        <button type="button" onClick={addLink} className={toolbarBtnBase} title="رابط"><Link size={15} /></button>
        <Divider />
        {/* Font size */}
        <button type="button" onClick={() => exec("fontSize", "4")} className={`${toolbarBtnBase} text-xs px-2`} title="خط كبير">A+</button>
        <button type="button" onClick={() => exec("fontSize", "3")} className={`${toolbarBtnBase} text-xs px-2`} title="خط عادي">A</button>
        <Divider />
        {/* Clear */}
        <button type="button" onClick={() => exec("removeFormat")} className={`${toolbarBtnBase} text-red-400 text-xs px-2`} title="إزالة التنسيق">
          <Minus size={15} />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        dir="rtl"
        onInput={handleInput}
        className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 bg-gray-800 text-gray-200 text-sm leading-relaxed focus:outline-none"
        style={{
          fontFamily: "'Segoe UI', Tahoma, sans-serif",
          fontSize: "0.95rem",
          lineHeight: "1.8",
        }}
      />

      {/* CSS for editor content */}
      <style>{`
        [contenteditable] h2 { font-size:1.3rem; font-weight:800; color:#fff; margin:1rem 0 0.5rem; border-bottom:2px solid #3b82f6; padding-bottom:0.25rem; }
        [contenteditable] h3 { font-size:1.1rem; font-weight:700; color:#e5e7eb; margin:0.8rem 0 0.4rem; }
        [contenteditable] p  { margin-bottom:0.8rem; }
        [contenteditable] strong { font-weight:700; color:#fff; }
        [contenteditable] ul { list-style:disc; padding-right:1.5rem; margin:0.5rem 0; }
        [contenteditable] ol { list-style:decimal; padding-right:1.5rem; margin:0.5rem 0; }
        [contenteditable] li { margin-bottom:0.3rem; }
        [contenteditable] blockquote { border-right:3px solid #3b82f6; padding-right:1rem; color:#9ca3af; font-style:italic; margin:0.8rem 0; }
        [contenteditable] a  { color:#60a5fa; }
      `}</style>
    </div>
  );
}

// ============================================================
// Existing components (unchanged)
// ============================================================
interface Work {
  id: string; title: string; description: string; coverImage: string; images: string[];
  altText: string; soundcloudUrl: string; audioUrl?: string; category: "design" | "photography" | "voice";
}
interface Experience { id: string; period: string; title: string; location: string; tasks: string; }
interface MediaOutput {
  id: string; title: string; channel: string;
  type: "تلفزيون" | "إذاعة" | "صحافة" | "بودكاست" | "يوتيوب" | "أخرى";
  date: string; description: string; url: string; coverImage?: string;
}
interface Article {
  id: string; title: string; content: string; coverImage: string;
  coverAlt: string; date: string; tags: string[]; category: string;
}
interface Client { id: string; name: string; logoUrl: string; logoAlt: string; }
interface Course { id: string; title: string; description: string; image: string; duration: string; students: string; level: string; modules: string; email: string; }
interface AboutImage { url: string; alt: string; }
interface SiteInfo {
  id: string; heroName: string; heroDescription: string; profileImageUrl: string;
  aboutText: string; aboutBio: string; aboutImages: AboutImage[];
  email: string; phone: string; footerDescription: string;
  linkedinUrl: string; twitterUrl: string; instagramUrl: string;
}

function SingleImageUploader({ url, onChange, folder = "images", label = "رفع صورة", rounded = false }: {
  url: string; onChange: (url: string) => void; folder?: string; label?: string; rounded?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleFile = async (file: File) => {
    setUploading(true);
    const task = uploadBytesResumable(ref(storage, `${folder}/${Date.now()}_${file.name}`), file);
    task.on("state_changed", (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)), console.error,
      async () => { onChange(await getDownloadURL(task.snapshot.ref)); setUploading(false); setProgress(0); });
  };
  return (
    <div className="flex gap-3 items-center">
      {url && <img src={url} alt="" className={`w-16 h-16 object-cover border-2 border-gray-700 ${rounded ? "rounded-full" : "rounded-lg"}`} />}
      <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer transition-all">
        {uploading ? <div className="space-y-1"><Loader size={16} className="animate-spin mx-auto text-blue-400" /><p className="text-gray-400 text-xs">{progress}%</p></div>
          : <div className="flex items-center justify-center gap-2 text-gray-400 text-sm"><Upload size={14} /><span>{label}</span></div>}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
    </div>
  );
}

function AudioUploader({ url, onChange, onFileName, folder = "audio", label = "رفع ملف صوتي أو فيديو" }: {
  url: string; onChange: (url: string) => void; onFileName?: (name: string) => void; folder?: string; label?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const handleFile = async (file: File) => {
    setUploading(true);
    if (onFileName) onFileName(file.name.replace(/\.[^/.]+$/, ""));
    setStatus("جاري الرفع...");
    const task = uploadBytesResumable(ref(storage, `${folder}/${Date.now()}_${file.name}`), file);
    task.on("state_changed",
      (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      (err) => { console.error(err); setStatus("فشل الرفع"); setUploading(false); },
      async () => { onChange(await getDownloadURL(task.snapshot.ref)); setUploading(false); setProgress(0); setStatus(""); }
    );
  };
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-3 items-center">
        {url && <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-green-400 truncate">✓ ملف صوتي مرفوع</div>}
        <div onClick={() => !uploading && fileInputRef.current?.click()} className={`flex-1 border-2 border-dashed ${uploading ? 'border-purple-500/50 cursor-not-allowed' : 'border-gray-600 hover:border-purple-500 cursor-pointer'} rounded-xl p-3 text-center transition-all`}>
          {uploading ? (<div className="space-y-1"><Loader size={16} className="animate-spin mx-auto text-purple-400" /><p className="text-gray-400 text-xs">{progress}%</p></div>)
            : (<div className="flex items-center justify-center gap-2 text-gray-400 text-sm"><Upload size={14} /><span>{label}</span></div>)}
          <input ref={fileInputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      </div>
      {status && <p className="text-xs text-purple-400 text-center">{status}</p>}
    </div>
  );
}

function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploadFile = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `works/${Date.now()}_${file.name}`);
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.on("state_changed", (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)), reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref)));
    });
  };
  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try { const urls: string[] = []; for (const f of Array.from(files)) urls.push(await uploadFile(f)); onChange([...images.filter(img => img.trim()), ...urls]); }
    catch (e) { console.error(e); }
    setUploading(false); setProgress(0);
  };
  const removeImage = async (url: string) => {
    try { await deleteObject(ref(storage, url)); onChange(images.filter(img => img !== url)); }
    catch (e) { console.error(e); onChange(images.filter(img => img !== url)); }
  };
  return (
    <div className="space-y-4">
      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-all">
        {uploading ? <div className="space-y-2"><Loader size={24} className="animate-spin mx-auto text-blue-500" /><p className="text-gray-400 text-sm">{progress}%</p></div>
          : <div className="space-y-2 text-gray-400"><Image size={32} className="mx-auto opacity-50" /><p className="text-sm">اسحب الصور هنا أو انقر للرفع</p></div>}
        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {images.filter(img => img.trim()).map((img, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-800">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeImage(img)} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorksList({ works, category, saving, editingWork, setEditingWork, onSave, onDelete, showAdd, setShowAdd, newWork, setNewWork, onAdd, sc }: any) {
  const filtered = works.filter((w: Work) => w.category === category);
  const isVoice = category === "voice";
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-400 text-sm">{filtered.length} عمل</span>
        <button onClick={() => { setNewWork({ title: "", description: "", coverImage: "", images: [], altText: "", soundcloudUrl: "", category }); setShowAdd(true); }} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-700 transition-all"><Plus size={16} /> إضافة عمل</button>
      </div>
      {showAdd && newWork.category === category && (
        <div className="bg-gray-900 border border-blue-800 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-bold text-blue-400">إضافة عمل جديد</h3><button onClick={() => setShowAdd(false)}><X size={18} className="text-gray-400" /></button></div>
          <div className="grid md:grid-cols-2 gap-4">
            <input value={newWork.title} onChange={(e) => setNewWork({ ...newWork, title: e.target.value })} placeholder="عنوان العمل" className={sc} />
            <input value={newWork.altText} onChange={(e) => setNewWork({ ...newWork, altText: e.target.value })} placeholder="Alt text للـ SEO" className={sc} />
            {isVoice && <input value={newWork.soundcloudUrl} onChange={(e) => setNewWork({ ...newWork, soundcloudUrl: e.target.value })} placeholder="رابط SoundCloud (اختياري)" className={`${sc} md:col-span-2`} />}
            <textarea value={newWork.description} onChange={(e) => setNewWork({ ...newWork, description: e.target.value })} placeholder="وصف العمل" rows={2} className={`${sc} resize-none md:col-span-2`} />
          </div>
          <div className="space-y-2">
            <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف</p>
            <SingleImageUploader url={newWork.coverImage || ""} onChange={(url) => setNewWork(prev => ({ ...prev, coverImage: url }))} folder="works" label="رفع صورة الغلاف" />
          </div>
          {isVoice && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-semibold">🎵 ملف صوتي</p>
              <AudioUploader url={newWork.audioUrl || ""} onChange={(url) => setNewWork(prev => ({ ...prev, audioUrl: url }))} onFileName={(name) => setNewWork(prev => ({ ...prev, title: prev.title || name }))} folder="works/audio" label="رفع ملف صوتي" />
            </div>
          )}
          {!isVoice && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-semibold">📸 صور المحتوى</p>
              <ImageUploader images={newWork.images || []} onChange={(imgs: string[]) => setNewWork(prev => ({ ...prev, images: imgs }))} />
            </div>
          )}
          <button onClick={onAdd} disabled={saving} className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"><Plus size={16} /> {saving ? "جارٍ الإضافة..." : "إضافة"}</button>
        </div>
      )}
      <div className="space-y-4">
        {filtered.length === 0 && <div className="text-center text-gray-500 py-12 border border-dashed border-gray-800 rounded-xl">لا توجد أعمال بعد</div>}
        {filtered.map((work: Work) => (
          <div key={work.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            {editingWork?.id === work.id ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={editingWork.title} onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })} className={sc} />
                  <input value={editingWork.altText} onChange={(e) => setEditingWork({ ...editingWork, altText: e.target.value })} placeholder="Alt text" className={sc} />
                  {isVoice && <input value={editingWork.soundcloudUrl || ""} onChange={(e) => setEditingWork({ ...editingWork, soundcloudUrl: e.target.value })} placeholder="رابط SoundCloud" className={`${sc} md:col-span-2`} />}
                  <textarea value={editingWork.description} onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })} rows={2} className={`${sc} resize-none md:col-span-2`} />
                </div>
                <SingleImageUploader url={editingWork.coverImage || ""} onChange={(url) => setEditingWork(prev => prev ? ({ ...prev, coverImage: url }) : null)} folder="works" label="رفع صورة الغلاف" />
                {isVoice && <AudioUploader url={editingWork.audioUrl || ""} onChange={(url) => setEditingWork(prev => prev ? ({ ...prev, audioUrl: url }) : null)} onFileName={(name) => setEditingWork(prev => prev ? ({ ...prev, title: prev.title || name }) : null)} folder="works/audio" label="تغيير الملف الصوتي" />}
                {!isVoice && <ImageUploader images={editingWork.images || []} onChange={(imgs: string[]) => setEditingWork(prev => prev ? ({ ...prev, images: imgs }) : null)} />}
                <div className="flex gap-3">
                  <button onClick={onSave} disabled={saving} className="flex items-center gap-2 bg-green-600 px-5 py-2 rounded-lg font-semibold hover:bg-green-700"><Save size={16} /> حفظ</button>
                  <button onClick={() => setEditingWork(null)} className="flex items-center gap-2 bg-gray-700 px-5 py-2 rounded-lg hover:bg-gray-600"><X size={16} /> إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {work.coverImage ? <img src={work.coverImage} alt={work.altText} className="w-14 h-14 rounded-lg object-cover border border-gray-700 flex-shrink-0" /> : isVoice ? <div className="w-14 h-14 rounded-lg border border-gray-700 flex-shrink-0 bg-pink-900/20 flex items-center justify-center">🎙️</div> : null}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{work.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{work.description}</p>
                  {work.images?.length > 0 && <span className="text-xs text-gray-500">{work.images.length} صور</span>}
                  {(work.soundcloudUrl || work.audioUrl) && <span className="text-xs text-orange-400 mr-2">صوت ✓</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingWork(work)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg"><Pencil size={16} /></button>
                  <button onClick={() => onDelete(work.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Articles Section with Rich Text Editor
// ============================================================
function ArticlesSection({ articles, saving, sc, onAdd, onSave, onDelete }: {
  articles: Article[]; saving: boolean; sc: string;
  onAdd: (a: Partial<Article>) => Promise<void>;
  onSave: (a: Article) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: "", content: "", coverImage: "", coverAlt: "",
    date: new Date().toISOString().split("T")[0], tags: [], category: ""
  });

  const handleAdd = async () => {
    await onAdd(newArticle);
    setShowAdd(false);
    setNewArticle({ title: "", content: "", coverImage: "", coverAlt: "", date: new Date().toISOString().split("T")[0], tags: [], category: "" });
  };

  const handleSave = async () => {
    if (!editingArticle) return;
    await onSave(editingArticle);
    setEditingArticle(null);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">المقالات ({articles.length})</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2 rounded-lg font-semibold text-sm">
          <Plus size={16} /> إضافة مقال
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-gray-800 border border-orange-700 rounded-xl p-5 mb-6 space-y-4">
          <div className="flex justify-between">
            <h3 className="text-orange-400 font-bold">مقال جديد</h3>
            <button onClick={() => setShowAdd(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} placeholder="عنوان المقال" className={sc} />
            <input value={newArticle.category} onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })} placeholder="الفئة (مثال: تعليق صوتي)" className={sc} />
            <input value={newArticle.date} onChange={(e) => setNewArticle({ ...newArticle, date: e.target.value })} type="date" className={sc} />
            <input value={newArticle.coverAlt} onChange={(e) => setNewArticle({ ...newArticle, coverAlt: e.target.value })} placeholder="نص بديل للصورة" className={sc} />
            <input
              value={(newArticle.tags || []).join(", ")}
              onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
              placeholder="الوسوم (مفصولة بفاصلة)"
              className={`${sc} md:col-span-2`}
            />
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <p className="text-gray-400 text-sm font-semibold">✍️ محتوى المقال</p>
            <RichTextEditor
              value={newArticle.content || ""}
              onChange={(html) => setNewArticle(prev => ({ ...prev, content: html }))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف</p>
            <SingleImageUploader url={newArticle.coverImage || ""} onChange={(url) => setNewArticle(prev => ({ ...prev, coverImage: url }))} folder="articles" label="رفع صورة الغلاف" />
          </div>

          <button onClick={handleAdd} disabled={saving} className="flex items-center gap-2 bg-orange-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700">
            <Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}
          </button>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-3">
        {articles.length === 0 && <p className="text-gray-500 text-center py-8">لا توجد مقالات</p>}
        {articles.map((article) => (
          <div key={article.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            {editingArticle?.id === article.id ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={editingArticle.title} onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })} className={sc} />
                  <input value={editingArticle.category} onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })} className={sc} />
                  <input value={editingArticle.date} onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })} type="date" className={sc} />
                  <input
                    value={(editingArticle.tags || []).join(", ")}
                    onChange={(e) => setEditingArticle({ ...editingArticle, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                    placeholder="الوسوم"
                    className={sc}
                  />
                </div>

                {/* Rich Text Editor for editing */}
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-semibold">✍️ محتوى المقال</p>
                  <RichTextEditor
                    value={editingArticle.content}
                    onChange={(html) => setEditingArticle(prev => prev ? ({ ...prev, content: html }) : null)}
                  />
                </div>

                <SingleImageUploader url={editingArticle.coverImage} onChange={(url) => setEditingArticle(prev => prev ? ({ ...prev, coverImage: url }) : null)} folder="articles" label="تغيير الغلاف" />

                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 bg-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save size={14} /> حفظ</button>
                  <button onClick={() => setEditingArticle(null)} className="flex items-center gap-1 bg-gray-600 px-4 py-1.5 rounded-lg text-sm"><X size={14} /> إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                {article.coverImage && <img src={article.coverImage} alt={article.title} className="w-16 h-16 rounded-lg object-cover border border-gray-600 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{article.title}</p>
                  <p className="text-gray-400 text-xs">{article.date} — {article.category}</p>
                  {article.tags?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {article.tags.map((tag, i) => <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{tag}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingArticle(article)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil size={14} /></button>
                  <button onClick={() => onDelete(article.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main AdminPage
// ============================================================
export function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("works");
  const [works, setWorks] = useState<Work[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [mediaOutputs, setMediaOutputs] = useState<MediaOutput[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [saving, setSaving] = useState(false);

  const [newWork, setNewWork] = useState<Partial<Work>>({ title: "", description: "", coverImage: "", images: [], altText: "", soundcloudUrl: "", category: "design" });
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [newExp, setNewExp] = useState<Partial<Experience>>({ title: "", period: "", location: "", tasks: "" });
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [showAddExp, setShowAddExp] = useState(false);
  const [newMedia, setNewMedia] = useState<Partial<MediaOutput>>({ title: "", channel: "", type: "تلفزيون", date: "", description: "", url: "" });
  const [editingMedia, setEditingMedia] = useState<MediaOutput | null>(null);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({ title: "", description: "", image: "", duration: "", students: "", level: "", modules: "", email: "" });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);

  const sc = "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all text-sm";
  const mediaTypes = ["تلفزيون", "إذاعة", "صحافة", "بودكاست", "يوتيوب", "أخرى"];

  useEffect(() => { const u = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }); return u; }, []);
  useEffect(() => {
    if (!user) return;
    const subs = [
      onSnapshot(collection(db, "works"), (s) => setWorks(s.docs.map(d => ({ id: d.id, ...d.data() } as Work)))),
      onSnapshot(collection(db, "experiences"), (s) => setExperiences(s.docs.map(d => ({ id: d.id, ...d.data() } as Experience)))),
      onSnapshot(collection(db, "mediaOutputs"), (s) => setMediaOutputs(s.docs.map(d => ({ id: d.id, ...d.data() } as MediaOutput)))),
      onSnapshot(collection(db, "articles"), (s) => setArticles(s.docs.map(d => ({ id: d.id, ...d.data() } as Article)))),
      onSnapshot(collection(db, "clients"), (s) => setClients(s.docs.map(d => ({ id: d.id, ...d.data() } as Client)))),
      onSnapshot(collection(db, "courses"), (s) => setCourses(s.docs.map(d => ({ id: d.id, ...d.data() } as Course)))),
      onSnapshot(collection(db, "siteInfo"), (s) => { if (!s.empty) setSiteInfo({ id: s.docs[0].id, ...s.docs[0].data() } as SiteInfo); }),
    ];
    return () => subs.forEach(u => u());
  }, [user]);

  const addWork = async () => { setSaving(true); try { await addDoc(collection(db, "works"), newWork); setShowAddWork(false); setNewWork({ title: "", description: "", coverImage: "", images: [], altText: "", soundcloudUrl: "", category: newWork.category }); } catch (e) { console.error(e); } setSaving(false); };
  const saveWork = async () => { if (!editingWork) return; setSaving(true); try { await updateDoc(doc(db, "works", editingWork.id), editingWork); setEditingWork(null); } catch (e) { console.error(e); } setSaving(false); };
  const deleteWork = async (id: string) => { if (confirm("هل أنت متأكد؟")) await deleteDoc(doc(db, "works", id)); };
  const addExp = async () => { setSaving(true); try { await addDoc(collection(db, "experiences"), newExp); setShowAddExp(false); setNewExp({ title: "", period: "", location: "", tasks: "" }); } catch (e) { console.error(e); } setSaving(false); };
  const saveExp = async () => { if (!editingExp) return; setSaving(true); try { await updateDoc(doc(db, "experiences", editingExp.id), editingExp); setEditingExp(null); } catch (e) { console.error(e); } setSaving(false); };
  const deleteExp = async (id: string) => { if (confirm("هل أنت متأكد؟")) await deleteDoc(doc(db, "experiences", id)); };
  const addMedia = async () => { setSaving(true); try { await addDoc(collection(db, "mediaOutputs"), newMedia); setShowAddMedia(false); setNewMedia({ title: "", channel: "", type: "تلفزيون", date: "", description: "", url: "" }); } catch (e) { console.error(e); } setSaving(false); };
  const saveMedia = async () => { if (!editingMedia) return; setSaving(true); try { await updateDoc(doc(db, "mediaOutputs", editingMedia.id), editingMedia); setEditingMedia(null); } catch (e) { console.error(e); } setSaving(false); };
  const deleteMedia = async (id: string) => { if (confirm("هل أنت متأكد؟")) await deleteDoc(doc(db, "mediaOutputs", id)); };
  const addArticle = async (a: Partial<Article>) => { setSaving(true); try { await addDoc(collection(db, "articles"), a); } catch (e) { console.error(e); } setSaving(false); };
  const saveArticle = async (a: Article) => { setSaving(true); try { await updateDoc(doc(db, "articles", a.id), a); } catch (e) { console.error(e); } setSaving(false); };
  const deleteArticle = async (id: string) => { if (confirm("هل أنت متأكد؟")) await deleteDoc(doc(db, "articles", id)); };
  const addCourse = async () => { setSaving(true); try { await addDoc(collection(db, "courses"), newCourse); setShowAddCourse(false); setNewCourse({ title: "", description: "", image: "", duration: "", students: "", level: "", modules: "", email: "" }); } catch (e) { console.error(e); } setSaving(false); };
  const saveCourse = async () => { if (!editingCourse) return; setSaving(true); try { await updateDoc(doc(db, "courses", editingCourse.id), editingCourse); setEditingCourse(null); } catch (e) { console.error(e); } setSaving(false); };
  const deleteCourse = async (id: string) => { if (confirm("هل أنت متأكد؟")) await deleteDoc(doc(db, "courses", id)); };
  const saveInfo = async () => { if (!siteInfo) return; setSaving(true); try { await updateDoc(doc(db, "siteInfo", siteInfo.id), siteInfo as any); alert("تم الحفظ بنجاح"); } catch (e) { console.error(e); } setSaving(false); };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader className="animate-spin text-blue-500" /></div>;
  if (!user) return <LoginForm onLogin={signInWithEmailAndPassword} />;

  const tabs = [
    { id: "works", label: "الأعمال" }, { id: "experience", label: "الخبرات" },
    { id: "media", label: "المخرجات" }, { id: "articles", label: "المقالات" },
    { id: "courses", label: "الدورات" }, { id: "info", label: "الإعدادات" },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20" dir="rtl">
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">M</div>
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-gray-800 text-blue-400" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}>{tab.label}</button>
              ))}
            </nav>
          </div>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"><LogOut size={16} /> خروج</button>
        </div>
        <div className="md:hidden flex overflow-x-auto border-t border-gray-800 px-2 py-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2 text-sm whitespace-nowrap ${activeTab === tab.id ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">

        {activeTab === "works" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex flex-wrap items-center gap-2 mb-8 bg-black/40 p-1.5 rounded-xl w-fit">
              {[{ id: "design", label: "التصميم الجرافيكي" }, { id: "voice", label: "التعليق الصوتي" }, { id: "photography", label: "التصوير الفوتوغرافي" }].map((cat) => (
                <button key={cat.id} onClick={() => setNewWork({ ...newWork, category: cat.id as any })} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${newWork.category === cat.id ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>{cat.label}</button>
              ))}
            </div>
            <WorksList works={works} category={newWork.category || "design"} saving={saving} editingWork={editingWork} setEditingWork={setEditingWork} onSave={saveWork} onDelete={deleteWork} showAdd={showAddWork} setShowAdd={setShowAddWork} newWork={newWork} setNewWork={setNewWork} onAdd={addWork} sc={sc} />
          </div>
        )}

        {activeTab === "experience" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">الخبرات ({experiences.length})</h2>
              <button onClick={() => setShowAddExp(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 rounded-lg font-semibold text-sm"><Plus size={16} /> إضافة خبرة</button>
            </div>
            {showAddExp && (
              <div className="bg-gray-800 border border-blue-700 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between"><h3 className="text-blue-400 font-bold">تجربة جديدة</h3><button onClick={() => setShowAddExp(false)}><X size={16} className="text-gray-400" /></button></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newExp.title} onChange={(e) => setNewExp({ ...newExp, title: e.target.value })} placeholder="المسمى الوظيفي" className={sc} />
                  <input value={newExp.period} onChange={(e) => setNewExp({ ...newExp, period: e.target.value })} placeholder="الفترة" className={sc} />
                  <input value={newExp.location} onChange={(e) => setNewExp({ ...newExp, location: e.target.value })} placeholder="الموقع" className={sc} />
                </div>
                <textarea value={newExp.tasks} onChange={(e) => setNewExp({ ...newExp, tasks: e.target.value })} placeholder="المهام" rows={3} className={`${sc} resize-none`} />
                <button onClick={addExp} disabled={saving} className="flex items-center gap-2 bg-blue-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"><Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}</button>
              </div>
            )}
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  {editingExp?.id === exp.id ? (
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input value={editingExp.title} onChange={(e) => setEditingExp({ ...editingExp, title: e.target.value })} className={sc} />
                        <input value={editingExp.period} onChange={(e) => setEditingExp({ ...editingExp, period: e.target.value })} className={sc} />
                        <input value={editingExp.location} onChange={(e) => setEditingExp({ ...editingExp, location: e.target.value })} className={sc} />
                      </div>
                      <textarea value={editingExp.tasks} onChange={(e) => setEditingExp({ ...editingExp, tasks: e.target.value })} rows={3} className={`${sc} resize-none`} />
                      <div className="flex gap-2">
                        <button onClick={saveExp} disabled={saving} className="flex items-center gap-1 bg-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save size={14} /> حفظ</button>
                        <button onClick={() => setEditingExp(null)} className="flex items-center gap-1 bg-gray-600 px-4 py-1.5 rounded-lg text-sm"><X size={14} /> إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="font-bold text-white text-sm">{exp.title}</p><p className="text-blue-400 text-xs">{exp.period} — {exp.location}</p></div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingExp(exp)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil size={14} /></button>
                        <button onClick={() => deleteExp(exp.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">المخرجات الإعلامية ({mediaOutputs.length})</h2>
              <button onClick={() => setShowAddMedia(true)} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-600 px-5 py-2 rounded-lg font-semibold text-sm"><Plus size={16} /> إضافة ظهور</button>
            </div>
            {showAddMedia && (
              <div className="bg-gray-800 border border-pink-700 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between"><h3 className="text-pink-400 font-bold">ظهور إعلامي جديد</h3><button onClick={() => setShowAddMedia(false)}><X size={16} className="text-gray-400" /></button></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newMedia.title} onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })} placeholder="عنوان الظهور" className={sc} />
                  <input value={newMedia.channel} onChange={(e) => setNewMedia({ ...newMedia, channel: e.target.value })} placeholder="اسم القناة" className={sc} />
                  <select value={newMedia.type} onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value as any })} className={sc}>{mediaTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  <input value={newMedia.date} onChange={(e) => setNewMedia({ ...newMedia, date: e.target.value })} placeholder="التاريخ" className={sc} />
                  <input value={newMedia.url} onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })} placeholder="رابط (اختياري)" className={`${sc} md:col-span-2`} />
                  <textarea value={newMedia.description} onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })} placeholder="وصف مختصر" rows={2} className={`${sc} resize-none md:col-span-2`} />
                </div>
                <SingleImageUploader url={newMedia.coverImage || ""} onChange={(url) => setNewMedia({ ...newMedia, coverImage: url })} folder="media-outputs" label="رفع صورة الغلاف" />
                <button onClick={addMedia} disabled={saving} className="flex items-center gap-2 bg-pink-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700"><Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}</button>
              </div>
            )}
            <div className="space-y-3">
              {mediaOutputs.map((media) => (
                <div key={media.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  {editingMedia?.id === media.id ? (
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input value={editingMedia.title} onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })} className={sc} />
                        <input value={editingMedia.channel} onChange={(e) => setEditingMedia({ ...editingMedia, channel: e.target.value })} className={sc} />
                        <select value={editingMedia.type} onChange={(e) => setEditingMedia({ ...editingMedia, type: e.target.value as any })} className={sc}>{mediaTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <input value={editingMedia.date} onChange={(e) => setEditingMedia({ ...editingMedia, date: e.target.value })} className={sc} />
                        <input value={editingMedia.url} onChange={(e) => setEditingMedia({ ...editingMedia, url: e.target.value })} className={`${sc} md:col-span-2`} />
                        <textarea value={editingMedia.description} onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })} rows={2} className={`${sc} resize-none md:col-span-2`} />
                      </div>
                      <SingleImageUploader url={editingMedia.coverImage || ""} onChange={(url) => setEditingMedia({ ...editingMedia, coverImage: url })} folder="media-outputs" label="تغيير الصورة" />
                      <div className="flex gap-2">
                        <button onClick={saveMedia} disabled={saving} className="flex items-center gap-1 bg-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save size={14} /> حفظ</button>
                        <button onClick={() => setEditingMedia(null)} className="flex items-center gap-1 bg-gray-600 px-4 py-1.5 rounded-lg text-sm"><X size={14} /> إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      {media.coverImage && <img src={media.coverImage} alt={media.title} className="w-16 h-16 rounded-lg object-cover border border-gray-600 flex-shrink-0" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900 text-blue-300">{media.type}</span>
                          <span className="text-gray-500 text-xs">{media.date}</span>
                        </div>
                        <p className="font-bold text-white text-sm">{media.title}</p>
                        <p className="text-gray-400 text-xs">{media.channel}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingMedia(media)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil size={14} /></button>
                        <button onClick={() => deleteMedia(media.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "articles" && (
          <ArticlesSection
            articles={articles}
            saving={saving}
            sc={sc}
            onAdd={addArticle}
            onSave={saveArticle}
            onDelete={deleteArticle}
          />
        )}

        {activeTab === "courses" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">الدورات التدريبية ({courses.length})</h2>
              <button onClick={() => setShowAddCourse(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-2 rounded-lg font-semibold text-sm"><Plus size={16} /> إضافة دورة</button>
            </div>
            {showAddCourse && (
              <div className="bg-gray-800 border border-blue-700 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between"><h3 className="text-blue-400 font-bold">دورة جديدة</h3><button onClick={() => setShowAddCourse(false)}><X size={16} className="text-gray-400" /></button></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="عنوان الدورة" className={sc} />
                  <input value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} placeholder="المدة" className={sc} />
                  <input value={newCourse.students} onChange={(e) => setNewCourse({ ...newCourse, students: e.target.value })} placeholder="عدد الطلاب" className={sc} />
                  <input value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })} placeholder="المستوى" className={sc} />
                  <input value={newCourse.email} onChange={(e) => setNewCourse({ ...newCourse, email: e.target.value })} placeholder="بريد التسجيل" className={sc} />
                  <input value={newCourse.modules} onChange={(e) => setNewCourse({ ...newCourse, modules: e.target.value })} placeholder="عدد المحاور" className={sc} />
                </div>
                <textarea value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="وصف الدورة" rows={3} className={`${sc} resize-none`} />
                <SingleImageUploader url={newCourse.image || ""} onChange={(url) => setNewCourse(prev => ({ ...prev, image: url }))} folder="courses" label="رفع صورة" />
                <button onClick={addCourse} disabled={saving} className="flex items-center gap-2 bg-blue-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"><Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}</button>
              </div>
            )}
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  {editingCourse?.id === course.id ? (
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input value={editingCourse.title} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} className={sc} />
                        <input value={editingCourse.duration} onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })} className={sc} />
                        <input value={editingCourse.level} onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })} className={sc} />
                      </div>
                      <textarea value={editingCourse.description} onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })} rows={3} className={`${sc} resize-none`} />
                      <SingleImageUploader url={editingCourse.image} onChange={(url) => setEditingCourse(prev => prev ? ({ ...prev, image: url }) : null)} folder="courses" label="تغيير الصورة" />
                      <div className="flex gap-2">
                        <button onClick={saveCourse} disabled={saving} className="flex items-center gap-1 bg-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save size={14} /> حفظ</button>
                        <button onClick={() => setEditingCourse(null)} className="flex items-center gap-1 bg-gray-600 px-4 py-1.5 rounded-lg text-sm"><X size={14} /> إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      {course.image && <img src={course.image} alt={course.title} className="w-16 h-16 rounded-lg object-cover border border-gray-600 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{course.title}</p>
                        <p className="text-gray-400 text-xs">{course.duration} — {course.level}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingCourse(course)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil size={14} /></button>
                        <button onClick={() => deleteCourse(course.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "info" && siteInfo && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">إعدادات الموقع</h2>
              <button onClick={saveInfo} disabled={saving} className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"><Save size={18} /> {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}</button>
            </div>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-sm text-gray-400">الاسم الظاهر</label><input value={siteInfo.heroName} onChange={(e) => setSiteInfo({ ...siteInfo, heroName: e.target.value })} className={sc} /></div>
                <div className="space-y-2"><label className="text-sm text-gray-400">الوصف الرئيسي</label><input value={siteInfo.heroDescription} onChange={(e) => setSiteInfo({ ...siteInfo, heroDescription: e.target.value })} className={sc} /></div>
                <div className="space-y-2"><label className="text-sm text-gray-400">البريد الإلكتروني</label><input value={siteInfo.email} onChange={(e) => setSiteInfo({ ...siteInfo, email: e.target.value })} className={sc} /></div>
                <div className="space-y-2"><label className="text-sm text-gray-400">رقم الهاتف</label><input value={siteInfo.phone} onChange={(e) => setSiteInfo({ ...siteInfo, phone: e.target.value })} className={sc} /></div>
              </div>
              <div className="space-y-2"><label className="text-sm text-gray-400">نبذة "عني"</label><textarea value={siteInfo.aboutBio} onChange={(e) => setSiteInfo({ ...siteInfo, aboutBio: e.target.value })} rows={4} className={`${sc} resize-none`} /></div>
              <div className="space-y-2"><label className="text-sm text-gray-400">صورة الملف الشخصي</label><SingleImageUploader url={siteInfo.profileImageUrl} onChange={(url) => setSiteInfo({ ...siteInfo, profileImageUrl: url })} folder="profile" rounded /></div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2"><label className="text-sm text-gray-400">LinkedIn</label><input value={siteInfo.linkedinUrl} onChange={(e) => setSiteInfo({ ...siteInfo, linkedinUrl: e.target.value })} className={sc} /></div>
                <div className="space-y-2"><label className="text-sm text-gray-400">Instagram</label><input value={siteInfo.instagramUrl} onChange={(e) => setSiteInfo({ ...siteInfo, instagramUrl: e.target.value })} className={sc} /></div>
                <div className="space-y-2"><label className="text-sm text-gray-400">Twitter/X</label><input value={siteInfo.twitterUrl} onChange={(e) => setSiteInfo({ ...siteInfo, twitterUrl: e.target.value })} className={sc} /></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    setLoading(true); setError("");
    try { await onLogin(auth, email, password); } catch { setError("البريد أو كلمة المرور غير صحيحة"); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center" dir="rtl">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">لوحة التحكم</h1>
        <p className="text-gray-400 text-center mb-8">أدخل بياناتك للدخول</p>
        {error && <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg p-3 mb-6 text-center">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50">
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </div>
      </div>
    </div>
  );
}
