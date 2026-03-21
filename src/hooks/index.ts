// Business hooks
export { useGastosCalculations } from "./business/useGastosCalculations";
export { useProfile } from "./business/useProfile";
export { useSession } from "./business/useSession";

// UI hooks
export { useCobrancaActions } from "./ui/useCobrancaActions";
export { safeCloseDialog, useDialogClose } from "./ui/useDialogClose";
export { useFilters } from "./ui/useFilters";
export { useIsMobile } from "./ui/useIsMobile";
export { useLoadingState } from "./ui/useLoadingState";

// Form hooks
export { usePassageiroForm } from "./form/usePassageiroForm";

// API hooks (queries)
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
export { usePrePassageiros } from "./api/usePrePassageiros";
export { useUsuarioResumo } from "./api/useUsuarioResumo";
export { useVeiculos } from "./api/useVeiculos";
export { useVeiculosWithFilters } from "./api/useVeiculosWithFilters";

// API hooks (mutations)
export {
    useCreateCobranca, useDeleteCobranca,
    useDesfazerPagamento, useEnviarNotificacaoCobranca, useRegistrarPagamentoManual, useToggleNotificacoesCobranca, useUpdateCobranca
} from "./api/useCobrancaMutations";
export {
    useContratos, useContratosKPIs, useCreateContrato, useDeleteContrato, usePreviewContrato, useReenviarContrato, useSubstituirContrato
} from "./api/useContratos";
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
