import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { moneyMask } from "@/utils/masks";

export const registrarPagamentoParticipanteSchema = z.object({
  valor: z.string().min(1, "Informe o valor do pagamento"),
  tipo_pagamento: z.enum(["PIX", "dinheiro", "cartao-credito", "cartao-debito", "transferencia", "boleto"]).default("PIX"),
  data_pagamento: z.string().min(1, "Data é obrigatória"),
});

export type RegistrarPagamentoParticipanteFormData = z.infer<typeof registrarPagamentoParticipanteSchema>;

interface UseRegistrarPagamentoParticipanteFormProps {
  saldoRestante?: number;
}

export const useRegistrarPagamentoParticipanteForm = ({
  saldoRestante = 0,
}: UseRegistrarPagamentoParticipanteFormProps = {}) => {
  const form = useForm<RegistrarPagamentoParticipanteFormData>({
    resolver: zodResolver(registrarPagamentoParticipanteSchema),
    defaultValues: {
      valor: saldoRestante > 0 ? moneyMask(saldoRestante) : "",
      tipo_pagamento: "PIX",
      data_pagamento: new Date().toISOString().split("T")[0],
    },
  });

  return form;
};
