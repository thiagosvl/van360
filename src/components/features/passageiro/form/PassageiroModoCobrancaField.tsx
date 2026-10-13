import { Control, FieldValues, Path } from "react-hook-form";

interface PassageiroModoCobrancaFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control?: Control<TFieldValues>;
  name?: Path<TFieldValues>;
}

export function PassageiroModoCobrancaField<TFieldValues extends FieldValues = FieldValues>(
  _props: PassageiroModoCobrancaFieldProps<TFieldValues>
) {
  return null;
}
