import CobrancaDialog from "@/components/CobrancaDialog";
import CobrancaEditDialog from "@/components/CobrancaEditDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import EscolaFormDialog from "@/components/EscolaFormDialog";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import PassageiroFormDialog from "@/components/PassageiroFormDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import VeiculoFormDialog from "@/components/VeiculoFormDialog";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { cobrancaService } from "@/services/cobrancaService";
import { passageiroService } from "@/services/passageiroService";
import { Cobranca } from "@/types/cobranca";
import { Passageiro } from "@/types/passageiro";
import { safeCloseDialog } from "@/utils/dialogCallback";
import {
  disableDesfazerPagamento,
  disableEnviarNotificacao,
  disableExcluirCobranca,
  disableRegistrarPagamento,
} from "@/utils/disableActions";
import {
  cleanString,
  formatarEnderecoCompleto,
  formatarTelefone,
  formatDateToBR,
  formatPeriodo,
  getMesNome,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";
import { formatarPlacaExibicao } from "@/utils/placaUtils";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle,
  Clock,
  Contact,
  Copy,
  DollarSign,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Pencil,
  Plus,
  School,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const currentYear = new Date().getFullYear().toString();
const COBRANCAS_LIMIT = 2;

const InfoItem = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="font-semibold text-foreground mt-1">{children || "-"}</div>
  </div>
);

const CarteirinhaSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <div className="flex flex-col gap-2 overflow-hidden">
            <Skeleton className="h-7 w-full max-w-[12rem]" />
            <Skeleton className="h-5 w-full max-w-[6rem]" />
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  </div>
);

