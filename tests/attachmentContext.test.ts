import { describe, expect, it } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import { extractDocxText, extractPdfText, extractSvgText } from '@/lib/attachmentContext';

function docxWithXml(xml: string): Uint8Array {
  const name = Buffer.from('word/document.xml');
  const data = Buffer.from(xml, 'utf8');
  const compressed = deflateRawSync(data);
  const local = Buffer.alloc(30 + name.length + compressed.length);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  name.copy(local, 30);
  compressed.copy(local, 30 + name.length);

  const central = Buffer.alloc(46 + name.length);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28);
  name.copy(central, 46);

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(local.length, 16);
  return Buffer.concat([local, central, end]);
}

describe('attachment context readers', () => {
  it('extracts text operators from a PDF', () => {
    const pdf = `%PDF-1.4\n1 0 obj\n<< /Length 43 >>\nstream\nBT\n(Readable PDF context) Tj\nET\nendstream\nendobj\n%%EOF`;
    expect(extractPdfText(new TextEncoder().encode(pdf))).toContain('Readable PDF context');
  });

  it('extracts paragraphs from a DOCX document XML entry', () => {
    const docx = docxWithXml('<w:document><w:body><w:p><w:r><w:t>Readable DOCX context</w:t></w:r></w:p></w:body></w:document>');
    expect(extractDocxText(docx)).toBe('Readable DOCX context');
  });

  it('keeps SVG content readable while removing scripts', () => {
    const svg = '<svg><script>alert(1)</script><text>Readable SVG context</text></svg>';
    const result = extractSvgText(new TextEncoder().encode(svg));
    expect(result).toContain('Readable SVG context');
    expect(result).not.toContain('alert(1)');
  });
});
