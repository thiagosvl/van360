import { STORAGE_KEYS } from "@/constants";

export const PREPOSICOES_NOME = new Set(["de", "da", "do", "dos", "das", "e"]);

export const normalizeCompoundName = (name?: string): string => {
  if (!name) return "";
  return name.trim().replace(/\s*\/\s*/g, " / ");
};

export const formatShortName = (fullName?: string, includeSecond?: boolean) => {
  if (!fullName) return "";
  if (fullName.includes("/")) {
    return normalizeCompoundName(fullName);
  }

  const names = fullName.trim().split(/\s+/);

  if (includeSecond && names.length >= 2) {
    const result: string[] = [];
    let mainNameCount = 0;

    for (const name of names) {
      result.push(name);
      if (!PREPOSICOES_NOME.has(name.toLowerCase())) {
        mainNameCount++;
      }
      if (mainNameCount === 2) {
        break;
      }
    }

    return result.join(" ");
  }

  if (names.length <= 2) return fullName.trim();
  return names[0] || "";
};

export const formatFirstName = (fullName?: string) => {
  if (!fullName) return "Nome não informado";
  if (fullName.includes("/")) {
    return normalizeCompoundName(fullName);
  }

  const names = fullName.trim().split(/\s+/);
  return names[0] || "Nome não informado";
};

export const getInitials = (name?: string) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
};

export const getStoredFormatoNomeAluno = (): "curto" | "completo" => {
  if (typeof window === "undefined") return "curto";
  const stored = window.localStorage.getItem(STORAGE_KEYS.FORMATO_NOME_ALUNO);
  return stored === "completo" ? "completo" : "curto";
};

export const setStoredFormatoNomeAluno = (formato: "curto" | "completo"): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.FORMATO_NOME_ALUNO, formato);
  window.dispatchEvent(new CustomEvent("van360:formato_nome_aluno_changed", { detail: formato }));
};

export const formatNomeAlunoExibicao = (
  nome?: string | null,
  formato?: "curto" | "completo" | boolean
) => {
  if (!nome) return "";
  const formatoEfetivo = formato !== undefined ? formato : getStoredFormatoNomeAluno();
  const isCompleto = typeof formatoEfetivo === "boolean" ? formatoEfetivo : formatoEfetivo === "completo";
  return isCompleto ? nome.trim() : formatShortName(nome, true);
};

export const formatNomeResponsavelExibicao = (
  nome?: string | null,
  formato: "primeiro_nome" | "completo" | boolean = "primeiro_nome"
) => {
  if (!nome) return "Responsável não informado";
  const isShort = typeof formato === "boolean" ? formato : formato === "primeiro_nome";
  return isShort ? formatFirstName(nome) : nome;
};

export const formatNomeResponsavelCompletoExibicao = (nome?: string | null) => {
  if (!nome) return "Responsável não informado";
  return nome;
};

