import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

interface PublishState {
  status: "idle" | "loading" | "success" | "error";
  lastVersion: string | null;
  changelog: string[];
  alreadyPublished: boolean;
  error: string | null;
}

const initialState: PublishState = {
  status: "idle",
  lastVersion: null,
  changelog: [],
  alreadyPublished: false,
  error: null,
};

interface PublishResponse {
  version: string;
  changelog: string[];
  alreadyPublished: boolean;
}

// Sends the current draft to POST /api/publish/<slug>.
// Reads draft and slug directly from Redux state so the caller needs no arguments.
export const publishPage = createAsyncThunk<
  PublishResponse,
  void,
  { state: RootState; rejectValue: string }
>("publish/publishPage", async (_, { getState, rejectWithValue }) => {
  const page = getState().draftPage.page;

  if (!page) {
    return rejectWithValue("No draft loaded");
  }

  const res = await fetch(`/api/publish/${page.slug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page }),
  });

  const data = (await res.json()) as unknown;

  if (!res.ok) {
    const message = (data as Record<string, string>)?.error ?? "Publish failed";
    return rejectWithValue(message);
  }

  return data as PublishResponse;
});

const publishSlice = createSlice({
  name: "publish",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(publishPage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(publishPage.fulfilled, (state, action) => {
        state.status = "success";
        state.lastVersion = action.payload.version;
        state.changelog = action.payload.changelog;
        state.alreadyPublished = action.payload.alreadyPublished;
      })
      .addCase(publishPage.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export default publishSlice.reducer;
