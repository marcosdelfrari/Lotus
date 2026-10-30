import { buildJwks } from "@/lib/oauth-as";

/** JWKS do Authorization Server (OIDC / RFC 7517). */
export async function GET() {
  const body = await buildJwks();
  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
