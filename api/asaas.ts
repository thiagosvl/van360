// Em asaas.ts (Vercel Function)

import type { VercelRequest, VercelResponse } from "@vercel/node";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Altere para seu domínio se quiser mais segurança
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // ESSENCIAL!
  "Access-Control-Allow-Headers": "Content-Type, access_token", // Headers que o frontend enviará
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  // LOG 1: O que a Vercel Function está recebendo
  console.log('--- REQUISIÇÃO VERCEL INICIADA ---');
  console.log('Método recebido:', method);
  console.log('URL Completa recebida:', req.url);
  // req.body é o JSON parseado. Usamos JSON.stringify para garantir que tudo seja logado.
  console.log('Corpo (req.body) recebido:', JSON.stringify(req.body, null, 2));
  console.log('---------------------------------');

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

    // --- ÚNICA ALTERAÇÃO NECESSÁRIA NO CORPO ---
    // O Vercel já parseou o corpo da requisição para um objeto JS em req.body.
    // Para enviar via fetch, precisamos serializá-lo de volta para uma string JSON.
    const bodyToSend = req.body && method !== 'GET'
      ? JSON.stringify(req.body)
      : undefined;
    // -------------------------------------------

    // LOG 2: O que será enviado ao ASAAS
    console.log('--- ENVIANDO PARA ASAAS ---');
    console.log('URL de Destino:', fullUrl);
    console.log('Método de Envio:', method);
    // Loga o corpo que está sendo enviado (deve ser uma string JSON)
    console.log('Corpo Enviado (bodyToSend):', bodyToSend);
    console.log('---------------------------');

    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        // A chave API_KEY deve vir do ambiente Vercel
        "access_token": process.env.VITE_ASAAS_TOKEN || process.env.ASAAS_API_KEY!, // Use a chave correta
      },
      body: bodyToSend, // Usa o corpo serializado
    });

    // LOG 3: O que o ASAAS está retornando
    console.log('--- RESPOSTA DO ASAAS RECEBIDA ---');
    console.log('Status de Resposta:', response.status);
    console.log('Status OK:', response.ok);
    console.log('----------------------------------');

    let data = null;
    try {
      // Tenta ler o JSON; se falhar (ex: 405 ou 204), ignora
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
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