// Offline source-module loader using the project's existing TypeScript transpiler.
// Temp modules preserve aliases without adding a runtime transpiler dependency.
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(join(root, 'package.json'));
const ts = require('typescript');

export async function sourceModules(files, overrides = {}) {
  const out = mkdtempSync(join(tmpdir(), 'hmc-seo-source-'));
  const names = new Set([...Object.keys(files), ...Object.keys(overrides)]);
  try {
    for (const name of names) {
      const source = overrides[name] ?? readFileSync(join(root, files[name]), 'utf8');
      let code = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }).outputText;
      code = code.replace(/from\s+['"]([^'"]+)['"]/g, (_, specifier) => {
        if (specifier.startsWith('@/') || specifier.startsWith('.')) {
          const target = specifier.startsWith('@/')
            ? specifier.slice(2)
            : join(dirname(name), specifier);
          if (!names.has(target)) throw new Error(`Missing source module: ${target}`);
          return `from ${JSON.stringify(pathToFileURL(join(out, `${target}.mjs`)).href)}`;
        }
        return `from ${JSON.stringify(pathToFileURL(require.resolve(specifier)).href)}`;
      });
      mkdirSync(dirname(join(out, name)), { recursive: true });
      writeFileSync(join(out, `${name}.mjs`), code);
    }
    return {
      load: (name) => import(pathToFileURL(join(out, `${name}.mjs`)).href),
      close: () => rmSync(out, { recursive: true, force: true }),
    };
  } catch (error) {
    rmSync(out, { recursive: true, force: true });
    throw error;
  }
}
