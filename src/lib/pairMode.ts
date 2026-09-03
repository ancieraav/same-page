// PAIR_MODE: hackathon simplification — 2-person room, no roles, no SOT, single invite code.
// REVIVE: set NEXT_PUBLIC_PAIR_MODE=0 (or flip this default to false) to restore
// groups & roles, multi-user (+3), SOT, per-group codes, combo 1..8.
export const PAIR_MODE: boolean = (process.env['NEXT_PUBLIC_PAIR_MODE'] ?? '1') !== '0';
export const PAIR_SIZE = 2;
