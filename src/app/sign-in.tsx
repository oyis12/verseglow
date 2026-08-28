import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fonts, radius, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { signInWithGoogle } from "@/services/auth-service";
import { useInsightStore } from "@/store/insight-store";
import { usePreferencesStore } from "@/store/preferences-store";
import { useUsageStore } from "@/store/usage-store";

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const setAccountProvider = usePreferencesStore(
    (state) => state.setAccountProvider,
  );
  const syncSavedFromServer = useInsightStore(
    (state) => state.syncSavedFromServer,
  );
  const refreshUsage = useUsageStore((state) => state.refresh);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return; // Prevent duplicate trigger calls

    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      setAccountProvider("google");
      // Best-effort: a saved-insights or usage sync failure shouldn't block sign-in.
      syncSavedFromServer().catch((syncError) =>
        console.warn("Could not sync saved insights:", syncError),
      );
      refreshUsage();
      router.replace("/(tabs)");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.stage}>
          <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons
              name="sparkles-outline"
              size={42}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Sign in to continue
          </Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            We use your Google account to save your reflections, bookmarks, and
            preferences across devices.
          </Text>
          {error && (
            <Text style={[styles.error, { color: "#D9534F" }]}>{error}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={handleGoogleSignIn}
            style={({ pressed }) => [
              styles.googleButton,
              {
                backgroundColor: colors.primary,
                opacity: isSigningIn || pressed ? 0.7 : 1,
              },
            ]}
          >
            {isSigningIn ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#FFF" />
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, padding: spacing.lg, justifyContent: "space-between" },
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  icon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    lineHeight: 40,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginTop: spacing.md,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.md,
  },
  footer: { gap: spacing.md },
  googleButton: {
    height: 58,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  googleButtonText: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: "800",
  },
});
