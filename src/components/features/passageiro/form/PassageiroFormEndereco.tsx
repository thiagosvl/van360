import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FileText, MapPin } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormEnderecoFields, StitchField } from "@/components/forms";

interface PassageiroFormEnderecoProps {
  isExternal?: boolean;
}

export function PassageiroFormEndereco({ isExternal = false }: PassageiroFormEnderecoProps) {
  const form = useFormContext();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c] mb-5">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        Endereço
      </div>

      <FormEnderecoFields required={isExternal} isExternal={isExternal} />

      <div className="pt-2">
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field, fieldState }) => (
            <FormItem>
              {isExternal ? (
                <FormControl>
                  <StitchField icon={FileText} label="Observações Adicionais" error={!!fieldState.error}>
                    <Textarea
                      placeholder="Digite observações importantes sobre o passageiro..."
                      className="min-h-[70px] p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none resize-none placeholder:text-slate-400 placeholder:font-normal w-full"
                      {...field}
                      value={field.value || ""}
                    />
                  </StitchField>
                </FormControl>
              ) : (
                <>
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
                </>
              )}
              <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
