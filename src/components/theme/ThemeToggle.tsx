'use client';
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { chooseTheme, serverThemeSnapshot, subscribeTheme, themeSnapshot } from '@/lib/theme-browser';
import { THEME_ENABLED, type ThemeMode } from '@/lib/theme';
import { HEADER_PANEL, openHeaderPanel } from '@/lib/header-panel';



const t = { label: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark', close: 'Close', helper: 'Auto uses your device’s local time: Light from 6am to 6pm, Dark from 6pm to 6am.' };

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{name === 'moon' ? <path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" /> : name === 'sun' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}</svg>;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const state = useSyncExternalStore(subscribeTheme, themeSnapshot, serverThemeSnapshot);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null), panel = useRef<HTMLFieldSetElement>(null);
  const id = useId();
  useEffect(() => {
    const other = (e: Event) => { if ((e as CustomEvent).detail !== id) setOpen(false); };
    document.addEventListener(HEADER_PANEL, other);
    return () => document.removeEventListener(HEADER_PANEL, other);
  }, [id]);
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLInputElement>('input:checked')?.focus();
    const outside = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    box.current?.addEventListener('keydown', key);
    const el = box.current;
    return () => { document.removeEventListener('pointerdown', outside); el?.removeEventListener('keydown', key); };
  }, [open]);
  if (!THEME_ENABLED) return null;
  return <div ref={box} className={`hmc-theme-control relative`} data-ready={state.ready || undefined}>
    <button ref={trigger} type="button" disabled={!state.ready} aria-expanded={open} aria-controls={id}
      aria-label={`${t.label}: ${t[state.mode]}${state.mode === 'auto' ? ` (${t[state.theme]})` : ''}`}
      onClick={() => { if (!open) openHeaderPanel(id); setOpen(!open); }}
      className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 text-hmc-heading hover:bg-hmc-soft">
      <Icon name={state.ready ? state.theme === 'dark' ? 'moon' : 'sun' : 'clock'} size={20} />
      <span className={`hmc-theme-name ${compact ? 'sr-only' : 'text-small font-semibold'}`}>{t.label}</span>
    </button>
    {open ? <fieldset id={id} ref={panel} className="absolute right-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-hmc-control bg-hmc-raised p-3 text-hmc-content shadow-[var(--shadow-lift)]">
      <legend className="sr-only">{t.label}</legend>
      {(['auto', 'light', 'dark'] as const).map((mode: ThemeMode) => <label key={mode} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-hmc-soft">
        <input type="radio" name={id} value={mode} checked={state.mode === mode} onChange={() => chooseTheme(mode)} />
        <Icon name={mode === 'auto' ? 'clock' : mode === 'dark' ? 'moon' : 'sun'} size={18} />{t[mode]}
      </label>)}
      <p className="mt-2 text-small text-hmc-secondary">{t.helper}</p>
      <button type="button" className="mt-2 min-h-11 w-full rounded-lg text-hmc-link hover:bg-hmc-soft" onClick={() => { setOpen(false); trigger.current?.focus(); }}>{t.close}</button>
    </fieldset> : null}
  </div>;
}
