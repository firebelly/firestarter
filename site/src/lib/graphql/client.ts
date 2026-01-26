type FetchOptions = {
  variables?: Record<string, unknown>;
  preview?: boolean;
  revalidate?: number | false;
};

export async function craftFetch<T>(
  query: string,
  options: FetchOptions = {}
): Promise<T> {
  const { variables, preview = false, revalidate = 86400 } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (preview) {
    headers['Authorization'] = `Bearer ${process.env.CRAFT_PREVIEW_TOKEN}`;
  }

  // In headless mode, Craft uses /actions/graphql/api (custom routes disabled)
  const res = await fetch(`${process.env.CRAFT_URL}/actions/graphql/api`, {
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
