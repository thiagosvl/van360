import { useState, useEffect, useRef } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { isDevEnv } from "@/utils/detectPlatform";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Route as RouteIcon, Wand2 } from "lucide-react";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { usePermissions } from "@/hooks/business/usePermissions";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/notifications/toast";
import { mockGenerator } from "@/utils/mocks/generator";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface RouteFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingRoute?: {
    nome: string;
    veiculoId: string;
    escolaFixaId?: string;
  } | null;
  onSuccess: (data: {
    nome: string;
    veiculoId: string;
    escolaFixaId?: string;
  }) => void;
}

export default function RouteFormDialog({
  isOpen,
  onClose,
  editingRoute,
  onSuccess,
}: RouteFormDialogProps) {
  const { can, isSubConta } = usePermissions();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const usuarioId = profile?.id || "";

  const { data: veiculosQueryData, isLoading: isLoadingVeiculos } = useVeiculos(
    { usuarioId },
    { enabled: !!usuarioId && (can("veiculos.gerenciar") || can("rotas.visualizar")) }
  );
  const veiculosList = veiculosQueryData?.list || [];

  const userAssignedVeiculoId = profile?.veiculo_id || (profile as any)?.veiculo?.id || "";
  const defaultVeiculoId = editingRoute?.veiculoId || userAssignedVeiculoId || (veiculosList.length > 0 ? veiculosList[0].id : "");

  const [nome, setNome] = useState(() => editingRoute?.nome || "");
  const [veiculoId, setVeiculoId] = useState(() => defaultVeiculoId);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (editingRoute) {
        setNome(editingRoute.nome || "");
        setVeiculoId(editingRoute.veiculoId || userAssignedVeiculoId || (veiculosList.length > 0 ? veiculosList[0].id : ""));
      } else {
        setNome("");
        const selectedId = userAssignedVeiculoId || (veiculosList.length === 1 ? veiculosList[0].id : "");
        setVeiculoId(selectedId);
      }
      setErrors({});
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, editingRoute, userAssignedVeiculoId, veiculosList]);

  useEffect(() => {
    if (isOpen && !veiculoId && defaultVeiculoId) {
      setVeiculoId(defaultVeiculoId);
    }
  }, [isOpen, veiculoId, defaultVeiculoId]);

  const handleFillMock = () => {
    const mockData = mockGenerator.rota();
    setNome(mockData.nome);
    if (veiculosList.length > 0) {
      const randomIndex = Math.floor(Math.random() * veiculosList.length);
      setVeiculoId(veiculosList[randomIndex]?.id || "");
    } else if (defaultVeiculoId) {
      setVeiculoId(defaultVeiculoId);
    }
    setErrors({});
  };

  const handleConfirm = () => {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = "O nome da rota é obrigatório.";
    const targetVeiculoId = veiculoId || defaultVeiculoId;
    if (!targetVeiculoId || targetVeiculoId === "none") errs.veiculoId = "Selecione o veículo da rota.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.warning("Preencha todos os campos obrigatórios.");
      return;
    }

    setErrors({});
    onSuccess({
      nome: nome.trim(),
      veiculoId: targetVeiculoId,
      escolaFixaId: "",
    });
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(val) => !val && safeCloseDialog(onClose)} maxWidth="md">
      <BaseDialog.Header
        title={editingRoute ? "Editar Rota" : "Nova Rota"}
        subtitle={editingRoute ? "Atualize as informações da rota" : "Cadastre uma nova rota no sistema"}
        icon={<RouteIcon className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] hover:text-primary hover:bg-primary/10 transition-all active:scale-95 shadow-none"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />
      <BaseDialog.Body>
        <div className="space-y-4 text-left">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#737373]">
              Dê um nome para esta rota <span className="text-[#e7000b]">*</span>
            </Label>
            <Input
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErrors((prev) => ({ ...prev, nome: "" }));
              }}
              placeholder="Ex: Rota da Manhã"
              className="h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a]"
            />
            {errors.nome && (
              <p className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.nome}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#737373]">
              Veículo <span className="text-[#e7000b]">*</span>
            </Label>
            <NativeSelect
              disabled={isLoadingVeiculos || isSubConta}
              value={veiculoId || userAssignedVeiculoId || (veiculosList.length > 0 ? veiculosList[0].id : "")}
              onChange={(e) => {
                if (!isSubConta) {
                  setVeiculoId(e.target.value);
                  setErrors((prev) => ({ ...prev, veiculoId: "" }));
                }
              }}
              className={cn(
                "h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a]",
                isLoadingVeiculos && "opacity-80 cursor-not-allowed",
                errors.veiculoId && "border-[#e7000b]"
              )}
            >
              <option value="">
                {isLoadingVeiculos ? "Carregando veículos..." : "Selecione o veículo"}
              </option>
              {veiculosList.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.modelo} - {v.placa}
                </option>
              ))}
            </NativeSelect>
            {errors.veiculoId && (
              <p className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.veiculoId}
              </p>
            )}
          </div>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={() => safeCloseDialog(onClose)}
        />
        <BaseDialog.Action
          label={editingRoute ? "Salvar" : "Confirmar"}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
