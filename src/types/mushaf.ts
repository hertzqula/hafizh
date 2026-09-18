export type Word = {
  id: number;
  text: string;
  ayahId: string; // contoh: "1:1", "1:2"
};

export type LineType = 'surah_name' | 'basmallah' | 'ayah';

export type Line = {
  lineNumber: number;
  lineType: LineType;
  isCentered: boolean;
  wordIds: number[]; // urut sesuai posisi di baris
};

export type PageData = {
  pageNumber: number;
  words: Record<number, Word>;
  lines: Line[];
};
