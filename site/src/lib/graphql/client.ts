type FetchOptions = {
  variables?: Record<string, unknown>;
  preview?: boolean;
  previewToken?: string;
  revalidate?: number | false;
};

export async function craftFetch<T>(
  query: string,
  options: FetchOptions = {}
): Promise<T> {
  const { variables, preview = false, previewToken, revalidate = 86400 } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Build the GraphQL endpoint URL
  // In headless mode, Craft uses /actions/graphql/api (custom routes disabled)
  let endpoint = `${process.env.CRAFT_URL}/actions/graphql/api`;

  // For preview mode, pass the preview token as a query parameter
  // This authorizes access to the specific draft being previewed
  if (preview && previewToken) {
    endpoint += `?token=${previewToken}`;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    next: preview ? { revalidate: 0 } : { revalidate },
  });

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? 'GraphQL Error');
  }

  return json.data;
}
