import { Link } from "react-router";
import { Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4">الصفحة غير موجودة</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
        >
          <Home size={20} />
          <span>العودة للرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
