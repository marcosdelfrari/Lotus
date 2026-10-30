import { buildAuthMd } from "@/lib/agent-auth";

/** /auth.md — skill de registro agentic (WorkOS auth.md). */
export function GET() {
  return new Response(buildAuthMd(), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
