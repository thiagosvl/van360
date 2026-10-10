import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
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
import { Banner } from "@/components/ui/Banner";
import { isDevEnv } from "@/utils/detectPlatform";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const EDIT_TABS = [
  { id: "section-identificacao", label: "Identificação" },
  { id: "section-escola-transporte", label: "Escola e Transporte" },
  { id: "section-responsavel-financeiro", label: "Responsável Financeiro" },
  { id: "section-endereco-principal", label: "Endereço Principal" },
  { id: "section-parcelas", label: "Parcelas" },
] as const;

interface PassengerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassageiro: Passageiro | null;
  mode?: PassageiroFormModes;
  prePassageiro?: PrePassageiro | null;
  onSuccess: (passageiro?: Passageiro, options?: { formData?: Record<string, unknown>; hasCriticalContractChanges?: boolean }) => void;
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

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const tabsListRef = useRef<HTMLDivElement | null>(null);
  const isManualScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<string>("section-identificacao");

  const title = mode === PassageiroFormModes.EDIT
    ? "Editar Aluno"
    : mode === PassageiroFormModes.FINALIZE
      ? "Confirmar Cadastro"
      : "Novo Aluno";

  useEffect(() => {
    if (isOpen) {
      setActiveTab("section-identificacao");
      isManualScrollRef.current = false;
    }
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || mode !== PassageiroFormModes.EDIT) return;

    const scrollTabs = () => {
      const tabsContainer = tabsListRef.current;
      if (!tabsContainer) return;

      const activeBtn = tabsContainer.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement | null;
      if (activeBtn) {
        const tabsRect = tabsContainer.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        const btnLeftRel = btnRect.left - tabsRect.left + tabsContainer.scrollLeft;
        const targetScrollLeft = btnLeftRel - (tabsContainer.clientWidth / 2) + (btnRect.width / 2);

        tabsContainer.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: "smooth",
        });
      }
    };

    scrollTabs();
    const timer = setTimeout(scrollTabs, 40);
    return () => clearTimeout(timer);
  }, [activeTab, isOpen, mode]);

  useEffect(() => {
    if (!isOpen || mode !== PassageiroFormModes.EDIT || refreshing) return;

    let cleanupListener: (() => void) | null = null;
    let timer: NodeJS.Timeout | null = null;

    const setupListener = () => {
      const container = bodyRef.current;
      if (!container) return;

      const handleScroll = () => {
        if (isManualScrollRef.current) return;

        const containerRect = container.getBoundingClientRect();
        let currentSection: string = EDIT_TABS[0].id;

        for (const tab of EDIT_TABS) {
          const el = container.querySelector(`#${tab.id}`) as HTMLElement | null;
          if (el) {
            const elRect = el.getBoundingClientRect();
            if (elRect.top - containerRect.top <= 140) {
              currentSection = tab.id;
            }
          }
        }
        setActiveTab((prev) => (prev !== currentSection ? currentSection : prev));
      };

      container.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      cleanupListener = () => container.removeEventListener("scroll", handleScroll);
    };

    setupListener();
    timer = setTimeout(setupListener, 50);

    return () => {
      if (timer) clearTimeout(timer);
      if (cleanupListener) cleanupListener();
    };
  }, [isOpen, mode, refreshing]);

  const handleTabClick = (sectionId: string) => {
    setActiveTab(sectionId);
    isManualScrollRef.current = true;
    const container = bodyRef.current;
    if (!container) return;

    const target = container.querySelector(`#${sectionId}`) as HTMLElement | null;
    if (target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
      const offsetMargin = 65;

      container.scrollTo({
        top: Math.max(0, relativeTop - offsetMargin),
        behavior: "smooth",
      });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isManualScrollRef.current = false;
      }, 700);
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      maxWidth="2xl"
    >
      <BaseDialog.Header
        title={title}
        icon={<User className="w-5 h-5" />}
        onClose={onClose}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-[18px] h-10 w-10 border border-[#e5e5e5] cursor-pointer"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <BaseDialog.Body containerRef={bodyRef}>
        {refreshing ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {mode === PassageiroFormModes.EDIT && (
              <div
                ref={tabsListRef}
                className="sticky top-0 z-30 bg-white -mt-2 pt-2.5 pb-2.5 mb-4 -mx-6 px-6 border-b border-[#e5e5e5] flex gap-1.5 justify-start overflow-x-auto h-auto no-scrollbar scrollbar-none shrink-0"
              >
                {EDIT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    data-tab-id={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={cn(
                      "rounded-[18px] px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer active:scale-95 border",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary border-primary/20 font-semibold"
                        : "bg-[#f5f5f5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#eeeeee] border-transparent"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                className="space-y-6 pb-6"
              >
                <section>
                  <PassageiroFormDadosCadastrais
                    profile={profile}
                    escolas={escolas}
                    veiculos={veiculos}
                    hideAtivo={mode !== PassageiroFormModes.EDIT}
                  />
                </section>

                <hr className="border-[#e5e5e5]" />

                <section>
                  <PassageiroFormResponsavel isSearching={isSearchingResponsavel} />
                </section>

                <hr className="border-[#e5e5e5]" />

                <section>
                  <PassageiroFormFinanceiro
                    editingPassageiro={editingPassageiro}
                  />
                </section>

                <hr className="border-[#e5e5e5]" />

                <section>
                  <PassageiroFormEndereco />
                </section>
              </form>
            </Form>
          </>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
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
  );
}
