import { buildLlmsTxt } from "@/lib/agent-discovery";

/** /llms.txt — describedby para agentes/LLMs */
export function GET() {
  return new Response(buildLlmsTxt(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
