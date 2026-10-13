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
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { Aniversariante, SemanaAniversario } from "@/types/passageiro";

const Aniversariantes = () => {
  const { can } = usePermissions();

  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [agrupamento, setAgrupamento] = useState<"van" | "escola">("van");

  const { setPageTitle } = useLayout();

  useEffect(() => {
    setPageTitle("Aniversariantes");
  }, [setPageTitle]);

  const { data, isLoading, refetch } = useAniversariantes(mesAtual);

  if (!can("aniversarios.visualizar")) {
    return <AccessRestrictedState moduleName="Aniversariantes do Mês" />;
  }

  const handleNavigation = (mes: number) => {
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

  const renderSemana = (semanaInfo: SemanaAniversario) => {
    const agrupado = new Map<string, Aniversariante[]>();
    semanaInfo.aniversariantes.forEach((p) => {
      let chave = "";
      if (agrupamento === "van") {
        chave = p.veiculo ? formatarPlacaExibicao(p.veiculo.placa) : "";
      } else {
        chave = p.escola ? p.escola.nome : "";
      }
      if (!agrupado.has(chave)) agrupado.set(chave, []);
      agrupado.get(chave)?.push(p);
    });

    const inicioDia = (semanaInfo.semana - 1) * 7 + 1;
    const fimDia = Math.min(semanaInfo.semana * 7, new Date(new Date().getFullYear(), mesAtual, 0).getDate());

    return (
      <AccordionItem
        value={`semana-${semanaInfo.semana}`}
        key={semanaInfo.semana}
        className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs px-0 overflow-hidden mb-4"
      >
        <AccordionTrigger className="bg-white px-5 py-3.5 sm:py-4 border-b border-[#e5e5e5] hover:bg-[#fafafa] transition-colors hover:no-underline">
          <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] text-left tracking-tight">
            {inicioDia} a {fimDia} de {currentMonthName}{" "}
            <span className="font-normal text-xs text-[#737373] ml-1.5">(Semana {semanaInfo.semana})</span>
          </h3>
        </AccordionTrigger>

        <AccordionContent className="p-4 sm:p-5 space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {lista.map((p) => (
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
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 pt-1 sm:pt-2">
          <DateNavigation
            mes={mesAtual}
            ano={new Date().getFullYear()}
            onNavigate={handleNavigation}
            showYear={false}
          />

          <Tabs
            value={agrupamento}
            onValueChange={(v) => v && setAgrupamento(v as "van" | "escola")}
            className="w-full"
          >
            <div className="px-1">
              <div className="bg-[#f5f5f5] p-1 rounded-[16px] border border-[#e5e5e5]">
                <TabsList className="grid grid-cols-2 w-full h-9 bg-transparent p-0 gap-1">
                  <TabsTrigger
                    value="van"
                    className="flex items-center justify-center gap-2 rounded-[12px] h-full font-medium text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-2xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] cursor-pointer"
                  >
                    <Bus className="h-3.5 w-3.5" />
                    <span>Por Van</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="escola"
                    className="flex items-center justify-center gap-2 rounded-[12px] h-full font-medium text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-2xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] cursor-pointer"
                  >
                    <School className="h-3.5 w-3.5" />
                    <span>Por Escola</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </Tabs>

          {isLoading ? (
            <div className="space-y-4 px-1">
              <Skeleton className="h-28 w-full rounded-[24px]" />
              <Skeleton className="h-28 w-full rounded-[24px]" />
            </div>
          ) : data?.semanas && data.semanas.length > 0 ? (
            <div key={mesAtual} className="space-y-6 px-1">
              {semanasAtuaisEFuturas.length > 0 && (
                <Accordion type="multiple" defaultValue={defaultOpenWeeks} className="space-y-4">
                  {semanasAtuaisEFuturas.map((s) => renderSemana(s))}
                </Accordion>
              )}

              {semanasPassadas.length > 0 && (
                <div className="space-y-4">
                  {semanasAtuaisEFuturas.length > 0 && (
                    <div className="flex items-center gap-4 py-2 mt-4">
                      <div className="h-px bg-[#e5e5e5] flex-1"></div>
                      <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.08em]">
                        Semanas anteriores
                      </span>
                      <div className="h-px bg-[#e5e5e5] flex-1"></div>
                    </div>
                  )}
                  <Accordion type="multiple" defaultValue={defaultOpenWeeks} className="space-y-4">
                    {semanasPassadas.map((s) => renderSemana(s))}
                  </Accordion>
                </div>
              )}
            </div>
          ) : (
            <div className="px-1">
              <UnifiedEmptyState
                icon={Cake}
                title="Sem aniversariantes"
                description={`Nenhum aluno faz aniversário em ${currentMonthName}.`}
              />
            </div>
          )}

          {data && data.passageirosSemData > 0 && data.passageirosSemDataList && data.passageirosSemDataList.length > 0 && (
            <div className="px-1">
              <div className="w-full mt-4 bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="sem-data" className="border-none w-full">
                    <AccordionTrigger className="py-3 px-5 bg-amber-500/[0.08] hover:bg-amber-500/[0.12] border-b border-amber-500/20 hover:no-underline transition-colors text-left cursor-pointer">
                      <div className="flex items-center gap-2 text-left w-full">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                        <span className="text-xs sm:text-[13px] leading-tight font-medium text-amber-900">
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
              </div>
            </div>
          )}
        </div>
      </PullToRefreshWrapper>
    </>
  );
};

export default Aniversariantes;
