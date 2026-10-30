import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

export const AI_CATALOG_PATH = "/.well-known/ai-catalog.json";

type CatalogEntry = {
  identifier: string;
  displayName: string;
  type: string;
  description?: string;
  url?: string;
  data?: unknown;
  tags?: string[];
  representativeQueries: string[];
};

function publisherDomain() {
  try {
    return new URL(getSiteUrl()).hostname;
  } catch {
    return "localhost";
  }
}

function urn(namespace: string, name: string) {
  return `urn:air:${publisherDomain()}:${namespace}:${name}`;
}

/**
 * AI Catalog / ARD capability manifest (specVersion 1.0).
 * Paths are inlined to avoid circular imports with agent-discovery.
 * @see https://ai-catalog.io/spec/
 * @see https://agenticresourcediscovery.org/
 */
export function buildAiCatalog() {
  const entries: CatalogEntry[] = [
    {
      identifier: urn("mcp", "lotus-discovery"),
      displayName: "Lótus Discovery MCP",
      type: "application/mcp-server-card+json",
      description:
        "MCP Streamable HTTP da Lótus com tools health e get_discovery.",
      url: absoluteUrl("/.well-known/mcp/server-card.json"),
      tags: ["mcp", "discovery"],
      representativeQueries: [
        "how do I connect to the Lotus MCP server",
        "list Lotus public discovery URLs via MCP",
        "is the Lotus agent discovery surface healthy",
      ],
    },
    {
      identifier: urn("api", "openapi"),
      displayName: "Lótus OpenAPI",
      type: "application/openapi+json",
      description: "OpenAPI 3.1 da superfície pública de discovery da Lótus.",
      url: absoluteUrl("/openapi.json"),
      tags: ["openapi", "api"],
      representativeQueries: [
        "what public API endpoints does Lotus expose",
        "show me the Lotus OpenAPI specification",
        "how do agents discover Lotus HTTP services",
      ],
    },
    {
      identifier: urn("api", "api-catalog"),
      displayName: "Lótus API Catalog",
      type: "application/linkset+json",
      description:
        "Catálogo RFC 9727 (linkset) com service-desc, service-doc e status.",
      url: absoluteUrl("/.well-known/api-catalog"),
      tags: ["api-catalog", "rfc9727"],
      representativeQueries: [
        "where is the Lotus API catalog",
        "find Lotus service-desc and health links",
      ],
    },
    {
      identifier: urn("skill", "agent-skills"),
      displayName: "Lótus Agent Skills Index",
      type: "application/agent-skills+json",
      description:
        "Índice de skills (lotus-discovery, lotus-auth, lotus-mcp, lotus-webmcp).",
      url: absoluteUrl("/.well-known/agent-skills/index.json"),
      tags: ["skills", "agentskills"],
      representativeQueries: [
        "what agent skills does Lotus publish",
        "how do I authenticate to Lotus as an agent",
        "Lotus WebMCP browser tools skill",
      ],
    },
    {
      identifier: urn("auth", "auth-md"),
      displayName: "Lótus auth.md",
      type: "text/markdown",
      description:
        "Instruções de registro agentic (anonymous + OAuth) para a Lótus.",
      url: absoluteUrl("/auth.md"),
      tags: ["auth", "oauth"],
      representativeQueries: [
        "how can an agent register with Lotus",
        "Lotus auth.md anonymous registration flow",
        "get an access token for Lotus APIs",
      ],
    },
    {
      identifier: urn("docs", "llms-txt"),
      displayName: "Lótus llms.txt",
      type: "text/plain",
      description: "Visão geral LLM-friendly do site e links de discovery.",
      url: absoluteUrl("/llms.txt"),
      tags: ["llms", "overview"],
      representativeQueries: [
        "what is Lotus for AI agents",
        "summarize Lotus public discovery endpoints",
      ],
    },
    {
      identifier: urn("poppy", "discovery"),
      displayName: "Lótus Poppy Manifest",
      type: "application/json",
      description:
        "Personal Agent Protocol (Poppy) discovery com OAuth issuer binding.",
      url: absoluteUrl("/.well-known/poppy.json"),
      tags: ["poppy", "personal-agent-protocol"],
      representativeQueries: [
        "how does Lotus support Personal Agent Protocol",
        "Lotus poppy.json OAuth issuer",
        "sign in a personal agent to Lotus",
      ],
    },
  ];

  return {
    specVersion: "1.0",
    host: {
      displayName: "Lótus",
      identifier: `did:web:${publisherDomain()}`,
    },
    entries,
  };
}
