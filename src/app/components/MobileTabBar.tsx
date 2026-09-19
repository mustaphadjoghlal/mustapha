import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Home, FolderOpen, FileText, Mail, MoreHorizontal, X } from "lucide-react";
import { navItems } from "../shared/Header";

const tabs = [
  { path: "/", label: "الرئيسية", Icon: Home },
  { path: "/portfolio-design", label: "أعمالي", Icon: FolderOpen },
  { path: "/articles", label: "المدونة", Icon: FileText },
  { path: "/about", label: "تواصل معي", Icon: Mail },
];

/** شريط تنقّل سفلي للجوال — يظهر على الشاشات الصغيرة فقط */
export function MobileTabBar() {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-ink-900 border-t border-ink-700 rounded-t-3xl p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">كل الأقسام</h2>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={`rounded-xl border px-4 py-3 text-sm transition-colors ${
                    pathname === item.path
                      ? "border-royal-500 bg-royal-500/10 text-royal-300"
                      : "border-ink-700 text-gray-300 hover:border-royal-600 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ink-950/95 backdrop-blur-md border-t border-ink-700"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="التنقّل السريع"
      >
        <div className="grid grid-cols-5">
          {tabs.map(({ path, label, Icon }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
                  active ? "text-royal-400" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span className={active ? "font-semibold" : ""}>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-gray-400 hover:text-gray-200 transition-colors"
          >
            <MoreHorizontal size={20} strokeWidth={1.8} />
            <span>المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
}
