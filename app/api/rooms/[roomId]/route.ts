import { getDatabase, getRoomSnapshot } from "../../../../lib/room-server";
import type { RoomComparison, RoomQuestion, RoomStatus } from "../../../../lib/room-types";

type RouteContext = { params: Promise<{ roomId: string }> };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error";
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { roomId } = await context.params;
    const room = await getRoomSnapshot(roomId.toUpperCase());
    if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
    return Response.json({ room });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { roomId } = await context.params;
    const payload = (await request.json()) as {
      status?: RoomStatus;
      currentQuestionIndex?: number;
      questions?: RoomQuestion[];
      comparison?: RoomComparison[];
      summary?: string;
      memeText?: string;
    };

    const updates: string[] = [];
    const values: unknown[] = [];
    if (payload.status && ["waiting", "asking", "live", "complete"].includes(payload.status)) {
      updates.push("status = ?");
      values.push(payload.status);
    }
    if (typeof payload.currentQuestionIndex === "number") {
      updates.push("current_question_index = ?");
      values.push(Math.max(0, Math.floor(payload.currentQuestionIndex)));
    }
    if (Array.isArray(payload.questions)) {
      updates.push("questions_json = ?");
      values.push(JSON.stringify(payload.questions).slice(0, 100_000));
    }
    if (Array.isArray(payload.comparison)) {
      updates.push("comparison_json = ?");
      values.push(JSON.stringify(payload.comparison).slice(0, 100_000));
    }
    if (typeof payload.summary === "string") {
      updates.push("summary = ?");
      values.push(payload.summary.slice(0, 20_000));
    }
    if (typeof payload.memeText === "string") {
      updates.push("meme_text = ?");
      values.push(payload.memeText.slice(0, 500));
    }

    if (!updates.length) return Response.json({ error: "No valid updates" }, { status: 400 });

    const db = getDatabase();
    const placeholders = updates.map((update, index) => update.replace("?", `?${index + 1}`));
    const roomIdParameter = values.length + 1;
    await db
      .prepare(
        `UPDATE rooms SET ${placeholders.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?${roomIdParameter}`,
      )
      .bind(...values, roomId.toUpperCase())
      .run();

    const room = await getRoomSnapshot(roomId.toUpperCase());
    if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
    return Response.json({ room });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}
