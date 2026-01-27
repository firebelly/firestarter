type SearchParams = { [key: string]: string | string[] | undefined };

/**
 * Check if the request is in Craft CMS preview mode.
 * Preview mode is active when `token` is present along with either:
 * - `x-craft-live-preview` (iframe preview in CP)
 * - `x-craft-preview` (shared preview link / "View" button)
 */
export function isPreviewMode(searchParams: SearchParams): boolean {
  const hasToken = Boolean(searchParams?.token);
  const hasPreviewFlag = Boolean(
    searchParams?.['x-craft-live-preview'] || searchParams?.['x-craft-preview']
  );
  return hasToken && hasPreviewFlag;
}

/**
 * Extract the preview token from search params.
 * Returns undefined if no token is present.
 */
export function getPreviewToken(searchParams: SearchParams): string | undefined {
  const token = searchParams?.token;
  return typeof token === 'string' ? token : undefined;
}

/**
 * Get both preview mode flag and token in one call.
 * Convenience wrapper for use in page components.
 */
export function getPreviewContext(searchParams: SearchParams) {
  return {
    preview: isPreviewMode(searchParams),
    previewToken: getPreviewToken(searchParams),
  };
}
