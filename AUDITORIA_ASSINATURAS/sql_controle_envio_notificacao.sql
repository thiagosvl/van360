-- Adiciona coluna para controlar se a cobrança já foi enviada (notificada) ao responsável
-- Isso ajuda a decidir se precisamos reenviar cobrança após edição de valor/vencimento
ALTER TABLE public.cobrancas
ADD COLUMN IF NOT EXISTS data_envio_notificacao TIMESTAMP;

-- Criar índice para consultas rápidas de cobranças não enviadas
CREATE INDEX IF NOT EXISTS idx_cobrancas_data_envio_notificacao ON public.cobrancas (data_envio_notificacao);

COMMENT ON COLUMN public.cobrancas.data_envio_notificacao IS 'Data e hora do último envio de notificação (Email/Zap) para esta cobrança';
