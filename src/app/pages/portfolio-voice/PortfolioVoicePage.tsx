import { ImageWithFallback } from "../../shared/ImageWithFallback";
import { CheckCircle, Mic, Play } from "lucide-react";

export function PortfolioVoicePage() {
  const projects = [
    {
      title: "تعليق صوتي لإعلان تجاري",
      description: "أداء صوتي احترافي لحملة إعلانية تلفزيونية كبرى",
      image: "https://images.unsplash.com/photo-1561446289-4112a4f79116?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2ljZSUyMHJlY29yZGluZyUyMHN0dWRpb3xlbnwxfHx8fDE3Nzc1NjQ4MjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "الإعلانات التجارية",
    },
    {
      title: "تعليق صوتي لفيديو توثيقي",
      description: "صوت واضح وجذاب لفيلم وثائقي عن التاريخ العربي",
      image: "https://images.unsplash.com/photo-1541592553160-82008b127ccb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx2b2ljZSUyMHJlY29yZGluZyUyMHN0dWRpb3xlbnwxfHx8fDE3Nzc1NjQ4MjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "الأفلام الوثائقية",
    },
  ];

  const services = [
    "التعليق الصوتي للإعلانات التجارية",
    "التعليق الصوتي للأفلام الوثائقية",
    "تسجيل الكتب الصوتية",
    "التعليق الصوتي للفيديوهات التعليمية",
    "التعليق الصوتي للألعاب والرسوم المتحركة",
    "الردود الصوتية وأنظمة IVR",
  ];

  const features = [
    {
      title: "استوديو احترافي",
      description: "معدات تسجيل عالية الجودة مع عزل صوتي كامل",
    },
    {
      title: "تنوع الأداء",
      description: "قدرة على تقديم أساليب صوتية متنوعة حسب المحتوى",
    },
    {
      title: "سرعة التسليم",
      description: "تسليم سريع مع إمكانية التعديل حسب ملاحظاتك",
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-red-900/20 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-red-600 rounded-full mb-6">
              <Mic className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              التعليق الصوتي
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              صوت احترافي يضيف الحياة لمحتواك. خبرة طويلة في التعليق الصوتي للإعلانات، الأفلام الوثائقية، والمحتوى التعليمي.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">ما أميز به</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-pink-500 transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500/20 rounded-full mb-4">
                  <Play className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">الخدمات الصوتية</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-pink-500 transition-all"
              >
                <CheckCircle className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                <p className="text-gray-200">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مشاريع صوتية مميزة</h2>
            <p className="text-gray-400 text-lg">نماذج من أعمالي في التعليق الصوتي</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-pink-500 transition-all hover:shadow-xl hover:shadow-pink-500/20"
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-pink-500/90 backdrop-blur-sm rounded-full text-sm font-semibold">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">هل تحتاج تعليق صوتي احترافي؟</h2>
          <p className="text-gray-400 text-lg mb-8">
            دعني أضيف صوتاً مميزاً يعزز رسالتك ويجذب جمهورك
          </p>
          <a
            href="mailto:info@example.com"
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg hover:from-pink-600 hover:to-red-700 transition-all font-semibold"
          >
            اطلب عينة صوتية
          </a>
        </div>
      </section>
    </div>
  );
}
