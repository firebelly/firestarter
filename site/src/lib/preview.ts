type SearchParams = { [key: string]: string | string[] | undefined };

/**
 * Check if the request is in Craft CMS preview mode.
 * Preview mode is active when both `token` and `x-craft-live-preview` are present.
 */
export function isPreviewMode(searchParams: SearchParams): boolean {
  return Boolean(
    searchParams?.token && searchParams['x-craft-live-preview']
  );
}

/**
 * Extract the preview token from search params.
 * Returns null if no token is present.
 */
export function getPreviewToken(searchParams: SearchParams): string | null {
  const token = searchParams?.token;
  return typeof token === 'string' ? token : null;
}
