import { Hourglass } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/feedback';
import { Screen, TopBar } from '@/components/layout';
import type { TabKey } from '@/features/navigation/TabsLayout';

/** Placeholder for tabs whose screens arrive in later batches. */
export function ComingSoonScreen({ tab }: { tab: Exclude<TabKey, 'home'> }) {
  const { t } = useTranslation();
  return (
    <Screen edges={['top']} header={<TopBar title={t(`tabs.${tab}`)} onBack={null} />}>
      <EmptyState icon={Hourglass} title={t('placeholder.title')} body={t('placeholder.body')} />
    </Screen>
  );
}
