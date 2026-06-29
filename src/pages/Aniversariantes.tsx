import { useState, useEffect } from "react";
import { useLayout } from "@/hooks";
import { getShortWeekDayBR, monthNamesInBR as MESES } from "@/utils/dateUtils";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Cake, Bus, School, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAniversariantes } from "@/hooks/api/useAniversariantes";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateNavigation } from "@/components/common/DateNavigation";
import { formatShortName } from "@/utils/formatters/name";
import { PassageirosSemDataList } from "@/components/features/passageiro/PassageirosSemDataList";
import { PassageiroAniversarianteCard } from "@/components/features/passageiro/PassageiroAniversarianteCard";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";

const Aniversariantes = () => {
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [agrupamento, setAgrupamento] = useState<"van" | "escola">("van");

  const { setPageTitle } = useLayout();
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle("Aniversariantes");
  }, [setPageTitle]);

  const { data, isLoading, refetch } = useAniversariantes(mesAtual);

  const handleNavigation = (mes: number, ano: number) => {
    setMesAtual(mes);
  };

  const currentMonthName = MESES[mesAtual - 1];

  const hoje = new Date();
  const mesAtualReal = hoje.getMonth() + 1;
  const isCurrentMonth = mesAtual === mesAtualReal;
  const isPastMonth = mesAtual < mesAtualReal;
  
  const semanaAtualNoMes = isCurrentMonth 
    ? Math.min(5, Math.ceil(hoje.getDate() / 7)) 
    : isPastMonth ? 6 : 0;

  const semanasAtuaisEFuturas = data?.semanas.filter(s => s.semana >= semanaAtualNoMes) || [];
  const semanasPassadas = data?.semanas.filter(s => s.semana < semanaAtualNoMes).reverse() || [];

  const defaultOpenWeeks = isCurrentMonth
    ? data?.semanas
        .filter(s => s.semana === semanaAtualNoMes || s.semana === semanaAtualNoMes - 1)
        .map(s => `semana-${s.semana}`) || []
    : data?.semanas.map(s => `semana-${s.semana}`) || [];

  const renderSemana = (semanaInfo: any, isPast: boolean) => {
    const agrupado = new Map<string, typeof semanaInfo.aniversariantes>();
    semanaInfo.aniversariantes.forEach((p: any) => {
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
      <AccordionItem value={`semana-${semanaInfo.semana}`} key={semanaInfo.semana} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm px-0">
        <AccordionTrigger className="bg-slate-50 dark:bg-zinc-800/50 px-4 py-3 border-b border-slate-100 dark:border-zinc-800 hover:no-underline rounded-t-xl data-[state=closed]:rounded-b-xl data-[state=closed]:border-b-0">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-left">
            {(semanaInfo.semana - 1) * 7 + 1} a {Math.min(semanaInfo.semana * 7, new Date(new Date().getFullYear(), mesAtual, 0).getDate())} de {currentMonthName} <span className="font-normal text-xs text-slate-500 ml-1">(Semana {semanaInfo.semana})</span>
          </h3>
        </AccordionTrigger>

        <AccordionContent className="p-4 space-y-4">
          {Array.from(agrupado.entries()).map(([grupo, lista]) => (
            <div key={grupo} className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                {agrupamento === 'van' ? <Bus className="h-3.5 w-3.5" /> : <School className="h-3.5 w-3.5" />}
                {grupo}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <>
      <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
        <div className="space-y-6 pb-24">
          <DateNavigation
            mes={mesAtual}
            ano={new Date().getFullYear()} // Ano não é tão relevante pra essa API, mas required na nav
            onNavigate={handleNavigation}
          />

          <Tabs
            value={agrupamento}
            onValueChange={(v) => v && setAgrupamento(v as any)}
            className="w-full space-y-6"
          >
            <div className="flex flex-col gap-5 px-1">
              <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
                <TabsList className="grid grid-cols-2 w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0">
                  <TabsTrigger
                    value="van"
                    className="flex items-center gap-2 justify-center rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-[#16314f] dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 dark:data-[state=inactive]:text-slate-400 hover:text-[#1a3a5c] dark:hover:text-slate-300"
                  >
                    <Bus className="h-4 w-4" />
                    Por Van
                  </TabsTrigger>
                  <TabsTrigger
                    value="escola"
                    className="flex items-center gap-2 justify-center rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-[#16314f] dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 dark:data-[state=inactive]:text-slate-400 hover:text-[#1a3a5c] dark:hover:text-slate-300"
                  >
                    <School className="h-4 w-4" />
                    Por Escola
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </Tabs>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : data?.semanas && data.semanas.length > 0 ? (
            <div key={mesAtual} className="space-y-8">
              {semanasAtuaisEFuturas.length > 0 && (
                <Accordion type="multiple" defaultValue={defaultOpenWeeks} className="space-y-4">
                  {semanasAtuaisEFuturas.map((s) => renderSemana(s, false))}
                </Accordion>
              )}
              
              {semanasPassadas.length > 0 && (
                <Accordion type="multiple" defaultValue={defaultOpenWeeks} className="space-y-4">
                  {semanasAtuaisEFuturas.length > 0 && (
                    <div className="flex items-center gap-4 py-2 mt-4">
                      <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Semanas anteriores</span>
                      <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1"></div>
                    </div>
                  )}
                  {semanasPassadas.map((s) => renderSemana(s, true))}
                </Accordion>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 border-dashed">
              <div className="bg-slate-50 dark:bg-zinc-800 rounded-full p-4 mb-3">
                <Cake className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Sem aniversariantes</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Nenhum passageiro faz aniversário em {currentMonthName}.</p>
            </div>
          )}

          {data && data.passageirosSemData > 0 && data.passageirosSemDataList && data.passageirosSemDataList.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-4">
              <AccordionItem value="sem-data" className="border-none rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 px-4">
                <AccordionTrigger className="py-3 hover:no-underline text-orange-800 dark:text-orange-400">
                  <div className="flex items-center gap-2 text-left">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-sm">
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

        </div>
      </PullToRefreshWrapper>
    </>
  );
};

export default Aniversariantes;
