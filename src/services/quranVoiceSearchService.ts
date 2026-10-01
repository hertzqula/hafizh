import { matchAyahFromText, AyahMatchResult } from './quranTextMatcher';
import { Paths, File } from 'expo-file-system';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';

export interface VoiceSearchConfig {
  provider?: 'groq' | 'huggingface';
  apiKey?: string;
}

export interface VoiceSearchResult {
  success: boolean;
  transcription?: string;
  match?: AyahMatchResult;
  errorMessage?: string;
}

export const DEFAULT_GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

// Default settings
let cachedConfig: VoiceSearchConfig = {
  provider: 'groq',
  apiKey: DEFAULT_GROQ_API_KEY,
};

function getSettingsFile(): File {
  return new File(Paths.document, 'voice_settings.json');
}

/**
 * Memuat konfigurasi API tersimpan dari storage lokal.
 */
export async function loadVoiceConfig(): Promise<VoiceSearchConfig> {
  try {
    const file = getSettingsFile();
    if (file.exists) {
      const content = await file.text();
      const parsed = JSON.parse(content);
      // Validasi: jika key di storage kosong atau terpotong titik-titik sensor
      if (
        !parsed.apiKey ||
        parsed.apiKey.includes('...') ||
        parsed.apiKey.length < 35
      ) {
        if (DEFAULT_GROQ_API_KEY) {
          parsed.apiKey = DEFAULT_GROQ_API_KEY;
          await file.write(JSON.stringify(parsed));
        }
      }
      cachedConfig = { ...cachedConfig, ...parsed };
    } else {
      cachedConfig.apiKey = DEFAULT_GROQ_API_KEY;
      try {
        await file.write(JSON.stringify(cachedConfig));
      } catch (_) {}
    }
  } catch (err) {
    cachedConfig.apiKey = DEFAULT_GROQ_API_KEY;
  }
  return cachedConfig;
}

/**
 * Menyimpan konfigurasi API (misalnya Groq API key) ke storage lokal.
 */
export async function saveVoiceConfig(config: VoiceSearchConfig): Promise<void> {
  cachedConfig = { ...cachedConfig, ...config };
  try {
    const file = getSettingsFile();
    await file.write(JSON.stringify(cachedConfig));
  } catch (err) {
    console.error('Gagal menyimpan konfigurasi voice:', err);
  }
}

const WHISPER_HALLUCINATIONS = [
  'اشترك',
  'شكرا',
  'شكراً',
  'القناة',
  'قناة',
  'موسيقى',
  'تصبحون',
  'subtitles',
  'thank you',
  'watching',
  'subscribe',
];

function isHallucination(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower.length < 3) return true;
  for (const h of WHISPER_HALLUCINATIONS) {
    if (lower.includes(h)) return true;
  }
  return false;
}

/**
 * Mentranskripsikan audio rekaman menggunakan Groq Whisper (ultra-cepat, ~200ms).
 * Menggunakan native uploadAsync dari expo-file-system untuk reliabilitas tinggi di Android.
 * Menyertakan Quran prompt conditioning & temperature 0 untuk akurasi jarak jauh.
 */
async function transcribeGroq(
  audioUri: string,
  apiKey: string,
  promptContext?: string
): Promise<string> {
  const promptText =
    promptContext && promptContext.trim().length > 0
      ? `تلاوة القرآن الكريم ترتيل: ${promptContext.trim().slice(0, 160)}`
      : 'تلاوة آيات القرآن الكريم وترتيل المصحف الشريف بالتجويد';

  try {
    const uploadRes = await uploadAsync(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      audioUri,
      {
        httpMethod: 'POST',
        uploadType: FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: 'audio/m4a',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        parameters: {
          model: 'whisper-large-v3-turbo',
          language: 'ar',
          response_format: 'json',
          temperature: '0.0',
          prompt: promptText,
        },
      }
    );

    if (uploadRes.status === 200) {
      const data = JSON.parse(uploadRes.body);
      const rawText = data.text || '';
      return isHallucination(rawText) ? '' : rawText;
    }

    if (uploadRes.status === 401) {
      throw new Error('Groq API Key tidak valid. Silakan periksa kembali API Key Anda.');
    }
    throw new Error(`Groq API Error (${uploadRes.status}): ${uploadRes.body?.slice(0, 120)}`);
  } catch (err: any) {
    if (err?.message?.includes('Groq API Key') || err?.message?.includes('401')) {
      throw err;
    }
    console.warn('[Groq] uploadAsync error, falling back to fetch:', err?.message);
  }

  // Fallback jika uploadAsync gagal
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  } as any);
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('language', 'ar');
  formData.append('response_format', 'json');
  formData.append('temperature', '0.0');
  formData.append('prompt', promptText);

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 401) {
      throw new Error('Groq API Key tidak valid. Silakan periksa kembali API Key Anda.');
    }
    throw new Error(`Groq API Error (${response.status}): ${errText.slice(0, 120)}`);
  }

  const data = await response.json();
  const rawText = data.text || '';
  return isHallucination(rawText) ? '' : rawText;
}

/**
 * Mentranskripsikan audio rekaman menggunakan Hugging Face Router endpoint.
 */
async function transcribeHuggingFace(audioUri: string, apiKey?: string): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'audio/m4a',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const localRes = await fetch(audioUri);
  const blob = await localRes.blob();

  const response = await fetch(
    'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo',
    {
      method: 'POST',
      headers,
      body: blob,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HuggingFace Error (${response.status}): ${errText.slice(0, 120)}`);
  }

  const data = await response.json();
  return data.text || (Array.isArray(data) && data[0]?.text) || '';
}

/**
 * Fungsi utama untuk mencari ayat dari rekaman audio.
 */
export async function searchAyahByAudio(
  audioUri: string,
  customConfig?: VoiceSearchConfig,
  options?: {
    promptContext?: string;
    preferredPage?: number;
  }
): Promise<VoiceSearchResult> {
  try {
    const config = customConfig || (await loadVoiceConfig());

    if (!config.apiKey && config.provider === 'groq') {
      return {
        success: false,
        errorMessage: 'Belum ada Groq API Key. Silakan masukkan API Key gratis dari console.groq.com pada menu pengaturan suara.',
      };
    }

    let transcribedText = '';
    if (config.provider === 'groq' && config.apiKey) {
      transcribedText = await transcribeGroq(audioUri, config.apiKey, options?.promptContext);
    } else {
      transcribedText = await transcribeHuggingFace(audioUri, config.apiKey);
    }

    if (!transcribedText || transcribedText.trim().length === 0) {
      return {
        success: false,
        errorMessage: 'Suara tidak terdeteksi. Silakan coba membaca ayat lebih jelas.',
      };
    }

    const match = matchAyahFromText(transcribedText, options?.preferredPage);
    if (!match) {
      return {
        success: false,
        transcription: transcribedText,
        errorMessage: `Terdengar: "${transcribedText}", namun belum cocok dengan ayat tertentu.`,
      };
    }

    return {
      success: true,
      transcription: transcribedText,
      match,
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error?.message || 'Terjadi kesalahan saat memproses suara.',
    };
  }
}

/**
 * Mencari ayat langsung dari teks Arab.
 */
export function searchAyahByText(text: string): VoiceSearchResult {
  const match = matchAyahFromText(text);
  if (!match) {
    return {
      success: false,
      transcription: text,
      errorMessage: `Tidak ditemukan ayat yang cocok untuk "${text}".`,
    };
  }
  return {
    success: true,
    transcription: text,
    match,
  };
}
