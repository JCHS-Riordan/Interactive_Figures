'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const { discover, assemblePage } = require('./lib/corpus');
const { startServer } = require('./lib/server');
const { normalizeSnapshot } = require('./lib/normalize');
const { waitForChart, probes } = require('./lib/probes');
const { compare, render } = require('./lib/diff');

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const corpusDir = path.resolve(__dirname, cfg.corpusDir);
const packageDir = path.resolve(__dirname, cfg.packageDir);

const argv = process.argv.slice(2);
const onlyArg = argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.split('=')[1] : null;
const outArg = argv.find((a) => a.startsWith('--out='));
const outDir = path.resolve(__dirname, outArg ? outArg.split('=')[1] : 'artifacts');

function contentType(file) {
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

/**
 * One render of one interactive.
 *
 * mode 'control'  : package files come from the live S3 copy (cache-busted, because
 *                   that prefix sits behind a caching layer that has served stale
 *                   content here before); every other response is RECORDED.
 * mode 'candidate': package files come from the working tree; every other response
 *                   is REPLAYED from the control pass.
 *
 * That replay is the whole reason this is trustworthy: these interactives pull their
 * data from Google Sheets at render time, so without pinning it, a sheet edited
 * between the two passes would look exactly like a package regression.
 */
async function runPass(browser, origin, item, mode, cache) {
  const page = await browser.newPage({ viewport: cfg.viewports[0] });
  const misses = [];

  await page.route('**/*', async (route) => {
    const url = route.request().url();

    if (url.startsWith(cfg.packagePrefix)) {
      const file = url.slice(cfg.packagePrefix.length).split('?')[0];
      if (mode === 'candidate' && cfg.packageFiles.indexOf(file) !== -1) {
        const local = path.join(packageDir, file);
        if (!fs.existsSync(local)) throw new Error('package file not in working tree: ' + local);
        return route.fulfill({
          status: 200,
          contentType: contentType(file),
          body: fs.readFileSync(local, 'utf8'),
        });
      }
      const bust = url + (url.indexOf('?') !== -1 ? '&' : '?') + 'abcachebust=' + Date.now();
      const live = await route.fetch({ url: bust });
      return route.fulfill({
        status: live.status(),
        contentType: contentType(file),
        body: await live.body(),
      });
    }

    if (url.indexOf(origin) === 0) return route.continue();

    if (mode === 'candidate' && cache.has(url)) {
      const hit = cache.get(url);
      return route.fulfill({ status: hit.status, headers: hit.headers, body: hit.body });
    }
    if (mode === 'candidate') misses.push(url);

    const resp = await route.fetch();
    const body = await resp.body();
    const headers = Object.assign({}, resp.headers());
    delete headers['content-encoding'];
    delete headers['content-length'];
    cache.set(url, { status: resp.status(), headers: headers, body: body });
    return route.fulfill({ status: resp.status(), headers: headers, body: body });
  });

  await page.goto(origin + '/' + encodeURIComponent(item.name), { waitUntil: 'load' });
  // Text metrics drive Highcharts' legend and axis layout, so a font that lands
  // after render in one pass and before it in the other would shift geometry for
  // reasons that have nothing to do with the package.
  await page.evaluate('document.fonts.ready.then(function () { return true; })');
  await waitForChart(page, cfg.readyTimeoutMs);
  await page.waitForTimeout(400);

  const snapshot = {};
  for (const probe of probes) {
    snapshot[probe.name] = await probe.run(page);
  }

  for (const vp of cfg.viewports.slice(1)) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(600);
    snapshot['reflow:' + vp.name] = await page.evaluate(
      '(function () {' +
        'var c = (Highcharts.charts || []).filter(Boolean).find(function (c) {' +
        'return c.series && c.series.some(function (s) { return s.points && s.points.length; }); });' +
        'return { svg: c.container.innerHTML, width: c.chartWidth, height: c.chartHeight };' +
        '})()'
    );
  }
  await page.setViewportSize(cfg.viewports[0]);
  await page.waitForTimeout(400);

  fs.mkdirSync(path.join(outDir, item.name), { recursive: true });
  await page.screenshot({ path: path.join(outDir, item.name, mode + '.png'), fullPage: true });

  await page.close();
  return { snapshot: normalizeSnapshot(snapshot), misses: misses };
}

(async function main() {
  const discovered = discover(corpusDir, cfg.packagePrefix);
  const found = discovered.found;
  const items = only ? found.filter((i) => i.name === only) : found;

  if (!items.length) {
    console.error('No interactives to test in ' + corpusDir);
    process.exit(1);
  }

  console.log('Corpus: ' + corpusDir);
  console.log('Package under test: ' + packageDir);
  console.log('Testing ' + items.length + ' interactive(s): ' + items.map((i) => i.name).join(', '));
  discovered.skipped.forEach(function (s) {
    console.log('  skipped ' + s.name + ' (' + s.reason + ')');
  });
  console.log('');

  fs.mkdirSync(outDir, { recursive: true });
  const pages = new Map(items.map((i) => [i.name, assemblePage(i)]));
  const started = await startServer(pages);
  const browser = await chromium.launch();

  let failures = 0;
  const report = [];

  for (const item of items) {
    const cache = new Map();
    process.stdout.write('- ' + item.name + ' ... ');
    let control, candidate;
    try {
      control = await runPass(browser, started.origin, item, 'control', cache);
      candidate = await runPass(browser, started.origin, item, 'candidate', cache);
    } catch (err) {
      failures++;
      console.log('HARNESS ERROR');
      console.log('  ' + err.message);
      report.push({ interactive: item.name, harnessError: err.message });
      continue;
    }

    fs.writeFileSync(
      path.join(outDir, item.name, 'control.json'),
      JSON.stringify(control.snapshot, null, 1)
    );
    fs.writeFileSync(
      path.join(outDir, item.name, 'candidate.json'),
      JSON.stringify(candidate.snapshot, null, 1)
    );

    const probeNames = Object.keys(control.snapshot);
    const itemDiffs = [];
    for (const name of probeNames) {
      const d = compare(control.snapshot[name], candidate.snapshot[name]);
      if (d.length) itemDiffs.push({ probe: name, diffs: d });
    }

    if (candidate.misses.length) {
      console.log('WARN: ' + candidate.misses.length + ' un-replayed request(s)');
      candidate.misses.slice(0, 5).forEach(function (u) {
        console.log('    ' + u);
      });
    }

    if (!itemDiffs.length) {
      console.log('identical across ' + probeNames.length + ' probes');
    } else {
      failures++;
      console.log('CHANGED');
      itemDiffs.forEach(function (d) {
        console.log(render(item.name, d.probe, d.diffs));
      });
      report.push({ interactive: item.name, probes: itemDiffs });
    }
  }

  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
  await browser.close();
  started.server.close();

  console.log('');
  if (failures) {
    console.log('FAIL - ' + failures + ' of ' + items.length + ' interactive(s) changed.');
    console.log('If these changes are intended, the diff above is what to review.');
    process.exit(1);
  }
  console.log('PASS - the working-tree package renders every interactive identically to live.');
})().catch(function (err) {
  console.error(err);
  process.exit(1);
});
