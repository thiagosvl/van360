import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/config/permissions";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { UserType } from "@/types/enums";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { MotoristaAuxiliarFormDialog } from "@/components/dialogs/MotoristaAuxiliarFormDialog";
import { MonitorFormDialog } from "@/components/dialogs/MonitorFormDialog";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { Banner } from "@/components/ui/Banner";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { safeCloseDialog } from "@/hooks";
import { EquipeToolbar } from "@/components/features/equipe/EquipeToolbar";
import { EquipeList } from "@/components/features/equipe/EquipeList";
import { ListSkeleton } from "@/components/skeletons";
import {
  CheckCircle2,
  KeyRound,
  UserCheck,
  Users2,
  Eye,
  EyeOff,
  Trash2,
  Lock,
  ShieldCheck,
  Search,
} from "lucide-react";
import { toast } from "@/utils/notifications/toast";
import { apiClient } from "@/services/api/client";
import { cn } from "@/lib/utils";
import type { MembroEquipe, VeiculoMembro } from "@/types/equipe";

export default function MinhaEquipe() {
  const { can, isGestor } = usePermissions();
  const hasAccess = can(PERMISSIONS.EQUIPE_GERENCIAR_MONITORES) || can(PERMISSIONS.EQUIPE_GERENCIAR_TODOS);

  const queryClient = useQueryClient();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [activeTab, setActiveTab] = useState<string>(isGestor ? "motoristas" : "monitores");
  const [busca, setBusca] = useState("");

  const [motoristaDialogOpen, setMotoristaDialogOpen] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState<MembroEquipe | null>(null);

  const [monitorDialogOpen, setMonitorDialogOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<MembroEquipe | null>(null);

  const [resetPasswordMember, setResetPasswordMember] = useState<MembroEquipe | null>(null);
  const [novaSenhaInput, setNovaSenhaInput] = useState("");
  const [showNovaSenha, setShowNovaSenha] = useState(true);

  const [confirmStatusMember, setConfirmStatusMember] = useState<MembroEquipe | null>(null);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<MembroEquipe | null>(null);

  const { data: veiculosData } = useVeiculos({ usuarioId: profile?.id });
  const veiculos: VeiculoMembro[] = (veiculosData?.list || []).map((v) => ({
    id: v.id,
    placa: v.placa,
    marca: v.marca,
    modelo: v.modelo,
  }));

  const { data: membros = [], isLoading, isFetching } = useQuery<MembroEquipe[]>({
    queryKey: ["motoristas-equipe"],
    queryFn: async () => {
      const response = await apiClient.get("/motoristas-equipe");
      return response.data?.membros || [];
    },
    enabled: !!profile?.id && hasAccess,
  });

  const motoristasAuxiliares = useMemo(
    () => membros.filter((m) => m.tipo === UserType.MOTORISTA_AUXILIAR),
    [membros]
  );

  const monitores = useMemo(
    () => membros.filter((m) => m.tipo === UserType.MONITOR),
    [membros]
  );

  const totalMotoristasAtivos = useMemo(
    () => motoristasAuxiliares.filter((m) => m.ativo !== false).length,
    [motoristasAuxiliares]
  );

  const totalMonitoresAtivos = useMemo(
    () => monitores.filter((m) => m.ativo !== false).length,
    [monitores]
  );

  const filtrarMembros = (lista: MembroEquipe[]) => {
    if (!busca.trim()) return lista;
    const termo = busca.trim().toLowerCase();
    return lista.filter((m) => {
      const nomeMatch = m.nome.toLowerCase().includes(termo);
      const apelidoMatch = m.apelido ? m.apelido.toLowerCase().includes(termo) : false;
      const telMatch = m.telefone ? m.telefone.includes(termo) : false;
      const emailMatch = m.email ? m.email.toLowerCase().includes(termo) : false;
      const veiculoMatch = m.veiculos
        ? m.veiculos.modelo.toLowerCase().includes(termo) || m.veiculos.placa.toLowerCase().includes(termo)
        : false;
      return nomeMatch || apelidoMatch || telMatch || emailMatch || veiculoMatch;
    });
  };

  const motoristasFiltrados = useMemo(
    () => filtrarMembros(motoristasAuxiliares),
    [motoristasAuxiliares, busca]
  );

  const monitoresFiltrados = useMemo(
    () => filtrarMembros(monitores),
    [monitores, busca]
  );

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["motoristas-equipe"] });
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, nova_senha }: { id: string; nova_senha: string }) => {
      const response = await apiClient.post(`/motoristas-equipe/${id}/redefinir-senha`, { nova_senha });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso! A nova senha foi enviada no WhatsApp.");
      safeCloseDialog(() => {
        setResetPasswordMember(null);
        setNovaSenhaInput("");
      });
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || errorObj.message || "Erro ao redefinir senha";
      toast.error(msg);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/motoristas-equipe/${id}/status`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Acesso atualizado com sucesso", { description: "O usuário será informado via e-mail." });
      safeCloseDialog(() => setConfirmStatusMember(null));
      queryClient.invalidateQueries({ queryKey: ["motoristas-equipe"] });
    },
    onError: () => {
      toast.error("Erro ao alterar status do usuário");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/motoristas-equipe/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso!");
      safeCloseDialog(() => setDeleteConfirmMember(null));
      queryClient.invalidateQueries({ queryKey: ["motoristas-equipe"] });
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || errorObj.message || "Erro ao excluir usuário";
      toast.error(msg);
    },
  });

  if (!hasAccess) {
    return <AccessRestrictedState moduleName="Gestão de Equipe" />;
  }

  const showSkeleton = isLoading || (isFetching && (toggleStatusMutation.isPending || deleteMutation.isPending));

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 pt-1 sm:pt-2">
        <div className="-mx-4 px-4 py-2 sm:mx-0 sm:px-0 sm:py-0 overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible touch-pan-x">
          <div className="flex items-stretch gap-2.5 sm:gap-3 w-max sm:w-full sm:grid sm:grid-cols-3">
            <div className="p-3.5 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left group shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[175px] min-w-[175px] shrink-0 sm:w-auto sm:shrink sm:min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2 min-w-0">
                <span 
                  className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
                  title="Equipe Total"
                >
                  Equipe Total
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                  <Users2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                {isLoading ? (
                  <Skeleton className="h-7 sm:h-8 w-12 sm:w-16 rounded-[10px] bg-[#f5f5f5]" />
                ) : (
                  <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                    {membros.length}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => isGestor && setActiveTab("motoristas")}
              className={cn(
                "p-3.5 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border text-left group shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[175px] min-w-[175px] shrink-0 sm:w-auto sm:shrink sm:min-w-0 transition-all cursor-pointer overflow-hidden",
                activeTab === "motoristas"
                  ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]"
                  : "border-[#e5e5e5] hover:border-[#737373]/50"
              )}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2 min-w-0">
                <span 
                  className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
                  title="Motoristas Ativos"
                >
                  Motoristas Ativos
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                  <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                {isLoading ? (
                  <Skeleton className="h-7 sm:h-8 w-12 sm:w-16 rounded-[10px] bg-[#f5f5f5]" />
                ) : (
                  <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                    {totalMotoristasAtivos}
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("monitores")}
              className={cn(
                "p-3.5 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border text-left group shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[175px] min-w-[175px] shrink-0 sm:w-auto sm:shrink sm:min-w-0 transition-all cursor-pointer overflow-hidden",
                activeTab === "monitores"
                  ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]"
                  : "border-[#e5e5e5] hover:border-[#737373]/50"
              )}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2 min-w-0">
                <span 
                  className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
                  title="Monitores Ativos"
                >
                  Monitores Ativos
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                {isLoading ? (
                  <Skeleton className="h-7 sm:h-8 w-12 sm:w-16 rounded-[10px] bg-[#f5f5f5]" />
                ) : (
                  <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                    {totalMonitoresAtivos}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setBusca("");
          }}
          className="w-full space-y-4 sm:space-y-6"
        >
          <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] w-full">
            <TabsList className={cn(
              "grid w-full min-h-[40px] sm:min-h-[42px] bg-transparent p-0 gap-1 border-0",
              isGestor ? "grid-cols-2" : "grid-cols-1"
            )}>
              {isGestor && (
                <TabsTrigger
                  value="motoristas"
                  className="rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 flex items-center justify-center"
                >
                  Motoristas
                  <span className="ml-2 px-1.5 py-0.5 rounded-[18px] text-[10px] font-semibold bg-[#e5e5e5]/80 text-[#0a0a0a]">
                    {motoristasAuxiliares.length}
                  </span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="monitores"
                className="rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 flex items-center justify-center"
              >
                Monitores
                <span className="ml-2 px-1.5 py-0.5 rounded-[18px] text-[10px] font-semibold bg-[#e5e5e5]/80 text-[#0a0a0a]">
                  {monitores.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {isGestor && (
            <TabsContent value="motoristas" className="space-y-4 mt-0 focus-visible:outline-none">
              {motoristasAuxiliares.length > 0 && (
                <EquipeToolbar
                  totalItens={motoristasAuxiliares.length}
                  totalFiltrados={motoristasFiltrados.length}
                  searchTerm={busca}
                  onSearchChange={setBusca}
                  onNovoRegistro={() => {
                    setEditingMotorista(null);
                    setMotoristaDialogOpen(true);
                  }}
                  tipoLabel="Motorista"
                />
              )}

              {showSkeleton ? (
                <ListSkeleton count={4} />
              ) : motoristasAuxiliares.length === 0 ? (
                <div className="space-y-4">
                  <Banner
                    variant="info"
                    title="Como funciona a conta de motorista"
                    description="Ela concede acesso restrito ao aplicativo para operar os veículos atribuídos, sem acesso aos dados da gestão principal da empresa."
                    className="rounded-[18px]"
                  />

                  <UnifiedEmptyState
                    icon={UserCheck}
                    title="Nenhum motorista cadastrado"
                    description="Adicione motoristas à sua equipe para operar os veículos da frota."
                    action={{
                      label: "Cadastrar Motorista",
                      onClick: () => {
                        setEditingMotorista(null);
                        setMotoristaDialogOpen(true);
                      },
                    }}
                  />
                </div>
              ) : motoristasFiltrados.length === 0 ? (
                <UnifiedEmptyState
                  icon={Search}
                  title="Nenhum motorista encontrado"
                  description="Não encontramos nenhum motorista correspondente aos termos da pesquisa."
                  action={{
                    label: "Limpar Busca",
                    onClick: () => setBusca(""),
                  }}
                />
              ) : (
                <EquipeList
                  membros={motoristasFiltrados}
                  isGestor={isGestor}
                  onEdit={(m) => {
                    setEditingMotorista(m);
                    setMotoristaDialogOpen(true);
                  }}
                  onResetPassword={(m) => {
                    setResetPasswordMember(m);
                    setNovaSenhaInput("");
                    setShowNovaSenha(true);
                  }}
                  onToggleStatus={(m) => setConfirmStatusMember(m)}
                  onDelete={(m) => setDeleteConfirmMember(m)}
                />
              )}
            </TabsContent>
          )}

          <TabsContent value="monitores" className="space-y-4 mt-0 focus-visible:outline-none">
            {monitores.length > 0 && (
              <EquipeToolbar
                totalItens={monitores.length}
                totalFiltrados={monitoresFiltrados.length}
                searchTerm={busca}
                onSearchChange={setBusca}
                onNovoRegistro={() => {
                  setEditingMonitor(null);
                  setMonitorDialogOpen(true);
                }}
                tipoLabel="Monitor"
              />
            )}

            {showSkeleton ? (
              <ListSkeleton count={4} />
            ) : monitores.length === 0 ? (
              <div className="space-y-4">
                <Banner
                  variant="info"
                  title="Como funciona a conta de monitor"
                  description="Ela concede acesso operacional restrito às atividades dos veículos atribuídos, conforme as permissões estabelecidas."
                  className="rounded-[18px]"
                />

                <UnifiedEmptyState
                  icon={Users2}
                  title="Nenhum monitor cadastrado"
                  description="Adicione monitores à sua equipe para acompanhar as paradas da rota."
                  action={{
                    label: "Cadastrar Monitor",
                    onClick: () => {
                      setEditingMonitor(null);
                      setMonitorDialogOpen(true);
                    },
                  }}
                />
              </div>
            ) : monitoresFiltrados.length === 0 ? (
              <UnifiedEmptyState
                icon={Search}
                title="Nenhum monitor encontrado"
                description="Não encontramos nenhum monitor correspondente aos termos da pesquisa."
                action={{
                  label: "Limpar Busca",
                  onClick: () => setBusca(""),
                }}
              />
            ) : (
              <EquipeList
                membros={monitoresFiltrados}
                isGestor={isGestor}
                onEdit={(m) => {
                  setEditingMonitor(m);
                  setMonitorDialogOpen(true);
                }}
                onResetPassword={(m) => {
                  setResetPasswordMember(m);
                  setNovaSenhaInput("");
                  setShowNovaSenha(true);
                }}
                onToggleStatus={(m) => setConfirmStatusMember(m)}
                onDelete={(m) => setDeleteConfirmMember(m)}
              />
            )}
          </TabsContent>
        </Tabs>

        <MotoristaAuxiliarFormDialog
          isOpen={motoristaDialogOpen}
          onClose={() => {
            setMotoristaDialogOpen(false);
            setEditingMotorista(null);
          }}
          editingMembro={editingMotorista}
          veiculos={veiculos}
        />

        <MonitorFormDialog
          isOpen={monitorDialogOpen}
          onClose={() => {
            setMonitorDialogOpen(false);
            setEditingMonitor(null);
          }}
          editingMembro={editingMonitor}
          veiculos={veiculos}
        />

        <BaseDialog
          open={!!resetPasswordMember}
          onOpenChange={() => safeCloseDialog(() => setResetPasswordMember(null))}
          lockClose={resetPasswordMutation.isPending}
          maxWidth="sm"
        >
          <BaseDialog.Header
            title="Redefinir Senha"
            onClose={() => safeCloseDialog(() => setResetPasswordMember(null))}
            hideCloseButton={resetPasswordMutation.isPending}
          />
          <BaseDialog.Body>
            <div className="space-y-4 py-2 text-left">
              <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                Informe a nova senha para <strong className="text-[#0a0a0a]">{resetPasswordMember?.nome}</strong>. O usuário passará a utilizar esta nova senha para acessar o aplicativo.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs sm:text-[13px] font-medium text-[#737373] ml-1">
                  Sua Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    type={showNovaSenha ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={novaSenhaInput}
                    onChange={(e) => setNovaSenhaInput(e.target.value)}
                    className="pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] hover:border-[#737373]/50 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNovaSenha ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(() => setResetPasswordMember(null))}
              disabled={resetPasswordMutation.isPending}
            />
            <BaseDialog.Action
              label="Salvar"
              variant="primary"
              disabled={novaSenhaInput.length < 6}
              isLoading={resetPasswordMutation.isPending}
              onClick={() => {
                if (resetPasswordMember) {
                  resetPasswordMutation.mutate({
                    id: resetPasswordMember.id,
                    nova_senha: novaSenhaInput,
                  });
                }
              }}
            />
          </BaseDialog.Footer>
        </BaseDialog>

        <BaseDialog
          open={!!confirmStatusMember}
          onOpenChange={() => safeCloseDialog(() => setConfirmStatusMember(null))}
          lockClose={toggleStatusMutation.isPending}
          maxWidth="sm"
        >
          <BaseDialog.Header
            title={confirmStatusMember?.ativo !== false ? "Desativar" : "Ativar"}
            onClose={() => safeCloseDialog(() => setConfirmStatusMember(null))}
            hideCloseButton={toggleStatusMutation.isPending}
          />
          <BaseDialog.Body>
            <div className="space-y-3 py-2 text-left">
              <p className="text-sm text-[#737373] leading-relaxed">
                Deseja realmente {confirmStatusMember?.ativo !== false ? "desativar" : "ativar"} o acesso de{" "}
                <strong className="text-[#0a0a0a]">{confirmStatusMember?.nome}</strong>?
              </p>
              {confirmStatusMember?.ativo !== false && (
                <Banner
                  variant="warning"
                  title="Aviso importante"
                  description="Ao desativar, o usuário não conseguirá realizar login no aplicativo até que sua conta seja reativada."
                  className="rounded-[18px]"
                />
              )}
            </div>
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(() => setConfirmStatusMember(null))}
              disabled={toggleStatusMutation.isPending}
            />
            <BaseDialog.Action
              label={confirmStatusMember?.ativo !== false ? "Desativar" : "Ativar"}
              isLoading={toggleStatusMutation.isPending}
              variant={confirmStatusMember?.ativo !== false ? "destructive" : "primary"}
              onClick={() => {
                if (confirmStatusMember) {
                  toggleStatusMutation.mutate(confirmStatusMember.id);
                }
              }}
            />
          </BaseDialog.Footer>
        </BaseDialog>

        <BaseDialog
          open={!!deleteConfirmMember}
          onOpenChange={() => safeCloseDialog(() => setDeleteConfirmMember(null))}
          lockClose={deleteMutation.isPending}
          maxWidth="sm"
        >
          <BaseDialog.Header
            title="Excluir"
            onClose={() => safeCloseDialog(() => setDeleteConfirmMember(null))}
            hideCloseButton={deleteMutation.isPending}
          />
          <BaseDialog.Body>
            <div className="space-y-3 py-2 text-left">
              <p className="text-sm text-[#737373] leading-relaxed">
                Deseja realmente excluir <strong className="text-[#0a0a0a]">{deleteConfirmMember?.nome}</strong>?
              </p>
              <Banner
                variant="warning"
                title="Aviso importante"
                description="Todos os lançamentos históricos de gastos e execuções de rotas realizados por este usuário serão transferidos para a sua conta principal e mantidos no app."
                className="rounded-[18px]"
              />
            </div>
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(() => setDeleteConfirmMember(null))}
              disabled={deleteMutation.isPending}
            />
            <BaseDialog.Action
              label="Excluir"
              variant="destructive"
              isLoading={deleteMutation.isPending}
              onClick={() => {
                if (deleteConfirmMember) {
                  deleteMutation.mutate(deleteConfirmMember.id);
                }
              }}
            />
          </BaseDialog.Footer>
        </BaseDialog>
      </div>
    </PullToRefreshWrapper>
  );
}
