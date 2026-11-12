interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

declare global {
  interface PromiseConstructor {
    withResolvers<T>(): PromiseWithResolvers<T>;
  }
  interface URLConstructor {
    parse(url: string | URL, base?: string | URL): URL | null;
    canParse(url: string | URL, base?: string | URL): boolean;
  }
}

if (typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = function <T>(): PromiseWithResolvers<T> {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

if (typeof URL !== "undefined" && typeof URL.parse !== "function") {
  URL.parse = function (url: string | URL, base?: string | URL): URL | null {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  };
}

if (typeof URL !== "undefined" && typeof URL.canParse !== "function") {
  URL.canParse = function (url: string | URL, base?: string | URL): boolean {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}

export {};
