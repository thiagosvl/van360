import React, { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { CalendarX, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { responsavelApi } from "@/services/api/responsavel.api";
import { ResponsavelRotaItem } from "@/types/responsavel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [rotaId, setRotaId] = useState<string>("");
  const [dataAusencia, setDataAusencia] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (rotas.length === 1) {
        setRotaId(rotas[0].id);
      } else {
        setRotaId("");
      }
      setDataAusencia("");
      setErrors({});
      setLoading(false);
      setIsCalendarOpen(false);
    }
  }, [open, rotas]);

  useEffect(() => {
    if (open && rotas.length === 1 && !rotaId) {
      setRotaId(rotas[0].id);
    }
  }, [open, rotas, rotaId]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (rotas.length > 1 && !rotaId) {
      newErrors.rotaId = "Selecione uma rota";
    } else if (rotas.length === 0 && !rotaId) {
      newErrors.rotaId = "Nenhuma rota disponível";
    }

    if (!dataAusencia) {
      newErrors.dataAusencia = "Informe a data da ausência";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalRotaId = rotaId || (rotas.length === 1 ? rotas[0].id : "");

    setLoading(true);
    try {
      await responsavelApi.registrarAusencia(
        passageiroId,
        {
          data_ausencia: dataAusencia,
          rota_id: finalRotaId || undefined,
        },
        token
      );

      toast.success("Ausência registrada com sucesso!");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || "Erro ao registrar ausência.");
    } finally {
      setLoading(false);
    }
  };

  const selectedDate = dataAusencia ? parseISO(dataAusencia) : undefined;

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} lockClose={loading}>
      <BaseDialog.Header
        title="Registrar Ausência"
        icon={<CalendarX className="w-5 h-5" />}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <form id="form-notificar-ausencia" onSubmit={handleSubmit} className="space-y-4 text-left py-1">
          {/* Campo Rota */}
          <div className="space-y-1">
            <Label className="text-slate-700 font-semibold ml-1">
              Rota <span className="text-red-500">*</span>
            </Label>
            <Select
              value={rotaId}
              onValueChange={(val) => {
                setRotaId(val);
                if (errors.rotaId) setErrors((prev) => ({ ...prev, rotaId: "" }));
              }}
              disabled={rotas.length === 1 || rotas.length === 0}
            >
              <SelectTrigger
                className={cn(
                  "h-12 rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-base text-left font-medium",
                  errors.rotaId && "border-red-500",
                  rotas.length <= 1 && "opacity-80 bg-slate-100 font-medium text-slate-500 cursor-not-allowed"
                )}
              >
                <SelectValue placeholder={rotas.length === 0 ? "Nenhuma rota disponível" : "Selecione a rota"} />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {rotas.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rotaId && (
              <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.rotaId}
              </p>
            )}
          </div>

          {/* Campo Data da Ausência */}
          <div className="space-y-1">
            <Label className="text-slate-700 font-semibold ml-1">
              Data da Ausência <span className="text-red-500">*</span>
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-12 w-full rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-base text-left font-medium px-3.5 flex items-center justify-between shadow-none hover:bg-slate-100 transition-colors cursor-pointer",
                    !dataAusencia && "text-slate-400 font-normal",
                    dataAusencia && "text-slate-700 font-medium",
                    errors.dataAusencia && "border-red-500"
                  )}
                >
                  <span>
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "dd/mm/aaaa"}
                  </span>
                  <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999]">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setDataAusencia(format(date, "yyyy-MM-dd"));
                      if (errors.dataAusencia) setErrors((prev) => ({ ...prev, dataAusencia: "" }));
                      setIsCalendarOpen(false);
                    }
                  }}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {errors.dataAusencia && (
              <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.dataAusencia}
              </p>
            )}
          </div>
        </form>
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
          form="form-notificar-ausencia"
          type="submit"
          isLoading={loading}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
};
