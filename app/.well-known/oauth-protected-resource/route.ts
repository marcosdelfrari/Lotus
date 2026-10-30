import { buildOAuthProtectedResourceMetadata } from "@/lib/oauth-as";

/** OAuth 2.0 Protected Resource Metadata — RFC 9728 */
export function GET() {
  return Response.json(buildOAuthProtectedResourceMetadata(), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
