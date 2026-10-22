'use client';

import { createThemeRuntime, SERVER_THEME, THEME_COLOURS, THEME_KEY, type ThemeMode, type ThemeSnapshot } from './theme';

const listeners = new Set<() => void>();
let runtime: ReturnType<typeof createThemeRuntime> | undefined;
let release: (() => void) | undefined;
let owners = 0;
export const themeSnapshot = () => runtime?.getSnapshot() ?? SERVER_THEME;
export const serverThemeSnapshot = () => SERVER_THEME;
export const subscribeTheme = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const chooseTheme = (mode: ThemeMode) => runtime?.choose(mode);
export const refreshTheme = () => runtime?.refresh();

function applyTheme(state: ThemeSnapshot) {
  const root = document.documentElement;
  if (root.dataset.theme !== state.theme) root.dataset.theme = state.theme;
  if (root.dataset.themeMode !== state.mode) root.dataset.themeMode = state.mode;
  // Bootstrap/runtime own this tag. React's viewport metadata stays static and never
  // adopts a pre-mutated tag or removes a node while the appearance observer uses it.
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
  if (meta.content !== THEME_COLOURS[state.theme]) meta.content = THEME_COLOURS[state.theme];
}

export function startTheme() {
  if (++owners === 1) {
    runtime = createThemeRuntime({
      now: () => new Date(), hidden: () => document.hidden,
      read: () => window.localStorage.getItem(THEME_KEY),
      write: mode => window.localStorage.setItem(THEME_KEY, mode),
      apply: applyTheme,
      schedule: (fn, ms) => window.setTimeout(fn, ms), cancel: id => window.clearTimeout(id),
    }, () => listeners.forEach(fn => fn()));
    runtime.start();
    const wake = () => runtime?.refresh();
    const storage = (e: StorageEvent) => {
      if (e.key !== THEME_KEY && e.key !== null) return;
      try { if (e.storageArea && e.storageArea !== window.localStorage) return; } catch { return; }
      runtime?.choose(e.newValue, false);
    };
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('focus', wake);
    window.addEventListener('pageshow', wake);
    window.addEventListener('storage', storage);
    const chrome = new MutationObserver(records => {
      if (records.some(r => r.type === 'attributes'
        ? r.target instanceof HTMLMetaElement && r.target.name === 'theme-color'
        : [...r.addedNodes].some(n => n instanceof HTMLMetaElement && n.name === 'theme-color'))) applyTheme(themeSnapshot());
    });
    chrome.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] });
    release = () => {
      chrome.disconnect();
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('focus', wake);
      window.removeEventListener('pageshow', wake);
      window.removeEventListener('storage', storage);
      runtime?.stop();
    };
  }
  return () => { if (--owners === 0) release?.(); };
}
