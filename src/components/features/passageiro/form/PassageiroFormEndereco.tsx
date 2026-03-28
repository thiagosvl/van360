import { CepInput } from "@/components/forms";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, MapPin } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function PassageiroFormEndereco() {
  const form = useFormContext();
  const [isCepLoading, setIsCepLoading] = useState(false);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          Endereço do Passageiro
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <CepInput
                  field={field}
                  label="CEP"
                  className="md:col-span-2"
                  inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  onLoadingChange={setIsCepLoading}
                />
              )}
            />
            <FormField
              control={form.control}
              name="logradouro"
              render={({ field, fieldState }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-gray-700 font-medium ml-1">
                    Logradouro
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Ex: Rua Comendador"
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                  <FormLabel className="text-gray-700 font-medium ml-1">
                    Número
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                  <FormLabel className="text-gray-700 font-medium ml-1">
                    Bairro
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                  <FormLabel className="text-gray-700 font-medium ml-1">
                    Cidade
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                  <FormLabel className="text-gray-700 font-medium ml-1">
                    Estado
                  </FormLabel>
                   <div className="relative">
                      <Input
                        {...field}
                        placeholder="UF"
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                         aria-invalid={!!fieldState.error}
                         disabled={isCepLoading}
                      />
                     </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referencia"
              render={({ field, fieldState }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-gray-700 font-medium ml-1">
                    Ponto de Referência
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Ex: Próximo ao mercado..."
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                        aria-invalid={!!fieldState.error}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          Informações Adicionais
        </div>

        <div>
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Digite observações importantes sobre o passageiro..."
                    className="min-h-[120px] rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
