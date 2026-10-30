/** /health — status da superfície pública de discovery (RFC 8631 `status`). */
export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "lotus-agent-discovery",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
