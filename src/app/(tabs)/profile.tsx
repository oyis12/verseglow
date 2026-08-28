import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { getLocales } from "expo-localization";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionSheetModal } from "@/components/action-sheet-modal";
import { ScreenHeader } from "@/components/screen-header";
import { SelectField, type SelectOption } from "@/components/select-field";
import {
  fonts,
  radius,
  spacing,
  type ThemePreference,
} from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { signOut } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { useInsightStore } from "@/store/insight-store";
import { usePreferencesStore } from "@/store/preferences-store";
import { useThemeStore } from "@/store/theme-store";
import { useUsageStore } from "@/store/usage-store";

const choices: {
  value: ThemePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
  { value: "system", label: "System", icon: "phone-portrait-outline" },
];

const regionOptions: SelectOption[] = [
  { value: "auto", label: "Automatic", subtitle: "Use your device region" },
  {
    value: "NG",
    label: "Nigeria",
    subtitle: "Adds Naija and Warri Pidgin voice options",
  },
  { value: "GH", label: "Ghana" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "ZA", label: "South Africa" },
  { value: "KE", label: "Kenya" },
];

export default function ProfileScreen() {
  const { colors, preference } = useAppTheme();
  const setPreference = useThemeStore((state) => state.setPreference);
  const regionPreference = usePreferencesStore(
    (state) => state.regionPreference,
  );
  const setRegionPreference = usePreferencesStore(
    (state) => state.setRegionPreference,
  );
  const isPro = useUsageStore((state) => state.isPro);
  const user = useAuthStore((state) => state.user);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutPromptVisible, setSignOutPromptVisible] = useState(false);
  const [deleteInfoVisible, setDeleteInfoVisible] = useState(false);
  const savedCount = useInsightStore((state) => state.saved.length);
  const regionCode = getLocales()[0]?.regionCode ?? "US";
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const handleSignOut = async () => {
    setSignOutPromptVisible(false);
    setIsSigningOut(true);
    await signOut();
    router.replace("/sign-in");
  };

  const choose = (value: ThemePreference) => {
    Haptics.selectionAsync();
    setPreference(value);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            eyebrow="PERSONALISE"
            title="Make it feel like yours."
            subtitle="Choose how Daily Insight looks and how scripture is explained to you."
          />
          <Text style={[styles.label, { color: colors.textMuted }]}>
            ACCOUNT
          </Text>
          <View
            style={[
              styles.accountCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.accountIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={25}
                color={colors.primary}
              />
            </View>
            <View style={styles.accountCopy}>
              <Text style={[styles.accountTitle, { color: colors.text }]}>
                {user?.displayName ?? "Your Daily Insight account"}
              </Text>
              <Text style={[styles.accountBody, { color: colors.textMuted }]}>
                {user?.email
                  ? `Signed in with Google · ${user.email}`
                  : "Signed in with Google"}
              </Text>
            </View>
          </View>

          <View
            style={[styles.accountStats, { backgroundColor: colors.surface }]}
          >
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {savedCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Saved locally
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {isPro ? "Pro" : "Free"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Current plan
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/subscription")}
            style={[
              styles.planCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.planIcon, { backgroundColor: colors.primarySoft }]}
            >
              <Ionicons name="sparkles" size={22} color={colors.primary} />
            </View>
            <View style={styles.planCopy}>
              <View style={styles.planTitleRow}>
                <Text style={[styles.planTitle, { color: colors.text }]}>
                  Daily Insight {isPro ? "Pro" : "Free"}
                </Text>
                <View
                  style={[
                    styles.freeBadge,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Text
                    style={[styles.freeBadgeText, { color: colors.primary }]}
                  >
                    {isPro ? "PRO" : "FREE"}
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.planDescription, { color: colors.textMuted }]}
              >
                {isPro
                  ? "Unlimited-feeling generations, downloads, and premium themes."
                  : "Watch a short ad to unlock more generations, or upgrade to Pro."}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            APPEARANCE
          </Text>
          <View
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
          >
            {choices.map((choice, index) => {
              const selected = preference === choice.value;
              return (
                <Pressable
                  key={choice.value}
                  onPress={() => choose(choice.value)}
                  style={[
                    styles.choice,
                    index < choices.length - 1 && {
                      borderBottomColor: colors.border,
                      borderBottomWidth: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.choiceIcon,
                      { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <Ionicons
                      name={choice.icon}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.choiceText, { color: colors.text }]}>
                    {choice.label}
                  </Text>
                  <Ionicons
                    name={selected ? "checkmark-circle" : "ellipse-outline"}
                    size={23}
                    color={selected ? colors.primary : colors.border}
                  />
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>
            YOUR DEFAULTS
          </Text>
          <View style={styles.defaults}>
            <SelectField
              label="Region & language"
              value={regionPreference}
              options={regionOptions.map((option) =>
                option.value === "auto"
                  ? { ...option, subtitle: `Detected: ${regionCode}` }
                  : option,
              )}
              onChange={(value) => {
                Haptics.selectionAsync();
                setRegionPreference(value);
              }}
              searchable
            />
          </View>
          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.surface, marginTop: spacing.sm },
            ]}
          >
            <SettingRow
              icon="book-outline"
              title="Bible translation"
              value="KJV"
              last
            />
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>
            ABOUT & PRIVACY
          </Text>
          <View
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
          >
            <SettingRow
              icon="information-circle-outline"
              title="App version"
              value={appVersion}
            />
            <Pressable
              disabled={isSigningOut}
              onPress={() => setSignOutPromptVisible(true)}
              style={styles.choice}
            >
              <View
                style={[
                  styles.choiceIcon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.choiceText, { color: colors.text }]}>
                {isSigningOut ? "Signing out…" : "Sign out"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={17}
                color={colors.textMuted}
              />
            </Pressable>
            <Pressable
              onPress={() => setDeleteInfoVisible(true)}
              style={styles.choice}
            >
              <View
                style={[styles.choiceIcon, { backgroundColor: "#C4473A18" }]}
              >
                <Ionicons name="trash-outline" size={20} color="#C4473A" />
              </View>
              <Text style={[styles.choiceText, { color: "#C4473A" }]}>
                Delete account
              </Text>
              <Ionicons name="chevron-forward" size={17} color="#C4473A" />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
      <ActionSheetModal
        visible={signOutPromptVisible}
        onRequestClose={() => setSignOutPromptVisible(false)}
        icon="log-out-outline"
        title="Sign out"
        body="You can sign back in anytime with the same Google account."
        actions={[
          {
            label: isSigningOut ? "Signing out…" : "Sign out",
            icon: "log-out-outline",
            variant: "destructive",
            loading: isSigningOut,
            onPress: handleSignOut,
          },
        ]}
        dismissLabel="Cancel"
      />
      <ActionSheetModal
        visible={deleteInfoVisible}
        onRequestClose={() => setDeleteInfoVisible(false)}
        icon="trash-outline"
        title="Delete account"
        body="Account deletion will permanently remove cloud-saved generations and account data. It will be enabled with Google sign-in and the backend."
        actions={[{ label: "OK", onPress: () => setDeleteInfoVisible(false) }]}
      />
    </View>
  );
}

function SettingRow({
  icon,
  title,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.choice,
        !last && { borderBottomColor: colors.border, borderBottomWidth: 1 },
      ]}
    >
      <View
        style={[styles.choiceIcon, { backgroundColor: colors.primarySoft }]}
      >
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.choiceText, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.textMuted }]}>{value}</Text>
      <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  label: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  settingCard: { borderRadius: radius.md, overflow: "hidden" },
  defaults: { gap: spacing.sm },
  accountCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  accountIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  accountCopy: { alignItems: "center", marginTop: spacing.md },
  accountTitle: { fontFamily: fonts.serif, fontSize: 21, textAlign: "center" },
  accountBody: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  signInRow: {
    width: "100%",
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  providerButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  providerText: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "800" },
  accountStats: {
    minHeight: 74,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  stat: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontFamily: fonts.serif, fontSize: 18 },
  statLabel: { fontFamily: fonts.sans, fontSize: 10 },
  statDivider: { width: 1, height: 34 },
  planCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  planIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  planCopy: { flex: 1, gap: 5 },
  planTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  planTitle: { fontFamily: fonts.sans, fontSize: 15, fontWeight: "800" },
  freeBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  freeBadgeText: {
    fontFamily: fonts.sans,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  planDescription: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 17 },
  choice: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  choiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: "600",
  },
  value: { fontFamily: fonts.sans, fontSize: 13 },
});
