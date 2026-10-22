/** Display time is the visitor's local time. Booking times continue using their India-time helpers. */
export type ThemeMode = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export const THEME_ENABLED = true;
export const THEME_KEY = 'hmc:theme:v1';
export const DAY_START = 6;
export const DAY_END = 18;
export const THEME_COLOURS = { light: '#FFFFFF', dark: '#1A171B' } as const;
export const parseTheme = (value: unknown): ThemeMode => value === 'light' || value === 'dark' ? value : 'auto';
export function resolveTheme(mode: ThemeMode, now: Date, enabled = THEME_ENABLED): ResolvedTheme {
  return !enabled ? 'light' : mode !== 'auto' ? mode : now.getHours() >= DAY_START && now.getHours() < DAY_END ? 'light' : 'dark';
}
export function nextThemeCheck(now: Date): number {
  const next = new Date(now);
  if (now.getHours() < DAY_START) next.setHours(DAY_START, 0, 0, 0);
  else if (now.getHours() < DAY_END) next.setHours(DAY_END, 0, 0, 0);
  else { next.setDate(next.getDate() + 1); next.setHours(DAY_START, 0, 0, 0); }
  return Math.max(1, Math.min(60_000, next.getTime() - now.getTime()));
}

/** Trusted constants only; parity-tested against the runtime, including denied storage. */
export const themeBootstrap = (enabled = THEME_ENABLED) => `(function(){var m='auto',h=document.documentElement;try{var v=localStorage.getItem('${THEME_KEY}');if(v==='light'||v==='dark')m=v}catch(e){}var n=new Date().getHours(),t=${enabled}?(m==='auto'?(n>=${DAY_START}&&n<${DAY_END}?'light':'dark'):m):'light';h.setAttribute('data-theme',t);h.setAttribute('data-theme-mode',m);var c=document.querySelector('meta[name="theme-color"]');if(!c){c=document.createElement('meta');c.name='theme-color';document.head.appendChild(c)}c.setAttribute('content',t==='dark'?'${THEME_COLOURS.dark}':'${THEME_COLOURS.light}')})();`;
export const THEME_BOOTSTRAP = themeBootstrap();

export type ThemeSnapshot = Readonly<{ mode: ThemeMode; theme: ResolvedTheme; ready: boolean }>;
export const SERVER_THEME: ThemeSnapshot = { mode: 'auto', theme: 'light', ready: false };
export interface ThemeEnvironment {
  now(): Date;
  hidden(): boolean;
  read(): unknown;
  write(mode: ThemeMode): void;
  apply(state: ThemeSnapshot): void;
  schedule(fn: () => void, delay: number): number;
  cancel(id: number): void;
}

/** One clock per document. Persistence errors never discard a manual choice in this document. */
export function createThemeRuntime(env: ThemeEnvironment, notify: () => void, enabled = THEME_ENABLED) {
  let state = SERVER_THEME;
  let timer: number | undefined;
  const clear = () => { if (timer !== undefined) env.cancel(timer); timer = undefined; };
  const update = (mode: ThemeMode) => {
    clear();
    const theme = resolveTheme(mode, env.now(), enabled);
    const changed = !state.ready || state.mode !== mode || state.theme !== theme;
    if (changed) state = { mode, theme, ready: true };
    env.apply(state);
    if (enabled && state.mode === 'auto' && !env.hidden()) timer = env.schedule(refresh, nextThemeCheck(env.now()));
    // Subscribers see one coherent mode/theme/DOM/clock state, including synchronous readers.
    if (changed) notify();
  };
  const refresh = () => update(state.mode);
  const choose = (value: unknown, persist = true) => {
    const mode = parseTheme(value);
    if (persist) { try { env.write(mode); } catch { /* Current document still works. */ } }
    update(mode);
  };
  return {
    start() { let saved: unknown; try { saved = env.read(); } catch { /* Auto from the clock. */ } choose(saved, false); },
    getSnapshot: () => state,
    choose,
    refresh,
    stop: clear,
  };
}
