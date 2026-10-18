const express = require('express');
const path = require('path');
const fs = require('fs');
const webpush = require('web-push');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'waqf-pages.json');
const VAPID_FILE = path.join(__dirname, 'data', 'vapid-keys.json');
const SUBSCRIBERS_FILE = path.join(__dirname, 'data', 'subscribers.json');

// Helper to get or create VAPID keys
function getOrCreateVapidKeys() {
  try {
    const dir = path.dirname(VAPID_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(VAPID_FILE)) {
      const data = fs.readFileSync(VAPID_FILE, 'utf8');
      const keys = JSON.parse(data || '{}');
      if (keys.publicKey && keys.privateKey) {
        return keys;
      }
    }
  } catch (err) {
    console.error('خطأ في قراءة ملف VAPID، سيتم إنشاء مفاتيح جديدة:', err);
  }

  const newKeys = webpush.generateVAPIDKeys();
  try {
    fs.writeFileSync(VAPID_FILE, JSON.stringify(newKeys, null, 2), 'utf8');
  } catch (err) {
    console.error('خطأ في حفظ مفاتيح VAPID:', err);
  }
  return newKeys;
}

const vapidKeys = getOrCreateVapidKeys();
webpush.setVapidDetails(
  'mailto:contact@qurani.app',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Helper to load subscribers
function loadSubscribers() {
  try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('خطأ في قراءة ملف المشتركين:', err);
    return [];
  }
}

// Helper to save subscribers
function saveSubscribers(subscribers) {
  try {
    const dir = path.dirname(SUBSCRIBERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('خطأ في حفظ ملف المشتركين:', err);
    return false;
  }
}

// Helper to load waqf pages
function loadWaqfPages() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    let pages = JSON.parse(data || '[]');
    // تنظيف فوري لأي صفحة تالفة أو تحتوي علامات استفهام
    const cleaned = pages.filter(p => p && p.name && !p.name.includes('???') && String(p.id) !== '110892');
    if (cleaned.length !== pages.length) {
      saveWaqfPages(cleaned);
    }
    return cleaned;
  } catch (err) {
    console.error('خطأ في قراءة ملف صفحات الوقف:', err);
    return [];
  }
}

// Helper to save waqf pages
function saveWaqfPages(pages) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(pages, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('خطأ في حفظ ملف صفحات الوقف:', err);
    return false;
  }
}

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'الأنس بالقرآن', timestamp: new Date().toISOString() });
});

// API: جلب كل صفحات الوقف مع البحث والترتيب
app.get('/api/waqf', (req, res) => {
  const pages = loadWaqfPages();
  const { q, sort, category } = req.query;
  
  let result = [...pages];

  // البحث بالاسم أو الدعاء
  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    result = result.filter(p => 
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.prayerText && p.prayerText.toLowerCase().includes(query)) ||
      (p.creatorName && p.creatorName.toLowerCase().includes(query))
    );
  }

  // التصفية
  if (category === 'deceased') {
    result = result.filter(p => p.prayerText && p.prayerText.includes('رحم'));
  } else if (category === 'living') {
    result = result.filter(p => p.prayerText && (p.prayerText.includes('حفظ') || p.prayerText.includes('شفا')));
  }

  // الترتيب
  if (sort === 'visits') {
    result.sort((a, b) => (b.visits || 0) - (a.visits || 0));
  } else if (sort === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    // الأحدث افتراضياً
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({
    status: 'success',
    total: result.length,
    pages: result
  });
});

// API: جلب صفحة وقف معينة بالمعرف وزيادة العداد
app.get('/api/waqf/:id', (req, res) => {
  const { id } = req.params;
  const pages = loadWaqfPages();
  const pageIndex = pages.findIndex(p => String(p.id) === String(id));

  if (pageIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'صفحة الوقف غير موجودة أو تم حذفها'
    });
  }

  // زيادة عداد الزيارات
  pages[pageIndex].visits = (pages[pageIndex].visits || 0) + 1;
  saveWaqfPages(pages);

  // إيجاد المعرف التالي والسابق للتنقل السلس
  const prevPage = pageIndex > 0 ? pages[pageIndex - 1] : pages[pages.length - 1];
  const nextPage = pageIndex < pages.length - 1 ? pages[pageIndex + 1] : pages[0];

  res.json({
    status: 'success',
    page: pages[pageIndex],
    navigation: {
      prevId: prevPage ? prevPage.id : null,
      nextId: nextPage ? nextPage.id : null
    }
  });
});

