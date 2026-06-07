import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'dist/python');

await mkdir(outputDir, { recursive: true });
await copyFile(path.join(root, 'src/python/match_fields.py'), path.join(outputDir, 'match_fields.py'));
