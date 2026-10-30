import { registerAnonymous } from "@/lib/agent-auth";

/** POST /agent/identity — registro agentic (auth.md Step 3). */
export async function POST(request: Request) {
  let body: { type?: string };
  try {
    body = (await request.json()) as { type?: string };
  } catch {
    return Response.json(
      { error: "invalid_request", error_description: "JSON body required" },
      { status: 400 },
    );
  }

  if (body.type !== "anonymous") {
    return Response.json(
      {
        error: "identity_type_not_enabled",
        error_description: "Only anonymous registration is enabled",
      },
      { status: 400 },
    );
  }

  const result = await registerAnonymous();
  return Response.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
