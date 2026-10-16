import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet, useToast } from '@/components/feedback';
import { Button } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { fontFamily, makeStyles, useTheme } from '@/theme';

import { noteKey, notes } from '../data/library';
import { type Surah, surahName } from '../data/surahs';

/** Personal note for one ayah, stored on the device. */
export function NoteSheet({
  surah,
  ayah,
  onClose,
}: {
  surah: Surah;
  ayah: number | null;
  onClose: () => void;
}) {
  return ayah === null ? null : (
    <NoteEditor key={`${surah.number}:${ayah}`} surah={surah} ayah={ayah} onClose={onClose} />
  );
}

function NoteEditor({ surah, ayah, onClose }: { surah: Surah; ayah: number; onClose: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const toast = useToast();
  const { colors } = useTheme();
  const { language, script, localizeDigits } = useLanguage();
  const key = noteKey(surah.number, ayah);
  const existing = notes.get()[key] ?? '';
  const [text, setText] = useState(existing);

  const save = () => {
    notes.set((all) => {
      const next = { ...all };
      if (text.trim()) next[key] = text.trim();
      else delete next[key];
      return next;
    });
    toast.show({ message: t('quran.note.saved') });
    onClose();
  };

  return (
    <BottomSheet
      visible
      onClose={onClose}
      title={t('quran.note.title', {
        surah: surahName(surah, language),
        ayah: localizeDigits(ayah),
      })}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('quran.note.placeholder')}
        placeholderTextColor={colors.text2}
        multiline
        autoFocus
        accessibilityLabel={t('quran.actions.note')}
        style={[styles.input, { fontFamily: fontFamily(script, '400') }]}
      />
      <View style={styles.actions}>
        {existing ? (
          <Button
            label={t('quran.note.delete')}
            variant="destructive"
            size="sm"
            grow
            onPress={() => {
              setText('');
              notes.set((all) => {
                const next = { ...all };
                delete next[key];
                return next;
              });
              onClose();
            }}
          />
        ) : null}
        <Button label={t('quran.note.save')} size="sm" grow onPress={save} />
      </View>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    input: {
      minHeight: 120,
      maxHeight: 240,
      padding: t.space.md,
      borderRadius: t.radius.lg,
      borderWidth: 1.5,
      borderColor: t.colors.ctl,
      backgroundColor: t.colors.surface,
      color: t.colors.text,
      fontSize: 16,
      textAlignVertical: 'top',
    },
    actions: { flexDirection: 'row', gap: t.space.sm },
  }),
);
