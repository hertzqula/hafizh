import { PageData, Word } from '@/types/mushaf';

const wordList: Word[] = [
  // Surah Name Header
  { id: 100, text: 'سُورَةُ الْفَاتِحَةِ', ayahId: 'surah_name' },

  // Ayah 1 (Basmallah)
  { id: 1, text: 'بِسْمِ', ayahId: '1:1' },
  { id: 2, text: 'اللَّهِ', ayahId: '1:1' },
  { id: 3, text: 'الرَّحْمَٰنِ', ayahId: '1:1' },
  { id: 4, text: 'الرَّحِيمِ', ayahId: '1:1' },
  { id: 5, text: '﴿١﴾', ayahId: '1:1' },

  // Ayah 2
  { id: 6, text: 'الْحَمْدُ', ayahId: '1:2' },
  { id: 7, text: 'لِلَّهِ', ayahId: '1:2' },
  { id: 8, text: 'رَبِّ', ayahId: '1:2' },
  { id: 9, text: 'الْعَالَمِينَ', ayahId: '1:2' },
  { id: 10, text: '﴿٢﴾', ayahId: '1:2' },

  // Ayah 3
  { id: 11, text: 'الرَّحْمَٰنِ', ayahId: '1:3' },
  { id: 12, text: 'الرَّحِيمِ', ayahId: '1:3' },
  { id: 13, text: '﴿٣﴾', ayahId: '1:3' },

  // Ayah 4
  { id: 14, text: 'مَالِكِ', ayahId: '1:4' },
  { id: 15, text: 'يَوْمِ', ayahId: '1:4' },
  { id: 16, text: 'الدِّينِ', ayahId: '1:4' },
  { id: 17, text: '﴿٤﴾', ayahId: '1:4' },

  // Ayah 5
  { id: 18, text: 'إِيَّاكَ', ayahId: '1:5' },
  { id: 19, text: 'نَعْبُدُ', ayahId: '1:5' },
  { id: 20, text: 'وَإِيَّاكَ', ayahId: '1:5' },
  { id: 21, text: 'نَسْتَعِينُ', ayahId: '1:5' },
  { id: 22, text: '﴿٥﴾', ayahId: '1:5' },

  // Ayah 6
  { id: 23, text: 'اهْدِنَا', ayahId: '1:6' },
  { id: 24, text: 'الصِّرَاطَ', ayahId: '1:6' },
  { id: 25, text: 'الْمُسْتَقِيمَ', ayahId: '1:6' },
  { id: 26, text: '﴿٦﴾', ayahId: '1:6' },

  // Ayah 7
  { id: 27, text: 'صِرَاطَ', ayahId: '1:7' },
  { id: 28, text: 'الَّذِينَ', ayahId: '1:7' },
  { id: 29, text: 'أَنْعَمْتَ', ayahId: '1:7' },
  { id: 30, text: 'عَلَيْهِمْ', ayahId: '1:7' },
  { id: 31, text: 'غَيْرِ', ayahId: '1:7' },
  { id: 32, text: 'الْمَغْضُوبِ', ayahId: '1:7' },
  { id: 33, text: 'عَلَيْهِمْ', ayahId: '1:7' },
  { id: 34, text: 'وَلَا', ayahId: '1:7' },
  { id: 35, text: 'الضَّالِّينَ', ayahId: '1:7' },
  { id: 36, text: '﴿٧﴾', ayahId: '1:7' },
];

const wordsRecord: Record<number, Word> = {};
for (const word of wordList) {
  wordsRecord[word.id] = word;
}

export const mockPageData: PageData = {
  pageNumber: 1,
  words: wordsRecord,
  lines: [
    {
      lineNumber: 1,
      lineType: 'surah_name',
      isCentered: true,
      wordIds: [100],
    },
    {
      lineNumber: 2,
      lineType: 'basmallah',
      isCentered: true,
      wordIds: [1, 2, 3, 4, 5],
    },
    {
      lineNumber: 3,
      lineType: 'ayah',
      isCentered: false,
      wordIds: [6, 7, 8, 9, 10, 11, 12, 13],
    },
    {
      lineNumber: 4,
      lineType: 'ayah',
      isCentered: false,
      wordIds: [14, 15, 16, 17, 18, 19, 20, 21, 22],
    },
    {
      lineNumber: 5,
      lineType: 'ayah',
      isCentered: false,
      wordIds: [23, 24, 25, 26, 27, 28, 29, 30],
    },
    {
      lineNumber: 6,
      lineType: 'ayah',
      isCentered: false,
      wordIds: [31, 32, 33, 34, 35, 36],
    },
  ],
};
