import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
//import * as MediaLibrary from "expo-media-library";
import * as MediaLibrary from "expo-media-library/legacy";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import { ActionSheetModal } from "@/components/action-sheet-modal";
import { fonts, radius, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useRewardedAd } from "@/hooks/use-rewarded-ad";
import { notifyDownloadComplete } from "@/services/notification-service";
import { recordShare } from "@/services/share-service";
import { useInsightStore } from "@/store/insight-store";
import { useUsageStore } from "@/store/usage-store";

const ALBUM_NAME = "Daily Insight";

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean,
    16,
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const cardThemes = [
  {
    id: "midnight",
    label: "Midnight",
    colors: ["#292A30", "#111217"] as const,
    accent: "#F08A45",
    premium: false,
  },
  {
    id: "sunrise",
    label: "Sunrise",
    colors: ["#BC5427", "#E7A35E"] as const,
    accent: "#FFF2DE",
  },
  {
    id: "forest",
    label: "Forest",
    colors: ["#27453B", "#11241F"] as const,
    accent: "#CBE3C1",
  },
  {
    id: "paper",
    label: "Paper",
    colors: ["#FFF9EE", "#EADDC9"] as const,
    accent: "#A34724",
  },
  {
    id: "royal",
    label: "Royal",
    colors: ["#3D236F", "#171026"] as const,
    accent: "#E8C66A",
    premium: true,
  },
  {
    id: "ocean",
    label: "Ocean",
    colors: ["#087E8B", "#08304A"] as const,
    accent: "#8DEBF2",
    premium: true,
    proOnly: true,
  },
];

const fontChoices = [
  { id: "serif", label: "Editorial", family: fonts.serif, premium: false },
  { id: "sans", label: "Modern", family: fonts.sans, premium: false },
  { id: "mono", label: "Minimal", family: fonts.mono, premium: true },
];

const fontColors = [
  { id: "auto", label: "Auto", color: null, premium: false },
  { id: "ivory", label: "Ivory", color: "#FFF8E9", premium: false },
  { id: "ink", label: "Ink", color: "#211F1C", premium: false },
  { id: "gold", label: "Gold", color: "#F2B66D", premium: true },
  { id: "rose", label: "Rose", color: "#F2B7B0", premium: true },
  { id: "sage", label: "Sage", color: "#C7D8BD", premium: true },
  { id: "sky", label: "Sky", color: "#98E3FF", premium: true, proOnly: true },
  {
    id: "lilac",
    label: "Lilac",
    color: "#D9BEFF",
    premium: true,
    proOnly: true,
  },
];

const patterns = [
  {
    id: "none",
    label: "Clean",
    icon: "remove-outline" as const,
    premium: false,
  },
  { id: "rays", label: "Rays", icon: "sunny-outline" as const, premium: false },
  {
    id: "dots",
    label: "Dots",
    icon: "ellipsis-horizontal" as const,
    premium: true,
  },
  {
    id: "frame",
    label: "Frame",
    icon: "scan-outline" as const,
    premium: true,
    proOnly: true,
  },
];

const glowChoices = [
  { id: "none", label: "None", value: 0, premium: false },
  { id: "soft", label: "Soft", value: 0.25, premium: false },
  {
    id: "radiant",
    label: "Radiant",
    value: 0.55,
    premium: true,
    proOnly: true,
  },
];

