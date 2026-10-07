import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FretamentoDetalhes } from "@/services/api/fretamento.api";
import { moneyMask } from "@/utils/masks";
import { TipoChavePix } from "@/types/pix";

export const passeioFormSchema = z.object({
  titulo: z.string().min(2, "Título é obrigatório").max(255),
  destino: z.string().min(2, "Local/Destino é obrigatório").max(255),
  origem: z.string().max(255).optional().nullable(),
  data_inicio: z.string().min(1, "Data e horário são obrigatórios"),
  data_fim: z.string().optional().nullable(),
  valor_por_pessoa: z.string().min(1, "Valor por pessoa é obrigatório"),
  vagas_totais: z.coerce.number().int().min(1, "Informe a quantidade de vagas disponíveis").optional().nullable(),
  exibir_pix: z.boolean().default(false),
  tipo_chave_pix: z.nativeEnum(TipoChavePix).optional().nullable(),
  chave_pix: z.string().max(255).optional().nullable(),
  observacoes: z.string().optional().nullable(),
  veiculos_ids: z.array(z.string().uuid()).default([]),
});

export type PasseioFormData = z.infer<typeof passeioFormSchema>;

interface UsePasseioFormProps {
  editingItem?: FretamentoDetalhes | null;
  defaultPixKey?: string | null;
  defaultPixType?: TipoChavePix | null;
}

export const usePasseioForm = ({ editingItem, defaultPixKey, defaultPixType }: UsePasseioFormProps = {}) => {
  const form = useForm<PasseioFormData>({
    resolver: zodResolver(passeioFormSchema),
    defaultValues: {
      titulo: editingItem?.titulo || "",
      destino: editingItem?.destino || "",
      origem: editingItem?.origem || "",
      data_inicio: editingItem?.data_inicio ? editingItem.data_inicio.slice(0, 16) : "",
      data_fim: editingItem?.data_fim ? editingItem.data_fim.slice(0, 16) : "",
      valor_por_pessoa: editingItem?.valor_por_pessoa ? moneyMask(Number(editingItem.valor_por_pessoa)) : "",
      vagas_totais: editingItem?.vagas_totais || null,
      exibir_pix: Boolean(editingItem?.chave_pix || defaultPixKey),
      tipo_chave_pix: defaultPixType || null,
      chave_pix: editingItem?.chave_pix || defaultPixKey || "",
      observacoes: editingItem?.observacoes || "",
      veiculos_ids: editingItem?.veiculos?.map((v) => v.veiculo_id) || [],
    },
  });

  return form;
};
