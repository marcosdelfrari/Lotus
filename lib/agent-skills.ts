import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

export const AGENT_SKILLS_INDEX_PATH = "/.well-known/agent-skills/index.json";
export const AGENT_SKILLS_SCHEMA =
  "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

export type AgentSkillDef = {
  name: string;
  description: string;
  body: string;
};

function skillMd(name: string, description: string, markdownBody: string) {
  return `---
name: ${name}
description: ${description}
---

${markdownBody.trim()}
`;
}

/** Skills publicadas pela Lótus (Agent Skills Discovery RFC v0.2.0). */
export function listAgentSkills(): AgentSkillDef[] {
  const site = getSiteUrl();

  const discoveryDesc =
    "Discover Lótus public agent surfaces: api-catalog, OpenAPI, llms.txt, MCP, OAuth, and auth.md.";
  const authDesc =
    "Authenticate to Lótus as an agent via auth.md anonymous registration or OAuth authorization_code + PKCE.";
  const mcpDesc =
    "Use the Lótus MCP Streamable HTTP server (health and get_discovery tools).";
  const webmcpDesc =
    "Use WebMCP browser tools on the Lótus homepage (get_site_overview, navigate_to, start_proposal, get_discovery_links).";

  return [
    {
      name: "lotus-discovery",
      description: discoveryDesc,
      body: skillMd(
        "lotus-discovery",
        discoveryDesc,
        `
# Lótus Discovery

Use when you need to find machine-readable entry points for the Lótus site.

## Steps

1. \`GET ${site}/.well-known/api-catalog\` (\`application/linkset+json\`)
2. \`GET ${site}/openapi.json\` (service-desc)
3. \`GET ${site}/llms.txt\`
4. \`GET ${site}/docs/api\`
5. \`GET ${site}/.well-known/mcp/server-card.json\`
6. \`GET ${site}/health\`

Homepage also advertises these via \`Link\` response headers (RFC 8288).

## Do not call without auth

\`/login\`, \`/cadastro\`, \`/propostas\`, \`/servicos\`, \`/admin\`, \`/api/*\`
`,
      ),
    },
    {
      name: "lotus-auth",
      description: authDesc,
      body: skillMd(
        "lotus-auth",
        authDesc,
        `
# Lótus Auth

Use when you need an access token for Lótus protected surfaces.

## Discover

1. \`GET ${site}/.well-known/oauth-protected-resource\`
2. \`GET ${site}/.well-known/oauth-authorization-server\` (includes \`agent_auth\`)
3. \`GET ${site}/auth.md\`

## Anonymous registration (auth.md)

\`\`\`http
POST ${site}/agent/identity
Content-Type: application/json

{ "type": "anonymous" }
\`\`\`

Exchange the returned \`identity_assertion\`:

\`\`\`http
POST ${site}/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion=<identity_assertion>
&client_id=lotus-public
\`\`\`

## Interactive OAuth (PKCE)

Use \`authorization_endpoint\` + \`token_endpoint\` from AS metadata with \`response_type=code\` and PKCE S256. Public client id: \`lotus-public\`.
`,
      ),
    },
    {
      name: "lotus-mcp",
      description: mcpDesc,
      body: skillMd(
        "lotus-mcp",
        mcpDesc,
        `
# Lótus MCP

Use when connecting an MCP client to Lótus.

## Card

\`GET ${site}/.well-known/mcp/server-card.json\`

Transport: Streamable HTTP at \`${site}/mcp\`.

## Tools

- \`health\` — operational status
- \`get_discovery\` — JSON map of public discovery URLs

## Initialize

\`\`\`http
POST ${site}/mcp
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"agent","version":"1.0"}}}
\`\`\`
`,
      ),
    },
    {
      name: "lotus-webmcp",
      description: webmcpDesc,
      body: skillMd(
        "lotus-webmcp",
        webmcpDesc,
        `
# Lótus WebMCP

Use when controlling the Lótus homepage from an in-browser agent.

## Bootstrap

The homepage loads \`/webmcp.js\`, which registers tools on \`document.modelContext\` (fallback: \`navigator.modelContext\`) with an \`AbortSignal\`.

## Tools

- \`get_site_overview\`
- \`navigate_to\` — hash sections or same-origin paths
- \`start_proposal\` — \`/login?next=/propostas\`
- \`get_discovery_links\`

## Declarative form

The contact CTA exposes \`request_proposal_access\` via \`toolname\` / \`tooldescription\` / \`toolparamdescription\`.
`,
      ),
    },
  ];
}

export function skillArtifactPath(name: string) {
  return `/.well-known/agent-skills/${name}/SKILL.md`;
}

export function getAgentSkill(name: string) {
  return listAgentSkills().find((skill) => skill.name === name) ?? null;
}

async function sha256Hex(content: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(content),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Index JSON em \`/.well-known/agent-skills/index.json\`. */
export async function buildAgentSkillsIndex() {
  const skills = await Promise.all(
    listAgentSkills().map(async (skill) => ({
      name: skill.name,
      type: "skill-md" as const,
      description: skill.description,
      url: skillArtifactPath(skill.name),
      digest: `sha256:${await sha256Hex(skill.body)}`,
    })),
  );

  return {
    $schema: AGENT_SKILLS_SCHEMA,
    skills,
  };
}

/** Texto auxiliar para llms.txt / docs. */
export function agentSkillsIndexUrl() {
  return absoluteUrl(AGENT_SKILLS_INDEX_PATH);
}
