import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

export const POPPY_PATH = "/.well-known/poppy.json";
export const POPPY_PROTOCOL_VERSION = "0.1";

/** Escopos do direct sign-in — alinhados a OAUTH_SCOPES_SUPPORTED. */
const POPPY_DIRECT_SCOPES = ["openid", "profile", "email"] as const;

/** Normaliza host para organization.domain / poppy_domains (ignora www.). */
export function normalizePoppyDomain(host: string) {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

function hostFromRequest(request: Request) {
  const forwarded = request.headers.get("x-forwarded-host");
  const raw = (forwarded?.split(",")[0] ?? request.headers.get("host") ?? "").trim();
  if (raw) return raw;
  try {
    return new URL(getSiteUrl()).host;
  } catch {
    return "localhost";
  }
}

/**
 * Personal Agent Protocol (Poppy) discovery — draft 0.1.
 * @see https://personalagentprotocol.org/docs/spec#3-discovery
 * @see https://isitagentready.com/.well-known/agent-skills/personal-agent-protocol/SKILL.md
 */
export function buildPoppyManifest(request: Request) {
  const domain = normalizePoppyDomain(hostFromRequest(request));
  const issuer = getSiteUrl();

  return {
    protocol_version: POPPY_PROTOCOL_VERSION,
    organization: {
      name: "Lótus",
      domain,
    },
    auth: {
      issuer,
      direct: {
        scopes: [...POPPY_DIRECT_SCOPES],
      },
    },
    web: {},
    apis: [
      {
        type: "openapi",
        url: absoluteUrl("/openapi.json"),
        description: "Superfície pública de discovery (health, catalog, OAuth)",
      },
      {
        type: "mcp",
        url: absoluteUrl("/mcp"),
        description: "MCP Streamable HTTP — health e get_discovery",
      },
    ],
  };
}
