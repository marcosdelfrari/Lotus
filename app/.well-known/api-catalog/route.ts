import {
  buildApiCatalogLinkset,
  homepageLinkHeaderValue,
} from "@/lib/agent-discovery";

const LINKSET_CONTENT_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

function catalogHeaders(): HeadersInit {
  return {
    "Content-Type": LINKSET_CONTENT_TYPE,
    Link: homepageLinkHeaderValue(),
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
  };
}

/** /.well-known/api-catalog — RFC 9727 */
export function GET() {
  // Evita Response.json() (força application/json) — scanners exigem linkset+json.
  return new Response(JSON.stringify(buildApiCatalogLinkset()), {
    status: 200,
    headers: catalogHeaders(),
  });
}

/** HEAD anuncia api-catalog e relações de discovery (RFC 9727 §2). */
export function HEAD() {
  return new Response(null, {
    status: 200,
    headers: catalogHeaders(),
  });
}
