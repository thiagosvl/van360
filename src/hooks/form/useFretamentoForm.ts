import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FretamentoDetalhes } from "@/services/api/fretamento.api";
import { moneyMask } from "@/utils/masks";

export const fretamentoFormSchema = z.object({
  titulo: z.string().min(2, "Título é obrigatório").max(255),
  origem: z.string().max(255).optional().nullable(),
  destino: z.string().min(2, "Destino é obrigatório").max(255),
  data_inicio: z.string().min(1, "Data da viagem é obrigatória"),
  veiculo_id: z.string().uuid("Selecione um veículo").optional().nullable(),
  valor_total: z.string().min(1, "Valor é obrigatório"),
  observacoes: z.string().optional().nullable(),
  tem_sinal: z.boolean().default(false),
  valor_sinal: z.string().optional().nullable(),
  tipo_pagamento_sinal: z.enum(["PIX", "dinheiro", "cartao-credito", "cartao-debito", "transferencia", "boleto"]).default("PIX"),
  data_pagamento_sinal: z.string().optional(),
});

export type FretamentoFormData = z.infer<typeof fretamentoFormSchema>;

interface UseFretamentoFormProps {
  editingItem?: FretamentoDetalhes | null;
}

export const useFretamentoForm = ({ editingItem }: UseFretamentoFormProps = {}) => {
  const form = useForm<FretamentoFormData>({
    resolver: zodResolver(fretamentoFormSchema),
    defaultValues: {
      titulo: editingItem?.titulo || "",
      origem: editingItem?.origem || "",
      destino: editingItem?.destino || "",
      data_inicio: editingItem?.data_inicio ? editingItem.data_inicio.split("T")[0] : "",
      veiculo_id: editingItem?.veiculos?.[0]?.veiculo_id || null,
      valor_total: editingItem?.valor_total ? moneyMask(Number(editingItem.valor_total)) : "",
      observacoes: editingItem?.observacoes || "",
      tem_sinal: false,
      valor_sinal: "",
      tipo_pagamento_sinal: "PIX",
      data_pagamento_sinal: new Date().toISOString().split("T")[0],
    },
  });

  return form;
};
