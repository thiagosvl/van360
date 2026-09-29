import {
  ScreenTutorialConfig,
  ScreenTutorialKey,
  TUTORIALS_CONFIG,
  hasValidTutorialVideos,
} from "@/constants/tutorials";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";

export interface UseTutorialsConfigResult {
  config: ScreenTutorialConfig;
  shouldShowTutorial: boolean;
  isTrial: boolean;
}

export function useTutorialsConfig(screenKey: ScreenTutorialKey): UseTutorialsConfigResult {
  const { isTrial, isLoading } = useSubscriptionAccess();
  const config: ScreenTutorialConfig = TUTORIALS_CONFIG[screenKey];
  const hasVideos = hasValidTutorialVideos(config);

  const shouldShowTutorial = !isLoading && isTrial && hasVideos;

  return {
    config,
    shouldShowTutorial,
    isTrial,
  };
}
