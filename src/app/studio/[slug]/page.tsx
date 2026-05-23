"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { loadDraft } from "@/store/slices/draftPageSlice";
import { useRole } from "@/hooks/useRole";
import { PageSchema } from "@/lib/validators/page";
import { DRAFT_KEY_PREFIX } from "@/lib/constants/storage";
import StudioLayout from "@/components/studio/StudioLayout";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

// Mobile breakpoint — studio is a desktop-only tool.
const MOBILE_BREAKPOINT = 768;

// Fetches a page via the internal API route so Contentful credentials
// stay server-side and never reach the browser bundle.
async function fetchPageFromApi(slug: string): Promise<unknown> {
  const res = await fetch(`/api/pages/${slug}?preview=true`);
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    const err = new Error(body.error ?? "Failed to load page") as Error & {
      statusCode: number;
    };
    err.statusCode = res.status;
    throw err;
  }
  const body = (await res.json()) as { page: unknown };
  return body.page;
}

// Fetches the latest published release from the DB via the internal API route.
// Returns null if the page has never been published.
async function fetchLatestRelease(slug: string): Promise<unknown | null> {
  const res = await fetch(`/api/publish/${slug}`);
  if (!res.ok) return null;
  const body = (await res.json()) as { page: unknown };
  return body.page;
}

export default function StudioPage(): React.JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { role, isLoading: roleLoading } = useRole();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Redirect viewer away from studio — viewers have no edit access
  useEffect(() => {
    if (!roleLoading && role === "viewer") {
      router.replace("/");
    }
  }, [role, roleLoading, router]);

  useEffect(() => {
    // 1. Detect mobile on mount — studio is desktop-only
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      setIsMobile(true);
      setIsLoading(false);
      return;
    }

    async function initDraft() {
      // 2. Try to restore draft from localStorage
      const stored = localStorage.getItem(`${DRAFT_KEY_PREFIX}${slug}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as unknown;
          const validated = PageSchema.parse(parsed);
          dispatch(loadDraft(validated));
          setIsLoading(false);
          return;
        } catch {
          // 3. Corrupted localStorage — clear it and fall through
          localStorage.removeItem(`${DRAFT_KEY_PREFIX}${slug}`);
        }
      }

      // 4. Try to load from the latest published release in the DB
      try {
        const released = await fetchLatestRelease(slug);
        if (released) {
          const page = PageSchema.parse(released);
          dispatch(loadDraft(page));
          setIsLoading(false);
          return;
        }
      } catch {
        // No valid release — fall through to Contentful
      }

      // 5. Last resort — fetch from Contentful via internal API route
      try {
        const raw = await fetchPageFromApi(slug);
        const page = PageSchema.parse(raw);
        dispatch(loadDraft(page));
      } catch (err) {
        setLoadError(
          err instanceof Error ? err : new Error("Failed to load page")
        );
      } finally {
        setIsLoading(false);
      }
    }

    initDraft();
  }, [slug, dispatch]);

  // Mobile — studio is a desktop tool
  if (isMobile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Studio editor is best experienced on a desktop browser.
        </p>
      </div>
    );
  }

  // API fetch failed
  if (loadError) {
    return (
      <ErrorDisplay
        error={loadError as Error & { digest?: string }}
        reset={() => window.location.reload()}
      />
    );
  }

  return <StudioLayout isLoading={isLoading} />;
}
