import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  LayoutChangeEvent,
  GestureResponderEvent,
  FlatList,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { mockPage3Data } from '@/data/mockPage3Data';
import { AyahToolbar } from '@/components/AyahToolbar';
import {
  getSurahNameForPage,
  getJuzForPage,
  toArabicDigits,
  getPageImageSource,
} from '@/constants/quranMeta';

const TOTAL_PAGES = 604;
const PAGES_DATA = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

export function MushafPageScreen() {
  const [currentPage, setCurrentPage] = useState<number>(3);
  const [highlightedAyahId, setHighlightedAyahId] = useState<string | null>(null);
  const [availableSize, setAvailableSize] = useState<{ width: number; height: number } | null>(null);
  const flatListRef = useRef<FlatList<number>>(null);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      if (
        !availableSize ||
        Math.abs(availableSize.width - width) > 1 ||
        Math.abs(availableSize.height - height) > 1
      ) {
        setAvailableSize({ width, height });
      }
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].item) {
        const newPage = viewableItems[0].item as number;
        setCurrentPage(newPage);
        setHighlightedAyahId(null);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handlePrevPage = () => {
    if (currentPage > 1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: currentPage - 2,
        animated: true,
      });
    }
  };

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: currentPage,
        animated: true,
      });
    }
  };

  const renderPageItem = useCallback(
    ({ item: pageNum }: { item: number }) => {
      if (!availableSize) return null;

      const imageAspect = 1024 / 1656;
      const paddingH = 16;
      const paddingV = 10;
      const maxW = availableSize.width - paddingH * 2;
      const maxH = availableSize.height - paddingV * 2;

      let displayW = 0;
      let displayH = 0;

      if (maxW / imageAspect <= maxH) {
        displayW = Math.floor(maxW);
        displayH = Math.floor(maxW / imageAspect);
      } else {
        displayH = Math.floor(maxH);
        displayW = Math.floor(maxH * imageAspect);
      }

      const scale = displayW / 1024;

      // Untuk halaman 3, gunakan data koordinat presisi
      const isPage3 = pageNum === 3;
      const pageData = isPage3 ? mockPage3Data : null;
      const selectedAyah = pageData?.ayahs.find(
        (a) => a.ayahId === highlightedAyahId
      );

      const handleLongPress = (event: GestureResponderEvent) => {
        if (!pageData || scale <= 0) return;
        const { locationX, locationY } = event.nativeEvent;
        const nativeX = locationX / scale;
        const nativeY = locationY / scale;

        const found = pageData.ayahs.find((ayah) =>
          ayah.rects.some(
            (r) =>
              nativeX >= r.minX - 8 &&
              nativeX <= r.maxX + 8 &&
              nativeY >= r.minY - 6 &&
              nativeY <= r.maxY + 6
          )
        );

        if (found) {
          setHighlightedAyahId(found.ayahId);
        }
      };

      const handlePress = () => {
        if (highlightedAyahId !== null) {
          setHighlightedAyahId(null);
        }
      };

      return (
        <View
          style={[
            styles.pageSlide,
            { width: availableSize.width, height: availableSize.height },
          ]}
        >
          <View
            style={[
              styles.mushafOuterFrame,
              { width: displayW + 10, height: displayH + 10 },
            ]}
          >
            <View
              style={[
                styles.mushafInnerFrame,
                { width: displayW + 4, height: displayH + 4 },
              ]}
            >
              <Pressable
                style={{ width: displayW, height: displayH }}
                onPress={handlePress}
                onLongPress={handleLongPress}
                delayLongPress={250}
              >
                {/* Gambar Halaman Mushaf (1024x1656) */}
                <Image
                  source={getPageImageSource(pageNum)}
                  style={{ width: displayW, height: displayH }}
                  contentFit="contain"
                  cachePolicy="disk"
                  transition={200}
                />

                {/* Highlight Overlays jika ada ayat terpilih di halaman ini */}
                {selectedAyah &&
                  selectedAyah.rects.map((rect, idx) => {
                    const left = rect.minX * scale;
                    const top = rect.minY * scale;
                    const width = (rect.maxX - rect.minX) * scale;
                    const height = (rect.maxY - rect.minY) * scale;

                    return (
                      <View
                        key={`highlight-${rect.line}-${idx}`}
                        pointerEvents="none"
                        style={[
                          styles.highlightRect,
                          {
                            left,
                            top,
                            width,
                            height,
                          },
                        ]}
                      />
                    );
                  })}
              </Pressable>
            </View>
          </View>
        </View>
      );
    },
    [availableSize, highlightedAyahId]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Mushaf Header Bar */}
      <View style={styles.topHeader}>
        <Text style={styles.headerText}>{getSurahNameForPage(currentPage)}</Text>

        {/* Navigasi Nomor Halaman */}
        <View style={styles.pageNavContainer}>
          <Pressable
            onPress={handleNextPage}
            disabled={currentPage >= TOTAL_PAGES}
            style={({ pressed }) => [
              styles.navButton,
              currentPage >= TOTAL_PAGES && styles.navButtonDisabled,
              pressed && styles.navButtonPressed,
            ]}
          >
            <ChevronLeft size={18} color={currentPage >= TOTAL_PAGES ? '#cbd5e1' : '#475569'} />
          </Pressable>

          <View style={styles.pageNumberBadge}>
            <Text style={styles.pageNumberBadgeText}>
              {toArabicDigits(currentPage)}
            </Text>
          </View>

          <Pressable
            onPress={handlePrevPage}
            disabled={currentPage <= 1}
            style={({ pressed }) => [
              styles.navButton,
              currentPage <= 1 && styles.navButtonDisabled,
              pressed && styles.navButtonPressed,
            ]}
          >
            <ChevronRight size={18} color={currentPage <= 1 ? '#cbd5e1' : '#475569'} />
          </Pressable>
        </View>

        <Text style={styles.headerText}>
          الجزء {toArabicDigits(getJuzForPage(currentPage))}
        </Text>
      </View>

      {/* Reading Area — Swipeable FlatList Paging (RTL Inverted) */}
      <View style={styles.readingArea} onLayout={handleLayout}>
        {availableSize && availableSize.width > 0 && (
          <FlatList
            ref={flatListRef}
            data={PAGES_DATA}
            keyExtractor={(item) => `page-${item}`}
            renderItem={renderPageItem}
            horizontal
            inverted
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={2} // Mulai dari Halaman 3
            getItemLayout={(_, index) => ({
              length: availableSize.width,
              offset: availableSize.width * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              flatListRef.current?.scrollToOffset({
                offset: info.index * availableSize.width,
                animated: false,
              });
            }}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            windowSize={3}
            maxToRenderPerBatch={2}
            removeClippedSubviews
          />
        )}
      </View>

      {/* Footer Navigasi / Halaman */}
      <View style={styles.footerBar}>
        <Text style={styles.footerPageText}>- {toArabicDigits(currentPage)} -</Text>
      </View>

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
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerText: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: 16,
    color: '#0f172a',
  },
  pageNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonPressed: {
    backgroundColor: '#e2e8f0',
  },
  pageNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  pageNumberBadgeText: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: 15,
    color: '#334155',
  },
  readingArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  pageSlide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mushafOuterFrame: {
    borderWidth: 1.5,
    borderColor: '#78716c',
    borderRadius: 4,
    padding: 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mushafInnerFrame: {
    borderWidth: 0.8,
    borderColor: '#78716c',
    borderRadius: 2,
    padding: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  highlightRect: {
    position: 'absolute',
    backgroundColor: 'rgba(76, 175, 80, 0.32)',
    borderRadius: 3,
  },
  footerBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  footerPageText: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: 14,
    color: '#94a3b8',
  },
});
