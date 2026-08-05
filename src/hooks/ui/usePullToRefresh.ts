import { useState, useEffect } from "react";

export const PULL_THRESHOLD = 60;
export const MAX_PULL = 130;

export interface PullGestureConfig {
  threshold?: number;
  maxPull?: number;
  resistanceFactor?: number;
}

export function calculatePullDistance(
  diffY: number,
  maxPull: number = MAX_PULL,
  resistanceFactor: number = 0.8
): number {
  if (diffY <= 0) return 0;
  return Math.min(diffY * resistanceFactor, maxPull);
}

export function isThresholdReached(
  pullDistance: number,
  threshold: number = PULL_THRESHOLD
): boolean {
  return pullDistance >= threshold;
}

export interface ShouldTriggerParams {
  diffY: number;
  diffX: number;
  scrollY?: number;
  isRefreshing?: boolean;
  isScrollLocked?: boolean;
  isInsideDialog?: boolean;
}

export function shouldTriggerPullGesture({
  diffY,
  diffX,
  scrollY = 0,
  isRefreshing = false,
  isScrollLocked = false,
  isInsideDialog = false,
}: ShouldTriggerParams): boolean {
  if (scrollY > 0 || isRefreshing || isScrollLocked || isInsideDialog) {
    return false;
  }
  return diffY > 0 && Math.abs(diffY) >= Math.abs(diffX);
}

export interface UsePullToRefreshOptions extends PullGestureConfig {
  onRefresh: () => Promise<void> | void;
}

export interface ProcessPullReleaseOptions {
  pullDistance: number;
  threshold?: number;
  isRefreshing: boolean;
  onRefresh: () => Promise<void> | void;
}

export async function processPullRelease({
  pullDistance,
  threshold = PULL_THRESHOLD,
  isRefreshing,
  onRefresh,
}: ProcessPullReleaseOptions): Promise<boolean> {
  if (isThresholdReached(pullDistance, threshold) && !isRefreshing) {
    await onRefresh();
    return true;
  }
  return false;
}

export function usePullToRefresh({
  onRefresh,
  threshold = PULL_THRESHOLD,
  maxPull = MAX_PULL,
  resistanceFactor = 0.8,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePullMove = (diffY: number, diffX: number) => {
    if (!shouldTriggerPullGesture({ diffY, diffX, isRefreshing })) {
      setPullDistance(0);
      return;
    }
    const distance = calculatePullDistance(diffY, maxPull, resistanceFactor);
    setPullDistance(distance);
  };

  const handlePullRelease = async () => {
    const triggered = await processPullRelease({
      pullDistance,
      threshold,
      isRefreshing,
      onRefresh,
    });
    if (triggered) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return {
    pullDistance,
    isRefreshing,
    handlePullMove,
    handlePullRelease,
    isThresholdReached: isThresholdReached(pullDistance, threshold),
  };
}