// API: إنشاء صفحة وقف جديدة
app.post('/api/waqf', (req, res) => {
  const { name, prayerText, reciterId, reciterName, startSurah, country, creatorName, phone, email } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'الرجاء إدخال اسم صاحب الوقف'
    });
  }

  const pages = loadWaqfPages();

  // توليد معرف رقمي تسلسلي أو مميز مكون من 6 خانات
  let newId;
  const existingIds = new Set(pages.map(p => String(p.id)));
  
  // محاولة معرف تسلسلي يبدأ من 110887 فصاعداً
  let candidate = 110892;
  while (existingIds.has(String(candidate))) {
    candidate++;
  }
  newId = String(candidate);

  const newWaqf = {
    id: newId,
    name: name.trim(),
    prayerText: (prayerText && prayerText.trim()) || 'رحمه الله تعالى',
    reciterId: reciterId || 'ar.alafasy',
    reciterName: reciterName || 'الشيخ مشاري راشد العفاسي',
    startSurah: 1, // الوقف دائماً للقرآن الكريم كاملاً بدءاً من الفاتحة
    scope: 'full_quran',
    country: country || 'السعودية',
    creatorName: (creatorName && creatorName.trim()) || 'فاعل خير',
    phone: phone || '',
    email: email || '',
    visits: 1,
    createdAt: new Date().toISOString()
  };

  pages.unshift(newWaqf);
  saveWaqfPages(pages);

  res.status(201).json({
    status: 'success',
    message: 'تم إنشاء صفحة الوقف بنجاح',
    page: newWaqf
  });
});

// API: الإبلاغ عن مشكلة أو طلب تعديل
app.post('/api/waqf/:id/report', (req, res) => {
  const { id } = req.params;
  const { reportType, details, contact } = req.body;

  console.log(`[Waqf Report] Page #${id}: ${reportType} - Details: ${details} - Contact: ${contact}`);

  res.json({
    status: 'success',
    message: 'تم استلام بلاغك بنجاح، جزاك الله خيراً'
  });
});

// API: حذف صفحة وقف
app.delete('/api/waqf/:id', (req, res) => {
  const { id } = req.params;
  let pages = loadWaqfPages();
  const initLen = pages.length;
  pages = pages.filter(p => String(p.id) !== String(id));
  if (pages.length !== initLen) {
    saveWaqfPages(pages);
    return res.json({ status: 'success', message: 'تم حذف صفحة الوقف بنجاح' });
  }
  res.status(404).json({ status: 'error', message: 'صفحة الوقف غير موجودة' });
});

// مسارات العرض المباشر لصفحات الوقف
// 1. مسار /waqf/:id
app.get('/waqf/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'waqf.html'));
});

// 2. مسار /ar/:id المطابق لرابط waqfpage.sa الأصلي تماماً
app.get('/ar/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'waqf.html'));
});

