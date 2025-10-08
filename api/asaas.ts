import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

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
    let rawBody: any = req.body;

    if (!rawBody && method !== "GET") {
      const chunks: Uint8Array[] = [];
      for await (const chunk of req) chunks.push(chunk);
      rawBody = Buffer.concat(chunks).toString();
    }

    const body =
      typeof rawBody === "string" && rawBody.trim().length > 0
        ? rawBody
        : JSON.stringify(rawBody || {});

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
      data = await response.json();
    } catch {
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
