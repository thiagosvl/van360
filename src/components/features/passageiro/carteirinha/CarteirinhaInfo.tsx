import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { formatarEnderecoCompleto } from "@/utils/formatters/address";
import { formatPeriodo } from "@/utils/formatters/periodo";
import { formatarTelefone } from "@/utils/formatters/phone";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  BotOff,
  CalendarDays,
  Car,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  HeartPulse,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  School,
  Trash2,
  User,
  UserCheck
} from "lucide-react";
import { useRef, useState } from "react";
import { InfoItem } from "./InfoItem";

interface CarteirinhaInfoProps {
  passageiro: Passageiro;
  plano?: { IsProfissionalPlan?: boolean } | null;
  temCobrancasVencidas?: boolean;
  isCopiedEndereco: boolean;
  isCopiedTelefone: boolean;
  onEditClick: () => void;
  onCopyToClipboard: (text: string, label: string) => void;
  onToggleCobrancaAutomatica: () => void;
  onToggleClick: (statusAtual: boolean) => void;
  onDeleteClick: () => void;
  onUpgrade: (featureName: string, description: string) => void;
  onReactivateWithoutAutomation: () => void;
}

export const CarteirinhaInfo = ({
  passageiro,
  plano,
  temCobrancasVencidas = false,
  isCopiedEndereco,
  isCopiedTelefone,
  onEditClick,
  onCopyToClipboard,
  onToggleCobrancaAutomatica,
  onToggleClick,
  onDeleteClick,
  onUpgrade,
  onReactivateWithoutAutomation,
}: CarteirinhaInfoProps) => {
  const [mostrarMaisInfo, setMostrarMaisInfo] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleToggleClickInternal = async () => {
      try {
          await onToggleClick(passageiro.ativo);
      } catch (error: any) {
          // Captura o erro específico de limite vindo do backend ou do wrapper
          if (error.message?.includes("LIMIT_EXCEEDED_AUTOMATION") || 
              error.response?.data?.error?.includes("LIMIT_EXCEEDED_AUTOMATION")) {
              setShowLimitDialog(true);
          } else {
              throw error; // Re-throw para o tratamento padrão (toast de erro genérico)
          }
      }
  };

  const hasCobrancaAutomaticaAccess = canUseCobrancaAutomatica(plano as any);

  const handleCobrancaAutomaticaClick = () => {
    if (hasCobrancaAutomaticaAccess) {
      // Usuário tem permissão: executa a ação normal
      onToggleCobrancaAutomatica();
    } else {
      // Usuário não tem permissão: chama função de upgrade do pai
      onUpgrade(
        "Cobrança Automática",
        "A Cobrança Automática envia as faturas e lembretes sozinha. Automatize sua rotina com o Plano Profissional."
      );
    }
  };

  const handleToggleDetails = () => {
    setMostrarMaisInfo(!mostrarMaisInfo);
    if (!mostrarMaisInfo) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  };

  // Informações adicionais (ocultas por padrão)
  const infoAdicionais = [
    {
      icon: Phone,
      label: "WhatsApp",
      content: (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {formatarTelefone(passageiro.telefone_responsavel)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            title={isCopiedTelefone ? "Telefone copiado!" : "Copiar Telefone"}
            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 shrink-0"
            onClick={() =>
              onCopyToClipboard(
                formatarTelefone(passageiro.telefone_responsavel),
                "Telefone"
              )
            }
          >
            {isCopiedTelefone ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      ),
    },
    {
      icon: MapPin,
      label: "Endereço",
      content: (
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-start justify-between gap-2 w-full">
            <span
              className="text-sm leading-snug break-words"
              title={formatarEnderecoCompleto(passageiro)}
            >
              {formatarEnderecoCompleto(passageiro)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              title={isCopiedEndereco ? "Endereço copiado!" : "Copiar Endereço"}
              className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 shrink-0"
              onClick={() => {
                const passageiroSemReferencia = {
                  ...passageiro,
                  referencia: "",
                };
                onCopyToClipboard(
                  formatarEnderecoCompleto(passageiroSemReferencia),
                  "Endereço"
                );
              }}
            >
              {isCopiedEndereco ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ),
    },
    {
      icon: Car,
      label: "Veículo",
      content:
        formatarPlacaExibicao(passageiro.veiculo?.placa) || "Não informado",
    },
    {
      icon: CalendarDays,
      label: "Data de Vencimento",
      content: `Todo dia ${passageiro.dia_vencimento}`,
    },
    {
      icon: Mail,
      label: "E-mail",
      content: passageiro.email_responsavel || "Não informado",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 bg-white">
        {/* Header com Gradiente e Avatar */}
        <div
          className={cn(
            "relative h-20 sm:26 lg:h-32",
            passageiro.ativo
              ? "bg-gradient-to-r from-green-600 via-blue-600 to-blue-600"
              : "bg-gradient-to-r from-red-600 via-blue-600 to-blue-600"
          )}
        >
          <div className="absolute -bottom-12 left-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className={cn(
                "h-24 w-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center relative",
                passageiro.ativo
                  ? "ring-2 ring-green-500 ring-offset-2"
                  : "ring-2 ring-red-500 ring-offset-2"
              )}
            >
              <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <div
                className={cn(
                  "absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white",
                  passageiro.ativo ? "bg-green-500" : "bg-red-500"
                )}
                title={passageiro.ativo ? "Ativo" : "Desativado"}
              />
            </motion.div>
          </div>

          {/* Ações Rápidas no Topo (Desktop) */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
              onClick={onEditClick}
              title="Editar Cadastro"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="pt-14 pb-6 px-6 relative">
          {/* Identidade Principal */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {passageiro.nome}
                </h2>
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1 mt-1">
                  {passageiro.nome_responsavel}
                </p>
              </div>
              {/* Indicador de Cobranças Vencidas */}
              {temCobrancasVencidas && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="shrink-0 absolute top-5 lg:-top-3.5 right-4"
                >
                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-sm shadow-sm">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold whitespace-nowrap">
                      Em atraso
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Grid de Informações Chave */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <HeartPulse className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Status
                </span>
              </div>
              <div>
                <Badge
                  variant={passageiro.ativo ? "default" : "destructive"}
                  className={cn(
                    "px-2 py-0.5 text-xs font-semibold shadow-none",
                    passageiro.ativo
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  )}
                >
                  {passageiro.ativo ? "ATIVO" : "DESATIVADO"}
                </Badge>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <School className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Escola
                </span>
              </div>
              <p
                className="font-semibold text-gray-900 text-sm sm:text-base"
                title={passageiro.escola?.nome}
              >
                {passageiro.escola?.nome || "—"}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Período
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {formatPeriodo(passageiro.periodo)}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Valor
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {passageiro.valor_cobranca.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>

          {/* Botões de Ação Sempre Visíveis */}
          {passageiro.enviar_cobranca_automatica && (
            <div className="mb-4 flex items-center gap-3 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 ">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                    Cobrança Automática Ativa
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2 mb-6">
            {/* Botão de Cobrança Automática - Sempre visível */}
            {passageiro.enviar_cobranca_automatica ? (
              <Button
                variant="ghost"
                disabled={!passageiro.ativo && hasCobrancaAutomaticaAccess}
                className="w-full pl-0 text-muted-foreground hover:bg-transparent hover:text-primary justify-start"
                onClick={handleCobrancaAutomaticaClick}
              >
                <BotOff className="h-4 w-4 mr-2" />
                Pausar Cobrança Automática
              </Button>
            ) : (
              <Button
                variant="ghost"
                disabled={!passageiro.ativo && hasCobrancaAutomaticaAccess}
                className="w-full pl-0 text-muted-foreground hover:bg-transparent hover:text-primary justify-start"
                onClick={handleCobrancaAutomaticaClick}
              >
                <Bot className="h-4 w-4 mr-2" />
                Ativar Cobrança Automática
              </Button>
            )}

          {passageiro.ativo ? (
              <Button
                variant="ghost"
                className="w-full pl-0 text-muted-foreground hover:bg-transparent hover:text-primary justify-start"
                onClick={handleToggleClickInternal}
              >
                <Lock className="h-4 w-4 mr-2" />
                Desativar Passageiro
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full pl-0 text-muted-foreground hover:bg-transparent hover:text-primary justify-start"
                onClick={handleToggleClickInternal}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Reativar Passageiro
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full pl-0 text-red-400 hover:text-red-600 hover:bg-transparent justify-start"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Passageiro
            </Button>
          </div>

          {/* Informações Expansíveis */}
          <div className="border-t border-gray-100 pt-4" ref={cardRef}>
            <Button
              variant="ghost"
              className="w-full flex justify-between items-center text-muted-foreground hover:text-primary hover:bg-transparent p-0 h-auto group"
              onClick={handleToggleDetails}
            >
              <span className="text-sm font-medium">
                {mostrarMaisInfo ? "Ocultar detalhes" : "Ver mais detalhes"}
              </span>
              {mostrarMaisInfo ? (
                <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              )}
            </Button>

            <AnimatePresence>
              {mostrarMaisInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    {infoAdicionais.map((info, index) => (
                      <InfoItem key={index} icon={info.icon} label={info.label}>
                        {info.content}
                      </InfoItem>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limite de Automação Atingido</AlertDialogTitle>
            <AlertDialogDescription>
              Você atingiu o limite de cobranças automáticas do seu plano.
              <br /><br />
              Para reativar este passageiro, você pode:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                    onUpgrade("Limite de Automação", "Aumente seu limite para continuar usando a automação.");
                    setShowLimitDialog(false);
                }}
            >
              Aumentar Limites (Upgrade)
            </AlertDialogAction>
            <AlertDialogAction 
                className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 mt-2 sm:mt-0"
                onClick={async () => {
                    await onReactivateWithoutAutomation();
                    setShowLimitDialog(false);
                }}
            >
              Reativar sem Automação
            </AlertDialogAction>
            <AlertDialogCancel className="w-full mt-2 sm:mt-0">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
