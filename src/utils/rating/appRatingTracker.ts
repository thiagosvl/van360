import { Capacitor } from "@capacitor/core";
import { STORAGE_KEYS } from "@/constants";

export interface AppRatingCounters {
  recibosCompartilhados: number;
  alunosCadastradosOuAprovados: number;
  cobrancasBaixadas: number;
  gastosRegistrados: number;
}

export interface AppRatingTrackerState {
  firstOpenDate: string;
  activeDays: string[];
  counters: AppRatingCounters;
  convertedSubscriberPrompted: boolean;
  lastPromptTimestamp: number | null;
  promptCount: number;
}

const DEFAULT_STATE: AppRatingTrackerState = {
  firstOpenDate: new Date().toISOString(),
  activeDays: [],
  counters: {
    recibosCompartilhados: 0,
    alunosCadastradosOuAprovados: 0,
    cobrancasBaixadas: 0,
    gastosRegistrados: 0,
  },
  convertedSubscriberPrompted: false,
  lastPromptTimestamp: null,
  promptCount: 0,
};

const COOLDOWN_DAYS = 90;
const MAX_PROMPTS_PER_YEAR = 3;
const MIN_ACTIVE_DAYS = 3;

export function getRatingTrackerState(): AppRatingTrackerState {
  if (typeof window === "undefined" || !Capacitor.isNativePlatform()) return { ...DEFAULT_STATE };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_RATING_TRACKER);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<AppRatingTrackerState>;

    return {
      firstOpenDate: parsed.firstOpenDate || DEFAULT_STATE.firstOpenDate,
      activeDays: Array.isArray(parsed.activeDays) ? parsed.activeDays : [],
      counters: {
        recibosCompartilhados: parsed.counters?.recibosCompartilhados ?? 0,
        alunosCadastradosOuAprovados: parsed.counters?.alunosCadastradosOuAprovados ?? 0,
        cobrancasBaixadas: parsed.counters?.cobrancasBaixadas ?? 0,
        gastosRegistrados: parsed.counters?.gastosRegistrados ?? 0,
      },
      convertedSubscriberPrompted: Boolean(parsed.convertedSubscriberPrompted),
      lastPromptTimestamp: parsed.lastPromptTimestamp ?? null,
      promptCount: parsed.promptCount ?? 0,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveRatingTrackerState(state: AppRatingTrackerState): void {
  if (typeof window === "undefined" || !Capacitor.isNativePlatform()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.APP_RATING_TRACKER, JSON.stringify(state));
  } catch {}
}

export function recordActiveDay(): void {
  if (typeof window === "undefined" || !Capacitor.isNativePlatform()) return;

  const today = new Date().toISOString().split("T")[0];
  const state = getRatingTrackerState();

  if (!state.activeDays.includes(today)) {
    state.activeDays.push(today);
    saveRatingTrackerState(state);
  }
}

export function incrementRatingCounter(counter: keyof AppRatingCounters): number {
  if (!Capacitor.isNativePlatform()) return 0;

  const state = getRatingTrackerState();
  state.counters[counter] = (state.counters[counter] || 0) + 1;
  saveRatingTrackerState(state);
  return state.counters[counter];
}

export function hasMinimumMaturity(currentState?: AppRatingTrackerState): boolean {
  const state = currentState || getRatingTrackerState();
  return state.activeDays.length >= MIN_ACTIVE_DAYS;
}

export function isEligibleForRatingPrompt(currentState?: AppRatingTrackerState): boolean {
  if (!Capacitor.isNativePlatform()) return false;
  if (!Capacitor.isPluginAvailable("InAppReview")) return false;

  const state = currentState || getRatingTrackerState();

  if (state.activeDays.length < MIN_ACTIVE_DAYS) return false;
  if (state.promptCount >= MAX_PROMPTS_PER_YEAR) return false;

  if (state.lastPromptTimestamp) {
    const elapsedDays = (Date.now() - state.lastPromptTimestamp) / (1000 * 60 * 60 * 24);
    if (elapsedDays < COOLDOWN_DAYS) return false;
  }

  if (typeof document !== "undefined") {
    const activeDialog = document.querySelector('[role="dialog"]');
    if (activeDialog) return false;
  }

  return true;
}

export function recordPromptShown(): void {
  if (!Capacitor.isNativePlatform()) return;
  const state = getRatingTrackerState();
  state.lastPromptTimestamp = Date.now();
  state.promptCount += 1;
  saveRatingTrackerState(state);
}

export function recordSubscriberPrompted(): void {
  if (!Capacitor.isNativePlatform()) return;
  const state = getRatingTrackerState();
  state.convertedSubscriberPrompted = true;
  saveRatingTrackerState(state);
}

export async function triggerNativeReview(delayMs = 1000): Promise<boolean> {
  if (!isEligibleForRatingPrompt()) return false;

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  if (!isEligibleForRatingPrompt()) return false;

  try {
    const { InAppReview } = await import("@capacitor-community/in-app-review");
    await InAppReview.requestReview();
    recordPromptShown();
    return true;
  } catch {
    return false;
  }
}

