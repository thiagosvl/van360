export interface ColunaCSV<T> {
  chave: keyof T | string;
  titulo: string;
}

export function sanitizarCampoCSV(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  const texto = String(valor);
  if (/[",;\n\r]/.test(texto) || texto.startsWith(" ") || texto.endsWith(" ")) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export function gerarConteudoCSV<T extends Record<string, unknown>>(
  colunas: ColunaCSV<T>[],
  dados: T[],
  delimitador: string = ","
): string {
  if (!colunas || colunas.length === 0) return "";

  const cabecalho = colunas
    .map((col) => sanitizarCampoCSV(col.titulo))
    .join(delimitador);

  const linhas = dados.map((item) => {
    return colunas
      .map((col) => {
        const chaveStr = String(col.chave);
        const valor = item[chaveStr];
        return sanitizarCampoCSV(valor);
      })
      .join(delimitador);
  });

  return [cabecalho, ...linhas].join("\n");
}

export function exportarParaCSV<T extends Record<string, unknown>>(
  nomeArquivo: string,
  colunas: ColunaCSV<T>[],
  dados: T[],
  delimitador: string = ","
): string {
  const conteudo = gerarConteudoCSV(colunas, dados, delimitador);

  if (typeof window !== "undefined" && typeof document !== "undefined" && document.createElement) {
    const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", nomeArquivo.endsWith(".csv") ? nomeArquivo : `${nomeArquivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return conteudo;
}
