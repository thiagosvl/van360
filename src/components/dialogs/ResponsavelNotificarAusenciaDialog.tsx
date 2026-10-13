import React, { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { CalendarX } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RotaMultiSelect } from "@/components/ui/RotaMultiSelect";
import { PeriodoAusenciaCampos } from "@/components/ui/PeriodoAusenciaCampos";
import { responsavelApi } from "@/services/api/responsavel.api";
import { ResponsavelRotaItem } from "@/types/responsavel";
import { toast } from "sonner";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

interface ResponsavelNotificarAusenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiroId: string;
  passageiroNome: string;
  rotas?: ResponsavelRotaItem[];
  token: string;
  onSuccess?: () => void;
}

export const ResponsavelNotificarAusenciaDialog: React.FC<ResponsavelNotificarAusenciaDialogProps> = ({
  open,
  onOpenChange,
  passageiroId,
  passageiroNome,
  rotas = [],
  token,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedRotasIds, setSelectedRotasIds] = useState<string[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [keepOpen, setKeepOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setSelectedRotasIds(rotas.length === 1 ? [rotas[0].id] : []);
      setDataInicio("");
      setDataFim("");
      setKeepOpen(false);
      setErrors({});
      setLoading(false);
    }
  }, [open, rotas]);

  useEffect(() => {
    if (open && rotas.length === 1 && selectedRotasIds.length === 0) {
      setSelectedRotasIds([rotas[0].id]);
    }
  }, [open, rotas, selectedRotasIds.length]);

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (selectedRotasIds.length === 0) {
      newErrors.rotas = rotas.length === 0 ? "Nenhuma rota disponível" : "Selecione ao menos uma rota";
    }

    if (!dataInicio) {
      newErrors.dataInicio = "Informe a data da ausência";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataFimFinal = dataFim || dataInicio;

    setLoading(true);
    try {
      await responsavelApi.registrarAusencia(
        passageiroId,
        {
          rotas_ids: selectedRotasIds,
          data_inicio: dataInicio,
          data_fim: dataFimFinal,
        },
        token
      );

      if (onSuccess) onSuccess();

      if (keepOpen) {
        toast.success("Ausência registrada! Selecione a próxima data.");
        setDataInicio("");
        setDataFim("");
      } else {
        toast.success("Ausência registrada com sucesso!");
        handleClose();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || "Erro ao registrar ausência.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} lockClose={loading}>
      <BaseDialog.Header
        title="Registrar Ausência"
        icon={<CalendarX className="w-5 h-5" />}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <div className="space-y-4 text-left py-1">
          {/* Campo Rotas */}
          <div className="space-y-1.5">
            <Label className="text-[#0a0a0a] font-medium text-xs">
              Rotas <span className="text-[#e7000b]">*</span>
            </Label>
            <RotaMultiSelect
              rotas={rotas}
              selectedIds={selectedRotasIds}
              onChange={(ids) => {
                setSelectedRotasIds(ids);
                if (errors.rotas) setErrors((prev) => ({ ...prev, rotas: "" }));
              }}
              disabled={rotas.length === 0}
              hasError={Boolean(errors.rotas)}
              placeholder={rotas.length === 0 ? "Nenhuma rota disponível" : "Selecione a(s) rota(s)"}
            />
            {errors.rotas && (
              <p className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.rotas}
              </p>
            )}
          </div>

          <PeriodoAusenciaCampos
            dataInicio={dataInicio}
            dataFim={dataFim}
            onDataInicioChange={(data) => {
              setDataInicio(data);
              if (errors.dataInicio) setErrors((prev) => ({ ...prev, dataInicio: "" }));
            }}
            onDataFimChange={(data) => {
              setDataFim(data);
              if (errors.dataFim) setErrors((prev) => ({ ...prev, dataFim: "" }));
            }}
            disabled={rotas.length === 0}
            errors={{
              dataInicio: errors.dataInicio,
              dataFim: errors.dataFim,
            }}
          />

          <div className="flex items-center gap-3 p-3 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5]">
            <Checkbox
              id="keepOpenAusenciaResp"
              checked={keepOpen}
              onCheckedChange={(checked) => setKeepOpen(Boolean(checked))}
              className="h-4 w-4 rounded-[6px] border-[#e5e5e5] text-primary focus:ring-primary"
            />
            <label
              htmlFor="keepOpenAusenciaResp"
              className="flex-1 cursor-pointer font-medium text-[#0a0a0a] m-0 text-xs sm:text-sm select-none"
            >
              Cadastrar outra em seguida
            </label>
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={handleClose}
          disabled={loading}
        />
        <BaseDialog.Action
          label={loading ? "Salvando..." : "Salvar"}
          onClick={handleSubmit}
          isLoading={loading}
          disabled={rotas.length === 0}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
};
