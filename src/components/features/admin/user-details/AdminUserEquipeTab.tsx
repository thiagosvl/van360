import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AdminUserEquipeItem } from "@/services/api/admin/admin-user.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Bus, Search, X, Phone, Mail, FileText, ExternalLink, Shield } from "lucide-react";
import { ActiveStatusBadge } from "@/components/ui/ActiveStatusBadge";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { phoneMask, cpfCnpjMask } from "@/utils/masks";
import { formatDateBR } from "@/utils/formatters";

interface AdminUserEquipeTabProps {
  equipe: AdminUserEquipeItem[];
}

export function AdminUserEquipeTab({ equipe }: AdminUserEquipeTabProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return equipe;
    return equipe.filter((m) => {
      return (
        m.nome.toLowerCase().includes(term) ||
        (m.apelido && m.apelido.toLowerCase().includes(term)) ||
        (m.telefone && m.telefone.includes(term)) ||
        (m.cpfcnpj && m.cpfcnpj.includes(term)) ||
        (m.email && m.email.toLowerCase().includes(term))
      );
    });
  }, [equipe, search]);

  return (
    <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card text-left">
      <CardHeader className="p-6 border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Equipe do motorista</span>
              <span className="text-xs font-normal text-muted-foreground">
                {search.trim() ? (
                  `(${filtered.length} de ${equipe.length})`
                ) : (
                  `(${equipe.length})`
                )}
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Motoristas auxiliares e monitores cadastrados e associados à operação.
            </p>
          </div>

          {equipe.length > 3 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar membro..."
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
        {equipe.length === 0 ? (
          <AdminEmptyState
            icon={UserCheck}
            title="Nenhum membro na equipe"
            description="O motorista ainda não cadastrou motoristas auxiliares ou monitores."
          />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs">
            Nenhum membro encontrado para o filtro "{search}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((m) => {
              const isAuxiliar = m.tipo === "motorista_auxiliar";
              return (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${
                            isAuxiliar
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {isAuxiliar ? <Bus className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-foreground truncate leading-tight">
                            {m.nome}
                          </h4>
                          {m.apelido && (
                            <p className="text-xs font-medium text-muted-foreground truncate">
                              ({m.apelido})
                            </p>
                          )}
                        </div>
                      </div>
                      <ActiveStatusBadge active={m.ativo} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isAuxiliar
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                            : "bg-primary/10 text-primary border-primary/30"
                        }`}
                      >
                        {isAuxiliar ? "Motorista auxiliar" : "Monitor(a)"}
                      </span>

                      {m.veiculos && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-secondary text-foreground border border-border">
                          <Bus className="h-3 w-3 text-amber-500" />
                          <span>{m.veiculos.placa}</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-border/80 text-xs text-foreground/80">
                      {m.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{phoneMask(m.telefone)}</span>
                        </div>
                      )}
                      {m.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{m.email}</span>
                        </div>
                      )}
                      {m.cpfcnpj && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{cpfCnpjMask(m.cpfcnpj)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      Desde {formatDateBR(m.created_at)}
                    </span>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 rounded-xl text-xs font-semibold text-primary hover:text-primary hover:bg-secondary gap-1.5"
                    >
                      <Link to={`/admin/usuarios/${m.id}`}>
                        <span>Ver perfil</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
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
