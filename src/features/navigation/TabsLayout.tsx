import { type BottomTabBarProps, Tabs } from 'expo-router/tabs';
import { BookOpen, House, LayoutGrid, type LucideIcon, MoonStar, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { TabBar } from '@/components/layout';

export type TabKey = 'home' | 'quran' | 'ramadan' | 'explore' | 'profile';

const TABS: readonly { key: TabKey; icon: LucideIcon }[] = [
  { key: 'home', icon: House },
  { key: 'quran', icon: BookOpen },
  { key: 'ramadan', icon: MoonStar },
  { key: 'explore', icon: LayoutGrid },
  { key: 'profile', icon: User },
];

/** Main tab navigator, drawn with the shared TabBar. */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <RouterTabBar {...props} />}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.key} name={tab.key} />
      ))}
    </Tabs>
  );
}

function RouterTabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const active = state.routes[state.index];
  return (
    <TabBar<TabKey>
      activeKey={(active?.name ?? 'home') as TabKey}
      items={TABS.map((tab) => ({ ...tab, label: t(`tabs.${tab.key}`) }))}
      onPress={(key) => {
        const route = state.routes.find((r) => r.name === key);
        if (!route) return;
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented && active?.name !== key) navigation.navigate(route.name);
      }}
    />
  );
}
