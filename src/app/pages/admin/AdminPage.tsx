import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../../../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { Trash2, Pencil, Plus, LogOut, Save, X, Upload, Image, Loader } from "lucide-react";

interface Work {
  id: string;
  title: string;
  description: string;
  images: string[];
  altText: string;
  soundcloudUrl: string;
  category: "design" | "photography" | "voice";
}

interface SiteInfo {
  id: string;
  heroName: string;
  heroDescription: string;
  profileImageUrl: string;
  aboutText: string;
  email: string;
  phone: string;
  footerDescription: string;
  linkedinUrl: string;
  twitterUrl: string;
  instagramUrl: string;
}

function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `works/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed",
        (snapshot) => setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
        reject,
        async () => { const url = await getDownloadURL(uploadTask.snapshot.ref); resolve(url); }
      );
    });
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) { urls.push(await uploadFile(file)); }
      onChange([...images.filter(img => img.trim()), ...urls]);
    } catch (e) { console.error(e); }
    setUploading(false);
    setProgress(0);
  };

  const removeImage = async (url: string, index: number) => {
    try { if (url.includes("firebasestorage")) await deleteObject(ref(storage, url)); } catch {}
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-gray-400 text-sm flex items-center gap-1"><Image size={14} /> الصور</label>
      <div onDrop={(e) => { e.preventDefault(); e.dataTransfer.files.length && handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all">
        {uploading ? (
          <div className="space-y-2">
            <Loader size={24} className="animate-spin mx-auto text-blue-400" />
            <p className="text-gray-400 text-sm">جارٍ الرفع... {progress}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload size={24} className="mx-auto text-gray-500" />
            <p className="text-gray-400 text-sm">اسحب الصور هنا أو اضغط للاختيار</p>
            <p className="text-gray-600 text-xs">يمكنك اختيار أكثر من صورة في نفس الوقت</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </div>
      {images.filter(img => img.trim()).length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.filter(img => img.trim()).map((img, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-gray-700" />
              <button onClick={() => removeImage(img, i)}
                className="absolute top-1 left-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <details className="text-xs">
        <summary className="text-gray-500 cursor-pointer hover:text-gray-400">أو أضف رابط خارجي يدوياً</summary>
        <div className="mt-2 flex gap-2">
          <input placeholder="https://..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) { onChange([...images.filter(img => img.trim()), val]); (e.target as HTMLInputElement).value = ""; }
              }
            }} />
          <span className="text-gray-500 text-xs self-center">اضغط Enter</span>
        </div>
      </details>
    </div>
  );
}

function ProfileImageUploader({ url, onChange }: { url: string; onChange: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file: File) => {
    setUploading(true);
    const uploadTask = uploadBytesResumable(ref(storage, `profile/${Date.now()}_${file.name}`), file);
    uploadTask.on("state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      console.error,
      async () => { onChange(await getDownloadURL(uploadTask.snapshot.ref)); setUploading(false); setProgress(0); }
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-gray-400 mb-1 text-sm">الصورة الشخصية</label>
      <div className="flex gap-3 items-center">
        {url && <img src={url} alt="profile" className="w-16 h-16 rounded-full object-cover border-2 border-gray-700" />}
        <div onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-all">
          {uploading ? (
            <div className="space-y-1"><Loader size={18} className="animate-spin mx-auto text-blue-400" /><p className="text-gray-400 text-xs">{progress}%</p></div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm"><Upload size={16} /><span>رفع صورة جديدة</span></div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try { await onLogin(email, password); }
    catch { setError("البريد الإلكتروني أو كلمة المرور غير صحيحة"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center" dir="rtl">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">لوحة التحكم</h1>
        <p className="text-gray-400 text-center mb-8">أدخل بياناتك للدخول</p>
        {error && <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg p-3 mb-6 text-center">{error}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50">
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== مكون قائمة أعمال فئة معينة =====
function WorksList({
  works, category, saving,
  editingWork, setEditingWork,
  onSave, onDelete,
  showAdd, setShowAdd,
  newWork, setNewWork, onAdd,
  inputClass, smallInputClass,
}: any) {
  const filtered = works.filter((w: Work) => w.category === category);
  const isVoice = category === "voice";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-400 text-sm">{filtered.length} عمل</span>
        <button onClick={() => { setNewWork({ title: "", description: "", images: [], altText: "", soundcloudUrl: "", category }); setShowAdd(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all text-sm">
          <Plus size={16} /> إضافة عمل
        </button>
      </div>

      {showAdd && newWork.category === category && (
        <div className="bg-gray-900 border border-blue-800 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-blue-400">إضافة عمل جديد</h3>
            <button onClick={() => setShowAdd(false)}><X size={18} className="text-gray-400 hover:text-white" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input value={newWork.title} onChange={(e) => setNewWork({ ...newWork, title: e.target.value })} placeholder="عنوان العمل" className={smallInputClass} />
            <input value={newWork.altText} onChange={(e) => setNewWork({ ...newWork, altText: e.target.value })} placeholder="Alt text للـ SEO" className={smallInputClass} />
            {isVoice && (
              <input value={newWork.soundcloudUrl} onChange={(e) => setNewWork({ ...newWork, soundcloudUrl: e.target.value })} placeholder="رابط SoundCloud" className={`${smallInputClass} md:col-span-2`} />
            )}
            <textarea value={newWork.description} onChange={(e) => setNewWork({ ...newWork, description: e.target.value })} placeholder="وصف العمل" rows={2}
              className={`${smallInputClass} resize-none md:col-span-2`} />
          </div>
          {!isVoice && <ImageUploader images={newWork.images} onChange={(imgs: string[]) => setNewWork({ ...newWork, images: imgs })} />}
          <button onClick={onAdd} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
            <Plus size={16} /> {saving ? "جارٍ الإضافة..." : "إضافة"}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 && <div className="text-center text-gray-500 py-12 border border-dashed border-gray-800 rounded-xl">لا توجد أعمال بعد — أضف أول عمل</div>}
        {filtered.map((work: Work) => (
          <div key={work.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            {editingWork?.id === work.id ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={editingWork.title} onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })} className={smallInputClass} />
                  <input value={editingWork.altText} onChange={(e) => setEditingWork({ ...editingWork, altText: e.target.value })} placeholder="Alt text" className={smallInputClass} />
                  {isVoice && (
                    <input value={editingWork.soundcloudUrl || ""} onChange={(e) => setEditingWork({ ...editingWork, soundcloudUrl: e.target.value })} placeholder="رابط SoundCloud" className={`${smallInputClass} md:col-span-2`} />
                  )}
                  <textarea value={editingWork.description} onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })} rows={2}
                    className={`${smallInputClass} resize-none md:col-span-2`} />
                </div>
                {!isVoice && <ImageUploader images={editingWork.images || []} onChange={(imgs: string[]) => setEditingWork({ ...editingWork, images: imgs })} />}
                <div className="flex gap-3">
                  <button onClick={onSave} disabled={saving} className="flex items-center gap-2 bg-green-600 px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all">
                    <Save size={16} /> حفظ
                  </button>
                  <button onClick={() => setEditingWork(null)} className="flex items-center gap-2 bg-gray-700 px-5 py-2 rounded-lg hover:bg-gray-600 transition-all">
                    <X size={16} /> إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {work.images?.[0] && <img src={work.images[0]} alt={work.altText} className="w-16 h-16 rounded-lg object-cover border border-gray-700 flex-shrink-0" />}
                {isVoice && !work.images?.[0] && (
                  <div className="w-16 h-16 rounded-lg border border-gray-700 flex-shrink-0 bg-pink-900/20 flex items-center justify-center text-pink-400 text-xs">🎙️</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{work.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 truncate">{work.description}</p>
                  {work.images?.length > 1 && <span className="text-xs text-gray-500 mt-1 inline-block">{work.images.length} صور</span>}
                  {work.soundcloudUrl && <span className="text-xs text-orange-400 mt-1 inline-block mr-2">SoundCloud ✓</span>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setEditingWork(work)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all"><Pencil size={18} /></button>
                  <button onClick={() => onDelete(work.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"info" | "footer" | "works">("info");
  const [worksSubTab, setWorksSubTab] = useState<"design" | "photography" | "voice">("design");
  const [works, setWorks] = useState<Work[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const emptyWork = { title: "", description: "", images: [], altText: "", soundcloudUrl: "", category: "design" as Work["category"] };
  const [newWork, setNewWork] = useState(emptyWork);

  const [infoForm, setInfoForm] = useState({
    heroName: "", heroDescription: "", profileImageUrl: "", aboutText: "",
    email: "", phone: "", footerDescription: "", linkedinUrl: "", twitterUrl: "", instagramUrl: "",
  });

  useEffect(() => { const unsub = onAuthStateChanged(auth, (u) => setUser(u)); return unsub; }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "works"), (snap) => {
      setWorks(snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, title: data.title || "", description: data.description || "", images: data.images || (data.imageUrl ? [data.imageUrl] : []), altText: data.altText || "", soundcloudUrl: data.soundcloudUrl || "", category: data.category || "design" } as Work;
      }));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = { id: d.id, ...d.data() } as SiteInfo;
        setSiteInfo(data);
        setInfoForm({ heroName: data.heroName || "", heroDescription: data.heroDescription || "", profileImageUrl: data.profileImageUrl || "", aboutText: data.aboutText || "", email: data.email || "", phone: data.phone || "", footerDescription: data.footerDescription || "", linkedinUrl: data.linkedinUrl || "", twitterUrl: data.twitterUrl || "", instagramUrl: data.instagramUrl || "" });
      }
    });
    return unsub;
  }, [user]);

  const handleLogin = async (email: string, password: string) => { await signInWithEmailAndPassword(auth, email, password); };
  const handleLogout = async () => { await signOut(auth); };
  const showMsg = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const saveInfo = async () => {
    setSaving(true);
    try {
      if (siteInfo) { await updateDoc(doc(db, "siteInfo", siteInfo.id), infoForm); }
      else { await addDoc(collection(db, "siteInfo"), infoForm); }
      showMsg("✅ تم الحفظ بنجاح");
    } catch { showMsg("❌ حدث خطأ أثناء الحفظ"); }
    setSaving(false);
  };

  const addWork = async () => {
    if (!newWork.title) return;
    setSaving(true);
    try { await addDoc(collection(db, "works"), newWork); setNewWork(emptyWork); setShowAddWork(false); showMsg("✅ تمت إضافة العمل"); }
    catch { showMsg("❌ حدث خطأ"); }
    setSaving(false);
  };

  const saveWork = async () => {
    if (!editingWork) return;
    setSaving(true);
    try { const { id, ...data } = editingWork; await updateDoc(doc(db, "works", id), data); setEditingWork(null); showMsg("✅ تم التعديل"); }
    catch { showMsg("❌ حدث خطأ"); }
    setSaving(false);
  };

  const deleteWork = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await deleteDoc(doc(db, "works", id));
    showMsg("✅ تم الحذف");
  };

  if (!user) return <LoginForm onLogin={handleLogin} />;

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500";
  const smallInputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm";

  const saveBtn = (
    <button onClick={saveInfo} disabled={saving}
      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50">
      <Save size={18} /> {saving ? "جارٍ الحفظ..." : "حفظ"}
    </button>
  );

  const subTabs = [
    { key: "design", label: "🎨 التصميم", count: works.filter(w => w.category === "design").length },
    { key: "photography", label: "📷 التصوير", count: works.filter(w => w.category === "photography").length },
    { key: "voice", label: "🎙️ التعليق الصوتي", count: works.filter(w => w.category === "voice").length },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">لوحة التحكم</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={18} /> خروج
        </button>
      </div>

      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-xl shadow-xl z-50">{message}</div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* التبويبات الرئيسية */}
        <div className="flex gap-2 mb-8 bg-gray-900 p-1 rounded-xl w-fit">
          {(["info", "footer", "works"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === tab ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {tab === "info" ? "الصفحة الرئيسية" : tab === "footer" ? "الفوتر" : "الأعمال"}
            </button>
          ))}
        </div>

        {/* الصفحة الرئيسية */}
        {activeTab === "info" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold">الصفحة الرئيسية</h2>
            <ProfileImageUploader url={infoForm.profileImageUrl} onChange={(url) => setInfoForm({ ...infoForm, profileImageUrl: url })} />
            <div>
              <label className="block text-gray-400 mb-2 text-sm">الاسم في الهيرو</label>
              <input value={infoForm.heroName} onChange={(e) => setInfoForm({ ...infoForm, heroName: e.target.value })} className={inputClass} placeholder="مصطفى جغلال" />
            </div>
            <div>
              <label className="block text-gray-400 mb-2 text-sm">وصف الهيرو</label>
              <textarea value={infoForm.heroDescription} onChange={(e) => setInfoForm({ ...infoForm, heroDescription: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="وصف قصير يظهر في الصفحة الرئيسية..." />
            </div>
            <div>
              <label className="block text-gray-400 mb-2 text-sm">نص صفحة عني</label>
              <textarea value={infoForm.aboutText} onChange={(e) => setInfoForm({ ...infoForm, aboutText: e.target.value })} rows={6} className={`${inputClass} resize-none`} placeholder="السيرة الذاتية التفصيلية..." />
            </div>
            {saveBtn}
          </div>
        )}

        {/* الفوتر */}
        {activeTab === "footer" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold">معلومات الفوتر</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">البريد الإلكتروني</label>
                <input value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })} className={inputClass} placeholder="info@example.com" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">رقم الهاتف</label>
                <input value={infoForm.phone} onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })} className={inputClass} placeholder="+968..." />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">رابط LinkedIn</label>
                <input value={infoForm.linkedinUrl} onChange={(e) => setInfoForm({ ...infoForm, linkedinUrl: e.target.value })} className={inputClass} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">رابط Twitter / X</label>
                <input value={infoForm.twitterUrl} onChange={(e) => setInfoForm({ ...infoForm, twitterUrl: e.target.value })} className={inputClass} placeholder="https://twitter.com/..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 mb-2 text-sm">رابط Instagram</label>
                <input value={infoForm.instagramUrl} onChange={(e) => setInfoForm({ ...infoForm, instagramUrl: e.target.value })} className={inputClass} placeholder="https://instagram.com/..." />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2 text-sm">وصف الفوتر</label>
              <textarea value={infoForm.footerDescription} onChange={(e) => setInfoForm({ ...infoForm, footerDescription: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="وصف قصير يظهر في أسفل الموقع..." />
            </div>
            {saveBtn}
          </div>
        )}

        {/* الأعمال */}
        {activeTab === "works" && (
          <div>
            {/* التبويبات الفرعية */}
            <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-xl">
              {subTabs.map((tab) => (
                <button key={tab.key} onClick={() => { setWorksSubTab(tab.key as any); setShowAddWork(false); setEditingWork(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${worksSubTab === tab.key ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}>
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${worksSubTab === tab.key ? "bg-blue-600" : "bg-gray-800"}`}>{tab.count}</span>
                </button>
              ))}
            </div>

            <WorksList
              works={works}
              category={worksSubTab}
              saving={saving}
              editingWork={editingWork}
              setEditingWork={setEditingWork}
              onSave={saveWork}
              onDelete={deleteWork}
              showAdd={showAddWork}
              setShowAdd={setShowAddWork}
              newWork={newWork}
              setNewWork={setNewWork}
              onAdd={addWork}
              inputClass={inputClass}
              smallInputClass={smallInputClass}
            />
          </div>
        )}
      </div>
    </div>
  );
}
