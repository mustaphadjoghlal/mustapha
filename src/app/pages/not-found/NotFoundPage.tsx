import { Link } from "react-router";
import { Home } from "lucide-react";
import { useSeo } from "../../shared/useSeo";

export function NotFoundPage() {
  useSeo({
    title: "الصفحة غير موجودة",
    description: "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    noindex: true,
  });
  return (
    <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-royal-400 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4">الصفحة غير موجودة</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-royal-500 rounded-lg hover:from-royal-600 hover:to-royal-700 transition-all font-semibold"
        >
          <Home size={20} />
          <span>العودة للرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
