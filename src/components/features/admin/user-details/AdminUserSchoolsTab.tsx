import React from "react";
import { AdminUserSchoolItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, MapPin, Phone, User, Clock } from "lucide-react";
import { phoneMask } from "@/utils/masks";
import { formatarEnderecoCompleto } from "@/utils/formatters/address";
import { Badge } from "@/components/ui/badge";

interface AdminUserSchoolsTabProps {
  escolas: AdminUserSchoolItem[];
}

export function AdminUserSchoolsTab({ escolas }: AdminUserSchoolsTabProps) {
  return (
    <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden bg-white">
      <CardHeader className="p-6">
        <CardTitle className="text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-[#1a3a5c]" />
          Escolas Atendidas ({escolas.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {escolas.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">Nenhuma escola cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {escolas.map((e) => {
              const fullAddress = formatarEnderecoCompleto({
                cep: e.cep,
                logradouro: e.logradouro || e.endereco,
                numero: e.numero,
                bairro: e.bairro,
                cidade: e.cidade,
                estado: e.estado || e.uf,
              });

              return (
                <div
                  key={e.id}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-headline font-bold text-slate-800 leading-tight">
                          {e.nome}
                        </h4>
                        {e.contato_nome && (
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3 text-slate-400" />
                            Contato: {e.contato_nome}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={e.ativo ? "default" : "secondary"} className="text-[9px] uppercase px-2 py-0.5">
                      {e.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>

                  {fullAddress && (
                    <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-2 border-t border-slate-200/60">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{fullAddress}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    {e.telefone && (
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Telefone</span>
                        <a
                          href={`tel:${e.telefone}`}
                          className="font-bold text-slate-700 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="h-3 w-3 text-slate-400" />
                          {phoneMask(e.telefone)}
                        </a>
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" /> Horários
                      </span>
                      {e.horario_entrada_manha && (
                        <span className="text-[10px] text-slate-600 block">
                          Manhã: {e.horario_entrada_manha}h - {e.horario_saida_manha}h
                        </span>
                      )}
                      {e.horario_entrada_tarde && (
                        <span className="text-[10px] text-slate-600 block">
                          Tarde: {e.horario_entrada_tarde}h - {e.horario_saida_tarde}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
