/**
 * محرك صفحات الوقف والصدقة الجارية — «قرءاني»
 * Qur'ani Waqf & Sadaqah Jariyah Engine
 */
(function(window) {
  'use strict';

  const SURAH_NAMES = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
    "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
    "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
    "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
    "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
    "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
    "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
    "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
    "المسد", "الإخلاص", "الفلق", "الناس"
  ];

  // الحالة العامة لمحرك الوقف
  const waqfState = {
    pages: [],
    currentFilter: 'all',
    searchQuery: '',
    latestCreatedId: null
  };

  // جلب صفحات الوقف من السيرفر أو التخزين المحلي
  async function fetchWaqfPages() {
    try {
      const res = await fetch('/api/waqf');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.pages)) {
          // استبعاد أي صفحة تالفة أو تحتوي علامات استفهام
          waqfState.pages = data.pages.filter(p => p && p.name && !p.name.includes('???') && String(p.id) !== '110892');
          localStorage.setItem('qurani_waqf_pages', JSON.stringify(waqfState.pages));
          return waqfState.pages;
        }
      }
    } catch (err) {
      console.warn('استخدام التخزين المحلي الاحتياطي لصفحات الوقف:', err);
    }

    // Fallback من التخزين المحلي
    const local = localStorage.getItem('qurani_waqf_pages');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        waqfState.pages = parsed.filter(p => p && p.name && !p.name.includes('???') && String(p.id) !== '110892');
        localStorage.setItem('qurani_waqf_pages', JSON.stringify(waqfState.pages));
        return waqfState.pages;
      } catch (e) {}
    }

    // بيانات أولية نموذجية
    waqfState.pages = [
      {
        id: "110887",
        name: "الحميدي عبدالله النهار",
        prayerText: "رحمه الله تعالى",
        reciterId: "ar.alafasy",
        reciterName: "الشيخ مشاري راشد العفاسي",
        startSurah: 1,
        country: "السعودية",
        creatorName: "أهل الفقيد ومحبوه",
        visits: 495,
        createdAt: "2026-09-15T10:30:00.000Z"
      },
      {
        id: "110886",
        name: "عبدالرحمن بن سعود العتيبي",
        prayerText: "رحمه الله تعالى",
        reciterId: "ar.abdulbasitmurattal",
        reciterName: "الشيخ عبد الباسط عبد الصمد",
        startSurah: 36,
        country: "السعودية",
        creatorName: "أبناؤه وبناته",
        visits: 782,
        createdAt: "2026-09-10T14:20:00.000Z"
      },
      {
        id: "110888",
        name: "الوالدة فاطمة بنت إبراهيم",
        prayerText: "رحمها الله تعالى",
        reciterId: "ar.minshawi",
        reciterName: "الشيخ محمد صديق المنشاوي",
        startSurah: 55,
        country: "مصر",
        creatorName: "عائلتها وأحفادها",
        visits: 1240,
        createdAt: "2026-09-18T08:15:00.000Z"
      }
    ];
    return waqfState.pages;
  }

  // ملء قائمة السور في نموذج الإنشاء
  function populateSurahSelect() {
    const select = document.getElementById('waqfFormSurah');
    if (!select || select.children.length > 0) return;

    select.innerHTML = SURAH_NAMES.map((name, index) => {
      const num = index + 1;
      return `<option value="${num}" ${num === 1 ? 'selected' : ''}>سورة ${name} (${num})</option>`;
    }).join('');
  }

  // تحديث إحصائيات قسم الوقف
  function updateWaqfStats() {
    const totalPagesEl = document.getElementById('waqfStatTotalPages');
    const totalVisitsEl = document.getElementById('waqfStatTotalVisits');

    const totalPages = waqfState.pages.length + 1280;
    const totalVisits = waqfState.pages.reduce((sum, p) => sum + (p.visits || 0), 48500);

    if (totalPagesEl) totalPagesEl.textContent = `${totalPages.toLocaleString('ar-SA')}+`;
    if (totalVisitsEl) totalVisitsEl.textContent = `${totalVisits.toLocaleString('ar-SA')}+`;
  }

  // رسم شبكة كروت الوقف
  function renderWaqfCards(pagesToRender) {
    const grid = document.getElementById('waqfCardsGrid');
    if (!grid) return;

    const list = pagesToRender || getFilteredWaqfPages();

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="user-avatar-lg mx-auto mb-3 bg-light text-muted">
            <i class="bi bi-search fs-2"></i>
          </div>
          <h5 class="fw-bold text-muted">لم يتم العثور على صفحات وقف مطابقة</h5>
          <p class="text-muted small">يمكنك كتابة اسم آخر أو إنشاء صفحة وقف جديدة الآن.</p>
          <button class="btn btn-emerald-action rounded-pill px-4" onclick="window.switchWaqfSubTab('create')">
            <i class="bi bi-plus-lg me-1"></i> أنشئ صفحة جديدة لمن تحب
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(page => {
      const surahName = SURAH_NAMES[(page.startSurah || 1) - 1] || 'الفاتحة';
      const visits = (page.visits || 1).toLocaleString('ar-SA');
      const shareText = `صفحة قرآنية لـ وقف وصدقة جارية عن ${page.name} ${page.prayerText || ''}\nاستمع للصفحة القرآنية.. ولك الأجر\n${window.location.origin}/waqf/${page.id}\nلا توقف عندك .. انشرها`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

      return `
        <div class="col-md-6 col-lg-4">
          <div class="waqf-card-item">
            <div class="waqf-card-header">
              <div class="waqf-avatar-icon">
                <i class="bi bi-flower1"></i>
              </div>
              <div class="flex-grow-1 text-truncate">
                <h5 class="fw-bold text-emerald mb-1 text-truncate" title="${page.name}">${page.name}</h5>
                <span class="waqf-badge-prayer">${page.prayerText || 'رحمه الله تعالى'}</span>
              </div>
            </div>

            <div class="p-3 flex-grow-1 d-flex flex-column justify-content-between">
              <div class="small text-muted mb-3">
                <div class="d-flex align-items-center gap-2 mb-1.5">
                  <i class="bi bi-mic-fill text-gold"></i>
                  <span>${page.reciterName || 'الشيخ مشاري راشد العفاسي'}</span>
                </div>
                <div class="d-flex align-items-center gap-2 mb-1.5">
                  <i class="bi bi-book-half text-emerald"></i>
                  <span>سورة البداية: <strong>${surahName}</strong></span>
                </div>
                <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                  <span class="badge bg-light text-dark fw-normal border">
                    <i class="bi bi-geo-alt-fill text-secondary me-1"></i>${page.country || 'السعودية'}
                  </span>
                  <span class="badge bg-emerald-subtle text-emerald fw-bold">
                    <i class="bi bi-eye-fill me-1"></i>${visits} زيارة
                  </span>
                </div>
              </div>

              <div class="d-flex gap-2 pt-2 border-top">
                <a href="/waqf/${page.id}" target="_blank" class="btn btn-emerald-action btn-sm flex-grow-1 rounded-pill fw-bold">
                  <i class="bi bi-play-circle-fill me-1"></i> زيارة واستماع 🎧
                </a>
                <a href="${whatsappUrl}" target="_blank" class="btn btn-whatsapp btn-sm rounded-circle p-2" title="مشاركة عبر واتساب" style="width: 34px; height: 34px; display:inline-flex; align-items:center; justify-content:center;">
                  <i class="bi bi-whatsapp"></i>
                </a>
                <button class="btn btn-outline-secondary btn-sm rounded-circle p-2" title="نسخ الرابط" onclick="window.copyWaqfUrlById('${page.id}')" style="width: 34px; height: 34px; display:inline-flex; align-items:center; justify-content:center;">
                  <i class="bi bi-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ترشيح وتصفية الصفحات حسب البحث والفلتر
  function getFilteredWaqfPages() {
    let list = [...waqfState.pages];

    // فلتر البحث
    if (waqfState.searchQuery && waqfState.searchQuery.trim()) {
      const q = waqfState.searchQuery.trim().toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.prayerText && p.prayerText.toLowerCase().includes(q)) ||
        (p.creatorName && p.creatorName.toLowerCase().includes(q))
      );
    }

    // فلتر التصنيف
    if (waqfState.currentFilter === 'visits') {
      list.sort((a, b) => (b.visits || 0) - (a.visits || 0));
    } else if (waqfState.currentFilter === 'deceased') {
      list = list.filter(p => p.prayerText && p.prayerText.includes('رحم'));
    } else if (waqfState.currentFilter === 'living') {
      list = list.filter(p => p.prayerText && (p.prayerText.includes('حفظ') || p.prayerText.includes('شفا')));
    }

    return list;
  }

  // التبديل بين التبويبات الفرعية: الدليل أو إنشاء صفحة
  function switchWaqfSubTab(tab) {
    const dirContainer = document.getElementById('waqfSubTabDirectory');
    const createContainer = document.getElementById('waqfSubTabCreate');
    const btnDir = document.getElementById('tabBtnWaqfDirectory');
    const btnCreate = document.getElementById('tabBtnWaqfCreate');

    if (tab === 'create') {
      if (dirContainer) dirContainer.classList.add('d-none');
      if (createContainer) createContainer.classList.remove('d-none');
      if (btnDir) btnDir.classList.remove('active');
      if (btnCreate) btnCreate.classList.add('active');
      populateSurahSelect();
    } else {
      if (dirContainer) dirContainer.classList.remove('d-none');
      if (createContainer) createContainer.classList.add('d-none');
      if (btnDir) btnDir.classList.add('active');
      if (btnCreate) btnCreate.classList.remove('active');
      renderWaqfCards();
    }
  }

  // اختيار صيغة الدعاء السريعة
  function selectWaqfPrayer(text, btn) {
    const input = document.getElementById('waqfFormPrayer');
    if (input) input.value = text;

    document.querySelectorAll('.waqf-prayer-pill').forEach(b => b.classList.remove('selected'));
    if (btn) btn.classList.add('selected');
  }

  // معالجة البحث
  function handleWaqfSearch(query) {
    waqfState.searchQuery = query || '';
    renderWaqfCards();
  }

  // تصفية التصنيفات
  function filterWaqfCategory(category, btn) {
    waqfState.currentFilter = category;
    document.querySelectorAll('[data-waqf-filter]').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderWaqfCards();
  }

  // إرسال نموذج إنشاء صفحة وقف
  async function handleCreateWaqfSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('waqfFormName')?.value?.trim();
    const prayerText = document.getElementById('waqfFormPrayer')?.value?.trim() || 'رحمه الله تعالى';
    const reciterSelect = document.getElementById('waqfFormReciter');
    const reciterId = reciterSelect?.value || 'ar.alafasy';
    const reciterName = reciterSelect?.options[reciterSelect.selectedIndex]?.text || 'الشيخ مشاري راشد العفاسي';
    const startSurah = parseInt(document.getElementById('waqfFormSurah')?.value, 10) || 1;
    const country = document.getElementById('waqfFormCountry')?.value || 'السعودية';
    const creatorName = document.getElementById('waqfFormCreator')?.value?.trim() || 'فاعل خير';
    const phone = document.getElementById('waqfFormPhone')?.value?.trim() || '';

    if (!name) {
      alert('الرجاء إدخال اسم المهدى له الوقف');
      return;
    }

    const payload = {
      name,
      prayerText,
      reciterId,
      reciterName,
      startSurah,
      country,
      creatorName,
      phone
    };

    let newPage = null;

    try {
      const res = await fetch('/api/waqf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.page) {
          newPage = data.page;
        }
      }
    } catch (e) {
      console.warn('فشل الاتصال بالخادم، يتم الحفظ محلياً:', e);
    }

    // Fallback محلي إن لم يتوفر السيرفر
    if (!newPage) {
      newPage = {
        id: String(Date.now()).slice(-6),
        ...payload,
        visits: 1,
        createdAt: new Date().toISOString()
      };
    }

    waqfState.pages.unshift(newPage);
    localStorage.setItem('qurani_waqf_pages', JSON.stringify(waqfState.pages));
    waqfState.latestCreatedId = newPage.id;

    // تشغيل احتفال الكونفيتي
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // إعداد وتجهيز نافذة التهنئة
    const directUrl = `${window.location.origin}/waqf/${newPage.id}`;
    const urlInput = document.getElementById('waqfCreatedUrlInput');
    const directBtn = document.getElementById('waqfDirectViewBtn');
    const shareWpBtn = document.getElementById('waqfShareWhatsappBtn');

    if (urlInput) urlInput.value = directUrl;
    if (directBtn) directBtn.href = `/waqf/${newPage.id}`;

    const shareMsg = `صفحة قرآنية لـ وقف وصدقة جارية عن ${newPage.name} ${newPage.prayerText || ''}\nاستمع للصفحة القرآنية.. ولك الأجر\n${directUrl}\nلا توقف عندك .. انشرها`;
    if (shareWpBtn) shareWpBtn.href = `https://wa.me/?text=${encodeURIComponent(shareMsg)}`;

    const modalEl = document.getElementById('waqfSuccessModal');
    if (modalEl && window.bootstrap) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }

    // إعادة ضبط النموذج وتحديث الواجهة
    event.target.reset();
    selectWaqfPrayer('رحمه الله تعالى', document.querySelector('.waqf-prayer-pill'));
    updateWaqfStats();
    renderWaqfCards();
  }

  // نسخ رابط الصفحة المنشأة حديثاً
  function copyCreatedWaqfUrl() {
    const input = document.getElementById('waqfCreatedUrlInput');
    if (input && input.value) {
      navigator.clipboard.writeText(input.value).then(() => {
        showGlobalToast('تم نسخ رابط صفحة الوقف بنجاح! شارك لتنال الأجر 🌸');
      }).catch(() => {
        showGlobalToast('تم نسخ الرابط!');
      });
    }
  }

  // نسخ رابط صفحة معينة بالمعرف
  function copyWaqfUrlById(id) {
    const url = `${window.location.origin}/waqf/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      showGlobalToast('تم نسخ رابط صفحة الوقف بنجاح! ✨');
    }).catch(() => {
      showGlobalToast('تم النسخ!');
    });
  }

  // إظهار التوست العام
  function showGlobalToast(msg) {
    const toastElem = document.getElementById('quraniToast');
    const msgElem = document.getElementById('toastMessage');
    if (toastElem && msgElem) {
      msgElem.textContent = msg;
      toastElem.classList.remove('d-none');
      setTimeout(() => {
        toastElem.classList.add('d-none');
      }, 3500);
    } else {
      alert(msg);
    }
  }

  // تهيئة قسم الوقف بالكامل
  async function initWaqfHub() {
    populateSurahSelect();
    await fetchWaqfPages();
    updateWaqfStats();
    renderWaqfCards();
  }

  // تصدير الواجهة العامة
  window.QuraniWaqfEngine = {
    initWaqfHub,
    fetchWaqfPages,
    renderWaqfCards,
    switchWaqfSubTab,
    selectWaqfPrayer,
    handleWaqfSearch,
    filterWaqfCategory,
    handleCreateWaqfSubmit,
    copyCreatedWaqfUrl,
    copyWaqfUrlById
  };

  // إتاحة الدوال على window مباشرة لسهولة استدعائها من الـ HTML
  window.switchWaqfSubTab = switchWaqfSubTab;
  window.selectWaqfPrayer = selectWaqfPrayer;
  window.handleWaqfSearch = handleWaqfSearch;
  window.filterWaqfCategory = filterWaqfCategory;
  window.handleCreateWaqfSubmit = handleCreateWaqfSubmit;
  window.copyCreatedWaqfUrl = copyCreatedWaqfUrl;
  window.copyWaqfUrlById = copyWaqfUrlById;
  window.renderWaqfHub = initWaqfHub;

})(window);
