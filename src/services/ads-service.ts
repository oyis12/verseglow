import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

// Swap EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID for your real AdMob rewarded ad
// unit ID once your AdMob account/app is approved. Shipping TestIds.REWARDED
// to production violates AdMob policy, so this only falls back to it if the
// real env var is genuinely missing.
const AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : (process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID ?? TestIds.REWARDED);

let ad = RewardedAd.createForAdRequest(AD_UNIT_ID);
let isLoaded = false;
let pendingCallback: (() => void) | null = null;
const loadedListeners = new Set<(loaded: boolean) => void>();

function setLoaded(value: boolean) {
  isLoaded = value;
  loadedListeners.forEach((listener) => listener(value));
}

function load() {
  setLoaded(false);
  ad.load();
}

function attachListeners() {
  ad.addAdEventListener(RewardedAdEventType.LOADED, () => setLoaded(true));
  ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    pendingCallback?.();
    pendingCallback = null;
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    // Whoever was waiting didn't earn a reward (closed early) — clear it so
    // a stale callback can't fire later.
    pendingCallback = null;
    ad = RewardedAd.createForAdRequest(AD_UNIT_ID);
    attachListeners();
    load();
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    pendingCallback = null;
    setLoaded(false);
  });
}

attachListeners();
load();

export function isRewardedAdLoaded() {
  return isLoaded;
}

export function subscribeRewardedAdLoaded(listener: (loaded: boolean) => void) {
  loadedListeners.add(listener);
  return () => {
    loadedListeners.delete(listener);
  };
}

/** Returns false immediately (no-op) if no ad is currently loaded. */
export function showRewardedAd(onEarnedReward: () => void): boolean {
  if (!isLoaded) return false;
  pendingCallback = onEarnedReward;
  ad.show();
  return true;
}
