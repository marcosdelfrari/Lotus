import { buildOpenApiDocument } from "@/lib/agent-discovery";

/** /openapi.json — service-desc para agentes (application/openapi+json). */
export function GET() {
  const body = JSON.stringify(buildOpenApiDocument());

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
