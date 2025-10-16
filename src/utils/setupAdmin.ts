import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

const mode = process.argv[3] || 'development';

dotenv.config({ path: `.env.${mode}` });
console.log(`🚀 Executando em modo: ${mode}`);

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const serviceRoleKey = process.env.SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

export const createAdminAuthUser = async () => {
  console.log('Anon key:', supabaseAnonKey.slice(0, 15) + '...');
  console.log('Service key:', serviceRoleKey.slice(0, 15) + '...');
  const { data: usuario, error: insertError } = await supabase
    .from('usuarios')
    .insert({
      nome: "Administrador",
      cpfcnpj: "39542391838",
      email: 'thiago-svl@hotmail.com',
      telefone: '(11) 99999-9999',
      role: "admin",
    })
    .select('id')
    .single();

  if (insertError || !usuario) {
    console.error('❌ Erro ao criar usuário na tabela "usuarios":', insertError);
    return;
  }

  console.log('✅ Usuário criado na tabela "usuarios" com ID:', usuario.id);

  const { data, error } = await supabase.functions.invoke('adminCreateUser', {
    body: {
      email: 'thiago-svl@hotmail.com',
      password: 'admin123',
      role: 'admin',
      usuario_id: usuario.id,
    },
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (error) {
    console.error('❌ Erro ao criar usuário Auth via função:', error);
    console.log('🧹 Executando rollback — removendo registro da tabela "usuarios"...');

    const { error: rollbackError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', usuario.id);

    if (rollbackError) {
      console.error('⚠️ Falha ao realizar rollback:', rollbackError);
    } else {
      console.log('✅ Rollback concluído — registro removido.');
    }

    return;
  }

  console.log('✅ Usuário criado com sucesso no Auth + atualizado na tabela:', data);
};

createAdminAuthUser();
