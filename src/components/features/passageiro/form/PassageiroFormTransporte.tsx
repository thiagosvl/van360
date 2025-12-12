import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { useEscolasWithFilters, useVeiculosWithFilters } from "@/hooks";
import { cn } from "@/lib/utils";
import { Usuario } from "@/types/usuario";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { periodos } from "@/utils/formatters";
import { Car, School, Sun } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface PassageiroFormTransporteProps {
  profile: Usuario | null | undefined;
}

export function PassageiroFormTransporte({ profile }: PassageiroFormTransporteProps) {
  const form = useFormContext();
  const { openEscolaFormDialog, openVeiculoFormDialog } = useLayout();

  const escolaId = form.watch("escola_id");
  const veiculoId = form.watch("veiculo_id");

  const { data: escolas = [] } = useEscolasWithFilters(
    profile?.id,
    { ativo: "true", includeId: escolaId || undefined },
    { enabled: !!profile?.id }
  ) as { data: import("@/types/escola").Escola[] };

  const { data: veiculos = [] } = useVeiculosWithFilters(
    profile?.id,
    { ativo: "true", includeId: veiculoId || undefined },
    { enabled: !!profile?.id }
  ) as { data: import("@/types/veiculo").Veiculo[] };

  return (
    <AccordionItem
      value="transporte"
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4"
    >
      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Car className="w-5 h-5" />
          </div>
          Transporte
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="veiculo_id"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  Veículo <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value === "add-new-vehicle") {
                      openVeiculoFormDialog({
                        onSuccess: (veiculo) => {
                          form.setValue("veiculo_id", veiculo.id);
                        },
                      });
                      return;
                    }
                    field.onChange(value);
                  }}
                >
                  <FormControl>
                    <div className="relative">
                      <Car className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                          fieldState.error && "border-red-500"
                        )}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                    </div>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {veiculos.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {formatarPlacaExibicao(veiculo.placa)}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="add-new-vehicle"
                      className="font-semibold text-primary cursor-pointer"
                    >
                      + Cadastrar Veículo
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="escola_id"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  Escola <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value === "add-new-school") {
                      openEscolaFormDialog({
                        onSuccess: (escola) => {
                          form.setValue("escola_id", escola.id);
                        },
                      });
                      return;
                    }
                    field.onChange(value);
                  }}
                >
                  <FormControl>
                    <div className="relative">
                      <School className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                          fieldState.error && "border-red-500"
                        )}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Selecione a escola" />
                      </SelectTrigger>
                    </div>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="add-new-school"
                      className="font-semibold text-primary cursor-pointer"
                    >
                      + Cadastrar Escola
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="periodo"
            render={({ field, fieldState }) => (
              <FormItem className="md:col-span-1">
                <FormLabel className="text-gray-700 font-medium ml-1">
                  Período <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <div className="relative">
                      <Sun className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                          fieldState.error && "border-red-500"
                        )}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                    </div>
                  </FormControl>
                  <SelectContent>
                    {periodos.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
