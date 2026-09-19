import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export const navItems = [
  { path: "/", label: "الرئيسية" },
  { path: "/about", label: "عني" },
  { path: "/portfolio-design", label: "التصميم الجرافيكي" },
  { path: "/portfolio-photography", label: "التصوير" },
  { path: "/portfolio-voice", label: "التعليق الصوتي" },
  { path: "/courses", label: "الدورات التدريبية" },
  { path: "/articles", label: "المقالات" },
  { path: "/hakawati", label: "الحكواتي" },
];

export function Header() {
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

  // على الصفحة الرئيسية يبقى الهيدر شفافاً فوق صورة البطل حتى أول تمرير
  const transparent = isHome && !scrolled && !mobileMenuOpen;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent border-b border-transparent"
          : "bg-ink-950/90 backdrop-blur-md border-b border-ink-700/70"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end md:justify-between items-center h-16">
          <nav className="hidden md:flex gap-7">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm transition-colors hover:text-royal-300 ${
                  location.pathname === item.path ? "text-royal-400 font-semibold" : "text-gray-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 -me-2"
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-ink-700">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 transition-colors hover:text-royal-300 ${
                  location.pathname === item.path ? "text-royal-400 font-semibold" : "text-gray-300"
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
