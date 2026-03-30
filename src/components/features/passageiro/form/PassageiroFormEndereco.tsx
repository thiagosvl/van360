import { CepInput } from "@/components/forms";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function PassageiroFormEndereco() {
  const form = useFormContext();
  const [isCepLoading, setIsCepLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        Endereço
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <FormField
          control={form.control}
          name="cep"
          render={({ field }) => (
            <CepInput
              field={field}
              required
              label="CEP"
              className="md:col-span-2"
              labelClassName="text-slate-700 font-semibold ml-1"
              inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
              onLoadingChange={setIsCepLoading}
            />
          )}
        />
        <FormField
          control={form.control}
          name="logradouro"
          render={({ field, fieldState }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Logradouro <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="Ex: Rua Comendador"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                    aria-invalid={!!fieldState.error}
                    disabled={isCepLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero"
          render={({ field, fieldState }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Número <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
          name="bairro"
          render={({ field, fieldState }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Bairro <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                    aria-invalid={!!fieldState.error}
                    disabled={isCepLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cidade"
          render={({ field, fieldState }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Cidade <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                    aria-invalid={!!fieldState.error}
                    disabled={isCepLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estado"
          render={({ field, fieldState }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Estado <span className="text-red-600">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      "h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                      fieldState.error && "border-red-500",
                    )}
                    aria-invalid={!!fieldState.error}
                    disabled={isCepLoading}
                  >
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-62 overflow-y-auto rounded-2xl shadow-xl border-slate-200">
                  <SelectItem value="AC">Acre</SelectItem>
                  <SelectItem value="AL">Alagoas</SelectItem>
                  <SelectItem value="AP">Amapá</SelectItem>
                  <SelectItem value="AM">Amazonas</SelectItem>
                  <SelectItem value="BA">Bahia</SelectItem>
                  <SelectItem value="CE">Ceará</SelectItem>
                  <SelectItem value="DF">Distrito Federal</SelectItem>
                  <SelectItem value="ES">Espírito Santo</SelectItem>
                  <SelectItem value="GO">Goiás</SelectItem>
                  <SelectItem value="MA">Maranhão</SelectItem>
                  <SelectItem value="MT">Mato Grosso</SelectItem>
                  <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="PA">Pará</SelectItem>
                  <SelectItem value="PB">Paraíba</SelectItem>
                  <SelectItem value="PR">Paraná</SelectItem>
                  <SelectItem value="PE">Pernambuco</SelectItem>
                  <SelectItem value="PI">Piauí</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  <SelectItem value="RO">Rondônia</SelectItem>
                  <SelectItem value="RR">Roraima</SelectItem>
                  <SelectItem value="SC">Santa Catarina</SelectItem>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="SE">Sergipe</SelectItem>
                  <SelectItem value="TO">Tocantins</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referencia"
          render={({ field, fieldState }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Ponto de Referência
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="Ex: Próximo ao mercado..."
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                    aria-invalid={!!fieldState.error}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="pt-4 border-t border-slate-100">
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Observações Adicionais
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite observações importantes sobre o passageiro..."
                  className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 resize-none text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
