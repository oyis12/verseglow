// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { useState } from 'react';
// import { Pressable, StyleSheet, Text, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import { fonts, radius, spacing } from '@/constants/theme';
// import { useAppTheme } from '@/hooks/use-app-theme';
// import { usePreferencesStore } from '@/store/preferences-store';

// const slides = [
//   {
//     icon: 'book-outline' as const,
//     eyebrow: 'SCRIPTURE',
//     title: 'Begin with the Word.',
//     body: 'Choose an exact KJV book, chapter and verse, or discover scripture by what your heart needs.',
//   },
//   {
//     icon: 'sparkles-outline' as const,
//     eyebrow: 'REFLECTION',
//     title: 'Understand it your way.',
//     body: 'Choose a tone and regional voice. AI explains the passage but never edits or replaces scripture.',
//   },
//   {
//     icon: 'share-social-outline' as const,
//     eyebrow: 'CREATE & SHARE',
//     title: 'Carry the moment forward.',
//     body: 'Design a beautiful card, save it privately, download it, or share it with the people you care about.',
//   },
// ];

// export default function OnboardingScreen() {
//   const { colors } = useAppTheme();
//   const [page, setPage] = useState(0);
//   const complete = usePreferencesStore((state) => state.completeOnboarding);
//   const slide = slides[page];

//   const finish = () => {
//     complete();
//     router.replace('/(tabs)');
//   };

//   return (
//     <View style={[styles.screen, { backgroundColor: colors.background }]}>
//       <SafeAreaView style={styles.safe}>
//         <View style={styles.top}>
//           <Text style={[styles.brand, { color: colors.primary }]}>DAILY INSIGHT</Text>
//           <Pressable accessibilityRole="button" onPress={finish} hitSlop={10}>
//             <Text style={[styles.skip, { color: colors.textMuted }]}>Skip</Text>
//           </Pressable>
//         </View>
//         <View style={styles.stage}>
//           <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
//             <Ionicons name={slide.icon} size={42} color={colors.primary} />
//           </View>
//           <Text style={[styles.eyebrow, { color: colors.primary }]}>{slide.eyebrow}</Text>
//           <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
//           <Text style={[styles.body, { color: colors.textMuted }]}>{slide.body}</Text>
//           {page === 1 && (
//             <View style={[styles.aiNote, { backgroundColor: colors.surface }]}>
//               <Ionicons name="information-circle-outline" size={19} color={colors.primary} />
//               <Text style={[styles.aiNoteText, { color: colors.textMuted }]}>
//                 AI explanations can make mistakes. Review them alongside the original scripture.
//               </Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.footer}>
//           <View style={styles.dots}>
//             {slides.map((item, index) => (
//               <View
//                 key={item.eyebrow}
//                 style={[
//                   styles.dot,
//                   { backgroundColor: index === page ? colors.primary : colors.border },
//                   index === page && styles.activeDot,
//                 ]}
//               />
//             ))}
//           </View>
//           <Pressable
//             accessibilityRole="button"
//             onPress={() => (page === slides.length - 1 ? finish() : setPage((value) => value + 1))}
//             style={[styles.continue, { backgroundColor: colors.primary }]}>
//             <Text style={styles.continueText}>{page === slides.length - 1 ? 'Start reflecting' : 'Continue'}</Text>
//             <Ionicons name="arrow-forward" size={20} color="#FFF" />
//           </Pressable>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1 },
//   safe: { flex: 1, padding: spacing.lg },
//   top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   brand: { fontFamily: fonts.sans, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
//   skip: { fontFamily: fonts.sans, fontSize: 13, fontWeight: '700' },
//   stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
//   icon: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
//   eyebrow: { fontFamily: fonts.sans, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: spacing.xl },
//   title: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 46, textAlign: 'center', marginTop: spacing.sm },
//   body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: spacing.md },
//   aiNote: { flexDirection: 'row', gap: spacing.sm, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg },
//   aiNoteText: { flex: 1, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17 },
//   footer: { gap: spacing.lg },
//   dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
//   dot: { width: 7, height: 7, borderRadius: 4 },
//   activeDot: { width: 22 },
//   continue: {
//     height: 58,
//     borderRadius: radius.md,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: spacing.sm,
//   },
//   continueText: { color: '#FFF', fontFamily: fonts.sans, fontSize: 15, fontWeight: '800' },
// });

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fonts, radius, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { usePreferencesStore } from "@/store/preferences-store";

const slides = [
  {
    icon: "book-outline" as const,
    eyebrow: "SCRIPTURE",
    title: "Begin with the Word.",
    body: "Choose an exact KJV book, chapter and verse, or discover scripture by what your heart needs.",
  },
  {
    icon: "sparkles-outline" as const,
    eyebrow: "REFLECTION",
    title: "Understand it your way.",
    body: "Choose a tone and regional voice. AI explains the passage but never edits or replaces scripture.",
  },
  {
    icon: "share-social-outline" as const,
    eyebrow: "CREATE & SHARE",
    title: "Carry the moment forward.",
    body: "Design a beautiful card, save it privately, download it, or share it with the people you care about.",
  },
];

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const [page, setPage] = useState(0);
  const complete = usePreferencesStore((state) => state.completeOnboarding);
  const slide = slides[page];

  const finish = () => {
    complete();
    router.replace("/sign-in");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Text style={[styles.brand, { color: colors.primary }]}>
            DAILY INSIGHT
          </Text>
          <Pressable accessibilityRole="button" onPress={finish} hitSlop={10}>
            <Text style={[styles.skip, { color: colors.textMuted }]}>Skip</Text>
          </Pressable>
        </View>
        <View style={styles.stage}>
          <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name={slide.icon} size={42} color={colors.primary} />
          </View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            {slide.eyebrow}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {slide.title}
          </Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            {slide.body}
          </Text>
          {page === 1 && (
            <View style={[styles.aiNote, { backgroundColor: colors.surface }]}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={colors.primary}
              />
              <Text style={[styles.aiNoteText, { color: colors.textMuted }]}>
                AI explanations can make mistakes. Review them alongside the
                original scripture.
              </Text>
            </View>
          )}
        </View>
        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((item, index) => (
              <View
                key={item.eyebrow}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === page ? colors.primary : colors.border,
                  },
                  index === page && styles.activeDot,
                ]}
              />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              page === slides.length - 1
                ? finish()
                : setPage((value) => value + 1)
            }
            style={[styles.continue, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.continueText}>
              {page === slides.length - 1 ? "Start reflecting" : "Continue"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, padding: spacing.lg },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  skip: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "700" },
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
  eyebrow: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 38,
    lineHeight: 46,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginTop: spacing.md,
  },
  aiNote: {
    flexDirection: "row",
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  aiNoteText: { flex: 1, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17 },
  footer: { gap: spacing.lg },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  activeDot: { width: 22 },
  continue: {
    height: 58,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  continueText: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: "800",
  },
});
