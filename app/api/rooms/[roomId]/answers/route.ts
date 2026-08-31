import { getDatabase, getRoomSnapshot } from "../../../../../lib/room-server";

type RouteContext = { params: Promise<{ roomId: string }> };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error";
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { roomId: rawRoomId } = await context.params;
    const roomId = rawRoomId.toUpperCase();
    const db = getDatabase();
    const rows = await db
      .prepare(
        `SELECT p.name, p.seat, a.question_id, a.answer, a.submitted_at
         FROM answers a
         JOIN players p ON p.id = a.player_id
         WHERE a.room_id = ?1
         ORDER BY a.question_id ASC, p.seat ASC`,
      )
      .bind(roomId)
      .all();
    return Response.json({ answers: rows.results ?? [] });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { roomId: rawRoomId } = await context.params;
    const roomId = rawRoomId.toUpperCase();
    const payload = (await request.json()) as {
      playerToken?: string;
      questionId?: string;
      answer?: string;
    };
    const playerToken = payload.playerToken?.trim();
    const questionId = payload.questionId?.trim().slice(0, 100);
    const answer = payload.answer?.trim().slice(0, 5_000);
    if (!playerToken || !questionId || !answer) {
      return Response.json({ error: "playerToken, questionId, and answer are required" }, { status: 400 });
    }

    const db = getDatabase();
    const player = await db
      .prepare("SELECT id FROM players WHERE room_id = ?1 AND player_token = ?2 LIMIT 1")
      .bind(roomId, playerToken)
      .first<{ id: string }>();
    if (!player) return Response.json({ error: "Player token is invalid" }, { status: 403 });

    await db
      .prepare(
        `INSERT INTO answers (room_id, player_id, question_id, answer)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(player_id, question_id)
         DO UPDATE SET answer = excluded.answer, submitted_at = CURRENT_TIMESTAMP`,
      )
      .bind(roomId, player.id, questionId, answer)
      .run();

    return Response.json({ ok: true, room: await getRoomSnapshot(roomId) });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}
