import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { upsertUser, deleteUser } from "@/services/user.service";

// Shape of the user data Clerk sends in webhook payloads.
interface ClerkUserPayload {
  id: string;
  email_addresses: { email_address: string; primary: boolean }[];
  first_name: string | null;
  last_name: string | null;
}

// Extracts the primary email address from the Clerk payload.
function getPrimaryEmail(payload: ClerkUserPayload): string {
  const primary = payload.email_addresses.find((e) => e.primary);
  return primary?.email_address ?? payload.email_addresses[0]?.email_address ?? "";
}

// Combines first and last name into a single display name.
function getFullName(payload: ClerkUserPayload): string {
  return [payload.first_name, payload.last_name].filter(Boolean).join(" ");
}

// Receives Clerk user lifecycle events and syncs them to the database.
// Protected by svix signature verification — rejects any request not from Clerk.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // 1. Read raw body and svix signature headers
  const payload = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  // 2. Verify the request came from Clerk using the signing secret
  let event: { type: string; data: ClerkUserPayload };
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, headers) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  // 3. Handle each event type
  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    await upsertUser({
      clerkId: data.id,
      email: getPrimaryEmail(data),
      name: getFullName(data),
    });
  }

  if (type === "user.deleted") {
    await deleteUser(data.id);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
