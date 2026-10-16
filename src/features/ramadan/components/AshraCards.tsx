import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text, Touchable } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

import { ASHRA_AR } from '../content';
import { ASHRAS, type AshraKey, ashraDays, ashraOf, type RamadanInfo } from '../ramadanCalendar';

/** The three ashra: past ones ticked, the current one solid with a NOW badge. */
export function AshraCards({
  info,
  onOpen,
}: {
  info: RamadanInfo;
  onOpen: (key: AshraKey) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { shadows } = useTheme();
  const { language, localizeDigits } = useLanguage();
  const current = info.day !== null ? ashraOf(info.day) : null;
  const currentIndex = current ? ASHRAS.indexOf(current) : -1;

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text variant="title" accessibilityRole="header" style={styles.shrink}>
          {t('ramadan.ashraTitle')}
        </Text>
        <Text variant="caption">{t('ramadan.ashraEach')}</Text>
      </View>
      <View style={styles.row}>
        {ASHRAS.map((key, i) => {
          const state = i === currentIndex ? 'now' : i < currentIndex ? 'past' : 'next';
          const [from, to] = ashraDays(key, info.length);
          const days = t('ramadan.ashraDays', {
            from: localizeDigits(from),
            to: localizeDigits(to),
          });
          const name = t(`ramadan.ashra.${key}.name`);
          const sub =
            state === 'now' && info.day !== null
              ? t('ramadan.ashraCardDay', { days, n: localizeDigits(info.day - from + 1) })
              : t('ramadan.ashraCardSub', { days, meaning: t(`ramadan.ashra.${key}.meaning`) });
          const fg = state === 'now' ? 'onBtn' : undefined;
          return (
            <Touchable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected: state === 'now' }}
              accessibilityLabel={`${state === 'past' ? t('ramadan.ashraDone', { name }) : name}, ${sub}`}
              onPress={() => onOpen(key)}
              style={[
                styles.card,
                styles[state],
                state === 'now' ? { boxShadow: shadows.card } : null,
              ]}
            >
              <View style={styles.top}>
                {language !== 'ar' ? (
                  <Text
                    script="ar"
                    size={15}
                    weight="600"
                    color={fg ?? (state === 'past' ? 'link' : 'text2')}
                  >
                    {ASHRA_AR[key]}
                  </Text>
                ) : (
                  <View />
                )}
                {state === 'past' ? (
                  <Icon icon={Check} size={16} color="link" strokeWidth={2.5} />
                ) : state === 'now' ? (
                  <View style={styles.badge}>
                    <Text size={10} weight="700" color="onGold" maxFontSizeMultiplier={1.2}>
                      {t('ramadan.now')}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text size={15} weight="700" color={fg}>
                {name}
              </Text>
              <Text
                size={11}
                weight="500"
                color={fg ?? 'text2'}
                style={state === 'now' && styles.soft}
              >
                {sub}
              </Text>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    section: { gap: 10 },
    head: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: t.space.sm,
    },
    shrink: { flexShrink: 1 },
    row: { flexDirection: 'row', gap: t.space.sm },
    card: {
      flex: 1,
      minWidth: 0,
      paddingVertical: t.space.md,
      paddingHorizontal: 10,
      borderRadius: t.radius.card,
      gap: t.space.xxs,
    },
    past: { backgroundColor: t.colors.tint },
    now: { backgroundColor: t.colors.btn },
    next: { backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
    top: {
      minHeight: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badge: {
      minHeight: 18,
      paddingHorizontal: 6,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.gold,
      justifyContent: 'center',
    },
    soft: { opacity: 0.9 },
  }),
);
