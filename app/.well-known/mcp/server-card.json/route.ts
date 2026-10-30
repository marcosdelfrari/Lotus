import { buildMcpServerCard } from "@/lib/mcp-server";

/** /.well-known/mcp/server-card.json — MCP Server Card (SEP-1649). */
export function GET() {
  return Response.json(buildMcpServerCard(), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
