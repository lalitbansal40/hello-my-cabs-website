/**
 * Load a few of the site's TypeScript/TSX modules in plain Node for a test — the approach
 * scripts/test/rating-summary.mjs uses, made reusable (21 Nov 2026). TypeScript's own
 * transpiler (no new dependency) writes each module into a temp folder; `@/x` and relative
 * imports are pointed at the transpiled copies; react resolves from the site's node_modules.
 *
 *   const mods = await loadTsx({ 'components/landing/RouteRoad': 'src/components/landing/RouteRoad.tsx', … });
 *   const { RouteRoad } = await mods.import('components/landing/RouteRoad');
 *   …
 *   mods.close();
 *
 * Every module a loaded file imports (other than react and type-only imports) must be in
 * the map too — an unlisted import fails loudly, which is how the test notices.
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

process.env.NEXT_PUBLIC_API_BASE_URL ||= 'http://localhost:4000/api/v1';
process.env.NEXT_PUBLIC_SITE_URL ||= 'https://www.hellomycabs.com';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(join(root, 'package.json'));

export async function loadTsx(files) {
  const ts = require('typescript');
  const out = mkdtempSync(join(tmpdir(), 'hmc-tsx-'));
  for (const [name, src] of Object.entries(files)) {
    let code = ts.transpileModule(readFileSync(join(root, src), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const here = dirname(name);
    code = code.replace(/from ['"](@\/|\.\.?\/)([^'"]+)['"]/g, (_, kind, p) => {
      const target = kind === '@/' ? p : join(here, kind === '../' ? `../${p}` : p);
      return `from ${JSON.stringify(pathToFileURL(join(out, target) + '.mjs').href)}`;
    });
    code = code.replace(/from ['"](react[^'"]*|next\/[^'"]+)['"]/g, (_, m) => `from ${JSON.stringify(pathToFileURL(require.resolve(m)).href)}`);
    mkdirSync(join(out, dirname(name)), { recursive: true });
    writeFileSync(join(out, name) + '.mjs', code);
  }
  const { renderToStaticMarkup } = await import(pathToFileURL(require.resolve('react-dom/server')).href);
  const { createElement } = await import(pathToFileURL(require.resolve('react')).href);
  return {
    import: (name) => import(pathToFileURL(join(out, name) + '.mjs').href),
    render: (component, props) => renderToStaticMarkup(createElement(component, props)),
    close: () => rmSync(out, { recursive: true, force: true }),
  };
}
