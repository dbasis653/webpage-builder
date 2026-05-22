import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  selectedSectionId: string | null;
  isPropertyPanelOpen: boolean;
}

const initialState: UiState = {
  selectedSectionId: null,
  isPropertyPanelOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Selects a section and opens the property panel.
    // Passing null deselects and closes the panel.
    selectSection(state, action: PayloadAction<string | null>) {
      state.selectedSectionId = action.payload;
      state.isPropertyPanelOpen = action.payload !== null;
    },

    // Closes the property panel and clears the selected section.
    closePropertyPanel(state) {
      state.selectedSectionId = null;
      state.isPropertyPanelOpen = false;
    },
  },
});

export const { selectSection, closePropertyPanel } = uiSlice.actions;

export default uiSlice.reducer;
