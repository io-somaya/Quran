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

    // إزالة الأصفار في البداية (مثل 0020 -> 20 أو 00966 -> 966)
    cleaned = cleaned.replace(/^00/, '');

    // أرقام مصر (تبدأ بـ 010 أو 011 أو 012 أو 015 وبطول 11 رقماً)
    if (/^01[0125]\d{8}$/.test(cleaned)) {
      cleaned = '2' + cleaned;
    }
    // أرقام السعودية (تبدأ بـ 05 وبطول 10 أرقام)
    else if (/^05\d{8}$/.test(cleaned)) {
      cleaned = '966' + cleaned.substring(1);
    }
    // أرقام السعودية بدون صفر البداية (تبدأ بـ 5 وبطول 9 أرقام)
    else if (/^5\d{8}$/.test(cleaned)) {
      cleaned = '966' + cleaned;
    }
    // أي رقم محلي يبدأ بصفر بطول 10 أو أكثر
    else if (cleaned.startsWith('0') && cleaned.length >= 10) {
      cleaned = defaultCountryCode + cleaned.replace(/^0+/, '');
    }

    return cleaned;
  }

  /**
   * استخراج اسم المستلم المناسب للتحية والرسائل (عدم استخدام أحمد والافتراض أخي / أختي)
   * @param {object} person كائن المشترك أو المالك
   * @returns {string} اسم المستلم
   */
  function getRecipientName(person) {
    if (!person) return 'أخي / أختي';
    // إذا كان المالك أو الحساب العام
    if (person.id === 'owner') {
      if (!person.name || person.name === 'أحمد' || person.name === 'أخي / أختي') {
        return 'أخي / أختي';
      }
      return person.name;
    }
    // جهة اتصال محددة من الأهل أو الأصدقاء
    if (person.name && person.name !== 'أحمد') {
      return person.name;
    }
    return 'أخي / أختي';
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
    return 'https://qurani-production.up.railway.app/';
  }

  /**
   * تحويل الأرقام إلى الأرقام العربية المشرقية
   * @param {number|string} num 
   */
  function toArabicDigits(num) {
    if (num === null || num === undefined) return '';
    return String(num).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  }

  // =========================================================================
  // قوالب الرسائل الجاهزة والمنمقة (Templates)
  // =========================================================================

  /**
   * 1. قالب إرسال الورد القرآني كاملاً مكتوباً برسم المصحف مع الدعاء والرابط
   * @param {object} user كائن المشترك/القارئ
   * @param {object} optionalWird حسابات الورد (اختياري)
   * @returns {Promise<string>}
   */
  async function createFullWirdTextMessage(user, optionalWird = null) {
    const person = user || (QuraniWirdEngine ? (QuraniWirdEngine.getActiveUser() || QuraniWirdEngine.getOwner()) : null);
    if (!person) return '';

    let wird = optionalWird;
    if (!wird && QuraniWirdEngine && typeof QuraniWirdEngine.calculateTodayWird === 'function') {
      wird = QuraniWirdEngine.calculateTodayWird(person);
    }

    const startPage = Math.max(1, Math.min(604, wird ? wird.startPage : (person.currentPage || 1)));
    const endPage = Math.max(startPage, Math.min(604, wird ? wird.endPage : (startPage + (person.customPagesPerDay || 2) - 1)));
    const planName = wird && wird.plan ? wird.plan.name : 'الورد اليومي';
    const surahs = wird && wird.surahsNames ? wird.surahsNames : 'القرآن الكريم';
    const juzName = wird ? wird.juzName : 'الجزء الأول';
    const pagesCount = endPage - startPage + 1;

    const baseUrl = getAppBaseUrl();
    const readingLink = `${baseUrl}#page=${startPage}&user=${encodeURIComponent(person.id || '')}`;

    const bismillahUthmani = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    const qData = QuraniData || (typeof window !== 'undefined' ? window.QuraniData : null);

    // عدد الصفحات المراد استعراض نصها بالكامل (حتى 4 صفحات كاملة لضمان كفاءة واتساب)
    const maxPagesToRender = 4;
    const pagesToFetchCount = Math.min(pagesCount, maxPagesToRender);
    const pageTexts = [];

    for (let i = 0; i < pagesToFetchCount; i++) {
      const p = startPage + i;
      let ayahs = [];
      if (qData && typeof qData.fetchPageAyahs === 'function') {
        try {
          ayahs = await qData.fetchPageAyahs(p);
        } catch (e) {
          console.warn(`فشل جلب آيات الصفحة ${p}`, e);
        }
      }

      if (!ayahs || ayahs.length === 0) {
        const info = (qData && typeof qData.getPageInfo === 'function') ? qData.getPageInfo(p) : null;
        const sName = info && info.primarySurah ? info.primarySurah.name : 'القرآن الكريم';
        pageTexts.push([
          `📄 *[صفحة ${p}]*`,
          `📜 *سورة ${sName}*`,
          `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`,
          `﴿ صفحة مباركة من كتاب الله العزيز ﴾`
        ].join('\n'));
        continue;
      }

      const pageLines = [];
      pageLines.push(`📄 *[الصفحة ${p}]*`);

      let currentSurahNum = null;
      let runningAyahs = [];

      ayahs.forEach((a) => {
        let txt = (a.text || '').replace(/^\uFEFF/, '').trim();
        const surahNumber = a.surahNumber || (a.surah ? a.surah.number : 1);
        let surahName = a.surahName || (a.surah ? a.surah.name : '');
        surahName = surahName.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '').trim();

        if (surahNumber !== currentSurahNum) {
          if (runningAyahs.length > 0) {
            pageLines.push(runningAyahs.join(' '));
            runningAyahs = [];
          }
          currentSurahNum = surahNumber;
          pageLines.push(`\n📜 *سورة ${surahName}*`);

          // تنسيق البسملة في بداية السور ما عدا الفاتحة والتوبة
          if (surahNumber !== 1 && surahNumber !== 9) {
            if (txt.startsWith(bismillahUthmani)) {
              pageLines.push(`بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n`);
              txt = txt.replace(bismillahUthmani, '').trim();
            } else if (a.numberInSurah === 1) {
              pageLines.push(`بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n`);
            }
          }
        }

        const ayahNumArabic = toArabicDigits(a.numberInSurah);
        runningAyahs.push(`﴿ ${txt} ﴾ [${ayahNumArabic}]`);
      });

      if (runningAyahs.length > 0) {
        pageLines.push(runningAyahs.join(' '));
      }

      pageTexts.push(pageLines.join('\n'));
    }

    if (pagesCount > maxPagesToRender) {
      pageTexts.push(`\n... وتستكمل بقية صفحات الورد (من صفحة ${startPage + maxPagesToRender} إلى صفحة ${endPage}) عبر رابط المصحف المباشر أدناه.`);
    }

    const recipientName = getRecipientName(person);
    const greetingLine = `🌸 *السلام عليكم ورحمة الله وبركاته يا ${recipientName}* 🌸`;

    const messageLines = [
      greetingLine,
      ``,
      `📖 *ورد اليوم المبارك من القرآن الكريم (مكتوباً كاملاً)*`,
      `━━━━━━━━━━━━━━━━━━`,
      `🌿 *الخطة:* ${planName}`,
      `📄 *الصفحات:* من صفحة *${startPage}* إلى صفحة *${endPage}* (${pagesCount} ${pagesCount === 1 ? 'صفحة' : 'صفحات'})`,
      `📜 *السور الكريمة:* ${surahs}`,
      `💎 *الموقع:* ${juzName}`,
      `━━━━━━━━━━━━━━━━━━`,
      ``,
      `✨ *نص الآيات الكريمة المباركة:*`,
      ``,
      pageTexts.join('\n\n━━━━━━━━━━━━━━━━━━\n\n'),
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `🔗 *رابط القراءة والتفسير الميسر والاستماع الصوتي:*`,
      `${readingLink}`,
      ``,
      `🤲 *دعاء تلاوة القرآن والورد:*`,
      `«اللَّهُمَّ اجْعَلِ القُرْآنَ العَظِيمَ رَبِيعَ قُلُوبِنَا، وَنُورَ صُدُورِنَا، وَجَلَاءَ أَحْزَانِنَا، وَذَهَابَ هُمُومِنَا وَغُمُومِنَا».`,
      `«اللَّهُمَّ ذَكِّرْنَا مِنْهُ مَا نُسِّينَا، وَعَلِّمْنَا مِنْهُ مَا جَهِلْنَا، وَارْزُقْنَا تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ عَلَى الوَجْهِ الَّذِي يُرْضِيكَ عَنَّا».`,
      ``,
      `✨ قال رسول الله ﷺ: «اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعاً لأَصْحابِهِ».`,
      `تقبل الله طاعتكم وجعله نوراً وشفيعاً لكم ولوالديكم في الدارين 🤲🤍`
    ];

    return messageLines.join('\n');
  }

  /**
   * 2. قالب تذكير الورد القرآني اليومي (مختصر ومحفز مع رابط الموقع)
   * @param {object} user كائن المشترك
   * @param {object} optionalWird حسابات الورد (اختياري)
   */
  function createDailyWirdReminder(user, optionalWird = null) {
    const person = user || (QuraniWirdEngine ? (QuraniWirdEngine.getActiveUser() || QuraniWirdEngine.getOwner()) : null);
    if (!person) return '';

    let wird = optionalWird;
    if (!wird && QuraniWirdEngine && typeof QuraniWirdEngine.calculateTodayWird === 'function') {
      wird = QuraniWirdEngine.calculateTodayWird(person);
    }

    const startPage = wird ? wird.startPage : (person.currentPage || 1);
    const endPage = wird ? wird.endPage : (startPage + (person.customPagesPerDay || 2) - 1);
    const planName = wird && wird.plan ? wird.plan.name : 'الورد اليومي';
    const surahs = wird && wird.surahsNames ? wird.surahsNames : 'القرآن الكريم';
    const juzName = wird ? wird.juzName : 'الجزء الأول';
    const pagesCount = wird ? wird.pagesCount : (endPage - startPage + 1);

    const baseUrl = getAppBaseUrl();
    const readingLink = `${baseUrl}#page=${startPage}&user=${encodeURIComponent(person.id || '')}`;
    const recipientName = getRecipientName(person);

    return [
      `🌸 *السلام عليكم ورحمة الله وبركاته يا ${recipientName}* 🌸`,
      ``,
      `🔔 *تذكير الورد القرآني المبارك لليوم*`,
      `━━━━━━━━━━━━━━━━━━`,
      `🌿 *الخطة:* ${planName}`,
      `📄 *المقدار:* من صفحة *${startPage}* إلى صفحة *${endPage}* (${pagesCount} ${pagesCount === 1 ? 'صفحة' : 'صفحات'})`,
      `📜 *السور المشمولة:* ${surahs}`,
      `💎 *الموقع:* ${juzName}`,
      `━━━━━━━━━━━━━━━━━━`,
      ``,
      `🔗 *افتح مصحفك واقرأ وردك مباشرة مع التفسير والاستماع:*`,
      `${readingLink}`,
      ``,
      `✨ قال رسول الله ﷺ: «اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعاً لأَصْحابِهِ».`,
      `نسأل الله أن يجعله نوراً في قلوبنا وشفيعاً لنا يوم القيامة 🤲🤍`
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
    const recipientName = getRecipientName(user);

    return [
      `🎉 *هنيئاً لك يا ${recipientName}! تقبل الله طاعتك* 🌟`,
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
    const name = getRecipientName(user);
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
    const name = getRecipientName(user);
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
    const name = getRecipientName(user);
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

  /**
   * 6. قالب مشاركة ورد المالك اليومي مع الأهل والأصدقاء أو في الحالة (Owner Wird Share)
   * @param {object} owner كائن المالك
   * @param {object} optionalWird حسابات الورد
   */
  function createOwnerWirdShareMessage(owner, optionalWird = null) {
    const person = owner || (QuraniWirdEngine ? QuraniWirdEngine.getOwner() : null);
    if (!person) return '';

    let wird = optionalWird;
    if (!wird && QuraniWirdEngine && typeof QuraniWirdEngine.calculateTodayWird === 'function') {
      wird = QuraniWirdEngine.calculateTodayWird(person);
    }

    const rawName = (person.name && person.name !== 'أحمد') ? person.name : 'أخي / أختي';
    const startPage = wird ? wird.startPage : (person.currentPage || 1);
    const endPage = wird ? wird.endPage : (startPage + (person.customPagesPerDay || 2) - 1);
    const surahs = wird && wird.surahsNames ? wird.surahsNames : 'القرآن الكريم';
    const juzName = wird ? wird.juzName : 'الجزء الأول';
    const streak = person.streak || 1;
    const isCompleted = wird ? wird.isCompletedToday : person.completedToday;
    const progress = wird ? wird.progressPercentage : (((person.currentPage || 1) / 604) * 100).toFixed(1);

    const baseUrl = getAppBaseUrl();
    const readingLink = `${baseUrl}#page=${startPage}`;

    const signature = (rawName === 'أخي / أختي') ? 'أخوكم / أختكم في الله 🤍' : `أخوكم / أختكم: *${rawName}* 🤍`;

    return [
      `🌿 *السلام عليكم ورحمة الله وبركاته يا أخي / أختي* 🌸`,
      ``,
      isCompleted 
        ? `📖 *بحمد الله وفضله أتممت قراءة وردي القرآني لليوم:*`
        : `📖 *شاركوني البركة — وردي القرآني المستهدف لهذا اليوم:*`,
      `━━━━━━━━━━━━━━━━━━`,
      `📄 *الصفحات:* من صفحة *${startPage}* إلى صفحة *${endPage}*`,
      `📜 *السور الكريمة:* ${surahs}`,
      `💎 *الموقع:* ${juzName}`,
      `📊 *إنجاز الختمة:* ${progress}%`,
      `🔥 *أيام الالتزام المتتالي:* ${streak} يوماً`,
      `━━━━━━━━━━━━━━━━━━`,
      ``,
      `✨ أدعوكم لمشاركتي صحبة كتاب الله وتلاوة وردكم اليومي:`,
      `🔗 *رابط المصحف المباشر:* ${readingLink}`,
      ``,
      `🤲 «اللَّهُمَّ اجْعَلِ القُرْآنَ العَظِيمَ رَبِيعَ قُلُوبِنَا وَنُورَ صُدُورِنَا».`,
      signature
    ].join('\n');
  }

  /**
   * 7. قالب ملخص الورد الجماعي لقروب الأهل أو الأصدقاء أو أي قروب مخصص (Group Summary for WhatsApp)
   * @param {string} groupType 'family' | 'friends' | 'all'
   * @param {Array} contacts مصفوفة أفراد المقرأة
   * @param {string} customTitle اسم القروب المخصص
   */
  function createGroupSummaryMessage(groupType = 'family', contacts = null, customTitle = '') {
    let list = contacts;
    if (!list && QuraniWirdEngine && typeof QuraniWirdEngine.getContacts === 'function') {
      list = (groupType === 'all')
        ? QuraniWirdEngine.getContacts('all')
        : QuraniWirdEngine.getContacts(groupType);
    }

    const isFamily = (groupType === 'family');
    const defaultTitle = isFamily 
      ? 'مقرأة الأهل المباركة 👨‍👩‍👧‍👦' 
      : (groupType === 'friends' ? 'مقرأة الأصدقاء الكرام 👥' : 'مقرأتنا القرآنية المباركة 📖');
    const groupTitle = customTitle || defaultTitle;
    const todayStr = (new Date()).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const baseUrl = getAppBaseUrl();

    const lines = [
      `📖 *جدول الورد القرآني اليومي — ${groupTitle}* 🌸`,
      `🗓️ *التاريخ:* ${todayStr}`,
      `━━━━━━━━━━━━━━━━━━`,
      ``
    ];

    if (list && list.length > 0) {
      list.forEach((m, idx) => {
        let wird = null;
        if (QuraniWirdEngine && typeof QuraniWirdEngine.calculateTodayWird === 'function') {
          wird = QuraniWirdEngine.calculateTodayWird(m);
        }
        const startP = wird ? wird.startPage : (m.currentPage || 1);
        const endP = wird ? wird.endPage : (startP + (m.customPagesPerDay || 2) - 1);
        const statusIcon = m.completedToday ? '✅ (أتم)' : '⏳ (بانتظار القراءة)';
        const surahName = wird && wird.surahsNames ? `[سورة ${wird.surahsNames}]` : '';

        lines.push(`${idx + 1}. *${m.name}* (${m.relation || ''}): ص ${startP}-${endP} ${surahName} ${statusIcon}`);
      });
    } else {
      // إذا لم يكن هناك قراء بعد، نعرض ورد الحساب الشخصي
      const owner = QuraniWirdEngine ? QuraniWirdEngine.getOwner() : null;
      if (owner) {
        let wird = QuraniWirdEngine ? QuraniWirdEngine.calculateTodayWird(owner) : null;
        const startP = wird ? wird.startPage : (owner.currentPage || 1);
        const endP = wird ? wird.endPage : (startP + (owner.customPagesPerDay || 2) - 1);
        const displayName = (owner.name && owner.name !== 'أحمد') ? owner.name : 'أخي / أختي';
        lines.push(`1. *${displayName}*: ص ${startP}-${endP} ${surahName} ${owner.completedToday ? '✅ (أتم)' : '⏳'}`);
      }
    }

    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`✨ قال رسول الله ﷺ: «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ».`);
    lines.push(`🔗 *رابط الموقع المباشر لتلاوة الورد وتدبره:* https://qurani-production.up.railway.app/`);
    lines.push(`نسأل الله أن يبارك في جمعنا وأن يوفقنا لختم كتابه وتدبره 🤲🤍`);

    return lines.join('\n');
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

  /**
   * فتح رابط القروب المباشر مع نسخ نص الرسالة للحافظة
   * @param {string} groupLink رابط القروب مثل https://chat.whatsapp.com/xxx
   * @param {string} message نص الرسالة المراد نسخه
   * @returns {Promise<{success: boolean, copied: boolean, opened: boolean}>}
   */
  async function openGroupWithClipboard(groupLink, message) {
    let copied = false;
    if (message) {
      copied = await copyToClipboard(message);
    }
    let opened = false;
    if (groupLink && typeof window !== 'undefined') {
      let targetUrl = groupLink.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      opened = true;
    }
    return { success: true, copied, opened };
  }

  return {
    cleanPhoneNumber,
    generateWhatsAppLink,
    createDailyWirdReminder,
    generateDailyWirdMessage: createDailyWirdReminder,
    createFullWirdTextMessage,
    generateFullWirdTextMessage: createFullWirdTextMessage,
    createWirdCompletedCongratulations,
    generateCongratsMessage: createWirdCompletedCongratulations,
    createFridayKahfReminder,
    generateFridayKahfMessage: createFridayKahfReminder,
    createAdhkarReminder,
    generateAdhkarReminderMessage: createAdhkarReminder,
    createCustomEncouragementMessage,
    generateCustomMessage: createCustomEncouragementMessage,
    createOwnerWirdShareMessage,
    generateOwnerShareMessage: createOwnerWirdShareMessage,
    createGroupSummaryMessage,
    generateGroupSummaryMessage: createGroupSummaryMessage,
    copyToClipboard,
    openWhatsApp,
    openGroupWithClipboard,
    shareNativeOrWhatsApp
  };
}));
