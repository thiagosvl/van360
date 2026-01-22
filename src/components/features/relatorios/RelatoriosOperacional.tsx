import { LimitHealthBar } from "@/components/common/LimitHealthBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    FEATURE_RELATORIOS,
    PLANO_ESSENCIAL,
    PLANO_PROFISSIONAL,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { Users } from "lucide-react";

interface RelatoriosOperacionalProps {
  dados: {
    passageirosCount: number;
    passageirosAtivosCount: number;
    escolas: {
      nome: string;
      valor: number;
      passageiros: number;
    }[];
    veiculos: {
      placa: string;
      passageiros: number;
      percentual: number;
    }[];
    periodos: {
      nome: string;
      passageiros: number;
      valor: number;
      percentual: number;
    }[];
  };
  automacao: {
    envios: number;
    limite: number;
  };
  hasAccess: boolean;
  limits: {
    passageiros: number | null;
  };
  IsProfissionalPlan: boolean;
}

export const RelatoriosOperacional = ({
  dados,
  automacao,
  hasAccess,
  IsProfissionalPlan,
}: RelatoriosOperacionalProps) => {
  const { openPlanUpgradeDialog } = useLayout();

  return (
    <div className="space-y-4 mt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden">
            <CardHeader className="pb-0 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Passageiros Ativos
              </CardTitle>
              <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
                {dados.passageirosAtivosCount}
              </h3>
            </CardContent>
          </Card>

        {/* Automação (Cobranças Automáticas) */}
        {IsProfissionalPlan ? (
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden relative p-0">
            <CardContent className="p-0 h-full">
              <LimitHealthBar
                current={automacao.envios}
                max={automacao.limite}
                label="Passageiros no Automático"
                description={
                  automacao.envios >= automacao.limite
                    ? "Limite atingido."
                    : `${automacao.limite - automacao.envios} ${
                        automacao.limite - automacao.envios === 1
                          ? "vaga restante"
                          : "vagas restantes"
                      }.`
                }
                className="h-full mb-0 border-0 shadow-none bg-white"
                onIncreaseLimit={() =>
                  openPlanUpgradeDialog({
                    feature: "automacao",
                    defaultTab: PLANO_PROFISSIONAL,
                    targetPassengerCount: dados.passageirosAtivosCount,
                  })
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">Automatize sua rotina</p>
                </div>
                <p className="text-xs text-white/80">
                  Deixe a cobrança com a gente! Recebimento automático e baixa
                  instantânea.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4 px-5 rounded-full border-white/30 bg-white/20 text-white hover:bg-white/30 font-semibold"
                  onClick={() =>
                    openPlanUpgradeDialog({
                      feature: FEATURE_RELATORIOS,
                      defaultTab: PLANO_ESSENCIAL,
                    })
                  }
                >
                  Quero Automação Total →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Escolas */}
        <Card className="border-none shadow-sm rounded-2xl bg-white relative">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Por Escola
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-4 space-y-4">
            {dados.escolas.map((escola, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-medium text-gray-700 truncate max-w-[140px] md:max-w-[180px]">
                    {escola.nome}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(escola.valor)}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {escola.passageiros}{" "}
                      <span className="text-xs text-gray-400 mt-1">
                        {escola.passageiros === 1
                          ? "passageiro"
                          : "passageiros"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{
                      width: `${
                        (escola.passageiros / dados.passageirosCount) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {dados.escolas.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-4">
                Nenhuma escola vinculada.
              </p>
            )}

          </CardContent>
        </Card>

        {/* Períodos */}
        <Card className="border-none shadow-sm rounded-2xl bg-white relative">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Por Período
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-4 space-y-4">
            {dados.periodos.map((periodo, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-medium text-gray-700">
                    {periodo.nome}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(periodo.valor)}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {periodo.passageiros}{" "}
                      <span className="text-xs text-gray-400 mt-1">
                        {periodo.passageiros === 1
                          ? "passageiro"
                          : "passageiros"}
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={periodo.percentual}
                  className="h-1.5 bg-gray-100 rounded-full"
                  indicatorClassName="bg-amber-500 rounded-full"
                />
              </div>
            ))}
            {dados.periodos.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-4">
                Nenhum dado por período.
              </p>
            )}

          </CardContent>
        </Card>

        {/* Veículos */}
        <Card className="border-none shadow-sm rounded-2xl bg-white relative">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Por Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-4 space-y-4">
            {dados.veiculos.map((veiculo, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-medium text-gray-700">
                    {veiculo.placa}
                  </span>
                  <div className="font-semibold text-gray-900">
                    {veiculo.passageiros}{" "}
                    <span className="text-xs text-gray-400 mt-1">
                      {veiculo.passageiros === 1 ? "passageiro" : "passageiros"}
                    </span>
                  </div>
                </div>
                <Progress
                  value={veiculo.percentual}
                  className="h-1.5 bg-gray-100 rounded-full"
                  indicatorClassName="bg-blue-500 rounded-full"
                />
              </div>
            ))}
            {dados.veiculos.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-4">
                Nenhum veículo cadastrado.
              </p>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};
