import Link from "next/link";
import type { CTAProps } from "@/types/sections";

// Renders a call-to-action section with a button that links internally or externally.
// Internal URLs use Next.js Link; external URLs use a standard anchor tag.
export default function CTA({ label, url, variant = "primary" }: CTAProps): React.JSX.Element {
  const isExternal = url.startsWith("http") || url.startsWith("//");

  const className =
    variant === "primary"
      ? "inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      : "inline-block rounded-lg bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600";

  return (
    <section aria-label="Call to action" className="flex justify-center px-6 py-16">
      {/* -- CTA button -- */}
      {isExternal ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className={className}
          data-testid="cta-button"
        >
          {label}
        </a>
      ) : (
        <Link href={url} className={className} data-testid="cta-button">
          {label}
        </Link>
      )}
    </section>
  );
}
