import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NativeSelect } from "@/components/ui/native-select";
import { Sparkles } from "lucide-react";
import { ModoCobrancaEnum } from "@/types/enums";
import { useMotoristaFinanceiroUi } from "@/hooks/ui/useMotoristaFinanceiroUi";

interface PassageiroModoCobrancaFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name?: Path<TFieldValues>;
}

export function PassageiroModoCobrancaField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name = "modo_cobranca" as Path<TFieldValues>,
}: PassageiroModoCobrancaFieldProps<TFieldValues>) {
  const { cobrancaAtiva } = useMotoristaFinanceiroUi();

  if (!cobrancaAtiva) {
    return null;
  }

  return (
    <div className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-3.5 space-y-3">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-semibold text-[#0a0a0a] uppercase tracking-wider">
          Cobrança Automática Pix
        </span>
      </div>

      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
              Modelo de Cobrança deste Aluno
            </FormLabel>
            <FormControl>
              <NativeSelect
                value={field.value || ""}
                onChange={field.onChange}
              >
                <option value="">Padrão da Van (conforme configurado)</option>
                <option value={ModoCobrancaEnum.AUTOMATICA}>Cobrança & Baixa Automática Pix</option>
                <option value={ModoCobrancaEnum.LEMBRETES}>Apenas lembretes manuais no WhatsApp</option>
                <option value={ModoCobrancaEnum.DESATIVADO}>Desativado para este aluno</option>
              </NativeSelect>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
