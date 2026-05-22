import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

config({ path: ".env.local" });

// WebSocket is required for @neondatabase/serverless when running drizzle-kit CLI commands.
neonConfig.webSocketConstructor = ws;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
