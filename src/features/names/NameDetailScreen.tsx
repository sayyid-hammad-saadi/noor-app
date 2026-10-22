import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Copy, Heart, Image as ImageIcon, Play, Sparkle } from 'lucide-react-native';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, useToast } from '@/components/feedback';
import { GradientHeader, TopBar } from '@/components/layout';
import { Button, Icon, IconButton, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { routes } from '@/lib/routes';
import { makeStyles, useTheme } from '@/theme';

import { ShareCard } from './components/ShareCard';
import { nameFavorites, toggleFavorite } from './favorites';
import { getName, similarNames } from './names';
import { nameRoute } from './routes';
import { shareCard } from './share';
import { speakArabic } from './speech';

/** 23c Name detail: meaning, origin, pronunciation, the Quran verse and similar names. */
export default function NameDetailScreen() {
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const name = getName(id ?? '');
  const saved = nameFavorites.use().includes(id ?? '');
  const cardRef = useRef<View>(null);

  if (!name) {
    return (
      <View style={styles.root}>
        <TopBar title={t('names.title')} />
        <EmptyState icon={Sparkle} title={t('names.noMatch')} />
      </View>
    );
  }

  const meaning = t(`names.items.${name.id as 'nur'}`);
  const back = () => (router.canGoBack() ? router.back() : router.replace(routes.names));
  const tags = [
    t(`names.genders.${name.gender}`),
    t(`names.themes.${name.theme}`),
    name.syllables === 1
      ? t('names.oneSyllable')
      : t('names.syllableCount', { n: localizeDigits(name.syllables) }),
  ];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GradientHeader style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.topBar}>
            <IconButton
              icon={ChevronLeft}
              color="onHeader"
              flipInRTL
              accessibilityLabel={t('actions.back')}
              onPress={back}
            />
            <Touchable
              accessibilityRole="button"
              accessibilityState={{ selected: saved }}
              accessibilityLabel={saved ? t('names.unsave') : t('names.save')}
              onPress={() => toggleFavorite(name.id)}
              style={styles.heart}
            >
              <Icon icon={Heart} size={22} color="onHeader" filled={saved} />
            </Touchable>
          </View>
          <View style={styles.hero} accessible accessibilityRole="header">
            <Text script="quran" size={44} color="onHeader" align="center">
              {name.ar}
            </Text>
            <Text size={24} weight="700" color="onHeader" align="center" script="latin">
              {name.en}
            </Text>
            <Text script="bn" size={15} color="onHeader" align="center" style={styles.soft}>
              {name.bn}
            </Text>
          </View>
        </GradientHeader>

        <View style={styles.sheet}>
          <View style={styles.tags}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text variant="caption" weight="600" color="link">
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('names.hear')}
            onPress={() => speakArabic(name.ar)}
            style={[styles.card, styles.row, { boxShadow: shadows.card }]}
          >
            <View style={styles.play}>
              <Icon icon={Play} size={16} color="onBtn" filled />
            </View>
            <View style={styles.grow}>
              <Text variant="title" script="latin">
                {name.pron}
              </Text>
              <Text variant="caption">{t('names.hearCaption')}</Text>
            </View>
          </Touchable>

          <View style={[styles.card, styles.kv, { boxShadow: shadows.card }]}>
            {[
              [t('names.meaning'), meaning],
              [t('names.originLabel'), t(`names.origins.${name.origin}`)],
              ...(name.root ? [[t('names.rootLabel'), name.root.split('').join(' – ')]] : []),
            ].map(([k, value]) => (
              <View key={k} style={styles.kvRow}>
                <Text variant="label" weight="500" style={styles.kvKey}>
                  {k}
                </Text>
                <Text variant="body" weight="600" size={14} style={styles.grow}>
                  {value}
                </Text>
              </View>
            ))}
          </View>

          {name.verse ? (
            <View style={[styles.card, { boxShadow: shadows.card }]}>
              <Text variant="caption" weight="700" style={styles.eyebrow}>
                {t('names.inQuranTitle', { ref: localizeDigits(name.verse.ref) })}
              </Text>
              <Text script="quran" size={24} align="right">
                {name.verse.arabic}
              </Text>
              {language !== 'ar' ? (
                <Text size={14}>{language === 'bn' ? name.verse.bn : name.verse.en}</Text>
              ) : null}
            </View>
          ) : null}

          <Text variant="section" style={styles.section}>
            {t('names.similar')}
          </Text>
          <View style={styles.similar}>
            {similarNames(name).map((n) => (
              <Touchable
                key={n.id}
                accessibilityRole="link"
                accessibilityLabel={n.en}
                onPress={() => router.replace(nameRoute(n.id))}
                style={styles.sim}
              >
                <Text script="quran" size={20} color="link">
                  {n.ar}
                </Text>
                <Text variant="bodyStrong" size={14} script="latin">
                  {n.en}
                </Text>
              </Touchable>
            ))}
          </View>
          <Text variant="caption" style={styles.note}>
            {t('names.meaningNote')}
          </Text>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          label={t('names.copy')}
          icon={Copy}
          variant="secondary"
          grow
          onPress={() => {
            void Clipboard.setStringAsync(`${name.en} (${name.ar}) · ${meaning}`);
            toast.show({ message: t('names.copied'), icon: Copy });
          }}
        />
        <Button
          label={t('names.shareCard')}
          icon={ImageIcon}
          style={styles.shareBtn}
          onPress={() =>
            void shareCard(
              cardRef,
              t('names.shareText', { name: name.en, arabic: name.ar, meaning }),
            )
          }
        />
      </View>
      <ShareCard ref={cardRef} name={name} />
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.bg },
    scroll: { flexGrow: 1 },
    header: { paddingBottom: 24 + t.space.xl },
    topBar: {
      minHeight: t.size.topBar,
      paddingHorizontal: t.space.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heart: {
      width: t.size.touch,
      height: t.size.touch,
      borderRadius: t.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hero: { alignItems: 'center', gap: 2, paddingHorizontal: t.size.gutter },
    soft: { opacity: 0.92 },
    sheet: {
      flex: 1,
      marginTop: -24,
      paddingTop: t.space.lg,
      paddingHorizontal: t.size.gutter,
      paddingBottom: t.space.xxl,
      gap: 10,
      backgroundColor: t.colors.bg,
      borderTopStartRadius: 24,
      borderTopEndRadius: 24,
    },
    tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
    tag: {
      minHeight: 28,
      paddingHorizontal: 10,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.tint,
      justifyContent: 'center',
    },
    card: {
      padding: t.space.lg,
      gap: t.space.xs,
      borderRadius: t.radius.card,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.edge,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    play: {
      width: t.size.touch,
      height: t.size.touch,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.btn,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grow: { flex: 1 },
    kv: { gap: t.space.sm },
    kvRow: { flexDirection: 'row', gap: t.space.md },
    kvKey: { width: 92 },
    eyebrow: { letterSpacing: 0.6 },
    section: { marginTop: t.space.xs },
    similar: { flexDirection: 'row', gap: t.space.sm },
    sim: {
      flex: 1,
      padding: 10,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.surface2,
      alignItems: 'center',
    },
    note: { marginTop: t.space.xs },
    footer: {
      paddingTop: t.space.md,
      paddingHorizontal: t.size.gutter,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      backgroundColor: t.colors.surface,
      flexDirection: 'row',
      gap: 10,
    },
    shareBtn: { flex: 1.6 },
  }),
);
