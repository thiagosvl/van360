-- Create admins table
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  auth_uid UUID UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all relevant tables
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passageiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;

-- Make auth_uid unique (but keep nullable for existing records)
ALTER TABLE public.motoristas ADD CONSTRAINT motoristas_auth_uid_unique UNIQUE (auth_uid);

-- RLS Policies for motoristas (only if auth_uid is not null)
CREATE POLICY "Motoristas can read their own record" 
ON public.motoristas 
FOR SELECT 
USING (auth.uid() = auth_uid);

CREATE POLICY "Motoristas can update their own record" 
ON public.motoristas 
FOR UPDATE 
USING (auth.uid() = auth_uid);

-- RLS Policies for admins
CREATE POLICY "Admins can read admin records" 
ON public.admins 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE auth_uid = auth.uid()
  )
);

-- RLS Policies for passageiros (motorista can only see their passengers)
CREATE POLICY "Motoristas can manage their passengers" 
ON public.passageiros 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.motoristas 
    WHERE motoristas.id = passageiros.motorista_id 
    AND motoristas.auth_uid = auth.uid()
  )
);

-- RLS Policies for cobrancas (via passageiros relationship)
CREATE POLICY "Motoristas can manage charges for their passengers" 
ON public.cobrancas 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.passageiros p
    JOIN public.motoristas m ON m.id = p.motorista_id
    WHERE p.id = cobrancas.passageiro_id 
    AND m.auth_uid = auth.uid()
  )
);

-- RLS Policies for escolas (motoristas can see schools of their passengers)
CREATE POLICY "Motoristas can view schools of their passengers" 
ON public.escolas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.passageiros p
    JOIN public.motoristas m ON m.id = p.motorista_id
    WHERE p.escola_id = escolas.id 
    AND m.auth_uid = auth.uid()
  )
);

-- Add trigger for admins updated_at
CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();