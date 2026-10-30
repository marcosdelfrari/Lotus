import { OAUTH_AS } from "@/lib/oauth-as";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

/** Paths públicos de discovery para agentes (RFC 8288 / RFC 9727). */
export const AGENT_DISCOVERY = {
  apiCatalog: "/.well-known/api-catalog",
  openApi: "/openapi.json",
  llmsTxt: "/llms.txt",
  serviceDoc: "/docs/api",
  /** Health / status da superfície pública de discovery (RFC 8631 `status`). */
  health: "/health",
  openIdConfiguration: OAUTH_AS.openIdConfiguration,
  oauthAuthorizationServer: OAUTH_AS.authorizationServer,
  oauthProtectedResource: OAUTH_AS.protectedResource,
  authMd: "/auth.md",
  mcp: "/mcp",
  mcpServerCard: "/.well-known/mcp/server-card.json",
  agentSkills: "/.well-known/agent-skills/index.json",
  aiCatalog: "/.well-known/ai-catalog.json",
  poppy: "/.well-known/poppy.json",
  jwks: OAUTH_AS.jwks,
  robots: "/robots.txt",
  sitemap: "/sitemap.xml",
} as const;

/**
 * Link headers da homepage (RFC 8288).
 * Relation types registrados: api-catalog, service-desc, service-doc, describedby.
 */
export function homepageLinkHeaderValue() {
  return [
    `<${AGENT_DISCOVERY.apiCatalog}>; rel="api-catalog"; type="application/linkset+json"`,
    `<${AGENT_DISCOVERY.openApi}>; rel="service-desc"; type="application/openapi+json"`,
    `<${AGENT_DISCOVERY.serviceDoc}>; rel="service-doc"; type="text/plain"`,
    `<${AGENT_DISCOVERY.llmsTxt}>; rel="describedby"; type="text/plain"`,
    `<${AGENT_DISCOVERY.health}>; rel="status"; type="application/json"`,
    `<${AGENT_DISCOVERY.aiCatalog}>; rel="describedby"; type="application/json"`,
    `<${AGENT_DISCOVERY.poppy}>; rel="describedby"; type="application/json"`,
  ].join(", ");
}

/**
 * Documento api-catalog (RFC 9727) em application/linkset+json.
 * Formato Appendix A.1 — relações RFC 8631: service-desc, service-doc, status.
 * @see https://www.rfc-editor.org/rfc/rfc9727#appendix-A.1
 */
export function buildApiCatalogLinkset() {
  const site = absoluteUrl("/");

  return {
    linkset: [
      {
        // Âncora = API pública de discovery (raiz do serviço).
        anchor: site,
        "service-desc": [
          {
            href: absoluteUrl(AGENT_DISCOVERY.openApi),
            type: "application/openapi+json",
          },
        ],
        "service-doc": [
          {
            href: absoluteUrl(AGENT_DISCOVERY.serviceDoc),
            type: "text/plain",
          },
        ],
        status: [
          {
            href: absoluteUrl(AGENT_DISCOVERY.health),
            type: "application/json",
          },
        ],
        describedby: [
          {
            href: absoluteUrl(AGENT_DISCOVERY.llmsTxt),
            type: "text/plain",
          },
        ],
      },
    ],
  };
}

