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
import { useAuth } from "@/hooks/useAuth";
import { prePassageiroService } from "@/services/prePassageiroService";
import { PrePassageiro } from "@/types/prePassageiro";
import { safeCloseDialog } from "@/utils/dialogCallback";
import {
  CheckCircle,
  Copy,
  MoreVertical,
  Search,
  Trash2,
  Users2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PassageiroFormDialog from "./PassageiroFormDialog";

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
}

export default function PrePassageiros({
  onFinalizeNewPrePassageiro,
}: PrePassageirosProps) {
  const [prePassageiros, setPrePassageiros] = useState<PrePassageiro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    prePassageiroId: string;
  }>({ open: false, prePassageiroId: "" });

  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [selectedPrePassageiro, setSelectedPrePassageiro] =
    useState<PrePassageiro | null>(null);

  const BASE_DOMAIN = import.meta.env.VITE_PUBLIC_APP_DOMAIN;
  const GENERIC_CADASTRO_LINK = `${BASE_DOMAIN}/cadastro-passageiro/${profile.id}`;

  const handleCadastrarRapidoLink = async () => {
    const motoristaId = localStorage.getItem("app_user_id");
    if (!motoristaId) {
      toast({
        title: "Erro de Autenticação.",
        description: "Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

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
      genero: Math.random() > 0.5 ? "Masculino" : "Feminino",
      usuario_id: motoristaId,
      observacoes: `observacoes do ${fakeNome}`,
      rua: `Rua do ${fakeNome}`,
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
        title: "Pré-Cadastro Gerado com Sucesso!",
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
    }
  };

  const fetchPrePassageiros = useCallback(async () => {
    setLoading(true);

    try {
      const data = await prePassageiroService.fetchPreCadastros(searchTerm);

      setPrePassageiros(data || []);

      const filteredData = data.filter(
        (p) =>
          p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nome_responsavel.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setPrePassageiros(filteredData);
    } catch (error) {
      console.error("Erro ao buscar pré-cadastros:", error);
      toast({
        title: "Erro ao carregar pré-cadastros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPrePassageiros();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchPrePassageiros]);

  const handleDelete = async () => {
    try {
      await prePassageiroService.excluirPreCadastro(
        deleteDialog.prePassageiroId
      );

      toast({ title: "Pré-cadastro excluído com sucesso." });
      fetchPrePassageiros();
    } catch (error: any) {
      console.error("Erro ao excluir pré-cadastro:", error);
      toast({
        title: "Erro ao excluir.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, prePassageiroId: "" });
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(GENERIC_CADASTRO_LINK);
      toast({
        title: "Link copiado!",
        description: "Envie este link para o responsável iniciar o cadastro.",
      });
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
    setIsFinalizeDialogOpen(false);
    fetchPrePassageiros();
    onFinalizeNewPrePassageiro();
  };

  return (
    <div className="space-y-6">
      <div className="w-full">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <span>Pré-Cadastros</span>
                {prePassageiros.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    {prePassageiros.length}
                  </span>
                )}
              </CardTitle>

              <Button onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Copiar Link de Cadastro
                </span>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-7">
              <Button
                onClick={handleCadastrarRapidoLink}
                variant="outline"
                className="gap-2 text-uppercase"
              >
                GERAR PRÉ-CADASTRO FAKE
              </Button>
            </div>

            <div className="space-y-2 mb-4">
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

            {loading ? (
              <PrePassengerListSkeleton />
            ) : prePassageiros.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                <Users2 className="w-12 h-12 mb-4 text-gray-300" />
                <p>Nenhum pré-cadastro pendente.</p>
              </div>
            ) : (
              <div className="md:divide-y divide-gray-200">
                {prePassageiros.map((prePassageiro) => (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFinalizeClick(prePassageiro);
                    }}
                    key={prePassageiro.id}
                    className="py-4 active:bg-muted/50 border-b md:border-b-0 cursor-pointer hover:bg-muted/50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="pr-2">
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
          onClose={() => safeCloseDialog(() => setIsFinalizeDialogOpen(false))}
          prePassageiro={selectedPrePassageiro}
          editingPassageiro={null}
          onSuccess={handleFinalizeSuccess}
          mode="finalize"
        />
      )}

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, prePassageiroId: "" })}
        title="Excluir Pré-Cadastro"
        description="Deseja excluir permanentemente este registro de pré-cadastro? Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
        confirmText="Confirmar"
        variant="destructive"
      />
    </div>
  );
}
