import {
  exchangeIdentityAssertion,
  pollClaimGrant,
} from "@/lib/agent-auth";
import {
  OAUTH_PUBLIC_CLIENT_ID,
  consumeAuthorizationCode,
  issueAccessToken,
  verifyPkceS256,
} from "@/lib/oauth-as";

function formValue(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value : null;
}

function tokenError(error: string, description: string, status = 400) {
  return Response.json(
    { error, error_description: description },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

function tokenOk(body: unknown) {
  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

/** OAuth 2.0 Token — authorization_code, jwt-bearer, claim grant. */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/x-www-form-urlencoded")) {
    return tokenError(
      "invalid_request",
      "Content-Type must be application/x-www-form-urlencoded",
    );
  }

  const form = await request.formData();
  const grantType = formValue(form, "grant_type");
  const clientId = formValue(form, "client_id") || OAUTH_PUBLIC_CLIENT_ID;

  if (grantType === "urn:ietf:params:oauth:grant-type:jwt-bearer") {
    const assertion = formValue(form, "assertion");
    if (!assertion) {
      return tokenError("invalid_request", "assertion is required");
    }
    const tokens = await exchangeIdentityAssertion(assertion, clientId);
    if (!tokens) {
      return tokenError("invalid_grant", "identity_assertion is invalid or expired");
    }
    return tokenOk(tokens);
  }

  if (grantType === "urn:workos:agent-auth:grant-type:claim") {
    const claimToken = formValue(form, "claim_token");
    if (!claimToken) {
      return tokenError("invalid_request", "claim_token is required");
    }
    const result = await pollClaimGrant(claimToken, clientId);
    if ("error" in result) {
      if (result.error === "authorization_pending") {
        return tokenError("authorization_pending", "Waiting for user to complete claim");
      }
      return tokenError("invalid_grant", "claim_token is invalid or expired");
    }
    return tokenOk(result);
  }

  if (grantType !== "authorization_code") {
    return tokenError(
      "unsupported_grant_type",
      "Supported: authorization_code, jwt-bearer, claim",
    );
  }

  const code = formValue(form, "code");
  const redirectUri = formValue(form, "redirect_uri");
  const codeVerifier = formValue(form, "code_verifier");

  if (!code || !redirectUri || !codeVerifier) {
    return tokenError(
      "invalid_request",
      "code, redirect_uri and code_verifier are required",
    );
  }

  const payload = await consumeAuthorizationCode(code);
  if (!payload) {
    return tokenError("invalid_grant", "Authorization code is invalid or expired");
  }

  if (payload.client_id !== clientId || payload.redirect_uri !== redirectUri) {
    return tokenError("invalid_grant", "client_id or redirect_uri mismatch");
  }

  const pkceOk = await verifyPkceS256(codeVerifier, payload.code_challenge);
  if (!pkceOk) {
    return tokenError("invalid_grant", "PKCE verification failed");
  }

  const tokens = await issueAccessToken({
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    clientId,
    scope: payload.scope,
  });

  return tokenOk(tokens);
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
