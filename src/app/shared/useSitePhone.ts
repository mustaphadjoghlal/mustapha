import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

/**
 * رقم الواتساب المعتمد — يُقرأ من لوحة التحكم (siteInfo.phone).
 * الرقم الممرَّر يُستعمل ريثما تصل البيانات حتى لا يبقى الزر بلا رابط.
 */
export function useSitePhone(fallback = "96871227281") {
  const [phone, setPhone] = useState(fallback);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (snap.empty) return;
      const value = (snap.docs[0].data() as { phone?: string }).phone;
      if (value) setPhone(value);
    });
    return unsub;
  }, []);

  return phone.replace(/\D/g, "");
}
