-- Adiciona coluna para armazenar o JSON de resposta do PIX nas cobrancas entre pais e motoristas
ALTER TABLE cobrancas 
ADD COLUMN IF NOT EXISTS dados_auditoria_pagamento JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN cobrancas.dados_auditoria_pagamento IS 'Payload completo do webhook de pagamento para auditoria';
