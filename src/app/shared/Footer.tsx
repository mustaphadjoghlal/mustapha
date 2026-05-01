import { Mail, Phone, Linkedin, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              مصطفى المحترف
            </h3>
            <p className="text-gray-400">
              خبير في التصميم الجرافيكي، التصوير، التعليق الصوتي، والتدريب على الإلقاء والخطابة
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">تواصل معي</h4>
            <div className="space-y-3 text-gray-400">
              <a href="mailto:info@example.com" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Mail size={18} />
                <span>info@example.com</span>
              </a>
              <a href="tel:+966123456789" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Phone size={18} />
                <span dir="ltr">+966 12 345 6789</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">تابعني</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة - مصطفى المحترف</p>
        </div>
      </div>
    </footer>
  );
}
