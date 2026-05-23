import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { releases } from "@/db/schema";
import { diffPages, bumpVersion } from "@/utils/semver";
import { PageSchema } from "@/lib/validators/page";
import type { Page } from "@/lib/validators/page";

const INITIAL_VERSION = "1.0.0";

export interface PublishResult {
  alreadyPublished: boolean;
  version: string;
  changelog: string[];
}

// Fetches the most recent release row for a given slug.
// Returns null if the page has never been published.
export async function getLatestRelease(slug: string): Promise<{ version: string; page: Page } | null> {
  const rows = await db
    .select()
    .from(releases)
    .where(eq(releases.slug, slug))
    .orderBy(desc(releases.publishedAt))
    .limit(1);

  if (rows.length === 0) return null;

  // Parse the stored jsonb back through Zod to guarantee type safety.
  const parsed = PageSchema.safeParse(rows[0].page);
  if (!parsed.success) return null;

  return { version: rows[0].version, page: parsed.data };
}

// Compares the draft against the last published release, determines the SemVer bump,
// and inserts a new immutable snapshot row if anything changed.
// Returns alreadyPublished: true when the draft is identical to the last release.
export async function publishDraft(slug: string, draft: Page): Promise<PublishResult> {
  const latest = await getLatestRelease(slug);

  // 1. First-ever publish — no diff needed
  if (!latest) {
    await db.insert(releases).values({
      slug,
      version:   INITIAL_VERSION,
      page:      draft,
      changelog: ["Initial release"],
    });

    return { alreadyPublished: false, version: INITIAL_VERSION, changelog: ["Initial release"] };
  }

  // 2. Diff draft against last snapshot
  const { bump, changes } = diffPages(latest.page, draft);

  // 3. Nothing changed — idempotent, do not insert
  if (bump === "none") {
    return { alreadyPublished: true, version: latest.version, changelog: [] };
  }

  // 4. Calculate next version and persist snapshot
  const nextVersion = bumpVersion(latest.version, bump);

  await db.insert(releases).values({
    slug,
    version:   nextVersion,
    page:      draft,
    changelog: changes,
  });

  return { alreadyPublished: false, version: nextVersion, changelog: changes };
}
