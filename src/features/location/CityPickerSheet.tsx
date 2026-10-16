import { Check, MapPin, Navigation } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { Icon, IconTile, List, ListRow, SearchField } from '@/components/ui';
import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';

import { CITIES, type City } from './cities';

/** Manual city choice ("Choose city manually" and the Home location chip). */
export function CityPickerSheet({
  visible,
  onClose,
  onSelect,
  selectedId,
  onUseDevice,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
  selectedId?: string;
  /** Adds a "Use my current location" row at the top. */
  onUseDevice?: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { height } = useWindowDimensions();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) =>
      [c.name.bn, c.name.en, c.name.ar, c.country[language]].some((n) =>
        n.toLowerCase().includes(q),
      ),
    );
  }, [query, language]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('location.pickerTitle')}>
      <SearchField
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        placeholder={t('location.searchPlaceholder')}
      />
      <ScrollView
        style={{ maxHeight: height * 0.5 }}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {onUseDevice && !query ? (
          <List style={styles.device}>
            <ListRow
              title={t('location.useCurrent')}
              leading={<IconTile icon={Navigation} size="sm" />}
              onPress={onUseDevice}
            />
          </List>
        ) : null}
        <List>
          {results.map((city) => (
            <ListRow
              key={city.id}
              title={city.name[language]}
              caption={city.country[language]}
              leading={<IconTile icon={MapPin} size="sm" />}
              trailing={
                city.id === selectedId ? <Icon icon={Check} size={20} color="link" /> : undefined
              }
              accessibilityRole="radio"
              accessibilityState={{ checked: city.id === selectedId }}
              onPress={() => onSelect(city)}
            />
          ))}
        </List>
      </ScrollView>
    </BottomSheet>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    list: { paddingBottom: t.space.sm },
    device: { marginBottom: t.space.md },
  }),
);
