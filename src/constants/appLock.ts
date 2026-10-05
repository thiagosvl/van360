export const GRACE_PERIOD_OPTIONS = [
  { label: "Imediatamente", value: 0 },
  { label: "Após 1 minuto", value: 60 * 1000 },
  { label: "Após 5 minutos", value: 5 * 60 * 1000 },
  { label: "Após 15 minutos", value: 15 * 60 * 1000 },
] as const;

export const DEFAULT_GRACE_PERIOD_MS = 60 * 1000;
