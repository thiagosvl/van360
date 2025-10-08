import type { VercelRequest, VercelResponse } from "@vercel/node";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, access_token",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  if (method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  res.setHeader("Access-Control-Allow-Origin", CORS_HEADERS["Access-Control-Allow-Origin"]);
  res.setHeader("Access-Control-Allow-Methods", CORS_HEADERS["Access-Control-Allow-Methods"]);
  res.setHeader("Access-Control-Allow-Headers", CORS_HEADERS["Access-Control-Allow-Headers"]);

  const asaasKey = req.headers["x-asaas-key"];

   if (!asaasKey) {
    return res.status(401).json({ error: "Chave de acesso ASAAS não fornecida." });
  }

  const rawUrl = req.url || "";
  const endpoint = rawUrl.startsWith("/api/asaas")
    ? rawUrl.replace(/^\/api\/asaas/, "")
    : rawUrl;
  const fullUrl = `https://api-sandbox.asaas.com/v3${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (!["GET", "POST", "PUT", "DELETE"].includes(method || "")) {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {

    const bodyToSend = req.body && method !== 'GET'
      ? JSON.stringify(req.body)
      : undefined;

    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "access_token": asaasKey as string,
      },
      body: bodyToSend,
    });

    let data = null;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn("Could not parse JSON response from Asaas:", e);
      data = null;
    }

    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Erro Asaas Proxy:", error);
    return res.status(500).json({
      error: "Erro ao conectar com a API Asaas",
      details: error.message,
    });
  }
}