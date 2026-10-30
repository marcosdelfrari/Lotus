import { handleMcpJsonRpc } from "@/lib/mcp-server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id, Authorization",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

/** GET /mcp — discovery leve do endpoint Streamable HTTP. */
export function GET() {
  return Response.json(
    {
      name: "lotus-discovery",
      transport: "streamable-http",
      protocolVersion: "2025-06-18",
      serverCard: "/.well-known/mcp/server-card.json",
    },
    {
      status: 200,
      headers: {
        ...CORS,
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}

/**
 * POST /mcp — MCP Streamable HTTP (JSON-RPC).
 * Aceita um objeto ou um array de mensagens.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      },
      { status: 400, headers: CORS },
    );
  }

  const messages = Array.isArray(body) ? body : [body];
  const responses = [];

  for (const message of messages) {
    if (!message || typeof message !== "object") continue;
    const result = await handleMcpJsonRpc(
      message as {
        jsonrpc?: string;
        id?: string | number | null;
        method?: string;
        params?: Record<string, unknown>;
      },
    );
    if (result) responses.push(result);
  }

  // Notificações sem id → 202 sem body (ou array vazio).
  if (responses.length === 0) {
    return new Response(null, { status: 202, headers: CORS });
  }

  const payload = Array.isArray(body) ? responses : responses[0];
  return Response.json(payload, {
    status: 200,
    headers: {
      ...CORS,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
