import { KPICard } from "@/components/common/KPICard";
import { Progress } from "@/components/ui/progress";
import { KPICardVariant } from "@/types/enums";
import { formatCurrency } from "@/utils/formatters";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Users } from "lucide-react";

interface RelatoriosOperacionalProps {
  dados: {
    passageirosCount: number;
    passageirosAtivosCount: number;
    escolasAtivasCount: number;
    veiculosAtivosCount: number;
    escolas: {
      nome: string;
      valor: number;
      passageiros: number;
    }[];
    veiculos: {
      placa: string;
      passageiros: number;
      percentual: number;
      valor: number;
    }[];
    periodos: {
      nome: string;
      passageiros: number;
      valor: number;
      percentual: number;
    }[];
  };
}

export const RelatoriosOperacional = ({
  dados,
}: RelatoriosOperacionalProps) => {
  return (
    <div className="space-y-4 px-1">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <KPICard
          label="Alunos Ativos"
          icon={Users}
          variant={KPICardVariant.PRIMARY}
          value={dados.passageirosAtivosCount}
        />

        <KPICard
          label="Alunos Inativos"
          icon={Users}
          variant={KPICardVariant.OUTLINE}
          value={dados.passageirosCount - dados.passageirosAtivosCount}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] shrink-0">
              <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                Escolas
              </h3>
              <span className="text-[11px] font-medium text-[#737373] mt-0.5">
                {dados.escolasAtivasCount} {dados.escolasAtivasCount === 1 ? 'escola ativa' : 'escolas ativas'}
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-4 sm:space-y-5">
            {dados.escolas.map((escola, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col max-w-[65%]">
                    <span className="text-xs font-medium text-[#737373] truncate">
                      {escola.nome}
                    </span>
                    <span className="font-semibold text-sm text-[#0a0a0a] tracking-tight mt-0.5">
                      {escola.passageiros}{" "}
                      <span className="text-[10px] font-normal text-[#737373]">
                        {escola.passageiros === 1 ? "aluno" : "alunos"}
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-sm text-[#0a0a0a] tracking-tight">
                      {formatCurrency(escola.valor)}
                    </span>
                  </div>
                </div>
                <Progress
                  value={Math.max(2, (escola.passageiros / dados.passageirosCount) * 100)}
                  className="h-2 bg-[#f5f5f5] rounded-full"
                  indicatorClassName="bg-[#0a0a0a] rounded-full"
                />
              </div>
            ))}
            {dados.escolas.length === 0 && (
              <div className="text-center py-6 text-[#737373] text-xs font-medium">
                Nenhuma escola vinculada.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] shrink-0">
              <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                Períodos
              </h3>
              <span className="text-[11px] font-medium text-[#737373] mt-0.5">
                Distribuição por período
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-4 sm:space-y-5">
            {dados.periodos.map((periodo, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#737373]">
                      {periodo.nome}
                    </span>
                    <span className="font-semibold text-sm text-[#0a0a0a] tracking-tight mt-0.5">
                      {periodo.passageiros}{" "}
                      <span className="text-[10px] font-normal text-[#737373]">
                        {periodo.passageiros === 1 ? "aluno" : "alunos"}
                      </span>
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-semibold text-sm text-[#0a0a0a] tracking-tight">
                      {formatCurrency(periodo.valor)}
                    </span>
                    <span className="text-[11px] font-medium text-[#737373] mt-0.5">
                      {Math.round(periodo.percentual)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={Math.max(2, periodo.percentual)}
                  className="h-2 bg-[#f5f5f5] rounded-full"
                  indicatorClassName="bg-[#0a0a0a] rounded-full"
                />
              </div>
            ))}
            {dados.periodos.length === 0 && (
              <div className="text-center py-6 text-[#737373] text-xs font-medium">
                Nenhum dado disponível.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] shrink-0">
              <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                Veículos
              </h3>
              <span className="text-[11px] font-medium text-[#737373] mt-0.5">
                {dados.veiculosAtivosCount} {dados.veiculosAtivosCount === 1 ? 'veículo ativo' : 'veículos ativos'}
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-4 sm:space-y-5">
            {dados.veiculos.map((veiculo, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#737373]">
                      {formatarPlacaExibicao(veiculo.placa)}
                    </span>
                    <span className="font-semibold text-sm text-[#0a0a0a] tracking-tight mt-0.5">
                      {veiculo.passageiros}{" "}
                      <span className="text-[10px] font-normal text-[#737373]">
                        {veiculo.passageiros === 1 ? "aluno" : "alunos"}
                      </span>
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-semibold text-sm text-[#0a0a0a] tracking-tight">
                      {formatCurrency(veiculo.valor)}
                    </span>
                    <span className="text-[11px] font-medium text-[#737373] mt-0.5">
                      {Math.round(veiculo.percentual)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={Math.max(2, veiculo.percentual)}
                  className="h-2 bg-[#f5f5f5] rounded-full"
                  indicatorClassName="bg-[#0a0a0a] rounded-full"
                />
              </div>
            ))}
            {dados.veiculos.length === 0 && (
              <div className="text-center py-6 text-[#737373] text-xs font-medium">
                Nenhum veículo vinculado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
