import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionSheetModal } from "@/components/action-sheet-modal";
import { ScreenHeader } from "@/components/screen-header";
import { fonts, radius, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useInsightStore } from "@/store/insight-store";
import type { Insight } from "@/types/insight";

type LibraryTab = "saved" | "history";

const reportReasons = [
  "Inaccurate explanation",
  "Misrepresents scripture",
  "Offensive or inappropriate",
  "Harmful advice",
  "Other",
];

export default function SavedScreen() {
  const { colors } = useAppTheme();
  const [tab, setTab] = useState<LibraryTab>("saved");
  const [query, setQuery] = useState("");
  const [reporting, setReporting] = useState<Insight | null>(null);
  const [clearHistoryPromptVisible, setClearHistoryPromptVisible] =
    useState(false);
  const [updateErrorVisible, setUpdateErrorVisible] = useState(false);
  const [reportReceivedVisible, setReportReceivedVisible] = useState(false);
  const saved = useInsightStore((state) => state.saved);
  const history = useInsightStore((state) => state.history);
  const setCurrent = useInsightStore((state) => state.setCurrent);
  const toggleSaved = useInsightStore((state) => state.toggleSaved);
  const syncSavedFromServer = useInsightStore(
    (state) => state.syncSavedFromServer,
  );
  const removeHistory = useInsightStore((state) => state.removeHistory);
  const clearHistory = useInsightStore((state) => state.clearHistory);
  const source = tab === "saved" ? saved : history;

  useEffect(() => {
    syncSavedFromServer().catch(() => {
      // Silent here — the sign-in sync already ran, and the local cache is
      // still a reasonable fallback if this refresh fails (e.g. offline).
    });
  }, [syncSavedFromServer]);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return source;
    return source.filter((item) =>
      `${item.reference} ${item.verse} ${item.insight} ${item.voice}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, source]);

  const openDesigner = (item: Insight) => {
    setCurrent(item);
    router.push("/designer");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            eyebrow="YOUR LIBRARY"
            title="Keep what speaks to you."
            subtitle="Search your saved scripture and revisit every explanation you create."
          />

          <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
            {(["saved", "history"] as const).map((item) => (
              <Pressable
                key={item}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === item }}
                onPress={() => setTab(item)}
                style={[
                  styles.tab,
                  tab === item && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: tab === item ? "#FFF" : colors.textMuted },
                  ]}
                >
                  {item === "saved"
                    ? `Saved (${saved.length})`
                    : `History (${history.length})`}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={[
              styles.search,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={19}
              color={colors.textMuted}
            />
            <TextInput
              accessibilityLabel="Search your library"
              value={query}
              onChangeText={setQuery}
              placeholder="Search book, verse, voice or words"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {!!query && (
              <Pressable
                accessibilityLabel="Clear search"
                onPress={() => setQuery("")}
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={colors.textMuted}
                />
              </Pressable>
            )}
          </View>

          {tab === "history" && history.length > 0 && (
            <Pressable
              onPress={() => setClearHistoryPromptVisible(true)}
              style={styles.clearAction}
            >
              <Ionicons name="trash-outline" size={15} color="#C4473A" />
              <Text style={styles.clearText}>Clear history</Text>
            </Pressable>
          )}

          {results.length === 0 ? (
            <View
              style={[
                styles.empty,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons
                  name={
                    query
                      ? "search-outline"
                      : tab === "saved"
                        ? "bookmark-outline"
                        : "time-outline"
                  }
                  size={28}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {query
                  ? "Nothing matches that search"
                  : tab === "saved"
                    ? "Your quiet collection starts here"
                    : "No generations yet"}
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {query
                  ? "Try a Bible book, reference, voice, or a word from the passage."
                  : tab === "saved"
                    ? "Explore a topic and tap the bookmark to keep a verse available here."
                    : "Create an explanation and it will be kept locally in your history."}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {results.map((item, index) => {
                const isSaved = saved.some(
                  (savedItem) =>
                    savedItem.reference === item.reference &&
                    savedItem.insight === item.insight,
                );
                return (
                  <View
                    key={item.id ?? `${item.reference}-${index}`}
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View>
                        <Text
                          style={[styles.reference, { color: colors.primary }]}
                        >
                          {item.reference}
                        </Text>
                        <Text
                          style={[styles.meta, { color: colors.textMuted }]}
                        >
                          {item.voice}
                          {item.createdAt
                            ? ` · ${new Date(item.createdAt).toLocaleDateString()}`
                            : ""}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityLabel={
                          isSaved ? "Remove from saved" : "Save this insight"
                        }
                        onPress={() =>
                          toggleSaved(item).catch(() =>
                            setUpdateErrorVisible(true),
                          )
                        }
                        style={[
                          styles.iconButton,
                          { backgroundColor: colors.primarySoft },
                        ]}
                      >
                        <Ionicons
                          name={isSaved ? "bookmark" : "bookmark-outline"}
                          size={18}
                          color={colors.primary}
                        />
                      </Pressable>
                    </View>
                    <Text
                      numberOfLines={4}
                      style={[styles.verse, { color: colors.text }]}
                    >
                      “{item.verse}”
                    </Text>
                    <View style={styles.aiRow}>
                      <Ionicons
                        name="sparkles"
                        size={12}
                        color={colors.primary}
                      />
                      <Text style={[styles.aiLabel, { color: colors.primary }]}>
                        AI-GENERATED EXPLANATION
                      </Text>
                    </View>
                    <Text
                      numberOfLines={3}
                      style={[styles.insight, { color: colors.textMuted }]}
                    >
                      {item.insight}
                    </Text>
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() => openDesigner(item)}
                        style={[
                          styles.primary,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Ionicons
                          name="color-palette-outline"
                          size={17}
                          color="#FFF"
                        />
                        <Text style={styles.primaryText}>Create card</Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel="Report AI explanation"
                        onPress={() => setReporting(item)}
                        style={[
                          styles.secondary,
                          { borderColor: colors.border },
                        ]}
                      >
                        <Ionicons
                          name="flag-outline"
                          size={18}
                          color={colors.textMuted}
                        />
                      </Pressable>
                      {tab === "history" && item.id && (
                        <Pressable
                          accessibilityLabel="Delete from history"
                          onPress={() => removeHistory(item.id!)}
                          style={[
                            styles.secondary,
                            { borderColor: colors.border },
                          ]}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#C4473A"
                          />
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={!!reporting}
        transparent
        animationType="slide"
        onRequestClose={() => setReporting(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setReporting(null)}
          />
          <SafeAreaView
            edges={["bottom"]}
            style={[styles.reportSheet, { backgroundColor: colors.background }]}
          >
            <View style={styles.handle} />
            <Text style={[styles.reportTitle, { color: colors.text }]}>
              Report this explanation
            </Text>
            <Text style={[styles.reportBody, { color: colors.textMuted }]}>
              Reports help us improve safety and accuracy. The original
              scripture is never changed.
            </Text>
            <View style={styles.reasons}>
              {reportReasons.map((reason) => (
                <Pressable
                  key={reason}
                  onPress={() => {
                    setReporting(null);
                    setReportReceivedVisible(true);
                  }}
                  style={[
                    styles.reason,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.reasonText, { color: colors.text }]}>
                    {reason}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={colors.textMuted}
                  />
                </Pressable>
              ))}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
      <ActionSheetModal
        visible={clearHistoryPromptVisible}
        onRequestClose={() => setClearHistoryPromptVisible(false)}
        icon="trash-outline"
        title="Clear generation history?"
        body="Saved verses will not be removed."
        actions={[
          {
            label: "Clear history",
            icon: "trash-outline",
            variant: "destructive",
            onPress: () => {
              setClearHistoryPromptVisible(false);
              clearHistory();
            },
          },
        ]}
      />
      <ActionSheetModal
        visible={updateErrorVisible}
        onRequestClose={() => setUpdateErrorVisible(false)}
        icon="alert-circle-outline"
        title="Could not update"
        body="Please check your connection and try again."
        actions={[{ label: "OK", onPress: () => setUpdateErrorVisible(false) }]}
      />
      <ActionSheetModal
        visible={reportReceivedVisible}
        onRequestClose={() => setReportReceivedVisible(false)}
        icon="checkmark-circle-outline"
        title="Report received"
        body="Thank you. This will be sent for review when backend reporting is connected."
        actions={[
          { label: "OK", onPress: () => setReportReceivedVisible(false) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 130 },
  tabs: {
    flexDirection: "row",
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    height: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: { fontFamily: fonts.sans, fontSize: 12, fontWeight: "800" },
  search: {
    height: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontFamily: fonts.sans, fontSize: 13 },
  clearAction: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: spacing.sm,
  },
  clearText: {
    color: "#C4473A",
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  list: { gap: spacing.md, marginTop: spacing.md },
  card: { padding: spacing.lg, borderWidth: 1, borderRadius: radius.lg },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reference: { fontFamily: fonts.sans, fontWeight: "800", fontSize: 13 },
  meta: { fontFamily: fonts.sans, fontSize: 10, marginTop: 3 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  verse: {
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 27,
    marginTop: spacing.md,
  },
  aiRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    marginTop: spacing.md,
  },
  aiLabel: {
    fontFamily: fonts.sans,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  insight: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  primary: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  primaryText: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: "800",
  },
  secondary: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  reportSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: spacing.lg,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#888",
    opacity: 0.5,
    alignSelf: "center",
  },
  reportTitle: { fontFamily: fonts.serif, fontSize: 27, marginTop: spacing.lg },
  reportBody: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  reasons: { gap: spacing.sm, marginTop: spacing.lg },
  reason: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reasonText: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "700" },
});
