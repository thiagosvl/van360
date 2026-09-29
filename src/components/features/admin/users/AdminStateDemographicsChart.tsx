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
    <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-left h-full w-full min-w-0">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="truncate">DISTRIBUIÇÃO DE MOTORISTAS POR ESTADO (DDD)</span>
          </div>
          <span className="text-[10px] font-bold font-mono text-slate-400 shrink-0 ml-2">
            {totalMotoristas} {totalMotoristas === 1 ? "MOTORISTA" : "MOTORISTAS"}
          </span>
        </CardTitle>
        <p className="text-[11px] font-medium text-slate-400 mt-1">
          Identificação geográfica estimada a partir do DDD do WhatsApp cadastrado
        </p>
      </CardHeader>

      <CardContent className="p-6 pt-4 w-full min-w-0">
        {data.length === 0 ? (
          <div className="py-12">
            <AdminEmptyState
              icon={MapPin}
              title="Nenhum dado de localização"
              description="Não foram encontrados motoristas cadastrados com telefones válidos."
            />
          </div>
        ) : (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent] w-full min-w-0">
            {data.map((item) => {
              const corBarra = REGIAO_COLORS[item.regiao] || "bg-blue-500";
              const badgeClass = REGIAO_BADGES[item.regiao] || REGIAO_BADGES.Outros;

              return (
                <div key={item.uf} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-white shrink-0">
                        {item.uf}
                      </span>
                      <span className="font-bold text-slate-200 truncate">
                        {item.nome}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeClass} shrink-0 hidden sm:inline-block`}>
                        {item.regiao}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                      <span className="font-black text-slate-300 text-xs">
                        {item.porcentagem}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        ({item.quantidade})
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
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
