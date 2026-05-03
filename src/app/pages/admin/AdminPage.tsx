import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../../../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { Trash2, Pencil, Plus, LogOut, Save, X, Upload, Image, Loader } from "lucide-react";

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

  const extractAudio = async (file: File): Promise<Blob> => {
    setStatus("جاري استخراج الصوت...");
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();
    
    const renderedBuffer = await offlineCtx.startRendering();
    return new Promise((resolve) => {
      const worker = new Worker(URL.createObjectURL(new Blob([`
        onmessage = function(e) {
          const buffer = e.data;
          const numOfChan = buffer.numberOfChannels;
          const length = buffer.length * numOfChan * 2 + 44;
          const bufferArr = new ArrayBuffer(length);
          const view = new DataView(bufferArr);
          const channels = [];
          let i, sample, offset = 0;
          let pos = 0;

          const writeString = (s) => { for (i = 0; i < s.length; i++) view.setUint8(pos++, s.charCodeAt(i)); };
          writeString('RIFF'); view.setUint32(pos, length - 8, true); pos += 4;
          writeString('WAVE'); writeString('fmt '); view.setUint32(pos, 16, true); pos += 4;
          view.setUint16(pos, 1, true); pos += 2;
          view.setUint16(pos, numOfChan, true); pos += 2;
          view.setUint32(pos, buffer.sampleRate, true); pos += 4;
          view.setUint32(pos, buffer.sampleRate * 2 * numOfChan, true); pos += 4;
          view.setUint16(pos, numOfChan * 2, true); pos += 2;
          view.setUint16(pos, 16, true); pos += 2;
          writeString('data'); view.setUint32(pos, length - pos - 4, true); pos += 4;

          for (i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));
          while (pos < length) {
            for (i = 0; i < numOfChan; i++) {
              sample = Math.max(-1, Math.min(1, channels[i][offset]));
              sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
              view.setInt16(pos, sample, true); pos += 2;
            }
            offset++;
          }
          postMessage(new Blob([bufferArr], { type: 'audio/wav' }));
        }
      `], { type: 'application/javascript' })));
      
      worker.onmessage = (e) => resolve(e.data);
      worker.postMessage({
        numberOfChannels: renderedBuffer.numberOfChannels,
        length: renderedBuffer.length,
        sampleRate: renderedBuffer.sampleRate,
        getChannelData: (i: number) => renderedBuffer.getChannelData(i)
      });
    });
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    let fileToUpload: File | Blob = file;
    let fileName = file.name;

    if (onFileName) {
      onFileName(file.name.replace(/\.[^/.]+$/, ""));
    }

    if (file.type.startsWith("video/")) {
      try {
        fileToUpload = await extractAudio(file);
        fileName = file.name.replace(/\.[^/.]+$/, "") + ".wav";
      } catch (err) {
        console.error("Audio extraction failed", err);
        setStatus("فشل استخراج الصوت، سيتم رفع الملف الأصلي");
      }
    }

    setStatus("جاري الرفع...");
    const task = uploadBytesResumable(ref(storage, `${folder}/${Date.now()}_${fileName}`), fileToUpload);
    task.on("state_changed", 
      (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)), 
      (err) => { console.error(err); setStatus("فشل الرفع"); setUploading(false); },
      async () => { 
        onChange(await getDownloadURL(task.snapshot.ref)); 
        setUploading(false); 
        setProgress(0); 
        setStatus("");
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-3 items-center">
        {url && <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-green-400 truncate">✓ ملف صوتي مرفوع</div>}
        <div onClick={() => !uploading && fileInputRef.current?.click()} className={`flex-1 border-2 border-dashed ${uploading ? 'border-purple-500/50 cursor-not-allowed' : 'border-gray-600 hover:border-purple-500 cursor-pointer'} rounded-xl p-3 text-center transition-all`}>
          {uploading ? (
            <div className="space-y-1">
              <Loader size={16} className="animate-spin mx-auto text-purple-400" />
              <p className="text-gray-400 text-xs">{progress}%</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Upload size={14} />
              <span>{label}</span>
            </div>
          )}
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
            <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف (تظهر في القائمة)</p>
            <SingleImageUploader url={newWork.coverImage || ""} onChange={(url) => setNewWork({ ...newWork, coverImage: url })} folder="works" label="رفع صورة الغلاف" />
          </div>
          {isVoice && (
          <div className="space-y-2">
            <p className="text-gray-400 text-sm font-semibold">🎵 ملف صوتي MP3 (اختياري - بدلاً من SoundCloud)</p>
            <AudioUploader 
              url={newWork.audioUrl || ""} 
              onChange={(url) => setNewWork({ ...newWork, audioUrl: url })} 
              onFileName={(name) => !newWork.title && setNewWork({ ...newWork, title: name })}
              folder="works/audio" 
              label="رفع ملف صوتي" 
            />
          </div>
          )}
          {!isVoice && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-semibold">📸 صور المحتوى (تظهر في الصفحة التفصيلية)</p>
              <ImageUploader images={newWork.images} onChange={(imgs: string[]) => setNewWork({ ...newWork, images: imgs })} />
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
                  {isVoice && <input value={editingWork.soundcloudUrl || ""} onChange={(e) => setEditingWork({ ...editingWork, soundcloudUrl: e.target.value })} placeholder="رابط SoundCloud (اختياري)" className={`${sc} md:col-span-2`} />}
                  <textarea value={editingWork.description} onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })} rows={2} className={`${sc} resize-none md:col-span-2`} />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف</p>
                  <SingleImageUploader url={editingWork.coverImage || ""} onChange={(url) => setEditingWork({ ...editingWork, coverImage: url })} folder="works" label="رفع صورة الغلاف" />
                </div>
                {isVoice && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-semibold">🎵 ملف صوتي MP3</p>
                  <AudioUploader 
                    url={editingWork.audioUrl || ""} 
                    onChange={(url) => setEditingWork({ ...editingWork, audioUrl: url })} 
                    onFileName={(name) => !editingWork.title && setEditingWork({ ...editingWork, title: name })}
                    folder="works/audio" 
                    label="تغيير الملف الصوتي" 
                  />
                </div>
                )}
                {!isVoice && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-semibold">📸 صور المحتوى</p>
                  <ImageUploader images={editingWork.images || []} onChange={(imgs: string[]) => setEditingWork({ ...editingWork, images: imgs })} />
                </div>
                )}
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

  // Forms state
  const [newWork, setNewWork] = useState<Partial<Work>>({ title: "", description: "", coverImage: "", images: [], altText: "", soundcloudUrl: "", category: "design" });
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [showAddWork, setShowAddWork] = useState(false);

  const [newExp, setNewExp] = useState<Partial<Experience>>({ title: "", period: "", location: "", tasks: "" });
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [showAddExp, setShowAddExp] = useState(false);

  const [newMedia, setNewMedia] = useState<Partial<MediaOutput>>({ title: "", channel: "", type: "تلفزيون", date: "", description: "", url: "" });
  const [editingMedia, setEditingMedia] = useState<MediaOutput | null>(null);
  const [showAddMedia, setShowAddMedia] = useState(false);

  const sc = "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all text-sm";
  const mediaTypes = ["تلفزيون", "إذاعة", "صحافة", "بودكاست", "يوتيوب", "أخرى"];

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubWorks = onSnapshot(collection(db, "works"), (s) => setWorks(s.docs.map(d => ({ id: d.id, ...d.data() } as Work))));
    const unsubExp = onSnapshot(collection(db, "experiences"), (s) => setExperiences(s.docs.map(d => ({ id: d.id, ...d.data() } as Experience))));
    const unsubMedia = onSnapshot(collection(db, "mediaOutputs"), (s) => setMediaOutputs(s.docs.map(d => ({ id: d.id, ...d.data() } as MediaOutput))));
    const unsubArticles = onSnapshot(collection(db, "articles"), (s) => setArticles(s.docs.map(d => ({ id: d.id, ...d.data() } as Article))));
    const unsubClients = onSnapshot(collection(db, "clients"), (s) => setClients(s.docs.map(d => ({ id: d.id, ...d.data() } as Client))));
    const unsubCourses = onSnapshot(collection(db, "courses"), (s) => setCourses(s.docs.map(d => ({ id: d.id, ...d.data() } as Course))));
    const unsubInfo = onSnapshot(collection(db, "siteInfo"), (s) => { if (!s.empty) setSiteInfo({ id: s.docs[0].id, ...s.docs[0].data() } as SiteInfo); });

    return () => { unsubWorks(); unsubExp(); unsubMedia(); unsubArticles(); unsubClients(); unsubCourses(); unsubInfo(); };
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

  const saveInfo = async () => { if (!siteInfo) return; setSaving(true); try { await updateDoc(doc(db, "siteInfo", siteInfo.id), siteInfo as any); alert("تم الحفظ بنجاح"); } catch (e) { console.error(e); } setSaving(false); };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader className="animate-spin text-blue-500" /></div>;
  if (!user) return <LoginForm onLogin={signInWithEmailAndPassword} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20" dir="rtl">
      {/* Header with Horizontal Navigation */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">M</div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: "works", label: "الأعمال" },
                { id: "experience", label: "الخبرات" },
                { id: "media", label: "المخرجات" },
                { id: "info", label: "الإعدادات" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-gray-800 text-blue-400" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"><LogOut size={16} /> خروج</button>
          </div>
        </div>
        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto border-t border-gray-800 px-2 py-1 scrollbar-hide">
          {[
            { id: "works", label: "الأعمال" },
            { id: "experience", label: "الخبرات" },
            { id: "media", label: "المخرجات" },
            { id: "info", label: "الإعدادات" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2 text-sm whitespace-nowrap ${activeTab === tab.id ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="w-full">
          {activeTab === "works" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex flex-wrap items-center gap-2 mb-8 bg-black/40 p-1.5 rounded-xl w-fit">
                {[
                  { id: "design", label: "التصميم الجرافيكي", color: "blue" },
                  { id: "voice", label: "التعليق الصوتي", color: "purple" },
                  { id: "photography", label: "التصوير الفوتوغرافي", color: "cyan" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setNewWork({ ...newWork, category: cat.id as any })}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                      newWork.category === cat.id
                        ? `bg-${cat.color}-600 text-white shadow-lg`
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {newWork.category === "design" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> التصميم الجرافيكي</h2>
                  <WorksList works={works} category="design" saving={saving} editingWork={editingWork} setEditingWork={setEditingWork} onSave={saveWork} onDelete={deleteWork} showAdd={showAddWork} setShowAdd={setShowAddWork} newWork={newWork} setNewWork={setNewWork} onAdd={addWork} sc={sc} />
                </div>
              )}
              {newWork.category === "voice" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-purple-400"><span className="w-2 h-2 bg-purple-500 rounded-full"></span> التعليق الصوتي</h2>
                  <WorksList works={works} category="voice" saving={saving} editingWork={editingWork} setEditingWork={setEditingWork} onSave={saveWork} onDelete={deleteWork} showAdd={showAddWork} setShowAdd={setShowAddWork} newWork={newWork} setNewWork={setNewWork} onAdd={addWork} sc={sc} />
                </div>
              )}
              {newWork.category === "photography" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span> التصوير الفوتوغرافي</h2>
                  <WorksList works={works} category="photography" saving={saving} editingWork={editingWork} setEditingWork={setEditingWork} onSave={saveWork} onDelete={deleteWork} showAdd={showAddWork} setShowAdd={setShowAddWork} newWork={newWork} setNewWork={setNewWork} onAdd={addWork} sc={sc} />
                </div>
              )}
            </div>
          )}

          {activeTab === "experience" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">الخبرات والتعليم ({experiences.length})</h2>
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
                  <textarea value={newExp.tasks} onChange={(e) => setNewExp({ ...newExp, tasks: e.target.value })} placeholder="المهام (سطر لكل مهمة)" rows={3} className={`${sc} resize-none`} />
                  <button onClick={addExp} disabled={saving} className="flex items-center gap-2 bg-blue-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"><Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}</button>
                </div>
              )}
              <div className="space-y-3">
                {experiences.length === 0 && <p className="text-gray-500 text-center py-8">لا توجد تجارب</p>}
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
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف (اختياري)</p>
                    <SingleImageUploader url={newMedia.coverImage || ""} onChange={(url) => setNewMedia({ ...newMedia, coverImage: url })} folder="media-outputs" label="رفع صورة الغلاف" />
                  </div>
                  <button onClick={addMedia} disabled={saving} className="flex items-center gap-2 bg-pink-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700"><Plus size={14} /> {saving ? "جارٍ..." : "إضافة"}</button>
                </div>
              )}
              <div className="space-y-3">
                {mediaOutputs.length === 0 && <p className="text-gray-500 text-center py-8">لا توجد مخرجات بعد</p>}
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
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm font-semibold">🖼️ صورة الغلاف</p>
                          <SingleImageUploader url={editingMedia.coverImage || ""} onChange={(url) => setEditingMedia({ ...editingMedia, coverImage: url })} folder="media-outputs" label="تغيير الصورة" />
                        </div>
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
                            <span className={`text-xs px-2 py-0.5 rounded-full ${media.type === "تلفزيون" ? "bg-blue-900 text-blue-300" : media.type === "إذاعة" ? "bg-orange-900 text-orange-300" : media.type === "صحافة" ? "bg-green-900 text-green-300" : "bg-purple-900 text-purple-300"}`}>{media.type}</span>
                            <span className="text-gray-500 text-xs">{media.date}</span>
                          </div>
                          <p className="font-bold text-white text-sm">{media.title}</p>
                          <p className="text-gray-400 text-xs">{media.channel}</p>
                          {media.url && <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-pink-400 text-xs hover:underline">🔗 مشاهدة</a>}
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
                  <div className="space-y-2"><label className="text-sm text-gray-400">رقم الهاتف (واتساب)</label><input value={siteInfo.phone} onChange={(e) => setSiteInfo({ ...siteInfo, phone: e.target.value })} className={sc} /></div>
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
