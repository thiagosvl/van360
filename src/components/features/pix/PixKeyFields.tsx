import React from "react";
import { UseFormReturn, Path, PathValue } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { TipoChavePix, TIPOS_CHAVE_PIX_LABEL } from "@/types/pix";
import { aplicarMascaraPix } from "@/utils/formatters/pix";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";

export interface PixFormValues {
  tipo_chave_pix?: TipoChavePix | null;
  chave_pix?: string | null;
}

interface PixKeyFieldsProps<T extends PixFormValues> {
  form: UseFormReturn<T>;
  isBusy?: boolean;
  originalTipoRef?: React.MutableRefObject<TipoChavePix | null>;
  originalChaveRef?: React.MutableRefObject<string>;
  gridClassName?: string;
}

export function PixKeyFields<T extends PixFormValues>({
  form,
  isBusy = false,
  originalTipoRef,
  originalChaveRef,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 gap-4",
}: PixKeyFieldsProps<T>) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  return (
    <div className={gridClassName}>
      <FormField
        control={form.control}
        name={"tipo_chave_pix" as Path<T>}
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-[#0a0a0a]">Tipo de Chave</FormLabel>
            <FormControl>
              <NativeSelect
                value={(field.value as string) || ""}
                disabled={isBusy}
                className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a]"
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    field.onChange(undefined);
                    form.setValue("chave_pix" as Path<T>, "" as PathValue<T, Path<T>>);
                    return;
                  }

                  const selecionado = val as TipoChavePix;
                  field.onChange(selecionado);

                  if (originalTipoRef && selecionado === originalTipoRef.current) {
                    const chaveOriginal = originalChaveRef?.current || "";
                    form.setValue(
                      "chave_pix" as Path<T>,
                      aplicarMascaraPix(chaveOriginal, selecionado) as PathValue<T, Path<T>>
                    );
                  } else {
                    let preenchimento = "";
                    if (profile) {
                      const cpfLimpo = profile.cpfcnpj ? profile.cpfcnpj.replace(/\D/g, "") : "";
                      if (selecionado === TipoChavePix.CPF && cpfLimpo.length === 11) {
                        preenchimento = aplicarMascaraPix(profile.cpfcnpj, TipoChavePix.CPF);
                      } else if (selecionado === TipoChavePix.CNPJ && cpfLimpo.length === 14) {
                        preenchimento = aplicarMascaraPix(profile.cpfcnpj, TipoChavePix.CNPJ);
                      } else if (selecionado === TipoChavePix.TELEFONE && profile.telefone) {
                        preenchimento = aplicarMascaraPix(profile.telefone, TipoChavePix.TELEFONE);
                      } else if (selecionado === TipoChavePix.EMAIL && (profile.email || user?.email)) {
                        preenchimento = profile.email || user?.email || "";
                      }
                    }
                    form.setValue(
                      "chave_pix" as Path<T>,
                      preenchimento as PathValue<T, Path<T>>
                    );
                  }
                }}
              >
                <option value="" disabled>
                  Selecionar...
                </option>
                {Object.values(TipoChavePix).map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {TIPOS_CHAVE_PIX_LABEL[tipo]}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"chave_pix" as Path<T>}
        render={({ field }) => {
          const tipo = form.watch("tipo_chave_pix" as Path<T>) as TipoChavePix | undefined;
          return (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-[#0a0a0a]">Chave Pix</FormLabel>
              <FormControl>
                <Input
                  placeholder={tipo ? "Digite a chave Pix" : "Selecione o tipo de chave primeiro"}
                  disabled={!tipo || isBusy}
                  type={tipo === TipoChavePix.TELEFONE ? "tel" : "text"}
                  inputMode={
                    tipo === TipoChavePix.CPF ||
                    tipo === TipoChavePix.CNPJ ||
                    tipo === TipoChavePix.TELEFONE
                      ? "numeric"
                      : "text"
                  }
                  value={(field.value as string) || ""}
                  onChange={(e) => {
                    const maskedVal = aplicarMascaraPix(e.target.value, tipo);
                    field.onChange(maskedVal);
                  }}
                  className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
