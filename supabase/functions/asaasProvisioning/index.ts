import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
// URL base do Asaas (Ajuste para produção se necessário)
const ASAAS_BASE_URL = "https://api-sandbox.asaas.com/v3";
// Variáveis de ambiente secretas
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ASAAS_GENERAL_TOKEN = Deno.env.get("ASAAS_GENERAL_TOKEN"); // Chave Mestra para criar subcontas
const WEBHOOK_AUTH_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN"); // Token Secreto do Webhook
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ASAAS_GENERAL_TOKEN || !WEBHOOK_AUTH_TOKEN) {
  console.error("Variáveis de ambiente críticas não configuradas!");
// Lançar um erro aqui pode ser muito invasivo. Melhor retornar 500.
}
// Cliente Supabase com Service Role Key para escrita no DB
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
} // Não precisamos de sessão aqui
);
serve(async (req)=>{
  // Tratamento de CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, accept"
      }
    });
  }
  if (req.method !== "POST") {
    return new Response("Método não permitido.", {
      status: 405
    });
  }
  try {
    const { usuarioDataDB, subAccountPayload// Dados necessários para criar a subconta
     } = await req.json();
    // 1. Criar a Subconta Asaas (usando a Chave Geral)
    const subAccountResponse = await fetch(`${ASAAS_BASE_URL}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_GENERAL_TOKEN
      },
      body: JSON.stringify(subAccountPayload)
    });
    if (!subAccountResponse.ok) {
      const errText = await subAccountResponse.text();
      throw new Error(`Asaas SubConta Error: ${errText}`);
    }
    const createdSubAccount = await subAccountResponse.json();
    // 2. Criar o Webhook (usando a Chave da Subconta recém-criada)
    const webhookResponse = await fetch(`${ASAAS_BASE_URL}/webhooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": createdSubAccount.apiKey // Injete a nova chave da Subconta
      },
      body: JSON.stringify({
        name: "Webhook Motorista Passageiro Recebida",
        url: `${SUPABASE_URL}/functions/v1/pagamentoMensalidadePassageiro`,
        email: "abiliodasvendas@gmail.com",
        enabled: true,
        interrupted: false,
        apiVersion: 3,
        sendType: "SEQUENTIALLY",
        events: [
          "PAYMENT_RECEIVED"
        ],
        authToken: WEBHOOK_AUTH_TOKEN
      })
    });
    if (!webhookResponse.ok) {
      const errText = await webhookResponse.text();
      throw new Error(`Asaas Webhook Error: ${errText}`);
    }
    // 3. Atualizar o Usuário no Supabase (com a chave e ID)
    const { error: updateError } = await supabase.from("usuarios").update({
      asaas_subaccount_id: createdSubAccount.id,
      asaas_subaccount_api_key: createdSubAccount.apiKey
    }).eq("id", usuarioDataDB.id); // ID do usuário que o front-end criou
    if (updateError) {
      console.error("Erro no Supabase ao atualizar usuário:", updateError);
      // ⚠️ FALHA CRÍTICA: Não conseguimos salvar a chave. Idealmente, deve-se tentar o Rollback Asaas aqui.
      throw new Error("Falha interna ao salvar dados da subconta.");
    }
    // 4. Se tudo OK, retorna o resultado para o front-end
    return new Response(JSON.stringify({
      success: true,
      subAccountId: createdSubAccount.id,
      subApiKey: createdSubAccount.apiKey
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Erro no Provisionamento Asaas:", error);
    return new Response(JSON.stringify({
      error: error.message || "Falha no provisionamento."
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
