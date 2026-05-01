# هيكل المشروع - محفظة مصطفى

## البنية الأساسية

```
mustapha-portfolio/
│
├── 📁 src/
│   └── 📁 app/
│       │
│       ├── 📁 pages/                    # جميع صفحات الموقع
│       │   ├── 📁 home/                 # الصفحة الرئيسية
│       │   │   └── HomePage.tsx
│       │   │
│       │   ├── 📁 about/                # صفحة عني
│       │   │   └── AboutPage.tsx
│       │   │
│       │   ├── 📁 portfolio-design/     # محفظة التصميم الجرافيكي
│       │   │   └── PortfolioDesignPage.tsx
│       │   │
│       │   ├── 📁 portfolio-photography/# محفظة التصوير
│       │   │   └── PortfolioPhotographyPage.tsx
│       │   │
│       │   ├── 📁 portfolio-voice/      # محفظة التعليق الصوتي
│       │   │   └── PortfolioVoicePage.tsx
│       │   │
│       │   ├── 📁 courses/              # الدورات التدريبية
│       │   │   └── CoursesPage.tsx
│       │   │
│       │   └── 📁 not-found/            # صفحة 404
│       │       └── NotFoundPage.tsx
│       │
│       ├── 📁 shared/                   # مكونات مشتركة
│       │   ├── Layout.tsx               # التخطيط الأساسي
│       │   ├── Header.tsx               # القائمة العلوية
│       │   ├── Footer.tsx               # التذييل
│       │   └── ImageWithFallback.tsx    # مكون الصورة مع بديل
│       │
│       ├── 📁 components/               # مكونات UI
│       │   └── 📁 ui/                   # مكونات واجهة المستخدم
│       │
│       ├── App.tsx                      # المكون الرئيسي
│       └── routes.tsx                   # إعدادات التوجيه
│
└── 📁 public/                           # الملفات العامة
    └── 📁 images/                       # الصور والموارد
```

## وصف المجلدات

### 📁 pages/
يحتوي على جميع صفحات الموقع، كل صفحة في مجلد منفصل:
- **home**: الصفحة الرئيسية مع نبذة وعرض الخدمات والعملاء
- **about**: صفحة "عني" مع السيرة الذاتية والخبرات
- **portfolio-design**: محفظة أعمال التصميم الجرافيكي
- **portfolio-photography**: محفظة أعمال التصوير
- **portfolio-voice**: محفظة أعمال التعليق الصوتي
- **courses**: الدورات التدريبية في الإلقاء والخطابة والتعليق الصوتي
- **not-found**: صفحة الخطأ 404

### 📁 shared/
المكونات المشتركة المستخدمة في جميع الصفحات:
- **Layout.tsx**: التخطيط الأساسي (Header + Content + Footer)
- **Header.tsx**: القائمة العلوية مع الروابط
- **Footer.tsx**: التذييل مع معلومات التواصل
- **ImageWithFallback.tsx**: مكون عرض الصور مع معالجة الأخطاء

### 📁 components/ui/
مكونات واجهة المستخدم القابلة لإعادة الاستخدام (Radix UI + Tailwind)

## المسارات (Routes)

| المسار | الصفحة | الوصف |
|--------|--------|-------|
| `/` | HomePage | الصفحة الرئيسية |
| `/about` | AboutPage | عني |
| `/portfolio-design` | PortfolioDesignPage | التصميم الجرافيكي |
| `/portfolio-photography` | PortfolioPhotographyPage | التصوير |
| `/portfolio-voice` | PortfolioVoicePage | التعليق الصوتي |
| `/courses` | CoursesPage | الدورات التدريبية |
| `/*` | NotFoundPage | صفحة 404 |

## التقنيات المستخدمة

- **React 18** - مكتبة واجهة المستخدم
- **React Router 7** - التوجيه
- **Tailwind CSS 4** - التنسيق
- **TypeScript** - لغة البرمجة
- **Vite** - أداة البناء
- **Lucide React** - الأيقونات

## ملاحظات مهمة

1. جميع الصفحات تستخدم تصميم داكن (أسود) مع تدرجات ملونة
2. الموقع متجاوب بالكامل مع جميع أحجام الشاشات
3. يتم استخدام الصور من Unsplash كعينات (يمكن استبدالها بصور حقيقية)
4. جميع النصوص باللغة العربية مع دعم RTL
5. معلومات التواصل (البريد والهاتف) يمكن تحديثها في Footer.tsx
