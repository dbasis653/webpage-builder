"use client";

import Header from "@/components/layout/Header";
import StudioActions from "@/components/layout/StudioActions";
import SectionList from "@/components/studio/SectionList";
import StudioCanvas from "@/components/studio/StudioCanvas";
import PropertyPanel from "@/components/studio/PropertyPanel";
import { Separator } from "@/components/ui/separator";

interface StudioLayoutProps {
  isLoading: boolean;
}

// Three-panel editor layout: section list (left), live preview (center), property panel (right).
export default function StudioLayout({ isLoading }: StudioLayoutProps): React.JSX.Element {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* -- Top bar: shared Header + studio controls -- */}
      <Header actions={<StudioActions />} />

      {/* -- Three-panel body -- */}
      <div className="flex flex-1 overflow-hidden">
        {/* -- Left panel: section list -- */}
        <aside aria-label="Page sections" className="w-64 flex-shrink-0 overflow-hidden border-r bg-slate-300">
          <SectionList />
        </aside>

        <Separator orientation="vertical" />

        {/* -- Center panel: live preview canvas -- */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <StudioCanvas isLoading={isLoading} />
        </main>

        <Separator orientation="vertical" />

        {/* -- Right panel: property editor -- */}
        <PropertyPanel />
      </div>
    </div>
  );
}
