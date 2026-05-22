import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/services/user.service";
import type { Role } from "@/db/schema";

// Returns the current user's role from the database.
// Used by the useRole() client hook — keeps DB access server-side.
export async function GET(): Promise<NextResponse> {
  // 1. Get the Clerk user ID from the session
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // 2. Fetch role from the database
  const role = await getUserRole(userId);

  if (!role) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ role } satisfies { role: Role }, { status: 200 });
}
