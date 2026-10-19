'use strict';

/**
 * Highcharts stamps a per-chart random token into every generated id
 * (e.g. highcharts-697mn1c-0, and clipPath ids like highcharts-697mn1c-59-),
 * and those ids are referenced back from clip-path="url(#...)" and aria-*.
 * They differ on every single render, so without normalizing them EVERY
 * A/B comparison would report a difference and the harness would be useless.
 *
 * Coordinates are rounded because Highcharts' projection maths can land on a
 * different final bit between runs; 2dp is far finer than anything a human
 * would notice and still catches any real layout shift.
 */
function normalizeSvg(svg) {
  if (typeof svg !== 'string') return svg;
  return (
    svg
      // the generated per-chart token, in ids and in url(#...) references alike
      .replace(/highcharts-[a-z0-9]{5,}-\d+-?/g, 'highcharts-ID')
      // any other generated reference that slipped through
      .replace(/url\(#[^)]*\)/g, 'url(#REF)')
      // sub-pixel jitter
      .replace(/-?\d+\.\d+/g, (m) => {
        const n = Number(m);
        return Number.isFinite(n) ? n.toFixed(2) : m;
      })
      // irrelevant whitespace differences
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function normalizeText(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/\s+/g, ' ').trim();
}

/** Walk a probe result and normalize every string in it. */
function normalizeSnapshot(value) {
  if (typeof value === 'string') return normalizeSvg(value);
  if (Array.isArray(value)) return value.map(normalizeSnapshot);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = normalizeSnapshot(value[k]);
    return out;
  }
  return value;
}

module.exports = { normalizeSvg, normalizeText, normalizeSnapshot };
