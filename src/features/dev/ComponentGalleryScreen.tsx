import { BookOpen, Clock, House, LayoutGrid, Moon, Bookmark, User } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Banner, BottomSheet, Skeleton, Toast, useToast } from '@/components/feedback';
import { GradientHeader, Logo, Screen, TabBar, TopBar } from '@/components/layout';
import { MiniPlayer } from '@/components/media';
import {
  AyahMarker,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  Dot,
  GradeChip,
  IconTile,
  List,
  ListRow,
  OctagonBadge,
  Radio,
  SearchField,
  SectionHeader,
  SegmentedControl,
  Stepper,
  Switch,
  Text,
  TextField,
  UnderlineTabs,
} from '@/components/ui';
import { type Language, useLanguage } from '@/i18n';
import { type Appearance, makeStyles, useThemeContext } from '@/theme';

type QuranTab = 'surah' | 'para' | 'bookmarks';
type LibraryTab = 'quran' | 'hadith' | 'names';
type MainTab = 'home' | 'quran' | 'ramadan' | 'explore' | 'profile';

/**
 * Developer preview of the shared components (design board 35), with live language and
 * appearance switches to check light/dark, Bangla/English/Arabic and RTL.
 */
export default function ComponentGalleryScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language, setLanguage, formatNumber, localizeDigits } = useLanguage();
  const { appearance, setAppearance } = useThemeContext();
  const toast = useToast();

  const [toggle, setToggle] = useState(true);
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState(0);
  const [quranTab, setQuranTab] = useState<QuranTab>('surah');
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('quran');
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const [offset, setOffset] = useState(2);
  const [query, setQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [playing, setPlaying] = useState(true);

  return (
    <Screen
      scroll
      edges={['top']}
      header={<TopBar title={t('gallery.title')} subtitle={t('gallery.subtitle')} onBack={null} />}
      footer={
        <TabBar
          activeKey={mainTab}
          onPress={setMainTab}
          items={[
            { key: 'home', label: t('tabs.home'), icon: House },
            { key: 'quran', label: t('tabs.quran'), icon: BookOpen },
            { key: 'ramadan', label: t('tabs.ramadan'), icon: Moon },
            { key: 'explore', label: t('tabs.explore'), icon: LayoutGrid },
            { key: 'profile', label: t('tabs.profile'), icon: User },
          ]}
        />
      }
    >
      <SectionHeader title={t('gallery.language')} />
      <SegmentedControl<Language>
        value={language}
        onChange={(l) => void setLanguage(l)}
        options={[
          { value: 'bn', label: 'বাংলা' },
          { value: 'en', label: 'English' },
          { value: 'ar', label: 'العربية' },
        ]}
      />
      <SectionHeader title={t('gallery.appearance')} />
      <SegmentedControl<Appearance>
        value={appearance}
        onChange={setAppearance}
        options={[
          { value: 'system', label: t('appearance.system') },
          { value: 'light', label: t('appearance.light') },
          { value: 'dark', label: t('appearance.dark') },
        ]}
      />

      <SectionHeader title={t('appName')} kind="content" />
      <GradientHeader style={styles.hero}>
        <Logo size={72} accessibilityLabel={t('appName')} />
        <Text variant="h1" color="onHeader">
          {t('appName')}
        </Text>
        <Text variant="caption" color="onHeader">
          {t('tagline')}
        </Text>
      </GradientHeader>

      <SectionHeader title={t('gallery.buttons')} kind="content" />
      <View style={styles.stack}>
        <Button label={t('gallery.primary')} onPress={() => undefined} />
        <Button label={t('gallery.secondary')} variant="secondary" onPress={() => undefined} />
        <View style={styles.row}>
          <Button label={t('gallery.ghost')} variant="ghost" grow />
          <Button label={t('gallery.disabled')} disabled grow />
        </View>
        <View style={styles.row}>
          <Button label={t('gallery.small')} size="sm" grow />
          <Button label={t('gallery.destructive')} size="sm" variant="destructive" grow />
        </View>
      </View>

      <SectionHeader title={t('gallery.chips')} kind="content" />
      <View style={styles.wrap}>
        <Chip label={t('gallery.chipDefault')} onPress={() => undefined} />
        <Chip label={t('gallery.chipSelected')} selected onPress={() => undefined} />
        <Chip label={t('gallery.chipTint')} tint />
        <Badge count={7} />
        <Dot />
      </View>
      <View style={[styles.wrap, styles.gapTop]}>
        <GradeChip grade="sahih" />
        <GradeChip grade="hasan" />
        <GradeChip grade="daif" />
      </View>

      <SectionHeader title={t('gallery.selection')} kind="content" />
      <View style={styles.wrap}>
        <Switch
          value={toggle}
          onValueChange={setToggle}
          accessibilityLabel={t('gallery.toggleRow')}
        />
        <Checkbox
          checked={checked}
          onChange={setChecked}
          accessibilityLabel={t('gallery.chipSelected')}
        />
        <Stepper
          value={localizeDigits(offset > 0 ? `+${offset}` : `${offset}`)}
          onIncrement={() => setOffset((v) => v + 1)}
          onDecrement={() => setOffset((v) => v - 1)}
          accessibilityLabel={t('gallery.number')}
        />
      </View>
      <View style={styles.gapTop}>
        <SegmentedControl<QuranTab>
          value={quranTab}
          onChange={setQuranTab}
          options={[
            { value: 'surah', label: t('gallery.surah') },
            { value: 'para', label: t('gallery.para') },
            { value: 'bookmarks', label: t('gallery.bookmarks') },
          ]}
        />
      </View>
      <View style={styles.gapTop}>
        <UnderlineTabs<LibraryTab>
          value={libraryTab}
          onChange={setLibraryTab}
          options={[
            { value: 'quran', label: t('tabs.quran') },
            { value: 'hadith', label: t('gallery.hadith') },
            { value: 'names', label: t('gallery.names') },
          ]}
        />
      </View>

      <SectionHeader title={t('gallery.fields')} kind="content" />
      <View style={styles.stack}>
        <TextField
          label={t('gallery.email')}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label={t('gallery.amount')}
          defaultValue={formatNumber(325000)}
          keyboardType="numeric"
          prefix={
            <Text variant="bodyStrong" color="text2">
              ৳
            </Text>
          }
        />
        <TextField
          label={t('gallery.email')}
          defaultValue="rafiq@"
          error={t('gallery.emailError')}
        />
        <SearchField value={query} onChangeText={setQuery} onClear={() => setQuery('')} />
      </View>

      <SectionHeader title={t('gallery.lists')} />
      <List>
        <ListRow
          title={t('gallery.navRow')}
          caption={t('gallery.navRowCaption')}
          leading={<IconTile icon={Clock} size="sm" />}
          trailing="chevron"
          onPress={() => undefined}
        />
        <ListRow
          title={t('gallery.toggleRow')}
          caption={t('gallery.toggleRowCaption')}
          trailing={
            <Switch
              value={toggle}
              onValueChange={setToggle}
              accessibilityLabel={t('gallery.toggleRow')}
            />
          }
        />
        <ListRow title={t('gallery.valueRow')} trailing={t('gallery.valueRowValue')} />
        {[0, 1].map((i) => (
          <ListRow
            key={i}
            title={`${t('gallery.surah')} ${formatNumber(i + 1)}`}
            leading={<Radio selected={radio === i} />}
            trailing={<OctagonBadge value={i === 0 ? 1 : 114} />}
            accessibilityRole="radio"
            accessibilityState={{ checked: radio === i }}
            onPress={() => setRadio(i)}
          />
        ))}
      </List>

      <SectionHeader title={t('gallery.cards')} kind="content" />
      <View style={styles.stack}>
        <Card>
          <Text variant="bodyStrong">{t('gallery.standardCard')}</Text>
        </Card>
        <Card variant="active">
          <Text variant="bodyStrong">{t('gallery.activeCard')}</Text>
        </Card>
        <Card variant="gold">
          <View style={styles.rowCenter}>
            <IconTile icon={Bookmark} tone="gold" size="sm" />
            <Text variant="bodyStrong">{t('gallery.goldCard')}</Text>
          </View>
        </Card>
        <Card>
          <Text script="quran" size={26} align="right">
            قُلْ هُوَ ٱللَّهُ أَحَدٌ
          </Text>
          <View style={styles.rowEnd}>
            <AyahMarker number={1} />
          </View>
        </Card>
      </View>

      <SectionHeader title={t('gallery.feedback')} kind="content" />
      <View style={styles.stack}>
        <Toast
          message={t('gallery.saved')}
          action={{ label: t('actions.undo'), onPress: () => undefined }}
        />
        <Banner tone="warn" message={t('gallery.warn')} />
        <Banner tone="info" message={t('gallery.info')} />
        <Banner tone="dark" message={t('states.offlineTitle')} />
        <View style={styles.row}>
          <Button
            label={t('gallery.saved')}
            size="sm"
            variant="secondary"
            grow
            onPress={() =>
              toast.show({
                message: t('gallery.saved'),
                action: { label: t('actions.undo'), onPress: () => undefined },
              })
            }
          />
          <Button label={t('gallery.sheet')} size="sm" grow onPress={() => setSheetOpen(true)} />
        </View>
      </View>

      <SectionHeader title={t('gallery.skeleton')} kind="content" />
      <Card style={styles.stack}>
        <Skeleton width="60%" height={16} />
        <Skeleton height={12} />
        <Skeleton width="80%" height={12} />
      </Card>

      <SectionHeader title={t('gallery.player')} kind="content" />
      <View style={styles.playerFrame}>
        <MiniPlayer
          title={t('gallery.reciter')}
          subtitle={t('gallery.track')}
          initials="MA"
          progress={0.38}
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
        />
      </View>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t('gallery.sheetTitle')}
      >
        <View style={styles.row}>
          <Button label={t('actions.play')} size="sm" grow onPress={() => setSheetOpen(false)} />
          <Button
            label={t('gallery.bookmarks')}
            size="sm"
            variant="secondary"
            grow
            onPress={() => setSheetOpen(false)}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    stack: { gap: t.space.md },
    row: { flexDirection: 'row', gap: t.space.sm },
    rowCenter: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
    rowEnd: { flexDirection: 'row', justifyContent: 'flex-end' },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
    gapTop: { marginTop: t.space.md },
    hero: {
      borderRadius: t.radius.card,
      paddingVertical: t.space.xxl,
      alignItems: 'center',
      gap: t.space.xs,
    },
    playerFrame: {
      borderRadius: t.radius.card,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: t.colors.border,
    },
  }),
);
