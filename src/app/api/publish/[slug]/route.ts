import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/services/user.service";
import { publishDraft, getLatestRelease } from "@/services/publish.service";
import { PageSchema } from "@/lib/validators/page";

// GET /api/publish/[slug]
// Returns the latest published release for a slug.
// Used by the studio as the second fallback when no localStorage draft exists.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;

  // 1. Verify the user is signed in
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch the latest release from the DB
  const latest = await getLatestRelease(slug);
  if (!latest) {
    return NextResponse.json({ error: "No published release" }, { status: 404 });
  }

  return NextResponse.json({ page: latest.page, version: latest.version }, { status: 200 });
}

// POST /api/publish/[slug]
// Validates the caller has the publisher role, then freezes the submitted
// draft into an immutable versioned release in the database.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;

  // 1. Verify the user is signed in
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify the user has the publisher role — server-side enforcement
  const role = await getUserRole(userId);
  if (!role || role !== "publisher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Parse and validate the request body
  const body = (await req.json()) as unknown;
  const parsed = PageSchema.safeParse((body as Record<string, unknown>)?.page);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid page data" }, { status: 400 });
  }

  // 4. Run publish — diff, version bump, and DB insert handled by the service
  const result = await publishDraft(slug, parsed.data);

  return NextResponse.json(result, { status: 200 });
}
