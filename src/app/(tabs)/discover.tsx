import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionSheetModal } from "@/components/action-sheet-modal";
import { ScreenHeader } from "@/components/screen-header";
import { fonts, radius, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useRewardedAd } from "@/hooks/use-rewarded-ad";
import { fetchKjvVerse } from "@/services/bible-service";
import {
  GenerateInsightError,
  generateInsight,
} from "@/services/generation-service";
import { useInsightStore } from "@/store/insight-store";
import { useUsageStore } from "@/store/usage-store";
import type { Insight } from "@/types/insight";

type Topic = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  tint: string;
  verses: Insight[];
};

const makeVerse = (
  reference: string,
  verse: string,
  insight: string,
): Insight => ({
  reference,
  translation: "KJV",
  verse,
  insight,
  voice: "Standard English",
});

const topics: Topic[] = [
  {
    id: "hope",
    icon: "sunny-outline",
    title: "Hope",
    subtitle: "When you need light",
    tint: "#F3A23A",
    verses: [
      makeVerse(
        "Jeremiah 29:11",
        "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.",
        "God’s plans can hold hope even when your present season feels uncertain.",
      ),
      makeVerse(
        "Romans 15:13",
        "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope.",
        "Hope grows as trust makes room for joy and peace.",
      ),
      makeVerse(
        "Psalm 42:11",
        "Hope thou in God: for I shall yet praise him, who is the health of my countenance, and my God.",
        "A discouraged heart can still choose to look toward God.",
      ),
    ],
  },
  {
    id: "strength",
    icon: "shield-checkmark-outline",
    title: "Strength",
    subtitle: "For difficult seasons",
    tint: "#D46A3A",
    verses: [
      makeVerse(
        "Isaiah 41:10",
        "Fear thou not; for I am with thee: be not dismayed; for I am thy God.",
        "Courage begins with the assurance that you are not facing the moment alone.",
      ),
      makeVerse(
        "Philippians 4:13",
        "I can do all things through Christ which strengtheneth me.",
        "Strength is received, not merely manufactured by willpower.",
      ),
      makeVerse(
        "Psalm 46:1",
        "God is our refuge and strength, a very present help in trouble.",
        "God is both a safe place and a present source of strength.",
      ),
    ],
  },
  {
    id: "love",
    icon: "heart-outline",
    title: "Love",
    subtitle: "Grace in relationships",
    tint: "#D85C78",
    verses: [
      makeVerse(
        "1 Corinthians 13:4",
        "Charity suffereth long, and is kind; charity envieth not.",
        "True love is revealed through patience, kindness, and humility.",
      ),
      makeVerse(
        "1 John 4:19",
        "We love him, because he first loved us.",
        "Our ability to love begins with receiving God’s love.",
      ),
      makeVerse(
        "Colossians 3:14",
        "And above all these things put on charity, which is the bond of perfectness.",
        "Love is the bond that holds every other virtue together.",
      ),
    ],
  },
  {
    id: "peace",
    icon: "leaf-outline",
    title: "Peace",
    subtitle: "Slow down and breathe",
    tint: "#4E9B72",
    verses: [
      makeVerse(
        "John 14:27",
        "Peace I leave with you, my peace I give unto you.",
        "The peace Jesus gives is not controlled by surrounding circumstances.",
      ),
      makeVerse(
        "Philippians 4:7",
        "And the peace of God, which passeth all understanding, shall keep your hearts and minds.",
        "God’s peace can guard both emotion and thought.",
      ),
      makeVerse(
        "Psalm 4:8",
        "I will both lay me down in peace, and sleep: for thou, Lord, only makest me dwell in safety.",
        "Rest becomes possible when safety is placed in God’s hands.",
      ),
    ],
  },
  {
    id: "faith",
    icon: "flame-outline",
    title: "Faith",
    subtitle: "Trust for the next step",
    tint: "#8066C7",
    verses: [
      makeVerse(
        "Hebrews 11:1",
        "Now faith is the substance of things hoped for, the evidence of things not seen.",
        "Faith gives present confidence to what is not yet visible.",
      ),
      makeVerse(
        "Proverbs 3:5",
        "Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
        "Trust releases the need to understand every detail first.",
      ),
      makeVerse(
        "Mark 9:23",
        "If thou canst believe, all things are possible to him that believeth.",
        "Faith opens the heart to possibilities beyond present limitations.",
      ),
    ],
  },
  {
    id: "healing",
    icon: "medkit-outline",
    title: "Healing",
    subtitle: "Comfort for recovery",
    tint: "#2A9DA2",
    verses: [
      makeVerse(
        "Psalm 147:3",
        "He healeth the broken in heart, and bindeth up their wounds.",
        "God cares for wounds that cannot always be seen.",
      ),
      makeVerse(
        "Jeremiah 17:14",
        "Heal me, O Lord, and I shall be healed; save me, and I shall be saved.",
        "This prayer places complete confidence in God as healer and rescuer.",
      ),
      makeVerse(
        "Exodus 15:26",
        "For I am the Lord that healeth thee.",
        "Healing is presented as part of God’s compassionate character.",
      ),
    ],
  },
  {
    id: "wisdom",
    icon: "bulb-outline",
    title: "Wisdom",
    subtitle: "Clarity for decisions",
    tint: "#C18B27",
    verses: [
      makeVerse(
        "James 1:5",
        "If any of you lack wisdom, let him ask of God, that giveth to all men liberally.",
        "You can ask God plainly for the wisdom you lack.",
      ),
      makeVerse(
        "Proverbs 4:7",
        "Wisdom is the principal thing; therefore get wisdom.",
        "Wisdom deserves deliberate pursuit, not occasional attention.",
      ),
      makeVerse(
        "Proverbs 16:9",
        "A man’s heart deviseth his way: but the Lord directeth his steps.",
        "Good planning remains open to God’s direction.",
      ),
    ],
  },
  {
    id: "anxiety",
    icon: "cloud-outline",
    title: "Anxiety",
    subtitle: "When your mind feels heavy",
    tint: "#657C9B",
    verses: [
      makeVerse(
        "1 Peter 5:7",
        "Casting all your care upon him; for he careth for you.",
        "You can release your cares because you are personally cared for.",
      ),
      makeVerse(
        "Matthew 6:34",
        "Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.",
        "Grace invites you to return from tomorrow’s worries to today.",
      ),
      makeVerse(
        "Psalm 94:19",
        "In the multitude of my thoughts within me thy comforts delight my soul.",
        "Comfort can meet you even in the middle of racing thoughts.",
      ),
    ],
  },
];

