import { formatCurrency } from "@/utils/formatters/currency";
import { Loader2 } from "lucide-react";

interface PriceDisplayProps {
  currentTierOption: { id?: string | number; isCustom?: boolean } | null;
  customPrice: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  planos: any[];
}

export function PriceDisplay({
  currentTierOption,
  customPrice,
  planos,
}: PriceDisplayProps) {
  if (currentTierOption?.isCustom) {
    if (customPrice) {
      return (
        <>
          <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
            <span className="text-4xl font-extrabold tracking-tight">
              {formatCurrency(customPrice)}
            </span>
            <span className="text-gray-400 font-medium text-lg">/mês</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">Plano sob medida</p>
        </>
      );
    }
    return <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto" />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const officialPlan = planos?.find((p: any) => p.id === currentTierOption?.id);
  if (officialPlan) {
    const hasPromo =
      officialPlan.promocao_ativa && officialPlan.preco_promocional;
    const finalPrice = hasPromo
      ? Number(officialPlan.preco_promocional)
      : Number(officialPlan.preco);

    return (
      <>
        {hasPromo ? (
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-400 line-through font-medium mb-[-4px]">
              De {formatCurrency(Number(officialPlan.preco))}
            </span>
            <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
              <span className="text-4xl font-extrabold tracking-tight">
                {formatCurrency(finalPrice)}
              </span>
              <span className="text-gray-400 font-medium text-lg">/mês</span>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
            <span className="text-4xl font-extrabold tracking-tight">
              {formatCurrency(finalPrice)}
            </span>
            <span className="text-gray-400 font-medium text-lg">/mês</span>
          </div>
        )}
      </>
    );
  }
  return <span className="text-gray-400 text-lg">--</span>;
}
