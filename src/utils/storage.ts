export const safeStorage = {
  getItem<T>(key: string, fallback: T | null = null): T | null {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return fallback;
      }
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return fallback;
      }
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear(): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      window.localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

export default safeStorage;
