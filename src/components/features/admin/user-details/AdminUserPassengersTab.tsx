import React, { useState } from "react";
import { AdminUserPassengerItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Search, Users, MapPin, School, Calendar, DollarSign } from "lucide-react";
import { phoneMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters/currency";

interface AdminUserPassengersTabProps {
  passageiros: AdminUserPassengerItem[];
}

export function AdminUserPassengersTab({ passageiros }: AdminUserPassengersTabProps) {
  const [search, setSearch] = useState("");

  const filtered = passageiros.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.nome.toLowerCase().includes(term) ||
      (p.nome_responsavel && p.nome_responsavel.toLowerCase().includes(term)) ||
      (p.escolas?.nome && p.escolas.nome.toLowerCase().includes(term))
    );
  });

  return (
    <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
        <div className="space-y-1 text-left">
          <CardTitle className="text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1a3a5c]" />
            Passageiros Cadastrados ({passageiros.length})
          </CardTitle>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por aluno, responsável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">Nenhum passageiro encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#1a3a5c]/10 text-[#1a3a5c] rounded-xl flex items-center justify-center font-black text-sm">
                      {p.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-headline font-bold text-slate-800 leading-tight">
                        {p.nome}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {p.serie_ano ? `${p.serie_ano}` : ""} {p.turma ? `— Turma ${p.turma}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant={p.ativo ? "default" : "secondary"} className="text-[9px] uppercase px-2 py-0.5">
                    {p.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  {p.nome_responsavel && (
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        Responsável ({p.parentesco_responsavel || "Resp."})
                      </span>
                      <span className="font-bold text-slate-700 block truncate">{p.nome_responsavel}</span>
                      {p.telefone_responsavel && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {phoneMask(p.telefone_responsavel)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Escola / Turno
                    </span>
                    <span className="font-bold text-slate-700 flex items-center gap-1 truncate">
                      <School className="h-3 w-3 text-slate-400 shrink-0" />
                      {p.escolas?.nome || "Não informada"}
                    </span>
                    {p.turno && (
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                        Turno: {p.turno}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Cobrança
                    </span>
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-slate-400 shrink-0" />
                      {p.valor_mensalidade ? formatCurrency(p.valor_mensalidade) : "Não informado"}
                    </span>
                    {p.dia_vencimento ? (
                      <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        Venc.: dia {p.dia_vencimento}
                      </span>
                    ) : null}
                  </div>
                </div>

                {p.endereco && (
                  <div className="text-[10px] text-slate-500 pt-1 flex items-start gap-1">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">
                      {p.endereco}{p.numero ? `, nº ${p.numero}` : ""}{p.bairro ? ` - ${p.bairro}` : ""}
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
