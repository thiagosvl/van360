import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Lida com a requisição CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Inicializa o cliente Supabase com privilégios de administrador
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
    // Extrai o auth_uid do corpo da requisição
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
    // Tenta deletar o usuário do sistema de autenticação do Supabase
    const { error } = await supabase.auth.admin.deleteUser(auth_uid);
    // Se houver um erro, verifica se é porque o usuário não foi encontrado.
    // O código do frontend já trata esse caso específico, então não retornamos um erro para ele.
    if (error && !error.message.includes("User not found")) {
      // Para qualquer outro erro, o lançamos para ser capturado pelo bloco catch.
      throw error;
    }
    // Se a exclusão foi bem-sucedida (ou se o usuário já não existia), retorna sucesso.
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
