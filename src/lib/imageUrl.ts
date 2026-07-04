/**
 * Normalizes a stored image path to a valid browser URL.
 * Handles three cases:
 *   "/api/images/filename.png"  → returned as-is
 *   "/uploads/filename.png"     → "/api/uploads/filename.png"
 *   "uploads/filename.png"      → "/api/uploads/filename.png"
 *   "filename.png"              → "/api/images/filename.png"  (legacy bare names)
 */
export function imageUrl(p?: string | null): string {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/api/')) return p;
  if (p.startsWith('/uploads/')) return '/api' + p;
  if (p.startsWith('uploads/')) return '/api/' + p;
  // missing leading slash (e.g. "api/images/foo.png")
  if (p.startsWith('api/')) return '/' + p;
  // bare filename — legacy
  return `/api/images/${p}`;
}
