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
    activeBorder: 'border-emerald-500/70',
    activeBg: 'bg-emerald-500/15',
    activeText: 'text-emerald-300',
    activeCheckbox: 'bg-emerald-500 border-emerald-400 text-slate-950',
  },
  {
    id: 'TRIAL',
    label: 'Em Teste Grátis (Trial)',
    shortLabel: 'Trial',
    activeBorder: 'border-blue-500/70',
    activeBg: 'bg-blue-500/15',
    activeText: 'text-blue-300',
    activeCheckbox: 'bg-blue-500 border-blue-400 text-white',
  },
  {
    id: 'PAST_DUE',
    label: 'Em Carência / Atraso',
    shortLabel: 'Em Atraso',
    activeBorder: 'border-amber-500/70',
    activeBg: 'bg-amber-500/15',
    activeText: 'text-amber-300',
    activeCheckbox: 'bg-amber-500 border-amber-400 text-slate-950',
  },
  {
    id: 'EXPIRED',
    label: 'Expirados',
    shortLabel: 'Expirados',
    activeBorder: 'border-rose-500/70',
    activeBg: 'bg-rose-500/15',
    activeText: 'text-rose-300',
    activeCheckbox: 'bg-rose-500 border-rose-400 text-white',
  },
  {
    id: 'CANCELED',
    label: 'Cancelados',
    shortLabel: 'Cancelados',
    activeBorder: 'border-slate-500/70',
    activeBg: 'bg-slate-700/30',
    activeText: 'text-slate-300',
    activeCheckbox: 'bg-slate-600 border-slate-400 text-white',
  },
  {
    id: 'VITALICIO',
    label: 'Vitalícios / Parceiros',
    shortLabel: 'Vitalício',
    activeBorder: 'border-purple-500/70',
    activeBg: 'bg-purple-500/15',
    activeText: 'text-purple-300',
    activeCheckbox: 'bg-purple-500 border-purple-400 text-white',
  },
];

