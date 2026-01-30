const REGEX_PLACA_ANTIGA = /^[A-Z]{3}[0-9]{4}$/;
const REGEX_PLACA_MERCOSUL = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

/**
 * Formata uma placa para exibição (com hífen se for padrão antigo)
 */
export function formatarPlacaExibicao(placa: string): string {
    if (!placa) return "";
    const limpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    if (REGEX_PLACA_ANTIGA.test(limpa)) {
        return `${limpa.substring(0, 3)}-${limpa.substring(3)}`;
    }
    
    return limpa; // Mercosul ou placa incompleta/inválida exibe sem máscara especial
}

/**
 * Remove caracteres especiais e padroniza para maiúsculas
 */
export function limparPlaca(valor: string): string {
    return (valor || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Valida se a placa segue o padrão nacional (Antigo ou Mercosul)
 */
export function validarPlaca(valor: string): boolean {
    const limpa = limparPlaca(valor);
    return REGEX_PLACA_ANTIGA.test(limpa) || REGEX_PLACA_MERCOSUL.test(limpa);
}

/**
 * Aplica máscara em tempo de digitação. 
 * Só insere o hífen se detectado que NÃO é padrão Mercosul.
 */
export function aplicarMascaraPlaca(valor: string): string {
    const v = limparPlaca(valor).slice(0, 7);
  
    if (v.length <= 3) return v;

    // Se no 5º caractere (índice 4) tivermos uma letra, é Mercosul (ABC1D23)
    // Se for número, pode ser Antigo (ABC-1234)
    const isMercosul = v.length >= 5 && isNaN(Number(v[4]));

    if (isMercosul) {
        return v; // Mercosul não usa hífen
    }

    if (v.length > 3) {
        // Se ainda não temos 5 caracteres, assumimos o hífen preventivamente (padrão mais comum)
        // Mas se o 4º caractere for digitado e o 5º for letra, o formatador de exibição ou blur limpa.
        // Para uma máscara fluida, apenas adicionamos o hífen se for padrão antigo completo ou se estivermos digitando números.
        return `${v.slice(0, 3)}-${v.slice(3)}`;
    }
  
    return v;
}

