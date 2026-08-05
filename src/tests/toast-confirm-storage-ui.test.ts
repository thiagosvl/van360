import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { useConfirmDialog } from "@/hooks/ui/useConfirmDialog";
import { safeStorage } from "@/utils/storage";
import { useToast } from "@/hooks/ui/useToast";

function renderHook<T>(hookFn: () => T) {
  let currentResult: T;
  let states: any[] = [];
  let refs: any[] = [];
  let stateIdx = 0;
  let refIdx = 0;

  function render() {
    stateIdx = 0;
    refIdx = 0;

    const mockDispatcher = {
      useState: (initial: any) => {
        const idx = stateIdx++;
        if (states.length <= idx) {
          states[idx] = typeof initial === "function" ? initial() : initial;
        }
        const setState = (newState: any) => {
          const prevVal = states[idx];
          const nextVal = typeof newState === "function" ? newState(prevVal) : newState;
          states[idx] = nextVal;
          render();
        };
        return [states[idx], setState];
      },
      useRef: (initial: any) => {
        const idx = refIdx++;
        if (refs.length <= idx) {
          refs[idx] = { current: initial };
        }
        return refs[idx];
      },
      useCallback: (fn: any) => fn,
      useEffect: (_effect: any) => {},
      useMemo: (factory: any) => factory(),
    };

    const secretInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    const prevDispatcher = secretInternals?.ReactCurrentDispatcher?.current;

    if (secretInternals?.ReactCurrentDispatcher) {
      secretInternals.ReactCurrentDispatcher.current = mockDispatcher;
    }

    try {
      currentResult = hookFn();
    } finally {
      if (secretInternals?.ReactCurrentDispatcher) {
        secretInternals.ReactCurrentDispatcher.current = prevDispatcher;
      }
    }
  }

  render();

  return {
    get current() {
      return currentResult;
    },
    rerender: render,
  };
}

