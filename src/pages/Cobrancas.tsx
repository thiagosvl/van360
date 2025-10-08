import ConfirmationDialog from "@/components/ConfirmationDialog";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cobrancaService } from "@/services/cobrancaService";
import { Cobranca } from "@/types/cobranca";
import {
  disableDesfazerPagamento,
  disableEnviarNotificacao,
  disableRegistrarPagamento,
} from "@/utils/disableActions";
import {
  formatDateToBR,
  formatPaymentType,
  getStatusColor,
  getStatusText,
  meses,
} from "@/utils/formatters";
import {
  Archive,
  BellOff,
  CheckCircle2,
  MoreVertical,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ))}
  </div>
);

const Cobrancas = () => {
  const [cobrancasAbertas, setCobrancasAbertas] = useState<Cobranca[]>([]);
  const [cobrancasPagas, setCobrancasPagas] = useState<Cobranca[]>([]);
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(
    null
  );
  const [confirmDialogEnvioNotificacao, setConfirmDialogEnvioNotificacao] =
    useState({ open: false, cobranca: null });
  const [confirmDialogDesfazer, setConfirmDialogDesfazer] = useState({
    open: false,
    cobrancaId: "",
  });

  const [buscaAbertas, setBuscaAbertas] = useState("");
  const [buscaPagas, setBuscaPagas] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: 5 }, (_, i) =>
    (currentYear - i).toString()
  );

  const fetchCobrancas = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("cobrancas")
        .select(`*, passageiros (*)`)
        .eq("mes", mesFilter)
        .eq("ano", anoFilter)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .order("data_vencimento", { ascending: true });
      const cobrancas = (data as Cobranca[]) || [];
      const abertas = cobrancas.filter((c) => c.status !== "pago");
      const pagas = cobrancas.filter((c) => c.status === "pago");
      setCobrancasAbertas(abertas);
      setCobrancasPagas(pagas);
    } catch (error) {
      console.error("Erro ao buscar mensalidades:", error);
      toast({
        title: "Não foi possível carregar as mensalidades.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLembretes = async (cobranca: Cobranca) => {
    try {
      const novoStatus = await cobrancaService.toggleNotificacoes(cobranca);

      toast({
        title: `Notificações ${
          novoStatus ? "desativadas" : "ativadas"
        } com sucesso.`,
      });

      fetchCobrancas();
    } catch (error: any) {
      console.error("Erro ao alterar lembretes:", error);
      toast({
        title: "Erro ao alterar notificações.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    }
  };

  const enviarNotificacaoCobranca = async () => {
    try {
      await cobrancaService.enviarNotificacao(
        confirmDialogEnvioNotificacao.cobranca
      );
      toast({ title: "Notificação enviada com sucesso para o responsável" });
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      toast({ title: "Erro ao enviar mensalidade.", variant: "destructive" });
    }
    setConfirmDialogEnvioNotificacao({
      open: false,
      cobranca: null,
    });
  };

  const desfazerPagamento = async () => {
    try {
      await cobrancaService.desfazerPagamento(confirmDialogDesfazer.cobrancaId);

      toast({
        title: "Pagamento desfeito com sucesso.",
        description: "A mensalidade voltou para a lista de em aberto.",
      });
      fetchCobrancas();
    } catch (error: any) {
      console.error("Erro ao desfazer pagamento:", error);
      toast({
        title: "Erro ao desfazer pagamento.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setConfirmDialogDesfazer({ open: false, cobrancaId: "" });
    }
  };

  const openPaymentDialog = (cobranca: Cobranca) => {
    setSelectedCobranca(cobranca);
    setPaymentDialogOpen(true);
  };

  const navigateToDetails = (cobranca: Cobranca) => {
    navigate(
      `/passageiros/${cobranca.passageiros.id}/mensalidade/${cobranca.id}`
    );
  };

  useEffect(() => {
    fetchCobrancas();
    setBuscaAbertas("");
    setBuscaPagas("");
  }, [mesFilter, anoFilter]);

  const cobrancasAbertasFiltradas = useMemo(() => {
    if (!buscaAbertas) return cobrancasAbertas;
    const searchTerm = buscaAbertas.toLowerCase();
    return cobrancasAbertas.filter(
      (c) =>
        c.passageiros.nome.toLowerCase().includes(searchTerm) ||
        c.passageiros.nome_responsavel?.toLowerCase().includes(searchTerm)
    );
  }, [cobrancasAbertas, buscaAbertas]);

  const cobrancasPagasFiltradas = useMemo(() => {
    if (!buscaPagas) return cobrancasPagas;
    const searchTerm = buscaPagas.toLowerCase();
    return cobrancasPagas.filter(
      (c) =>
        c.passageiros.nome.toLowerCase().includes(searchTerm) ||
        c.passageiros.nome_responsavel?.toLowerCase().includes(searchTerm)
    );
  }, [cobrancasPagas, buscaPagas]);

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Mensalidades
          </h1>
        </div>
        <Card className="mb-6">
          <CardContent className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mês</label>
                <Select
                  value={mesFilter.toString()}
                  onValueChange={(value) => setMesFilter(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {meses.map((mes, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ano</label>
                <Select
                  value={anoFilter.toString()}
                  onValueChange={(value) => setAnoFilter(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {anos.map((ano) => (
                      <SelectItem key={ano} value={ano}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="em-aberto" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="em-aberto"
              className="data-[state=inactive]:text-muted-foreground/80"
            >
              Em Aberto{" "}
              <Badge variant="destructive" className="ml-2">
                {cobrancasAbertas.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="pagas"
              className="data-[state=inactive]:text-muted-foreground/80"
            >
              Pagas{" "}
              <Badge variant="secondary" className="ml-2">
                {cobrancasPagas.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="em-aberto" className="mt-4">
            <Card>
              {cobrancasAbertas.length > 0 && (
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por passageiro ou responsável..."
                      className="pl-10"
                      value={buscaAbertas}
                      onChange={(e) => setBuscaAbertas(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4">
                    <ListSkeleton />
                  </div>
                ) : cobrancasAbertas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center px-2 py-12 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mb-4 text-gray-300" />
                    <p>
                      Tudo em dia! Não há mensalidades pendentes no mês
                      indicado.
                    </p>
                  </div>
                ) : cobrancasAbertasFiltradas.length === 0 ? (
                  <div className="text-center px-2 py-12 text-muted-foreground">
                    Nenhum passageiro ou responsável encontrado com o nome "
                    {buscaAbertas}".
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Passageiro
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Valor
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Vencimento
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Status
                            </th>
                            <th className="p-3 text-center text-xs font-medium text-gray-600">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {cobrancasAbertasFiltradas.map((cobranca) => (
                            <tr
                              key={cobranca.id}
                              onClick={() => navigateToDetails(cobranca)}
                              className="hover:bg-muted/50 cursor-pointer"
                            >
                              <td className="p-3 align-top">
                                <div className="font-medium text-sm text-gray-900">
                                  {cobranca.passageiros.nome}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Responsável:{" "}
                                  {cobranca.passageiros.nome_responsavel || "-"}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <div className="text-sm">
                                  {Number(cobranca.valor).toLocaleString(
                                    "pt-BR",
                                    { style: "currency", currency: "BRL" }
                                  )}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <div className="text-sm">
                                  {formatDateToBR(cobranca.data_vencimento)}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <span
                                  className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${getStatusColor(
                                    cobranca.status,
                                    cobranca.data_vencimento
                                  )}`}
                                >
                                  {getStatusText(
                                    cobranca.status,
                                    cobranca.data_vencimento
                                  )}
                                </span>
                                {cobranca.desativar_lembretes &&
                                  cobranca.status !== "pago" && (
                                    <div className="text-xs text-yellow-800 mt-2 flex items-center gap-1">
                                      <BellOff className="w-3 h-3" />
                                      Notificações automáticas suspensas
                                    </div>
                                  )}
                              </td>
                              <td className="p-3 text-center align-top">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  disabled={disableEnviarNotificacao(cobranca)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDialogEnvioNotificacao({
                                      open: true,
                                      cobranca,
                                    });
                                  }}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigateToDetails(cobranca);
                                      }}
                                    >
                                      Ver Mensalidade
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/passageiros/${cobranca.passageiro_id}`
                                        );
                                      }}
                                    >
                                      Ver Carteirinha
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      disabled={disableRegistrarPagamento(
                                        cobranca
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPaymentDialog(cobranca);
                                      }}
                                    >
                                      Registrar Pagamento
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      disabled={disableEnviarNotificacao(
                                        cobranca
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDialogEnvioNotificacao({
                                          open: true,
                                          cobranca,
                                        });
                                      }}
                                    >
                                      Enviar Notificação
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      disabled={disableEnviarNotificacao(
                                        cobranca
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleLembretes(cobranca);
                                      }}
                                    >
                                      {cobranca.desativar_lembretes
                                        ? "Ativar Notificações"
                                        : "Desativar Notificações"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="md:hidden divide-y divide-gray-200">
                      {cobrancasAbertasFiltradas.map((cobranca) => (
                        <div
                          key={cobranca.id}
                          onClick={() => navigateToDetails(cobranca)}
                          className="p-4 active:bg-muted/50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="pr-2">
                              <div className="font-semibold text-gray-800">
                                {cobranca.passageiros.nome}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Responsável:{" "}
                                {cobranca.passageiros.nome_responsavel || "-"}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigateToDetails(cobranca);
                                  }}
                                >
                                  Ver Mensalidade
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/passageiros/${cobranca.passageiro_id}`
                                    );
                                  }}
                                >
                                  Ver Carteirinha
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={disableRegistrarPagamento(cobranca)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPaymentDialog(cobranca);
                                  }}
                                >
                                  Registrar Pagamento
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={disableEnviarNotificacao(cobranca)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDialogEnvioNotificacao({
                                      open: true,
                                      cobranca,
                                    });
                                  }}
                                >
                                  Enviar Notificação
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={disableEnviarNotificacao(cobranca)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleLembretes(cobranca);
                                  }}
                                >
                                  {cobranca.desativar_lembretes
                                    ? "Ativar Notificações"
                                    : "Desativar Notificações"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="block text-xs text-muted-foreground">
                                Vencimento:{" "}
                              </span>
                              <span className="font-semibold">
                                {formatDateToBR(cobranca.data_vencimento)}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                cobranca.status,
                                cobranca.data_vencimento
                              )}`}
                            >
                              {getStatusText(
                                cobranca.status,
                                cobranca.data_vencimento
                              )}
                            </span>
                          </div>
                          <div className="text-right text-muted-foreground text-sm mb-3">
                            {Number(cobranca.valor).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </div>
                          {cobranca.desativar_lembretes &&
                            cobranca.status !== "pago" && (
                              <div className="mt-2 flex items-center gap-2 text-xs p-2 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                                <BellOff className="h-4 w-4 shrink-0" />
                                <span>Notificações automáticas suspensas</span>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagas" className="mt-4">
            <Card>
              {cobrancasPagas.length > 0 && (
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por passageiro ou responsável..."
                      className="pl-10"
                      value={buscaPagas}
                      onChange={(e) => setBuscaPagas(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4">
                    <ListSkeleton />
                  </div>
                ) : cobrancasPagas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                    <Archive className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Nenhum pagamento registrado no mês indicado</p>
                  </div>
                ) : cobrancasPagasFiltradas.length === 0 ? (
                  <div className="text-center px-2 py-12 text-muted-foreground">
                    Nenhum passageiro ou responsável encontrado com o nome "
                    {buscaPagas}".
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Passageiro
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Pagou em
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Valor
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-gray-600">
                              Forma de Pagamento
                            </th>
                            <th className="p-3 text-center text-xs font-medium text-gray-600">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {cobrancasPagasFiltradas.map((cobranca) => (
                            <tr
                              key={cobranca.id}
                              onClick={() => navigateToDetails(cobranca)}
                              className="hover:bg-muted/50 cursor-pointer"
                            >
                              <td className="p-3 align-top">
                                <div className="font-medium text-sm text-gray-900">
                                  {cobranca.passageiros.nome}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {cobranca.passageiros.nome_responsavel || "-"}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <div className="text-sm">
                                  {cobranca.data_pagamento
                                    ? formatDateToBR(cobranca.data_pagamento)
                                    : "-"}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <div className="text-sm">
                                  {Number(cobranca.valor).toLocaleString(
                                    "pt-BR",
                                    { style: "currency", currency: "BRL" }
                                  )}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <div className="text-sm">
                                  {formatPaymentType(cobranca.tipo_pagamento)}
                                </div>
                                {cobranca.pagamento_manual && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Pagamento registrado manualmente
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center align-top">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigateToDetails(cobranca);
                                      }}
                                    >
                                      Ver Mensalidade
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/passageiros/${cobranca.passageiro_id}`
                                        );
                                      }}
                                    >
                                      Ver Carteirinha
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      disabled={disableDesfazerPagamento(
                                        cobranca
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDialogDesfazer({
                                          open: true,
                                          cobrancaId: cobranca.id,
                                        });
                                      }}
                                    >
                                      Desfazer Pagamento
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="md:hidden divide-y divide-gray-200">
                      {cobrancasPagasFiltradas.map((cobranca) => (
                        <div
                          key={cobranca.id}
                          onClick={() => navigateToDetails(cobranca)}
                          className="p-4 active:bg-muted/50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="pr-2">
                              <div className="font-semibold text-gray-800">
                                {cobranca.passageiros.nome}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Responsável:{" "}
                                {cobranca.passageiros.nome_responsavel || "-"}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigateToDetails(cobranca);
                                  }}
                                >
                                  Ver Mensalidade
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/passageiros/${cobranca.passageiro_id}`
                                    );
                                  }}
                                >
                                  Ver Carteirinha
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={disableDesfazerPagamento(cobranca)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDialogDesfazer({
                                      open: true,
                                      cobrancaId: cobranca.id,
                                    });
                                  }}
                                >
                                  Desfazer Pagamento
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Pagou em</span>
                              <span className="font-medium">
                                {cobranca.data_pagamento
                                  ? formatDateToBR(cobranca.data_pagamento)
                                  : "-"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Valor</span>
                              <span className="font-medium">
                                {Number(cobranca.valor).toLocaleString(
                                  "pt-BR",
                                  { style: "currency", currency: "BRL" }
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Forma</span>
                              <span className="font-medium">
                                {formatPaymentType(cobranca.tipo_pagamento)}
                              </span>
                            </div>
                          </div>
                          {cobranca.pagamento_manual && (
                            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                              Pagamento registrado manualmente
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedCobranca && (
        <ManualPaymentDialog
          isOpen={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          cobrancaId={selectedCobranca.id}
          passageiroNome={selectedCobranca.passageiros.nome}
          valorOriginal={Number(selectedCobranca.valor)}
          onPaymentRecorded={() => {
            setPaymentDialogOpen(false);
            fetchCobrancas();
          }}
        />
      )}
      <ConfirmationDialog
        open={confirmDialogEnvioNotificacao.open}
        onOpenChange={(open) =>
          setConfirmDialogEnvioNotificacao({
            open,
            cobranca: null,
          })
        }
        title="Enviar Notificação"
        description="Deseja enviar esta notificação para o responsável?"
        onConfirm={enviarNotificacaoCobranca}
      />
      <ConfirmationDialog
        open={confirmDialogDesfazer.open}
        onOpenChange={(open) =>
          setConfirmDialogDesfazer({ open, cobrancaId: "" })
        }
        title="Desfazer Pagamento"
        description="Deseja realmente desfazer o pagamento desta mensalidade? Essa ação moverá a mensalidade de volta para a lista de em aberto."
        onConfirm={desfazerPagamento}
        variant="destructive"
        confirmText="Desfazer Pagamento"
      />
    </div>
  );
};

export default Cobrancas;
