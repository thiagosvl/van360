import { useEffect, useState, useMemo } from "react";
import { Route, Plus, X, School, Home, Check, AlertTriangle, MapPin } from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";
import type { ItineraryItem } from "@/hooks/ui/useConfigurarRotaViewModel";
import type { Passageiro } from "@/types/passageiro";
import type { Escola } from "@/types/escola";

interface AdicionarParadaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  insertTarget: "top" | "bottom" | number;
  itinerario: ItineraryItem[];
  passageirosList: Passageiro[];
  escolasList: Escola[];
  selectedEscolaId?: string;
  onSelectEscolaId?: (id: string) => void;
  onAddPassageiro: (id: string) => void;
  onOpenCadastrarEndereco?: (id: string) => void;
  onAddEscola: (id: string) => void;
}

export function AdicionarParadaDialog({
  isOpen,
  onOpenChange,
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
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="md"
      description="Selecione um aluno ou escola para adicionar ao itinerário"
    >
      <BaseDialog.Header
        title="Adicionar Parada"
        icon={<Route className="w-4 h-4" />}
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="p-4 sm:p-5 flex flex-col min-h-0 max-h-[70vh] overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "passageiros" | "escolas")}
          className="w-full flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-2 w-full bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] min-h-[38px] sm:min-h-[42px] shrink-0">
            <TabsTrigger
              value="passageiros"
              className="rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer"
            >
              Alunos ({filteredPassageiros.length})
            </TabsTrigger>
            <TabsTrigger
              value="escolas"
              className="rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer"
            >
              Escolas ({filteredEscolas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passageiros" className="flex-1 min-h-0 flex flex-col space-y-2 mt-3 focus-visible:outline-none focus-visible:ring-0 overflow-hidden">
            <div className="relative shrink-0">
              <Input
                placeholder="Buscar aluno..."
                value={searchAlunos}
                onChange={(e) => setSearchAlunos(e.target.value)}
                className="h-10 sm:h-11 text-sm font-normal rounded-[18px] bg-white border border-[#e5e5e5] pr-8 text-[#0a0a0a] placeholder:text-[#737373] focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]"
              />
              {searchAlunos && (
                <button
                  type="button"
                  onClick={() => setSearchAlunos("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {escolasList.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-1 px-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEffectiveEscolaId("TODAS")}
                  className={cn(
                    "px-3 py-1 rounded-[18px] text-[11px] font-medium shrink-0 transition-all cursor-pointer border",
                    effectiveEscolaId === "TODAS"
                      ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-xs"
                      : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5] hover:text-[#0a0a0a] hover:bg-[#ebebeb]"
                  )}
                >
                  Todas
                </button>
                {escolasComContagem.map((esc) => {
                  const isSelected = effectiveEscolaId === esc.id;
                  return (
                    <button
                      key={esc.id}
                      type="button"
                      onClick={() => setEffectiveEscolaId(esc.id)}
                      className={cn(
                        "px-3 py-1 rounded-[18px] text-[11px] font-medium shrink-0 transition-all cursor-pointer border flex items-center gap-1.5",
                        isSelected
                          ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-xs"
                          : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5] hover:text-[#0a0a0a] hover:bg-[#ebebeb]"
                      )}
                    >
                      <span>{esc.nome}</span>
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                          isSelected ? "bg-white/20 text-white" : "bg-[#e5e5e5] text-[#0a0a0a]"
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
              <p className="text-xs text-[#737373] font-normal text-center py-8">
                Nenhum aluno encontrado
              </p>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin overscroll-contain">
                {filteredPassageiros.map((p) => {
                  const estaAdicionado = itinerario.some((item) => item.passageiro_id === p.id);
                  const resp = p.responsavel_principal;
                  const temEnderecoCompleto = !!(resp?.logradouro && resp?.numero);
                  const passAddressStr = formatarEnderecoParcialRota(resp || p);

                  if (temEnderecoCompleto) {
                    return (
                      <div
                        key={p.id}
                        className="bg-white border border-[#e5e5e5] p-3 rounded-[18px] flex items-center justify-between gap-3 transition-colors hover:bg-[#fafafa] text-left min-h-[52px]"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-semibold text-[#0a0a0a] truncate">
                              {formatShortName(p.nome, true)}
                            </span>
                            {p.turma && (
                              <span className="text-[#737373] font-normal text-[10px] inline-flex items-center gap-1 shrink-0">
                                <span className="opacity-40">•</span>
                                {p.turma}
                              </span>
                            )}
                          </div>
                          {p.escola?.nome && (
                            <div className="flex items-center gap-1.5 text-[11px] font-normal text-[#737373]">
                              <School className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                              <span className="break-words leading-snug">{p.escola.nome}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[11px] font-normal text-[#737373]">
                            <Home className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                            <span className="break-words leading-snug">{passAddressStr || "Endereço cadastrado"}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onAddPassageiro(p.id)}
                          disabled={estaAdicionado}
                          title={estaAdicionado ? "Aluno já adicionado" : "Adicionar aluno"}
                          className="h-8 w-8 rounded-[12px] bg-primary hover:bg-primary-hover text-white p-0 shrink-0 shadow-xs disabled:opacity-30 cursor-pointer flex items-center justify-center border-none"
                        >
                          {estaAdicionado ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={p.id}
                      className="bg-white border border-[#e5e5e5] p-3 rounded-[18px] flex items-center justify-between gap-3 transition-colors hover:bg-[#fafafa] text-left min-h-[52px]"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-semibold text-[#0a0a0a] truncate">
                            {formatShortName(p.nome, true)}
                          </span>
                          {p.turma && (
                            <span className="text-[#737373] font-normal text-[10px] inline-flex items-center gap-1 shrink-0">
                              <span className="opacity-40">•</span>
                              {p.turma}
                            </span>
                          )}
                        </div>
                        {p.escola?.nome && (
                          <div className="flex items-center gap-1.5 text-[11px] font-normal text-[#737373]">
                            <School className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                            <span className="break-words leading-snug">{p.escola.nome}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-left flex-wrap">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Sem endereço</span>
                          </div>
                          {onOpenCadastrarEndereco && (
                            <button
                              type="button"
                              onClick={() => onOpenCadastrarEndereco(p.id)}
                              className="text-[11px] font-medium text-primary hover:underline cursor-pointer transition-colors"
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
                        className="h-8 w-8 rounded-[12px] bg-primary hover:bg-primary-hover text-white p-0 shrink-0 shadow-xs disabled:opacity-30 cursor-pointer flex items-center justify-center transition-colors border-none"
                      >
                        {estaAdicionado ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="escolas" className="flex-1 min-h-0 flex flex-col space-y-2 mt-3 focus-visible:outline-none focus-visible:ring-0 overflow-hidden">
            <div className="relative shrink-0">
              <Input
                placeholder="Buscar escola..."
                value={searchEscolas}
                onChange={(e) => setSearchEscolas(e.target.value)}
                className="h-10 text-xs rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] pr-8 text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a]"
              />
              {searchEscolas && (
                <button
                  type="button"
                  onClick={() => setSearchEscolas("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {filteredEscolas.length === 0 ? (
              <p className="text-xs text-[#737373] font-normal text-center py-8">
                Nenhuma escola encontrada
              </p>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin overscroll-contain">
                {filteredEscolas.map((e) => {
                  const escAddressStr = formatarEnderecoParcialRota(e);
                  return (
                    <div
                      key={e.id}
                      className="bg-white border border-[#e5e5e5] p-3 rounded-[18px] flex items-center justify-between gap-3 transition-colors hover:bg-[#fafafa] text-left min-h-[52px]"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="text-xs font-semibold text-[#0a0a0a] break-words">
                          {e.nome}
                        </h4>
                        {escAddressStr && (
                          <div className="flex items-center gap-1.5 text-[11px] font-normal text-[#737373] text-left">
                            <MapPin className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                            <span className="break-words leading-snug">{escAddressStr}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onAddEscola(e.id)}
                        title="Adicionar escola"
                        className="h-8 w-8 rounded-[12px] bg-primary hover:bg-primary-hover text-white p-0 shrink-0 shadow-xs cursor-pointer flex items-center justify-center border-none"
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
      </BaseDialog.Body>
    </BaseDialog>
  );
}
