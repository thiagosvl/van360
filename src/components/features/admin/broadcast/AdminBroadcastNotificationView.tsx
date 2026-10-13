import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Send,
  Users,
  Smartphone,
  Sparkles,
  RotateCcw,
  SmartphoneNfc,
  ExternalLink,
  ShieldCheck,
  Wifi,
  Battery,
  Check,
  CheckCheck,
  Search,
  UserCheck,
  X,
  UserPlus,
  Plus,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Banner } from '@/components/ui/Banner';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLayout } from '@/contexts/LayoutContext';
import { toast } from '@/utils/notifications/toast';
import { PushNotificationAction } from '@/types/enums';
import { PUSH_NOTIFICATION_ACTION_OPTIONS } from '@/constants/pushNotificationActions';
import {
  BROADCAST_TEMPLATES,
  BROADCAST_CATEGORIES,
  type BroadcastTemplate,
  type BroadcastCategory,
} from '@/constants/broadcastTemplates';
import {
  useAdminBroadcastEstimate,
  useAdminSendBroadcast,
} from '@/hooks/api/admin/useAdminBroadcastHooks';
import { useAdminUsers } from '@/hooks/api/admin/useAdminUserHooks';
import { useDebounce } from '@/hooks/ui/useDebounce';
import type { AdminUserListItem } from '@/services/api/admin/admin-user.api';

interface TargetGroupOption {
  id: string;
  label: string;
  shortLabel: string;
  activeBorder: string;
  activeBg: string;
  activeText: string;
  activeCheckbox: string;
}

interface SelectedDriver {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  statusAssinatura?: string;
}

const TARGET_GROUPS: TargetGroupOption[] = [
  {
    id: 'ACTIVE',
    label: 'Ativos (Mensal / Anual)',
    shortLabel: 'Ativos',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-500/10',
    activeText: 'text-emerald-600 dark:text-emerald-400',
    activeCheckbox: 'bg-emerald-500 border-emerald-500 text-white',
  },
  {
    id: 'TRIAL',
    label: 'Em Teste Grátis (Trial)',
    shortLabel: 'Trial',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-500/10',
    activeText: 'text-blue-600 dark:text-blue-400',
    activeCheckbox: 'bg-blue-500 border-blue-500 text-white',
  },
  {
    id: 'PAST_DUE',
    label: 'Em Carência / Atraso',
    shortLabel: 'Em Atraso',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-500/10',
    activeText: 'text-amber-600 dark:text-amber-400',
    activeCheckbox: 'bg-amber-500 border-amber-500 text-white',
  },
  {
    id: 'EXPIRED',
    label: 'Expirados',
    shortLabel: 'Expirados',
    activeBorder: 'border-rose-500',
    activeBg: 'bg-rose-500/10',
    activeText: 'text-rose-600 dark:text-rose-400',
    activeCheckbox: 'bg-rose-500 border-rose-500 text-white',
  },
  {
    id: 'CANCELED',
    label: 'Cancelados',
    shortLabel: 'Cancelados',
    activeBorder: 'border-muted-foreground/60',
    activeBg: 'bg-secondary',
    activeText: 'text-foreground',
    activeCheckbox: 'bg-muted-foreground border-muted-foreground text-background',
  },
  {
    id: 'VITALICIO',
    label: 'Vitalícios / Parceiros',
    shortLabel: 'Vitalício',
    activeBorder: 'border-purple-500',
    activeBg: 'bg-purple-500/10',
    activeText: 'text-purple-600 dark:text-purple-400',
    activeCheckbox: 'bg-purple-500 border-purple-500 text-white',
  },
];