const moreTopicReferences: Record<string, string[]> = {
  hope: [
    "Lamentations 3:22",
    "Lamentations 3:24",
    "Psalm 31:24",
    "Romans 5:5",
    "Hebrews 10:23",
    "Psalm 130:5",
    "Isaiah 40:31",
  ],
  strength: [
    "Deuteronomy 31:6",
    "Joshua 1:9",
    "Psalm 18:2",
    "Psalm 28:7",
    "Isaiah 40:29",
    "Ephesians 6:10",
    "2 Corinthians 12:9",
  ],
  love: [
    "John 3:16",
    "John 15:12",
    "Romans 12:10",
    "Ephesians 4:2",
    "1 Peter 4:8",
    "Proverbs 10:12",
    "1 Corinthians 16:14",
  ],
  peace: [
    "Isaiah 26:3",
    "Colossians 3:15",
    "Romans 5:1",
    "Psalm 29:11",
    "Numbers 6:26",
    "2 Thessalonians 3:16",
    "Proverbs 12:20",
  ],
  faith: [
    "Romans 10:17",
    "2 Corinthians 5:7",
    "Luke 1:37",
    "Matthew 17:20",
    "Galatians 2:20",
    "James 1:6",
    "Psalm 37:5",
  ],
  healing: [
    "Psalm 103:3",
    "Isaiah 53:5",
    "Proverbs 4:22",
    "James 5:15",
    "Psalm 30:2",
    "Jeremiah 30:17",
    "Proverbs 17:22",
  ],
  wisdom: [
    "Proverbs 2:6",
    "Proverbs 3:13",
    "Ecclesiastes 7:12",
    "Colossians 3:16",
    "Psalm 111:10",
    "Proverbs 19:20",
    "Daniel 2:21",
  ],
  anxiety: [
    "Philippians 4:6",
    "Matthew 11:28",
    "Isaiah 41:13",
    "Psalm 56:3",
    "John 14:1",
    "Psalm 23:4",
    "2 Timothy 1:7",
  ],
};

const topicInsights: Record<string, string> = {
  hope: "This verse points the heart toward confident expectation in God.",
  strength:
    "This scripture reminds us that strength and courage are available in difficult moments.",
  love: "This passage reveals how patient, generous, and faithful love should look.",
  peace:
    "This verse invites the heart to rest in God rather than surrender to the surrounding noise.",
  faith:
    "This scripture encourages trust even before the whole path becomes visible.",
  healing:
    "This passage offers comfort and points toward God’s care for body, heart, and spirit.",
  wisdom:
    "This verse offers direction for making thoughtful, God-centred decisions.",
  anxiety:
    "This scripture gently redirects worry toward trust, prayer, and God’s steady presence.",
};

const topicCategory: Record<string, string> = {
  hope: "inspirational",
  strength: "inspirational",
  love: "love",
  peace: "reflective",
  faith: "inspirational",
  healing: "reflective",
  wisdom: "educational",
  anxiety: "reflective",
};

