// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   AdEventType,
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds,
// } from "react-native-google-mobile-ads";

// // Google's public test unit — always serves a test creative, safe for
// // development. Swap EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID for your real AdMob
// // rewarded ad unit ID once your AdMob account/app is approved. Shipping
// // TestIds.REWARDED to production violates AdMob policy, so this only falls
// // back to it if the real env var is genuinely missing.
// const AD_UNIT_ID = __DEV__
//   ? TestIds.REWARDED
//   : (process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID ?? TestIds.REWARDED);

// export function useRewardedAd(onEarnedReward: () => void) {
//   const adRef = useRef(RewardedAd.createForAdRequest(AD_UNIT_ID));
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const onEarnedRewardRef = useRef(onEarnedReward);
//   onEarnedRewardRef.current = onEarnedReward;

//   const load = useCallback(() => {
//     setIsLoading(true);
//     setIsLoaded(false);
//     adRef.current.load();
//   }, []);

//   useEffect(() => {
//     const unsubscribers = [
//       adRef.current.addAdEventListener(RewardedAdEventType.LOADED, () => {
//         setIsLoaded(true);
//         setIsLoading(false);
//       }),
//       adRef.current.addAdEventListener(
//         RewardedAdEventType.EARNED_REWARD,
//         () => {
//           onEarnedRewardRef.current();
//         },
//       ),
//       adRef.current.addAdEventListener(AdEventType.CLOSED, () => {
//         // Pre-load the next ad so it's ready the next time it's needed.
//         adRef.current = RewardedAd.createForAdRequest(AD_UNIT_ID);
//         load();
//       }),
//       adRef.current.addAdEventListener(AdEventType.ERROR, () => {
//         setIsLoading(false);
//         setIsLoaded(false);
//       }),
//     ];

//     load();

//     return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const show = useCallback(() => {
//     if (isLoaded) adRef.current.show();
//   }, [isLoaded]);

//   return { isLoaded, isLoading, show };
// }

import { useCallback, useEffect, useRef, useState } from "react";

import {
  isRewardedAdLoaded,
  showRewardedAd,
  subscribeRewardedAdLoaded,
} from "@/services/ads-service";

export function useRewardedAd(onEarnedReward: () => void) {
  const [isLoaded, setIsLoaded] = useState(isRewardedAdLoaded());
  const onEarnedRewardRef = useRef(onEarnedReward);
  onEarnedRewardRef.current = onEarnedReward;

  useEffect(() => subscribeRewardedAdLoaded(setIsLoaded), []);

  const show = useCallback(() => {
    showRewardedAd(() => onEarnedRewardRef.current());
  }, []);

  return { isLoaded, show };
}
