import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
// URL base do Asaas (Ajuste para produção se necessário)
const ASAAS_BASE_URL = "https://api-sandbox.asaas.com/v3";
// Variáveis de ambiente secretas
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const WEBHOOK_AUTH_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN"); // Token Secreto do Webhook
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Variáveis de ambiente do Supabase não configuradas corretamente.");
}
// 1. Cliente Supabase com Service Role Key para acesso ao DB
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
serve(async (req)=>{
  // Tratamento de preflight (OPTIONS) para CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,DELETE,POST,PUT,OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, accept"
      }
    });
  }
  const url = new URL(req.url);
  // Remove o nome da função da URL para obter o path do Asaas
  const path = url.pathname.replace('/asaas-proxy', '');
  // 2. Extrair e Autenticar o JWT (Identifica o motorista)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({
      error: "Autenticação requerida (JWT ausente)."
    }), {
      status: 401
    });
  }
  const jwt = authHeader.replace("Bearer ", "");
  const { data: userData, error: authError } = await supabase.auth.getUser(jwt);
  if (authError || !userData?.user) {
    return new Response(JSON.stringify({
      error: "Token JWT inválido ou expirado."
    }), {
      status: 401
    });
  }
  const user_id = userData.user.id; // ID da tabela auth.users
  // 3. Buscar a chave API do motorista na tabela "usuarios" (USANDO AS SUAS REGRAS)
  const { data: userDataDB, error: dbError } = await supabase.from("usuarios") // <-- Tabela: 'usuarios'
  .select("asaas_subaccount_api_key") // <-- Coluna: 'asaas_subaccount_api_key'
  .eq("auth_uid", user_id) // <-- Ligação: 'auth_uid' igual ao ID do Supabase Auth
  .single();
  if (dbError || !userDataDB?.asaas_subaccount_api_key) {
    console.error("Erro ao buscar chave Asaas:", dbError);
    return new Response(JSON.stringify({
      error: "Chave Asaas do usuário não encontrada (Falha na ligação DB/Auth)."
    }), {
      status: 403
    });
  }
  const ASAAS_API_KEY_MOTORISTA = userDataDB.asaas_subaccount_api_key;
  try {
    // 4. Lógica de Injeção de Headers
    const headers = new Headers(req.headers);
    headers.set("accept", "application/json");
    headers.set("access_token", ASAAS_API_KEY_MOTORISTA); // Injete a chave do motorista
    headers.delete("Authorization"); // Remove o JWT do Supabase antes de enviar ao Asaas
    headers.delete("x-asaas-key");
    // 5. Lógica de Injeção do AuthToken (Body) para Webhooks
    let requestBody;
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        // Tenta ler o corpo JSON
        requestBody = await req.json();
      } catch (e) {
        // Ignora erros de parsing para requisições sem corpo (PUT/PATCH/POST sem payload)
        console.log("Aviso: Corpo da requisição não é JSON ou está vazio.");
      }
    }
    // Se for a chamada para criar Webhook, injete o token secreto no Body
    if (path.startsWith("/webhooks") && req.method === "POST" && requestBody) {
      if (WEBHOOK_AUTH_TOKEN) {
        requestBody.authToken = WEBHOOK_AUTH_TOKEN; // Injete o segredo do webhook
      } else {
        console.warn("WEBHOOK_AUTH_TOKEN não está configurado. O Webhook será criado sem token de segurança.");
      }
    }
    // 6. Fazer a requisição para o Asaas
    const asaasResponse = await fetch(`${ASAAS_BASE_URL}${path}${url.search}`, {
      method: req.method,
      headers: headers,
      body: requestBody ? JSON.stringify(requestBody) : undefined
    });
    // 7. Retornar a resposta
    const responseHeaders = new Headers(asaasResponse.headers);
    responseHeaders.set("Content-Type", "application/json");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    return new Response(asaasResponse.body, {
      status: asaasResponse.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Erro no Edge Function asaas-proxy:", error);
    return new Response(JSON.stringify({
      error: "Erro interno do servidor ao comunicar com Asaas."
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
