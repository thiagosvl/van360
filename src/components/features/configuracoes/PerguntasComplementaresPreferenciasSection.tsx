import { memo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import {
  CamposFormularioExternoConfig,
  PerguntaPersonalizadaConfig,
  resolvePerguntasPersonalizadas,
  TipoPerguntaPersonalizadaEnum,
} from "@/constants/formularioExterno";
import { ConfiguracoesUsuario, UpdateConfiguracoesInput } from "@/hooks/api/useConfiguracoes";
import { useLayout } from "@/contexts/LayoutContext";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PerguntasComplementaresPreferenciasSectionProps {
  camposAtuais: CamposFormularioExternoConfig;
  updateConfiguracoes: (payload: UpdateConfiguracoesInput) => Promise<ConfiguracoesUsuario>;
  isBusy: boolean;
}

export const PerguntasComplementaresPreferenciasSection = memo(
  function PerguntasComplementaresPreferenciasSection({
    camposAtuais,
    updateConfiguracoes,
    isBusy,
  }: PerguntasComplementaresPreferenciasSectionProps) {
    const { openPerguntaPersonalizadaFormDialog, openConfirmationDialog } = useLayout();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const perguntas = resolvePerguntasPersonalizadas(
      camposAtuais.perguntas_personalizadas
    );

    const handlePersistPerguntas = async (
      novasPerguntas: PerguntaPersonalizadaConfig[],
      successMsg: string,
      busyId: string
    ) => {
      setUpdatingId(busyId);
      try {
        await updateConfiguracoes({
          campos_formulario_externo: {
            ...camposAtuais,
            perguntas_personalizadas: novasPerguntas,
          },
        });
        toast.success(successMsg);
      } catch {
      } finally {
        setUpdatingId(null);
      }
    };

    const handleToggleAtivo = async (item: PerguntaPersonalizadaConfig) => {
      if (isBusy || updatingId !== null) return;
      const novasPerguntas = perguntas.map((p) =>
        p.id === item.id ? { ...p, ativo: !item.ativo } : p
      );
      await handlePersistPerguntas(
        novasPerguntas,
        !item.ativo
          ? "Pergunta ativada no link de cadastro!"
          : "Pergunta ocultada do link de cadastro!",
        item.id
      );
    };

    const handleOpenNovaPergunta = () => {
      openPerguntaPersonalizadaFormDialog({
        editingPergunta: null,
        onSave: async (novaPergunta) => {
          const novasPerguntas = [...perguntas, novaPergunta];
          await handlePersistPerguntas(
            novasPerguntas,
            "Nova pergunta adicionada e ativada!",
            novaPergunta.id
          );
        },
      });
    };

    const handleOpenEditarPergunta = (item: PerguntaPersonalizadaConfig) => {
      openPerguntaPersonalizadaFormDialog({
        editingPergunta: item,
        onSave: async (perguntaAtualizada) => {
          const novasPerguntas = perguntas.map((p) =>
            p.id === item.id ? perguntaAtualizada : p
          );
          await handlePersistPerguntas(
            novasPerguntas,
            "Pergunta atualizada com sucesso!",
            item.id
          );
        },
      });
    };

    const handleConfirmarExclusao = (item: PerguntaPersonalizadaConfig) => {
      openConfirmationDialog({
        title: "Excluir Pergunta",
        description: `Deseja realmente remover a pergunta "${item.pergunta}" da sua lista?`,
        confirmText: "Excluir",
        cancelText: "Cancelar",
        variant: "destructive",
        onConfirm: async () => {
          const novasPerguntas = perguntas.filter((p) => p.id !== item.id);
          await handlePersistPerguntas(
            novasPerguntas,
            "Pergunta removida com sucesso!",
            item.id
          );
        },
      });
    };

    return (
      <div className="pt-6 border-t border-[#e5e5e5] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[10px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
              <ClipboardList className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                Perguntas Complementares
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Ative sugestões prontas ou crie perguntas personalizadas para o responsável responder no link de cadastro.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="tonal"
            size="sm"
            onClick={handleOpenNovaPergunta}
            disabled={isBusy || updatingId !== null}
            className="self-start sm:self-auto rounded-[18px] text-xs px-3.5 h-9 gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Pergunta
          </Button>
        </div>

        <Banner
          variant="info"
          description="As perguntas ativadas abaixo aparecem no link de cadastro, ficam salvas na carteirinha do aluno e saem impressas automaticamente no PDF do contrato."
        />

        <div className="divide-y divide-[#e5e5e5] space-y-3 pt-1">
          {perguntas.map((item, index) => {
            const isItemUpdating = updatingId === item.id;
            const isSimNao = item.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO;

            return (
              <div
                key={item.id}
                className={`flex items-start sm:items-center justify-between gap-3 pt-3.5 ${
                  index === 0 ? "pt-1 first:pt-0" : ""
                }`}
              >
                <div className="space-y-1 min-w-0 pr-1 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="text-sm font-medium text-[#0a0a0a] leading-snug">
                      {item.pergunta}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#737373]">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#171717] font-medium">
                      {isSimNao ? "Sim / Não + Detalhe" : "Texto Aberto"}
                    </span>
                    {!isSimNao && (
                      <span>
                        {item.obrigatorio ? "• Obrigatório se ativo" : "• Opcional"}
                      </span>
                    )}
                    {item.placeholder_detalhe && (
                      <span className="truncate max-w-[260px] sm:max-w-[360px]">
                        • Dica: &quot;{item.placeholder_detalhe}&quot;
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditarPergunta(item)}
                    disabled={isBusy || updatingId !== null}
                    className="h-8 w-8 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#737373] hover:text-[#0a0a0a] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                    title="Editar pergunta"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {!item.is_padrao && (
                    <button
                      type="button"
                      onClick={() => handleConfirmarExclusao(item)}
                      disabled={isBusy || updatingId !== null}
                      className="h-8 w-8 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#e7000b]/10 text-[#737373] hover:text-[#e7000b] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                      title="Excluir pergunta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span className="text-xs font-medium text-[#737373] hidden sm:inline min-w-[52px] text-right">
                    {item.ativo ? "Ativa" : "Oculta"}
                  </span>

                  <Switch
                    id={`switch-pergunta-${item.id}`}
                    checked={item.ativo}
                    loading={isItemUpdating}
                    onCheckedChange={() => handleToggleAtivo(item)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
