import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Route as RouteIcon, Wand2 } from "lucide-react";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/notifications/toast";
import { mockGenerator } from "@/utils/mocks/generator";

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
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const usuarioId = profile?.id || "";

  const { data: veiculosQueryData } = useVeiculos({ usuarioId }, { enabled: !!usuarioId });
  const veiculosList = veiculosQueryData?.list || [];

  const [nome, setNome] = useState(() => editingRoute?.nome || "");
  const [veiculoId, setVeiculoId] = useState(() => editingRoute?.veiculoId || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingRoute) {
        setNome(editingRoute.nome || "");
        setVeiculoId(editingRoute.veiculoId || "");
      } else {
        setNome("");
        if (veiculosList.length === 1) {
          setVeiculoId(veiculosList[0].id);
        } else {
          setVeiculoId("");
        }
      }
      setErrors({});
    }
  }, [isOpen, editingRoute, veiculosList]);

  const handleFillMock = () => {
    const mockData = mockGenerator.rota();
    setNome(mockData.nome);
    if (veiculosList.length > 0) {
      const randomIndex = Math.floor(Math.random() * veiculosList.length);
      setVeiculoId(veiculosList[randomIndex]?.id || "");
    }
    setErrors({});
  };

  const handleConfirm = () => {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = "O nome da rota é obrigatório.";
    if (!veiculoId || veiculoId === "none") errs.veiculoId = "Selecione o veículo da rota.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.warning("Preencha todos os campos obrigatórios.");
      return;
    }

    setErrors({});
    onSuccess({
      nome: nome.trim(),
      veiculoId,
      escolaFixaId: "",
    });
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(val) => !val && onClose()} maxWidth="md">
      <BaseDialog.Header
        title={editingRoute ? "EDIÇÃO DE ROTA" : "NOVA ROTA"}
        icon={<RouteIcon className="w-5 h-5" />}
        onClose={onClose}
        leftAction={import.meta.env.DEV && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        )}
      />
      <BaseDialog.Body>
        <div className="space-y-4 text-left pt-4">
          <div className="space-y-1">
            <Label className="text-slate-700 font-semibold ml-1">
              Nome identificador <span className="text-red-500">*</span>
            </Label>
            <Input
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErrors(prev => ({ ...prev, nome: "" }));
              }}
              placeholder="Ex: Rota das Escolas Municipais"
              className="h-12 rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
            />
            {errors.nome && (
              <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.nome}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-slate-700 font-semibold ml-1">
              Veículo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={veiculoId}
              onValueChange={(val) => {
                setVeiculoId(val);
                setErrors(prev => ({ ...prev, veiculoId: "" }));
              }}
            >
              <SelectTrigger
                className={cn(
                  "h-12 rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                  errors.veiculoId && "border-red-500"
                )}
              >
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {veiculosList.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.modelo} - {v.placa}
                  </SelectItem>
                ))}
                {veiculosList.length === 0 && (
                  <SelectItem value="none" disabled>
                    Nenhum veículo ativo
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.veiculoId && (
              <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.veiculoId}
              </p>
            )}
          </div>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="CANCELAR"
          onClick={onClose}
        />
        <BaseDialog.Action
          label={editingRoute ? "SALVAR" : "CONFIRMAR"}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
