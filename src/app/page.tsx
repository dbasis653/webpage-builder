import Link from "next/link";
import Header from "@/components/layout/Header";
import { fetchAllPages } from "@/services/contentful.service";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Eye } from "lucide-react";

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
              <Card key={page.pageId} className="bg-slate-300">
                <CardHeader>
                  <CardTitle className="text-base">{page.title}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    /{page.slug}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {page.sectionCount}{" "}
                    {page.sectionCount === 1 ? "section" : "sections"}
                  </p>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button asChild size="sm" className="flex-1 gap-1.5">
                    <Link href={`/studio/${page.slug}`}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5"
                  >
                    <Link href={`/preview/${page.slug}`}>
                      <Eye className="size-3.5" />
                      Preview
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
