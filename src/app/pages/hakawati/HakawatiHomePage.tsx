import { useEffect } from "react";
import { Link } from "react-router";
import { Sparkles } from "lucide-react";

const PAGE_TITLE = "الحكواتي — حيث تعود أحداث الماضي للحياة | مصطفى جغلال";
const PAGE_DESC = "ركن الحكواتي: حكايات درامية من التاريخ العربي والإسلامي، ولعبة أسئلة تختبر معرفتك بالسير والأمجاد.";

export function HakawatiHomePage() {
  useEffect(() => {
    document.title = PAGE_TITLE;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", PAGE_DESC);
  }, []);

  return (
    <div className="min-h-screen text-[#f2e9da]" dir="rtl" style={{ background: "radial-gradient(ellipse at 50% -20%, #2b1a10 0%, #120b07 55%, #050302 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap');
        .hk-body { font-family: 'Tajawal', sans-serif; }
        .hk-display { font-family: 'Aref Ruqaa', serif; }
      `}</style>

      <div className="hk-body">
        {/* البطل — الشعار والهوية */}
        <section className="relative overflow-hidden">
          <h1 className="sr-only">الحكواتي — حيث تعود أحداث الماضي للحياة</h1>
          <img
            src="/hakawati/banner.jpg"
            alt="الحكواتي — حيث تعود أحداث الماضي للحياة"
            className="w-full h-auto max-h-[190px] sm:max-h-[420px] object-cover object-top"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-14 sm:h-32 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, #120b07)" }}
          />
        </section>

        <section className="relative px-4 pb-2 pt-4 sm:pb-4 sm:pt-12">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="w-24 h-px mx-auto mb-3 sm:mb-8" style={{ background: "linear-gradient(90deg, transparent, #a8763f, transparent)" }} />
            <p className="text-[#d9c9b0] text-sm sm:text-lg leading-relaxed sm:leading-loose">
              منذ أن كان الحكواتي يجلس في صدر المقهى، وفانوسه إلى جانبه، والناس تتحلّق حوله لتسمع سيرة فارسٍ
              أو فتحَ مدينةٍ أو حكمة خليفة.. كانت الحكاية هي الذاكرة التي تنتقل من مجلسٍ إلى مجلس، ومن جيلٍ إلى جيل.
            </p>
            <p className="text-[#b39d7c] text-xs sm:text-base leading-relaxed sm:leading-loose mt-2 sm:mt-4">
              هذا الركن امتداد لذلك المجلس القديم: حكايات من تاريخ أمّةٍ عظيمة، ولعبة أسئلة تختبر
              كم حفظت من سِيَر الأولين.
            </p>
          </div>
        </section>

        {/* بطاقة اللعبة */}
        <section className="px-4 pb-10 pt-3 sm:pb-24 sm:pt-8">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/hakawati/game"
              className="group flex flex-col sm:flex-row items-center gap-3 sm:gap-6 rounded-2xl p-4 sm:p-8 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(160deg, rgba(58,36,20,0.85), rgba(18,11,7,0.9))", border: "1px solid rgba(168,99,46,0.35)" }}
            >
              <div className="text-3xl sm:text-5xl">🏮</div>
              <div className="flex-1 text-center sm:text-right">
                <h2 className="hk-display text-lg sm:text-2xl text-[#c9853f] mb-1 sm:mb-2">افتح مجلس الأسئلة</h2>
                <p className="text-[#a8763f] text-xs sm:text-sm leading-relaxed">
                  عشر ليالٍ، عشر حكايات، وثلاثة فوانيس.. هل تستحق لقب «حكواتي الزمان»؟
                </p>
              </div>
              <Sparkles className="hidden sm:block text-[#c9853f] group-hover:scale-110 transition-transform" size={28} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
