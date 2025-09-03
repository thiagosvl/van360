-- Adicionar novos campos de endereço para passageiros
ALTER TABLE public.passageiros 
ADD COLUMN rua TEXT,
ADD COLUMN numero TEXT,
ADD COLUMN bairro TEXT,
ADD COLUMN cidade TEXT,
ADD COLUMN estado TEXT,
ADD COLUMN cep TEXT,
ADD COLUMN referencia TEXT;

-- Adicionar tipo de pagamento para cobranças
ALTER TABLE public.cobrancas 
ADD COLUMN tipo_pagamento TEXT CHECK (tipo_pagamento IN ('pix', 'cartao', 'dinheiro'));