/* ============================================================================
   Bundle the app into ONE self-contained HTML file.

   The app normally ships as ES modules, which need a real web server. This
   flattens it into a single file that runs from anywhere — a Claude artifact,
   an email attachment, a USB stick, any static host, even file://.

     node build-single-file.mjs              -> dist/fun-focus.html (standalone)
     node build-single-file.mjs --artifact   -> dist/fun-focus.artifact.html

   The artifact variant omits <!doctype>/<html>/<head>/<body>, because the
   artifact host supplies those and wraps whatever it is given.

   This is a derived build. Never edit the output — edit the modules and
   re-run. Sources are concatenated in dependency order with import/export
   stripped, which works because no two modules declare the same top-level
   name. If that ever stops being true the build will throw rather than
   silently shadow something.
   ========================================================================= */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const artifactMode = process.argv.includes('--artifact');

/* Dependency order. Anything a module uses must appear above it. */
const MODULES = [
  'js/config.js',
  'js/ui.js',
  'js/store.js',
  'js/chain.js',
  'js/data/roster.js',
  'js/data/fun-content.js',
  'js/data/chants.js',
  'js/data/reveal.js',
  'js/data/hype.js',
  'js/data/phase1.js',
  'js/data/phase2.js',
  'js/data/phase3.js',
  'js/data/phase4.js',
  'js/data/phases.js',
  'js/data/field-geometry.js',
  'js/data/play-engine.js',
  'js/data/live-reps.js',
  'js/field.js',
  'js/fun.js',
  'js/live.js',
  'js/focus.js',
  'js/app.js',
];

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

/**
 * Strip ES module syntax:
 *   `import ... from '...';`     removed outright
 *   `export const|function|...`  the keyword removed, declaration kept
 *   `export { A, B };`           removed outright (re-export lists)
 */
function stripModuleSyntax(src) {
  return src
    .replace(/^\s*import\s+[^;]*?;[ \t]*$/gm, '')
    .replace(/^\s*export\s*\{[^}]*\}\s*;?[ \t]*$/gm, '')
    .replace(/^export\s+(?=(const|let|var|function|async function|class)\b)/gm, '');
}

/** Nothing may survive stripping — a leftover keyword is a syntax error in
 *  the bundle, which only shows up as a blank page at runtime. */
function assertNoModuleSyntax(src, rel) {
  const stray = src.split('\n').findIndex((l) => /^\s*(import|export)\b/.test(l));
  if (stray !== -1) {
    throw new Error(`${rel}:${stray + 1} still has module syntax after stripping:\n  ${src.split('\n')[stray].trim()}`);
  }
}

/** Top-level declarations, so collisions between modules are caught. */
function topLevelNames(src) {
  const names = new Set();
  const re = /^(?:const|let|var|function|async function|class)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  return names;
}

const seen = new Map();
const chunks = [];

for (const rel of MODULES) {
  const src = stripModuleSyntax(read(rel));
  assertNoModuleSyntax(src, rel);

  for (const name of topLevelNames(src)) {
    if (seen.has(name)) {
      throw new Error(
        `Name collision: "${name}" declared in both ${seen.get(name)} and ${rel}. ` +
          `Rename one before bundling.`,
      );
    }
    seen.set(name, rel);
  }

  chunks.push(`/* ===== ${rel} ${'='.repeat(Math.max(0, 62 - rel.length))} */\n${src.trim()}`);
}

let script = chunks.join('\n\n');

/* No sw.js next to a single file — the registration would only 404. */
script = script.replace(
  /^registerServiceWorker\(\);$/m,
  '/* Service worker intentionally skipped in the single-file build. */',
);

const css = read('styles.css');
const fonts =
  '<link rel="preconnect" href="https://fonts.googleapis.com" />\n' +
  '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n' +
  '    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700;800&display=swap" />';

const title = 'Fun &amp; Focus';

let out;

if (artifactMode) {
  // Content only — the artifact host supplies the document skeleton.
  out = `<title>${title}</title>
${fonts}
<style>
${css}
</style>

<div id="app"></div>

<script>
${script}
</script>
`;
} else {
  const icon = read('icon.svg').trim();
  const iconHref = `data:image/svg+xml;utf8,${encodeURIComponent(icon)}`;

  out = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${title} — The Creamsicles</title>
    <meta name="description" content="Fun &amp; Focus — the Creamsicles' companion app. Situational baseball practice." />
    <meta name="theme-color" content="#DB7518" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Fun &amp; Focus" />
    <link rel="icon" href="${iconHref}" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="${iconHref}" />
    ${fonts}
    <style>
${css}
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
${script}
    </script>
  </body>
</html>
`;
}

const outPath = join(ROOT, 'dist', artifactMode ? 'fun-focus.artifact.html' : 'fun-focus.html');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, out);

const kb = (out.length / 1024).toFixed(1);
console.log(`${outPath}  (${kb} KB, ${MODULES.length} modules, ${seen.size} top-level names)`);
