/**
 * Where to send somebody after they sign in — but only somewhere on this site.
 *
 * A `?next=` that is allowed to be any URL turns our own sign-in page into a phishing
 * step: a person types their number on a page that is genuinely ours and lands on somebody
 * else's. The check has to be a whitelist of shapes, not a blacklist of bad ones.
 *
 * `//evil.com` is the case that catches people out. It starts with a slash, so a naive
 * "must start with /" test passes it, and every browser reads it as a protocol-relative
 * URL pointing at another host.
 */
export function safeNextPath(next: string | undefined | null): string {
  if (!next) return '/';
  // Must be a path on this site: one leading slash, and no second one.
  if (!next.startsWith('/') || next.startsWith('//')) return '/';
  // A backslash is treated as a slash by some browsers, so `/\evil.com` is the same trick.
  if (next.includes('\\')) return '/';
  // No scheme can survive the checks above, but say it plainly rather than rely on that.
  if (/^[a-z][a-z0-9+.-]*:/i.test(next.slice(1))) return '/';
  // The API is not a page; landing there after sign-in is never what was meant, and
  // /api/logout would sign the person straight back out.
  if (next.startsWith('/api/')) return '/';
  return next;
}
