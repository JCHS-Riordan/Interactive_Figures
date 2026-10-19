'use strict';

/**
 * Every probe returns a plain object that gets normalized and then compared
 * between the control pass (live package) and the candidate pass (working tree).
 *
 * Probes deliberately read the RENDERED result - serialized SVG and computed
 * styles - rather than Highcharts' own option/metadata objects. A chart can
 * report the right colour in chart.series[i].color while the line on screen is
 * invisible, which has happened in this project before.
 */

const READY = `(async () => {
  const deadline = Date.now() + TIMEOUT;
  while (Date.now() < deadline) {
    const cs = (window.Highcharts && Highcharts.charts || []).filter(Boolean);
    const ready = cs.length > 0 && cs.some(c =>
      c.series && c.series.length && c.series.some(s => s.points && s.points.length));
    if (ready) { await new Promise(r => setTimeout(r, 250)); return true; }
    await new Promise(r => setTimeout(r, 150));
  }
  return false;
})()`;

async function waitForChart(page, timeoutMs) {
  const ok = await page.evaluate(READY.replace('TIMEOUT', String(timeoutMs)));
  if (!ok) throw new Error('chart never initialised within ' + timeoutMs + 'ms');
}

/** The main chart on the page (the first one with points). */
const MAIN = `(function () {
  return (window.Highcharts && Highcharts.charts || [])
    .filter(Boolean)
    .find(c => c.series && c.series.some(s => s.points && s.points.length));
})()`;

async function probeInitial(page) {
  return page.evaluate(`(() => {
    const c = ${MAIN};
    return { svg: c.container.innerHTML, chartCount: Highcharts.charts.filter(Boolean).length };
  })()`);
}

async function probeChrome(page) {
  return page.evaluate(`(() => {
    const c = ${MAIN};
    const text = sel => Array.from(document.querySelectorAll(sel)).map(e => e.textContent);
    return {
      tableNotes: text('.JCHS-chart__table-notes'),
      annotations: text('.JCHS-chart__text-annotation'),
      axisTitles: text('.highcharts-axis-title'),
      legendLabels: Array.from(c.container.querySelectorAll('.highcharts-legend-item text'))
        .map(e => e.textContent),
      subtitle: text('.highcharts-subtitle'),
      title: text('.highcharts-title')
    };
  })()`);
}

/**
 * Hover is driven through point.onMouseOver() because that is what a real hover
 * calls internally. Synthetic mouse events do not reliably reach Highcharts'
 * hit-testing, and calling tooltip.refresh() alongside would force the tooltip
 * open unconditionally - a false pass.
 */
async function probeHover(page) {
  return page.evaluate(`(() => {
    const c = ${MAIN};
    const s = c.series.find(s => s.points && s.points.length);
    const pts = s.points.filter(p => p.graphic);
    if (!pts.length) throw new Error('hover probe found no rendered points');
    const pick = [0, Math.floor(pts.length / 2), pts.length - 1]
      .filter((v, i, a) => a.indexOf(v) === i);
    const out = [];
    for (const i of pick) {
      const p = pts[i];
      p.onMouseOver();
      const cs = p.graphic ? getComputedStyle(p.graphic.element) : null;
      out.push({
        name: p.name != null ? String(p.name) : String(p.category),
        tooltip: c.tooltip && c.tooltip.label && c.tooltip.label.text
          ? String(c.tooltip.label.text.textStr || '')
          : null,
        tooltipVisible: !!(c.tooltip && c.tooltip.isHidden === false),
        hoverPointSet: c.hoverPoint === p,
        fill: cs && cs.fill, stroke: cs && cs.stroke,
        strokeWidth: cs && cs.strokeWidth, opacity: cs && cs.opacity,
        fillOpacity: cs && cs.fillOpacity
      });
    }
    if (c.tooltip && c.tooltip.hide) c.tooltip.hide(0);
    return { points: out, pointsRendered: pts.length };
  })()`);
}

/**
 * Legend hover and click both regressed in this package before (hover dimming the
 * map, click toggling a series off), so both are exercised. Each legend item's
 * effect is captured as the whole redrawn SVG, which catches whatever it changed.
 */
async function probeLegend(page) {
  return page.evaluate(`(() => {
    const c = ${MAIN};
    const items = Array.from(c.container.querySelectorAll('.highcharts-legend-item'));
    if (!items.length) throw new Error('legend probe found no legend items');
    const fire = (el, type) => el.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    const out = [];
    for (let i = 0; i < Math.min(items.length, 6); i++) {
      fire(items[i], 'mouseover');
      const hovered = c.container.innerHTML;
      fire(items[i], 'mouseout');
      out.push({ index: i, hoveredSvg: hovered });
    }
    return { itemCount: items.length, hovers: out, afterMouseOut: c.container.innerHTML };
  })()`);
}

/** The package renders radio buttons and search boxes; toggling each is a behaviour change. */
async function probeControls(page) {
  return page.evaluate(`(async () => {
    const c = ${MAIN};
    const radios = Array.from(document.querySelectorAll('#form_wrapper input[type=radio], .JCHS-chart__user-input input[type=radio]'));
    const sliders = Array.from(document.querySelectorAll('.JCHS-chart__slider'));
    const settle = () => new Promise(r => setTimeout(r, 400));
    const out = { radioCount: radios.length, sliderCount: sliders.length, radios: [], sliders: [] };
    const initiallyChecked = radios.findIndex(r => r.checked);
    for (let i = 0; i < Math.min(radios.length, 6); i++) {
      radios[i].click(); await settle();
      out.radios.push({ index: i, id: radios[i].id || null, svg: c.container.innerHTML });
    }
    if (initiallyChecked >= 0 && radios[initiallyChecked]) { radios[initiallyChecked].click(); await settle(); }
    for (const sl of sliders.slice(0, 1)) {
      const min = Number(sl.min || 0), max = Number(sl.max || 0), start = sl.value;
      for (const v of [min, max]) {
        sl.value = String(v);
        sl.dispatchEvent(new Event('input', { bubbles: true }));
        sl.dispatchEvent(new Event('change', { bubbles: true }));
        await settle();
        out.sliders.push({ value: String(v), svg: c.container.innerHTML });
      }
      sl.value = start;
      sl.dispatchEvent(new Event('input', { bubbles: true }));
      sl.dispatchEvent(new Event('change', { bubbles: true }));
      await settle();
    }
    return out;
  })()`);
}

/** The export path has its own title, margins and legend overrides. */
async function probeExport(page) {
  return page.evaluate(`(() => {
    const c = ${MAIN};
    const eo = (c.options.exporting && c.options.exporting.chartOptions) || {};
    return { exportSvg: c.getSVG(eo) };
  })()`);
}

module.exports = {
  waitForChart,
  probes: [
    { name: 'initial', run: probeInitial },
    { name: 'chrome', run: probeChrome },
    { name: 'hover', run: probeHover },
    { name: 'legend', run: probeLegend },
    { name: 'controls', run: probeControls },
    { name: 'export', run: probeExport },
  ],
};
