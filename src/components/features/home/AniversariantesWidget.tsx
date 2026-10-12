import { useAniversariantes } from "@/hooks/api/useAniversariantes";
import { monthNamesInBR as MESES } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Cake, ChevronRight, AlertCircle, Bus, School } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
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
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-[20px]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <Skeleton className="h-16 w-full rounded-[16px]" />
            <Skeleton className="h-16 w-full rounded-[16px]" />
          </div>
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

      {aniversariantesDaSemana.length > 0 ? (
        <Tabs
          value={agrupamento}
          onValueChange={(v) => v && setAgrupamento(v as "van" | "escola")}
          className="w-full space-y-3"
        >
          <AppTabNav
            activeTab={agrupamento}
            layout="fill"
            items={[
              {
                value: "van",
                label: "Por Van",
                icon: <Bus className="h-3.5 w-3.5" />,
              },
              {
                value: "escola",
                label: "Por Escola",
                icon: <School className="h-3.5 w-3.5" />,
              },
            ]}
          />

          <div className="space-y-4">
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
        </Tabs>
      ) : (
        <div className="w-full flex flex-col items-center justify-center text-center py-8 px-4 bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs text-[#737373]">
          <div className="w-12 h-12 rounded-[16px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center mb-2.5 text-[#737373]">
            <Cake className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="text-xs sm:text-sm font-medium">Nenhum aniversariante nesta semana.</p>
        </div>
      )}

      {data.passageirosSemData > 0 && data.passageirosSemDataList && data.passageirosSemDataList.length > 0 && (
        <div className="rounded-[20px] border border-amber-500/20 overflow-hidden bg-white shadow-xs">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sem-data" className="border-none w-full">
              <AccordionTrigger className="py-2.5 px-4 bg-amber-500/[0.08] hover:bg-amber-500/[0.12] hover:no-underline transition-colors text-left cursor-pointer">
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
        </div>
      )}
    </section>
  );
}
