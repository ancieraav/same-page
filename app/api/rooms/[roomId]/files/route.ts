import { getBucket, getDatabase, getRoomSnapshot } from "../../../../../lib/room-server";

type RouteContext = { params: Promise<{ roomId: string }> };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error";
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { roomId: rawRoomId } = await context.params;
    const roomId = rawRoomId.toUpperCase();
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    if (!fileEntry || typeof fileEntry === "string") {
      return Response.json({ error: "A file is required" }, { status: 400 });
    }
    if (fileEntry.size > 10 * 1024 * 1024) {
      return Response.json({ error: "Files must be 10 MB or smaller" }, { status: 413 });
    }

    const db = getDatabase();
    const room = await getRoomSnapshot(roomId);
    if (!room) return Response.json({ error: "Room not found" }, { status: 404 });

    const fileId = crypto.randomUUID();
    const safeFilename = fileEntry.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "upload";
    const r2Key = `rooms/${roomId}/${fileId}-${safeFilename}`;
    const bucket = getBucket();
    await bucket.put(r2Key, fileEntry.stream(), {
      httpMetadata: { contentType: fileEntry.type || "application/octet-stream" },
    });

    await db
      .prepare(
        `INSERT INTO room_files (id, room_id, filename, content_type, size_bytes, r2_key)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
      )
      .bind(fileId, roomId, safeFilename, fileEntry.type || "application/octet-stream", fileEntry.size, r2Key)
      .run();

    return Response.json({ ok: true, room: await getRoomSnapshot(roomId) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}
