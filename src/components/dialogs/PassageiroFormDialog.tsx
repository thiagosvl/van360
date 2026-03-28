import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
  usePassageiroFormViewModel,
} from "@/hooks";
import { PassageiroFormModes } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Usuario } from "@/types/usuario";
import { Loader2, User, Wand2 } from "lucide-react";
import { PassageiroFormDadosCadastrais } from "../features/passageiro/form/PassageiroFormDadosCadastrais";
import { PassageiroFormEndereco } from "../features/passageiro/form/PassageiroFormEndereco";
import { PassageiroFormFinanceiro } from "../features/passageiro/form/PassageiroFormFinanceiro";
import { PassageiroFormResponsavel } from "../features/passageiro/form/PassageiroFormResponsavel";
import { BaseDialog } from "@/components/ui/BaseDialog";

interface PassengerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassageiro: Passageiro | null;
  mode?: PassageiroFormModes;
  prePassageiro?: PrePassageiro | null;
  onSuccess: (passageiro?: any, formData?: any) => void;
  profile: Usuario | null | undefined;
}

export default function PassengerFormDialog({
  isOpen,
  onClose,
  editingPassageiro,
  mode,
  prePassageiro,
  onSuccess,
  profile,
}: PassengerFormDialogProps) {
  const {
    form,
    refreshing,
    openAccordionItems,
    setOpenAccordionItems,
    escolas,
    veiculos,
    isSubmitting,
    isSearchingResponsavel,
    handleFillMock,
    handleSubmit,
    onFormError,
  } = usePassageiroFormViewModel({
    isOpen,
    onClose,
    editingPassageiro,
    mode,
    prePassageiro,
    onSuccess,
    profile,
  });

  const title = mode === PassageiroFormModes.EDIT
    ? "Editar Passageiro"
    : mode === PassageiroFormModes.FINALIZE
      ? "Confirmar Cadastro"
      : "Novo Passageiro";

  return (
    <>
      <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <BaseDialog.Header
          title={title}
          icon={<User className="w-5 h-5" />}
          onClose={onClose}
          leftAction={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-xl h-11 w-11 shadow-sm border border-slate-100"
              onClick={handleFillMock}
              title="Preencher com dados fictícios"
            >
              <Wand2 className="h-5 w-5" />
            </Button>
          }
        />

        <BaseDialog.Body>
          {refreshing ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                className="space-y-10 pb-6"
              >
                <PassageiroFormDadosCadastrais
                  profile={profile}
                  escolas={escolas}
                  veiculos={veiculos}
                />
                <PassageiroFormResponsavel isSearching={isSearchingResponsavel} />
                <PassageiroFormFinanceiro
                  editingPassageiro={editingPassageiro}
                />
                <PassageiroFormEndereco />
              </form>
            </Form>
          )}
        </BaseDialog.Body>

        <BaseDialog.Footer>
          <BaseDialog.Action
            variant="outline"
            label="Cancelar"
            onClick={onClose}
            disabled={isSubmitting}
          />
          <BaseDialog.Action
            label={mode === PassageiroFormModes.FINALIZE ? "Confirmar" : "Salvar"}
            onClick={form.handleSubmit(handleSubmit, onFormError)}
            isLoading={isSubmitting}
          />
        </BaseDialog.Footer>
      </BaseDialog>
      <LoadingOverlay active={isSubmitting} text="Salvando..." />
    </>
  );
}
