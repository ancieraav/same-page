// Helpers for agent-driven remote attachments (add_attachment_from_url).
// Browsers forbid silent local file access, so an agent adds bytes by
// fetching an http(s) URL and turning the response into a File.

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

const MIME_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/svg+xml': 'svg',
};

export const SUPPORTED_ATTACHMENT_EXTENSIONS = ['pdf', 'docx', 'png', 'svg', 'jpg', 'jpeg'] as const;
export const SUPPORTED_ATTACHMENT_LABEL = 'PDF, DOCX, PNG, SVG, or JPG';

function extensionOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

/** True when a file name and optional MIME type are in the room-context set. */
export function isSupportedAttachment(name: string, mime: string | null = null): boolean {
  const extension = extensionOf(name);
  if (!(SUPPORTED_ATTACHMENT_EXTENSIONS as readonly string[]).includes(extension)) return false;
  const normalizedMime = mime?.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!normalizedMime || normalizedMime === 'application/octet-stream') return true;
  const mimeExtension = extensionFromMime(normalizedMime);
  return mimeExtension === extension || (mimeExtension === 'jpg' && extension === 'jpeg');
}

/** Public format label used by both the form and server validation errors. */
export function attachmentFormat(name: string): string {
  const extension = extensionOf(name);
  return extension === 'jpeg' ? 'JPG' : extension.toUpperCase();
}

export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function extensionFromMime(mime: string | null): string | null {
  if (!mime) return null;
  const clean = mime.split(';')[0]?.trim().toLowerCase() ?? '';
  return MIME_EXTENSION[clean] ?? null;
}

function sanitizeFileName(value: string): string {
  const base = value.split('/').pop() ?? value;
  const clean = decodeURIComponent(base).replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return clean.slice(0, 120) || 'downloaded-file';
}

/** Derive a file name from URL path, explicit suggestion, or MIME type. */
export function remoteFileName(url: string, contentType: string | null, suggested?: string): string {
  if (suggested?.trim()) {
    const clean = sanitizeFileName(suggested.trim());
    if (clean.includes('.')) return clean;
    const ext = extensionFromMime(contentType);
    return ext ? `${clean}.${ext}` : clean;
  }
  try {
    const pathname = new URL(url).pathname;
    const last = pathname.split('/').pop();
    if (last?.includes('.')) return sanitizeFileName(last);
    if (last) {
      const ext = extensionFromMime(contentType);
      return sanitizeFileName(ext ? `${last}.${ext}` : last);
    }
  } catch {
    // Fall through to MIME-based fallback below.
  }
  const ext = extensionFromMime(contentType);
  return ext ? `downloaded-file.${ext}` : 'downloaded-file';
}

export function maxAttachmentBytes(): number {
  return MAX_ATTACHMENT_BYTES;
}
