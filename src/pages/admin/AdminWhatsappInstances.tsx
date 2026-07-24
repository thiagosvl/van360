import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminWhatsappInstances } from "@/hooks/api/adminHooks";
import { Loader2, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { WhatsappStatusBadge } from "@/components/ui/WhatsappStatusBadge";
import { formatWhatsappPurpose } from "@/utils/whatsapp";

export default function AdminWhatsappInstances() {
  const { setPageTitle } = useLayout();
  const { data: instances, isLoading } = useAdminWhatsappInstances();

  useEffect(() => {
    setPageTitle("Instâncias do WhatsApp");
  }, [setPageTitle]);

  return (
    <div className="space-y-8">

      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardContent className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : !instances || instances.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <p className="text-sm font-semibold text-slate-400">
                Nenhuma instância de WhatsApp encontrada.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800/80">
                    <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Instância</th>
                    <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Propósito</th>
                    <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Rate Limit</th>
                    <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ativa no DB</th>
                    <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status (Live)</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((instance) => (
                    <tr
                      key={instance.id}
                      className="border-b border-slate-800/40 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-100">
                            {instance.instance_name}
                            {instance.is_default_for_purpose && (
                              <span className="ml-2 text-[9px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase">
                                Padrão
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            {instance.description || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          instance.purpose === "BULK" 
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                            : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                        }`}>
                          {formatWhatsappPurpose(instance.purpose)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="text-xs text-slate-400">
                          <span className="font-bold text-slate-200">{instance.rate_limit_max}</span> msgs /{" "}
                          <span className="font-bold text-slate-200">{instance.rate_limit_duration / 1000}s</span>
                        </div>
                      </td>
                      <td className="py-4">
                        {instance.is_active ? (
                          <div className="flex items-center text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Sim
                          </div>
                        ) : (
                          <div className="flex items-center text-red-400 text-xs font-bold">
                            <XCircle className="w-4 h-4 mr-1" /> Não
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <WhatsappStatusBadge status={instance.evolution_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
