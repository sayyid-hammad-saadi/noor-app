import { Platform } from 'react-native';

/**
 * Hides a decorative react-native-svg element from screen readers. The native props
 * are forwarded to the DOM on web, where React rejects them, so web gets aria-hidden.
 */
export const hiddenSvgProps =
  Platform.OS === 'web'
    ? ({ 'aria-hidden': true } as const)
    : ({
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
      } as const);
