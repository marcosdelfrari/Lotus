import { AI_CATALOG_PATH, buildAiCatalog } from "@/lib/ai-catalog";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
} as const;

/** /.well-known/ai-catalog.json — ARD / AI Catalog capability manifest */
export function GET() {
  return Response.json(buildAiCatalog(), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      Link: `<${AI_CATALOG_PATH}>; rel="describedby"; type="application/json"`,
      ...CORS_HEADERS,
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      "Access-Control-Max-Age": "86400",
    },
  });
}
