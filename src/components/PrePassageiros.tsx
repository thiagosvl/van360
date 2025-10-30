import ConfirmationDialog from "@/components/ConfirmationDialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { prePassageiroService } from "@/services/prePassageiroService";
import { PrePassageiro } from "@/types/prePassageiro";
import { safeCloseDialog } from "@/utils/dialogCallback";
import { buildPrepassageiroLink } from "@/utils/motoristaUtils";
import {
  CheckCircle,
  Copy,
  Filter,
  FilterX,
  LinkIcon,
  MoreVertical,
  Search,
  Trash2,
  Users2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import EscolaFormDialog from "./EscolaFormDialog";
import { LoadingOverlay } from "./LoadingOverlay";
import PassageiroFormDialog from "./PassageiroFormDialog";
import VeiculoFormDialog from "./VeiculoFormDialog";

const PrePassengerListSkeleton = () => (
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

interface PrePassageirosProps {
  onFinalizeNewPrePassageiro: () => void;
  refreshKey?: number;
}

export default function PrePassageiros({
  onFinalizeNewPrePassageiro,
  refreshKey,
}: PrePassageirosProps) {
  const [prePassageiros, setPrePassageiros] = useState<PrePassageiro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const [novaEscolaId, setNovaEscolaId] = useState<string | null>(null);
  const [novoVeiculoId, setNovoVeiculoId] = useState<string | null>(null);
  const [isCreatingEscola, setIsCreatingEscola] = useState(false);
  const [isCreatingVeiculo, setIsCreatingVeiculo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [showMobileFilters, setShowMobileFilters] = useState(true);
  const { toast } = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    prePassageiroId: string;
  }>({ open: false, prePassageiroId: "" });

  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [selectedPrePassageiro, setSelectedPrePassageiro] =
    useState<PrePassageiro | null>(null);

  useEffect(() => {
    if (refreshKey !== undefined) {
      fetchPrePassageiros();
    }
  }, [refreshKey, profile?.id]);

  useEffect(() => {
    if (loading) return;

    const handler = setTimeout(() => {
      fetchPrePassageiros(true);
    }, 500);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchPrePassageiros = useCallback(
    async (isRefresh = false) => {
      if (!profile?.id) return;

      try {
        if (!isRefresh) setLoading(true);
        else setRefreshing(true);
        const data = await prePassageiroService.fetchPreCadastros(
          searchTerm,
          profile.id
        );
        setPrePassageiros(data || []);
      } catch (error) {
        console.error("Erro ao buscar pré-cadastros:", error);
        toast({
          title: "Erro ao carregar pré-cadastros.",
          variant: "destructive",
        });
      } finally {
        if (!isRefresh) setLoading(false);
        else setRefreshing(false);
      }
    },
    [searchTerm, toast, profile?.id]
  );

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

  const handleCadastrarRapidoLink = async () => {
    if (!profile?.id) {
      toast({
        title: "Erro de Autenticação.",
        description: "Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setRefreshing(true);

    const numeroAleatorio = Math.floor(Math.random() * 1000);
    const fakeNome = `Passag. Rápido ${numeroAleatorio}`;
    const fakeResponsavel = `Resp. Rápido ${numeroAleatorio}`;
    const fakeEmail = `resp_rapido_${numeroAleatorio}@teste.com`;

    const fakePayload: any = {
      nome: fakeNome,
      nome_responsavel: fakeResponsavel,
      email_responsavel: fakeEmail,
      telefone_responsavel: "11951186951",
      cpf_responsavel: "39542391838",
      usuario_id: profile.id,
      observacoes: `observacoes do ${fakeNome}`,
      logradouro: `Rua do ${fakeNome}`,
      numero: "433",
      bairro: `Bairro do ${fakeNome}`,
      cidade: `Cidade do ${fakeNome}`,
      estado: "SP",
      cep: "04410-080",
      referencia: `Referencia do ${fakeNome}`,
    };

    try {
      await prePassageiroService.createPreCadastroRapido(fakePayload);

      toast({
        title: "Pré-Cadastro Gerado com sucesso!",
        variant: "default",
      });

      fetchPrePassageiros();
    } catch (error: any) {
      console.error("Erro ao gerar pré-cadastro rápido:", error);
      toast({
        title: "Falha na Geração do Link.",
        description:
          error.message || "Não foi possível criar o registro temporário.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    setRefreshing(true);
    try {
      await prePassageiroService.excluirPreCadastro(
        deleteDialog.prePassageiroId
      );

      toast({ title: "Pré-cadastro excluído com sucesso." });
      fetchPrePassageiros(true);
    } catch (error: any) {
      console.error("Erro ao excluir pré-cadastro:", error);
      toast({
        title: "Erro ao excluir.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, prePassageiroId: "" });
      setRefreshing(false);
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(buildPrepassageiroLink(profile?.id));

      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      toast({
        title: "Falha ao copiar.",
        description: "Tente copiar o link manualmente.",
        variant: "destructive",
      });
    }
  };

  const handleFinalizeClick = (prePassageiro: PrePassageiro) => {
    setSelectedPrePassageiro(prePassageiro);
    setIsFinalizeDialogOpen(true);
  };

  const handleFinalizeSuccess = () => {
    setNovoVeiculoId(null);
    setNovaEscolaId(null);
    setIsFinalizeDialogOpen(false);
    fetchPrePassageiros();
    onFinalizeNewPrePassageiro();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="w-full">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className={`md:hidden`}
                    title={
                      showMobileFilters ? "Esconder Filtros" : "Mostrar Filtros"
                    }
                  >
                    {showMobileFilters ? (
                      <FilterX className="h-4 w-4 text-blue-600 border-primary" />
                    ) : (
                      <Filter className="h-4 w-4" />
                    )}
                    <span className={showMobileFilters ? "text-primary" : ""}>
                      Filtros
                    </span>
                  </Button>
                </CardTitle>

                <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    {prePassageiros.length} pendente
                    {prePassageiros.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showMobileFilters ? "max-h-[500px]" : "max-h-0"
                } md:max-h-full`}
              >
                <section className="mb-6">
                  <Card className="p-5 bg-blue-50 border-blue-200">
                    <CardContent className="p-0 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <LinkIcon className="h-6 w-6 text-blue-700 shrink-0" />
                        <div>
                          <p className="text-lg font-bold text-blue-700 leading-snug">
                            Link de Cadastro Rápido
                          </p>
                          <p className="text-sm text-blue-900 mt-1">
                            Copie o link e envie ao responsável do passageiro
                            para que ele inicie o cadastro.
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        title={isCopied ? "Copiado!" : "Copiar"}
                        className="text-blue-700 border-blue-300 hover:bg-blue-100 shrink-0 transition-colors duration-200"
                        onClick={handleCopyLink}
                      >
                        {isCopied ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}

                        {isCopied ? "Copiado!" : "Copiar Link"}
                      </Button>
                    </CardContent>
                  </Card>
                </section>

                <div className="space-y-2 mb-4 p-1">
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
              </div>

              {import.meta.env.MODE === "development" && (
                <Button
                  onClick={handleCadastrarRapidoLink}
                  variant="outline"
                  className="gap-2 text-uppercase"
                >
                  GERAR PRÉ-CADASTRO FAKE
                </Button>
              )}

              {loading ? (
                <PrePassengerListSkeleton />
              ) : prePassageiros.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                  <Users2 className="w-12 h-12 mb-4 text-gray-300" />
                  <p>Nenhum pré-cadastro pendente.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {prePassageiros.map((prePassageiro) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFinalizeClick(prePassageiro);
                      }}
                      key={prePassageiro.id}
                      className="py-4 active:bg-muted/50 cursor-pointer hover:bg-muted/50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="">
                          <div className="font-semibold text-sm text-gray-800">
                            {prePassageiro.nome}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Responsável: {prePassageiro.nome_responsavel}
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
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFinalizeClick(prePassageiro);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Continuar Cadastro
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600"
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog({ open, prePassageiroId: "" })
          }
          title="Excluir Pré-Cadastro"
          description="Deseja excluir permanentemente este registro de pré-cadastro? Essa ação não pode ser desfeita."
          onConfirm={handleDelete}
          confirmText="Confirmar"
          variant="destructive"
        />
      </div>
      <LoadingOverlay active={refreshing} text="Aguarde..." />
    </>
  );
}
