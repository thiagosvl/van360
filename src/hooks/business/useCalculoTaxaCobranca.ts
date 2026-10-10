export interface ParametrosCalculoTaxa {
  valorMensalidade: number;
  taxaPlataforma: number;
}

export interface ResultadoCalculoTaxa {
  valorCobrancaPai: number;
  taxaPlataforma: number;
  valorLiquidoMotorista: number;
}

export function calcularDivisaoCobranca({
  valorMensalidade,
  taxaPlataforma,
}: ParametrosCalculoTaxa): ResultadoCalculoTaxa {
  const valorOriginal = Number(valorMensalidade) || 0;
  const taxa = Number(taxaPlataforma) || 0;

  return {
    valorCobrancaPai: Number(valorOriginal.toFixed(2)),
    taxaPlataforma: taxa,
    valorLiquidoMotorista: Number(Math.max(0, valorOriginal - taxa).toFixed(2)),
  };
}