describe("Suíte de Testes Automatizados para UI Hooks e Storage (toast-confirm-storage-ui.test.ts)", () => {
  describe("1. Hook de Diálogo de Confirmação (useConfirmDialog.ts)", () => {
    it("Deve inicializar com diálogo fechado e opções vazias", () => {
      const hook = renderHook(() => useConfirmDialog());
      expect(hook.current.isOpen).toBe(false);
      expect(hook.current.options).toEqual({});
    });

    it("Deve abrir o diálogo e atualizar opções ao chamar confirm()", () => {
      const hook = renderHook(() => useConfirmDialog());

      const confirmPromise = hook.current.confirm({
        title: "Remover Item",
        description: "Deseja realmente excluir este item?",
        confirmText: "Excluir",
        cancelText: "Cancelar",
        variant: "destructive",
      });

      expect(hook.current.isOpen).toBe(true);
      expect(hook.current.options.title).toBe("Remover Item");
      expect(hook.current.options.description).toBe("Deseja realmente excluir este item?");
      expect(hook.current.options.confirmText).toBe("Excluir");
      expect(hook.current.options.variant).toBe("destructive");
      expect(confirmPromise).toBeInstanceOf(Promise);
    });

    it("Deve resolver a Promise com true e fechar diálogo ao chamar handleConfirm()", async () => {
      const hook = renderHook(() => useConfirmDialog());

      const confirmPromise = hook.current.confirm({
        title: "Confirmar Ação",
      });

      expect(hook.current.isOpen).toBe(true);

      hook.current.handleConfirm();

      expect(hook.current.isOpen).toBe(false);
      const result = await confirmPromise;
      expect(result).toBe(true);
    });

    it("Deve resolver a Promise com false e fechar diálogo ao chamar handleCancel()", async () => {
      const hook = renderHook(() => useConfirmDialog());

      const confirmPromise = hook.current.confirm({
        title: "Cancelar Ação",
      });

      expect(hook.current.isOpen).toBe(true);

      hook.current.handleCancel();

      expect(hook.current.isOpen).toBe(false);
      const result = await confirmPromise;
      expect(result).toBe(false);
    });

    it("Deve tratar múltiplas chamadas sequenciais de confirmação corretamente", async () => {
      const hook = renderHook(() => useConfirmDialog());

      // Primeira chamada - confirmada
      const p1 = hook.current.confirm({ title: "Primeira" });
      hook.current.handleConfirm();
      expect(await p1).toBe(true);

      // Segunda chamada - cancelada
      const p2 = hook.current.confirm({ title: "Segunda" });
      hook.current.handleCancel();
      expect(await p2).toBe(false);
    });
  });

  describe("2. Utilitários de Armazenamento Local (storage.ts)", () => {
    let memoryStore: Record<string, string> = {};

    beforeEach(() => {
      memoryStore = {};
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => memoryStore[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          memoryStore[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete memoryStore[key];
        }),
        clear: vi.fn(() => {
          memoryStore = {};
        }),
      };

      vi.stubGlobal("localStorage", mockLocalStorage);
      vi.stubGlobal("window", { localStorage: mockLocalStorage });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("getItem: Deve retornar valor parseado corretamente para JSON válido", () => {
      memoryStore["usuario"] = JSON.stringify({ name: "Carlos", id: 123 });
      const result = safeStorage.getItem<{ name: string; id: number }>("usuario");
      expect(result).toEqual({ name: "Carlos", id: 123 });
    });

    it("getItem: Deve retornar o fallback quando a chave não existir", () => {
      const result = safeStorage.getItem("chave_inexistente", { fallback: true });
      expect(result).toEqual({ fallback: true });
    });

    it("getItem: Deve retornar fallback padrão (null) quando a chave não existir", () => {
      const result = safeStorage.getItem("chave_ausente");
      expect(result).toBeNull();
    });

    it("getItem: Deve capturar exceção de JSON inválido e retornar o fallback", () => {
      memoryStore["corrompido"] = "{ json_invalido: true ";
      const result = safeStorage.getItem("corrompido", "valor_padrao");
      expect(result).toBe("valor_padrao");
    });

    it("getItem: Deve capturar erro genérico do localStorage e retornar fallback", () => {
      vi.spyOn(window.localStorage, "getItem").mockImplementationOnce(() => {
        throw new Error("Acesso negado ao localStorage");
      });
      const result = safeStorage.getItem("qualquer_chave", "fallback_erro");
      expect(result).toBe("fallback_erro");
    });

    it("setItem: Deve salvar objeto serializado em JSON e retornar true", () => {
      const dados = { tema: "dark", notificacoes: true };
      const ok = safeStorage.setItem("config_app", dados);
      expect(ok).toBe(true);
      expect(memoryStore["config_app"]).toBe(JSON.stringify(dados));
    });

    it("setItem: Deve tratar QuotaExceededError e retornar false sem estourar exceção", () => {
      vi.spyOn(window.localStorage, "setItem").mockImplementationOnce(() => {
        const error = new DOMException("QuotaExceededError", "QuotaExceededError");
        throw error;
      });

      const ok = safeStorage.setItem("dados_gigantes", { payload: "x".repeat(10000) });
      expect(ok).toBe(false);
    });

    it("setItem: Deve retornar false para erro de serialização de objeto circular", () => {
      const objCircular: any = { name: "teste" };
      objCircular.self = objCircular;

      const ok = safeStorage.setItem("circular", objCircular);
      expect(ok).toBe(false);
    });

    it("removeItem: Deve remover chave com sucesso", () => {
      memoryStore["sessao"] = "ativo";
      const ok = safeStorage.removeItem("sessao");
      expect(ok).toBe(true);
      expect(memoryStore["sessao"]).toBeUndefined();
    });

    it("removeItem: Deve capturar erro no removeItem e retornar false", () => {
      vi.spyOn(window.localStorage, "removeItem").mockImplementationOnce(() => {
        throw new Error("Erro ao remover");
      });
      const ok = safeStorage.removeItem("sessao");
      expect(ok).toBe(false);
    });

    it("clear: Deve limpar todo o armazenamento e retornar true", () => {
      memoryStore["k1"] = "v1";
      memoryStore["k2"] = "v2";
      const ok = safeStorage.clear();
      expect(ok).toBe(true);
      expect(Object.keys(memoryStore).length).toBe(0);
    });
  });

  describe("3. Hook de Notificações Toast (useToast.ts)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("Deve inicializar com lista vazia de toasts", () => {
      const hook = renderHook(() => useToast());
      expect(hook.current.toasts).toEqual([]);
    });

    it("Deve adicionar novo toast e gerar ID único", () => {
      const hook = renderHook(() => useToast());

      const id = hook.current.addToast({
        title: "Sucesso!",
        description: "Operação realizada",
        type: "success",
        duration: 5000,
      });

      expect(id).toBeDefined();
      expect(hook.current.toasts).toHaveLength(1);
      expect(hook.current.toasts[0]).toEqual({
        id,
        title: "Sucesso!",
        description: "Operação realizada",
        type: "success",
        duration: 5000,
      });
    });

    it("Deve permitir adicionar toast com ID customizado informado", () => {
      const hook = renderHook(() => useToast());

      const customId = "toast_customizado_123";
      hook.current.addToast({
        id: customId,
        title: "Notificação Fixa",
        type: "info",
      });

      expect(hook.current.toasts).toHaveLength(1);
      expect(hook.current.toasts[0].id).toBe(customId);
    });

    it("Deve atualizar notificação existente com updateToast()", () => {
      const hook = renderHook(() => useToast());

      const id = hook.current.addToast({
        title: "Carregando...",
        type: "info",
        duration: 0,
      });

      expect(hook.current.toasts[0].title).toBe("Carregando...");

      hook.current.updateToast(id, {
        title: "Concluído!",
        type: "success",
      });

      expect(hook.current.toasts[0].title).toBe("Concluído!");
      expect(hook.current.toasts[0].type).toBe("success");
    });

    it("Deve remover notificação específica via dismissToast()", () => {
      const hook = renderHook(() => useToast());

      const id1 = hook.current.addToast({ title: "Toast 1" });
      const id2 = hook.current.addToast({ title: "Toast 2" });

      expect(hook.current.toasts).toHaveLength(2);

      hook.current.dismissToast(id1);

      expect(hook.current.toasts).toHaveLength(1);
      expect(hook.current.toasts[0].id).toBe(id2);
    });

    it("Deve limpar todas as notificações via dismissAll()", () => {
      const hook = renderHook(() => useToast());

      hook.current.addToast({ title: "T1" });
      hook.current.addToast({ title: "T2" });
      hook.current.addToast({ title: "T3" });

      expect(hook.current.toasts).toHaveLength(3);

      hook.current.dismissAll();

      expect(hook.current.toasts).toHaveLength(0);
    });

    it("Deve realizar auto-dismiss do toast quando o tempo expirar", () => {
      const hook = renderHook(() => useToast());

      hook.current.addToast({
        title: "Toast temporário",
        duration: 3000,
      });

      expect(hook.current.toasts).toHaveLength(1);

      // Avança 2900ms (não deve ter fechado ainda)
      vi.advanceTimersByTime(2900);
      expect(hook.current.toasts).toHaveLength(1);

      // Avança mais 200ms (total 3100ms)
      vi.advanceTimersByTime(200);
      expect(hook.current.toasts).toHaveLength(0);
    });
  });
});
