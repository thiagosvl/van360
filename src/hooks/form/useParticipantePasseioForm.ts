import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { moneyMask } from "@/utils/masks";

export const participantePasseioSchema = z.object({
  passageiro_id: z.string().uuid().optional().nullable(),
  nome: z.string().min(2, "Nome é obrigatório").max(255),
  is_proprio_responsavel: z.boolean().default(false),
  responsavel_nome: z.string().max(255).optional().nullable(),
  telefone: z.string().max(50).optional().nullable(),
  endereco: z.string().optional().nullable(),
  valor: z.string().min(1, "Valor é obrigatório"),
  observacoes: z.string().optional().nullable(),
});

export type ParticipantePasseioFormData = z.infer<typeof participantePasseioSchema>;

interface UseParticipantePasseioFormProps {
  valorPadrao?: number;
}

export const useParticipantePasseioForm = ({ valorPadrao = 0 }: UseParticipantePasseioFormProps = {}) => {
  const form = useForm<ParticipantePasseioFormData>({
    resolver: zodResolver(participantePasseioSchema),
    defaultValues: {
      passageiro_id: null,
      nome: "",
      is_proprio_responsavel: false,
      responsavel_nome: "",
      telefone: "",
      endereco: "",
      valor: valorPadrao ? moneyMask(valorPadrao) : "",
      observacoes: "",
    },
  });

  return form;
};
