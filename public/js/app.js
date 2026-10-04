/**
 * تطبيق «قرءاني» — المنطق التفاعلي الرئيسي
 * Qur'ani Main Interactive Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- تهيئة الحالة (State Management) ---
  const state = {
    activeTab: 'home',
    currentSurah: 1,
    currentPage: 1,
    currentJuz: 1,
    selectedReciter: 'ar.alafasy',
    activeAdhkarCategory: 'morning',
    adhkarCounts: {},
    tasbeeh: {
      count: 0,
      target: 33,
      lap: 1,
      totalCount: 0,
      soundEnabled: true,
      vibrateEnabled: true
    },
    theme: localStorage.getItem('qurani_theme') || 'dark',
    fontScale: 1
  };

  // الصوت للنقر والتسبيح (Web Audio API Synthesizer - بدون ملفات خارجية)
  const audioCtx = window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;
  function playClickTone(freq = 600, duration = 0.05) {
    if (!state.tasbeeh.soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  }

  // --- عناصر DOM الرئيسية ---
  const elements = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    userDropdownBtn: document.getElementById('activeUserDropdownBtn'),
    userDropdownMenu: document.getElementById('userDropdownMenu'),
    userAvatarBadge: document.getElementById('userAvatarBadge'),
    
    // عناصر الشاشة الرئيسية
    greetingName: document.getElementById('homeGreetingName'),
    wirdTodayPages: document.getElementById('wirdTodayPages'),
    wirdTodaySurah: document.getElementById('wirdTodaySurah'),
    wirdStreakDays: document.getElementById('wirdStreakDays'),
    wirdProgressCircle: document.getElementById('wirdProgressCircle'),
    wirdProgressPercent: document.getElementById('wirdProgressPercent'),
    wirdStatusBadge: document.getElementById('wirdStatusBadge'),
    btnMarkWirdDone: document.getElementById('btnMarkWirdDone'),
    btnStartWirdReading: document.getElementById('btnStartWirdReading'),
    khatmahProgressBar: document.getElementById('khatmahProgressBar'),
    khatmahCurrentPage: document.getElementById('khatmahCurrentPage'),
    khatmahPercentText: document.getElementById('khatmahPercentText'),
    khatmahExpectedDate: document.getElementById('khatmahExpectedDate'),
    currentPlanName: document.getElementById('currentPlanName'),
    currentPlanDesc: document.getElementById('currentPlanDesc'),

    // عناصر المصحف الشريف
    mushafPageNumber: document.getElementById('mushafPageNumber'),
    mushafSurahName: document.getElementById('mushafSurahName'),
    mushafJuzNumber: document.getElementById('mushafJuzNumber'),
    mushafContentBox: document.getElementById('mushafContentBox'),
    surahSelect: document.getElementById('surahSelectDropdown'),
    pageSelect: document.getElementById('pageSelectDropdown'),
    reciterSelect: document.getElementById('reciterSelectDropdown'),
    surahSearchInput: document.getElementById('surahSearchInput'),
    surahsGridList: document.getElementById('surahsGridList'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    btnNextPage: document.getElementById('btnNextPage'),
    btnIncreaseFont: document.getElementById('btnIncreaseFont'),
    btnDecreaseFont: document.getElementById('btnDecreaseFont'),

    // عناصر الأذكار والسبحة
    adhkarTabs: document.querySelectorAll('.adhkar-nav-btn'),
    adhkarContainer: document.getElementById('adhkarContainer'),
    tasbeehCounterDisplay: document.getElementById('tasbeehCounterDisplay'),
    tasbeehTotalDisplay: document.getElementById('tasbeehTotalDisplay'),
    tasbeehLapDisplay: document.getElementById('tasbeehLapDisplay'),
    tasbeehRingBead: document.getElementById('tasbeehRingBead'),
    btnTasbeehTap: document.getElementById('btnTasbeehTap'),
    btnTasbeehReset: document.getElementById('btnTasbeehReset'),
    tasbeehPhraseSelect: document.getElementById('tasbeehPhraseSelect'),

    // عناصر إدارة الأعضاء والخطط
    familyMembersGrid: document.getElementById('familyMembersGrid'),
    btnAddNewMember: document.getElementById('btnAddNewMember'),
    plansContainer: document.getElementById('plansGridContainer'),
    customCalcInput: document.getElementById('customCalcPages'),
    customCalcResult: document.getElementById('customCalcResult'),

    // عناصر الواتساب
    whatsappModal: document.getElementById('whatsappModal'),
    whatsappRecipientSelect: document.getElementById('whatsappRecipientSelect'),
    whatsappTemplateSelect: document.getElementById('whatsappTemplateSelect'),
    whatsappPreviewBubble: document.getElementById('whatsappPreviewBubble'),
    btnSendWhatsAppDirect: document.getElementById('btnSendWhatsAppDirect'),
    btnCopyWhatsAppText: document.getElementById('btnCopyWhatsAppText')
  };

  // --- تهيئة الثيم (Theme Controller) ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qurani_theme', theme);
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.innerHTML = theme === 'dark' 
        ? '<i class="bi bi-sun-fill text-warning me-1"></i> <span>الوضع النهاري</span>'
        : '<i class="bi bi-moon-stars-fill text-primary me-1"></i> <span>الوضع الليلي</span>';
    }
  }

  // --- التنقل بين التبويبات (Tab Navigation) ---
  function switchTab(tabId) {
    state.activeTab = tabId;
    
    // إخفاء كافة الأقسام
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('d-none'));
    
    // إظهار القسم المحدد
    const targetSection = document.getElementById(`section-${tabId}`);
    if (targetSection) {
      targetSection.classList.remove('d-none');
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // تحديث أزرار التنقل السفلية والعلوية
    document.querySelectorAll('[data-nav-target]').forEach(btn => {
      const active = btn.getAttribute('data-nav-target') === tabId;
      btn.classList.toggle('active', active);
      if (btn.classList.contains('nav-link')) {
        btn.classList.toggle('active', active);
      }
    });

    if (tabId === 'mushaf') {
      renderMushafView();
    } else if (tabId === 'adhkar') {
      renderAdhkarCategory(state.activeAdhkarCategory);
    } else if (tabId === 'members') {
      renderFamilyMembers();
    } else if (tabId === 'plans') {
      renderPlans();
    }
  }

  // --- تحديث بيانات المستخدم والورد في الواجهة ---
  function updateDashboardUI() {
    const user = window.QuraniWirdEngine.getActiveUser();
    if (!user) return;

    const wird = window.QuraniWirdEngine.calculateWirdForUser(user);
    const progress = window.QuraniWirdEngine.calculateProgress(user);
    const plan = window.QuraniWirdEngine.plans[user.planId] || window.QuraniWirdEngine.plans['safa'];

    // اسم المستخدم والتحية
    if (elements.greetingName) elements.greetingName.textContent = user.name;
    if (elements.userDropdownBtn) {
      elements.userDropdownBtn.innerHTML = `
        <span class="user-avatar-circle me-2">${user.avatar || '👤'}</span>
        <span class="fw-bold">${user.name}</span>
      `;
    }

    // بيانات الورد اليومي
    if (elements.wirdTodayPages) {
      elements.wirdTodayPages.textContent = `من صفحة ${wird.startPage} إلى ${wird.endPage} (${wird.pagesCount} صفحات)`;
    }
    if (elements.wirdTodaySurah) {
      elements.wirdTodaySurah.textContent = `سورة ${wird.surahName}`;
    }
    if (elements.wirdStreakDays) {
      elements.wirdStreakDays.textContent = `${user.streak || 1} يوماً`;
    }

    // الخطة الحالية
    if (elements.currentPlanName) elements.currentPlanName.textContent = plan.name;
    if (elements.currentPlanDesc) elements.currentPlanDesc.textContent = plan.description;

    // حالة إتمام اليوم
    const isCompleted = wird.isCompletedToday;
    if (elements.wirdStatusBadge) {
      elements.wirdStatusBadge.innerHTML = isCompleted
        ? '<span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill"><i class="bi bi-check-circle-fill me-1"></i> تم إتمام ورد اليوم بحمد الله</span>'
        : '<span class="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill"><i class="bi bi-clock-history me-1"></i> بانتظار تلاوة الورد اليومي</span>';
    }

    if (elements.btnMarkWirdDone) {
      if (isCompleted) {
        elements.btnMarkWirdDone.innerHTML = '<i class="bi bi-check2-all me-1"></i> تم إتمام الورد اليوم (انقر لإعادة القراءة)';
        elements.btnMarkWirdDone.classList.replace('btn-gold-gradient', 'btn-outline-gold');
      } else {
        elements.btnMarkWirdDone.innerHTML = '<i class="bi bi-patch-check-fill me-2"></i> تمت قراءة الورد اليوم بحمد الله ✨';
        elements.btnMarkWirdDone.classList.replace('btn-outline-gold', 'btn-gold-gradient');
      }
    }

    // نسبة الإنجاز اليومية والدائرة
    const todayPct = isCompleted ? 100 : 0;
    if (elements.wirdProgressPercent) elements.wirdProgressPercent.textContent = `${todayPct}%`;
    if (elements.wirdProgressCircle) {
      const radius = 45;
      const circumference = 2 * Math.PI * radius;
      elements.wirdProgressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      elements.wirdProgressCircle.style.strokeDashoffset = isCompleted ? 0 : circumference;
    }

    // إحصائيات الختمة الكلية
    if (elements.khatmahProgressBar) {
      elements.khatmahProgressBar.style.width = `${progress.progressPercent}%`;
      elements.khatmahProgressBar.setAttribute('aria-valuenow', progress.progressPercent);
    }
    if (elements.khatmahCurrentPage) elements.khatmahCurrentPage.textContent = `صفحة ${user.currentPage} من 604`;
    if (elements.khatmahPercentText) elements.khatmahPercentText.textContent = `${progress.progressPercent}%`;
    if (elements.khatmahExpectedDate) elements.khatmahExpectedDate.textContent = `الموعد المتوقع: ${progress.expectedEndDate}`;

    // تحديث قائمة المنسدلة للمستخدمين
    renderUserDropdownList();
  }

  function renderUserDropdownList() {
    if (!elements.userDropdownMenu) return;
    const users = window.QuraniWirdEngine.getAllUsers();
    const activeUser = window.QuraniWirdEngine.getActiveUser();

    let html = `
      <div class="px-3 py-2 border-bottom border-light-subtle">
        <small class="text-muted d-block">الحساب النشط حالياً:</small>
        <div class="fw-bold text-emerald">${activeUser.name} (${activeUser.planId ? window.QuraniWirdEngine.plans[activeUser.planId]?.name : 'خطة الصفا'})</div>
      </div>
    `;

    users.forEach(u => {
      const isCurrent = u.id === activeUser.id;
      html += `
        <li>
          <a class="dropdown-item d-flex align-items-center justify-content-between py-2 ${isCurrent ? 'bg-light-subtle fw-bold' : ''}" 
             href="javascript:void(0)" onclick="window.switchUserAccount('${u.id}')">
            <div class="d-flex align-items-center">
              <span class="user-avatar-circle me-2">${u.avatar || '👤'}</span>
              <div>
                <div>${u.name}</div>
                <small class="text-muted">${u.relation || ''} • ص ${u.currentPage}</small>
              </div>
            </div>
            ${isCurrent ? '<i class="bi bi-check-circle-fill text-gold"></i>' : ''}
          </a>
        </li>
      `;
    });

    html += `
      <li><hr class="dropdown-divider"></li>
      <li>
        <a class="dropdown-item text-gold fw-bold py-2" href="javascript:void(0)" onclick="window.openAddMemberModal()">
          <i class="bi bi-person-plus-fill me-2"></i> إضافة حساب جديد للأهل أو الأصدقاء
        </a>
      </li>
    `;

    elements.userDropdownMenu.innerHTML = html;
  }

  // --- تفعيل تأثير الاحتفال عند إتمام الورد ---
  function triggerCelebration() {
    // تفعيل اهتزاز بالجوال إن وجد
    if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
    playClickTone(880, 0.2);

    // بطاقة تنبيه Toast خفيفة
    const toastElem = document.getElementById('quraniToast');
    if (toastElem) {
      toastElem.classList.remove('d-none');
      setTimeout(() => toastElem.classList.add('d-none'), 4000);
    }
  }

  // --- إعداد المصحف الشريف وعرض السور ---
  function initMushafSelectors() {
    if (!window.QuraniData) return;

    // قائمة السور
    if (elements.surahSelect) {
      elements.surahSelect.innerHTML = window.QuraniData.surahs.map(s => `
        <option value="${s.number}">${s.number}. ${s.name} (${s.revelationType === 'مكية' ? 'مكية' : 'مدنية'} - ${s.ayahsCount} آية)</option>
      `).join('');
      elements.surahSelect.value = state.currentSurah;
    }

    // قائمة الصفحات
    if (elements.pageSelect) {
      let pageOptions = '';
      for (let i = 1; i <= 604; i++) {
        pageOptions += `<option value="${i}">صفحة ${i}</option>`;
      }
      elements.pageSelect.innerHTML = pageOptions;
      elements.pageSelect.value = state.currentPage;
    }

    // قائمة القراء
    if (elements.reciterSelect) {
      elements.reciterSelect.innerHTML = window.QuraniData.reciters.map(r => `
        <option value="${r.id}">${r.name} (${r.style})</option>
      `).join('');
      elements.reciterSelect.value = state.selectedReciter;
    }

    // شبكة فهرس السور السريعة
    renderSurahsGrid(window.QuraniData.surahs);
  }

  function renderSurahsGrid(surahsList) {
    if (!elements.surahsGridList) return;
    elements.surahsGridList.innerHTML = surahsList.map(s => `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="surah-grid-card p-3 rounded-4 border border-light-subtle h-100 cursor-pointer" onclick="window.selectSurah(${s.number})">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="surah-num-badge">${s.number}</span>
            <span class="badge ${s.revelationType === 'مكية' ? 'badge-makki' : 'badge-madani'}">${s.revelationType}</span>
          </div>
          <h5 class="surah-arabic-title mb-1">${s.name}</h5>
          <div class="d-flex justify-content-between text-muted small">
            <span>${s.ayahsCount} آية</span>
            <span>ص ${s.startPage}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  async function renderMushafView() {
    if (!elements.mushafContentBox || !window.QuraniData) return;

    const surah = window.QuraniData.getSurahByNumber(state.currentSurah);
    if (!surah) return;

    if (elements.mushafSurahName) elements.mushafSurahName.textContent = surah.name;
    if (elements.mushafPageNumber) elements.mushafPageNumber.textContent = `صفحة ${state.currentPage}`;
    if (elements.mushafJuzNumber) elements.mushafJuzNumber.textContent = `الجزء ${surah.juz}`;

    // إظهار مؤشر التحميل
    elements.mushafContentBox.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-gold mb-3" role="status"></div>
        <p class="text-muted">جارٍ تحميل الآيات العطرة...</p>
      </div>
    `;

    // جلب آيات السورة
    const ayahs = await window.QuraniData.fetchSurahAyahs(state.currentSurah);

    // بناء النص القرآني
    let html = '';

    // ترويسة السورة الملكية
    html += `
      <div class="surah-header-card text-center my-3 p-4 rounded-4 position-relative overflow-hidden">
        <div class="surah-frame-corner corner-top-right"></div>
        <div class="surah-frame-corner corner-top-left"></div>
        <div class="surah-frame-corner corner-bottom-right"></div>
        <div class="surah-frame-corner corner-bottom-left"></div>
        <div class="badge bg-gold-subtle text-gold px-3 py-1 mb-2 rounded-pill">${surah.revelationType} • ${surah.ayahsCount} آية • ترتيبها ${surah.number}</div>
        <h2 class="surah-header-title text-gold mb-1">سُورَةُ ${surah.name}</h2>
        <div class="text-muted small">الصفحات من ${surah.startPage} إلى ${surah.endPage}</div>
      </div>
    `;

    // البسملة لغير سورة التوبة (رقم 9) وسورة الفاتحة (تعتبر البسملة آية رقم 1)
    if (surah.number !== 9 && surah.number !== 1) {
      html += `
        <div class="bismillah-banner text-center my-4">
          <span class="bismillah-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
        </div>
      `;
    }

    // عرض الآيات متصلة كالمصحف الشريف
    html += `<div class="quran-page-verses p-3 p-md-4 text-center lh-lg">`;
    ayahs.forEach(ayah => {
      html += `
        <span class="ayah-segment" id="ayah-${ayah.numberInSurah}" onclick="window.showAyahTafseer(${surah.number}, ${ayah.numberInSurah})">
          <span class="ayah-text">${ayah.text}</span>
          <span class="ayah-number-badge" title="آية ${ayah.numberInSurah}">
            <span class="ayah-glyph">۝</span>
            <span class="ayah-num-digits">${ayah.numberInSurah}</span>
          </span>
        </span>
      `;
    });
    html += `</div>`;

    elements.mushafContentBox.innerHTML = html;
  }

  // --- إعداد الأذكار النبوية والسبحة الذكية ---
  function renderAdhkarCategory(categoryKey) {
    if (!elements.adhkarContainer || !window.QuraniAdhkar) return;
    state.activeAdhkarCategory = categoryKey;

    // تحديث أزرار التنقل بين فئات الأذكار
    elements.adhkarTabs.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === categoryKey);
    });

    const categoryData = window.QuraniAdhkar.categories[categoryKey];
    if (!categoryData) return;

    elements.adhkarContainer.innerHTML = categoryData.items.map((item, idx) => {
      const itemKey = `${categoryKey}_${item.id}`;
      if (state.adhkarCounts[itemKey] === undefined) {
        state.adhkarCounts[itemKey] = item.count;
      }
      const remaining = state.adhkarCounts[itemKey];
      const isDone = remaining <= 0;

      return `
        <div class="col-12 col-md-6 mb-3">
          <div class="adhkar-card p-4 rounded-4 h-100 ${isDone ? 'adhkar-completed' : ''}" id="adhkar-card-${itemKey}">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <span class="badge ${isDone ? 'bg-success' : 'bg-gold-subtle text-gold'} px-3 py-1 rounded-pill">
                ${isDone ? '<i class="bi bi-check2 me-1"></i> تم' : `التكرار المطلوب: ${item.count}`}
              </span>
              <span class="text-muted small">${item.reference || ''}</span>
            </div>
            
            <p class="adhkar-arabic-text mb-3">${item.text}</p>
            
            ${item.virtue ? `<div class="adhkar-virtue-box p-2 mb-3 rounded-3"><i class="bi bi-stars text-gold me-1"></i> <small>${item.virtue}</small></div>` : ''}

            <div class="d-flex align-items-center justify-content-between mt-auto pt-2 border-top border-light-subtle">
              <button class="btn ${isDone ? 'btn-outline-success' : 'btn-gold-gradient'} px-4 py-2 rounded-pill" 
                      onclick="window.tapDhikrItem('${categoryKey}', ${item.id}, ${item.count})" ${isDone ? 'disabled' : ''}>
                <i class="bi bi-hand-index-thumb me-1"></i>
                ${isDone ? 'أتممت الذكر' : `المتبقي: ${remaining}`}
              </button>
              <button class="btn btn-sm btn-link text-muted" onclick="window.resetDhikrItem('${categoryKey}', ${item.id}, ${item.count})">
                <i class="bi bi-arrow-counterclockwise"></i> إعادة
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // منطق السبحة الإلكترونية
  function updateTasbeehUI() {
    if (elements.tasbeehCounterDisplay) elements.tasbeehCounterDisplay.textContent = state.tasbeeh.count;
    if (elements.tasbeehTotalDisplay) elements.tasbeehTotalDisplay.textContent = state.tasbeeh.totalCount;
    if (elements.tasbeehLapDisplay) elements.tasbeehLapDisplay.textContent = state.tasbeeh.lap;

    if (elements.tasbeehRingBead) {
      const rot = (state.tasbeeh.count / state.tasbeeh.target) * 360;
      elements.tasbeehRingBead.style.transform = `rotate(${rot}deg)`;
    }
  }

  function tapTasbeeh() {
    state.tasbeeh.count++;
    state.tasbeeh.totalCount++;

    playClickTone(520, 0.04);
    if (state.tasbeeh.vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(40);
    }

    if (state.tasbeeh.count >= state.tasbeeh.target) {
      // إتمام الدورة (33 أو 100)
      playClickTone(880, 0.2);
      if (state.tasbeeh.vibrateEnabled && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      state.tasbeeh.lap++;
      state.tasbeeh.count = 0;
    }

    updateTasbeehUI();
  }

  // --- عرض أعضاء العائلة والمشتركين وإدارتهم ---
  function renderFamilyMembers() {
    if (!elements.familyMembersGrid || !window.QuraniWirdEngine) return;

    const users = window.QuraniWirdEngine.getAllUsers();
    const activeUser = window.QuraniWirdEngine.getActiveUser();

    elements.familyMembersGrid.innerHTML = users.map(u => {
      const wird = window.QuraniWirdEngine.calculateWirdForUser(u);
      const plan = window.QuraniWirdEngine.plans[u.planId] || window.QuraniWirdEngine.plans['safa'];
      const isCompleted = wird.isCompletedToday;
      const isCurrent = u.id === activeUser.id;

      return `
        <div class="col-12 col-md-6 col-lg-4 mb-4">
          <div class="member-card p-4 rounded-4 h-100 position-relative ${isCurrent ? 'border-gold-glow' : 'border-light-subtle'}">
            ${isCurrent ? '<span class="badge bg-gold text-dark position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill fw-bold">الحساب الحالي</span>' : ''}
            
            <div class="d-flex align-items-center mb-3">
              <span class="user-avatar-lg me-3">${u.avatar || '👤'}</span>
              <div>
                <h5 class="fw-bold mb-0">${u.name}</h5>
                <small class="text-muted">${u.relation || 'مشترك'} • ${u.phone || 'بدون هاتف'}</small>
              </div>
            </div>

            <div class="member-plan-box p-3 rounded-3 mb-3">
              <div class="d-flex justify-content-between small text-muted mb-1">
                <span>الخطة:</span>
                <span class="fw-bold text-emerald">${plan.name}</span>
              </div>
              <div class="d-flex justify-content-between small text-muted mb-1">
                <span>الورد اليومي:</span>
                <span class="fw-bold">ص ${wird.startPage} - ${wird.endPage}</span>
              </div>
              <div class="d-flex justify-content-between small text-muted">
                <span>السورة:</span>
                <span class="fw-bold">سورة ${wird.surahName}</span>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-between mb-3">
              <span class="small text-muted">حالة تلاوة اليوم:</span>
              <span class="badge ${isCompleted ? 'bg-success' : 'bg-warning text-dark'} px-3 py-1 rounded-pill">
                ${isCompleted ? '<i class="bi bi-check-circle-fill me-1"></i> أتم القراءة' : '<i class="bi bi-hourglass-split me-1"></i> بانتظار القراءة'}
              </span>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-whatsapp flex-grow-1 rounded-pill" onclick="window.openWhatsAppForMember('${u.id}')">
                <i class="bi bi-whatsapp me-1"></i> تذكير بالواتساب
              </button>
              ${!isCurrent ? `
                <button class="btn btn-outline-emerald rounded-pill px-3" title="التبديل لهذا الحساب" onclick="window.switchUserAccount('${u.id}')">
                  <i class="bi bi-person-check"></i>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- عرض خطط الورد وتخصيصها ---
  function renderPlans() {
    if (!elements.plansContainer || !window.QuraniWirdEngine) return;
    const activeUser = window.QuraniWirdEngine.getActiveUser();
    const plansList = Object.values(window.QuraniWirdEngine.plans);

    elements.plansContainer.innerHTML = plansList.map(p => {
      const isSelected = activeUser.planId === p.id;
      return `
        <div class="col-12 col-md-6 col-lg-4 mb-4">
          <div class="plan-card p-4 rounded-4 h-100 position-relative ${isSelected ? 'plan-card-active' : ''}">
            ${p.badge ? `<div class="plan-ribbon">${p.badge}</div>` : ''}
            <div class="d-flex align-items-center mb-3">
              <span class="plan-icon-box me-3">${p.icon || '📖'}</span>
              <div>
                <h4 class="fw-bold mb-0">${p.name}</h4>
                <small class="text-muted">${p.duration}</small>
              </div>
            </div>
            
            <p class="text-muted small mb-3">${p.description}</p>
            
            <ul class="list-unstyled small mb-4">
              <li class="mb-2"><i class="bi bi-check-circle-fill text-gold me-2"></i> ${p.dailyTarget}</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-gold me-2"></i> الختمة خلال: ${p.duration}</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-gold me-2"></i> مناسب لـ: ${p.targetAudience || 'الجميع'}</li>
            </ul>

            <button class="btn ${isSelected ? 'btn-success' : 'btn-gold-gradient'} w-100 rounded-pill py-2" 
                    onclick="window.selectPlanForActiveUser('${p.id}')">
              ${isSelected ? '<i class="bi bi-check2-circle me-1"></i> خطتك الحالية' : 'اختيار هذه الخطة'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- محرك الواتساب ونافذة التذكير ---
  function updateWhatsAppPreview() {
    if (!elements.whatsappPreviewBubble || !window.QuraniWhatsApp || !window.QuraniWirdEngine) return;

    const memberId = elements.whatsappRecipientSelect?.value;
    const templateKey = elements.whatsappTemplateSelect?.value || 'daily_wird';
    const user = window.QuraniWirdEngine.getAllUsers().find(u => u.id === memberId) || window.QuraniWirdEngine.getActiveUser();

    let messageText = '';
    if (templateKey === 'daily_wird') {
      const wird = window.QuraniWirdEngine.calculateWirdForUser(user);
      messageText = window.QuraniWhatsApp.generateDailyWirdMessage(user, wird);
    } else if (templateKey === 'wird_congrats') {
      const wird = window.QuraniWirdEngine.calculateWirdForUser(user);
      messageText = window.QuraniWhatsApp.generateCongratsMessage(user, wird);
    } else if (templateKey === 'friday_kahf') {
      messageText = window.QuraniWhatsApp.generateFridayKahfMessage(user);
    } else if (templateKey === 'morning_adhkar') {
      messageText = window.QuraniWhatsApp.generateAdhkarReminderMessage(user, 'morning');
    } else if (templateKey === 'evening_adhkar') {
      messageText = window.QuraniWhatsApp.generateAdhkarReminderMessage(user, 'evening');
    }

    elements.whatsappPreviewBubble.innerHTML = messageText.replace(/\n/g, '<br>');
    elements.whatsappPreviewBubble.dataset.rawText = messageText;
    elements.whatsappPreviewBubble.dataset.phone = user.phone || '';
  }

  // --- دوال الربط العامة (Global Window Helpers) ---
  window.switchTab = switchTab;

  window.switchUserAccount = (userId) => {
    window.QuraniWirdEngine.setActiveUser(userId);
    updateDashboardUI();
    renderFamilyMembers();
    renderPlans();
  };

  window.selectSurah = (surahNum) => {
    state.currentSurah = parseInt(surahNum, 10);
    const surah = window.QuraniData.getSurahByNumber(state.currentSurah);
    if (surah) {
      state.currentPage = surah.startPage;
    }
    if (elements.surahSelect) elements.surahSelect.value = state.currentSurah;
    if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
    switchTab('mushaf');
  };

  window.selectPlanForActiveUser = (planId) => {
    window.QuraniWirdEngine.changeActiveUserPlan(planId);
    updateDashboardUI();
    renderPlans();
    alert('تم تفعيل الخطة بنجاح لحسابك المبارك ✨');
  };

  window.tapDhikrItem = (category, itemId, initialCount) => {
    const itemKey = `${category}_${itemId}`;
    if (state.adhkarCounts[itemKey] > 0) {
      state.adhkarCounts[itemKey]--;
      playClickTone(580, 0.04);
      if (state.adhkarCounts[itemKey] === 0) {
        playClickTone(880, 0.15);
      }
      renderAdhkarCategory(category);
    }
  };

  window.resetDhikrItem = (category, itemId, initialCount) => {
    const itemKey = `${category}_${itemId}`;
    state.adhkarCounts[itemKey] = initialCount;
    renderAdhkarCategory(category);
  };

  window.showAyahTafseer = async (surahNum, ayahNum) => {
    const modalElem = document.getElementById('tafseerModal');
    const titleElem = document.getElementById('tafseerSurahTitle');
    const textElem = document.getElementById('tafseerAyahText');
    const contentElem = document.getElementById('tafseerContentBody');

    if (!modalElem || !window.QuraniData) return;

    const surah = window.QuraniData.getSurahByNumber(surahNum);
    titleElem.textContent = `تفسير الآية (${ayahNum}) من سورة ${surah.name}`;
    contentElem.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-gold"></div></div>`;

    const bsModal = new bootstrap.Modal(modalElem);
    bsModal.show();

    // جلب التفسير من البيانات المدمجة أو API
    let tafseer = window.QuraniData.sampleTafseer[`${surahNum}:${ayahNum}`];
    if (!tafseer) {
      try {
        const resp = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/ar.muyassar`);
        const data = await resp.json();
        tafseer = data?.data?.text || 'التفسير الميسر: نسأل الله أن ينفعنا بهذه الآية الكريمة ويتدبرها القارئ.';
      } catch (e) {
        tafseer = 'التفسير الميسر: قراءة الآية وتدبر معانيها وتطبيق أحكامها نور في الدنيا ونجاة في الآخرة.';
      }
    }

    contentElem.textContent = tafseer;
  };

  window.openWhatsAppForMember = (userId) => {
    if (elements.whatsappRecipientSelect) {
      elements.whatsappRecipientSelect.value = userId;
    }
    updateWhatsAppPreview();
    const modal = new bootstrap.Modal(document.getElementById('whatsappModal'));
    modal.show();
  };

  window.openAddMemberModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('addMemberModal'));
    modal.show();
  };

  // --- مستمعو الأحداث (Event Listeners) ---
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', () => {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });
  }

  // أزرار التنقل السفلية والعلوية
  document.querySelectorAll('[data-nav-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-nav-target'));
    });
  });

  // زر إتمام الورد اليومي
  if (elements.btnMarkWirdDone) {
    elements.btnMarkWirdDone.addEventListener('click', () => {
      window.QuraniWirdEngine.markTodayWirdCompleted();
      updateDashboardUI();
      triggerCelebration();
    });
  }

  // زر بدء تلاوة الورد
  if (elements.btnStartWirdReading) {
    elements.btnStartWirdReading.addEventListener('click', () => {
      const user = window.QuraniWirdEngine.getActiveUser();
      const wird = window.QuraniWirdEngine.calculateWirdForUser(user);
      state.currentPage = wird.startPage;
      if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
      switchTab('mushaf');
    });
  }

  // التنقل بين الصفحات في المصحف
  if (elements.btnPrevPage) {
    elements.btnPrevPage.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
        renderMushafView();
      }
    });
  }
  if (elements.btnNextPage) {
    elements.btnNextPage.addEventListener('click', () => {
      if (state.currentPage < 604) {
        state.currentPage++;
        if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
        renderMushafView();
      }
    });
  }

  // تغيير السورة أو الصفحة من القوائم
  if (elements.surahSelect) {
    elements.surahSelect.addEventListener('change', (e) => {
      window.selectSurah(e.target.value);
    });
  }
  if (elements.pageSelect) {
    elements.pageSelect.addEventListener('change', (e) => {
      state.currentPage = parseInt(e.target.value, 10);
      renderMushafView();
    });
  }
  if (elements.reciterSelect) {
    elements.reciterSelect.addEventListener('change', (e) => {
      state.selectedReciter = e.target.value;
      if (window.QuraniAudioPlayer) {
        window.QuraniAudioPlayer.setReciter(state.selectedReciter);
      }
    });
  }

  // البحث في السور
  if (elements.surahSearchInput) {
    elements.surahSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!window.QuraniData) return;
      const filtered = window.QuraniData.surahs.filter(s => 
        s.name.includes(query) || s.number.toString().includes(query) || s.englishName.toLowerCase().includes(query)
      );
      renderSurahsGrid(filtered);
    });
  }

  // السبحة الإلكترونية
  if (elements.btnTasbeehTap) {
    elements.btnTasbeehTap.addEventListener('click', tapTasbeeh);
  }
  if (elements.btnTasbeehReset) {
    elements.btnTasbeehReset.addEventListener('click', () => {
      state.tasbeeh.count = 0;
      updateTasbeehUI();
    });
  }
  if (elements.tasbeehPhraseSelect) {
    elements.tasbeehPhraseSelect.addEventListener('change', (e) => {
      state.tasbeeh.count = 0;
      updateTasbeehUI();
    });
  }

  // تبويبات الأذكار
  elements.adhkarTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      renderAdhkarCategory(btn.getAttribute('data-category'));
    });
  });

  // أحداث نافذة الواتساب
  if (elements.whatsappRecipientSelect) {
    elements.whatsappRecipientSelect.addEventListener('change', updateWhatsAppPreview);
  }
  if (elements.whatsappTemplateSelect) {
    elements.whatsappTemplateSelect.addEventListener('change', updateWhatsAppPreview);
  }
  if (elements.btnSendWhatsAppDirect) {
    elements.btnSendWhatsAppDirect.addEventListener('click', () => {
      const phone = elements.whatsappPreviewBubble.dataset.phone;
      const rawText = elements.whatsappPreviewBubble.dataset.rawText;
      window.QuraniWhatsApp.openWhatsApp(phone, rawText);
    });
  }
  if (elements.btnCopyWhatsAppText) {
    elements.btnCopyWhatsAppText.addEventListener('click', async () => {
      const rawText = elements.whatsappPreviewBubble.dataset.rawText;
      await window.QuraniWhatsApp.copyToClipboard(rawText);
      alert('تم نسخ نص الرسالة بنجاح إلى الحافظة ✨');
    });
  }

  // نموذج إضافة مشترك جديد
  const addMemberForm = document.getElementById('addMemberForm');
  if (addMemberForm) {
    addMemberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newMemberName').value.trim();
      const phone = document.getElementById('newMemberPhone').value.trim();
      const planId = document.getElementById('newMemberPlan').value;
      const relation = document.getElementById('newMemberRelation').value.trim();

      if (!name) return;

      window.QuraniWirdEngine.addUser({
        name,
        phone,
        planId,
        relation,
        currentPage: 1
      });

      bootstrap.Modal.getInstance(document.getElementById('addMemberModal')).hide();
      addMemberForm.reset();
      updateDashboardUI();
      renderFamilyMembers();
      alert(`تمت إضافة ${name} بنجاح إلى قائمة الورد المبارك 🌸`);
    });
  }

  // الحاسبة الذكية للخطة المخصصة
  if (elements.customCalcInput) {
    elements.customCalcInput.addEventListener('input', (e) => {
      const pages = parseInt(e.target.value, 10);
      if (!pages || pages < 1) {
        elements.customCalcResult.textContent = 'أدخل عدداً صحيحاً للصفحات';
        return;
      }
      const days = Math.ceil(604 / pages);
      const months = (days / 30).toFixed(1);
      elements.customCalcResult.innerHTML = `
        <span class="text-gold fw-bold">ختمة كاملة خلال ${days} يوماً</span> (حوالي ${months} شهر)
      `;
    });
  }

  // تكبير وتصغير خط المصحف
  if (elements.btnIncreaseFont) {
    elements.btnIncreaseFont.addEventListener('click', () => {
      if (state.fontScale < 1.4) {
        state.fontScale += 0.1;
        document.documentElement.style.setProperty('--quran-font-scale', state.fontScale);
      }
    });
  }
  if (elements.btnDecreaseFont) {
    elements.btnDecreaseFont.addEventListener('click', () => {
      if (state.fontScale > 0.8) {
        state.fontScale -= 0.1;
        document.documentElement.style.setProperty('--quran-font-scale', state.fontScale);
      }
    });
  }

  // --- تشغيل التطبيق الأولي ---
  applyTheme(state.theme);
  initMushafSelectors();
  updateDashboardUI();
  updateTasbeehUI();
  renderAdhkarCategory('morning');
  renderFamilyMembers();
  renderPlans();

  // ملء قائمة مستلمي الواتساب
  if (elements.whatsappRecipientSelect && window.QuraniWirdEngine) {
    elements.whatsappRecipientSelect.innerHTML = window.QuraniWirdEngine.getAllUsers().map(u => `
      <option value="${u.id}">${u.name} (${u.relation || 'مشترك'} - ${u.phone})</option>
    `).join('');
    updateWhatsAppPreview();
  }

  console.log('✨ تم تشغيل منصة «قرءاني» بنجاح — تقبل الله طاعتكم');
});
