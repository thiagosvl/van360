import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";
import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { PrePassengerListSkeleton } from "@/components/skeletons";
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
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreatePrePassageiro,
  useDeletePrePassageiro,
  usePassageiros,
  usePrePassageiros,
} from "@/hooks";
import { PrePassageiro } from "@/types/prePassageiro";
import { Usuario } from "@/types/usuario";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { formatarTelefone, periodos } from "@/utils/formatters";
import { mockGenerator } from "@/utils/mockDataGenerator";
import { toast } from "@/utils/notifications/toast";
import {
  CheckCircle,
  MoreVertical,
  Search,
  Trash2,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";

type PlanoUsuario = {
  slug: string;
  status: string;
  trial_end_at: string | null;
  ativo: boolean;
  planoCompleto: any;
  isTrial: boolean;
  isValidTrial: boolean;
  isActive: boolean;
  isValidPlan: boolean;
  isFreePlan: boolean;
  isCompletePlan: boolean;
  isEssentialPlan: boolean;
} | null;

interface PrePassageirosProps {
  onFinalizeNewPrePassageiro: () => void;
  refreshKey?: number;
  profile: Usuario | null | undefined;
  plano: PlanoUsuario;
}

export default function PrePassageiros({
  onFinalizeNewPrePassageiro,
  refreshKey,
  profile,
  plano,
}: PrePassageirosProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [novaEscolaId, setNovaEscolaId] = useState<string | null>(null);
  const [novoVeiculoId, setNovoVeiculoId] = useState<string | null>(null);
  const [isCreatingEscola, setIsCreatingEscola] = useState(false);
  const [isCreatingVeiculo, setIsCreatingVeiculo] = useState(false);

  const createPrePassageiro = useCreatePrePassageiro();
  const deletePrePassageiro = useDeletePrePassageiro();

  const isActionLoading =
    createPrePassageiro.isPending || deletePrePassageiro.isPending;

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    prePassageiroId: string;
  }>({ open: false, prePassageiroId: "" });

  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [selectedPrePassageiro, setSelectedPrePassageiro] =
    useState<PrePassageiro | null>(null);

  const {
    data: prePassageirosData,
    isLoading: isPrePassageirosLoading,
    isFetching: isPrePassageirosFetching,
    refetch: refetchPrePassageiros,
  } = usePrePassageiros(
    {
      usuarioId: profile?.id,
      search: debouncedSearchTerm || undefined,
    },
    {
      enabled: !!profile?.id,
      onError: () => toast.error("erro.carregar"),
    }
  );

  const { data: passageirosData } = usePassageiros(
    { usuarioId: profile?.id },
    { enabled: !!profile?.id }
  );

  const prePassageiros =
    (prePassageirosData as PrePassageiro[] | undefined) ?? [];
  const countPassageiros =
    (passageirosData as { list?: any[] } | undefined)?.list?.length || 0;
  const loading = isPrePassageirosLoading || isPrePassageirosFetching;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (refreshKey !== undefined) {
      refetchPrePassageiros();
    }
  }, [refreshKey, refetchPrePassageiros]);

  const handleCloseEscolaFormDialog = () => {
    safeCloseDialog(() => setIsCreatingEscola(false));
  };

  const handleCloseVeiculoFormDialog = () => {
    safeCloseDialog(() => setIsCreatingVeiculo(false));
  };

  const handleEscolaCreated = (novaEscola: any) => {
    safeCloseDialog(() => {
      setIsCreatingEscola(false);
      setNovaEscolaId(novaEscola.id);
    });
  };

  const handleVeiculoCreated = (novoVeiculo: any) => {
    safeCloseDialog(() => {
      setIsCreatingVeiculo(false);
      setNovoVeiculoId(novoVeiculo.id);
    });
  };

  const handleCadastrarRapidoLink = async () => {
    if (!profile?.id) {
      toast.error("auth.erro.login", { description: "Faça login novamente." });
      return;
    }

    const hoje = new Date();
    const valor = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
    const valorInString = `R$ ${valor},00`;

    const nomePassageiro = mockGenerator.name();
    const nomeResponsavel = mockGenerator.name();
    const emailResponsavel = mockGenerator.email(nomeResponsavel);
    const telefoneResponsavel = mockGenerator.phone();
    const cpfResponsavel = mockGenerator.cpf();
    const endereco = mockGenerator.address();

    const fakePayload: any = {
      nome: nomePassageiro,
      nome_responsavel: nomeResponsavel,
      email_responsavel: emailResponsavel,
      telefone_responsavel: telefoneResponsavel,
      cpf_responsavel: cpfResponsavel,
      usuario_id: profile.id,
      observacoes: `Solicitação rápida gerada automaticamente`,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      periodo: periodos[0].value,
      escola_id: novaEscolaId,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      cep: endereco.cep,
      referencia: `Perto do ${endereco.bairro}`,
      valor_cobranca: valorInString,
      dia_vencimento: hoje.getDate(),
    };

    createPrePassageiro.mutate(fakePayload);
  };

  const handleDelete = async () => {
    deletePrePassageiro.mutate(deleteDialog.prePassageiroId, {
      onSuccess: () => {
        setDeleteDialog({ open: false, prePassageiroId: "" });
      },
    });
  };

  const handleFinalizeClick = (prePassageiro: PrePassageiro) => {
    setSelectedPrePassageiro(prePassageiro);
    setIsFinalizeDialogOpen(true);
  };

  const handleFinalizeSuccess = async () => {
    setNovoVeiculoId(null);
    setNovaEscolaId(null);
    setIsFinalizeDialogOpen(false);
    onFinalizeNewPrePassageiro();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 1)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div className="space-y-6">
        <Button
          onClick={handleCadastrarRapidoLink}
          variant="outline"
          className="w-full md:w-auto gap-2 text-uppercase"
        >
          GERAR PRÉ-CADASTRO FAKE
        </Button>

        <QuickRegistrationLink
          blueTheme
          profile={profile}
          plano={plano}
          countPassageiros={countPassageiros}
        />

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Solicitações Pendentes
              {prePassageiros.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {prePassageiros.length}
                </Badge>
              )}
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar solicitação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm sm:text-base bg-white border-gray-200"
              />
            </div>
          </div>

          {loading ? (
            <PrePassengerListSkeleton />
          ) : prePassageiros.length === 0 ? (
            <Card className="border-dashed border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Users2 className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  Nenhuma solicitação pendente
                </h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                  {searchTerm.length > 0 ? "Nenhuma solicitação pendente encontrada." : "Compartilhe seu link de cadastro para receber novas solicitações de pais e responsáveis."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="w-[300px] py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-6">
                        Passageiro
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        WhatsApp
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Data
                      </TableHead>
                      <TableHead className="text-right pr-20 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prePassageiros.map((prePassageiro) => (
                      <TableRow
                        key={prePassageiro.id}
                        className="hover:bg-gray-50/80 border-b border-gray-50 last:border-0 transition-colors cursor-pointer"
                        onClick={() => handleFinalizeClick(prePassageiro)}
                      >
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm bg-blue-50`}
                              >
                                {getInitials(prePassageiro.nome)}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <p className="font-bold text-gray-900 text-sm">
                                {prePassageiro.nome}
                              </p>
                              <p className="text-xs font-semibold text-gray-500">
                                {prePassageiro.nome_responsavel}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-gray-500">
                            {formatarTelefone(
                              prePassageiro.telefone_responsavel
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(
                              prePassageiro.created_at
                            ).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-4 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFinalizeClick(prePassageiro);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFinalizeClick(prePassageiro);
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aprovar Cadastro
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteDialog({
                                      open: true,
                                      prePassageiroId: prePassageiro.id,
                                    });
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {prePassageiros.map((prePassageiro) => (
                  <div
                    key={prePassageiro.id}
                    className="bg-white p-3 pb-2 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-transform duration-100"
                    onClick={() => handleFinalizeClick(prePassageiro)}
                  >
                    <div className="flex justify-between items-center mb-1 relative">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm bg-blue-50`}
                        >
                          {getInitials(prePassageiro.nome)}
                        </div>
                        <div className="pr-6">
                          <p className="font-bold text-gray-900 text-sm">
                            {prePassageiro.nome}
                          </p>
                          <p className="text-xs text-gray-900">
                            {prePassageiro.nome_responsavel}
                          </p>
                        </div>
                      </div>

                      <div className="-mt-1 -mr-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 group-hover:text-gray-600"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleFinalizeClick(prePassageiro)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprovar Cadastro
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog({
                                  open: true,
                                  prePassageiroId: prePassageiro.id,
                                });
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {isFinalizeDialogOpen && selectedPrePassageiro && (
          <PassageiroFormDialog
            isOpen={isFinalizeDialogOpen}
            onClose={() =>
              safeCloseDialog(() => {
                setNovoVeiculoId(null);
                setNovaEscolaId(null);
                setIsFinalizeDialogOpen(false);
              })
            }
            onSuccess={handleFinalizeSuccess}
            prePassageiro={selectedPrePassageiro}
            editingPassageiro={null}
            onCreateEscola={() => setIsCreatingEscola(true)}
            onCreateVeiculo={() => setIsCreatingVeiculo(true)}
            mode="finalize"
            novaEscolaId={novaEscolaId}
            novoVeiculoId={novoVeiculoId}
            profile={profile}
            plano={plano}
          />
        )}

        <EscolaFormDialog
          isOpen={isCreatingEscola}
          onClose={handleCloseEscolaFormDialog}
          onSuccess={handleEscolaCreated}
          profile={profile}
        />

        <VeiculoFormDialog
          isOpen={isCreatingVeiculo}
          onClose={handleCloseVeiculoFormDialog}
          onSuccess={handleVeiculoCreated}
          profile={profile}
        />

        <ConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog({ open, prePassageiroId: "" })
          }
          title="Excluir Solicitação"
          description="Deseja excluir permanentemente esta solicitação de cadastro? Essa ação não pode ser desfeita."
          onConfirm={handleDelete}
          confirmText="Excluir"
          variant="destructive"
          isLoading={deletePrePassageiro.isPending}
        />
      </div>
      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
