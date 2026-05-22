import type { Page } from "@/lib/validators/page";
import { SECTION_REGISTRY } from "@/lib/constants/sectionRegistry";
import SectionErrorBoundary from "@/components/sections/SectionErrorBoundary";
import UnsupportedSection from "@/components/sections/UnsupportedSection";

interface PageRendererProps {
  page: Page;
}

// Renders a full page by iterating over its sections, looking each type up in
// the registry, and rendering the matched component inside an error boundary.
export default function PageRenderer({ page }: PageRendererProps): React.JSX.Element {
  return (
    <main>
      {/* -- Page sections -- */}
      {page.sections.map((section) => {
        // 1. Look up render function from registry
        const renderFn = SECTION_REGISTRY[section.type];

        // 2. Unknown section type — not in registry
        if (!renderFn) {
          return (
            <UnsupportedSection
              key={section.sectionId}
              type={section.type}
              reason="not found in registry"
            />
          );
        }

        // 3. Call render function — Zod validation happens inside
        const rendered = renderFn(section.props);

        // 4. Props failed Zod validation inside the render function
        if (!rendered) {
          return (
            <UnsupportedSection
              key={section.sectionId}
              type={section.type}
              reason="invalid props"
            />
          );
        }

        // 5. Render inside error boundary to isolate any runtime failures
        return (
          <SectionErrorBoundary key={section.sectionId}>
            {rendered}
          </SectionErrorBoundary>
        );
      })}
    </main>
  );
}
