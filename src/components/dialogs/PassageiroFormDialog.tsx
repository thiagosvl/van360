import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useLayout } from "@/contexts/LayoutContext";

import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { FEATURE_COBRANCA_AUTOMATICA, FEATURE_LIMITE_FRANQUIA } from "@/constants";
import {
  useBuscarResponsavel,
  useCreatePassageiro,
  useEscolasWithFilters,
  useFinalizePreCadastro,
  usePassageiroForm,
  usePermissions,
  useUpdatePassageiro,
  useVeiculosWithFilters,
} from "@/hooks";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { PassageiroFormData } from "@/hooks/ui/usePassageiroForm";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Usuario } from "@/types/usuario";

import { PassageiroFormModes } from "@/types/enums";
import { moneyToNumber, phoneMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { Loader2, User, Wand2, X } from "lucide-react";
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
  planoProfissional: any;
  is_trial_ativo: boolean;
  is_trial_valido: boolean;
  is_ativo: boolean;
  is_pendente?: boolean;
  is_suspensa?: boolean;
  is_cancelada?: boolean;
  is_profissional: boolean;
  is_essencial: boolean;
} | null;

interface PassengerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassageiro: Passageiro | null;
  mode?: PassageiroFormModes;
  prePassageiro?: PrePassageiro | null;
  onSuccess: (passageiro?: any) => void;
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
  const { openPlanUpgradeDialog } = useLayout();

  const createPassageiro = useCreatePassageiro();
  const updatePassageiro = useUpdatePassageiro();
  const finalizePreCadastro = useFinalizePreCadastro();

  // Validação de Franquia (para upgrades)
  const { limits } = usePlanLimits();

  // Use centralized logic from hook to check availability
  const podeAtivar = limits.franchise.checkAvailability(
    !!editingPassageiro?.enviar_cobranca_automatica
  );

  const { canUseAutomatedCharges: hasCobrancaAutomaticaAccess } = usePermissions();
  
  const validacaoFranquia = {
    franquiaContratada: limits.franchise.limit,
    cobrancasEmUso: limits.franchise.used,
    podeAtivar,
  };

  // Determine includeId for lists based on mode
  const includeEscolaId =
    mode === PassageiroFormModes.EDIT
      ? editingPassageiro?.escola_id
      : mode === PassageiroFormModes.FINALIZE
      ? prePassageiro?.escola_id
      : undefined;

  const includeVeiculoId =
    mode === PassageiroFormModes.EDIT
      ? editingPassageiro?.veiculo_id
      : mode === PassageiroFormModes.FINALIZE
      ? prePassageiro?.veiculo_id
      : undefined;

  // Fetch lists (Centralized)
  const { data: escolasData = [] } = useEscolasWithFilters(
    profile?.id,
    { ativo: "true", includeId: includeEscolaId || undefined },
    { enabled: isOpen && !!profile?.id }
  ) as { data: import("@/types/escola").Escola[] };

  const { data: veiculosData = [] } = useVeiculosWithFilters(
    profile?.id,
    { ativo: "true", includeId: includeVeiculoId || undefined },
    { enabled: isOpen && !!profile?.id }
  ) as { data: import("@/types/veiculo").Veiculo[] };

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
    if (mode === PassageiroFormModes.EDIT || mode === PassageiroFormModes.FINALIZE) return;
    if (cpf.length !== 11 || !profile?.id) return;

    try {
      const responsavel = await buscarResponsavel.mutateAsync({
        cpf,
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

  const handleUpgradeSuccess = () => {
    // Resume action: re-enable check
    form.setValue("enviar_cobranca_automatica", true);
    toast.success("plano.sucesso.limiteExpandido");
  };

  const handleRequestUpgrade = () => {
    // Determina o contexto do upgrade baseado no limite atual
    let feature = FEATURE_LIMITE_FRANQUIA;
    if (limits.franchise.limit === 0) {
      feature = FEATURE_COBRANCA_AUTOMATICA;
    } 

    openPlanUpgradeDialog({
        feature,
        targetPassengerCount: limits.franchise.used + 1,
        onSuccess: handleUpgradeSuccess
    });
  };

  const handleFillMock = () => {
    const currentValues = form.getValues();
    
    // Auto-pick school and vehicle if empty and lists are available
    let escolaId = currentValues.escola_id;
    if (!escolaId && escolasData.length > 0) {
      escolaId = escolasData[Math.floor(Math.random() * escolasData.length)].id;
    }

    let veiculoId = currentValues.veiculo_id;
    if (!veiculoId && veiculosData.length > 0) {
      veiculoId = veiculosData[Math.floor(Math.random() * veiculosData.length)].id;
    }

    const mockData = mockGenerator.passenger({
      escola_id: escolaId,
      veiculo_id: veiculoId,
    });
    
    form.reset(mockData);
    
    // Abrir todos os accordions para mostrar os dados preenchidos
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  };

  const handleSubmit = async (data: PassageiroFormData) => {
    if (!profile?.id) return;

    const valorAtualEnviarCobranca =
      editingPassageiro?.enviar_cobranca_automatica || false;
    const novoValorEnviarCobranca = data.enviar_cobranca_automatica || false;

    if (
      novoValorEnviarCobranca &&
      !valorAtualEnviarCobranca &&
      hasCobrancaAutomaticaAccess
    ) {
      // Usar validação já calculada via hook
      if (!validacaoFranquia.podeAtivar) {
        handleRequestUpgrade();
        // Reverter o valor do campo para false enquanto o upgrade não é feito
        form.setValue("enviar_cobranca_automatica", false);
        return;
      }
    }

    const purePayload = { ...data };
    
    // Sanitização monetária
    if (purePayload.valor_cobranca) {
      purePayload.valor_cobranca = String(moneyToNumber(purePayload.valor_cobranca));
    }

    const commonOptions = {
      onSuccess: (data?: any) => {
        onSuccess(data);
        onClose();
      },
      onError: () => {
        // Error handling
      },
    };

    if (mode === PassageiroFormModes.FINALIZE && prePassageiro) {
      finalizePreCadastro.mutate(
        {
          prePassageiroId: prePassageiro.id,
          data: {
            ...purePayload,
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
          className="w-full max-w-4xl p-0 gap-0 bg-gray-50 h-full max-h-screen sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
          hideCloseButton
          onOpenAutoFocus={(e) => e.preventDefault()}
          // @ts-ignore
          onPointerDownOutside={(e) => {
            // Se necessário, impedir fechar, mas sem dependência de estado local
          }}
        >
          <div className="bg-blue-600 p-4 text-center relative shrink-0">
            <div className="absolute left-4 top-4 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-10 w-10 shadow-sm border border-white/20"
                onClick={handleFillMock}
                title="Preencher com dados fictícios"
              >
                <Wand2 className="h-5 w-5" />
              </Button>
            </div>

            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {mode === PassageiroFormModes.EDIT
                ? "Editar Passageiro"
                : mode === PassageiroFormModes.FINALIZE
                ? "Confirmar Cadastro"
                : "Novo Passageiro"}
            </DialogTitle>
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
                    <PassageiroFormDadosCadastrais 
                      profile={profile} 
                      escolas={escolasData}
                      veiculos={veiculosData}
                    />
                    <PassageiroFormResponsavel isSearching={buscarResponsavel.isPending} />
                    <PassageiroFormFinanceiro
                      editingPassageiro={editingPassageiro}
                      validacaoFranquia={validacaoFranquia}
                      onRequestUpgrade={handleRequestUpgrade}
                    />
                    <PassageiroFormEndereco />
                  </Accordion>
                </form>
              </Form>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
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
              ) : mode === PassageiroFormModes.FINALIZE ? (
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
