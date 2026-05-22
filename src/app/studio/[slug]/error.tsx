"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

interface StudioErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StudioError({ error, reset }: StudioErrorProps): React.JSX.Element {
  return <ErrorDisplay error={error} reset={reset} />;
}
