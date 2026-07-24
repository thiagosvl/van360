import { useState, useMemo } from "react";
import { AdminUserPendingRequestItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Phone, MapPin, School, Calendar, Search, X, MessageSquare, AlertCircle } from "lucide-react";
import { phoneMask } from "@/utils/masks";
import { formatShortName } from "@/utils/formatters/name";
import { openBrowserLink } from "@/utils/browser";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";

interface AdminUserPendingRequestsTabProps {
  solicitacoes: AdminUserPendingRequestItem[];
}

export function AdminUserPendingRequestsTab({ solicitacoes }: AdminUserPendingRequestsTabProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return solicitacoes.filter((s) => {
      const term = search.toLowerCase();
      return (
        s.nome.toLowerCase().includes(term) ||
        (s.nome_responsavel && s.nome_responsavel.toLowerCase().includes(term)) ||
        (s.escolas?.nome && s.escolas.nome.toLowerCase().includes(term)) ||
        (s.endereco && s.endereco.toLowerCase().includes(term))
      );
    });
  }, [solicitacoes, search]);

  const handleOpenWhatsApp = (phone: string, nomeResp?: string | null, nomeAluno?: string | null) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) return;
    const msg = `Olá${nomeResp ? ` ${nomeResp.split(" ")[0]}` : ""}! 👋 Sobre sua solicitação de transporte para ${nomeAluno || "o aluno"}.`;
    const targetUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
    openBrowserLink(targetUrl);
  };

  return (
    <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-left">
      <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <CardTitle className="text-xs font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Solicitações Pendentes de Aprovação ({filtered.length} de {solicitacoes.length})
            </CardTitle>
            <p className="text-[11px] font-medium text-slate-400">
              Solicitações de pré-cadastro aguardando confirmação do motorista.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar por aluno, responsável, escola..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-10 rounded-xl bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus-visible:ring-blue-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={Clock}
              title="Nenhuma solicitação pendente"
              description={
                search
                  ? "Nenhuma solicitação atende aos critérios da busca."
                  : "O motorista não possui solicitações de cadastro pendentes de aprovação."
              }
            />
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (≥ 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/70 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3.5 px-6">Solicitante</th>
                    <th className="py-3.5 px-4">Responsável / WhatsApp</th>
                    <th className="py-3.5 px-4">Escola</th>
                    <th className="py-3.5 px-4">Data da Solicitação</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors group">
                      {/* SOLICITANTE */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center font-black text-xs border border-amber-500/20 shrink-0">
                            {s.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-100 truncate group-hover:text-amber-400 transition-colors">
                              {s.nome}
                            </p>
                            {s.endereco && (
                              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5 max-w-[220px]">
                                <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                <span className="truncate">{s.endereco}{s.numero ? `, nº ${s.numero}` : ""}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* RESPONSÁVEL */}
                      <td className="py-4 px-4">
                        {s.nome_responsavel ? (
                          <div>
                            <p className="font-medium text-slate-300 truncate">
                              {formatShortName(s.nome_responsavel, true)}
                            </p>
                            {s.telefone_responsavel && (
                              <button
                                type="button"
                                onClick={() => handleOpenWhatsApp(s.telefone_responsavel!, s.nome_responsavel, s.nome)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:underline mt-0.5"
                                title="Chamar no WhatsApp"
                              >
                                <MessageSquare className="h-3 w-3 text-emerald-400" />
                                <span>{phoneMask(s.telefone_responsavel)}</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* ESCOLA */}
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-300 truncate">
                          {s.escolas?.nome || "Não informada"}
                        </p>
                      </td>

                      {/* DATA */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-slate-300 text-xs">
                          {new Date(s.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-6 text-right">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-amber-500/10 text-amber-400 border-amber-500/30"
                        >
                          Pendente
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW (< 768px) */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-3 text-left shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center font-black text-sm border border-amber-500/20 shrink-0">
                        {s.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-headline font-bold text-slate-100 leading-tight">
                          {s.nome}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Solicitado em {new Date(s.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[9px] font-bold uppercase px-2 py-0.5 bg-amber-500/10 text-amber-400 border-amber-500/30"
                    >
                      Pendente
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                        Responsável
                      </span>
                      <span className="font-bold text-slate-200 block truncate">
                        {s.nome_responsavel || "—"}
                      </span>
                      {s.telefone_responsavel && (
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(s.telefone_responsavel!, s.nome_responsavel, s.nome)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:underline mt-0.5"
                        >
                          <MessageSquare className="h-3 w-3 text-emerald-400" />
                          <span>{phoneMask(s.telefone_responsavel)}</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                        Escola
                      </span>
                      <span className="font-bold text-slate-200 block truncate">
                        {s.escolas?.nome || "—"}
                      </span>
                    </div>
                  </div>

                  {s.endereco && (
                    <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                      <span className="truncate">
                        {s.endereco}{s.numero ? `, nº ${s.numero}` : ""}{s.bairro ? ` - ${s.bairro}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
