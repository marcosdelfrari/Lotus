/**
 * POST /agent/event/notify — receptor de Security Event Tokens (RFC 8417).
 * Aceita notificações de revogação; scanners não precisam POST.
 */
export async function POST() {
  return Response.json(
    { status: "accepted" },
    {
      status: 202,
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
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
