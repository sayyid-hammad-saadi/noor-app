import { useTranslation } from 'react-i18next';

import { Text, type TextProps } from '@/components/ui';
import { useNow } from '@/features/prayer/usePrayerTimes';
import { useLanguage } from '@/i18n';

import { countdownParts } from '../fastTimes';

/** "03:42:18" ticking every second. Isolated so only this text re-renders. */
export function LiveCountdown({
  target,
  label,
  prefix,
  ...text
}: Omit<TextProps, 'children'> & {
  target: Date;
  /** Spoken before the duration ("Iftar in"). */
  label: string;
  /** Shown before the time in the same line ("Iftar in 03:42:18"). */
  prefix?: string;
}) {
  const { t } = useTranslation();
  const { localizeDigits } = useLanguage();
  const now = useNow(1000);
  const [h, m, s] = countdownParts(now, target);
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = localizeDigits(`${pad(h)}:${pad(m)}:${pad(s)}`);
  return (
    <Text
      tabular
      accessibilityRole="timer"
      accessibilityLabel={t('ramadan.countdownA11y', {
        label,
        h: localizeDigits(h),
        m: localizeDigits(m),
      })}
      {...text}
    >
      {prefix ? t('ramadan.compactCountdown', { label: prefix, time }) : time}
    </Text>
  );
}