// 3. مسار /waqf العام
app.get('/waqf', (req, res) => {
  // إذا تم تمرير ?id=110887 اعرض صفحة الوقف
  if (req.query.id) {
    return res.sendFile(path.join(__dirname, 'public', 'waqf.html'));
  }
  // وإلا فالمجمع في الصفحة الرئيسية
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// ==========================================
// مسارات الإشعارات اليومية وحسابات المشتركين
// ==========================================

// 1. جلب المفتاح العام لـ VAPID
app.get('/api/notifications/vapid-public-key', (req, res) => {
  res.json({
    status: 'success',
    publicKey: vapidKeys.publicKey
  });
});

// 2. إنشاء حساب وتفعيل الإشعارات للمستخدم (الاسم + الهاتف + الإيميل)
app.post('/api/notifications/register', async (req, res) => {
  try {
    const { name, phone, email, reminderTime, timeZone, planId, customPagesPerDay, currentPage, subscription } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ status: 'error', message: 'الرجاء إدخال الاسم الكريم' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ status: 'error', message: 'الرجاء إدخال رقم الهاتف للتواصل' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ status: 'error', message: 'الرجاء إدخال بريد إلكتروني صحيح' });
    }
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ status: 'error', message: 'تعذر الاشتراك في خدمة إشعارات المتصفح، يرجى السماح بالإشعارات في المتصفح' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const selectedReminderTime = reminderTime || '06:00';
    const userTimeZone = timeZone || 'Africa/Cairo';

    const subscribers = loadSubscribers();
    const existingIndex = subscribers.findIndex(s => 
      (s.email && s.email.toLowerCase() === cleanEmail) || 
      (s.phone && s.phone === cleanPhone) ||
      (s.subscription && s.subscription.endpoint === subscription.endpoint)
    );

    const subscriberData = {
      id: existingIndex !== -1 ? subscribers[existingIndex].id : 'sub_' + Date.now(),
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      reminderTime: selectedReminderTime,
      timeZone: userTimeZone,
      planId: planId || 'furqan',
      customPagesPerDay: Number(customPagesPerDay) || 10,
      currentPage: Number(currentPage) || 1,
      subscription: subscription,
      createdAt: existingIndex !== -1 ? subscribers[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastNotifiedDate: existingIndex !== -1 ? subscribers[existingIndex].lastNotifiedDate : null
    };

    if (existingIndex !== -1) {
      subscribers[existingIndex] = subscriberData;
    } else {
      subscribers.push(subscriberData);
    }

    saveSubscribers(subscribers);

    // إرسال إشعار ترحيبي فوري لتأكيد النجاح للمستخدم على جهازه
    try {
      const welcomePayload = JSON.stringify({
        title: `مرحباً بك يا ${cleanName} في الأنس بالقرآن 🌸`,
        body: `تم إنشاء حسابك وتفعيل إشعارات الورد اليومي بنجاح! سيصلك تذكيرك يومياً في تمام الساعة ${selectedReminderTime} بإذن الله.`,
        icon: '/assets/icons/icon-192.svg',
        badge: '/assets/icons/icon-192.svg',
        url: '/#home'
      });
      await webpush.sendNotification(subscription, welcomePayload);
    } catch (pushErr) {
      console.warn('تنبيه: تعذر إرسال الإشعار الترحيبي الأولي (ربما وضع عدم الإزعاج مفعل):', pushErr.message);
    }

    res.json({
      status: 'success',
      message: 'تم إنشاء حسابك وتفعيل الإشعارات اليومية بنجاح! تم إرسال إشعار ترحيبي لجهازك 🌸',
      user: {
        id: subscriberData.id,
        name: subscriberData.name,
        phone: subscriberData.phone,
        email: subscriberData.email,
        reminderTime: subscriberData.reminderTime,
        planId: subscriberData.planId,
        currentPage: subscriberData.currentPage
      }
    });
  } catch (err) {
    console.error('خطأ في تسجيل المشترك:', err);
    res.status(500).json({ status: 'error', message: 'حدث خطأ أثناء حفظ الحساب، يرجى المحاولة لاحقاً' });
  }
});

// 3. مسار إرسال إشعار تجريبي فوري (Test Push)
app.post('/api/notifications/test-send', async (req, res) => {
  try {
    const { subscription, name } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ status: 'error', message: 'بيانات اشتراك الإشعار غير متوفرة' });
    }

    const testPayload = JSON.stringify({
      title: '🌸 تجربة إشعار الأنس بالقرآن',
      body: `مرحباً يا ${name || 'أخي / أختي'}! الإشعارات تعمل بكفاءة على جهازك ووردك اليومي في انتظارك 📖`,
      icon: '/assets/icons/icon-192.svg',
      badge: '/assets/icons/icon-192.svg',
      url: '/#home'
    });

    await webpush.sendNotification(subscription, testPayload);

    res.json({
      status: 'success',
      message: 'تم إرسال الإشعار التجريبي لجهازك بنجاح! تفقد شريط إشعاراتك الآن 🔔'
    });
  } catch (err) {
    console.error('خطأ في إرسال الإشعار التجريبي:', err);
    res.status(500).json({
      status: 'error',
      message: 'تعذر إرسال الإشعار التجريبي: ' + (err.message || 'خطأ غير متوقع')
    });
  }
});

// 4. مسار جلب بيانات المشترك وحالة الإشعارات
app.get('/api/notifications/user', (req, res) => {
  const { email, phone } = req.query;
  const subscribers = loadSubscribers();

  const user = subscribers.find(s => 
    (email && s.email && s.email.toLowerCase() === email.trim().toLowerCase()) ||
    (phone && s.phone && s.phone === phone.trim())
  );

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'المستخدم غير مسجل' });
  }

  res.json({
    status: 'success',
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      reminderTime: user.reminderTime,
      planId: user.planId,
      currentPage: user.currentPage,
      hasActiveSubscription: Boolean(user.subscription && user.subscription.endpoint)
    }
  });
});

