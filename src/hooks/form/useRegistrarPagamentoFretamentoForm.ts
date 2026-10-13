import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { moneyMask } from "@/utils/masks";

export const registrarPagamentoFretamentoSchema = z.object({
  valor: z.string().min(1, "Valor é obrigatório"),
  tipo_pagamento: z.enum(["PIX", "dinheiro", "cartao-credito", "cartao-debito", "transferencia", "boleto"]).default("PIX"),
  data_pagamento: z.string().min(1, "Data é obrigatória"),
  descricao: z.string().max(255).optional().nullable(),
});

export type RegistrarPagamentoFretamentoFormData = z.infer<typeof registrarPagamentoFretamentoSchema>;

interface UseRegistrarPagamentoFretamentoFormProps {
  saldoRestante?: number;
}

export const useRegistrarPagamentoFretamentoForm = ({
  saldoRestante = 0,
}: UseRegistrarPagamentoFretamentoFormProps = {}) => {
  const form = useForm<RegistrarPagamentoFretamentoFormData>({
    resolver: zodResolver(registrarPagamentoFretamentoSchema),
    defaultValues: {
      valor: saldoRestante > 0 ? moneyMask(saldoRestante) : "",
      tipo_pagamento: "PIX",
      data_pagamento: new Date().toISOString().split("T")[0],
      descricao: "",
    },
  });

  return form;
};
