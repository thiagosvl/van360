// Business hooks
export { useAssinaturaPendente } from "./business/useAssinaturaPendente";
export { useLimites } from "./business/useLimites";
export { useProfile } from "./business/useProfile";
export { useSession } from "./business/useSession";
export { useValidarFranquia } from "./business/useValidarFranquia";

// UI hooks
export { useIsMobile } from "./ui/use-mobile";
export { safeCloseDialog, useDialogClose } from "./ui/useDialogClose";
export { useFilters } from "./ui/useFilters";
export { useLoadingState } from "./ui/useLoadingState";
export { usePassageiroDialogs } from "./ui/usePassageiroDialogs";
export { usePassageiroForm } from "./ui/usePassageiroForm";

// Permission hooks
export { usePageActions } from "./permissions/usePageActions";

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
export { usePassageiroContagem } from "./api/usePassageiroContagem";
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

