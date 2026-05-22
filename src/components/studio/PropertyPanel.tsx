"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closePropertyPanel } from "@/store/slices/uiSlice";
import type { Section } from "@/lib/validators/page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import HeroEditor from "@/components/studio/editors/HeroEditor";
import CTAEditor from "@/components/studio/editors/CTAEditor";

interface PropertyPanelProps {
  canEdit: boolean;
}

// Routes to the correct section editor by type.
function renderEditor(section: Section, canEdit: boolean): React.JSX.Element {
  switch (section.type) {
    case "hero":
      return <HeroEditor section={section} canEdit={canEdit} />;
    case "cta":
      return <CTAEditor section={section} canEdit={canEdit} />;
    default:
      return (
        <p className="p-4 text-sm text-muted-foreground">
          No editor available for this section type yet.
        </p>
      );
  }
}

// Right panel showing the editor for the currently selected section.
// Inputs are disabled when canEdit is false (viewer role).
export default function PropertyPanel({ canEdit }: PropertyPanelProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const selectedSectionId = useAppSelector(
    (state) => state.ui.selectedSectionId,
  );
  const isOpen = useAppSelector((state) => state.ui.isPropertyPanelOpen);
  const sections =
    useAppSelector((state) => state.draftPage.page?.sections) ?? [];

  const selectedSection =
    sections.find((s) => s.sectionId === selectedSectionId) ?? null;

  const panelContent = (
    <div className="flex h-full flex-col">
      {/* -- Panel header -- */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold">
          {selectedSection ? `Edit: ${selectedSection.type}` : "Properties"}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={() => dispatch(closePropertyPanel())}
          aria-label="Close property panel"
        >
          <X className="size-4" />
        </Button>
      </div>
      <Separator />

      {/* -- View-only notice for viewer role -- */}
      {!canEdit && (
        <p className="px-4 py-2 text-xs text-muted-foreground">
          You have view-only access.
        </p>
      )}

      {/* -- Editor content -- */}
      <ScrollArea className="flex-1">
        {!selectedSection ? (
          <p className="p-4 text-sm text-muted-foreground">
            Select a section to edit its properties.
          </p>
        ) : (
          renderEditor(selectedSection, canEdit)
        )}
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* -- Desktop: fixed right panel -- */}
      <aside className="hidden md:flex h-full w-80 flex-col border-l bg-stone-300">
        {panelContent}
      </aside>

      {/* -- Mobile: sliding Sheet -- */}
      <Sheet
        open={isOpen}
        onOpenChange={(open) => !open && dispatch(closePropertyPanel())}
      >
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Section properties</SheetTitle>
          </SheetHeader>
          {panelContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
