/**
 * ==============================================================================
 * منصة «قرءاني» (Qur'ani) — محرك أتمتة وتوليد رسائل واتساب (WhatsApp Engine)
 * ==============================================================================
 * يتولى هذا المحرك:
 * 1. تهيئة وتدقيق أرقام الهواتف وصياغة روابط `https://wa.me/` المباشرة والآمنة.
 * 2. قوالب الرسائل العربية الفاخرة (تذكير الورد، تهنئة الإنجاز، الجمعة والكهف، أذكار الصباح والمساء).
 * 3. تضمين بيانات الورد الديناميكية (الصفحات، السور، الأجزاء، نسبة التقدم، روابط الموقع التفاعلية).
 * 4. دوال التفاعل مع الحافظة (Clipboard) والمشاركة عبر المتصفح (Web Share API).
 * ==============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./wird-engine', './quran-data'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./wird-engine'), require('./quran-data'));
  } else {
    root.QuraniWhatsApp = factory(root.QuraniWirdEngine, root.QuraniData);
  }
}(typeof self !== 'undefined' ? self : this, function (QuraniWirdEngine, QuraniData) {
  'use strict';

  /**
   * تنظيف وتنسيق رقم الهاتف ليتوافق مع رابط واتساب الدولي
   * @param {string|number} phone 
   * @param {string} defaultCountryCode مفتاح الدولة الافتراضي (966 للسعودية)
   */
  function cleanPhoneNumber(phone, defaultCountryCode = '966') {
    if (!phone) return '';
    let cleaned = String(phone).replace(/[\s\-\(\)\+]/g, '');

    // إزالة الأصفار في البداية
    cleaned = cleaned.replace(/^00/, '');

    // إذا بدأ بصفر محلي (مثل 050...) نضيف مفتاح الدولة الافتراضي
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = defaultCountryCode + cleaned.substring(1);
    } else if (cleaned.length === 9 && cleaned.startsWith('5')) {
      // مثل 501234567 بدون صفر
      cleaned = defaultCountryCode + cleaned;
    }

    return cleaned;
  }

  /**
   * إنشاء رابط واتساب مباشر (wa.me)
   * @param {string} phone رقم الهاتف
   * @param {string} message نص الرسالة
   * @returns {string} رابط واتساب المشفر والمجهز
   */
  function generateWhatsAppLink(phone, message) {
    const cleanPhone = cleanPhoneNumber(phone);
    const encoded = encodeURIComponent(message || '');
    
    if (cleanPhone) {
      return `https://wa.me/${cleanPhone}?text=${encoded}`;
    }
    // رابط مشاركة عام إن لم يكن هناك رقم محدد
    return `https://api.whatsapp.com/send?text=${encoded}`;
  }

  /**
   * استخراج الرابط المباشر للتطبيق
   */
  function getAppBaseUrl() {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin + window.location.pathname;
    }
    return 'https://qurani.app';
  }

  // =========================================================================
  // قوالب الرسائل الجاهزة والمنمقة (Templates)
  // =========================================================================

  /**
   * 1. قالب تذكير الورد القرآني اليومي
   * @param {object} user كائن المشترك
   * @param {object} optionalWird حسابات الورد (اختياري)
   */
  function createDailyWirdReminder(user, optionalWird = null) {
    if (!user) return '';

    let wird = optionalWird;
    if (!wird && QuraniWirdEngine && typeof QuraniWirdEngine.calculateTodayWird === 'function') {
      wird = QuraniWirdEngine.calculateTodayWird(user);
    }

    const startPage = wird ? wird.startPage : (user.currentPage || 1);
    const endPage = wird ? wird.endPage : (startPage + (user.customPagesPerDay || 2) - 1);
    const planName = wird && wird.plan ? wird.plan.name : 'الورد اليومي';
    const surahs = wird && wird.surahsNames ? wird.surahsNames : 'القرآن الكريم';
    const juzName = wird ? wird.juzName : 'الجزء الأول';
    const pagesCount = wird ? wird.pagesCount : (endPage - startPage + 1);

    const baseUrl = getAppBaseUrl();
    const readingLink = `${baseUrl}#page=${startPage}&user=${encodeURIComponent(user.id)}`;

    return [
      `🌸 *السلام عليكم ورحمة الله وبركاته يا ${user.name}* 🌸`,
      ``,
      `📖 *تذكير وردك القرآني المبارك لليوم*`,
      `━━━━━━━━━━━━━━━━━━`,
      `🌿 *الخطة:* ${planName}`,
      `📄 *المقدار:* من صفحة *${startPage}* إلى صفحة *${endPage}* (${pagesCount} صفحات)`,
      `📜 *السور المشمولة:* ${surahs}`,
      `💎 *الموقع:* ${juzName}`,
      `━━━━━━━━━━━━━━━━━━`,
      ``,
      `🔗 *افتح مصحفك واقرأ وردك مباشرة مع التفسير والاستماع:*`,
      `${readingLink}`,
      ``,
      `✨ قال رسول الله ﷺ: «اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعاً لأَصْحابِهِ».`,
      `نسأل الله أن يجعله نوراً في قلبك وشفيعاً لك يوم القيامة 🤲🤍`
    ].join('\n');
  }

  /**
   * 2. قالب تهنئة إتمام الورد اليومي
   * @param {object} user 
   * @param {object} optionalWird 
   */
  function createWirdCompletedCongratulations(user, optionalWird = null) {
    if (!user) return '';

    let wird = optionalWird;
    if (!wird && QuraniWirdEngine && typeof QuraniWirdEngine.calculateTodayWird === 'function') {
      wird = QuraniWirdEngine.calculateTodayWird(user);
    }

    const currentPage = user.currentPage || 1;
    const progress = wird ? wird.progressPercentage : ((currentPage / 604) * 100).toFixed(1);
    const streak = user.streak || 1;
    const khatmahCount = user.khatmahCount || 0;

    return [
      `🎉 *هنيئاً لك يا ${user.name}! تقبل الله طاعتك* 🌟`,
      `━━━━━━━━━━━━━━━━━━`,
      `بحمد الله وفضله أتممت قراءة وردك القرآني لهذا اليوم مباركاً:`,
      ``,
      `📖 *الصفحة الحالية:* ${currentPage} من 604`,
      `📊 *نسبة إتمام الختمة:* ${progress}%`,
      `🔥 *أيام الالتزام المتتالي (Streak):* ${streak} يوماً ما شاء الله!`,
      khatmahCount > 0 ? `🏆 *عدد الختمات السابقة:* ${khatmahCount} ختمة مباركة` : '',
      `━━━━━━━━━━━━━━━━━━`,
      ``,
      `🤲 «اللَّهُمَّ اجْعَلِ القُرْآنَ رَبِيعَ قُلُوبِنَا، وَنُورَ صُدُورِنَا، وَجَلَاءَ أَحْزَانِنَا، وَذَهَابَ هُمُومِنَا وَغُمُومِنَا».`,
      ``,
      `ثبّتك الله وأدام عليك بركة القرآن وصحبته العطرة 🌿✨`
    ].filter(Boolean).join('\n');
  }

  /**
   * 3. قالب تذكير يوم الجمعة (سورة الكهف والصلاة على النبي ﷺ)
   * @param {object} user 
   */
  function createFridayKahfReminder(user) {
    const name = user ? user.name : 'أخي الكريم';
    const baseUrl = getAppBaseUrl();
    const kahfLink = `${baseUrl}#page=293`; // صفحة بداية سورة الكهف

    return [
      `🕌 *جمعة مباركة طيبة يا ${name}* 🌿`,
      `━━━━━━━━━━━━━━━━━━`,
      `قال رسول الله ﷺ:`,
      `«مَن قرَأَ سورةَ الكَهفِ يومَ الجُمُعةِ، أضاءَ له من النُّورِ ما بينَ الجُمُعتَينِ».`,
      ``,
      `📖 *رابط قراءة سورة الكهف مباشرة مع التفسير الميسر:*`,
      `${kahfLink}`,
      ``,
      `✨ *ولا تنسَ غنيمة اليوم العظيمة بالإكثار من الصلاة على الحبيب المصطفى ﷺ:*`,
      `«اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ» 🤍`
    ].join('\n');
  }

  /**
   * 4. قالب تذكير أذكار الصباح والمساء
   * @param {object} user 
   * @param {string} type 'morning' | 'evening'
   */
  function createAdhkarReminder(user, type = 'morning') {
    const name = user ? user.name : 'الكريم';
    const baseUrl = getAppBaseUrl();
    const isMorning = (type === 'morning');
    const adhkarLink = `${baseUrl}#adhkar-${type}`;

    if (isMorning) {
      return [
        `🌅 *صباح مبارك بذكر الله يا ${name}* ☀️`,
        `━━━━━━━━━━━━━━━━━━`,
        `«أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ»`,
        ``,
        `🛡️ حصنك اليومي وأمانك وحفظك من كل سوء بانتظارك:`,
        `${adhkarLink}`,
        ``,
        `اجعل بداية يومك نورا وسعادة وتوفيقا برضا الرحمن 🌿✨`
      ].join('\n');
    } else {
      return [
        `🌙 *مساء السكينة والطمأنينة يا ${name}* ✨`,
        `━━━━━━━━━━━━━━━━━━`,
        `«أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ»`,
        ``,
        `🛡️ طيّب ليلتك بذكر الله، واقرأ أذكار المساء لتحصين نفسك وأهلك:`,
        `${adhkarLink}`,
        ``,
        `«أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ» 🤲🤍`
      ].join('\n');
    }
  }

  /**
   * 5. قالب رسالة تشجيعية مخصصة
   * @param {object} user 
   * @param {string} customNote ملحوظة المشرف
   */
  function createCustomEncouragementMessage(user, customNote = '') {
    const name = user ? user.name : 'الصديق العزيز';
    const baseUrl = getAppBaseUrl();

    return [
      `🌸 *السلام عليكم ورحمة الله وبركاته يا ${name}* 🌸`,
      ``,
      customNote || `نود الاطمئنان على سير وردك القرآني اليومي، ومستعدون لمساندتك دائماً على الطاعة والمواظبة.`,
      ``,
      `🔗 *رابط منصة قرءاني:*`,
      `${baseUrl}`,
      ``,
      `تقبل الله منا ومنكم صالح الأعمال 🤲✨`
    ].join('\n');
  }

  // =========================================================================
  // دوال التفاعل (Clipboard & Browser Share & Tab Opener)
  // =========================================================================

  /**
   * نسخ نص الرسالة إلى حافظة الجهاز
   * @param {string} text النص المراد نسخه
   * @returns {Promise<boolean>} هل نجح النسخ أم لا
   */
  async function copyToClipboard(text) {
    if (!text) return false;

    // استخدام Clipboard API الحديثة
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("فشل النسخ عبر Clipboard API، يتم تجربة الأسلوب البديل", err);
      }
    }

    // fallback باستخدام عنصر textarea مؤقت
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("تعذر نسخ النص إلى الحافظة", err);
      return false;
    }
  }

  /**
   * فتح تطبيق واتساب في لسان جديد مباشرة
   * @param {string} phone 
   * @param {string} message 
   */
  function openWhatsApp(phone, message) {
    const link = generateWhatsAppLink(phone, message);
    if (typeof window !== 'undefined') {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
    return link;
  }

  /**
   * مشاركة عبر واجهة المشاركة الأصلية للجوال (Web Share API)
   * مع الرجوع التلقائي لواتساب إن لم تكن مدعومة
   */
  async function shareNativeOrWhatsApp(title, message, phone = '') {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'قرءاني — رفيق وردك اليومي',
          text: message
        });
        return { method: 'native_share', success: true };
      } catch (err) {
        // المستخدم ألغى المشاركة أو حدث استثناء
        if (err.name !== 'AbortError') {
          console.warn("المشاركة الأصلية غير مكتملة، يتم التحويل إلى واتساب", err);
        }
      }
    }
    
    // Fallback: فتح واتساب
    openWhatsApp(phone, message);
    return { method: 'whatsapp', success: true };
  }

  return {
    cleanPhoneNumber,
    generateWhatsAppLink,
    createDailyWirdReminder,
    createWirdCompletedCongratulations,
    createFridayKahfReminder,
    createAdhkarReminder,
    createCustomEncouragementMessage,
    copyToClipboard,
    openWhatsApp,
    shareNativeOrWhatsApp
  };
}));