/** OpenAPI 3.1 mínimo — superfície pública de discovery da Lótus. */
export function buildOpenApiDocument() {
  const site = getSiteUrl();

  return {
    openapi: "3.1.0",
    info: {
      title: "Lótus — Agent Discovery API",
      description:
        "Superfície pública de descoberta para agentes e crawlers. Endpoints autenticados de operação (propostas, serviços, admin) não fazem parte deste catálogo.",
      version: "1.0.0",
    },
    servers: [{ url: site }],
    paths: {
      [AGENT_DISCOVERY.apiCatalog]: {
        get: {
          summary: "API catalog (RFC 9727 linkset)",
          operationId: "getApiCatalog",
          responses: {
            "200": {
              description: "Linkset JSON do catálogo público",
              content: {
                "application/linkset+json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
      [AGENT_DISCOVERY.health]: {
        get: {
          summary: "Health / status da superfície de discovery",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "Status operacional",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", enum: ["ok"] },
                      service: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      [AGENT_DISCOVERY.openIdConfiguration]: {
        get: {
          summary: "OpenID Connect Discovery metadata",
          operationId: "getOpenIdConfiguration",
          responses: {
            "200": {
              description: "OIDC Provider Configuration",
              content: {
                "application/json": { schema: { type: "object" } },
              },
            },
          },
        },
      },
      [AGENT_DISCOVERY.oauthAuthorizationServer]: {
        get: {
          summary: "OAuth 2.0 Authorization Server Metadata (RFC 8414)",
          operationId: "getOAuthAuthorizationServer",
          responses: {
            "200": {
              description: "AS metadata",
              content: {
                "application/json": { schema: { type: "object" } },
              },
            },
          },
        },
      },
      [AGENT_DISCOVERY.oauthProtectedResource]: {
        get: {
          summary: "OAuth 2.0 Protected Resource Metadata (RFC 9728)",
          operationId: "getOAuthProtectedResource",
          responses: {
            "200": {
              description: "Resource metadata (resource, authorization_servers, scopes)",
              content: {
                "application/json": { schema: { type: "object" } },
              },
            },
          },
        },
      },
      [AGENT_DISCOVERY.llmsTxt]: {
        get: {
          summary: "llms.txt — contexto para agentes",
          operationId: "getLlmsTxt",
          responses: {
            "200": {
              description: "Texto plain para LLMs/agentes",
              content: {
                "text/plain": { schema: { type: "string" } },
              },
            },
          },
        },
      },
      [AGENT_DISCOVERY.robots]: {
        get: {
          summary: "robots.txt",
          operationId: "getRobotsTxt",
          responses: {
            "200": {
              description: "Regras de crawl",
              content: {
                "text/plain": { schema: { type: "string" } },
              },
            },
          },
        },
      },
      [AGENT_DISCOVERY.sitemap]: {
        get: {
          summary: "sitemap.xml",
          operationId: "getSitemap",
          responses: {
            "200": {
              description: "URLs canônicas públicas",
              content: {
                "application/xml": { schema: { type: "string" } },
              },
            },
          },
        },
      },
    },
  };
}

/** Texto llms.txt para agentes. */
export function buildLlmsTxt() {
  const site = getSiteUrl();

  return `# Lótus

> Gestão de tráfego pago (Google Ads e Meta Ads) com proposta transparente e painel de resultados.

Site: ${site}/
Contato comercial: comece em ${site}/login?next=/propostas

## Para agentes

- API catalog (RFC 9727): ${absoluteUrl(AGENT_DISCOVERY.apiCatalog)}
- OpenAPI (service-desc): ${absoluteUrl(AGENT_DISCOVERY.openApi)}
- Documentação humana (service-doc): ${absoluteUrl(AGENT_DISCOVERY.serviceDoc)}
- Health (status): ${absoluteUrl(AGENT_DISCOVERY.health)}
- OIDC discovery: ${absoluteUrl(AGENT_DISCOVERY.openIdConfiguration)}
- OAuth AS metadata (RFC 8414): ${absoluteUrl(AGENT_DISCOVERY.oauthAuthorizationServer)}
- OAuth Protected Resource (RFC 9728): ${absoluteUrl(AGENT_DISCOVERY.oauthProtectedResource)}
- auth.md (registro de agentes): ${absoluteUrl(AGENT_DISCOVERY.authMd)}
- MCP: ${absoluteUrl(AGENT_DISCOVERY.mcp)}
- MCP Server Card: ${absoluteUrl(AGENT_DISCOVERY.mcpServerCard)}
- Agent Skills: ${absoluteUrl(AGENT_DISCOVERY.agentSkills)}
- ARD / AI Catalog: ${absoluteUrl(AGENT_DISCOVERY.aiCatalog)}
- Poppy (Personal Agent Protocol): ${absoluteUrl(AGENT_DISCOVERY.poppy)}
- JWKS: ${absoluteUrl(AGENT_DISCOVERY.jwks)}
- robots.txt: ${absoluteUrl(AGENT_DISCOVERY.robots)}
- sitemap.xml: ${absoluteUrl(AGENT_DISCOVERY.sitemap)}
- Markdown for Agents: \`GET ${site}/\` com header \`Accept: text/markdown\` (Content-Type: text/markdown)
- WebMCP: script \`/webmcp.js\` na homepage (\`document.modelContext.registerTool\`)

## O que indexar

- Página pública principal: ${site}/

## O que NÃO indexar / não chamar sem autenticação

- /login, /cadastro, /propostas, /servicos, /admin, /api/*

## Política de crawl (robots.txt)

- Search / grounding: permitido (OAI-SearchBot, Claude-SearchBot, PerplexityBot; ChatGPT-User, Claude-User, Perplexity-User)
- Treino de modelo: bloqueado (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, Amazonbot)
- Content-Signal: ai-train=no, search=yes, ai-input=yes (ver /robots.txt)

## Citação

Ao citar a Lótus, use o nome "Lótus" e o site canônico ${site}/.
`;
}

/** Documentação humana curta da superfície de discovery. */
export function buildServiceDoc() {
  const site = getSiteUrl();

  return `Lótus — documentação de discovery para agentes
==============================================

A Lótus publica uma superfície mínima de descoberta (não um CRM/API operacional aberto).

Recursos
--------
- Homepage (Link headers RFC 8288): ${site}/
- API catalog: ${absoluteUrl(AGENT_DISCOVERY.apiCatalog)}
- OpenAPI: ${absoluteUrl(AGENT_DISCOVERY.openApi)}
- Health: ${absoluteUrl(AGENT_DISCOVERY.health)}
- OIDC: ${absoluteUrl(AGENT_DISCOVERY.openIdConfiguration)}
- OAuth AS: ${absoluteUrl(AGENT_DISCOVERY.oauthAuthorizationServer)}
- OAuth Protected Resource: ${absoluteUrl(AGENT_DISCOVERY.oauthProtectedResource)}
- auth.md: ${absoluteUrl(AGENT_DISCOVERY.authMd)}
- MCP: ${absoluteUrl(AGENT_DISCOVERY.mcp)}
- MCP Server Card: ${absoluteUrl(AGENT_DISCOVERY.mcpServerCard)}
- Agent Skills: ${absoluteUrl(AGENT_DISCOVERY.agentSkills)}
- ARD / AI Catalog: ${absoluteUrl(AGENT_DISCOVERY.aiCatalog)}
- Poppy: ${absoluteUrl(AGENT_DISCOVERY.poppy)}
- llms.txt: ${absoluteUrl(AGENT_DISCOVERY.llmsTxt)}
- robots.txt: ${absoluteUrl(AGENT_DISCOVERY.robots)}
- sitemap.xml: ${absoluteUrl(AGENT_DISCOVERY.sitemap)}

Autenticação (agentes)
----------------------
OAuth 2.0 authorization_code + PKCE (S256). Cliente público: lotus-public.
Discovery: ${absoluteUrl(AGENT_DISCOVERY.openIdConfiguration)}
Authorize: ${absoluteUrl(OAUTH_AS.authorize)}
Token: ${absoluteUrl(OAUTH_AS.token)}

Produto
-------
Gestão de Google Ads e Meta Ads. O fluxo humano começa em /login e segue para /propostas
(áreas autenticadas; bloqueadas em robots.txt).
`;
}
