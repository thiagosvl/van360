import {
    cepSchema,
    cpfSchema,
    phoneSchema,
} from "@/schemas/common";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { cepMask, cpfMask, moneyMask, phoneMask } from "@/utils/masks";
import { validateEnderecoFields } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const passageiroSchema = z
  .object({
    escola_id: z.string().min(1, "Campo obrigatório"),
    veiculo_id: z.string().min(1, "Campo obrigatório"),
    nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),

    periodo: z.string().min(1, "Campo obrigatório"),

    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: cepSchema.or(z.literal("")).optional(),
    referencia: z.string().optional(),

    observacoes: z.string().optional(),

    nome_responsavel: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
    email_responsavel: z
      .string()
      .min(1, "Campo obrigatório")
      .email("E-mail inválido"),
    cpf_responsavel: cpfSchema,
    telefone_responsavel: phoneSchema,

    valor_cobranca: z.string().min(1, "Campo obrigatório"),
    dia_vencimento: z.string().min(1, "Campo obrigatório"),
    emitir_cobranca_mes_atual: z.boolean().optional(),
    ativo: z.boolean().optional(),
    usuario_id: z.string().optional(),
    enviar_cobranca_automatica: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const validation = validateEnderecoFields(
      data.cep,
      data.logradouro,
      data.numero
    );

    // Adiciona erros para cada campo que falhou na validação
    if (validation.errors.cep) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.cep,
        path: ["cep"],
      });
    }
    if (validation.errors.logradouro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.logradouro,
        path: ["logradouro"],
      });
    }
    if (validation.errors.numero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.numero,
        path: ["numero"],
      });
    }
  });

export type PassageiroFormData = z.infer<typeof passageiroSchema>;

interface UsePassageiroFormProps {
  isOpen: boolean;
  mode?: "create" | "edit" | "finalize";
  editingPassageiro: Passageiro | null;
  prePassageiro?: PrePassageiro | null;
  plano: any;
  podeAtivarCobrancaAutomatica: boolean;
}

