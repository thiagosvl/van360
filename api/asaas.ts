// Em asaas.ts (Vercel Function)

import type { VercelRequest, VercelResponse } from "@vercel/node";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Altere para seu domínio se quiser mais segurança
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // ESSENCIAL!
  "Access-Control-Allow-Headers": "Content-Type, access_token", // Headers que o frontend enviará
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  // 1. TRATAMENTO DO MÉTODO OPTIONS (Pré-voo CORS)
  if (method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }
  
  // O restante do código, com a adição dos headers CORS
  res.setHeader("Access-Control-Allow-Origin", CORS_HEADERS["Access-Control-Allow-Origin"]);
  res.setHeader("Access-Control-Allow-Methods", CORS_HEADERS["Access-Control-Allow-Methods"]);
  res.setHeader("Access-Control-Allow-Headers", CORS_HEADERS["Access-Control-Allow-Headers"]);

  // Corrige extração de endpoint com e sem barra inicial
  const rawUrl = req.url || "";
  const endpoint = rawUrl.startsWith("/api/asaas")
    ? rawUrl.replace(/^\/api\/asaas/, "")
    : rawUrl;
  const fullUrl = `https://api-sandbox.asaas.com/v3${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (!["GET", "POST", "PUT", "DELETE"].includes(method || "")) {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  try {
    // ... (restante da lógica do seu proxy, que está OK)
    let rawBody: any = req.body;
    
    // ... (restante da lógica de body parsing)
    
    // Seu código de parsing de body é complexo. Vamos simplificar se o body já veio pronto.
    const body = rawBody && typeof rawBody === 'object' ? JSON.stringify(rawBody) : rawBody;


    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "access_token": process.env.ASAAS_API_KEY!,
      },
      body: method !== "GET" ? body : undefined,
    });

    let data = null;
    try {
      // Tenta ler o JSON, mas se falhar (ex: status 204 No Content), data será null
      data = await response.json(); 
    } catch (e) {
      console.warn("Could not parse JSON response from Asaas:", e);
      data = null;
    }

    // Retorna o status original da API
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Erro Asaas Proxy:", error);
    return res.status(500).json({
      error: "Erro ao conectar com a API Asaas",
      details: error.message,
    });
  }
}