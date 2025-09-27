import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  formatCobrancaOrigem,
  formatDateTimeToBR,
  formatDateToBR,
  formatPaymentType,
  getStatusColor,
  getStatusText
} from "@/utils/formatters";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
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

export default function PassageiroCobranca() {
  const navigate = useNavigate();
  const params = useParams();
  const { passageiro_id, cobranca_id } = params as {
    passageiro_id: string;
    cobranca_id: string;
  };

  const [cobranca, setCobranca] = useState<CobrancaDetalhe | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("vw_cobrancas_detalhes")
        .select("*")
        .eq("cobranca_id", cobranca_id)
        .single();

      if (error || !data) {
        navigate("/dashboard");
        return;
      }
      setCobranca(data as CobrancaDetalhe);
    };
    fetchData();
  }, [cobranca_id, navigate]);

  if (!cobranca) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Mensalidade
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default">Ações</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              disabled={cobranca.status === "pago"}
              onClick={() => toast({ title: "Registrar pagamento" })}
            >
              Registrar Pagamento
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={
                cobranca.status !== "pago" || !cobranca.pagamento_manual
              }
              onClick={() => toast({ title: "Desfazer pagamento" })}
            >
              Desfazer Pagamento
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={
                cobranca.status === "pago" || cobranca.origem === "manual"
              }
              onClick={() => toast({ title: "Reenviar mensalidade" })}
            >
              Reenviar Notificação
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={
                cobranca.status === "pago" || cobranca.origem === "manual"
              }
              onClick={() => toast({ title: "Toggle Lembretes" })}
            >
              {cobranca.desativar_lembretes
                ? "Ativar Lembretes"
                : "Desativar Lembretes"}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={
                cobranca.status === "pago" || cobranca.origem === "automatica"
              }
              className="text-red-600"
              onClick={() => toast({ title: "Excluir mensalidade" })}
            >
              Excluir Mensalidade
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status e Valor */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Mensalidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {cobranca.valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                cobranca.status,
                cobranca.data_vencimento
              )}`}
            >
              {getStatusText(cobranca.status, cobranca.data_vencimento)}
            </span>
          </div>
          <p>
            <strong>Vencimento:</strong>{" "}
            {formatDateToBR(cobranca.data_vencimento)}
          </p>
        </CardContent>
      </Card>

      {/* Detalhes do Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Origem:</strong> {formatCobrancaOrigem(cobranca.origem)}
          </p>
          <p>
            <strong>Lembretes Automáticos:</strong>{" "}
            {cobranca.desativar_lembretes ? "Ativo" : "Inativo"}
          </p>
          <p>
            <strong>Pagamento Manual:</strong>{" "}
            {cobranca.pagamento_manual ? "Sim" : "Não"}
          </p>
          <p>
            <strong>Forma de Pagamento:</strong>{" "}
            {formatPaymentType(cobranca.tipo_pagamento)}
          </p>
          <p>
            <strong>Data do Pagamento:</strong>{" "}
            {cobranca.data_pagamento
              ? formatDateTimeToBR(cobranca.data_pagamento, {
                  includeTime: true,
                })
              : "-"}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              asChild
              disabled={!cobranca.asaas_invoice_url}
              variant="secondary"
            >
              <a
                href={cobranca.asaas_invoice_url || "#"}
                target="_blank"
                rel="noreferrer"
              >
                Abrir Cobrança
              </a>
            </Button>
            <Button
              asChild
              disabled={!cobranca.asaas_bankslip_url}
              variant="secondary"
            >
              <a
                href={cobranca.asaas_bankslip_url || "#"}
                target="_blank"
                rel="noreferrer"
              >
                Baixar Boleto
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Passageiro e Responsável */}
      <Card>
        <CardHeader>
          <CardTitle>Passageiro e Responsável</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Passageiro:</strong> {cobranca.passageiro_nome}
          </p>
          <p>
            <strong>Escola:</strong> {cobranca.escola_nome}
          </p>
          <p>
            <strong>Responsável:</strong> {cobranca.nome_responsavel}
          </p>
          <p>
            <strong>Telefone:</strong> {cobranca.telefone_responsavel || "-"}
          </p>
          <Button
            className="mt-2 bg-green-600 hover:bg-green-700 text-white"
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
        </CardContent>
      </Card>
    </div>
  );
}
