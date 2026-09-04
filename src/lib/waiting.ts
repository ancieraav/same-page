// Shared waiting-room constants (safe for client + server).

export const WAITING_EMOJIS = ['👋', '☕', '🚀', '💡', '🔥', '🎉', '❤️', '👏'] as const;

export const WAITING_NAME_MAX = 40;
export const WAITING_CHAT_MAX = 280;
export const WAITING_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const WAITING_ROOM_SIZE = 2;
export const WAITING_ONLINE_SECONDS = 90;
