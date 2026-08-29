import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  type AppNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notifications-api-service';
import { useNotificationsStore } from '@/store/notifications-store';

const ICONS: Record<AppNotification['type'], keyof typeof Ionicons.glyphMap> = {
  subscription_confirmed: 'sparkles',
  subscription_renewed: 'refresh-circle-outline',
  subscription_expiring: 'time-outline',
};

function timeAgo(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const setUnreadCount = useNotificationsStore((state) => state.setUnreadCount);

  const load = () => {
    setIsLoading(true);
    fetchNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleOpen = (item: AppNotification) => {
    if (item.is_read) return;
    setNotifications((items) => items.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
    markNotificationRead(item.id).catch(() => {});
    setUnreadCount(notifications.filter((n) => !n.is_read && n.id !== item.id).length);
  };

  const handleMarkAllRead = () => {
    setNotifications((items) => items.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    markAllNotificationsRead().catch(() => {});
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Close"
            onPress={() => router.back()}
            style={[styles.close, { backgroundColor: colors.surface }]}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          {hasUnread ? (
            <Pressable onPress={handleMarkAllRead}>
              <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
            </Pressable>
          ) : (
            <View style={styles.close} />
          )}
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nothing here yet. We'll let you know about your subscription here.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {notifications.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleOpen(item)}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: item.is_read ? colors.border : colors.primary,
                  },
                ]}>
                <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name={ICONS[item.type]} size={20} color={colors.primary} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.cardText, { color: colors.textMuted }]}>{item.body}</Text>
                  <Text style={[styles.cardTime, { color: colors.textMuted }]}>{timeAgo(item.created_at)}</Text>
                </View>
                {!item.is_read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  header: {
    height: 62,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.sans, fontSize: 15, fontWeight: '800' },
  markAll: { fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, textAlign: 'center', lineHeight: 21 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontFamily: fonts.sans, fontSize: 14, fontWeight: '800' },
  cardText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19 },
  cardTime: { fontFamily: fonts.sans, fontSize: 11, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
