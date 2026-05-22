import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Page, Section } from "@/lib/validators/page";
import { DRAFT_KEY_PREFIX } from "@/lib/constants/storage";

interface DraftPageState {
  page: Page | null;
  isDirty: boolean;
  lastSaved: string | null;
}

const initialState: DraftPageState = {
  page: null,
  isDirty: false,
  lastSaved: null,
};

const draftPageSlice = createSlice({
  name: "draftPage",
  initialState,
  reducers: {
    // Loads a page into the editor. Clears dirty flag since data is fresh.
    loadDraft(state, action: PayloadAction<Page>) {
      state.page = action.payload;
      state.isDirty = false;
      state.lastSaved = null;
    },

    // Appends a new section to the end of the page.
    addSection(state, action: PayloadAction<Section>) {
      if (!state.page) return;
      state.page.sections.push(action.payload);
      state.isDirty = true;
    },

    // Removes a section by its sectionId.
    removeSection(state, action: PayloadAction<string>) {
      if (!state.page) return;
      state.page.sections = state.page.sections.filter(
        (s) => s.sectionId !== action.payload
      );
      state.isDirty = true;
    },

    // Moves a section from one index to another (used for drag-and-drop reordering).
    reorderSections(
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) {
      if (!state.page) return;
      const { fromIndex, toIndex } = action.payload;
      const [removed] = state.page.sections.splice(fromIndex, 1);
      state.page.sections.splice(toIndex, 0, removed);
      state.isDirty = true;
    },

    // Merges new props into an existing section identified by sectionId.
    updateSectionProps(
      state,
      action: PayloadAction<{ sectionId: string; props: Record<string, unknown> }>
    ) {
      if (!state.page) return;
      const section = state.page.sections.find(
        (s) => s.sectionId === action.payload.sectionId
      );
      if (section) {
        section.props = { ...section.props, ...action.payload.props };
        state.isDirty = true;
      }
    },

    // Marks the draft as saved and persists it to localStorage.
    saveDraft(state) {
      if (!state.page) return;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
      localStorage.setItem(
        `${DRAFT_KEY_PREFIX}${state.page.slug}`,
        JSON.stringify(state.page)
      );
    },
  },
});

export const {
  loadDraft,
  addSection,
  removeSection,
  reorderSections,
  updateSectionProps,
  saveDraft,
} = draftPageSlice.actions;

export default draftPageSlice.reducer;
