export interface ParametrosCalculoTaxa {
  valorMensalidade: number;
  taxaPlataforma: number;
  repassarAoPai: boolean;
}

export interface ResultadoCalculoTaxa {
  valorCobrancaPai: number;
  taxaPlataforma: number;
  valorLiquidoMotorista: number;
  repassarAoPai: boolean;
}

export function calcularDivisaoCobranca({
  valorMensalidade,
  taxaPlataforma,
  repassarAoPai
}: ParametrosCalculoTaxa): ResultadoCalculoTaxa {
  const valorOriginal = Number(valorMensalidade) || 0;
  const taxa = Number(taxaPlataforma) || 0;

  if (repassarAoPai) {
    return {
      valorCobrancaPai: Number((valorOriginal + taxa).toFixed(2)),
      taxaPlataforma: taxa,
      valorLiquidoMotorista: Number(valorOriginal.toFixed(2)),
      repassarAoPai: true
    };
  }

  return {
    valorCobrancaPai: Number(valorOriginal.toFixed(2)),
    taxaPlataforma: taxa,
    valorLiquidoMotorista: Number(Math.max(0, valorOriginal - taxa).toFixed(2)),
    repassarAoPai: false
  };
}
