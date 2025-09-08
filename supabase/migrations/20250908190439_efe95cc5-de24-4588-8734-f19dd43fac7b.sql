-- Disable RLS and drop all policies to simplify the system

-- Disable RLS on all tables
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas_motoristas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.escolas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.passageiros DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can insert their own record" ON public.admins;
DROP POLICY IF EXISTS "Admins can read their own record" ON public.admins;
DROP POLICY IF EXISTS "Admins can update their own record" ON public.admins;

DROP POLICY IF EXISTS "Motoristas can manage their subscriptions" ON public.assinaturas_motoristas;

DROP POLICY IF EXISTS "Motoristas can manage charges for their passengers" ON public.cobrancas;
DROP POLICY IF EXISTS "Permitir acesso total às cobranças" ON public.cobrancas;

DROP POLICY IF EXISTS "Motoristas can view schools of their passengers" ON public.escolas;
DROP POLICY IF EXISTS "Permitir acesso total às escolas" ON public.escolas;

DROP POLICY IF EXISTS "Motoristas can read their own record" ON public.motoristas;
DROP POLICY IF EXISTS "Motoristas can update their own record" ON public.motoristas;

DROP POLICY IF EXISTS "Motoristas can manage their passengers" ON public.passageiros;
DROP POLICY IF EXISTS "Permitir acesso total aos alunos" ON public.passageiros;