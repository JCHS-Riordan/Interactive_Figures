'use strict';

const fs = require('fs');
const path = require('path');

/**
 * The corpus files are CodePen-style panes: Name.html is body markup only (it ends
 * with the CDN + package <script src> tags), Name.css and Name.js are separate and
 * are NOT referenced from the .html. So a runnable page has to be assembled, with
 * the .js last so it runs after Highcharts and the JCHS package have loaded.
 *
 * `highcharts-light` on <html> matches what the published dist/index.html wrappers
 * carry - without it Highcharts v13's light-dark() CSS follows the runner's OS theme
 * and every snapshot would differ for a reason that has nothing to do with the package.
 */
function discover(corpusDir, packagePrefix) {
  const entries = fs
    .readdirSync(corpusDir)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .sort();

  const found = [];
  const skipped = [];

  for (const file of entries) {
    const name = file.replace(/\.html$/i, '');
    const htmlPath = path.join(corpusDir, file);
    const cssPath = path.join(corpusDir, name + '.css');
    const jsPath = path.join(corpusDir, name + '.js');

    const html = fs.readFileSync(htmlPath, 'utf8');
    const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
    const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : '';

    // Only interactives that actually load the package under test are worth running:
    // for anything else, swapping that package out is a no-op and the A/B is noise.
    if (!html.includes(packagePrefix) && !css.includes(packagePrefix)) {
      skipped.push({ name, reason: 'does not reference ' + packagePrefix });
      continue;
    }

    found.push({ name, html, css, js });
  }

  return { found, skipped };
}

function assemblePage(item) {
  return [
    '<!doctype html>',
    '<html lang="en" class="highcharts-light">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>' + item.name + '</title>',
    '<style>',
    item.css,
    '</style>',
    '</head>',
    '<body>',
    item.html,
    '<script>',
    item.js,
    '<\/script>',
    '</body>',
    '</html>',
  ].join('\n');
}

module.exports = { discover, assemblePage };
