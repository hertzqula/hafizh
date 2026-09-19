import rawBoundsData from '../../assets/data/mushaf_ayah_bounds.json';
import { AyahBoundsData, MushafPageData } from '@/types/mushafImage';
import { getSurahNameForPage, getJuzForPage } from '@/constants/quranMeta';

type RawAyahEntry = [
  sura: number,
  ayah: number,
  rects: [line: number, minX: number, maxX: number, minY: number, maxY: number][]
];

const boundsData = (rawBoundsData as unknown) as Record<string, RawAyahEntry[]>;

// In-memory cache for parsed page data
const pageCache = new Map<number, MushafPageData>();

/**
 * Mendapatkan data koordinat ayat dan metadata lengkap untuk suatu nomor halaman (1-604).
 * Menghasilkan objek MushafPageData yang siap digunakan oleh UI.
 */
export function getPageData(pageNumber: number): MushafPageData {
  if (pageCache.has(pageNumber)) {
    return pageCache.get(pageNumber)!;
  }

  const rawAyahs = boundsData[String(pageNumber)] || [];
  const ayahs: AyahBoundsData[] = rawAyahs.map(([sura, ayah, rawRects]) => ({
    ayahId: `${sura}:${ayah}`,
    surahNumber: sura,
    ayahNumber: ayah,
    rects: rawRects.map(([line, minX, maxX, minY, maxY]) => ({
      line,
      minX,
      maxX,
      minY,
      maxY,
    })),
  }));

  const pageData: MushafPageData = {
    pageNumber,
    surahName: getSurahNameForPage(pageNumber),
    juzNumber: getJuzForPage(pageNumber),
    imageWidth: 1024,
    imageHeight: 1656,
    ayahs,
  };

  pageCache.set(pageNumber, pageData);
  return pageData;
}

/**
 * Mencari ayat pada halaman berdasarkan koordinat titik (nativeX, nativeY) pada resolusi 1024x1656.
 * @param pageNumber Nomor halaman (1-604)
 * @param nativeX Posisi X ternormalisasi (0-1024)
 * @param nativeY Posisi Y ternormalisasi (0-1656)
 * @param toleranceX Toleransi horizontal dalam piksel (default 8)
 * @param toleranceY Toleransi vertikal dalam piksel (default 6)
 */
export function findAyahAtCoordinates(
  pageNumber: number,
  nativeX: number,
  nativeY: number,
  toleranceX = 8,
  toleranceY = 6
): AyahBoundsData | null {
  const pageData = getPageData(pageNumber);
  if (!pageData || pageData.ayahs.length === 0) return null;

  const found = pageData.ayahs.find((ayah) =>
    ayah.rects.some(
      (r) =>
        nativeX >= r.minX - toleranceX &&
        nativeX <= r.maxX + toleranceX &&
        nativeY >= r.minY - toleranceY &&
        nativeY <= r.maxY + toleranceY
    )
  );

  return found || null;
}
