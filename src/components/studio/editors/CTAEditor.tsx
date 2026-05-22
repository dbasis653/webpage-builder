"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateSectionProps } from "@/store/slices/draftPageSlice";
import { CTAPropsSchema } from "@/lib/validators/sections";
import type { Section } from "@/lib/validators/page";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InlineError from "@/components/ui/InlineError";

interface CTAEditorProps {
  section: Section;
  canEdit: boolean;
}

// Edits the label and URL of a CTA section.
// Debounces Redux dispatches by 300ms to avoid flooding on every keystroke.
export default function CTAEditor({ section, canEdit }: CTAEditorProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const parsed = CTAPropsSchema.safeParse(section.props);

  // Local state for controlled inputs — avoids jank from Redux round-trip on every keystroke
  const [label, setLabel] = useState(parsed.success ? parsed.data.label : "");
  const [url, setUrl] = useState(parsed.success ? parsed.data.url : "");

  // Sync local state if the section changes (e.g. a different section is selected)
  useEffect(() => {
    if (parsed.success) {
      setLabel(parsed.data.label);
      setUrl(parsed.data.url);
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
    return <InlineError message="Invalid section data — props do not match the CTA schema." />;
  }

  return (
    <div className="space-y-4 p-4">
      {/* -- Label field -- */}
      <div className="space-y-1.5">
        <Label htmlFor={`${section.sectionId}-label`}>Label</Label>
        <Input
          id={`${section.sectionId}-label`}
          value={label}
          disabled={!canEdit}
          onChange={(e) => {
            setLabel(e.target.value);
            dispatchDebounced({ label: e.target.value });
          }}
        />
      </div>

      {/* -- URL field -- */}
      <div className="space-y-1.5">
        <Label htmlFor={`${section.sectionId}-url`}>URL</Label>
        <Input
          id={`${section.sectionId}-url`}
          value={url}
          disabled={!canEdit}
          onChange={(e) => {
            setUrl(e.target.value);
            dispatchDebounced({ url: e.target.value });
          }}
        />
      </div>
    </div>
  );
}
