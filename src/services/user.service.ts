import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import type { Role } from "@/db/schema";

interface UpsertUserParams {
  clerkId: string;
  email: string;
  name: string;
}

// Inserts a new user or updates their email and name if they already exist.
// Called by the Clerk webhook on user.created and user.updated events.
// Role is never overwritten here — it can only be changed manually in the DB.
export async function upsertUser({ clerkId, email, name }: UpsertUserParams): Promise<void> {
  await db
    .insert(users)
    .values({ clerkId, email, name })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email,
        name,
        updatedAt: new Date(),
      },
    });
}

// Fetches a single user row by their Clerk ID.
// Returns null if the user does not exist in the database yet.
export async function getUserByClerkId(
  clerkId: string
): Promise<typeof users.$inferSelect | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return result[0] ?? null;
}

// Returns the role for a given Clerk ID, or null if the user is not found.
// Lightweight alternative to getUserByClerkId when only the role is needed.
export async function getUserRole(clerkId: string): Promise<Role | null> {
  const result = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return result[0]?.role ?? null;
}

// Removes a user from the database.
// Called by the Clerk webhook on user.deleted events.
export async function deleteUser(clerkId: string): Promise<void> {
  await db.delete(users).where(eq(users.clerkId, clerkId));
}
