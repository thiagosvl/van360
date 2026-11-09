import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Check, UserMinus, ChevronDown } from "lucide-react";
import { RouteStopStatus, ExecucaoParada } from "@/types/route";
import { filtrarAlunosAtivosEscola, isParadaAlunoAusente } from "@/hooks/business/useRouteRules";
import { useAppPreferences } from "@/hooks";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_EMBARQUES = 7;

interface ActiveRouteSchoolTabsProps {
  alunosParaEmbarcar: ExecucaoParada[];
  alunosParaDesembarcar: ExecucaoParada[];
  isLoading: boolean;
  onConfirmFalta: (id: string, nome: string) => void;
}

export function ActiveRouteSchoolTabs({
  alunosParaEmbarcar,
  alunosParaDesembarcar,
  isLoading,
  onConfirmFalta,
}: ActiveRouteSchoolTabsProps) {
  const { formatAlunoNome } = useAppPreferences();
  const [isEmbarquesExpanded, setIsEmbarquesExpanded] = useState(false);

  const alunosParaEmbarcarAtivos = useMemo(
    () => filtrarAlunosAtivosEscola(alunosParaEmbarcar),
    [alunosParaEmbarcar]
  );

  const alunosParaDesembarcarAtivos = useMemo(
    () => filtrarAlunosAtivosEscola(alunosParaDesembarcar),
    [alunosParaDesembarcar]
  );

  const hasManyEmbarques = alunosParaEmbarcar.length > MAX_VISIBLE_EMBARQUES;
  const visibleEmbarques =
    hasManyEmbarques && !isEmbarquesExpanded
      ? alunosParaEmbarcar.slice(0, MAX_VISIBLE_EMBARQUES)
      : alunosParaEmbarcar;

  return (
    <Tabs
      defaultValue={alunosParaEmbarcar.length > 0 ? "embarques" : "desembarques"}
      className="w-full mt-3"
    >
      <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5]">
        <TabsList className="grid grid-cols-2 w-full bg-transparent p-0 min-h-[38px] border-0">
          <TabsTrigger
            value="embarques"
            className="rounded-[18px] text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 py-1.5 px-3 cursor-pointer"
          >
            Embarques ({alunosParaEmbarcarAtivos.length})
          </TabsTrigger>
          <TabsTrigger
            value="desembarques"
            className="rounded-[18px] text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 py-1.5 px-3 cursor-pointer"
          >
            Desembarques ({alunosParaDesembarcarAtivos.length})
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="embarques" className="mt-2.5 space-y-1.5 focus-visible:outline-none">
        {alunosParaEmbarcar.length === 0 ? (
          <p className="text-xs text-[#737373] font-normal py-3 text-center bg-[#fafafa] rounded-[14px] border border-[#e5e5e5]">
            Nenhum embarque nesta parada
          </p>
        ) : (
          <>
            {visibleEmbarques.map((aluno) => {
              const isPendente = aluno.status === RouteStopStatus.PENDENTE;
              const isABordo = aluno.status === RouteStopStatus.EMBARCADO;
              const nomeAluno = aluno.passageiro?.nome || aluno.nome || "";

              return (
                <div
                  key={aluno.id}
                  className="flex items-center justify-between bg-[#fafafa] p-2.5 rounded-[14px] border border-[#e5e5e5]"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <User className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                    <span className="text-xs font-medium text-[#0a0a0a]">
                      {formatAlunoNome(nomeAluno)}
                    </span>
                  </div>
                  {isPendente ? (
                    <Button
                      type="button"
                      onClick={() => onConfirmFalta(aluno.id, nomeAluno)}
                      disabled={isLoading}
                      className="h-7.5 px-2.5 bg-white border border-[#e7000b]/20 hover:bg-[#e7000b]/10 text-[#e7000b] font-medium text-xs rounded-[12px] shadow-none cursor-pointer flex items-center gap-1 shrink-0 transition-all active:scale-95"
                    >
                      <UserMinus className="w-3 h-3 text-[#e7000b]" />
                      <span>AUSENTE</span>
                    </Button>
                  ) : isABordo ? (
                    <span
                      className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs"
                      title="Embarcado"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] border border-red-200/60 bg-red-50 text-[#e7000b] shrink-0 leading-none">
                      Ausente
                    </span>
                  )}
                </div>
              );
            })}

            {hasManyEmbarques && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEmbarquesExpanded((prev) => !prev)}
                className="w-full h-8 text-xs font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-[14px] flex items-center justify-center gap-1.5 transition-all mt-1 cursor-pointer"
              >
                <span>
                  {isEmbarquesExpanded
                    ? "Ocultar embarques"
                    : `Exibir mais ${alunosParaEmbarcar.length - MAX_VISIBLE_EMBARQUES} embarque${alunosParaEmbarcar.length - MAX_VISIBLE_EMBARQUES > 1 ? "s" : ""}`}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isEmbarquesExpanded && "rotate-180"
                  )}
                />
              </Button>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="desembarques" className="mt-2.5 space-y-1.5 focus-visible:outline-none">
        {alunosParaDesembarcar.length === 0 ? (
          <p className="text-xs text-[#737373] font-normal py-3 text-center bg-[#fafafa] rounded-[14px] border border-[#e5e5e5]">
            Nenhum desembarque nesta parada
          </p>
        ) : (
          alunosParaDesembarcar.map((aluno) => {
            const isAusente = isParadaAlunoAusente(aluno);
            const isABordo = aluno.status === RouteStopStatus.EMBARCADO && !aluno.visitado_em;
            const isConcluido = aluno.status === RouteStopStatus.EMBARCADO && !!aluno.visitado_em;
            const nomeAluno = aluno.passageiro?.nome || aluno.nome || "";

            return (
              <div
                key={aluno.id}
                className="flex items-center justify-between bg-[#fafafa] p-2.5 rounded-[14px] border border-[#e5e5e5]"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <User className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <span className="text-xs font-medium text-[#0a0a0a]">
                    {formatAlunoNome(nomeAluno)}
                  </span>
                </div>
                {isConcluido ? (
                  <span
                    className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs"
                    title="Desembarcado"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : isABordo ? (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] border border-emerald-200/60 bg-emerald-50 text-emerald-700 shrink-0 leading-none">
                    Embarcado
                  </span>
                ) : isAusente ? (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] border border-red-200/60 bg-red-50 text-[#e7000b] shrink-0 leading-none">
                    Ausente
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </TabsContent>
    </Tabs>
  );
}
