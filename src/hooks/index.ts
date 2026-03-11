// Business hooks
export { useAssinaturaPendente } from "./business/useAssinaturaPendente";
export { useFranchiseGate } from "./business/useFranchiseGate";
export { useGastosCalculations } from "./business/useGastosCalculations";
export { usePermissions } from "./business/usePermissions";
export { usePlanLimits } from "./business/usePlanLimits";
export { useProfile } from "./business/useProfile";
export { useSession } from "./business/useSession";
export { useUpgradeFranquia } from "./business/useUpgradeFranquia";

// UI hooks
export { useCobrancaActions } from "./ui/useCobrancaActions";
export { useContractGuard } from "./ui/useContractGuard";
export { useCustomPricePreview } from "./ui/useCustomPricePreview";
export { safeCloseDialog, useDialogClose } from "./ui/useDialogClose";
export { useFilters } from "./ui/useFilters";
export { useIsMobile } from "./ui/useIsMobile";
export { useLoadingState } from "./ui/useLoadingState";
export { usePixKeyGuard } from "./ui/usePixKeyGuard";
export { usePlanUpgrade } from "./ui/usePlanUpgrade";
export { useUpsellContent } from "./ui/useUpsellContent";

// Form hooks
export { usePassageiroForm } from "./form/usePassageiroForm";

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
export { useUsuarioResumo } from "./api/useUsuarioResumo";
export { useVeiculos } from "./api/useVeiculos";
export { useVeiculosWithFilters } from "./api/useVeiculosWithFilters";

// API hooks (mutations)
export { useGerarPixParaCobranca } from "./api/useAssinaturaCobrancaMutations";
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

