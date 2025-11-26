export function verificarLimitePassageiros(plano, totalPassageiros) {
  if (!plano.permite_cobrancas && plano.limite_passageiros > 0) {
    return totalPassageiros < plano.limite_passageiros;
  }
  return true;
}
