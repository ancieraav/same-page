import { getDatabase, getRoomSnapshot, makeRoomId } from "../../../lib/room-server";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error";
}

export async function GET(request: Request) {
  try {
    const ids = new URL(request.url).searchParams
      .get("ids")
      ?.split(",")
      .map((id) => id.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 20);

    if (!ids?.length) return Response.json({ rooms: [] });

    const rooms = await Promise.all(ids.map((id) => getRoomSnapshot(id)));
    return Response.json({ rooms: rooms.filter(Boolean) });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      title?: string;
      context?: string;
      playerCount?: number;
      timerMinutes?: number;
      memeEnabled?: boolean;
    };

    const title = payload.title?.trim().slice(0, 100) || "Untitled alignment";
    const context = payload.context?.trim().slice(0, 50_000) || "";
    const playerCount = Math.min(12, Math.max(2, Number(payload.playerCount) || 2));
    const timerMinutes = Math.min(60, Math.max(1, Number(payload.timerMinutes) || 5));
    const memeEnabled = payload.memeEnabled !== false;
    const id = makeRoomId();
    const db = getDatabase();

    await db
      .prepare(
        `INSERT INTO rooms
          (id, title, context, player_count, timer_minutes, meme_enabled, status,
           current_question_index, questions_json, comparison_json, summary, meme_text)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'waiting', 0, '[]', '[]', '', '')`,
      )
      .bind(id, title, context, playerCount, timerMinutes, memeEnabled ? 1 : 0)
      .run();

    const room = await getRoomSnapshot(id);
    return Response.json({ room }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}
