import { AvisoInlineExcessoFranquia } from "@/components/dialogs/AvisoInlineExcessoFranquia";
import LimiteFranquiaDialog from "@/components/dialogs/LimiteFranquiaDialog";
import { CepInput, MoneyInput, PhoneInput } from "@/components/forms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useBuscarResponsavel,
  useCreatePassageiro,
  useEscolasWithFilters,
  useFinalizePreCadastro,
  useUpdatePassageiro,
  useValidarFranquia,
  useVeiculosWithFilters,
} from "@/hooks";
import { useSession } from "@/hooks/business/useSession";
import { cn } from "@/lib/utils";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Usuario } from "@/types/usuario";
import { Veiculo } from "@/types/veiculo";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { updateQuickStartStepWithRollback } from "@/utils/domain/quickstart/quickStartUtils";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { currentMonthInText, periodos } from "@/utils/formatters";
import { cepMask, cpfMask, moneyMask, phoneMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import {
  cepSchema,
  cpfSchema,
  phoneSchema,
  validateEnderecoFields,
} from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CalendarDays,
  Car,
  Contact,
  CreditCard,
  FileText,
  Hash,
  Loader2,
  Mail,
  MapPin,
  School,
  Sun,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passageiroSchema = z
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
    cep: cepSchema(false),
    referencia: z.string().optional(),

    observacoes: z.string().optional(),

    nome_responsavel: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
    email_responsavel: z
      .string()
      .min(1, "Campo obrigatório")
      .email("E-mail inválido"),
    cpf_responsavel: cpfSchema(true),
    telefone_responsavel: phoneSchema(true),

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
type PassageiroFormData = z.infer<typeof passageiroSchema>;

type PlanoUsuario = {
  slug: string;
  status: string;
  trial_end_at: string | null;
  ativo: boolean;
  planoCompleto: any;
  isTrial: boolean;
  isValidTrial: boolean;
  isActive: boolean;
  isValidPlan: boolean;
  isFreePlan: boolean;
  isCompletePlan: boolean;
  isEssentialPlan: boolean;
} | null;

interface PassengerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassageiro: Passageiro | null;
  mode?: "create" | "edit" | "finalize";
  prePassageiro?: PrePassageiro | null;
  onSuccess: () => void;
  onCreateEscola?: () => void;
  onCreateVeiculo?: () => void;
  novaEscolaId?: string | null;
  novoVeiculoId?: string | null;
  profile: Usuario | null | undefined;
  plano: PlanoUsuario;
}

