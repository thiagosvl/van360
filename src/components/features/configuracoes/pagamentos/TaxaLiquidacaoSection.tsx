import { formatCurrency } from "@/utils/formatters/currency";
import { MultaJurosConfigForm } from "../MultaJurosConfigForm";
import { Percent } from "lucide-react";

interface TaxaLiquidacaoSectionProps {
  taxaEfetiva: number;
  taxaFormatada: string;
}

export function TaxaLiquidacaoSection({
  taxaEfetiva,
  taxaFormatada,
}: TaxaLiquidacaoSectionProps) {
  const valorExemplo = 300;
  const valorLiquidoExemplo = formatCurrency(Math.max(0, valorExemplo - taxaEfetiva));

  return (
    <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5 sm:space-y-6">
      <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
          <Percent className="w-5 h-5 text-[#0a0a0a]" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
            Taxas, Multa e Juros
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Taxa da baixa automática e encargos opcionais para pagamentos em atraso
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0a0a0a]">
            Taxa por Parcela Liquidada
          </h3>
          <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
            Descontada apenas quando o pai paga pelo QR Code Pix. Sem mensalidade, taxa de emissão ou cancelamento.
          </p>
        </div>

        <div className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-medium text-[#0a0a0a]">
              Taxa por parcela paga
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[14px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold text-xs sm:text-sm shrink-0">
              {taxaFormatada}
            </span>
          </div>

          <div className="pt-3 border-t border-[#e5e5e5] space-y-2">
            <span className="text-[11px] font-medium text-[#737373] block">
              Exemplo prático (parcela de R$ 300,00):
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-[12px] bg-white border border-[#e5e5e5]">
                <span className="text-[#737373] text-[11px] block">Cobrado dos Pais</span>
                <p className="font-semibold text-sm text-[#0a0a0a] mt-0.5">
                  R$ 300,00
                </p>
              </div>
              <div className="p-2.5 rounded-[12px] bg-emerald-50/60 border border-emerald-200/60">
                <span className="text-emerald-700 text-[11px] font-medium block">
                  Cai na sua conta
                </span>
                <p className="font-bold text-sm text-emerald-800 mt-0.5">
                  {valorLiquidoExemplo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-[#e5e5e5] space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#0a0a0a]">
            Multa e Juros por Atraso (Opcional)
          </h3>
          <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
            Calculados automaticamente no QR Code Pix após o vencimento. 100% dos encargos são repassados para você.
          </p>
        </div>

        <MultaJurosConfigForm />
      </div>
    </div>
  );
}
