import { SamePageError } from "@/lib/samepage/errors";
import { getRequestSupabase } from "@/lib/supabase/server";
import { normalizeRoomCode } from "@/lib/samepage/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  if (request.headers.get("x-samepage-agent-start") !== "webmcp") {
    return Response.json(
      { code: "AGENT_START_REQUIRED", error: "This room can only be started by the connected agent." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const { code } = await params;
    const normalizedCode = normalizeRoomCode(code);
    const { user, client } = await getRequestSupabase(request);
    const { data, error } = await client.rpc("start_room", {
      p_room_code: normalizedCode,
      p_operator_id: user.id,
    });

    if (error) throw error;
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const normalized =
      error instanceof SamePageError
        ? error
        : new SamePageError("START_FAILED", error instanceof Error ? error.message : "The room could not be started.");
    const status = normalized.code === "AUTH_REQUIRED" ? 401 : normalized.code === "OPERATOR_REQUIRED" ? 403 : 409;
    return Response.json(
      { code: normalized.code, error: normalized.message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
