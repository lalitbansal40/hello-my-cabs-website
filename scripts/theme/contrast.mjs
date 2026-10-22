import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const themes = JSON.parse(readFileSync(new URL('../../src/design/web-theme.json', import.meta.url), 'utf8'));
const luminance = hex => {
  const channels = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
};
const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
for (const [mode, roles] of Object.entries(themes)) {
  const pairs = ['page', 'card', 'raised', 'soft', 'header'].flatMap(bg => ['content', 'secondary', 'label', 'heading', 'link'].map(fg => [fg, bg, 4.5]));
  pairs.push(...['primary', 'primary-hover', 'success-fill', 'danger-fill'].map(bg => ['on-primary', bg, 4.5]));
  pairs.push(...['page', 'card', 'raised', 'soft', 'header'].flatMap(bg => [['control', bg, 3], ['focus', bg, 3]]));
  pairs.push(['inverse', 'band', 4.5], ['inverse', 'footer', 4.5], ['inverse-link', 'band', 4.5], ['on-selection', 'selection', 4.5]);
  for (const [fg, bg, floor] of pairs) assert.ok(ratio(roles[fg], roles[bg]) >= floor, `${mode} ${fg}/${bg}: ${ratio(roles[fg], roles[bg]).toFixed(2)} < ${floor}`);
  // Existing status tints use opacity over a semantic card/page; check the actual composite.
  for (const [text, fill] of [['success', 'success-fill'], ['error', 'danger-fill'], ['warning', 'warning-fill']]) for (const bg of ['page', 'card', 'soft']) for (const alpha of [.05, .1, .12]) {
    const mix = '#' + [0, 1, 2].map(i => Math.round(parseInt(roles[fill].slice(1 + i * 2, 3 + i * 2), 16) * alpha + parseInt(roles[bg].slice(1 + i * 2, 3 + i * 2), 16) * (1 - alpha)).toString(16).padStart(2, '0')).join('');
    assert.ok(ratio(roles[text], mix) >= 4.5, `${mode} composited ${text}/${bg}/${alpha}`);
  }
  assert.ok(ratio(roles['on-gold'], '#F6B73C') >= 4.5, mode + ' fixed yellow stamp');
  console.log(`${mode}: ${pairs.length} role pairs +27 composited status cases pass`);
}
