import { authorizedFetch } from "./auth-service";
import type { UsageSnapshot } from "./usage-service";

export type SubscriptionInfo = {
  isPro: boolean;
  plan: "monthly" | "yearly" | "trial" | null;
  currentPeriodEnd: string | null;
  provider: "google_play" | "manual" | null;
};

type SubscriptionResponse = {
  success: boolean;
  message?: string;
  data?: SubscriptionInfo;
};

type UsageResponse = {
  success: boolean;
  message?: string;
  data?: UsageSnapshot;
};

export async function fetchSubscription(): Promise<SubscriptionInfo> {
  const response = await authorizedFetch("/api/subscriptions/me");
  const result = (await response.json()) as SubscriptionResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Unable to load your subscription.");
  }
  return result.data;
}

/**
 * TEMPORARY testing path — activates Pro locally without a real purchase.
 * Swap this for a react-native-iap purchase flow once Play Console
 * subscription products and server-side receipt verification are set up.
 * The backend refuses this call outright in production.
 */
export async function devActivateSubscription(
  plan: "monthly" | "yearly",
): Promise<UsageSnapshot> {
  const response = await authorizedFetch("/api/subscriptions/dev-activate", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
  const result = (await response.json()) as UsageResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      result.message || "Unable to activate this plan right now.",
    );
  }
  return result.data;
}

export async function devCancelSubscription(): Promise<UsageSnapshot> {
  const response = await authorizedFetch("/api/subscriptions/dev-cancel", {
    method: "POST",
  });
  const result = (await response.json()) as UsageResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Unable to cancel right now.");
  }
  return result.data;
}
