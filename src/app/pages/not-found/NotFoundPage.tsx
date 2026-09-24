import { Link } from "react-router";
import { Home } from "lucide-react";
import { useSeo } from "../../shared/useSeo";
import { useText } from "../../shared/siteText";

export function NotFoundPage() {
  const t = useText();

  useSeo({
    title: t("notfound.heading"),
    description: t("notfound.text"),
    noindex: true,
  });

  return (
    <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-royal-400 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4">{t("notfound.heading")}</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          {t("notfound.text")}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-royal-500 rounded-lg hover:bg-royal-600 transition-all font-semibold"
        >
          <Home size={20} />
          <span>{t("notfound.button")}</span>
        </Link>
      </div>
    </div>
  );
}