export default function PassengerFormDialog({
  isOpen,
  onClose,
  editingPassageiro,
  mode,
  prePassageiro,
  onSuccess,
  onCreateEscola,
  onCreateVeiculo,
  novaEscolaId,
  novoVeiculoId,
  profile,
  plano,
}: PassengerFormDialogProps) {
  const [selectedEscola, setSelectedEscola] = useState<string | null>(null);
  const [selectedVeiculo, setSelectedVeiculo] = useState<string | null>(null);
  const [escolaIdFilter, setEscolaIdFilter] = useState<string | undefined>(
    undefined
  );
  const [veiculoIdFilter, setVeiculoIdFilter] = useState<string | undefined>(
    undefined
  );

  // Refs para evitar múltiplas execuções dos useEffects
  const novaEscolaProcessadaRef = useRef<string | null>(null);
  const novoVeiculoProcessadoRef = useRef<string | null>(null);

  // Calcular os filtros ANTES dos hooks serem executados
  // Isso evita que os hooks façam uma requisição sem includeId primeiro
  // Prioridade: novaEscolaId/novoVeiculoId > editingPassageiro > escolaIdFilter/veiculoIdFilter
  const filtrosEscolas = useMemo(() => {
    const filtros: Record<string, string> = { ativo: "true" };
    // Prioridade 1: Se há uma nova escola sendo adicionada, usar ela
    if (novaEscolaId) {
      filtros.includeId = novaEscolaId;
    }
    // Prioridade 2: Se o modal está aberto e estamos editando, incluir o ID da escola
    else if (
      isOpen &&
      editingPassageiro &&
      mode === "edit" &&
      editingPassageiro.escola_id
    ) {
      filtros.includeId = editingPassageiro.escola_id;
    }
    // Prioridade 3: Se há um filtro de escola definido (fallback)
    else if (escolaIdFilter) {
      filtros.includeId = escolaIdFilter;
    }
    return filtros;
  }, [
    isOpen,
    editingPassageiro?.escola_id,
    editingPassageiro?.id,
    mode,
    escolaIdFilter,
    novaEscolaId,
  ]);

  const filtrosVeiculos = useMemo(() => {
    const filtros: Record<string, string> = { ativo: "true" };
    // Prioridade 1: Se há um novo veículo sendo adicionado, usar ele
    if (novoVeiculoId) {
      filtros.includeId = novoVeiculoId;
    }
    // Prioridade 2: Se o modal está aberto e estamos editando, incluir o ID do veículo
    else if (
      isOpen &&
      editingPassageiro &&
      mode === "edit" &&
      editingPassageiro.veiculo_id
    ) {
      filtros.includeId = editingPassageiro.veiculo_id;
    }
    // Prioridade 3: Se há um filtro de veículo definido (fallback)
    else if (veiculoIdFilter) {
      filtros.includeId = veiculoIdFilter;
    }
    return filtros;
  }, [
    isOpen,
    editingPassageiro?.veiculo_id,
    editingPassageiro?.id,
    mode,
    veiculoIdFilter,
    novoVeiculoId,
  ]);

  const [refreshing, setRefreshing] = useState(true);

  // Atualizar estado dos filtros quando necessário (para uso em outros useEffects)
  useEffect(() => {
    if (isOpen) {
      if (editingPassageiro && mode === "edit") {
        // Atualizar estado para uso em outros useEffects
        setEscolaIdFilter(editingPassageiro.escola_id || undefined);
        setVeiculoIdFilter(editingPassageiro.veiculo_id || undefined);
      } else if (!editingPassageiro) {
        setEscolaIdFilter(undefined);
        setVeiculoIdFilter(undefined);
      }
    } else {
      // Limpar filtros quando o modal fechar
      setEscolaIdFilter(undefined);
      setVeiculoIdFilter(undefined);
    }
  }, [isOpen, editingPassageiro, mode]);

  const {
    data: escolasData = [],
    refetch: refetchEscolas,
    isLoading: isLoadingEscolas,
  } = useEscolasWithFilters(profile?.id, filtrosEscolas, {
    enabled: !!profile?.id && isOpen,
    // Garantir que sempre refaça a requisição quando o modal abrir para edição
    // O staleTime e refetchOnMount já estão configurados no hook
  });

  const {
    data: veiculosData = [],
    refetch: refetchVeiculos,
    isLoading: isLoadingVeiculos,
  } = useVeiculosWithFilters(profile?.id, filtrosVeiculos, {
    enabled: !!profile?.id && isOpen,
    // Garantir que sempre refaça a requisição quando o modal abrir para edição
    // O staleTime e refetchOnMount já estão configurados no hook
  });

  const escolasModal = (escolasData as Escola[]) || [];
  const veiculosModal = (veiculosData as Veiculo[]) || [];

  const createPassageiro = useCreatePassageiro();
  const updatePassageiro = useUpdatePassageiro();
  const finalizePreCadastro = useFinalizePreCadastro();

  // Hook para validar franquia usando dados já carregados
  // Não precisa passar authUid aqui pois já recebe profile como prop
  // Mas precisamos do user?.id para evitar chamadas duplicadas
  // Como já recebemos profile como prop, vamos passar undefined para authUid e o profile
  const { user } = useSession();
  const { validacao: validacaoFranquia } = useValidarFranquia(
    user?.id,
    editingPassageiro?.id,
    profile
  );

  const loading =
    createPassageiro.isPending ||
    updatePassageiro.isPending ||
    finalizePreCadastro.isPending;
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "passageiro",
    "responsavel",
    "cobranca",
    "endereco",
  ]);
  const registerOnAsaas = false;

  const form = useForm<PassageiroFormData>({
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
      enviar_cobranca_automatica: false,
    },
  });

  // Aguardar que os dados estejam disponíveis e preencher os campos de escola e veículo
  // Este useEffect garante que os campos sejam preenchidos quando os dados estiverem disponíveis
  // IMPORTANTE: Este useEffect deve estar DEPOIS da declaração de escolasData, veiculosData e form
  // IMPORTANTE: Não sobrescreve se um novo registro foi selecionado (novaEscolaId/novoVeiculoId)
  useEffect(() => {
    if (
      isOpen &&
      editingPassageiro &&
      mode === "edit" &&
      !isLoadingEscolas &&
      !isLoadingVeiculos
    ) {
      // Não executar se há um novo registro sendo processado
      if (novaEscolaProcessadaRef.current || novoVeiculoProcessadoRef.current) {
        return;
      }

      // Não sobrescrever se um novo registro foi selecionado recentemente
      // Verificar se o valor atual do form corresponde ao novo registro selecionado
      const escolaAtual = form.getValues("escola_id");
      const veiculoAtual = form.getValues("veiculo_id");

      if (novaEscolaId && escolaAtual === novaEscolaId) {
        // Se o novo registro já está selecionado, não sobrescrever
        return;
      }

      if (novoVeiculoId && veiculoAtual === novoVeiculoId) {
        // Se o novo registro já está selecionado, não sobrescrever
        return;
      }

      // Type assertions para garantir que os dados são arrays
      const escolasArray = (escolasData as Escola[]) || [];
      const veiculosArray = (veiculosData as Veiculo[]) || [];

      // Verificar se os dados necessários estão disponíveis
      const escolaExiste =
        !editingPassageiro.escola_id ||
        escolasArray.some((e: Escola) => e.id === editingPassageiro.escola_id);
      const veiculoExiste =
        !editingPassageiro.veiculo_id ||
        veiculosArray.some(
          (v: Veiculo) => v.id === editingPassageiro.veiculo_id
        );

      // Se os dados estão disponíveis e o form ainda não foi preenchido corretamente, preencher
      // Mas apenas se não houver um novo registro sendo selecionado
      if (escolaExiste && veiculoExiste) {
        // Só atualizar escola se não houver novaEscolaId ou se o valor atual não corresponde ao novo
        if (!novaEscolaId && escolaAtual !== editingPassageiro.escola_id) {
          form.setValue("escola_id", editingPassageiro.escola_id || "", {
            shouldValidate: false,
          });
          setSelectedEscola(editingPassageiro.escola_id || null);
        }
        // Só atualizar veículo se não houver novoVeiculoId ou se o valor atual não corresponde ao novo
        if (!novoVeiculoId && veiculoAtual !== editingPassageiro.veiculo_id) {
          form.setValue("veiculo_id", editingPassageiro.veiculo_id || "", {
            shouldValidate: false,
          });
          setSelectedVeiculo(editingPassageiro.veiculo_id || null);
        }
      }
    }
  }, [
    isOpen,
    editingPassageiro,
    mode,
    escolasData,
    veiculosData,
    isLoadingEscolas,
    isLoadingVeiculos,
    form,
    novaEscolaId,
    novoVeiculoId,
  ]);

  const emitirCobranca = form.watch("emitir_cobranca_mes_atual");
  const diaVencimento = form.watch("dia_vencimento");
  const cep = form.watch("cep");
  const logradouro = form.watch("logradouro");
  const numero = form.watch("numero");

  // Revalidar campos de endereço quando qualquer um deles mudar
  useEffect(() => {
    if (isOpen) {
      // Trigger em todos os campos para garantir validação completa
      form.trigger(["cep", "logradouro", "numero"]);
    }
  }, [cep, logradouro, numero, isOpen, form]);
  const [limiteFranquiaDialog, setLimiteFranquiaDialog] = useState<{
    open: boolean;
    franquiaContratada: number;
    cobrancasEmUso: number;
  }>({
    open: false,
    franquiaContratada: 0,
    cobrancasEmUso: 0,
  });

  // Limpar refs quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      novaEscolaProcessadaRef.current = null;
      novoVeiculoProcessadoRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    // Evitar processar o mesmo ID múltiplas vezes
    if (novaEscolaId && novaEscolaId !== novaEscolaProcessadaRef.current) {
      novaEscolaProcessadaRef.current = novaEscolaId;
      setEscolaIdFilter(novaEscolaId);

      // Fazer refetch e aguardar o resultado antes de selecionar
      refetchEscolas().then((result) => {
        const escolasCarregadas = (result.data as Escola[]) || [];
        const escolaExiste = escolasCarregadas.some(
          (e: Escola) => e.id === novaEscolaId
        );

        if (escolaExiste) {
          // Aguardar um frame para garantir que o estado foi atualizado
          requestAnimationFrame(() => {
            form.setValue("escola_id", novaEscolaId, { shouldValidate: true });
            setSelectedEscola(novaEscolaId);
          });
        } else {
          // Se ainda não existe, tentar novamente após um delay
          setTimeout(() => {
            refetchEscolas().then((retryResult) => {
              const escolasRetry = (retryResult.data as Escola[]) || [];
              if (escolasRetry.some((e: Escola) => e.id === novaEscolaId)) {
                form.setValue("escola_id", novaEscolaId, {
                  shouldValidate: true,
                });
                setSelectedEscola(novaEscolaId);
              }
            });
          }, 300);
        }
      });
    }
  }, [novaEscolaId, refetchEscolas, form]);

  useEffect(() => {
    // Evitar processar o mesmo ID múltiplas vezes
    if (novoVeiculoId && novoVeiculoId !== novoVeiculoProcessadoRef.current) {
      novoVeiculoProcessadoRef.current = novoVeiculoId;
      setVeiculoIdFilter(novoVeiculoId);

      // Fazer refetch e aguardar o resultado antes de selecionar
      refetchVeiculos().then((result) => {
        const veiculosCarregados = (result.data as Veiculo[]) || [];
        const veiculoExiste = veiculosCarregados.some(
          (v: Veiculo) => v.id === novoVeiculoId
        );

        if (veiculoExiste) {
          // Aguardar um frame para garantir que o estado foi atualizado
          requestAnimationFrame(() => {
            form.setValue("veiculo_id", novoVeiculoId, {
              shouldValidate: true,
            });
            setSelectedVeiculo(novoVeiculoId);
          });
        } else {
          // Se ainda não existe, tentar novamente após um delay
          setTimeout(() => {
            refetchVeiculos().then((retryResult) => {
              const veiculosRetry = (retryResult.data as Veiculo[]) || [];
              if (veiculosRetry.some((v: Veiculo) => v.id === novoVeiculoId)) {
                form.setValue("veiculo_id", novoVeiculoId, {
                  shouldValidate: true,
                });
                setSelectedVeiculo(novoVeiculoId);
              }
            });
          }, 300);
        }
      });
    }
  }, [novoVeiculoId, refetchVeiculos, form]);

  useEffect(() => {
    if (!profile?.id || !isOpen) return;

    const carregarDados = async () => {
      try {
        setRefreshing(true);

        const isFinalizeMode = mode === "finalize" && prePassageiro;

        if (editingPassageiro && mode === "edit") {
          // Os filtros já foram atualizados no useEffect acima quando editingPassageiro mudou
          // Os hooks do React Query vão recarregar automaticamente quando os filtros mudarem
          // Não precisamos fazer refetch manual - os hooks já fazem isso automaticamente

          // Aguardar um pouco para os dados serem carregados pelos hooks
          await new Promise((r) => setTimeout(r, 200));

          // força render com novas listas antes de resetar o form
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
              dia_vencimento:
                editingPassageiro.dia_vencimento?.toString() || "",
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

            setSelectedEscola(editingPassageiro.escola_id || null);
            setSelectedVeiculo(editingPassageiro.veiculo_id || null);
          });

          setOpenAccordionItems([
            "passageiro",
            "responsavel",
            "cobranca",
            "endereco",
            "observacoes",
          ]);
        } else if (isFinalizeMode) {
          setEscolaIdFilter(undefined);
          setVeiculoIdFilter(undefined);
          // Os hooks já fazem o fetch automaticamente, não precisamos refetch manual

          setSelectedEscola(null);
          setSelectedVeiculo(null);

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
            enviar_cobranca_automatica: canUseCobrancaAutomatica(plano),
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
          setEscolaIdFilter(undefined);
          setVeiculoIdFilter(undefined);
          // Os hooks já fazem o fetch automaticamente, não precisamos refetch manual

          setSelectedEscola(null);
          setSelectedVeiculo(null);

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
            enviar_cobranca_automatica: canUseCobrancaAutomatica(plano),
          });
        }
      } catch (error: any) {
        // Erro silencioso - dados já são carregados via hooks
      } finally {
        setRefreshing(false);
      }
    };

    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingPassageiro?.id, prePassageiro?.id, mode, profile?.id]);

  const onFormError = (errors: any) => {
    toast.error("validacao.formularioComErros");
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  };

  const buscarResponsavel = useBuscarResponsavel();

  const handleSearchResponsavel = async (cpf: string) => {
    if (mode === "edit" || mode === "finalize") return;
    if (cpf.length !== 11 || !profile?.id) return;

    try {
      const responsavel = await buscarResponsavel.mutateAsync({
        cpf,
        usuarioId: profile.id,
      });

      if (responsavel) {
        form.setValue("nome_responsavel", responsavel.nome_responsavel || "");
        form.setValue("email_responsavel", responsavel.email_responsavel || "");
        form.setValue(
          "telefone_responsavel",
          responsavel.telefone_responsavel || ""
        );
      }
    } catch (error) {
      // Silencioso se não encontrar ou erro
    }
  };

  const handleCpfBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cpf = e.target.value.replace(/\D/g, "");
    handleSearchResponsavel(cpf);
  };

  // Monitorar mudanças no CPF para busca automática
  const cpfResponsavelValue = form.watch("cpf_responsavel");
  useEffect(() => {
    if (!cpfResponsavelValue) return;

    const unmasked = cpfResponsavelValue.replace(/\D/g, "");
    if (unmasked.length === 11) {
      handleSearchResponsavel(unmasked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpfResponsavelValue]);

  const handleSubmit = async (data: PassageiroFormData) => {
    if (!profile?.id) return;

    const valorAtualEnviarCobranca =
      editingPassageiro?.enviar_cobranca_automatica || false;
    const novoValorEnviarCobranca = data.enviar_cobranca_automatica || false;

    if (
      novoValorEnviarCobranca &&
      !valorAtualEnviarCobranca &&
      canUseCobrancaAutomatica(plano)
    ) {
      // Usar validação já calculada via hook
      if (!validacaoFranquia.podeAtivar) {
        setLimiteFranquiaDialog({
          open: true,
          franquiaContratada: validacaoFranquia.franquiaContratada,
          cobrancasEmUso: validacaoFranquia.cobrancasEmUso,
        });
        // Reverter o valor do campo para false
        form.setValue("enviar_cobranca_automatica", false);
        return;
      }
    }

    const { emitir_cobranca_mes_atual, ...purePayload } = data;

    // Preparar rollback do QuickStart apenas para criações (não para edições)
    const shouldUpdateQuickStart = !editingPassageiro;
    const quickStartRollback = shouldUpdateQuickStart
      ? updateQuickStartStepWithRollback("step_passageiros")
      : null;

    if (mode === "finalize" && prePassageiro) {
      // Finalizar pré-cadastro (cadastro rápido)
      finalizePreCadastro.mutate(
        {
          prePassageiroId: prePassageiro.id,
          data: {
            ...purePayload,
            emitir_cobranca_mes_atual,
            usuario_id: prePassageiro.usuario_id,
          },
        },
        {
          onSuccess: () => {
            onSuccess();
            onClose();
          },
          onError: () => {
            if (quickStartRollback) {
              quickStartRollback.restore();
            }
          },
        }
      );
    } else if (editingPassageiro) {
      // Edição de passageiro (não atualiza QuickStart)
      updatePassageiro.mutate(
        {
          id: editingPassageiro.id,
          data: purePayload,
        },
        {
          onSuccess: () => {
            onSuccess();
            onClose();
          },
        }
      );
    } else {
      // Criação normal de passageiro
      createPassageiro.mutate(
        {
          ...purePayload,
          emitir_cobranca_mes_atual,
          usuario_id: profile.id,
        },
        {
          onSuccess: () => {
            onSuccess();
            onClose();
          },
          onError: () => {
            if (quickStartRollback) {
              quickStartRollback.restore();
            }
          },
        }
      );
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="w-[90vw] sm:w-full sm:max-w-2xl max-h-[95vh] flex flex-col overflow-hidden bg-blue-600 rounded-3xl border-0 shadow-2xl p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton
          aria-describedby="dialog-description"
        >
          <div className="bg-blue-600 p-4 text-center relative shrink-0">
            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {mode === "finalize"
                ? "Cadastrar Passageiro"
                : editingPassageiro
                ? "Editar Passageiro"
                : "Cadastrar Passageiro"}
            </DialogTitle>
          </div>

          <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                className="space-y-6"
              >
                {mode === "finalize" && prePassageiro && (
                  <div className="mb-6">
                    <Alert
                      variant="default"
                      className="bg-orange-50 border-orange-200 text-orange-900 [&>svg]:text-orange-600"
                    >
                      <AlertTriangle className="h-4 w-4 mt-0.5" />
                      <AlertTitle className="font-semibold text-sm">
                        Atenção!
                      </AlertTitle>
                      <AlertDescription className="text-xs">
                        Para concluir o cadastro, preencha os campos destacados
                        em vermelho.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <Accordion
                  type="multiple"
                  value={openAccordionItems}
                  onValueChange={setOpenAccordionItems}
                  className="w-full space-y-4"
                >
                  <AccordionItem
                    value="passageiro"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <User className="w-5 h-5" />
                        </div>
                        Passageiro
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nome"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-1">
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Nome <span className="text-red-600">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    placeholder="Digite o nome do passageiro"
                                    {...field}
                                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="veiculo_id"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>
                                Veículo <span className="text-red-600">*</span>
                              </FormLabel>
                              <Select
                                value={selectedVeiculo || field.value}
                                onValueChange={(value) => {
                                  if (value === "add-new-vehicle") {
                                    setTimeout(() => onCreateVeiculo(), 50);
                                    return;
                                  }
                                  field.onChange(value);
                                  setSelectedVeiculo(value);
                                }}
                              >
                                <FormControl>
                                  <div className="relative">
                                    <Car className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <SelectTrigger
                                      className={cn(
                                        "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                        fieldState.error && "border-red-500"
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      <SelectValue placeholder="Selecione o veículo" />
                                    </SelectTrigger>
                                  </div>
                                </FormControl>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                  {veiculosModal.map((veiculo) => (
                                    <SelectItem
                                      key={veiculo.id}
                                      value={veiculo.id}
                                    >
                                      {formatarPlacaExibicao(veiculo.placa)}
                                    </SelectItem>
                                  ))}
                                  <SelectItem
                                    value="add-new-vehicle"
                                    className="font-semibold text-primary cursor-pointer"
                                  >
                                    + Cadastrar Veículo
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="escola_id"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>
                                Escola <span className="text-red-600">*</span>
                              </FormLabel>
                              <Select
                                value={selectedEscola || field.value}
                                onValueChange={(value) => {
                                  if (value === "add-new-school") {
                                    setTimeout(() => onCreateEscola(), 50);
                                    return;
                                  }
                                  field.onChange(value);
                                  setSelectedEscola(value);
                                }}
                              >
                                <FormControl>
                                  <div className="relative">
                                    <School className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <SelectTrigger
                                      className={cn(
                                        "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                        fieldState.error && "border-red-500"
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      <SelectValue placeholder="Selecione a escola" />
                                    </SelectTrigger>
                                  </div>
                                </FormControl>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                  {escolasModal.map((escola) => (
                                    <SelectItem
                                      key={escola.id}
                                      value={escola.id}
                                    >
                                      {escola.nome}
                                    </SelectItem>
                                  ))}
                                  <SelectItem
                                    value="add-new-school"
                                    className="font-semibold text-primary cursor-pointer"
                                  >
                                    + Cadastrar Escola
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="periodo"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-1">
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Período <span className="text-red-600">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || undefined}
                              >
                                <FormControl>
                                  <div className="relative">
                                    <Sun className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <SelectTrigger
                                      className={cn(
                                        "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                        fieldState.error && "border-red-500"
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      <SelectValue placeholder="Selecione o período" />
                                    </SelectTrigger>
                                  </div>
                                </FormControl>
                                <SelectContent>
                                  {periodos.map((tipo) => (
                                    <SelectItem
                                      key={tipo.value}
                                      value={tipo.value}
                                    >
                                      {tipo.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {editingPassageiro && (
                        <div className="mt-2">
                          <FormField
                            control={form.control}
                            name="ativo"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0">
                                <Checkbox
                                  id="ativo"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <FormLabel
                                  htmlFor="ativo"
                                  className="flex-1 cursor-pointer font-medium text-gray-700 m-0 mt-0"
                                >
                                  Ativo
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="responsavel"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Contact className="w-5 h-5" />
                        </div>
                        Responsável
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cpf_responsavel"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                CPF <span className="text-red-600">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Hash className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="000.000.000-00"
                                    onChange={(e) => {
                                      field.onChange(cpfMask(e.target.value));
                                    }}
                                    onBlur={(e) => {
                                      field.onBlur();
                                      handleCpfBlur(e);
                                    }}
                                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nome_responsavel"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Nome do Responsável{" "}
                                <span className="text-red-600">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    {...field}
                                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email_responsavel"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                E-mail <span className="text-red-600">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    {...field}
                                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="telefone_responsavel"
                          render={({ field }) => (
                            <PhoneInput
                              field={field}
                              label="WhatsApp"
                              required
                              inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            />
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="cobranca"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        Cobrança
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="valor_cobranca"
                          render={({ field }) => (
                            <MoneyInput
                              field={field}
                              label="Valor"
                              required
                              inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dia_vencimento"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Dia do Vencimento{" "}
                                <span className="text-red-600">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <div className="relative">
                                    <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <SelectTrigger
                                      className={cn(
                                        "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                        fieldState.error && "border-red-500"
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      <SelectValue placeholder="Selecione o dia" />
                                    </SelectTrigger>
                                  </div>
                                </FormControl>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                  {Array.from(
                                    { length: 31 },
                                    (_, i) => i + 1
                                  ).map((day) => (
                                    <SelectItem
                                      key={day}
                                      value={day.toString()}
                                    >
                                      Dia {day}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {canUseCobrancaAutomatica(plano) && (
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="enviar_cobranca_automatica"
                            render={({ field }) => {
                              const mostrarAvisoFranquia =
                                field.value && !validacaoFranquia.podeAtivar;

                              return (
                                <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      id="enviar_cobranca_automatica"
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        if (
                                          checked &&
                                          !validacaoFranquia.podeAtivar
                                        ) {
                                          return;
                                        }
                                        field.onChange(checked);
                                      }}
                                      disabled={mostrarAvisoFranquia}
                                      className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 mt-0"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none flex-1">
                                    <FormLabel
                                      htmlFor="enviar_cobranca_automatica"
                                      className="text-base font-medium text-gray-700 cursor-pointer"
                                    >
                                      Enviar cobranças automáticas
                                    </FormLabel>
                                    <FormDescription className="text-sm text-gray-500">
                                      As cobranças serão enviadas
                                      automaticamente todo mês para este
                                      passageiro.
                                    </FormDescription>
                                    {mostrarAvisoFranquia && (
                                      <AvisoInlineExcessoFranquia
                                        limiteAtual={
                                          validacaoFranquia.franquiaContratada
                                        }
                                      />
                                    )}
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                      )}
                      {!editingPassageiro && (
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="emitir_cobranca_mes_atual"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    id="emitir_cobranca_mes_atual"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 mt-0"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none flex-1">
                                  <FormLabel
                                    htmlFor="emitir_cobranca_mes_atual"
                                    className="text-base font-medium text-gray-700 cursor-pointer"
                                  >
                                    Registrar cobrança de {currentMonthInText()}
                                    ?
                                  </FormLabel>
                                  {registerOnAsaas && (
                                    <FormDescription className="text-sm text-gray-500">
                                      Se desmarcado, a primeira cobrança será
                                      gerada apenas no próximo mês.
                                    </FormDescription>
                                  )}
                                </div>
                              </FormItem>
                            )}
                          />

                          {(() => {
                            const diaInformado = Number(diaVencimento) || null;

                            if (
                              !editingPassageiro &&
                              emitirCobranca &&
                              diaInformado &&
                              Number(diaInformado) < new Date().getDate()
                            ) {
                              return (
                                <div className="mt-4">
                                  <Alert
                                    variant="destructive"
                                    className="bg-yellow-50 border-yellow-200 text-yellow-900 [&>svg]:text-yellow-900"
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle className="font-bold">
                                      Ajuste na Data de Vencimento
                                    </AlertTitle>
                                    <AlertDescription className="text-yellow-800">
                                      <ul className="list-disc pl-4 mt-2 space-y-1">
                                        <li>
                                          Como o dia{" "}
                                          <strong>{diaInformado}</strong> já
                                          passou, a primeira cobrança{" "}
                                          <strong>vencerá hoje</strong>.
                                        </li>
                                        <li>
                                          As próximas cobranças vencerão
                                          normalmente no{" "}
                                          <strong>dia {diaInformado}</strong> de
                                          cada mês.
                                        </li>
                                      </ul>
                                    </AlertDescription>
                                  </Alert>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="endereco"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <MapPin className="w-5 h-5" />
                        </div>
                        Endereço
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <FormField
                          control={form.control}
                          name="cep"
                          render={({ field }) => (
                            <CepInput
                              field={field}
                              label="CEP"
                              className="md:col-span-2"
                              inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="logradouro"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-4">
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Logradouro
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    placeholder="Ex: Rua Comendador"
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="numero"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Número
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bairro"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-4">
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Bairro
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cidade"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-4">
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Cidade
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="estado"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Estado
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <div className="relative">
                                    <SelectTrigger
                                      className={cn(
                                        "h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                        fieldState.error && "border-red-500"
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      <SelectValue placeholder="UF" />
                                    </SelectTrigger>
                                  </div>
                                </FormControl>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                  <SelectItem value="AC">Acre</SelectItem>
                                  <SelectItem value="AL">Alagoas</SelectItem>
                                  <SelectItem value="AP">Amapá</SelectItem>
                                  <SelectItem value="AM">Amazonas</SelectItem>
                                  <SelectItem value="BA">Bahia</SelectItem>
                                  <SelectItem value="CE">Ceará</SelectItem>
                                  <SelectItem value="DF">
                                    Distrito Federal
                                  </SelectItem>
                                  <SelectItem value="ES">
                                    Espírito Santo
                                  </SelectItem>
                                  <SelectItem value="GO">Goiás</SelectItem>
                                  <SelectItem value="MA">Maranhão</SelectItem>
                                  <SelectItem value="MT">
                                    Mato Grosso
                                  </SelectItem>
                                  <SelectItem value="MS">
                                    Mato Grosso do Sul
                                  </SelectItem>
                                  <SelectItem value="MG">
                                    Minas Gerais
                                  </SelectItem>
                                  <SelectItem value="PA">Pará</SelectItem>
                                  <SelectItem value="PB">Paraíba</SelectItem>
                                  <SelectItem value="PR">Paraná</SelectItem>
                                  <SelectItem value="PE">Pernambuco</SelectItem>
                                  <SelectItem value="PI">Piauí</SelectItem>
                                  <SelectItem value="RJ">
                                    Rio de Janeiro
                                  </SelectItem>
                                  <SelectItem value="RN">
                                    Rio Grande do Norte
                                  </SelectItem>
                                  <SelectItem value="RS">
                                    Rio Grande do Sul
                                  </SelectItem>
                                  <SelectItem value="RO">Rondônia</SelectItem>
                                  <SelectItem value="RR">Roraima</SelectItem>
                                  <SelectItem value="SC">
                                    Santa Catarina
                                  </SelectItem>
                                  <SelectItem value="SP">São Paulo</SelectItem>
                                  <SelectItem value="SE">Sergipe</SelectItem>
                                  <SelectItem value="TO">Tocantins</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="referencia"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-6">
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Referência
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Ex: próximo ao mercado"
                                  {...field}
                                  className="min-h-[80px] rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                  aria-invalid={!!fieldState.error}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="observacoes"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        Observações
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                      <FormField
                        control={form.control}
                        name="observacoes"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Ex: Alérgico a amendoim, entra pela porta lateral da escola, etc."
                                {...field}
                                className="min-h-[100px] rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                aria-invalid={!!fieldState.error}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="flex gap-4 mt-8 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onClose()}
                    disabled={loading}
                    className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || form.formState.isSubmitting}
                    className="flex-1 h-12 rounded-xl shadow-lg shadow-blue-500/20 font-semibold text-base"
                  >
                    {loading || form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : editingPassageiro ? (
                      "Atualizar"
                    ) : mode === "finalize" ? (
                      "Cadastrar"
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            <LoadingOverlay
              active={refreshing || loading}
              text={loading ? "Salvando..." : "Aguarde..."}
            />
          </div>
        </DialogContent>
      </Dialog>
      <LimiteFranquiaDialog
        open={limiteFranquiaDialog.open}
        onOpenChange={(open) =>
          setLimiteFranquiaDialog({ ...limiteFranquiaDialog, open })
        }
        franquiaContratada={limiteFranquiaDialog.franquiaContratada}
        cobrancasEmUso={limiteFranquiaDialog.cobrancasEmUso}
      />
    </>
  );
}
