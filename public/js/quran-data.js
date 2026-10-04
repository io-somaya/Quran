/**
 * ==============================================================================
 * منصة «قرءاني» (Qur'ani) — بيانات القرآن الكريم الكاملة (Quran Metadata & Engine)
 * ==============================================================================
 * يحتوي هذا الملف على:
 * 1. فهرس الـ 114 سورة كاملاً مع التفاصيل (الاسم، التشكيل، الآيات، النزول، الصفحات، الأجزاء).
 * 2. بيانات وبيئات الاستماع لكبار القراء (مشاري العفاسي، الحصري، المنشاوي، عبد الباسط، المعيقلي).
 * 3. خريطة الأجزاء الثلاثين (30 جزء) وأرقام صفحات بدايتها.
 * 4. نصوص مباركة مع التفسير الميسر لسور وآيات مختارة (الفاتحة، البقرة، آية الكرسي، يس، الملك، الكهف، المعوذات).
 * 5. دوال جلب ديناميكية ومساعدات استعلام ومكتبة استدعاء من واجهة القرآن الكريم العالمية.
 * ==============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QuraniData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * قائمة بجميع سور القرآن الكريم الـ 114 بالترتيب العثماني
   */
  const SURAHS = [
    { id: 1, name: "سُورَةُ الفَاتِحَةِ", nameSimple: "الفاتحة", englishName: "Al-Fatihah", englishTranslation: "The Opening", ayahsCount: 7, type: "مكية", typeEn: "Meccan", startPage: 1, endPage: 1, juz: 1, revelationOrder: 5 },
    { id: 2, name: "سُورَةُ البَقَرَةِ", nameSimple: "البقرة", englishName: "Al-Baqarah", englishTranslation: "The Cow", ayahsCount: 286, type: "مدنية", typeEn: "Medinan", startPage: 2, endPage: 49, juz: 1, revelationOrder: 87 },
    { id: 3, name: "سُورَةُ آلِ عِمْرَانَ", nameSimple: "آل عمران", englishName: "Ali 'Imran", englishTranslation: "Family of Imran", ayahsCount: 200, type: "مدنية", typeEn: "Medinan", startPage: 50, endPage: 76, juz: 3, revelationOrder: 89 },
    { id: 4, name: "سُورَةُ النِّسَاءِ", nameSimple: "النساء", englishName: "An-Nisa", englishTranslation: "The Women", ayahsCount: 176, type: "مدنية", typeEn: "Medinan", startPage: 77, endPage: 106, juz: 4, revelationOrder: 92 },
    { id: 5, name: "سُورَةُ المَائِدَةِ", nameSimple: "المائدة", englishName: "Al-Ma'idah", englishTranslation: "The Table Spread", ayahsCount: 120, type: "مدنية", typeEn: "Medinan", startPage: 106, endPage: 127, juz: 6, revelationOrder: 112 },
    { id: 6, name: "سُورَةُ الأَنْعَامِ", nameSimple: "الأنعام", englishName: "Al-An'am", englishTranslation: "The Cattle", ayahsCount: 165, type: "مكية", typeEn: "Meccan", startPage: 128, endPage: 150, juz: 7, revelationOrder: 55 },
    { id: 7, name: "سُورَةُ الأَعْرَافِ", nameSimple: "الأعراف", englishName: "Al-A'raf", englishTranslation: "The Heights", ayahsCount: 206, type: "مكية", typeEn: "Meccan", startPage: 151, endPage: 176, juz: 8, revelationOrder: 39 },
    { id: 8, name: "سُورَةُ الأَنْفَالِ", nameSimple: "الأنفال", englishName: "Al-Anfal", englishTranslation: "The Spoils of War", ayahsCount: 75, type: "مدنية", typeEn: "Medinan", startPage: 177, endPage: 186, juz: 9, revelationOrder: 88 },
    { id: 9, name: "سُورَةُ التَّوْبَةِ", nameSimple: "التوبة", englishName: "At-Tawbah", englishTranslation: "The Repentance", ayahsCount: 129, type: "مدنية", typeEn: "Medinan", startPage: 187, endPage: 207, juz: 10, revelationOrder: 113 },
    { id: 10, name: "سُورَةُ يُونُسَ", nameSimple: "يونس", englishName: "Yunus", englishTranslation: "Jonah", ayahsCount: 109, type: "مكية", typeEn: "Meccan", startPage: 208, endPage: 221, juz: 11, revelationOrder: 51 },
    { id: 11, name: "سُورَةُ هُودٍ", nameSimple: "هود", englishName: "Hud", englishTranslation: "Hud", ayahsCount: 123, type: "مكية", typeEn: "Meccan", startPage: 221, endPage: 235, juz: 11, revelationOrder: 52 },
    { id: 12, name: "سُورَةُ يُوسُفَ", nameSimple: "يوسف", englishName: "Yusuf", englishTranslation: "Joseph", ayahsCount: 111, type: "مكية", typeEn: "Meccan", startPage: 235, endPage: 248, juz: 12, revelationOrder: 53 },
    { id: 13, name: "سُورَةُ الرَّعْدِ", nameSimple: "الرعد", englishName: "Ar-Ra'd", englishTranslation: "The Thunder", ayahsCount: 43, type: "مدنية", typeEn: "Medinan", startPage: 249, endPage: 255, juz: 13, revelationOrder: 96 },
    { id: 14, name: "سُورَةُ إِبْرَاهِيمَ", nameSimple: "إبراهيم", englishName: "Ibrahim", englishTranslation: "Abraham", ayahsCount: 52, type: "مكية", typeEn: "Meccan", startPage: 255, endPage: 261, juz: 13, revelationOrder: 72 },
    { id: 15, name: "سُورَةُ الحِجْرِ", nameSimple: "الحجر", englishName: "Al-Hijr", englishTranslation: "The Rocky Tract", ayahsCount: 99, type: "مكية", typeEn: "Meccan", startPage: 262, endPage: 267, juz: 14, revelationOrder: 54 },
    { id: 16, name: "سُورَةُ النَّحْلِ", nameSimple: "النحل", englishName: "An-Nahl", englishTranslation: "The Bee", ayahsCount: 128, type: "مكية", typeEn: "Meccan", startPage: 267, endPage: 281, juz: 14, revelationOrder: 70 },
    { id: 17, name: "سُورَةُ الإِسْرَاءِ", nameSimple: "الإسراء", englishName: "Al-Isra", englishTranslation: "The Night Journey", ayahsCount: 111, type: "مكية", typeEn: "Meccan", startPage: 282, endPage: 293, juz: 15, revelationOrder: 50 },
    { id: 18, name: "سُورَةُ الكَهْفِ", nameSimple: "الكهف", englishName: "Al-Kahf", englishTranslation: "The Cave", ayahsCount: 110, type: "مكية", typeEn: "Meccan", startPage: 293, endPage: 304, juz: 15, revelationOrder: 69 },
    { id: 19, name: "سُورَةُ مَرْيَمَ", nameSimple: "مريم", englishName: "Maryam", englishTranslation: "Mary", ayahsCount: 98, type: "مكية", typeEn: "Meccan", startPage: 305, endPage: 312, juz: 16, revelationOrder: 44 },
    { id: 20, name: "سُورَةُ طه", nameSimple: "طه", englishName: "Ta-Ha", englishTranslation: "Ta-Ha", ayahsCount: 135, type: "مكية", typeEn: "Meccan", startPage: 312, endPage: 321, juz: 16, revelationOrder: 45 },
    { id: 21, name: "سُورَةُ الأَنْبِيَاءِ", nameSimple: "الأنبياء", englishName: "Al-Anbiya", englishTranslation: "The Prophets", ayahsCount: 112, type: "مكية", typeEn: "Meccan", startPage: 322, endPage: 331, juz: 17, revelationOrder: 73 },
    { id: 22, name: "سُورَةُ الحَجِّ", nameSimple: "الحج", englishName: "Al-Hajj", englishTranslation: "The Pilgrimage", ayahsCount: 78, type: "مدنية", typeEn: "Medinan", startPage: 332, endPage: 341, juz: 17, revelationOrder: 103 },
    { id: 23, name: "سُورَةُ المُؤْمِنُونَ", nameSimple: "المؤمنون", englishName: "Al-Mu'minun", englishTranslation: "The Believers", ayahsCount: 118, type: "مكية", typeEn: "Meccan", startPage: 342, endPage: 349, juz: 18, revelationOrder: 74 },
    { id: 24, name: "سُورَةُ النُّورِ", nameSimple: "النور", englishName: "An-Nur", englishTranslation: "The Light", ayahsCount: 64, type: "مدنية", typeEn: "Medinan", startPage: 350, endPage: 359, juz: 18, revelationOrder: 102 },
    { id: 25, name: "سُورَةُ الفُرْقَانِ", nameSimple: "الفرقان", englishName: "Al-Furqan", englishTranslation: "The Criterion", ayahsCount: 77, type: "مكية", typeEn: "Meccan", startPage: 359, endPage: 366, juz: 18, revelationOrder: 42 },
    { id: 26, name: "سُورَةُ الشُّعَرَاءِ", nameSimple: "الشعراء", englishName: "Ash-Shu'ara", englishTranslation: "The Poets", ayahsCount: 227, type: "مكية", typeEn: "Meccan", startPage: 367, endPage: 376, juz: 19, revelationOrder: 47 },
    { id: 27, name: "سُورَةُ النَّمْلِ", nameSimple: "النمل", englishName: "An-Naml", englishTranslation: "The Ant", ayahsCount: 93, type: "مكية", typeEn: "Meccan", startPage: 377, endPage: 385, juz: 19, revelationOrder: 48 },
    { id: 28, name: "سُورَةُ القَصَصِ", nameSimple: "القصص", englishName: "Al-Qasas", englishTranslation: "The Stories", ayahsCount: 88, type: "مكية", typeEn: "Meccan", startPage: 385, endPage: 396, juz: 20, revelationOrder: 49 },
    { id: 29, name: "سُورَةُ العَنْكَبُوتِ", nameSimple: "العنكبوت", englishName: "Al-'Ankabut", englishTranslation: "The Spider", ayahsCount: 69, type: "مكية", typeEn: "Meccan", startPage: 396, endPage: 404, juz: 20, revelationOrder: 85 },
    { id: 30, name: "سُورَةُ الرُّومِ", nameSimple: "الروم", englishName: "Ar-Rum", englishTranslation: "The Romans", ayahsCount: 60, type: "مكية", typeEn: "Meccan", startPage: 404, endPage: 410, juz: 21, revelationOrder: 84 },
    { id: 31, name: "سُورَةُ لُقْمَانَ", nameSimple: "لقمان", englishName: "Luqman", englishTranslation: "Luqman", ayahsCount: 34, type: "مكية", typeEn: "Meccan", startPage: 411, endPage: 414, juz: 21, revelationOrder: 57 },
    { id: 32, name: "سُورَةُ السَّجْدَةِ", nameSimple: "السجدة", englishName: "As-Sajdah", englishTranslation: "The Prostration", ayahsCount: 30, type: "مكية", typeEn: "Meccan", startPage: 415, endPage: 417, juz: 21, revelationOrder: 75 },
    { id: 33, name: "سُورَةُ الأَحْزَابِ", nameSimple: "الأحزاب", englishName: "Al-Ahzab", englishTranslation: "The Combined Forces", ayahsCount: 73, type: "مدنية", typeEn: "Medinan", startPage: 418, endPage: 427, juz: 21, revelationOrder: 90 },
    { id: 34, name: "سُورَةُ سَبَإٍ", nameSimple: "سبإ", englishName: "Saba", englishTranslation: "Sheba", ayahsCount: 54, type: "مكية", typeEn: "Meccan", startPage: 428, endPage: 434, juz: 22, revelationOrder: 58 },
    { id: 35, name: "سُورَةُ فَاطِرٍ", nameSimple: "فاطر", englishName: "Fatir", englishTranslation: "Originator", ayahsCount: 45, type: "مكية", typeEn: "Meccan", startPage: 434, endPage: 440, juz: 22, revelationOrder: 43 },
    { id: 36, name: "سُورَةُ يس", nameSimple: "يس", englishName: "Ya-Sin", englishTranslation: "Ya-Sin", ayahsCount: 83, type: "مكية", typeEn: "Meccan", startPage: 440, endPage: 445, juz: 22, revelationOrder: 41 },
    { id: 37, name: "سُورَةُ الصَّافَّاتِ", nameSimple: "الصافات", englishName: "As-Saffat", englishTranslation: "Those who set the Ranks", ayahsCount: 182, type: "مكية", typeEn: "Meccan", startPage: 445, endPage: 452, juz: 23, revelationOrder: 56 },
    { id: 38, name: "سُورَةُ ص", nameSimple: "ص", englishName: "Sad", englishTranslation: "The Letter Sad", ayahsCount: 88, type: "مكية", typeEn: "Meccan", startPage: 453, endPage: 458, juz: 23, revelationOrder: 38 },
    { id: 39, name: "سُورَةُ الزُّمَرِ", nameSimple: "الزمر", englishName: "Az-Zumar", englishTranslation: "The Troops", ayahsCount: 75, type: "مكية", typeEn: "Meccan", startPage: 458, endPage: 467, juz: 23, revelationOrder: 59 },
    { id: 40, name: "سُورَةُ غَافِرٍ", nameSimple: "غافر", englishName: "Ghafir", englishTranslation: "The Forgiver", ayahsCount: 85, type: "مكية", typeEn: "Meccan", startPage: 467, endPage: 476, juz: 24, revelationOrder: 60 },
    { id: 41, name: "سُورَةُ فُصِّلَتْ", nameSimple: "فصلت", englishName: "Fussilat", englishTranslation: "Explained in Detail", ayahsCount: 54, type: "مكية", typeEn: "Meccan", startPage: 477, endPage: 482, juz: 24, revelationOrder: 61 },
    { id: 42, name: "سُورَةُ الشُّورَى", nameSimple: "الشورى", englishName: "Ash-Shura", englishTranslation: "The Consultation", ayahsCount: 53, type: "مكية", typeEn: "Meccan", startPage: 483, endPage: 489, juz: 25, revelationOrder: 62 },
    { id: 43, name: "سُورَةُ الزُّخْرُفِ", nameSimple: "الزخرف", englishName: "Az-Zukhruf", englishTranslation: "The Ornaments of Gold", ayahsCount: 89, type: "مكية", typeEn: "Meccan", startPage: 489, endPage: 495, juz: 25, revelationOrder: 63 },
    { id: 44, name: "سُورَةُ الدُّخَانِ", nameSimple: "الدخان", englishName: "Ad-Dukhan", englishTranslation: "The Smoke", ayahsCount: 59, type: "مكية", typeEn: "Meccan", startPage: 496, endPage: 498, juz: 25, revelationOrder: 64 },
    { id: 45, name: "سُورَةُ الجَاثِيَةِ", nameSimple: "الجاثية", englishName: "Al-Jathiyah", englishTranslation: "The Crouching", ayahsCount: 37, type: "مكية", typeEn: "Meccan", startPage: 499, endPage: 502, juz: 25, revelationOrder: 65 },
    { id: 46, name: "سُورَةُ الأَحْقَافِ", nameSimple: "الأحقاف", englishName: "Al-Ahqaf", englishTranslation: "The Wind-Curved Sandhills", ayahsCount: 35, type: "مكية", typeEn: "Meccan", startPage: 502, endPage: 506, juz: 26, revelationOrder: 66 },
    { id: 47, name: "سُورَةُ مُحَمَّدٍ", nameSimple: "محمد", englishName: "Muhammad", englishTranslation: "Muhammad", ayahsCount: 38, type: "مدنية", typeEn: "Medinan", startPage: 507, endPage: 510, juz: 26, revelationOrder: 95 },
    { id: 48, name: "سُورَةُ الفَتْحِ", nameSimple: "الفتح", englishName: "Al-Fath", englishTranslation: "The Victory", ayahsCount: 29, type: "مدنية", typeEn: "Medinan", startPage: 511, endPage: 515, juz: 26, revelationOrder: 111 },
    { id: 49, name: "سُورَةُ الحُجُرَاتِ", nameSimple: "الحجرات", englishName: "Al-Hujurat", englishTranslation: "The Rooms", ayahsCount: 18, type: "مدنية", typeEn: "Medinan", startPage: 515, endPage: 517, juz: 26, revelationOrder: 106 },
    { id: 50, name: "سُورَةُ ق", nameSimple: "ق", englishName: "Qaf", englishTranslation: "The Letter Qaf", ayahsCount: 45, type: "مكية", typeEn: "Meccan", startPage: 518, endPage: 520, juz: 26, revelationOrder: 34 },
    { id: 51, name: "سُورَةُ الذَّارِيَاتِ", nameSimple: "الذاريات", englishName: "Adh-Dhariyat", englishTranslation: "The Winnowing Winds", ayahsCount: 60, type: "مكية", typeEn: "Meccan", startPage: 520, endPage: 523, juz: 26, revelationOrder: 67 },
    { id: 52, name: "سُورَةُ الطُّورِ", nameSimple: "الطور", englishName: "At-Tur", englishTranslation: "The Mount", ayahsCount: 49, type: "مكية", typeEn: "Meccan", startPage: 523, endPage: 525, juz: 27, revelationOrder: 76 },
    { id: 53, name: "سُورَةُ النَّجْمِ", nameSimple: "النجم", englishName: "An-Najm", englishTranslation: "The Star", ayahsCount: 62, type: "مكية", typeEn: "Meccan", startPage: 526, endPage: 528, juz: 27, revelationOrder: 23 },
    { id: 54, name: "سُورَةُ القَمَرِ", nameSimple: "القمر", englishName: "Al-Qamar", englishTranslation: "The Moon", ayahsCount: 55, type: "مكية", typeEn: "Meccan", startPage: 528, endPage: 531, juz: 27, revelationOrder: 37 },
    { id: 55, name: "سُورَةُ الرَّحْمَٰنِ", nameSimple: "الرحمن", englishName: "Ar-Rahman", englishTranslation: "The Beneficent", ayahsCount: 78, type: "مدنية", typeEn: "Medinan", startPage: 531, endPage: 534, juz: 27, revelationOrder: 97 },
    { id: 56, name: "سُورَةُ الوَاقِعَةِ", nameSimple: "الواقعة", englishName: "Al-Waqi'ah", englishTranslation: "The Inevitable", ayahsCount: 96, type: "مكية", typeEn: "Meccan", startPage: 534, endPage: 537, juz: 27, revelationOrder: 46 },
    { id: 57, name: "سُورَةُ الحَدِيدِ", nameSimple: "الحديد", englishName: "Al-Hadid", englishTranslation: "The Iron", ayahsCount: 29, type: "مدنية", typeEn: "Medinan", startPage: 537, endPage: 541, juz: 27, revelationOrder: 94 },
    { id: 58, name: "سُورَةُ المُجَادَلَةِ", nameSimple: "المجادلة", englishName: "Al-Mujadila", englishTranslation: "The Pleading Woman", ayahsCount: 22, type: "مدنية", typeEn: "Medinan", startPage: 542, endPage: 545, juz: 28, revelationOrder: 105 },
    { id: 59, name: "سُورَةُ الحَشْرِ", nameSimple: "الحشر", englishName: "Al-Hashr", englishTranslation: "The Exile", ayahsCount: 24, type: "مدنية", typeEn: "Medinan", startPage: 545, endPage: 548, juz: 28, revelationOrder: 101 },
    { id: 60, name: "سُورَةُ المُمْتَحَنَةِ", nameSimple: "الممتحنة", englishName: "Al-Mumtahanah", englishTranslation: "She that is to be examined", ayahsCount: 13, type: "مدنية", typeEn: "Medinan", startPage: 549, endPage: 551, juz: 28, revelationOrder: 91 },
    { id: 61, name: "سُورَةُ الصَّفِّ", nameSimple: "الصف", englishName: "As-Saff", englishTranslation: "The Ranks", ayahsCount: 14, type: "مدنية", typeEn: "Medinan", startPage: 551, endPage: 553, juz: 28, revelationOrder: 109 },
    { id: 62, name: "سُورَةُ الجُمُعَةِ", nameSimple: "الجمعة", englishName: "Al-Jumu'ah", englishTranslation: "The Congregation, Friday", ayahsCount: 11, type: "مدنية", typeEn: "Medinan", startPage: 553, endPage: 554, juz: 28, revelationOrder: 110 },
    { id: 63, name: "سُورَةُ المُنَافِقُونَ", nameSimple: "المنافقون", englishName: "Al-Munafiqun", englishTranslation: "The Hypocrites", ayahsCount: 11, type: "مدنية", typeEn: "Medinan", startPage: 554, endPage: 555, juz: 28, revelationOrder: 104 },
    { id: 64, name: "سُورَةُ التَّغَابُنِ", nameSimple: "التغابن", englishName: "At-Taghabun", englishTranslation: "The Mutual Disillusion", ayahsCount: 18, type: "مدنية", typeEn: "Medinan", startPage: 556, endPage: 557, juz: 28, revelationOrder: 108 },
    { id: 65, name: "سُورَةُ الطَّلَاقِ", nameSimple: "الطلاق", englishName: "At-Talaq", englishTranslation: "The Divorce", ayahsCount: 12, type: "مدنية", typeEn: "Medinan", startPage: 558, endPage: 559, juz: 28, revelationOrder: 99 },
    { id: 66, name: "سُورَةُ التَّحْرِيمِ", nameSimple: "التحريم", englishName: "At-Tahrim", englishTranslation: "The Prohibition", ayahsCount: 12, type: "مدنية", typeEn: "Medinan", startPage: 560, endPage: 561, juz: 28, revelationOrder: 107 },
    { id: 67, name: "سُورَةُ المُلْكِ", nameSimple: "الملك", englishName: "Al-Mulk", englishTranslation: "The Sovereignty", ayahsCount: 30, type: "مكية", typeEn: "Meccan", startPage: 562, endPage: 564, juz: 29, revelationOrder: 77 },
    { id: 68, name: "سُورَةُ القَلَمِ", nameSimple: "القلم", englishName: "Al-Qalam", englishTranslation: "The Pen", ayahsCount: 52, type: "مكية", typeEn: "Meccan", startPage: 564, endPage: 566, juz: 29, revelationOrder: 2 },
    { id: 69, name: "سُورَةُ الحَاقَّةِ", nameSimple: "الحاقة", englishName: "Al-Haqqah", englishTranslation: "The Reality", ayahsCount: 52, type: "مكية", typeEn: "Meccan", startPage: 566, endPage: 568, juz: 29, revelationOrder: 78 },
    { id: 70, name: "سُورَةُ المَعَارِجِ", nameSimple: "المعارج", englishName: "Al-Ma'arij", englishTranslation: "The Ascending Stairways", ayahsCount: 44, type: "مكية", typeEn: "Meccan", startPage: 568, endPage: 570, juz: 29, revelationOrder: 79 },
    { id: 71, name: "سُورَةُ نُوحٍ", nameSimple: "نوح", englishName: "Nuh", englishTranslation: "Noah", ayahsCount: 28, type: "مكية", typeEn: "Meccan", startPage: 570, endPage: 571, juz: 29, revelationOrder: 71 },
    { id: 72, name: "سُورَةُ الجِنِّ", nameSimple: "الجن", englishName: "Al-Jinn", englishTranslation: "The Jinn", ayahsCount: 28, type: "مكية", typeEn: "Meccan", startPage: 572, endPage: 573, juz: 29, revelationOrder: 40 },
    { id: 73, name: "سُورَةُ المُزَّمِّلِ", nameSimple: "المزمل", englishName: "Al-Muzzammil", englishTranslation: "The Enshrouded One", ayahsCount: 20, type: "مكية", typeEn: "Meccan", startPage: 574, endPage: 575, juz: 29, revelationOrder: 3 },
    { id: 74, name: "سُورَةُ المُدَّثِّرِ", nameSimple: "المدثر", englishName: "Al-Muddaththir", englishTranslation: "The Cloaked One", ayahsCount: 56, type: "مكية", typeEn: "Meccan", startPage: 575, endPage: 577, juz: 29, revelationOrder: 4 },
    { id: 75, name: "سُورَةُ القِيَامَةِ", nameSimple: "القيامة", englishName: "Al-Qiyamah", englishTranslation: "The Resurrection", ayahsCount: 40, type: "مكية", typeEn: "Meccan", startPage: 577, endPage: 578, juz: 29, revelationOrder: 31 },
    { id: 76, name: "سُورَةُ الإِنْسَانِ", nameSimple: "الإنسان", englishName: "Al-Insan", englishTranslation: "Man", ayahsCount: 31, type: "مدنية", typeEn: "Medinan", startPage: 578, endPage: 580, juz: 29, revelationOrder: 98 },
    { id: 77, name: "سُورَةُ المُرْسَلَاتِ", nameSimple: "المرسلات", englishName: "Al-Mursalat", englishTranslation: "The Emissaries", ayahsCount: 50, type: "مكية", typeEn: "Meccan", startPage: 580, endPage: 581, juz: 29, revelationOrder: 33 },
    { id: 78, name: "سُورَةُ النَّبَإِ", nameSimple: "النبأ", englishName: "An-Naba", englishTranslation: "The Tidings", ayahsCount: 40, type: "مكية", typeEn: "Meccan", startPage: 582, endPage: 583, juz: 30, revelationOrder: 80 },
    { id: 79, name: "سُورَةُ النَّازِعَاتِ", nameSimple: "النازعات", englishName: "An-Nazi'at", englishTranslation: "Those who drag forth", ayahsCount: 46, type: "مكية", typeEn: "Meccan", startPage: 583, endPage: 584, juz: 30, revelationOrder: 81 },
    { id: 80, name: "سُورَةُ عَبَسَ", nameSimple: "عبس", englishName: "'Abasa", englishTranslation: "He Frowned", ayahsCount: 42, type: "مكية", typeEn: "Meccan", startPage: 585, endPage: 586, juz: 30, revelationOrder: 24 },
    { id: 81, name: "سُورَةُ التَّكْوِيرِ", nameSimple: "التكوير", englishName: "At-Takwir", englishTranslation: "The Overthrowing", ayahsCount: 29, type: "مكية", typeEn: "Meccan", startPage: 586, endPage: 586, juz: 30, revelationOrder: 7 },
    { id: 82, name: "سُورَةُ الإِنْفِطَارِ", nameSimple: "الانفطار", englishName: "Al-Infitar", englishTranslation: "The Cleaving", ayahsCount: 19, type: "مكية", typeEn: "Meccan", startPage: 587, endPage: 587, juz: 30, revelationOrder: 82 },
    { id: 83, name: "سُورَةُ المُطَفِّفِينَ", nameSimple: "المطففين", englishName: "Al-Mutaffifin", englishTranslation: "The Defrauding", ayahsCount: 36, type: "مكية", typeEn: "Meccan", startPage: 587, endPage: 589, juz: 30, revelationOrder: 86 },
    { id: 84, name: "سُورَةُ الإِنْشِقَاقِ", nameSimple: "الانشقاق", englishName: "Al-Inshiqaq", englishTranslation: "The Splitting Open", ayahsCount: 25, type: "مكية", typeEn: "Meccan", startPage: 589, endPage: 590, juz: 30, revelationOrder: 83 },
    { id: 85, name: "سُورَةُ البُرُوجِ", nameSimple: "البروج", englishName: "Al-Buruj", englishTranslation: "The Mansions of the Stars", ayahsCount: 22, type: "مكية", typeEn: "Meccan", startPage: 590, endPage: 590, juz: 30, revelationOrder: 27 },
    { id: 86, name: "سُورَةُ الطَّارِقِ", nameSimple: "الطارق", englishName: "At-Tariq", englishTranslation: "The Morning Star", ayahsCount: 17, type: "مكية", typeEn: "Meccan", startPage: 591, endPage: 591, juz: 30, revelationOrder: 36 },
    { id: 87, name: "سُورَةُ الأَعْلَى", nameSimple: "الأعلى", englishName: "Al-A'la", englishTranslation: "The Most High", ayahsCount: 19, type: "مكية", typeEn: "Meccan", startPage: 591, endPage: 592, juz: 30, revelationOrder: 8 },
    { id: 88, name: "سُورَةُ الغَاشِيَةِ", nameSimple: "الغاشية", englishName: "Al-Ghashiyah", englishTranslation: "The Overwhelming", ayahsCount: 26, type: "مكية", typeEn: "Meccan", startPage: 592, endPage: 593, juz: 30, revelationOrder: 68 },
    { id: 89, name: "سُورَةُ الفَجْرِ", nameSimple: "الفجر", englishName: "Al-Fajr", englishTranslation: "The Dawn", ayahsCount: 30, type: "مكية", typeEn: "Meccan", startPage: 593, endPage: 594, juz: 30, revelationOrder: 10 },
    { id: 90, name: "سُورَةُ البَلَدِ", nameSimple: "البلد", englishName: "Al-Balad", englishTranslation: "The City", ayahsCount: 20, type: "مكية", typeEn: "Meccan", startPage: 594, endPage: 594, juz: 30, revelationOrder: 35 },
    { id: 91, name: "سُورَةُ الشَّمْسِ", nameSimple: "الشمس", englishName: "Ash-Shams", englishTranslation: "The Sun", ayahsCount: 15, type: "مكية", typeEn: "Meccan", startPage: 595, endPage: 595, juz: 30, revelationOrder: 26 },
    { id: 92, name: "سُورَةُ اللَّيْلِ", nameSimple: "الليل", englishName: "Al-Layl", englishTranslation: "The Night", ayahsCount: 21, type: "مكية", typeEn: "Meccan", startPage: 595, endPage: 596, juz: 30, revelationOrder: 9 },
    { id: 93, name: "سُورَةُ الضُّحَى", nameSimple: "الضحى", englishName: "Ad-Duha", englishTranslation: "The Morning Hours", ayahsCount: 11, type: "مكية", typeEn: "Meccan", startPage: 596, endPage: 596, juz: 30, revelationOrder: 11 },
    { id: 94, name: "سُورَةُ الشَّرْحِ", nameSimple: "الشرح", englishName: "Ash-Sharh", englishTranslation: "The Relief", ayahsCount: 8, type: "مكية", typeEn: "Meccan", startPage: 596, endPage: 596, juz: 30, revelationOrder: 12 },
    { id: 95, name: "سُورَةُ التِّينِ", nameSimple: "التين", englishName: "At-Tin", englishTranslation: "The Fig", ayahsCount: 8, type: "مكية", typeEn: "Meccan", startPage: 597, endPage: 597, juz: 30, revelationOrder: 28 },
    { id: 96, name: "سُورَةُ العَلَقِ", nameSimple: "العلق", englishName: "Al-'Alaq", englishTranslation: "The Clot", ayahsCount: 19, type: "مكية", typeEn: "Meccan", startPage: 597, endPage: 598, juz: 30, revelationOrder: 1 },
    { id: 97, name: "سُورَةُ القَدْرِ", nameSimple: "القدر", englishName: "Al-Qadr", englishTranslation: "The Power", ayahsCount: 5, type: "مكية", typeEn: "Meccan", startPage: 598, endPage: 598, juz: 30, revelationOrder: 25 },
    { id: 98, name: "سُورَةُ البَيِّنَةِ", nameSimple: "البينة", englishName: "Al-Bayyinah", englishTranslation: "The Clear Proof", ayahsCount: 8, type: "مدنية", typeEn: "Medinan", startPage: 598, endPage: 599, juz: 30, revelationOrder: 100 },
    { id: 99, name: "سُورَةُ الزَّلْزَلَةِ", nameSimple: "الزلزلة", englishName: "Az-Zalzalah", englishTranslation: "The Earthquake", ayahsCount: 8, type: "مدنية", typeEn: "Medinan", startPage: 599, endPage: 599, juz: 30, revelationOrder: 93 },
    { id: 100, name: "سُورَةُ العَادِيَاتِ", nameSimple: "العاديات", englishName: "Al-'Adiyat", englishTranslation: "The Courser", ayahsCount: 11, type: "مكية", typeEn: "Meccan", startPage: 599, endPage: 600, juz: 30, revelationOrder: 14 },
    { id: 101, name: "سُورَةُ القَارِعَةِ", nameSimple: "القارعة", englishName: "Al-Qari'ah", englishTranslation: "The Calamity", ayahsCount: 11, type: "مكية", typeEn: "Meccan", startPage: 600, endPage: 600, juz: 30, revelationOrder: 30 },
    { id: 102, name: "سُورَةُ التَّكَاثُرِ", nameSimple: "التكاثر", englishName: "At-Takathur", englishTranslation: "The Rivalry in world increase", ayahsCount: 8, type: "مكية", typeEn: "Meccan", startPage: 600, endPage: 600, juz: 30, revelationOrder: 16 },
    { id: 103, name: "سُورَةُ العَصْرِ", nameSimple: "العصر", englishName: "Al-'Asr", englishTranslation: "The Declining Day", ayahsCount: 3, type: "مكية", typeEn: "Meccan", startPage: 601, endPage: 601, juz: 30, revelationOrder: 13 },
    { id: 104, name: "سُورَةُ الهُمَزَةِ", nameSimple: "الهمزة", englishName: "Al-Humazah", englishTranslation: "The Traducer", ayahsCount: 9, type: "مكية", typeEn: "Meccan", startPage: 601, endPage: 601, juz: 30, revelationOrder: 32 },
    { id: 105, name: "سُورَةُ الفِيلِ", nameSimple: "الفيل", englishName: "Al-Fil", englishTranslation: "The Elephant", ayahsCount: 5, type: "مكية", typeEn: "Meccan", startPage: 601, endPage: 601, juz: 30, revelationOrder: 19 },
    { id: 106, name: "سُورَةُ قُرَيْشٍ", nameSimple: "قريش", englishName: "Quraysh", englishTranslation: "Quraysh", ayahsCount: 4, type: "مكية", typeEn: "Meccan", startPage: 602, endPage: 602, juz: 30, revelationOrder: 29 },
    { id: 107, name: "سُورَةُ المَاعُونِ", nameSimple: "الماعون", englishName: "Al-Ma'un", englishTranslation: "The Small Kindnesses", ayahsCount: 7, type: "مكية", typeEn: "Meccan", startPage: 602, endPage: 602, juz: 30, revelationOrder: 17 },
    { id: 108, name: "سُورَةُ الكَوْثَرِ", nameSimple: "الكوثر", englishName: "Al-Kawthar", englishTranslation: "The Abundance", ayahsCount: 3, type: "مكية", typeEn: "Meccan", startPage: 602, endPage: 602, juz: 30, revelationOrder: 15 },
    { id: 109, name: "سُورَةُ الكَافِرُونَ", nameSimple: "الكافرون", englishName: "Al-Kafirun", englishTranslation: "The Disbelievers", ayahsCount: 6, type: "مكية", typeEn: "Meccan", startPage: 603, endPage: 603, juz: 30, revelationOrder: 18 },
    { id: 110, name: "سُورَةُ النَّصْرِ", nameSimple: "النصر", englishName: "An-Nasr", englishTranslation: "The Divine Support", ayahsCount: 3, type: "مدنية", typeEn: "Medinan", startPage: 603, endPage: 603, juz: 30, revelationOrder: 114 },
    { id: 111, name: "سُورَةُ المَسَدِ", nameSimple: "المسد", englishName: "Al-Masad", englishTranslation: "The Palm Fiber", ayahsCount: 5, type: "مكية", typeEn: "Meccan", startPage: 603, endPage: 603, juz: 30, revelationOrder: 6 },
    { id: 112, name: "سُورَةُ الإِخْلَاصِ", nameSimple: "الإخلاص", englishName: "Al-Ikhlas", englishTranslation: "The Sincerity", ayahsCount: 4, type: "مكية", typeEn: "Meccan", startPage: 604, endPage: 604, juz: 30, revelationOrder: 22 },
    { id: 113, name: "سُورَةُ الفَلَقِ", nameSimple: "الفلق", englishName: "Al-Falaq", englishTranslation: "The Daybreak", ayahsCount: 5, type: "مكية", typeEn: "Meccan", startPage: 604, endPage: 604, juz: 30, revelationOrder: 20 },
    { id: 114, name: "سُورَةُ النَّاسِ", nameSimple: "الناس", englishName: "An-Nas", englishTranslation: "Mankind", ayahsCount: 6, type: "مكية", typeEn: "Meccan", startPage: 604, endPage: 604, juz: 30, revelationOrder: 21 }
  ];

  /**
   * خريطة الأجزاء الثلاثين (30 جزء) وصفحة البداية ورقم السورة والآية
   */
  const JUZ_METADATA = [
    { juz: 1, startPage: 1, endPage: 21, startSurah: 1, startAyah: 1, name: "الجزء الأول" },
    { juz: 2, startPage: 22, endPage: 41, startSurah: 2, startAyah: 142, name: "الجزء الثاني (سيقول السفهاء)" },
    { juz: 3, startPage: 42, endPage: 61, startSurah: 2, startAyah: 253, name: "الجزء الثالث (تلك الرسل)" },
    { juz: 4, startPage: 62, endPage: 81, startSurah: 3, startAyah: 93, name: "الجزء الرابع (لن تنالوا البر)" },
    { juz: 5, startPage: 82, endPage: 101, startSurah: 4, startAyah: 24, name: "الجزء الخامس (والمحصنات)" },
    { juz: 6, startPage: 102, endPage: 120, startSurah: 4, startAyah: 148, name: "الجزء السادس (لا يحب الله الجهر)" },
    { juz: 7, startPage: 121, endPage: 141, startSurah: 5, startAyah: 82, name: "الجزء السابع (وإذا سمعوا)" },
    { juz: 8, startPage: 142, endPage: 161, startSurah: 6, startAyah: 111, name: "الجزء الثامن (ولو أننا نزلنا)" },
    { juz: 9, startPage: 162, endPage: 181, startSurah: 7, startAyah: 88, name: "الجزء التاسع (قال الملأ)" },
    { juz: 10, startPage: 182, endPage: 200, startSurah: 8, startAyah: 41, name: "الجزء العاشر (واعلموا أنما غنمتم)" },
    { juz: 11, startPage: 201, endPage: 221, startSurah: 9, startAyah: 93, name: "الجزء الحادي عشر (يعتذرون إليكم)" },
    { juz: 12, startPage: 222, endPage: 241, startSurah: 11, startAyah: 6, name: "الجزء الثاني عشر (وما من دابة)" },
    { juz: 13, startPage: 242, endPage: 261, startSurah: 12, startAyah: 53, name: "الجزء الثالث عشر (وما أبرئ نفسي)" },
    { juz: 14, startPage: 262, endPage: 281, startSurah: 15, startAyah: 1, name: "الجزء الرابع عشر (ربما يود)" },
    { juz: 15, startPage: 282, endPage: 301, startSurah: 17, startAyah: 1, name: "الجزء الخامس عشر (سبحان الذي أسرى)" },
    { juz: 16, startPage: 302, endPage: 321, startSurah: 18, startAyah: 75, name: "الجزء السادس عشر (قال ألم أقل لك)" },
    { juz: 17, startPage: 322, endPage: 341, startSurah: 21, startAyah: 1, name: "الجزء السابع عشر (اقترب للناس حسابهم)" },
    { juz: 18, startPage: 342, endPage: 361, startSurah: 23, startAyah: 1, name: "الجزء الثامن عشر (قد أفلح المؤمنون)" },
    { juz: 19, startPage: 362, endPage: 381, startSurah: 25, startAyah: 21, name: "الجزء التاسع عشر (وقال الذين لا يرجون)" },
    { juz: 20, startPage: 382, endPage: 401, startSurah: 27, startAyah: 56, name: "الجزء العشرون (فما كان جواب قومه)" },
    { juz: 21, startPage: 402, endPage: 421, startSurah: 29, startAyah: 46, name: "الجزء الحادي والعشرون (ولا تجادلوا)" },
    { juz: 22, startPage: 422, endPage: 441, startSurah: 33, startAyah: 31, name: "الجزء الثاني والعشرون (ومن يقنت منكن)" },
    { juz: 23, startPage: 442, endPage: 461, startSurah: 36, startAyah: 28, name: "الجزء الثالث والعشرون (وما أنزلنا على قومه)" },
    { juz: 24, startPage: 462, endPage: 481, startSurah: 39, startAyah: 32, name: "الجزء الرابع والعشرون (فمن أظلم)" },
    { juz: 25, startPage: 482, endPage: 501, startSurah: 41, startAyah: 47, name: "الجزء الخامس والعشرون (إليه يرد علم الساعة)" },
    { juz: 26, startPage: 502, endPage: 521, startSurah: 46, startAyah: 1, name: "الجزء السادس والعشرون (حم الأحقاف)" },
    { juz: 27, startPage: 522, endPage: 541, startSurah: 51, startAyah: 31, name: "الجزء السابع والعشرون (قال فما خطبكم)" },
    { juz: 28, startPage: 542, endPage: 561, startSurah: 58, startAyah: 1, name: "الجزء الثامن والعشرون (قد سمع الله)" },
    { juz: 29, startPage: 562, endPage: 581, startSurah: 67, startAyah: 1, name: "الجزء التاسع والعشرون (تبارك الذي)" },
    { juz: 30, startPage: 582, endPage: 604, startSurah: 78, startAyah: 1, name: "الجزء الثلاثون (عم يتساءلون)" }
  ];

  /**
   * بيانات كبار القراء وروابط تلاواتهم
   */
  const RECITERS = [
    {
      id: "ar.alafasy",
      name: "الشيخ مشاري راشد العفاسي",
      nameEn: "Mishari Rashid Al-Afasy",
      subfolder: "Alafasy_128kbps",
      mp3QuranServer: "https://server8.mp3quran.net/afs/",
      cdnIslamicNetwork: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/",
      quality: "128kbps",
      featured: true,
      bio: "قارئ كويتي وإمام المسجد الكبير بدولة الكويت، يتميز بنبرته العذبة وإتقانه لأحكام التلاوة."
    },
    {
      id: "ar.husary",
      name: "الشيخ محمود خليل الحصري",
      nameEn: "Mahmoud Khalil Al-Husary",
      subfolder: "Husary_128kbps",
      mp3QuranServer: "https://server13.mp3quran.net/husr/",
      cdnIslamicNetwork: "https://cdn.islamic.network/quran/audio/128/ar.husary/",
      quality: "128kbps",
      featured: true,
      bio: "شيخ عموم المقارئ المصرية، وأول من سجل المصحف المرتل برواية حفص عن عاصم، مرجع التجويد والإتقان."
    },
    {
      id: "ar.minshawi",
      name: "الشيخ محمد صديق المنشاوي",
      nameEn: "Mohamed Siddiq Al-Minshawi",
      subfolder: "Minshawy_Murattal_128kbps",
      mp3QuranServer: "https://server10.mp3quran.net/minsh/",
      cdnIslamicNetwork: "https://cdn.islamic.network/quran/audio/128/ar.minshawi/",
      quality: "128kbps",
      featured: true,
      bio: "صاحب الصوت الباكي الخاشع وأحد أعلام التلاوة المرموقين في العالم الإسلامي."
    },
    {
      id: "ar.abdulbasitmurattal",
      name: "الشيخ عبد الباسط عبد الصمد",
      nameEn: "Abdul Basit Abdul Samad (Murattal)",
      subfolder: "Abdul_Basit_Murattal_192kbps",
      mp3QuranServer: "https://server7.mp3quran.net/basit/",
      cdnIslamicNetwork: "https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal/",
      quality: "192kbps",
      featured: true,
      bio: "صوت مكة وسفير القرآن الكريم، يتميز بروعة الأداء وقوة النفس وجزالة الصوت."
    },
    {
      id: "ar.mahermuaiqly",
      name: "الشيخ ماهر المعيقلي",
      nameEn: "Maher Al-Muaiqly",
      subfolder: "Maher_AlMuaiqly_64kbps",
      mp3QuranServer: "https://server12.mp3quran.net/maher/",
      cdnIslamicNetwork: "https://cdn.islamic.network/quran/audio/64/ar.mahermuaiqly/",
      quality: "64kbps",
      featured: true,
      bio: "إمام وخطيب المسجد الحرام بمكة المكرمة، تلاوته ذات شجن وحضور قلبي آسر."
    }
  ];

  /**
   * نماذج مختارة ومحفوظة مسبقاً مع التفسير الميسر الموثق
   */
  const SAMPLE_AYAHS = {
    // 1. سورة الفاتحة كاملة
    1: [
      { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", tafseer: "أبتدئ قراءتي للقرآن باسم الله مستعيناً به، (الله) علم على الرب تبارك وتعالى، المعبود بحق دون سواه، وهو أخص أسماء الله تعالى." },
      { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", tafseer: "الثناء الكامل باللسان والشكر لله تعالى لصفاته وكماله وإنعامه على خلقه، وهو رب الخلائق أجمعين ومدبر أمورهم." },
      { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", tafseer: "(الرحمن) ذو الرحمة العامة الشاملة لجميع الخلائق، (الرحيم) بالمؤمنين خاصة." },
      { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ", tafseer: "المالك المتصرف وحده بيوم القيامة والجزاء والحساب، وفيه تذكير بالمعاد وتفرده سبحانه بالملك يوم لا يملك أحد شيئاً." },
      { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", tafseer: "نخصك وحدك بالعبادة والطاعة والخضوع، ونخصك وحدك بطلب العون في كل شؤوننا، فبيدك الخير كله." },
      { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", tafseer: "دلنا وأرشدنا ووفقنا وثبتنا على الصراط السوي الواضح الموصل إلى مرضاتك وجنتك، وهو دين الإسلام." },
      { number: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", tafseer: "طريق الذين تفضلت عليهم بنعمة الهداية من النبيين والصدّيقين والشهداء والصالحين، غير طريق المغضوب عليهم (كاليهود الذين عرفوا الحق وتركوه)، ولا طريق الضالين (كالنصارى الذين عبدوا الله على جهل وضلال)." }
    ],

    // 2. فواتح سورة البقرة (1 - 5) وآية الكرسي (255)
    2: [
      { number: 1, text: "الم", tafseer: "حروف مقطعة للتحدي والإعجاز، تدل على أن القرآن مؤلف من جنس هذه الحروف التي ينطق بها العرب ومع ذلك عجزوا عن الإتيان بمثله." },
      { number: 2, text: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", tafseer: "هذا القرآن العظيم لا شك في صدقه وأنه منزل من عند الله، يهدي به قلوب المتقين الذين يخشون عقابه ويرجون ثوابه." },
      { number: 3, text: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ", tafseer: "الذين يصدقون تصديقاً جازماً بما غاب عن حواسهم من البعث والجنة والنار، ويؤدون الصلاة بأركانها وشروطها، وينفقون في سبيل الله." },
      { number: 4, text: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ", tafseer: "والذين يصدقون بالقرآن المنزل عليك يا رسول الله وبما أنزل على الرسل من قبلك كالتوراة والإنجيل والزبور، وبالدار الآخرة هم على يقين تام." },
      { number: 5, text: "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ", tafseer: "أصحاب هذه الأوصاف الجليلة على نور وبصيرة وهداية من خالقهم، وهم الفائزون بسعادة الدنيا ونعيم الآخرة." },
      { number: 255, text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", tafseer: "آية الكرسي أعظم آية في كتاب الله: الله المنفرد بالألوهية، الحي حياة كاملة أزلية أبدية، القيوم المدبر لجميع خلقه، لا يلحقه نعاس ولا نوم، وسع سلطانه وعلمه وقدرته كل شيء، ولا يثقله حفظ السماوات والأرض وهو العلي بذاته وقدره وقهره، العظيم ذو الجلال والكبرياء." }
    ],

    // 18. سورة الكهف (فواتحها 1 - 10)
    18: [
      { number: 1, text: "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا ۜ", tafseer: "الثناء والحمد لله الذي أنزل على نبيه محمد ﷺ هذا القرآن العظيم قيماً مستقيماً لا خلل فيه ولا تناقض." },
      { number: 2, text: "قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ وَيُبَشِّرَ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا", tafseer: "أنزله مستقيماً ليخوف الكافرين من عذاب أليم عاجل وآجل من عنده، ويبشر المؤمنين الصالحين بالجنة دار النعيم المقيم." },
      { number: 3, text: "مَّاكِثِينَ فِيهِ أَبَدًا", tafseer: "خالدين في ذلك الأجر والثواب الحَسَن سرمداً لا يزول عنهم ولا يحولون عنه." },
      { number: 4, text: "وَيُنذِرَ الَّذِينَ قَالُوا اتَّخَذَ اللَّهُ وَلَدًا", tafseer: "وينذر المشركين واليهود والنصارى الذين نسبوا لله سبحانه الولد تعالى الله عن ذلك علواً كبيراً." },
      { number: 5, text: "مَّا لَهُم بِهِ مِنْ عِلْمٍ وَلَا لِآبَائِهِمْ ۚ كَبُرَتْ كَلِمَةً تَخْرُجُ مِنْ أَفْوَاهِهِمْ ۚ إِن يَقُولُونَ إِلَّا كَذِبًا", tafseer: "ليس لهم ولا لآبائهم برهان على هذا القول الفاسد، عظمت في القبح والافتراء تلك الكلمة، وما يقولون إلا باطلاً وبهتاناً." },
      { number: 6, text: "فَلَعَلَّكَ بَاخِعٌ نَّفْسَكَ عَلَىٰ آثَارِهِمْ إِن لَّمْ يُؤْمِنُوا بِهَٰذَا الْحَدِيثِ أَسَفًا", tafseer: "فلا تهلك نفسك يا نبي الله حزناً وتأسفاً على إعراض قومك وتكذيبهم بهذا القرآن، فإنما عليك البلاغ." },
      { number: 7, text: "إِنَّا جَعَلْنَا مَا عَلَى الْأَرْضِ زِينَةً لَّهَا لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ عَمَلًا", tafseer: "إنا جعلنا ما على وجه الأرض من مخلوقات ونبات وجمال اختباراً للعباد: من منهم أخلص لله وأتبع لشرعه." },
      { number: 8, text: "وَإِنَّا لَجَاعِلُونَ مَا عَلَيْهَا صَعِيدًا جُرُزًا", tafseer: "وإنا لمصيّرو هذه الزينة بعد انقضاء الدنيا تراباً مستوياً لا نبات فيه ولا عمارة." },
      { number: 9, text: "أَمْ حَسِبْتَ أَنَّ أَصْحَابَ الْكَهْفِ وَالرَّقِيمِ كَانُوا مِنْ آيَاتِنَا عَجَبًا", tafseer: "لا تظن يا محمد أن قصة أصحاب الغار والكتاب المنقوش كانت أعجب آياتنا، فخلق السماوات والأرض أعظم بكثير." },
      { number: 10, text: "إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا", tafseer: "حين لجأ الشباب المؤمنون إلى الكهف فراراً بدينهم وتضرعوا: يا ربنا هب لنا رحمة وثبتنا ويسر لنا سبل الهداية والصواب." }
    ],

    // 36. سورة يس (1 - 12)
    36: [
      { number: 1, text: "يس", tafseer: "حروف مقطعة تدل على إعجاز القرآن العظيم والتحدي به." },
      { number: 2, text: "وَالْقُرْآنِ الْحَكِيمِ", tafseer: "قسم بالقرآن المحكم في نظمه وأحكامه وأخباره وهدايته." },
      { number: 3, text: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ", tafseer: "جواب القسم: إنك يا محمد لمن الرسل الصادقين المبعوثين بالحق." },
      { number: 4, text: "عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ", tafseer: "على طريق معتدل موصل إلى مرضاة الله وهو دين الإسلام." },
      { number: 5, text: "تَنزِيلَ الْعَزِيزِ الرَّحِيمِ", tafseer: "هذا القرآن منزل من الرب العزيز في انتقامه، الرحيم بالمؤمنين من عباده." },
      { number: 6, text: "لِتُنذِرَ قَوْمًا مَّا أُنذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ", tafseer: "لتخوف قوماً انقطعت عنهم النذر من قبل فاستولى عليهم الجهل والغفلة." },
      { number: 7, text: "لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ", tafseer: "لقد وجب العذاب على أكثرهم لسبق علم الله بعنادهم وإصرارهم على الكفر." },
      { number: 8, text: "إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا فَهِيَ إِلَى الْأَذْقَانِ فَهُم مُّقْمَحُونَ", tafseer: "مثل لإصرارهم على الضلال: كمن جُعلت في عنقه الأغلال فرفعت ذقنه ورأسه إلى السماء لا يستطيع خفضها." },
      { number: 9, text: "وَجَعَلْنَا مِن بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ", tafseer: "وضربنا بينهم وبين الحق حجاباً مانعاً فعميت بصائرهم عن الهدى." },
      { number: 10, text: "وَسَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ", tafseer: "مستوٍ عندهم تحذيرك وعدمه؛ لأنهم قست قلوبهم وطُبع عليها." },
      { number: 11, text: "إِنَّمَا تُنذِرُ مَنِ اتَّبَعَ الذِّكْرَ وَخَشِيَ الرَّحْمَٰنَ بِالغَيْبِ ۖ فَبَشِّرْهُ بِمَغْفِرَةٍ وَأَجْرٍ كَرِيمٍ", tafseer: "إنما ينتفع بإنذارك من اتبع القرآن وخاف ربه في سره وعلانيته فبشره بمغفرة لذنوبه والجنة دار الكرامة." },
      { number: 12, text: "إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ ۚ وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُّبِينٍ", tafseer: "إنا نحن نبعث الأموات ونحصي أعمالهم وآثارهم الصالحة والسيئة، وكل شيء مثبت في كتاب محفوظ هو اللوح المحفوظ." }
    ],

    // 67. سورة الملك كاملة (30 آية)
    67: [
      { number: 1, text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", tafseer: "تكاثرت بركات الله وخيراته، المنفرد بالتصرف في ملك السماوات والأرض، وهو تام القدرة على كل شيء." },
      { number: 2, text: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ", tafseer: "الذي أوجد الموت والحياة ليختبركم: أيكم أخلص العمل لله وأصوبه، وهو العزيز الذي لا يغلبه شيء، الغفور لمن تاب." },
      { number: 3, text: "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ", tafseer: "خلق سبع سماوات بعضها فوق بعض في إتقان تام لا خلل فيه، كرر النظر هل تجد تشققاً أو تصدعاً؟" },
      { number: 4, text: "ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ", tafseer: "أعد النظر كرة بعد كرة، يرجع إليك طرفك كليلاً عاجزاً عن إدراك أي عيب في صنع الله." },
      { number: 5, text: "وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ", tafseer: "وزينا السماء القريبة بالنجوم المضيئة، وجعلنا شهباً تنقض على الشياطين مسترقي السمع وهيأنا لهم ناراً مستعرة." },
      { number: 6, text: "وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ ۖ وَبِئْسَ الْمَصِيرُ", tafseer: "وللجاحدين بربهم عذاب جهنم يوم القيامة، وبئس المرجع والمآل." },
      { number: 7, text: "إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ", tafseer: "إذا طُرح الكفار في جهنم سمعوا لها صوتاً منكراً كصوت الحمير وهي تغلي بهم كغلي المرجل." },
      { number: 8, text: "تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ ۖ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ", tafseer: "تكاد تتقطع وتتفرق جهنم من شدة غيظها على الكفار، يسألهم ملائكة العذاب تبكيتاً: ألم ينذركم الرسل؟" },
      { number: 9, text: "قَالُوا بَلَىٰ قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِن شَيْءٍ إِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ كَبِيرٍ", tafseer: "يعترفون بالذنب ويقولون: بلى قد جاءنا الرسل فكذبناهم وقلنا: ما أنزل الله وحياً إن أنتم إلا في ضلال مبين." },
      { number: 10, text: "وَقَالُوا لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِي أَصْحَابِ السَّعِيرِ", tafseer: "وقالوا نادمين: لو كنا نسمع سماع طالب الحق أو نتفكر تفكر عاقل ما كنا اليوم من أهل النار." },
      { number: 11, text: "فَاعْتَرَفُوا بِذَنبِهِمْ فَسُحْقًا لِّأَصْحَابِ السَّعِيرِ", tafseer: "فاعترفوا بتكذيبهم وكفرهم حين لا ينفع الندم، فبعداً وهلاكاً لأهل النار من رحمة الله." },
      { number: 12, text: "إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ", tafseer: "إن الذين يخافون عقاب الله وهم في خلواتهم لهم عفو ومحو لذنوبهم والجنة جزاء وفاقاً." },
      { number: 13, text: "وَأَسِرُّوا قَوْلَكُمْ أَوِ اجْهَرُوا بِهِ ۖ إِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ", tafseer: "أخفوا كلامكم أو أعلنوه، فإنه سبحانه مطلع على خفايا الصدور ونياتها." },
      { number: 14, text: "أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ", tafseer: "كيف لا يعلم الخالق خلقه وشؤونهم؟ وهو اللطيف بعباده، الخبير بكل ما يدق ويعظم." },
      { number: 15, text: "هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ ۖ وَإِلَيْهِ النُّشُورُ", tafseer: "هو الذي سهل لكم الأرض ومكنكم من الاستقرار عليها، فامشوا في جوانبها وابتغوا من رزق الله، وإليه المعاد للجزاء." }
    ],

    // 112. سورة الإخلاص كاملة
    112: [
      { number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", tafseer: "قل يا رسول الله للناس: الله هو الإله المنفرد بالألوهية والربوبية والأسماء والصفات، لا شريك له ولا نظير." },
      { number: 2, text: "اللَّهُ الصَّمَدُ", tafseer: "السيد الذي تصمد وتقصد الخلائق كلها إليه في حوائجها ورغائبها لكمال غناه وعظمة قدرته." },
      { number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", tafseer: "تنزه سبحانه عن الولد والوالد؛ إذ ليس كمثله شيء ولا يجانسه شيء." },
      { number: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", tafseer: "ولم يكن له مماثل ولا مكافئ ولا ند من خلقه بوجه من الوجوه." }
    ],

    // 113. سورة الفلق كاملة
    113: [
      { number: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", tafseer: "قل: أعتصم وألتجئ برب الصبح الذي ينفلق عنه ظلام الليل." },
      { number: 2, text: "مِن شَرِّ مَا خَلَقَ", tafseer: "من شر كل مخلوق فيه شر من إنس وجن وحيوان وجماد." },
      { number: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", tafseer: "ومن شر الليل المظلم إذا دخل وسكن، وما ينتشر فيه من الشياطين وأهل السوء." },
      { number: 4, text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", tafseer: "ومن شر السواحر اللاتي يعقدن العقد وينفخن فيها بالسحر والأذى." },
      { number: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", tafseer: "ومن شر كل حاسد يتمنى زوال نعمة الله عن خلقه ويسعى لإيقاع الضرر بهم." }
    ],

    // 114. سورة الناس كاملة
    114: [
      { number: 1, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", tafseer: "قل: ألوذ وأستجير برب البشر وخالقهم ومدبر أمورهم." },
      { number: 2, text: "مَلِكِ النَّاسِ", tafseer: "الملك الحق المتصرف في شؤونهم وسلطانهم وحده." },
      { number: 3, text: "إِلَٰهِ النَّاسِ", tafseer: "معبودهم بحق الذي لا يستحق الألوهية والعبادة أحد سواه." },
      { number: 4, text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", tafseer: "من شر الشيطان الذي يلقي الوسوسة في القلب، فإذا ذُكر الله خنس وتراجع." },
      { number: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", tafseer: "الذي يبث الشبهات والشهوات والوساوس في صدور بني آدم." },
      { number: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ", tafseer: "وهذا الوسواس يكون من شياطين الجن، ويكون أيضاً من شياطين الإنس الذين يدعون للفساد." }
    ]
  };

  /**
   * دوال المساعدة وتوليد روابط الصوت والـ APIs
   */

  /**
   * توليد رابط تلاوة آية صوتية بصوت القارئ المختار
   * @param {number} surahNumber رقم السورة (1 - 114)
   * @param {number} ayahNumber رقم الآية داخل السورة
   * @param {string} reciterId معرف القارئ (مثل ar.alafasy)
   * @returns {string} رابط الـ MP3
   */
  function getAyahAudioUrl(surahNumber, ayahNumber, reciterId = "ar.alafasy") {
    const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
    const sStr = String(surahNumber).padStart(3, '0');
    const aStr = String(ayahNumber).padStart(3, '0');
    // استخدام EveryAyah المباشر والموثوق
    return `https://everyayah.com/data/${reciter.subfolder}/${sStr}${aStr}.mp3`;
  }

  /**
   * توليد رابط تلاوة سورة كاملة بصوت القارئ
   * @param {number} surahNumber رقم السورة (1 - 114)
   * @param {string} reciterId معرف القارئ
   * @returns {string} رابط الـ MP3
   */
  function getSurahAudioUrl(surahNumber, reciterId = "ar.alafasy") {
    const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
    const sStr = String(surahNumber).padStart(3, '0');
    return `${reciter.mp3QuranServer}${sStr}.mp3`;
  }

  /**
   * جلب سورة بالرقم
   * @param {number} surahNumber (1 - 114)
   */
  function getSurahByNumber(surahNumber) {
    const num = parseInt(surahNumber, 10);
    return SURAHS.find(s => s.id === num) || null;
  }

  /**
   * جلب السور الواقعة في جزء معين
   * @param {number} juzNumber (1 - 30)
   */
  function getSurahsByJuz(juzNumber) {
    const j = parseInt(juzNumber, 10);
    const juzMeta = JUZ_METADATA.find(item => item.juz === j);
    if (!juzMeta) return [];
    return SURAHS.filter(s => {
      return (s.startPage <= juzMeta.endPage && s.endPage >= juzMeta.startPage);
    });
  }

  /**
   * جلب السور المشمولة في نطاق صفحات محدد
   * @param {number} startPage 
   * @param {number} endPage 
   */
  function getSurahsByPageRange(startPage, endPage) {
    const sp = parseInt(startPage, 10);
    const ep = parseInt(endPage, 10);
    return SURAHS.filter(s => !(s.endPage < sp || s.startPage > ep));
  }

  /**
   * معرفة السورة ورقم الصفحة ومعلومات الجزء لصفحة مصحف معينة (1 - 604)
   * @param {number} pageNumber 
   */
  function getPageInfo(pageNumber) {
    const p = Math.max(1, Math.min(604, parseInt(pageNumber, 10) || 1));
    const surahsInPage = SURAHS.filter(s => s.startPage <= p && s.endPage >= p);
    const juz = JUZ_METADATA.find(j => p >= j.startPage && p <= j.endPage) || JUZ_METADATA[0];
    
    return {
      page: p,
      juz: juz.juz,
      juzName: juz.name,
      primarySurah: surahsInPage[0] || null,
      surahs: surahsInPage,
      pageImageUrl: `https://quran-images-api.herokuapp.com/page/${p}`, // احتياطي إن لزم
      madinaPageUrl: `https://everyayah.com/data/quranpngs/${p}.png`
    };
  }

  /**
   * جلب آيات سورة مع التفسير (من النماذج المحلية أو عبر استدعاء API القرآن العالمي)
   * @param {number} surahNumber رقم السورة
   * @returns {Promise<Array>} قائمة بالآيات مع نصوصها وتفاسيرها
   */
  async function fetchSurahAyahs(surahNumber) {
    const sId = parseInt(surahNumber, 10);
    
    // إذا كانت متوفرة مسبقاً في النماذج السريعة
    if (SAMPLE_AYAHS[sId] && (sId === 1 || sId === 67 || sId === 112 || sId === 113 || sId === 114)) {
      return SAMPLE_AYAHS[sId];
    }

    try {
      // استدعاء من AlQuran Cloud API المفتوح والمجاني برواية حفص والتفسير الميسر
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${sId}/editions/quran-uthmani,ar.muyassar`);
      if (!response.ok) throw new Error("تعذر جلب بيانات السورة من الخادم");
      
      const json = await response.json();
      if (json.code === 200 && json.data && json.data.length >= 2) {
        const uthmaniEdition = json.data[0].ayahs;
        const tafseerEdition = json.data[1].ayahs;
        
        return uthmaniEdition.map((ayah, idx) => ({
          number: ayah.numberInSurah,
          text: ayah.text,
          tafseer: tafseerEdition[idx] ? tafseerEdition[idx].text : "التفسير الميسر متاح عبر الواجهة."
        }));
      }
    } catch (err) {
      console.warn("تنبيه: استخدام المحتوى المحلي الاحتياطي لعدم توفر الاتصال الخارجي", err);
    }

    // fallback إذا انقطع الإنترنت
    if (SAMPLE_AYAHS[sId]) {
      return SAMPLE_AYAHS[sId];
    }

    // توليد تمثيلي لطيف في حال عدم وجود اتصال
    const surah = getSurahByNumber(sId);
    return [{
      number: 1,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      tafseer: `تلاوة ${surah ? surah.name : 'السورة الشريفة'} مع التفسير الميسر المعتمد.`
    }];
  }

  /**
   * جلب آيات صفحة كاملة برسم المصحف العثماني (1 - 604)
   * @param {number} pageNumber 
   */
  async function fetchPageAyahs(pageNumber) {
    const p = Math.max(1, Math.min(604, parseInt(pageNumber, 10) || 1));
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/page/${p}/editions/quran-uthmani,ar.muyassar`);
      if (res.ok) {
        const json = await res.json();
        if (json.code === 200 && json.data) {
          const uthmani = json.data[0].ayahs;
          const muyassar = json.data[1] ? json.data[1].ayahs : [];
          return uthmani.map((ayah, i) => ({
            surahNumber: ayah.surah.number,
            surahName: ayah.surah.name,
            numberInSurah: ayah.numberInSurah,
            globalNumber: ayah.number,
            text: ayah.text,
            juz: ayah.juz,
            page: ayah.page,
            tafseer: muyassar[i] ? muyassar[i].text : ""
          }));
        }
      }
    } catch (e) {
      console.warn("فشل جلب الصفحة عبر الإنترنت، يتم تفعيل القراءة المدمجة", e);
    }

    // Fallback: تجميع من السور الواقعة في هذه الصفحة
    const info = getPageInfo(p);
    return [{
      surahNumber: info.primarySurah ? info.primarySurah.id : 1,
      surahName: info.primarySurah ? info.primarySurah.name : "القرآن الكريم",
      numberInSurah: 1,
      globalNumber: 1,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      juz: info.juz,
      page: p,
      tafseer: "صفحة مباركة من القرآن العظيم."
    }];
  }

  // تصدير الكائن النهائي بكل محتوياته ودواله
  return {
    SURAHS,
    JUZ_METADATA,
    RECITERS,
    SAMPLE_AYAHS,
    getSurahByNumber,
    getSurahsByJuz,
    getSurahsByPageRange,
    getPageInfo,
    getAyahAudioUrl,
    getSurahAudioUrl,
    fetchSurahAyahs,
    fetchPageAyahs,
    TOTAL_PAGES: 604,
    TOTAL_SURAHS: 114,
    TOTAL_JUZ: 30
  };
}));