// 5. مسار تحديث الصفحة الحالية للورد للمشترك
app.post('/api/notifications/update-page', (req, res) => {
  const { email, phone, currentPage } = req.body;
  if (!currentPage) {
    return res.status(400).json({ status: 'error', message: 'رقم الصفحة مطلوب' });
  }

  const subscribers = loadSubscribers();
  const index = subscribers.findIndex(s => 
    (email && s.email && s.email.toLowerCase() === email.trim().toLowerCase()) ||
    (phone && s.phone && s.phone === phone.trim())
  );

  if (index !== -1) {
    subscribers[index].currentPage = Number(currentPage);
    subscribers[index].updatedAt = new Date().toISOString();
    saveSubscribers(subscribers);
    return res.json({ status: 'success', message: 'تم تحديث صفحة الورد بنجاح' });
  }

  res.status(404).json({ status: 'error', message: 'المشترك غير موجود' });
});

// ==========================================
// مجدول إرسال الإشعارات اليومية التلقائية
// ==========================================
function getPlanPages(planId, customPages) {
  switch (planId) {
    case 'safa': return 2;
    case 'noor': return 4;
    case 'furqan': return 10;
    case 'hidayah': return 20;
    case 'custom': return Number(customPages) || 5;
    default: return 10;
  }
}

async function checkAndSendDailyReminders() {
  try {
    const subscribers = loadSubscribers();
    if (!subscribers.length) return;

    let hasChanges = false;
    const nowUtc = new Date();

    for (let i = 0; i < subscribers.length; i++) {
      const sub = subscribers[i];
      if (!sub.subscription || !sub.subscription.endpoint) continue;

      const userTimeZone = sub.timeZone || 'Africa/Cairo';
      let currentTimeStr = '';
      let currentDateStr = '';

      try {
        const timeFormatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: userTimeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        currentTimeStr = timeFormatter.format(nowUtc);

        const dateFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: userTimeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        currentDateStr = dateFormatter.format(nowUtc);
      } catch (tzErr) {
        currentTimeStr = String(nowUtc.getHours()).padStart(2, '0') + ':' + String(nowUtc.getMinutes()).padStart(2, '0');
        currentDateStr = nowUtc.toISOString().split('T')[0];
      }

      // التحقق: هل حان وقت التذكير المحدد ولم يرسل اليوم بعد؟
      if (sub.reminderTime === currentTimeStr && sub.lastNotifiedDate !== currentDateStr) {
        const pagesCount = getPlanPages(sub.planId, sub.customPagesPerDay);
        const startPage = sub.currentPage || 1;
        const endPage = Math.min(604, startPage + pagesCount - 1);

        const payload = JSON.stringify({
          title: `📖 وردك القرآني اليومي يا ${sub.name}`,
          body: `السلام عليكم ورحمة الله 🌸 حان موعد وردك اليومي المبارك (من صفحة ${startPage} إلى ${endPage}). افتح المصحف للبدء ونيل البركة.`,
          icon: '/assets/icons/icon-192.svg',
          badge: '/assets/icons/icon-192.svg',
          url: `/#page=${startPage}`
        });

        console.log(`[Push Notification] إرسال إشعار الورد اليومي إلى: ${sub.name} (${sub.email}) - الوقت: ${currentTimeStr}`);

        try {
          await webpush.sendNotification(sub.subscription, payload);
          sub.lastNotifiedDate = currentDateStr;
          hasChanges = true;
        } catch (pushError) {
          console.error(`[Push Notification Error] فشل الإرسال إلى ${sub.name}:`, pushError.message);
          // إذا كان الاشتراك منتهي الصلاحية أو تم إلغاؤه (410 Gone أو 404 Not Found)
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            console.log(`[Push Notification] إزالة اشتراك منتهي الصلاحية للمستخدم: ${sub.name}`);
            sub.subscription = null;
            hasChanges = true;
          }
        }
      }
    }

    if (hasChanges) {
      saveSubscribers(subscribers);
    }
  } catch (err) {
    console.error('خطأ في مجدول الإشعارات:', err);
  }
}

// تشغيل الفحص كل دقيقة لمطابقة توقيت التذكير
setInterval(checkAndSendDailyReminders, 60 * 1000);

// Fallback to index.html for SPA-style routing if needed
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ خادم «الأنس بالقرآن» يعمل بنجاح على المنفذ: ${PORT}`);
  console.log(`🌐 الرابط المحلي: http://localhost:${PORT}`);
  console.log(`🌿 صفحة الوقف التجريبية: http://localhost:${PORT}/waqf/110887`);
});
