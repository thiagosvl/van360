-- Enable RLS on remaining table
ALTER TABLE public.assinaturas_motoristas ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for assinaturas_motoristas
CREATE POLICY "Motoristas can manage their subscriptions" 
ON public.assinaturas_motoristas 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.motoristas 
    WHERE motoristas.id = assinaturas_motoristas.motorista_id 
    AND motoristas.auth_uid = auth.uid()
  )
);