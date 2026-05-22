"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateSectionProps } from "@/store/slices/draftPageSlice";
import { HeroPropsSchema } from "@/lib/validators/sections";
import type { Section } from "@/lib/validators/page";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InlineError from "@/components/ui/InlineError";

interface HeroEditorProps {
  section: Section;
  canEdit: boolean;
}

// Edits the title and subtitle of a Hero section.
// Debounces Redux dispatches by 300ms to avoid flooding on every keystroke.
export default function HeroEditor({ section, canEdit }: HeroEditorProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const parsed = HeroPropsSchema.safeParse(section.props);

  // Local state for controlled inputs — avoids jank from Redux round-trip on every keystroke
  const [title, setTitle] = useState(parsed.success ? parsed.data.title : "");
  const [subtitle, setSubtitle] = useState(parsed.success ? (parsed.data.subtitle ?? "") : "");

  // Sync local state if the section changes (e.g. a different section is selected)
  useEffect(() => {
    if (parsed.success) {
      setTitle(parsed.data.title);
      setSubtitle(parsed.data.subtitle ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.sectionId]);

  // Dispatches a prop update after a 300ms debounce.
  const dispatchDebounced = useCallback(
    (props: Record<string, unknown>) => {
      const timer = setTimeout(() => {
        dispatch(updateSectionProps({ sectionId: section.sectionId, props }));
      }, 300);
      return () => clearTimeout(timer);
    },
    [dispatch, section.sectionId]
  );

  if (!parsed.success) {
    return <InlineError message="Invalid section data — props do not match the Hero schema." />;
  }

  return (
    <div className="space-y-4 p-4">
      {/* -- Title field -- */}
      <div className="space-y-1.5">
        <Label htmlFor={`${section.sectionId}-title`}>Title</Label>
        <Input
          id={`${section.sectionId}-title`}
          value={title}
          disabled={!canEdit}
          onChange={(e) => {
            setTitle(e.target.value);
            dispatchDebounced({ title: e.target.value });
          }}
        />
      </div>

      {/* -- Subtitle field -- */}
      <div className="space-y-1.5">
        <Label htmlFor={`${section.sectionId}-subtitle`}>Subtitle</Label>
        <Input
          id={`${section.sectionId}-subtitle`}
          value={subtitle}
          disabled={!canEdit}
          onChange={(e) => {
            setSubtitle(e.target.value);
            dispatchDebounced({ subtitle: e.target.value });
          }}
        />
      </div>
    </div>
  );
}
