import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  addBookmarkRemote,
  fetchBookmarks,
  removeBookmarkRemote,
} from "@/services/bookmark-service";
import type { Insight } from "@/types/insight";

const initialInsight: Insight = {
  reference: "Genesis 1:1",
  translation: "KJV",
  verse: "In the beginning God created the heaven and the earth.",
  insight:
    "Every great story begins somewhere. Creation reminds us that God can bring form, purpose, and possibility from an empty beginning.",
  voice: "Standard English",
};

const sameInsight = (a: Insight, b: Insight) =>
  a.reference === b.reference && a.insight === b.insight;

type InsightState = {
  current: Insight;
  // True until the user generates (or reveals) a real insight. While true,
  // Home is free to swap `current` for a fresh random verse — once it's
  // false, `current` is the user's own real work and Home should leave it
  // alone rather than clobber it on every visit.
  currentIsFallback: boolean;
  saved: Insight[];
  history: Insight[];
  setCurrent: (insight: Insight) => void;
  setRandomFallback: (insight: Insight) => void;
  toggleSaved: (insight: Insight) => Promise<void>;
  syncSavedFromServer: () => Promise<void>;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
};

export const useInsightStore = create<InsightState>()(
  persist(
    (set, get) => ({
      current: initialInsight,
      currentIsFallback: true,
      saved: [],
      history: [],
      setCurrent: (insight) =>
        set((state) => {
          const current = {
            ...insight,
            id: insight.id ?? `${Date.now()}-${insight.reference}`,
            createdAt: insight.createdAt ?? new Date().toISOString(),
          };
          const alreadyRecorded = state.history.some(
            (item) =>
              item.reference === current.reference &&
              item.insight === current.insight,
          );
          return {
            current,
            currentIsFallback: false,
            history: alreadyRecorded
              ? state.history
              : [current, ...state.history].slice(0, 100),
          };
        }),

      // Used only for Home's random-verse fallback — updates `current`
      // without touching history, and keeps currentIsFallback true so it
      // can still be swapped for another random pick later.
      setRandomFallback: (insight) =>
        set({ current: insight, currentIsFallback: true }),

      // Optimistically updates local state immediately. If the insight came
      // from a real AI generation (has aiOutputId), also syncs to the
      // backend and rolls the local change back if that fails. Insights
      // without an aiOutputId (e.g. today's static Discover samples) stay
      // local-only — there's no backend record to bookmark against yet.
      toggleSaved: async (insight) => {
        const wasSaved = get().saved.some((item) => sameInsight(item, insight));
        const previousSaved = get().saved;

        set({
          saved: wasSaved
            ? previousSaved.filter((item) => !sameInsight(item, insight))
            : [
                {
                  ...insight,
                  id: insight.id ?? `${Date.now()}-${insight.reference}`,
                },
                ...previousSaved,
              ],
        });

        if (!insight.aiOutputId) return;

        try {
          if (wasSaved) {
            await removeBookmarkRemote(insight.aiOutputId);
          } else {
            await addBookmarkRemote(insight.aiOutputId);
          }
        } catch (error) {
          set({ saved: previousSaved }); // roll back the optimistic update
          throw error;
        }
      },

      // Pulls the authoritative saved list from the backend and merges it
      // with anything local-only (no aiOutputId). Call this right after
      // sign-in so a returning user sees their real saved insights.
      syncSavedFromServer: async () => {
        const remote = await fetchBookmarks();
        const localOnly = get().saved.filter((item) => !item.aiOutputId);
        set({ saved: [...remote, ...localOnly] });
      },

      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "daily-insight-library",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
