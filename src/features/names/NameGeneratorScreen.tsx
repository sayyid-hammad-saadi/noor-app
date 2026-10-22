import { useRouter } from 'expo-router';
import { Check, ChevronDown, Heart, Shuffle } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/feedback';
import { TopBar } from '@/components/layout';
import {
  Badge,
  Button,
  Chip,
  Icon,
  IconButton,
  SegmentedControl,
  Text,
  Touchable,
} from '@/components/ui';
import { useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { makeStyles } from '@/theme';

import { NameCard } from './components/NameCard';
import { ShareCard } from './components/ShareCard';
import { nameFavorites, toggleFavorite } from './favorites';
import {
  type Gender,
  type IslamicName,
  NAMES,
  type NameTheme,
  startingLetters,
  THEMES,
} from './names';
import { nameRoute } from './routes';
import { shareCard } from './share';

type Syllables = 'any' | '1' | '2' | '3';

function matches(
  n: IslamicName,
  gender: Gender,
  themes: NameTheme[],
  letter: string | null,
  syl: Syllables,
) {
  // Unisex names suit either gender.
  if (n.gender !== gender && n.gender !== 'unisex') return false;
  if (themes.length && !themes.includes(n.theme)) return false;
  if (letter && n.en.replace(/^'/, '')[0]!.toUpperCase() !== letter) return false;
  if (syl === '1' && n.syllables !== 1) return false;
  if (syl === '2' && n.syllables !== 2) return false;
  if (syl === '3' && n.syllables < 3) return false;
  return true;
}

const pick = <T,>(list: readonly T[], not?: T): T | null => {
  const pool = list.length > 1 ? list.filter((x) => x !== not) : list;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
};

/** 23a Islamic name generator with gender, theme, letter and syllable filters. */
export default function NameGeneratorScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const favorites = nameFavorites.use();
  const [gender, setGender] = useState<Gender>('male');
  const [themes, setThemes] = useState<NameTheme[]>(['quranic']);
  const [letter, setLetter] = useState<string | null>(null);
  const [syllables, setSyllables] = useState<Syllables>('any');
  const [letterOpen, setLetterOpen] = useState(false);
  const pool = useMemo(
    () => NAMES.filter((n) => matches(n, gender, themes, letter, syllables)),
    [gender, themes, letter, syllables],
  );
  const [current, setCurrent] = useState<IslamicName | null>(() =>
    pick(NAMES.filter((n) => matches(n, 'male', ['quranic'], null, 'any'))),
  );
  const shown = current && pool.includes(current) ? current : null;
  const cardRef = useRef<View>(null);

  const toggleTheme = (th: NameTheme) =>
    setThemes((list) => (list.includes(th) ? list.filter((x) => x !== th) : [...list, th]));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        title={t('names.title')}
        right={
          <View>
            <IconButton
              icon={Heart}
              size={22}
              accessibilityLabel={t('names.favorites', { n: localizeDigits(favorites.length) })}
              onPress={() => router.push(routes.nameFavorites)}
            />
            {favorites.length ? (
              <View style={styles.badge} pointerEvents="none">
                <Badge count={favorites.length} />
              </View>
            ) : null}
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <SegmentedControl<Gender>
          value={gender}
          onChange={setGender}
          accessibilityLabel={t('names.gender')}
          options={(['male', 'female', 'unisex'] as const).map((g) => ({
            value: g,
            label: t(`names.genders.${g}`),
          }))}
        />

        <Text variant="label" style={styles.label}>
          {t('names.theme')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsWrap}
          contentContainerStyle={styles.chips}
        >
          {THEMES.map((th) => (
            <Chip
              key={th}
              label={t(`names.themes.${th}`)}
              selected={themes.includes(th)}
              onPress={() => toggleTheme(th)}
            />
          ))}
        </ScrollView>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text variant="label">{t('names.letter')}</Text>
            <Touchable
              accessibilityRole="button"
              onPress={() => setLetterOpen(true)}
              style={styles.select}
            >
              <Text variant="bodyStrong" style={styles.grow}>
                {letter ?? t('names.any')}
              </Text>
              <Icon icon={ChevronDown} size={18} color="text2" />
            </Touchable>
          </View>
          <View style={styles.col}>
            <Text variant="label">{t('names.syllables')}</Text>
            <SegmentedControl<Syllables>
              value={syllables}
              onChange={setSyllables}
              accessibilityLabel={t('names.syllables')}
              options={[
                { value: 'any', label: t('names.anyShort') },
                { value: '1', label: localizeDigits(1) },
                { value: '2', label: localizeDigits(2) },
                { value: '3', label: `${localizeDigits(3)}+` },
              ]}
            />
          </View>
        </View>

        <Button
          label={t('names.generate')}
          icon={Shuffle}
          size="lg"
          disabled={!pool.length}
          onPress={() => setCurrent(pick(pool, shown ?? undefined))}
          style={styles.generate}
        />

        {shown ? (
          <View style={styles.card}>
            <NameCard
              name={shown}
              saved={favorites.includes(shown.id)}
              onToggleSave={() => toggleFavorite(shown.id)}
              onShare={() =>
                void shareCard(
                  cardRef,
                  t('names.shareText', {
                    name: shown.en,
                    arabic: shown.ar,
                    meaning: t(`names.items.${shown.id as 'nur'}`),
                  }),
                )
              }
              onDetails={() => router.push(nameRoute(shown.id))}
            />
            <ShareCard ref={cardRef} name={shown} />
          </View>
        ) : (
          <Text variant="subtle" align="center" style={styles.empty}>
            {pool.length ? '' : t('names.noMatch')}
          </Text>
        )}
        <Text variant="caption" align="center" style={styles.note}>
          {t('names.meaningNote')}
        </Text>
      </ScrollView>

      <BottomSheet
        visible={letterOpen}
        onClose={() => setLetterOpen(false)}
        title={t('names.letter')}
      >
        <View style={styles.letters}>
          {[null, ...startingLetters()].map((l) => (
            <Touchable
              key={l ?? 'any'}
              accessibilityRole="radio"
              accessibilityState={{ checked: letter === l }}
              onPress={() => {
                setLetter(l);
                setLetterOpen(false);
              }}
              style={[
                styles.letter,
                l === null && styles.letterAny,
                letter === l && styles.letterOn,
              ]}
            >
              {letter === l ? <Icon icon={Check} size={14} color="onBtn" strokeWidth={3} /> : null}
              <Text variant="bodyStrong" color={letter === l ? 'onBtn' : 'text'} script="latin">
                {l ?? t('names.any')}
              </Text>
            </Touchable>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    body: { paddingHorizontal: t.size.gutter, paddingTop: t.space.sm, paddingBottom: t.space.xxl },
    badge: { position: 'absolute', top: 2, end: 0 },
    label: { marginTop: 14 },
    chipsWrap: { marginTop: 6, marginHorizontal: -t.size.gutter },
    chips: { paddingHorizontal: t.size.gutter, gap: t.space.sm },
    row: { marginTop: t.space.md, flexDirection: 'row', gap: 10 },
    col: { flex: 1, gap: 6 },
    select: {
      minHeight: t.size.segment,
      paddingHorizontal: 14,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.ctl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.sm,
    },
    grow: { flex: 1 },
    generate: { marginTop: t.space.lg },
    card: { marginTop: 14 },
    empty: { marginTop: t.space.xl },
    note: { marginTop: t.space.lg },
    letters: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm, paddingBottom: t.space.md },
    letter: {
      minWidth: 48,
      minHeight: t.size.touch,
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.xs,
    },
    letterAny: { paddingHorizontal: t.space.lg },
    letterOn: { backgroundColor: t.colors.btn },
  }),
);
