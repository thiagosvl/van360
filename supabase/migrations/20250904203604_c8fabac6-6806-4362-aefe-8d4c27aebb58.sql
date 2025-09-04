-- Adicionar campo pagamento_manual na tabela cobrancas
ALTER TABLE public.cobrancas 
ADD COLUMN pagamento_manual boolean NOT NULL DEFAULT false;