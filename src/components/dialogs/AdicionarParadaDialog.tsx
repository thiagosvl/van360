import { useEffect, useState } from "react";
import { Plus, X, School, Home, Check, AlertTriangle, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";

interface AdicionarParadaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  insertTarget: "top" | "bottom" | number;
  itinerario: any[];
  passageirosList: any[];
  escolasList: any[];
  onAddPassageiro: (id: string) => void;
  onAddEscola: (id: string) => void;
}

export function AdicionarParadaDialog({
  isOpen,
  onOpenChange,
  insertTarget,
  itinerario,
  passageirosList,
  escolasList,
  onAddPassageiro,
  onAddEscola,
}: AdicionarParadaDialogProps) {
  const [activeTab, setActiveTab] = useState<"passageiros" | "escolas">("passageiros");
  const [searchAlunos, setSearchAlunos] = useState("");
  const [searchEscolas, setSearchEscolas] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActiveTab("passageiros");
      setSearchAlunos("");
      setSearchEscolas("");
    }
  }, [isOpen]);

  const passageirosAtivos = passageirosList.filter((p) => p.ativo !== false);
  const filteredPassageiros = passageirosAtivos.filter((p) => {
    const jaAdicionado = itinerario.some((item) => item.passageiro_id === p.id);
    if (jaAdicionado) return false;

    return (
      p.nome.toLowerCase().includes(searchAlunos.toLowerCase()) ||
      (p.escola?.nome || "").toLowerCase().includes(searchAlunos.toLowerCase())
    );
  });

  const filteredEscolas = escolasList.filter((e) => {
    return e.nome.toLowerCase().includes(searchEscolas.toLowerCase());
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-none">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#1a3a5c]/5 flex items-center justify-center text-[#1a3a5c]">
              <Plus className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-base font-extrabold text-[#1a3a5c] uppercase tracking-tight">
                Adicionar Parada
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-400 font-medium">
                {typeof insertTarget === "number"
                  ? `Inserir na posição ${insertTarget + 1}`
                  : insertTarget === "top"
                    ? "Inserir no início da rota"
                    : "Inserir no final da rota"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "passageiros" | "escolas")} className="w-full mt-3">
          <TabsList className="grid grid-cols-2 w-full bg-slate-100 p-1 rounded-xl h-10">
            <TabsTrigger value="passageiros" className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-2xs">
              Passageiros ({filteredPassageiros.length})
            </TabsTrigger>
            <TabsTrigger value="escolas" className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-2xs">
              Escolas ({filteredEscolas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passageiros" className="space-y-2.5 mt-3 focus-visible:outline-none focus-visible:ring-0">
            <div className="relative">
              <Input
                placeholder="Buscar passageiro..."
                value={searchAlunos}
                onChange={(e) => setSearchAlunos(e.target.value)}
                className="h-9 text-xs rounded-lg bg-slate-50/50 pr-8"
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

            {filteredPassageiros.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium text-center py-6">
                Nenhum passageiro encontrado
              </p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
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
                          title={estaAdicionado ? "Passageiro já adicionado" : "Adicionar passageiro"}
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
                        <div className="flex flex-col gap-0.5 mt-0.5 text-left">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="break-words leading-snug">Sem endereço cadastrado</span>
                          </div>
                          <p className="text-[10px] text-amber-800/90 font-medium leading-tight">
                            Clique no botão <span className="font-bold text-amber-900">+</span> para cadastrar o endereço e incluir na rota
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onAddPassageiro(p.id)}
                        disabled={estaAdicionado}
                        title={estaAdicionado ? "Adicionado à Rota" : "Cadastrar endereço e adicionar à rota"}
                        className="h-8 w-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white p-0 shrink-0 shadow-sm cursor-pointer flex items-center justify-center transition-colors disabled:opacity-30"
                      >
                        {estaAdicionado ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="escolas" className="space-y-2.5 mt-3 focus-visible:outline-none focus-visible:ring-0">
            <div className="relative">
              <Input
                placeholder="Buscar escola..."
                value={searchEscolas}
                onChange={(e) => setSearchEscolas(e.target.value)}
                className="h-9 text-xs rounded-lg bg-slate-50/50 pr-8"
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
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
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
