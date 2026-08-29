import { authorizedFetch } from "./auth-service";

export type AppNotification = {
  id: number;
  type:
    | "subscription_confirmed"
    | "subscription_renewed"
    | "subscription_expiring";
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

type ApiResponse<T> = { success: boolean; message?: string; data?: T };

async function call<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await authorizedFetch(path, options);
  const result = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !result.success || result.data === undefined) {
    throw new Error(result.message || "Unable to load notifications.");
  }
  return result.data;
}

export async function fetchNotifications() {
  return call<AppNotification[]>("/api/notifications");
}

export async function fetchUnreadCount() {
  const data = await call<{ count: number }>("/api/notifications/unread-count");
  return data.count;
}

export async function markNotificationRead(id: number) {
  await authorizedFetch(`/api/notifications/${id}/read`, { method: "POST" });
}

export async function markAllNotificationsRead() {
  await authorizedFetch("/api/notifications/read-all", { method: "POST" });
}
