#!/usr/bin/env node
/* One Lick at a Time — inliner.
 * Flattens the split repo (css/ js/ assets/) into ONE self-contained .html:
 *   - css/styles.css  -> <style>, with @font-face url(../assets/fonts/*.woff2) -> base64 data URIs
 *   - js/*.js         -> inline <script> (original order preserved)
 *   - assets/logo.svg -> inline data URI on the <img>
 *   - manifest + png icon links + service-worker registration are stripped
 *     (a single hosted file can't use them)
 * The split repo remains the source of truth; this file is generated for preview/offline use.
 *
 * Usage: node build/inline.js [outfile]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const out = process.argv[2] || path.join(ROOT, "one-lick-standalone.html");
const R = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const B64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString("base64");

// 1) CSS with fonts inlined as data URIs
let css = R("css/styles.css").replace(
  /url\(['"]?\.\.\/assets\/fonts\/([^'")]+)['"]?\)/g,
  (_, file) => `url(data:font/woff2;base64,${B64("assets/fonts/" + file)})`
);

// 2) JS bundle (order matters: licks -> audio -> tab -> app)
const jsFiles = ["js/licks.js", "js/audio.js", "js/tab.js", "js/app.js"];
let js = jsFiles.map(R).join("\n;\n")
  // remove service-worker registration for the single-file build
  .replace(/if\s*\(\s*"serviceWorker"[\s\S]*?register\("sw\.js"\)\.catch\(\(\)=>\{\}\);\s*\}\);\s*\}/,
           "/* service worker omitted in standalone build */");

// 3) logo as data URI
const logo = "data:image/svg+xml;base64," + B64("assets/logo.svg");

let html = R("index.html");

// strip things that only work as separate files
html = html
  .replace(/<link rel="manifest"[^>]*>\s*/i, "")
  .replace(/<link rel="icon" href="assets\/favicon-48\.png"[^>]*>\s*/i, "")
  .replace(/<link rel="apple-touch-icon"[^>]*>\s*/i, "")
  .replace(/<link rel="icon" href="assets\/favicon\.svg"[^>]*>/i,
           '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,' + B64("assets/favicon.svg") + '">');

// swap logo src -> data URI
html = html.replace(/(<img class="logo"[^>]*\bsrc=")[^"]*(")/i, `$1${logo}$2`);

// replace stylesheet link with inline style
html = html.replace(/<link rel="stylesheet" href="css\/styles\.css">/i, `<style>\n${css}\n</style>`);

// replace the four script tags with one inline bundle
html = html.replace(
  /<script src="js\/licks\.js"><\/script>\s*<script src="js\/audio\.js"><\/script>\s*<script src="js\/tab\.js"><\/script>\s*<script src="js\/app\.js"><\/script>/i,
  `<script>\n${js}\n</script>`
);

fs.writeFileSync(out, html);
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`Wrote ${path.relative(ROOT, out)} (${kb} KB)`);
