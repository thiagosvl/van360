import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistoricoByEntidade } from "@/hooks/api/useHistorico";
import { cn } from "@/lib/utils";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { format } from "date-fns";
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
  TrendingDown,
  TrendingUp
} from "lucide-react";

interface ActivityTimelineProps {
  entidadeTipo: AtividadeEntidadeTipo | string;
  entidadeId: string;
  title?: string;
  className?: string;
  limit?: number;
}

const getActionIcon = (acao: string | AtividadeAcao) => {
  // Verificações específicas com Enum para evitar magic strings
  switch (acao) {
    case AtividadeAcao.BAIXA_BANCARIA:
      return <CreditCard className="w-4 h-4 text-emerald-500" />;
    case AtividadeAcao.PAGAMENTO_MANUAL:
    case AtividadeAcao.ASSINATURA_PAGAMENTO:
      return <CreditCard className="w-4 h-4 text-blue-500" />;
    case AtividadeAcao.PAGAMENTO_REVERTIDO:
      return <RefreshCcw className="w-4 h-4 text-orange-500" />;
    case AtividadeAcao.CONTRATO_GERADO:
      return <FileText className="w-4 h-4 text-blue-500" />;
    case AtividadeAcao.CONTRATO_ASSINADO:
      return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    case AtividadeAcao.ASSINATURA_UPGRADE:
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    case AtividadeAcao.ASSINATURA_DOWNGRADE:
      return <TrendingDown className="w-4 h-4 text-rose-500" />;
    case AtividadeAcao.NOTIFICACAO_WHATSAPP:
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
  }

  // Fallbacks genéricos baseados em padrões de nomenclatura
  if (acao.includes("CRIADA") || acao.includes("CRIADO") || acao.includes("REGISTRADO") || acao.includes("GERADO")) return <PlusCircle className="w-4 h-4" />;
  if (acao.includes("EDITADA") || acao.includes("EDITADO") || acao.includes("ALTERADA")) return <Edit className="w-4 h-4" />;
  if (acao.includes("EXCLUIDA") || acao.includes("EXCLUIDO")) return <Trash2 className="w-4 h-4 text-destructive" />;
  
  return <Clock className="w-4 h-4" />;
};

const getEntityColor = (tipo: AtividadeEntidadeTipo | string) => {
  switch (tipo) {
    case AtividadeEntidadeTipo.COBRANCA: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case AtividadeEntidadeTipo.PASSAGEIRO: return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case AtividadeEntidadeTipo.VEICULO: return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case AtividadeEntidadeTipo.ESCOLA: return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    case AtividadeEntidadeTipo.USUARIO: return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case AtividadeEntidadeTipo.GASTO: return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case AtividadeEntidadeTipo.ASSINATURA: return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case AtividadeEntidadeTipo.CONTRATO: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

export function ActivityTimeline({ entidadeTipo, entidadeId, title, className, limit }: ActivityTimelineProps) {
  const { data: atividades, isLoading, isError } = useHistoricoByEntidade(entidadeTipo, entidadeId);

  const displayAtividades = limit ? atividades?.slice(0, limit) : atividades;

  if (isLoading) {
    return (
      <Card className={cn("p-4 space-y-4", className)}>
        {title && <h3 className="font-semibold text-sm mb-4">{title}</h3>}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={cn("p-4 text-center", className)}>
        <p className="text-sm text-muted-foreground">Erro ao carregar histórico.</p>
      </Card>
    );
  }

  if (!atividades || atividades.length === 0) {
    return (
      <Card className={cn("p-6 text-center border-dashed", className)}>
        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-20" />
        <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {title && <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 px-1">{title}</h3>}
      
      <div className="relative pl-4 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
        <AnimatePresence initial={false}>
          {displayAtividades?.map((atividade, index) => (
            <motion.div 
              key={atividade.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {/* Dot */}
              <div className={cn(
                "absolute -left-[14px] top-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center z-10",
                getEntityColor(atividade.entidade_tipo).split(' ')[0]
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", getEntityColor(atividade.entidade_tipo).split(' ')[1])} />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-muted/50 border border-border/50">
                      {getActionIcon(atividade.acao)}
                    </span>
                    <span className="text-sm font-medium leading-tight">
                      {atividade.descricao}
                    </span>
                  </div>
                  <time className="text-[10px] whitespace-nowrap text-muted-foreground font-mono">
                    {format(new Date(atividade.created_at), "HH:mm", { locale: ptBR })}
                  </time>
                </div>

                {/* Meta details (opcional) */}
                {atividade.meta && (
                  <div className="ml-8 text-[11px] text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/30">
                     {atividade.meta.valor && (
                       <span className="block font-medium">Valor: R$ {atividade.meta.valor.toFixed(2)}</span>
                     )}
                     {atividade.meta.plano && (
                       <span className="block">Plano: <span className="text-foreground">{atividade.meta.plano}</span></span>
                     )}
                     {atividade.meta.franquia && (
                       <span className="block">Limite: <span className="text-foreground">{atividade.meta.franquia} passageiros</span></span>
                     )}
                     {atividade.meta.campos && (
                       <span className="block">Alterações: <span className="text-foreground italic">{atividade.meta.campos.join(', ')}</span></span>
                     )}
                     {atividade.meta.tipo_evento && (
                       <span className="block">Evento: <span className="text-foreground">{atividade.meta.tipo_evento}</span></span>
                     )}
                     {atividade.meta.placa && (
                       <span className="block italic">Veículo: {atividade.meta.placa}</span>
                     )}
                     {atividade.meta.categoria && (
                       <span className="block italic text-blue-500">{atividade.meta.categoria}</span>
                     )}
                     {atividade.meta.motivo && (
                       <span className="block italic">Motivo: {atividade.meta.motivo}</span>
                     )}
                     {atividade.meta.status && (
                       <span className="block">Status: {atividade.meta.status}</span>
                     )}
                  </div>
                )}

                <div className="ml-8 flex items-center gap-2">
                   <time className="text-[10px] text-muted-foreground">
                    {format(new Date(atividade.created_at), "dd 'de' MMMM", { locale: ptBR })}
                  </time>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
