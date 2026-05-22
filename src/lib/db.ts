import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";

// Single Drizzle client instance — never instantiate more than once.
// Uses the neon-http adapter which works in both Node.js and serverless/edge runtimes.
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
