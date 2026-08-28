import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PreferencesState = {
  hasHydrated: boolean;
  hasCompletedOnboarding: boolean;
  accountProvider: "google" | "apple" | null;
  regionPreference: string;
  setRegionPreference: (regionPreference: string) => void;
  completeOnboarding: () => void;
  setAccountProvider: (
    accountProvider: PreferencesState["accountProvider"],
  ) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      hasCompletedOnboarding: false,
      accountProvider: null,
      regionPreference: "auto",
      setRegionPreference: (regionPreference) => set({ regionPreference }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setAccountProvider: (accountProvider) => set({ accountProvider }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "daily-insight-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        hasCompletedOnboarding,
        accountProvider,
        regionPreference,
      }) => ({
        hasCompletedOnboarding,
        accountProvider,
        regionPreference,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
