import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

function poppyDomainsForIssuer() {
  try {
    const host = new URL(getSiteUrl()).host.toLowerCase().replace(/^www\./, "");
    return host ? [host] : [];
  } catch {
    return ["localhost"];
  }
}

/** Paths do Authorization Server (RFC 8414 / OIDC Discovery). */
export const OAUTH_AS = {
  openIdConfiguration: "/.well-known/openid-configuration",
  authorizationServer: "/.well-known/oauth-authorization-server",
  protectedResource: "/.well-known/oauth-protected-resource",
  jwks: "/.well-known/jwks.json",
  authorize: "/oauth/authorize",
  token: "/oauth/token",
  userinfo: "/oauth/userinfo",
  revoke: "/oauth/revoke",
} as const;

/** Paths auth.md / registro de agentes. */
export const AGENT_AUTH_PATHS = {
  authMd: "/auth.md",
  register: "/agent/identity",
  claim: "/agent/identity/claim",
  events: "/agent/event/notify",
  claimPage: "/claim",
} as const;

export const OAUTH_PUBLIC_CLIENT_ID = "lotus-public";

export const OAUTH_SCOPES_SUPPORTED = ["openid", "profile", "email"] as const;

/**
 * Bloco agent_auth (auth.md) — register_uri (v0.1) + identity_endpoint (atual).
 * Método completo: anonymous + access_token + claim_uri.
 */
export function buildAgentAuthBlock() {
  const registerUri = absoluteUrl(AGENT_AUTH_PATHS.register);
  const claimUri = absoluteUrl(AGENT_AUTH_PATHS.claim);
  const revokeUri = absoluteUrl(OAUTH_AS.revoke);

  return {
    skill: absoluteUrl(AGENT_AUTH_PATHS.authMd),
    register_uri: registerUri,
    identity_endpoint: registerUri,
    claim_uri: claimUri,
    claim_endpoint: claimUri,
    revocation_uri: revokeUri,
    events_endpoint: absoluteUrl(AGENT_AUTH_PATHS.events),
    identity_types_supported: ["anonymous"],
    credential_types_supported: ["access_token"],
    anonymous: {
      credential_types_supported: ["access_token"],
    },
    events_supported: [
      "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked",
    ],
  };
}

/** JWK público/privado com campos JOSE além do JsonWebKey do DOM. */
type LotusJwk = JsonWebKey & {
  kid?: string;
  use?: string;
  alg?: string;
  d?: string;
};

type CachedKey = {
  kid: string;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicJwk: LotusJwk;
};

declare global {
  // eslint-disable-next-line no-var
  var __lotusOauthKey: CachedKey | undefined;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function importOrCreateKey(): Promise<CachedKey> {
  if (globalThis.__lotusOauthKey) return globalThis.__lotusOauthKey;

  const raw = process.env.OAUTH_PRIVATE_JWK?.trim();
  if (raw) {
    const jwk = JSON.parse(raw) as LotusJwk;
    const kid = jwk.kid || "lotus-1";
    const privateKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"],
    );
    const { d: _d, ...publicParts } = jwk;
    const publicJwk: LotusJwk = {
      ...publicParts,
      kid,
      use: "sig",
      alg: "ES256",
      key_ops: ["verify"],
    };
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      publicJwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
    const cached = { kid, privateKey, publicKey, publicJwk };
    globalThis.__lotusOauthKey = cached;
    return cached;
  }

  const pair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const kid = "lotus-ephemeral";
  const exported = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const publicJwk: LotusJwk = {
    ...exported,
    kid,
    use: "sig",
    alg: "ES256",
    key_ops: ["verify"],
  };

  const cached = {
    kid,
    privateKey: pair.privateKey,
    publicKey: pair.publicKey,
    publicJwk,
  };
  globalThis.__lotusOauthKey = cached;
  return cached;
}

/** Metadata OAuth 2.0 AS (RFC 8414) / OIDC Discovery + agent_auth (auth.md). */
export function buildOAuthAuthorizationServerMetadata() {
  const issuer = getSiteUrl();

  return {
    issuer,
    authorization_endpoint: absoluteUrl(OAUTH_AS.authorize),
    token_endpoint: absoluteUrl(OAUTH_AS.token),
    revocation_endpoint: absoluteUrl(OAUTH_AS.revoke),
    jwks_uri: absoluteUrl(OAUTH_AS.jwks),
    response_types_supported: ["code"],
    grant_types_supported: [
      "authorization_code",
      "urn:ietf:params:oauth:grant-type:jwt-bearer",
      "urn:workos:agent-auth:grant-type:claim",
    ],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: [...OAUTH_SCOPES_SUPPORTED],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["ES256"],
    claims_supported: ["sub", "email", "name", "iss", "aud", "exp", "iat"],
    service_documentation: absoluteUrl("/docs/api"),
    /** Poppy 0.1 — domains allowed to name this issuer in poppy.json */
    poppy_domains: poppyDomainsForIssuer(),
    agent_auth: buildAgentAuthBlock(),
  };
}

/** Alias OIDC — mesmos campos + tipagem de OP. */
export function buildOpenIdConfiguration() {
  return {
    ...buildOAuthAuthorizationServerMetadata(),
    userinfo_endpoint: absoluteUrl(OAUTH_AS.userinfo),
  };
}

/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728).
 * resource = identificador deste RS; authorization_servers = issuers que emitem tokens.
 */
export function buildOAuthProtectedResourceMetadata() {
  const resource = getSiteUrl();

  return {
    resource,
    authorization_servers: [resource],
    scopes_supported: [...OAUTH_SCOPES_SUPPORTED],
    bearer_methods_supported: ["header"],
    resource_documentation: absoluteUrl("/docs/api"),
  };
}

