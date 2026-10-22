import {
  Banknote,
  Clock,
  Coins,
  Droplet,
  Heart,
  House,
  Landmark,
  type LucideIcon,
  Moon,
} from 'lucide-react-native';

import type { Category } from './masail';

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  taharah: Droplet,
  salah: Clock,
  sawm: Moon,
  zakat: Coins,
  hajj: Landmark,
  family: Heart,
  money: Banknote,
  daily: House,
};
