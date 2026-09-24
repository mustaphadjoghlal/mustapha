import { useState, useEffect } from "react";
import { Mail, Phone, Linkedin, Twitter, Instagram } from "lucide-react";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface SiteInfo {
  heroName: string;
  email: string;
  phone: string;
  footerDescription: string;
  linkedinUrl: string;
  twitterUrl: string;
  instagramUrl: string;
}

export function Footer() {
  const [info, setInfo] = useState<SiteInfo>({
    heroName: "مصطفى جغلال",
    email: "mustaphadjoghlal.pro@gmail.com",
    phone: "",
    footerDescription: "معلق صوتي محترف ومصمم بصري مقيم في مسقط، سلطنة عُمان.",
    linkedinUrl: "#",
    twitterUrl: "#",
    instagramUrl: "#",
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data() as SiteInfo;
        setInfo((prev) => ({ ...prev, ...data }));
      }
    });
    return unsub;
  }, []);

  return (
    <footer className="border-t border-ink-700 bg-ink-950">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* الاسم ووصف مختصر */}
          <div className="max-w-sm">
            <h3 className="text-lg font-bold">{info.heroName}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{info.footerDescription}</p>
          </div>

          {/* التواصل */}
          <div className="flex flex-col gap-3 text-sm text-fg-muted">
            {info.email && (
              <a href={`mailto:${info.email}`} className="flex items-center gap-2 transition-colors hover:text-fg">
                <Mail size={16} />
                <span>{info.email}</span>
              </a>
            )}
            {info.phone && (
              <a href={`tel:${info.phone}`} className="flex items-center gap-2 transition-colors hover:text-fg">
                <Phone size={16} />
                <span dir="ltr">{info.phone}</span>
              </a>
            )}
            <div className="mt-1 flex gap-5">
              <a href={info.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="لينكدإن" className="transition-colors hover:text-royal-400">
                <Linkedin size={19} />
              </a>
              <a href={info.twitterUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="تويتر" className="transition-colors hover:text-royal-400">
                <Twitter size={19} />
              </a>
              <a href={info.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="إنستغرام" className="transition-colors hover:text-royal-400">
                <Instagram size={19} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-ink-700 pt-6 text-sm text-fg-muted">
          <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة - {info.heroName}</p>
        </div>
      </div>
    </footer>
  );
}
