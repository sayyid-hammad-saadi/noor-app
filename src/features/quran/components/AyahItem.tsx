import { memo } from 'react';
import { StyleSheet } from 'react-native';

import { Text, Touchable } from '@/components/ui';
import { localizeDigits } from '@/i18n';
import { makeStyles } from '@/theme';

import type { Ayah } from '../data/quranApi';
import type { ReadingPrefs } from '../data/library';

/** One ayah in the reader: Arabic with its end marker, then the chosen lines below. */
export const AyahItem = memo(function AyahItem({
  ayah,
  prefs,
  playing,
  onPress,
}: {
  ayah: Ayah;
  prefs: ReadingPrefs;
  playing: boolean;
  onPress: (ayah: Ayah) => void;
}) {
  const styles = useStyles();
  const n = ayah.number;
  return (
    <Touchable
      accessibilityRole="button"
      onPress={() => onPress(ayah)}
      onLongPress={() => onPress(ayah)}
      pressedOpacity={0.85}
      style={[styles.root, playing && styles.playing]}
      accessibilityState={{ selected: playing }}
    >
      <Text script="quran" size={prefs.arabicSize} align="right" maxFontSizeMultiplier={1.3}>
        {ayah.arabic}
        <Text script="quran" size={prefs.arabicSize * 0.8} color="link">
          {` ﴿${localizeDigits(n, 'ar')}﴾`}
        </Text>
      </Text>
      {prefs.transliteration && ayah.transliteration ? (
        <Text script="latin" variant="body" weight="500" color="link">
          {ayah.transliteration}
        </Text>
      ) : null}
      {prefs.english && ayah.en ? (
        <Text script="latin" variant="subtle">
          {`${n}. ${ayah.en}`}
        </Text>
      ) : null}
      {prefs.bangla && ayah.bn ? (
        <Text script="bn" variant="subtle">
          {`${localizeDigits(n, 'bn')}. ${ayah.bn}`}
        </Text>
      ) : null}
    </Touchable>
  );
});

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: {
      paddingTop: 14,
      paddingBottom: t.space.lg,
      paddingHorizontal: t.size.gutter,
      gap: 6,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    playing: { backgroundColor: t.colors.tint },
  }),
);
