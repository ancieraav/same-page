import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../src/', import.meta.url).pathname;
const extensions = new Set(['.ts', '.tsx', '.css', '.mjs']);
const failures = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (extensions.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      const lines = (await readFile(path, 'utf8')).split('\n').length;
      if (lines > 400) failures.push(`${relative(new URL('../', import.meta.url).pathname, path)}: ${lines} lines`);
    }
  }
}

await walk(root);
if (failures.length) {
  console.error(`Source files over 400 lines:\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Source-size check passed: every Next source file is at most 400 lines.');
}
