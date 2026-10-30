import {
  OAUTH_AS,
  OAUTH_SCOPES_SUPPORTED,
  issueAccessToken,
  signIdentityAssertion,
  verifyIdentityAssertion,
} from "@/lib/oauth-as";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

/** Espelha AGENT_AUTH_PATHS (evita binding HMR stale de named export). */
const AUTH_MD = "/auth.md";
const REGISTER = "/agent/identity";
const CLAIM = "/agent/identity/claim";
const CLAIM_PAGE = "/claim";

type Registration = {
  id: string;
  type: "anonymous";
  claimToken: string;
  claimTokenExp: number;
  userCode?: string;
  claimAttemptToken?: string;
  claimAttemptExp?: number;
  email?: string;
  claimedBy?: { sub: string; email: string; name: string };
  createdAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __lotusAgentRegs: Map<string, Registration> | undefined;
}

function regs() {
  if (!globalThis.__lotusAgentRegs) {
    globalThis.__lotusAgentRegs = new Map();
  }
  return globalThis.__lotusAgentRegs;
}

function randomId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`;
}

function userCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Markdown /auth.md — H1 deve conter "auth.md". */
export function buildAuthMd() {
  const site = getSiteUrl();
  const prm = absoluteUrl(OAUTH_AS.protectedResource);
  const asMeta = absoluteUrl(OAUTH_AS.authorizationServer);
  const register = absoluteUrl(REGISTER);
  const claim = absoluteUrl(CLAIM);
  const token = absoluteUrl(OAUTH_AS.token);
  const scopes = OAUTH_SCOPES_SUPPORTED.join(" ");

  return `# auth.md

Você é um agente. A **Lótus** suporta registro agentic: discover → register → (claim opcional) → exchange → usar Bearer token.

Audience: agentes que precisam de access_token para superfícies autenticadas da Lótus (discovery já é pública).

Documento canônico: ${absoluteUrl(AUTH_MD)}

## Step 1 — Discover

1. \`GET ${prm}\` (Protected Resource Metadata, RFC 9728)
2. \`GET ${asMeta}\` (Authorization Server Metadata + \`agent_auth\`)

Issuer: \`${site}\`
Token endpoint: \`${token}\`
Register: \`${register}\`
Claim: \`${claim}\`
Scopes: \`${scopes}\`

## Step 2 — Pick a method

Método suportado: **anonymous** (claim ceremony opcional para vincular a um usuário humano).

## Step 3 — Register (anonymous)

\`\`\`http
POST ${register}
Content-Type: application/json

{ "type": "anonymous" }
\`\`\`

Resposta inclui \`identity_assertion\` (JWT assinado pela Lótus) e \`claim_token\` (para claim opcional).

## Step 4 — Claim (opcional)

\`\`\`http
POST ${claim}
Content-Type: application/json

{ "claim_token": "clm_...", "email": "user@example.com" }
\`\`\`

Mostre \`verification_uri\` + \`user_code\` ao usuário. O usuário autentica em /login e confirma o código em ${absoluteUrl(CLAIM_PAGE)}.

## Step 5 — Exchange

\`\`\`http
POST ${token}
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion=<identity_assertion>
&client_id=lotus-public
\`\`\`

Use \`Authorization: Bearer <access_token>\` nas chamadas.

## Revogação

\`POST ${absoluteUrl(OAUTH_AS.revoke)}\` com \`token=<access_token>\` (RFC 7009).

## Credenciais

- Tipo: \`access_token\` (Bearer JWT ES256)
- Cliente público: \`lotus-public\` (PKCE também disponível em \`/oauth/authorize\`)
`;
}

export async function registerAnonymous() {
  const id = randomId("reg");
  const claimToken = randomId("clm");
  const claimTokenExp = Date.now() + 1000 * 60 * 60 * 24;
  const assertionExp = Math.floor(Date.now() / 1000) + 60 * 60;

  regs().set(claimToken, {
    id,
    type: "anonymous",
    claimToken,
    claimTokenExp,
    createdAt: Date.now(),
  });

  const identityAssertion = await signIdentityAssertion({
    sub: id,
    registration_id: id,
    registration_type: "anonymous",
    exp: assertionExp,
  });

  return {
    registration_id: id,
    registration_type: "anonymous" as const,
    identity_assertion: identityAssertion,
    assertion_expires: new Date(assertionExp * 1000).toISOString(),
    pre_claim_scopes: [...OAUTH_SCOPES_SUPPORTED],
    claim_url: absoluteUrl(CLAIM),
    claim_token: claimToken,
    claim_token_expires: new Date(claimTokenExp).toISOString(),
    post_claim_scopes: [...OAUTH_SCOPES_SUPPORTED],
  };
}

