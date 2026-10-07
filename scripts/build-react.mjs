import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'dist/react');

const components = [
  'index',
  'Icon',
  'HighlightText',
  'SearchBadgeBar',
  'SearchInput',
  'Skeleton',
  'EmptyState',
  'Timeline',
  'StatCard',
  'PageHeader',
  'Modal',
];

await mkdir(outputDir, { recursive: true });

for (const name of components) {
  await copyFile(path.join(root, `src/react/${name}.js`), path.join(outputDir, `${name}.js`));
  await copyFile(path.join(root, `src/react/${name}.d.ts`), path.join(outputDir, `${name}.d.ts`));
}