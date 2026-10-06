import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/ui/Banner";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { PixConfiguracaoForm } from "./PixConfiguracaoForm";
import { MultaJurosConfigForm } from "./MultaJurosConfigForm";
import { CreditCard, Percent } from "lucide-react";
import React from "react";

export const PagamentosTab = React.memo(function PagamentosTab() {
  const { user } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const { financeiro, isLoading: isFinanceiroLoading } = useMotoristaFinanceiroApi();

  const isLoading = isProfileLoading || isFinanceiroLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const temChavePix = Boolean(financeiro?.chave_pix_repasse || profile?.chave_pix);
  const hasCobrancaAutomaticaAtiva = Boolean(financeiro?.cobranca_automatica_ativa && temChavePix);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a3a5c]">
              Pagamentos & Pix
            </h2>
            <p className="text-xs text-slate-500">
              Chave Pix de recebimento e preferências de cobrança automática das parcelas.
            </p>
          </div>
        </div>

        {!temChavePix && (
          <Banner
            variant="info"
            description="Cadastre sua chave Pix para receber os repasses das cobranças direto na sua conta bancária."
          />
        )}

        <PixConfiguracaoForm showDeleteButton={true} />
      </div>

      {hasCobrancaAutomaticaAtiva && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a3a5c]">
                Multa e Juros por Atraso
              </h2>
              <p className="text-xs text-slate-500">
                Configure os encargos automáticos incidentes no QR Code Pix para pagamentos após o vencimento.
              </p>
            </div>
          </div>

          <MultaJurosConfigForm />
        </div>
      )}
    </div>
  );
});
