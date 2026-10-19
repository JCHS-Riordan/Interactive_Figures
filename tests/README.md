# Package regression harness

The three files in `JCHS_Code_Package/` are hosted on S3 and loaded **at runtime** by
every published interactive. Each published interactive is a frozen `dist/index.html`
that `@import`s the CSS and script-tags the JS, so editing the package changes live
charts retroactively, without any of them being redeployed.

That makes the dangerous change class one that code review structurally cannot catch:
the breakage is not in the diff, it is in the interaction between the package and
consumers that live outside this repo. This harness is the gate for that.

## What it does

For each interactive in the corpus it renders the page **twice in the same run**:

| pass | package files come from | everything else |
| --- | --- | --- |
| control | the live S3 copy, cache-busted | fetched live, and **recorded** |
| candidate | your working tree | **replayed** from the control pass |

Then it diffs the two. The only thing that differs between the passes is the package,
by construction.

There are deliberately **no committed baseline files**. Golden baselines rot: every
intentional change needs re-blessing and after a few rounds nobody trusts them. The
control pass is whatever is live right now, so the harness answers the question you
actually have — *does my change alter anything that is already published?* — and needs
no maintenance.

## What it compares

Each probe produces its own snapshot, compared control vs candidate:

| probe | covers |
| --- | --- |
| `initial` | the whole rendered SVG |
| `chrome` | table notes, text annotations, axis titles, legend labels, title/subtitle |
| `hover` | tooltip content and point styling on hover, at three points per series |
| `legend` | legend item hover and the redraw it causes |
| `controls` | every radio button, and slider extremes |
| `export` | `chart.getSVG()`, which carries its own title and margins |
| `reflow:*` | re-render at 480px and 380px, under the package's own media queries |

It snapshots **rendered output** — serialized SVG and computed styles — not Highcharts'
option objects. A chart can report the right colour in `chart.series[i].color` while the
line on screen is invisible; that has happened in this project.

## Running it

CI is the intended home (`.github/workflows/package-regression.yml`), on any PR touching
`JCHS_Code_Package/**` and on manual dispatch. Locally:

```bash
cd tests
npm install
npx playwright install chromium
node run.js                      # all interactives
node run.js --only=PI_Ratio_Map  # just one
```

Exit code is non-zero if anything differs. Snapshots, a `report.json` and a
before/after PNG per interactive land in `tests/artifacts/`.

## Reading a failure

A failure is not automatically a bug — it means something changed, and you decide
whether you meant it. The output names the interactive, the probe, the JSON path, and
for long strings the first differing character with surrounding context:

```
  x PI_Ratio_Map / initial - 3 difference(s)
      path: svg  (length 48213 -> 48219)
      first differs at char 9044
        control  : ...fill="#313E3D" stroke="#313E3D"...
        candidate: ...fill="#8cb7c7" stroke="#8cb7c7"...
```

If the change is intended, that diff is what to put in front of a reviewer.

## Pointing it at a bigger corpus

`config.json` holds `corpusDir`. It currently points at the four-chart sample in
`Testing/`, but nothing is hardcoded to those four — interactives are discovered by
scanning for `.html` files, and any that do not reference `packagePrefix` are skipped,
since swapping the package out would be a no-op for them.

When every published interactive lives in a single repo, point `corpusDir` at that
checkout. Two things to get right there:

- Store what is **actually published** — the exact `dist/index.html` that is on S3, not
  a working draft. Otherwise the harness is testing something nobody is looking at.
- At scale, run the full set nightly and a representative subset per PR, or shard across
  runners. A hundred interactives x two passes x seven probes is real wall-clock.

The corpus format here is the CodePen layout (`Name.html` is body markup only, with
`Name.css` and `Name.js` as separate panes); `lib/corpus.js` assembles them into a page.
A corpus of complete `dist/index.html` files needs `assemblePage` adjusted to pass them
through untouched.

## Things that will bite you

- **Pin the data.** Already handled by record/replay, but if you add a probe that
  triggers a fresh fetch, it has to go through the same interception or you will get
  diffs that are really just a sheet someone edited.
- **Fonts move text.** Highcharts measures text to lay out legends and axes, so the run
  waits on `document.fonts.ready` before probing. Without that, font timing alone
  changes geometry.
- **Hover must go through `point.onMouseOver()`.** Synthetic mouse events do not reach
  Highcharts' hit-testing reliably, and calling `tooltip.refresh()` alongside forces the
  tooltip open unconditionally, which is a false pass.
- **These charts are not in styled mode.** `chart.styledMode` is `false`;
  `colorAxis.dataClassColor: 'category'` in `JCHS-highcharts--map.js` is what makes
  Highcharts emit the `highcharts-color-N` classes at all. A probe that finds no points
  or no legend items raises a harness error rather than passing quietly.
- **The S3 package sits behind a cache** that a hard refresh does not always bypass, so
  the control pass cache-busts its fetch of the package files.
