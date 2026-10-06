import React from "react";
import { FileText, Settings2, CheckCircle2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
import { useRenovacaoContratoConfig, useSalvarRenovacaoContratoConfig } from "@/hooks/api/useRenovacoes";
import { useProfile } from "@/hooks/business/useProfile";
import { useLayout } from "@/contexts/LayoutContext";
import { toast } from "sonner";

interface RenovacaoContratoConfigCardProps {
  anoDestino: number;
}

export function RenovacaoContratoConfigCard({ anoDestino }: RenovacaoContratoConfigCardProps) {
  const { profile } = useProfile();
  const { openContractSetupDialog } = useLayout();
  const { data: configContrato, isLoading } = useRenovacaoContratoConfig(anoDestino);
  const salvarConfigMutation = useSalvarRenovacaoContratoConfig();

  const usarContratos = Boolean(configContrato?.usar_contratos);
  const temAssinatura = Boolean(profile?.assinatura_digital_url);

  const handleToggleUsarContratos = async (checked: boolean) => {
    if (checked && !temAssinatura) {
      toast.info("Configure a assinatura digital e as cláusulas antes de ativar o contrato.");
      openContractSetupDialog({ ano: anoDestino });
      return;
    }

    try {
      await salvarConfigMutation.mutateAsync({
        ano: anoDestino,
        usar_contratos: checked,
        multa_atraso: configContrato?.multa_atraso,
        juros_atraso: configContrato?.juros_atraso,
        multa_rescisao: configContrato?.multa_rescisao,
        secoes: configContrato?.secoes,
        clausulas: configContrato?.clausulas,
      });
      toast.success(
        checked
          ? `Geração de contrato digital ativada para ${anoDestino}.`
          : `Geração de contrato digital desativada para ${anoDestino}.`
      );
    } catch {
      toast.error("Erro ao atualizar configuração de contratos.");
    }
  };

  const handleOpenConfig = () => {
    openContractSetupDialog({ ano: anoDestino });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Contratos Digitais para {anoDestino}
              </h3>
              {usarContratos ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <CheckCircle2 className="w-3 h-3" />
                  Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Opcional / Inativo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Gera contratos digitais automaticamente no momento do aceite dos responsáveis para {anoDestino}, sem alterar o contrato corrente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 hidden sm:inline">
              {usarContratos ? "Ativado" : "Desativado"}
            </span>
            <Switch
              checked={usarContratos}
              onCheckedChange={handleToggleUsarContratos}
              loading={isLoading || salvarConfigMutation.isPending}
              disabled={isLoading || salvarConfigMutation.isPending}
              aria-label={`Alternar contratos digitais para ${anoDestino}`}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenConfig}
            className="h-8 text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 gap-1.5"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            Configurar Minuta
          </Button>
        </div>
      </div>

      {usarContratos && (
        <Banner
          variant="info"
          description={`Ao confirmar a renovação de uma vaga para ${anoDestino}, o responsável receberá o contrato digital para assinatura imediata.`}
        />
      )}
    </div>
  );
}
