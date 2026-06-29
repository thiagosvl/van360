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
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
          Aniversariantes da semana
        </h2>
        <Card className="w-full">
          <CardContent className="space-y-4">
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
    <div className="space-y-4">
      <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
        Aniversariantes da Semana
      </h2>
      <Card className="w-full h-full flex flex-col shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 px-3 pb-1 pt-3">
          <p className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase px-1">
            {dataInicio} a {dataFim} de {currentMonthName}
          </p>
          <Button variant="ghost" size="sm" className="h-8 text-[11px] sm:text-xs text-primary font-semibold px-2" onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ANIVERSARIANTES)}>
            Ver todos do mês <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden px-3 pb-3">

          {aniversariantesDaSemana.length > 0 ? (
            <div className="flex flex-col h-full space-y-4">
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
                      <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                        {agrupamento === 'van' ? <Bus className="h-3.5 w-3.5" /> : <School className="h-3.5 w-3.5" />}
                        {grupo}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            <div className="flex flex-col items-center justify-center h-full text-center py-6 text-muted-foreground">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-3 mb-3">
                <Cake className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
              </div>
              <p className="text-sm">Nenhum aniversariante nesta semana.</p>
            </div>
          )}

          {data.passageirosSemData > 0 && data.passageirosSemDataList && data.passageirosSemDataList.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-4">
              <AccordionItem value="sem-data" className="border-none rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 px-3">
                <AccordionTrigger className="py-2.5 hover:no-underline text-orange-800 dark:text-orange-400">
                  <div className="flex items-center gap-2 text-left">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs leading-tight">
                      <strong>{data.passageirosSemData} {data.passageirosSemData === 1 ? 'passageiro' : 'passageiros'}</strong> sem data de nascimento.
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-1">
                  <div className="mt-1">
                    <PassageirosSemDataList passageiros={data.passageirosSemDataList} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
