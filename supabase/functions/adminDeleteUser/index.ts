import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
import { corsHeaders } from "../../_shared/cors.ts";

serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Variáveis de ambiente do Supabase não configuradas.");
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const { auth_uid } = await req.json();
    if (!auth_uid) {
      return new Response(JSON.stringify({
        error: 'O auth_uid é obrigatório'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { error } = await supabase.auth.admin.deleteUser(auth_uid);
    if (error && !error.message.includes("User not found")) {
      throw error;
    }
    return new Response(JSON.stringify({
      message: 'Usuário de autenticação removido com sucesso.'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro na função adminDeleteUser:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor: ' + error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
