import {
  cepSchema,
  cpfSchema,
  dateSchema,
  phoneSchema,
} from "@/schemas/common";
import { PassageiroFormModes } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { formatDateToBR } from "@/utils/formatters/date";
import { cepMask, cpfMask, moneyMask, moneyToNumber, phoneMask } from "@/utils/masks";
import { isValidCEPFormat, isValidCPF } from "@/utils/validators";
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

    periodo: z.string().optional().nullable().or(z.literal("")),
    modalidade: z.string().optional().nullable().or(z.literal("")),
    data_nascimento: dateSchema(false),
    genero: z.string().optional().nullable().or(z.literal("")),

    logradouro: z.string().optional().nullable().or(z.literal("")),
    numero: z.string().optional().nullable().or(z.literal("")),
    bairro: z.string().optional().nullable().or(z.literal("")),
    cidade: z.string().optional().nullable().or(z.literal("")),
    estado: z.string().optional().nullable().or(z.literal("")),
    cep: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || isValidCEPFormat(val), {
        message: "Formato inválido (00000-000)",
      }),
    referencia: z.string().optional().nullable().or(z.literal("")),

    observacoes: z.string().optional().nullable().or(z.literal("")),

    nome_responsavel: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
    parentesco_responsavel: z.string().optional().nullable().or(z.literal("")),
    email_responsavel: z
      .string()
      .email("E-mail inválido")
      .optional()
      .or(z.literal("")),
    cpf_responsavel: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || isValidCPF(val), {
        message: "CPF inválido",
      }),
    telefone_responsavel: phoneSchema,

    valor_cobranca: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => {
        const num = moneyToNumber(val);
        return num >= 1;
      }, "O valor deve ser no mínimo R$ 1,00"),
    dia_vencimento: z.string().min(1, "Campo obrigatório"),
    data_inicio_transporte: dateSchema(false, true),
    data_fim_transporte: dateSchema(false, true),

    ativo: z.boolean().optional(),
    usuario_id: z.string().optional(),
  });

export type PassageiroFormData = z.infer<typeof passageiroSchema>;

interface UsePassageiroFormProps {
  isOpen: boolean;
  mode?: PassageiroFormModes;
  editingPassageiro: Passageiro | null;
  prePassageiro?: PrePassageiro | null;
}

export function usePassageiroForm({
  isOpen,
  mode,
  editingPassageiro,
  prePassageiro,
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
      modalidade: "",
      data_nascimento: "",
      genero: "",
      observacoes: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      nome_responsavel: "",
      parentesco_responsavel: "",
      email_responsavel: "",
      telefone_responsavel: "",
      cpf_responsavel: "",
      valor_cobranca: "",
      dia_vencimento: "",
      data_inicio_transporte: "",
      data_fim_transporte: "31/12/" + new Date().getFullYear(),

      ativo: true,
    },
  });

  const carregarDados = useCallback(async () => {
    try {
      setRefreshing(true);

      const isFinalizeMode = mode === PassageiroFormModes.FINALIZE && prePassageiro;

      if (editingPassageiro && mode === PassageiroFormModes.EDIT) {
        await new Promise((r) => setTimeout(r, 200));
        await new Promise((r) => requestAnimationFrame(r));

        flushSync(() => {
          form.reset({
            nome: editingPassageiro.nome,
            periodo: editingPassageiro.periodo || "",
            modalidade: editingPassageiro.modalidade || "",
            data_nascimento: editingPassageiro.data_nascimento ? formatDateToBR(editingPassageiro.data_nascimento) : "",
            genero: editingPassageiro.genero || "",
            nome_responsavel: editingPassageiro.nome_responsavel,
            parentesco_responsavel: editingPassageiro.parentesco_responsavel || "",
            email_responsavel: editingPassageiro.email_responsavel || "",
            cpf_responsavel: editingPassageiro.cpf_responsavel ? cpfMask(editingPassageiro.cpf_responsavel) : "",
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
            data_inicio_transporte: editingPassageiro.data_inicio_transporte ? formatDateToBR(editingPassageiro.data_inicio_transporte) : "",
            data_fim_transporte: editingPassageiro.data_fim_transporte ? formatDateToBR(editingPassageiro.data_fim_transporte) : "31/12/" + new Date().getFullYear(),
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

            ativo: editingPassageiro.ativo,
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
          modalidade: prePassageiro.modalidade || "",
          data_nascimento: prePassageiro.data_nascimento ? formatDateToBR(prePassageiro.data_nascimento) : "",
          genero: prePassageiro.genero || "",
          parentesco_responsavel: prePassageiro.parentesco_responsavel || "",
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
          data_inicio_transporte: prePassageiro.data_inicio_transporte ? formatDateToBR(prePassageiro.data_inicio_transporte) : "",
          data_fim_transporte: prePassageiro.data_fim_transporte ? formatDateToBR(prePassageiro.data_fim_transporte) : "31/12/" + new Date().getFullYear(),

          ativo: true,
        });

        form.trigger([
          "escola_id",
          "veiculo_id",
          "periodo",
          "modalidade",
          "genero",
          "valor_cobranca",
          "dia_vencimento",
          "nome",
          "nome_responsavel",
          "parentesco_responsavel",
          "email_responsavel",
          "telefone_responsavel",
          "cpf_responsavel",
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
          modalidade: "",
          data_nascimento: "",
          genero: "",
          observacoes: "",
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          referencia: "",
          nome_responsavel: "",
          parentesco_responsavel: "",
          email_responsavel: "",
          telefone_responsavel: "",
          cpf_responsavel: "",
          valor_cobranca: "",
          dia_vencimento: "",
          data_inicio_transporte: "",
          data_fim_transporte: "31/12/" + new Date().getFullYear(),

          ativo: true,
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
    editingPassageiro?.id,
    mode,
    prePassageiro?.id,
    form,
  ]);

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen) {
      carregarDados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingPassageiro?.id, prePassageiro?.id]);

  return {
    form,
    refreshing,
    openAccordionItems,
    setOpenAccordionItems,
  };
}
