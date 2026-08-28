import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { fonts, radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useUsageStore } from '@/store/usage-store';

export function UsageBadge({ onPress }: { onPress: () => void }) {
  const { colors } = useAppTheme();
  const { isPro, freeGenerateCredits, proDailyGenerateCount, proDailyGenerateCap, hasLoaded } = useUsageStore();

  if (!hasLoaded) return null;

  const label = isPro
    ? `Daily cap: ${proDailyGenerateCount}/${proDailyGenerateCap}`
    : `Generate: ${freeGenerateCredits}`;

  return (
    <Pressable
      accessibilityLabel={isPro ? 'View your Pro daily cap' : 'View your remaining generations'}
      onPress={onPress}
      style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={isPro ? 'infinite-outline' : 'flash-outline'} size={14} color={colors.primary} />
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: fonts.sans, fontSize: 11, fontWeight: '800' },
});