export default function PassageiroCarteirinha() {
  const [novaEscolaId, setNovaEscolaId] = useState<string | null>(null);
  const [novoVeiculoId, setNovoVeiculoId] = useState<string | null>(null);
  const [isCreatingEscola, setIsCreatingEscola] = useState(false);
  const [isCreatingVeiculo, setIsCreatingVeiculo] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cobrancaToEdit, setCobrancaToEdit] = useState<Cobranca | null>(null);
  const { setPageTitle, setPageSubtitle } = useLayout();
  const { passageiro_id } = useParams<{ passageiro_id: string }>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  const [passageiro, setPassageiro] = useState<Passageiro | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isCopiedEndereco, setIsCopiedEndereco] = useState(false);
  const [isCopiedTelefone, setIsCopiedTelefone] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(
    null
  );
  const [confirmToggleDialog, setConfirmToggleDialog] = useState({
    open: false,
    action: "" as "ativar" | "desativar" | "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    cobrancaId: "",
    action: "enviar",
  });
  const [cobrancaDialogOpen, setCobrancaDialogOpen] = useState(false);
  const [deleteCobrancaDialog, setDeleteCobrancaDialog] = useState({
    open: false,
    cobranca: null as Cobranca | null,
  });
  const [deletePassageiroDialog, setDeletePassageiroDialog] = useState({
    open: false,
  });
  const [availableYears, setAvailableYears] = useState<string[]>([currentYear]);
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [isObservacoesEditing, setIsObservacoesEditing] = useState(false);
  const [obsText, setObsText] = useState("");
  const [mostrarTodasCobrancas, setMostrarTodasCobrancas] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const registerOnAsaas = false;

  useEffect(() => {
    if (isObservacoesEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      const length = textarea.value.length;

      textarea.focus();

      textarea.setSelectionRange(length, length);
    }
  }, [isObservacoesEditing]);

  useEffect(() => {
    if (!profile?.id) return;
    fetchAllData();
  }, [passageiro_id, profile?.id]);

  useEffect(() => {
    if (passageiro && !loading) {
      setObsText((passageiro as any).observacoes || "");
    }
  }, [passageiro, loading]);

  useEffect(() => {
    if (passageiro) {
      setPageTitle(`Carteirinha Digital`);
      setPageSubtitle(`${passageiro.nome} (${passageiro.nome_responsavel})`);
    }
  }, [passageiro, setPageTitle, setPageSubtitle]);

  useEffect(() => {
    if (!loading) {
      fetchCobrancas(yearFilter, true);
    }
  }, [yearFilter]);

  const fetchAllData = async () => {
    setLoading(true);
    if (passageiro_id) {
      await fetchAvailableYears();

      const p = await fetchPassageiro();
      if (p) await fetchCobrancas(yearFilter);
    }
    setLoading(false);
  };

  const handleCloseEscolaFormDialog = () => {
    safeCloseDialog(() => {
      setIsCreatingEscola(false);
    });
  };

  const handleCloseVeiculoFormDialog = () => {
    safeCloseDialog(() => {
      setIsCreatingVeiculo(false);
    });
  };

  const handleEscolaCreated = (novaEscola) => {
    safeCloseDialog(() => {
      setIsCreatingEscola(false);
      setNovaEscolaId(novaEscola.id);
    });
  };

  const handleVeiculoCreated = (novoVeiculo) => {
    safeCloseDialog(() => {
      setIsCreatingVeiculo(false);
      setNovoVeiculoId(novoVeiculo.id);
    });
  };

  const handleEditClick = () => {
    setIsFormOpen(true);
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (label === "Endereço") {
        setIsCopiedEndereco(true);
        setTimeout(() => {
          setIsCopiedEndereco(false);
        }, 1000);
      } else {
        setIsCopiedTelefone(true);
        setTimeout(() => {
          setIsCopiedTelefone(false);
        }, 1000);
      }
    } catch (err) {
      console.error("Erro ao copiar:", err);
      toast({
        title: "Erro ao copiar.",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  const handleEditCobrancaClick = (cobranca: Cobranca) => {
    safeCloseDialog(() => {
      setCobrancaToEdit(cobranca);
      setEditDialogOpen(true);
    });
  };

  const handleCobrancaUpdated = () => {
    fetchCobrancas(yearFilter, true);
    fetchAvailableYears();
  };

  const handleSaveObservacoes = async () => {
    if (!passageiro_id) return;

    setRefreshing(true);

    try {
      const { error } = await supabase
        .from("passageiros")
        .update({ observacoes: cleanString(obsText, true) })
        .eq("id", passageiro_id);

      if (error) throw error;

      setPassageiro((prev) => ({
        ...prev!,
        observacoes: obsText,
      }));
      setIsObservacoesEditing(false);

      toast({ title: "Observações salvas com sucesso." });
    } catch (error) {
      console.error("Erro ao salvar observações:", error);
      toast({
        title: "Erro ao salvar observações.",
        variant: "destructive",
      });
      setObsText((passageiro as any)?.observacoes || "");
    } finally {
      setRefreshing(false);
    }
  };

  const handlePassageiroFormSuccess = () => {
    setNovoVeiculoId(null);
    setNovaEscolaId(null);
    fetchPassageiro();
    fetchCobrancas(yearFilter, true);
    fetchAvailableYears();
    setIsFormOpen(false);
  };

  const handleCobrancaAdded = () => {
    fetchCobrancas(yearFilter, true);
    fetchAvailableYears();
  };

  const fetchPassageiro = async () => {
    if (!passageiro_id) return null;
    try {
      const { data, error } = await supabase
        .from("passageiros")
        .select("*, escolas(nome), veiculos(placa)")
        .eq("id", passageiro_id)
        .single();
      if (error) throw error;
      setPassageiro(data as Passageiro);
      return data;
    } catch (error) {
      console.error("Erro ao buscar passageiro:", error);
      toast({ title: "Passageiro não encontrado.", variant: "destructive" });
      navigate("/passageiros");
      return null;
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCobrancas = async (year: string, isRefresh = false) => {
    if (!profile?.id) return;

    try {
      if (isRefresh) setRefreshing(true);

      const { data, error } = await supabase
        .from("cobrancas")
        .select(`*, passageiros:passageiro_id (nome, nome_responsavel)`)
        .eq("passageiro_id", passageiro_id)
        .eq("usuario_id", profile.id)
        .eq("ano", parseInt(year))
        .order("mes", { ascending: false });

      if (error) throw error;
      setCobrancas(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast({
        title: "Erro ao buscar histórico.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const years = await cobrancaService.fetchAvailableYears(passageiro_id);
      setAvailableYears(years);

      let newYearFilter = yearFilter;

      if (!years.includes(yearFilter)) {
        const fallbackYear = new Date().getFullYear().toString();
        setYearFilter(fallbackYear);
        newYearFilter = fallbackYear;
      }

      return newYearFilter;
    } catch (error) {
      console.error("Erro ao buscar anos disponíveis:", error);
      toast({
        title: "Erro ao buscar anos disponíveis.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
      return yearFilter;
    }
  };

  const handleDeleteCobrancaClick = (cobranca: Cobranca) => {
    setDeleteCobrancaDialog({ open: true, cobranca });
  };

  const handleDelete = async () => {
    setRefreshing(true);
    try {
      const numCobrancas = await passageiroService.getNumeroCobrancas(
        passageiro_id
      );

      if (numCobrancas > 0) {
        toast({
          title: "NEGADO: Passageiro possui cobranças.",
          description: `Mas você ainda pode desativar o cadastro.`,
          variant: "destructive",
        });
        return;
      }

      setRefreshing(true);

      await passageiroService.excluirPassageiro(passageiro_id);

      toast({ title: "Passageiro excluído com sucesso." });
      navigate("/passageiros");
    } catch (error: any) {
      console.error("Erro ao excluir passageiro:", error);
      toast({
        title: "Erro ao excluir passageiro.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleClick = (statusAtual: boolean) => {
    const action = statusAtual ? "desativar" : "ativar";
    setConfirmToggleDialog({ open: true, action });
  };

  const handleToggleConfirm = async () => {
    if (!passageiro || !passageiro_id) return;

    setRefreshing(true);

    try {
      await passageiroService.toggleAtivo(passageiro_id, passageiro.ativo);

      toast({
        title: `Passageiro ${
          confirmToggleDialog.action == "ativar" ? "ativo" : "desativado"
        } com sucesso.`,
      });

      fetchPassageiro();
    } catch (error: any) {
      console.error("Erro ao alternar status:", error);
      toast({
        title: `Erro ao ${confirmToggleDialog.action} o passageiro.`,
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setConfirmToggleDialog({ open: false, action: "" });
    }
  };

  const handleToggleLembretes = async (cobranca: Cobranca) => {
    try {
      const novoStatus = !cobranca.desativar_lembretes;

      const { error } = await supabase
        .from("cobrancas")
        .update({ desativar_lembretes: novoStatus })
        .eq("id", cobranca.id);

      if (error) throw error;

      toast({
        title: `Notificações automáticas ${
          novoStatus ? "desativadas" : "ativadas"
        } com sucesso.`,
      });

      fetchCobrancas(yearFilter, true);
    } catch (err) {
      console.error("Erro ao alternar notificações:", err);
      toast({
        title: "Não foi possível atualizar o status das notificações.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCobranca = async () => {
    if (!deleteCobrancaDialog.cobranca) return;

    setRefreshing(true);
    try {
      await cobrancaService.excluirCobranca(deleteCobrancaDialog.cobranca);

      toast({
        title: "Cobrança excluída com sucesso.",
      });

      const newFilterYear = await fetchAvailableYears();

      if (newFilterYear === yearFilter) {
        await fetchCobrancas(yearFilter, true);
      }
    } catch (error: any) {
      console.error("Erro ao excluir cobrança:", error);
      toast({
        title: "Erro ao excluir cobrança.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setDeleteCobrancaDialog({ open: false, cobranca: null });
      setRefreshing(false);
    }
  };

  const handleEnviarNotificacaoClick = (cobrancaId: string) =>
    setConfirmDialog({ open: true, cobrancaId, action: "enviar" });

  const handleDesfazerClick = (cobrancaId: string) =>
    setConfirmDialog({ open: true, cobrancaId, action: "desfazer" });

  const handleConfirmAction = async () => {
    setRefreshing(true);
    try {
      if (confirmDialog.action === "enviar") {
        enviarNotificacaoCobranca(confirmDialog.cobrancaId);
      } else if (confirmDialog.action === "desfazer") {
        desfazerPagamento(confirmDialog.cobrancaId);
      }
    } catch (error: any) {
      console.error("Erro ao processar ação:", error);
      toast({
        title: "Erro ao processar a ação.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setConfirmDialog({ open: false, cobrancaId: "", action: "enviar" });
    }
  };

  const enviarNotificacaoCobranca = async (cobrancaId: string) => {
    try {
      const { data: cobranca, error: checkError } = await supabase
        .from("cobrancas")
        .select("*")
        .eq("id", cobrancaId)
        .single();

      if (checkError) {
        throw checkError;
      }

      if (disableEnviarNotificacao(cobranca)) {
        toast({
          title: "Não foi possível enviar a notificação.",
          description:
            "Só é possível enviar para cobranças geradas automaticamente.",
          variant: "destructive",
        });
      } else {
        setRefreshing(true);
        try {
          await cobrancaService.enviarNotificacao(cobranca);
          toast({
            title: "Notificação enviada com sucesso para o responsável",
          });
        } catch (error) {
          console.error("Erro ao enviar notificação:", error);
          toast({
            title: "Erro ao enviar notificação da cobranca.",
            variant: "destructive",
          });
        } finally {
          setRefreshing(false);
        }
      }
    } catch (error: any) {
      console.error("Erro ao processar ação:", error);
      toast({
        title: "Erro ao processar a ação.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    }
  };

  const desfazerPagamento = async (cobrancaId: string) => {
    setRefreshing(true);
    try {
      await cobrancaService.desfazerPagamento(cobrancaId);

      toast({
        title: "Pagamento desfeito com sucesso.",
      });

      fetchCobrancas(yearFilter);
    } catch (error: any) {
      console.error("Erro ao processar ação:", error);
      toast({
        title: "Erro ao processar a ação.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const openPaymentDialog = (cobranca: Cobranca) => {
    setSelectedCobranca(cobranca);
    setPaymentDialogOpen(true);
  };
  const handlePaymentRecorded = () => {
    fetchCobrancas(yearFilter);
    fetchAvailableYears();
  };

  const yearlySummary = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return cobrancas.reduce(
      (acc, c) => {
        if (c.status === "pago") {
          acc.valorPago += Number(c.valor);
          acc.qtdPago++;
        } else {
          acc.qtdPendente++;
          acc.valorPendente += Number(c.valor);
          const vencimento = new Date(c.data_vencimento + "T00:00:00");
          if (vencimento < hoje) {
            acc.qtdEmAtraso += 1;
            acc.valorEmAtraso += Number(c.valor);
          }
        }
        return acc;
      },
      {
        qtdPago: 0,
        valorPago: 0,
        qtdPendente: 0,
        valorPendente: 0,
        qtdEmAtraso: 0,
        valorEmAtraso: 0,
      }
    );
  }, [cobrancas]);

  const cobrancasParaExibir = mostrarTodasCobrancas
    ? cobrancas
    : cobrancas.slice(0, COBRANCAS_LIMIT);

  if (loading || !passageiro) {
    return (
      <div className="overflow-hidden w-full max-w-full h-full">
        <CarteirinhaSkeleton />
      </div>
    );
  }

  const pullToRefreshReload = async () => {
    fetchAllData();
  };

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
            {/* Cobranças */}
            <div className="order-1 lg:order-2 lg:col-span-2 lg:row-start-1 lg:h-full">
              <Card className="h-full">
                <CardHeader className="px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Cobranças</CardTitle>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground hidden sm:block">
                        Ano:
                      </label>
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="w-[100px] text-sm">
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map((ano) => (
                            <SelectItem key={ano} value={ano}>
                              {ano}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={!passageiro.ativo}
                        onClick={() => setCobrancaDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:block">
                          Registrar Cobrança
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-4">
                  {cobrancas.length > 0 ? (
                    <>
                      <div className="hidden md:block">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="p-4 text-left text-xs font-medium text-gray-600">
                                Mês
                              </th>
                              <th className="p-4 text-left text-xs font-medium text-gray-600">
                                Status
                              </th>
                              <th className="p-4 text-left text-xs font-medium text-gray-600">
                                Valor
                              </th>
                              <th className="p-4 text-left text-xs font-medium text-gray-600">
                                Vencimento
                              </th>
                              <th className="p-4 text-center text-xs font-medium text-gray-600">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {cobrancas.map((cobranca) => (
                              <tr
                                key={cobranca.id}
                                onClick={() =>
                                  navigate(
                                    `/passageiros/${passageiro.id}/cobranca/${cobranca.id}`
                                  )
                                }
                                className="hover:bg-muted/50 cursor-pointer"
                              >
                                <td className="p-4 align-top font-medium">
                                  {getMesNome(cobranca.mes)}
                                </td>
                                <td className="p-4 align-top">
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
                                    {cobranca.status === "pago"
                                      ? ` em ${formatDateToBR(
                                          cobranca.data_pagamento
                                        )} `
                                      : ""}
                                  </span>
                                  {/* {cobranca.desativar_lembretes &&
                                    cobranca.status !== "pago" && (
                                      <div className="text-xs text-yellow-800 mt-2 flex items-center gap-1">
                                        <BellOff className="w-3 h-3" />
                                        <span className="truncate">
                                          Notificações automáticas suspensas
                                        </span>
                                      </div>
                                    )} */}
                                </td>
                                <td className="p-4 align-top">
                                  {cobranca.valor.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </td>
                                <td className="p-4 align-top">
                                  {formatDateToBR(cobranca.data_vencimento)}
                                </td>
                                <td className="p-4 text-center align-top">
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
                                            `/passageiros/${passageiro.id}/cobranca/${cobranca.id}`
                                          );
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
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            document.body.click();
                                            setTimeout(
                                              () => openPaymentDialog(cobranca),
                                              10
                                            );
                                          }}
                                        >
                                          Registrar Pagamento
                                        </DropdownMenuItem>
                                      )}
                                      {/* {!disableEnviarNotificacao(cobranca) && (
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEnviarNotificacaoClick(
                                              cobranca.id
                                            );
                                          }}
                                        >
                                          Enviar Notificação
                                        </DropdownMenuItem>
                                      )} */}
                                      {/* {!disableToggleLembretes(cobranca) && (
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
                                      {!disableDesfazerPagamento(cobranca) && (
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDesfazerClick(cobranca.id);
                                          }}
                                        >
                                          Desfazer Pagamento
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        className="text-red-600 cursor-pointer"
                                        disabled={disableExcluirCobranca(
                                          cobranca
                                        )}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCobrancaClick(cobranca);
                                        }}
                                      >
                                        Excluir Cobrança
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="md:hidden -mx-6 -mt-6 divide-y divide-gray-100">
                        {cobrancasParaExibir.map((cobranca) => (
                          <div
                            key={cobranca.id}
                            onClick={() =>
                              navigate(
                                `/passageiros/${passageiro.id}/cobranca/${cobranca.id}`
                              )
                            }
                            className="py-2.5 px-4 active:bg-muted/50"
                          >
                            {/* O conteúdo do item da lista (cobranca) permanece o mesmo */}
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col pr-1 w-2/3">
                                <div className="font-semibold text-gray-800 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                  {getMesNome(cobranca.mes)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                                  Vencimento:{" "}
                                  <span className="font-medium text-gray-700">
                                    {formatDateToBR(cobranca.data_vencimento)}
                                  </span>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 -mr-2 -mt-1"
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
                                        `/passageiros/${passageiro.id}/cobranca/${cobranca.id}`
                                      );
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
                                        document.body.click();
                                        setTimeout(
                                          () => openPaymentDialog(cobranca),
                                          10
                                        );
                                      }}
                                    >
                                      Registrar Pagamento
                                    </DropdownMenuItem>
                                  )}
                                  {/* {!disableEnviarNotificacao(cobranca) && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEnviarNotificacaoClick(
                                          cobranca.id
                                        );
                                      }}
                                    >
                                      Enviar Notificação
                                    </DropdownMenuItem>
                                  )} */}
                                  {/* {!disableToggleLembretes(cobranca) && (
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
                                  {!disableDesfazerPagamento(cobranca) && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDesfazerClick(cobranca.id);
                                      }}
                                    >
                                      Desfazer Pagamento
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    disabled={disableExcluirCobranca(cobranca)}
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCobrancaClick(cobranca);
                                    }}
                                  >
                                    Excluir Cobrança
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="flex justify-between items-end pt-1">
                              <div className="font-bold text-base text-foreground">
                                {Number(cobranca.valor).toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  }
                                )}
                              </div>
                              <span
                                className={`px-2 py-0.5 inline-block rounded-full text-xs font-medium ${getStatusColor(
                                  cobranca.status,
                                  cobranca.data_vencimento
                                )}`}
                              >
                                {cobranca.status === "pago"
                                  ? `Paga em ${formatDateToBR(
                                      cobranca.data_pagamento
                                    )}`
                                  : getStatusText(
                                      cobranca.status,
                                      cobranca.data_vencimento
                                    )}
                              </span>
                            </div>
                            {/* {cobranca.desativar_lembretes &&
                              cobranca.status !== "pago" && (
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

                      {cobrancas.length > COBRANCAS_LIMIT && (
                        <div className="mt-4 text-center md:hidden">
                          <Button
                            variant="link"
                            className="text-primary"
                            onClick={() =>
                              setMostrarTodasCobrancas(!mostrarTodasCobrancas)
                            }
                          >
                            {mostrarTodasCobrancas
                              ? "Ver menos"
                              : `Ver todas as ${cobrancas.length} cobranças`}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      {passageiro.ativo ? (
                        <>
                          {registerOnAsaas ? (
                            <Alert className="bg-sky-50 border-sky-200 text-sky-900 p-3 md:p-4 rounded-xl gap-3 shadow-sm">
                              <Info className="h-5 w-5 text-sky-500 mt-0.5" />
                              <AlertTitle className="text-sky-900 text-sm font-semibold">
                                Nenhuma cobrança... ainda!
                              </AlertTitle>
                              <AlertDescription className="text-sky-800 text-sm leading-relaxed">
                                Não se preocupe! A primeira cobrança aparecerá
                                aqui <strong>no início do próximo mês</strong>,
                                com o vencimento para o dia programado.
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <>
                              <Alert className="bg-sky-50 border-sky-200 text-sky-900 p-3 md:p-4 rounded-xl gap-3 shadow-sm">
                                <Info className="h-5 w-5 text-sky-500 mt-0.5" />
                                <AlertTitle className="text-sky-900 text-sm font-semibold">
                                  Nenhuma cobrança... ainda!
                                </AlertTitle>
                                <AlertDescription className="text-sky-800 text-sm leading-relaxed">
                                  Registre a primeira cobrança a qualquer
                                  momento.
                                  <br /> A data de vencimento será o dia
                                  programado no cadastro do passageiro.
                                </AlertDescription>
                              </Alert>
                            </>
                          )}
                        </>
                      ) : (
                        <Alert className="bg-red-50 text-red-900">
                          <AlertTriangle className="h-4 w-4 !text-red-900" />
                          <AlertTitle className="font-bold">
                            Cadastro desativado
                          </AlertTitle>
                          <AlertDescription className="space-y-3">
                            <p>
                              O sistema não irá gerar novas cobranças enquanto o
                              passageiro estiver desativado.
                            </p>
                            <p>
                              Para voltar a gerar cobranças, é necessário
                              reativar o cadastro.
                            </p>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleToggleClick(passageiro.ativo)
                              }
                            >
                              Reativar Cadastro
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Informações */}
            <div className="order-2 lg:order-1 lg:col-start-1 lg:row-start-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-lg">{passageiro.nome}</CardTitle>
                    <CardDescription className="text-xs">
                      {passageiro.nome_responsavel}
                    </CardDescription>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      title="Editar Passageiro"
                      onClick={handleEditClick}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem icon={Contact} label="Situação">
                    <Badge
                      variant={passageiro.ativo ? "outline" : "destructive"}
                      className={
                        passageiro.ativo ? "bg-green-600 text-white" : ""
                      }
                    >
                      {passageiro.ativo ? "Ativo" : "Desativado"}
                    </Badge>
                  </InfoItem>
                  <InfoItem icon={School} label="Escola">
                    {passageiro.escolas?.nome || "Não informada"}
                  </InfoItem>
                  <InfoItem icon={Clock} label="Período">
                    {formatPeriodo(passageiro.periodo)}
                  </InfoItem>
                  <InfoItem icon={Car} label="Veículo">
                    {formatarPlacaExibicao(passageiro.veiculos?.placa) ||
                      "Não informado"}
                  </InfoItem>
                  <InfoItem icon={DollarSign} label="Valor Cobranças">
                    {passageiro.valor_cobranca.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </InfoItem>

                  <InfoItem icon={CalendarDays} label="Data de Vencimento">
                    Todo dia {passageiro.dia_vencimento}
                  </InfoItem>
                  <InfoItem icon={MapPin} label="Endereço">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {formatarEnderecoCompleto(passageiro)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={
                          isCopiedEndereco
                            ? "Endereço copiado!"
                            : "Copiar Endereço"
                        }
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={() =>
                          handleCopyToClipboard(
                            formatarEnderecoCompleto(passageiro),
                            "Endereço"
                          )
                        }
                      >
                        {isCopiedEndereco ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </InfoItem>
                  <InfoItem icon={MessageCircle} label="Telefone (WhatsApp)">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {formatarTelefone(passageiro.telefone_responsavel)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={
                          isCopiedEndereco
                            ? "Telefone copiado!"
                            : "Copiar Telefone"
                        }
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={() =>
                          handleCopyToClipboard(
                            formatarTelefone(passageiro.telefone_responsavel),
                            "Telefone"
                          )
                        }
                      >
                        {isCopiedTelefone ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </InfoItem>

                  <InfoItem icon={Mail} label="E-mail">
                    {passageiro.email_responsavel || "Não informado"}
                  </InfoItem>

                  <div className="space-y-2 pt-6 border-t">
                    {passageiro.ativo ? (
                      <Button
                        variant="outline"
                        className="w-full mt-2 border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleToggleClick(passageiro.ativo)}
                      >
                        Desativar Passageiro
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full mt-2 bg-green-600 hover:bg-green-700"
                        onClick={() => handleToggleClick(passageiro.ativo)}
                      >
                        Reativar Cadastro
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full bg-green-50 border-green-500 text-green-500 hover:text-green-500 hover:bg-green-100"
                      disabled={!passageiro.telefone_responsavel}
                      onClick={() =>
                        window.open(
                          `https://wa.me/${passageiro.telefone_responsavel}`,
                          "_blank"
                        )
                      }
                    >
                      <MessageCircle className="h-4 w-4 mr-2" /> Falar no
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 justify-start p-2"
                    onClick={() => {
                      setDeletePassageiroDialog({ open: true });
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-2" /> Excluir Passageiro
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Observações */}
            <div className="order-3 lg:order-3 lg:col-start-1 lg:row-start-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Observações</CardTitle>
                  <Button
                    variant="outline"
                    title="Editar Observações"
                    onClick={() => setIsObservacoesEditing(true)}
                    className="gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isObservacoesEditing ? (
                    <Textarea
                      ref={textareaRef}
                      value={obsText}
                      onChange={(e) => setObsText(e.target.value)}
                      rows={5}
                      placeholder="Ex: Alergia a amendoim, deixar na casa da avó às sextas, precisa de ajuda para colocar o cinto..."
                    />
                  ) : obsText ? (
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {obsText}
                    </p>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setIsObservacoesEditing(true)}
                    >
                      <Info className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="font-semibold text-foreground">
                        Adicionar Observações
                      </p>
                      <p className="text-sm mt-1">
                        Clique aqui para anotar informações importantes sobre o
                        passageiro. Isso é visível apenas para você.
                      </p>
                    </div>
                  )}
                </CardContent>
                {isObservacoesEditing && (
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setObsText(passageiro.observacoes || "");
                        setIsObservacoesEditing(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveObservacoes}>Salvar</Button>
                  </CardFooter>
                )}
              </Card>
            </div>

            {/* Resumo Financeiro */}
            <div className="order-4 lg:order-4 lg:col-span-2 lg:row-start-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Resumo Financeiro do Ano
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> <span>Pago</span>
                    </div>
                    <div className="">
                      <span className="text-2xl font-bold mt-1">
                        {yearlySummary.valorPago.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> <span>Pendente</span>
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {yearlySummary.valorPendente.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />{" "}
                      <span>Cobranças em Atraso</span>
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {yearlySummary.qtdEmAtraso}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />{" "}
                      <span>Valor em Atraso</span>
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {yearlySummary.valorEmAtraso.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {selectedCobranca && (
            <ManualPaymentDialog
              isOpen={paymentDialogOpen}
              onClose={() => safeCloseDialog(() => setPaymentDialogOpen(false))}
              cobrancaId={selectedCobranca.id}
              passageiroNome={passageiro.nome}
              responsavelNome={passageiro.nome_responsavel}
              valorOriginal={Number(selectedCobranca.valor)}
              onPaymentRecorded={() =>
                safeCloseDialog(() => handlePaymentRecorded())
              }
            />
          )}
          <CobrancaDialog
            isOpen={cobrancaDialogOpen}
            onClose={() => safeCloseDialog(() => setCobrancaDialogOpen(false))}
            passageiroId={passageiro.id}
            passageiroNome={passageiro.nome}
            passageiroResponsavelNome={passageiro.nome_responsavel}
            passageiroAsaasCustomerId={passageiro.asaas_customer_id}
            valorCobranca={passageiro.valor_cobranca}
            diaVencimento={passageiro.dia_vencimento}
            onCobrancaAdded={() => safeCloseDialog(() => handleCobrancaAdded())}
          />
          <ConfirmationDialog
            open={confirmToggleDialog.open}
            onOpenChange={(open) =>
              setConfirmToggleDialog({ open, action: "" })
            }
            title={
              confirmToggleDialog.action === "ativar"
                ? "Reativar Passageiro"
                : "Desativar Passageiro"
            }
            description={`Deseja realmente ${confirmToggleDialog.action} o cadastro de ${passageiro.nome}? Esta ação pode afetar a geração de cobranças.`}
            onConfirm={handleToggleConfirm}
            confirmText="Confirmar"
            variant={
              confirmToggleDialog.action === "desativar"
                ? "destructive"
                : "default"
            }
          />
          <ConfirmationDialog
            open={confirmDialog.open}
            onOpenChange={(open) =>
              setConfirmDialog({ ...confirmDialog, open })
            }
            title={
              confirmDialog.action === "enviar"
                ? "Enviar Notificação"
                : "Desfazer Pagamento"
            }
            description={
              confirmDialog.action === "enviar"
                ? "Deseja enviar esta notificação para o responsável?"
                : "Deseja desfazer este pagamento?"
            }
            onConfirm={handleConfirmAction}
          />
          <ConfirmationDialog
            open={deleteCobrancaDialog.open}
            onOpenChange={(open) =>
              setDeleteCobrancaDialog({ ...deleteCobrancaDialog, open })
            }
            title="Excluir"
            description="Deseja excluir permanentemente essa cobrança?"
            onConfirm={handleDeleteCobranca}
            confirmText="Confirmar"
            variant="destructive"
          />
          <ConfirmationDialog
            open={deletePassageiroDialog.open}
            onOpenChange={(open) => setDeletePassageiroDialog({ open })}
            title="Excluir Passageiro"
            description="Deseja excluir permanentemente este passageiro?"
            onConfirm={handleDelete}
            confirmText="Confirmar"
            variant="destructive"
          />
          {isFormOpen && (
            <PassageiroFormDialog
              isOpen={isFormOpen}
              onClose={() =>
                safeCloseDialog(() => {
                  setNovoVeiculoId(null);
                  setNovaEscolaId(null);
                  setIsFormOpen(false);
                })
              }
              onSuccess={handlePassageiroFormSuccess}
              editingPassageiro={passageiro}
              onCreateEscola={() => setIsCreatingEscola(true)}
              onCreateVeiculo={() => setIsCreatingVeiculo(true)}
              mode="edit"
              novaEscolaId={novaEscolaId}
              novoVeiculoId={novoVeiculoId}
            />
          )}
          <EscolaFormDialog
            isOpen={isCreatingEscola}
            onClose={handleCloseEscolaFormDialog}
            onSuccess={handleEscolaCreated}
          />
          <VeiculoFormDialog
            isOpen={isCreatingVeiculo}
            onClose={handleCloseVeiculoFormDialog}
            onSuccess={handleVeiculoCreated}
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
}
