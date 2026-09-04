// Thin client for the session API (used by UI + WebMCP operator tools).

async function parseOrThrow(response: Response): Promise<unknown> {
  const payload = (await response.json().catch(() => null)) as { error?: unknown } | null;
  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : `Request failed (${String(response.status)}).`);
  }
  return payload;
}

/** POST /api/rooms/<code>/session/<path>. Throws the server message on failure. */
export async function sessionPost(code: string, path: string, body: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/session/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseOrThrow(response);
}

/** GET /api/rooms/<code>/session. Throws the server message on failure. */
export async function sessionGet(code: string, guestId?: string): Promise<unknown> {
  const query = guestId ? `?guest_id=${encodeURIComponent(guestId)}` : '';
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/session${query}`);
  return parseOrThrow(response);
}

/** GET the operator-only room context hand-off for the external agent. */
export async function sessionContextGet(code: string, guestId: string): Promise<unknown> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/session/context?guest_id=${encodeURIComponent(guestId)}`);
  return parseOrThrow(response);
}
