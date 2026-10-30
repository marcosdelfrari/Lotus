import { AGENT_DISCOVERY } from "@/lib/agent-discovery";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

export const MCP_PATH = "/mcp";
export const MCP_SERVER_CARD_PATH = "/.well-known/mcp/server-card.json";
export const MCP_PROTOCOL_VERSION = "2025-06-18";
export const MCP_SERVER_VERSION = "1.0.0";
export const MCP_SERVER_NAME = "lotus-discovery";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

const TOOLS = [
  {
    name: "health",
    description: "Status operacional da superfície de discovery da Lótus",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_discovery",
    description:
      "Lista URLs públicas de discovery (api-catalog, OpenAPI, auth.md, OAuth, llms.txt)",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
] as const;

/**
 * MCP Server Card (SEP-1649 / isitagentready).
 * Combina serverInfo + transport.endpoint + capabilities.tools.
 */
export function buildMcpServerCard() {
  const endpoint = absoluteUrl(MCP_PATH);

  return {
    $schema:
      "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    version: "1.0",
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: {
      name: MCP_SERVER_NAME,
      title: "Lótus Discovery",
      version: MCP_SERVER_VERSION,
    },
    description:
      "MCP da Lótus para descoberta de superfícies públicas (health, links de discovery).",
    url: endpoint,
    documentationUrl: absoluteUrl(AGENT_DISCOVERY.serviceDoc),
    transport: {
      type: "streamable-http",
      endpoint: MCP_PATH,
    },
    capabilities: {
      tools: { listChanged: false },
    },
    tools: TOOLS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
}

function ok(id: JsonRpcId | undefined, result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function err(id: JsonRpcId | undefined, code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

async function callTool(name: string) {
  if (name === "health") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "ok",
            service: "lotus-agent-discovery",
            site: getSiteUrl(),
          }),
        },
      ],
    };
  }

  if (name === "get_discovery") {
    const links = {
      site: absoluteUrl("/"),
      apiCatalog: absoluteUrl(AGENT_DISCOVERY.apiCatalog),
      openApi: absoluteUrl(AGENT_DISCOVERY.openApi),
      llmsTxt: absoluteUrl(AGENT_DISCOVERY.llmsTxt),
      serviceDoc: absoluteUrl(AGENT_DISCOVERY.serviceDoc),
      health: absoluteUrl(AGENT_DISCOVERY.health),
      authMd: absoluteUrl(AGENT_DISCOVERY.authMd),
      openIdConfiguration: absoluteUrl(AGENT_DISCOVERY.openIdConfiguration),
      oauthAuthorizationServer: absoluteUrl(
        AGENT_DISCOVERY.oauthAuthorizationServer,
      ),
      oauthProtectedResource: absoluteUrl(
        AGENT_DISCOVERY.oauthProtectedResource,
      ),
      mcp: absoluteUrl(MCP_PATH),
      mcpServerCard: absoluteUrl(MCP_SERVER_CARD_PATH),
      agentSkills: absoluteUrl("/.well-known/agent-skills/index.json"),
      aiCatalog: absoluteUrl("/.well-known/ai-catalog.json"),
      poppy: absoluteUrl("/.well-known/poppy.json"),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(links, null, 2) }],
    };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
}

/** Processa um único JSON-RPC MCP (Streamable HTTP). */
export async function handleMcpJsonRpc(message: JsonRpcRequest) {
  const { id, method, params } = message;

  if (!method) {
    return err(id, -32600, "Invalid Request");
  }

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: {
          name: MCP_SERVER_NAME,
          version: MCP_SERVER_VERSION,
        },
        instructions:
          "Use tools/list e tools/call (health, get_discovery) para explorar a Lótus.",
      });
    case "notifications/initialized":
      return null;
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const name = typeof params?.name === "string" ? params.name : "";
      if (!name) return err(id, -32602, "tools/call requires params.name");
      return ok(id, await callTool(name));
    }
    default:
      return err(id, -32601, `Method not found: ${method}`);
  }
}
