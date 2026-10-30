import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import {
  OAUTH_PUBLIC_CLIENT_ID,
  isAllowedRedirectUri,
  issueAuthorizationCode,
  oauthErrorRedirect,
} from "@/lib/oauth-as";

/**
 * OAuth 2.0 Authorization Endpoint (authorization_code + PKCE S256).
 * Sem sessão → /login; com sessão → emite code e redireciona.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const responseType = url.searchParams.get("response_type");
  const clientId = url.searchParams.get("client_id") || OAUTH_PUBLIC_CLIENT_ID;
  const redirectUri = url.searchParams.get("redirect_uri");
  const state = url.searchParams.get("state");
  const scope = url.searchParams.get("scope") || "openid profile email";
  const codeChallenge = url.searchParams.get("code_challenge");
  const codeChallengeMethod = url.searchParams.get("code_challenge_method");

  if (!redirectUri || !isAllowedRedirectUri(redirectUri)) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description:
          "redirect_uri is required and must be same-origin or loopback (localhost / 127.0.0.1)",
      },
      { status: 400 },
    );
  }

  if (responseType !== "code") {
    return NextResponse.redirect(
      oauthErrorRedirect(redirectUri, "unsupported_response_type", state),
    );
  }

  if (!codeChallenge || codeChallengeMethod !== "S256") {
    return NextResponse.redirect(
      oauthErrorRedirect(
        redirectUri,
        "invalid_request",
        state,
        "PKCE S256 (code_challenge + code_challenge_method=S256) is required",
      ),
    );
  }

  const session = await getSession();
  if (!session) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("next", `${url.pathname}${url.search}`);
    return NextResponse.redirect(login);
  }

  const code = await issueAuthorizationCode({
    sub: session.userId,
    email: session.email,
    name: session.name,
    clientId,
    redirectUri,
    codeChallenge,
    scope,
  });

  const target = new URL(redirectUri);
  target.searchParams.set("code", code);
  if (state) target.searchParams.set("state", state);
  return NextResponse.redirect(target);
}
