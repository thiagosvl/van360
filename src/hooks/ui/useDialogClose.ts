import { useCallback } from "react";

const BODY_LOCK_CLASSNAMES = [
  "_react-remove-scroll-bar",
  "react-remove-scroll-bar",
  "with-scroll-bars-hidden",
];

const RADIX_LAYER_SELECTORS = [
  "[data-radix-dialog-content]",
  "[data-radix-alert-dialog-content]",
  "[data-radix-popover-content]",
  "[data-radix-dropdown-menu-content]",
  "[data-radix-context-menu-content]",
  "[data-radix-hover-card-content]",
  "[data-radix-navigation-menu-content]",
  "[data-radix-menubar-content]",
  "[data-radix-select-content]",
  "[data-vaul-drawer]",
];

const DEFAULT_CLOSE_DELAY = 25;
const DEFAULT_FORCE_CLEANUP_TIMEOUT = 600;

const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

const hasActiveLayer = () => {
  if (!isBrowser) return false;
  return RADIX_LAYER_SELECTORS.some(
    (selector) => document.querySelector(selector) !== null
  );
};

const bodyHasLocks = () => {
  if (!isBrowser) return false;
  const { body, documentElement } = document;
  if (!body) return false;

  if (body.style.pointerEvents === "none") return true;
  if (body.hasAttribute("data-scroll-locked")) return true;

  return BODY_LOCK_CLASSNAMES.some(
    (className) =>
      body.classList.contains(className) ||
      documentElement?.classList.contains(className)
  );
};

const stripBodyLockArtifacts = () => {
  if (!isBrowser) return;
  const { body, documentElement } = document;
  if (!body) return;

  body.style.pointerEvents = "";
  body.style.removeProperty("overflow");
  body.style.removeProperty("padding-right");
  body.style.removeProperty("margin-right");
  body.style.removeProperty("touch-action");

  BODY_LOCK_CLASSNAMES.forEach((className) => {
    body.classList.remove(className);
    documentElement?.classList.remove(className);
  });

  // Classes criadas pelo react-remove-scroll quando inert é habilitado
  body.className
    .split(" ")
    .filter(
      (className) =>
        className.startsWith("block-interactivity-") ||
        className.startsWith("allow-interactivity-")
    )
    .forEach((className) => body.classList.remove(className));

  if (body.hasAttribute("data-scroll-locked")) {
    body.removeAttribute("data-scroll-locked");
  }
};

const waitForLayerCleanup = (timeout: number) => {
  if (!isBrowser) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const deadline = performance.now() + timeout;

    const check = () => {
      if (!hasActiveLayer() && !bodyHasLocks()) {
        resolve();
        return;
      }

      if (performance.now() >= deadline) {
        resolve();
        return;
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
};

const executeClose = (callback: () => void, waitBeforeClose: number, cleanupTimeout: number) => {
  if (!isBrowser) {
    callback();
    return;
  }

  document.body?.click();

  const performClose = () => {
    callback();
    waitForLayerCleanup(cleanupTimeout).finally(stripBodyLockArtifacts);
  };

  if (waitBeforeClose <= 0) {
    requestAnimationFrame(performClose);
  } else {
    window.setTimeout(performClose, waitBeforeClose);
  }
};

const resolveTimings = (legacyDelay?: number) => {
  if (typeof legacyDelay === "number") {
    const sanitized = Math.max(0, legacyDelay);
    return {
      waitBeforeClose: sanitized,
      cleanupTimeout: Math.max(DEFAULT_FORCE_CLEANUP_TIMEOUT, sanitized * 2),
    };
  }

  return {
    waitBeforeClose: DEFAULT_CLOSE_DELAY,
    cleanupTimeout: DEFAULT_FORCE_CLEANUP_TIMEOUT,
  };
};

/**
 * Hook para fechar dialogs de forma segura, limpando locks do body
 * Mantém compatibilidade com a API antiga (delay opcional)
 */
export function useDialogClose() {
  const closeDialog = useCallback(
    (callback: () => void, delay?: number) => {
      const timings = resolveTimings(delay);
      executeClose(callback, timings.waitBeforeClose, timings.cleanupTimeout);
    },
    []
  );

  return { closeDialog };
}

/**
 * Função utilitária para compatibilidade com código existente
 * @deprecated Prefira o hook useDialogClose
 */
export const safeCloseDialog = (callback: () => void, time?: number) => {
  const timings = resolveTimings(time);
  executeClose(callback, timings.waitBeforeClose, timings.cleanupTimeout);
};

