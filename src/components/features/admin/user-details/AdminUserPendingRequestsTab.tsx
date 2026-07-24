import React from "react";
import { AdminUserPendingRequestItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Phone, Mail, School, MapPin } from "lucide-react";
import { phoneMask } from "@/utils/masks";

interface AdminUserPendingRequestsTabProps {
  solicitacoes: AdminUserPendingRequestItem[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminUserPendingRequestsTab({ solicitacoes }: AdminUserPendingRequestsTabProps) {
  return (
    <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden bg-white">
      <CardHeader className="p-6">
        <CardTitle className="text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#1a3a5c]" />
          Solicitações de Pré-Cadastro Pendentes ({solicitacoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {solicitacoes.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">Nenhuma solicitação pendente no momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solicitacoes.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-headline font-bold text-slate-800 leading-tight">
                      {s.nome}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Enviado em {formatDate(s.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase border-amber-300 bg-amber-100/80 text-amber-800">
                    Pendente
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 text-xs">
                  {s.nome_responsavel && (
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Responsável</span>
                      <span className="font-bold text-slate-700 block truncate">{s.nome_responsavel}</span>
                      {s.telefone_responsavel && (
                        <a
                          href={`https://wa.me/55${s.telefone_responsavel.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:underline mt-0.5"
                        >
                          <Phone className="h-3 w-3" />
                          {phoneMask(s.telefone_responsavel)}
                        </a>
                      )}
                    </div>
                  )}

                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Escola Pretendida</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1 truncate">
                      <School className="h-3 w-3 text-slate-400 shrink-0" />
                      {s.escolas?.nome || "Não informada"}
                    </span>
                    {s.turno && (
                      <span className="text-[10px] text-slate-500 uppercase block mt-0.5">
                        Turno: {s.turno}
                      </span>
                    )}
                  </div>
                </div>

                {s.endereco && (
                  <div className="text-[10px] text-slate-500 pt-1 flex items-start gap-1">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">
                      {s.endereco}{s.bairro ? ` - ${s.bairro}` : ""}{s.cidade ? `, ${s.cidade}` : ""}
                    </span>
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
