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
let pendingOnEarned: (() => void) | null = null;
let pendingOnClosed: ((wasEarned: boolean) => void) | null = null;
let earnedThisShow = false;
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
    earnedThisShow = true;
    pendingOnEarned?.();
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    const wasEarned = earnedThisShow;
    const onClosed = pendingOnClosed;
    pendingOnEarned = null;
    pendingOnClosed = null;
    earnedThisShow = false;
    setLoaded(false);
    // Give the SDK a moment to fully tear down the just-closed ad before
    // requesting the next one — loading immediately in this callback is a
    // known way for the next ad to silently fail to load.
    setTimeout(() => {
      ad = RewardedAd.createForAdRequest(AD_UNIT_ID);
      attachListeners();
      load();
    }, 500);
    onClosed?.(wasEarned);
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    const onClosed = pendingOnClosed;
    pendingOnEarned = null;
    pendingOnClosed = null;
    earnedThisShow = false;
    setLoaded(false);
    onClosed?.(false);

    // Recover from a failed load/show by creating a fresh ad instance.
    // This prevents the next generation attempt from being stuck forever.
    setTimeout(() => {
      ad = RewardedAd.createForAdRequest(AD_UNIT_ID);
      attachListeners();
      load();
    }, 500);
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

/**
 * Shows the ad. `onEarnedReward` fires when the reward is actually earned.
 * `onClosed` fires once the ad UI is dismissed either way, telling the
 * caller whether the reward was earned before it closed — needed to chain a
 * second ad reliably instead of guessing from `onEarnedReward` alone.
 * Returns false immediately (no-op) if no ad is currently loaded.
 */
export function showRewardedAd(
  onEarnedReward: () => void,
  onClosed?: (wasEarned: boolean) => void,
): boolean {
  if (!isLoaded) return false;
  earnedThisShow = false;
  pendingOnEarned = onEarnedReward;
  pendingOnClosed = onClosed ?? null;
  ad.show();
  return true;
}
