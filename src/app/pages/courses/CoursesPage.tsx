import { useState, useEffect } from "react";
import { CheckCircle, GraduationCap, Users, Clock, Award } from "lucide-react";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  students: string;
  level: string;
  modules: string;
  email: string;
}

const defaultCourses: Course[] = [
  {
    id: "1",
    title: "دورة الإلقاء والخطابة",
    description: "تعلم فنون الإلقاء والخطابة الجماهيرية بثقة واحتراف",
    image: "https://images.unsplash.com/photo-1770240366266-57290c83cd5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "8 أسابيع",
    students: "150+ متدرب",
    level: "جميع المستويات",
    modules: "أساسيات الإلقاء والتواصل الفعال\nلغة الجسد وتأثيرها على الجمهور\nالتغلب على رهبة المنصة\nbناء وتنظيم الخطاب المؤثر\nاستخدام الصوت والنبرة بفعالية\nالتفاعل مع الجمهور والإجابة على الأسئلة",
    email: "djo-mustapha@gmail.com",
  },
  {
    id: "2",
    title: "دورة التعليق الصوتي الاحترافي",
    description: "احترف فن التعليق الصوتي من الصفر إلى الاحتراف",
    image: "https://images.unsplash.com/photo-1759922378100-89dca9fe3c98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "6 أسابيع",
    students: "100+ متدرب",
    level: "مبتدئ - متقدم",
    modules: "أساسيات الأداء الصوتي\nتقنيات التنفس والتحكم الصوتي\nأنواع التعليق الصوتي واستخداماته\nالتسجيل في الاستوديو المنزلي\nالمعالجة الصوتية والتعديل\nالتسويق لخدماتك الصوتية",
    email: "djo-mustapha@gmail.com",
  },
  {
    id: "3",
    title: "ورشة مهارات العرض والتقديم",
    description: "ورشة عملية مكثفة لإتقان مهارات العرض والتقديم",
    image: "https://images.unsplash.com/photo-1759456629070-8e222ab878ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "3 أيام",
    students: "50+ متدرب",
    level: "متوسط - متقدم",
    modules: "تصميم العروض التقديمية المؤثرة\nاستخدام الوسائل المرئية بفعالية\nتقنيات السرد القصصي في العروض\nإدارة الوقت أثناء العرض",
    email: "djo-mustapha@gmail.com",
  },
];

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(defaultCourses);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "courses"), (snap) => {
      if (!snap.empty) {
        setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course)));
      }
    });
    return unsub;
  }, []);

  const benefits = [
    { icon: <Users className="w-8 h-8" />, title: "تدريب عملي", description: "تمارين عملية وتطبيقات حية خلال الدورة" },
    { icon: <Clock className="w-8 h-8" />, title: "مرونة في المواعيد", description: "خيارات متعددة للمواعيد تناسب جدولك" },
    { icon: <Award className="w-8 h-8" />, title: "خبرة ميدانية", description: "تدريب من محترف في المجال بخبرة عملية حقيقية" },
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-teal-900/20 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-6">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">الدورات التدريبية</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              طور مهاراتك في الإلقاء والخطابة والتعليق الصوتي مع دورات تدريبية شاملة ومصممة خصيصاً لتلبية احتياجاتك المهنية.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">لماذا تختار دوراتنا</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-green-500 transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4 text-green-400">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">الدورات المتاحة</h2>
            <p className="text-gray-400 text-lg">اختر الدورة التي تناسب أهدافك المهنية</p>
          </div>
          <div className="space-y-8">
            {courses.map((course) => (
              <div key={course.id} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-green-500 transition-all hover:shadow-xl hover:shadow-green-500/20">
                <div className="grid md:grid-cols-3 gap-0">
                  <div className="relative h-64 md:h-auto overflow-hidden">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center"><GraduationCap size={48} className="text-gray-600" /></div>
                    )}
                  </div>
                  <div className="md:col-span-2 p-8">
                    <h3 className="text-2xl font-bold mb-3">{course.title}</h3>
                    <p className="text-gray-400 mb-6">{course.description}</p>
                    <div className="flex flex-wrap gap-4 mb-6">
                      {course.duration && <div className="flex items-center gap-2 text-gray-300"><Clock className="w-5 h-5 text-green-400" /><span>{course.duration}</span></div>}
                      {course.students && <div className="flex items-center gap-2 text-gray-300"><Users className="w-5 h-5 text-green-400" /><span>{course.students}</span></div>}
                      {course.level && <div className="flex items-center gap-2 text-gray-300"><Award className="w-5 h-5 text-green-400" /><span>{course.level}</span></div>}
                    </div>
                    {course.modules && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-green-400">محتوى الدورة:</h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {course.modules.split("\n").filter(m => m.trim()).map((module, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300 text-sm">{module.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <a href={`mailto:${course.email || "djo-mustapha@gmail.com"}`}
                      className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all font-semibold">
                      سجل الآن
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">هل أنت مستعد للبدء؟</h2>
          <p className="text-gray-400 text-lg mb-8">انضم إلى مئات المتدربين الذين طوروا مهاراتهم معنا</p>
          <a href="mailto:djo-mustapha@gmail.com" className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all font-semibold">
            تواصل معنا للاستفسار
          </a>
        </div>
      </section>
    </div>
  );
}
