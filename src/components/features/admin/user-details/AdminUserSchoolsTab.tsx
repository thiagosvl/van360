import { useState, useMemo } from "react";
import { AdminUserSchoolItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, MapPin, User, Search, X } from "lucide-react";
import { formatarEnderecoCompleto } from "@/utils/formatters/address";
import { ActiveStatusBadge } from "@/components/ui/ActiveStatusBadge";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";

interface AdminUserSchoolsTabProps {
  escolas: AdminUserSchoolItem[];
}

export function AdminUserSchoolsTab({ escolas }: AdminUserSchoolsTabProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return escolas.filter((e) => {
      const term = search.toLowerCase();
      return (
        e.nome.toLowerCase().includes(term) ||
        (e.contato_nome && e.contato_nome.toLowerCase().includes(term)) ||
        (e.cidade && e.cidade.toLowerCase().includes(term))
      );
    });
  }, [escolas, search]);

  return (
    <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-left">
      <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xs font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-400" />
              Escolas Atendidas ({filtered.length} de {escolas.length})
            </CardTitle>
            <p className="text-[11px] font-medium text-slate-400">
              Instituições de ensino cadastradas pelo motorista.
            </p>
          </div>

          {escolas.length > 3 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar escola..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 h-10 rounded-xl bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus-visible:ring-purple-500"
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
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={GraduationCap}
            title="Nenhuma escola encontrada"
            description={
              search
                ? "Nenhuma escola corresponde à busca digitada."
                : "O motorista ainda não possui escolas cadastradas."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((e) => {
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
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-colors shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-xs border border-purple-500/20 shrink-0">
                        {e.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate leading-tight">
                          {e.nome}
                        </h4>
                        {e.contato_nome && (
                          <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>{e.contato_nome}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <ActiveStatusBadge active={e.ativo} activeLabel="Ativa" inactiveLabel="Inativa" />
                  </div>

                  {fullAddress ? (
                    <div className="text-[11px] text-slate-300 flex items-start gap-1.5 pt-2.5 border-t border-slate-800/60 leading-normal">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{fullAddress}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic pt-2.5 border-t border-slate-800/60">
                      Endereço não informado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
