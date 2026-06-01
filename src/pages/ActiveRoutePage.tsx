import { useParams, useNavigate } from "react-router-dom";
import { useActiveRouteViewModel } from "@/hooks/ui/useActiveRouteViewModel";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertOctagon, Play, XCircle, MapPin, Phone, GraduationCap, 
  Check, Calendar, ArrowRight, UserMinus, AlertTriangle
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function ActiveRoutePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    execucao,
    paradaAtual,
    paradasPendentes,
    paradasConcluidas,
    isLoading,
    isError,
    handleStep,
    handleCancel,
    abrirNoWaze,
    abrirNoMaps
  } = useActiveRouteViewModel({ execucaoId: id || "" });

  const onCancel = () => {
    if (window.confirm("Deseja realmente cancelar a corrida de hoje? Todos os dados desta execução serão perdidos.")) {
      handleCancel(() => {
        navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
      });
    }
  };

  const onFinish = () => {
    navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[400px]">
        <AlertOctagon className="w-12 h-12 text-red-500" />
        <h3 className="text-base font-bold text-[#1a3a5c] font-headline">Erro ao Carregar Corrida</h3>
        <p className="text-xs text-slate-400 font-semibold max-w-[260px]">
          Não conseguimos obter as informações desta execução da rota ativa no momento.
        </p>
        <Button
          onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
          className="bg-[#1a3a5c] hover:bg-[#16314f] text-white rounded-xl font-bold text-xs"
        >
          Voltar para Rotas
        </Button>
      </div>
    );
  }

  const getTipoBadgeColor = (tipo?: string) => {
    return tipo === "ida"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      : "bg-sky-50 text-sky-700 border-sky-200/60";
  };

  const getStatusLabel = (status: string) => {
    const mapping: Record<string, string> = {
      pendente: "Pendente",
      a_caminho: "A caminho",
      embarcado: "Concluído",
      ausente: "Ausente"
    };
    return mapping[status] || status;
  };

  const isIda = execucao?.tipo === "ida";
  const actionLabel = isIda ? "Embarcou" : "Desembarcou";

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <h1 className="text-lg font-bold text-[#1a3a5c] font-headline">
              Corrida em Andamento
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-semibold leading-none">
            Rota: <strong className="text-slate-500">{execucao?.rota?.nome}</strong>
          </p>
        </div>

        {execucao?.status === "iniciada" ? (
          <Button
            variant="outline"
            className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs self-start sm:self-auto flex items-center gap-1.5 shadow-sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            <XCircle className="w-4 h-4" />
            Cancelar Corrida
          </Button>
        ) : (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs self-start sm:self-auto flex items-center gap-1.5 shadow-sm"
            onClick={onFinish}
          >
            <Check className="w-4 h-4" />
            Corrida Finalizada
          </Button>
        )}
      </div>

      {isLoading && !execucao ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="space-y-6">

          {/* 🌟 PARADA ATUAL ('a_caminho') - Card Gigante de Destaque */}
          {paradaAtual ? (
            <div className="space-y-3">
              <div className="px-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  PARADA ATUAL EM DESTAQUE
                </span>
                <Badge variant="outline" className={cn("text-[9px] font-bold uppercase rounded-lg border", getTipoBadgeColor(execucao?.tipo))}>
                  {execucao?.tipo === "ida" ? "Ida para Escola" : "Volta para Casa"}
                </Badge>
              </div>

              <Card className="p-6 border-emerald-500/30 rounded-[1.5rem] bg-gradient-to-br from-emerald-500/[0.04] via-white to-white shadow-md relative overflow-hidden space-y-6">
                
                {/* Nome do Aluno Destacado */}
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block leading-none">
                    {isIda ? "BUSCAR PASSAGEIRO" : "ENTREGAR PASSAGEIRO"}
                  </span>
                  <h2 className="text-2xl font-bold text-[#1a3a5c] font-headline leading-tight">
                    {paradaAtual.nome}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 pt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-300" /> {paradaAtual.nome_responsavel} ({paradaAtual.telefone_responsavel})
                  </p>
                </div>

                {/* Endereço Detalhado */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm relative z-10">
                  <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-[#1a3a5c] font-headline">Endereço de Parada</h4>
                    <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                      {paradaAtual.logradouro}, {paradaAtual.numero}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {paradaAtual.bairro} {paradaAtual.cidade ? `• ${paradaAtual.cidade}` : ""}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação de Navegação (Waze / Maps) */}
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  <Button
                    onClick={() => abrirNoWaze(paradaAtual.latitude, paradaAtual.longitude, paradaAtual.logradouro, paradaAtual.numero)}
                    className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold rounded-xl text-xs py-5 shadow-sm border-t border-white/20"
                  >
                    Navegar no Waze
                  </Button>
                  <Button
                    onClick={() => abrirNoMaps(paradaAtual.latitude, paradaAtual.longitude, paradaAtual.logradouro, paradaAtual.numero)}
                    className="bg-gradient-to-r from-[#1a3a5c] to-[#25466a] hover:from-[#16314f] hover:to-[#1d3d62] text-white font-bold rounded-xl text-xs py-5 shadow-sm border-t border-white/20"
                  >
                    Navegar no Maps
                  </Button>
                </div>

                {/* Ações de Conclusão da Parada */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 relative z-10">
                  <Button
                    onClick={() => handleStep(paradaAtual.passageiro_id, "embarcado")}
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs py-5 shadow-sm"
                  >
                    <Check className="w-4 h-4 mr-1.5 shrink-0" />
                    Confirmar {actionLabel}
                  </Button>
                  <Button
                    onClick={() => handleStep(paradaAtual.passageiro_id, "ausente")}
                    disabled={isLoading}
                    variant="outline"
                    className="border-red-100 hover:bg-red-50 text-red-500 hover:text-red-600 font-bold rounded-xl text-xs py-5 shadow-sm"
                  >
                    <UserMinus className="w-4 h-4 mr-1.5 shrink-0" />
                    Não vai / Pular
                  </Button>
                </div>
              </Card>
            </div>
          ) : execucao?.status === "concluida" ? (
            <div className="bg-slate-50 border border-slate-200/60 rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center space-y-3">
              <Check className="w-12 h-12 text-emerald-500 bg-emerald-50 p-2.5 rounded-full border border-emerald-100 animate-bounce" />
              <h3 className="text-base font-bold text-[#1a3a5c] font-headline">Corrida Concluída com Sucesso!</h3>
              <p className="text-xs text-slate-400 font-semibold max-w-[280px]">
                Todos os passageiros ativos do trajeto foram visitados e as famílias foram notificadas.
              </p>
              <Button
                onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
                className="bg-[#1a3a5c] hover:bg-[#16314f] text-white rounded-xl font-bold text-xs px-6"
              >
                Voltar para Rotas
              </Button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/60 rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center space-y-3">
              <AlertTriangle className="w-12 h-12 text-red-500 bg-red-50 p-2.5 rounded-full border border-red-100" />
              <h3 className="text-base font-bold text-[#1a3a5c] font-headline">Corrida Inativa</h3>
              <p className="text-xs text-slate-400 font-semibold max-w-[280px]">
                Esta corrida não está ativa ou foi encerrada.
              </p>
              <Button
                onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
                className="bg-[#1a3a5c] hover:bg-[#16314f] text-white rounded-xl font-bold text-xs px-6"
              >
                Voltar para Rotas
              </Button>
            </div>
          )}

          {/* 🧭 PRÓXIMAS PARADAS (Itinerário Restante) */}
          {paradasPendentes.length > 0 && (
            <div className="space-y-3">
              <div className="px-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  PRÓXIMAS PARADAS ({paradasPendentes.length})
                </span>
              </div>

              <div className="grid gap-3">
                {paradasPendentes.map((parada, index) => (
                  <div
                    key={parada.passageiro_id}
                    className="bg-white border border-slate-150/60 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-bold text-[#1a3a5c] border border-slate-100 shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-xs font-bold text-[#1a3a5c] font-headline truncate">
                          {parada.nome}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-semibold truncate">
                          {parada.bairro || "Sem bairro"} {parada.escola ? `• ${parada.escola.nome}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Botão rápido para Pular com Antecedência */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (window.confirm(`Deseja marcar a criança ${parada.nome} como ausente hoje?`)) {
                          handleStep(parada.passageiro_id, "ausente");
                        }
                      }}
                      className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold h-8 flex items-center gap-1 shrink-0"
                    >
                      <UserMinus className="w-3.5 h-3.5 shrink-0" />
                      Não vai
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📝 HISTÓRICO DO TRAJETO (Já Visitados) */}
          {paradasConcluidas.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 pt-6">
              <div className="px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  HISTÓRICO DA CORRIDA ({paradasConcluidas.length})
                </span>
              </div>

              <div className="grid gap-2">
                {paradasConcluidas.map((parada) => (
                  <div
                    key={parada.passageiro_id}
                    className="bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between gap-3 opacity-60"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-500 font-headline truncate">
                        {parada.nome}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-semibold">
                        Bairro: {parada.bairro || "Sem bairro"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {parada.status === "embarcado" ? (
                        <Badge className="bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-bold border border-emerald-100">
                          {actionLabel}
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-600 rounded-lg text-[9px] font-bold border border-red-100">
                          AUSENTE
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
