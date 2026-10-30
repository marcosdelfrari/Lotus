import { startClaim } from "@/lib/agent-auth";

/** POST /agent/identity/claim — inicia claim ceremony (auth.md Step 4). */
export async function POST(request: Request) {
  let body: { claim_token?: string; email?: string };
  try {
    body = (await request.json()) as { claim_token?: string; email?: string };
  } catch {
    return Response.json(
      { error: "invalid_request", error_description: "JSON body required" },
      { status: 400 },
    );
  }

  if (!body.claim_token || !body.email) {
    return Response.json(
      {
        error: "invalid_request",
        error_description: "claim_token and email are required",
      },
      { status: 400 },
    );
  }

  const result = await startClaim({
    claimToken: body.claim_token,
    email: body.email,
  });

  if ("error" in result) {
    return Response.json(
      { error: result.error },
      {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  }

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
