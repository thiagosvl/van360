import { useState, useMemo } from "react";
import { AdminUserSchoolItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, MapPin, User, Search, X } from "lucide-react";
import { formatarEnderecoCompleto } from "@/utils/formatters/address";
import { ActiveStatusBadge } from "@/components/ui/ActiveStatusBadge";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { Input } from "@/components/ui/input";

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
    <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card text-left">
      <CardHeader className="p-6 border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-500" />
              <span>Escolas</span>
              <span className="text-xs font-normal text-muted-foreground">
                {search.trim() ? (
                  `(${filtered.length} de ${escolas.length})`
                ) : (
                  `(${escolas.length})`
                )}
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Instituições de ensino cadastradas pelo motorista.
            </p>
          </div>

          {escolas.length > 3 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar escola..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 h-10 rounded-xl bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground text-xs focus-visible:ring-primary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
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
                  className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs border border-purple-500/20 shrink-0">
                        {e.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className="text-xs font-semibold text-foreground line-clamp-2 break-words leading-tight"
                          title={e.nome}
                        >
                          {e.nome}
                        </h4>
                        {e.contato_nome && (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>{e.contato_nome}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <ActiveStatusBadge active={e.ativo} activeLabel="Ativa" inactiveLabel="Inativa" />
                  </div>

                  {fullAddress ? (
                    <div className="text-xs text-foreground/80 flex items-start gap-1.5 pt-2.5 border-t border-border/60 leading-normal">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{fullAddress}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic pt-2.5 border-t border-border/60">
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
