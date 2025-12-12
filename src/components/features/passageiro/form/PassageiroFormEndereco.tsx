import { CepInput } from "@/components/forms";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, MapPin } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function PassageiroFormEndereco() {
  const form = useFormContext();

  return (
    <>
      <AccordionItem
        value="endereco"
        className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4"
      >
        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
          <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin className="w-5 h-5" />
            </div>
            Endereço
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
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
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-gray-700 font-medium ml-1">
                    Bairro
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
              name="cidade"
              render={({ field, fieldState }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-gray-700 font-medium ml-1">
                    Cidade
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem
        value="observacoes"
        className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4"
      >
        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
          <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            Observações
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2">
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
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
