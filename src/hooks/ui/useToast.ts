import { useState, useCallback, useRef, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export interface UseToastReturn {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id"> & { id?: string }) => string;
  updateToast: (id: string, updates: Partial<Omit<ToastItem, "id">>) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (toastData: Omit<ToastItem, "id"> & { id?: string }): string => {
      const id = toastData.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { ...toastData, id };
      const duration = toastData.duration ?? 3000;

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  const updateToast = useCallback(
    (id: string, updates: Partial<Omit<ToastItem, "id">>) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );

      if (updates.duration !== undefined) {
        const existingTimer = timersRef.current.get(id);
        if (existingTimer) {
          clearTimeout(existingTimer);
          timersRef.current.delete(id);
        }
        if (updates.duration > 0) {
          const newTimer = setTimeout(() => {
            dismissToast(id);
          }, updates.duration);
          timersRef.current.set(id, newTimer);
        }
      }
    },
    [dismissToast]
  );

  const dismissAll = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return {
    toasts,
    addToast,
    updateToast,
    dismissToast,
    dismissAll,
  };
}

export default useToast;
