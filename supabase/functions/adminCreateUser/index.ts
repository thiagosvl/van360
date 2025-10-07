import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase environment variables are not set.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { email, role, usuario_id } = await req.json();

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email e role são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!['admin', 'motorista'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Role deve ser admin ou motorista' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const length = 10;
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    const senha = generatePassword();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      app_metadata: { role }
    });

    if (authError) {
      const errorMessage = authError.message.includes("User already registered")
        ? "Email já existe no sistema de autenticação"
        : `Erro ao criar usuário: ${authError.message}`;

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: authError.message.includes("User already registered") ? 409 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const auth_uid = authData.user.id;
    console.log(`Created auth user ${email} with auth_uid ${auth_uid}`);

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ auth_uid: auth_uid })
      .eq('id', usuario_id);

    if (updateError) {
      await supabase.auth.admin.deleteUser(auth_uid);
      console.error('Rollback: Deleted auth user due to profile update failure.', updateError);
      return new Response(JSON.stringify({ error: 'Não foi possível associar o usuário de autenticação ao perfil.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      auth_uid,
      senha
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in adminCreateUser function:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});