import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';

/**
 * Localised text drawn over a card inside an illustration. Coordinates are in the
 * 300×300 artboard space and scaled with the illustration.
 */
export function ArtCardText({
  scale,
  x,
  y,
  width,
  height,
  primary,
  secondary,
  primarySize,
  secondarySize,
  primaryFirst,
  primaryColor = 'text',
}: {
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
  primary: string;
  secondary: string;
  primarySize: number;
  secondarySize: number;
  /** true: big value on top (Zakat); false: small label on top (Fajr). */
  primaryFirst?: boolean;
  primaryColor?: 'text' | 'primary';
}) {
  const big = (
    <Text
      size={primarySize * scale}
      weight="700"
      color={primaryColor}
      tabular
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.6}
      maxFontSizeMultiplier={1}
    >
      {primary}
    </Text>
  );
  const small = (
    <Text
      size={secondarySize * scale}
      weight="600"
      color="text2"
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.6}
      maxFontSizeMultiplier={1}
    >
      {secondary}
    </Text>
  );
  return (
    <View
      style={[
        styles.box,
        { left: x * scale, top: y * scale, width: width * scale, height: height * scale },
      ]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {primaryFirst ? big : small}
      {primaryFirst ? small : big}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: 'absolute', justifyContent: 'center', alignItems: 'flex-start' },
});
