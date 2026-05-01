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
    email: "",
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
    <footer className="border-t border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {info.heroName}
            </h3>
            <p className="text-gray-400">{info.footerDescription}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">تواصل معي</h4>
            <div className="space-y-3 text-gray-400">
              {info.email && (
                <a href={`mailto:${info.email}`} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                  <Mail size={18} />
                  <span>{info.email}</span>
                </a>
              )}
              {info.phone && (
                <a href={`tel:${info.phone}`} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                  <Phone size={18} />
                  <span dir="ltr">{info.phone}</span>
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">تابعني</h4>
            <div className="flex gap-4">
              <a href={info.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin size={24} />
              </a>
              <a href={info.twitterUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={24} />
              </a>
              <a href={info.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة - {info.heroName}</p>
        </div>
      </div>
    </footer>
  );
}
