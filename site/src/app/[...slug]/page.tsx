import { craftFetch } from '@/lib/graphql/client';
import { PAGE_BY_URI_QUERY } from '@/lib/graphql/queries';
import { EntryResponse, PageEntry } from '@/lib/graphql/types';
import { getPreviewContext } from '@/lib/preview';

export default async function Page(props: PageProps<'/[...slug]'>) {
  const { slug } = await props.params;
  const { preview, previewToken } = getPreviewContext(await props.searchParams);

  // Convert slug array to URI string: ['services', 'web-design'] → 'services/web-design'
  const uri = slug.join('/');

  const data = await craftFetch<EntryResponse<PageEntry>>(
    PAGE_BY_URI_QUERY,
    {
      variables: { uri: [uri] },
      preview,
      previewToken,
    }
  );

  const entry = data.entry;

  if (!entry) {
    return <div>Page not found</div>;
  }

  return (
    <main>
      <h1>{entry.heading ?? entry.title}</h1>
      {entry.body?.html && (
        <div dangerouslySetInnerHTML={{ __html: entry.body.html }} />
      )}
    </main>
  );
}
