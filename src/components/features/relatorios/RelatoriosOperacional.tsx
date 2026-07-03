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
      <div className="grid grid-cols-2 gap-4">
        <KPICard
          label="Passageiros Ativos"
          icon={Users}
          variant={KPICardVariant.PRIMARY}
          value={dados.passageirosAtivosCount}
        />

        <KPICard
          label="Passageiros Inativos"
          icon={Users}
          variant={KPICardVariant.OUTLINE}
          value={dados.passageirosCount - dados.passageirosAtivosCount}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Escolas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden group">
          <div className="pt-6 px-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white border border-slate-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-100">
              <Users className="h-5 w-5 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-bold text-slate-800">
                Escolas
              </h3>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                {dados.escolasAtivasCount} {dados.escolasAtivasCount === 1 ? 'escola ativa' : 'escolas ativas'}
              </span>
            </div>
          </div>
          <div className="p-6 pt-6 space-y-6">
            {dados.escolas.map((escola, index) => (
              <div key={index} className="space-y-2.5">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col max-w-[65%]">
                    <span className="text-[12px] font-medium text-slate-600 truncate">
                      {escola.nome}
                    </span>
                    <span className="font-headline font-black text-[#1a3a5c] text-sm mt-0.5">
                      {escola.passageiros}{" "}
                      <span className="text-[10px] font-medium text-slate-400">
                        passageiros
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-headline font-black text-sm text-[#1a3a5c]">
                      {formatCurrency(escola.valor)}
                    </span>
                  </div>
                </div>
                <Progress
                  value={Math.max(2, (escola.passageiros / dados.passageirosCount) * 100)}
                  className="h-2 bg-slate-50 rounded-full"
                  indicatorClassName="bg-[#1a3a5c] rounded-full"
                />
              </div>
            ))}
            {dados.escolas.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-[13px]">
                Nenhuma escola vinculada
              </div>
            )}
          </div>
        </div>

        {/* Períodos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden group">
          <div className="pt-6 px-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white border border-slate-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-100">
              <Users className="h-5 w-5 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-bold text-slate-800">
                Períodos
              </h3>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                Distribuição por período
              </span>
            </div>
          </div>
          <div className="p-6 pt-6 space-y-6">
            {dados.periodos.map((periodo, index) => (
              <div key={index} className="space-y-2.5">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-slate-600">
                      {periodo.nome}
                    </span>
                    <span className="font-headline font-black text-[#1a3a5c] text-sm mt-0.5">
                      {periodo.passageiros}{" "}
                      <span className="text-[10px] font-medium text-slate-400">
                        passageiros
                      </span>
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-headline font-black text-sm text-[#1a3a5c]">
                      {formatCurrency(periodo.valor)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">
                      {Math.round(periodo.percentual)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={Math.max(2, periodo.percentual)}
                  className="h-2 bg-slate-50 rounded-full"
                  indicatorClassName="bg-[#1a3a5c] rounded-full"
                />
              </div>
            ))}
            {dados.periodos.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-[13px]">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>

        {/* Veículos */}
        {dados.veiculos.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden group">
            <div className="pt-6 px-6 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white border border-slate-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-100">
                <Users className="h-5 w-5 opacity-80 group-hover:opacity-100" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[13px] font-bold text-slate-800">
                  Veículos
                </h3>
                <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                  {dados.veiculosAtivosCount} {dados.veiculosAtivosCount === 1 ? 'veículo ativo' : 'veículos ativos'}
                </span>
              </div>
            </div>
            <div className="p-6 pt-6 space-y-6">
              {dados.veiculos.map((veiculo, index) => (
                <div key={index} className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium text-slate-600">
                        {formatarPlacaExibicao(veiculo.placa)}
                      </span>
                      <span className="font-headline font-black text-[#1a3a5c] text-sm mt-0.5">
                        {veiculo.passageiros}{" "}
                        <span className="text-[10px] font-medium text-slate-400">
                          passageiros
                        </span>
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="font-headline font-black text-sm text-[#1a3a5c]">
                        {formatCurrency(veiculo.valor)}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 mt-1">
                        {Math.round(veiculo.percentual)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.max(2, veiculo.percentual)}
                    className="h-2 bg-slate-50 rounded-full"
                    indicatorClassName="bg-[#1a3a5c] rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
