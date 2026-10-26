const DEFAULT_WAQF_PAGES = [
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
    startSurah: 1,
    country: "السعودية",
    creatorName: "أبناؤه وبناته",
    visits: 783,
    createdAt: "2026-09-10T14:20:00.000Z"
  },
  {
    id: "110888",
    name: "الوالدة فاطمة بنت إبراهيم",
    prayerText: "رحمها الله تعالى",
    reciterId: "ar.minshawi",
    reciterName: "الشيخ محمد صديق المنشاوي",
    startSurah: 1,
    country: "مصر",
    creatorName: "عائلتها وأحفادها",
    visits: 1240,
    createdAt: "2026-09-18T08:15:00.000Z"
  },
  {
    id: "110889",
    name: "الوالد والوالدة وأموات المسلمين",
    prayerText: "رحمهم الله تعالى",
    reciterId: "ar.husary",
    reciterName: "الشيخ محمود خليل الحصري",
    startSurah: 1,
    country: "الكويت",
    creatorName: "فاعل خير",
    visits: 931,
    createdAt: "2026-09-22T19:00:00.000Z"
  },
  {
    id: "110890",
    name: "محمد بن أحمد الشريف",
    prayerText: "حفظه الله تعالى وبارك في عمره",
    reciterId: "ar.alafasy",
    reciterName: "الشيخ مشاري راشد العفاسي",
    startSurah: 1,
    country: "الإمارات",
    creatorName: "أصدقاؤه ومحبوه",
    visits: 616,
    createdAt: "2026-09-25T11:45:00.000Z"
  },
  {
    id: "110891",
    name: "مرضى المسلمين جميعاً",
    prayerText: "شفاهم الله تعالى وعافاهم",
    reciterId: "ar.minshawi",
    reciterName: "الشيخ محمد صديق المنشاوي",
    startSurah: 1,
    country: "الأردن",
    creatorName: "محبو الخير",
    visits: 1541,
    createdAt: "2026-09-28T16:10:00.000Z"
  }
];

export async function onRequestGet(context) {
  const { id } = context.params;
  const pageIndex = DEFAULT_WAQF_PAGES.findIndex(p => String(p.id) === String(id));

  if (pageIndex === -1) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'صفحة الوقف غير موجودة'
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const page = { ...DEFAULT_WAQF_PAGES[pageIndex], visits: DEFAULT_WAQF_PAGES[pageIndex].visits + 1 };
  const prevPage = pageIndex > 0 ? DEFAULT_WAQF_PAGES[pageIndex - 1] : DEFAULT_WAQF_PAGES[DEFAULT_WAQF_PAGES.length - 1];
  const nextPage = pageIndex < DEFAULT_WAQF_PAGES.length - 1 ? DEFAULT_WAQF_PAGES[pageIndex + 1] : DEFAULT_WAQF_PAGES[0];

  return new Response(JSON.stringify({
    status: 'success',
    page,
    navigation: {
      prevId: prevPage ? prevPage.id : null,
      nextId: nextPage ? nextPage.id : null
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
