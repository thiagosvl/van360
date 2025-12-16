import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useBuscarResponsavel,
  useCreatePassageiro,
  useFinalizePreCadastro,
  usePassageiroForm,
  useUpdatePassageiro,
} from "@/hooks";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useSession } from "@/hooks/business/useSession";
import { PassageiroFormData } from "@/hooks/ui/usePassageiroForm";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Usuario } from "@/types/usuario";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { updateQuickStartStepWithRollback } from "@/utils/domain/quickstart/quickStartUtils";
import { phoneMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { Loader2, User, X } from "lucide-react";
import { useEffect } from "react";
import { PassageiroFormDadosCadastrais } from "../features/passageiro/form/PassageiroFormDadosCadastrais";
import { PassageiroFormEndereco } from "../features/passageiro/form/PassageiroFormEndereco";
import { PassageiroFormFinanceiro } from "../features/passageiro/form/PassageiroFormFinanceiro";
import { PassageiroFormResponsavel } from "../features/passageiro/form/PassageiroFormResponsavel";

type PlanoUsuario = {
  slug: string;
  status: string;
  trial_end_at: string | null;
  ativo: boolean;
  planoCompleto: any;
  isTrial: boolean;
  isValidTrial: boolean;
  isActive: boolean;
  isValidPlan: boolean;
  isFreePlan: boolean;
  isCompletePlan: boolean;
  isEssentialPlan: boolean;
} | null;

interface PassengerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassageiro: Passageiro | null;
  mode?: "create" | "edit" | "finalize";
  prePassageiro?: PrePassageiro | null;
  onSuccess: () => void;
  // Props removed as they are now handled by LayoutContext
  // onCreateEscola?: () => void;
  // onCreateVeiculo?: () => void;
  // novaEscolaId?: string | null;
  // novoVeiculoId?: string | null;
  profile: Usuario | null | undefined;
  plano: PlanoUsuario;
}

