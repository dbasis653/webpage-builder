"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { saveDraft } from "@/store/slices/draftPageSlice";
import { publishPage } from "@/store/slices/publishSlice";
import { useRole } from "@/hooks/useRole";
import { hasPermission } from "@/utils/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

// Studio-specific right-side header block: page title, dirty indicator, Save and Publish buttons.
// Injected into Header via the actions slot — Header itself knows nothing about Redux or roles.
export default function StudioActions(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const title = useAppSelector((state) => state.draftPage.page?.title ?? "");
  const isDirty = useAppSelector((state) => state.draftPage.isDirty);
  const { status, lastVersion, alreadyPublished } = useAppSelector((state) => state.publish);
  const slug = useAppSelector((state) => state.draftPage.page?.slug ?? "");
  const { role, isLoading } = useRole();

  // Only publisher can publish — disabled for editor (always rendered for UI consistency)
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

      {/* -- Publish status badge -- */}
      {status === "success" && (
        <Badge variant="secondary" className="text-xs">
          {alreadyPublished ? "Up to date" : `Published v${lastVersion}`}
        </Badge>
      )}
      {status === "error" && (
        <Badge variant="destructive" className="text-xs">
          Publish failed
        </Badge>
      )}

      {/* -- Actions -- */}
      {slug && (
        <a href={`/preview/${slug}`} target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline" className="gap-1.5">
            <ExternalLink className="size-3.5" />
            Preview
          </Button>
        </a>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => dispatch(saveDraft())}
        disabled={!isDirty}
      >
        Save
      </Button>
      <Button
        size="sm"
        disabled={!canPublish || status === "loading"}
        onClick={() => dispatch(publishPage())}
      >
        {status === "loading" ? "Publishing..." : "Publish"}
      </Button>
    </div>
  );
}
