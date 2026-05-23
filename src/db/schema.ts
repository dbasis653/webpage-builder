import { pgTable, text, timestamp, pgEnum, uuid, jsonb, index } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["publisher", "editor", "viewer"]);

export const users = pgTable("users", {
  clerkId:   text("clerk_id").primaryKey(),
  email:     text("email").notNull(),
  name:      text("name").notNull().default(""),
  role:      roleEnum("role").notNull().default("editor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Derive Role type from the enum — single source of truth, stays in sync automatically.
export type Role = typeof roleEnum.enumValues[number]; // "publisher" | "editor" | "viewer"

// Each row is an immutable snapshot of a page at the moment of publish.
// Rows are never updated or deleted — only inserted.
export const releases = pgTable("releases", {
  id:          uuid("id").primaryKey().defaultRandom(),
  slug:        text("slug").notNull(),
  version:     text("version").notNull(),
  page:        jsonb("page").notNull(),
  changelog:   text("changelog").array().notNull().default([]),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
}, (t) => [
  index("releases_slug_idx").on(t.slug),
]);
