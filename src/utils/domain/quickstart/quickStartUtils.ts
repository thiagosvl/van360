import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";

/**
 * Tipos de steps do QuickStart
 */
export type QuickStartStep = 
  | "step_passageiros" 
  | "step_escolas" 
  | "step_veiculos";

/**
 * Interface para o status do QuickStart
 */
export interface QuickStartStatus {
  step_passageiros?: boolean;
  step_escolas?: boolean;
  step_veiculos?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Obtém o status atual do QuickStart do localStorage
 * @returns Objeto com o status atual ou objeto vazio se não existir
 */
export function getQuickStartStatus(): QuickStartStatus {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_QUICKSTART_STATUS);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    return {};
  }
}

/**
 * Obtém o status anterior do QuickStart como string (para reversão em caso de erro)
 * @returns String JSON do status anterior ou null se não existir
 */
export function getQuickStartPreviousStatus(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_QUICKSTART_STATUS);
  } catch (error) {
    return null;
  }
}

/**
 * Salva o status do QuickStart no localStorage
 * @param status Objeto com o status a ser salvo
 * @returns true se salvou com sucesso, false caso contrário
 */
export function saveQuickStartStatus(status: QuickStartStatus): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_QUICKSTART_STATUS, JSON.stringify(status));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Restaura o status anterior do QuickStart (útil em caso de erro)
 * @param previousStatus String JSON do status anterior ou null
 * @returns true se restaurou com sucesso, false caso contrário
 */
export function restoreQuickStartStatus(previousStatus: string | null): boolean {
  if (!previousStatus) return false;
  
  try {
    localStorage.setItem(STORAGE_KEY_QUICKSTART_STATUS, previousStatus);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Atualiza um step específico do QuickStart
 * @param stepName Nome do step a ser atualizado (ex: "step_passageiros")
 * @returns true se atualizou com sucesso, false caso contrário
 */
export function updateQuickStartStep(stepName: QuickStartStep): boolean {
  try {
    const status = getQuickStartStatus();
    status[stepName] = true;
    return saveQuickStartStatus(status);
  } catch (error) {
    return false;
  }
}

/**
 * Wrapper completo para atualizar um step do QuickStart com tratamento de erro
 * Obtém o status anterior, atualiza o step e retorna funções para restaurar em caso de erro
 * 
 * @param stepName Nome do step a ser atualizado
 * @returns Objeto com:
 *  - success: true se atualizou com sucesso
 *  - restore: função para restaurar o status anterior em caso de erro
 *  - previousStatus: string JSON do status anterior (para uso em restore)
 * 
 * @example
 * ```typescript
 * const { success, restore, previousStatus } = updateQuickStartStepWithRollback("step_passageiros");
 * 
 * try {
 *   // Operação que pode falhar
 *   await criarPassageiro();
 * } catch (error) {
 *   // Restaurar em caso de erro
 *   restore();
 *   throw error;
 * }
 * ```
 */
export function updateQuickStartStepWithRollback(stepName: QuickStartStep) {
  const previousStatus = getQuickStartPreviousStatus();
  const success = updateQuickStartStep(stepName);

  const restore = () => {
    restoreQuickStartStatus(previousStatus);
  };

  return {
    success,
    restore,
    previousStatus,
  };
}

