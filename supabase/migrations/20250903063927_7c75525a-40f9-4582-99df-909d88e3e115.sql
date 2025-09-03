
-- 1) Atualizar dados existentes para nova convenção
UPDATE public.cobrancas
SET status = 'pago'
WHERE status = 'em_dia';

-- 2) Recriar o CHECK constraint do status SEM 'em_dia'
ALTER TABLE public.cobrancas
  DROP CONSTRAINT IF EXISTS cobrancas_status_check;

ALTER TABLE public.cobrancas
  ADD CONSTRAINT cobrancas_status_check
  CHECK (status IN ('pendente', 'pago', 'atrasado'));

-- 3) Limpar valores 'Outro' em tipo_pagamento
UPDATE public.cobrancas
SET tipo_pagamento = NULL
WHERE tipo_pagamento = 'Outro';

-- 4) Recriar o CHECK constraint de tipo_pagamento SEM 'Outro'
-- Inclui alguns valores legados para compatibilidade (minúsculos/sem acento)
ALTER TABLE public.cobrancas
  DROP CONSTRAINT IF EXISTS cobrancas_tipo_pagamento_check;

ALTER TABLE public.cobrancas
  ADD CONSTRAINT cobrancas_tipo_pagamento_check
  CHECK (
    tipo_pagamento IS NULL OR
    tipo_pagamento IN (
      'PIX',
      'Dinheiro',
      'Cartão de Débito',
      'Cartão de Crédito',
      'Transferência',
      -- legados/compatibilidade:
      'pix',
      'dinheiro',
      'cartao',
      'Cartao de Débito',
      'Cartao de Crédito',
      'Transferencia'
    )
  );
