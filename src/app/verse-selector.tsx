import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { getLocales } from "expo-localization";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionSheetModal } from "@/components/action-sheet-modal";
import { SelectField, type SelectOption } from "@/components/select-field";
import { UsageBadge } from "@/components/usage-badge";
import { VerseCard } from "@/components/verse-card";
import { fonts, radius, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useRewardedAd } from "@/hooks/use-rewarded-ad";
import {
  fetchKjvBooks,
  fetchKjvChapter,
  fetchKjvChapters,
} from "@/services/bible-service";
import {
  GenerateInsightError,
  generateInsight,
} from "@/services/generation-service";
import { fetchStyleDimensions } from "@/services/style-dimensions-service";
import { useInsightStore } from "@/store/insight-store";
import { usePreferencesStore } from "@/store/preferences-store";
import { useUsageStore } from "@/store/usage-store";

type Step = 0 | 1 | 2;

export default function CreateInsightScreen() {
  const { colors } = useAppTheme();
  const [step, setStep] = useState<Step>(0);
  const [bookId, setBookId] = useState("Genesis");
  const [bookOptions, setBookOptions] = useState<SelectOption[]>([]);
  const [chapterOptions, setChapterOptions] = useState<SelectOption[]>([]);
  const [verseOptions, setVerseOptions] = useState<SelectOption[]>([]);
  const [chapter, setChapter] = useState("1");
  const [verse, setVerse] = useState("1");
  const detectedCountry = getLocales()[0]?.regionCode ?? "US";
  const regionPreference = usePreferencesStore(
    (state) => state.regionPreference,
  );
  const preferredCountry =
    regionPreference === "auto" ? detectedCountry : regionPreference;
  const [countryCode, setCountryCode] = useState(preferredCountry);
  const [generationTypes, setGenerationTypes] = useState<SelectOption[]>([]);
  const [allVoices, setAllVoices] = useState<
    (SelectOption & { restrictedToCountry: string | null })[]
  >([]);
  const [countryOptions, setCountryOptions] = useState<SelectOption[]>([]);
  const [dimensionsLoading, setDimensionsLoading] = useState(true);
  const [dimensionsError, setDimensionsError] = useState<string | null>(null);
  const regionalVoices = useMemo(
    () =>
      allVoices.filter(
        (item) =>
          !item.restrictedToCountry || item.restrictedToCountry === countryCode,
      ),
    [allVoices, countryCode],
  );
  const [generationType, setGenerationType] = useState("funny");
  const [voice, setVoice] = useState("standard");
  const [verseText, setVerseText] = useState(
    "In the beginning God created the heaven and the earth.",
  );
  const [resolvedReference, setResolvedReference] = useState("Genesis 1:1");
  const [generatedText, setGeneratedText] = useState(
    "You do not have to face fear alone. God promises to stay close and give you strength.",
  );
  const [aiOutputId, setAiOutputId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentInsight = useInsightStore((state) => state.setCurrent);
  const usage = useUsageStore();
  const [choicesLoading, setChoicesLoading] = useState(true);
  const book =
    bookOptions.find((item) => item.value === bookId)?.label ?? "Genesis";

  const [adRewardErrorVisible, setAdRewardErrorVisible] = useState(false);
  const { isLoaded: adLoaded, show: showRewardedAd } = useRewardedAd(() => {
    usage
      .redeemAdReward()
      .then(() => {
        performGeneration();
      })
      .catch(() => setAdRewardErrorVisible(true));
  });

  useEffect(() => {
    usage.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStyleDimensions()
      .then((dimensions) => {
        setGenerationTypes(
          dimensions.tones.map((item) => ({
            value: item.value,
            label: item.label,
            subtitle: item.subtitle ?? undefined,
          })),
        );
        setAllVoices(
          dimensions.voices.map((item) => ({
            value: item.value,
            label: item.label,
            subtitle: item.subtitle ?? undefined,
            restrictedToCountry: item.restrictedToCountry,
          })),
        );
        setCountryOptions(
          dimensions.countries.map((item) => ({
            value: item.value,
            label: item.label,
            subtitle: item.subtitle ?? undefined,
          })),
        );
        setGenerationType((current) =>
          dimensions.tones.some((t) => t.value === current)
            ? current
            : (dimensions.tones[0]?.value ?? current),
        );
      })
      .catch((err) =>
        setDimensionsError(
          err instanceof Error ? err.message : "Unable to load style options.",
        ),
      )
      .finally(() => setDimensionsLoading(false));
  }, []);

  useEffect(() => {
    fetchKjvBooks()
      .then((items) => {
        setBookOptions(
          items.map((item) => ({ value: item.id, label: item.name })),
        );
        setBookId((current) =>
          items.some((item) => item.id === current)
            ? current
            : (items[0]?.id ?? current),
        );
      })
      .finally(() => setChoicesLoading(false));
  }, []);

  useEffect(() => {
    fetchKjvChapters(bookId).then((items) => {
      const options = items.map((item) => ({
        value: String(item.chapter),
        label: `Chapter ${item.chapter}`,
      }));
      setChapterOptions(options);
      setChapter(options[0]?.value ?? "1");
    });
  }, [bookId]);

  useEffect(() => {
    fetchKjvChapter(bookId, chapter).then((items) => {
      const options = items.map((item) => ({
        value: String(item.verse),
        label: `Verse ${item.verse}`,
      }));
      setVerseOptions(options);
      setVerse(options[0]?.value ?? "1");
    });
  }, [bookId, chapter]);

  const voiceTitle = useMemo(
    () =>
      regionalVoices.find((item) => item.value === voice)?.label ??
      "Standard English",
    [regionalVoices, voice],
  );

  const [creditPromptVisible, setCreditPromptVisible] = useState(false);
  const [dailyCapPromptVisible, setDailyCapPromptVisible] = useState(false);

  const performGeneration = async () => {
    if (!usage.isPro && usage.freeGenerateCredits <= 0) {
      setCreditPromptVisible(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateInsight({
        book,
        chapter,
        verse,
        category: generationType,
        regionalVoice: voice,
        country: countryCode,
      });
      setVerseText(result.scripture);
      setResolvedReference(result.reference);
      setGeneratedText(result.explanation.text);
      setAiOutputId(result.explanation.id);
      if (result.usage) usage.applySnapshot(result.usage);
      setStep(2);
    } catch (requestError) {
      if (
        requestError instanceof GenerateInsightError &&
        requestError.code === "NO_GENERATE_CREDITS"
      ) {
        setCreditPromptVisible(true);
      } else if (
        requestError instanceof GenerateInsightError &&
        requestError.code === "DAILY_CAP_REACHED"
      ) {
        setDailyCapPromptVisible(true);
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to generate this insight. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1) {
      void performGeneration();
      return;
    }
    setStep((current) => Math.min(2, current + 1) as Step);
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    Haptics.selectionAsync();
    setStep((current) => Math.max(0, current - 1) as Step);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel={step === 0 ? "Close" : "Previous step"}
            onPress={goBack}
            style={[styles.roundButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons
              name={step === 0 ? "close" : "arrow-back"}
              size={22}
              color={colors.text}
            />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerEyebrow, { color: colors.primary }]}>
              CREATE INSIGHT
            </Text>
            <Text style={[styles.headerStep, { color: colors.textMuted }]}>
              Step {step + 1} of 3
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Close"
            onPress={() => router.back()}
            style={[styles.roundButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="remove" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.usageRow}>
          <UsageBadge onPress={() => router.push("/subscription")} />
          {!usage.isPro && !adLoaded && (
            <Text style={[styles.adLoadingHint, { color: colors.textMuted }]}>
              Loading ad…
            </Text>
          )}
        </View>

        <StepRail
          step={step}
          onStepPress={(target) => {
            if (target === 0) setStep(0);
            if (target === 1) setStep(1);
            if (target === 2 && step === 1) void performGeneration();
            if (target === 2 && step === 2) setStep(2);
          }}
        />

        <View style={styles.stage}>
          {step === 0 && (
            <Animated.View
              key="scripture"
              entering={FadeInRight.duration(300)}
              exiting={FadeOutLeft.duration(180)}
              style={styles.flex}
            >
              <ScriptureStep
                bookId={bookId}
                setBookId={setBookId}
                bookOptions={bookOptions}
                chapter={chapter}
                setChapter={setChapter}
                chapterOptions={chapterOptions}
                verse={verse}
                setVerse={setVerse}
                verseOptions={verseOptions}
                loading={choicesLoading}
                onContinue={goNext}
              />
            </Animated.View>
          )}
          {step === 1 && (
            <Animated.View
              key="voice"
              entering={FadeInRight.duration(300)}
              exiting={FadeOutLeft.duration(180)}
              style={styles.flex}
            >
              <VoiceStep
                generationType={generationType}
                setGenerationType={setGenerationType}
                generationTypes={generationTypes}
                voice={voice}
                setVoice={setVoice}
                countryCode={countryCode}
                countryOptions={countryOptions}
                setCountryCode={(value) => {
                  setCountryCode(value);
                  const availableForCountry = allVoices.filter(
                    (item) =>
                      !item.restrictedToCountry ||
                      item.restrictedToCountry === value,
                  );
                  const preferred =
                    availableForCountry.find(
                      (item) => item.restrictedToCountry === value,
                    ) ?? availableForCountry[0];
                  if (preferred) setVoice(preferred.value);
                }}
                regionalVoices={regionalVoices}
                isLoading={isLoading}
                dimensionsLoading={dimensionsLoading}
                error={error ?? dimensionsError}
                onContinue={() => void performGeneration()}
              />
            </Animated.View>
          )}
          {step === 2 && (
            <Animated.View
              key="preview"
              entering={FadeInRight.duration(300)}
              exiting={FadeOutLeft.duration(180)}
              style={styles.flex}
            >
              <PreviewStep
                reference={resolvedReference}
                translation="KJV"
                verseText={verseText}
                insight={generatedText}
                voice={voiceTitle}
                onCustomize={() => {
                  setCurrentInsight({
                    reference: resolvedReference,
                    translation: "KJV",
                    verse: verseText,
                    insight: generatedText,
                    voice: voiceTitle,
                    generationType,
                    aiOutputId: aiOutputId ?? undefined,
                  });
                  router.replace("/designer");
                }}
              />
            </Animated.View>
          )}
        </View>

        <View style={styles.footer}>
          {step < 2 ? (
            <View style={styles.nextArea}>
              {error && <Text style={styles.error}>{error}</Text>}
              <Pressable
                disabled={isLoading}
                onPress={goNext}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: isLoading ? 0.72 : 1,
                  },
                ]}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator color="#FFF" />
                    <Text style={styles.primaryText}>Loading KJV verse…</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.primaryText}>
                      {step === 0 ? "Continue to style" : "Create preview"}
                    </Text>
                    <Ionicons
                      name={step === 0 ? "arrow-forward" : "sparkles"}
                      size={20}
                      color="#FFF"
                    />
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.previewActions}>
              <Pressable
                onPress={() => {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  setCurrentInsight({
                    reference: resolvedReference,
                    translation: "KJV",
                    verse: verseText,
                    insight: generatedText,
                    voice: voiceTitle,
                    generationType,
                    aiOutputId: aiOutputId ?? undefined,
                  });
                  router.replace("/designer");
                }}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="color-palette-outline" size={21} color="#FFF" />
                <Text style={styles.primaryText}>Customize card</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Regenerate insight"
                onPress={() => Haptics.selectionAsync()}
                style={[styles.regenerate, { backgroundColor: colors.surface }]}
              >
                <Ionicons name="refresh" size={21} color={colors.text} />
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
      <ActionSheetModal
        visible={creditPromptVisible}
        onRequestClose={() => setCreditPromptVisible(false)}
        icon="flash-outline"
        title="You're out of free generations"
        body={
          adLoaded
            ? "Watch a short ad to unlock 2 more, or upgrade to Pro for a much higher daily limit."
            : "Upgrade to Pro for a much higher daily limit, or wait a moment for an ad to load."
        }
        actions={[
          {
            label: adLoaded ? "Watch ad" : "Loading ad…",
            icon: "play",
            disabled: !adLoaded,
            onPress: () => {
              setCreditPromptVisible(false);
              showRewardedAd();
            },
          },
          {
            label: "Upgrade to Pro",
            icon: "sparkles",
            variant: "outline",
            onPress: () => {
              setCreditPromptVisible(false);
              router.push("/subscription");
            },
          },
        ]}
      />
      <ActionSheetModal
        visible={dailyCapPromptVisible}
        onRequestClose={() => setDailyCapPromptVisible(false)}
        icon="time-outline"
        title="Daily limit reached"
        body="You've used today's Pro generations. It resets tomorrow."
        actions={[]}
        dismissLabel="Got it"
      />
    </View>
  );
}

function StepRail({
  step,
  onStepPress,
}: {
  step: Step;
  onStepPress: (step: Step) => void;
}) {
  const { colors } = useAppTheme();
  const items = [
    ["book-outline", "Scripture"],
    ["options-outline", "Style"],
    ["sparkles-outline", "Preview"],
  ] as const;
  return (
    <View style={styles.stepRail}>
      {items.map(([icon, label], index) => {
        const active = index === step;
        const complete = index < step;
        return (
          <Pressable
            key={label}
            onPress={() => onStepPress(index as Step)}
            style={styles.stepItem}
          >
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    active || complete ? colors.primary : colors.surface,
                  borderColor:
                    active || complete ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name={complete ? "checkmark" : icon}
                size={16}
                color={active || complete ? "#FFF" : colors.textMuted}
              />
            </View>
            <Text
              style={[
                styles.stepLabel,
                { color: active ? colors.primary : colors.textMuted },
                active && styles.stepLabelActive,
              ]}
            >
              {label}
            </Text>
            {index < items.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  {
                    backgroundColor: complete ? colors.primary : colors.border,
                  },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function ScriptureStep({
  bookId,
  setBookId,
  bookOptions,
  chapter,
  setChapter,
  chapterOptions,
  verse,
  setVerse,
  verseOptions,
  loading,
  onContinue,
}: {
  bookId: string;
  setBookId: (value: string) => void;
  bookOptions: SelectOption[];
  chapter: string;
  setChapter: (value: string) => void;
  chapterOptions: SelectOption[];
  verse: string;
  setVerse: (value: string) => void;
  verseOptions: SelectOption[];
  loading: boolean;
  onContinue: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StepHeading
        title="Which word speaks to you?"
        subtitle="Choose the exact book, chapter, and verse. Scripture is always loaded from the KJV."
      />
      <SelectField
        label="Book"
        value={bookId}
        options={bookOptions}
        onChange={setBookId}
        searchable
        loading={loading}
      />
      <View style={styles.referenceRow}>
        <View style={styles.flex}>
          <SelectField
            label="Chapter"
            value={chapter}
            options={chapterOptions}
            onChange={setChapter}
            disabled={!chapterOptions.length}
          />
        </View>
        <View style={styles.flex}>
          <SelectField
            label="Verse"
            value={verse}
            options={verseOptions}
            onChange={setVerse}
            disabled={!verseOptions.length}
          />
        </View>
      </View>

      <Text style={[styles.label, { color: colors.textMuted }]}>
        TRANSLATION
      </Text>
      <View
        style={[
          styles.lockedTranslation,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.translationIcon,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <Ionicons name="book-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.translationCopy}>
          <Text style={[styles.translationTitle, { color: colors.text }]}>
            King James Version
          </Text>
          <Text style={[styles.translationNote, { color: colors.textMuted }]}>
            KJV · Public domain
          </Text>
        </View>
        <Ionicons name="lock-closed" size={17} color={colors.textMuted} />
      </View>
      <InlineAction
        label="Continue to style"
        icon="arrow-forward"
        onPress={onContinue}
      />
    </ScrollView>
  );
}

function VoiceStep({
  generationType,
  setGenerationType,
  generationTypes,
  voice,
  setVoice,
  countryCode,
  setCountryCode,
  countryOptions,
  regionalVoices,
  isLoading,
  dimensionsLoading,
  error,
  onContinue,
}: {
  generationType: string;
  setGenerationType: (value: string) => void;
  generationTypes: SelectOption[];
  voice: string;
  setVoice: (value: string) => void;
  countryCode: string;
  setCountryCode: (value: string) => void;
  countryOptions: SelectOption[];
  regionalVoices: SelectOption[];
  isLoading: boolean;
  dimensionsLoading: boolean;
  error: string | null;
  onContinue: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StepHeading
        title="How should it sound?"
        subtitle="Choose the type of explanation and a regional voice. The KJV scripture stays untouched."
      />
      <SelectField
        label="Generation type"
        value={generationType}
        options={generationTypes}
        onChange={setGenerationType}
      />
      <SelectField
        label="Country or region"
        value={countryCode}
        options={countryOptions}
        onChange={setCountryCode}
        searchable
      />
      <SelectField
        label="Regional voice"
        value={voice}
        options={regionalVoices}
        onChange={setVoice}
      />
      <View style={[styles.countryNote, { backgroundColor: colors.surface }]}>
        <Ionicons name="location-outline" size={20} color={colors.primary} />
        <Text style={[styles.countryNoteText, { color: colors.textMuted }]}>
          {countryCode === "NG"
            ? "Nigeria detected from your device region. Warri and Naija Pidgin were added."
            : `Regional suggestions use your device country (${countryCode}). You can change this in Settings.`}
        </Text>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <InlineAction
        label={
          dimensionsLoading
            ? "Loading style options…"
            : isLoading
              ? "Loading KJV verse…"
              : "Create preview"
        }
        icon="sparkles"
        onPress={onContinue}
        disabled={isLoading || dimensionsLoading}
      />
    </ScrollView>
  );
}

function PreviewStep({
  reference,
  translation,
  verseText,
  insight,
  voice,
  onCustomize,
}: {
  reference: string;
  translation: string;
  verseText: string;
  insight: string;
  voice: string;
  onCustomize: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StepHeading
        title="Here is your moment."
        subtitle={`A ${voice} explanation. You can regenerate it or continue to the card designer.`}
      />
      <View style={[styles.aiBadge, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name="sparkles" size={14} color={colors.primary} />
        <Text style={[styles.aiBadgeText, { color: colors.primary }]}>
          AI-GENERATED EXPLANATION
        </Text>
      </View>
      <VerseCard
        reference={reference}
        translation={translation}
        verse={verseText}
        insight={insight}
      />
      <View style={[styles.aiNote, { backgroundColor: colors.surface }]}>
        <Ionicons
          name="information-circle-outline"
          size={19}
          color={colors.primary}
        />
        <Text style={[styles.aiNoteText, { color: colors.textMuted }]}>
          AI explains the passage; it does not replace or alter the scripture.
        </Text>
      </View>
      <InlineAction
        label="Customize this card"
        icon="color-palette-outline"
        onPress={onCustomize}
      />
    </ScrollView>
  );
}

function InlineAction({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.inlineAction,
        { backgroundColor: colors.primary, opacity: disabled ? 0.65 : 1 },
      ]}
    >
      {disabled && <ActivityIndicator color="#FFF" />}
      <Text style={styles.primaryText}>{label}</Text>
      {!disabled && <Ionicons name={icon} size={20} color="#FFF" />}
    </Pressable>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.heading}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  adLoadingHint: { fontFamily: fonts.sans, fontSize: 11 },
  header: {
    height: 64,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCenter: { alignItems: "center", gap: 2 },
  headerEyebrow: {
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  headerStep: { fontFamily: fonts.sans, fontSize: 11 },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  stepRail: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  stepItem: { flex: 1, alignItems: "center", position: "relative", gap: 5 },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepLabel: { fontFamily: fonts.sans, fontSize: 10, fontWeight: "600" },
  stepLabelActive: { fontWeight: "800" },
  stepConnector: {
    position: "absolute",
    height: 2,
    left: "67%",
    right: "-33%",
    top: 16,
  },
  stage: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  heading: { gap: spacing.sm, marginBottom: spacing.md },
  title: { fontFamily: fonts.serif, fontSize: 31, lineHeight: 38 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22 },
  label: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginTop: spacing.md,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: { fontFamily: fonts.sans, fontSize: 14, fontWeight: "600" },
  referenceRow: { flexDirection: "row", gap: spacing.md },
  stepper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  stepperLabel: { fontFamily: fonts.sans, fontSize: 11 },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: { fontFamily: fonts.sans, fontSize: 19, fontWeight: "800" },
  voiceList: { gap: spacing.sm },
  voiceCard: {
    minHeight: 84,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  voiceIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceCopy: { flex: 1, gap: 4 },
  voiceTitle: { fontFamily: fonts.sans, fontSize: 16, fontWeight: "700" },
  voiceDescription: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  aiNote: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  aiNoteText: { flex: 1, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  aiBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiBadgeText: {
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  countryNote: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  countryNoteText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  gateBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.58)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  gateCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  gateIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
  },
  gateTitle: {
    fontFamily: fonts.serif,
    fontSize: 26,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  gateBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  gatePrimary: {
    width: "100%",
    height: 56,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  gatePrimaryText: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: "800",
  },
  gateCancel: { padding: spacing.md },
  gateCancelText: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "600" },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  nextArea: { gap: spacing.sm },
  error: {
    color: "#C4473A",
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  primaryButton: {
    flex: 1,
    height: 58,
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
    fontWeight: "800",
  },
  inlineAction: {
    height: 58,
    borderRadius: radius.md,
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  previewActions: { flexDirection: "row", gap: spacing.sm },
  lockedTranslation: {
    minHeight: 70,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  translationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  translationCopy: { flex: 1, gap: 3 },
  translationTitle: { fontFamily: fonts.sans, fontSize: 15, fontWeight: "700" },
  translationNote: { fontFamily: fonts.sans, fontSize: 11 },
  regenerate: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
