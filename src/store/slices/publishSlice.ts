import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PublishState {
  isPublishing: boolean;
  lastPublishedVersion: string | null;
  publishError: string | null;
}

const initialState: PublishState = {
  isPublishing: false,
  lastPublishedVersion: null,
  publishError: null,
};

const publishSlice = createSlice({
  name: "publish",
  initialState,
  reducers: {
    // Toggles the publishing loading state.
    setPublishing(state, action: PayloadAction<boolean>) {
      state.isPublishing = action.payload;
      if (action.payload) {
        state.publishError = null;
      }
    },

    // Stores the version string after a successful publish.
    setLastPublishedVersion(state, action: PayloadAction<string>) {
      state.lastPublishedVersion = action.payload;
      state.isPublishing = false;
    },

    // Stores an error message if the publish fails.
    setPublishError(state, action: PayloadAction<string | null>) {
      state.publishError = action.payload;
      state.isPublishing = false;
    },
  },
});

export const { setPublishing, setLastPublishedVersion, setPublishError } =
  publishSlice.actions;

export default publishSlice.reducer;
