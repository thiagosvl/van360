import { useCalcularPrecoPreview } from "@/hooks/api/usePlanos";
import { useEffect, useState } from "react";

interface UseCustomPricePreviewProps {
  currentTierOption: {
    id: string | number;
    quantidade: number | string;
    isCustom?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  planos: any[];
  open: boolean;
  minAllowedQuantity: number;
}

export function useCustomPricePreview({
  currentTierOption,
  planos,
  open,
  minAllowedQuantity,
}: UseCustomPricePreviewProps) {
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const calcularPrecoPreview = useCalcularPrecoPreview();

  useEffect(() => {
    if (!open) return;
    if (!currentTierOption) return;

    const timer = setTimeout(() => {
      setIsDebouncing(false);

      const isOfficialPlan = planos.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.id === currentTierOption.id
      );

      const qty = Number(currentTierOption.quantidade);
      const isQuantityValid =
        !currentTierOption.isCustom || qty >= minAllowedQuantity;

      if (
        (currentTierOption.isCustom || !isOfficialPlan) &&
        qty > 0 &&
        isQuantityValid
      ) {
        calcularPrecoPreview.mutate(qty, {
          onSuccess: (res) => {
            if (res) setCustomPrice(res.preco);
          },
        });
      } else {
        setCustomPrice(null);
      }
    }, 600);

    if (currentTierOption.isCustom) {
      setIsDebouncing(true);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [
    currentTierOption,
    planos,
    open,
    minAllowedQuantity,
    calcularPrecoPreview.mutate,
  ]);

  return {
    customPrice,
    isDebouncing,
    isLoading: calcularPrecoPreview.isPending,
  };
}
