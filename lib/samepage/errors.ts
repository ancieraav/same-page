const FRIENDLY_ERRORS: Record<string, string> = {
  ROOM_NOT_FOUND: "We couldn't find that room. Check the code and try again.",
  ROOM_FULL: "This room is full. Ask the operator for another room.",
  ROOM_STARTED: "This room has already started, so new participants cannot join.",
  ROOM_NOT_READY: "The room needs the required number of participants before it can start.",
  OPERATOR_REQUIRED: "Only the room operator can perform this action.",
  AGENT_START_REQUIRED: "This room can only be started by the connected agent.",
  JOIN_LINK_REQUIRED: "This room requires the separate invite link and room code.",
  INVALID_ROLE: "That role is not available in this room.",
  STALE_QUESTION: "The room moved to another question. Refresh to continue.",
  RESPONSE_REQUIRED: "Submit an answer before continuing.",
  RESPONSE_NOT_ALLOWED: "You cannot submit a response in the current room state.",
  OPERATOR_CONTROLS_REQUIRED: "Only the operator or source of truth can edit questions.",
  ROOM_NOT_ACTIVE: "This room is not accepting responses right now.",
};

export class SamePageError extends Error {
  code: string;

  constructor(code: string, message = FRIENDLY_ERRORS[code] ?? code) {
    super(message);
    this.name = "SamePageError";
    this.code = code;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof SamePageError) return error.message;

  if (error && typeof error === "object") {
    const candidate = error as { code?: string; message?: string };
    if (candidate.code && FRIENDLY_ERRORS[candidate.code]) {
      return FRIENDLY_ERRORS[candidate.code];
    }

    const message = candidate.message ?? "";
    const knownCode = Object.keys(FRIENDLY_ERRORS).find((code) =>
      message.includes(code),
    );
    if (knownCode) return FRIENDLY_ERRORS[knownCode];
    if (message) return message;
  }

  return "Something went wrong. Try again in a moment.";
}
