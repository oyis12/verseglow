import { authorizedFetch } from './auth-service';

export type UsageSnapshot = {
  isPro: boolean;
  freeGenerateCredits: number;
  proDailyGenerateCount: number;
  proDailyGenerateCap: number;
};

type UsageResponse = {
  success: boolean;
  message?: string;
  data?: UsageSnapshot;
};

export async function fetchUsage(): Promise<UsageSnapshot> {
  const response = await authorizedFetch('/api/usage/me');
  const result = (await response.json()) as UsageResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Unable to load your usage right now.');
  }
  return result.data;
}

export async function redeemAdReward(): Promise<UsageSnapshot> {
  const response = await authorizedFetch('/api/usage/ad-reward', { method: 'POST' });
  const result = (await response.json()) as UsageResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Unable to redeem your reward right now.');
  }
  return result.data;
}
