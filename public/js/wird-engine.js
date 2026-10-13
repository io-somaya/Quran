/**
 * ==============================================================================
 * منصة «قرءاني» (Qur'ani) — محرك حساب الورد والخطط وإدارة المشتركين (Wird Engine)
 * ==============================================================================
 * النموذج المعماري: Single-Owner Architecture (حساب مالك واحد + دوائر الأهل والأصدقاء)
 * 1. حساب المالك الوحيد (Owner): صاحب الورد والمشرف الأساسي على المنصة.
 * 2. قوائم الأهل والأصدقاء (Contacts / Members): جهات اتصال للمتابعة، المشاركة، وإرسال الأوراد.
 * 3. الحسابات الرياضية الدقيقة للورد اليومي بالصفحات والسور والأجزاء ونسب التقدم.
 * 4. إدارة أيام الالتزام المتتالي (Streaks 🔥) وتحديثها يومياً.
 * 5. ترقية وهجرة سلسة وتوافقية لبيانات LocalStorage القديمة.
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

  // مفاتيح التخزين المحدثة
  const STORAGE_OWNER_KEY = 'qurani_owner_v1';
  const STORAGE_CONTACTS_KEY = 'qurani_contacts_v1';
  const STORAGE_WHATSAPP_GROUPS_KEY = 'qurani_whatsapp_groups_v1';

  // مفاتيح التخزين السابقة (للهجرة التوافقية والتلقائية)
  const LEGACY_STORAGE_USERS_KEY = 'qurani_users_v1';
  const LEGACY_STORAGE_ACTIVE_USER_KEY = 'qurani_active_user_id';

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
   * البيانات الافتراضية للمالك (صاحب الورد)
   */
  function getDefaultOwner() {
    const todayStr = getTodayString();
    return {
      id: 'owner',
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
      relation: 'صاحب الحساب'
    };
  }

  /**
   * جهات الاتصال النموذجية الأولية (مقرأة الأهل ومقرأة الأصدقاء)
   */
  function getInitialSampleContacts() {
    const todayStr = getTodayString();
    const yesterdayStr = getYesterdayString();

    return [
      // --- مقرأة الأهل (Family) ---
      {
        id: 'contact_father',
        name: 'الوالد (أبو أحمد)',
        phone: '966501111111',
        relation: 'الوالد',
        groupType: 'family',
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
        id: 'contact_mother',
        name: 'الوالدة (أم أحمد)',
        phone: '966502222222',
        relation: 'الوالدة',
        groupType: 'family',
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
        id: 'contact_fatima',
        name: 'فاطمة',
        phone: '966504444444',
        relation: 'الأخت',
        groupType: 'family',
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
        id: 'contact_omar',
        name: 'عمر',
        phone: '966505555555',
        relation: 'الابن',
        groupType: 'family',
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
      },

      // --- مقرأة الأصدقاء (Friends) ---
      {
        id: 'contact_khalid',
        name: 'خالد بن سعد',
        phone: '966506666666',
        relation: 'صديق الطفولة',
        groupType: 'friends',
        planId: 'furqan',
        customPagesPerDay: 10,
        currentPage: 90,
        completedToday: true,
        streak: 16,
        longestStreak: 35,
        khatmahCount: 2,
        startDate: '2026-08-01',
        lastCompletedDate: todayStr,
        avatar: '👳‍♂️',
        color: '#0284c7',
        notes: 'رفيق حلقة المسجد والورد اليومي'
      },
      {
        id: 'contact_tariq',
        name: 'طارق المحمدي',
        phone: '966507777777',
        relation: 'زميل العمل',
        groupType: 'friends',
        planId: 'noor',
        customPagesPerDay: 4,
        currentPage: 52,
        completedToday: false,
        streak: 10,
        longestStreak: 22,
        khatmahCount: 1,
        startDate: '2026-08-20',
        lastCompletedDate: yesterdayStr,
        avatar: '🧑‍💼',
        color: '#8b5cf6',
        notes: 'يتنافس معنا في الورد المسائي'
      },
      {
        id: 'contact_anas',
        name: 'المهندس أنس',
        phone: '966508888888',
        relation: 'صديق مقرأة الفجر',
        groupType: 'friends',
        planId: 'hidayah',
        customPagesPerDay: 20,
        currentPage: 160,
        completedToday: true,
        streak: 28,
        longestStreak: 50,
        khatmahCount: 4,
        startDate: '2026-06-15',
        lastCompletedDate: todayStr,
        avatar: '👨‍🏫',
        color: '#10b981',
        notes: 'حافظ ومتقن - حريص على الجزء اليومي'
      }
    ];
  }

  // =========================================================================
  // إدارة حساب المالك (Single Owner Management)
  // =========================================================================

  /**
   * جلب بيانات المالك (صاحب الورد) من LocalStorage مع الهجرة الآمنة
   */
  function getOwner() {
    const todayStr = getTodayString();

    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const storedOwner = localStorage.getItem(STORAGE_OWNER_KEY);
        if (storedOwner) {
          const owner = JSON.parse(storedOwner);
          if (owner && typeof owner === 'object') {
            owner.id = 'owner';
            owner.completedToday = (owner.lastCompletedDate === todayStr);
            return owner;
          }
        }

        // فحص وجود بيانات سابقة للترحيل (Migration from legacy users)
        const legacyUsersStr = localStorage.getItem(LEGACY_STORAGE_USERS_KEY);
        if (legacyUsersStr) {
          const legacyUsers = JSON.parse(legacyUsersStr);
          if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
            // البحث عن المالك (أحمد أو الحساب النشط أو صاحب الحساب)
            const activeId = localStorage.getItem(LEGACY_STORAGE_ACTIVE_USER_KEY);
            let ownerCandidate = legacyUsers.find(u => u.id === 'user_ahmed' || u.id === 'owner');
            if (!ownerCandidate && activeId) {
              ownerCandidate = legacyUsers.find(u => u.id === activeId);
            }
            if (!ownerCandidate) {
              ownerCandidate = legacyUsers.find(u => (u.relation || '').includes('صاحب') || (u.relation || '').includes('أنا'));
            }
            if (!ownerCandidate) {
              ownerCandidate = legacyUsers[0];
            }

            const migratedOwner = {
              id: 'owner',
              name: ownerCandidate.name || 'أحمد',
              phone: ownerCandidate.phone || '966503333333',
              planId: ownerCandidate.planId || 'hidayah',
              customPagesPerDay: ownerCandidate.customPagesPerDay || 20,
              currentPage: ownerCandidate.currentPage || 122,
              completedToday: (ownerCandidate.lastCompletedDate === todayStr),
              streak: ownerCandidate.streak || 21,
              longestStreak: ownerCandidate.longestStreak || 45,
              khatmahCount: ownerCandidate.khatmahCount || 3,
              startDate: ownerCandidate.startDate || '2026-07-01',
              lastCompletedDate: ownerCandidate.lastCompletedDate || todayStr,
              avatar: ownerCandidate.avatar || '🧔',
              color: ownerCandidate.color || '#d97706',
              relation: 'صاحب الحساب'
            };

            saveOwner(migratedOwner);
            return migratedOwner;
          }
        }
      }
    } catch (e) {
      console.warn("خطأ في قراءة بيانات المالك من التخزين، سيتم استخدام الافتراضية:", e);
    }

    const defaultOwner = getDefaultOwner();
    saveOwner(defaultOwner);
    return defaultOwner;
  }

  /**
   * حفظ بيانات المالك في LocalStorage وإرسال الأحداث
   */
  function saveOwner(owner) {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_OWNER_KEY, JSON.stringify(owner));
      }
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('qurani:owner_updated', { detail: { owner } }));
        // حدث توافقي للواجهات
        window.dispatchEvent(new CustomEvent('qurani:users_updated', { detail: { owner } }));
      }
    } catch (e) {
      console.error("فشل حفظ بيانات المالك:", e);
    }
  }

  /**
   * تحديث بيانات المالك جزئياً أو كلياً
   */
  function updateOwner(data) {
    const current = getOwner();
    const updated = {
      ...current,
      ...data,
      id: 'owner' // ضمان ثبات المعرف كمالك
    };

    if (data.planId && data.planId !== 'custom') {
      const plan = PLANS[data.planId] || PLANS.safa;
      updated.customPagesPerDay = plan.pagesPerDay;
    } else if (data.planId === 'custom' && data.customPagesPerDay) {
      updated.customPagesPerDay = Math.max(1, parseInt(data.customPagesPerDay, 10) || 5);
    }

    if (data.currentPage !== undefined) {
      updated.currentPage = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, parseInt(data.currentPage, 10) || 1));
    }

    saveOwner(updated);
    return updated;
  }

  // =========================================================================
  // إدارة دوائر الأهل والأصدقاء (Contacts / Members Management)
  // =========================================================================

  /**
   * جلب جهات الاتصال من LocalStorage مع الهجرة الآمنة
   * @param {string} groupType اختياري ('family' | 'friends' | 'all')
   */
  function getContacts(groupType = 'all') {
    const todayStr = getTodayString();
    let contactsList = [];

    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const stored = localStorage.getItem(STORAGE_CONTACTS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            contactsList = parsed.map(c => ({
              ...c,
              completedToday: (c.lastCompletedDate === todayStr)
            }));
          }
        } else {
          // هجرة جهات الاتصال من مصفوفة المستخدمين السابقة إن وجدت
          const legacyUsersStr = localStorage.getItem(LEGACY_STORAGE_USERS_KEY);
          if (legacyUsersStr) {
            const legacyUsers = JSON.parse(legacyUsersStr);
            if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
              // استبعاد حساب المالك من جهات الاتصال
              contactsList = legacyUsers
                .filter(u => u.id !== 'user_ahmed' && u.id !== 'owner' && !(u.relation || '').includes('صاحب'))
                .map(u => ({
                  id: u.id.startsWith('contact_') ? u.id : 'contact_' + u.id.replace('user_', ''),
                  name: u.name,
                  phone: u.phone || '',
                  relation: u.relation || (u.groupType === 'friends' ? 'صديق' : 'من الأهل'),
                  groupType: u.groupType === 'friends' ? 'friends' : 'family',
                  planId: u.planId || 'safa',
                  customPagesPerDay: u.customPagesPerDay || 2,
                  currentPage: u.currentPage || 1,
                  completedToday: (u.lastCompletedDate === todayStr),
                  streak: u.streak || 0,
                  longestStreak: u.longestStreak || 0,
                  khatmahCount: u.khatmahCount || 0,
                  startDate: u.startDate || todayStr,
                  lastCompletedDate: u.lastCompletedDate || null,
                  avatar: u.avatar || (u.groupType === 'friends' ? '👥' : '👨‍👩‍👧‍👦'),
                  color: u.color || (u.groupType === 'friends' ? '#0284c7' : '#16a34a'),
                  notes: u.notes || ''
                }));

              saveContacts(contactsList);
            }
          }
        }
      }
    } catch (e) {
      console.warn("خطأ في قراءة جهات الاتصال، سيتم تهيئة العينة:", e);
    }

    if (!contactsList || contactsList.length === 0) {
      contactsList = getInitialSampleContacts();
      saveContacts(contactsList);
    }

    if (!groupType || groupType === 'all') {
      return contactsList;
    }
    return contactsList.filter(c => (c.groupType || 'family') === groupType);
  }

  /**
   * حفظ جهات الاتصال في LocalStorage وإرسال الأحداث
   */
  function saveContacts(contacts) {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_CONTACTS_KEY, JSON.stringify(contacts));
      }
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('qurani:contacts_updated', { detail: { contacts } }));
        // توافق للواجهات
        window.dispatchEvent(new CustomEvent('qurani:users_updated', { detail: { contacts } }));
      }
    } catch (e) {
      console.error("فشل حفظ جهات الاتصال:", e);
    }
  }

  /**
   * إضافة جهة اتصال جديدة للأهل أو الأصدقاء
   */
  function addContact(contactData) {
    const contacts = getContacts('all');
    const id = 'contact_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const plan = PLANS[contactData.planId] || PLANS.safa;
    const pagesPerDay = contactData.planId === 'custom'
      ? Math.max(1, parseInt(contactData.customPagesPerDay, 10) || 5)
      : plan.pagesPerDay;

    const groupType = contactData.groupType === 'friends' ? 'friends' : 'family';
    const defaultAvatar = groupType === 'friends' ? '👥' : '👨‍👩‍👧‍👦';
    const defaultRelation = groupType === 'friends' ? 'صديق' : 'من الأهل';
    const defaultColor = groupType === 'friends' ? '#0284c7' : '#16a34a';

    const newContact = {
      id,
      name: contactData.name || 'قارئ جديد',
      phone: contactData.phone ? String(contactData.phone).trim() : '',
      relation: contactData.relation || defaultRelation,
      groupType: groupType,
      planId: plan.id,
      customPagesPerDay: pagesPerDay,
      currentPage: Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, parseInt(contactData.currentPage, 10) || 1)),
      completedToday: false,
      streak: 0,
      longestStreak: 0,
      khatmahCount: 0,
      startDate: getTodayString(),
      lastCompletedDate: null,
      avatar: contactData.avatar || defaultAvatar,
      color: contactData.color || defaultColor,
      notes: contactData.notes || ''
    };

    contacts.push(newContact);
    saveContacts(contacts);
    return newContact;
  }

  /**
   * تحديث بيانات جهة اتصال
   */
  function updateContact(id, data) {
    const contacts = getContacts('all');
    const idx = contacts.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const current = contacts[idx];
    const updated = {
      ...current,
      ...data,
      id: current.id // عدم تغيير المعرف
    };

    if (data.planId) {
      const plan = PLANS[data.planId] || PLANS.safa;
      if (data.planId === 'custom') {
        updated.customPagesPerDay = Math.max(1, parseInt(data.customPagesPerDay || current.customPagesPerDay, 10) || 5);
      } else {
        updated.customPagesPerDay = plan.pagesPerDay;
      }
    }

    if (data.currentPage !== undefined) {
      updated.currentPage = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, parseInt(data.currentPage, 10) || 1));
    }

    contacts[idx] = updated;
    saveContacts(contacts);
    return updated;
  }

  /**
   * حذف جهة اتصال
   */
  function deleteContact(id) {
    let contacts = getContacts('all');
    contacts = contacts.filter(c => c.id !== id);
    saveContacts(contacts);
    return contacts;
  }

  /**
   * تبديل حالة إنجاز الورد لجهة اتصال لليوم (Mark / Undo completion)
   */
  function toggleContactCompleted(id) {
    const contacts = getContacts('all');
    const contact = contacts.find(c => c.id === id);
    if (!contact) return null;

    const todayStr = getTodayString();
    const yesterdayStr = getYesterdayString();
    const plan = PLANS[contact.planId] || PLANS.safa;
    const pagesPerDay = contact.planId === 'custom' ? (contact.customPagesPerDay || 5) : plan.pagesPerDay;

    const isCurrentlyCompleted = (contact.lastCompletedDate === todayStr || contact.completedToday === true);

    if (!isCurrentlyCompleted) {
      // إتمام الورد لليوم
      let newPage = contact.currentPage + pagesPerDay;
      let newKhatmahCount = contact.khatmahCount || 0;

      if (newPage > TOTAL_MUSHAF_PAGES) {
        newKhatmahCount++;
        newPage = (newPage - TOTAL_MUSHAF_PAGES);
      }

      let newStreak = contact.streak || 0;
      if (contact.lastCompletedDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      const longestStreak = Math.max(contact.longestStreak || 0, newStreak);

      const updated = {
        ...contact,
        currentPage: newPage,
        completedToday: true,
        streak: newStreak,
        longestStreak,
        khatmahCount: newKhatmahCount,
        lastCompletedDate: todayStr
      };

      const idx = contacts.findIndex(c => c.id === id);
      contacts[idx] = updated;
      saveContacts(contacts);
      return { contact: updated, completed: true };
    } else {
      // التراجع عن الإتمام
      let prevPage = contact.currentPage - pagesPerDay;
      if (prevPage < 1) prevPage = 1;

      const prevStreak = Math.max(0, (contact.streak || 1) - 1);

      const updated = {
        ...contact,
        currentPage: prevPage,
        completedToday: false,
        streak: prevStreak,
        lastCompletedDate: yesterdayStr
      };

      const idx = contacts.findIndex(c => c.id === id);
      contacts[idx] = updated;
      saveContacts(contacts);
      return { contact: updated, completed: false };
    }
  }

  /**
   * حساب إحصائيات المقرأة حسب النوع
   */
  function getGroupStats(groupType = 'all') {
    const contacts = getContacts(groupType);
    const total = contacts.length;
    const completed = contacts.filter(c => c.completedToday).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      completed,
      rate,
      remaining: Math.max(0, total - completed)
    };
  }

  // =========================================================================
  // إدارة قروبات الواتساب (WhatsApp Groups Management)
  // =========================================================================

  /**
   * مجموعات الواتساب الافتراضية
   */
  function getInitialSampleWhatsAppGroups() {
    return [
      {
        id: 'group_family',
        name: 'مقرأة الأهل المباركة 👨‍👩‍👧‍👦',
        link: '',
        category: 'family',
        description: 'مجموعة العائلة لمتابعة الورد القرآني اليومي والتواصي بالحق',
        createdAt: new Date().toISOString()
      },
      {
        id: 'group_friends',
        name: 'حلقة الأصدقاء الكرام 👥',
        link: '',
        category: 'friends',
        description: 'مجموعة الأصدقاء للتنافس في الخير ومدارسة كتاب الله',
        createdAt: new Date().toISOString()
      }
    ];
  }

  /**
   * جلب كافة مجموعات الواتساب المحفوظة
   */
  function getWhatsAppGroups() {
    let groups = [];
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const stored = localStorage.getItem(STORAGE_WHATSAPP_GROUPS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            groups = parsed;
          }
        }
      }
    } catch (e) {
      console.warn("خطأ في قراءة مجموعات الواتساب:", e);
    }

    if (!groups || groups.length === 0) {
      groups = getInitialSampleWhatsAppGroups();
      saveWhatsAppGroups(groups);
    }
    return groups;
  }

  /**
   * حفظ مجموعات الواتساب في LocalStorage وإرسال الحدث
   */
  function saveWhatsAppGroups(groups) {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_WHATSAPP_GROUPS_KEY, JSON.stringify(groups));
      }
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('qurani:groups_updated', { detail: { groups } }));
      }
    } catch (e) {
      console.error("فشل حفظ مجموعات الواتساب:", e);
    }
  }

  /**
   * إضافة مجموعة واتساب جديدة (اسم، رابط، تصنيف، وصف)
   */
  function addWhatsAppGroup(groupData) {
    const groups = getWhatsAppGroups();
    const id = 'group_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    
    let link = (groupData.link || '').trim();
    if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
      link = 'https://' + link;
    }

    const newGroup = {
      id,
      name: (groupData.name || 'مجموعة قرآنية جديدة').trim(),
      link: link,
      category: groupData.category || 'general',
      description: (groupData.description || '').trim(),
      createdAt: new Date().toISOString()
    };

    groups.push(newGroup);
    saveWhatsAppGroups(groups);
    return newGroup;
  }

  /**
   * تحديث بيانات مجموعة واتساب
   */
  function updateWhatsAppGroup(id, data) {
    const groups = getWhatsAppGroups();
    const idx = groups.findIndex(g => g.id === id);
    if (idx === -1) return null;

    let link = data.link !== undefined ? (data.link || '').trim() : groups[idx].link;
    if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
      link = 'https://' + link;
    }

    const updated = {
      ...groups[idx],
      ...data,
      id: groups[idx].id,
      link: link
    };

    groups[idx] = updated;
    saveWhatsAppGroups(groups);
    return updated;
  }

  /**
   * حذف مجموعة واتساب
   */
  function deleteWhatsAppGroup(id) {
    let groups = getWhatsAppGroups();
    groups = groups.filter(g => g.id !== id);
    saveWhatsAppGroups(groups);
    return groups;
  }

  /**
   * جلب مجموعة بالمعرف
   */
  function getWhatsAppGroupById(id) {
    const groups = getWhatsAppGroups();
    return groups.find(g => g.id === id) || null;
  }

  // =========================================================================
  // الحسابات الرياضية للورد القرآني والختمات
  // =========================================================================

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
   * حساب تفاصيل ورد اليوم لشخص معين (المالك أو جهة اتصال)
   */
  function calculateTodayWird(person = null, date = new Date()) {
    const target = person || getOwner();
    if (!target) return null;

    const plan = PLANS[target.planId] || PLANS.safa;
    const pagesPerDay = target.planId === 'custom' 
      ? (target.customPagesPerDay || 5) 
      : plan.pagesPerDay;

    const todayStr = getTodayString(date);
    const isCompletedToday = (target.lastCompletedDate === todayStr || target.completedToday === true);

    let startPage;
    let endPage;

    if (isCompletedToday) {
      endPage = Math.min(TOTAL_MUSHAF_PAGES, Math.max(1, target.currentPage));
      startPage = Math.max(1, endPage - pagesPerDay + 1);
    } else {
      startPage = Math.min(TOTAL_MUSHAF_PAGES, Math.max(1, target.currentPage || 1));
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
    const estimated = calculateEstimatedKhatmahDate(target.currentPage, pagesPerDay, date);

    return {
      user: target,
      contact: target,
      person: target,
      plan,
      pagesPerDay,
      startPage,
      endPage,
      pagesCount: (endPage - startPage) + 1,
      surahs,
      surahsNames,
      surahName: surahsNames,
      juz: juzNumber,
      juzName,
      progressPercentage,
      progressPercent: progressPercentage,
      pagesRemaining,
      daysRemaining: estimated.daysNeeded,
      estimatedKhatmahDate: estimated.dateFormatted,
      expectedEndDate: estimated.dateFormatted,
      completedToday: isCompletedToday,
      isCompletedToday: isCompletedToday,
      streak: target.streak || 0,
      khatmahCount: target.khatmahCount || 0
    };
  }

  /**
   * تسجيل إتمام الورد اليومي للمالك أو لجهة اتصال
   */
  function markTodayCompleted(personId = 'owner') {
    if (!personId || personId === 'owner') {
      const owner = getOwner();
      const todayStr = getTodayString();
      const yesterdayStr = getYesterdayString();

      if (owner.lastCompletedDate === todayStr) {
        return { user: owner, person: owner, alreadyCompleted: true };
      }

      const plan = PLANS[owner.planId] || PLANS.safa;
      const pagesPerDay = owner.planId === 'custom' ? (owner.customPagesPerDay || 5) : plan.pagesPerDay;

      let newPage = owner.currentPage + pagesPerDay;
      let newKhatmahCount = owner.khatmahCount || 0;
      let khatmahCompleted = false;

      if (newPage > TOTAL_MUSHAF_PAGES) {
        newKhatmahCount++;
        newPage = (newPage - TOTAL_MUSHAF_PAGES);
        khatmahCompleted = true;
      }

      let newStreak = owner.streak || 0;
      if (owner.lastCompletedDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      const longestStreak = Math.max(owner.longestStreak || 0, newStreak);

      const updatedOwner = {
        ...owner,
        currentPage: newPage,
        completedToday: true,
        streak: newStreak,
        longestStreak,
        khatmahCount: newKhatmahCount,
        lastCompletedDate: todayStr
      };

      saveOwner(updatedOwner);

      return {
        user: updatedOwner,
        person: updatedOwner,
        khatmahCompleted,
        newStreak
      };
    } else {
      // جهة اتصال
      const res = toggleContactCompleted(personId);
      return res ? { user: res.contact, person: res.contact, newStreak: res.contact.streak } : null;
    }
  }

  /**
   * التراجع عن إتمام الورد
   */
  function undoTodayCompleted(personId = 'owner') {
    if (!personId || personId === 'owner') {
      const owner = getOwner();
      if (!owner.completedToday) return null;

      const plan = PLANS[owner.planId] || PLANS.safa;
      const pagesPerDay = owner.planId === 'custom' ? (owner.customPagesPerDay || 5) : plan.pagesPerDay;

      let prevPage = owner.currentPage - pagesPerDay;
      if (prevPage < 1) prevPage = 1;

      const prevStreak = Math.max(0, (owner.streak || 1) - 1);

      const updatedOwner = {
        ...owner,
        currentPage: prevPage,
        completedToday: false,
        streak: prevStreak,
        lastCompletedDate: getYesterdayString()
      };

      saveOwner(updatedOwner);
      return updatedOwner;
    } else {
      const res = toggleContactCompleted(personId);
      return res ? res.contact : null;
    }
  }

  /**
   * تغيير خطة الورد للمالك أو لجهة اتصال
   */
  function changeUserPlan(personId = 'owner', newPlanId = 'safa', customPages = null) {
    if (!personId || personId === 'owner') {
      const plan = PLANS[newPlanId] || PLANS.safa;
      const pagesPerDay = newPlanId === 'custom'
        ? Math.max(1, parseInt(customPages, 10) || 5)
        : plan.pagesPerDay;

      return updateOwner({
        planId: plan.id,
        customPagesPerDay: pagesPerDay
      });
    } else {
      return updateContact(personId, {
        planId: newPlanId,
        customPagesPerDay: customPages
      });
    }
  }

  /**
   * إعادة ضبط الختمة للبدء من الصفحة الأولى
   */
  function resetUserKhatmah(personId = 'owner') {
    if (!personId || personId === 'owner') {
      return updateOwner({
        currentPage: 1,
        completedToday: false,
        lastCompletedDate: null
      });
    } else {
      return updateContact(personId, {
        currentPage: 1,
        completedToday: false,
        lastCompletedDate: null
      });
    }
  }

  // =========================================================================
  // دوال التوافقية مع الأنظمة والواجهات السابقة (Backwards Compatibility)
  // =========================================================================

  /**
   * getActiveUser: يعيد حساب المالك دائماً في النموذج الأحادي
   */
  function getActiveUser() {
    return getOwner();
  }

  /**
   * setActiveUser: لم يعد هناك تبديل حسابات في نموذج المالك الواحد
   */
  function setActiveUser(userId) {
    console.info("ملاحظة معمارية: تم إلغاء تبديل الحسابات، النظام يعمل بنموذج المالك الواحد (Single Owner).");
    return getOwner();
  }

  /**
   * getAllUsers: يعيد قائمة المشتركين مع تمييز المالك كأول عنصر
   */
  function getAllUsers() {
    const owner = getOwner();
    const contacts = getContacts('all');
    return [
      { ...owner, isOwner: true },
      ...contacts.map(c => ({ ...c, isOwner: false }))
    ];
  }

  function getUserById(userId) {
    if (!userId || userId === 'owner' || userId === 'user_ahmed') {
      return getOwner();
    }
    const contacts = getContacts('all');
    return contacts.find(c => c.id === userId) || null;
  }

  function addUser(data) {
    return addContact(data);
  }

  function updateUser(userId, data) {
    if (!userId || userId === 'owner' || userId === 'user_ahmed') {
      return updateOwner(data);
    }
    return updateContact(userId, data);
  }

  function deleteUser(userId) {
    if (!userId || userId === 'owner') {
      console.warn("لا يمكن حذف حساب المالك الرئيسي");
      return getAllUsers();
    }
    deleteContact(userId);
    return getAllUsers();
  }

  return {
    PLANS,
    plans: PLANS,
    TOTAL_MUSHAF_PAGES,
    getTodayString,
    getYesterdayString,

    // واجهات المالك (Single Owner APIs)
    getOwner,
    updateOwner,

    // واجهات دوائر الأهل والأصدقاء (Contacts / Members APIs)
    getContacts,
    getMembers: getContacts,
    addContact,
    updateContact,
    deleteContact,
    toggleContactCompleted,
    getGroupStats,
    getUsersByGroup: function(groupType) {
      return getContacts(groupType);
    },

    // واجهات قروبات الواتساب (WhatsApp Groups APIs)
    getWhatsAppGroups,
    saveWhatsAppGroups,
    addWhatsAppGroup,
    updateWhatsAppGroup,
    deleteWhatsAppGroup,
    getWhatsAppGroupById,

    // الحسابات الرياضية للورد والختمات
    calculateProgressPercentage,
    calculateProgress: function(person) {
      const p = person || getOwner();
      const pct = calculateProgressPercentage(p ? p.currentPage : 1);
      const plan = PLANS[p?.planId] || PLANS.safa;
      const pages = p?.planId === 'custom' ? (p?.customPagesPerDay || 5) : (plan.pagesPerDay || 2);
      const est = calculateEstimatedKhatmahDate(p ? p.currentPage : 1, pages);
      return {
        progressPercent: pct,
        progressPercentage: pct,
        expectedEndDate: est.dateFormatted
      };
    },
    calculateEstimatedKhatmahDate,
    calculateCustomPlanByDays,
    calculateTodayWird,
    calculateWirdForUser: function(person) {
      return calculateTodayWird(person || getOwner());
    },
    markTodayCompleted,
    markTodayWirdCompleted: function() {
      return markTodayCompleted('owner');
    },
    undoTodayCompleted,
    changeUserPlan,
    changeActiveUserPlan: function(planId, customPages) {
      return changeUserPlan('owner', planId, customPages);
    },
    resetUserKhatmah,

    // دوال التوافقية القديمة (Backward compatibility aliases)
    getActiveUser,
    setActiveUser,
    getAllUsers,
    getUsers: getAllUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser
  };
}));
