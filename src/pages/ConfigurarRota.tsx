import { useParams, useNavigate } from "react-router-dom";
import { useRouteSetupViewModel } from "@/hooks/ui/useRouteSetupViewModel";
import { useRouteDetail } from "@/hooks/api/useRoutes";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, Save, Plus, X, ArrowUp, ArrowDown, Move, 
  MapPin, GraduationCap, Compass, AlertCircle
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function ConfigurarRota() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: userSummary } = useUsuarioResumo();
  const usuarioId = userSummary?.id || "";

  const { data: routeToEdit, refetch } = useRouteDetail(id || "");

  const {
    nome,
    setNome,
    periodo,
    setPeriodo,
    tipo,
    setTipo,
    selectedPassengers,
    availablePassengers,
    isLoading,
    togglePassengerSelection,
    moverParaCima,
    moverParaBaixo,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleSave
  } = useRouteSetupViewModel({
    usuarioId,
    routeToEdit
  });

  const handleRefresh = async () => {
    if (id) await refetch();
  };

  const onSave = () => {
    handleSave(() => {
      navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
    });
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-xl text-[#1a3a5c] hover:bg-slate-100"
            onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-[#1a3a5c] font-headline">
              {id ? "Editar Rota" : "Configurar Rota"}
            </h1>
            <p className="text-xs text-slate-400 font-semibold leading-none mt-1">
              {id ? "Ajuste o sequenciamento do trajeto" : "Crie e organize um novo trajeto"}
            </p>
          </div>
        </div>

        {/* Formulário de Configuração */}
        <Card className="p-5 border-slate-150/60 shadow-sm rounded-[1.25rem] bg-white/60 backdrop-blur-md space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome-rota" className="text-xs font-bold text-[#1a3a5c]">Nome da Rota</Label>
              <Input
                id="nome-rota"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ida - Manhã Adventista"
                className="rounded-xl border-slate-200/80 focus-visible:ring-[#1a3a5c]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#1a3a5c]">Período</Label>
              <div className="bg-slate-100/80 p-1 rounded-xl">
                <Tabs value={periodo} onValueChange={setPeriodo} className="w-full">
                  <TabsList className="grid grid-cols-4 w-full bg-transparent p-0 h-[36px] gap-0.5">
                    <TabsTrigger value="manha" className="rounded-lg h-full text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#16314f]">Manhã</TabsTrigger>
                    <TabsTrigger value="tarde" className="rounded-lg h-full text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#16314f]">Tarde</TabsTrigger>
                    <TabsTrigger value="noite" className="rounded-lg h-full text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#16314f]">Noite</TabsTrigger>
                    <TabsTrigger value="integral" className="rounded-lg h-full text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#16314f]">Integral</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#1a3a5c]">Tipo de Modalidade</Label>
              <div className="bg-slate-100/80 p-1 rounded-xl">
                <Tabs value={tipo} onValueChange={(val) => setTipo(val as "ida" | "volta")} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full bg-transparent p-0 h-[36px] gap-0.5">
                    <TabsTrigger value="ida" className="rounded-lg h-full text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#16314f] flex items-center justify-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Ida (Escola)
                    </TabsTrigger>
                    <TabsTrigger value="volta" className="rounded-lg h-full text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#16314f] flex items-center justify-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Volta (Residência)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </Card>

        {/* Organização da Rota (Duas Colunas) */}
        <div className="grid gap-6 md:grid-cols-5 items-start">
          
          {/* Coluna da Esquerda: Itinerário Ordenado */}
          <div className="md:col-span-3 space-y-4">
            <div className="px-1 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1a3a5c] font-headline flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" /> Itinerário do Trajeto
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {selectedPassengers.length} PARADAS
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Ponto de Origem para a Volta (Escola) */}
              {tipo === "volta" && (
                <div className="bg-slate-50 border border-slate-200/50 border-dashed p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-800 uppercase">
                    Ini
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-500 font-headline truncate">
                      Ponto de Partida Escolar
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3 h-3 text-slate-300" /> Os passageiros embarcam na escola
                    </p>
                  </div>
                </div>
              )}

              {selectedPassengers.length === 0 ? (
                <div className="bg-slate-100/50 border border-dashed border-slate-200/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-bold text-slate-400">Nenhum passageiro selecionado</p>
                  <p className="text-[10px] text-slate-400/80 font-semibold max-w-[240px]">
                    Toque no "+" nos cards da lista lateral para adicionar alunos e organizar a fila.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPassengers.map((passenger, index) => (
                    <div
                      key={passenger.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="group bg-white border border-slate-150/60 p-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all cursor-grab active:cursor-grabbing"
                    >
                      {/* Pegador (Drag Icon) e Número */}
                      <div className="flex items-center gap-2 text-slate-300 group-hover:text-slate-400 transition-colors">
                        <Move className="w-3.5 h-3.5 shrink-0" />
                        <span className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#1a3a5c]">
                          {index + 1}
                        </span>
                      </div>

                      {/* Dados do Passageiro */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-xs font-bold text-[#1a3a5c] font-headline truncate">
                          {passenger.nome}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" /> {passenger.bairro || "Bairro não cadastrado"}
                          {passenger.escola_nome && (
                            <>
                              <span className="text-slate-200">•</span>
                              <GraduationCap className="w-3.5 h-3.5 text-slate-300 shrink-0" /> {passenger.escola_nome}
                            </>
                          )}
                        </p>
                      </div>

                      {/* Setas e Remover */}
                      <div className="flex items-center gap-1 shrink-0 border-l border-slate-100 pl-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 border border-transparent disabled:opacity-30"
                          onClick={() => moverParaCima(index)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 border border-transparent disabled:opacity-30"
                          onClick={() => moverParaBaixo(index)}
                          disabled={index === selectedPassengers.length - 1}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent"
                          onClick={() => togglePassengerSelection(passenger)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ponto de Destino para a Ida (Escola) */}
              {tipo === "ida" && (
                <div className="bg-slate-50 border border-slate-200/50 border-dashed p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-800 uppercase">
                    Fim
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-500 font-headline truncate">
                      Destino Escolar Final
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3 h-3 text-slate-300" /> Os passageiros desembarcam na escola
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Coluna da Direita: Seleção de Passageiros Disponíveis */}
          <div className="md:col-span-2 space-y-4">
            <div className="px-1 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1a3a5c] font-headline flex items-center gap-1.5">
                Alunos Disponíveis
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {availablePassengers.length} FILTRADOS
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-[1.25rem] max-h-[460px] overflow-y-auto space-y-2 shadow-inner">
              {availablePassengers.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-400/80 text-center py-6">
                  {isLoading ? "Buscando passageiros..." : "Nenhum aluno disponível para seleção."}
                </p>
              ) : (
                availablePassengers.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => togglePassengerSelection(p)}
                    className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer shadow-sm hover:border-slate-200 hover:shadow-md transition-all group"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs font-bold text-[#1a3a5c] font-headline truncate">
                        {p.nome}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-semibold truncate">
                        {p.bairro || "Sem bairro"} • {p.escola?.nome || "Sem escola"}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 rounded-lg text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 border border-transparent"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Ações Finais no Rodapé */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200/60 pt-6">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50"
            onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#1a3a5c] hover:bg-[#16314f] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
            onClick={onSave}
            disabled={isLoading}
          >
            <Save className="w-4 h-4" />
            Salvar Rota
          </Button>
        </div>

      </div>
    </PullToRefreshWrapper>
  );
}
