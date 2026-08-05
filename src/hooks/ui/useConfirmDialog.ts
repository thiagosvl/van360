import { useState, useCallback, useRef } from "react";

export interface ConfirmDialogOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export interface UseConfirmDialogReturn {
  isOpen: boolean;
  options: ConfirmDialogOptions;
  confirm: (opts?: ConfirmDialogOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({});
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts?: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts || {});
      setIsOpen(true);
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  };
}

export default useConfirmDialog;
