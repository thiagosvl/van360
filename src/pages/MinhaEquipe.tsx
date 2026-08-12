import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { UserType } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { MotoristaAuxiliarFormDialog } from "@/components/dialogs/MotoristaAuxiliarFormDialog";
import { MonitorFormDialog } from "@/components/dialogs/MonitorFormDialog";
import { MobileActionItem, MobileAction } from "@/components/common/MobileActionItem";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { Banner } from "@/components/ui/Banner";
import {
  UserPlus,
  Car,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  KeyRound,
  Edit,
  UserCheck,
  Users2,
  FileText,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Lock,
} from "lucide-react";
import { toast } from "@/utils/notifications/toast";
import { phoneMask, cpfCnpjMask } from "@/utils/masks";
import { formatShortName } from "@/utils/formatters/name";
import { apiClient } from "@/services/api/client";
import { cn } from "@/lib/utils";
export default function MinhaEquipe() {
  const { can, isGestor } = usePermissions();
  const hasAccess = can("equipe.gerenciar_monitores") || can("equipe.gerenciar_todos");

  const queryClient = useQueryClient();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [activeTab, setActiveTab] = useState<string>(isGestor ? "motoristas" : "monitores");

  // Modais de Formulário
  const [motoristaDialogOpen, setMotoristaDialogOpen] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState<any | null>(null);

  const [monitorDialogOpen, setMonitorDialogOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<any | null>(null);

  // Modal de Redefinição de Senha
  const [resetPasswordMember, setResetPasswordMember] = useState<any | null>(null);
  const [novaSenhaInput, setNovaSenhaInput] = useState("");
  const [showNovaSenha, setShowNovaSenha] = useState(true);

  // Modal de Confirmação de Status (Ativar / Desativar)
  const [confirmStatusMember, setConfirmStatusMember] = useState<any | null>(null);

  // Modal de Confirmação de Exclusão Física
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<any | null>(null);

  const { data: veiculosData } = useVeiculos({ usuarioId: profile?.id });
  const veiculos = (veiculosData?.list || []) as any[];

  const { data: membros = [], isLoading, isFetching } = useQuery({
    queryKey: ["motoristas-equipe"],
    queryFn: async () => {
      const response = await apiClient.get("/motoristas-equipe");
      return response.data?.membros || [];
    },
    enabled: !!profile?.id,
  });

  const motoristasAuxiliares = membros.filter((m: any) => m.tipo === UserType.MOTORISTA_AUXILIAR);
  const monitores = membros.filter((m: any) => m.tipo === UserType.MONITOR);

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, nova_senha }: { id: string; nova_senha: string }) => {
      const response = await apiClient.post(`/motoristas-equipe/${id}/redefinir-senha`, { nova_senha });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso! A nova senha foi enviada no WhatsApp.");
      setResetPasswordMember(null);
      setNovaSenhaInput("");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Erro ao redefinir senha";
      toast.error(msg);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/motoristas-equipe/${id}/status`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Acesso atualizado com sucesso", { description: 'O usuário será informado via e-mail.' });
      setConfirmStatusMember(null);
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
      setDeleteConfirmMember(null);
      queryClient.invalidateQueries({ queryKey: ["motoristas-equipe"] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Erro ao excluir usuário";
      toast.error(msg);
    },
  });

  if (!hasAccess) {
    return <AccessRestrictedState moduleName="Gestão de Equipe" />;
  }

  const renderMemberCard = (membro: any, isMonitorType: boolean, index: number) => {
    const displayName = membro.apelido || formatShortName(membro.nome, true);

    const actions: MobileAction[] = [
      {
        label: "Editar Dados",
        icon: <Edit className="w-5 h-5" />,
        onClick: () => {
          if (isMonitorType) {
            setEditingMonitor(membro);
            setMonitorDialogOpen(true);
          } else {
            setEditingMotorista(membro);
            setMotoristaDialogOpen(true);
          }
        },
      },
      {
        label: "Redefinir Senha",
        icon: <KeyRound className="w-5 h-5" />,
        onClick: () => {
          setResetPasswordMember(membro);
          setNovaSenhaInput("");
          setShowNovaSenha(true);
        },
      },
      ...(isGestor
        ? [
          {
            label: membro.ativo !== false ? "Desativar" : "Ativar",
            icon: membro.ativo !== false ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />,
            isDestructive: membro.ativo !== false,
            variant: (membro.ativo !== false ? "destructive" : "default") as any,
            onClick: () => {
              setConfirmStatusMember(membro);
            },
          },
          {
            label: "Excluir",
            icon: <Trash2 className="w-5 h-5" />,
            isDestructive: true,
            variant: "destructive" as const,
            onClick: () => {
              setDeleteConfirmMember(membro);
            },
          },
        ]
        : []),
    ];

    const renderHeader = () => (
      <div className="space-y-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm transition-colors",
              membro.ativo === false ? "bg-slate-400" : isMonitorType ? "bg-[#1a3a5c]" : "bg-[#1a3a5c]"
            )}
          >
            {isMonitorType ? <Users2 className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-[#1a3a5c] font-headline line-clamp-2 break-words leading-tight">
              {membro.nome}
            </h3>

            {membro.apelido && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">{membro.apelido}</p>
            )}

            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-medium text-slate-500">
                {isMonitorType ? "Monitor" : "Motorista"}
              </span>
              <span className="text-slate-300">•</span>
              {membro.ativo !== false ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                  <XCircle className="w-3.5 h-3.5" /> Inativo
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-xs text-slate-600">
          {membro.razao_social && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Razão Social:</span> {membro.razao_social}
            </div>
          )}
          {membro.cpfcnpj && (
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>CPF/CNPJ: {cpfCnpjMask(membro.cpfcnpj)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{membro.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{phoneMask(membro.telefone || "")}</span>
          </div>
          {membro.veiculos && (
            <div className="flex flex-wrap items-center gap-2 text-[#1a3a5c] font-semibold pt-2 border-t border-slate-200/60">
              <Car className="w-4 h-4 text-[#1a3a5c] shrink-0" />
              <span>Veículo: {membro.veiculos.modelo} ({membro.veiculos.placa})</span>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <MobileActionItem
        key={membro.id}
        actions={actions}
        renderHeader={renderHeader}
      >
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 pr-7 sm:pr-8 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-3 active:scale-[0.99]">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition-colors",
                membro.ativo === false ? "bg-slate-400" : isMonitorType ? "bg-[#1a3a5c]" : "bg-[#1a3a5c]"
              )}
            >
              {isMonitorType ? <Users2 className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>

            <div className="min-w-0 flex-1 pr-1">
              <h4 className="font-bold text-sm text-[#1a3a5c] font-headline line-clamp-2 break-words leading-snug">
                {displayName}
              </h4>

              {membro.veiculos ? (
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                  <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{membro.veiculos.modelo} ({membro.veiculos.placa})</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400 font-normal mt-0.5">Sem veículo atribuído</p>
              )}
            </div>
          </div>

          <div className="flex items-center shrink-0">
            {membro.ativo !== false ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold uppercase tracking-wider">
                Ativo
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 text-[10px] font-bold uppercase tracking-wider">
                Inativo
              </span>
            )}
          </div>
        </div>
      </MobileActionItem>
    );
  };

  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 pr-8 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/5 rounded-lg" />
              <Skeleton className="h-3 w-2/5 rounded-md opacity-70" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-5 w-14 rounded-full opacity-70" />
          </div>
        </div>
      ))}
    </div>
  );

  const showSkeleton = isLoading || (isFetching && (toggleStatusMutation.isPending || deleteMutation.isPending));

  return (
    <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
          <TabsList className={cn(
            "grid w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0",
            isGestor ? "grid-cols-2" : "grid-cols-1"
          )}>
            {isGestor && (
              <TabsTrigger
                value="motoristas"
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] cursor-pointer"
              >
                Motoristas
                <span className={cn(
                  "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                  activeTab === "motoristas" ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
                )}>
                  {motoristasAuxiliares.length || 0}
                </span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="monitores"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] cursor-pointer"
            >
              Monitores
              <span className={cn(
                "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                activeTab === "monitores" ? "bg-[#1a3a5c]/10 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
              )}>
                {monitores.length || 0}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Aba 1: Motoristas */}
        {isGestor && (
          <TabsContent value="motoristas" className="space-y-6 mt-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                {motoristasAuxiliares.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {/* {motoristasAuxiliares.length} {motoristasAuxiliares.length === 1 ? "MOTORISTA" : "MOTORISTAS"} */}
                  </span>
                )}
              </div>

              <Button
                onClick={() => {
                  setEditingMotorista(null);
                  setMotoristaDialogOpen(true);
                }}
                className="border-none bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-xs sm:text-sm h-11 sm:h-12 rounded-xl sm:rounded-2xl px-3 sm:px-6 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>Novo Motorista</span>
              </Button>
            </div>

            {showSkeleton ? (
              renderSkeletonGrid()
            ) : motoristasAuxiliares.length === 0 ? (
              <div className="space-y-4">
                <Banner
                  variant="info"
                  title="Como funciona a conta de motorista"
                  description={
                    <>
                      A conta de motorista dará acesso ao aplicativo para <strong>executar rotas e registrar gastos</strong> do veículo atribuído a ele. O usuário não terá acesso aos dados financeiros, contratos, parcelas ou passageiros de outros veículos da sua empresa.
                    </>
                  }
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {motoristasAuxiliares.map((membro: any, index: number) => renderMemberCard(membro, false, index))}
              </div>
            )}
          </TabsContent>
        )}

        {/* Aba 2: Monitores */}
        <TabsContent value="monitores" className="space-y-6 mt-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              {monitores.length > 0 && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {/* {monitores.length} {monitores.length === 1 ? "MONITOR" : "MONITORES"} */}
                </span>
              )}
            </div>

            <Button
              onClick={() => {
                setEditingMonitor(null);
                setMonitorDialogOpen(true);
              }}
              className="border-none bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-xs sm:text-sm h-11 sm:h-12 rounded-xl sm:rounded-2xl px-3 sm:px-6 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Novo Monitor</span>
            </Button>
          </div>

          {showSkeleton ? (
            renderSkeletonGrid()
          ) : monitores.length === 0 ? (
            <div className="space-y-4">
              <Banner
                variant="info"
                title="Como funciona a conta de monitor"
                description={
                  <>
                    O monitor terá acesso à <strong>prancheta digital de alunos</strong> nas rotas do veículo atribuído para registrar presença e embarque. O usuário não possui acesso a relatórios, gastos ou dados financeiros.
                  </>
                }
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {monitores.map((membro: any, index: number) => renderMemberCard(membro, true, index))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Motorista */}
      <MotoristaAuxiliarFormDialog
        isOpen={motoristaDialogOpen}
        onClose={() => {
          setMotoristaDialogOpen(false);
          setEditingMotorista(null);
        }}
        editingMembro={editingMotorista}
        veiculos={veiculos}
      />

      {/* Dialog Monitor */}
      <MonitorFormDialog
        isOpen={monitorDialogOpen}
        onClose={() => {
          setMonitorDialogOpen(false);
          setEditingMonitor(null);
        }}
        editingMembro={editingMonitor}
        veiculos={veiculos}
      />

      {/* Modal Redefinir Senha */}
      <BaseDialog
        open={!!resetPasswordMember}
        onOpenChange={() => setResetPasswordMember(null)}
        lockClose={resetPasswordMutation.isPending}
        maxWidth="sm"
      >
        <BaseDialog.Header
          title="Redefinir Senha"
          onClose={() => setResetPasswordMember(null)}
          hideCloseButton={resetPasswordMutation.isPending}
        />
        <BaseDialog.Body>
          <div className="space-y-4 py-2 text-left">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Informe a nova senha para <strong className="text-[#1a3a5c]">{resetPasswordMember?.nome}</strong>. O usuário passará a utilizar esta nova senha para acessar o aplicativo.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-1">
                Sua Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 pointer-events-none" />
                <Input
                  type={showNovaSenha ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={novaSenhaInput}
                  onChange={(e) => setNovaSenhaInput(e.target.value)}
                  className="pl-12 pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-0 cursor-pointer"
                  tabIndex={-1}
                >
                  {showNovaSenha ? (
                    <EyeOff className="h-5 w-5 opacity-60" />
                  ) : (
                    <Eye className="h-5 w-5 opacity-60" />
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
            onClick={() => setResetPasswordMember(null)}
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

      {/* Modal Status */}
      <BaseDialog
        open={!!confirmStatusMember}
        onOpenChange={() => setConfirmStatusMember(null)}
        lockClose={toggleStatusMutation.isPending}
        maxWidth="sm"
      >
        <BaseDialog.Header
          title={confirmStatusMember?.ativo !== false ? "Desativar" : "Ativar"}
          onClose={() => setConfirmStatusMember(null)}
          hideCloseButton={toggleStatusMutation.isPending}
        />
        <BaseDialog.Body>
          <div className="space-y-3 py-2 text-left">
            <p className="text-sm text-slate-600 leading-relaxed">
              Deseja realmente {confirmStatusMember?.ativo !== false ? "desativar" : "ativar"} o acesso de{" "}
              <strong className="text-[#1a3a5c]">{confirmStatusMember?.nome}</strong>?
            </p>
            {confirmStatusMember?.ativo !== false && (
              <Banner
                variant="warning"
                title="Aviso importante"
                description="Ao desativar, o usuário não conseguirá realizar login no aplicativo até que sua conta seja reativada."
              />
            )}
          </div>
        </BaseDialog.Body>
        <BaseDialog.Footer>
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            onClick={() => setConfirmStatusMember(null)}
            disabled={toggleStatusMutation.isPending}
          />
          <BaseDialog.Action
            label={confirmStatusMember?.ativo !== false ? "Desativar" : "Ativar"}
            isLoading={toggleStatusMutation.isPending}
            onClick={() => {
              if (confirmStatusMember) {
                toggleStatusMutation.mutate(confirmStatusMember.id);
              }
            }}
          />
        </BaseDialog.Footer>
      </BaseDialog>

      {/* Modal Exclusão */}
      <BaseDialog
        open={!!deleteConfirmMember}
        onOpenChange={() => setDeleteConfirmMember(null)}
        lockClose={deleteMutation.isPending}
        maxWidth="sm"
      >
        <BaseDialog.Header
          title="Excluir"
          onClose={() => setDeleteConfirmMember(null)}
          hideCloseButton={deleteMutation.isPending}
        />
        <BaseDialog.Body>
          <div className="space-y-3 py-2 text-left">
            <p className="text-sm text-slate-600 leading-relaxed">
              Deseja realmente excluir <strong className="text-[#1a3a5c]">{deleteConfirmMember?.nome}</strong>?
            </p>
            <Banner
              variant="warning"
              title="Aviso importante"
              description="Todos os lançamentos históricos de gastos e execuções de rotas realizados por este usuário serão transferidos para a sua conta principal e mantidos no sistema."
            />
          </div>
        </BaseDialog.Body>
        <BaseDialog.Footer>
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            onClick={() => setDeleteConfirmMember(null)}
            disabled={deleteMutation.isPending}
          />
          <BaseDialog.Action
            label="Excluir"
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
  );
}
