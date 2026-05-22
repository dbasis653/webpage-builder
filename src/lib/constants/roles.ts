import type { Role } from "@/db/schema";

// Actions that can be permission-checked throughout the app.
export type Action = "view" | "edit" | "save" | "publish";

// Defines which actions each role is allowed to perform.
export const PERMISSIONS: Record<Role, Action[]> = {
  admin:  ["view", "edit", "save", "publish"],
  editor: ["view", "edit", "save"],
  viewer: ["view"],
};
