"use client";

import { useAppSelector } from "@/store/hooks";
import { PageSchema } from "@/lib/validators/page";
import PageRenderer from "@/components/PageRenderer";
import PageSkeleton from "@/components/ui/PageSkeleton";
import CanvasEmptyState from "@/components/ui/CanvasEmptyState";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, AlertTriangle } from "lucide-react";

interface StudioCanvasProps {
  isLoading: boolean;
}

// Center live preview panel. Renders the current draft page from Redux.
// Delegates all error/empty states to CanvasEmptyState for proper centered layout.
export default function StudioCanvas({
  isLoading,
}: StudioCanvasProps): React.JSX.Element {
  const page = useAppSelector((state) => state.draftPage.page);
  const selectedSectionId = useAppSelector(
    (state) => state.ui.selectedSectionId
  );

  // 1. Still loading — show skeleton
  if (isLoading && page === null) {
    return <PageSkeleton />;
  }

  // 2. Load finished but no page — should not normally happen after successful load
  if (page === null) {
    return (
      <CanvasEmptyState
        icon={AlertCircle}
        heading="Page could not be loaded"
        message="The page data is unavailable. Try refreshing the editor."
        action={
          <Button size="sm" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        }
      />
    );
  }

  // 3. Re-validate the page from Redux state — catches corruption after edits
  const revalidated = PageSchema.safeParse(page);
  if (!revalidated.success) {
    return (
      <CanvasEmptyState
        icon={AlertTriangle}
        heading="Invalid page data"
        message="Failed to load page data — content may be invalid. Check your Contentful content model."
      />
    );
  }

  // 4. Render the live preview with selected section highlighted
  return (
    <ScrollArea className="h-full w-full">
      <div className="relative">
        {/* -- Live page preview -- */}
        <PageRenderer page={revalidated.data} />

        {/* -- Selected section highlight overlay -- */}
        {selectedSectionId && (
          <div
            data-selected-section={selectedSectionId}
            className="pointer-events-none absolute inset-0"
          />
        )}
      </div>
    </ScrollArea>
  );
}
