import CobrancaRetroativaDialog from "@/components/CobrancaRetroativaDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import PassageiroFormDialog from "@/components/PassageiroFormDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { useLayout } from "@/contexts/LayoutContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cobrancaService } from "@/services/cobrancaService";
import { passageiroService } from "@/services/passageiroService";
import { Cobranca } from "@/types/cobranca";
import { Passageiro } from "@/types/passageiro";
import {
  disableDesfazerPagamento,
  disableEnviarNotificacao,
  disableExcluirMensalidade,
  disableRegistrarPagamento,
  disableToggleLembretes,
} from "@/utils/disableActions";
import {
  formatarTelefone,
  formatDateToBR,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";
import {
  AlertTriangle,
  BellOff,
  Contact,
  Hash,
  Info,
  Mail,
  MessageCircle,
  MoreVertical,
  Pencil,
  Plus,
  School,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const currentYear = new Date().getFullYear().toString();
const MENSALIDADES_LIMIT = 2;

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
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-24" />
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
  const { setPageTitle, setPageSubtitle } = useLayout();
  const { passageiro_id } = useParams<{ passageiro_id: string }>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  const [passageiro, setPassageiro] = useState<Passageiro | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
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
  const [retroativaDialogOpen, setRetroativaDialogOpen] = useState(false);
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
  const { toast } = useToast();

  const [mostrarTodasMensalidades, setMostrarTodasMensalidades] =
    useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      if (passageiro_id) {
        await fetchAvailableYears();

        const p = await fetchPassageiro();
        if (p) await fetchCobrancas(yearFilter);
      }
      setLoading(false);
    };

    fetchAllData();
  }, [passageiro_id]);

  useEffect(() => {
    if (passageiro && !loading) {
      setObsText((passageiro as any).observacoes || "");
    }
  }, [passageiro, loading]);

  useEffect(() => {
    if (passageiro) {
      setPageTitle(`${passageiro.nome}`);
      setPageSubtitle(`Carteirinha Digital`);
    }
  }, [passageiro, setPageTitle, setPageSubtitle]);

  useEffect(() => {
    if (!loading) {
      fetchCobrancas(yearFilter);
    }
  }, [yearFilter]);

  const handleEditClick = () => {
    setIsFormOpen(true);
  };

  const handleOpenRetroativaDialog = () => {
    if (passageiro.ativo) {
      setRetroativaDialogOpen(true);
    } else {
      toast({
        title: "O cadastro do passageiro está desativado.",
        description:
          "Só é possível registrar mensalidade de passageiros ativos.",
        variant: "default",
      });
    }
  };

  const handleSaveObservacoes = async () => {
    if (!passageiro_id) return;

    try {
      const { error } = await supabase
        .from("passageiros")
        .update({ observacoes: obsText })
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
    }
  };

  const handlePassageiroFormSuccess = () => {
    fetchPassageiro();
    fetchCobrancas(yearFilter);
    fetchAvailableYears();
    setIsFormOpen(false);
  };

  const handleCobrancaAdded = () => {
    fetchCobrancas(yearFilter);
    fetchAvailableYears();
  };

  const fetchPassageiro = async () => {
    if (!passageiro_id) return null;
    try {
      const { data, error } = await supabase
        .from("passageiros")
        .select("*, escolas(nome)")
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
    }
  };

  const fetchCobrancas = async (year: string) => {
    try {
      const { data, error } = await supabase
        .from("cobrancas")
        .select(`*, passageiros:passageiro_id (nome, nome_responsavel)`)
        .eq("passageiro_id", passageiro_id)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .eq("ano", year)
        .order("mes", { ascending: false });

      if (error) throw error;
      setCobrancas(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
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
      return yearFilter;
    }
  };

  const getMesNome = (mes: number) => {
    const nomeMes = new Date(2024, mes - 1).toLocaleDateString("pt-BR", {
      month: "long",
    });
    return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  };

  const handleDeleteCobrancaClick = (cobranca: Cobranca) => {
    setDeleteCobrancaDialog({ open: true, cobranca });
  };

  const handleDelete = async () => {
    try {
      const numCobrancas = await passageiroService.getNumeroCobrancas(
        passageiro_id
      );

      if (numCobrancas > 0) {
        toast({
          title: "NEGADO: Passageiro possui mensalidades.",
          description: `Mas você ainda pode desativa-lo editando o cadastro.`,
          variant: "destructive",
        });
        return;
      }

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
    }
  };

  const handleToggleClick = (statusAtual: boolean) => {
    const action = statusAtual ? "desativar" : "ativar";
    setConfirmToggleDialog({ open: true, action });
  };

  const handleToggleConfirm = async () => {
    if (!passageiro || !passageiro_id) return;

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
        title: `Lembretes ${
          novoStatus ? "desativados" : "ativados"
        } com sucesso.`,
      });

      fetchCobrancas(yearFilter);
    } catch (err) {
      console.error("Erro ao alternar lembretes:", err);
      toast({
        title: "Não foi possível atualizar o status dos lembretes.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCobranca = async () => {
    if (!deleteCobrancaDialog.cobranca) return;

    try {
      await cobrancaService.excluirCobranca(deleteCobrancaDialog.cobranca);

      toast({
        title: "Mensalidade excluída com sucesso.",
      });

      const newFilterYear = await fetchAvailableYears();

      if (newFilterYear === yearFilter) {
        await fetchCobrancas(yearFilter);
      }
    } catch (error: any) {
      console.error("Erro ao excluir mensalidade:", error);
      toast({
        title: "Erro ao excluir mensalidade.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setDeleteCobrancaDialog({ open: false, cobranca: null });
    }
  };

  const handleEnviarNotificacaoClick = (cobrancaId: string) =>
    setConfirmDialog({ open: true, cobrancaId, action: "enviar" });

  const handleDesfazerClick = (cobrancaId: string) =>
    setConfirmDialog({ open: true, cobrancaId, action: "desfazer" });

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.action === "enviar") {
        toast({
          title: "Notificação enviada com sucesso para o responsável",
        });
      } else if (confirmDialog.action === "desfazer") {
        await cobrancaService.desfazerPagamento(confirmDialog.cobrancaId);

        toast({
          title: "Pagamento desfeito com sucesso.",
        });
        fetchCobrancas(yearFilter);
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
          acc.pago += Number(c.valor);
        } else {
          acc.pendente += Number(c.valor);
          const vencimento = new Date(c.data_vencimento);
          if (vencimento < hoje) {
            acc.emAtraso += 1;
          }
        }
        return acc;
      },
      { pago: 0, pendente: 0, emAtraso: 0 }
    );
  }, [cobrancas]);

  const mensalidadesParaExibir = mostrarTodasMensalidades
    ? cobrancas
    : cobrancas.slice(0, MENSALIDADES_LIMIT);

  if (loading || !passageiro) {
    return <CarteirinhaSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        {/* Mensalidades */}
        <div className="order-1 lg:order-2 lg:col-span-2 lg:row-start-1 lg:h-full">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Mensalidades</CardTitle>
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
                    size="sm"
                    onClick={() => handleOpenRetroativaDialog()}
                  >
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:block">
                      Registrar Mensalidade
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
                                `/passageiros/${passageiro.id}/mensalidade/${cobranca.id}`
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
                              {cobranca.desativar_lembretes &&
                                cobranca.status !== "pago" && (
                                  <div className="text-xs text-yellow-800 mt-2 flex items-center gap-1">
                                    <BellOff className="w-3 h-3" />
                                    Notificações automáticas suspensas
                                  </div>
                                )}
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
                                        `/passageiros/${passageiro.id}/mensalidade/${cobranca.id}`
                                      );
                                    }}
                                  >
                                    Ver Mensalidade
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    disabled={disableRegistrarPagamento(
                                      cobranca
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Fecha o menu antes de abrir o dialog
                                      document.body.click();
                                      setTimeout(
                                        () => openPaymentDialog(cobranca),
                                        10
                                      );
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
                                      handleEnviarNotificacaoClick(cobranca.id);
                                    }}
                                  >
                                    Enviar Notificação
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    disabled={disableToggleLembretes(cobranca)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleLembretes(cobranca);
                                    }}
                                  >
                                    {cobranca.desativar_lembretes
                                      ? "Ativar Notificações"
                                      : "Desativar Notificações"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    disabled={disableDesfazerPagamento(
                                      cobranca
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDesfazerClick(cobranca.id);
                                    }}
                                  >
                                    Desfazer Pagamento
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600 cursor-pointer"
                                    disabled={disableExcluirMensalidade(
                                      cobranca
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCobrancaClick(cobranca);
                                    }}
                                  >
                                    Excluir Mensalidade
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
                    {mensalidadesParaExibir.map((cobranca) => (
                      <div
                        key={cobranca.id}
                        onClick={() =>
                          navigate(
                            `/passageiros/${passageiro.id}/mensalidade/${cobranca.id}`
                          )
                        }
                        className="py-2.5 px-3 active:bg-muted/50"
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
                                    `/passageiros/${passageiro.id}/mensalidade/${cobranca.id}`
                                  );
                                }}
                              >
                                Ver Mensalidade
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={disableRegistrarPagamento(cobranca)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Fecha o menu antes de abrir o dialog
                                  document.body.click();
                                  setTimeout(
                                    () => openPaymentDialog(cobranca),
                                    10
                                  );
                                }}
                              >
                                Registrar Pagamento
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={disableEnviarNotificacao(cobranca)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEnviarNotificacaoClick(cobranca.id);
                                }}
                              >
                                Enviar Notificação
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={disableToggleLembretes(cobranca)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleLembretes(cobranca);
                                }}
                              >
                                {cobranca.desativar_lembretes
                                  ? "Ativar Notificações"
                                  : "Desativar Notificações"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={disableDesfazerPagamento(cobranca)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDesfazerClick(cobranca.id);
                                }}
                              >
                                Desfazer Pagamento
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                disabled={disableExcluirMensalidade(cobranca)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCobrancaClick(cobranca);
                                }}
                              >
                                Excluir Mensalidade
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex justify-between items-end pt-1">
                          <div className="font-bold text-base text-foreground">
                            {Number(cobranca.valor).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </div>
                          <span
                            className={`px-2 py-0.5 inline-block rounded-full text-xs font-medium ${getStatusColor(
                              cobranca.status,
                              cobranca.data_vencimento
                            )}`}
                          >
                            {cobranca.status === "pago"
                              ? `Pago em ${formatDateToBR(
                                  cobranca.data_pagamento
                                )}`
                              : getStatusText(
                                  cobranca.status,
                                  cobranca.data_vencimento
                                )}
                          </span>
                        </div>
                        {cobranca.desativar_lembretes &&
                          cobranca.status !== "pago" && (
                            <div className="mt-2 flex items-center gap-2 text-xs p-1 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                              <BellOff className="h-4 w-4 shrink-0" />
                              <span className="truncate">
                                Lembretes Suspensos
                              </span>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>

                  {cobrancas.length > MENSALIDADES_LIMIT && (
                    <div className="mt-4 text-center md:hidden">
                      <Button
                        variant="link"
                        className="text-primary"
                        onClick={() =>
                          setMostrarTodasMensalidades(!mostrarTodasMensalidades)
                        }
                      >
                        {mostrarTodasMensalidades
                          ? "Ver menos"
                          : `Ver todas as ${cobrancas.length} mensalidades`}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  {passageiro.ativo ? (
                    <>
                      <Alert className="bg-sky-50 border-sky-200 text-sky-900 p-3 md:p-4 rounded-xl gap-3 shadow-sm">
                        <Info className="h-5 w-5 text-sky-500 mt-0.5" />
                        <AlertTitle className="text-sky-900 text-sm font-semibold">
                          Nenhuma mensalidade... ainda!
                        </AlertTitle>
                        <AlertDescription className="text-sky-800 text-sm leading-relaxed">
                          Não se preocupe! A primeira mensalidade aparecerá aqui{" "}
                          <strong>no início do próximo mês</strong>, com o
                          vencimento para o dia programado.
                        </AlertDescription>
                      </Alert>
                    </>
                  ) : (
                    <Alert className="text-blue-900">
                      <AlertTriangle className="h-4 w-4 !text-blue-900" />
                      <AlertTitle className="font-bold">
                        Pasageiro com cadastro desativado
                      </AlertTitle>
                      <AlertDescription className="space-y-3">
                        <p>
                          Este passageiro não terá novas mensalidades enquanto
                          estiver desativado.
                        </p>
                        <p>
                          Para voltar a gerar cobranças manuais e automáticas,
                          reative o cadastro.
                        </p>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleToggleClick(passageiro.ativo)}
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
              <CardTitle className="text-lg">
                Informações do Passageiro
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                className="h-8 w-8"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem icon={User} label="Nome">
                {passageiro.nome}{" "}
              </InfoItem>
              <InfoItem icon={Contact} label="Status do Cadastro">
                <Badge
                  variant={passageiro.ativo ? "default" : "destructive"}
                  className={passageiro.ativo ? "bg-green-600 text-white" : ""}
                >
                  {passageiro.ativo ? "Ativo" : "Desativado"}
                </Badge>
              </InfoItem>
              <InfoItem icon={Contact} label="Responsável">
                {passageiro.nome_responsavel}
              </InfoItem>
              <InfoItem icon={School} label="Escola">
                {passageiro.escolas?.nome || "Não informada"}
              </InfoItem>
              <InfoItem icon={MessageCircle} label="Telefone">
                {formatarTelefone(passageiro.telefone_responsavel)}
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
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleToggleClick(passageiro.ativo)}
                  >
                    Reativar Cadastro
                  </Button>
                )}

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!passageiro.telefone_responsavel}
                  onClick={() =>
                    window.open(
                      `https://wa.me/${passageiro.telefone_responsavel?.replace(
                        /\D/g,
                        ""
                      )}`,
                      "_blank"
                    )
                  }
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Falar no WhatsApp
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
                variant="ghost"
                size="icon"
                onClick={() => setIsObservacoesEditing(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isObservacoesEditing ? (
                <Textarea
                  value={obsText}
                  onChange={(e) => setObsText(e.target.value)}
                  rows={5}
                  placeholder="Ex: Alergia a amendoim, deixar na casa da avó às sextas, precisa de ajuda para colocar o cinto..."
                  autoFocus
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
                  <TrendingUp className="w-4 h-4" /> <span>Total Pago</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {yearlySummary.pago.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> <span>Pendente</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {yearlySummary.pendente.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hash className="w-4 h-4" />{" "}
                  <span>Mensalidades em Atraso</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {yearlySummary.emAtraso}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedCobranca && (
        <ManualPaymentDialog
          isOpen={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          cobrancaId={selectedCobranca.id}
          passageiroNome={passageiro.nome}
          responsavelNome={passageiro.nome_responsavel}
          valorOriginal={Number(selectedCobranca.valor)}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
      <CobrancaRetroativaDialog
        isOpen={retroativaDialogOpen}
        onClose={() => setRetroativaDialogOpen(false)}
        passageiroId={passageiro.id}
        passageiroNome={passageiro.nome}
        passageiroResponsavelNome={passageiro.nome_responsavel}
        valorMensalidade={passageiro.valor_mensalidade}
        diaVencimento={passageiro.dia_vencimento}
        onCobrancaAdded={() => handleCobrancaAdded()}
      />
      <ConfirmationDialog
        open={confirmToggleDialog.open}
        onOpenChange={(open) => setConfirmToggleDialog({ open, action: "" })}
        title={
          confirmToggleDialog.action === "ativar"
            ? "Reativar Passageiro"
            : "Desativar Passageiro"
        }
        description={`Deseja realmente ${confirmToggleDialog.action} o cadastro de ${passageiro.nome}? Esta ação pode afetar a geração de cobranças.`}
        onConfirm={handleToggleConfirm}
        confirmText={
          confirmToggleDialog.action === "ativar" ? "Reativar" : "Desativar"
        }
        variant={
          confirmToggleDialog.action === "desativar" ? "destructive" : "default"
        }
      />
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
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
        description="Deseja excluir permanentemente essa mensalidade?"
        onConfirm={handleDeleteCobranca}
        confirmText="Excluir"
        variant="destructive"
      />
      <ConfirmationDialog
        open={deletePassageiroDialog.open}
        onOpenChange={(open) => setDeletePassageiroDialog({ open })}
        title="Excluir Passageiro"
        description="Deseja excluir permanentemente este passageiro?"
        onConfirm={handleDelete}
        confirmText="Excluir"
        variant="destructive"
      />
      {isFormOpen && (
        <PassageiroFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          editingPassageiro={passageiro}
          onSuccess={handlePassageiroFormSuccess}
        />
      )}
    </div>
  );
}
