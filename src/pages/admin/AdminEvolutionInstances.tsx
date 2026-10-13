import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminEvolutionInstances } from "@/hooks/api/adminHooks";
import { Loader2, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { WhatsappStatusBadge } from "@/components/ui/WhatsappStatusBadge";
import { EvolutionPurpose } from "@/types/enums";

function formatWhatsappPurpose(purpose: string): string {
  if (purpose === EvolutionPurpose.BULK) return "Massa (Lento)";
  if (purpose === EvolutionPurpose.TRANSACTIONAL) return "Transacional (Rápido)";
  return purpose;
}

export default function AdminEvolutionInstances() {
  const { setPageTitle } = useLayout();
  const { data: instances, isLoading } = useAdminEvolutionInstances();

  useEffect(() => {
    setPageTitle("Instâncias do WhatsApp");
  }, [setPageTitle]);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-left">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Instâncias do WhatsApp
        </h1>
        <p className="text-xs text-muted-foreground">
          Gerenciamento e status de conexões das instâncias Evolution API.
        </p>
      </div>

      <Card className="border border-border shadow-xs rounded-xl overflow-hidden bg-card">
        <CardContent className="p-4 sm:p-6 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !instances || instances.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-xs text-muted-foreground">
                Nenhuma instância de WhatsApp encontrada.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Instância</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Propósito</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Rate limit</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Ativa no banco</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Status (Live)</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((instance) => (
                    <tr
                      key={instance.id}
                      className="border-b border-border/60 hover:bg-secondary/40 transition-colors"
                    >
                      <td className="py-3.5">
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {instance.instance_name}
                            {instance.is_default_for_purpose && (
                              <span className="ml-2 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                                Padrão
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {instance.description || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                          instance.purpose === EvolutionPurpose.BULK 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                            : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        }`}>
                          {formatWhatsappPurpose(instance.purpose)}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="text-xs text-muted-foreground font-mono">
                          <span className="font-semibold text-foreground">{instance.rate_limit_max}</span> msgs /{" "}
                          <span className="font-semibold text-foreground">{instance.rate_limit_duration / 1000}s</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        {instance.is_active ? (
                          <div className="flex items-center text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Sim
                          </div>
                        ) : (
                          <div className="flex items-center text-destructive text-xs font-medium">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Não
                          </div>
                        )}
                      </td>
                      <td className="py-3.5">
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
