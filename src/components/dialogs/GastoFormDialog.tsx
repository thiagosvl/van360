import { MoneyInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateGasto, useUpdateGasto } from "@/hooks";
import { cn } from "@/lib/utils";
import { CATEGORIAS_GASTOS, Gasto } from "@/types/gasto";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { moneyMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Bus,
    CalendarIcon,
    Tag,
    TrendingDown,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const gastoSchema = z.object({
  valor: z.string().min(1, "O valor é obrigatório."),
  data: z.date({ required_error: "A data é obrigatória." }),
  categoria: z.string().min(1, "A categoria é obrigatória."),
  descricao: z.string().optional(),
  veiculo_id: z.string().optional(),
});

type GastoFormData = z.infer<typeof gastoSchema>;

interface GastoFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  gastoToEdit?: Gasto | null;
  veiculos: { id: string; placa: string }[];
  usuarioId?: string;
  onSuccess?: () => void;
}

export default function GastoFormDialog({
  isOpen,
  onOpenChange,
  gastoToEdit,
  veiculos,
  usuarioId,
  onSuccess,
}: GastoFormDialogProps) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const createGasto = useCreateGasto();
  const updateGasto = useUpdateGasto();

  const isActionLoading = createGasto.isPending || updateGasto.isPending;

  const form = useForm<GastoFormData>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      valor: "",
      categoria: "",
      descricao: "",
      veiculo_id: "none",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (gastoToEdit) {
        const valorEmCentavos = Math.round(Number(gastoToEdit.valor) * 100);
        form.reset({
          valor: moneyMask(String(valorEmCentavos)),
          data: new Date(new Date(gastoToEdit.data).valueOf() + 1000 * 3600 * 24),
          categoria: gastoToEdit.categoria,
          descricao: gastoToEdit.descricao || "",
          veiculo_id: gastoToEdit.veiculo_id || "none",
        });
      } else {
        // Smart UX: Se tiver apenas 1 veículo, seleciona ele por padrão.
        // Se tiver 0 ou > 1, seleciona "none" (Geral).
        // const defaultVeiculo = veiculos.length === 1 ? veiculos[0].id : "none";
        
        form.reset({
          valor: "",
          data: undefined,
          categoria: "",
          descricao: "",
          veiculo_id: "none",
        });
      }
    }
  }, [isOpen, gastoToEdit, form, veiculos]);

  const handleSubmit = async (data: GastoFormData) => {
    if (!usuarioId) return;

    const successCallback = () => {
      safeCloseDialog(() => onOpenChange(false));
      if (onSuccess) onSuccess();
    };

    const formattedData = {
      ...data,
      veiculo_id: data.veiculo_id === "none" || !data.veiculo_id ? null : data.veiculo_id,
    };

    if (gastoToEdit) {
      updateGasto.mutate(
        { id: gastoToEdit.id, data: formattedData },
        { onSuccess: successCallback }
      );
    } else {
      createGasto.mutate(
        { usuarioId, data: formattedData },
        { onSuccess: successCallback }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-md p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {gastoToEdit ? "Editar Gasto" : "Registrar Gasto"}
          </DialogTitle>
          <DialogDescription className="text-blue-100/80 text-sm mt-1">
             Preencha os dados do gasto.
          </DialogDescription>
        </div>

        <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="categoria"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium ml-1">
                      Categoria <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <div className="relative">
                          <Tag className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                          <SelectTrigger
                            className={cn(
                              "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                              fieldState.error && "border-red-500"
                            )}
                            aria-invalid={!!fieldState.error}
                          >
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {CATEGORIAS_GASTOS.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="veiculo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium ml-1">
                      Veículo
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <div className="relative">
                          <Bus className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                          <SelectTrigger className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all">
                            <SelectValue placeholder="Selecione um veículo" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          Geral / Sem vínculo
                        </SelectItem>
                        {veiculos.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.placa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-gray-700 font-medium ml-1">
                        Data <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover
                        open={openCalendar}
                        onOpenChange={setOpenCalendar}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-left font-normal hover:bg-gray-100 justify-start",
                                  !field.value && "text-muted-foreground",
                                  fieldState.error &&
                                    "border-red-500 ring-red-500"
                                )}
                                aria-invalid={!!fieldState.error}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span className="text-gray-500">
                                    Selecione
                                  </span>
                                )}
                              </Button>
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setOpenCalendar(false);
                              }
                            }}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <MoneyInput
                      field={field}
                      required
                      label="Valor"
                      className="flex flex-col"
                      inputClassName="pl-12 h-12 text-sm rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                    />
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="descricao"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium ml-1">
                      Descrição
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Detalhes do gasto (opcional)"
                        className="min-h-[100px] rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => safeCloseDialog(() => onOpenChange(false))}
            disabled={isActionLoading}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isActionLoading}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
          >
            {isActionLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
