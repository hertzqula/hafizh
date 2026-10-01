import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useAudioRecorder,
  AudioModule,
  setAudioModeAsync,
  RecordingOptions,
  IOSOutputFormat,
  AudioQuality,
} from 'expo-audio';
import { deleteAsync } from 'expo-file-system/legacy';
import {
  searchAyahByAudio,
  loadVoiceConfig,
} from '@/services/quranVoiceSearchService';
import {
  matchAyahFromText,
  getTextForPage,
  AyahMatchResult,
} from '@/services/quranTextMatcher';

/**
 * Konfigurasi rekaman suara yang dioptimalkan untuk Speech-to-Text Whisper:
 * - 16kHz mono (sama persis dengan sample rate native Whisper, tanpa overhead resampling)
 * - Bitrate 48kbps (ukuran file ~27 KB per 4.5s chunk, pengiriman 5x lebih cepat)
 * - Android 'voice_recognition' audioSource (mengaktifkan Automatic Gain Control dari hardware HP
 *   agar suara dari jarak jauh tetap terdengar jelas dan jernih oleh AI)
 */
export const VOICE_RECORDING_OPTIONS: RecordingOptions = {
  extension: '.m4a',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 48000,
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
    audioSource: 'voice_recognition',
  },
  ios: {
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.HIGH,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 48000,
  },
};

interface UseLiveQuranListenerOptions {
  onAyahDetected: (match: AyahMatchResult) => void;
  onError?: (errorMsg: string) => void;
  chunkDurationMs?: number; // default 4500ms
  currentPage?: number;
}

export function useLiveQuranListener({
  onAyahDetected,
  onError,
  chunkDurationMs = 4500,
  currentPage,
}: UseLiveQuranListenerOptions) {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Siap');
  const [lastDetectedAyah, setLastDetectedAyah] = useState<AyahMatchResult | null>(null);

  const audioRecorder = useAudioRecorder(VOICE_RECORDING_OPTIONS);
  const isActiveRef = useRef(false);
  const chunkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnalyzingRef = useRef(false);
  const lastDetectedRef = useRef<AyahMatchResult | null>(null);
  const rollingTextRef = useRef<string>('');
  const currentPageRef = useRef(currentPage);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Membersihkan timer saat unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (chunkTimeoutRef.current) {
        clearTimeout(chunkTimeoutRef.current);
      }
    };
  }, []);

  const processChunk = async (uri: string) => {
    if (isAnalyzingRef.current) return;
    try {
      isAnalyzingRef.current = true;
      setIsProcessing(true);

      const targetPage = currentPageRef.current || lastDetectedRef.current?.pageNumber;
      const promptContext = targetPage ? getTextForPage(targetPage) : undefined;

      const res = await searchAyahByAudio(uri, undefined, {
        promptContext,
        preferredPage: targetPage,
      });

      if (res.success && res.match) {
        lastDetectedRef.current = res.match;
        rollingTextRef.current = '';
        setLastDetectedAyah(res.match);
        setStatusMessage(`✓ ${res.match.surahName} : ${res.match.ayahNumber}`);
        onAyahDetected(res.match);
      } else if (res.transcription && res.transcription.trim().length > 0) {
        // Coba gabungkan dengan teks penggalan sebelumnya (rolling buffer)
        const combined = `${rollingTextRef.current} ${res.transcription}`.trim();
        const combinedMatch = matchAyahFromText(combined, targetPage);

        if (combinedMatch) {
          lastDetectedRef.current = combinedMatch;
          rollingTextRef.current = '';
          setLastDetectedAyah(combinedMatch);
          setStatusMessage(`✓ ${combinedMatch.surahName} : ${combinedMatch.ayahNumber}`);
          onAyahDetected(combinedMatch);
        } else {
          // Simpan kata-kata terakhir ke rolling buffer untuk digabung dengan chunk berikutnya
          const words = combined.split(' ');
          rollingTextRef.current = words.slice(-8).join(' ');
          setStatusMessage(`Terdengar: "${res.transcription.trim().slice(0, 28)}"`);
        }
      } else if (res.errorMessage && isActiveRef.current) {
        setStatusMessage(res.errorMessage.slice(0, 36));
        if (res.errorMessage.includes('Groq API Key') || res.errorMessage.includes('401')) {
          onError?.(res.errorMessage);
          stopListening();
        }
      }
    } catch (err: any) {
      console.warn('[LiveQuranListener] Error chunk:', err?.message);
    } finally {
      // Hapus file audio sementara dari storage HP agar tidak menumpuk
      try {
        await deleteAsync(uri, { idempotent: true });
      } catch (_) {}
      isAnalyzingRef.current = false;
      setIsProcessing(false);
    }
  };

  const recordNextChunk = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      // 1. Siapkan dan mulai rekaman chunk dengan preset voice optimized
      await audioRecorder.prepareToRecordAsync(VOICE_RECORDING_OPTIONS);
      audioRecorder.record();
      if (!lastDetectedRef.current) {
        setStatusMessage('Mendengarkan bacaan...');
      }

      // 2. Tunggu chunkDurationMs
      chunkTimeoutRef.current = setTimeout(async () => {
        if (!isActiveRef.current) return;

        try {
          // 3. Stop rekaman chunk ini
          await audioRecorder.stop();
          const uri = audioRecorder.uri;

          // 4. Proses audio chunk di background tanpa menunda rekaman berikutnya
          if (uri) {
            processChunk(uri);
          }

          // 5. Lanjutkan rekam chunk berikutnya secara mulus
          if (isActiveRef.current) {
            recordNextChunk();
          }
        } catch (stopErr: any) {
          console.warn('[LiveQuranListener] Stop chunk error:', stopErr?.message);
          if (isActiveRef.current) {
            recordNextChunk();
          }
        }
      }, chunkDurationMs);
    } catch (startErr: any) {
      console.warn('[LiveQuranListener] Start chunk error:', startErr?.message);
      onError?.(startErr?.message || 'Gagal memulai perekaman.');
      stopListening();
    }
  }, [chunkDurationMs]);

  const startListening = async () => {
    try {
      const config = await loadVoiceConfig();
      if (config.provider === 'groq' && !config.apiKey) {
        onError?.('Belum ada Groq API Key. Masukkan API Key gratis di menu pengaturan suara untuk memulai.');
        return;
      }

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        onError?.('Izin mikrofon diperlukan untuk mendengarkan bacaan Anda.');
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
        interruptionMode: 'mixWithOthers',
      });

      isActiveRef.current = true;
      setIsLiveActive(true);
      setStatusMessage('Mendengarkan bacaan...');
      recordNextChunk();
    } catch (err: any) {
      onError?.(err?.message || 'Gagal menyalakan mikrofon.');
      stopListening();
    }
  };

  const stopListening = async () => {
    isActiveRef.current = false;
    lastDetectedRef.current = null;
    rollingTextRef.current = '';
    setIsLiveActive(false);
    setIsProcessing(false);
    setStatusMessage('Siap');

    if (chunkTimeoutRef.current) {
      clearTimeout(chunkTimeoutRef.current);
      chunkTimeoutRef.current = null;
    }

    try {
      await audioRecorder.stop();
    } catch (e) {
      // ignore jika sudah stop
    }
  };

  const toggleListening = () => {
    if (isLiveActive) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    isLiveActive,
    isProcessing,
    statusMessage,
    lastDetectedAyah,
    startListening,
    stopListening,
    toggleListening,
  };
}
