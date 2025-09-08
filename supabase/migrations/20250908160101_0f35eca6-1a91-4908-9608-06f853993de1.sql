-- Create functions to work with motoristas table since it's not in the current types

-- Function to list motoristas
CREATE OR REPLACE FUNCTION get_motoristas_list()
RETURNS TABLE (
  id uuid,
  nome text,
  cpfCnpj text,
  email text,
  telefone text,
  auth_uid uuid,
  asaas_subaccount_id text,
  asaas_subaccount_api_key text,
  asaas_root_customer_id text,
  created_at timestamp without time zone,
  updated_at timestamp without time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    m.id,
    m.nome,
    m.cpfCnpj,
    m.email,
    m.telefone,
    m.auth_uid,
    m.asaas_subaccount_id,
    m.asaas_subaccount_api_key,
    m.asaas_root_customer_id,
    m.created_at,
    m.updated_at
  FROM public.motoristas m
  ORDER BY m.created_at DESC;
$$;

-- Function to create motorista
CREATE OR REPLACE FUNCTION create_motorista(motorista_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.motoristas (
    nome,
    cpfCnpj,
    email,
    telefone
  )
  VALUES (
    motorista_data->>'nome',
    motorista_data->>'cpfCnpj',
    motorista_data->>'email',
    motorista_data->>'telefone'
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Function to update motorista
CREATE OR REPLACE FUNCTION update_motorista(motorista_id uuid, motorista_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.motoristas
  SET 
    nome = COALESCE(motorista_data->>'nome', nome),
    email = COALESCE(motorista_data->>'email', email),
    telefone = COALESCE(motorista_data->>'telefone', telefone),
    updated_at = now()
  WHERE id = motorista_id;
END;
$$;