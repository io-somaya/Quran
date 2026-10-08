const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'waqf-pages.json');

// Helper to load waqf pages
function loadWaqfPages() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
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
  res.json({ status: 'ok', name: 'قرءاني', timestamp: new Date().toISOString() });
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
    startSurah: parseInt(startSurah, 10) || 1,
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

// Fallback to index.html for SPA-style routing if needed
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ خادم قرءاني يعمل بنجاح على المنفذ: ${PORT}`);
  console.log(`🌐 الرابط المحلي: http://localhost:${PORT}`);
  console.log(`🌿 صفحة الوقف التجريبية: http://localhost:${PORT}/waqf/110887`);
});
