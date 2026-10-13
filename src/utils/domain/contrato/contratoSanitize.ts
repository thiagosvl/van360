export function sanitizeGenericText(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’‹›`]/g, "'")
    .replace(/[—–−‐‑]/g, "-")
    .replace(/[✔✓]/g, "[X]")
    .replace(/[✖✗✕]/g, "[ ]")
    .replace(/[•●▪]/g, "-")
    .split("\n")
    .map((line) => line.replace(/[^\S\r\n]+/g, " ").trim())
    .join("\n")
    .trim();
}

export function sanitizeClauseText(text: string | null | undefined): string {
  const normalized = sanitizeGenericText(text);
  if (!normalized) return "";

  return normalized.replace(/^((cl[áa]usula\s*\d+[ªº°a]?\s*[-–—:]?\s*)|(\d+[\.\-\)]\s*))/i, "");
}