export default function DiscoverScreen() {
  const { colors } = useAppTheme();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topicVerses, setTopicVerses] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const setCurrent = useInsightStore((state) => state.setCurrent);
  const saved = useInsightStore((state) => state.saved);
  const toggleSaved = useInsightStore((state) => state.toggleSaved);
  const usage = useUsageStore();
  const [revealedRefs, setRevealedRefs] = useState<Set<string>>(new Set());
  const [generatingRef, setGeneratingRef] = useState<string | null>(null);
  const [creditPromptVisible, setCreditPromptVisible] = useState(false);
  const [dailyCapPromptVisible, setDailyCapPromptVisible] = useState(false);
  const pendingVerseRef = useRef<Insight | null>(null);

  const { isLoaded: adLoaded, show: showRewardedAd } = useRewardedAd(() => {
    const verse = pendingVerseRef.current;
    if (!verse) return;
    setRevealedRefs((refs) => new Set(refs).add(verse.reference));
    generateForVerse(verse);
  });

  const generateForVerse = async (verse: Insight) => {
    const match = verse.reference.match(/^(.+)\s(\d+):(\d+)$/);
    if (!match || !selectedTopic) return;

    setGeneratingRef(verse.reference);
    try {
      const result = await generateInsight({
        book: match[1],
        chapter: match[2],
        verse: match[3],
        category: topicCategory[selectedTopic.id] ?? "inspirational",
        regionalVoice: "standard",
        country: "GLOBAL",
      });
      if (result.usage) usage.applySnapshot(result.usage);
      setTopicVerses((verses) =>
        verses.map((item) =>
          item.reference === verse.reference
            ? {
                ...item,
                reference: result.reference,
                translation: result.translation,
                verse: result.scripture,
                insight: result.explanation.text,
                aiOutputId: result.explanation.id,
              }
            : item,
        ),
      );
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
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to generate this explanation.",
        );
      }
    } finally {
      setGeneratingRef(null);
    }
  };

  // Pro skips the ad entirely. Free users need one rewarded ad per verse per
  // topic visit (resets whenever you open a topic again) before their normal
  // generate credit is spent — this is a separate gate from, and in addition
  // to, the credit itself.
  const unlockVerse = (verse: Insight) => {
    if (usage.isPro || revealedRefs.has(verse.reference)) {
      generateForVerse(verse);
      return;
    }
    if (!adLoaded) return;
    pendingVerseRef.current = verse;
    showRewardedAd();
  };

  const customize = (verse: Insight) => {
    setCurrent(verse);
    router.push("/designer");
  };

  const openTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    setTopicVerses([]);
    setRevealedRefs(new Set());
    setLoadError(null);
    setIsLoading(true);
    try {
      const candidates = [
        ...topic.verses,
        ...(moreTopicReferences[topic.id] ?? []).map((reference) =>
          makeVerse(
            reference,
            "",
            topicInsights[topic.id] ?? "A practical reminder from scripture.",
          ),
        ),
      ];
      const liveVerses = await Promise.all(
        candidates.map(async (item) => {
          const match = item.reference.match(/^(.+)\s(\d+):(\d+)$/);
          if (!match) return item;
          const result = await fetchKjvVerse(match[1], match[2], match[3]);
          return {
            ...item,
            reference: result.reference,
            translation: result.translation,
            verse: result.text,
          };
        }),
      );
      setTopicVerses(liveVerses);
    } catch {
      setTopicVerses(topic.verses);
      setLoadError(
        "Some verses could not be reached right now. Here are a few saved selections for you.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {selectedTopic ? (
            <>
              <Pressable
                onPress={() => setSelectedTopic(null)}
                style={styles.back}
              >
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={[styles.backText, { color: colors.primary }]}>
                  All topics
                </Text>
              </Pressable>
              <ScreenHeader
                eyebrow="KJV TOPIC COLLECTION"
                title={`${selectedTopic.title} for today.`}
                subtitle={selectedTopic.subtitle}
              />
              {isLoading && (
                <View
                  style={[
                    styles.loadingCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <ActivityIndicator color={colors.primary} />
                  <Text
                    style={[styles.loadingText, { color: colors.textMuted }]}
                  >
                    Finding verses for you…
                  </Text>
                </View>
              )}
              {loadError && <Text style={styles.errorText}>{loadError}</Text>}
              <View style={styles.verseList}>
                {topicVerses.map((verse) => {
                  const isSaved = saved.some(
                    (item) => item.reference === verse.reference,
                  );
                  const isUnlocked = !!verse.aiOutputId;
                  const isGenerating = generatingRef === verse.reference;
                  return (
                    <View
                      key={verse.reference}
                      style={[
                        styles.verseCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.verseMeta}>
                        <Text
                          style={[
                            styles.reference,
                            { color: selectedTopic.tint },
                          ]}
                        >
                          {verse.reference}
                        </Text>
                        {isUnlocked && (
                          <Pressable
                            accessibilityLabel={
                              isSaved ? "Remove saved verse" : "Save verse"
                            }
                            onPress={() => void toggleSaved(verse)}
                            style={[
                              styles.saveButton,
                              { backgroundColor: colors.primarySoft },
                            ]}
                          >
                            <Ionicons
                              name={isSaved ? "bookmark" : "bookmark-outline"}
                              size={19}
                              color={colors.primary}
                            />
                          </Pressable>
                        )}
                      </View>
                      <Text style={[styles.verse, { color: colors.text }]}>
                        “{verse.verse}”
                      </Text>

                      {isUnlocked ? (
                        <>
                          <Text
                            style={[styles.aiTag, { color: colors.primary }]}
                          >
                            ✦ AI EXPLANATION
                          </Text>
                          <Text
                            style={[
                              styles.insight,
                              { color: colors.textMuted },
                            ]}
                          >
                            {verse.insight}
                          </Text>
                          <Pressable
                            onPress={() => customize(verse)}
                            style={[
                              styles.customize,
                              { backgroundColor: colors.primary },
                            ]}
                          >
                            <Ionicons
                              name="color-palette-outline"
                              size={18}
                              color="#FFF"
                            />
                            <Text style={styles.customizeText}>
                              Create card
                            </Text>
                          </Pressable>
                        </>
                      ) : (
                        <Pressable
                          disabled={isGenerating || (!usage.isPro && !adLoaded)}
                          onPress={() => unlockVerse(verse)}
                          style={[
                            styles.customize,
                            {
                              backgroundColor: colors.primarySoft,
                              opacity:
                                isGenerating || (!usage.isPro && !adLoaded)
                                  ? 0.6
                                  : 1,
                              marginTop: spacing.lg,
                            },
                          ]}
                        >
                          {isGenerating ? (
                            <ActivityIndicator color={colors.primary} />
                          ) : (
                            <>
                              <Ionicons
                                name={usage.isPro ? "sparkles" : "play"}
                                size={18}
                                color={colors.primary}
                              />
                              <Text
                                style={[
                                  styles.customizeText,
                                  { color: colors.primary },
                                ]}
                              >
                                {usage.isPro
                                  ? "Reveal AI explanation"
                                  : adLoaded
                                    ? "Watch ad to reveal"
                                    : "Loading ad…"}
                              </Text>
                            </>
                          )}
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <ScreenHeader
                eyebrow="EXPLORE"
                title="What does your heart need?"
                subtitle="Choose a topic to discover scripture for the mood, moment, or encouragement you need."
              />
              <View style={styles.grid}>
                {topics.map((topic) => (
                  <Pressable
                    key={topic.id}
                    onPress={() => void openTopic(topic)}
                    style={({ pressed }) => [
                      styles.card,
                      {
                        backgroundColor: colors.surface,
                        borderColor: pressed ? topic.tint : colors.border,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.icon,
                        { backgroundColor: `${topic.tint}20` },
                      ]}
                    >
                      <Ionicons
                        name={topic.icon}
                        size={24}
                        color={topic.tint}
                      />
                    </View>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {topic.title}
                    </Text>
                    <Text
                      style={[styles.cardSubtitle, { color: colors.textMuted }]}
                    >
                      {topic.subtitle}
                    </Text>
                    <View style={styles.cardFooter}>
                      <Text style={[styles.count, { color: topic.tint }]}>
                        Explore verses
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={topic.tint}
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <ActionSheetModal
        visible={creditPromptVisible}
        onRequestClose={() => setCreditPromptVisible(false)}
        icon="flash-outline"
        title="You're out of free generations"
        body="Watch a short ad to unlock 2 more, or upgrade to Pro for a much higher daily limit."
        actions={[
          {
            label: "Upgrade to Pro",
            icon: "sparkles",
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 130 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    width: "47.5%",
    minHeight: 185,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontFamily: fonts.serif, fontSize: 22, marginTop: spacing.lg },
  cardSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  cardFooter: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  backText: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "800" },
  verseList: { gap: spacing.md },
  loadingCard: {
    minHeight: 100,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  loadingText: { fontFamily: fonts.sans, fontSize: 12 },
  errorText: {
    color: "#B66336",
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  verseCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  verseMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reference: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  saveButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  verse: {
    fontFamily: fonts.serif,
    fontSize: 21,
    lineHeight: 31,
    marginTop: spacing.md,
  },
  aiTag: {
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: spacing.lg,
  },
  insight: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  customize: {
    height: 48,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  customizeText: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: "800",
  },
});
