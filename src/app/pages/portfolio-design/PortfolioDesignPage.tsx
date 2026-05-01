import { ImageWithFallback } from "../../shared/ImageWithFallback";
import { CheckCircle, Palette } from "lucide-react";

export function PortfolioDesignPage() {
  const projects = [
    {
      title: "تصميم هوية بصرية متكاملة",
      description: "هوية بصرية احترافية لشركة تقنية ناشئة تشمل الشعار، الألوان، والخطوط",
      image: "https://images.unsplash.com/photo-1652805363265-b8fbf9bbdfac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwcG9ydGZvbGlvfGVufDF8fHx8MTc3NzU2NDgyM3ww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "الهوية البصرية",
    },
    {
      title: "تصميم مواد تسويقية",
      description: "بروشورات وكتيبات تسويقية لحملة إطلاق منتج جديد",
      image: "https://images.unsplash.com/photo-1619209629065-e9a2b225b24b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxncmFwaGljJTIwZGVzaWduJTIwcG9ydGZvbGlvfGVufDF8fHx8MTc3NzU2NDgyM3ww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "التسويق",
    },
  ];

  const services = [
    "تصميم الهويات البصرية والشعارات",
    "تصميم المواد التسويقية والإعلانية",
    "تصميم الكتب والمجلات الإلكترونية",
    "تصميم واجهات المستخدم (UI Design)",
    "تصميم البوسترات والإنفوجرافيك",
    "تصميم محتوى وسائل التواصل الاجتماعي",
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <Palette className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              التصميم الجرافيكي
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              أقدم تصاميم جرافيكية احترافية تجمع بين الإبداع والوظيفية، مصممة خصيصاً لتلبية احتياجات عملك وتعزيز هويتك البصرية.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">الخدمات المقدمة</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all"
              >
                <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-gray-200">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مشاريع مميزة</h2>
            <p className="text-gray-400 text-lg">نماذج من أعمالي في التصميم الجرافيكي</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20"
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full text-sm font-semibold">
                      {project.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-400">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">هل لديك مشروع تصميم؟</h2>
          <p className="text-gray-400 text-lg mb-8">
            دعنا نعمل معاً لإنشاء تصاميم تعبر عن رؤيتك وتحقق أهدافك
          </p>
          <a
            href="mailto:info@example.com"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
          >
            ابدأ مشروعك الآن
          </a>
        </div>
      </section>
    </div>
  );
}
