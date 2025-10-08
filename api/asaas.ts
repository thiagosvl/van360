import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const endpoint = req.url?.replace("/api/asaas", "") || "";

  if (!["GET", "POST", "PUT", "DELETE"].includes(method || "")) {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body =
      typeof req.body === "object" ? JSON.stringify(req.body) : req.body || undefined;

    const response = await fetch(`https://api-sandbox.asaas.com/v3${endpoint}`, {
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

    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(500).json({
      error: "Erro ao conectar com a API Asaas",
      details: error.message,
    });
  }
}
