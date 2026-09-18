import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockPageData } from '@/data/mockPage';
import { AyahToolbar } from '@/components/AyahToolbar';

export function MushafPageScreen() {
  const [highlightedAyahId, setHighlightedAyahId] = useState<string | null>(null);

  const handleBackgroundPress = () => {
    if (highlightedAyahId !== null) {
      setHighlightedAyahId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Pressable
        style={styles.pressableBackdrop}
        onPress={handleBackgroundPress}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Mushaf */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageMetaText}>الجزء الأول</Text>
            <Text style={styles.pageMetaText}>سُورَةُ الْفَاتِحَةِ</Text>
          </View>

          {/* Bingkai Halaman Mushaf */}
          <View style={styles.mushafFrame}>
            <View style={styles.innerFrame}>
              {mockPageData.lines.map((line) => {
                const isCentered = line.isCentered;
                const isAyah = line.lineType === 'ayah';

                return (
                  <View
                    key={line.lineNumber}
                    style={[
                      styles.lineWrapper,
                      line.lineType === 'surah_name' && styles.surahNameLineWrapper,
                      line.lineType === 'basmallah' && styles.basmallahLineWrapper,
                    ]}
                  >
                    <Text
                      style={[
                        styles.lineText,
                        isCentered ? styles.centeredText : styles.justifiedText,
                        !isAyah && styles.nonAyahText,
                      ]}
                    >
                      {line.wordIds.map((wordId) => {
                        const word = mockPageData.words[wordId];
                        if (!word) return null;

                        const isHighlighted =
                          highlightedAyahId !== null &&
                          word.ayahId === highlightedAyahId;

                        return (
                          <Text
                            key={word.id}
                            onLongPress={() => {
                              // Long press hanya aktif untuk kata dengan ayahId ayat
                              if (word.ayahId && word.ayahId.includes(':')) {
                                setHighlightedAyahId(word.ayahId);
                              }
                            }}
                            style={[
                              styles.wordText,
                              isHighlighted && styles.wordHighlighted,
                            ]}
                          >
                            {word.text}{' '}
                          </Text>
                        );
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Footer Mushaf */}
          <View style={styles.pageFooter}>
            <Text style={styles.pageNumberText}>{mockPageData.pageNumber}</Text>
          </View>
        </ScrollView>
      </Pressable>

      {/* Floating Toolbar saat ayat di-highlight */}
      {highlightedAyahId !== null && (
        <AyahToolbar ayahId={highlightedAyahId} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  pressableBackdrop: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageHeader: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  pageMetaText: {
    fontFamily: 'ScheherazadeNew-Regular',
    fontSize: 16,
    color: '#64748b',
  },
  mushafFrame: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#fffdfa',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2d8c7',
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#451a03',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 20px rgba(69, 26, 3, 0.08)',
      },
    }),
  },
  innerFrame: {
    borderWidth: 1,
    borderColor: '#eddcc5',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: '#fefcf8',
  },
  lineWrapper: {
    width: '100%',
    marginVertical: 4,
  },
  surahNameLineWrapper: {
    backgroundColor: '#f6ede0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5d1b8',
    paddingVertical: 4,
    marginVertical: 6,
  },
  basmallahLineWrapper: {
    marginVertical: 6,
  },
  lineText: {
    writingDirection: 'rtl',
    fontFamily: 'ScheherazadeNew-Regular',
    fontSize: 26,
    lineHeight: 56,
    color: '#1e293b',
  },
  centeredText: {
    textAlign: 'center',
  },
  justifiedText: {
    textAlign: 'justify',
  },
  nonAyahText: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: 26,
    lineHeight: 52,
    color: '#0f172a',
  },
  wordText: {
    fontFamily: 'ScheherazadeNew-Regular',
    fontSize: 26,
    lineHeight: 56,
  },
  wordHighlighted: {
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
  },
  pageFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  pageNumberText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});
