-- Adiciona coluna para rastrear a taxa de intermediação (ex: 0.99) nas assinaturas
ALTER TABLE assinaturas_cobrancas 
ADD COLUMN IF NOT EXISTS taxa_intermediacao_banco NUMERIC(10,2) DEFAULT 0.00;

-- Adiciona coluna para armazenar o JSON de resposta do PIX (Payload completo para auditoria futura se precisar)
-- Opcional, mas recomendado já que o usuário mencionou "o que mais for preciso"
ALTER TABLE assinaturas_cobrancas 
ADD COLUMN IF NOT EXISTS dados_auditoria_pagamento JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN assinaturas_cobrancas.taxa_intermediacao_banco IS 'Valor da taxa cobrada pelo banco (ex: Inter) na transação PIX';
