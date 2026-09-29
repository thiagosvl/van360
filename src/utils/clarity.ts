interface ClarityFunction {
  (action: string, ...args: unknown[]): void;
  q?: unknown[];
}

interface CustomWindow extends Window {
  clarity?: ClarityFunction;
  __van360ClarityLoaded?: boolean;
  Capacitor?: {
    isNativePlatform?: () => boolean;
  };
}

export function initClarity(): void {
  if (typeof window === "undefined") return;

  const clarityId = import.meta.env.VITE_PUBLIC_CLARITY_ID;
  if (!import.meta.env.PROD || !clarityId) return;

  const win = window as unknown as CustomWindow;
  if (win.location.pathname.startsWith("/admin")) return;

  const isLocal = win.location.hostname === "localhost" || win.location.hostname === "127.0.0.1";
  const isCapacitor = Boolean(win.Capacitor?.isNativePlatform?.());

  if (isLocal && !isCapacitor) return;
  if (win.__van360ClarityLoaded) return;
  win.__van360ClarityLoaded = true;

  const clarityQueue: ClarityFunction = function (action: string, ...args: unknown[]) {
    clarityQueue.q = clarityQueue.q || [];
    clarityQueue.q.push([action, ...args]);
  };

  win.clarity = clarityQueue;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${clarityId}`;
  const firstScript = document.getElementsByTagName("script")[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
}
