import { StyleSheet, Text, View } from 'react-native';

import { fonts, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export function ScreenHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, marginBottom: spacing.lg },
  eyebrow: { fontFamily: fonts.sans, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40 },
  subtitle: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, maxWidth: 360 },
});
