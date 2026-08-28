import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { secureStorage } from "./secure-storage";

export type AuthUser = {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  subscriptionStatus: "free" | "trial" | "premium";
  isVerified: boolean;
};

type AuthState = {
  hasHydrated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (session: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setAccessToken: (accessToken: string) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  signOut: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      updateUser: (partialUser) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...partialUser } });
      },
      signOut: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "daily-insight-auth",
      storage: createJSONStorage(() => secureStorage),
      partialize: ({ user, accessToken, refreshToken, isAuthenticated }) => ({
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
