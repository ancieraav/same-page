import { NextResponse } from 'next/server';

/** Deprecated: replaced by send_question_context (one question per call). */
export async function POST() {
  await Promise.resolve();
  return NextResponse.json(
    { error: 'publish_next_question is retired. Send one question at a time with send_question_context.' },
    { status: 410 },
  );
}
