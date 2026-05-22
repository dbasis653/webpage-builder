import { Skeleton } from "@/components/ui/skeleton";

// Renders a loading skeleton that approximates the page layout.
// Used by loading.tsx in route segments while Contentful data is being fetched.
export default function PageSkeleton(): React.JSX.Element {
  return (
    <div aria-busy="true" aria-label="Loading page content" className="w-full">
      {/* -- Hero skeleton -- */}
      <Skeleton className="h-72 w-full rounded-none" />

      {/* -- Content skeletons -- */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    </div>
  );
}
