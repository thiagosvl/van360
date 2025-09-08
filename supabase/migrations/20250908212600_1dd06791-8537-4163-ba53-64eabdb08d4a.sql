-- Create initial admin user  
INSERT INTO public.usuarios (cpfcnpj, email, role) 
VALUES ('39542391838', 'thiago-svl@hotmail.com', 'admin')
ON CONFLICT (cpfcnpj) DO NOTHING;