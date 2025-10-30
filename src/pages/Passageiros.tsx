import ConfirmationDialog from "@/components/ConfirmationDialog";
import EscolaFormDialog from "@/components/EscolaFormDialog";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import PassageiroFormDialog from "@/components/PassageiroFormDialog";
import PrePassageiros from "@/components/PrePassageiros";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import VeiculoFormDialog from "@/components/VeiculoFormDialog";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { passageiroService } from "@/services/passageiroService";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { Veiculo } from "@/types/veiculo";
import { safeCloseDialog } from "@/utils/dialogCallback";
import { formatPeriodo, periodos } from "@/utils/formatters";
import { formatarPlacaExibicao } from "@/utils/placaUtils";
import {
  CreditCard,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const PassengerListSkeleton = () => (
  <div className="space-y-3 mt-8">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between p-3 border rounded-lg"
      >
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ))}
  </div>
);

export default function Passageiros() {
  const [novaEscolaId, setNovaEscolaId] = useState<string | null>(null);
  const [novoVeiculoId, setNovoVeiculoId] = useState<string | null>(null);
  const [isCreatingEscola, setIsCreatingEscola] = useState(false);
  const [isCreatingVeiculo, setIsCreatingVeiculo] = useState(false);
  const { setPageTitle, setPageSubtitle } = useLayout();
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [countPassageirosAtivos, setcountPassageirosAtivos] =
    useState<number>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassageiro, setEditingPassageiro] = useState<Passageiro | null>(
    null
  );
  const [selectedVeiculo, setSelectedVeiculo] = useState<string>("todos");
  const [selectedEscola, setSelectedEscola] = useState<string>("todas");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("todos");

  const [modePassageiroFormDialog, setModePassageiroFormDialog] =
    useState<string>("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    passageiroId: string;
  }>({ open: false, passageiroId: "" });
  const [confirmToggleDialog, setConfirmToggleDialog] = useState({
    open: false,
    passageiro: null as Passageiro | null,
    action: "" as "ativar" | "desativar" | "",
  });
  const firstRender = useRef(true);

  useEffect(() => {
    if (!profile?.id) return;
    fetchEscolas();
    fetchVeiculos();
    fetchPassageiros(false, {
      search: searchTerm,
      escola: selectedEscola,
      veiculo: selectedVeiculo,
      status: selectedStatus,
    });
    firstRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  useEffect(() => {
    if (firstRender.current) return;
    fetchPassageiros(true, {
      search: searchTerm,
      escola: selectedEscola,
      veiculo: selectedVeiculo,
      status: selectedStatus,
      periodo: selectedPeriodo,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEscola, selectedVeiculo, selectedStatus, selectedPeriodo]);

  // Campo de busca -> aplica debounce
  useEffect(() => {
    if (firstRender.current) return;
    const handler = setTimeout(() => {
      fetchPassageiros(true, {
        search: searchTerm,
        escola: selectedEscola,
        veiculo: selectedVeiculo,
        status: selectedStatus,
        periodo: selectedPeriodo,
      });
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    let subTitle = "";
    if (countPassageirosAtivos != null) {
      subTitle = `${
        countPassageirosAtivos === 1
          ? "1 passageiro ativo"
          : `${countPassageirosAtivos} passageiros ativos`
      }`;
    } else {
      subTitle = "Carregando...";
    }

    setPageTitle("Passageiros");
    setPageSubtitle(subTitle);
  }, [passageiros, setPageTitle, setPageSubtitle]);

  async function fetchPassageiros(
    isRefresh = false,
    filtros?: {
      search?: string;
      escola?: string;
      veiculo?: string;
      status?: string;
      periodo?: string;
    }
  ) {
    if (!profile?.id) return;

    try {
      // controla tipo de carregamento
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      let query = supabase
        .from("passageiros")
        .select(
          `
          *,
          escolas(nome),
          veiculos(placa)
        `
        )
        .eq("usuario_id", profile.id)
        .order("nome");

      if (filtros?.search) {
        query = query.or(
          `nome.ilike.%${filtros.search}%,nome_responsavel.ilike.%${filtros.search}%`
        );
      }

      if (filtros?.escola && filtros.escola !== "todas") {
        query = query.eq("escola_id", filtros.escola);
      }

      if (filtros?.veiculo && filtros.veiculo !== "todos") {
        query = query.eq("veiculo_id", filtros.veiculo);
      }

      if (filtros?.periodo && filtros.periodo !== "todos") {
        query = query.eq("periodo", filtros.periodo);
      }

      if (filtros?.status && filtros.status !== "todos") {
        const ativo = filtros.status === "ativo";
        query = query.eq("ativo", ativo);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPassageiros(data || []);
      setcountPassageirosAtivos(data.filter((e) => e.ativo).length);
    } catch (err) {
      console.error("Erro ao buscar passageiros:", err);
      toast({
        title: "Erro ao carregar passageiros.",
        description: "Não foi possível obter os dados no momento.",
        variant: "destructive",
      });
    } finally {
      // encerra tipo correto de carregamento
      if (!isRefresh) setLoading(false);
      else setRefreshing(false);
    }
  }

  const handleSuccessFormPassageiro = () => {
    setNovoVeiculoId(null);
    setNovaEscolaId(null);
    fetchPassageiros(true, {
      search: searchTerm,
      escola: selectedEscola,
      veiculo: selectedVeiculo,
      status: selectedStatus,
      periodo: selectedPeriodo,
    });
  };

  const handleClosePassageiroFormDialog = () => {
    safeCloseDialog(() => {
      setNovoVeiculoId(null);
      setNovaEscolaId(null);
      setIsDialogOpen(false);
    });
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

  const handleFinalizeNewPrePassageiro = async () => {
    fetchPassageiros(true);
  };

  const handleDelete = async () => {
    try {
      const numCobrancas = await passageiroService.getNumeroCobrancas(
        deleteDialog.passageiroId
      );

      if (numCobrancas > 0) {
        toast({
          title: "Não é possível excluir.",
          description: `Este passageiro possui cobranças em seu histórico.`,
          variant: "destructive",
        });
        return;
      }

      setRefreshing(true);

      await passageiroService.excluirPassageiro(deleteDialog.passageiroId);

      toast({ title: "Passageiro excluído com sucesso." });
      fetchPassageiros(true);
    } catch (error: any) {
      console.error("Erro ao excluir passageiro:", error);
      toast({
        title: "Erro ao excluir passageiro.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, passageiroId: "" });
      setRefreshing(false);
    }
  };

  const handleToggleClick = (passageiro: Passageiro) => {
    const action = passageiro.ativo ? "desativar" : "ativar";
    setConfirmToggleDialog({ open: true, passageiro, action });
  };

  const handleToggleConfirm = async () => {
    const p = confirmToggleDialog.passageiro;
    if (!p) return;

    setRefreshing(true);

    try {
      await passageiroService.toggleAtivo(p.id, p.ativo);

      toast({
        title: `Passageiro ${confirmToggleDialog.action} com sucesso.`,
      });

      fetchPassageiros(true, {
        search: searchTerm,
        escola: selectedEscola,
        veiculo: selectedVeiculo,
        status: selectedStatus,
        periodo: selectedPeriodo,
      });
    } catch (error: any) {
      console.error("Erro ao alternar status:", error);
      toast({
        title: `Erro ao ${confirmToggleDialog.action} o passageiro.`,
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setConfirmToggleDialog({ open: false, passageiro: null, action: "" });
      setRefreshing(false);
    }
  };

  const fetchVeiculos = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from("veiculos")
        .select("id, placa")
        .eq("usuario_id", profile.id)
        .eq("ativo", true)
        .order("placa");
      if (error) throw error;
      setVeiculos(data || []);
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
    }
  };

  const fetchEscolas = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from("escolas")
        .select("*")
        .eq("usuario_id", profile.id)
        .order("nome");
      if (error) throw error;
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
    }
  };

  const handleEdit = (passageiro: Passageiro) => {
    safeCloseDialog(() => {
      setEditingPassageiro(passageiro);
      setModePassageiroFormDialog("edit");
      setIsDialogOpen(true);
    });
  };

  const handleOpenNewDialog = () => {
    safeCloseDialog(() => {
      setEditingPassageiro(null);
      setModePassageiroFormDialog("create");
      setIsDialogOpen(true);
    });
  };

  const handleCadastrarRapido = async () => {
    if (!profile?.id) return;

    if (!escolas || escolas.length === 0) {
      toast({
        title: "Operação Impossível.",
        description:
          "Cadastre pelo menos uma escola ativa antes de usar o Cadastro FAKE.",
        variant: "destructive",
      });
      return;
    }
    if (!veiculos || veiculos.length === 0) {
      toast({
        title: "Operação Impossível.",
        description:
          "Cadastre pelo menos um veículo ativa antes de usar o Cadastro FAKE.",
        variant: "destructive",
      });
      return;
    }

    setRefreshing(true);

    const hoje = new Date();
    const valor = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
    const valorInString = `R$ ${valor},00`;

    const numeroPassageiro = Math.floor(Math.random() * 1000);

    const fakeData = {
      nome: "Thiago " + numeroPassageiro,
      nome_responsavel: `Monica ${numeroPassageiro}`,
      email_responsavel: "abiliodasvendas@gmail.com",
      telefone_responsavel: "11951186951",
      cpf_responsavel: "39542391838",
      periodo: "manha",
      observacoes: `teste do ${numeroPassageiro}`,
      valor_cobranca: valorInString,
      dia_vencimento: hoje.getDate(),
      escola_id: escolas[0].id,
      veiculo_id: veiculos[0].id,
      ativo: true,
      emitir_cobranca_mes_atual: true,
      logradouro: "Rua Comendador Artur Capodaglio",
      numero: "433",
      bairro: "Americanopolis",
      cidade: "São Paulo",
      estado: "SP",
      cep: "04410080",
    };

    try {
      await passageiroService.createPassageiroComTransacao(
        fakeData,
        profile.id
      );

      toast({ title: "Passageiro cadastrado rapidamente com sucesso." });

      fetchPassageiros(true);
    } catch (error: any) {
      console.error("Erro no Cadastro Rápido:", error);
      toast({
        title: "Erro no Cadastro Rápido.",
        description: error.message || "Não foi possível concluir o cadastro.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleHistorico = (passageiro: Passageiro) => {
    navigate(`/passageiros/${passageiro.id}`);
  };

  const pullToRefreshReload = async () => {
    fetchPassageiros();
    fetchEscolas();
    setRefreshKey((prev) => prev + 1);
  };

  if (isProfileLoading || !profile) {
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
            <Tabs defaultValue="passageiros" className="w-full">
              <TabsList className="grid w-full grid-cols-2 border">
                <TabsTrigger
                  value="passageiros"
                  className="data-[state=inactive]:text-gray-600 
            data-[state=active]:bg-primary 
            data-[state=active]:text-white 
            hover:bg-gray-100"
                >
                  Passageiros
                </TabsTrigger>
                <TabsTrigger
                  value="pre-cadastros"
                  className="data-[state=inactive]:text-gray-600 
            data-[state=active]:bg-primary 
            data-[state=active]:text-white 
            hover:bg-gray-100"
                >
                  Pré-Cadastros
                </TabsTrigger>
              </TabsList>

              <TabsContent value="passageiros" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setShowMobileFilters(!showMobileFilters)
                          }
                          className={`md:hidden`}
                          title={
                            showMobileFilters
                              ? "Esconder Filtros"
                              : "Mostrar Filtros"
                          }
                        >
                          <Filter
                            className={`h-4 w-4 ${
                              showMobileFilters
                                ? "text-blue-600 border-primary"
                                : ""
                            }`}
                          />
                          <span
                            className={showMobileFilters ? "text-primary" : ""}
                          >
                            Filtros
                          </span>
                        </Button>
                      </CardTitle>

                      <div className="flex items-center gap-2">
                        <Button onClick={handleOpenNewDialog}>
                          <Plus className="h-4 w-4" />
                          <span>Novo Passageiro</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 p-1 mb-2">
                      <Label htmlFor="search">Buscar por Nome</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Passageiro ou responsável..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {import.meta.env.MODE === "development" && (
                      <Button
                        onClick={handleCadastrarRapido}
                        variant="outline"
                        className="gap-2 text-uppercase"
                      >
                        GERAR PASSAGEIRO FAKE
                      </Button>
                    )}

                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        showMobileFilters ? "max-h-[500px]" : "max-h-0"
                      } md:max-h-full`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-1">
                        <div className="space-y-2">
                          <Label htmlFor="status-filter">Status</Label>
                          <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                          >
                            <SelectTrigger id="status-filter">
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              <SelectItem value="todos">Todos</SelectItem>
                              <SelectItem value="ativo">Ativo</SelectItem>
                              <SelectItem value="desativados">
                                Desativados
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="escola-filter">Escola</Label>
                          <Select
                            value={selectedEscola}
                            onValueChange={setSelectedEscola}
                          >
                            <SelectTrigger id="escola-filter">
                              <SelectValue placeholder="Todas" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              <SelectItem value="todas">Todas</SelectItem>
                              {escolas.map((escola) => (
                                <SelectItem key={escola.id} value={escola.id}>
                                  {escola.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="veiculo-filter">Veículo</Label>
                          <Select
                            value={selectedVeiculo}
                            onValueChange={setSelectedVeiculo}
                          >
                            <SelectTrigger id="veiculo-filter">
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              <SelectItem value="todos">Todos</SelectItem>
                              {veiculos.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {formatarPlacaExibicao(v.placa)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="periodo-filter">Período</Label>
                          <Select
                            value={selectedPeriodo}
                            onValueChange={setSelectedPeriodo}
                          >
                            <SelectTrigger id="periodo-filter">
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              <SelectItem value="todos">Todos</SelectItem>
                              {periodos.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  {p.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-8">
                      {loading ? (
                        <PassengerListSkeleton />
                      ) : passageiros.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                          <Users2 className="w-12 h-12 mb-4 text-gray-300" />
                          <p>
                            {searchTerm
                              ? `Nenhum passageiro ou responsável encontrado com o nome "${searchTerm}"`
                              : "Nenhum passageiro encontrado"}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="p-3 text-left text-xs font-medium text-gray-600">
                                    Nome
                                  </th>
                                  <th className="p-3 text-left text-xs font-medium text-gray-600">
                                    Status
                                  </th>
                                  <th className="p-3 text-left text-xs font-medium text-gray-600">
                                    Escola
                                  </th>
                                  <th className="p-3 text-left text-xs font-medium text-gray-600">
                                    Período
                                  </th>
                                  <th className="p-3 text-left text-xs font-medium text-gray-600">
                                    Veículo
                                  </th>
                                  <th className="p-3 text-left text-xs font-medium text-gray-600">
                                    Valor Cobrança
                                  </th>
                                  <th className="p-3 text-center text-xs font-medium text-gray-600">
                                    Ações
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {passageiros.map((passageiro) => (
                                  <tr
                                    key={passageiro.id}
                                    onClick={() => handleHistorico(passageiro)}
                                    className="hover:bg-muted/50 cursor-pointer"
                                  >
                                    <td className="p-3 align-top">
                                      <div className="font-semibold text-sm text-gray-800">
                                        {passageiro.nome}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Responsável:{" "}
                                        <b>
                                          {passageiro.nome_responsavel || "-"}
                                        </b>
                                      </div>
                                    </td>
                                    <td className="p-3 align-top">
                                      <span
                                        className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                                          passageiro.ativo
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {passageiro.ativo
                                          ? "Ativo"
                                          : "Desativado"}
                                      </span>
                                    </td>
                                    <td className="p-3 align-top">
                                      <span className="text-sm text-muted-foreground">
                                        {passageiro.escolas?.nome ||
                                          "Não informada"}
                                      </span>
                                    </td>
                                    <td className="p-3 align-top">
                                      <span className="text-sm text-muted-foreground">
                                        {formatPeriodo(passageiro.periodo)}
                                      </span>
                                    </td>
                                    <td className="p-3 align-top">
                                      <span className="text-sm text-muted-foreground">
                                        {passageiro.veiculos?.placa
                                          ? formatarPlacaExibicao(
                                              passageiro.veiculos.placa
                                            )
                                          : "Não informado"}
                                      </span>
                                    </td>

                                    <td className="p-3 align-top">
                                      <div className="font-semibold text-sm text-gray-800">
                                        {Number(
                                          passageiro.valor_cobranca
                                        ).toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })}
                                      </div>
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
                                              handleHistorico(passageiro);
                                            }}
                                          >
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Ver Carteirinha
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEdit(passageiro);
                                            }}
                                          >
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Editar
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleClick(passageiro);
                                            }}
                                          >
                                            {passageiro.ativo ? (
                                              <>
                                                <ToggleLeft className="w-4 h-4 mr-2" />
                                                Desativar
                                              </>
                                            ) : (
                                              <>
                                                <ToggleRight className="w-4 h-4 mr-2" />
                                                Reativar
                                              </>
                                            )}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="cursor-pointer text-red-600"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteDialog({
                                                open: true,
                                                passageiroId: passageiro.id,
                                              });
                                            }}
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Excluir
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
                            {passageiros.map((passageiro) => (
                              <div
                                key={passageiro.id}
                                onClick={() => handleHistorico(passageiro)}
                                className="py-4 px-0 active:bg-muted/50"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="">
                                    <div className="font-semibold text-gray-800 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                      {passageiro.nome}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Responsável:{" "}
                                      <b>{passageiro.nome_responsavel}</b>
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
                                          handleHistorico(passageiro);
                                        }}
                                      >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Ver Carteirinha
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(passageiro);
                                        }}
                                      >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleClick(passageiro);
                                        }}
                                      >
                                        {passageiro.ativo ? (
                                          <>
                                            <ToggleLeft className="w-4 h-4 mr-2" />
                                            Desativar
                                          </>
                                        ) : (
                                          <>
                                            <ToggleRight className="w-4 h-4 mr-2" />
                                            Reativar
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteDialog({
                                            open: true,
                                            passageiroId: passageiro.id,
                                          });
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="text-sm flex justify-between">
                                    <span className="text-muted-foreground">
                                      Valor Cobrança
                                    </span>
                                    <span className="font-medium">
                                      {Number(
                                        passageiro.valor_cobranca
                                      ).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      })}
                                    </span>
                                  </div>

                                  <div className="text-sm flex justify-between">
                                    <span className="text-muted-foreground">
                                      Escola
                                    </span>
                                    <span className="font-medium">
                                      {passageiro.escolas?.nome ||
                                        "Não informada"}
                                    </span>
                                  </div>

                                  <div className="text-sm flex justify-between">
                                    <span className="text-muted-foreground">
                                      Veículo
                                    </span>
                                    <span className="font-medium">
                                      {formatarPlacaExibicao(
                                        passageiro.veiculos?.placa
                                      ) || "Não informado"}
                                    </span>
                                  </div>

                                  <div className="text-sm flex justify-between">
                                    <span className="text-muted-foreground">
                                      Período
                                    </span>
                                    <span className="font-medium">
                                      {formatPeriodo(passageiro.periodo)}
                                    </span>
                                  </div>

                                  <div className="text-sm flex justify-between">
                                    <span className="text-muted-foreground">
                                      Status
                                    </span>

                                    <span
                                      className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                                        passageiro.ativo
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {passageiro.ativo
                                        ? "Ativo"
                                        : "Desativado"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pre-cadastros" className="mt-4">
                <PrePassageiros
                  refreshKey={refreshKey}
                  onFinalizeNewPrePassageiro={handleFinalizeNewPrePassageiro}
                ></PrePassageiros>
              </TabsContent>
            </Tabs>
          </div>

          {isDialogOpen && (
            <PassageiroFormDialog
              isOpen={isDialogOpen}
              onClose={handleClosePassageiroFormDialog}
              onSuccess={() => handleSuccessFormPassageiro()}
              editingPassageiro={editingPassageiro}
              onCreateEscola={() => setIsCreatingEscola(true)}
              onCreateVeiculo={() => setIsCreatingVeiculo(true)}
              mode={modePassageiroFormDialog}
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

          <ConfirmationDialog
            open={confirmToggleDialog.open}
            onOpenChange={(open) =>
              setConfirmToggleDialog({ open, passageiro: null, action: "" })
            }
            title={
              confirmToggleDialog.action === "ativar"
                ? "Reativar Passageiro"
                : "Desativar Passageiro"
            }
            description={`Deseja realmente ${confirmToggleDialog.action} o cadastro deste passageiro?"`}
            onConfirm={handleToggleConfirm}
            confirmText="Confirmar"
            variant={
              confirmToggleDialog.action === "desativar"
                ? "destructive"
                : "default"
            }
          />

          <ConfirmationDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog({ open, passageiroId: "" })}
            title="Excluir Passageiro"
            description="Deseja excluir permanentemente este passageiro?"
            onConfirm={handleDelete}
            confirmText="Confirmar"
            variant="destructive"
          />
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={refreshing} text="Aguarde..." />
    </>
  );
}
