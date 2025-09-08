-- Create usuarios table for authentication control
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  cpfCnpj text not null unique,         -- apenas dígitos
  email text not null unique,
  role text not null check (role in ('admin','motorista')),
  auth_uid uuid unique,                  -- preenche após criar no Auth
  motorista_id uuid null references public.motoristas(id),
  created_at timestamp without time zone default now()
);

create index if not exists idx_usuarios_role on public.usuarios(role);