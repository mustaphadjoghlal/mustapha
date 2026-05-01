import { ImageWithFallback } from "../../shared/ImageWithFallback";
import { Award, Briefcase, Users, Target } from "lucide-react";

export function AboutPage() {
  const stats = [
    { icon: <Briefcase className="w-8 h-8" />, value: "10+", label: "سنوات خبرة" },
    { icon: <Users className="w-8 h-8" />, value: "300+", label: "عميل سعيد" },
    { icon: <Target className="w-8 h-8" />, value: "500+", label: "مشروع منجز" },
    { icon: <Award className="w-8 h-8" />, value: "15+", label: "جائزة وتكريم" },
  ];

  const skills = [
    { category: "التصميم الجرافيكي", items: ["Adobe Photoshop", "Adobe Illustrator", "Figma", "InDesign"] },
    { category: "التصوير", items: ["التصوير الفوتوغرافي", "المعالجة والتحرير", "Lightroom", "Capture One"] },
    { category: "التعليق الصوتي", items: ["Adobe Audition", "التسجيل الاحترافي", "المعالجة الصوتية", "الأداء الصوتي"] },
    { category: "التدريب", items: ["الإلقاء والخطابة", "التعليق الصوتي", "مهارات العرض", "التواصل الفعال"] },
  ];

  const experience = [
    {
      year: "2020 - الآن",
      title: "مستشار إبداعي مستقل",
      description: "تقديم حلول إبداعية متكاملة للشركات الكبرى والمتوسطة في الشرق الأوسط",
    },
    {
      year: "2016 - 2020",
      title: "مدير التصميم - شركة الإبداع الرقمي",
      description: "قيادة فريق من المصممين والمبدعين لتنفيذ مشاريع كبرى",
    },
    {
      year: "2014 - 2016",
      title: "مصمم جرافيك أول - استوديو الفنون",
      description: "تصميم هويات بصرية ومواد تسويقية لعملاء متنوعين",
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  من أنا
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                أنا مصطفى، مبدع شغوف بالفنون البصرية والصوتية. بدأت رحلتي في عالم التصميم والإبداع منذ أكثر من عشر سنوات،
                وطورت خبرتي لتشمل التصميم الجرافيكي، التصوير الفوتوغرافي، والتعليق الصوتي.
              </p>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                أؤمن بأن كل مشروع هو فرصة لخلق شيء فريد ومميز. أعمل عن كثب مع عملائي لفهم رؤيتهم وتحويلها إلى
                واقع ملموس يتجاوز توقعاتهم.
              </p>
              <p className="text-xl text-gray-300 leading-relaxed">
                بالإضافة إلى عملي كمستشار إبداعي، أنا مدرب معتمد في مجالات الإلقاء والخطابة والتعليق الصوتي،
                وقد ساعدت المئات في تطوير مهاراتهم وتحقيق أهدافهم المهنية.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-3xl opacity-30"></div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1624411024074-18a756682b50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhcmFiaWMlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3Nzc1NjQ4MjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="مصطفى المحترف"
                  className="relative rounded-2xl w-full max-w-md object-cover border-4 border-gray-800 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-blue-500 transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4 text-blue-400">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">المهارات والخبرات</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500 transition-all"
              >
                <h3 className="text-xl font-bold mb-4 text-purple-400">{skill.category}</h3>
                <ul className="space-y-2">
                  {skill.items.map((item, idx) => (
                    <li key={idx} className="text-gray-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">الخبرة العملية</h2>
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h3 className="text-2xl font-bold">{exp.title}</h3>
                  <span className="text-blue-400 font-semibold mt-2 md:mt-0">{exp.year}</span>
                </div>
                <p className="text-gray-400 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">دعنا نعمل معاً</h2>
          <p className="text-gray-400 text-lg mb-8">
            هل لديك مشروع في ذهنك؟ أو تريد معرفة المزيد عن خدماتي؟
          </p>
          <a
            href="mailto:info@example.com"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
          >
            تواصل معي الآن
          </a>
        </div>
      </section>
    </div>
  );
}
