import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = resolve(new URL('../src/', import.meta.url).pathname);
const forbiddenRuntimeReferences = ['legacy-runtime', "readFileSync(join(process.cwd(), 'app.js'))", 'dangerouslySetInnerHTML'];

async function sourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (/\.(ts|tsx|css)$/.test(entry.name)) files.push(path);
  }
  return files;
}

describe('Next source invariants', () => {
  it('has no legacy runtime dependency', async () => {
    for (const path of await sourceFiles(sourceRoot)) {
      const source = await readFile(path, 'utf8');
      for (const reference of forbiddenRuntimeReferences) expect(source, path).not.toContain(reference);
    }
  });

  it('keeps every source file under 400 lines', async () => {
    for (const path of await sourceFiles(sourceRoot)) {
      const lines = (await readFile(path, 'utf8')).split('\n').length;
      expect(lines, path).toBeLessThanOrEqual(400);
    }
  });
});
