import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { List, ListRow, OctagonBadge, SearchField, Text } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { stripTashkeel, toAsciiDigits } from '../data/digits';
import type { Ayah } from '../data/quranApi';
import { type Surah, surahName } from '../data/surahs';

/** Find an ayah in the open surah by number, Arabic, transliteration or translation. */
export function ReaderSearchSheet({
  visible,
  surah,
  ayahs,
  onClose,
  onSelect,
}: {
  visible: boolean;
  surah: Surah;
  ayahs: Ayah[];
  onClose: () => void;
  onSelect: (ayah: number) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const { language, localizeDigits } = useLanguage();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = stripTashkeel(toAsciiDigits(query.trim().toLowerCase()));
    if (!q) return [];
    const num = Number(q);
    if (Number.isInteger(num) && num > 0) return ayahs.filter((a) => a.number === num);
    return ayahs
      .filter((a) =>
        [stripTashkeel(a.arabic), a.transliteration, a.en, a.bn].some((s) =>
          s.toLowerCase().includes(q),
        ),
      )
      .slice(0, 50);
  }, [query, ayahs]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('quran.search.title', { surah: surahName(surah, language) })}
    >
      <SearchField
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        placeholder={t('quran.search.placeholder')}
        autoFocus
      />
      {query ? (
        <Text variant="caption">
          {results.length
            ? t('quran.search.results', { count: results.length })
            : t('quran.search.none')}
        </Text>
      ) : null}
      <ScrollView
        style={{ maxHeight: height * 0.45 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
      >
        {results.length ? (
          <List>
            {results.map((a) => (
              <ListRow
                key={a.number}
                title={t('quran.search.goTo', { ayah: localizeDigits(a.number) })}
                caption={(language === 'bn' ? a.bn : a.en).slice(0, 120)}
                leading={<OctagonBadge value={a.number} size={34} />}
                trailing="chevron"
                onPress={() => {
                  onSelect(a.number);
                  setQuery('');
                }}
              />
            ))}
          </List>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) => StyleSheet.create({ list: { paddingBottom: t.space.sm } }));
