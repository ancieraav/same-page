import { describe, expect, it } from 'vitest';
import {
  isSupportedAttachment,
  extensionFromMime,
  isHttpUrl,
  maxAttachmentBytes,
  remoteFileName,
} from '@/lib/attachmentRemote';

describe('attachmentRemote helpers', () => {
  it('accepts only http(s) URLs', () => {
    expect(isHttpUrl('https://example.com/a.pdf')).toBe(true);
    expect(isHttpUrl('http://example.com/a.pdf')).toBe(true);
    expect(isHttpUrl('ftp://example.com/a.pdf')).toBe(false);
    expect(isHttpUrl('not a url')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
  });

  it('maps MIME types to extensions', () => {
    expect(extensionFromMime('application/pdf')).toBe('pdf');
    expect(extensionFromMime('image/jpeg; charset=binary')).toBe('jpg');
    expect(extensionFromMime('application/octet-stream')).toBe(null);
    expect(extensionFromMime(null)).toBe(null);
  });

  it('accepts only the formats readable by the room agent', () => {
    expect(isSupportedAttachment('brief.pdf', 'application/pdf')).toBe(true);
    expect(isSupportedAttachment('brief.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
    expect(isSupportedAttachment('diagram.png', 'image/png')).toBe(true);
    expect(isSupportedAttachment('diagram.svg', 'image/svg+xml')).toBe(true);
    expect(isSupportedAttachment('photo.jpg', 'image/jpeg')).toBe(true);
    expect(isSupportedAttachment('sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(false);
    expect(isSupportedAttachment('legacy.doc', 'application/msword')).toBe(false);
    expect(isSupportedAttachment('image.webp', 'image/webp')).toBe(false);
  });

  it('derives file names from suggestion, URL, or MIME', () => {
    expect(remoteFileName('https://x.com/brief.pdf', null)).toBe('brief.pdf');
    expect(remoteFileName('https://x.com/brief.pdf', null, 'renamed.pdf')).toBe('renamed.pdf');
    expect(remoteFileName('https://x.com/brief.pdf', 'application/pdf', 'renamed')).toBe('renamed.pdf');
    expect(remoteFileName('https://x.com/brief.pdf', null, 'renamed')).toBe('renamed');
    expect(remoteFileName('https://x.com/download?id=1', 'application/pdf')).toBe('download.pdf');
    expect(remoteFileName('https://x.com/', null)).toBe('downloaded-file');
  });

  it('caps attachments at 25MB', () => {
    expect(maxAttachmentBytes()).toBe(25 * 1024 * 1024);
  });
});
