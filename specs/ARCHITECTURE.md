# وثيقة البنية التقنية والنشر — «قرءاني» (Technical Architecture & Deployment)

## 1. المعمارية العامة للتقنيات (Tech Stack)
- **الواجهة الأمامية (Frontend):**
  - **Bootstrap 5.3 RTL:** الهيكل الأساسي، الشبكة المتجاوبة، الـ Modals، الـ Dropdowns، الـ Offcanvas، والمتغيرات اللونية.
  - **Bootstrap Icons & SVG Assets:** أيقونات خفيفة ونقية بدون أي ثقل في التحميل.
  - **خطوط Google Fonts:** Amiri, Amiri Quran, Cairo.
  - **JavaScript (Vanilla Modern ES6+):** هيكلية تفاعلية معيارية، بدون تعقيدات بناء (Zero-build latency)، تدعم التخزين المحلي (LocalStorage)، واستدعاء واجهات البرمجة (APIs)، وإدارة المشغل الصوتي وتوليد روابط واتساب.
- **الخادم الخلفي (Backend & Static Server):**
  - **Node.js + Express:** خادم ويب خفيف جداً ومستقر، يقوم بتقديم الملفات الثابتة وتوفير نقاط نهاية API تجريبية وإمكانية توسيعها مستقبلاً (للإشعارات وقواعد البيانات).
- **الاستضافة والنشر (Deployment):**
  - **Railway.app:** سيتم نشر التطبيق مباشرة عبر Railway CLI، وتوفير رابط دائم ونشط مع شهادة SSL مجانية.

---

## 2. هيكل المجلدات والملفات (Directory Structure)
```
l:/work/Quran/
├── specs/
│   ├── PRD.md                 # متطلبات المنتج والميزات
│   ├── DESIGN_SYSTEM.md       # نظام التصميم والألوان والخطوط
│   ├── ARCHITECTURE.md        # البنية التقنية والنشر
│   └── TASKS.md               # خطة العمل وتوزيع المهام
├── public/
│   ├── index.html             # الصفحة الرئيسية والواجهة المتكاملة
│   ├── css/
│   │   ├── style.css          # التخصيصات الإسلامية والأنماط الفاخرة
│   │   └── quran-font.css     # تهيئة الخطوط والزخارف
│   ├── js/
│   │   ├── quran-data.js      # بيانات السور (114 سورة) والأجزاء والصفحات
│   │   ├── adhkar-data.js     # قاعدة بيانات الأذكار النبوية الموثقة
│   │   ├── wird-engine.js     # محرك حساب الورد والخطط ونسب الإنجاز
│   │   ├── whatsapp-engine.js # محرك صياغة وتوليد رسائل وتنبيهات واتساب
│   │   ├── audio-player.js    # مشغل التلاوات الصوتية لكبار القراء
│   │   └── app.js             # منطق التطبيق والتفاعل وإدارة المستخدمين
│   └── assets/
│       ├── patterns/          # نقوش إسلامية وزخارف SVG
│       └── icons/             # أيقونات التطبيق
├── server.js                  # خادم Express لتشغيل التطبيق ونشره
├── package.json               # إعدادات المشروع والاعتماديات
└── railway.json               # إعدادات نشر Railway
```

---

## 3. خطة النشر على Railway (Railway Deployment Strategy)
1. إنشاء `package.json` مع خادم Express خفيف وسريع.
2. تهيئة منفذ الخادم `process.env.PORT || 3000` ليعمل بسلاسة على بيئة Railway الإنتاجية.
3. تشغيل `railway init --name qurani` لربط المجلد بمشروع جديد في حساب المستخدم (`info@ecis-edu.com`).
4. رفع الكود عبر `railway up`.
5. توليد نطاق مباشر عبر `railway domain` ليتمكن المستخدم من فتح الموقع ومشاركته فوراً.
