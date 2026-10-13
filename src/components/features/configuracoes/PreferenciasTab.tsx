import { memo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PreferenciasTabSkeleton } from "@/components/skeletons";
import { useConfiguracoes } from "@/hooks";
import { Check, Loader2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const PreferenciasTab = memo(function PreferenciasTab() {
  const { configuracoes, isLoading, updateConfiguracoes, isUpdating } = useConfiguracoes();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const formatoAtual = configuracoes?.formato_nome_responsavel || "primeiro_nome";
  const exibirTelefoneAtual = configuracoes?.exibir_telefone_lista_alunos ?? false;
  const isBusy = isLoading || isUpdating || updatingKey !== null;

  const handleSelectFormato = async (formato: "primeiro_nome" | "completo") => {
    if (formato === formatoAtual || isBusy) return;
    setUpdatingKey(formato);
    try {
      await updateConfiguracoes({ formato_nome_responsavel: formato });
      toast.success("Preferência de exibição atualizada com sucesso!");
    } catch {
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleToggleTelefone = async (novoValor: boolean) => {
    if (novoValor === exibirTelefoneAtual || isBusy) return;
    setUpdatingKey(novoValor ? "telefone_true" : "telefone_false");
    try {
      await updateConfiguracoes({ exibir_telefone_lista_alunos: novoValor });
      toast.success(
        novoValor
          ? "Telefone ativado na lista de alunos!"
          : "Telefone ocultado da lista de alunos!"
      );
    } catch {
    } finally {
      setUpdatingKey(null);
    }
  };

  if (isLoading || !configuracoes) {
    return <PreferenciasTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
          <SlidersHorizontal className="w-5 h-5 text-[#0a0a0a]" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
            Preferências do Aplicativo
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Personalize a forma como as informações são apresentadas no seu aplicativo.
          </p>
        </div>
      </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[#0a0a0a]">
              Exibição do Nome do Responsável
            </h3>
            <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
              Escolha como o responsável deve aparecer abaixo do nome do aluno nas telas do aplicativo.
            </p>
          </div>

          <div className="rounded-[18px] border border-[#e5e5e5] bg-white divide-y divide-[#e5e5e5] overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => handleSelectFormato("primeiro_nome")}
              disabled={isBusy}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                formatoAtual === "primeiro_nome" ? "bg-[#fafafa]" : "hover:bg-[#fafafa]/60 bg-white",
                isBusy ? "cursor-not-allowed opacity-60 pointer-events-none" : "cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                  formatoAtual === "primeiro_nome"
                    ? "border-primary bg-primary"
                    : "border-[#e5e5e5] bg-transparent"
                )}
              >
                {updatingKey === "primeiro_nome" ? (
                  <Loader2 className="w-2.5 h-2.5 text-primary-foreground animate-spin" />
                ) : formatoAtual === "primeiro_nome" ? (
                  <Check className="w-2.5 h-2.5 text-primary-foreground stroke-[3]" />
                ) : null}
              </div>
              <span className="text-sm font-medium text-[#0a0a0a]">
                Apenas Primeiro Nome
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectFormato("completo")}
              disabled={isBusy}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                formatoAtual === "completo" ? "bg-[#fafafa]" : "hover:bg-[#fafafa]/60 bg-white",
                isBusy ? "cursor-not-allowed opacity-60 pointer-events-none" : "cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                  formatoAtual === "completo"
                    ? "border-primary bg-primary"
                    : "border-[#e5e5e5] bg-transparent"
                )}
              >
                {updatingKey === "completo" ? (
                  <Loader2 className="w-2.5 h-2.5 text-primary-foreground animate-spin" />
                ) : formatoAtual === "completo" ? (
                  <Check className="w-2.5 h-2.5 text-primary-foreground stroke-[3]" />
                ) : null}
              </div>
              <span className="text-sm font-medium text-[#0a0a0a]">
                Nome Completo
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[#0a0a0a]">
              Telefone do Responsável na Lista de Alunos
            </h3>
            <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
              Válido exclusivamente para a tela de Alunos. Escolha se o telefone de contato deve ser exibido na listagem.
            </p>
          </div>

          <div className="rounded-[18px] border border-[#e5e5e5] bg-white divide-y divide-[#e5e5e5] overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => handleToggleTelefone(false)}
              disabled={isBusy}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                !exibirTelefoneAtual ? "bg-[#fafafa]" : "hover:bg-[#fafafa]/60 bg-white",
                isBusy ? "cursor-not-allowed opacity-60 pointer-events-none" : "cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                  !exibirTelefoneAtual
                    ? "border-primary bg-primary"
                    : "border-[#e5e5e5] bg-transparent"
                )}
              >
                {updatingKey === "telefone_false" ? (
                  <Loader2 className="w-2.5 h-2.5 text-primary-foreground animate-spin" />
                ) : !exibirTelefoneAtual ? (
                  <Check className="w-2.5 h-2.5 text-primary-foreground stroke-[3]" />
                ) : null}
              </div>
              <span className="text-sm font-medium text-[#0a0a0a]">
                Não Exibir Telefone
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleTelefone(true)}
              disabled={isBusy}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                exibirTelefoneAtual ? "bg-[#fafafa]" : "hover:bg-[#fafafa]/60 bg-white",
                isBusy ? "cursor-not-allowed opacity-60 pointer-events-none" : "cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                  exibirTelefoneAtual
                    ? "border-primary bg-primary"
                    : "border-[#e5e5e5] bg-transparent"
                )}
              >
                {updatingKey === "telefone_true" ? (
                  <Loader2 className="w-2.5 h-2.5 text-primary-foreground animate-spin" />
                ) : exibirTelefoneAtual ? (
                  <Check className="w-2.5 h-2.5 text-primary-foreground stroke-[3]" />
                ) : null}
              </div>
              <span className="text-sm font-medium text-[#0a0a0a]">
                Exibir Telefone
              </span>
            </button>
          </div>
        </div>
    </div>
  );
});
