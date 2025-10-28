import CobrancaEditDialog from "@/components/CobrancaEditDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { LoadingOverlay } from "@/components/LoadingOverlay";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { cobrancaService } from "@/services/cobrancaService";
import { Cobranca } from "@/types/cobranca";
import { safeCloseDialog } from "@/utils/dialogCallback";
import {
  disableDesfazerPagamento,
  disableEnviarNotificacao,
  disableRegistrarPagamento,
} from "@/utils/disableActions";
import {
  anos,
  formatDateToBR,
  formatPaymentType,
  getStatusColor,
  getStatusText,
  meses,
} from "@/utils/formatters";
import {
  CheckCircle2,
  DollarSign,
  Inbox,
  MoreVertical,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cobrancaToEdit, setCobrancaToEdit] = useState<Cobranca | null>(null);
  const { setPageTitle, setPageSubtitle } = useLayout();
  const [searchParams, setSearchParams] = useSearchParams();
  const [todasCobrancas, setTodasCobrancas] = useState<Cobranca[]>([]);
  const [cobrancasAbertas, setCobrancasAbertas] = useState<Cobranca[]>([]);
  const [cobrancasPagas, setCobrancasPagas] = useState<Cobranca[]>([]);
  const [mesFilter, setMesFilter] = useState(() => {
    const mesParam = searchParams.get("mes");
    return mesParam ? Number(mesParam) : new Date().getMonth() + 1;
  });
  const [anoFilter, setAnoFilter] = useState(() => {
    const anoParam = searchParams.get("ano");
    return anoParam ? Number(anoParam) : new Date().getFullYear();
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const [buscaAbertas, setBuscaAbertas] = useState("");
  const [buscaPagas, setBuscaPagas] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchCobrancas = async (isRefresh = false) => {
    if (!profile?.id) return;

    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      const { data } = await supabase
        .from("cobrancas")
        .select(`*, passageiros (*)`)
        .eq("mes", mesFilter)
        .eq("ano", anoFilter)
        .eq("usuario_id", profile?.id)
        .order("data_vencimento", { ascending: true })
        .order("passageiros(nome)", { ascending: true });
      const cobrancas = (data as Cobranca[]) || [];
      const abertas = cobrancas.filter((c) => c.status !== "pago");
      const pagas = cobrancas.filter((c) => c.status === "pago");
      setTodasCobrancas(cobrancas);
      setCobrancasAbertas(abertas);
      setCobrancasPagas(pagas);
    } catch (error) {
      console.error("Erro ao buscar cobranças:", error);
      toast({
        title: "Não foi possível carregar as cobranças.",
        variant: "destructive",
      });
    } finally {
      if (!isRefresh) setLoading(false);
      else setRefreshing(false);
    }
  };

  const handleEditCobrancaClick = (cobranca: Cobranca) => {
    safeCloseDialog(() => {
      setCobrancaToEdit(cobranca);
      setEditDialogOpen(true);
    });
  };

  const handleCobrancaUpdated = () => {
    fetchCobrancas(true);
  };

  const handleToggleLembretes = async (cobranca: Cobranca) => {
    setRefreshing(true);
    try {
      const novoStatus = await cobrancaService.toggleNotificacoes(cobranca);

      toast({
        title: `Notificações automáticas ${
          novoStatus ? "desativadas" : "ativadas"
        } com sucesso.`,
      });

      fetchCobrancas(true);
    } catch (error: any) {
      console.error("Erro ao alterar notificações:", error);
      toast({
        title: "Erro ao alterar envio de notificações.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const enviarNotificacaoCobranca = async () => {
    setRefreshing(true);
    try {
      await cobrancaService.enviarNotificacao(
        confirmDialogEnvioNotificacao.cobranca
      );
      toast({ title: "Notificação enviada para o responsável com sucesso." });
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      toast({
        title: "Erro ao enviar notificação de cobrança.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
    setConfirmDialogEnvioNotificacao({
      open: false,
      cobranca: null,
    });
  };

  const desfazerPagamento = async () => {
    setRefreshing(true);
    try {
      await cobrancaService.desfazerPagamento(confirmDialogDesfazer.cobrancaId);

      toast({
        title: "Registro de pagamento desfeito com sucesso.",
      });
      fetchCobrancas(true);
    } catch (error: any) {
      console.error("Erro ao desfazer pagamento:", error);
      toast({
        title: "Erro ao desfazer pagamento.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setConfirmDialogDesfazer({ open: false, cobrancaId: "" });
      setRefreshing(false);
    }
  };

  const openPaymentDialog = (cobranca: Cobranca) => {
    setSelectedCobranca(cobranca);
    setPaymentDialogOpen(true);
  };

  const navigateToDetails = (cobranca: Cobranca) => {
    navigate(`/passageiros/${cobranca.passageiros.id}/cobranca/${cobranca.id}`);
  };

  useEffect(() => {
    setPageTitle("Cobranças");
    setPageSubtitle(`Referentes a ${meses[mesFilter - 1]} de ${anoFilter}`);
  }, [mesFilter, anoFilter, setPageTitle, setPageSubtitle]);

  useEffect(() => {
    if (!profile?.id) return;

    const params = {
      ano: anoFilter.toString(),
      mes: mesFilter.toString(),
    };

    setSearchParams(params, { replace: true });
    fetchCobrancas();
    setBuscaAbertas("");
    setBuscaPagas("");
  }, [mesFilter, anoFilter, profile?.id]);

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

  const pullToRefreshReload = async () => {
    fetchCobrancas();
  };

  if (isSessionLoading || isProfileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações do motorista...</p>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <div className="w-full">
            <Card className="mb-6">
              <CardContent className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Mês
                    </label>
                    <Select
                      value={mesFilter.toString()}
                      onValueChange={(value) => setMesFilter(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {meses.map((mes, index) => (
                          <SelectItem
                            key={index}
                            value={(index + 1).toString()}
                          >
                            {mes}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Ano
                    </label>
                    <Select
                      value={anoFilter.toString()}
                      onValueChange={(value) => setAnoFilter(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {anos.map((ano) => (
                          <SelectItem key={ano.value} value={ano.value}>
                            {ano.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Tabs defaultValue="em-aberto" className="w-full mt-6">
                  <TabsList className="grid w-full grid-cols-2 border">
                    <TabsTrigger
                      value="em-aberto"
                      className="data-[state=inactive]:text-gray-600 
            data-[state=active]:bg-primary 
            data-[state=active]:text-white 
            hover:bg-gray-100"
                    >
                      Em Aberto{" "}
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-neutral-200"
                      >
                        {cobrancasAbertas.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="pagas"
                      className="data-[state=inactive]:text-gray-600 
            data-[state=active]:bg-primary 
            data-[state=active]:text-white 
            hover:bg-gray-100"
                    >
                      Pagas{" "}
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-neutral-200"
                      >
                        {cobrancasPagas.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="em-aberto" className="mt-4">
                    {cobrancasAbertas.length > 0 && (
                      <div className="py-4 space-y-2">
                        <Label htmlFor="search-abertas">Buscar por Nome</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="search-abertas"
                            placeholder="Passageiro ou responsável..."
                            className="pl-10"
                            value={buscaAbertas}
                            onChange={(e) => setBuscaAbertas(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    {loading ? (
                      <div className="py-4">
                        <ListSkeleton />
                      </div>
                    ) : todasCobrancas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center px-2 py-12 text-muted-foreground">
                        <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                        <p>
                          Não há cobranças em aberto ou pagas no mes indicado.
                        </p>
                      </div>
                    ) : cobrancasAbertas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center px-2 py-12 text-muted-foreground">
                        <CheckCircle2 className="w-12 h-12 mb-4 text-green-600" />
                        <p>
                          Tudo em dia! <br /> Não há cobranças pendentes no mês
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
                                    <div className="font-semibold text-sm text-gray-800">
                                      {cobranca.passageiros.nome}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Responsável:{" "}
                                      {cobranca.passageiros.nome_responsavel ||
                                        "-"}
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
                                    {/* {cobranca.desativar_lembretes &&
                                      cobranca.status !== "pago" && (
                                        <div className="text-xs text-yellow-800 mt-2 flex items-center gap-1">
                                          <BellOff className="w-3 h-3" />
                                          Notificações automáticas suspensas
                                        </div>
                                      )} */}
                                  </td>
                                  <td className="p-3 text-center align-top">
                                    <Button
                                      variant="ghost"
                                      disabled={disableEnviarNotificacao(
                                        cobranca
                                      )}
                                      size="sm"
                                      className="h-8 w-8 p-0"
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
                                            navigate(
                                              `/passageiros/${cobranca.passageiro_id}`
                                            );
                                          }}
                                        >
                                          Ver Carteirinha
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigateToDetails(cobranca);
                                          }}
                                        >
                                          Ver Cobrança
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditCobrancaClick(cobranca);
                                          }}
                                        >
                                          Editar Cobrança
                                        </DropdownMenuItem>
                                        {!disableRegistrarPagamento(
                                          cobranca
                                        ) && (
                                          <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openPaymentDialog(cobranca);
                                            }}
                                          >
                                            Registrar Pagamento
                                          </DropdownMenuItem>
                                        )}
                                        {/* {!disableEnviarNotificacao(
                                          cobranca
                                        ) && (
                                          <DropdownMenuItem
                                            className="cursor-pointer"
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
                                        )} */}
                                        {/* {!disableEnviarNotificacao(
                                          cobranca
                                        ) && (
                                          <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleLembretes(cobranca);
                                            }}
                                          >
                                            {cobranca.desativar_lembretes
                                              ? "Ativar Notificações"
                                              : "Desativar Notificações"}
                                          </DropdownMenuItem>
                                        )} */}
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
                              className="py-2.5 active:bg-muted/50"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col pr-1 w-2/3">
                                  <div className="font-semibold text-gray-800 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                    {cobranca.passageiros.nome}
                                  </div>
                                  <div className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                                    Responsável:{" "}
                                    {cobranca.passageiros.nome_responsavel ||
                                      "-"}
                                  </div>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="shrink-0 w-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigateToDetails(cobranca);
                                      }}
                                    >
                                      Ver Cobrança
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCobrancaClick(cobranca);
                                      }}
                                    >
                                      Editar Cobrança
                                    </DropdownMenuItem>
                                    {!disableRegistrarPagamento(cobranca) && (
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openPaymentDialog(cobranca);
                                        }}
                                      >
                                        Registrar Pagamento
                                      </DropdownMenuItem>
                                    )}
                                    {/* {!disableEnviarNotificacao(cobranca) && (
                                      <DropdownMenuItem
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
                                    )} */}
                                    {/* {!disableEnviarNotificacao(cobranca) && (
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleLembretes(cobranca);
                                        }}
                                      >
                                        {cobranca.desativar_lembretes
                                          ? "Ativar Notificações"
                                          : "Desativar Notificações"}
                                      </DropdownMenuItem>
                                    )} */}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="flex justify-between items-end pt-1">
                                <div className="flex flex-col">
                                  <div className="font-bold text-base text-foreground">
                                    {Number(cobranca.valor).toLocaleString(
                                      "pt-BR",
                                      {
                                        style: "currency",
                                        currency: "BRL",
                                      }
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Vencimento:{" "}
                                    {formatDateToBR(cobranca.data_vencimento)}
                                  </div>
                                </div>

                                {/* Status (Direita) */}
                                <span
                                  className={`px-2 py-0.5 inline-block rounded-full text-xs font-medium ${getStatusColor(
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

                              {/* {cobranca.desativar_lembretes && (
                                <div className="mt-2 flex items-center gap-2 text-xs p-1 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                                  <BellOff className="h-4 w-4 shrink-0" />
                                  <span className="truncate">
                                    Notificações automáticas suspensas
                                  </span>
                                </div>
                              )} */}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="pagas" className="mt-4">
                    {cobrancasPagas.length > 0 && (
                      <div className="py-4 space-y-2">
                        <Label htmlFor="search-pagas">Buscar por Nome</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="search-pagas"
                            placeholder="Passageiro ou responsável..."
                            className="pl-10"
                            value={buscaPagas}
                            onChange={(e) => setBuscaPagas(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    {loading ? (
                      <div className="py-4">
                        <ListSkeleton />
                      </div>
                    ) : todasCobrancas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center px-2 py-12 text-muted-foreground">
                        <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                        <p>
                          Não há cobranças em aberto ou pagas no mes indicado.
                        </p>
                      </div>
                    ) : cobrancasPagas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                        <DollarSign className="w-12 h-12 mb-4 text-gray-300" />
                        <p>Não há cobranças pagas no mês indicado.</p>
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
                                    <div className="font-semibold text-sm text-gray-800">
                                      {cobranca.passageiros.nome}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {cobranca.passageiros.nome_responsavel ||
                                        "-"}
                                    </div>
                                  </td>
                                  <td className="p-3 align-top">
                                    <div className="text-sm">
                                      {cobranca.data_pagamento
                                        ? formatDateToBR(
                                            cobranca.data_pagamento
                                          )
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
                                      {formatPaymentType(
                                        cobranca.tipo_pagamento
                                      )}
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
                                            navigate(
                                              `/passageiros/${cobranca.passageiro_id}`
                                            );
                                          }}
                                        >
                                          Ver Carteirinha
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigateToDetails(cobranca);
                                          }}
                                        >
                                          Ver Cobrança
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditCobrancaClick(cobranca);
                                          }}
                                        >
                                          Editar Cobrança
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
                              className="py-2.5 active:bg-muted/50"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="">
                                  <div className="font-semibold text-gray-800 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                    {cobranca.passageiros.nome}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Responsável:{" "}
                                    {cobranca.passageiros.nome_responsavel ||
                                      "-"}
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="shrink-0 w-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigateToDetails(cobranca);
                                      }}
                                    >
                                      Ver Cobrança
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCobrancaClick(cobranca);
                                      }}
                                    >
                                      Editar Cobrança
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
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
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Pagou em
                                  </span>
                                  <span className="font-medium">
                                    {cobranca.data_pagamento
                                      ? formatDateToBR(cobranca.data_pagamento)
                                      : "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Valor
                                  </span>
                                  <span className="font-medium">
                                    {Number(cobranca.valor).toLocaleString(
                                      "pt-BR",
                                      { style: "currency", currency: "BRL" }
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Forma de Pagamento
                                  </span>
                                  <span className="font-medium">
                                    {formatPaymentType(cobranca.tipo_pagamento)}
                                  </span>
                                </div>
                              </div>
                              {cobranca.pagamento_manual && (
                                <div className="mt-2">
                                  <span className="text-xs p-1 rounded-md text-muted-foreground inline-block bg-muted">
                                    Pagamento registrado manualmente
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {paymentDialogOpen && (
            <ManualPaymentDialog
              isOpen={paymentDialogOpen}
              onClose={() => safeCloseDialog(() => setPaymentDialogOpen(false))}
              cobrancaId={selectedCobranca.id}
              passageiroNome={selectedCobranca.passageiros.nome}
              responsavelNome={selectedCobranca.passageiros.nome_responsavel}
              valorOriginal={Number(selectedCobranca.valor)}
              onPaymentRecorded={() => {
                setPaymentDialogOpen(false);
                fetchCobrancas(true);
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
            description="Deseja realmente desfazer o pagamento desta cobrança?"
            onConfirm={desfazerPagamento}
            variant="destructive"
            confirmText="Confirmar"
          />

          {cobrancaToEdit && (
            <CobrancaEditDialog
              isOpen={editDialogOpen}
              onClose={() => safeCloseDialog(() => setEditDialogOpen(false))}
              cobranca={cobrancaToEdit}
              onCobrancaUpdated={handleCobrancaUpdated}
            />
          )}
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={refreshing} text="Aguarde..." />
    </>
  );
};

export default Cobrancas;
