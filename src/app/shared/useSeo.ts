import { useEffect } from "react";
import { useLocation } from "react-router";
import { useText } from "./siteText";

const SITE_URL = "https://mustaphadjoghlal.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface SeoOptions {
  /** عنوان الصفحة بدون اسم الموقع — يُضاف تلقائياً */
  title?: string;
  /**
   * اسم الموقع الذي يُضاف إلى العنوان ويُستخدم في og:site_name.
   * "الحكواتي" موقع مستقل بهويته الخاصة فتمرّر صفحاته اسمها هنا.
   */
  siteName?: string;
  description?: string;
  /** رابط صورة المشاركة (مطلق) */
  image?: string;
  /** "article" لصفحات المقالات والحكايات، و"website" لبقية الصفحات */
  type?: "website" | "article";
  /** يمنع أرشفة الصفحة — تُستخدم في 404 ولوحة التحكم */
  noindex?: boolean;
}

/** يضبط وسم <meta> أو ينشئه إن لم يكن موجوداً */
function setMeta(key: "name" | "property", value: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

/**
 * يضبط عنوان الصفحة ووسوم الميتا (description / canonical / Open Graph / Twitter)
 * عند كل تنقّل. بدونه تبقى وسوم الصفحة السابقة معلّقة لأن الموقع SPA.
 */
export function useSeo({
  title,
  description,
  image,
  type = "website",
  noindex = false,
  siteName,
}: SeoOptions = {}) {
  const { pathname } = useLocation();
  const t = useText();

  // اسم الموقع وعنوانه الافتراضي يُقرآن من لوحة التحكم، إلا في صفحات الحكواتي
  // التي تمرّر اسمها الخاص لأنها موقع مستقل بهويته.
  const name = siteName || t("seo.siteName");
  const desc = description?.trim() || t("seo.home.description");

  const fullTitle = title
    ? title.includes(name)
      ? title
      : `${title} | ${name}`
    : t("seo.home.title");
  const img = image || DEFAULT_IMAGE;
  const canonical = `${SITE_URL}${pathname === "/" ? "" : pathname.replace(/\/+$/, "")}`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta("name", "description", desc);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setCanonical(canonical);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", img);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", name);

    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);
  }, [fullTitle, desc, img, type, noindex, canonical, name]);
}
