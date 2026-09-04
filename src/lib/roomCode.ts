// Room code utilities — 7-char human-friendly codes (no 0/O/1/I/L).

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 7;

export function generateRoomCode(random: () => number = Math.random): string {
  let code = '';
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += ALPHABET[Math.floor(random() * ALPHABET.length)] ?? 'A';
  }
  return code;
}

export function normalizeRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

export function isValidRoomCode(input: string): boolean {
  return /^[A-Z2-9HJKMNP-TV-Z]{7}$/.test(input);
}
