import { FileText, Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
          ? `Contrato digital ativado para ${anoDestino}.`
          : `Contrato digital desativado para ${anoDestino}.`
      );
    } catch {
      toast.error("Erro ao atualizar configuração de contratos.");
    }
  };

  return (
    <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-xs space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">
              Contrato Digital
            </h3>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Exigir assinatura do contrato ao confirmar a vaga.
            </p>
          </div>
        </div>

        <div className="shrink-0 pt-0.5">
          <Switch
            checked={usarContratos}
            onCheckedChange={handleToggleUsarContratos}
            loading={isLoading || salvarConfigMutation.isPending}
            disabled={isLoading || salvarConfigMutation.isPending}
            aria-label={`Alternar contrato digital para ${anoDestino}`}
          />
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
        <span className="text-[11px] sm:text-xs text-[#737373] truncate">
          {usarContratos
            ? "Cláusulas e termos configurados para a renovação"
            : "Ative para exigir assinatura ao confirmar vaga"}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openContractSetupDialog({ ano: anoDestino })}
          className="h-8 px-3 rounded-[14px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1.5 shadow-none shrink-0 cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5 text-[#737373]" />
          <span>Configurar</span>
        </Button>
      </div>
    </div>
  );
}
