import { create } from 'zustand';

import { fetchUnreadCount } from '@/services/notifications-api-service';

type NotificationsState = {
  unreadCount: number;
  refresh: () => Promise<void>;
  setUnreadCount: (count: number) => void;
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,
  refresh: async () => {
    try {
      const count = await fetchUnreadCount();
      set({ unreadCount: count });
    } catch {
      // Silent — the bell just won't show a fresh badge this time.
    }
  },
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
