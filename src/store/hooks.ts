import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

// Typed dispatch hook — use this instead of useDispatch() throughout the app.
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed selector hook — use this instead of useSelector() throughout the app.
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