/** Header WWW-Authenticate apontando para o PRM (RFC 9728 §5). */
export function wwwAuthenticateBearer(error?: string) {
  const metadata = absoluteUrl(OAUTH_AS.protectedResource);
  const parts = [`Bearer resource_metadata="${metadata}"`];
  if (error) parts.push(`error="${error}"`);
  return parts.join(", ");
}

export async function buildJwks() {
  const key = await importOrCreateKey();
  return { keys: [key.publicJwk] };
}

type AuthCodePayload = {
  v: 1;
  sub: string;
  email: string;
  name: string;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  scope: string;
  exp: number;
};

async function signBytes(data: Uint8Array) {
  const key = await importOrCreateKey();
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key.privateKey,
    data as BufferSource,
  );
  return { kid: key.kid, signature: new Uint8Array(signature) };
}

async function signJwt(
  claims: Record<string, string | number | string[]>,
  audience: string,
) {
  const key = await importOrCreateKey();
  const header = { alg: "ES256", typ: "JWT", kid: key.kid };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    iss: getSiteUrl(),
    aud: audience,
    iat: now,
    ...claims,
  };
  const signingInput = `${toBase64Url(encoder.encode(JSON.stringify(header)))}.${toBase64Url(encoder.encode(JSON.stringify(body)))}`;
  const { signature } = await signBytes(encoder.encode(signingInput));
  return `${signingInput}.${toBase64Url(signature)}`;
}

/** identity_assertion assinada pelo serviço (auth.md Step 3/5). */
export async function signIdentityAssertion(
  claims: Record<string, string | number>,
) {
  return signJwt(
    {
      ...claims,
      token_use: "identity_assertion",
    },
    getSiteUrl(),
  );
}

export async function verifyIdentityAssertion(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;

  const key = await importOrCreateKey();
  const signingInput = `${parts[0]}.${parts[1]}`;
  const valid = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    key.publicKey,
    fromBase64Url(parts[2]) as BufferSource,
    encoder.encode(signingInput),
  );
  if (!valid) return null;

  try {
    const claims = JSON.parse(decoder.decode(fromBase64Url(parts[1]))) as Record<
      string,
      unknown
    >;
    const exp = typeof claims.exp === "number" ? claims.exp : 0;
    if (!claims.sub || exp < Math.floor(Date.now() / 1000)) return null;
    if (claims.token_use && claims.token_use !== "identity_assertion") return null;
    return claims;
  } catch {
    return null;
  }
}

/** Código de autorização assinado (sem store server-side). */
export async function issueAuthorizationCode(input: {
  sub: string;
  email: string;
  name: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scope: string;
}) {
  const payload: AuthCodePayload = {
    v: 1,
    sub: input.sub,
    email: input.email,
    name: input.name,
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    code_challenge: input.codeChallenge,
    scope: input.scope,
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
  };
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const { signature } = await signBytes(encoder.encode(encoded));
  return `${encoded}.${toBase64Url(signature)}`;
}

export async function consumeAuthorizationCode(code: string) {
  const [encoded, signature] = code.split(".");
  if (!encoded || !signature) return null;

  const key = await importOrCreateKey();
  const valid = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    key.publicKey,
    fromBase64Url(signature) as BufferSource,
    encoder.encode(encoded),
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(decoder.decode(fromBase64Url(encoded))) as AuthCodePayload;
    if (payload.v !== 1 || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyPkceS256(verifier: string, challenge: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
  return toBase64Url(new Uint8Array(digest)) === challenge;
}

export async function issueAccessToken(input: {
  sub: string;
  email: string;
  name: string;
  clientId: string;
  scope: string;
}) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60;
  const accessToken = await signJwt(
    {
      sub: input.sub,
      email: input.email,
      name: input.name,
      scope: input.scope,
      exp,
      token_use: "access",
    },
    input.clientId,
  );
  const idToken = await signJwt(
    {
      sub: input.sub,
      email: input.email,
      name: input.name,
      exp,
    },
    input.clientId,
  );

  return {
    access_token: accessToken,
    id_token: idToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: input.scope,
  };
}

/** Valida access_token JWT (ES256) e devolve claims. */
export async function verifyAccessToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;

  const key = await importOrCreateKey();
  const signingInput = `${parts[0]}.${parts[1]}`;
  const valid = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    key.publicKey,
    fromBase64Url(parts[2]) as BufferSource,
    encoder.encode(signingInput),
  );
  if (!valid) return null;

  try {
    const claims = JSON.parse(decoder.decode(fromBase64Url(parts[1]))) as {
      sub?: string;
      email?: string;
      name?: string;
      exp?: number;
      token_use?: string;
    };
    if (!claims.sub || !claims.exp || claims.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (claims.token_use && claims.token_use !== "access") return null;
    return claims;
  } catch {
    return null;
  }
}

/** redirect_uri permitidos: mesma origem ou loopback (agentes locais / MCP). */
export function isAllowedRedirectUri(uri: string) {
  try {
    const url = new URL(uri);
    const site = new URL(getSiteUrl());
    if (url.origin === site.origin) return true;
    if (url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function oauthErrorRedirect(
  redirectUri: string,
  error: string,
  state: string | null,
  description?: string,
) {
  const url = new URL(redirectUri);
  url.searchParams.set("error", error);
  if (description) url.searchParams.set("error_description", description);
  if (state) url.searchParams.set("state", state);
  return url;
}
