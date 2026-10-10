import { useAniversariantes } from "@/hooks/api/useAniversariantes";
import { getShortWeekDayBR, monthNamesInBR as MESES } from "@/utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cake, ChevronRight, AlertCircle, Bus, School } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { formatShortName } from "@/utils/formatters/name";
import { ROUTES } from "@/constants/routes";
import { PassageirosSemDataList } from "@/components/features/passageiro/PassageirosSemDataList";
import { PassageiroAniversarianteCard } from "@/components/features/passageiro/PassageiroAniversarianteCard";

import { usePermissions } from "@/hooks/business/usePermissions";

export function AniversariantesWidget() {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();
  const semanaAtualNoMes = Math.min(5, Math.ceil(diaAtual / 7));

  const currentMonthName = MESES[mesAtual - 1];
  const dataInicio = (semanaAtualNoMes - 1) * 7 + 1;
  const dataFim = Math.min(semanaAtualNoMes * 7, new Date(hoje.getFullYear(), mesAtual, 0).getDate());

  const { data, isLoading, isError } = useAniversariantes(mesAtual, { enabled: can("aniversarios.visualizar") });

  const [agrupamento, setAgrupamento] = useState<"van" | "escola">("van");

  if (isLoading) {
    return (
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-lg font-semibold text-[#0a0a0a] tracking-tight">
            Aniversariantes
          </h2>
        </div>
        <div className="w-full bg-white rounded-[24px] border border-[#e5e5e5] p-5 space-y-3 shadow-xs">
          <Skeleton className="h-10 w-full rounded-[14px]" />
          <Skeleton className="h-12 w-full rounded-[16px]" />
          <Skeleton className="h-12 w-full rounded-[16px]" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const dadosDaSemana = data.semanas.find(s => s.semana === semanaAtualNoMes);
  const aniversariantesDaSemana = dadosDaSemana?.aniversariantes || [];

  const agrupado = new Map<string, typeof aniversariantesDaSemana>();

  aniversariantesDaSemana.forEach(p => {
    let chave = "";
    if (agrupamento === "van") {
      chave = p.veiculo ? formatarPlacaExibicao(p.veiculo.placa) : "";
    } else {
      chave = p.escola ? p.escola.nome : "";
    }
    if (!agrupado.has(chave)) agrupado.set(chave, []);
    agrupado.get(chave)?.push(p);
  });

  return (
    <section className="px-1 space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-lg font-semibold text-[#0a0a0a] tracking-tight">
          Aniversariantes
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-[18px] text-xs font-medium text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] px-2.5 flex items-center gap-1 cursor-pointer"
          onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS)}
        >
          <span>Ver todos</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-full flex flex-col bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden p-0">
          {aniversariantesDaSemana.length > 0 ? (
            <div className="flex flex-col flex-1 min-h-0 space-y-4 p-4 sm:p-5">
              <Tabs
                value={agrupamento}
                onValueChange={(v) => v && setAgrupamento(v as "van" | "escola")}
                className="w-full"
              >
                <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5]">
                  <TabsList className="grid grid-cols-2 w-full min-h-[38px] bg-transparent p-0 gap-1">
                    <TabsTrigger
                      value="van"
                      className="flex items-center justify-center gap-2 rounded-[18px] h-full font-medium text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer"
                    >
                      <Bus className="h-3.5 w-3.5" />
                      <span>Por Van</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="escola"
                      className="flex items-center justify-center gap-2 rounded-[18px] h-full font-medium text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer"
                    >
                      <School className="h-3.5 w-3.5" />
                      <span>Por Escola</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>

              <ScrollArea className="flex-1">
                <div className="space-y-4 pb-1">
                  {Array.from(agrupado.entries()).map(([grupo, lista]) => (
                    <div key={grupo} className="space-y-2">
                      <h4 className="text-xs font-semibold text-[#0a0a0a] flex items-center gap-1.5 ml-1 uppercase tracking-[0.05em]">
                        {agrupamento === "van" ? (
                          <Bus className="h-3.5 w-3.5 text-[#737373]" />
                        ) : (
                          <School className="h-3.5 w-3.5 text-[#737373]" />
                        )}
                        <span>{grupo || (agrupamento === "van" ? "Sem van vinculada" : "Sem escola vinculada")}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        {lista.map(p => (
                          <PassageiroAniversarianteCard
                            key={p.id}
                            passageiro={p}
                            agrupamento={agrupamento}
                            mesAtual={mesAtual}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 px-4 text-[#737373]">
              <div className="w-12 h-12 rounded-[16px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center mb-2.5 text-[#737373]">
                <Cake className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="text-xs sm:text-sm font-medium">Nenhum aniversariante nesta semana.</p>
            </div>
          )}

          {data.passageirosSemData > 0 && data.passageirosSemDataList && data.passageirosSemDataList.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-auto">
              <AccordionItem value="sem-data" className="border-none w-full">
                <AccordionTrigger className="py-2.5 px-4 bg-amber-500/[0.08] hover:bg-amber-500/[0.12] border-t border-amber-500/20 hover:no-underline transition-colors text-left cursor-pointer">
                  <div className="flex items-center gap-2 text-left w-full">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span className="text-xs leading-tight font-medium text-amber-900">
                      <strong className="font-semibold text-amber-950">
                        {data.passageirosSemData} {data.passageirosSemData === 1 ? "aluno" : "alunos"}
                      </strong>{" "}
                      sem data de nascimento.
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0 bg-white">
                  <PassageirosSemDataList passageiros={data.passageirosSemDataList} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
}
