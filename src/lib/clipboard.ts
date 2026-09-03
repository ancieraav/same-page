export async function copyText(value: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('clipboard' in navigator)) return false;

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export async function pasteText(): Promise<string | null> {
  if (typeof navigator === 'undefined' || !('clipboard' in navigator)) return null;

  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

export function cleanRoomCode(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
}