export default function DesignerScreen() {
  const { colors } = useAppTheme();
  const current = useInsightStore((state) => state.current);
  const setCurrent = useInsightStore((state) => state.setCurrent);
  const isPlus = useUsageStore((state) => state.isPro);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<View>(null);
  const [themeId, setThemeId] = useState("midnight");
  const [fontId, setFontId] = useState("serif");
  const [fontColorId, setFontColorId] = useState("auto");
  const [patternId, setPatternId] = useState("none");
  const [glowId, setGlowId] = useState("soft");
  const [formatId, setFormatId] = useState("portrait");
  const [fontScale, setFontScale] = useState(1);
  const [alignment, setAlignment] = useState<"left" | "center">("left");
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [rewardKey, setRewardKey] = useState<string | null>(null);
  const rewardActionRef = useRef<(() => void) | null>(null);
  const rewardKeyRef = useRef<string | null>(null);
  const selectedTheme =
    cardThemes.find((item) => item.id === themeId) ?? cardThemes[0];
  const selectedFont =
    fontChoices.find((item) => item.id === fontId) ?? fontChoices[0];
  const isLightCard = themeId === "paper";
  const chosenFontColor = fontColors.find(
    (item) => item.id === fontColorId,
  )?.color;
  const cardText = chosenFontColor ?? (isLightCard ? "#211F1C" : "#FFF9F0");
  const mutedCardText =
    chosenFontColor ?? (isLightCard ? "#645F57" : "#D8D1C7");
  const glow = glowChoices.find((item) => item.id === glowId) ?? glowChoices[0];

  const handleDesignAdEarned = () => {
    const key = rewardKeyRef.current;
    if (!key) return;
    setUnlocked((items) => [...items, key]);
    rewardActionRef.current?.();
    rewardActionRef.current = null;
    rewardKeyRef.current = null;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const { isLoaded: designAdLoaded, show: showDesignAd } =
    useRewardedAd(handleDesignAdEarned);

  const [proPaywall, setProPaywall] = useState<"style" | "download" | null>(
    null,
  );
  const [downloadProgress, setDownloadProgress] = useState<{
    label: string;
    percent: number;
  } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const chooseOption = (
    key: string,
    item: { premium?: boolean; proOnly?: boolean },
    select: () => void,
  ) => {
    if (isPlus || !item.premium || unlocked.includes(key)) {
      select();
      Haptics.selectionAsync();
      return;
    }

    if (item.proOnly) {
      setProPaywall("style");
      return;
    }

    rewardActionRef.current = select;
    rewardKeyRef.current = key;
    setRewardKey(key);
  };

  const resetDesign = () => {
    setThemeId("midnight");
    setFontId("serif");
    setFontColorId("auto");
    setPatternId("none");
    setGlowId("soft");
    setFormatId("portrait");
    setFontScale(1);
    setAlignment("left");
    Haptics.selectionAsync();
  };

  const save = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCurrent(current);
    router.dismissAll();
  };

  const logShareEvent = (channel: "system_share" | "download") => {
    if (!current.aiOutputId) return;
    recordShare(
      current.aiOutputId,
      {
        theme: themeId,
        font: fontId,
        fontColor: fontColorId,
        pattern: patternId,
        glow: glowId,
        format: formatId,
        fontScale,
        alignment,
      },
      channel,
    ).catch((err) => console.warn("Could not record share:", err));
  };

  const captureCard = async () => {
    if (!cardRef.current) throw new Error("Card preview is not ready.");
    return captureRef(cardRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });
  };

  const shareCard = async () => {
    try {
      setIsExporting(true);
      const uri = await captureCard();
      if (!(await Sharing.isAvailableAsync())) {
        setExportError("Sharing is not available on this device.");
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `Share ${current.reference}`,
        UTI: "public.png",
      });
      logShareEvent("system_share");
    } catch {
      setExportError("Please try again after the card finishes loading.");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCard = async () => {
    if (!isPlus) {
      setProPaywall("download");
      return;
    }

    try {
      setExportError(null);
      setIsExporting(true);

      setDownloadProgress({
        label: "Requesting permission…",
        percent: 10,
      });

      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        setDownloadProgress(null);
        setExportError(
          "Photo permission is required to save this card to your gallery. Please allow access in your device Settings and try again.",
        );
        return;
      }

      setDownloadProgress({
        label: "Rendering card…",
        percent: 35,
      });

      const uri = await captureCard();

      if (!uri) {
        throw new Error("The card image could not be created.");
      }

      setDownloadProgress({
        label: "Saving to gallery…",
        percent: 70,
      });

      const asset = await MediaLibrary.createAssetAsync(uri);

      let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);

      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        album = await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
      }

      setDownloadProgress({
        label: "Done!",
        percent: 100,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      notifyDownloadComplete(
        "Card saved",
        `${current.reference} is saved to your "${ALBUM_NAME}" album.`,
      );

      logShareEvent("download");

      setTimeout(() => {
        setDownloadProgress(null);
      }, 700);
    } catch (error) {
      console.error("Card download failed:", error);

      setDownloadProgress(null);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to save the card to your gallery.";

      setExportError(
        message || "Unable to save the card to your gallery. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Close designer"
            onPress={() => router.back()}
            style={[styles.roundButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              CARD STUDIO
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Make it yours
            </Text>
          </View>
          <Pressable
            onPress={save}
            style={[styles.done, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View ref={cardRef} collapsable={false}>
            <LinearGradient
              colors={selectedTheme.colors}
              style={[
                styles.preview,
                {
                  shadowColor: selectedTheme.accent,
                  shadowOpacity: glow.value,
                  elevation:
                    glowId === "radiant" ? 18 : glowId === "soft" ? 10 : 2,
                  minHeight:
                    formatId === "story"
                      ? 440
                      : formatId === "square"
                        ? 290
                        : 370,
                  borderWidth: 1,
                  borderColor: hexToRgba(
                    isLightCard ? "#000000" : "#FFFFFF",
                    isLightCard ? 0.06 : 0.08,
                  ),
                },
              ]}
            >
              <Text
                pointerEvents="none"
                style={[
                  styles.quoteMark,
                  { color: hexToRgba(selectedTheme.accent, 0.14) },
                ]}
              >
                “
              </Text>
              {patternId === "rays" && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.patternOrb,
                    { borderColor: selectedTheme.accent },
                  ]}
                />
              )}
              {patternId === "dots" && (
                <View pointerEvents="none" style={styles.dotPattern}>
                  {Array.from({ length: 28 }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.patternDot,
                        { backgroundColor: selectedTheme.accent },
                      ]}
                    />
                  ))}
                </View>
              )}
              {patternId === "frame" && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.patternFrame,
                    { borderColor: selectedTheme.accent },
                  ]}
                />
              )}
              <View
                style={[
                  styles.referenceChip,
                  {
                    backgroundColor: hexToRgba(selectedTheme.accent, 0.14),
                    alignSelf: alignment === "center" ? "center" : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[styles.reference, { color: selectedTheme.accent }]}
                >
                  {current.reference} · {current.translation}
                </Text>
              </View>
              <Text
                style={[
                  styles.verse,
                  {
                    color: cardText,
                    fontFamily: selectedFont.family,
                    fontSize: 24 * fontScale,
                    lineHeight: 32 * fontScale,
                    textAlign: alignment,
                  },
                ]}
              >
                {current.verse}
              </Text>
              <LinearGradient
                colors={
                  alignment === "center"
                    ? [
                        hexToRgba(selectedTheme.accent, 0),
                        selectedTheme.accent,
                        hexToRgba(selectedTheme.accent, 0),
                      ]
                    : [selectedTheme.accent, hexToRgba(selectedTheme.accent, 0)]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.rule,
                  {
                    alignSelf: alignment === "center" ? "center" : "flex-start",
                  },
                ]}
              />
              <View
                style={[
                  styles.aiLabel,
                  {
                    backgroundColor: hexToRgba(selectedTheme.accent, 0.12),
                    alignSelf: alignment === "center" ? "center" : "flex-start",
                  },
                ]}
              >
                <Ionicons
                  name="sparkles"
                  size={11}
                  color={selectedTheme.accent}
                />
                <Text
                  style={[styles.aiLabelText, { color: selectedTheme.accent }]}
                >
                  AI EXPLANATION
                </Text>
              </View>
              <Text
                style={[
                  styles.explanation,
                  {
                    color: mutedCardText,
                    fontFamily: selectedFont.family,
                    textAlign: alignment,
                  },
                ]}
              >
                {current.insight}
              </Text>
              <View
                style={[
                  styles.brandRow,
                  {
                    justifyContent:
                      alignment === "center" ? "center" : "flex-start",
                  },
                ]}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={10}
                  color={mutedCardText}
                />
                <Text style={[styles.brand, { color: mutedCardText }]}>
                  DAILY INSIGHT
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.studioHeading}>
            <ControlLabel title="CARD FORMAT" />
            <Pressable
              accessibilityLabel="Reset card design"
              onPress={resetDesign}
              style={styles.reset}
            >
              <Ionicons name="refresh" size={15} color={colors.primary} />
              <Text style={[styles.resetText, { color: colors.primary }]}>
                Reset
              </Text>
            </Pressable>
          </View>
          <View style={styles.optionGrid}>
            {[
              ["square", "Square"],
              ["portrait", "Portrait"],
              ["story", "Story"],
            ].map(([id, label]) => (
              <Pressable
                key={id}
                onPress={() => setFormatId(id)}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor:
                      formatId === id ? colors.primarySoft : colors.surface,
                    borderColor:
                      formatId === id ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="resize-outline"
                  size={17}
                  color={colors.primary}
                />
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <ControlLabel title="TEXT LAYOUT" />
          <View style={styles.optionGrid}>
            <Pressable
              accessibilityLabel="Decrease font size"
              onPress={() =>
                setFontScale((value) =>
                  Math.max(0.82, Number((value - 0.09).toFixed(2))),
                )
              }
              style={[
                styles.optionPill,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name="remove" size={18} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.text }]}>
                Smaller
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Increase font size"
              onPress={() =>
                setFontScale((value) =>
                  Math.min(1.18, Number((value + 0.09).toFixed(2))),
                )
              }
              style={[
                styles.optionPill,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.text }]}>
                Larger
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Change text alignment"
              onPress={() =>
                setAlignment((value) => (value === "left" ? "center" : "left"))
              }
              style={[
                styles.optionPill,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name={
                  alignment === "left"
                    ? "reorder-two-outline"
                    : "reorder-three-outline"
                }
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.optionText, { color: colors.text }]}>
                {alignment === "left" ? "Left" : "Centre"}
              </Text>
            </Pressable>
          </View>

          <ControlLabel title="CARD STYLE" />
          <View style={styles.choiceRow}>
            {cardThemes.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  chooseOption(`theme:${item.id}`, item, () =>
                    setThemeId(item.id),
                  )
                }
                style={[
                  styles.themeChoice,
                  {
                    backgroundColor: item.colors[0],
                    borderColor:
                      themeId === item.id ? colors.primary : colors.border,
                  },
                ]}
              >
                {item.proOnly && !isPlus ? (
                  <Ionicons name="lock-closed" size={16} color="#FFF" />
                ) : item.premium && !unlocked.includes(`theme:${item.id}`) ? (
                  <Ionicons name="play-circle" size={18} color="#FFF" />
                ) : themeId === item.id ? (
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                ) : null}
                <Text style={styles.themeLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <ControlLabel title="FONT" />
          <View style={styles.choiceRow}>
            {fontChoices.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  chooseOption(`font:${item.id}`, item, () =>
                    setFontId(item.id),
                  )
                }
                style={[
                  styles.fontChoice,
                  {
                    backgroundColor:
                      fontId === item.id ? colors.primarySoft : colors.surface,
                    borderColor:
                      fontId === item.id ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fontSample,
                    { color: colors.text, fontFamily: item.family },
                  ]}
                >
                  Aa
                </Text>
                <Text style={[styles.fontLabel, { color: colors.textMuted }]}>
                  {item.label}
                </Text>
                {item.premium && !unlocked.includes(`font:${item.id}`) && (
                  <Ionicons
                    name="play-circle-outline"
                    size={14}
                    color={colors.primary}
                  />
                )}
              </Pressable>
            ))}
          </View>

          <ControlLabel title="FONT COLOUR" />
          <View style={styles.colorRow}>
            {fontColors.map((item) => {
              const active = fontColorId === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityLabel={`${item.label} font colour`}
                  onPress={() =>
                    chooseOption(`color:${item.id}`, item, () =>
                      setFontColorId(item.id),
                    )
                  }
                  style={styles.colorChoice}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      {
                        backgroundColor: item.color ?? colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {item.id === "auto" ? (
                      <Text style={[styles.autoText, { color: colors.text }]}>
                        A
                      </Text>
                    ) : active ? (
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color={item.id === "ink" ? "#FFF" : "#33261D"}
                      />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.colorLabel,
                      { color: active ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.proOnly && !isPlus ? (
                    <Ionicons
                      name="lock-closed"
                      size={11}
                      color={colors.primary}
                    />
                  ) : (
                    item.premium &&
                    !unlocked.includes(`color:${item.id}`) && (
                      <Ionicons
                        name="play-circle-outline"
                        size={12}
                        color={colors.primary}
                      />
                    )
                  )}
                </Pressable>
              );
            })}
          </View>

          <ControlLabel title="PATTERN" />
          <View style={styles.optionGrid}>
            {patterns.map((item) => {
              const active = patternId === item.id;
              const adLocked =
                item.premium &&
                !item.proOnly &&
                !unlocked.includes(`pattern:${item.id}`);
              const proLocked = item.proOnly && !isPlus;
              return (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    chooseOption(`pattern:${item.id}`, item, () =>
                      setPatternId(item.id),
                    )
                  }
                  style={[
                    styles.optionPill,
                    {
                      backgroundColor: active
                        ? colors.primarySoft
                        : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      proLocked
                        ? "lock-closed"
                        : adLocked
                          ? "play-circle-outline"
                          : item.icon
                    }
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ControlLabel title="GLOW" />
          <View style={styles.optionGrid}>
            {glowChoices.map((item) => {
              const active = glowId === item.id;
              const adLocked =
                item.premium &&
                !item.proOnly &&
                !unlocked.includes(`glow:${item.id}`);
              const proLocked = item.proOnly && !isPlus;
              return (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    chooseOption(`glow:${item.id}`, item, () =>
                      setGlowId(item.id),
                    )
                  }
                  style={[
                    styles.optionPill,
                    {
                      backgroundColor: active
                        ? colors.primarySoft
                        : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      proLocked
                        ? "lock-closed"
                        : adLocked
                          ? "play-circle-outline"
                          : "sparkles-outline"
                    }
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={[styles.rewardNote, { backgroundColor: colors.primarySoft }]}
          >
            <Ionicons name="play-circle" size={20} color={colors.primary} />
            <Text style={[styles.rewardNoteText, { color: colors.text }]}>
              Play icons unlock a style for this card after one rewarded ad.
              Lock icons are Pro-exclusive — ads can't unlock those.
            </Text>
          </View>

          <View
            style={[
              styles.lockedText,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={colors.primary}
            />
            <Text style={[styles.lockedTextCopy, { color: colors.textMuted }]}>
              AI-generated explanations are locked to preserve disclosure and
              content integrity.
            </Text>
          </View>
        </ScrollView>
        <View
          style={[
            styles.stickyFooter,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Pressable
            disabled={isExporting}
            onPress={downloadCard}
            style={[styles.exportPrimary, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="download-outline" size={20} color="#FFF" />
            <Text style={styles.exportPrimaryText}>Download</Text>
          </Pressable>
          <Pressable
            disabled={isExporting}
            onPress={shareCard}
            style={[
              styles.exportSecondary,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.exportSecondaryText, { color: colors.text }]}>
              Share
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
      <ActionSheetModal
        visible={!!rewardKey}
        onRequestClose={() => setRewardKey(null)}
        icon="play-circle"
        title="Unlock this design"
        body="Watch one short rewarded ad to unlock this option for your current card. Generating a new verse or card will ask again."
        actions={[
          {
            label: designAdLoaded ? "Watch ad to unlock" : "Loading ad…",
            icon: "play",
            disabled: !designAdLoaded,
            onPress: () => {
              setRewardKey(null); // close first — an open Modal can block the native ad from presenting
              showDesignAd();
            },
          },
        ]}
      />
      <ActionSheetModal
        visible={!!proPaywall}
        onRequestClose={() => setProPaywall(null)}
        icon={proPaywall === "download" ? "download-outline" : "lock-closed"}
        title={
          proPaywall === "download" ? "Pro feature" : "Pro-exclusive style"
        }
        body={
          proPaywall === "download"
            ? "Downloading cards to your gallery is a Daily Insight Pro feature. Sharing stays free — you can always share this card instead."
            : "This one is only available with Daily Insight Pro — it can't be unlocked with an ad."
        }
        actions={[
          {
            label: "Upgrade to Pro",
            icon: "sparkles",
            onPress: () => {
              setProPaywall(null);
              router.push("/subscription");
            },
          },
        ]}
      />
      <ActionSheetModal
        visible={!!exportError}
        onRequestClose={() => setExportError(null)}
        icon="alert-circle-outline"
        title="Something went wrong"
        body={exportError ?? ""}
        actions={[{ label: "OK", onPress: () => setExportError(null) }]}
      />
      {downloadProgress && (
        <View style={styles.progressOverlay} pointerEvents="none">
          <View
            style={[styles.progressCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.progressLabel, { color: colors.text }]}>
              {downloadProgress.label}
            </Text>
            <View
              style={[styles.progressTrack, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${downloadProgress.percent}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function ControlLabel({ title }: { title: string }) {
  const { colors } = useAppTheme();
  return (
    <Text style={[styles.controlLabel, { color: colors.textMuted }]}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  header: {
    height: 66,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { alignItems: "center" },
  eyebrow: {
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.7,
  },
  headerTitle: { fontFamily: fonts.serif, fontSize: 20 },
  done: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
  },
  doneText: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontWeight: "800",
    fontSize: 13,
  },
  content: { padding: spacing.lg, paddingBottom: 120 },
  preview: {
    overflow: "hidden",
    minHeight: 370,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  quoteMark: {
    position: "absolute",
    top: -18,
    left: 12,
    fontSize: 96,
    fontFamily: fonts.serif,
  },
  patternOrb: {
    position: "absolute",
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 42,
    opacity: 0.09,
    top: -150,
    right: -115,
  },
  dotPattern: {
    position: "absolute",
    top: 22,
    right: 18,
    width: 112,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    opacity: 0.16,
  },
  patternDot: { width: 4, height: 4, borderRadius: 2 },
  patternFrame: {
    position: "absolute",
    top: 13,
    right: 13,
    bottom: 13,
    left: 13,
    borderWidth: 1,
    borderRadius: radius.md,
    opacity: 0.25,
  },
  referenceChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  reference: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  verse: { fontSize: 24, lineHeight: 32, marginTop: spacing.md },
  rule: { width: 40, height: 2.5, borderRadius: 2, marginVertical: spacing.sm },
  aiLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: 6,
  },
  aiLabelText: {
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  explanation: { fontSize: 14, lineHeight: 20 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: "auto",
    paddingTop: spacing.sm,
  },
  brand: {
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
  },
  controlLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  studioHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  reset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingBottom: spacing.sm,
  },
  resetText: { fontFamily: fonts.sans, fontSize: 10, fontWeight: "800" },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  themeChoice: {
    width: "31%",
    height: 68,
    borderWidth: 2,
    borderRadius: radius.sm,
    padding: spacing.sm,
    justifyContent: "space-between",
  },
  themeLabel: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "700",
  },
  fontChoice: {
    width: "31%",
    height: 76,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  fontSample: { fontSize: 23 },
  fontLabel: { fontFamily: fonts.sans, fontSize: 9 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  colorChoice: { width: "21%", alignItems: "center", gap: 4 },
  colorSwatch: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  autoText: { fontFamily: fonts.serif, fontSize: 18, fontWeight: "800" },
  colorLabel: { fontFamily: fonts.sans, fontSize: 9, fontWeight: "700" },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  optionPill: {
    minWidth: 92,
    flexGrow: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  optionText: { fontFamily: fonts.sans, fontSize: 11, fontWeight: "700" },
  rewardNote: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rewardNoteText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
  },
  lockedText: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  lockedTextCopy: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
  },
  stickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  exportPrimary: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  exportPrimaryText: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "800",
  },
  exportSecondary: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  exportSecondaryText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "800",
  },
  progressOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  progressCard: {
    width: "78%",
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  progressLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
});
