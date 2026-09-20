import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { MessageCircle, X } from "lucide-react";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface SiteInfo {
  phone?: string;
}

export function FloatingWhatsApp() {
  const [phone, setPhone] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  /** يصبح true حين يكون زر "تواصل معي" ظاهراً على الشاشة */
  const [ctaVisible, setCtaVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data() as SiteInfo;
        if (data.phone) setPhone(data.phone);
      }
    });
    return unsub;
  }, []);

  /**
   * يراقب أزرار "تواصل معي" في الصفحة: ما دام أحدها ظاهراً يختفي
   * الزر العائم حتى لا يتكرّر نفس الإجراء مرتين أمام الزائر.
   */
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const watch = () => {
      observer?.disconnect();
      const targets = Array.from(document.querySelectorAll("[data-whatsapp-cta]"));
      if (targets.length === 0) {
        setCtaVisible(false);
        return;
      }
      const state = new Map<Element, boolean>();
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => state.set(entry.target, entry.isIntersecting));
          setCtaVisible(Array.from(state.values()).some(Boolean));
        },
        { threshold: 0.2 }
      );
      targets.forEach((t) => observer!.observe(t));
    };

    watch();
    // الأزرار قد تُرسم بعد وصول البيانات، فتُعاد المراقبة بعد قليل
    const retry = window.setTimeout(watch, 800);
    return () => {
      window.clearTimeout(retry);
      observer?.disconnect();
    };
  }, [pathname]);

  // إغلاق البطاقة تلقائياً عند اختفاء الزر العائم
  useEffect(() => {
    if (ctaVisible) setIsOpen(false);
  }, [ctaVisible]);

  if (!phone) return null;

  const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent("مرحباً، أود التواصل معك")}`;

  return (
    <div
      className={`fixed bottom-6 right-5 md:right-6 z-30 transition-all duration-300 ${
        ctaVisible ? "pointer-events-none scale-90 opacity-0" : "scale-100 opacity-100"
      }`}
      aria-hidden={ctaVisible}
    >
      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-6 w-[min(20rem,calc(100vw-2rem))] mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">تواصل معنا عبر الواتساب</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            اضغط الزر أدناه للتواصل معنا مباشرة عبر الواتساب
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-all"
          >
            <MessageCircle size={20} />
            فتح الواتساب
          </a>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={ctaVisible ? -1 : 0}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        aria-label="واتساب"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
