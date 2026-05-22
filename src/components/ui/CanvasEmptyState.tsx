import type { LucideIcon } from "lucide-react";

interface CanvasEmptyStateProps {
  icon: LucideIcon;
  heading: string;
  message: string;
  action?: React.ReactNode;
}

// Centered empty-state for the canvas panel.
// The canvas is flex-1 so errors need to be centered vertically and horizontally,
// not rendered as a small inline chip.
export default function CanvasEmptyState({
  icon: Icon,
  heading,
  message,
  action,
}: CanvasEmptyStateProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      {/* -- Icon -- */}
      <Icon className="size-10 text-muted-foreground" aria-hidden="true" />

      {/* -- Text -- */}
      <div className="space-y-1">
        <p className="text-base font-semibold">{heading}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      {/* -- Optional action (e.g. Refresh button) -- */}
      {action && <div>{action}</div>}
    </div>
  );
}
