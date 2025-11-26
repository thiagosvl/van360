export function formatarPlacaExibicao(placa: string): string {
    if (!placa) return "";
    const limpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (limpa.length === 7) {
        if (/^[A-Z]{3}\d{4}$/.test(limpa)) {
            return `${limpa.substring(0, 3)}-${limpa.substring(3)}`;
        }
        return limpa;
    }
    return limpa;
}

export function limparPlaca(valor: string): string {
    return valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function validarPlaca(valor: string): boolean {
    const limpa = limparPlaca(valor);
    return /^[A-Z]{3}\d{4}$/.test(limpa) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(limpa);
}

export function aplicarMascaraPlaca(valor: string): string {
    let v = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
  
    if (v.length < 4) {
      return v;
    }
  
    if (v.length > 7) {
      v = v.slice(0, 7);
    }
  
    if (v.length === 7) {
      return v.slice(0, 3) + "-" + v.slice(3);
    }
  
    return v;
  }

