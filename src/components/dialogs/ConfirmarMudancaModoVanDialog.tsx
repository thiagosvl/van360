import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { safeCloseDialog } from "@/hooks";
import { useState } from "react";

export interface DetalhesExcecoesDivergentes {
  desativado?: number;
  lembretes?: number;
  automatica?: number;
}

export interface ConfirmarMudancaModoVanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quantidadeExcecoes: number;
  novoModoLabel: string;
  detalhesExcecoes?: DetalhesExcecoesDivergentes;
  onConfirmar: (aplicarATodos: boolean) => Promise<void> | void;
  onCancel?: () => void;
}

export function ConfirmarMudancaModoVanDialog({
  open,
  onOpenChange,
  quantidadeExcecoes,
  novoModoLabel,
  detalhesExcecoes,
  onConfirmar,
  onCancel,
}: ConfirmarMudancaModoVanDialogProps) {
  const [loadingAction, setLoadingAction] = useState<"todos" | "manter" | null>(null);

  const handleClose = () => {
    if (loadingAction) return;
    onCancel?.();
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleAction = async (aplicarATodos: boolean) => {
    setLoadingAction(aplicarATodos ? "todos" : "manter");
    try {
      safeCloseDialog(() => onOpenChange(false));
      await onConfirmar(aplicarATodos);
    } finally {
      setLoadingAction(null);
    }
  };

  const partes: string[] = [];
  if (detalhesExcecoes?.desativado) {
    partes.push(
      detalhesExcecoes.desativado === 1
        ? "1 sem envio de avisos"
        : `${detalhesExcecoes.desativado} sem envio de avisos`
    );
  }
  if (detalhesExcecoes?.lembretes) {
    partes.push(
      detalhesExcecoes.lembretes === 1
        ? "1 em lembretes no WhatsApp"
        : `${detalhesExcecoes.lembretes} em lembretes no WhatsApp`
    );
  }
  if (detalhesExcecoes?.automatica) {
    partes.push(
      detalhesExcecoes.automatica === 1
        ? "1 na cobrança automática Pix"
        : `${detalhesExcecoes.automatica} na cobrança automática Pix`
    );
  }

  const detalheFormatado = partes.length > 0 ? ` (${partes.join(", ")})` : "";
  const isSingular = quantidadeExcecoes === 1;

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <BaseDialog.Header
        title="Cobrança aos Pais"
        subtitle={`Novo formato selecionado: "${novoModoLabel}".`}
        onClose={handleClose}
      />

      <BaseDialog.Body className="space-y-4">
        <Banner
          variant="warning"
          description={
            isSingular
              ? `Você tem 1 aluno com outra forma de cobrança cadastrada${detalheFormatado}.`
              : `Você tem ${quantidadeExcecoes} alunos com outras formas de cobrança cadastradas${detalheFormatado}.`
          }
        />

        <p className="text-xs sm:text-sm text-[#0a0a0a] font-medium leading-relaxed">
          {isSingular
            ? "O que você deseja fazer com esse aluno?"
            : "O que você deseja fazer com esses alunos?"}
        </p>

        <div className="flex flex-col gap-2.5 pt-1 pb-1">
          <Button
            type="button"
            className="w-full h-10 rounded-[18px] bg-primary text-white hover:bg-primary/90 font-medium text-xs sm:text-sm"
            disabled={loadingAction !== null}
            onClick={() => handleAction(true)}
          >
            {loadingAction === "todos"
              ? "Atualizando..."
              : isSingular
              ? "Atualizar para o novo formato"
              : "Atualizar todos para o novo formato"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 rounded-[18px] border-[#e5e5e5] bg-[#fafafa] hover:bg-[#f5f5f5] text-[#0a0a0a] font-medium text-xs sm:text-sm"
            disabled={loadingAction !== null}
            onClick={() => handleAction(false)}
          >
            {loadingAction === "manter"
              ? "Salvando..."
              : isSingular
              ? "Manter a cobrança dele como está"
              : "Manter a cobrança deles como está"}
          </Button>
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}
