// Assembles dist-artifact/ into ONE html fragment for the Artifact tool (it adds the html/head/body skeleton).
//   bunx vite build -c vite.artifact.config.ts && bun scripts/build-artifact.ts <out.html>
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(import.meta.dir, "../dist-artifact/assets");
const files = readdirSync(dist);
const js = readFileSync(join(dist, files.find((f) => f.endsWith(".js"))!), "utf8").replace(/<\/script/gi, "<\\/script");
const css = readFileSync(join(dist, files.find((f) => f.endsWith(".css"))!), "utf8").replace(/<\/style/gi, "<\\/style");
const out = process.argv[2] ?? join(import.meta.dir, "../evelo-content-engine.html");

const html = `<title>Evelo Content Engine</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Spec work sample by Jarret Roloff: a 30-day marketing and operations plan prepared for the Evelo Team. Not affiliated with or published by Evelo Team or Keller Williams.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap">
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`;
writeFileSync(out, html);
console.log("wrote", out, (html.length / 1024 / 1024).toFixed(2) + " MB");
