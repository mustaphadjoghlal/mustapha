import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { collection, doc, limit, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";

/**
 * يقرأ عنصراً من Firestore بالرابط المقروء (slug)، ويقبل المعرّف القديم أيضاً
 * حتى لا تنكسر الروابط التي شوركت سابقاً. إن فُتح بالمعرّف القديم وللعنصر رابط
 * مقروء، يُستبدل العنوان في المتصفح بالرابط الجديد.
 *
 * buildPath: يبني المسار الكامل من الـslug، مثل (s) => `/articles/${s}`
 */
export function useDocBySlug<T extends { id: string; slug?: string }>(
  collectionName: string,
  param: string | undefined,
  buildPath: (slug: string) => string,
) {
  const navigate = useNavigate();
  const [item, setItem] = useState<T | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!param) return;
    setLoaded(false);
    let byId: (() => void) | undefined;

    const bySlug = onSnapshot(
      query(collection(db, collectionName), where("slug", "==", param), limit(1)),
      (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0];
          setItem({ id: d.id, ...d.data() } as T);
          setLoaded(true);
          return;
        }
        // لا يوجد عنصر بهذا الرابط: لعله معرّف قديم
        byId?.();
        byId = onSnapshot(
          doc(db, collectionName, param),
          (d) => {
            if (d.exists()) {
              const found = { id: d.id, ...d.data() } as T;
              setItem(found);
              if (found.slug && found.slug !== param) {
                navigate(buildPath(found.slug), { replace: true });
              }
            } else {
              setItem(null);
            }
            setLoaded(true);
          },
          () => { setItem(null); setLoaded(true); },
        );
      },
      () => { setItem(null); setLoaded(true); },
    );

    return () => { bySlug(); byId?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, param]);

  return { item, loaded };
}
