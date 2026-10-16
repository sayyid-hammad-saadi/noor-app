import { forwardRef } from 'react';
import { Pressable, type PressableProps, type StyleProp, View, type ViewStyle } from 'react-native';

export type TouchableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  /** Opacity while pressed. */
  pressedOpacity?: number;
};

/** Pressable with the app's pressed feedback. */
export const Touchable = forwardRef<View, TouchableProps>(function Touchable(
  { style, pressedOpacity = 0.7, disabled, ...rest },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && !disabled ? { opacity: pressedOpacity } : null,
      ]}
      {...rest}
    />
  );
});
