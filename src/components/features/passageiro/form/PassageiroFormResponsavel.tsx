import { PhoneInput } from "@/components/forms";
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
import { cpfMask } from "@/utils/masks";
import { Contact, Hash, Mail, User } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function PassageiroFormResponsavel() {
  const form = useFormContext();

  return (
    <AccordionItem
      value="responsavel"
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4"
    >
      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
        <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Contact className="w-5 h-5" />
          </div>
          Responsável
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cpf_responsavel"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium ml-1">
                  CPF <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      {...field}
                      placeholder="000.000.000-00"
                      onChange={(e) => {
                        field.onChange(cpfMask(e.target.value));
                      }}
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
            name="nome_responsavel"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium ml-1">
                  Nome do Responsável <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
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
            name="email_responsavel"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium ml-1">
                  E-mail <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="exemplo@email.com"
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
            name="telefone_responsavel"
            render={({ field }) => (
              <PhoneInput
                field={field}
                label="WhatsApp"
                required
                inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              />
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
