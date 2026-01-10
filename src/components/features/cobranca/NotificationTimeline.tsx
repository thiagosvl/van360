import { Button } from "@/components/ui/button";
import { CobrancaNotificacao } from "@/types/cobrancaNotificacao";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, ChevronUp, User } from "lucide-react";
import { useState } from "react";

interface NotificationTimelineProps {
  items: CobrancaNotificacao[];
}

export const NotificationTimeline = ({ items }: NotificationTimelineProps) => {
  const [expanded, setExpanded] = useState(false);
  const displayedItems = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

  const getIcon = (type: string) => {
    const lowerType = type?.toLowerCase() || "";
    
    if (lowerType.includes("manual") || lowerType.includes("force")) {
      return (
        <div className="h-8 w-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600 z-10">
          <User className="h-4 w-4" />
        </div>
      );
    }
    
    return (
      <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 z-10">
        <Bot className="h-4 w-4" />
      </div>
    );
  };

  const getEventDescription = (tipoEvento: string): string => {
    if (tipoEvento === "REENVIO_MANUAL" || tipoEvento === "COBRANCA_MANUAL") {
      return "Envio manual de cobrança";
    }
    const atrasoMatch = tipoEvento.match(/^LEMBRETE_ATRASO_(\d+)$/);
    if (atrasoMatch) {
      return `${atrasoMatch[1]}º lembrete de atraso`;
    }
    switch (tipoEvento) {
      case "AVISO_VENCIMENTO":
      case "DUE_SOON":
        return "Lembrete de vencimento";
      case "AVISO_ANTECIPADO":
        return "Lembrete antecipado";
      case "DUE_TODAY":
        return "Lembrete de vencimento hoje";
      case "OVERDUE":
        return "Aviso de atraso";
      default:
        return tipoEvento;
    }
  };

  return (
    <div className="relative pl-2">
      <div className="absolute left-[24px] top-4 bottom-4 w-px bg-gray-100" />
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {displayedItems.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex gap-4 items-start"
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(item.tipo_origem)}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {getEventDescription(item.tipo_evento)}
                  </p>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    {new Date(item.data_envio).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-4 pl-12">
          <Button
            variant="link"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-gray-900 p-0 h-auto font-semibold text-xs"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" /> Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" /> Ver histórico completo
                ({items.length - 3})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
