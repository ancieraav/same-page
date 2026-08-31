import { getDatabase, getRoomSnapshot, makeToken } from "../../../../../lib/room-server";

type RouteContext = { params: Promise<{ roomId: string }> };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error";
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { roomId: rawRoomId } = await context.params;
    const roomId = rawRoomId.toUpperCase();
    const payload = (await request.json()) as { name?: string };
    const name = payload.name?.trim().slice(0, 50);
    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });

    const db = getDatabase();
    const room = await getRoomSnapshot(roomId);
    if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
    if (room.players.length >= room.playerCount) {
      return Response.json({ error: "This room is full" }, { status: 409 });
    }

    const seatRow = await db
      .prepare("SELECT COUNT(*) AS player_count FROM players WHERE room_id = ?1")
      .bind(roomId)
      .first<{ player_count: number }>();
    const seat = Number(seatRow?.player_count ?? 0) + 1;
    const player = {
      id: crypto.randomUUID(),
      token: makeToken(),
      name,
      seat,
    };

    await db
      .prepare(
        `INSERT INTO players (id, room_id, name, player_token, seat)
         VALUES (?1, ?2, ?3, ?4, ?5)`,
      )
      .bind(player.id, roomId, player.name, player.token, player.seat)
      .run();

    return Response.json({ player, room: await getRoomSnapshot(roomId) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}
