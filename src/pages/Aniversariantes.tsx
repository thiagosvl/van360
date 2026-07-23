import { useState, useEffect } from "react";
import { useLayout } from "@/hooks";
import { monthNamesInBR as MESES } from "@/utils/dateUtils";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Cake, Bus, School, AlertCircle } from "lucide-react";
import { useAniversariantes } from "@/hooks/api/useAniversariantes";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateNavigation } from "@/components/common/DateNavigation";
import { PassageirosSemDataList } from "@/components/features/passageiro/PassageirosSemDataList";
import { PassageiroAniversarianteCard } from "@/components/features/passageiro/PassageiroAniversarianteCard";
import { UnifiedEmptyState } from "@/components/empty";
import { useNavigate } from "react-router-dom";

const Aniversariantes = () => {
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [agrupamento, setAgrupamento] = useState<"van" | "escola">("van");

  const { setPageTitle } = useLayout();

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

  const primeiraSemanaAtivaComDados = semanasAtuaisEFuturas.length > 0
    ? semanasAtuaisEFuturas[0].semana
    : null;

  const defaultOpenWeeks = isCurrentMonth
    ? Array.from(new Set([
      `semana-${semanaAtualNoMes}`,
      `semana-${semanaAtualNoMes - 1}`,
      primeiraSemanaAtivaComDados ? `semana-${primeiraSemanaAtivaComDados}` : ""
    ])).filter(Boolean)
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
      <AccordionItem value={`semana-${semanaInfo.semana}`} key={semanaInfo.semana} className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-100 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-0 overflow-hidden mb-4">
        <AccordionTrigger className="bg-white dark:bg-zinc-800/50 px-5 py-4 border-b border-slate-50 dark:border-zinc-800 hover:no-underline">
          <h3 className="text-[15px] font-bold text-[#1a3a5c] dark:text-slate-300 text-left">
            {(semanaInfo.semana - 1) * 7 + 1} a {Math.min(semanaInfo.semana * 7, new Date(new Date().getFullYear(), mesAtual, 0).getDate())} de {currentMonthName} <span className="font-medium text-[13px] text-slate-400 ml-1">(Semana {semanaInfo.semana})</span>
          </h3>
        </AccordionTrigger>

        <AccordionContent className="p-4 space-y-4">
          {Array.from(agrupado.entries()).map(([grupo, lista]) => (
            <div key={grupo} className="space-y-2">
              <h4 className={`text-xs font-bold text-[#1a3a5c]/80 dark:text-blue-300/80 flex items-center gap-1.5 ml-1 ${agrupamento === 'van' ? 'uppercase tracking-wider' : ''}`}>
                {agrupamento === 'van' ? <Bus className="h-3.5 w-3.5" /> : <School className="h-3.5 w-3.5" />}
                {grupo}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
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
            ano={new Date().getFullYear()}
            onNavigate={handleNavigation}
            showYear={false}
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
            <div className="px-1">
              <UnifiedEmptyState
                icon={Cake}
                title="Sem aniversariantes"
                description={`Nenhum passageiro faz aniversário em ${currentMonthName}.`}
              />
            </div>
          )}

          {data && data.passageirosSemData > 0 && data.passageirosSemDataList && data.passageirosSemDataList.length > 0 && (
            <div className="px-1">
              <Accordion type="single" collapsible className="w-full mt-4 bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
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
            </div>
          )}

        </div>
      </PullToRefreshWrapper>
    </>
  );
};

export default Aniversariantes;
