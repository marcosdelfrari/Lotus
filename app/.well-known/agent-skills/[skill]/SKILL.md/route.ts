import { getAgentSkill } from "@/lib/agent-skills";

type Params = { params: Promise<{ skill: string }> };

/** /.well-known/agent-skills/{name}/SKILL.md */
export async function GET(_request: Request, { params }: Params) {
  const { skill: name } = await params;
  const skill = getAgentSkill(name);

  if (!skill) {
    return new Response("Skill not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(skill.body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
