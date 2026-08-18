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
  if (!fullName) return "Não informado";
  const names = fullName.trim().split(/\s+/);
  return names[0] || "Não informado";
};

export const getInitials = (name?: string) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
};

export const formatNomeResponsavelExibicao = (nome?: string | null, shortName: boolean = true) => {
  if (!nome) return "Não informado";
  return shortName ? formatFirstName(nome) : nome;
};

export const formatNomeResponsavelCompletoExibicao = (nome?: string | null) => {
  if (!nome) return "Não informado";
  return nome;
};
