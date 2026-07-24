import React from "react";
import { AdminUserPendingRequestItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Phone, MapPin, School, Calendar } from "lucide-react";
import { phoneMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters/currency";

interface AdminUserPendingRequestsTabProps {
  solicitacoes: AdminUserPendingRequestItem[];
}

export function AdminUserPendingRequestsTab({ solicitacoes }: AdminUserPendingRequestsTabProps) {
  return (
    <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
      <CardHeader className="p-6">
        <CardTitle className="text-sm font-headline font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          Solicitações Pendentes de Pré-Cadastro ({solicitacoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {solicitacoes.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">Nenhuma solicitação pendente.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solicitacoes.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between space-y-4 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-headline font-bold text-slate-100 leading-tight">
                        {s.nome}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Solicitado em {new Date(s.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
                  {s.nome_responsavel && (
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Responsável</span>
                      <span className="font-bold text-slate-200 block truncate">{s.nome_responsavel}</span>
                      {s.telefone_responsavel && (
                        <span className="text-[10px] text-slate-400 block mt-0.5 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-500" />
                          {phoneMask(s.telefone_responsavel)}
                        </span>
                      )}
                    </div>
                  )}
                  {s.escolas?.nome && (
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Escola</span>
                      <span className="font-bold text-slate-200 block truncate flex items-center gap-1">
                        <School className="h-3 w-3 text-slate-500 shrink-0" />
                        {s.escolas.nome}
                      </span>
                    </div>
                  )}
                </div>

                {s.endereco && (
                  <div className="text-xs text-slate-400 flex items-start gap-1.5 pt-2 border-t border-slate-800">
                    <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>{s.endereco}{s.numero ? `, nº ${s.numero}` : ""}{s.bairro ? ` - ${s.bairro}` : ""}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
