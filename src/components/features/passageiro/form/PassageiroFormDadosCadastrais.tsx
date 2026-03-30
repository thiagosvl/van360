import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { AlertTriangle, Car, School, Sun, User } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";

interface PassageiroFormDadosCadastraisProps {
  profile: Usuario | null | undefined;
  escolas: Escola[];
  veiculos: Veiculo[];
  hideVeiculo?: boolean;
  hideAtivo?: boolean;
  isExternal?: boolean;
}

export function PassageiroFormDadosCadastrais({
  escolas,
  veiculos,
  hideVeiculo = false,
  hideAtivo = false,
  isExternal = false,
}: PassageiroFormDadosCadastraisProps) {
  const {
    veiculosDisplay,
    escolasDisplay,
    handleAddNewVehicle,
    handleAddNewSchool,
  } = usePassageiroFormDadosCadastraisViewModel({ escolas, veiculos, isExternal });

  const form = useFormContext();

  return (
    <div className="space-y-12">
      {/* Seção 1: Dados Pessoais */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          Passageiro
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field, fieldState }) => (
              <FormItem className={cn("col-span-1", hideVeiculo && "md:col-span-2")}>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Nome Completo <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                    <Input
                      placeholder="Digite o nome completo"
                      {...field}
                      className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                      aria-invalid={!!fieldState.error}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!hideVeiculo && (
            <FormField
              control={form.control}
              name="veiculo_id"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-1">
                  <FormLabel className="text-slate-700 font-semibold ml-1">
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
                        <Car className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                        <SelectTrigger
                          className={cn(
                            "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
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
                        className="font-semibold text-[#1a3a5c] cursor-pointer"
                      >
                        + Cadastrar Veículo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="data_nascimento"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-slate-700 font-semibold ml-1">
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
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Gênero <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        "h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
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
      </section>

      {/* Seção 2: Escola e Período */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
            <School className="w-5 h-5" />
          </div>
          Escola e Veículo
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="escola_id"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Escola <span className={cn("text-red-600", isExternal && "hidden")}>*</span>
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
                      <School className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
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
                    {!isExternal ? (
                      <SelectItem
                        value="add-new-school"
                        className="font-semibold text-[#1a3a5c] cursor-pointer"
                      >
                        + Cadastrar Escola
                      </SelectItem>
                    ) : (
                      <SelectItem
                        value="none"
                        className="text-[#1a3a5c] font-semibold border-t border-slate-100 mt-1"
                      >
                        Nenhuma das opções acima
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {isExternal && field.value === "none" && (
                  <Alert className="mt-4 bg-amber-50 border-amber-100 text-amber-900 animate-in fade-in slide-in-from-top-1 duration-300">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-xs text-amber-700 leading-relaxed font-medium">
                      Escola não listada? Continue o cadastro. O
                      condutor será avisado para ajustar
                      depois.
                    </AlertDescription>
                  </Alert>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periodo"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Período <span className={cn("text-red-600", isExternal && "hidden")}>*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <div className="relative">
                      <Sun className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <SelectTrigger
                        className={cn(
                          "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
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
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Modalidade <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <div className="relative">
                      <SelectTrigger
                        className={cn(
                          "h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
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
        </div>

        {!hideAtivo && (
          <div className="mt-2">
            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-0">
                  <Checkbox
                    id="ativo"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <FormLabel
                    htmlFor="ativo"
                    className="flex-1 cursor-pointer font-medium text-slate-700 m-0 mt-0"
                  >
                    Passageiro Ativo
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        )}
      </section>
    </div>
  );
}
