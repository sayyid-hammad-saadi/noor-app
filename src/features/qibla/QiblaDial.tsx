import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/ui';
import { makeStyles, useTheme } from '@/theme';

const C = 150;
/** Space around the 300-unit dial for the Kaaba marker. */
const MARGIN = 24;
const PADDED = 300 + MARGIN * 2;

/** Point at compass bearing `deg` (0 = up) and radius `r` in the 300×300 dial space. */
function pt(deg: number, r: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

function tickPaths(heading: number): { minor: string; major: string } {
  let minor = '';
  let major = '';
  for (let b = 0; b < 360; b += 5) {
    const isMajor = b % 30 === 0;
    const [x1, y1] = pt(b - heading, isMajor ? 124 : 130);
    const [x2, y2] = pt(b - heading, 138);
    const seg = `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    if (isMajor) major += seg;
    else minor += seg;
  }
  return { minor, major };
}

/**
 * The dial turns with the phone: cardinal marks are drawn at (bearing − heading), the
 * needle and Kaaba marker at (qibla − heading). The fixed pointer at the top is where
 * the phone faces.
 */
export function QiblaDial({
  size,
  heading,
  qibla,
  aligned,
  accessibilityLabel,
}: {
  size: number;
  heading: number;
  qibla: number;
  aligned: boolean;
  accessibilityLabel: string;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { colors: c, shadows } = useTheme();
  const scale = size / 300;
  const { minor, major } = tickPaths(heading);
  const accent = aligned ? c.success : c.primary;
  const rel = qibla - heading;
  const [kx, ky] = pt(rel, 146);
  const cardinals = t('qibla.cardinals', { returnObjects: true }) as string[];

  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, boxShadow: aligned ? shadows.glow : shadows.dial },
      ]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {aligned ? <Ripple size={size} /> : null}
      {/* Extra margin so the Kaaba marker can sit over the dial's edge without clipping. */}
      <Svg
        width={size * (PADDED / 300)}
        height={size * (PADDED / 300)}
        viewBox={`${-MARGIN} ${-MARGIN} ${PADDED} ${PADDED}`}
        style={{ position: 'absolute', left: -size * (MARGIN / 300), top: -size * (MARGIN / 300) }}
      >
        <Circle
          cx={C}
          cy={C}
          r={aligned ? 147.5 : 149}
          fill={c.surface}
          stroke={aligned ? c.success : 'none'}
          strokeWidth={aligned ? 3 : 0}
        />
        <Circle cx={C} cy={C} r={96} fill={aligned ? c.okBg : c.tint} />
        <G fill="none" stroke={accent} strokeWidth={1.2} opacity={aligned ? 0.22 : 0.18}>
          <Rect x={122} y={122} width={56} height={56} />
          <Rect x={122} y={122} width={56} height={56} transform="rotate(45 150 150)" />
        </G>
        <Path d={minor} fill="none" stroke={c.border} strokeWidth={1.5} strokeLinecap="round" />
        <Path d={major} fill="none" stroke={c.text2} strokeWidth={2} strokeLinecap="round" />
        <G transform={`rotate(${rel} 150 150)`}>
          <Path d="M150 60l10 90h-20z" fill={accent} />
          <Path d="M150 236l8-86h-16z" fill={c.border} />
        </G>
        <Circle cx={C} cy={C} r={11} fill={c.surface} stroke={accent} strokeWidth={3} />
        <G transform={`translate(${kx.toFixed(1)} ${ky.toFixed(1)})`}>
          <Circle
            r={aligned ? 18 : 17}
            fill={aligned ? c.success : c.surface}
            stroke={aligned ? 'none' : c.primary}
            strokeWidth={aligned ? 0 : 2}
          />
          <Rect x={-8} y={-8} width={16} height={16} rx={2} fill={c.illoInk} />
          <Rect x={-8} y={-4.5} width={16} height={2.5} fill={c.gold} />
        </G>
      </Svg>

      {/* Cardinal letters as Text so they use the UI language's font and stay upright. */}
      {[0, 90, 180, 270].map((b, i) => {
        const [x, y] = pt(b - heading, 108);
        return (
          <View
            key={b}
            pointerEvents="none"
            style={[styles.cardinal, { left: x * scale - 14, top: y * scale - 12 }]}
          >
            <Text
              size={b === 0 ? 16 : 14}
              weight={b === 0 ? '700' : '600'}
              color={b === 0 ? 'danger' : 'text2'}
              align="center"
              maxFontSizeMultiplier={1}
            >
              {cardinals[i] ?? ''}
            </Text>
          </View>
        );
      })}

      {/* Fixed pointer: the direction the phone is facing. */}
      <View style={styles.pointer} pointerEvents="none">
        <Svg width={16} height={12} viewBox="0 0 16 12">
          <Path d="M8 12L0 0h16z" fill={aligned ? c.success : c.text} />
        </Svg>
      </View>
    </View>
  );
}

function Ripple({ size }: { size: number }) {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    p.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    return () => cancelAnimation(p);
  }, [p, reduceMotion]);
  const style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.25 : 0.55 * (1 - p.value),
    transform: [{ scale: reduceMotion ? 1 : 0.96 + 0.16 * p.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ripple, { width: size + 12, height: size + 12, borderRadius: size }, style]}
    />
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    // The dial is drawn in absolute coordinates, so it must not mirror in RTL (native-only prop).
    box: {
      borderRadius: t.radius.pill,
      ...(Platform.OS === 'web' ? {} : { direction: 'ltr' as const }),
    },
    cardinal: { position: 'absolute', width: 28, alignItems: 'center' },
    pointer: { position: 'absolute', top: -30, left: '50%', marginLeft: -8 },
    ripple: {
      position: 'absolute',
      top: -6,
      left: -6,
      borderWidth: 2,
      borderColor: t.colors.success,
    },
  }),
);
