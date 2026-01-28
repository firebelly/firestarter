import { notFound } from "next/navigation";
import { craftFetch } from "@/lib/graphql/client";
import { HOMEPAGE_QUERY } from "@/lib/graphql/queries";
import { EntryResponse, HomepageEntry } from "@/lib/graphql/types";
import { getPreviewContext } from "@/lib/preview";

export default async function HomePage(props: PageProps<"/">) {
  const { preview, previewToken } = getPreviewContext(await props.searchParams);

  const data = await craftFetch<EntryResponse<HomepageEntry>>(HOMEPAGE_QUERY, {
    preview,
    previewToken,
  });

  const entry = data.entry;

  if (!entry) {
    notFound();
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
