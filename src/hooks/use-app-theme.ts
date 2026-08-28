import { useColorScheme } from 'react-native';

import { themes, type ResolvedTheme } from '@/constants/theme';
import { useThemeStore } from '@/store/theme-store';

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);
  const resolved: ResolvedTheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  return { colors: themes[resolved], preference, resolved };
}
