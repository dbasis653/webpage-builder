import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InlineErrorProps {
  message: string;
}

// Small destructive alert for use inside narrow panels and form editors.
// Not for canvas or route-level errors — use CanvasEmptyState or ErrorDisplay for those.
export default function InlineError({ message }: InlineErrorProps): React.JSX.Element {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
