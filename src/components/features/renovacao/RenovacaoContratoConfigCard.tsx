import { FileText, Settings2, CheckCircle2 } from "lucide-react";
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
    <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">
                Contratos Digitais para {anoDestino}
              </h3>
              {usarContratos ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-xs font-medium border bg-emerald-500/[0.08] text-emerald-700 border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-xs font-medium border bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]">
                  Opcional / Inativo
                </span>
              )}
            </div>
            <p className="text-xs text-[#737373] mt-0.5 leading-relaxed font-normal">
              Gera contratos digitais automaticamente no aceite dos responsáveis para {anoDestino}, sem alterar contratos correntes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#737373] hidden sm:inline">
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
            className="h-9 px-3 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] font-medium text-xs gap-1.5 shadow-none cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#737373]" />
            <span>Configurar Modelo</span>
          </Button>
        </div>
      </div>

      {usarContratos && (
        <Banner
          variant="info"
          description={`Ao confirmar a renovação para ${anoDestino}, o responsável receberá o contrato digital para assinatura imediata.`}
          className="rounded-[18px]"
        />
      )}
    </div>
  );
}
