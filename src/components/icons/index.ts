import { createLucideIcon } from 'lucide-react-native';

/**
 * Icons the design draws that Lucide doesn't ship, in Lucide's 24px stroke format so
 * they work anywhere a LucideIcon does (Icon, IconTile, Button).
 */

/** Prayer beads: dotted loop with a tassel. */
export const TasbihIcon = createLucideIcon('NoorTasbih', [
  [
    'circle',
    { cx: '12', cy: '10', r: '7', strokeWidth: '3.2', strokeDasharray: '0.1 3.55', key: 'beads' },
  ],
  ['path', { d: 'M12 17v3', key: 'cord' }],
  ['path', { d: 'M10 22h4', key: 'tassel' }],
]);

/** Raised hands in dua. */
export const DuaIcon = createLucideIcon('NoorDua', [
  ['path', { d: 'M9 21v-4.5L5.5 12V5.5a1.5 1.5 0 0 1 3 0V10', key: 'left' }],
  ['path', { d: 'M15 21v-4.5l3.5-4.5V5.5a1.5 1.5 0 0 0-3 0V10', key: 'right' }],
  ['path', { d: 'M8.5 10 11 13.5V21', key: 'left-palm' }],
  ['path', { d: 'M15.5 10 13 13.5V21', key: 'right-palm' }],
]);
