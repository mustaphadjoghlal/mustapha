import { Link } from "react-router";
import { ImageWithFallback } from "../../shared/ImageWithFallback";
import { Camera, Mic, Palette, GraduationCap, ArrowLeft } from "lucide-react";

export function HomePage() {
  const services = [
    {
      icon: <Palette className="w-12 h-12 text-blue-400" />,
      title: "التصميم الجرافيكي",
      description: "تصاميم احترافية تعبر عن هويتك البصرية بأعلى جودة",
      link: "/portfolio-design",
    },
    {
      icon: <Camera className="w-12 h-12 text-purple-400" />,
      title: "التصوير الفوتوغرافي",
      description: "التقاط اللحظات المميزة بإبداع واحترافية",
      link: "/portfolio-photography",
    },
    {
      icon: <Mic className="w-12 h-12 text-pink-400" />,
      title: "التعليق الصوتي",
      description: "صوت احترافي لجميع احتياجاتك الإعلانية والتوثيقية",
      link: "/portfolio-voice",
    },
    {
      icon: <GraduationCap className="w-12 h-12 text-green-400" />,
      title: "الدورات التدريبية",
      description: "دورات متخصصة في الإلقاء والخطابة والتعليق الصوتي",
      link: "/courses",
    },
  ];

  const clients = [
    { name: "شركة الإبداع" },
    { name: "مؤسسة النجاح" },
    { name: "شركة التميز الرقمي" },
    { name: "مركز التطوير المهني" },
    { name: "وكالة التسويق الذكي" },
    { name: "استوديو الفنون" },
  ];

  return (
    <div className="bg-black text-white">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                مرحباً، أنا{" "}
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  مصطفى المحترف
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                خبير في التصميم الجرافيكي والتصوير الفوتوغرافي والتعليق الصوتي مع أكثر من 10 سنوات من الخبرة في تقديم حلول إبداعية متكاملة.
                أساعد الشركات والأفراد على تحقيق أهدافهم من خلال محتوى بصري وصوتي احترافي.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#services"
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
                >
                  استكشف خدماتي
                </a>
                <Link
                  to="/about"
                  className="px-8 py-3 border border-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-400 transition-all font-semibold"
                >
                  المزيد عني
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-30"></div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1624411024074-18a756682b50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhcmFiaWMlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3Nzc1NjQ4MjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="مصطفى المحترف - مصمم جرافيك، مصور، معلق صوتي"
                  className="relative rounded-full w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover border-4 border-gray-800 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ماذا أقدم</h2>
            <p className="text-gray-400 text-lg">حلول إبداعية شاملة لجميع احتياجاتك</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.link}
                className="group bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20"
              >
                <div className="mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-4">{service.description}</p>
                <div className="flex items-center text-blue-400 group-hover:gap-2 transition-all">
                  <span>اكتشف المزيد</span>
                  <ArrowLeft size={18} className="group-hover:translate-x-[-4px] transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">عملاؤنا المميزون</h2>
            <p className="text-gray-400 text-lg">فخورون بثقة هذه الجهات المرموقة</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {clients.map((client, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center justify-center hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <p className="text-center text-gray-300 font-semibold">{client.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">جاهز لبدء مشروعك؟</h2>
          <p className="text-gray-400 text-lg mb-8">
            دعنا نتعاون لتحويل أفكارك إلى واقع ملموس
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:info@example.com"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
            >
              أرسل رسالة
            </a>
            <a
              href="tel:+966123456789"
              className="px-8 py-3 border border-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-400 transition-all font-semibold"
            >
              اتصل الآن
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
