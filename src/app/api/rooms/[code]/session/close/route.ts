import { NextResponse } from 'next/server';

/** Deprecated: replaced by stop_session + send_room_summary. */
export async function POST() {
  await Promise.resolve();
  return NextResponse.json(
    { error: 'close_session is retired. Call stop_session, then send_room_summary.' },
    { status: 410 },
  );
}
