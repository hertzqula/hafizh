export const SURAH_NAMES: string[] = [
  '', // index 0 kosong agar 1-indexed (Surah 1..114)
  'الفاتحة',
  'البقرة',
  'آل عمران',
  'النساء',
  'المائدة',
  'الأنعام',
  'الأعراف',
  'الأنفال',
  'التوبة',
  'يونس',
  'هود',
  'يوسف',
  'الرعد',
  'إبراهيم',
  'الحجر',
  'النحل',
  'الإسراء',
  'الكهف',
  'مريم',
  'طه',
  'الأنبياء',
  'الحج',
  'المؤمنون',
  'النور',
  'الفرقان',
  'الشعراء',
  'النمل',
  'القصص',
  'العنكبوت',
  'الروم',
  'لقمان',
  'السجدة',
  'الأحزاب',
  'سبأ',
  'فاطر',
  'يس',
  'الصافات',
  'ص',
  'الزمر',
  'غافر',
  'فصلت',
  'الشورى',
  'الزخرف',
  'الدخان',
  'الجاثية',
  'الأحقاف',
  'محمد',
  'الفتح',
  'الحجرات',
  'ق',
  'الذاريات',
  'الطور',
  'النجم',
  'القمر',
  'الرحمن',
  'الواقعة',
  'الحديد',
  'المجادلة',
  'الحشر',
  'الممتحنة',
  'الصف',
  'الجمعة',
  'المنافقون',
  'التغابن',
  'الطلاق',
  'التحريم',
  'الملك',
  'القلم',
  'الحاقة',
  'المعارج',
  'نوح',
  'الجن',
  'المزمل',
  'المدثر',
  'القيامة',
  'الإنسان',
  'المرسلات',
  'النبأ',
  'النازعات',
  'عبس',
  'التكوير',
  'الانفطار',
  'المطففين',
  'الانشقاق',
  'البروج',
  'الطارق',
  'الأعلى',
  'الغاشية',
  'الفجر',
  'البلد',
  'الشمس',
  'الليل',
  'الضحى',
  'الشرح',
  'التين',
  'العلق',
  'القدر',
  'البينة',
  'الزلزلة',
  'العاديات',
  'القارعة',
  'التكاثر',
  'العصر',
  'الهمزة',
  'الفيل',
  'قريش',
  'الماعون',
  'الكوثر',
  'الكافرون',
  'النصر',
  'المسد',
  'الإخلاص',
  'الفلق',
  'الناس',
];

export function getSurahNameForPage(page: number): string {
  if (page === 1) return `سُورَةُ ${SURAH_NAMES[1]}`;
  if (page >= 2 && page <= 49) return `سُورَةُ ${SURAH_NAMES[2]}`;
  if (page >= 50 && page <= 76) return `سُورَةُ ${SURAH_NAMES[3]}`;
  if (page >= 77 && page <= 106) return `سُورَةُ ${SURAH_NAMES[4]}`;
  if (page >= 107 && page <= 127) return `سُورَةُ ${SURAH_NAMES[5]}`;
  // Default fallback
  return 'سُورَةُ القُرْآنِ';
}

export function getJuzForPage(page: number): number {
  if (page <= 1) return 1;
  if (page >= 582) return 30;
  return Math.floor((page - 2) / 20) + 1;
}

export function toArabicDigits(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((d) => arabicDigits[parseInt(d, 10)] ?? d)
    .join('');
}

export function getPageImageSource(pageNumber: number): any {
  if (pageNumber === 1) {
    return require('@/assets/mushaf-pages/page-001.png');
  }
  if (pageNumber === 2) {
    return require('@/assets/mushaf-pages/page-002.png');
  }
  if (pageNumber === 3) {
    return require('@/assets/mushaf-pages/page-003.png');
  }
  const padded = String(pageNumber).padStart(3, '0');
  return {
    uri: `https://files.quran.app/hafs/madani/width_1024/page${padded}.png`,
  };
}
