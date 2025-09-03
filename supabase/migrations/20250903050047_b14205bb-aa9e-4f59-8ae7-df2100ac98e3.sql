-- Criar tabela de escolas
CREATE TABLE public.escolas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  rua TEXT,
  numero TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  referencia TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;

-- Criar policy para acesso total às escolas
CREATE POLICY "Permitir acesso total às escolas" 
ON public.escolas 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Adicionar coluna escola_id na tabela passageiros
ALTER TABLE public.passageiros 
ADD COLUMN escola_id UUID REFERENCES public.escolas(id);

-- Criar trigger para atualizar updated_at nas escolas
CREATE TRIGGER update_escolas_updated_at
BEFORE UPDATE ON public.escolas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();