-- Fix column name in usuarios table
ALTER TABLE public.usuarios RENAME COLUMN cpfCnpj TO cpfcnpj;

-- Create initial admin user
INSERT INTO public.usuarios (cpfcnpj, email, role) 
VALUES ('39542391838', 'thiago-svl@hotmail.com', 'admin')
ON CONFLICT (cpfcnpj) DO NOTHING;