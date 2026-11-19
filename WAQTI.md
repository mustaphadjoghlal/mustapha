# ربط تطبيق «وقتي» بالموقع

تطبيق وقتي (أندرويد) يستخدم مشروع Firebase الخاص بالموقع (`mustapha-portfolio`) لشيئين:

1. **خزنة احتياطية**: يرفع بيانات التطبيق وملفات بنك الميديا إلى Cloud Storage تحت `waqti/<uid>/`
   - `data/*.json` بيانات التطبيق (المهام، العملاء، الميزانية، فهرس بنك الميديا، صور القوالب)
   - `vault/<id>/<اسم الملف>` ملفات بنك الميديا
   - `history/<YYYY-MM-DD>/` نسخة يومية من `state.json` و`vault.json`
2. **إدارة محتوى الموقع**: يقرأ ويكتب مجموعات Firestore نفسها التي تستخدمها لوحة `/admin`.

الدخول في التطبيق بنفس بريد وكلمة مرور لوحة التحكم. يمكن تصفّح النسخة وتنزيلها من `/admin` ← تبويب «وقتي».

## المطلوب في Firebase Console (مرة واحدة)

### 1) خطة Blaze
Cloud Storage يتطلب خطة Blaze (الدفع حسب الاستخدام، مع حصة مجانية). ضع تنبيه ميزانية منخفضاً من Google Cloud Billing.

### 2) قواعد Storage (مُطبّقة في 20 نوفمبر 2026)
القاعدة العامة القديمة كانت تسمح للجميع بقراءة كل الملفات، فاستُثني منها مجلد `waqti`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /waqti/{uid}/{allPaths=**} { allow read, write: if request.auth != null && request.auth.uid == uid; }
    match /{folder}/{allPaths=**} {
      allow read: if folder != 'waqti';
      allow write: if request.auth != null && folder != 'waqti';
    }
  }
}
```

### 3) قواعد Firestore
لا تغيير مطلوب إذا كانت الكتابة مسموحة للمستخدم المسجّل (`request.auth != null`) كما في لوحة التحكم.

### 4) (مستحسن) إيقاف إنشاء حسابات جديدة
Authentication ← Settings ← User actions: ألغِ «Enable create (sign-up)». بهذا لا يستطيع أحد غيرك إنشاء حساب في مشروعك، لأن قواعد الكتابة تعتمد على «أي مستخدم مسجّل».
