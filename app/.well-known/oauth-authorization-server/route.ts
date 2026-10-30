import { buildOAuthAuthorizationServerMetadata } from "@/lib/oauth-as";

/** OAuth 2.0 Authorization Server Metadata — RFC 8414 */
export function GET() {
  return Response.json(buildOAuthAuthorizationServerMetadata(), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
