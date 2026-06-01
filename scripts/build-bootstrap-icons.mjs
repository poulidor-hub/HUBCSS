import { createRequire } from 'node:module';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'dist/bootstrap-icons');

function packageDirectory(packageName) {
  try {
    return path.dirname(require.resolve(`${packageName}/package.json`));
  } catch {
    return null;
  }
}

const bootstrapIconsRoot = packageDirectory('bootstrap-icons');
if (!bootstrapIconsRoot) {
  throw new Error('Bootstrap Icons package was not found. Run npm install.');
}

const sourceDir = path.join(bootstrapIconsRoot, 'font');
const sourceCss = path.join(sourceDir, 'bootstrap-icons.css');
const sourceFontsDir = path.join(sourceDir, 'fonts');

for (const requiredPath of [sourceCss, path.join(sourceFontsDir, 'bootstrap-icons.woff'), path.join(sourceFontsDir, 'bootstrap-icons.woff2')]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Bootstrap Icons asset not found: ${requiredPath}`);
  }
}

await mkdir(path.join(outputDir, 'fonts'), { recursive: true });
const css = await readFile(sourceCss, 'utf8');
await writeFile(path.join(outputDir, 'bootstrap-icons.css'), css.replace(/^\/\*![\s\S]*?\*\/\s*/, ''), 'utf8');
await copyFile(path.join(sourceFontsDir, 'bootstrap-icons.woff'), path.join(outputDir, 'fonts/bootstrap-icons.woff'));
await copyFile(path.join(sourceFontsDir, 'bootstrap-icons.woff2'), path.join(outputDir, 'fonts/bootstrap-icons.woff2'));

console.log(`Copied Bootstrap Icons font assets at ${path.relative(root, outputDir)}`);