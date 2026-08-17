import {
  cepSchema,
  cpfSchema,
  dateSchema,
  phoneSchema,
} from "@/schemas/common";
import { PassageiroFormModes } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { parseLocalDate } from "@/utils/dateUtils";
import { cepMask, cpfMask, moneyMask, moneyToNumber, phoneMask } from "@/utils/masks";
import { isValidCEPFormat, isValidCPF } from "@/utils/validators";
import { mapearPrePassageiroParaFormulario } from "@/utils/domain/passageiro/prePassageiroConverter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const getMonthFromDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return "";
  return parseInt(parts[1], 10).toString();
};

export const passageiroSchema = z
  .object({
    escola_id: z.string().min(1, "Campo obrigatório"),
    veiculo_id: z.string().min(1, "Campo obrigatório"),
    nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),

    periodo: z.string().optional().nullable().or(z.literal("")),
    modalidade: z.string().optional().nullable().or(z.literal("")),
    data_nascimento: dateSchema(false),
    genero: z.string().optional().nullable().or(z.literal("")),

    observacoes: z.string().optional().nullable().or(z.literal("")),

    responsavel_principal: z.object({
      nome: z.string({ required_error: "Campo obrigatório", invalid_type_error: "Campo obrigatório" }).min(2, "Deve ter pelo menos 2 caracteres"),
      parentesco: z
        .string({ required_error: "Campo obrigatório", invalid_type_error: "Campo obrigatório" })
        .min(1, "Campo obrigatório"),
      cpf: z
        .string({ required_error: "Campo obrigatório", invalid_type_error: "Campo obrigatório" })
        .min(1, "Campo obrigatório"),
      telefone: z
        .string({ required_error: "Campo obrigatório", invalid_type_error: "Campo obrigatório" })
        .min(1, "Campo obrigatório"),
      email: z
        .string()
        .optional()
        .nullable()
        .or(z.literal(""))
        .refine((val) => !val || z.string().email().safeParse(val).success, {
          message: "E-mail inválido",
        }),
      logradouro: z.string().optional().nullable().or(z.literal("")),
      numero: z.string().optional().nullable().or(z.literal("")),
      bairro: z.string().optional().nullable().or(z.literal("")),
      cidade: z.string().optional().nullable().or(z.literal("")),
      estado: z.string().optional().nullable().or(z.literal("")),
      cep: z.string().optional().nullable().or(z.literal("")),
      referencia: z.string().optional().nullable().or(z.literal("")),
      complemento: z.string().optional().nullable().or(z.literal("")),
    }),
    turma: z.string().optional().nullable().or(z.literal("")),
    nome_professor: z.string().optional().nullable().or(z.literal("")),

    isento: z.boolean().optional().default(false),
    valor_cobranca: z.string().optional().or(z.literal("")),
    dia_vencimento: z.string().optional().or(z.literal("")),
    data_inicio_transporte: dateSchema(false, true),
    data_fim_transporte: dateSchema(false, true),
    mes_inicio_cobranca: z.string().optional().or(z.literal("")),
    mes_fim_cobranca: z.string().optional().or(z.literal("")),
    ativo: z.boolean().optional(),
    usuario_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.responsavel_principal?.cpf && data.responsavel_principal.cpf.trim() !== "") {
      if (!isValidCPF(data.responsavel_principal.cpf)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CPF inválido",
          path: ["responsavel_principal", "cpf"],
        });
      }
    }

    if (data.responsavel_principal?.telefone && data.responsavel_principal.telefone.trim() !== "") {
      const nums = data.responsavel_principal.telefone.replace(/\D/g, "");
      if (nums.length < 10 || nums.length > 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Telefone inválido",
          path: ["responsavel_principal", "telefone"],
        });
      }
    }

    if (data.data_inicio_transporte && data.data_fim_transporte) {
      try {
        const start = parseLocalDate(convertDateBrToISO(data.data_inicio_transporte)!);
        const end = parseLocalDate(convertDateBrToISO(data.data_fim_transporte)!);
        if (end <= start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Término deve ser maior que o Início",
            path: ["data_fim_transporte"],
          });
        }
      } catch {
        // Silencioso
      }
    }

    if (!data.isento) {
      if (!data.valor_cobranca || data.valor_cobranca.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Campo obrigatório",
          path: ["valor_cobranca"],
        });
      } else {
        const num = moneyToNumber(data.valor_cobranca);
        if (num < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O valor deve ser no mínimo R$ 1,00",
            path: ["valor_cobranca"],
          });
        }
      }

      if (!data.dia_vencimento || data.dia_vencimento.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Campo obrigatório",
          path: ["dia_vencimento"],
        });
      }

      if (!data.mes_inicio_cobranca || data.mes_inicio_cobranca.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Campo obrigatório",
          path: ["mes_inicio_cobranca"],
        });
      }

      if (!data.mes_fim_cobranca || data.mes_fim_cobranca.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Campo obrigatório",
          path: ["mes_fim_cobranca"],
        });
      } else if (data.mes_inicio_cobranca && parseInt(data.mes_fim_cobranca, 10) < parseInt(data.mes_inicio_cobranca, 10)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Término da cobrança deve ser igual ou posterior ao início",
          path: ["mes_fim_cobranca"],
        });
      }
    }
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
      turma: "",
      nome_professor: "",
      isento: false,
      valor_cobranca: "",
      dia_vencimento: "",
      data_inicio_transporte: "",
      data_fim_transporte: "",
      mes_inicio_cobranca: "",
      mes_fim_cobranca: "",

      ativo: true,
    },
  });

  const carregarDados = useCallback(async () => {
    try {
      setRefreshing(true);

      const isFinalizeMode = mode === PassageiroFormModes.FINALIZE && prePassageiro;

      if (editingPassageiro && mode === PassageiroFormModes.EDIT) {
        form.reset({
          nome: editingPassageiro.nome,
          periodo: editingPassageiro.periodo || "",
          modalidade: editingPassageiro.modalidade || "",
          data_nascimento: editingPassageiro.data_nascimento ? formatDateToBR(editingPassageiro.data_nascimento) : "",
          genero: editingPassageiro.genero || "",
          turma: editingPassageiro.turma || "",
          nome_professor: editingPassageiro.nome_professor || "",
          responsavel_principal: {
            nome: editingPassageiro.responsavel_principal?.nome || "",
            parentesco: editingPassageiro.responsavel_principal?.parentesco || "",
            cpf: editingPassageiro.responsavel_principal?.cpf ? cpfMask(editingPassageiro.responsavel_principal.cpf) : "",
            telefone: phoneMask(editingPassageiro.responsavel_principal?.telefone),
            email: editingPassageiro.responsavel_principal?.email || "",
            logradouro: editingPassageiro.responsavel_principal?.logradouro || "",
            numero: editingPassageiro.responsavel_principal?.numero || "",
            bairro: editingPassageiro.responsavel_principal?.bairro || "",
            cidade: editingPassageiro.responsavel_principal?.cidade || "",
            estado: editingPassageiro.responsavel_principal?.estado || "",
            cep: editingPassageiro.responsavel_principal?.cep ? cepMask(editingPassageiro.responsavel_principal.cep) : "",
            referencia: editingPassageiro.responsavel_principal?.referencia || "",
            complemento: editingPassageiro.responsavel_principal?.complemento || "",
          },
          isento: editingPassageiro.isento ?? false,
          valor_cobranca: editingPassageiro.valor_cobranca
            ? moneyMask(
              String(
                Math.round(Number(editingPassageiro.valor_cobranca) * 100)
              )
            )
            : "",
          dia_vencimento: editingPassageiro.dia_vencimento?.toString() || "",
          data_inicio_transporte: editingPassageiro.data_inicio_transporte ? formatDateToBR(editingPassageiro.data_inicio_transporte) : "",
          data_fim_transporte: editingPassageiro.data_fim_transporte ? formatDateToBR(editingPassageiro.data_fim_transporte) : "",
          mes_inicio_cobranca: getMonthFromDate(editingPassageiro.data_inicio_cobranca) || "",
          mes_fim_cobranca: getMonthFromDate(editingPassageiro.data_fim_cobranca) || "",
          observacoes: editingPassageiro.observacoes || "",
          escola_id: editingPassageiro.escola_id || "",
          veiculo_id: editingPassageiro.veiculo_id || "",

          ativo: editingPassageiro.ativo,
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
          ...(mapearPrePassageiroParaFormulario(prePassageiro) as PassageiroFormData),
          isento: false,
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
          "responsavel_principal",
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
          turma: "",
          nome_professor: "",
          responsavel_principal: {
            nome: "",
            parentesco: "",
            telefone: "",
            cpf: "",
            email: "",
            logradouro: "",
            numero: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: "",
            referencia: "",
            complemento: "",
          },
          isento: false,
          valor_cobranca: "",
          dia_vencimento: "",
          data_inicio_transporte: "",
          data_fim_transporte: "",
          mes_inicio_cobranca: "",
          mes_fim_cobranca: "",

          ativo: true,
        });

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
  ]);

  useEffect(() => {
    if (isOpen) {
      carregarDados();
    }
  }, [isOpen, editingPassageiro, prePassageiro, carregarDados]);

  return {
    form,
    refreshing,
    openAccordionItems,
    setOpenAccordionItems,
  };
}