export async function startClaim(input: { claimToken: string; email: string }) {
  const reg = regs().get(input.claimToken);
  if (!reg || reg.claimTokenExp < Date.now()) {
    return { error: "invalid_claim_token" as const };
  }

  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    return { error: "invalid_email" as const };
  }

  const attemptToken = randomId("cla");
  const code = userCode();
  const expiresIn = 600;
  reg.email = email;
  reg.userCode = code;
  reg.claimAttemptToken = attemptToken;
  reg.claimAttemptExp = Date.now() + expiresIn * 1000;
  regs().set(input.claimToken, reg);

  const returnTo = `${CLAIM_PAGE}?claim_attempt_token=${encodeURIComponent(attemptToken)}`;
  const verificationUri = `${absoluteUrl("/login")}?next=${encodeURIComponent(returnTo)}`;

  return {
    registration_id: reg.id,
    claim_attempt_id: attemptToken,
    status: "initiated" as const,
    expires_at: new Date(reg.claimAttemptExp).toISOString(),
    claim_attempt: {
      user_code: code,
      expires_in: expiresIn,
      verification_uri: verificationUri,
      interval: 5,
    },
  };
}

export function findClaimAttempt(claimAttemptToken: string) {
  for (const reg of regs().values()) {
    if (reg.claimAttemptToken === claimAttemptToken) return reg;
  }
  return null;
}

export function completeClaimAttempt(input: {
  claimAttemptToken: string;
  userCode: string;
  user: { sub: string; email: string; name: string };
}) {
  const reg = findClaimAttempt(input.claimAttemptToken);
  if (!reg || !reg.claimAttemptExp || reg.claimAttemptExp < Date.now()) {
    return { error: "expired" as const };
  }
  if (reg.userCode !== input.userCode.trim()) {
    return { error: "invalid_code" as const };
  }
  if (reg.email && reg.email !== input.user.email.trim().toLowerCase()) {
    return { error: "email_mismatch" as const };
  }
  reg.claimedBy = input.user;
  regs().set(reg.claimToken, reg);
  return { ok: true as const, registration_id: reg.id };
}

export async function exchangeIdentityAssertion(assertion: string, clientId: string) {
  const claims = await verifyIdentityAssertion(assertion);
  if (!claims?.sub) return null;
  return issueAccessToken({
    sub: String(claims.sub),
    email: typeof claims.email === "string" ? claims.email : `${claims.sub}@agents.lotus`,
    name: typeof claims.name === "string" ? claims.name : "Lotus Agent",
    clientId,
    scope: OAUTH_SCOPES_SUPPORTED.join(" "),
  });
}

export async function pollClaimGrant(claimToken: string, clientId: string) {
  const reg = regs().get(claimToken);
  if (!reg || reg.claimTokenExp < Date.now()) {
    return { error: "invalid_grant" as const };
  }
  if (!reg.claimedBy) {
    return { error: "authorization_pending" as const };
  }
  const tokens = await issueAccessToken({
    sub: reg.claimedBy.sub,
    email: reg.claimedBy.email,
    name: reg.claimedBy.name,
    clientId,
    scope: OAUTH_SCOPES_SUPPORTED.join(" "),
  });
  const assertionExp = Math.floor(Date.now() / 1000) + 60 * 60;
  const identityAssertion = await signIdentityAssertion({
    sub: reg.claimedBy.sub,
    email: reg.claimedBy.email,
    name: reg.claimedBy.name,
    registration_id: reg.id,
    registration_type: "anonymous",
    exp: assertionExp,
  });
  return {
    ...tokens,
    identity_assertion: identityAssertion,
    assertion_expires: new Date(assertionExp * 1000).toISOString(),
  };
}
