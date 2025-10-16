import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ASAAS_GENERAL_TOKEN = Deno.env.get("ASAAS_GENERAL_TOKEN");
const ASAAS_BASE_URL = Deno.env.get('ASAAS_BASE_URL');

serve(async (req) => {
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

  const path = url.pathname.replace('/asaas-general-proxy', '');
  try {
    const headers = new Headers(req.headers);
    headers.set("accept", "application/json");
    headers.set("access_token", ASAAS_GENERAL_TOKEN);

    const asaasResponse = await fetch(`${ASAAS_BASE_URL}${path}${url.search}`, {
      method: req.method,
      headers: headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined
    });

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
