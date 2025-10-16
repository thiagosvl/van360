import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const ASAAS_BASE_URL = Deno.env.get('ASAAS_BASE_URL');
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ASAAS_GENERAL_TOKEN = Deno.env.get("ASAAS_GENERAL_TOKEN");
const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ASAAS_GENERAL_TOKEN || !ASAAS_WEBHOOK_TOKEN) {
  console.error("Variáveis de ambiente críticas não configuradas!");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
}
);

serve(async (req) => {
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
    const { usuarioDataDB, subAccountPayload
    } = await req.json();

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

    const webhookResponse = await fetch(`${ASAAS_BASE_URL}/webhooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": createdSubAccount.apiKey
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
        authToken: ASAAS_WEBHOOK_TOKEN
      })
    });

    if (!webhookResponse.ok) {
      const errText = await webhookResponse.text();
      throw new Error(`Asaas Webhook Error: ${errText}`);
    }

    const { error: updateError } = await supabase.from("usuarios").update({
      asaas_subaccount_id: createdSubAccount.id,
      asaas_subaccount_api_key: createdSubAccount.apiKey
    }).eq("id", usuarioDataDB.id);

    if (updateError) {
      console.error("Erro no Supabase ao atualizar usuário:", updateError);
      throw new Error("Falha interna ao salvar dados da subconta.");
    }

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