export function usePassageiroForm({
  isOpen,
  mode,
  editingPassageiro,
  prePassageiro,
  plano,
  podeAtivarCobrancaAutomatica,
}: UsePassageiroFormProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([
    "passageiro",
    "responsavel",
    "cobranca",
    "endereco",
    "observacoes",
  ]);

  const form = useForm<PassageiroFormData>({
    mode: "onChange",
    resolver: zodResolver(passageiroSchema),
    defaultValues: {
      escola_id: "",
      veiculo_id: "",
      nome: "",
      periodo: "",
      observacoes: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      nome_responsavel: "",
      email_responsavel: "",
      telefone_responsavel: "",
      cpf_responsavel: "",
      valor_cobranca: "",
      dia_vencimento: "",
      emitir_cobranca_mes_atual: false,
      ativo: true,
      enviar_cobranca_automatica:
        canUseCobrancaAutomatica(plano) && podeAtivarCobrancaAutomatica,
    },
  });

  const carregarDados = useCallback(async () => {
    try {
      setRefreshing(true);

      const isFinalizeMode = mode === "finalize" && prePassageiro;

      if (editingPassageiro && mode === "edit") {
        // Aguardar um pouco para os dados serem carregados pelos hooks (lists)
        // Isso mantem o comportamento original
        await new Promise((r) => setTimeout(r, 200));
        await new Promise((r) => requestAnimationFrame(r));

        flushSync(() => {
          form.reset({
            nome: editingPassageiro.nome,
            periodo: editingPassageiro.periodo,
            nome_responsavel: editingPassageiro.nome_responsavel,
            email_responsavel: editingPassageiro.email_responsavel,
            cpf_responsavel: cpfMask(editingPassageiro.cpf_responsavel),
            telefone_responsavel: phoneMask(
              editingPassageiro.telefone_responsavel
            ),
            valor_cobranca: editingPassageiro.valor_cobranca
              ? moneyMask(
                  String(
                    Math.round(Number(editingPassageiro.valor_cobranca) * 100)
                  )
                )
              : "",
            dia_vencimento: editingPassageiro.dia_vencimento?.toString() || "",
            observacoes: editingPassageiro.observacoes || "",
            logradouro: editingPassageiro.logradouro || "",
            numero: editingPassageiro.numero || "",
            bairro: editingPassageiro.bairro || "",
            cidade: editingPassageiro.cidade || "",
            estado: editingPassageiro.estado || "",
            cep: editingPassageiro.cep ? cepMask(editingPassageiro.cep) : "",
            referencia: editingPassageiro.referencia || "",
            escola_id: editingPassageiro.escola_id || "",
            veiculo_id: editingPassageiro.veiculo_id || "",
            emitir_cobranca_mes_atual: false,
            ativo: editingPassageiro.ativo,
            enviar_cobranca_automatica:
              editingPassageiro.enviar_cobranca_automatica || false,
          });
        });

        setOpenAccordionItems([
          "passageiro",
          "responsavel",
          "cobranca",
          "endereco",
          "observacoes",
        ]);
      } else if (isFinalizeMode && prePassageiro) {
        form.reset({
          nome: prePassageiro.nome,
          nome_responsavel: prePassageiro.nome_responsavel,
          email_responsavel: prePassageiro.email_responsavel,
          cpf_responsavel: cpfMask(prePassageiro.cpf_responsavel),
          telefone_responsavel: phoneMask(prePassageiro.telefone_responsavel),
          periodo: prePassageiro.periodo || "",
          logradouro: prePassageiro.logradouro || "",
          numero: prePassageiro.numero || "",
          bairro: prePassageiro.bairro || "",
          cidade: prePassageiro.cidade || "",
          estado: prePassageiro.estado || "",
          cep: prePassageiro.cep || "",
          referencia: prePassageiro.referencia || "",
          observacoes: prePassageiro.observacoes || "",
          veiculo_id: prePassageiro.veiculo_id || "",
          escola_id: prePassageiro.escola_id || "",
          valor_cobranca: prePassageiro.valor_cobranca
            ? moneyMask(
                String(Math.round(Number(prePassageiro.valor_cobranca) * 100))
              )
            : "",
          dia_vencimento: prePassageiro.dia_vencimento?.toString() || "",
          emitir_cobranca_mes_atual: false,
          ativo: true,
          enviar_cobranca_automatica:
            canUseCobrancaAutomatica(plano) && podeAtivarCobrancaAutomatica,
        });

        form.trigger([
          "escola_id",
          "veiculo_id",
          "periodo",
          "valor_cobranca",
          "dia_vencimento",
          "nome",
          "nome_responsavel",
          "email_responsavel",
          "cpf_responsavel",
          "telefone_responsavel",
        ]);

        setOpenAccordionItems([
          "passageiro",
          "responsavel",
          "cobranca",
          "endereco",
          "observacoes",
        ]);
      } else {
        form.reset({
          escola_id: "",
          veiculo_id: "",
          nome: "",
          periodo: "",
          observacoes: "",
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          referencia: "",
          nome_responsavel: "",
          email_responsavel: "",
          telefone_responsavel: "",
          cpf_responsavel: "",
          valor_cobranca: "",
          dia_vencimento: "",
          emitir_cobranca_mes_atual: false,
          ativo: true,
          enviar_cobranca_automatica:
            canUseCobrancaAutomatica(plano) && podeAtivarCobrancaAutomatica,
        });
        
        // Reset accordion default on create (All open by default as requested)
        setOpenAccordionItems([
          "passageiro",
          "responsavel",
          "cobranca",
          "endereco",
          "observacoes",
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, [
    editingPassageiro,
    mode,
    prePassageiro,
    form,
    plano,
    podeAtivarCobrancaAutomatica,
  ]);
  
  // Load data when dialog opens
  useEffect(() => {
    if (isOpen) {
        carregarDados();
    }
  }, [isOpen, carregarDados]);

  return {
    form,
    refreshing,
    openAccordionItems,
    setOpenAccordionItems,
  };
}
