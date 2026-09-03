import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../src/', import.meta.url).pathname;
const extensions = new Set(['.ts', '.tsx', '.css', '.mjs']);
const maxLines = 400;
const failures = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (extensions.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      const lines = (await readFile(path, 'utf8')).split('\n').length;
      if (lines > maxLines) {
        failures.push({
          path: relative(new URL('../', import.meta.url).pathname, path),
          lines,
        });
      }
    }
  }
}

await walk(root);
if (failures.length) {
  const oversizedFiles = failures
    .map(({ path, lines }) => `- ${path}: ${lines} lines (limit: ${maxLines})`)
    .join('\n');

  console.error([
    'Source-size check failed.',
    '',
    'The following source files exceed the maximum allowed size:',
    oversizedFiles,
    '',
    'For each oversized file, document the following:',
    '1. Review the complete contents of the oversized file.',
    '2. Identify the components, hooks, utilities, functions, or logical sections that can be extracted.',
    '3. Determine the most appropriate destination for each extracted part:',
    '   3.1. Search for existing files with related functionality that have enough room to remain within the source-size limit after the move, then move the extracted code there.',
    '   3.2. If no suitable existing file is available, create a new file with a clear and representative name, then move the extracted code there.',
  ].join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Source-size check passed: every Next source file is at most ${maxLines} lines.`);
}
