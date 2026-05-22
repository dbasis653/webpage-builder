"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { saveDraft } from "@/store/slices/draftPageSlice";
import { useRole } from "@/hooks/useRole";
import { hasPermission } from "@/utils/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Studio-specific right-side header block: page title, dirty indicator, Save and Publish buttons.
// Injected into Header via the actions slot — Header itself knows nothing about Redux or roles.
export default function StudioActions(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const title = useAppSelector((state) => state.draftPage.page?.title ?? "");
  const isDirty = useAppSelector((state) => state.draftPage.isDirty);
  const { role, isLoading } = useRole();

  // Only admin can publish — disabled for all others (always rendered for UI consistency)
  const canPublish = !isLoading && role !== null && hasPermission(role, "publish");

  return (
    <div className="flex items-center gap-3">
      {/* -- Page title -- */}
      {title && (
        <span className="rounded-md bg-slate-300 px-3 py-1 text-sm font-medium text-foreground">
          {title}
        </span>
      )}

      {/* -- Unsaved changes indicator -- */}
      {isDirty && (
        <Badge variant="secondary" className="text-xs">
          Unsaved changes
        </Badge>
      )}

      {/* -- Actions -- */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => dispatch(saveDraft())}
        disabled={!isDirty}
      >
        Save
      </Button>
      <Button size="sm" disabled={!canPublish}>
        Publish
      </Button>
    </div>
  );
}
