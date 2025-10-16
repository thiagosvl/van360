import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Variáveis de ambiente
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
// Mapeamento do billingType do Asaas → ENUM do banco
const typeMap = {
  "PIX": "PIX",
  "BOLETO": "boleto",
  "CREDIT_CARD": "cartao-credito",
  "DEBIT_CARD": "cartao-debito"
};
serve(async (req)=>{
  try {
    // 1. Validação do token
    const asaasToken = req.headers.get("asaas-access-token");
    if (!asaasToken || asaasToken !== ASAAS_WEBHOOK_TOKEN) {
      return new Response("Unauthorized", {
        status: 401
      });
    }
    // 2. Ler body
    const body = await req.json();
    const eventId = body.id;
    const eventType = body.event;
    const payment = body.payment;
    if (!eventId || !payment?.id) {
      return new Response("Missing event or payment id", {
        status: 400
      });
    }
    // 3. Registrar evento na tabela (idempotência)
    const { error: insertError } = await supabase.from("asaas_webhook_events").insert({
      asaas_event_id: eventId,
      event_type: eventType,
      payload: body,
      status: "PENDING"
    });
    if (insertError) {
      if (insertError.code === "23505") {
        return new Response("Duplicate event", {
          status: 200
        });
      }
      console.error("Erro ao salvar evento:", insertError);
      return new Response("DB insert error", {
        status: 500
      });
    }
    // 4. Só processa PAYMENT_RECEIVED
    if (eventType === "PAYMENT_RECEIVED") {
      // 4.1. Busca a cobrança no banco ANTES de atualizar
      const { data: cobranca, error: fetchError } = await supabase.from("cobrancas").select("status, pagamento_manual") // Seleciona os campos que precisamos verificar
      .eq("asaas_payment_id", payment.id).single(); // Esperamos encontrar uma única cobrança
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Erro ao buscar cobrança existente:", fetchError);
      // Mesmo com erro aqui, o evento do webhook será marcado como DONE para evitar loops.
      // Você pode querer adicionar um status "FAILED" para reprocessar depois.
      }
      // 4.2. Verifica se a cobrança já foi paga manualmente
      if (cobranca && cobranca.status === "pago" && cobranca.pagamento_manual === true) {
        console.log(`Webhook ignorado: Cobrança ${payment.id} já possui baixa manual.`);
      } else {
        const tipoPagamento = typeMap[payment.billingType] ?? null;
        // --- AJUSTE APLICADO AQUI ---
        // Montamos o objeto de atualização com os valores do Asaas
        const updatePayload = {
          status: "pago",
          data_pagamento: payment.paymentDate || new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
          pagamento_manual: false,
          valor: payment.value,
          ...tipoPagamento && {
            tipo_pagamento: tipoPagamento
          }
        };
        const { error: updateError } = await supabase.from("cobrancas").update(updatePayload) // Usando o objeto que criamos
        .eq("asaas_payment_id", payment.id);
        if (updateError) {
          console.error("Erro ao atualizar cobrança:", updateError);
          return new Response("DB update error", {
            status: 500
          });
        }
      }
    }
    // 5. Marcar evento como DONE
    await supabase.from("asaas_webhook_events").update({
      status: "DONE"
    }).eq("asaas_event_id", eventId);
    return new Response("OK", {
      status: 200
    });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return new Response("Internal Server Error", {
      status: 500
    });
  }
});
