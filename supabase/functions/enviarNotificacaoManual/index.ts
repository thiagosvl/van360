import { corsHeaders } from "../../_shared/cors.ts";

Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const body = await req.json();
    const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!n8nUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: "N8N_WEBHOOK_URL não configurado"
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Erro na edge function:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
