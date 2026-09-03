import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const expected = {
  'analytics.html': '56421ad1adcddc84b2f56b9eea3fb81c663a37186d82ea950fec0065ae8d033a',
  'comparison.html': 'a557427deda256abf89b4df12d162a59a92d64ca0482a3c92fdbb267fd68cbf0',
  'create.html': '851da4b5bbe43fa7d8f43b60356b746276607eb4c9948fa46dee66ab0e854d03',
  'index.html': '033f4fb801429276c38949b4c81a44011dc6fa09fdbe81daf21d0c36615f678e',
  'join.html': '1ee29a1f3249709d738304a822812567b8cd57a6056bf93c56be11a65a41d722',
  'meme.html': '19307eed2353b93e9bbcb63f42c31467fb699a0ded6d885582ad86ce93a47ce9',
  'participants.html': '40549a8a36304a52a9acd7e5f6b0574ea058be6d2e90d391ed7cc249a9ab8e47',
  'profile.html': '9282cc5236caee9b3a03e957fc4058f631e630c223b0009f01b12ca3528a7127',
  'session.html': '74be942e75a132cd146d602c6664d7137087a2b7fdc34b82b1d12b8bcfa0a4f4',
  'waiting.html': '2a0b820a7b4f670deccdfe9b1235d7fb662ed63843919b7de5a2fb1143ce2772',
};

const root = new URL('../archive/', import.meta.url);
for (const [file, hash] of Object.entries(expected)) {
  const value = createHash('sha256').update(await readFile(join(root.pathname, file))).digest('hex');
  if (value !== hash) throw new Error(`${file} changed: expected ${hash}, got ${value}`);
}
console.log('Original HTML check passed: all archived files are unchanged.');
