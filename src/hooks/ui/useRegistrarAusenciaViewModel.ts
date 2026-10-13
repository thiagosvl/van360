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
  rotasIds?: string;
  passageiroId?: string;
  dataAusencia?: string;
  dataFimAusencia?: string;
}

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

export function gerarAvisoMonitores(
  alunoNome: string,
  dataInicio: string,
  dataFim?: string
): string {
  const dataFormatada =
    dataFim && dataFim !== dataInicio
      ? `no período de ${dataInicio} até ${dataFim}`
      : `no dia ${dataInicio}`;

  return `Aviso aos Monitores: O aluno ${alunoNome} estará ausente ${dataFormatada}.`;
}

export function inicializarAusenciaState(params: RegistrarAusenciaParams) {
  const { lockedPassageiro, lockedRotaId, passageiroRotas = [], rotasList = [] } = params;

  const hasNoRoutesForStudent = Boolean(lockedPassageiro && passageiroRotas.length === 0);
  const rotasDisponiveis = lockedPassageiro?.id ? passageiroRotas : rotasList;

  let passageiroId = "";
  let passageiroNomeSelected = "";
  let searchPassageiro = "";
  let rotasIds: string[] = [];

  if (lockedPassageiro) {
    passageiroId = lockedPassageiro.id;
    passageiroNomeSelected = lockedPassageiro.nome;
    searchPassageiro = lockedPassageiro.nome;
    if (passageiroRotas.length === 1) {
      rotasIds = [passageiroRotas[0].id];
    }
  } else if (lockedRotaId) {
    rotasIds = [lockedRotaId];
  } else if (rotasList.length === 1) {
    rotasIds = [rotasList[0].id];
  }

  return {
    passageiroId,
    passageiroNomeSelected,
    searchPassageiro,
    rotasIds,
    hasNoRoutesForStudent,
    rotasDisponiveis,
  };
}

export function validarFormularioAusencia(data: {
  rotasIds: string[];
  passageiroId: string;
  dataAusencia: string;
  dataFimAusencia?: string;
}): { isValid: boolean; errors: AusenciaValidationErrors } {
  const errors: AusenciaValidationErrors = {};

  if (!data.rotasIds || data.rotasIds.length === 0) {
    errors.rotasIds = "Selecione ao menos uma rota";
    errors.rotaId = "Selecione ao menos uma rota";
  }
  if (!data.passageiroId) {
    errors.passageiroId = "Selecione um aluno";
  }

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

  const [rotasIds, setRotasIds] = useState<string[]>(initialState.rotasIds);
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
      setRotasIds(state.rotasIds);
    }
  }, [isOpen, lockedPassageiro, lockedRotaId, passageiroRotas, rotasList, routeDetailPassageiros]);

  useEffect(() => {
    if (isOpen && rotasDisponiveis.length === 1 && rotasIds.length === 0) {
      setRotasIds([rotasDisponiveis[0].id]);
    }
  }, [isOpen, rotasDisponiveis, rotasIds.length]);

  const handleRotasChange = (newRotasIds: string[]) => {
    setRotasIds(newRotasIds);
    if (errors.rotasIds || errors.rotaId) {
      setErrors((prev) => ({ ...prev, rotasIds: undefined, rotaId: undefined }));
    }
  };

  const handleSelectPassageiro = (p: { id: string; nome: string }) => {
    setPassageiroId(p.id);
    setPassageiroNomeSelected(p.nome);
    setSearchPassageiro(p.nome);
    if (errors.passageiroId) setErrors((prev) => ({ ...prev, passageiroId: undefined }));
  };

  const validateForm = useCallback((): boolean => {
    const result = validarFormularioAusencia({
      rotasIds,
      passageiroId,
      dataAusencia,
      dataFimAusencia,
    });
    setErrors(result.errors);
    return result.isValid;
  }, [rotasIds, passageiroId, dataAusencia, dataFimAusencia]);

  return {
    rotasIds,
    setRotasIds,
    rotaId: rotasIds[0] || "",
    setRotaId: (id: string) => setRotasIds(id ? [id] : []),
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
    handleRotasChange,
    handleSelectPassageiro,
    validarDatasAusencia,
    gerarAvisoMonitores,
    validateForm,
  };
}
