import { create } from "zustand";

import {
  fetchUsage,
  redeemAdReward as redeemAdRewardApi,
  type UsageSnapshot,
} from "@/services/usage-service";

type UsageState = UsageSnapshot & {
  hasLoaded: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  applySnapshot: (snapshot: UsageSnapshot) => void;
  redeemAdReward: () => Promise<UsageSnapshot>;
};

export const useUsageStore = create<UsageState>((set) => ({
  isPro: false,
  freeGenerateCredits: 0,
  proDailyGenerateCount: 0,
  proDailyGenerateCap: 25,
  hasLoaded: false,
  isRefreshing: false,

  refresh: async () => {
    set({ isRefreshing: true });
    try {
      const snapshot = await fetchUsage();
      set({ ...snapshot, hasLoaded: true, isRefreshing: false });
    } catch {
      set({ isRefreshing: false });
    }
  },

  // Lets callers update the store directly from a response that already
  // included a fresh usage snapshot (e.g. /api/verses/generate), avoiding
  // an extra round trip just to re-fetch numbers we already have.
  applySnapshot: (snapshot) => set({ ...snapshot, hasLoaded: true }),

  redeemAdReward: async () => {
    const snapshot = await redeemAdRewardApi();
    set({ ...snapshot, hasLoaded: true });
    return snapshot;
  },
}));
