import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistoricoByEntidade } from "@/hooks/api/useHistorico";
import { cn } from "@/lib/utils";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  CreditCard,
  Edit,
  FileText,
  MessageSquare,
  PlusCircle,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface ActivityTimelineProps {
  entidadeTipo: AtividadeEntidadeTipo | string;
  entidadeId: string;
  title?: string;
  className?: string;
  limit?: number;
}

const getActionStyles = (acao: string | AtividadeAcao) => {
  switch (acao) {
    case AtividadeAcao.BAIXA_BANCARIA:
      return {
        icon: <CreditCard className="w-3.5 h-3.5" />,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      };
    case AtividadeAcao.PAGAMENTO_MANUAL:
      return {
        icon: <CreditCard className="w-3.5 h-3.5" />,
        color: "text-blue-600 bg-blue-50 border-blue-100",
      };
    case AtividadeAcao.PAGAMENTO_REVERTIDO:
      return {
        icon: <RefreshCcw className="w-3.5 h-3.5" />,
        color: "text-orange-600 bg-orange-50 border-orange-100",
      };
    case AtividadeAcao.CONTRATO_GERADO:
      return {
        icon: <FileText className="w-3.5 h-3.5" />,
        color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      };
    case AtividadeAcao.CONTRATO_ASSINADO:
      return {
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      };
    case AtividadeAcao.NOTIFICACAO_WHATSAPP:
      return {
        icon: <MessageSquare className="w-3.5 h-3.5" />,
        color: "text-green-600 bg-green-50 border-green-100",
      };
  }

  if (acao.includes("CRIADA") || acao.includes("CRIADO") || acao.includes("REGISTRADO") || acao.includes("GERADO")) {
    return {
      icon: <PlusCircle className="w-3.5 h-3.5" />,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    };
  }
  if (acao.includes("EDITADA") || acao.includes("EDITADO") || acao.includes("ALTERADA")) {
    return {
      icon: <Edit className="w-3.5 h-3.5" />,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    };
  }
  if (acao.includes("EXCLUIDA") || acao.includes("EXCLUIDO")) {
    return {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    };
  }

  return {
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "text-gray-600 bg-gray-50 border-gray-100",
  };
};

const getEntityDotColor = (tipo: AtividadeEntidadeTipo | string) => {
  switch (tipo) {
    case AtividadeEntidadeTipo.COBRANCA: return "bg-blue-500 shadow-blue-200";
    case AtividadeEntidadeTipo.PASSAGEIRO: return "bg-purple-500 shadow-purple-200";
    case AtividadeEntidadeTipo.VEICULO: return "bg-orange-500 shadow-orange-200";
    case AtividadeEntidadeTipo.ESCOLA: return "bg-indigo-500 shadow-indigo-200";
    case AtividadeEntidadeTipo.USUARIO: return "bg-emerald-500 shadow-emerald-200";
    case AtividadeEntidadeTipo.GASTO: return "bg-rose-500 shadow-rose-200";
    case AtividadeEntidadeTipo.CONTRATO: return "bg-blue-500 shadow-blue-200";
    default: return "bg-gray-400 shadow-gray-200";
  }
};

export function ActivityTimeline({ entidadeTipo, entidadeId, title, className, limit }: ActivityTimelineProps) {
  const { data: atividades, isLoading, isError } = useHistoricoByEntidade(entidadeTipo, entidadeId);

  const displayAtividades = limit ? atividades?.slice(0, limit) : atividades;

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-3 h-3 rounded-full mt-1.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/4 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        <AlertCircle className="w-8 h-8 text-rose-500/20 mb-2" />
        <p className="text-sm text-foreground/60 font-medium">Erro ao carregar histórico.</p>
      </div>
    );
  }

  if (!atividades || atividades.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem]", className)}>
        <Clock className="w-10 h-10 mb-3 text-gray-200" />
        <p className="text-sm text-foreground/50 font-medium">Nenhuma atividade registrada.</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {title && (
        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-foreground/40 mb-6 px-1 font-headline">
          {title}
        </h3>
      )}

      <div className="relative pl-6 space-y-1">
        {/* Continuous timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100" />

        <AnimatePresence initial={false}>
          {displayAtividades?.map((atividade, index) => {
            const styles = getActionStyles(atividade.acao);
            const showDateHeader = index === 0 || !isSameDay(new Date(atividade.created_at), new Date(displayAtividades[index - 1].created_at));

            return (
              <motion.div
                key={atividade.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="pb-3 last:pb-2"
              >
                {showDateHeader && (
                  <div className="relative -ml-6 mb-2 mt-2 first:mt-0">
                    <div className="inline-flex items-center gap-2 bg-transparent px-2 py-0.5 relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 font-headline">
                        {format(new Date(atividade.created_at), "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="relative">
                  {/* Dot */}
                  <div className={cn(
                    "absolute -left-[23px] top-[14px] w-2.5 h-2.5 rounded-full border-[2.5px] border-white z-10 shadow-sm",
                    getEntityDotColor(atividade.entidade_tipo)
                  )} />

                  {/* Content Card */}
                  <div className={cn(
                    "group flex flex-col gap-1.5 p-2.5 rounded-2xl transition-all duration-300",
                    "bg-white border border-gray-100/50 hover:border-gray-200/80 hover:shadow-soft-xl"
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 p-1.5 rounded-xl border transition-colors",
                          styles.color
                        )}>
                          {styles.icon}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-semibold text-foreground/90 leading-tight">
                            {atividade.descricao}
                          </span>
                          <span className="text-[10px] text-foreground/40 font-medium tracking-tight">
                            {format(new Date(atividade.created_at), "HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Details */}
                    {atividade.meta && (atividade.meta.valor || atividade.meta.campos || atividade.meta.motivo || atividade.meta.status) && (
                      <div className="mt-1 ml-9 overflow-hidden">
                        <div className="p-2.5 rounded-xl bg-gray-50/50 border border-gray-100/50 space-y-1.5">
                          {atividade.meta.valor && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-foreground/60 uppercase tracking-tighter">Valor</span>
                              <span className="text-[11px] font-semibold text-foreground/60 leading-none">R$ {atividade.meta.valor.toFixed(2)}</span>
                            </div>
                          )}
                          {atividade.meta.campos && (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Alterações</span>
                              <div className="flex flex-wrap gap-1">
                                {atividade.meta.campos.map((campo: string) => (
                                  <span key={campo} className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100/50 text-amber-900 border border-amber-200/50 font-medium">
                                    {campo}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {atividade.meta.motivo && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter">Motivo</span>
                              <p className="text-[11px] text-rose-900 italic font-medium leading-tight">"{atividade.meta.motivo}"</p>
                            </div>
                          )}
                          {atividade.meta.status && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Status</span>
                              <span className="text-[11px] font-bold text-blue-900">{atividade.meta.status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
