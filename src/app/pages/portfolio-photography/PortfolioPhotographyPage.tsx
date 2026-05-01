import { ImageWithFallback } from "../../shared/ImageWithFallback";
import { CheckCircle, Camera } from "lucide-react";

export function PortfolioPhotographyPage() {
  const projects = [
    {
      title: "جلسة تصوير منتجات تجارية",
      description: "تصوير احترافي لمنتجات تجارية بإضاءة استوديو متقدمة",
      image: "https://images.unsplash.com/photo-1570394217969-3cb9e23a4068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3Nzc1NjQ4MjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "تصوير المنتجات",
    },
    {
      title: "تصوير فعاليات مؤسسية",
      description: "توثيق احترافي لمؤتمر سنوي كبير بتغطية شاملة",
      image: "https://images.unsplash.com/photo-1777401707183-2611511ca0a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3Nzc1NjQ4MjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "تصوير الفعاليات",
    },
    {
      title: "جلسة تصوير بورتريه احترافية",
      description: "صور شخصية احترافية لمدير تنفيذي بجودة عالية",
      image: "https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3Nzc1NjQ4MjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "تصوير البورتريه",
    },
  ];

  const services = [
    "تصوير المنتجات التجارية",
    "تصوير الفعاليات والمؤتمرات",
    "التصوير الشخصي (البورتريه)",
    "تصوير الطعام والمشروبات",
    "التصوير المعماري والعقاري",
    "تصوير الأزياء والموضة",
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-6">
              <Camera className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              التصوير الفوتوغرافي
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              التقاط اللحظات المميزة بعين فنية واحترافية. كل صورة تحكي قصة، وكل مشروع يعكس رؤية فريدة.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">خدمات التصوير</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-all"
              >
                <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <p className="text-gray-200">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">معرض الأعمال</h2>
            <p className="text-gray-400 text-lg">مشاريع تصوير متنوعة ومميزة</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition-all hover:shadow-xl hover:shadow-purple-500/20"
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-purple-500/90 backdrop-blur-sm rounded-full text-sm font-semibold">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">احجز جلسة تصوير</h2>
          <p className="text-gray-400 text-lg mb-8">
            دعنا نخلد لحظاتك المميزة بصور احترافية لا تُنسى
          </p>
          <a
            href="mailto:info@example.com"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-semibold"
          >
            احجز الآن
          </a>
        </div>
      </section>
    </div>
  );
}
