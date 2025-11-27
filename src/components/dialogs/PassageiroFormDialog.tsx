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
    DialogContent,
    DialogHeader,
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
    useCreatePassageiro,
    useEscolasWithFilters,
    useFinalizePreCadastro,
    useUpdatePassageiro,
    useValidarFranquia,
    useVeiculosWithFilters,
} from "@/hooks";
import { useSession } from "@/hooks/business/useSession";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { PrePassageiro } from "@/types/prePassageiro";
import { Usuario } from "@/types/usuario";
import { Veiculo } from "@/types/veiculo";
import { updateQuickStartStepWithRollback } from "@/utils/domain/quickstart/quickStartUtils";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { currentMonthInText, periodos } from "@/utils/formatters";
import { cepMask, cpfMask, moneyMask, phoneMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { isValidCPF } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertTriangle,
    DollarSign,
    FileText,
    Loader2,
    MapPin,
    User,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passageiroSchema = z.object({
  escola_id: z.string().min(1, "Campo obrigatório"),
  veiculo_id: z.string().min(1, "Campo obrigatório"),
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),

  periodo: z.string().min(1, "Campo obrigatório"),

  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  referencia: z.string().optional(),

  observacoes: z.string().optional(),

  nome_responsavel: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  email_responsavel: z
    .string()
    .min(1, "Campo obrigatório")
    .email("E-mail inválido"),
  cpf_responsavel: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => isValidCPF(val), "CPF inválido"),
  telefone_responsavel: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => {
      const cleaned = val.replace(/\D/g, "");
      return cleaned.length === 11;
    }, "O formato aceito é (00) 00000-0000"),

  valor_cobranca: z.string().min(1, "Campo obrigatório"),
  dia_vencimento: z.string().min(1, "Campo obrigatório"),
  emitir_cobranca_mes_atual: z.boolean().optional(),
  ativo: z.boolean().optional(),
  usuario_id: z.string().optional(),
  enviar_cobranca_automatica: z.boolean().optional(),
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
  const [escolaIdFilter, setEscolaIdFilter] = useState<string | undefined>(undefined);
  const [veiculoIdFilter, setVeiculoIdFilter] = useState<string | undefined>(undefined);
  
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
    else if (isOpen && editingPassageiro && mode === "edit" && editingPassageiro.escola_id) {
      filtros.includeId = editingPassageiro.escola_id;
    }
    // Prioridade 3: Se há um filtro de escola definido (fallback)
    else if (escolaIdFilter) {
      filtros.includeId = escolaIdFilter;
    }
    return filtros;
  }, [isOpen, editingPassageiro?.escola_id, editingPassageiro?.id, mode, escolaIdFilter, novaEscolaId]);

  const filtrosVeiculos = useMemo(() => {
    const filtros: Record<string, string> = { ativo: "true" };
    // Prioridade 1: Se há um novo veículo sendo adicionado, usar ele
    if (novoVeiculoId) {
      filtros.includeId = novoVeiculoId;
    }
    // Prioridade 2: Se o modal está aberto e estamos editando, incluir o ID do veículo
    else if (isOpen && editingPassageiro && mode === "edit" && editingPassageiro.veiculo_id) {
      filtros.includeId = editingPassageiro.veiculo_id;
    }
    // Prioridade 3: Se há um filtro de veículo definido (fallback)
    else if (veiculoIdFilter) {
      filtros.includeId = veiculoIdFilter;
    }
    return filtros;
  }, [isOpen, editingPassageiro?.veiculo_id, editingPassageiro?.id, mode, veiculoIdFilter, novoVeiculoId]);
  
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
    isLoading: isLoadingEscolas 
  } = useEscolasWithFilters(
    profile?.id,
    filtrosEscolas,
    { 
      enabled: !!profile?.id && isOpen,
      // Garantir que sempre refaça a requisição quando o modal abrir para edição
      // O staleTime e refetchOnMount já estão configurados no hook
    }
  );

  const { 
    data: veiculosData = [], 
    refetch: refetchVeiculos,
    isLoading: isLoadingVeiculos 
  } = useVeiculosWithFilters(
    profile?.id,
    filtrosVeiculos,
    { 
      enabled: !!profile?.id && isOpen,
      // Garantir que sempre refaça a requisição quando o modal abrir para edição
      // O staleTime e refetchOnMount já estão configurados no hook
    }
  );

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
    if (isOpen && editingPassageiro && mode === "edit" && !isLoadingEscolas && !isLoadingVeiculos) {
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
      const escolaExiste = !editingPassageiro.escola_id || 
        escolasArray.some((e: Escola) => e.id === editingPassageiro.escola_id);
      const veiculoExiste = !editingPassageiro.veiculo_id || 
        veiculosArray.some((v: Veiculo) => v.id === editingPassageiro.veiculo_id);
      
      // Se os dados estão disponíveis e o form ainda não foi preenchido corretamente, preencher
      // Mas apenas se não houver um novo registro sendo selecionado
      if (escolaExiste && veiculoExiste) {
        // Só atualizar escola se não houver novaEscolaId ou se o valor atual não corresponde ao novo
        if (!novaEscolaId && escolaAtual !== editingPassageiro.escola_id) {
          form.setValue("escola_id", editingPassageiro.escola_id || "", { shouldValidate: false });
          setSelectedEscola(editingPassageiro.escola_id || null);
        }
        // Só atualizar veículo se não houver novoVeiculoId ou se o valor atual não corresponde ao novo
        if (!novoVeiculoId && veiculoAtual !== editingPassageiro.veiculo_id) {
          form.setValue("veiculo_id", editingPassageiro.veiculo_id || "", { shouldValidate: false });
          setSelectedVeiculo(editingPassageiro.veiculo_id || null);
        }
      }
    }
  }, [isOpen, editingPassageiro, mode, escolasData, veiculosData, isLoadingEscolas, isLoadingVeiculos, form, novaEscolaId, novoVeiculoId]);

  const emitirCobranca = form.watch("emitir_cobranca_mes_atual");
  const diaVencimento = form.watch("dia_vencimento");
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
        const escolaExiste = escolasCarregadas.some((e: Escola) => e.id === novaEscolaId);
        
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
                form.setValue("escola_id", novaEscolaId, { shouldValidate: true });
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
        const veiculoExiste = veiculosCarregados.some((v: Veiculo) => v.id === novoVeiculoId);
        
        if (veiculoExiste) {
          // Aguardar um frame para garantir que o estado foi atualizado
          requestAnimationFrame(() => {
            form.setValue("veiculo_id", novoVeiculoId, { shouldValidate: true });
            setSelectedVeiculo(novoVeiculoId);
          });
        } else {
          // Se ainda não existe, tentar novamente após um delay
          setTimeout(() => {
            refetchVeiculos().then((retryResult) => {
              const veiculosRetry = (retryResult.data as Veiculo[]) || [];
              if (veiculosRetry.some((v: Veiculo) => v.id === novoVeiculoId)) {
                form.setValue("veiculo_id", novoVeiculoId, { shouldValidate: true });
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
                ? moneyMask(String(Math.round(Number(editingPassageiro.valor_cobranca) * 100)))
                : "",
              dia_vencimento:
                editingPassageiro.dia_vencimento?.toString() || "",
              observacoes: editingPassageiro.observacoes || "",
              logradouro: editingPassageiro.logradouro || "",
              numero: editingPassageiro.numero || "",
              bairro: editingPassageiro.bairro || "",
              cidade: editingPassageiro.cidade || "",
              estado: editingPassageiro.estado || "",
              cep: editingPassageiro.cep
                ? cepMask(editingPassageiro.cep)
                : "",
              referencia: editingPassageiro.referencia || "",
              escola_id: editingPassageiro.escola_id || "",
              veiculo_id: editingPassageiro.veiculo_id || "",
              emitir_cobranca_mes_atual: false,
              ativo: editingPassageiro.ativo,
              enviar_cobranca_automatica: editingPassageiro.enviar_cobranca_automatica || false,
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

          form.reset({
            nome: prePassageiro.nome,
            nome_responsavel: prePassageiro.nome_responsavel,
            email_responsavel: prePassageiro.email_responsavel,
            cpf_responsavel: cpfMask(prePassageiro.cpf_responsavel),
            telefone_responsavel: phoneMask(
              prePassageiro.telefone_responsavel
            ),
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
              ? moneyMask(String(Math.round(Number(prePassageiro.valor_cobranca) * 100)))
              : "",
            dia_vencimento: prePassageiro.dia_vencimento?.toString() || "",
            emitir_cobranca_mes_atual: false,
            ativo: true,
            enviar_cobranca_automatica: plano?.isCompletePlan && plano?.isActive ? true : false,
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
            enviar_cobranca_automatica: plano?.isCompletePlan && plano?.isActive ? true : false,
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

  const handleSubmit = async (data: PassageiroFormData) => {
    if (!profile?.id) return;

    const valorAtualEnviarCobranca = editingPassageiro?.enviar_cobranca_automatica || false;
    const novoValorEnviarCobranca = data.enviar_cobranca_automatica || false;

    if (novoValorEnviarCobranca && !valorAtualEnviarCobranca && plano?.isCompletePlan) {
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
          className="max-w-3xl max-h-[95vh] overflow-y-auto bg-white"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "finalize"
                ? "Continuar Cadastro"
                : mode === "edit"
                ? "Editar Passageiro"
                : "Novo Passageiro"}
            </DialogTitle>
          </DialogHeader>
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
                      Para concluir o cadastro, preencha os campos destacados em
                      vermelho.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <Accordion
                type="multiple"
                value={openAccordionItems}
                onValueChange={setOpenAccordionItems}
                className="w-full"
              >
                <AccordionItem value="passageiro">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <User className="w-5 h-5 text-primary" />
                      Passageiro
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem className="md:col-span-1">
                            <FormLabel>
                              Nome <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Digite o nome do passageiro"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="periodo"
                        render={({ field }) => (
                          <FormItem className="md:col-span-1">
                            <FormLabel>
                              Período <span className="text-red-600">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o período" />
                                </SelectTrigger>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="veiculo_id"
                        render={({ field }) => (
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
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o veículo" />
                                </SelectTrigger>
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
                                  + Cadastrar Novo Veículo
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="escola_id"
                        render={({ field }) => (
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
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a escola" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {escolasModal.map((escola) => (
                                  <SelectItem key={escola.id} value={escola.id}>
                                    {escola.nome}
                                  </SelectItem>
                                ))}
                                <SelectItem
                                  value="add-new-school"
                                  className="font-semibold text-primary cursor-pointer"
                                >
                                  + Cadastrar Nova Escola
                                </SelectItem>
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
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Ativo</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="responsavel" className="mt-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <User className="w-5 h-5 text-primary" />
                      Responsável
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome_responsavel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Nome do Responsável{" "}
                              <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email_responsavel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              E-mail <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="exemplo@email.com"
                                {...field}
                              />
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
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cpf_responsavel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              CPF <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="000.000.000-00"
                                onChange={(e) =>
                                  field.onChange(cpfMask(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="cobranca" className="mt-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Cobrança
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="valor_cobranca"
                        render={({ field }) => (
                          <MoneyInput field={field} label="Valor" required />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dia_vencimento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Dia do Vencimento{" "}
                              <span className="text-red-600">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o dia" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {Array.from(
                                  { length: 31 },
                                  (_, i) => i + 1
                                ).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
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
                    {plano?.isCompletePlan && (
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="enviar_cobranca_automatica"
                          render={({ field }) => {
                            const mostrarAvisoFranquia = field.value && !validacaoFranquia.podeAtivar;
                            
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      if (checked && !validacaoFranquia.podeAtivar) {
                                        return;
                                      }
                                      field.onChange(checked);
                                    }}
                                    disabled={mostrarAvisoFranquia}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none flex-1">
                                  <FormLabel>
                                    Enviar cobranças automáticas
                                  </FormLabel>
                                  <FormDescription>
                                    As cobranças serão enviadas automaticamente todo mês para este passageiro.
                                  </FormDescription>
                                  {mostrarAvisoFranquia && (
                                    <AvisoInlineExcessoFranquia
                                      limiteAtual={validacaoFranquia.franquiaContratada}
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
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Registrar cobrança de {currentMonthInText()}?
                                </FormLabel>
                                {registerOnAsaas && (
                                  <FormDescription>
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
                <AccordionItem value="endereco" className="mt-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="w-5 h-5 text-primary" />
                      Endereço (Opcional)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <CepInput
                            field={field}
                            label="CEP"
                            className="md:col-span-2"
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="logradouro"
                        render={({ field }) => (
                          <FormItem className="md:col-span-4">
                            <FormLabel>Logradouro</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ex: Rua Comendador"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bairro"
                        render={({ field }) => (
                          <FormItem className="md:col-span-4">
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem className="md:col-span-4">
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Estado</FormLabel>
                              <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="UF" />
                                </SelectTrigger>
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
                                <SelectItem value="MT">Mato Grosso</SelectItem>
                                <SelectItem value="MS">
                                  Mato Grosso do Sul
                                </SelectItem>
                                <SelectItem value="MG">Minas Gerais</SelectItem>
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
                        render={({ field }) => (
                          <FormItem className="md:col-span-6">
                            <FormLabel>Referência</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Ex: próximo ao mercado"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="observacoes" className="mt-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="w-5 h-5 text-primary" />
                      Observações (Opcional)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pr-4 pb-4 pt-2 space-y-4">
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Alérgico a amendoim, entra pela porta lateral da escola, etc."
                              {...field}
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
                  variant="outline"
                  onClick={() => onClose()}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || form.formState.isSubmitting}
                  className="flex-1"
                >
                  {loading || form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : editingPassageiro ? (
                    "Atualizar"
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <LoadingOverlay active={refreshing || loading} text={loading ? "Salvando..." : "Aguarde..."} />
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