export function AdminBroadcastNotificationView() {
  const { openAdminConfirmBroadcastDialog } = useLayout();

  const [targetMode, setTargetMode] = useState<'groups' | 'manual'>('groups');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<SelectedDriver[]>([]);
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedDriverSearch = useDebounce(driverSearchQuery.trim(), 300);
  const isSearchActive = targetMode === 'manual' && debouncedDriverSearch.length >= 1;

  const [selectedCategory, setSelectedCategory] = useState<'TODAS' | BroadcastCategory>('TODAS');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState<PushNotificationAction>(PushNotificationAction.OPEN_HOME);

  const isTodosSelected = targetMode === 'groups' && selectedGroups.includes('TODOS');

  const { data: driversResponse, isFetching: isSearchingDrivers } = useAdminUsers(
    {
      tipo: 'motorista',
      search: debouncedDriverSearch,
      limit: 15,
    },
    { enabled: isSearchActive }
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const estimateParams = useMemo(() => {
    if (targetMode === 'groups') {
      return { status: selectedGroups };
    }
    return { motoristaIds: selectedDrivers.map((d) => d.id) };
  }, [targetMode, selectedGroups, selectedDrivers]);

  const hasTargetSelected =
    targetMode === 'groups' ? selectedGroups.length > 0 : selectedDrivers.length > 0;

  const { data: estimate, isFetching: isEstimating } = useAdminBroadcastEstimate(
    estimateParams,
    hasTargetSelected
  );

  const sendMutation = useAdminSendBroadcast();

  const handleSelectAllGroups = () => {
    if (isTodosSelected) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(['TODOS']);
    }
  };

  const handleToggleGroup = (groupId: string) => {
    if (groupId === 'TODOS') {
      handleSelectAllGroups();
      return;
    }

    let next = selectedGroups.filter((g) => g !== 'TODOS');

    if (next.includes(groupId)) {
      next = next.filter((g) => g !== groupId);
    } else {
      next = [...next, groupId];
    }

    setSelectedGroups(next);
  };

  const handleAddDriver = (driver: AdminUserListItem) => {
    const isAlreadySelected = selectedDrivers.some((d) => d.id === driver.id);
    if (isAlreadySelected) {
      toast.info(`O motorista "${driver.nome}" já está na lista.`);
      return;
    }

    const statusAssinatura = driver.assinaturas?.[0]?.status || 'sem_plano';
    setSelectedDrivers((prev) => [
      ...prev,
      {
        id: driver.id,
        nome: driver.nome,
        telefone: driver.telefone,
        email: driver.email,
        statusAssinatura,
      },
    ]);

    setDriverSearchQuery('');
    setIsSearchDropdownOpen(false);
    toast.success(`"${driver.nome}" adicionado à lista.`);
  };

  const handleRemoveDriver = (driverId: string) => {
    setSelectedDrivers((prev) => prev.filter((d) => d.id !== driverId));
  };

  const handleClearAllDrivers = () => {
    setSelectedDrivers([]);
  };

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'TODAS') {
      return BROADCAST_TEMPLATES;
    }
    return BROADCAST_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleApplyTemplate = (template: BroadcastTemplate) => {
    setTitle(template.title);
    setMessage(template.body);
    setSelectedAction(template.defaultAction);

    if (
      targetMode === 'groups' &&
      selectedGroups.length === 0 &&
      template.suggestedStatuses &&
      template.suggestedStatuses.length > 0 &&
      !template.suggestedStatuses.includes('TODOS')
    ) {
      setSelectedGroups(template.suggestedStatuses);
    }

    toast.success(`Template "${template.name}" aplicado.`);
  };

  const handleResetForm = () => {
    setTitle('');
    setMessage('');
    setSelectedAction(PushNotificationAction.OPEN_HOME);
    if (targetMode === 'groups') {
      setSelectedGroups([]);
    } else {
      setSelectedDrivers([]);
    }
  };

  const selectedActionConfig = useMemo(() => {
    return PUSH_NOTIFICATION_ACTION_OPTIONS.find((opt) => opt.value === selectedAction);
  }, [selectedAction]);

  const canSubmit =
    title.trim().length >= 3 &&
    message.trim().length >= 5 &&
    hasTargetSelected &&
    !sendMutation.isPending;

  const handleOpenConfirm = () => {
    if (!canSubmit) return;

    const totalEligivel = estimate?.totalMotoristas ?? 0;
    const totalComPush = estimate?.comPushToken ?? 0;

    const publicoDescricao =
      targetMode === 'groups'
        ? isTodosSelected
          ? 'Todos os motoristas cadastrados'
          : `${selectedGroups.length} grupos (${selectedGroups
              .map((id) => TARGET_GROUPS.find((g) => g.id === id)?.shortLabel || id)
              .join(', ')})`
        : `${selectedDrivers.length} motorista(s) selecionado(s) manualmente`;

    openAdminConfirmBroadcastDialog({
      publicoDescricao,
      totalEligivel,
      totalComPush,
      selectedActionConfig,
      notificationTitle: title.trim(),
      notificationMessage: message.trim(),
      isSubmitting: sendMutation.isPending,
      onConfirm: async () => {
        try {
          const payload =
            targetMode === 'groups'
              ? {
                  status: selectedGroups,
                  titulo: title.trim(),
                  mensagem: message.trim(),
                  action: selectedAction,
                }
              : {
                  motoristaIds: selectedDrivers.map((d) => d.id),
                  titulo: title.trim(),
                  mensagem: message.trim(),
                  action: selectedAction,
                };

          const res = await sendMutation.mutateAsync(payload);

          toast.success(
            `Notificação disparada com sucesso! ${res.totalEnviados} notificações entregues.`
          );
          handleResetForm();
        } catch (err: unknown) {
          const error = err as Error;
          toast.error(error.message || 'Falha ao enviar notificação.');
          throw error;
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <Banner
        variant="info"
        title="Comunicados e Notificações para Motoristas"
        description="Envie comunicados diretamente para o celular dos motoristas por grupos de assinatura ou seleção nominal."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 space-y-6">
          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60 bg-transparent">
              <CardTitle className="flex items-center justify-between text-sm sm:text-base font-semibold text-foreground tracking-tight">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>1. Público Alvo</span>
                </div>
                {isEstimating && (
                  <span className="text-xs font-mono text-primary animate-pulse font-normal">
                    Calculando alcance...
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex p-1 bg-secondary/60 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setTargetMode('groups')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                    targetMode === 'groups'
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Por Grupos de Assinatura</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('manual')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                    targetMode === 'manual'
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Motoristas Específicos</span>
                  {selectedDrivers.length > 0 && (
                    <Badge className="ml-1 h-5 px-1.5 bg-primary text-primary-foreground text-[10px] font-mono">
                      {selectedDrivers.length}
                    </Badge>
                  )}
                </button>
              </div>

              {targetMode === 'groups' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllGroups}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                        isTodosSelected
                          ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/30 font-semibold'
                          : 'bg-background text-muted-foreground border-border hover:bg-secondary/60 hover:text-foreground'
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-md border transition-all ${
                          isTodosSelected
                            ? 'bg-primary border-transparent text-primary-foreground'
                            : 'border-border bg-secondary'
                        }`}
                      >
                        {isTodosSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span>Todos os Motoristas</span>
                    </button>

                    {TARGET_GROUPS.map((group) => {
                      const isSelected = !isTodosSelected && selectedGroups.includes(group.id);
                      const count = estimate?.detalhesPorStatus?.[group.id];

                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => handleToggleGroup(group.id)}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                            isSelected
                              ? `${group.activeBg} ${group.activeBorder} ${group.activeText} shadow-xs ring-1 ring-current/30 font-semibold`
                              : 'bg-background text-muted-foreground border-border hover:bg-secondary/60 hover:text-foreground'
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-4 h-4 rounded-md border transition-all ${
                              isSelected
                                ? group.activeCheckbox
                                : 'border-border bg-secondary'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                          <span>{group.label}</span>
                          {count !== undefined && count > 0 && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary border border-border text-foreground font-mono">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
                    <span className="flex items-center gap-1.5">
                      <CheckCheck className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {selectedGroups.length === 0
                          ? 'Nenhum grupo selecionado'
                          : isTodosSelected
                          ? 'Público: Todos os motoristas cadastrados'
                          : `Público: ${selectedGroups.length} grupo${
                              selectedGroups.length > 1 ? 's selecionados' : ' selecionado'
                            } (${selectedGroups
                              .map((id) => TARGET_GROUPS.find((g) => g.id === id)?.shortLabel || id)
                              .join(', ')})`}
                      </span>
                    </span>
                    <div className="flex items-center gap-2.5">
                      {selectedGroups.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedGroups([])}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          Limpar seleção
                        </button>
                      )}
                      {!isTodosSelected && (
                        <button
                          type="button"
                          onClick={handleSelectAllGroups}
                          className="text-xs text-primary hover:underline transition-colors font-medium"
                        >
                          Selecionar Todos
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div ref={searchContainerRef} className="relative w-full">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="Buscar por nome, telefone ou e-mail..."
                        value={driverSearchQuery}
                        onChange={(e) => {
                          setDriverSearchQuery(e.target.value);
                          if (!isSearchDropdownOpen) setIsSearchDropdownOpen(true);
                        }}
                        onFocus={() => {
                          if (driverSearchQuery.trim().length >= 1) {
                            setIsSearchDropdownOpen(true);
                          }
                        }}
                        className="pl-9 pr-9 h-9 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0"
                      />
                      <div className="absolute right-2.5 flex items-center gap-1">
                        {isSearchingDrivers && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                        {!isSearchingDrivers && driverSearchQuery.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setDriverSearchQuery('');
                              setIsSearchDropdownOpen(false);
                            }}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isSearchDropdownOpen && isSearchActive && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-popover border border-border shadow-xl overflow-hidden">
                        {isSearchingDrivers && (!driversResponse?.data || driversResponse.data.length === 0) ? (
                          <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Buscando motoristas...</span>
                          </div>
                        ) : !isSearchingDrivers && (!driversResponse?.data || driversResponse.data.length === 0) ? (
                          <div className="py-6 px-4 text-center text-xs text-muted-foreground">
                            Nenhum motorista encontrado para "{driverSearchQuery}".
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between px-3.5 py-2 border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40">
                              <span>Motoristas encontrados</span>
                              <span>
                                {driversResponse?.data?.length ?? 0}{' '}
                                {driversResponse?.data?.length === 1 ? 'resultado' : 'resultados'}
                              </span>
                            </div>
                            <div className="max-h-64 overflow-y-auto divide-y divide-border/60">
                              {driversResponse?.data?.map((driver) => {
                                const isAdded = selectedDrivers.some((d) => d.id === driver.id);
                                const statusAssinatura = driver.assinaturas?.[0]?.status;

                                return (
                                  <button
                                    key={driver.id}
                                    type="button"
                                    onClick={() => handleAddDriver(driver)}
                                    className={`w-full text-left p-2.5 flex items-center justify-between gap-3 transition-colors ${
                                      isAdded
                                        ? 'bg-primary/10'
                                        : 'hover:bg-secondary/60 cursor-pointer'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold text-xs flex items-center justify-center shrink-0">
                                        {driver.nome.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-semibold text-xs text-foreground truncate">{driver.nome}</span>
                                          {driver.apelido && (
                                            <span className="text-[11px] text-muted-foreground truncate">({driver.apelido})</span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                          {driver.telefone || driver.email}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {statusAssinatura && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] uppercase font-mono border-border bg-secondary text-foreground"
                                        >
                                          {statusAssinatura}
                                        </Badge>
                                      )}
                                      {isAdded ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                                          <Check className="h-3 w-3" />
                                          Adicionado
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                                          <Plus className="h-3 w-3" />
                                          Adicionar
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedDrivers.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-border bg-secondary/20 space-y-1.5">
                      <UserPlus className="h-6 w-6 text-muted-foreground mx-auto" />
                      <p className="text-xs font-semibold text-foreground">Nenhum motorista adicionado</p>
                      <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                        Pesquise pelo nome, telefone ou e-mail no campo acima e selecione os motoristas para disparo.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-primary" />
                          <span>Motoristas selecionados ({selectedDrivers.length}):</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleClearAllDrivers}
                          className="text-[11px] text-destructive hover:underline transition-colors font-medium"
                        >
                          Limpar lista
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {selectedDrivers.map((driver) => (
                          <div
                            key={driver.id}
                            className="p-2 rounded-xl bg-secondary/40 border border-border/80 flex items-center justify-between gap-3 hover:border-border transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="h-6 w-6 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold text-xs flex items-center justify-center shrink-0">
                                {driver.nome.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground truncate">{driver.nome}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{driver.telefone || driver.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {driver.statusAssinatura && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase font-mono border-border bg-background text-foreground"
                                >
                                  {driver.statusAssinatura}
                                </Badge>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveDriver(driver.id)}
                                className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Remover"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-secondary/30 border border-border/80">
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Motoristas no alcance
                  </span>
                  <p className="text-xl font-bold font-headline text-foreground mt-0.5">
                    {hasTargetSelected ? (estimate ? estimate.totalMotoristas : '...') : 0}
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    {targetMode === 'groups'
                      ? selectedGroups.length === 0
                        ? 'Nenhum grupo selecionado'
                        : 'Nos grupos escolhidos'
                      : 'Selecionados manualmente'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block flex items-center gap-1.5">
                    <Smartphone className="h-3 w-3" />
                    <span>Recebem Push no App</span>
                  </span>
                  <p className="text-xl font-bold font-headline text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {hasTargetSelected ? (estimate ? estimate.comPushToken : '...') : 0}
                  </p>
                  <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                    {hasTargetSelected && estimate && estimate.totalMotoristas > 0
                      ? `${Math.round((estimate.comPushToken / estimate.totalMotoristas) * 100)}% com app ativo`
                      : 'Receberão no celular'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/30 border border-border/80">
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Sem app instalado
                  </span>
                  <p className="text-xl font-bold font-headline text-muted-foreground mt-0.5">
                    {hasTargetSelected ? (estimate ? estimate.semPushToken : '...') : 0}
                  </p>
                  <span className="text-[11px] text-muted-foreground">Ainda não abriram o aplicativo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60 bg-transparent">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground tracking-tight">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>2. Modelos Prontos (Opcional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 -mx-1 px-1 touch-pan-x">
                {BROADCAST_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                        : 'bg-background text-muted-foreground border-border hover:bg-secondary/60 hover:text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="p-3 text-left rounded-xl bg-secondary/30 hover:bg-secondary/70 border border-border transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground shrink-0">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{tmpl.body}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60 bg-transparent">
              <CardTitle className="flex items-center justify-between text-sm sm:text-base font-semibold text-foreground tracking-tight">
                <div className="flex items-center gap-2">
                  <SmartphoneNfc className="h-4 w-4 text-primary" />
                  <span>3. Mensagem e Destino</span>
                </div>
                {(title || message) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetForm}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Limpar campos
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground block leading-none">Título da Notificação</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{title.length}/100</span>
                </div>
                <Input
                  type="text"
                  placeholder="Ex: 🚀 Nova Atualização Disponível!"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground block leading-none">Mensagem</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{message.length}/500</span>
                </div>
                <Textarea
                  placeholder="Descreva o comunicado com clareza para os motoristas..."
                  value={message}
                  maxLength={500}
                  rows={4}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm resize-none focus-visible:ring-0 p-3"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 leading-none">
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  <span>Destino ao clicar no celular (Deep Link)</span>
                </Label>
                <Select
                  value={selectedAction}
                  onValueChange={(val) => setSelectedAction(val as PushNotificationAction)}
                >
                  <SelectTrigger className="h-9 rounded-lg bg-background border border-border text-foreground text-xs sm:text-sm focus-visible:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-popover-foreground max-h-80 shadow-xl rounded-2xl p-1 z-50">
                    {PUSH_NOTIFICATION_ACTION_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="py-2 px-2.5 rounded-xl cursor-pointer text-xs focus:bg-secondary focus:text-foreground"
                      >
                        <div className="flex items-center justify-between w-full gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <opt.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-xs font-medium text-foreground truncate">{opt.label}</span>
                          </div>
                          <code className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border shrink-0">
                            {opt.route}
                          </code>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleOpenConfirm}
                  disabled={!canSubmit}
                  className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {sendMutation.isPending ? (
                    <span>Disparando notificação...</span>
                  ) : !hasTargetSelected ? (
                    <span>Selecione o público da notificação</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>
                        Disparar para {estimate ? estimate.comPushToken : 0} Motoristas
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card xl:sticky xl:top-28">
            <CardHeader className="pb-3 border-b border-border/60 bg-transparent">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground tracking-tight">
                <Smartphone className="h-4 w-4 text-emerald-500" />
                <span>Pré-visualização no Smartphone</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 pb-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-[300px] rounded-[2.5rem] p-3 bg-slate-950 border-4 border-border/80 shadow-xl relative overflow-hidden text-slate-100">
                <div className="w-20 h-3.5 bg-slate-800 rounded-full mx-auto mb-3" />

                <div className="px-3 flex items-center justify-between text-[11px] text-slate-400 font-mono mb-5">
                  <span>12:45</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <img
                        src="/assets/logo-van360.webp"
                        alt="Van360"
                        className="h-3.5 w-auto object-contain brightness-0 invert"
                      />
                      <span className="text-[10px] font-bold text-slate-200 tracking-wider uppercase">
                        VAN360
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">agora</span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {title.trim() || 'Título da notificação aparecerá aqui'}
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                      {message.trim() ||
                        'A mensagem enviada para o aplicativo dos motoristas será exibida neste espaço com formatação nativa.'}
                    </p>
                  </div>

                  {selectedActionConfig && (
                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[10px] font-medium text-blue-400">
                      <div className="flex items-center gap-1 truncate">
                        <selectedActionConfig.icon className="h-3 w-3 shrink-0" />
                        <span className="truncate">Ao tocar: {selectedActionConfig.label}</span>
                      </div>
                      <code className="text-[9px] font-mono text-blue-300 bg-blue-950/80 px-1 py-0.5 rounded shrink-0">
                        {selectedActionConfig.route}
                      </code>
                    </div>
                  )}
                </div>

                <div className="mt-10 mb-1 flex justify-center">
                  <div className="w-28 h-1 bg-slate-700 rounded-full" />
                </div>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-secondary/30 border border-border/80 w-full text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Envio com Prioridade Máxima</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  O Firebase entrega o alerta mesmo com o app em segundo plano ou fechado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
