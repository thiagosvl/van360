import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Usuario } from "@/types/usuario";
import {
    usePassageiroFormDadosCadastraisViewModel,
} from "@/hooks";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { generos, modalidades, periodos } from "@/utils/formatters";
import { dateMask } from "@/utils/masks";
import { Car, School, Sun, User } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";

interface PassageiroFormDadosCadastraisProps {
  profile: Usuario | null | undefined;
  escolas: Escola[];
  veiculos: Veiculo[];
}

export function PassageiroFormDadosCadastrais({
  profile,
  escolas,
  veiculos,
}: PassageiroFormDadosCadastraisProps) {
  const {
      form,
      veiculosDisplay,
      escolasDisplay,
      handleAddNewVehicle,
      handleAddNewSchool,
  } = usePassageiroFormDadosCadastraisViewModel({ escolas, veiculos });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-2">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm">
          <User className="w-5 h-5" />
        </div>
        Dados do Passageiro
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Linha 1: Nome (50%) + Veículo (50%) */}
          <FormField
            control={form.control}
            name="nome"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-gray-700 font-medium ml-1">
                  Nome <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Digite o nome do passageiro"
                      {...field}
                      className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                      aria-invalid={!!fieldState.error}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="veiculo_id"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
                <FormLabel>
                  Veículo <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value === "add-new-vehicle") {
                      handleAddNewVehicle();
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
                    {veiculosDisplay.map((veiculo) => (
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

          {/* Linha 2: Escola (50%) + Período (50%) */}
          <FormField
            control={form.control}
            name="escola_id"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
                <FormLabel>
                  Escola <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value === "add-new-school") {
                      handleAddNewSchool();
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
                    {escolasDisplay.map((escola) => (
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

          <FormField
            control={form.control}
            name="periodo"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
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

          <FormField
            control={form.control}
            name="modalidade"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-gray-700 font-medium ml-1">
                  Modalidade <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <div className="relative">
                       {/* Icone pode ser um arrow-left-right ou similar */}
                      <SelectTrigger
                        className={cn(
                          "h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                          fieldState.error && "border-red-500"
                        )}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </div>
                  </FormControl>
                  <SelectContent>
                    {modalidades.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="data_nascimento"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-gray-700 font-medium ml-1">
                  Data de Nascimento <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    {...field}
                    onChange={(e) => {
                      field.onChange(dateMask(e.target.value));
                    }}
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <FormField
            control={form.control}
            name="genero"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-gray-700 font-medium ml-1">
                  Gênero <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                      <SelectTrigger
                        className={cn(
                          "h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                          fieldState.error && "border-red-500"
                        )}
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {generos.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-2">
          <FormField
            control={form.control}
            name="ativo"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0">
                <Checkbox
                  id="ativo"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <FormLabel
                  htmlFor="ativo"
                  className="flex-1 cursor-pointer font-medium text-gray-700 m-0 mt-0"
                >
                  Passageiro Ativo
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
