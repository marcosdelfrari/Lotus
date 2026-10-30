import { buildOpenIdConfiguration } from "@/lib/oauth-as";

/** OIDC Discovery — http://openid.net/specs/openid-connect-discovery-1_0.html */
export function GET() {
  return Response.json(buildOpenIdConfiguration(), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
