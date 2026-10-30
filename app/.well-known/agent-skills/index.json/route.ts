import { buildAgentSkillsIndex } from "@/lib/agent-skills";

/** /.well-known/agent-skills/index.json — Agent Skills Discovery RFC v0.2.0 */
export async function GET() {
  const body = await buildAgentSkillsIndex();
  return Response.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
