import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
  usePassageiroFormViewModel,
} from "@/hooks";
import { PassageiroFormModes } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Usuario } from "@/types/usuario";
import { Loader2, User, Wand2, X } from "lucide-react";
import { PassageiroFormDadosCadastrais } from "../features/passageiro/form/PassageiroFormDadosCadastrais";
import { PassageiroFormEndereco } from "../features/passageiro/form/PassageiroFormEndereco";
import { PassageiroFormFinanceiro } from "../features/passageiro/form/PassageiroFormFinanceiro";
import { PassageiroFormResponsavel } from "../features/passageiro/form/PassageiroFormResponsavel";

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
          <div className="bg-blue-600 px-4 py-5 sm:py-6 text-center relative shrink-0">
            <div className="absolute left-4 top-4 sm:top-5 flex gap-2">
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

            <DialogClose className="absolute right-4 top-4 sm:top-5 text-white/70 hover:text-white transition-colors">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-bold text-white leading-none">
                  {mode === PassageiroFormModes.EDIT
                    ? "Editar Passageiro"
                    : mode === PassageiroFormModes.FINALIZE
                      ? "Confirmar Cadastro"
                      : "Novo Passageiro"}
                </DialogTitle>
              </div>
            </div>
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
                      escolas={escolas}
                      veiculos={veiculos}
                    />
                    <PassageiroFormResponsavel isSearching={isSearchingResponsavel} />
                    <PassageiroFormFinanceiro
                      editingPassageiro={editingPassageiro}
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
