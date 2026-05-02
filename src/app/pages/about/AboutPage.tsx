import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface SiteInfo {
  heroName: string;
  aboutText: string;
  email: string;
  phone: string;
  aboutImages: { url: string; alt: string }[];
}

const defaultAbout = {
  heroName: "مصطفى جغلال",
  aboutText: "",
  email: "djo-mustapha@gmail.com",
  phone: "+968 71227281",
  aboutImages: [],
};

export function AboutPage() {
  const [info, setInfo] = useState<SiteInfo>(defaultAbout);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "siteInfo"), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data() as SiteInfo;
        setInfo((prev) => ({ ...prev, ...data }));
      }
    });
    return unsub;
  }, []);

  const experience = [
    {
      period: "2025 — الآن",
      title: "مدير مجتمع — شركة النسرين لمواد البناء",
      location: "مسقط، سلطنة عُمان",
      tasks: [
        "إدارة حساب Instagram الخاص بالشركة",
        "تصوير وتوثيق أعمال الشركة في ورشات البناء",
        "التواصل مع العملاء عبر منصات التواصل الاجتماعي",
        "تصوير وتصميم إعلانات لمنتجات الشركة",
      ],
    },
    {
      period: "2024 — الآن",
      title: "مدير مجتمع — وكالة Wayso",
      location: "الجزائر",
      tasks: [
        "إدارة صفحات مؤسسات متعددة واقتراح استراتيجيات تسويقية",
        "تصميم المنشورات والفيديوهات الترويجية والإعلانية",
        "تصوير المنتجات وعارضات الأزياء ومعالجة الصور",
      ],
    },
    {
      period: "2024",
      title: "مدرّب — دورات التعليق الصوتي والتنشيط على الركح",
      location: "الجزائر",
      tasks: [
        "تقديم ورشات تدريبية متخصصة في التعليق الصوتي",
        "تدريب على فن التنشيط والإلقاء الاحترافي",
      ],
    },
    {
      period: "2023",
      title: "صحفي ويب — قناة الحياة التلفزيونية",
      location: "الجزائر",
      tasks: [
        "البحث عن الأخبار والتحقق منها وإعادة صياغتها",
        "تصميم الصور المناسبة للمحتوى الإخباري",
        "قص أبرز المقاطع التلفزيونية ونشرها عبر الصفحة",
        "تنظيم البثوث المباشرة من القناة إلى الويب",
      ],
    },
    {
      period: "2021 — 2024",
      title: "معلق صوتي — موقع The Footix",
      location: "عن بُعد",
      tasks: [
        "كتابة سكريبت الفيديوهات والتعليق الصوتي",
        "المونتاج وتصميم الصور المصغرة للفيديو",
      ],
    },
    {
      period: "2021 — 2023",
      title: "وكيل إعلامي — موقع WIKKI SHOP",
      location: "الجزائر",
      tasks: [
        "تصميم صور وفيديوهات إعلانية للمنتجات",
        "التعليق الصوتي والمونتاج",
      ],
    },
    {
      period: "2021 — 2023",
      title: "عضو اللجنة الإعلامية — أكاديمية جيل الترجيح",
      location: "الجزائر",
      tasks: [
        "إدارة حسابات التواصل الاجتماعي",
        "التصوير والتنشيط وتصميم المحتوى البصري",
      ],
    },
    {
      period: "2016 — 2020",
      title: "مسؤول الإعلام والاتصال — النادي العلمي للتسيير ونادي فينيكس",
      location: "جامعة البليدة، الجزائر",
      tasks: [
        "إدارة حسابات التواصل الاجتماعي",
        "تصميم المحتوى البصري ومونتاج الفيديو",
        "التغطية الإعلامية للنشاطات والفعاليات",
      ],
    },
  ];

  const education = [
    { year: "2021", degree: "ماستر في تسويق الخدمات" },
    { year: "2019", degree: "ليسانس في التسويق" },
    { year: "2015", degree: "بكالوريا في التسيير والاقتصاد" },
  ];

  const certificates = [
    { year: "2021", title: "تحرير الفيديو — Adobe Premiere" },
    { year: "2020", title: "التسويق الرقمي — Google" },
    { year: "2018", title: "Microsoft Office (Word, Excel, PowerPoint)" },
  ];

  const skills = [
    { category: "التصميم البصري", items: ["Adobe Photoshop CC", "Figma", "تصميم الهوية البصرية", "تصميم منشورات السوشيال ميديا"] },
    { category: "التعليق الصوتي", items: ["التسجيل الاحترافي", "كتابة السكريبت", "المعالجة الصوتية", "الأداء الصوتي المتنوع"] },
    { category: "الإنتاج الرقمي", items: ["Adobe Premiere", "Wondershare Filmora", "التصوير الفوتوغرافي", "تصوير الفيديو"] },
    { category: "إدارة المجتمع", items: ["استراتيجيات التسويق", "إدارة حسابات السوشيال ميديا", "التواصل مع العملاء", "تحليل النتائج"] },
  ];

  const languages = [
    { lang: "العربية", level: "اللغة الأصلية", percent: 100 },
    { lang: "الفرنسية", level: "قراءة وكتابة", percent: 70 },
    { lang: "الإنجليزية", level: "قراءة وكتابة", percent: 60 },
  ];

  const mediaOutputs = [
    { title: "مشروع الحكواتي", description: "مشروع ثقافي تعليمي لسرد القصص التاريخية بأسلوب معاصر، وصل لآلاف المتابعين." },
    { title: "تعليقات صوتية — The Footix", description: "تعليق صوتي على عشرات الفيديوهات الرياضية والترفيهية على منصة يوتيوب." },
    { title: "تغطيات إعلامية جامعية", description: "تغطية عشرات اللقاءات الوطنية والدولية في جامعة البليدة وخارجها." },
    { title: "محتوى النسرين — عُمان", description: "إنتاج محتوى متكامل لشركة النسرين لمواد البناء في سلطنة عُمان." },
    { title: "دورات التعليق الصوتي", description: "تقديم ورشات تدريبية متخصصة في التعليق الصوتي والتنشيط على الركح." },
    { title: "صحافة ويب — قناة الحياة", description: "إنتاج وتحرير المحتوى الإخباري الرقمي لقناة الحياة التلفزيونية." },
  ];

  return (
    <div className="bg-black text-white min-h-screen" dir="rtl">

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-400 font-semibold mb-3 tracking-widest text-sm uppercase">تعرّف عليّ</p>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  مصطفى جغلال
                </span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                معلّق صوتي محترف ومصمّم محتوى بصري ومدير مجتمع جزائري الأصل، مقيم في مدينة مسقط بسلطنة عُمان. أجمع بين قوة الصوت وإبداع الصورة لأنتج محتوى رقمياً يترك أثراً حقيقياً.
              </p>
              <p className="text-gray-400 leading-relaxed">
                بدأت رحلتي من النشاط الجمعوي الجامعي في البليدة، ثم تطوّرت عبر سنوات من العمل الميداني في التصميم والتعليق الصوتي والإعلام الرقمي وإدارة المجتمعات الرقمية، حتى استقررت في مسقط حيث أواصل بناء مشاريعي المهنية والثقافية.
              </p>
            </div>
            <div className="flex justify-center">
              {info.aboutImages?.[0] ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-3xl opacity-20" />
                  <img
                    src={info.aboutImages[0].url}
                    alt={info.aboutImages[0].alt || "مصطفى جغلال"}
                    className="relative rounded-2xl w-full max-w-sm object-cover border-2 border-gray-800 shadow-2xl"
                  />
                </div>
              ) : (
                <div className="w-80 h-96 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* الصفات */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "🎙️", title: "صوت مميز", desc: "أداء صوتي احترافي يناسب الإعلانات والمحتوى التعليمي والترفيهي" },
              { emoji: "🎨", title: "إبداع بصري", desc: "تصاميم جرافيكية ومحتوى مرئي يعبّر عن هوية العلامة التجارية بدقة" },
              { emoji: "📱", title: "إدارة مجتمع", desc: "استراتيجيات تسويقية رقمية تبني حضوراً قوياً على السوشيال ميديا" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-all">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* الخبرات العملية */}
      <section className="py-20 bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">المسيرة المهنية</span>
          </h2>
          <div className="space-y-6">
            {experience.map((exp, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-all">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                    <p className="text-gray-500 text-sm">{exp.location}</p>
                  </div>
                  <span className="text-blue-400 text-sm font-semibold whitespace-nowrap">{exp.period}</span>
                </div>
                <ul className="space-y-1">
                  {exp.tasks.map((task, j) => (
                    <li key={j} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* صورة ثانية */}
      {info.aboutImages?.[1] && (
        <section className="py-12 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <img
                src={info.aboutImages[1].url}
                alt={info.aboutImages[1].alt || "مصطفى جغلال"}
                className="rounded-2xl w-full object-cover border-2 border-gray-800 shadow-xl"
              />
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">المهارات</span>
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {skills.map((skill, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <h4 className="text-purple-400 font-semibold mb-2 text-sm">{skill.category}</h4>
                      <ul className="space-y-1">
                        {skill.items.map((item, j) => (
                          <li key={j} className="text-gray-400 text-xs flex items-center gap-1">
                            <span className="w-1 h-1 bg-purple-400 rounded-full inline-block" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* المخرجات الإعلامية */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">المخرجات الإعلامية</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaOutputs.map((item, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-pink-500 transition-all">
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* التعليم والشهادات واللغات */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            {/* التعليم */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-blue-400">📚 التعليم</h3>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i} className="border-r-2 border-blue-600 pr-4">
                    <p className="text-gray-500 text-sm">{edu.year}</p>
                    <p className="text-white font-semibold">{edu.degree}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* الشهادات */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-purple-400">🏅 الشهادات</h3>
              <div className="space-y-4">
                {certificates.map((cert, i) => (
                  <div key={i} className="border-r-2 border-purple-600 pr-4">
                    <p className="text-gray-500 text-sm">{cert.year}</p>
                    <p className="text-white font-semibold">{cert.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* اللغات */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-pink-400">🌐 اللغات</h3>
              <div className="space-y-5">
                {languages.map((lang, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white font-semibold">{lang.lang}</span>
                      <span className="text-gray-500 text-sm">{lang.level}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full" style={{ width: `${lang.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* صورة ثالثة */}
      {info.aboutImages?.[2] && (
        <section className="py-12 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">الشخصية والصفات</span>
                </h2>
                <ul className="space-y-3 text-gray-300">
                  {["جاد وديناميكي مع قدرة كبيرة على التكيف", "مهتم بالتقنيات الجديدة والاقتصاد والثقافة العامة", "ناشط جمعوي وصانع محتوى رقمي", "يؤمن بأن المحتوى الناجح يبدأ بفهم الجمهور"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <img
                src={info.aboutImages[2].url}
                alt={info.aboutImages[2].alt || "مصطفى جغلال"}
                className="rounded-2xl w-full object-cover border-2 border-gray-800 shadow-xl"
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">هل تريد التعاون معي؟</h2>
          <p className="text-gray-400 mb-8">سواء كان مشروعاً صوتياً أو بصرياً أو رقمياً — أنا هنا</p>
          <a
            href={`mailto:${info.email}`}
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold text-lg"
          >
            تواصل معي الآن
          </a>
        </div>
      </section>
    </div>
  );
}
