import { THEME_BOOTSTRAP } from '@/lib/theme';

/** Runs while parsing head, before React or the first body paint. */
export function ThemeBootstrap() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />;
}
