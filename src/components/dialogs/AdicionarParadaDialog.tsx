import { useEffect, useState, useMemo } from "react";
import { Route, Plus, X, School, Home, Check, AlertTriangle, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface AdicionarParadaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  insertTarget: "top" | "bottom" | number;
  itinerario: any[];
  passageirosList: any[];
  escolasList: any[];
  selectedEscolaId?: string;
  onSelectEscolaId?: (id: string) => void;
  onAddPassageiro: (id: string) => void;
  onOpenCadastrarEndereco?: (id: string) => void;
  onAddEscola: (id: string) => void;
}

export function AdicionarParadaDialog({
  isOpen,
  onOpenChange,
  insertTarget,
  itinerario,
  passageirosList,
  escolasList,
  selectedEscolaId,
  onSelectEscolaId,
  onAddPassageiro,
  onOpenCadastrarEndereco,
  onAddEscola,
}: AdicionarParadaDialogProps) {
  const [activeTab, setActiveTab] = useState<"passageiros" | "escolas">("passageiros");
  const [searchAlunos, setSearchAlunos] = useState("");
  const [searchEscolas, setSearchEscolas] = useState("");
  const [internalEscolaId, setInternalEscolaId] = useState<string>("TODAS");

  const effectiveEscolaId = selectedEscolaId !== undefined ? selectedEscolaId : internalEscolaId;
  const setEffectiveEscolaId = onSelectEscolaId || setInternalEscolaId;

  useEffect(() => {
    if (isOpen) {
      setActiveTab("passageiros");
      setSearchAlunos("");
      setSearchEscolas("");
    }
  }, [isOpen]);

  const passageirosAtivos = passageirosList.filter((p) => p.ativo !== false);
  const passageirosDisponiveis = useMemo(() => {
    return passageirosAtivos.filter((p) => !itinerario.some((item) => item.passageiro_id === p.id));
  }, [passageirosAtivos, itinerario]);

  const escolasComContagem = useMemo(() => {
    return escolasList.map((esc) => {
      const totalAlunos = passageirosDisponiveis.filter(
        (p) => p.escola_id === esc.id || p.escola?.id === esc.id
      ).length;
      return {
        ...esc,
        totalAlunos,
      };
    });
  }, [escolasList, passageirosDisponiveis]);

  const filteredPassageiros = useMemo(() => {
    return passageirosDisponiveis.filter((p) => {
      if (effectiveEscolaId && effectiveEscolaId !== "TODAS") {
        const pEscolaId = p.escola_id || p.escola?.id;
        if (pEscolaId !== effectiveEscolaId) return false;
      }

      return (
        p.nome.toLowerCase().includes(searchAlunos.toLowerCase()) ||
        (p.escola?.nome || "").toLowerCase().includes(searchAlunos.toLowerCase())
      );
    });
  }, [passageirosDisponiveis, effectiveEscolaId, searchAlunos]);

  const filteredEscolas = escolasList.filter((e) => {
    return e.nome.toLowerCase().includes(searchEscolas.toLowerCase());
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100vw-24px)] sm:w-full mx-auto rounded-3xl bg-white p-4 sm:p-5 shadow-2xl border-none max-h-[82vh] sm:max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1a3a5c]/5 flex items-center justify-center text-[#1a3a5c]">
              <Route className="w-4.5 h-4.5 stroke-[2.2px]" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-sm sm:text-base font-extrabold text-[#1a3a5c] uppercase tracking-tight">
                Adicionar Parada
              </DialogTitle>
              <DialogDescription className="sr-only">
                Selecione um aluno ou escola para adicionar ao itinerário
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "passageiros" | "escolas")} className="w-full flex-1 min-h-0 flex flex-col mt-2.5 overflow-hidden">
          <TabsList className="grid grid-cols-2 w-full bg-slate-100 p-1 rounded-xl h-9 shrink-0">
            <TabsTrigger value="passageiros" className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-2xs">
              Alunos ({filteredPassageiros.length})
            </TabsTrigger>
            <TabsTrigger value="escolas" className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-2xs">
              Escolas ({filteredEscolas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passageiros" className="flex-1 min-h-0 flex flex-col space-y-2 mt-2 focus-visible:outline-none focus-visible:ring-0 overflow-hidden">
            <div className="relative shrink-0">
              <Input
                placeholder="Buscar aluno..."
                value={searchAlunos}
                onChange={(e) => setSearchAlunos(e.target.value)}
                className="h-8.5 text-xs rounded-lg bg-slate-50/50 pr-8"
              />
              {searchAlunos && (
                <button
                  type="button"
                  onClick={() => setSearchAlunos("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {escolasList.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar -mx-1 px-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEffectiveEscolaId("TODAS")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer border",
                    effectiveEscolaId === "TODAS"
                      ? "bg-[#1a3a5c] text-white border-[#1a3a5c] shadow-2xs"
                      : "bg-slate-100 text-slate-600 border-slate-200/70 hover:bg-slate-200/80"
                  )}
                >
                  Todas ({passageirosDisponiveis.length})
                </button>
                {escolasComContagem.map((esc) => {
                  const isSelected = effectiveEscolaId === esc.id;
                  return (
                    <button
                      key={esc.id}
                      type="button"
                      onClick={() => setEffectiveEscolaId(esc.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1",
                        isSelected
                          ? "bg-[#1a3a5c] text-white border-[#1a3a5c] shadow-2xs"
                          : "bg-slate-100 text-slate-600 border-slate-200/70 hover:bg-slate-200/80"
                      )}
                    >
                      <span className="truncate max-w-[130px]">{esc.nome}</span>
                      <span
                        className={cn(
                          "text-[9px] px-1 py-0.2 rounded-full font-semibold",
                          isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                        )}
                      >
                        {esc.totalAlunos}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {filteredPassageiros.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium text-center py-6">
                Nenhum aluno encontrado
              </p>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin overscroll-contain">
                {filteredPassageiros.map((p) => {
                  const estaAdicionado = itinerario.some((item) => item.passageiro_id === p.id);
                  const addrObj = p.responsavel_principal?.logradouro ? p.responsavel_principal : p;
                  const temEnderecoCompleto = !!(addrObj.logradouro && addrObj.numero);
                  const passAddressStr = formatarEnderecoParcialRota(addrObj);

                  if (temEnderecoCompleto) {
                    return (
                      <div
                        key={p.id}
                        className="bg-slate-50/60 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors hover:bg-slate-50 text-left min-h-[52px]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-[#1a3a5c] truncate">
                              {formatShortName(p.nome, true)}
                            </span>
                            {p.turma && (
                              <span className="text-slate-400 font-semibold text-[10px] inline-flex items-center gap-1 shrink-0">
                                <span className="text-[7.5px] opacity-40">•</span>
                                {p.turma}
                              </span>
                            )}
                          </div>
                          {p.escola?.nome && (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-0.5 text-left">
                              <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="break-words leading-snug">{p.escola.nome}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-0.5 text-left">
                            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="break-words leading-snug">{passAddressStr || "Endereço cadastrado"}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onAddPassageiro(p.id)}
                          disabled={estaAdicionado}
                          title={estaAdicionado ? "Aluno já adicionado" : "Adicionar aluno"}
                          className="h-8 w-8 rounded-lg bg-[#1a3a5c] hover:bg-[#11263d] text-white p-0 shrink-0 shadow-sm disabled:opacity-30 cursor-pointer flex items-center justify-center"
                        >
                          {estaAdicionado ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={p.id}
                      className="bg-slate-50/60 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors hover:bg-slate-50 text-left min-h-[52px]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-[#1a3a5c] truncate">
                            {formatShortName(p.nome, true)}
                          </span>
                          {p.turma && (
                            <span className="text-slate-400 font-semibold text-[10px] inline-flex items-center gap-1 shrink-0">
                              <span className="text-[7.5px] opacity-40">•</span>
                              {p.turma}
                            </span>
                          )}
                        </div>
                        {p.escola?.nome && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-0.5 text-left">
                            <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="break-words leading-snug">{p.escola.nome}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-left flex-wrap">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Sem endereço</span>
                          </div>
                          {onOpenCadastrarEndereco && (
                            <button
                              type="button"
                              onClick={() => onOpenCadastrarEndereco(p.id)}
                              className="text-[11px] font-bold text-[#1a3a5c] hover:underline cursor-pointer transition-colors"
                            >
                              Cadastrar endereço
                            </button>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onAddPassageiro(p.id)}
                        disabled={estaAdicionado}
                        title={estaAdicionado ? "Aluno já adicionado" : "Adicionar à rota sem endereço"}
                        className="h-8 w-8 rounded-lg bg-[#1a3a5c] hover:bg-[#11263d] text-white p-0 shrink-0 shadow-sm disabled:opacity-30 cursor-pointer flex items-center justify-center transition-colors"
                      >
                        {estaAdicionado ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="escolas" className="flex-1 min-h-0 flex flex-col space-y-2 mt-2 focus-visible:outline-none focus-visible:ring-0 overflow-hidden">
            <div className="relative shrink-0">
              <Input
                placeholder="Buscar escola..."
                value={searchEscolas}
                onChange={(e) => setSearchEscolas(e.target.value)}
                className="h-8.5 text-xs rounded-lg bg-slate-50/50 pr-8"
              />
              {searchEscolas && (
                <button
                  type="button"
                  onClick={() => setSearchEscolas("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {filteredEscolas.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium text-center py-6">
                Nenhuma escola encontrada
              </p>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin overscroll-contain">
                {filteredEscolas.map((e) => {
                  const escAddressStr = formatarEnderecoParcialRota(e);
                  return (
                    <div
                      key={e.id}
                      className="bg-slate-50/60 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors hover:bg-slate-50 text-left min-h-[52px]"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="text-xs font-bold text-[#1a3a5c] break-words">
                          {e.nome}
                        </h4>
                        {escAddressStr && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 text-left">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="break-words leading-snug">{escAddressStr}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onAddEscola(e.id)}
                        title="Adicionar escola"
                        className="h-8 w-8 rounded-lg bg-[#1a3a5c] hover:bg-[#11263d] text-white p-0 shrink-0 shadow-sm cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
