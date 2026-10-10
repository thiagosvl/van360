import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import type { AdminEstadoDemographics } from "@/services/api/admin/admin-financial.api";

interface AdminStateDemographicsChartProps {
  data: AdminEstadoDemographics[];
}

const REGIAO_COLORS: Record<string, string> = {
  Sudeste: "bg-blue-500",
  Sul: "bg-emerald-500",
  Nordeste: "bg-amber-500",
  "Centro-Oeste": "bg-purple-500",
  Norte: "bg-teal-500",
  Outros: "bg-slate-500",
};

const REGIAO_BADGES: Record<string, string> = {
  Sudeste: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Sul: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Nordeste: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Centro-Oeste": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Norte: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Outros: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function AdminStateDemographicsChart({ data }: AdminStateDemographicsChartProps) {
  const totalMotoristas = data.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-left h-full w-full min-w-0">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="truncate">Distribuição por estado (DDD)</span>
          </div>
          <span className="text-xs font-mono font-normal text-muted-foreground shrink-0 ml-2">
            {totalMotoristas} {totalMotoristas === 1 ? "motorista" : "motoristas"}
          </span>
        </CardTitle>
        <p className="text-xs font-normal text-muted-foreground mt-0.5">
          Identificação geográfica estimada a partir do DDD cadastrado
        </p>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-4 w-full min-w-0">
        {data.length === 0 ? (
          <div className="py-12">
            <AdminEmptyState
              icon={MapPin}
              title="Nenhum dado de localização"
              description="Não foram encontrados motoristas cadastrados com telefones válidos."
            />
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-2 [scrollbar-width:thin] w-full min-w-0">
            {data.map((item) => {
              const corBarra = REGIAO_COLORS[item.regiao] || "bg-primary";
              const badgeClass = REGIAO_BADGES[item.regiao] || REGIAO_BADGES.Outros;

              return (
                <div key={item.uf} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-medium text-xs px-2 py-0.5 rounded-lg bg-secondary border border-border text-foreground shrink-0">
                        {item.uf}
                      </span>
                      <span className="font-medium text-foreground truncate">
                        {item.nome}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg border ${badgeClass} shrink-0 hidden sm:inline-block`}>
                        {item.regiao}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                      <span className="font-semibold text-foreground text-xs">
                        {item.porcentagem}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.quantidade})
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/40">
                    <div
                      className={`h-full ${corBarra} transition-all duration-700 rounded-full`}
                      style={{ width: `${Math.max(item.porcentagem, 2)}%` }}
                    />
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
