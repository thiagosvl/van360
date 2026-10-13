import { FileText, Settings2, CheckCircle2 } from "lucide-react";
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
    <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[12px] bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-[#0a0a0a]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#0a0a0a]">
              Contrato Digital • {anoDestino}
            </h3>
            {usarContratos ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[18px] text-[11px] font-medium border bg-emerald-50 text-emerald-800 border-emerald-300/80">
                <CheckCircle2 className="w-3 h-3" />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-[18px] text-[11px] font-medium border bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]">
                Desativado
              </span>
            )}
          </div>
          <p className="text-xs text-[#737373] mt-0.5 truncate">
            Exigir assinatura digital do responsável ao confirmar a vaga.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
        <Switch
          checked={usarContratos}
          onCheckedChange={handleToggleUsarContratos}
          loading={isLoading || salvarConfigMutation.isPending}
          disabled={isLoading || salvarConfigMutation.isPending}
          aria-label={`Alternar contrato digital para ${anoDestino}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openContractSetupDialog({ ano: anoDestino })}
          className="h-8 px-2.5 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1.5 shadow-none cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5 text-[#737373]" />
          <span>Configurar</span>
        </Button>
      </div>
    </div>
  );
}
