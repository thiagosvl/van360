-- SQL para adicionar colunas à tabela 'public.usuarios'
ALTER TABLE public.usuarios
ADD COLUMN chave_pix TEXT NULL,
ADD COLUMN status_chave_pix VARCHAR(50) DEFAULT 'NAO_CADASTRADA' NOT NULL,
ADD COLUMN chave_pix_validada_em TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN nome_titular_pix_validado TEXT NULL,
ADD COLUMN cpf_cnpj_titular_pix_validado TEXT NULL;

-- SQL para criar a nova tabela 'public.pix_validacao_pendente'
CREATE TABLE public.pix_validacao_pendente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    x_id_idempotente TEXT NOT NULL UNIQUE,
    chave_pix_enviada TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Opcional: Adicionar índices para otimização de busca
CREATE INDEX idx_usuarios_status_chave_pix ON public.usuarios (status_chave_pix);
CREATE INDEX idx_pix_validacao_pendente_usuario_id ON public.pix_validacao_pendente (usuario_id);
CREATE INDEX idx_pix_validacao_pendente_x_id_idempotente ON public.pix_validacao_pendente (x_id_idempotente);

-- Opcional: Adicionar RLS (Row Level Security) para as novas tabelas, se aplicável
-- Exemplo para 'usuarios' (ajuste conforme suas políticas de RLS)
-- ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Usuários podem ver e atualizar suas próprias chaves PIX" ON public.usuarios
-- FOR ALL USING (auth.uid() = id);

-- Exemplo para 'pix_validacao_pendente' (ajuste conforme suas políticas de RLS)
-- ALTER TABLE public.pix_validacao_pendente ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Usuários podem ver suas próprias validações pendentes" ON public.pix_validacao_pendente
-- FOR ALL USING (auth.uid() = usuario_id);
