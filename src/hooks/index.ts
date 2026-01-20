// Business hooks
export { useAssinaturaPendente } from "./business/useAssinaturaPendente";
export { usePermissions } from "./business/usePermissions";
export { usePlanLimits } from "./business/usePlanLimits";
export { useProfile } from "./business/useProfile";
export { useSession } from "./business/useSession";

// UI hooks
export { safeCloseDialog, useDialogClose } from "./ui/useDialogClose";
export { useFilters } from "./ui/useFilters";
export { useIsMobile } from "./ui/useIsMobile";
export { useLoadingState } from "./ui/useLoadingState";
export { usePassageiroForm } from "./ui/usePassageiroForm";

// API hooks (queries)
export { useAssinaturaCobranca, useAssinaturaCobrancas } from "./api/useAssinaturaCobrancas";
export { useAvailableYears } from "./api/useAvailableYears";
export { useBuscarResponsavel } from "./api/useBuscarResponsavel";
export { useCobranca, useCobrancaNotificacoes } from "./api/useCobranca";
export { useCobrancas } from "./api/useCobrancas";
export { useCobrancasByPassageiro } from "./api/useCobrancasByPassageiro";
export { useEscolas } from "./api/useEscolas";
export { useEscolasWithFilters } from "./api/useEscolasWithFilters";
export { useGastos } from "./api/useGastos";
export { usePassageiro } from "./api/usePassageiro";
export { usePassageiros } from "./api/usePassageiros";
export { useCalcularPrecoPreview, usePlanos } from "./api/usePlanos";
export { usePrePassageiros } from "./api/usePrePassageiros";
export { useVeiculos } from "./api/useVeiculos";
export { useVeiculosWithFilters } from "./api/useVeiculosWithFilters";

// API hooks (mutations)
export { useGerarPixParaCobranca } from "./api/useAssinaturaCobrancaMutations";
export {
    useCreateCobranca, useDeleteCobranca,
    useDesfazerPagamento, useEnviarNotificacaoCobranca, useRegistrarPagamentoManual, useToggleNotificacoesCobranca, useUpdateCobranca
} from "./api/useCobrancaMutations";
export {
    useCreateEscola, useDeleteEscola,
    useToggleAtivoEscola, useUpdateEscola
} from "./api/useEscolaMutations";
export {
    useCreateGasto, useDeleteGasto, useUpdateGasto
} from "./api/useGastoMutations";
export {
    useCreatePassageiro, useDeletePassageiro, useFinalizePreCadastro, useToggleAtivoPassageiro, useUpdatePassageiro
} from "./api/usePassageiroMutations";
export {
    useCreatePrePassageiro,
    useDeletePrePassageiro
} from "./api/usePrePassageiroMutations";
export {
    useCreateVeiculo, useDeleteVeiculo,
    useToggleAtivoVeiculo, useUpdateVeiculo
} from "./api/useVeiculoMutations";

