import { Platform } from 'react-native';

export const palette = {
  ember: '#D96422',
  gold: '#E5A45A',
  cream: '#FBF7EF',
  ink: '#17181C',
} as const;

export const themes = {
  light: {
    background: '#F8F3E9',
    surface: '#FFFCF6',
    surfaceRaised: '#FFFFFF',
    text: '#1D1C1A',
    textMuted: '#777168',
    border: '#E9DFD0',
    primary: palette.ember,
    primarySoft: '#F8E3D4',
    cardStart: '#24252A',
    cardEnd: '#111217',
    cardText: '#FFF8ED',
    tab: '#FFFCF6',
  },
  dark: {
    background: '#111216',
    surface: '#191A1F',
    surfaceRaised: '#222329',
    text: '#F8F3EA',
    textMuted: '#AAA59C',
    border: '#303137',
    primary: '#F17A35',
    primarySoft: '#3B251B',
    cardStart: '#27282D',
    cardEnd: '#121318',
    cardText: '#FFF8ED',
    tab: '#191A1F',
  },
} as const;

export type ResolvedTheme = keyof typeof themes;
export type ThemePreference = ResolvedTheme | 'system';

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 12, md: 18, lg: 28, pill: 999 } as const;

export const fonts = Platform.select({
  ios: { sans: 'System', serif: 'New York', rounded: 'System', mono: 'Menlo' },
  android: { sans: 'sans-serif', serif: 'serif', rounded: 'sans-serif', mono: 'monospace' },
  default: { sans: 'system-ui', serif: 'Georgia', rounded: 'system-ui', mono: 'monospace' },
})!;

// Compatibility exports for the remaining SDK template screens.
export const Colors = {
  light: {
    ...themes.light,
    backgroundElement: themes.light.surface,
    backgroundSelected: themes.light.primarySoft,
    textSecondary: themes.light.textMuted,
  },
  dark: {
    ...themes.dark,
    backgroundElement: themes.dark.surface,
    backgroundSelected: themes.dark.primarySoft,
    textSecondary: themes.dark.textMuted,
  },
} as const;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export const Fonts = fonts;
export const Spacing = {
  half: 2,
  one: spacing.xs,
  two: spacing.sm,
  three: spacing.md,
  four: spacing.lg,
  five: spacing.xl,
  six: 64,
} as const;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
