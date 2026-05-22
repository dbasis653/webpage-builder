"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Narrows an unknown error to an ApiError-shaped object by checking structure,
// not prototype, because errors are serialized before crossing the Server/Client boundary.
function isApiError(err: unknown): err is { statusCode: number; message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof (err as Record<string, unknown>).statusCode === "number"
  );
}

// Displays a user-friendly error message with recovery actions.
// Detects 404 errors and shows a specific message vs a generic fallback.
export default function ErrorDisplay({ error, reset }: ErrorDisplayProps): React.JSX.Element {
  const is404 = isApiError(error) && error.statusCode === 404;

  return (
    <div
      role="alert"
      className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
    >
      {/* -- Error message -- */}
      <h1 className="text-3xl font-bold text-gray-900">
        {is404 ? "Page not found" : "Something went wrong"}
      </h1>
      <p className="text-gray-500 max-w-md">
        {is404
          ? "The page you requested does not exist."
          : "An unexpected error occurred. Please try again."}
      </p>

      {/* -- Actions -- */}
      <div className="flex gap-3 mt-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