export const formatActivityDescription = (
  descricao?: string,
  formatoAluno?: "curto" | "completo"
): string => {
  if (!descricao) return "";

  let result = descricao;

  result = result.replace(
    /^(Pagamento manual de .*? do aluno) (.+?) (registrado\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatNomeAlunoExibicao(nome, formatoAluno)} ${suffix}`
  );

  result = result.replace(
    /^(Pagamento de .*? do aluno) (.+?) (desfeito pelo motorista\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatNomeAlunoExibicao(nome, formatoAluno)} ${suffix}`
  );

  result = result.replace(
    /^(Cobrança de .*? gerada como .*? para) (.+?)\.$/i,
    (_, prefix, nome) => `${prefix} ${formatNomeAlunoExibicao(nome, formatoAluno)}.`
  );

  result = result.replace(
    /^(Cobrança de .*? do aluno) (.+?) (editada pelo motorista\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatNomeAlunoExibicao(nome, formatoAluno)} ${suffix}`
  );

  result = result.replace(
    /^(Parcela de .*? do aluno) (.+?) (foi cancelada\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatNomeAlunoExibicao(nome, formatoAluno)} ${suffix}`
  );

  result = result.replace(
    /^(Parcela de .*? do aluno) (.+?) (foi reativada para pendente\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatNomeAlunoExibicao(nome, formatoAluno)} ${suffix}`
  );

  result = result.replace(
    /^Novo aluno (.+?) cadastrado\.$/i,
    (_, nome) => `Novo aluno ${formatNomeAlunoExibicao(nome, formatoAluno)} cadastrado.`
  );

  result = result.replace(
    /^Cadastro do aluno (.+?) atualizado\.$/i,
    (_, nome) => `Cadastro do aluno ${formatNomeAlunoExibicao(nome, formatoAluno)} atualizado.`
  );

  result = result.replace(
    /^Aluno (.+?) removido permanentemente\.$/i,
    (_, nome) => `Aluno ${formatNomeAlunoExibicao(nome, formatoAluno)} removido permanentemente.`
  );

  result = result.replace(
    /^Cadastro de (.+?) foi (ATIVADO|DESATIVADO)\.$/i,
    (_, nome, status) => `Cadastro de ${formatNomeAlunoExibicao(nome, formatoAluno)} foi ${status}.`
  );

  result = result.replace(
    /^Cadastro Pendente de \((.+?)\) aprovado como aluno\.$/i,
    (_, nome) => `Cadastro Pendente de (${formatNomeAlunoExibicao(nome, formatoAluno)}) aprovado como aluno.`
  );

  result = result.replace(
    /^Responsável (.+?) cadastrado para o aluno (.+?)\.$/i,
    (_, resp, aluno) => `Responsável ${formatFirstName(resp)} cadastrado para o aluno ${formatNomeAlunoExibicao(aluno, formatoAluno)}.`
  );

  result = result.replace(
    /^Dados do responsável do aluno (.+?) foram atualizados\.$/i,
    (_, aluno) => `Dados do responsável do aluno ${formatNomeAlunoExibicao(aluno, formatoAluno)} foram atualizados.`
  );

  result = result.replace(
    /^Responsável removido do cadastro do aluno (.+?)\.$/i,
    (_, aluno) => `Responsável removido do cadastro do aluno ${formatNomeAlunoExibicao(aluno, formatoAluno)}.`
  );

  result = result.replace(
    /^Responsável principal alterado para o aluno (.+?)\.$/i,
    (_, aluno) => `Responsável principal alterado para o aluno ${formatNomeAlunoExibicao(aluno, formatoAluno)}.`
  );

  result = result.replace(
    /^Notificações de rota (ativadas|desativadas) para responsável do aluno (.+?)\.$/i,
    (_, status, aluno) => `Notificações de rota ${status} para responsável do aluno ${formatNomeAlunoExibicao(aluno, formatoAluno)}.`
  );

  result = result.replace(
    /^Dados do responsável (adicional )?do aluno (.+?) atualizados pelo portal do responsável\.$/i,
    (_, adicional, aluno) => `Dados do responsável ${adicional || ""}do aluno ${formatNomeAlunoExibicao(aluno, formatoAluno)} atualizados pelo portal do responsável.`
  );

  result = result.replace(
    /^Responsável de (.+?) \((.+?)\) realizou a solicitação de cadastro\.$/i,
    (_, aluno, resp) => `Responsável de ${formatNomeAlunoExibicao(aluno, formatoAluno)} (${formatFirstName(resp)}) realizou a solicitação de cadastro.`
  );

  result = result.replace(
    /^Novo contrato gerado para (.+?)\.$/i,
    (_, aluno) => `Novo contrato gerado para ${formatNomeAlunoExibicao(aluno, formatoAluno)}.`
  );

  result = result.replace(
    /^Contrato em PDF importado para (.+?)\.$/i,
    (_, aluno) => `Contrato em PDF importado para ${formatNomeAlunoExibicao(aluno, formatoAluno)}.`
  );

  result = result.replace(
    /^Contrato de (.+?) foi assinado digitalmente pelo responsável\.$/i,
    (_, aluno) => `Contrato de ${formatNomeAlunoExibicao(aluno, formatoAluno)} foi assinado digitalmente pelo responsável.`
  );

  result = result.replace(
    /^(Lembrete de cobrança .*? disparado manualmente pelo administrador para) (.+?)\.$/i,
    (_, prefix, resp) => `${prefix} ${formatFirstName(resp)}.`
  );

  return result;
};
