export type AyahLineRect = {
  line: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type AyahBoundsData = {
  ayahId: string; // contoh: "2:6", "2:11"
  surahNumber: number;
  ayahNumber: number;
  rects: AyahLineRect[];
};

export type MushafPageData = {
  pageNumber: number;
  surahName: string;
  juzNumber: number;
  imageWidth: number; // 1024
  imageHeight: number; // 1656
  ayahs: AyahBoundsData[];
};
