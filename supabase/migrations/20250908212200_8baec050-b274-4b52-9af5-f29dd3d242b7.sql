-- Create RPC function to get user by CPF/CNPJ
CREATE OR REPLACE FUNCTION public.get_user_by_cpf(cpf_cnpj text)
RETURNS TABLE(email text, role text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.email, u.role
  FROM public.usuarios u
  WHERE u.cpfCnpj = cpf_cnpj;
END;
$$;