import { useCallback, useEffect, useRef, useState } from "react";

import {
  isRewardedAdLoaded,
  showRewardedAd,
  subscribeRewardedAdLoaded,
} from "@/services/ads-service";

export function useRewardedAd(
  onEarnedReward: () => void,
  onClosed?: (wasEarned: boolean) => void,
) {
  const [isLoaded, setIsLoaded] = useState(isRewardedAdLoaded());
  const onEarnedRewardRef = useRef(onEarnedReward);
  const onClosedRef = useRef(onClosed);

  onEarnedRewardRef.current = onEarnedReward;
  onClosedRef.current = onClosed;

  useEffect(() => subscribeRewardedAdLoaded(setIsLoaded), []);

  const show = useCallback(() => {
    return showRewardedAd(
      () => onEarnedRewardRef.current(),
      (wasEarned) => onClosedRef.current?.(wasEarned),
    );
  }, []);

  return { isLoaded, show };
}
