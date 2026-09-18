import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Share2, Languages, Play } from 'lucide-react-native';

interface AyahToolbarProps {
  ayahId: string;
}

export function AyahToolbar({ ayahId }: AyahToolbarProps) {
  const insets = useSafeAreaInsets();

  const handleBookmark = () => {
    console.log(`[AyahToolbar] Bookmark pressed for ayah: ${ayahId}`);
  };

  const handleShare = () => {
    console.log(`[AyahToolbar] Share pressed for ayah: ${ayahId}`);
  };

  const handleLanguages = () => {
    console.log(`[AyahToolbar] Languages / Translation pressed for ayah: ${ayahId}`);
  };

  const handlePlay = () => {
    console.log(`[AyahToolbar] Play audio pressed for ayah: ${ayahId}`);
  };

  return (
    <View
      style={[
        styles.container,
        { bottom: Math.max(insets.bottom + 16, 28) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.toolbar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Ayat {ayahId}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePlay}
            activeOpacity={0.7}
            accessibilityLabel="Play ayah audio"
          >
            <Play size={20} color="#16a34a" fill="#16a34a" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBookmark}
            activeOpacity={0.7}
            accessibilityLabel="Bookmark ayah"
          >
            <Bookmark size={20} color="#334155" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLanguages}
            activeOpacity={0.7}
            accessibilityLabel="View translation"
          >
            <Languages size={20} color="#334155" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityLabel="Share ayah"
          >
            <Share2 size={20} color="#334155" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
