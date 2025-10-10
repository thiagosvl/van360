import ConfirmationDialog from "@/components/ConfirmationDialog";
import PassageiroFormDialog from "@/components/PassageiroFormDialog";
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
import { useLayout } from "@/contexts/LayoutContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { passageiroService } from "@/services/passageiroService";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import {
  CreditCard,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  const { setPageTitle, setPageSubtitle } = useLayout();
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [countPassageirosAtivos, setcountPassageirosAtivos] =
    useState<number>(null);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassageiro, setEditingPassageiro] = useState<Passageiro | null>(
    null
  );
  const [selectedEscola, setSelectedEscola] = useState<string>("todas");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    passageiroId: string;
  }>({ open: false, passageiroId: "" });
  const [confirmToggleDialog, setConfirmToggleDialog] = useState({
    open: false,
    passageiro: null as Passageiro | null,
    action: "" as "ativar" | "desativar" | "",
  });

  const fetchPassageiros = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("passageiros")
        .select(`*, escolas(nome)`)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .order("nome");
      if (selectedEscola !== "todas") {
        query = query.eq("escola_id", selectedEscola);
      }
      if (searchTerm.length >= 2) {
        query = query.or(
          `nome.ilike.%${searchTerm}%,nome_responsavel.ilike.%${searchTerm}%`
        );
      }
      if (selectedStatus !== "todos") {
        query = query.eq("ativo", selectedStatus === "ativo");
      }
      const { data, error } = await query;
      if (error) throw error;
      setPassageiros(data || []);
      setcountPassageirosAtivos(data.filter((e) => e.ativo).length);
    } catch (error) {
      console.error("Erro ao buscar passageiros:", error);
      toast({ title: "Erro ao carregar passageiros.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedEscola, selectedStatus, toast]);

  useEffect(() => {
    fetchEscolas();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPassageiros();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchPassageiros]);

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

    console.log('ativos', countPassageirosAtivos);

    setPageTitle("Passageiros");
    setPageSubtitle(subTitle);
  }, [passageiros, setPageTitle, setPageSubtitle]);

  const handleDelete = async () => {
    try {
      const numCobrancas = await passageiroService.getNumeroCobrancas(
        deleteDialog.passageiroId
      );

      if (numCobrancas > 0) {
        toast({
          title: "Não foi possível excluir.",
          description: `Este passageiro possui ${numCobrancas} mensalidade(s) em seu histórico.`,
          variant: "destructive",
        });
        return;
      }

      await passageiroService.excluirPassageiro(deleteDialog.passageiroId);

      toast({ title: "Passageiro excluído com sucesso." });
      fetchPassageiros();
    } catch (error: any) {
      console.error("Erro ao excluir passageiro:", error);
      toast({
        title: "Erro ao excluir passageiro.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, passageiroId: "" });
    }
  };

  const handleToggleClick = (passageiro: Passageiro) => {
    const action = passageiro.ativo ? "desativar" : "ativar";
    setConfirmToggleDialog({ open: true, passageiro, action });
  };

  const handleToggleConfirm = async () => {
    const p = confirmToggleDialog.passageiro;
    if (!p) return;

    try {
      await passageiroService.toggleAtivo(p.id, p.ativo);

      toast({
        title: `Passageiro ${confirmToggleDialog.action} com sucesso.`,
      });

      fetchPassageiros();
    } catch (error: any) {
      console.error("Erro ao alternar status:", error);
      toast({
        title: `Erro ao ${confirmToggleDialog.action} o passageiro.`,
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setConfirmToggleDialog({ open: false, passageiro: null, action: "" });
    }
  };

  const fetchEscolas = async () => {
    try {
      const { data, error } = await supabase
        .from("escolas")
        .select("*")
        .eq("ativo", true)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .order("nome");
      if (error) throw error;
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
    }
  };

  const handleEdit = (passageiro: Passageiro) => {
    setEditingPassageiro(passageiro);
    setIsDialogOpen(true);
  };

  const handleOpenNewDialog = () => {
    setEditingPassageiro(null);
    setIsDialogOpen(true);
  };

  const handleCadastrarRapido = async () => {
    if (!escolas || escolas.length === 0) {
      toast({
        title: "Operação Impossível.",
        description:
          "Cadastre pelo menos uma escola ativa antes de usar o Cadastro Rápido.",
        variant: "destructive",
      });
      return;
    }

    const hoje = new Date();
    const valor = Math.floor(Math.random() * (200 - 100 + 1)) + 100;

    const numeroPassageiro = Math.floor(Math.random() * 1000);

    const fakeData = {
      nome: "Passag. Teste " + numeroPassageiro,
      nome_responsavel: `Resp. do ${numeroPassageiro} `,
      email_responsavel: "abiliodasvendas@gmail.com",
      telefone_responsavel: "11951186951",
      cpf_responsavel: "39542391838",
      genero: "Masculino",
      observacoes: `teste do ${numeroPassageiro}`,
      valor_mensalidade: valor.toString(),
      dia_vencimento: hoje.getDate().toString(),
      escola_id: escolas[0].id,
      ativo: true,
      emitir_cobranca_mes_atual: true,
    };

    try {
      await passageiroService.createPassageiroComTransacao(fakeData);

      toast({ title: "Passageiro cadastrado rapidamente com sucesso." });

      fetchPassageiros();
    } catch (error: any) {
      console.error("Erro no Cadastro Rápido:", error);
      toast({
        title: "Erro no Cadastro Rápido.",
        description: error.message || "Não foi possível concluir o cadastro.",
        variant: "destructive",
      });
    }
  };

  const handleHistorico = (passageiro: Passageiro) => {
    navigate(`/passageiros/${passageiro.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="flex justify-end items-center mb-6">
          <div className="flex gap-2">
            <Button
              onClick={handleCadastrarRapido}
              variant="destructive"
              className="gap-2 text-uppercase text-white"
            >
              CADASTRO PREGUIÇOSO
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <span>Passageiros</span>
                {countPassageirosAtivos > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    {countPassageirosAtivos}
                  </span>
                )}
              </CardTitle>

              <Button onClick={handleOpenNewDialog}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Passageiro</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar por Nome</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nome do passageiro ou responsável..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="desativado">Desativado</SelectItem>
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
                    <SelectValue placeholder="Todas as escolas" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="todas">Todas as escolas</SelectItem>
                    {escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <PassengerListSkeleton />
              ) : passageiros.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                  <Users2 className="w-12 h-12 mb-4 text-gray-300" />
                  <p>
                    {searchTerm
                      ? `Nenhum passageiro encontrado para "${searchTerm}"`
                      : "Nenhum passageiro cadastrado"}
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
                              <div className="font-medium text-sm text-gray-900">
                                {passageiro.nome}
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
                                {passageiro.ativo ? "Ativo" : "Desativado"}
                              </span>
                            </td>
                            <td className="p-3 align-top">
                              <span className="text-sm text-muted-foreground">
                                {passageiro.escolas?.nome || "Não informada"}
                              </span>
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
                        className="p-4 active:bg-muted/50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="pr-2">
                            <div className="font-semibold text-gray-800">
                              {passageiro.nome}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {passageiro.escolas?.nome || "Sem escola"}
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
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                              passageiro.ativo
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {passageiro.ativo ? "Ativo" : "Desativado"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isDialogOpen && (
        <PassageiroFormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          editingPassageiro={editingPassageiro}
          onSuccess={fetchPassageiros}
        />
      )}

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
        description={`Deseja realmente ${
          confirmToggleDialog.action
        } o cadastro de ${
          confirmToggleDialog.passageiro?.nome || "este passageiro"
        }? Esta ação pode afetar a geração de cobranças.`}
        onConfirm={handleToggleConfirm}
        confirmText={
          confirmToggleDialog.action === "ativar" ? "Ativar" : "Desativar"
        }
        variant={
          confirmToggleDialog.action === "desativar" ? "destructive" : "default"
        }
      />

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, passageiroId: "" })}
        title="Excluir Passageiro"
        description="Deseja excluir permanentemente este passageiro?"
        onConfirm={handleDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}
