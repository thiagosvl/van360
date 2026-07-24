import React from "react";
import { AdminUserVehicleItem } from "@/services/api/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus } from "lucide-react";

interface AdminUserVehiclesTabProps {
  veiculos: AdminUserVehicleItem[];
}

export function AdminUserVehiclesTab({ veiculos }: AdminUserVehiclesTabProps) {
  return (
    <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
      <CardHeader className="p-6">
        <CardTitle className="text-sm font-headline font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Bus className="h-4 w-4 text-blue-400" />
          Frota de Veículos ({veiculos.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {veiculos.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">Nenhum veículo cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {veiculos.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between space-y-4 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Bus className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-headline font-bold text-slate-100 uppercase leading-tight">
                        {v.modelo}
                      </h4>
                      <p className="text-xs font-mono font-bold text-slate-400 uppercase mt-0.5">
                        Placa: {v.placa}
                      </p>
                    </div>
                  </div>
                  <Badge variant={v.ativo ? "default" : "secondary"} className="text-[9px] uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {v.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Marca</span>
                    <span className="font-bold text-slate-200 block">{v.marca || "Não informada"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
