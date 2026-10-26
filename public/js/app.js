/**
 * تطبيق «قرءاني» — المنطق التفاعلي الرئيسي المطور (نظام الثيمات والتصميم الحديث)
 * Qur'ani Main Interactive Application Controller (Modern Luxury System)
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
      soundEnabled: localStorage.getItem('qurani_sound') !== 'false',
      vibrateEnabled: localStorage.getItem('qurani_vibrate') !== 'false'
    },
    fontScale: 1
  };

  // --- توليد الصوت للنقر والتسبيح (Web Audio API Synthesizer) ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playClickTone(freq = 600, duration = 0.05) {
    if (!state.tasbeeh.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  }

  // --- عناصر DOM الرئيسية ---
  const elements = {
    ownerProfileBtn: document.getElementById('ownerProfileBtn'),
    navUserStreak: document.getElementById('navUserStreak'),
    ownerSettingsModal: document.getElementById('ownerSettingsModal'),
    ownerSettingsForm: document.getElementById('ownerSettingsForm'),
    ownerSettingsName: document.getElementById('ownerSettingsName'),
    ownerSettingsPhone: document.getElementById('ownerSettingsPhone'),
    ownerSettingsPlan: document.getElementById('ownerSettingsPlan'),
    ownerSettingsCustomPages: document.getElementById('ownerSettingsCustomPages'),
    ownerSettingsCustomPagesBox: document.getElementById('ownerSettingsCustomPagesBox'),
    ownerSettingsPage: document.getElementById('ownerSettingsPage'),
    btnShareOwnerWird: document.getElementById('btnShareOwnerWird'),
    userDropdownBtn: document.getElementById('activeUserDropdownBtn'),
    userDropdownMenu: document.getElementById('userDropdownMenu'),
    navUserName: document.getElementById('navUserName'),
    navUserAvatar: document.getElementById('navUserAvatar'),
    
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
    khatmahRemainingPages: document.getElementById('khatmahRemainingPages'),
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
    juzSelect: document.getElementById('juzSelectDropdown'),
    mushafPageSlider: document.getElementById('mushafPageSlider'),
    sliderPageIndicator: document.getElementById('sliderPageIndicator'),
    reciterSelect: document.getElementById('reciterSelectDropdown'),
    surahSearchInput: document.getElementById('surahSearchInput'),
    surahsGridList: document.getElementById('surahsGridList'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    btnNextPage: document.getElementById('btnNextPage'),
    btnIncreaseFont: document.getElementById('btnIncreaseFont'),
    btnDecreaseFont: document.getElementById('btnDecreaseFont'),
    btnBookmarkPage: document.getElementById('btnBookmarkPage'),

    // عناصر الأذكار والسبحة
    adhkarTabs: document.querySelectorAll('.adhkar-tab-btn'),
    adhkarContainer: document.getElementById('adhkarContainer'),
    tasbeehCounterDisplay: document.getElementById('tasbeehCounterDisplay'),
    tasbeehTotalDisplay: document.getElementById('tasbeehTotalDisplay'),
    tasbeehLapDisplay: document.getElementById('tasbeehLapDisplay'),
    btnTasbeehTap: document.getElementById('btnTasbeehTap'),
    btnTasbeehReset: document.getElementById('btnTasbeehReset'),
    tasbeehPhraseSelect: document.getElementById('tasbeehPhraseSelect'),
    tasbeehCurrentPhraseText: document.getElementById('tasbeehCurrentPhraseText'),
    tasbeehTargetBadge: document.getElementById('tasbeehTargetBadge'),
    tasbeehProgressText: document.getElementById('tasbeehProgressText'),
    tasbeehCycleProgressBar: document.getElementById('tasbeehCycleProgressBar'),
    btnToggleSound: document.getElementById('btnToggleSound'),
    btnToggleVibrate: document.getElementById('btnToggleVibrate'),
    soundIcon: document.getElementById('soundIcon'),
    vibrateIcon: document.getElementById('vibrateIcon'),

    // عناصر إدارة المقرأة المصغرة (الأهل والأصدقاء) والخطط
    familyMembersGrid: document.getElementById('familyMembersGrid'),
    friendsMembersGrid: document.getElementById('friendsMembersGrid'),
    statFamilyCount: document.getElementById('statFamilyCount'),
    statFamilyCompleted: document.getElementById('statFamilyCompleted'),
    statFamilyTotal: document.getElementById('statFamilyTotal'),
    statFamilyRate: document.getElementById('statFamilyRate'),
    familyProgressBar: document.getElementById('familyProgressBar'),
    statFriendsCount: document.getElementById('statFriendsCount'),
    statFriendsCompleted: document.getElementById('statFriendsCompleted'),
    statFriendsTotal: document.getElementById('statFriendsTotal'),
    statFriendsRate: document.getElementById('statFriendsRate'),
    friendsProgressBar: document.getElementById('friendsProgressBar'),
    badgeAllCount: document.getElementById('badgeAllCount'),
    badgeFamilyCount: document.getElementById('badgeFamilyCount'),
    badgeFriendsCount: document.getElementById('badgeFriendsCount'),
    familyBadgeText: document.getElementById('familyBadgeText'),
    friendsBadgeText: document.getElementById('friendsBadgeText'),
    maqraaFamilyBlock: document.getElementById('maqraaFamilyBlock'),
    maqraaFriendsBlock: document.getElementById('maqraaFriendsBlock'),
    plansContainer: document.getElementById('plansGridContainer'),
    customCalcInput: document.getElementById('customCalcPages'),
    customCalcSlider: document.getElementById('customCalcSlider'),
    customCalcResult: document.getElementById('customCalcResult'),

    // عناصر الواتساب والقروبات
    whatsappRecipientSelect: document.getElementById('whatsappRecipientSelect'),
    whatsappTemplateSelect: document.getElementById('whatsappTemplateSelect'),
    whatsappPreviewBubble: document.getElementById('whatsappPreviewBubble'),
    btnSendWhatsAppDirect: document.getElementById('btnSendWhatsAppDirect'),
    btnSendWhatsAppText: document.getElementById('btnSendWhatsAppText'),
    btnCopyWhatsAppText: document.getElementById('btnCopyWhatsAppText'),
    btnOpenGroupDirect: document.getElementById('btnOpenGroupDirect'),
    whatsappGroupInfoBanner: document.getElementById('whatsappGroupInfoBanner'),
    whatsappGroupBannerTitle: document.getElementById('whatsappGroupBannerTitle'),
    whatsappGroupBannerLink: document.getElementById('whatsappGroupBannerLink'),
    btnEditCurrentGroupLink: document.getElementById('btnEditCurrentGroupLink'),
    badgeGroupsCount: document.getElementById('badgeGroupsCount'),
    maqraaGroupsBlock: document.getElementById('maqraaGroupsBlock'),
    whatsappGroupsGrid: document.getElementById('whatsappGroupsGrid'),
    groupForm: document.getElementById('groupForm'),
    groupFormId: document.getElementById('groupFormId'),
    groupFormName: document.getElementById('groupFormName'),
    groupFormLink: document.getElementById('groupFormLink'),
    groupFormCategory: document.getElementById('groupFormCategory'),
    groupFormDesc: document.getElementById('groupFormDesc'),
    groupModalTitle: document.getElementById('groupModalTitle'),
    btnDeleteGroup: document.getElementById('btnDeleteGroup')
  };

  // --- نظام الثيمات المتقدم (Light / Parchment / Dark) ---
  function initTheme() {
    const savedTheme = localStorage.getItem('qurani_theme') || 'light';
    setTheme(savedTheme);

    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-set-theme');
        setTheme(theme);
      });
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qurani_theme', theme);

    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-theme') === theme);
    });
  }

  // --- إدارة العلامات المرجعية (Bookmarks System) ---
  function getBookmark() {
    try {
      return JSON.parse(localStorage.getItem('qurani_bookmark'));
    } catch (e) {
      return null;
    }
  }

  function saveBookmark(surahNum, pageNum) {
    if (!window.QuraniData) return;
    const surah = window.QuraniData.getSurahByNumber(surahNum);
    const surahName = surah ? surah.nameSimple : `سورة ${surahNum}`;
    const bookmark = {
      surahNum,
      surahName,
      page: pageNum,
      savedAt: new Date().toLocaleDateString('ar-SA')
    };

    localStorage.setItem('qurani_bookmark', JSON.stringify(bookmark));
    updateBookmarkUI();
    showToast('تم حفظ العلامة المرجعية 🔖', `تم حفظ وقوفك عند صفحة ${pageNum} (${surahName}).`);
    playClickTone(700, 0.1);
  }

  function resumeFromBookmark() {
    const b = getBookmark();
    if (!b) return;
    state.currentSurah = b.surahNum || 1;
    state.currentPage = b.page || 1;
    if (elements.surahSelect) elements.surahSelect.value = state.currentSurah;
    if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
    if (elements.mushafPageSlider) elements.mushafPageSlider.value = state.currentPage;
    switchTab('mushaf');
  }

  function updateBookmarkUI() {
    const b = getBookmark();
    const navBtn = document.getElementById('navBookmarkBtn');
    const navText = document.getElementById('navBookmarkText');
    const homeBanner = document.getElementById('homeBookmarkBanner');
    const homeDetail = document.getElementById('homeBookmarkDetail');

    if (b && b.page) {
      if (navBtn) navBtn.classList.remove('d-none');
      if (navText) navText.textContent = `ص ${b.page}`;
      if (homeBanner) homeBanner.classList.remove('d-none');
      if (homeDetail) homeDetail.textContent = `سورة ${b.surahName} — صفحة ${b.page} (${b.savedAt || ''})`;
    } else {
      if (navBtn) navBtn.classList.add('d-none');
      if (homeBanner) homeBanner.classList.add('d-none');
    }
  }

  // --- نافذة التنبيهات المضيئة (Toast Notification) ---
  function showToast(title, msg, icon = 'bi-patch-check-fill') {
    const toastElem = document.getElementById('quraniToast');
    const titleElem = document.getElementById('toastTitle');
    const msgElem = document.getElementById('toastMessage');
    const iconElem = document.getElementById('toastIcon');

    if (!toastElem) return;
    if (titleElem) titleElem.textContent = title;
    if (msgElem) msgElem.textContent = msg;
    if (iconElem) iconElem.className = `bi ${icon} fs-3 text-gold-light me-3`;

    toastElem.classList.remove('d-none');
    setTimeout(() => {
      toastElem.classList.add('d-none');
    }, 4500);
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
    });

    if (tabId === 'mushaf') {
      renderMushafView();
    } else if (tabId === 'adhkar') {
      renderAdhkarCategory(state.activeAdhkarCategory);
    } else if (tabId === 'members') {
      renderFamilyMembers();
    } else if (tabId === 'plans') {
      renderPlans();
    } else if (tabId === 'waqf') {
      if (window.renderWaqfHub) window.renderWaqfHub();
    } else if (tabId === 'portal') {
      if (window.QuraniPortal && window.QuraniPortal.updateBookmark) {
        window.QuraniPortal.updateBookmark();
      }
    }

    // إغلاق القائمة المنسدلة في الجوال إن كانت مفتوحة
    const navbarCollapse = document.getElementById('navbarContent');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) bsCollapse.hide();
    }
  }

  // --- تحديث بيانات المستخدم والورد في الواجهة ---
  function updateDashboardUI() {
    const user = window.QuraniWirdEngine.getActiveUser();
    if (!user) return;

    const wird = window.QuraniWirdEngine.calculateWirdForUser(user);
    const progress = window.QuraniWirdEngine.calculateProgress(user);
    const plan = window.QuraniWirdEngine.plans[user.planId] || window.QuraniWirdEngine.plans['safa'];

    // اسم المستخدم في التحية والناف بار
    if (elements.greetingName) elements.greetingName.textContent = user.name;
    if (elements.navUserName) elements.navUserName.textContent = user.name;
    if (elements.navUserAvatar) elements.navUserAvatar.textContent = user.avatar || '👤';

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
        ? '<span class="badge bg-success text-white px-3 py-1 rounded-pill fw-bold"><i class="bi bi-check-circle-fill me-1"></i> تم إتمام ورد اليوم بحمد الله</span>'
        : '<span class="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold"><i class="bi bi-clock-history me-1"></i> بانتظار تلاوة الورد اليومي</span>';
    }

    if (elements.btnMarkWirdDone) {
      if (isCompleted) {
        elements.btnMarkWirdDone.innerHTML = '<i class="bi bi-check2-all me-1"></i> تم الإتمام بحمد الله (انقر لإعادة القراءة)';
      } else {
        elements.btnMarkWirdDone.innerHTML = '<i class="bi bi-patch-check-fill fs-5 me-2"></i> تمت القراءة بحمد الله ✨';
      }
    }

    // نسبة الإنجاز اليومية والدائرة
    const todayPct = isCompleted ? 100 : 0;
    if (elements.wirdProgressPercent) elements.wirdProgressPercent.textContent = `${todayPct}%`;
    if (elements.wirdProgressCircle) {
      const radius = 42;
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
    
    const remaining = Math.max(0, 604 - user.currentPage);
    if (elements.khatmahRemainingPages) elements.khatmahRemainingPages.textContent = `باقي ${remaining} صفحة`;

    // تحديث محطات مسار الختمة الشريفة
    const curr = user.currentPage || 1;
    const node1 = document.getElementById('stepNode1');
    const node2 = document.getElementById('stepNode2');
    const node3 = document.getElementById('stepNode3');
    const node4 = document.getElementById('stepNode4');

    if (node1) {
      node1.classList.toggle('completed', curr >= 151);
      node1.classList.toggle('active', curr < 151);
    }
    if (node2) {
      node2.classList.toggle('completed', curr >= 302);
      node2.classList.toggle('active', curr >= 151 && curr < 302);
    }
    if (node3) {
      node3.classList.toggle('completed', curr >= 453);
      node3.classList.toggle('active', curr >= 302 && curr < 453);
    }
    if (node4) {
      node4.classList.toggle('completed', curr >= 604);
      node4.classList.toggle('active', curr >= 453 && curr < 604);
    }

    // تحديث شارة حساب المالك
    updateOwnerProfileBadge();
    updateBookmarkUI();
  }

  function updateOwnerProfileBadge() {
    if (!window.QuraniWirdEngine) return;
    const owner = window.QuraniWirdEngine.getOwner();
    if (!owner) return;
    if (elements.navUserName) elements.navUserName.textContent = owner.name;
    if (elements.navUserAvatar) elements.navUserAvatar.textContent = owner.avatar || '📖';
    if (elements.navUserStreak) {
      elements.navUserStreak.innerHTML = `<i class="bi bi-fire text-warning"></i> ${owner.streak || 1} يوماً`;
    }
  }

  // --- تفعيل تأثير الاحتفال بالكونفيتي عند إتمام الورد ---
  function triggerCelebration() {
    if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
    playClickTone(880, 0.25);

    const heroCard = document.getElementById('heroWirdCard');
    if (heroCard) {
      heroCard.classList.remove('hero-card-completed-celebrate');
      void heroCard.offsetWidth; // Reflow to restart animation
      heroCard.classList.add('hero-card-completed-celebrate');
    }

    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#064e3b', '#10b981', '#fcd34d', '#ffffff']
      });
    }

    showToast('هنيئاً لك! تقبل الله طاعتكم 🌸', 'تم تسجيل إتمام وردك القرآني لليوم وزيادة أيام الالتزام المبارك.');
  }

  // --- إعداد المصحف الشريف وعرض السور والأجزاء ---
  function initMushafSelectors() {
    if (!window.QuraniData) return;

    // قائمة السور
    if (elements.surahSelect) {
      elements.surahSelect.innerHTML = window.QuraniData.surahs.map(s => `
        <option value="${s.number || s.id}">${s.number || s.id}. ${s.nameSimple || s.name} (${(s.revelationType || s.type) === 'مكية' ? 'مكية' : 'مدنية'} - ${s.ayahsCount} آية)</option>
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

    // قائمة الأجزاء (30 جزء)
    if (elements.juzSelect) {
      let jOpts = '<option value="">الانتقال للجزء...</option>';
      for (let j = 1; j <= 30; j++) {
        const meta = window.QuraniData.JUZ_METADATA ? window.QuraniData.JUZ_METADATA[j] : null;
        const startPage = meta ? meta.startPage : Math.round((j - 1) * 20.1 + 1);
        jOpts += `<option value="${j}">الجزء ${j} (ص ${startPage})</option>`;
      }
      elements.juzSelect.innerHTML = jOpts;
    }

    // شريط تمرير الصفحات
    if (elements.mushafPageSlider) {
      elements.mushafPageSlider.value = state.currentPage;
    }
    if (elements.sliderPageIndicator) {
      elements.sliderPageIndicator.textContent = `ص ${state.currentPage}`;
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
    elements.surahsGridList.innerHTML = surahsList.map(s => {
      const num = s.number || s.id;
      const name = s.nameSimple || s.name;
      const type = s.revelationType || s.type;
      return `
        <div class="col-6 col-md-4 col-lg-3">
          <div class="surah-item-card d-flex align-items-center justify-content-between" onclick="window.selectSurah(${num})">
            <div class="d-flex align-items-center">
              <span class="surah-number-badge me-2">${num}</span>
              <div>
                <div class="fw-bold text-dark fs-6">${name}</div>
                <small class="text-muted">${s.ayahsCount} آية • ص ${s.startPage}</small>
              </div>
            </div>
            <span class="badge ${type === 'مكية' ? 'bg-gold-subtle' : 'bg-emerald-subtle'}">${type}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  async function renderMushafView() {
    if (!elements.mushafContentBox || !window.QuraniData) return;

    const pageNum = Math.max(1, Math.min(604, parseInt(state.currentPage, 10) || 1));
    state.currentPage = pageNum;

    const pageInfo = window.QuraniData.getPageInfo(pageNum);
    const surah = (pageInfo && pageInfo.primarySurah)
      ? pageInfo.primarySurah
      : (window.QuraniData.getSurahByNumber(state.currentSurah) || window.QuraniData.surahs[0]);

    state.currentSurah = surah.id;

    if (elements.surahSelect) elements.surahSelect.value = state.currentSurah;
    if (elements.pageSelect) elements.pageSelect.value = pageNum;
    if (elements.mushafPageSlider) elements.mushafPageSlider.value = pageNum;
    if (elements.sliderPageIndicator) elements.sliderPageIndicator.textContent = `ص ${pageNum}`;

    if (elements.mushafSurahName) elements.mushafSurahName.textContent = surah.nameSimple || surah.name;
    if (elements.mushafPageNumber) elements.mushafPageNumber.textContent = `صفحة ${pageNum}`;
    if (elements.mushafJuzNumber) elements.mushafJuzNumber.textContent = `الجزء ${pageInfo ? pageInfo.juz : (surah.juz || 1)}`;

    // مؤشر التحميل الأنيق
    elements.mushafContentBox.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-emerald mb-3" role="status"></div>
        <p class="text-muted fw-bold">جارٍ تحميل آيات الصفحة ${pageNum} برسم المصحف الشريف...</p>
      </div>
    `;

    // جلب آيات الصفحة المحددة برسم المصحف
    const ayahs = await window.QuraniData.fetchPageAyahs(pageNum);

    // بناء النص القرآني الملكي
    let html = '';
    let currentSurahId = null;
    let openVersesWrapper = false;

    ayahs.forEach((ayah) => {
      const sId = ayah.surahNumber || (ayah.surah ? ayah.surah.number : state.currentSurah);
      const sMeta = window.QuraniData.getSurahByNumber(sId) || surah;
      const ayahNum = ayah.numberInSurah || ayah.number;

      if (sId !== currentSurahId) {
        if (openVersesWrapper) {
          html += `</div>`;
          openVersesWrapper = false;
        }
        currentSurahId = sId;

        // إذا بدأت سورة جديدة في هذه الصفحة (الآية 1)
        if (ayahNum === 1) {
          const revType = sMeta.revelationType || sMeta.type;
          html += `
            <div class="surah-header-card my-3">
              <div class="badge bg-gold-subtle px-3 py-1 mb-2 rounded-pill fw-bold">${revType} • ${sMeta.ayahsCount} آية • ترتيبها ${sMeta.number || sMeta.id}</div>
              <h2 class="surah-header-title">${sMeta.name || 'سورة ' + sMeta.nameSimple}</h2>
              <div class="text-muted small fw-semibold">الصفحات من ${sMeta.startPage} إلى ${sMeta.endPage} • الجزء ${sMeta.juz}</div>
            </div>
          `;

          // بانر البسملة الفاخر (لغير سورة التوبة رقم 9 وسورة الفاتحة 1)
          if (sId !== 9 && sId !== 1) {
            html += `
              <div class="bismillah-banner my-2">
                <div class="mb-2">
                  <img src="assets/patterns/bismillah-cartouche.svg" alt="زخرفة البسملة" style="max-width: 320px; width: 100%; height: auto; opacity: 0.85;" />
                </div>
                <span class="bismillah-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
              </div>
            `;
          }
        } else {
          // السورة مستمرة من صفحات سابقة، نظهر شارة أنيقة باسم السورة
          html += `
            <div class="text-center py-2 mb-2">
              <span class="badge bg-gold-subtle text-dark px-3 py-1 rounded-pill fw-bold">
                <i class="bi bi-book-half me-1 text-gold"></i> تلاوة سورة ${sMeta.nameSimple || sMeta.name} — الصفحة ${pageNum}
              </span>
            </div>
          `;
        }

        html += `<div class="quran-page-verses p-2 p-md-3">`;
        openVersesWrapper = true;
      }

      html += `
        <span class="ayah-segment" id="ayah-${ayah.globalNumber || ayahNum}" onclick="window.showAyahTafseer(${sId}, ${ayahNum})" title="انقر لعرض التفسير">
          <span class="ayah-text">${ayah.text}</span>
          <span class="ayah-number-badge" title="آية ${ayahNum}">
            <span class="ayah-glyph">۝</span>
            <span class="ayah-num-digits">${ayahNum}</span>
          </span>
        </span>
      `;
    });

    if (openVersesWrapper) {
      html += `</div>`;
    }

    elements.mushafContentBox.innerHTML = html;
  }

  // --- إعداد الأذكار النبوية والسبحة الذكية ---
  function renderAdhkarCategory(categoryKey) {
    if (!elements.adhkarContainer || !window.QuraniAdhkar) return;
    state.activeAdhkarCategory = categoryKey;

    // تحديث أزرار التنقل بين فئات الأذكار
    document.querySelectorAll('.adhkar-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === categoryKey);
    });

    const categoryData = window.QuraniAdhkar.categories[categoryKey];
    if (!categoryData) return;

    elements.adhkarContainer.innerHTML = categoryData.items.map((item) => {
      const itemKey = `${categoryKey}_${item.id}`;
      if (state.adhkarCounts[itemKey] === undefined) {
        state.adhkarCounts[itemKey] = item.count;
      }
      const remaining = state.adhkarCounts[itemKey];
      const isDone = remaining <= 0;
      const completedCount = item.count - remaining;
      const pct = Math.min(100, Math.round((completedCount / item.count) * 100));

      return `
        <div class="col-12 col-md-6 mb-3">
          <div class="adhkar-card p-4 h-100 ${isDone ? 'adhkar-completed' : ''}" id="adhkar-card-${itemKey}">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <span class="badge ${isDone ? 'bg-success text-white' : 'bg-gold-subtle'} px-3 py-1 rounded-pill fw-bold">
                ${isDone ? '<i class="bi bi-check2-all me-1"></i> تم إتمام الذكر' : `التكرار المطلوب: ${item.count}`}
              </span>
              <span class="text-muted small fw-semibold">${item.reference || ''}</span>
            </div>
            
            <p class="adhkar-arabic-text mb-3">${item.text}</p>
            
            ${item.virtue ? `<div class="adhkar-virtue-box mb-3"><i class="bi bi-stars text-gold me-1"></i> <small class="fw-semibold">${item.virtue}</small></div>` : ''}

            <!-- شريط تقدم التكرار -->
            <div class="mb-3">
              <div class="d-flex justify-content-between small text-muted fw-bold mb-1">
                <span>الإنجاز:</span>
                <span>${completedCount} من ${item.count}</span>
              </div>
              <div class="adhkar-item-progress">
                <div class="adhkar-item-progress-bar h-100" style="width: ${pct}%;"></div>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-between mt-auto pt-3 border-top border-light gap-2 flex-wrap">
              <button class="btn ${isDone ? 'btn-outline-success' : 'btn-emerald-action'} px-4 py-2 rounded-pill fw-bold flex-grow-1" 
                      onclick="window.tapDhikrItem('${categoryKey}', '${item.id}', ${item.count})" ${isDone ? 'disabled' : ''}>
                <i class="bi bi-hand-index-thumb me-1"></i>
                ${isDone ? 'تم بحمد الله ✨' : `المتبقي: ${remaining}`}
              </button>
              <button class="btn btn-outline-secondary rounded-pill px-3 py-2 btn-sm" onclick="window.copyDhikrText('${item.id}', this)" title="نسخ نص الذكر">
                <i class="bi bi-copy"></i>
              </button>
              <button class="btn btn-sm btn-link text-muted fw-bold text-decoration-none" onclick="window.resetDhikrItem('${categoryKey}', '${item.id}', ${item.count})" title="إعادة تعيين العداد">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const TASBEEH_PHRASE_LABELS = {
    subhanallah: 'سُبْحَانَ اللَّهِ',
    alhamdulillah: 'الْحَمْدُ لِلَّهِ',
    allahuakbar: 'اللَّهُ أَكْبَرُ',
    laillahaillallah: 'لا إِلَهَ إِلا اللَّهُ',
    istighfar: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    salawat: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِهِ',
    free: 'تسبيح وذكر حر'
  };

  // منطق السبحة الإلكترونية ثلاثية الأبعاد
  function updateTasbeehUI() {
    if (elements.tasbeehCounterDisplay) {
      elements.tasbeehCounterDisplay.textContent = state.tasbeeh.count;
      elements.tasbeehCounterDisplay.classList.remove('tasbeeh-count-pop');
      void elements.tasbeehCounterDisplay.offsetWidth;
      elements.tasbeehCounterDisplay.classList.add('tasbeeh-count-pop');
    }
    if (elements.tasbeehTotalDisplay) elements.tasbeehTotalDisplay.textContent = state.tasbeeh.totalCount;
    if (elements.tasbeehLapDisplay) elements.tasbeehLapDisplay.textContent = state.tasbeeh.lap;

    const currentKey = elements.tasbeehPhraseSelect ? elements.tasbeehPhraseSelect.value : 'subhanallah';
    if (elements.tasbeehCurrentPhraseText) {
      elements.tasbeehCurrentPhraseText.textContent = TASBEEH_PHRASE_LABELS[currentKey] || 'سُبْحَانَ اللَّهِ';
    }
    if (elements.tasbeehTargetBadge) {
      elements.tasbeehTargetBadge.textContent = state.tasbeeh.target > 0 ? `الهدف: ${state.tasbeeh.target} مرة` : 'تسبيح حر مفتوح';
    }
    if (elements.tasbeehProgressText) {
      elements.tasbeehProgressText.textContent = state.tasbeeh.target > 0 
        ? `${state.tasbeeh.count} / ${state.tasbeeh.target}` 
        : `${state.tasbeeh.count} تسبيحة`;
    }
    if (elements.tasbeehCycleProgressBar) {
      const pct = state.tasbeeh.target > 0 ? Math.min(100, Math.round((state.tasbeeh.count / state.tasbeeh.target) * 100)) : 100;
      elements.tasbeehCycleProgressBar.style.width = `${pct}%`;
    }

    // تحديث أزرار الاختيار السريع للذكر
    document.querySelectorAll('.tasbeeh-chip-btn').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-phrase') === currentKey);
    });

    if (elements.soundIcon) {
      elements.soundIcon.className = state.tasbeeh.soundEnabled ? 'bi bi-volume-up-fill text-emerald' : 'bi bi-volume-mute-fill text-muted';
    }
    if (elements.vibrateIcon) {
      elements.vibrateIcon.className = state.tasbeeh.vibrateEnabled ? 'bi bi-phone-vibrate-fill text-emerald' : 'bi bi-phone text-muted';
    }
  }

  function tapTasbeeh() {
    state.tasbeeh.count++;
    state.tasbeeh.totalCount++;

    playClickTone(540, 0.04);
    if (state.tasbeeh.vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(35);
    }

    // تحقق من اكتمال الدورة (إذا لم تكن غير محدودة 'free')
    if (state.tasbeeh.target > 0 && state.tasbeeh.count >= state.tasbeeh.target) {
      playClickTone(880, 0.2);
      if (state.tasbeeh.vibrateEnabled && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      state.tasbeeh.lap++;
      state.tasbeeh.count = 0;
      showToast('مبارك! أتممت دورة تسبيح جديدة 🌸', `وصلت إلى ${state.tasbeeh.totalCount} تسبيحة مباركة.`);
    }

    updateTasbeehUI();
  }

  // --- إنشاء بطاقة المشترك داخل المقرأة ---
  function createMemberCardHtml(u) {
    const wird = window.QuraniWirdEngine.calculateWirdForUser(u);
    const plan = window.QuraniWirdEngine.plans[u.planId] || window.QuraniWirdEngine.plans['safa'];
    const isCompleted = wird.isCompletedToday;
    const isFriends = (u.groupType === 'friends');

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="member-card p-4 h-100 position-relative">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <span class="${isFriends ? 'group-badge-friends' : 'group-badge-family'}">
              <i class="bi ${isFriends ? 'bi-people-fill text-primary' : 'bi-house-heart-fill text-danger'} me-1"></i>
              ${isFriends ? 'مقرأة الأصدقاء' : 'مقرأة الأهل'}
            </span>
            <button class="btn btn-sm btn-outline-danger border-0 rounded-circle p-1" title="حذف من المقرأة" onclick="window.deleteMemberContact('${u.id}')">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
          
          <div class="d-flex align-items-center mb-3">
            <span class="user-avatar-lg me-3" style="background-color: ${u.color || (isFriends ? '#0284c7' : '#16a34a')}; color: #fff; font-size: 1.6rem;">${u.avatar || (isFriends ? '👥' : '👨‍👩‍👧‍👦')}</span>
            <div class="overflow-hidden">
              <h5 class="fw-bold mb-0 text-dark text-truncate">${u.name}</h5>
              <small class="text-muted fw-semibold d-block text-truncate">${u.relation || (isFriends ? 'صديق' : 'من الأهل')} • ${u.phone ? u.phone : 'بدون هاتف'}</small>
            </div>
          </div>

          <div class="p-3 rounded-3 mb-3 border border-light" style="background-color: var(--bg-card-subtle);">
            <div class="d-flex justify-content-between small mb-1">
              <span class="text-muted fw-semibold">الخطة:</span>
              <span class="fw-bold text-emerald">${plan.name}</span>
            </div>
            <div class="d-flex justify-content-between small mb-1">
              <span class="text-muted fw-semibold">الورد اليومي:</span>
              <span class="fw-bold text-dark">ص ${wird.startPage} - ${wird.endPage}</span>
            </div>
            <div class="d-flex justify-content-between small">
              <span class="text-muted fw-semibold">السورة:</span>
              <span class="fw-bold text-dark">سورة ${wird.surahName}</span>
            </div>
          </div>

          <div class="d-flex align-items-center justify-content-between mb-3">
            <span class="small text-muted fw-bold">حالة تلاوة اليوم:</span>
            <button class="btn btn-sm ${isCompleted ? 'btn-success text-white' : 'btn-outline-warning text-dark'} px-3 py-1 rounded-pill fw-bold" onclick="window.toggleContactCompleted('${u.id}')" title="انقر للتبديل بين أتم القراءة وبانتظارها">
              ${isCompleted ? '<i class="bi bi-check-circle-fill me-1"></i> أتم القراءة (تراجع)' : '<i class="bi bi-hourglass-split me-1"></i> بانتظار (تحديد كأتم)'}
            </button>
          </div>

          <div class="d-flex align-items-center justify-content-between mb-3 small text-muted">
            <span><i class="bi bi-fire text-warning me-1"></i> التزام: <strong>${u.streak || 0}</strong> يوماً</span>
            <span><i class="bi bi-trophy text-gold me-1"></i> الختمات: <strong>${u.khatmahCount || 0}</strong></span>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-whatsapp w-100 fw-bold py-2" onclick="window.openWhatsAppForMember('${u.id}')">
              <i class="bi bi-whatsapp me-2"></i> إرسال الورد بالواتساب 💬
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- عرض أعضاء المقرأة المصغرة (الأهل والأصدقاء) وتحديث الإحصائيات ---
  function renderFamilyMembers() {
    if (!window.QuraniWirdEngine) return;

    const familyUsers = window.QuraniWirdEngine.getContacts('family');
    const friendsUsers = window.QuraniWirdEngine.getContacts('friends');
    const allContacts = window.QuraniWirdEngine.getContacts('all');

    // إحصائيات الأهل
    const familyStats = window.QuraniWirdEngine.getGroupStats ? window.QuraniWirdEngine.getGroupStats('family') : {
      total: familyUsers.length,
      completed: familyUsers.filter(u => u.completedToday).length,
      rate: familyUsers.length > 0 ? Math.round((familyUsers.filter(u => u.completedToday).length / familyUsers.length) * 100) : 0
    };

    // إحصائيات الأصدقاء
    const friendsStats = window.QuraniWirdEngine.getGroupStats ? window.QuraniWirdEngine.getGroupStats('friends') : {
      total: friendsUsers.length,
      completed: friendsUsers.filter(u => u.completedToday).length,
      rate: friendsUsers.length > 0 ? Math.round((friendsUsers.filter(u => u.completedToday).length / friendsUsers.length) * 100) : 0
    };

    // تحديث بطاقات إحصائيات الأهل
    if (elements.statFamilyCount) elements.statFamilyCount.textContent = familyStats.total;
    if (elements.statFamilyTotal) elements.statFamilyTotal.textContent = familyStats.total;
    if (elements.statFamilyCompleted) elements.statFamilyCompleted.textContent = familyStats.completed;
    if (elements.statFamilyRate) elements.statFamilyRate.textContent = `${familyStats.rate}% إتمام`;
    if (elements.familyProgressBar) elements.familyProgressBar.style.width = `${familyStats.rate}%`;
    if (elements.familyBadgeText) elements.familyBadgeText.textContent = `${familyStats.completed} من ${familyStats.total} أتموا الورد (${familyStats.rate}%)`;
    if (elements.badgeFamilyCount) elements.badgeFamilyCount.textContent = familyStats.total;

    // تحديث بطاقات إحصائيات الأصدقاء
    if (elements.statFriendsCount) elements.statFriendsCount.textContent = friendsStats.total;
    if (elements.statFriendsTotal) elements.statFriendsTotal.textContent = friendsStats.total;
    if (elements.statFriendsCompleted) elements.statFriendsCompleted.textContent = friendsStats.completed;
    if (elements.statFriendsRate) elements.statFriendsRate.textContent = `${friendsStats.rate}% إتمام`;
    if (elements.friendsProgressBar) elements.friendsProgressBar.style.width = `${friendsStats.rate}%`;
    if (elements.friendsBadgeText) elements.friendsBadgeText.textContent = `${friendsStats.completed} من ${friendsStats.total} أتموا الورد (${friendsStats.rate}%)`;
    if (elements.badgeFriendsCount) elements.badgeFriendsCount.textContent = friendsStats.total;

    if (elements.badgeAllCount) elements.badgeAllCount.textContent = allContacts.length;

    // تعبئة بطاقات الأهل
    if (elements.familyMembersGrid) {
      if (familyUsers.length === 0) {
        elements.familyMembersGrid.innerHTML = `
          <div class="col-12">
            <div class="empty-maqraa-box">
              <i class="bi bi-house-heart fs-1 text-emerald mb-2 d-block"></i>
              <h5 class="fw-bold text-dark">لا يوجد أفراد مسجلون في مقرأة الأهل حالياً</h5>
              <p class="text-muted small mb-3">ابدأ بإضافة الوالدين والإخوة والأبناء لإرسال وردهم القرآني عبر واتساب وتشجيعهم.</p>
              <button class="btn btn-emerald-action rounded-pill px-4" onclick="window.openAddMemberModal('family')">
                <i class="bi bi-person-plus-fill me-1"></i> إضافة فرد للعائلة الآن
              </button>
            </div>
          </div>
        `;
      } else {
        elements.familyMembersGrid.innerHTML = familyUsers.map(u => createMemberCardHtml(u)).join('');
      }
    }

    // تعبئة بطاقات الأصدقاء
    if (elements.friendsMembersGrid) {
      if (friendsUsers.length === 0) {
        elements.friendsMembersGrid.innerHTML = `
          <div class="col-12">
            <div class="empty-maqraa-box">
              <i class="bi bi-people fs-1 text-primary mb-2 d-block"></i>
              <h5 class="fw-bold text-dark">لا يوجد أصدقاء مسجلون في مقرأة الأصدقاء حالياً</h5>
              <p class="text-muted small mb-3">شارك وردك القرآني وتنافس في الخيرات مع أصدقائك ورفاق المسجد والعمل عبر واتساب.</p>
              <button class="btn btn-emerald-action rounded-pill px-4" onclick="window.openAddMemberModal('friends')">
                <i class="bi bi-person-plus-fill me-1"></i> إضافة صديق للمقرأة الآن
              </button>
            </div>
          </div>
        `;
      } else {
        elements.friendsMembersGrid.innerHTML = friendsUsers.map(u => createMemberCardHtml(u)).join('');
      }
    }

    // عرض قروبات الواتساب
    renderWhatsAppGroups();
  }

  // --- دالة توليد بطاقة قروب الواتساب ---
  function createGroupCardHtml(g) {
    const hasLink = Boolean(g.link && g.link.trim());
    const categoryBadges = {
      family: '<span class="badge bg-emerald-subtle text-emerald rounded-pill px-3 py-1 fw-bold">👨‍👩‍👧‍👦 عائلة</span>',
      friends: '<span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold">👥 أصدقاء</span>',
      halaqah: '<span class="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-1 fw-bold">🕌 حلقة تحفيظ</span>',
      khatmah: '<span class="badge bg-info-subtle text-info-emphasis rounded-pill px-3 py-1 fw-bold">📖 ختمة جماعية</span>',
      general: '<span class="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 fw-bold">💬 عام</span>'
    };
    const catBadge = categoryBadges[g.category] || categoryBadges.general;

    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card-luxury p-4 h-100 d-flex flex-column justify-content-between position-relative shadow-sm rounded-4 border-0" style="background: var(--bg-card, #ffffff); border-top: 4px solid #25d366 !important;">
          <div>
            <div class="d-flex align-items-start justify-content-between mb-3">
              <div class="d-flex align-items-center gap-2">
                <span class="shadow-xs" style="background: rgba(37, 211, 102, 0.15); color: #128c7e; font-size: 1.4rem; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;">💬</span>
                <div>
                  <h6 class="fw-bold mb-0 text-dark">${g.name}</h6>
                  <small class="text-muted">${g.description || 'قروب واتساب مبارك'}</small>
                </div>
              </div>
              ${catBadge}
            </div>

            <!-- معلومات رابط القروب -->
            <div class="p-3 rounded-3 mb-3" style="background-color: ${hasLink ? 'rgba(37, 211, 102, 0.08)' : 'rgba(0,0,0,0.03)'};">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="small fw-bold ${hasLink ? 'text-success' : 'text-muted'}">
                  <i class="bi ${hasLink ? 'bi-link-45deg' : 'bi-exclamation-circle'} me-1"></i>
                  ${hasLink ? 'رابط القروب مفعل' : 'لم يتم إضافة رابط'}
                </span>
                ${hasLink ? `
                  <button class="btn btn-sm btn-link text-success p-0 text-decoration-none fw-bold" onclick="window.copyGroupLink('${g.id}')" title="نسخ رابط القروب">
                    <i class="bi bi-clipboard me-1"></i> نسخ الرابط
                  </button>
                ` : ''}
              </div>
              <div class="small text-truncate ${hasLink ? 'text-dark font-monospace' : 'text-muted'}" style="font-size: 0.8rem;" dir="ltr">
                ${hasLink ? g.link : 'اضغط على تعديل لإضافة رابط دعوة القروب'}
              </div>
            </div>
          </div>

          <!-- أزرار الإجراءات للقروب -->
          <div class="pt-2 border-top">
            <div class="d-flex gap-2 mb-2">
              <button class="btn btn-whatsapp w-100 fw-bold py-2 rounded-pill shadow-xs" onclick="window.openWhatsAppForGroup('${g.id}')">
                <i class="bi bi-whatsapp me-2"></i> إرسال الورد للقروب 📢
              </button>
            </div>
            <div class="d-flex gap-2 justify-content-between">
              ${hasLink ? `
                <button class="btn btn-sm btn-outline-success rounded-pill px-3 flex-grow-1 fw-bold" onclick="window.openDirectGroupChat('${g.id}')" title="نسخ الورد وفتح شات القروب">
                  <i class="bi bi-box-arrow-up-right me-1"></i> فتح الشات 🔗
                </button>
              ` : `
                <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 flex-grow-1" onclick="window.openEditGroupModal('${g.id}')">
                  <i class="bi bi-link-45deg me-1"></i> إضافة الرابط
                </button>
              `}
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="window.openEditGroupModal('${g.id}')" title="تعديل القروب">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="window.deleteGroup('${g.id}')" title="حذف القروب">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- دالة عرض قروبات الواتساب ---
  function renderWhatsAppGroups() {
    if (!window.QuraniWirdEngine || !elements.whatsappGroupsGrid) return;
    const groups = window.QuraniWirdEngine.getWhatsAppGroups ? window.QuraniWirdEngine.getWhatsAppGroups() : [];

    if (elements.badgeGroupsCount) {
      elements.badgeGroupsCount.textContent = groups.length;
    }

    if (groups.length === 0) {
      elements.whatsappGroupsGrid.innerHTML = `
        <div class="col-12">
          <div class="empty-maqraa-box p-4 text-center rounded-4 border border-dashed" style="background: var(--bg-card, #ffffff);">
            <i class="bi bi-whatsapp fs-1 text-success mb-2 d-block"></i>
            <h5 class="fw-bold text-dark">لا توجد قروبات واتساب مسجلة حالياً</h5>
            <p class="text-muted small mb-3">أضف قروبات العائلة والأصدقاء وحلقات القرآن لتتمكن من إرسال الأوراد فيها بنقرة زر واحدة.</p>
            <button class="btn btn-whatsapp-action rounded-pill px-4 fw-bold" onclick="window.openAddGroupModal()">
              <i class="bi bi-plus-circle-fill me-2"></i> إضافة أول قروب الآن 💬
            </button>
          </div>
        </div>
      `;
    } else {
      elements.whatsappGroupsGrid.innerHTML = groups.map(g => createGroupCardHtml(g)).join('');
    }
  }

  // --- عرض خطط الورد وتخصيصها ---
  function renderPlans() {
    if (!elements.plansContainer || !window.QuraniWirdEngine) return;
    const activeUser = window.QuraniWirdEngine.getActiveUser();
    const plansList = Object.values(window.QuraniWirdEngine.plans).filter((p, i, self) => i === self.findIndex(t => t.id === p.id));

    elements.plansContainer.innerHTML = plansList.map(p => {
      const isSelected = activeUser.planId === p.id;
      return `
        <div class="col-12 col-md-6 col-lg-4 mb-4">
          <div class="plan-card p-4 h-100 position-relative ${isSelected ? 'plan-active' : ''}">
            ${p.badge ? `<span class="badge bg-gold-subtle position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill fw-bold">${p.badge}</span>` : ''}
            <div class="d-flex align-items-center mb-3">
              <span class="plan-icon-container me-3">${p.icon ? `<i class="bi ${p.icon} text-gold"></i>` : '📖'}</span>
              <div>
                <h4 class="fw-bold mb-0 text-dark">${p.name}</h4>
                <small class="text-gold fw-bold">${p.approxDurationText || p.duration || ''}</small>
              </div>
            </div>
            
            <p class="text-muted small mb-3 fw-semibold">${p.description}</p>
            
            <ul class="list-unstyled small mb-4 fw-semibold">
              <li class="mb-2"><i class="bi bi-check-circle-fill text-emerald me-2"></i> الورد اليومي: ${p.pagesPerDay || p.dailyTarget || ''} صفحات</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-emerald me-2"></i> مدة الختمة: ${p.approxDurationText || p.duration || ''}</li>
              <li class="mb-2"><i class="bi bi-check-circle-fill text-emerald me-2"></i> مناسب لـ: ${p.targetAudience || 'الجميع'}</li>
            </ul>

            <button class="btn ${isSelected ? 'btn-success text-white' : 'btn-emerald-action'} w-100 rounded-pill py-2 fw-bold mt-auto" 
                    onclick="window.selectPlanForActiveUser('${p.id}')">
              ${isSelected ? '<i class="bi bi-check2-circle me-1"></i> خطتك الحالية' : 'اختيار هذه الخطة'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- محرك الواتساب ونافذة التذكير ---
  let currentWhatsAppRequestId = 0;

  async function updateWhatsAppPreview() {
    if (!elements.whatsappPreviewBubble || !window.QuraniWhatsApp || !window.QuraniWirdEngine) return;

    const templateKey = elements.whatsappTemplateSelect?.value || 'wird_full_text';
    const owner = window.QuraniWirdEngine.getOwner();
    
    // تحديد المستلم بناءً على القائمة المنسدلة أو الحالة النشطة
    const recipientId = elements.whatsappRecipientSelect?.value || (state.currentWhatsAppUser ? state.currentWhatsAppUser.id : 'owner');
    let person = null;
    if (recipientId === 'owner') {
      person = owner;
    } else {
      person = window.QuraniWirdEngine.getContacts('all').find(u => u.id === recipientId) || state.currentWhatsAppUser || owner;
    }

    const isSpecificContact = (person && person.id !== 'owner');
    const targetPhone = isSpecificContact ? (person.phone || '') : (owner.phone || '');
    const isGroupTemplate = templateKey.startsWith('group_summary');
    const effectivePhone = isGroupTemplate ? '' : targetPhone;

    // إخفاء إشعارات وروابط القروب الفردية
    if (elements.whatsappGroupInfoBanner) {
      elements.whatsappGroupInfoBanner.classList.add('d-none');
    }
    if (elements.btnOpenGroupDirect) {
      elements.btnOpenGroupDirect.classList.add('d-none');
    }

    // تحديث نص زر الإرسال والتلميح الإرشادي
    const hintElem = document.getElementById('whatsappRecipientHint');
    if (elements.btnSendWhatsAppText) {
      if (effectivePhone && isSpecificContact) {
        elements.btnSendWhatsAppText.textContent = `إرسال مباشرة إلى ${person.name} (${effectivePhone}) عبر واتساب 💬`;
        if (hintElem) {
          hintElem.innerHTML = `<i class="bi bi-check-circle-fill text-success me-1"></i> سيتم فتح محادثة <strong>${person.name}</strong> مباشرة على الرقم <strong>${effectivePhone}</strong> مع استخدام اسمه في الرسالة.`;
        }
      } else if (isSpecificContact && !effectivePhone) {
        elements.btnSendWhatsAppText.textContent = `إرسال باسم ${person.name} (اختيار المحادثة من واتساب)`;
        if (hintElem) {
          hintElem.innerHTML = `<i class="bi bi-exclamation-circle text-warning me-1"></i> لم يُسجل رقم هاتف لـ <strong>${person.name}</strong>، سيتم فتح واتساب لاختيار المحادثة يدوياً مع إدراج اسمه بالرسالة.`;
        }
      } else if (effectivePhone && !isSpecificContact) {
        elements.btnSendWhatsAppText.textContent = `إرسال مباشرة إلى رقمي (${effectivePhone}) عبر واتساب 💬`;
        if (hintElem) {
          hintElem.innerHTML = `<i class="bi bi-check-circle-fill text-success me-1"></i> سيتم إرسال الورد إلى رقمك المسجل <strong>${effectivePhone}</strong>.`;
        }
      } else {
        elements.btnSendWhatsAppText.textContent = 'اختيار جهات الاتصال من الواتساب (مشاركة عامة)';
        if (hintElem) {
          hintElem.innerHTML = `<i class="bi bi-info-circle me-1"></i> مشاركة عامة باسم «أخي / أختي»، سيفتح واتساب لتختار أي شخص أو مجموعة ترغب بمشاركتها معهم.`;
        }
      }
    }

    const requestId = ++currentWhatsAppRequestId;
    let messageText = '';

    if (templateKey === 'wird_full_text') {
      elements.whatsappPreviewBubble.innerHTML = `
        <div class="text-center py-4">
          <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
          <span class="text-muted fw-bold">جارٍ جلب وتنسيق نص آيات صفحة الورد برسم المصحف الشريف... ⏳</span>
        </div>
      `;
      try {
        const wird = window.QuraniWirdEngine.calculateWirdForUser(person);
        messageText = await window.QuraniWhatsApp.generateFullWirdTextMessage(person, wird);
      } catch (err) {
        console.warn('تعذر جلب نص الآيات كاملاً، يتم التحويل لقالب التذكير البديل', err);
        const wird = window.QuraniWirdEngine.calculateWirdForUser(person);
        messageText = window.QuraniWhatsApp.generateDailyWirdMessage(person, wird);
      }
    } else if (templateKey === 'daily_wird') {
      const wird = window.QuraniWirdEngine.calculateWirdForUser(person);
      messageText = window.QuraniWhatsApp.generateDailyWirdMessage(person, wird);
    } else if (templateKey === 'wird_congrats') {
      const wird = window.QuraniWirdEngine.calculateWirdForUser(person);
      messageText = window.QuraniWhatsApp.generateCongratsMessage(person, wird);
    } else if (templateKey === 'owner_share') {
      const wird = window.QuraniWirdEngine.calculateWirdForUser(owner);
      messageText = window.QuraniWhatsApp.generateOwnerShareMessage(owner, wird);
    } else if (templateKey === 'group_summary_family') {
      messageText = window.QuraniWhatsApp.generateGroupSummaryMessage('family');
    } else if (templateKey === 'group_summary_friends') {
      messageText = window.QuraniWhatsApp.generateGroupSummaryMessage('friends');
    } else if (templateKey === 'group_summary_custom') {
      messageText = window.QuraniWhatsApp.generateGroupSummaryMessage('all');
    } else if (templateKey === 'friday_kahf') {
      messageText = window.QuraniWhatsApp.generateFridayKahfMessage(person);
    } else if (templateKey === 'morning_adhkar') {
      messageText = window.QuraniWhatsApp.generateAdhkarReminderMessage(person, 'morning');
    } else if (templateKey === 'evening_adhkar') {
      messageText = window.QuraniWhatsApp.generateAdhkarReminderMessage(person, 'evening');
    }

    if (requestId !== currentWhatsAppRequestId) {
      return; // المستخدم غيّر الخيار أثناء جلب الآيات
    }

    elements.whatsappPreviewBubble.innerHTML = (messageText || '').replace(/\n/g, '<br>');
    elements.whatsappPreviewBubble.dataset.rawText = messageText || '';
    elements.whatsappPreviewBubble.dataset.phone = effectivePhone || '';
    elements.whatsappPreviewBubble.dataset.recipientName = person ? person.name : '';
    elements.whatsappPreviewBubble.dataset.groupLink = '';
    elements.whatsappPreviewBubble.dataset.groupId = '';
  }

  // --- دوال الربط العامة (Global Window Helpers) ---
  window.switchTab = switchTab;
  window.setTheme = setTheme;
  window.resumeFromBookmark = resumeFromBookmark;

  window.openAdhkarCategoryFromHome = (cat) => {
    state.activeAdhkarCategory = cat;
    switchTab('adhkar');
  };

  window.openOwnerSettingsModal = () => {
    if (!window.QuraniWirdEngine) return;
    const owner = window.QuraniWirdEngine.getOwner();
    if (!owner) return;

    if (elements.ownerSettingsName) elements.ownerSettingsName.value = owner.name || '';
    if (elements.ownerSettingsPhone) elements.ownerSettingsPhone.value = owner.phone || '';
    if (elements.ownerSettingsPlan) elements.ownerSettingsPlan.value = owner.planId || 'safa';
    if (elements.ownerSettingsPage) elements.ownerSettingsPage.value = owner.currentPage || 1;
    if (elements.ownerSettingsCustomPages) elements.ownerSettingsCustomPages.value = owner.customPagesPerDay || 5;

    if (elements.ownerSettingsCustomPagesBox) {
      elements.ownerSettingsCustomPagesBox.classList.toggle('d-none', owner.planId !== 'custom');
    }

    const modal = new bootstrap.Modal(document.getElementById('ownerSettingsModal'));
    modal.show();
  };

  window.shareOwnerWirdWhatsApp = () => {
    updateWhatsAppRecipientDropdown();
    if (elements.whatsappRecipientSelect) elements.whatsappRecipientSelect.value = 'owner';
    if (elements.whatsappTemplateSelect) elements.whatsappTemplateSelect.value = 'owner_share';
    updateWhatsAppPreview();
    const modal = new bootstrap.Modal(document.getElementById('whatsappModal'));
    modal.show();
  };

  window.shareGroupSummaryWhatsApp = async (groupType = 'family') => {
    updateWhatsAppRecipientDropdown();
    if (elements.whatsappTemplateSelect) {
      elements.whatsappTemplateSelect.value = (groupType === 'friends') ? 'group_summary_friends' : 'group_summary_family';
    }
    updateWhatsAppPreview();

    // نسخ نص الورد اليومي تلقائياً إلى الحافظة
    const rawText = elements.whatsappPreviewBubble ? elements.whatsappPreviewBubble.dataset.rawText : '';
    if (rawText && window.QuraniWhatsApp) {
      await window.QuraniWhatsApp.copyToClipboard(rawText);
      showToast('تم نسخ الورد اليومي بنجاح 📋', 'تم نسخ الورد مع رابط الموقع؛ جاهز للمشاركة وإرساله عبر واتساب.');
    }

    const modal = new bootstrap.Modal(document.getElementById('whatsappModal'));
    modal.show();
  };

  window.toggleContactCompleted = (contactId) => {
    if (!window.QuraniWirdEngine) return;
    const res = window.QuraniWirdEngine.toggleContactCompleted(contactId);
    if (!res) return;
    renderFamilyMembers();
    if (res.completed) {
      triggerCelebration();
      showToast('تقبل الله طاعتهم 🌸', `تم تسجيل إتمام الورد لـ ${res.contact.name} وزيادة التزامه.`);
    } else {
      showToast('تم التعديل', `تم إلغاء حالة الإتمام لـ ${res.contact.name}.`);
    }
  };

  window.deleteMemberContact = (contactId) => {
    if (!window.QuraniWirdEngine) return;
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا القارئ من المقرأة؟')) {
      window.QuraniWirdEngine.deleteContact(contactId);
      renderFamilyMembers();
      updateWhatsAppRecipientDropdown();
      showToast('تم الحذف بنجاح', 'تمت إزالة القارئ من قائمة المقرأة.');
    }
  };

  window.selectSurah = (surahNum) => {
    state.currentSurah = parseInt(surahNum, 10);
    const surah = window.QuraniData.getSurahByNumber(state.currentSurah);
    if (surah) {
      state.currentPage = surah.startPage;
    }
    if (elements.surahSelect) elements.surahSelect.value = state.currentSurah;
    if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
    if (elements.mushafPageSlider) elements.mushafPageSlider.value = state.currentPage;
    switchTab('mushaf');
  };

  window.selectPlanForActiveUser = (planId) => {
    window.QuraniWirdEngine.changeActiveUserPlan(planId);
    updateDashboardUI();
    renderPlans();
    showToast('تم تفعيل الخطة بنجاح ✨', 'نسأل الله لك البركة والتوفيق في ختم كتابه الكريم.');
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

  window.copyDhikrText = async (itemId, btn) => {
    const card = btn.closest('.adhkar-card');
    const textElem = card ? card.querySelector('.adhkar-arabic-text') : null;
    if (!textElem) return;

    try {
      await navigator.clipboard.writeText(textElem.textContent.trim());
      const oldHtml = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check2 text-success"></i>';
      setTimeout(() => { btn.innerHTML = oldHtml; }, 2000);
      showToast('تم النسخ بنجاح 📋', 'تم نسخ الذكر المبارك إلى الحافظة.');
    } catch (e) {
      // Ignored
    }
  };

  window.showAyahTafseer = async (surahNum, ayahNum) => {
    const modalElem = document.getElementById('tafseerModal');
    const titleElem = document.getElementById('tafseerSurahTitle');
    const textElem = document.getElementById('tafseerAyahText');
    const contentElem = document.getElementById('tafseerContentBody');

    if (!modalElem || !window.QuraniData) return;

    const surah = window.QuraniData.getSurahByNumber(surahNum);
    titleElem.textContent = `تفسير الآية (${ayahNum}) من سورة ${surah ? (surah.nameSimple || surah.name) : surahNum}`;
    contentElem.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-emerald"></div></div>`;

    const bsModal = new bootstrap.Modal(modalElem);
    bsModal.show();

    // جلب التفسير من البيانات المدمجة أو API
    let tafseer = window.QuraniData.sampleTafseer ? window.QuraniData.sampleTafseer[`${surahNum}:${ayahNum}`] : null;
    if (!tafseer) {
      try {
        const resp = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/ar.muyassar`);
        const data = await resp.json();
        tafseer = data?.data?.text || 'التفسير الميسر: نسأل الله أن ينفعنا بهذه الآية الكريمة ويهدينا بنورها.';
      } catch (e) {
        tafseer = 'التفسير الميسر: قراءة الآية وتدبر معانيها وتطبيق أحكامها نور في الدنيا ونجاة في الآخرة.';
      }
    }

    contentElem.textContent = tafseer;
  };

  // دالة تعبئة قائمة مستلمي الواتساب مصنفة
  function updateWhatsAppRecipientDropdown() {
    if (!elements.whatsappRecipientSelect || !window.QuraniWirdEngine) return;
    const owner = window.QuraniWirdEngine.getOwner();
    const family = window.QuraniWirdEngine.getContacts('family');
    const friends = window.QuraniWirdEngine.getContacts('friends');

    const ownerDisplayName = (owner && owner.name && owner.name !== 'أحمد') ? owner.name : 'أخي / أختي';

    let html = `
      <optgroup label="✨ مشاركة عامة / وردي الشخصي">
        <option value="owner">وردي الشخصي (${ownerDisplayName}) ${owner.phone ? '- ' + owner.phone : '(مشاركة عامة باسم أخي / أختي)'}</option>
      </optgroup>
    `;

    if (family.length > 0) {
      html += `<optgroup label="👨‍👩‍👧‍👦 أفراد مقرأة الأهل">`;
      html += family.map(u => `<option value="${u.id}">${u.name} (${u.relation || 'الأهل'}) ${u.phone ? '📱 ' + u.phone : '(بدون رقم)'}</option>`).join('');
      html += `</optgroup>`;
    }
    if (friends.length > 0) {
      html += `<optgroup label="👥 أفراد مقرأة الأصدقاء">`;
      html += friends.map(u => `<option value="${u.id}">${u.name} (${u.relation || 'صديق'}) ${u.phone ? '📱 ' + u.phone : '(بدون رقم)'}</option>`).join('');
      html += `</optgroup>`;
    }
    elements.whatsappRecipientSelect.innerHTML = html;
  }

  window.openWhatsAppForMember = (userId) => {
    if (userId && window.QuraniWirdEngine) {
      state.currentWhatsAppUser = window.QuraniWirdEngine.getContacts('all').find(u => u.id === userId) || null;
    } else {
      state.currentWhatsAppUser = null;
    }
    updateWhatsAppRecipientDropdown();
    if (elements.whatsappRecipientSelect && userId) {
      elements.whatsappRecipientSelect.value = userId;
    }
    if (elements.whatsappTemplateSelect) {
      elements.whatsappTemplateSelect.value = 'wird_full_text';
    }
    updateWhatsAppPreview();
    const modal = new bootstrap.Modal(document.getElementById('whatsappModal'));
    modal.show();
  };

  // --- دوال قروبات الواتساب العامة ---
  window.openWhatsAppForGroup = (groupId) => {
    updateWhatsAppRecipientDropdown();
    if (elements.whatsappRecipientSelect && groupId) {
      elements.whatsappRecipientSelect.value = groupId;
    }
    if (elements.whatsappTemplateSelect) {
      elements.whatsappTemplateSelect.value = 'group_summary_custom';
    }
    updateWhatsAppPreview();
    const modal = new bootstrap.Modal(document.getElementById('whatsappModal'));
    modal.show();
  };

  window.openDirectGroupChat = async (groupId) => {
    if (!window.QuraniWirdEngine || !window.QuraniWhatsApp) return;
    const group = window.QuraniWirdEngine.getWhatsAppGroupById(groupId);
    if (!group) return;
    if (!group.link) {
      window.openEditGroupModal(groupId);
      showToast('أضف رابط القروب 🔗', 'الرجاء وضع رابط القروب أولاً لتتمكن من فتحه مباشرة.');
      return;
    }

    // تجهيز رسالة الورد المناسبة
    const groupCategory = (group.category === 'friends') ? 'friends' : ((group.category === 'family') ? 'family' : 'all');
    const msg = window.QuraniWhatsApp.generateGroupSummaryMessage(groupCategory, null, group.name);

    await window.QuraniWhatsApp.openGroupWithClipboard(group.link, msg);
    showToast('تم نسخ الورد بنجاح 📋✨', 'تم فتح شات القروب! الصق الورد في الشات واضغط إرسال.');
  };

  window.copyGroupLink = async (groupId) => {
    if (!window.QuraniWirdEngine || !window.QuraniWhatsApp) return;
    const group = window.QuraniWirdEngine.getWhatsAppGroupById(groupId);
    if (!group || !group.link) return;
    await window.QuraniWhatsApp.copyToClipboard(group.link);
    showToast('تم نسخ رابط القروب 🔗', 'تم نسخ رابط دعوة القروب إلى الحافظة.');
  };

  window.openAddGroupModal = (category = 'general') => {
    if (elements.groupForm) elements.groupForm.reset();
    if (elements.groupFormId) elements.groupFormId.value = '';
    if (elements.groupFormCategory) elements.groupFormCategory.value = category;
    if (elements.groupModalTitle) elements.groupModalTitle.textContent = 'إضافة قروب واتساب جديد';
    if (elements.btnDeleteGroup) elements.btnDeleteGroup.classList.add('d-none');

    const modal = new bootstrap.Modal(document.getElementById('groupModal'));
    modal.show();
  };

  window.openEditGroupModal = (groupId) => {
    if (!window.QuraniWirdEngine) return;
    const group = window.QuraniWirdEngine.getWhatsAppGroupById(groupId);
    if (!group) return;

    if (elements.groupFormId) elements.groupFormId.value = group.id;
    if (elements.groupFormName) elements.groupFormName.value = group.name || '';
    if (elements.groupFormLink) elements.groupFormLink.value = group.link || '';
    if (elements.groupFormCategory) elements.groupFormCategory.value = group.category || 'general';
    if (elements.groupFormDesc) elements.groupFormDesc.value = group.description || '';
    if (elements.groupModalTitle) elements.groupModalTitle.textContent = `تعديل قروب: ${group.name}`;
    if (elements.btnDeleteGroup) elements.btnDeleteGroup.classList.remove('d-none');

    const modal = new bootstrap.Modal(document.getElementById('groupModal'));
    modal.show();
  };

  window.deleteGroup = (groupId) => {
    if (!window.QuraniWirdEngine) return;
    const group = window.QuraniWirdEngine.getWhatsAppGroupById(groupId);
    const name = group ? group.name : 'هذا القروب';
    if (confirm(`هل أنت متأكد من حذف «${name}» من قائمة القروبات؟`)) {
      window.QuraniWirdEngine.deleteWhatsAppGroup(groupId);
      renderWhatsAppGroups();
      updateWhatsAppRecipientDropdown();
      showToast('تم حذف القروب', 'تمت إزالة القروب بنجاح.');
    }
  };

  window.openAddMemberModal = (groupType = 'family') => {
    const familyRadio = document.getElementById('groupTypeFamily');
    const friendsRadio = document.getElementById('groupTypeFriends');
    const relationInput = document.getElementById('newMemberRelation');

    if (groupType === 'friends' && friendsRadio) {
      friendsRadio.checked = true;
      if (relationInput) relationInput.placeholder = 'مثلاً: صديق الطفولة، زميل العمل، رفيق المسجد';
    } else if (familyRadio) {
      familyRadio.checked = true;
      if (relationInput) relationInput.placeholder = 'مثلاً: الوالد، الوالدة، الأخت، الابن';
    }

    const modal = new bootstrap.Modal(document.getElementById('addMemberModal'));
    modal.show();
  };

  window.filterMaqraaView = (view = 'all', btn = null) => {
    const familyBlock = document.getElementById('maqraaFamilyBlock');
    const friendsBlock = document.getElementById('maqraaFriendsBlock');
    const groupsBlock = document.getElementById('maqraaGroupsBlock');
    const tabs = document.querySelectorAll('#maqraaTabsGroup .maqraa-tab-btn');

    tabs.forEach(t => {
      const tabView = t.getAttribute('data-maqraa-view');
      if (btn && t === btn) {
        t.classList.add('active');
      } else if (!btn && tabView === view) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    if (view === 'family') {
      if (familyBlock) familyBlock.classList.remove('d-none');
      if (friendsBlock) friendsBlock.classList.add('d-none');
      if (groupsBlock) groupsBlock.classList.add('d-none');
    } else if (view === 'friends') {
      if (familyBlock) familyBlock.classList.add('d-none');
      if (friendsBlock) friendsBlock.classList.remove('d-none');
      if (groupsBlock) groupsBlock.classList.add('d-none');
    } else if (view === 'groups') {
      if (familyBlock) familyBlock.classList.add('d-none');
      if (friendsBlock) friendsBlock.classList.add('d-none');
      if (groupsBlock) groupsBlock.classList.remove('d-none');
    } else {
      if (familyBlock) familyBlock.classList.remove('d-none');
      if (friendsBlock) friendsBlock.classList.remove('d-none');
      if (groupsBlock) groupsBlock.classList.remove('d-none');
    }
  };

  // --- مستمعو الأحداث (Event Listeners) ---
  document.querySelectorAll('[data-nav-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-nav-target'));
    });
  });

  // زر إتمام الورد اليومي
  if (elements.btnMarkWirdDone) {
    elements.btnMarkWirdDone.addEventListener('click', () => {
      window.QuraniWirdEngine.markTodayWirdCompleted();
      const updatedUser = window.QuraniWirdEngine.getActiveUser();
      if (updatedUser && typeof syncPageWithBackend === 'function') {
        syncPageWithBackend(updatedUser.currentPage);
      }
      updateDashboardUI();
      triggerCelebration();
    });
  }

  // زر بدء تلاوة الورد
  if (elements.btnStartWirdReading) {
    elements.btnStartWirdReading.addEventListener('click', () => {
      const user = window.QuraniWirdEngine ? window.QuraniWirdEngine.getActiveUser() : null;
      const wird = (user && window.QuraniWirdEngine) ? window.QuraniWirdEngine.calculateWirdForUser(user) : null;
      const startPage = Math.max(1, Math.min(604, (wird && wird.startPage) || (user && user.currentPage) || 1));
      state.currentPage = startPage;

      const pageInfo = window.QuraniData ? window.QuraniData.getPageInfo(startPage) : null;
      if (pageInfo && pageInfo.primarySurah) {
        state.currentSurah = pageInfo.primarySurah.id;
        if (elements.surahSelect) elements.surahSelect.value = state.currentSurah;
      }

      if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
      if (elements.mushafPageSlider) elements.mushafPageSlider.value = state.currentPage;
      if (elements.sliderPageIndicator) elements.sliderPageIndicator.textContent = `ص ${state.currentPage}`;

      switchTab('mushaf');
      renderMushafView();
    });
  }

  // زر حفظ علامة التوقف في المصحف
  if (elements.btnBookmarkPage) {
    elements.btnBookmarkPage.addEventListener('click', () => {
      saveBookmark(state.currentSurah, state.currentPage);
    });
  }

  // التنقل بين الصفحات في المصحف
  if (elements.btnPrevPage) {
    elements.btnPrevPage.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
        if (elements.mushafPageSlider) elements.mushafPageSlider.value = state.currentPage;
        renderMushafView();
      }
    });
  }
  if (elements.btnNextPage) {
    elements.btnNextPage.addEventListener('click', () => {
      if (state.currentPage < 604) {
        state.currentPage++;
        if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
        if (elements.mushafPageSlider) elements.mushafPageSlider.value = state.currentPage;
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
      if (elements.mushafPageSlider) elements.mushafPageSlider.value = state.currentPage;
      renderMushafView();
    });
  }
  if (elements.mushafPageSlider) {
    elements.mushafPageSlider.addEventListener('input', (e) => {
      state.currentPage = parseInt(e.target.value, 10);
      if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
      if (elements.sliderPageIndicator) elements.sliderPageIndicator.textContent = `ص ${state.currentPage}`;
    });
    elements.mushafPageSlider.addEventListener('change', () => {
      renderMushafView();
    });
  }
  if (elements.juzSelect) {
    elements.juzSelect.addEventListener('change', (e) => {
      const juzNum = parseInt(e.target.value, 10);
      if (!juzNum || !window.QuraniData) return;
      const meta = window.QuraniData.JUZ_METADATA ? window.QuraniData.JUZ_METADATA[juzNum] : null;
      const startPage = meta ? meta.startPage : Math.round((juzNum - 1) * 20.1 + 1);
      state.currentPage = startPage;
      if (elements.pageSelect) elements.pageSelect.value = state.currentPage;
      if (elements.mushafPageSlider) elements.mushafPageSlider.value = state.currentPage;
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
      const filtered = window.QuraniData.surahs.filter(s => {
        const name = s.nameSimple || s.name;
        const num = (s.number || s.id).toString();
        const eng = (s.englishName || '').toLowerCase();
        return name.includes(query) || num.includes(query) || eng.includes(query);
      });
      renderSurahsGrid(filtered);
    });
  }

  // أزرار السبحة الإلكترونية
  if (elements.btnTasbeehTap) {
    elements.btnTasbeehTap.addEventListener('click', tapTasbeeh);
  }
  if (elements.btnTasbeehReset) {
    elements.btnTasbeehReset.addEventListener('click', () => {
      state.tasbeeh.count = 0;
      updateTasbeehUI();
      showToast('تم تصفير العداد 🔄', 'يمكنك البدء بدورة تسبيح جديدة.');
    });
  }
  if (elements.tasbeehPhraseSelect) {
    elements.tasbeehPhraseSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      state.tasbeeh.count = 0;
      if (val === 'subhanallah' || val === 'alhamdulillah' || val === 'allahuakbar') {
        state.tasbeeh.target = 33;
      } else if (val === 'free') {
        state.tasbeeh.target = 0;
      } else {
        state.tasbeeh.target = 100;
      }
      updateTasbeehUI();
    });
  }

  // أزرار الاختيار السريع للذكر
  document.querySelectorAll('.tasbeeh-chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const phrase = chip.getAttribute('data-phrase');
      if (elements.tasbeehPhraseSelect) {
        elements.tasbeehPhraseSelect.value = phrase;
        elements.tasbeehPhraseSelect.dispatchEvent(new Event('change'));
      }
    });
  });

  // تبديل الصوت والاهتزاز للسبحة
  if (elements.btnToggleSound) {
    elements.btnToggleSound.addEventListener('click', () => {
      state.tasbeeh.soundEnabled = !state.tasbeeh.soundEnabled;
      localStorage.setItem('qurani_sound', state.tasbeeh.soundEnabled);
      updateTasbeehUI();
      showToast('صوت التسبيح', state.tasbeeh.soundEnabled ? 'تم تفعيل الصوت 🔊' : 'تم كتم الصوت 🔇');
    });
  }
  if (elements.btnToggleVibrate) {
    elements.btnToggleVibrate.addEventListener('click', () => {
      state.tasbeeh.vibrateEnabled = !state.tasbeeh.vibrateEnabled;
      localStorage.setItem('qurani_vibrate', state.tasbeeh.vibrateEnabled);
      updateTasbeehUI();
      showToast('اهتزاز التسبيح', state.tasbeeh.vibrateEnabled ? 'تم تفعيل الاهتزاز 📳' : 'تم إيقاف الاهتزاز 📴');
    });
  }

  // تبويبات الأذكار
  document.querySelectorAll('.adhkar-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      renderAdhkarCategory(btn.getAttribute('data-category'));
    });
  });

  // أحداث نافذة الواتساب
  if (elements.whatsappRecipientSelect) {
    elements.whatsappRecipientSelect.addEventListener('change', () => {
      const selectedId = elements.whatsappRecipientSelect.value;
      if (selectedId === 'owner') {
        state.currentWhatsAppUser = null;
      } else {
        const contact = window.QuraniWirdEngine.getContacts('all').find(u => u.id === selectedId);
        state.currentWhatsAppUser = contact || null;
      }
      updateWhatsAppPreview();
    });
  }
  if (elements.whatsappTemplateSelect) {
    elements.whatsappTemplateSelect.addEventListener('change', updateWhatsAppPreview);
  }
  if (elements.btnSendWhatsAppDirect) {
    elements.btnSendWhatsAppDirect.addEventListener('click', async () => {
      const rawText = elements.whatsappPreviewBubble ? (elements.whatsappPreviewBubble.dataset.rawText || '') : '';
      const phone = elements.whatsappPreviewBubble ? (elements.whatsappPreviewBubble.dataset.phone || '') : '';
      if (rawText && window.QuraniWhatsApp) {
        await window.QuraniWhatsApp.copyToClipboard(rawText);
      }
      // إرسال مباشر للرقم المحدد إن وجد، أو فتح شات عام إن لم يتوفر رقم
      window.QuraniWhatsApp.openWhatsApp(phone, rawText);
    });
  }
  if (elements.btnOpenGroupDirect) {
    elements.btnOpenGroupDirect.addEventListener('click', async () => {
      const groupLink = elements.whatsappPreviewBubble.dataset.groupLink;
      const rawText = elements.whatsappPreviewBubble.dataset.rawText;
      if (!groupLink) {
        showToast('تنبيه ⚠️', 'الرجاء إضافة رابط القروب أولاً.');
        return;
      }
      await window.QuraniWhatsApp.openGroupWithClipboard(groupLink, rawText);
      showToast('تم نسخ الورد بنجاح 📋✨', 'تم فتح شات القروب! الصق الورد في الشات واضغط إرسال.');
    });
  }
  if (elements.btnEditCurrentGroupLink) {
    elements.btnEditCurrentGroupLink.addEventListener('click', () => {
      const groupId = elements.whatsappPreviewBubble.dataset.groupId;
      if (groupId) {
        window.openEditGroupModal(groupId);
      }
    });
  }
  if (elements.btnCopyWhatsAppText) {
    elements.btnCopyWhatsAppText.addEventListener('click', async () => {
      const rawText = elements.whatsappPreviewBubble.dataset.rawText;
      await window.QuraniWhatsApp.copyToClipboard(rawText);
      showToast('تم النسخ بنجاح 📋', 'تم نسخ نص الرسالة إلى الحافظة.');
    });
  }

  // أحداث نموذج إضافة وتعديل قروب واتساب
  if (elements.groupForm) {
    elements.groupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!window.QuraniWirdEngine) return;

      const id = elements.groupFormId ? elements.groupFormId.value : '';
      const name = elements.groupFormName ? elements.groupFormName.value.trim() : '';
      const link = elements.groupFormLink ? elements.groupFormLink.value.trim() : '';
      const category = elements.groupFormCategory ? elements.groupFormCategory.value : 'general';
      const description = elements.groupFormDesc ? elements.groupFormDesc.value.trim() : '';

      if (!name) {
        showToast('تنبيه ⚠️', 'الرجاء إدخال اسم القروب.');
        return;
      }

      if (id) {
        window.QuraniWirdEngine.updateWhatsAppGroup(id, { name, link, category, description });
        showToast('تم تحديث القروب بنجاح ✨', `تم حفظ بيانات «${name}».`);
      } else {
        const newG = window.QuraniWirdEngine.addWhatsAppGroup({ name, link, category, description });
        showToast('تمت إضافة القروب بنجاح 💬🎉', `تمت إضافة «${name}» إلى قائمة القروبات.`);
        if (elements.whatsappRecipientSelect) {
          elements.whatsappRecipientSelect.value = newG.id;
        }
      }

      renderWhatsAppGroups();
      updateWhatsAppRecipientDropdown();
      updateWhatsAppPreview();

      const modalElem = document.getElementById('groupModal');
      const bsModal = bootstrap.Modal.getInstance(modalElem);
      if (bsModal) bsModal.hide();
    });
  }

  if (elements.btnDeleteGroup) {
    elements.btnDeleteGroup.addEventListener('click', () => {
      const id = elements.groupFormId ? elements.groupFormId.value : '';
      if (id) {
        window.deleteGroup(id);
        const modalElem = document.getElementById('groupModal');
        const bsModal = bootstrap.Modal.getInstance(modalElem);
        if (bsModal) bsModal.hide();
      }
    });
  }

  // نموذج إضافة قارئ جديد للمقرأة المصغرة
  const addMemberForm = document.getElementById('addMemberForm');
  const groupTypeFamilyRadio = document.getElementById('groupTypeFamily');
  const groupTypeFriendsRadio = document.getElementById('groupTypeFriends');
  const memberRelationInput = document.getElementById('newMemberRelation');

  if (groupTypeFamilyRadio && memberRelationInput) {
    groupTypeFamilyRadio.addEventListener('change', () => {
      if (groupTypeFamilyRadio.checked) memberRelationInput.placeholder = 'مثلاً: الوالد، الوالدة، الأخت، الابن';
    });
  }
  if (groupTypeFriendsRadio && memberRelationInput) {
    groupTypeFriendsRadio.addEventListener('change', () => {
      if (groupTypeFriendsRadio.checked) memberRelationInput.placeholder = 'مثلاً: صديق الطفولة، زميل العمل، رفيق المسجد';
    });
  }

  if (addMemberForm) {
    addMemberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newMemberName')?.value.trim();
      const phone = document.getElementById('newMemberPhone')?.value.trim();
      const planId = document.getElementById('newMemberPlan')?.value || 'safa';
      const relation = document.getElementById('newMemberRelation')?.value.trim();
      const groupType = document.querySelector('input[name="newMemberGroupType"]:checked')?.value || 'family';
      const startPage = Math.max(1, parseInt(document.getElementById('newMemberPage')?.value, 10) || 1);

      if (!name) return;

      window.QuraniWirdEngine.addContact({
        name,
        phone,
        planId,
        relation,
        groupType,
        currentPage: startPage
      });

      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addMemberModal'));
      if (modalInstance) modalInstance.hide();
      addMemberForm.reset();
      if (groupTypeFamilyRadio) groupTypeFamilyRadio.checked = true;
      if (memberRelationInput) memberRelationInput.placeholder = 'مثلاً: الوالد، الأخت، صديق العمل';

      updateDashboardUI();
      renderFamilyMembers();
      updateWhatsAppRecipientDropdown();
      const groupName = groupType === 'friends' ? 'مقرأة الأصدقاء 👥' : 'مقرأة الأهل 👨‍👩‍👧‍👦';
      showToast('قارئ جديد في المقرأة 🌸', `تمت إضافة ${name} بنجاح إلى ${groupName}.`);
    });
  }

  // نموذج إعدادات حساب المالك
  const ownerSettingsForm = document.getElementById('ownerSettingsForm');
  const ownerSettingsPlan = document.getElementById('ownerSettingsPlan');
  const ownerSettingsCustomPagesBox = document.getElementById('ownerSettingsCustomPagesBox');

  if (ownerSettingsPlan && ownerSettingsCustomPagesBox) {
    ownerSettingsPlan.addEventListener('change', () => {
      ownerSettingsCustomPagesBox.classList.toggle('d-none', ownerSettingsPlan.value !== 'custom');
    });
  }

  if (ownerSettingsForm) {
    ownerSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('ownerSettingsName')?.value.trim();
      const phone = document.getElementById('ownerSettingsPhone')?.value.trim();
      const planId = document.getElementById('ownerSettingsPlan')?.value;
      const customPages = document.getElementById('ownerSettingsCustomPages')?.value;
      const currentPage = document.getElementById('ownerSettingsPage')?.value;

      if (!name) return;

      window.QuraniWirdEngine.updateOwner({
        name,
        phone,
        planId,
        customPagesPerDay: customPages ? parseInt(customPages, 10) : undefined,
        currentPage: currentPage ? parseInt(currentPage, 10) : undefined
      });

      const savedAcc = (typeof getSavedUserAccount === 'function') ? getSavedUserAccount() : null;
      if (savedAcc) {
        savedAcc.name = name;
        if (phone) savedAcc.phone = phone;
        if (planId) savedAcc.planId = planId;
        if (currentPage) savedAcc.currentPage = parseInt(currentPage, 10);
        if (customPages) savedAcc.customPagesPerDay = parseInt(customPages, 10);
        saveUserAccount(savedAcc);
        if (typeof updateNotificationUIState === 'function') updateNotificationUIState();
      }
      if (typeof syncPageWithBackend === 'function' && currentPage) {
        syncPageWithBackend(parseInt(currentPage, 10));
      }

      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('ownerSettingsModal'));
      if (modalInstance) modalInstance.hide();

      updateDashboardUI();
      renderPlans();
      updateWhatsAppRecipientDropdown();
      showToast('تم حفظ إعدادات حساب المالك بنجاح ✨', `مرحباً بك يا ${name}. نسأل الله لك التوفيق والبركة.`);
    });
  }

  // الحاسبة الذكية للخطة المخصصة
  function updateCustomCalc(pages) {
    const p = Math.max(1, parseInt(pages, 10) || 1);
    const days = Math.ceil(604 / p);
    const months = (days / 30).toFixed(1);
    if (elements.customCalcResult) {
      elements.customCalcResult.innerHTML = `
        <span class="text-gold-light fw-bold">ختمة كاملة خلال ${days} يوماً</span> (حوالي ${months} شهر)
      `;
    }
  }

  if (elements.customCalcInput) {
    elements.customCalcInput.addEventListener('input', (e) => {
      const p = e.target.value;
      if (elements.customCalcSlider) elements.customCalcSlider.value = p;
      updateCustomCalc(p);
    });
  }
  if (elements.customCalcSlider) {
    elements.customCalcSlider.addEventListener('input', (e) => {
      const p = e.target.value;
      if (elements.customCalcInput) elements.customCalcInput.value = p;
      updateCustomCalc(p);
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

  // =========================================================================
  // إدارة حساب المستخدم والإشعارات اليومية (Push Notifications & Accounts)
  // =========================================================================
  const USER_ACCOUNT_STORAGE_KEY = 'qurani_user_account_v1';

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function getSavedUserAccount() {
    try {
      const data = localStorage.getItem(USER_ACCOUNT_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveUserAccount(account) {
    try {
      localStorage.setItem(USER_ACCOUNT_STORAGE_KEY, JSON.stringify(account));
    } catch (e) {}
  }

  async function registerServiceWorkerAndGetSubscription() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('متصفحك لا يدعم Service Worker المطلوب لتشغيل الإشعارات.');
    }
    if (!('PushManager' in window)) {
      throw new Error('متصفحك لا يدعم إشعارات الويب المباشرة (Web Push). يرجى استخدام متصفح حديث مثل Chrome أو Edge أو Safari.');
    }

    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('لم يتم السماح بالإشعارات. يرجى تفعيل الإشعارات لهذا الموقع من إعدادات المتصفح.');
    }

    let publicKey = 'BHk4n3Fpl2PyCT5CvxsGRr4Y05-QsmvowxxbbjmZHwnU6iF587CohLpGMNM89tc8poXh9mUvfwpNqrm5fmIIBEk';
    try {
      const res = await fetch('/api/notifications/vapid-public-key');
      if (res.ok) {
        const keyData = await res.json();
        if (keyData && keyData.publicKey) {
          publicKey = keyData.publicKey;
        }
      }
    } catch (e) {
      console.warn('استخدام المفتاح العام الاحتياطي للإشعارات:', e);
    }

    const appServerKey = urlBase64ToUint8Array(publicKey);

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey
      });
    }

    return sub;
  }

  function updateNotificationUIState() {
    const account = getSavedUserAccount();
    const navBtnText = document.getElementById('navNotificationBtnText');
    const navIcon = document.getElementById('navNotificationIcon');
    const promoBannerTitle = document.getElementById('promoBannerTitle');
    const promoBannerSubtitle = document.getElementById('promoBannerSubtitle');
    const promoRegisterBtnText = document.getElementById('promoRegisterBtnText');
    const promoTestBtn = document.getElementById('promoTestBtn');
    const accountTestSendBtn = document.getElementById('accountTestSendBtn');
    const accountSubmitBtnText = document.getElementById('accountSubmitBtnText');

    if (account && account.name) {
      if (navBtnText) navBtnText.textContent = `🔔 إشعارات الورد: ${account.name}`;
      if (navIcon) navIcon.className = 'bi bi-bell-fill text-gold';

      if (promoBannerTitle) {
        promoBannerTitle.innerHTML = `إشعارات الورد اليومي مفعلة بنجاح يا ${account.name} 🌸 🔔`;
      }
      if (promoBannerSubtitle) {
        promoBannerSubtitle.innerHTML = `تصلك يومياً في تمام الساعة <strong>${account.reminderTime || '06:00'}</strong> على هذا الجهاز. تقبل الله طاعتكم وبارك في وردكم.`;
      }
      if (promoRegisterBtnText) promoRegisterBtnText.textContent = 'تعديل بيانات الحساب والوقت';
      if (promoTestBtn) promoTestBtn.classList.remove('d-none');
      if (accountTestSendBtn) accountTestSendBtn.classList.remove('d-none');
      if (accountSubmitBtnText) accountSubmitBtnText.textContent = 'تحديث بيانات الحساب 🔔';
    } else {
      if (navBtnText) navBtnText.textContent = 'إشعارات الورد 🔔';
      if (navIcon) navIcon.className = 'bi bi-bell text-gold';

      if (promoBannerTitle) {
        promoBannerTitle.textContent = 'هل ترغب في تلقي إشعار يومي بوردك القرآني على جهازك؟ 🔔';
      }
      if (promoBannerSubtitle) {
        promoBannerSubtitle.textContent = 'أنشئ حسابك الكريم (الاسم + الهاتف + الإيميل) لنرسل لك صفحات وردك يومياً في موعدك المفضل بنقرة واحدة.';
      }
      if (promoRegisterBtnText) promoRegisterBtnText.textContent = 'إنشاء حساب وتفعيل الإشعارات';
      if (promoTestBtn) promoTestBtn.classList.add('d-none');
      if (accountTestSendBtn) accountTestSendBtn.classList.add('d-none');
      if (accountSubmitBtnText) accountSubmitBtnText.textContent = 'إنشاء الحساب وتفعيل الإشعارات 🔔';
    }
  }

  window.openNotificationAccountModal = () => {
    const account = getSavedUserAccount();
    const owner = window.QuraniWirdEngine ? window.QuraniWirdEngine.getActiveUser() : null;

    const nameInput = document.getElementById('accountNameInput');
    const phoneInput = document.getElementById('accountPhoneInput');
    const emailInput = document.getElementById('accountEmailInput');
    const reminderTimeInput = document.getElementById('accountReminderTimeInput');
    const pageInput = document.getElementById('accountPageInput');
    const planSelect = document.getElementById('accountPlanSelect');
    const customPagesBox = document.getElementById('accountCustomPagesBox');
    const customPagesInput = document.getElementById('accountCustomPagesInput');
    const alertBox = document.getElementById('accountModalAlert');

    if (alertBox) {
      alertBox.className = 'alert d-none small mb-0 rounded-3';
      alertBox.textContent = '';
    }

    if (nameInput) nameInput.value = (account && account.name) || (owner && owner.name && owner.name !== 'أخي / أختي' ? owner.name : '');
    if (phoneInput) phoneInput.value = (account && account.phone) || (owner && owner.phone ? owner.phone : '');
    if (emailInput) emailInput.value = (account && account.email) || '';
    if (reminderTimeInput) reminderTimeInput.value = (account && account.reminderTime) || '06:00';
    if (planSelect) planSelect.value = (account && account.planId) || (owner && owner.planId) || 'furqan';
    if (pageInput) pageInput.value = (account && account.currentPage) || (owner && owner.currentPage) || 1;
    if (customPagesInput) customPagesInput.value = (account && account.customPagesPerDay) || (owner && owner.customPagesPerDay) || 5;

    if (customPagesBox && planSelect) {
      customPagesBox.classList.toggle('d-none', planSelect.value !== 'custom');
    }

    updateNotificationUIState();

    const modalEl = document.getElementById('notificationAccountModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.show();
    }
  };

  window.sendTestNotification = async () => {
    const alertBox = document.getElementById('accountModalAlert');
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        await registerServiceWorkerAndGetSubscription();
      }

      if (!('serviceWorker' in navigator)) {
        throw new Error('الخدمة غير مدعومة في هذا المتصفح');
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await registerServiceWorkerAndGetSubscription();
      }

      const account = getSavedUserAccount();
      const userName = (account && account.name) || 'أخي / أختي';

      // إظهار الإشعار مباشرة وبشكل فوري على شاشة جهاز المستخدم عبر الـ Service Worker
      if (reg && reg.showNotification) {
        try {
          await reg.showNotification('🌸 تجربة إشعار الأنس بالقرآن', {
            body: `مرحباً يا ${userName}! الإشعارات تعمل بكفاءة على جهازك ووردك اليومي في انتظارك 📖`,
            icon: '/assets/icons/icon-192.svg',
            badge: '/assets/icons/icon-192.svg',
            vibrate: [200, 100, 200, 100, 200],
            data: { url: '/#home' },
            dir: 'rtl',
            lang: 'ar',
            tag: 'qurani-wird-reminder',
            renotify: true
          });
        } catch (localNotifErr) {
          console.warn('Local test notification notice:', localNotifErr);
        }
      }

      // محاولة الإرسال السحابي أيضاً عبر الخادم
      try {
        if (sub) {
          await fetch('/api/notifications/test-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: sub,
              name: userName
            })
          });
        }
      } catch (srvErr) {
        console.warn('Cloud push dispatch note:', srvErr);
      }

      showToast('تم إرسال إشعار تجريبي 🔔', 'تفقد شريط إشعارات جهازك الآن!');
      if (alertBox) {
        alertBox.className = 'alert alert-success small mb-0 rounded-3 mt-3';
        alertBox.textContent = 'تم إرسال الإشعار التجريبي لجهازك بنجاح! تفقد شريط إشعاراتك الآن 🔔';
        alertBox.classList.remove('d-none');
      }
    } catch (err) {
      console.error('خطأ في إرسال الإشعار التجريبي:', err);
      showToast('تعذر إرسال الإشعار التجريبي', err.message);
      if (alertBox) {
        alertBox.className = 'alert alert-danger small mb-0 rounded-3 mt-3';
        alertBox.textContent = err.message || 'تعذر إرسال الإشعار التجريبي.';
        alertBox.classList.remove('d-none');
      }
    }
  };

  // معالجات أحداث نموذج إنشاء الحساب والإشعارات
  const notifForm = document.getElementById('notificationAccountForm');
  const accountPlanSelect = document.getElementById('accountPlanSelect');
  const accountCustomPagesBox = document.getElementById('accountCustomPagesBox');

  if (accountPlanSelect && accountCustomPagesBox) {
    accountPlanSelect.addEventListener('change', () => {
      accountCustomPagesBox.classList.toggle('d-none', accountPlanSelect.value !== 'custom');
    });
  }

  if (notifForm) {
    notifForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('accountModalAlert');
      const submitBtn = document.getElementById('accountSubmitBtn');

      const name = document.getElementById('accountNameInput')?.value.trim();
      const phone = document.getElementById('accountPhoneInput')?.value.trim();
      const email = document.getElementById('accountEmailInput')?.value.trim();
      const reminderTime = document.getElementById('accountReminderTimeInput')?.value || '06:00';
      const planId = document.getElementById('accountPlanSelect')?.value || 'furqan';
      const customPages = document.getElementById('accountCustomPagesInput')?.value || 5;
      const currentPage = document.getElementById('accountPageInput')?.value || 1;

      if (!name || !phone || !email) {
        if (alertBox) {
          alertBox.className = 'alert alert-danger small mb-0 rounded-3';
          alertBox.textContent = 'الرجاء ملء كافة الحقول الإلزامية (الاسم، الهاتف، والبريد الإلكتروني).';
          alertBox.classList.remove('d-none');
        }
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> جاري تفعيل الإشعارات...';
        }
        if (alertBox) {
          alertBox.className = 'alert alert-info small mb-0 rounded-3';
          alertBox.textContent = 'جاري طلب إذن الإشعارات من المتصفح والاشتراك...';
          alertBox.classList.remove('d-none');
        }

        const subscription = await registerServiceWorkerAndGetSubscription();

        if (alertBox) {
          alertBox.textContent = 'جاري حفظ الحساب على الخادم وتأكيد الاشتراك...';
        }

        // إرسال إشعار ترحيبي فوري ومباشر على شاشة جهاز المستخدم لتأكيد التفعيل
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification) {
            await reg.showNotification(`مرحباً بك يا ${name} في الأنس بالقرآن 🌸`, {
              body: `تم إنشاء حسابك وتفعيل إشعارات الورد اليومي بنجاح! سيصلك تذكيرك يومياً في تمام الساعة ${reminderTime} بإذن الله.`,
              icon: '/assets/icons/icon-192.svg',
              badge: '/assets/icons/icon-192.svg',
              vibrate: [200, 100, 200, 100, 200],
              data: { url: '/#home' },
              dir: 'rtl',
              lang: 'ar',
              tag: 'qurani-wird-reminder',
              renotify: true
            });
          }
        } catch (notifErr) {
          console.warn('Direct welcome notification notice:', notifErr);
        }

        let userId = 'sub_' + Date.now();
        try {
          const res = await fetch('/api/notifications/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              phone,
              email,
              reminderTime,
              planId,
              customPagesPerDay: parseInt(customPages, 10),
              currentPage: parseInt(currentPage, 10),
              subscription
            })
          });
          const data = await res.json();
          if (data && data.user && data.user.id) {
            userId = data.user.id;
          }
        } catch (srvRegErr) {
          console.warn('Server registration sync note:', srvRegErr);
        }

        // حفظ بيانات الحساب محلياً
        const savedAccount = {
          id: userId,
          name,
          phone,
          email,
          reminderTime,
          planId,
          customPagesPerDay: parseInt(customPages, 10),
          currentPage: parseInt(currentPage, 10)
        };
        saveUserAccount(savedAccount);

        // مزامنة المالك في محرك الورد
        if (window.QuraniWirdEngine) {
          window.QuraniWirdEngine.updateOwner({
            name,
            phone,
            planId,
            customPagesPerDay: parseInt(customPages, 10),
            currentPage: parseInt(currentPage, 10)
          });
        }

        updateDashboardUI();
        updateNotificationUIState();
        triggerCelebration();

        if (alertBox) {
          alertBox.className = 'alert alert-success small mb-0 rounded-3';
          alertBox.textContent = data.message || 'تم إنشاء الحساب وتفعيل الإشعارات بنجاح! 🌸';
        }

        showToast('تم تفعيل إشعارات الورد بنجاح 🔔', `مرحباً بك يا ${name}! سيصلك تذكيرك يومياً في تمام ${reminderTime}.`);

        setTimeout(() => {
          const modalEl = document.getElementById('notificationAccountModal');
          if (modalEl) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
          }
        }, 1800);

      } catch (err) {
        console.error('خطأ في تفعيل الإشعارات:', err);
        if (alertBox) {
          alertBox.className = 'alert alert-danger small mb-0 rounded-3';
          alertBox.textContent = err.message || 'حدث خطأ أثناء تفعيل الإشعارات.';
          alertBox.classList.remove('d-none');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> <span id="accountSubmitBtnText">تحديث الحساب وتفعيل الإشعارات 🔔</span>';
        }
      }
    });
  }

  // مزامنة تغيير الصفحة مع الخادم إن وجد حساب مشترك
  function syncPageWithBackend(newPage) {
    const account = getSavedUserAccount();
    if (account && (account.email || account.phone)) {
      account.currentPage = newPage;
      saveUserAccount(account);
      fetch('/api/notifications/update-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          phone: account.phone,
          currentPage: newPage
        })
      }).catch(err => console.log('Sync page with backend:', err));
    }
  }

  // --- تشغيل التطبيق الأولي ---
  initTheme();
  initMushafSelectors();
  updateDashboardUI();
  updateTasbeehUI();
  renderAdhkarCategory('morning');
  renderFamilyMembers();
  renderPlans();
  updateNotificationUIState();

  // تسجيل Service Worker في الخلفية إن كان مدعوماً
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('✅ تم تهيئة Service Worker لنظام الإشعارات:', reg.scope);
    }).catch((err) => {
      console.log('ملاحظة حول Service Worker:', err.message);
    });
  }

  // ملء قائمة مستلمي الواتساب مصنفة
  updateWhatsAppRecipientDropdown();
  updateWhatsAppPreview();

  // مستمع تحديث المستخدمين
  window.addEventListener('qurani:users_updated', () => {
    updateDashboardUI();
    renderFamilyMembers();
    updateWhatsAppRecipientDropdown();
  });

  window.addEventListener('qurani:active_user_changed', () => {
    updateDashboardUI();
    renderFamilyMembers();
    updateWhatsAppRecipientDropdown();
  });

  window.addEventListener('qurani:groups_updated', () => {
    renderWhatsAppGroups();
    updateWhatsAppRecipientDropdown();
    updateWhatsAppPreview();
  });

  // فحص عنوان الرابط أو الوسم لفتح قسم معين إن طلب، وإلا فالبداية تكون من البوابة الرئيسية
  if (window.location.hash === '#section-waqf' || window.location.search.includes('tab=waqf') || window.location.pathname.includes('/waqf')) {
    switchTab('waqf');
  } else if (window.location.hash === '#section-mushaf' || window.location.search.includes('tab=mushaf')) {
    switchTab('mushaf');
  } else if (window.location.hash === '#section-adhkar' || window.location.search.includes('tab=adhkar')) {
    switchTab('adhkar');
  } else if (window.location.hash === '#section-plans' || window.location.search.includes('tab=plans')) {
    switchTab('plans');
  } else if (window.location.hash === '#section-members' || window.location.search.includes('tab=members')) {
    switchTab('members');
  } else if (window.location.hash === '#section-home' || window.location.search.includes('tab=home')) {
    switchTab('home');
  } else {
    switchTab('portal');
  }

  console.log('✨ تم تشغيل منصة «الأنس بالقرآن» بنجاح بنظام التصميم الملكي الحديث والأنماط الثلاثة — تقبل الله طاعتكم');
});
