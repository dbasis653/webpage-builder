import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "editor", "viewer"]);

export const users = pgTable("users", {
  clerkId:   text("clerk_id").primaryKey(),
  email:     text("email").notNull(),
  name:      text("name").notNull().default(""),
  role:      roleEnum("role").notNull().default("editor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Derive Role type from the enum — single source of truth, stays in sync automatically.
export type Role = typeof roleEnum.enumValues[number]; // "admin" | "editor" | "viewer"
