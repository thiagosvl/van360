import { MoneyInput } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { useCreateGasto, useUpdateGasto, useVeiculos } from "@/hooks";
import { cn } from "@/lib/utils";
import { CATEGORIAS_GASTOS, Gasto } from "@/types/gasto";
import { formatarPlacaExibicao } from "@/utils/domain";
import { moneyMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bus,
  CalendarIcon,
  Receipt,
  Tag,
  TrendingDown,
  Wand2,
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
  onClose: () => void;
  gastoToEdit?: Gasto | null;
  veiculos: { id: string; placa: string }[];
  usuarioId?: string;
  onSuccess?: () => void;
}

export default function GastoFormDialog({
  isOpen,
  onClose,
  gastoToEdit,
  veiculos: veiculosProp,
  usuarioId,
  onSuccess,
}: GastoFormDialogProps) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const createGasto = useCreateGasto();
  const updateGasto = useUpdateGasto();

  const { data: veiculosData } = useVeiculos({ usuarioId }, {
    enabled: isOpen && veiculosProp.length === 0 && !!usuarioId
  });

  const veiculos = veiculosProp.length > 0 ? veiculosProp : (veiculosData?.list || []);

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
        form.reset({
          valor: "",
          data: undefined,
          categoria: "",
          descricao: "",
          veiculo_id: "none",
        });
      }
    }
  }, [isOpen, gastoToEdit, form]);

  const handleSubmit = async (data: GastoFormData) => {
    if (!usuarioId) return;

    const successCallback = () => {
      onClose();
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

  const handleFillMock = () => {
    let veiculoId = "none";
    if (veiculos.length > 0) {
      veiculoId = veiculos[Math.floor(Math.random() * veiculos.length)].id;
    }
    const mockData = mockGenerator.gasto({ veiculo_id: veiculoId });
    form.reset({
      valor: mockData.valor,
      data: mockData.data,
      categoria: mockData.categoria,
      descricao: mockData.descricao,
      veiculo_id: mockData.veiculo_id,
    });
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} lockClose={isActionLoading}>
      <BaseDialog.Header
        title={gastoToEdit ? "Editar Gasto" : "Registrar Gasto"}
        icon={<TrendingDown className="w-5 h-5" />}
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
        <Form {...form}>
          <form
            id="gasto-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="categoria"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium ml-1">
                    Categoria <span className="text-red-600">*</span>
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
                        Não especificar
                      </SelectItem>
                      {veiculos.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {formatarPlacaExibicao(v.placa)}
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
                      Data <span className="text-red-600">*</span>
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
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={onClose}
          disabled={isActionLoading}
        />
        <BaseDialog.Action
          label="Salvar"
          type="submit"
          onClick={form.handleSubmit(handleSubmit)}
          isLoading={isActionLoading}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
