import { type NextRequest, NextResponse } from "next/server";
import { fetchPageBySlug } from "@/services/contentful.service";
import { ApiError } from "@/utils/apiError";

// Returns a single page by slug. Runs server-side so Contentful credentials
// stay in the server environment and never reach the browser.
// Query param: ?preview=true to use the preview client.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;
  const preview = request.nextUrl.searchParams.get("preview") === "true";

  try {
    const page = await fetchPageBySlug(slug, { preview });
    return NextResponse.json({ page }, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      );
    }
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}
