import { usePermissions } from "@/hooks/business/usePermissions";
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
    modalidade: z.string().min(1, "Campo obrigatório"),
    data_nascimento: dateSchema(true),
    genero: z.string().min(1, "Campo obrigatório"),

    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: cepSchema.or(z.literal("")).optional(),
    referencia: z.string().optional(),

    observacoes: z.string().optional(),

    nome_responsavel: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
    parentesco_responsavel: z.string().min(1, "Campo obrigatório"),
    email_responsavel: z
      .string()
      .min(1, "Campo obrigatório")
      .email("E-mail inválido"),
    cpf_responsavel: cpfSchema,
    telefone_responsavel: phoneSchema,

    valor_cobranca: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => {
        const num = moneyToNumber(val);
        return num >= 1;
      }, "O valor deve ser no mínimo R$ 1,00"),
    dia_vencimento: z.string().min(1, "Campo obrigatório"),
    data_inicio_transporte: dateSchema(true, true),

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
  mode?: PassageiroFormModes;
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
  const { canUseAutomatedCharges: canUseCobrancaAutomatica } = usePermissions();
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

      ativo: true,
      enviar_cobranca_automatica:
        canUseCobrancaAutomatica && podeAtivarCobrancaAutomatica,
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
            periodo: editingPassageiro.periodo,
            modalidade: editingPassageiro.modalidade || "",
            data_nascimento: editingPassageiro.data_nascimento ? formatDateToBR(new Date(editingPassageiro.data_nascimento)) : "",
            genero: editingPassageiro.genero || "",
            nome_responsavel: editingPassageiro.nome_responsavel,
            parentesco_responsavel: editingPassageiro.parentesco_responsavel || "",
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
            data_inicio_transporte: editingPassageiro.data_inicio_transporte ? formatDateToBR(new Date(editingPassageiro.data_inicio_transporte)) : "",
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
          modalidade: prePassageiro.modalidade || "",
          data_nascimento: formatDateToBR(prePassageiro.data_nascimento || ""),
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
          data_inicio_transporte: formatDateToBR(prePassageiro.data_inicio_transporte || ""),

          ativo: true,
          enviar_cobranca_automatica:
            canUseCobrancaAutomatica && podeAtivarCobrancaAutomatica,
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

          ativo: true,
          enviar_cobranca_automatica:
            canUseCobrancaAutomatica && podeAtivarCobrancaAutomatica,
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
    canUseCobrancaAutomatica, // Added
  ]);
  
  // Load data when dialog opens
  useEffect(() => {
    if (isOpen) {
        carregarDados();
    }
  }, [isOpen, carregarDados]);

  // AJUSTE RÁPIDO: Auto-ativar checkbox de cobrança automática se elegível e não tocado
  useEffect(() => {
    // Apenas modes de criação/finalização (Edit respeita o banco)
    if (mode === PassageiroFormModes.EDIT || !isOpen) return;

    // Se tem permissão e franquia
    if (canUseCobrancaAutomatica && podeAtivarCobrancaAutomatica) {
      // Verificar se usuário já mexeu no campo
      const fieldState = form.getFieldState("enviar_cobranca_automatica");
      const currentValue = form.getValues("enviar_cobranca_automatica");
      
      // Se não está dirty (usuário não clicou) e está false, forçamos true
      // Adicionado check de !fieldState.isDirty para garantir que não sobrescrevemos escolha do usuário
      if (!fieldState.isDirty && !currentValue) {
        form.setValue("enviar_cobranca_automatica", true, { shouldDirty: false });
      }
    }
  }, [canUseCobrancaAutomatica, podeAtivarCobrancaAutomatica, mode, form, isOpen]);

  return {
    form,
    refreshing,
    openAccordionItems,
    setOpenAccordionItems,
  };
}
