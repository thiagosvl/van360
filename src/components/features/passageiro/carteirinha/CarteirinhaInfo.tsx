import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { formatarEnderecoCompleto } from "@/utils/formatters/address";
import { formatPeriodo } from "@/utils/formatters/periodo";
import { formatarTelefone } from "@/utils/formatters/phone";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  BellOff,
  CalendarDays,
  Car,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  HeartPulse,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  School,
  Trash2,
  User,
  Zap,
  ZapOff
} from "lucide-react";
import { useRef, useState } from "react";
import { InfoItem } from "./InfoItem";

interface CarteirinhaInfoProps {
  passageiro: Passageiro;
  plano?: { isCompletePlan?: boolean } | null;
  temCobrancasVencidas?: boolean;
  isCopiedEndereco: boolean;
  isCopiedTelefone: boolean;
  onEditClick: () => void;
  onCopyToClipboard: (text: string, label: string) => void;
  onToggleCobrancaAutomatica: () => void;
  onToggleClick: (statusAtual: boolean) => void;
  onDeleteClick: () => void;
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
}: CarteirinhaInfoProps) => {
  const [mostrarMaisInfo, setMostrarMaisInfo] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
        formatarPlacaExibicao(passageiro.veiculos?.placa) || "Não informado",
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
        <div className="relative h-20 sm:26 lg:h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
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

        <CardContent className="pt-14 pb-6 px-6">
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
                  className="shrink-0"
                >
                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-lg shadow-sm">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold whitespace-nowrap">Em atraso</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Grid de Informações Chave */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <School className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Escola
                </span>
              </div>
              <p
                className="font-semibold text-gray-900 text-sm sm:text-base"
                title={passageiro.escolas?.nome}
              >
                {passageiro.escolas?.nome || "—"}
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
          </div>

          {/* Barra de Contato Rápido */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant="ghost"
              className="flex-1 min-w-[140px] border text-green-500 border-green-500 hover:bg-green-100 hover:text-green-700 shadow-sm"
              disabled={!passageiro.telefone_responsavel}
              onClick={() =>
                window.open(
                  `https://wa.me/${passageiro.telefone_responsavel}`,
                  "_blank"
                )
              }
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {/* Botões de Ação Sempre Visíveis */}
          <div className="space-y-2 mb-6">
            {plano?.isCompletePlan &&
              (passageiro.enviar_cobranca_automatica ? (
                <Button
                  variant="ghost"
                  disabled={!passageiro.ativo}
                  className="w-full pl-0 text-muted-foreground hover:bg-transparent hover:text-primary justify-start"
                  onClick={onToggleCobrancaAutomatica}
                >
                  <BellOff className="h-4 w-4 mr-2" />
                  Pausar Lembretes Automáticos
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  disabled={!passageiro.ativo}
                  className="w-full pl-0 text-muted-foreground hover:bg-transparent hover:text-primary justify-start"
                  onClick={onToggleCobrancaAutomatica}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Reativar Lembretes Automáticos
                </Button>
              ))}

            {passageiro.ativo ? (
              <Button
                variant="ghost"
                className="w-full pl-0 text-muted-foreground hover:bg-transparent hover:text-primary justify-start"
                onClick={() => onToggleClick(passageiro.ativo)}
              >
                <ZapOff className="h-4 w-4 mr-2" />
                Desativar Passageiro
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full pl-0 text-muted-foreground hover:bg-transparent hover:text-primary justify-start"
                onClick={() => onToggleClick(passageiro.ativo)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Reativar Passageiro
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full pl-0 text-red-500 hover:bg-transparent hover:text-red-700 justify-start"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Cadastro
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
    </motion.div>
  );
};
