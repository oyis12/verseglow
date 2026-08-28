import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionSheetModal } from "@/components/action-sheet-modal";
import { UsageBadge } from "@/components/usage-badge";
import { VerseCard } from "@/components/verse-card";
import { fonts, radius, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchRandomVerse } from "@/services/bible-service";
import { useInsightStore } from "@/store/insight-store";
import { useUsageStore } from "@/store/usage-store";

export default function HomeScreen() {
  const { colors, resolved } = useAppTheme();
  const currentInsight = useInsightStore((state) => state.current);
  const currentIsFallback = useInsightStore((state) => state.currentIsFallback);
  const setRandomFallback = useInsightStore((state) => state.setRandomFallback);
  const saved = useInsightStore((state) => state.saved);
  const toggleSaved = useInsightStore((state) => state.toggleSaved);
  const refreshUsage = useUsageStore((state) => state.refresh);
  const [saveErrorVisible, setSaveErrorVisible] = useState(false);
  const isSaved = saved.some(
    (item) =>
      item.reference === currentInsight.reference &&
      item.insight === currentInsight.insight,
  );
  const selectVerse = () => {
    Haptics.selectionAsync();
    router.push("/verse-selector");
  };

  useEffect(() => {
    refreshUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only swap in a fresh random verse while the user hasn't generated a real
  // insight yet — once they have, this screen shows their own last creation
  // instead of overwriting it on every visit.
  useEffect(() => {
    if (!currentIsFallback) return;
    fetchRandomVerse()
      .then((verse) =>
        setRandomFallback({
          reference: verse.reference,
          translation: verse.translation,
          verse: verse.text,
          insight:
            "Tap Create to get an AI reflection on this verse, in whatever tone or voice you like.",
          voice: "Standard English",
        }),
      )
      .catch(() => {
        // Silent — the existing placeholder verse is a perfectly fine fallback.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>
                GOOD MORNING
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                A moment for you.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Open notifications"
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color={colors.text}
              />
            </Pressable>
          </View>

          <UsageBadge onPress={() => router.push("/subscription")} />

          <Text style={[styles.sectionLabel, { color: colors.primary }]}>
            VERSE OF THE DAY
          </Text>
          <VerseCard
            reference={currentInsight.reference}
            translation={currentInsight.translation}
            verse={currentInsight.verse}
            insight={currentInsight.insight}
          />

          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/designer");
              }}
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="sparkles-outline" size={19} color="#FFF" />
              <Text style={styles.primaryText}>Create a card</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                toggleSaved(currentInsight).catch(() =>
                  setSaveErrorVisible(true),
                );
              }}
              accessibilityLabel="Save verse"
              style={[
                styles.secondaryButton,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={21}
                color={colors.text}
              />
            </Pressable>
            <Pressable
              onPress={() =>
                Share.share({
                  message: `${currentInsight.reference} (${currentInsight.translation})\n\n“${currentInsight.verse}”\n\nAI-generated explanation:\n${currentInsight.insight}`,
                })
              }
              accessibilityLabel="Share verse"
              style={[
                styles.secondaryButton,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons
                name="share-social-outline"
                size={21}
                color={colors.text}
              />
            </Pressable>
          </View>

          <Pressable
            onPress={selectVerse}
            style={[styles.nextCard, { backgroundColor: colors.surface }]}
          >
            <View>
              <Text style={[styles.nextLabel, { color: colors.textMuted }]}>
                READY FOR ANOTHER?
              </Text>
              <Text style={[styles.nextTitle, { color: colors.text }]}>
                Choose a verse and style
              </Text>
            </View>
            <View
              style={[styles.arrow, { backgroundColor: colors.primarySoft }]}
            >
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </View>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      <ActionSheetModal
        visible={saveErrorVisible}
        onRequestClose={() => setSaveErrorVisible(false)}
        icon="alert-circle-outline"
        title="Could not save"
        body="Please check your connection and try again."
        actions={[{ label: "OK", onPress: () => setSaveErrorVisible(false) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  greeting: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: { fontFamily: fonts.serif, fontSize: 29, marginTop: spacing.xs },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  primaryButton: {
    height: 54,
    flex: 1,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primaryText: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  nextCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextLabel: {
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  nextTitle: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  arrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
