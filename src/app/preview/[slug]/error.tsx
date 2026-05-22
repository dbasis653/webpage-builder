"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps): React.JSX.Element {
  return <ErrorDisplay error={error} reset={reset} />;
}
