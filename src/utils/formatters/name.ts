const PREPOSICOES_NOME = new Set(["de", "da", "do", "dos", "das", "e"]);

export const formatShortName = (fullName?: string, includeSecond?: boolean) => {
  if (!fullName) return "";
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
  const names = fullName.trim().split(/\s+/);
  return names[0] || "Nome não informado";
};

export const getInitials = (name?: string) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
};

export const formatNomeResponsavelExibicao = (nome?: string | null, shortName: boolean = true) => {
  if (!nome) return "Responsável não informado";
  return shortName ? formatFirstName(nome) : nome;
};

export const formatNomeResponsavelCompletoExibicao = (nome?: string | null) => {
  if (!nome) return "Responsável não informado";
  return nome;
};

export const formatActivityDescription = (descricao?: string): string => {
  if (!descricao) return "";

  let result = descricao;

  result = result.replace(
    /^(Pagamento manual de .*? do aluno) (.+?) (registrado\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatShortName(nome, true)} ${suffix}`
  );

  result = result.replace(
    /^(Pagamento de .*? do aluno) (.+?) (desfeito pelo motorista\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatShortName(nome, true)} ${suffix}`
  );

  result = result.replace(
    /^(Cobrança de .*? gerada como .*? para) (.+?)\.$/i,
    (_, prefix, nome) => `${prefix} ${formatShortName(nome, true)}.`
  );

  result = result.replace(
    /^(Cobrança de .*? do aluno) (.+?) (editada pelo motorista\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatShortName(nome, true)} ${suffix}`
  );

  result = result.replace(
    /^(Parcela de .*? do aluno) (.+?) (foi cancelada\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatShortName(nome, true)} ${suffix}`
  );

  result = result.replace(
    /^(Parcela de .*? do aluno) (.+?) (foi reativada para pendente\.)$/i,
    (_, prefix, nome, suffix) => `${prefix} ${formatShortName(nome, true)} ${suffix}`
  );

  result = result.replace(
    /^Novo aluno (.+?) cadastrado\.$/i,
    (_, nome) => `Novo aluno ${formatShortName(nome, true)} cadastrado.`
  );

  result = result.replace(
    /^Cadastro do aluno (.+?) atualizado\.$/i,
    (_, nome) => `Cadastro do aluno ${formatShortName(nome, true)} atualizado.`
  );

  result = result.replace(
    /^Aluno (.+?) removido permanentemente\.$/i,
    (_, nome) => `Aluno ${formatShortName(nome, true)} removido permanentemente.`
  );

  result = result.replace(
    /^Cadastro de (.+?) foi (ATIVADO|DESATIVADO)\.$/i,
    (_, nome, status) => `Cadastro de ${formatShortName(nome, true)} foi ${status}.`
  );

  result = result.replace(
    /^Cadastro Pendente de \((.+?)\) aprovado como aluno\.$/i,
    (_, nome) => `Cadastro Pendente de (${formatShortName(nome, true)}) aprovado como aluno.`
  );

  result = result.replace(
    /^Responsável (.+?) cadastrado para o aluno (.+?)\.$/i,
    (_, resp, aluno) => `Responsável ${formatFirstName(resp)} cadastrado para o aluno ${formatShortName(aluno, true)}.`
  );

  result = result.replace(
    /^Dados do responsável do aluno (.+?) foram atualizados\.$/i,
    (_, aluno) => `Dados do responsável do aluno ${formatShortName(aluno, true)} foram atualizados.`
  );

  result = result.replace(
    /^Responsável removido do cadastro do aluno (.+?)\.$/i,
    (_, aluno) => `Responsável removido do cadastro do aluno ${formatShortName(aluno, true)}.`
  );

  result = result.replace(
    /^Responsável principal alterado para o aluno (.+?)\.$/i,
    (_, aluno) => `Responsável principal alterado para o aluno ${formatShortName(aluno, true)}.`
  );

  result = result.replace(
    /^Notificações de rota (ativadas|desativadas) para responsável do aluno (.+?)\.$/i,
    (_, status, aluno) => `Notificações de rota ${status} para responsável do aluno ${formatShortName(aluno, true)}.`
  );

  result = result.replace(
    /^Dados do responsável (adicional )?do aluno (.+?) atualizados pelo portal do responsável\.$/i,
    (_, adicional, aluno) => `Dados do responsável ${adicional || ""}do aluno ${formatShortName(aluno, true)} atualizados pelo portal do responsável.`
  );

  result = result.replace(
    /^Responsável de (.+?) \((.+?)\) realizou a solicitação de cadastro\.$/i,
    (_, aluno, resp) => `Responsável de ${formatShortName(aluno, true)} (${formatFirstName(resp)}) realizou a solicitação de cadastro.`
  );

  result = result.replace(
    /^Novo contrato gerado para (.+?)\.$/i,
    (_, aluno) => `Novo contrato gerado para ${formatShortName(aluno, true)}.`
  );

  result = result.replace(
    /^Contrato em PDF importado para (.+?)\.$/i,
    (_, aluno) => `Contrato em PDF importado para ${formatShortName(aluno, true)}.`
  );

  result = result.replace(
    /^Contrato de (.+?) foi assinado digitalmente pelo responsável\.$/i,
    (_, aluno) => `Contrato de ${formatShortName(aluno, true)} foi assinado digitalmente pelo responsável.`
  );

  result = result.replace(
    /^(Lembrete de cobrança .*? disparado manualmente pelo administrador para) (.+?)\.$/i,
    (_, prefix, resp) => `${prefix} ${formatFirstName(resp)}.`
  );

  return result;
};
