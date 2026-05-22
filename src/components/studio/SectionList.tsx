"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  addSection,
  removeSection,
  reorderSections,
} from "@/store/slices/draftPageSlice";
import { selectSection } from "@/store/slices/uiSlice";
import { SECTION_DEFAULTS } from "@/lib/constants/studioDefaults";
import type { Section } from "@/lib/validators/page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

// Section type labels shown in the "+ Add Section" dropdown.
const SECTION_TYPE_LABELS: Record<Section["type"], string> = {
  hero: "Hero",
  featureGrid: "Feature Grid",
  testimonial: "Testimonial",
  cta: "CTA",
};

// Left panel of the studio. Lists all sections with reorder, remove, and select actions.
// "+ Add Section" dropdown appends a new section with default props.
export default function SectionList(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const sections =
    useAppSelector((state) => state.draftPage.page?.sections) ?? [];
  const selectedSectionId = useAppSelector(
    (state) => state.ui.selectedSectionId,
  );

  // Appends a new section of the chosen type with default props.
  function handleAddSection(type: Section["type"]) {
    const newSection: Section = {
      sectionId: crypto.randomUUID(),
      type,
      props: SECTION_DEFAULTS[type],
    };
    dispatch(addSection(newSection));
  }

  return (
    <div className="flex h-full flex-col">
      {/* -- Section list -- */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {sections.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No sections yet. Add one below.
            </p>
          )}

          {sections.map((section, index) => (
            <div
              key={section.sectionId}
              onClick={() => dispatch(selectSection(section.sectionId))}
              className={`flex cursor-pointer items-center justify-between rounded-md bg-white px-3 py-2 transition-colors hover:bg-gray-400 ${
                selectedSectionId === section.sectionId
                  ? "bg-gray-400 ring-1 ring-ring"
                  : ""
              }`}
            >
              {/* -- Section type badge -- */}
              <Badge variant="secondary" className="capitalize text-xs">
                {SECTION_TYPE_LABELS[section.type]}
              </Badge>

              {/* -- Actions -- */}
              <div
                className="flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      disabled={index === 0}
                      onClick={() =>
                        dispatch(
                          reorderSections({
                            fromIndex: index,
                            toIndex: index - 1,
                          }),
                        )
                      }
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move up</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      disabled={index === sections.length - 1}
                      onClick={() =>
                        dispatch(
                          reorderSections({
                            fromIndex: index,
                            toIndex: index + 1,
                          }),
                        )
                      }
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move down</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6 text-destructive hover:text-destructive"
                      onClick={() => dispatch(removeSection(section.sectionId))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove section</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* -- Add section button -- */}
      <div className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <Plus className="size-4" />
              Add Section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {(Object.keys(SECTION_DEFAULTS) as Section["type"][]).map(
              (type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleAddSection(type)}
                >
                  {SECTION_TYPE_LABELS[type]}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
