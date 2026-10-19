import { useCallback, useEffect, useState } from "react";
import {
  formatNomeAlunoExibicao,
  getStoredFormatoNomeAluno,
  setStoredFormatoNomeAluno,
} from "@/utils/formatters/name";
import { useProfile } from "./useProfile";
import { useSession } from "./useSession";

export function useAppPreferences() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [formatoNomeAluno, setFormatoAlunoState] = useState<"curto" | "completo">(
    () => profile?.configuracoes?.formato_nome_aluno || getStoredFormatoNomeAluno()
  );

  useEffect(() => {
    if (profile?.configuracoes?.formato_nome_aluno) {
      const formatoBanco = profile.configuracoes.formato_nome_aluno;
      setStoredFormatoNomeAluno(formatoBanco);
      setFormatoAlunoState(formatoBanco);
    }
  }, [profile?.configuracoes?.formato_nome_aluno]);

  useEffect(() => {
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<"curto" | "completo">;
      if (customEvent.detail) {
        setFormatoAlunoState(customEvent.detail);
      } else {
        setFormatoAlunoState(getStoredFormatoNomeAluno());
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === null || e.key === "van360:formato_nome_aluno") {
        setFormatoAlunoState(getStoredFormatoNomeAluno());
      }
    };

    window.addEventListener("van360:formato_nome_aluno_changed", handleCustomChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("van360:formato_nome_aluno_changed", handleCustomChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setFormatoNomeAluno = useCallback((formato: "curto" | "completo") => {
    setStoredFormatoNomeAluno(formato);
    setFormatoAlunoState(formato);
  }, []);

  const formatoEfetivoAluno: "curto" | "completo" =
    profile?.configuracoes?.formato_nome_aluno || formatoNomeAluno;

  const formatAlunoNome = useCallback(
    (nome?: string | null) => formatNomeAlunoExibicao(nome, formatoEfetivoAluno),
    [formatoEfetivoAluno]
  );

  const formatoNomeResponsavel: "primeiro_nome" | "completo" =
    profile?.configuracoes?.formato_nome_responsavel || "primeiro_nome";

  const exibirTelefoneListaAlunos: boolean =
    profile?.configuracoes?.exibir_telefone_lista_alunos ?? false;

  return {
    formatoNomeAluno: formatoEfetivoAluno,
    isNomeAlunoCompleto: formatoEfetivoAluno === "completo",
    setFormatoNomeAluno,
    formatAlunoNome,
    formatoNomeResponsavel,
    isNomeCompleto: formatoNomeResponsavel === "completo",
    exibirTelefoneListaAlunos,
  };
}

