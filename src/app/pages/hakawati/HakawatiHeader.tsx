import { Link, useLocation } from "react-router";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useState } from "react";

export function HakawatiHeader() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/hakawati", label: "الرئيسية" },
    { path: "/hakawati/stories", label: "الحكايات" },
    { path: "/hakawati/game", label: "اللعبة" },
  ];

  const isActive = (path: string) =>
    path === "/hakawati" ? location.pathname === "/hakawati" : location.pathname.startsWith(path);

  return (
    <header dir="rtl" className="sticky top-0 z-50 backdrop-blur-sm" style={{ background: "rgba(5,3,2,0.92)", borderBottom: "1px solid rgba(168,99,46,0.25)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <div className="flex justify-between items-center h-16">
          <Link to="/hakawati" className="flex items-center">
            <img src="/hakawati/logo.png" alt="الحكواتي" className="h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="transition-colors text-sm font-medium"
                style={{ color: isActive(item.path) ? "#c9853f" : "#d9c9b0" }}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/" className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: "#7a6650" }}>
              الموقع الرئيسي
              <ArrowLeft size={12} />
            </Link>
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2" style={{ color: "#d9c9b0" }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden py-4" style={{ borderTop: "1px solid rgba(168,99,46,0.2)" }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 transition-colors"
                style={{ color: isActive(item.path) ? "#c9853f" : "#d9c9b0" }}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 py-3 text-sm" style={{ color: "#7a6650" }}>
              <ArrowLeft size={14} />
              الموقع الرئيسي
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
