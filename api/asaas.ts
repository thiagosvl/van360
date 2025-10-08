import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url, body } = req;

  const endpoint = url?.replace("/api/asaas", "") || "";

  try {
    const response = await fetch(`https://api-sandbox.asaas.com/v3${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "access_token": process.env.ASAAS_API_KEY!,
      },
      body: method !== "GET" && body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao conectar com a API Asaas", details: error.message });
  }
}
