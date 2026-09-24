import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useText } from "./siteText";

/** روابط القائمة — النصوص تُقرأ من لوحة التحكم */
const navPaths = [
  { path: "/", textKey: "nav.home" },
  { path: "/about", textKey: "nav.about" },
  { path: "/portfolio", textKey: "nav.portfolio" },
  { path: "/courses", textKey: "nav.courses" },
  { path: "/articles", textKey: "nav.articles" },
];

export function Header() {
  const t = useText();
  const navItems = navPaths.map(({ path, textKey }) => ({ path, label: t(textKey) }));
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // شفاف فوق بداية الصفحة الرئيسية، ويصبح صلباً عند التمرير
  const transparent = isHome && !scrolled && !mobileMenuOpen;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent ? "bg-transparent" : "bg-ink-950/92 backdrop-blur-md border-b border-ink-700"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-[1.05rem] font-bold tracking-tight text-fg transition-colors hover:text-royal-300"
          >
            {t("header.wordmark")}
          </Link>

          <nav className="hidden md:flex gap-7">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm transition-colors hover:text-fg ${
                  location.pathname === item.path ? "text-royal-400" : "text-fg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden -me-2 p-2 text-fg"
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-ink-700 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 transition-colors hover:text-fg ${
                  location.pathname === item.path ? "text-royal-400" : "text-fg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
