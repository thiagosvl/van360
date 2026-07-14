import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormEnderecoFields } from "@/components/forms";

interface PassageiroFormEnderecoProps {
  isExternal?: boolean;
}

export function PassageiroFormEndereco({ isExternal = false }: PassageiroFormEnderecoProps) {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        Endereço
      </div>

      <FormEnderecoFields required={isExternal} />

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
