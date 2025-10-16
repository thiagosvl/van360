import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const ASAAS_BASE_URL = Deno.env.get('ASAAS_BASE_URL');
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Variáveis de ambiente do Supabase não configuradas corretamente.");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
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
  const path = url.pathname.replace('/asaas-proxy', '');
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

  const user_id = userData.user.id;

  const { data: userDataDB, error: dbError } = await supabase.from("usuarios")
    .select("asaas_subaccount_api_key")
    .eq("auth_uid", user_id)
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
    const headers = new Headers(req.headers);
    headers.set("accept", "application/json");
    headers.set("access_token", ASAAS_API_KEY_MOTORISTA);
    headers.delete("Authorization");
    headers.delete("x-asaas-key");
    let requestBody;
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        requestBody = await req.json();
      } catch (e) {
        console.log("Aviso: Corpo da requisição não é JSON ou está vazio.");
      }
    }

    if (path.startsWith("/webhooks") && req.method === "POST" && requestBody) {
      if (ASAAS_WEBHOOK_TOKEN) {
        requestBody.authToken = ASAAS_WEBHOOK_TOKEN;
      } else {
        console.warn("ASAAS_WEBHOOK_TOKEN não está configurado. O Webhook será criado sem token de segurança.");
      }
    }

    const asaasResponse = await fetch(`${ASAAS_BASE_URL}${path}${url.search}`, {
      method: req.method,
      headers: headers,
      body: requestBody ? JSON.stringify(requestBody) : undefined
    });

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
