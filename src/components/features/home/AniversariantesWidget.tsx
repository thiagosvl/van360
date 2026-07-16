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

export function AniversariantesWidget() {
  const navigate = useNavigate();
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();
  const semanaAtualNoMes = Math.min(5, Math.ceil(diaAtual / 7));

  const currentMonthName = MESES[mesAtual - 1];
  const dataInicio = (semanaAtualNoMes - 1) * 7 + 1;
  const dataFim = Math.min(semanaAtualNoMes * 7, new Date(hoje.getFullYear(), mesAtual, 0).getDate());

  const { data, isLoading, isError } = useAniversariantes(mesAtual);

  const [agrupamento, setAgrupamento] = useState<"van" | "escola">("van");

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[17px] font-bold text-[#1a3a5c]">
            Aniversariantes
          </h2>
        </div>
        <Card className="w-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 rounded-[24px]">
          <CardContent className="space-y-4 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return null; // Falha silenciosa no dashboard para não quebrar a tela
  }

  const dadosDaSemana = data.semanas.find(s => s.semana === semanaAtualNoMes);
  const aniversariantesDaSemana = dadosDaSemana?.aniversariantes || [];

  // Agrupamento
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
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[17px] font-bold text-[#1a3a5c]">
          Aniversariantes
        </h2>
        <Button variant="ghost" size="sm" className="h-8 text-[13px] text-[#3b82f6] font-medium hover:bg-transparent p-0 hover:text-blue-600" onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS)}>
          Ver todos <ChevronRight className="w-4 h-4 ml-0.5" />
        </Button>
      </div>
      <Card className="w-full h-full flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 rounded-[24px] bg-white overflow-hidden">
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">

          {aniversariantesDaSemana.length > 0 ? (
            <div className="flex flex-col flex-1 min-h-0 space-y-4 px-4 pt-4 pb-2">
              <Tabs
                value={agrupamento}
                onValueChange={(v) => v && setAgrupamento(v as any)}
                className="w-full mt-2"
              >
                <div className="bg-slate-200/50 dark:bg-zinc-800/50 p-1 rounded-[1.25rem]">
                  <TabsList className="grid grid-cols-2 w-full h-[32px] bg-transparent p-0 gap-1 mt-0">
                    <TabsTrigger
                      value="van"
                      className="flex items-center gap-2 rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-[#16314f] dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 dark:data-[state=inactive]:text-slate-400 hover:text-[#1a3a5c] dark:hover:text-slate-300"
                    >
                      <Bus className="h-4 w-4" />
                      Por Van
                    </TabsTrigger>
                    <TabsTrigger
                      value="escola"
                      className="flex items-center gap-2 rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-[#16314f] dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 dark:data-[state=inactive]:text-slate-400 hover:text-[#1a3a5c] dark:hover:text-slate-300"
                    >
                      <School className="h-4 w-4" />
                      Por Escola
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>

              <ScrollArea className="flex-1">
                <div className="space-y-4 pb-2">
                  {Array.from(agrupado.entries()).map(([grupo, lista]) => (
                    <div key={grupo} className="space-y-2">
                      <h4 className="text-xs font-bold text-[#1a3a5c]/80 dark:text-blue-300/80 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        {agrupamento === 'van' ? <Bus className="h-3.5 w-3.5" /> : <School className="h-3.5 w-3.5" />}
                        {grupo}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
            <div className="flex flex-col items-center justify-center h-full text-center py-6 text-gray-400">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-3 mb-3">
                <Cake className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
              </div>
              <p className="text-xs sm:text-sm">Nenhum aniversariante nesta semana.</p>
            </div>
          )}

          {data.passageirosSemData > 0 && data.passageirosSemDataList && data.passageirosSemDataList.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-auto">
              <AccordionItem value="sem-data" className="border-none w-full">
                <AccordionTrigger className="py-3 px-5 bg-[#FFFCEF] hover:no-underline">
                  <div className="flex items-center gap-2 text-left w-full">
                    <AlertCircle className="h-[18px] w-[18px] shrink-0 text-orange-500" />
                    <span className="text-[13px] leading-tight font-medium text-orange-600/90">
                      <strong className="text-orange-700 font-bold">{data.passageirosSemData} passageiro{data.passageirosSemData === 1 ? '' : 's'}</strong> sem data de nascimento.
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0 bg-white">
                  <PassageirosSemDataList passageiros={data.passageirosSemDataList} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
