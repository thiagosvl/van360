export interface ConfiguracoesMotorista {
  id: string;
  usuario_id: string;

  horario_envio: string;
  mensagem_lembrete_antecipada?: string;
  mensagem_lembrete_dia?: string;
  mensagem_lembrete_atraso?: string;
  dias_antes_vencimento: number;
  dias_apos_vencimento: number;

  created_at: string;
  updated_at: string;
}
