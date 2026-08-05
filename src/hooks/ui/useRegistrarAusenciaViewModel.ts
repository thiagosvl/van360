import { useState, useMemo, useCallback, useEffect } from "react";
import { parseISO, isBefore, isSameDay } from "date-fns";

export interface RegistrarAusenciaParams {
  isOpen: boolean;
  lockedRotaId?: string;
  lockedPassageiro?: { id: string; nome: string };
  rotasList?: Array<{ id: string; nome: string }>;
  passageiroRotas?: Array<{ id: string; nome: string }>;
  routeDetailPassageiros?: Array<{ id: string; nome: string; escola_id?: string }>;
}

export interface AusenciaValidationErrors {
  rotaId?: string;
  passageiroId?: string;
  dataAusencia?: string;
  dataFimAusencia?: string;
}

/**
 * Valida datas de ausência (data inicial <= data final quando fornecida a data final)
 */
export function validarDatasAusencia(
  dataInicio: string,
  dataFim?: string
): { isValid: boolean; error?: string } {
  if (!dataInicio) {
    return { isValid: false, error: "Informe a data da ausência" };
  }

  if (dataFim) {
    try {
      const start = parseISO(dataInicio);
      const end = parseISO(dataFim);

      if (isBefore(end, start) && !isSameDay(end, start)) {
        return {
          isValid: false,
          error: "A data final deve ser igual ou posterior à data inicial",
        };
      }
    } catch {
      return { isValid: false, error: "Data inválida" };
    }
  }

  return { isValid: true };
}

/**
 * Gera o texto da notificação enviada aos monitores da rota
 */
export function gerarAvisoMonitores(
  alunoNome: string,
  dataInicio: string,
  dataFim?: string
): string {
  const dataFormatada =
    dataFim && dataFim !== dataInicio
      ? `no período de ${dataInicio} até ${dataFim}`
      : `no dia ${dataInicio}`;

  return `Aviso aos Monitores: O passageiro ${alunoNome} estará ausente ${dataFormatada}.`;
}

/**
 * Inicializa e calcula o estado inicial do formulário de ausência
 */
export function inicializarAusenciaState(params: RegistrarAusenciaParams) {
  const { lockedPassageiro, lockedRotaId, passageiroRotas = [], rotasList = [] } = params;

  const hasNoRoutesForStudent = !!lockedPassageiro && passageiroRotas.length === 0;
  const rotasDisponiveis = lockedPassageiro?.id ? passageiroRotas : rotasList;

  let passageiroId = "";
  let passageiroNomeSelected = "";
  let searchPassageiro = "";
  let rotaId = "";

  if (lockedPassageiro) {
    passageiroId = lockedPassageiro.id;
    passageiroNomeSelected = lockedPassageiro.nome;
    searchPassageiro = lockedPassageiro.nome;

    if (passageiroRotas.length === 1) {
      rotaId = passageiroRotas[0].id;
    }
  } else {
    rotaId = lockedRotaId || "";
  }

  return {
    passageiroId,
    passageiroNomeSelected,
    searchPassageiro,
    rotaId,
    hasNoRoutesForStudent,
    rotasDisponiveis,
  };
}

/**
 * Valida os campos obrigatórios do formulário de ausência
 */
export function validarFormularioAusencia(data: {
  rotaId: string;
  passageiroId: string;
  dataAusencia: string;
  dataFimAusencia?: string;
}): { isValid: boolean; errors: AusenciaValidationErrors } {
  const errors: AusenciaValidationErrors = {};

  if (!data.rotaId) errors.rotaId = "Selecione uma rota";
  if (!data.passageiroId) errors.passageiroId = "Selecione um passageiro";

  const dateCheck = validarDatasAusencia(data.dataAusencia, data.dataFimAusencia);
  if (!dateCheck.isValid && dateCheck.error) {
    if (!data.dataAusencia) {
      errors.dataAusencia = dateCheck.error;
    } else {
      errors.dataFimAusencia = dateCheck.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function useRegistrarAusenciaViewModel({
  isOpen,
  lockedRotaId,
  lockedPassageiro,
  rotasList = [],
  passageiroRotas = [],
  routeDetailPassageiros = [],
}: RegistrarAusenciaParams) {
  const initialState = useMemo(
    () =>
      inicializarAusenciaState({
        isOpen,
        lockedRotaId,
        lockedPassageiro,
        rotasList,
        passageiroRotas,
        routeDetailPassageiros,
      }),
    [isOpen, lockedRotaId, lockedPassageiro, rotasList, passageiroRotas, routeDetailPassageiros]
  );

  const [rotaId, setRotaId] = useState(initialState.rotaId);
  const [passageiroId, setPassageiroId] = useState(initialState.passageiroId);
  const [passageiroNomeSelected, setPassageiroNomeSelected] = useState(initialState.passageiroNomeSelected);
  const [searchPassageiro, setSearchPassageiro] = useState(initialState.searchPassageiro);
  const [dataAusencia, setDataAusencia] = useState("");
  const [dataFimAusencia, setDataFimAusencia] = useState("");
  const [notificarMonitores, setNotificarMonitores] = useState(true);
  const [errors, setErrors] = useState<AusenciaValidationErrors>({});

  const hasNoRoutesForStudent = initialState.hasNoRoutesForStudent;
  const rotasDisponiveis = initialState.rotasDisponiveis;

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setDataAusencia("");
      setDataFimAusencia("");
      setNotificarMonitores(true);

      const state = inicializarAusenciaState({
        isOpen,
        lockedRotaId,
        lockedPassageiro,
        rotasList,
        passageiroRotas,
        routeDetailPassageiros,
      });

      setPassageiroId(state.passageiroId);
      setPassageiroNomeSelected(state.passageiroNomeSelected);
      setSearchPassageiro(state.searchPassageiro);
      setRotaId(state.rotaId);
    }
  }, [isOpen, lockedPassageiro, lockedRotaId, passageiroRotas, rotasList, routeDetailPassageiros]);

  const handleRotaChange = (newRotaId: string) => {
    setRotaId(newRotaId);
    if (!lockedPassageiro) {
      setPassageiroId("");
      setPassageiroNomeSelected("");
      setSearchPassageiro("");
    }
    if (errors.rotaId) setErrors((prev) => ({ ...prev, rotaId: undefined }));
  };

  const handleSelectPassageiro = (p: { id: string; nome: string }) => {
    setPassageiroId(p.id);
    setPassageiroNomeSelected(p.nome);
    setSearchPassageiro(p.nome);
    if (errors.passageiroId) setErrors((prev) => ({ ...prev, passageiroId: undefined }));
  };

  const validateForm = useCallback((): boolean => {
    const result = validarFormularioAusencia({
      rotaId,
      passageiroId,
      dataAusencia,
      dataFimAusencia,
    });
    setErrors(result.errors);
    return result.isValid;
  }, [rotaId, passageiroId, dataAusencia, dataFimAusencia]);

  return {
    rotaId,
    setRotaId,
    passageiroId,
    setPassageiroId,
    passageiroNomeSelected,
    searchPassageiro,
    setSearchPassageiro,
    dataAusencia,
    setDataAusencia,
    dataFimAusencia,
    setDataFimAusencia,
    notificarMonitores,
    setNotificarMonitores,
    errors,
    setErrors,
    hasNoRoutesForStudent,
    rotasDisponiveis,
    handleRotaChange,
    handleSelectPassageiro,
    validarDatasAusencia,
    gerarAvisoMonitores,
    validateForm,
  };
}
