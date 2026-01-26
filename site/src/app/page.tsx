import { craftFetch } from '@/lib/graphql/client';
import { HOMEPAGE_QUERY } from '@/lib/graphql/queries';
import { EntryResponse, HomepageEntry } from '@/lib/graphql/types';

export default async function HomePage() {
  const data = await craftFetch<EntryResponse<HomepageEntry>>(HOMEPAGE_QUERY);

  const entry = data.entry;

  if (!entry) {
    return <div>Homepage not found</div>;
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
