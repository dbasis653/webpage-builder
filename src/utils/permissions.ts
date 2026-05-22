import { PERMISSIONS, type Action } from "@/lib/constants/roles";
import type { Role } from "@/db/schema";

// Returns true if the given role is allowed to perform the given action.
// Pure function — no side effects, safe to call anywhere.
export function hasPermission(role: Role, action: Action): boolean {
  return PERMISSIONS[role].includes(action);
}
