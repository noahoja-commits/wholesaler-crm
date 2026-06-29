/** Helper: add standard cache headers to all GET responses */
export function cacheHeaders(maxAge = 10): Record<string, string> {
  return {
    "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=60`,
  };
}
