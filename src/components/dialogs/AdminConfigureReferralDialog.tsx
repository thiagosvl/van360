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
        title={currentIndicadorId ? "Alterar indicador do motorista" : "Atribuir indicador ao motorista"}
        subtitle={`Defina qual motorista indicou ${userName} para a plataforma.`}
        onClose={handleClose}
      />

      <AdminBaseDialog.Body>
        <div className="space-y-4">
          <Banner
            variant="info"
            title="Vínculo de indicação"
            description="Ao vincular o indicador, o motorista receberá o benefício de indicação e seu canal de aquisição será definido como 'indicação'."
          />

          {currentIndicadorNome && (
            <div className="p-3.5 rounded-xl border border-border bg-secondary/30 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Indicador atual:</span>
              <span className="font-semibold text-foreground">{currentIndicadorNome}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Buscar motorista indicador (nome, telefone ou CPF)
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Digite para buscar..."
                className="pl-10 pr-10 h-10 rounded-xl bg-secondary/50 border-input text-foreground text-xs focus-visible:ring-primary placeholder:text-muted-foreground"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-0 bottom-0 flex items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          {shouldSearch && candidates.length === 0 && !isSearching && (
            <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              Nenhum motorista encontrado com os termos digitados.
            </div>
          )}

          {candidates.length > 0 && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <span className="text-xs font-medium text-muted-foreground block">
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
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-border bg-card hover:border-border/80 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground truncate">{candidate.nome}</p>
                          {candidate.id === currentIndicadorId && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                              Atual
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          {candidate.telefone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3 text-emerald-400" />
                              {phoneMask(candidate.telefone)}
                            </span>
                          )}
                          {candidate.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {candidate.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-secondary"
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
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <UserCheck className="h-4 w-4" />
                <span>Motorista selecionado como indicador:</span>
              </div>
              <div className="text-xs text-foreground">
                <p className="font-semibold text-foreground text-sm">{selectedIndicador.nome}</p>
                <p className="text-muted-foreground font-mono mt-0.5">
                  Telefone: {phoneMask(selectedIndicador.telefone)} • {selectedIndicador.email}
                </p>
                {selectedIndicador.cpfcnpj && (
                  <p className="text-muted-foreground font-mono text-[11px] mt-0.5">
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
          label={setReferralMutation.isPending ? "Salvando..." : "Confirmar atribuição"}
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
