import { useRouter } from 'expo-router';
import { ArrowRight, Info, Languages } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IslamicPattern } from '@/components/layout';
import { Button, Icon, Radio, Text, Touchable } from '@/components/ui';
import { i18n, LANGUAGES, type Language, languageMeta, useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { makeStyles, useTheme } from '@/theme';

/** 02 Language select. Picking an option previews the screen in that language. */
export default function LanguageScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [selected, setSelected] = useState<Language>(language);
  const [saving, setSaving] = useState(false);

  // Preview copy in the highlighted language before it is applied app-wide.
  const t = useMemo(() => i18n.getFixedT(selected), [selected]);
  const script = languageMeta[selected].script;
  const others = LANGUAGES.filter((l) => l !== selected);

  const onContinue = async () => {
    setSaving(true);
    // Switching to or from Arabic reloads the app to flip the layout; the splash then
    // continues to onboarding because the language is now stored.
    await setLanguage(selected);
    router.replace(routes.onboarding);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.patternBox} pointerEvents="none">
        <IslamicPattern id="lang-star" color="primary" fadeOut />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <View style={styles.badge}>
            <Icon icon={Languages} size={32} color="primary" />
          </View>
          <View style={styles.titles}>
            <Text variant="h1" script={script} align="center" accessibilityRole="header">
              {t('language.title')}
            </Text>
            {others.map((l) => (
              <Text key={l} variant="subtle" script={languageMeta[l].script} align="center">
                {i18n.getFixedT(l)('language.title')}
              </Text>
            ))}
          </View>
        </View>

        <View
          style={styles.options}
          accessibilityRole="radiogroup"
          accessibilityLabel={t('language.groupLabel')}
        >
          {LANGUAGES.map((l) => (
            <LanguageOption
              key={l}
              language={l}
              exonym={t(`language.names.${l}`)}
              selected={l === selected}
              onPress={() => setSelected(l)}
            />
          ))}
        </View>

        <View style={styles.note}>
          <Icon icon={Info} size={16} color="text2" />
          <Text variant="label" weight="400" script={script} style={styles.noteText}>
            {t('language.note')}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          size="lg"
          label={t('language.continue')}
          icon={ArrowRight}
          iconPosition="end"
          iconFlipInRTL
          loading={saving}
          onPress={onContinue}
        />
      </View>
    </SafeAreaView>
  );
}

function LanguageOption({
  language,
  exonym,
  selected,
  onPress,
}: {
  language: Language;
  exonym: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { shadows } = useTheme();
  const meta = languageMeta[language];
  return (
    <Touchable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${meta.nativeName}, ${exonym}`}
      onPress={onPress}
      style={[styles.option, { boxShadow: shadows.card }, selected && styles.optionOn]}
    >
      <View style={[styles.glyph, selected && styles.glyphOn]}>
        <Text
          script={meta.script}
          size={meta.script === 'latin' ? 18 : 22}
          weight={meta.script === 'latin' ? '700' : '600'}
          color={selected ? 'onBtn' : 'text'}
          maxFontSizeMultiplier={1.2}
        >
          {meta.glyph}
        </Text>
      </View>
      <View style={styles.optionText}>
        <Text script={meta.script} size={17} weight="600">
          {meta.nativeName}
        </Text>
        <Text variant="caption">
          {exonym} ·{' '}
          <Text variant="caption" script={meta.script}>
            {meta.numeralSample}
          </Text>
        </Text>
      </View>
      <Radio selected={selected} />
    </Touchable>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    patternBox: { position: 'absolute', top: 0, start: 0, end: 0, height: 320 },
    scroll: { flex: 1 },
    body: { paddingHorizontal: t.space.xxl, paddingTop: 50, paddingBottom: t.space.lg },
    head: { alignItems: 'center', gap: t.space.lg },
    badge: {
      width: 72,
      height: 72,
      borderRadius: t.space.xxl,
      backgroundColor: t.colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titles: { alignItems: 'center', gap: 6 },
    options: { marginTop: t.space.xxxl, gap: t.space.md },
    option: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.lg,
      paddingStart: t.space.lg,
      paddingEnd: t.space.xl,
      paddingVertical: t.space.sm,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.border,
    },
    optionOn: { backgroundColor: t.colors.tint, borderColor: t.colors.primary },
    glyph: {
      width: 44,
      height: 44,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glyphOn: { backgroundColor: t.colors.btn },
    optionText: { flex: 1, minWidth: 0 },
    note: {
      marginTop: t.space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    noteText: { flexShrink: 1, textAlign: 'center' },
    footer: { paddingHorizontal: t.space.xxl, paddingBottom: t.space.sm, paddingTop: t.space.md },
  }),
);
