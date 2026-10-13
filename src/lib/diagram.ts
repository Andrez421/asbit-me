import type { DiagramCol, I18n } from '../data/projects';

const es = (v: I18n): string => (typeof v === 'string' ? v : v.es);

/**
 * Project diagram, ported unchanged from the runtime version: same constants,
 * same maths, same markup, same animation delays. Labels that exist in both
 * languages get a `data-i18n` key so the runtime toggle keeps switching them;
 * `key` is the project id. Rendering this at build time removes ~333 SVG nodes
 * of runtime work.
 */
export function diagram(cols: DiagramCol[], key: string): string {
  const W = 720;
  const H = 250;
  const n = cols.length;
  const cw = W / n;
  const nw = Math.min(150, cw - 34);
  const nh = 34;
  const gap = 10;
  const cy = 142;
  const xs = cols.map((_, i) => cw * i + cw / 2);
  let s = '';

  cols.forEach((c, i) => {
    const h = c.n.length * nh + (c.n.length - 1) * gap;
    const y0 = cy - h / 2;
    const titleKey = typeof c.t === 'string' ? '' : ` data-i18n="p.${key}.c${i}"`;
    s += `<text class="dc" x="${(xs[i] - nw / 2).toFixed(0)}" y="${(y0 - 14).toFixed(0)}" style="--d:${(i * 0.2).toFixed(2)}s"${titleKey}>${es(c.t)}</text>`;

    c.n.forEach((nm, j) => {
      const y = y0 + j * (nh + gap);
      const nodeKey = typeof nm === 'string' ? '' : ` data-i18n="p.${key}.c${i}.${j}"`;
      s += `<g class="dn" style="--d:${(i * 0.2 + j * 0.08 + 0.05).toFixed(2)}s"><rect x="${(xs[i] - nw / 2).toFixed(0)}" y="${y.toFixed(0)}" width="${nw.toFixed(0)}" height="${nh}" rx="2"/><text x="${xs[i].toFixed(0)}" y="${(y + nh / 2 + 4).toFixed(0)}" text-anchor="middle"${nodeKey}>${es(nm)}</text></g>`;
    });

    if (i < n - 1) {
      const x1 = xs[i] + nw / 2;
      const x2 = xs[i + 1] - nw / 2;
      s += `<line class="dl" x1="${x1.toFixed(0)}" y1="${cy}" x2="${x2.toFixed(0)}" y2="${cy}" style="--len:${(x2 - x1).toFixed(0)};--d:${(i * 0.2 + 0.3).toFixed(2)}s"/>`;
    }
  });

  s += `<circle class="pk" r="3.5"><animateMotion dur="${(n * 1.2).toFixed(1)}s" repeatCount="indefinite" path="M ${xs[0].toFixed(0)} ${cy} L ${xs[n - 1].toFixed(0)} ${cy}"/></circle>`;

  const label = cols.map((c) => es(c.t)).join(' → ');
  return `<svg class="diag" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" data-i18n-aria="p.${key}.aria">${s}</svg>`;
}
