import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { sourceModules } from './source-modules.mjs';
const modules = await sourceModules({ 'lib/theme': 'src/lib/theme.ts' });
const { resolveTheme, nextThemeCheck, parseTheme, themeBootstrap, THEME_BOOTSTRAP, THEME_KEY, createThemeRuntime } = await modules.load('lib/theme');
after(() => modules.close());

test('exact local day/night boundaries and indefinite manual priority', () => {
  for (const [time, expected] of [['05:59:59.999', 'dark'], ['06:00:00', 'light'], ['17:59:59.999', 'light'], ['18:00:00', 'dark'], ['00:00:00', 'dark']]) {
    const now = new Date(`2026-10-22T${time}`);
    assert.equal(resolveTheme('auto', now), expected);
    assert.equal(resolveTheme('light', now), 'light'); assert.equal(resolveTheme('dark', now), 'dark');
    assert.equal(resolveTheme('dark', now, false), 'light');
  }
  assert.equal(nextThemeCheck(new Date('2026-10-22T17:59:59.990')), 10);
});
test('device calendar in India, overseas and DST dates, including tomorrow', () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ['Asia/Kolkata', 'America/New_York', 'Europe/London']) {
      process.env.TZ = zone;
      for (const day of ['2026-03-08', '2026-11-01', '2026-10-22']) {
        assert.equal(resolveTheme('auto', new Date(`${day}T06:00:00`)), 'light');
        assert.equal(resolveTheme('auto', new Date(`${day}T18:00:00`)), 'dark');
        assert.equal(nextThemeCheck(new Date(`${day}T23:59:59`)), 60000);
      }
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});
test('336 pre-paint combinations match runtime policy, including corrupt keys and getter denial', () => {
  for (const saved of [null, 'auto', 'light', 'dark', '', '<script>', 'system']) for (const denied of [false, true]) for (let hour = 0; hour < 24; hour++) {
    const attrs = {};
    runInNewContext(THEME_BOOTSTRAP, {
      document: { documentElement: { setAttribute: (k, v) => { attrs[k] = v; } }, querySelector: () => ({ setAttribute() {} }) },
      Date: class { getHours() { return hour; } },
      get localStorage() { if (denied) throw Error('SecurityError'); return { getItem: key => { assert.equal(key, THEME_KEY); return saved; } }; },
    });
    const mode = parseTheme(denied ? null : saved);
    assert.equal(attrs['data-theme-mode'], mode);
    assert.equal(attrs['data-theme'], resolveTheme(mode, new Date(2026, 9, 22, hour)));
  }
});
function fixture() {
  let now = new Date(2026, 9, 22, 17, 59, 59, 990), hidden = false, deniedRead = false, deniedWrite = false, saved = 'auto', serial = 0, notifications = 0, applied;
  const pending = new Map();
  const env = { now: () => now, hidden: () => hidden, read: () => { if (deniedRead) throw Error('read'); return saved; }, write: mode => { if (deniedWrite) throw Error('quota'); saved = mode; }, apply: state => { applied = state; }, schedule: (fn, ms) => { const id = ++serial; pending.set(id, { fn, ms }); return id; }, cancel: id => pending.delete(id) };
  const runtime = createThemeRuntime(env, () => notifications++);
  return { runtime, env, pending, time: value => { now = value; }, hide: value => { hidden = value; }, denyRead: () => { deniedRead = true; }, denyWrite: () => { deniedWrite = true; }, state: () => applied, count: () => notifications };
}
test('one timer, visible boundary and manual cancellation before an outstanding boundary', () => {
  const f = fixture(); f.runtime.start(); assert.equal(f.pending.size, 1);
  const [id, job] = [...f.pending][0]; assert.equal(job.ms, 10);
  f.pending.delete(id); f.time(new Date(2026, 9, 22, 18)); job.fn();
  assert.equal(f.state().theme, 'dark'); assert.equal(f.pending.size, 1);
  f.runtime.choose('light'); assert.equal(f.pending.size, 0);
  f.time(new Date(2026, 9, 23, 1)); f.runtime.refresh(); assert.equal(f.state().theme, 'light');
  f.runtime.choose('auto'); assert.equal(f.state().theme, 'dark'); assert.equal(f.pending.size, 1); f.runtime.stop();
});
test('hidden and replay cleanup cancel clocks; waking recomputes current local time', () => {
  const f = fixture(); f.runtime.start(); f.hide(true); f.runtime.refresh(); assert.equal(f.pending.size, 0);
  f.time(new Date(2026, 9, 23, 7)); f.hide(false); f.runtime.refresh(); assert.equal(f.state().theme, 'light'); assert.equal(f.pending.size, 1);
  f.runtime.stop(); assert.equal(f.pending.size, 0); f.runtime.start(); assert.equal(f.pending.size, 1); f.runtime.stop();
});
test('denied read/write retains manual selection on resume; explicit clear returns Auto', () => {
  const f = fixture(); f.denyRead(); f.denyWrite(); f.runtime.start();
  f.runtime.choose('dark'); f.runtime.refresh(); assert.equal(f.state().mode, 'dark'); assert.equal(f.pending.size, 0);
  f.runtime.choose(null, false); assert.equal(f.state().mode, 'auto'); assert.equal(f.pending.size, 1); f.runtime.stop();
});
test('no-change refresh keeps stable snapshot identity and no subscriber notification', () => {
  const f = fixture(); f.runtime.start(); const state = f.runtime.getSnapshot(), count = f.count();
  f.runtime.refresh(); assert.equal(f.runtime.getSnapshot(), state); assert.equal(f.count(), count); f.runtime.stop();
});
test('subscribers receive one atomic mode/theme/DOM snapshot, with no stale intermediate render', () => {
  let runtime, applied; const observed = [];
  runtime = createThemeRuntime({ now: () => new Date(2026, 9, 22, 10), hidden: () => false, read: () => 'light', write() {}, apply: state => { applied = state; }, schedule: () => 1, cancel() {} }, () => observed.push({ state: runtime.getSnapshot(), applied }));
  runtime.start(); runtime.choose('dark');
  assert.equal(observed.length, 2);
  assert.ok(observed.every(x => x.state === x.applied && x.state.ready));
  assert.deepEqual(observed.map(x => [x.state.mode, x.state.theme]), [['light', 'light'], ['dark', 'dark']]);
  runtime.stop();
});
test('rollback with stored Dark forces Light before paint and disables the clock', () => {
  let theme;
  runInNewContext(themeBootstrap(false), { Date, localStorage: { getItem: () => 'dark' }, document: { documentElement: { setAttribute: (k, v) => { if (k === 'data-theme') theme = v; } }, querySelector: () => ({ setAttribute() {} }) } });
  assert.equal(theme, 'light');
  const f = fixture(); const runtime = createThemeRuntime({ ...f.env, read: () => 'dark' }, () => {}, false);
  runtime.start(); assert.equal(f.state().theme, 'light'); assert.equal(f.pending.size, 0); runtime.choose('auto'); assert.equal(f.pending.size, 0); runtime.stop();
});
