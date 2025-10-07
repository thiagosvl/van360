import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);
const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN")!;

const typeMap: Record<string, string> = {
  "PIX": "PIX",
  "BOLETO": "boleto",
  "CREDIT_CARD": "cartao-credito",
  "DEBIT_CARD": "cartao-debito",
};

serve(async (req) => {
  try {
    const asaasToken = req.headers.get("asaas-access-token");
    if (!asaasToken || asaasToken !== ASAAS_WEBHOOK_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const eventId = body.id;
    const eventType = body.event;
    const payment = body.payment;

    if (!eventId || !payment?.id) {
      return new Response("Missing event or payment id", { status: 400 });
    }

    const { error: insertError } = await supabase
      .from("asaas_webhook_events")
      .insert({
        asaas_event_id: eventId,
        event_type: eventType,
        payload: body,
        status: "PENDING"
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return new Response("Duplicate event", { status: 200 });
      }
      console.error("Erro ao salvar evento:", insertError);
      return new Response("DB insert error", { status: 500 });
    }

    if (eventType === "PAYMENT_RECEIVED") {
      const tipoPagamento = typeMap[payment.billingType] ?? null;

      const { error: updateError } = await supabase
        .from("cobrancas")
        .update({
          status: "pago",
          data_pagamento: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
          ...(tipoPagamento && { tipo_pagamento: tipoPagamento }),
        })
        .eq("asaas_payment_id", payment.id);

      if (updateError) {
        console.error("Erro ao atualizar mensalidade:", updateError);
        return new Response("DB update error", { status: 500 });
      }
    }

    await supabase
      .from("asaas_webhook_events")
      .update({ status: "DONE" })
      .eq("asaas_event_id", eventId);

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
