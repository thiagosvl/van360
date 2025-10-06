import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  formatCobrancaOrigem,
  formatDateTimeToBR,
  formatDateToBR,
  formatPaymentType,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BellOff,
  Calendar,
  Contact,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  IdCard,
  MessageCircle,
  School,
  Send,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface CobrancaDetalhe {
  cobranca_id: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  tipo_pagamento: string | null;
  status: "pago" | "pendente";
  desativar_lembretes: boolean;
  passageiro_id: string;
  passageiro_nome: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  asaas_bankslip_url: string | null;
  asaas_invoice_url: string | null;
  cpf_responsavel: string;
  escola_id: string;
  origem: string;
  pagamento_manual: boolean;
  escola_nome: string;
}

const InfoItem = ({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <div className="text-sm text-muted-foreground flex items-center gap-1.5">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="font-semibold text-foreground mt-1">{children || "-"}</div>
  </div>
);

const CobrancaDetalheSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <Skeleton className="lg:col-span-3 h-32 w-full" />
      <Skeleton className="lg:col-span-2 h-64 w-full" />
      <Skeleton className="lg:col-span-1 h-64 w-full" />
    </div>
  </div>
);

export default function PassageiroCobranca() {
  const navigate = useNavigate();
  const params = useParams();
  const { passageiro_id, cobranca_id } = params as {
    passageiro_id: string;
    cobranca_id: string;
  };
  const [loading, setLoading] = useState(true);
  const [cobranca, setCobranca] = useState<CobrancaDetalhe | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Garante que o loading seja exibido em re-fetches
      try {
        const { data, error } = await supabase
          .from("vw_cobrancas_detalhes")
          .select("*")
          .eq("cobranca_id", cobranca_id)
          .single();
        if (error || !data) {
          toast({
            title: "Erro",
            description: "Mensalidade não encontrada.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }
        setCobranca(data as CobrancaDetalhe);
      } catch (error) {
        console.error("Erro ao buscar detalhes da cobrança:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cobranca_id, navigate, toast]);

  if (loading) return <CobrancaDetalheSkeleton />;

  if (!cobranca) return null;

  const handleAction = (title: string) => {
    toast({ title });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Detalhes da Mensalidade
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Card Principal de Status */}
        <Card className="lg:col-span-3 order-1">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Valor da Mensalidade
              </div>
              <div className="text-4xl font-bold tracking-tight">
                {cobranca.valor.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div className="text-muted-foreground mt-1">
                Vencimento em: {formatDateToBR(cobranca.data_vencimento)}
              </div>
              {cobranca.status !== "pago" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    cobranca.status,
                    cobranca.data_vencimento
                  )}`}
                >
                  {getStatusText(cobranca.status, cobranca.data_vencimento)}
                </span>
              )}
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              {cobranca.status === "pendente" ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => handleAction("Registrar Pagamento")}
                >
                  <BadgeCheck className="w-5 h-5 mr-2" /> Registrar Pagamento
                </Button>
              ) : cobranca.pagamento_manual ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAction("Desfazer Pagamento")}
                >
                  <XCircle className="w-5 h-5 mr-2" /> Desfazer Pagamento
                </Button>
              ) : (
                <div
                  className={`flex items-center justify-center px-4 py-2 rounded-md text-base font-medium ${getStatusColor(
                    cobranca.status,
                    cobranca.data_vencimento
                  )}`}
                >
                  {getStatusText(cobranca.status, cobranca.data_vencimento)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do Pagamento */}
        <Card className="lg:col-span-2 order-3 lg:order-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalhes da Transação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/50">
              <InfoItem icon={CreditCard} label="Forma de Pagamento">
                {formatPaymentType(cobranca.tipo_pagamento)}
              </InfoItem>
              <InfoItem icon={Calendar} label="Data do Pagamento">
                {cobranca.data_pagamento
                  ? formatDateTimeToBR(cobranca.data_pagamento, {
                      includeTime: true,
                    })
                  : "-"}
              </InfoItem>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <InfoItem icon={Bell} label="Notificações no WhatsApp">
                {cobranca.desativar_lembretes ? "Desativadas" : "Ativadas"}
              </InfoItem>
              <InfoItem icon={ArrowRight} label="Origem">
                {formatCobrancaOrigem(cobranca.origem)}
              </InfoItem>
              <InfoItem icon={BadgeCheck} label="Pgto. Manual">
                {cobranca.pagamento_manual ? "Sim" : "Não"}
              </InfoItem>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
              <Button
                asChild
                disabled={!cobranca.asaas_invoice_url}
                variant="secondary"
                className="flex-1"
              >
                <a
                  href={cobranca.asaas_invoice_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Ver Página de
                  Pagamento
                </a>
              </Button>
              <Button
                asChild
                disabled={!cobranca.asaas_bankslip_url}
                variant="outline"
                className="flex-1"
              >
                <a
                  href={cobranca.asaas_bankslip_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="w-4 h-4 mr-2" /> Baixar Boleto
                </a>
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={
                cobranca.status === "pago" || cobranca.origem === "automatica"
              }
              onClick={() => handleAction("Excluir Mensalidade")}
            >
              <Trash2 className="w-3 h-3 mr-2" /> Excluir Mensalidade Manual
            </Button>
          </CardFooter>
        </Card>

        {/* Passageiro e Responsável */}
        <Card className="lg:col-span-1 order-2 lg:order-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contact className="w-5 h-5" />
              Contato e Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InfoItem icon={User} label="Passageiro">
              {cobranca.passageiro_nome}
            </InfoItem>
            <InfoItem icon={Contact} label="Responsável">
              {cobranca.nome_responsavel}
            </InfoItem>
            <InfoItem icon={School} label="Escola">
              {cobranca.escola_nome}
            </InfoItem>

            <div className="space-y-2 pt-6 border-t">
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  navigate(`/passageiros/${cobranca.passageiro_id}`)
                }
              >
                <IdCard className="h-4 w-4 mr-2" /> Ver Carteirinha Digital
              </Button>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!cobranca.telefone_responsavel}
                onClick={() =>
                  window.open(
                    `https://wa.me/${cobranca.telefone_responsavel?.replace(
                      /\D/g,
                      ""
                    )}`,
                    "_blank"
                  )
                }
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Enviar WhatsApp
              </Button>
              <Button
                className="w-full"
                variant="outline"
                disabled={
                  cobranca.status === "pago" || cobranca.origem === "manual"
                }
                onClick={() => handleAction("Enviar Notificação")}
              >
                <Send className="h-4 w-4 mr-2" /> Enviar Notificação
              </Button>
              <Button
                className="w-full"
                variant="outline"
                disabled={
                  cobranca.status === "pago" || cobranca.origem === "manual"
                }
                onClick={() => handleAction("Toggle Lembretes")}
              >
                {cobranca.desativar_lembretes ? (
                  <Bell className="h-4 w-4 mr-2" />
                ) : (
                  <BellOff className="h-4 w-4 mr-2" />
                )}
                {cobranca.desativar_lembretes
                  ? "Ativar Lembretes"
                  : "Desativar Lembretes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
