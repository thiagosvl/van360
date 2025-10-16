import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
const ASAAS_GENERAL_TOKEN = Deno.env.get("ASAAS_GENERAL_TOKEN"); // ⚠️ Use ASAAS_GENERAL_TOKEN
const ASAAS_BASE_URL = "https://api-sandbox.asaas.com/v3";
serve(async (req)=>{
  // Tratamento de preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,DELETE,POST,PUT,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, accept"
      }
    });
  }
  if (!ASAAS_GENERAL_TOKEN) {
    return new Response(JSON.stringify({
      error: "Token Geral não configurado na variável de ambiente."
    }), {
      status: 500
    });
  }
  const url = new URL(req.url);
  // ⚠️ Ajuste de path: O path da função é '/asaas-general-proxy'
  const path = url.pathname.replace('/asaas-general-proxy', '');
  try {
    const headers = new Headers(req.headers);
    // Remover quaisquer headers de proxy desnecessários que possam ter sobrado
    headers.delete("x-asaas-key");
    // Adicionar a chave SECRETA GERAL no backend
    headers.set("accept", "application/json");
    headers.set("access_token", ASAAS_GENERAL_TOKEN);
    // Fazer a requisição final para o Asaas
    const asaasResponse = await fetch(`${ASAAS_BASE_URL}${path}${url.search}`, {
      method: req.method,
      headers: headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined
    });
    // Retornar a resposta do Asaas
    const responseHeaders = new Headers(asaasResponse.headers);
    responseHeaders.set("Content-Type", "application/json");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    return new Response(asaasResponse.body, {
      status: asaasResponse.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Erro no Edge Function asaas-general-proxy:", error);
    return new Response(JSON.stringify({
      error: "Erro interno do servidor ao comunicar com Asaas (Chave Geral)."
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
