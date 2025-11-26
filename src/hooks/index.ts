// Business hooks
export { useSession } from "./business/useSession";
export { useProfile } from "./business/useProfile";
export { useAssinaturaPendente } from "./business/useAssinaturaPendente";
export { useValidarFranquia } from "./business/useValidarFranquia";
export { useLimites } from "./business/useLimites";

// UI hooks
export { useIsMobile } from "./ui/use-mobile";
export { useDialogClose, safeCloseDialog } from "./ui/useDialogClose";
export { useLoadingState } from "./ui/useLoadingState";
export { useFilters } from "./ui/useFilters";

// Permission hooks
export { usePageActions } from "./permissions/usePageActions";

// API hooks (queries)
export { useCobrancas } from "./api/useCobrancas";
export { useCobranca, useCobrancaNotificacoes } from "./api/useCobranca";
export { usePassageiros } from "./api/usePassageiros";
export { usePassageiro } from "./api/usePassageiro";
export { usePassageiroContagem } from "./api/usePassageiroContagem";
export { useCobrancasByPassageiro } from "./api/useCobrancasByPassageiro";
export { useAvailableYears } from "./api/useAvailableYears";
export { useEscolas } from "./api/useEscolas";
export { useEscolasWithFilters } from "./api/useEscolasWithFilters";
export { useVeiculos } from "./api/useVeiculos";
export { useVeiculosWithFilters } from "./api/useVeiculosWithFilters";
export { useGastos } from "./api/useGastos";
export { usePrePassageiros } from "./api/usePrePassageiros";
export { usePlanos, useCalcularPrecoPreview } from "./api/usePlanos";
export { useAssinaturaCobrancas, useAssinaturaCobranca } from "./api/useAssinaturaCobrancas";

// API hooks (mutations)
export {
  useCreateCobranca,
  useUpdateCobranca,
  useDeleteCobranca,
  useDesfazerPagamento,
  useRegistrarPagamentoManual,
  useEnviarNotificacaoCobranca,
  useToggleNotificacoesCobranca,
} from "./api/useCobrancaMutations";
export {
  useCreatePassageiro,
  useUpdatePassageiro,
  useDeletePassageiro,
  useToggleAtivoPassageiro,
  useFinalizePreCadastro,
} from "./api/usePassageiroMutations";
export {
  useCreateEscola,
  useUpdateEscola,
  useDeleteEscola,
  useToggleAtivoEscola,
} from "./api/useEscolaMutations";
export {
  useCreateVeiculo,
  useUpdateVeiculo,
  useDeleteVeiculo,
  useToggleAtivoVeiculo,
} from "./api/useVeiculoMutations";
export {
  useCreateGasto,
  useUpdateGasto,
  useDeleteGasto,
} from "./api/useGastoMutations";
export {
  useCreatePrePassageiro,
  useDeletePrePassageiro,
} from "./api/usePrePassageiroMutations";
export { useGerarPixParaCobranca } from "./api/useAssinaturaCobrancaMutations";

