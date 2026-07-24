import { AdminUserVehicleItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActiveStatusBadge } from "@/components/ui/ActiveStatusBadge";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { Bus } from "lucide-react";

interface AdminUserVehiclesTabProps {
  veiculos: AdminUserVehicleItem[];
}

export function AdminUserVehiclesTab({ veiculos }: AdminUserVehiclesTabProps) {
  return (
    <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-left">
      <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-900/40">
        <div className="space-y-1">
          <CardTitle className="text-xs font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Bus className="h-4 w-4 text-amber-400" />
            Frota de Veículos ({veiculos.length})
          </CardTitle>
          <p className="text-[11px] font-medium text-slate-400">
            Veículos cadastrados para a realização das rotas escolares.
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {veiculos.length === 0 ? (
          <AdminEmptyState
            icon={Bus}
            title="Nenhum veículo cadastrado"
            description="O motorista ainda não cadastrou veículos na frota."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {veiculos.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-colors shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-xs border border-amber-500/20 shrink-0">
                      <Bus className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-100 uppercase truncate leading-tight">
                        {v.modelo}
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-amber-400 uppercase mt-0.5">
                        {v.placa}
                      </p>
                    </div>
                  </div>
                  <ActiveStatusBadge active={v.ativo} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
