import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function PassageiroFormDadosCadastrais() {
  const form = useFormContext();

  return (
    <AccordionItem
      value="passageiro"
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
    >
      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <User className="w-5 h-5" />
          </div>
          Passageiro
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium ml-1">
                  Nome <span className="text-red-600">*</span>
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
      </AccordionContent>
    </AccordionItem>
  );
}
