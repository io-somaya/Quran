/**
 * ==============================================================================
 * منصة «قرءاني» (Qur'ani) — محرك حساب الورد والخطط وإدارة المستخدمين (Wird Engine)
 * ==============================================================================
 * يتولى هذا المحرك:
 * 1. تعريف خطط الورد القرآني (الصفا، النور، الفرقان، الهداية، والخطة المخصصة).
 * 2. الحسابات الرياضية الدقيقة للورد اليومي بالصفحات والسور والأجزاء.
 * 3. تتبع نسبة التقدم والإنجاز نحو الختمة وتاريخ الختام التقديري.
 * 4. إدارة أيام الالتزام المتتالي (Daily Streaks 🔥) وتحديثها يومياً.
 * 5. إدارة بيانات المشتركين في LocalStorage (إضافة، تعديل، إتمام الورد، تبديل المستخدم).
 * ==============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./quran-data'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./quran-data'));
  } else {
    root.QuraniWirdEngine = factory(root.QuraniData);
  }
}(typeof self !== 'undefined' ? self : this, function (QuraniData) {
  'use strict';

  const STORAGE_USERS_KEY = 'qurani_users_v1';
  const STORAGE_ACTIVE_USER_KEY = 'qurani_active_user_id';
  const TOTAL_MUSHAF_PAGES = 604;

  /**
   * تعريف الخطط المعيارية لختم القرآن الكريم
   */
  const PLANS = {
    safa: {
      id: 'safa',
      name: 'خطة الصفا',
      nameEn: 'Safa Plan',
      badge: 'ميسرة ومباركة',
      badgeClass: 'badge-emerald',
      pagesPerDay: 2,
      approxDays: 302,
      approxDurationText: 'حوالي 10 أشهر',
      icon: 'bi-flower1',
      description: 'قراءة صفحتين يومياً (صفحة بعد كل فريضة أو دفعة واحدة)، تناسب المبتدئين وأصحاب الأوقات المزدحمة.',
      targetAudience: 'المبتدئون وكبار السن وأصحاب المشاغل'
    },
    noor: {
      id: 'noor',
      name: 'خطة النور',
      nameEn: 'Noor Plan',
      badge: 'المعتدلة المثالية',
      badgeClass: 'badge-gold',
      pagesPerDay: 4,
      approxDays: 151,
      approxDurationText: 'حوالي 5 أشهر',
      icon: 'bi-brightness-high-fill',
      description: 'قراءة ربع حزب (4 صفحات يومياً)، وهي الخطة المثالية للمحافظة الدائمة على الاتصال بكتاب الله.',
      targetAudience: 'عموم المسلمين والشباب'
    },
    furqan: {
      id: 'furqan',
      name: 'خطة الفرقان',
      nameEn: 'Furqan Plan',
      badge: 'همة عالية',
      badgeClass: 'badge-royal',
      pagesPerDay: 10,
      approxDays: 60,
      approxDurationText: 'شهرين كاملين',
      icon: 'bi-stars',
      description: 'قراءة نصف حزب (10 صفحات يومياً / صفحتان دبر كل صلاة مكتوبة)، لختمة مميزة كل شهرين.',
      targetAudience: 'المجتهدون وطلاب العلم'
    },
    hidayah: {
      id: 'hidayah',
      name: 'خطة الهداية',
      nameEn: 'Hidayah Plan',
      badge: 'ختمة الشهر المبارك',
      badgeClass: 'badge-crimson',
      pagesPerDay: 20,
      approxDays: 30,
      approxDurationText: '30 يوماً (شهر)',
      icon: 'bi-trophy-fill',
      description: 'قراءة جزء كامل يومياً (20 صفحة / 4 صفحات بعد كل فريضة)، لختمة قرآنية شهرية مباركة كما كان يفعل السلف.',
      targetAudience: 'الحفاظ ومحبو الختم الشهري وفي شهر رمضان'
    },
    custom: {
      id: 'custom',
      name: 'خطة مخصصة',
      nameEn: 'Custom Plan',
      badge: 'مرنة حسب رغبتك',
      badgeClass: 'badge-slate',
      pagesPerDay: 5,
      approxDays: 120,
      approxDurationText: 'حسب اختيارك',
      icon: 'bi-sliders',
      description: 'تحديد عدد الصفحات اليومية أو تاريخ انتهاء مستهدف لحساب الورد تلقائياً.',
      targetAudience: 'كل من يرغب في مسار قراءة خاص'
    }
  };
  PLANS.nour = PLANS.noor;

  /**
   * توليد تاريخ اليوم بصيغة YYYY-MM-DD
   */
  function getTodayString(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * توليد تاريخ الأمس بصيغة YYYY-MM-DD
   */
  function getYesterdayString(date = new Date()) {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return getTodayString(d);
  }

  /**
   * عينة المشتركين الأولية للبدء الفوري
   */
  function getInitialSampleUsers() {
    const todayStr = getTodayString();
    const yesterdayStr = getYesterdayString();

    return [
      {
        id: 'user_father',
        name: 'الوالد (أبو أحمد)',
        phone: '966501111111',
        planId: 'safa',
        customPagesPerDay: 2,
        currentPage: 44,
        completedToday: true,
        streak: 14,
        longestStreak: 25,
        khatmahCount: 2,
        startDate: '2026-08-15',
        lastCompletedDate: todayStr,
        avatar: '👨‍🦳',
        color: '#16a34a',
        notes: 'يفضل القراءة بعد صلاة الفجر'
      },
      {
        id: 'user_mother',
        name: 'الوالدة (أم أحمد)',
        phone: '966502222222',
        planId: 'safa',
        customPagesPerDay: 2,
        currentPage: 28,
        completedToday: false,
        streak: 8,
        longestStreak: 18,
        khatmahCount: 1,
        startDate: '2026-09-01',
        lastCompletedDate: yesterdayStr,
        avatar: '🧕',
        color: '#0d9488',
        notes: 'تحب الاستماع لصوت الشيخ الحصري'
      },
      {
        id: 'user_ahmed',
        name: 'أحمد',
        phone: '966503333333',
        planId: 'hidayah',
        customPagesPerDay: 20,
        currentPage: 122,
        completedToday: true,
        streak: 21,
        longestStreak: 45,
        khatmahCount: 3,
        startDate: '2026-07-01',
        lastCompletedDate: todayStr,
        avatar: '🧔',
        color: '#d97706',
        notes: 'يقرأ جزءاً كاملاً يومياً'
      },
      {
        id: 'user_fatima',
        name: 'فاطمة',
        phone: '966504444444',
        planId: 'furqan',
        customPagesPerDay: 10,
        currentPage: 80,
        completedToday: true,
        streak: 12,
        longestStreak: 30,
        khatmahCount: 1,
        startDate: '2026-08-20',
        lastCompletedDate: todayStr,
        avatar: '👩',
        color: '#8b5cf6',
        notes: 'تفضل القراءة في المساء'
      },
      {
        id: 'user_omar',
        name: 'عمر',
        phone: '966505555555',
        planId: 'noor',
        customPagesPerDay: 4,
        currentPage: 16,
        completedToday: false,
        streak: 5,
        longestStreak: 14,
        khatmahCount: 0,
        startDate: '2026-09-25',
        lastCompletedDate: yesterdayStr,
        avatar: '👦',
        color: '#0284c7',
        notes: 'همته طيبة ويحب التشجيع المستمر'
      }
    ];
  }

  /**
   * جلب المستخدمين من LocalStorage أو تعيين النماذج الأولية
   */
  function getUsers() {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const stored = localStorage.getItem(STORAGE_USERS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // التحقق من حالة الالتزام اليومي بناء على تاريخ اليوم
            const todayStr = getTodayString();
            return parsed.map(user => {
              const isCompletedToday = (user.lastCompletedDate === todayStr);
              return {
                ...user,
                completedToday: isCompletedToday
              };
            });
          }
        }
      }
    } catch (e) {
      console.warn("تعذر قراءة المستخدمين من التخزين المحلي، سيتم استخدام البيانات النموذجية", e);
    }

    const initial = getInitialSampleUsers();
    saveUsers(initial);
    return initial;
  }

  /**
   * حفظ المستخدمين في LocalStorage
   */
  function saveUsers(users) {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      }
      // إرسال حدث مخصص للمتصفح لتحديث الواجهات التفاعلية فوراً
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('qurani:users_updated', { detail: { users } }));
      }
    } catch (e) {
      console.error("فشل حفظ بيانات المشتركين", e);
    }
  }

  /**
   * جلب المستخدم النشط حالياً
   */
  function getActiveUser() {
    const users = getUsers();
    let activeId = null;
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        activeId = localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
      }
    } catch (e) {
      // ignore
    }
    const found = users.find(u => u.id === activeId);
    return found || users[0];
  }

  /**
   * تعيين المستخدم النشط
   */
  function setActiveUser(userId) {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_ACTIVE_USER_KEY, userId);
      }
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('qurani:active_user_changed', { detail: { userId } }));
      }
    } catch (e) {
      console.error("تعذر تعيين المستخدم النشط", e);
    }
    return getActiveUser();
  }

  /**
   * جلب مستخدم بواسطة المعرف ID
   */
  function getUserById(userId) {
    const users = getUsers();
    return users.find(u => u.id === userId) || null;
  }

  /**
   * إضافة مشترك جديد
   */
  function addUser(userData) {
    const users = getUsers();
    const id = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const plan = PLANS[userData.planId] || PLANS.safa;
    const pagesPerDay = userData.planId === 'custom' 
      ? Math.max(1, parseInt(userData.customPagesPerDay, 10) || 5) 
      : plan.pagesPerDay;

    const newUser = {
      id,
      name: userData.name || 'مشترك جديد',
      phone: userData.phone ? String(userData.phone).trim() : '',
      planId: plan.id,
      customPagesPerDay: pagesPerDay,
      currentPage: Math.max(1, parseInt(userData.currentPage, 10) || 1),
      completedToday: false,
      streak: 0,
      longestStreak: 0,
      khatmahCount: 0,
      startDate: getTodayString(),
      lastCompletedDate: null,
      avatar: userData.avatar || '📖',
      color: userData.color || '#16a34a',
      notes: userData.notes || ''
    };

    users.push(newUser);
    saveUsers(users);
    return newUser;
  }

  /**
   * تحديث بيانات مستخدم
   */
  function updateUser(userId, partialData) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    users[idx] = {
      ...users[idx],
      ...partialData
    };

    saveUsers(users);
    return users[idx];
  }

  /**
   * حذف مستخدم
   */
  function deleteUser(userId) {
    let users = getUsers();
    users = users.filter(u => u.id !== userId);
    if (users.length === 0) {
      users = getInitialSampleUsers();
    }
    saveUsers(users);
    
    const active = getActiveUser();
    if (active.id === userId) {
      setActiveUser(users[0].id);
    }
    return users;
  }

  /**
   * احتساب نسبة التقدم في الختمة الحالية (0 - 100%)
   */
  function calculateProgressPercentage(currentPage, totalPages = TOTAL_MUSHAF_PAGES) {
    const p = Math.max(0, Math.min(totalPages, parseInt(currentPage, 10) || 0));
    return parseFloat(((p / totalPages) * 100).toFixed(1));
  }

  /**
   * احتساب موعد الختمة المتوقع
   */
  function calculateEstimatedKhatmahDate(currentPage, pagesPerDay, fromDate = new Date()) {
    const curr = Math.max(1, parseInt(currentPage, 10) || 1);
    const daily = Math.max(1, parseInt(pagesPerDay, 10) || 2);
    const pagesLeft = Math.max(0, TOTAL_MUSHAF_PAGES - curr);
    const daysNeeded = Math.ceil(pagesLeft / daily);

    const targetDate = new Date(fromDate.getTime());
    targetDate.setDate(targetDate.getDate() + daysNeeded);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = targetDate.toLocaleDateString('ar-SA', options);

    return {
      daysNeeded,
      targetDate,
      dateFormatted
    };
  }

  /**
   * حاسبة الخطة المخصصة: كم صفحة يومياً لأختم خلال X يوماً؟
   */
  function calculateCustomPlanByDays(targetDays, startPage = 1) {
    const days = Math.max(1, parseInt(targetDays, 10) || 30);
    const sp = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, parseInt(startPage, 10) || 1));
    const pagesLeft = (TOTAL_MUSHAF_PAGES - sp) + 1;
    const pagesPerDay = Math.ceil(pagesLeft / days);

    const est = calculateEstimatedKhatmahDate(sp, pagesPerDay);
    return {
      targetDays: days,
      pagesPerDay,
      estimatedDate: est.dateFormatted
    };
  }

  /**
   * حساب تفاصيل ورد اليوم لمستخدم معين
   */
  function calculateTodayWird(user, date = new Date()) {
    if (!user) return null;

    const plan = PLANS[user.planId] || PLANS.safa;
    const pagesPerDay = user.planId === 'custom' 
      ? (user.customPagesPerDay || 5) 
      : plan.pagesPerDay;

    const todayStr = getTodayString(date);
    const isCompletedToday = (user.lastCompletedDate === todayStr || user.completedToday === true);

    let startPage;
    let endPage;

    if (isCompletedToday) {
      // إذا كان قد قرأ ورده لليوم، نعرض له ما قرأه اليوم
      endPage = Math.min(TOTAL_MUSHAF_PAGES, Math.max(1, user.currentPage));
      startPage = Math.max(1, endPage - pagesPerDay + 1);
    } else {
      // الورد المطلوب إنجازه اليوم
      startPage = Math.min(TOTAL_MUSHAF_PAGES, Math.max(1, user.currentPage || 1));
      endPage = Math.min(TOTAL_MUSHAF_PAGES, startPage + pagesPerDay - 1);
    }

    // استخراج السور المشمولة في نطاق الصفحات
    let surahs = [];
    if (QuraniData && typeof QuraniData.getSurahsByPageRange === 'function') {
      surahs = QuraniData.getSurahsByPageRange(startPage, endPage);
    }

    let surahsNames = surahs.map(s => s.nameSimple).join('، ');
    if (!surahsNames) surahsNames = "القرآن الكريم";

    // معرفة الجزء
    let juzNumber = 1;
    let juzName = "الجزء الأول";
    if (QuraniData && typeof QuraniData.getPageInfo === 'function') {
      const pageInfo = QuraniData.getPageInfo(startPage);
      juzNumber = pageInfo.juz;
      juzName = pageInfo.juzName;
    }

    const progressPercentage = calculateProgressPercentage(isCompletedToday ? endPage : (startPage - 1));
    const pagesRemaining = Math.max(0, TOTAL_MUSHAF_PAGES - (isCompletedToday ? endPage : startPage));
    const estimated = calculateEstimatedKhatmahDate(user.currentPage, pagesPerDay, date);

    return {
      user,
      plan,
      pagesPerDay,
      startPage,
      endPage,
      pagesCount: (endPage - startPage) + 1,
      surahs,
      surahsNames,
      juz: juzNumber,
      juzName,
      progressPercentage,
      pagesRemaining,
      daysRemaining: estimated.daysNeeded,
      estimatedKhatmahDate: estimated.dateFormatted,
      completedToday: isCompletedToday,
      streak: user.streak || 0,
      khatmahCount: user.khatmahCount || 0
    };
  }

  /**
   * تسجيل "تمت قراءة الورد اليوم بحمد الله"
   */
  function markTodayCompleted(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const todayStr = getTodayString();
    const yesterdayStr = getYesterdayString();

    // إذا كان مسجلاً بالفعل لليوم نتجنب التكرار
    if (user.lastCompletedDate === todayStr) {
      return { user, alreadyCompleted: true };
    }

    const plan = PLANS[user.planId] || PLANS.safa;
    const pagesPerDay = user.planId === 'custom' ? (user.customPagesPerDay || 5) : plan.pagesPerDay;

    // حساب الصفحة الجديدة
    let newPage = user.currentPage + pagesPerDay;
    let newKhatmahCount = user.khatmahCount || 0;
    let khatmahCompleted = false;

    if (newPage > TOTAL_MUSHAF_PAGES) {
      // إتمام ختمة كاملة! مبروك 🎉
      newKhatmahCount++;
      newPage = (newPage - TOTAL_MUSHAF_PAGES); // التدوير للبدء في ختمة جديدة
      khatmahCompleted = true;
    }

    // حساب الـ Streak المتتالي
    let newStreak = user.streak || 0;
    if (user.lastCompletedDate === yesterdayStr) {
      newStreak += 1;
    } else {
      // إذا انقطع يعود إلى 1
      newStreak = 1;
    }

    const longestStreak = Math.max(user.longestStreak || 0, newStreak);

    const updatedUser = {
      ...user,
      currentPage: newPage,
      completedToday: true,
      streak: newStreak,
      longestStreak,
      khatmahCount: newKhatmahCount,
      lastCompletedDate: todayStr
    };

    const idx = users.findIndex(u => u.id === userId);
    users[idx] = updatedUser;
    saveUsers(users);

    return {
      user: updatedUser,
      khatmahCompleted,
      newStreak
    };
  }

  /**
   * التراجع عن إتمام الورد (في حال النقر بالخطأ)
   */
  function undoTodayCompleted(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user || !user.completedToday) return null;

    const plan = PLANS[user.planId] || PLANS.safa;
    const pagesPerDay = user.planId === 'custom' ? (user.customPagesPerDay || 5) : plan.pagesPerDay;

    let prevPage = user.currentPage - pagesPerDay;
    if (prevPage < 1) prevPage = 1;

    let prevStreak = Math.max(0, (user.streak || 1) - 1);

    const updatedUser = {
      ...user,
      currentPage: prevPage,
      completedToday: false,
      streak: prevStreak,
      lastCompletedDate: getYesterdayString()
    };

    const idx = users.findIndex(u => u.id === userId);
    users[idx] = updatedUser;
    saveUsers(users);

    return updatedUser;
  }

  /**
   * تغيير خطة المشترك
   */
  function changeUserPlan(userId, newPlanId, customPages = null) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const plan = PLANS[newPlanId] || PLANS.safa;
    const pagesPerDay = newPlanId === 'custom'
      ? Math.max(1, parseInt(customPages, 10) || 5)
      : plan.pagesPerDay;

    const updatedUser = {
      ...user,
      planId: plan.id,
      customPagesPerDay: pagesPerDay
    };

    const idx = users.findIndex(u => u.id === userId);
    users[idx] = updatedUser;
    saveUsers(users);

    return updatedUser;
  }

  /**
   * إعادة ضبط الختمة للمشترك للبدء من الصفحة الأولى
   */
  function resetUserKhatmah(userId) {
    return updateUser(userId, {
      currentPage: 1,
      completedToday: false,
      lastCompletedDate: null
    });
  }

  return {
    PLANS,
    plans: PLANS,
    TOTAL_MUSHAF_PAGES,
    getTodayString,
    getYesterdayString,
    getUsers,
    getAllUsers: getUsers,
    saveUsers,
    getActiveUser,
    setActiveUser,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    calculateProgressPercentage,
    calculateProgress: function(user) {
      const p = calculateProgressPercentage(user ? user.currentPage : 1);
      const plan = PLANS[user?.planId] || PLANS.safa;
      const est = calculateEstimatedKhatmahDate(user ? user.currentPage : 1, plan.pagesPerDay || 2);
      return {
        progressPercent: p,
        progressPercentage: p,
        expectedEndDate: est.dateFormatted
      };
    },
    calculateEstimatedKhatmahDate,
    calculateCustomPlanByDays,
    calculateTodayWird,
    calculateWirdForUser: function(user) {
      const w = calculateTodayWird(user);
      if (w) {
        w.surahName = w.surahsNames;
        w.isCompletedToday = w.completedToday;
      }
      return w;
    },
    markTodayCompleted,
    markTodayWirdCompleted: function() {
      const active = getActiveUser();
      if (active) return markTodayCompleted(active.id);
    },
    undoTodayCompleted,
    changeUserPlan,
    changeActiveUserPlan: function(planId, customPages) {
      const active = getActiveUser();
      if (active) return changeUserPlan(active.id, planId, customPages);
    },
    resetUserKhatmah
  };
}));
