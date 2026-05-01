import { useState, useEffect } from "react";
import { db, auth } from "../../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { Trash2, Pencil, Plus, LogOut, Save, X } from "lucide-react";

// ===== أنواع البيانات =====
interface Work {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
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
}

// ===== مكون تسجيل الدخول =====
function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await onLogin(email, password);
    } catch {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center" dir="rtl">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">لوحة التحكم</h1>
        <p className="text-gray-400 text-center mb-8">أدخل بياناتك للدخول</p>
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg p-3 mb-6 text-center">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== لوحة التحكم الرئيسية =====
export function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"info" | "works">("info");
  const [works, setWorks] = useState<Work[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // حالة العمل الجديد
  const [newWork, setNewWork] = useState({
    title: "",
    description: "",
    imageUrl: "",
    altText: "",
    category: "design" as Work["category"],
  });

  // حالة معلومات الموقع
  const [infoForm, setInfoForm] = useState({
    heroName: "",
    heroDescription: "",
    profileImageUrl: "",
    aboutText: "",
    email: "",
    phone: "",
  });

  // مراقبة حالة تسجيل الدخول
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // جلب الأعمال من Firebase
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "works"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Work));
      setWorks(data);
    });
    return unsub;
  }, [user]);

  // جلب معلومات الموقع
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = { id: d.id, ...d.data() } as SiteInfo;
        setSiteInfo(data);
        setInfoForm({
          heroName: data.heroName || "",
          heroDescription: data.heroDescription || "",
          profileImageUrl: data.profileImageUrl || "",
          aboutText: data.aboutText || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      }
    });
    return unsub;
  }, [user]);

  const handleLogin = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // حفظ معلومات الموقع
  const saveInfo = async () => {
    setSaving(true);
    try {
      if (siteInfo) {
        await updateDoc(doc(db, "siteInfo", siteInfo.id), infoForm);
      } else {
        await addDoc(collection(db, "siteInfo"), infoForm);
      }
      showMsg("✅ تم الحفظ بنجاح");
    } catch {
      showMsg("❌ حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  // إضافة عمل جديد
  const addWork = async () => {
    if (!newWork.title) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "works"), newWork);
      setNewWork({ title: "", description: "", imageUrl: "", altText: "", category: "design" });
      setShowAddWork(false);
      showMsg("✅ تمت إضافة العمل");
    } catch {
      showMsg("❌ حدث خطأ");
    }
    setSaving(false);
  };

  // تعديل عمل
  const saveWork = async () => {
    if (!editingWork) return;
    setSaving(true);
    try {
      const { id, ...data } = editingWork;
      await updateDoc(doc(db, "works", id), data);
      setEditingWork(null);
      showMsg("✅ تم التعديل");
    } catch {
      showMsg("❌ حدث خطأ");
    }
    setSaving(false);
  };

  // حذف عمل
  const deleteWork = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await deleteDoc(doc(db, "works", id));
    showMsg("✅ تم الحذف");
  };

  if (!user) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">لوحة التحكم</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          خروج
        </button>
      </div>

      {/* رسالة النجاح/الخطأ */}
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-xl shadow-xl z-50">
          {message}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "info"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            معلومات الموقع
          </button>
          <button
            onClick={() => setActiveTab("works")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "works"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            الأعمال
          </button>
        </div>

        {/* تبويب معلومات الموقع */}
        {activeTab === "info" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold mb-6">معلومات الموقع</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">الاسم في الهيرو</label>
                <input
                  value={infoForm.heroName}
                  onChange={(e) => setInfoForm({ ...infoForm, heroName: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="مصطفى جغلال"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">رابط الصورة الشخصية</label>
                <input
                  value={infoForm.profileImageUrl}
                  onChange={(e) => setInfoForm({ ...infoForm, profileImageUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">البريد الإلكتروني</label>
                <input
                  value={infoForm.email}
                  onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="info@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">رقم الهاتف</label>
                <input
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="+968..."
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-2 text-sm">وصف الهيرو</label>
              <textarea
                value={infoForm.heroDescription}
                onChange={(e) => setInfoForm({ ...infoForm, heroDescription: e.target.value })}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="وصف قصير يظهر في الصفحة الرئيسية..."
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2 text-sm">نص صفحة عني</label>
              <textarea
                value={infoForm.aboutText}
                onChange={(e) => setInfoForm({ ...infoForm, aboutText: e.target.value })}
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="السيرة الذاتية التفصيلية..."
              />
            </div>

            <button
              onClick={saveInfo}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "جارٍ الحفظ..." : "حفظ المعلومات"}
            </button>
          </div>
        )}

        {/* تبويب الأعمال */}
        {activeTab === "works" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">الأعمال ({works.length})</h2>
              <button
                onClick={() => setShowAddWork(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <Plus size={18} />
                إضافة عمل
              </button>
            </div>

            {/* نموذج إضافة عمل */}
            {showAddWork && (
              <div className="bg-gray-900 border border-blue-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-blue-400">إضافة عمل جديد</h3>
                  <button onClick={() => setShowAddWork(false)}>
                    <X size={18} className="text-gray-400 hover:text-white" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={newWork.title}
                    onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                    placeholder="عنوان العمل"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newWork.category}
                    onChange={(e) => setNewWork({ ...newWork, category: e.target.value as Work["category"] })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="design">تصميم جرافيكي</option>
                    <option value="photography">تصوير</option>
                    <option value="voice">تعليق صوتي</option>
                  </select>
                  <input
                    value={newWork.imageUrl}
                    onChange={(e) => setNewWork({ ...newWork, imageUrl: e.target.value })}
                    placeholder="رابط الصورة (https://...)"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    value={newWork.altText}
                    onChange={(e) => setNewWork({ ...newWork, altText: e.target.value })}
                    placeholder="Alt text للـ SEO"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    value={newWork.description}
                    onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                    placeholder="وصف العمل"
                    rows={2}
                    className="md:col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <button
                  onClick={addWork}
                  disabled={saving}
                  className="mt-4 flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  <Plus size={16} />
                  {saving ? "جارٍ الإضافة..." : "إضافة"}
                </button>
              </div>
            )}

            {/* قائمة الأعمال */}
            <div className="space-y-4">
              {works.length === 0 && (
                <div className="text-center text-gray-500 py-16">لا توجد أعمال بعد — أضف أول عمل</div>
              )}
              {works.map((work) => (
                <div key={work.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  {editingWork?.id === work.id ? (
                    // نموذج التعديل
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          value={editingWork.title}
                          onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                        <select
                          value={editingWork.category}
                          onChange={(e) => setEditingWork({ ...editingWork, category: e.target.value as Work["category"] })}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="design">تصميم جرافيكي</option>
                          <option value="photography">تصوير</option>
                          <option value="voice">تعليق صوتي</option>
                        </select>
                        <input
                          value={editingWork.imageUrl}
                          onChange={(e) => setEditingWork({ ...editingWork, imageUrl: e.target.value })}
                          placeholder="رابط الصورة"
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                        <input
                          value={editingWork.altText}
                          onChange={(e) => setEditingWork({ ...editingWork, altText: e.target.value })}
                          placeholder="Alt text"
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                        <textarea
                          value={editingWork.description}
                          onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })}
                          rows={2}
                          className="md:col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={saveWork}
                          disabled={saving}
                          className="flex items-center gap-2 bg-green-600 px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
                        >
                          <Save size={16} />
                          حفظ
                        </button>
                        <button
                          onClick={() => setEditingWork(null)}
                          className="flex items-center gap-2 bg-gray-700 px-5 py-2 rounded-lg hover:bg-gray-600 transition-all"
                        >
                          <X size={16} />
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    // عرض العمل
                    <div className="flex items-center gap-4">
                      {work.imageUrl && (
                        <img
                          src={work.imageUrl}
                          alt={work.altText}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-700"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{work.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{work.description}</p>
                        <span className="text-xs text-blue-400 mt-1 inline-block">
                          {work.category === "design" ? "تصميم" : work.category === "photography" ? "تصوير" : "تعليق صوتي"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingWork(work)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => deleteWork(work.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
