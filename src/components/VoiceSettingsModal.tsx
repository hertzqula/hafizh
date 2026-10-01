import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Key, Sparkles, Check, ExternalLink } from 'lucide-react-native';
import {
  loadVoiceConfig,
  saveVoiceConfig,
  VoiceSearchConfig,
} from '@/services/quranVoiceSearchService';
import { AyahMatchResult } from '@/services/quranTextMatcher';
import { searchAyahByText } from '@/services/quranVoiceSearchService';

interface VoiceSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onTestAyahSelected: (match: AyahMatchResult) => void;
}

const QUICK_TEST_VERSES = [
  { label: 'Al-Fatihah : 2', text: 'الحمد لله رب العالمين' },
  { label: 'Ayat Kursi (2:255)', text: 'الله لا اله الا هو الحي القيوم لا تاخذه سنة ولا نوم' },
  { label: 'Al-Mulk : 1', text: 'تبارك الذي بيده الملك' },
  { label: 'Al-Ikhlas : 1', text: 'قل هو الله احد' },
  { label: 'Al-Kawtsar : 1', text: 'انا اعطيناك الكوثر' },
];

export function VoiceSettingsModal({
  visible,
  onClose,
  onTestAyahSelected,
}: VoiceSettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      loadVoiceConfig().then((cfg) => {
        setApiKey(cfg.apiKey || '');
        setIsSaved(false);
      });
    }
  }, [visible]);

  const handleSave = async () => {
    await saveVoiceConfig({
      provider: 'groq',
      apiKey: apiKey.trim(),
    });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleTestVerse = (arabicText: string) => {
    const res = searchAyahByText(arabicText);
    if (res.success && res.match) {
      onTestAyahSelected(res.match);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.keyIconBadge}>
                <Key size={18} color="#16a34a" />
              </View>
              <Text style={styles.title}>Pengaturan Voice AI (Tarteel)</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} bounces={false}>
            <Text style={styles.description}>
              Untuk pengenalan suara secara real-time yang cepat (~200ms), Al-Furqan menggunakan model **Groq Whisper**.
            </Text>

            {/* Input API Key */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Groq API Key (Gratis):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="gsk_..."
                placeholderTextColor="#94a3b8"
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <Text style={styles.helpText}>
                Dapatkan API Key 100% gratis di <Text style={styles.linkText}>console.groq.com/keys</Text> tanpa kartu kredit.
              </Text>
            </View>

            {/* Save Button */}
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.buttonPressed,
                isSaved && styles.saveButtonSuccess,
              ]}
              onPress={handleSave}
            >
              {isSaved ? (
                <>
                  <Check size={18} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Tersimpan!</Text>
                </>
              ) : (
                <Text style={styles.saveButtonText}>Simpan Pengaturan</Text>
              )}
            </Pressable>

            {/* Test Simulation Chips */}
            <View style={styles.testSection}>
              <View style={styles.testHeaderRow}>
                <Sparkles size={16} color="#16a34a" />
                <Text style={styles.testTitle}>Uji Coba Langsung (Simulasi Realtime):</Text>
              </View>
              <Text style={styles.testDesc}>
                Pilih ayat di bawah ini untuk melihat layar mushaf otomatis bergeser dan menyorot ayat:
              </Text>
              <View style={styles.chipsContainer}>
                {QUICK_TEST_VERSES.map((item, idx) => (
                  <Pressable
                    key={`test-${idx}`}
                    style={({ pressed }) => [
                      styles.chip,
                      pressed && styles.chipPressed,
                    ]}
                    onPress={() => handleTestVerse(item.text)}
                  >
                    <Text style={styles.chipText}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 18,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  helpText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 16,
  },
  linkText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveButtonSuccess: {
    backgroundColor: '#15803d',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  testSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  testHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  testTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  testDesc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
    lineHeight: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipPressed: {
    backgroundColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
});
