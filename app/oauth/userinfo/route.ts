import { getSession } from "@/lib/auth";
import { OAUTH_AS, verifyAccessToken } from "@/lib/oauth-as";
import { absoluteUrl } from "@/lib/site-url";

function bearerChallenge(error?: string) {
  const metadata = absoluteUrl(OAUTH_AS.protectedResource);
  const parts = [`Bearer resource_metadata="${metadata}"`];
  if (error) parts.push(`error="${error}"`);
  return parts.join(", ");
}

/**
 * OIDC UserInfo — Bearer access_token (JWT) ou cookie de sessão.
 * 401 inclui resource_metadata (RFC 9728).
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const claims = await verifyAccessToken(auth.slice(7).trim());
    if (!claims?.sub) {
      return Response.json(
        { error: "invalid_token" },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": bearerChallenge("invalid_token"),
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
    return Response.json(
      {
        sub: claims.sub,
        email: claims.email,
        name: claims.name,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const session = await getSession();
  if (!session) {
    return Response.json(
      { error: "invalid_token" },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": bearerChallenge("invalid_token"),
        },
      },
    );
  }

  return Response.json(
    {
      sub: session.userId,
      email: session.email,
      name: session.name,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
