// import { Redirect } from 'expo-router';
// import { ActivityIndicator, StyleSheet, View } from 'react-native';

// import { useAppTheme } from '@/hooks/use-app-theme';
// import { usePreferencesStore } from '@/store/preferences-store';

// export default function Index() {
//   const { colors } = useAppTheme();
//   const hasHydrated = usePreferencesStore((state) => state.hasHydrated);
//   const hasCompletedOnboarding = usePreferencesStore((state) => state.hasCompletedOnboarding);

//   if (!hasHydrated) {
//     return (
//       <View style={[styles.loading, { backgroundColor: colors.background }]}>
//         <ActivityIndicator color={colors.primary} />
//       </View>
//     );
//   }

//   return <Redirect href={hasCompletedOnboarding ? '/(tabs)' : '/onboarding'} />;
// }

// const styles = StyleSheet.create({
//   loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
// });

import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import { usePreferencesStore } from "@/store/preferences-store";

export default function Index() {
  const { colors } = useAppTheme();
  const prefsHydrated = usePreferencesStore((state) => state.hasHydrated);
  const hasCompletedOnboarding = usePreferencesStore(
    (state) => state.hasCompletedOnboarding,
  );
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!prefsHydrated || !authHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/sign-in" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
