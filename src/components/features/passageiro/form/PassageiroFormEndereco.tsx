import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";

interface PassageiroFormEnderecoProps {
  isExternal?: boolean;
}

export function PassageiroFormEndereco({ isExternal = false }: PassageiroFormEnderecoProps) {
  const form = useFormContext();

  return (
    <div className="space-y-5">
      <div>
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                Observações Adicionais
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite observações importantes sobre o aluno..."
                  className="min-h-[100px] rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] resize-none shadow-none"
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
