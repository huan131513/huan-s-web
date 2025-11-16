/**
 * Database Migration Script
 * Run with: npx tsx scripts/migrate.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local FIRST
const envPath = resolve(process.cwd(), ".env.local");
console.log("Loading environment from:", envPath);
const result = config({ path: envPath });

if (result.error) {
  console.error("❌ Error loading .env.local:", result.error);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  console.log("Please make sure .env.local exists and contains DATABASE_URL");
  process.exit(1);
}

console.log("✅ Environment variables loaded");

// Import after loading env vars
import { runMigration } from "../lib/db/migrate";

async function main() {
  console.log("\nRunning database migration...");
  try {
    await runMigration();
    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
