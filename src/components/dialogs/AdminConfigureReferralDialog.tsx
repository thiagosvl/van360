import { useState, useMemo } from "react";
import { Search, UserCheck, Phone, Mail, CheckCircle2, UserPlus, Loader2 } from "lucide-react";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useAdminUsers, useSetUserReferralAdmin } from "@/hooks/api/adminHooks";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { phoneMask, cpfCnpjMask } from "@/utils/masks";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import { UserType } from "@/types/enums";

export interface AdminConfigureReferralDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentIndicadorId?: string | null;
  currentIndicadorNome?: string | null;
  onSuccess?: () => void;
}

interface SelectedIndicador {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cpfcnpj?: string | null;
}

export function AdminConfigureReferralDialog({
  isOpen,
  onClose,
  userId,
  userName,
  currentIndicadorId,
  currentIndicadorNome,
  onSuccess,
}: AdminConfigureReferralDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedIndicador, setSelectedIndicador] = useState<SelectedIndicador | null>(null);

  const debouncedSearch = useDebounce(search.trim(), 350);
  const shouldSearch = debouncedSearch.length >= 2;

  const { data: usersData, isFetching: isSearching } = useAdminUsers(
    { search: debouncedSearch, limit: 8, tipo: UserType.MOTORISTA },
    { enabled: isOpen && shouldSearch }
  );

  const setReferralMutation = useSetUserReferralAdmin();

  const candidates = useMemo(() => {
    if (!usersData?.data) return [];
    return usersData.data.filter((u) => u.id !== userId && u.tipo === UserType.MOTORISTA);
  }, [usersData?.data, userId]);

  const handleClose = () => {
    safeCloseDialog(() => {
      setSearch("");
      setSelectedIndicador(null);
      onClose();
    });
  };

  const handleConfirm = async () => {
    if (!selectedIndicador) return;

    await setReferralMutation.mutateAsync({
      id: userId,
      indicadorId: selectedIndicador.id,
    });

    if (onSuccess) {
      onSuccess();
    }
    handleClose();
  };

  return (
    <AdminBaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      description={`Defina qual motorista indicou ${userName} para a plataforma.`}
      maxWidth="2xl"
    >
      <AdminBaseDialog.Header
        title={currentIndicadorId ? "Alterar Indicador do Motorista" : "Atribuir Indicador ao Motorista"}
        subtitle={`Defina qual motorista indicou ${userName} para a plataforma.`}
        onClose={handleClose}
      />

      <AdminBaseDialog.Body>
        <div className="space-y-5">
          <Banner
            variant="info"
            title="Vínculo de Indicação"
            description="Ao vincular o indicador, o motorista receberá o benefício de indicação e seu canal de aquisição será definido como 'indicação'."
          />

          {currentIndicadorNome && (
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs">
              <span className="text-slate-400">Indicador atual:</span>
              <span className="font-bold text-slate-200">{currentIndicadorNome}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Buscar Motorista Indicador (Nome, Telefone ou CPF)
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Digite para buscar..."
                className="pl-10 pr-10 h-11 rounded-xl bg-slate-900/80 border-slate-800 text-slate-100 text-sm focus-visible:ring-blue-500"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-0 bottom-0 flex items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                </div>
              )}
            </div>
          </div>

          {shouldSearch && candidates.length === 0 && !isSearching && (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Nenhum motorista encontrado com os termos digitados.
            </div>
          )}

          {candidates.length > 0 && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Resultados da busca:
              </span>
              <div className="grid gap-2">
                {candidates.map((candidate) => {
                  const isSelected = selectedIndicador?.id === candidate.id;
                  return (
                    <div
                      key={candidate.id}
                      onClick={() =>
                        setSelectedIndicador({
                          id: candidate.id,
                          nome: candidate.nome,
                          telefone: candidate.telefone,
                          email: candidate.email,
                          cpfcnpj: candidate.cpfcnpj,
                        })
                      }
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                          : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{candidate.nome}</p>
                          {candidate.id === currentIndicadorId && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              Atual
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          {candidate.telefone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3 text-emerald-400" />
                              {phoneMask(candidate.telefone)}
                            </span>
                          )}
                          {candidate.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 text-slate-500" />
                              {candidate.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          isSelected
                            ? "border-blue-400 bg-blue-500 text-white"
                            : "border-slate-700 bg-slate-900"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedIndicador && (
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <UserCheck className="h-4 w-4" />
                <span>Motorista Selecionado como Indicador:</span>
              </div>
              <div className="text-xs text-slate-200">
                <p className="font-bold text-white text-sm">{selectedIndicador.nome}</p>
                <p className="text-slate-400 font-mono mt-0.5">
                  Telefone: {phoneMask(selectedIndicador.telefone)} • {selectedIndicador.email}
                </p>
                {selectedIndicador.cpfcnpj && (
                  <p className="text-slate-500 font-mono text-[11px]">
                    Documento: {cpfCnpjMask(selectedIndicador.cpfcnpj)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </AdminBaseDialog.Body>

      <AdminBaseDialog.Footer>
        <AdminBaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={handleClose}
          disabled={setReferralMutation.isPending}
        />
        <AdminBaseDialog.Action
          label={setReferralMutation.isPending ? "Salvando..." : "Confirmar Atribuição"}
          variant="primary"
          icon={<UserPlus className="h-4 w-4" />}
          onClick={handleConfirm}
          isLoading={setReferralMutation.isPending}
          disabled={!selectedIndicador || setReferralMutation.isPending}
        />
      </AdminBaseDialog.Footer>
    </AdminBaseDialog>
  );
}
