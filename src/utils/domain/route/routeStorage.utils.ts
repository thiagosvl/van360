import { RouteStopStatus } from "@/types/route";

const STORAGE_PREFIX = "van360_chamada_rapida_";

export interface ChamadaRapidaData {
  rotaId: string;
  data: string;
  atualizadoEm: string;
  statusAlunos: Record<string, RouteStopStatus>;
}

export function getTodayLocalDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getChamadaRapidaKey(rotaId: string, dataStr: string): string {
  return `${STORAGE_PREFIX}${rotaId}_${dataStr}`;
}

export function obterChamadaRapida(rotaId: string): ChamadaRapidaData | null {
  if (!rotaId || typeof window === "undefined") return null;

  try {
    const hoje = getTodayLocalDateStr();
    const key = getChamadaRapidaKey(rotaId, hoje);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ChamadaRapidaData;
    if (parsed.data !== hoje) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function salvarChamadaRapida(rotaId: string, statusAlunos: Record<string, RouteStopStatus>): void {
  if (!rotaId || typeof window === "undefined") return;

  try {
    const hoje = getTodayLocalDateStr();
    const key = getChamadaRapidaKey(rotaId, hoje);
    const payload: ChamadaRapidaData = {
      rotaId,
      data: hoje,
      atualizadoEm: new Date().toISOString(),
      statusAlunos,
    };

    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Storage quota fallback
  }
}

export function limparChamadasRapidasObsoletas(): void {
  if (typeof window === "undefined") return;

  try {
    const hoje = getTodayLocalDateStr();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        if (!key.endsWith(`_${hoje}`)) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage cleanup fallback
  }
}
