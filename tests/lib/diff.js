'use strict';

/** Flatten a snapshot into path -> scalar so differences can be reported precisely. */
function flatten(value, prefix, out) {
  out = out || {};
  prefix = prefix || '';
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      value.forEach((v, i) => flatten(v, prefix + '[' + i + ']', out));
    } else {
      for (const k of Object.keys(value)) {
        flatten(value[k], prefix ? prefix + '.' + k : k, out);
      }
    }
  } else {
    out[prefix] = value;
  }
  return out;
}

/** For two long strings, show the neighbourhood of the first real difference. */
function firstDifference(a, b, context) {
  context = context || 90;
  const A = String(a), B = String(b);
  let i = 0;
  while (i < A.length && i < B.length && A[i] === B[i]) i++;
  const from = Math.max(0, i - context);
  const lead = (from > 0 ? '…' : '');
  return {
    atChar: i,
    control: lead + A.slice(from, i + context) + (i + context < A.length ? '…' : ''),
    candidate: lead + B.slice(from, i + context) + (i + context < B.length ? '…' : ''),
  };
}

function compare(controlSnap, candidateSnap) {
  const a = flatten(controlSnap);
  const b = flatten(candidateSnap);
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  const diffs = [];
  for (const k of keys) {
    const av = a[k], bv = b[k];
    if (av === bv) continue;
    const entry = { path: k };
    if (typeof av === 'string' && typeof bv === 'string' && (av.length > 160 || bv.length > 160)) {
      Object.assign(entry, firstDifference(av, bv));
      entry.lengths = av.length + ' -> ' + bv.length;
    } else {
      entry.control = av === undefined ? '(absent)' : String(av);
      entry.candidate = bv === undefined ? '(absent)' : String(bv);
    }
    diffs.push(entry);
  }
  return diffs;
}

function render(interactive, probe, diffs) {
  const lines = [];
  lines.push('  ✗ ' + interactive + ' / ' + probe + ' — ' + diffs.length + ' difference(s)');
  for (const d of diffs.slice(0, 6)) {
    lines.push('      path: ' + d.path + (d.lengths ? '  (length ' + d.lengths + ')' : ''));
    if (d.atChar !== undefined) lines.push('      first differs at char ' + d.atChar);
    lines.push('        control  : ' + d.control);
    lines.push('        candidate: ' + d.candidate);
  }
  if (diffs.length > 6) lines.push('      … and ' + (diffs.length - 6) + ' more (see artifacts)');
  return lines.join('\n');
}

module.exports = { compare, render, flatten };
