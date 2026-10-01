import rawDataset from '../../assets/data/quran_text_simplified.json';
import { SURAH_NAMES, getSurahNameForPage } from '@/constants/quranMeta';

export interface AyahMatchResult {
  surahNumber: number;
  ayahNumber: number;
  pageNumber: number;
  surahName: string;
  matchedText: string;
  confidence: number;
}

type RawAyahRecord = [
  surah: number,
  ayah: number,
  page: number,
  text: string
];

const dataset = (rawDataset as unknown) as RawAyahRecord[];

/**
 * Normalisasi teks Arab:
 * - Menghilangkan tanda harakat / tasykil
 * - Menormalisasi variasi alif (أ, إ, آ, ٱ -> ا)
 * - Menormalisasi yaa dan alif maqshurah (ى -> ي)
 * - Menormalisasi taa marbuthah (ة -> ه)
 * - Menghilangkan tatweel dan tanda baca
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u0640]/g, '') // tatweel
    .replace(/[^\u0621-\u063A\u0641-\u064A\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mencocokkan transkripsi ucapan pengguna dengan 6.236 ayat Al-Qur'an.
 * Mengembalikan ayat dengan skor kecocokan tertinggi.
 */
export function matchAyahFromText(spokenText: string): AyahMatchResult | null {
  const normSpoken = normalizeArabic(spokenText);
  if (!normSpoken || normSpoken.length < 3) return null;

  const spokenWords = normSpoken.split(' ').filter((w) => w.length > 1);
  if (spokenWords.length === 0) return null;

  let bestMatch: AyahMatchResult | null = null;
  let maxScore = 0;

  for (const [surah, ayah, page, text] of dataset) {
    // 1. Kecocokan substring langsung
    if (text.includes(normSpoken)) {
      const score = 100 + (normSpoken.length / text.length) * 50;
      if (score > maxScore) {
        maxScore = score;
        bestMatch = {
          surahNumber: surah,
          ayahNumber: ayah,
          pageNumber: page,
          surahName: SURAH_NAMES[surah]
            ? `سُورَةُ ${SURAH_NAMES[surah]}`
            : getSurahNameForPage(page),
          matchedText: text,
          confidence: Math.min(100, Math.round(score)),
        };
      }
      continue;
    }

    // 2. Kecocokan berdasarkan irisan kata (Word Overlap)
    let matchCount = 0;
    for (const w of spokenWords) {
      if (text.includes(w)) {
        matchCount++;
      }
    }

    if (matchCount >= 2 || (spokenWords.length === 1 && matchCount === 1)) {
      const ratio = matchCount / spokenWords.length;
      if (ratio >= 0.6) {
        const score = ratio * 70 + (matchCount / text.split(' ').length) * 30;
        if (score > maxScore) {
          maxScore = score;
          bestMatch = {
            surahNumber: surah,
            ayahNumber: ayah,
            pageNumber: page,
            surahName: SURAH_NAMES[surah]
              ? `سُورَةُ ${SURAH_NAMES[surah]}`
              : getSurahNameForPage(page),
            matchedText: text,
            confidence: Math.min(100, Math.round(score)),
          };
        }
      }
    }
  }

  return bestMatch;
}
