import { POPPY_PATH, buildPoppyManifest } from "@/lib/poppy";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
} as const;

/** /.well-known/poppy.json — Personal Agent Protocol discovery */
export function GET(request: Request) {
  return Response.json(buildPoppyManifest(request), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      Link: `<${POPPY_PATH}>; rel="describedby"; type="application/json"`,
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
