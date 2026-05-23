import Header from "@/components/layout/Header";
import PageCard from "@/components/home/PageCard";
import { fetchAllPages } from "@/services/contentful.service";
import { FileText } from "lucide-react";

// Fetches all pages server-side and renders the dashboard.
// Contentful credentials stay in the server environment — never sent to the browser.
export default async function Home(): Promise<React.JSX.Element> {
  let pages: Awaited<ReturnType<typeof fetchAllPages>> = [];
  let fetchError = false;

  try {
    pages = await fetchAllPages();
  } catch {
    fetchError = true;
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* -- Section heading -- */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a page to open it in the studio.
          </p>
        </div>

        {/* -- Error state -- */}
        {fetchError && (
          <p className="text-sm text-destructive">
            Failed to load pages from Contentful. Check your environment
            variables and try again.
          </p>
        )}

        {/* -- Empty state -- */}
        {!fetchError && pages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="text-sm font-medium">No pages found</p>
            <p className="text-sm text-muted-foreground">
              Create a page entry in Contentful to get started.
            </p>
          </div>
        )}

        {/* -- Page grid -- */}
        {pages.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <PageCard
                key={page.pageId}
                pageId={page.pageId}
                title={page.title}
                slug={page.slug}
                sectionCount={page.sectionCount}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
