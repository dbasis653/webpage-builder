"use client";

import { useEffect, useState } from "react";
import type { Role } from "@/db/schema";

interface UseRoleResult {
  role: Role | null;
  isLoading: boolean;
}

// Fetches the current user's role from /api/me.
// Returns null while loading or if the user is not found in the database.
export function useRole(): UseRoleResult {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          setRole(null);
          return;
        }
        const data = (await res.json()) as { role: Role };
        setRole(data.role);
      } catch {
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRole();
  }, []);

  return { role, isLoading };
}
