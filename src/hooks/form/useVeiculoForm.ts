import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { aplicarMascaraPlaca, validarPlaca } from "@/utils/domain/veiculo/placaUtils";
import { Veiculo } from "@/types/veiculo";

export const veiculoSchema = z.object({
  placa: z
    .string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório")
    .refine((val) => validarPlaca(val), "Placa inválida"),
  marca: z
    .string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório"),
  modelo: z
    .string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório"),
  ativo: z.boolean().optional(),
});

export type VeiculoFormData = z.infer<typeof veiculoSchema>;

interface UseVeiculoFormProps {
  editingVeiculo?: Partial<Veiculo> | null;
}

export function useVeiculoForm(props?: UseVeiculoFormProps) {
  const editingVeiculo = props?.editingVeiculo;

  const form = useForm<VeiculoFormData>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: {
      placa: editingVeiculo?.placa ? aplicarMascaraPlaca(editingVeiculo.placa) : "",
      marca: editingVeiculo?.marca || "",
      modelo: editingVeiculo?.modelo || "",
      ativo: editingVeiculo?.ativo ?? true,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  return { form };
}