export default function PassengerFormDialog({
  isOpen,
  onClose,
  editingPassageiro,
  mode,
  prePassageiro,
  onSuccess,
  profile,
  plano,
}: PassengerFormDialogProps) {
  const { openLimiteFranquiaDialog, isLimiteFranquiaDialogOpen } = useLayout();
  const { user } = useSession();

  const createPassageiro = useCreatePassageiro();
  const updatePassageiro = useUpdatePassageiro();
  const finalizePreCadastro = useFinalizePreCadastro();

  // Validação de Franquia (para upgrades)
  // Validação de Franquia (para upgrades)
  const { limits } = usePlanLimits({ userUid: user?.id, profile });

  // Use centralized logic from hook to check availability
  // If editing an enabled passenger, we pass true to exclude them from the count check
  const podeAtivar = limits.franchise.checkAvailability(
    !!editingPassageiro?.enviar_cobranca_automatica
  );

  const validacaoFranquia = {
    franquiaContratada: limits.franchise.limit,
    cobrancasEmUso: limits.franchise.used,
    podeAtivar,
  };

  const { form, refreshing, openAccordionItems, setOpenAccordionItems } =
    usePassageiroForm({
      isOpen,
      mode,
      editingPassageiro,
      prePassageiro,
      plano,
      podeAtivarCobrancaAutomatica: validacaoFranquia.podeAtivar,
    });

  const onFormError = (errors: any) => {
    toast.error("validacao.formularioComErros");
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  };

  const buscarResponsavel = useBuscarResponsavel();

  const handleSearchResponsavel = async (cpf: string) => {
    if (mode === "edit" || mode === "finalize") return;
    if (cpf.length !== 11 || !profile?.id) return;

    try {
      const responsavel = await buscarResponsavel.mutateAsync({
        cpf,
        usuarioId: profile.id,
      });

      if (responsavel) {
        form.setValue("nome_responsavel", responsavel.nome_responsavel || "");
        form.setValue("email_responsavel", responsavel.email_responsavel || "");
        form.setValue(
          "telefone_responsavel",
          phoneMask(responsavel.telefone_responsavel) || ""
        );
      }
    } catch (error) {
      // Silencioso se não encontrar ou erro
    }
  };

  // Monitorar mudanças no CPF para busca automática
  const cpfResponsavelValue = form.watch("cpf_responsavel");
  useEffect(() => {
    if (
      cpfResponsavelValue &&
      cpfResponsavelValue.replace(/\D/g, "").length === 11
    ) {
      handleSearchResponsavel(cpfResponsavelValue.replace(/\D/g, ""));
    }
  }, [cpfResponsavelValue]);

  const handleSubmit = async (data: PassageiroFormData) => {
    if (!profile?.id) return;

    const valorAtualEnviarCobranca =
      editingPassageiro?.enviar_cobranca_automatica || false;
    const novoValorEnviarCobranca = data.enviar_cobranca_automatica || false;

    if (
      novoValorEnviarCobranca &&
      !valorAtualEnviarCobranca &&
      canUseCobrancaAutomatica(plano as any)
    ) {
      // Usar validação já calculada via hook
      if (!validacaoFranquia.podeAtivar) {
        openLimiteFranquiaDialog({
          targetPassengerId: editingPassageiro?.id,
          onUpgradeSuccess: () => {
            // Resume action: re-enable check
            form.setValue("enviar_cobranca_automatica", true);
          },
        });
        // Reverter o valor do campo para false
        form.setValue("enviar_cobranca_automatica", false);
        return;
      }
    }

    const { emitir_cobranca_mes_atual, ...purePayload } = data;

    // Preparar rollback do QuickStart apenas para criações (não para edições)
    const shouldUpdateQuickStart = !editingPassageiro;
    const quickStartRollback = shouldUpdateQuickStart
      ? updateQuickStartStepWithRollback("step_passageiros")
      : null;

    const commonOptions = {
      onSuccess: () => {
        onSuccess();
        onClose();
      },
      onError: () => {
        if (quickStartRollback) {
          quickStartRollback.restore();
        }
      },
    };

    if (mode === "finalize" && prePassageiro) {
      finalizePreCadastro.mutate(
        {
          prePassageiroId: prePassageiro.id,
          data: {
            ...purePayload,
            emitir_cobranca_mes_atual,
            usuario_id: prePassageiro.usuario_id,
          },
        },
        commonOptions
      );
    } else if (editingPassageiro) {
      updatePassageiro.mutate(
        {
          id: editingPassageiro.id,
          data: purePayload,
        },
        {
          onSuccess: commonOptions.onSuccess,
        }
      );
    } else {
      createPassageiro.mutate(
        {
          ...purePayload,
          emitir_cobranca_mes_atual,
          usuario_id: profile.id,
        },
        commonOptions
      );
    }
  };

  const isSubmitting =
    createPassageiro.isPending ||
    updatePassageiro.isPending ||
    finalizePreCadastro.isPending;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
      >
        <DialogContent
          className="w-full max-w-4xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
          hideCloseButton
          onOpenAutoFocus={(e) => e.preventDefault()}
          // @ts-ignore
          onPointerDownOutside={(e) => {
            // Se o dialog de upgrade (franquia) estiver aberto, ignorar cliques fora
            // Isso previne que o PassageiroFormDialog feche acidentalmente
            if (isLimiteFranquiaDialogOpen) {
              e.preventDefault();
            }
          }}
        >
          <div className="bg-blue-600 p-4 text-center relative shrink-0">
            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {mode === "edit"
                ? "Editar Passageiro"
                : mode === "finalize"
                ? "Confirmar Cadastro"
                : "Novo Passageiro"}
            </DialogTitle>
            <DialogDescription className="text-blue-100/80 text-sm mt-1">
              {mode === "edit"
                ? "Atualize as informações do passageiro."
                : "Revise os dados abaixo e confirme o cadastro."}
            </DialogDescription>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {refreshing ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                  className="space-y-6"
                >
                  <Accordion
                    type="multiple"
                    value={openAccordionItems}
                    onValueChange={setOpenAccordionItems}
                    className="space-y-4"
                  >
                    <PassageiroFormDadosCadastrais profile={profile} />
                    <PassageiroFormResponsavel />
                    <PassageiroFormFinanceiro
                      editingPassageiro={editingPassageiro}
                      validacaoFranquia={validacaoFranquia}
                    />
                    <PassageiroFormEndereco />
                  </Accordion>
                </form>
              </Form>
            )}
          </div>

          <div className="p-4 border-t bg-white shrink-0 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(handleSubmit, onFormError)}
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : mode === "finalize" ? (
                "Confirmar"
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <LoadingOverlay active={isSubmitting} text="Salvando..." />
    </>
  );
}
