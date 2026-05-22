interface UnsupportedSectionProps {
  type: string;
  reason?: string;
}

// Renders a fallback UI for unknown or invalid section types.
// Visible in development only — returns null in production.
export default function UnsupportedSection({ type, reason }: UnsupportedSectionProps): React.JSX.Element | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Unsupported section"
      className="border border-dashed border-red-400 bg-red-50 px-6 py-4 rounded-md my-4"
    >
      {/* -- Warning header -- */}
      <p className="text-sm font-semibold text-red-600">
        Unsupported section type: <code className="font-mono">{type}</code>
      </p>

      {/* -- Reason -- */}
      {reason && (
        <p className="text-sm text-red-500 mt-1">{reason}</p>
      )}
    </div>
  );
}