export function AdminBroadcastNotificationView() {
  const { openAdminConfirmBroadcastDialog } = useLayout();

  const [targetMode, setTargetMode] = useState<'groups' | 'manual'>('groups');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['TODOS']);
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
    setSelectedGroups(['TODOS']);
  };

  const handleToggleGroup = (groupId: string) => {
    if (groupId === 'TODOS') {
      setSelectedGroups(['TODOS']);
      return;
    }

    let next = selectedGroups.filter((g) => g !== 'TODOS');

    if (next.includes(groupId)) {
      next = next.filter((g) => g !== groupId);
    } else {
      next = [...next, groupId];
    }

    if (next.length === 0) {
      next = ['TODOS'];
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
      isTodosSelected &&
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
      setSelectedGroups(['TODOS']);
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
        description="Envie avisos e novidades diretamente para os motoristas no celular. Você pode mandar para toda a base, escolher grupos específicos ou selecionar motoristas na mão."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
            <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-900/40">
              <CardTitle className="flex items-center justify-between text-sm font-headline font-black text-white uppercase tracking-tight">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>1. Quem vai receber a notificação?</span>
                </div>
                {isEstimating && (
                  <span className="text-[11px] font-mono text-blue-400 animate-pulse font-normal">
                    Calculando alcance...
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setTargetMode('groups')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    targetMode === 'groups'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Por Grupos de Assinatura</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('manual')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    targetMode === 'manual'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Selecionar Motoristas na Mão</span>
                  {selectedDrivers.length > 0 && (
                    <Badge className="ml-1 h-5 px-1.5 bg-blue-500 text-white text-[10px] font-mono">
                      {selectedDrivers.length}
                    </Badge>
                  )}
                </button>
              </div>

              {targetMode === 'groups' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={handleSelectAllGroups}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isTodosSelected
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm shadow-blue-500/20 ring-1 ring-blue-500/40'
                          : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700 hover:bg-slate-800/80'
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-md border transition-all ${
                          isTodosSelected
                            ? 'bg-blue-500 border-transparent text-white'
                            : 'border-slate-700 bg-slate-800/80'
                        }`}
                      >
                        {isTodosSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span>🌐 Todos os Motoristas</span>
                    </button>

                    {TARGET_GROUPS.map((group) => {
                      const isSelected = !isTodosSelected && selectedGroups.includes(group.id);
                      const count = estimate?.detalhesPorStatus?.[group.id];

                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => handleToggleGroup(group.id)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? `${group.activeBg} ${group.activeBorder} ${group.activeText} shadow-sm ring-1 ring-current/30`
                              : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/80'
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-4 h-4 rounded-md border transition-all ${
                              isSelected
                                ? group.activeCheckbox
                                : 'border-slate-700 bg-slate-800/80'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                          <span>{group.label}</span>
                          {count !== undefined && count > 0 && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 font-mono">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1.5">
                      <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                      <span>
                        {isTodosSelected
                          ? 'Público: Todos os motoristas cadastrados'
                          : `Público: ${selectedGroups.length} grupo${
                              selectedGroups.length > 1 ? 's selecionados' : ' selecionado'
                            } (${selectedGroups
                              .map((id) => TARGET_GROUPS.find((g) => g.id === id)?.shortLabel || id)
                              .join(', ')})`}
                      </span>
                    </span>
                    {!isTodosSelected && (
                      <button
                        type="button"
                        onClick={handleSelectAllGroups}
                        className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors font-medium"
                      >
                        Selecionar Todos
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div ref={searchContainerRef} className="relative w-full">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="Buscar motorista para adicionar... (nome, apelido, telefone ou email)"
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
                        className="pl-10 pr-9 h-11 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-blue-500"
                      />
                      <div className="absolute right-3 flex items-center gap-1">
                        {isSearchingDrivers && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                        {!isSearchingDrivers && driverSearchQuery.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setDriverSearchQuery('');
                              setIsSearchDropdownOpen(false);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Autocomplete Dropdown Flutuante */}
                    {isSearchDropdownOpen && isSearchActive && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-[#0c1322] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
                        {isSearchingDrivers && (!driversResponse?.data || driversResponse.data.length === 0) ? (
                          <div className="flex items-center justify-center gap-2.5 py-6 text-xs text-slate-400">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                            <span>Buscando motoristas...</span>
                          </div>
                        ) : !isSearchingDrivers && (!driversResponse?.data || driversResponse.data.length === 0) ? (
                          <div className="py-6 px-4 text-center text-xs text-slate-400">
                            Nenhum motorista encontrado para "{driverSearchQuery}".
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              <span>Motoristas encontrados</span>
                              <span>
                                {driversResponse?.data?.length ?? 0}{' '}
                                {driversResponse?.data?.length === 1 ? 'resultado' : 'resultados'}
                              </span>
                            </div>
                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40">
                              {driversResponse?.data?.map((driver) => {
                                const isAdded = selectedDrivers.some((d) => d.id === driver.id);
                                const statusAssinatura = driver.assinaturas?.[0]?.status;

                                return (
                                  <button
                                    key={driver.id}
                                    type="button"
                                    onClick={() => handleAddDriver(driver)}
                                    className={`w-full text-left p-3 flex items-center justify-between gap-3 transition-colors ${
                                      isAdded
                                        ? 'bg-blue-500/10 hover:bg-blue-500/15'
                                        : 'hover:bg-slate-800/60 cursor-pointer'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-xs flex items-center justify-center shrink-0">
                                        {driver.nome.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-xs text-slate-200 truncate">{driver.nome}</span>
                                          {driver.apelido && (
                                            <span className="text-[11px] text-slate-400 truncate">({driver.apelido})</span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-slate-400 truncate">
                                          {driver.telefone || driver.email}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {statusAssinatura && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] uppercase font-mono border-slate-700 bg-slate-800/80 text-slate-300"
                                        >
                                          {statusAssinatura}
                                        </Badge>
                                      )}
                                      {isAdded ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                                          <Check className="h-3 w-3" />
                                          Adicionado
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-lg">
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

                  {/* Lista de Motoristas Adicionados */}
                  {selectedDrivers.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800/90 bg-slate-950/40 space-y-2">
                      <UserPlus className="h-8 w-8 text-slate-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-300">Nenhum motorista adicionado ainda</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Digite o nome, apelido, telefone ou email no campo acima para pesquisar e clicar no motorista para incluí-lo na lista.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                          <span>Motoristas que receberão a notificação ({selectedDrivers.length}):</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleClearAllDrivers}
                          className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors font-medium"
                        >
                          Limpar lista
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                        {selectedDrivers.map((driver) => (
                          <div
                            key={driver.id}
                            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-xs flex items-center justify-center shrink-0">
                                {driver.nome.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-100 truncate">{driver.nome}</p>
                                <p className="text-[11px] text-slate-400 truncate">{driver.telefone || driver.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {driver.statusAssinatura && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase font-mono border-slate-700 bg-slate-800/80 text-slate-300"
                                >
                                  {driver.statusAssinatura}
                                </Badge>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveDriver(driver.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Remover motorista da lista"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Motoristas Selecionados
                  </span>
                  <p className="text-xl font-black text-white mt-1">
                    {estimate ? estimate.totalMotoristas : '...'}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {targetMode === 'groups' ? 'Nos grupos escolhidos' : 'Selecionados na mão'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block flex items-center gap-1.5">
                    <Smartphone className="h-3 w-3" />
                    <span>Recebem no Celular (Push)</span>
                  </span>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    {estimate ? estimate.comPushToken : '...'}
                  </p>
                  <span className="text-[11px] text-emerald-500/80">
                    {estimate && estimate.totalMotoristas > 0
                      ? `${Math.round((estimate.comPushToken / estimate.totalMotoristas) * 100)}% com app instalado`
                      : 'Receberão no celular'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Sem App Instalado
                  </span>
                  <p className="text-xl font-black text-slate-400 mt-1">
                    {estimate ? estimate.semPushToken : '...'}
                  </p>
                  <span className="text-[11px] text-slate-500">Ainda não abriram o aplicativo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
            <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-900/40">
              <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>2. Modelos Prontos para Enviar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {BROADCAST_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500/20 border-amber-500/70 text-amber-300 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="p-3 text-left rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{tmpl.body}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
            <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-900/40">
              <CardTitle className="flex items-center justify-between text-sm font-headline font-black text-white uppercase tracking-tight">
                <div className="flex items-center gap-2">
                  <SmartphoneNfc className="h-4 w-4 text-indigo-400" />
                  <span>3. Conteúdo da Notificação</span>
                </div>
                {(title || message) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetForm}
                    className="h-7 text-xs text-slate-400 hover:text-white px-2"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-300">Título da Notificação</Label>
                  <span className="text-[10px] text-slate-500 font-mono">{title.length}/100</span>
                </div>
                <Input
                  type="text"
                  placeholder="Ex: 🚀 Nova Atualização Disponível!"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-300">Mensagem do Comunicado</Label>
                  <span className="text-[10px] text-slate-500 font-mono">{message.length}/500</span>
                </div>
                <Textarea
                  placeholder="Descreva o aviso com clareza e objetividade para os motoristas..."
                  value={message}
                  maxLength={500}
                  rows={4}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm resize-none focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
                  <span>Destino ao Clicar na Notificação (Deep Link / Rota)</span>
                </Label>
                <Select
                  value={selectedAction}
                  onValueChange={(val) => setSelectedAction(val as PushNotificationAction)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-slate-900/90 border-slate-800 text-slate-200 text-xs focus-visible:ring-blue-500 hover:border-slate-700 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c1322] border border-slate-700/80 text-slate-100 max-h-80 shadow-2xl rounded-2xl p-1.5 space-y-1 z-50">
                    {PUSH_NOTIFICATION_ACTION_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="py-2.5 px-3 rounded-xl cursor-pointer transition-colors focus:bg-slate-800/90 focus:text-white data-[state=checked]:bg-blue-600/30 data-[state=checked]:border data-[state=checked]:border-blue-500/60 data-[state=checked]:text-white text-slate-200"
                      >
                        <div className="flex items-center justify-between w-full gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-blue-400 shrink-0">
                              <opt.icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-100 truncate">{opt.label}</span>
                          </div>
                          <code className="text-[11px] font-mono text-blue-400 bg-blue-950/70 px-2 py-0.5 rounded-md border border-blue-800/50 shrink-0">
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
                  className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {sendMutation.isPending ? (
                    <span>Disparando Notificação...</span>
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
          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] sticky top-28 lg:top-32">
            <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-900/40">
              <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>Live Preview no Smartphone</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center">
              <div className="w-full max-w-[320px] rounded-[2.5rem] p-3 bg-slate-950 border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

                <div className="px-3 flex items-center justify-between text-[11px] text-slate-400 font-mono mb-6">
                  <span>12:45</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg space-y-2 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <img
                        src="/assets/logo-van360.webp"
                        alt="Van360"
                        className="h-3.5 w-auto object-contain brightness-0 invert"
                      />
                      <span className="text-[10px] font-black text-slate-200 tracking-wider uppercase">
                        VAN360
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">agora</span>
                  </div>

                  <div>
                    <p className="text-xs font-black text-white leading-tight">
                      {title.trim() || 'Título da notificação aparecerá aqui'}
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                      {message.trim() ||
                        'A mensagem completa enviada para o aplicativo dos motoristas será exibida neste espaço com formatação nativa.'}
                    </p>
                  </div>

                  {selectedActionConfig && (
                    <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between gap-1 text-[10px] font-bold text-blue-400">
                      <div className="flex items-center gap-1 truncate">
                        <selectedActionConfig.icon className="h-3 w-3 shrink-0" />
                        <span className="truncate">Ao tocar: {selectedActionConfig.label}</span>
                      </div>
                      <code className="text-[9px] font-mono text-blue-300 bg-blue-950/80 px-1 py-0.2 rounded shrink-0">
                        {selectedActionConfig.route}
                      </code>
                    </div>
                  )}
                </div>

                <div className="mt-12 mb-2 flex justify-center">
                  <div className="w-32 h-1 bg-slate-700 rounded-full" />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 w-full text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Envio com Prioridade Máxima</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  O Firebase entrega mesmo com o app em segundo plano ou fechado. Tokens inválidos ou desinstalados são higienizados automaticamente da base.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
