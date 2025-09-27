export interface PaymentStats {
  pix: { count: number; total: number };
  cartao: { count: number; total: number };
  dinheiro: { count: number; total: number };
  transferencia: { count: number; total: number };
  boleto: { count: number; total: number };
}