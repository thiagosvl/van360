import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfiguracoes } from "@/hooks";
import { Check, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const PreferenciasTab = memo(function PreferenciasTab() {
  const { configuracoes, isLoading, updateConfiguracoes, isUpdating } = useConfiguracoes();

  const formatoAtual = configuracoes?.formato_nome_responsavel || "primeiro_nome";
  const exibirTelefoneAtual = configuracoes?.exibir_telefone_lista_alunos ?? false;

  const handleSelectFormato = async (formato: "primeiro_nome" | "completo") => {
    if (formato === formatoAtual || isUpdating) return;
    try {
      await updateConfiguracoes({ formato_nome_responsavel: formato });
      toast.success("Preferência de exibição atualizada com sucesso!");
    } catch { }
  };

  const handleToggleTelefone = async (novoValor: boolean) => {
    if (novoValor === exibirTelefoneAtual || isUpdating) return;
    try {
      await updateConfiguracoes({ exibir_telefone_lista_alunos: novoValor });
      toast.success(
        novoValor
          ? "Telefone ativado na lista de alunos!"
          : "Telefone ocultado da lista de alunos!"
      );
    } catch { }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a3a5c]">
              Preferências do Aplicativo
            </h2>
            <p className="text-xs text-slate-500">
              Personalize a forma como as informações são apresentadas no seu aplicativo.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Exibição do Nome do Responsável
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha como o responsável deve aparecer abaixo do nome do aluno nas telas do app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <button
              type="button"
              onClick={() => handleSelectFormato("primeiro_nome")}
              disabled={isUpdating}
              className={cn(
                "p-4 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between gap-3",
                formatoAtual === "primeiro_nome"
                  ? "border-[#1a3a5c] bg-slate-50/60 ring-2 ring-[#1a3a5c]/10"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                      formatoAtual === "primeiro_nome"
                        ? "border-[#1a3a5c] bg-[#1a3a5c]"
                        : "border-slate-300"
                    )}
                  >
                    {formatoAtual === "primeiro_nome" && (
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Apenas Primeiro Nome
                  </span>
                </div>
              </div>

              <div className="mt-1 p-2.5 rounded-lg bg-slate-100/70 border border-slate-200/50 space-y-0.5">
                <p className="text-[11px] font-bold text-[#1a3a5c]">
                  Joãozinho Silva
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  Maria
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectFormato("completo")}
              disabled={isUpdating}
              className={cn(
                "p-4 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between gap-3",
                formatoAtual === "completo"
                  ? "border-[#1a3a5c] bg-slate-50/60 ring-2 ring-[#1a3a5c]/10"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                      formatoAtual === "completo"
                        ? "border-[#1a3a5c] bg-[#1a3a5c]"
                        : "border-slate-300"
                    )}
                  >
                    {formatoAtual === "completo" && (
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Exibir Nome Completo
                  </span>
                </div>
              </div>

              <div className="mt-1 p-2.5 rounded-lg bg-slate-100/70 border border-slate-200/50 space-y-0.5">
                <p className="text-[11px] font-bold text-[#1a3a5c]">
                  Joãozinho Silva
                </p>
                <p className="text-[10px] text-gray-500 font-medium truncate">
                  Maria Oliveira da Silva
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Telefone do Responsável na Lista de Alunos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Válido exclusivamente para a tela de Alunos. Escolha se o telefone de contato deve ser exibido na listagem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <button
              type="button"
              onClick={() => handleToggleTelefone(false)}
              disabled={isUpdating}
              className={cn(
                "p-4 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between gap-3",
                !exibirTelefoneAtual
                  ? "border-[#1a3a5c] bg-slate-50/60 ring-2 ring-[#1a3a5c]/10"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                      !exibirTelefoneAtual
                        ? "border-[#1a3a5c] bg-[#1a3a5c]"
                        : "border-slate-300"
                    )}
                  >
                    {!exibirTelefoneAtual && (
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Não Exibir Telefone na Lista de Alunos
                  </span>
                </div>
              </div>

              <div className="mt-1 p-2.5 rounded-lg bg-slate-100/70 border border-slate-200/50 space-y-0.5">
                <p className="text-[11px] font-bold text-[#1a3a5c]">
                  Joãozinho Silva
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  {formatoAtual === "completo" ? "Maria Oliveira da Silva" : "Maria"}
                </p>
                <p className="text-[10px] text-gray-400 font-medium opacity-60">
                  Colégio Teste Van360
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleToggleTelefone(true)}
              disabled={isUpdating}
              className={cn(
                "p-4 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between gap-3",
                exibirTelefoneAtual
                  ? "border-[#1a3a5c] bg-slate-50/60 ring-2 ring-[#1a3a5c]/10"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                      exibirTelefoneAtual
                        ? "border-[#1a3a5c] bg-[#1a3a5c]"
                        : "border-slate-300"
                    )}
                  >
                    {exibirTelefoneAtual && (
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Exibir Telefone na Lista de Alunos
                  </span>
                </div>
              </div>

              <div className="mt-1 p-2.5 rounded-lg bg-slate-100/70 border border-slate-200/50 space-y-0.5">
                <p className="text-[11px] font-bold text-[#1a3a5c]">
                  Joãozinho Silva
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  {formatoAtual === "completo" ? "Maria Oliveira da Silva" : "Maria"}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  (11) 98765-4321
                </p>
                <p className="text-[10px] text-gray-400 font-medium opacity-60">
                  Colégio Teste Van360
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
